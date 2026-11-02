const CACHE="ma-bibliotheque-v40";
const ASSETS=["./","./index.html","./styles.css","./app.js","./data.json","./manifest.json","./icon-192.png","./icon-512.png","./cat-cakes-desserts.webp","./cat-cakes-sales-terrines.webp","./cat-pancakes-gaufres.webp","./cat-pains-pizzas-bruschettas.webp","./cat-quiches-tartes.webp","./cat-pates-a-tartiner.webp","./cat-plats-sales.webp","./cat-recettes-mer.webp","./cat-pates.webp","./cat-salades.webp","./cat-soupes.webp","./cat-mijoteuse.webp","./univers-musculation.webp","./univers-etirements.webp","./recette-r014-gaufres-ig-bas-proteinees.png","./recette-r017-pancakes-proteines-ig-bas.png","./recette-r001-appareil-a-quiche-proteine-ig-bas.png","./recette-r013-gaufres-au-thon.png","./recette-r021-quiche-proteinee-legumes-sans-pate.png","./recette-r022-quiche-proteinee-legumes-thon-sans-pate.png","./recette-r023-quiche-proteinee-poulet-epinards-skyr-sans-pate.png","./recette-r029-pate-brisee-farine-pois-chiches.png","./recette-r031-pancakes-courgettes-parmesan.png","./recette-r019-choco-noisette-saine.png","./recette-r020-choco-noisette-ig-bas.png","./recette-r035-pate-amandes.png","./recette-r036-pate-cacahuetes.png","./recette-r058-veloute-pois-chiches-courgette-poireau-cumin.webp","./recette-r101-salade-poulet-avocat-oeufs.webp","./recette-r102-salade-pommes-terre-thon-oeufs.webp","./recette-r103-salade-cabillaud-avocat-oeufs.webp","./recette-r104-salade-poulet-croustillant.webp","./recette-r105-salade-mediterraneenne-pois-chiches.webp","./recette-r106-salade-pates-poulet-mozzarella.webp","./recette-r107-salade-crevettes-avocat-mangue.webp","./recette-r108-salade-quinoa-legumes-rotis-pois-chiches.webp","./recette-r109-salade-boeuf-grille-avocat.webp","./recette-r110-salade-riz-basmati-thon-oeufs.webp","./recette-r089-lasagnes-volaille-legumes.webp","./recette-r090-lasagnes-blanches-volaille-legumes.webp","./recette-r126-pates-poulet-courgettes-tomates.webp","./recette-r127-pates-pesto-tomates-parmesan.webp","./recette-r128-pates-cremeuses-poulet-champignons-epinards.webp","./recette-r129-pates-poulet-epinards-tomates.webp","./recette-r130-pates-thon-courgette-poivron-olives.webp","./recette-r131-pates-brocoli-burrata-tomates.webp","./recette-r132-pates-lentilles-corail-basilic.webp","./recette-r133-pates-lentilles-corail-tomates-confites-basilic.webp","./recette-r071-bowl-calamars-romaine.webp","./recette-r072-tacos-calamars-romaine.webp","./recette-r073-calamars-orge-legumes-rotis.webp","./recette-r074-risotto-mer-citron-safran-calamars.webp","./recette-r078-crevettes-courgettes-quinoa.webp","./recette-r079-crevettes-pois-chiches-legumes.webp","./recette-r002-cake-chocolat-poire-pepites.png","./recette-r005-cake-marbre-proteine-avoine-amande-lupin.png","./recette-r007-cake-proteine-myrtilles-chocolat.png","./recette-r011-flan-proteine-myrtille-citron.png","./recette-r030-gateau-fromage-blanc.png","./recette-r037-clafoutis-leger-pommes.png","./recette-r075-cake-proteine-ananas-coco-vanille.png","./recette-r076-tiramisu-proteine-cafe-chia.png","./recette-r077-tiramisu-proteine-poire-chocolat-chia.png","./recette-r091-cake-proteine-banane-chocolat.png","./recette-r092-cake-proteine-pomme-cannelle.png","./recette-r093-cake-proteine-banane-coco.png","./recette-r094-cake-proteine-chocolat-compote.png","./recette-r095-cake-proteine-poire-amande.png","./recette-r096-cake-proteine-carotte-cannelle-noix.png","./recette-r097-cake-proteine-banane-fruits-rouges.png","./recette-r098-cake-proteine-pomme-coco.png","./recette-r099-cake-proteine-citron-amande.png","./recette-r100-cake-proteine-banane-cacao-noisette.png","./recette-r003-cake-courgette-poivron-feta.png","./recette-r004-cake-jambon-epinards-chevre.png","./recette-r006-cake-poulet-courgette-parmesan.png","./recette-r008-cake-legumes-du-soleil.png","./recette-r009-cake-thon-courgette-skyr-sans-farine.png","./recette-r010-cake-thon-tomate-olives.png","./recette-r024-terrine-legumes-ete.png","./recette-r025-terrine-fraiche-thon-courgette.png","./recette-r038-cake-epinards-feta.png","./recette-r039-cake-poulet-curry.png","./recette-r040-cake-poivron-mozzarella.png","./recette-r041-cake-champignons-comte.png","./recette-r042-cake-carotte-chevre.png","./recette-r043-cake-thon-olives.png","./recette-r080-flan-courgettes-parmesan-skyr.png","./recette-r081-terrine-poulet-legumes.png","./recette-r082-clafoutis-tomates-courgettes-fromage.png","./recette-r083-terrine-champignons-poireaux-emmental.png","./recette-r084-gateau-pommes-terre-courgettes-chevre.png","./recette-r085-gateau-pommes-terre-chou-fleur-chevre.png","./recette-r026-wok-poulet-pousses-soja.png","./recette-r059-poulet-pommes-terre-brocoli.png","./recette-r060-saumon-riz-legumes.png","./recette-r061-poulet-cremeux-champignons-pates.png","./recette-r062-boeuf-pommes-terre-carottes-mijotes.png","./recette-r063-saucisses-pommes-terre-poivrons.png","./recette-r064-poulet-riz-legumes.png","./recette-r065-crevettes-riz-brocoli.png","./recette-r066-poulet-tex-mex-haricots-mais.png","./recette-r067-gnocchis-poulet-tomates.png","./recette-r068-boulettes-boeuf-orzo-tomates.png","./recette-r069-poulet-citron-orzo-epinards.png","./recette-r070-boeuf-cremeux-champignons-pates.png","./recette-r112-boeuf-bourguignon-mijoteuse-v2.png","./recette-r113-poulet-cremeux-ail-v2.png","./recette-r114-porc-effiloche-sauce-barbecue-v2.png","./recette-r115-ragout-boeuf-legumes-pommes-terre-v2.png","./recette-r116-boulettes-boeuf-sauce-tomate-v2.png","./recette-r117-poulet-champignons-creme-v2.png","./recette-r118-boeuf-oignons-sauce-brune-v2.png","./recette-r119-poulet-citron-herbes-v2.png","./recette-r120-porc-champignons-oignons-v2.png","./recette-r121-chili-boeuf-haricots-blancs-v2.png","./recette-r122-poulet-cremeux-pommes-terre-v3.png","./recette-r123-boeuf-mijote-thym-v2.png","./recette-r124-poulet-barbecue-miel-v3.png","./recette-r125-roti-porc-pommes-terre-v3.png","./recette-r012-fougasse-petit-epeautre-v2.png","./recette-r015-pain-complet-ig-bas-v2.png","./recette-r016-pain-pomme-terre-skyr-v2.png","./recette-r018-pate-pizza-ig-bas-v2.png","./recette-r027-pain-sarrasin-pois-chiches-graines-v2.png","./recette-r028-pain-sarrasin-v2.png","./recette-r032-pizza-express-proteinee-v2.png","./recette-r033-petits-pains-pois-chiches-v2.png","./recette-r034-pain-lentilles-corail-v2.png","./recette-r044-bruschetta-tomate-basilic-v2.png","./recette-r045-bruschetta-mozzarella-tomates-cerises.png","./recette-r046-bruschetta-jambon-cru-roquette.png","./recette-r047-bruschetta-ricotta-miel.png","./recette-r048-bruschetta-champignons-ail.png","./recette-r049-bruschetta-poivron-roti.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  const isCore = url.pathname.endsWith("/app.js") || url.pathname.endsWith("/data.json") || url.pathname.endsWith("/sw.js");
  if (isCore) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request, {cache:"no-store"});
        const cache = await caches.open(CACHE);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch(e) {
        return (await caches.match(event.request)) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const resp = await fetch(event.request);
      const cache = await caches.open(CACHE);
      cache.put(event.request, resp.clone());
      return resp;
    } catch(e) {
      return (await caches.match("./index.html")) || Response.error();
    }
  })());
});
