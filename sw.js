const CACHE="nishi-cloud-v10";
const CORE=["./","./index.html","./config.js","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener("activate",e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
));
self.addEventListener("fetch",e=>{
  // Don't cache Supabase/API requests.
  if(e.request.url.includes("supabase.co")) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
