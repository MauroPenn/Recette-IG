/* Sport & Nutrition / Épaules & bras V11 – correction ciblée, 14/11/2026.
   - Retour au standard Nuque & cervicales V8 : dix images 941 x 319, chacune indépendante.
   - Les dix zones restent cliquables et ouvrent les fiches déjà existantes.
   - Les anciens portraits de fiche avec titres incrustés sont remplacés par des photos seules.
   - Aucun changement aux 7 catégories V7, à Nuque & cervicales V8, aux données/séances ou à la synchronisation V5.
   - Chargé APRÈS V9 / V10 afin de remplacer seulement leurs deux vues Épaules & bras. */
(function(){
 'use strict';
 const LIST='etirements-epaules-liste',DETAIL='etirements-epaules-fiche';
 const IDS=['cercles','haussement','deltoide','triceps','ouverture-poitrine','avantbras','triceps-haut','ouverture-epaules','biceps-mur','epaule-croisee'];
 const NAMES=['Cercles d’épaules','Haussement et relâchement','Étirement du deltoïde','Étirement des triceps','Ouverture poitrine et biceps','Étirement des avant-bras','Étirement du triceps au-dessus de la tête','Ouverture des épaules','Étirement des biceps contre le mur','Étirement croisé de l’épaule'];
 const img=(n)=>'./etirements-epaules-'+n+'-v11.webp?v=11';
 function go(view,id){
   if(id)state.eeb1Selected=id;
   state.view=view;state.selected=null;
   render();
   try{window.scrollTo({top:0,behavior:'instant'})}catch(e){try{window.scrollTo(0,0)}catch(_){}}
 }
 function makeImage(path,loading='lazy'){
   const image=document.createElement('img');image.src=img(path);image.alt='';image.draggable=false;
   image.decoding='async';image.loading='eager';return image;
 }
 function list(){
   document.body.classList.add('ez1-active');
   if(typeof updateShell==='function')updateShell();
   if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
   main.replaceChildren();
   const root=document.createElement('section');root.className='ev11-screen';
   root.setAttribute('aria-label','Étirements Épaules et bras : dix exercices');
   const back=document.createElement('button');back.type='button';back.className='ev11-back';
   back.textContent='← Retour aux Exercices';back.addEventListener('click',()=>go('etirements-exercices'));
   root.appendChild(back);
   const hero=document.createElement('div');hero.className='ev11-header';hero.appendChild(makeImage('entete','eager'));
   root.appendChild(hero);
   const group=document.createElement('div');group.className='ev11-list';
   NAMES.forEach((name,i)=>{
     const btn=document.createElement('button');btn.type='button';btn.className='ev11-card';
     btn.setAttribute('aria-label','Ouvrir la fiche : '+name);
     btn.appendChild(makeImage('bandeau-'+(i+1),i<2?'eager':'lazy'));
     btn.addEventListener('click',()=>go(DETAIL,IDS[i]));group.appendChild(btn);
   });
   root.appendChild(group);
   const footer=document.createElement('footer');footer.className='ev11-footer';
   footer.textContent='SPORT & NUTRITION · ÉTIREMENTS · ÉPAULES & BRAS';
   root.appendChild(footer);main.appendChild(root);
 }
 function patchDetail(){
   // Laisse la fiche Épaules V1 créer les textes, statuts, conseils et boutons vidéo.
   // Seul le fond visuel est remplacé par une image sans écritures incrustées.
   const ix=IDS.indexOf(state.eeb1Selected);
   const hero=main.querySelector('.eeb1-detail .eeb1-hero');
   if(!hero)return;
   hero.style.setProperty('background-image',`linear-gradient(90deg,rgba(0,48,41,.98) 0%,rgba(0,48,41,.88) 42%,rgba(0,48,41,.25) 80%,transparent 100%),url("${img('photo-'+((ix<0?0:ix)+1))}")`,'important');
   hero.style.setProperty('background-size','cover','important');
   hero.style.setProperty('background-position','right center','important');
   const h1=hero.querySelector('h1');
   if(h1)h1.setAttribute('title',NAMES[ix<0?0:ix]);
 }
 const style=document.createElement('style');
 style.textContent=`
 body.ez1-active #main:has(.ev11-screen){margin:0!important;padding:0!important;width:100%!important;max-width:none!important;min-height:100dvh;background:#003a34;}
 .ev11-screen,.ev11-screen *{box-sizing:border-box;}
 .ev11-screen{width:100%;max-width:720px;min-height:100dvh;margin:0 auto;padding:12px 0 26px;display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);background:#003a34;color:white;}
 .ev11-back{align-self:flex-start;margin:3px 3% 0;min-height:47px;padding:10px 17px;background:#07483e;border:2px solid #eaba79;border-radius:28px;color:white;font-family:inherit;font-weight:700;font-size:clamp(15px,3.9vw,21px);line-height:1.25;cursor:pointer;}
 .ev11-header,.ev11-card{display:block;position:relative;flex:0 0 auto;width:100%;margin:0;padding:0;border:0;background:none;line-height:0;}
 .ev11-header{aspect-ratio:941/388;}
 .ev11-list{display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);width:100%;}
 .ev11-card{aspect-ratio:941/319;height:auto;cursor:pointer;touch-action:manipulation;}
 .ev11-header>img,.ev11-card>img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;pointer-events:none;user-select:none;}
 .ev11-card:active{filter:brightness(1.12)}
 .ev11-card:focus-visible,.ev11-back:focus-visible{outline:3px solid #fff0bd;outline-offset:2px;}
 .ev11-footer{text-align:center;font-weight:750;letter-spacing:.02em;color:#f1cc97;border-top:1px solid #d6b177;font-size:clamp(11px,2.5vw,14px);margin:16px 4% 0;padding:20px 5px 7px;}
 /* Fiches V1 : suppression du texte coupé et maintien de toute la présentation existante. */
 .eeb1-detail .eeb1-hero{box-sizing:border-box!important;aspect-ratio:auto!important;min-height:clamp(265px,74vw,345px)!important;display:flex!important;align-items:center!important;overflow:hidden!important;border:2px solid #ebba79!important;border-radius:22px!important;}
 .eeb1-detail .eeb1-hero-copy{box-sizing:border-box!important;width:65%!important;max-width:65%!important;padding:19px 2.7% 19px 4.2%!important;min-width:0!important;}
 .eeb1-detail .eeb1-hero h1{display:block!important;color:#fff!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;max-height:none!important;max-width:none!important;font-size:clamp(1.34rem,5.0vw,2.45rem)!important;line-height:1.13!important;overflow-wrap:break-word!important;word-break:normal!important;hyphens:auto!important;margin:0 0 11px!important;}
 .eeb1-detail .eeb1-hero-kicker{white-space:normal!important;font-size:clamp(.68rem,2.4vw,.92rem)!important;line-height:1.2!important;}
 .eeb1-detail .eeb1-hero p{white-space:normal!important;overflow:visible!important;font-size:clamp(.76rem,3vw,1.07rem)!important;line-height:1.32!important;}
 .eeb1-detail .eeb1-stats{box-sizing:border-box!important;}
 .eeb1-detail .eeb1-stat{min-width:0!important;overflow:hidden;}
 .eeb1-detail .eeb1-stat strong{overflow-wrap:anywhere!important;white-space:normal!important;}
 .eeb1-detail .eeb1-panel h2{white-space:normal!important;}
 @media(max-width:370px){.eeb1-detail .eeb1-hero-copy{width:69%!important;max-width:69%!important;}.eeb1-detail .eeb1-hero h1{font-size:1.3rem!important;}}
 @media(min-width:760px){.ev11-screen{border-radius:22px;padding:18px 0 30px;}}
 `;
 document.head.appendChild(style);
 const previousRender=render;
 render=function(){
   if(state.view===LIST)return list();
   const value=previousRender.apply(this,arguments);
   if(state.view===DETAIL)patchDetail();
   return value;
 };
})();
