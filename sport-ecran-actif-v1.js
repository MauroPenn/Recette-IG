/* AUTRE SPORT — Screen Wake Lock V1 (partagé par les futurs sports GPS).
   Le navigateur peut refuser ou libérer le verrouillage, notamment en économie d'énergie.
   Cette API maintient l'ÉCRAN allumé, pas le GPS en arrière-plan ni le processeur.
   À appeler avec .start() au début d'une séance et .stop() à la fin/en pause. */
(function(global){
  'use strict';
  let wanted=false;
  let sentinel=null;
  let pending=false;
  let generation=0;
  let currentStatus='off';
  const handlers=new Set();
  const emit=status=>{
    currentStatus=status;
    handlers.forEach(fn=>{try{fn(status);}catch(_){}});
  };
  const visible=()=>document.visibilityState==='visible';
  const supported=()=>Boolean(global.isSecureContext && navigator.wakeLock && typeof navigator.wakeLock.request==='function');

  async function acquire(){
    if(!wanted || !visible())return;
    if(sentinel && !sentinel.released){emit('active');return;}
    if(pending)return;
    if(!supported()){emit('unsupported');return;}
    const ticket=++generation;
    pending=true;
    emit('requesting');
    try{
      const lock=await navigator.wakeLock.request('screen');
      if(!wanted || !visible() || ticket!==generation){
        await lock.release();
        return;
      }
      sentinel=lock;
      lock.addEventListener('release',()=>{
        if(sentinel!==lock)return;
        sentinel=null;
        emit(wanted ? (visible()?'released':'hidden') : 'off');
      });
      emit('active');
    }catch(_){
      if(wanted && ticket===generation)emit(visible()?'unavailable':'hidden');
    }finally{
      pending=false;
      // If a previous start was replaced by stop + start during the request,
      // ensure that the NEW activity gets its own fresh wake lock.
      if(wanted && visible() && ticket!==generation)acquire();
    }
  }
  function start(){
    wanted=true;
    acquire();
  }
  function stop(){
    wanted=false;
    generation++;
    const lock=sentinel;
    sentinel=null;
    emit('off');
    if(lock && !lock.released){lock.release().catch(()=>{});}
  }
  function onVisibility(){
    if(!visible()){
      const lock=sentinel;
      sentinel=null;
      if(lock && !lock.released)lock.release().catch(()=>{});
      emit(wanted?'hidden':'off');
    }else if(wanted){
      acquire();
    }
  }
  document.addEventListener('visibilitychange',onVisibility);
  global.addEventListener('pagehide',stop);
  global.SportScreenAwake={
    start,stop,
    getStatus:()=>currentStatus,
    onChange(fn){
      if(typeof fn!=='function')return ()=>{};
      handlers.add(fn);
      return ()=>handlers.delete(fn);
    }
  };
})(window);
