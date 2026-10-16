const {json,readJson,allowMethods}=require('./_lib/http');
const {actorFromRequest,staff}=require('./_lib/identity.cjs');
const {transaction}=require('./_lib/database.cjs');
const {originCheck,problem,rateLimit,uuid}=require('./_lib/security.cjs');
const comm=require('./_lib/communications.cjs'),mailer=require('./_lib/mailer.cjs');
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['POST']))return;
 try{
  originCheck(req);const actor=await actorFromRequest(req);staff(actor);const b=await readJson(req,32768);
  await transaction(actor,db=>rateLimit(db,req,'communications:'+actor.id,120));
  if(b.action==='status')return json(res,200,{ok:true,connection:mailer.status()});
  if(b.action==='test'){
   if(actor.role!=='admin')throw problem(403,'Somente o administrador pode testar o envio.');
   const config=mailer.configuration(),id=uuid(b.requestKey);
   const claimed=await transaction(actor,async db=>{
    await rateLimit(db,req,'email-test:'+actor.id,2);await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',['sauvid-email-test:'+id]);
    const previous=(await db.query("SELECT id FROM audit_log WHERE entity_type='email_test' AND entity_id=$1 LIMIT 1",[id])).rows[0];if(previous)return false;
    await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'test_requested','email_test',$2)",[actor.id,id]);return true;
   });if(!claimed)return json(res,200,{ok:true,repeated:true,message:'Este teste já foi solicitado. Confira o Resend antes de repetir.'});
   const result=await mailer.send({id,to:mailer.REPLY_TO,subject:'SAUVID - teste de comunicacoes',message:'Este é um teste da configuração de envio de mensagens da SAUVID Assessoria. Não contém dados de clientes.'},config);
   await transaction(actor,db=>db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id,metadata) VALUES($1,'test_result','email_test',$2,$3)",[actor.id,id,JSON.stringify(result)]));
   return json(res,200,{ok:true,result,message:result.state==='sent'?'Teste aceito pelo serviço. A confirmação de entrega deve ser conferida no Resend.':result.reason});
  }
  if(b.action==='dispatch'){
   if(actor.role!=='admin')throw problem(403,'Somente o administrador pode enviar.');uuid(b.id);
   const config=mailer.configuration();let processed=0,stopped=false;
   for(let i=0;i<3;i++){
    const job=await transaction(actor,db=>comm.claim(db,actor,b.id));if(!job)break;if(job.skipped){processed++;continue;}
    await require('node:timers/promises').setTimeout(600);const result=await mailer.send(job,config);await transaction(actor,db=>comm.finish(db,actor,job.id,result));processed++;if(result.state!=='sent'){stopped=true;break;}
   }
   return json(res,200,{ok:true,processed,stopped,communication:await transaction(actor,db=>comm.detail(db,actor,b.id))});
  }
  // A aprovação congela os destinatários; só dispatch realiza chamadas de envio.
  if(b.action==='approve'){if(actor.role!=='admin')throw problem(403,'Somente o administrador pode autorizar.');mailer.configuration();}
  const result=await transaction(actor,async db=>{
   if(b.action==='recipients')return {clients:await comm.recipients(db,actor)};
   if(b.action==='list')return {communications:await comm.list(db,actor)};
   if(b.action==='detail')return {communication:await comm.detail(db,actor,b.id)};
   if(b.action==='create')return comm.create(db,actor,b);
   if(b.action==='approve')return comm.approve(db,actor,b.id,b.reviewKey);
   throw problem(400,'Operação inválida.');
  });return json(res,200,{ok:true,...result});
 }catch(e){return json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Não foi possível concluir. Confira a configuração de envio e tente novamente.'});}
};
