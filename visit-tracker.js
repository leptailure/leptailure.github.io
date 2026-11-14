// Opt-in visitor analytics: no tracking until a visitor explicitly accepts.
// The Worker computes daily-rotating pseudonymous IDs; raw IP is never stored.
(function(){
 'use strict';
 const endpoint=String(window.LEPTAILURE_STATS_URL||'').trim().replace(/\/+$/,'');
 if(!/^https:\/\/[a-z0-9.-]+(?:\/[a-z0-9/_-]*)?$/i.test(endpoint))return;
 const preference='leptailure.analyticsConsent';
 function send(){
  fetch(endpoint+'/collect',{
    method:'POST',mode:'cors',headers:{'Content-Type':'text/plain'},
    body:JSON.stringify({path:location.pathname}),credentials:'omit',keepalive:true
  }).catch(()=>{});
 }
 let decision='';
 try{decision=localStorage.getItem(preference)||''}catch{}
 if(decision==='yes'){send();return}
 if(decision==='no')return;
 const show=()=>{
  const box=document.createElement('aside');
  box.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;z-index:9999;max-width:560px;margin:auto;padding:16px 18px;background:#fffef9;color:#20352a;border:1px solid #aeb8ac;box-shadow:0 12px 38px #0002;font:13px/1.5 system-ui,sans-serif';
  const msg=document.createElement('p');msg.style.cssText='margin:0 0 12px';
  msg.textContent='Ce site peut recueillir des statistiques pseudonymisées par jour (pages et région approximative) avec votre accord. Aucune adresse IP complète n’est conservée.';
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  for(const [label,value] of [['Accepter','yes'],['Refuser','no']]){
    const b=document.createElement('button');b.textContent=label;b.type='button';
    b.style.cssText='border:1px solid #20352a;background:'+(value==='yes'?'#20352a':'transparent')+';color:'+(value==='yes'?'white':'#20352a')+';padding:7px 11px;cursor:pointer';
    b.addEventListener('click',()=>{try{localStorage.setItem(preference,value)}catch{}box.remove();if(value==='yes')send()});
    actions.append(b);
  }
  const link=document.createElement('a');link.href=location.pathname.startsWith('/projects/')?'../privacy.html':'/privacy.html';
  link.textContent='Confidentialité';link.style.cssText='color:inherit;margin-left:auto';actions.append(link);box.append(msg,actions);document.body.append(box);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
})();
