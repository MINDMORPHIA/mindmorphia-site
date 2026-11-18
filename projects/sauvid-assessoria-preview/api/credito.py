import base64,json,os,sys,urllib.request,urllib.error
from http.server import BaseHTTPRequestHandler
from http.cookies import SimpleCookie
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from portal_credito.core import execute,Problem,need
class handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_POST(self):
  cookie=None; db=None;code=200;mime='application/json; charset=utf-8'
  try:
   need(self.headers.get('Origin')=='https://'+self.headers.get('Host','') and self.headers.get_content_type()=='application/json','Origem inválida.',403)
   size=int(self.headers.get('Content-Length',0));need(0<size<2_800_000,'Tamanho inválido.',413);d=json.loads(self.rfile.read(size));need(isinstance(d,dict));op=d.get('op');need(isinstance(op,str))
   c=SimpleCookie();c.load(self.headers.get('Cookie',''));token=c['__Host-sv'].value if '__Host-sv' in c else ''
   def auth(path,data=None,bearer=''):
    url=os.environ['SV_AUTH_URL'].rstrip('/');need(url.startswith('https://'),'Configuração indisponível.',503)
    req=urllib.request.Request(url+'/auth/v1/'+path,data=json.dumps(data).encode() if data is not None else None,headers={'apikey':os.environ['SV_AUTH_PUBLIC_KEY'],'Authorization':'Bearer '+(bearer or os.environ['SV_AUTH_PUBLIC_KEY']),'Content-Type':'application/json'})
    try:
     with urllib.request.urlopen(req,timeout=8) as r:return json.load(r) if r.status!=204 and path!='logout' else {}
    except urllib.error.HTTPError as e:raise Problem('Não foi possível validar o acesso.',429 if e.code==429 else 401)
   def session(t,age):return '__Host-sv='+t+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+str(age)
   if op=='logout':
    cookie=session('',0)
    if token:auth('logout',{},token)
    out={'ok':True}
   elif op=='login':
    email=d.get('email');pwd=d.get('password');need(isinstance(email,str) and len(email)<=320 and isinstance(pwd,str) and len(pwd)<=500)
    a=auth('token?grant_type=password',{'email':email,'password':pwd});token=a['access_token'];cookie=session(token,min(1800,a['expires_in']))
    out={'ok':True}
   else:
    need(token,'Entre para continuar.',401);user=auth('user',bearer=token);actor=user['id'];isjunior=actor==os.environ['SV_ADMIN_SUBJECT']
    claims=json.loads(base64.urlsafe_b64decode(token.split('.')[1]+'==='));admin=isjunior and claims.get('aal')=='aal2'
    factors=[f for f in user.get('factors',[]) if f.get('status')=='verified' and f.get('factor_type')=='totp']
    if op=='identity':out={'admin':admin,'mfa':isjunior and not admin}
    elif op=='mfa':
     need(isjunior and factors,'Ative o autenticador na conta administrativa pelo procedimento de ativação.',403)
     from uuid import UUID
     f=str(UUID(factors[0]['id']));challenge=auth('factors/'+f+'/challenge',{},token)
     a=auth('factors/'+f+'/verify',{'challenge_id':challenge['id'],'code':d.get('code')},token);cookie=session(a['access_token'],min(1800,a['expires_in']));out={'ok':True}
    else:
     need(not isjunior or admin,'Confirme o segundo fator.',403)
     import psycopg
     from psycopg.rows import dict_row
     with psycopg.connect(os.environ['SV_DATABASE_URL'],row_factory=dict_row,connect_timeout=8) as db:
      db.execute('SET LOCAL search_path = sauvid_credito');out=execute(db,False,actor,admin,op,d)
   if isinstance(out,bytes):body=out;mime='application/pdf'
   else:body=json.dumps(out,ensure_ascii=False).encode()
  except Exception as e:
   if isinstance(e,Problem):code=e.code;msg=str(e)
   elif getattr(e,'sqlstate',None) in ('23505','40001','40P01'):code=409;msg='Registro duplicado ou alterado. Recarregue a ficha.'
   elif isinstance(e,(ValueError,TypeError)):code=400;msg='Solicitação inválida.'
   else:code=503;msg='Portal indisponível. Tente novamente mais tarde.'
   body=json.dumps({'error':msg}).encode()
  self.send_response(code);self.send_header('Content-Type',mime);self.send_header('Cache-Control','private, no-store');self.send_header('X-Content-Type-Options','nosniff')
  if mime=='application/pdf':self.send_header('Content-Disposition','attachment; filename="documento-sauvid.pdf"')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers();self.wfile.write(body)
