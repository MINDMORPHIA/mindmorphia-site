import {json} from "./_lib/http.js";
export default async function handler(req,res){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return json(res,405,{error:"Método não permitido"});}
 // No receipt can be accepted as proof of payment without validating the MP signature,
 // querying payment status server-side and reconciling against a persisted order.
 return json(res,503,{error:"Webhook de pagamento ainda não homologado"});
}
