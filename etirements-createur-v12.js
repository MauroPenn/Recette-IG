/* Etirements V12 — Créateur de séances. Ajout autonome après le menu validé V10.
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
 function go(view){if(clock)clearInterval(clock);clock=null;state.view=view;state.selected=null;render();try{window.scrollTo({top:0,behavior:'instant'});}catch(e){window.scrollTo(0,0);}}
 const initialDraft=()=>({id:null,name:'',mode:'chrono',duration:30,rest:15,rounds:2,roundRest:45,exerciseIds:[]});
 let draft=initialDraft(),filter='Tous',searchTerm='',lastView=HOME,clock=null,playing=null;
 let saved=safeLoad(STORE,[]),history=safeLoad(HIST_STORE,[]),sound=safeLoad(SOUND_STORE,{enabled:true});
 let catalog=CURATED.slice(),loaded=false,loading=null;
 function findEntry(id){return catalog.find(x=>x.id===id) || null;}
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
 function addCatalogueEntry(name,group,idHint,photo){
  const n=String(name||'').trim();
  if(n.length<5||n.length>90||/^(fiches?|vid[eé]o|exercices?|[ée]tirements|retour|choisir|mod[eè]le|d[eé]monstration|nouveaux?|ent[eê]te|bandeau|accueil)/i.test(n))return;
  if(/\b(disponible|bient[oô]t|retour|s[eé]ance|comment faire|conseils|bienfaits|astuce|choisissez|cat[eé]gorie|ent[eê]te|nom de)\b/i.test(n))return;
  const same=catalog.find(x=>x.category===group&&norm(x.name)===norm(n));
  if(same){if(photo && !same.catalogPhoto){same.photo=photo;same.catalogPhoto=true;}return;}
  let id='lib-'+group+'-'+norm(n).replace(/[^a-z0-9]+/g,'-').slice(0,65);
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
    for(const e of best)addCatalogueEntry(e.label,group,'',e.photo);
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
   catalog.sort((a,b)=>a.category-b.category||a.name.localeCompare(b.name,'fr'));
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
  const back=btn(page,'ets11-back','←  Étirements',()=>go(title==='Sélection des exercices'?CREATE:HOME));
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
  secs=(count*duration+(count-1)*rest)*rounds+(rounds-1)*roundRest;
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
  const chosen=norm(searchTerm);
  let data=catalog.filter(ex=>(filter==='Tous'||ex.group===filter)&&(!chosen||norm(ex.name).includes(chosen)));
  const count=document.getElementById('ets11-catalogue-count');if(count)count.textContent=data.length+' exercices';
  const topCount=document.getElementById('ets11-selected-count');if(topCount)topCount.textContent=draft.exerciseIds.length+' choisi(s)';
  if(!data.length){txt(area,'p','ets11-nomatches',chosen?'Aucun exercice ne correspond à cette recherche.':'Cette catégorie ne remonte pas encore dans le créateur. Les exercices validés restent disponibles dans leur rubrique d’origine.');return;}
  data.forEach(ex=>{
   const row=node(area,'div','ets11-choice-row');
   const thumb=node(row,'div','ets11-thumb');
   const img=node(thumb,'img');img.loading='lazy';img.alt='';img.decoding='async';
   img.src=ex.photo||exampleCardPhoto[ex.category];
   img.addEventListener('error',()=>{if(img.dataset.fallback)return;img.dataset.fallback='1';img.src=exampleCardPhoto[ex.category];});
   const details=node(row,'div','ets11-choice-text');txt(details,'strong','',ex.name);txt(details,'small','',ex.group);
   const isOn=draft.exerciseIds.includes(ex.id);
   const add=btn(row,'ets11-plus'+(isOn?' ets11-plus-selected':''),isOn?'✓':'+',()=>{
    const idx=draft.exerciseIds.indexOf(ex.id);if(idx>=0)draft.exerciseIds.splice(idx,1);else draft.exerciseIds.push(ex.id);
    renderChoiceList();
   });
   add.setAttribute('aria-label',(isOn?'Retirer ':'Ajouter ')+ex.name);add.setAttribute('aria-pressed',String(isOn));
  });
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
   txt(row,'span','', (Number.isNaN(dt.valueOf())?'':dt.toLocaleDateString('fr-FR'))+' · '+item.count+' exercices · '+item.mode);
  }
 }
 function renderSound(){
  const page=screen('Réglages sonores','Personnalise les signaux pendant les séances.');if(!page)return;
  const s=section(page,'Signaux sonores');
  const line=node(s,'label','ets11-sound-row');
  const check=node(line,'input');check.type='checkbox';check.checked=!!sound.enabled;
  txt(line,'span','','Émettre un signal au changement d’exercice');
  check.addEventListener('change',()=>{sound.enabled=check.checked;safeSave(SOUND_STORE,sound);});
  btn(s,'ets11-gold-small','Écouter un exemple',beep);
 }
 function beep(){
  if(!sound.enabled)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   const c=new Audio(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=720;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.07,c.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.28);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.3);o.onended=()=>c.close();
  }catch(e){}
 }
 function buildSteps(s){
  const arr=[];
  const rounds=s.mode==='libre'?1:Math.max(1,s.rounds||1);
  for(let r=0;r<rounds;r++){
   for(let i=0;i<s.exerciseIds.length;i++){
    arr.push({kind:'stretch',exercise:findEntry(s.exerciseIds[i])||{name:'Étirement',group:'Étirements',photo:''},seconds:s.mode==='libre'?0:Math.max(10,s.duration||30),round:r+1});
    if(s.mode==='chrono'&&i<s.exerciseIds.length-1&&s.rest>0)arr.push({kind:'rest',seconds:s.rest,round:r+1});
   }
   if(s.mode==='chrono'&&r<rounds-1&&s.roundRest>0)arr.push({kind:'round',seconds:s.roundRest,round:r+1});
  }
  return arr;
 }
 function startSession(session){
  const steps=buildSteps(session);if(!steps.length)return;
  playing={session,steps,index:0,remaining:steps[0].seconds,running:false,mark:0,completed:false};go(PLAYER);
 }
 function pauseTimer(){if(!playing)return;playing.running=false;if(clock)clearInterval(clock);clock=null;}
 function resumeTimer(){
  if(!playing||playing.running||playing.session.mode==='libre')return;
  playing.running=true;playing.mark=Date.now();
  clock=setInterval(()=>{
   if(!playing||!playing.running){clearInterval(clock);clock=null;return;}
   const now=Date.now(),passed=Math.floor((now-playing.mark)/1000);if(passed<1)return;
   playing.remaining=Math.max(0,playing.remaining-passed);playing.mark+=passed*1000;
   if(playing.remaining===0){advanceStep();return;}
   updateTimer();
  },250);
  updateTimer();
 }
 function advanceStep(){
  if(!playing)return;
  pauseTimer();
  playing.index++;
  if(playing.index>=playing.steps.length){finishPlayer();return;}
  playing.remaining=playing.steps[playing.index].seconds;
  if(playing.session.mode==='chrono'){beep();renderPlayer();resumeTimer();}
  else renderPlayer();
 }
 function updateTimer(){
  const value=document.getElementById('ets11-timer-display');if(value&&playing)value.textContent=playing.session.mode==='libre'?'À ton rythme':durationText(playing.remaining);
  const button=document.getElementById('ets11-pause-action');if(button&&playing)button.textContent=playing.running?'Pause':'Reprendre';
 }
 function finishPlayer(){
  if(!playing||playing.completed)return;
  pauseTimer();playing.completed=true;
  history.unshift({when:new Date().toISOString(),name:playing.session.name,count:playing.session.exerciseIds.length,mode:playing.session.mode==='libre'?'Libre':'Chronométrée'});
  safeSave(HIST_STORE,history);
  const page=screen('Séance terminée','Bravo pour cette séance d’étirements !');
  if(page){const s=section(page,'Séance enregistrée dans l’historique');txt(s,'p','',playing.session.name);btn(page,'ets11-primary','Retour aux séances',()=>{playing=null;go(HOME);});}
 }
 function renderPlayer(){
  if(!playing||playing.completed)return;
  const step=playing.steps[playing.index];
  const page=screen('Séance en cours',playing.session.name);if(!page)return;
  const s=section(page,step.kind==='stretch'?step.exercise.name:step.kind==='round'?'Pause entre les tours':'Pause entre exercices');
  txt(s,'p','ets11-player-count','Étape '+(playing.index+1)+' / '+playing.steps.length+' · Tour '+step.round);
  if(step.kind==='stretch'){
   const pic=node(s,'img','ets11-player-photo');pic.alt='';pic.src=step.exercise.photo||exampleCardPhoto[step.exercise.category]||exampleCardPhoto[0];pic.addEventListener('error',()=>{if(!pic.dataset.fallback){pic.dataset.fallback='1';pic.src=exampleCardPhoto[step.exercise.category]||exampleCardPhoto[0];}});
  }
  const t=txt(s,'div','ets11-timer',playing.session.mode==='libre'?'À ton rythme':durationText(playing.remaining));t.id='ets11-timer-display';
  if(playing.session.mode==='chrono'){
   const p=btn(page,'ets11-primary',playing.running?'Pause':'Démarrer / Reprendre',()=>{if(playing.running)pauseTimer();else resumeTimer();updateTimer();});p.id='ets11-pause-action';
  }
  btn(page,'ets11-gold-small ets11-next','Exercice / étape suivante →',advanceStep);
  btn(page,'ets11-textbutton','Terminer la séance',()=>{if(confirm('Terminer et enregistrer cette séance ?'))finishPlayer();});
  btn(page,'ets11-textbutton','Quitter sans enregistrer',()=>{if(confirm('Quitter cette séance ?')){pauseTimer();playing=null;go(HOME);}});
 }
 const previousRender=render;
 render=function(){
  const v=String(state?.view||'');
  if(v!==PLAYER&&clock){clearInterval(clock);clock=null;}
  if(v===CREATE)return renderCreator();
  if(v===CHOOSE)return renderChooser();
  if(v===PLAYER)return renderPlayer();
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
