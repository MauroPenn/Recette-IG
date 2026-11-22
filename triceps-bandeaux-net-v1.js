/* TRICEPS V1 — Nettoyage des images à l'affichage, sans changer les fiches.
   Les images de 560x190 ont un liseré BLANC et une flèche incrustés.
   Ici on retire ces éléments sur un canvas, une seule fois par image.
   Le catalogue conserve ses identifiants et fichiers originaux. */
(function(){
  'use strict';
  const cache=new Map();
  const imageSelector =
    '.muscu-triceps-photo img, #mcsCatalog .mcs-catalog-row[data-mcs-toggle^="triceps:"] img.mcs-thumb';
  const isTriceps=(src)=>/(?:^|\/)triceps-[a-z-]+\.webp(?:\?.*)?$/i.test(src||'');
  function clean(src){
    if(cache.has(src))return cache.get(src);
    const promise=new Promise((resolve,reject)=>{
      const original=new Image();
      original.onload=()=>{
        try{
          const w=560,h=190;
          const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});
          if(!ctx)throw Error('canvas unsupported');
          /* Coupe 8px autour de l'ancien cadre blanc, sans couper le texte. */
          const ox=Math.min(8,Math.floor(original.naturalWidth*.014));
          const oy=Math.min(7,Math.floor(original.naturalHeight*.037));
          ctx.drawImage(original,ox,oy,original.naturalWidth-ox*2,
                        original.naturalHeight-oy*2,0,0,w,h);
          /* Efface la flèche d'origine à droite, en reconstruisant le fond
             par interpolation des pixels situés de chaque côté de la zone. */
          const frame=ctx.getImageData(0,0,w,h);
          const source=new Uint8ClampedArray(frame.data);
          const data=frame.data;
          const cx=513,cy=87,rx=43,ry=46;
          for(let y=37;y<=143;y++){
            if(y<0||y>=h)continue;
            const row=y*w*4;
            for(let x=461;x<=559;x++){
              if(x<0||x>=w)continue;
              const dx=(x-cx)/rx,dy=(y-cy)/ry;
              const rr=dx*dx+dy*dy;
              if(rr>=1)continue;
              const d=Math.sqrt(rr);
              const alpha=d<.72?1:Math.max(0,Math.min(1,(1-d)/.28));
              const li=row+459*4,ri=row+558*4,i=row+x*4;
              const t=Math.max(0,Math.min(1,(x-459)/(558-459)));
              for(let c=0;c<3;c++){
                const fill=source[li+c]*(1-t)+source[ri+c]*t;
                data[i+c]=Math.round(data[i+c]*(1-alpha)+fill*alpha);
              }
            }
          }
          ctx.putImageData(frame,0,0);
          /* Contour unique orange sans couche blanche résiduelle. */
          ctx.strokeStyle='#ff8915';ctx.lineWidth=2.7;
          ctx.beginPath();ctx.roundRect(2,2,w-4,h-4,17);ctx.stroke();
          resolve(canvas.toDataURL('image/webp',.91));
        }catch(e){reject(e);}
      };
      original.onerror=()=>reject(Error('image indisponible : '+src));
      original.src=src;
    });
    cache.set(src,promise);return promise;
  }
  function process(img){
    if(img.dataset.tricepsCleaned)return;
    const current=img.getAttribute('src')||'';
    if(!isTriceps(current))return;
    img.dataset.tricepsCleaned='pending';
    clean(current).then(uri=>{
      if(!img.isConnected)return;
      img.src=uri;
      img.dataset.tricepsCleaned='yes';
    }).catch(()=>{img.dataset.tricepsCleaned='error';});
  }
  function scan(root){
    if(root.matches?.(imageSelector))process(root);
    root.querySelectorAll?.(imageSelector).forEach(process);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>scan(document),{once:true});
  }else{scan(document);}
  const observer=new MutationObserver(mutations=>{
    for(const m of mutations){
      for(const node of m.addedNodes){if(node.nodeType===1)scan(node);}
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
