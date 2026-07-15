// artdev/render_music.js — render a DATA.audio.music track to WAV so the user
// can preview compositions without booting the game. Mimics audio.js's
// sequencer envelope (20ms attack, ~80ms release) and chip waveforms.
//   node artdev/render_music.js grove out.wav
'use strict';
const fs = require('fs');
const path = require('path');

global.window = undefined;
const src = fs.readFileSync(path.join(__dirname, '..', 'game', 'js', 'data.js'), 'utf8');
eval(src.replace(/^var DATA =/m, 'global.DATA ='));

const name = process.argv[2] || 'grove';
const out = process.argv[3] || name + '_theme.wav';
const d = DATA.audio.music[name];
if (!d) { console.error('no such track:', name); process.exit(1); }

const SR = 22050;
const spb = 60 / d.bpm;
const totalBeats = d.tracks[0].notes.reduce((a, n) => a + n[1], 0);
const totalS = totalBeats * spb + 0.5;
const buf = new Float32Array(Math.ceil(totalS * SR));

function noteHz(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n);
  if (!m) return 0;
  const idx = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  const midi = (+m[3] + 1) * 12 + idx;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function wave(type, ph) {
  const p = ph % 1;
  if (type === 'sine') return Math.sin(p * Math.PI * 2);
  if (type === 'square') return p < 0.5 ? 1 : -1;
  if (type === 'sawtooth') return 2 * p - 1;
  return p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4;   // triangle
}

d.tracks.forEach(tr => {
  let t = 0;
  tr.notes.forEach(n => {
    const dur = n[1] * spb;
    if (n[0]) {
      const hz = noteHz(n[0]);
      const s0 = Math.floor(t * SR), s1 = Math.floor((t + dur) * SR);
      for (let s = s0; s < s1 && s < buf.length; s++) {
        const tt = s / SR - t;
        let env = 1;
        if (tt < 0.02) env = tt / 0.02;
        else if (tt > dur - 0.09) env = Math.max(0, (dur - 0.01 - tt) / 0.08);
        buf[s] += wave(tr.type, tt * hz) * tr.vol * env;
      }
    }
    t += dur;
  });
});

// gentle master limit + 16-bit WAV
let peak = 0;
for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0.9 ? 0.9 / peak : 1;
const pcm = Buffer.alloc(buf.length * 2);
for (let i = 0; i < buf.length; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] * norm)) * 32767), i * 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8);
hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(out, Buffer.concat([hdr, pcm]));
console.log('wrote', out, (pcm.length / SR / 2).toFixed(1) + 's', 'peak', peak.toFixed(2));
