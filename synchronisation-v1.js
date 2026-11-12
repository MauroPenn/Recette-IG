/* SPORT & NUTRITION — SYNCHRONISATION V1
 * Backup local, connexion Supabase Auth, fusion explicite et conservatrice.
 * Aucune écriture distante sans connexion volontaire + clic Synchroniser.
 * Les brouillons et séances en cours ne sont jamais touchés.
 * Suppressions et conflits sont signalés (pas de suppression automatique V1).
 */
(function(){
 'use strict';
 const VIEW='synchronisation-v1', CFG='mb_sync_config_v1', SESSION='mb_sync_session_v1', META='mb_sync_meta_v1';
 const SPECS=[
  {category:'profil',key:'mb_profil_sportif_v1',kind:'single'},
  {category:'activites_sportives',key:'mb_activites_sportives_v1',kind:'array'},
  {category:'seances_musculation',key:'mb_muscu_seances_v1',kind:'array'},
  {category:'historique_musculation',key:'mb_muscu_historique_v1',kind:'array'},
  {category:'activites_personnalisees',key:'mb_activites_personnalisees_v1',kind:'array'},
  {category:'favoris_recettes',key:'recipeFavorites',kind:'favorites'}
 ];
 const $=sel=>main.querySelector(sel);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
 const read=(k,fallback)=>{try {const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v);}catch(_){return fallback;}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(_){return false;}};
 const validConfig=o=>o && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(o.url||'') && /^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.test(o.key||'');
 const config=()=>read(CFG,null);
 const session=()=>read(SESSION,null);
 let busy=false;
 function notice(msg,type='info'){
   const el=$('#sy1Notice'); if(!el)return;
   el.textContent=msg; el.className='sy1-notice sy1-'+type;el.hidden=!msg;
 }
 function go(view){state.view=view;render();window.scrollTo?.({top:0,behavior:'instant'});}
 function injectSettingsLink(){
   if(state.view!=='parametres-global-v1')return;
   const tile=Array.from(main.querySelectorAll('.gs1-disabled-tile')).find(e=>(e.textContent||'').includes('Sauvegarde des données'));
   if(!tile||$('#sy1SettingsLink'))return;
   const btn=document.createElement('button');btn.id='sy1SettingsLink';btn.type='button';btn.className='sy1-settings-link';
   btn.innerHTML='<span class="sy1-settings-icon" aria-hidden="true">⇄</span><span><strong>Sauvegarde et synchronisation</strong><small>Exporter mes données et les retrouver sur mes appareils</small></span><b aria-hidden="true">›</b>';
   btn.addEventListener('click',()=>go(VIEW));tile.replaceWith(btn);
 }
 function shell(){document.body.classList.remove('as1-active','ml1-active','ps1-active','cp-active','vt1-active');document.body.classList.add('gs1-active','sy1-active');bottomNav.classList.add('hidden');}
 function renderSync(){
   shell();const cfg=config(),s=session();
   main.innerHTML=`<section class="sy1-screen" aria-label="Sauvegarde et synchronisation">
     <header class="sy1-hero"><button type="button" class="sy1-back" id="sy1Back" aria-label="Retour aux paramètres">←</button>
       <p class="sy1-kicker">PARAMÈTRES · MES DONNÉES</p><h1>Sauvegarde et synchronisation</h1><p>Conserver tes données et les retrouver sur tes appareils, sans écraser tes séances.</p>
     </header><div class="sy1-content">
       <div class="sy1-panel"><h2>1 · Sauvegarde de sécurité</h2><p>À faire d’abord sur ton téléphone, ton PC et ta tablette. Le fichier contient les profils, séances, historiques, activités personnalisées et favoris de cet appareil.</p>
         <button type="button" id="sy1Export" class="sy1-primary">↓ Exporter une sauvegarde JSON</button>
         <p class="sy1-small">Le fichier contient des données personnelles et peut inclure des parcours GPS et photos. Conserve-le dans un emplacement privé. Les séances en cours ne sont pas exportées.</p>
         <div class="sy1-import"><label for="sy1File">Restaurer ou fusionner une sauvegarde (facultatif)</label><input type="file" id="sy1File" accept=".json,application/json">
           <button type="button" class="sy1-secondary" id="sy1Import">Fusionner sans écraser les données existantes</button></div>
       </div>
       <div class="sy1-panel"><h2>2 · Connexion au cloud</h2>
         ${cfg&&validConfig(cfg)?'<p class="sy1-ok">✓ Projet Supabase configuré sur cet appareil.</p>':'<p class="sy1-pending">Projet Supabase à configurer : aucune donnée n’est envoyée pour le moment.</p>'}
         <details class="sy1-details"><summary>Configurer mon projet Supabase</summary>
           <p class="sy1-small">Utilise uniquement l’URL du projet et la clé <strong>publishable</strong> publique, jamais une clé secret ou service_role. Ne transmets pas ton mot de passe.</p>
           <label>Adresse du projet <input id="sy1Url" type="url" inputmode="url" placeholder="https://xxxxxxxx.supabase.co" value="${esc(cfg?.url||'')}"></label>
           <label>Clé publique du projet <input id="sy1Key" type="text" autocomplete="off" spellcheck="false" placeholder="sb_publishable_..." value="${esc(cfg?.key||'')}"></label>
           <button type="button" id="sy1SaveConfig" class="sy1-secondary">Enregistrer la configuration</button>
         </details>
         ${s?.email?`<p class="sy1-ok">Compte connecté : <strong>${esc(s.email)}</strong></p>`:'<p class="sy1-small">Un seul compte e-mail permet de retrouver les données sur tes différents appareils.</p>'}
         <div class="sy1-credentials"><label>Adresse e-mail<input id="sy1Email" type="email" autocomplete="username" placeholder="adresse@email.fr" value="${esc(s?.email||'')}"></label>
         <label>Mot de passe<input id="sy1Password" type="password" autocomplete="current-password" placeholder="Mot de passe personnel"></label></div>
         <div class="sy1-actions"><button type="button" class="sy1-primary" id="sy1SignIn">Se connecter</button>
         <button type="button" class="sy1-secondary" id="sy1SignUp">Créer mon compte</button>
         ${s?'<button type="button" class="sy1-text-button" id="sy1SignOut">Se déconnecter</button>':''}</div>
         <p class="sy1-small">Après inscription, un e-mail de confirmation peut être nécessaire. Ne réutilise pas ton mot de passe GitHub.</p>
       </div>
       <div class="sy1-panel"><h2>3 · Synchroniser mes données</h2><p>Chaque appareil conserve ses données locales. La synchronisation ajoute les nouvelles séances et transmet les modifications non conflictuelles.</p>
         <button type="button" class="sy1-primary" id="sy1Run" ${!(validConfig(cfg)&&s?.refresh_token)?'disabled':''}>⇄ Synchroniser maintenant</button>
         <p class="sy1-small"><strong>Sécurité V1 :</strong> si la même information a été modifiée différemment sur deux appareils, elle n'est pas écrasée automatiquement. Les suppressions ne sont pas encore propagées entre appareils. Synchronise lorsque tu n’as pas de séance en cours.</p>
       </div>
       <p class="sy1-notice" id="sy1Notice" role="status" aria-live="polite" hidden></p>
       <button type="button" class="sy1-footer" id="sy1Return">← Retour aux paramètres</button>
     </div></section>`;
   $('#sy1Back').onclick=$('#sy1Return').onclick=()=>go('parametres-global-v1');
   $('#sy1Export').onclick=exportBackup;
   $('#sy1Import').onclick=importBackup;
   $('#sy1SaveConfig').onclick=saveConfig;
   $('#sy1SignIn').onclick=()=>auth('login');
   $('#sy1SignUp').onclick=()=>auth('signup');
   $('#sy1SignOut')?.addEventListener('click',()=>{localStorage.removeItem(SESSION);renderSync();notice('Déconnecté de cet appareil. Les données locales sont conservées.','success');});
   $('#sy1Run').onclick=syncNow;
 }
 function snapshot(){
   const sources={};let count=0;
   for(const spec of SPECS){const raw=read(spec.key,null);if(raw===null)continue;
     if(spec.kind==='single'){if(raw&&typeof raw==='object'&&!Array.isArray(raw)){sources[spec.key]=raw;count++;}}
     else if(Array.isArray(raw)){sources[spec.key]=raw;count+=raw.length;}
   }
   return {format:'mb-sauvegarde-v1',exportedAt:new Date().toISOString(),sources,count};
 }
 function exportBackup(){
   const obj=snapshot();const data=JSON.stringify(obj);
   const url=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'}));
   const a=document.createElement('a');a.href=url;a.download='sport-nutrition-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
   notice(`Sauvegarde demandée : ${obj.count} élément(s) sur cet appareil. Vérifie le dossier Téléchargements.`, 'success');
 }
 function mergeBackup(local,remote,spec){
   if(spec.kind==='single')return local==null?{value:remote,added:1,skipped:0}:{value:local,added:0,skipped:1};
   const old=Array.isArray(local)?local:[];
   const incoming=Array.isArray(remote)?remote:[];
   const out=old.slice();const seen=new Set(old.map(x=>spec.kind==='favorites'?String(x):String(x?.id??'')));
   let added=0,skipped=0;
   for(const item of incoming){const id=spec.kind==='favorites'?String(item):String(item?.id??'');
     if(!id||id==='undefined'||id==='null'){skipped++;continue;}
     if(seen.has(id)){skipped++;continue;}
     out.push(item);seen.add(id);added++;
   }
   return {value:out,added,skipped};
 }
 async function importBackup(){
   const input=$('#sy1File'),file=input?.files?.[0];if(!file){notice('Choisis d’abord un fichier JSON.','error');return;}
   if(file.size>30*1024*1024){notice('Fichier supérieur à 30 Mo : import interrompu par précaution.','error');return;}
   let obj;try{obj=JSON.parse(await file.text());}catch(_){notice('Ce fichier n’est pas un JSON lisible.','error');return;}
   if(obj?.format!=='mb-sauvegarde-v1'||!obj.sources||typeof obj.sources!=='object'||Array.isArray(obj.sources)){
     notice('Format de sauvegarde non reconnu. Rien n’a été modifié.','error');return;
   }
   const plan=[];let added=0,skipped=0;
   for(const spec of SPECS){if(!Object.hasOwn(obj.sources,spec.key))continue;
     const inc=obj.sources[spec.key];
     if(spec.kind==='single'&&(!inc||typeof inc!=='object'||Array.isArray(inc)))continue;
     if(spec.kind!=='single'&&!Array.isArray(inc))continue;
     const result=mergeBackup(read(spec.key,null),inc,spec);
     if(result.added){plan.push({key:spec.key,value:result.value});added+=result.added;}
     skipped+=result.skipped;
   }
   if(!plan.length){notice(`Aucune nouvelle donnée à fusionner. ${skipped} élément(s) déjà présents.`, 'info');return;}
   if(!confirm(`Fusionner ${added} nouvelle(s) donnée(s) ? Les données existantes ne seront pas écrasées. Une copie de sécurité est recommandée avant toute importation.`))return;
   // Preflight storage quota: keep a recovery copy of each original value.
   const written=[];
   for(const item of plan){const original=localStorage.getItem(item.key);
     if(!write(item.key,item.value)){
       for(const prev of written.reverse())try{if(prev.original===null)localStorage.removeItem(prev.key);else localStorage.setItem(prev.key,prev.original);}catch(_){}
       notice('Espace local insuffisant : import annulé et retour à l’état précédent tenté.','error');return;
     }
     written.push({key:item.key,original});
   }
   notice(`${added} nouvelle(s) donnée(s) fusionnée(s), ${skipped} déjà présentes. Recharge l’application pour actualiser tous les écrans.`, 'success');
 }
 function saveConfig(){
   const url=$('#sy1Url').value.trim().replace(/\/$/,'');const key=$('#sy1Key').value.trim();
   if(!validConfig({url,key})){notice('Vérifie l’URL Supabase et la clé publique publishable (jamais secret/service_role).','error');return;}
   const old=config();if(old&&(old.url!==url||old.key!==key)&&session()){
     if(!confirm('Changer de projet déconnectera ton compte sur cet appareil. Continuer ?'))return;
     localStorage.removeItem(SESSION);
   }
   if(!write(CFG,{url,key})){notice('Impossible de sauvegarder cette configuration.','error');return;}
   renderSync();notice('Configuration enregistrée uniquement sur cet appareil.','success');
 }
 async function request(path,method='GET',body,token,extra={}){
   const cfg=config();if(!validConfig(cfg))throw new Error('Configure d’abord ton projet Supabase.');
   const response=await fetch(cfg.url+path,{method,mode:'cors',cache:'no-store',headers:{apikey:cfg.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
   let data;const raw=await response.text();try{data=raw?JSON.parse(raw):null;}catch(_){data=null;}
   if(!response.ok){const m=data?.msg||data?.error_description||data?.message||data?.error||('HTTP '+response.status);throw new Error(String(m).slice(0,180));}
   return data;
 }
 async function auth(type){
   if(busy)return;busy=true;
   try{
     const email=$('#sy1Email').value.trim().toLowerCase(),password=$('#sy1Password').value;
     if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8)throw new Error('Indique une adresse e-mail valide et un mot de passe d’au moins 8 caractères.');
     if(!validConfig(config()))throw new Error('Commence par configurer le projet Supabase.');
     notice('Connexion au service en cours…');
     const callback=location.origin+location.pathname;
     const path=type==='signup'?'/auth/v1/signup?redirect_to='+encodeURIComponent(callback):'/auth/v1/token?grant_type=password';
     const res=await request(path,'POST',{email,password});
     if(res?.access_token&&res?.refresh_token){storeSession(res,email);renderSync();notice('Compte connecté. Tu peux maintenant lancer une synchronisation.','success');}
     else if(type==='signup')notice('Compte demandé. Vérifie ton e-mail de confirmation puis connecte-toi.','success');
     else throw new Error('Aucune session renvoyée. Vérifie la confirmation de ton e-mail.');
   }catch(e){notice('Connexion impossible : '+e.message,'error');}
   finally{busy=false;}
 }
 function storeSession(result,email){
   return write(SESSION,{access_token:result.access_token,refresh_token:result.refresh_token,email:email||result.user?.email||session()?.email||'',user_id:result.user?.id||session()?.user_id||null,expires_at:Date.now()+Number(result.expires_in||3600)*1000});
 }
 async function token(){
   const s=session();if(!s?.refresh_token)throw new Error('Connecte-toi d’abord.');
   if(s.access_token&&Date.now()<Number(s.expires_at||0)-90000)return s;
   const result=await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:s.refresh_token});
   if(!result?.access_token)throw new Error('Session expirée. Reconnecte-toi.');
   if(!storeSession(result,s.email))throw new Error('Impossible de mémoriser la session.');
   return session();
 }
 function sortStable(v){
   if(Array.isArray(v))return v.map(sortStable);
   if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=sortStable(v[k]);return o;}
   return v;
 }
 function signature(data){
   const str=JSON.stringify(sortStable(data));let h1=2166136261,h2=5381;
   for(let i=0;i<str.length;i++){h1=Math.imul(h1^str.charCodeAt(i),16777619);h2=Math.imul(h2,33)^str.charCodeAt(i);}
   return str.length+':'+(h1>>>0).toString(16)+':'+(h2>>>0).toString(16);
 }
 function currentRecords(){
   const records=new Map();
   for(const spec of SPECS){const val=read(spec.key,null);
     if(spec.kind==='single'){
       if(val&&typeof val==='object'&&!Array.isArray(val))records.set(spec.category+'|profil',{category:spec.category,item_id:'profil',payload:val});
     }else if(Array.isArray(val)){
       for(const item of val){const id=spec.kind==='favorites'?String(item):String(item?.id??'');
         if(!id||id==='undefined'||id==='null')continue;
         const key=spec.category+'|'+id;
         records.set(key,{category:spec.category,item_id:id,payload:spec.kind==='favorites'?{favorite:true}:item});
       }
     }
   }
   return records;
 }
 async function remoteRecords(authToken){
   const rows=[];for(let offset=0;offset<20000;offset+=500){
     const page=await request('/rest/v1/mb_sync_records?select=category,item_id,payload&order=category.asc,item_id.asc&limit=500&offset='+offset,'GET',undefined,authToken);
     if(!Array.isArray(page))throw new Error('Réponse de synchronisation invalide.');
     rows.push(...page);if(page.length<500)break;
   }
   if(rows.length>=20000)throw new Error('Nombre de lignes cloud trop élevé : synchronisation interrompue par précaution.');
   const remote=new Map();const allowed=new Set(SPECS.map(s=>s.category));
   for(const row of rows){if(allowed.has(row.category)&&typeof row.item_id==='string'&&row.payload!=null)remote.set(row.category+'|'+row.item_id,row);}
   return remote;
 }
 function applyRemote(items){
   const grouped=new Map();for(const row of items){const a=grouped.get(row.category)||[];a.push(row);grouped.set(row.category,a);}
   const written=[];
   for(const spec of SPECS){const list=grouped.get(spec.category);if(!list?.length)continue;
     const current=read(spec.key,null);let next;
     if(spec.kind==='single'){next=list[list.length-1].payload;}
     else if(spec.kind==='favorites'){
       const fav=new Set(Array.isArray(current)?current:[]);
       for(const row of list)fav.add(row.item_id);
       next=[...fav];
     }else{
       const arr=Array.isArray(current)?current:[];
       const update=new Map(list.map(r=>[r.item_id,r.payload]));
       next=arr.map(x=>update.has(String(x?.id))?update.get(String(x?.id)):x);
       const ids=new Set(arr.map(x=>String(x?.id)));
       for(const row of list)if(!ids.has(row.item_id))next.push(row.payload);
     }
     const before=localStorage.getItem(spec.key);
     if(!write(spec.key,next)){
       for(const previous of written.reverse())try{if(previous.before===null)localStorage.removeItem(previous.key);else localStorage.setItem(previous.key,previous.before);}catch(_){}
       throw new Error('Stockage local insuffisant : rétablissement des données précédentes tenté.');
     }
     written.push({key:spec.key,before});
   }
 }
 async function pushRemote(items,authToken,userId){
   for(let i=0;i<items.length;i+=20){
     const batch=items.slice(i,i+20).map(x=>({user_id:userId,category:x.category,item_id:x.item_id,payload:x.payload}));
     await request('/rest/v1/mb_sync_records?on_conflict=user_id,category,item_id','POST',batch,authToken,{'Prefer':'resolution=merge-duplicates,return=minimal'});
   }
 }
 async function syncNow(){
   if(busy)return;busy=true;
   try{
     if(!confirm('Lancer la fusion avec ton espace cloud ? Fais d’abord une sauvegarde JSON et évite de synchroniser pendant une séance active.'))return;
     notice('Vérification de la connexion et des données…');
     const s=await token();
     const user=await request('/auth/v1/user','GET',undefined,s.access_token);
     if(!user?.id)throw new Error('Compte utilisateur non confirmé.');
     const local=currentRecords(),cloud=await remoteRecords(s.access_token),memory=read(META,{});
     const baseline=memory?.user_id===user.id && memory?.project===config().url ? (memory.signatures||{}):{};
     const incoming=[],outgoing=[],aligned={},conflicts=[],missing=[];
     const keys=new Set([...local.keys(),...cloud.keys()]);
     for(const key of keys){
       const l=local.get(key),r=cloud.get(key),prev=baseline[key];
       const sl=l?signature(l.payload):null,sr=r?signature(r.payload):null;
       if(l&&r){
         if(sl===sr){aligned[key]=sl;continue;}
         if(prev===sl&&prev!==sr){incoming.push(r);continue;}
         if(prev===sr&&prev!==sl){outgoing.push(l);continue;}
         conflicts.push(key);continue;
       }
       if(l&&!r){outgoing.push(l);continue;}
       if(!l&&r){
         if(prev){missing.push(key);continue;} // Local deletion is never undone silently.
         incoming.push(r);
       }
     }
     if(outgoing.length)await pushRemote(outgoing,s.access_token,user.id);
     if(incoming.length)applyRemote(incoming);
     for(const row of outgoing)aligned[row.category+'|'+row.item_id]=signature(row.payload);
     for(const row of incoming)aligned[row.category+'|'+row.item_id]=signature(row.payload);
     // Keep existing baselines for conflicts and local deletions (to avoid resurrection).
     const next={...baseline,...aligned};
     if(!write(META,{user_id:user.id,project:config().url,signatures:next,updated_at:new Date().toISOString()})){
       throw new Error('Impossible de sauvegarder l’état de synchronisation sur cet appareil.');
     }
     const summary=`Synchronisation terminée : ${outgoing.length} envoyée(s), ${incoming.length} reçue(s), ${Object.keys(aligned).length-outgoing.length-incoming.length} déjà identique(s).`;
     const cautions=[conflicts.length?conflicts.length+' conflit(s) non écrasé(s)':'',missing.length?missing.length+' suppression(s) locale(s) non propagée(s)':''].filter(Boolean);
     notice(summary+(cautions.length?' Attention : '+cautions.join(' ; ')+'.':''),'success');
     if(incoming.length)alert('De nouvelles données ont été récupérées. Recharge l’application pour actualiser les affichages des autres univers.');
   }catch(e){notice('Synchronisation interrompue sans effacement volontaire : '+e.message,'error');}
   finally{busy=false;}
 }
 // Le lien de confirmation de Supabase peut revenir avec un jeton temporaire.
 function receiveEmailCallback(){
   const p=new URLSearchParams((location.hash||'').replace(/^#/,''));
   if(p.get('access_token')&&p.get('refresh_token')){
     storeSession({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),expires_in:Number(p.get('expires_in')||3600)},'');
     history.replaceState(null,'',location.pathname+location.search);
   }
 }
 receiveEmailCallback();
 const previous=render;
 render=function(){
   if(state.view===VIEW){updateShell();renderSync();return;}
   document.body.classList.remove('sy1-active');const result=previous.apply(this,arguments);
   if(state.view==='parametres-global-v1')injectSettingsLink();
   return result;
 };
 window.SportDataBackup={export:exportBackup,keys:SPECS.map(s=>s.key)};
})();
