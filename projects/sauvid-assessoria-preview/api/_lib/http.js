'use strict';

function json(res,status,body,extraHeaders={}){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  for(const [key,value] of Object.entries(extraHeaders)) res.setHeader(key,value);
  res.end(JSON.stringify(body));
}

async function readJson(req,maxBytes=16*1024){
  if(req.body!==undefined){
    const value=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(Buffer.byteLength(JSON.stringify(value))>maxBytes)throw Object.assign(new Error('Payload muito grande.'),{statusCode:413});
    if(!value||Array.isArray(value)||typeof value!=='object')throw Object.assign(new Error('JSON inválido.'),{statusCode:400});
    return value;
  }
  const chunks=[];let total=0;
  for await(const chunk of req){
    total+=chunk.length;
    if(total>maxBytes) throw Object.assign(new Error('Payload muito grande.'),{statusCode:413});
    chunks.push(chunk);
  }
  if(!chunks.length) return {};
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}
  catch{throw Object.assign(new Error('JSON inválido.'),{statusCode:400})}
}

function allowMethods(req,res,methods){
  if(methods.includes(req.method)) return true;
  res.setHeader('Allow',methods.join(', '));
  json(res,405,{ok:false,error:'Método não permitido.'});
  return false;
}

module.exports={json,readJson,allowMethods};
