export function sameOrderRequest(prior,{planId,email,phone}){
 if(!prior)return false;
 return prior.plan_id===planId
  && String(prior.email||"").trim().toLowerCase()===email
  && String(prior.whatsapp||"").replace(/\D/g,"")===phone;
}
