// artdev/underworld/render_eternal_theme.js — VICE VERSA theme:
// "ETERNAL WAR.EXE" — EPIC / BUILDING / INTENSE, chiptune only
// (pulse/tri/noise, NO sine). 152 BPM · 114 bars = EXACTLY 180.0s
// @ 32kHz mono 16-bit. RED RULE: no slow intro — full stack from
// bar 0, then it BUILDS: layers -> rise -> key lift -> all-out war.
// A war(0-15) B stack(16-31) C lift(32-47) D THE BUILD(48-63)
// E CLIMAX +2 (64-79) F the war, trading motifs (80-97) G finale (98-113)
'use strict';
const fs = require('fs');

const SR = 32000, BPM = 152, BARS = 114;
const BEAT = 60 / BPM, BAR = 4 * BEAT, TOTAL = BARS * BAR; // = 180.0s
const N = Math.round(TOTAL * SR);
const buf = new Float64Array(N);
const mf = m => 440 * Math.pow(2, (m - 69) / 12);

let nseed = 22695;
function rnd() { nseed = (nseed * 1103515245 + 12345) & 0x7fffffff; return nseed / 0x3fffffff - 1; }
function triw(x) { const p = x - Math.floor(x); return p < 0.5 ? 4 * p - 1 : 3 - 4 * p; }

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
    if (o.vib) f *= 1 + 0.006 * Math.max(0, Math.min(1, (t - 0.08) * 6)) * triw(t * 5.6);
    ph += f / SR;
    let env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    if (o.decay) env *= Math.exp(-t * o.decay);
    buf[i] += ((ph % 1) < duty ? 1 : -1) * vol * env;
  }
}
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
    if (o.vib) f *= 1 + 0.007 * Math.max(0, Math.min(1, (t - 0.1) * 5)) * triw(t * 5.1);
    ph += f / SR;
    const env = Math.min(1, t / a) * (t > dur ? Math.max(0, 1 - (t - dur) / r) : 1);
    buf[i] += triw(ph) * vol * env;
  }
}
function kick(t0, vol) {
  vol = vol || 0.52;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.11 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    ph += (155 * Math.exp(-t * 26) + 40) / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 22);
    if (t < 0.008) buf[i] += rnd() * 0.26 * vol;
  }
}
function snare(t0, vol) {
  vol = vol || 0.32;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.15 * SR));
  let ph = 0, pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    ph += 200 / SR;
    buf[i] += (hp * 0.85 + triw(ph) * 0.5 * Math.exp(-t * 42)) * vol * Math.exp(-t * 24);
  }
}
function hat(t0, open, vol) {
  vol = vol || 0.1;
  const dur = open ? 0.1 : 0.026;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(dur * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * Math.exp(-t * (open ? 28 : 95));
  }
}
function tom(t0, f0, vol) {
  vol = vol || 0.34;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(0.16 * SR));
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    ph += (f0 * Math.exp(-t * 7)) / SR;
    buf[i] += triw(ph) * vol * Math.exp(-t * 14);
  }
}
function crash(t0, vol) {
  vol = vol || 0.22;
  const s0 = Math.max(0, Math.round(t0 * SR)), s1 = Math.min(N, s0 + Math.round(1.2 * SR));
  let pn = 0;
  for (let i = s0; i < s1; i++) {
    const t = i / SR - t0;
    const n = rnd(); const hp = n - pn; pn = n;
    buf[i] += hp * vol * Math.exp(-t * 3.2);
  }
}
// marching snare roll (16th ruff into a beat)
function roll(t0, n, vol) {
  for (let k = 0; k < n; k++) snare(t0 + k * BEAT / 4, (vol || 0.16) + k * 0.04);
}

// ---- harmony: Em C G D (i VI III VII) — epic minor
const ROOTS = [40, 36, 43, 38];
const CHORDS = [[52, 55, 59], [48, 52, 55], [50, 55, 59], [50, 54, 57]];
const ARPN = [[52, 55, 59, 64], [48, 52, 55, 60], [55, 59, 62, 67], [50, 54, 57, 62]];

// ---- phrases: [beat, durBeats, midi] over 16 beats
const HOOK = [
  [0, 1.5, 64], [1.5, .5, 62], [2, 1, 64], [3, 1, 67],
  [4, 1.5, 60], [5.5, .5, 62], [6, 2, 64],
  [8, 1.5, 67], [9.5, .5, 64], [10, 1, 71], [11, 1, 69],
  [12, 1.5, 66], [13.5, .5, 62], [14, 2, 64],
];
const COUNTER = [[0, 4, 76], [4, 4, 72], [8, 3, 79], [11, 1, 78], [12, 4, 74]];
const RISE = [[0, 2, 52], [2, 2, 55], [4, 2, 57], [6, 2, 59], [8, 2, 60], [10, 2, 62], [12, 2, 64], [14, 1, 66], [15, 1, 67]];
const HOLY_CALL = [[0, .5, 76], [.5, .5, 79], [1, 1.5, 83], [2.5, .5, 81], [3, 1, 79], [4, 2, 76], [6, 2, 79]];
const HELL_ANSWER = [[8, .5, 52], [8.5, .5, 50], [9, 1.5, 47], [10.5, .5, 48], [11, 1, 50], [12, 2, 52], [14, 2, 40]];

function playPhrase(startBar, phrase, vol, o) {
  o = o || {};
  const base = startBar * BAR, tr = o.tr || 0;
  phrase.forEach(([b, d, m]) => {
    if (o.tri) addTri(base + b * BEAT, d * BEAT * 0.93, m + tr, vol, { vib: true });
    else addPulse(base + b * BEAT, d * BEAT * 0.92, m + tr, vol, { duty: o.duty || 0.5, vib: true, r: 0.07 });
  });
}

// ================================================================ compose
for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const ci = bar % 4;
  const sec = bar < 16 ? 'A' : bar < 32 ? 'B' : bar < 48 ? 'C' : bar < 64 ? 'D' : bar < 80 ? 'E' : bar < 98 ? 'F' : 'G';
  const TR = sec === 'E' ? 2 : 0; // key lift in the climax
  const root = ROOTS[ci] + TR, chord = CHORDS[ci].map(m => m + TR), arp = ARPN[ci].map(m => m + TR);
  const last = bar === BARS - 1;
  const intensity = sec === 'A' ? 0 : sec === 'B' ? 1 : sec === 'C' ? 2 : sec === 'D' ? 2 : sec === 'E' ? 3 : sec === 'F' ? 4 : 5;

  // ---- DRUMS — pounding from bar 0
  for (let b = 0; b < 4; b++) {
    kick(t0 + b * BEAT, last && b > 0 ? 0 : 0.52);
    if (last) continue;
    if (intensity >= 4 && (b === 1 || b === 3)) kick(t0 + b * BEAT + BEAT / 2, 0.34); // extra 8th kicks in the war
    if (b === 1 || b === 3) snare(t0 + b * BEAT);
    hat(t0 + b * BEAT + BEAT / 2, b === 3 && intensity >= 2, 0.1);
    if (intensity >= 2) hat(t0 + b * BEAT + BEAT / 4, false, 0.05);
    if (intensity >= 4) hat(t0 + b * BEAT + 3 * BEAT / 4, false, 0.05);
    // war toms
    if (sec === 'A' || sec === 'B') { tom(t0 + b * BEAT + BEAT / 2, 105, 0.22); }
    if (sec === 'D') { tom(t0 + b * BEAT, 95, 0.3); tom(t0 + b * BEAT + BEAT / 2, 120, 0.24); }
    if (sec === 'G') { tom(t0 + b * BEAT + BEAT / 4, 120, 0.24); tom(t0 + b * BEAT + 3 * BEAT / 4, 95, 0.26); }
  }
  // marching roll into every 4-bar line in D; roll into section starts elsewhere
  if (!last && sec === 'D' && ci === 3) roll(t0 + 3 * BEAT, 4);
  if (!last && ci === 3 && bar % 16 === 15) roll(t0 + 3.5 * BEAT, 2, 0.2);
  if (bar % 16 === 0 && bar > 0) crash(t0, 0.2 + intensity * 0.015);

  // ---- BASS
  if (!last) {
    if (intensity >= 4) { // gallop 16ths
      for (let e = 0; e < 16; e++) addPulse(t0 + e * BEAT / 4, BEAT / 4 * 0.8, root - 12 + (e % 8 === 6 ? 12 : 0), 0.22, { duty: 0.25, r: 0.015 });
    } else {
      const pat = [0, 0, 12, 0, 0, 12, 0, 12];
      for (let e = 0; e < 8; e++) addPulse(t0 + e * BEAT / 2, BEAT / 2 * 0.85, root - 12 + pat[e], 0.25, { duty: 0.25, r: 0.02 });
    }
  } else addPulse(t0, 2.6 * BEAT, root - 12, 0.28, { duty: 0.25, r: 0.5 });

  // ---- CHOIR PADS (detuned 50% pulses) — grow with intensity
  const padV = 0.05 + intensity * 0.008;
  chord.forEach(m => {
    addPulse(t0, last ? 2.8 * BEAT : BAR * 0.98, m, padV, { duty: 0.5, a: 0.03, r: last ? 0.6 : 0.06 });
    addPulse(t0, last ? 2.8 * BEAT : BAR * 0.98, m + 0.08, padV * 0.8, { duty: 0.5, a: 0.03, r: last ? 0.6 : 0.06 });
  });
  // low choir root drone in D (the build gets ominous)
  if (sec === 'D') addPulse(t0, BAR * 0.98, root, 0.07, { duty: 0.5, a: 0.05, r: 0.08 });

  // ---- ARPS — from B on, faster as it builds
  if (!last && sec !== 'A' && sec !== 'D') {
    const div = intensity >= 3 ? 4 : 2; // 16ths vs 8ths... (per beat quarters)
    const steps = 4 * div;
    for (let s = 0; s < steps; s++) {
      const seq = [0, 1, 2, 3, 2, 1][s % 6];
      addPulse(t0 + s * BAR / steps, BAR / steps * 0.8, arp[seq] + 12, 0.085, { duty: 0.125, r: 0.012 });
    }
  }
  // stab hits in A (dark staccato chords on the & of 2)
  if (sec === 'A') chord.forEach(m => addPulse(t0 + 1.5 * BEAT, BEAT * 0.3, m + 12, 0.07, { duty: 0.33, r: 0.02 }));
}

// ---- LEADS per section
for (let p = 0; p < 4; p++) playPhrase(p * 4, HOOK, 0.21);                              // A: hook
for (let p = 0; p < 4; p++) { playPhrase(16 + p * 4, HOOK, 0.2); playPhrase(16 + p * 4, COUNTER, 0.1, { tri: true }); } // B: + counter
for (let p = 0; p < 4; p++) { playPhrase(32 + p * 4, HOOK, 0.21, { tr: 12 }); playPhrase(32 + p * 4, HOOK, 0.08); }     // C: octave lift + shadow
for (let p = 0; p < 4; p++) { playPhrase(48 + p * 4, RISE, 0.24, { tri: true, tr: p * 2 }); }                            // D: THE BUILD rises each pass
for (let p = 0; p < 4; p++) { playPhrase(64 + p * 4, HOOK, 0.22, { tr: 2 }); playPhrase(64 + p * 4, COUNTER, 0.11, { tri: true, tr: 2 }); } // E: climax key-lift
for (let p = 0; p < 4; p++) { // F: the war — holy motif answered by hell motif (18 bars: 4 cycles + tail)
  playPhrase(80 + p * 4, HOLY_CALL, 0.22);
  playPhrase(80 + p * 4, HELL_ANSWER, 0.26, { tri: true });
}
playPhrase(96, HOLY_CALL, 0.22, { tr: 2 }); playPhrase(96, HELL_ANSWER, 0.26, { tri: true, tr: 2 }); // F tail, lifted
for (let p = 0; p < 4; p++) { playPhrase(98 + p * 4, HOOK, 0.22, { tr: 12 }); playPhrase(98 + p * 4, HOOK, 0.12); playPhrase(98 + p * 4, COUNTER, 0.1, { tri: true }); } // G: finale, everything
// final bar: Em power chord rings out to exactly 180.0
crash(113 * BAR, 0.26);
[52, 59, 64, 76].forEach(m => addPulse(113 * BAR, 2.6 * BEAT, m, 0.15, { duty: 0.5, r: 0.6 }));
addTri(113 * BAR, 2.6 * BEAT, 40, 0.22, { r: 0.6 });

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
fs.writeFileSync(process.argv[2] || 'eternal_theme.wav', pcm);
console.log('ETERNAL WAR.EXE —', (N / SR).toFixed(1) + 's,', BARS, 'bars @', BPM, 'BPM, peak', peak.toFixed(3));
