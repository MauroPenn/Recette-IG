/* Séances d'étirements V9. Bandeaux format Musculation ; toutes les fonctions V7 sont préservées. */
(function(){
 'use strict';
 if(typeof render!=='function'||typeof state==='undefined') return;
 const HOME='etirements-seances-accueil-v2';
 const SOUND='etirements-seances-sons-v7';
 const HISTORY='etirements-seances-historique-v7';
 const CREATE='etirements-seances-creation-v2';
 const SAVED='etirements-seances-enregistrees-v2';
 const PRESET='etirements-seances-modele-v7-';
 const TITLES=['Mobilité douce','Bas du corps','Corps complet','Détente et récupération'];
 const DESCS=['Nuque · Épaules · Dos','Hanches · Cuisses · Mollets','Mobilité · Souplesse · Détente','Respiration · Relâchement'];
 let lastStretchView='etirements';
 const oldRender=render;
 function show(view){state.view=view;state.selected=null;render();try{window.scrollTo(0,0);}catch(_){}}
 function elem(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
 function svgArrow(){return '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 4 L4 16 L16 28 M4 16 H30" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
 function svgStretch(){return '<svg aria-hidden="true" viewBox="0 0 64 64"><path d="M29 10c-3 0-5 2-5 5 0 3 2 5 5 5s5-2 5-5c0-3-2-5-5-5Z M30 21 L37 31 L46 34 M36 31 L23 43 L13 52 M23 43 L42 50 M10 54 H53" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
 function svgSound(){return '<svg aria-hidden="true" viewBox="0 0 40 40"><path d="M7 17 H13 L21 10 V31 L13 24 H7Z M25 15 Q32 20 25 26 M28 10 Q39 20 28 31" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
 function screen(label){
  document.body.classList.add('ez1-active');
  if(typeof updateShell==='function')updateShell();
  const nav=document.getElementById('bottomNav');if(nav)nav.classList.add('hidden');
  const main=document.getElementById('main');if(!main)return null;
  main.replaceChildren();
  const section=elem('section','ets7-menu');section.setAttribute('aria-label',label);main.appendChild(section);
  return section;
 }
 function back(target){
  const b=elem('button','ets7-back');b.type='button';b.innerHTML=svgArrow()+'<span>Retour</span>';
  b.setAttribute('aria-label','Retour');b.addEventListener('click',()=>show(target));return b;
 }
 function appHeader(page,title,subtitle){
  const header=elem('div','ets7-head');
  const icon=elem('div','ets7-head-icon');icon.innerHTML=svgStretch();
  const texts=elem('div');texts.appendChild(elem('div','ets7-kicker','ÉTIREMENTS'));
  texts.appendChild(elem('h2','',title));texts.appendChild(elem('p','',subtitle));
  header.append(icon,texts);page.appendChild(header);
 }
 function overview(){
  const page=screen('Séances d’étirements');if(!page)return;
  page.appendChild(back(lastStretchView));
  appHeader(page,'Séances','Routines guidées et personnalisées');
  const snd=elem('button','ets7-sound');snd.type='button';snd.innerHTML=svgSound()+'<span><strong>Réglages sonores</strong><small>Choisir et écouter les sons</small></span>';
  snd.addEventListener('click',()=>show(SOUND));page.appendChild(snd);
  const create=elem('button','ets7-create','+ Créer une séance personnalisée');create.type='button';create.addEventListener('click',()=>show(CREATE));page.appendChild(create);
  const saved=elem('section','ets7-saved');
  const h=elem('h3');h.innerHTML='Mes séances <b>(0)</b>';saved.appendChild(h);
  saved.appendChild(elem('p','', 'Retrouve ici les séances que tu as créées sur cet appareil.'));
  saved.appendChild(elem('div','ets7-empty','Tu n’as pas encore de séance personnalisée. Utilise le bouton « Créer une séance » pour commencer.'));
  const hist=elem('button','ets7-history','▤  Historique des séances');hist.type='button';hist.addEventListener('click',()=>show(HISTORY));saved.appendChild(hist);
  page.appendChild(saved);
  page.appendChild(elem('h3','ets7-subtitle','Séances proposées · à personnaliser'));
  const presets=elem('div','ets7-presets');
  for(let i=0;i<TITLES.length;i++){
   const btn=elem('button','ets7-preset');btn.type='button';btn.setAttribute('aria-label','Personnaliser : '+TITLES[i]);
   const img=elem('img');img.src='./etirements-seance-modele-'+(i+1)+'-v9.webp?v=9';img.alt=TITLES[i]+' — '+DESCS[i];img.decoding='async';img.draggable=false;
   btn.appendChild(img);btn.addEventListener('click',()=>show(PRESET+i));presets.appendChild(btn);
  }
  page.appendChild(presets);
 }
 function placeholder(label,desc,target=HOME){
  const page=screen(label);if(!page)return;
  page.appendChild(back(target));appHeader(page,label,'Séances d’étirements');
  const panel=elem('div','ets7-panel');panel.appendChild(elem('h3','',label));
  panel.appendChild(elem('p','',desc));page.appendChild(panel);
 }
 function preset(index){
  const page=screen('Modèle de séance '+TITLES[index]);if(!page)return;
  page.appendChild(back(HOME));appHeader(page,TITLES[index],DESCS[index]);
  const pic=elem('img','ets7-preset-photo');pic.src='./etirements-seance-modele-'+(index+1)+'-v9.webp?v=9';pic.alt=TITLES[index];page.appendChild(pic);
  const panel=elem('section','ets7-panel');
  const count=index===2?8:index===3?5:6;
  panel.appendChild(elem('h3','',count+' exercices · Personnaliser'));
  panel.appendChild(elem('p','', 'Cette routine servira de modèle. Le choix précis des exercices et leurs durées seront configurés dans le créateur de séances.'));
  const btn=elem('button','ets7-gold-btn','Personnaliser la séance');btn.type='button';btn.addEventListener('click',()=>show(CREATE));panel.appendChild(btn);
  page.appendChild(panel);
 }
 render=function(){
  const v=String(state?.view||'');
  if(v===HOME || /^(?:etirements|étirements)[-_].*(?:seances|séances|sessions)$/i.test(v)){return overview();}
  if(v===SOUND){return placeholder('Réglages sonores','Nous ajouterons les sons de début, de fin et les pauses lors de la création du lecteur de séances.');}
  if(v===HISTORY){return placeholder('Historique des séances','Tes séances réalisées apparaîtront ici lorsque le lecteur d’étirements sera disponible.');}
  if(v.startsWith(PRESET)){
    const idx=Number(v.slice(PRESET.length));if(Number.isInteger(idx)&&idx>=0&&idx<4)return preset(idx);
  }
  // Memorize parent stretching view for Back; the existing module supplies click-to-sessions.
  if(v.startsWith('etirements') && !v.startsWith('etirements-seances') && !v.startsWith('étirements-séances')){
    lastStretchView=v;
  }
  return oldRender.apply(this,arguments);
 };
})();
