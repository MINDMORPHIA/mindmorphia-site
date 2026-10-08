import {planFor} from "./_lib/plans.js";
import {json,bodyJSON} from "./_lib/http.js";
export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return json(res,405,{error:"Método não permitido"});}
 // Fail closed: do not accept money until an atomic, durable order store is configured.
 if(process.env.CHECKOUT_ENABLED!=="true")return json(res,503,{error:"Contratação online em preparação"});
 if(!process.env.MERCADOPAGO_ACCESS_TOKEN || !process.env.ORDERS_API_URL || !process.env.ORDERS_API_KEY)
  return json(res,503,{error:"Infraestrutura de pagamentos não configurada"});
 let input;try{input=await bodyJSON(req)}catch{return json(res,400,{error:"Dados inválidos"});}
 const plan=planFor(input.planId);
 if(!plan)return json(res,400,{error:"Plano inexistente"});
 // A durable order API must implement idempotent, atomic creation and unique external_reference.
 // This endpoint intentionally refuses checkout until the order protocol is implemented and tested.
 return json(res,503,{error:"Persistência de pedidos ainda não homologada",plan:plan.name});
}
