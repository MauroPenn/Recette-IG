/* Remplace uniquement les en-tetes des listes Nuque et Epaules.
   Les fiches et toutes les interactions d'exercices restent inchangees. */
(function () {
  'use strict';
  const NUQUE = 'etirements-cervicales-liste';
  const EPAULES = 'etirements-epaules-liste';
  const SOURCES = {
    nuque: './etirements-entete-nuque-sans-personnage-v2.webp?v=2',
    epaules: './etirements-entete-epaules-sans-personnage-v2.webp?v=2'
  };
  function apply() {
    if (typeof state === 'undefined' || typeof main === 'undefined') return;
    if (state.view === NUQUE) {
      const head=main.querySelector('.evc2-category .evc2-header');
      const img=head?.querySelector('img');
      if(!head || !img) return;
      img.src=SOURCES.nuque;
      img.classList.add('et-head-nuque-v2');
      img.alt='Nuque et cervicales. Choisissez un exercice.';
      img.decoding='async';
      const back=head.querySelector('button.evc2-back');
      if(back){
        back.classList.add('et-head-back-v2');
        back.textContent='← Retour aux Étirements';
        // Garde son action de retour existante.
        head.insertBefore(back, img);
      }
    } else if (state.view === EPAULES) {
      const img=main.querySelector('.ev14-screen .ev14-header img');
      if(!img) return;
      img.src=SOURCES.epaules;
      img.alt='Épaules et bras. Choisissez un exercice.';
      img.decoding='async';
      img.classList.add('et-head-epaules-v2');
    }
  }
  const previousRender=render;
  render=function(){
    const result=previousRender.apply(this,arguments);
    apply();
    return result;
  };
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',apply,{once:true});
  }else apply();
})();
