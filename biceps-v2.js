// BICEPS V2 — même navigation et mêmes fiches détaillées que Pectoraux, Dos et Épaules.
// Remplace uniquement l'ancien affichage Biceps ; les autres univers restent intacts.
const bicepsModernExercices = [
  {
    "id": "curl-marteau",
    "titre": "Curl marteau",
    "cible": "Brachial, brachio-radial et biceps",
    "materiel": "Deux haltères",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout, pieds largeur de hanches, un haltère dans chaque main.",
      "Garde les paumes face à face et les coudes proches du buste.",
      "Fléchis les bras sans balancer les épaules ni le dos.",
      "Redescends lentement jusqu’à presque tendre les bras."
    ],
    "conseil": "Conserve une prise neutre du début à la fin. Commence avec une charge contrôlable.",
    "erreurs": "Balancement du tronc, coudes qui avancent, poignets cassés.",
    "image": "./biceps-curl-marteau.webp"
  },
  {
    "id": "curl-classique",
    "titre": "Curl classique",
    "cible": "Biceps brachial, brachial",
    "materiel": "Deux haltères",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout, épaules basses, tiens les haltères paumes tournées vers l’avant.",
      "Colle les coudes près du corps et stabilise le buste.",
      "Monte les haltères vers les épaules sans donner d’élan.",
      "Redescends sous contrôle sans verrouiller brutalement les coudes."
    ],
    "conseil": "Conserve une tension continue dans les biceps sans accélérer la descente.",
    "erreurs": "Dos cambré, épaules haussées, répétitions réalisées avec de l’élan.",
    "image": "./biceps-curl-classique.webp"
  },
  {
    "id": "curl-alterne",
    "titre": "Curl alterné",
    "cible": "Biceps, brachial, coordination",
    "materiel": "Deux haltères",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12 par bras",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout avec un haltère dans chaque main, bras le long du corps.",
      "Fléchis un bras et tourne progressivement la paume vers le haut.",
      "Redescends lentement l’haltère jusqu’à la position initiale.",
      "Alterne avec l’autre bras en gardant le buste immobile."
    ],
    "conseil": "Évite de commencer la répétition suivante avant d’avoir contrôlé la descente.",
    "erreurs": "Rotation excessive de l’épaule, coude qui s’éloigne, balancement du corps.",
    "image": "./biceps-curl-alterne.webp"
  },
  {
    "id": "curl-concentration",
    "titre": "Curl concentration",
    "cible": "Biceps brachial",
    "materiel": "Un haltère et un siège stable",
    "niveau": "Tous niveaux",
    "series": "3 par bras",
    "repetitions": "10 à 12 par bras",
    "tempo": "2–1–2",
    "repos": "45 s entre bras",
    "execution": [
      "Assieds-toi, jambes écartées, buste légèrement penché vers l’avant.",
      "Pose l’arrière du bras contre la face interne de la cuisse, au-dessus du genou.",
      "Fléchis lentement le coude pour rapprocher l’haltère de l’épaule.",
      "Redescends sans décoller le bras de son appui, puis change de côté."
    ],
    "conseil": "Utilise une charge modérée pour sentir le biceps travailler sans tricher.",
    "erreurs": "Bras appuyé directement sur le genou, coude qui bouge, mouvement brusque.",
    "image": "./biceps-curl-concentration.webp"
  },
  {
    "id": "curl-zottman",
    "titre": "Curl Zottman",
    "cible": "Biceps, brachio-radial, avant-bras",
    "materiel": "Deux haltères légers",
    "niveau": "Intermédiaire",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–1–3",
    "repos": "60 s",
    "execution": [
      "Debout, bras le long du corps, haltères en prise neutre.",
      "Monte les haltères en supination, paumes vers toi en fin de montée.",
      "En haut, tourne les poignets en pronation, paumes vers le bas.",
      "Redescends lentement puis reviens en prise de départ."
    ],
    "conseil": "Commence léger : la descente en pronation sollicite fortement les avant-bras.",
    "erreurs": "Rotation forcée du poignet, charge trop lourde, descente précipitée.",
    "image": "./biceps-curl-zottman.webp"
  },
  {
    "id": "curl-prise-inversee",
    "titre": "Curl prise inversée",
    "cible": "Brachial, brachio-radial, avant-bras",
    "materiel": "Deux haltères",
    "niveau": "Intermédiaire",
    "series": "3",
    "repetitions": "10 à 12",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Tiens les haltères paumes vers le bas, poignets droits.",
      "Garde les coudes proches du buste et les épaules détendues.",
      "Fléchis les coudes sans casser les poignets.",
      "Redescends sous contrôle et conserve la prise en pronation."
    ],
    "conseil": "Prends moins lourd que pour un curl classique : les avant-bras participent beaucoup.",
    "erreurs": "Poignets pliés, élan du dos, prise qui se transforme en supination.",
    "image": "./biceps-curl-prise-inversee.webp"
  },
  {
    "id": "curl-assis",
    "titre": "Curl assis",
    "cible": "Biceps brachial, brachial",
    "materiel": "Deux haltères et chaise stable",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Assieds-toi sur un siège stable, pieds bien au sol et dos neutre.",
      "Laisse pendre les haltères de chaque côté du corps.",
      "Fléchis les coudes en gardant les épaules immobiles.",
      "Redescends lentement sans basculer le buste."
    ],
    "conseil": "La position assise aide à limiter l’élan. Ne cambre pas les lombaires.",
    "erreurs": "Se pencher en arrière, avancer les coudes, descendre trop vite.",
    "image": "./biceps-curl-assis.webp"
  },
  {
    "id": "curl-unilateral",
    "titre": "Curl unilatéral",
    "cible": "Biceps brachial, stabilité",
    "materiel": "Un haltère",
    "niveau": "Tous niveaux",
    "series": "3 par bras",
    "repetitions": "8 à 12 par bras",
    "tempo": "2–0–2",
    "repos": "30 à 45 s entre bras",
    "execution": [
      "Debout, tiens un haltère dans une main, autre bras relâché.",
      "Garde le buste droit et le coude proche de la taille.",
      "Fléchis le bras en contrôlant la montée.",
      "Redescends lentement et répète avant de changer de côté."
    ],
    "conseil": "Travaille les deux côtés avec la même qualité de mouvement, même si une main est plus forte.",
    "erreurs": "S’incliner sur le côté, tourner le bassin, donner un coup d’élan.",
    "image": "./biceps-curl-unilateral.webp"
  },
  {
    "id": "curl-isometrique",
    "titre": "Curl isométrique",
    "cible": "Biceps et gainage postural",
    "materiel": "Deux haltères légers",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "Maintien 30 à 60 s",
    "tempo": "Statique",
    "repos": "45 à 60 s",
    "execution": [
      "Tiens les haltères avec les coudes fléchis autour de 90 degrés.",
      "Reste droit, omoplates basses et abdominaux légèrement engagés.",
      "Maintiens les avant-bras dans la même position en respirant librement.",
      "Relâche progressivement puis repose les bras entre les séries."
    ],
    "conseil": "Commence par 15 à 20 secondes si nécessaire et allonge progressivement le maintien.",
    "erreurs": "Bloquer la respiration, hausser les épaules, laisser le dos se cambrer.",
    "image": "./biceps-curl-isometrique.webp"
  },
  {
    "id": "curl-kettlebell",
    "titre": "Curl kettlebell",
    "cible": "Biceps, brachial, avant-bras",
    "materiel": "Une kettlebell",
    "niveau": "Tous niveaux",
    "series": "3",
    "repetitions": "8 à 12",
    "tempo": "2–0–2",
    "repos": "45 à 60 s",
    "execution": [
      "Debout, tiens la kettlebell à deux mains par les côtés de la poignée.",
      "Garde les coudes près du corps et les poignets neutres.",
      "Fléchis les coudes pour monter la kettlebell vers la poitrine.",
      "Redescends lentement sans balancer le buste."
    ],
    "conseil": "Choisis une kettlebell stable et garde les mains bien placées sur la poignée.",
    "erreurs": "Laisser la charge se balancer, projeter les épaules, plier les poignets.",
    "image": "./biceps-curl-kettlebell.webp"
  }
];
let selectedBicepsModernExercise = null;

function bicepsModernPhotoMarkup(exercice, detail=false) {
  // Le titre, le cadre et la flèche sont déjà intégrés au WebP : aucun doublon HTML.
  return `<span class="muscu-biceps-modern-photo"><img src="${exercice.image}" alt="" loading="${detail ? "eager" : "lazy"}"></span>`;
}
function renderMuscuBicepsModern() {
  main.innerHTML = `
    <section class="muscu-biceps-v1 muscu-biceps-modern-v1" aria-label="Exercices biceps">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuBicepsModernBack" aria-label="Retour aux groupes musculaires">
        <span class="muscu-back-arrow">←</span><span>Retour</span>
      </button>
      <div class="muscu-biceps-heading">
        <div class="muscu-biceps-icon" aria-hidden="true">⌁</div>
        <div>
          <div class="muscu-biceps-kicker">EXERCICES</div>
          <h2>Biceps</h2>
          <p>10 exercices pour renforcer les biceps à la maison</p>
        </div>
      </div>
      <div class="muscu-biceps-modern-list">
        ${bicepsModernExercices.map(exercice=>`<button type="button" class="muscu-biceps-modern-card" data-biceps-modern-exercise="${exercice.id}" aria-label="Ouvrir la fiche ${esc(exercice.titre)}">
          ${bicepsModernPhotoMarkup(exercice)}
        </button>`).join("")}
      </div>
    </section>`;
  document.getElementById("muscuBicepsModernBack")?.addEventListener("click",()=>{state.view="muscu-exercises";render();});
  document.querySelectorAll("[data-biceps-modern-exercise]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedBicepsModernExercise=btn.dataset.bicepsModernExercise;
    renderMuscuBicepsModernDetail();
  }));
}
function renderMuscuBicepsModernDetail() {
  const exercice=bicepsModernExercices.find(x=>x.id===selectedBicepsModernExercise);
  if(!exercice) return renderMuscuBicepsModern();
  main.innerHTML = `
    <section class="muscu-biceps-v1 muscu-biceps-modern-v1 muscu-biceps-modern-fiche" aria-label="Fiche ${esc(exercice.titre)}">
      <button type="button" class="muscu-back-pill muscu-biceps-back" id="muscuBicepsModernDetailBack" aria-label="Retour à la liste Biceps">
        <span class="muscu-back-arrow">←</span><span>Retour aux biceps</span>
      </button>
      <header class="muscu-biceps-modern-fiche-en-tete">
        <div class="muscu-biceps-kicker">BICEPS · FICHE EXERCICE</div>
        <h2>${esc(exercice.titre)}</h2>
        <p>${esc(exercice.cible)}</p>
      </header>
      <div class="muscu-biceps-modern-fiche-visuel">${bicepsModernPhotoMarkup(exercice,true)}</div>
      <div class="muscu-biceps-modern-fiche-stats">
        <div><span>Matériel</span><strong>${esc(exercice.materiel)}</strong></div>
        <div><span>Niveau</span><strong>${esc(exercice.niveau)}</strong></div>
        <div><span>Séries</span><strong>${esc(exercice.series)}</strong></div>
        <div><span>Répétitions / durée</span><strong>${esc(exercice.repetitions)}</strong></div>
        <div><span>Tempo</span><strong>${esc(exercice.tempo)}</strong></div>
        <div><span>Repos</span><strong>${esc(exercice.repos)}</strong></div>
      </div>
      <section class="muscu-biceps-modern-fiche-section">
        <h3>Exécution</h3>
        <ol>${exercice.execution.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
      </section>
      <section class="muscu-biceps-modern-fiche-section"><h3>Conseil</h3><p>${esc(exercice.conseil)}</p></section>
      <section class="muscu-biceps-modern-fiche-section"><h3>Erreurs à éviter</h3><p>${esc(exercice.erreurs)}</p></section>
      <p class="muscu-biceps-modern-precaution">Adapte les charges à ton niveau. Arrête si une douleur apparaît. Respire normalement.</p>
    </section>`;
  document.getElementById("muscuBicepsModernDetailBack")?.addEventListener("click",()=>renderMuscuBicepsModern());
}

// Le bouton Biceps existe déjà dans le menu et change state.view :
// remplacer sa fonction de rendu suffit, sans modifier app.js ni les autres groupes.
renderMuscuBiceps = function(){return renderMuscuBicepsModern();};

// Harmoniser l'en-tête avec Épaules, Dos et Pectoraux.
const ancienUpdateShellAvantBicepsV2 = updateShell;
updateShell = function(){
  ancienUpdateShellAvantBicepsV2();
  if (state.view === "muscu-biceps") {
    bottomNav.classList.add("hidden");
    brandMark.textContent="M";
    brandEyebrow.textContent="Ma bibliothèque";
    brandTitle.textContent="Musculation";
  }
};
