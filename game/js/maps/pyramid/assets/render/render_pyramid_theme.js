// artdev/pyramid/render_pyramid_theme.js — "THE ETERNAL CHILD", the PYRAMID
// PLUNDER theme: 8-BIT ANCIENT-CURSE DREAD (Red's pick). Slow ominous tomb
// crawl — low detuned chants, heavy tom heartbeat, snake-charmer hijaz lead
// w/ grace-note ornaments, gong + bell dread hits. Menace over melody.
// All chiptune voices (pulse/triangle/noise, NO sine). 63 bars @84 BPM = 180.0s.
//   node render_pyramid_theme.js pyramid_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 84;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 63;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 999; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
function tone(start, dur, freq, gain, type, duty, atk, rel, freq2) {
  atk = atk == null ? 0.004 : atk; rel = rel == null ? 0.05 : rel;
  const A = Math.max(1, atk * SR), R = Math.max(1, rel * SR);
  let ph = 0;
  for (let k = 0; k < dur; k++) {
    const f = freq2 ? freq + (freq2 - freq) * (k / dur) : freq;
    ph += f / SR;
    let s = type === 'tri' ? tri(ph) : pulse(ph, duty || 0.5);
    let e = 1;
    if (k < A) e = k / A; else if (k > dur - R) e = Math.max(0, (dur - k) / R);
    add(start + k, s * gain * e);
  }
}
// drums
function deepTom(start, gain, lo) { const d = SR * 0.22; for (let k = 0; k < d; k++) { const t = k / d; const f = (lo ? 78 : 96) - (lo ? 34 : 42) * t; const e = Math.pow(1 - t, 2); add(start + k, tri(f * k / SR) * gain * e); } }
function gong(start, gain) { const d = SR * 1.6; for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * 0.55)); add(start + k, (tri(52 * k / SR) * 0.5 + tri(78.3 * k / SR) * 0.3 + nrnd() * 0.25 * Math.exp(-k / (SR * 0.08))) * gain * e); } }
function shaker(start, gain) { for (let k = 0; k < SR * 0.045; k++) { const e = Math.exp(-k / (SR * 0.014)); add(start + k, nrnd() * gain * e); } }
function darkBell(start, gain, m) { const d = SR * 0.9; const f = midi(m); for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * 0.3)); add(start + k, (tri(f * k / SR) * 0.7 + tri(f * 2.02 * k / SR) * 0.25) * gain * e); } }
// snake-charmer note w/ grace-note ornament sliding in
function charm(start, dur, m, gain, orn) {
  if (orn) tone(start - Math.round(spb * 0.09), Math.round(spb * 0.09), midi(m + orn), gain * 0.8, 'pulse', 0.4, 0.004, 0.02);
  tone(start, dur, midi(m), gain, 'pulse', 0.4, 0.006, 0.07);
  tone(start, dur, midi(m) * 1.005, gain * 0.35, 'pulse', 0.32, 0.006, 0.07); // shimmer detune
}

// D hijaz (phrygian dominant): D Eb F# G A Bb C
const D = 50;
const CHANT = [[38, 45], [39, 46], [38, 45], [36, 43]]; // D2+A2 / Eb2+Bb2 / D / C2+G2 — slow dread pads
// snake lead phrases (8ths; -1 rest), hijaz colors
const LEAD_A = [
  [62, -1, 63, 62, 66, -1, 62, -1], [63, -1, 62, 63, 60, -1, 58, -1],
  [62, 66, 67, 66, 63, 62, 63, -1], [62, -1, -1, -1, 58, 60, 62, -1]
];
const LEAD_B = [
  [69, -1, 70, 69, 66, -1, 67, 66], [63, -1, 66, 63, 62, -1, 60, 58],
  [69, 70, 72, 70, 69, 66, 67, -1], [62, -1, 63, 62, 58, -1, 62, -1]
];

function sec(b) {
  if (b < 8) return { drone: b >= 1, heart: b >= 4, chant: false, lead: null, shk: false, heavy: false };            // tomb door
  if (b < 20) return { drone: true, heart: true, chant: true, lead: null, shk: false, heavy: false };                 // the crawl
  if (b < 32) return { drone: true, heart: true, chant: true, lead: 'A', shk: true, heavy: false };                   // charm verse
  if (b < 40) return { drone: true, heart: true, chant: true, lead: null, shk: true, heavy: true, stabs: true };      // dread build
  if (b < 54) return { drone: true, heart: true, chant: true, lead: 'B', shk: true, heavy: true };                    // curse climax
  return { drone: true, heart: b < 60, chant: b < 58, lead: b >= 58 ? 'A' : null, shk: false, heavy: false, fade: true }; // collapse
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const [c1, c2] = CHANT[t];
  // tomb drone — deep detuned triangle pair, whole-bar
  if (s.drone) {
    tone(b0, Math.round(bar), midi(c1 - 12), 0.16, 'tri', 0, 0.3, 0.4);
    tone(b0, Math.round(bar), midi(c1 - 12) * 1.004, 0.1, 'tri', 0, 0.3, 0.4);
  }
  // chant — two low pulses, slow attack, like voices under the floor
  if (s.chant) {
    tone(b0, Math.round(bar * 0.96), midi(c1), 0.11, 'pulse', 0.5, 0.5, 0.5);
    tone(b0 + Math.round(bar * 0.06), Math.round(bar * 0.9), midi(c2), 0.08, 'pulse', 0.5, 0.6, 0.5);
    if (s.heavy) tone(b0, Math.round(bar * 0.96), midi(c1 + 12), 0.05, 'pulse', 0.44, 0.6, 0.5);
  }
  // heartbeat toms: beats 1 and the "and" of 2 (lub-DUB), doubled when heavy
  if (s.heart) {
    deepTom(b0, 0.8, true);
    deepTom(b0 + Math.round(spb * 1.5), 0.55, false);
    if (s.heavy) { deepTom(b0 + Math.round(spb * 2), 0.7, true); deepTom(b0 + Math.round(spb * 3.5), 0.5, false); }
  }
  // shaker 8ths, soft — sand hissing through cracks
  if (s.shk) for (let e = 0; e < 8; e++) shaker(b0 + Math.round(e * spb / 2), e % 2 ? 0.08 : 0.05);
  // dissonant dread stabs in the build
  if (s.stabs && (t === 1 || t === 3)) {
    [c1 + 12, c1 + 13, c1 + 18].forEach(m => tone(b0 + Math.round(spb * 2), Math.round(spb * 0.6), midi(m), 0.07, 'pulse', 0.3, 0.01, 0.25));
  }
  // snake-charmer lead w/ ornaments
  const line = s.lead === 'A' ? LEAD_A[t] : s.lead === 'B' ? LEAD_B[t] : null;
  if (line) {
    for (let e = 0; e < 8; e++) {
      const m = line[e]; if (m < 0) continue;
      const orn = (e === 0 || e === 4) ? 1 : 0; // grace from a half-step above
      charm(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.88), m, s.fade ? 0.1 : 0.15, orn);
    }
  }
  // gong at section doors; dark bell tolls through the climax
  if ([0, 8, 20, 32, 40, 54].includes(b)) gong(b0, b === 0 ? 0.55 : 0.4);
  if (b >= 40 && b < 54 && t === 0) darkBell(b0, 0.22, 62);
}
// final: one last heartbeat, a child's-bell note, and the gong fading alone
const fb = Math.round(62 * bar);
deepTom(fb, 0.9, true);
darkBell(fb + Math.round(spb), 0.2, 74); // small, high, wrong — the child
gong(fb + Math.round(spb * 2), 0.5);

// normalize + soft clip -> 16-bit WAV
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'pyramid_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
