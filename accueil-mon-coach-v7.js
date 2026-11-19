/* Accueil général : carte « Mon Coach » (à venir). */
(() => {
  'use strict';
  const CARD_ID = 'mon-coach-univers-v7';
  const SOURCE = './accueil-mon-coach-carte-v7.webp?v=7';
  const CATEGORIES = [
    ['cuisine', 'nutrition'], ['musculation'], ['autre sport'],
    ['etirements'], ['pilates'], ['historique'], ['parametres']
  ];
  let scheduled = false;
  function norm(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function matches(s, words){
    const v = norm(s);
    return words.every(w => v.includes(w));
  }
  function categoriesOf(node){
    const title = node?.textContent || '';
    return CATEGORIES.map((words, idx) => matches(title, words) ? idx : -1)
      .filter(idx => idx >= 0);
  }
  function hubScreen(main){
    if (!main) return false;
    try {
      if (typeof state !== 'undefined' && state?.view) {
        const view = norm(state.view);
        if (/^(hub|univers|universes|mes-univers|accueil-global|accueil-univers)$/.test(view)) return true;
        if (/^(recipes|recipe|musculation|etirements|sport|settings|parametres)/.test(view)) return false;
      }
    } catch (_) {}
    // The home title may be in the app header, not inside #main.
    const brand = norm(document.querySelector('#brandTitle')?.textContent);
    const headings = norm([...main.querySelectorAll('h1,h2,h3')].slice(0,12).map(x=>x.textContent).join(' '));
    if (!(brand.includes('mes univers') || headings.includes('mes univers'))) return false;
    // Some existing home cards may use pictures with titles embedded into the image.
    return true;
  }
  function locateGrid(main){
    // Detect the actual shared parent by inspecting its DIRECT children.
    // This works even when headings have icons, subtitles or extra nodes.
    let result = null;
    let best = -1;
    const candidates = [main, ...main.querySelectorAll('*')];
    for (const p of candidates){
      if (p.children.length < 2 || p.children.length > 30) continue;
      const children = [...p.children];
      const seen = new Set();
      let qualifyingChildren = 0;
      for (const child of children){
        const found = categoriesOf(child);
        if (found.length === 1){
          seen.add(found[0]);
          qualifyingChildren++;
        }
      }
      if (seen.size < 3 || qualifyingChildren < 3) continue;
      const display = getComputedStyle(p).display;
      const className = String(p.className || '');
      const layoutBonus = (display.includes('grid') || display.includes('flex') || /grid|univers|cards|tiles|hub/i.test(className)) ? 20 : 0;
      const depth = (()=>{let d=0,q=p;while(q&&q!==main){d++;q=q.parentElement;}return d;})();
      const score = seen.size*100 + layoutBonus + depth;
      if (score > best){best=score;result=p;}
    }
    if (result) return result;
    // Fallback for home cards that are primarily images rather than HTML text.
    // Only used on the confirmed general-universes screen.
    let fallback = null, fallbackScore = -1;
    for (const p of candidates){
      if (p.children.length < 4 || p.children.length > 14) continue;
      const children=[...p.children];
      let cardCount=0;
      for(const child of children){
        const c=String(child.className || '');
        const interactive=child.matches('button,a,[role="button"]') || child.querySelector('button,a,[role="button"]');
        const hasVisual=child.querySelector('img, picture') || /card|tile|univers|hub/i.test(c) || /background/i.test(child.getAttribute('style') || '');
        if(interactive || hasVisual) cardCount++;
      }
      if(cardCount < 4 || cardCount < children.length * .65) continue;
      const cls=String(p.className || '');
      const display=getComputedStyle(p).display;
      let d=0;for(let q=p;q&&q!==main;q=q.parentElement)d++;
      const score=cardCount*100+(display==='grid'||/grid|hub|univers|tiles|cards/i.test(cls)?25:0)+d;
      if(score>fallbackScore){fallbackScore=score;fallback=p;}
    }
    return fallback;
  }
  function tileIs(el, index){ return el && categoriesOf(el).length === 1 && categoriesOf(el)[0] === index; }
  function notify(){
    let alert = document.getElementById('mon-coach-note-v7');
    if (alert) alert.remove();
    alert = document.createElement('div');
    alert.id = 'mon-coach-note-v7';
    alert.role = 'status';
    alert.className = 'mon-coach-note-v7';
    alert.textContent = 'Mon Coach : créateur de programmes bientôt disponible !';
    document.body.appendChild(alert);
    window.setTimeout(()=>alert.remove(),2600);
  }
  function settingsText(el){
    return norm((el?.textContent||'')+' '+(el?.getAttribute?.('aria-label')||'')+' '+(el?.getAttribute?.('title')||'')+' '+(el?.getAttribute?.('data-view')||'')+' '+(el?.className||''));
  }
  function isSettings(el){
    return !!el && (settingsText(el).includes('parametres') || settingsText(el).includes('settings'));
  }
  function settingsDirect(grid){
    const children=[...grid.children].filter(el=>el.id!==CARD_ID);
    let settings=children.find(el=>isSettings(el) && !el.classList.contains('mon-coach-univers-v7'));
    if(settings) return settings;
    // A settings tile that spans both columns is often visually centered.
    settings=children.find(el=>{
      const cs=getComputedStyle(el);
      return cs.gridColumnEnd==='span 2' || cs.gridColumn==='1 / -1' || cs.gridColumnEnd==='-1';
    });
    if(settings) return settings;
    // In the existing seven-tile layout the settings card is the last tile.
    return children.length===7?children[children.length-1]:null;
  }
  function findSettingsCard(main, grid){
    // Fallback when the settings tile sits in a separate centered wrapper.
    const nodes=[...main.querySelectorAll('button,a,[role="button"],[data-view],div,section')];
    const possibles=[];
    for(const el of nodes){
      if(grid.contains(el) || !isSettings(el)) continue;
      const r=el.getBoundingClientRect();
      if(r.width<160 || r.height<115 || r.height>750) continue;
      possibles.push({el,score:r.width*r.height});
    }
    possibles.sort((a,b)=>a.score-b.score);
    return possibles[0]?.el||null;
  }
  function setCell(el){
    el.classList.add('mon-coach-grid-cell-v7');
    for(const [prop,val] of Object.entries({
      'grid-column':'auto','grid-row':'auto','justify-self':'stretch','align-self':'stretch',
      'max-width':'none','width':'100%','margin':'0','box-sizing':'border-box'
    })) el.style.setProperty(prop,val,'important');
  }
  function matchTileSize(grid,coach,settings){
    // Choose the height shared by the regular 2-column universe cards, not a short auxiliary tile.
    const other=[...grid.children].filter(el=>el!==coach && el!==settings);
    const rects=other.map(el=>({el,r:el.getBoundingClientRect()}))
      .filter(x=>x.r.width>120 && x.r.height>130 && x.r.height<700);
    if(!rects.length)return;
    const hlist=rects.map(x=>x.r.height).sort((a,b)=>a-b);
    const h=Math.round(hlist[Math.floor(hlist.length/2)]);
    if(h<130||h>700)return;
    for(const el of [coach,settings]){
      el.style.setProperty('height',h+'px','important');
      el.style.setProperty('min-height',h+'px','important');
      el.style.setProperty('max-height',h+'px','important');
    }
  }
  function mount(){
    const main=document.getElementById('main');
    if(!hubScreen(main) || document.getElementById(CARD_ID)) return;
    const grid=locateGrid(main);
    if(!grid) return;
    let settings=settingsDirect(grid);
    let moved=false,oldParent=null;
    if(!settings){
      settings=findSettingsCard(main,grid);
      if(settings){oldParent=settings.parentElement;moved=true;}
    }
    if(!settings)return;
    const coach=document.createElement('button');
    coach.id=CARD_ID;coach.type='button';coach.className='mon-coach-univers-v7';
    coach.setAttribute('aria-label','Mon Coach — Créateur de programmes (à venir)');
    const pic=document.createElement('img');
    pic.src=SOURCE;pic.alt='Mon Coach, créateur de programmes : à venir';
    pic.decoding='async';pic.draggable=false;
    coach.appendChild(pic);
    coach.addEventListener('click',notify);
    // Always place Mon Coach BEFORE settings, so both share the final desktop row.
    if(moved){grid.appendChild(settings);if(oldParent && oldParent.childElementCount===0 && oldParent!==main && oldParent!==grid)oldParent.remove();}
    grid.insertBefore(coach,settings);
    setCell(settings);
    settings.classList.add('mon-coach-settings-v7');
    coach.classList.add('mon-coach-grid-cell-v7');
    matchTileSize(grid,coach,settings);
    // Reuse native responsive dimensions whenever screen/device orientation changes.
    const resize=()=>{if(coach.isConnected)matchTileSize(grid,coach,settings);};
    if(typeof ResizeObserver==='function'){
      const ro=new ResizeObserver(resize);
      ro.observe(grid);
      const sample=[...grid.children].find(el=>el!==coach && el!==settings);
      if(sample)ro.observe(sample);
      const mo=new MutationObserver(()=>{if(!coach.isConnected){ro.disconnect();mo.disconnect();}});
      mo.observe(main,{childList:true,subtree:true});
    }else window.addEventListener('resize',resize,{passive:true});
  }
  function schedule(){
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(()=>{scheduled=false;try{mount();}catch(e){console.warn('Mon Coach',e);}});
  }
  function init(){
    schedule();
    const target = document.getElementById('main') || document.body;
    new MutationObserver(schedule).observe(target,{childList:true,subtree:true,characterData:true});
    // The app replaces #main on some navigation flows: also watch page-level changes.
    if (target !== document.body) new MutationObserver(schedule).observe(document.body,{childList:true,subtree:false});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
