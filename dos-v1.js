// DOS V1 — 10 bandeaux complets de 560 x 190; détails dans les fiches.
const dosExercices = [
  {
    id:"rowing-unilateral-haltere", titre:"Rowing unilatéral avec haltère", image:"./dos-rowing-unilateral-haltere.webp",
    cible:"Grand dorsal, milieu du dos, biceps, gainage", materiel:"Un haltère et un appui stable", niveau:"Intermédiaire",
    series:"3 par bras", repetitions:"8 à 12 par bras", tempo:"2–1–2", repos:"45 à 60 s entre les bras",
    execution:["Place un genou et une main sur un support stable, le dos plat.","Saisis l'haltère de l'autre main, bras tendu vers le sol.","Tire l'haltère vers la hanche en gardant le coude près du buste.","Redescends lentement sans arrondir le dos puis change de côté."],
    conseil:"Cherche le coude en arrière plutôt que l'épaule en hauteur. Garde le tronc stable tout au long du mouvement.",
    erreurs:"Tourner le buste, hausser l'épaule, tirer vers la poitrine au lieu de la hanche."
  },
  {
    id:"rowing-buste-penche-halteres", titre:"Rowing buste penché (2 haltères)", image:"./dos-rowing-buste-penche-halteres.webp",
    cible:"Grand dorsal, trapèzes, rhomboïdes, biceps", materiel:"Deux haltères", niveau:"Intermédiaire",
    series:"3", repetitions:"8 à 12", tempo:"2–1–2", repos:"60 s",
    execution:["Tiens un haltère dans chaque main, pieds largeur de hanches.","Pousse les hanches en arrière et penche le buste en gardant le dos plat.","Tire les deux coudes vers l'arrière en serrant les omoplates.","Redescends les haltères sous contrôle sans arrondir le haut du dos."],
    conseil:"Regarde légèrement devant toi pour garder la nuque neutre. Réduis la charge si tu perds le dos plat.",
    erreurs:"Dos rond, élan avec les jambes, épaules remontées vers les oreilles."
  },
  {
    id:"pullover-haltere", titre:"Pull-over avec haltère", image:"./dos-pullover-haltere.webp",
    cible:"Grand dorsal, pectoraux, triceps long", materiel:"Un haltère et tapis", niveau:"Intermédiaire",
    series:"3", repetitions:"10 à 12", tempo:"2–0–2", repos:"60 s",
    execution:["Allonge-toi sur le dos, genoux fléchis, un haltère tenu à deux mains.","Place l'haltère au-dessus de la poitrine, coudes légèrement fléchis.","Descends les bras derrière la tête sans cambrer le bas du dos.","Ramène l'haltère au-dessus de la poitrine en gardant le mouvement fluide."],
    conseil:"Pour cibler davantage le dos, pense à tirer avec les aisselles et non seulement avec les bras.",
    erreurs:"Descendre trop bas, verrouiller les coudes, creuser les lombaires."
  },
  {
    id:"oiseau-buste-penche", titre:"Oiseau buste penché (haut du dos)", image:"./dos-oiseau-buste-penche.webp",
    cible:"Arrière d'épaules, rhomboïdes, haut du dos", materiel:"Deux haltères légers", niveau:"Tous niveaux",
    series:"3", repetitions:"12 à 15", tempo:"2–1–2", repos:"45 à 60 s",
    execution:["Penche le buste en avant, dos plat, haltères sous les épaules.","Garde les coudes légèrement fléchis.","Ouvre les bras sur les côtés jusqu'à la ligne des épaules.","Reviens lentement en contrôlant la descente."],
    conseil:"Utilise léger et cherche la qualité de contraction du haut du dos plutôt que la charge.",
    erreurs:"Balancer le buste, monter les trapèzes, tendre complètement les bras."
  },
  {
    id:"superman-sol", titre:"Superman (lombaires et dos)", image:"./dos-superman-sol.webp",
    cible:"Lombaires, fessiers, haut du dos", materiel:"Tapis", niveau:"Débutant à intermédiaire",
    series:"3", repetitions:"10 à 15 ou 20 à 30 s", tempo:"2–2–2", repos:"45 s",
    execution:["Allonge-toi sur le ventre, bras tendus devant toi.","Contracte les fessiers et soulève légèrement bras, poitrine et jambes.","Marque un court temps de maintien en haut.","Redescends lentement sans relâcher complètement entre deux répétitions."],
    conseil:"Lève peu mais proprement. La sensation doit être surtout dans la chaîne postérieure, pas dans la nuque.",
    erreurs:"Lever trop haut, casser la nuque, donner des à-coups."
  },
  {
    id:"bird-dog-row", titre:"Bird-Dog Row (dos et gainage)", image:"./dos-bird-dog-row.webp",
    cible:"Dos, gainage, stabilité du tronc", materiel:"Un haltère", niveau:"Intermédiaire",
    series:"3 par côté", repetitions:"8 à 10 par côté", tempo:"2–1–2", repos:"45 s",
    execution:["Place-toi à quatre pattes avec un haltère sous une main.","Tends la jambe opposée en arrière en gardant le bassin stable.","Rame l'haltère vers la hanche sans tourner le tronc.","Repose sous contrôle puis change de côté."],
    conseil:"Commence sans charge si l'équilibre est difficile. Le bassin doit rester presque immobile.",
    erreurs:"Tourner les épaules, lever la jambe trop haut, perdre l'alignement."
  },
  {
    id:"rowing-kettlebell", titre:"Rowing kettlebell", image:"./dos-rowing-kettlebell.webp",
    cible:"Grand dorsal, trapèzes, biceps", materiel:"Une kettlebell ou un haltère", niveau:"Intermédiaire",
    series:"3 par bras", repetitions:"8 à 12 par bras", tempo:"2–1–2", repos:"45 à 60 s",
    execution:["Adopte la même position qu'un rowing unilatéral avec appui.","Saisis la kettlebell et laisse le bras s'allonger naturellement.","Tire vers la hanche en gardant le coude près du corps.","Redescends sous contrôle avant de passer de l'autre côté."],
    conseil:"Laisse l'omoplate bouger naturellement en bas puis serre-la à la montée.",
    erreurs:"Tirer vers l'épaule, tourner le buste, tirer avec un élan."
  },
  {
    id:"souleve-terre-roumain", titre:"Soulevé de terre roumain", image:"./dos-souleve-terre-roumain.webp",
    cible:"Ischio-jambiers, fessiers, lombaires, dos postural", materiel:"Deux haltères ou kettlebells", niveau:"Intermédiaire",
    series:"3", repetitions:"8 à 12", tempo:"3–1–2", repos:"60 à 90 s",
    execution:["Tiens les charges devant les cuisses, pieds largeur de hanches.","Pousse les hanches en arrière en gardant les genoux légèrement fléchis.","Descends les charges le long des jambes en gardant le dos neutre.","Remonte en poussant les hanches vers l'avant et en contractant les fessiers."],
    conseil:"Le mouvement vient surtout des hanches. Garde les charges proches des jambes pendant toute la descente.",
    erreurs:"Arrondir le dos, descendre trop bas, transformer l'exercice en squat."
  },
  {
    id:"tirage-coudes-ouverts-halteres", titre:"Tirage coudes ouverts", image:"./dos-tirage-coudes-ouverts-halteres.webp",
    cible:"Haut du dos, arrière d'épaules, trapèzes moyens", materiel:"Deux haltères", niveau:"Intermédiaire",
    series:"3", repetitions:"10 à 15", tempo:"2–1–2", repos:"45 à 60 s",
    execution:["Penche légèrement le buste avec un haltère dans chaque main.","Tire les coudes vers l'extérieur et vers le haut.","Concentre-toi sur le rapprochement des omoplates.","Redescends lentement en gardant la poitrine ouverte."],
    conseil:"Prends des charges modérées. Cherche le haut du dos plutôt qu'un mouvement très lourd.",
    erreurs:"Hausser les épaules, arrondir le haut du dos, donner un coup d'élan."
  },
  {
    id:"extension-lombaire-sol", titre:"Extension lombaire au sol", image:"./dos-extension-lombaire-sol.webp",
    cible:"Lombaires, fessiers, muscles posturaux", materiel:"Tapis", niveau:"Débutant à intermédiaire",
    series:"3", repetitions:"12 à 15", tempo:"2–2–2", repos:"45 s",
    execution:["Allonge-toi sur le ventre, mains derrière la tête ou le long du corps.","Contracte les abdos légèrement pour protéger les lombaires.","Soulève doucement la poitrine de quelques centimètres.","Redescends lentement sans te laisser tomber."],
    conseil:"L'amplitude peut rester courte. Cherche une montée contrôlée sans douleur dans le bas du dos.",
    erreurs:"Tirer sur la nuque, monter trop haut, faire le mouvement trop vite."
  }
];
let selectedDosExercise = null;
function dosPhotoMarkup(exercice, detail=false){
  return `<span class="muscu-dos-photo"><img src="${exercice.image}" alt="" loading="${detail?"eager":"lazy"}"></span>`;
}
function renderMuscuDos(){
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-dos-v1" aria-label="Exercices dos">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuDosBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Dos</h2>
          <p>10 exercices pour renforcer le dos à la maison</p>
        </div>
      </div>
      <div class="muscu-dos-list">
        ${dosExercices.map(exercice=>`<button type="button" class="muscu-dos-card" data-dos-exercise="${exercice.id}" aria-label="Ouvrir la fiche ${esc(exercice.titre)}">
          ${dosPhotoMarkup(exercice)}
        </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuDosBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-dos-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedDosExercise=btn.dataset.dosExercise;
    renderMuscuDosDetail();
  }));
}
function renderMuscuDosDetail(){
  const exercice=dosExercices.find(x=>x.id===selectedDosExercise);
  if(!exercice){state.view="muscu-dos";return renderMuscuDos();}
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-dos-v1 muscu-dos-fiche" aria-label="Fiche ${esc(exercice.titre)}">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuDosDetailBack" aria-label="Retour à la liste Dos">
        <span class="muscu-back-arrow">←</span><span>Retour au dos</span>
      </button>
      <header class="muscu-dos-fiche-en-tete">
        <div class="muscu-biceps-kicker">DOS · FICHE EXERCICE</div>
        <h2>${esc(exercice.titre)}</h2>
        <p>${esc(exercice.cible)}</p>
      </header>
      <div class="muscu-dos-fiche-visuel">
        ${dosPhotoMarkup(exercice,true)}
      </div>
      <div class="muscu-dos-fiche-stats">
        <div><span>Matériel</span><strong>${esc(exercice.materiel)}</strong></div>
        <div><span>Niveau</span><strong>${esc(exercice.niveau)}</strong></div>
        <div><span>Séries</span><strong>${esc(exercice.series)}</strong></div>
        <div><span>Répétitions</span><strong>${esc(exercice.repetitions)}</strong></div>
        <div><span>Tempo</span><strong>${esc(exercice.tempo)}</strong></div>
        <div><span>Repos</span><strong>${esc(exercice.repos)}</strong></div>
      </div>
      <section class="muscu-dos-fiche-section">
        <h3>Exécution</h3>
        <ol>${exercice.execution.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      </section>
      <section class="muscu-dos-fiche-section">
        <h3>Conseil</h3><p>${esc(exercice.conseil)}</p>
      </section>
      <section class="muscu-dos-fiche-section">
        <h3>Erreurs à éviter</h3><p>${esc(exercice.erreurs)}</p>
      </section>
      <p class="muscu-dos-precaution">Adapte l'amplitude et la charge à ton niveau. Arrête l'exercice si une douleur apparaît.</p>
    </section>`;
  document.getElementById("muscuDosDetailBack")?.addEventListener("click",()=>{ renderMuscuDos(); });
}
const ancienneMiseAJourBandeauDos = updateShell;
updateShell = function(){
  ancienneMiseAJourBandeauDos();
  if(state.view === "muscu-dos"){
    bottomNav.classList.add("hidden");
    brandMark.textContent = "M";
    brandEyebrow.textContent = "Ma bibliothèque";
    brandTitle.textContent = "Musculation";
  }
};
