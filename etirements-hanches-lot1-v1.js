/* Hanches & fessiers : accueil + exercices 1 a 4.
   Ajoute la navigation sans changer les autres catégories déjà validées. */
(function(){
  'use strict';
  const GROUPS='etirements-exercices';
  const LIST='etirements-hanches-liste';
  const DETAIL='etirements-hanches-fiche';
  const EXERCISES=[
    {id:'piriforme-assis',title:'Étirement du piriforme assis'},
    {id:'papillon-assis',title:'Papillon assis'},
    {id:'figure-4-allongee',title:'Étirement en figure 4 allongée'},
    {id:'pigeon-adapte',title:'Posture du pigeon adaptée'}
  ];
  let selected=0;
  function go(view,index){
    if(Number.isInteger(index))selected=index;
    state.view=view;
    state.selected=null;
    render();
    try{window.scrollTo(0,0);}catch(_e){}
  }
  function createScreen(label,isDetail){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function') updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.replaceChildren();
    const el=document.createElement('section');
    el.className='hf1-screen'+(isDetail?' hf1-detail':' hf1-list');
    el.setAttribute('aria-label',label);
    main.appendChild(el);
    return el;
  }
  function img(path,name,alt){
    const el=document.createElement('img');
    el.className=name||'';
    el.src='./'+path+'?v=1';
    el.alt=alt||'';
    el.draggable=false;
    el.decoding='async';
    return el;
  }
  function back(label,target){
    const el=document.createElement('button');
    el.type='button';el.className='hf1-back';el.textContent='← '+label;
    el.addEventListener('click',()=>go(target));
    return el;
  }
  function showList(){
    const screen=createScreen('Étirements — Hanches & fessiers : 4 exercices sur 10',false);
    screen.appendChild(back('Retour aux Exercices',GROUPS));
    screen.appendChild(img('etirements-hanches-entete-v1.webp','hf1-header',
      'Hanches et fessiers. Choisissez un exercice. Mobilité douce, ouverture des hanches et relâchement des fessiers.'));
    EXERCISES.forEach((exercise,index)=>{
      const button=document.createElement('button');
      button.type='button';button.className='hf1-band';
      button.setAttribute('aria-label','Ouvrir la fiche : '+exercise.title);
      const version='v5';
      const picture=img('etirements-hanches-bandeau-'+(index+1)+'-'+version+'.webp','hf1-band-image','');
      picture.loading=index===0?'eager':'lazy';
      button.appendChild(picture);
      button.addEventListener('click',()=>go(DETAIL,index));
      screen.appendChild(button);
    });
    const note=document.createElement('p');note.className='hf1-note';
    note.textContent='Les 6 autres étirements des hanches et fessiers seront ajoutés après validation.';
    screen.appendChild(note);
  }
  function openVideoNotice(ex){
    if(main.querySelector('.hf1-video-modal'))return;
    const shade=document.createElement('div');
    shade.className='hf1-video-modal';
    shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
    shade.setAttribute('aria-label','Démonstration vidéo');
    const card=document.createElement('div');card.className='hf1-video-card';
    const h=document.createElement('h2');h.textContent='Démonstration bientôt disponible';
    const p=document.createElement('p');
    p.textContent='La vidéo explicative de « '+ex.title+' » sera ajoutée prochainement. Les conseils de la fiche sont déjà disponibles.';
    const close=document.createElement('button');
    close.type='button';close.className='hf1-video-close';close.textContent='Revenir à l’exercice';
    const dismiss=()=>{shade.remove();document.removeEventListener('keydown',onEscape);};
    const onEscape=ev=>{if(ev.key==='Escape')dismiss();};
    close.addEventListener('click',dismiss);
    shade.addEventListener('click',ev=>{if(ev.target===shade)dismiss();});
    document.addEventListener('keydown',onEscape);
    card.append(h,p,close);shade.appendChild(card);main.appendChild(shade);
    close.focus();
  }
  function showDetail(){
    const ex=EXERCISES[selected]||EXERCISES[0];
    const screen=createScreen('Fiche étirement : '+ex.title,true);
    const holder=document.createElement('div');holder.className='hf1-stack';
    // La fiche est découpée UNIQUEMENT dans les espaces vides entre les encadrés.
    // Les 7 blocs sont affichés sans étirer les images et les contours dorés.
    for(let partNum=1;partNum<=7;partNum++){
      const isBack=partNum===1;
      const isVideo=partNum===7;
      const isInteractive=isBack||isVideo;
      const part=document.createElement(isInteractive?'button':'div');
      if(isInteractive)part.type='button';
      part.className='hf1-part'+(isVideo?' hf1-part--video':'')+(isBack?' hf1-part--back':'');
      const version=selected<2?'v1':'v2';
      const picture=img('etirements-hanches-panneau-'+(selected+1)+'-'+partNum+'-'+version+'.webp','hf1-panel-image','');
      picture.loading=partNum===1?'eager':'lazy';
      part.appendChild(picture);
      if(isBack){
        part.setAttribute('aria-label','Retour à Hanches & fessiers');
        part.addEventListener('click',()=>go(LIST));
      }
      if(isVideo){
        part.setAttribute('aria-label','Voir la vidéo explicative : '+ex.title);
        part.title='Voir la vidéo explicative — prochainement';
        part.addEventListener('click',()=>openVideoNotice(ex));
      }
      holder.appendChild(part);
    }
    screen.appendChild(holder);
  }
  function activateHanches(){
    const cards=Array.from(document.querySelectorAll('.et7-zones .et7-picture-card'));
    const target=cards.find(el=>(el.getAttribute('aria-label')||'').startsWith('Hanches & fessiers'));
    if(target&&!target.dataset.hf1Ready){
      const button=document.createElement('button');
      button.type='button';
      button.className=target.className.replace(/\bet7-soon\b/g,'').trim();
      button.dataset.hf1Ready='1';
      button.setAttribute('aria-label','Hanches & fessiers : 4 exercices disponibles sur 10 prévus');
      while(target.firstChild)button.appendChild(target.firstChild);
      button.addEventListener('click',()=>go(LIST));
      target.replaceWith(button);
      return;
    }
    const older=Array.from(document.querySelectorAll('.et6-list .et6-card'))
      .find(el=>(el.getAttribute('aria-label')||'').startsWith('Hanches & fessiers'));
    if(older&&!older.dataset.hf1Ready){
      older.disabled=false;
      older.dataset.hf1Ready='1';
      older.setAttribute('aria-label','Hanches & fessiers : 4 exercices disponibles');
      older.addEventListener('click',()=>go(LIST));
    }
  }
  const previousRender=render;
  render=function(){
    if(state.view===LIST)return showList();
    if(state.view===DETAIL)return showDetail();
    const result=previousRender.apply(this,arguments);
    if(state.view===GROUPS)activateHanches();
    return result;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
    if(state.view===GROUPS)activateHanches();
  },{once:true});
  else if(state.view===GROUPS)activateHanches();
})();
