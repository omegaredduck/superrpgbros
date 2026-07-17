// artdev/crystal/render_crystal_theme.js — "CAVERN OF WONDERS", the CRYSTAL
// CAVERNS theme: 8-BIT SPARKLE ADVENTURE (Red's package). Bright, bouncy,
// wonder-struck spelunking — music-box glitter arps over a bouncing bass,
// a wide-eyed echo-cave middle, then the big adventuring finale. All chiptune
// voices (pulse/tri/noise only). 66 bars @ 88 BPM = 180.0s.
//   node render_crystal_theme.js crystal_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 88;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 66;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 4242; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
function kick(start, gain) { const d = SR * 0.1; for (let k = 0; k < d; k++) { const t = k / d; const f = 100 - 62 * t; const e = Math.pow(1 - t, 2.4); add(start + k, tri(f * k / SR) * gain * e); } }
function snap(start, gain) { for (let k = 0; k < SR * 0.05; k++) { const e = Math.exp(-k / (SR * 0.012)); add(start + k, nrnd() * gain * e); } }
function tick(start, gain) { for (let k = 0; k < SR * 0.02; k++) { const e = Math.exp(-k / (SR * 0.005)); add(start + k, nrnd() * gain * e); } }
// music-box chime: bright thin pulse w/ fast decay + octave ghost
function chime(start, dur, m, gain) {
  tone(start, dur, midi(m), gain, 'pulse', 0.18, 0.002, 0.14);
  tone(start, Math.round(dur * 0.6), midi(m + 12), gain * 0.35, 'pulse', 0.14, 0.002, 0.1);
}

// C major sparkle-adventure: C — G/B — Am — F  (I V vi IV, pure wonder)
const ROOTS = [36, 35, 33, 29], CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [53, 57, 60]];
// melody A: bouncing wonder tune (8ths)
const MEL_A = [
  [72, -1, 76, 74, 72, -1, 67, 69], [71, -1, 74, 72, 71, -1, 67, -1],
  [69, -1, 72, 71, 69, -1, 64, 67], [65, 67, 69, -1, 71, -1, 72, -1]
];
// melody B: soaring chorus
const MEL_B = [
  [76, -1, 79, -1, 76, 74, 72, 74], [74, -1, 79, -1, 74, 72, 71, 72],
  [72, 74, 76, -1, 72, -1, 69, 72], [67, -1, 71, -1, 72, -1, -1, -1]
];
// glitter arp per chord (16ths, up-down)
function arpNotes(chord) { const c = chord.map(m => m + 12); return [c[0], c[1], c[2], c[1] + 12 - 12, c[2], c[1], c[0], c[1]]; }

function sec(b) {
  if (b < 4) return { glitter: true, intro: true };                                    // music-box intro
  if (b < 12) return { drums: true, bass: true, mel: 'A', glitter: true };             // verse
  if (b < 20) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true }; // chorus
  if (b < 28) return { drums: true, bass: true, mel: 'A', glitter: true };             // verse 2
  if (b < 36) return { drums: 'half', bass: 'soft', echo: true, glitter: 'slow' };     // ECHO CAVE (wonder break)
  if (b < 44) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true }; // chorus 2
  if (b < 52) return { drums: true, bass: true, mel: 'A', glitter: true, up: 12, counter: true }; // bright verse octave-up
  if (b < 62) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true, up: 12, big: true }; // grand finale
  return { glitter: 'slow', outro: true };                                             // music-box outro
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // drums: bouncy kick 1+3, snap 2+4, glitter ticks on off-16ths
  if (s.drums) {
    const half = s.drums === 'half';
    kick(b0, 0.85); if (!half) kick(b0 + Math.round(2 * spb), 0.7);
    if (!half) { snap(b0 + Math.round(1 * spb), 0.4); snap(b0 + Math.round(3 * spb), 0.45); }
    for (let e = 0; e < 8; e++) if (e % 2 === 1) tick(b0 + Math.round(e * spb / 2), half ? 0.1 : 0.16);
  }
  // bass: bouncing octave pattern
  if (s.bass) {
    const soft = s.bass === 'soft';
    const patt = [0, 12, 0, 12, 0, 12, 7, 12];
    for (let e = 0; e < 8; e++) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.7), midi(root + patt[e]), soft ? 0.16 : 0.28, 'tri', 0, 0.003, 0.04);
  }
  // glitter arp: music-box 16ths high above
  if (s.glitter) {
    const slow = s.glitter === 'slow';
    const notes = arpNotes(chord);
    const step = slow ? spb / 2 : spb / 4;
    const count = slow ? 8 : 16;
    for (let e = 0; e < count; e++) chime(b0 + Math.round(e * step), Math.round(step * 0.9), notes[e % 8] + 12, s.intro || s.outro ? 0.11 : 0.055);
  }
  // melody: bright lead w/ paired detune shimmer
  const line = s.mel === 'A' ? MEL_A[t] : s.mel === 'B' ? MEL_B[t] : null;
  if (line) for (let e = 0; e < 8; e++) {
    const m = line[e]; if (m < 0) continue;
    const st = b0 + Math.round(e * spb / 2), du = Math.round(spb / 2 * 0.9);
    tone(st, du, midi(m + (s.up || 0)), 0.16, 'pulse', 0.5, 0.006, 0.05);
    tone(st, du, midi(m + (s.up || 0)) * 1.003, 0.07, 'pulse', 0.44, 0.006, 0.05);
  }
  // counter-line: low answering tri
  if (s.counter) [0, 2].forEach(beat => tone(b0 + Math.round(beat * spb + spb / 2), Math.round(spb * 0.8), midi(chord[beat === 0 ? 0 : 2] - 12), 0.12, 'tri', 0, 0.01, 0.1));
  // big finale pads
  if (s.big) chord.forEach(m => tone(b0, Math.round(bar * 0.95), midi(m), 0.045, 'pulse', 0.5, 0.5, 0.5));
  // ECHO CAVE: sparse chime calls w/ delayed quiet echoes (cave answers back)
  if (s.echo) {
    const call = [79, 76, 81, 74][t];
    chime(b0 + Math.round(spb * 0.5), Math.round(spb * 0.8), call, 0.14);
    chime(b0 + Math.round(spb * 1.75), Math.round(spb * 0.8), call, 0.06);      // echo 1
    chime(b0 + Math.round(spb * 3.0), Math.round(spb * 0.8), call - 12, 0.03);  // echo 2, lower
    if (t === 3) tone(b0, Math.round(bar * 0.9), midi(48), 0.05, 'tri', 0, 0.9, 0.8); // deep cave swell
  }
  // section-door: rising three-chime sweep
  if ([4, 12, 20, 28, 36, 44, 52, 62].includes(b)) [0, 4, 7].forEach((iv, i) => chime(b0 + Math.round(i * spb * 0.16), Math.round(spb * 0.5), 84 + iv, 0.09));
}
// final: one grand chime chord ringing out
[72, 76, 79, 84].forEach((m, i) => chime(Math.round(65 * bar + spb * (1 + i * 0.12)), Math.round(bar * 0.6), m, 0.1));

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'crystal_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
