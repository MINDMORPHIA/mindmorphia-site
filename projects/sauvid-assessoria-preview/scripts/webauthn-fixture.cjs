// Autenticador criptográfico exclusivamente sintético para o E2E em banco descartável.
const crypto=require('node:crypto'),assert=require('node:assert/strict');
function cbor(v){
 const head=(major,n)=>n<24?Buffer.from([major*32+n]):n<256?Buffer.from([major*32+24,n]):Buffer.from([major*32+25,n>>8,n&255]);
 if(typeof v==='number')return head(v<0?1:0,v<0?-1-v:v);
 if(typeof v==='string'){const b=Buffer.from(v);return Buffer.concat([head(3,b.length),b]);}
 if(Buffer.isBuffer(v))return Buffer.concat([head(2,v.length),v]);
 if(v instanceof Map)return Buffer.concat([head(5,v.size),...Array.from(v,([k,value])=>Buffer.concat([cbor(k),cbor(value)]))]);
 throw Error('Tipo CBOR de fixture não suportado');
}
function authenticator(){
 const {privateKey,publicKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=publicKey.export({format:'jwk'}),id=crypto.randomBytes(32).toString('base64url');let counter=0;
 const hash=b=>crypto.createHash('sha256').update(b).digest(),base=()=>({id,rawId:id,type:'public-key',authenticatorAttachment:'platform',clientExtensionResults:{}});
 const client=(type,options,origin)=>Buffer.from(JSON.stringify({type,challenge:options.challenge,origin,crossOrigin:false}));
 return {
  registration(options,{origin='http://localhost:4175',uv=true}={}){
   const count=Buffer.alloc(4),length=Buffer.alloc(2),credential=Buffer.from(id,'base64url');length.writeUInt16BE(credential.length);
   const cose=cbor(new Map([[1,2],[3,-7],[-1,1],[-2,Buffer.from(jwk.x,'base64url')],[-3,Buffer.from(jwk.y,'base64url')]]));
   const authData=Buffer.concat([hash(options.rp.id),Buffer.from([uv?0x45:0x41]),count,Buffer.alloc(16),length,credential,cose]);
   return {...base(),response:{clientDataJSON:client('webauthn.create',options,origin).toString('base64url'),attestationObject:cbor(new Map([['fmt','none'],['attStmt',new Map()],['authData',authData]])).toString('base64url'),transports:['internal']}};
  },
  authentication(options,{origin='http://localhost:4175',uv=true}={}){
   const count=Buffer.alloc(4);count.writeUInt32BE(++counter);const authData=Buffer.concat([hash(options.rpId),Buffer.from([uv?5:1]),count]),clientData=client('webauthn.get',options,origin);
   return {...base(),response:{clientDataJSON:clientData.toString('base64url'),authenticatorData:authData.toString('base64url'),signature:crypto.sign('sha256',Buffer.concat([authData,hash(clientData)]),privateKey).toString('base64url')}};
  }
 };
}
async function verifyPasskeys({call,db,invite,client}){
 const admin=await invite('passkey-qa@example.invalid','admin'),device=authenticator();
 const options=async(action,cookie)=>{const r=await call('/api/passkeys',{action},cookie);assert.equal(r.status,200,JSON.stringify(r.data));return {...r,cookie:[cookie,r.cookie].filter(Boolean).join('; ')};};
 let r=await call('/api/passkeys',{action:'register-options'});assert.equal(r.status,401);
 r=await call('/api/passkeys',{action:'register-options'},client);assert.equal(r.status,403);
 r=await call('/api/auth/passkey/generate-register-options');assert.equal(r.status,404,'Sem acesso direto às rotas do plugin');
 let o=await options('register-options',admin);assert.equal(o.data.options.authenticatorSelection.userVerification,'required');
 r=await call('/api/passkeys',{action:'register',name:'Aparelho sintético',response:device.registration(o.data.options,{uv:false})},o.cookie);assert.notEqual(r.status,200);assert.equal((await db.query('SELECT count(*)::int AS n FROM passkey')).rows[0].n,0,'Sem cadastro sem confirmação do usuário');
 o=await options('register-options',admin);r=await call('/api/passkeys',{action:'register',name:'Aparelho sintético',response:device.registration(o.data.options)},o.cookie);assert.equal(r.status,200,JSON.stringify(r.data));
 r=await call('/api/passkeys',{action:'list'},admin);assert.equal(r.data.keys.length,1);const key=r.data.keys[0];assert.ok(!key.publicKey&&!key.credentialID);
 o=await options('authenticate-options');assert.equal(o.data.options.userVerification,'required');let response=device.authentication(o.data.options);r=await call('/api/passkeys',{action:'authenticate',response},o.cookie);assert.equal(r.status,200,JSON.stringify(r.data));const signed=r.cookie;assert.equal((await call('/api/portal',null,signed)).data.user.role,'admin');
 r=await call('/api/passkeys',{action:'authenticate',response},o.cookie);assert.notEqual(r.status,200,'Desafio não pode ser reutilizado');
 for(const invalid of [{uv:false},{origin:'https://evil.invalid'}]){o=await options('authenticate-options');r=await call('/api/passkeys',{action:'authenticate',response:device.authentication(o.data.options,invalid)},o.cookie);assert.notEqual(r.status,200,'Exige confirmação e origem correta');assert.ok(!r.cookie,'Sem cookie em autenticação inválida');}
 const subject=(await db.query("SELECT auth_subject FROM app_users WHERE email='passkey-qa@example.invalid'")).rows[0].auth_subject;
 await db.query('UPDATE app_users SET active=false WHERE auth_subject=$1',[subject]);o=await options('authenticate-options');r=await call('/api/passkeys',{action:'authenticate',response:device.authentication(o.data.options)},o.cookie);assert.notEqual(r.status,200,'Conta suspensa não recebe sessão');await db.query('UPDATE app_users SET active=true WHERE auth_subject=$1',[subject]);
 await db.query('UPDATE session SET "createdAt"=now()-interval \'20 minutes\' WHERE "userId"=$1',[subject]);r=await call('/api/passkeys',{action:'register-options'},admin);assert.equal(r.status,401,'Cadastro exige sessão recente');await db.query('UPDATE session SET "createdAt"=now() WHERE "userId"=$1',[subject]);
 r=await call('/api/passkeys',{action:'revoke',id:key.id},admin);assert.equal(r.status,200,JSON.stringify(r.data));assert.equal((await call('/api/portal',null,signed)).status,401,'Remoção encerra sessões');assert.equal((await db.query('SELECT count(*)::int AS n FROM passkey')).rows[0].n,0);
 console.log('PASS: passkeys com assinatura real sintética, UV, origem, desafio único, conta suspensa, sessão recente, isolamento e revogação.');
}
module.exports={verifyPasskeys};
