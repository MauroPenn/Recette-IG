/* MARCHE FONCTIONNELLE V1 — incrément isolé après Autre sport et Musculation.
   Mesure locale GPS (HTTPS requis), chrono, pause, saisie manuelle et historique local.
   Aucune donnée de localisation n'est envoyée vers un serveur. */
(function(){
  'use strict';
  const STORAGE='mb_activites_sportives_v1';
  const DRAFT='mb_marche_brouillon_v1';
  const savedStatus={gps:'GPS inactif',detail:'Le GPS sera demandé au démarrage.'};
  let current=null;
  let watchId=null;
  let ticker=null;
  let lastUiSaved=0;
  let finished=null;
  let historyFilter='all';
  const $$=s=>main.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const round=(v,places=2)=>Number(v.toFixed(places));
  const metersToKm=m=>(m/1000).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtDuration=ms=>{
    let x=Math.max(0,Math.floor(ms/1000));
    const h=Math.floor(x/3600);x%=3600;const m=Math.floor(x/60);const s=x%60;
    return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  };
  const elapsed=()=>!current?0:(current.accumulatedMs||0)+(current.status==='running'?Math.max(0,Date.now()-current.startedMs):0);
  const humanPace=(seconds,meters)=>{
    if(!meters||meters<25)return '—';
    const sec=seconds/(meters/1000);
    if(!isFinite(sec)||sec>36000)return '—';
    return `${Math.floor(sec/60)}′${String(Math.round(sec%60)).padStart(2,'0')}″/km`;
  };
  function safeRead(k, fallback){
    try { const v=localStorage.getItem(k);return v?JSON.parse(v):fallback; }
    catch(_){return fallback;}
  }
  function safeWrite(k, val){try{localStorage.setItem(k,JSON.stringify(val));return true;}catch(_){return false;}}
  function safeRemove(k){try{localStorage.removeItem(k);}catch(_){}}
  function sessions(){const a=safeRead(STORAGE,[]);return Array.isArray(a)?a:[];}
  function persistDraft(){
    if(!current || current.status==='finished' || current.status==='idle')return;
    const copy={...current,startedMs:null,lastAccepted:null};
    copy.accumulatedMs=elapsed();
    copy.status='paused';
    safeWrite(DRAFT,copy);
  }
  function restoreDraft(){
    if(current)return;
    const old=safeRead(DRAFT,null);
    if(old && ['paused','running'].includes(old.status) && old.startedISO){
      current={...old,status:'paused',startedMs:null,lastAccepted:null,gpsNote:'Séance restaurée en pause. Reprends pour relancer le GPS.',gpsStatus:'paused'};
    }
  }
  function stopGPS(){
    if(watchId!=null && navigator.geolocation){try{navigator.geolocation.clearWatch(watchId);}catch(_){}}
    watchId=null;
  }
  function stopTicker(){if(ticker!=null){clearInterval(ticker);ticker=null;}}
  function hdist(a,b){
    const R=6371000;const p1=a.lat*Math.PI/180,p2=b.lat*Math.PI/180;
    const dp=(b.lat-a.lat)*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180;
    const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
  }
  function onPosition(p){
    if(!current || current.status!=='running')return;
    const c=p.coords, accuracy=c.accuracy, t=p.timestamp||Date.now();
    if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude))return;
    if(!Number.isFinite(accuracy) || accuracy>35){
      current.gpsStatus='weak';current.gpsNote='Signal GPS imprécis : approche d’une zone dégagée ou corrige la distance à la fin.';
      refreshWalk();return;
    }
    const pos={lat:c.latitude,lon:c.longitude,t,accuracy:round(accuracy,1)};
    if(current.lastAccepted){
      const old=current.lastAccepted,d=hdist(old,pos),dt=(t-old.t)/1000;
      if(dt>45){
        // Long gap usually means screen locked or location suspended: do not invent a straight-line distance.
        current.lastAccepted=pos;
        current.gpsNote='GPS repris après une interruption. Vérifie la distance finale.';
        current.gpsStatus='ok';refreshWalk();return;
      }
      if(dt<=0)return;
      // Filter location jitter and implausible walking GPS jumps.
      const minDistance=Math.max(5,Math.min(14,(accuracy+old.accuracy)*0.35));
      if(d<minDistance)return;
      if(d/dt>4.7){current.gpsStatus='weak';current.gpsNote='Saut GPS écarté : mesure trop rapide pour une marche.';refreshWalk();return;}
      current.distanceMeters+=d;
    }
    current.lastAccepted=pos;
    current.gpsStatus='ok';
    current.gpsNote=`Précision GPS estimée : ±${Math.round(accuracy)} m. Distance indicative.`;
    current.route=current.route||[];
    current.route.push([round(pos.lat,6),round(pos.lon,6)]);
    if(current.route.length>800)current.route=current.route.filter((_,i)=>i%2===0);
    refreshWalk();
  }
  function onGeoError(err){
    if(!current || current.status!=='running')return;
    const code=err && err.code;
    current.gpsStatus='error';
    current.gpsNote=code===1?'Localisation refusée. Autorise-la dans le navigateur ou saisis les kilomètres manuellement.':code===2?'Position indisponible. Tu pourras saisir les kilomètres à la fin.':code===3?'Attente du GPS trop longue. Réessaie à ciel ouvert ou saisis la distance.':'GPS indisponible : distance manuelle possible.';
    refreshWalk();
  }
  function startGPS(){
    stopGPS();
    if(!navigator.geolocation || !window.isSecureContext){
      current.gpsStatus='error';current.gpsNote='GPS indisponible ici : utilise l’application en HTTPS ou saisis les kilomètres.';
      refreshWalk();return;
    }
    current.gpsStatus='search';current.gpsNote='Recherche de la position GPS…';
    try{watchId=navigator.geolocation.watchPosition(onPosition,onGeoError,{enableHighAccuracy:true,maximumAge:0,timeout:18000});}
    catch(_){current.gpsStatus='error';current.gpsNote='Impossible de démarrer le GPS. Saisie manuelle disponible.';}
    refreshWalk();
  }
  const keepScreen=()=>window.SportScreenAwake?.start();
  const allowSleep=()=>window.SportScreenAwake?.stop();
  function begin(){
    if(!current||current.status==='idle'||current.status==='finished'){
      current={status:'paused',startedISO:new Date().toISOString(),accumulatedMs:0,startedMs:null,distanceMeters:0,route:[],lastAccepted:null,gpsStatus:'paused',gpsNote:savedStatus.detail};
    }
    if(current.status==='running')return;
    current.status='running';current.startedMs=Date.now();current.lastAccepted=null;
    keepScreen(); // called directly from the Start/Resume button gesture
    if(!ticker)ticker=setInterval(()=>{
      refreshWalk();
      if(Date.now()-lastUiSaved>3000){persistDraft();lastUiSaved=Date.now();}
    },650);
    startGPS();
    refreshWalk();
  }
  function pause(){
    if(!current||current.status!=='running')return;
    current.accumulatedMs=elapsed();current.startedMs=null;current.status='paused';
    current.lastAccepted=null;current.gpsStatus='paused';current.gpsNote='Séance en pause. Reprends pour relancer le GPS.';
    allowSleep();stopGPS();stopTicker();persistDraft();refreshWalk();
  }
  function finish(){
    if(!current || !['running','paused'].includes(current.status))return;
    if(current.status==='running'){current.accumulatedMs=elapsed();current.startedMs=null;}
    current.status='finished';current.finishedISO=new Date().toISOString();
    allowSleep();stopGPS();stopTicker();safeRemove(DRAFT);
    finished={...current,distanceMeters:round(current.distanceMeters,1)};
    state.view='marche-v1-summary';render();
  }
  function reset(){
    if(current && elapsed()>0 && !confirm('Effacer la marche en cours ?'))return;
    allowSleep();stopGPS();stopTicker();safeRemove(DRAFT);current=null;finished=null;
    state.view='autre-sport-walk';render();
  }
  const icons={
    home:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
    sport:'<circle cx="14" cy="4" r="2"/><path d="m11 9-3 5-5 2m8-7 4 3 5 1m-9-4 2 6-3 6m3-6 5 6"/>',
    history:'<rect x="4" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="18" rx="1"/>',
    arrow:'<path d="m15 18-6-6 6-6"/>',
    walk:'<circle cx="13" cy="4" r="2"/><path d="m11 8 3 4-1 5m-2-9-3 5-3 2m9-3 5 2m-6 3-4 5m4-5 5 5"/>',
    gps:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
    gauge:'<path d="M4 17a9 9 0 1 1 16 0M12 17l4-7"/>',
    fire:'<path d="M12 22a8 8 0 0 0 8-8c0-4-3-7-4-8 0 3-2 4-3 5-1-4-3-6-4-8-1 5-5 8-5 12a8 8 0 0 0 8 7Z"/>',
    save:'<path d="M5 3h12l4 4v14H3V3h2Zm2 0v7h10V3M7 21v-8h10v8"/>',
    edit:'<path d="m4 20 4-.8L20 7l-3-3L5 16z"/>',
    plus:'<path d="M12 4v16M4 12h16"/>'
  };
  const svg=(n,cs='')=>`<svg class="ml1-svg ${cs}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[n]}</svg>`;
  function setActive(){
    document.body.classList.add('as1-active','ml1-active');
    document.body.classList.remove('mm1-active');
    bottomNav.classList.add('hidden');
  }
  function footer(active='sport'){
    return `<nav class="ml1-footer" aria-label="Navigation sportive">
    <button type="button" data-mlnav="hub">${svg('home')}<span>Accueil</span></button>
    <button type="button" data-mlnav="autre-sport-home" ${active==='sport'?'class="active"':''}>${svg('sport')}<span>Autre sport</span></button>
    <button type="button" data-mlnav="marche-v1-history" ${active==='history'?'class="active"':''}>${svg('history')}<span>Historique</span></button>
    </nav>`;
  }
  function go(view){
    if(finished && view!=='marche-v1-summary' && view!=='autre-sport-walk'){
      if(!confirm('Cette marche n’est pas encore enregistrée. Quitter sans sauvegarder ?'))return;
      finished=null;
    }
    if(current?.status==='running' && view!=='autre-sport-walk' && view!=='marche-v1-summary'){
      if(!confirm('La marche est en cours. La mettre en pause et quitter cet écran ?'))return;
      pause();
    }
    if(view!=='autre-sport-walk')allowSleep();
    state.view=view;
    if(view==='autre-sport-section')state.as1Section='history';
    render();
    window.scrollTo?.(0,0);
  }
  function attachFooter(){ main.querySelectorAll('[data-mlnav]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.mlnav))); }
  function showWalk(){
    setActive();restoreDraft();
    main.innerHTML=`<section class="ml1-screen" aria-label="Marche — suivi en temps réel">
      <header class="ml1-hero"><img src="./marche-paysage-v1.webp?v=1" alt="Paysage alpin avec un sentier de randonnée">
        <button type="button" class="ml1-back" id="ml1Back" aria-label="Retour à la liste des sports">${svg('arrow')}</button>
        <div class="ml1-hero-copy"><div class="ml1-sport-icon">${svg('walk')}</div><h1>Marche</h1><p>Suivi GPS et progression en temps réel.</p></div>
      </header>
      <div class="ml1-content">
        <section class="ml1-metrics" aria-label="Mesures de la marche">
          <div class="ml1-gps"><span class="ml1-gps-led" id="ml1GpsLed"></span><strong id="ml1GpsStatus">GPS inactif</strong></div>
          <div class="ml1-grid">
            <div class="ml1-metric">${svg('gps')}<div><span>Distance</span><strong id="ml1Distance">0,00 km</strong></div></div>
            <div class="ml1-metric">${svg('clock')}<div><span>Durée</span><strong id="ml1Duration">00:00:00</strong></div></div>
            <div class="ml1-metric">${svg('gauge')}<div><span>Allure moyenne</span><strong id="ml1Pace">—</strong></div></div>
            <div class="ml1-metric">${svg('fire')}<div><span>Calories</span><strong>— kcal</strong></div></div>
          </div>
          <p id="ml1GpsNote" class="ml1-note">Le GPS sera demandé au démarrage.</p>
          <p id="ml1ScreenNote" class="ml1-screen-note" role="status" aria-live="polite">Écran maintenu allumé pendant la marche si le téléphone l’autorise.</p>
        </section>
        <div class="ml1-actions">
          <button type="button" class="ml1-btn ml1-btn-primary" id="ml1Start">▶ <span>Démarrer</span></button>
          <div class="ml1-action-row">
            <button type="button" class="ml1-btn ml1-btn-secondary" id="ml1Pause">Ⅱ <span>Pause</span></button>
            <button type="button" class="ml1-btn ml1-btn-secondary" id="ml1Finish">■ <span>Terminer</span></button>
          </div>
        </div>
        <section class="ml1-info"><div>${svg('gps')} <strong>Progression de la séance</strong></div>
          <p>Le GPS calcule la distance lorsque le signal est suffisamment précis. L’écran restera allumé pendant la marche si le téléphone l’autorise. En arrière-plan, le suivi GPS peut s’interrompre.</p>
          <button type="button" class="ml1-link" id="ml1Reset">Réinitialiser la séance</button>
        </section>
      </div>${footer()}
    </section>`;
    $$('#ml1Back').addEventListener('click',()=>go('autre-sport-choice'));
    $$('#ml1Start').addEventListener('click',begin);
    $$('#ml1Pause').addEventListener('click',pause);
    $$('#ml1Finish').addEventListener('click',finish);
    $$('#ml1Reset').addEventListener('click',reset);
    attachFooter();refreshWalk();
    if(current?.status==='running')keepScreen();
    if(current?.status==='running' && !ticker) ticker=setInterval(refreshWalk,650);
  }
  function refreshWalk(){
    const dist=$$('#ml1Distance');if(!dist)return;
    const ms=elapsed();
    dist.textContent=metersToKm(current?.distanceMeters||0)+' km';
    $$('#ml1Duration').textContent=fmtDuration(ms);
    $$('#ml1Pace').textContent=humanPace(ms/1000,current?.distanceMeters||0);
    const stateCode=current?.gpsStatus||'idle';
    const stat={idle:'GPS inactif',search:'Recherche GPS',ok:'GPS actif',weak:'Signal GPS faible',error:'GPS indisponible',paused:'GPS en pause'};
    $$('#ml1GpsStatus').textContent=stat[stateCode]||'GPS inactif';
    $$('#ml1GpsLed').className='ml1-gps-led '+('ml1-gps-'+stateCode);
    $$('#ml1GpsNote').textContent=current?.gpsNote||savedStatus.detail;
    const screenNote=$$('#ml1ScreenNote');
    if(screenNote){
      const w=window.SportScreenAwake?.getStatus()||'unsupported';
      const isWalking=current?.status==='running';
      const messages={
        active:'✓ Écran maintenu allumé pendant la marche.',
        requesting:'Activation du maintien de l’écran…',
        released:'L’écran peut se mettre en veille : maintien interrompu par le téléphone.',
        unavailable:'Maintien de l’écran refusé : vérifie la batterie et le mode économie d’énergie.',
        unsupported:'Maintien de l’écran non disponible sur ce navigateur.',
        hidden:'Application en arrière-plan : maintien de l’écran suspendu.',
        off:'Écran maintenu allumé pendant la marche si le téléphone l’autorise.'
      };
      screenNote.textContent=isWalking?messages[w]||messages.unavailable:current?.status==='paused'?'Écran autorisé à s’éteindre pendant la pause.':messages.off;
      screenNote.classList.toggle('ml1-screen-note-active',isWalking&&w==='active');
      screenNote.classList.toggle('ml1-screen-note-warning',isWalking&&['released','unavailable','unsupported'].includes(w));
    }
    const status=current?.status||'idle';
    const start=$$('#ml1Start');
    start.disabled=status==='running';
    start.querySelector('span').textContent=status==='paused'?'Reprendre':'Démarrer';
    $$('#ml1Pause').disabled=status!=='running';
    $$('#ml1Finish').disabled=!['running','paused'].includes(status);
  }
  function showSummary(){
    setActive(); if(!finished){state.view='autre-sport-walk';showWalk();return;}
    const d=round((finished.distanceMeters||0)/1000,2),secs=Math.floor((finished.accumulatedMs||0)/1000);
    main.innerHTML=`<section class="ml1-screen ml1-page">
      <header class="ml1-simple-header"><button class="ml1-back" id="ml1SumBack" aria-label="Revenir à Marche">${svg('arrow')}</button><div class="ml1-heading">Séance terminée</div><p>Vérifie ta distance avant de l’enregistrer.</p></header>
      <div class="ml1-content ml1-summary-body"><div class="ml1-summary-card">
        <span class="ml1-check">✓</span><h2>Marche terminée</h2>
        <div class="ml1-pair"><span>Durée</span><strong>${fmtDuration(finished.accumulatedMs||0)}</strong></div>
        <div class="ml1-pair"><span>Distance GPS estimée</span><strong>${metersToKm(finished.distanceMeters||0)} km</strong></div>
        <label class="ml1-field">Distance finale (en kilomètres)
          <input type="number" id="ml1FinalDistance" min="0" max="500" step="0.01" inputmode="decimal" value="${d.toFixed(2)}">
          <small>Tu peux corriger cette valeur manuellement si le GPS s’est interrompu.</small>
        </label>
        <div class="ml1-pair"><span>Allure moyenne finale</span><strong id="ml1FinalPace">${humanPace(secs,finished.distanceMeters||0)}</strong></div>
        <button class="ml1-btn ml1-btn-primary" id="ml1Save">${svg('save')} Enregistrer la marche</button>
        <button class="ml1-btn ml1-btn-secondary" id="ml1Cancel">Retour sans enregistrer</button>
        <p class="ml1-note">Enregistrement local sur cet appareil. La synchronisation entre appareils sera ajoutée ultérieurement.</p>
      </div></div>${footer()}</section>`;
    $$('#ml1SumBack').addEventListener('click',()=>{current={...finished,status:'paused',gpsStatus:'paused',lastAccepted:null};finished=null;persistDraft();go('autre-sport-walk');});
    $$('#ml1FinalDistance').addEventListener('input',()=>{
      const input=$$('#ml1FinalDistance');const km=Number(input.value);
      $$('#ml1FinalPace').textContent=Number.isFinite(km)&&km>=0?humanPace(secs,km*1000):'—';
    });
    $$('#ml1Save').addEventListener('click',()=>{
      const raw=$$('#ml1FinalDistance').value.trim().replace(',','.');
      const km=Number(raw);
      if(raw===''||!Number.isFinite(km)||km<0||km>500){alert('Indique une distance valide, entre 0 et 500 km.');return;}
      const gpsKm=(finished.distanceMeters||0)/1000;
      const manual=Math.abs(km-gpsKm)>0.015 || !(finished.route||[]).length;
      const obj={
        id:'marche-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
        type:'sport',category:'autre-sport',sport:'Marche',
        startedAt:finished.startedISO,endedAt:finished.finishedISO||new Date().toISOString(),
        durationSeconds:Math.floor((finished.accumulatedMs||0)/1000),
        distanceKm:round(km,2),distanceSource:manual?'manuel':'gps',
        averageSpeedKmh:secs>0?round(km/(secs/3600),2):0,
        route:manual?[]:(finished.route||[]),createdAt:new Date().toISOString()
      };
      const items=sessions(); items.unshift(obj);
      if(!safeWrite(STORAGE,items)){
        alert('La sauvegarde locale n’a pas fonctionné. Vérifie l’espace disponible et les autorisations du navigateur.');return;
      }
      current=null;finished=null;safeRemove(DRAFT);go('marche-v1-history');
    });
    $$('#ml1Cancel').addEventListener('click',()=>{
      if(confirm('Abandonner cette séance sans l’enregistrer ?')){
        current=null;finished=null;safeRemove(DRAFT);go('autre-sport-choice');
      }
    });
    attachFooter();
  }
  function showHistory(){
    setActive();
    const data=sessions().filter(x=>x && x.category==='autre-sport');
    const filtered=data.filter(x=>{
      if(historyFilter==='all')return true;
      const d=new Date(x.startedAt||x.createdAt).getTime();
      const now=Date.now();
      if(historyFilter==='week')return d>=now-7*24*3600*1000;
      if(historyFilter==='month')return d>=now-30*24*3600*1000;
      return d>=now-365*24*3600*1000;
    });
    const totalKm=filtered.reduce((a,x)=>a+(Number(x.distanceKm)||0),0);
    const totalSeconds=filtered.reduce((a,x)=>a+(Number(x.durationSeconds)||0),0);
    const rows=filtered.map(x=>{
      const dt=new Date(x.startedAt||x.createdAt);
      const label=Number.isNaN(dt.getTime())?'Date inconnue':dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
      return `<article class="ml1-history-row"><div><strong>${esc(x.sport||'Sport')}</strong><span>${esc(label)} · ${fmtDuration((x.durationSeconds||0)*1000)}</span></div>
      <div><strong>${metersToKm((Number(x.distanceKm)||0)*1000)} km</strong><small>${x.distanceSource==='manuel'?'Distance manuelle':'GPS'}</small></div>
      <button type="button" class="ml1-trash" data-ml-delete="${esc(x.id)}" aria-label="Supprimer cette marche">×</button></article>`;
    }).join('');
    main.innerHTML=`<section class="ml1-screen ml1-page"><header class="ml1-simple-header"><button class="ml1-back" id="ml1HisBack">${svg('arrow')}</button><div class="ml1-heading">Historique · Autre sport</div><p>Séances enregistrées sur cet appareil</p></header>
      <div class="ml1-content ml1-history-body"><div class="ml1-filter" role="group" aria-label="Filtrer par période">
      ${[['all','Tout'],['week','7 jours'],['month','30 jours'],['year','1 an']].map(([k,v])=>`<button class="${historyFilter===k?'selected':''}" data-ml-filter="${k}">${v}</button>`).join('')}</div>
      <div class="ml1-history-totals"><div><b>${filtered.length}</b><span>Séances</span></div><div><b>${metersToKm(totalKm*1000)} km</b><span>Distance</span></div><div><b>${fmtDuration(totalSeconds*1000)}</b><span>Durée</span></div></div>
      <div class="ml1-history-list">${rows||'<div class="ml1-empty">Aucune séance enregistrée sur cette période. Termine une marche pour la retrouver ici.</div>'}</div>
      <p class="ml1-note">Historique local provisoire : le regroupement avec Musculation, Pilates et Étirements viendra dans l’Historique commun.</p>
      </div>${footer('history')}</section>`;
    $$('#ml1HisBack').addEventListener('click',()=>go('autre-sport-home'));
    main.querySelectorAll('[data-ml-filter]').forEach(b=>b.addEventListener('click',()=>{historyFilter=b.dataset.mlFilter;showHistory();}));
    main.querySelectorAll('[data-ml-delete]').forEach(b=>b.addEventListener('click',()=>{
      if(!confirm('Supprimer définitivement cette séance de cet appareil ?'))return;
      const id=b.dataset.mlDelete;
      safeWrite(STORAGE,sessions().filter(x=>String(x.id)!==id));showHistory();
    }));
    attachFooter();
  }
  const previousRender=render;
  render=function(){
    const v=state.view;
    if(v==='autre-sport-walk'){updateShell();showWalk();return;}
    if(v==='marche-v1-summary'){updateShell();showSummary();return;}
    if(v==='marche-v1-history' || (v==='autre-sport-section' && state.as1Section==='history')){
      updateShell();showHistory();return;
    }
    allowSleep();
    document.body.classList.remove('ml1-active');
    return previousRender.apply(this,arguments);
  };
  document.addEventListener('visibilitychange',()=>{
    if(current?.status==='running' && document.visibilityState==='visible'){
      current.gpsNote='Si le téléphone a été verrouillé, le GPS peut avoir interrompu le suivi. Vérifie la distance avant de sauvegarder.';
      refreshWalk();
    }
  });
  window.addEventListener('pagehide',()=>{allowSleep();persistDraft();stopGPS();stopTicker();});
  window.SportScreenAwake?.onChange(()=>refreshWalk());
})();
