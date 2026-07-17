// artdev/lunar/render_lunar_theme.js — "SEA OF TRANQUILITY", the LUNAR
// STATION theme: 8-BIT ZERO-G WONDER (Red's pick) — floaty, beautiful, vast…
// then it turns: the wonder sours into menace mid-track, and the return is
// never quite safe again. All chiptune voices (pulse/triangle/noise, NO sine).
// 54 bars @72 BPM = 180.0s exactly.
//   node render_lunar_theme.js lunar_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 72;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 54;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 2001; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
// glass bell: tri + slow decay + 12th partial
function bell(start, m, gain) {
  const d = Math.round(spb * 2.4);
  for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * 0.5)); add(start + k, (tri(midi(m) * k / SR) * 0.8 + tri(midi(m + 19) * k / SR) * 0.2) * gain * e); }
}
function click(start, gain) { for (let k = 0; k < SR * 0.02; k++) { const e = Math.exp(-k / (SR * 0.005)); add(start + k, nrnd() * gain * e); } }
function heartbeat(start, gain) { const d = SR * 0.16; for (let k = 0; k < d; k++) { const t = k / d; const f = 58 - 20 * t; const e = Math.pow(1 - t, 2.2); add(start + k, tri(f * k / SR) * gain * e); } }

// wonder: C Lydian pads | menace: darkened minor w/ tritone
const W_PADS = [[48, 55, 64, 71], [45, 52, 62, 69], [41, 48, 60, 66], [43, 50, 62, 67]];    // Cmaj7 Am9 Fmaj7#11 G6
const M_PADS = [[48, 54, 58, 63], [46, 51, 58, 61], [44, 51, 56, 60], [47, 53, 56, 62]];    // dark clusters
const BELL_A = [
  [84, -1, 79, -1, 83, -1, -1, 76], [81, -1, -1, 76, 79, -1, -1, -1],
  [78, -1, 83, -1, 86, -1, 84, -1], [79, -1, -1, -1, 74, -1, 76, -1]
];
const BELL_B = [
  [88, -1, 86, -1, 83, -1, 84, -1], [86, -1, -1, 81, 83, -1, -1, -1],
  [90, -1, 88, -1, 86, -1, 83, -1], [84, -1, -1, -1, 79, -1, 83, -1]
];

function sec(b) {
  if (b < 8) return { pads: 'W', arp: b >= 2, bells: null, drone: false, clicks: false };
  if (b < 20) return { pads: 'W', arp: true, bells: 'A', drone: false, clicks: false };
  if (b < 28) return { pads: 'M', arp: true, bells: 'A', drone: b >= 24, clicks: b >= 24, dim: true };  // first shadow
  if (b < 38) return { pads: 'W', arp: true, bells: 'B', drone: false, clicks: false, high: true };      // wonder B
  if (b < 48) return { pads: 'M', arp: false, bells: null, drone: true, clicks: true, menace: true };    // THE MENACE
  return { pads: 'W', arp: b < 52, bells: b < 52 ? 'A' : null, drone: true, clicks: b % 2 === 0, uneasy: true }; // uneasy return
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const pad = (s.pads === 'W' ? W_PADS : M_PADS)[t];
  // wide slow pads (two-bar swells)
  pad.forEach((m, i) => tone(b0, Math.round(bar * 0.98), midi(m), s.menace ? 0.06 : 0.075 - i * 0.008, i < 2 ? 'tri' : 'pulse', 0.5, 1.2, 1.0));
  // shimmering 16th arps drifting up (the starlight)
  if (s.arp) {
    for (let e = 0; e < 16; e++) {
      const m = pad[(e % 4)] + 24 + (e >= 8 ? 12 : 0);
      tone(b0 + Math.round(e * spb / 4), Math.round(spb / 4 * 0.75), midi(m + (s.dim && e % 5 === 0 ? -1 : 0)), 0.038, 'pulse', 0.22, 0.002, 0.03);
    }
  }
  // glass-bell melody (eighths, sparse)
  const line = s.bells === 'A' ? BELL_A[t] : s.bells === 'B' ? BELL_B[t] : null;
  if (line) for (let e = 0; e < 8; e++) {
    let m = line[e]; if (m < 0) continue;
    if (s.uneasy && (b + e) % 7 === 0) m -= 1; // the wrong note that stays
    bell(b0 + Math.round(e * spb / 2), m + (s.high ? 0 : -12) + 12, 0.09);
  }
  // menace drone: deep detuned pair + slow tritone slide
  if (s.drone) {
    tone(b0, Math.round(bar), midi(36), 0.12, 'tri', 0, 0.5, 0.5);
    tone(b0, Math.round(bar), midi(36) * 1.006, 0.08, 'tri', 0, 0.5, 0.5);
    if (s.menace && t === 2) tone(b0, Math.round(bar * 0.9), midi(42), 0.06, 'pulse', 0.5, 0.8, 0.6); // the tritone
  }
  // alien clicks skittering in the vents
  if (s.clicks) {
    [0.3, 1.1, 1.7, 2.6, 3.2, 3.7].forEach((beat, i) => { if ((b * 7 + i) % 3 !== 0) click(b0 + Math.round(beat * spb), 0.1 + (i % 2) * 0.05); });
  }
  // heartbeat under the menace
  if (s.menace) { heartbeat(b0, 0.7); heartbeat(b0 + Math.round(spb * 1.4), 0.45); }
  // section-door chime
  if ([8, 20, 28, 38, 48].includes(b)) bell(b0, 96, 0.1);
}
// final: one last high bell left ringing over a fading drone… and one click.
const fb = Math.round(53 * bar);
bell(fb + Math.round(spb), 95, 0.12);
click(fb + Math.round(spb * 3.2), 0.16);

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'lunar_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
