/* Sport & Nutrition – Épaules & bras, V18 – les 9 autres bandeaux.
   Le bandeau 9 validé en V17 et toutes les fiches restent inchangés.
   Chaque photo est une image complète 941x319, sans déformation. */
(function(){
  'use strict';
  const VIEW='etirements-epaules-liste';
  const EXERCISES=[1,2,3,4,5,6,7,8,10];
  const path=n=>'./etirements-epaules-bandeau-'+n+'-v18.webp?v=18';
  function patch(){
    if(typeof state==='undefined'||state.view!==VIEW)return;
    let images=Array.from(document.querySelectorAll('.ev14-list .ev14-card img'));
    if(images.length!==10)images=Array.from(document.querySelectorAll('.ev11-list .ev11-card img'));
    if(images.length!==10)images=Array.from(document.querySelectorAll('.eeb1-banner-list .eeb1-banner img'));
    if(images.length!==10)return;
    EXERCISES.forEach(n=>{
      const image=images[n-1];
      if(image&&image.getAttribute('data-shoulders-v18')!=='1'){
        image.src=path(n);
        image.loading=n<=3?'eager':'lazy';
        image.decoding='async';
        image.draggable=false;
        image.setAttribute('data-shoulders-v18','1');
      }
    });
    // Do not patch index 8 (bandeau #9): validated V17 stays untouched.
  }
  const originalRender=render;
  render=function(){
    const result=originalRender.apply(this,arguments);
    patch();
    return result;
  };
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',patch,{once:true});
  }else patch();
})();
