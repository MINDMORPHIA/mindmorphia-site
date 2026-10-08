import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/checkout.js";
function mockResponse(){return {code:0,headers:{},payload:null,setHeader(k,v){this.headers[k]=v;return this;},status(n){this.code=n;return this;},end(body){this.payload=JSON.parse(body);return this;}};}
test("Checkout rejects non-POST methods",async()=>{const res=mockResponse();await handler({method:"GET"},res);assert.equal(res.code,405);});
test("Checkout remains disabled unless explicitly enabled",async()=>{
 const previous=process.env.CHECKOUT_ENABLED;
 delete process.env.CHECKOUT_ENABLED;
 try{const res=mockResponse();await handler({method:"POST"},res);assert.equal(res.code,503);assert.match(res.payload.error,/prepara/i);}
 finally{if(previous===undefined)delete process.env.CHECKOUT_ENABLED;else process.env.CHECKOUT_ENABLED=previous;}
});
