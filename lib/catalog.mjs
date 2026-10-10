export const digitalCatalog = [
 {id:'canva-pro-12',name:'Canva Pro · 12 meses',category:'Acessos digitais',kind:'digital_access',family:'canva',durationMonths:12,price:9990,active:true,image:'/commerce/offers/canva-planos.png',description:'Design profissional, templates e recursos premium.',scope:'Canva Pro por 12 meses. Ativação por link na conta do cliente após pagamento confirmado.'},
 {id:'canva-pro-24',name:'Canva Pro · 24 meses',category:'Acessos digitais',kind:'digital_access',family:'canva',durationMonths:24,price:12990,active:true,image:'/commerce/offers/canva-pro.png',description:'Mais tempo para criar com os recursos do Canva Pro.',scope:'Canva Pro por 24 meses. Ativação por link na conta do cliente após pagamento confirmado.'},
 {id:'google-ai-pro-18',name:'Google AI Pro · 18 meses',category:'Acessos digitais',kind:'digital_access',family:'google',durationMonths:18,price:24990,active:true,image:'/commerce/offers/google-ai-preco.png',secondaryImage:'/commerce/offers/google-ai-pro.png',description:'Inteligência artificial, armazenamento e recursos premium.',scope:'Google AI Pro por 18 meses. Ativação por link na conta do cliente após pagamento confirmado.'}
];
export const mediaCatalog = [
 {id:'midia-avulsa-4990',name:'Serviço de mídia · Opção 1',category:'Mídia avulsa',kind:'custom_media',price:4990,active:true,description:'Para um serviço eventual combinado com a equipe: vídeo, foto, montagem ou outra criação.',scope:'Escopo combinado previamente com o Mind Marketing. Prazo de entrega: até 5 dias úteis ou o prazo combinado entre o cliente e o Mind Marketing.'},
 {id:'midia-avulsa-9990',name:'Serviço de mídia · Opção 2',category:'Mídia avulsa',kind:'custom_media',price:9990,active:true,description:'Uma opção de pagamento para uma criação personalizada orientada pela equipe.',scope:'Escopo combinado previamente com o Mind Marketing. Prazo de entrega: até 5 dias úteis ou o prazo combinado entre o cliente e o Mind Marketing.'}
];
export const catalogMigration='digital-and-media-2026-10-09';
export function addDigitalCatalog(state){if(state.catalogMigrations?.includes(catalogMigration))return;for(const p of [...digitalCatalog,...mediaCatalog])if(!state.catalog.some(x=>x.id===p.id))state.catalog.push(structuredClone(p));state.catalogMigrations=[...(state.catalogMigrations||[]),catalogMigration];}
export const initialCatalog = [
 {id:'impacto',name:'Impacto',category:'Websites',price:99700,active:true,description:'Uma landing page com direção personalizada.',scope:'1 página, referência de até 5 seções.'},
 {id:'autoridade',name:'Autoridade',category:'Websites',price:199700,active:true,description:'Presença institucional para apresentar sua marca.',scope:'Até 5 páginas institucionais.'},
 {id:'magnitude',name:'Magnitude',category:'Websites',price:249700,active:true,description:'Uma presença completa, com opção de e-commerce.',scope:'Até 8 páginas. Na modalidade e-commerce, catálogo inicial de até 20 produtos.'},
 ...digitalCatalog,...mediaCatalog
];
export const termsVersion='MM-COM-2026-10-09-v2';
const invalid=message=>Object.assign(new Error(message),{status:400});
export function quote(state,input) {
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>10)throw invalid('Escolha pelo menos um serviço.');
 const seen=new Set(),families=new Set();
 const items=input.items.map(line=>{if(!line||typeof line!=='object')throw invalid('Serviço inválido.');const p=state.catalog.find(p=>p.id===line.id&&p.active);if(!p||seen.has(p.id))throw invalid('Serviço indisponível.');seen.add(p.id);if(p.kind==='digital_access'){if(families.has(p.family))throw invalid('Escolha um único período de cada acesso digital por pedido.');families.add(p.family);}const quantity=Number(line.quantity);if(!Number.isInteger(quantity)||quantity<1||quantity>(p.kind==='digital_access'?1:5))throw invalid('Quantidade inválida. Acessos digitais são individuais por conta.');return {id:p.id,name:p.name,scope:p.scope,price:p.price,quantity,kind:p.kind||'website',durationMonths:p.durationMonths||null};});
 const subtotal=items.reduce((n,p)=>n+p.price*p.quantity,0);
 const code=String(input.coupon||'').trim().toUpperCase();
 const coupon=code?state.coupons.find(c=>c.code===code&&c.active&&(!c.expiresAt||Date.parse(c.expiresAt)>Date.now())):null;
 if(code&&!coupon)throw invalid('Cupom inválido ou expirado.');
 const discount=coupon?Math.floor(subtotal*coupon.percent/100):0;
 const total=subtotal-discount;
 const mode=input.mode==='deposit'?'deposit':'full';
 if(mode==='deposit'&&items.some(p=>p.kind!=='website'))throw invalid('Acessos digitais e mídia avulsa exigem pagamento integral. Separe os websites em outro pedido para pagar entrada.');
 const due=mode==='deposit'?Math.ceil(total/2):total;
 return {items,subtotal,discount,coupon:code,total,due,balance:total-due,mode,currency:'BRL',shipping:0,termsVersion};
}
