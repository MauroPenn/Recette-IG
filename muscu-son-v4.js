/* MUSCULATION — SONS V4 (même cloche de ring : forte et douce) : Doux / Sportif / Voix française / Cloche de boxe.
   Conserve l'API appelée par seances-lecteur-v3.js, les mêmes réglages sauvegardés,
   et ajoute l'accès direct aux réglages depuis la page « Séances ».
   Pas de MP3 ni de requête réseau dans le module Web Audio ; voix via le navigateur.
   Aucun changement aux chronomètres ni au GPS. */
(function (global) {
  'use strict';

  const KEY = 'mb_muscu_sons_v1'; // Conserver les préférences existantes.
  const PROFILES = {
    doux: {
      name: 'Sons doux', detail: 'Petits carillons harmonieux, moins aigus et plus discrets.',
      icon: '♬'
    },
    sportif: {
      name: 'Sons sportifs', detail: 'Signaux courts et francs, comme un chronomètre de sport.',
      icon: '◉'
    },
    voix: {
      name: 'Annonces vocales', detail: '« Trois, deux, un », « Récupération », « Tour suivant »…',
      icon: '◖))'
    },
    cloche: {
      name: 'Cloche de boxe', detail: 'Cloche de ring pour les tours, même cloche adoucie pour les pauses et le décompte.',
      icon: '🥊'
    }
  };
  const DEFAULT = { enabled: true, volume: 65, countdown: true, finish: true, profile: 'doux' };
  let settings = { ...DEFAULT };
  let ctx = null;
  let generation = 0;
  const activeNodes = new Set();

  function validProfile(profile) {
    return Object.prototype.hasOwnProperty.call(PROFILES, profile) ? profile : DEFAULT.profile;
  }
  function clamp(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : DEFAULT.volume;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      settings = {
        enabled: saved.enabled !== false,
        volume: clamp(saved.volume == null ? DEFAULT.volume : saved.volume),
        countdown: saved.countdown !== false,
        finish: saved.finish !== false,
        profile: validProfile(saved.profile)
      };
    }
  } catch (_) { /* Stockage local désactivé : utiliser les valeurs par défaut. */ }
  const getSettings = () => ({ ...settings });
  const audioAvailable = () => Boolean(global.AudioContext || global.webkitAudioContext);
  const voiceAvailable = () => Boolean(global.speechSynthesis && global.SpeechSynthesisUtterance);
  const supported = () => audioAvailable() || voiceAvailable();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (_) {} }
  function update(next) {
    const merged = { ...settings, ...next };
    const changed = merged.profile !== settings.profile || merged.enabled !== settings.enabled || clamp(merged.volume) !== settings.volume;
    settings = {
      enabled: merged.enabled !== false,
      volume: clamp(merged.volume),
      countdown: merged.countdown !== false,
      finish: merged.finish !== false,
      profile: validProfile(merged.profile)
    };
    persist();
    if (changed || !settings.enabled || settings.volume === 0) silence();
    return getSettings();
  }

  function unlock() {
    if (!audioAvailable()) return Promise.resolve(null);
    try {
      if (!ctx) {
        const Construct = global.AudioContext || global.webkitAudioContext;
        ctx = new Construct();
      }
      if (ctx.state === 'suspended') return ctx.resume().then(() => ctx).catch(() => null);
      return Promise.resolve(ctx);
    } catch (_) { return Promise.resolve(null); }
  }
  function silence() {
    generation++;
    for (const o of activeNodes) { try { o.stop(); } catch (_) {} }
    activeNodes.clear();
    if (voiceAvailable()) { try { global.speechSynthesis.cancel(); } catch (_) {} }
  }

  // Des carillons naturels pour « doux », des signaux courts et dynamiques pour « sportif ».
  // Chaque note est synthétisée avec une enveloppe, pour éviter les clics et agressions sonores.
  function note(context, offset, hz, duration, kind, level, profile) {
    const os = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + Math.max(.008, offset);
    const end = start + duration;
    os.type = kind;
    os.frequency.setValueAtTime(hz, start);
    if (profile === 'sportif') os.frequency.exponentialRampToValueAtTime(hz * .91, Math.min(end, start + .11));
    const vol = Math.max(.00008, Math.min(.24, (settings.volume / 100) * level));
    const attack = profile === 'doux' ? .018 : .006;
    const releaseStart = Math.min(end - .018, start + (profile === 'doux' ? duration * .52 : duration * .32));
    gain.gain.setValueAtTime(.00001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + attack);
    gain.gain.setValueAtTime(vol, Math.max(start + attack, releaseStart));
    gain.gain.exponentialRampToValueAtTime(.00001, end);
    os.connect(gain); gain.connect(context.destination);
    activeNodes.add(os);
    os.onended = () => { activeNodes.delete(os); try { os.disconnect(); gain.disconnect(); } catch (_) {} };
    os.start(start); os.stop(end + .01);
  }
  const SOFT = {
    start:       [[0,392,.32],[.14,523.25,.36],[.28,659.25,.42]],
    roundStart:  [[0,440,.32],[.15,554.37,.38],[.30,659.25,.46]],
    exerciseEnd: [[0,659.25,.27],[.17,523.25,.38]],
    setEnd:      [[0,587.33,.27],[.16,493.88,.36]],
    restStart:   [[0,392,.30],[.15,329.63,.4]],
    restEnd:     [[0,523.25,.28],[.16,783.99,.4]],
    roundEnd:    [[0,523.25,.32],[.18,659.25,.32],[.36,783.99,.52]],
    finish:      [[0,392,.30],[.18,523.25,.33],[.36,659.25,.36],[.55,783.99,.65]],
    test:        [[0,392,.29],[.17,523.25,.36],[.34,659.25,.44]]
  };
  const SPORT = {
    start:       [[0,680,.09],[.13,680,.09],[.29,1030,.24]],
    roundStart:  [[0,740,.10],[.14,880,.10],[.28,1130,.22]],
    exerciseEnd: [[0,950,.12],[.16,630,.23]],
    setEnd:      [[0,820,.10],[.15,620,.19]],
    restStart:   [[0,510,.13],[.18,390,.2]],
    restEnd:     [[0,880,.11],[.15,1130,.25]],
    roundEnd:    [[0,630,.11],[.14,820,.11],[.28,1040,.27]],
    finish:      [[0,590,.12],[.14,740,.12],[.28,880,.12],[.43,1180,.36]],
    test:        [[0,680,.09],[.14,880,.09],[.29,1130,.27]]
  };
  const SPOKEN = {
    start: 'C’est parti !', roundStart: 'Nouveau tour !',
    exerciseEnd: 'Exercice terminé.', setEnd: 'Série terminée.',
    restStart: 'Récupération.', restEnd: 'On reprend !',
    roundEnd: 'Tour terminé. Hydratez-vous.', finish: 'Séance terminée. Bravo !',
    test: 'Trois, deux, un. C’est parti !'
  };
  function speak(text, ticket) {
    if (!voiceAvailable()) return false;
    if (ticket !== generation) return false;
    try {
      const synth = global.speechSynthesis;
      synth.cancel(); // Ne pas superposer des annonces de phases différentes.
      const utterance = new global.SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.16;
      utterance.pitch = 1.03;
      utterance.volume = Math.max(0, Math.min(1, settings.volume / 100));
      const voices = synth.getVoices ? synth.getVoices() : [];
      const french = voices.find(v => /^fr[-_]/i.test(v.lang) && v.localService) || voices.find(v => /^fr[-_]/i.test(v.lang));
      if (french) utterance.voice = french;
      synth.speak(utterance);
      return true;
    } catch (_) { return false; }
  }
  function playPattern(name, profile, ticket) {
    if (!audioAvailable()) return;
    const notes = (profile === 'doux' ? SOFT : SPORT)[name];
    if (!notes) return;
    unlock().then(context => {
      if (!context || context.state !== 'running' || ticket !== generation || !settings.enabled || settings.volume === 0 || document.visibilityState === 'hidden') return;
      const soft = profile === 'doux';
      for (const [offset,hz,duration] of notes) {
        note(context, offset, hz, duration, soft ? 'sine' : 'triangle', soft ? .16 : .22, profile);
        if (soft) note(context, offset, hz * 2, duration * .74, 'sine', .018, profile);
      }
    }).catch(() => {});
  }

  // Échantillon original de cloche métallique, compact et local (hors connexion Internet).
  // Un AudioBufferSourceNode neuf par coup : même sample pour 1, 2 ou 3 coups de ring.
  const BELL_FILE = './muscu-cloche-boxe-v1.wav';
  let bellBufferPromise = null;
  let bellContext = null;
  function getBellBuffer(context) {
    if (bellContext !== context) { bellContext = context; bellBufferPromise = null; }
    if (!bellBufferPromise) {
      bellBufferPromise = fetch(BELL_FILE).then(response => {
        if (!response.ok) throw new Error('Cloche introuvable : ' + response.status);
        return response.arrayBuffer();
      }).then(data => context.decodeAudioData(data)).catch(() => {
        bellBufferPromise = null; // Autoriser une nouvelle tentative après panne du réseau.
        return null;
      });
    }
    return bellBufferPromise;
  }
  // V4 : exactement le timbre de la cloche de ring validée, version adoucie.
  // Le fichier audio est l'aperçu sonore accepté par l'utilisateur :
  // aucune transposition ni changement de hauteur, uniquement une réduction de niveau.
  const CHIME_FILE = './muscu-cloche-ring-douce-v1.wav';
  let chimeBufferPromise = null;
  let chimeContext = null;
  function getChimeBuffer(context) {
    if (chimeContext !== context) { chimeContext = context; chimeBufferPromise = null; }
    if (!chimeBufferPromise) {
      chimeBufferPromise = fetch(CHIME_FILE).then(response => {
        if (!response.ok) throw new Error('Clochette indisponible');
        return response.arrayBuffer();
      }).then(data => context.decodeAudioData(data)).catch(() => {
        chimeBufferPromise = null;
        return null;
      });
    }
    return chimeBufferPromise;
  }
  function playChimeSequence(notes, ticket) {
    if (!audioAvailable()) { playPattern('test', 'doux', ticket); return; }
    unlock().then(async context => {
      if (!context || context.state !== 'running') return;
      const buffer = await getChimeBuffer(context);
      if (ticket !== generation || !enabledNow()) return;
      if (!buffer) { playPattern('test', 'doux', ticket); return; }
      const at = context.currentTime + .025;
      for (const [offset,level] of notes) {
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.playbackRate.setValueAtTime(1, at + offset); // Conserver la tonalité d'origine.
        gain.gain.setValueAtTime(Math.max(0,Math.min(1, settings.volume / 100 * level)),at + offset);
        source.connect(gain); gain.connect(context.destination);
        activeNodes.add(source);
        source.onended = () => { activeNodes.delete(source); try { source.disconnect(); gain.disconnect(); } catch(_) {} };
        source.start(at + offset);
      }
    }).catch(() => { if (ticket === generation) playPattern('test','doux',ticket); });
  }
  function chimeForTransition(name,ticket) {
    const choices = {
      exerciseEnd: [[0,.72]],
      setEnd: [[0,.72]],
      restStart: [[0,.64]],
      restEnd: [[0,.76]],
    };
    playChimeSequence(choices[name] || [[0,.70]],ticket);
  }
  function previewChimes() {
    if (!settings.enabled || settings.volume === 0) return;
    silence();
    const ticket = generation;
    playChimeSequence([[0,.92],[.99,.92],[1.98,.92]],ticket);
  }
  function playBoxingBell(name, ticket) {
    if (!audioAvailable()) { playPattern(name, 'sportif', ticket); return; }
    const strikes = {
      start: [0], roundStart: [0], roundEnd: [0, .68],
      finish: [0, .65, 1.30], test: [0, .67]
    }[name];
    if (!strikes) {
      // Le son de la même cloche, mais plus doux, pour les petites transitions.
      chimeForTransition(name, ticket);
      return;
    }
    unlock().then(async context => {
      if (!context || context.state !== 'running') { playPattern(name, 'sportif', ticket); return; }
      const buffer = await getBellBuffer(context);
      if (ticket !== generation || !settings.enabled || settings.volume === 0 ||
          document.visibilityState === 'hidden') return;
      if (!buffer) { playPattern(name, 'sportif', ticket); return; }
      const at = context.currentTime + .025;
      const volume = Math.min(.54, (settings.volume / 100) * .57 / Math.sqrt(strikes.length));
      for (const offset of strikes) {
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(volume, at + offset);
        source.connect(gain); gain.connect(context.destination);
        activeNodes.add(source);
        source.onended = () => {
          activeNodes.delete(source);
          try { source.disconnect(); gain.disconnect(); } catch (_) {}
        };
        source.start(at + offset);
      }
    }).catch(() => {
      if (ticket === generation) playPattern(name, 'sportif', ticket);
    });
  }

  function enabledNow() { return settings.enabled && settings.volume > 0 && document.visibilityState !== 'hidden'; }
  function cue(name) {
    if (!enabledNow()) return;
    if ((name === 'finish' || name === 'roundEnd') && !settings.finish) return;
    const ticket = generation;
    const profile = settings.profile;
    if (profile === 'voix') {
      if (!speak(SPOKEN[name] || 'On continue !', ticket)) playPattern(name, 'sportif', ticket);
    } else if (profile === 'cloche') playBoxingBell(name, ticket);
    else playPattern(name, profile, ticket);
  }
  function countdown(second) {
    if (!enabledNow() || !settings.countdown || !Number.isInteger(second) || second < 1 || second > 3) return;
    const ticket = generation;
    if (settings.profile === 'voix') {
      if (!speak(['','un','deux','trois'][second], ticket)) playCountdown(second,'sportif',ticket);
    } else if (settings.profile === 'cloche') {
      // Même cloche de ring adoucie à chaque seconde, aucune transposition.
      playChimeSequence([[0,.92]],ticket);
    } else playCountdown(second, settings.profile, ticket);
  }
  function playCountdown(second, profile, ticket) {
    if (!audioAvailable()) return;
    unlock().then(context => {
      if (!context || context.state !== 'running' || ticket !== generation || !enabledNow()) return;
      if (profile === 'doux') {
        note(context,0,[0,783.99,698.46,659.25][second],.24,'sine',.13,'doux');
        note(context,0,[0,1567.98,1396.92,1318.5][second],.17,'sine',.018,'doux');
      } else {
        note(context,0,second===1?1140:880,.115,'triangle',.17,'sportif');
      }
    }).catch(() => {});
  }
  function preview(profile) {
    profile = validProfile(profile);
    if (!settings.enabled || settings.volume === 0) return;
    silence(); // Arrête l'écoute précédente sans interrompre le compteur de la séance.
    const ticket = generation;
    if (profile === 'voix') {
      if (!speak(SPOKEN.test,ticket)) playPattern('test','sportif',ticket);
    } else if (profile === 'cloche') playBoxingBell('test',ticket);
    else playPattern('test',profile,ticket);
  }

  function openSettings() {
    const prev = document.getElementById('mb-sound-dialog');
    if (prev) prev.remove();
    const root = document.createElement('div');
    root.className = 'mb-sound-overlay'; root.id = 'mb-sound-dialog';
    root.innerHTML = `<section class="mb-sound-dialog" role="dialog" aria-modal="true" aria-labelledby="mbSoundTitle">
      <div class="mb-sound-title"><h2 id="mbSoundTitle">🔊 Réglages sonores</h2><button type="button" id="mbSoundClose" aria-label="Fermer les réglages">✕</button></div>
      <p class="mb-sound-intro">Choisis une ambiance et écoute-la avant de lancer ton entraînement.</p>
      <label class="mb-sound-check"><input id="mbSoundEnabled" type="checkbox"> Activer les effets sonores</label>
      <div class="mb-sound-volume"><label for="mbSoundVolume">Volume</label><strong id="mbSoundPercent"></strong>
      <input id="mbSoundVolume" type="range" min="0" max="100" step="5"></div>
      <h3 class="mb-sound-subhead">Choisir une ambiance</h3>
      <div class="mb-sound-profiles" role="group" aria-label="Ambiance sonore">
        ${Object.entries(PROFILES).map(([id,x]) => `<div class="mb-sound-profile" data-mb-profile="${id}">
          <button type="button" data-mb-select="${id}" class="mb-sound-select" aria-pressed="false">
            <span class="mb-sound-profile-icon" aria-hidden="true">${x.icon}</span><span class="mb-sound-profile-text"><strong>${x.name}</strong><small>${x.detail}</small></span><span class="mb-sound-selected" aria-hidden="true">✓</span>
          </button><button type="button" class="mb-sound-listen" data-mb-preview="${id}" aria-label="Écouter ${x.name}">▶ Écouter</button>
        </div>`).join('')}
      </div>
      <button type="button" class="mb-sound-listen mb-sound-mini-preview" id="mbSoundChimePreview">🔔 Écouter la cloche douce : 3 · 2 · 1</button>
      <label class="mb-sound-check"><input id="mbSoundCountdown" type="checkbox"> Décompte sonore 3, 2, 1</label>
      <label class="mb-sound-check"><input id="mbSoundFinish" type="checkbox"> Son de fin de tour et de séance</label>
      <p class="mb-sound-help" id="mbSoundHelp">La cloche de ring est conservée ; les petits signaux reprennent exactement sa tonalité, en version plus douce. Les annonces vocales utilisent la voix disponible sur ton téléphone. Si elle n'est pas compatible, les bips sportifs servent de remplacement. Le volume dépend aussi du volume multimédia du téléphone.</p>
      <button type="button" class="mb-sound-done" id="mbSoundDone">Enregistrer et fermer</button>
    </section>`;
    document.body.appendChild(root);
    const q = id => root.querySelector('#' + id);
    let proposed = { ...settings };
    const sync = () => {
      q('mbSoundEnabled').checked = proposed.enabled;
      q('mbSoundVolume').value = String(proposed.volume);
      q('mbSoundPercent').textContent = proposed.volume + ' %';
      q('mbSoundCountdown').checked = proposed.countdown;
      q('mbSoundFinish').checked = proposed.finish;
      q('mbSoundVolume').disabled = !proposed.enabled;
      q('mbSoundCountdown').disabled = !proposed.enabled;
      q('mbSoundFinish').disabled = !proposed.enabled;
      root.querySelectorAll('[data-mb-select]').forEach(b => {
        const active = b.dataset.mbSelect === proposed.profile;
        b.setAttribute('aria-pressed', String(active));
        b.closest('.mb-sound-profile').classList.toggle('selected', active);
      });
      root.querySelectorAll('[data-mb-preview]').forEach(b => b.disabled = !proposed.enabled || proposed.volume === 0 || !supported());
      q('mbSoundChimePreview').style.display = proposed.profile === 'cloche' ? 'block' : 'none';
      q('mbSoundChimePreview').disabled = !proposed.enabled || proposed.volume === 0 || !audioAvailable();
      if (!voiceAvailable()) q('mbSoundHelp').textContent = 'La voix n’est pas disponible sur ce navigateur : le mode Annonces vocales utilisera des bips sportifs. Le volume dépend aussi du volume multimédia du téléphone.';
    };
    const changed = () => { update(proposed); sync(); };
    const close = () => { update(proposed); silence(); root.remove(); };
    q('mbSoundEnabled').addEventListener('change', e => { proposed.enabled = e.target.checked; changed(); });
    q('mbSoundVolume').addEventListener('input', e => { proposed.volume = Number(e.target.value); changed(); });
    q('mbSoundCountdown').addEventListener('change', e => { proposed.countdown = e.target.checked; changed(); });
    q('mbSoundFinish').addEventListener('change', e => { proposed.finish = e.target.checked; changed(); });
    root.querySelectorAll('[data-mb-select]').forEach(b => b.addEventListener('click', () => {
      proposed.profile = b.dataset.mbSelect; changed();
    }));
    root.querySelectorAll('[data-mb-preview]').forEach(b => b.addEventListener('click', () => {
      // L'écoute est toujours déclenchée par un clic utilisateur.
      unlock(); preview(b.dataset.mbPreview);
    }));
    q('mbSoundChimePreview').addEventListener('click', () => { unlock(); previewChimes(); });
    q('mbSoundClose').addEventListener('click', close);
    q('mbSoundDone').addEventListener('click', close);
    root.addEventListener('click', e => { if (e.target === root) close(); });
    sync(); q('mbSoundClose').focus();
  }

  // Les réglages doivent être accessibles depuis « Séances » sans en créer une.
  if (typeof renderMuscuSessions === 'function') {
    const previousSessions = renderMuscuSessions;
    renderMuscuSessions = function () {
      const result = previousSessions.apply(this, arguments);
      const panel = main.querySelector('.muscu-sessions-v3');
      if (panel && !panel.querySelector('#mbSoundAccess')) {
        const b = document.createElement('button');
        b.type = 'button'; b.id = 'mbSoundAccess'; b.className = 'mb-sound-access';
        b.innerHTML = '<span aria-hidden="true">🔊</span> Réglages sonores <small>Choisir et écouter les sons</small>';
        b.setAttribute('aria-label', 'Réglages sonores : choisir et écouter les sons');
        b.addEventListener('click', openSettings);
        const heading = panel.querySelector('.muscu-sessions-heading');
        if (heading) heading.insertAdjacentElement('afterend', b);
        else panel.insertBefore(b, panel.firstChild);
      }
      return result;
    };
  }

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') silence(); });
  global.MuscuSons = { unlock, cue, countdown, preview, openSettings, silence, getSettings, update, supported, voiceAvailable };
})(window);
