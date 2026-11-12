/* Sport & Nutrition — Connexion simple V3 (13 novembre 2026)
 * Complement isolé : interface compte, configuration publique une seule fois.
 * Respecte la session, les donnees locales, les historiques et la sync V1.
 * Google n'est volontairement pas activé avant configuration OAuth et liens de comptes.
 */
(function(){
  'use strict';
  const CFG='mb_sync_config_v1';
  const SESSION='mb_sync_session_v1';
  const PUBLIC_FILE='./supabase-public-config.json?v=1';
  const page=document.getElementById('main');
  let remoteConfigAvailable=false;

  function stored(name){
    try {return JSON.parse(localStorage.getItem(name)||'null');}
    catch(_){return null;}
  }
  function valid(x){
    return !!(x && typeof x==='object' &&
      /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(x.url||'') &&
      /^sb_publishable_[A-Za-z0-9_-]+$/.test(x.key||''));
  }
  function css(){
    if(document.getElementById('sn3-styles'))return;
    const el=document.createElement('style');el.id='sn3-styles';
    el.textContent=`
      .sn3-account{border:2px solid #76e2ba;border-radius:20px;padding:21px 16px;
       background:linear-gradient(130deg,#096c60,#064651);display:grid;gap:12px;color:#fff}
      .sn3-account h2{margin:0;color:#fff;font-size:1.45rem;line-height:1.2}
      .sn3-subtitle{margin:0;color:#d7fff1;font-size:.88rem;line-height:1.45}
      .sn3-label{font-size:.75rem;letter-spacing:.11em;font-weight:750;color:#b4f5db}
      .sn3-account .sy1-credentials,.sn3-account .sy1-actions{margin:0}
      .sn3-account .sy1-credentials label{font-size:.92rem}
      .sn3-account .sy1-actions button{min-width:0}
      .sn3-account .sy1-actions button[hidden],.sn3-account [hidden]{display:none!important}
      .sn3-signedin{background:#075343;border:1px solid #64d9ac;border-radius:12px;padding:12px;
       font-weight:750;overflow-wrap:anywhere;color:#e6ffef;font-size:.91rem}
      .sn3-advanced-toggle{width:100%;border-radius:12px;border:1px solid #5c9e99;
       background:#084f55;color:#e1f5f0;text-align:center;font:700 .89rem system-ui;padding:12px;cursor:pointer}
      .sn3-advanced-panel[hidden]{display:none!important}
      .sn3-publish{background:#063c42;border:1px solid #519c91;border-radius:14px;
       padding:13px;display:grid;gap:9px}
      .sn3-publish strong{font-size:.9rem}
      .sn3-publish p{margin:0;color:#d2ede5;font-size:.8rem;line-height:1.45}
      .sn3-publish button{width:100%;min-height:46px;border-radius:11px;padding:10px 12px;
       color:#fff;background:#087a79;border:1px solid #a0dfc9;font:750 .89rem system-ui;cursor:pointer}
      .sn3-caption{font-size:.76rem;line-height:1.4;color:#c1e3da;margin:0}
      .gs1-screen #sy1SettingsLink strong{font-size:1rem}
    `;
    document.head.append(el);
  }
  function message(txt,type='success'){
    const box=page.querySelector('#sy1Notice');
    if(!box){alert(txt);return;}
    box.textContent=txt;box.className='sy1-notice sy1-'+type;box.hidden=false;
  }
  async function importPublishedConfig(){
    try{
      // Fichier public du propre site, jamais un lien externe ou un secret.
      const response=await fetch(PUBLIC_FILE,{cache:'no-store'});
      if(!response.ok)return;
      const txt=await response.text();
      if(txt.length>5000)return;
      const obj=JSON.parse(txt);
      if(!valid(obj))return;
      remoteConfigAvailable=true;
      const existing=stored(CFG);
      // Ne jamais changer silencieusement un projet deja configure.
      if(valid(existing))return;
      localStorage.setItem(CFG,JSON.stringify({url:obj.url.replace(/\/$/,''),key:obj.key}));
      // Le compte reste deconnecte sur cet appareil : connexion utilisateur requise.
      if(typeof state!=='undefined' && state.view==='synchronisation-v1'){
        const focus=document.activeElement;
        if(!focus || !page.contains(focus) || focus.tagName!=='INPUT')render();
      }
    }catch(_){/* fonctionnalite facultative tant que le fichier public n'est pas publie */}
  }
  function downloadPublicConfig(){
    const c=stored(CFG);
    if(!valid(c)){message('Configure d’abord Supabase sur ce téléphone.','error');return;}
    const data={url:c.url.replace(/\/$/,''),key:c.key};
    const raw=JSON.stringify(data,null,2)+'\n';
    if(/access_token|refresh_token|sb_secret_|service_role|password/i.test(raw)){
      message('Configuration non partageable : contenu inattendu.','error');return;
    }
    const blob=new Blob([raw],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='supabase-public-config.json';
    a.style.display='none';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    message('Fichier public téléchargé. Il reste à déposer supabase-public-config.json une seule fois dans GitHub, à la racine du dépôt Recette-IG. Aucun mot de passe n’y figure.','success');
  }
  function improveSettings(){
    const tile=page.querySelector('#sy1SettingsLink');
    if(!tile)return;
    const title=tile.querySelector('strong');
    const desc=tile.querySelector('small');
    if(title && title.textContent!=='Mon compte et synchronisation')title.textContent='Mon compte et synchronisation';
    if(desc && desc.textContent!=='Connexion personnelle, sauvegardes et activités sur tous tes appareils')desc.textContent='Connexion personnelle, sauvegardes et activités sur tous tes appareils';
  }
  function improveSync(){
    css();
    const screen=page.querySelector('.sy1-screen');
    if(!screen || screen.querySelector('#sn3Account'))return;
    const content=screen.querySelector('.sy1-content');
    const panels=screen.querySelectorAll('.sy1-panel');
    const backup=panels[0],cloud=panels[1];
    if(!content||!backup||!cloud)return;
    const creds=cloud.querySelector('.sy1-credentials');
    const actions=cloud.querySelector('.sy1-actions');
    if(!creds||!actions)return;
    const account=document.createElement('section');
    account.className='sn3-account';account.id='sn3Account';
    account.setAttribute('aria-label','Mon compte Sport et Nutrition');
    const caption=document.createElement('div');
    caption.innerHTML='<div class="sn3-label">MON ESPACE PERSONNEL</div><h2>Mon compte</h2><p class="sn3-subtitle">Un seul compte pour retrouver tes séances, activités et parcours sur tes appareils.</p>';
    account.append(caption);
    const s=stored(SESSION);
    const connected=Boolean(s?.refresh_token);
    const originalStatus=Array.from(cloud.querySelectorAll('p.sy1-ok')).find(x=>x.textContent.includes('Compte connecté'));
    if(connected){
      const status=document.createElement('div');status.className='sn3-signedin';
      status.textContent='✓ Connecté'+(s.email?' : '+s.email:'');
      account.append(status);
      if(originalStatus)originalStatus.remove();
    }else{
      const help=document.createElement('p');help.className='sn3-caption';
      help.textContent=valid(stored(CFG))
        ?'Connecte-toi avec le compte Sport & Nutrition que tu as déjà créé. Ne crée pas de second compte.'
        :'La connexion automatique sera disponible après publication de la configuration publique sur GitHub.';
      account.append(help);
    }
    account.append(creds,actions);
    // Les boutons et champs sont déplacés, pas recréés : leurs gestionnaires restent actifs.
    creds.hidden=connected;
    const login=account.querySelector('#sy1SignIn');
    const signup=account.querySelector('#sy1SignUp');
    const signout=account.querySelector('#sy1SignOut');
    if(login)login.hidden=connected;
    if(signup)signup.hidden=connected;
    if(signout)signout.hidden=!connected;
    if(!connected && !valid(stored(CFG))){
      if(login)login.disabled=true;
      if(signup)signup.disabled=true;
    }
    const config=stored(CFG);
    if(valid(config)){
      const publish=document.createElement('div');publish.className='sn3-publish';
      const top=document.createElement('strong');
      top.textContent=remoteConfigAvailable?'✓ Connexion automatique configurée sur GitHub':'Configuration unique de notre application';
      const help=document.createElement('p');
      help.textContent=remoteConfigAvailable
        ?'Les prochains appareils peuvent trouver la configuration Supabase sans saisie manuelle.'
        :'Pour éviter les réglages sur chaque appareil, télécharge ce fichier public sur ton téléphone, puis place-le une seule fois dans notre dépôt GitHub.';
      publish.append(top,help);
      if(!remoteConfigAvailable){
        const btn=document.createElement('button');btn.type='button';btn.id='sn3DownloadConfig';
        btn.textContent='↓ Préparer le fichier public pour GitHub';
        btn.addEventListener('click',downloadPublicConfig);publish.append(btn);
      }
      account.append(publish);
    }
    content.insertBefore(account,backup);
    // Les reglages purement techniques restent accessibles, mais ne gênent plus le parcours normal.
    cloud.classList.add('sn3-advanced-panel');cloud.hidden=true;
    const toggle=document.createElement('button');toggle.type='button';
    toggle.className='sn3-advanced-toggle';toggle.id='sn3Toggle';
    toggle.textContent='Afficher les réglages techniques (facultatif)';
    toggle.addEventListener('click',()=>{
      cloud.hidden=!cloud.hidden;
      toggle.textContent=cloud.hidden?'Afficher les réglages techniques (facultatif)':'Masquer les réglages techniques';
    });
    content.insertBefore(toggle,cloud);
    // Reclasser le titre de la sauvegarde; les fonctions restent inchangées.
    const backupTitle=backup.querySelector('h2');
    if(backupTitle)backupTitle.textContent='Sauvegarde de sécurité';
    const heroTitle=screen.querySelector('.sy1-hero h1');
    if(heroTitle)heroTitle.textContent='Mon compte et synchronisation';
  }
  // Scripts existants conservés, l'intervention porte sur l'interface uniquement.
  const previousRender=render;
  render=function(){
    const result=previousRender.apply(this,arguments);
    if(state.view==='parametres-global-v1')improveSettings();
    if(state.view==='synchronisation-v1')improveSync();
    return result;
  };
  // L'ancienne V1 peut recalculer son écran directement après connexion ou déconnexion.
  // Ce contrôle réapplique notre présentation sans jamais modifier ses mécanismes d'auth.
  const watch=new MutationObserver(()=>{
    if(state.view==='synchronisation-v1')improveSync();
    else if(state.view==='parametres-global-v1')improveSettings();
  });
  watch.observe(page,{subtree:true,childList:true});
  // Ne transmet pas la session depuis le téléphone : chaque appareil doit s'identifier.
  importPublishedConfig();
})();
