const {problem,choice,uuid,text,lookup,seal}=require('./security.cjs');
const {ORGS,STATUSES}=require('./operation.cjs');
const statuses={...STATUSES,partial:'Baixa parcial',restricted:'Restrição identificada',divergence:'Divergência/reprocessamento'};
const conflict=()=>problem(409,'Outro lançamento alterou esta versão. Reabra o atendimento e revise a prévia.');
function civil(value,required){
 if(!value&&!required)return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw problem(400,'Informe uma data válida.');
 return value;
}
async function createCase(db,actor,b){
 const doc=String(b.document||'').replace(/[.\s/-]/g,'');
 const type=choice(b.personType,['PF','PJ']);
 if(doc.length!==(type==='PF'?11:14)||!require('./registrations.cjs').validDocument(doc))throw problem(400,'Confira o documento informado.');
 const name=text(b.name,3,120,'nome'),email=text(b.email,5,160,'contato').toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||b.verified!==true)throw problem(400,'Confira o contato e a representação do titular.');
 const key=uuid(b.key), hash=lookup(doc);
 await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',[key]);
 const prior=(await db.query('SELECT c.id,cl.cpf_lookup_hash FROM cases c JOIN clients cl ON cl.id=c.client_id WHERE creation_key=$1',[key])).rows[0];
 if(prior){if(prior.cpf_lookup_hash!==hash)throw conflict();return {id:prior.id};}
 const client=(await db.query(`INSERT INTO clients(full_name,email,cpf_lookup_hash,cpf_ciphertext,cpf_last4,person_type,verified_at) VALUES($1,$2,$3,$4,$5,$6,now()) ON CONFLICT(cpf_lookup_hash) DO UPDATE SET verified_at=now(),email=coalesce(clients.email,excluded.email) WHERE clients.email IS NULL OR lower(clients.email)=excluded.email RETURNING id`,[name,email,hash,seal(doc),doc.slice(-4),type])).rows[0];
 if(!client)throw problem(409,'O contato diverge do cadastro existente. Confira a titularidade.');
 const row=(await db.query("INSERT INTO cases(client_id,stage,public_stage_label,protocol,batch,scope,creation_key,created_by) VALUES($1,'received','Recebido',$2,$3,$4,$5,$6) RETURNING id",[client.id,text(b.protocol,0,120,'protocolo'),text(b.batch,0,120,'lote'),text(b.scope,1,500,'escopo'),key,actor.id])).rows[0];
 for(const org of ORGS)await db.query("INSERT INTO case_organizations(case_id,organization,status_code,public_status_label) VALUES($1,$2,'pending','A confirmar')",[row.id,org]);
 return row;
}
async function credit(db,actor,b){
 if(actor.role!=='admin')throw problem(403,'Acesso exclusivo da administração.');
 if(b.action==='credit-create')return createCase(db,actor,b);
 const id=uuid(b.caseId);
 if(b.action==='credit-access'){
  const r=await db.query('SELECT credit_client_access(client_id,$2) AS ok FROM cases WHERE id=$1',[id,b.enable===true]);
  if(!r.rows[0]?.ok)throw problem(409,'Confira o contato verificado e a conta individual ativa. Para uma conta nova, gere um convite.');
  return {ok:true};
 }
 if(b.action==='credit-release'){
  const r=await db.query("UPDATE case_files SET visibility=$3 WHERE case_id=$1 AND id=$2 RETURNING id",[id,uuid(b.file),choice(b.visibility,['client','internal'])]);
  if(!r.rows.length)throw problem(404,'Arquivo indisponível.');
  return r.rows[0];
 }
 if(b.action==='credit-list')return {drafts:(await db.query('SELECT * FROM credit_drafts WHERE case_id=$1 ORDER BY published_at DESC NULLS FIRST,base_version DESC,revision DESC',[id])).rows};
 const key=uuid(b.key),org=choice(b.organization,ORGS);
 const current=(await db.query('SELECT stage FROM cases WHERE id=$1 FOR UPDATE',[id])).rows[0];
 if(!current)throw problem(404,'Atendimento indisponível.');
 const state=(await db.query('SELECT * FROM case_organizations WHERE case_id=$1 AND organization=$2 FOR UPDATE',[id,org])).rows[0];
 if(!state)throw problem(404,'Órgão indisponível.');
 const draft=(await db.query('SELECT * FROM credit_drafts WHERE id=$1 FOR UPDATE',[key])).rows[0];
 if(draft&&(draft.case_id!==id||draft.organization!==org))throw conflict();
 if(b.action==='credit-publish'&&draft?.event_id)return {eventId:draft.event_id};
 if(draft?.event_id||state.revision!==b.baseVersion||(draft?.revision||0)!==b.revision)throw conflict();
 if(b.action==='credit-save'){
 const p={status:choice(b.status,Object.keys(statuses)),scope:text(b.extent,1,500,'abrangência'),source:text(b.source,1,500,'origem'),message:text(b.message,3,3000,'mensagem'),note:text(b.note,0,3000,'nota'),fact:civil(b.fact,false),checked:civil(b.checked,true),file:b.file?uuid(b.file):null,reason:text(b.reason,0,500,'motivo'),previous:b.previous?uuid(b.previous):null,registry:text(b.registry,0,100,'ato de cartório')};
 if(p.previous&&(!p.reason||p.previous!==state.publication_id))throw problem(400,'Confira a publicação anterior e o motivo da correção.');
 if(draft&&draft.base_version!==state.revision)throw conflict();
 if(draft)await db.query('UPDATE credit_drafts SET payload=$2,revision=revision+1 WHERE id=$1',[key,p]);
 else await db.query('INSERT INTO credit_drafts(id,case_id,organization,base_version,payload,before_state) VALUES($1,$2,$3,$4,$5,$6)',[key,id,org,state.revision,p,state]);
 return {key};
 }
 if(b.action!=='credit-publish'||!draft||b.reviewed!==true||draft.base_version!==state.revision)throw conflict();
 const p=draft.payload;
 if(current.stage==='completed'&&p.status!=='confirmed'){
  const others=await db.query("SELECT 1 FROM case_organizations WHERE case_id=$1 AND organization<>$2 AND status_code='confirmed' AND publication_id IS NOT NULL LIMIT 1",[id,org]);
  if(p.status!=='not_applicable'||!others.rows.length)throw problem(409,'Reabra o atendimento antes desta alteração.');
 }
 if(p.status==='confirmed'&&(!p.file||(org==='PROTESTOS'&&!['Cancelamento','Suspensão','Sustação'].includes(p.registry))))throw problem(400,'Selecione a evidência revisada e, para cartório, o ato correspondente.');
 if(p.file&&!(await db.query('SELECT id FROM case_files WHERE id=$1 AND case_id=$2 AND organization=$3 AND evidence_reviewed_at IS NOT NULL',[p.file,id,org])).rows.length)throw problem(400,'A evidência precisa estar revisada para este órgão.');
 const event=(await db.query("INSERT INTO case_events(case_id,organization,visibility,event_type,title,message,occurred_at,created_by) VALUES($1,$2,'client','organization',$3,$4,now(),$5) RETURNING id",[id,org,(p.previous?'Correção · ':'')+org+' · '+statuses[p.status],p.message,actor.id])).rows[0];
 await db.query('UPDATE case_organizations SET status_code=$3,public_status_label=$4,public_note=$5,evidence_state=$6,extent=$7,fact_date=$8,checked_date=$9,last_checked_at=now(),updated_at=now(),updated_by=$10,revision=revision+1,publication_id=$11 WHERE case_id=$1 AND organization=$2',[id,org,p.status,statuses[p.status],p.message,p.status==='confirmed'?'reviewed':'pending',p.scope,p.fact,p.checked,actor.id,event.id]);
 await db.query('UPDATE cases SET last_checked_at=now(),updated_at=now() WHERE id=$1',[id]);
 await db.query('UPDATE credit_drafts SET event_id=$2,reviewed_by=$3,published_at=now() WHERE id=$1',[key,event.id,actor.id]);
 return {eventId:event.id};
}
module.exports={credit,statuses};
