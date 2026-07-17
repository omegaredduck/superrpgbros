// artdev/colosseum/render_colosseum_chariot_final.js — CHARIOT RACER
// FINAL: #1 CRIMSON CLASSIC car pulled by ONE LION (Red: pack looked
// bad, single lion; approved lion160 shape, crimson + gold rig).
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, plate, optic, renderSheet, galea } = KIT;
const { lion160 } = require('./render_colosseum_lion_draft.js');

function lionChariot(put, S) {
  const u = S / 200; // design in 200-space
  const X = v => v * u, Y = v => v * u;
  const at = (ox, oy, sc) => (x, y, c) => put(Math.round(x * 1 + X(ox)), Math.round(y + Y(oy)), c);

  // ---- ground shadow under the whole rig
  ell(put, X(100), Y(188), X(92), Y(7), () => C.oil);

  // ---- THE LION — one big approved lion160, front and center
  const L = 138 * u; // lion canvas size in px
  lion160(at(2, 42, 1), L, { noShadow: true });
  // trace line from the harness back to the yoke
  stroke(put, X(42), Y(112), X(150), Y(152), X(1.4), () => C.leatherDk);
  // yoke pole
  stroke(put, X(108), Y(140), X(152), Y(156), X(2.8), () => C.woodDk);

  // ---- WHEEL (gold, 4 spokes)
  const wx = X(168), wy = Y(172), wr = X(21);
  ell(put, wx, wy, wr, wr, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.15 ? mix(C.gold, C.goldDk, tx) : null));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * wr, wy - Math.sin(a) * wr, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, X(1.6), () => C.goldDk); }
  ell(put, wx, wy, X(3.6), X(3.6), () => C.ironDk);

  // ---- CAR — crimson, gold trim, covers wheel top
  for (let y = Y(128); y < Y(168); y++) {
    const t = (y - Y(128)) / (Y(40));
    row(put, Math.round(y), X(146) - (1 - t) * X(4), X(196), (tx) => {
      let b = mix(C.crimsonLt, C.crimson, clamp(tx * 1.2, 0, 1));
      if (tx > 0.8) b = mix(b, C.crimsonDk, 0.55);
      return b;
    });
  }
  row(put, Y(128), X(144), X(196), () => C.gold);   // rail
  row(put, Y(130), X(144), X(196), () => C.goldDk);
  // gold laurel emblem on the car side
  ell(put, X(170), Y(148), X(8), X(8), (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? mix(C.goldLt, C.goldDk, tx) : null));
  put(Math.round(X(170)), Math.round(Y(148)), C.goldLt);

  // ---- DRIVER — crimson tunic, crested galea, whip cracking over the pack
  const dx = X(176), dy = Y(108);
  stroke(put, dx + X(3), dy + X(20), dx - X(5), dy, X(9), () => C.crimson); // torso leaning fwd
  row(put, Math.round(dy + X(4)), dx - X(10), dx + X(1), () => C.crimsonLt);
  // rein arm forward
  stroke(put, dx - X(4), dy + X(4), dx - X(24), dy + X(10), X(3.2), () => C.skin);
  stroke(put, dx - X(24), dy + X(10), X(112), Y(146), X(1), () => C.leatherDk); // reins to yoke
  // whip arm up
  stroke(put, dx + X(2), dy + X(4), dx + X(14), dy - X(12), X(3.2), () => C.skin);
  let px0 = dx + X(15), py0 = dy - X(14);
  for (let t = 0; t < 1; t += 0.04) {
    const nx = px0 - t * X(52), ny = py0 - Math.sin(t * 3.2) * X(14) + t * X(4);
    put(Math.round(nx), Math.round(ny), t < 0.12 ? C.leatherDk : C.leather);
  }
  put(Math.round(px0 - X(53)), Math.round(py0 + X(3)), C.goldLt); // crack spark
  // head + galea
  const hy = dy - X(9);
  ell(put, dx - X(1), hy, X(7), X(7.6), (tx, ty) => mix(C.skin, C.skinDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, dx - X(3.4), hy - X(0.8), X(1.2), C.oil, C.oil, '#fff');
  galea(put, dx - X(1), hy - X(5.6), X(7.6), [C.crimson, C.crimsonLt]);

  // ---- dust storm behind the wheel
  [[196, 178], [190, 168], [198, 158]].forEach(([ddx, ddy]) => ell(put, X(ddx), Y(ddy), X(6), X(3.4), (tx) => mix(C.sandLt, C.sand, tx)));
}

const LIST = [
  { n: 1, name: 'LION CHARIOT', role: 'crimson car + one lion', draw: (p, S) => lionChariot(p, S) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_chariot_final.png', title: 'CHARIOT RACER — FINAL (crimson classic + lion pack)', S: 200, cols: 1, scale: 2 });
}
module.exports = { lionChariot };
