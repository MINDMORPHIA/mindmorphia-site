'use strict';
const crypto=require('crypto');

const COOKIE='sauvid_demo_session';

function secret(){
  const value=process.env.SAUVID_SESSION_SECRET;
  if(!value||value.length<32) throw new Error('SAUVID_SESSION_SECRET não configurado.');
  return value;
}
function b64(input){return Buffer.from(input).toString('base64url')}
function sign(payload){return crypto.createHmac('sha256',secret()).update(payload).digest('base64url')}
function safeEqual(a,b){
  const ab=Buffer.from(String(a));const bb=Buffer.from(String(b));
  return ab.length===bb.length && crypto.timingSafeEqual(ab,bb);
}
function createSession(){
  const payload=b64(JSON.stringify({sub:'demo-client',scope:['client:read'],iat:Date.now(),exp:Date.now()+60*60*1000}));
  return payload+'.'+sign(payload);
}
function verifySession(token){
  if(!token||!token.includes('.')) return null;
  const [payload,sig]=token.split('.');
  const expected=sign(payload);
  if(!safeEqual(sig,expected)) return null;
  try{
    const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    if(data.exp<Date.now()||data.sub!=='demo-client') return null;
    return data;
  }catch{return null}
}
function parseCookies(req){
  const raw=req.headers.cookie||'';
  return Object.fromEntries(raw.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}));
}
function sessionFromRequest(req){return verifySession(parseCookies(req)[COOKIE])}
function sessionCookie(token){return `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`}
function clearCookie(){return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`}
function demoCodeMatches(input){
  const expected=process.env.SAUVID_DEMO_CODE;
  if(!expected) return false;
  return safeEqual(String(input||''),String(expected));
}
module.exports={createSession,sessionFromRequest,sessionCookie,clearCookie,demoCodeMatches};
