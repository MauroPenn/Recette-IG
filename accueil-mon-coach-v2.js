/* Accueil général – ajout de la carte « Mon Coach », sans remplacer les univers existants. */
(function(){
  'use strict';
  const CARD_ID='mon-coach-univers-v2';
  const IMG='./accueil-mon-coach-carte-v2.webp?v=2';
  const labels=['Cuisine & Nutrition','Musculation','Autre sport','Étirements','Pilates','Historique','Paramètres'];
  const clean=s=>String(s||'').normalize('NFC').replace(/\s+/g,' ').trim().toLowerCase();
  const same=(a,b)=>clean(a)===clean(b);
  const isOneOf=(s)=>labels.some(v=>same(s,v));
  let queued=false;

  function labelNode(root,label){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      if(same(n.nodeValue,label)) return n.parentElement;
    }
    return null;
  }
  function categoryCount(el){
    if(!el)return 0;
    let count=0;
    for(const label of labels)if(labelNode(el,label))count++;
    return count;
  }
  function gridFor(main,anchor){
    // Prefer the first shared grid containing multiple existing universe tiles.
    let n=anchor;
    let fallback=null;
    while(n&&n!==main){
      if(n.nodeType===1 && n.children.length>=2){
        const distinct=[...n.children].filter(ch=>categoryCount(ch)>0).length;
        const c=categoryCount(n);
        const cls=String(n.className||'').toLowerCase();
        const display=window.getComputedStyle(n).display;
        if(distinct>=2 && c>=4 && (display==='grid'||/grid|univers|cards|tuiles|hub/.test(cls)))return n;
        if(distinct>=2 && c>=4 && !fallback)fallback=n;
      }
      n=n.parentElement;
    }
    return fallback;
  }
  function directChild(grid,n){
    while(n&&n.parentElement!==grid)n=n.parentElement;
    return n||null;
  }
  function toast(){
    let tip=document.getElementById('mon-coach-toast-v2');
    if(tip){tip.remove();}
    tip=document.createElement('div');
    tip.id='mon-coach-toast-v2';tip.className='mon-coach-univers-toast';
    tip.role='status';tip.textContent='Mon Coach : créateur de programmes bientôt disponible !';
    document.body.appendChild(tip);
    window.setTimeout(()=>tip.remove(),2800);
  }
  function add(){
    const main=document.getElementById('main');
    if(!main||document.getElementById(CARD_ID))return;
    const universeNodes=labels.map(v=>labelNode(main,v)).filter(Boolean);
    // Prevent the coach tile from appearing in exercise details, recipe pages, etc.
    if(universeNodes.length<4)return;
    const settings=labelNode(main,'Paramètres');
    const history=labelNode(main,'Historique');
    const anchor=settings||history||universeNodes[0];
    let grid=gridFor(main,anchor);
    // Fallback: locate the common grid via any other universe title.
    if(!grid)for(const candidate of universeNodes){ grid=gridFor(main,candidate);if(grid)break; }
    if(!grid)return;
    const tile=document.createElement('button');
    tile.type='button';tile.id=CARD_ID;
    tile.className='mon-coach-univers-card';
    tile.setAttribute('aria-label','Mon Coach, créateur de programmes – à venir');
    tile.title='Mon Coach : à venir';
    const image=document.createElement('img');image.src=IMG;
    image.alt='';image.draggable=false;
    tile.appendChild(image);tile.addEventListener('click',toast);
    const settingsTile=settings?directChild(grid,settings):null;
    if(settingsTile) grid.insertBefore(tile,settingsTile);
    else grid.appendChild(tile);
  }
  function schedule(){
    if(queued)return;queued=true;
    Promise.resolve().then(()=>{queued=false;try{add();}catch(e){console.warn('Mon Coach card:',e);}});
  }
  function init(){
    schedule();
    const main=document.getElementById('main');
    if(main){
      const observer=new MutationObserver(schedule);
      observer.observe(main,{childList:true,subtree:true,characterData:false});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
