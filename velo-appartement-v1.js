/* VÉLO D'APPARTEMENT V1 — compteur virtuel réglable, suivi sans GPS.
   Module isolé, chargé APRES Marche, Vélo, Course et VTT.
   Aucune modification des algorithmes ou données GPS. 11 novembre 2026. */
(function(){
  'use strict';
  const HISTORY_KEY='mb_activites_sportives_v1';
  const DRAFT_KEY='mb_velo_appartement_brouillon_v1';
  const FINISHED_KEY='mb_velo_appartement_terminee_v1';
  const VIEW='velo-appartement-v1';
  const SUMMARY='velo-appartement-v1-summary';
  const DETAILS='velo-appartement-v1-detail';
  let activity=null, finished=null, tick=null, lastDraftTime=0, selectedId=null;
  let answer=null;
  const $=s=>main.querySelector(s);
  const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(key,def)=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):def;}catch(_){return def;}};
  const write=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val));return true;}catch(_){return false;}};
  const remove=key=>{try{localStorage.removeItem(key);}catch(_){}};
  const sessions=()=>{const arr=read(HISTORY_KEY,[]);return Array.isArray(arr)?arr:[];};
  const isValid=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
  const round=(x,n=2)=>Number(x.toFixed(n));
  const fmtKm=n=>Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtSpeed=n=>Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:2});
  const duration=ms=>{const s=Math.max(0,Math.floor(ms/1000));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join(':');};
  const elapsed=()=>!activity?0:Math.max(0,Number(activity.accumulatedMs)||0)+(activity.status==='running'?Math.max(0,Date.now()-activity.since):0);
  const distance=(ms,speed)=>(Math.max(0,ms)/3600000)*Number(speed||0);
  const speedFrom=(km,ms)=>ms>0?km/(ms/3600000):0;
  const dateText=iso=>{const d=new Date(iso);return Number.isNaN(d.getTime())?'Date inconnue':d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});};

  function setShell(){
    document.body.classList.add('as1-active','vi1-active');
    bottomNav.classList.add('hidden');
  }
  function footer(current='sport'){
    return `<nav class="vi1-footer" aria-label="Navigation sportive">
      <button type="button" data-vi-nav="hub"><span class="vi1-footer-icon">⌂</span>Accueil</button>
      <button type="button" data-vi-nav="autre-sport-home" class="${current==='sport'?'is-current':''}"><span class="vi1-footer-icon">▦</span>Autre sport</button>
      <button type="button" data-vi-nav="marche-v1-history" class="${current==='history'?'is-current':''}"><span class="vi1-footer-icon">◴</span>Historique</button>
    </nav>`;
  }
  function navigate(view){
    if(activity?.status==='running' && view!==VIEW){
      if(!confirm('La séance est en cours. La mettre en pause et quitter ?'))return;
      pause();
    }
    if(state.view===SUMMARY && view!==SUMMARY && finished){
      if(!confirm('Cette séance n’est pas encore enregistrée. Quitter sans la sauvegarder ?'))return;
      finished=null;answer=null;remove(FINISHED_KEY);
    }
    state.view=view;state.selected=null;
    render();window.scrollTo?.(0,0);
  }
  function bindFooter(){main.querySelectorAll('[data-vi-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.viNav)));}
  function persistDraft(){
    if(!activity||!['running','paused'].includes(activity.status))return;
    write(DRAFT_KEY,{...activity,status:'paused',accumulatedMs:elapsed(),since:null});
  }
  function restore(){
    if(activity||finished)return;
    const f=read(FINISHED_KEY,null);
    if(f && f.endedAt && isValid(Number(f.refSpeed),1,70)){
      finished=f;return;
    }
    const d=read(DRAFT_KEY,null);
    if(d && d.startedAt && ['running','paused'].includes(d.status) && isValid(Number(d.refSpeed),1,70)){
      activity={...d,status:'paused',since:null,accumulatedMs:Math.max(0,Number(d.accumulatedMs)||0)};
    }
  }
  function stopTick(){if(tick!==null){clearInterval(tick);tick=null;}}
  function begin(){
    if(activity?.status==='running')return;
    if(!activity || activity.status==='finished'){
      const raw=$('#vi1SpeedInput')?.value.trim().replace(',','.');
      const refSpeed=Number(raw);
      if(raw===''||!isValid(refSpeed,1,70)){
        alert('Indique une vitesse de référence entre 1 et 70 km/h.');return;
      }
      activity={status:'paused',startedAt:new Date().toISOString(),accumulatedMs:0,since:null,refSpeed};
      remove(FINISHED_KEY);
    }
    activity.status='running';activity.since=Date.now();
    window.SportScreenAwake?.start();
    if(tick===null)tick=setInterval(()=>{
      refresh();
      if(Date.now()-lastDraftTime>3000){persistDraft();lastDraftTime=Date.now();}
    },250);
    refresh();
  }
  function pause(){
    if(activity?.status!=='running')return;
    activity.accumulatedMs=elapsed();activity.since=null;activity.status='paused';
    stopTick();window.SportScreenAwake?.stop();persistDraft();refresh();
  }
  function finish(){
    if(!activity||!['running','paused'].includes(activity.status))return;
    if(activity.status==='running')activity.accumulatedMs=elapsed();
    activity.status='finished';activity.since=null;activity.endedAt=new Date().toISOString();
    stopTick();window.SportScreenAwake?.stop();remove(DRAFT_KEY);
    finished={...activity};answer=null;
    write(FINISHED_KEY,finished);
    state.view=SUMMARY;render();window.scrollTo?.(0,0);
  }
  function reset(){
    if(activity&&elapsed()>0&&!confirm('Effacer cette séance de vélo d’appartement ?'))return;
    stopTick();window.SportScreenAwake?.stop();
    activity=null;finished=null;answer=null;
    remove(DRAFT_KEY);remove(FINISHED_KEY);
    state.view=VIEW;render();
  }
  function showActivity(){
    setShell();restore();
    if(finished){state.view=SUMMARY;showSummary();return;}
    const speed=activity?.refSpeed??27;
    main.innerHTML=`<section class="vi1-screen" aria-label="Vélo d’appartement — séance sans GPS">
      <header class="vi1-hero">
        <button type="button" class="vi1-back" id="vi1Back" aria-label="Retour aux activités">←</button>
        <div class="vi1-hero-label"><div class="vi1-bike-icon" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="white" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 56h50M16 19h19M32 19l-5 23M48 15l-13 5-6 22M48 15h10m-10 0-2-5"/><circle cx="29" cy="42" r="12"/><circle cx="29" cy="42" r="3"/><path d="m29 42 9 7m-9-7-7-8"/></svg></div><div>
          <h1>Vélo<br>d’appartement</h1><p>Suivi en intérieur · sans GPS</p>
        </div></div>
      </header>
      <div class="vi1-main">
        <section class="vi1-metrics" aria-label="Mesures en temps réel">
          <div class="vi1-metric"><div class="vi1-metric-icon" aria-hidden="true">⌖</div><div><span>Distance estimée</span><strong id="vi1Distance">0,00 km</strong></div></div>
          <div class="vi1-metric"><div class="vi1-metric-icon" aria-hidden="true">◷</div><div><span>Durée active</span><strong id="vi1Duration">00:00:00</strong></div></div>
          <div class="vi1-metric"><div class="vi1-metric-icon" aria-hidden="true">◴</div><div><span>Vitesse de référence</span><strong id="vi1Speed">27 km/h</strong></div></div>
          <div class="vi1-metric"><div class="vi1-metric-icon" aria-hidden="true">♨</div><div><span>Calories</span><strong>— kcal</strong></div></div>
        </section>
        <section class="vi1-setting">
          <label for="vi1SpeedInput">Vitesse de référence (km/h)</label>
          <div class="vi1-setting-line"><input id="vi1SpeedInput" type="number" inputmode="decimal" min="1" max="70" step="0.5" value="${safe(speed)}" ${activity?'disabled':''}>
          <span id="vi1SettingNote">${activity?'Vitesse fixée pour cette séance.':'27 km/h par défaut · modifiable avant de démarrer.'}</span></div>
        </section>
        <div class="vi1-info"><span aria-hidden="true">ⓘ</span><p>Le compteur avance automatiquement avec le temps, selon la vitesse choisie. Tu pourras corriger la distance à la fin.</p></div>
        <div class="vi1-controls">
          <button type="button" id="vi1Start" class="vi1-button vi1-primary">▶ <span>Démarrer</span></button>
          <div class="vi1-buttons-row"><button type="button" id="vi1Pause" class="vi1-button vi1-secondary">Ⅱ Pause</button><button type="button" id="vi1Finish" class="vi1-button vi1-secondary">■ Terminer</button></div>
        </div>
        <section class="vi1-explain"><strong>Suivi de la séance</strong><p>Pas de GPS nécessaire pour cette activité. Les kilomètres affichés sont une <b>estimation</b>, et non une mesure de ton vélo.</p>
          <button type="button" id="vi1Reset" class="vi1-reset">↻ Réinitialiser la séance</button>
        </section>
      </div>${footer()}</section>`;
    $('#vi1Back').addEventListener('click',()=>navigate('autre-sport-choice'));
    $('#vi1SpeedInput').addEventListener('input',refresh);
    $('#vi1Start').addEventListener('click',begin);
    $('#vi1Pause').addEventListener('click',pause);
    $('#vi1Finish').addEventListener('click',finish);
    $('#vi1Reset').addEventListener('click',reset);
    bindFooter();refresh();
  }
  function refresh(){
    const dist=$('#vi1Distance');if(!dist)return;
    const ms=elapsed(),speed=activity?.refSpeed??(Number($('#vi1SpeedInput')?.value)||27);
    dist.textContent=fmtKm(distance(ms,speed))+' km';
    $('#vi1Duration').textContent=duration(ms);
    $('#vi1Speed').textContent=fmtSpeed(speed)+' km/h';
    const status=activity?.status??'idle';
    $('#vi1Start').disabled=status==='running';
    $('#vi1Start span').textContent=status==='paused'?'Reprendre':'Démarrer';
    $('#vi1Pause').disabled=status!=='running';
    $('#vi1Finish').disabled=!['running','paused'].includes(status);
  }
  function showSummary(){
    setShell();restore();
    if(!finished){state.view=VIEW;showActivity();return;}
    const ms=Number(finished.accumulatedMs)||0;
    const estimate=distance(ms,finished.refSpeed);
    main.innerHTML=`<section class="vi1-screen vi1-page" aria-label="Récapitulatif vélo d’appartement">
      <header class="vi1-page-header"><div class="vi1-page-title">Séance terminée</div><p>${safe(dateText(finished.startedAt))}</p></header>
      <div class="vi1-main">
        <section class="vi1-summary-card"><div class="vi1-check">✓</div><h2>Bravo pour ta séance !</h2>
          <div class="vi1-pair"><span>Durée active</span><strong>${duration(ms)}</strong></div>
          <div class="vi1-pair"><span>Vitesse de référence</span><strong>${fmtSpeed(finished.refSpeed)} km/h</strong></div>
          <div class="vi1-pair"><span>Distance estimée</span><strong>${fmtKm(estimate)} km</strong></div>
          <div class="vi1-question">Voulez-vous modifier la distance parcourue ?</div>
          <div class="vi1-choice" role="group" aria-label="Corriger la distance ?">
            <button type="button" id="vi1Keep" aria-pressed="false">Non, conserver</button>
            <button type="button" id="vi1Correct" aria-pressed="false">Oui, modifier</button>
          </div>
          <div id="vi1CorrectArea" class="vi1-correct-area" hidden>
            <label for="vi1KmInput">Distance affichée par ton vélo (km)</label>
            <input id="vi1KmInput" type="number" inputmode="decimal" min="0" max="500" step="0.01" value="${estimate.toFixed(2)}">
            <p>La vitesse moyenne sera recalculée automatiquement.</p>
          </div>
          <div class="vi1-pair"><span>Distance définitive</span><strong id="vi1FinalKm">—</strong></div>
          <div class="vi1-pair"><span>Vitesse moyenne finale</span><strong id="vi1FinalSpeed">—</strong></div>
          <label class="vi1-field">Calories affichées par le vélo (facultatif)
            <input id="vi1Calories" type="number" min="0" max="5000" inputmode="numeric" step="1" placeholder="Ex. 320"></label>
          <label class="vi1-field">Commentaire (facultatif)
            <textarea id="vi1Comment" rows="2" maxlength="500" placeholder="Ressenti, résistance, objectifs…"></textarea></label>
          <button type="button" id="vi1Save" class="vi1-button vi1-primary" disabled>Enregistrer la séance</button>
          <button type="button" id="vi1Discard" class="vi1-button vi1-quiet">Abandonner sans enregistrer</button>
          <p class="vi1-note">Sauvegarde uniquement sur cet appareil. La distance estimée sera identifiée comme telle dans l'historique.</p>
        </section>
      </div>${footer()}</section>`;
    const keep=$('#vi1Keep'),correct=$('#vi1Correct'),area=$('#vi1CorrectArea');
    const update=()=>{
      keep.setAttribute('aria-pressed',String(answer==='keep'));
      correct.setAttribute('aria-pressed',String(answer==='correct'));
      area.hidden=answer!=='correct';
      let km=answer==='keep'?estimate:answer==='correct'?Number($('#vi1KmInput').value.replace(',','.')):NaN;
      if(answer==='correct' && $('#vi1KmInput').value.trim()==='')km=NaN;
      const valid=Number.isFinite(km)&&km>=0&&km<=500;
      $('#vi1FinalKm').textContent=valid?fmtKm(km)+' km':'—';
      $('#vi1FinalSpeed').textContent=valid&&ms>0?fmtSpeed(speedFrom(km,ms))+' km/h':'—';
      $('#vi1Save').disabled=!valid||answer===null||ms<=0;
    };
    keep.addEventListener('click',()=>{answer='keep';update();});
    correct.addEventListener('click',()=>{answer='correct';update();$('#vi1KmInput').focus();});
    $('#vi1KmInput').addEventListener('input',update);
    $('#vi1Save').addEventListener('click',()=>{
      const raw=$('#vi1KmInput').value.trim().replace(',','.');
      const km=answer==='keep'?estimate:(raw===''?NaN:Number(raw));
      if(!['keep','correct'].includes(answer)||!isValid(km,0,500)||ms<=0){alert('Vérifie la distance finale.');return;}
      const caloriesRaw=$('#vi1Calories').value.trim();
      const calories=caloriesRaw===''?null:Number(caloriesRaw);
      if(calories!==null&&!isValid(calories,0,5000)){alert('Indique des calories valides, ou laisse le champ vide.');return;}
      const entry={
        id:'velo-interieur-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),
        type:'sport',category:'autre-sport',sport:'Vélo d’appartement',
        startedAt:finished.startedAt,endedAt:finished.endedAt,
        durationSeconds:Math.max(0,Math.floor(ms/1000)),
        distanceKm:round(km,2),distanceSource:answer==='keep'?'estime':'manuel',
        averageSpeedKmh:round(speedFrom(km,ms),2),referenceSpeedKmh:finished.refSpeed,
        caloriesKcal:calories===null?null:Math.round(calories),
        comment:$('#vi1Comment').value.trim(),route:[],createdAt:new Date().toISOString()
      };
      const entries=sessions();entries.unshift(entry);
      if(!write(HISTORY_KEY,entries)){
        alert('La sauvegarde a échoué. Vérifie l’espace disponible sur ce téléphone.');return;
      }
      activity=null;finished=null;answer=null;remove(DRAFT_KEY);remove(FINISHED_KEY);
      state.view='marche-v1-history';render();window.scrollTo?.(0,0);
    });
    $('#vi1Discard').addEventListener('click',()=>{
      if(!confirm('Abandonner définitivement cette séance sans l’enregistrer ?'))return;
      activity=null;finished=null;answer=null;remove(DRAFT_KEY);remove(FINISHED_KEY);
      state.view='autre-sport-choice';render();
    });
    bindFooter();update();
  }
  function showDetails(){
    setShell();
    const item=sessions().find(s=>String(s.id)===String(selectedId)&&s.sport==='Vélo d’appartement');
    if(!item){state.view='marche-v1-history';render();return;}
    main.innerHTML=`<section class="vi1-screen vi1-page" aria-label="Détail de la séance vélo d’appartement">
      <header class="vi1-page-header"><button type="button" class="vi1-back" id="vi1DetailBack" aria-label="Retour à l'historique">←</button>
        <div class="vi1-page-title">Vélo d’appartement</div><p>${safe(dateText(item.startedAt))}</p>
      </header><div class="vi1-main"><section class="vi1-summary-card">
        <h2>Récapitulatif de la séance</h2>
        <div class="vi1-pair"><span>Durée</span><strong>${duration((Number(item.durationSeconds)||0)*1000)}</strong></div>
        <div class="vi1-pair"><span>Distance</span><strong>${fmtKm(item.distanceKm)} km</strong></div>
        <div class="vi1-pair"><span>Vitesse moyenne</span><strong>${fmtSpeed(item.averageSpeedKmh)} km/h</strong></div>
        <div class="vi1-pair"><span>Référence initiale</span><strong>${fmtSpeed(item.referenceSpeedKmh)} km/h</strong></div>
        <div class="vi1-pair"><span>Mesure</span><strong>${item.distanceSource==='manuel'?'Distance corrigée':'Distance estimée'}</strong></div>
        <div class="vi1-pair"><span>Calories</span><strong>${item.caloriesKcal==null?'Non renseignées':safe(item.caloriesKcal)+' kcal'}</strong></div>
        ${item.comment?`<div class="vi1-comment"><strong>Commentaire</strong><p>${safe(item.comment)}</p></div>`:''}
        <p class="vi1-note">Activité réalisée en intérieur, sans GPS ni carte.</p>
        <button type="button" class="vi1-button vi1-secondary" id="vi1DetailReturn">← Retour à l’historique</button>
      </section></div>${footer('history')}</section>`;
    $('#vi1DetailBack').addEventListener('click',()=>navigate('marche-v1-history'));
    $('#vi1DetailReturn').addEventListener('click',()=>navigate('marche-v1-history'));
    bindFooter();
  }
  function enhanceHistory(){
    const list=$('.ml1-history-list');if(!list)return;
    const byId=new Map(sessions().map(s=>[String(s.id),s]));
    list.querySelectorAll('.ml1-history-row').forEach(row=>{
      const del=row.querySelector('[data-ml-delete]');if(!del)return;
      const item=byId.get(String(del.dataset.mlDelete));if(item?.sport!=='Vélo d’appartement')return;
      const small=row.querySelector('small');
      const label=item.distanceSource==='manuel'?'Distance corrigée':'Distance estimée';
      if(small && small.textContent!==label)small.textContent=label;
      if(row.querySelector('.vi1-history-open'))return;
      const open=document.createElement('button');open.type='button';open.className='vi1-history-open';
      open.textContent='Consulter la séance';
      open.addEventListener('click',()=>{selectedId=String(item.id);state.view=DETAILS;render();window.scrollTo?.(0,0);});
      row.appendChild(open);
    });
  }
  const previousRender=render;
  render=function(){
    if(state.view==='autre-sport-section'&&state.as1Section==='stationaryBike'){
      state.view=VIEW;
    }
    if([VIEW,SUMMARY,DETAILS].includes(state.view)){
      updateShell();
      if(state.view===VIEW)showActivity();
      else if(state.view===SUMMARY)showSummary();
      else showDetails();
      return;
    }
    document.body.classList.remove('vi1-active');
    const result=previousRender.apply(this,arguments);
    if(state.view==='marche-v1-history'||(state.view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    return result;
  };
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{
      if(state.view==='marche-v1-history'||(state.view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    }).observe(main,{subtree:true,childList:true});
  }
  window.addEventListener('pagehide',()=>{
    persistDraft();
    if(finished)write(FINISHED_KEY,finished);
    stopTick();window.SportScreenAwake?.stop();
  });
})();
