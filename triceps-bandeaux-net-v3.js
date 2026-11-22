/* TRICEPS V3 : un seul traitement sur l'IMAGE D'ORIGINE.
   Les contours blancs sont retirés par composantes connexes;
   jamais de recopie de bandes sur les titres. */
(function(){
  'use strict';
  const selector='.muscu-triceps-photo img, #mcsCatalog .mcs-catalog-row[data-mcs-toggle^="triceps:"] img.mcs-thumb';
  const originalRe=/(?:^|\/)triceps-[a-z0-9-]+\.webp(?:\?.*)?$/i;
  const cache=new Map();
  const W=560,H=190;
  const idx=(x,y)=>((y*W+x)<<2);
  const valid=(x,y)=>x>=0&&x<W&&y>=0&&y<H;

  function repair(src){
    if(cache.has(src)) return cache.get(src);
    const job=new Promise((resolve,reject)=>{
      const im=new Image();
      im.onload=()=>{
        try {
          const canvas=document.createElement('canvas');
          canvas.width=W;canvas.height=H;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});
          if(!ctx)throw Error('canvas unavailable');
          ctx.drawImage(im,0,0,W,H);
          const frame=ctx.getImageData(0,0,W,H), data=frame.data;
          const original=new Uint8ClampedArray(data);
          const isBorderPixel=(x,y)=>{
            const p=idx(x,y),r=original[p],g=original[p+1],b=original[p+2];
            return Math.min(r,g,b)>112 &&
                   Math.max(r,g,b)-Math.min(r,g,b)<48;
          };
          /* The white frame is attached to the left/right edges.
             Flood-fill ONLY bright, nearly neutral pixels contiguous
             with that frame. Lettering is a disconnected component. */
          const mask=new Uint8Array(W*H),queue=new Int32Array(W*H);
          let read=0,write=0;
          const push=(x,y)=>{
            const key=y*W+x;
            if(mask[key]||!isBorderPixel(x,y))return;
            mask[key]=1;queue[write++]=key;
          };
          for(let y=0;y<H;y++){
            for(let x=0;x<12;x++){push(x,y);push(W-x-1,y);}
          }
          /* Also seed long horizontal white segments near the frame
             where antialiasing leaves a tiny gap at the edges. */
          for(let y=7;y<60;y++){
            let count=0;
            for(let x=40;x<W-40;x++)if(isBorderPixel(x,y))count++;
            if(count>W*.55)for(let x=15;x<W-15;x++)push(x,y);
          }
          for(let y=130;y<H-6;y++){
            let count=0;
            for(let x=40;x<W-40;x++)if(isBorderPixel(x,y))count++;
            if(count>W*.55)for(let x=15;x<W-15;x++)push(x,y);
          }
          while(read<write){
            const k=queue[read++],x=k%W,y=(k/W)|0;
            if(x>0)push(x-1,y);
            if(x<W-1)push(x+1,y);
            if(y>0)push(x,y-1);
            if(y<H-1)push(x,y+1);
          }
          /* Expand 2 px to remove pale antialiasing fringes. */
          const expanded=new Uint8Array(mask);
          for(let y=0;y<H;y++)for(let x=0;x<W;x++){
            if(!mask[y*W+x])continue;
            for(let yy=Math.max(0,y-2);yy<=Math.min(H-1,y+2);yy++)
              for(let xx=Math.max(0,x-2);xx<=Math.min(W-1,x+2);xx++)
                expanded[yy*W+xx]=1;
          }

          /* Inpaint only selected border pixels. Sample nearby inside
             the frame: no translation of any text or photograph. */
          for(let y=0;y<H;y++)for(let x=0;x<W;x++){
            if(!expanded[y*W+x])continue;
            let sx=x,sy=y;
            if(x<28){sx=x+17;}
            else if(x>W-29){sx=x-17;}
            else if(y<85){sy=y+15;}
            else {sy=y-15;}
            sx=Math.max(0,Math.min(W-1,sx));
            sy=Math.max(0,Math.min(H-1,sy));
            /* keep looking a few pixels inward if source is still border */
            for(let attempt=0;attempt<6&&expanded[sy*W+sx];attempt++){
              if(x<28)sx=Math.min(W-1,sx+7);
              else if(x>W-29)sx=Math.max(0,sx-7);
              else if(y<85)sy=Math.min(H-1,sy+7);
              else sy=Math.max(0,sy-7);
            }
            const a=idx(x,y),b=idx(sx,sy);
            for(let c=0;c<3;c++)data[a+c]=original[b+c];
            data[a+3]=255;
          }

          /* Cover just the embedded arrow at the right with dark
             background; preserve independent gold controls in CSS. */
          const cx=514,cy=88,rx=43,ry=46;
          for(let y=38;y<140;y++){
            for(let x=465;x<W;x++){
              const dist=Math.hypot((x-cx)/rx,(y-cy)/ry);
              if(dist>1)continue;
              const alpha=dist<.8?1:Math.max(0,(1-dist)/.2);
              const a=idx(x,y),b=idx(461,y),c=idx(557,y);
              const t=Math.max(0,Math.min(1,(x-461)/96));
              for(let channel=0;channel<3;channel++){
                const sample=original[b+channel]*(1-t)+original[c+channel]*t;
                data[a+channel]=Math.round(data[a+channel]*(1-alpha)+sample*alpha);
              }
            }
          }
          ctx.putImageData(frame,0,0);
          /* Single orange outer border. */
          ctx.strokeStyle='#ff8915';
          ctx.lineWidth=2.6;
          ctx.beginPath();
          ctx.roundRect(2.1,2.1,W-4.2,H-4.2,17);
          ctx.stroke();
          resolve(canvas.toDataURL('image/webp',.94));
        } catch(error){reject(error);}
      };
      im.onerror=()=>reject(Error('image not found: '+src));
      im.src=src;
    });
    cache.set(src,job);
    return job;
  }
  function process(img){
    const src=img.getAttribute('src')||'';
    if(!originalRe.test(src)||img.dataset.tricepsV3)return;
    img.dataset.tricepsV3='pending';
    repair(src).then(clean=>{
      if(img.isConnected){img.src=clean;img.dataset.tricepsV3='yes';}
    }).catch(err=>{
      img.dataset.tricepsV3='failed';
      console.warn('Triceps V3:',err);
    });
  }
  function scan(node){
    if(node.matches?.(selector))process(node);
    node.querySelectorAll?.(selector).forEach(process);
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',()=>scan(document),{once:true});
  else scan(document);
  new MutationObserver(mutations=>{
    for(const mutation of mutations)
      for(const node of mutation.addedNodes)
        if(node.nodeType===1)scan(node);
  }).observe(document.documentElement,{subtree:true,childList:true});
})();
