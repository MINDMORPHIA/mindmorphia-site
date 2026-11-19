const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.SAUVID_QA_PLAYWRIGHT||'playwright-core');
async function run(){
 const access=JSON.parse(await fs.readFile(process.env.SAUVID_QA_ACCESS,'utf8')),out=process.env.SAUVID_QA_CAPTURES;
 if(!/^http:\/\/localhost:\d+$/.test(access.origin))throw Error('Use a prévia local.');
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.SAUVID_QA_BROWSER,headless:true});
 try{
 const admin=await browser.newPage({viewport:{width:1280,height:900}}),client=await browser.newPage({viewport:{width:390,height:844}});
 async function login(page,role){
  await page.goto(access.origin+(role==='admin'?'/gestao/credito':'/acompanhar'));
  const form=page.locator('#loginForm');
  await form.locator('[name=email]').fill(access[role].email);await form.locator('[name=password]').fill(access[role].password);
  if(role==='client')await form.locator('[name=document]').fill('52998224725');
  await form.getByRole('button').click();await page.locator('#workspace').waitFor();
 }
 await login(admin,'admin');
 await admin.getByRole('button',{name:'Cadastrar atendimento'}).click();
 const form=admin.locator('#newCredit');
 for(const [key,value] of Object.entries({name:'Cliente fictício de homologação',email:access.client.email,document:'52998224725',protocol:'QA-'+Date.now(),scope:'Conferência manual dos quatro órgãos'}))await form.locator('[name='+key+']').fill(value);
 await form.locator('[name=verified]').check();await form.getByRole('button').click();
 await admin.locator('#grantCredit').click();await admin.getByText('Vínculo ativo.',{exact:true}).waitFor();
 await login(client,'client');await client.getByRole('button',{name:'Acompanhar',exact:true}).first().click();await client.locator('.org-grid').waitFor();
 const edit=admin.locator('#creditEdit');
 const fill=async(key,value)=>edit.locator('[name='+key+']').fill(value);
 await edit.locator('[name=status]').selectOption('partial');await fill('extent','Registro fictício 01');await fill('source','Conferência documental fictícia');await fill('checked','2026-11-18');await fill('message','Baixa parcial do registro fictício 01.');await fill('note','Nota exclusiva da gestão.');
 await edit.getByRole('button').click();await admin.locator('#publishCredit').waitFor();
 assert.equal(await client.getByText('Baixa parcial do registro fictício 01.').count(),0);
 await admin.locator('#creditReview').scrollIntoViewIfNeeded();await admin.locator('#notice').waitFor({state:'hidden'});await admin.locator('#creditReview').screenshot({path:path.join(out,'01-previa-administrativa.png')});
 await admin.locator('#publishCredit').focus();await admin.keyboard.press('Enter');await admin.getByText('Atualização publicada.',{exact:true}).waitFor();
 await client.reload();await client.getByRole('button',{name:'Acompanhar',exact:true}).first().click();await client.locator('.org-grid').getByText('Baixa parcial',{exact:true}).waitFor();
 assert.equal(await client.getByText('Nota exclusiva da gestão.').count(),0);
 assert.equal(await client.locator('.org-grid').getByText('A confirmar',{exact:true}).count(),3);
 assert.ok(await client.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 await client.locator('.org-grid').scrollIntoViewIfNeeded();await client.screenshot({path:path.join(out,'02-cliente-celular.png')});
 console.log('PASS: cadastro e vínculo pela gestão, prévia, publicação, nova consulta, cartões independentes e largura móvel.');
 }finally{await browser.close();}
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
