// artdev/west/render_west_theme.js — "HIGH NOON HOEDOWN", the WILD WEST
// TOWN theme, TAKE 1 (Red: 8-BIT BLUEGRASS — crazy banjo + great guitar
// solo). Forward-roll chiptune banjo with the high-G drone string,
// boom-chick bass + mandolin chop, train brushes, a CRAZY double-time
// banjo breakdown with stop-time bars, and a 24-bar chiptune guitar solo
// full of bends. All chiptune voices (pulse/tri/noise). 105 bars @ 140
// BPM = 180.0s exactly.
//   node render_west_theme.js west_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 140;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 105;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 4700; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
// BANJO — bright thin pulse, plucky exponential decay, tiny pitch pop
function banjo(start, m, gain, len) {
  const d = Math.round(len || spb * 0.22);
  let ph = 0; const f0 = midi(m);
  for (let k = 0; k < d; k++) {
    const f = f0 * (1 + 0.012 * Math.exp(-k / (SR * 0.004))); // attack pop
    ph += f / SR;
    const e = Math.exp(-k / (SR * 0.045));
    add(start + k, pulse(ph, 0.22) * gain * e);
  }
}
// GUITAR — rounder pulse, slower decay, supports bends
function gtr(start, dur, m, gain, bendTo, vib) {
  let ph = 0; const f0 = midi(m);
  for (let k = 0; k < dur; k++) {
    let f = bendTo ? f0 * Math.pow(midi(bendTo) / f0, Math.min(1, k / (dur * 0.45))) : f0;
    if (vib && k > dur * 0.4) f *= 1 + 0.011 * Math.sin(k / SR * 2 * Math.PI * 5.6);
    ph += f / SR;
    const e = Math.min(1, k / (SR * 0.004)) * Math.exp(-k / (SR * 0.22));
    add(start + k, pulse(ph, 0.36) * gain * e);
  }
}
// BASS boom — triangle with soft thump
function boom(start, m, gain) {
  tone(start, Math.round(spb * 0.85), midi(m), gain, 'tri', 0, 0.004, 0.08);
  const d = SR * 0.05; for (let k = 0; k < d; k++) { const t = k / d; add(start + k, tri((90 - 55 * t) * k / SR) * 0.28 * gain * (1 - t)); }
}
// mandolin CHOP on the backbeat — tight noise+chord snip
function chop(start, chord, gain) {
  for (let k = 0; k < SR * 0.035; k++) add(start + k, nrnd() * gain * 0.7 * Math.exp(-k / (SR * 0.008)));
  chord.forEach(m => tone(start, Math.round(SR * 0.045), midi(m + 12), gain * 0.3, 'pulse', 0.3, 0.001, 0.03));
}
function brush(start, gain, open) { const d = SR * (open ? 0.07 : 0.018); for (let k = 0; k < d; k++) add(start + k, nrnd() * gain * Math.exp(-k / (SR * (open ? 0.024 : 0.006)))); }
function clipclop(start, gain) { tone(start, SR * 0.03, 780, gain, 'tri', 0, 0.001, 0.02, 0.72); }
function trainWhistle(start, gain) { [67, 74].forEach(m => tone(start, Math.round(spb * 1.6), midi(m), gain * 0.5, 'pulse', 0.5, 0.05, 0.3, 0.97)); }

// ---- harmony: G-major hoedown. Per-bar chord map on an 8-bar loop -------
// G G C G / G G D G  (roots for bass; chords for chop/backup)
const PROG = ['G', 'G', 'C', 'G', 'G', 'G', 'D', 'G'];
const CHORD = { G: [55, 59, 62], C: [55, 60, 64], D: [57, 62, 66] };
const ROOT = { G: 43, C: 48, D: 50 }, FIFTH = { G: 50, C: 43, D: 45 };
const DRONE = 79; // banjo 5th string, high G — rings over everything

// forward roll (T-I-M): chord tones + drone, 8 16ths, played twice a bar
function rollPattern(ch, alt) {
  const c = CHORD[ch];
  return alt
    ? [c[1] + 12, DRONE, c[2] + 12, c[1] + 12, DRONE, c[0] + 12, c[2] + 12, DRONE]
    : [c[0] + 12, c[1] + 12, DRONE, c[0] + 12, c[2] + 12, DRONE, c[1] + 12, DRONE];
}
// TUNE A — fiddle-ish melody, 8ths, 4-bar phrase ×2 per 8 bars
const TUNE_A = [
  [79, 78, 79, 76, 74, 72, 71, 69], [67, 69, 71, 72, 74, 76, 74, 71],
  [72, 74, 72, 71, 69, 67, 69, 71], [67, -1, 67, 74, 71, -1, 67, -1],
  [79, 78, 79, 76, 74, 72, 71, 69], [67, 69, 71, 72, 74, 76, 79, 76],
  [74, 76, 74, 72, 71, 72, 69, 71], [67, -1, 62, 64, 67, -1, -1, -1],
];
// TUNE B — up the neck, calls + answers
const TUNE_B = [
  [83, -1, 81, 79, 81, 79, 76, 74], [79, 76, 74, 71, 74, -1, 79, -1],
  [84, -1, 84, 83, 81, 79, 81, 83], [79, -1, 74, 76, 79, -1, -1, -1],
  [83, -1, 81, 79, 81, 79, 76, 74], [79, 76, 74, 71, 67, 69, 71, 74],
  [76, 74, 72, 71, 69, 71, 67, 66], [67, -1, 67, -1, 67, -1, -1, -1],
];
// crazy breakdown banjo lines — 16th runs w/ chromatics (per 8-bar chords)
function crazyRun(ch, v) {
  const c = CHORD[ch];
  const runs = [
    [c[0] + 12, c[1] + 12, DRONE, c[2] + 12, c[1] + 12, DRONE, c[0] + 24 - 12, DRONE,
     c[2] + 12, DRONE, c[1] + 12, c[0] + 12, DRONE, c[1] + 12, c[2] + 12, DRONE],
    [67, 68, 69, 70, 71, DRONE, 74, DRONE, 76, DRONE, 74, 71, 69, DRONE, 67, DRONE],
    [79, DRONE, 78, DRONE, 76, DRONE, 74, DRONE, 72, 71, 69, 67, 66, 67, 69, 71],
    [c[0] + 12, c[2] + 12, c[1] + 24, DRONE, c[2] + 12, c[0] + 24, DRONE, c[1] + 12,
     DRONE, c[2] + 12, c[0] + 12, DRONE, c[1] + 12, c[2] + 12, DRONE, DRONE],
  ];
  return runs[v % 4];
}
// GUITAR SOLO — 24 bars of licks (per-bar functions get b0 + chord)
function soloBar(i, b0, ch) {
  const q = spb / 4, c = CHORD[ch];
  const L16 = (arr, g) => arr.forEach((m, e) => { if (m > 0) gtr(b0 + Math.round(e * q), Math.round(q * 0.92), m, g || 0.16); });
  switch (i % 12) {
    case 0: L16([67, 69, 71, 74, 76, 74, 71, 69, 67, 69, 71, 74, 76, 79, 76, 74]); break;
    case 1: gtr(b0, Math.round(spb * 1.4), 71, 0.18, 74, true); L16([-1, -1, -1, -1, -1, -1, 74, 76, 79, 76, 74, 71, 74, 71, 69, 71]); break;
    case 2: L16([74, 76, 79, 76, 74, 71, 69, 71, 74, 76, 79, 81, 79, 76, 74, 76]); break;
    case 3: gtr(b0, Math.round(spb), 79, 0.18, null, true); gtr(b0 + Math.round(spb * 1.5), Math.round(spb * 0.4), 76, 0.15); gtr(b0 + Math.round(spb * 2), Math.round(spb * 1.8), 74, 0.17, 76, true); break;
    case 4: [0, 1, 2, 3].forEach(bt => { gtr(b0 + Math.round(bt * spb), Math.round(spb * 0.22), c[1] + 12, 0.13); gtr(b0 + Math.round((bt + 0.5) * spb), Math.round(spb * 0.22), c[2] + 12, 0.13); }); break;
    case 5: L16([67, -1, 67, 66, 67, 69, 71, 72, 74, 72, 71, 69, 71, -1, 74, -1]); break;
    case 6: gtr(b0, Math.round(spb * 0.4), 76, 0.17); gtr(b0 + Math.round(spb * 0.5), Math.round(spb * 3.2), 76, 0.19, 79, true); break;
    case 7: L16([79, 81, 79, 76, 74, 76, 79, 81, 84, 81, 79, 76, 79, 76, 74, 71]); break;
    case 8: L16([74, 74, -1, 74, 74, -1, 74, 76, 79, -1, 76, -1, 74, 71, 69, 67], 0.17); break;
    case 9: gtr(b0, Math.round(spb * 2), 81, 0.18, 83, true); L16([-1, -1, -1, -1, -1, -1, -1, -1, 83, 81, 79, 76, 74, 76, 79, -1]); break;
    case 10: L16([67, 71, 74, 79, 74, 71, 67, 62, 67, 71, 74, 79, 81, 79, 76, 74]); break;
    default: gtr(b0, Math.round(spb * 0.9), 74, 0.16, null, true); gtr(b0 + spb, Math.round(spb * 0.9), 76, 0.17, null, true); gtr(b0 + Math.round(spb * 2), Math.round(spb * 1.9), 79, 0.2, null, true); break;
  }
}

function sec(b) {
  if (b < 2) return { intro: true, banjo: true };                     // solo banjo pickup
  if (b < 4) return { intro: true, banjo: true, rhythm: true };
  if (b < 20) return { banjo: true, rhythm: true, tune: 'A' };        // TUNE A
  if (b < 36) return { banjo: true, rhythm: true, tune: 'B', train: true }; // TUNE B + train brushes
  if (b < 52) return { crazy: true, rhythm: true, stopAt: (b - 36) % 8 === 7 }; // CRAZY BREAKDOWN
  if (b < 56) return { stoptime: true };                              // stop-time breather
  if (b < 80) return { solo: b - 56, rhythm: true, backup: true };    // GUITAR SOLO (24)
  if (b < 88) return { banjo: true, rhythm: true, tune: 'A', harm: true }; // reprise + harmony
  if (b < 100) return { banjo: true, rhythm: true, tune: 'A', harm: true, up: 2, crazyToo: true, hoedown: true }; // FINALE +2
  return { tag: b - 100 };                                            // TAG
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const b0 = Math.round(b * bar);
  const ch = PROG[b % 8], chord = CHORD[ch];
  const up = s.up || 0;
  // ---- rhythm section: boom-chick + chop
  if (s.rhythm && !s.stopAt) {
    boom(b0, ROOT[ch] + up, 0.5);
    boom(b0 + Math.round(2 * spb), FIFTH[ch] + up, 0.46);
    [1, 3].forEach(bt => chop(b0 + Math.round(bt * spb), chord.map(m => m + up), 0.32));
  }
  // ---- banjo rolls (verses/backup)
  if (s.banjo) {
    const pat = rollPattern(ch, b % 2 === 1);
    const g = s.tune ? 0.1 : 0.15; // quieter under melody
    for (let e = 0; e < 16; e++) banjo(b0 + Math.round(e * spb / 4), pat[e % 8] + up, g * (e % 4 === 0 ? 1.2 : 1));
  }
  if (s.backup) { // sparse banjo under guitar solo
    const pat = rollPattern(ch, true);
    for (let e = 0; e < 16; e += 2) banjo(b0 + Math.round(e * spb / 4), pat[(e / 2) % 8], 0.06);
  }
  // ---- melodies
  if (s.tune === 'A') {
    const line = TUNE_A[(b - (b >= 80 ? 80 : 4)) % 8 >= 0 ? (b % 8) : 0];
    TUNE_A[b % 8].forEach((m, e) => { if (m > 0) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.88), midi(m + up), 0.13, 'pulse', 0.46, 0.003, 0.04); });
    if (s.harm) TUNE_A[b % 8].forEach((m, e) => { if (m > 0) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.82), midi(m + up - 12) * 1.005, 0.05, 'pulse', 0.4, 0.004, 0.04); });
  }
  if (s.tune === 'B') {
    TUNE_B[b % 8].forEach((m, e) => { if (m > 0) tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.88), midi(m), 0.13, 'pulse', 0.46, 0.003, 0.04); });
  }
  // ---- train brushes (B section): chugga 16ths + open on 4&
  if (s.train) {
    for (let e = 0; e < 16; e++) brush(b0 + Math.round(e * spb / 4), e % 4 === 2 ? 0.1 : 0.05);
    if (b % 8 === 6) trainWhistle(b0 + Math.round(spb * 2), 0.12);
  }
  // ---- CRAZY BANJO BREAKDOWN
  if (s.crazy) {
    if (s.stopAt) { // stop-time bar: band hit on 1, banjo alone answers
      boom(b0, ROOT[ch], 0.55); chop(b0, chord, 0.4);
      const run = crazyRun(ch, b + 1);
      for (let e = 4; e < 16; e++) banjo(b0 + Math.round(e * spb / 4), run[e], 0.17);
    } else {
      const run = crazyRun(ch, b);
      for (let e = 0; e < 16; e++) banjo(b0 + Math.round(e * spb / 4), run[e], 0.16 * (e % 4 === 0 ? 1.15 : 1));
      // 32nd flourish at phrase ends — the CRAZY part
      if (b % 4 === 3) for (let e = 0; e < 8; e++) banjo(b0 + Math.round(3 * spb + e * spb / 8), [67, 69, 71, 72, 74, 76, 78, 79][e] + 12, 0.13, spb * 0.11);
      clipclop(b0 + Math.round(1.5 * spb), 0.1); clipclop(b0 + Math.round(3.5 * spb), 0.08);
    }
  }
  if (s.crazyToo) { // finale: crazy rolls layered on top, octave up
    const run = crazyRun(ch, b);
    for (let e = 0; e < 16; e++) banjo(b0 + Math.round(e * spb / 4), run[e] + 2, 0.09);
  }
  // ---- stop-time breather: hits + solo banjo phrases + clip-clop
  if (s.stoptime) {
    boom(b0, ROOT[ch], 0.55); chop(b0, chord, 0.42);
    [67, 71, 74, 79, 74, 71].forEach((m, e) => banjo(b0 + Math.round((1 + e * 0.5) * spb), m, 0.16));
    clipclop(b0 + Math.round(2.5 * spb), 0.12); clipclop(b0 + Math.round(3 * spb), 0.1);
  }
  // ---- GUITAR SOLO
  if (s.solo != null) soloBar(s.solo, b0, ch);
  // ---- hoedown extras: brush train + open accents
  if (s.hoedown) {
    for (let e = 0; e < 16; e++) brush(b0 + Math.round(e * spb / 4), e % 4 === 2 ? 0.11 : 0.055);
    if (b % 4 === 0) brush(b0, 0.2, true);
  }
  // ---- TAG (last 5 bars): shave-and-a-haircut hoedown ending
  if (s.tag != null) {
    const t = s.tag;
    if (t === 0) { // walk-down lick, stop-time
      boom(b0, 43 + 2, 0.55); chop(b0, CHORD.G.map(m => m + 2), 0.4);
      [81, 78, 76, 74, 71, 69, 71, 74].forEach((m, e) => banjo(b0 + Math.round(e * spb / 2), m, 0.17));
    } else if (t === 1) {
      [76, 74, 71, 69, 67, 69, 71, 67].forEach((m, e) => banjo(b0 + Math.round(e * spb / 2), m + 2, 0.17));
      boom(b0 + Math.round(2 * spb), 45, 0.5);
    } else if (t === 2) { // shave and a haircut...
      [[0, 69], [0.75, 66], [1.5, 69], [2, 71], [2.5, 69]].forEach(([bt, m]) => { banjo(b0 + Math.round(bt * spb), m + 12, 0.2); boom(b0 + Math.round(bt * spb), m - 12, 0.4); });
    } else if (t === 3) { // ...two bits! + big G chord ring
      [[1, 74], [2, 69 + 12]].forEach(([bt, m]) => { banjo(b0 + Math.round(bt * spb), m, 0.22); });
      boom(b0 + Math.round(1 * spb), 45 + 5, 0.5);
    } else { // final chord: full band G hit + banjo roll ring-out
      boom(b0, 45, 0.6); chop(b0, CHORD.G.map(m => m + 2), 0.5);
      const pat = rollPattern('G', false);
      for (let e = 0; e < 12; e++) banjo(b0 + Math.round(e * spb / 4), pat[e % 8] + 2, 0.16 * (1 - e / 14), spb * 0.3);
      [57, 62, 66, 69].forEach(m => tone(b0, Math.round(bar * 0.9), midi(m + 2 - 2), 0.07, 'pulse', 0.42, 0.01, 0.5));
      trainWhistle(b0 + Math.round(spb * 1.2), 0.1);
    }
  }
  // intro pickup: lone clip-clops
  if (s.intro && b < 2) { [0.5, 1.5, 2.5, 3.5].forEach(bt => clipclop(b0 + Math.round(bt * spb), 0.09)); }
}

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.05); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'west_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm bluegrass');
