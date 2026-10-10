import test from 'node:test';
import assert from 'node:assert/strict';
import {orderSubmissionKey} from '../commerce/order-key.js';
test('checkout reuses retry key without storing customer text and separates changed orders',async()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const payload={items:[{id:'canva-pro-12',quantity:1}],brief:'Private customer instructions'};
 const first=await orderSubmissionKey(payload,'client-a',storage);
 assert.equal(await orderSubmissionKey(payload,'client-a',storage),first);
 assert.notEqual(await orderSubmissionKey(payload,'client-b',storage),first);
 assert.notEqual(await orderSubmissionKey({...payload,mode:'deposit'},'client-a',storage),first);
 assert.ok(![...values.values()].join('').includes(payload.brief));
});
test('checkout keeps retry key when session storage is unavailable',async()=>{
 const storage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
 const payload={items:[{id:'impacto',quantity:1}]};
 assert.equal(await orderSubmissionKey(payload,'blocked-client',storage),await orderSubmissionKey(payload,'blocked-client',storage));
});
