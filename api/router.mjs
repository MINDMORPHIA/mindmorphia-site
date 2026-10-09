import {BlobStore} from '../lib/storage.mjs';
import {createApp} from '../lib/app.mjs';
const handle=createApp({store:new BlobStore(),env:process.env});
export default async function handler(req,res){
 const chunks=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
 const body=Buffer.concat(chunks);const headers=new Headers();
 for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
 const url=new URL(req.url,`https://${req.headers.host}`);
 const route=url.searchParams.get('route');
 if(route){url.pathname='/api/'+route;url.searchParams.delete('route');}
 const response=await handle(new Request(url,{method:req.method,headers,...(body.length?{body}:{})}));
 res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,value);
 res.end(Buffer.from(await response.arrayBuffer()));
}
