const crypto=require('node:crypto');
const {json,readJson,allowMethods}=require('./_lib/http');
const {getPool,transaction}=require('./_lib/database.cjs');
const {actorFromRequest,staff,getAuth}=require('./_lib/identity.cjs');
const {problem,originCheck,text,uuid,choice,rateLimit}=require('./_lib/security.cjs');
const op=require('./_lib/operation.cjs');
const registrations=require('./_lib/registrations.cjs');
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['GET','POST']))return;
 try{
  if(req.method==='POST')originCheck(req);
  const body=req.method==='POST'?await readJson(req,32768):{},q=new URL(req.url,'https://localhost').searchParams,action=body.action||q.get('action')||'session';
  if(req.method!=='POST'&&!['session','case'].includes(action))throw problem(405,'Utilize POST para esta operação.');
  if(action==='activate'){
   const token=text(body.token,40,160,'convite'),password=text(body.password,12,128,'senha');
   await rateLimit(getPool(),req,'activate',5);
   const conn=await getPool().connect();
   try{
    await conn.query('BEGIN');
    const {rows}=await conn.query('SELECT * FROM access_invites WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE',[crypto.createHash('sha256').update(token).digest('hex')]);
    if(!rows[0])throw problem(400,'Convite inválido ou expirado.');const invite=rows[0];
    if((await conn.query('SELECT id FROM "user" WHERE email=$1',[invite.email])).rows.length)throw problem(409,'Conta já cadastrada. Entre ou recupere seu acesso.');
    const created=await (await getAuth()).api.signUpEmail({body:{email:invite.email,name:invite.full_name,password}});
    const user=await conn.query('INSERT INTO app_users(auth_subject,email,role) VALUES($1,$2,$3) RETURNING id',[created.user.id,invite.email,invite.role]);
    if(invite.client_id)await conn.query('INSERT INTO client_access(user_id,client_id) VALUES($1,$2)',[user.rows[0].id,invite.client_id]);
    await conn.query('UPDATE access_invites SET used_at=now() WHERE id=$1',[invite.id]);await conn.query('COMMIT');
    return json(res,201,{ok:true,message:'Acesso ativado. Entre com seu e-mail e a senha escolhida.'});
   }catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}
  }
  const actor=await actorFromRequest(req);
  if(action==='session')return json(res,200,{ok:true,user:{name:actor.name,email:actor.email,role:actor.role},recoveryAvailable:!!(process.env.RESEND_API_KEY&&process.env.SAUVID_EMAIL_FROM)});
  const result=await transaction(actor,async db=>{
   if(req.method==='POST')await rateLimit(db,req,'portal:'+actor.id,60);
   if(action==='cases'){if(actor.role!=='client')staff(actor);return {cases:await op.listCases(db,body.search||'')};}
   if(action==='case'){const detail=await op.caseDetail(db,body.id||q.get('id'));await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'read','cases',$2)",[actor.id,detail.id]);return {case:detail};}
   staff(actor,['lead-update','lead-convert','case-update','organization-update','invite','file-review','user-access','recover-user','registration-save'].includes(action));
   if(action==='pending')return registrations.listPending(db,body);
   if(action==='registration')return {registration:await registrations.pendingDetail(db,body.id)};
   if(action==='registration-save')return registrations.completePending(db,actor,body);
   if(action==='leads')return {leads:await op.listLeads(db,body)};
   if(action==='lead')return {lead:await op.leadDetail(db,body.id)};
   if(action==='lead-update')return op.updateLead(db,actor,body);
   if(action==='lead-convert')return op.convertLead(db,actor,body.id);
   if(action==='case-update')return op.updateCase(db,actor,body);
   if(action==='organization-update')return op.updateOrganization(db,actor,body);
   if(action==='file-review'){
    if(actor.role!=='admin')throw problem(403,'Somente o administrador pode revisar a evidência.');
    const r=await db.query('UPDATE case_files SET evidence_reviewed_by=$2,evidence_reviewed_at=now() WHERE id=$1 RETURNING id',[uuid(body.id),actor.id]);if(!r.rowCount)throw problem(404,'Arquivo não encontrado.');return {id:body.id};
   }
   if(action==='invite'){
    if(actor.role!=='admin')throw problem(403,'Somente o administrador pode conceder acesso.');
    const role=choice(body.role,['client','operator','admin','auditor']),clientId=role==='client'?uuid(body.clientId):null,email=text(body.email,5,160,'e-mail').toLowerCase(),name=text(body.name,3,120,'nome');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw problem(400,'E-mail inválido.');
    if(clientId&&!(await db.query('SELECT id FROM clients WHERE id=$1',[clientId])).rows.length)throw problem(404,'Cliente não encontrado.');
    const token=crypto.randomBytes(32).toString('base64url');
    await db.query("INSERT INTO access_invites(token_hash,email,full_name,role,client_id,created_by,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '48 hours')",[crypto.createHash('sha256').update(token).digest('hex'),email,name,role,clientId,actor.id]);
    return {activationUrl:(process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app')+'/gestao.html#ativar='+token};
   }
   if(action==='audit'){
    if(!['admin','auditor'].includes(actor.role))throw problem(403,'Acesso restrito.');return {audit:(await db.query('SELECT a.id,a.action,a.entity_type,a.entity_id,a.created_at,u.email FROM audit_log a LEFT JOIN app_users u ON u.id=a.actor_user_id ORDER BY a.id DESC LIMIT 100')).rows};
   }
   if(action==='users'){
    if(actor.role!=='admin')throw problem(403,'Acesso restrito ao administrador.');return {users:(await db.query('SELECT id,email,role,active FROM app_users ORDER BY created_at DESC')).rows};
   }
   if(action==='user-access'){
    if(actor.role!=='admin'||body.id===actor.id)throw problem(403,'Esta alteração não é permitida.');
    await db.query('SELECT change_user_access($1,$2,$3)',[uuid(body.id),body.active===true,choice(body.role,['client','operator','admin','auditor'])]);return {id:body.id};
   }
   if(action==='recover-user'){
    if(actor.role!=='admin')throw problem(403,'Acesso restrito ao administrador.');
    const {rows}=await db.query('SELECT auth_subject,active FROM app_users WHERE id=$1',[uuid(body.id)]);if(!rows[0]?.active)throw problem(404,'Acesso ativo não encontrado.');
    const token=crypto.randomBytes(32).toString('base64url'),ctx=await (await getAuth()).$context;
    await ctx.internalAdapter.createVerificationValue({value:rows[0].auth_subject,identifier:'reset-password:'+token,expiresAt:new Date(Date.now()+60*60*1000)});
    await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES($1,'recovery_issued','app_users',$2)",[actor.id,body.id]);
    return {recoveryUrl:(process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app')+'/gestao.html#recuperar='+token};
   }
   throw problem(400,'Operação inválida.');
  });return json(res,200,{ok:true,...result});
 }catch(e){return json(res,e.statusCode||500,{ok:false,error:e.statusCode?e.message:'Não foi possível concluir a operação. Tente novamente.'});}
};
