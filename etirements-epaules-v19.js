/* Sport & Nutrition / Étirements / Épaules & bras — V19 (14 novembre 2026)
   - Reprend les images des bandeaux validées, toutes au format exact 941×319.
   - Conserve le bandeau n°9 V17, testé sur téléphone, sans en modifier les pixels.
   - Reprend la PARTIE HAUTE des fiches effectivement validées, avec les titres/photo/dégradé
     intégrés à une image complète, sans reconstruire le fondu en CSS.
   - Garde les informations, étapes, conseils, bienfaits, vidéo et navigation en HTML interactif
     issus du module original V1 (retouches V12), pour la lisibilité sur petit écran.
   - Aucune autre catégorie, séance, synchronisation ou donnée n'est modifiée.
*/
(function(){
 'use strict';
 const LIST='etirements-epaules-liste',DETAIL='etirements-epaules-fiche';
 const IDS=['cercles','haussement','deltoide','triceps','ouverture-poitrine','avantbras','triceps-haut','ouverture-epaules','biceps-mur','epaule-croisee'];
 const src=n=>'./etirements-epaules-bandeau-'+n+'-v19.webp?v=19';
 const heroSrc=n=>'./etirements-epaules-hero-'+n+'-v19.webp?v=19';
 const mapped={
  haussement:['Épaules','8 à 10 répétitions','Deux côtés'],
  deltoide:['Épaules','20–30 s','Deux côtés'],
  triceps:['Triceps','20–30 s','Deux côtés'],
  'ouverture-poitrine':['Pectoraux / biceps','20–30 s','Deux côtés'],
  avantbras:['Avant-bras','20–30 s','Deux côtés'],
  'triceps-haut':['Triceps','20–30 s','Deux côtés'],
  'ouverture-epaules':['Épaules / poitrine','20–30 s','Deux côtés'],
  'biceps-mur':['Biceps / poitrine','20–30 s','Deux côtés'],
  'epaule-croisee':['Épaules','20–30 s','Deux côtés']
 };
 function patchList(){
  if(state.view!==LIST)return;
  let imgs=[...document.querySelectorAll('.ev14-list .ev14-card img')];
  if(imgs.length!==10)imgs=[...document.querySelectorAll('.ev11-list .ev11-card img')];
  if(imgs.length!==10)imgs=[...document.querySelectorAll('.eeb1-banner-list .eeb1-banner img')];
  if(imgs.length!==10)return;
  imgs.forEach((img,i)=>{
   const n=i+1;
   // This one is the verified-by-phone V17 image; leave the original URL and file entirely unchanged.
   if(n===9){ img.src='./etirements-epaules-bandeau-9-v17.webp?v=17';return; }
   if(img.getAttribute('data-ev19')==='1')return;
   img.src=src(n);img.draggable=false;img.decoding='async';img.loading=n<4?'eager':'lazy';img.setAttribute('data-ev19','1');
  });
 }
 function patchDetail(){
  if(state.view!==DETAIL)return;
  const root=main.querySelector('.eeb1-detail');if(!root)return;
  const ix=IDS.indexOf(state.eeb1Selected),n=ix+1;
  if(n<2 || n>10)return; // Preserve original Cercles d’épaules fiche, which was not replaced here.
  if(root.getAttribute('data-ev19-detail')==='1')return;
  const el=root.querySelector('.eeb1-hero');if(!el)return;
  const fallbackHTML=el.innerHTML, fallbackBg=el.style.backgroundImage;
  const pic=document.createElement('img');
  pic.className='ev19-hero-photo';pic.src=heroSrc(n);pic.alt=IDS[ix]+' : paysage et démonstration';
  pic.decoding='async';pic.loading='eager';
  pic.addEventListener('error',()=>{
   el.classList.remove('ev19-photo-hero');el.innerHTML=fallbackHTML;el.style.backgroundImage=fallbackBg;
  },{once:true});
  el.replaceChildren(pic);el.classList.add('ev19-photo-hero');
  el.style.setProperty('background-image','none','important');
  // Keep all native readable information, instructions, advice, benefits, video button, and return.
  const stats=[...root.querySelectorAll('.eeb1-stat strong')],vals=mapped[IDS[ix]];
  if(stats.length===4 && vals){ stats[0].textContent=vals[0];stats[1].textContent=vals[1];stats[2].textContent='Doux';stats[3].textContent=vals[2]; }
  root.setAttribute('data-ev19-detail','1');
 }
 const style=document.createElement('style');style.id='epaules-v19-validated';
 style.textContent=`
 body.ez1-active .ev14-list .ev14-card, body.ez1-active .ev11-list .ev11-card{aspect-ratio:941/319!important;height:auto!important;min-height:0!important;}
 body.ez1-active .ev14-list .ev14-card img,body.ez1-active .ev11-list .ev11-card img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;transform:none!important;}
 body.ez1-active .ev12-fiche .eeb1-hero.ev19-photo-hero,
 body.ez1-active .eeb1-detail .eeb1-hero.ev19-photo-hero{
   box-sizing:border-box!important;display:block!important;width:96%!important;
   margin:0 2%!important;padding:0!important;line-height:0!important;
   border:0!important;border-radius:0!important;min-height:0!important;
   height:auto!important;max-height:none!important;aspect-ratio:auto!important;
   background-image:none!important;background:none!important;overflow:visible!important;
 }
 body.ez1-active .ev19-photo-hero img.ev19-hero-photo{
   display:block!important;box-sizing:border-box!important;width:100%!important;
   height:auto!important;min-height:0!important;max-height:none!important;
   object-fit:contain!important;object-position:center!important;
   transform:none!important;filter:none!important;
 }
 `;
 document.head.appendChild(style);
 const previousRender=render;
 render=function(){
  const result=previousRender.apply(this,arguments);
  if(state.view===LIST)patchList();
  if(state.view===DETAIL)patchDetail();
  return result;
 };
})();
