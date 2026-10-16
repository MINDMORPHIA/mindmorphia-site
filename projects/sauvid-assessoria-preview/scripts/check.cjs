const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const h=fs.readFileSync('index.html','utf8');for(const match of h.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
new vm.Script(fs.readFileSync('gestao.js','utf8'));new vm.Script(fs.readFileSync('pendencias.js','utf8'));
new vm.Script(fs.readFileSync('comunicacoes.js','utf8'));
for(const f of fs.readdirSync('api').filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync('api/'+f,'utf8'));
for(const f of fs.readdirSync('assets').filter(x=>x.endsWith('.webp'))){const b=fs.readFileSync('assets/'+f);assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WEBP');}
assert.ok(!h.includes('482913'));assert.ok(!h.includes('id="adminView"'));assert.ok(h.includes('consentLead'));assert.ok(h.includes('/gestao.html'));
console.log('PASS: JavaScript, imagens originais, entrada de gestão, ciência do tratamento e remoção de demonstrações.');
