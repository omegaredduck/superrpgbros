// ============================================================================
// audio.js — Lane A sound: tiny Web Audio chiptune synth, zero audio files
// (ASSET_PIPELINE.md §1, M1). Sound recipes are DATA (data.js → audio.sounds);
// this module only knows how to play a recipe. Presentation-layer only — the
// sim never touches audio (seam rule 3). Every call is failure-safe: if Web
// Audio is missing (old browser, headless test), the game plays silently.
// ============================================================================
var AUDIO = (function () {

  var ctx = null;         // AudioContext, created lazily (needs a user gesture)
  var master = null;      // master gain — the volume control
  var lastPlayed = {};    // name -> ms timestamp, for per-sound rate limiting
  var failed = false;     // Web Audio unavailable — stay silent forever

  function ensure() {
    if (ctx) return true;
    if (failed) return false;
    try {
      var AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
      if (!AC) { failed = true; return false; }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume();
      master.connect(ctx.destination);
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

  function volume() { return SAVE.settings().volume; }

  function setVolume(v) {
    v = Math.max(0, Math.min(1, Math.round(v * 10) / 10));   // 0.0 .. 1.0 in tenths
    SAVE.settings().volume = v;
    SAVE.saveSettings();
    if (master) master.gain.value = v;
    return v;
  }

  function play(name) {
    var d = DATA.audio.sounds[name];
    if (!d || volume() <= 0 || !ensure()) return;
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
      g.connect(master);
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
    src.connect(filt); filt.connect(g); g.connect(master);
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

  function scheduleLoop(d, t0) {
    var spb = 60 / d.bpm;
    d.tracks.forEach(function (tr) {
      var t = t0;
      tr.notes.forEach(function (n) {
        var dur = n[1] * spb;
        if (n[0]) {
          var o = ctx.createOscillator();
          o.type = tr.type;
          o.frequency.value = noteHz(n[0]);
          var g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(tr.vol, t + 0.02);
          g.gain.setValueAtTime(tr.vol, Math.max(t + 0.03, t + dur - 0.08));
          g.gain.linearRampToValueAtTime(0.0001, t + dur - 0.01);
          o.connect(g);
          g.connect(music.gain);
          o.start(t);
          o.stop(t + dur);
          music.sources.push(o);
        }
        t += dur;
      });
    });
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
      music.gain.connect(master);
      var spb = 60 / d.bpm;
      var beats = 0;
      d.tracks[0].notes.forEach(function (n) { beats += n[1]; });
      var loopSec = beats * spb;
      var t0 = ctx.currentTime + 0.08;
      var tick = function () {
        try {
          music.sources = music.sources.slice(-160);       // drop long-dead refs
          scheduleLoop(d, t0);
          t0 += loopSec;
          music.timer = setTimeout(tick, Math.max(250, (t0 - ctx.currentTime - 1.2) * 1000));
        } catch (e) { stopMusic(); }
      };
      tick();
    } catch (e) { /* silence over crashes, always */ }
  }

  function stopMusic() {
    if (music.timer) { clearTimeout(music.timer); music.timer = null; }
    music.sources.forEach(function (s) { try { s.stop(); } catch (e) {} });
    music.sources = [];
    if (music.gain) { try { music.gain.disconnect(); } catch (e) {} music.gain = null; }
    music.name = null;
    music.pending = null;
  }

  // browsers unlock audio on the first gesture — start any queued song then
  function unlockMusic() {
    try {
      if (ensure() && ctx.state === 'running' && music.pending) playMusic(music.pending);
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', function () { setTimeout(unlockMusic, 60); });
    window.addEventListener('keydown', function () { setTimeout(unlockMusic, 60); });
  }

  return { play: play, unlock: unlock, setVolume: setVolume, volume: volume,
           playMusic: playMusic, stopMusic: stopMusic };
})();
