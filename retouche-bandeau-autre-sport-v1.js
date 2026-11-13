/* SPORT & NUTRITION — Accueil Autre sport : masquer l'ancien badge incrusté.
   Retouche locale du ciel à l'affichage, sans remplacer l'image d'origine.
   Ne modifie aucun historique, aucun service worker et aucun module sportif.
*/
(function(){
  'use strict';
  let imageCache=null;
  const cardSelector='.uv1-card[data-uv1="autre-sport"]';
  const imageSelector='.uv1-full-card-image';
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

  function retouch(image){
    const w=image.naturalWidth, h=image.naturalHeight;
    if(!w||!h)return null;
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return null;
    ctx.drawImage(image,0,0,w,h);
    const bitmap=ctx.getImageData(0,0,w,h),pixels=bitmap.data;
    // Zone du badge « À VENIR » de la vignette originale, 610 x 399.
    // Reconstruire uniquement le ciel sous cette zone en reliant les teintes
    // du ciel à gauche et à droite, avec des contours adoucis.
    const left=Math.round(w*14/610),right=Math.round(w*162/610);
    const top=Math.round(h*13/399),bottom=Math.round(h*80/399);
    const featherX=Math.max(2,Math.round(w*12/610));
    const featherY=Math.max(2,Math.round(h*12/399));
    for(let y=top;y<bottom;y++){
      const li=(y*w+left)*4,ri=(y*w+right)*4;
      const l=[pixels[li],pixels[li+1],pixels[li+2]];
      const r=[pixels[ri],pixels[ri+1],pixels[ri+2]];
      for(let x=left+1;x<right;x++){
        const tx=(x-left)/(right-left);
        const fx=clamp(Math.min((x-left)/featherX,(right-x)/featherX),0,1);
        const fy=clamp(Math.min((y-top)/featherY,(bottom-y)/featherY),0,1);
        // Courbe douce pour conserver une transition sans rectangle visible.
        let alpha=Math.min(fx,fy);alpha=alpha*alpha*(3-2*alpha);
        const i=(y*w+x)*4;
        for(let c=0;c<3;c++){
          const sky=l[c]*(1-tx)+r[c]*tx;
          pixels[i+c]=Math.round(pixels[i+c]*(1-alpha)+sky*alpha);
        }
      }
    }
    ctx.putImageData(bitmap,0,0);
    return canvas.toDataURL('image/webp',0.92);
  }

  function update(){
    if(typeof state==='undefined'||state.view!=='hub')return;
    const card=document.querySelector(cardSelector);
    if(!card)return;
    card.setAttribute('aria-label','Autre sport — Disponible');
    const image=card.querySelector(imageSelector);
    if(!image||image.dataset.asBadgeFix==='1')return;
    if(imageCache){image.dataset.asBadgeFix='1';image.src=imageCache;return;}
    if(!image.complete||!image.naturalWidth){
      if(image.dataset.asBadgeWait!=='1'){
        image.dataset.asBadgeWait='1';
        image.addEventListener('load',()=>{image.dataset.asBadgeWait='0';update();},{once:true});
      }
      return;
    }
    try{
      const result=retouch(image);
      if(!result)return;
      imageCache=result;
      image.dataset.asBadgeFix='1';
      image.src=result;
    }catch(error){
      // Jamais de vignette cassée en cas de navigateur récalcitrant.
      console.warn('Bandeau Autre sport conservé sans retouche :',error);
    }
  }
  const previous=render;
  render=function(){
    const result=previous.apply(this,arguments);
    if(state.view==='hub')update();
    return result;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});
  else update();
})();
