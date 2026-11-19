const fs=require('node:fs/promises');
const path=require('node:path');
const {Readable}=require('node:stream');
async function storage(){
 const root=process.env.SAUVID_QA_FILES;
 if(!root||process.env.VERCEL||process.env.NODE_ENV!=='development'||!/^http:\/\/localhost:\d+$/.test(process.env.SAUVID_APP_ORIGIN||''))return import('@vercel/blob');
 function location(key){
  if(!/^sauvid\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/.test(key))throw new Error('Arquivo inválido');
  return path.join(root,key);
 }
 return {
  async put(key,bytes){const filename=location(key);await fs.mkdir(path.dirname(filename),{recursive:true});await fs.writeFile(filename,bytes,{flag:'wx'});return {pathname:key,url:key};},
  async get(key){try{return {statusCode:200,stream:Readable.toWeb(Readable.from([await fs.readFile(location(key))]))};}catch(e){if(e.code==='ENOENT')return null;throw e;}},
  async del(key){await fs.unlink(location(key));}
 };
}
module.exports={storage};
