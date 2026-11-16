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
  function detail(){
    const ex=EXERCISES[selected] || EXERCISES[0];
    const screen=root('Fiche étirement — '+ex.title);
    const holder=document.createElement('div');holder.className='dos1-fiche-wrap';
    const image=figure('./etirements-dos-fiche-'+(selected+1)+'-v1.webp?v=1','dos1-fiche-img',ex.title+', fiche et conseils');
    image.loading='eager';holder.appendChild(image);
    const hit=document.createElement('button');hit.className='dos1-back-hit';hit.type='button';
    hit.setAttribute('aria-label','Retour à Dos');hit.title='Retour à Dos';
    hit.addEventListener('click',()=>go(LIST));holder.appendChild(hit);
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
