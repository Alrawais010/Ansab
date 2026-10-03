const C='ansabi-v7';
const F=['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// الشبكة أولاً (لأخذ آخر تحديث)، والنسخة المحفوظة عند عدم وجود إنترنت
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(new Promise(resolve=>{
    let done=false;const finish=r=>{if(!done&&r){done=true;resolve(r)}};
    const fallback=()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'));
    const t=setTimeout(()=>fallback().then(finish),4000);
    fetch(req.url,{cache:'no-cache'}).then(res=>{
      clearTimeout(t);
      if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}
      finish(res);
    }).catch(()=>{clearTimeout(t);fallback().then(r=>{if(!done){done=true;resolve(r||Response.error())}})});
  }));
});
