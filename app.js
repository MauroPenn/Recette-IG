let DB = { recipes: [], categories: [] };
let state = { view:"home", category:"", ig:"", search:"", selected:null };
let deferredPrompt = null;
let currentPhotoRecipeId = null;
const main = document.getElementById("main");
const installBtn = document.getElementById("installBtn");
const photoDialog = document.getElementById("photoDialog");
const photoInput = document.getElementById("photoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");

const esc = (s="") => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const categoryEmoji = name => (DB.categories.find(c=>c.nom===name)?.icone || "🍽️");
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
  return `<div class="fallback-icon" aria-hidden="true">${esc(categoryEmoji(r.categorie))}</div>`;
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
        <button class="category-card" data-category="${esc(c.nom)}">
          <div><div class="icon-wrap">${esc(c.icone)}</div><strong>${esc(c.nom)}</strong><p>${esc(c.description)}</p></div>
          <div class="count">${c.nb} recette${c.nb>1?"s":""}</div>
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
    const photo=await getPhoto(r.id);
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
  const photo=await getPhoto(r.id);
  const fav=isFavorite(r.id);
  main.innerHTML=`
    <button class="detail-back" id="backBtn">← Retour aux recettes</button>
    <section class="detail-hero">
      <div class="detail-media">${photo?`<img src="${photo}" alt="${esc(r.nom)}">`:fallbackMedia(r,true)}</div>
      <div class="detail-content">
        <h2>${esc(r.nom)}</h2>
        <div class="badges"><span class="badge">${esc(r.categorie)}</span><span class="badge ig">${esc(r.profil_ig || "IG non précisé")}</span>${r.proteinee==="Oui"?`<span class="badge protein">Protéinée</span>`:""}</div>
        <div class="actions">
          <button class="primary-btn" id="photoBtn">${photo?"Changer ma photo":"Ajouter ma photo"}</button>
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
    removePhotoBtn.classList.toggle("hidden",!photo);
    photoInput.value="";
    photoDialog.showModal();
  });
}

function updateNav(){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));
}
function render(){
  updateNav();
  if(state.selected) return renderDetail();
  if(state.view==="home") return renderHome();
  if(state.view==="favorites") return renderRecipeList("Mes favoris");
  return renderRecipeList("Recettes");
}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{
  state.view=b.dataset.view; state.selected=null; state.category=""; state.ig=""; state.search=""; render();
}));

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
