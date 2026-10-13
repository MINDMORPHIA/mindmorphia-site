// Segredos enviados por stdin e gravados somente em .env.local ignorado.
const crypto=require('node:crypto'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const cli='C:/Users/junio/AppData/Local/VercelCLI/node_modules/vercel/dist/vc.js';
if(fs.existsSync('.env.local')&&/SAUVID_DATA_KEY=/.test(fs.readFileSync('.env.local','utf8'))){console.error('Configuração inicial já existe. Não rotacione chaves sem migração dos dados.');process.exit(1);}
const config={BETTER_AUTH_SECRET:crypto.randomBytes(48).toString('base64url'),SAUVID_DATA_KEY:crypto.randomBytes(32).toString('base64'),SAUVID_LOOKUP_SECRET:crypto.randomBytes(48).toString('base64url'),SAUVID_APP_ORIGIN:'https://sauvid-assessoria.vercel.app',BLOB_STORE_ID:'store_1J7jx5TETisvklqL'};
for(const [key,value] of Object.entries(config)){
 for(const target of ['production','preview']){const r=spawnSync(process.execPath,[cli,'env','add',key,target,'--scope','juniorsauder-7118','--yes'],{input:value,encoding:'utf8',windowsHide:true});if(r.status!==0){console.error(`Configuração pendente: ${key} / ${target}.`);process.exit(1);}}
 fs.appendFileSync('.env.local',`\n${key}=${JSON.stringify(value)}\n`);console.log(`Configurado: ${key}`);
}
