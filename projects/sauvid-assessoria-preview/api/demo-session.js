'use strict';
const {json,allowMethods}=require('./_lib/http');
const {sessionFromRequest}=require('./_lib/auth');
const fixture=require('./_lib/fixture');

module.exports=(req,res)=>{
  if(!allowMethods(req,res,['GET'])) return;
  const session=sessionFromRequest(req);
  if(!session) return json(res,401,{ok:false,error:'Sessão ausente ou expirada.'});
  json(res,200,{ok:true,mode:'homologation',data:fixture});
};
