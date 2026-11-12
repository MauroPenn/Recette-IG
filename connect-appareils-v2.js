/* Sport & Nutrition — Connexion simplifiée entre appareils V2.
 * Ajout non intrusif : ne modifie ni les historiques ni les donnees sportives.
 * Le lien transfere uniquement l'URL de Supabase et la cle publishable.
 * Il ne transfere jamais de mot de passe, de token de session ou de donnees.
 */
(function(){
  'use strict';
  const CFG='mb_sync_config_v1';
  const SESSION='mb_sync_session_v1';
  const VIEW='synchronisation-v1';
  const mainNode=document.getElementById('main');
  const safeGet=()=>{try{return JSON.parse(localStorage.getItem(CFG)||'null');}catch(_){return null;}};
  const valid=c=>Boolean(c&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(c.url||'')
    && /^sb_publishable_[A-Za-z0-9_-]+$/.test(c.key||''));
  const normalizedPath=p=>p.replace(/index[.]html$/,'').replace(/[/]$/,'');
  const show= (message,type='success')=>{
    const box=mainNode.querySelector('#sy1Notice');
    if(!box)return;
    box.textContent=message; box.className='sy1-notice sy1-'+type;box.hidden=false;
  };
  function makeLink(){
    const cfg=safeGet();
    if(!valid(cfg))throw new Error('Configure d’abord Supabase sur ce telephone.');
    const code=btoa(JSON.stringify({v:1,url:cfg.url,key:cfg.key}))
      .replace(/[+]/g,'-').replace(/[/]/g,'_').replace(/=+$/,'');
    return location.origin+location.pathname+'#mbsync='+code;
  }
  function parseLink(text){
    let u;
    try{u=new URL(String(text||'').trim());}
    catch(_){throw new Error('Adresse de transfert non reconnue.');}
    if(u.origin!==location.origin||normalizedPath(u.pathname)!==normalizedPath(location.pathname))
      throw new Error('Le lien ne correspond pas a notre application.');
    if(!u.hash.startsWith('#mbsync='))throw new Error('Ce n’est pas un lien de configuration.');
    const code=u.hash.slice('#mbsync='.length);
    if(!/^[A-Za-z0-9_-]{20,4096}$/.test(code))throw new Error('Code de transfert invalide.');
    let data;
    try{data=JSON.parse(atob(code.replace(/-/g,'+').replace(/_/g,'/')));}
    catch(_){throw new Error('Code de transfert illisible.');}
    if(data?.v!==1||!valid(data))throw new Error('Configuration publique invalide.');
    return {url:data.url.replace(/[/]$/,''),key:data.key};
  }
  function saveSharedConfig(data){
    if(!confirm('Importer les réglages publics Supabase ? Accepte uniquement si ce lien vient de ton propre téléphone.'))return false;
    const previous=safeGet();
    if(previous?.url===data.url&&previous?.key===data.key)return true;
    try{
      localStorage.setItem(CFG,JSON.stringify(data));
      // Aucune session n'est transferee. Une ancienne session est retiree
      // seulement si ce projet differe de celui configure auparavant.
      if(previous&&(previous.url!==data.url||previous.key!==data.key))localStorage.removeItem(SESSION);
    }catch(_){throw new Error('Le navigateur ne permet pas d’enregistrer la configuration.');}
    return true;
  }
  function openSync(message,type){
    try{state.view=VIEW;render();show(message,type);window.scrollTo(0,0);}
    catch(_){alert(message);}
  }
  async function copyLink(){
    try{
      const link=makeLink();
      if(!navigator.clipboard?.writeText)throw new Error('Copie non disponible : utilise le bouton Partager.');
      await navigator.clipboard.writeText(link);
      show('Lien copie ! Colle-le dans cette conversation ChatGPT sur ton telephone puis ouvre-le sur la tablette.');
    }catch(e){show(e.message,'error');}
  }
  async function shareLink(){
    try{
      const link=makeLink();
      if(navigator.share){
        try{
          await navigator.share({title:'Sport & Nutrition — connexion tablette',
            text:'Ouvre ce lien sur la tablette pour recuperer la configuration publique. Aucun mot de passe n’est partage.',url:link});
          show('Lien partage. Ouvre-le sur la tablette et confirme son importation.');
          return;
        }catch(e){if(e?.name==='AbortError')return;}
      }
      await copyLink();
    }catch(e){show(e.message,'error');}
  }
  function importTextLink(){
    try{
      const data=parseLink(mainNode.querySelector('#sy2Paste')?.value);
      if(!saveSharedConfig(data))return;
      openSync('Configuration importee ! Connecte-toi avec ton compte Sport & Nutrition existant (pas Créer mon compte).','success');
    }catch(e){show('Import impossible : '+e.message,'error');}
  }
  function addStyles(){
    if(document.getElementById('sy2Style'))return;
    const style=document.createElement('style');style.id='sy2Style';
    style.textContent='.sy2-box{border:1px solid #31ab9e;border-radius:14px;background:#075553;padding:14px;margin:14px 0;display:grid;gap:9px}.sy2-box[hidden]{display:none}.sy2-box strong{color:#fff}.sy2-box p{margin:0!important}.sy2-box .sy1-secondary{margin:0}.sy2-receive{margin-top:8px!important}.sy2-receive summary{cursor:pointer;font-weight:750}.sy2-receive input{display:block;margin:10px 0;width:100%;border-radius:10px;padding:12px}';
    document.head.appendChild(style);
  }
  function inject(){
    const root=mainNode.querySelector('.sy1-screen');
    if(!root||root.querySelector('#sy2Share'))return;
    const panel=root.querySelectorAll('.sy1-panel')[1];
    if(!panel)return;
    addStyles();
    const el=document.createElement('div');
    el.innerHTML=`<div class="sy2-box" ${valid(safeGet())?'':'hidden'}>
      <strong>Connecter ma tablette facilement</strong>
      <p class="sy1-small">Partage uniquement la configuration publique Supabase, sans mot de passe ni historique.</p>
      <button type="button" id="sy2Share" class="sy1-secondary">↗ Partager vers ma tablette</button>
      <button type="button" id="sy2Copy" class="sy1-secondary">Copier le lien de configuration</button>
      </div>
      <details class="sy1-details sy2-receive"><summary>Recevoir un lien sur cet appareil</summary>
      <p class="sy1-small">Si le lien ne s'ouvre pas dans l'application installée, colle-le ici.</p>
      <input id="sy2Paste" type="text" autocomplete="off" spellcheck="false" placeholder="Coller le lien reçu">
      <button type="button" id="sy2Import" class="sy1-secondary">Importer la configuration</button>
      </details>`;
    const credentials=panel.querySelector('.sy1-credentials');
    for(const child of [...el.children])panel.insertBefore(child,credentials);
    panel.querySelector('#sy2Share').addEventListener('click',shareLink);
    panel.querySelector('#sy2Copy').addEventListener('click',copyLink);
    panel.querySelector('#sy2Import').addEventListener('click',importTextLink);
  }
  let pending=null;
  if(location.hash.startsWith('#mbsync=')){
    try{
      const data=parseLink(location.href);
      pending=saveSharedConfig(data)
        ?{text:'Configuration publique reçue ! Connecte-toi avec ton compte existant.',type:'success'}
        :{text:'Transfert annule, aucun reglage modifie.',type:'info'};
    }catch(e){pending={text:'Lien de transfert invalide : '+e.message,type:'error'};}
    history.replaceState(null,'',location.pathname+location.search);
  }
  const observer=new MutationObserver(()=>{
    inject();
    if(pending&&mainNode.childElementCount){
      const result=pending;pending=null;
      setTimeout(()=>openSync(result.text,result.type),0);
    }
  });
  observer.observe(mainNode,{subtree:true,childList:true});
  inject();
})();
