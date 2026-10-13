const {json,readJson,allowMethods}=require('./_lib/http');
const {transaction,getPool}=require('./_lib/database.cjs');
const {originCheck,rateLimit}=require('./_lib/security.cjs');
const {saveLead}=require('./_lib/operation.cjs');
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['POST']))return;
 try{
  originCheck(req);const body=await readJson(req,12288);
  if(body.website)return json(res,202,{ok:true,message:'Solicitação recebida.'});
  await rateLimit(getPool(),req,'lead',5);
  const result=await transaction(null,db=>saveLead(db,body));
  return json(res,201,{ok:true,...result});
 }catch(e){return json(res,e.statusCode||503,{ok:false,error:e.statusCode?e.message:'Não foi possível registrar sua solicitação. Tente novamente mais tarde.'});}
};
