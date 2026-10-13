'use strict';
const {json,readJson,allowMethods}=require('./_lib/http');

function emailOk(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function digits(v){return String(v||'').replace(/\D/g,'')}

module.exports=async(req,res)=>{
  if(!allowMethods(req,res,['POST'])) return;
  try{
    const body=await readJson(req,12*1024);
    if(body.website) return json(res,202,{ok:true,mode:'homologation',message:'Solicitação recebida.'});
    const name=String(body.name||'').trim();
    const whatsapp=digits(body.whatsapp);
    const email=String(body.email||'').trim().toLowerCase();
    const situation=String(body.situation||'').trim();
    const cpf=digits(body.cpf);
    if(name.length<3||name.length>120) return json(res,400,{ok:false,error:'Informe um nome válido.'});
    if(whatsapp.length<10||whatsapp.length>13) return json(res,400,{ok:false,error:'Informe um WhatsApp válido.'});
    if(!emailOk(email)||email.length>160) return json(res,400,{ok:false,error:'Informe um e-mail válido.'});
    if(situation.length<10||situation.length>3000) return json(res,400,{ok:false,error:'Descreva a situação com pelo menos 10 caracteres.'});
    if(cpf.length!==11) return json(res,400,{ok:false,error:'Informe um CPF válido para identificação cadastral.'});

    const webhook=process.env.SAUVID_LEAD_WEBHOOK_URL;
    if(!webhook){
      return json(res,202,{ok:true,mode:'homologation',persisted:false,message:'Os dados foram validados no servidor. O envio definitivo será habilitado quando o canal oficial da SAUVID for conectado.'});
    }

    const response=await fetch(webhook,{
      method:'POST',
      headers:{'Content-Type':'application/json','User-Agent':'SAUVID-Assessoria/1.0'},
      body:JSON.stringify({name,whatsapp,email,situation,cpf,source:'sauvid-site',receivedAt:new Date().toISOString()})
    });
    if(!response.ok) return json(res,502,{ok:false,error:'O canal de atendimento não confirmou o recebimento. Tente novamente mais tarde.'});
    return json(res,201,{ok:true,mode:'production',persisted:true,message:'Solicitação encaminhada ao canal oficial da SAUVID.'});
  }catch(err){return json(res,err.statusCode||500,{ok:false,error:err.statusCode?err.message:'Não foi possível processar a solicitação.'})}
};
