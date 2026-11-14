/* Sport & Nutrition / Épaules & bras V17 – test ciblé d’un seul bandeau.
   Remplace uniquement le bandeau n°9 : "Étirement des biceps contre le mur".
   Ne touche ni aux fiches, ni aux autres bandeaux, ni aux autres univers. */
(function(){
  'use strict';
  const NEW_SRC='./etirements-epaules-bandeau-9-v17.webp?v=17';
  function patchSingleBand(){
    const selectors=[
      '.ev14-list .ev14-card img',
      '.ev11-list .ev11-card img',
      '.eeb1-banner-list .eeb1-banner img'
    ];
    let imgs=[];
    for(const sel of selectors){
      imgs=Array.from(document.querySelectorAll(sel));
      if(imgs.length) break;
    }
    if(imgs.length>=10){
      imgs[8].src=NEW_SRC;
      imgs[8].loading='eager';
      imgs[8].decoding='async';
      imgs[8].setAttribute('data-v17-patched','1');
    }
  }
  const previousRender=(typeof render==='function')?render:null;
  if(previousRender){
    render=function(){
      const value=previousRender.apply(this,arguments);
      try{patchSingleBand();}catch(e){}
      return value;
    };
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(patchSingleBand,0));
  const obs=new MutationObserver(()=>patchSingleBand());
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
