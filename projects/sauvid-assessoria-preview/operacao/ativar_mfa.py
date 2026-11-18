"""Executar uma vez na máquina privada de Junior. Nunca enviar a senha ou o fator pelo chat."""
import getpass,json,os,urllib.request,uuid,sys
url=os.environ['SV_AUTH_URL'].rstrip('/');assert url.startswith('https://')
key=os.environ['SV_AUTH_PUBLIC_KEY']
def call(path,d,t=key):
 req=urllib.request.Request(url+'/auth/v1/'+path,data=json.dumps(d).encode(),headers={'apikey':key,'Authorization':'Bearer '+t,'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=10) as r:return json.load(r)
a=call('token?grant_type=password',dict(email=input('E-mail verificado: '),password=getpass.getpass('Senha: ')))
if a['user']['id']!=os.environ['SV_ADMIN_SUBJECT']:sys.exit('Conta diferente da atribuída a Junior.')
t=a['access_token']
if any(f.get('status')=='verified' for f in a['user'].get('factors',[])):sys.exit('Já existe fator verificado.')
f=call('factors',{'factor_type':'totp','friendly_name':'SAUVID '+str(uuid.uuid4())[:8]},t)
print('Adicione manualmente ao seu autenticador. Chave privada temporariamente visível nesta tela:',f['totp']['secret'])
p='factors/'+str(uuid.UUID(f['id']));c=call(p+'/challenge',{},t)
call(p+'/verify',{'challenge_id':c['id'],'code':getpass.getpass('Código atual: ')},t);print('Autenticador verificado. Feche este terminal privado.')
