/* STUDIO AUTRE ACTIVITÉ V1 — 11/11/2026
   Activités personnalisées créées dans l'application, GPS facultatif,
   suivi au temps, distance facultative, carte et historique commun.
   Aucun appel serveur pour la sauvegarde : localStorage de cet appareil.
   Les photos ajoutées sont réduites avant stockage local. */
(function(){
  'use strict';
  const KEY='mb_activites_personnalisees_v1';
  const DRAFT='mb_custom_brouillon_v1';
  const HISTORY='mb_activites_sportives_v1';
  const VIEWS=['custom-studio-v1','custom-create-v1','custom-ready-v1','custom-summary-v1','custom-detail-v1'];
  const THEMES={
    montagne:{label:'Montagne',image:'./marche-paysage-v1.webp'},
    foret:{label:'Forêt',image:'./vtt-paysage-v2.webp'},
    nature:{label:'Nature',image:'./sport-card-marche-v5.webp'},
    mer:{label:'Mer / lac',image:'./sport-card-paddle-v5.webp'},
    route:{label:'Route',image:'./sport-card-velo-v5.webp'},
    salle:{label:'Salle',image:'./velo-appartement-hero-v1.webp'}
  };
  const COLORS={vert:'#34c74a',turquoise:'#09b6b7',bleu:'#168de8',orange:'#e48a2c',violet:'#b264e6',rose:'#d94e8b'};
  const ICONS=['🥾','🚶','🏃','🚴','🏊','🛶','🧘','🎾','🏸','🏋️','🏄','⭐'];
  const LEAF_JS='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
  const LEAF_CSS='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  const LEAF_JS_HASH='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  const LEAF_CSS_HASH='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  let activityId=null, editingId=null, formData=null, session=null, finished=null;
  let selectedSessionId=null, watchId=null, ticker=null, lastDraft=0;
  let map=null,mapToken=0,leafPromise=null;
  const $=s=>main.querySelector(s);
  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=x=>{const k=Number(x);return Number.isFinite(k)?k:0;};
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const round=(v,d=2)=>Number(Number(v).toFixed(d));
  const km=x=>Math.max(0,n(x)).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const clock=ms=>{const secs=Math.floor(Math.max(0,n(ms))/1000);return [Math.floor(secs/3600),Math.floor(secs/60)%60,secs%60].map(k=>String(k).padStart(2,'0')).join(':');};
  const dateLabel=iso=>{const d=new Date(iso);return Number.isFinite(d.getTime())?d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):'Date inconnue';};
  const read=(key,def)=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):def;}catch(_){return def;}};
  const write=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));return true;}catch(_){return false;}};
  const remove=key=>{try{localStorage.removeItem(key);}catch(_){}};
  const validatePhoto=x=>typeof x==='string'&&x.length<620000&&/^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(x)?x:'';
  const activityList=()=>{const a=read(KEY,[]);return Array.isArray(a)?a.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'):[];};
  const history=()=>{const a=read(HISTORY,[]);return Array.isArray(a)?a:[];};
  const getActivity=id=>activityList().find(a=>a.id===id)||null;
  function decorate(a){return {...a,theme:THEMES[a?.theme]?a.theme:'montagne',color:COLORS[a?.color]?a.color:'vert',icon:ICONS.includes(a?.icon)?a.icon:'🥾',photo:validatePhoto(a?.photo)};}
  function themeImg(a){const o=decorate(a);return o.photo||THEMES[o.theme].image;}
  function vars(a){const o=decorate(a),src=themeImg(o);return `--cp-photo:url('${src}');--cp-accent:${COLORS[o.color]};--cp-accent-dark:${COLORS[o.color]}`;}
  function footer(){return `<nav class="cp-footer" aria-label="Navigation"><button type="button" data-cp-nav="hub"><b>⌂</b>Accueil</button><button type="button" data-cp-nav="autre-sport-choice"><b>◇</b>Autre sport</button><button type="button" data-cp-nav="marche-v1-history"><b>▤</b>Historique</button></nav>`;}
  function head(title,description='',back='autre-sport-choice'){return `<header class="cp-top"><button type="button" class="cp-back" data-cp-nav="${esc(back)}" aria-label="Retour">←</button><div><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</div></header>`;}
  function shell(inner,style=''){document.body.classList.add('as1-active','cp-active');document.body.classList.remove('ml1-active','vt1-active','pd1-active');bottomNav.classList.add('hidden');main.innerHTML=`<section class="cp-screen" ${style?`style="${style}"`:''}>${inner}${footer()}</section>`;bindNav();}
  function bindNav(){main.querySelectorAll('[data-cp-nav]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.cpNav)));}
  function card(a,tag='button'){
    const o=decorate(a);
    return `<${tag} ${tag==='button'?'type="button"':''} class="cp-sport-card" style="${vars(o)}" ${tag==='button'?`data-cp-open="${esc(o.id)}"`:''}>
      <span class="cp-sport-icon" aria-hidden="true">${esc(o.icon)}</span><span class="cp-sport-title">${esc(o.name)}<small>${o.gps?'GPS et carte':'Sans GPS'} · ${o.distance?'Distance suivie':'Durée seule'}</small></span>${tag==='button'?'<span class="cp-sport-go" aria-hidden="true">›</span>':''}
    </${tag}>`;
  }
  function studio(){
    const list=activityList(); const draft=read(DRAFT,null);
    const customSessions=history().filter(s=>s&&typeof s.customActivityId==='string').slice(0,5);
    const blocks=list.map(a=>`${card(a)}<div class="cp-card-tools"><button class="cp-small-btn" data-cp-edit="${esc(a.id)}">Modifier</button><button class="cp-small-btn cp-danger" data-cp-delete="${esc(a.id)}">Supprimer</button></div>`).join('');
    shell(`${head('Autre activité','Ton studio de création, sans GitHub')}
    <div class="cp-content"><button type="button" class="cp-create-card" id="cpCreate"><span class="cp-create-icon">+</span><span><strong>Créer une nouvelle activité</strong><small>Nom, photo, GPS, distance et suivi sportif personnalisé</small></span></button>
    ${draft?.activityId&&getActivity(draft.activityId)?`<div class="cp-notice">Une séance a été conservée en pause. <button type="button" class="cp-small-btn" id="cpResumeDraft">La reprendre</button></div>`:''}
    <section class="cp-stack"><h2 class="cp-section-head">Mes activités personnalisées (${list.length})</h2>
      ${list.length?`<div class="cp-collection">${blocks}</div>`:'<div class="cp-panel"><p class="cp-intro">Aucune activité personnalisée pour le moment. Crée par exemple « Randonnée » avec le GPS et un fond montagne, ou « Yoga » sans GPS.</p></div>'}
    </section>
    ${customSessions.length?`<section class="cp-stack"><h2 class="cp-section-head">Dernières séances personnalisées</h2>${customSessions.map(s=>`<div class="cp-panel cp-stack"><div class="cp-history-row"><div><strong>${esc(s.sport||'Activité')}</strong><div class="cp-muted">${esc(dateLabel(s.startedAt))} · ${clock(n(s.durationSeconds)*1000)}${s.distanceEnabled?` · ${km(s.distanceKm)} km`:''}</div></div></div><button type="button" class="cp-history-open" data-cp-session="${esc(s.id)}">Détails${hasTrack(s.route)?' et carte du parcours':''}</button></div>`).join('')}</section>`:''}
    <div class="cp-notice">Tes activités et tes parcours sont enregistrés sur cet appareil. Pour l’instant, ils ne sont pas synchronisés entre téléphone, tablette et ordinateur. Évite d’effacer les données du site.</div></div>`);
    $('#cpCreate').addEventListener('click',()=>openForm());
    $('#cpResumeDraft')?.addEventListener('click',()=>{const d=read(DRAFT,null);if(d?.activityId){activityId=d.activityId;session=null;openActivity(activityId);}});
    main.querySelectorAll('[data-cp-open]').forEach(b=>b.addEventListener('click',()=>openActivity(b.dataset.cpOpen)));
    main.querySelectorAll('[data-cp-edit]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.cpEdit)));
    main.querySelectorAll('[data-cp-delete]').forEach(b=>b.addEventListener('click',()=>deleteActivity(b.dataset.cpDelete)));
    main.querySelectorAll('[data-cp-session]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.cpSession)));
  }
  function newForm(){return {name:'',gps:true,distance:true,theme:'montagne',color:'vert',icon:'🥾',photo:''};}
  function openForm(id=null){editingId=id;const old=id?getActivity(id):null;if(id&&!old){alert('Activité introuvable.');return;}
    formData=old?{...newForm(),...decorate(old)}:newForm();state.view='custom-create-v1';render();window.scrollTo?.(0,0);
  }
  function drawForm(){
    if(!formData)formData=newForm();const a=decorate(formData);
    shell(`${head(editingId?'Modifier une activité':'Créer une activité','Un sport personnalisé, prêt à être utilisé','custom-studio-v1')}
    <div class="cp-content"><form class="cp-form" id="cpForm" autocomplete="off">
      <label class="cp-label">Nom de l’activité<input type="text" class="cp-field" id="cpName" maxlength="42" placeholder="Ex. Randonnée, Kayak, Yoga..." required value="${esc(formData.name)}"></label>
      <div class="cp-panel"><h2>Fonctionnement</h2>
        <label class="cp-toggle-row"><span class="cp-toggle-copy"><strong>Suivi GPS et carte</strong><small>Enregistrer le parcours réellement effectué, si le GPS est disponible.</small></span><input id="cpGps" class="cp-toggle" type="checkbox" ${formData.gps?'checked':''}></label>
        <label class="cp-toggle-row"><span class="cp-toggle-copy"><strong>Suivre la distance</strong><small>${formData.gps?'Kilomètres calculés par GPS et modifiables à la fin.':'Saisie des kilomètres à la fin de la séance.'}</small></span><input id="cpDistance" class="cp-toggle" type="checkbox" ${formData.distance?'checked':''}></label>
      </div>
      <div class="cp-panel cp-stack"><h2>Choisir ton visuel</h2><div class="cp-themes">${Object.entries(THEMES).map(([id,t])=>`<button type="button" class="cp-theme-choice" data-cp-theme="${id}" style="--cp-photo:url('${t.image}')" aria-pressed="${formData.theme===id}">${esc(t.label)}</button>`).join('')}</div>
        <h3>Couleur</h3><div class="cp-colors">${Object.entries(COLORS).map(([id,color])=>`<button type="button" class="cp-color-choice" data-cp-color="${id}" style="--cp-choice:${color}" aria-label="Couleur ${id}" aria-pressed="${formData.color===id}">${formData.color===id?'✓':''}</button>`).join('')}</div>
        <h3>Icône</h3><div class="cp-icons">${ICONS.map(icon=>`<button type="button" class="cp-icon-choice" data-cp-icon="${esc(icon)}" aria-label="Icône ${esc(icon)}" aria-pressed="${formData.icon===icon}">${esc(icon)}</button>`).join('')}</div>
        <label class="cp-label">Ou utiliser ta propre photo<input class="cp-upload" type="file" accept="image/jpeg,image/png,image/webp" id="cpPhoto"><span class="cp-help">L’image sera recadrée et allégée sur ton téléphone avant enregistrement. Elle restera locale.</span></label>
        ${formData.photo?'<button type="button" class="cp-small-btn" id="cpRemovePhoto">Retirer ma photo</button>':''}
      </div>
      <div class="cp-preview-wrap"><div class="cp-preview-title">Aperçu du bandeau</div><div id="cpPreview">${card({...a,name:a.name||'Nouvelle activité'},'div')}</div></div>
      <button type="submit" class="cp-button">✓ ${editingId?'Enregistrer les modifications':'Créer mon activité'}</button>
      <p class="cp-note">Tu pourras modifier le nom, la couleur, l’image et les options plus tard. Les sorties déjà enregistrées resteront dans l’historique.</p>
    </form></div>`);
    $('#cpName').addEventListener('input',ev=>{formData.name=ev.target.value;preview();});
    $('#cpGps').addEventListener('change',ev=>{formData.gps=ev.target.checked;drawForm();});
    $('#cpDistance').addEventListener('change',ev=>{formData.distance=ev.target.checked;drawForm();});
    main.querySelectorAll('[data-cp-theme]').forEach(b=>b.addEventListener('click',()=>{formData.theme=b.dataset.cpTheme;formData.photo='';drawForm();}));
    main.querySelectorAll('[data-cp-color]').forEach(b=>b.addEventListener('click',()=>{formData.color=b.dataset.cpColor;drawForm();}));
    main.querySelectorAll('[data-cp-icon]').forEach(b=>b.addEventListener('click',()=>{formData.icon=b.dataset.cpIcon;drawForm();}));
    $('#cpRemovePhoto')?.addEventListener('click',()=>{formData.photo='';drawForm();});
    $('#cpPhoto').addEventListener('change',async ev=>{
      const file=ev.target.files?.[0];if(!file)return;
      if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>9000000){alert('Choisis une image JPG, PNG ou WebP de moins de 9 Mo.');ev.target.value='';return;}
      try{const photo=await resizePhoto(file);formData.photo=photo;preview();}
      catch(_){alert('Impossible de lire cette photo. Choisis une autre image.');}
    });
    $('#cpForm').addEventListener('submit',saveForm);
  }
  function preview(){const e=$('#cpPreview');if(e)e.innerHTML=card({...formData,name:formData.name.trim()||'Nouvelle activité'},'div');}
  async function resizePhoto(file){
    const obj=URL.createObjectURL(file);
    try{return await new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>{
        try{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
          if(!ctx)throw new Error('Canvas indisponible');
          canvas.width=900;canvas.height=420;
          const zoom=Math.max(900/image.naturalWidth,420/image.naturalHeight);
          const w=image.naturalWidth*zoom,h=image.naturalHeight*zoom;
          ctx.drawImage(image,(900-w)/2,(420-h)/2,w,h);
          let result=canvas.toDataURL('image/webp',.72);
          if(result.length>500000)result=canvas.toDataURL('image/jpeg',.56);
          if(!validatePhoto(result))throw new Error('Photo trop volumineuse');
          resolve(result);
        }catch(e){reject(e);}
      };image.onerror=()=>reject(new Error('Image illisible'));image.src=obj;
    });}finally{URL.revokeObjectURL(obj);}
  }
  function saveForm(event){
    event.preventDefault();const name=formData.name.trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>42){alert('Choisis un nom de 2 à 42 caractères.');return;}
    const list=activityList();
    if(list.some(x=>x.id!==editingId&&x.name.toLocaleLowerCase('fr-FR')===name.toLocaleLowerCase('fr-FR'))){alert('Une activité porte déjà ce nom.');return;}
    const id=editingId||'cp-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
    const data={id,name,gps:!!formData.gps,distance:!!formData.distance,theme:formData.theme,color:formData.color,icon:formData.icon,photo:validatePhoto(formData.photo),createdAt:formData.createdAt||new Date().toISOString()};
    const updated=editingId?list.map(x=>x.id===editingId?data:x):[...list,data];
    if(!write(KEY,updated)){alert('Sauvegarde impossible : espace de stockage local insuffisant. Essaie sans photo personnelle.');return;}
    activityId=id;editingId=null;formData=null;state.view='custom-studio-v1';render();window.scrollTo?.(0,0);
  }
  function deleteActivity(id){
    const a=getActivity(id);if(!a)return;
    if(read(DRAFT,null)?.activityId===id){alert('Cette activité possède une séance en cours ou en pause. Termine ou abandonne la séance avant de supprimer cette activité.');return;}
    if(!confirm(`Supprimer « ${a.name} » de tes activités ? Les anciennes séances resteront dans l’historique.`))return;
    if(!write(KEY,activityList().filter(x=>x.id!==id))){alert('Suppression impossible.');return;}
    studio();
  }
  const elapsed=()=>!session?0:n(session.elapsedMs)+(session.status==='running'?Math.max(0,Date.now()-session.since):0);
  const awake=()=>window.SportScreenAwake?.start();
  const sleep=()=>window.SportScreenAwake?.stop();
  function gpsStop(){if(watchId!=null&&navigator.geolocation){try{navigator.geolocation.clearWatch(watchId);}catch(_){}}watchId=null;}
  function stopTicker(){if(ticker!=null)clearInterval(ticker);ticker=null;}
  function persist(){if(!session||!['running','paused'].includes(session.status))return;const snapshot={...session,status:'paused',elapsedMs:elapsed(),since:null,last:null,currentSpeed:0};write(DRAFT,snapshot);}
  function restore(){
    if(session)return;
    const d=read(DRAFT,null);
    if(d?.activityId===activityId&&['paused','running'].includes(d.status))session={...d,status:'paused',elapsedMs:n(d.elapsedMs),since:null,last:null,currentSpeed:0,gpsStatus:'paused',gpsNote:'Séance restaurée en pause. Appuie sur Reprendre.'};
  }
  function haversine(a,b){const phi1=a.lat*Math.PI/180,phi2=b.lat*Math.PI/180,dp=(b.lat-a.lat)*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180;const q=Math.sin(dp/2)**2+Math.cos(phi1)*Math.cos(phi2)*Math.sin(dl/2)**2;return 12742000*Math.asin(Math.min(1,Math.sqrt(q)));}
  function gpsPosition(p){
    if(session?.status!=='running')return;
    const c=p.coords,t=p.timestamp||Date.now(),lat=Number(c.latitude),lon=Number(c.longitude),accuracy=Number(c.accuracy);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(accuracy))return;
    if(accuracy>45){session.gpsStatus='weak';session.gpsNote='Signal GPS trop imprécis : point ignoré (±'+Math.round(accuracy)+' m).';updateRun();return;}
    const point={lat,lon,t,accuracy};
    if(session.last){
      const seconds=(t-session.last.t)/1000,meters=haversine(session.last,point);
      if(seconds<=0)return;
      if(seconds>45){if(session.route.length&&session.route.at(-1)!==null)session.route.push(null);session.currentSpeed=0;session.gpsNote='GPS récupéré après une interruption. Vérifie la distance finale.';}
      else{
        const threshold=Math.max(4,Math.min(17,(accuracy+session.last.accuracy)*.34));
        if(meters<threshold)return;
        if(meters/seconds>30){session.gpsStatus='weak';session.gpsNote='Saut GPS écarté (vitesse incohérente).';updateRun();return;}
        session.meters+=meters;session.currentSpeed=round(meters/seconds*3.6,1);
      }
    }
    session.last=point;session.gpsStatus='ok';
    if(!session.gpsNote.includes('interruption'))session.gpsNote=`Signal reçu : précision ±${Math.round(accuracy)} m. Distance GPS indicative.`;
    session.route.push([round(lat,6),round(lon,6)]);
    if(session.route.length>1600){const old=session.route;session.route=old.filter((x,i)=>x===null||i%2===0||i===old.length-1);}
    updateRun();
  }
  function gpsError(e){if(session?.status!=='running')return;session.gpsStatus='error';session.gpsNote=e?.code===1?'GPS refusé. Autorise la localisation ou renseigne les kilomètres à la fin.':e?.code===2?'Position GPS indisponible, saisie manuelle possible.':e?.code===3?'Recherche GPS trop longue. Essaye en extérieur.':'GPS indisponible.';updateRun();}
  function gpsStart(){
    gpsStop();if(!session||!getActivity(activityId)?.gps)return;
    if(!window.isSecureContext||!navigator.geolocation){session.gpsStatus='error';session.gpsNote='Le GPS nécessite HTTPS et un navigateur compatible.';updateRun();return;}
    session.gpsStatus='search';session.gpsNote='Recherche du signal GPS…';
    try{watchId=navigator.geolocation.watchPosition(gpsPosition,gpsError,{enableHighAccuracy:true,maximumAge:0,timeout:18000});}
    catch(_){session.gpsStatus='error';session.gpsNote='Impossible de démarrer le GPS.';}
    updateRun();
  }
  function begin(){
    const a=getActivity(activityId);if(!a)return;
    if(!session||session.status==='finished'){
      session={status:'paused',activityId:a.id,startedAt:new Date().toISOString(),elapsedMs:0,since:null,meters:0,route:[],last:null,currentSpeed:0,gpsStatus:'paused',gpsNote:'GPS demandé au démarrage.'};
    }
    if(session.status==='running')return;
    session.status='running';session.since=Date.now();session.last=null;session.currentSpeed=0;
    awake();if(!ticker)ticker=setInterval(()=>{updateRun();if(Date.now()-lastDraft>4000){persist();lastDraft=Date.now();}},650);
    if(a.gps)gpsStart();else{session.gpsStatus='off';session.gpsNote='Suivi sans GPS.';}
    updateRun();
  }
  function pause(silent=false){
    if(session?.status!=='running')return;
    session.elapsedMs=elapsed();session.since=null;session.status='paused';session.last=null;session.currentSpeed=0;
    if(session.route?.length&&session.route.at(-1)!==null)session.route.push(null);
    session.gpsStatus='paused';session.gpsNote='Séance en pause. Reprends pour relancer le chronomètre et le GPS.';
    gpsStop();stopTicker();sleep();persist();if(!silent)updateRun();
  }
  function finish(){
    if(!session||!['running','paused'].includes(session.status))return;
    if(session.status==='running')session.elapsedMs=elapsed();
    session.since=null;session.status='finished';session.endedAt=new Date().toISOString();
    gpsStop();stopTicker();sleep();finished={...session,route:session.route.slice()};remove(DRAFT);
    state.view='custom-summary-v1';render();window.scrollTo?.(0,0);
  }
  function reset(){
    if(session&&elapsed()>0&&!confirm('Effacer cette séance en cours ?'))return;
    gpsStop();stopTicker();sleep();remove(DRAFT);session=null;finished=null;state.view='custom-ready-v1';render();
  }
  function openActivity(id){
    if(!getActivity(id)){alert('Cette activité n’existe plus.');return;}
    const d=read(DRAFT,null);
    if(d?.activityId&&d.activityId!==id){alert('Une autre activité est restée en pause. Reprends-la ou abandonne-la avant de commencer celle-ci.');return;}
    if(session?.activityId!==id)session=null;activityId=id;
    state.view='custom-ready-v1';render();window.scrollTo?.(0,0);
  }
  function hero(a){return `<header class="cp-hero" style="${vars(a)}"><button type="button" class="cp-back" data-cp-nav="custom-studio-v1" aria-label="Retour à mes activités">←</button><div class="cp-hero-copy"><span class="cp-sport-icon">${esc(decorate(a).icon)}</span><div><h1>${esc(a.name)}</h1><small>${a.gps?'Suivi GPS et parcours sur carte':'Activité sans GPS'} · ${a.distance?'Distance activée':'Suivi au temps'}</small></div></div></header>`;}
  function runScreen(){
    const a=getActivity(activityId);if(!a){go('custom-studio-v1');return;}
    restore();
    shell(`${hero(a)}<div class="cp-content"><div class="cp-gps-label" id="cpGpsStatus">${a.gps?'GPS inactif · Autorisation demandée au démarrage':'Mode sans GPS'}</div>
       <section class="cp-stats" aria-label="Mesures de la séance">
         <div class="cp-stat"><small>Durée</small><strong id="cpTime">00:00:00</strong></div>
         ${a.distance?`<div class="cp-stat"><small>Distance ${a.gps?'GPS estimée':'à saisir'}</small><strong id="cpKm">0,00 km</strong></div>`:''}
         ${a.gps?`<div class="cp-stat"><small>Vitesse actuelle</small><strong id="cpCurrentSpeed">— km/h</strong></div>`:''}
         ${a.gps&&a.distance?`<div class="cp-stat"><small>Vitesse moyenne</small><strong id="cpAvgSpeed">— km/h</strong></div>`:''}
       </section>
       <p class="cp-note" id="cpGpsNote">${a.gps?'Le GPS sera demandé au démarrage de la séance.':'La distance éventuelle sera renseignée après la séance.'}</p>
       <button class="cp-button" type="button" id="cpStart">▶ <span>Démarrer</span></button>
       <div class="cp-row-buttons"><button class="cp-button cp-button-secondary" type="button" id="cpPause">Ⅱ Pause</button><button class="cp-button cp-button-secondary" type="button" id="cpFinish">■ Terminer</button></div>
       <div class="cp-panel cp-stack"><h2>Suivi de la séance</h2><p class="cp-intro">${a.gps?'Le GPS enregistre ton parcours à l’extérieur. La carte sera disponible à la fin puis dans l’historique. Garde le téléphone visible : le GPS web peut s’interrompre écran verrouillé.':'Cette activité fonctionne uniquement avec le chronomètre et les informations que tu souhaites enregistrer.'}</p>
       <button type="button" class="cp-small-btn" id="cpReset">Réinitialiser la séance</button></div>
       <div class="cp-notice">Les mesures GPS sont indicatives. Le mode d’économie d’énergie et le verrouillage de l’écran peuvent interrompre le suivi.</div>
    </div>`,vars(a));
    $('#cpStart').addEventListener('click',begin);$('#cpPause').addEventListener('click',()=>pause());$('#cpFinish').addEventListener('click',finish);$('#cpReset').addEventListener('click',reset);
    updateRun();
  }
  function updateRun(){
    if(!$('#cpTime'))return;
    const a=getActivity(activityId),ms=elapsed(),meters=n(session?.meters);
    $('#cpTime').textContent=clock(ms);
    if($('#cpKm'))$('#cpKm').textContent=km(meters/1000)+' km';
    if($('#cpAvgSpeed'))$('#cpAvgSpeed').textContent=ms&&meters?km(meters/1000/(ms/3600000))+' km/h':'— km/h';
    if($('#cpCurrentSpeed'))$('#cpCurrentSpeed').textContent=session?.status==='running'&&n(session?.currentSpeed)>0&&Date.now()-n(session.last?.t)<13000?km(session.currentSpeed)+' km/h':'— km/h';
    if($('#cpGpsStatus'))$('#cpGpsStatus').textContent=!a?.gps?'Sans GPS · Enregistrement de la durée':({search:'Recherche du GPS…',ok:'GPS actif',weak:'Signal GPS faible',error:'GPS indisponible',paused:'GPS en pause',off:'GPS inactif'})[session?.gpsStatus]||'GPS inactif';
    if($('#cpGpsNote'))$('#cpGpsNote').textContent=a?.gps?(session?.gpsNote||'Le GPS sera demandé au démarrage.'):'La durée est mesurée automatiquement. Distance à saisir à la fin si activée.';
    const status=session?.status||'idle';
    $('#cpStart').disabled=status==='running';$('#cpStart').querySelector('span').textContent=status==='paused'?'Reprendre':'Démarrer';
    $('#cpPause').disabled=status!=='running';$('#cpFinish').disabled=!['running','paused'].includes(status);
  }
  function segmentsOf(route){
    if(!Array.isArray(route))return [];
    let part=[],parts=[];const push=()=>{if(part.length){parts.push(part);part=[];}};
    for(const p of route.slice(0,2300)){
      if(!p){push();continue;}
      const lat=Array.isArray(p)?Number(p[0]):Number(p.lat),lon=Array.isArray(p)?Number(p[1]):Number(p.lon??p.lng);
      if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180){push();continue;}
      part.push([lat,lon]);
    }
    push();return parts;
  }
  const hasTrack=route=>segmentsOf(route).some(p=>p.length>=2);
  function destroyMap(){mapToken++;if(map){try{map.remove();}catch(_){}}map=null;}
  function loadLeaflet(){
    if(window.L&&typeof window.L.map==='function')return Promise.resolve(window.L);
    if(leafPromise)return leafPromise;
    leafPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href=LEAF_CSS;css.crossOrigin='anonymous';css.integrity=LEAF_CSS_HASH;document.head.appendChild(css);
      const script=document.createElement('script');script.src=LEAF_JS;script.async=true;script.crossOrigin='anonymous';script.integrity=LEAF_JS_HASH;
      let done=false;const close=e=>{if(done)return;done=true;clearTimeout(timeout);if(e){script.remove();css.remove();leafPromise=null;reject(e);}else if(window.L?.map)resolve(window.L);else{leafPromise=null;reject(new Error('Carte indisponible'));}};
      const timeout=setTimeout(()=>close(new Error('Carte trop longue à charger')),12000);
      script.addEventListener('load',()=>close(null),{once:true});script.addEventListener('error',()=>close(new Error('Chargement de la carte impossible')),{once:true});document.head.appendChild(script);
    });return leafPromise;
  }
  function drawFallback(elem,parts){
    const all=parts.flat();if(all.length<2)return;
    const project=([lat,lon])=>[lon,Math.log(Math.tan(Math.PI/4+clamp(lat,-85,85)*Math.PI/360))*180/Math.PI];
    const pts=all.map(project),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min(550/Math.max(.00005,maxX-minX),270/Math.max(.00005,maxY-minY)),cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const xy=p=>{const [x,y]=project(p);return `${(320+(x-cx)*scale).toFixed(1)},${(170-(y-cy)*scale).toFixed(1)}`;};
    const first=xy(all[0]).split(','),last=xy(all.at(-1)).split(',');
    elem.innerHTML=`<svg viewBox="0 0 640 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tracé GPS sans fond de carte"><rect width="640" height="340" fill="#eaf2ed"/><path d="M0 80H640M0 160H640M0 240H640M150 0V340M300 0V340M450 0V340" stroke="#cce0d8"/>${parts.filter(p=>p.length>1).map(p=>`<polyline points="${p.map(xy).join(' ')}" fill="none" stroke="#00a4b8" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}<circle cx="${first[0]}" cy="${first[1]}" r="9" fill="#1ca84d" stroke="white" stroke-width="3"/><circle cx="${last[0]}" cy="${last[1]}" r="9" fill="#ef8423" stroke="white" stroke-width="3"/></svg>`;
  }
  function paintMap(route){
    destroyMap();const token=mapToken,elem=$('#cpMap'),note=$('#cpMapNote'),parts=segmentsOf(route),pts=parts.flat();
    if(!elem||!hasTrack(route))return;
    loadLeaflet().then(L=>{
      if(token!==mapToken||!$('#cpMap'))return;
      elem.replaceChildren();const m=L.map(elem,{scrollWheelZoom:false,preferCanvas:true});map=m;
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">contributeurs OpenStreetMap</a>'}).addTo(m);
      tiles.on('tileerror',()=>{if(note)note.textContent='Fond de carte indisponible : le tracé GPS reste affiché.';});
      parts.filter(p=>p.length>1).forEach(p=>L.polyline(p,{color:'#16b7b5',weight:5,opacity:1}).addTo(m));
      L.circleMarker(pts[0],{radius:9,color:'#fff',weight:3,fillColor:'#149b4d',fillOpacity:1}).bindPopup('Départ').addTo(m);
      L.circleMarker(pts.at(-1),{radius:9,color:'#fff',weight:3,fillColor:'#ee8b2d',fillOpacity:1}).bindPopup('Arrivée').addTo(m);
      m.fitBounds(L.latLngBounds(pts),{padding:[25,25],maxZoom:16});
      if(note)note.textContent='Trace GPS enregistrée. Tu peux déplacer et zoomer la carte.';
      setTimeout(()=>{if(token===mapToken&&map===m)m.invalidateSize();},180);
    }).catch(()=>{
      if(token!==mapToken||!$('#cpMap'))return;
      drawFallback(elem,parts);if(note)note.textContent='Fond de carte hors ligne : forme du trajet GPS affichée.';
    });
  }
  function mapBlock(route){return hasTrack(route)?`<div class="cp-panel cp-stack"><h2 class="cp-card-title">Carte du parcours</h2><div class="cp-map" id="cpMap"><div class="cp-map-loading">Chargement de la carte…</div></div><div class="cp-map-legend"><span><i style="background:#149b4d"></i>Départ</span><span><i style="background:#ee8b2d"></i>Arrivée</span></div><p class="cp-mapsummary" id="cpMapNote">Le tracé est enregistré sur cet appareil. Le fond OpenStreetMap nécessite Internet.</p></div>`:
    '<div class="cp-notice">Aucun tracé GPS exploitable n’a été enregistré. La carte n’est pas inventée. Tu peux néanmoins saisir la distance manuellement si cette option est activée.</div>';}
  function summary(){
    if(!finished){go('custom-studio-v1');return;}
    const a=getActivity(finished.activityId);if(!a){go('custom-studio-v1');return;}
    const seconds=Math.floor(finished.elapsedMs/1000),estimated=round(n(finished.meters)/1000,2);
    shell(`${head('Séance terminée',a.name,'custom-ready-v1')}
      <div class="cp-content"><div class="cp-end-status"><strong>✓ Séance terminée</strong><div class="cp-muted">Vérifie les informations avant de les enregistrer.</div></div>
      <div class="cp-panel cp-stack"><div class="cp-summary-kv"><span>Activité</span><strong>${esc(a.name)}</strong></div><div class="cp-summary-kv"><span>Durée active</span><strong>${clock(finished.elapsedMs)}</strong></div>
      ${a.distance?`<div class="cp-summary-kv"><span>Distance ${a.gps?'GPS estimée':'manuelle'}</span><strong>${km(estimated)} km</strong></div>
      <label class="cp-label">${a.gps?'Voulez-vous modifier la distance ?':'Distance parcourue (km)'}<input class="cp-field" id="cpFinalDistance" type="text" inputmode="decimal" value="${a.gps?estimated.toFixed(2):''}" placeholder="Ex. 10,20"><span class="cp-help">${a.gps?'Si tu conserves cette valeur, laisse-la telle quelle. Le parcours GPS restera enregistré même si tu la corriges.':'Laisse ce champ vide si la distance ne s’applique pas.'}</span></label>`:''}
      ${a.distance?`<div class="cp-summary-kv"><span>Vitesse moyenne</span><strong id="cpFinalSpeed">${seconds&&estimated?km(estimated/(seconds/3600))+' km/h':'—'}</strong></div>`:''}
      <label class="cp-label">Calories (facultatif)<input class="cp-field" id="cpCalories" type="number" min="0" max="10000" step="1" inputmode="numeric" placeholder="Valeur affichée par une montre ou un appareil"><span class="cp-help">Aucune calorie n’est inventée automatiquement.</span></label>
      <label class="cp-label">Commentaire (facultatif)<textarea class="cp-textarea" id="cpComment" maxlength="350" placeholder="Terrain, ressenti, conditions... "></textarea></label>
      </div>
      ${a.gps?mapBlock(finished.route):''}
      <button type="button" class="cp-button" id="cpSaveSession">✓ Enregistrer la séance</button>
      <button type="button" class="cp-button cp-button-secondary" id="cpContinue">Revenir à la séance</button>
      <button type="button" class="cp-small-btn cp-danger" id="cpAbandon">Abandonner sans enregistrer</button>
      <div class="cp-notice">Les données restent sur ce navigateur. Ne supprime pas les données du site avant d’avoir mis en place une sauvegarde.</div></div>`,vars(a));
    if($('#cpFinalDistance'))$('#cpFinalDistance').addEventListener('input',()=>{const raw=$('#cpFinalDistance').value.trim(),val=Number(raw.replace(',','.'));const speed=$('#cpFinalSpeed');if(speed)speed.textContent=raw!==''&&Number.isFinite(val)&&val>0&&seconds?km(val/(seconds/3600))+' km/h':'—';});
    $('#cpSaveSession').addEventListener('click',saveSession);
    $('#cpContinue').addEventListener('click',()=>{session={...finished,status:'paused',since:null,last:null,currentSpeed:0,gpsStatus:'paused',gpsNote:'Séance reprise en pause.'};finished=null;persist();state.view='custom-ready-v1';render();});
    $('#cpAbandon').addEventListener('click',()=>{if(!confirm('Abandonner cette séance sans l’enregistrer ?'))return;finished=null;session=null;remove(DRAFT);state.view='custom-studio-v1';render();});
    if(a.gps&&hasTrack(finished.route))paintMap(finished.route);
  }
  function saveSession(){
    if(!finished)return;
    const a=getActivity(finished.activityId);if(!a)return;
    let distance=0;
    if(a.distance){const raw=$('#cpFinalDistance').value.trim().replace(',','.');distance=raw===''?0:Number(raw);if(!Number.isFinite(distance)||distance<0||distance>3000){alert('Indique une distance entre 0 et 3000 km, ou laisse le champ vide.');return;}}
    const cRaw=$('#cpCalories').value.trim(),calories=cRaw===''?null:Number(cRaw);
    if(calories!==null&&(!Number.isFinite(calories)||calories<0||calories>10000)){alert('Vérifie la valeur des calories (0 à 10 000).');return;}
    const secs=Math.floor(n(finished.elapsedMs)/1000),gpsKm=n(finished.meters)/1000;
    const manual=a.distance&&(!a.gps||Math.abs(distance-gpsKm)>.02||!hasTrack(finished.route));
    const item={id:'sportperso-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),type:'sport',category:'autre-sport',sport:a.name,customActivityId:a.id,
      customTheme:a.theme,customColor:a.color,customIcon:a.icon,startedAt:finished.startedAt,endedAt:finished.endedAt||new Date().toISOString(),durationSeconds:secs,
      distanceEnabled:!!a.distance,distanceKm:a.distance?round(distance,2):0,distanceSource:!a.distance?'non-applicable':manual?'manuel':'gps',
      averageSpeedKmh:a.distance&&secs?round(distance/(secs/3600),2):0,
      gpsEnabled:!!a.gps,route:a.gps?(finished.route||[]).slice():[],calories:calories==null?null:round(calories,0),comment:$('#cpComment').value.trim(),createdAt:new Date().toISOString()};
    const all=history();all.unshift(item);
    if(!write(HISTORY,all)){alert('La sauvegarde a échoué. Vérifie l’espace de stockage local disponible.');return;}
    finished=null;session=null;remove(DRAFT);state.view='marche-v1-history';render();window.scrollTo?.(0,0);
  }
  function openDetail(id){selectedSessionId=id;state.view='custom-detail-v1';render();window.scrollTo?.(0,0);}
  function detail(){
    const s=history().find(x=>x&&String(x.id)===String(selectedSessionId)&&typeof x.customActivityId==='string');
    if(!s){go('marche-v1-history');return;}
    const a=getActivity(s.customActivityId)||{name:s.sport||'Activité',gps:!!s.gpsEnabled,distance:!!s.distanceEnabled,theme:s.customTheme||'montagne',color:s.customColor||'vert',icon:s.customIcon||'🥾'};
    shell(`${head('Détails de la séance',dateLabel(s.startedAt),'marche-v1-history')}<div class="cp-content">
    ${card({...a,name:s.sport||a.name},'div')}
    <div class="cp-panel"><div class="cp-summary-kv"><span>Date</span><strong>${esc(dateLabel(s.startedAt))}</strong></div>
    <div class="cp-summary-kv"><span>Durée</span><strong>${clock(n(s.durationSeconds)*1000)}</strong></div>
    ${s.distanceEnabled?`<div class="cp-summary-kv"><span>Distance</span><strong>${km(s.distanceKm)} km</strong></div><div class="cp-summary-kv"><span>Vitesse moyenne</span><strong>${n(s.averageSpeedKmh)?km(s.averageSpeedKmh)+' km/h':'—'}</strong></div>`:''}
    ${s.calories!=null?`<div class="cp-summary-kv"><span>Calories renseignées</span><strong>${Math.round(n(s.calories))} kcal</strong></div>`:''}
    ${s.distanceSource==='manuel'?'<p class="cp-inline-notice">Distance renseignée ou corrigée manuellement.</p>':''}</div>
    ${s.gpsEnabled?mapBlock(s.route):''}
    ${s.comment?`<div class="cp-panel"><h2>Commentaire</h2><p class="cp-intro" style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(s.comment)}</p></div>`:''}
    <button class="cp-button cp-button-secondary" type="button" id="cpBackHistory">← Retour à l’historique</button>
    <p class="cp-note">GPS conservé localement. Le fond de carte est chargé depuis OpenStreetMap lorsque tu l’ouvres.</p>
    </div>`,vars(a));
    $('#cpBackHistory').addEventListener('click',()=>go('marche-v1-history'));
    if(s.gpsEnabled&&hasTrack(s.route))paintMap(s.route);
  }
  function enhanceHistory(){
    const list=$('.ml1-history-list');if(!list)return;
    const byId=new Map(history().filter(x=>x&&x.customActivityId).map(x=>[String(x.id),x]));
    list.querySelectorAll('.ml1-history-row').forEach(row=>{
      if(row.querySelector('.cp-history-open'))return;
      const del=row.querySelector('[data-ml-delete]'),item=del&&byId.get(String(del.dataset.mlDelete));if(!item)return;
      del.setAttribute('aria-label','Supprimer cette séance de '+String(item.sport||'sport'));
      // Le suivi commun historique affiche 0 km / GPS pour toutes les activités.
      // Les activités sans distance n'affichent pas une fausse mesure GPS.
      if(!item.distanceEnabled){
        const info=row.querySelectorAll(':scope > div')[1];
        const distance=info?.querySelector('strong'),source=info?.querySelector('small');
        if(distance)distance.textContent='Durée seule';
        if(source)source.textContent='Sans GPS / distance';
      }
      const btn=document.createElement('button');btn.type='button';btn.className='cp-history-open';btn.textContent=hasTrack(item.route)?'Voir la carte et les détails':'Consulter les détails';
      btn.addEventListener('click',()=>openDetail(String(item.id)));row.appendChild(btn);
    });
  }
  function go(view){
    if(finished&&state.view==='custom-summary-v1'&&view!=='custom-summary-v1'){
      if(!confirm('Cette séance n’est pas enregistrée. Quitter sans sauvegarder ?'))return;
      finished=null;session=null;remove(DRAFT);
    }
    if(session?.status==='running'&&view!=='custom-ready-v1'){
      if(!confirm('Séance en cours. La mettre en pause et quitter ?'))return;
      pause(true);
    }
    if(!VIEWS.includes(view)&&view!=='custom-ready-v1'){gpsStop();stopTicker();sleep();}
    destroyMap();state.view=view;state.selected=null;render();window.scrollTo?.(0,0);
  }
  const priorRender=render;
  render=function(){
    const view=state.view;
    if(VIEWS.includes(view)){
      updateShell();destroyMap();
      if(view==='custom-studio-v1')studio();
      else if(view==='custom-create-v1')drawForm();
      else if(view==='custom-ready-v1')runScreen();
      else if(view==='custom-summary-v1')summary();
      else if(view==='custom-detail-v1')detail();
      return;
    }
    if(session?.status==='running')pause(true);
    if(map)destroyMap();document.body.classList.remove('cp-active');
    const out=priorRender.apply(this,arguments);
    if(view==='marche-v1-history'||(view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
    return out;
  };
  // On n'altère pas les images et hotspots des sports validés.
  // On redirige uniquement la carte "Autre activité" vers le studio.
  document.addEventListener('click',event=>{
    const btn=event.target?.closest?.('.as1-c-custom');
    if(!btn||state.view!=='autre-sport-choice')return;
    event.preventDefault();event.stopImmediatePropagation();go('custom-studio-v1');
  },true);
  if(typeof MutationObserver!=='undefined')new MutationObserver(()=>{
    if(state.view==='marche-v1-history'||(state.view==='autre-sport-section'&&state.as1Section==='history'))enhanceHistory();
  }).observe(main,{childList:true});
  document.addEventListener('visibilitychange',()=>{
    if(session?.status==='running'&&document.visibilityState==='visible'){
      session.gpsNote='Le GPS peut avoir été interrompu en arrière-plan. Vérifie la distance avant d’enregistrer.';updateRun();
    }
  });
  window.addEventListener('pagehide',()=>{persist();gpsStop();stopTicker();sleep();});
  window.SportScreenAwake?.onChange(()=>updateRun());
})();
