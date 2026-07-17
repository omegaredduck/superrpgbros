// artdev/castle/render_castle_theme.js — "THE LAST WALTZ", the VAMPIRE CASTLE
// theme: 8-BIT ELEGANT WALTZ GONE WRONG (Red's pick). True 3/4 — music-box
// opening, a graceful ballroom waltz that keeps SLIPPING into minor-key
// horror: wrong notes creep in, a detuned twin voice joins, organ stabs and
// timpani take the ballroom, then the music box winds down broken.
// All chiptune voices (pulse/triangle/noise, NO sine).
// 150 bars of 3/4 @150 BPM = 180.0s exactly.
//   node render_castle_theme.js castle_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 150, BEATS = 3;
const spb = SR * 60 / BPM;
const bar = spb * BEATS;
const BARS = 150;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 77; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
function tone(start, dur, freq, gain, type, duty, atk, rel) {
  atk = atk == null ? 0.004 : atk; rel = rel == null ? 0.05 : rel;
  const A = Math.max(1, atk * SR), R = Math.max(1, rel * SR);
  let ph = 0;
  for (let k = 0; k < dur; k++) {
    ph += freq / SR;
    let s = type === 'tri' ? tri(ph) : pulse(ph, duty || 0.5);
    let e = 1;
    if (k < A) e = k / A; else if (k > dur - R) e = Math.max(0, (dur - k) / R);
    add(start + k, s * gain * e);
  }
}
// music-box note: bright tri + quick decay + octave chime
function box(start, m, gain) {
  const d = Math.round(spb * 0.9);
  for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * 0.14)); add(start + k, tri(midi(m) * k / SR) * gain * e + tri(midi(m + 12) * k / SR) * gain * 0.3 * e); }
}
function timpani(start, gain) { const d = SR * 0.3; for (let k = 0; k < d; k++) { const t = k / d; const f = 68 - 26 * t; const e = Math.pow(1 - t, 1.8); add(start + k, (tri(f * k / SR) * 0.85 + nrnd() * 0.12 * Math.exp(-k / (SR * 0.02))) * gain * e); } }
function brush(start, gain) { for (let k = 0; k < SR * 0.05; k++) { const e = Math.exp(-k / (SR * 0.016)); add(start + k, nrnd() * gain * e); } }

// ---- harmony ----
// elegant A: C – G – Am – F  |  wrong B: Cm – Ab – Fm – G(b9 hint)
const A_ROOT = [48, 43, 45, 41], A_CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]];
const B_ROOT = [48, 44, 41, 43], B_CH = [[60, 63, 67], [60, 63, 68], [56, 60, 65], [59, 62, 67]];
// waltz melodies: [bar][beat] midi, -1 = rest, 4-bar phrases doubled to 8
const MEL_A = [
  [76, 79, 84], [83, 79, 76], [74, 77, 81], [79, -1, 74],
  [76, 79, 84], [86, 84, 81], [79, 77, 74], [72, -1, -1]
];
const MEL_B = [
  [75, 79, 84], [84, 80, 75], [72, 75, 80], [79, -1, 75],
  [75, 72, 68], [67, 68, 72], [75, 79, 78], [79, -1, -1]
];
// "wrong" note substitutions (tritone/semitone slips) applied by chance in slip sections
function wrongify(m, b, e) { const h = (b * 7 + e * 13) % 17; if (h === 3) return m + 1; if (h === 9) return m - 1; if (h === 13) return m + 6; return m; }

function sec(b) {
  if (b < 12) return { mode: 'box', mel: 'A' };                                        // music box intro
  if (b < 44) return { mode: 'waltz', mel: 'A', elegant: true };                        // the grand waltz
  if (b < 60) return { mode: 'waltz', mel: 'A', slip: true };                           // slipping wrong
  if (b < 92) return { mode: 'waltz', mel: 'B', dark: true };                           // minor waltz
  if (b < 108) return { mode: 'horror', mel: 'B' };                                     // ballroom horror
  if (b < 138) return { mode: 'waltz', mel: 'B', dark: true, slip: true, grand: true }; // corrupted grand reprise
  return { mode: 'box', mel: 'B', dying: true };                                        // broken music box
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = (s.mel === 'A' ? A_ROOT : B_ROOT)[t];
  const chord = (s.mel === 'A' ? A_CH : B_CH)[t];
  const mel = (s.mel === 'A' ? MEL_A : MEL_B)[b % 8];

  if (s.mode === 'box') {
    // music box: melody alone + soft third every other bar
    const slowing = s.dying ? 1 + (b - 138) * 0.045 : 1; // ritard by stretching beat starts
    for (let e = 0; e < 3; e++) {
      let m = mel[e]; if (m < 0) continue;
      if (s.dying && (b + e) % 5 === 0) m += 1; // broken tine
      const p = b0 + Math.round(e * spb * slowing);
      box(p, m + 12, s.dying ? 0.16 - (b - 138) * 0.008 : 0.18);
      if (b % 2 === 1 && e === 0) box(p, m + 12 - 3, 0.08);
    }
    if (s.dying && b === BARS - 1) box(b0 + Math.round(spb * 1.5), 61, 0.12); // final flat clunk
    continue;
  }

  // ---- waltz engine: OOM (bass) pah pah (chords) ----
  const heavy = s.mode === 'horror';
  // beat 1: bass root (+ timpani when dark)
  tone(b0, Math.round(spb * 0.85), midi(root), heavy ? 0.34 : 0.28, 'tri', 0, 0.004, 0.06);
  if (s.dark || heavy) timpani(b0, heavy ? 0.85 : 0.5);
  // beats 2 & 3: chord "pah" stabs
  [1, 2].forEach(beat => {
    const p = b0 + Math.round(beat * spb);
    chord.forEach(m => tone(p, Math.round(spb * 0.4), midi(m), heavy ? 0.09 : 0.08, 'pulse', 0.32, 0.005, 0.06));
    if (!heavy) brush(p, 0.07);
  });
  // horror organ: sustained low cluster through the bar
  if (heavy) {
    [root + 12, root + 19, root + 24].forEach(m => tone(b0, Math.round(bar * 0.95), midi(m), 0.07, 'pulse', 0.5, 0.1, 0.2));
    if (t === 3) [61, 67].forEach(m => tone(b0 + Math.round(spb * 2), Math.round(spb * 0.8), midi(m + 12), 0.08, 'pulse', 0.3, 0.01, 0.2)); // shriek stab
  }
  // melody (quarter notes on each waltz beat)
  for (let e = 0; e < 3; e++) {
    let m = mel[e]; if (m < 0) continue;
    if (s.slip) m = wrongify(m, b, e);
    const p = b0 + Math.round(e * spb), d = Math.round(spb * 0.9);
    tone(p, d, midi(m), 0.16, 'pulse', 0.42, 0.006, 0.06);
    // the detuned twin voice (the ghost dancing partner) in slip/dark
    if (s.slip || s.dark) tone(p, d, midi(m) * 1.008, 0.07, 'pulse', 0.3, 0.008, 0.06);
    // grand reprise: octave doubling
    if (s.grand) tone(p, d, midi(m + 12), 0.07, 'pulse', 0.3, 0.006, 0.06);
  }
  // elegant countermelody: light arpeggio eighths (harp-like) in elegant bars
  if (s.elegant || s.grand) {
    for (let e = 0; e < 6; e++) {
      const m = chord[e % 3] + 12 + (e >= 3 ? 12 : 0);
      tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.8), midi(m), 0.05, 'tri', 0, 0.003, 0.04);
    }
  }
  // section-door flourish
  if ([12, 44, 60, 92, 108, 138].includes(b)) {
    for (let e = 0; e < 3; e++) box(b0 + Math.round(e * spb / 3), 84 + [0, 4, 7][e], 0.12);
  }
}

// normalize + soft clip -> 16-bit WAV
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'castle_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars of 3/4 @' + BPM + 'bpm');
