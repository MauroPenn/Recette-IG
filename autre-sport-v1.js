/* AUTRE SPORT — écran principal V3. Aucun GPS ni historique factice.
   Fonctionne avec le routeur existant de Ma Bibliothèque (state + render).
   Les zones transparentes suivent exactement les boutons du visuel validé. */
(function(){
  'use strict';
  const SCREENS = {
    choice: {
      title:'Choisir une activité',
      description:'Ici, tu choisiras Marche, Vélo, Course à pied, Vélo d’appartement, Stand-up paddle ou Ajouter un sport. Le chronomètre, le GPS et l’enregistrement seront intégrés lors des prochaines étapes.'
    },
    history: {
      title:'Historique et statistiques',
      description:'Ce bouton ouvrira l’historique sportif commun, filtré sur Autre sport. Il affichera les séances réellement enregistrées et leurs statistiques, sans créer un second historique séparé.'
    },
    settings: {
      title:'Paramètres',
      description:'Tu pourras ici gérer le GPS et la saisie manuelle, les unités, l’affichage et les sports personnalisés. Cette partie est en cours de préparation.'
    }
  };
  function navigate(view, extra){
    state.view = view;
    if (extra) state.as1Section = extra;
    render();
    window.scrollTo?.({top:0,behavior:'instant'});
  }
  function button(cls, title, target, section){
    const b=document.createElement('button');
    b.type='button';
    b.className='as1-hotspot '+cls;
    b.setAttribute('aria-label',title);
    b.setAttribute('title',title);
    b.addEventListener('click',()=>navigate(target,section));
    return b;
  }
  function showHome(){
    document.body.classList.add('as1-active');
    bottomNav.classList.add('hidden');
    main.innerHTML='';
    const screen=document.createElement('section');
    screen.className='as1-screen';
    screen.setAttribute('aria-label','Autre sport — écran principal');
    const heading=document.createElement('h2');
    heading.className='as1-visually-hidden';
    heading.textContent='Autre sport';
    screen.appendChild(heading);
    const img=document.createElement('img');
    img.className='as1-screen-image';
    img.src='./autre-sport-accueil-v3.webp?v=3';
    img.alt='';
    img.width=850;img.height=1791;
    img.decoding='async';
    screen.appendChild(img);
    [
      ['as1-h-back','Retour aux univers','hub'],
      ['as1-h-start','Démarrer une activité','autre-sport-section','choice'],
      ['as1-h-history','Historique et statistiques','autre-sport-section','history'],
      ['as1-h-settings','Paramètres','autre-sport-section','settings'],
      ['as1-h-nav-home','Accueil général','hub'],
      ['as1-h-nav-sport','Autre sport','autre-sport-home'],
      ['as1-h-nav-history','Historique','autre-sport-section','history']
    ].forEach(([cls,title,target,section])=>screen.appendChild(button(cls,title,target,section)));
    main.appendChild(screen);
  }
  function showSection(){
    document.body.classList.add('as1-active');
    bottomNav.classList.add('hidden');
    const section=SCREENS[state.as1Section] || SCREENS.choice;
    main.innerHTML=`<section class="as1-placeholder"><div class="as1-ph-inner">
      <button type="button" class="as1-return" id="as1Return">← Retour à Autre sport</button>
      <h2>${section.title}</h2><span class="as1-next">EN PRÉPARATION</span>
      <p>${section.description}</p>
    </div></section>`;
    main.querySelector('#as1Return').addEventListener('click',()=>navigate('autre-sport-home'));
  }
  // Wrap the existing render as a narrow feature extension, without replacing other modules.
  const previouslyRegisteredRender=render;
  render=function(){
    if(state.view==='autre-sport-home'){
      updateShell();
      showHome();
      return;
    }
    if(state.view==='autre-sport-section'){
      updateShell();
      showSection();
      return;
    }
    document.body.classList.remove('as1-active');
    return previouslyRegisteredRender.apply(this,arguments);
  };
})();
