// Privacy-conscious visitor statistics for leptailure.github.io.
// Worker + D1: live /collect endpoint and private Basic-auth /api endpoints.
const SITE = 'https://leptailure.github.io';
const MAX_BODY = 400;
function sameTime(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0}
function authorized(req,env){
 if(!env.ADMIN_PASSWORD)return false;
 const header=req.headers.get('Authorization')||'';
 if(!header.startsWith('Basic '))return false;
 try{const token=atob(header.slice(6)),i=token.indexOf(':');return i>0&&sameTime(token.slice(0,i),env.ADMIN_USER||'admin')&&sameTime(token.slice(i+1),env.ADMIN_PASSWORD)}catch{return false}
}
function response(body,status=200,type='text/plain;charset=utf-8',extra={}){
 return new Response(body,{status,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...extra}});
}
function cors(origin){return origin===SITE?{'Access-Control-Allow-Origin':SITE,'Vary':'Origin','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}:{}}
function period(url){const n=Number(new URL(url).searchParams.get('days')||7);return [7,30,90].includes(n)?n:7}
function cutoff(days){return new Date(Date.now()-(days-1)*86400000).toISOString().slice(0,10)}
function csvValue(s){let v=String(s??'');if(/^[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
async function collect(req,env,origin){
 if(!env.DB||!env.HASH_SALT)return response('Not configured',503,'text/plain',cors(origin));
 if(Number(req.headers.get('Content-Length')||0)>MAX_BODY)return response('Too large',413,'text/plain',cors(origin));
 if(/bot|crawl|spider|preview|headless/i.test(req.headers.get('User-Agent')||''))return response('',204,'text/plain',cors(origin));
 let payload;try{const s=await req.text();if(s.length>MAX_BODY)throw new Error('Too large');payload=JSON.parse(s)}catch{return response('Invalid request',400,'text/plain',cors(origin))}
 const path=String(payload?.path||'');
 if(!path.startsWith('/')||path.startsWith('//')||path.length>180||/[\r\n<>]/.test(path))return response('Invalid page',400,'text/plain',cors(origin));
 const page=path.split('?')[0].split('#')[0]||'/';
 const day=new Date().toISOString().slice(0,10);
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const bytes=new TextEncoder().encode(env.HASH_SALT+'|'+day+'|'+ip);
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const key=Array.from(new Uint8Array(digest).slice(0,9)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const country=String(req.cf?.country||'XX').slice(0,2);
 const city=String(req.cf?.city||'').slice(0,80);
 await env.DB.prepare('INSERT INTO visits (ts,day,page,country,city,visitor_key) VALUES (?,?,?,?,?,?)')
   .bind(new Date().toISOString(),day,page,country,city,key).run();
 return response('',204,'text/plain',cors(origin));
}
async function stats(env,days){
 const day=cutoff(days);const q=sql=>env.DB.prepare(sql).bind(day).all();
 const [totals,countries,pages,daily,recent]=await Promise.all([
  q("SELECT COUNT(*) AS views, COUNT(DISTINCT day || ':' || visitor_key) AS visitors FROM visits WHERE day >= ?"),
  q("SELECT country,COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY country ORDER BY n DESC LIMIT 20"),
  q("SELECT page,COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY page ORDER BY n DESC LIMIT 30"),
  q("SELECT day,COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY day ORDER BY day ASC"),
  q("SELECT ts,page,country,city,visitor_key FROM visits WHERE day >= ? ORDER BY ts DESC LIMIT 100")
 ]);
 return {views:totals.results[0]?.views||0,visitors:totals.results[0]?.visitors||0,
 countries:countries.results,pages:pages.results,daily:daily.results,recent:recent.results};
}
export default {
 async fetch(req,env){
  const url=new URL(req.url),path=url.pathname,method=req.method,origin=req.headers.get('Origin')||'';
  if(path==='/health')return response('ok');
  if(method==='OPTIONS'&&(path==='/collect'||path.startsWith('/api/')))
    return origin===SITE?response('',204,'text/plain',cors(origin)):response('',403);
  if(origin!==SITE)return response('Forbidden',403);
  if(path==='/collect'&&method==='POST')return collect(req,env,origin);
  if(path.startsWith('/api/')){
    if(!authorized(req,env))return response('Unauthorized',401,'text/plain',cors(origin));
    if(path==='/api/stats'&&method==='GET')return response(JSON.stringify(await stats(env,period(req.url))),200,'application/json;charset=utf-8',cors(origin));
    if(path==='/api/export'&&method==='GET'){
      const day=cutoff(period(req.url));
      const rows=await env.DB.prepare('SELECT ts,page,country,city,visitor_key FROM visits WHERE day >= ? ORDER BY ts DESC LIMIT 10000').bind(day).all();
      const content=['ts_utc,page,country,city,daily_pseudonymous_key',...rows.results.map(r=>[r.ts,r.page,r.country,r.city,r.visitor_key].map(csvValue).join(','))].join('\r\n');
      return response('\ufeff'+content,200,'text/csv;charset=utf-8',{...cors(origin),'Content-Disposition':'attachment; filename="leptailure-visits.csv"'});
    }
  }
  return response('Not found',404,'text/plain',cors(origin));
 },
 async scheduled(controller,env){
   if(env.DB)await env.DB.prepare('DELETE FROM visits WHERE ts < ?').bind(new Date(Date.now()-30*86400000).toISOString()).run();
 }
};