const {getPool}=require('./database.cjs');
const {problem}=require('./security.cjs');
const origin=()=>process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app';
async function requireEligibleAccount(subject){
 const actor=(await getPool().query("SELECT id,role,active,EXISTS(SELECT 1 FROM client_access a JOIN clients c ON c.id=a.client_id WHERE a.user_id=u.id AND c.active) AS linked FROM app_users u WHERE auth_subject=$1",[subject])).rows[0];
 if(!actor?.active||!(actor.role==='admin'||(actor.role==='client'&&actor.linked)))throw problem(403,'Confira se a sua conta possui acesso ativo.');
 return actor;
}
function requireVerification(info){if(info?.userVerified!==true)throw problem(401,'Confirme a digital ou o PIN do aparelho para continuar.');}
function requireFresh(session){if(!session?.session?.createdAt||Date.now()-new Date(session.session.createdAt).getTime()>=600000)throw problem(401,'Por segurança, saia e entre novamente com sua senha antes de cadastrar ou remover uma chave de acesso.');}
function pluginOptions(){return {
 rpID:new URL(origin()).hostname,rpName:'SAUVID Assessoria',origin:origin(),
 authenticatorSelection:{residentKey:'required',userVerification:'required'},
 registration:{requireSession:true,afterVerification:async({verification,user})=>{requireVerification(verification.registrationInfo);await requireEligibleAccount(user.id);}},
 authentication:{afterVerification:async({verification,clientData})=>{
  requireVerification(verification.authenticationInfo);
  const credential=(await getPool().query('SELECT "userId" FROM passkey WHERE "credentialID"=$1',[clientData.id])).rows[0];
  await requireEligibleAccount(credential?.userId);
 }}
};}
module.exports={pluginOptions,requireEligibleAccount,requireFresh,requireVerification};
