import base64, datetime as dt, hashlib, hmac, os, re, uuid
from zoneinfo import ZoneInfo
ORGS=('SPC','Serasa','Boa Vista','Cartório')
STATUS=('A confirmar','Em acompanhamento','Baixa informada','Baixa confirmada','Baixa parcial','Restrição identificada','Divergência/reprocessamento','Fora do escopo')
STAGES=('Recebido','Protocolado','Em acompanhamento','Encerrado')
class Problem(Exception):
 def __init__(self,msg,code=400):self.code=code;super().__init__(msg)
def need(ok,msg='Dados inválidos.',code=400):
 if not ok:raise Problem(msg,code)
def uid():return str(uuid.uuid4())
def now():return dt.datetime.now(dt.timezone.utc).isoformat()
def field(d,k,n=250,optional=False):
 s=d.get(k,'');need(isinstance(s,str) and len(s.strip())<=n and (optional or s.strip()),'Confira o campo '+k+'.');return s.strip()
def civil(d,k,optional=False):
 s=field(d,k,10,optional)
 if s:
  try:v=dt.date.fromisoformat(s)
  except ValueError:raise Problem('Data inválida.')
  need(v.isoformat()==s and v<=dt.datetime.now(ZoneInfo('America/Sao_Paulo')).date(),'Confira a data.')
 return s
def lookup(doc):
 digits=re.sub(r'[. /-]','',doc);need(digits.isascii() and digits.isdigit() and len(digits) in (11,14),'Informe CPF ou CNPJ.')
 need(len(set(digits))>1,'Documento inválido.')
 for pos in (len(digits)-2,len(digits)-1):
  weights=list(range(pos+1,1,-1)) if len(digits)==11 else ([5,4,3,2,9,8,7,6,5,4,3,2] if pos==12 else [6,5,4,3,2,9,8,7,6,5,4,3,2])
  x=sum(int(a)*b for a,b in zip(digits[:pos],weights))%11;need(int(digits[pos])==(0 if x<2 else 11-x),'Documento inválido.')
 secret=os.environ['SV_DOC_KEY'];need(len(secret)>=32,'Configuração indisponível.',503)
 return hmac.new(secret.encode(),digits.encode(),hashlib.sha256).hexdigest(),digits[-4:],('PF' if len(digits)==11 else 'PJ')
def execute(db,sqlite,actor,admin,op,d):
 def q(sql,*args):return db.execute(sql if sqlite else sql.replace('?','%s'),args)
 def rows(sql,*args):return [dict(x) for x in q(sql,*args).fetchall()]
 def one(sql,*args):
  r=rows(sql,*args);need(r,'Registro indisponível.',404);return r[0]
 def audit(verb,key):q('insert into sv_audit values(?,?,?,?,?)',uid(),actor,verb,key,now())
 pub='id,caseid,org,version,status,scope,fact,checked,message,published,corrects,released'
 def current(c,o):
  r=rows('select '+pub+' from sv_events where caseid=? and org=? and published is not null order by version desc limit 1',c,o)
  return r[0] if r else dict(version=0,status=STATUS[0])
 if op=='me':
  c=one('select id,name,last4,kind from sv_clients where subject=? and active=1',actor)
  cs=rows('select id,protocol,stage from sv_cases where client=? order by protocol',c['id'])
  for case in cs:case['history']=rows('select '+pub+' from sv_events where caseid=? and published is not null order by published desc,version desc',case['id'])
  return dict(client=c,cases=cs)
 if op=='file':
  id=field(d,'id');r=one('select e.evidence from sv_events e join sv_cases s on s.id=e.caseid join sv_clients c on c.id=s.client where e.id=? and e.evidence is not null and (?=1 or (c.subject=? and c.active=1 and e.released=1 and e.published is not null))',id,int(admin),actor)
  audit('abrir documento',id);return bytes(r['evidence'])
 need(admin,'Acesso restrito.',403)
 if op=='list':
  filt=field(d,'document',30,True);args=[lookup(filt)[0]] if filt else []
  clients=rows('select id,name,last4,kind,active from sv_clients'+(' where lookup=?' if filt else '')+' order by name',*args)
  for c in clients:c['cases']=rows('select id,protocol,stage from sv_cases where client=? order by protocol',c['id'])
  state=field(d,'status',50,True)
  if state:
   need(state in STATUS);clients=[c for c in clients if any(current(s['id'],o)['status']==state for s in c['cases'] for o in ORGS)]
  audit('listar clientes','lista');return clients
 if op=='client':
  name=field(d,'name');subject=field(d,'subject',36)
  try:subject=str(uuid.UUID(subject))
  except ValueError:raise Problem('Identificador de acesso inválido.')
  id=uid();h,last,kind=lookup(field(d,'document',30));q('insert into sv_clients(id,subject,name,lookup,last4,kind) values(?,?,?,?,?,?)',id,subject,name,h,last,kind);audit(op,id);return dict(id=id)
 if op=='access':
  id=field(d,'client');one('select id from sv_clients where id=?',id);need(type(d.get('active')) is bool);q('update sv_clients set active=? where id=?',int(d['active']),id);audit('acesso '+str(d['active']),id);return dict(id=id)
 if op=='case':
  id=uid();client=field(d,'client');one('select id from sv_clients where id=?',client);q('insert into sv_cases values(?,?,?,?)',id,client,field(d,'protocol',80).upper(),STAGES[0]);audit(op,id);return dict(id=id)
 if op=='export':
  audit(op,'relatório');return rows('select c.name,c.kind,c.last4,s.protocol,s.stage,e.org,e.status,e.scope,e.checked,e.published,e.version from sv_clients c join sv_cases s on s.client=c.id left join sv_events e on e.caseid=s.id and e.published is not null order by c.name,s.protocol,e.published')
 if op=='publish':
  id=field(d,'id');r=one('select caseid from sv_events where id=?',id);caseid=r['caseid']
 else:caseid=field(d,'caseid')
 case=one('select * from sv_cases where id=?'+(' for update' if not sqlite else ''),caseid)
 if op=='detail':
  audit(op,caseid);return rows('select '+pub+',source,note,reason,prior,digest from sv_events where caseid=? order by created desc',caseid)
 if op=='stage':
  stage=field(d,'stage');need(stage in STAGES)
  if stage==STAGES[-1]:
   states=[current(caseid,o)['status'] for o in ORGS];need(STATUS[3] in states and all(s in (STATUS[3],STATUS[-1]) for s in states),'Há órgãos sem baixa comprovada.')
  q('update sv_cases set stage=? where id=?',stage,caseid);audit(stage,caseid);return dict(stage=stage)
 if op=='draft':
  org=field(d,'org');status=field(d,'status');need(org in ORGS and status in STATUS)
  before=current(caseid,org);need(d.get('expected')==before['version'],'Situação alterada. Recarregue a ficha.',409)
  scope=field(d,'scope',500);source=field(d,'source',300);message=field(d,'message',1200);reason=field(d,'reason',500,True);ref=d.get('corrects') or None
  if ref:need(ref==before.get('id') and reason,'Para corrigir, selecione a versão vigente e justifique.')
  fact=civil(d,'fact',True);checked=civil(d,'checked');note=field(d,'note',2000,True)
  try:b=base64.b64decode(d.get('pdf',''),validate=True)
  except (ValueError,TypeError):raise Problem('PDF inválido.')
  need(not b or (len(b)<=2_000_000 and b.startswith(b'%PDF-')),'Use PDF de até 2 MB.')
  need(status!=STATUS[3] or b,'Anexe a evidência para confirmar a baixa.');need(not d.get('released') or b,'Anexe o PDF antes de liberá-lo.')
  id=field(d,'id',36)
  try:need(str(uuid.UUID(id))==id)
  except ValueError:raise Problem('Chave de operação inválida.')
  q('insert into sv_events(id,caseid,org,version,status,scope,fact,checked,message,source,note,corrects,reason,author,created,evidence,digest,released,prior) values('+','.join(['?']*19)+')',id,caseid,org,before['version']+1,status,scope,fact,checked,message,source,note,ref,reason,actor,now(),b or None,hashlib.sha256(b).hexdigest() if b else '',int(d.get('released') is True),before['status']);audit(op,id);return dict(id=id)
 if op=='publish':
  need(d.get('reviewed') is True,'Confirme a revisão.');e=one('select org,version,published,status from sv_events where id=?',id)
  if e['published']:return dict(id=id,published=e['published'])
  need(current(caseid,e['org'])['version']+1==e['version'],'Rascunho desatualizado. Crie outro após revisão.',409)
  stamp=now();q('update sv_events set published=?,reviewer=? where id=?',stamp,actor,id)
  if case['stage']==STAGES[-1] and e['status'] not in (STATUS[3],STATUS[-1]):q('update sv_cases set stage=? where id=?',STAGES[2],caseid)
  audit(op,id);return dict(id=id,published=stamp)
 raise Problem('Operação desconhecida.')
