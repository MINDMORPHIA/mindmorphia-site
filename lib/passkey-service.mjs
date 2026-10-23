import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse} from '@simplewebauthn/server';

const hash=s=>createHash('sha256').update(s).digest('hex');
const secret=()=>randomBytes(32).toString('hex');
const deny=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export const emptyPasskeys=()=>({keys:[],challenges:[],sessions:[],limits:[],revokedBefore:{},audit:[]});
export function createPasskeyService({store,origin,name,prefix,actor,eligible,webauthn={generateRegistrationOptions,verifyRegistrationResponse,generateAuthenticationOptions,verifyAuthenticationResponse}}){
 const rpID=new URL(origin).hostname,sessionName=`__Host-${prefix}-passkey`,challengeName=`__Host-${prefix}-challenge`;
 const readCookie=(req,key)=>req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1)||'';
 const cookie=(key,value,age)=>`${key}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
 const reply=(data,headers={})=>Response.json(data,{headers:{'Cache-Control':'no-store, private',...headers}});
 async function identity(req){
  const raw=readCookie(req,sessionName);if(!/^[a-f0-9]{64}$/.test(raw))return null;
  const s=await store.read(),session=s.sessions.find(x=>x.hash===hash(raw)&&x.expires>Date.now());
  if(!session||session.issuedAt<=(s.revokedBefore[session.userId]||0)||!s.keys.some(k=>k.id===session.keyId&&k.userId===session.userId))return null;
  const user=await eligible(session.userId);return user?{...user,issuedAt:session.issuedAt,csrf:session.csrf,passkey:true}:null;
 }
 async function allowed(session){if(!session)return null;const s=await store.read();return session.issuedAt>(s.revokedBefore[String(session.id)]||0)?session:null;}
 async function handler(req,action){try{
  if(!['GET','POST'].includes(req.method))deny('Método não permitido.',405);
  if(Number(req.headers.get('content-length')||0)>65536)deny('Solicitação muito grande.',413);
  if(req.method==='POST'&&req.headers.get('origin')!==origin)deny('Origem não autorizada.',403);
  const ip=(req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'unknown').split(',')[0];
  await store.change(s=>{s.limits=s.limits.filter(x=>x.until>Date.now());const id=hash(ip);let row=s.limits.find(x=>x.id===id);if(!row)s.limits.push(row={id,count:0,until:Date.now()+900000});if(++row.count>60)deny('Muitas tentativas. Aguarde 15 minutos.',429);});
  const body=req.method==='POST'?await req.json():{};
  if(action==='login-options'&&req.method==='POST'){
   const options=await webauthn.generateAuthenticationOptions({rpID,userVerification:'required',timeout:120000,allowCredentials:[]});
   const raw=secret();await store.change(s=>{s.challenges=s.challenges.filter(c=>c.expires>Date.now());s.challenges.push({hash:hash(raw),purpose:'login',challenge:options.challenge,expires:Date.now()+300000});});
   return reply(options,{'Set-Cookie':cookie(challengeName,raw,300)});
  }
  async function consume(purpose,userId){const raw=readCookie(req,challengeName);if(!/^[a-f0-9]{64}$/.test(raw))deny('Confirmação expirada. Tente novamente.');return store.change(s=>{const c=s.challenges.find(x=>x.hash===hash(raw)&&x.purpose===purpose&&x.expires>Date.now()&&x.userId===userId);if(!c)deny('Confirmação expirada. Tente novamente.');s.challenges=s.challenges.filter(x=>x!==c);return c;});}
  if(action==='login-verify'&&req.method==='POST'){
   const challenge=await consume('login',undefined),s=await store.read(),key=s.keys.find(k=>k.id===body.id);
   if(!key)deny('Chave indisponível. Entre pelo acesso original.',401);
   const user=await eligible(key.userId);if(!user)deny('Conta sem autorização.',403);
   if(body.response?.userHandle&&body.response.userHandle!==Buffer.from(key.userId).toString('base64url'))deny('Chave inválida.',401);
   const result=await webauthn.verifyAuthenticationResponse({response:body,expectedChallenge:challenge.challenge,expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true,credential:{id:key.id,publicKey:new Uint8Array(Buffer.from(key.publicKey,'base64url')),counter:key.counter,transports:key.transports}});
   if(!result.verified)deny('Chave inválida.',401);
   const raw=secret(),issuedAt=Date.now(),csrf=secret();await store.change(s=>{const current=s.keys.find(k=>k.id===key.id&&k.userId===key.userId);if(!current||current.counter!==key.counter)deny('Chave alterada. Tente novamente.',401);current.counter=result.authenticationInfo.newCounter;current.lastUsed=new Date().toISOString();s.sessions=s.sessions.filter(x=>x.expires>Date.now());s.sessions.push({hash:hash(raw),userId:key.userId,keyId:key.id,issuedAt,csrf,expires:issuedAt+28800000});});
   return reply({ok:true,returnTo:'/gestao/'},{'Set-Cookie':cookie(sessionName,raw,28800)});
  }
  const user=await allowed(await actor(req));if(!user)deny('Entre pelo acesso original para gerenciar suas chaves.',401);
  const userId=String(user.id);
  if(action==='keys'&&req.method==='GET'){const s=await store.read();return reply({keys:s.keys.filter(k=>k.userId===userId).map(({id,label,createdAt,lastUsed})=>({id,label,createdAt,lastUsed}))});}
  if(action==='logout'&&req.method==='POST'){const raw=readCookie(req,sessionName);await store.change(s=>{s.sessions=s.sessions.filter(x=>x.hash!==hash(raw));});return reply({ok:true},{'Set-Cookie':cookie(sessionName,'',0)});}
  if(!Number.isFinite(user.issuedAt)||user.issuedAt<Date.now()-600000)deny('Entre novamente pelo acesso original e volte a esta tela em até 10 minutos.',403);
  if(action==='register-options'&&req.method==='POST'){
   const s=await store.read(),keys=s.keys.filter(k=>k.userId===userId);if(keys.length>=10)deny('Revogue uma chave antiga antes de cadastrar outra.');
   const options=await webauthn.generateRegistrationOptions({rpName:name,rpID,userID:new TextEncoder().encode(userId),userName:user.login||user.email||name,attestationType:'none',timeout:120000,authenticatorSelection:{residentKey:'required',userVerification:'required'},excludeCredentials:keys.map(k=>({id:k.id,transports:k.transports}))});
   const raw=secret();await store.change(s=>{s.challenges=s.challenges.filter(x=>x.expires>Date.now());s.challenges.push({hash:hash(raw),userId,purpose:'register',challenge:options.challenge,expires:Date.now()+300000});});return reply(options,{'Set-Cookie':cookie(challengeName,raw,300)});
  }
  if(action==='register-verify'&&req.method==='POST'){
   const c=await consume('register',userId),result=await webauthn.verifyRegistrationResponse({response:body.credential,expectedChallenge:c.challenge,expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true});
   if(!result.verified||!result.registrationInfo?.userVerified)deny('Não foi possível confirmar sua identidade.');
   const info=result.registrationInfo;await store.change(s=>{if(s.keys.some(k=>k.id===info.credential.id)||s.keys.filter(k=>k.userId===userId).length>=10)deny('Chave já cadastrada ou limite atingido.');s.keys.push({id:info.credential.id,userId,publicKey:Buffer.from(info.credential.publicKey).toString('base64url'),counter:info.credential.counter,transports:info.credential.transports||[],label:typeof body.label==='string'?body.label.trim().slice(0,80)||'Meu aparelho':'Meu aparelho',createdAt:new Date().toISOString(),backedUp:info.credentialBackedUp,deviceType:info.credentialDeviceType});s.audit.push({id:randomUUID(),userId,action:'passkey.register',at:new Date().toISOString()});});return reply({ok:true},{'Set-Cookie':cookie(challengeName,'',0)});
  }
  if(action==='revoke'&&req.method==='POST'){
   await store.change(s=>{if(!s.keys.some(k=>k.id===body.id&&k.userId===userId))deny('Chave não encontrada.',404);s.keys=s.keys.filter(k=>k.id!==body.id||k.userId!==userId);s.sessions=s.sessions.filter(x=>x.userId!==userId);s.revokedBefore[userId]=Date.now();s.audit.push({id:randomUUID(),userId,action:'passkey.revoke',at:new Date().toISOString()});});return reply({ok:true},{'Set-Cookie':cookie(sessionName,'',0)});
  }
  deny('Rota não encontrada.',404);
 }catch(e){return Response.json({error:e.status?e.message:'Não foi possível validar a chave. Tente novamente ou use seu acesso original.'},{status:e.status||400,headers:{'Cache-Control':'no-store, private'}});}}
 return {handler,identity,allowed};
}
