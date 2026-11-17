/* Hanches & fessiers : exercices 5, 6 et 7.
   Les quatre premiers exercices, les autres univers et leurs fiches restent inchanges. */
(function(){
  'use strict';
  const LIST='etirements-hanches-liste';
  const DETAIL='etirements-hanches-suite-fiche';
  const GROUPS='etirements-exercices';
  const DATA=[
    {id:5,title:'Fente basse du psoas'},
    {id:6,title:'Rotation des hanches allongée'},
    {id:7,title:'Adducteurs assis, jambes écartées'}
  ];
  let current=5;
  function go(view,id){
    if(id)current=id;
    state.view=view;
    state.selected=null;
    render();
    try{window.scrollTo(0,0);}catch(_e){}
  }
  function image(src,cssName,alt){
    const el=document.createElement('img');
    el.src='./'+src+'?v=6';
    el.className=cssName;
    el.alt=alt||'';
    el.decoding='async';el.draggable=false;
    return el;
  }
  function patchList(){
    const screen=main.querySelector('.hf1-screen.hf1-list');
    if(!screen || screen.dataset.hfSuite==='done')return;
    screen.dataset.hfSuite='done';
    const note=screen.querySelector('.hf1-note');
    DATA.forEach(ex=>{
      const button=document.createElement('button');
      button.type='button';button.className='hf1-band';
      button.setAttribute('aria-label','Ouvrir la fiche : '+ex.title);
      const picture=image('etirements-hanches-bandeau-'+ex.id+'-v6.webp','hf1-band-image','');
      picture.loading=ex.id===5?'eager':'lazy';
      button.appendChild(picture);
      button.addEventListener('click',()=>go(DETAIL,ex.id));
      if(note)screen.insertBefore(button,note);else screen.appendChild(button);
    });
    if(note)note.textContent='Les 3 autres étirements des hanches et fessiers seront ajoutés après validation.';
    screen.setAttribute('aria-label','Étirements — Hanches & fessiers : 7 exercices sur 10');
  }
  function videoNotice(title){
    if(main.querySelector('.hf1-video-modal'))return;
    const shade=document.createElement('div');
    shade.className='hf1-video-modal';shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
    shade.setAttribute('aria-label','Démonstration vidéo');
    const card=document.createElement('div');card.className='hf1-video-card';
    const h=document.createElement('h2');h.textContent='Démonstration bientôt disponible';
    const p=document.createElement('p');p.textContent='La vidéo explicative de « '+title+' » sera ajoutée prochainement. Les conseils de la fiche sont déjà disponibles.';
    const btn=document.createElement('button');btn.type='button';btn.className='hf1-video-close';btn.textContent='Revenir à l’exercice';
    function remove(){shade.remove();document.removeEventListener('keydown',escape);}
    function escape(e){if(e.key==='Escape')remove();}
    btn.addEventListener('click',remove);
    shade.addEventListener('click',e=>{if(e.target===shade)remove();});
    document.addEventListener('keydown',escape);
    card.append(h,p,btn);shade.appendChild(card);main.appendChild(shade);
    btn.focus();
  }
  function showDetail(){
    const ex=DATA.find(x=>x.id===current)||DATA[0];
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function')updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.replaceChildren();
    const screen=document.createElement('section');
    screen.className='hf1-screen hf1-detail';
    screen.setAttribute('aria-label','Fiche étirement : '+ex.title);
    const holder=document.createElement('div');holder.className='hf1-stack';
    for(let p=1;p<=7;p++){
      const isBack=p===1,isVideo=p===7;
      const part=document.createElement(isBack||isVideo?'button':'div');
      if(isBack||isVideo)part.type='button';
      part.className='hf1-part'+(isBack?' hf1-part--back':'')+(isVideo?' hf1-part--video':'');
      const picture=image('etirements-hanches-panneau-'+ex.id+'-'+p+'-v6.webp','hf1-panel-image','');
      picture.loading=p===1?'eager':'lazy';
      part.appendChild(picture);
      if(isBack){part.setAttribute('aria-label','Retour à Hanches & fessiers');part.addEventListener('click',()=>go(LIST));}
      if(isVideo){part.setAttribute('aria-label','Voir la vidéo explicative : '+ex.title);part.title='Voir la vidéo explicative';part.addEventListener('click',()=>videoNotice(ex.title));}
      holder.appendChild(part);
    }
    screen.appendChild(holder);main.appendChild(screen);
  }
  const previous=render;
  render=function(){
    if(state.view===DETAIL)return showDetail();
    const answer=previous.apply(this,arguments);
    if(state.view===LIST)patchList();
    return answer;
  };
})();
