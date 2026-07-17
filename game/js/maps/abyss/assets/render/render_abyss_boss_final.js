// artdev/abyss/render_abyss_boss_final.js — THE LEVIATHAN final:
// #6 VOLT WYRM on the approved take-3 skeleton — charged yellow-green,
// electric arcs crackling off the spine fin.
'use strict';
const SHAPE = require('./render_abyss_leviathan_shape.js');
const BOSS2 = require('./render_abyss_boss2.js');
const KIT = require('./abyss_kit.js');
const { A, mix, stroke, renderSheet } = KIT;

function voltFinal(put, S) {
  SHAPE.lev160(put, S, BOSS2.V.volt);
  const u = S / 160, X = v => v * u;
  // electric arcs crackling off the coil (zigzag bolts)
  const bolt = (x0, y0, len, ang) => {
    let px = x0, py = y0;
    for (let s2 = 0; s2 < 4; s2++) {
      const nx = px + Math.cos(ang) * len / 4 + (s2 % 2 ? 3 : -3) * Math.sin(ang);
      const ny = py + Math.sin(ang) * len / 4 + (s2 % 2 ? -3 : 3) * Math.cos(ang);
      stroke(put, X(px), X(py), X(nx), X(ny), X(1.1), () => (s2 % 2 ? '#f8ffb0' : '#d8e84a'));
      px = nx; py = ny;
    }
    put(Math.round(X(px)), Math.round(X(py)), '#ffffff');
  };
  bolt(96, 18, 14, -0.9);
  bolt(140, 60, 12, 0.2);
  bolt(120, 116, 13, 1.2);
  bolt(52, 118, 12, 2.2);
  bolt(30, 26, 11, -2.4);
  // charge shimmer dots along the water
  [[70, 12], [148, 90], [16, 90], [86, 140]].forEach(([mx, my]) => put(Math.round(X(mx)), Math.round(X(my)), '#d8e84a'));
}

const LIST = [
  { n: 6, name: 'THE LEVIATHAN', role: 'VOLT WYRM — final', draw: (p, S) => voltFinal(p, S) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_boss_final.png', title: 'THE LEVIATHAN — FINAL (volt wyrm, crackling)', S: 160, cols: 1, scale: 2 });
}
module.exports = { voltFinal };
