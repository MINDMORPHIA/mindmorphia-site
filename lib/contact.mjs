export const contactTypes=['Um projeto','Uma parceria','Uma pergunta','Uma possibilidade'];
export function contactInput(body){
 const error=message=>{throw Object.assign(new Error(message),{status:400});};
 const value=(key,max)=>{const v=body[key];if(typeof v!=='string'||v.trim().length>max)error('Confira os campos do contato.');return v.trim();};
 const name=value('name',100),email=value('email',254).toLowerCase(),message=value('message',1000),type=value('type',50);
 const phone=typeof body.phone==='string'?body.phone.replace(/\D/g,''):'';
 if(!name||!message||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!contactTypes.includes(type)||phone&&!/^\d{10,11}$/.test(phone))error('Informe nome, e-mail válido, tipo e mensagem. O WhatsApp é opcional.');
 if(!/^[a-zA-Z0-9-]{16,100}$/.test(body.key||''))error('Atualize a página e tente novamente.');
 return {name,email,message,type,phone,key:body.key};
}
