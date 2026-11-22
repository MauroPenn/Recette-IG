/* BICEPS V1 — harmonisation légère.
   Ajoute une classe repère sur le body et force un rafraîchissement d'affichage pour la catégorie Biceps si nécessaire. */
(function(){
  'use strict';
  document.documentElement.classList.add('biceps-net-v1-ready');
  const schedule = () => {
    const rows = document.querySelectorAll('#mcsCatalog .mcs-catalog-row[data-mcs-toggle^="biceps:"]');
    rows.forEach(r => {
      const img = r.querySelector('img.mcs-thumb');
      if (img) {
        img.style.objectFit = 'fill';
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  } else {
    schedule();
  }
  setTimeout(schedule, 500);
  setTimeout(schedule, 1200);
})();
