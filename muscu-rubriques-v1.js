/* MUSCULATION – RUBRIQUES V1
   Court-circuite totalement l'ancien écran "Choisissez votre univers d'entraînement".
   Réutilise les routes existantes pour Exercices et Séances et ne modifie ni leurs
   listes ni leurs fiches. Historique ouvre le suivi réel des séances enregistrées.
   Navigation accessible via de vraies zones bouton posées sur le visuel approuvé. */
(function(){
  'use strict';
  const go=(view,section)=>{
    if(view==='history-global'){
      state.uv1Placeholder='historique';
      state.view='uv1-placeholder';
    }else{
      state.view=view;
    }
    state.selected=null;
    render();
    window.scrollTo?.({top:0,behavior:'instant'});
  };
  const hotspot=(className,label,view)=>{
    const el=document.createElement('button');
    el.type='button';
    el.className='mm1-hotspot '+className;
    el.setAttribute('aria-label',label);
    el.addEventListener('click',()=>go(view));
    return el;
  };
  const picture=(name,width,height)=>{
    const img=document.createElement('img');
    img.src='./'+name+'?v=1';
    img.alt='';
    img.width=width;
    img.height=height;
    img.draggable=false;
    img.decoding='async';
    return img;
  };
  function renderNewMuscuMenu(){
    bottomNav.classList.add('hidden');
    main.innerHTML='';
    const root=document.createElement('section');
    root.className='mm1-screen';
    root.setAttribute('aria-label','Musculation — Choisissez une rubrique');
    const title=document.createElement('h2');
    title.className='mm1-sr-only';
    title.textContent='Musculation — Choisissez une rubrique';
    root.appendChild(title);
    const hero=document.createElement('div');
    hero.className='mm1-hero';
    hero.appendChild(picture('muscu-rubriques-en-tete-v1.webp',941,471));
    hero.appendChild(hotspot('mm1-back','Retour aux univers','hub'));
    root.appendChild(hero);
    const cards=document.createElement('div');
    cards.className='mm1-menu-cards';
    const panels=[
      ['muscu-rubriques-exercices-v1.webp',339,'Exercices — groupes musculaires','muscu-exercises'],
      ['muscu-rubriques-seances-v1.webp',315,'Séances — programmes et chrono','muscu-sessions']
    ];
    for(const [filename,height,aria,target] of panels){
      const card=document.createElement('button');
      card.type='button';card.className='mm1-card';
      card.setAttribute('aria-label',aria);
      card.appendChild(picture(filename,941,height));
      card.addEventListener('click',()=>go(target));
      cards.appendChild(card);
    }
    root.appendChild(cards);
    const spacer=document.createElement('div');
    spacer.className='mm1-between';
    spacer.setAttribute('aria-hidden','true');
    root.appendChild(spacer);
    const footer=document.createElement('nav');
    footer.className='mm1-footer';
    footer.setAttribute('aria-label','Navigation Musculation');
    footer.appendChild(picture('muscu-rubriques-navigation-v1.webp',941,196));
    footer.appendChild(hotspot('mm1-nav-home','Accueil général','hub'));
    footer.appendChild(hotspot('mm1-nav-muscu','Musculation','muscu-menu'));
    footer.appendChild(hotspot('mm1-nav-history','Historique des séances de musculation','muscu-history'));
    root.appendChild(footer);
    main.appendChild(root);
  }
  // La fonction du menu est encore la même route, seule son apparence évolue.
  renderMuscuMenu=renderNewMuscuMenu;
  const previousRender=render;
  render=function(){
    // La vignette "Musculation" du hub historique mène à muscu-entry.
    // On remplace ici cette ancienne étape par un accès DIRECT au menu.
    if(state.view==='muscu-entry') state.view='muscu-menu';
    document.body.classList.toggle('mm1-active',state.view==='muscu-menu');
    return previousRender.apply(this,arguments);
  };
})();
