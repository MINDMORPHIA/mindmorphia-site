const {json,readJson,allowMethods}=require('./_lib/http');
const {getAuth,actorFromRequest}=require('./_lib/identity.cjs');
const {getPool,transaction}=require('./_lib/database.cjs');
const {originCheck,problem,rateLimit,text}=require('./_lib/security.cjs');
const {requireFresh}=require('./_lib/passkeys.cjs');
const routes={list:['list-user-passkeys','GET'], 'register-options':['generate-register-options','GET'],register:['verify-registration','POST'],'authenticate-options':['generate-authenticate-options','GET'],authenticate:['verify-authentication','POST'],revoke:['delete-passkey','POST']};
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['POST']))return;
 try{
  originCheck(req);const b=await readJson(req,32768),route=Object.hasOwn(routes,b.action)&&routes[b.action];if(!route)throw problem(400,'Operação inválida.');
  const auth=await getAuth(),{fromNodeHeaders}=await import('better-auth/node');let actor;
  if(!['authenticate-options','authenticate'].includes(b.action)){
   actor=await actorFromRequest(req);if(actor.role!=='admin')throw problem(403,'Acesso restrito ao administrador.');
   if(b.action!=='list')requireFresh(await auth.api.getSession({headers:fromNodeHeaders(req.headers)}));
  }
  await transaction(actor,db=>rateLimit(db,req,'passkey:'+b.action,20));
  if(b.action==='revoke'){
   const id=text(b.id,1,128,'chave de acesso'),db=await getPool().connect();
   try{
    await db.query('BEGIN');
    const removed=await db.query('DELETE FROM passkey WHERE id=$1 AND "userId"=$2 RETURNING id',[id,actor.authSubject]);
    if(!removed.rowCount)throw problem(404,'Chave de acesso não encontrada nesta conta.');
    await db.query('DELETE FROM session WHERE "userId"=$1',[actor.authSubject]);
    await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'revoked','passkey',$2)",[actor.id,id]);
    await db.query('COMMIT');return json(res,200,{ok:true});
   }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
  }
  let body;
  if(b.action==='register-options'&&(await getPool().query('SELECT count(*)::int AS n FROM passkey WHERE "userId"=$1',[actor.authSubject])).rows[0].n>=10)throw problem(400,'Você já tem dez chaves. Remova uma chave antiga antes de cadastrar outra.');
  if(b.action==='register')body={response:b.response,name:text(b.name,2,60,'nome do aparelho')};
  if(b.action==='authenticate')body={response:b.response};
  const response=await auth.handler(new Request((process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app')+'/api/auth/passkey/'+route[0],{method:route[1],headers:fromNodeHeaders(req.headers),...(body?{body:JSON.stringify(body)}:{})}));
  const data=await response.json();
  if(!response.ok)return json(res,response.status,{ok:false,error:data.code==='SESSION_NOT_FRESH'?'Saia e entre novamente com sua senha antes de cadastrar a digital.':'Não foi possível confirmar a chave de acesso. Tente novamente ou entre com sua senha.'});
  if(b.action==='authenticate-options')data.userVerification='required';
  if(b.action==='list')return json(res,200,{ok:true,keys:data.map(k=>({id:k.id,name:k.name||'Chave de acesso',createdAt:k.createdAt}))});
  if(b.action==='register')await transaction(actor,db=>db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'registered','passkey',$2)",[actor.id,data.id]));
  const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  // A credencial pública fica no servidor; somente opções WebAuthn e o resultado mínimo saem da API.
  return json(res,200,{ok:true,...(b.action.endsWith('-options')?{options:data}:{})});
 }catch(e){return json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Acesso por digital temporariamente indisponível. Você pode entrar com sua senha.'});}
};
