// ============================================================================
// audio.js — Lane A sound: tiny Web Audio chiptune synth, zero audio files
// (ASSET_PIPELINE.md §1, M1). Sound recipes are DATA (data.js → audio.sounds);
// this module only knows how to play a recipe. Presentation-layer only — the
// sim never touches audio (seam rule 3). Every call is failure-safe: if Web
// Audio is missing (old browser, headless test), the game plays silently.
// ============================================================================
var AUDIO = (function () {

  var ctx = null;         // AudioContext, created lazily (needs a user gesture)
  var master = null;      // master gain — always 1; the seam to the speakers
  var sfxBus = null;      // 2026-07-12: SFX channel (its own volume + mute)
  var musicBus = null;    // 2026-07-12: MUSIC channel (its own volume + mute)
  var lastPlayed = {};    // name -> ms timestamp, for per-sound rate limiting
  var failed = false;     // Web Audio unavailable — stay silent forever

  function set() { return SAVE.settings(); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  // Effective bus gains fold the on/off toggle in: OFF = a hard 0, so flipping
  // it back restores the exact slider value with no state to remember.
  function musicGain() { var s = set(); return s.musicOn ? clamp01(s.musicVolume) : 0; }
  function sfxGain()   { var s = set(); return s.sfxOn   ? clamp01(s.sfxVolume)   : 0; }

  function ensure() {
    if (ctx) return true;
    if (failed) return false;
    try {
      var AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
      if (!AC) { failed = true; return false; }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();   sfxBus.gain.value   = sfxGain();   sfxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = musicGain(); musicBus.connect(master);
      return true;
    } catch (e) { failed = true; ctx = null; return false; }
  }

  // Browsers suspend audio until a user gesture — resume on the first one.
  function unlock() {
    try { if (ensure() && ctx.state === 'suspended') ctx.resume(); } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  // ---- Split volume API (2026-07-12). Sliders step in tenths. ----
  function snap(v) { return Math.max(0, Math.min(1, Math.round(v * 10) / 10)); }

  function setMusicVolume(v) {
    v = snap(v); set().musicVolume = v; SAVE.saveSettings();
    if (musicBus) musicBus.gain.value = musicGain();
    return v;
  }
  function setSfxVolume(v) {
    v = snap(v); set().sfxVolume = v; SAVE.saveSettings();
    if (sfxBus) sfxBus.gain.value = sfxGain();
    return v;
  }
  function setMusicOn(b) {
    set().musicOn = !!b; SAVE.saveSettings();
    if (musicBus) musicBus.gain.value = musicGain();
    return set().musicOn;
  }
  function setSfxOn(b) {
    set().sfxOn = !!b; SAVE.saveSettings();
    if (sfxBus) sfxBus.gain.value = sfxGain();
    return set().sfxOn;
  }
  function musicVolume() { return set().musicVolume; }
  function sfxVolume()   { return set().sfxVolume; }
  function musicOn()     { return set().musicOn; }
  function sfxOn()       { return set().sfxOn; }

  function play(name) {
    var d = DATA.audio.sounds[name];
    if (!d || sfxGain() <= 0 || !ensure()) return;
    try {
      if (ctx.state !== 'running') return;                   // still locked — skip
      var now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
      if (lastPlayed[name] && now - lastPlayed[name] < (d.limitMs || 0)) return;
      lastPlayed[name] = now;
      synth(d);
    } catch (e) { /* never let a sound crash gameplay */ }
  }

  // One recipe = oscillator(s) with a gain envelope. `arp` plays the notes in
  // sequence across `len`; otherwise a single note sweeps freq → freqEnd.
  function synth(d) {
    var t0 = ctx.currentTime;
    var notes = d.arp || [d.freq];
    var per = d.len / notes.length;
    for (var i = 0; i < notes.length; i++) {
      var st = t0 + i * per, en = st + per;
      var g = ctx.createGain();
      g.connect(sfxBus);
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, d.vol), st + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, en);
      var o = ctx.createOscillator();
      o.type = d.type;
      var f = notes[i];
      if (d.jitter) f *= 1 + (Math.random() * 2 - 1) * d.jitter;   // electric wobble
      o.frequency.setValueAtTime(f, st);
      if (!d.arp && d.freqEnd && d.freqEnd !== d.freq) {
        o.frequency.exponentialRampToValueAtTime(Math.max(20, d.freqEnd), en);
      }
      o.connect(g);
      o.start(st);
      o.stop(en + 0.02);
    }
    if (d.noise) noiseLayer(d, t0);        // M3.5: electric-crackle noise bed
  }

  // Filtered white-noise layer under the oscillators — the "electricity" in
  // the portal charge-up. Recipe field: noise: { vol, hp (highpass Hz) }.
  // Gated bursts (not steady hiss) read as sparks/arcing.
  function noiseLayer(d, t0) {
    var len = d.len;
    var buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * len)), ctx.sampleRate);
    var ch = buf.getChannelData(0);
    for (var i = 0; i < ch.length; i++) {
      ch[i] = Math.random() < 0.3 ? (Math.random() * 2 - 1) : 0;   // gated crackle
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = d.noise.hp || 1200;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, d.noise.vol), t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    src.connect(filt); filt.connect(g); g.connect(sfxBus);
    src.start(t0);
    src.stop(t0 + len + 0.02);
  }

  // ------------------------------------------------- M3.9: MUSIC --
  // A tiny chiptune sequencer: songs are DATA (data.js → audio.music),
  // three-ish voices of oscillator notes, looped with a lookahead timer.
  // Failure-safe like everything else: no Web Audio → silence, never a crash.
  var music = { name: null, pending: null, timer: null, sources: [], gain: null };

  function noteHz(n) {
    var m = /^([A-G])(#?)(\d)$/.exec(n);
    if (!m) return 0;
    var idx = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    var midi = (+m[3] + 1) * 12 + idx;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // 2026-07-18 SCHEDULER REWRITE (fix: dense realm songs stuttered / went
  // silent). The old scheduler built EVERY node of the whole loop in one
  // synchronous pass each iteration. That was cheap for the ~100-370 note boot
  // songs (battle/chamber) but the realm songs run 9,000-13,000 notes/loop, so
  // each pass created ~11,000 AudioNodes at once — a main-thread stall that
  // made the loop's early notes fire late (o.start with a past time) = audible
  // stutter, and on entry it read as "no music". Fix: flatten the song into a
  // time-sorted event list ONCE, then a rolling ~0.25s lookahead schedules only
  // the handful of notes due each 40ms tick — constant per-tick work at any
  // song density.
  function buildEvents(d) {
    var spb = 60 / d.bpm, evs = [];
    d.tracks.forEach(function (tr) {
      var t = 0;
      tr.notes.forEach(function (n) {
        var dur = n[1] * spb;
        if (n[0]) evs.push({ t: t, dur: dur, hz: noteHz(n[0]), type: tr.type, vol: tr.vol });
        t += dur;
      });
    });
    evs.sort(function (a, b) { return a.t - b.t; });
    return evs;
  }

  function scheduleNote(ev, when) {
    var o = ctx.createOscillator();
    o.type = ev.type;
    o.frequency.value = ev.hz;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(ev.vol, when + 0.02);
    g.gain.setValueAtTime(ev.vol, Math.max(when + 0.03, when + ev.dur - 0.08));
    g.gain.linearRampToValueAtTime(0.0001, when + ev.dur - 0.01);
    o.connect(g);
    g.connect(music.gain);
    o.start(when);
    o.stop(when + ev.dur);
    // windowed scheduling keeps only a few notes live at once; a small rolling
    // buffer is enough for cleanup — stopMusic silences everything via
    // music.gain.disconnect() regardless of what's in here.
    music.sources.push(o);
    if (music.sources.length > 96) music.sources = music.sources.slice(-64);
  }

  function playMusic(name) {
    try {
      var d = DATA.audio.music && DATA.audio.music[name];
      if (!d) return;
      if (music.name === name && music.timer) return;      // already playing
      stopMusic();
      if (!ensure() || ctx.state !== 'running') { music.pending = name; return; }
      music.name = name;
      music.gain = ctx.createGain();
      music.gain.gain.value = 1;
      music.gain.connect(musicBus);
      var events = buildEvents(d);
      if (!events.length) return;
      var spb = 60 / d.bpm, beats = 0;
      d.tracks[0].notes.forEach(function (n) { beats += n[1]; });
      var loopSec = beats * spb;
      if (!(loopSec > 0)) return;
      var LOOK = 0.25;                       // schedule this far ahead each tick
      var idx = 0;
      var loopStart = ctx.currentTime + 0.12;
      var pump = function () {
        try {
          var until = ctx.currentTime + LOOK, guard = 0;
          while (guard++ < 4000 && loopStart + events[idx].t <= until) {
            scheduleNote(events[idx], loopStart + events[idx].t);
            idx++;
            if (idx >= events.length) { idx = 0; loopStart += loopSec; }   // seamless loop
          }
        } catch (e) { stopMusic(); }
      };
      pump();
      music.timer = setInterval(pump, 40);
    } catch (e) { /* silence over crashes, always */ }
  }

  function stopMusic() {
    if (music.timer) { clearInterval(music.timer); music.timer = null; }
    music.sources.forEach(function (s) { try { s.stop(); } catch (e) {} });
    music.sources = [];
    if (music.gain) { try { music.gain.disconnect(); } catch (e) {} music.gain = null; }
    music.name = null;
    music.pending = null;
  }

  // --------------------------------------------- 2026-07-18: CUTSCENE CUES --
  // The story cutscenes use scene-length WAV cues (The Caretaker Theme:
  // musicbox CS0 / silence CS1 / unresolved swell CS2 / tonic resolve CS3).
  // Unlike everything else in this file these are FILES, so they get their own
  // sample path: fetch → decodeAudioData (cached) → one-shot on the MUSIC bus,
  // so the music slider/toggle controls them for free. They do NOT loop (the
  // 180s loop law is for background songs, not these). Failure-safe like the
  // rest: a missing file / no Web Audio / music off = silence, never a crash.
  var cueBuffers = {};   // url -> decoded AudioBuffer (cache; cues can replay)
  var cueSrc = null;     // currently-playing cue source
  var cueGain = null;    // its gain node (feeds musicBus)
  var pendingCue = null; // url waiting on decode / audio-unlock

  function startCueBuffer(buf) {
    if (!buf || !ensure() || ctx.state !== 'running' || !musicBus) return;
    stopCue();
    cueGain = ctx.createGain();
    cueGain.gain.value = 1;
    cueGain.connect(musicBus);
    var src = ctx.createBufferSource();
    src.buffer = buf; src.loop = false;
    src.connect(cueGain);
    src.onended = function () {
      if (cueSrc === src) { cueSrc = null; if (cueGain) { try { cueGain.disconnect(); } catch (e) {} cueGain = null; } }
    };
    src.start(ctx.currentTime + 0.02);
    cueSrc = src;
  }

  // Stop the cue with a 120ms release so a skip doesn't click.
  function stopCue() {
    pendingCue = null;
    var s = cueSrc, g = cueGain; cueSrc = null; cueGain = null;
    if (!s) { if (g) { try { g.disconnect(); } catch (e) {} } return; }
    try {
      s.onended = null;
      if (g && ctx) {
        var now = ctx.currentTime;
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0.0001, now + 0.12);
        s.stop(now + 0.14);
        setTimeout(function () { try { g.disconnect(); } catch (e) {} }, 220);
      } else { s.stop(); }
    } catch (e) { try { s.stop(); } catch (e2) {} }
  }

  function tryStartPendingCue() {
    if (!pendingCue) return;
    var url = pendingCue, buf = cueBuffers[url];
    if (buf && ensure() && ctx.state === 'running') { pendingCue = null; startCueBuffer(buf); }
  }

  // Play a cutscene cue once. `url` is relative to the page (index.html).
  function playCue(url) {
    try {
      stopMusic();     // no chiptune bg fighting the cue
      stopCue();
      if (!url) return;
      if (musicGain() <= 0 || !ensure()) return;   // music off / no audio — stay silent, skip the fetch
      pendingCue = url;
      if (cueBuffers[url]) { tryStartPendingCue(); return; }
      fetch(url).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (ab) { return new Promise(function (res, rej) { ctx.decodeAudioData(ab, res, rej); }); })
        .then(function (buf) { cueBuffers[url] = buf; tryStartPendingCue(); })
        .catch(function () { /* missing/undecodable cue = silence */ });
    } catch (e) {}
  }

  // browsers unlock audio on the first gesture — start any queued song then
  function unlockMusic() {
    try {
      if (ensure() && ctx.state === 'running') {
        if (music.pending) playMusic(music.pending);
        tryStartPendingCue();
      }
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', function () { setTimeout(unlockMusic, 60); });
    window.addEventListener('keydown', function () { setTimeout(unlockMusic, 60); });
  }

  return { play: play, unlock: unlock,
           setMusicVolume: setMusicVolume, setSfxVolume: setSfxVolume,
           setMusicOn: setMusicOn, setSfxOn: setSfxOn,
           musicVolume: musicVolume, sfxVolume: sfxVolume,
           musicOn: musicOn, sfxOn: sfxOn,
           playMusic: playMusic, stopMusic: stopMusic,
           playCue: playCue, stopCue: stopCue };
})();
