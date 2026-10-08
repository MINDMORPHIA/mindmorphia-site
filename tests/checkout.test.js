import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import {verifyMercadoPagoNotification} from "../api/_lib/webhook-auth.js";
import {planFor} from "../api/_lib/plans.js";
import {sameOrderRequest} from "../api/_lib/idempotency.js";

test("Prices are defined on the server",()=>{
 assert.equal(planFor("impacto").amount,99700);
 assert.equal(planFor("autoridade").amount,199700);
 assert.equal(planFor("magnitude").amount,349700);
 assert.equal(planFor("canva-pro-12").amount,9990);
 assert.equal(planFor("__unknown__"),null);
});
test("Webhook rejects incomplete and forged signatures",()=>{
 process.env.MERCADOPAGO_WEBHOOK_SECRET="test-signature-secret";
 const requestId="req-test";
 const paymentId="1234567";
 const ts=String(Math.floor(Date.now()/1000));
 const template=`id:${paymentId};request-id:${requestId};ts:${ts};`;
 const v1=createHmac("sha256",process.env.MERCADOPAGO_WEBHOOK_SECRET).update(template).digest("hex");
 const req={headers:{"x-signature":`ts=${ts},v1=${v1}`,"x-request-id":requestId}};
 assert.equal(verifyMercadoPagoNotification(req,paymentId),true);
 assert.equal(verifyMercadoPagoNotification(req,"999"),false);
 assert.equal(verifyMercadoPagoNotification({headers:{"x-signature":"ts=1,v1="+v1,"x-request-id":requestId}},paymentId),false);
 delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
});

test("Idempotency key can only repeat the exact same order identity",()=>{
 const prior={plan_id:"autoridade",email:"CLIENTE@EXEMPLO.COM",whatsapp:"(62) 99999-0000"};
 assert.equal(sameOrderRequest(prior,{planId:"autoridade",email:"cliente@exemplo.com",phone:"62999990000"}),true);
 assert.equal(sameOrderRequest(prior,{planId:"impacto",email:"cliente@exemplo.com",phone:"62999990000"}),false);
 assert.equal(sameOrderRequest(prior,{planId:"autoridade",email:"outro@exemplo.com",phone:"62999990000"}),false);
 assert.equal(sameOrderRequest(prior,{planId:"autoridade",email:"cliente@exemplo.com",phone:"62988880000"}),false);
});
