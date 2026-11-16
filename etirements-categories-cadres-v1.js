/* Correctif des trois visuels validés Dos / Hanches & fessiers / Cuisses.
   Conserve l'accès, les autres catégories et les exercices existants. */
(function(){
  'use strict';
  const VIEW='etirements-exercices';
  const images={
    3:'et7-cadre-corrige-dos-v1.webp',
    4:'et7-cadre-corrige-hanches-v1.webp',
    5:'et7-cadre-corrige-cuisses-v1.webp'
  };
  function update(){
    if(typeof state==='undefined'||state.view!==VIEW||typeof main==='undefined')return;
    const cards=main.querySelectorAll('.et7-zones .et7-picture-card');
    if(cards.length!==7)return;
    for(const [index,name] of Object.entries(images)){
      const img=cards[Number(index)]?.querySelector('img');
      if(!img)continue;
      const src='./'+name+'?v=1';
      if(img.getAttribute('src')!==src)img.setAttribute('src',src);
      img.draggable=false;
    }
  }
  const before=render;
  render=function(){const result=before.apply(this,arguments);update();return result;};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});
  else update();
})();
