const crypto=require('node:crypto');
const {json,readJson,allowMethods}=require('./_lib/http');
const {actorFromRequest,staff}=require('./_lib/identity.cjs');
const {transaction}=require('./_lib/database.cjs');
const {problem,originCheck,uuid,choice,text,rateLimit}=require('./_lib/security.cjs');
const TYPES={'application/pdf':b=>b.subarray(0,5).toString()==='%PDF-','image/png':b=>b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'image/jpeg':b=>b[0]===255&&b[1]===216&&b[2]===255};
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['GET','POST']))return;
 try{
  const actor=await actorFromRequest(req);
  if(req.method==='GET'){
   const id=uuid(new URL(req.url,'https://localhost').searchParams.get('id'));
   const file=await transaction(actor,async db=>{const r=await db.query('SELECT * FROM case_files WHERE id=$1',[id]);if(!r.rows[0])throw problem(404,'Arquivo não encontrado.');await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'download','case_files',$2)",[actor.id,id]);return r.rows[0];});
   const {get}=await import('@vercel/blob');const result=await get(file.storage_key,{access:'private',useCache:false});
   if(!result||result.statusCode!==200)throw problem(404,'Arquivo indisponível.');
   res.setHeader('Content-Type',file.mime_type);res.setHeader('Content-Disposition',`attachment; filename="${file.original_name.replace(/[^a-zA-Z0-9._ -]/g,'_')}"`);res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');
   const {Readable}=require('node:stream');Readable.fromWeb(result.stream).pipe(res);return;
  }
  originCheck(req);staff(actor,true);const body=await readJson(req,2800000),caseId=uuid(body.caseId),visibility=choice(body.visibility,['client','internal']);
  const organization=body.organization?choice(body.organization,['SPC','SERASA','BOA_VISTA','PROTESTOS']):null;
  const type=choice(body.mimeType,Object.keys(TYPES)),name=text(body.name,1,120,'nome do arquivo').replace(/[\r\n"/\\]/g,'_'),bytes=Buffer.from(String(body.base64||''),'base64');
  if(!bytes.length||bytes.length>2*1024*1024)throw problem(400,'Envie um PDF, PNG ou JPEG de até 2 MB.');
  if(!TYPES[type](bytes))throw problem(400,'O conteúdo não corresponde ao tipo do arquivo.');
  const result=await transaction(actor,async db=>{
   await rateLimit(db,req,'upload:'+actor.id,10);if(!(await db.query('SELECT id FROM cases WHERE id=$1',[caseId])).rows.length)throw problem(404,'Atendimento não encontrado.');
   const id=crypto.randomUUID(),path=`sauvid/${caseId}/${id}`;const {put,del}=await import('@vercel/blob');const blob=await put(path,bytes,{access:'private',addRandomSuffix:false,contentType:type});
   try{await db.query('INSERT INTO case_files(id,case_id,visibility,storage_key,original_name,mime_type,byte_size,sha256,uploaded_by,organization) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,caseId,visibility,blob.pathname,name,type,bytes.length,crypto.createHash('sha256').update(bytes).digest('hex'),actor.id,organization]);}catch(e){await del(blob.url).catch(()=>{});throw e;}
   return {id};
  });json(res,201,{ok:true,...result});
 }catch(e){json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Não foi possível acessar o documento.'});}
};
