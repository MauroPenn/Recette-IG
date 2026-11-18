/* Chevilles & mollets V2 : accueil et exercices 1/2, intégration fonctionnelle. */
(function(){
 'use strict';
 const GROUPS='etirements-exercices';
 const LIST='etirements-chevilles-mollets-liste-v2';
 const DETAIL='etirements-chevilles-mollets-fiche-v2';
 const DATA=[
  {id:1,title:'Mollet debout contre un mur'},
  {id:2,title:'Soléaire, genou fléchi'}
 ];
 let selected=1;
 function go(view,id){
  if(Number.isInteger(id))selected=id;
  state.view=view;
  state.selected=null;
  render();
  try{window.scrollTo(0,0);}catch(_e){}
 }
 function photo(file,cls,alt){
  const im=document.createElement('img');
  im.src='./'+file+'?v=2';
  im.className=cls||'';
  im.alt=alt||'';
  im.decoding='async';
  im.draggable=false;
  return im;
 }
 function screen(label,detail){
  document.body.classList.add('ez1-active');
  if(typeof updateShell==='function')updateShell();
  if(typeof bottomNav!=='undefined' && bottomNav)bottomNav.classList.add('hidden');
  main.replaceChildren();
  const s=document.createElement('section');
  s.className='cm1-screen '+(detail?'cm1-detail':'cm1-list');
  s.setAttribute('aria-label',label);
  main.appendChild(s);
  return s;
 }
 function listView(){
  const s=screen('Étirements — Chevilles & mollets : 2 exercices disponibles',false);
  const back=document.createElement('button');
  back.type='button';back.className='cm1-back';back.textContent='← Retour aux Exercices';
  back.addEventListener('click',()=>go(GROUPS));
  s.appendChild(back);
  s.appendChild(photo('etirements-chevilles-mollets-entete-v1.webp','cm1-header','Chevilles & mollets : choisissez un exercice.'));
  DATA.forEach((ex,i)=>{
   const btn=document.createElement('button');
   btn.type='button';btn.className='cm1-band';
   btn.setAttribute('aria-label','Ouvrir la fiche : '+ex.title);
   const img=photo('etirements-chevilles-mollets-bandeau-'+ex.id+'-v1.webp','',ex.title);
   img.loading=i===0?'eager':'lazy';
   btn.appendChild(img);
   btn.addEventListener('click',()=>go(DETAIL,ex.id));
   s.appendChild(btn);
  });
  const note=document.createElement('p');note.className='cm1-note';
  note.textContent='Les autres étirements des chevilles et mollets seront ajoutés après validation.';
  s.appendChild(note);
 }
 function videoNotice(title){
  if(main.querySelector('.cm1-dialog-shade'))return;
  const shade=document.createElement('div');
  shade.className='cm1-dialog-shade';
  shade.setAttribute('role','dialog');shade.setAttribute('aria-modal','true');
  shade.setAttribute('aria-label','Démonstration vidéo');
  const card=document.createElement('div');card.className='cm1-dialog-card';
  const h=document.createElement('h2');h.textContent='Démonstration bientôt disponible';
  const p=document.createElement('p');p.textContent='La vidéo explicative de « '+title+' » sera ajoutée prochainement. Les consignes sont déjà disponibles sur la fiche.';
  const b=document.createElement('button');b.type='button';b.className='cm1-dialog-close';b.textContent='Revenir à l’exercice';
  function close(){shade.remove();document.removeEventListener('keydown',escape);}
  function escape(e){if(e.key==='Escape')close();}
  b.addEventListener('click',close);
  shade.addEventListener('click',e=>{if(e.target===shade)close();});
  document.addEventListener('keydown',escape);
  card.append(h,p,b);shade.appendChild(card);main.appendChild(shade);b.focus();
 }
 function detailView(){
  const ex=DATA.find(e=>e.id===selected)||DATA[0];
  const s=screen('Fiche étirement : '+ex.title,true);
  const frame=document.createElement('div');frame.className='cm1-frame';
  const img=photo('etirements-chevilles-mollets-fiche-'+ex.id+'-v1.webp','cm1-detail-img','Fiche complète : '+ex.title+', étapes, conseils et bienfaits.');
  img.loading='eager';frame.appendChild(img);
  const back=document.createElement('button');back.type='button';back.className='cm1-hotspot cm1-hotspot--back';
  back.setAttribute('aria-label','Retour à Chevilles & mollets');
  back.addEventListener('click',()=>go(LIST));
  const video=document.createElement('button');video.type='button';video.className='cm1-hotspot cm1-hotspot--video';
  video.setAttribute('aria-label','Voir la vidéo explicative : '+ex.title);
  video.addEventListener('click',()=>videoNotice(ex.title));
  frame.append(back,video);s.appendChild(frame);
 }
 function isChevillesMollets(el){
  const t=((el.getAttribute('aria-label')||'')+' '+(el.textContent||'')).replace(/\s+/g,' ').toLocaleLowerCase('fr');
  return /cheville/.test(t)&&/mollet/.test(t)&&t.length<180;
 }
 function activate(){
  const cards=Array.from(document.querySelectorAll('.et7-zones .et7-picture-card, .et6-list .et6-card, .et7-zones button, .et6-list button'));
  const target=cards.find(isChevillesMollets);
  if(!target||target.dataset.cm1Ready==='1')return;
  let button=target;
  if(target.tagName!=='BUTTON'){
   button=document.createElement('button');
   button.type='button';button.className=target.className;
   while(target.firstChild)button.appendChild(target.firstChild);
   target.replaceWith(button);
  }
  button.dataset.cm1Ready='1';
  button.classList.remove('et7-soon');
  button.removeAttribute('disabled');button.removeAttribute('aria-disabled');
  if('disabled' in button)button.disabled=false;
  button.style.pointerEvents='auto';button.style.cursor='pointer';
  button.setAttribute('aria-label','Chevilles & mollets : 2 exercices disponibles');
  button.setAttribute('role','button');
  if(!button.hasAttribute('tabindex'))button.setAttribute('tabindex','0');
  const click=e=>{e.preventDefault();e.stopImmediatePropagation();go(LIST);};
  button.addEventListener('click',click,true);
  if(button.tagName!=='BUTTON')button.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();go(LIST);}
  });
 }
 const previous=render;
 render=function(){
  if(state.view===LIST)return listView();
  if(state.view===DETAIL)return detailView();
  const value=previous.apply(this,arguments);
  if(state.view===GROUPS)activate();
  return value;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
  if(state.view===GROUPS)activate();
 },{once:true});
 else if(state.view===GROUPS)activate();
})();
