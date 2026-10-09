import {BlobStore} from '../lib/storage.mjs';
import {createApp} from '../lib/app.mjs';
const handle=createApp({store:new BlobStore(),env:process.env});
export default async function handler(req,res){const chunks=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));const body=Buffer.concat(chunks);const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);const response=await handle(new Request(`https://${req.headers.host}${req.url}`,{method:req.method,headers,...(body.length?{body}: {})}));res.statusCode=response.status;for(const [k,v] of response.headers)res.setHeader(k,v);res.end(Buffer.from(await response.arrayBuffer()));}
