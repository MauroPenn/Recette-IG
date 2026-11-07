const tricepsExercices = [
  {
    id: "pompes-diamant",
    titre: "Pompes diamant",
    cible: "Triceps, poitrine, gainage",
    materiel: "Poids du corps et tapis",
    niveau: "Intermédiaire",
    series: "3",
    repetitions: "6 à 12",
    tempo: "2–0–2",
    repos: "60 à 90 s",
    execution: [
      "Place les mains proches l’une de l’autre sous la poitrine, pouces et index presque en diamant.",
      "Aligne tête, bassin et jambes en planche.",
      "Descends sous contrôle en gardant les coudes proches du buste.",
      "Repousse jusqu’à la position haute sans laisser le bassin s’affaisser."
    ],
    conseil: "Si c’est trop difficile, réalise l’exercice sur les genoux ou sur un support surélevé.",
    erreurs: "Coudes trop écartés, dos creusé, mouvement trop rapide, amplitude incomplète.",
    image: "./triceps-pompes-diamant.webp"
  },
  {
    id: "dips-sur-chaise",
    titre: "Dips sur chaise",
    cible: "Triceps, épaules antérieures, poitrine en assistance",
    materiel: "Chaise ou banc stable",
    niveau: "Débutant à intermédiaire",
    series: "3",
    repetitions: "8 à 15",
    tempo: "2–0–2",
    repos: "45 à 60 s",
    execution: [
      "Place les mains sur le bord d’une chaise stable, doigts vers l’avant.",
      "Avance légèrement les pieds et garde la poitrine ouverte.",
      "Fléchis les coudes pour descendre le bassin vers le sol sans hausser les épaules.",
      "Pousse dans les paumes pour revenir en extension sans verrouiller brutalement les coudes."
    ],
    conseil: "Garde les coudes dirigés vers l’arrière. Raccourcis l’amplitude si les épaules sont sensibles.",
    erreurs: "Chaise instable, épaules remontées, descente trop profonde, pieds trop loin pour ton niveau.",
    image: "./triceps-dips-sur-chaise.webp"
  },
  {
    id: "kickback-triceps",
    titre: "Kickback triceps",
    cible: "Triceps, surtout la portion latérale",
    materiel: "Un ou deux haltères",
    niveau: "Tous niveaux",
    series: "3",
    repetitions: "10 à 15",
    tempo: "2–1–2",
    repos: "45 s",
    execution: [
      "Penche légèrement le buste en gardant le dos droit et les abdominaux engagés.",
      "Monte le coude près du buste à environ 90 degrés.",
      "Tends l’avant-bras vers l’arrière jusqu’à sentir la contraction du triceps.",
      "Reviens lentement sans laisser le coude redescendre."
    ],
    conseil: "Choisis une charge modérée : la qualité du verrouillage est plus importante que la charge lourde.",
    erreurs: "Balancer le bras, bouger le coude, arrondir le dos, lancer l’haltère.",
    image: "./triceps-kickback-triceps.webp"
  },
  {
    id: "extension-nuque-deux-mains",
    titre: "Extension nuque à deux mains",
    cible: "Triceps, longue portion",
    materiel: "Un haltère tenu à deux mains",
    niveau: "Tous niveaux",
    series: "3",
    repetitions: "10 à 15",
    tempo: "2–1–2",
    repos: "45 à 60 s",
    execution: [
      "Saisis la tête de l’haltère avec les deux mains et place-le au-dessus du crâne.",
      "Garde les coudes resserrés et le thorax gainé.",
      "Descends lentement derrière la tête jusqu’à l’amplitude confortable.",
      "Remonte sous contrôle en tendant les coudes."
    ],
    conseil: "Travaille proprement plutôt que lourd pour bien sentir l’étirement du triceps.",
    erreurs: "Coudes qui s’ouvrent, dos trop cambré, épaules remontées, descente incontrôlée.",
    image: "./triceps-extension-nuque-deux-mains.webp"
  },
  {
    id: "extension-triceps-unilaterale",
    titre: "Extension triceps unilatérale",
    cible: "Triceps, correction des déséquilibres droite/gauche",
    materiel: "Un haltère",
    niveau: "Tous niveaux",
    series: "3 par bras",
    repetitions: "8 à 12 par bras",
    tempo: "2–1–2",
    repos: "30 à 45 s entre bras",
    execution: [
      "Tiens un haltère d’une main au-dessus de la tête.",
      "Stabilise le buste et garde le coude proche de l’oreille.",
      "Descends l’haltère derrière la tête en fléchissant le coude.",
      "Tends le bras pour revenir en haut avant de changer de côté."
    ],
    conseil: "Travaille d’abord le côté le plus faible pour équilibrer la force et la coordination.",
    erreurs: "Se pencher sur le côté, ouvrir excessivement le coude, aller trop vite, oublier de gainer.",
    image: "./triceps-extension-triceps-unilaterale.webp"
  },
  {
    id: "extension-triceps-travers-corps",
    titre: "Extension triceps en travers du corps",
    cible: "Triceps, surtout la longue portion",
    materiel: "Un haltère et un tapis",
    niveau: "Intermédiaire",
    series: "3 par bras",
    repetitions: "10 à 12 par bras",
    tempo: "2–1–2",
    repos: "45 à 60 s",
    execution: [
      "Allonge-toi sur le dos, genoux fléchis, un haltère dans une main.",
      "Tends le bras chargé vers le haut, au-dessus de l’épaule ; stabilise le haut du bras.",
      "Plie lentement le coude pour faire descendre l’haltère en diagonale vers l’épaule opposée, sans tourner le torse.",
      "Tends le coude pour remonter sous contrôle, puis change de bras."
    ],
    conseil: "Commence avec un haltère léger ; conserve l’épaule stable et une amplitude indolore.",
    erreurs: "Bouger l’épaule au lieu du coude, descendre trop près du visage, utiliser l’élan ou cambrer le dos.",
    image: "./triceps-extension-triceps-travers-corps.webp"
  },
  {
    id: "extension-triceps-allonge-sol",
    titre: "Extension triceps allongé au sol",
    cible: "Triceps",
    materiel: "Deux haltères et tapis",
    niveau: "Intermédiaire",
    series: "3",
    repetitions: "8 à 12",
    tempo: "2–1–2",
    repos: "60 s",
    execution: [
      "Allonge-toi au sol, bras tendus au-dessus de la poitrine, haltères en main.",
      "Garde les bras quasi verticaux et les coudes orientés vers le plafond.",
      "Fléchis les coudes pour descendre les haltères près des tempes.",
      "Tends les bras pour revenir en haut sans laisser les coudes s’écarter."
    ],
    conseil: "Le sol limite l’amplitude et aide à rester en sécurité. Contrôle bien la descente.",
    erreurs: "Bras qui partent vers l’arrière, poignets cassés, choc des haltères, coudes trop ouverts.",
    image: "./triceps-extension-triceps-allonge-sol.webp"
  },
  {
    id: "tate-press-sol",
    titre: "Tate press au sol",
    cible: "Triceps, surtout portion latérale et médiale",
    materiel: "Deux haltères et tapis",
    niveau: "Intermédiaire",
    series: "3",
    repetitions: "10 à 12",
    tempo: "2–1–2",
    repos: "60 s",
    execution: [
      "Allonge-toi au sol, haltères au-dessus de la poitrine, paumes se faisant face.",
      "Fléchis les coudes en dirigeant les haltères vers la poitrine.",
      "Garde les bras supérieurs relativement fixes.",
      "Tends les coudes pour remonter les haltères à la verticale."
    ],
    conseil: "Commence léger : le Tate press demande de la précision et un bon contrôle des coudes.",
    erreurs: "Amplitude trop grande, trajectoire confuse, charges trop lourdes, poignets instables.",
    image: "./triceps-tate-press-sol.webp"
  },
  {
    id: "developpe-serre-sol",
    titre: "Développé serré au sol",
    cible: "Triceps, poitrine, épaules antérieures",
    materiel: "Deux haltères et tapis",
    niveau: "Tous niveaux",
    series: "3",
    repetitions: "8 à 12",
    tempo: "2–0–2",
    repos: "60 s",
    execution: [
      "Allonge-toi au sol, genoux fléchis, haltères au-dessus de la poitrine.",
      "Garde une prise serrée et les coudes relativement proches du buste.",
      "Descends jusqu’au contact léger des bras avec le sol.",
      "Pousse vers le haut en accentuant l’extension des triceps."
    ],
    conseil: "Le développé serré est plus confortable au sol et très utile pour cibler les triceps à la maison.",
    erreurs: "Coudes trop écartés, charge trop lourde, poignets cassés, rebond sur le sol.",
    image: "./triceps-developpe-serre-sol.webp"
  },
  {
    id: "dips-entre-deux-supports",
    titre: "Dips entre deux supports",
    cible: "Triceps, poitrine et épaules en assistance",
    materiel: "Deux supports stables de même hauteur",
    niveau: "Intermédiaire à avancé",
    series: "3",
    repetitions: "6 à 12",
    tempo: "2–0–2",
    repos: "60 à 90 s",
    execution: [
      "Place-toi entre deux supports solides et prends appui avec les mains.",
      "Décolle les pieds ou aide-toi légèrement au sol selon ton niveau.",
      "Descends sous contrôle en gardant les coudes dirigés vers l’arrière.",
      "Pousse fort pour remonter sans rebond ni à-coup."
    ],
    conseil: "Réserve cet exercice à des supports réellement stables. Réduis l’amplitude si les épaules sont fragiles.",
    erreurs: "Supports instables, descente trop basse, épaules remontées, coude qui part sur les côtés.",
    image: "./triceps-dips-entre-deux-supports.webp"
  }
];
let selectedTricepsExercise = null;
function tricepsPhotoMarkup(exercice, detail=false){
  return `<span class="muscu-triceps-photo"><img src="${exercice.image}" alt="" loading="${detail?"eager":"lazy"}"></span>`;
}
function renderMuscuTriceps(){
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-triceps-v1" aria-label="Exercices triceps">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuTricepsBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Triceps</h2>
          <p>10 exercices pour renforcer les triceps à la maison</p>
        </div>
      </div>
      <div class="muscu-triceps-list">
        ${tricepsExercices.map(exercice=>`<button type="button" class="muscu-triceps-card" data-triceps-exercise="${exercice.id}" aria-label="Ouvrir la fiche ${esc(exercice.titre)}">
          ${tricepsPhotoMarkup(exercice)}
        </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuTricepsBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-triceps-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedTricepsExercise=btn.dataset.tricepsExercise;
    renderMuscuTricepsDetail();
  }));
}
function renderMuscuTricepsDetail(){
  const exercice=tricepsExercices.find(x=>x.id===selectedTricepsExercise);
  if(!exercice){state.view="muscu-triceps";return renderMuscuTriceps();}
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-triceps-v1 muscu-triceps-fiche" aria-label="Fiche ${esc(exercice.titre)}">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuTricepsDetailBack" aria-label="Retour à la liste Triceps">
        <span class="muscu-back-arrow">←</span><span>Retour aux triceps</span>
      </button>
      <header class="muscu-triceps-fiche-en-tete">
        <div class="muscu-biceps-kicker">TRICEPS · FICHE EXERCICE</div>
        <h2>${esc(exercice.titre)}</h2>
        <p>${esc(exercice.cible)}</p>
      </header>
      <div class="muscu-triceps-fiche-visuel">${tricepsPhotoMarkup(exercice,true)}</div>
      <div class="muscu-triceps-fiche-stats">
        <div><span>Matériel</span><strong>${esc(exercice.materiel)}</strong></div>
        <div><span>Niveau</span><strong>${esc(exercice.niveau)}</strong></div>
        <div><span>Séries</span><strong>${esc(exercice.series)}</strong></div>
        <div><span>Répétitions</span><strong>${esc(exercice.repetitions)}</strong></div>
        <div><span>Tempo</span><strong>${esc(exercice.tempo)}</strong></div>
        <div><span>Repos</span><strong>${esc(exercice.repos)}</strong></div>
      </div>
      <section class="muscu-triceps-fiche-section">
        <h3>Exécution</h3>
        <ol>${exercice.execution.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      </section>
      <section class="muscu-triceps-fiche-section"><h3>Conseil</h3><p>${esc(exercice.conseil)}</p></section>
      <section class="muscu-triceps-fiche-section"><h3>Erreurs à éviter</h3><p>${esc(exercice.erreurs)}</p></section>
      <p class="muscu-triceps-precaution">Adapte la charge et l’amplitude à ton niveau. Arrête si une douleur apparaît, surtout au niveau des coudes ou des épaules.</p>
    </section>`;
  document.getElementById("muscuTricepsDetailBack")?.addEventListener("click",()=>{ renderMuscuTriceps(); });
}
const ancienneMiseAJourBandeauTriceps = updateShell;
updateShell = function(){
  ancienneMiseAJourBandeauTriceps();
  if(state.view === "muscu-triceps"){
    bottomNav.classList.add("hidden");
    brandMark.textContent = "M";
    brandEyebrow.textContent = "Ma bibliothèque";
    brandTitle.textContent = "Musculation";
  }
};
const ancienneFonctionListeMusclesAvantTriceps = renderMuscuExercises;
renderMuscuExercises = function(){
  ancienneFonctionListeMusclesAvantTriceps();
  const ancienBoutonTriceps = main.querySelector('[data-muscle="triceps"]');
  if (!ancienBoutonTriceps) return;
  const boutonTriceps = ancienBoutonTriceps.cloneNode(true);
  ancienBoutonTriceps.replaceWith(boutonTriceps);
  boutonTriceps.addEventListener("click", () => {
    state.view = "muscu-triceps";
    state.selected = null;
    render();
  });
};
const ancienneFonctionRenduAvantTriceps = render;
render = function(){
  if (state.view === "muscu-triceps") {
    updateShell();
    updateNav();
    return renderMuscuTriceps();
  }
  return ancienneFonctionRenduAvantTriceps();
};
