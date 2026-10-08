import test from "node:test";
import assert from "node:assert/strict";
import {plans as publicPlans} from "../catalogo-planos.js";
import {planFor} from "../api/_lib/plans.js";

test("Public catalog matches authoritative server prices",()=>{
 for(const item of publicPlans){
  const server=planFor(item.id);
  assert.ok(server,`Missing server plan: ${item.id}`);
  assert.equal(item.precoCentavos,server.amount,`Price mismatch: ${item.id}`);
 }
});
