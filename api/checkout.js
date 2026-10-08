import {randomUUID} from "node:crypto";
import {db} from "./_lib/database.js";
import {planFor} from "./_lib/plans.js";
import {json,bodyJSON} from "./_lib/http.js";
import {createPreference} from "./_lib/mercadopago.js";
import {sameOrderRequest} from "./_lib/idempotency.js";

function validName(x){return typeof x==="string"&&x.trim().length>=2&&x.trim().length<=150;}
function validEmail(x){return typeof x==="string"&&x.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);}
function validPhone(x){return typeof x==="string"&&x.replace(/\D/g,"").length>=10&&x.replace(/\D/g,"").length<=13;}
export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return json(res,405,{error:"Método não permitido"});}
 if(process.env.CHECKOUT_ENABLED!=="true")return json(res,503,{error:"Contratação online em preparação"});
 if(!process.env.MERCADOPAGO_ACCESS_TOKEN||!process.env.DATABASE_URL||!process.env.PUBLIC_SITE_URL)
  return json(res,503,{error:"Infraestrutura de pagamentos não configurada"});
 let input;try{input=await bodyJSON(req)}catch{return json(res,400,{error:"Dados inválidos"});}
 const plan=planFor(input?.planId);
 if(!plan||!validName(input?.nome)||!validEmail(input?.email)||!validPhone(input?.whatsapp)||input?.privacyAccepted!==true||input?.termsAccepted!==true)
  return json(res,400,{error:"Confira plano, dados de contato e aceite dos termos"});
 const key=req.headers["idempotency-key"];
 if(typeof key!=="string"||!/^[a-zA-Z0-9_-]{16,100}$/.test(key))return json(res,400,{error:"Chave de solicitação inválida"});
 const name=input.nome.trim(),email=input.email.trim().toLowerCase(),phone=input.whatsapp.replace(/\D/g,"");
 let client;
 try{ client=await db().connect(); }
 catch(err){ console.error("Database connection unavailable:",err?.message); return json(res,503,{error:"Serviço de pedidos temporariamente indisponível"}); }
 let orderId,preferenceId;
 try{
  await client.query("BEGIN");
  const prior=await client.query("SELECT o.id,o.plan_id,o.provider_preference_id,c.email,c.whatsapp FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.idempotency_key=$1 FOR UPDATE OF o",[key]);
  if(prior.rows.length){
   if(!sameOrderRequest(prior.rows[0],{planId:input.planId,email,phone}))throw new Error("Idempotency key reused with different order details");
   orderId=prior.rows[0].id;
   preferenceId=prior.rows[0].provider_preference_id;
  } else {
   const customer=await client.query("INSERT INTO customers(full_name,email,whatsapp) VALUES ($1,$2,$3) RETURNING id",[name,email,phone]);
   orderId=randomUUID();
   await client.query("INSERT INTO orders(id,customer_id,plan_id,amount_cents,currency,idempotency_key,external_reference) VALUES($1,$2,$3,$4,'BRL',$5,$6)",[orderId,customer.rows[0].id,input.planId,plan.amount,key,orderId]);
  }
  await client.query("COMMIT");
 }catch(error){try{await client.query("ROLLBACK");}catch{}console.error("Create order:",error?.message);return json(res,503,{error:"Não foi possível registrar o pedido"});}finally{client.release();}
 // A recoverable pending order is retained if the external API is down.
 // Do not create duplicate payments for an already-issued preference.
 if(preferenceId)return json(res,409,{error:"Pedido existente. Consulte o atendimento para recuperar seu pagamento",orderId});
 try{
  const base=new URL(process.env.PUBLIC_SITE_URL);
  if(base.protocol!=="https:")throw new Error("Invalid site URL");
  const successUrl=new URL("/contratar.html",base).toString();
  const preference=await createPreference({orderId,planName:plan.name,amountCents:plan.amount,email,successUrl,idempotencyKey:orderId});
  if(!preference?.id||!preference?.init_point)throw new Error("Invalid preference response");
  await db().query("UPDATE orders SET provider_preference_id=$2,updated_at=now() WHERE id=$1 AND provider_preference_id IS NULL",[orderId,String(preference.id)]);
  return json(res,201,{orderId,checkoutUrl:preference.init_point});
 }catch(err){console.error("Create payment preference:",err.message);return json(res,503,{error:"Pagamento temporariamente indisponível",orderId});}
}
