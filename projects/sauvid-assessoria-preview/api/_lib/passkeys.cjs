const {getPool}=require('./database.cjs');
const {problem}=require('./security.cjs');
const origin=()=>process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app';
async function requireAdmin(subject){
 const actor=(await getPool().query("SELECT id,role,active FROM app_users WHERE auth_subject=$1",[subject])).rows[0];
 if(!actor?.active||actor.role!=='admin')throw problem(403,'O acesso por digital está disponível para sua conta de administrador ativa.');
 return actor;
}
function requireVerification(info){if(info?.userVerified!==true)throw problem(401,'Confirme a digital ou o PIN do aparelho para continuar.');}
function requireFresh(session){if(!session?.session?.createdAt||Date.now()-new Date(session.session.createdAt).getTime()>=600000)throw problem(401,'Por segurança, saia e entre novamente com sua senha antes de cadastrar ou remover uma chave de acesso.');}
function pluginOptions(){return {
 rpID:new URL(origin()).hostname,rpName:'SAUVID Assessoria',origin:origin(),
 authenticatorSelection:{residentKey:'required',userVerification:'required',authenticatorAttachment:'platform'},
 registration:{requireSession:true,afterVerification:async({verification,user})=>{requireVerification(verification.registrationInfo);await requireAdmin(user.id);}},
 authentication:{afterVerification:async({verification,clientData})=>{
  requireVerification(verification.authenticationInfo);
  const credential=(await getPool().query('SELECT "userId" FROM passkey WHERE "credentialID"=$1',[clientData.id])).rows[0];
  await requireAdmin(credential?.userId);
 }}
};}
module.exports={pluginOptions,requireAdmin,requireFresh,requireVerification};
