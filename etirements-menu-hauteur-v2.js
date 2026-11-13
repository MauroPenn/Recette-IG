/* Sport & Nutrition — Étirements — Affichage pleine hauteur V2 — 13/11/2026
 * Conserve le visuel validé sans étirement vertical ni recadrage des personnages.
 * Découpe uniquement l'AFFICHAGE du même fichier image en quatre bandes, séparées
 * par un espace souple. Aucun changement dans les données, les séances ou la V5.
 * Les boutons existants et leurs écouteurs d'événements sont conservés.
 */
(function () {
  'use strict';
  const VIEW = 'etirements-menu';
  const IMAGE_WIDTH = 941;
  const IMAGE_HEIGHT = 1672;
  const PARTS = [
    { name: 'entete', from: 0,    to: 654,  hotspot: '.ez1-back' },
    { name: 'exercices', from: 654, to: 1060, hotspot: '.ez1-exercises' },
    { name: 'seances', from: 1060, to: 1477, hotspot: '.ez1-sessions' },
    { name: 'pied', from: 1477, to: 1672, hotspot: null }
  ];

  function addStyles() {
    if (document.getElementById('ez2Styles')) return;
    const sheet = document.createElement('style');
    sheet.id = 'ez2Styles';
    sheet.textContent = `
      /* Aucun zoom, aucune déformation : image native à largeur constante. */
      body.ez1-active .ez2-plein-ecran {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        padding: 0;
        background: #003a34;
      }
      .ez2-tranche {
        position: relative;
        flex: 0 0 auto;
        width: 100%;
        overflow: hidden;
        line-height: 0;
      }
      .ez2-tranche > img.ez2-image {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        max-width: none;
        height: auto;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      /* Boutons transparents repositionnés sur leurs bandeaux respectifs. */
      .ez2-entete > .ez1-back { left: 3.5%; top: 15.5%; width: 13%; height: 14%; }
      .ez2-exercices > .ez1-exercises { left: 2%; top: 4.5%; width: 95%; height: 91.5%; }
      .ez2-seances > .ez1-sessions { left: 2%; top: 4%; width: 95%; height: 88%; }
      @media (min-width: 760px) {
        /* Sur tablette, on garde les dimensions adaptées et le défilement possible. */
        body.ez1-active .ez2-plein-ecran { min-height: calc(100dvh - 36px); }
      }
    `;
    document.head.appendChild(sheet);
  }

  function arrange() {
    if (typeof state === 'undefined' || state.view !== VIEW || typeof main === 'undefined') return;
    const root = main.querySelector('.ez1-screen');
    const previous = root?.querySelector('.ez1-visual');
    if (!root || !previous || root.classList.contains('ez2-plein-ecran')) return;
    const original = previous.querySelector('img');
    if (!original) return;
    const source = original.getAttribute('src');
    if (!source) return;

    // Déplacer les boutons existants préserve leurs clics et la navigation.
    const buttons = {};
    for (const part of PARTS) {
      if (part.hotspot) buttons[part.name] = previous.querySelector(part.hotspot);
      if (part.hotspot && !buttons[part.name]) return;
    }

    addStyles();
    const fragment = document.createDocumentFragment();
    for (const part of PARTS) {
      const slice = document.createElement('div');
      slice.className = 'ez2-tranche ez2-' + part.name;
      slice.style.aspectRatio = IMAGE_WIDTH + ' / ' + (part.to - part.from);

      const picture = original.cloneNode(false);
      picture.className = 'ez2-image';
      picture.removeAttribute('width');
      picture.removeAttribute('height');
      picture.setAttribute('src', source);
      picture.setAttribute('alt', '');
      picture.setAttribute('aria-hidden', 'true');
      picture.draggable = false;
      // Le déplacement est relatif à la hauteur de l'image intégrale.
      picture.style.transform = 'translateY(-' + (part.from / IMAGE_HEIGHT * 100).toFixed(6) + '%)';
      slice.appendChild(picture);
      if (part.hotspot) slice.appendChild(buttons[part.name]);
      fragment.appendChild(slice);
    }
    root.replaceChildren(fragment);
    root.classList.add('ez2-plein-ecran');
  }

  // Ce correctif intervient après le module d'accueil Étirements V1 et
  // laisse tous les autres écrans et leurs modules complètement inchangés.
  const previousRender = render;
  render = function () {
    const result = previousRender.apply(this, arguments);
    arrange();
    return result;
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrange, { once: true });
  } else {
    arrange();
  }
})();
