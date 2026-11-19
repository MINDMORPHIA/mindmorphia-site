const crypto=require('node:crypto');
const {rateLimit,lookup}=require('./security.cjs');
const {validDocument}=require('./registrations.cjs');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function temporaryHash(email,password){
 return crypto.createHmac('sha256',process.env.SAUVID_LOOKUP_SECRET).update(JSON.stringify(['first-access',email,password])).digest('hex');
}
function generateTemporaryPassword(){
 return 'SV-'+Array.from({length:4},()=>String(crypto.randomInt(10000)).padStart(4,'0')).join('-');
}
async function exchangeTemporary(db,req,body){
 if(!/^SV-(?:\d{4}-){3}\d{4}$/.test(body.password))return null;
 const email=String(body.email||'').trim().toLowerCase(),document=String(body.document||'').replace(/\D/g,'');
 await rateLimit(db,req,'first-access',5);
 if(!validDocument(document))return null;
 const token=crypto.randomBytes(36).toString('base64url');
 const result=await db.query(`UPDATE access_invites i SET token_hash=$1,expires_at=least(i.expires_at,now()+interval '15 minutes')
 FROM clients c WHERE i.token_hash=$2 AND i.email=$3 AND lower(c.email)=$3 AND i.role='client' AND i.client_id=c.id
 AND c.active AND c.cpf_lookup_hash=$4 AND i.used_at IS NULL AND i.expires_at>now() RETURNING i.id`,
 [hash(token),temporaryHash(email,body.password),email,lookup(document)]);
 return result.rowCount?token:null;
}
module.exports={temporaryHash,generateTemporaryPassword,exchangeTemporary};
