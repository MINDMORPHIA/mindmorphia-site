import {productCard,kind} from './products.js';
const containers=[...document.querySelectorAll('[data-home-products]')];
try{
 const r=await fetch('/api/catalog',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Catalog unavailable');const data=await r.json();
 for(const container of containers){const products=data.products.filter(p=>kind(p)===container.dataset.homeProducts);container.innerHTML=products.map(p=>productCard(p,{direct:true})).join('')||'<p>Nenhuma oferta disponível nesta categoria.</p>';}
}catch{for(const container of containers)container.innerHTML='<p>Não foi possível carregar as ofertas. <a href="/catalogo">Abrir o catálogo</a> ou <a href="#solicitacao">falar com a equipe</a>.</p>';}
