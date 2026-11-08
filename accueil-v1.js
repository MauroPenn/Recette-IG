/* Accueil 6 univers V3 : design approuvé, images avec textes intégrés — ajouts isolés après tous les autres scripts.
   Les deux premiers univers réutilisent leurs liens et leur logique existants. */
(function(){
  'use strict';
  const univers = [
    {id:'cuisine-nutrition', title:'Cuisine & Nutrition', desc:'Recettes IG bas et protéinées, alimentation équilibrée et liste de courses.', cta:'Ouvrir Cuisine & Nutrition', accent:'#279d30', available:true, symbol:'food'},
    {id:'musculation', title:'Musculation', desc:'Programmes, exercices et séances pour progresser et rester en forme.', cta:'Ouvrir la musculation', accent:'#ff7b00', available:true, symbol:'weights'},
    {id:'autre-sport', title:'Autre sport', desc:'Marche, vélo, course à pied, paddle et sports personnalisés (GPS, distance, chrono).', cta:'Découvrir Autre sport', accent:'#028ce8', available:false, symbol:'mountain'},
    {id:'etirements', title:'Étirements', desc:'Exercices guidés pour la souplesse, la mobilité et la récupération.', cta:'Découvrir les étirements', accent:'#a63ac2', available:false, symbol:'leaf'},
    {id:'pilates', title:'Pilates', desc:'Gainage profond, posture et renforcement en douceur.', cta:'Découvrir le Pilates', accent:'#02a6a5', available:false, symbol:'pilates'},
    {id:'historique', title:'Historique', desc:'Toutes les activités, séances et statistiques réunies au même endroit.', cta:'Découvrir l’historique', accent:'#f8bd02', available:false, symbol:'chart'}
  ];
  const icons = {
    food:'<path d="M5 3v8M8 3v8M11 3v8M8 11v10M17 3c-2 4-2 8 0 11h3V3M18 14v7"/>',
    weights:'<path d="M2 9v6M6 6v12M10 10h4M14 6v12M18 9v6M6 12h8"/>',
    mountain:'<path d="M2 20 9 6l5 9 3-5 5 10H2Z"/><path d="m8 10 1.5 2 1.5-2"/>',
    leaf:'<path d="M12 21c0-6 0-8 6-13 0 7-3 11-6 13ZM12 21C5 17 4 12 5 8c6 2 8 6 7 13ZM12 21V5"/>',
    pilates:'<circle cx="12" cy="12" r="7"/><path d="M4 12h16M12 5a9 9 0 0 1 0 14M12 5a9 9 0 0 0 0 14"/>',
    chart:'<path d="M4 20V12h3v8m4 0V7h3v13m4 0V3h3v17"/>'
  };
  // The six validated cards already include their texts, icons and status badges.
  // Do not put another text layer or gradient over these images.
  function cardHtml(u){
    const src = './univers-' + u.id + '-valide.webp?v=3';
    const status = u.available ? 'Disponible' : 'À venir';
    return `<button type="button" class="uv1-card" data-uv1="${u.id}" aria-label="${u.title} — ${status}" title="${u.title}">
       <img class="uv1-full-card-image" src="${src}" alt="" loading="lazy" decoding="async">
    </button>`;
  }
  function targetFor(legacy,kind){
    const name = kind === 'cuisine' ? /(?:^|\s)Cuisine(?:$|\s)/i : /Musculation/i;
    const clickable=Array.from(legacy.querySelectorAll('button,a,[role="button"], [data-view], [data-universe], [data-univers]'));
    let candidates=clickable.filter(el=>name.test(el.textContent||''));
    candidates.sort((a,b)=> (a.textContent||'').length-(b.textContent||'').length);
    if(candidates.length) return candidates[0];
    const el=Array.from(legacy.querySelectorAll('h2,h3,h4,strong')).find(el=>name.test(el.textContent||''));
    if(el) return el.closest('button,a,[role="button"],[data-universe],[data-univers]') || el.parentElement?.parentElement;
    return null;
  }
  let activeLegacy=null;
  let activeTargets={};
  function upgradeHub(){
    if(typeof main==='undefined' || !main || state.view!=='hub') return;
    if(main.querySelector('.uv1-root')) return;
    const legacy=document.createElement('div');
    legacy.className='uv1-legacy'; legacy.setAttribute('aria-hidden','true');
    while(main.firstChild) legacy.appendChild(main.firstChild);
    const cuisineTarget=targetFor(legacy,'cuisine');
    const muscuTarget=targetFor(legacy,'musculation');
    // If the base application changes structure, do not break the functional home.
    if(!cuisineTarget || !muscuTarget){while(legacy.firstChild)main.appendChild(legacy.firstChild);return;}
    activeLegacy=legacy;activeTargets={ 'cuisine-nutrition':cuisineTarget, 'musculation':muscuTarget };
    const root=document.createElement('section');root.className='uv1-root';root.setAttribute('aria-label','Mes univers');
    root.innerHTML=`<div class="uv1-grid">${univers.map(cardHtml).join('')}</div>`;
    main.append(root,legacy);
    root.querySelectorAll('[data-uv1]').forEach(card=>card.addEventListener('click',()=>{
      const key=card.dataset.uv1;
      const old=activeTargets[key];
      if(old){old.click();return;}
      const universe=univers.find(u=>u.id===key);
      if(!universe)return;
      state.view='uv1-placeholder';state.uv1Placeholder=key;render();
    }));
  }
  function showPlaceholder(){
    const u=univers.find(u=>u.id===state.uv1Placeholder) || univers[2];
    updateShell();
    bottomNav.classList.add('hidden');
    brandMark.textContent='MB';brandEyebrow.textContent='Ma bibliothèque';brandTitle.textContent='Mes univers';
    main.innerHTML=`<section class="uv1-root"><div class="uv1-placeholder" style="--uv-accent:${u.accent}">
      <button type="button" class="uv1-back" id="uv1Back">← Retour aux univers</button>
      <h2>${u.title}</h2><p>Ce nouvel univers est en préparation. Il sera ajouté progressivement, sans modifier les parties de l’application déjà fonctionnelles.</p>
    </div></section>`;
    main.querySelector('#uv1Back').addEventListener('click',()=>{state.view='hub';render();});
  }
  const before=render;
  render=function(){
    if(state.view==='uv1-placeholder')return showPlaceholder();
    const result=before.apply(this,arguments);
    if(state.view==='hub')upgradeHub();
    return result;
  };
  function start(){if(typeof state!=='undefined'&&state.view==='hub')upgradeHub();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
