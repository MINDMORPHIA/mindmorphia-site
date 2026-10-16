const {problem}=require('./security.cjs');
const {emailOk}=require('./communications.cjs');
const SENDER='SAUVID Assessoria <sauvid@mindmorphia.gruposauvid.com.br>',REPLY_TO='sauvid.ass@gmail.com';
function configuration(){
 if(process.env.SAUVID_EMAILS_ENABLED!=='true'||!process.env.RESEND_API_KEY||process.env.SAUVID_EMAIL_FROM!==SENDER||!process.env.RESEND_WEBHOOK_SECRET)throw problem(503,'O envio de e-mails está em configuração. Você já pode preparar rascunhos.');
 return {key:process.env.RESEND_API_KEY,from:SENDER,replyTo:REPLY_TO};
}
function status(){try{configuration();return {configured:true,connected:true,sender:SENDER,replyTo:REPLY_TO};}catch(e){return {configured:false,connected:false,sender:SENDER,replyTo:REPLY_TO,message:e.message};}}
function payload(job){
 if(!emailOk(job.to)||/[\r\n]/.test(job.subject))throw problem(400,'Confira destinatário e assunto.');
 return {from:SENDER,to:[job.to],reply_to:REPLY_TO,subject:job.subject,text:job.message+'\n\nSAUVID Assessoria\nAcompanhe seu atendimento: https://sauvid-assessoria.vercel.app/gestao.html\nPara responder à equipe, responda a este e-mail.'};
}
async function send(job,config,transport=fetch){
 let r;try{r=await transport('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json','Idempotency-Key':'sauvid/'+job.id},body:JSON.stringify(payload(job)),signal:AbortSignal.timeout(7000)});}catch{return {state:'uncertain',reason:'Sem confirmação do serviço. Confira o histórico no Resend antes de preparar novo envio.'};}
 if(!r.ok)return {state:r.status>=500?'uncertain':'failed',reason:r.status===429?'Limite do serviço atingido. Aguarde e confira antes de reenviar.':r.status>=500?'O serviço não confirmou o resultado. Confira o Resend antes de reenviar.':'O serviço recusou o envio. Confira configuração e destinatário antes de preparar nova mensagem.'};
 const data=await r.json().catch(()=>({}));if(!data.id||!/^[a-zA-Z0-9-]{1,100}$/.test(data.id))return {state:'uncertain',reason:'Resposta sem identificador válido. Confira o Resend.'};return {state:'sent',providerId:data.id};
}
module.exports={SENDER,REPLY_TO,configuration,status,payload,send};
