const {problem,text,uuid,seal,unseal,lookup,documentOk}=require('./security.cjs');
const {ORGS}=require('./operation.cjs');
const REASONS={email_missing:'E-mail não informado',document_missing:'Documento não informado',document_masked:'Documento parcialmente oculto',document_invalid:'Documento com dígitos inválidos',name_incomplete:'Nome precisa de conferência',identity_conflict:'Documento vinculado a outro nome',email_conflict:'E-mail já vinculado a outra conta',access_pending:'Acesso ainda não ativado'};
function digits(value){return String(value||'').replace(/\D/g,'');}
function validDocument(value){
 if(documentOk(value))return true;
 if(!/^\d{14}$/.test(value)||/^(\d)\1+$/.test(value))return false;
 for(let size=12;size<=13;size++){const w=size===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];const sum=w.reduce((n,x,i)=>n+x*Number(value[i]),0),mod=sum%11;if(Number(value[size])!==(mod<2?0:11-mod))return false;}return true;
}
function completeName(name){return name.trim().split(/\s+/).length>=2&&!/\b(esposo|esposa|vizinho|vizinha|amigo|amiga)\b/i.test(name)&&!/(^|\s)[A-Za-zÀ-ÿ]\.(\s|$)/.test(name);}
function normalizedName(name){return name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
function assess(record){
 const reasons=[],doc=digits(record.document),name=String(record.name||'').trim();
 if(!completeName(name))reasons.push('name_incomplete');
 if(!record.document||/n[aã]o informado/i.test(record.document))reasons.push('document_missing');
 else if(/[xX*]/.test(record.document))reasons.push('document_masked');
 else if(!validDocument(doc))reasons.push('document_invalid');
 if(!record.email)reasons.push('email_missing');
 return reasons;
}
async function ensureCase(db,actor,record,existingCaseId){
 const document=digits(record.document),hash=lookup(document);
 const match=(await db.query('SELECT id,full_name,email FROM clients WHERE cpf_lookup_hash=$1 FOR UPDATE',[hash])).rows[0];
 if(match&&normalizedName(match.full_name)!==normalizedName(record.name))return {conflict:true};
 let clientId=match?.id;
 if(!clientId){clientId=(await db.query('INSERT INTO clients(full_name,cpf_lookup_hash,cpf_ciphertext,cpf_last4,email,whatsapp) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[record.name,hash,seal(document),document.slice(-4),record.email||null,record.whatsapp||null])).rows[0].id;}
 // Não substituir contatos existentes durante uma importação sem e-mail.
 else if(record.email)await db.query('UPDATE clients SET email=$2,whatsapp=coalesce($3,whatsapp),updated_at=now() WHERE id=$1',[clientId,record.email,record.whatsapp||null]);
 let caseId=existingCaseId;
 if(!caseId)caseId=(await db.query('SELECT id FROM cases WHERE client_id=$1 ORDER BY opened_at LIMIT 1',[clientId])).rows[0]?.id;
 if(!caseId){
  caseId=(await db.query("INSERT INTO cases(client_id,stage,public_stage_label,next_action_public,created_by) VALUES($1,'received','Cadastro recebido','Conferência inicial pela equipe SAUVID',$2) RETURNING id",[clientId,actor.id])).rows[0].id;
  for(const org of ORGS)await db.query("INSERT INTO case_organizations(case_id,organization,status_code,public_status_label,evidence_state,updated_by) VALUES($1,$2,'pending','A confirmar','pending',$3)",[caseId,org,actor.id]);
  await db.query("INSERT INTO case_events(case_id,visibility,event_type,title,message,occurred_at,created_by) VALUES($1,'internal','registration','Cadastro importado','Cadastro criado a partir da lista fornecida pelo responsável. Os órgãos aguardam conferência; a data deste evento é a data de importação.',now(),$2)",[caseId,actor.id]);
 }
 return {clientId,caseId};
}
async function importRecords(db,actor,source){
 if(actor.role!=='admin')throw problem(403,'Importação restrita ao administrador.');
 const old=(await db.query('SELECT id,total_rows FROM registration_imports WHERE source_sha256=$1',[source.sha256])).rows[0];
 if(old)return {importId:old.id,total:old.total_rows,repeated:true};
 const batch=(await db.query('INSERT INTO registration_imports(source_sha256,source_name,total_rows,created_by) VALUES($1,$2,$3,$4) RETURNING id',[source.sha256,source.name,source.records.length,actor.id])).rows[0];
 let cases=0;
 for(const record of source.records){
  const reasons=assess(record);let link={};
  if(!reasons.some(r=>r.startsWith('document_')||r==='name_incomplete')){link=await ensureCase(db,actor,record);if(link.conflict)reasons.push('identity_conflict');else cases++;}
  await db.query('INSERT INTO registration_items(import_id,source_row,source_page,full_name,payload_ciphertext,reasons,client_id,case_id,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[batch.id,record.row,record.page,record.name,seal(JSON.stringify(record)),reasons,link.clientId||null,link.caseId||null,actor.id]);
 }
 return {importId:batch.id,total:source.records.length,cases,repeated:false};
}
const NO_ACCESS="NOT EXISTS(SELECT 1 FROM client_access ca JOIN app_users au ON au.id=ca.user_id WHERE ca.client_id=ri.client_id AND au.active AND au.role='client' AND lower(au.email)=lower(c.email))";
async function listPending(db,body={}){
 const page=Math.max(0,Math.min(Number(body.page)||0,100000)),search=String(body.search||'').trim().slice(0,120),condition=`(ri.state='pending' OR ${NO_ACCESS})`;
 const summary=(await db.query(`SELECT count(*)::int AS total,count(*) FILTER(WHERE ri.case_id IS NOT NULL)::int AS with_case,count(*) FILTER(WHERE ${condition})::int AS pending FROM registration_items ri LEFT JOIN clients c ON c.id=ri.client_id`)).rows[0];
 const items=(await db.query(`SELECT ri.id,ri.full_name,ri.source_row,ri.source_page,ri.reasons,ri.client_id,ri.case_id,ri.state,i.source_name FROM registration_items ri JOIN registration_imports i ON i.id=ri.import_id LEFT JOIN clients c ON c.id=ri.client_id WHERE ${condition} AND ($1='' OR ri.full_name ILIKE '%'||$1||'%') ORDER BY ri.created_at,ri.source_row LIMIT 50 OFFSET $2`,[search,page*50])).rows;
 return {items:items.map(r=>({...r,reasons:r.reasons.length?r.reasons:['access_pending']})),summary,page};
}
async function pendingDetail(db,id){
 const row=(await db.query('SELECT ri.*,i.source_name FROM registration_items ri JOIN registration_imports i ON i.id=ri.import_id WHERE ri.id=$1',[uuid(id)])).rows[0];if(!row)throw problem(404,'Pendência não encontrada.');
 return {...row,payload_ciphertext:undefined,record:JSON.parse(unseal(row.payload_ciphertext))};
}
async function completePending(db,actor,body){
 const row=(await db.query('SELECT * FROM registration_items WHERE id=$1 FOR UPDATE',[uuid(body.id)])).rows[0];if(!row)throw problem(404,'Pendência não encontrada.');
 const old=JSON.parse(unseal(row.payload_ciphertext)),record={...old,name:text(body.name,3,120,'nome'),document:String(body.document||'').trim(),email:text(body.email||'',0,160,'e-mail').toLowerCase(),whatsapp:digits(body.whatsapp||'')};
 if(record.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))throw problem(400,'Informe um e-mail válido.');
 const reasons=assess(record),document=digits(record.document);
 if(row.client_id&&validDocument(document)){const client=(await db.query('SELECT cpf_lookup_hash FROM clients WHERE id=$1',[row.client_id])).rows[0];if(client.cpf_lookup_hash!==lookup(document))throw problem(409,'O documento não corresponde ao cadastro já vinculado. Solicite revisão de identidade.');}
 const account=record.email?(await db.query('SELECT id,role FROM app_users WHERE lower(email)=$1',[record.email])).rows[0]:null;
 if(account){const allowed=row.client_id&&(await db.query('SELECT user_id FROM client_access WHERE user_id=$1 AND client_id=$2',[account.id,row.client_id])).rows.length;if(account.role!=='client'||!allowed)reasons.push('email_conflict');}
 let link={clientId:row.client_id,caseId:row.case_id};
 if(!reasons.some(r=>r.startsWith('document_')||r==='name_incomplete')){const result=await ensureCase(db,actor,{...record,email:reasons.includes('email_conflict')?null:record.email},row.case_id);if(result.conflict)reasons.push('identity_conflict');else link=result;}
 const ready=reasons.length===0;
 await db.query('UPDATE registration_items SET full_name=$2,payload_ciphertext=$3,reasons=$4,client_id=$5,case_id=$6,state=$7,updated_by=$8,updated_at=now() WHERE id=$1',[row.id,record.name,seal(JSON.stringify(record)),reasons,link.clientId,link.caseId,ready?'complete':'pending',actor.id]);
 return {...link,name:record.name,email:record.email,accessActive:!!account&&!reasons.includes('email_conflict'),ready,reasons};
}
module.exports={REASONS,validDocument,completeName,assess,importRecords,listPending,pendingDetail,completePending};
