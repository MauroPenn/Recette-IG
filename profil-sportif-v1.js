/* PROFIL SPORTIF COMMUN V1 — 11/11/2026
   Profil personnel enregistré localement, sans envoi à un serveur.
   Module isolé : les séances précédentes et leur historique ne sont jamais réécrits.
   Réutilisation douce du poids sur les formulaires Calories déjà existants.
*/
(function(){
  'use strict';
  const KEY='mb_profil_sportif_v1';
  const VIEW='profil-sportif-v1';
  const $=selector=>main.querySelector(selector);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getStored=()=>{try{const o=JSON.parse(localStorage.getItem(KEY)||'null');return o&&typeof o==='object'&&!Array.isArray(o)?o:null;}catch(_){return null;}};
  const displayNumber=v=>v==null?'':String(v).replace('.',',');
  const parseNumber=v=>{if(String(v).trim()==='')return null;const n=Number(String(v).trim().replace(',','.'));return Number.isFinite(n)?n:NaN;};
  const validDate=date=>{
    if(typeof date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))return false;
    const d=new Date(date+'T12:00:00');
    if(Number.isNaN(d.getTime())||d.getFullYear()!==Number(date.slice(0,4))||d.getMonth()+1!==Number(date.slice(5,7))||d.getDate()!==Number(date.slice(8,10)))return false;
    const now=new Date();
    const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
    const limit=new Date(now.getFullYear()-110,now.getMonth(),now.getDate(),12);
    return d<=today&&d>=limit;
  };
  const ageAt=(date,on=new Date())=>{
    if(!validDate(date))return null;
    const [year,month,day]=date.split('-').map(Number);
    return on.getFullYear()-year-((on.getMonth()+1<month||(on.getMonth()+1===month&&on.getDate()<day))?1:0);
  };
  const subjectSex={femme:'Femme',homme:'Homme',autre:'Autre',non_precise:'Je préfère ne pas préciser'};
  const shortDate=iso=>{try{return new Date(iso).toLocaleString('fr-FR',{dateStyle:'long',timeStyle:'short'});}catch(_){return '—';}};
  function read(){const p=getStored();return p&&validDate(p.birthDate)&&Number.isFinite(Number(p.weightKg))?p:null;}
  function shell(){
    document.body.classList.add('as1-active','ps1-active');
    document.body.classList.remove('ml1-active','cp-active');
    bottomNav.classList.add('hidden');
  }
  function goto(view,section){
    document.body.classList.remove('ps1-active');
    state.view=view;
    if(section)state.as1Section=section;
    render();window.scrollTo?.(0,0);
  }
  function setStatus(message,kind='info'){
    const node=$('#ps1Status');if(!node)return;
    node.className='ps1-status ps1-status-'+kind;
    node.textContent=message;
    node.hidden=!message;
  }
  function renderProfile(){
    shell();
    const existing=read();
    const today=new Date();
    const maxDate=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    const minDate=[today.getFullYear()-110,String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
    main.innerHTML=`<section class="ps1-screen" aria-label="Mon profil sportif">
      <header class="ps1-hero">
        <button type="button" id="ps1Back" class="ps1-back" aria-label="Retour à Autre sport">←</button>
        <p class="ps1-eyebrow">PARAMÈTRES · SPORT & NUTRITION</p>
        <h1>Mon profil sportif</h1>
        <p>Un seul profil pour toutes tes activités. Tes données restent sur cet appareil.</p>
      </header>
      <div class="ps1-content">
        <div class="ps1-info-banner"><span class="ps1-info-icon" aria-hidden="true">◉</span><div><strong>${existing?'Profil enregistré':'Première configuration'}</strong>
          <p>${existing?'Tes informations sont modifiables à tout moment.':'Complète ton profil pour personnaliser les futures estimations sportives.'}</p></div></div>
        <form id="ps1Form" novalidate>
          <section class="ps1-panel" aria-labelledby="ps1Identity">
            <h2 id="ps1Identity">Informations personnelles</h2>
            <div class="ps1-fields">
              <label class="ps1-field"><span>Date de naissance <em>*</em></span>
                <input id="ps1Birth" type="date" min="${minDate}" max="${maxDate}" required value="${esc(existing?.birthDate||'')}">
              </label>
              <label class="ps1-field"><span>Sexe <em>*</em></span>
                <select id="ps1Sex" required><option value="">Choisir…</option>${Object.keys(subjectSex).map(key=>`<option value="${key}" ${existing?.sex===key?'selected':''}>${subjectSex[key]}</option>`).join('')}</select>
              </label>
              <label class="ps1-field"><span>Poids actuel (kg) <em>*</em></span>
                <input id="ps1Weight" type="text" inputmode="decimal" maxlength="7" autocomplete="off" placeholder="Ex. 80,5" required value="${esc(displayNumber(existing?.weightKg))}">
              </label>
              <label class="ps1-field"><span>Taille (cm) <small>facultatif</small></span>
                <input id="ps1Height" type="text" inputmode="decimal" maxlength="6" autocomplete="off" placeholder="Ex. 175" value="${esc(displayNumber(existing?.heightCm))}">
              </label>
            </div>
            <div class="ps1-age" role="status" id="ps1Age">${existing?`Âge calculé : ${ageAt(existing.birthDate)??'—'} ans`:'L’âge sera calculé automatiquement à partir de ta naissance.'}</div>
          </section>
          <section class="ps1-panel" aria-labelledby="ps1Heart">
            <h2 id="ps1Heart">Fréquence cardiaque</h2>
            <p class="ps1-help">Facultatif. À renseigner si tu connais ta fréquence cardiaque au repos. Cette donnée n'est pas utilisée pour calculer automatiquement les calories dans cette version.</p>
            <label class="ps1-field"><span>Fréquence cardiaque au repos (bpm)</span>
              <input id="ps1Resting" type="text" inputmode="numeric" maxlength="3" placeholder="Ex. 60" value="${esc(displayNumber(existing?.restingHeartRate))}">
            </label>
          </section>
          <section class="ps1-panel ps1-use" aria-labelledby="ps1Using">
            <h2 id="ps1Using">Utilisation dans l’application</h2>
            <div class="ps1-use-row"><span class="ps1-check">✓</span><p>Le <strong>poids</strong> se renseignera automatiquement à la fin des sorties Vélo, VTT, Course et Paddle, dans les champs d’estimation calorique.</p></div>
            <div class="ps1-use-row"><span class="ps1-check">✓</span><p>Une nouvelle valeur de poids s’appliquera aux <strong>prochaines séances</strong>, sans recalculer les anciennes.</p></div>
            <div class="ps1-use-row"><span class="ps1-check">i</span><p>L’âge, le sexe, la taille et la fréquence cardiaque préparent notre futur calcul commun. Les calories restent des <strong>estimations</strong>, pas des mesures exactes.</p></div>
          </section>
          <p id="ps1Status" class="ps1-status" role="status" aria-live="polite" hidden></p>
          <button class="ps1-save" type="submit">✓ ${existing?'Enregistrer les modifications':'Enregistrer mon profil'}</button>
        </form>
        ${existing?`<p class="ps1-updated">Dernière sauvegarde : ${esc(shortDate(existing.updatedAt))}</p>
          <button type="button" class="ps1-delete" id="ps1Delete">Effacer uniquement mon profil sportif</button>`:''}
        <p class="ps1-privacy">🔒 Ces informations sont stockées localement dans ton navigateur. Elles ne se synchronisent pas encore entre tes appareils. Ne supprime pas les données du site sans sauvegarde : le profil serait perdu.</p>
        <button type="button" class="ps1-return" id="ps1Return">← Retour à Autre sport</button>
      </div>
    </section>`;
    $('#ps1Back').addEventListener('click',()=>goto('autre-sport-home'));
    $('#ps1Return').addEventListener('click',()=>goto('autre-sport-home'));
    $('#ps1Birth').addEventListener('input',()=>{
      const birth=$('#ps1Birth').value;
      $('#ps1Age').textContent=validDate(birth)?`Âge calculé : ${ageAt(birth)} ans`:'Renseigne une date de naissance valide.';
    });
    $('#ps1Form').addEventListener('submit',saveProfile);
    $('#ps1Delete')?.addEventListener('click',()=>{
      if(!confirm('Effacer ton profil sportif de cet appareil ? Cela ne supprimera aucune activité ni séance enregistrée.'))return;
      try{localStorage.removeItem(KEY);}catch(_){setStatus('Impossible d’effacer le profil sur cet appareil.','error');return;}
      window.dispatchEvent(new CustomEvent('profil-sportif-change',{detail:{cleared:true}}));
      renderProfile();
    });
  }
  function saveProfile(event){
    event.preventDefault();
    const birthDate=$('#ps1Birth').value;
    const sex=$('#ps1Sex').value;
    const weightKg=parseNumber($('#ps1Weight').value);
    const heightCm=parseNumber($('#ps1Height').value);
    const restingHeartRate=parseNumber($('#ps1Resting').value);
    if(!validDate(birthDate)){setStatus('Vérifie ta date de naissance.','error');$('#ps1Birth').focus();return;}
    if(!Object.hasOwn(subjectSex,sex)){setStatus('Sélectionne une option dans le champ Sexe.','error');$('#ps1Sex').focus();return;}
    if(weightKg===null||!Number.isFinite(weightKg)||weightKg<25||weightKg>300){setStatus('Indique un poids compris entre 25 et 300 kg.','error');$('#ps1Weight').focus();return;}
    if(heightCm!==null&&(!Number.isFinite(heightCm)||heightCm<100||heightCm>250)){setStatus('Indique une taille entre 100 et 250 cm, ou laisse vide.','error');$('#ps1Height').focus();return;}
    if(restingHeartRate!==null&&(!Number.isInteger(restingHeartRate)||restingHeartRate<30||restingHeartRate>160)){setStatus('Fréquence cardiaque au repos : indique entre 30 et 160 bpm, ou laisse vide.','error');$('#ps1Resting').focus();return;}
    const before=getStored();
    const now=new Date().toISOString();
    const next={version:1,birthDate,sex,weightKg:Math.round(weightKg*10)/10,
      heightCm:heightCm==null?null:Math.round(heightCm),restingHeartRate:restingHeartRate??null,
      createdAt:before?.createdAt||now,updatedAt:now};
    try{localStorage.setItem(KEY,JSON.stringify(next));}
    catch(_){setStatus('La sauvegarde locale a échoué. Vérifie l’espace disponible et les réglages du navigateur.','error');return;}
    window.dispatchEvent(new CustomEvent('profil-sportif-change',{detail:{updated:true}}));
    renderProfile();setStatus('Profil enregistré ! Il sera réutilisé lors des prochaines séances.','success');
  }
  function prefillSummaryWeights(){
    const p=read();if(!p||!Number.isFinite(p.weightKg))return;
    // Modules dont l’estimation calories accepte déjà un poids.
    for(const selector of ['#bv1Weight','#vt1Weight','#cr1Weight','#pd1Weight']){
      const input=$(selector);
      if(!input||input.dataset.ps1Visited)continue;
      input.dataset.ps1Visited='1';
      if(input.value.trim())continue; // Respecter toute saisie de l’utilisateur.
      input.value=String(p.weightKg);
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.setAttribute('title','Poids prérempli depuis Mon profil sportif ; modifiable pour cette séance.');
    }
  }
  // API réutilisable par les futurs calculateurs partagés.
  window.SportProfile=Object.freeze({
    get:read,
    age:()=>{const p=read();return p?ageAt(p.birthDate):null;},
    weight:()=>{const p=read();return p?.weightKg??null;},
    getStorageKey:()=>KEY
  });
  const oldRender=render;
  render=function(){
    if(state.view===VIEW || (state.view==='autre-sport-section'&&state.as1Section==='settings')){
      updateShell();renderProfile();return;
    }
    document.body.classList.remove('ps1-active');
    const result=oldRender.apply(this,arguments);
    prefillSummaryWeights();
    return result;
  };
  if(typeof MutationObserver!=='undefined'){
    const observer=new MutationObserver(()=>{
      if(!document.body.classList.contains('ps1-active'))prefillSummaryWeights();
    });
    observer.observe(main,{childList:true,subtree:true});
  }
})();
