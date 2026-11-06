// ÉPAULES V1 — 10 bandeaux validés 560 × 190; correction du bouton incluse.
const epaulesExercices = [
  {
    "id": "developpe-militaire-halteres",
    "titre": "Développé militaire avec haltères",
    "cible": "Deltoïdes antérieurs et moyens, triceps",
    "materiel": "Deux haltères",
    "niveau": "Intermédiaire",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "60 à 90 s",
    "execution": [
      "Debout, pieds largeur de hanches, tiens les haltères à hauteur des épaules.",
      "Gaine l’abdomen et garde les poignets alignés avec les avant-bras.",
      "Pousse les haltères au-dessus de la tête sans cambrer le dos.",
      "Redescends lentement vers les épaules en contrôlant le mouvement."
    ],
    "conseil": "Expire en poussant. Utilise des charges modérées pour rester stable et protéger le bas du dos.",
    "erreurs": "Cambrer les lombaires, hausser les épaules, descendre les coudes brutalement.",
    "image": "./epaules-developpe-militaire-halteres.webp"
  },
  {
    "id": "developpe-arnold",
    "titre": "Développé Arnold",
    "cible": "Deltoïdes antérieurs et moyens, triceps",
    "materiel": "Deux haltères",
    "niveau": "Intermédiaire",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "60 à 90 s",
    "execution": [
      "Commence haltères face au visage, paumes orientées vers toi, coudes devant le corps.",
      "En poussant vers le haut, tourne progressivement les paumes vers l’avant.",
      "Arrive bras presque tendus sans forcer l’amplitude de l’épaule.",
      "Redescends en inversant la rotation, toujours sous contrôle."
    ],
    "conseil": "Choisis plus léger que pour le développé militaire et limite l’amplitude si l’épaule est sensible.",
    "erreurs": "Tourner trop vite, forcer la rotation, creuser le dos.",
    "image": "./epaules-developpe-arnold.webp"
  },
  {
    "id": "elevations-laterales",
    "titre": "Élévations latérales",
    "cible": "Deltoïdes moyens, stabilisateurs de l’épaule",
    "materiel": "Deux haltères légers",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "12 à 15",
    "tempo": "2–1–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout, bras près du corps et coudes légèrement fléchis.",
      "Lève lentement les haltères sur les côtés sans hausser les épaules.",
      "Arrête vers la hauteur des épaules ou avant si nécessaire.",
      "Redescends lentement sans laisser les bras retomber."
    ],
    "conseil": "Privilégie des haltères légers et une trajectoire légèrement vers l’avant du corps.",
    "erreurs": "Balancer le buste, monter au-dessus de l’amplitude confortable, utiliser trop lourd.",
    "image": "./epaules-elevations-laterales.webp"
  },
  {
    "id": "elevations-frontales",
    "titre": "Élévations frontales",
    "cible": "Deltoïdes antérieurs, stabilisateurs",
    "materiel": "Deux haltères légers",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "10 à 15",
    "tempo": "2–1–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout, bras relâchés devant les cuisses, abdominaux engagés.",
      "Lève les haltères devant toi, coudes légèrement fléchis.",
      "Monte au maximum à hauteur d’épaules sans douleur.",
      "Redescends lentement sans élan."
    ],
    "conseil": "Prends une charge légère, car l’avant de l’épaule travaille déjà dans les développés.",
    "erreurs": "Cambrer pour compenser, monter trop haut, bloquer la respiration.",
    "image": "./epaules-elevations-frontales.webp"
  },
  {
    "id": "oiseau-buste-penche",
    "titre": "Oiseau buste penché",
    "cible": "Deltoïdes postérieurs, rhomboïdes, haut du dos",
    "materiel": "Deux haltères légers",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "12 à 15",
    "tempo": "2–1–2",
    "repos": "45 à 60 s",
    "execution": [
      "Penche le buste avec les hanches en arrière, en conservant le dos neutre.",
      "Laisse les bras descendre sous les épaules, coudes légèrement fléchis.",
      "Ouvre les bras sur les côtés jusqu’à une amplitude confortable.",
      "Redescends en contrôlant, sans relever le buste."
    ],
    "conseil": "Si le maintien du buste fatigue le bas du dos, appuie la poitrine contre un dossier incliné.",
    "erreurs": "Arrondir le dos, balancer les haltères, contracter exagérément la nuque.",
    "image": "./epaules-oiseau-buste-penche.webp"
  },
  {
    "id": "developpe-epaules-assis",
    "titre": "Développé épaules assis",
    "cible": "Deltoïdes antérieurs et moyens, triceps",
    "materiel": "Deux haltères et chaise stable avec dossier",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "60 à 90 s",
    "execution": [
      "Assieds-toi sur une chaise stable, les pieds au sol et le dos soutenu.",
      "Place les haltères près des épaules, coudes légèrement en avant.",
      "Pousse vers le haut sans te cambrer ni forcer derrière la tête.",
      "Reviens doucement à la position de départ."
    ],
    "conseil": "Le dossier aide à limiter les compensations lombaires. Ne force pas si les épaules sont gênées.",
    "erreurs": "Décoller le dos du dossier, heurter les haltères, charges trop lourdes.",
    "image": "./epaules-developpe-epaules-assis.webp"
  },
  {
    "id": "tirage-menton-halteres",
    "titre": "Tirage menton avec haltères",
    "cible": "Deltoïdes moyens, trapèzes",
    "materiel": "Deux haltères légers",
    "niveau": "Intermédiaire",
    "series": "3",
    "repetitions": "10 à 12",
    "tempo": "2–1–2",
    "repos": "60 s",
    "execution": [
      "Debout, tiens deux haltères devant les cuisses, paumes vers le corps.",
      "Tire les haltères vers le haut en écartant modérément les coudes.",
      "Arrête la montée lorsque les coudes arrivent près de la hauteur des épaules.",
      "Redescends lentement sans rentrer les épaules vers l’avant."
    ],
    "conseil": "Ce mouvement peut gêner certaines épaules : reste dans une faible amplitude et remplace-le par des élévations latérales si nécessaire.",
    "erreurs": "Tirer au-dessus du menton, rapprocher excessivement les mains, forcer malgré une douleur.",
    "image": "./epaules-tirage-menton-halteres.webp"
  },
  {
    "id": "pike-push-up",
    "titre": "Pike push-up",
    "cible": "Deltoïdes antérieurs, triceps, gainage",
    "materiel": "Poids du corps et tapis",
    "niveau": "Intermédiaire à avancé",
    "series": "3",
    "repetitions": "6 à 10",
    "tempo": "2–0–2",
    "repos": "60 à 90 s",
    "execution": [
      "Au sol, mains écartées largeur d’épaules et hanches relevées en V inversé.",
      "Fléchis les coudes pour rapprocher doucement le sommet de la tête du sol.",
      "Garde les abdominaux engagés et le cou détendu.",
      "Repousse avec les bras pour revenir en V, sans à-coup."
    ],
    "conseil": "Commence avec une petite amplitude. Évite cet exercice en cas de douleur à l’épaule ou d’inconfort cervical.",
    "erreurs": "Faire tomber la tête, écarter énormément les coudes, plier fortement le dos.",
    "image": "./epaules-pike-push-up.webp"
  },
  {
    "id": "elevations-laterales-unilaterales",
    "titre": "Élévations latérales unilatérales",
    "cible": "Deltoïde moyen, stabilité du tronc",
    "materiel": "Un haltère léger",
    "niveau": "Tous niveaux",
    "series": "3 par bras",
    "repetitions": "10 à 15 par bras",
    "tempo": "2–1–2",
    "repos": "30 à 45 s entre bras",
    "execution": [
      "Tiens un haltère dans une main et place l’autre main sur un support stable.",
      "Reste grand, buste stable et coude légèrement fléchi.",
      "Monte le bras sur le côté jusqu’à l’amplitude confortable.",
      "Redescends lentement avant de changer de bras."
    ],
    "conseil": "Le travail unilatéral permet de contrôler la technique d’un côté à la fois.",
    "erreurs": "Pencher le tronc pour tricher, hausser l’épaule, utiliser un élan.",
    "image": "./epaules-elevations-laterales-unilaterales.webp"
  },
  {
    "id": "y-raise-sol",
    "titre": "Y-raise au sol",
    "cible": "Deltoïdes postérieurs, trapèzes inférieurs, stabilisateurs scapulaires",
    "materiel": "Tapis, sans charge",
    "niveau": "Débutant à intermédiaire",
    "series": "3",
    "repetitions": "10 à 15",
    "tempo": "2–1–2",
    "repos": "45 s",
    "execution": [
      "Allonge-toi sur le ventre, bras tendus en diagonale pour former un Y.",
      "Garde le front proche du tapis et le cou dans le prolongement du dos.",
      "Soulève légèrement les bras en rapprochant doucement les omoplates.",
      "Redescends lentement sans creuser les lombaires."
    ],
    "conseil": "Lève peu les bras : le contrôle des omoplates compte plus que la hauteur.",
    "erreurs": "Lever la tête trop haut, compenser avec les lombaires, contracter la nuque.",
    "image": "./epaules-y-raise-sol.webp"
  }
];
let selectedEpaulesExercise = null;
function epaulesPhotoMarkup(exercice, detail=false){
  return `<span class="muscu-epaules-photo"><img src="${exercice.image}" alt="" loading="${detail?"eager":"lazy"}"></span>`;
}
function renderMuscuEpaules(){
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-epaules-v1" aria-label="Exercices epaules">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuEpaulesBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Épaules</h2>
          <p>10 exercices pour renforcer les épaules à la maison</p>
        </div>
      </div>
      <div class="muscu-epaules-list">
        ${epaulesExercices.map(exercice=>`<button type="button" class="muscu-epaules-card" data-epaules-exercise="${exercice.id}" aria-label="Ouvrir la fiche ${esc(exercice.titre)}">
          ${epaulesPhotoMarkup(exercice)}
        </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuEpaulesBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-epaules-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedEpaulesExercise=btn.dataset.epaulesExercise;
    renderMuscuEpaulesDetail();
  }));
}
function renderMuscuEpaulesDetail(){
  const exercice=epaulesExercices.find(x=>x.id===selectedEpaulesExercise);
  if(!exercice){state.view="muscu-epaules";return renderMuscuEpaules();}
  main.innerHTML=`
    <section class="muscu-biceps-v1 muscu-epaules-v1 muscu-epaules-fiche" aria-label="Fiche ${esc(exercice.titre)}">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuEpaulesDetailBack" aria-label="Retour à la liste Épaules">
        <span class="muscu-back-arrow">←</span><span>Retour aux épaules</span>
      </button>
      <header class="muscu-epaules-fiche-en-tete">
        <div class="muscu-biceps-kicker">ÉPAULES · FICHE EXERCICE</div>
        <h2>${esc(exercice.titre)}</h2>
        <p>${esc(exercice.cible)}</p>
      </header>
      <div class="muscu-epaules-fiche-visuel">
        ${epaulesPhotoMarkup(exercice,true)}
      </div>
      <div class="muscu-epaules-fiche-stats">
        <div><span>Matériel</span><strong>${esc(exercice.materiel)}</strong></div>
        <div><span>Niveau</span><strong>${esc(exercice.niveau)}</strong></div>
        <div><span>Séries</span><strong>${esc(exercice.series)}</strong></div>
        <div><span>Répétitions</span><strong>${esc(exercice.repetitions)}</strong></div>
        <div><span>Tempo</span><strong>${esc(exercice.tempo)}</strong></div>
        <div><span>Repos</span><strong>${esc(exercice.repos)}</strong></div>
      </div>
      <section class="muscu-epaules-fiche-section">
        <h3>Exécution</h3>
        <ol>${exercice.execution.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      </section>
      <section class="muscu-epaules-fiche-section">
        <h3>Conseil</h3><p>${esc(exercice.conseil)}</p>
      </section>
      <section class="muscu-epaules-fiche-section">
        <h3>Erreurs à éviter</h3><p>${esc(exercice.erreurs)}</p>
      </section>
      <p class="muscu-epaules-precaution">Adapte l'amplitude et la charge à ton niveau. Arrête l'exercice si une douleur apparaît.</p>
    </section>`;
  document.getElementById("muscuEpaulesDetailBack")?.addEventListener("click",()=>{ renderMuscuEpaules(); });
}
const ancienneMiseAJourBandeauEpaules = updateShell;
updateShell = function(){
  ancienneMiseAJourBandeauEpaules();
  if(state.view === "muscu-epaules"){
    bottomNav.classList.add("hidden");
    brandMark.textContent = "M";
    brandEyebrow.textContent = "Ma bibliothèque";
    brandTitle.textContent = "Musculation";
  }
};

// ÉPAULES V2 : raccorder le bouton « Epaules » du menu aux fiches déjà installées.
// Ne modifie ni les Pectoraux, ni les Biceps, ni les recettes.
const ancienneFonctionListeMusclesAvantEpaules = renderMuscuExercises;
renderMuscuExercises = function(){
  ancienneFonctionListeMusclesAvantEpaules();
  // Le menu historique contient une alerte temporaire. Remplacer uniquement
  // son bouton Epaules retire son ancien gestionnaire de clic, sans toucher aux autres.
  const ancienBoutonEpaules = main.querySelector('[data-muscle="epaules"]');
  if (!ancienBoutonEpaules) return;
  const boutonEpaules = ancienBoutonEpaules.cloneNode(true);
  ancienBoutonEpaules.replaceWith(boutonEpaules);
  boutonEpaules.addEventListener("click", () => {
    state.view = "muscu-epaules";
    state.selected = null;
    render();
  });
};

// Route dédiée, pour que les retours et les nouveaux affichages fonctionnent
// même après une actualisation de la navigation.
const ancienneFonctionRenduAvantEpaules = render;
render = function(){
  if (state.view === "muscu-epaules") {
    updateShell();
    updateNav();
    return renderMuscuEpaules();
  }
  return ancienneFonctionRenduAvantEpaules();
};
