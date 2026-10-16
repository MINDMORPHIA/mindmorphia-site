'use strict';
const {json,allowMethods}=require('./_lib/http');
module.exports=(req,res)=>{
  if(!allowMethods(req,res,['GET'])) return;
  json(res,200,{ok:true,service:'sauvid-assessoria',version:'3.2.0',time:new Date().toISOString()});
};
