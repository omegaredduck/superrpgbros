// artdev/carnival/render_carnival_theme.js — "THE LAST SHOW", the HAUNTED
// CARNIVAL theme: 8-BIT CREEPY CALLIOPE (Red's package). A cheery circus
// waltz that keeps going WRONG — detuned steam-pipe lead over an oom-pah-pah
// engine, tape-warp slumps where the whole band bends flat, a music-box
// break, mad giggles, and a power-cut ending. All chiptune voices.
// TRUE 3/4: 132 bars @ 132 BPM = 180.0s.
//   node render_carnival_theme.js carnival_theme.wav
'use strict';
const fs = require('fs');
const SR = 32000, BPM = 132;
const spb = SR * 60 / BPM;
const bar = spb * 3;               // 3/4 !
const BARS = 132;
const N = Math.ceil(bar * BARS);
const buf = new Float32Array(N);
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function pulse(ph, duty) { return (ph - Math.floor(ph)) < duty ? 1 : -1; }
function tri(ph) { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
let _seed = 1313; function nrnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return (_seed / 0x3fffffff) - 1; }
function add(i, v) { if (i >= 0 && i < N) buf[i] += v; }
// tone with optional per-sample pitch bend (cents curve over the note)
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
function thump(start, gain) { const d = SR * 0.11; for (let k = 0; k < d; k++) { const t = k / d; const f = 90 - 50 * t; const e = Math.pow(1 - t, 2.3); add(start + k, tri(f * k / SR) * gain * e); } }
function chick(start, gain) { for (let k = 0; k < SR * 0.035; k++) { const e = Math.exp(-k / (SR * 0.009)); add(start + k, nrnd() * gain * e); } }
// calliope pipe: breathy detuned pulse pair + air noise
function pipe(start, dur, m, gain, bendTo) {
  tone(start, dur, midi(m), gain, 'pulse', 0.46, 0.012, 0.05, bendTo);
  tone(start, dur, midi(m) * 1.006, gain * 0.55, 'pulse', 0.38, 0.012, 0.05, bendTo);
  for (let k = 0; k < Math.min(dur, SR * 0.03); k++) add(start + k, nrnd() * gain * 0.25 * Math.exp(-k / (SR * 0.01)));
}
// mad giggle: quick descending chirps
function giggle(start, gain) {
  for (let i = 0; i < 4; i++) {
    const st = start + i * SR * 0.07;
    tone(st, SR * 0.05, midi(88 - i * 2) * (1 + 0.01 * i), gain * (1 - i * 0.15), 'pulse', 0.2, 0.002, 0.02, 0.92);
  }
}

// D minor circus waltz w/ chromatic creep: Dm — Gm — A7 — Dm
const ROOTS = [38, 43, 33, 38], CH = [[62, 65, 69], [62, 67, 70], [61, 64, 69], [62, 65, 69]];
// verse melody (quarter-note waltz w/ pickup 8ths; -1 = rest)
const MEL_V = [
  [62, 65, 69, 68, 69, -1], [70, 67, 62, -1, 65, 67],   // 6 slots = 2 bars of 3
  [69, 65, 61, 62, 64, 65], [62, -1, -1, 57, 58, 61]
];
// chorus — forced-cheery F major lilt
const MEL_C = [
  [65, 69, 72, -1, 72, 74], [72, 69, 65, -1, 62, 65],
  [64, 67, 70, -1, 70, 72], [69, -1, 65, -1, 61, 64]
];

function sec(b) {
  if (b < 8) return { solo: true };                                            // lone creaky pipe
  if (b < 24) return { oom: true, mel: 'V' };                                  // verse waltz
  if (b < 40) return { oom: true, mel: 'C', cheer: true };                     // chorus
  if (b < 48) return { oom: 'slow', mel: 'V', warp: true };                    // TAPE WARP (band slumps flat)
  if (b < 64) return { oom: true, mel: 'V', giggles: true };                   // verse w/ giggles
  if (b < 72) return { box: true };                                            // music-box break
  if (b < 88) return { oom: true, mel: 'C', cheer: true, giggles: true };      // chorus 2
  if (b < 96) return { oom: 'slow', mel: 'C', warp: true, giggles: true };     // warped chorus
  if (b < 120) return { oom: true, mel: 'C', cheer: true, up: 12, big: true }; // grand finale octave-up
  if (b < 128) return { oom: 'slow', mel: 'V', warp: true, dying: true };      // power cut begins
  return { solo: true, dying: true };                                          // last wheeze
}

for (let b = 0; b < BARS; b++) {
  const s = sec(b); const t = b % 4; const b0 = Math.round(b * bar);
  const root = ROOTS[t], chord = CH[t];
  const WARP = s.warp ? 0.955 : null; // bend-flat factor per note
  // oom-pah-pah: beat 1 bass thump, beats 2+3 chord chicks
  if (s.oom) {
    const slow = s.oom === 'slow';
    thump(b0, slow ? 0.6 : 0.85);
    tone(b0, Math.round(spb * 0.7), midi(root), slow ? 0.2 : 0.3, 'tri', 0, 0.004, 0.06, WARP);
    [1, 2].forEach(beat => {
      chick(b0 + Math.round(beat * spb), slow ? 0.14 : 0.22);
      chord.forEach(m => tone(b0 + Math.round(beat * spb), Math.round(spb * 0.32), midi(m - 12), slow ? 0.05 : 0.08, 'pulse', 0.34, 0.005, 0.05, WARP));
    });
  }
  // melody — two 3/4 bars share each 6-slot line
  const line = s.mel === 'V' ? MEL_V[t] : s.mel === 'C' ? MEL_C[t] : null;
  if (line) for (let e = 0; e < 3; e++) {
    const m = line[(b % 2) * 3 + e]; if (m == null || m < 0) continue;
    pipe(b0 + Math.round(e * spb), Math.round(spb * 0.88), m + (s.up || 0), s.warp ? 0.13 : 0.16, WARP);
  }
  // solo intro/outro pipe: sparse fragments of the verse tune
  if (s.solo) {
    const frag = [62, -1, 65, -1, 69, -1][b % 6];
    if (frag > 0) pipe(b0 + Math.round(spb * 0.5), Math.round(spb * 1.3), frag, 0.14, s.dying ? 0.9 : null);
    if (b % 4 === 3) { chick(b0 + Math.round(spb * 2), 0.1); } // distant creak
  }
  // forced-cheery counter bells on chorus (offbeat high thirds)
  if (s.cheer) [0.5, 1.5, 2.5].forEach(beat => tone(b0 + Math.round(beat * spb), Math.round(spb * 0.22), midi(chord[Math.floor(beat)] + 12), 0.05, 'pulse', 0.2, 0.003, 0.04, WARP));
  // music-box break: thin high lullaby of the chorus, halting
  if (s.box) {
    const lin = MEL_C[t];
    for (let e = 0; e < 3; e++) {
      const m = lin[(b % 2) * 3 + e]; if (m < 0) continue;
      if ((b + e) % 7 === 6) continue; // the box skips — winding down
      tone(b0 + Math.round(e * spb), Math.round(spb * 0.5), midi(m + 24), 0.1, 'pulse', 0.16, 0.002, 0.12);
      tone(b0 + Math.round(e * spb), Math.round(spb * 0.3), midi(m + 36), 0.035, 'pulse', 0.13, 0.002, 0.08);
    }
    if (t === 3 && b % 2 === 1) tone(b0, Math.round(bar * 0.9), midi(38), 0.06, 'tri', 0, 0.8, 0.7);
  }
  // giggles drifting the midway
  if (s.giggles && t === 1 && b % 2 === 0) giggle(b0 + Math.round(spb * 1.5), 0.12);
  // finale pads
  if (s.big) chord.forEach(m => tone(b0, Math.round(bar * 0.95), midi(m - 12), 0.05, 'pulse', 0.5, 0.4, 0.4));
  // dying: pitch sags + engine misses beats handled by slow oom; add air hiss
  if (s.dying) for (let k = 0; k < bar * 0.5; k += 4) add(b0 + k, nrnd() * 0.02);
  // section door: steam-whistle swell
  if ([8, 24, 40, 48, 64, 72, 88, 96, 120, 128].includes(b)) {
    pipe(b0, Math.round(spb * 1.2), 74, 0.09, 1.06); // rising whistle
  }
}
// final: one last flat wheeze and a thump like a body hitting sawdust
pipe(Math.round(130.6 * bar), Math.round(bar * 0.9), 62, 0.12, 0.82);
thump(Math.round(131.6 * bar), 0.8);

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = 0.85 / (peak || 1);
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { let v = Math.tanh(buf[i] * g * 1.1); out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
const name = process.argv[2] || 'carnival_theme.wav';
fs.writeFileSync(name, out);
console.log('wrote', name, (N / SR).toFixed(1) + 's', BARS + ' bars @' + BPM + 'bpm 3/4');
