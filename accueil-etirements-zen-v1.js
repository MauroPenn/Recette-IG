/* Sport & Nutrition — Vignette Étirements zen V1 — 13/11/2026.
 * Met uniquement à jour l'image de la vignette Étirements sur l'accueil.
 * Ne modifie ni les autres univers, ni les données, ni la synchronisation V5.
 */
(function(){
  'use strict';
  const ZEN_IMAGE='./univers-etirements-zen-v1.webp?v=1';
  function update(){
    if(typeof state==='undefined'||state.view!=='hub'||typeof main==='undefined')return;
    const card=main.querySelector('.uv1-card[data-uv1="etirements"]');
    const photo=card?.querySelector('.uv1-full-card-image');
    if(!photo)return;
    card.setAttribute('aria-label','Étirements — Découvrir');
    if(photo.getAttribute('src')!==ZEN_IMAGE)photo.setAttribute('src',ZEN_IMAGE);
  }
  const before=render;
  render=function(){
    const result=before.apply(this,arguments);
    update();
    return result;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});
  else update();
})();
