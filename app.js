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
    <section class="hub-intro">
      <div class="hub-kicker">Une seule appli, trois univers</div>
      <h2>Ma bibliothèque personnelle</h2>
      <p>Choisis l’univers que tu veux consulter. La cuisine est déjà disponible ; la musculation et les étirements viendront ensuite.</p>
    </section>
    <div class="universe-grid">
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
        <div class="universe-photo"><img src="./univers-musculation.webp" alt="Espace de musculation avec haltères et poids" loading="eager"></div>
        <div class="universe-overlay"></div>
        <div class="universe-content">
          <div class="universe-badge soon">Bientôt</div>
          <div class="universe-icon">🏋️</div>
          <h3>Musculation</h3>
          <p>Exercices par groupe musculaire, fiches, vidéos et programmes.</p>
          <span class="universe-cta muted">En préparation</span>
        </div>
      </button>
      <button class="universe-card universe-stretch" data-universe="stretch">
        <div class="universe-photo"><img src="./univers-etirements.webp" alt="Espace zen pour étirements et mobilité" loading="eager"></div>
        <div class="universe-overlay"></div>
        <div class="universe-content">
          <div class="universe-badge soon">Bientôt</div>
          <div class="universe-icon">🧘</div>
          <h3>Étirements</h3>
          <p>Mobilité, étirements par zone et routines courtes à suivre facilement.</p>
          <span class="universe-cta muted">En préparation</span>
        </div>
      </button>
    </div>
  `;
  document.querySelectorAll("[data-universe]").forEach(btn=>btn.addEventListener("click",()=>{
    const u=btn.dataset.universe;
    if(u==="cuisine"){ state.view="home"; updateShell(); render(); return; }
    renderComingSoon(u);
  }));
}

function renderComingSoon(universe){
  const muscu=universe==="muscu";
  const title=muscu?"Musculation":"Étirements";
  const icon=muscu?"🏋️":"🧘";
  const text=muscu?"Ta bibliothèque d’exercices et tes programmes seront intégrés ici.":"Tes fiches d’étirements, mobilité et routines seront intégrées ici.";
  main.innerHTML=`
    <section class="coming-card">
      <div class="coming-icon">${icon}</div>
      <div class="hub-kicker">Prochain univers</div>
      <h2>${title}</h2>
      <p>${text}</p>
      <button class="primary-btn" id="backUniverses">← Revenir aux univers</button>
    </section>`;
  document.getElementById("backUniverses").addEventListener("click",()=>{state.view="hub";updateShell();render();});
}

function updateShell(){
  const onHub=state.view==="hub";
  bottomNav.classList.toggle("hidden",onHub);
  if(onHub){
    brandMark.textContent="MB"; brandEyebrow.textContent="Ma bibliothèque"; brandTitle.textContent="Mes univers";
  } else {
    brandMark.textContent="IG"; brandEyebrow.textContent="Ma bibliothèque cuisine"; brandTitle.textContent="Recettes IG bas & protéinées";
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
