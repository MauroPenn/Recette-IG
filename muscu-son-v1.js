/* MUSCULATION — SIGNAUX SONORES V1
   Effets synthétisés avec Web Audio, sans MP3 ni réseau.
   Paramètres locaux ; aucun son tant qu'une séance n'a pas été lancée par l'utilisateur. */
(function(global){
  'use strict';
  const KEY='mb_muscu_sons_v1';
  const DEFAULT={enabled:true,volume:65,countdown:true,finish:true};
  let ctx=null;
  let settings={...DEFAULT};
  const pending=new Set();
  try {
    const saved=JSON.parse(localStorage.getItem(KEY)||'null');
    if(saved && typeof saved==='object'){
      settings={
        enabled:saved.enabled!==false,
        volume:Number.isFinite(Number(saved.volume))?Math.max(0,Math.min(100,Math.round(Number(saved.volume)))):DEFAULT.volume,
        countdown:saved.countdown!==false,
        finish:saved.finish!==false
      };
    }
  }catch(_){}
  const supported=()=>Boolean(global.AudioContext||global.webkitAudioContext);
  function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch(_){}}
  function update(newSettings){
    const next={...settings,...newSettings};
    settings={enabled:next.enabled!==false,volume:Math.max(0,Math.min(100,Number(next.volume)||0)),countdown:next.countdown!==false,finish:next.finish!==false};
    save();
    if(!settings.enabled||settings.volume===0)silence();
    return getSettings();
  }
  const getSettings=()=>({...settings});
  function unlock(){
    if(!supported())return Promise.resolve(null);
    try{
      if(!ctx){const Constructor=global.AudioContext||global.webkitAudioContext;ctx=new Constructor();}
      if(ctx.state==='suspended')return ctx.resume().then(()=>ctx).catch(()=>null);
      return Promise.resolve(ctx);
    }catch(_){return Promise.resolve(null);}
  }
  function tone(context,offset,frequency,length,kind='sine',level=.26){
    const osc=context.createOscillator(),env=context.createGain();
    const start=context.currentTime+Math.max(.005,offset);
    const end=start+length;
    osc.type=kind;osc.frequency.setValueAtTime(frequency,start);
    const vol=Math.min(.33,Math.max(0,settings.volume/100*.24*level));
    env.gain.setValueAtTime(.00001,start);
    env.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),start+.017);
    env.gain.exponentialRampToValueAtTime(.00001,end);
    osc.connect(env);env.connect(context.destination);
    pending.add(osc);
    osc.onended=()=>{pending.delete(osc);try{osc.disconnect();env.disconnect();}catch(_){}};
    osc.start(start);osc.stop(end+.015);
  }
  function silence(){
    for(const o of pending){try{o.stop();}catch(_){}}
    pending.clear();
  }
  // Un signal court et lisible pour chaque action, avec différentes signatures musicales.
  const patterns={
    start: [[0,520,.13],[.17,660,.13],[.34,880,.25]],
    roundStart: [[0,587,.11],[.16,740,.11],[.32,988,.3]],
    exerciseEnd: [[0,820,.14],[.18,620,.29]],
    setEnd: [[0,720,.16],[.20,550,.24]],
    restStart: [[0,445,.15],[.20,370,.20]],
    restEnd: [[0,700,.12],[.17,980,.24]],
    roundEnd: [[0,660,.12],[.16,785,.12],[.32,988,.30]],
    finish: [[0,523,.14],[.16,659,.14],[.32,784,.14],[.50,1046,.35]],
    test: [[0,600,.15],[.20,810,.20]]
  };
  function cue(name){
    if(!settings.enabled||settings.volume===0)return;
    if((name==='finish'||name==='roundEnd')&&!settings.finish)return;
    if(document.visibilityState==='hidden')return;
    const pattern=patterns[name];if(!pattern)return;
    // Appelé directement à la suite du bouton Démarrer, Reprendre ou Tester.
    unlock().then(context=>{
      if(!context||context.state!=='running'||!settings.enabled||settings.volume===0||document.visibilityState==='hidden')return;
      for(const [offset,freq,len] of pattern)tone(context,offset,freq,len,'sine',1);
    }).catch(()=>{});
  }
  function countdown(second){
    if(!settings.enabled||!settings.countdown||settings.volume===0)return;
    if(!Number.isInteger(second)||second<1||second>3||document.visibilityState==='hidden')return;
    unlock().then(context=>{
      if(context&&context.state==='running'&&settings.enabled&&settings.countdown&&settings.volume>0){
        tone(context,0,second===1?1030:880,.11,'sine',.7);
      }
    }).catch(()=>{});
  }
  function openSettings(){
    const previous=document.getElementById('mb-sound-dialog');if(previous)previous.remove();
    const root=document.createElement('div');root.className='mb-sound-overlay';root.id='mb-sound-dialog';
    root.innerHTML=`<div class="mb-sound-dialog" role="dialog" aria-modal="true" aria-labelledby="mbSoundTitle">
      <div class="mb-sound-title"><h2 id="mbSoundTitle">🔊 Sons de séance</h2><button type="button" id="mbSoundClose" aria-label="Fermer les réglages">✕</button></div>
      <label class="mb-sound-check"><input id="mbSoundEnabled" type="checkbox"> Activer les effets sonores</label>
      <div class="mb-sound-volume"><label for="mbSoundVolume">Volume</label><strong id="mbSoundPercent"></strong>
      <input id="mbSoundVolume" type="range" min="0" max="100" step="5"></div>
      <label class="mb-sound-check"><input id="mbSoundCountdown" type="checkbox"> Bips 3, 2, 1 avant la fin des efforts et des pauses</label>
      <label class="mb-sound-check"><input id="mbSoundFinish" type="checkbox"> Son de fin de tour et de séance</label>
      <button type="button" class="mb-sound-test" id="mbSoundTest">▶ Tester le son</button>
      <p class="mb-sound-help">Le son dépend aussi du volume multimédia et du mode silencieux de ton téléphone. Si le navigateur bloque l’audio, lance la séance ou touche « Tester le son ».</p>
      <button type="button" class="mb-sound-done" id="mbSoundDone">Enregistrer et fermer</button>
    </div>`;
    document.body.appendChild(root);
    const q=id=>root.querySelector('#'+id);
    let updated={...settings};
    function sync(){
      q('mbSoundEnabled').checked=updated.enabled;
      q('mbSoundVolume').value=String(updated.volume);
      q('mbSoundPercent').textContent=updated.volume+' %';
      q('mbSoundCountdown').checked=updated.countdown;
      q('mbSoundFinish').checked=updated.finish;
      q('mbSoundVolume').disabled=!updated.enabled;
      q('mbSoundCountdown').disabled=!updated.enabled;
      q('mbSoundFinish').disabled=!updated.enabled;
      q('mbSoundTest').disabled=!updated.enabled||updated.volume===0||!supported();
    }
    function persist(){update(updated);}
    function close(){persist();root.remove();}
    q('mbSoundEnabled').addEventListener('change',e=>{updated.enabled=e.target.checked;persist();sync();});
    q('mbSoundVolume').addEventListener('input',e=>{updated.volume=Number(e.target.value);persist();sync();});
    q('mbSoundCountdown').addEventListener('change',e=>{updated.countdown=e.target.checked;persist();sync();});
    q('mbSoundFinish').addEventListener('change',e=>{updated.finish=e.target.checked;persist();sync();});
    q('mbSoundTest').addEventListener('click',()=>{persist();cue('test');});
    q('mbSoundClose').addEventListener('click',close);
    q('mbSoundDone').addEventListener('click',close);
    root.addEventListener('click',e=>{if(e.target===root)close();});
    if(!supported())q('mbSoundTest').textContent='Audio non pris en charge par ce navigateur';
    sync();q('mbSoundClose').focus();
  }
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')silence();});
  global.MuscuSons={unlock,cue,countdown,openSettings,silence,getSettings,update,supported};
})(window);
