let DB = { recipes: [], categories: [] };
let state = { view:"hub", category:"", ig:"", search:"", selected:null };
let deferredPrompt = null;
let currentPhotoRecipeId = null;
const main = document.getElementById("main");
const installBtn = document.getElementById("installBtn");
const photoDialog = document.getElementById("photoDialog");
const photoInput = document.getElementById("photoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const bottomNav = document.getElementById("bottomNav");
const brandHome = document.getElementById("brandHome");
const brandMark = document.getElementById("brandMark");
const brandEyebrow = document.getElementById("brandEyebrow");
const brandTitle = document.getElementById("brandTitle");

const esc = (s="") => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const categoryEmoji = name => (DB.categories.find(c=>c.nom===name)?.icone || "🍽️");
const categoryImageMap = {
  "Cakes & desserts": "./cat-cakes-desserts.webp",
  "Cakes salés & terrines": "./cat-cakes-sales-terrines.webp",
  "Pancakes & gaufres": "./cat-pancakes-gaufres.webp",
  "Pains, pizzas & bruschettas": "./cat-pains-pizzas-bruschettas.webp",
  "Quiches & tartes": "./cat-quiches-tartes.webp",
  "Pâtes à tartiner": "./cat-pates-a-tartiner.webp",
  "Plats salés": "./cat-plats-sales.webp",
  "Recettes de la mer": "./cat-recettes-mer.webp",
  "Pâtes": "./cat-pates.webp",
  "Salades": "./cat-salades.webp",
  "Soupes": "./cat-soupes.webp",
  "Mijoteuse": "./cat-mijoteuse.webp",
  "Mijotés": "./cat-mijoteuse.webp"
};
const categoryImage = name => categoryImageMap[name] || "";
const recipeImageMap = {
  "R002": "./recette-r002-cake-chocolat-poire-pepites.png",
  "R005": "./recette-r005-cake-marbre-proteine-avoine-amande-lupin.png",
  "R007": "./recette-r007-cake-proteine-myrtilles-chocolat.png",
  "R014": "./recette-r014-gaufres-ig-bas-proteinees.png",
  "R017": "./recette-r017-pancakes-proteines-ig-bas.png",
  "R001": "./recette-r001-appareil-a-quiche-proteine-ig-bas.png",
  "R013": "./recette-r013-gaufres-au-thon.png",
  "R021": "./recette-r021-quiche-proteinee-legumes-sans-pate.png",
  "R022": "./recette-r022-quiche-proteinee-legumes-thon-sans-pate.png",
  "R023": "./recette-r023-quiche-proteinee-poulet-epinards-skyr-sans-pate.png",
  "R029": "./recette-r029-pate-brisee-farine-pois-chiches.png",
  "R031": "./recette-r031-pancakes-courgettes-parmesan.png",
  "R019": "./recette-r019-choco-noisette-saine.png",
  "R020": "./recette-r020-choco-noisette-ig-bas.png",
  "R035": "./recette-r035-pate-amandes.png",
  "R036": "./recette-r036-pate-cacahuetes.png",
  "R058": "./recette-r058-veloute-pois-chiches-courgette-poireau-cumin.webp",
  "R101": "./recette-r101-salade-poulet-avocat-oeufs.webp",
  "R102": "./recette-r102-salade-pommes-terre-thon-oeufs.webp",
  "R103": "./recette-r103-salade-cabillaud-avocat-oeufs.webp",
  "R104": "./recette-r104-salade-poulet-croustillant.webp",
  "R105": "./recette-r105-salade-mediterraneenne-pois-chiches.webp",
  "R106": "./recette-r106-salade-pates-poulet-mozzarella.webp",
  "R107": "./recette-r107-salade-crevettes-avocat-mangue.webp",
  "R108": "./recette-r108-salade-quinoa-legumes-rotis-pois-chiches.webp",
  "R109": "./recette-r109-salade-boeuf-grille-avocat.webp",
  "R110": "./recette-r110-salade-riz-basmati-thon-oeufs.webp",
  "R089": "./recette-r089-lasagnes-volaille-legumes.webp",
  "R090": "./recette-r090-lasagnes-blanches-volaille-legumes.webp",
  "R126": "./recette-r126-pates-poulet-courgettes-tomates.webp",
  "R127": "./recette-r127-pates-pesto-tomates-parmesan.webp",
  "R128": "./recette-r128-pates-cremeuses-poulet-champignons-epinards.webp",
  "R129": "./recette-r129-pates-poulet-epinards-tomates.webp",
  "R130": "./recette-r130-pates-thon-courgette-poivron-olives.webp",
  "R131": "./recette-r131-pates-brocoli-burrata-tomates.webp",
  "R132": "./recette-r132-pates-lentilles-corail-basilic.webp",
  "R133": "./recette-r133-pates-lentilles-corail-tomates-confites-basilic.webp",
  "R071": "./recette-r071-bowl-calamars-romaine.webp",
  "R072": "./recette-r072-tacos-calamars-romaine.webp",
  "R073": "./recette-r073-calamars-orge-legumes-rotis.webp",
  "R074": "./recette-r074-risotto-mer-citron-safran-calamars.webp",
  "R078": "./recette-r078-crevettes-courgettes-quinoa.webp",
  "R079": "./recette-r079-crevettes-pois-chiches-legumes.webp",
  "R011": "./recette-r011-flan-proteine-myrtille-citron.png",
  "R030": "./recette-r030-gateau-fromage-blanc.png",
  "R037": "./recette-r037-clafoutis-leger-pommes.png",
  "R075": "./recette-r075-cake-proteine-ananas-coco-vanille.png",
  "R076": "./recette-r076-tiramisu-proteine-cafe-chia.png",
  "R077": "./recette-r077-tiramisu-proteine-poire-chocolat-chia.png",
  "R091": "./recette-r091-cake-proteine-banane-chocolat.png",
  "R092": "./recette-r092-cake-proteine-pomme-cannelle.png",
  "R093": "./recette-r093-cake-proteine-banane-coco.png",
  "R094": "./recette-r094-cake-proteine-chocolat-compote.png",
  "R095": "./recette-r095-cake-proteine-poire-amande.png",
  "R096": "./recette-r096-cake-proteine-carotte-cannelle-noix.png",
  "R097": "./recette-r097-cake-proteine-banane-fruits-rouges.png",
  "R098": "./recette-r098-cake-proteine-pomme-coco.png",
  "R099": "./recette-r099-cake-proteine-citron-amande.png",
  "R100": "./recette-r100-cake-proteine-banane-cacao-noisette.png",

  "R010": "./recette-r010-cake-thon-tomate-olives.png",
  "R024": "./recette-r024-terrine-legumes-ete.png",
  "R025": "./recette-r025-terrine-fraiche-thon-courgette.png",
  "R038": "./recette-r038-cake-epinards-feta.png",
  "R039": "./recette-r039-cake-poulet-curry.png",

  "R040": "./recette-r040-cake-poivron-mozzarella.png",
  "R041": "./recette-r041-cake-champignons-comte.png",
  "R042": "./recette-r042-cake-carotte-chevre.png",
  "R043": "./recette-r043-cake-thon-olives.png",
  "R080": "./recette-r080-flan-courgettes-parmesan-skyr.png",
  "R003": "./recette-r003-cake-courgette-poivron-feta.png",
  "R004": "./recette-r004-cake-jambon-epinards-chevre.png",
  "R006": "./recette-r006-cake-poulet-courgette-parmesan.png",
  "R008": "./recette-r008-cake-legumes-du-soleil.png",
  "R009": "./recette-r009-cake-thon-courgette-skyr-sans-farine.png",
  "R081": "./recette-r081-terrine-poulet-legumes.png",
  "R082": "./recette-r082-clafoutis-tomates-courgettes-fromage.png",
  "R083": "./recette-r083-terrine-champignons-poireaux-emmental.png",
  "R084": "./recette-r084-gateau-pommes-terre-courgettes-chevre.png",
  "R085": "./recette-r085-gateau-pommes-terre-chou-fleur-chevre.png",
  "R026": "./recette-r026-wok-poulet-pousses-soja.png",
  "R059": "./recette-r059-poulet-pommes-terre-brocoli.png",
  "R060": "./recette-r060-saumon-riz-legumes.png",
  "R061": "./recette-r061-poulet-cremeux-champignons-pates.png",
  "R062": "./recette-r062-boeuf-pommes-terre-carottes-mijotes.png",
  "R063": "./recette-r063-saucisses-pommes-terre-poivrons.png",
  "R064": "./recette-r064-poulet-riz-legumes.png",
  "R065": "./recette-r065-crevettes-riz-brocoli.png",
  "R066": "./recette-r066-poulet-tex-mex-haricots-mais.png",
  "R067": "./recette-r067-gnocchis-poulet-tomates.png",
  "R068": "./recette-r068-boulettes-boeuf-orzo-tomates.png",
  "R069": "./recette-r069-poulet-citron-orzo-epinards.png",
  "R070": "./recette-r070-boeuf-cremeux-champignons-pates.png",
  "R112": "./recette-r112-boeuf-bourguignon-mijoteuse-v2.png",
  "R113": "./recette-r113-poulet-cremeux-ail-v2.png",
  "R114": "./recette-r114-porc-effiloche-sauce-barbecue-v2.png",
  "R115": "./recette-r115-ragout-boeuf-legumes-pommes-terre-v2.png",
  "R116": "./recette-r116-boulettes-boeuf-sauce-tomate-v2.png",
  "R117": "./recette-r117-poulet-champignons-creme-v2.png",
  "R118": "./recette-r118-boeuf-oignons-sauce-brune-v2.png",
  "R119": "./recette-r119-poulet-citron-herbes-v2.png",
  "R120": "./recette-r120-porc-champignons-oignons-v2.png",
  "R121": "./recette-r121-chili-boeuf-haricots-blancs-v2.png",
  "R122": "./recette-r122-poulet-cremeux-pommes-terre-v3.png",
  "R123": "./recette-r123-boeuf-mijote-thym-v2.png",
  "R124": "./recette-r124-poulet-barbecue-miel-v3.png",
  "R125": "./recette-r125-roti-porc-pommes-terre-v3.png",
  "R012": "./recette-r012-fougasse-petit-epeautre-v2.png",
  "R015": "./recette-r015-pain-complet-ig-bas-v2.png",
  "R016": "./recette-r016-pain-pomme-terre-skyr-v2.png",
  "R018": "./recette-r018-pate-pizza-ig-bas-v2.png",
  "R027": "./recette-r027-pain-sarrasin-pois-chiches-graines-v2.png",
  "R028": "./recette-r028-pain-sarrasin-v2.png",
  "R032": "./recette-r032-pizza-express-proteinee-v2.png",
  "R033": "./recette-r033-petits-pains-pois-chiches-v2.png",
  "R034": "./recette-r034-pain-lentilles-corail-v2.png",
  "R044": "./recette-r044-bruschetta-tomate-basilic-v2.png",
  "R045": "./recette-r045-bruschetta-mozzarella-tomates-cerises.png",
  "R046": "./recette-r046-bruschetta-jambon-cru-roquette.png",
  "R047": "./recette-r047-bruschetta-ricotta-miel.png",
  "R048": "./recette-r048-bruschetta-champignons-ail.png",
  "R049": "./recette-r049-bruschetta-poivron-roti.png",
  "R050": "./recette-r050-bruschetta-saumon-fromage-frais.png",
  "R051": "./recette-r051-bruschetta-avocat-citron-vert.png",
  "R052": "./recette-r052-bruschetta-thon-olives.png",
  "R053": "./recette-r053-bruschetta-chevre-figues.png",
  "R054": "./recette-r054-bruschetta-pesto-tomates-sechees.png",
  "R055": "./recette-r055-bruschetta-burrata-pesto.png",
  "R056": "./recette-r056-bruschetta-poulet-tomates-sechees.png",
  "R057": "./recette-r057-bruschetta-crevettes-avocat.png",
  "R086": "./recette-r086-pain-lentilles-corail.png",
  "R087": "./recette-r087-pain-lentilles-avoine-lupin.png",
  "R088": "./recette-r088-pain-nordique-graines.png",
  "R111": "./recette-r111-pain-100-sarrasin.png",
};
const officialRecipeImage = id => recipeImageMap[id] || "";
const favorites = () => new Set(JSON.parse(localStorage.getItem("recipeFavorites") || "[]"));
const setFavorites = set => localStorage.setItem("recipeFavorites", JSON.stringify([...set]));
const isFavorite = id => favorites().has(id);

function toggleFavorite(id){
  const f=favorites();
  f.has(id)?f.delete(id):f.add(id);
  setFavorites(f);
  render();
}
function normalize(s=""){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function filteredRecipes(){
  let rows=[...DB.recipes];
  if(state.view==="favorites") rows=rows.filter(r=>isFavorite(r.id));
  if(state.category) rows=rows.filter(r=>r.categorie===state.category);
  if(state.ig) rows=rows.filter(r=>r.profil_ig===state.ig);
  if(state.search){
    const q=normalize(state.search);
    rows=rows.filter(r=>normalize([r.nom,r.titre,r.categorie,r.ingredients,r.recherche].join(" ")).includes(q));
  }
  return rows.sort((a,b)=>(a.ordre||9999)-(b.ordre||9999));
}

function searchBox(){
  return `<div class="search"><input id="searchInput" value="${esc(state.search)}" placeholder="Rechercher une recette ou un ingrédient…" aria-label="Rechercher"></div>`;
}
function bindSearch(){
  const el=document.getElementById("searchInput");
  if(el) el.addEventListener("input", e=>{state.search=e.target.value; renderListOnly();});
}
function fallbackMedia(r, detail=false){
  const catPhoto = categoryImage(r.categorie);
  if(catPhoto){
    return `<img src="${catPhoto}" alt="Illustration ${esc(r.categorie)}" loading="lazy">`;
  }
  return `<div class="fallback-icon" aria-hidden="true">${esc(categoryEmoji(r.categorie))}</div>`;
}


function renderHub(){
  state.selected=null; state.category=""; state.ig=""; state.search="";
  main.innerHTML = `
    <div class="universe-grid universe-grid-two">
      <button class="universe-card universe-cuisine" data-universe="cuisine">
        <div class="universe-photo cuisine-photo"><img src="./cat-plats-sales.webp" alt="Cuisine artisanale" loading="eager"></div>
        <div class="universe-overlay"></div>
        <div class="universe-content">
          <div class="universe-badge available">Disponible</div>
          <div class="universe-icon">🍽️</div>
          <h3>Cuisine</h3>
          <p>${DB.recipes.length} recettes IG bas & protéinées, catégories, favoris et photos personnelles.</p>
          <span class="universe-cta">Ouvrir la cuisine →</span>
        </div>
      </button>
      <button class="universe-card universe-muscu" data-universe="muscu">
        <div class="universe-photo"><img src="./univers-musculation.webp" alt="Univers musculation" loading="eager"></div>
        <div class="universe-overlay"></div>
        <div class="universe-content">
          <div class="universe-badge available">Disponible</div>
          <div class="universe-icon muscu-icon">M</div>
          <h3>Musculation</h3>
          <p>Programmes, exercices et séances pour progresser et rester en forme.</p>
          <span class="universe-cta">Ouvrir la musculation →</span>
        </div>
      </button>
    </div>`;
  document.querySelector('[data-universe="cuisine"]')?.addEventListener("click",()=>{state.view="home";render();});
  document.querySelector('[data-universe="muscu"]')?.addEventListener("click",()=>{state.view="muscu-entry";render();});
}

function renderMuscuEntry(){
  main.innerHTML = `
    <section class="muscu-entry-clean" aria-label="Univers Musculation">
      <img class="muscu-entry-bg" src="./univers-musculation.webp" alt="Salle de musculation avec haltères et banc">
      <div class="muscu-entry-overlay"></div>
      <div class="muscu-entry-copy">
        <div class="muscu-entry-kicker">MUSCULATION</div>
        <h2>Choisissez votre<br>univers d’entraînement</h2>
        <p>Programmes, exercices et séances pour progresser et rester en forme.</p>
        <button id="enterMuscu" class="muscu-enter-btn">Entrer <span>→</span></button>
      </div>
    </section>`;
  document.getElementById("enterMuscu")?.addEventListener("click",()=>{
    state.view="muscu-menu";
    render();
  });
}

function renderMuscuMenu(){
  main.innerHTML = `
    <section class="muscu-menu-v2" aria-label="Rubriques Musculation">
      <div class="muscu-menu-hero-v2">
        <button class="muscu-back-pill" id="muscuMenuBack" aria-label="Retour à l'écran précédent">
          <span class="muscu-back-arrow">←</span><span>Retour</span>
        </button>
        <div class="muscu-menu-title-row">
          <span class="muscu-menu-barbell" aria-hidden="true">
            <svg viewBox="0 0 64 32" width="56" height="28" role="img">
              <rect x="27" y="14" width="10" height="4" rx="2" fill="currentColor"/>
              <rect x="18" y="8" width="6" height="16" rx="2" fill="currentColor"/>
              <rect x="12" y="5" width="5" height="22" rx="2" fill="currentColor"/>
              <rect x="40" y="8" width="6" height="16" rx="2" fill="currentColor"/>
              <rect x="47" y="5" width="5" height="22" rx="2" fill="currentColor"/>
            </svg>
          </span>
          <div>
            <div class="muscu-menu-kicker-v2">MUSCULATION</div>
            <h2>Choisissez une rubrique</h2>
            <p>Programmes, exercices et suivis pour progresser et rester en forme.</p>
          </div>
        </div>
      </div>
      <div class="muscu-menu-grid-v2">
        <button class="muscu-menu-card-v2" data-next="exercices"><img src="./muscu-menu-exercices.png" alt="Exercices — tous les exercices par groupes musculaires"></button>
        <button class="muscu-menu-card-v2" data-next="seances"><img src="./muscu-menu-seances.png" alt="Séances — programmes et séances guidées avec chrono"></button>
        <button class="muscu-menu-card-v2" data-next="autre-sport"><img src="./muscu-menu-autre-sport.png" alt="Autre sport — vélo, marche, course, vélo d’appartement, paddle"></button>
        <button class="muscu-menu-card-v2" data-next="historique"><img src="./muscu-menu-historique.png" alt="Historique — suivis, statistiques et progression"></button>
      </div>
    </section>`;
  document.getElementById("muscuMenuBack")?.addEventListener("click",()=>{state.view="muscu-entry";render();});
  document.querySelectorAll("[data-next]").forEach(btn=>btn.addEventListener("click",()=>{
    const target=btn.dataset.next;
    if(target==="exercices"){ state.view="muscu-exercises"; render(); return; }
    if(target==="seances"){ state.view="muscu-sessions"; render(); return; }
    if(target==="autre-sport"){ state.view="muscu-other"; render(); return; }
    if(target==="historique"){ state.view="muscu-history"; render(); return; }
    alert("Cette rubrique sera construite à l’étape suivante, après validation de cet écran.");
  }));
}

function renderMuscuExercises(){
  const groups=[
    ["pectoraux","Pectoraux"],
    ["dos","Dos"],
    ["epaules","Épaules"],
    ["biceps","Biceps"],
    ["triceps","Triceps"],
    ["jambes","Jambes"],
    ["abdominaux","Abdominaux"]
  ];
  main.innerHTML = `
    <section class="muscu-exercises-v5" aria-label="Exercices par groupe musculaire">
      <button class="muscu-back-pill muscu-exercises-back" id="muscuExercisesBack" aria-label="Retour aux rubriques Musculation">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-exercises-heading">
        <div class="muscu-exercises-icon" aria-hidden="true">▰</div>
        <div>
          <div class="muscu-exercises-kicker">MUSCULATION</div>
          <h2>Exercices</h2>
          <p>Choisissez un groupe musculaire</p>
        </div>
      </div>
      <div class="muscu-exercises-list">
        ${groups.map(([key,label])=>`<button class="muscu-exercise-group-card" data-muscle="${key}" aria-label="Ouvrir les exercices ${label}"><img src="./exercice-groupe-${key}.webp" alt="${label}"></button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuExercisesBack")?.addEventListener("click",()=>{state.view="muscu-menu";render();});
  document.querySelectorAll("[data-muscle]").forEach(btn=>btn.addEventListener("click",()=>{
    const muscle=btn.dataset.muscle;
    if(muscle==="pectoraux"){ state.view="muscu-pectoraux"; render(); return; }
    if(muscle==="biceps"){ state.view="muscu-biceps"; render(); return; }
    const label=btn.getAttribute("aria-label")?.replace("Ouvrir les exercices ","") || "ce groupe";
    alert(`Les fiches ${label} seront ajoutées à l’étape suivante.`);
  }));
}

function renderMuscuPectoraux(){
  const exercises=[
    "Pompes classiques",
    "Pompes inclinées",
    "Pompes déclinées",
    "Développé couché au sol haltères",
    "Écarté couché au sol haltères",
    "Pullover haltère",
    "Presse poitrine unilatérale au sol",
    "Pompes prise large",
    "Pompes tempo lent",
    "Squeeze press haltères"
  ];
  main.innerHTML=`
    <section class="muscu-biceps-v1 pec-match-biceps" aria-label="Exercices pectoraux">
      <button class="muscu-back-pill muscu-biceps-back" id="muscuPectorauxBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Pectoraux</h2>
          <p>10 exercices pour développer et renforcer les pectoraux à la maison</p>
        </div>
      </div>
      <div class="pec-card-list pec-full-card-list">
        ${exercises.map((label,i)=>`
          <button class="pec-full-card" data-pectoraux-exercise="${i}" aria-label="Ouvrir ${label}">
            <div class="pec-full-card-viewport" aria-hidden="true">
              <img class="pec-full-sprite" style="--i:${i}" src="./pectoraux-sprite-v3.webp" alt="">
            </div>
          </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuPectorauxBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-pectoraux-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    const label=btn.getAttribute("aria-label")?.replace("Ouvrir ","") || "cet exercice";
    alert(`La fiche détaillée ${label} sera ajoutée à l’étape suivante.`);
  }));
}

function renderMuscuBiceps(){
  const exercises=[
    ["curl-marteau","Curl marteau"],
    ["curl-classique","Curl classique"],
    ["curl-alterne","Curl alterné"],
    ["curl-concentration","Curl concentration"],
    ["curl-zottman","Curl Zottman"],
    ["curl-prise-inversee","Curl prise inversée"],
    ["curl-assis","Curl assis"],
    ["curl-unilateral","Curl unilatéral"],
    ["curl-isometrique","Curl isométrique"],
    ["curl-kettlebell","Curl kettlebell"]
  ];
  main.innerHTML=`
    <section class="muscu-biceps-v1" aria-label="Exercices biceps">
      <button class="muscu-back-pill muscu-biceps-back" id="muscuBicepsBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Biceps</h2>
          <p>10 exercices pour développer et renforcer les biceps à la maison</p>
        </div>
      </div>
      <div class="muscu-biceps-list">
        ${exercises.map(([key,label])=>`<button class="muscu-biceps-card" data-biceps-exercise="${key}" aria-label="Ouvrir ${label}"><img src="./biceps-${key}.webp" alt="${label}"></button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuBicepsBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-biceps-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    const label=btn.getAttribute("aria-label")?.replace("Ouvrir ","") || "cet exercice";
    alert(`La fiche détaillée ${label} sera ajoutée à l’étape suivante.`);
  }));
}

function renderMuscuSessions(){
  main.innerHTML = `
    <section class="muscu-sessions-v3" aria-label="Séances de musculation">
      <button class="muscu-back-pill muscu-sessions-back" id="muscuSessionsBack" aria-label="Retour aux rubriques Musculation">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-sessions-heading">
        <div class="muscu-sessions-icon" aria-hidden="true">▦</div>
        <div>
          <div class="muscu-sessions-kicker">MUSCULATION</div>
          <h2>Séances</h2>
          <p>Programmes d’entraînement complets</p>
        </div>
      </div>
      <div class="muscu-sessions-list">
        <button class="muscu-session-card-v3" data-session="haut"><img src="./seance-haut-corps-v2.png" alt="Haut du corps — 25 minutes, 6 exercices"></button>
        <button class="muscu-session-card-v3" data-session="bas"><img src="./seance-bas-corps-v2.png" alt="Bas du corps — 28 minutes, 6 exercices"></button>
        <button class="muscu-session-card-v3" data-session="complet"><img src="./seance-corps-complet-v2.png" alt="Corps complet — 35 minutes, 8 exercices"></button>
        <button class="muscu-session-card-v3" data-session="abdos"><img src="./seance-abdos-gainage-v2.png" alt="Abdos et gainage — 15 minutes, 5 exercices"></button>
      </div>
      <button class="muscu-create-session-v3" type="button">＋ Créer une séance</button>
    </section>`;
  document.getElementById("muscuSessionsBack")?.addEventListener("click",()=>{state.view="muscu-menu";render();});
}

function renderMuscuOther(){
  main.innerHTML = `
    <section class="muscu-other-v4" aria-label="Autres sports">
      <button class="muscu-back-pill muscu-other-back" id="muscuOtherBack" aria-label="Retour aux rubriques Musculation">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-other-list-v4">
        <button class="muscu-other-card-v4" data-sport="marche"><img src="./sport-marche-v3.png" alt="Marche"></button>
        <button class="muscu-other-card-v4" data-sport="course"><img src="./sport-course-v3.png" alt="Course à pied"></button>
        <button class="muscu-other-card-v4" data-sport="velo"><img src="./sport-velo-v3.png" alt="Vélo"></button>
        <button class="muscu-other-card-v4" data-sport="velo-app"><img src="./sport-velo-appartement-v3.png" alt="Vélo d’appartement"></button>
        <button class="muscu-other-card-v4" data-sport="paddle"><img src="./sport-paddle-v3.png" alt="Stand Up Paddle"></button>
      </div>
    </section>`;
  document.getElementById("muscuOtherBack")?.addEventListener("click",()=>{state.view="muscu-menu";render();});
  document.querySelectorAll("[data-sport]").forEach(btn=>btn.addEventListener("click",()=>{
    alert("L’enregistrement manuel de cette activité sera ajouté à l’étape suivante.");
  }));
}


function renderMuscuHistory(){
  main.innerHTML = `
    <section class="muscu-history-clean" aria-label="Historique des activités">
      <button class="muscu-back-pill history-back" id="historyBack" aria-label="Retour aux rubriques Musculation">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>

      <div class="history-heading">
        <div class="history-calendar-icon" aria-hidden="true">
          <span class="history-calendar-top"></span>
          <span class="history-calendar-grid"></span>
        </div>
        <div class="history-heading-copy">
          <div class="history-kicker">MUSCULATION</div>
          <h2>Historique</h2>
          <p>Retrouve l’ensemble de tes activités</p>
        </div>
      </div>

      <div class="history-tabs" role="tablist" aria-label="Période de l’historique">
        <button class="history-tab active" type="button" data-period="week" role="tab" aria-selected="true">Semaine</button>
        <button class="history-tab" type="button" data-period="month" role="tab" aria-selected="false">Mois</button>
        <button class="history-tab" type="button" data-period="year" role="tab" aria-selected="false">Année</button>
      </div>

      <div class="history-empty-panel">
        <div class="history-chart-icon" aria-hidden="true"><i></i><i></i><i></i></div>
        <h3>Aucune activité enregistrée</h3>
        <p>Les séances de musculation et les autres sports apparaîtront ici dès que tu commenceras à enregistrer tes activités.</p>
      </div>
    </section>`;

  document.getElementById("historyBack")?.addEventListener("click",()=>{state.view="muscu-menu";render();});
  document.querySelectorAll(".history-tab").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".history-tab").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-selected","false");});
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");
  }));
}


function updateShell(){
  const onHub=state.view==="hub";
  const onMuscu=state.view==="muscu-entry" || state.view==="muscu-menu" || state.view==="muscu-exercises" || state.view==="muscu-sessions" || state.view==="muscu-other" || state.view==="muscu-history" || state.view==="muscu-biceps" || state.view==="muscu-pectoraux";
  bottomNav.classList.toggle("hidden",onHub || onMuscu);
  if(onHub){
    brandMark.textContent="MB";
    brandEyebrow.textContent="Ma bibliothèque";
    brandTitle.textContent="Mes univers";
  } else if(onMuscu){
    brandMark.textContent="M";
    brandEyebrow.textContent="Ma bibliothèque";
    brandTitle.textContent="Musculation";
  } else {
    brandMark.textContent="IG";
    brandEyebrow.textContent="Ma bibliothèque cuisine";
    brandTitle.textContent="Recettes IG bas & protéinées";
  }
}


function renderHome(){
  state.selected=null;
  const favCount=favorites().size;
  main.innerHTML = `
    <section class="hero">
      <div class="hero-kicker">Cuisine IG bas & protéines</div>
      <h2>Des recettes simples, gourmandes et adaptées à tes objectifs.</h2>
      <p>Retrouve rapidement tes pains, cakes, plats, desserts et toutes les recettes de ta bibliothèque.</p>
      <div class="hero-stats">
        <span class="hero-stat">${DB.recipes.length} recettes</span>
        <span class="hero-stat">${DB.categories.length} catégories</span>
        <span class="hero-stat">${favCount} favori${favCount>1?"s":""}</span>
      </div>
    </section>
    ${searchBox()}
    <div class="quick-actions">
      <button class="quick-card" id="allRecipesBtn"><span class="quick-icon">▤</span><span><strong>Toutes les recettes</strong><small>Parcourir la bibliothèque</small></span></button>
      <button class="quick-card" id="favoritesBtn"><span class="quick-icon">♡</span><span><strong>Mes favoris</strong><small>${favCount} recette${favCount>1?"s":""}</small></span></button>
    </div>
    <div class="section-head"><div><h2>Catégories</h2><p>Choisis un univers de recettes</p></div></div>
    <div class="category-grid">
      ${DB.categories.map(c=>`
        <button class="category-card ${categoryImage(c.nom)?"has-photo":""}" data-category="${esc(c.nom)}">
          ${categoryImage(c.nom)?`<div class="category-photo"><img src="${categoryImage(c.nom)}" alt="${esc(c.nom)}" loading="lazy"></div>`:`<div class="category-fallback"><div class="icon-wrap">${esc(c.icone)}</div></div>`}
          <div class="category-content"><strong>${esc(c.nom)}</strong><p>${esc(c.description)}</p><div class="count">${c.nb} recette${c.nb>1?"s":""}</div></div>
        </button>`).join("")}
    </div>`;
  bindSearch();
  document.getElementById("searchInput").addEventListener("keydown", e=>{
    if(e.key==="Enter" && e.target.value.trim()){ state.view="recipes"; state.search=e.target.value; updateNav(); render(); }
  });
  document.getElementById("allRecipesBtn").addEventListener("click",()=>{state.view="recipes";updateNav();render();});
  document.getElementById("favoritesBtn").addEventListener("click",()=>{state.view="favorites";updateNav();render();});
  document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{
    state.category=b.dataset.category; state.view="recipes"; updateNav(); render();
  }));
}

function renderRecipeList(viewTitle="Recettes"){
  state.selected=null;
  const igs=[...new Set(DB.recipes.map(r=>r.profil_ig).filter(Boolean))].sort();
  const rows=filteredRecipes();
  main.innerHTML=`
    ${searchBox()}
    <div class="filters">
      <select id="categoryFilter" aria-label="Catégorie"><option value="">Toutes les catégories</option>${DB.categories.map(c=>`<option ${state.category===c.nom?"selected":""}>${esc(c.nom)}</option>`).join("")}</select>
      <select id="igFilter" aria-label="Profil IG"><option value="">Tous les profils IG</option>${igs.map(x=>`<option ${state.ig===x?"selected":""}>${esc(x)}</option>`).join("")}</select>
    </div>
    <div class="section-head"><div><h2>${esc(viewTitle)}</h2><p id="resultCount">${rows.length} recette${rows.length>1?"s":""}</p></div></div>
    <div id="recipeGrid" class="recipe-grid"></div>`;
  bindSearch();
  document.getElementById("categoryFilter").addEventListener("change",e=>{state.category=e.target.value;renderListOnly();});
  document.getElementById("igFilter").addEventListener("change",e=>{state.ig=e.target.value;renderListOnly();});
  renderListOnly();
}

async function renderListOnly(){
  const grid=document.getElementById("recipeGrid");
  if(!grid) return;
  const rows=filteredRecipes();
  const count=document.getElementById("resultCount");
  if(count) count.textContent=`${rows.length} recette${rows.length>1?"s":""}`;
  if(!rows.length){grid.innerHTML=`<div class="empty">Aucune recette trouvée.</div>`;return;}
  const cards = await Promise.all(rows.map(async r=>{
    const localPhoto=await getPhoto(r.id);
    const photo=localPhoto || officialRecipeImage(r.id);
    return `<button class="recipe-card" data-recipe="${esc(r.id)}">
      <div class="recipe-media">${photo?`<img src="${photo}" alt="${esc(r.nom)}">`:fallbackMedia(r)}</div>
      <div class="recipe-body"><h3>${esc(r.nom)}</h3>
        ${r.reperes?`<div class="recipe-sub">${esc(r.reperes)}</div>`:""}
        <div class="badges"><span class="badge ig">${esc(r.profil_ig || "IG non précisé")}</span>${r.proteinee==="Oui"?`<span class="badge protein">Protéinée</span>`:""}</div>
      </div>
    </button>`;
  }));
  grid.innerHTML=cards.join("");
  grid.querySelectorAll("[data-recipe]").forEach(b=>b.addEventListener("click",()=>{
    state.selected=b.dataset.recipe; renderDetail();
  }));
}

function linesToList(text, ordered=false){
  if(!text) return "";
  const lines=String(text).split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const tag=ordered?"ol":"ul";
  const items=lines.map(x=>x.replace(/^[-•]\s*/,"").replace(/^\d+[\.\)]\s*/,""));
  return `<${tag}>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</${tag}>`;
}

async function renderDetail(){
  const r=DB.recipes.find(x=>x.id===state.selected);
  if(!r) return render();
  const localPhoto=await getPhoto(r.id);
  const photo=localPhoto || officialRecipeImage(r.id);
  const fav=isFavorite(r.id);
  main.innerHTML=`
    <button class="detail-back" id="backBtn">← Retour aux recettes</button>
    <section class="detail-hero">
      <div class="detail-media">${photo?`<img src="${photo}" alt="${esc(r.nom)}">`:fallbackMedia(r,true)}</div>
      <div class="detail-content">
        <h2>${esc(r.nom)}</h2>
        <div class="badges"><span class="badge">${esc(r.categorie)}</span><span class="badge ig">${esc(r.profil_ig || "IG non précisé")}</span>${r.proteinee==="Oui"?`<span class="badge protein">Protéinée</span>`:""}</div>
        <div class="actions">
          <button class="primary-btn" id="photoBtn">${localPhoto?"Changer ma photo":"Ajouter ma photo"}</button>
          <button class="ghost-btn" id="favBtn">${fav?"♥ Retirer des favoris":"♡ Ajouter aux favoris"}</button>
        </div>
        <div class="meta">
          <div><span>Repères</span><strong>${esc(r.reperes || "Non précisé")}</strong></div>
          <div><span>Profil IG</span><strong>${esc(r.profil_ig || "Non précisé")}</strong></div>
        </div>
      </div>
    </section>
    ${r.ingredients?`<section class="info-card"><h3>Ingrédients</h3>${linesToList(r.ingredients,false)}</section>`:""}
    ${r.preparation?`<section class="info-card"><h3>Préparation</h3>${linesToList(r.preparation,true)}</section>`:""}
    ${r.conseils?`<section class="info-card"><h3>Conseils</h3><p>${esc(r.conseils)}</p></section>`:""}
    ${r.profil_nutritionnel?`<section class="info-card"><h3>Profil nutritionnel</h3><p>${esc(r.profil_nutritionnel)}</p></section>`:""}
  `;
  document.getElementById("backBtn").addEventListener("click",()=>{state.selected=null;render();});
  document.getElementById("favBtn").addEventListener("click",()=>toggleFavorite(r.id));
  document.getElementById("photoBtn").addEventListener("click",()=>{
    currentPhotoRecipeId=r.id;
    removePhotoBtn.classList.toggle("hidden",!localPhoto);
    photoInput.value="";
    photoDialog.showModal();
  });
}

function updateNav(){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
}
function render(){
  updateShell();
  updateNav();
  if(state.view==="hub") return renderHub();
  if(state.view==="muscu-entry") return renderMuscuEntry();
  if(state.view==="muscu-menu") return renderMuscuMenu();
  if(state.view==="muscu-exercises") return renderMuscuExercises();
  if(state.view==="muscu-pectoraux") return renderMuscuPectoraux();
  if(state.view==="muscu-biceps") return renderMuscuBiceps();
  if(state.view==="muscu-sessions") return renderMuscuSessions();
  if(state.view==="muscu-other") return renderMuscuOther();
  if(state.view==="muscu-history") return renderMuscuHistory();
  if(state.selected) return renderDetail();
  if(state.view==="home") return renderHome();
  if(state.view==="favorites") return renderRecipeList("Mes favoris");
  return renderRecipeList("Recettes");
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{
  state.view=b.dataset.view; state.selected=null; state.category=""; state.ig=""; state.search=""; render();
}));
brandHome.addEventListener("click",()=>{state.view="hub";state.selected=null;render();});
brandHome.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();state.view="hub";state.selected=null;render();}});

photoInput.addEventListener("change", async e=>{
  const file=e.target.files?.[0];
  if(!file || !currentPhotoRecipeId) return;
  await savePhoto(currentPhotoRecipeId,file);
  photoDialog.close();
  renderDetail();
});
removePhotoBtn.addEventListener("click", async ()=>{
  if(currentPhotoRecipeId) await deletePhoto(currentPhotoRecipeId);
  photoDialog.close();
  renderDetail();
});

window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault(); deferredPrompt=e; installBtn.classList.remove("hidden");
});
installBtn.addEventListener("click",async()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.classList.add("hidden");
});
window.addEventListener("appinstalled",()=>installBtn.classList.add("hidden"));

function openPhotoDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("recipesIGPhotos",1);
    req.onupgradeneeded=()=>req.result.createObjectStore("photos");
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function savePhoto(id,file){
  const db=await openPhotoDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction("photos","readwrite");
    tx.objectStore("photos").put(file,id);
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  }); db.close();
}
async function deletePhoto(id){
  const db=await openPhotoDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction("photos","readwrite");
    tx.objectStore("photos").delete(id);
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  }); db.close();
}
async function getPhoto(id){
  try{
    const db=await openPhotoDb();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction("photos","readonly");
      const req=tx.objectStore("photos").get(id);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    }); db.close();
    return blob?URL.createObjectURL(blob):null;
  }catch(e){return null;}
}

async function init(){
  const res=await fetch("./data.json");
  DB=await res.json();
  render();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
init();
