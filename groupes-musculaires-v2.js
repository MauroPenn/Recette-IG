/* Page Exercices : harmoniser uniquement les 7 catégories.
   Brancher APRÈS les scripts Jambes et Abdominaux, qui personnalisent déjà
   les gestionnaires de clic sur leurs propres boutons. */
(function(){
  const groups = {
    pectoraux:'Pectoraux', dos:'Dos', epaules:'Épaules', biceps:'Biceps',
    triceps:'Triceps', jambes:'Jambes', abdominaux:'Abdominaux'
  };
  const precedentRenduGroupes = renderMuscuExercises;
  renderMuscuExercises = function(){
    precedentRenduGroupes();
    const cards = [...main.querySelectorAll('[data-muscle]')].filter(
      item => Object.prototype.hasOwnProperty.call(groups, item.dataset.muscle)
    );
    if (!cards.length) return;
    for (const card of cards){
      const key=card.dataset.muscle;
      card.classList.add('muscu-group-standard-card');
      card.setAttribute('aria-label','Voir les exercices : ' + groups[key]);
      /* Version de ressource modifiée pour éviter les anciennes images du cache. */
      card.innerHTML = `<img src="./exercice-groupe-${key}.webp?v=2" alt="${groups[key]}" loading="lazy" decoding="async">`;
    }
    const sameParent = cards.every(card => card.parentElement === cards[0].parentElement);
    if (sameParent && cards[0].parentElement && cards[0].parentElement !== main){
      cards[0].parentElement.classList.add('muscu-group-standard-list');
    } else {
      /* Compatibilité : rechercher un conteneur consacré aux groupes sans
         mettre la page entière ni son en-tête dans une grille. */
      let parent=cards[0].parentElement;
      while (parent && parent !== main && !cards.every(card=>parent.contains(card))) parent=parent.parentElement;
      if (parent && parent!==main && parent.children.length <= cards.length + 1){
        parent.classList.add('muscu-group-standard-list');
      }
    }
  };
})();
