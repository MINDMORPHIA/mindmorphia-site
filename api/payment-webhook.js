import {json,bodyJSON} from "./_lib/http.js";
import {verifyMercadoPagoNotification} from "./_lib/webhook-auth.js";
import {getPayment} from "./_lib/mercadopago.js";
import {persistVerifiedPayment} from "./_lib/database.js";

export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return json(res,405,{error:"Método não permitido"});}
 // This guard blocks webhooks until operator has provisioned and tested the database.
 if(process.env.CHECKOUT_ENABLED!=="true"||!process.env.DATABASE_URL||!process.env.MERCADOPAGO_WEBHOOK_SECRET||!process.env.MERCADOPAGO_ACCESS_TOKEN)
  return json(res,503,{error:"Notificações ainda não habilitadas"});
 let payload;
 try{payload=await bodyJSON(req);}catch{return json(res,400,{error:"Payload inválido"});}
 const id=String(payload?.data?.id||"");
 const kind=String(payload?.type||payload?.action||"");
 if(!/^\d+$/.test(id))return json(res,400,{error:"Identificador inválido"});
 if(!verifyMercadoPagoNotification(req,id))return json(res,401,{error:"Assinatura inválida"});
 // Non-payment events are acknowledged but never change order state.
 if(!kind.startsWith("payment"))return json(res,200,{received:true,ignored:true});
 try{
  const payment=await getPayment(id);
  if(String(payment.id)!==id)throw new Error("Payment response mismatch");
  const reference=String(payment.external_reference||"");
  const cents=Math.round(Number(payment.transaction_amount)*100);
  if(!reference||!Number.isSafeInteger(cents)||cents<=0)throw new Error("Invalid payment data");
  if(payment.currency_id!=="BRL")throw new Error("Currency mismatch");
  const outcome=await persistVerifiedPayment({reference,paymentId:id,amountCents:cents,currency:"BRL",status:String(payment.status||"")});
  return json(res,200,{received:true,paid:outcome.paid});
 }catch(err){
  console.error("Mercado Pago notification could not be reconciled:",err?.message||err);
  return json(res,503,{error:"Falha na confirmação; tentar novamente"});
 }
}
