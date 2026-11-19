const fs=require('node:fs/promises');
const {ensureCreditSchema}=require('./schema.cjs');
async function main(){
 if(process.env.VERCEL_ENV==='production')await ensureCreditSchema();
 await fs.mkdir('public',{recursive:true});
 const files=['index.html','gestao.html','appearance.css','appearance.js','gestao.css','gestao.js','credito.js','passkeys.js','pendencias.js','comunicacoes.js','motion.css','motion.js','robots.txt','assets','vendor'];
 for(const file of files)await fs.cp(file,'public/'+file,{recursive:true});
 console.log('SAUVID: arquivos públicos preparados.');
}
main().catch(e=>{console.error('SAUVID: publicação interrompida.',e.releaseStep||e.code||e.name);process.exitCode=1;});
