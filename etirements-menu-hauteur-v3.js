/* Sport & Nutrition — Étirements — Affichage pleine hauteur V3 — 13/11/2026
 * Corrige l'effet de bandes unies entre les cartes en ajoutant un fond harmonisé,
 * flouté et assombri dérivé du visuel validé. Aucun changement dans les données,
 * les séances, la synchro ou les autres univers.
 */
(function () {
  'use strict';

  const VIEW = 'etirements-menu';
  const IMAGE_WIDTH = 941;
  const IMAGE_HEIGHT = 1672;
  const PARTS = [
    { name: 'entete', from: 0, to: 654, hotspot: '.ez1-back' },
    { name: 'exercices', from: 654, to: 1060, hotspot: '.ez1-exercises' },
    { name: 'seances', from: 1060, to: 1477, hotspot: '.ez1-sessions' },
    { name: 'pied', from: 1477, to: 1672, hotspot: null }
  ];

  function addStyles() {
    if (document.getElementById('ez3Styles')) return;
    const sheet = document.createElement('style');
    sheet.id = 'ez3Styles';
    sheet.textContent = `
      body.ez1-active .ez3-plein-ecran {
        box-sizing: border-box;
        position: relative;
        isolation: isolate;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        padding: 0;
        background: #003a34;
      }
      .ez3-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        background: linear-gradient(180deg, #06362f 0%, #06362f 100%);
      }
      .ez3-bg > img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        filter: blur(26px) brightness(0.40) saturate(0.85);
        transform: scale(1.08);
        opacity: 0.98;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .ez3-tranche {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        width: 100%;
        overflow: hidden;
        line-height: 0;
        background: transparent;
      }
      .ez3-tranche > img.ez3-image {
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
      .ez3-entete > .ez1-back { left: 3.5%; top: 15.5%; width: 13%; height: 14%; }
      .ez3-exercices > .ez1-exercises { left: 2%; top: 4.5%; width: 95%; height: 91.5%; }
      .ez3-seances > .ez1-sessions { left: 2%; top: 4%; width: 95%; height: 88%; }
      @media (min-width: 760px) {
        body.ez1-active .ez3-plein-ecran { min-height: calc(100dvh - 36px); }
      }
    `;
    document.head.appendChild(sheet);
  }

  function buildBackground(source) {
    const bg = document.createElement('div');
    bg.className = 'ez3-bg';
    const img = document.createElement('img');
    img.src = source;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.draggable = false;
    bg.appendChild(img);
    return bg;
  }

  function arrange() {
    if (typeof state === 'undefined' || state.view !== VIEW || typeof main === 'undefined') return;
    const root = main.querySelector('.ez1-screen');
    const previous = root?.querySelector('.ez1-visual');
    if (!root || !previous || root.classList.contains('ez3-plein-ecran')) return;
    const original = previous.querySelector('img');
    if (!original) return;
    const source = original.getAttribute('src');
    if (!source) return;

    const buttons = {};
    for (const part of PARTS) {
      if (part.hotspot) buttons[part.name] = previous.querySelector(part.hotspot);
      if (part.hotspot && !buttons[part.name]) return;
    }

    addStyles();

    const fragment = document.createDocumentFragment();
    fragment.appendChild(buildBackground(source));

    for (const part of PARTS) {
      const slice = document.createElement('div');
      slice.className = 'ez3-tranche ez3-' + part.name;
      slice.style.aspectRatio = IMAGE_WIDTH + ' / ' + (part.to - part.from);

      const picture = original.cloneNode(false);
      picture.className = 'ez3-image';
      picture.removeAttribute('width');
      picture.removeAttribute('height');
      picture.setAttribute('src', source);
      picture.setAttribute('alt', '');
      picture.setAttribute('aria-hidden', 'true');
      picture.draggable = false;
      picture.style.transform = 'translateY(-' + (part.from / IMAGE_HEIGHT * 100).toFixed(6) + '%)';
      slice.appendChild(picture);

      if (part.hotspot) slice.appendChild(buttons[part.name]);
      fragment.appendChild(slice);
    }

    root.replaceChildren(fragment);
    root.classList.add('ez3-plein-ecran');
  }

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
