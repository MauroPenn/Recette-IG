/* Étirements – V7 : bandeaux paysages validés pour l’accueil Exercices.
 * Intervention volontairement limitée à l’écran etirements-exercices.
 * Le catalogue Nuque & cervicales, Épaules & bras (10 fiches), Musculation,
 * les données et la synchronisation V5 restent pris en charge par leurs modules existants.
 */
(function(){
  'use strict';
  const VIEW = 'etirements-exercices';
  const ZONES = [
    {id:'nuque', title:'Nuque & cervicales', count:6, target:'etirements-cervicales-liste'},
    {id:'epaules', title:'Épaules & bras', count:10, target:'etirements-epaules-liste'},
    {id:'pectoraux', title:'Pectoraux', count:7},
    {id:'dos', title:'Dos', count:10},
    {id:'hanches', title:'Hanches & fessiers', count:10},
    {id:'cuisses', title:'Cuisses', count:10},
    {id:'mollets', title:'Mollets & chevilles', count:8}
  ];
  function go(to){
    state.view=to;state.selected=null;render();
    try{window.scrollTo(0,0)}catch(e){}
  }
  function addImage(parent,filename){
    const im=document.createElement('img');
    im.src='./et7-'+filename+'.webp';im.alt='';
    im.decoding='async';im.loading=filename==='accueil'?'eager':'lazy';
    im.draggable=false;parent.appendChild(im);
  }
  function makeCard(parent,id,label,fn){
    const isBtn=typeof fn==='function';
    const card=document.createElement(isBtn?'button':'div');
    if(isBtn)card.type='button';
    card.className='et7-picture-card';
    if(!isBtn)card.classList.add('et7-soon');
    card.setAttribute('aria-label',label);
    if(isBtn)card.addEventListener('click',fn);
    addImage(card,id);parent.appendChild(card);
    return card;
  }
  function show(){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function')updateShell();
    if(typeof bottomNav!=='undefined')bottomNav.classList.add('hidden');
    main.replaceChildren();
    const section=document.createElement('section');section.className='et7-screen';
    section.setAttribute('aria-label','Étirements : 7 zones du corps, 61 exercices prévus');
    const back=document.createElement('button');back.type='button';back.className='et7-back';
    back.textContent='← Retour aux Étirements';back.addEventListener('click',()=>go('etirements-menu'));
    section.appendChild(back);
    const hero=makeCard(section,'accueil','Exercices : choisir une zone du corps',()=>{
      const first=section.querySelector('.et7-zones .et7-picture-card');
      if(first)first.scrollIntoView({behavior:'smooth',block:'start'});
    });
    hero.classList.add('et7-hero');
    const rows=document.createElement('div');rows.className='et7-zones';
    ZONES.forEach(z=>makeCard(rows,z.id,z.target?`${z.title} : ${z.count} exercices`:`${z.title} : ${z.count} exercices prévus, bientôt disponible`,z.target?()=>go(z.target):null));
    section.appendChild(rows);
    const footer=document.createElement('footer');footer.className='et7-footer';
    footer.textContent='SPORT & NUTRITION · UNIVERS ÉTIREMENTS';section.appendChild(footer);
    main.appendChild(section);
  }
  const previous=render;
  render=function(){
    if(state.view===VIEW)return show();
    return previous.apply(this,arguments);
  };
})();
