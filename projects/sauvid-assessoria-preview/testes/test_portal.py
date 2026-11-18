import os,sys,sqlite3,tempfile,unittest,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from portal_credito.core import *
class Portal(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'test.db';os.environ['SV_DOC_KEY']='somente-teste-sem-dados-pessoais!'*2
  with self.db() as db:db.executescript((ROOT/'portal_credito/schema.sql').read_text())
  self.a,self.b=uid(),uid();self.admin=uid()
  self.c=self.go('client',name='Titular fictício A',subject=self.a,document='00000000191')['id']
  self.cb=self.go('client',name='Titular fictício B',subject=self.b,document='00000000272')['id']
  self.p=self.go('case',client=self.c,protocol='P1-TESTE')['id']
 def db(self):
  c=sqlite3.connect(self.path);c.row_factory=sqlite3.Row;c.execute('pragma foreign_keys=on');return c
 def go(self,op,who=None,**data):
  db=self.db()
  try:
   with db:return execute(db,True,who or self.admin,not who,op,data)
  finally:db.close()
 def draft(self,**k):
  d=dict(id=uid(),caseid=self.p,org='SPC',status=STATUS[3],scope='Um apontamento fictício',source='Conferência manual fictícia',checked='2026-01-01',fact='',message='Baixa verificada no escopo indicado.',note='Nota exclusiva da gestão',pdf=base64.b64encode(b'%PDF-1.4 arquivo de teste').decode(),expected=0,released=True);d.update(k);return self.go('draft',**d)['id']
 def test_ciclo(self):
  self.assertRaises(Problem,self.draft,pdf='');id=self.draft();stale=self.draft()
  me=lambda:self.go('me',self.a)['cases'][0]['history']
  self.assertEqual(me(),[]);self.assertRaises(Problem,self.go,'file',self.a,id=id)
  self.go('publish',id=id,reviewed=True);self.go('publish',id=id,reviewed=True)
  self.assertEqual(len(me()),1);self.assertNotIn('note',me()[0]);self.assertEqual(me()[0]['fact'],'');self.assertEqual(me()[0]['org'],'SPC')
  self.assertEqual(self.go('file',self.a,id=id)[:4],b'%PDF');self.assertRaises(Problem,self.go,'publish',id=stale,reviewed=True)
  self.assertRaises(Problem,self.go,'stage',caseid=self.p,stage=STAGES[-1])
  r=self.draft(corrects=id,expected=1,reason='Correção de abrangência',status=STATUS[4],released=False);self.go('publish',id=r,reviewed=True)
  self.assertEqual(len(me()),2);self.assertEqual(me()[0]['corrects'],id);self.assertRaises(Problem,self.go,'file',self.a,id=r)
  self.assertEqual(self.go('me',self.b)['cases'],[]);self.assertRaises(Problem,self.go,'file',self.b,id=id)
  for op in ('export','publish','list','client'):self.assertRaises(Problem,self.go,op,self.b,id=id)
  self.assertEqual(len(self.go('export')),2);self.go('access',client=self.c,active=False);self.assertRaises(Problem,me);self.assertRaises(Problem,self.go,'file',self.a,id=id)
  backup=sqlite3.connect(':memory:');db=self.db();db.backup(backup);db.close();self.assertEqual(backup.execute('select count(*) from sv_events where published is not null').fetchone()[0],2);backup.close()
 def test_independencia(self):
  for org in ORGS:
   id=self.draft(org=org,status=STATUS[3] if org=='SPC' else STATUS[-1]);self.go('publish',id=id,reviewed=True)
  self.go('stage',caseid=self.p,stage=STAGES[-1])
  self.assertEqual(len(self.go('list',status=STATUS[-1])),1);self.assertEqual(len(self.go('list',document='000.000.001-91')),1)
  self.assertRaises(sqlite3.IntegrityError,self.go,'client',subject=uid(),name='Outro nome',document='000.000.001-91')
 def tearDown(self):self.tmp.cleanup()
if __name__=='__main__':unittest.main()
