// Ma Bibliothèque — mise à jour Pectoraux et correctif cache de navigation PWA.
// v84 : noveaux bandeaux et mise a jour du cache; les pages et scripts se rechargent depuis le réseau dès qu'il est disponible.
const CACHE = "ma-bibliotheque-v84";
const CORE = [
  "./", "./index.html", "./styles.css", "./app.js", "./data.json",
  "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./pectoraux-v1.js", "./pectoraux-v1.css", "./dos-v1.js", "./dos-v1.css"
];
const PECTORAL_IMAGES = [
  "pompes-classiques", "pompes-inclinees", "pompes-declinees",
  "developpe-sol-halteres", "ecarte-sol-halteres", "pullover-haltere",
  "presse-unilaterale-sol", "pompes-prise-large", "pompes-tempo-lent",
  "squeeze-press-halteres"
].map(x => "./pectoraux-" + x + ".webp");

const DOS_IMAGES = [
  "rowing-unilateral-haltere", "rowing-buste-penche-halteres", "pullover-haltere",
  "oiseau-buste-penche", "superman-sol", "bird-dog-row",
  "rowing-kettlebell", "souleve-terre-roumain", "tirage-coudes-ouverts-halteres",
  "extension-lombaire-sol"
].map(x => "./dos-" + x + ".webp");

const BICEPS = [
  "curl-marteau","curl-classique","curl-alterne","curl-concentration","curl-zottman",
  "curl-prise-inversee","curl-assis","curl-unilateral","curl-isometrique","curl-kettlebell"
].map(x => "./biceps-" + x + ".webp");
const MUSCLE_GROUPS = [
  "pectoraux", "dos", "epaules", "biceps", "triceps", "jambes", "abdominaux"
].map(x => "./exercice-groupe-" + x + ".webp");

async function networkAndCache(request, cache) {
  const response = await fetch(request, {cache:"no-store"});
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Toujours récupérer la dernière version du HTML et des scripts essentiels.
    await Promise.all(CORE.map(async path => {
      const response = await fetch(path, {cache:"no-store"});
      if (!response.ok) throw new Error("Fichier essentiel introuvable : " + path);
      await cache.put(path, response);
    }));

    // Lors d'une mise à jour, conserver les photos déjà téléchargées dans l'ancien cache.
    // Seuls les visuels Pectoraux doivent éventuellement être récupérés.
    const cacheNames = await caches.keys();
    const hasPreviousCache = cacheNames.some(name => name.startsWith("ma-bibliotheque-") && name !== CACHE);
    if (hasPreviousCache) {
      await Promise.all([...PECTORAL_IMAGES, ...DOS_IMAGES].map(async path => {
        try {
          const response = await fetch(path, {cache:"no-store"});
          if (response.ok) await cache.put(path, response);
        } catch (_) { /* Le cache précédent sera préservé. */ }
      }));
      return;
    }

    // Sur une nouvelle installation, garder aussi les recettes disponibles hors ligne.
    // Les fichiers dans app.js utilisent une référence './fichier.webp' ou './fichier.png'.
    const code = await (await cache.match("./app.js")).text();
    const css = await (await cache.match("./styles.css")).text();
    const pectoralCode = await (await cache.match("./pectoraux-v1.js")).text();
    const sources = [code, css, pectoralCode].join("\n");
    const referencedImages = [...sources.matchAll(/\.\/[a-zA-Z0-9_-]+\.(?:webp|png)/g)]
      .map(m => m[0]);
    const images = [...new Set([...referencedImages, ...PECTORAL_IMAGES, ...DOS_IMAGES, ...BICEPS, ...MUSCLE_GROUPS])];
    await Promise.all(images.map(async path => {
      try {
        const response = await fetch(path, {cache:"no-store"});
        if (response.ok) await cache.put(path, response);
      } catch (_) { /* Une image non essentielle ne doit pas bloquer l'installation. */ }
    }));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const fresh = await caches.open(CACHE);
    const keys = await caches.keys();
    for (const key of keys) {
      if (key === CACHE || !key.startsWith("ma-bibliotheque-")) continue;
      const old = await caches.open(key);
      const requests = await old.keys();
      for (const request of requests) {
        // Les ressources récentes du nouveau cache ont priorité.
        if (!(await fresh.match(request))) {
          const response = await old.match(request);
          if (response) await fresh.put(request, response);
        }
      }
      await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const nav = request.mode === "navigate" || path.endsWith("/") || path.endsWith("/index.html");
  const freshFile = /\/(?:index\.html|styles\.css|app\.js|data\.json|manifest\.json|sw\.js|pectoraux-v1\.js|pectoraux-v1\.css|dos-v1\.js|dos-v1\.css)$/.test(path);
  if (nav || freshFile) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try { return await networkAndCache(request, cache); }
      catch (_) {
        return (await cache.match(request)) || (nav ? (await cache.match("./index.html")) : null) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (_) {
      return (await cache.match(request)) || Response.error();
    }
  })());
});
