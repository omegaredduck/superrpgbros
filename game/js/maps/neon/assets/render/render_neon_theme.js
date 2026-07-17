// artdev/neon/render_neon_theme.js — NEON CITY theme: "NIGHT DRIVE.EXE"
// Synthwave night drive, chiptune only (pulse/tri/noise — NO sine).
// 116 BPM · 87 bars · EXACTLY 180.0s @ 32kHz mono 16-bit.
// RED RULE: no slow intro — full stack from bar 0.
// Structure: A hook(0-15) B arp hook(16-31) C CHORUS(32-47)
//            D bridge(48-63) E chorus+octave(64-79) F outro hit(80-86)
'use strict';
const fs = require('fs');

const SR = 32000, BPM = 116, BARS = 87;
const BEAT = 60 / BPM, BAR = 4 * BEAT, TOTAL = BARS * BAR; // = 180.0s exactly
const N = Math.round(TOTAL * SR);
const buf = new Float64Array(N);
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

let nseed = 48271;
function rnd() { nseed = (nseed * 1103515245 + 12345) & 0x7fffffff; return nseed / 0x3fffffff - 1; }

// ---- voices (pulse / tri / noise only)
function addPulse(t0, dur, midi, vol, o) {
  o = o || {};
  const duty = o.duty || 0.5, a = o.a || 0.004, r = o.r || 0.05;
  const f0 = mf(midi), f1 = o.glideTo ? mf(o.glideTo) : f0;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur + r) * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const g = Math.min(1, t / dur);
    let f = f0 + (f1 - f0) * g;
    if (o.vib) f *= 1 + 0.006 * Math.max(0, Math.min(1, (t - 0.09) * 6)) * triw(t * 5.5);
    ph += f / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    let v = (ph % 1) < duty ? 1 : -1;
    if (o.pump) { const tb = ((i / SR) % BEAT) / BEAT; env *= 0.35 + 0.65 * Math.min(1, tb * BEAT / 0.15); }
    buf[i] += v * vol * env;
  }
}
function triw(x) { const p = x - Math.floor(x); return p < 0.5 ? 4 * p - 1 : 3 - 4 * p; }
function addTri(t0, dur, midi, vol, o) {
  o = o || {};
  const a = o.a || 0.004, r = o.r || 0.06;
  const f0 = mf(midi), f1 = o.glideTo ? mf(o.glideTo) : f0;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, Math.round((t0 + dur + r) * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const g = Math.min(1, t / dur);
    let f = f0 + (f1 - f0) * g;
    if (o.vib) f *= 1 + 0.007 * Math.max(0, Math.min(1, (t - 0.1) * 5)) * triw(t * 5.2);
    ph += f / SR;
    const env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    buf[i] += triw(ph) * vol * env;
  }
}
// drums
function kick(t0, vol) {
  vol = vol || 0.5;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.11 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const f = 150 * Math.exp(-t * 26) + 42;
    ph += f / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 24);
    if (t < 0.008) buf[i] += rnd() * 0.25 * vol; // click
  }
}
function snare(t0, vol) {
  vol = vol || 0.34;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.16 * SR));
  let ph = 0, pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n; // crispy highpassed noise
    ph += 196 / SR;
    buf[i] += (hp * 0.85 + triw(ph) * 0.5 * Math.exp(-t * 40)) * vol * Math.exp(-t * 22);
  }
}
function hat(t0, open, vol) {
  vol = vol || 0.11;
  const dur = open ? 0.11 : 0.028;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(dur * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * Math.exp(-t * (open ? 26 : 90));
  }
}
function tom(t0, f0, vol) {
  vol = vol || 0.32;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.14 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    ph += (f0 * Math.exp(-t * 8)) / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 16);
  }
}
function crash(t0, vol) {
  vol = vol || 0.2;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(1.1 * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * Math.exp(-t * 3.4);
  }
}

// ---- harmony: Am F C G (i VI III VII) — night-drive minor
const ROOTS = [45, 41, 48, 43];               // A2 F2 C3 G2
const CHORDS = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
const ARPN = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]];

// ---- phrases: [beat, durBeats, midi] over a 16-beat (4-bar) cycle
const HOOK1 = [
  [0, 1, 69], [1, .5, 72], [1.5, .5, 74], [2, 1.5, 76], [3.5, .5, 74],
  [4, 1, 72], [5, .5, 69], [5.5, .5, 72], [6, 2, 77],
  [8, 1, 76], [9, .5, 72], [9.5, .5, 76], [10, 2, 79],
  [12, 1, 79], [13, .5, 76], [13.5, .5, 74], [14, 2, 71],
];
const HOOK2 = [
  [0, .5, 76], [.5, .5, 74], [1, 1, 76], [2, 1, 72], [3, 1, 74],
  [4, 1.5, 77], [5.5, .5, 76], [6, 1, 74], [7, 1, 72],
  [8, .5, 76], [8.5, .5, 79], [9, 1, 76], [10, 2, 72],
  [12, 1, 74], [13, 1, 76], [14, 1.5, 79], [15.5, .5, 76],
];
const CHORUS = [
  [0, .75, 81], [.75, .75, 79], [1.5, .5, 76], [2, 1, 79], [3, 1, 81],
  [4, 1.5, 77], [5.5, .5, 76], [6, 1, 74], [7, 1, 76],
  [8, 1.5, 79], [9.5, .5, 76], [10, 1, 72], [11, 1, 76],
  [12, 2, 74], [14, 2, 71],
];
const BRIDGE = [
  [0, 2, 64], [2, 1, 65], [3, 1, 67], [4, 2, 69], [6, 1, 72], [7, 1, 71],
  [8, 2, 72], [10, 1, 74], [11, 1, 76], [12, 2.5, 74], [14.5, 1.5, 71],
];

// ================================================================ compose
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const ci = bar % 4;
  const root = ROOTS[ci], chord = CHORDS[ci], arp = ARPN[ci];
  const last = bar === BARS - 1;
  const sec = bar < 16 ? 'A' : bar < 32 ? 'B' : bar < 48 ? 'C' : bar < 64 ? 'D' : bar < 80 ? 'E' : 'F';

  // ---- DRUMS: four-on-floor from bar 0, no easing in
  for (let b = 0; b < 4; b++) {
    kick(t0 + b * BEAT, last && b > 0 ? 0 : 0.5);
    if (!last) {
      if (b === 1 || b === 3) snare(t0 + b * BEAT);
      hat(t0 + b * BEAT + BEAT / 2, b === 3, 0.11);            // offbeat 8ths, open on 4&
      if (sec === 'C' || sec === 'E' || sec === 'D') hat(t0 + b * BEAT + BEAT / 4, false, 0.05); // 16th shimmer
    }
  }
  // tom fill closing every 16-bar section
  if (bar % 16 === 15 && !last) { tom(t0 + 3 * BEAT, 200, 0.3); tom(t0 + 3.33 * BEAT, 160, 0.3); tom(t0 + 3.66 * BEAT, 120, 0.34); }
  if (bar % 16 === 0 && bar > 0) crash(t0, 0.18);

  // ---- BASS: driving synthwave 8ths, root/octave bounce
  if (!last) {
    const pat = [0, 0, 12, 0, 0, 12, 0, 12];
    for (let e = 0; e < 8; e++) addPulse(t0 + e * BEAT / 2, BEAT / 2 * 0.86, root - 12 + pat[e], 0.26, { duty: 0.25, r: 0.02 });
  } else addPulse(t0, 2.4 * BEAT, root - 12, 0.28, { duty: 0.25, r: 0.4 });

  // ---- PADS: detuned pulse chords, sidechain pump
  const padV = sec === 'D' ? 0.085 : 0.07;
  chord.forEach(m => {
    addPulse(t0, last ? 2.6 * BEAT : BAR * 0.98, m, padV, { duty: 0.5, a: 0.02, r: last ? 0.5 : 0.06, pump: !last });
    addPulse(t0, last ? 2.6 * BEAT : BAR * 0.98, m + 0.09, padV * 0.8, { duty: 0.5, a: 0.02, r: last ? 0.5 : 0.06, pump: !last }); // detune shimmer
  });

  // ---- ARP: 16ths (B, E, F + quiet in C)
  if ((sec === 'B' || sec === 'E' || sec === 'F' || sec === 'C') && !last) {
    const av = sec === 'C' ? 0.06 : 0.1;
    for (let s = 0; s < 16; s++) {
      const seq = [0, 1, 2, 3, 2, 1][s % 6];
      addPulse(t0 + s * BEAT / 4, BEAT / 4 * 0.8, arp[seq] + 12, av, { duty: 0.125, r: 0.015 });
    }
  }
}

// ---- LEAD: phrases per section (full melody from bar 0 — straight in)
function playPhrase(startBar, phrase, vol, o) {
  const base = startBar * BAR;
  phrase.forEach(([b, d, m]) => addPulse(base + b * BEAT, d * BEAT * 0.92, m + (o && o.oct ? 12 : 0), vol, { duty: 0.5, vib: true, r: 0.07 }));
}
function playPhraseTri(startBar, phrase, vol) {
  const base = startBar * BAR;
  phrase.forEach(([b, d, m]) => addTri(base + b * BEAT, d * BEAT * 0.94, m, vol, { vib: true }));
}
for (let p = 0; p < 4; p++) playPhrase(p * 4, HOOK1, 0.21);            // A
for (let p = 0; p < 4; p++) playPhrase(16 + p * 4, HOOK2, 0.21);       // B
for (let p = 0; p < 4; p++) playPhrase(32 + p * 4, CHORUS, 0.23);      // C
for (let p = 0; p < 4; p++) playPhraseTri(48 + p * 4, BRIDGE, 0.3);    // D moody tri lead
for (let p = 0; p < 4; p++) {                                          // E chorus + octave double
  playPhrase(64 + p * 4, CHORUS, 0.22);
  playPhrase(64 + p * 4, CHORUS, 0.09, { oct: true });
}
playPhrase(80, HOOK1, 0.22);                                           // F outro
[[84 * 16 / 16, 0]].forEach(() => {});
playPhrase(84, HOOK1.slice(0, 5).map(([b, d, m]) => [b, d, m]), 0.22); // half phrase in
// final hit — bar 86: big Am, lead lands on A5, crash, ring out to exactly 180.0
crash(86 * BAR, 0.24);
addPulse(86 * BAR, 2.2 * BEAT, 81, 0.24, { duty: 0.5, vib: true, r: 0.6 });
addTri(86 * BAR, 2.2 * BEAT, 57, 0.2, { r: 0.6 });

// ---- normalize (soft clip -> 0.85 peak) + write WAV
let peak = 0;
for (let i = 0; i < N; i++) { buf[i] = Math.tanh(buf[i] * 1.15); const a = Math.abs(buf[i]); if (a > peak) peak = a; }
const g = 0.85 / Math.max(1e-9, peak);
const pcm = Buffer.alloc(44 + N * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 2, 4); pcm.write('WAVE', 8);
pcm.write('fmt ', 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(buf[i] * g * 32767), 44 + i * 2);
fs.writeFileSync(process.argv[2] || 'neon_theme.wav', pcm);
console.log('NIGHT DRIVE.EXE —', (N / SR).toFixed(1) + 's,', BARS, 'bars @', BPM, 'BPM, peak', peak.toFixed(3));
