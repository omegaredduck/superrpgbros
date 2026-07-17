// artdev/swamp/render_swamp_theme.js — "WISP RAVE", the WITCH'S SWAMP
// theme, TAKE 4 (Red: TECHNO TRANCE 8-bit). Four-on-the-floor kick,
// driving 16th acid bass, trance arpeggios, detuned anthem lead, gated
// pads, a real breakdown → snare-roll build → DROP. Wisp blips + one frog
// for swamp flavor. All chiptune voices. 105 bars @ 140 BPM = 180.0s.
//   node render_swamp_theme.js swamp_theme.wav
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
let _seed = 1400; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
function tone(start, dur, freq, gain, type, duty, atk, rel, bendTo) {
  atk = atk == null ? 0.004 : atk; rel = rel == null ? 0.05 : rel;
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
function kick(start, gain) { const d = SR * 0.1; for (let k = 0; k < d; k++) { const t = k / d; const f = 135 - 92 * t; const e = Math.pow(1 - t, 2); add(start + k, tri(f * k / SR) * gain * e); } }
function snare(start, gain) { for (let k = 0; k < SR * 0.08; k++) { const e = Math.exp(-k / (SR * 0.02)); add(start + k, (nrnd() * 0.75 + tri(210 * k / SR) * 0.35) * gain * e); } }
function hat(start, gain, open) { const d = SR * (open ? 0.08 : 0.02); for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * (open ? 0.026 : 0.006))); add(start + k, nrnd() * gain * e); } }
// supersaw-ish: 3 detuned pulses
function saw3(start, dur, m, gain, duty) {
  [-0.008, 0, 0.008].forEach((dt, i) => tone(start, dur, midi(m) * (1 + dt), gain * (i === 1 ? 1 : 0.6), 'pulse', duty || 0.5, 0.005, 0.04));
}
// acid bass note: short pulse w/ optional slide + accent
function acid(start, dur, m, gain, slideTo) {
  tone(start, dur, midi(m), gain, 'pulse', 0.28, 0.002, 0.03, slideTo ? midi(slideTo) / midi(m) : null);
}
function riser(start, dur, gain) { let ph = 0; for (let k = 0; k < dur; k++) { const f = 300 + 1900 * (k / dur); ph += f / SR; add(start + k, (pulse(ph, 0.5) * 0.5 + nrnd() * 0.5) * gain * (k / dur) * 0.6); } }
function drip(start, gain) { tone(start, SR * 0.07, 1150, gain, 'tri', 0, 0.002, 0.05, 0.6); }
function croak(start, gain) { tone(start, SR * 0.09, 92, gain, 'pulse', 0.3, 0.01, 0.04, 0.86); }

// A minor trance: Am — F — C — G
const ROOTS = [33, 29, 24, 31], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
// arp: chord notes up-down over 16ths (built per-bar from CH)
// anthem lead (2-bar phrases, 8th grid)
const LEAD = [
  [69, -1, 72, -1, 76, -1, 74, 72], [74, -1, 72, -1, 69, -1, 65, 69],   // Am F
  [72, -1, 67, -1, 72, -1, 76, 74], [74, -1, 71, -1, 67, -1, 71, 74]    // C G
];
// breakdown melody (slower, emotive — quarter grid)
const BREAK_MEL = [[76, 74, 72, 69], [72, 69, 65, 69], [76, 72, 67, 72], [74, 71, 67, 62]];

function sec(b) {
  if (b < 8) return { kick: true, hats: b >= 4, filterIn: true };            // intro
  if (b < 16) return { kick: true, hats: true, bass: true };                 // bass in
  if (b < 32) return { kick: true, hats: true, bass: true, arp: true, stab: b >= 24 }; // arp groove
  if (b < 48) return { pads: true, bmel: true, wisps: true };                // BREAKDOWN
  if (b < 56) return { pads: true, build: true, roll: b - 48 };              // BUILD (8 bars)
  if (b < 80) return { kick: true, hats: true, bass: true, arp: true, lead: true, big: true }; // THE DROP
  if (b < 88) return { pads: true, bmel: true, wisps: true, short: true };   // break 2
  if (b < 100) return { kick: true, hats: true, bass: true, arp: true, lead: true, big: true, up: 12 }; // final drop
  return { kick: b < 102, hats: true, bass: b < 102, outro: true };          // outro
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // four-on-the-floor
  if (s.kick) [0, 1, 2, 3].forEach(bt => kick(b0 + Math.round(bt * spb), 0.9));
  // hats: offbeat open + 16th closed
  if (s.hats) {
    [0.5, 1.5, 2.5, 3.5].forEach(bt => hat(b0 + Math.round(bt * spb), 0.22, true));
    for (let e = 0; e < 16; e++) if (e % 4 !== 0) hat(b0 + Math.round(e * spb / 4), 0.08);
  }
  // acid bass: 16th offbeats pumping the root, octave pops + slides
  if (s.bass) for (let e = 0; e < 16; e++) {
    if (e % 4 === 0) continue; // duck under kick
    const oct = (e % 8 === 6) ? 12 : 0;
    const slide = (e === 14) ? root + 7 : null;
    acid(b0 + Math.round(e * spb / 4), Math.round(spb / 4 * 0.8), root + oct - 12, e % 2 ? 0.2 : 0.26, slide);
  }
  // trance arp: chord notes up-down on 16ths, +24
  if (s.arp) {
    const notes = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[1]];
    for (let e = 0; e < 16; e++) tone(b0 + Math.round(e * spb / 4), Math.round(spb / 4 * 0.85), midi(notes[e % 8] + 12), 0.08, 'pulse', 0.3, 0.002, 0.03);
  }
  // chord stabs on offbeats (pre-drop energy)
  if (s.stab) [1.5, 3.5].forEach(bt => chord.forEach(m => tone(b0 + Math.round(bt * spb), Math.round(spb * 0.2), midi(m), 0.06, 'pulse', 0.4, 0.003, 0.04)));
  // anthem lead (drop)
  if (s.lead) for (let e = 0; e < 8; e++) {
    const m = LEAD[t][e]; if (m < 0) continue;
    saw3(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.9), m + (s.up || 0), 0.11, 0.44);
  }
  // gated pads (breakdowns): chord sustained but chopped 8ths
  if (s.pads) for (let e = 0; e < 8; e++) {
    if (e % 4 === 3) continue; // the gate
    chord.forEach((m, i) => tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.7), midi(m) * (1 + (i - 1) * 0.005), 0.045, 'pulse', 0.5, 0.02, 0.05));
  }
  // breakdown melody: emotive quarters, detuned
  if (s.bmel) BREAK_MEL[t].forEach((m, i) => saw3(b0 + Math.round(i * spb), Math.round(spb * 0.9), m, s.short ? 0.09 : 0.11, 0.5));
  // build: snare roll accelerating + riser
  if (s.build) {
    const density = 4 + s.roll; // 4,5,6...11 hits per bar growing
    for (let r = 0; r < density; r++) snare(b0 + Math.round(r * bar / density), 0.3 + s.roll * 0.03);
    if (s.roll >= 4) riser(b0, Math.round(bar), 0.12 + (s.roll - 4) * 0.04);
    if (s.roll === 7) for (let e = 0; e < 16; e++) snare(b0 + Math.round(e * spb / 4), 0.45); // final 16th roll
  }
  // big drop extras: white-noise crash on bar 1 + sub layer
  if (s.big) {
    if (t === 0) for (let k = 0; k < SR * 0.4; k++) add(b0 + k, nrnd() * 0.25 * Math.exp(-k / (SR * 0.09)));
    tone(b0, Math.round(bar * 0.95), midi(root - 24), 0.09, 'tri', 0, 0.01, 0.1);
  }
  // swamp flavor: wisp blips in breakdowns, one croak per phrase
  if (s.wisps) { drip(b0 + Math.round(spb * 1.25), 0.1); if (t === 3) croak(b0 + Math.round(spb * 3.2), 0.08); }
  // section-door: open hat + reverse-ish riser tail
  if ([16, 32, 48, 56, 80, 88, 100].includes(b)) { hat(b0, 0.3, true); riser(b0 - Math.round(spb), Math.round(spb), 0.1); }
}
// final: last kick + wisp drip echo
kick(Math.round(104.5 * bar), 0.9);
drip(Math.round(104.7 * bar), 0.14); drip(Math.round(104.85 * bar), 0.08);

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.05); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'swamp_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm trance');
