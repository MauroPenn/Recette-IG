/* Accueil général : carte « Mon Coach » (à venir), au même format que les autres univers. */
(() => {
  'use strict';
  const CARD_ID = 'mon-coach-univers-v4';
  const SOURCE = './accueil-mon-coach-carte-v4.webp?v=4';
  const CATEGORIES = [
    ['cuisine', 'nutrition'], ['musculation'], ['autre sport'],
    ['etirements'], ['pilates'], ['historique'], ['parametres']
  ];
  let scheduled = false;

  function norm(s){
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function matches(s, words){
    const v = norm(s);
    return words.every(w => v.includes(w));
  }
  function categoriesOf(node){
    const title = node?.textContent || '';
    return CATEGORIES.map((words, idx) => matches(title, words) ? idx : -1).filter(idx => idx >= 0);
  }
  function tileIs(el, index){
    const found = categoriesOf(el);
    return found.length === 1 && found[0] === index;
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
    const brand = norm(document.querySelector('#brandTitle')?.textContent);
    const headings = norm([...main.querySelectorAll('h1,h2,h3')].slice(0,12).map(x=>x.textContent).join(' '));
    return brand.includes('mes univers') || headings.includes('mes univers');
  }
  function locateGrid(main){
    let result = null, best = -1;
    const candidates = [main, ...main.querySelectorAll('*')];
    for (const p of candidates){
      if (p.children.length < 2 || p.children.length > 30) continue;
      const children = [...p.children];
      const seen = new Set();
      let qualifying = 0;
      for (const child of children){
        const found = categoriesOf(child);
        if (found.length === 1){ seen.add(found[0]); qualifying++; }
      }
      if (seen.size < 3 || qualifying < 3) continue;
      const display = getComputedStyle(p).display;
      const className = String(p.className || '');
      const bonus = (display.includes('grid') || display.includes('flex') || /grid|univers|cards|tiles|hub/i.test(className)) ? 20 : 0;
      let depth = 0; for (let q=p; q && q!==main; q=q.parentElement) depth++;
      const score = seen.size * 100 + bonus + depth;
      if (score > best){ best = score; result = p; }
    }
    return result;
  }
  function stripIds(root){
    if (!root) return;
    root.removeAttribute('id');
    root.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  }
  function neutralize(root){
    if (!root) return;
    stripIds(root);
    root.removeAttribute('href');
    root.removeAttribute('onclick');
    root.removeAttribute('data-view');
    root.setAttribute('aria-label', 'Mon Coach — Créateur de programmes (à venir)');
    root.setAttribute('title', 'Mon Coach — Créateur de programmes (à venir)');
    if (root.tagName === 'A') root.href = 'javascript:void(0)';
    if (root.tagName !== 'BUTTON') root.setAttribute('role', 'button');
    root.style.cursor = 'pointer';
    root.classList.add('mon-coach-univers-v4');
    root.querySelectorAll('a').forEach(a => { a.removeAttribute('href'); a.setAttribute('role','presentation'); });
    root.querySelectorAll('[onclick]').forEach(el => el.removeAttribute('onclick'));
    root.querySelectorAll('[data-view]').forEach(el => el.removeAttribute('data-view'));
    // If the template card contains one or more images, replace them all with the validated Mon Coach visual.
    const imgs = [...root.querySelectorAll('img')];
    if (imgs.length){
      imgs.forEach((img, idx) => {
        img.src = SOURCE;
        img.alt = 'Mon Coach, créateur de programmes : à venir';
        img.decoding = 'async';
        img.draggable = false;
        img.removeAttribute('srcset');
        if (idx > 0) img.remove();
      });
      root.querySelectorAll('source').forEach(source => {
        source.srcset = SOURCE;
        source.removeAttribute('media');
        source.removeAttribute('type');
      });
    } else {
      root.innerHTML = '';
      const img = document.createElement('img');
      img.src = SOURCE;
      img.alt = 'Mon Coach, créateur de programmes : à venir';
      img.decoding = 'async';
      img.draggable = false;
      root.appendChild(img);
    }
    // Replace any residual text so the generated visual is the only visible content.
    root.querySelectorAll(':scope > :not(img):not(picture)').forEach(el => {
      if (!el.querySelector('img, picture')) el.setAttribute('aria-hidden','true');
    });
    root.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); notify(); }, true);
  }
  function notify(){
    let alert = document.getElementById('mon-coach-note-v4');
    if (alert) alert.remove();
    alert = document.createElement('div');
    alert.id = 'mon-coach-note-v4';
    alert.role = 'status';
    alert.className = 'mon-coach-note-v4';
    alert.textContent = 'Mon Coach : créateur de programmes bientôt disponible !';
    document.body.appendChild(alert);
    window.setTimeout(() => alert.remove(), 2600);
  }
  function mount(){
    const main = document.getElementById('main');
    if (!hubScreen(main) || document.getElementById(CARD_ID)) return;
    const grid = locateGrid(main);
    if (!grid) return;
    const children = [...grid.children];
    const parametres = children.find(ch => tileIs(ch, 6));
    const historique = children.find(ch => tileIs(ch, 5));
    const template = parametres || historique || children.find(ch => categoriesOf(ch).length === 1) || children[0];
    if (!template) return;

    const coach = template.cloneNode(true);
    coach.id = CARD_ID;
    neutralize(coach);

    if (parametres) grid.insertBefore(coach, parametres);
    else if (historique && historique.nextSibling) grid.insertBefore(coach, historique.nextSibling);
    else grid.appendChild(coach);
  }
  function schedule(){
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      try { mount(); } catch (e) { console.warn('Mon Coach', e); }
    });
  }
  function init(){
    schedule();
    const target = document.getElementById('main') || document.body;
    new MutationObserver(schedule).observe(target, { childList:true, subtree:true, characterData:true });
    if (target !== document.body) new MutationObserver(schedule).observe(document.body, { childList:true, subtree:false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
