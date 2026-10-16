const {json,allowMethods}=require('./_lib/http'),{getPool}=require('./_lib/database.cjs'),{verify,apply}=require('./_lib/delivery.cjs');
module.exports=async(req,res)=>{
 if(!allowMethods(req,res,['POST']))return;if(!process.env.RESEND_WEBHOOK_SECRET)return json(res,503,{ok:false});
 try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65536)return json(res,413,{ok:false});chunks.push(chunk);}const body=Buffer.concat(chunks).toString('utf8');const id=verify(body,req.headers,process.env.RESEND_WEBHOOK_SECRET);if(!id)return json(res,401,{ok:false});let event;try{event=JSON.parse(body);}catch{return json(res,400,{ok:false});}if(!event||typeof event!=='object'||Array.isArray(event))return json(res,400,{ok:false});
 const db=await getPool().connect();try{await db.query('BEGIN');const r=await apply(db,event,id);await db.query('COMMIT');return json(res,r.retry?503:200,{ok:!r.retry});}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
 }catch(e){return json(res,e.statusCode||503,{ok:false});}
};
module.exports.config={api:{bodyParser:false}};
