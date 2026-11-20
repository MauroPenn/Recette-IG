/* Etirements V23 — Créateur validé V13, lecteur V14 + vidéos MP4 V20/V16 et gong validé V2.
   Ajout autonome après le menu validé V10.
   N'altère pas les modules Musculation, Accueil général ou les fiches d'étirements. */
(function(){
 'use strict';
 if(typeof render!=='function'||typeof state==='undefined')return;
 const HOME='etirements-seances-accueil-v2';
 const CREATE='etirements-seances-creation-v2';
 const CHOOSE='etirements-seances-choisir-v11';
 const PLAYER='etirements-seances-lecteur-v11';
 const HISTORY='etirements-seances-historique-v7';
 const SOUND='etirements-seances-sons-v7';
 const PRESET='etirements-seances-modele-v7-';
 const STORE='mb_etirements_seances_v11';
 const HIST_STORE='mb_etirements_historique_v11';
 const SOUND_STORE='mb_etirements_sons_v11';
 const CATALOG_STORE='mb_etirements_catalogue_v12';
 const CAT=[
  'Nuque & cervicales','Épaules & bras','Pectoraux','Dos & tronc',
  'Hanches & fessiers','Cuisses','Chevilles & mollets'
 ];
 const PRESETS=[
  {name:'Mobilité douce',count:6,cats:[0,1,3],mode:'chrono'},
  {name:'Bas du corps',count:6,cats:[4,5,6],mode:'chrono'},
  {name:'Corps complet',count:8,cats:[0,1,2,3,4,5,6],mode:'chrono'},
  {name:'Détente et récupération',count:5,cats:[0,3,4,6],mode:'libre'}
 ];
 const CURATED=[];
 function addCur(group,labels,filepath){
  labels.forEach((name,i)=>{
   if(!name)return;
   CURATED.push({id:'e-'+group+'-'+(i+1),name,group:CAT[group],photo:filepath?filepath(i+1):'',category:group});
  });
 }
 addCur(4,[
  'Étirement du piriforme assis','Papillon assis',null,null,
  'Fente basse du psoas','Rotation des hanches allongée','Adducteurs assis, jambes écartées',
  'Genou vers la poitrine allongé','Ouverture des hanches en squat assisté','Posture de la grenouille adaptée'
 ],id=>'./etirements-hanches-bandeau-'+id+(id<=2?'-v1':id<=7?'-v7':'-v9')+'.webp');
 addCur(5,[
  'Quadriceps debout','Quadriceps allongé sur le côté','Quadriceps avec sangle sur le ventre',
  'Quadriceps à genou contre un support','Ischio-jambiers debout, pied surélevé',
  'Ischio-jambiers assis, jambe tendue','Ischio-jambiers allongé avec sangle',
  'Adducteurs, jambes écartées au sol','Adducteurs en fente latérale',
  'Adducteurs debout, jambes écartées'
 ],id=>'./etirements-cuisses-bandeau-'+id+(id<=2?'-v2':id<=5?'-v5':id<=8?'-v1':'-v3')+'.webp');
 addCur(6,[
  'Mollet debout contre un mur','Soléaire, genou fléchi','Mollet sur une marche',
  'Mobilité de cheville, genou au mur','Cercles de cheville assis',
  'Flexion-extension de cheville assis','Mollet assis avec sangle',
  'Étirement de la voûte plantaire assis'
 ],id=>'./etirements-chevilles-mollets-bandeau-'+id+'-v1.webp');
 const exampleCardPhoto={0:'./etirements-seance-modele-1-v10.webp',1:'./etirements-seance-modele-1-v10.webp',2:'./etirements-seance-modele-3-v10.webp',3:'./etirements-seance-modele-3-v10.webp',4:'./etirements-seance-modele-2-v10.webp',5:'./etirements-seance-modele-2-v10.webp',6:'./etirements-seance-modele-4-v10.webp'};
 function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
 function safeLoad(key,def){try{const x=JSON.parse(localStorage.getItem(key));return Array.isArray(def)?(Array.isArray(x)?x:def):(x&&typeof x==='object'?x:def);}catch(e){return def;}}
 function safeSave(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){alert('Impossible d’enregistrer sur cet appareil. Vérifie l’espace disponible ou les réglages du navigateur.');return false;}}
 function escapeHtml(v){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
 function txt(parent,tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;parent.appendChild(el);return el;}
 function btn(parent,cls,label,action){const el=txt(parent,'button',cls,label);el.type='button';if(action)el.addEventListener('click',action);return el;}
 function node(parent,tag,cls){return txt(parent,tag,cls);}
 function go(view){if(clock)clearInterval(clock);clock=null;try{document.querySelectorAll('.ets21-pause-video').forEach(v=>v.pause());}catch(e){}state.view=view;state.selected=null;render();try{window.scrollTo({top:0,behavior:'instant'});}catch(e){window.scrollTo(0,0);}}
 const initialDraft=()=>({id:null,name:'',mode:'chrono',duration:30,rest:15,rounds:2,roundRest:45,exerciseIds:[]});
 let draft=initialDraft(),filter='Tous',searchTerm='',lastView=HOME,clock=null,playing=null;
 let saved=safeLoad(STORE,[]),history=safeLoad(HIST_STORE,[]),sound=safeLoad(SOUND_STORE,{enabled:true});
 let catalog=CURATED.slice(),loaded=false,loading=null;
 function findEntry(id){return catalog.find(x=>x.id===id) || catalog.find(x=>x.id===String(id).replace(/-ouvrir-/, '-')) || null;}
 function categoryFromScript(src){
  const s=norm(src);
  if(/cervical/.test(s))return 0;
  if(/epaules/.test(s))return 1;
  if(/pectoraux/.test(s))return 2;
  if(/dos/.test(s))return 3;
  if(/hanches/.test(s))return 4;
  if(/cuisses/.test(s))return 5;
  if(/chevilles|mollets/.test(s))return 6;
  return -1;
 }
 function cleanExerciseTitle(name){
  return String(name||'').trim()
   .replace(/^(?:ouvrir|voir|afficher)\s+(?:la\s+fiche\s*:?\s*)?/i,'')
   .replace(/^(?:exercice|bandeau|fiche)\s*:\s*/i,'')
   .replace(/\s+/g,' ').trim();
 }
 function addCatalogueEntry(name,group,idHint,photo){
  const raw=String(name||'').trim();
  const n=cleanExerciseTitle(raw);
  if(n.length<5||n.length>90||/^(fiches?|vid[eé]o|exercices?|[ée]tirements|retour|choisir|mod[eè]le|d[eé]monstration|nouveaux?|ent[eê]te|bandeau|accueil)/i.test(n))return;
  if(/\b(disponible|bient[oô]t|retour|s[eé]ance|comment faire|conseils|bienfaits|astuce|choisissez|cat[eé]gorie|ent[eê]te|nom de)\b/i.test(n))return;
  const same=catalog.find(x=>x.category===group&&norm(cleanExerciseTitle(x.name))===norm(n));
  if(same){if(photo && !same.catalogPhoto){same.photo=photo;same.catalogPhoto=true;}return;}
  let id='lib-'+group+'-'+norm(raw).replace(/[^a-z0-9]+/g,'-').slice(0,65);
  if(catalog.some(x=>x.id===id))return;
  catalog.push({id,name:n,group:CAT[group],photo:photo||'',category:group,idHint});
 }
 function extractTitles(source,category){
  if(category<0)return;
  // Only extract labels from actual exercise arrays. Header and decoration data are NOT exercises.
  const blocks=[];
  const arrayStart=/(?:const|let|var)\s+(?:DATA|EXERCISES|EXERCICES|STRETCHES|STRETCH_EXERCISES|EXOS|EXERCICES_DATA|items)\s*=\s*\[/ig;
  let m;
  while((m=arrayStart.exec(source))!==null){
   const open=source.indexOf('[',m.index), max=Math.min(source.length,open+65000);
   let depth=0,quote='',escape=false,end=-1;
   for(let i=open;i<max;i++){
    const c=source[i];if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote='';continue;}
    if(c==='\''||c==='"'||c==='`'){quote=c;continue;}
    if(c==='[')depth++;if(c===']'){depth--;if(depth===0){end=i;break;}}
   }
   if(end>open)blocks.push(source.slice(open,end+1));
  }
  for(const b of blocks){
   let item=/\{[^{}]{0,650}\}/g,ob;
   while((ob=item.exec(b))!==null){
    const s=ob[0],nm=s.match(/(?:\btitle|\btitre|\bname|\bnom|\blabel)\s*:\s*(['"`])([^'"`]{4,90})\1/);
    if(!nm)continue;
    const id=s.match(/\bid\s*:\s*(?:['"]([^'"]+)['"]|(\d+))/);
    const photo=s.match(/\b(?:image|photo|bandeau|thumb|src)\s*:\s*['"]([^'"]+\.(?:webp|png|jpg)(?:\?[^'"]*)?)['"]/i);
    addCatalogueEntry(nm[2],category,id?(id[1]||id[2]):'',photo?photo[1]:'');
   }
  }
  // Fallback for older sources whose actual exercise objects are not in a named DATA array.
  // Require several plausible entries to avoid adding a single page header as an exercise.
  if(!blocks.length){
   const candidates=[];const re=/\{[^{}]{0,380}\b(?:title|titre|name|nom)\s*:\s*(['"`])([^'"`]{5,90})\1[^{}]{0,320}\}/g;
   let m;while((m=re.exec(source))!==null){
    if(/\b(?:id|bandeau|image|photo|src)\s*:/i.test(m[0]) &&
       !/^(?:ent[eê]te|accueil|choisir|mod[eè]le)/i.test(m[2]))candidates.push(m[2]);
   }
   const names=[...new Set(candidates)];
   if(names.length>=3)for(const n of names)addCatalogueEntry(n,category,'','');
  }
 }
 // Extract original page routes from the scripts already used by the user's validated categories.
 function categoryListRoutes(sources,category){
  const candidates=[];
  for(const item of sources){
   if(item.category!==category)continue;
   const txt=item.code;
   const re=/['"`](etirements-[a-z0-9_-]{2,95})['"`]/ig;
   let m;while((m=re.exec(txt))!==null){
    const route=m[1];
    if(/(?:liste|list|exercices|exos)/i.test(route) &&
       /(?:cervical|nuque|epaules|pectoraux|dos|hanches|cuisses|chevilles|mollets)/i.test(route) &&
       !/(?:detail|fiche|video|s[eé]ances|accueil|creation)/i.test(route) &&
       !candidates.includes(route))candidates.push(route);
   }
  }
  return candidates.slice(0,22);
 }
 function detectEntries(category){
  const main=document.getElementById('main');if(!main)return [];
  const entries=[];
  const candidates=main.querySelectorAll('button,[role="button"],a');
  for(const el of candidates){
   const img=el.querySelector('img');if(!img)continue;
   let label=el.getAttribute('aria-label')||img.getAttribute('alt')||'';
   label=label.replace(/^(?:Ouvrir|Voir)(?:\s+la)?\s+(?:fiche|d[eé]tail)\s*:?\s*/i,'').replace(/^(?:Bandeau|Fiche|Exercice)\s*:\s*/i,'').trim();
   if(!label||/ent[eê]te|choisissez|accueil|cat[eé]gorie|retour|navigation/i.test(label))continue;
   if(label.length<5||label.length>100||CAT.some(n=>norm(n)===norm(label)))continue;
   // if the button only has an image, avoid treating category headers as exercises.
   if(img.naturalWidth>0 && img.naturalHeight>0 && img.naturalWidth<img.naturalHeight*.95)continue;
   const photo=img.getAttribute('src')||'';
   if(!photo || !/\.(?:webp|png|jpe?g)/i.test(photo))continue;
   entries.push({label,photo});
  }
  return entries;
 }
 function scanPublishedCategoryViews(sources){
  // Original category screens already contain the exact approved labels and image URLs.
  // Read them synchronously, then restore the creator. Do NOT modify any category data.
  const main=document.getElementById('main');if(!main)return;
  const view=state.view,selected=state.selected,scrollY=window.scrollY;
  const oldVisibility=main.style.visibility,oldPointer=main.style.pointerEvents;
  main.style.visibility='hidden';main.style.pointerEvents='none';
  try{
   const groups=[0,1,2,3,4];
   for(const group of groups){
    let best=[];
    const routes=categoryListRoutes(sources,group);
    for(const route of routes){
     state.view=route;
     try{render();}catch(e){continue;}
     const found=detectEntries(group);
     if(found.length>best.length)best=found;
     if(found.length>=10)break;
    }
    for(const e of best){
     addCatalogueEntry(e.label,group,'',e.photo);
     const exact=catalog.find(x=>x.category===group && norm(x.name)===norm(cleanExerciseTitle(e.label)));
     if(exact && e.photo){exact.photo=e.photo;exact.catalogPhoto=true;}
    }
   }
  }finally{
   state.view=view;state.selected=selected;
   try{render();}catch(e){console.warn('Restore stretching creator',e);}
   main.style.visibility=oldVisibility;main.style.pointerEvents=oldPointer;
   try{window.scrollTo(0,scrollY);}catch(e){}
  }
 }
 function discoverCatalog(){
  if(loaded)return Promise.resolve(catalog);
  if(loading)return loading;
  loading=(async()=>{
   const cached=safeLoad(CATALOG_STORE,[]);
   for(const e of cached){if(e&&e.name&&Number.isInteger(e.category)&&!/^ent[eê]te$/i.test(e.name))addCatalogueEntry(e.name,e.category,'',e.photo);}
   const js=[...document.querySelectorAll('script[src]')]
    .map(s=>s.getAttribute('src')||'')
    .filter(src=>/etirements?-(?:cervicales|epaules|pectoraux|dos|hanches|cuisses|chevilles)/i.test(src));
   const unique=[...new Set(js)];
   const sources=await Promise.all(unique.map(async src=>{
     try{
      const response=await fetch(src,{cache:'force-cache'});
      if(!response.ok)return null;
      const code=await response.text();
      return code.length<240000?{category:categoryFromScript(src),code,src}:null;
     }catch(e){return null;}
   }));
   const available=sources.filter(Boolean);
   for(const item of available)extractTitles(item.code,item.category);
   // When scripts describe layouts differently, the already-working UI is definitive.
   scanPublishedCategoryViews(available);
   // Keep the original order used on the validated category screens.
   catalog.sort((a,b)=>a.category-b.category);
   safeSave(CATALOG_STORE,catalog.filter(x=>!CURATED.some(y=>y.id===x.id)).map(x=>({name:x.name,category:x.category,photo:x.photo})));
   loaded=true;loading=null;
   return catalog;
  })().catch(err=>{loading=null;loaded=true;console.warn('Stretching catalog',err);return catalog;});
  return loading;
 }
 function readyCatalog(){
  discoverCatalog().then(()=>{
   if(state.view===CHOOSE)renderChoiceList();
   if(state.view===CREATE)renderDraftExercises();
  });
 }
 function screen(title,subtitle){
  document.body.classList.add('ez1-active');
  if(typeof updateShell==='function')updateShell();
  const nav=document.getElementById('bottomNav');if(nav)nav.classList.add('hidden');
  const main=document.getElementById('main');if(!main)return null;
  main.replaceChildren();
  const page=node(main,'section','ets11-screen');page.setAttribute('aria-label',title);
  const back=btn(page,'ets11-back','←  Étirements',()=>{if(state.view===PLAYER)return quitPlayer();go(title==='Sélection des exercices'?CREATE:HOME);});
  const h=node(page,'div','ets11-hero');
  const icon=txt(h,'span','ets11-hero-icon','♧');icon.setAttribute('aria-hidden','true');
  const block=node(h,'div','ets11-hero-text');
  txt(block,'div','ets11-kicker','ÉTIREMENTS');
  txt(block,'h1','',title);
  txt(block,'p','',subtitle);
  return page;
 }
 function section(page,title,cls){const s=node(page,'section','ets11-card'+(cls?' '+cls:''));txt(s,'h2','ets11-card-title',title);return s;}
 function smallNotice(page,msg,good=false){
  const n=page.querySelector('.ets11-message')||node(page,'p','ets11-message');n.classList.toggle('ets11-good',good);n.textContent=msg;
 }
 function numberField(parent,label,key,min,max,unit){
  const f=node(parent,'label','ets11-numberfield');txt(f,'span','',label);
  const wrap=node(f,'span','ets11-numwrap');const input=node(wrap,'input');input.type='number';input.inputMode='numeric';input.min=String(min);input.max=String(max);input.step='1';input.value=String(draft[key]);input.setAttribute('aria-label',label);txt(wrap,'span','ets11-unit',unit);
  input.addEventListener('change',()=>{let v=Math.round(Number(input.value));if(!Number.isFinite(v))v=draft[key];draft[key]=Math.min(max,Math.max(min,v));input.value=String(draft[key]);updateEstimate();});
 }
 function estimatedSecs(obj){
  let secs=0;
  const count=obj.exerciseIds?.length||0;if(!count)return 0;
  if(obj.mode==='libre')return 0;
  const rounds=Math.max(1,obj.rounds||1),duration=Math.max(1,obj.duration||30),rest=Math.max(0,obj.rest||0),roundRest=Math.max(0,obj.roundRest||0);
  secs=(count*duration+(count-1)*rest)*rounds+(rounds-1)*roundRest+Math.max(0,count*rounds-1)*2;
  return secs;
 }
 function durationText(sec){const m=Math.floor(sec/60),s=sec%60;return m?(s?m+' min '+s+' s':m+' min'):s+' s';}
 function updateEstimate(){
  const node=document.getElementById('ets11-estimate-value');if(!node)return;
  const s=estimatedSecs(draft);
  node.textContent=draft.exerciseIds.length?draft.mode==='libre'?'À ton rythme':durationText(s):'Ajoute des exercices';
 }
 function renderDraftExercises(){
  const area=document.getElementById('ets11-exercise-list');if(!area)return;
  area.replaceChildren();
  const count=document.getElementById('ets11-exercise-count');if(count)count.textContent='('+String(draft.exerciseIds.length)+')';
  if(!draft.exerciseIds.length){
   const e=node(area,'div','ets11-exercise-empty');txt(e,'div','ets11-empty-plus','+');txt(e,'strong','', 'Aucun exercice sélectionné.');txt(e,'p','','Ajoute tes exercices parmi les catégories d’étirements.');
  }else{
   draft.exerciseIds.forEach((id,index)=>{
    const ex=findEntry(id);if(!ex)return;
    const row=node(area,'div','ets11-selected-row');
    txt(row,'span','ets11-order-num',String(index+1));
    const contents=node(row,'div','ets11-selected-text');txt(contents,'strong','',ex.name);txt(contents,'small','',ex.group);
    const actions=node(row,'div','ets11-row-actions');
    btn(actions,'ets11-iconbtn','↑',()=>{if(index<1)return;[draft.exerciseIds[index-1],draft.exerciseIds[index]]=[draft.exerciseIds[index],draft.exerciseIds[index-1]];renderDraftExercises();}).setAttribute('aria-label','Monter '+ex.name);
    btn(actions,'ets11-iconbtn','↓',()=>{if(index>=draft.exerciseIds.length-1)return;[draft.exerciseIds[index+1],draft.exerciseIds[index]]=[draft.exerciseIds[index],draft.exerciseIds[index+1]];renderDraftExercises();}).setAttribute('aria-label','Descendre '+ex.name);
    btn(actions,'ets11-iconbtn ets11-remove','×',()=>{draft.exerciseIds.splice(index,1);renderDraftExercises();}).setAttribute('aria-label','Retirer '+ex.name);
   });
  }
  updateEstimate();
 }
 function renderCreator(){
  const page=screen('Créer une séance','Compose ta routine et personnalise tes réglages.');if(!page)return;
  const naming=section(page,'Nom de la séance');
  const name=node(naming,'input','ets11-name');name.type='text';name.maxLength=70;name.placeholder='Ex. Routine mobilité douce';name.value=draft.name;name.addEventListener('input',()=>{draft.name=name.value;});
  const type=section(page,'Type de séance');const opts=node(type,'div','ets11-mode-grid');
  const chrono=btn(opts,'ets11-mode','◷  Chronométrée',()=>{draft.mode='chrono';renderCreator();});
  const libre=btn(opts,'ets11-mode','◯  Libre',()=>{draft.mode='libre';renderCreator();});
  chrono.classList.toggle('ets11-selected',draft.mode==='chrono');chrono.setAttribute('aria-pressed',String(draft.mode==='chrono'));
  libre.classList.toggle('ets11-selected',draft.mode==='libre');libre.setAttribute('aria-pressed',String(draft.mode==='libre'));
  txt(type,'p','ets11-help',draft.mode==='chrono'?'Chaque étirement suit le chronomètre, avec des pauses et des tours automatiques.':'Tu passes manuellement à l’exercice suivant, à ton rythme, sans compte à rebours.');
  if(draft.mode==='chrono'){
   const settings=section(page,'Réglages de la séance');const grid=node(settings,'div','ets11-fields');
   numberField(grid,'Temps d’étirement','duration',10,600,'sec');
   numberField(grid,'Pause entre exercices','rest',0,300,'sec');
   numberField(grid,'Nombre de tours','rounds',1,15,'tours');
   numberField(grid,'Pause entre les tours','roundRest',0,600,'sec');
  }
  const block=section(page,'Exercices de la séance');
  const top=node(block,'div','ets11-ex-header');txt(top,'span','ets11-count','('+draft.exerciseIds.length+')').id='ets11-exercise-count';
  const choose=btn(top,'ets11-gold-small','+ Choisir',()=>{filter='Tous';searchTerm='';go(CHOOSE);});choose.setAttribute('aria-label','Choisir les exercices');
  const list=node(block,'div','ets11-exercise-list');list.id='ets11-exercise-list';
  const stats=node(page,'div','ets11-estimate');txt(stats,'span','','◷  Durée estimée');const value=txt(stats,'strong','', 'Ajoute des exercices');value.id='ets11-estimate-value';
  const save=btn(page,'ets11-primary','✓  Enregistrer la séance',saveDraft);
  btn(page,'ets11-textbutton','Annuler et retourner aux séances',()=>{draft=initialDraft();go(HOME);});
  renderDraftExercises();
  readyCatalog();
 }
 function renderChoiceList(){
  const area=document.getElementById('ets11-choices');if(!area)return;
  area.replaceChildren();
  area.classList.add('ets13-original-banners');
  const chosen=norm(searchTerm);
  // Same catalogue and IDs as V12; only original exercise banners are displayed.
  const data=catalog.filter(ex=>(filter==='Tous'||ex.group===filter)&&(!chosen||norm(cleanExerciseTitle(ex.name)).includes(chosen)));
  const count=document.getElementById('ets11-catalogue-count');if(count)count.textContent=data.length+' exercice'+(data.length>1?'s':'');
  const topCount=document.getElementById('ets11-selected-count');if(topCount)topCount.textContent=draft.exerciseIds.length+' choisi(s)';
  if(!data.length){
   txt(area,'p','ets11-nomatches',chosen?'Aucun exercice ne correspond à cette recherche.':'Aucun exercice trouvé dans cette catégorie. Les fiches validées restent accessibles depuis leur rubrique.');
   return;
  }
  data.forEach(ex=>{
   const title=cleanExerciseTitle(ex.name);
   const row=node(area,'article','ets13-banner-card');
   const figure=node(row,'div','ets13-banner-image');
   const isOn=draft.exerciseIds.includes(ex.id);
   row.classList.toggle('ets13-picked',isOn);
   const add=btn(row,'ets13-add-button'+(isOn?' ets13-add-selected':''),isOn?'✓':'+',()=>{
    const idx=draft.exerciseIds.indexOf(ex.id);
    if(idx>=0)draft.exerciseIds.splice(idx,1);else draft.exerciseIds.push(ex.id);
    renderChoiceList();
   });
   add.setAttribute('aria-label',(isOn?'Retirer ':'Ajouter ')+title);
   add.setAttribute('title',(isOn?'Retirer de la séance : ':'Ajouter à la séance : ')+title);
   add.setAttribute('aria-pressed',String(isOn));
   // Image always uses its native aspect ratio: no crop, no stretch, no duplicate title.
   if(ex.photo && /\.(?:webp|png|jpe?g)(?:$|\?)/i.test(ex.photo)){
    const img=node(figure,'img','ets13-original-banner');
    img.loading='lazy';img.decoding='async';img.alt=title+' — '+ex.group;
    img.src=ex.photo;
    img.addEventListener('error',()=>{
     img.remove();
     renderBannerFallback(figure,title,ex.group);
    },{once:true});
   }else renderBannerFallback(figure,title,ex.group);
  });
 }
 function renderBannerFallback(parent,title,category){
  if(parent.querySelector('.ets13-image-fallback'))return;
  const f=node(parent,'div','ets13-image-fallback');
  txt(f,'span','ets13-fallback-kicker','ÉTIREMENTS • '+String(category||'').toUpperCase());
  txt(f,'strong','ets13-fallback-title',title);
  txt(f,'span','ets13-fallback-rule','');
 }
 function renderChooser(){
  const page=screen('Sélection des exercices','Choisis les exercices à intégrer à ta séance.');if(!page)return;
  const controls=node(page,'section','ets11-filters');
  txt(controls,'label','ets11-search-label','Rechercher un exercice');
  const search=node(controls,'input','ets11-search');search.type='search';search.placeholder='Nom de l’exercice…';search.value=searchTerm;
  search.addEventListener('input',()=>{searchTerm=search.value;renderChoiceList();});
  const chips=node(controls,'div','ets11-chips');
  for(const label of ['Tous',...CAT]){
   const b=btn(chips,'ets11-chip'+(filter===label?' ets11-chip-active':''),label,()=>{filter=label;for(const button of chips.children)button.classList.toggle('ets11-chip-active',button.textContent===label);renderChoiceList();});
   b.setAttribute('aria-pressed',String(filter===label));
  }
  const line=node(page,'div','ets11-choice-summary');
  const c=txt(line,'span','','0 exercices');c.id='ets11-catalogue-count';
  const picked=txt(line,'strong','','0 choisi(s)');picked.id='ets11-selected-count';
  const list=node(page,'div','ets11-choices');list.id='ets11-choices';
  btn(page,'ets11-primary ets11-done','✓  Terminer la sélection',()=>go(CREATE));
  renderChoiceList();readyCatalog();
 }
 function saveDraft(){
  const page=document.querySelector('.ets11-screen');
  const name=String(draft.name).trim();
  if(!name){smallNotice(page,'Donne un nom à ta séance avant de l’enregistrer.');document.querySelector('.ets11-name')?.focus();return;}
  if(!draft.exerciseIds.length){smallNotice(page,'Choisis au moins un exercice.');return;}
  const now=new Date().toISOString();
  const item={...draft,id:draft.id||'ets'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name,updatedAt:now};
  const idx=saved.findIndex(x=>x.id===item.id);
  if(idx>=0)saved[idx]=item;else saved.unshift(item);
  if(!safeSave(STORE,saved))return;
  draft=initialDraft();go(HOME);
 }
 function decorateHome(){
  const panel=document.querySelector('.ets7-saved');if(!panel)return;
  const h=panel.querySelector('h3');if(h){let b=h.querySelector('b');if(b)b.textContent='('+saved.length+')';}
  const intro=panel.querySelector('p');
  if(intro)intro.textContent='Retrouve ici les séances que tu as créées sur cet appareil.';
  const empty=panel.querySelector('.ets7-empty');if(empty)empty.hidden=saved.length>0;
  const previous=panel.querySelector('.ets11-saved-list');if(previous)previous.remove();
  if(!saved.length)return;
  const list=document.createElement('div');list.className='ets11-saved-list';
  for(const s of saved){
   const row=node(list,'div','ets11-saved-item');
   const info=node(row,'div','ets11-saved-details');txt(info,'strong','',s.name);
   txt(info,'small','',(s.exerciseIds||[]).length+' exercices · '+(s.mode==='libre'?'Mode libre':'Chronométrée'));
   const actions=node(row,'div','ets11-saved-actions');
   btn(actions,'ets11-saved-start','Démarrer',()=>startSession(s));
   btn(actions,'ets11-saved-edit','Modifier',()=>{draft={...s,exerciseIds:[...(s.exerciseIds||[])]};go(CREATE);});
   btn(actions,'ets11-saved-delete','Supprimer',()=>{
    if(!confirm('Supprimer la séance « '+s.name+' » ?'))return;
    saved=saved.filter(x=>x.id!==s.id);safeSave(STORE,saved);render();
   });
  }
  const historyButton=panel.querySelector('.ets7-history');if(historyButton)panel.insertBefore(list,historyButton);else panel.appendChild(list);
 }
 function presetStart(idx){
  const tpl=PRESETS[idx];if(!tpl)return;
  discoverCatalog().then(()=>{
   const used=new Set(),entries=[];
   for(let round=0;round<tpl.count;round++){
    const cat=tpl.cats[round%tpl.cats.length];
    const pool=catalog.filter(ex=>ex.category===cat&&!used.has(ex.id));
    const ex=pool[0]||catalog.find(ex=>!used.has(ex.id));
    if(ex){used.add(ex.id);entries.push(ex.id);}
   }
   draft={...initialDraft(),name:tpl.name,mode:tpl.mode,exerciseIds:entries};go(CREATE);
  });
  const page=screen('Préparation du modèle','Choix des étirements…');
  if(page){const p=node(page,'div','ets11-card');txt(p,'p','','Préparation de « '+tpl.name+' »…');}
 }
 function renderHistory(){
  const page=screen('Historique des séances','Les étirements que tu as terminés.');if(!page)return;
  const s=section(page,'Mes séances terminées');
  if(!history.length){txt(s,'p','ets11-help','Aucune séance terminée pour le moment.');return;}
  for(const item of history.slice(0,100)){
   const row=node(s,'div','ets11-history-row');
   const dt=new Date(item.when);txt(row,'strong','',item.name||'Séance');
   txt(row,'span','', (Number.isNaN(dt.valueOf())?'':dt.toLocaleDateString('fr-FR'))+' · '+item.count+' exercices · '+item.mode+(item.rounds?' · '+item.rounds+' tour(s)':'')+(item.durationSeconds!=null?' · '+clockTime(item.durationSeconds):''));
  }
 }
 function renderSound(){
  const page=screen('Réglages sonores','Des signaux doux pour accompagner tes étirements.');if(!page)return;
  const s=section(page,'Sons zen');
  const line=node(s,'label','ets11-sound-row');
  const check=node(line,'input');check.type='checkbox';check.checked=!!sound.enabled;
  txt(line,'span','','Activer le bol tibétain : une frappe à 4 et 2 secondes, puis double gong à zéro.');
  check.addEventListener('change',()=>{sound.enabled=check.checked;safeSave(SOUND_STORE,sound);if(sound.enabled)primeZenAudio();});
  btn(s,'ets11-gold-small','Écouter le double gong',()=>{
   primeZenAudio(true).then(()=>zenSound('double',true)).catch(()=>{});
  });
 }
 // V21 : vrais sons MP3 validés (pas de carillon synthétique). Les deux échantillons
 // sont chargés une seule fois, et chaque frappe dispose de sa propre résonance.
 const ETS21_AUDIO={
  single:'./etirements-bol-tibetain-simple-v21.mp3',
  double:'./etirements-bol-tibetain-double-v21.mp3'
 };
 const ETS21_VIDEO={
  rest:'./etirements-pause-soleil-v23.mp4',
  round:'./etirements-pause-the-japonais-v23.mp4'
 };
 let zenAudio=null,zenBuffers={},zenLoadPromise=null;
 function primeZenAudio(force=false){
  if(!force&&!sound.enabled)return Promise.resolve();
  try{
   const Ctx=window.AudioContext||window.webkitAudioContext;
   if(!Ctx)return Promise.resolve();
   if(!zenAudio)zenAudio=new Ctx();
   if(zenAudio.state==='suspended')zenAudio.resume().catch(()=>{});
   if(!zenLoadPromise){
    zenLoadPromise=Promise.all(Object.entries(ETS21_AUDIO).map(async([key,url])=>{
     const response=await fetch(url,{cache:'force-cache'});
     if(!response.ok)throw Error('Son indisponible : '+url);
     const buffer=await zenAudio.decodeAudioData(await response.arrayBuffer());
     zenBuffers[key]=buffer;
    })).catch(err=>{
     // Si le téléchargement échoue, autoriser un nouvel essai au prochain démarrage.
     zenLoadPromise=null;console.warn('Bol tibétain :',err.message);
    });
   }
   return zenLoadPromise;
  }catch(err){return Promise.resolve();}
 }
 function zenSound(kind='single',force=false){
  if(!force&&!sound.enabled)return;
  const key=kind==='double'?'double':'single';
  if(zenAudio&&zenBuffers[key]){
   try{
    if(zenAudio.state==='suspended')zenAudio.resume().catch(()=>{});
    const source=zenAudio.createBufferSource();
    const gain=zenAudio.createGain();
    source.buffer=zenBuffers[key];gain.gain.value=0.82;
    source.connect(gain);gain.connect(zenAudio.destination);source.start(0);
   }catch(err){console.warn('Lecture du gong :',err.message);}
   return;
  }
  // Le décodage peut ne pas être terminé au tout premier signal. Les sons suivants
  // utiliseront le tampon en mémoire : aucun bip de synthèse ne remplace le bol.
  if(sound.enabled||force)primeZenAudio(force);
 }
 function countdownGong(step,before,after){
  if(!sound.enabled||!step||step.seconds<4||step.kind==='ready'||!playing)return;
  if(!playing.cuesFired)playing.cuesFired={};
  const flags=playing.cuesFired;
  // Un seul signal par seuil franchi, y compris après une pause/reprise.
  if(after===0&&before>0){if(!flags.zero){flags.zero=true;zenSound('double');}return;}
  if(before>2&&after<=2&&!flags.two){flags.two=true;zenSound('single');return;}
  if(before>4&&after<=4&&!flags.four){flags.four=true;zenSound('single');}
 }
 function tryPlaySceneVideo(video){
  if(!video||!video.isConnected||!playing||!playing.running)return;
  try{
   video.muted=true;video.defaultMuted=true;video.playsInline=true;
   if(video.error)return;
   const promise=video.play();
   if(promise&&typeof promise.catch==='function'){
    promise.catch(()=>{
     // Sur Android, la lecture peut attendre la prochaine interaction de l'utilisateur.
     // On ne masque pas l'erreur par une animation CSS mal positionnée.
     video.dataset.playBlocked='1';
    });
   }
  }catch(e){video.dataset.playBlocked='1';}
 }
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&playing&&playing.running)resumeSceneVideo();
 });
 document.addEventListener('pointerdown',()=>{
  const v=document.getElementById('ets21-pause-video');
  if(v&&v.dataset.playBlocked==='1'&&playing&&playing.running)tryPlaySceneVideo(v);
 },{passive:true});
 function pauseSceneVideo(){
  const el=document.getElementById('ets21-pause-video');
  if(el&&!el.paused){try{el.pause();}catch(e){}}
 }
 function resumeSceneVideo(){
  const el=document.getElementById('ets21-pause-video');
  if(el)tryPlaySceneVideo(el);
 }
 function buildSteps(s){
  const arr=[],rounds=s.mode==='libre'?1:Math.max(1,Math.min(15,Number(s.rounds)||1));
  for(let r=0;r<rounds;r++){
   for(let i=0;i<s.exerciseIds.length;i++){
    const ex=findEntry(s.exerciseIds[i])||{name:'Étirement',group:'Étirements',photo:'',category:0};
    // 2 secondes de préparation après la pause, comme dans le circuit Musculation.
    if(s.mode==='chrono'&&arr.length)arr.push({kind:'ready',exercise:ex,seconds:2,round:r+1,number:i+1});
    arr.push({kind:'stretch',exercise:ex,seconds:s.mode==='libre'?0:Math.max(10,Number(s.duration)||30),round:r+1,number:i+1});
    if(s.mode==='chrono'&&i<s.exerciseIds.length-1&&s.rest>0)
      arr.push({kind:'rest',seconds:Number(s.rest),round:r+1,number:i+1});
   }
   if(s.mode==='chrono'&&r<rounds-1&&s.roundRest>0)
     arr.push({kind:'round',seconds:Number(s.roundRest),round:r+1,number:s.exerciseIds.length});
  }
  return arr;
 }
 function clockTime(total){
  const t=Math.max(0,Math.floor(Number(total)||0));
  return [Math.floor(t/3600),Math.floor((t%3600)/60),t%60].map(v=>String(v).padStart(2,'0')).join(':');
 }
 function roundTotal(){return playing?(playing.session.mode==='libre'?1:Math.max(1,Number(playing.session.rounds)||1)):1;}
 function startSession(session){
  const steps=buildSteps(session);if(!steps.length)return;
  if(sound.enabled)primeZenAudio();
  playing={session,steps,index:0,remaining:steps[0].seconds,running:false,mark:0,elapsed:0,startedAt:Date.now(),completed:false,recorded:false,cuesFired:{}};
  go(PLAYER);if(session.mode==='libre')startLibreTimer();
 }
 function startLibreTimer(){
  if(!playing||playing.completed||playing.session.mode!=='libre')return;
  if(clock)clearInterval(clock);
  clock=setInterval(()=>{if(!playing||playing.completed)return;playing.elapsed=Math.floor((Date.now()-playing.startedAt)/1000);updateTimer();},900);
 }
 function pauseTimer(){
  if(clock){clearInterval(clock);clock=null;}
  if(playing)playing.running=false;
  pauseSceneVideo();
  updateTimer();
 }
 function resumeTimer(){
  if(!playing||playing.running||playing.completed||playing.session.mode==='libre')return;
  playing.running=true;playing.mark=Date.now();
  const step=playing.steps[playing.index];
  if(sound.enabled)primeZenAudio();
  // Les vidéos suivent l'horloge réelle et s'arrêtent quand la séance est suspendue.
  resumeSceneVideo();
  if(clock){clearInterval(clock);clock=null;}
  clock=setInterval(()=>{
   if(!playing||!playing.running||playing.completed){if(clock)clearInterval(clock);clock=null;return;}
   const now=Date.now(),passed=Math.floor((now-playing.mark)/1000);if(passed<1)return;
   const before=playing.remaining;
   playing.remaining=Math.max(0,before-passed);playing.elapsed+=passed;playing.mark+=passed*1000;
   countdownGong(step,before,playing.remaining);
   if(playing.remaining===0){advanceStep();return;}
   updateTimer();
  },180);
  // Si l'étape démarre exactement à 4 secondes, lancer la première frappe.
  if(step.seconds===4&&step.kind!=='ready'&&!playing.cuesFired.four){
   playing.cuesFired.four=true;zenSound('single');
  }
  updateTimer();
 }
 function advanceStep(){
  if(!playing||playing.completed)return;
  pauseTimer();playing.index++;
  if(playing.index>=playing.steps.length){finishPlayer();return;}
  playing.remaining=playing.steps[playing.index].seconds;
  playing.cuesFired={};
  renderPlayer();
  if(playing.session.mode==='chrono')resumeTimer();else startLibreTimer();
 }
 function updateTimer(){
  if(!playing||playing.completed)return;
  const step=playing.steps[playing.index];if(!step)return;
  const remaining=Math.max(0,playing.remaining);
  const label=document.getElementById('ets14-timer-value');
  if(label)label.textContent=playing.session.mode==='libre'?'À ton rythme':clockTime(remaining).slice(3);
  const total=Math.max(1,step.seconds||1),used=Math.max(0,Math.min(1,(total-remaining)/total));
  const ring=document.getElementById('ets14-timer-ring');if(ring)ring.style.setProperty('--ets14-angle',(used*360).toFixed(1)+'deg');
  const sessionTime=document.getElementById('ets14-session-time');if(sessionTime)sessionTime.textContent=clockTime(playing.elapsed);
  const button=document.getElementById('ets14-pause-action');
  if(button)button.textContent=playing.running?'Ⅱ  Pause':playing.elapsed?'▶  Reprendre':'▶  Démarrer';
  const status=document.getElementById('ets14-status-line');
  if(status)status.textContent=playing.running?'En cours':playing.session.mode==='libre'?'Mode libre':'Séance en pause';
 }
 function quitPlayer(){
  if(!playing)return go(HOME);
  if(confirm('Quitter cette séance sans l’ajouter à l’historique ?')){
   pauseTimer();playing=null;go(HOME);
  }
 }
 function finishPlayer(){
  if(!playing||playing.completed)return;
  if(playing.session.mode==='libre')playing.elapsed=Math.floor((Date.now()-playing.startedAt)/1000);
  pauseTimer();playing.completed=true;renderFinishScreen();
 }
 function saveCompletedSession(){
  if(!playing||!playing.completed||playing.recorded)return;
  const item={when:new Date().toISOString(),name:playing.session.name,count:playing.session.exerciseIds.length,
   mode:playing.session.mode==='libre'?'Libre':'Chronométrée',rounds:roundTotal(),durationSeconds:playing.elapsed};
  history.unshift(item);
  if(safeSave(HIST_STORE,history)){
   playing.recorded=true;playing=null;go(HISTORY);
  }else history.shift();
 }
 function renderFinishScreen(){
  if(!playing||!playing.completed)return;
  const page=screen('Séance terminée','Prends un instant pour savourer ce moment.');if(!page)return;
  page.classList.add('ets14-player');
  const card=node(page,'section','ets14-finish');
  txt(card,'div','ets14-finish-medal','✧');
  txt(card,'h2','','Bravo, séance terminée !');
  txt(card,'p','',playing.session.name||'Ma séance');
  const stats=node(card,'div','ets14-finish-stats');
  for(const [val,lab] of [[clockTime(playing.elapsed),'Durée'],[String(playing.session.exerciseIds.length),'Exercices'],[String(roundTotal()),'Tours']]){
   const stat=node(stats,'div','ets14-finish-stat');txt(stat,'strong','',val);txt(stat,'small','',lab);
  }
  txt(card,'p','ets14-finish-note','Souhaites-tu conserver cette séance dans ton historique ?');
  btn(page,'ets11-primary ets14-save-button','✓  Enregistrer dans l’historique',saveCompletedSession);
  btn(page,'ets14-outline','Terminer sans enregistrer',()=>{playing=null;go(HOME);});
 }
 function photoBanner(parent,exercise,cls){
  const wrap=node(parent,'div',cls||'ets14-original-banner');
  const photo=exercise?.photo||exampleCardPhoto[exercise?.category]||exampleCardPhoto[0];
  if(photo){
   const img=node(wrap,'img','');img.src=photo;img.alt=exercise?.name||'Bandeau de l’exercice';
   img.addEventListener('error',()=>{
    if(img.dataset.fallback)return;
    img.dataset.fallback='1';
    if(exercise?.photo){img.src=exampleCardPhoto[exercise?.category]||exampleCardPhoto[0];}
    else{img.remove();txt(wrap,'strong','',exercise?.name||'Étirement');}
   });
  }else txt(wrap,'strong','',exercise?.name||'Étirement');
  return wrap;
 }
 function nextStretch(){
  if(!playing)return null;
  for(let i=playing.index+1;i<playing.steps.length;i++)
   if(playing.steps[i].kind==='stretch')return playing.steps[i].exercise;
  return null;
 }
 function pauseVideo(content,step,kind){
  const scene=node(content,'div','ets14-scene ets21-video-scene');
  scene.classList.add(kind==='round'?'ets14-tea-scene':'ets14-sunset-scene');
  const video=node(scene,'video','ets21-pause-video');
  video.id='ets21-pause-video';
  video.src=ETS21_VIDEO[kind];
  video.preload='auto';
  video.muted=true;video.defaultMuted=true;
  video.autoplay=true;video.playsInline=true;
  video.loop=true;
  video.controls=false;
  video.dataset.kind=kind;
  video.setAttribute('muted','');
  video.setAttribute('autoplay','');
  video.setAttribute('playsinline','');
  video.setAttribute('webkit-playsinline','');
  video.setAttribute('aria-label',kind==='round'?'Théière japonaise animée':'Coucher de soleil animé');
  video.poster=kind==='round'?'./etirements-pause-the-anime-v14.webp':'./etirements-pause-soleil-fond-v14.webp';
  // Image de secours seulement lorsque la vidéo est réellement illisible.
  video.addEventListener('error',()=>{
   if(!video.parentNode)return;
   const backup=document.createElement('img');backup.src=video.poster;
   backup.className='ets23-video-fallback';
   backup.alt=kind==='round'?'Théière japonaise':'Lac au coucher du soleil';
   video.replaceWith(backup);
  });
  const launch=()=>tryPlaySceneVideo(video);
  video.addEventListener('loadeddata',launch);
  video.addEventListener('canplay',launch);
  video.addEventListener('playing',()=>{delete video.dataset.playBlocked;});
  // Aucune flamme ni vapeur artificielle ajoutée par-dessus la vidéo.
  // Les animations sont intégrées directement dans les fichiers MP4.
  setTimeout(launch,60);
  setTimeout(launch,350);
  return video;
 }
 function renderPlayer(){
  if(!playing)return;
  if(playing.completed)return renderFinishScreen();
  const step=playing.steps[playing.index];if(!step)return;
  const page=screen('Séance en cours',playing.session.name);if(!page)return;
  page.classList.add('ets14-player');
  const strip=node(page,'div','ets14-session-strip');txt(strip,'strong','','Séance : '+playing.session.name);
  const hud=node(page,'div','ets14-hud');
  const meta=[['⟳','Tour',step.round+' / '+roundTotal()],['▰','Exercice',Math.max(1,step.number)+' / '+playing.session.exerciseIds.length],['◷','Séance',clockTime(playing.elapsed)]];
  meta.forEach(([icon,name,value],i)=>{
   const stat=node(hud,'div','ets14-hud-stat');
   txt(stat,'div','ets14-hud-label',icon+'  '+name);
   const v=txt(stat,'strong','',value);if(i===2)v.id='ets14-session-time';
  });
  const content=node(page,'div','ets14-content');
  if(step.kind==='stretch'){
   txt(content,'h2','ets14-state-title',step.exercise.name);
   txt(content,'div','ets14-subtitle',step.exercise.group);
   photoBanner(content,step.exercise);
  }else if(step.kind==='rest'){
   txt(content,'h2','ets14-state-title','Pause entre exercices');
   txt(content,'div','ets14-subtitle','Respire doucement et détends les épaules.');
   pauseVideo(content,step,'rest');
  }else if(step.kind==='round'){
   txt(content,'h2','ets14-state-title','Fin du tour '+step.round);
   txt(content,'div','ets14-subtitle','Récupération avant le tour suivant');
   pauseVideo(content,step,'round');
  }else{
   txt(content,'h2','ets14-state-title','Prépare-toi');
   txt(content,'div','ets14-subtitle','Le prochain étirement commence dans 2 secondes.');
   photoBanner(content,step.exercise);
  }
  const row=node(content,'div','ets14-timer-row');
  if(step.kind==='stretch'&&playing.session.mode==='chrono'){
   const box=node(row,'div','ets14-small-data');txt(box,'strong','',String(playing.session.duration)+' s');txt(box,'small','','d’étirement');
  }else if(step.kind==='round'){
   const box=node(row,'div','ets14-small-data');txt(box,'strong','','Hydrate-toi');txt(box,'small','','Prends une gorgée d’eau');
  }
  const ring=node(row,'div','ets14-ring');ring.id='ets14-timer-ring';ring.setAttribute('role','timer');
  const inner=node(ring,'div','ets14-ring-inner');
  txt(inner,'div','ets14-ring-label',step.kind==='stretch'?'Étirement':step.kind==='round'?'Pause':step.kind==='ready'?'Préparation':'Récupération');
  const count=txt(inner,'strong','',playing.session.mode==='libre'?'À ton rythme':clockTime(playing.remaining).slice(3));count.id='ets14-timer-value';
  if(step.kind==='stretch'&&playing.session.mode==='chrono'){
   const box=node(row,'div','ets14-small-data');txt(box,'strong','',String(playing.session.rest)+' s');txt(box,'small','','de repos');
  }else if(step.kind==='round'){
   const box=node(row,'div','ets14-small-data');txt(box,'strong','','Respire');txt(box,'small','','Relâche tes tensions');
  }
  if(step.kind==='rest'){
   const ex=nextStretch();if(ex){txt(content,'div','ets14-next-label','Prochain exercice');photoBanner(content,ex,'ets14-next-banner');}
  }else if(step.kind==='round'){
   const next=node(content,'div','ets14-next-round');
   txt(next,'strong','','Tour suivant : '+(step.round+1)+' / '+roundTotal());
   txt(next,'span','','Reprise en douceur après cette pause');
  }
  const progress=node(content,'div','ets14-progress');
  const progressTop=node(progress,'div','ets14-progress-top');
  txt(progressTop,'span','',step.kind==='round'?'Progression de la séance':'Progression du tour');
  txt(progressTop,'strong','',step.kind==='round'?step.round+' / '+roundTotal():step.number+' / '+playing.session.exerciseIds.length);
  const bar=node(progress,'div','ets14-progress-bar');const fill=node(bar,'div','ets14-progress-fill');
  fill.style.width=((step.kind==='round'?step.round/roundTotal():Math.max(0,step.number-1)/Math.max(1,playing.session.exerciseIds.length))*100).toFixed(1)+'%';
  const controls=node(page,'div','ets14-controls');
  if(playing.session.mode==='chrono'){
   const act=btn(controls,'ets14-button ets14-pause','▶  Démarrer',()=>{
    if(!playing||playing.completed)return;
    if(playing.running)pauseTimer();else resumeTimer();updateTimer();
   });act.id='ets14-pause-action';
  }
  btn(controls,'ets14-button ets14-next','⏭  Suivant',advanceStep);
  btn(page,'ets14-outline','✓  Terminer la séance',()=>{
   if(confirm('Terminer maintenant cette séance ? Tu pourras ensuite choisir de l’enregistrer ou non.'))finishPlayer();
  });
  btn(page,'ets14-exit','Quitter sans enregistrer',quitPlayer);
  updateTimer();
  if(playing.running&&(step.kind==='rest'||step.kind==='round')){setTimeout(resumeSceneVideo,40);setTimeout(resumeSceneVideo,240);}

 }
 const previousRender=render;
 render=function(){
  const v=String(state?.view||'');
  if(v!==PLAYER&&clock){clearInterval(clock);clock=null;}
  if(v===CREATE)return renderCreator();
  if(v===CHOOSE)return renderChooser();
  if(v===PLAYER)return playing?.completed?renderFinishScreen():renderPlayer();
  if(v===HISTORY)return renderHistory();
  if(v===SOUND)return renderSound();
  if(v.startsWith(PRESET)){
   const idx=Number(v.slice(PRESET.length));if(Number.isInteger(idx)&&idx>=0&&idx<4)return presetStart(idx);
  }
  const result=previousRender.apply(this,arguments);
  if(v===HOME||document.querySelector('.ets7-saved'))decorateHome();
  return result;
 };
})();
