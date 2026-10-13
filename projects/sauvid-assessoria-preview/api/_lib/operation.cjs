const crypto=require('node:crypto');
const {problem,text,uuid,choice,seal,unseal,lookup,documentOk}=require('./security.cjs');
const ORGS=['SPC','SERASA','BOA_VISTA','PROTESTOS'];
const STAGES={received:'Recebido',analysis:'Em análise',structured:'Estruturado',filed:'Protocolado',monitoring:'Em acompanhamento',review:'Em revisão',completed:'Concluído',paused:'Pausado',cancelled:'Cancelado'};
const STATUSES={pending:'A confirmar',monitoring:'Em acompanhamento',reported:'Baixa informada',review:'Em revisão',confirmed:'Baixa confirmada',not_applicable:'Fora do escopo'};
function normalizeLead(body){
 const name=text(body.name,3,120,'nome'),email=text(body.email,5,160,'e-mail').toLowerCase(),whatsapp=String(body.whatsapp||'').replace(/\D/g,''),cpf=String(body.cpf||'').replace(/\D/g,''),situation=text(body.situation,10,3000,'situação');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw problem(400,'Informe um e-mail válido.');
 if(!/^\d{10,13}$/.test(whatsapp))throw problem(400,'Informe um WhatsApp válido.');
 if(!documentOk(cpf))throw problem(400,'Confira os dígitos do CPF.');
 if(body.consent!==true)throw problem(400,'Confirme a ciência sobre o uso dos dados para o atendimento.');
 return {name,email,whatsapp,cpf,situation,requestKey:uuid(body.requestKey)};
}
async function saveLead(db,body){
 const v=normalizeLead(body),id=crypto.randomUUID(),protocol='SV-'+new Date().getUTCFullYear()+'-'+crypto.randomBytes(6).toString('hex').toUpperCase();
 // A chave única evita gravações duplicadas em uma repetição de rede.
 const r=await db.query('SELECT * FROM receive_lead($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,v.name,v.email,v.whatsapp,lookup(v.cpf),seal(v.cpf),v.cpf.slice(-4),seal(v.situation),protocol,v.requestKey]);
 return {persisted:true,protocol:r.rows[0].protocol,repeated:!r.rows[0].inserted,message:r.rows[0].inserted?'Solicitação registrada na gestão SAUVID. Guarde seu protocolo.':'Esta solicitação já foi registrada.'};
}
async function listLeads(db,body){
 const status=body.status?choice(body.status,['new','contacted','qualified','converted','discarded']):null;
 const term=String(body.search||'').trim().slice(0,120),doc=term.replace(/\D/g,'');
 const {rows}=await db.query("SELECT id,name,email,whatsapp,cpf_last4,protocol,status,assigned_to,case_id,created_at FROM leads WHERE ($1::text IS NULL OR status=$1) AND ($2='' OR name ILIKE '%'||$2||'%' OR email ILIKE '%'||$2||'%' OR protocol ILIKE '%'||$2||'%' OR cpf_lookup_hash=$3) ORDER BY created_at DESC LIMIT 100",[status,term,doc.length===11?lookup(doc):'']);return rows;
}
async function leadDetail(db,id){const {rows}=await db.query('SELECT * FROM leads WHERE id=$1',[uuid(id)]);if(!rows[0])throw problem(404,'Solicitação não encontrada.');const r=rows[0];return {id:r.id,name:r.name,email:r.email,whatsapp:r.whatsapp,documentMask:'***.***.*'+r.cpf_last4,protocol:r.protocol,status:r.status,situation:unseal(r.situation_ciphertext),internalNote:r.internal_note_ciphertext?unseal(r.internal_note_ciphertext):'',caseId:r.case_id,createdAt:r.created_at};}
async function updateLead(db,actor,body){
 const id=uuid(body.id),status=choice(body.status,['new','contacted','qualified','discarded']),note=text(body.internalNote||'',0,3000,'observação');
 const r=await db.query('UPDATE leads SET status=$2,internal_note_ciphertext=$3,assigned_to=$4,updated_at=now() WHERE id=$1 AND status<>\'converted\' RETURNING id',[id,status,note?seal(note):null,actor.id]);if(!r.rowCount)throw problem(409,'Solicitação indisponível ou já convertida.');return {id};
}
async function convertLead(db,actor,id){
 const {rows}=await db.query('SELECT * FROM leads WHERE id=$1 FOR UPDATE',[uuid(id)]);const lead=rows[0];if(!lead)throw problem(404,'Solicitação não encontrada.');if(lead.case_id)return {caseId:lead.case_id};
 const client=await db.query('INSERT INTO clients(full_name,cpf_lookup_hash,cpf_ciphertext,cpf_last4,email,whatsapp) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(cpf_lookup_hash) DO UPDATE SET updated_at=clients.updated_at RETURNING id',[lead.name,lead.cpf_lookup_hash,lead.cpf_ciphertext,lead.cpf_last4,lead.email,lead.whatsapp]);
 const c=await db.query("INSERT INTO cases(client_id,stage,public_stage_label,next_action_public,created_by) VALUES($1,'received','Recebido','Análise inicial',$2) RETURNING id",[client.rows[0].id,actor.id]);
 for(const org of ORGS)await db.query("INSERT INTO case_organizations(case_id,organization,status_code,public_status_label,updated_by) VALUES($1,$2,'pending','A confirmar',$3)",[c.rows[0].id,org,actor.id]);
 await db.query("INSERT INTO case_events(case_id,visibility,event_type,title,message,occurred_at,created_by) VALUES($1,'client','opened','Atendimento recebido','A SAUVID iniciou a organização do atendimento.',now(),$2)",[c.rows[0].id,actor.id]);
 await db.query("UPDATE leads SET status='converted',case_id=$2,assigned_to=$3,updated_at=now() WHERE id=$1",[id,c.rows[0].id,actor.id]);return {caseId:c.rows[0].id,clientId:client.rows[0].id};
}
async function listCases(db,search=''){
 const term=String(search).trim().slice(0,120),digits=term.replace(/\D/g,'');
 return (await db.query("SELECT c.id,c.client_id,c.public_stage_label,c.next_action_public,c.last_checked_at,cl.full_name,cl.cpf_last4,cl.email FROM cases c JOIN clients cl ON cl.id=c.client_id WHERE $1='' OR cl.full_name ILIKE '%'||$1||'%' OR cl.cpf_lookup_hash=$2 ORDER BY c.opened_at DESC LIMIT 100",[term,digits.length===11?lookup(digits):''])).rows;
}
async function caseDetail(db,id){
 const {rows}=await db.query('SELECT c.*,cl.full_name,cl.cpf_last4,cl.email FROM cases c JOIN clients cl ON cl.id=c.client_id WHERE c.id=$1',[uuid(id)]);if(!rows[0])throw problem(404,'Atendimento não encontrado.');
 const organizations=(await db.query('SELECT organization,status_code,public_status_label,public_note,last_checked_at,evidence_state FROM case_organizations WHERE case_id=$1 ORDER BY organization',[id])).rows;
 const events=(await db.query('SELECT id,organization,visibility,title,message,occurred_at,created_at FROM case_events WHERE case_id=$1 ORDER BY occurred_at DESC,created_at DESC',[id])).rows;
 const files=(await db.query('SELECT id,original_name,mime_type,byte_size,visibility,created_at,evidence_reviewed_at FROM case_files WHERE case_id=$1 ORDER BY created_at DESC',[id])).rows;
 const c=rows[0];return {id:c.id,clientId:c.client_id,name:c.full_name,email:c.email,documentMask:'Final '+c.cpf_last4,stage:c.stage,stageLabel:c.public_stage_label,nextAction:c.next_action_public,lastChecked:c.last_checked_at,organizations,events,files};
}
async function updateCase(db,actor,body){
 const id=uuid(body.id),stage=choice(body.stage,Object.keys(STAGES)),next=text(body.nextAction,0,1000,'próxima ação');
 const r=await db.query('UPDATE cases SET stage=$2,public_stage_label=$3,next_action_public=$4,updated_at=now() WHERE id=$1 RETURNING id',[id,stage,STAGES[stage],next]);if(!r.rowCount)throw problem(404,'Atendimento não encontrado.');
 await db.query("INSERT INTO case_events(case_id,visibility,event_type,title,message,occurred_at,created_by) VALUES($1,'client','stage',$2,$3,now(),$4)",[id,'Etapa: '+STAGES[stage],next||'Etapa atualizada pela equipe SAUVID.',actor.id]);return {id};
}
async function updateOrganization(db,actor,body){
 const id=uuid(body.caseId),org=choice(body.organization,ORGS),status=choice(body.status,Object.keys(STATUSES)),visibility=choice(body.visibility,['internal','client']),note=text(body.message,3,3000,'mensagem');
 const evidence=choice(body.evidenceState||'pending',['pending','reported','reviewed','confirmed','not_applicable']);
 if(status==='confirmed'&&!['reviewed','confirmed'].includes(evidence))throw problem(400,'A baixa confirmada exige evidência revisada.');
 if(visibility==='client'){
  const r=await db.query('UPDATE case_organizations SET status_code=$3,public_status_label=$4,public_note=$5,evidence_state=$6,last_checked_at=now(),updated_at=now(),updated_by=$7 WHERE case_id=$1 AND organization=$2 RETURNING id',[id,org,status,STATUSES[status],note,evidence,actor.id]);if(!r.rowCount)throw problem(404,'Órgão não encontrado.');
  await db.query('UPDATE cases SET last_checked_at=now(),updated_at=now() WHERE id=$1',[id]);
 }
 await db.query("INSERT INTO case_events(case_id,organization,visibility,event_type,title,message,occurred_at,created_by) VALUES($1,$2,$3,'organization',$4,$5,now(),$6)",[id,org,visibility,org+': '+STATUSES[status],note,actor.id]);return {id};
}
module.exports={ORGS,STAGES,STATUSES,normalizeLead,saveLead,listLeads,leadDetail,updateLead,convertLead,listCases,caseDetail,updateCase,updateOrganization};
