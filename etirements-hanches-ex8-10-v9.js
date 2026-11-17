/* Hanches & fessiers – exercices 8, 9, 10, ajout après V7 (5–7).
   Les images sont celles des 3 bandeaux et 3 fiches validés.
   Toutes les autres rubriques et les exercices 1 à 7 restent inchangés. */
(function () {
  'use strict';
  const LIST = 'etirements-hanches-liste';
  const DETAIL = 'etirements-hanches-final-fiche-v8';
  const DATA = [
    {id:8, title:'Genou vers la poitrine allongé'},
    {id:9, title:'Ouverture des hanches en squat assisté'},
    {id:10,title:'Posture de la grenouille adaptée'}
  ];
  let selected = 8;
  function go(view,id){
    if(id) selected=id;
    state.view=view;
    state.selected=null;
    render();
    try{window.scrollTo(0,0);}catch(_e){}
  }
  function picture(filename, className, alt){
    const img=document.createElement('img');
    img.src='./'+filename+'?v=9';
    img.className=className;
    img.alt=alt;
    img.decoding='async';
    img.draggable=false;
    return img;
  }
  function patchList(){
    const list=main.querySelector('.hf1-screen.hf1-list');
    if(!list || list.dataset.hfFinalV8==='done')return;
    list.dataset.hfFinalV8='done';
    const note=list.querySelector('.hf1-note');
    for(const ex of DATA){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='hf1-band hf8-v9-band';
      btn.setAttribute('aria-label','Ouvrir la fiche : '+ex.title);
      const img=picture('etirements-hanches-bandeau-'+ex.id+'-v9.webp','hf1-band-image hf8-v9-image','Bandeau : '+ex.title);
      img.loading='lazy';
      btn.appendChild(img);
      btn.addEventListener('click',()=>go(DETAIL,ex.id));
      if(note)list.insertBefore(btn,note);else list.appendChild(btn);
    }
    if(note)note.remove(); // Il n'y a plus d'exercice en attente.
    list.setAttribute('aria-label','Étirements — Hanches & fessiers : 10 exercices sur 10');
  }
  function videoNotice(title){
    if(main.querySelector('.hf1-video-modal'))return;
    const shade=document.createElement('div');
    shade.className='hf1-video-modal';
    shade.setAttribute('role','dialog');
    shade.setAttribute('aria-modal','true');
    shade.setAttribute('aria-label','Démonstration vidéo');
    const card=document.createElement('div');card.className='hf1-video-card';
    const h=document.createElement('h2');h.textContent='Démonstration bientôt disponible';
    const p=document.createElement('p');p.textContent='La vidéo explicative de « '+title+' » sera ajoutée prochainement. Les consignes de la fiche sont déjà disponibles.';
    const b=document.createElement('button');b.type='button';b.className='hf1-video-close';b.textContent='Revenir à l’exercice';
    function close(){shade.remove();document.removeEventListener('keydown',onEscape);}
    function onEscape(e){if(e.key==='Escape')close();}
    b.addEventListener('click',close);
    shade.addEventListener('click',e=>{if(e.target===shade)close();});
    document.addEventListener('keydown',onEscape);
    card.append(h,p,b);shade.appendChild(card);main.appendChild(shade);b.focus();
  }
  function showDetail(){
    const ex=DATA.find(x=>x.id===selected)||DATA[0];
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function')updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.replaceChildren();
    const screen=document.createElement('section');
    screen.className='hf1-screen hf1-detail hf8-screen';
    screen.setAttribute('aria-label','Fiche étirement : '+ex.title);
    const stack=document.createElement('div');stack.className='hf8-visual';
    const img=picture('etirements-hanches-fiche-'+ex.id+'-v8.webp','hf8-detail-image','Fiche complète : '+ex.title+'. Les étapes, conseils et bienfaits sont présentés dans cette image.');
    img.loading='eager';
    stack.appendChild(img);
    const back=document.createElement('button');
    back.type='button';back.className='hf8-hotspot hf8-hotspot--back';
    back.setAttribute('aria-label','Retour à Hanches & fessiers');
    back.addEventListener('click',()=>go(LIST));
    const video=document.createElement('button');
    video.type='button';video.className='hf8-hotspot hf8-hotspot--video';
    video.setAttribute('aria-label','Voir la vidéo explicative : '+ex.title);
    video.addEventListener('click',()=>videoNotice(ex.title));
    stack.append(back,video);screen.appendChild(stack);main.appendChild(screen);
  }
  const previousRender=render;
  render=function(){
    if(state.view===DETAIL)return showDetail();
    const result=previousRender.apply(this,arguments);
    if(state.view===LIST)patchList();
    return result;
  };
})();
