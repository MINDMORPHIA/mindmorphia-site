'use strict';
const {json,allowMethods}=require('./_lib/http');
const {clearCookie}=require('./_lib/auth');
module.exports=(req,res)=>{
  if(!allowMethods(req,res,['POST'])) return;
  json(res,200,{ok:true},{'Set-Cookie':clearCookie()});
};
