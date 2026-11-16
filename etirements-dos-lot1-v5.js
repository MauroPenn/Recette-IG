/* Étirements — Dos : accueil + 2 premiers exercices (visuels validés).
   S'ajoute aux pages existantes sans toucher aux autres catégories. */
(function () {
  'use strict';
  const GROUPS = 'etirements-exercices';
  const LIST = 'etirements-dos-liste';
  const DETAIL = 'etirements-dos-fiche';
  const EXERCISES = [
    {id:'chat-vache', title:'Mobilisation du dos Chat-vache'},
    {id:'posture-enfant', title:'Posture de l’enfant'}
  ];
  let selected = 0;
  function go(view, idx) {
    if (Number.isInteger(idx)) selected = idx;
    state.view = view;
    state.selected = null;
    render();
    try { window.scrollTo(0, 0); } catch (_) {}
  }
  function root(label) {
    document.body.classList.add('ez1-active');
    if (typeof updateShell === 'function') updateShell();
    if (typeof bottomNav !== 'undefined') bottomNav.classList.add('hidden');
    main.replaceChildren();
    const screen = document.createElement('section');
    screen.className = 'dos1-screen';
    screen.setAttribute('aria-label',label);
    main.appendChild(screen);
    return screen;
  }
  function back(label,target) {
    const button = document.createElement('button');
    button.type='button'; button.className='dos1-back';
    button.textContent='← '+label;
    button.addEventListener('click',()=>go(target));
    return button;
  }
  function figure(src,className,alt) {
    const image=document.createElement('img');
    image.className=className;
    image.src=src;
    image.alt=alt;
    image.decoding='async';
    image.draggable=false;
    return image;
  }
  function list() {
    const screen=root('Étirements — Dos, 2 exercices disponibles');
    screen.appendChild(back('Retour aux Exercices',GROUPS));
    const heading=figure('./etirements-dos-entete-v1.webp?v=1','dos1-header',
      'Étirements — Dos. Choisissez un exercice. Mobilité, relâchement et assouplissement du dos.');
    screen.appendChild(heading);
    EXERCISES.forEach((ex,i)=>{
      const button=document.createElement('button');button.type='button';
      button.className='dos1-band';button.setAttribute('aria-label','Ouvrir '+ex.title);
      const image=figure('./etirements-dos-bandeau-'+(i+1)+'-v1.webp?v=1','dos1-band-image','');
      image.loading=i===0?'eager':'lazy';
      button.appendChild(image);
      button.addEventListener('click',()=>go(DETAIL,i));
      screen.appendChild(button);
    });
    const note=document.createElement('p');note.className='dos1-note';
    note.textContent='Les autres étirements du dos seront ajoutés après validation.';
    screen.appendChild(note);
  }

  function showVideoNotice(exerciseTitle) {
    const existing=main.querySelector('.dos2-video-modal');
    if(existing) return;
    const shade=document.createElement('div');
    shade.className='dos2-video-modal';
    shade.setAttribute('role','dialog');
    shade.setAttribute('aria-modal','true');
    shade.setAttribute('aria-label','Démonstration vidéo');
    const card=document.createElement('div');
    card.className='dos2-video-modal-card';
    const heading=document.createElement('h2');
    heading.textContent='Démonstration bientôt disponible';
    const desc=document.createElement('p');
    desc.textContent='La vidéo explicative de « '+exerciseTitle+' » sera ajoutée prochainement. La fiche et les conseils restent disponibles.';
    const close=document.createElement('button');
    close.className='dos2-video-modal-close';
    close.type='button';
    close.textContent='Revenir à l’exercice';
    const dismiss=()=>{shade.remove();document.removeEventListener('keydown',onEscape)};
    const onEscape=e=>{if(e.key==='Escape')dismiss()};
    close.addEventListener('click',dismiss);
    shade.addEventListener('click',e=>{if(e.target===shade)dismiss()});
    document.addEventListener('keydown',onEscape);
    card.append(heading,desc,close);shade.appendChild(card);main.appendChild(shade);
    close.focus();
  }

  function detail(){
    const ex=EXERCISES[selected] || EXERCISES[0];
    const screen=root('Fiche étirement — '+ex.title);
    screen.classList.add('dos5-detail');
    const holder=document.createElement('div');holder.className='dos5-fiche-stack';
    // Seven complete, undistorted panels; cuts only between intact gold borders.
    for(let i=1;i<=7;i++){
      const isVideo=i===7;
      const part=document.createElement(isVideo?'button':'div');
      if(isVideo)part.type='button';
      part.className='dos5-part'+(isVideo?' dos5-part--video':'');
      const image=figure('./etirements-dos-panneau-'+(selected+1)+'-'+i+'-v5.webp?v=5','dos5-image','');
      image.loading=i===1?'eager':'lazy';
      part.appendChild(image);
      if(i===1){
        const backHit=document.createElement('button');
        backHit.className='dos5-back-hit';backHit.type='button';
        backHit.setAttribute('aria-label','Retour à Dos');backHit.title='Retour à Dos';
        backHit.addEventListener('click',()=>go(LIST));
        part.appendChild(backHit);
      }
      if(isVideo){
        part.setAttribute('aria-label','Voir la vidéo explicative de '+ex.title);
        part.title='Voir la vidéo explicative — démonstration bientôt disponible';
        part.addEventListener('click',()=>showVideoNotice(ex.title));
      }
      holder.appendChild(part);
    }
    screen.appendChild(holder);
  }
  function activateDosInExistingMenu(){
    // The 7-zone menu already exists; only make the existing "Dos" card clickable.
    const all=Array.from(document.querySelectorAll('.et7-zones .et7-picture-card'));
    const target=all.find(el=>(el.getAttribute('aria-label')||'').startsWith('Dos :'));
    if (target && !target.dataset.dos1Ready){
      const btn=document.createElement('button');btn.type='button';
      btn.className=target.className.replace(/\bet7-soon\b/g,'').trim();
      btn.setAttribute('aria-label','Dos : 2 exercices disponibles sur 10 prévus');
      btn.dataset.dos1Ready='1';
      while(target.firstChild)btn.appendChild(target.firstChild);
      btn.addEventListener('click',()=>go(LIST));
      target.replaceWith(btn);
      return;
    }
    // Fallback for the older harmonised menu, if it is what the phone displays.
    const other=Array.from(document.querySelectorAll('.et6-list .et6-card'))
      .find(el=>(el.getAttribute('aria-label')||'').startsWith('Dos'));
    if(other && !other.dataset.dos1Ready){
      other.disabled=false;
      other.dataset.dos1Ready='1';
      other.setAttribute('aria-label','Dos : 2 exercices disponibles');
      other.addEventListener('click',()=>go(LIST));
    }
  }
  const previousRender=render;
  render=function(){
    if(state.view===LIST)return list();
    if(state.view===DETAIL)return detail();
    const result=previousRender.apply(this,arguments);
    if(state.view===GROUPS)activateDosInExistingMenu();
    return result;
  };
})();
