const fs=require('node:fs/promises');
const os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const {Pool}=require('pg');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const migration='005_credit';
function native(command,args,options={}){
 const r=spawnSync(command,args,{encoding:'utf8',timeout:120000,...options});
 if(r.status!==0)throw Object.assign(new Error(),{releaseStep:'falha em '+command+' ('+(r.error?.code||r.status)+')'});
 return r.stdout;
}
function postgresTools(major){
 const cmd='pg_dump';
 const r=spawnSync(cmd,['--version'],{encoding:'utf8'});
 if(Number(r.stdout?.match(/(\d+)\./)?.[1])>=major)return;
 // Os clientes vêm do repositório da distribuição da imagem de build da Vercel.
 for(const n of [...new Set([major,18,17,16])].filter(n=>n>=major)){
  const attempt=spawnSync('dnf',['-y','install','postgresql'+n],{timeout:120000,encoding:'utf8'});
  if(attempt.status===0&&Number(native(cmd,['--version']).match(/(\d+)\./)?.[1])>=major)return;
 }
 throw Object.assign(new Error(),{releaseStep:'cliente pg_dump compatível indisponível para PostgreSQL '+major});
}
async function readBlob(blob,key){
 const r=await blob.get(key,{access:'private',useCache:false});
 if(r?.statusCode!==200)throw Error('Arquivo privado indisponível');
 return Buffer.from(await new Response(r.stream).arrayBuffer());
}
async function backup(conn,connection){
 const blob=await import('@vercel/blob');
 const key=Buffer.from(process.env.SAUVID_DATA_KEY||'','base64');
 if(key.length!==32)throw Error('Chave de proteção inválida');
 const prefix='backups/pre-005/'+crypto.randomUUID();
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sauvid-'));
 async function store(name,plain){
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted=Buffer.concat([cipher.update(plain),cipher.final()]);
  const packed=Buffer.concat([Buffer.from('SVB1'),iv,cipher.getAuthTag(),encrypted]);
  const dest=prefix+'/'+name+'.enc';
  await blob.put(dest,packed,{access:'private',addRandomSuffix:false,contentType:'application/octet-stream'});
  const read=await readBlob(blob,dest);
  if(digest(read)!==digest(packed))throw Error('Falha de integridade');
  return {path:dest,sha256:digest(plain)};
 }
 try{
  const {rows:[v]}=await conn.query("SELECT current_setting('server_version_num')::int AS version");
  postgresTools(Math.floor(v.version/10000));
  await conn.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const {rows:[snap]}=await conn.query('SELECT pg_export_snapshot() AS id');
  const {rows:files}=await conn.query('SELECT storage_key,sha256,byte_size FROM case_files');
  const target=path.join(dir,'database.dump');
  const env={...process.env,PGHOST:connection.hostname,PGPORT:connection.port||'5432',PGUSER:decodeURIComponent(connection.username),PGPASSWORD:decodeURIComponent(connection.password),PGDATABASE:decodeURIComponent(connection.pathname.slice(1)),PGSSLMODE:'verify-full',PGSSLROOTCERT:'system'};
  native('pg_dump',['--format=custom','--schema=public','--no-password','--snapshot='+snap.id,'--file='+target],{env});
  await conn.query('COMMIT');
  native('pg_restore',['--file=/dev/null',target]);
  const database=await store('database',await fs.readFile(target));
  const documents=[];
  for(const f of files){
   const data=await readBlob(blob,f.storage_key);
   if(data.length!==Number(f.byte_size)||digest(data)!==f.sha256)throw Error('Anexo divergente');
   documents.push({source:f.storage_key,...await store('documents/'+documents.length,data)});
  }
  await store('manifest',Buffer.from(JSON.stringify({version:1,createdAt:new Date().toISOString(),database,documents})));
  console.log('SAUVID: backup privado recuperado e conferido, anexos:',documents.length);
  return prefix;
 }finally{await conn.query('ROLLBACK').catch(()=>{});await fs.rm(dir,{recursive:true,force:true});}
}
async function ensureCreditSchema(){
 if(process.env.SAUVID_APP_ORIGIN!=='https://sauvid-assessoria.vercel.app')throw Error('Origem inesperada');
 const connection=new URL(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL);
 connection.searchParams.set('sslmode','verify-full');
 const pool=new Pool({connectionString:connection.toString(),max:1,connectionTimeoutMillis:15000});
 const conn=await pool.connect();
 try{
  await conn.query("SELECT pg_advisory_lock(hashtext('sauvid-release-schema'))");
  const sql=await fs.readFile('db/005_credit.sql','utf8');
  const exists=(await conn.query("SELECT to_regclass('public.sauvid_release_history') AS marker")).rows[0].marker;
  if(exists){
   const record=(await conn.query('SELECT sha256 FROM sauvid_release_history WHERE version=$1',[migration])).rows[0];
   if(record?.sha256===digest(sql))return;
   if(record)throw Error('Migração divergente');
  }
  // Valida os contratos da base instalada antes de gerar a cópia e antes de alterar tabelas.
  await conn.query('SELECT c.id,o.status_code,f.sha256 FROM cases c JOIN case_organizations o ON o.case_id=c.id JOIN case_files f ON f.case_id=c.id LIMIT 0');
  const prefix=await backup(conn,connection);
  await conn.query('BEGIN');
  await conn.query("SET LOCAL lock_timeout='5s'");
  await conn.query(sql);
  await conn.query('CREATE TABLE IF NOT EXISTS sauvid_release_history(version text PRIMARY KEY,sha256 text NOT NULL,backup_path text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
  await conn.query('INSERT INTO sauvid_release_history(version,sha256,backup_path) VALUES($1,$2,$3)',[migration,digest(sql),prefix]);
  await conn.query('COMMIT');
  console.log('SAUVID: migração 005 aplicada em transação.');
 }finally{await conn.query('ROLLBACK').catch(()=>{});conn.release(true);await pool.end();}
}
module.exports={ensureCreditSchema};
