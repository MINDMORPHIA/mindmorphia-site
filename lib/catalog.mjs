export const initialCatalog = [
 {id:'impacto',name:'Impacto',category:'Websites',price:99700,active:true,description:'Uma landing page com direção personalizada.',scope:'1 página, referência de até 5 seções.'},
 {id:'autoridade',name:'Autoridade',category:'Websites',price:199700,active:true,description:'Presença institucional para apresentar sua marca.',scope:'Até 5 páginas institucionais.'},
 {id:'magnitude',name:'Magnitude',category:'Websites',price:249700,active:true,description:'Uma presença completa, com opção de e-commerce.',scope:'Até 8 páginas. Na modalidade e-commerce, catálogo inicial de até 20 produtos.'}
];
export const termsVersion='MM-WEB-2026-10-08-v1';
export function quote(state,input) {
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>10)throw new Error('Escolha pelo menos um serviço.');
 const seen=new Set();
 const items=input.items.map(line=>{const p=state.catalog.find(p=>p.id===line.id&&p.active);if(!p||seen.has(p.id))throw new Error('Serviço indisponível.');seen.add(p.id);const quantity=Number(line.quantity);if(!Number.isInteger(quantity)||quantity<1||quantity>5)throw new Error('Quantidade inválida.');return {id:p.id,name:p.name,scope:p.scope,price:p.price,quantity};});
 const subtotal=items.reduce((n,p)=>n+p.price*p.quantity,0);
 const code=String(input.coupon||'').trim().toUpperCase();
 const coupon=code?state.coupons.find(c=>c.code===code&&c.active&&(!c.expiresAt||Date.parse(c.expiresAt)>Date.now())):null;
 if(code&&!coupon)throw new Error('Cupom inválido ou expirado.');
 const discount=coupon?Math.floor(subtotal*coupon.percent/100):0;
 const total=subtotal-discount;
 const mode=input.mode==='deposit'?'deposit':'full';
 const due=mode==='deposit'?Math.ceil(total/2):total;
 return {items,subtotal,discount,coupon:code,total,due,balance:total-due,mode,currency:'BRL',shipping:0,termsVersion};
}
