/* AUTRE SPORT — parcours V4 : accueil > choix de l’activité > Marche.
   La sélection respecte la maquette validée, les autres sports restent à développer. */
(function(){
  'use strict';
  const SCREENS = {
    history: {
      title:'Historique et statistiques',
      description:'Ce bouton ouvrira l’historique sportif commun, filtré sur Autre sport. Il affichera les séances réellement enregistrées et leurs statistiques, sans créer un second historique séparé.'
    },
    settings: {
      title:'Paramètres',
      description:'Tu pourras ici gérer le GPS et la saisie manuelle, les unités, l’affichage et les sports personnalisés. Cette partie est en cours de préparation.'
    },
    bike: { title:'Vélo', description:'Le suivi vélo sera ajouté dans une prochaine étape, avec le chronomètre, le GPS et les kilomètres.' },
    stationaryBike: { title:'Vélo d’appartement', description:'Le vélo d’appartement utilisera un chronomètre et une saisie manuelle de la distance, sans GPS.' },
    running: { title:'Course à pied', description:'Le suivi course à pied sera ajouté dans une prochaine étape : GPS, distance, durée et allure.' },
    paddle: { title:'Stand Up Paddle', description:'Le suivi paddle sera ajouté dans une prochaine étape : GPS, distance et durée.' },
    custom: { title:'Ajouter un sport', description:'La création de nouveaux sports personnalisés (nom, activité intérieure ou extérieure, visuel et suivi) sera intégrée lors d’une prochaine étape.' },
    walkAction: {
      title:'Fonctionnalité de marche',
      description:'Le visuel de suivi Marche est maintenant intégré. Lors des prochaines étapes, les commandes Démarrer, Pause, Terminer et Réinitialiser seront reliées au chronomètre, au GPS, à la distance et à l’enregistrement réel de la séance.'
    }
  };
  function navigate(view, extra){
    state.view = view;
    if (typeof extra !== 'undefined') state.as1Section = extra;
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
    img.src='./autre-sport-accueil-v3.webp?v=4';
    img.alt='';
    img.width=850;img.height=1791;
    img.decoding='async';
    screen.appendChild(img);
    [
      ['as1-h-back','Retour aux univers','hub'],
      ['as1-h-start','Démarrer une activité','autre-sport-choice'],
      ['as1-h-history','Historique et statistiques','autre-sport-section','history'],
      ['as1-h-settings','Paramètres','autre-sport-section','settings'],
      ['as1-h-nav-home','Accueil général','hub'],
      ['as1-h-nav-sport','Autre sport','autre-sport-home'],
      ['as1-h-nav-history','Historique','autre-sport-section','history']
    ].forEach(([cls,title,target,section])=>screen.appendChild(button(cls,title,target,section)));
    main.appendChild(screen);
  }

  function showChoice(){
    document.body.classList.add('as1-active');
    bottomNav.classList.add('hidden');
    main.innerHTML='';
    const screen=document.createElement('section');
    screen.className='as1-screen as1-choice-screen';
    screen.setAttribute('aria-label','Choisir une activité sportive');
    const heading=document.createElement('h2');
    heading.className='as1-visually-hidden';
    heading.textContent='Choisir une activité';
    screen.appendChild(heading);
    const img=document.createElement('img');
    img.className='as1-screen-image as1-choice-image';
    img.src='./autre-sport-choix-v1.webp?v=1';
    img.alt='';
    img.width=760; img.height=1716; img.decoding='async';
    screen.appendChild(img);
    [
      ['as1-c-back','Retour à Autre sport','autre-sport-home'],
      ['as1-c-walk','Marche — ouvrir le suivi','autre-sport-walk'],
      ['as1-c-bike','Vélo — à venir','autre-sport-section','bike'],
      ['as1-c-indoor','Vélo d’appartement — à venir','autre-sport-section','stationaryBike'],
      ['as1-c-running','Course à pied — à venir','autre-sport-section','running'],
      ['as1-c-paddle','Stand Up Paddle — à venir','autre-sport-section','paddle'],
      ['as1-c-custom','Autre activité — ajouter un sport','autre-sport-section','custom'],
      ['as1-c-nav-home','Accueil général','hub'],
      ['as1-c-nav-sport','Autre sport','autre-sport-home'],
      ['as1-c-nav-history','Historique','autre-sport-section','history']
    ].forEach(([cls,title,target,section])=>screen.appendChild(button(cls,title,target,section)));
    main.appendChild(screen);
  }

  function showWalk(){
    document.body.classList.add('as1-active');
    bottomNav.classList.add('hidden');
    main.innerHTML='';
    const screen=document.createElement('section');
    screen.className='as1-screen as1-walk-screen';
    screen.setAttribute('aria-label','Marche — suivi GPS');
    const heading=document.createElement('h2');
    heading.className='as1-visually-hidden';
    heading.textContent='Marche';
    screen.appendChild(heading);
    const img=document.createElement('img');
    img.className='as1-screen-image as1-walk-image';
    img.src='./autre-sport-marche-v1.webp?v=1';
    img.alt='';
    img.width=941;img.height=1672;
    img.decoding='async';
    screen.appendChild(img);
    [
      ['as1-w-back','Retour aux activités','autre-sport-choice'],
      ['as1-w-start','Démarrer la marche','autre-sport-section','walkAction'],
      ['as1-w-pause','Mettre en pause','autre-sport-section','walkAction'],
      ['as1-w-stop','Terminer la marche','autre-sport-section','walkAction'],
      ['as1-w-reset','Réinitialiser la marche','autre-sport-section','walkAction'],
      ['as1-w-nav-home','Accueil général','hub'],
      ['as1-w-nav-sport','Retour Autre sport','autre-sport-home'],
      ['as1-w-nav-history','Historique','autre-sport-section','history']
    ].forEach(([cls,title,target,section])=>screen.appendChild(button(cls,title,target,section)));
    main.appendChild(screen);
  }
  function showSection(){
    document.body.classList.add('as1-active');
    bottomNav.classList.add('hidden');
    const section=SCREENS[state.as1Section] || SCREENS.history;
    const isWalkAction=state.as1Section === 'walkAction';
    const isSportChoice=['bike','stationaryBike','running','paddle','custom'].includes(state.as1Section);
    const backLabel=isWalkAction ? '← Retour à Marche' : isSportChoice ? '← Retour aux activités' : '← Retour à Autre sport';
    const backTarget=isWalkAction ? 'autre-sport-walk' : isSportChoice ? 'autre-sport-choice' : 'autre-sport-home';
    main.innerHTML=`<section class="as1-placeholder"><div class="as1-ph-inner">
      <button type="button" class="as1-return" id="as1Return">${backLabel}</button>
      <h2>${section.title}</h2><span class="as1-next">EN PRÉPARATION</span>
      <p>${section.description}</p>
    </div></section>`;
    main.querySelector('#as1Return').addEventListener('click',()=>navigate(backTarget));
  }
  const previouslyRegisteredRender=render;
  render=function(){
    if(state.view==='autre-sport-home'){
      updateShell();
      showHome();
      return;
    }
    if(state.view==='autre-sport-choice'){
      updateShell();
      showChoice();
      return;
    }
    if(state.view==='autre-sport-walk'){
      updateShell();
      showWalk();
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
