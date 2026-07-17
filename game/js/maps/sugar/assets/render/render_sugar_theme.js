// artdev/sugar/render_sugar_theme.js — "SUGAR RUSH.EXE", the SUGAR
// WORLD theme, TAKE 1 (Red: FAST TRANCE TECHNO + INSANE PIANO SOLO +
// GUITAR SOLO). 156 BPM four-on-floor, acid bass, trance arps, candy
// bell counter-melody, 16-bar INSANE chip-piano solo, piano/guitar
// trade-off bridge, 16-bar guitar solo w/ bends, octave-up final drop.
// NO SLOW INTRO. All chiptune voices. 117 bars @ 156 = 180.0s exactly.
//   node render_sugar_theme.js sugar_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 156;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 117;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 5150; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
function piano(start, m, gain, len) {
  const d = Math.round(len || spb * 0.5);
  const f0 = midi(m);
  [[1, 1, 0.5], [2, 0.42, 0.33], [3, 0.14, 0.25]].forEach(([mult, g, duty]) => {
    let ph = 0;
    for (let k = 0; k < d; k++) {
      ph += (f0 * mult) / SR;
      const e = Math.min(1, k / (SR * 0.002)) * Math.exp(-k / (SR * (0.16 - mult * 0.03)));
      add(start + k, pulse(ph, duty) * gain * g * e);
    }
  });
}
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
function kick(start, gain) { const d = SR * 0.1; for (let k = 0; k < d; k++) { const t = k / d; const f = 138 - 94 * t; const e = Math.pow(1 - t, 2); add(start + k, tri(f * k / SR) * gain * e); } }
function snare(start, gain) { for (let k = 0; k < SR * 0.08; k++) { const e = Math.exp(-k / (SR * 0.02)); add(start + k, (nrnd() * 0.72 + tri(216 * k / SR) * 0.36) * gain * e); } }
function hat(start, gain, open) { const d = SR * (open ? 0.08 : 0.02); for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * (open ? 0.026 : 0.006))); add(start + k, nrnd() * gain * e); } }
function saw3(start, dur, m, gain, duty) { [-0.009, 0, 0.009].forEach((dt, i) => tone(start, dur, midi(m) * (1 + dt), gain * (i === 1 ? 1 : 0.62), 'pulse', duty || 0.46, 0.004, 0.04)); }
function acid(start, dur, m, gain, slideTo) { tone(start, dur, midi(m), gain, 'pulse', 0.28, 0.002, 0.03, slideTo ? midi(slideTo) / midi(m) : null); }
function bell(start, m, gain) { // candy toy-bell: high tri + sparkle partial
  tone(start, Math.round(spb * 0.4), midi(m), gain, 'tri', 0, 0.002, 0.2);
  tone(start, Math.round(spb * 0.25), midi(m + 12), gain * 0.4, 'tri', 0, 0.002, 0.15);
}
function riser(start, dur, gain) { let ph = 0; for (let k = 0; k < dur; k++) { const f = 280 + 2200 * (k / dur); ph += f / SR; add(start + k, (pulse(ph, 0.5) * 0.5 + nrnd() * 0.5) * gain * (k / dur) * 0.6); } }

// A minor trance: Am — F — C — G
const ROOTS = [33, 29, 24, 31], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
const HOOK = [
  [76, -1, 76, 74, 76, -1, 79, -1], [77, -1, 76, 74, 72, -1, 74, 76],
  [72, -1, 72, 71, 72, -1, 76, -1], [74, -1, 76, 78, 79, -1, 74, -1],
];
const BELLS = [[88, -1, -1, 91, -1, -1, 88, -1], [-1, 89, -1, -1, 88, -1, 86, -1], [84, -1, -1, 88, -1, -1, 84, -1], [86, -1, 88, -1, 90, -1, -1, -1]];
const AM = [57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];

function pianoSolo(i, b0, chIdx) {
  const q = spb / 4, c = CH[chIdx];
  const P16 = (arr, g) => arr.forEach((m, e) => { if (m > 0) piano(b0 + Math.round(e * q), m, g || 0.21, q * 1.05); });
  switch (i % 8) {
    case 0: P16(AM.slice(1, 17)); break;                                     // scale blaze up
    case 1: { const arp = [c[0], c[1], c[2], c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[2] + 12, c[1] + 12, c[0] + 12, c[2], c[1], c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24]; P16(arp); break; }
    case 2: for (let e = 0; e < 32; e++) piano(b0 + Math.round(e * q / 2), AM[Math.max(0, 16 - (e >> 1))] + (e % 2 ? 12 : 0), 0.16, q * 0.6); break; // 32nd cascade
    case 3: P16([c[0] + 12, c[0], c[0] + 12, c[0] + 24, c[2] + 12, c[2], c[2] + 12, c[2] + 24, c[1] + 12, c[1], c[1] + 12, c[1] + 24, c[0] + 12, c[0] + 24, c[2] + 24, c[0] + 36], 0.19); break; // octave hammer climb
    case 4: P16([64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77, 74, 79, 76, 81], 0.19); break; // zigzag
    case 5: for (let e = 0; e < 12; e++) piano(b0 + Math.round(e * q / 2), e % 2 ? 81 : 83, 0.17, q * 0.55); P16([-1, -1, -1, -1, -1, -1, 84, 81, 79, 77, 76, 74, 72, 71, 69, 67], 0.19); break; // trill + run-off
    case 6: P16([57, 58, 59, 60, 61, 62, 63, 64, 66, 68, 69, 71, 72, 74, 76, 77], 0.18); break; // chromatic sprint
    default: P16([57, 60, 64, 69, 72, 76, 81, 84, 88, -1, -1, -1, -1, -1, -1, -1], 0.21); [84, 88, 91].forEach(m => piano(b0 + Math.round(2.5 * spb), m, 0.19, spb * 1.4)); break; // glory climb
  }
}
function guitarSolo(i, b0, chIdx) {
  const q = spb / 4, c = CH[chIdx];
  const L16 = (arr, g) => arr.forEach((m, e) => { if (m > 0) gtr(b0 + Math.round(e * q), Math.round(q * 0.92), m, g || 0.17); });
  switch (i % 8) {
    case 0: L16([69, 72, 74, 76, 79, 76, 74, 72, 69, 72, 74, 76, 79, 81, 79, 76]); break;
    case 1: gtr(b0, Math.round(spb * 1.5), 74, 0.19, 76, true); L16([-1, -1, -1, -1, -1, -1, 76, 79, 81, 79, 76, 74, 76, 74, 72, 74]); break;
    case 2: L16([76, 79, 81, 84, 81, 79, 76, 74, 76, 79, 81, 84, 86, 84, 81, 79]); break;
    case 3: gtr(b0, Math.round(spb), 84, 0.19, null, true); gtr(b0 + Math.round(spb * 1.5), Math.round(spb * 0.4), 81, 0.16); gtr(b0 + Math.round(spb * 2), Math.round(spb * 1.8), 79, 0.18, 81, true); break;
    case 4: [0, 1, 2, 3].forEach(bt => { gtr(b0 + Math.round(bt * spb), Math.round(spb * 0.22), c[1] + 12, 0.14); gtr(b0 + Math.round((bt + 0.5) * spb), Math.round(spb * 0.22), c[2] + 12, 0.14); }); break; // double stops
    case 5: L16([81, 81, -1, 81, 81, -1, 81, 84, 86, -1, 84, -1, 81, 79, 76, 74], 0.18); break;
    case 6: gtr(b0, Math.round(spb * 0.4), 81, 0.18); gtr(b0 + Math.round(spb * 0.5), Math.round(spb * 3.2), 81, 0.2, 84, true); break; // THE big bend
    default: L16([69, 74, 79, 84, 79, 74, 69, 64, 69, 74, 79, 84, 86, 84, 81, 79]); break;
  }
}

function sec(b) {
  if (b < 20) return { kick: true, hats: true, bass: true, arp: true, hook: true, bells: b >= 8 }; // STRAIGHT IN
  if (b < 28) return { kick: true, hats: true, bass: true, arp: true, stab: true, build: b >= 24, roll: b - 24 };
  if (b < 44) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, bells: true }; // DROP 1
  if (b < 48) return { pads: true, pianoTease: true };
  if (b < 64) return { kick: true, hats: true, bass: true, pSolo: b - 48 };  // INSANE PIANO SOLO
  if (b < 68) return { kick: true, hats: true, bass: true, trade: b - 64 };  // piano/guitar TRADE-OFF
  if (b < 84) return { kick: true, hats: true, bass: true, gSolo: b - 68 };  // GUITAR SOLO
  if (b < 88) return { kick: true, hats: true, bass: true, build: true, roll: b - 84 };
  if (b < 104) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, up: 12, duet: true }; // FINAL DROP
  if (b < 112) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, bells: true }; // victory lap
  return { tag: b - 112 };
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  if (s.kick) [0, 1, 2, 3].forEach(bt => kick(b0 + Math.round(bt * spb), 0.92));
  if (s.hats) {
    [0.5, 1.5, 2.5, 3.5].forEach(bt => hat(b0 + Math.round(bt * spb), 0.22, true));
    for (let e = 0; e < 16; e++) if (e % 4 !== 0) hat(b0 + Math.round(e * spb / 4), 0.08);
  }
  // acid bass 16ths
  if (s.bass) for (let e = 0; e < 16; e++) {
    if (e % 4 === 0) continue;
    const oct = (e % 8 === 6) ? 12 : 0;
    acid(b0 + Math.round(e * spb / 4), Math.round(spb / 4 * 0.8), root + oct - 12, e % 2 ? 0.2 : 0.26, e === 14 ? root + 7 : null);
  }
  // trance arp
  if (s.arp) {
    const notes = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[1]];
    for (let e = 0; e < 16; e++) tone(b0 + Math.round(e * spb / 4), Math.round(spb / 4 * 0.85), midi(notes[e % 8] + 12), 0.07, 'pulse', 0.3, 0.002, 0.03);
  }
  // hook lead
  if (s.hook) for (let e = 0; e < 8; e++) {
    const m = HOOK[t][e]; if (m < 0) continue;
    if (s.big) saw3(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.9), m + (s.up || 0), 0.11);
    else tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.88), midi(m), 0.11, 'pulse', 0.42, 0.003, 0.04);
  }
  // candy bells counter-melody
  if (s.bells) BELLS[t].forEach((m, e) => { if (m > 0) bell(b0 + Math.round(e * spb / 2), m, 0.07); });
  if (s.stab) [1.5, 3.5].forEach(bt => chord.forEach(m => tone(b0 + Math.round(bt * spb), Math.round(spb * 0.2), midi(m + 12), 0.06, 'pulse', 0.4, 0.003, 0.04)));
  if (s.build) {
    const density = 6 + (s.roll || 0) * 3;
    for (let r = 0; r < density; r++) snare(b0 + Math.round(r * bar / density), 0.3 + (s.roll || 0) * 0.05);
    riser(b0, Math.round(bar), 0.12 + (s.roll || 0) * 0.05);
    if (s.roll === 3) for (let e = 0; e < 16; e++) snare(b0 + Math.round(e * spb / 4), 0.45);
  }
  if (s.big) { if (t === 0) for (let k = 0; k < SR * 0.4; k++) add(b0 + k, nrnd() * 0.25 * Math.exp(-k / (SR * 0.09))); tone(b0, Math.round(bar * 0.95), midi(root - 24), 0.09, 'tri', 0, 0.01, 0.1); }
  if (s.pads) {
    for (let e = 0; e < 8; e++) { if (e % 4 === 3) continue; chord.forEach((m, i) => tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.7), midi(m) * (1 + (i - 1) * 0.005), 0.045, 'pulse', 0.5, 0.02, 0.05)); }
    if (s.pianoTease) [0.5, 2, 3.25].forEach((bt, i) => piano(b0 + Math.round(bt * spb), chord[i % 3] + 24, 0.13, spb * 0.5));
  }
  // ---- SOLOS
  if (s.pSolo != null) { pianoSolo(s.pSolo, b0, t); [1, 3].forEach(bt => snare(b0 + Math.round(bt * spb), 0.3)); }
  if (s.gSolo != null) { guitarSolo(s.gSolo, b0, t); [1, 3].forEach(bt => snare(b0 + Math.round(bt * spb), 0.3)); }
  if (s.trade != null) { // 2-bar piano, 2-bar guitar trade
    if (s.trade < 2) pianoSolo(2 + s.trade, b0, t); else guitarSolo(s.trade - 2, b0, t);
    [1, 3].forEach(bt => snare(b0 + Math.round(bt * spb), 0.3));
  }
  // final drop duet: piano echoes hook up top, guitar answers phrase-ends
  if (s.duet) {
    for (let e = 0; e < 8; e++) { const m = HOOK[t][e]; if (m > 0 && e % 2 === 0) piano(b0 + Math.round(e * spb / 2), m + 24, 0.1, spb * 0.35); }
    if (t === 3) gtr(b0 + Math.round(spb * 2.5), Math.round(spb * 1.4), 88, 0.15, 91, true);
  }
  if ([20, 28, 44, 48, 64, 68, 84, 88, 104, 112].includes(b)) { hat(b0, 0.3, true); riser(b0 - Math.round(spb), Math.round(spb), 0.1); }
  // tag: big hits + piano gliss + candy bell sparkle out
  if (s.tag != null) {
    const tg = s.tag;
    if (tg === 0) { [0, 1.5, 2.5].forEach(bt => { kick(b0 + Math.round(bt * spb), 0.9); chord.forEach(m => saw3(b0 + Math.round(bt * spb), Math.round(spb * 0.4), m + 12, 0.08)); }); }
    else if (tg === 1) { for (let e = 0; e < 16; e++) piano(b0 + Math.round(e * spb / 4), AM[e], 0.18, spb * 0.3); }
    else if (tg === 2) { kick(b0, 0.9); [57, 64, 69, 76].forEach(m => piano(b0, m + 12, 0.2, bar * 0.9)); gtr(b0, Math.round(bar * 0.8), 81, 0.16, null, true); }
    else if (tg === 3) { [88, 91, 93, 96].forEach((m, i) => bell(b0 + Math.round(i * spb * 0.75), m, 0.1 - i * 0.015)); }
    else { kick(b0, 1); [57, 64, 69, 76, 84].forEach(m => piano(b0, m, 0.2, bar * 0.95)); bell(b0 + Math.round(spb), 96, 0.08); }
  }
}

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.05); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'sugar_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm sugar trance');
