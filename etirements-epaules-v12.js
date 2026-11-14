/* Sport & Nutrition — Étirements / Épaules & bras V12 — 14/11/2026.
   Réglage VISUEL uniquement après le correctif V11 :
   - Les 10 bandeaux individuels gardent le ratio et leur affichage complet, sans étirement.
   - Les fiches héritent du style aéré de Nuque & cervicales : titres lisibles,
     panneau « Comment faire », conseils, bienfaits, 4 informations bien visibles.
   - Les 10 textes, la navigation, la vidéo et les données restent gérés par V1.
   - Rien n'est changé dans Musculation, HIIT, Cuisine, les séances ou la synchro. */
(function () {
  'use strict';
  const LIST='etirements-epaules-liste';
  const DETAIL='etirements-epaules-fiche';
  const IDS=['cercles','haussement','deltoide','triceps','ouverture-poitrine','avantbras','triceps-haut','ouverture-epaules','biceps-mur','epaule-croisee'];
  const css=document.createElement('style');
  css.id='etirements-epaules-v12-style';
  css.textContent=`
  /* Les mêmes proportions de bandeaux que Nuque & cervicales, sans écrasement. */
  body.ez1-active .ev11-screen{width:100%;max-width:720px;margin:0 auto;background:#003a34;overflow-x:hidden;}
  body.ez1-active .ev11-list{width:100%;display:flex;flex-direction:column;gap:clamp(12px,2.8vw,21px);}
  body.ez1-active .ev11-list .ev11-card{
    display:block;width:100%;min-width:0;max-width:100%;height:auto!important;
    aspect-ratio:941/319!important;position:relative;flex:0 0 auto!important;
    padding:0!important;margin:0!important;overflow:hidden;line-height:0;
    border:0!important;background:transparent!important;
  }
  body.ez1-active .ev11-card img{
    display:block!important;width:100%!important;height:100%!important;
    object-fit:contain!important;object-position:center center!important;
    transform:none!important;filter:none!important;pointer-events:none;
  }
  body.ez1-active .ev11-header{
    display:block!important;width:100%;height:auto!important;aspect-ratio:941/388;
    overflow:hidden;line-height:0;margin:0;
  }
  body.ez1-active .ev11-header img{display:block;width:100%!important;height:100%!important;object-fit:contain!important;transform:none!important;}
  /* Fiches — mêmes sections que le module validé Nuque & cervicales. */
  body.ez1-active #main:has(.ev12-fiche){margin:0!important;padding:0!important;width:100%!important;max-width:none!important;background:#003a34;}
  body.ez1-active .ev12-fiche{
    box-sizing:border-box!important;width:100%;max-width:720px;margin:0 auto;
    display:flex!important;flex-direction:column!important;
    gap:clamp(13px,2.9vw,22px)!important;padding:12px 0 30px!important;
    color:#fff;background:#003a34;
  }
  .ev12-fiche *, .ev12-fiche *:before,.ev12-fiche *:after{box-sizing:border-box;}
  .ev12-fiche .eeb1-detail-return{
    display:block!important;align-self:flex-start!important;min-height:43px!important;
    margin:3px 3.1% 0!important;padding:9px 16px!important;
    border:2px solid #dfb575!important;border-radius:25px!important;
    background:#064b3f!important;color:white!important;
    font-size:clamp(.91rem,3.5vw,1.17rem)!important;font-weight:750!important;
    line-height:1.2!important;
  }
  .ev12-fiche .eeb1-hero{
    width:96%!important;margin:0 2%!important;min-height:clamp(219px,39vw,353px)!important;
    height:auto!important;aspect-ratio:auto!important;
    border:2px solid #e8b777!important;border-radius:22px!important;
    background-position:right center!important;background-repeat:no-repeat!important;
    background-size:cover!important;overflow:hidden!important;
    display:flex!important;justify-content:flex-start!important;align-items:center!important;
  }
  .ev12-fiche .eeb1-hero-copy{
    display:block!important;box-sizing:border-box!important;
    min-width:0!important;width:60%!important;max-width:60%!important;
    padding:22px 1% 22px 4%!important;z-index:1;overflow:visible!important;
  }
  .ev12-fiche .eeb1-hero-kicker{
    color:#eec286!important;font-weight:850!important;letter-spacing:.018em!important;
    font-size:clamp(.67rem,2.1vw,1rem)!important;line-height:1.2!important;
    white-space:normal!important;overflow:visible!important;margin:0 0 9px!important;
  }
  .ev12-fiche .eeb1-hero h1{
    display:block!important;max-height:none!important;max-width:100%!important;
    margin:0 0 10px!important;padding:0!important;white-space:normal!important;
    color:#fff!important;font-weight:850!important;
    font-size:clamp(1.41rem,4.6vw,2.48rem)!important;line-height:1.12!important;
    overflow-wrap:normal!important;word-break:normal!important;hyphens:auto!important;
    text-overflow:clip!important;overflow:visible!important;
  }
  .ev12-fiche .eeb1-mark{height:4px!important;width:34%!important;min-width:54px!important;border-radius:8px!important;margin:0 0 10px!important;background:#eebb77!important;}
  .ev12-fiche .eeb1-hero p{
    color:#fff!important;margin:0!important;font-size:clamp(.85rem,2.45vw,1.17rem)!important;
    line-height:1.31!important;white-space:normal!important;overflow:visible!important;
  }
  .ev12-fiche .eeb1-stats{
    width:96%!important;margin:0 2%!important;padding:0!important;
    display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:clamp(4px,1.2vw,10px)!important;align-items:stretch!important;
  }
  .ev12-fiche .eeb1-stat{
    width:auto!important;min-width:0!important;min-height:clamp(72px,9vw,91px)!important;
    padding:clamp(4px,.8vw,9px)!important;
    display:flex!important;align-items:center!important;gap:clamp(4px,.7vw,9px)!important;
    overflow:hidden!important;border:1.5px solid #e5b477!important;border-radius:14px!important;
    background:#064d40!important;
  }
  .ev12-fiche .eeb1-stat img{
    display:block!important;flex:none!important;width:clamp(27px,6.6vw,57px)!important;
    height:clamp(27px,6.6vw,57px)!important;max-width:37%!important;
    object-fit:contain!important;border-radius:9px!important;
  }
  .ev12-fiche .eeb1-stat div{min-width:0!important;flex:1!important;overflow-wrap:break-word!important;}
  .ev12-fiche .eeb1-stat span{
    display:block!important;color:#fff!important;font-size:clamp(.59rem,1.7vw,.93rem)!important;
    line-height:1.12!important;white-space:normal!important;
  }
  .ev12-fiche .eeb1-stat strong{
    display:block!important;font-size:clamp(.62rem,2vw,1.1rem)!important;
    line-height:1.19!important;white-space:normal!important;overflow-wrap:break-word!important;
    margin-top:3px!important;color:#fff!important;
  }
  .ev12-fiche .eeb1-panel{
    width:96%!important;margin:0 2%!important;
    padding:clamp(14px,2.3vw,21px)!important;
    border:2px solid #e5b477!important;border-radius:22px!important;
    background:linear-gradient(120deg,#06493d,#0e5949)!important;
    overflow:visible!important;
  }
  .ev12-fiche .eeb1-panel-title{display:flex!important;align-items:center!important;gap:clamp(10px,2vw,18px)!important;margin-bottom:8px!important;}
  .ev12-fiche .eeb1-panel-title h2{
    color:white!important;font-size:clamp(1.25rem,4vw,2rem)!important;
    line-height:1.14!important;margin:0!important;white-space:normal!important;
  }
  .ev12-fiche .eeb1-symbol{
    width:clamp(39px,7vw,57px)!important;height:clamp(39px,7vw,57px)!important;
    flex:0 0 clamp(39px,7vw,57px)!important;
    border-radius:11px!important;font-size:clamp(1.5rem,3.4vw,2.1rem)!important;
    background:#da983e!important;
  }
  .ev12-fiche .eeb1-howto ol{margin:8px 0 0!important;padding:0 0 0 clamp(41px,6vw,66px)!important;}
  .ev12-fiche .eeb1-howto li{
    color:#fff!important;line-height:1.42!important;
    font-size:clamp(.94rem,2.6vw,1.23rem)!important;
    padding:3px 0!important;margin:0 0 3px!important;
  }
  .ev12-fiche .eeb1-howto li::before{
    width:clamp(24px,3.5vw,32px)!important;height:clamp(24px,3.5vw,32px)!important;
    left:calc(-1*clamp(38px,5vw,49px))!important;top:4px!important;font-size:clamp(.82rem,2.3vw,1.1rem)!important;
    background:#db993d!important;
  }
  .ev12-fiche .eeb1-panel ul{
    font-size:clamp(.94rem,2.6vw,1.23rem)!important;
    line-height:1.45!important;margin:7px 0!important;
    padding-left:clamp(44px,7.2vw,70px)!important;
  }
  .ev12-fiche .eeb1-benefits-row{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:0!important;}
  .ev12-fiche .eeb1-benefits-row>div{min-width:0!important;white-space:normal!important;overflow-wrap:break-word!important;font-size:clamp(.75rem,2.2vw,1.06rem)!important;}
  .ev12-fiche .eeb1-video{min-height:62px!important;margin:0 3%!important;}
  .ev12-fiche .eeb1-advice{margin:0 4%!important;padding:0!important;}
  @media(max-width:460px){
    .ev12-fiche .eeb1-hero{min-height:236px!important;}
    .ev12-fiche .eeb1-hero-copy{width:66%!important;max-width:66%!important;padding-left:4%!important;padding-right:1%!important;}
    .ev12-fiche .eeb1-hero h1{font-size:clamp(1.32rem,5.3vw,1.6rem)!important;}
    .ev12-fiche .eeb1-stats{gap:4px!important;}
    .ev12-fiche .eeb1-stat{padding:4px!important;gap:3px!important;}
    .ev12-fiche .eeb1-stat img{width:26px!important;height:26px!important;max-width:33%!important;}
    .ev12-fiche .eeb1-stat span{font-size:clamp(.52rem,2.25vw,.7rem)!important;}
    .ev12-fiche .eeb1-stat strong{font-size:clamp(.56rem,2.35vw,.74rem)!important;}
  }
  @media (min-width:760px){.ev12-fiche{border-radius:20px!important;}}
  `;
  document.head.appendChild(css);
  const original=render;
  render=function(){
    const ret=original.apply(this,arguments);
    if(state.view===DETAIL){
      const root=main.querySelector('.eeb1-detail');
      if(root){
        root.classList.add('ev12-fiche');
        // Une photo différente pour chaque fiche, sans titre incrusté ni surimpression.
        const idx=IDS.indexOf(state.eeb1Selected);
        const hero=root.querySelector('.eeb1-hero');
        if(hero){
          const n=(idx<0?1:idx+1);
          hero.style.setProperty('background-image',
            'linear-gradient(90deg,rgba(0,49,42,.96) 0%,rgba(0,49,42,.88) 37%,rgba(0,49,42,.12) 79%,transparent 100%),url("./etirements-epaules-photo-'+n+'-v11.webp?v=11")','important');
          hero.style.setProperty('background-size','cover','important');
          hero.style.setProperty('background-position','right center','important');
        }
      }
    }
    return ret;
  };
})();
