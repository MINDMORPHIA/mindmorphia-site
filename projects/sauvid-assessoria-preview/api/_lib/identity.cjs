const {getPool}=require('./database.cjs');
const {problem}=require('./security.cjs');
let instance;
async function getAuth(){
 if(!process.env.BETTER_AUTH_SECRET||process.env.BETTER_AUTH_SECRET.length<32)throw problem(503,'O acesso está em ativação.');
 if(!instance)instance=import('better-auth').then(({betterAuth})=>betterAuth({
  appName:'SAUVID Assessoria',baseURL:process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app',basePath:'/api/auth',secret:process.env.BETTER_AUTH_SECRET,database:getPool(),
  trustedOrigins:[process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app','https://www.sauvid.ass.com.br',...(process.env.NODE_ENV==='production'?[]:['http://localhost:4173'])],
  emailAndPassword:{enabled:true,minPasswordLength:12,autoSignIn:false,sendResetPassword:async({user,token})=>{
   const url=(process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app')+'/gestao.html#recuperar='+token;
   if(!process.env.RESEND_API_KEY||!process.env.SAUVID_EMAIL_FROM)throw problem(503,'Recuperação por e-mail em ativação. Solicite apoio à equipe.');
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.SAUVID_EMAIL_FROM,to:[user.email],subject:'Recuperar acesso SAUVID',text:`Use este link para definir uma nova senha: ${url}\nSe você não solicitou, ignore esta mensagem.`})});
   if(!r.ok)throw problem(503,'O envio de recuperação está indisponível.');
  },revokeSessionsOnPasswordReset:true},
  session:{expiresIn:60*60*8,updateAge:60*30,cookieCache:{enabled:false}},
  rateLimit:{enabled:true,storage:'database',window:60,max:10},
  advanced:{useSecureCookies:process.env.NODE_ENV==='production',cookiePrefix:'sauvid',defaultCookieAttributes:{httpOnly:true,sameSite:'lax'}},
  logger:{disabled:true}
 }));
 return instance;
}
async function actorFromRequest(req){
 const {fromNodeHeaders}=await import('better-auth/node');
 const session=await (await getAuth()).api.getSession({headers:fromNodeHeaders(req.headers)});
 if(!session)throw problem(401,'Entre na sua conta para continuar.');
 const {rows}=await getPool().query('SELECT id,role,active,email FROM app_users WHERE auth_subject=$1',[session.user.id]);
 if(!rows[0]?.active)throw problem(403,'Sua conta ainda não possui um vínculo ativo. Solicite apoio à equipe SAUVID.');
 return {...rows[0],authSubject:session.user.id,name:session.user.name};
}
function staff(actor,write=false){if(!['operator','admin',...(write?[]:['auditor'])].includes(actor.role))throw problem(403,'Acesso restrito à gestão SAUVID.');}
module.exports={getAuth,actorFromRequest,staff};
