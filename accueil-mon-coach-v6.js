(() => {
  'use strict';
  const COACH_ID = 'mon-coach-clone-v6';
  const SETTINGS_ID = 'parametres-clone-v6';
  const COACH_SRC = './accueil-mon-coach-carte-v6.webp?v=6';
  const SETTINGS_SRC = './accueil-parametres-carte-v6.webp?v=6';
  let scheduled = false;

  function norm(s){
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  }
  function textOf(el){
    return norm((el?.textContent||'') + ' ' + (el?.getAttribute?.('aria-label')||'') + ' ' + (el?.getAttribute?.('title')||'') + ' ' + (el?.getAttribute?.('data-view')||'') + ' ' + (el?.className||''));
  }
  function matchesWords(s, words){ const v = norm(s); return words.every(w => v.includes(w)); }
  function categoriesOf(node){
    const title = node?.textContent || '';
    const defs = [
      ['cuisine','nutrition'], ['musculation'], ['autre sport'], ['etirements'],
      ['pilates'], ['historique'], ['parametres']
    ];
    return defs.map((w,i)=>matchesWords(title,w)?i:-1).filter(i=>i>=0);
  }
  function hubScreen(main){
    if(!main) return false;
    const brand = norm(document.querySelector('#brandTitle')?.textContent);
    const headings = norm([...main.querySelectorAll('h1,h2,h3')].slice(0,12).map(x=>x.textContent).join(' '));
    return brand.includes('mes univers') || headings.includes('mes univers');
  }
  function locateGrid(main){
    let result=null,best=-1;
    const candidates=[main,...main.querySelectorAll('*')];
    for(const p of candidates){
      if(p.children.length < 2 || p.children.length > 30) continue;
      const children=[...p.children];
      const seen = new Set();
      let qualifying=0;
      for(const child of children){
        const found=categoriesOf(child);
        if(found.length===1){seen.add(found[0]);qualifying++;}
      }
      if(seen.size < 3 || qualifying < 3) continue;
      const display=getComputedStyle(p).display;
      const cls=String(p.className || '');
      const bonus=(display.includes('grid') || display.includes('flex') || /grid|univers|cards|tiles|hub/i.test(cls)) ? 20 : 0;
      let depth=0,q=p; while(q && q!==main){depth++;q=q.parentElement;}
      const score=seen.size*100 + bonus + depth;
      if(score>best){best=score;result=p;}
    }
    return result;
  }
  function isSettings(el){
    const t=textOf(el);
    return t.includes('parametres') || t.includes('settings');
  }
  function settingsDirect(grid){
    const children=[...grid.children].filter(el => !el.classList?.contains('coach-grid-cell-v6'));
    let settings=children.find(el=>isSettings(el));
    if(settings) return settings;
    return children.length >= 1 ? children[children.length-1] : null;
  }
  function findSettingsCard(main, grid){
    const nodes=[...main.querySelectorAll('button,a,[role="button"],[data-view],div,section')];
    const possibles=[];
    for(const el of nodes){
      if(grid.contains(el) || !isSettings(el)) continue;
      const r=el.getBoundingClientRect();
      if(r.width<160 || r.height<115 || r.height>750) continue;
      possibles.push({el,score:r.width*r.height});
    }
    possibles.sort((a,b)=>a.score-b.score);
    return possibles[0]?.el || null;
  }
  function makeCard(id, src, label, onClick){
    const btn=document.createElement('button');
    btn.type='button'; btn.id=id;
    btn.className='coach-clone-card-v6 coach-grid-cell-v6';
    btn.setAttribute('aria-label', label);
    const img=document.createElement('img');
    img.src=src; img.alt=label; img.decoding='async'; img.draggable=false;
    btn.appendChild(img);
    btn.addEventListener('click', onClick);
    return btn;
  }
  function notify(){
    const old=document.getElementById('coach-note-v6'); if(old) old.remove();
    const alert=document.createElement('div');
    alert.id='coach-note-v6'; alert.className='coach-note-v6'; alert.role='status';
    alert.textContent='Mon Coach : créateur de programmes bientôt disponible !';
    document.body.appendChild(alert);
    setTimeout(()=>alert.remove(),2600);
  }
  function openOriginalSettings(src){
    if(!src) return;
    try { src.click(); return; } catch(_) {}
    try { src.dispatchEvent(new MouseEvent('click', {bubbles:true,cancelable:true,view:window})); } catch(_) {}
  }
  function sampleTile(grid, exclude=[]){
    const others=[...grid.children].filter(el => !exclude.includes(el) && !el.classList.contains('coach-hidden-source-v6'));
    let sample=others.find(el=>categoriesOf(el).length===1 && categoriesOf(el)[0] !== 6 && el.getBoundingClientRect().width>120 && el.getBoundingClientRect().height>130);
    if(!sample) sample=others.find(el=>el.getBoundingClientRect().width>120 && el.getBoundingClientRect().height>130);
    return sample || null;
  }
  function syncHeights(grid, coach, settingsClone){
    const sample=sampleTile(grid,[coach,settingsClone]);
    if(!sample) return;
    const r=sample.getBoundingClientRect();
    if(r.width<120 || r.height<130) return;
    const h=Math.round(r.height);
    [coach,settingsClone].forEach(el=>{
      el.style.setProperty('height',h+'px','important');
      el.style.setProperty('min-height',h+'px','important');
      el.style.setProperty('max-height',h+'px','important');
    });
  }

  function mount(){
    const main=document.getElementById('main');
    if(!hubScreen(main)) return;
    const grid=locateGrid(main);
    if(!grid) return;

    let coach=document.getElementById(COACH_ID);
    let settingsClone=document.getElementById(SETTINGS_ID);
    let settingsOriginal=settingsDirect(grid);
    let moved=false, oldParent=null;
    if(!settingsOriginal){
      settingsOriginal=findSettingsCard(main, grid);
      if(settingsOriginal){oldParent=settingsOriginal.parentElement; moved=true;}
    }
    if(!settingsOriginal) return;

    if(!coach){
      coach=makeCard(COACH_ID, COACH_SRC, 'Mon Coach — Créateur de programmes (à venir)', notify);
    }
    if(!settingsClone){
      settingsClone=makeCard(SETTINGS_ID, SETTINGS_SRC, 'Paramètres', () => openOriginalSettings(settingsOriginal));
    }

    // Hide the original settings card but keep its event handlers alive.
    settingsOriginal.classList.add('coach-hidden-source-v6');
    settingsOriginal.setAttribute('aria-hidden','true');

    if(moved){
      if(oldParent && oldParent !== grid && oldParent.childElementCount === 0) oldParent.remove();
    }

    if(!coach.isConnected) grid.appendChild(coach);
    if(!settingsClone.isConnected) grid.appendChild(settingsClone);

    // Always keep the final row as Mon Coach + Paramètres.
    grid.appendChild(coach);
    grid.appendChild(settingsClone);

    syncHeights(grid, coach, settingsClone);

    const resize=()=>syncHeights(grid, coach, settingsClone);
    if(!grid.__coachResizeBound){
      grid.__coachResizeBound = true;
      if(typeof ResizeObserver==='function'){
        const ro=new ResizeObserver(resize);
        ro.observe(grid);
        const sample=sampleTile(grid,[coach,settingsClone]);
        if(sample) ro.observe(sample);
      }else{
        window.addEventListener('resize', resize, {passive:true});
      }
    }
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false; try{mount();}catch(e){console.warn('Mon Coach V6', e);}});
  }
  function init(){
    schedule();
    const target=document.getElementById('main') || document.body;
    new MutationObserver(schedule).observe(target,{childList:true,subtree:true,characterData:true});
    if(target !== document.body) new MutationObserver(schedule).observe(document.body,{childList:true,subtree:false});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
