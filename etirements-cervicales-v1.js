/* Sport & Nutrition — Étirements / Nuque et cervicales V1 — 13 novembre 2026.
 * Intégration des deux maquettes validées : six exercices + fiche détaillée.
 * Uniquement affichage et navigation, sans toucher aux données sportives ni à la V5.
 * Les vidéos explicatives seront ajoutées après validation séparée.
 */
(function () {
  'use strict';

  const LIST_VIEW = 'etirements-exercices';
  const DETAIL_VIEW = 'etirements-cervicales-fiche';
  const EXERCISES = [
    {
      id: 'inclinaison', title: 'Inclinaison latérale de la tête',
      subtitle: 'Détendre doucement les muscles sur les côtés de la nuque.',
      duration: '20–30 s', zones: 'Nuque', level: 'Doux', sides: 'Gauche / droite',
      steps: [
        'Tiens-toi droit(e), les épaules relâchées.',
        'Incline lentement l’oreille vers l’épaule, sans tourner le menton.',
        'Garde l’épaule opposée basse et ne tire pas sur la tête.',
        'Maintiens quelques secondes, reviens au centre puis change de côté.'
      ],
      tips: ['Bouge dans une amplitude confortable.', 'Respire calmement et sans bloquer.', 'Évite toute traction forte avec la main.'],
      benefits: ['Détend la nuque', 'Favorise la mobilité', 'Aide à relâcher les tensions']
    },
    {
      id: 'rotation', title: 'Rotation cervicale douce',
      subtitle: 'Entretenir la rotation naturelle du cou, sans forcer.',
      duration: '15–20 s', zones: 'Cervicales', level: 'Doux', sides: 'Gauche / droite',
      steps: [
        'Assieds-toi ou reste debout, le dos droit et les épaules relâchées.',
        'Tourne lentement la tête vers la droite, comme pour regarder au-dessus de l’épaule.',
        'Arrête-toi dès que tu sens une légère tension, sans chercher à aller plus loin.',
        'Reviens au centre puis recommence vers la gauche.'
      ],
      tips: ['Garde le menton à une hauteur naturelle.', 'Ne fais pas de rotation circulaire forcée.', 'Arrête si tu ressens un vertige ou une douleur.'],
      benefits: ['Mobilité du cou', 'Mouvement contrôlé', 'Confort quotidien']
    },
    {
      id: 'flexion', title: 'Flexion du cou vers l’avant',
      subtitle: 'Relâcher doucement l’arrière du cou.',
      duration: '15–20 s', zones: 'Arrière de la nuque', level: 'Doux', sides: 'Au centre',
      steps: [
        'Place-toi assis(e) ou debout, la colonne allongée.',
        'Laisse descendre doucement le menton vers la poitrine.',
        'Garde les épaules basses et les bras détendus.',
        'Reviens lentement à la position neutre.'
      ],
      tips: ['Ne pousse pas la tête avec les mains.', 'Évite de courber excessivement le haut du dos.', 'Le mouvement doit rester indolore.'],
      benefits: ['Détente légère', 'Conscience posturale', 'Mobilité douce']
    },
    {
      id: 'trapeze', title: 'Étirement du trapèze supérieur',
      subtitle: 'Diminuer les sensations de raideur autour du cou et des épaules.',
      duration: '20–30 s', zones: 'Trapèze supérieur', level: 'Doux', sides: 'Gauche / droite',
      steps: [
        'Assieds-toi bien droit(e), les épaules détendues.',
        'Laisse un bras descendre vers le sol sans hausser l’épaule.',
        'Incline très doucement la tête du côté opposé.',
        'Maintiens sans tirer, puis reviens lentement et change de côté.'
      ],
      tips: ['Ne hausse pas l’épaule étirée.', 'N’utilise pas de traction avec la main.', 'Respire profondément sans forcer.'],
      benefits: ['Détente des épaules', 'Mobilité du cou', 'Relaxation musculaire']
    },
    {
      id: 'elevateur', title: 'Étirement de l’élévateur de la scapula',
      subtitle: 'Mobiliser doucement la zone entre la nuque et l’omoplate.',
      duration: '15–20 s', zones: 'Nuque / omoplate', level: 'Doux', sides: 'Gauche / droite',
      steps: [
        'Assieds-toi droit(e), les épaules basses.',
        'Tourne légèrement la tête, environ 45°, vers une aisselle.',
        'Incline doucement le regard vers le bas sans tirer sur le crâne.',
        'Reviens au centre, puis recommence de l’autre côté.'
      ],
      tips: ['Garde le mouvement petit et contrôlé.', 'Ne cherche pas à augmenter la tension avec le bras.', 'Arrête en cas de douleur ou de fourmillements.'],
      benefits: ['Mobilité de la nuque', 'Détente douce', 'Conscience des épaules']
    },
    {
      id: 'menton', title: 'Rétraction douce du menton',
      subtitle: 'Exercice de mobilité et de posture cervicale.',
      duration: '3–5 s × 5 à 8', zones: 'Cervicales', level: 'Doux', sides: 'Au centre',
      steps: [
        'Assieds-toi ou reste debout, les yeux dirigés droit devant.',
        'Recule doucement le menton à l’horizontale, comme pour former un petit double menton.',
        'Maintiens trois à cinq secondes sans incliner la tête vers le bas.',
        'Relâche et recommence cinq à huit fois tranquillement.'
      ],
      tips: ['Le mouvement est court : ne force pas.', 'Garde le regard horizontal.', 'Arrête si tu ressens douleur, vertige ou fourmillements.'],
      benefits: ['Repères posturaux', 'Contrôle cervical', 'Mobilité douce']
    }
  ];

  const BASE = './etirements-';
  const categoryParts = [
    {name: 'entete', file: 'cervicales-entete', className: 'evc1-entete'},
    ...EXERCISES.map((exercise, i) => ({name: exercise.id, file: 'cervicales-ex'+(i+1), exercise})),
    {name: 'pied', file: 'cervicales-pied', className: 'evc1-pied'}
  ];
  const modelParts = [
    {file: 'fiche-retour', className: 'evc1-fiche-retour', action: 'back'},
    {file: 'fiche-hero'}, {file: 'fiche-infos'}, {file: 'fiche-comment'},
    {file: 'fiche-conseils'}, {file: 'fiche-bienfaits'},
    {file: 'fiche-video', className: 'evc1-fiche-video', action: 'video'}
  ];
  const esc = value => String(value).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const image = name => BASE + name + '-v1.webp';
  const selected = () => EXERCISES.find(x => x.id === state.evc1ExerciseId) || EXERCISES[0];

  function go(view, id) {
    if (id) state.evc1ExerciseId = id;
    state.view = view;
    state.selected = null;
    render();
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }

  function baseScreen(kind) {
    document.body.classList.add('ez1-active');
    if (typeof updateShell === 'function') updateShell();
    if (typeof bottomNav !== 'undefined') bottomNav.classList.add('hidden');
    main.innerHTML = '';
    const section = document.createElement('section');
    section.className = 'evc1-screen evc1-' + kind;
    section.setAttribute('aria-label',kind === 'liste' ? 'Étirements — Nuque et cervicales' : 'Fiche d’étirement — Nuque et cervicales');
    main.appendChild(section);
    return section;
  }

  function addSlice(section, part, action, label) {
    const target = action ? document.createElement('button') : document.createElement('div');
    if (action) target.type = 'button';
    target.className = 'evc1-slice ' + (part.className || '') + (action ? ' evc1-clickable' : '');
    if (label) target.setAttribute('aria-label',label);
    const picture = document.createElement('img');
    picture.src = image(part.file);
    picture.alt = '';
    picture.loading = 'eager';
    picture.decoding = 'async';
    picture.draggable = false;
    target.appendChild(picture);
    if (action) target.addEventListener('click',action);
    section.appendChild(target);
    return target;
  }

  function showCategory() {
    const root = baseScreen('liste');
    for (const part of categoryParts) {
      if (part.name === 'entete') {
        const head = addSlice(root,part,null);
        const back = document.createElement('button');
        back.className = 'evc1-overlay-back';
        back.type = 'button';
        back.setAttribute('aria-label','Retour à l’accueil Étirements');
        back.addEventListener('click',()=>go('etirements-menu'));
        head.appendChild(back);
      } else if (part.exercise) {
        addSlice(root,part,()=>go(DETAIL_VIEW,part.exercise.id), 'Ouvrir ' + part.exercise.title);
      } else addSlice(root,part,null);
    }
  }

  function showApprovedDetail() {
    const root = baseScreen('fiche-approuvee');
    for (const part of modelParts) {
      let action = null, label = null;
      if (part.action === 'back') {action = ()=>go(LIST_VIEW);label='Retour à Nuque et cervicales';}
      if (part.action === 'video') {action = showVideoNotice;label='Voir la vidéo explicative — bientôt disponible';}
      addSlice(root,part,action,label);
    }
  }

  function showGeneratedDetail(ex) {
    const root = baseScreen('fiche-texte');
    const i = EXERCISES.indexOf(ex)+1;
    root.innerHTML = `
      <button type="button" class="evc1-native-back" id="evc1Back">← Retour à Nuque & cervicales</button>
      <div class="evc1-hero">
        <img src="${image('cervicales-photo-'+i)}" alt="Démonstration de ${esc(ex.title)}" decoding="async">
        <div class="evc1-hero-text">
          <span class="evc1-eyebrow">ÉTIREMENTS · NUQUE & CERVICALES</span>
          <h1>${esc(ex.title)}</h1><p>${esc(ex.subtitle)}</p>
        </div>
      </div>
      <div class="evc1-stats">
        <div><small>Zone ciblée</small><strong>${esc(ex.zones)}</strong></div>
        <div><small>Durée indicative</small><strong>${esc(ex.duration)}</strong></div>
        <div><small>Niveau</small><strong>${esc(ex.level)}</strong></div>
        <div><small>Côté(s)</small><strong>${esc(ex.sides)}</strong></div>
      </div>
      <section class="evc1-info"><h2>Comment faire</h2><ol>${ex.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></section>
      <section class="evc1-info"><h2>Conseils</h2><ul>${ex.tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section>
      <section class="evc1-info"><h2>Objectifs</h2><div class="evc1-benefits">${ex.benefits.map(t=>`<span>${esc(t)}</span>`).join('')}</div></section>
      <button type="button" class="evc1-video-btn" id="evc1Video"><span aria-hidden="true">▶</span> Voir la vidéo explicative</button>
      <p class="evc1-disclaimer">Étirement sans douleur, sans à-coups. En cas de douleur, vertige ou fourmillements, arrête le mouvement.</p>`;
    root.querySelector('#evc1Back').addEventListener('click',()=>go(LIST_VIEW));
    root.querySelector('#evc1Video').addEventListener('click',showVideoNotice);
  }

  function showVideoNotice() {
    if (main.querySelector('.evc1-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'evc1-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','evc1ModalTitle');
    modal.innerHTML = `<div class="evc1-modal-card">
      <div class="evc1-modal-icon" aria-hidden="true">▶</div>
      <h2 id="evc1ModalTitle">Démonstration bientôt disponible</h2>
      <p>La fiche explicative est accessible dès maintenant. Nous ajouterons ensuite une animation lente avec les consignes en français, dans notre ambiance zen validée.</p>
      <button type="button" id="evc1ModalClose">Revenir à l’exercice</button>
    </div>`;
    main.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector('button').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    modal.querySelector('button').focus();
  }

  const previousRender = render;
  render = function () {
    if (state.view === LIST_VIEW) return showCategory();
    if (state.view === DETAIL_VIEW) {
      const ex=selected();
      return ex.id===EXERCISES[0].id ? showApprovedDetail() : showGeneratedDetail(ex);
    }
    return previousRender.apply(this,arguments);
  };
})();
