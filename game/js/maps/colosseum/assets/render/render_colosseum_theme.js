// artdev/colosseum/render_colosseum_theme.js — "GLORY.EXE", the COLOSSEUM
// theme, TAKE 1 (Red: GAMING TECHNO + CRAZY PIANO SOLO; replaces banked
// brass fanfare). Keygen-style driving techno — 4-on-floor, octave bass,
// catchy hook lead, trumpet-ish fanfare stabs + crowd roars for arena
// flavor, and a 24-bar CRAZY chiptune-piano solo (runs, broken-chord
// sweeps, octave hammering, 32nd bursts). All chiptune voices
// (pulse/tri/noise, no sine). 105 bars @ 140 BPM = 180.0s exactly.
//   node render_colosseum_theme.js colosseum_theme.wav
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
let _seed = 777; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
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
// CHIPTUNE PIANO — layered pulses w/ partials + fast exp decay
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
function kick(start, gain) { const d = SR * 0.1; for (let k = 0; k < d; k++) { const t = k / d; const f = 140 - 96 * t; const e = Math.pow(1 - t, 2); add(start + k, tri(f * k / SR) * gain * e); } }
function snare(start, gain) { for (let k = 0; k < SR * 0.09; k++) { const e = Math.exp(-k / (SR * 0.022)); add(start + k, (nrnd() * 0.72 + tri(196 * k / SR) * 0.36) * gain * e); } }
function hat(start, gain, open) { const d = SR * (open ? 0.08 : 0.02); for (let k = 0; k < d; k++) { const e = Math.exp(-k / (SR * (open ? 0.026 : 0.006))); add(start + k, nrnd() * gain * e); } }
function saw3(start, dur, m, gain, duty) { [-0.009, 0, 0.009].forEach((dt, i) => tone(start, dur, midi(m) * (1 + dt), gain * (i === 1 ? 1 : 0.62), 'pulse', duty || 0.46, 0.004, 0.04)); }
function riser(start, dur, gain) { let ph = 0; for (let k = 0; k < dur; k++) { const f = 260 + 2100 * (k / dur); ph += f / SR; add(start + k, (pulse(ph, 0.5) * 0.5 + nrnd() * 0.5) * gain * (k / dur) * 0.6); } }
// crowd roar — bandpassed-ish noise swell
function roar(start, dur, gain) {
  let lp = 0;
  for (let k = 0; k < dur; k++) {
    const t = k / dur;
    const env = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
    lp += (nrnd() - lp) * 0.18;
    add(start + k, lp * gain * env * 2.2);
  }
}
// trumpet-ish fanfare stab (bright pulse + fifth)
function fanfare(start, dur, m, gain) {
  tone(start, dur, midi(m), gain, 'pulse', 0.32, 0.01, 0.08);
  tone(start, dur, midi(m + 7), gain * 0.55, 'pulse', 0.32, 0.012, 0.08);
  tone(start, dur, midi(m + 12), gain * 0.3, 'pulse', 0.25, 0.014, 0.08);
}

// A minor keygen: Am — F — C — G
const ROOTS = [45, 41, 36, 43], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
// hook lead (2-bar phrases, 8th grid) — catchy keygen melody
const HOOK = [
  [76, -1, 72, 76, 79, -1, 76, 72], [74, 72, 69, -1, 72, -1, 69, 65],
  [72, -1, 67, 72, 76, -1, 72, 79], [79, 78, 74, -1, 71, -1, 74, 79],
];
// fanfare intro line (quarters)
const FAN = [[69, 69, 76, 74], [72, 76, 79, -1]];

// ---- CRAZY PIANO SOLO — per-bar generators ------------------------------
const AM_SCALE = [57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];
function pianoSolo(i, b0, chIdx) {
  const q = spb / 4, c = CH[chIdx];
  const P16 = (arr, g) => arr.forEach((m, e) => { if (m > 0) piano(b0 + Math.round(e * q), m, g || 0.2, q * 1.05); });
  const kind = i % 12;
  if (kind === 0) { // ascending scale blaze
    P16(AM_SCALE.slice(2, 18).map((m, j) => m));
  } else if (kind === 1) { // broken-chord sweep up two octaves
    const arp = [c[0], c[1], c[2], c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[2] + 12, c[1] + 12, c[0] + 12, c[2], c[1], c[0], c[1], c[2], c[0] + 12];
    P16(arp);
  } else if (kind === 2) { // octave hammering on chord root
    P16([c[0] + 12, c[0], c[0] + 12, c[0], c[0] + 12, c[0] + 24, c[0] + 12, c[0], c[2] + 12, c[2], c[2] + 12, c[2], c[1] + 12, c[1] + 24, c[1] + 12, c[1]], 0.19);
  } else if (kind === 3) { // 32nd-note burst descent (THE crazy bit)
    for (let e = 0; e < 32; e++) {
      const m = AM_SCALE[Math.max(0, 16 - Math.floor(e / 2))];
      piano(b0 + Math.round(e * q / 2), m + (e % 2 ? 0 : 12), 0.15, q * 0.6);
    }
  } else if (kind === 4) { // left-right call: bass octaves vs treble stabs
    [0, 2].forEach(bt => { piano(b0 + Math.round(bt * spb), c[0] - 12, 0.24, spb * 0.4); piano(b0 + Math.round(bt * spb), c[0], 0.2, spb * 0.4); });
    [1, 3].forEach(bt => c.forEach(m => piano(b0 + Math.round(bt * spb), m + 12, 0.13, spb * 0.3)));
    [1.5, 3.5].forEach(bt => piano(b0 + Math.round(bt * spb), c[2] + 24, 0.16, spb * 0.25));
  } else if (kind === 5) { // zigzag thirds
    P16([64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77, 74, 79, 76, 81], 0.18);
  } else if (kind === 6) { // trill + run-off
    for (let e = 0; e < 12; e++) piano(b0 + Math.round(e * q / 2), e % 2 ? 76 : 77, 0.16, q * 0.55);
    P16([-1, -1, -1, -1, -1, -1, 79, 77, 76, 74, 72, 71, 69, 67, 65, 64], 0.18);
  } else if (kind === 7) { // chromatic prowl up
    P16([57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72], 0.17);
  } else if (kind === 8) { // Alberti blaze
    P16([c[0], c[2], c[1], c[2], c[0], c[2], c[1], c[2], c[0] + 12, c[2] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[2] + 12, c[1] + 12, c[2] + 12], 0.17);
  } else if (kind === 9) { // big two-hand chords marching
    [0, 1, 2, 3].forEach(bt => {
      c.forEach(m => piano(b0 + Math.round(bt * spb), m + 12, 0.15, spb * 0.8));
      piano(b0 + Math.round(bt * spb), c[0] - 12, 0.24, spb * 0.8);
      piano(b0 + Math.round((bt + 0.5) * spb), c[2] + 24, 0.13, spb * 0.35);
    });
  } else if (kind === 10) { // cascade down in triplet-feel groups
    const seq = [84, 81, 79, 76, 79, 76, 74, 72, 74, 72, 71, 69, 71, 69, 67, 65];
    P16(seq, 0.19);
  } else { // glory climb — ends on high held chord
    P16([57, 60, 64, 69, 72, 76, 81, 84, -1, -1, -1, -1, -1, -1, -1, -1], 0.2);
    [84, 88, 91].forEach(m => piano(b0 + Math.round(2 * spb), m, 0.18, spb * 1.9));
  }
}

function sec(b) {
  if (b < 4) return { fanfare: true, roar: b === 0, kick: true, hats: true, bass: true }; // COMBINED intro: fanfare OVER the full beat
  if (b < 20) return { kick: true, hats: true, bass: true, hook: true };    // hook lands at ~7s
  if (b < 28) return { kick: true, hats: true, bass: true, stab: true, build: b >= 24, roll: b - 24 }; // build
  if (b < 52) return { kick: true, hats: true, bass: true, hook: true, big: true, snares: true }; // DROP 1 (24 bars)
  if (b < 56) return { pads: true, pianoTease: true };                      // breather + piano teases in
  if (b < 84) return { kick: true, hats: true, bass: true, solo: b - 56, snares: true }; // CRAZY PIANO SOLO (28!)
  if (b < 92) return { kick: true, hats: true, bass: true, hook: true, big: true, pianoToo: true, snares: true }; // duet drop
  if (b < 100) return { kick: true, hats: true, bass: true, hook: true, big: true, up: 12, pianoToo: true, snares: true }; // final octave-up
  return { tag: b - 100 };                                                  // fanfare outro
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  // ---- fanfare intro
  if (s.fanfare) {
    FAN[b % 2].forEach((m, i) => { if (m > 0) fanfare(b0 + Math.round(i * spb), Math.round(spb * 0.85), m, 0.2); });
    if (s.roar) roar(b0, Math.round(bar * 1.6), 0.12);
  }
  // ---- four-on-the-floor
  if (s.kick) [0, 1, 2, 3].forEach(bt => kick(b0 + Math.round(bt * spb), 0.92));
  if (s.snares) [1, 3].forEach(bt => snare(b0 + Math.round(bt * spb), 0.3));
  // ---- hats
  if (s.hats) {
    [0.5, 1.5, 2.5, 3.5].forEach(bt => hat(b0 + Math.round(bt * spb), 0.22, true));
    for (let e = 0; e < 16; e++) if (e % 4 !== 0) hat(b0 + Math.round(e * spb / 4), 0.08);
  }
  // ---- driving octave bass (8ths, techno pump)
  if (s.bass) for (let e = 0; e < 8; e++) {
    const oct = e % 2 ? 12 : 0;
    tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.7), midi(root - 12 + oct), e % 2 ? 0.2 : 0.26, 'pulse', 0.3, 0.002, 0.03);
  }
  // ---- hook lead
  if (s.hook) for (let e = 0; e < 8; e++) {
    const m = HOOK[t][e]; if (m < 0) continue;
    if (s.big) saw3(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.9), m + (s.up || 0), 0.11, 0.46);
    else tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.88), midi(m), 0.12, 'pulse', 0.4, 0.003, 0.04);
  }
  // ---- offbeat chord stabs (pre-build energy)
  if (s.stab) [1.5, 3.5].forEach(bt => chord.forEach(m => tone(b0 + Math.round(bt * spb), Math.round(spb * 0.2), midi(m + 12), 0.06, 'pulse', 0.4, 0.003, 0.04)));
  // ---- build roll
  if (s.build) {
    const density = 6 + s.roll * 3;
    for (let r = 0; r < density; r++) snare(b0 + Math.round(r * bar / density), 0.3 + s.roll * 0.05);
    riser(b0, Math.round(bar), 0.12 + s.roll * 0.05);
    if (s.roll === 3) for (let e = 0; e < 16; e++) snare(b0 + Math.round(e * spb / 4), 0.45);
  }
  // ---- drop extras
  if (s.big) {
    if (t === 0) { for (let k = 0; k < SR * 0.4; k++) add(b0 + k, nrnd() * 0.25 * Math.exp(-k / (SR * 0.09))); }
    tone(b0, Math.round(bar * 0.95), midi(root - 24), 0.09, 'tri', 0, 0.01, 0.1);
  }
  // ---- breather pads + piano teasing in
  if (s.pads) {
    for (let e = 0; e < 8; e++) { if (e % 4 === 3) continue; chord.forEach((m, i) => tone(b0 + Math.round(e * spb / 2), Math.round(spb / 2 * 0.7), midi(m) * (1 + (i - 1) * 0.005), 0.045, 'pulse', 0.5, 0.02, 0.05)); }
    if (s.pianoTease) [0, 1.5, 2.75].forEach((bt, i) => piano(b0 + Math.round(bt * spb), chord[i % 3] + 12, 0.14, spb * 0.6));
  }
  // ---- THE CRAZY PIANO SOLO
  if (s.solo != null) pianoSolo(s.solo, b0, t);
  // ---- duet: piano doubles the hook up top
  if (s.pianoToo) for (let e = 0; e < 8; e++) { const m = HOOK[t][e]; if (m > 0) piano(b0 + Math.round(e * spb / 2), m + 12 + (s.up || 0), 0.1, spb * 0.35); }
  // ---- crowd roars at section doors
  if ([4, 28, 52, 56, 84, 92, 100].includes(b)) { hat(b0, 0.3, true); roar(b0 - Math.round(spb), Math.round(bar), 0.1); riser(b0 - Math.round(spb), Math.round(spb), 0.1); }
  // ---- outro tag: fanfare + final piano chord + roar
  if (s.tag != null) {
    const tg = s.tag;
    if (tg === 0) { fanfare(b0, Math.round(spb * 0.8), 69, 0.16); fanfare(b0 + Math.round(spb * 1.5), Math.round(spb * 0.8), 72, 0.16); fanfare(b0 + Math.round(spb * 3), Math.round(spb * 0.9), 76, 0.17); kick(b0, 0.9); kick(b0 + Math.round(2 * spb), 0.9); }
    else if (tg === 1) { fanfare(b0, Math.round(spb * 1.8), 81, 0.18); roar(b0, Math.round(bar), 0.12); kick(b0, 0.9); }
    else if (tg === 2) { [57, 60, 64, 69].forEach(m => piano(b0, m, 0.2, bar * 0.9)); piano(b0, 45, 0.26, bar * 0.9); }
    else if (tg === 3) { [69, 72, 76, 81].forEach(m => piano(b0, m, 0.18, bar * 0.9)); roar(b0, Math.round(bar * 1.4), 0.1); }
    else { kick(b0, 1); [57, 64, 69, 76, 84].forEach(m => piano(b0, m, 0.2, bar * 0.95)); fanfare(b0, Math.round(bar * 0.8), 69, 0.14); }
  }
}

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.05); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'colosseum_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm gaming techno + piano');
