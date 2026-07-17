// artdev/abyss/render_abyss_theme.js — "UNDER THE TRENCH", THE ABYSS
// theme, TAKE 2 (Red: "disney little mermaid vibe" — Under-the-Sea
// calypso). Steel-drum chiptune lead, offbeat skank chords, walking
// calypso bass, shaker + clave, horn-section answers, a swaying
// half-time lagoon bridge, key-up finale w/ steel gliss. NO SLOW INTRO.
// All chiptune voices (pulse/tri/noise). 90 bars @ 120 BPM = 180.0s.
//   node render_abyss_theme.js abyss_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 120;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 90;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 8181; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
function tone(start, dur, freq, gain, type, duty, atk, rel, bendTo) {
  atk = atk == null ? 0.003 : atk; rel = rel == null ? 0.04 : rel;
  const A = Math.max(1, atk * SR), R = Math.max(1, rel * SR);
  let ph = 0;
  for (let k = 0; k < dur; k++) {
    const f = bendTo ? freq * Math.pow(bendTo, k / dur) : freq;
    ph += f / SR;
    let s = type === 'tri' ? tri(ph) : pulse(ph, duty || 0.5);
    let e = 1;
    if (k < A) e = k / A; else if (k > dur - R) e = Math.max(0, (dur - k) / R);
    add(start + k, s * gain * e);
  }
}
// STEEL DRUM — tri with bright attack pop + faint octave shimmer, bouncy decay
function steel(start, m, gain, len) {
  const d = Math.round(len || spb * 0.42);
  const f0 = midi(m);
  let ph = 0, ph2 = 0;
  for (let k = 0; k < d; k++) {
    const f = f0 * (1 + 0.045 * Math.exp(-k / (SR * 0.006))); // attack pop
    ph += f / SR; ph2 += (f * 2.01) / SR;
    const e = Math.min(1, k / (SR * 0.002)) * Math.exp(-k / (SR * 0.11));
    add(start + k, (tri(ph) * 0.8 + tri(ph2) * 0.28) * gain * e);
  }
}
// steel gliss (fast run up)
function gliss(start, m0, m1, gain, dur) {
  const steps = Math.abs(m1 - m0);
  for (let i = 0; i <= steps; i++) steel(start + Math.round(i * dur / steps), m0 + i * Math.sign(m1 - m0), gain * (0.7 + 0.3 * i / steps), dur / steps * 2);
}
function bass(start, dur, m, gain) { tone(start, dur, midi(m), gain, 'tri', 0, 0.005, 0.05); }
function skank(start, chord, gain) { chord.forEach(m => tone(start, Math.round(spb * 0.16), midi(m + 12), gain, 'pulse', 0.32, 0.002, 0.05)); }
function horn(start, dur, m, gain) { tone(start, dur, midi(m), gain, 'pulse', 0.36, 0.015, 0.07); tone(start, dur, midi(m) * 1.005, gain * 0.5, 'pulse', 0.3, 0.02, 0.07); }
function shaker(start, gain) { for (let k = 0; k < SR * 0.025; k++) add(start + k, nrnd() * gain * Math.exp(-k / (SR * 0.009))); }
function clave(start, gain) { tone(start, SR * 0.035, 1660, gain, 'tri', 0, 0.001, 0.03); }
function kickS(start, gain) { const d = SR * 0.08; for (let k = 0; k < d; k++) { const t = k / d; add(start + k, tri((110 - 70 * t) * k / SR) * gain * Math.pow(1 - t, 2)); } }
function rim(start, gain) { for (let k = 0; k < SR * 0.04; k++) { const e = Math.exp(-k / (SR * 0.012)); add(start + k, (nrnd() * 0.5 + tri(400 * k / SR) * 0.5) * gain * e); } }
function bubbleFx(start, gain) { [0, 0.12, 0.26].forEach((dt, i) => tone(start + Math.round(dt * SR), SR * 0.06, 620 + i * 240, gain * (1 - i * 0.25), 'tri', 0, 0.004, 0.04, 1.35)); }

// C major calypso: C — F — G — C (with Am color on B section)
const PROG_A = ['C', 'F', 'G', 'C'], PROG_B = ['Am', 'F', 'C', 'G'];
const CHORD = { C: [60, 64, 67], F: [57, 60, 65], G: [55, 59, 62], Am: [57, 60, 64] };
const ROOT = { C: 36, F: 41, G: 43, Am: 45 - 12 }, FIFTH = { C: 43, F: 48, G: 38, Am: 40 };
// TUNE A — bouncy Under-the-Sea-style melody (8th grid w/ syncopation)
const TUNE_A = [
  [72, -1, 76, 79, -1, 76, 79, -1], [81, 79, 77, -1, 77, -1, 76, 74],
  [74, -1, 71, 74, -1, 71, 74, 76], [72, -1, 76, -1, 72, -1, -1, -1],
  [72, -1, 76, 79, -1, 76, 79, 81], [84, -1, 81, -1, 77, 79, 81, -1],
  [79, 77, 76, -1, 74, -1, 71, 69], [72, -1, -1, 72, 76, 72, -1, -1],
];
// TUNE B — call (steel) + response (horns) phrases
const CALL_B = [
  [76, 79, 81, -1, -1, -1, -1, -1], [-1, -1, -1, -1, 77, 76, 74, -1],
  [72, 76, 79, -1, -1, -1, -1, -1], [-1, -1, -1, -1, 74, 76, 79, -1],
];
const RESP_B = [
  [-1, -1, -1, -1, 64, 65, 67, -1], [69, -1, 67, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, 64, 67, 72, -1], [71, -1, 67, -1, -1, -1, -1, -1],
];
// lagoon bridge melody (slow, romantic quarters)
const LAGOON = [[76, 74, 72, 74], [77, 76, 74, 72], [76, 74, 72, 69], [67, 69, 71, 74]];

function sec(b) {
  if (b < 18) return { groove: true, tuneA: true };                        // straight in — the hook
  if (b < 34) return { groove: true, tuneB: true, prog: 'B' };             // call + response
  if (b < 42) return { groove: true, bassSolo: true, percBreak: true };    // walking-bass + perc break
  if (b < 58) return { groove: true, tuneA: true, harm: true, horns: true }; // full band reprise
  if (b < 66) return { lagoon: true };                                     // half-time sway
  if (b < 82) return { groove: true, tuneA: true, harm: true, horns: true, up: 2, party: true }; // key-up finale
  return { tag: b - 82 };                                                  // big tag
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const b0 = Math.round(b * bar);
  const prog = s.prog === 'B' ? PROG_B : PROG_A;
  const ch = prog[b % 4], chord = CHORD[ch].map(m => m + (s.up || 0));
  const root = ROOT[ch] + (s.up || 0), fifth = FIFTH[ch] + (s.up || 0);
  // ---- calypso groove
  if (s.groove) {
    // kick on 1 + 3, rim on 2 + 4
    kickS(b0, 0.8); kickS(b0 + Math.round(2 * spb), 0.7);
    rim(b0 + Math.round(1 * spb), 0.3); rim(b0 + Math.round(3 * spb), 0.32);
    // shaker 16ths (accent offbeats)
    for (let e = 0; e < 16; e++) shaker(b0 + Math.round(e * spb / 4), e % 2 ? 0.09 : 0.05);
    // 3-2 son clave across 2 bars
    const claveHits = b % 2 === 0 ? [0, 0.75, 1.5] : [1, 2]; // in beats
    claveHits.forEach(bt => clave(b0 + Math.round(bt * spb), 0.16));
    // skank chords on the offbeats (the calypso "chick")
    [0.5, 1.5, 2.5, 3.5].forEach(bt => skank(b0 + Math.round(bt * spb), chord, 0.07));
    // walking bass: root · 5th · 6th · leading (calypso bounce)
    if (!s.bassSolo) {
      bass(b0, Math.round(spb * 0.8), root, 0.3);
      bass(b0 + spb, Math.round(spb * 0.7), fifth, 0.24);
      bass(b0 + spb * 2, Math.round(spb * 0.8), root + 9, 0.26);
      bass(b0 + spb * 3, Math.round(spb * 0.7), fifth, 0.24);
    } else { // walking-bass feature: busier line up front
      [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((bt, i) => bass(b0 + Math.round(bt * spb), Math.round(spb * 0.45), [root, root + 4, fifth, root + 9, root + 12, root + 9, fifth, root + 4][i], 0.3 - (i % 2) * 0.05));
    }
  }
  // ---- TUNE A — steel drum hook
  if (s.tuneA) {
    TUNE_A[b % 8].forEach((m, e) => { if (m > 0) steel(b0 + Math.round(e * spb / 2), m + (s.up || 0), 0.17); });
    if (s.harm) TUNE_A[b % 8].forEach((m, e) => { if (m > 0) steel(b0 + Math.round(e * spb / 2), m + (s.up || 0) - 12 + 7, 0.06, spb * 0.3); }); // harmony a 5th below-ish
  }
  // ---- TUNE B — call + response
  if (s.tuneB) {
    CALL_B[b % 4].forEach((m, e) => { if (m > 0) steel(b0 + Math.round(e * spb / 2), m, 0.18); });
    RESP_B[b % 4].forEach((m, e) => { if (m > 0) horn(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.85), m, 0.1); });
  }
  // ---- horn pads under the reprise/finale (sustained warm thirds)
  if (s.horns && b % 2 === 0) [chord[0], chord[2]].forEach(m => horn(b0 + Math.round(spb * 2), Math.round(spb * 1.6), m - 12, 0.045));
  // ---- percussion break flourishes
  if (s.percBreak) {
    if (b % 2 === 1) { [2.25, 2.5, 2.75, 3, 3.25, 3.5].forEach((bt, i) => clave(b0 + Math.round(bt * spb), 0.14 + i * 0.01)); }
    bubbleFx(b0 + Math.round(spb * 1.2), 0.08);
  }
  // ---- LAGOON bridge: half-time sway, dreamy
  if (s.lagoon) {
    kickS(b0, 0.6); rim(b0 + Math.round(2 * spb), 0.24);
    for (let e = 0; e < 8; e++) shaker(b0 + Math.round(e * spb / 2), 0.05);
    chord.forEach((m, i) => tone(b0, Math.round(bar * 0.95), midi(m) * (1 + (i - 1) * 0.004), 0.05, 'pulse', 0.5, 0.08, 0.3)); // string pad
    LAGOON[b % 4].forEach((m, i) => steel(b0 + Math.round(i * spb), m, 0.14, spb * 0.9)); // singing steel
    bass(b0, Math.round(spb * 1.8), root, 0.26); bass(b0 + spb * 2, Math.round(spb * 1.8), fifth, 0.22);
    if (b % 4 === 3) gliss(b0 + Math.round(spb * 3), 72, 79, 0.09, Math.round(spb * 0.9)); // shimmer run
  }
  // ---- party extras (finale): steel flourish runs between phrases
  if (s.party && b % 4 === 3) gliss(b0 + Math.round(spb * 2.5), 74 + (s.up || 0), 86 + (s.up || 0), 0.11, Math.round(spb * 1.2));
  // ---- section doors: gliss up + bubble
  if ([18, 34, 42, 58, 66, 82].includes(b)) { gliss(b0 - Math.round(spb), 67, 76, 0.08, Math.round(spb * 0.8)); bubbleFx(b0, 0.07); }
  // ---- TAG (last 8): big syncopated hits + gliss + splash out
  if (s.tag != null) {
    const tg = s.tag, D = CHORD.C.map(m => m + 2);
    if (tg < 4) { // hits on the clave
      const hits = tg % 2 === 0 ? [0, 0.75, 1.5] : [1, 2];
      hits.forEach(bt => { kickS(b0 + Math.round(bt * spb), 0.8); D.forEach(m => steel(b0 + Math.round(bt * spb), m + 12, 0.12)); bass(b0 + Math.round(bt * spb), Math.round(spb * 0.5), 38, 0.3); });
      for (let e = 0; e < 16; e++) shaker(b0 + Math.round(e * spb / 4), 0.06);
      if (tg === 3) gliss(b0 + Math.round(spb * 2.5), 62, 86, 0.13, Math.round(spb * 1.4)); // THE big gliss
    } else if (tg < 7) {
      kickS(b0, 0.8); rim(b0 + Math.round(2 * spb), 0.3);
      [0.5, 1.5, 2.5, 3.5].forEach(bt => skank(b0 + Math.round(bt * spb), D, 0.07));
      TUNE_A[tg].forEach((m, e) => { if (m > 0) steel(b0 + Math.round(e * spb / 2), m + 2, 0.16); });
      bass(b0, Math.round(spb * 0.8), 38, 0.3); bass(b0 + spb * 2, Math.round(spb * 0.8), 45, 0.26);
    } else { // final chord: everything + splash
      kickS(b0, 0.9); D.forEach(m => { steel(b0, m + 12, 0.16, bar * 0.7); horn(b0, Math.round(bar * 0.8), m, 0.07); });
      bass(b0, Math.round(bar * 0.9), 38, 0.32);
      bubbleFx(b0 + Math.round(spb), 0.12); bubbleFx(b0 + Math.round(spb * 2.2), 0.09);
      for (let k = 0; k < SR * 0.5; k++) add(b0 + Math.round(spb * 0.1) + k, nrnd() * 0.12 * Math.exp(-k / (SR * 0.12))); // splash
    }
  }
}

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.05); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'abyss_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm calypso');
