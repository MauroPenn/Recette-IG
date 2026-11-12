/* PARAMÈTRES GÉNÉRAUX V1 — 12/11/2026.
   Ajout d'un 7e univers Paramètres, contenant Création de profil.
   Suppression visuelle de Paramètres dans Autre sport par découpage CSS
   de l'image originale, SANS la modifier ni toucher aux sports/GPS.
   La clé localStorage du profil existant n'est jamais remplacée.
*/
(function(){
  'use strict';
  const VIEW='parametres-global-v1';
  const PROFILE='profil-sportif-v1';
  const OLD_H=1791, TOP_H=1176, NAV_START=1564;
  const CUT= NAV_START-TOP_H;
  const NEW_H=OLD_H-CUT;

  function go(view){
    state.view=view;
    state.selected=null;
    render();
    window.scrollTo?.({top:0,behavior:'instant'});
  }
  function addSettingsCard(){
    if(state.view!=='hub')return;
    const grid=main.querySelector('.uv1-root .uv1-grid');
    if(!grid || grid.querySelector('.gs1-home-card'))return;
    const button=document.createElement('button');
    button.type='button';
    button.className='uv1-card gs1-home-card';
    button.setAttribute('aria-label','Paramètres — création de profil et réglages de l’application');
    button.title='Paramètres';
    const img=document.createElement('img');
    img.src='./univers-parametres-valide.webp?v=1';
    img.className='uv1-full-card-image';
    img.alt='';
    img.loading='lazy';
    img.decoding='async';
    button.appendChild(img);
    button.addEventListener('click',()=>go(VIEW));
    grid.appendChild(button);
  }
  function showSettings(){
    document.body.classList.remove('as1-active','ml1-active','ps1-active','cp-active','vt1-active');
    document.body.classList.add('gs1-active');
    bottomNav.classList.add('hidden');
    const profile=window.SportProfile?.get?.();
    const profileText=profile?'Profil enregistré : consulter ou modifier mes informations.':'Créer mon profil pour personnaliser les activités sportives.';
    main.innerHTML=`<section class="gs1-screen" aria-label="Paramètres généraux">
      <header class="gs1-hero">
        <button type="button" id="gs1Back" class="gs1-back" aria-label="Retour aux univers">←</button>
        <div class="gs1-hero-icon" aria-hidden="true">⚙</div>
        <div><p class="gs1-eyebrow">MON APPLICATION</p><h1>Paramètres</h1>
          <p>Création de profil et réglages généraux</p></div>
      </header>
      <div class="gs1-content">
        <button type="button" class="gs1-profile-card" id="gs1OpenProfile">
          <div class="gs1-tile-icon" aria-hidden="true">♙</div>
          <div class="gs1-tile-copy"><h2>Création de profil</h2><p>${profileText}</p>
            <span>${profile?'Modifier mon profil':'Créer mon profil sportif'}</span></div>
          <div class="gs1-chevron" aria-hidden="true">›</div>
        </button>
        <h2 class="gs1-section-title">Autres réglages</h2>
        <div class="gs1-disabled-tile"><span class="gs1-small-icon" aria-hidden="true">◎</span><div><strong>Suivi sportif et GPS</strong><p>Unités, affichage et autorisations — prochaine étape.</p></div><span class="gs1-later">À venir</span></div>
        <div class="gs1-disabled-tile"><span class="gs1-small-icon" aria-hidden="true">◈</span><div><strong>Calories et dépenses</strong><p>Paramètres de calcul communs à tous les sports — à développer.</p></div><span class="gs1-later">À venir</span></div>
        <div class="gs1-disabled-tile"><span class="gs1-small-icon" aria-hidden="true">⇩</span><div><strong>Sauvegarde des données</strong><p>Exporter et sécuriser mes activités — à développer.</p></div><span class="gs1-later">À venir</span></div>
        <p class="gs1-privacy">Ton profil est actuellement conservé sur cet appareil. Ces réglages n’effacent ni tes séances ni les activités personnalisées.</p>
        <button type="button" class="gs1-footer-back" id="gs1Return">← Retour aux univers</button>
      </div>
    </section>`;
    main.querySelector('#gs1Back').addEventListener('click',()=>go('hub'));
    main.querySelector('#gs1Return').addEventListener('click',()=>go('hub'));
    main.querySelector('#gs1OpenProfile').addEventListener('click',()=>go(PROFILE));
  }
  // L'image originale de l'accueil Autre sport (850×1791) contient trois
  // cartes avec le bas de navigation. On masque uniquement celle des
  // paramètres en réunissant ses deux portions originales intactes.
  function removeSportSettings(){
    if(state.view!=='autre-sport-home')return;
    const screen=main.querySelector('.as1-screen:not(.as1-choice-screen):not(.as1-walk-screen)');
    if(!screen||screen.querySelector('.gs1-sport-art'))return;
    const original=screen.querySelector('.as1-screen-image');
    if(!original)return;
    const art=document.createElement('div');
    art.className='gs1-sport-art';
    art.setAttribute('role','img');
    art.setAttribute('aria-label','Autre sport : démarrer une activité, consulter l’historique');
    art.innerHTML='<div class="gs1-sport-upper" aria-hidden="true"></div><div class="gs1-sport-footer" aria-hidden="true"></div>';
    original.replaceWith(art);
    const settings=screen.querySelector('.as1-h-settings');
    settings?.remove();
    const coords={
      'as1-h-back':[.893,4.578],
      'as1-h-start':[25.405,19.542],
      'as1-h-history':[45.896,19.319],
      'as1-h-nav-home':[88.107,10.050],
      'as1-h-nav-sport':[88.107,10.050],
      'as1-h-nav-history':[88.107,10.050]
    };
    for(const btn of screen.querySelectorAll('.as1-hotspot')){
      const cls=Object.keys(coords).find(c=>btn.classList.contains(c));
      if(!cls)continue;
      const [oldTop,oldHeight]=coords[cls];
      const y=oldTop/100*OLD_H;
      btn.style.top=((y-(y>=NAV_START?CUT:0))/NEW_H*100).toFixed(5)+'%';
      btn.style.height=(oldHeight/100*OLD_H/NEW_H*100).toFixed(5)+'%';
    }
  }
  function isProfileVisible(){return state.view===PROFILE || (state.view==='autre-sport-section'&&state.as1Section==='settings');}
  function refineProfileBack(){
    if(!isProfileVisible())return;
    const back=main.querySelector('#ps1Back');
    const returnBtn=main.querySelector('#ps1Return');
    if(back)back.setAttribute('aria-label','Retour aux paramètres généraux');
    if(returnBtn)returnBtn.textContent='← Retour aux paramètres';
  }
  // Le module de profil précédent dirigeait le retour vers Autre sport.
  // On reprend uniquement les deux boutons retour, sans modifier son formulaire.
  document.addEventListener('click',event=>{
    if(!isProfileVisible())return;
    const target=event.target?.closest?.('#ps1Back,#ps1Return');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    go(VIEW);
  },true);
  const previousRender=render;
  render=function(){
    if(state.view===VIEW){
      updateShell();
      showSettings();
      return;
    }
    document.body.classList.remove('gs1-active');
    const result=previousRender.apply(this,arguments);
    if(state.view==='hub')addSettingsCard();
    else if(state.view==='autre-sport-home')removeSportSettings();
    else if(isProfileVisible())refineProfileBack();
    return result;
  };
  const startup=()=>{if(state.view==='hub')addSettingsCard();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startup,{once:true});
  else startup();
})();
