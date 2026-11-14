/* Correctif minimal Épaules & bras V9 – catalogue, fiches et synchro inchangés. */
(function(){
 'use strict';
 const LIST='etirements-epaules-liste';
 const IDS=['cercles','haussement','deltoide','triceps','ouverture-poitrine','avantbras','triceps-haut','ouverture-epaules','biceps-mur','epaule-croisee'];
 const TITLES=['Cercles d’épaules','Haussement et relâchement','Étirement du deltoïde','Étirement des triceps','Ouverture poitrine et biceps','Étirement des avant-bras','Étirement du triceps au-dessus de la tête','Ouverture des épaules','Étirement des biceps contre le mur','Étirement croisé de l’épaule'];
 function nav(view,id){if(id)state.eeb1Selected=id;state.view=view;state.selected=null;render();try{window.scrollTo(0,0)}catch(e){}}
 function show(){
  document.body.classList.add('ez1-active');
  if(typeof updateShell==='function')updateShell();
  if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
  main.replaceChildren();
  const root=document.createElement('section');root.className='ev9-screen';root.setAttribute('aria-label','Épaules et bras : dix exercices');
  const back=document.createElement('button');back.className='ev9-back';back.type='button';back.textContent='← Retour aux Exercices';back.addEventListener('click',()=>nav('etirements-exercices'));root.appendChild(back);
  const cover=document.createElement('img');cover.className='ev9-header';cover.src='./etirements-epaules-entete-v9.webp?v=9';cover.alt='Étirements Épaules et bras, dix exercices';cover.decoding='async';root.appendChild(cover);
  TITLES.forEach((name,i)=>{
    const btn=document.createElement('button');btn.type='button';btn.className='ev9-card';btn.setAttribute('aria-label','Ouvrir '+name);
    const pic=document.createElement('img');pic.alt='';pic.decoding='async';pic.loading=i<2?'eager':'lazy';pic.src='./etirements-epaules-bandeau-'+(i+1)+'-v9.webp?v=9';
    btn.appendChild(pic);btn.addEventListener('click',()=>nav('etirements-epaules-fiche',IDS[i]));root.appendChild(btn);
  });
  const footer=document.createElement('footer');footer.className='ev9-footer';footer.textContent='SPORT & NUTRITION · ÉTIREMENTS · ÉPAULES & BRAS';root.appendChild(footer);
  main.appendChild(root);
 }
 const css=document.createElement('style');css.textContent=`
 .ev9-screen{box-sizing:border-box;min-height:100dvh;background:#003a34;padding:14px 10px 34px;display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);max-width:880px;margin:0 auto;}
 .ev9-back{align-self:flex-start;border:2px solid #dca664;border-radius:35px;color:#fff;background:#064c42;font-size:clamp(15px,3.9vw,23px);font-weight:700;padding:13px 20px;cursor:pointer;}
 .ev9-header,.ev9-card img{display:block;width:100%;height:auto;object-fit:contain;}
 .ev9-card{box-sizing:border-box;display:block;position:relative;flex:0 0 auto;width:100%;height:auto;aspect-ratio:941/319;border:0;background:transparent;margin:0;padding:0;border-radius:0;cursor:pointer;line-height:0;}
 .ev9-card img{height:100%;pointer-events:none;user-select:none;}
 .ev9-card:focus-visible,.ev9-back:focus-visible{outline:3px solid #ffe7bb;outline-offset:2px;}
 .ev9-footer{text-align:center;color:#f4cf8e;font-size:clamp(11px,2.5vw,15px);padding:20px 5px;border-top:1px solid #bda06f;margin-top:10px;font-weight:700;}
 `;document.head.appendChild(css);
 const prev=render;render=function(){if(state.view===LIST)return show();return prev.apply(this,arguments)};
})();
