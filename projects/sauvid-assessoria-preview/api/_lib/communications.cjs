const {problem,text,uuid,choice,seal,unseal}=require('./security.cjs');
const crypto=require('node:crypto');
const reviewKey=rows=>crypto.createHash('sha256').update(JSON.stringify(rows.map(r=>[r.client_id,r.current_email,r.active]).sort((a,b)=>a[0].localeCompare(b[0])))).digest('hex');
const emailOk=v=>typeof v==='string'&&v.length<=160&&/^[^\s@<>\r\n,;]+@[^\s@<>\r\n,;]+\.[^\s@<>\r\n,;]+$/.test(v);
function manager(actor,write=false){if(!['admin',...(write?['operator']:['operator','auditor'])].includes(actor.role))throw problem(403,'Acesso restrito à gestão.');}
function admin(actor){if(actor.role!=='admin')throw problem(403,'Somente o administrador pode autorizar e enviar e-mails.');}
async function recipients(db,actor){manager(actor);return (await db.query('SELECT id,full_name,email,active FROM clients ORDER BY full_name,id LIMIT 1000')).rows.map(c=>({...c,eligible:c.active&&emailOk(c.email),reason:!c.active?'Cadastro inativo':emailOk(c.email)?null:'E-mail ausente ou inválido'}));}
async function create(db,actor,b){
 manager(actor,true);const subject=text(b.subject,3,120,'assunto'),body=text(b.message,3,6000,'mensagem');
 if(/[\r\n]/.test(subject))throw problem(400,'O assunto precisa ter uma única linha.');
 const key=uuid(b.requestKey),kind=choice(b.kind,['message','notice','update']);
 if(!Array.isArray(b.clientIds)||!b.clientIds.length||b.clientIds.length>200)throw problem(400,'Selecione entre 1 e 200 clientes.');
 const ids=[...new Set(b.clientIds.map(uuid))];
 const existing=(await db.query('SELECT id FROM communications WHERE request_key=$1',[key])).rows[0];if(existing)return {id:existing.id,repeated:true};
 const selected=(await db.query('SELECT id FROM clients WHERE id=ANY($1::uuid[])',[ids])).rows;
 if(selected.length!==ids.length)throw problem(400,'Confira os clientes selecionados.');
 const c=(await db.query('INSERT INTO communications(request_key,subject,body_ciphertext,kind,created_by) VALUES($1,$2,$3,$4,$5) RETURNING id',[key,subject,seal(body),kind,actor.id])).rows[0];
 for(const id of ids)await db.query("INSERT INTO communication_recipients(communication_id,client_id,state) VALUES($1,$2,'draft')",[c.id,id]);
 return {id:c.id};
}
async function detail(db,actor,id){
 manager(actor);id=uuid(id);const c=(await db.query('SELECT * FROM communications WHERE id=$1',[id])).rows[0];if(!c)throw problem(404,'Comunicação não encontrada.');
 const rows=(await db.query('SELECT r.*,cl.full_name,cl.email AS current_email,cl.active FROM communication_recipients r JOIN clients cl ON cl.id=r.client_id WHERE communication_id=$1 ORDER BY cl.full_name,r.id',[id])).rows;
 return {id:c.id,subject:c.subject,message:unseal(c.body_ciphertext),kind:c.kind,state:c.state,reviewKey:reviewKey(rows),created_at:c.created_at,approved_at:c.approved_at,recipients:rows.map(r=>({id:r.id,clientId:r.client_id,name:r.full_name,email:r.email_ciphertext?unseal(r.email_ciphertext):r.current_email,state:r.state,reason:r.reason,sentAt:r.sent_at,deliveryStatus:r.delivery_status,deliveryAt:r.provider_event_at,eligible:r.active&&emailOk(r.current_email)}))};
}
async function list(db,actor){manager(actor);return (await db.query("SELECT c.id,c.subject,c.kind,c.state,c.created_at,count(r.id)::int AS total,count(r.id) FILTER(WHERE r.state='sent')::int AS sent,count(r.id) FILTER(WHERE r.state IN ('queued','sending'))::int AS queued,count(r.id) FILTER(WHERE r.state IN ('failed','uncertain','skipped') OR r.delivery_status IN ('bounced','complained','failed'))::int AS attention,count(r.id) FILTER(WHERE r.delivery_status='delivered')::int AS delivered FROM communications c LEFT JOIN communication_recipients r ON r.communication_id=c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT 100")).rows;}
async function approve(db,actor,id,review){
 admin(actor);id=uuid(id);const c=(await db.query('SELECT * FROM communications WHERE id=$1 FOR UPDATE',[id])).rows[0];if(!c)throw problem(404,'Comunicação não encontrada.');if(c.state==='approved')return {id,repeated:true};
 const rows=(await db.query('SELECT r.id,r.client_id,cl.email,cl.email AS current_email,cl.active FROM communication_recipients r JOIN clients cl ON cl.id=r.client_id WHERE r.communication_id=$1 ORDER BY r.id FOR SHARE OF cl',[id])).rows;
 if(review!==reviewKey(rows))throw problem(409,'Os dados dos destinatários mudaram. Reabra a comunicação e revise os endereços novamente.');
 const seen=new Set();let eligible=0;
 for(const r of rows){const e=String(r.email||'').trim().toLowerCase();const reason=!r.active?'Cadastro inativo':!emailOk(e)?'E-mail ausente ou inválido':seen.has(e)?'E-mail repetido nesta comunicação':null;
  await db.query('UPDATE communication_recipients SET state=$2,email_ciphertext=$3,reason=$4 WHERE id=$1',[r.id,reason?'skipped':'queued',emailOk(e)?seal(e):null,reason]);if(!reason){seen.add(e);eligible++;}}
 if(!eligible)throw problem(400,'Nenhum cliente selecionado possui e-mail válido e cadastro ativo. Complete os dados em Pendências cadastrais.');
 await db.query("UPDATE communications SET state='approved',approved_by=$2,approved_at=now() WHERE id=$1",[id,actor.id]);return {id,eligible};
}
async function claim(db,actor,id){
 admin(actor);id=uuid(id);
 // Nunca repetir automaticamente uma tentativa cujo resultado não foi confirmado.
 await db.query("UPDATE communication_recipients SET state='uncertain',reason='Tentativa sem confirmação. Confira os histórico do Resend antes de qualquer novo envio.' WHERE communication_id=$1 AND state='sending' AND attempted_at<now()-interval '2 minutes'",[id]);
 const r=(await db.query("SELECT r.id,r.email_ciphertext,r.client_id,c.subject,c.body_ciphertext,cl.email AS current_email,cl.active FROM communication_recipients r JOIN communications c ON c.id=r.communication_id JOIN clients cl ON cl.id=r.client_id WHERE r.communication_id=$1 AND c.state='approved' AND r.state='queued' ORDER BY r.id LIMIT 1 FOR UPDATE OF r SKIP LOCKED",[id])).rows[0];
 if(!r)return null;
 const to=unseal(r.email_ciphertext);if(!r.active||String(r.current_email||'').trim().toLowerCase()!==to){await db.query("UPDATE communication_recipients SET state='skipped',reason='Cadastro ou e-mail mudou após a revisão. Prepare uma nova comunicação.' WHERE id=$1",[r.id]);return {skipped:true};}
 await db.query("UPDATE communication_recipients SET state='sending',attempted_at=now(),reason=NULL WHERE id=$1",[r.id]);
 return {id:r.id,to,subject:r.subject,message:unseal(r.body_ciphertext)};
}
async function finish(db,actor,id,result){admin(actor);await db.query("UPDATE communication_recipients SET state=$2,provider_id=$3,reason=$4,sent_at=CASE WHEN $2='sent' THEN now() ELSE NULL END WHERE id=$1 AND state='sending'",[uuid(id),choice(result.state,['sent','failed','uncertain']),result.providerId||null,result.reason||null]);}
module.exports={emailOk,recipients,create,detail,list,approve,claim,finish};
