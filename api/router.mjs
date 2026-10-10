import {requestBody} from '../lib/http.mjs';
import {BlobStore} from '../lib/storage.mjs';
import {createApp} from '../lib/app.mjs';
const handle=createApp({store:new BlobStore(),env:process.env});
export default async function handler(req,res){
 let body;try{body=await requestBody(req);}catch(e){res.statusCode=e.status||500;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify({error:e.status===413?'Arquivo ou mensagem muito grande.':'Não foi possível receber a mensagem.'}));return;}const headers=new Headers();
 for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
 const url=new URL(req.url,`https://${req.headers.host}`);
 const route=url.searchParams.get('route');
 if(route){url.pathname='/api/'+route;url.searchParams.delete('route');}
 const response=await handle(new Request(url,{method:req.method,headers,...(body.length?{body}:{})}));
 res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,value);
 res.end(Buffer.from(await response.arrayBuffer()));
}
