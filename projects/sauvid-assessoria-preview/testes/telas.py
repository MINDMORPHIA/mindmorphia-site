"""Demonstração local: navegador real e banco de teste. Identidade simulada somente neste teste."""
import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright
from test_portal import Portal,ROOT,STATUS
t=Portal();t.setUp()
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for role in ['gestao','cliente']:
   page=b.new_page(viewport={'width':1100 if role=='gestao' else 390,'height':850},locale='pt-BR')
   def route(r):
    path=r.request.url.split('teste.local')[1]
    if path=='/api/credito':
     d=r.request.post_data_json;op=d.pop('op')
     if op=='identity':result={'admin':role=='gestao','mfa':False}
     else:result=t.go(op,None if role=='gestao' else t.a,**d)
     r.fulfill(json=result)
    else:
     file=ROOT/('credito.js' if path=='/credito.js' else 'acompanhar.html');r.fulfill(body=file.read_bytes(),content_type='text/javascript; charset=utf-8' if file.suffix=='.js' else 'text/html; charset=utf-8')
   page.route('https://teste.local/**',route)
   page.goto('https://teste.local/acompanhar')
   if role=='gestao':
    page.get_by_role('button',name='Titular fictício A',exact=False).click();page.get_by_role('button',name='P1-TESTE').click()
    page.get_by_label('Situação',exact=True).select_option('Baixa parcial')
    for label,val in [('Abrangência','Apenas o apontamento fictício 01'),('Origem da informação','Análise manual de demonstração'),('Data da verificação','2026-11-17'),('Mensagem ao cliente','Baixa parcial registrada para o item 01.')]:page.get_by_label(label,exact=False).fill(val)
    page.get_by_role('button',name='Salvar rascunho').click();page.get_by_role('button',name='Revisar e publicar').wait_for()
    page.screenshot(path='/mnt/data/SAUVID_Gestao.png',full_page=True);page.once('dialog',lambda dialog:dialog.accept());page.get_by_role('button',name='Revisar e publicar').click();page.get_by_text('Publicado:',exact=False).wait_for()
   else:
    page.get_by_text('Baixa parcial',exact=False).first.wait_for();page.reload();page.get_by_text('Baixa parcial',exact=False).first.wait_for()
    assert page.locator('.card').count()==4
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path='/mnt/data/SAUVID_Cliente.png',full_page=True)
   page.close()
  b.close()
finally:t.tearDown()
