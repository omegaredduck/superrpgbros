// artdev/belly/render_belly_theme.js — BELLY OF THE BEAST theme:
// "HEAVE HO.EXE" — 8-BIT SEA SHANTY (Red's direction). Chiptune only
// (pulse/tri/noise, NO sine). 120 BPM · 90 bars = EXACTLY 180.0s
// @ 32kHz mono 16-bit. NO INTRO — full stomp + melody from bar 0.
// Swung 8ths (2:1). Call-and-answer = the shanty signature.
// A verse(0-15) B call+answer(16-31) C CHORUS(32-47)
// D fiddle break(48-63) E storm verse(64-79) F finale(80-89)
'use strict';
const fs = require('fs');

const SR = 32000, BPM = 120, BARS = 90;
const BEAT = 60 / BPM, BAR = 4 * BEAT, TOTAL = BARS * BAR; // = 180.0s
const N = Math.round(TOTAL * SR);
const buf = new Float64Array(N);
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

let nseed = 8181;
function rnd() { nseed = (nseed * 1103515245 + 12345) & 0x7fffffff; return nseed / 0x3fffffff - 1; }
function triw(x) { const p = x - Math.floor(x); return p < 0.5 ? 4 * p - 1 : 3 - 4 * p; }
// swing: offbeat 8ths land at +2/3 beat instead of +1/2
function sw(b) { const f = b - Math.floor(b); if (Math.abs(f - 0.5) < 0.01) return Math.floor(b) + 2 / 3; return b; }

function addPulse(t0, dur, midi, vol, o) {
  o = o || {};
  const duty = o.duty || 0.5, a = o.a || 0.004, r = o.r || 0.05;
  const f0 = mf(midi), f1 = o.glideTo != null ? mf(o.glideTo) : f0;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur + r) * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const g = Math.min(1, t / dur);
    let f = f0 + (f1 - f0) * g;
    if (o.vib) f *= 1 + 0.008 * Math.max(0, Math.min(1, (t - 0.06) * 7)) * triw(t * 5.4);
    ph += f / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    buf[i] += ((ph % 1) < duty ? 1 : -1) * vol * env;
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
    let f = f0 + (f1 - f0) * g;
    if (o.vib) f *= 1 + 0.009 * Math.max(0, Math.min(1, (t - 0.07) * 6)) * triw(t * 5);
    ph += f / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    buf[i] += triw(ph) * vol * env;
  }
}
// deck STOMP (boot on planks) — low thud + wood knock
function stomp(t0, vol) {
  vol = vol || 0.45;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.11 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    ph += (110 * Math.exp(-t * 26) + 44) / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 22);
    if (t < 0.006) buf[i] += rnd() * 0.25 * vol;
  }
}
function clap(t0, vol) {
  vol = vol || 0.2;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.08 * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    const flam = t < 0.025 ? (1 + 0.5 * triw(t * 100)) : 1;
    buf[i] += hp * vol * flam * Math.exp(-t * 45);
  }
}
function tamb(t0, vol) { // tambourine jingle
  vol = vol || 0.05;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.05 * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * (0.7 + 0.3 * triw(t * 900)) * Math.exp(-t * 60);
  }
}

// ---- A dorian. Chords: Am(57,60,64) G(55,59,62) C(60,64,67) D(62,66,69) Em(64,67,71) F(53,57,60)
const CH = { Am: [57, 60, 64], G: [55, 59, 62], C: [60, 64, 67], D: [62, 66, 69], Em: [64, 67, 71], F: [53, 57, 60] };
// verse progression per bar (4-bar loop): Am Am G Am
const VPROG = [CH.Am, CH.Am, CH.G, CH.Am];
// chorus progression: Am C G Am | Am C D Am
const CPROG = [CH.Am, CH.C, CH.G, CH.Am, CH.Am, CH.C, CH.D, CH.Am];

// VERSE melody (8 bars, [beat,dur,midi]) — jaunty dorian, swung
const VERSE = [
  [0, .5, 69], [.5, .5, 69], [1, .5, 69], [1.5, .5, 71], [2, .5, 72], [2.5, .5, 71], [3, 1, 69],
  [4, .5, 67], [4.5, .5, 67], [5, .5, 67], [5.5, .5, 69], [6, 1, 71], [7, 1, 67],
  [8, .5, 69], [8.5, .5, 69], [9, .5, 69], [9.5, .5, 71], [10, .5, 72], [10.5, .5, 74], [11, 1, 76],
  [12, .5, 74], [12.5, .5, 72], [13, .5, 71], [13.5, .5, 67], [14, 1.5, 69], [15.5, .5, 69],
];
// CALL phrase (2 bars, solo shantyman)
const CALL = [[0, .5, 76], [.5, .5, 76], [1, .5, 74], [1.5, .5, 72], [2, 1, 74], [3, .5, 72], [3.5, .5, 71], [4, 1.5, 72], [5.5, .5, 71], [6, 2, 69]];
// ANSWER phrase (2 bars, crew unison low + stabs)
const ANSW = [[0, .5, 57], [.5, .5, 57], [1, .5, 59], [1.5, .5, 60], [2, 1, 62], [3, 1, 60], [4, 1, 57], [5, 1, 55], [6, 2, 57]];
// CHORUS melody (8 bars) — the big one
const CHORUS = [
  [0, 1, 76], [1, .5, 76], [1.5, .5, 79], [2, 1, 76], [3, .5, 74], [3.5, .5, 72],
  [4, 1, 74], [5, .5, 74], [5.5, .5, 76], [6, 1.5, 74], [7.5, .5, 72],
  [8, 1, 76], [9, .5, 76], [9.5, .5, 79], [10, 1, 81], [11, .5, 79], [11.5, .5, 76],
  [12, 1, 74], [13, .5, 72], [13.5, .5, 71], [14, 2, 69],
];
// FIDDLE run seeds (1 bar, 8 swung 8ths) — dorian scampering
const RUNS = [
  [69, 71, 72, 74, 76, 74, 72, 71], [76, 74, 76, 79, 76, 74, 72, 74],
  [69, 72, 71, 74, 72, 76, 74, 71], [81, 79, 76, 74, 76, 72, 71, 69],
];

function playMel(startBar, phrase, vol, oct, o) {
  const base = startBar * BAR;
  phrase.forEach(([b, d, m]) => {
    const tb = sw(b);
    addPulse(base + tb * BEAT, Math.max(0.1, (d - (tb - b)) * BEAT * 0.9), m + (oct || 0), vol, Object.assign({ duty: 0.5, vib: true }, o || {}));
  });
}
function playCrew(startBar, phrase, vol) { // unison "voices": two detuned-ish pulses + fifth
  const base = startBar * BAR;
  phrase.forEach(([b, d, m]) => {
    const tb = sw(b);
    addPulse(base + tb * BEAT, (d - (tb - b)) * BEAT * 0.88, m, vol, { duty: 0.5, glideTo: m - 1, r: 0.05 });
    addPulse(base + tb * BEAT, (d - (tb - b)) * BEAT * 0.88, m + 7, vol * 0.6, { duty: 0.33, r: 0.05 });
    addPulse(base + tb * BEAT, (d - (tb - b)) * BEAT * 0.88, m + 12, vol * 0.45, { duty: 0.5, r: 0.05 });
  });
}

// ================================================================ compose
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const sec = bar < 16 ? 'A' : bar < 32 ? 'B' : bar < 48 ? 'C' : bar < 64 ? 'D' : bar < 80 ? 'E' : 'F';
  const last = bar === BARS - 1;
  const big = sec === 'C' || sec === 'F';
  const chord = sec === 'C' || sec === 'F' ? CPROG[bar % 8] : VPROG[bar % 4];
  const root = chord[0] - 24; // bass register

  // ---- STOMP + CLAP (the shanty motor, from bar 0)
  if (!last) {
    stomp(t0, 0.45); stomp(t0 + 2 * BEAT, 0.42);
    if (sec !== 'B') stomp(t0 + sw(1.5) * BEAT, 0.2); // swung pickup stomp
    clap(t0 + 1 * BEAT); clap(t0 + 3 * BEAT, big ? 0.24 : 0.2);
    if (big || sec === 'D') for (let e = 0; e < 8; e++) tamb(t0 + sw(e * 0.5) * BEAT, e % 2 ? 0.04 : 0.06);
    if (bar % 8 === 7) { clap(t0 + 3.5 * BEAT, 0.16); stomp(t0 + sw(3.5) * BEAT, 0.24); } // turnaround kick
  } else {
    stomp(t0, 0.5); clap(t0, 0.3); tamb(t0, 0.08);
  }

  // ---- BASS oom-pah (tri): root on 1+3, fifth on 2+4
  if (!last) {
    addTri(t0, BEAT * 0.4, root, 0.3, { decay: 5 });
    addTri(t0 + BEAT, BEAT * 0.35, root + 7, 0.24, { decay: 6 });
    addTri(t0 + 2 * BEAT, BEAT * 0.4, root, 0.3, { decay: 5 });
    addTri(t0 + 3 * BEAT, BEAT * 0.35, root + (bar % 2 ? 5 : 7), 0.24, { decay: 6 });
    if (sec === 'D' || sec === 'F') addTri(t0 + sw(2.5) * BEAT, BEAT * 0.2, root + 12, 0.16, { decay: 8 }); // gallop kick
  }

  // ---- CONCERTINA offbeat chords (squeezebox: duty .25 stabs on the swung offs)
  if (!last && sec !== 'B') {
    [sw(0.5), sw(1.5), sw(2.5), sw(3.5)].forEach((b, i) => {
      chord.forEach(m => addPulse(t0 + b * BEAT, BEAT * 0.22, m, 0.055 + (big ? 0.015 : 0), { duty: 0.25, decay: 9, a: 0.003, r: 0.02 }));
    });
  }
  // B section: crew stabs only on the ANSWER bars (handled below), sparse squeeze on call bars
  if (!last && sec === 'B' && bar % 4 < 2) {
    chord.forEach(m => addPulse(t0 + sw(1.5) * BEAT, BEAT * 0.2, m, 0.05, { duty: 0.25, decay: 10 }));
  }

  // ---- FIDDLE BREAK runs (D) — swung 8th tri scampering
  if (sec === 'D' && !last) {
    const run = RUNS[bar % 4];
    run.forEach((m, e) => addTri(t0 + sw(e * 0.5) * BEAT, BEAT * 0.28, m + 12, 0.14, { decay: 6, a: 0.002 }));
    if (bar % 4 === 3) addTri(t0 + sw(3.5) * BEAT, BEAT * 0.5, 81, 0.13, { glideTo: 76 }); // run-end slide
  }

  // ---- E storm verse: low drone + wind, melody down the octave, builds back
  if (sec === 'E' && !last) {
    addPulse(t0, BAR, 45, 0.07, { duty: 0.25, a: 0.03, r: 0.06 }); // low A drone
    if (bar >= 72) { // second half: rising crew "heave" hits each downbeat
      addPulse(t0, BEAT * 0.4, 57 + (bar - 72), 0.12, { duty: 0.5, glideTo: 56 + (bar - 72), r: 0.05 });
    }
    // storm wind gust noise
    if (bar % 4 === 0) { const s0 = Math.round(t0 * SR), s1 = Math.min(N, s0 + Math.round(0.8 * SR)); let pn = 0; for (let i = s0; i < s1; i++) { const t = (i - s0) / (s1 - s0); const n = rnd(); const hp = (n + pn) * 0.5; pn = n; buf[i] += hp * 0.05 * Math.sin(t * Math.PI); } }
  }
}

// ---- MELODY per section
for (let p = 0; p < 2; p++) playMel(p * 8, VERSE, 0.17);                                  // A
for (let p = 0; p < 4; p++) {                                                              // B call+answer
  playMel(16 + p * 4, CALL, 0.18);                    // shantyman calls (2 bars)
  playCrew(18 + p * 4, ANSW, 0.11);                   // crew answers (2 bars)
}
for (let p = 0; p < 2; p++) { playMel(32 + p * 8, CHORUS, 0.17); playMel(32 + p * 8, CHORUS, 0.08, 12, { duty: 0.33 }); } // C chorus + octave
// D: fiddle rules (runs in the bar loop) — melody tacet, crew shouts every 4
for (let p = 0; p < 4; p++) playCrew(48 + p * 4 + 3, [[3, 1, 57]], 0.1);
for (let p = 0; p < 2; p++) playMel(64 + p * 8, VERSE, 0.15, -12, { duty: 0.5 });          // E verse low, weathering the storm
for (let p = 0; p < 1; p++) { playMel(80, CHORUS, 0.18); playMel(80, CHORUS, 0.09, 12, { duty: 0.33 }); } // F finale chorus
// F: fiddle countermelody over the last chorus
for (let b = 80; b < 88; b++) { const run = RUNS[b % 4]; [0, 2, 4, 6].forEach(e => addTri(b * BAR + sw(e * 0.5) * BEAT, BEAT * 0.26, run[e] + 12, 0.09, { decay: 7 })); }
// final "HEAVE... HO!" — crew hit + big low A ring to 180.0
playCrew(88, [[0, 1, 57], [2, 1.6, 57]], 0.14);
addTri(89 * BAR, 2.6 * BEAT, 33, 0.26, { r: 0.7 });
addPulse(89 * BAR, 2.6 * BEAT, 57, 0.16, { duty: 0.5, glideTo: 56, r: 0.7 });
addTri(89 * BAR, 2.6 * BEAT, 69, 0.1, { r: 0.7 });

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
fs.writeFileSync(process.argv[2] || 'belly_theme.wav', pcm);
console.log('HEAVE HO.EXE —', (N / SR).toFixed(1) + 's,', BARS, 'bars @', BPM, 'BPM, peak', peak.toFixed(3));
