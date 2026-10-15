// Dados reais somente em arquivo local ignorado. Não imprimir payloads ou documentos.
const fs=require('node:fs');
const {assess,importRecords}=require('../api/_lib/registrations.cjs');
const {getPool,transaction}=require('../api/_lib/database.cjs');
function loadSource(file){
 const raw=JSON.parse(fs.readFileSync(file,'utf8'));
 const records=[];for(const page of raw.pages)for(const table of page.tables)for(const row of table){if(!row[0]||/NOME\s*\//i.test(row[0]))continue;records.push({row:records.length+1,page:page.page,name:row[0].trim(),document:String(row[1]||'').trim(),email:null,whatsapp:null});}
 return {sha256:raw.sha256,name:'Lista de reabilitação de crédito 2026 fornecida pelo responsável',records};
}
(async()=>{
 const file=process.argv[2];if(!file||!file.replaceAll('\\','/').includes('.local-data/'))throw new Error('A origem deve ficar na pasta privada ignorada.');
 const source=loadSource(file),reasons={};let possibleCases=0;
 for(const record of source.records){const flags=assess(record);for(const reason of flags)reasons[reason]=(reasons[reason]||0)+1;if(!flags.some(f=>f.startsWith('document_')||f==='name_incomplete'))possibleCases++;}
 const summary={sourceRows:source.records.length,possibleCases,reasons};
 if(process.argv.includes('--apply')){
  const email=String(process.env.SAUVID_ADMIN_EMAIL||'').toLowerCase();if(!email)throw new Error('Responsável da importação não configurado.');
  const actor=(await getPool().query("SELECT id,role,active FROM app_users WHERE lower(email)=$1 AND role='admin' AND active",[email])).rows[0];if(!actor)throw new Error('Administrador ativo não encontrado.');
  summary.import=await transaction(actor,db=>importRecords(db,actor,source));
 }
 console.log(JSON.stringify(summary));if(process.argv.includes('--apply'))await getPool().end();
})().catch(e=>{console.error('Importação não concluída. Código:',e.statusCode||e.code||e.name);process.exitCode=1;});
