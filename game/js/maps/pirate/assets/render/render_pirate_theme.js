// artdev/pirate/render_pirate_theme.js — "THE KRAKEN'S SHANTY", the PIRATE
// SHIP theme: 8-BIT SEA SHANTY GONE GHOSTLY (Red's package). A rowdy crew
// shanty — squeeze-box lead, stomp-and-clap, crew "HEY!" hits — that keeps
// getting pulled under: detuned ghost-choir pads and a cold fathoms section
// before the final rowdy chorus. All chiptune voices. 75 bars @100 BPM = 180.0s.
//   node render_pirate_theme.js pirate_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 100;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 75;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 1717; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
function stomp(start, gain) { const d = SR * 0.12; for (let k = 0; k < d; k++) { const t = k / d; const f = 95 - 55 * t; const e = Math.pow(1 - t, 2.2); add(start + k, tri(f * k / SR) * gain * e); } }
function clap(start, gain) { for (let tap = 0; tap < 2; tap++) { const off = tap * SR * 0.012; for (let k = 0; k < SR * 0.06; k++) { const e = Math.exp(-k / (SR * 0.016)); add(start + off + k, nrnd() * gain * e); } } }
function hey(start, gain) { // crew shout: noise burst + falling low tone
  for (let k = 0; k < SR * 0.12; k++) { const e = Math.exp(-k / (SR * 0.045)); add(start + k, nrnd() * gain * 0.5 * e); }
  tone(start, Math.round(SR * 0.14), midi(50), gain * 0.8, 'pulse', 0.5, 0.005, 0.06);
  tone(start + Math.round(SR * 0.02), Math.round(SR * 0.1), midi(45), gain * 0.4, 'pulse', 0.5, 0.005, 0.06);
}
// squeeze-box note: paired detuned pulses (accordion reeds)
function box(start, dur, m, gain) {
  tone(start, dur, midi(m), gain, 'pulse', 0.4, 0.008, 0.05);
  tone(start, dur, midi(m) * 1.004, gain * 0.5, 'pulse', 0.34, 0.008, 0.05);
}

// D dorian shanty: Dm — F — C — Dm  (with G major color)
const ROOTS = [38, 41, 36, 38], CH = [[62, 65, 69], [65, 69, 72], [60, 64, 67], [62, 65, 69]];
// shanty melody (8ths; classic drive)
const MEL_V = [
  [62, -1, 62, 64, 65, -1, 64, 62], [65, -1, 65, 67, 69, -1, 67, 65],
  [67, 67, 64, 64, 60, -1, 62, 64], [62, -1, 60, 58, 62, -1, -1, -1]
];
const MEL_C = [
  [69, -1, 69, 67, 65, 67, 69, -1], [72, -1, 72, 69, 67, -1, 65, 67],
  [69, 67, 65, 64, 62, 64, 65, 67], [62, -1, 62, -1, 62, -1, -1, -1]
];

function sec(b) {
  if (b < 8) return { boxSolo: true, mel: 'V' };                                        // concertina intro
  if (b < 20) return { drums: true, bass: true, mel: 'V', box2: true };                  // verse
  if (b < 28) return { drums: true, bass: true, mel: 'C', box2: true, hey: true };       // chorus
  if (b < 40) return { drums: true, bass: true, mel: 'V', box2: true, ghost: 0.4 };      // verse, ghosts creeping
  if (b < 48) return { drums: 'half', bass: true, mel: null, ghost: 1, fathoms: true };  // THE FATHOMS (pulled under)
  if (b < 56) return { drums: true, bass: true, mel: 'C', box2: true, hey: true, ghost: 0.5 }; // ghostly chorus
  if (b < 68) return { drums: true, bass: true, mel: 'C', box2: true, hey: true, up: 12 }; // final rowdy chorus (octave up)
  return { drums: b < 72, bass: true, mel: b < 72 ? 'V' : null, ghost: 0.8, outro: true }; // ghost outro
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // stomp-clap engine: stomp 1 & 3, clap 2 & 4, extra stomp "and-of-4"
  if (s.drums) {
    const half = s.drums === 'half';
    stomp(b0, 0.9); if (!half) stomp(b0 + Math.round(2 * spb), 0.8);
    if (!half) { clap(b0 + Math.round(1 * spb), 0.5); clap(b0 + Math.round(3 * spb), 0.55); stomp(b0 + Math.round(3.5 * spb), 0.4); }
  }
  // bass: driving root-fifth on 8ths
  if (s.bass) {
    const patt = [0, 0, 7, 0, 0, 7, 0, 5];
    for (let e = 0; e < 8; e++) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.8), midi(root + patt[e]), s.fathoms ? 0.2 : 0.3, 'tri', 0, 0.003, 0.04);
  }
  // squeeze-box chord pumps on offbeats
  if (s.box2) [0, 1, 2, 3].forEach(beat => {
    const p = b0 + Math.round(beat * spb + spb / 2);
    chord.forEach(m => tone(p, Math.round(spb * 0.24), midi(m), 0.06, 'pulse', 0.36, 0.006, 0.05));
  });
  // melody
  const line = s.mel === 'V' ? MEL_V[t] : s.mel === 'C' ? MEL_C[t] : null;
  if (line) for (let e = 0; e < 8; e++) {
    const m = line[e]; if (m < 0) continue;
    box(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * (s.boxSolo ? 0.95 : 0.88)), m + (s.up || 0), s.boxSolo ? 0.17 : 0.15);
  }
  // crew HEY! on the and-of-2 every other chorus bar
  if (s.hey && t % 2 === 1) hey(b0 + Math.round(1.5 * spb), 0.5);
  // ghost-choir pads: detuned minor cluster swelling
  if (s.ghost) {
    const g = typeof s.ghost === 'number' ? s.ghost : 1;
    [root + 24, root + 27, root + 31].forEach((m, i) => {
      tone(b0, Math.round(bar * 0.98), midi(m), 0.05 * g - i * 0.008, 'pulse', 0.5, 0.8, 0.7);
      tone(b0, Math.round(bar * 0.98), midi(m) * 1.007, 0.03 * g, 'pulse', 0.5, 0.8, 0.7);
    });
  }
  // fathoms: deep sonar blips + slow wail
  if (s.fathoms) {
    tone(b0 + Math.round(spb * 1.2), Math.round(spb * 0.3), midi(86), 0.07, 'tri', 0, 0.002, 0.25);
    if (t === 1) tone(b0, Math.round(bar * 0.9), midi(62), 0.06, 'tri', 0, 1.0, 0.8);
    if (t === 3) tone(b0, Math.round(bar * 0.9), midi(61), 0.06, 'tri', 0, 1.0, 0.8); // the wail bends down
  }
  // section-door: ship bell? banned — use a low concertina swell instead
  if ([8, 20, 28, 40, 48, 56, 68].includes(b)) chord.forEach(m => tone(b0, Math.round(spb * 1.4), midi(m - 12), 0.07, 'pulse', 0.4, 0.3, 0.5));
}
// final: one last crew HEY! and a ghost breath
hey(Math.round(74 * bar + spb), 0.6);
tone(Math.round(74 * bar + spb * 2), Math.round(bar * 0.5), midi(74), 0.08, 'tri', 0, 0.4, 0.6);

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'pirate_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
