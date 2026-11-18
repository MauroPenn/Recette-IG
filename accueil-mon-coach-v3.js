/* Accueil général : carte « Mon Coach » (à venir). */
(() => {
  'use strict';
  const CARD_ID = 'mon-coach-univers-v3';
  const SOURCE = './accueil-mon-coach-carte-v3.webp?v=3';
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
    let alert = document.getElementById('mon-coach-note-v3');
    if (alert) alert.remove();
    alert = document.createElement('div');
    alert.id = 'mon-coach-note-v3';
    alert.role = 'status';
    alert.className = 'mon-coach-note-v3';
    alert.textContent = 'Mon Coach : créateur de programmes bientôt disponible !';
    document.body.appendChild(alert);
    window.setTimeout(()=>alert.remove(),2600);
  }
  function mount(){
    const main = document.getElementById('main');
    if (!hubScreen(main) || document.getElementById(CARD_ID)) return;
    const grid = locateGrid(main);
    if (!grid) return;
    const children = [...grid.children];
    const parametres = children.find(ch => tileIs(ch,6));
    const history = children.find(ch => tileIs(ch,5));
    const coach = document.createElement('button');
    coach.id = CARD_ID; coach.type = 'button';
    coach.className = 'mon-coach-univers-v3';
    coach.setAttribute('aria-label', 'Mon Coach — Créateur de programmes (à venir)');
    const pic = document.createElement('img');
    pic.src = SOURCE; pic.alt = 'Mon Coach, créateur de programmes : à venir';
    pic.decoding = 'async'; pic.draggable = false;
    coach.appendChild(pic);
    coach.addEventListener('click',notify);
    if (parametres) grid.insertBefore(coach,parametres);
    else if (history) grid.insertBefore(coach,history.nextSibling);
    else grid.appendChild(coach);
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
