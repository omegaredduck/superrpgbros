// artdev/colosseum/colosseum_kit.js — shared palette + helpers for the
// COLOSSEUM option sheets (imperial arena: marble, sand, bronze, crimson).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const C = {
  OUT: '#140f0c',
  // arena sand + dust
  sand: '#d8b878', sandLt: '#f0d8a0', sandDk: '#a8845a', sandDkk: '#6e5436',
  // marble
  marble: '#d8d4c8', marbleLt: '#f4f0e6', marbleDk: '#a09a8a', marbleDkk: '#6a6458',
  // bronze + gold
  bronze: '#b08036', bronzeLt: '#e0b060', bronzeDk: '#6e4a1c',
  gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a6418',
  // imperial crimson + purple
  crimson: '#a02028', crimsonLt: '#d04848', crimsonDk: '#5e1014',
  purple: '#5a2a6a', purpleLt: '#8a4a9a', purpleDk: '#341440',
  // iron + steel
  iron: '#6a6e78', ironLt: '#a8aeb8', ironDk: '#2e3038',
  // leather + wood
  leather: '#7a4e2e', leatherLt: '#a06e42', leatherDk: '#4a2e1a',
  wood: '#8a6a48', woodLt: '#b08e62', woodDk: '#5a4430',
  // skin + beast
  skin: '#d8a878', skinDk: '#a87850',
  fur: '#b08648', furDk: '#7a5a2c',
  bone: '#e8e0c8', boneDk: '#b0a888',
  oil: '#0c0806', white: '#f4f4f4', blood: '#8a1622',
  ghost: '#8ab0b8', ghostLt: '#c8e8e8'
};

// crested helmet (galea) — cx,cy = head center; crest color
function galea(put, cx, cy, w, crestC, metalC) {
  const m = metalC || [C.bronze, C.bronzeLt, C.bronzeDk];
  // dome
  ell(put, cx, cy - w * 0.1, w, w * 0.85, (tx, ty) => (ty < 0.62 ? mix(m[1], m[0], clamp(tx * 1.2 + ty * 0.3, 0, 1)) : null));
  // cheek guards
  [-1, 1].forEach(s => stroke(put, cx + s * w * 0.8, cy, cx + s * w * 0.62, cy + w * 0.75, w * 0.32, () => mix(m[0], m[2], 0.35)));
  // crest (mohawk arc)
  for (let a = -1.25; a <= 1.25; a += 0.06) {
    const x = cx + Math.sin(a) * w * 0.95, y = cy - w * 0.35 - Math.cos(a) * w * 0.72;
    stroke(put, x, y, x, y - w * 0.5, w * 0.16, () => (Math.abs(a * 10 | 0) % 2 ? crestC[0] : crestC[1]));
  }
}
// round/rect shield facing viewer
function scutum(put, cx, cy, w, h, base, hi, dk, emblemC) {
  plate(put, cx - w, cy - h, cx + w, cy + h, base, hi, dk);
  ell(put, cx, cy, w * 0.28, w * 0.28, (tx, ty) => mix(emblemC || C.gold, C.goldDk, tx + ty * 0.4)); // boss
  stroke(put, cx - w, cy - h, cx + w, cy - h, 1.4, () => dk);
}
// spear/trident pointing angle
function spear(put, x0, y0, x1, y1, c, headC) {
  stroke(put, x0, y0, x1, y1, 2, () => c || C.wood);
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  stroke(put, x1, y1, x1 + dx / L * 7, y1 + dy / L * 7, 2.6, () => headC || C.ironLt);
}
// laurel wreath ring
function laurel(put, cx, cy, r, c) {
  for (let a = 0.3; a < Math.PI - 0.3; a += 0.22) {
    [-1, 1].forEach(s => ell(put, cx + Math.cos(a) * r * s, cy - Math.sin(a) * r * 0.8, 2.2, 1.4, () => c));
  }
}

module.exports = { R, C, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, galea, scutum, spear, laurel };
