export const PLANS = Object.freeze({
 impacto:{name:"Impacto",amount:99700},
 autoridade:{name:"Autoridade",amount:199700},
 magnitude:{name:"Magnitude",amount:349700},
 "google-ai-pro-18":{name:"Google AI Pro — 18 meses",amount:24990},
 "canva-pro-12":{name:"Canva Pro — 12 meses",amount:9990},
 "canva-pro-24":{name:"Canva Pro — 24 meses",amount:12990}
});
export function planFor(id){return Object.prototype.hasOwnProperty.call(PLANS,id)?PLANS[id]:null;}
