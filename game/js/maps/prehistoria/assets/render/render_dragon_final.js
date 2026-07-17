// artdev/prehistoria/render_dragon_final.js — PREHISTORIA boss final:
// #10 THE PRIMORDIAL (feathered dino-dragon) + the egg-hatch entrance.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, shadow, renderSheet, floor } = KIT;
const { dragon160 } = require('./render_dragons.js');

const O = { scale: '#8a6a3e', scaleLt: '#b8925e', scaleDk: '#42301a', belly: '#e0d0a0', bellyDk: '#948a5e', feathered: true, horns: 'swept', breath: 'fire', seed: 80 };

function drawFinal(put, S) { dragon160(put, S, O); }

// THE HATCH — giant egg cracked open, the Primordial bursting out
function drawHatch(put, S) {
  const u = S / 200, X = v => v * u;
  floor(put, S, 81);
  shadow(put, X(100), X(186), X(56), X(8));
  // nest mound
  for (let a = 0; a < 6.28; a += 0.03) {
    const rr = 62 + Math.sin(a * 9) * 3;
    for (let w = 0; w < 9; w++) put(Math.round(X(100 + Math.cos(a) * (rr - w))), Math.round(X(172 + Math.sin(a) * (rr - w) * 0.32 - w * 0.8)), mix(P.mudLt, P.mudDk, (w / 9) * 0.7 + (Math.sin(a * 13) + 1) / 6));
  }
  // dragon emerging (drawn in a 150 sub-space, shifted up so hips sit in the egg)
  const dS = 150, ox = Math.round((S - dS * (150 / 160)) / 2) - 4, oy = -16;
  dragon160((x, y, c) => { if (y > X(148)) return; put(x + ox, y + oy, c); }, dS, { ...O, noFloor: true, breath: 'fire' });
  // egg lower shell OVER the dragon's legs
  for (let y = 118; y <= 176; y++) {
    const t = (y - 118) / 58;
    const w = 46 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2) * 0.2 - Math.pow(t - 0.7, 2)));
    const jag = (y === 118 || y === 119) ? Math.sin(y * 3) * 3 : 0;
    row(put, Math.round(X(y)), X(100 - w - jag), X(100 + w + jag), (tx) => mix(P.white, P.bellyDk, clamp(tx * 1.15 + t * 0.25, 0, 1)));
  }
  // jagged broken rim
  for (let x = 56; x <= 144; x += 7) { const h = 4 + ((x / 7) % 3) * 4; for (let i = 0; i <= h; i++) row(put, Math.round(X(118 - i)), X(x - (3 - i * 3 / h)), X(x + (3 - i * 3 / h)), (tx) => mix(P.white, P.bellyDk, tx * 0.6)); }
  // speckles + big crack down the shell
  [[76, 140], [116, 150], [92, 164], [128, 136]].forEach(([sx2, sy2]) => { put(Math.round(X(sx2)), Math.round(X(sy2)), P.bellyDk); put(Math.round(X(sx2 + 6)), Math.round(X(sy2 + 4)), P.bellyDk); });
  let cx2 = 96, cy2 = 118;
  [[6, 12], [-4, 10], [7, 11], [-3, 9]].forEach(([dx, dy]) => { stroke(put, X(cx2), X(cy2), X(cx2 + dx), X(cy2 + dy), X(1.2), () => mix(P.bellyDk, P.night, 0.3)); cx2 += dx; cy2 += dy; });
  // flying shell shards
  [[46, 82, 8], [152, 74, 9], [64, 56, 6], [140, 108, 7]].forEach(([fx, fy, fs]) => {
    for (let i = 0; i <= fs; i++) row(put, Math.round(X(fy + i * 0.8)), X(fx - (fs - i) * 0.6), X(fx + (fs - i) * 0.6), (tx) => mix(P.white, P.bellyDk, tx));
  });
  // motion lines
  [[40, 100], [162, 96], [100, 40]].forEach(([lx, ly]) => stroke(put, X(lx), X(ly), X(lx + (lx < 100 ? -6 : lx > 100 ? 6 : 0)), X(ly - 6), X(1.2), () => mix(P.white, P.night, 0.5)));
}

const LIST = [
  { n: 1, name: 'THE PRIMORDIAL', role: 'final', draw: drawFinal },
  { n: 2, name: 'THE HATCH', role: 'entrance — bursts from the giant egg', draw: drawHatch },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'dragon_final.png', title: 'THE PRIMORDIAL — FINAL + egg-hatch entrance', S: 200, cols: 2, scale: 2 });
}
module.exports = { O };
