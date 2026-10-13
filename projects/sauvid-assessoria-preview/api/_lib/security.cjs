const crypto=require('node:crypto');
function problem(statusCode,message){return Object.assign(new Error(message),{statusCode});}
function originCheck(req){
  const expected=process.env.SAUVID_APP_ORIGIN||'https://sauvid-assessoria.vercel.app';
  const allowed=new Set([expected,'https://sauvid-assessoria.vercel.app','https://www.sauvid.ass.com.br']);
  if(process.env.NODE_ENV!=='production')allowed.add('http://localhost:4173');
  const origin=req.headers.origin;
  if(!origin||!allowed.has(origin)||req.headers['sec-fetch-site']==='cross-site')throw problem(403,'Origem da solicitação inválida.');
}
function dataKey(){const k=Buffer.from(process.env.SAUVID_DATA_KEY||'','base64');if(k.length!==32)throw problem(503,'Proteção de dados em ativação.');return k;}
function seal(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',dataKey(),iv);const b=Buffer.concat([cipher.update(String(value),'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),b].map(x=>x.toString('base64')).join('.');}
function unseal(value){const [iv,tag,b]=value.split('.').map(x=>Buffer.from(x,'base64'));const d=crypto.createDecipheriv('aes-256-gcm',dataKey(),iv);d.setAuthTag(tag);return Buffer.concat([d.update(b),d.final()]).toString('utf8');}
function lookup(document){if(!process.env.SAUVID_LOOKUP_SECRET)throw problem(503,'Proteção de dados em ativação.');return crypto.createHmac('sha256',process.env.SAUVID_LOOKUP_SECRET).update(document).digest('hex');}
function documentOk(v){
 if(!/^\d{11}$/.test(v)||/^(\d)\1+$/.test(v))return false;
 for(let n=9;n<=10;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(v[i])*(n+1-i);let check=(sum*10)%11;if(check===10)check=0;if(check!==Number(v[n]))return false;}return true;
}
function text(v,min,max,label){const s=String(v??'').trim();if(s.length<min||s.length>max)throw problem(400,`Confira o campo ${label}.`);return s;}
function uuid(v){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v||''))throw problem(400,'Identificador inválido.');return v;}
function choice(v,allowed){if(!allowed.includes(v))throw problem(400,'Opção inválida.');return v;}
async function rateLimit(db,req,scope,max=10){
 const address=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();
 const key=crypto.createHmac('sha256',process.env.SAUVID_LOOKUP_SECRET||'local').update(scope+':'+address).digest('hex');
 const {rows}=await db.query("INSERT INTO request_limits(key,window_start,hits) VALUES($1,date_trunc('minute',now()),1) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN request_limits.window_start<date_trunc('minute',now()) THEN 1 ELSE request_limits.hits+1 END,window_start=date_trunc('minute',now()) RETURNING hits",[key]);
 if(rows[0].hits>max)throw problem(429,'Muitas tentativas. Aguarde um minuto e tente novamente.');
}
module.exports={problem,originCheck,seal,unseal,lookup,documentOk,text,uuid,choice,rateLimit};
