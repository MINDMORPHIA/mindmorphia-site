const { Pool } = require('pg');
let pool;
function getPool() {
  if (!process.env.DATABASE_URL) throw Object.assign(new Error('O atendimento online está em ativação. Tente novamente mais tarde.'), {statusCode:503});
  const connection=new URL(process.env.DATABASE_URL);connection.searchParams.set('sslmode','verify-full');
  return pool ||= new Pool({connectionString:connection.toString(),max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:20000});
}
async function transaction(actor, fn) {
  const conn = await getPool().connect();
  try {
    await conn.query('BEGIN');
    await conn.query('SET LOCAL ROLE sauvid_runtime');
    await conn.query("SELECT set_config('app.user_id',$1,true),set_config('app.role',$2,true)",[actor?.id||'',actor?.role||'public']);
    const result = await fn(conn);
    await conn.query('COMMIT');
    return result;
  } catch(e) { await conn.query('ROLLBACK'); throw e; }
  finally { conn.release(); }
}
module.exports={getPool,transaction};
