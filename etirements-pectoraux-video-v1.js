/* Étirements Pectoraux — ajoute un bouton vidéo cliquable aux 7 fiches, sans modifier les images ou les exercices. */
(function () {
  'use strict';
  const DETAIL='etirements-pectoraux-fiche';

  function addButton() {
    if (typeof state==='undefined' || state.view!==DETAIL || typeof main==='undefined') return;
    const root=main.querySelector('.px2-screen');
    if (!root || root.querySelector('.pxv-video-button')) return;

    const title=(root.getAttribute('aria-label')||'').replace(/^Fiche étirement\s*:\s*/, '') || 'cet exercice';
    const button=document.createElement('button');
    button.type='button';
    button.className='pxv-video-button';
    button.setAttribute('aria-label','Voir la vidéo explicative : '+title);
    button.title='Voir la vidéo explicative';
    button.innerHTML='<span class="pxv-play" aria-hidden="true"><span class="pxv-triangle"></span></span><span>Voir la vidéo explicative</span>';
    button.addEventListener('click', function () { openNotice(title,button); });
    root.appendChild(button);
  }

  function openNotice(title,returnFocus) {
    if(main.querySelector('.pxv-video-overlay'))return;
    const overlay=document.createElement('div');
    overlay.className='pxv-video-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','pxv-video-heading');
    const dialog=document.createElement('div');dialog.className='pxv-video-dialog';
    const heading=document.createElement('h2');heading.id='pxv-video-heading';
    heading.textContent='Démonstration bientôt disponible';
    const description=document.createElement('p');
    description.textContent='La vidéo explicative de « '+title+' » sera ajoutée prochainement. Tu peux déjà consulter les étapes et les conseils de la fiche.';
    const close=document.createElement('button');close.type='button';close.className='pxv-video-close';
    close.textContent='Revenir à l’exercice';
    function dismiss() {
      overlay.remove();document.removeEventListener('keydown',escapeHandler);
      if(document.contains(returnFocus))returnFocus.focus();
    }
    function escapeHandler(e){if(e.key==='Escape')dismiss();}
    close.addEventListener('click',dismiss);
    overlay.addEventListener('click',e=>{if(e.target===overlay)dismiss();});
    document.addEventListener('keydown',escapeHandler);
    dialog.append(heading,description,close);overlay.appendChild(dialog);main.appendChild(overlay);
    close.focus();
  }

  const previousRender=render;
  render=function () {
    const result=previousRender.apply(this,arguments);
    addButton();
    return result;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton,{once:true});
  else addButton();
})();
