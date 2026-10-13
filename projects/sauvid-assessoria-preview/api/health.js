'use strict';
const {json,allowMethods}=require('./_lib/http');
module.exports=(req,res)=>{
  if(!allowMethods(req,res,['GET'])) return;
  json(res,200,{ok:true,service:'sauvid-assessoria',version:'2.2-homologation',environment:process.env.VERCEL_ENV||'local',time:new Date().toISOString()});
};
