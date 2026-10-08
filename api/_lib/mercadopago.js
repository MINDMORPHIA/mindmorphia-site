const ROOT="https://api.mercadopago.com";
function accessToken(){const token=process.env.MERCADOPAGO_ACCESS_TOKEN;if(!token)throw new Error("Mercado Pago not configured");return token;}
export async function getPayment(paymentId){
 if(!/^\d+$/.test(String(paymentId)))throw new Error("Invalid payment ID");
 const r=await fetch(ROOT+"/v1/payments/"+encodeURIComponent(paymentId),{headers:{Authorization:"Bearer "+accessToken(),Accept:"application/json"},signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Could not verify payment with Mercado Pago ("+r.status+")");
 return r.json();
}
export async function createPreference({orderId,planName,amountCents,email,successUrl,idempotencyKey}){
 const u=new URL(successUrl);
 if(u.protocol!=="https:")throw new Error("HTTPS return URL required");
 const payload={items:[{id:orderId,title:planName,quantity:1,currency_id:"BRL",unit_price:amountCents/100}],payer:{email},external_reference:orderId,back_urls:{success:u.toString(),pending:u.toString(),failure:u.toString()},auto_return:"approved"};
 const r=await fetch(ROOT+"/checkout/preferences",{method:"POST",headers:{Authorization:"Bearer "+accessToken(),"Content-Type":"application/json","X-Idempotency-Key":idempotencyKey},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Could not create preference ("+r.status+")");
 return r.json();
}
