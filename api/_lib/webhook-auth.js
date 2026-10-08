import {createHmac,timingSafeEqual} from "node:crypto";
// Mercado Pago Webhooks signature: x-signature: ts=<value>,v1=<hex>
// Signed template includes data.id; request-id from header.
export function verifyMercadoPagoNotification(req,paymentId){
 const secret=process.env.MERCADOPAGO_WEBHOOK_SECRET;
 const signature=req.headers["x-signature"];
 const requestId=req.headers["x-request-id"];
 if(!secret||typeof signature!=="string"||typeof requestId!=="string"||!/^\d+$/.test(String(paymentId)))return false;
 const pairs=Object.fromEntries(signature.split(",").map(v=>v.trim().split("=",2)));
 const ts=pairs.ts,v1=pairs.v1;
 if(!/^\d+$/.test(ts||"")||!/^[a-f\d]{64}$/i.test(v1||""))return false;
 if(Math.abs(Date.now()-Number(ts)*1000)>5*60*1000)return false;
 const template="id:"+paymentId.toLowerCase()+";request-id:"+requestId+";ts:"+ts+";";
 const expected=createHmac("sha256",secret).update(template).digest("hex");
 return timingSafeEqual(Buffer.from(v1,"hex"),Buffer.from(expected,"hex"));
}
