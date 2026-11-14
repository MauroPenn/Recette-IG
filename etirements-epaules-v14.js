/* Sport & Nutrition / Épaules & bras V14 – correctif ciblé BANDEAUX uniquement, 14/11/2026.
   - Corrige uniquement la vue liste Épaules & bras.
   - Remplace l’en-tête et les 10 bandeaux par des images V14 au fondu/paysage validés.
   - Ne modifie PAS les fiches d’exercices. */
(function(){
  'use strict';
  const LIST='etirements-epaules-liste', DETAIL='etirements-epaules-fiche';
  const IDS=['cercles','haussement','deltoide','triceps','ouverture-poitrine','avantbras','triceps-haut','ouverture-epaules','biceps-mur','epaule-croisee'];
  const NAMES=['Cercles d’épaules','Haussement et relâchement','Étirement du deltoïde','Étirement des triceps','Ouverture poitrine et biceps','Étirement des avant-bras','Étirement du triceps au-dessus de la tête','Ouverture des épaules','Étirement des biceps contre le mur','Étirement croisé de l’épaule'];
  const img=(n)=>'./etirements-epaules-'+n+'-v14.webp?v=14';
  function go(view,id){
    if(id) state.eeb1Selected=id;
    state.view=view; state.selected=null;
    render();
    try{ window.scrollTo({top:0,behavior:'instant'}); }catch(e){ try{ window.scrollTo(0,0); }catch(_){} }
  }
  function makeImage(path){
    const image=document.createElement('img');
    image.src=img(path); image.alt=''; image.draggable=false;
    image.decoding='async'; image.loading='eager';
    return image;
  }
  function list(){
    document.body.classList.add('ez1-active');
    if(typeof updateShell==='function') updateShell();
    if(typeof bottomNav!=='undefined') bottomNav.classList.add('hidden');
    main.replaceChildren();
    const root=document.createElement('section'); root.className='ev14-screen';
    root.setAttribute('aria-label','Étirements Épaules et bras : dix exercices');

    const back=document.createElement('button'); back.type='button'; back.className='ev14-back';
    back.textContent='← Retour aux Exercices';
    back.addEventListener('click',()=>go('etirements-exercices'));
    root.appendChild(back);

    const hero=document.createElement('div'); hero.className='ev14-header';
    hero.appendChild(makeImage('entete'));
    root.appendChild(hero);

    const group=document.createElement('div'); group.className='ev14-list';
    NAMES.forEach((name,i)=>{
      const btn=document.createElement('button'); btn.type='button'; btn.className='ev14-card';
      btn.setAttribute('aria-label','Ouvrir la fiche : '+name);
      btn.appendChild(makeImage('bandeau-'+(i+1)));
      btn.addEventListener('click',()=>go(DETAIL,IDS[i]));
      group.appendChild(btn);
    });
    root.appendChild(group);

    const footer=document.createElement('footer'); footer.className='ev14-footer';
    footer.textContent='SPORT & NUTRITION · ÉTIREMENTS · ÉPAULES & BRAS';
    root.appendChild(footer);
    main.appendChild(root);
  }
  const style=document.createElement('style');
  style.textContent=`
  body.ez1-active #main:has(.ev14-screen){margin:0!important;padding:0!important;width:100%!important;max-width:none!important;min-height:100dvh;background:#003a34;}
  .ev14-screen,.ev14-screen *{box-sizing:border-box;}
  .ev14-screen{width:100%;max-width:720px;min-height:100dvh;margin:0 auto;padding:12px 0 26px;display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);background:#003a34;color:white;}
  .ev14-back{align-self:flex-start;margin:3px 3% 0;min-height:47px;padding:10px 17px;background:#07483e;border:2px solid #eaba79;border-radius:28px;color:white;font-family:inherit;font-weight:700;font-size:clamp(15px,3.9vw,21px);line-height:1.25;cursor:pointer;}
  .ev14-header,.ev14-card{display:block;position:relative;flex:0 0 auto;width:100%;margin:0;padding:0;border:0;background:none;line-height:0;overflow:hidden;}
  .ev14-header{aspect-ratio:941/388;}
  .ev14-list{display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);width:100%;}
  .ev14-card{aspect-ratio:941/319;height:auto;cursor:pointer;touch-action:manipulation;}
  .ev14-header>img,.ev14-card>img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;pointer-events:none;user-select:none;}
  .ev14-card:active{filter:brightness(1.12)}
  .ev14-card:focus-visible,.ev14-back:focus-visible{outline:3px solid #fff0bd;outline-offset:2px;}
  .ev14-footer{text-align:center;font-weight:750;letter-spacing:.02em;color:#f1cc97;border-top:1px solid #d6b177;font-size:clamp(11px,2.5vw,14px);margin:16px 4% 0;padding:20px 5px 7px;}
  @media(min-width:760px){.ev14-screen{border-radius:22px;padding:18px 0 30px;}}
  `;
  document.head.appendChild(style);
  const previousRender=render;
  render=function(){
    if(state.view===LIST) return list();
    return previousRender.apply(this,arguments);
  };
})();
