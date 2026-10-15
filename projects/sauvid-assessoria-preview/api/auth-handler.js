const {json,readJson}=require('./_lib/http');
const {getAuth}=require('./_lib/identity.cjs');
const {originCheck}=require('./_lib/security.cjs');
const {getPool}=require('./_lib/database.cjs');
const {lookup}=require('./_lib/security.cjs');
const {validDocument}=require('./_lib/registrations.cjs');
module.exports=async(req,res)=>{
 try{
  const path=new URL(req.url,'https://localhost').searchParams.get('path')||req.url.split('/api/auth/')[1]?.split('?')[0]||'';
  const allowed=['sign-in/email','sign-out','get-session','request-password-reset','reset-password'];
  if(!allowed.includes(path))return json(res,404,{ok:false,error:'Rota não disponível.'});
  if(path==='request-password-reset'&&(!process.env.RESEND_API_KEY||!process.env.SAUVID_EMAIL_FROM))return json(res,503,{ok:false,error:'A recuperação de acesso é assistida pela equipe SAUVID. Solicite um link individual após a confirmação da sua identidade.'});
  if(req.method!=='GET')originCheck(req);
  if(path==='sign-in/email'&&req.method==='POST'){
   const body=await readJson(req,4096),{fromNodeHeaders}=await import('better-auth/node');
   const response=await (await getAuth()).handler(new Request((process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app')+'/api/auth/sign-in/email',{method:'POST',headers:fromNodeHeaders(req.headers),body:JSON.stringify({email:body.email,password:body.password,rememberMe:body.rememberMe===true})}));
   if(response.ok){
    const signed=await response.clone().json(),actor=(await getPool().query('SELECT id,role,active FROM app_users WHERE auth_subject=$1',[signed.user.id])).rows[0];
    const document=String(body.document||'').replace(/\D/g,'');
    let allowed=!!actor?.active;
    if(allowed&&actor.role==='client')allowed=validDocument(document)&&(await getPool().query('SELECT ca.user_id FROM client_access ca JOIN clients c ON c.id=ca.client_id WHERE ca.user_id=$1 AND c.active AND c.cpf_lookup_hash=$2',[actor.id,lookup(document)])).rows.length>0;
    if(!allowed){await getPool().query('DELETE FROM session WHERE token=$1 AND "userId"=$2',[signed.token,signed.user.id]);return json(res,401,{ok:false,error:'Confira o e-mail, a senha e o CPF/CNPJ do cadastro de cliente.'});}
   }
   res.statusCode=response.status;response.headers.forEach((value,key)=>{if(key.toLowerCase()!=='set-cookie')res.setHeader(key,value);});const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);res.setHeader('Cache-Control','no-store');res.end(await response.text());return;
  }
  req.url='/api/auth/'+path;
  const {toNodeHandler}=await import('better-auth/node');
  await toNodeHandler(await getAuth())(req,res);
 }catch(e){json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Acesso temporariamente indisponível.'});}
};
