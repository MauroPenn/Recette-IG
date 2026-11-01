const CACHE="recettes-ig-v5";
const ASSETS=["./","./index.html","./styles.css","./app.js","./data.json","./manifest.json","./icon-192.png","./icon-512.png","./cat-cakes-desserts.webp","./cat-cakes-sales-terrines.webp","./cat-pancakes-gaufres.webp","./cat-pains-pizzas-bruschettas.webp","./cat-quiches-tartes.webp","./cat-pates-a-tartiner.webp","./cat-plats-sales.webp","./cat-recettes-mer.webp","./cat-pates.webp","./cat-salades.webp","./cat-soupes.webp","./cat-mijoteuse.webp"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const clone=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,clone)); return resp;
  }).catch(()=>caches.match("./index.html"))));
});
