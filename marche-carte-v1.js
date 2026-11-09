/* MARCHE — CARTE GPS V1 (09/11/2026)
   Extension non intrusive : reutilise uniquement les points GPS deja stockes dans
   mb_activites_sportives_v1 ; ne modifie pas le suivi GPS, les pauses ni les autres sports.
   Carte Leaflet 1.9.4 chargee uniquement a l'ouverture d'un parcours.
*/
(function(){
  'use strict';
  const STORAGE='mb_activites_sportives_v1';
  const SCRIPT='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  const STYLES='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  const JS_HASH='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  const CSS_HASH='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  let selectedId=null, activeMap=null, token=0, leafletPromise=null;
  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asNum=x=>Number.isFinite(Number(x))?Number(x):0;
  const formatKm=x=>Math.max(0,asNum(x)).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const clock=secs=>{
    const total=Math.max(0,Math.floor(asNum(secs)));
    return `${String(Math.floor(total/3600)).padStart(2,'0')}:${String(Math.floor(total/60)%60).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  };
  const pace=x=>{
    const km=asNum(x.distanceKm),secs=asNum(x.durationSeconds);
    if(km<=0 || secs<=0)return '—';
    const secondsPerKm=Math.round(secs/km);
    return `${Math.floor(secondsPerKm/60)}′${String(secondsPerKm%60).padStart(2,'0')}″/km`;
  };
  const fmtDate=x=>{
    const d=new Date(x.startedAt||x.createdAt||x.endedAt);
    return Number.isFinite(d.getTime())?d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'Date inconnue';
  };
  function allSessions(){
    try{const result=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(result)?result:[];}
    catch(_){return [];}
  }
  function segmentsOf(route){
    if(!Array.isArray(route))return [];
    const result=[];let segment=[];
    const push=()=>{if(segment.length)result.push(segment);segment=[];};
    for(const p of route.slice(0,2000)){
      if(p==null){push();continue;}
      const lat=Array.isArray(p)?Number(p[0]):Number(p.lat);
      const lon=Array.isArray(p)?Number(p[1]):Number(p.lon??p.lng);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){push();continue;}
      segment.push([lat,lon]);
    }
    push();return result;
  }
  const flatten=arr=>arr.flatMap(a=>a);
  function cleanMap(){
    token++;
    if(activeMap){try{activeMap.remove();}catch(_){}}
    activeMap=null;
  }
  function navigate(view){
    cleanMap();selectedId=null;state.view=view;state.selected=null;render();
    window.scrollTo?.({top:0,behavior:'instant'});
  }
  function enhanceHistory(){
    const list=main.querySelector('.ml1-history-list');
    if(!list)return;
    const byId=new Map(allSessions().map(s=>[String(s.id),s]));
    list.querySelectorAll('.ml1-history-row').forEach(row=>{
      if(row.querySelector('.mc1-history-open'))return;
      const deleteButton=row.querySelector('[data-ml-delete]');
      const item=deleteButton&&byId.get(String(deleteButton.dataset.mlDelete));
      if(!item || String(item.sport||'').toLocaleLowerCase('fr-FR')!=='marche')return;
      const points=flatten(segmentsOf(item.route));
      const btn=document.createElement('button');
      btn.type='button';btn.className='mc1-history-open';
      btn.textContent=points.length>=2?'🗺️ Voir la carte du parcours':'Consulter les détails';
      btn.setAttribute('aria-label',points.length>=2?'Voir la carte de cette marche':'Consulter cette marche sans carte GPS');
      btn.addEventListener('click',()=>{
        selectedId=String(item.id);state.view='marche-carte-detail';state.selected=null;render();
        window.scrollTo?.({top:0,behavior:'instant'});
      });
      row.appendChild(btn);
    });
  }
  function loadLeaflet(){
    if(window.L&&typeof window.L.map==='function')return Promise.resolve(window.L);
    if(leafletPromise)return leafletPromise;
    leafletPromise=new Promise((resolve,reject)=>{
      let done=false;
      const css=document.createElement('link');
      css.rel='stylesheet';css.href=STYLES;css.integrity=CSS_HASH;css.crossOrigin='anonymous';css.dataset.mc1Leaflet='css';
      document.head.appendChild(css);
      const script=document.createElement('script');script.src=SCRIPT;script.async=true;
      script.integrity=JS_HASH;script.crossOrigin='anonymous';script.dataset.mc1Leaflet='js';
      const timeout=setTimeout(()=>fail(new Error('Chargement cartographique trop long')),12000);
      const ok=()=>{
        if(done)return;done=true;clearTimeout(timeout);
        if(window.L&&typeof window.L.map==='function')resolve(window.L);
        else reject(new Error('Bibliothèque cartographique indisponible'));
      };
      const fail=error=>{
        if(done)return;done=true;clearTimeout(timeout);
        script.remove();css.remove();leafletPromise=null;reject(error);
      };
      script.addEventListener('load',ok,{once:true});
      script.addEventListener('error',()=>fail(new Error('Chargement de la carte impossible')),{once:true});
      document.head.appendChild(script);
    });
    return leafletPromise;
  }
  function routeFallback(element,segments){
    const points=flatten(segments);if(points.length<2)return;
    // Aperçu géométrique local sans fond routier si l'accès aux tuiles est impossible.
    const project=([lat,lon])=>{
      const safeLat=Math.max(-85,Math.min(85,lat))*Math.PI/180;
      return [lon,Math.log(Math.tan(Math.PI/4+safeLat/2))*180/Math.PI];
    };
    const coords=points.map(project),xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
    const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
    const dx=Math.max(.00004,xmax-xmin),dy=Math.max(.00004,ymax-ymin);
    const scale=Math.min(560/dx,280/dy),cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;
    const xy=p=>{const [x,y]=project(p);return `${(320+(x-cx)*scale).toFixed(1)},${(170-(y-cy)*scale).toFixed(1)}`;};
    const polylines=segments.filter(s=>s.length>1).map(s=>`<polyline points="${s.map(xy).join(' ')}" fill="none" stroke="#00a6b8" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
    const start=xy(points[0]).split(','),end=xy(points[points.length-1]).split(',');
    element.innerHTML=`<div class="mc1-fallback" aria-label="Aperçu du tracé sans fond de carte">
      <svg viewBox="0 0 640 340" role="img" aria-label="Forme approximative du trajet enregistré" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="mc1Grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b7d2d2" stroke-width="1"/></pattern></defs>
        <rect width="640" height="340" fill="#e8f1ee"/><rect width="640" height="340" fill="url(#mc1Grid)"/>${polylines}
        <circle cx="${start[0]}" cy="${start[1]}" r="9" fill="#15a34a" stroke="white" stroke-width="4"/>
        <circle cx="${end[0]}" cy="${end[1]}" r="9" fill="#ed7b19" stroke="white" stroke-width="4"/>
        <text x="612" y="30" text-anchor="end" fill="#4a676a" font-size="21" font-weight="700">N ↑</text>
      </svg>
      <p>Tracé GPS disponible. Le fond de carte nécessite une connexion Internet.</p>
    </div>`;
  }
  function paintMap(segments,renderToken){
    const element=document.getElementById('mc1Map');
    const note=document.getElementById('mc1MapNote');
    if(!element)return;
    const points=flatten(segments);
    loadLeaflet().then(L=>{
      if(renderToken!==token||state.view!=='marche-carte-detail'||!document.getElementById('mc1Map'))return;
      element.replaceChildren();
      const map=L.map(element,{preferCanvas:true,scrollWheelZoom:false,zoomControl:true});
      activeMap=map;
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">contributeurs OpenStreetMap</a>'
      }).addTo(map);
      if(tiles&&typeof tiles.on==='function')tiles.on('tileerror',()=>{if(note)note.textContent='Fond de carte momentanément indisponible. Le tracé GPS reste visible.';});
      let feature;
      for(const s of segments){
        if(s.length>=2){const p=L.polyline(s,{color:'#00a6bb',weight:5,opacity:1,lineCap:'round',lineJoin:'round'}).addTo(map);feature=feature||p;}
      }
      const first=points[0],last=points[points.length-1];
      L.circleMarker(first,{radius:9,color:'#fff',weight:3,fillColor:'#179c4b',fillOpacity:1}).bindPopup('Départ').addTo(map);
      L.circleMarker(last,{radius:9,color:'#fff',weight:3,fillColor:'#f07f18',fillOpacity:1}).bindPopup('Arrivée').addTo(map);
      if(typeof L.control?.scale==='function')L.control.scale({imperial:false,metric:true,position:'bottomleft'}).addTo(map);
      const bounds=L.latLngBounds(points);
      if(bounds.isValid())map.fitBounds(bounds,{padding:[33,33],maxZoom:16});
      if(!feature)map.setView(first,15);
      window.setTimeout(()=>{if(renderToken===token&&activeMap===map)map.invalidateSize();},150);
      if(note)note.textContent='Tracé enregistré par le GPS. Tu peux zoomer et déplacer la carte.';
    }).catch(()=>{
      if(renderToken!==token||state.view!=='marche-carte-detail')return;
      routeFallback(element,segments);
      if(note)note.textContent='Fond de carte indisponible : aperçu local du trajet affiché.';
    });
  }
  function showDetail(){
    cleanMap();const renderToken=token;
    const item=allSessions().find(x=>String(x.id)===String(selectedId));
    if(!item){navigate('marche-v1-history');return;}
    const segments=segmentsOf(item.route),points=flatten(segments),hasRoute=points.length>=2;
    document.body.classList.add('as1-active','ml1-active');
    document.body.classList.remove('mm1-active');bottomNav.classList.add('hidden');
    main.innerHTML=`<section class="ml1-screen ml1-page mc1-screen" aria-label="Détail de marche et carte GPS">
      <header class="ml1-simple-header mc1-header">
        <button type="button" class="ml1-back" id="mc1Back" aria-label="Retour à l'historique">←</button>
        <div class="ml1-heading">Parcours de marche</div><p>${esc(fmtDate(item))}</p>
      </header>
      <div class="ml1-content mc1-content">
        <section class="mc1-stats" aria-label="Statistiques de la marche">
          <div><span>Distance</span><strong>${formatKm(item.distanceKm)} km</strong></div>
          <div><span>Durée</span><strong>${clock(item.durationSeconds)}</strong></div>
          <div><span>Allure moyenne</span><strong>${esc(pace(item))}</strong></div>
          <div><span>Vitesse moyenne</span><strong>${asNum(item.averageSpeedKmh)>0?formatKm(item.averageSpeedKmh)+' km/h':'—'}</strong></div>
        </section>
        <section class="mc1-card" aria-label="Carte du parcours">
          <div class="mc1-card-title"><h2>🗺️ Mon itinéraire</h2><span>${hasRoute?'GPS enregistré':'Sans tracé'}</span></div>
          ${hasRoute?`<div id="mc1Map" class="mc1-map" aria-label="Carte interactive de la marche"><div class="mc1-loading">Chargement de la carte…</div></div>
          <div class="mc1-legend"><span><i class="mc1-start"></i> Départ</span><span><i class="mc1-end"></i> Arrivée</span></div>
          <p class="mc1-note" id="mc1MapNote">Chargement du fond de carte…</p>`:
          `<div class="mc1-empty">Aucun parcours GPS n’est associé à cette séance.${item.distanceSource==='manuel'?' La distance a été enregistrée ou corrigée manuellement.':''}</div>`}
        </section>
        <p class="mc1-privacy">${item.distanceSource==='manuel'?'Distance manuelle ou corrigée. ':''}Le tracé est stocké sur cet appareil. L’affichage du fond de carte nécessite Internet et contacte le service de tuiles OpenStreetMap. En cas d’interruption du GPS (écran verrouillé, signal perdu), certaines portions peuvent être imprécises ou absentes.</p>
        <button type="button" class="mc1-return" id="mc1Return">← Retour à l’historique</button>
      </div>
    </section>`;
    main.querySelector('#mc1Back')?.addEventListener('click',()=>navigate('marche-v1-history'));
    main.querySelector('#mc1Return')?.addEventListener('click',()=>navigate('marche-v1-history'));
    if(hasRoute)paintMap(segments,renderToken);
  }
  const oldRender=render;
  render=function(){
    const view=state.view;
    if(view==='marche-carte-detail'){updateShell();return showDetail();}
    if(activeMap)cleanMap();
    const result=oldRender.apply(this,arguments);
    if(view==='marche-v1-history'||(view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    return result;
  };
})();
