/* Sport & Nutrition — Étirements, restauration fidèle après validation V6.
 * Vues modifiées UNIQUEMENT : etirements-exercices (7 groupes),
 * etirements-epaules-liste (10 cartes). Les fiches, séances, comptes, synchro,
 * réglages et autres univers sont volontairement délégués aux modules existants.
 */
(function(){
 'use strict';
 const GROUPS='etirements-exercices', SHOULDER='etirements-epaules-liste';
 const ZONES=[
   {id:'nuque',title:'Nuque & cervicales',count:6,to:'etirements-cervicales-liste'},
   {id:'epaules',title:'Épaules & bras',count:10,to:SHOULDER},
   {id:'pectoraux',title:'Pectoraux',count:7},
   {id:'dos',title:'Dos',count:10},
   {id:'hanches',title:'Hanches & fessiers',count:10},
   {id:'cuisses',title:'Cuisses',count:10},
   {id:'mollets',title:'Mollets & chevilles',count:8}
 ];
 const SHOULDER_EX=[
   {id:'cercles',title:'Cercles d’épaules'},
   {id:'haussement',title:'Haussement et relâchement'},
   {id:'deltoide',title:'Étirement du deltoïde'},
   {id:'triceps',title:'Étirement des triceps'},
   {id:'ouverture-poitrine',title:'Ouverture poitrine et biceps'},
   {id:'avantbras',title:'Étirement des avant-bras'},
   {id:'triceps-haut',title:'Étirement du triceps au-dessus de la tête'},
   {id:'ouverture-epaules',title:'Ouverture des épaules'},
   {id:'biceps-mur',title:'Étirement des biceps contre le mur'},
   {id:'epaule-croisee',title:'Étirement croisé de l’épaule'}
 ];
 function navigate(view,id){
   if(id)state.eeb1Selected=id;
   state.view=view;state.selected=null;render();
   try{window.scrollTo({top:0,behavior:'instant'})}catch(e){try{window.scrollTo(0,0)}catch(_){}}
 }
 function rootScreen(label){
   document.body.classList.add('ez1-active');
   if(typeof updateShell==='function')updateShell();
   if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
   main.replaceChildren();
   const root=document.createElement('section');root.className='et6-screen';
   root.setAttribute('aria-label',label);main.appendChild(root);return root;
 }
 function back(root,text,target){
   const b=document.createElement('button');b.type='button';b.className='et6-back';
   b.textContent='← '+text;b.addEventListener('click',()=>navigate(target));root.appendChild(b);
 }
 function hero(root,kind,kicker,title,sub,bg){
   const h=document.createElement('header');h.className='et6-intro'+(kind==='shoulders'?' et6-intro--shoulders':'');
   h.style.setProperty('--et6-bg',`url(./${bg})`);
   const s=document.createElement('span');s.textContent=kicker;
   const t=document.createElement('h1');t.textContent=title;
   const p=document.createElement('p');p.textContent=sub;
   h.append(s,t,p);root.appendChild(h);
 }
 function banner(opts){
   const b=document.createElement('button');b.type='button';
   b.className='et6-card'+(opts.type==='exercise'?' et6-card--exercise':'');
   if(opts.type==='exercise'){
     if(opts.title.length>36)b.classList.add('et6-very-long');
     else if(opts.title.length>26)b.classList.add('et6-long');
   }
   b.style.setProperty('--et6-bg',`url(./${opts.photo})`);
   b.setAttribute('aria-label',opts.label);
   const pic=document.createElement('img');pic.className='et6-icon';pic.src='./'+opts.icon;pic.alt='';pic.loading='lazy';pic.draggable=false;
   const wrap=document.createElement('span');wrap.className='et6-copy';
   const name=document.createElement('strong');name.className='et6-name';name.textContent=opts.title;wrap.append(name);
   if(opts.count){const c=document.createElement('span');c.className='et6-count';c.textContent=opts.count+' exercices';wrap.append(c)}
   const arrow=document.createElement('span');arrow.className='et6-chevron';arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
   b.append(pic,wrap,arrow);
   if(opts.onClick)b.addEventListener('click',opts.onClick);
   else b.disabled=true;
   return b;
 }
 function groups(){
   const root=rootScreen('Étirements — Choisissez un groupe musculaire');
   back(root,'Retour aux Étirements','etirements-menu');
   hero(root,'groups','UNIVERS ÉTIREMENTS','Exercices','Choisissez une zone du corps','et6-intro.webp');
   const list=document.createElement('div');list.className='et6-list';
   for(const item of ZONES){
     list.appendChild(banner({title:item.title,count:item.count,type:'zone',label:item.to?item.title+', '+item.count+' exercices':item.title+', '+item.count+' exercices, en préparation',
       photo:'et6-zone-'+item.id+'.webp',icon:'et6-icon-zone-'+item.id+'.webp',
       onClick:item.to?()=>navigate(item.to):null}));
   }
   root.appendChild(list);
   const foot=document.createElement('footer');foot.className='et6-footer';foot.textContent='SPORT & NUTRITION · UNIVERS ÉTIREMENTS';root.appendChild(foot);
 }
 function shoulders(){
   const root=rootScreen('Étirements — Épaules et bras — 10 exercices');
   back(root,'Retour aux Exercices',GROUPS);
   hero(root,'shoulders','ÉTIREMENTS','Épaules & bras','10 exercices','et6-epaules-entete.webp');
   const list=document.createElement('div');list.className='et6-list';
   SHOULDER_EX.forEach((ex,i)=>{
     let n=String(i+1).padStart(2,'0');
     list.appendChild(banner({title:ex.title,type:'exercise',photo:'et6-epaules-'+n+'.webp',icon:'et6-icon-epaules-'+n+'.webp',label:'Ouvrir '+ex.title,onClick:()=>navigate('etirements-epaules-fiche',ex.id)}));
   });
   root.appendChild(list);
   const foot=document.createElement('footer');foot.className='et6-footer';foot.textContent='SPORT & NUTRITION · ÉTIREMENTS · ÉPAULES & BRAS';root.appendChild(foot);
 }
 const previousRender=render;
 render=function(){
   if(state.view===GROUPS)return groups();
   if(state.view===SHOULDER)return shoulders();
   return previousRender.apply(this,arguments);
 };
})();
