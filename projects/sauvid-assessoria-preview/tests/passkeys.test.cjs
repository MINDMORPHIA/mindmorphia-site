const {test}=require('node:test'),assert=require('node:assert/strict');
const {requireVerification,requireFresh,pluginOptions}=require('../api/_lib/passkeys.cjs');
test('digital exige confirmação do usuário no servidor e sessão recente para gerenciar chaves',()=>{
 assert.throws(()=>requireVerification({userVerified:false}),e=>e.statusCode===401);assert.throws(()=>requireVerification({}),e=>e.statusCode===401);requireVerification({userVerified:true});
 assert.throws(()=>requireFresh({session:{createdAt:new Date(Date.now()-601000)}}),e=>e.statusCode===401);requireFresh({session:{createdAt:new Date()}});
 const options=pluginOptions();assert.equal(options.registration.requireSession,true);assert.equal(options.authenticatorSelection.userVerification,'required');assert.equal(options.rpID,new URL(options.origin).hostname);
});
