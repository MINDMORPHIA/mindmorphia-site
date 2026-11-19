// Executar no servidor confiável, com o contato e o documento verificados.
const crypto=require('node:crypto');
const fs=require('node:fs/promises');
const {getPool}=require('../api/_lib/database.cjs');
const {lookup,seal}=require('../api/_lib/security.cjs');
const {validDocument}=require('../api/_lib/registrations.cjs');
const {generateTemporaryPassword,temporaryHash}=require('../api/_lib/first-access.cjs');
async function issue(){
 const email=String(process.env.SAUVID_CLIENT_EMAIL||'').trim().toLowerCase(),doc=String(process.env.SAUVID_CLIENT_DOCUMENT||'');
 const name=String(process.env.SAUVID_CLIENT_NAME||'').trim(),out=process.env.SAUVID_ACCESS_OUTPUT;
 if(!out||!validDocument(doc)||!name||!/^\S+@\S+\.\S+$/.test(email))throw Error('Confira os dados de emissão.');
 const conn=await getPool().connect(),password=generateTemporaryPassword();
 try{
  await conn.query('BEGIN');
  await conn.query('SELECT pg_advisory_xact_lock(hashtext($1))',[email]);
  if((await conn.query('SELECT id FROM "user" WHERE lower(email)=$1',[email])).rowCount)throw Error('Conta existente. Preserve a senha e o papel atuais.');
  const client=(await conn.query(`INSERT INTO clients(full_name,email,cpf_lookup_hash,cpf_ciphertext,cpf_last4,person_type,verified_at) VALUES($1,$2,$3,$4,$5,$6,now()) ON CONFLICT(cpf_lookup_hash) DO UPDATE SET verified_at=now() WHERE clients.active AND lower(clients.email)=excluded.email RETURNING id`,[name,email,lookup(doc),seal(doc),doc.slice(-4),doc.length===11?'PF':'PJ'])).rows[0];
  if(!client)throw Error('O cadastro requer conferência.');
  await conn.query("UPDATE access_invites SET expires_at=now() WHERE client_id=$1 AND email=$2 AND role='client' AND used_at IS NULL",[client.id,email]);
  await conn.query("INSERT INTO access_invites(token_hash,email,full_name,role,client_id,expires_at) VALUES($1,$2,$3,'client',$4,now()+interval '48 hours')",[temporaryHash(email,password),email,name,client.id]);
  await fs.writeFile(out,JSON.stringify({email,password},null,2),{flag:'wx',mode:0o600});
  await conn.query('COMMIT');
 }catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}
}
issue().catch(e=>{console.error(e.code||e.message);process.exitCode=1;}).finally(()=>getPool().end());
