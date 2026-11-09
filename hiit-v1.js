/* HIIT V1 — module isolé. Réutilise le lecteur Circuit Training validé.
   Aucun changement au suivi Marche/GPS, à la Musculation classique, ni aux sons.
   Les images des 24 fiches sont pour l'instant des visuels de famille :
   les visuels individuels seront validés séparément. */
(function () {
  'use strict';
  const KEY='mb_muscu_seances_v1';
  const IMG={course:'./hiit-photo-course-v1.webp',coord:'./hiit-photo-coordination-v1.webp',renfo:'./hiit-photo-renforcement-v1.webp'};
  const GROUPS=[
    {id:'course',title:'Course sur place & cardio',subtitle:'10 exercices',desc:'Rythme, endurance et déplacements rapides.',image:IMG.course},
    {id:'coord',title:'Cardio & coordination',subtitle:'6 exercices',desc:'Coordination, souffle et mouvements complets.',image:IMG.coord},
    {id:'renfo',title:'Renforcement HIIT',subtitle:'8 exercices',desc:'Force, stabilité et cardio musculaire.',image:IMG.renfo}
  ];
  // [identifiant, nom, consigne, variante moins intense]
  const RAW={
    course:[
      ['course-sur-place','Course sur place','Cours sur place à rythme confortable, buste droit et bras actifs.','Marche rapide sur place.'],
      ['talons-fesses','Course sur place : talons-fesses','Alterner rapidement les talons vers les fessiers sans cambrer le dos.','Même mouvement sans course ni saut.'],
      ['genoux-hauts','Course sur place : genoux hauts','Monter les genoux alternativement, sans incliner le buste.','Monter les genoux en marchant.'],
      ['petits-pas','Petits pas rapides sur place','Faire de très petits appuis rapides, avec les genoux légèrement fléchis.','Réduire la cadence.'],
      ['sprint-place','Sprint sur place','Accélérer la course sur place en gardant un mouvement maîtrisé.','Course tranquille sur place.'],
      ['pas-chasses','Pas chassés latéraux','Faire deux pas chassés vers la droite puis vers la gauche, dans un espace dégagé.','Petits déplacements latéraux sans saut.'],
      ['patineur','Pas du patineur','Passer latéralement d’une jambe à l’autre avec contrôle et équilibre.','Faire des pas latéraux sans saut.'],
      ['avant-arriere','Déplacements avant-arrière','Avancer de deux à trois petits pas, puis reculer prudemment.','Marcher sur place en alternant avant et arrière.'],
      ['corde-imaginaire','Corde à sauter imaginaire','Mimer la corde avec les poignets et de petits rebonds réguliers.','Alterner les pieds sans décoller les deux à la fois.'],
      ['jumping-jacks','Jumping jacks','Écarter bras et jambes puis revenir en position centrale de façon rythmée.','Faire un pas latéral à la fois.']
    ],
    coord:[
      ['shadow-boxing','Boxe dans le vide','Enchaîner des coups de poing contrôlés devant soi, sans verrouiller les coudes.','Ralentir le rythme et garder les pieds au sol.'],
      ['genoux-poings','Genoux hauts et coups de poing','Alterner une montée de genou avec un coup de poing contrôlé devant soi.','Marche genoux hauts avec mouvements de bras.'],
      ['jack-sans-saut','Jumping jacks sans saut','Alterner des pas latéraux et lever les bras au-dessus de la tête.','Réduire l’amplitude des bras.'],
      ['step-ups','Montées sur marche','Monter puis descendre une marche stable, en alternant la jambe de départ.','Utiliser une marche basse et un appui stable.'],
      ['squat-pointes','Squats et montée sur pointes','Faire un squat contrôlé puis monter sur la pointe des pieds.','Squat moins profond, sans montée sur pointes.'],
      ['fentes-dynamiques','Fentes arrière dynamiques','Faire des fentes arrière alternées, en gardant le buste droit.','Réduire la profondeur de la fente.']
    ],
    renfo:[
      ['squats-rapides','Squats rapides contrôlés','Enchaîner des squats avec un mouvement fluide, sans rebond au fond.','Ralentir le mouvement et diminuer l’amplitude.'],
      ['mountain-climbers','Mountain climbers','En position de planche, ramener alternativement les genoux vers la poitrine.','Faire le mouvement lentement.'],
      ['mountain-inclines','Mountain climbers inclinés','Mains sur un support stable, avancer les genoux alternativement.','Support plus haut et cadence modérée.'],
      ['pompes-inclinees','Pompes inclinées','Réaliser des pompes, mains sur un support fixe et stable.','Support plus haut pour réduire l’intensité.'],
      ['planche-epaules','Planche avec toucher d’épaule','Depuis la planche, toucher l’épaule opposée en limitant la rotation du bassin.','Faire l’exercice mains sur un support surélevé.'],
      ['burpees-sans-saut','Burpees sans saut','Descendre mains au sol, reculer les pieds un par un, puis revenir debout.','Prendre appui sur une chaise très stable ou un banc.'],
      ['bird-dog','Bird-dog dynamique','À quatre pattes, étendre bras et jambe opposés puis alterner, sans creuser le dos.','Marquer une pause entre les répétitions.'],
      ['gainage-dynamique','Gainage dynamique','Alterner des appuis de gainage de manière contrôlée, en gardant le bassin stable.','Réduire l’amplitude ou prendre appui sur les genoux.']
    ]
  };
  const EX=GROUPS.flatMap(g=>RAW[g.id].map(([id,title,tip,easy])=>({id,title,tip,easy,group:g.id,groupLabel:g.title,image:g.image,key:'hiit:'+id})));
  const BY_ID=Object.fromEntries(EX.map(x=>[x.id,x]));
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const val=(v,min,max,def)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):def;};
  const numberOf=e=>EX.filter(x=>x.group===e).length;
  const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch(_){return [];}};
  const write=a=>{try{localStorage.setItem(KEY,JSON.stringify(a));return true;}catch(_){return false;}};
  const saved=()=>read().filter(x=>x&&x.hiit===true);
  const get=s=>main.querySelector(s);
  let group='course',selectedExercise=null,draft=null;
  const defaults=()=>({id:null,name:'Mon HIIT cardio',effort:40,betweenExercises:20,rounds:3,roundRest:60,exerciseKeys:[],createdAt:null});

  function navigate(view,opts={}){
    if(opts.group)group=opts.group;
    if(opts.exercise)selectedExercise=opts.exercise;
    state.view=view;state.selected=null;render();window.scrollTo?.({top:0,behavior:'instant'});
  }
  function applyScreen(){
    document.body.classList.remove('mm1-active','mcs1-active','mp1-active','as1-active','ml1-active');
    document.body.classList.add('hi1-active');bottomNav.classList.add('hidden');
  }
  function pageHeader(title,desc){return `<header class="hi1-top"><button type="button" class="hi1-back" data-hi1-nav="hiit-home" aria-label="Retour au HIIT">‹</button><span class="hi1-brand">⚡ HIIT <small>· Musculation</small></span></header><section class="hi1-heading"><h1>${esc(title)}</h1><p>${esc(desc)}</p></section>`;}
  function footer(){return `<nav class="hi1-footer" aria-label="Navigation HIIT"><button type="button" data-hi1-nav="hub">⌂<span>Accueil</span></button><button type="button" data-hi1-nav="muscu-menu">▰<span>Musculation</span></button><button type="button" data-hi1-nav="muscu-history">▥<span>Historique</span></button></nav>`;}
  function home(){
    applyScreen();
    main.innerHTML=`<section class="hi1-poster" aria-label="HIIT — Choisissez une catégorie">
      <img src="./hiit-accueil-valide-v1.webp" width="941" height="1672" alt="HIIT : Course sur place et cardio, Cardio et coordination, Renforcement HIIT, Créer une séance HIIT" decoding="async">
      <button type="button" class="hi1-zone hi1-back-zone" data-hi1-nav="muscu-menu" aria-label="Retour à Musculation"></button>
      <button type="button" class="hi1-zone hi1-course-zone" data-hi1-group="course" aria-label="Course sur place et cardio, 10 exercices"></button>
      <button type="button" class="hi1-zone hi1-coord-zone" data-hi1-group="coord" aria-label="Cardio et coordination, 6 exercices"></button>
      <button type="button" class="hi1-zone hi1-renfo-zone" data-hi1-group="renfo" aria-label="Renforcement HIIT, 8 exercices"></button>
      <button type="button" class="hi1-zone hi1-create-zone" data-hi1-create aria-label="Créer une séance HIIT"></button>
      <button type="button" class="hi1-zone hi1-home-zone" data-hi1-nav="hub" aria-label="Accueil général"></button>
      <button type="button" class="hi1-zone hi1-muscu-zone" data-hi1-nav="muscu-menu" aria-label="Musculation"></button>
      <button type="button" class="hi1-zone hi1-history-zone" data-hi1-nav="muscu-history" aria-label="Historique"></button>
      </section>`;
    bind();
  }
  function groupsPage(){
    applyScreen();const g=GROUPS.find(x=>x.id===group)||GROUPS[0],list=EX.filter(x=>x.group===g.id);
    main.innerHTML=`<section class="hi1-screen">${pageHeader(g.title,`${list.length} exercices · ${g.desc}`)}
      <div class="hi1-content"><div class="hi1-group-photo"><img src="${g.image}" alt="Illustration de ${esc(g.title)}"><strong>${esc(g.title)}</strong></div>
      <p class="hi1-note">Choisis un exercice pour consulter ses consignes. Les photos individuelles seront ajoutées et validées séparément.</p>
      <div class="hi1-exercise-list">${list.map((x,i)=>`<button type="button" class="hi1-exercise-card" data-hi1-exercise="${x.id}"><img src="${x.image}" alt="" loading="lazy"><span class="hi1-exercise-name"><small>${String(i+1).padStart(2,'0')} · HIIT</small><strong>${esc(x.title)}</strong></span><span class="hi1-chevron" aria-hidden="true">›</span></button>`).join('')}</div>
      <button type="button" class="hi1-cta" data-hi1-create>＋ Créer une séance avec les 24 exercices</button>
      </div>${footer()}</section>`;bind();
  }
  function exercisePage(){
    applyScreen();const x=BY_ID[selectedExercise]||EX[0];
    main.innerHTML=`<section class="hi1-screen">${pageHeader(x.title,x.groupLabel)}<div class="hi1-content">
      <div class="hi1-detail-photo"><img src="${x.image}" alt="Illustration de la famille ${esc(x.groupLabel)}"></div>
      <section class="hi1-panel"><h2>Comment réaliser l'exercice</h2><p>${esc(x.tip)}</p></section>
      <section class="hi1-panel"><h2>Variante à faible impact</h2><p>${esc(x.easy)}</p></section>
      <p class="hi1-note">Adapte l'intensité à ton niveau et prévois un échauffement. La photo est un visuel de catégorie, pas encore la démonstration individuelle du mouvement.</p>
      <button type="button" class="hi1-cta" data-hi1-add="${x.id}">＋ Ajouter à ma séance HIIT</button>
      <button type="button" class="hi1-secondary" data-hi1-group="${x.group}">← Retour aux exercices</button>
      </div>${footer()}</section>`;bind();
  }
  function initDraft(record){
    if(record){draft={...defaults(),...JSON.parse(JSON.stringify(record)),exerciseKeys:[...(record.exerciseKeys||[])]};}
    else draft=defaults();
  }
  function editor(){
    applyScreen();if(!draft)initDraft(null);
    const ids=draft.exerciseKeys.map(k=>k.replace(/^hiit:/,'')).filter(id=>BY_ID[id]);
    const seconds=ids.length*draft.effort*draft.rounds+Math.max(0,ids.length-1)*draft.betweenExercises*draft.rounds+Math.max(0,draft.rounds-1)*draft.roundRest;
    main.innerHTML=`<section class="hi1-screen">${pageHeader(draft.id?'Modifier ma séance HIIT':'Créer une séance HIIT','Sélectionne tes exercices et personnalise ton chronomètre.')}
      <div class="hi1-content"><div class="hi1-panel"><label class="hi1-label" for="hi1Name">Nom de la séance</label><input class="hi1-input" id="hi1Name" maxlength="80" value="${esc(draft.name)}" placeholder="Ex. Cardio maison"></div>
      <section class="hi1-panel"><h2>Réglages du circuit</h2><div class="hi1-settings">
        ${[['effort','Temps d’effort (s)',5,3600],['betweenExercises','Repos entre exercices (s)',0,600],['rounds','Nombre de tours',1,30],['roundRest','Repos entre tours (s)',0,1800]].map(([id,label,min,max])=>`<label class="hi1-setting">${label}<input type="number" min="${min}" max="${max}" step="1" inputmode="numeric" data-hi1-setting="${id}" value="${draft[id]}"></label>`).join('')}</div><p class="hi1-note">Le lecteur utilise également la transition de 2 secondes déjà validée.</p></section>
      <section class="hi1-panel"><h2>Exercices sélectionnés <span id="hi1Count">(${ids.length}/24)</span></h2>
      ${GROUPS.map(g=>`<div class="hi1-pick-group"><h3>${esc(g.title)}</h3>${EX.filter(x=>x.group===g.id).map(x=>`<label class="hi1-picker-row"><input type="checkbox" data-hi1-pick="${x.id}" ${ids.includes(x.id)?'checked':''}><span>${esc(x.title)}</span></label>`).join('')}</div>`).join('')}</section>
      <section class="hi1-panel hi1-summary"><strong>${ids.length} exercices choisis</strong><span>Durée indicative : ${Math.floor(seconds/60)} min ${String(seconds%60).padStart(2,'0')} s</span></section>
      <button class="hi1-cta" type="button" id="hi1Save">✓ Enregistrer ma séance HIIT</button><button type="button" class="hi1-secondary" data-hi1-nav="hiit-sessions">Voir mes séances HIIT</button>
      </div>${footer()}</section>`;bind();
    get('#hi1Name')?.addEventListener('input',e=>draft.name=e.target.value);
    main.querySelectorAll('[data-hi1-setting]').forEach(input=>input.addEventListener('change',()=>{
      const ranges={effort:[5,3600],betweenExercises:[0,600],rounds:[1,30],roundRest:[0,1800]},k=input.dataset.hi1Setting;
      draft[k]=val(input.value,...ranges[k],draft[k]);input.value=draft[k];
    }));
    main.querySelectorAll('[data-hi1-pick]').forEach(input=>input.addEventListener('change',()=>{
      const key='hiit:'+input.dataset.hi1Pick;
      if(input.checked&&!draft.exerciseKeys.includes(key))draft.exerciseKeys.push(key);
      if(!input.checked)draft.exerciseKeys=draft.exerciseKeys.filter(x=>x!==key);
      // Ne pas redessiner le formulaire pendant la sélection : conserve la saisie et le défilement.
      const count=get('#hi1Count');if(count)count.textContent=`(${draft.exerciseKeys.length}/24)`;
      const summary=get('.hi1-summary strong');if(summary)summary.textContent=`${draft.exerciseKeys.length} exercices choisis`;
    }));
    get('#hi1Save')?.addEventListener('click',saveDraft);
  }
  function saveDraft(){
    if(!draft)return;
    const name=String(draft.name||'').trim();
    if(name.length<2){alert('Donne un nom d’au moins deux caractères.');get('#hi1Name')?.focus();return;}
    const ids=[...new Set(draft.exerciseKeys)].map(k=>k.replace(/^hiit:/,'')).filter(id=>BY_ID[id]);
    if(!ids.length){alert('Choisis au moins un exercice HIIT.');return;}
    const items=read(),old=items.find(x=>x.id===draft.id);
    const id=old?.id||'hiit-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
    const record={id,hiit:true,name:(/^hiit\b/i.test(name)?name:'HIIT · '+name).slice(0,80),mode:'circuit',effort:draft.effort,betweenExercises:draft.betweenExercises,rounds:draft.rounds,roundRest:draft.roundRest,
      series:3,repetitions:12,seriesRest:45,classicBetweenExercises:60,overrides:{},exerciseKeys:ids.map(x=>'hiit:'+x),
      exerciseSnapshots:ids.map(x=>{const e=BY_ID[x];return {key:e.key,id:e.id,title:e.title,group:'hiit',groupLabel:e.groupLabel,image:e.image};}),
      createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    const next=old?items.map(x=>x.id===id?record:x):[record,...items];
    if(!write(next)){alert('Impossible de sauvegarder. Vérifie le stockage de ton téléphone.');return;}
    draft=null;navigate('hiit-sessions');
  }
  function sessionsPage(){
    applyScreen();const entries=saved();
    main.innerHTML=`<section class="hi1-screen">${pageHeader('Mes séances HIIT','Crée, retrouve et démarre tes circuits HIIT.')}
      <div class="hi1-content"><button class="hi1-cta" data-hi1-create>＋ Créer une nouvelle séance</button>
      ${entries.length?entries.map(x=>`<article class="hi1-saved-card"><div><small>HIIT · Circuit Training</small><h2>${esc(x.name)}</h2><p>${x.exerciseKeys.length} exercices · ${x.rounds} tours · ${x.effort} s d’effort · ${x.betweenExercises} s de repos</p></div>
      <div class="hi1-saved-actions"><button type="button" data-hi1-start="${esc(x.id)}">▶ Démarrer</button><button type="button" data-hi1-edit="${esc(x.id)}">Modifier</button><button type="button" class="hi1-danger" data-hi1-delete="${esc(x.id)}">Supprimer</button></div></article>`).join(''):'<div class="hi1-panel hi1-empty">Aucune séance HIIT enregistrée. Choisis tes exercices pour préparer ton premier circuit.</div>'}
      <p class="hi1-note">Les séances HIIT enregistrées utilisent le même lecteur, les mêmes sons et le même historique que tes circuits Musculation.</p>
      <button class="hi1-secondary" data-hi1-nav="hiit-home">← Retour aux catégories HIIT</button></div>${footer()}</section>`;bind();
  }
  function startSaved(id){
    const session=read().find(x=>x.id===id&&x.hiit===true);
    if(!session){alert('Cette séance HIIT est introuvable.');return;}
    // Le lecteur Musculation existant reste l'unique moteur des circuits.
    state.mcsSessionId=id;state.view='muscu-session-detail';state.selected=null;render();
    const start=get('#mp1Start');
    if(start){start.click();return;}
    alert('Le lecteur Circuit Training est indisponible. Réouvre la séance depuis Musculation → Séances.');
  }
  function bind(){
    main.querySelectorAll('[data-hi1-nav]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.hi1Nav)));
    main.querySelectorAll('[data-hi1-group]').forEach(el=>el.addEventListener('click',()=>navigate('hiit-group',{group:el.dataset.hi1Group})));
    main.querySelectorAll('[data-hi1-exercise]').forEach(el=>el.addEventListener('click',()=>navigate('hiit-exercise',{exercise:el.dataset.hi1Exercise})));
    main.querySelectorAll('[data-hi1-create]').forEach(el=>el.addEventListener('click',()=>{initDraft(null);navigate('hiit-builder');}));
    main.querySelectorAll('[data-hi1-add]').forEach(el=>el.addEventListener('click',()=>{
      const id=el.dataset.hi1Add;if(!draft)initDraft(null);
      if(!draft.exerciseKeys.includes('hiit:'+id))draft.exerciseKeys.push('hiit:'+id);
      navigate('hiit-builder');
    }));
    main.querySelectorAll('[data-hi1-start]').forEach(el=>el.addEventListener('click',()=>startSaved(el.dataset.hi1Start)));
    main.querySelectorAll('[data-hi1-edit]').forEach(el=>el.addEventListener('click',()=>{const entry=saved().find(x=>x.id===el.dataset.hi1Edit);if(entry){initDraft(entry);navigate('hiit-builder');}}));
    main.querySelectorAll('[data-hi1-delete]').forEach(el=>el.addEventListener('click',()=>{
      const id=el.dataset.hi1Delete;
      if(!confirm('Supprimer définitivement cette séance HIIT ?'))return;
      if(!write(read().filter(x=>x.id!==id))){alert('Suppression impossible.');return;}
      sessionsPage();
    }));
  }
  // Un troisième bandeau, sans aucune modification des deux bandeaux Musculation validés.
  const previousMenu=renderMuscuMenu;
  renderMuscuMenu=function(){
    previousMenu.apply(this,arguments);
    const cards=main.querySelector('.mm1-menu-cards');
    if(!cards||cards.querySelector('.mm1-hiit-entry'))return;
    const btn=document.createElement('button');btn.type='button';btn.className='mm1-hiit-entry';
    btn.setAttribute('aria-label','HIIT — 24 exercices et création de séances');
    btn.innerHTML='<img src="./hiit-photo-course-v1.webp" alt="" loading="lazy"><span class="mm1-hiit-icon" aria-hidden="true">ϟ</span><span class="mm1-hiit-name"><strong>HIIT</strong><small>Cardio, endurance et renforcement · 24 exercices</small></span><span class="mm1-hiit-arrow" aria-hidden="true">›</span>';
    btn.addEventListener('click',()=>navigate('hiit-home'));cards.appendChild(btn);
  };
  const oldRender=render;
  render=function(){
    const v=state.view;
    if(v==='hiit-home')return home();
    if(v==='hiit-group')return groupsPage();
    if(v==='hiit-exercise')return exercisePage();
    if(v==='hiit-builder')return editor();
    if(v==='hiit-sessions')return sessionsPage();
    document.body.classList.remove('hi1-active');
    return oldRender.apply(this,arguments);
  };
  window.HIITCatalogue={groups:GROUPS.map(g=>({id:g.id,title:g.title,count:numberOf(g.id)})),count:EX.length};
})();
