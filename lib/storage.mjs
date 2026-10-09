import {initialCatalog} from './catalog.mjs';
import {randomUUID} from 'node:crypto';
export function initialState(){return {version:1,revision:0,catalog:structuredClone(initialCatalog),coupons:[],users:[],sessions:[],tokens:[],projects:[],orders:[],requests:[],files:[],notices:[],audit:[],limits:[]};}
export class MemoryStore {
 constructor(state=initialState()){this.state=state;this.tail=Promise.resolve();this.files=new Map();}
 async read(){await this.tail;return structuredClone(this.state);}
 async change(fn){const task=this.tail.then(async()=>{const s=structuredClone(this.state);const result=await fn(s);s.revision++;this.state=s;return result;});this.tail=task.catch(()=>{});return task;}
 async upload(path,data,type){this.files.set(path,{data,type});return path;}
 async download(path){return this.files.get(path)||null;}
}
export class BlobStore {
 constructor(){this.path='portal/production/state-v1.json';}
 async sdk(){return import('@vercel/blob');}
 async load(){const {get}=await this.sdk();const r=await get(this.path,{access:'private',useCache:false});if(!r)return {state:initialState(),etag:null};if(r.statusCode!==200||!r.stream)throw new Error('Armazenamento indisponível.');return {state:JSON.parse(await new Response(r.stream).text()),etag:r.blob.etag};}
 async read(){return (await this.load()).state;}
 async change(fn){const {put}=await this.sdk();for(let i=0;i<5;i++){const {state,etag}=await this.load();const result=await fn(state);state.revision++;const body=JSON.stringify(state);if(Buffer.byteLength(body)>8*1024*1024)throw new Error('Capacidade operacional atingida. Entre em contato com a gestão.');try{await put(this.path,body,{access:'private',addRandomSuffix:false,allowOverwrite:!!etag,...(etag?{ifMatch:etag}:{}),contentType:'application/json',cacheControlMaxAge:60});return result;}catch(e){if(!['BlobPreconditionFailedError','BlobPathnameAlreadyExistsError'].includes(e.name))throw e;}}throw new Error('Outra atualização ocorreu. Tente novamente.');}
 async upload(path,data,type){const {put}=await this.sdk();await put(path,data,{access:'private',addRandomSuffix:false,contentType:type});return path;}
 async download(path){const {get}=await this.sdk();const r=await get(path,{access:'private',useCache:false});return r?.stream?{data:Buffer.from(await new Response(r.stream).arrayBuffer()),type:r.blob.contentType}:null;}
 async backup(state){const {put}=await this.sdk();return put(`backups/${new Date().toISOString().slice(0,10)}/${randomUUID()}.json`,JSON.stringify(state),{access:'private',contentType:'application/json'});}
}
