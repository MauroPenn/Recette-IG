/* Sport & Nutrition — Étirements / Pectoraux — LOT 1 (2 exercices)
   Uniquement les vues Pectoraux, images validées par l'utilisateur.
   Ne modifie ni Nuque & cervicales, ni Épaules & bras, ni les données/Supabase. */
(function(){
'use strict';
const GROUPS='etirements-exercices', LIST='etirements-pectoraux-liste', DETAIL='etirements-pectoraux-fiche';
const EX=[
 {id:'mur',title:'Étirement des pectoraux contre un mur',subtitle:'Ouvrir doucement la poitrine, un bras à la fois.',duration:'20 à 30 s',side:'Les deux côtés',steps:[
  'Place-toi debout près d’un mur, le dos droit et les épaules relâchées.',
  'Tends un bras sur le côté et pose la paume contre le mur à hauteur d’épaule.',
  'Tourne doucement le buste dans le sens opposé jusqu’à sentir l’ouverture de la poitrine.',
  'Maintiens puis change de côté en respirant calmement.'
 ],tips:['Garde l’épaule basse et la nuque détendue.','Ne force jamais la rotation.','Arrête si la douleur devient vive.']},
 {id:'porte',title:'Ouverture des pectoraux dans l’encadrement d’une porte',subtitle:'Ouvrir doucement la poitrine avec les deux bras.',duration:'20 à 30 s',side:'Les deux côtés',steps:[
  'Place-toi dans l’encadrement d’une porte, face à l’ouverture.',
  'Pose les avant-bras et les mains de chaque côté, coudes à environ 90°, à la hauteur des épaules.',
  'Avance doucement un pied pour ouvrir la poitrine et ressentir l’étirement des pectoraux.',
  'Maintiens la position 20 à 30 secondes en respirant calmement, puis relâche.'
 ],tips:['Garde les épaules basses et détendues.','Avance doucement, sans forcer ni cambrer le bas du dos.','Arrête si la douleur devient vive.']}
];
let selected='mur';
const asset=(kind,n)=>'./etirements-pectoraux-'+kind+'-'+n+'-v1.webp?v=1';
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function go(view,id){if(id)selected=id;state.view=view;state.selected=null;render();try{window.scrollTo(0,0)}catch(_){}}
function shell(label){
 document.body.classList.add('ez1-active');
 if(typeof updateShell==='function')updateShell();
 if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
 main.replaceChildren();const section=document.createElement('section');
 section.className='px2-screen';section.setAttribute('aria-label',label);main.appendChild(section);return section;
}
function enablePectoraux(){
 const buttons=[...document.querySelectorAll('.et6-list .et6-card')];
 const target=buttons.find(b=>b.textContent.trim().startsWith('Pectoraux'));
 if(!target || target.dataset.px2Enabled==='1')return;
 target.disabled=false;target.dataset.px2Enabled='1';
 target.setAttribute('aria-label','Pectoraux : 2 exercices disponibles sur 7 prévus');
 target.addEventListener('click',()=>go(LIST));
}
function back(text,target){
 const b=document.createElement('button');b.className='px2-back';b.type='button';b.textContent='← '+text;
 b.addEventListener('click',()=>go(target));return b;
}
function list(){
 const root=shell('Étirements — Pectoraux, 2 exercices disponibles');
 root.append(back('Retour aux Exercices',GROUPS));
 const heading=document.createElement('header');heading.className='px2-list-heading';
 heading.innerHTML='<span>ÉTIREMENTS</span><h1>Pectoraux</h1><p>2 exercices disponibles sur 7 prévus</p>';
 root.append(heading);
 EX.forEach((ex,index)=>{
  const btn=document.createElement('button');btn.className='px2-band';btn.type='button';
  btn.setAttribute('aria-label','Ouvrir '+ex.title);
  const img=document.createElement('img');img.src=asset('bandeau',index+1);img.alt='';img.draggable=false;
  img.loading=index===0?'eager':'lazy';img.decoding='async';btn.append(img);
  btn.addEventListener('click',()=>go(DETAIL,ex.id));root.append(btn);
 });
 const note=document.createElement('p');note.className='px2-coming';note.textContent='Les 5 autres étirements des pectoraux seront ajoutés après validation.';root.append(note);
}
function detail(){
 const ex=EX.find(x=>x.id===selected)||EX[0],n=EX.indexOf(ex)+1;
 const root=shell('Fiche étirement : '+ex.title);root.append(back('Retour à Pectoraux',LIST));
 const hero=document.createElement('img');hero.className='px2-hero';hero.src=asset('fiche',n);hero.alt='Illustration : '+ex.title;
 hero.decoding='async';root.append(hero);
 const stats=document.createElement('div');stats.className='px2-stats';stats.setAttribute('aria-label','Informations de l’exercice');
 [['1','Zone ciblée','Pectoraux'],['2','Durée',ex.duration],['3','Niveau','Doux'],['4','Côtés',ex.side]].forEach(([ico,label,val])=>{
  const box=document.createElement('div');box.className='px2-stat';
  const image=document.createElement('img');image.src='./etirements-epaules-info-ico-'+ico+'.png';image.alt='';
  const meta=document.createElement('div'),lab=document.createElement('span'),v=document.createElement('strong');
  lab.textContent=label+' :';v.textContent=val;meta.append(lab,v);box.append(image,meta);stats.append(box);
 });root.append(stats);
 const panel=(name,arr,ordered)=>{
  const block=document.createElement('section');block.className='px2-panel';
  const title=document.createElement('h2');title.className='px2-panel-heading';
  const logo=document.createElement('span');logo.className='px2-symbol';logo.textContent=ordered?'☷':'♧';title.append(logo,document.createTextNode(name));
  const ul=document.createElement(ordered?'ol':'ul');
  arr.forEach(item=>{let li=document.createElement('li');li.textContent=item;ul.append(li)});
  block.append(title,ul);root.append(block);
 };
 panel('Comment faire',ex.steps,true);panel('Conseils',ex.tips,false);
 const caution=document.createElement('p');caution.className='px2-caution';caution.textContent='Effectue le mouvement lentement, sans forcer et sans douleur.';root.append(caution);
}
const oldRender=render;
render=function(){
 if(state.view===LIST)return list();
 if(state.view===DETAIL)return detail();
 const result=oldRender.apply(this,arguments);
 if(state.view===GROUPS)enablePectoraux();
 return result;
};
})();
