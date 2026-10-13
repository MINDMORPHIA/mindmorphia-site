'use strict';
const {json,readJson,allowMethods}=require('./_lib/http');
const {createSession,sessionCookie,demoCodeMatches}=require('./_lib/auth');

module.exports=async(req,res)=>{
  if(!allowMethods(req,res,['POST'])) return;
  try{
    const body=await readJson(req,4096);
    const document=String(body.document||'').replace(/\D/g,'');
    const code=String(body.code||'').replace(/\D/g,'');
    if(document.length<11||document.length>14) return json(res,400,{ok:false,error:'Documento inválido para a homologação.'});
    if(code.length!==6||!demoCodeMatches(code)) return json(res,401,{ok:false,error:'Código de homologação inválido.'});
    const token=createSession();
    json(res,200,{ok:true,mode:'homologation'}, {'Set-Cookie':sessionCookie(token)});
  }catch(err){json(res,err.statusCode||500,{ok:false,error:err.statusCode?err.message:'Não foi possível iniciar a sessão.'})}
};
