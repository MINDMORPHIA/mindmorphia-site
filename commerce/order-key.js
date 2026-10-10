let currentAttempt;
export async function orderSubmissionKey(payload,userId,storage=globalThis.sessionStorage){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({userId,payload})));
 const fingerprint=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
 let previous=currentAttempt;
 try{previous=JSON.parse(storage?.getItem('mm-order-attempt')||'null')||previous;}catch{}
 if(previous?.fingerprint===fingerprint&&/^[a-zA-Z0-9-]{16,100}$/.test(previous.key))return previous.key;
 currentAttempt={fingerprint,key:crypto.randomUUID()};
 try{storage?.setItem('mm-order-attempt',JSON.stringify(currentAttempt));}catch{}
 return currentAttempt.key;
}
