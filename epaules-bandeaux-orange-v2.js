/* ÉPAULES V2 - dix identifiants exacts du catalogue existant. */
(function(){
  'use strict';
  if (typeof epaulesExercices === 'undefined' || !Array.isArray(epaulesExercices)) return;
  const noms = new Map([
    ['developpe-militaire-halteres','./epaules-developpe-militaire-halteres-orange-v2.webp'],
    ['developpe-arnold','./epaules-developpe-arnold-orange-v2.webp'],
    ['elevations-laterales','./epaules-elevations-laterales-orange-v2.webp'],
    ['elevations-frontales','./epaules-elevations-frontales-orange-v2.webp'],
    ['oiseau-buste-penche','./epaules-oiseau-buste-penche-orange-v2.webp'],
    ['developpe-epaules-assis','./epaules-developpe-epaules-assis-orange-v2.webp'],
    ['tirage-menton-halteres','./epaules-tirage-menton-halteres-orange-v2.webp'],
    ['pike-push-up','./epaules-pike-push-up-orange-v2.webp'],
    ['elevations-laterales-unilaterales','./epaules-elevations-laterales-unilaterales-orange-v2.webp'],
    ['y-raise-sol','./epaules-y-raise-sol-orange-v2.webp'],
  ]);
  epaulesExercices.forEach(ex => {const p=noms.get(ex.id); if(p) ex.image=p;});
})();
