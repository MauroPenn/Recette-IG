// PECTORAUX V1 — les bandeaux restent simples, les informations sont dans les fiches.
const pectorauxExercices = [
  {
    id:"pompes-classiques", titre:"Pompes classiques", image:"./pectoraux-pompes-classiques.webp", reference:true,
    cible:"Pectoraux, triceps, épaules antérieures", materiel:"Poids du corps", niveau:"Intermédiaire",
    series:"3", repetitions:"8 à 12, ou jusqu'à 60 s", tempo:"2–0–2", repos:"45 à 60 s",
    execution:["Place les mains légèrement plus larges que les épaules.","Garde le corps gainé et aligné de la tête aux talons.","Descends la poitrine vers le sol sans cambrer les lombaires.","Repousse le sol pour revenir bras presque tendus."],
    conseil:"Inspire en descendant et expire en poussant. Si nécessaire, commence avec les mains sur un support stable.",
    erreurs:"Bassin qui s'affaisse, tête projetée vers l'avant, coudes très écartés."
  },
  {
    id:"pompes-inclinees", titre:"Pompes inclinées", image:"./pectoraux-pompes-inclinees.webp",
    cible:"Pectoraux, triceps, épaules antérieures", materiel:"Support surélevé et stable", niveau:"Débutant",
    series:"3", repetitions:"10 à 15", tempo:"2–0–2", repos:"45 à 60 s",
    execution:["Place les mains sur un support stable, légèrement plus larges que les épaules.","Recule les pieds pour former une ligne droite de la tête aux talons.","Amène lentement la poitrine vers le support.","Repousse pour revenir à la position initiale."],
    conseil:"Plus le support est haut, plus l'exercice est accessible. Vérifie qu'il ne peut pas glisser.",
    erreurs:"Plier le bassin, creuser le dos, utiliser un meuble instable."
  },
  {
    id:"pompes-declinees", titre:"Pompes déclinées", image:"./pectoraux-pompes-declinees.webp",
    cible:"Pectoraux (accent sur la portion supérieure), triceps", materiel:"Appui surélevé et stable pour les pieds", niveau:"Avancé",
    series:"3", repetitions:"6 à 12", tempo:"2–0–2", repos:"60 à 90 s",
    execution:["Pose les pieds sur un support bas et stable, mains au sol.","Gaine le tronc et maintiens une ligne droite de la tête aux chevilles.","Fléchis les bras en contrôlant la descente.","Pousse pour remonter sans laisser le bassin tomber."],
    conseil:"Commence avec une faible hauteur. Reviens aux pompes classiques si les épaules ou le bas du dos perdent leur alignement.",
    erreurs:"Support trop haut, épaules crispées, dos creusé."
  },
  {
    id:"developpe-sol-halteres", titre:"Développé couché au sol avec haltères", image:"./pectoraux-developpe-sol-halteres.webp",
    cible:"Pectoraux, triceps, épaules antérieures", materiel:"Deux haltères et tapis", niveau:"Tous niveaux",
    series:"3", repetitions:"8 à 12", tempo:"2–0–2", repos:"60 à 90 s",
    execution:["Allonge-toi sur le dos, genoux fléchis et pieds à plat.","Tiens les haltères au-dessus de la poitrine, poignets droits.","Descends en contrôlant jusqu'à ce que les bras touchent doucement le sol.","Pousse les haltères vers le haut sans les entrechoquer."],
    conseil:"Choisis des charges faciles à contrôler. Le sol limite l'amplitude et évite de descendre trop bas.",
    erreurs:"Rebondir avec les coudes au sol, cambrer fortement, casser les poignets."
  },
  {
    id:"ecarte-sol-halteres", titre:"Écartés au sol avec haltères", image:"./pectoraux-ecarte-sol-halteres.webp",
    cible:"Pectoraux, stabilisateurs de l'épaule", materiel:"Deux haltères légers et tapis", niveau:"Intermédiaire",
    series:"3", repetitions:"10 à 15", tempo:"3–0–2", repos:"60 s",
    execution:["Allonge-toi sur le dos avec un haltère dans chaque main.","Garde les coudes légèrement fléchis et fixes pendant le mouvement.","Ouvre progressivement les bras jusqu'à frôler le sol avec les bras.","Ramène les mains au-dessus de la poitrine dans un arc contrôlé."],
    conseil:"Utilise plus léger que pour le développé. Arrête l'amplitude avant toute gêne à l'épaule.",
    erreurs:"Bras complètement verrouillés, charge trop lourde, ouverture forcée."
  },
  {
    id:"pullover-haltere", titre:"Pull-over avec haltère", image:"./pectoraux-pullover-haltere.webp",
    cible:"Pectoraux et grand dorsal selon la technique", materiel:"Un haltère et tapis", niveau:"Intermédiaire",
    series:"3", repetitions:"10 à 12", tempo:"2–0–2", repos:"60 à 90 s",
    execution:["Allonge-toi au sol, genoux fléchis, un haltère tenu à deux mains.","Place-le au-dessus de la poitrine, coudes légèrement fléchis.","Descends lentement les bras vers l'arrière, sans forcer sur les épaules.","Ramène l'haltère au-dessus de la poitrine en contrôlant."],
    conseil:"Garde le ventre gainé et utilise une amplitude confortable. Ne cherche pas à poser l'haltère derrière la tête.",
    erreurs:"Cambrer le bas du dos, descendre trop loin, perdre le contrôle de l'haltère."
  },
  {
    id:"presse-unilaterale-sol", titre:"Presse unilatérale au sol", image:"./pectoraux-presse-unilaterale-sol.webp",
    cible:"Pectoraux, triceps, stabilisateurs du tronc", materiel:"Un haltère et tapis", niveau:"Intermédiaire",
    series:"3 par bras", repetitions:"8 à 12 par bras", tempo:"2–0–2", repos:"45 à 60 s entre les bras",
    execution:["Allonge-toi sur le dos, genoux pliés, un haltère dans une main.","Garde les deux épaules en contact avec le sol.","Descends l'haltère à côté de la poitrine en gardant le poignet aligné.","Pousse vers le haut sans faire tourner le buste, puis change de bras."],
    conseil:"Commence avec une charge modérée. Le but est de garder le tronc stable pendant la poussée.",
    erreurs:"Tourner le buste, décoller une épaule, pousser trop vite."
  },
  {
    id:"pompes-prise-large", titre:"Pompes prise large", image:"./pectoraux-pompes-prise-large.webp",
    cible:"Pectoraux, triceps", materiel:"Poids du corps", niveau:"Intermédiaire",
    series:"3", repetitions:"8 à 12", tempo:"2–0–2", repos:"60 s",
    execution:["Place les mains un peu plus écartées que pour les pompes classiques.","Garde le ventre et les fessiers contractés.","Descends lentement sans écarter excessivement les coudes.","Remonte en maintenant les épaules stables."],
    conseil:"Évite les prises extrêmement larges. Reviens aux pompes classiques si les épaules sont inconfortables.",
    erreurs:"Mains trop éloignées, bassin affaissé, descente forcée."
  },
  {
    id:"pompes-tempo-lent", titre:"Pompes tempo lent", image:"./pectoraux-pompes-tempo-lent.webp",
    cible:"Pectoraux, triceps, gainage", materiel:"Poids du corps", niveau:"Intermédiaire à avancé",
    series:"3", repetitions:"6 à 10", tempo:"4–1–2", repos:"60 à 90 s",
    execution:["Installe-toi en position de pompes classiques, corps gainé.","Descends lentement pendant quatre secondes.","Marque une seconde de pause près du sol, sans te relâcher.","Remonte en deux secondes en gardant une technique régulière."],
    conseil:"Réduis le nombre de répétitions si nécessaire : la qualité du tempo passe avant la quantité.",
    erreurs:"Accélérer en fin de série, creuser le dos, retenir sa respiration."
  },
  {
    id:"squeeze-press-halteres", titre:"Squeeze press avec haltères", image:"./pectoraux-squeeze-press-halteres.webp",
    cible:"Pectoraux, triceps", materiel:"Deux haltères et tapis", niveau:"Intermédiaire",
    series:"3", repetitions:"10 à 15", tempo:"2–0–2", repos:"60 s",
    execution:["Allonge-toi sur le dos, genoux fléchis, haltères réunis au-dessus de la poitrine.","Maintiens les haltères proches l'un de l'autre en exerçant une légère pression vers l'intérieur.","Descends les mains ensemble jusqu'à proximité de la poitrine.","Repousse vers le haut tout en gardant la pression contrôlée."],
    conseil:"Garde les poignets neutres. Vérifie que les haltères ne glissent pas l'un contre l'autre.",
    erreurs:"Forcer excessivement la pression, casser les poignets, laisser tomber les coudes."
  }
];
let selectedPectoralExercise = null;
function pectorauxPhotoMarkup(exercice, detail=false){
  const estReference=exercice.reference===true;
  return `<span style="--pectoral-photo:url(\'${exercice.image}\')" class="muscu-pectoraux-photo ${estReference?"muscu-pectoraux-photo-reference":"muscu-pectoraux-photo-recadree"}"><img src="${exercice.image}" alt="" loading="${detail?"eager":"lazy"}"></span>`;
}
function renderMuscuPectoraux(){
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-pectoraux-v1" aria-label="Exercices pectoraux">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuPectorauxBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Pectoraux</h2>
          <p>10 exercices pour renforcer les pectoraux à la maison</p>
        </div>
      </div>
      <div class="muscu-pectoraux-list">
        ${pectorauxExercices.map(exercice=>`<button type="button" class="muscu-pectoraux-card ${exercice.reference?"muscu-pectoraux-carte-reference":"muscu-pectoraux-carte-recadree"}" data-pectoraux-exercise="${exercice.id}" aria-label="Ouvrir la fiche ${esc(exercice.titre)}">
          ${pectorauxPhotoMarkup(exercice)}
          ${exercice.reference?"":`<span class="muscu-pectoraux-fondu" aria-hidden="true"></span><span class="muscu-pectoraux-card-titre">${esc(exercice.titre)}</span><span class="muscu-pectoraux-card-fleche" aria-hidden="true">›</span>`}
        </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuPectorauxBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-pectoraux-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedPectoralExercise=btn.dataset.pectorauxExercise;
    renderMuscuPectorauxDetail();
  }));
}
function renderMuscuPectorauxDetail(){
  const exercice=pectorauxExercices.find(x=>x.id===selectedPectoralExercise);
  if(!exercice){state.view="muscu-pectoraux";return renderMuscuPectoraux();}
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-pectoraux-v1 muscu-pectoraux-fiche" aria-label="Fiche ${esc(exercice.titre)}">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuPectorauxDetailBack" aria-label="Retour à la liste Pectoraux">
        <span class="muscu-back-arrow">←</span><span>Retour aux pectoraux</span>
      </button>
      <header class="muscu-pectoraux-fiche-en-tete">
        <div class="muscu-biceps-kicker">PECTORAUX · FICHE EXERCICE</div>
        <h2>${esc(exercice.titre)}</h2>
        <p>${esc(exercice.cible)}</p>
      </header>
      <div class="muscu-pectoraux-fiche-visuel">
        ${pectorauxPhotoMarkup(exercice,true)}
        ${exercice.reference?"":`<span class="muscu-pectoraux-fondu" aria-hidden="true"></span><span class="muscu-pectoraux-card-titre">${esc(exercice.titre)}</span>`}
      </div>
      <div class="muscu-pectoraux-fiche-stats">
        <div><span>Matériel</span><strong>${esc(exercice.materiel)}</strong></div>
        <div><span>Niveau</span><strong>${esc(exercice.niveau)}</strong></div>
        <div><span>Séries</span><strong>${esc(exercice.series)}</strong></div>
        <div><span>Répétitions</span><strong>${esc(exercice.repetitions)}</strong></div>
        <div><span>Tempo</span><strong>${esc(exercice.tempo)}</strong></div>
        <div><span>Repos</span><strong>${esc(exercice.repos)}</strong></div>
      </div>
      <section class="muscu-pectoraux-fiche-section">
        <h3>Exécution</h3>
        <ol>${exercice.execution.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      </section>
      <section class="muscu-pectoraux-fiche-section">
        <h3>Conseil</h3><p>${esc(exercice.conseil)}</p>
      </section>
      <section class="muscu-pectoraux-fiche-section">
        <h3>Erreurs à éviter</h3><p>${esc(exercice.erreurs)}</p>
      </section>
      <p class="muscu-pectoraux-precaution">Adapte l'amplitude et la charge à ton niveau. Arrête l'exercice si une douleur apparaît.</p>
    </section>`;
  document.getElementById("muscuPectorauxDetailBack")?.addEventListener("click",()=>{
    renderMuscuPectoraux();
  });
}

// Les écrans Pectoraux n'étaient pas inclus dans le calcul du bandeau principal.
// On corrige uniquement cet écran, sans affecter Cuisine ou Biceps.
const ancienneMiseAJourBandeauPectoraux = updateShell;
updateShell = function(){
  ancienneMiseAJourBandeauPectoraux();
  if(state.view === "muscu-pectoraux"){
    bottomNav.classList.add("hidden");
    brandMark.textContent = "M";
    brandEyebrow.textContent = "Ma bibliothèque";
    brandTitle.textContent = "Musculation";
  }
};
