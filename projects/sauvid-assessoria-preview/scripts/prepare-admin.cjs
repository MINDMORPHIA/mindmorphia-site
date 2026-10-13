// Convite inicial do responsável informado pelo usuário. Token somente em memória.
const crypto=require('node:crypto'),http=require('node:http');
const {getPool}=require('../api/_lib/database.cjs');
(async()=>{
 const email=String(process.env.SAUVID_ADMIN_EMAIL||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Informe o e-mail do responsável no ambiente local.');
 if((await getPool().query('SELECT id FROM app_users WHERE email=$1',[email])).rows.length){console.log('Conta administrativa já cadastrada. Utilize a gestão.');await getPool().end();return;}
 const token=crypto.randomBytes(32).toString('base64url');
 await getPool().query('UPDATE access_invites SET expires_at=now() WHERE email=$1 AND used_at IS NULL',[email]);
 await getPool().query("INSERT INTO access_invites(token_hash,email,full_name,role,expires_at) VALUES($1,$2,'Gestão SAUVID','admin',now()+interval '48 hours')",[crypto.createHash('sha256').update(token).digest('hex'),email]);
 let consumed=false;
 http.createServer((req,res)=>{
  if(req.url!=='/iniciar'||consumed){res.writeHead(404);res.end('Página de ativação indisponível.');return;}
  consumed=true;res.writeHead(302,{'Location':'https://sauvid-assessoria.vercel.app/gestao.html#ativar='+token,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});res.end();
 }).listen(4174,'127.0.0.1',()=>console.log('Ativação administrativa pronta em http://localhost:4174/iniciar (senha escolhida pelo titular).'));
})().catch(()=>{console.error('Ativação inicial não concluída.');process.exitCode=1;});
