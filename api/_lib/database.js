// PostgreSQL repository for server-side usage only. Requires pg and DATABASE_URL.
// Connection and migrations must be provisioned before checkout can be enabled.
import pg from "pg";
const {Pool}=pg;
let pool;
export function db(){
 if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL not configured");
 if(!pool)pool=new Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:5000});
 return pool;
}
export async function getOrderByReference(reference){
 const {rows}=await db().query("SELECT id,plan_id,amount_cents,currency,status,provider_payment_id FROM orders WHERE external_reference=$1",[reference]);
 return rows[0]||null;
}
export async function persistVerifiedPayment({reference,paymentId,amountCents,currency,status}){
 const client=await db().connect();
 try{
  await client.query("BEGIN");
  const {rows}=await client.query("SELECT id,amount_cents,currency,status,provider_payment_id FROM orders WHERE external_reference=$1 FOR UPDATE",[reference]);
  const order=rows[0];
  if(!order || Number(order.amount_cents)!==amountCents || order.currency!==currency)throw new Error("Payment order mismatch");
  if(order.provider_payment_id && String(order.provider_payment_id)!==String(paymentId))throw new Error("Payment id mismatch");
  if(status==="approved" && order.status!=="paid"){
   await client.query("UPDATE orders SET status='paid',paid_at=now(),updated_at=now(),provider_payment_id=$2 WHERE id=$1",[order.id,String(paymentId)]);
  } else if(status==="approved" && order.status==="paid") {
   // Verified duplicate webhook; idempotent.
  } else if(order.status!=="paid"){
   await client.query("UPDATE orders SET provider_payment_id=$2,updated_at=now() WHERE id=$1",[order.id,String(paymentId)]);
  }
  await client.query("COMMIT");
  return {orderId:order.id,paid:status==="approved"};
 }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
}
