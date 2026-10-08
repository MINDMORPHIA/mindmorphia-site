import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import {verifyMercadoPagoNotification} from "../api/_lib/webhook-auth.js";
import {planFor} from "../api/_lib/plans.js";

test("Prices are defined on the server",()=>{
 assert.equal(planFor("magnitude").amount,240000);
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
