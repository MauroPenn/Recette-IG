/* DOS V3 : changement des dix fichiers image à la source (sans modifier les fiches). */
(function(){
  'use strict';
  if (typeof dosExercices === 'undefined' || !Array.isArray(dosExercices)) return;
  const fichiers = new Map([
    ['rowing-unilateral-haltere', './dos-rowing-unilateral-haltere-orange-v3.webp'],
    ['rowing-buste-penche-halteres', './dos-rowing-buste-penche-halteres-orange-v3.webp'],
    ['pullover-haltere', './dos-pullover-haltere-orange-v3.webp'],
    ['oiseau-buste-penche', './dos-oiseau-buste-penche-orange-v3.webp'],
    ['superman-sol', './dos-superman-sol-orange-v3.webp'],
    ['bird-dog-row', './dos-bird-dog-row-orange-v3.webp'],
    ['rowing-kettlebell', './dos-rowing-kettlebell-orange-v3.webp'],
    ['souleve-terre-roumain', './dos-souleve-terre-roumain-orange-v3.webp'],
    ['tirage-coudes-ouverts-halteres', './dos-tirage-coudes-ouverts-halteres-orange-v3.webp'],
    ['extension-lombaire-sol', './dos-extension-lombaire-sol-orange-v3.webp']
  ]);
  dosExercices.forEach(function(exercice){
    const fichier = fichiers.get(exercice.id);
    if (fichier) exercice.image = fichier;
  });
})();
