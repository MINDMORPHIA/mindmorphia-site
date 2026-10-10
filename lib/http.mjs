export async function requestBody(req,max=3000000){
 const tooLarge=()=>Object.assign(new Error('Arquivo ou mensagem muito grande.'),{status:413});
 if(Number(req.headers?.['content-length'])>max)throw tooLarge();
 const chunks=[];let size=0;
 for await(const chunk of req){const data=Buffer.from(chunk);size+=data.length;if(size>max)throw tooLarge();chunks.push(data);}
 const body=chunks.length?Buffer.concat(chunks):req.body?Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body)):Buffer.alloc(0);
 if(body.length>max)throw tooLarge();return body;
}
