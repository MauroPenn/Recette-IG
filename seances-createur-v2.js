/* MUSCULATION — CRÉATEUR DE SÉANCES V2 — chargement corrigé, bandeaux 560 x 190
 * Nouveau module isolé : liste de séances, sélection des 70 exercices existants,
 * mode Circuit et mode Séries/Répétitions, réglages, enregistrement local.
 * Ne modifie pas le GPS, la marche, le contenu ni les images des fiches d'exercices.
 */
(function(){
  'use strict';
  const KEY='mb_muscu_seances_v1';
  const G=[
    ['pectoraux','Pectoraux',()=>typeof pectorauxExercices==='undefined'?[]:pectorauxExercices],
    ['dos','Dos',()=>typeof dosExercices==='undefined'?[]:dosExercices],
    ['epaules','Épaules',()=>typeof epaulesExercices==='undefined'?[]:epaulesExercices],
    ['biceps','Biceps',()=>typeof bicepsModernExercices==='undefined'?[]:bicepsModernExercices],
    ['triceps','Triceps',()=>typeof tricepsExercices==='undefined'?[]:tricepsExercices],
    ['jambes','Jambes',()=>typeof jambesExercices==='undefined'?[]:jambesExercices],
    ['abdominaux','Abdominaux',()=>typeof abdominauxExercices==='undefined'?[]:abdominauxExercices]
  ];
  const sel=s=>main.querySelector(s);
  const all=s=>[...main.querySelectorAll(s)];
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeInt=(v,min,max,defaultVal)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):defaultVal;};
  const numFmt=n=>new Intl.NumberFormat('fr-FR').format(n);
  const timeFmt=seconds=>{
    const s=Math.ceil(Math.max(0,seconds));
    return `${Math.floor(s/60)} min ${String(s%60).padStart(2,'0')} s`;
  };
  const makeId=()=>`muscu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const imageSrc=src=>typeof src==='string' && /^\.\/[a-z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(src)?src:'';
  const groups=()=>G.map(([id,label,get])=>({id,label,count:get().length}));
  function catalog(){
    return G.flatMap(([g,label,get])=>{
      const data=get();
      return (Array.isArray(data)?data:[]).filter(x=>x&&x.id).map(x=>({
        key:g+':'+x.id,id:x.id,group:g,groupLabel:label,
        title:String(x.titre||x.nom||x.id),image:imageSrc(x.image)||`./${g}-${x.id}.webp`
      }));
    });
  }
  const catalogByKey=key=>catalog().find(x=>x.key===key);
  let draft=null,query='',filter='tous',editingId=null;
  function defaults(){return {
    id:null,name:'',mode:'circuit',effort:50,betweenExercises:15,rounds:4,roundRest:60,
    series:3,repetitions:12,seriesRest:45,classicBetweenExercises:60,
    exerciseKeys:[],overrides:{},createdAt:null
  };}
  function read(){
    try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}
    catch(_){return [];}
  }
  function write(items){
    try{localStorage.setItem(KEY,JSON.stringify(items));return true;}
    catch(_){return false;}
  }
  function enter(view){
    state.view=view;
    state.selected=null;
    render();
    if(typeof window.scrollTo==='function')window.scrollTo({top:0,behavior:'instant'});
  }
  function showNew(session){
    draft=session?{
      ...defaults(),...JSON.parse(JSON.stringify(session)),
      exerciseKeys:Array.isArray(session.exerciseKeys)?[...session.exerciseKeys]:[],
      overrides:{...(session.overrides||{})}
    }:defaults();
    editingId=session?.id||null;
    query='';filter='tous';enter('muscu-session-builder');
  }
  function findSaved(id){return read().find(x=>x.id===id);}
  function imageMarkup(x,cls='mcs-thumb'){
    if(!x||!imageSrc(x.image))return `<span class="${cls} mcs-empty-image">▣</span>`;
    return `<img class="${cls}" src="${esc(x.image)}" alt="${esc(x.title)}" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">`;
  }
  function header(title,subtitle,back){
    return `<header class="mcs-top">
      <button type="button" class="mcs-back" data-mcs-action="${esc(back)}" aria-label="Retour">‹</button>
      <div class="mcs-brand">🏋 <span>MUSCULATION</span></div>
      <div class="mcs-topspacer"></div>
    </header><div class="mcs-intro"><div class="mcs-intro-icon">▦</div><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div></div>`;
  }
  function saveActions(){
    const name=String(draft.name||'').trim();
    if(name.length<2){alert('Donne un nom à ta séance (au moins 2 caractères).');sel('#mcsName')?.focus();return;}
    if(!draft.exerciseKeys.length){alert('Sélectionne au moins un exercice.');return;}
    if(draft.exerciseKeys.length>50){alert('Une séance peut contenir au maximum 50 exercices.');return;}
    draft.name=name.slice(0,80);
    const items=read();
    const old=editingId?items.find(x=>x.id===editingId):null;
    const snap=draft.exerciseKeys.map(k=>catalogByKey(k)).filter(Boolean);
    if(snap.length!==draft.exerciseKeys.length){alert('Un exercice de la sélection est devenu indisponible. Vérifie la liste.');return;}
    const record={...draft,id:old?.id||makeId(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),exerciseSnapshots:snap};
    const next=old?items.map(x=>x.id===old.id?record:x):[record,...items];
    if(!write(next)){alert('Enregistrement impossible sur cet appareil. Vérifie l’espace de stockage disponible.');return;}
    editingId=null;draft=null;enter('muscu-sessions');
  }
  function estimate(){
    if(!draft||!draft.exerciseKeys.length)return 'Ajoute des exercices';
    if(draft.mode==='classic')return 'Variable · selon ton rythme';
    const n=draft.exerciseKeys.length;
    return timeFmt(n*draft.effort*draft.rounds+Math.max(0,n-1)*draft.betweenExercises*draft.rounds+Math.max(0,draft.rounds-1)*draft.roundRest);
  }
  function field(label,id,val,min,max,step,unit){
    return `<label class="mcs-setting"><span>${esc(label)}</span><span class="mcs-control"><input inputmode="numeric" type="number" min="${min}" max="${max}" step="${step}" value="${val}" data-mcs-field="${id}" aria-label="${esc(label)}"><small>${esc(unit)}</small></span></label>`;
  }
  function exerciseRows(){
    if(!draft.exerciseKeys.length)return `<div class="mcs-empty"><div class="mcs-empty-symbol">＋</div><p>Aucun exercice sélectionné.</p><span>Ajoute tes exercices parmi les 7 groupes musculaires.</span></div>`;
    return draft.exerciseKeys.map((key,i)=>{
      const x=catalogByKey(key)||draft.exerciseSnapshots?.find(o=>o.key===key)||{title:'Exercice indisponible',groupLabel:'—',image:''};
      const ov=draft.overrides[key]||{};
      const edits=draft.mode==='classic'?`<div class="mcs-overrides">
        ${[['series','Séries',safeInt(ov.series??draft.series,1,20,3),1,20],['repetitions','Répétitions',safeInt(ov.repetitions??draft.repetitions,1,100,12),1,100],['seriesRest','Repos entre séries',safeInt(ov.seriesRest??draft.seriesRest,0,600,45),0,600]].map(([k,title,value,min,max])=>`<label><span>${title}</span><input type="number" inputmode="numeric" min="${min}" max="${max}" value="${value}" data-mcs-override="${esc(key)}" data-mcs-prop="${k}" aria-label="${title} de ${esc(x.title)}"><small>${k==='seriesRest'?'s':''}</small></label>`).join('')}
      </div>`:'';
      return `<div class="mcs-picked" data-mcs-picked="${esc(key)}"><div class="mcs-picked-head">
        <b class="mcs-number">${i+1}</b>${imageMarkup(x)}
        <div class="mcs-picked-name"><strong>${esc(x.title)}</strong><small>${esc(x.groupLabel)}</small></div>
        <button type="button" data-mcs-remove="${esc(key)}" aria-label="Retirer ${esc(x.title)}" title="Retirer cet exercice">×</button></div>
        <div class="mcs-order"><button type="button" data-mcs-move="up" data-mcs-key="${esc(key)}" ${i===0?'disabled':''}>↑ Monter</button><button type="button" data-mcs-move="down" data-mcs-key="${esc(key)}" ${i===draft.exerciseKeys.length-1?'disabled':''}>↓ Descendre</button></div>
        ${edits}</div>`;
    }).join('');
  }
  function showBuilder(){
    if(!draft)draft=defaults();
    document.body.classList.add('mcs1-active');
    bottomNav.classList.add('hidden');
    const circuit=draft.mode==='circuit';
    main.innerHTML=`<section class="mcs-screen" aria-label="Création d'une séance">
      ${header(editingId?'Modifier une séance':'Créer une séance','Compose ton entraînement et personnalise tes réglages.','sessions')}
      <div class="mcs-content">
      <section class="mcs-panel"><h2>✎ Nom de la séance</h2><input class="mcs-name" type="text" id="mcsName" maxlength="80" placeholder="Ex. Circuit Full Body" value="${esc(draft.name)}" autocomplete="off"></section>
      <section class="mcs-panel"><h2>◈ Type d’entraînement</h2>
      <div class="mcs-mode-grid"><button type="button" class="mcs-mode ${circuit?'selected':''}" data-mcs-mode="circuit"><strong>↻ Circuit Training</strong><small>Au temps · plusieurs tours</small></button>
      <button type="button" class="mcs-mode ${!circuit?'selected':''}" data-mcs-mode="classic"><strong>▣ Musculation</strong><small>Séries / répétitions</small></button></div>
      <p class="mcs-hint">${circuit?'Chaque exercice se déroule au chrono, avec des pauses et des tours automatiques.':'Tu termines chaque série en appuyant sur « Série terminée ». Les pauses sont ensuite chronométrées automatiquement.'}</p></section>
      <section class="mcs-panel"><h2>◷ ${circuit?'Réglages du circuit':'Réglages des séries'}</h2>
      <div class="mcs-settings-grid">
      ${circuit?
      field('Temps d’effort','effort',draft.effort,5,3600,5,'sec')+field('Pause entre exercices','betweenExercises',draft.betweenExercises,0,600,5,'sec')+field('Nombre de tours','rounds',draft.rounds,1,30,1,'tours')+field('Pause entre les tours','roundRest',draft.roundRest,0,1800,5,'sec'):
      field('Séries par exercice','series',draft.series,1,20,1,'séries')+field('Répétitions','repetitions',draft.repetitions,1,100,1,'rép.')+field('Repos entre séries','seriesRest',draft.seriesRest,0,600,5,'sec')+field('Pause entre exercices','classicBetweenExercises',draft.classicBetweenExercises,0,1800,5,'sec')}
      </div>${!circuit?'<p class="mcs-hint">Ces réglages servent de valeurs par défaut. Tu peux les ajuster individuellement pour chaque exercice ci-dessous.</p>':''}</section>
      <section class="mcs-panel"><div class="mcs-panel-title"><h2>☷ Exercices de la séance (<span id="mcsExCount">${draft.exerciseKeys.length}</span>)</h2><button type="button" class="mcs-outline" id="mcsChoose">＋ Choisir</button></div>
      <div id="mcsSelectedRows">${exerciseRows()}</div></section>
      <div class="mcs-estimate"><span>◷ Durée estimée</span><strong id="mcsEstimate">${esc(estimate())}</strong></div>
      <button type="button" class="mcs-primary" id="mcsSave">✓ ${editingId?'Enregistrer les modifications':'Enregistrer la séance'}</button>
      <button type="button" class="mcs-text-button" id="mcsCancel">Annuler et retourner aux séances</button>
      </div></section>`;
    sel('#mcsName')?.addEventListener('input',e=>{draft.name=e.target.value;});
    all('[data-mcs-mode]').forEach(b=>b.addEventListener('click',()=>{
      draft.mode=b.dataset.mcsMode;
      // Les réglages individuels restent disponibles si l'utilisateur revient au mode classique.
      showBuilder();
    }));
    all('[data-mcs-field]').forEach(input=>input.addEventListener('change',()=>{
      const k=input.dataset.mcsField;
      const ranges={effort:[5,3600],betweenExercises:[0,600],rounds:[1,30],roundRest:[0,1800],series:[1,20],repetitions:[1,100],seriesRest:[0,600],classicBetweenExercises:[0,1800]};
      const [min,max]=ranges[k];
      draft[k]=safeInt(input.value,min,max,draft[k]);input.value=draft[k];
      if(!circuit){const c=sel('#mcsSelectedRows');if(c)c.innerHTML=exerciseRows();wireRows();}
      const e=sel('#mcsEstimate');if(e)e.textContent=estimate();
    }));
    sel('#mcsChoose')?.addEventListener('click',()=>enter('muscu-session-picker'));
    sel('#mcsSave')?.addEventListener('click',saveActions);
    sel('#mcsCancel')?.addEventListener('click',()=>{draft=null;editingId=null;enter('muscu-sessions');});
    wireRows();wireBack(()=>enter('muscu-sessions'));
  }
  function wireRows(){
    all('[data-mcs-remove]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.mcsRemove;draft.exerciseKeys=draft.exerciseKeys.filter(x=>x!==k);
      delete draft.overrides[k];refreshBuilderRows();
    }));
    all('[data-mcs-move]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.mcsKey;
      const i=draft.exerciseKeys.indexOf(k);
      const dest=i+(b.dataset.mcsMove==='up'?-1:1);
      if(i<0||dest<0||dest>=draft.exerciseKeys.length)return;
      [draft.exerciseKeys[i],draft.exerciseKeys[dest]]=[draft.exerciseKeys[dest],draft.exerciseKeys[i]];
      refreshBuilderRows();
    }));
    all('[data-mcs-override]').forEach(el=>el.addEventListener('change',()=>{
      const key=el.dataset.mcsOverride,fieldName=el.dataset.mcsProp;
      const ranges={series:[1,20],repetitions:[1,100],seriesRest:[0,600]};
      const [lo,hi]=ranges[fieldName];
      const base=draft[fieldName];
      if(!draft.overrides[key])draft.overrides[key]={};
      draft.overrides[key][fieldName]=safeInt(el.value,lo,hi,base);
      el.value=draft.overrides[key][fieldName];
    }));
  }
  function refreshBuilderRows(){
    const c=sel('#mcsSelectedRows');if(c)c.innerHTML=exerciseRows();
    const n=sel('#mcsExCount');if(n)n.textContent=draft.exerciseKeys.length;
    const e=sel('#mcsEstimate');if(e)e.textContent=estimate();
    wireRows();
  }
  function pickerList(){
    const list=catalog().filter(x=>(filter==='tous'||x.group===filter)&&(!query||`${x.title} ${x.groupLabel}`.toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR'))));
    return list.length?list.map(x=>{
      const picked=draft.exerciseKeys.includes(x.key);
      return `<button type="button" class="mcs-catalog-row ${picked?'picked':''}" data-mcs-toggle="${esc(x.key)}" aria-pressed="${picked?'true':'false'}">${imageMarkup(x)}<span class="mcs-catalog-name"><strong>${esc(x.title)}</strong><small>${esc(x.groupLabel)}</small></span><span class="mcs-select-symbol">${picked?'✓':'＋'}</span></button>`;
    }).join(''):'<p class="mcs-noresults">Aucun exercice ne correspond à cette recherche.</p>';
  }
  function showPicker(){
    if(!draft){enter('muscu-sessions');return;}
    document.body.classList.add('mcs1-active');bottomNav.classList.add('hidden');
    main.innerHTML=`<section class="mcs-screen mcs-picker" aria-label="Sélection des exercices">
      ${header('Sélection des exercices','Choisis les exercices à intégrer dans ta séance.','builder')}
      <div class="mcs-content"><label class="mcs-search-label">Rechercher un exercice<input id="mcsSearch" class="mcs-search" type="search" placeholder="Nom de l’exercice…" value="${esc(query)}" autocomplete="off"></label>
      <div class="mcs-filters" role="group" aria-label="Groupe musculaire">
        ${[{id:'tous',label:'Tous'},...groups()].map(g=>`<button type="button" class="${filter===g.id?'active':''}" data-mcs-filter="${esc(g.id)}">${esc(g.label)}</button>`).join('')}
      </div><div class="mcs-catalog" id="mcsCatalog">${pickerList()}</div>
      <div class="mcs-picker-footer"><div>Exercices sélectionnés : <b id="mcsSelectedCount">${draft.exerciseKeys.length}</b></div><button type="button" class="mcs-primary" id="mcsPickerDone">✓ Valider la sélection</button></div></div></section>`;
    sel('#mcsSearch')?.addEventListener('input',e=>{query=e.target.value;refreshPickerRows();});
    all('[data-mcs-filter]').forEach(b=>b.addEventListener('click',()=>{
      filter=b.dataset.mcsFilter;
      all('[data-mcs-filter]').forEach(z=>z.classList.toggle('active',z===b));
      refreshPickerRows();
    }));
    sel('#mcsPickerDone')?.addEventListener('click',()=>enter('muscu-session-builder'));
    wirePickerRows();wireBack(()=>enter('muscu-session-builder'));
  }
  function wirePickerRows(){
    all('[data-mcs-toggle]').forEach(b=>b.addEventListener('click',()=>{
      const k=b.dataset.mcsToggle,found=draft.exerciseKeys.includes(k);
      if(found){draft.exerciseKeys=draft.exerciseKeys.filter(x=>x!==k);delete draft.overrides[k];}
      else if(draft.exerciseKeys.length<50){draft.exerciseKeys.push(k);}
      else{alert('Une séance peut contenir jusqu’à 50 exercices.');return;}
      const n=sel('#mcsSelectedCount');if(n)n.textContent=draft.exerciseKeys.length;
      refreshPickerRows();
    }));
  }
  function refreshPickerRows(){
    const c=sel('#mcsCatalog');if(c)c.innerHTML=pickerList();
    wirePickerRows();
  }
  function wireBack(action){
    sel('[data-mcs-action]')?.addEventListener('click',action);
  }
  function showDetails(){
    document.body.classList.add('mcs1-active');bottomNav.classList.add('hidden');
    const item=findSaved(state.mcsSessionId);
    if(!item){enter('muscu-sessions');return;}
    const list=item.exerciseKeys.map((key,i)=>{
      const x=catalogByKey(key)||item.exerciseSnapshots?.find(y=>y.key===key)||{title:'Exercice indisponible',groupLabel:'',image:''};
      const override=item.overrides?.[key]||{};
      const note=item.mode==='circuit'?`${item.effort} s d’effort`:`${override.series??item.series} × ${override.repetitions??item.repetitions} répétitions · ${override.seriesRest??item.seriesRest} s de repos`;
      return `<div class="mcs-catalog-row mcs-detail-item"><span class="mcs-number">${i+1}</span>${imageMarkup(x)}<span class="mcs-catalog-name"><strong>${esc(x.title)}</strong><small>${esc(x.groupLabel)} · ${esc(note)}</small></span></div>`;
    }).join('');
    main.innerHTML=`<section class="mcs-screen" aria-label="Détails de la séance">
      ${header(item.name,'Ta séance personnalisée','sessions')}
      <div class="mcs-content"><div class="mcs-panel"><h2>${item.mode==='circuit'?'↻ Circuit Training':'▣ Séries et répétitions'}</h2>
      <div class="mcs-summary-grid"><div><strong>${item.exerciseKeys.length}</strong><small>Exercices</small></div><div><strong>${item.mode==='circuit'?item.rounds:'—'}</strong><small>${item.mode==='circuit'?'Tours':'Tours libres'}</small></div></div>
      <p class="mcs-hint">${item.mode==='circuit'?`Effort ${item.effort} s · Repos ${item.betweenExercises} s · Pause entre tours ${item.roundRest} s.`:`Validation manuelle de chaque série, puis repos automatique. Pause entre exercices : ${item.classicBetweenExercises} s.`}</p></div>
      <section class="mcs-panel"><h2>Exercices (${item.exerciseKeys.length})</h2><div class="mcs-detail-list">${list}</div></section>
      <div class="mcs-actions"><button class="mcs-primary" id="mcsEdit">✎ Modifier la séance</button><button class="mcs-secondary" id="mcsDuplicate">Dupliquer</button><button class="mcs-danger" id="mcsDelete">Supprimer la séance</button></div>
      <p class="mcs-hint mcs-pending"><strong>À venir :</strong> démarrage du chronomètre et déroulement automatique sur les trois écrans validés (exercice, repos, fin du tour). La création et l’enregistrement fonctionnent dès maintenant.</p>
      </div></section>`;
    sel('#mcsEdit')?.addEventListener('click',()=>showNew(item));
    sel('#mcsDuplicate')?.addEventListener('click',()=>{
      const d={...item,name:`${item.name} (copie)`,id:null,createdAt:null};
      showNew(d);editingId=null;
    });
    sel('#mcsDelete')?.addEventListener('click',()=>{
      if(!confirm(`Supprimer définitivement « ${item.name} » de cet appareil ?`))return;
      if(!write(read().filter(x=>x.id!==item.id))){alert('La suppression a échoué.');return;}
      enter('muscu-sessions');
    });
    wireBack(()=>enter('muscu-sessions'));
  }
  // Brancher le bouton de la page Séances existante sans altérer son contenu.
  const previousMuscuSessions=renderMuscuSessions;
  renderMuscuSessions=function(){
    previousMuscuSessions();
    const root=sel('.muscu-sessions-v3');
    if(!root)return;
    const create=sel('.muscu-create-session-v3');
    if(create){
      create.addEventListener('click',()=>showNew(null));
      create.textContent='＋ Créer une séance personnalisée';
      create.setAttribute('aria-label','Créer une nouvelle séance de musculation');
    }
    const items=read();
    const my=document.createElement('section');
    my.className='mcs-saved-list';
    my.setAttribute('aria-label','Mes séances personnalisées');
    my.innerHTML=`<h2>Mes séances <span>(${items.length})</span></h2><p>Retrouve ici les séances que tu as créées sur cet appareil.</p>`+
      (items.length?items.map(x=>`<button type="button" class="mcs-saved-card" data-mcs-open="${esc(x.id)}"><span class="mcs-saved-mark">${x.mode==='circuit'?'↻':'▣'}</span><span><strong>${esc(x.name)}</strong><small>${esc(x.mode==='circuit'?'Circuit Training':'Séries / répétitions')} · ${x.exerciseKeys.length} exercices${x.mode==='circuit'?' · '+x.rounds+' tours':''}</small></span><b aria-hidden="true">›</b></button>`).join(''):
      '<div class="mcs-saved-empty">Tu n’as pas encore de séance personnalisée. Utilise le bouton « Créer une séance » pour commencer.</div>');
    const oldList=root.querySelector('.muscu-sessions-list');
    if(oldList){
      const templates=[
        {key:'haut',title:'Haut du corps',detail:'Pectoraux · Dos · Bras',count:'6 exercices',image:'./seance-haut-corps-v2.png',symbol:'↗',keys:[
          'pectoraux:pompes-classiques','dos:rowing-unilateral-haltere','epaules:developpe-militaire-halteres',
          'biceps:curl-classique','triceps:pompes-diamant','dos:rowing-buste-penche-halteres'
        ]},
        {key:'bas',title:'Bas du corps',detail:'Jambes · Fessiers',count:'6 exercices',image:'./seance-bas-corps-v2.png',symbol:'↗',keys:[
          'jambes:squat-avec-halteres','jambes:fentes-avant','jambes:fentes-arriere',
          'jambes:pont-fessier-sol','jambes:squat-goblet','jambes:mollets-debout-halteres'
        ]},
        {key:'complet',title:'Corps complet',detail:'Full Body · Tous les groupes',count:'8 exercices',image:'./seance-corps-complet-v2.png',symbol:'↗',keys:[
          'jambes:squat-avec-halteres','pectoraux:pompes-classiques','dos:rowing-unilateral-haltere',
          'epaules:developpe-militaire-halteres','biceps:curl-classique','triceps:pompes-diamant',
          'abdominaux:gainage-planche','jambes:fentes-avant'
        ]},
        {key:'abdos',title:'Abdos et gainage',detail:'Centre du corps · Stabilité',count:'5 exercices',image:'./seance-abdos-gainage-v2.png',symbol:'↗',keys:[
          'abdominaux:gainage-planche','abdominaux:dead-bug','abdominaux:crunch-classique',
          'abdominaux:gainage-lateral','abdominaux:toucher-de-talons'
        ]}
      ];
      oldList.innerHTML=templates.map(t=>`<button type="button" class="mcs-session-feature" data-mcs-preset="${t.key}"
        aria-label="Personnaliser le modèle ${t.title}">
        <img class="mcs-session-feature-photo" src="${t.image}" alt="" loading="lazy" decoding="async">
        <span class="mcs-session-feature-shade"></span>
        <span class="mcs-session-feature-copy">
          <span class="mcs-session-feature-label">MODÈLE DE SÉANCE</span>
          <strong>${t.title}</strong><small>${t.detail}</small>
          <span class="mcs-session-feature-count">${t.count} · Personnaliser</span>
        </span>
        <span class="mcs-session-feature-arrow" aria-hidden="true">${t.symbol}</span>
      </button>`).join('');
      oldList.querySelectorAll('[data-mcs-preset]').forEach(btn=>btn.addEventListener('click',()=>{
        const t=templates.find(x=>x.key===btn.dataset.mcsPreset);
        if(!t)return;
        const keys=t.keys.filter(k=>catalogByKey(k));
        showNew({...defaults(),name:t.title,exerciseKeys:keys});
        editingId=null;
      }));
    }
    if(oldList)root.insertBefore(my,oldList);
    else root.appendChild(my);
    if(create)root.insertBefore(create,my);
    const legacyTitle=document.createElement('h2');legacyTitle.className='mcs-legacy-title';legacyTitle.textContent='Séances proposées · à personnaliser';
    if(oldList)root.insertBefore(legacyTitle,oldList);
    root.querySelectorAll('[data-mcs-open]').forEach(b=>b.addEventListener('click',()=>{
      state.mcsSessionId=b.dataset.mcsOpen;enter('muscu-session-detail');
    }));
  };
  // La navigation existante utilise render() ; ajout de nouvelles vues uniquement.
  const previousRender=render;
  render=function(){
    const v=state.view;
    if(v==='muscu-session-builder'||v==='muscu-session-picker'||v==='muscu-session-detail'){
      updateShell();
      if(v==='muscu-session-builder')return showBuilder();
      if(v==='muscu-session-picker')return showPicker();
      return showDetails();
    }
    document.body.classList.remove('mcs1-active');
    return previousRender.apply(this,arguments);
  };
})();
