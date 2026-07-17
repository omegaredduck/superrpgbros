// artdev/skyisles/render_sky_theme.js — "SKYBREAKER MARCH", the STORM SKY
// ISLES theme: 8-BIT AIRSHIP BATTLE MARCH (Red's pick). Driving military
// march — bass-drum on 1 & 3, field-snare cadence w/ rolls, propeller-churn
// low pulse, brassy chip leads, heroic D-minor progression. All chiptune
// voices (pulse/triangle/noise, NO sine). ~3:00 exactly @140 BPM (105 bars).
//   node render_sky_theme.js sky_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 140;
const spb = SR * 60 / BPM;
const bar = spb * 4;
const BARS = 105;                    // 105 bars @140 = 180.0s
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 424242; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
function tone(start, dur, freq, gain, type, duty, atk, rel, freq2) {
  atk = atk == null ? 0.004 : atk; rel = rel == null ? 0.05 : rel;
  const A = Math.max(1, atk * SR), R = Math.max(1, rel * SR);
  let ph = 0;
  for (let k = 0; k < dur; k++) {
    const f = freq2 ? freq + (freq2 - freq) * (k / dur) : freq;
    ph += f / SR;
    let s = type === 'tri' ? tri(ph) : pulse(ph, duty || 0.5);
    let e = 1;
    if (k < A) e = k / A; else if (k > dur - R) e = Math.max(0, (dur - k) / R);
    add(start + k, s * gain * e);
  }
}
// ---- march drums ----
function bassDrum(start, gain) { const d = SR * 0.12; for (let k = 0; k < d; k++) { const t = k / d; const f = 120 - 85 * t; const e = Math.pow(1 - t, 2.4); add(start + k, tri(f * k / SR) * gain * e); } }
function fieldSnare(start, gain) { for (let k = 0; k < SR * 0.1; k++) { const e = Math.exp(-k / (SR * 0.024)); add(start + k, (nrnd() * 0.8 + tri(210 * k / SR) * 0.35) * gain * e); } }
function ghost(start, gain) { for (let k = 0; k < SR * 0.03; k++) { const e = Math.exp(-k / (SR * 0.009)); add(start + k, nrnd() * gain * e); } }
function roll(start, len, gain) { const n = Math.round(len / (spb / 8)); for (let i = 0; i < n; i++) ghost(start + Math.round(i * spb / 8), gain * (0.4 + 0.6 * i / n)); }
function cymbal(start, gain) { for (let k = 0; k < SR * 0.5; k++) { const e = Math.exp(-k / (SR * 0.14)); add(start + k, (nrnd() + nrnd()) * 0.5 * gain * e); } }
// propeller churn: low 16th octave-chug + soft chuff noise
function propeller(b0, root, gain) {
  for (let st = 0; st < 16; st++) {
    const p = b0 + Math.round(st * spb / 4);
    tone(p, Math.round(spb / 4 * 0.95), midi(root - 12 + (st % 2 ? 0 : -5)), gain, 'tri', 0, 0.002, 0.02);
    if (st % 2 === 0) for (let k = 0; k < SR * 0.012; k++) add(p + k, nrnd() * gain * 0.5 * (1 - k / (SR * 0.012)));
  }
}

// ---- D minor march: Dm — Bb — F — A7 ----
const ROOTS = [50, 46, 41, 45];                                 // D3 Bb2 F2 A2
const CH = [[62, 65, 69], [58, 62, 65], [57, 60, 65], [57, 61, 64]]; // Dm Bb F(2nd inv-ish) A7(no7)
// heroic lead A (8 eighths per bar; -1 = rest, held notes just repeat)
const LEAD_A = [
  [74, -1, 74, 72, 74, 77, 74, 72], [77, -1, 77, 74, 77, 82, 77, 74],
  [72, -1, 72, 69, 72, 77, 76, 74], [73, 73, 69, 73, 76, 73, 76, 79]
];
// soaring lead B
const LEAD_B = [
  [81, -1, -1, 79, 77, -1, 74, 72], [82, -1, -1, 79, 77, -1, 74, 77],
  [81, -1, 77, 72, 74, -1, 69, 72], [73, 76, 79, 76, 73, 69, 73, 76]
];
// bugle-call intro motif (Dm arpeggio fanfare)
const BUGLE = [
  [62, -1, 65, -1, 69, -1, 74, -1], [69, -1, 74, -1, 77, -1, 74, -1],
  [74, 74, -1, 74, 77, 74, -1, 69], [74, -1, -1, -1, -1, -1, -1, -1]
];

// sections per bar
function sec(b) {
  if (b < 8) return { prop: b >= 2, drums: b >= 4, bass: false, chords: false, arp: false, lead: 'bugle', full: false };
  if (b < 24) return { prop: true, drums: true, bass: true, chords: b >= 12, arp: false, lead: b >= 16 ? 'A' : null, full: false };  // MARCH A
  if (b < 40) return { prop: true, drums: true, bass: true, chords: true, arp: true, lead: 'B', full: true };                        // MARCH B
  if (b < 56) return { prop: true, drums: 'half', bass: true, chords: false, arp: true, lead: b >= 48 ? 'bugle' : null, full: false };// STORM BREAK
  if (b < 72) return { prop: true, drums: true, bass: true, chords: true, arp: true, lead: 'A+', full: true };                       // CLIMAX A
  if (b < 88) return { prop: true, drums: true, bass: true, chords: true, arp: true, lead: 'B+', full: true, descant: true };        // CLIMAX B
  if (b < 100) return { prop: true, drums: true, bass: true, chords: true, arp: false, lead: 'bugle', full: false };                 // FINALE reprise
  return { prop: b < 103, drums: b < 102 ? 'half' : false, bass: b < 103, chords: false, arp: false, lead: null, full: false };      // OUTRO
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // propeller churn (the airship engine under everything)
  if (s.prop) propeller(b0, ROOTS[t], 0.1);
  // march drums: bass drum 1&3 · snare 2&4 + cadence ghosts · roll into each 4-bar turn
  if (s.drums) {
    const half = s.drums === 'half';
    for (let beat = 0; beat < 4; beat++) {
      const p = b0 + Math.round(beat * spb);
      if ((beat === 0 || beat === 2) && !half) bassDrum(p, 0.9);
      if (beat === 0 && half) bassDrum(p, 0.7);
      if (beat === 1 || beat === 3) fieldSnare(p, half ? 0.3 : 0.5);
      // cadence ghosts on the e/a of beats 2 & 4
      if (!half && (beat === 1 || beat === 3)) { ghost(p + Math.round(spb * 0.25), 0.14); ghost(p + Math.round(spb * 0.75), 0.18); }
    }
    if (t === 3) roll(b0 + Math.round(3 * spb), Math.round(spb), 0.3); // roll into the next downbeat
  }
  if (s.full && t === 0) cymbal(b0, 0.3);
  // bass: martial root pumps on quarters w/ a passing 8th
  if (s.bass) {
    const patt = [0, 0, 7, 0]; // root root fifth root on quarters
    for (let beat = 0; beat < 4; beat++) {
      const p = b0 + Math.round(beat * spb);
      tone(p, Math.round(spb * 0.6), midi(root + patt[beat]), 0.32, 'tri', 0, 0.003, 0.05);
      if (beat === 3) tone(p + Math.round(spb / 2), Math.round(spb / 2 * 0.7), midi(root + 12), 0.22, 'tri', 0, 0.003, 0.04);
    }
  }
  // brass chord hits: on-beat stabs (march brass section), duty 0.3 = brassy
  if (s.chords) {
    [0, 2].forEach(beat => {
      const p = b0 + Math.round(beat * spb + spb / 2); // the "and" after 1 and 3
      chord.forEach(m => tone(p, Math.round(spb * 0.3), midi(m), 0.1, 'pulse', 0.3, 0.006, 0.07));
    });
  }
  // wind arps: 16ths cycling chord tones (the storm swirling above the deck)
  if (s.arp) {
    for (let st = 0; st < 16; st++) {
      const p = b0 + Math.round(st * spb / 4);
      const m = chord[st % 3] + 24 + (st % 8 >= 4 ? 12 : 0);
      tone(p, Math.round(spb / 4 * 0.85), midi(m), 0.065, 'pulse', 0.25, 0.002, 0.025);
    }
  }
  // leads (brassy pulse, octave-doubled on the + variants)
  const line = s.lead === 'bugle' ? BUGLE[t] : s.lead && s.lead[0] === 'A' ? LEAD_A[t] : s.lead && s.lead[0] === 'B' ? LEAD_B[t] : null;
  if (line) {
    const up = s.lead.length > 1 ? 12 : 0;
    for (let e = 0; e < 8; e++) {
      const m = line[e]; if (m < 0) continue;
      const p = b0 + Math.round(e * spb / 2), d = Math.round(spb / 2 * 0.92);
      tone(p, d, midi(m + up), s.lead === 'bugle' ? 0.2 : 0.17, 'pulse', 0.3, 0.005, 0.05);
      if (up) tone(p, d, midi(m), 0.08, 'pulse', 0.3, 0.005, 0.05); // octave body
    }
  }
  // descant harmony a third above in the final climax
  if (s.descant) {
    const line2 = LEAD_B[t];
    for (let e = 0; e < 8; e++) { const m = line2[e]; if (m < 0) continue; tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.9), midi(m + 15), 0.06, 'pulse', 0.25, 0.004, 0.05); }
  }
  // signal-bell hit at every section boundary
  if ([8, 24, 40, 56, 72, 88, 100].includes(b)) { tone(b0, Math.round(spb * 1.6), midi(86), 0.14, 'tri', 0, 0.002, 0.5); tone(b0, Math.round(spb * 1.6), midi(93), 0.07, 'tri', 0, 0.002, 0.5); }
}
// final sustained Dm hit on the last bar
const fb = Math.round(104 * bar);
[50, 62, 65, 69, 74].forEach(m => tone(fb, Math.round(bar * 0.9), midi(m), 0.16, m < 60 ? 'tri' : 'pulse', 0.3, 0.01, 1.2));
bassDrum(fb, 1); cymbal(fb, 0.45);

// ---- normalize + soft clip -> 16-bit WAV ----
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'sky_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm');
