/* SPORT & NUTRITION — Synchronisation sécurisée V5 — 13/11/2026
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
  const TRASH='mb_sync_v5_corbeille_v1';
  const PENDING='mb_sync_v5_suppressions_en_attente_v1';
  const DELETED='__mb_deleted_v5';
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
  const DEL_CATS=new Set(SPECS.filter(s=>s.kind!=='single').map(s=>s.category));
  const tombstone=x=>!!(x&&typeof x==='object'&&!Array.isArray(x)&&x[DELETED]===true);
  const identity=()=>{const s=storageRead(SESSION,{});return {project:cfg()?.url||'',email:String(s?.email||'').toLowerCase()};};
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
  function canRun(allowSettings=false,manual=false){
    if(!(manual?authenticated():enabled())||!validConfig(cfg())||!authenticated())return false;
    if(document.visibilityState==='hidden'||navigator.onLine===false)return false;
    if(!allowSettings&&typeof state!=='undefined'&&state.view===VIEW)return false;
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
      const page=await api('/rest/v1/mb_sync_records?select=category,item_id,payload,updated_at&order=category.asc,item_id.asc&limit=500&offset='+offset,'GET',undefined,token);
      if(!Array.isArray(page))throw new Error('Réponse cloud invalide.');
      items.push(...page);if(page.length<500)break;
    }
    if(items.length>=20000)throw new Error('Plus de 20 000 lignes : contrôle manuel requis.');
    const map=new Map(),allow=new Set(SPECS.map(s=>s.category));
    for(const item of items)if(allow.has(item.category)&&typeof item.item_id==='string'&&item.payload!=null)
      map.set(item.category+'|'+item.item_id,item);
    return map;
  }
  // Une suppression distante est un marqueur dans le cloud, jamais un DELETE SQL.
  // Un ancien appareil V4 ne doit pas être utilisé pour valider des suppressions :
  // mise à jour de tous les appareils vers V5 avant le premier test.
  function applyInbound(incoming,baseline,userId,project){
    const original=new Map(),applied=[],conflicts=[];
    const oldTrash=localStorage.getItem(TRASH);
    const identityNow=identity();
    if(identityNow.project!==project)throw new Error('Projet Supabase changé pendant la réception.');
    const prior=storageRead(TRASH,null);
    const trash=prior?.project===project&&prior?.user_id===userId?prior:{project,user_id:userId,items:[]};
    const allTrash=new Set(trash.items.map(x=>x.category+'|'+x.item_id+'|'+x.deleted_at));
    try{
      for(const spec of SPECS){
        const rows=incoming.filter(r=>r.category===spec.category);
        if(!rows.length)continue;
        const value=storageRead(spec.key,null);
        const existing=spec.kind==='single'?(value&&typeof value==='object'&&!Array.isArray(value)?value:null)
          :Array.isArray(value)?value:[];
        let next=existing,changed=false;
        if(spec.kind==='single'){
          const row=rows[0],key=spec.category+'|profil',known=baseline[key];
          if(tombstone(row.payload)){conflicts.push(key);continue;}
          if(existing&&(!known||signature(existing)!==known)){conflicts.push(key);continue;}
          if(!existing||signature(existing)!==signature(row.payload)){next=row.payload;changed=true;}
          applied.push(row);
        }else if(spec.kind==='favorites'){
          const set=new Set(existing);
          for(const row of rows){
            const key=spec.category+'|'+row.item_id,has=set.has(row.item_id);
            if(tombstone(row.payload)){
              if(has){
                const localSig=signature({favorite:true});
                if(!baseline[key]||baseline[key]!==localSig){conflicts.push(key);continue;}
                set.delete(row.item_id);changed=true;
                const trashKey=key+'|'+row.payload.deleted_at;
                if(!allTrash.has(trashKey)){
                  trash.items.push({category:row.category,item_id:row.item_id,payload:{favorite:true},deleted_at:row.payload.deleted_at||new Date().toISOString()});
                  allTrash.add(trashKey);
                }
              }
              applied.push(row);continue;
            }
            if(!has){set.add(row.item_id);changed=true;}
            applied.push(row);
          }
          next=[...set];
        }else{
          const map=new Map(existing.map(x=>[String(x?.id??''),x]));
          for(const row of rows){
            const key=spec.category+'|'+row.item_id,old=map.get(row.item_id);
            if(old&&(!baseline[key]||signature(old)!==baseline[key])){conflicts.push(key);continue;}
            if(tombstone(row.payload)){
              if(old){
                map.delete(row.item_id);changed=true;
                const trashKey=key+'|'+row.payload.deleted_at;
                if(!allTrash.has(trashKey)){
                  trash.items.push({category:row.category,item_id:row.item_id,payload:old,deleted_at:row.payload.deleted_at||new Date().toISOString()});
                  allTrash.add(trashKey);
                }
              }
              applied.push(row);continue;
            }
            if(!old||signature(old)!==signature(row.payload)){
              map.set(row.item_id,row.payload);changed=true;
            }
            applied.push(row);
          }
          next=[...map.values()];
        }
        if(changed){
          original.set(spec.key,localStorage.getItem(spec.key));
          if(!storageWrite(spec.key,next))throw new Error('Stockage local insuffisant. Réception annulée.');
        }
      }
      if(trash.items.length){
        // Les 80 dernières sauvegardes de suppression restent locales et privées.
        trash.items=trash.items.slice(-80);
        if(!storageWrite(TRASH,trash))throw new Error('Impossible de préserver la corbeille locale : suppression annulée.');
      }
    }catch(e){
      for(const [key,raw] of [...original.entries()].reverse()){
        try{if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);}catch(_){}
      }
      try{if(oldTrash===null)localStorage.removeItem(TRASH);else localStorage.setItem(TRASH,oldTrash);}catch(_){}
      throw e;
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
  // Mise à jour conditionnelle: la ligne distante ne change que si elle est
  // encore identique à celle qui a été lue (contenu + date de dernière mise à jour).
  async function patchIfUnchanged(before,next,token,userId){
    if(!before?.updated_at)throw new Error('Date distante manquante : modification reportée.');
    const query=new URLSearchParams();
    query.set('user_id','eq.'+userId);
    query.set('category','eq.'+before.category);
    query.set('item_id','eq.'+before.item_id);
    query.set('updated_at','eq.'+before.updated_at);
    query.set('payload','eq.'+JSON.stringify(before.payload));
    query.set('select','category,item_id,payload,updated_at');
    const rows=await api('/rest/v1/mb_sync_records?'+query.toString(),'PATCH',
      {payload:next,updated_at:new Date().toISOString()},token,{'Prefer':'return=representation'});
    return Array.isArray(rows)&&rows.length===1;
  }
  function scopedPending(userId,project){
    const p=storageRead(PENDING,null);
    if(p?.user_id!==userId||p?.project!==project||p?.email!==identity().email)return [];
    return Array.isArray(p.items)?p.items:[];
  }
  function savePending(items,userId,project){
    return storageWrite(PENDING,{project,user_id:userId,email:identity().email,items});
  }
  async function run(reason,options={}){
    const allowSettings=options.allowSettings===true,manual=options.manual===true;
    if(busy||!canRun(allowSettings,manual))return;
    if(!options.force&&Date.now()-lastAttempt<MIN_GAP_MS)return;
    busy=true;lastAttempt=Date.now();const serial=++requestSerial;
    try{
      const s=await validToken();if(!s||!canRun(allowSettings,manual))return;
      const user=await api('/auth/v1/user','GET',undefined,s.access_token);
      if(!user?.id||storageRead(SESSION,null)?.email!==s.email)throw new Error('Session utilisateur à vérifier.');
      const startCfg=cfg()?.url;
      const local=localRecords(),cloud=await remoteRecords(s.access_token);
      const memory=storageRead(META,{});
      const baseline=(memory?.user_id===user.id&&memory?.project===startCfg)?(memory.signatures||{}):{};
      const incoming=[],outgoing=[],updates=[],aligned={},conflicts=[],missing=[],deletes=[];
      for(const key of new Set([...local.keys(),...cloud.keys()])){
        const l=local.get(key),r=cloud.get(key),prev=baseline[key];
        const sl=l?signature(l.payload):null,sr=r?signature(r.payload):null;
        if(l&&r){
          if(sl===sr){aligned[key]=sl;continue;}
          if(prev===sl&&prev!==sr){incoming.push(r);continue;}
          if(prev===sr&&prev!==sl&&!tombstone(r.payload)){updates.push({before:r,next:l});continue;}
          conflicts.push(key);continue;
        }
        if(l&&!r){if(prev)missing.push(key);else outgoing.push(l);continue;}
        if(!l&&r){
          if(tombstone(r.payload)){
            // Marqueur déjà reçu, ne jamais importer comme une fausse séance.
            aligned[key]=sr;continue;
          }
          if(prev){
            if(prev===sr&&DEL_CATS.has(r.category))deletes.push(r);
            else conflicts.push(key);
            continue;
          }
          incoming.push(r);
        }
      }
      if(!canRun(allowSettings,manual)||cfg()?.url!==startCfg||storageRead(SESSION,null)?.email!==s.email)return;
      const nowLocal=localRecords();
      const safeIncoming=incoming.filter(r=>{
        const key=r.category+'|'+r.item_id,old=local.get(key),now=nowLocal.get(key);
        return (!old&&!now)||(old&&now&&signature(old.payload)===signature(now.payload));
      });
      const safeOutgoing=outgoing.filter(row=>{
        const now=nowLocal.get(row.category+'|'+row.item_id);
        return now&&signature(now.payload)===signature(row.payload);
      });
      const safeUpdates=updates.filter(x=>{
        const now=nowLocal.get(x.next.category+'|'+x.next.item_id);
        return now&&signature(now.payload)===signature(x.next.payload);
      });
      let pendingDeletes=deletes.filter(r=>!nowLocal.has(r.category+'|'+r.item_id));
      // Sur un appareil pas encore à jour, aucune suppression n'est lancée par défaut.
      // Seule une confirmation explicite depuis ce tableau déclenche le marquage.
      const confirmed=new Set(Array.isArray(options.confirmed)?options.confirmed:[]);
      const confirmedRows=pendingDeletes.filter(r=>confirmed.has(r.category+'|'+r.item_id));
      if(safeOutgoing.length)await addNewOnly(safeOutgoing,s.access_token,user.id);
      let modified=0,sentDeletes=0;
      for(const item of safeUpdates){
        if(!canRun(allowSettings,manual))return;
        const key=item.next.category+'|'+item.next.item_id;
        if(!localRecords().has(key)||signature(localRecords().get(key).payload)!==signature(item.next.payload))continue;
        if(await patchIfUnchanged(item.before,item.next.payload,s.access_token,user.id))modified++;
        else conflicts.push(key);
      }
      for(const row of confirmedRows){
        if(!canRun(allowSettings,manual))return;
        const key=row.category+'|'+row.item_id;
        if(localRecords().has(key)){conflicts.push(key);continue;}
        const mark={[DELETED]:true,deleted_at:new Date().toISOString(),saved_payload:row.payload};
        if(await patchIfUnchanged(row,mark,s.access_token,user.id))sentDeletes++;
        else conflicts.push(key);
      }
      if(!canRun(allowSettings,manual))return;
      const {applied,conflicts:receiveConflicts}=applyInbound(safeIncoming,baseline,user.id,startCfg);
      const verified=await remoteRecords(s.access_token);
      const current=localRecords();let sent=0,received=0,removed=0;
      for(const row of safeOutgoing){
        const key=row.category+'|'+row.item_id;
        if(verified.has(key)&&current.has(key)&&signature(verified.get(key).payload)===signature(current.get(key).payload)){
          aligned[key]=signature(row.payload);sent++;
        }else conflicts.push(key);
      }
      for(const row of applied){
        const key=row.category+'|'+row.item_id,remote=verified.get(key);
        if(!remote)continue;
        if(tombstone(remote.payload)&&!current.has(key)){
          aligned[key]=signature(remote.payload);removed++;
        }else if(current.has(key)&&signature(remote.payload)===signature(current.get(key).payload)){
          aligned[key]=signature(remote.payload);received++;
        }
      }
      for(const item of safeUpdates){
        const key=item.next.category+'|'+item.next.item_id,remote=verified.get(key),loc=current.get(key);
        if(remote&&loc&&signature(remote.payload)===signature(loc.payload))aligned[key]=signature(loc.payload);
      }
      for(const row of confirmedRows){
        const key=row.category+'|'+row.item_id,remote=verified.get(key);
        if(remote&&tombstone(remote.payload)&&!current.has(key))aligned[key]=signature(remote.payload);
      }
      for(const key of Object.keys(aligned)){
        const remote=verified.get(key),loc=current.get(key);
        if(!remote||(tombstone(remote.payload)?!!loc:(!loc||signature(remote.payload)!==signature(loc.payload))))delete aligned[key];
      }
      const recent=storageRead(META,{});
      const previous=(recent?.user_id===user.id&&recent?.project===startCfg)?(recent.signatures||{}):{};
      if(!storageWrite(META,{user_id:user.id,project:startCfg,
        signatures:{...previous,...aligned},updated_at:new Date().toISOString()})){
        throw new Error('État local de synchronisation non enregistré.');
      }
      const newPending=pendingDeletes.filter(r=>{
        const key=r.category+'|'+r.item_id,latest=verified.get(key);
        return !current.has(key)&&latest&&!tombstone(latest.payload)&&previous[key]===signature(latest.payload);
      }).map(r=>r.category+'|'+r.item_id);
      if(!savePending(newPending,user.id,startCfg))throw new Error('Impossible de mémoriser les suppressions en attente.');
      const count=new Set([...conflicts,...receiveConflicts]).size;
      const summary=`${sent} ajoutée(s), ${received} reçue(s), ${modified} modification(s) envoyée(s), `+
        `${sentDeletes} suppression(s) confirmée(s), ${removed} suppression(s) reçue(s). `+
        (count?count+' conflit(s) à traiter sans écrasement. ':'')+
        (newPending.length?newPending.length+' suppression(s) locale(s) attend(ent) ta confirmation. ':'')+
        'Contrôle terminé.';
      failures=0;
      status(summary,count||missing.length||newPending.length?'warning':'success',
        {sent,received,modified,sentDeletes,removed,conflicts:count,pending:newPending.length,missing:missing.length,reason,serial});
    }catch(e){
      failures=Math.min(failures+1,5);
      lastAttempt=Date.now()+Math.min(900000,45000*(2**(failures-1)))-MIN_GAP_MS;
      status('Synchronisation en attente : '+String(e.message||e).slice(0,130),'warning');
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
    const s=storageRead(SESSION,null),p=storageRead(PENDING,null);
    const pending=p?.email===identity().email&&p?.project===cfg()?.url&&(!p.user_id||!s?.user_id||p.user_id===s.user_id)
      ?(Array.isArray(p.items)?p.items:[]):[];
    const action=panel.querySelector('#sa5ConfirmDeletes');
    if(action){action.hidden=!pending.length;action.textContent='Confirmer '+pending.length+' suppression(s) sur mes appareils';}
    const note=panel.querySelector('#sa5DeleteNotice');
    if(note)note.textContent=pending.length
      ?'Ces éléments sont supprimés localement mais encore présents dans le cloud. Après confirmation, ils seront masqués sur les autres appareils V5.'
      :'Les suppressions sont proposées pour confirmation, jamais envoyées automatiquement.';
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
      .sa5-actions{display:grid;gap:8px}
      .sa5-actions button{padding:12px;border:1px solid #a6f4e0;border-radius:10px;background:#07565c;color:#eafff9;font-weight:730;font-size:.88rem}
      .sa5-actions button[hidden]{display:none!important}
      #sa5DeleteNotice{font-size:.79rem;color:#d0fff1}
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
      <div class="sa5-actions"><button type="button" id="sa5ConfirmDeletes" hidden>Confirmer les suppressions</button>
        <span id="sa5DeleteNotice"></span></div>
      <p class="sa1-foot">V5 · Ajouts et modifications non conflictuelles synchronisés automatiquement lorsque l’application est ouverte. Suppressions après confirmation seulement. Avant de confirmer une suppression, mets la V5 sur tous tes appareils. Une copie technique reste dans le cloud sécurisé pour une restauration ultérieure : ce n’est pas un effacement définitif.</p>`;
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
    section.querySelector('#sa5ConfirmDeletes').addEventListener('click',async()=>{
      if(!authenticated()||!validConfig(cfg())){status('Connecte-toi avant de gérer les suppressions.','warning');return;}
      const s=storageRead(SESSION,null),p=storageRead(PENDING,null);
      if(!p?.items?.length||p.project!==cfg()?.url||p.email!==identity().email)return;
      const items=p.items.slice();
      if(!confirm('Confirmer la suppression de '+items.length+' élément(s) sur tes autres appareils V5 ? '+
        'IMPORTANT : mets d’abord à jour TOUS tes appareils avec la V5. Une copie technique reste dans la corbeille sécurisée. Cette opération ne supprime pas définitivement les données du cloud.'))return;
      status('Vérification des suppressions avant propagation…','info');
      await run('confirmation-suppression',{allowSettings:true,manual:true,force:true,confirmed:items});
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
  // Le bouton manuel historique V1 est redirige vers le moteur V5.
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element)||!target.closest('#sy1Run'))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!confirm('Lancer le contrôle sécurisé V5 ? Les suppressions ne sont propagées qu’après confirmation.'))return;
    run('manuel',{allowSettings:true,manual:true,force:true});
  },true);
  window.SportAutoSync={status:()=>storageRead(STATE_KEY,null),enabled,
    runManual:()=>run('manuel',{allowSettings:true,manual:true,force:true})};
})();
