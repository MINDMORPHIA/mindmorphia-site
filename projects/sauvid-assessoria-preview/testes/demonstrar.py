"""Somente loopback. Banco temporário e identidades fictícias; não implantar na internet."""
from http.server import HTTPServer,BaseHTTPRequestHandler
import json,sys,webbrowser
from test_portal import Portal,ROOT
from portal_credito.core import Problem
t=Portal();t.setUp()
class Demo(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def send(self,data,mime='application/json',code=200,cookie=''):
  self.send_response(code);self.send_header('Content-Type',mime);self.send_header('Cache-Control','no-store')
  if cookie:self.send_header('Set-Cookie','persona='+cookie+'; Path=/; HttpOnly; SameSite=Strict')
  self.end_headers();self.wfile.write(data)
 def do_GET(self):
  if self.headers.get('Host')!='127.0.0.1:8765':return self.send(b'',code=403)
  if self.path in ['/gestao','/cliente','/cliente-b','/acompanhar','/']:
   persona={'/gestao':'gestao','/cliente':'cliente','/cliente-b':'b'}.get(self.path,'');s=(ROOT/'acompanhar.html').read_text().replace('<main>','<main><p><b>Demonstração local · dados fictícios</b> | <a href="/gestao">Junior</a> · <a href="/cliente">Cliente A</a> · <a href="/cliente-b">Cliente B</a></p>')
   return self.send(s.encode(),'text/html; charset=utf-8',cookie=persona)
  if self.path=='/credito.js':return self.send((ROOT/'credito.js').read_bytes(),'text/javascript; charset=utf-8')
  self.send(b'',code=404)
 def do_POST(self):
  if self.headers.get('Origin')!='http://127.0.0.1:8765' or self.headers.get('Host')!='127.0.0.1:8765' or self.path!='/api/credito':return self.send(b'',code=403)
  try:
   n=int(self.headers.get('Content-Length',0));assert 0<n<2_800_000
   data=json.loads(self.rfile.read(n));op=data.pop('op')
   p=self.headers.get('Cookie','');who=None if 'persona=gestao' in p else t.a if 'persona=cliente' in p else t.b
   if op=='logout':return self.send(b'{}',cookie='sair')
   r={'admin':who is None,'mfa':False} if op=='identity' else t.go(op,who,**data)
   if isinstance(r,bytes):return self.send(r,'application/pdf')
   self.send(json.dumps(r).encode())
  except Exception as e:self.send(json.dumps({'error':str(e) if isinstance(e,Problem) else 'Solicitação inválida.'}).encode(),code=getattr(e,'code',400))
if __name__=='__main__':
 try:
  server=HTTPServer(('127.0.0.1',8765),Demo);print('Demonstração em http://127.0.0.1:8765/gestao (Ctrl+C para encerrar).',flush=True);webbrowser.open('http://127.0.0.1:8765/gestao');server.serve_forever()
 finally:t.tearDown()
