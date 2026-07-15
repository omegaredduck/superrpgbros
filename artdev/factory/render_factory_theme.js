// artdev/render_factory_theme.js — "ASSEMBLY LINE", the biome-4 theme: 8-BIT
// TECHNO/HOUSE (Red's pick). Four-on-the-floor kick, offbeat hats, house chord
// stabs, a driving pulse bass, techno 16th arps + a lead — all chiptune voices
// (pulse/triangle/noise, NO sine, per the project's strictly-8-bit rule).
// Renders a ~3:00 WAV preview. Tempo 126 BPM. Key A minor (i-VI-III-VII).
//   node artdev/render_factory_theme.js factory_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 126;
const spb = SR * 60 / BPM;          // samples per beat
const bar = spb * 4;                // 4/4 bar
const BARS = 94;                    // ~94 bars ≈ 179s
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

// ---- chiptune oscillators (phase in cycles) ----
function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 12345; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }

function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
// tonal voice with a simple AD/AR envelope + optional pitch glide
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
// ---- drums ----
function kick(start, gain) { const d = SR * 0.14; for (let k = 0; k < d; k++) { const t = k / d; const f = 150 - 110 * t; const e = Math.pow(1 - t, 2.2); add(start + k, tri(0 + (f * k / SR)) * gain * e); } for (let k = 0; k < SR * 0.008; k++) add(start + k, nrnd() * gain * 0.6 * (1 - k / (SR * 0.008))); }
function clap(start, gain) { for (let tap = 0; tap < 3; tap++) { const off = tap * SR * 0.011; for (let k = 0; k < SR * 0.09; k++) { const e = Math.exp(-k / (SR * 0.02)); add(start + off + k, nrnd() * gain * e); } } }
function hat(start, gain, open) { const d = SR * (open ? 0.11 : 0.03); for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * (open ? 0.05 : 0.012))); add(start + k, (nrnd() + nrnd()) * 0.5 * gain * e); } }
function snare(start, gain) { for (let k = 0; k < SR * 0.12; k++) { const e = Math.exp(-k / (SR * 0.03)); add(start + k, (nrnd() * 0.7 + tri(190 * k / SR) * 0.5) * gain * e); } }

// ---- progression: Am – F – C – G  (i VI III VII) ----
const ROOTS = [45, 41, 48, 43];                 // A2 F2 C3 G2 bass roots
const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 65]]; // Am7 Fmaj7 Cmaj7 G7
const SCALE = [57, 59, 60, 62, 64, 65, 67, 69]; // A natural minor for the lead
const LEAD = [ // a bar-by-bar motif (midi, or -1 rest) 8 eighths per bar, indices into feel
  [69, 67, 64, 67, 65, 64, 60, 64], [65, 64, 60, 64, 60, 57, 60, 62],
  [64, 67, 72, 67, 71, 67, 64, 67], [67, 62, 67, 71, 74, 71, 67, 62]
];

// section flags per bar
function section(b) {
  if (b < 8) return { kick: b >= 2, hat: true, bass: b >= 4, stab: false, arp: b >= 6, lead: false, clap: false, open: false };
  if (b < 24) return { kick: true, hat: true, bass: true, stab: b >= 16, arp: true, lead: b >= 20, clap: true, open: true };   // DROP A
  if (b < 40) return { kick: true, hat: true, bass: true, stab: true, arp: true, lead: true, clap: true, open: true };         // main
  if (b < 52) return { kick: false, hat: b % 2 === 0, bass: true, stab: true, arp: true, lead: false, clap: false, open: false }; // BREAKDOWN
  if (b < 56) return { kick: b >= 54, hat: true, bass: true, stab: true, arp: true, lead: false, clap: false, open: true };    // rebuild
  if (b < 84) return { kick: true, hat: true, bass: true, stab: true, arp: true, lead: true, clap: true, open: true };         // DROP B
  return { kick: b < 90, hat: b < 88, bass: true, stab: false, arp: b < 88, lead: false, clap: false, open: false };            // OUTRO
}

for (let b = 0; b < BARS; b++) {
  const s = section(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // drums
  for (let beat = 0; beat < 4; beat++) {
    const p = b0 + Math.round(beat * spb);
    if (s.kick) kick(p, 0.95);
    if (s.clap && (beat === 1 || beat === 3)) clap(p, 0.5);
    // hats on every 8th, offbeat accented
    if (s.hat) { hat(p, 0.16, false); hat(p + Math.round(spb / 2), s.open && beat === 3 ? 0.26 : 0.2, s.open && beat === 3); }
  }
  // bass: house octave-jump pattern on 8ths (root, root, +12, root ...)
  if (s.bass) { const patt = [0, 12, 0, 7, 0, 12, 0, 5]; for (let e = 0; e < 8; e++) { const p = b0 + Math.round(e * spb / 2); const dur = Math.round(spb / 2 * 0.82); tone(p, dur, midi(root + patt[e]), 0.34, 'pulse', 0.5, 0.003, 0.04); } }
  // chord stabs on the offbeats (the "and" of each beat) — classic house
  if (s.stab) { for (let beat = 0; beat < 4; beat++) { const p = b0 + Math.round(beat * spb + spb / 2); const dur = Math.round(spb * 0.22); chord.forEach((m, i) => tone(p, dur, midi(m + 12), 0.11, 'pulse', 0.34, 0.004, 0.08)); } }
  // techno arp: 16th notes cycling chord tones up 2 octaves
  if (s.arp) { for (let st = 0; st < 16; st++) { const p = b0 + Math.round(st * spb / 4); const m = chord[st % 4] + 12 + (st % 8 >= 4 ? 12 : 0); tone(p, Math.round(spb / 4 * 0.9), midi(m + 12), 0.09, 'pulse', 0.25, 0.002, 0.03); } }
  // lead melody (eighths)
  if (s.lead) { const line = LEAD[t]; for (let e = 0; e < 8; e++) { const m = line[e]; if (m > 0) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.9), midi(m + 12), 0.16, 'pulse', 0.5, 0.004, 0.06); } }
  // a downbeat "power" chord swell into each drop start
  if (b === 8 || b === 56) snare(b0, 0.4);
}

// ---- normalize + soft clip → 16-bit WAV ----
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'factory_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
