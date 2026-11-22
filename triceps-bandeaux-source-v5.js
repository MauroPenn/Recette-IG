/* Triceps V5 - exploite les 10 images WebP réellement reconstruites dans GitHub.
   Ne retouche plus aucune image dans le navigateur. */
(function(){
  'use strict';
  if(typeof tricepsExercices==='undefined'||!Array.isArray(tricepsExercices))return;
  const ids=new Set(['pompes-diamant','dips-sur-chaise','kickback-triceps','extension-nuque-deux-mains','extension-triceps-unilaterale','extension-triceps-travers-corps','extension-triceps-allonge-sol','tate-press-sol','developpe-serre-sol','dips-entre-deux-supports']);
  tricepsExercices.forEach(ex=>{
    if(!ids.has(ex.id))return;
    const previous=ex.image;
    const replacement='./triceps-'+ex.id+'-orange-v5.webp';
    const probe=new Image();
    probe.onload=()=>{
      ex.image=replacement;
      // Rafraîchit également la page déjà ouverte, si nécessaire.
      document.querySelectorAll('.muscu-triceps-photo img, #mcsCatalog .mcs-catalog-row[data-mcs-toggle^="triceps:"] img.mcs-thumb').forEach(el=>{
        if(el.getAttribute('src')===previous)el.src=replacement;
      });
    };
    probe.src=replacement;
  });
})();
