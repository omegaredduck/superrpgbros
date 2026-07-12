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
      o.frequency.setValueAtTime(notes[i], st);
      if (!d.arp && d.freqEnd && d.freqEnd !== d.freq) {
        o.frequency.exponentialRampToValueAtTime(Math.max(20, d.freqEnd), en);
      }
      o.connect(g);
      o.start(st);
      o.stop(en + 0.02);
    }
  }

  return { play: play, unlock: unlock, setVolume: setVolume, volume: volume };
})();
