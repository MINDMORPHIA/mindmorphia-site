const fs=require('node:fs');
const {getPool}=require('../api/_lib/database.cjs');
const {getAuth}=require('../api/_lib/identity.cjs');
(async()=>{
 const db=await getPool().connect();
 try{
  await db.query('BEGIN');
  await db.query(fs.readFileSync('db/schema.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  await db.query(fs.readFileSync('db/002_operation.sql','utf8'));
  await db.query(fs.readFileSync('db/003_registrations.sql','utf8'));
  await db.query('COMMIT');
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
 const {getMigrations}=await import('better-auth/db/migration');
 const migrations=await getMigrations((await getAuth()).options);await migrations.runMigrations();
 console.log('SAUVID: migrações de operação e identidade aplicadas.');await getPool().end();
})().catch((e)=>{console.error('Diagnóstico:',e.code||e.name,String(e.message).replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[conexão privada]'));console.error('Migração não concluída. Revise a conexão e o esquema sem divulgar credenciais.');process.exit(1);});
