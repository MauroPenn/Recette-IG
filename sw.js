// v123 : HIIT V2, 24 bandeaux illustrés et sélection visuelle. Historique, Musculation et GPS conservés.
// v122 : intégration HIIT dans Musculation, 3 catégories, 24 exercices et créateur de séances.
// Ma Bibliothèque — temporisation Circuit Training 2 secondes (V120).
// Ma Bibliothèque — lien Historique depuis le menu Musculation.
// v119 : navigation vers l’historique réel, cache actualisé ; séances et sons conservés.
const CACHE = "ma-bibliotheque-v123";
const CORE = [
  "./", "./index.html", "./styles.css", "./app.js", "./data.json",
  "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./pectoraux-v1.js", "./pectoraux-v1.css", "./dos-v1.js", "./dos-v1.css", "./epaules-v1.js", "./epaules-v1.css", "./biceps-v2.js", "./biceps-v2.css", "./triceps-v1.js", "./triceps-v1.css", "./jambes-v1.js", "./jambes-v1.css", "./abdominaux-v1.js", "./abdominaux-v1.css", "./groupes-musculaires-v2.js", "./groupes-musculaires-v2.css", "./accueil-v1.js", "./accueil-v1.css", "./autre-sport-v2.js", "./autre-sport-v2.css", "./marche-suivi-v1.js", "./marche-suivi-v1.css", "./sport-ecran-actif-v1.js", "./seances-createur-v2.js", "./seances-createur-v2.css", "./seances-bandeaux-net-v2.css", "./muscu-rubriques-v1.js", "./muscu-rubriques-v1.css", "./muscu-historique-v1.js", "./muscu-historique-v1.css", "./marche-carte-v1.js", "./marche-carte-v1.css", "./seances-lecteur-v5.js", "./seances-lecteur-v2.css", "./muscu-son-v4.js", "./muscu-son-v2.css", "./muscu-clochette-v4.css", "./muscu-cloche-boxe-v1.wav", "./muscu-cloche-ring-douce-v1.wav", "./hiit-v1.js", "./hiit-v1.css", "./hiit-accueil-valide-v1.webp", "./hiit-photo-course-v1.webp", "./hiit-photo-coordination-v1.webp", "./hiit-photo-renforcement-v1.webp", "./hiit-photo-creation-v1.webp", "./hiit-v2.js", "./hiit-v2.css", "./hiit-ex-avant-arriere.webp", "./hiit-ex-bird-dog.webp", "./hiit-ex-burpees-sans-saut.webp", "./hiit-ex-corde-imaginaire.webp", "./hiit-ex-course-bras-actifs.webp", "./hiit-ex-course-sur-place.webp", "./hiit-ex-fentes-dynamiques.webp", "./hiit-ex-gainage-dynamique.webp", "./hiit-ex-genoux-hauts.webp", "./hiit-ex-genoux-poings.webp", "./hiit-ex-jack-sans-saut.webp", "./hiit-ex-jumping-jacks.webp", "./hiit-ex-mountain-climbers.webp", "./hiit-ex-mountain-inclines.webp", "./hiit-ex-pas-chasses.webp", "./hiit-ex-petits-pas.webp", "./hiit-ex-planche-epaules.webp", "./hiit-ex-pompes-inclinees.webp", "./hiit-ex-shadow-boxing.webp", "./hiit-ex-sprint-place.webp", "./hiit-ex-squat-pointes.webp", "./hiit-ex-squats-rapides.webp", "./hiit-ex-step-ups.webp", "./hiit-ex-talons-fesses.webp"
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

const EPAULES_IMAGES = [
  "developpe-militaire-halteres",
  "developpe-arnold",
  "elevations-laterales",
  "elevations-frontales",
  "oiseau-buste-penche",
  "developpe-epaules-assis",
  "tirage-menton-halteres",
  "pike-push-up",
  "elevations-laterales-unilaterales",
  "y-raise-sol"
].map(x => "./epaules-" + x + ".webp");

const BICEPS = [
  "curl-marteau","curl-classique","curl-alterne","curl-concentration","curl-zottman",
  "curl-prise-inversee","curl-assis","curl-unilateral","curl-isometrique","curl-kettlebell"
].map(x => "./biceps-" + x + ".webp");
const TRICEPS_IMAGES = [
  "dips-sur-chaise", "pompes-diamant", "kickback-triceps", "extension-triceps-travers-corps",
  "extension-nuque-deux-mains", "extension-triceps-allonge-sol", "developpe-serre-sol",
  "extension-triceps-unilaterale", "tate-press-sol", "dips-entre-deux-supports"
].map(x => "./triceps-" + x + ".webp");

const JAMBES_IMAGES = [
  "squat-avec-halteres", "fentes-avant", "fentes-arriere", "squat-goblet",
  "souleve-terre-jambes-tendues", "pont-fessier-sol", "hip-thrust-sol-haltere",
  "fentes-bulgares", "mollets-debout-halteres", "sumo-squat"
].map(x => "./jambes-" + x + ".webp");

const ABDOS_IMAGES = [
  "crunch-classique", "releves-de-jambes", "gainage-planche", "gainage-lateral",
  "crunch-velo", "russian-twist", "mountain-climber", "toucher-de-talons",
  "dead-bug", "hollow-hold"
].map(x => "./abdos-" + x + ".webp");

const ACCUEIL_IMAGES = ["./univers-cuisine-nutrition-valide.webp", "./univers-musculation-valide.webp", "./univers-autre-sport-valide.webp", "./univers-etirements-valide.webp", "./univers-pilates-valide.webp", "./univers-historique-valide.webp"];

const AUTRE_SPORT_IMAGES = ["./autre-sport-accueil-v3.webp", "./autre-sport-marche-v1.webp", "./autre-sport-choix-v1.webp", "./marche-paysage-v1.webp", "./muscu-hydratation-validee-v2.webp"];

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
      await Promise.all([...PECTORAL_IMAGES, ...DOS_IMAGES, ...EPAULES_IMAGES, ...BICEPS, ...TRICEPS_IMAGES, ...JAMBES_IMAGES, ...ABDOS_IMAGES, ...ACCUEIL_IMAGES, ...AUTRE_SPORT_IMAGES].map(async path => {
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
    const epaulesCode = await (await cache.match("./epaules-v1.js")).text();
    const bicepsCode = await (await cache.match("./biceps-v2.js")).text();
    const tricepsCode = await (await cache.match("./triceps-v1.js")).text();
    const jambesCode = await (await cache.match("./jambes-v1.js")).text();
    const abdominauxCode = await (await cache.match("./abdominaux-v1.js")).text();
    const sources = [code, css, pectoralCode, epaulesCode, bicepsCode, tricepsCode, jambesCode, abdominauxCode].join("\n");
    const referencedImages = [...sources.matchAll(/\.\/[a-zA-Z0-9_-]+\.(?:webp|png)/g)]
      .map(m => m[0]);
    const images = [...new Set([...referencedImages, ...PECTORAL_IMAGES, ...DOS_IMAGES, ...EPAULES_IMAGES, ...BICEPS, ...TRICEPS_IMAGES, ...JAMBES_IMAGES, ...ABDOS_IMAGES, ...MUSCLE_GROUPS, ...ACCUEIL_IMAGES, ...AUTRE_SPORT_IMAGES])];
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
  const freshFile = /\/(?:index\.html|styles\.css|app\.js|data\.json|manifest\.json|sw\.js|pectoraux-v1\.js|pectoraux-v1\.css|dos-v1\.js|dos-v1\.css|epaules-v1\.js|epaules-v1\.css|biceps-v2\.js|biceps-v2\.css|triceps-v1\.js|triceps-v1\.css|jambes-v1\.js|jambes-v1\.css|abdominaux-v1\.js|abdominaux-v1\.css|groupes-musculaires-v2\.js|groupes-musculaires-v2\.css|accueil-v1\.js|accueil-v1\.css|autre-sport-v2\.js|autre-sport-v2\.css|marche-suivi-v1\.js|marche-suivi-v1\.css|sport-ecran-actif-v1\.js|seances-createur-v2\.js|seances-createur-v2\.css|seances-bandeaux-net-v1\.css|muscu-rubriques-v1\.js|muscu-rubriques-v1\.css|muscu-historique-v1\.js|muscu-historique-v1\.css|marche-carte-v1\.js|marche-carte-v1\.css|seances-lecteur-v5\.js|seances-lecteur-v2\.css|muscu-son-v4\.js|hiit-v2\.js|hiit-v2\.css|hiit-ex-[a-z0-9-]+\.webp|hiit-v1\.js|hiit-v1\.css|hiit-accueil-valide-v1\.webp|hiit-photo-course-v1\.webp|hiit-photo-coordination-v1\.webp|hiit-photo-renforcement-v1\.webp|hiit-photo-creation-v1\.webp|muscu-son-v2\.css|muscu-clochette-v4\.css|muscu-cloche-boxe-v1\.wav|muscu-clochette-legere-v1\.wav|muscu-hydratation-validee-v2\.webp|muscu-pause-hydratation-v1\.webp|marche-paysage-v1\.webp|autre-sport-accueil-v3\.webp|autre-sport-marche-v1\.webp|autre-sport-choix-v1\.webp|univers-[a-z-]+-valide\.webp)$/.test(path);
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
