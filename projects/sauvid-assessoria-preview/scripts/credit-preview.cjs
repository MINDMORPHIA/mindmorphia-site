// Provisiona somente duas identidades fictícias no PostgreSQL local de demonstração.
const crypto=require('node:crypto');
const fs=require('node:fs/promises');
const {getPool}=require('../api/_lib/database.cjs');
const {getAuth}=require('../api/_lib/identity.cjs');
async function main(){
 const dbUrl=new URL(process.env.DATABASE_URL),origin=process.env.SAUVID_APP_ORIGIN;
 if(dbUrl.hostname!=='127.0.0.1'||dbUrl.pathname!=='/sauvid_credit_preview'||process.env.NODE_ENV!=='development'||process.env.VERCEL||!/^http:\/\/localhost:\d+$/.test(origin))throw Error('Use a base local dedicada à prévia.');
 const db=getPool(),auth=await getAuth(),access={origin};
 for(const role of ['admin','client']){
  const email='preview-'+role+'@example.invalid',password=crypto.randomBytes(22).toString('base64url');
  const account=await auth.api.signUpEmail({body:{name:role==='admin'?'Gestão fictícia':'Cliente fictício',email,password}});
  await db.query('INSERT INTO app_users(auth_subject,email,role) VALUES($1,$2,$3)',[account.user.id,email,role]);
  access[role]={email,password,...(role==='client'?{document:'52998224725'}:{})};
 }
 await fs.writeFile(process.env.SAUVID_QA_ACCESS,JSON.stringify(access,null,2),{flag:'wx'});
}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1;}).finally(()=>getPool().end());
