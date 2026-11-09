/* MUSCULATION — HISTORIQUE V1 (09/11/2026)
   Vue historique unique : menu Musculation + retour après sauvegarde d'une séance.
   Les données existantes, les sons, les lecteurs et leurs chronomètres sont intacts.
   Historique stocké par seances-lecteur-v4.js dans mb_muscu_historique_v1.
*/
(function(){
  'use strict';
  const HISTORY_KEY = 'mb_muscu_historique_v1';
  const MODES = {circuit:'Circuit Training',classic:'Musculation classique'};
  const PERIODS = {week:'Semaine',month:'Mois',year:'Année',all:'Tout'};
  let selectedPeriod='week';
  let returnTo='muscu-menu';
  let justSaved=false;

  const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=(x,defaultValue=0)=>{const n=Number(x);return Number.isFinite(n)?Math.max(0,n):defaultValue;};
  const parseDate=value=>{const x=new Date(value);return Number.isNaN(x.getTime())?null:x;};
  const dateOf=x=>parseDate(x.startedAt)||parseDate(x.endedAt);
  const formatDate=x=>x.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  const minutes=x=>{
    const secs=Math.round(num(x));
    if(secs<60)return `${secs} s`;
    const mins=Math.floor(secs/60);
    if(mins<60)return `${mins} min${secs%60?` ${secs%60} s`:''}`;
    return `${Math.floor(mins/60)} h ${String(mins%60).padStart(2,'0')} min`;
  };
  function getAll(){
    let value;
    try{value=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');}catch(_){return [];}
    return (Array.isArray(value)?value:[])
      .filter(x=>x&&typeof x==='object'&&x.type==='musculation'&&dateOf(x))
      .sort((a,b)=>dateOf(b).getTime()-dateOf(a).getTime());
  }
  function periodBounds(period,now){
    const y=now.getFullYear(),m=now.getMonth(),d=now.getDate();
    if(period==='week'){
      const mon=d-((now.getDay()+6)%7);
      const start=new Date(y,m,mon);
      return {start,end:new Date(start.getFullYear(),start.getMonth(),start.getDate()+7)};
    }
    if(period==='month')return {start:new Date(y,m,1),end:new Date(y,m+1,1)};
    if(period==='year')return {start:new Date(y,0,1),end:new Date(y+1,0,1)};
    return {start:null,end:null};
  }
  function withinPeriod(x,bounds){
    if(!bounds.start)return true;
    const t=dateOf(x)?.getTime();return t>=bounds.start.getTime()&&t<bounds.end.getTime();
  }
  function chartBins(period,now,selected){
    const y=now.getFullYear(),m=now.getMonth(),d=now.getDate();
    const bins=[];
    const add=(label,from,to)=>bins.push({label,start:from.getTime(),end:to.getTime(),seconds:0,sessions:0});
    if(period==='week'){
      const monday=new Date(y,m,d-((now.getDay()+6)%7));
      for(let i=0;i<7;i++){
        const a=new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i);
        const b=new Date(a.getFullYear(),a.getMonth(),a.getDate()+1);
        add(['L','M','M','J','V','S','D'][i],a,b);
      }
    }else if(period==='month'){
      const last=new Date(y,m+1,0).getDate();
      for(let first=1;first<=last;first+=7){const end=Math.min(last,first+6);add(`${first}–${end}`,new Date(y,m,first),new Date(y,m,end+1));}
    }else if(period==='year'){
      for(let month=0;month<12;month++){const a=new Date(y,month,1);add(a.toLocaleDateString('fr-FR',{month:'short'}),a,new Date(y,month+1,1));}
    }else{
      for(let i=11;i>=0;i--){const a=new Date(y,m-i,1);add(a.toLocaleDateString('fr-FR',{month:'short'}),a,new Date(a.getFullYear(),a.getMonth()+1,1));}
    }
    for(const item of selected){
      const t=dateOf(item).getTime();const bin=bins.find(b=>t>=b.start&&t<b.end);
      if(bin){bin.sessions++;bin.seconds+=num(item.durationSeconds);}
    }
    return bins;
  }
  function renderChart(bins,period){
    const max=Math.max(1,...bins.map(x=>x.seconds));
    const bars=bins.map(b=>{
      const h=b.seconds?Math.max(7,Math.round(b.seconds/max*100)):0;
      const label=`${b.label} : ${b.sessions} séance${b.sessions>1?'s':''}, ${minutes(b.seconds)}`;
      return `<div class="mhl-bar-item" title="${esc(label)}"><span class="mhl-bar-value">${b.seconds?Math.round(b.seconds/60)+'m':''}</span><div class="mhl-bar-track"><div class="mhl-bar-fill" style="height:${h}%"></div></div><span class="mhl-bar-label">${esc(b.label)}</span></div>`;
    }).join('');
    const periodText=period==='all'?'12 derniers mois':period==='week'?'Cette semaine':period==='month'?'Ce mois-ci':'Cette année';
    return `<section class="mhl-panel mhl-chart-panel" aria-labelledby="mhlChartTitle">
        <div class="mhl-section-heading"><h3 id="mhlChartTitle">Temps d’entraînement</h3><span>${periodText}</span></div>
        <div class="mhl-chart" role="img" aria-label="Durée d'entraînement par période">${bars}</div>
        <p class="mhl-chart-note">Durée des séances enregistrées, sans estimation de calories.</p>
      </section>`;
  }
  function sessionCard(item,index){
    const when=dateOf(item);
    const complete=item.completedFully===true;
    const mode=MODES[item.mode]||'Musculation';
    const exercises=Array.isArray(item.exercises)?item.exercises:[];
    const planned=Math.round(num(item.planned));const done=Math.round(num(item.completed));
    const units=item.mode==='circuit'?'efforts':'séries';
    const exerciseHtml=exercises.length?`<ul class="mhl-exercises">${exercises.map(e=>`<li><strong>${esc(e?.title||'Exercice')}</strong><small>${esc(e?.groupLabel||'')}</small></li>`).join('')}</ul>`:'<p>Exercices non détaillés dans cet enregistrement.</p>';
    return `<article class="mhl-activity" data-mhl-entry="${index}">
        <div class="mhl-activity-head">
          <span class="mhl-mode-icon" aria-hidden="true">${item.mode==='circuit'?'↻':'▣'}</span>
          <div class="mhl-activity-main"><h4>${esc(item.sessionName||'Séance de musculation')}</h4>
            <p>${esc(formatDate(when))} · ${esc(mode)}</p></div>
          <span class="mhl-status ${complete?'done':'partial'}">${complete?'Terminée':'Partielle'}</span>
        </div>
        <div class="mhl-activity-metrics"><span>◷ ${esc(minutes(item.durationSeconds))}</span><span>${done} / ${planned} ${units}</span><span>${exercises.length} exercice${exercises.length>1?'s':''}</span></div>
        <details class="mhl-details"><summary>Voir le détail <span aria-hidden="true">⌄</span></summary>
          <div class="mhl-detail-inside"><div class="mhl-detail-summary"><span>Réalisation</span><strong>${done} / ${planned} ${units}</strong></div>
          <div class="mhl-detail-summary"><span>Début</span><strong>${esc(when.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))}</strong></div>
          <h5>Exercices prévus dans la séance</h5>${exerciseHtml}
          <p class="mhl-detail-note">Le bilan conserve le nombre total d’efforts ou de séries validés ; il ne mesure pas automatiquement les répétitions une par une.</p>
          <button type="button" class="mhl-delete" data-mhl-delete="${esc(item.id||'')}">Supprimer cet enregistrement</button>
          </div>
        </details>
      </article>`;
  }
  function showHistory(){
    const now=new Date();const all=getAll();const bounds=periodBounds(selectedPeriod,now);
    const filtered=all.filter(x=>withinPeriod(x,bounds));
    const totalSeconds=filtered.reduce((s,x)=>s+num(x.durationSeconds),0);
    const completed=filtered.filter(x=>x.completedFully===true).length;
    const mean=filtered.length?Math.round(totalSeconds/filtered.length):0;
    const totalStored=all.length;
    const bins=chartBins(selectedPeriod,now,selectedPeriod==='all'?all:filtered);
    document.body.classList.remove('mp1-active','mcs1-active');
    main.innerHTML=`<section class="mhl-screen" aria-label="Historique de musculation">
      <header class="mhl-header"><button type="button" class="mhl-back" id="mhlBack" aria-label="Retour aux ${returnTo==='muscu-menu'?'rubriques Musculation':'séances'}">← Retour</button>
        <span class="mhl-kicker">MUSCULATION</span>
        <h2>Historique des séances</h2>
        <p>Retrouve tes entraînements, tes progrès et ton temps d’activité.</p></header>
      ${justSaved?'<div class="mhl-success" role="status">✓ Séance enregistrée dans ton historique.</div>':''}
      <nav class="mhl-periods" aria-label="Période d’analyse">${Object.entries(PERIODS).map(([id,title])=>`<button type="button" data-mhl-period="${id}" class="${id===selectedPeriod?'selected':''}" aria-pressed="${String(id===selectedPeriod)}">${title}</button>`).join('')}</nav>
      <div class="mhl-stats">
        <div><span>Séances</span><strong>${filtered.length}</strong></div>
        <div><span>Temps total</span><strong>${esc(minutes(totalSeconds))}</strong></div>
        <div><span>Terminées</span><strong>${completed}</strong></div>
        <div><span>Durée moyenne</span><strong>${esc(minutes(mean))}</strong></div>
      </div>
      ${renderChart(bins,selectedPeriod)}
      <section class="mhl-history-section" aria-labelledby="mhlListTitle">
        <div class="mhl-section-heading"><h3 id="mhlListTitle">Mes entraînements</h3><span>${filtered.length} séance${filtered.length>1?'s':''}</span></div>
        ${filtered.length?filtered.map(sessionCard).join(''):
          `<div class="mhl-empty"><span class="mhl-empty-icon" aria-hidden="true">▤</span><h4>Aucune séance sur cette période</h4><p>${totalStored?'Choisis une autre période pour retrouver tes enregistrements.':'Termine une séance, puis appuie sur « Enregistrer la séance » pour la retrouver ici.'}</p></div>`}
      </section>
      <p class="mhl-local-note">🔒 Cet historique est conservé localement sur cet appareil. Il n’est pas synchronisé entre tes téléphones ou ordinateurs. Évite de supprimer les données du site si tu souhaites le conserver.</p>
      <button type="button" id="mhlReturnSessions" class="mhl-open-sessions">+ Voir mes séances</button>
    </section>`;
    main.querySelector('#mhlBack')?.addEventListener('click',()=>navigate(returnTo));
    main.querySelector('#mhlReturnSessions')?.addEventListener('click',()=>navigate('muscu-sessions'));
    main.querySelectorAll('[data-mhl-period]').forEach(b=>b.addEventListener('click',()=>{
      selectedPeriod=b.dataset.mhlPeriod;justSaved=false;showHistory();
    }));
    main.querySelectorAll('[data-mhl-delete]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.mhlDelete;
      if(!id||!confirm('Supprimer définitivement cette séance de l’historique ?'))return;
      let allRecords;try{allRecords=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');}catch(_){allRecords=[];}
      if(!Array.isArray(allRecords))allRecords=[];
      const next=allRecords.filter(x=>x?.id!==id);
      if(next.length===allRecords.length)return;
      try{localStorage.setItem(HISTORY_KEY,JSON.stringify(next));}catch(_){alert('Suppression impossible sur cet appareil.');return;}
      justSaved=false;showHistory();
    }));
  }
  function navigate(view){justSaved=false;state.view=view;state.selected=null;render();window.scrollTo?.({top:0,behavior:'instant'});}

  // Module chargé après le lecteur v4, pour relier ses enregistrements aux rubriques Musculation.
  const previousRender=render;
  render=function(){
    const view=state.view;
    if(view==='muscu-session-history'){
      // Le lecteur redirige ici immédiatement après l'enregistrement.
      returnTo='muscu-sessions';selectedPeriod='week';justSaved=true;
      state.view='muscu-history';
      previousRender.apply(this,arguments);
      return showHistory();
    }
    if(view==='muscu-history'){
      if(!justSaved)returnTo='muscu-menu';
      previousRender.apply(this,arguments);
      return showHistory();
    }
    return previousRender.apply(this,arguments);
  };
})();
