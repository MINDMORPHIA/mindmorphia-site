import test from 'node:test';
import assert from 'node:assert/strict';
import {requestBody} from '../lib/http.mjs';
const stream=(chunks,headers={},body)=>({headers,body,async *[Symbol.asyncIterator](){yield*chunks;}});
test('request body cap covers streaming, declared size and framework-parsed body',async()=>{
 assert.equal((await requestBody(stream(['ab','cd']),4)).toString(),'abcd');
 await assert.rejects(requestBody(stream(['abc','def']),4),e=>e.status===413);
 await assert.rejects(requestBody(stream([],{ 'content-length':'5'}),4),e=>e.status===413);
 await assert.rejects(requestBody(stream([],{},'abcde'),4),e=>e.status===413);
 assert.equal((await requestBody(stream([],{},'abcd'),4)).toString(),'abcd');
});
