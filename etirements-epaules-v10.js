/* Étirements Épaules & bras – V10, image validée reproduite pixel pour pixel.
   Les intitulés, icônes, portraits, paysages, bordures et espacements sont intégrés
   dans UNE SEULE image originale. Aucun recadrage CSS des photos.
   Les zones transparentes ne font que rendre les 10 exercices cliquables.
   L'accueil V7, Nuque & cervicales V8, les fiches et la synchronisation ne changent pas. */
(function(){
  'use strict';
  const VIEW='etirements-epaules-liste', DETAIL='etirements-epaules-fiche';
  const ITEMS = [{"id": "cercles", "title": "Cercles d’épaules", "y": 367, "end": 513}, {"id": "haussement", "title": "Haussement et relâchement", "y": 527, "end": 667}, {"id": "deltoide", "title": "Étirement du deltoïde", "y": 678, "end": 810}, {"id": "triceps", "title": "Étirement des triceps", "y": 821, "end": 951}, {"id": "ouverture-poitrine", "title": "Ouverture poitrine et biceps", "y": 959, "end": 1092}, {"id": "avantbras", "title": "Étirement des avant-bras", "y": 1105, "end": 1235}, {"id": "triceps-haut", "title": "Étirement du triceps au-dessus de la tête", "y": 1241, "end": 1376}, {"id": "ouverture-epaules", "title": "Ouverture des épaules", "y": 1386, "end": 1516}, {"id": "biceps-mur", "title": "Étirement des biceps contre le mur", "y": 1523, "end": 1666}, {"id": "epaule-croisee", "title": "Étirement croisé de l’épaule", "y": 1677, "end": 1822}];
  const PHOTO='./etirements-epaules-visuel-valide-v10.webp?v=10';
  function navigate(view,id){
    if(id) state.eeb1Selected=id;
    state.view=view;state.selected=null;render();
    try{window.scrollTo({top:0,behavior:'instant'})}catch(_){window.scrollTo(0,0)}
  }
  function show(){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function') updateShell();
    if(typeof bottomNav!=='undefined') bottomNav.classList.add('hidden');
    main.replaceChildren();
    const root=document.createElement('section');
    root.className='ev10-screen';
    root.setAttribute('aria-label','Étirements : Épaules et bras, 10 exercices');
    const frame=document.createElement('div');frame.className='ev10-frame';
    const image=document.createElement('img');image.className='ev10-art';
    image.src=PHOTO;image.alt='Épaules et bras : dix bandeaux au bord d’un lac au coucher du soleil';
    image.decoding='async';image.loading='eager';image.draggable=false;
    frame.appendChild(image);
    function addHit(text,coords,cb){
      const b=document.createElement('button');b.type='button';b.className='ev10-hit';
      b.setAttribute('aria-label',text);
      b.style.left=(coords[0]/841*100)+'%';
      b.style.top=(coords[1]/1870*100)+'%';
      b.style.width=(coords[2]/841*100)+'%';
      b.style.height=(coords[3]/1870*100)+'%';
      b.addEventListener('click',cb);frame.appendChild(b);
    }
    addHit('Retour aux catégories d’exercices',[23,9,307,57],()=>navigate('etirements-exercices'));
    ITEMS.forEach(item=>addHit('Voir la fiche : '+item.title,[23,item.y,787,item.end-item.y],()=>navigate(DETAIL,item.id)));
    root.appendChild(frame);main.appendChild(root);
  }
  const css=document.createElement('style');
  css.textContent=`
    .ev10-screen{box-sizing:border-box;display:block;width:100%;max-width:841px;margin:0 auto;padding:0 0 12px;background:#003a34;min-height:100dvh;}
    .ev10-frame{position:relative;width:100%;height:auto;line-height:0;}
    .ev10-art{display:block;width:100%;height:auto;object-fit:contain;pointer-events:none;user-select:none;}
    .ev10-hit{position:absolute;margin:0;padding:0;background:transparent;border:0;box-shadow:none;appearance:none;cursor:pointer;touch-action:manipulation;border-radius:12px;}
    .ev10-hit:focus-visible{outline:3px solid #fff5cb;outline-offset:-3px;}
    .ev10-hit:active{background:rgba(255,255,255,.035);}
  `;
  document.head.appendChild(css);
  const previous=render;
  render=function(){if(state.view===VIEW)return show();return previous.apply(this,arguments);};
})();
