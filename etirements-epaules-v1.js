/* Sport & Nutrition — Étirements / Épaules & bras, V1, 13 novembre 2026.
   10 exercices, catalogue et fiches ; menu de catégories intégré.
   Ne lit, n'écrit ni ne supprime aucune donnée de séance / Supabase.
   Les vidéos seront ajoutées après validation des démonstrations. */
(function(){
  'use strict';
  const GROUPS='etirements-exercices';
  const CERVICALS='etirements-cervicales-liste';
  const LIST='etirements-epaules-liste';
  const DETAIL='etirements-epaules-fiche';
  const EX=[
    {id:'cercles',title:'Cercles d’épaules',subtitle:'Mobiliser les épaules en douceur.',duration:'8 à 10 cercles',zone:'Épaules',sides:'Deux côtés',steps:[
      'Tiens-toi debout ou assis(e), dos allongé et bras relâchés.',
      'Dessine lentement de petits cercles avec les épaules vers l’arrière.',
      'Agrandis légèrement le mouvement seulement si cela reste confortable.',
      'Répète dans l’autre sens, en respirant librement.'
    ],benefits:['Mobilité des épaules','Détente du haut du corps','Mouvement fluide']},
    {id:'haussement',title:'Haussement et relâchement',subtitle:'Relâcher les épaules et le haut du dos.',duration:'6 à 8 répétitions',zone:'Trapèzes / épaules',sides:'Deux côtés',steps:[
      'Assieds-toi ou reste debout, bras le long du corps.',
      'Monte doucement les épaules vers les oreilles sans crisper la mâchoire.',
      'Tiens une à deux secondes, sans bloquer la respiration.',
      'Laisse redescendre les épaules en douceur et répète.'
    ],benefits:['Relâche les épaules','Conscience posturale','Détente musculaire']},
    {id:'deltoide',title:'Étirement du deltoïde',subtitle:'Étirer doucement l’arrière de l’épaule.',duration:'20–30 s',zone:'Deltoïde',sides:'Gauche / droite',steps:[
      'Tiens-toi droit(e), épaules basses.',
      'Amène un bras tendu à hauteur de poitrine, devant toi.',
      'Avec l’autre main, rapproche doucement ce bras du buste, sans tirer sur le coude.',
      'Maintiens sans douleur, puis change de côté.'
    ],benefits:['Souplesse de l’épaule','Détente douce','Mobilité du bras']},
    {id:'triceps',title:'Étirement des triceps',subtitle:'Assouplir l’arrière du bras.',duration:'20–30 s',zone:'Triceps',sides:'Gauche / droite',steps:[
      'Lève un bras au-dessus de la tête, sans cambrer le dos.',
      'Plie le coude pour amener la main doucement derrière la tête.',
      'Laisse le coude pointer vers le plafond ; soutiens-le délicatement si besoin.',
      'Garde la position sans forcer puis change de bras.'
    ],benefits:['Assouplit les triceps','Mobilité du bras','Détente de l’épaule']},
    {id:'ouverture-poitrine',title:'Ouverture poitrine et biceps',subtitle:'Ouvrir le haut du corps sans forcer.',duration:'20–30 s',zone:'Pectoraux / biceps',sides:'Deux côtés',steps:[
      'Debout, relâche les épaules et garde le regard horizontal.',
      'Place les bras derrière toi et rapproche doucement les mains, avec ou sans sangle.',
      'Ouvre légèrement la poitrine en gardant les épaules basses.',
      'Maintiens puis relâche lentement, sans cambrer le bas du dos.'
    ],benefits:['Ouvre la poitrine','Assouplit les bras','Aide à se redresser']},
    {id:'avantbras',title:'Étirement des avant-bras',subtitle:'Détendre les poignets et les avant-bras.',duration:'15–20 s',zone:'Avant-bras / poignets',sides:'Gauche / droite',steps:[
      'Tends un bras devant toi, coude souple et paume vers le haut.',
      'Avec l’autre main, accompagne très légèrement les doigts vers le bas.',
      'Maintiens sans douleur ni fourmillement.',
      'Relâche, inverse l’orientation de la paume puis change de bras.'
    ],benefits:['Souplesse des poignets','Détente des avant-bras','Mobilité des mains']},
    {id:'triceps-haut',title:'Étirement du triceps au-dessus de la tête',subtitle:'Variante douce avec le coude dirigé vers le haut.',duration:'20–30 s',zone:'Triceps / épaule',sides:'Gauche / droite',steps:[
      'Assieds-toi ou reste debout, le dos long et les côtes détendues.',
      'Monte un bras et plie le coude derrière la tête.',
      'Aide seulement à stabiliser le coude avec l’autre main, sans tirer.',
      'Respire calmement, relâche puis change de côté.'
    ],benefits:['Assouplit le triceps','Mobilité au-dessus de la tête','Souplesse du bras']},
    {id:'ouverture-epaules',title:'Ouverture des épaules',subtitle:'Favoriser une ouverture douce du haut du corps.',duration:'20–30 s',zone:'Épaules / poitrine',sides:'Deux côtés',steps:[
      'Mets-toi debout, les pieds stables et les bras près du corps.',
      'Emmène doucement les mains derrière les hanches.',
      'Éloigne légèrement les épaules vers l’arrière, sans lever les côtes.',
      'Maintiens en respirant et reviens lentement.'
    ],benefits:['Ouvre les épaules','Confort du haut du dos','Mobilité de la poitrine']},
    {id:'biceps-mur',title:'Étirement des biceps contre le mur',subtitle:'Étirer l’avant du bras avec un appui stable.',duration:'15–25 s',zone:'Biceps / épaule',sides:'Gauche / droite',steps:[
      'Place-toi debout à côté d’un mur, épaule relâchée.',
      'Pose doucement la paume sur le mur, bras presque tendu, sans verrouiller le coude.',
      'Tourne très légèrement le buste dans la direction opposée.',
      'Arrête dès que l’étirement est perceptible, puis change de côté.'
    ],benefits:['Souplesse du biceps','Ouverture du bras','Mobilité douce']},
    {id:'epaule-croisee',title:'Étirement croisé de l’épaule',subtitle:'Assouplir l’arrière de l’épaule en position debout.',duration:'20–30 s',zone:'Arrière de l’épaule',sides:'Gauche / droite',steps:[
      'Tends un bras horizontalement devant la poitrine.',
      'Place l’autre main sur le haut du bras, sans appuyer sur l’articulation du coude.',
      'Rapproche doucement le bras du buste en gardant l’épaule basse.',
      'Maintiens puis passe à l’autre côté, sans forcer.'
    ],benefits:['Détend l’épaule','Favorise la souplesse','Mobilité contrôlée']},
  ];
  const esc=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const img=n=>'./etirements-epaules-'+n+'-v1.webp';
  function go(view,id){if(id)state.eeb1Selected=id;state.view=view;state.selected=null;render();try{window.scrollTo(0,0)}catch(e){}}
  function shell(name){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function')updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.innerHTML='';
    const root=document.createElement('section');root.className='eeb1-screen '+name;
    main.appendChild(root);return root;
  }
  function groupIndex(){
    const root=shell('eeb1-groups');root.setAttribute('aria-label','Étirements — Choisir une zone du corps');
    root.innerHTML=`<button class="eeb1-back" id="eeb1Home">← Retour aux Étirements</button>
      <header class="eeb1-groups-head"><span>UNIVERS ÉTIREMENTS</span><h1>Exercices</h1><p>Choisissez une zone du corps</p></header>
      <div class="eeb1-groups-list">
      <button type="button" class="eeb1-group eeb1-group-cerv" id="eeb1Cerv">
        <strong>Nuque & cervicales</strong><span>6 exercices</span><b aria-hidden="true">›</b>
      </button>
      <button type="button" class="eeb1-group eeb1-group-epaules" id="eeb1Shoulders">
        <strong>Épaules & bras</strong><span>10 exercices</span><b aria-hidden="true">›</b>
      </button>
      </div>
      <p class="eeb1-next">Prochainement : pectoraux, dos, hanches et fessiers, cuisses, mollets et chevilles.</p>`;
    root.querySelector('#eeb1Home').addEventListener('click',()=>go('etirements-menu'));
    root.querySelector('#eeb1Cerv').addEventListener('click',()=>go(CERVICALS));
    root.querySelector('#eeb1Shoulders').addEventListener('click',()=>go(LIST));
  }
  function category(){
    const root=shell('eeb1-list');root.setAttribute('aria-label','Épaules et bras — 10 exercices');
    const head=document.createElement('div');head.className='eeb1-list-head';
    const cover=document.createElement('img');cover.src=img('entete');cover.alt='Épaules et bras, choisissez un exercice';cover.decoding='async';
    head.appendChild(cover);
    // Clickable back area on the original approved visual.
    const back=document.createElement('button');back.type='button';back.className='eeb1-back-hotspot';back.setAttribute('aria-label','Retour aux catégories d’étirements');back.addEventListener('click',()=>go(GROUPS));head.appendChild(back);
    root.appendChild(head);
    const list=document.createElement('div');list.className='eeb1-banner-list';
    EX.forEach((ex,i)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='eeb1-banner';btn.setAttribute('aria-label','Ouvrir '+ex.title);
      const pic=document.createElement('img');pic.src=img('bandeau-'+(i+1));pic.alt='';pic.loading=i<3?'eager':'lazy';pic.decoding='async';btn.appendChild(pic);
      btn.addEventListener('click',()=>go(DETAIL,ex.id));list.appendChild(btn);
    });root.appendChild(list);
    const footer=document.createElement('footer');footer.className='eeb1-list-footer';footer.textContent='SPORT & NUTRITION · ÉTIREMENTS · ÉPAULES & BRAS';root.appendChild(footer);
  }
  function videoNotice(){
    if(main.querySelector('.eeb1-modal'))return;
    const modal=document.createElement('div');modal.className='eeb1-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','eeb1DialogTitle');
    modal.innerHTML='<div class="eeb1-modal-content"><div class="eeb1-play">▶</div><h2 id="eeb1DialogTitle">Vidéo explicative à venir</h2><p>La fiche de cet étirement est déjà disponible. Nous ajouterons la démonstration animée après validation.</p><button type="button">Retour à la fiche</button></div>';
    main.appendChild(modal);
    const close=()=>modal.remove();modal.querySelector('button').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    modal.querySelector('button').focus();
  }
  function detail(){
    const ex=EX.find(x=>x.id===state.eeb1Selected)||EX[0], i=EX.indexOf(ex)+1;
    const root=shell('eeb1-detail');root.setAttribute('aria-label','Fiche : '+ex.title);
    root.innerHTML=`
      <button type="button" class="eeb1-back eeb1-detail-return" id="eeb1Return">← Retour à Épaules & bras</button>
      <div class="eeb1-hero" style="background-image:linear-gradient(90deg,rgba(0,45,39,.77) 0%,rgba(0,45,39,.28) 47%,transparent 80%),url('${img('photo-'+i)}')">
        <div class="eeb1-hero-copy"><div class="eeb1-hero-kicker">ÉTIREMENTS · ÉPAULES & BRAS</div>
          <h1>${esc(ex.title)}</h1><div class="eeb1-mark"></div><p>${esc(ex.subtitle)}</p></div>
      </div>
      <div class="eeb1-stats" aria-label="Informations de l’exercice">
        ${[['1','Zone ciblée',ex.zone],['2','Durée',ex.duration],['3','Niveau','Doux'],['4','Côtés',ex.sides]].map(([n,label,value])=>`<div class="eeb1-stat"><img src="./etirements-epaules-info-ico-${n}.png" alt=""><div><span>${label} :</span><strong>${esc(value)}</strong></div></div>`).join('')}
      </div>
      <section class="eeb1-panel eeb1-howto"><div class="eeb1-panel-title"><span class="eeb1-symbol">☷</span><h2>Comment faire</h2></div><ol>${ex.steps.map(st=>`<li>${esc(st)}</li>`).join('')}</ol></section>
      <section class="eeb1-panel"><div class="eeb1-panel-title"><span class="eeb1-symbol">♧</span><h2>Conseils</h2></div>
        <ul><li>Respire lentement et profondément.</li><li>Ne force jamais la douleur.</li><li>Garde le mouvement fluide et contrôlé.</li></ul></section>
      <section class="eeb1-panel eeb1-benefits"><div class="eeb1-panel-title"><span class="eeb1-symbol">✧</span><h2>Bienfaits</h2></div>
        <div class="eeb1-benefits-row">${ex.benefits.map((b,j)=>`<div><span class="eeb1-benefit-icon">${['♧','⟳','◉'][j]}</span><span>${esc(b)}</span></div>`).join('')}</div>
      </section>
      <button type="button" class="eeb1-video" id="eeb1Video"><span class="eeb1-video-icon">▶</span> Voir la vidéo explicative</button>
      <p class="eeb1-advice">Mouvements doux, sans à-coups ni douleur. Arrête en cas de douleur, vertige ou fourmillements.</p>`;
    root.querySelector('#eeb1Return').addEventListener('click',()=>go(LIST));
    root.querySelector('#eeb1Video').addEventListener('click',videoNotice);
  }
  const oldRender=render;
  render=function(){
    if(state.view===GROUPS)return groupIndex();
    if(state.view===LIST)return category();
    if(state.view===DETAIL)return detail();
    return oldRender.apply(this,arguments);
  };
})();
