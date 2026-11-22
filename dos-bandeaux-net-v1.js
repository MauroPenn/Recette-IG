/* Dos V1 : remplacer les images à la source pour les bandeaux Dos déjà validés. */
(function(){
  'use strict';
  if (typeof dosExercices === 'undefined' || !Array.isArray(dosExercices)) return;
  const refs = new Map([
    ['rowing-unilateral-haltere', './dos-rowing-unilateral-haltere-net-v1.png'],
    ['rowing-buste-penche-halteres', './dos-rowing-buste-penche-halteres-net-v1.png'],
    ['pullover-haltere', './dos-pullover-haltere-net-v1.png'],
    ['oiseau-buste-penche', './dos-oiseau-buste-penche-net-v1.png'],
    ['superman-sol', './dos-superman-sol-net-v1.png'],
    ['bird-dog-row', './dos-bird-dog-row-net-v1.png'],
    ['rowing-kettlebell', './dos-rowing-kettlebell-net-v1.png'],
    ['souleve-terre-roumain', './dos-souleve-terre-roumain-net-v1.png']
  ]);
  dosExercices.forEach(ex => { if (refs.has(ex.id)) ex.image = refs.get(ex.id); });
})();
