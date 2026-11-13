/* SPORT & NUTRITION — Étirements — Accueil intérieur V1 (13/11/2026)
 * Visuel validé en trois bandeaux, sans déformation.
 * Module d'affichage isolé : ne touche ni aux entraînements, ni aux données,
 * ni à la synchronisation cloud V5.
 * Les rubriques Exercices et Séances ouvrent les futurs espaces de travail ;
 * leurs fiches et lecteurs seront développés dans les prochaines étapes.
 */
(function(){
  'use strict';
  const MENU='etirements-menu';
  const EXERCISES='etirements-exercices';
  const SESSIONS='etirements-seances';
  const IMAGE='./etirements-menu-valide-v1.webp?v=1';

  function addStyles(){
    if(document.getElementById('ez1Styles'))return;
    const style=document.createElement('style');
    style.id='ez1Styles';
    style.textContent=`
      body.ez1-active{background:#003a34;overflow-y:auto}
      body.ez1-active #app{padding-bottom:0}
      body.ez1-active #app>header.topbar,
      body.ez1-active #bottomNav{display:none!important}
      body.ez1-active #main{
        width:100%;max-width:none;min-height:100dvh;box-sizing:border-box;
        margin:0!important;padding:0!important;background:#003a34;
      }
      .ez1-screen{position:relative;width:100%;max-width:720px;
        margin:0 auto;box-sizing:border-box;background:#003a34;
        box-shadow:0 10px 35px rgba(0,0,0,.18)}
      .ez1-visual{position:relative;width:100%;line-height:0}
      .ez1-visual>img{display:block;width:100%;height:auto;object-fit:contain}
      .ez1-hotspot{position:absolute;z-index:2;border:0;margin:0;padding:0;
        background:transparent;cursor:pointer;border-radius:18px;
        -webkit-tap-highlight-color:rgba(255,221,161,.17)}
      .ez1-hotspot:focus-visible{outline:3px solid #fff4ca;outline-offset:-4px;
        background:rgba(255,255,255,.08)}
      .ez1-hotspot:active{background:rgba(255,255,255,.13)}
      .ez1-back{left:3.3%;top:5%;width:12%;height:6.5%;border-radius:50%}
      .ez1-exercises{left:2.1%;top:39.7%;width:94.6%;height:21.65%}
      .ez1-sessions{left:2.1%;top:63.3%;width:94.6%;height:21.7%}
      .ez1-subscreen{min-height:100dvh;padding:clamp(20px,5vw,40px);
        box-sizing:border-box;background:linear-gradient(145deg,#073f37,#0d4b40 53%,#79512e);
        color:#fff;font:inherit;line-height:1.5}
      .ez1-subscreen h1{font-size:clamp(1.9rem,5vw,2.6rem);margin:26px 0 12px;color:#fff}
      .ez1-subscreen p{max-width:540px;color:#e5f8ea;font-size:1rem}
      .ez1-return{min-height:48px;padding:11px 17px;background:#145e4b;color:#fff;
        border:1px solid #efba73;border-radius:13px;font:inherit;font-weight:750;cursor:pointer}
      .ez1-return:focus-visible{outline:3px solid #fff;outline-offset:2px}
      .ez1-note{max-width:540px;margin-top:26px;border:1px solid #c5a478;
        padding:16px 18px;border-radius:15px;background:rgba(0,0,0,.16)}
      .ez1-note strong{color:#ffe0ab}
      @media(min-width:760px){.ez1-screen{margin:18px auto 38px;border-radius:24px;overflow:hidden}}
      @media(max-width:759px){.ez1-screen{box-shadow:none}}
    `;
    document.head.appendChild(style);
  }

  function go(view){
    state.view=view;
    state.selected=null;
    render();
    if(typeof window.scrollTo==='function')window.scrollTo(0,0);
  }
  function action(className,label,route){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='ez1-hotspot '+className;
    btn.setAttribute('aria-label',label);
    btn.title=label;
    btn.addEventListener('click',()=>go(route));
    return btn;
  }
  function menu(){
    addStyles();
    bottomNav.classList.add('hidden');
    main.innerHTML='';
    const root=document.createElement('section');
    root.className='ez1-screen';
    root.setAttribute('aria-label','Étirements — Choisissez une rubrique');
    const visual=document.createElement('div');
    visual.className='ez1-visual';
    const img=document.createElement('img');
    img.src=IMAGE;img.alt='';img.width=941;img.height=1672;
    img.decoding='async';img.draggable=false;
    visual.appendChild(img);
    visual.appendChild(action('ez1-back','Retour à Mes univers','hub'));
    visual.appendChild(action('ez1-exercises','Ouvrir les exercices d’étirements',EXERCISES));
    visual.appendChild(action('ez1-sessions','Ouvrir les séances d’étirements',SESSIONS));
    root.appendChild(visual);
    main.appendChild(root);
  }
  function subpage(view){
    addStyles();
    bottomNav.classList.add('hidden');
    const exercises=view===EXERCISES;
    const title=exercises?'Exercices':'Séances';
    main.innerHTML=`<section class="ez1-screen ez1-subscreen" aria-label="Étirements — ${title}">
      <button type="button" class="ez1-return" id="ez1SubBack">← Retour aux Étirements</button>
      <h1>${title}</h1>
      <p>${exercises
        ?'Nous allons construire ici le catalogue des étirements par zones du corps, avec fiches explicatives et démonstrations vidéo.'
        :'Nous allons construire ici le créateur de séances avec deux modes : chronométré (effort et pauses) ou libre (passage à l’exercice suivant par bouton).'}</p>
      <div class="ez1-note"><strong>Première étape :</strong> l’écran d’accueil est en place. Les exercices et les séances seront ajoutés progressivement, après validation de leurs visuels.</div>
    </section>`;
    const back=main.querySelector('#ez1SubBack');
    if(back)back.addEventListener('click',()=>go(MENU));
  }

  // Le clic sur la vignette du hub existant ouvre aujourd'hui un placeholder.
  // On n'altère pas ce hub ni ses visuels : seule la destination Étirements
  // est redirigée vers le nouvel écran, qui reste indépendant des autres.
  const previousRender=render;
  render=function(){
    if(state.view==='uv1-placeholder'&&state.uv1Placeholder==='etirements'){
      state.view=MENU;
    }
    const ours=[MENU,EXERCISES,SESSIONS].includes(state.view);
    document.body.classList.toggle('ez1-active',ours);
    if(ours){
      if(typeof updateShell==='function')updateShell();
      if(state.view===MENU)return menu();
      return subpage(state.view);
    }
    return previousRender.apply(this,arguments);
  };
})();
