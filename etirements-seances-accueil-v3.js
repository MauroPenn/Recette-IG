/* Accueil des séances d'étirements — navigation installable, créateur à préparer. */
(function(){
 'use strict';
 const HOME='etirements-seances-accueil-v2';
 const CREATE='etirements-seances-creation-v2';
 const SAVED='etirements-seances-enregistrees-v2';
 const PRESETS='etirements-seances-predefinies-v2';
 let backView='etirements';
 const titleByView={
   [CREATE]:'Créer une séance',
   [SAVED]:'Mes séances',
   [PRESETS]:'Séances prédéfinies'
 };
 const descByView={
   [CREATE]:'Ici, nous construirons le choix des étirements, leur ordre et les durées.',
   [SAVED]:'Tu retrouveras ici les séances que tu auras enregistrées.',
   [PRESETS]:'Les routines prêtes à utiliser seront ajoutées après notre validation.'
 };
 function show(view){
   if(typeof state==='undefined'||typeof render!=='function')return;
   state.view=view;
   state.selected=null;
   render();
   try{window.scrollTo(0,0);}catch(_e){}
 }
 function section(label){
   document.body.classList.add('ez1-active');
   if(typeof updateShell==='function')updateShell();
   if(typeof bottomNav!=='undefined'&&bottomNav)bottomNav.classList.add('hidden');
   if(typeof main==='undefined'||!main)return null;
   main.replaceChildren();
   const page=document.createElement('section');
   page.className='esv2-screen';
   page.setAttribute('aria-label',label);
   main.appendChild(page);
   return page;
 }
 function addHit(parent,classname,label,fn){
   const b=document.createElement('button');b.type='button';
   b.className='esv2-hit '+classname;b.setAttribute('aria-label',label);
   b.textContent=label;
   b.addEventListener('click',fn);parent.appendChild(b);
 }
 function overview(){
   const page=section('Séances d’étirements : choisir un mode');if(!page)return;
   page.classList.add('esv3-sessions');
   // PC / tablette : image et zones tactiles de la version validée V2, inchangées.
   const panel=document.createElement('div');panel.className='esv2-overview';
   const img=document.createElement('img');
   img.src='./etirements-seances-accueil-v2.webp?v=2';
   img.alt='Séances d’étirements : Créer une séance, Mes séances, Séances prédéfinies';
   img.loading='eager';img.draggable=false;
   panel.appendChild(img);
   addHit(panel,'esv2-hit--back','Retour à Étirements',()=>show(backView));
   addHit(panel,'esv2-hit--create','Créer une séance',()=>show(CREATE));
   addHit(panel,'esv2-hit--saved','Mes séances',()=>show(SAVED));
   addHit(panel,'esv2-hit--preset','Séances prédéfinies',()=>show(PRESETS));
   page.appendChild(panel);
   // Téléphone en portrait : en-tête et trois bandeaux séparés.
   // Les images sont découpées sans étirement, et les boutons restent utilisables.
   const mobile=document.createElement('div');mobile.className='esv3-mobile';
   const header=document.createElement('div');header.className='esv3-header';
   const headImg=document.createElement('img');
   headImg.src='./etirements-seances-entete-mobile-v3.webp?v=3';
   headImg.alt='Séances d’étirements — Choisissez un mode';headImg.draggable=false;
   header.appendChild(headImg);
   const back=document.createElement('button');back.type='button';
   back.className='esv3-back-hit';back.setAttribute('aria-label','Retour à Étirements');
   back.addEventListener('click',()=>show(backView));header.appendChild(back);
   mobile.appendChild(header);
   const cards=[
     ['etirements-seances-carte-creer-mobile-v3.webp','Créer une séance',CREATE],
     ['etirements-seances-carte-mes-seances-mobile-v3.webp','Mes séances',SAVED],
     ['etirements-seances-carte-predefinies-mobile-v3.webp','Séances prédéfinies',PRESETS]
   ];
   for(const [file,label,view] of cards){
     const btn=document.createElement('button');btn.type='button';btn.className='esv3-tile';
     btn.setAttribute('aria-label',label);
     const visual=document.createElement('img');visual.src='./'+file+'?v=3';
     visual.alt=label;visual.draggable=false;
     btn.appendChild(visual);btn.addEventListener('click',()=>show(view));mobile.appendChild(btn);
   }
   page.appendChild(mobile);
 }
 function subpage(view){
   const label=titleByView[view];const page=section(label);if(!page)return;
   page.classList.add('esv2-placeholder');
   const back=document.createElement('button');back.type='button';back.className='esv2-back';
   back.textContent='← Retour aux séances';back.addEventListener('click',()=>show(HOME));
   const box=document.createElement('div');box.className='esv2-subpanel';
   const kicker=document.createElement('div');kicker.className='esv2-kicker';kicker.textContent='SÉANCES D’ÉTIREMENTS';
   const title=document.createElement('h2');title.textContent=label;
   const text=document.createElement('p');text.textContent=descByView[view];
   box.append(kicker,title,text);page.append(back,box);
 }
 function allowedParentView(){
   const view=String(state?.view||'').toLowerCase();
   return view.startsWith('etirements')&&!Object.prototype.hasOwnProperty.call(titleByView,view)&&view!==HOME;
 }
 function isSessionsLink(el){
   const text=((el.getAttribute('aria-label')||'')+' '+(el.textContent||'')+' '+(el.getAttribute('data-view')||'')).replace(/\s+/g,' ').trim();
   if(!/s[ée]ances?/i.test(text))return false;
   if(text.length>180)return false;
   // Do not hijack unrelated links when choosing between sessions and exercises.
   return !/historique|musculation|statistique/i.test(text);
 }
 function activate(){
   if(!allowedParentView()||!document.querySelector('#main'))return;
   const candidates=document.querySelectorAll('#main button,#main [role="button"],#main [data-view],#main .et7-picture-card,#main .et6-card');
   for(const el of candidates){
     if(!isSessionsLink(el)||el.dataset.esv2Attached==='1')continue;
     el.dataset.esv2Attached='1';
     el.addEventListener('click',function(e){
       e.preventDefault();e.stopImmediatePropagation();
       backView=state.view;show(HOME);
     },true);
   }
 }
 if(typeof render!=='function')return;
 const oldRender=render;
 render=function(){
   if(state.view===HOME)return overview();
   if(/^(?:etirements|étirements)[-_].*(?:seances|séances|sessions)$/i.test(String(state.view||'')))return overview();
   if(Object.prototype.hasOwnProperty.call(titleByView,state.view))return subpage(state.view);
   const rv=oldRender.apply(this,arguments);
   activate();
   return rv;
 };
 // Handle sections reached from links whose handlers are attached after the menu loads.
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',activate,{once:true});
 else activate();
})();
