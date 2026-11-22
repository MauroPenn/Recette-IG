/* TRICEPS V2 — nettoyage des traits blancs directement dans le rendu de chaque image.
   Boutons dorés et présentation V1 préservés, aucune modification des fiches. */
(function(){
  'use strict';
  const cache = new Map();
  const sel = '.muscu-triceps-photo img, #mcsCatalog .mcs-catalog-row[data-mcs-toggle^="triceps:"] img.mcs-thumb';
  const filename = s => /(?:^|\/)triceps-[a-z0-9-]+\.webp(?:\?.*)?$/i.test(s || '');
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  function clean(src){
    if(cache.has(src)) return cache.get(src);
    const p = new Promise((resolve,reject)=>{
      const im = new Image();
      im.onload=()=>{
        try {
          const w=560,h=190,c=document.createElement('canvas');
          c.width=w;c.height=h;
          const ctx=c.getContext('2d',{willReadFrequently:true});
          if(!ctx)throw Error('Canvas non disponible');
          /* On garde le cadrage entier : le recadrage V1 laissait deux liserés blancs. */
          ctx.drawImage(im,0,0,w,h);
          let frame=ctx.getImageData(0,0,w,h);
          const data=frame.data;
          const source=new Uint8ClampedArray(data);
          const pos=(x,y)=>(y*w+x)*4;
          const bright=(arr,i)=>Math.min(arr[i],arr[i+1],arr[i+2])>146 &&
            Math.max(arr[i],arr[i+1],arr[i+2])-Math.min(arr[i],arr[i+1],arr[i+2])<47;
          /* Localise les barres blanches horizontales dans la partie supérieure et
             inférieure de l'image, plutôt que de supposer qu'elles sont au bord. */
          let rows=[];
          for(let y=5;y<h-5;y++){
            if(!(y<65 || y>125))continue;
            let n=0;
            for(let x=15;x<w-15;x++)if(bright(source,pos(x,y)))n++;
            if(n>255)rows.push(y);
          }
          const upper=rows.filter(y=>y<65);
          const lower=rows.filter(y=>y>125);
          function paint(x,y,sx,sy,opacity=1){
            let i=pos(x,y),j=pos(clamp(sx,0,w-1),clamp(sy,0,h-1));
            for(let k=0;k<3;k++)data[i+k]=Math.round(
              source[i+k]*(1-opacity)+source[j+k]*opacity);
          }
          /* Efface chaque liseré clair et son antialiasing gris, ainsi que les
             portions verticales du cadre, sans effacer le texte de l'exercice. */
          const near=(list,y,d)=>list.some(q=>Math.abs(q-y)<=d);
          for(let y=0;y<h;y++){
            for(let x=0;x<w;x++){
              const i=pos(x,y), lum=(source[i]+source[i+1]+source[i+2])/3;
              const neutral=Math.max(source[i],source[i+1],source[i+2])-
                    Math.min(source[i],source[i+1],source[i+2])<55;
              if(!neutral||lum<90)continue;
              let target=null;
              if(near(upper,y,4) && x>=12 && x<=548){
                const edge=Math.max(...upper);
                target=[x,clamp(edge+12,0,h-1)];
              } else if(near(lower,y,4) && x>=12 && x<=548){
                const edge=Math.min(...lower);
                target=[x,clamp(edge-12,0,h-1)];
              } else if(x<18 && y>10 && y<178){
                target=[clamp(x+23,0,w-1),y];
              } else if(x>541 && y>10 && y<178){
                target=[clamp(x-23,0,w-1),y];
              }
              if(target) paint(x,y,target[0],target[1],clamp((lum-85)/70,0,1));
            }
          }
          /* Supprime l'ancienne flèche incrustée, en conservant le fond sombre. */
          const cx=513,cy=88,rx=43,ry=48;
          for(let y=34;y<143;y++){
            for(let x=458;x<560;x++){
              const d=Math.hypot((x-cx)/rx,(y-cy)/ry);
              if(d>=1)continue;
              const a=d<.75?1:clamp((1-d)/.25,0,1);
              const t=clamp((x-458)/99,0,1);
              let i=pos(x,y), l=pos(456,y),r=pos(558,y);
              for(let k=0;k<3;k++){
                let value=source[l+k]*(1-t)+source[r+k]*t;
                data[i+k]=Math.round(source[i+k]*(1-a)+value*a);
              }
            }
          }
          ctx.putImageData(frame,0,0);
          /* Unique contour orange, incrusté au-dessus du fond désormais nettoyé. */
          ctx.strokeStyle='#ff8915';ctx.lineWidth=2.7;
          ctx.beginPath();ctx.roundRect(2,2,w-4,h-4,17);ctx.stroke();
          resolve(c.toDataURL('image/webp',0.93));
        }catch(e){reject(e);}
      };
      im.onerror=()=>reject(Error('Image absente : '+src));
      im.src=src;
    });
    cache.set(src,p);return p;
  }
  function process(img){
    if(img.dataset.tricepsV2)return;
    const src=img.getAttribute('src')||'';
    if(!filename(src))return;
    img.dataset.tricepsV2='pending';
    clean(src).then(url=>{
      if(!img.isConnected)return;
      img.src=url;img.dataset.tricepsV2='done';
    }).catch(()=>{img.dataset.tricepsV2='failed';});
  }
  function scan(root){
    if(root.matches?.(sel))process(root);
    root.querySelectorAll?.(sel).forEach(process);
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',()=>scan(document),{once:true});
  else scan(document);
  new MutationObserver(mutations=>{
    for(const m of mutations)
      for(const node of m.addedNodes)
        if(node.nodeType===1)scan(node);
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
