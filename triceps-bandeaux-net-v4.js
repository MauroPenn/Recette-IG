/* TRICEPS V4 — correctif propre
   Objectif : partir de la version stable (contour orange + bouton doré)
   et supprimer les liserés blancs restants sans créer de surimpression.
   Méthode : recadrage plus franc de l'image d'origine + masquage propre
   de l'ancienne flèche à droite, puis dessin d'un contour orange unique. */
(function(){
  'use strict';
  const cache = new Map();
  const imageSelector =
    '.muscu-triceps-photo img, #mcsCatalog .mcs-catalog-row[data-mcs-toggle^="triceps:"] img.mcs-thumb';
  const isTriceps = (src) => /(?:^|\/)triceps-[a-z0-9-]+\.webp(?:\?.*)?$/i.test(src || '');

  function clean(src){
    if(cache.has(src)) return cache.get(src);
    const promise = new Promise((resolve,reject)=>{
      const original = new Image();
      original.onload = ()=>{
        try{
          const w = 560, h = 190;
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d', {willReadFrequently:true});
          if(!ctx) throw Error('canvas unsupported');

          /* Recadrage plus fort que V1 pour supprimer le double liseré blanc
             sans toucher au centre où se trouvent photo et texte. */
          const nw = original.naturalWidth || w;
          const nh = original.naturalHeight || h;
          const cropL = Math.min(14, Math.max(10, Math.round(nw * 0.024)));
          const cropR = Math.min(18, Math.max(12, Math.round(nw * 0.030)));
          const cropT = Math.min(10, Math.max(8,  Math.round(nh * 0.048)));
          const cropB = Math.min(10, Math.max(8,  Math.round(nh * 0.048)));

          ctx.drawImage(
            original,
            cropL, cropT,
            Math.max(1, nw - cropL - cropR),
            Math.max(1, nh - cropT - cropB),
            0, 0, w, h
          );

          /* Masque l'ancienne flèche à droite en reconstruisant le fond
             avec interpolation horizontale, sans toucher au texte. */
          const frame = ctx.getImageData(0, 0, w, h);
          const source = new Uint8ClampedArray(frame.data);
          const data = frame.data;
          const cx = 512, cy = 87, rx = 42, ry = 46;

          for(let y = 37; y <= 143; y++){
            if(y < 0 || y >= h) continue;
            const row = y * w * 4;
            for(let x = 460; x <= 559; x++){
              if(x < 0 || x >= w) continue;
              const dx = (x - cx) / rx;
              const dy = (y - cy) / ry;
              const rr = dx*dx + dy*dy;
              if(rr >= 1) continue;
              const d = Math.sqrt(rr);
              const alpha = d < .74 ? 1 : Math.max(0, Math.min(1, (1 - d) / .26));
              const li = row + 456 * 4;
              const ri = row + 558 * 4;
              const i  = row + x * 4;
              const t = Math.max(0, Math.min(1, (x - 456) / (558 - 456)));
              for(let c = 0; c < 3; c++){
                const fill = source[li + c] * (1 - t) + source[ri + c] * t;
                data[i + c] = Math.round(data[i + c] * (1 - alpha) + fill * alpha);
              }
            }
          }

          ctx.putImageData(frame, 0, 0);

          /* Contour orange unique */
          ctx.strokeStyle = '#ff8915';
          ctx.lineWidth = 2.7;
          ctx.beginPath();
          ctx.roundRect(2, 2, w - 4, h - 4, 17);
          ctx.stroke();

          resolve(canvas.toDataURL('image/webp', .92));
        }catch(e){ reject(e); }
      };
      original.onerror = ()=>reject(Error('image indisponible : ' + src));
      original.src = src;
    });
    cache.set(src, promise);
    return promise;
  }

  function process(img){
    if(img.dataset.tricepsCleanedV4) return;
    const current = img.getAttribute('src') || '';
    if(!isTriceps(current)) return;
    img.dataset.tricepsCleanedV4 = 'pending';
    clean(current).then(uri=>{
      if(!img.isConnected) return;
      img.src = uri;
      img.dataset.tricepsCleanedV4 = 'yes';
    }).catch(()=>{
      img.dataset.tricepsCleanedV4 = 'error';
    });
  }

  function scan(root){
    if(root.matches?.(imageSelector)) process(root);
    root.querySelectorAll?.(imageSelector).forEach(process);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>scan(document), {once:true});
  } else {
    scan(document);
  }

  const observer = new MutationObserver(mutations=>{
    for(const m of mutations){
      for(const node of m.addedNodes){
        if(node.nodeType === 1) scan(node);
      }
    }
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
