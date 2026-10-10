import {mkdir,copyFile,cp,readFile} from 'node:fs/promises';
await import('./pages.mjs');
await mkdir('dist',{recursive:true});for(const name of ['index.html','simbolo.png','mindmorphia.png','robots.txt','sitemap.xml'])await copyFile(name,`dist/${name}`);for(const dir of ['commerce','projects','sites'])await cp(dir,`dist/${dir}`,{recursive:true});
for(const name of ['commerce/catalogo.html','commerce/checkout.html','commerce/acesso.html','commerce/portal.html']){const s=await readFile(name,'utf8');if(!s.includes('lang="pt-BR"')||!s.includes('viewport'))throw new Error(`HTML incompleto: ${name}`);}console.log('Build estático e portal preparados. Funções API permanecem no diretório api.');
