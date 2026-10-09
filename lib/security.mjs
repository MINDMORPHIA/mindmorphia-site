import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash,createHmac} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const token=()=>randomBytes(32).toString('hex');
export const digest=v=>createHash('sha256').update(v).digest('hex');
export async function hashPassword(password){if(typeof password!=='string'||password.length<12||password.length>128)throw new Error('Use uma senha entre 12 e 128 caracteres.');const salt=randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64);return `${salt}:${hash.toString('hex')}`;}
export async function checkPassword(password,value){if(typeof password!=='string'||password.length>128)return false;const [salt,hex]=String(value||'').split(':');const expected=Buffer.from(hex||'','hex');const actual=await scrypt(password,salt||'invalid',64);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export function verifyWebhook(url,headers,secret){const id=new URL(url).searchParams.get('data.id');const rid=headers.get('x-request-id');const parts=String(headers.get('x-signature')||'').split(',').map(x=>x.trim().split('='));const ts=parts.find(x=>x[0]==='ts')?.[1];const hashes=parts.filter(x=>x[0]==='v1').map(x=>x[1]);if(!secret||!/^\d{1,30}$/.test(id||'')||!rid||rid.length>200||!/^\d{1,16}$/.test(ts||''))return null;const expected=createHmac('sha256',secret).update(`id:${id};request-id:${rid};ts:${ts};`).digest();return hashes.some(h=>/^[a-f0-9]{64}$/i.test(h||'')&&timingSafeEqual(Buffer.from(h,'hex'),expected))?id:null;}
export const permissions=['clients','projects','requests','catalog','orders','files','notices'];
export function can(user,permission){return user?.active&&(user.role==='owner'||(user.role==='staff'&&user.permissions?.includes(permission)));}
