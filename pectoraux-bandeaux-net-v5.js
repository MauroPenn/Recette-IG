/* Pectoraux V5 : remplacer les images à la source, en conservant les fiches et identifiants. */
(function(){
  'use strict';
  if (typeof pectorauxExercices === 'undefined' || !Array.isArray(pectorauxExercices)) return;
  const ids = [
    'pompes-classiques','pompes-inclinees','pompes-declinees','developpe-sol-halteres',
    'ecarte-sol-halteres','pullover-haltere','presse-unilaterale-sol',
    'pompes-prise-large','pompes-tempo-lent','squeeze-press-halteres'
  ];
  const files = [
    'pompes-classiques','pompes-inclinees','pompes-declinees','developpe-sol-halteres',
    'ecarte-sol-halteres','pullover-haltere','presse-unilaterale-sol',
    'pompes-prise-large','pompes-tempo-lent','squeeze-press'
  ];
  const refs = new Map(ids.map((id,i) => [id, './pectoraux-' + files[i] + '-net-v5.webp']));
  pectorauxExercices.forEach(ex => { if(refs.has(ex.id)) ex.image=refs.get(ex.id); });
})();
