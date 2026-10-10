export const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n/100);
export const kind=p=>p.kind||'website';
const images={impacto:'/commerce/offers/impacto.png',autoridade:'/commerce/offers/autoridade.png',magnitude:'/commerce/offers/magnitude.png'};
export function productCard(p,{direct=false}={}){
 const type=kind(p),image=p.image||images[p.id];
 const label=type==='website'?'Website':type==='digital_access'?'Assinatura digital':'Mind Marketing';
 const action=direct?`<a class="product-buy" href="/checkout?produto=${encodeURIComponent(p.id)}">Escolher ${esc(p.name)}</a>`:`<button class="product-buy" data-add="${esc(p.id)}">Escolher ${esc(p.name)}</button>`;
 return `<article class="product-card ${type==='website'?'product-website':''}" data-product-id="${esc(p.id)}">${image?`<div class="product-art"><img src="${esc(image)}" alt="Arte original MINDMORPHIA ${esc(p.name)}" loading="lazy" decoding="async"></div>`:`<div class="product-media-art" aria-hidden="true"><img src="/simbolo.png" alt="" class="product-media-symbol"><span>Mind<br>Marketing.</span><span class="product-media-line">Criação sob demanda</span></div>`}<div class="product-content"><span class="product-category">${label}${p.durationMonths?` / ${p.durationMonths} meses`:''}</span><h3>${esc(p.name)}</h3><p class="product-description">${esc(p.description)}</p><div class="product-price">${money(p.price)}</div><p class="product-payment">${type==='digital_access'?'Pagamento único pelo período escolhido.':type==='custom_media'?'Pagamento único pelo serviço combinado.':'Valor do plano. Integral ou entrada de 50%.'}</p><p class="product-scope">${esc(p.scope)}</p>${type==='website'?'<p class="product-scope">Hospedagem e manutenção por 12 meses, nos limites da contratação.</p>':''}${p.activationDeadline?`<p class="product-scope">${esc(p.activationDeadline)}</p>`:''}${action}${p.secondaryImage?`<details><summary>Ver apresentação do serviço</summary><img class="product-extra-art" src="${esc(p.secondaryImage)}" alt="Apresentação original ${esc(p.name)}" loading="lazy"></details>`:''}</div></article>`;
}
export function chooseProduct(cart,product,products){
 const next=cart.map(x=>({...x}));
 if(product.kind==='digital_access')return [...next.filter(x=>!products.some(p=>p.id===x.id&&p.kind==='digital_access'&&p.family===product.family)),{id:product.id,quantity:1}];
 const existing=next.find(x=>x.id===product.id);if(existing)existing.quantity=Math.min(5,existing.quantity+1);else next.push({id:product.id,quantity:1});return next;
}
