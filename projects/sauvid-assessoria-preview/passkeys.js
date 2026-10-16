'use strict';
const passkeyApi=(action,body={})=>request('/api/passkeys',{action,...body});
const passkeySupported=()=>window.isSecureContext&&!!window.PublicKeyCredential&&!!navigator.credentials&&!!window.SimpleWebAuthnBrowser;
function passkeyError(e){return /NotAllowed|Abort|CANCEL|CEREMONY_ABORTED/.test(e.name+' '+e.code)?'Confirmação cancelada ou expirada. Tente novamente; sua senha continua disponível.':e.code==='ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED'?'Este aparelho já tem uma chave cadastrada. Use Entrar com digital.':e.message||'Não foi possível usar a digital. Entre com sua senha.';}
$('#passkeyLogin').hidden=!passkeySupported();
$('#passkeyLogin').onclick=guarded(async()=>{
 try{
  const {options}=await passkeyApi('authenticate-options');
  const response=await SimpleWebAuthnBrowser.startAuthentication({optionsJSON:options});
  await passkeyApi('authenticate',{response});$('#loginForm').reset();await start();
 }catch(e){notice(passkeyError(e),true);}
});
async function passkeys(){
 const {keys}=await passkeyApi('list');
 $('#content').innerHTML=`<section class="card"><span class="eyebrow">SEU ACESSO</span><h2>Digital e segurança</h2><p>Cadastre uma chave de acesso no notebook e outra no S26 Ultra. Depois, use <b>Entrar com digital</b> na tela de entrada.</p><p>A digital fica protegida no aparelho. Windows Hello, Google ou Samsung podem oferecer também o PIN. Sua senha continua disponível.</p><form id="registerPasskey"><label>Nome do aparelho<input name="name" maxlength="60" minlength="2" required value="${/Android/i.test(navigator.userAgent)?'S26 Ultra':'Meu notebook'}"></label><button ${passkeySupported()?'':'disabled'}>Ativar digital neste aparelho</button></form><p class="muted">Entre com a senha nos últimos 10 minutos antes de cadastrar ou remover uma chave. Confirme pessoalmente a janela de segurança do aparelho. No S26 Ultra, abra esta mesma página pelo Chrome.</p>${passkeySupported()?'':'<p>Este navegador não oferece chaves de acesso. Use o Chrome ou Edge atualizado em um aparelho com bloqueio de tela configurado.</p>'}<h3>Aparelhos cadastrados</h3>${keys.length?keys.map(k=>`<article class="event"><b>${esc(k.name)}</b><small>Cadastrado em ${date(k.createdAt)}</small><button class="secondary" data-revoke-passkey="${esc(k.id)}">Remover chave</button></article>`).join(''):'<p>Nenhuma chave cadastrada ainda.</p>'}<p class="muted">Se perder um aparelho, remova sua chave aqui. A remoção encerra suas sessões e exige novo login. As chaves valem para sauvid-assessoria.vercel.app.</p></section>`;
 $('#registerPasskey').onsubmit=guarded(async e=>{
  try{
   const name=new FormData(e.target).get('name'),{options}=await passkeyApi('register-options');
   const response=await SimpleWebAuthnBrowser.startRegistration({optionsJSON:options});
   await passkeyApi('register',{name,response});await passkeys();notice('Chave de acesso cadastrada. Você já pode entrar com digital neste aparelho.');
  }catch(err){notice(passkeyError(err),true);}
 });
 document.querySelectorAll('[data-revoke-passkey]').forEach(button=>button.onclick=guarded(async()=>{
  if(!confirm('Remover esta chave de acesso e encerrar suas sessões? Você poderá entrar novamente com a senha ou outra chave cadastrada.'))return;
  await passkeyApi('revoke',{id:button.dataset.revokePasskey});user=null;$('#content').replaceChildren();show('loginCard');notice('Chave removida e sessões encerradas. Entre novamente.');
 }));
}
