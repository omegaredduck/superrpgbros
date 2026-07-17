// render_prehistoria_theme.js — PREHISTORIA theme TAKE 2:
// "PRIMAL.EXE" — DARK TRANCE / techno (Red's direction 2026-07-16:
// "another techno piece trance vibes but dark"). Chiptune only
// (pulse/tri/noise, NO sine). 140 BPM · 105 bars = EXACTLY 180.0s
// @ 32kHz mono 16-bit. NO INTRO — kick + rolling bass from sample 0.
// A grind(0-15) B acid rises(16-31) C dark riff(32-47)
// D tension+build(48-63, kick never stops) E THE DROP(64-87)
// F finale(88-104)
'use strict';
const fs = require('fs');

const SR = 32000, BPM = 140, BARS = 105;
const BEAT = 60 / BPM, BAR = 4 * BEAT, TOTAL = BARS * BAR; // = 180.0s
const N = Math.round(TOTAL * SR);
const buf = new Float64Array(N);
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

let nseed = 40993;
function rnd() { nseed = (nseed * 1103515245 + 12345) & 0x7fffffff; return nseed / 0x3fffffff - 1; }
function triw(x) { const p = x - Math.floor(x); return p < 0.5 ? 4 * p - 1 : 3 - 4 * p; }

// detuned double-pulse = chiptune supersaw (the trance sound)
function addSaw(t0, dur, midi, vol, o) {
  o = o || {};
  const duty = o.duty || 0.5, a = o.a || 0.004, r = o.r || 0.05, det = o.det != null ? o.det : 0.007;
  const f0 = mf(midi), f1 = o.glideTo != null ? mf(o.glideTo) : f0;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur + r) * SR));
  let p1 = 0, p2 = 0.37;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const g = Math.min(1, t / dur);
    let f = f0 + (f1 - f0) * g;
    if (o.vib) f *= 1 + 0.006 * Math.max(0, Math.min(1, (t - 0.05) * 8)) * triw(t * 5.5);
    p1 += f * (1 + det) / SR; p2 += f * (1 - det) / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    const v = ((p1 % 1) < duty ? 1 : -1) * 0.6 + ((p2 % 1) < duty ? 1 : -1) * 0.6;
    buf[i] += v * vol * env * 0.5 * 1.2;
  }
}
function addTri(t0, dur, midi, vol, o) {
  o = o || {};
  const a = o.a || 0.004, r = o.r || 0.05;
  const f0 = mf(midi), f1 = o.glideTo != null ? mf(o.glideTo) : f0;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur + r) * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const g = Math.min(1, t / dur);
    ph += (f0 + (f1 - f0) * g) / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    buf[i] += triw(ph) * vol * env;
  }
}
// hard techno kick — punchier than the tribal one
function kick(t0, vol) {
  vol = vol || 0.55;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.14 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    ph += (160 * Math.exp(-t * 30) + 42) / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 16);
    if (t < 0.006) buf[i] += rnd() * 0.3 * vol;
  }
}
function clap(t0, vol) {
  vol = vol || 0.2;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.09 * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    const flam = t < 0.03 ? (1 + 0.6 * triw(t * 90)) : 1;
    buf[i] += hp * vol * flam * Math.exp(-t * 40);
  }
}
function hat(t0, vol, open) {
  vol = vol || 0.06;
  const len = open ? 0.11 : 0.03;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(len * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * Math.exp(-t * (open ? 30 : 90));
  }
}
function snare(t0, vol) {
  vol = vol || 0.18;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.09 * SR));
  let pn = 0, ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    ph += 190 / SR;
    buf[i] += (hp * 0.8 + triw(ph) * 0.4 * Math.exp(-t * 30)) * vol * Math.exp(-t * 35);
  }
}
// noise riser / downlifter
function sweep(t0, dur, vol, down) {
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur) * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = (i / SR - t0) / dur;
    const g = down ? 1 - t : t;
    const n = rnd(); const mix = n - pn * (1 - g * 0.85); pn = n; // opens up as g rises
    buf[i] += mix * vol * (down ? Math.pow(1 - t, 1.5) : Math.pow(t, 1.8));
  }
}

// ---- D natural minor, harmonic-minor bite (C#) in the riff.
// Bass progression per 4 bars: D  D  Bb  A  (i i VI V — dark)
const PROG = [38, 38, 34, 33];
// main dark riff — 4 bars, 16th-driven, brooding (D4 register)
const RIFF = [
  [0, .25, 62], [.5, .25, 62], [.75, .25, 65], [1, .5, 62], [1.5, .25, 68],
  [2, .25, 67], [2.5, .25, 65], [2.75, .25, 62], [3, .75, 61],
  [4, .25, 62], [4.5, .25, 62], [4.75, .25, 65], [5, .5, 67], [5.5, .25, 69],
  [6, .5, 70], [6.5, .25, 69], [6.75, .25, 67], [7, .75, 65],
  [8, .25, 62], [8.5, .25, 62], [8.75, .25, 65], [9, .5, 62], [9.5, .25, 68],
  [10, .25, 67], [10.5, .25, 65], [10.75, .25, 62], [11, .75, 61],
  [12, .5, 62], [12.75, .25, 65], [13, .5, 67], [13.5, .5, 69],
  [14, 1.25, 74], [15.25, .75, 73],
];
// high echo answer for the drop (sparse, up an octave)
const ECHO = [
  [1.5, .25, 74], [3.25, .25, 73], [5.5, .25, 77], [7.25, .25, 74],
  [9.5, .25, 74], [11.25, .25, 73], [13.75, .25, 79], [15.5, .5, 74],
];
// tension pad chords (bar → [midis]) for D section
const PADS = [[50, 53, 57], [50, 53, 57], [46, 50, 53], [45, 49, 52]]; // Dm Dm Bb A(maj = C# bite)

function playRiff(startBar, phrase, vol, oct, o) {
  const base = startBar * BAR;
  phrase.forEach(([b, d, m]) => addSaw(base + b * BEAT, d * BEAT * 0.9, m + (oct || 0), vol, Object.assign({ duty: 0.5, r: 0.04 }, o || {})));
}
// acid arp: 16ths, octave-jumping, accent-decayed
function acidBar(bar, root, vol, high) {
  const t0 = bar * BAR;
  const pat = [0, 12, 3, 12, 7, 12, 10, 12, 0, 12, 3, 15, 7, 12, 10, 13];
  for (let s = 0; s < 16; s++) {
    const acc = (s % 4 === 0) ? 1 : 0.55;
    addSaw(t0 + s * BEAT / 4, BEAT * 0.14, root + 24 + (high ? 12 : 0) + pat[s], vol * acc, { duty: 0.25, det: 0.004, decay: 14, a: 0.002, r: 0.02 });
  }
}

// ================================================================ compose
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const sec = bar < 16 ? 'A' : bar < 32 ? 'B' : bar < 48 ? 'C' : bar < 64 ? 'D' : bar < 88 ? 'E' : 'F';
  const root = PROG[bar % 4];
  const last = bar === BARS - 1;
  const buildTail = sec === 'D' && bar >= 60; // last 4 bars of D = the build

  // ---- FOUR ON THE FLOOR (never stops — even through the tension)
  if (!last) {
    for (let b = 0; b < 4; b++) kick(t0 + b * BEAT, sec === 'D' && !buildTail ? 0.5 : 0.55);
    // offbeat open hats — the trance pulse
    for (let b = 0; b < 4; b++) hat(t0 + (b + 0.5) * BEAT, sec === 'A' ? 0.055 : 0.075, true);
    // 16th closed hats once it heats up
    if (sec !== 'A' && sec !== 'D') for (let s = 0; s < 16; s++) { if (s % 2) hat(t0 + s * BEAT / 4, 0.03); }
    if (sec !== 'A') { clap(t0 + 1 * BEAT); clap(t0 + 3 * BEAT); }
    // build: snare roll density ramps 8ths→16ths, riser underneath
    if (buildTail) {
      const div = bar >= 62 ? 16 : 8;
      for (let s = 0; s < div; s++) snare(t0 + s * BAR / div, 0.12 + 0.10 * (bar - 60) / 4 + 0.05 * (s / div));
    }
    if (sec === 'E' || sec === 'F') { if (bar % 8 === 7) [3.5, 3.75].forEach(b => snare(t0 + b * BEAT, 0.16)); }
  } else {
    kick(t0, 0.6); clap(t0, 0.3); // final hit, ring-out handled below
  }

  // ---- ROLLING BASS (k-b-b-b 16ths — from sample 0)
  if (!last) {
    for (let b = 0; b < 4; b++) for (let s = 1; s < 4; s++)
      addTri(t0 + (b + s / 4) * BEAT, BEAT * 0.16, root + (s === 3 && bar % 2 ? 12 : 0), sec === 'D' && !buildTail ? 0.2 : 0.3, { decay: 10, a: 0.002, r: 0.02 });
    // sub anchor on the downbeat between kicks
    addSaw(t0, BAR, root - 12 + 12, 0.05, { duty: 0.25, a: 0.03, r: 0.05, det: 0.003 });
  }

  // ---- DARK STABS (syncopated minor chord jabs) — A + B
  if ((sec === 'A' || sec === 'B') && !last) {
    [[1.5, 0], [3.5, 0], [2.75, 12]].forEach(([b, up], i) => {
      if (i === 2 && bar % 2 === 0) return;
      [0, 3, 7].forEach(iv => addSaw(t0 + b * BEAT, BEAT * 0.2, root + 24 + iv + up, 0.08, { duty: 0.5, decay: 12, a: 0.002, r: 0.03 }));
    });
  }

  // ---- ACID ARP — B on, C sparse, D up an octave (the tension), E/F on
  if (sec === 'B') acidBar(bar, root, 0.10);
  if (sec === 'C' && bar % 4 >= 2) acidBar(bar, root, 0.07);
  if (sec === 'D' && !last) acidBar(bar, root, 0.09 + 0.02 * ((bar - 48) / 16), true);
  if ((sec === 'E' || sec === 'F') && !last) acidBar(bar, root, 0.08);

  // ---- TENSION PADS (D section) — dark held chords over the kick
  if (sec === 'D' && bar % 4 === 0 && bar < 60) {
    PADS.forEach((ch, ci) => ch.forEach(m =>
      addSaw((bar + ci) * BAR, BAR * 0.96, m, 0.055, { duty: 0.5, a: 0.06, r: 0.1, det: 0.01, vib: true })));
  }
}

// ---- RIFFS per section
for (let p = 0; p < 4; p++) playRiff(32 + p * 4, RIFF, 0.16);                 // C: dark riff enters
for (let p = 0; p < 6; p++) {                                                  // E: THE DROP (24 bars)
  playRiff(64 + p * 4, RIFF, 0.17);
  playRiff(64 + p * 4, ECHO, 0.09, 12, { decay: 6 });
}
for (let p = 0; p < 4; p++) {                                                  // F: finale — octave-doubled
  playRiff(88 + p * 4, RIFF, 0.16);
  playRiff(88 + p * 4, RIFF, 0.08, 12);
  playRiff(88 + p * 4, ECHO, 0.09, 12, { decay: 6 });
}
// risers into C, E, F drops; downlifter right after E lands
sweep(28 * BAR, 4 * BAR, 0.09);
sweep(60 * BAR, 4 * BAR, 0.13);
sweep(84 * BAR, 4 * BAR, 0.11);
sweep(64 * BAR, 2 * BAR, 0.07, true);
// final: low D + riff top ring to 180.0
addSaw(104 * BAR, 2.2 * BEAT, 38, 0.22, { duty: 0.5, glideTo: 37, r: 0.7, det: 0.01 });
addSaw(104 * BAR, 2.2 * BEAT, 62, 0.12, { r: 0.7, det: 0.012 });
addTri(104 * BAR, 2.2 * BEAT, 26, 0.18, { r: 0.7 });

// ---- normalize + WAV
let peak = 0;
for (let i = 0; i < N; i++) { buf[i] = Math.tanh(buf[i] * 1.15); const a = Math.abs(buf[i]); if (a > peak) peak = a; }
const g = 0.85 / Math.max(1e-9, peak);
const pcm = Buffer.alloc(44 + N * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 2, 4); pcm.write('WAVE', 8);
pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(buf[i] * g * 32767), 44 + i * 2);
fs.writeFileSync(process.argv[2] || 'prehistoria_theme.wav', pcm);
console.log('PRIMAL.EXE take 2 (dark trance) —', (N / SR).toFixed(1) + 's,', BARS, 'bars @', BPM, 'BPM, peak', peak.toFixed(3));
