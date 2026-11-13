/* SPORT & NUTRITION — Synchronisation automatique prudente V1 — 12/11/2026
 * Complement isole, n'ecrase aucun module sportif existant.
 * Ce module ne synchronise que si l'application est ouverte, visible, en ligne,
 * le compte connecte et aucune seance/brouillon actif.
 * Nouveaux enregistrements : ajout sans ecrasement distant (ignore-duplicates).
 * Modifications a conflits / suppressions : aucune action automatique.
 * Modification distante : reception seulement si l'etat local est reste inchange.
 * Bouton manuel V1 et sauvegardes JSON conserves.
 */
(function(){
  'use strict';
  const FLAG='mb_sync_auto_enabled_v1';
  const STATE_KEY='mb_sync_auto_status_v1';
  const CFG='mb_sync_config_v1';
  const SESSION='mb_sync_session_v1';
  const META='mb_sync_meta_v1';
  const VIEW='synchronisation-v1';
  const POLL_MS=45000, MIN_GAP_MS=30000;
  const SPECS=[
    {category:'profil',key:'mb_profil_sportif_v1',kind:'single'},
    {category:'activites_sportives',key:'mb_activites_sportives_v1',kind:'array'},
    {category:'seances_musculation',key:'mb_muscu_seances_v1',kind:'array'},
    {category:'historique_musculation',key:'mb_muscu_historique_v1',kind:'array'},
    {category:'activites_personnalisees',key:'mb_activites_personnalisees_v1',kind:'array'},
    {category:'favoris_recettes',key:'recipeFavorites',kind:'favorites'}
  ];
  const DRAFTS=[
    'mb_marche_brouillon_v1', 'mb_velo_brouillon_v1',
    'mb_course_brouillon_v1', 'mb_vtt_brouillon_v1',
    'mb_paddle_brouillon_v1', 'mb_velo_appartement_brouillon_v1',
    'mb_custom_brouillon_v1', 'mb_muscu_lecture_brouillon_v1'
  ];
  const WATCHED=new Set(SPECS.map(x=>x.key));
  const storageRead=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v);}catch(_){return fallback;}};
  const storageWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}};
  const validConfig=o=>Boolean(o&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(o.url||'')&&/^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(o.key||''));
  const cfg=()=>storageRead(CFG,null);
  const authenticated=()=>Boolean(storageRead(SESSION,null)?.refresh_token);
  // Une activation est liee au compte ET au projet. Un autre utilisateur
  // du meme appareil ne doit jamais synchroniser les donnees du precedent.
  function enabled(){
    const flag=storageRead(FLAG,null),s=storageRead(SESSION,null),project=cfg()?.url;
    if(!flag||flag.enabled!==true||!s?.refresh_token||!project)return false;
    if(flag.project!==project||flag.email!==String(s.email||'').trim().toLowerCase())return false;
    if(flag.user_id&&s.user_id&&flag.user_id!==s.user_id)return false;
    return true;
  }
  const fmtTime=time=>{try{return new Date(time).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(_){return ''}};
  const pauseViews=/^(?:muscu-session-player|muscu-session-result|muscu-session-detail|autre-sport-walk|autre-sport-velo|autre-sport-course|autre-sport-vtt|autre-sport-paddle|velo-appartement-v1|custom-studio-v1|custom-summary-v1|marche-v1-summary|velo-v1-summary|course-v1-summary|vtt-v1-summary|paddle-v1-summary)$/;
  let busy=false,lastAttempt=0,failures=0,scheduled=null,requestSerial=0;
  function status(text,level='info',counts=null){
    const previous=storageRead(STATE_KEY,{});
    const data={text,level,counts,at:Date.now(),successAt:level==='success'?Date.now():previous?.successAt||null};
    storageWrite(STATE_KEY,data);updatePanel();
  }
  function inProgress(){
    try{
      if(typeof state!=='undefined'&&pauseViews.test(String(state.view||'')))return true;
      for(const key of DRAFTS){
        const draft=storageRead(key,null);
        if(draft&&typeof draft==='object'&&!Array.isArray(draft)){
          if(['running','paused'].includes(draft.status))return true;
          // Le lecteur musculation conserve une phase + session, et non un champ status.
          if(key==='mb_muscu_lecture_brouillon_v1' && draft.phase && draft.session)return true;
        }
      }
    }catch(_){return true;}
    return false;
  }
  function canRun(){
    if(!enabled()||!validConfig(cfg())||!authenticated())return false;
    if(document.visibilityState==='hidden'||navigator.onLine===false)return false;
    if(typeof state!=='undefined'&&state.view===VIEW)return false; // Ne pas concurrencer le bouton manuel
    if(inProgress())return false;
    return true;
  }
  function stable(value){
    if(Array.isArray(value))return value.map(stable);
    if(value&&typeof value==='object'){
      const out={};for(const key of Object.keys(value).sort())out[key]=stable(value[key]);return out;
    }
    return value;
  }
  // Identique a la signature du moteur manuel V1 pour partager ses baselines.
  function signature(payload){
    const str=JSON.stringify(stable(payload));let a=2166136261,b=5381;
    for(let i=0;i<str.length;i++){a=Math.imul(a^str.charCodeAt(i),16777619);b=Math.imul(b,33)^str.charCodeAt(i);}
    return str.length+':'+(a>>>0).toString(16)+':'+(b>>>0).toString(16);
  }
  function localRecords(){
    const all=new Map();
    for(const spec of SPECS){
      const value=storageRead(spec.key,null);
      if(spec.kind==='single'){
        if(value&&typeof value==='object'&&!Array.isArray(value))all.set(spec.category+'|profil',{category:spec.category,item_id:'profil',payload:value});
      }else if(Array.isArray(value)){
        for(const item of value){
          const id=spec.kind==='favorites'?String(item):String(item?.id??'');
          if(!id||id==='null'||id==='undefined')continue;
          all.set(spec.category+'|'+id,{category:spec.category,item_id:id,payload:spec.kind==='favorites'?{favorite:true}:item});
        }
      }
    }
    return all;
  }
  async function api(url,method='GET',data,token,extra={}){
    const config=cfg();if(!validConfig(config))throw new Error('Configuration Supabase indisponible.');
    const result=await fetch(config.url+url,{method,mode:'cors',cache:'no-store',
      headers:{apikey:config.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},
      ...(data===undefined?{}:{body:JSON.stringify(data)})});
    const raw=await result.text();let body=null;
    try{body=raw?JSON.parse(raw):null;}catch(_){}
    if(!result.ok)throw new Error(String(body?.error_description||body?.msg||body?.message||body?.error||('HTTP '+result.status)).slice(0,130));
    return body;
  }
  async function validToken(){
    const s=storageRead(SESSION,null);if(!s?.refresh_token)throw new Error('Connecte-toi à ton compte.');
    if(s.access_token && Date.now()<Number(s.expires_at||0)-90000)return s;
    const refreshed=await api('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:s.refresh_token});
    if(!refreshed?.access_token||!refreshed?.refresh_token)throw new Error('Session expirée : reconnecte-toi.');
    const latest=storageRead(SESSION,null);
    // Une deconnexion ou un changement de compte est prioritaire sur le refresh.
    if(!latest?.refresh_token||latest.email!==s.email)return null;
    const next={access_token:refreshed.access_token,refresh_token:refreshed.refresh_token,
      email:refreshed.user?.email||s.email,user_id:refreshed.user?.id||s.user_id||null,
      expires_at:Date.now()+Number(refreshed.expires_in||3600)*1000};
    if(!storageWrite(SESSION,next))throw new Error('Impossible de mémoriser la session.');
    return next;
  }
  async function remoteRecords(token){
    const items=[];
    for(let offset=0;offset<20000;offset+=500){
      const page=await api('/rest/v1/mb_sync_records?select=category,item_id,payload&order=category.asc,item_id.asc&limit=500&offset='+offset,'GET',undefined,token);
      if(!Array.isArray(page))throw new Error('Réponse cloud invalide.');
      items.push(...page);if(page.length<500)break;
    }
    if(items.length>=20000)throw new Error('Plus de 20 000 lignes : contrôle manuel requis.');
    const map=new Map(),allow=new Set(SPECS.map(s=>s.category));
    for(const item of items)if(allow.has(item.category)&&typeof item.item_id==='string'&&item.payload!=null)
      map.set(item.category+'|'+item.item_id,item);
    return map;
  }
  function applyInbound(incoming,baseline){
    const original=new Map(),applied=[],conflicts=[];
    for(const spec of SPECS){
      const rows=incoming.filter(r=>r.category===spec.category);
      if(!rows.length)continue;
      const value=storageRead(spec.key,null);
      let next;
      if(spec.kind==='single'){
        const current=value&&typeof value==='object'&&!Array.isArray(value)?value:null;
        const row=rows[0],key=spec.category+'|profil';
        const known=baseline[key];
        if(current && (!known||signature(current)!==known)){conflicts.push(key);continue;}
        next=row.payload;
        applied.push(row);
      }else if(spec.kind==='favorites'){
        const favorites=new Set(Array.isArray(value)?value:[]);
        for(const row of rows){if(!favorites.has(row.item_id)){favorites.add(row.item_id);applied.push(row);}}
        next=[...favorites];
      }else{
        const list=Array.isArray(value)?value:[];
        const map=new Map(list.map(x=>[String(x?.id??''),x]));
        for(const row of rows){
          const key=spec.category+'|'+row.item_id,existing=map.get(row.item_id);
          if(existing&&(!baseline[key]||signature(existing)!==baseline[key])){conflicts.push(key);continue;}
          map.set(row.item_id,row.payload);applied.push(row);
        }
        next=[...map.values()];
      }
      if(!applied.some(r=>r.category===spec.category))continue;
      original.set(spec.key,localStorage.getItem(spec.key));
      if(!storageWrite(spec.key,next)){
        for(const [key,old] of [...original.entries()].reverse()){
          try{if(old===null)localStorage.removeItem(key);else localStorage.setItem(key,old);}catch(_){}
        }
        throw new Error('Espace de stockage insuffisant : import local annulé.');
      }
    }
    return {applied,conflicts};
  }
  async function addNewOnly(items,token,userId){
    for(let i=0;i<items.length;i+=20){
      const batch=items.slice(i,i+20).map(row=>({user_id:userId,category:row.category,item_id:row.item_id,payload:row.payload}));
      await api('/rest/v1/mb_sync_records?on_conflict=user_id,category,item_id','POST',batch,token,
        {'Prefer':'resolution=ignore-duplicates,return=minimal'});
    }
  }
  async function run(reason){
    if(busy||!canRun())return;
    if(Date.now()-lastAttempt<MIN_GAP_MS)return;
    busy=true;lastAttempt=Date.now();const serial=++requestSerial;
    try{
      const s=await validToken();if(!s||!canRun())return;
      const user=await api('/auth/v1/user','GET',undefined,s.access_token);
      if(!user?.id||storageRead(SESSION,null)?.email!==s.email)throw new Error('Session utilisateur à vérifier.');
      const startCfg=cfg()?.url;
      const local=localRecords(),cloud=await remoteRecords(s.access_token);
      const memory=storageRead(META,{});
      const baseline=(memory?.user_id===user.id&&memory?.project===startCfg)?(memory.signatures||{}):{};
      const incoming=[],outgoing=[],aligned={},conflicts=[],missing=[];
      for(const key of new Set([...local.keys(),...cloud.keys()])){
        const l=local.get(key),r=cloud.get(key),prev=baseline[key];
        const sl=l?signature(l.payload):null,sr=r?signature(r.payload):null;
        if(l&&r){
          if(sl===sr){aligned[key]=sl;continue;}
          if(prev===sl&&prev!==sr){incoming.push(r);continue;}
          conflicts.push(key);continue; // Modifications locales jamais ecrasees automatiquement
        }
        if(l&&!r){if(prev){missing.push(key);}else outgoing.push(l);continue;}
        if(!l&&r){if(prev){missing.push(key);}else incoming.push(r);}
      }
      // Ne jamais synchroniser si une seance demarre entre temps.
      if(!canRun()||!enabled()||cfg()?.url!==startCfg||storageRead(SESSION,null)?.email!==s.email)return;
      // Revalider les empreintes pour ne pas ecraser une modification locale recente.
      const nowLocal=localRecords();
      const safeIncoming=incoming.filter(r=>{
        const key=r.category+'|'+r.item_id,old=local.get(key),now=nowLocal.get(key);
        return (!old&&!now)||(old&&now&&signature(old.payload)===signature(now.payload));
      });
      const safeOutgoing=outgoing.filter(row=>{
        const now=nowLocal.get(row.category+'|'+row.item_id);
        return now&&signature(now.payload)===signature(row.payload);
      });
      if(safeOutgoing.length)await addNewOnly(safeOutgoing,s.access_token,user.id);
      if(!canRun())return;
      const {applied,conflicts:receiveConflicts}=applyInbound(safeIncoming,baseline);
      // Verification apres insertion : les doublons concurrents ne doivent pas
      // etre consideres comme synchro si le serveur possede une autre version.
      const verified=await remoteRecords(s.access_token);
      const current=localRecords();let sent=0,received=0;
      for(const row of safeOutgoing){const key=row.category+'|'+row.item_id;
        if(verified.has(key)&&current.has(key)&&signature(verified.get(key).payload)===signature(current.get(key).payload)){
          aligned[key]=signature(row.payload);sent++;
        }else conflicts.push(key);
      }
      for(const row of applied){const key=row.category+'|'+row.item_id;
        if(verified.has(key)&&current.has(key)&&signature(verified.get(key).payload)===signature(current.get(key).payload)){
          aligned[key]=signature(row.payload);received++;
        }
      }
      for(const key of Object.keys(aligned)){
        if(!current.has(key)||!verified.has(key)||signature(current.get(key).payload)!==signature(verified.get(key).payload))delete aligned[key];
      }
      const recent=storageRead(META,{});
      const previous=(recent?.user_id===user.id&&recent?.project===startCfg)?(recent.signatures||{}):{};
      if(!storageWrite(META,{user_id:user.id,project:startCfg,
        signatures:{...previous,...aligned},updated_at:new Date().toISOString()})){
        throw new Error('État local de synchronisation non enregistré.');
      }
      const count=new Set([...conflicts,...receiveConflicts]).size;
      const summary=count
        ?`${sent} envoyée(s), ${received} reçue(s). ${count} conflit(s) à vérifier avec Synchroniser maintenant.`
        :`${sent} envoyée(s), ${received} reçue(s). Tout est à jour.`;
      failures=0;
      status(summary,count||missing.length?'warning':'success',
        {sent,received,conflicts:count,missing:missing.length,reason,serial});
      // Ne pas forcer un rechargement de l'ecran pendant une action utilisateur.
      // Les donnees recues deviennent visibles lors de la prochaine navigation.
    }catch(e){
      failures=Math.min(failures+1,5);
      lastAttempt=Date.now()+Math.min(900000,45000*(2**(failures-1)))-MIN_GAP_MS;
      status('Synchronisation en attente : '+String(e.message||e).slice(0,110),'warning');
    }finally{busy=false;}
  }
  function schedule(delay=900){
    if(scheduled)clearTimeout(scheduled);
    scheduled=setTimeout(()=>{scheduled=null;run('reprise');},delay);
  }
  function updatePanel(){
    const panel=document.getElementById('sa1Panel');if(!panel)return;
    const toggle=panel.querySelector('#sa1Enabled');if(toggle)toggle.checked=enabled();
    const out=panel.querySelector('#sa1Message');
    if(out){const s=storageRead(STATE_KEY,null);
      let text=!enabled()?'Désactivée sur cet appareil. Active le bouton pour commencer.':
        !authenticated()?'Connecte-toi d’abord à ton compte personnel.':
        !validConfig(cfg())?'Configuration Supabase en attente.':
        inProgress()?'Séance en cours ou en pause : synchronisation reportée.':
        'Activée. Échanges automatiques lorsque l’application est ouverte et connectée.';
      if(enabled()&&s?.text)text+='\n'+s.text+(s.successAt?' Dernière réussite : '+fmtTime(s.successAt)+'.':'');
      out.textContent=text;
    }
  }
  function addCss(){
    if(document.getElementById('sa1Css'))return;
    const sheet=document.createElement('style');sheet.id='sa1Css';
    sheet.textContent=String.raw`
      .sa1-panel{border:1.5px solid #3dd8b4;background:linear-gradient(140deg,#075b57,#064448);border-radius:19px;padding:18px 16px;color:#fff;display:grid;gap:12px}
      .sa1-panel h2{font-size:1.24rem;margin:0;color:#fff}
      .sa1-panel p{font-size:.87rem;line-height:1.5;margin:0;color:#d7f9ef}
      .sa1-toggle{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid #76cebf;background:#07545c;border-radius:13px;padding:13px;cursor:pointer}
      .sa1-toggle strong{font-size:.98rem;line-height:1.4}
      .sa1-toggle input{width:24px;height:24px;flex:0 0 24px;accent-color:#05c09b}
      .sa1-output{white-space:pre-line;border-left:3px solid #a6ffdc;background:#084d50;padding:11px;font-size:.83rem;line-height:1.55;border-radius:7px}
      .sa1-foot{font-size:.75rem!important;color:#b7e4df!important}
    `;
    document.head.appendChild(sheet);
  }
  function injectPanel(){
    if(typeof state==='undefined'||state.view!==VIEW)return;
    const page=document.querySelector('#main .sy1-content');if(!page||page.querySelector('#sa1Panel'))return;
    const account=page.querySelector('#sn3Account');if(!account)return;
    addCss();
    const section=document.createElement('section');section.id='sa1Panel';section.className='sa1-panel';
    section.innerHTML=`<h2>Synchronisation automatique</h2>
      <p>Retrouver mes nouvelles séances et activités sur mes appareils, sans bouton à chaque fois.</p>
      <label class="sa1-toggle" for="sa1Enabled"><strong>Activer sur cet appareil</strong><input type="checkbox" id="sa1Enabled"></label>
      <div class="sa1-output" id="sa1Message" role="status" aria-live="polite"></div>
      <p class="sa1-foot">Fonctionne uniquement quand l’application est ouverte, visible et connectée à Internet. Les séances en cours ne sont jamais touchées. Les suppressions et modifications contradictoires restent à vérifier manuellement.</p>`;
    account.after(section);
    section.querySelector('#sa1Enabled').addEventListener('change',event=>{
      if(event.target.checked && !authenticated()){
        event.target.checked=false;status('Connecte-toi avant d’activer la synchronisation.','warning');return;
      }
      if(event.target.checked && !validConfig(cfg())){
        event.target.checked=false;status('Configuration Supabase en attente.','warning');return;
      }
      if(event.target.checked){
        if(!confirm('Activer l’envoi et la réception automatiques des nouvelles données sur cet appareil ? Les données existantes ne seront pas écrasées en cas de conflit.')){
          event.target.checked=false;return;
        }
      }
      const current=storageRead(SESSION,null);
      const c=cfg();
      if(!storageWrite(FLAG,event.target.checked?{
        enabled:true,project:c.url,email:String(current.email||'').trim().toLowerCase(),user_id:current.user_id||null
      }:{enabled:false})){
        event.target.checked=false;status('Impossible de mémoriser ce réglage sur cet appareil.','warning');return;
      }
      status(event.target.checked?'Activée. Quitte cet écran pour lancer le premier échange automatique.':'Désactivée sur cet appareil.','info');
      if(event.target.checked)schedule(1500);
    });
    updatePanel();
  }
  // Après le rendu V3, insérer le réglage sans modifier les autres panneaux.
  const previousRender=render;
  render=function(){
    const result=previousRender.apply(this,arguments);
    if(typeof state!=='undefined'&&state.view===VIEW)injectPanel();
    else if(enabled())schedule(1200);
    return result;
  };
  const main=document.getElementById('main');
  if(main){
    const observer=new MutationObserver(()=>{
      if(typeof state!=='undefined'&&state.view===VIEW)injectPanel();
    });
    observer.observe(main,{childList:true,subtree:false});
  }
  window.addEventListener('online',()=>{if(enabled())schedule(800);});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&enabled())schedule(1300);});
  window.addEventListener('focus',()=>{if(enabled())schedule(2000);});
  setInterval(()=>{if(enabled())run('périodique');},POLL_MS);
  if(enabled())schedule(4500);
  window.SportAutoSync={status:()=>storageRead(STATE_KEY,null),enabled};
})();
