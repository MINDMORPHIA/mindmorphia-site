import {randomUUID} from 'node:crypto';
import {serviceConfig,sendNotificationEmail} from './services.mjs';
const stamp=()=>new Date().toISOString();
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

export function queueNotification(state,entry){
 state.notifications||=[];
 if(state.notifications.some(n=>n.key===entry.key))return;
 state.notifications.push({...entry,status:'pending',attempts:0,createdAt:stamp()});
}

export function queuePurchaseConfirmation(state,order,attempt,origin){
 const user=state.users.find(u=>u.id===order.userId);
 if(!user)return;
 const digital=order.items.some(i=>i.kind==='digital_access');
 queueNotification(state,{key:`purchase/${order.id}/${attempt.paymentId}`,userId:user.id,orderId:order.id,to:user.email,subject:'MINDMORPHIA | Pagamento confirmado',text:`Olá, ${user.name}.\n\nSeu pagamento foi confirmado.\nPedido: ${order.id}\n${order.items.map(i=>`${i.name} · ${i.quantity} unidade(s) · ${money(i.price*i.quantity)}\n${i.scope}`).join('\n')}\nTotal contratado: ${money(order.total)}\nPagamento confirmado nesta etapa: ${money(attempt.amount)}\nSaldo do pedido: ${money(order.balance)}\n\n${digital?'A equipe preparará os links para ativação na sua própria conta. Você receberá outra notificação quando forem disponibilizados. Nunca envie sua senha ou códigos de autenticação.':'Acompanhe as etapas e envie os materiais pela Área do Cliente.'}\n\nSeu painel: ${origin}/cliente\nUse a Área do Cliente para solicitações, documentos e atualizações.`});
}

export async function flushNotifications(store,env,notifier=sendNotificationEmail){
 if(!serviceConfig(env).email)return;
 // A lease prevents concurrent workers from sending the same stored notification.
 for(let i=0;i<8;i++){
  let claimed,reviewed=false;
  await store.change(s=>{
   const candidate=(s.notifications||[]).find(n=>n.status==='pending'||(n.status==='sending'&&Date.parse(n.leaseUntil)<Date.now()));
   if(!candidate)return;
   if(candidate.firstAttemptAt&&Date.now()-Date.parse(candidate.firstAttemptAt)>23*3600000){candidate.status='needs_review';reviewed=true;return;}
   candidate.status='sending';candidate.claimId=randomUUID();candidate.leaseUntil=new Date(Date.now()+120000).toISOString();candidate.firstAttemptAt||=stamp();candidate.attempts++;claimed=structuredClone(candidate);
  });
  if(!claimed){if(reviewed)continue;return;}
  try{
   const result=await notifier(env,claimed);
   if(!result?.id)throw new Error('Envio não confirmado pelo provedor.');
   await store.change(s=>{const n=s.notifications.find(n=>n.key===claimed.key);if(n.claimId!==claimed.claimId)return;n.status='accepted';n.providerMessageId=result.id;n.acceptedAt=stamp();delete n.leaseUntil;delete n.claimId;});
  }catch{
   await store.change(s=>{const n=s.notifications.find(n=>n.key===claimed.key);if(n.claimId!==claimed.claimId)return;n.status='pending';n.lastFailureAt=stamp();delete n.leaseUntil;delete n.claimId;});
   return;
  }
 }
}

export function safeActivationUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port?u.href:null;}catch{return null;}}
