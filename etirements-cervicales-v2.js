/* Sport & Nutrition – Étirements / Nuque & cervicales, correction V2.
 * 6 bandeaux au ratio exact Musculation 560x190, avec défilement vertical naturel.
 * Les 6 fiches suivent STRICTEMENT la structure graphique validée de la fiche n°1 :
 * Retour, portrait/titre, 4 infos, étapes numérotées, conseils, bienfaits, bouton vidéo.
 * Aucun enregistrement modifié ; rien ne touche à Musculation, aux séances ou à la synchro V5.
 */
(function(){
  'use strict';
  const LIST='etirements-exercices', DETAIL='etirements-cervicales-fiche';
  const DIR='./';
  const titles=[
    'Inclinaison latérale de la tête', 'Rotation cervicale douce',
    'Flexion du cou vers l’avant', 'Étirement du trapèze supérieur',
    'Étirement de l’élévateur de la scapula', 'Rétraction douce du menton'
  ];
  const ids=['inclinaison','rotation','flexion','trapeze','elevateur','menton'];
  const instructions=[
    ['Tiens-toi droit(e), épaules relâchées.', 'Incline doucement la tête sur le côté.', 'Garde l’épaule opposée basse.', 'Maintiens puis change de côté.'],
    ['Assieds-toi ou reste debout, le dos droit et les épaules relâchées.', 'Tourne lentement la tête vers la droite, comme pour regarder au-dessus de l’épaule.', 'Arrête-toi dès que tu sens une légère tension, sans chercher à aller plus loin.', 'Reviens au centre puis recommence vers la gauche.'],
    ['Place-toi assis(e) ou debout, la colonne allongée.', 'Laisse descendre doucement le menton vers la poitrine.', 'Garde les épaules basses et les bras détendus.', 'Reviens lentement à la position neutre.'],
    ['Assieds-toi bien droit(e), les épaules détendues.', 'Laisse un bras descendre vers le sol sans hausser l’épaule.', 'Incline très doucement la tête du côté opposé.', 'Maintiens sans tirer puis reviens lentement et change de côté.'],
    ['Assieds-toi droit(e), les épaules basses.', 'Tourne légèrement la tête, environ 45°, vers une aisselle.', 'Incline doucement le regard vers le bas sans tirer sur le crâne.', 'Reviens au centre puis recommence de l’autre côté.'],
    ['Assieds-toi ou reste debout, les yeux dirigés droit devant.', 'Recule doucement le menton à l’horizontale, comme pour former un petit double menton.', 'Maintiens trois à cinq secondes sans incliner la tête vers le bas.', 'Relâche et recommence cinq à huit fois tranquillement.']
  ];
  const img=(filename)=>DIR+filename;
  const base=(name)=>img('etirements-fiche-'+name+'-v1.webp');
  const v2=(i,name)=>img('etirements-cervicales-detail-'+name+'-'+i+'-v2.webp?v=2');
  const altSuffix='. Les textes et la photo appartiennent à la fiche descriptive de cet exercice.';
  function jump(to,i){
    if(i)state.evc1ExerciseId=ids[i-1];
    state.view=to;state.selected=null;render();
    try{window.scrollTo({top:0,behavior:'instant'})}catch(_){window.scrollTo(0,0)}
  }
  function root(type){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function')updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.innerHTML='';
    const el=document.createElement('section');
    el.className='evc1-screen '+type;
    el.setAttribute('aria-label',type==='evc2-category'?'Liste des six exercices Nuque et cervicales':'Fiche explicative Nuque et cervicales');
    main.appendChild(el);return el;
  }
  function imageSlice(container,filename,fn,label,cssClass){
    const el=document.createElement(fn?'button':'div');
    if(fn)el.type='button';
    el.className='evc1-slice '+(cssClass||'')+(fn?' evc1-clickable':'');
    if(label)el.setAttribute('aria-label',label);
    const pic=document.createElement('img');pic.src=filename;pic.alt='';pic.decoding='async';pic.loading='eager';pic.draggable=false;
    el.appendChild(pic);if(fn)el.addEventListener('click',fn);
    container.appendChild(el);return el;
  }
  function category(){
    const container=root('evc2-category');
    const head=document.createElement('div');head.className='evc2-header';
    const headimg=document.createElement('img');headimg.src=img('etirements-cervicales-entete-v1.webp');headimg.alt='Nuque et cervicales. Choisissez un exercice.';
    head.appendChild(headimg);
    const back=document.createElement('button');back.type='button';back.className='evc2-back';back.setAttribute('aria-label','Retour aux Étirements');
    back.addEventListener('click',()=>jump('etirements-menu'));head.appendChild(back);container.appendChild(head);
    for(let i=1;i<=6;i++){
      const btn=document.createElement('button');btn.type='button';btn.className='evc2-banner';
      btn.setAttribute('aria-label','Ouvrir : '+titles[i-1]);
      const photo=document.createElement('img');photo.src=img('etirements-cervicales-bandeau-'+i+'-v2.webp?v=2');photo.alt='';photo.loading='lazy';photo.decoding='async';
      btn.appendChild(photo);btn.addEventListener('click',()=>jump(DETAIL,i));container.appendChild(btn);
    }
    const foot=document.createElement('div');foot.className='evc2-footer';
    const f=document.createElement('img');f.src=img('etirements-cervicales-pied-v1.webp');f.alt='Sport & Nutrition · Étirements · Nuque et cervicales';f.loading='lazy';foot.appendChild(f);container.appendChild(foot);
  }
  function videoNotice(){
    const old=main.querySelector('.evc1-modal');if(old)return;
    const modal=document.createElement('div');modal.className='evc1-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    modal.innerHTML='<div class="evc1-modal-card"><div class="evc1-modal-icon" aria-hidden="true">▶</div><h2>Démonstration bientôt disponible</h2><p>La fiche est accessible maintenant. Nous ajouterons ici la vidéo animée, avec des instructions en français et une ambiance zen.</p><button type="button">Revenir à l’exercice</button></div>';
    main.appendChild(modal);const close=()=>modal.remove();modal.querySelector('button').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});modal.querySelector('button').focus();
  }
  function detail(){
    const chosen=ids.indexOf(state.evc1ExerciseId);const ix=chosen<0?1:chosen+1;
    const container=root('evc1-fiche-approuvee evc2-detail');
    imageSlice(container,base('retour'),()=>jump(LIST),'Retour à Nuque et cervicales');
    if(ix===1){
      // Fiche #1 : conserver les visuels EXACTS validés, sans les redessiner.
      imageSlice(container,base('hero'),null,'');imageSlice(container,base('infos'),null,'');
      imageSlice(container,base('comment'),null,'');
    } else {
      // Même mise en page en sept blocs que la fiche n°1 : aucune variante HTML.
      imageSlice(container,v2(ix,'hero'),null,'');imageSlice(container,v2(ix,'infos'),null,'');
      imageSlice(container,v2(ix,'comment'),null,'');
    }
    // Conseils, Bienfaits et bouton vidéo : mêmes éléments graphiques approuvés sur les six fiches.
    imageSlice(container,base('conseils'),null,'');imageSlice(container,base('bienfaits'),null,'');
    imageSlice(container,base('video'),videoNotice,'Voir la vidéo explicative — bientôt disponible');
    // Texte sémantique de la fiche pour les technologies d’assistance.
    const assist=document.createElement('div');assist.className='evc2-visually-hidden';
    assist.innerHTML='<h1>'+titles[ix-1].replace(/&/g,'&amp;')+'</h1><h2>Comment faire</h2><ol>'+instructions[ix-1].map(t=>'<li>'+t.replace(/&/g,'&amp;')+'</li>').join('')+'</ol>';
    container.appendChild(assist);
  }
  const style=document.createElement('style');style.textContent='.evc2-visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;clip-path:inset(50%);}';document.head.appendChild(style);
  const oldRender=render;
  render=function(){
    if(state.view===LIST)return category();
    if(state.view===DETAIL)return detail();
    return oldRender.apply(this,arguments);
  };
})();
