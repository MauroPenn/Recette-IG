/* AUTRE SPORT — VÉLO GPS V1, 10/11/2026.
 * Module indépendant : ne modifie pas Marche, Musculation, HIIT ni leurs données.
 * GPS en premier plan, brouillon local en pause, historique commun et cartes Leaflet/OSM.
 */
(function(){
  'use strict';
  const STORAGE='mb_activites_sportives_v1';
  const DRAFT='mb_velo_brouillon_v1';
  const MAP_CSS='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  const MAP_JS='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  const MAP_CSS_HASH='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  const MAP_JS_HASH='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  let ride=null, completed=null, watch=null, timer=null, lastPersist=0;
  let activeMap=null, mapToken=0, leafletPromise=null, selectedId=null;
  const $=s=>main.querySelector(s);
  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const round=(n,p=2)=>Number(Number(n).toFixed(p));
  const finite=n=>Number.isFinite(Number(n))?Number(n):0;
  const kmText=n=>Math.max(0,finite(n)).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const clock=ms=>{let n=Math.max(0,Math.floor(ms/1000));return [Math.floor(n/3600),Math.floor(n/60)%60,n%60].map(x=>String(x).padStart(2,'0')).join(':');};
  const elapsed=()=>!ride?0:ride.elapsedMs+(ride.status==='running'?Math.max(0,Date.now()-ride.since):0);
  const read=(key,def)=>{try{const x=localStorage.getItem(key);return x?JSON.parse(x):def;}catch(_){return def;}};
  const write=(key,x)=>{try{localStorage.setItem(key,JSON.stringify(x));return true;}catch(_){return false;}};
  const remove=key=>{try{localStorage.removeItem(key);}catch(_){}};
  const sessions=()=>{const x=read(STORAGE,[]);return Array.isArray(x)?x:[];};
  const sleep=()=>window.SportScreenAwake?.stop();
  const awake=()=>window.SportScreenAwake?.start();
  function haversine(a,b){
    const phi1=a.lat*Math.PI/180,phi2=b.lat*Math.PI/180;
    const dphi=(b.lat-a.lat)*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180;
    const h=Math.sin(dphi/2)**2+Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2;
    return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
  }
  function gpsStop(){if(watch!=null&&navigator.geolocation){try{navigator.geolocation.clearWatch(watch);}catch(_){}}watch=null;}
  function tickStop(){if(timer!=null)clearInterval(timer);timer=null;}
  function persist(){
    if(!ride||!['running','paused'].includes(ride.status))return;
    write(DRAFT,{...ride,status:'paused',elapsedMs:elapsed(),since:null,last:null,currentSpeed:0});
  }
  function restore(){
    if(ride)return;
    const d=read(DRAFT,null);
    if(d&&['running','paused'].includes(d.status)&&d.startedAt){
      ride={...d,status:'paused',elapsedMs:finite(d.elapsedMs),since:null,last:null,currentSpeed:0,
        gps:'paused',note:'Sortie récupérée en pause. Appuie sur Reprendre pour relancer le GPS.'};
    }
  }
  function addPosition(pos){
    const r=ride;
    if(!r||r.status!=='running')return;
    const c=pos.coords,t=pos.timestamp||Date.now();
    const lat=c.latitude,lon=c.longitude,accuracy=c.accuracy;
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
    if(!Number.isFinite(accuracy)||accuracy>45){
      r.gps='weak';r.note='Précision GPS insuffisante (plus de 45 m). Le point est ignoré.';refresh();return;
    }
    const p={lat,lon,t,accuracy};
    if(r.last){
      const gap=(t-r.last.t)/1000,meters=haversine(r.last,p);
      if(gap<=0)return;
      if(gap>45){
        // GPS interrompu ou téléphone verrouillé : ne pas relier artificiellement les points.
        if(r.route.length&&r.route[r.route.length-1]!==null)r.route.push(null);
        r.currentSpeed=0;r.note='GPS récupéré après une interruption : vérifie la distance finale.';
      }else{
        const threshold=Math.max(5,Math.min(18,(accuracy+r.last.accuracy)*.35));
        if(meters<threshold)return;
        if(meters/gap>35){r.gps='weak';r.note='Saut GPS écarté (vitesse incohérente).';refresh();return;}
        r.meters+=meters;
        r.currentSpeed=round((meters/gap)*3.6,1);
      }
    }
    r.last=p;
    r.route.push([round(lat,6),round(lon,6)]);
    // Décimation progressive pour éviter de saturer le stockage local après de longues sorties.
    if(r.route.length>1600){r.route=r.route.filter((v,i)=>v===null||i%2===0||i===r.route.length-1);}
    r.gps='ok';
    if(!r.note.includes('interruption'))r.note=`Précision GPS : ±${Math.round(accuracy)} m. Parcours indicatif.`;
    refresh();
  }
  function gpsError(e){
    if(!ride||ride.status!=='running')return;
    ride.gps='error';
    ride.note=e?.code===1?'Accès à la position refusé. Autorise le GPS ou saisis la distance à la fin.':
      e?.code===2?'Position introuvable : la distance pourra être saisie manuellement.':
      e?.code===3?'Recherche GPS trop longue. Essaie en extérieur.':'GPS indisponible : saisie manuelle possible.';
    refresh();
  }
  function gpsStart(){
    gpsStop();
    if(!ride)return;
    if(!window.isSecureContext||!navigator.geolocation){ride.gps='error';ride.note='Le GPS exige un navigateur compatible et une connexion HTTPS.';refresh();return;}
    ride.gps='search';ride.note='Recherche du signal GPS…';
    try{watch=navigator.geolocation.watchPosition(addPosition,gpsError,{enableHighAccuracy:true,timeout:18000,maximumAge:0});}
    catch(_){ride.gps='error';ride.note='Impossible de démarrer le GPS.';}
    refresh();
  }
  function begin(){
    if(!ride||ride.status==='finished'){
      ride={status:'paused',startedAt:new Date().toISOString(),elapsedMs:0,since:null,meters:0,route:[],
        last:null,currentSpeed:0,gps:'paused',note:'GPS demandé au démarrage.'};
    }
    if(ride.status==='running')return;
    ride.status='running';ride.since=Date.now();ride.last=null;
    // Le Wake Lock n'assure PAS un suivi GPS en arrière-plan.
    awake();
    if(!timer)timer=setInterval(()=>{
      refresh();
      if(Date.now()-lastPersist>3000){persist();lastPersist=Date.now();}
    },700);
    gpsStart();refresh();
  }
  function pause(){
    if(!ride||ride.status!=='running')return;
    ride.elapsedMs=elapsed();ride.since=null;ride.status='paused';ride.last=null;ride.currentSpeed=0;
    if(ride.route.length&&ride.route[ride.route.length-1]!==null)ride.route.push(null);
    ride.gps='paused';ride.note='Sortie en pause. Reprendre pour relancer le GPS.';
    sleep();gpsStop();tickStop();persist();refresh();
  }
  function finish(){
    if(!ride||!['running','paused'].includes(ride.status))return;
    if(ride.status==='running')ride.elapsedMs=elapsed();
    ride.since=null;ride.status='finished';ride.endedAt=new Date().toISOString();
    sleep();gpsStop();tickStop();remove(DRAFT);
    completed={...ride,route:ride.route.slice()};
    state.view='velo-v1-summary';render();
  }
  function reset(){
    if(ride&&elapsed()>0&&!confirm('Effacer cette sortie vélo en cours ?'))return;
    sleep();gpsStop();tickStop();remove(DRAFT);ride=null;completed=null;
    state.view='autre-sport-velo';render();
  }
  function activeShell(){
    document.body.classList.add('as1-active','ml1-active','bv1-active');
    document.body.classList.remove('mm1-active');bottomNav.classList.add('hidden');
  }
  function footer(selected='sport'){
    return `<nav class="ml1-footer" aria-label="Navigation sportive">
      <button type="button" data-bvnav="hub">⌂<span>Accueil</span></button>
      <button type="button" data-bvnav="autre-sport-home" class="${selected==='sport'?'active':''}">♧<span>Autre sport</span></button>
      <button type="button" data-bvnav="marche-v1-history" class="${selected==='history'?'active':''}">▤<span>Historique</span></button>
    </nav>`;
  }
  function go(view){
    if(completed&&state.view==='velo-v1-summary'&&view!=='velo-v1-summary'){
      if(!confirm('Cette sortie vélo n’est pas encore enregistrée. Quitter sans sauvegarder ?'))return;
      completed=null;
    }
    if(ride?.status==='running'&&view!=='autre-sport-velo'){
      if(!confirm('La sortie est en cours. La mettre en pause et quitter ?'))return;
      pause();
    }
    if(view!=='autre-sport-velo')sleep();
    destroyMap();state.view=view;state.selected=null;render();window.scrollTo?.(0,0);
  }
  function bindFooter(){main.querySelectorAll('[data-bvnav]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.bvnav)));}
  function showBike(){
    activeShell();restore();
    main.innerHTML=`<section class="ml1-screen bv1-screen" aria-label="Vélo — suivi GPS en temps réel">
      <header class="ml1-hero bv1-hero">
        <img class="bv1-cover" src="./sport-card-velo-v5.webp" alt="" decoding="async">
        <button type="button" class="ml1-back" id="bv1Back" aria-label="Retour aux activités">←</button>
        <div class="ml1-hero-copy"><div class="bv1-kicker">AUTRE SPORT</div><h1>Vélo</h1><p>Suivi GPS de tes sorties en extérieur</p></div>
      </header>
      <div class="ml1-content">
        <section class="ml1-metrics" aria-label="Statistiques de la sortie">
          <div class="ml1-gps"><span class="ml1-gps-led" id="bv1Led"></span><strong id="bv1Gps">GPS inactif</strong></div>
          <div class="ml1-grid">
            <div class="ml1-metric"><div><span>Distance</span><strong id="bv1Km">0,00 km</strong></div></div>
            <div class="ml1-metric"><div><span>Durée active</span><strong id="bv1Time">00:00:00</strong></div></div>
            <div class="ml1-metric"><div><span>Vitesse moyenne</span><strong id="bv1Avg">— km/h</strong></div></div>
            <div class="ml1-metric"><div><span>Vitesse actuelle</span><strong id="bv1Speed">— km/h</strong></div></div>
          </div>
          <p class="ml1-note" id="bv1Note" role="status">Le GPS sera demandé au démarrage.</p>
          <p class="ml1-screen-note" id="bv1Screen" role="status">Écran maintenu allumé si le téléphone l’autorise.</p>
        </section>
        <div class="ml1-actions"><button type="button" class="ml1-btn ml1-btn-primary" id="bv1Start">▶ <span>Démarrer</span></button>
          <div class="ml1-action-row">
            <button type="button" class="ml1-btn ml1-btn-secondary" id="bv1Pause">Ⅱ <span>Pause</span></button>
            <button type="button" class="ml1-btn ml1-btn-secondary" id="bv1Finish">■ <span>Terminer</span></button>
          </div>
        </div>
        <section class="ml1-info"><div><strong>Parcours GPS</strong></div>
          <p>Le tracé sera disponible sur une carte à la fin de la sortie, puis dans ton historique. Garde l’application visible : le GPS web peut s’interrompre quand le téléphone est verrouillé.</p>
          <button type="button" class="ml1-link" id="bv1Reset">Réinitialiser la sortie</button>
        </section>
      </div>${footer()}</section>`;
    $('#bv1Back').addEventListener('click',()=>go('autre-sport-choice'));
    $('#bv1Start').addEventListener('click',begin);
    $('#bv1Pause').addEventListener('click',pause);
    $('#bv1Finish').addEventListener('click',finish);
    $('#bv1Reset').addEventListener('click',reset);
    bindFooter();refresh();
  }
  function refresh(){
    if(!$('#bv1Km'))return;
    const d=ride?.meters||0,ms=elapsed();
    $('#bv1Km').textContent=kmText(d/1000)+' km';
    $('#bv1Time').textContent=clock(ms);
    $('#bv1Avg').textContent=ms>0&&d>0?kmText(d/1000/(ms/3600000))+' km/h':'— km/h';
    $('#bv1Speed').textContent=ride?.status==='running'&&ride.currentSpeed>0&&Date.now()-finite(ride.last?.t)<12000?kmText(ride.currentSpeed)+' km/h':'— km/h';
    const code=ride?.gps||'idle';
    $('#bv1Led').className='ml1-gps-led ml1-gps-'+code;
    $('#bv1Gps').textContent=({idle:'GPS inactif',search:'Recherche GPS',ok:'GPS actif',weak:'Signal faible',error:'GPS indisponible',paused:'GPS en pause'})[code]||'GPS inactif';
    $('#bv1Note').textContent=ride?.note||'Le GPS sera demandé au démarrage.';
    const lock=window.SportScreenAwake?.getStatus()||'unsupported';
    $('#bv1Screen').textContent=ride?.status!=='running'?'Écran maintenu allumé pendant le vélo si disponible.':
      lock==='active'?'✓ Écran maintenu allumé.':lock==='requesting'?'Activation du maintien de l’écran…':
      'Le téléphone peut éteindre l’écran et interrompre le GPS : garde l’application visible.';
    const status=ride?.status||'idle';
    $('#bv1Start').disabled=status==='running';
    $('#bv1Start').querySelector('span').textContent=status==='paused'?'Reprendre':'Démarrer';
    $('#bv1Pause').disabled=status!=='running';
    $('#bv1Finish').disabled=!['running','paused'].includes(status);
  }
  function routeSegments(raw){
    if(!Array.isArray(raw))return [];
    const result=[];let segment=[];
    const flush=()=>{if(segment.length)result.push(segment);segment=[];};
    for(const p of raw.slice(0,2500)){
      if(!p){flush();continue;}
      const lat=Array.isArray(p)?Number(p[0]):Number(p.lat);
      const lon=Array.isArray(p)?Number(p[1]):Number(p.lon??p.lng);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){flush();continue;}
      segment.push([lat,lon]);
    }
    flush();return result;
  }
  function hasTrack(route){return routeSegments(route).some(s=>s.length>=2);}
  function destroyMap(){mapToken++;if(activeMap){try{activeMap.remove();}catch(_){}}activeMap=null;}
  function loadLeaflet(){
    if(window.L&&typeof window.L.map==='function')return Promise.resolve(window.L);
    if(leafletPromise)return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href=MAP_CSS;
      css.integrity=MAP_CSS_HASH;css.crossOrigin='anonymous';document.head.appendChild(css);
      const script=document.createElement('script');script.src=MAP_JS;script.async=true;
      script.integrity=MAP_JS_HASH;script.crossOrigin='anonymous';
      let done=false;
      const end=(e)=>{if(done)return;done=true;clearTimeout(timeout);if(e){script.remove();css.remove();leafletPromise=null;reject(e);}else if(window.L?.map)resolve(window.L);else{leafletPromise=null;reject(new Error('Leaflet indisponible'));}};
      const timeout=setTimeout(()=>end(new Error('Délai de chargement dépassé')),12000);
      script.addEventListener('load',()=>end(null),{once:true});
      script.addEventListener('error',()=>end(new Error('Carte impossible à charger')),{once:true});
      document.head.appendChild(script);
    });
    return leafletPromise;
  }
  function drawLocalMap(element,segments){
    const pts=segments.flat();if(pts.length<2)return;
    const project=([lat,lon])=>[lon,Math.log(Math.tan(Math.PI/4+Math.max(-85,Math.min(85,lat))*Math.PI/360))*180/Math.PI];
    const pp=pts.map(project),xs=pp.map(p=>p[0]),ys=pp.map(p=>p[1]);
    const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
    const scale=Math.min(560/Math.max(.00005,xmax-xmin),260/Math.max(.00005,ymax-ymin));
    const centerX=(xmin+xmax)/2,centerY=(ymin+ymax)/2;
    const xy=p=>{const [x,y]=project(p);return `${(320+(x-centerX)*scale).toFixed(1)},${(165-(y-centerY)*scale).toFixed(1)}`;};
    element.innerHTML=`<div class="mc1-fallback"><svg viewBox="0 0 640 330" role="img" aria-label="Aperçu du tracé GPS sans fond de carte">
      <rect width="640" height="330" fill="#e8f1ee"/>
      ${segments.filter(s=>s.length>1).map(s=>`<polyline fill="none" stroke="#00a6b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points="${s.map(xy).join(' ')}"/>`).join('')}
      <circle cx="${xy(pts[0]).split(',')[0]}" cy="${xy(pts[0]).split(',')[1]}" r="9" fill="#159b4d" stroke="white" stroke-width="4"/>
      <circle cx="${xy(pts[pts.length-1]).split(',')[0]}" cy="${xy(pts[pts.length-1]).split(',')[1]}" r="9" fill="#f07f18" stroke="white" stroke-width="4"/>
      </svg><p>Tracé GPS enregistré. Le fond de carte nécessite une connexion Internet.</p></div>`;
  }
  function paintMap(route){
    destroyMap();const token=mapToken;
    const elem=$('#bv1Map'),note=$('#bv1MapNote'),segments=routeSegments(route),pts=segments.flat();
    if(!elem||pts.length<2||!hasTrack(route))return;
    loadLeaflet().then(L=>{
      if(mapToken!==token||!$('#bv1Map'))return;
      elem.replaceChildren();
      const map=L.map(elem,{preferCanvas:true,scrollWheelZoom:false});activeMap=map;
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">contributeurs OpenStreetMap</a>'}).addTo(map);
      tiles.on('tileerror',()=>{if(note)note.textContent='Fond de carte indisponible, tracé GPS conservé.';});
      segments.filter(s=>s.length>1).forEach(s=>L.polyline(s,{color:'#00a6b8',weight:5,opacity:1}).addTo(map));
      L.circleMarker(pts[0],{radius:9,color:'#fff',weight:3,fillColor:'#159b4d',fillOpacity:1}).bindPopup('Départ').addTo(map);
      L.circleMarker(pts[pts.length-1],{radius:9,color:'#fff',weight:3,fillColor:'#f07f18',fillOpacity:1}).bindPopup('Arrivée').addTo(map);
      const bounds=L.latLngBounds(pts);
      if(bounds.isValid())map.fitBounds(bounds,{padding:[30,30],maxZoom:16});
      if(L.control?.scale)L.control.scale({imperial:false}).addTo(map);
      setTimeout(()=>{if(activeMap===map)map.invalidateSize();},180);
      if(note)note.textContent='Carte de ton parcours enregistré : déplace-la ou zoome avec deux doigts.';
    }).catch(()=>{
      if(mapToken!==token||!$('#bv1Map'))return;
      drawLocalMap(elem,segments);
      if(note)note.textContent='Fond de carte indisponible : tracé sans routes ni rues affiché.';
    });
  }
  function mapSection(route){
    const track=hasTrack(route);
    return `<section class="mc1-card bv1-map-card"><div class="mc1-card-title"><h2>Mon parcours</h2><span>${track?'GPS enregistré':'Sans tracé GPS'}</span></div>
      ${track?`<div id="bv1Map" class="mc1-map" aria-label="Carte GPS interactive"><div class="mc1-loading">Chargement de la carte…</div></div>
        <div class="mc1-legend"><span><i class="mc1-start"></i> Départ</span><span><i class="mc1-end"></i> Arrivée</span></div>
        <p class="mc1-note" id="bv1MapNote">Chargement du fond de carte…</p>`:
        '<div class="mc1-empty">Aucun itinéraire GPS complet n’a été enregistré pour cette sortie. La distance peut néanmoins être saisie manuellement.</div>'}
      </section>`;
  }
  function caloriesEstimate(weight,km,secs){
    if(!Number.isFinite(weight)||weight<=0||!secs||km<=0)return null;
    const speed=km/(secs/3600);
    const met=speed<16?4:speed<19.2?6.8:speed<22.4?8:speed<25.6?10:12;
    return Math.round(met*weight*secs/3600);
  }
  function showSummary(){
    activeShell();
    if(!completed){state.view='autre-sport-velo';showBike();return;}
    const secs=Math.floor(completed.elapsedMs/1000),gpsKm=completed.meters/1000;
    main.innerHTML=`<section class="ml1-screen ml1-page bv1-screen"><header class="ml1-simple-header">
      <button class="ml1-back" type="button" id="bv1SummaryBack" aria-label="Retour au vélo">←</button>
      <div class="ml1-heading">Sortie vélo terminée</div><p>Ton parcours et tes statistiques</p></header>
      <div class="ml1-content bv1-content">
        <p class="bv1-date">Départ : ${esc(new Date(completed.startedAt).toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'}))}</p>
        <div class="mc1-stats"><div><span>Durée active</span><strong>${clock(completed.elapsedMs)}</strong></div>
        <div><span>Distance GPS</span><strong>${kmText(gpsKm)} km</strong></div></div>
        ${mapSection(completed.route)}
        <section class="ml1-summary-card"><h2>Enregistrer ma sortie</h2>
          <label class="ml1-field">Distance finale (km)
            <input id="bv1FinalKm" type="number" inputmode="decimal" min="0" max="1000" step="0.01" value="${round(gpsKm,2).toFixed(2)}">
            <small>Corrige la distance si le GPS a été interrompu. Le tracé enregistré sera conservé.</small>
          </label>
          <div class="ml1-pair"><span>Vitesse moyenne</span><strong id="bv1FinalAvg">${secs&&gpsKm?kmText(gpsKm/(secs/3600))+' km/h':'—'}</strong></div>
          <label class="ml1-field">Dénivelé positif (m, facultatif)<input id="bv1Ascent" type="number" inputmode="numeric" min="0" max="20000" step="1" placeholder="À renseigner si connu"></label>
          <label class="ml1-field">Poids (kg, facultatif, pour estimer les calories)<input id="bv1Weight" type="number" inputmode="decimal" min="20" max="300" step="0.5" placeholder="Ex. 80"></label>
          <div class="ml1-pair"><span>Calories estimées</span><strong id="bv1Calories">—</strong></div>
          <label class="ml1-field">Commentaire (facultatif)<textarea id="bv1Comment" rows="3" maxlength="500" placeholder="Terrain, météo, sensations…"></textarea></label>
          <button type="button" class="ml1-btn ml1-btn-primary" id="bv1Save">Enregistrer la sortie vélo</button>
          <button type="button" class="ml1-btn ml1-btn-secondary" id="bv1Abandon">Abandonner cette sortie</button>
          <p class="ml1-note">Calories très approximatives selon la vitesse moyenne et le poids indiqué. L'historique et le tracé GPS restent sur cet appareil.</p>
        </section>
      </div>${footer()}</section>`;
    function refreshEstimate(){
      const distance=Number($('#bv1FinalKm').value),weight=Number($('#bv1Weight').value);
      const valid=$('#bv1FinalKm').value.trim()!==''&&Number.isFinite(distance)&&distance>=0;
      $('#bv1FinalAvg').textContent=valid&&secs&&distance?kmText(distance/(secs/3600))+' km/h':'—';
      const kcal=$('#bv1Weight').value.trim()!==''&&valid?caloriesEstimate(weight,distance,secs):null;
      $('#bv1Calories').textContent=kcal==null?'—':`${kcal} kcal (estim.)`;
    }
    $('#bv1FinalKm').addEventListener('input',refreshEstimate);
    $('#bv1Weight').addEventListener('input',refreshEstimate);
    $('#bv1SummaryBack').addEventListener('click',()=>{
      ride={...completed,status:'paused',since:null,last:null,currentSpeed:0,gps:'paused'};
      completed=null;persist();go('autre-sport-velo');
    });
    $('#bv1Save').addEventListener('click',()=>{
      const kmRaw=$('#bv1FinalKm').value.trim().replace(',','.');const distance=Number(kmRaw);
      const ascentRaw=$('#bv1Ascent').value.trim();const ascent=ascentRaw===''?null:Number(ascentRaw);
      const weightRaw=$('#bv1Weight').value.trim();const weight=weightRaw===''?null:Number(weightRaw);
      if(kmRaw===''||!Number.isFinite(distance)||distance<0||distance>1000){alert('Indique une distance valide (0 à 1 000 km).');return;}
      if(ascent!==null&&(!Number.isFinite(ascent)||ascent<0||ascent>20000)){alert('Vérifie le dénivelé (0 à 20 000 m).');return;}
      if(weight!==null&&(!Number.isFinite(weight)||weight<20||weight>300)){alert('Vérifie le poids (20 à 300 kg) ou laisse le champ vide.');return;}
      const manual=Math.abs(distance-gpsKm)>0.015||!hasTrack(completed.route);
      const obj={
        id:'velo-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
        type:'sport',category:'autre-sport',sport:'Vélo',
        startedAt:completed.startedAt,endedAt:completed.endedAt||new Date().toISOString(),
        durationSeconds:secs,distanceKm:round(distance,2),distanceSource:manual?'manuel':'gps',
        averageSpeedKmh:secs?round(distance/(secs/3600),2):0,
        elevationGainM:ascent,caloriesEstimate:caloriesEstimate(weight,distance,secs),
        comment:$('#bv1Comment').value.trim(),
        route:completed.route.slice(),createdAt:new Date().toISOString()
      };
      const items=sessions();items.unshift(obj);
      if(!write(STORAGE,items)){alert('Sauvegarde impossible. Vérifie l’espace de stockage disponible sur ce téléphone.');return;}
      ride=null;completed=null;remove(DRAFT);go('marche-v1-history');
    });
    $('#bv1Abandon').addEventListener('click',()=>{
      if(!confirm('Abandonner cette sortie vélo sans l’enregistrer ?'))return;
      completed=null;ride=null;remove(DRAFT);go('autre-sport-choice');
    });
    bindFooter();if(hasTrack(completed.route))paintMap(completed.route);
  }
  function showDetail(){
    activeShell();
    const s=sessions().find(x=>x&&String(x.id)===String(selectedId)&&String(x.sport||'').toLowerCase()==='vélo');
    if(!s){go('marche-v1-history');return;}
    const date=new Date(s.startedAt||s.createdAt);
    const dateLabel=Number.isNaN(date.getTime())?'Date inconnue':date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const route=Array.isArray(s.route)?s.route:[];
    main.innerHTML=`<section class="ml1-screen ml1-page bv1-screen"><header class="ml1-simple-header">
      <button type="button" class="ml1-back" id="bv1DetailBack" aria-label="Retour à l’historique">←</button>
      <div class="ml1-heading">Parcours vélo</div><p>${esc(dateLabel)} · ${esc(date.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))}</p></header>
      <div class="ml1-content bv1-content"><div class="mc1-stats">
        <div><span>Distance</span><strong>${kmText(s.distanceKm)} km</strong></div>
        <div><span>Durée</span><strong>${clock(finite(s.durationSeconds)*1000)}</strong></div>
        <div><span>Vitesse moyenne</span><strong>${finite(s.averageSpeedKmh)>0?kmText(s.averageSpeedKmh)+' km/h':'—'}</strong></div>
        <div><span>Dénivelé positif</span><strong>${s.elevationGainM==null?'—':`${Math.round(finite(s.elevationGainM))} m`}</strong></div>
        <div><span>Calories estimées</span><strong>${s.caloriesEstimate==null?'—':`${Math.round(finite(s.caloriesEstimate))} kcal`}</strong></div>
      </div>${mapSection(route)}
      ${s.comment?`<section class="bv1-comment"><h2>Commentaire</h2><p>${esc(s.comment)}</p></section>`:''}
      <p class="mc1-privacy">${s.distanceSource==='manuel'?'Distance corrigée ou renseignée manuellement. ':''}Les coordonnées GPS sont stockées sur ce téléphone. Le fond de carte OpenStreetMap nécessite Internet. Une coupure GPS peut laisser des portions de parcours manquantes.</p>
      <button type="button" class="mc1-return" id="bv1DetailReturn">← Retour à l’historique</button>
      </div></section>`;
    $('#bv1DetailBack').addEventListener('click',()=>go('marche-v1-history'));
    $('#bv1DetailReturn').addEventListener('click',()=>go('marche-v1-history'));
    if(hasTrack(route))paintMap(route);
  }
  function enhanceHistory(){
    const list=$('.ml1-history-list');if(!list)return;
    const byId=new Map(sessions().map(x=>[String(x.id),x]));
    list.querySelectorAll('.ml1-history-row').forEach(row=>{
      if(row.querySelector('.bv1-history-open'))return;
      const del=row.querySelector('[data-ml-delete]');
      if(!del)return;
      const item=byId.get(String(del.dataset.mlDelete));
      if(!item||String(item.sport||'').toLocaleLowerCase('fr-FR')!=='vélo')return;
      const btn=document.createElement('button');btn.type='button';btn.className='bv1-history-open mc1-history-open';
      btn.textContent=hasTrack(item.route)?'Voir la carte du parcours':'Consulter la sortie vélo';
      btn.setAttribute('aria-label',btn.textContent);
      btn.addEventListener('click',()=>{selectedId=String(item.id);state.view='velo-v1-detail';render();window.scrollTo?.(0,0);});
      row.appendChild(btn);
    });
  }
  const prevRender=render;
  render=function(){
    const v=state.view;
    if(v==='autre-sport-velo'||v==='velo-v1-summary'||v==='velo-v1-detail'){
      updateShell();destroyMap();
      if(v==='autre-sport-velo')showBike();
      else if(v==='velo-v1-summary')showSummary();
      else showDetail();
      return;
    }
    if(ride?.status==='running')pause(); // Empêche la poursuite du GPS hors écran, même via l’en-tête général.
    destroyMap();document.body.classList.remove('bv1-active');
    const result=prevRender.apply(this,arguments);
    if(v==='marche-v1-history'||(v==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    return result;
  };
  // La carte Vélo du menu existant pointe encore vers un écran provisoire :
  // rediriger uniquement ce hotspot, sans modifier le module Autre sport validé.
  document.addEventListener('click',event=>{
    const target=event.target?.closest?.('.as1-c-bike');
    if(!target||state.view!=='autre-sport-choice')return;
    event.preventDefault();event.stopImmediatePropagation();
    state.view='autre-sport-velo';render();window.scrollTo?.(0,0);
  },true);
  // L’historique réaffiche directement son DOM lors d’un filtrage ou d’une suppression.
  // Raccrocher le lien Carte pour le Vélo après ces réaffichages sans modifier Marche.
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{
      if(state.view==='marche-v1-history'||(state.view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    }).observe(main,{childList:true});
  }
  document.addEventListener('visibilitychange',()=>{
    if(ride?.status==='running'&&document.visibilityState==='visible'){
      ride.note='Le GPS peut avoir été interrompu pendant le verrouillage. Vérifie la distance et le tracé après la sortie.';refresh();
    }
  });
  window.addEventListener('pagehide',()=>{persist();gpsStop();tickStop();sleep();});
  window.SportScreenAwake?.onChange(()=>refresh());
})();
