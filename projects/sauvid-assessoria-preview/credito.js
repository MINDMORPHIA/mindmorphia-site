'use strict';
const creditStatuses={pending:'A confirmar',monitoring:'Em acompanhamento',reported:'Baixa informada',confirmed:'Baixa confirmada',partial:'Baixa parcial',restricted:'Restrição identificada',divergence:'Divergência/reprocessamento',review:'Em revisão',not_applicable:'Fora do escopo'};
const creditOrgs={SPC:'SPC',SERASA:'Serasa',BOA_VISTA:'Boa Vista',PROTESTOS:'Cartório'};
const creditDay=v=>v?v.split('-').reverse().join('/'):'A informar';
const creditOptions=(values,current)=>Object.entries(values).map(([value,label])=>`<option value="${esc(value)}" ${current===value?'selected':''}>${esc(label)}</option>`).join('');
function addCreditCaseButton(){
 const button=document.createElement('button');button.textContent='Cadastrar atendimento';$('#caseSearch').after(button);
 button.onclick=()=>{
  const key=crypto.randomUUID();
  $('#content').innerHTML=`<section class="card"><h2>Cadastrar atendimento</h2><form id="newCredit"><label>Tipo<select name="personType"><option>PF</option><option>PJ</option></select></label><label>Nome ou razão social<input name="name" required></label><label>CPF/CNPJ<input name="document" required></label><label>E-mail verificado<input type="email" name="email" required></label><label>Protocolo<input name="protocol"></label><label>Lote<input name="batch"></label><label>Escopo contratado<textarea name="scope" required></textarea></label><label><input type="checkbox" name="verified" required> Conferi a titularidade do contato e, para PJ, a representação.</label><button>Cadastrar</button></form></section>`;
  $('#newCredit').onsubmit=guarded(async e=>{const data=Object.fromEntries(new FormData(e.target));const result=await api('credit-create',{...data,key,verified:data.verified==='on'});await caseView(result.id);});
 };
}
async function mountCreditEditor(c){
 const {drafts}=await api('credit-list',{caseId:c.id});
 const host=document.createElement('section');host.className='card';$('#orgForm').parentElement.after(host);
 $('#orgForm').parentElement.hidden=true;
 const field=(label,name,value='',type='text',required=false)=>`<label>${esc(label)}<input type="${type}" name="${name}" value="${esc(value)}" ${required?'required':''}></label>`;
 function edit(org,draft){
  const state=c.organizations.find(o=>o.organization===org),p=draft?.payload||{},key=draft?.id||crypto.randomUUID();
  const context={caseId:c.id,organization:org,key,revision:draft?.revision||0,baseVersion:state.revision};
  const files=Object.fromEntries(c.files.filter(f=>f.organization===org&&f.evidence_reviewed_at).map(f=>[f.id,f.original_name]));
  host.innerHTML=`<h2>Atualização por órgão</h2><label>Órgão<select id="creditOrg">${creditOptions(creditOrgs,org)}</select></label>
  <form id="creditEdit"><label>Situação<select name="status">${creditOptions(creditStatuses,p.status||state.status_code)}</select></label>
  ${field('Abrangência','extent',p.scope||state.extent,'text',true)}${field('Origem da informação','source',p.source,'text',true)}
  ${field('Data do fato, se conhecida','fact',p.fact,'date')}${field('Data da verificação','checked',p.checked,'date',true)}
  <label>Evidência revisada<select name="file"><option value="">Selecionar</option>${creditOptions(files,p.file)}</select></label>
  ${org==='PROTESTOS'?`<label>Ato do cartório<select name="registry"><option value="">Selecionar</option>${creditOptions({Cancelamento:'Cancelamento',Suspensão:'Suspensão',Sustação:'Sustação'},p.registry)}</select></label>`:''}
  <label>Mensagem ao cliente<textarea name="message" required>${esc(p.message)}</textarea></label><label>Nota interna<textarea name="note">${esc(p.note)}</textarea></label>
  ${state.publication_id?`<label><input type="checkbox" name="correct" ${p.previous?'checked':''}> Corrigir a publicação atual</label>${field('Motivo da correção','reason',p.reason)}`:''}
  <button>Salvar rascunho e revisar</button></form><div id="creditReview"></div>`;
  $('#creditOrg').onchange=e=>select(e.target.value);
  $('#creditEdit').onsubmit=guarded(async e=>{
   const data=Object.fromEntries(new FormData(e.target));
   await api('credit-save',{...data,...context,previous:data.correct?state.publication_id:null});
   notice('Rascunho salvo. Confira a prévia antes de publicar.');await caseView(c.id);$('#creditOrg').value=org;$('#creditOrg').dispatchEvent(new Event('change'));
  });
  if(draft){
   const stale=draft.base_version!==state.revision;
   $('#creditReview').innerHTML=`<h3>Prévia para ${esc(c.name)} · ${esc(c.documentMask)}</h3><p>${esc(c.protocol||'Protocolo a informar')} · ${esc(creditOrgs[org])}</p><p>Anterior: ${esc(state.public_status_label)} · ${esc(state.public_note)}</p><p>Após publicar: ${esc(creditStatuses[p.status])} · ${esc(p.scope)}<br>${esc(p.message)}</p><p>Verificação: ${creditDay(p.checked)} · Fato: ${creditDay(p.fact)}</p>${stale?'<p>O estado publicado mudou. Inicie um novo rascunho após revisar os dados.</p><button id="freshCredit">Novo rascunho</button>':'<button id="publishCredit">Confirmar destinatário e publicar este rascunho</button>'}`;
   if(stale)$('#freshCredit').onclick=()=>edit(org,null);
   else{
    $('#creditEdit').oninput=()=>{$('#publishCredit').disabled=true;};
    $('#publishCredit').onclick=guarded(async()=>{await api('credit-publish',{...context,reviewed:true});notice('Atualização publicada.');await caseView(c.id);});
   }
  }
 }
 function select(org){edit(org,drafts.find(d=>!d.event_id&&d.organization===org));}
 const notes=$('#orgForm').parentElement;notes.hidden=false;notes.querySelector('h2').textContent='Registrar conferência inconclusiva ou nota interna';notes.querySelector('.muted').textContent='Descreva a conferência, inclusive processo não localizado ou erro. A anotação fica restrita à gestão e preserva a situação publicada.';for(const name of ['status','evidenceState','visibility'])notes.querySelector('[name='+name+']').closest('label').hidden=true;
 const controls=document.createElement('section');controls.className='card';host.after(controls);
 controls.innerHTML='<h2>Acesso ao atendimento</h2><p>Conta individual do contato conferido: '+esc(c.email)+'</p><button id="grantCredit">Vincular conta existente</button> <button class="secondary" id="revokeCredit">Revogar vínculo</button><h3>Arquivos do cliente</h3>'+c.files.map(f=>'<p>'+esc(f.original_name)+' <button class="secondary" data-share="'+esc(f.id)+'">'+(f.visibility==='client'?'Retirar liberação':'Liberar ao cliente')+'</button></p>').join('')+'<button class="secondary" id="exportCredit">Exportar histórico interno</button>';
 for(const [selector,enable] of [['#grantCredit',true],['#revokeCredit',false]])$(selector).onclick=guarded(async()=>{await api('credit-access',{caseId:c.id,enable});notice(enable?'Vínculo ativo.':'Vínculo revogado.');});
 controls.querySelectorAll('[data-share]').forEach(button=>button.onclick=guarded(async()=>{const f=c.files.find(item=>item.id===button.dataset.share);await api('credit-release',{caseId:c.id,file:f.id,visibility:f.visibility==='client'?'internal':'client'});await caseView(c.id);}));
 $('#exportCredit').onclick=guarded(async()=>{const current=await api('credit-list',{caseId:c.id});const url=URL.createObjectURL(new Blob([JSON.stringify({atendimento:c.id,publicacoes:current.drafts},null,2)],{type:'application/json'}));const link=document.createElement('a');link.download='historico-interno-'+c.id+'.json';link.href=url;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 select('SPC');
}
