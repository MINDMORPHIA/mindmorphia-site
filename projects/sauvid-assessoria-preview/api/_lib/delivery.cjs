const crypto=require('node:crypto');
function verify(body,headers,secret,now=Date.now()){
 const id=headers['svix-id']||'',timestamp=headers['svix-timestamp']||'',signatures=headers['svix-signature']||'';
 if(typeof id!=='string'||typeof timestamp!=='string'||typeof signatures!=='string'||!secret?.startsWith('whsec_')||!/^[a-zA-Z0-9_-]{1,150}$/.test(id)||!/^\d{10}$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return null;
 const encoded=secret.slice(6),key=Buffer.from(encoded,'base64');
 if(key.length<16||key.toString('base64').replace(/=+$/,'')!==encoded.replace(/=+$/,'').replaceAll('-','+').replaceAll('_','/'))return null;
 const expected=crypto.createHmac('sha256',key).update(id+'.'+timestamp+'.'+body).digest();
 for(const sig of signatures.split(' ').slice(0,10)){const [v,s]=sig.split(',');if(v!=='v1'||!s)continue;const b=Buffer.from(s,'base64');if(b.length===expected.length&&crypto.timingSafeEqual(b,expected))return id;}return null;
}
const states={'email.sent':'accepted','email.delivered':'delivered','email.bounced':'bounced','email.complained':'complained','email.failed':'failed','email.suppressed':'failed'};
async function apply(db,event,id){
 const state=states[event.type];if(!state)return {ignored:true};const provider=event.data?.email_id,time=Date.parse(event.created_at||'');
 if(typeof provider!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(provider)||!Number.isFinite(time)||time>Date.now()+300000)throw Object.assign(new Error('Evento inválido.'),{statusCode:400});
 const row=(await db.query('SELECT id,delivery_status,provider_event_at FROM communication_recipients WHERE provider_id=$1 FOR UPDATE',[provider])).rows[0];
 if(!row){const inFlight=(await db.query("SELECT id FROM communication_recipients WHERE state='sending' LIMIT 1")).rows.length;return {retry:!!inFlight,ignored:!inFlight};}
 const added=await db.query('INSERT INTO communication_delivery_events(id,recipient_id,event_type,event_at) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING RETURNING id',[id,row.id,event.type,new Date(time)]);if(!added.rowCount)return {duplicate:true};
 if(row.provider_event_at&&new Date(row.provider_event_at).getTime()>=time)return {stale:true};
 const next=row.delivery_status==='complained'?row.delivery_status:state==='accepted'&&['delivered','bounced','failed'].includes(row.delivery_status)?row.delivery_status:state;
 await db.query('UPDATE communication_recipients SET delivery_status=$2,provider_event_at=$3 WHERE id=$1',[row.id,next,new Date(time)]);return {updated:true};
}
module.exports={verify,apply};
