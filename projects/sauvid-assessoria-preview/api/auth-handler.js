const {json}=require('./_lib/http');
const {getAuth}=require('./_lib/identity.cjs');
const {originCheck}=require('./_lib/security.cjs');
module.exports=async(req,res)=>{
 try{
  const path=new URL(req.url,'https://localhost').searchParams.get('path')||req.url.split('/api/auth/')[1]?.split('?')[0]||'';
  const allowed=['sign-in/email','sign-out','get-session','request-password-reset','reset-password'];
  if(!allowed.includes(path))return json(res,404,{ok:false,error:'Rota não disponível.'});
  if(path==='request-password-reset'&&(!process.env.RESEND_API_KEY||!process.env.SAUVID_EMAIL_FROM))return json(res,503,{ok:false,error:'A recuperação de acesso é assistida pela equipe SAUVID. Solicite um link individual após a confirmação da sua identidade.'});
  if(req.method!=='GET')originCheck(req);
  req.url='/api/auth/'+path;
  const {toNodeHandler}=await import('better-auth/node');
  await toNodeHandler(await getAuth())(req,res);
 }catch(e){json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Acesso temporariamente indisponível.'});}
};
