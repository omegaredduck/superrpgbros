// artdev/colosseum/render_colosseum_boss_final.js — THE EDITOR final:
// #2 GOLDEN GOD combo — no sword; he raises a giant GOLDEN PIMP CUP
// (jeweled chalice) instead.
'use strict';
const BOSS = require('./render_colosseum_boss.js');
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, plate, optic, renderSheet } = KIT;

// custom draw: golden god base, right arm raises the pimp cup
function editorFinal(put, S) {
  const V = Object.assign({}, BOSS.V.golden, { gesture: 'none' });
  BOSS.emperor(put, S, V);
  const cx = S * 0.5, y = (v) => S * v;
  // right arm raised high with the cup
  stroke(put, cx + S * 0.08, y(0.47), cx + S * 0.17, y(0.34), S * 0.028, () => C.gold);
  ell(put, cx + S * 0.18, y(0.325), S * 0.02, S * 0.018, (tx, ty) => mix('#e8c898', '#b89058', tx + ty)); // fist
  // THE PIMP CUP — oversized jeweled chalice
  const gx = cx + S * 0.19, gy = y(0.24);
  // bowl
  for (let yy = gy; yy < gy + S * 0.06; yy++) {
    const t = (yy - gy) / (S * 0.06);
    const w = S * (0.055 - t * 0.028);
    row(put, Math.round(yy), gx - w, gx + w, (tx) => {
      let b = mix(C.goldLt, C.gold, clamp(tx * 1.2 + t * 0.2, 0, 1));
      if (tx > 0.78) b = mix(b, C.goldDk, 0.5);
      return b;
    });
  }
  // rim sparkle + wine
  row(put, Math.round(gy), gx - S * 0.055, gx + S * 0.055, () => C.goldLt);
  row(put, Math.round(gy + 1), gx - S * 0.045, gx + S * 0.045, () => '#8a1622');
  // stem + fat base
  stroke(put, gx, gy + S * 0.06, gx, gy + S * 0.085, S * 0.014, () => C.goldDk);
  ell(put, gx, gy + S * 0.09, S * 0.03, S * 0.012, (tx, ty) => mix(C.gold, C.goldDk, tx));
  // GEMS — ring of fat jewels on the bowl
  [[-0.035, 0.035, C.crimsonLt], [0, 0.04, '#41d6f6'], [0.035, 0.035, '#5fe86b']].forEach(([dx, dy, gem]) => {
    ell(put, gx + dx * S, gy + dy * S, S * 0.011, S * 0.011, () => gem);
    put(Math.round(gx + dx * S - 1), Math.round(gy + dy * S - 1), '#ffffff');
  });
  // second gem row on the bowl + stem gem
  [[-0.045, 0.015, '#a06bd6'], [0.045, 0.015, '#ff9a3a']].forEach(([dx, dy, gem]) => {
    ell(put, gx + dx * S, gy + dy * S, S * 0.009, S * 0.009, () => gem);
    put(Math.round(gx + dx * S), Math.round(gy + dy * S - 1), '#ffffff');
  });
  ell(put, gx, gy + S * 0.073, S * 0.008, S * 0.008, () => C.crimsonLt);
  // ---- BLING: fat gold chain necklace + medallion
  for (let a = 0.25; a < Math.PI - 0.25; a += 0.16) {
    const nx = cx + Math.cos(a) * S * 0.075, ny = y(0.42) + Math.sin(a) * S * 0.045;
    ell(put, nx, ny, S * 0.011, S * 0.011, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.08 ? mix(C.goldLt, C.goldDk, tx) : null));
  }
  ell(put, cx, y(0.485), S * 0.026, S * 0.026, (tx, ty) => mix(C.goldLt, C.goldDk, clamp(tx + ty * 0.4, 0, 1))); // medallion
  ell(put, cx, y(0.485), S * 0.01, S * 0.01, () => C.crimsonLt); // ruby center
  put(Math.round(cx - 2), Math.round(y(0.478)), '#ffffff');
  // second thinner chain
  for (let a = 0.3; a < Math.PI - 0.3; a += 0.1) put(Math.round(cx + Math.cos(a) * S * 0.06), Math.round(y(0.44) + Math.sin(a) * S * 0.055), C.goldLt);
  // ---- rings on the cup fist
  [[0.165, 0.33, '#41d6f6'], [0.19, 0.335, C.crimsonLt], [0.2, 0.325, '#5fe86b']].forEach(([dx, dy, gem]) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), gem);
    put(Math.round(cx + dx * S), Math.round(S * dy - 1), C.goldLt);
  });
  // ---- gem-studded crown spikes
  [[-0.051, 0.225, C.crimsonLt], [-0.017, 0.21, '#41d6f6'], [0.017, 0.21, '#a06bd6'], [0.051, 0.225, '#5fe86b']].forEach(([dx, dy, gem]) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), gem);
  });
  // ---- gold-capped tooth grin sparkle
  put(Math.round(cx + S * 0.008), Math.round(y(0.363)), C.goldLt);
  // ---- sparkle stars EVERYWHERE
  [[0.13, 0.2], [0.26, 0.23], [0.2, 0.16], [0.24, 0.3], [-0.12, 0.4], [0.1, 0.5],
   [-0.06, 0.24], [0.05, 0.19], [-0.15, 0.6], [0.14, 0.66], [-0.02, 0.45]].forEach(([dx, dy]) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), '#ffffff');
    put(Math.round(cx + dx * S + 1), Math.round(S * dy), C.goldLt);
    put(Math.round(cx + dx * S - 1), Math.round(S * dy), C.goldLt);
    put(Math.round(cx + dx * S), Math.round(S * dy - 1), C.goldLt);
    put(Math.round(cx + dx * S), Math.round(S * dy + 1), C.goldLt);
  });
}

const LIST = [
  { n: 2, name: 'THE EDITOR', role: 'golden god + pimp cup', draw: (p, S) => editorFinal(p, S) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_boss_final.png', title: 'THE EDITOR — FINAL (golden god, jeweled cup)', S: 160, cols: 1, scale: 2 });
}
module.exports = { editorFinal };
