/* MUSCULATION — LECTEUR DE SÉANCES V5 — TRANSITION CIRCUIT 2 SECONDES
   Lit exclusivement les séances créées avec seances-createur-v2.js ; ne change ni le créateur,
   ni le GPS. Circuit automatique, séries manuelles, repos, bilan et historique local.
   Les séances interrompues sont restaurées en PAUSE (jamais d'avance fictive hors écran). */
(function(){
  'use strict';
  const SAVED='mb_muscu_seances_v1';
  const HISTORY='mb_muscu_historique_v1';
  const DRAFT='mb_muscu_lecture_brouillon_v1';
  const CIRCUIT_TRANSITION_MS=2000; // Pause d'affichage entre deux écrans ; pas de temps retiré aux phases.
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const get=s=>main.querySelector(s);
  const safeInt=(v,min,max,def)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):def;};
  const clock=ms=>{let s=Math.ceil(Math.max(0,ms)/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  const duration=ms=>{let s=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  const read=(key,fallback)=>{try{const val=JSON.parse(localStorage.getItem(key)||'null');return val??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}};
  const remove=key=>{try{localStorage.removeItem(key);}catch(_){}};
  const imagesafe=s=>typeof s==='string'&&/^\.\/[a-z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(s)?s:'';
  const getPhoto=x=>imagesafe(x?.image)||'';
  const copy=x=>JSON.parse(JSON.stringify(x));
  const currentView=()=>['muscu-session-player','muscu-session-result','muscu-session-history'].includes(state.view);
  let workout=null,finished=null,ticker=null,historyPeriod='all';
  let lastPaint=-1;
  let lastAudioSecond=null;
  let lastAudioPhase=null;
  const sounds=()=>window.MuscuSons;
  const cue=name=>sounds()?.cue(name);
  const quiet=()=>sounds()?.silence();
  function countdownSound(ms){
    if(!workout || workout.paused || !phaseTime())return;
    const second=Math.ceil(ms/1000);
    if(workout.phase!==lastAudioPhase){lastAudioPhase=workout.phase;lastAudioSecond=null;}
    if(second>=1 && second<=3 && second!==lastAudioSecond){
      lastAudioSecond=second;
      sounds()?.countdown(second);
    }
  }

  function resolveExercise(record,key){
    const from=Array.isArray(record.exerciseSnapshots)?record.exerciseSnapshots.find(x=>x.key===key):null;
    if(from)return {key,title:String(from.title||key),groupLabel:String(from.groupLabel||''),image:getPhoto(from)};
    // Reconstitution des anciens enregistrements d'avant snapshots.
    const [group,id]=String(key).split(':');
    const src={
      pectoraux:()=>typeof pectorauxExercices!=='undefined'?pectorauxExercices:[],
      dos:()=>typeof dosExercices!=='undefined'?dosExercices:[],
      epaules:()=>typeof epaulesExercices!=='undefined'?epaulesExercices:[],
      biceps:()=>typeof bicepsModernExercices!=='undefined'?bicepsModernExercices:[],
      triceps:()=>typeof tricepsExercices!=='undefined'?tricepsExercices:[],
      jambes:()=>typeof jambesExercices!=='undefined'?jambesExercices:[],
      abdominaux:()=>typeof abdominauxExercices!=='undefined'?abdominauxExercices:[]
    }[group];
    const x=src?.().find(y=>y.id===id);
    const label={pectoraux:'Pectoraux',dos:'Dos',epaules:'Épaules',biceps:'Biceps',triceps:'Triceps',jambes:'Jambes',abdominaux:'Abdominaux'}[group]||'';
    return {key,title:String(x?.titre||id||key),groupLabel:label,image:getPhoto(x)};
  }
  function sourceSessions(){const a=read(SAVED,[]);return Array.isArray(a)?a:[];}
  function stopTicker(){if(ticker!=null){clearInterval(ticker);ticker=null;}}
  function releaseAwake(){if(window.SportScreenAwake)window.SportScreenAwake.stop();}
  function keepAwake(){if(window.SportScreenAwake&&document.visibilityState==='visible')window.SportScreenAwake.start();}
  function activeElapsed(){return !workout?0:(workout.elapsedMs||0)+(!workout.paused&&workout.activeSince?Math.max(0,Date.now()-workout.activeSince):0);}
  function leftMs(){return !workout?0:workout.paused?workout.remainingMs:Math.max(0,workout.deadline-Date.now());}
  function storeDraft(){
    if(!workout)return;
    const d=copy(workout);
    d.remainingMs=leftMs();d.elapsedMs=activeElapsed();d.deadline=0;d.activeSince=0;d.paused=true;
    // La transition peut être reprise même après fermeture/rechargement de l'application.
    if(d.transitionActive){
      d.transitionRemainingMs=workout.paused ? workout.transitionRemainingMs
        : Math.max(0,workout.transitionDeadline-Date.now());
      d.transitionDeadline=0;
    }
    write(DRAFT,d);
  }
  function removeDraft(){remove(DRAFT);}
  function savedDraft(id){const d=read(DRAFT,null);return d&&d.session?.id===id&&d.phase&&Array.isArray(d.exercises)&&d.exercises.length?d:null;}
  function startTicker(){stopTicker();ticker=window.setInterval(tick,200);}
  function phaseTime(){return ['effort','rest-exercise','rest-round','rest-series'].includes(workout?.phase);}
  function applyPhase(phase,seconds){
    if(!workout)return;
    const previousPhase=workout.phase;
    workout.phase=phase;
    workout.transitionActive=false;workout.transitionDeadline=0;workout.transitionRemainingMs=0;
    lastAudioPhase=null;lastAudioSecond=null;
    // Une seule signature sonore par transition ; jamais deux chronomètres concurrents.
    if(!workout.paused){
      if(phase==='rest-round')cue('roundEnd');
      else if(phase==='rest-exercise')cue(previousPhase==='set'?'setEnd':'exerciseEnd');
      else if(phase==='rest-series')cue('setEnd');
      else if(previousPhase==='rest-round')cue('roundStart');
      else if(previousPhase==='rest-exercise'||previousPhase==='rest-series')cue('restEnd');
    }
    workout.phaseTotalMs=safeInt(seconds,0,7200,0)*1000;
    workout.remainingMs=workout.phaseTotalMs;
    workout.deadline=Date.now()+workout.remainingMs;
    if(workout.phase==='set')workout.phaseTotalMs=0;
    storeDraft();
    if(!workout.paused && phaseTime() && workout.phaseTotalMs===0){advance();return;}
    showPlayer();
  }
  function countSet(exIndex){
    const key=workout.session.exerciseKeys[exIndex];
    const ov=(workout.session.overrides||{})[key]||{};
    return {sets:safeInt(ov.series??workout.session.series,1,20,3),reps:safeInt(ov.repetitions??workout.session.repetitions,1,100,12),rest:safeInt(ov.seriesRest??workout.session.seriesRest,0,600,45)};
  }
  function start(session){
    if(!session||!Array.isArray(session.exerciseKeys)||!session.exerciseKeys.length)return alert('Cette séance ne contient aucun exercice.');
    const restored=savedDraft(session.id);
    if(restored){
      if(!confirm('Une séance interrompue existe. OK pour la reprendre en pause, Annuler pour recommencer à zéro.')){
        removeDraft();
      }else{
        workout={...restored,paused:true,remainingMs:restored.remainingMs||0,deadline:0,activeSince:0};
        finished=null;go('muscu-session-player');return;
      }
    }
    if(workout){stopTicker();releaseAwake();workout=null;}
    const record=copy(session);
    const exercises=record.exerciseKeys.map(key=>resolveExercise(record,key));
    workout={session:record,exercises,idx:0,round:1,setIndex:1,phase:record.mode==='circuit'?'effort':'set',
      phaseTotalMs:record.mode==='circuit'?safeInt(record.effort,5,3600,50)*1000:0,
      remainingMs:record.mode==='circuit'?safeInt(record.effort,5,3600,50)*1000:0,
      deadline:0,paused:false,activeSince:Date.now(),elapsedMs:0,
      transitionActive:false,transitionDeadline:0,transitionRemainingMs:0,
      startedAt:new Date().toISOString(),completedEfforts:0,completedSets:0,skippedEfforts:0};
    if(workout.phase==='effort')workout.deadline=Date.now()+workout.remainingMs;
    lastAudioPhase=null;lastAudioSecond=null;
    // Le démarrage vient d'un clic humain : active Web Audio avant le premier bip.
    sounds()?.unlock();
    cue('start');
    finished=null;storeDraft();keepAwake();go('muscu-session-player');
  }
  function pause(){
    if(!workout||workout.paused)return;
    // Geler également les secondes restantes de la transition si Pause est pressé à 00:00.
    if(workout.transitionActive){
      workout.transitionRemainingMs=Math.max(0,workout.transitionDeadline-Date.now());
      workout.transitionDeadline=0;
    }
    workout.remainingMs=leftMs();workout.elapsedMs=activeElapsed();workout.activeSince=0;workout.deadline=0;workout.paused=true;
    releaseAwake();stopTicker();quiet();storeDraft();
    if(state.view==='muscu-session-player')showPlayer();
  }
  function resume(){
    if(!workout||!workout.paused)return;
    workout.paused=false;workout.activeSince=Date.now();
    if(phaseTime())workout.deadline=Date.now()+workout.remainingMs;
    if(workout.transitionActive)workout.transitionDeadline=Date.now()+Math.max(0,workout.transitionRemainingMs||0);
    lastAudioPhase=null;lastAudioSecond=null;
    sounds()?.unlock();
    keepAwake();storeDraft();showPlayer();
  }
  function finish(){
    if(!workout)return;
    workout.elapsedMs=activeElapsed();
    const snapshot=copy(workout);
    snapshot.paused=true;snapshot.deadline=0;snapshot.activeSince=0;snapshot.remainingMs=leftMs();
    const totals=snapshot.session.mode==='circuit'
      ?snapshot.session.exerciseKeys.length*safeInt(snapshot.session.rounds,1,30,4)
      :snapshot.session.exerciseKeys.reduce((acc,key)=>acc+safeInt(snapshot.session.overrides?.[key]?.series??snapshot.session.series,1,20,3),0);
    finished={...snapshot,endedAt:new Date().toISOString(),totalPlanned:totals,complete:snapshot.session.mode==='circuit'?snapshot.completedEfforts>=totals:snapshot.completedSets>=totals};
    workout=null;stopTicker();releaseAwake();quiet();
    if(finished.complete)cue('finish');
    removeDraft();go('muscu-session-result');
  }
  function cancel(){
    if(!workout)return go('muscu-sessions');
    if(!confirm('Abandonner cette séance sans l’enregistrer ?'))return;
    workout=null;stopTicker();releaseAwake();quiet();removeDraft();go('muscu-sessions');
  }
  function advance(){
    if(!workout||workout.paused)return;
    const s=workout.session;
    const n=workout.exercises.length;
    if(workout.phase==='effort'){
      workout.completedEfforts++;
      if(workout.idx+1<n){
        applyPhase('rest-exercise',safeInt(s.betweenExercises,0,600,15));
      }else if(workout.round<safeInt(s.rounds,1,30,4)){
        applyPhase('rest-round',safeInt(s.roundRest,0,1800,60));
      }else{finish();}
    }else if(workout.phase==='rest-exercise'){
      workout.idx++;
      workout.setIndex=1;
      applyPhase(s.mode==='circuit'?'effort':'set',s.mode==='circuit'?safeInt(s.effort,5,3600,50):0);
    }else if(workout.phase==='rest-round'){
      workout.round++;workout.idx=0;workout.setIndex=1;
      applyPhase('effort',safeInt(s.effort,5,3600,50));
    }else if(workout.phase==='rest-series'){
      workout.setIndex++;
      applyPhase('set',0);
    }
  }
  function setCompleted(){
    if(!workout||workout.paused||workout.phase!=='set')return;
    workout.completedSets++;
    const ex=countSet(workout.idx);
    if(workout.setIndex<ex.sets){
      applyPhase('rest-series',ex.rest);
    }else if(workout.idx+1<workout.exercises.length){
      applyPhase('rest-exercise',safeInt(workout.session.classicBetweenExercises,0,1800,60));
    }else{finish();}
  }
  function skip(){
    if(!workout||workout.paused)return;
    // L'utilisateur peut passer immédiatement la transition sans compter l'effort comme 'ignoré'.
    if(workout.transitionActive){workout.transitionActive=false;workout.transitionDeadline=0;workout.transitionRemainingMs=0;advance();return;}
    if(workout.phase==='effort'){
      if(!confirm('Passer cet effort et aller à la récupération ?'))return;
      workout.skippedEfforts++;
      const s=workout.session;
      if(workout.idx+1<workout.exercises.length)applyPhase('rest-exercise',safeInt(s.betweenExercises,0,600,15));
      else if(workout.round<safeInt(s.rounds,1,30,4))applyPhase('rest-round',safeInt(s.roundRest,0,1800,60));
      else finish();
    }else if(workout.phase==='set'){
      if(!confirm('Passer cette série sans la valider ?'))return;
      const ex=countSet(workout.idx);
      if(workout.setIndex<ex.sets)applyPhase('rest-series',ex.rest);
      else if(workout.idx+1<workout.exercises.length)applyPhase('rest-exercise',safeInt(workout.session.classicBetweenExercises,0,1800,60));
      else finish();
    }else advance();
  }
  function tick(){
    if(!workout||workout.paused||state.view!=='muscu-session-player')return;
    if(phaseTime()){
      const left=leftMs();
      if(workout.session.mode==='circuit' && workout.transitionActive){
        // L'écran précédent reste visible à 00:00 pendant deux secondes réelles.
        // Le chronomètre suivant ne démarre qu'après cette transition.
        if(Date.now()>=workout.transitionDeadline){
          workout.transitionActive=false;workout.transitionDeadline=0;workout.transitionRemainingMs=0;
          advance();return;
        }
        const label=get('[data-mp1-remaining]');if(label)label.textContent='00:00';
        const dial=get('.mp1-dial');if(dial)dial.style.setProperty('--p','0%');
      }else if(left<=0){
        if(workout.session.mode==='circuit'){
          workout.transitionActive=true;
          workout.transitionRemainingMs=CIRCUIT_TRANSITION_MS;
          workout.transitionDeadline=Date.now()+CIRCUIT_TRANSITION_MS;
          storeDraft();
          showPlayer(); // même écran, chronomètre à 00:00 ; sons et image inchangés.
          return;
        }
        advance();return;
      }else{
        countdownSound(left);
        const label=get('[data-mp1-remaining]');if(label)label.textContent=clock(left);
        const dial=get('.mp1-dial');if(dial){const pct=workout.phaseTotalMs>0?Math.max(0,Math.min(100,left/workout.phaseTotalMs*100)):0;dial.style.setProperty('--p',pct+'%');}
      }
    }
    const elapsedLabel=get('[data-mp1-elapsed]');if(elapsedLabel)elapsedLabel.textContent=duration(activeElapsed());
  }
  function go(v){state.view=v;state.selected=null;render();window.scrollTo?.({top:0,behavior:'instant'});}
  function img(x,cls){const p=getPhoto(x);return p?`<img class="${cls}" src="${esc(p)}" alt="${esc(x.title)}" decoding="async" onerror="this.style.opacity=.25">`:`<div class="${cls} mp1-image-empty">Illustration indisponible</div>`;}
  function header(){
    // Bandeau conforme aux trois maquettes approuvées : noir, orange, haltère.
    return `<header class="mp1-top mp2-top">
      <button class="mp1-back" id="mp1Back" type="button" aria-label="Quitter cette séance">‹</button>
      <span class="mp1-brand"><span class="mp2-brand-icon" aria-hidden="true"><svg viewBox="0 0 52 30" width="30" height="25"><g fill="#ff8700"><rect x="22" y="13" width="8" height="4" rx="2"/><rect x="13" y="7" width="7" height="16" rx="2"/><rect x="7" y="4" width="5" height="22" rx="2"/><rect x="32" y="7" width="7" height="16" rx="2"/><rect x="40" y="4" width="5" height="22" rx="2"/></g></svg></span> MUSCULATION</span>
      <button class="mp1-sound-settings" type="button" id="mp1SoundSettings" aria-label="Régler les effets sonores" title="Réglages sonores">🔊</button>
      <button class="mp1-end-small" type="button" id="mp1EndTop" aria-label="Terminer la séance">✕</button>
    </header><div class="mp1-session-title mp2-session-title">
      <strong>Séance : ${esc(workout.session.name)}</strong>
    </div>`;
  }
  function footer(){
    const rest=workout.phase.startsWith('rest-');
    return `<footer class="mp1-toolbar ${rest?'mp2-toolbar-rest':''}">
      <button class="mp1-action-outline" id="mp1Pause" type="button">${workout.paused?'▶ Reprendre':'Ⅱ Pause'}</button>
      <button class="mp1-action-outline" id="mp1Skip" type="button" ${workout.paused?'disabled':''}>${rest?'⏭ Passer la pause':'⏭ Suivant'}</button>
      <button class="mp1-action-stop" id="mp1Finish" type="button">✓ Terminer</button>
    </footer>`;
  }
  function progress(){
    const circuit=workout.session.mode==='circuit';
    const count=workout.exercises.length;
    const total=circuit?count:workout.session.exerciseKeys.reduce((sum,k)=>sum+safeInt(workout.session.overrides?.[k]?.series??workout.session.series,1,20,3),0);
    const done=circuit?workout.idx+1:workout.completedSets;
    const percent=total?Math.max(0,Math.min(100,done/total*100)):0;
    return `<div class="mp1-progress-caption"><span>${circuit?'Progression du tour':'Progression des séries'}</span><b>${done} / ${total}</b></div>
      <div class="mp1-progress-track"><span style="width:${percent}%"></span></div>`;
  }
  function clockPanel(seconds,label,rest=false){
    const ms=phaseTime()?leftMs():seconds*1000;
    const pct=workout.phaseTotalMs>0?Math.max(0,Math.min(100,ms/workout.phaseTotalMs*100)):100;
    return `<div class="mp1-dial ${rest?'mp1-dial-rest':''}" style="--p:${pct}%" role="timer"><div class="mp1-dial-inside"><span>${esc(label)}</span><strong data-mp1-remaining>${clock(ms)}</strong></div></div>`;
  }
  function upcoming(exIndex){
    const x=workout.exercises[exIndex];if(!x)return '';
    return `<div class="mp1-next"><h3>Prochain exercice</h3>
      <div class="mp1-next-card">${img(x,'mp1-next-image')}<div><strong>${esc(x.title)}</strong><small>${esc(x.groupLabel)}</small></div></div></div>`;
  }
  function renderPhase(){
    if(!workout)return '';
    const w=workout,s=w.session,n=w.exercises.length;
    const x=w.exercises[w.idx];
    const common=`<div class="mp1-head-stats">
      <div><span><em>⟳</em> ${s.mode==='circuit'?'Tour':'Série'}</span><b>${s.mode==='circuit'?`${w.round} / ${s.rounds}`:`${w.setIndex} / ${countSet(w.idx).sets}`}</b></div>
      <div><span><em>▰</em> Exercice</span><b>${w.idx+1} / ${n}</b></div>
      <div><span><em>◴</em> Séance</span><b data-mp1-elapsed>${duration(activeElapsed()).slice(0,8)}</b></div>
    </div>`;
    if(w.phase==='rest-round'){
      return `${common}<div class="mp1-round-heading"><span class="mp1-round-icon">↻</span> Fin du tour ${w.round}</div>
        <div class="mp1-round-sub">Récupération avant le tour suivant</div>
        <div class="mp1-drink-photo"><img src="./muscu-hydratation-validee-v2.webp" alt="Sportif qui boit de l'eau pendant la récupération"></div>
        <div class="mp1-round-dial">${clockPanel(0,'Prochain tour',true)}</div>
        <div class="mp1-round-next"><strong>Tour suivant : ${w.round+1} / ${s.rounds}</strong></div>
        <div class="mp1-round-dots">${Array.from({length:safeInt(s.rounds,1,30,4)},(_,i)=>`<span class="${i<w.round?'done':i===w.round?'next':''}">${i<w.round?'✓':i+1}</span>`).join('')}</div>`;
    }
    if(w.phase.startsWith('rest-')){
      const setRest=w.phase==='rest-series';
      // Affichage seul : photo d'hydratation identique au Circuit Training,
      // uniquement pendant la pause entre exercices en Musculation classique.
      // La pause entre séries et toutes les durées restent inchangées.
      const classicExerciseRest=w.phase==='rest-exercise' && s.mode==='classic';
      return `${common}<div class="mp1-recovery-title"><h2>Récupération</h2><p>${setRest?'Pause avant la série suivante':'Prochain exercice'}</p></div>
        ${classicExerciseRest?`<div class="mp1-drink-photo"><img src="./muscu-hydratation-validee-v2.webp" alt="Sportif qui boit de l'eau pendant la récupération"></div>`:''}
        <div class="${classicExerciseRest?'mp1-round-dial':'mp1-rest-center'}">${clockPanel(0,classicExerciseRest?'Prochain exercice':'Pause',true)}</div>
        ${setRest?`<div class="mp1-next"><h3>Prochaine série</h3><div class="mp1-next-card">${img(x,'mp1-next-image')}<div><strong>${esc(x.title)}</strong><small>Série ${w.setIndex+1} / ${countSet(w.idx).sets} · ${countSet(w.idx).reps} répétitions</small></div></div></div>`:upcoming(w.idx+1)}
        ${progress()}`;
    }
    const circuit=w.phase==='effort';
    return `${common}<div class="mp1-exercise-head"><h2>${esc(x.title)}</h2><small>${esc(x.groupLabel)}</small></div>
      <div class="mp2-exercise-stage">
        <div class="mp1-hero-img">${img(x,'mp1-exercise-image')}</div>
        ${circuit?`<div class="mp2-effort-overlay">
          <div class="mp2-mini-stat"><span>▰</span><strong>${s.effort} s</strong><small>d'effort</small></div>
          ${clockPanel(s.effort,'Effort')}
          <div class="mp2-mini-stat"><span>◴</span><strong>${s.betweenExercises} s</strong><small>de repos</small></div>
        </div>`:''}
      </div>
      ${!circuit?`<div class="mp1-classic"><span>Série ${w.setIndex} / ${countSet(w.idx).sets}</span>
          <strong>${countSet(w.idx).reps} répétitions</strong>
          <p>Réalise tes répétitions à ton rythme.</p>
          <button id="mp1SetComplete" type="button" ${w.paused?'disabled':''}>✓ Série terminée</button>
          <small>${w.setIndex<countSet(w.idx).sets?'Puis récupération automatique : '+countSet(w.idx).rest+' s':'Puis pause avant l’exercice suivant'}</small></div>`:''}
      ${progress()}`;
  }
  function showPlayer(){
    if(!workout){go('muscu-sessions');return;}
    document.body.classList.remove('mcs1-active');document.body.classList.add('mp1-active');bottomNav.classList.add('hidden');
    main.innerHTML=`<section class="mp1-screen" aria-label="Séance de musculation en cours">${header()}<div class="mp1-main">${workout.paused?'<div class="mp1-paused-banner">⏸ Séance en pause — appuie sur Reprendre.</div>':''}
       ${renderPhase()}${footer()}</div></section>`;
    get('#mp1Back')?.addEventListener('click',cancel);
    get('#mp1EndTop')?.addEventListener('click',()=>{if(confirm('Terminer maintenant et afficher le bilan de la séance ?'))finish();});
    get('#mp1Finish')?.addEventListener('click',()=>{if(confirm('Terminer maintenant et afficher le bilan de la séance ?'))finish();});
    get('#mp1Pause')?.addEventListener('click',()=>workout.paused?resume():pause());
    get('#mp1Skip')?.addEventListener('click',skip);
    get('#mp1SetComplete')?.addEventListener('click',setCompleted);
    get('#mp1SoundSettings')?.addEventListener('click',()=>{sounds()?.unlock();sounds()?.openSettings();});
    if(!workout.paused)startTicker();else stopTicker();
  }
  function showResult(){
    if(!finished){go('muscu-sessions');return;}
    document.body.classList.remove('mcs1-active');document.body.classList.add('mp1-active');bottomNav.classList.add('hidden');
    const c=finished.session.mode==='circuit',n=finished.exercises.length;
    const completed=c?finished.completedEfforts:finished.completedSets;
    main.innerHTML=`<section class="mp1-screen"><header class="mp1-top"><button class="mp1-back" id="mp1ResultBack" type="button">‹</button><span class="mp1-brand">🏋 MUSCULATION</span></header><div class="mp1-main">
      <div class="mp1-finish-symbol">✓</div><h1 class="mp1-finish-title">Fin de la séance</h1><p class="mp1-finish-sub">${esc(finished.session.name)}</p>
      <div class="mp1-result-stats"><div><span>Durée totale</span><strong>${duration(finished.elapsedMs)}</strong></div><div><span>Exercices</span><strong>${n}</strong></div><div><span>${c?'Efforts réalisés':'Séries validées'}</span><strong>${completed} / ${finished.totalPlanned}</strong></div></div>
      <p class="mp1-result-note">${finished.complete?'Séance terminée : bravo pour ton entraînement !':'Séance interrompue : tu peux enregistrer ce bilan partiel.'}</p>
      <button class="mp1-save" type="button" id="mp1ResultSave">✓ Enregistrer la séance</button>
      <button class="mp1-secondary" type="button" id="mp1ResultCancel">Ne pas enregistrer</button>
      <p class="mp1-result-note">L’historique est enregistré localement sur cet appareil. Aucun suivi GPS ni donnée de calories n’est inventé.</p>
    </div></section>`;
    get('#mp1ResultBack')?.addEventListener('click',()=>go('muscu-sessions'));
    get('#mp1ResultSave')?.addEventListener('click',()=>{
      const rows=read(HISTORY,[]);const history=Array.isArray(rows)?rows:[];
      const entry={id:'entrainement-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),
        type:'musculation',sessionId:finished.session.id,sessionName:finished.session.name,
        mode:finished.session.mode,startedAt:finished.startedAt,endedAt:finished.endedAt,durationSeconds:Math.floor(finished.elapsedMs/1000),
        exercises:finished.exercises.map(x=>({title:x.title,groupLabel:x.groupLabel,key:x.key})),
        planned:finished.totalPlanned,completed:finished.session.mode==='circuit'?finished.completedEfforts:finished.completedSets,
        completedFully:finished.complete,rounds:finished.session.mode==='circuit'?finished.session.rounds:null};
      history.unshift(entry);
      if(!write(HISTORY,history)){alert('Sauvegarde impossible sur cet appareil. Vérifie l’espace disponible.');return;}
      finished=null;go('muscu-session-history');
    });
    get('#mp1ResultCancel')?.addEventListener('click',()=>{if(confirm('Quitter sans enregistrer le bilan ?')){finished=null;go('muscu-sessions');}});
  }
  function showHistory(){
    document.body.classList.remove('mcs1-active');document.body.classList.add('mp1-active');bottomNav.classList.add('hidden');
    const rows=read(HISTORY,[]);const items=Array.isArray(rows)?rows:[];
    const filtered=items.filter(x=>{if(historyPeriod==='all')return true;const from=new Date(x.startedAt).getTime();const limit=historyPeriod==='week'?7:historyPeriod==='month'?30:365;return from>=Date.now()-limit*86400000;});
    main.innerHTML=`<section class="mp1-screen"><header class="mp1-top"><button class="mp1-back" id="mp1HistoryBack" type="button">‹</button><span class="mp1-brand">🏋 MUSCULATION</span></header><div class="mp1-main"><h1 class="mp1-page-title">Historique des séances</h1>
      <p class="mp1-result-note">Séances enregistrées sur cet appareil.</p><div class="mp1-history-filters">${[['all','Tout'],['week','7 jours'],['month','30 jours'],['year','1 an']].map(([key,label])=>`<button type="button" data-mp1-filter="${key}" class="${key===historyPeriod?'active':''}">${label}</button>`).join('')}</div>
      ${filtered.length?filtered.map(x=>`<article class="mp1-history-card"><div><strong>${esc(x.sessionName)}</strong><small>${esc(new Date(x.startedAt).toLocaleDateString('fr-FR'))} · ${x.mode==='circuit'?'Circuit':'Classique'}</small><small>${duration(x.durationSeconds*1000)} · ${x.completed} / ${x.planned} ${x.mode==='circuit'?'efforts':'séries'}</small></div><button type="button" data-mp1-delete="${esc(x.id)}" aria-label="Supprimer cette séance de l’historique">×</button></article>`).join(''):'<div class="mp1-history-empty">Aucune séance enregistrée sur cette période.</div>'}
      <button class="mp1-secondary" type="button" id="mp1ReturnSessions">Retour à Mes séances</button>
      </div></section>`;
    get('#mp1HistoryBack')?.addEventListener('click',()=>go('muscu-sessions'));
    get('#mp1ReturnSessions')?.addEventListener('click',()=>go('muscu-sessions'));
    main.querySelectorAll('[data-mp1-filter]').forEach(b=>b.addEventListener('click',()=>{historyPeriod=b.dataset.mp1Filter;showHistory();}));
    main.querySelectorAll('[data-mp1-delete]').forEach(b=>b.addEventListener('click',()=>{if(!confirm('Supprimer définitivement cette entrée de l’historique ?'))return;write(HISTORY,items.filter(x=>x.id!==b.dataset.mp1Delete));showHistory();}));
  }
  const oldRender=render;
  render=function(){
    const view=state.view;
    if(view==='muscu-session-player'){updateShell();return showPlayer();}
    if(view==='muscu-session-result'){updateShell();return showResult();}
    if(view==='muscu-session-history'){updateShell();return showHistory();}
    document.body.classList.remove('mp1-active');
    const result=oldRender.apply(this,arguments);
    // Ajouter le lancement SANS remplacer le module de création existant.
    if(view==='muscu-session-detail'){
      const row=main.querySelector('.mcs-actions');
      if(row&&!get('#mp1Start')){
        const btn=document.createElement('button');btn.id='mp1Start';btn.type='button';btn.className='mp1-save';btn.textContent='▶ Démarrer cette séance';
        row.insertBefore(btn,row.firstChild);
        const prefs=document.createElement('button');prefs.type='button';prefs.id='mp1SoundPreferences';
        prefs.className='mp1-sound-detail-link';prefs.textContent='🔊 Réglages sonores';
        row.appendChild(prefs);prefs.addEventListener('click',()=>sounds()?.openSettings());
        btn.addEventListener('click',()=>{
          const id=state.mcsSessionId;
          const session=sourceSessions().find(x=>x.id===id);
          if(!session)return alert('Séance introuvable. Réouvre Mes séances.');
          start(session);
        });
      }
    }
    if(view==='muscu-sessions'){
      const section=main.querySelector('.mcs-saved-list');
      if(section&&!get('#mp1HistoryLink')){
        const b=document.createElement('button');b.id='mp1HistoryLink';b.className='mp1-history-link';b.type='button';b.textContent='▤ Historique des séances';
        section.appendChild(b);b.addEventListener('click',()=>go('muscu-session-history'));
      }
    }
    return result;
  };
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'&&workout&&!workout.paused)pause();
  });
  window.addEventListener('pagehide',()=>{quiet();if(workout&&!workout.paused)pause();else if(workout)storeDraft();stopTicker();});
})();
