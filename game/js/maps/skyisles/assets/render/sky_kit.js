// artdev/skyisles/sky_kit.js — shared palette + sky-drawing helpers for the
// STORM SKY ISLES option sheets (mobs / decor / tiles / boss).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

// ---- storm-sky palette (K) ----------------------------------------------
const K = {
  OUT: '#141620',
  // clouds
  cloud: '#dfe6f4', cloudLt: '#ffffff', cloudMd: '#b4bfda', cloudDk: '#8591b8', cloudDkk: '#5a6590',
  thunder: '#6a6f9e', thunderDk: '#474b74', thunderDkk: '#2e3152',
  // sky stone + marble ruins
  stone: '#9aa3b8', stoneLt: '#c9d0e0', stoneDk: '#5f6880', stoneDkk: '#3a4158',
  marble: '#e8e4d8', marbleLt: '#fffdf2', marbleDk: '#b3ac96', marbleDkk: '#7c7663',
  // lightning
  volt: '#ffe95a', voltLt: '#fffbc8', voltDk: '#d6a520', voltCore: '#ffffff',
  // skies + wind
  sky: '#7fd4ff', skyLt: '#d9f4ff', skyDk: '#3a7fc2', skyDkk: '#1f4f86',
  wind: '#bfeee6', windDk: '#6fb8ac',
  // thunderbird blues + royal feathers
  feather: '#4a6cc2', featherLt: '#8fb0f0', featherDk: '#2c447e', featherDkk: '#1a2a52',
  indigo: '#4a4f86', indigoLt: '#7d82c2', indigoDk: '#2c2f56',
  // storm purple + magic
  purple: '#8a63d6', purpleLt: '#c8aaff', purpleDk: '#54348e',
  // wood / rope / airship bits
  wood: '#a9764a', woodLt: '#d6a26e', woodDk: '#6d4426', woodDkk: '#452a16',
  rope: '#c9a86a', ropeDk: '#8a6c3a',
  brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
  copper: '#e08b4c', copperLt: '#ffbf8a', copperDk: '#9c5222',
  iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a',
  red: '#ff4b3e', redLt: '#ffb0a0', redDk: '#9e2422',
  gold: '#ffcd45', goldLt: '#ffedb0', goldDk: '#b07d1e',
  white: '#f4f4f4', grass: '#63b04f', grassLt: '#9ade7a', grassDk: '#3a7434', grassDkk: '#245222',
  dirt: '#8a6a48', dirtDk: '#5c4530',
  oil: '#101119',
  skin: '#e8b796', skinDk: '#c68a63'
};

// puffy cloud cluster with top-light shading
function cloudBlob(put, cx, cy, r, base, hi, dk) {
  const L = [[-0.72, 0.18, 0.52], [0.72, 0.18, 0.52], [-0.34, -0.26, 0.58], [0.36, -0.24, 0.6], [0, 0.06, 0.82]];
  L.forEach(([ox, oy, s]) => dome(put, cx + ox * r, cy + oy * r, r * s, r * s * 0.78, base, hi, dk));
}
// 3-segment lightning zigzag with white core
function zig(put, x0, y0, x1, y1, w, c, cLt) {
  const dx = x1 - x0, dy = y1 - y0;
  const ax = x0 + dx * 0.38 + dy * 0.14, ay = y0 + dy * 0.38 - dx * 0.14;
  const bx = x0 + dx * 0.66 - dy * 0.14, by = y0 + dy * 0.66 + dx * 0.14;
  [[x0, y0, ax, ay], [ax, ay, bx, by], [bx, by, x1, y1]].forEach(([p, q, s, t]) => {
    stroke(put, p, q, s, t, w, () => c);
    stroke(put, p, q, s, t, Math.max(1, w * 0.4), () => cLt || K.voltCore);
  });
}
// layered feathered wing: base ellipse + trailing feather strokes
function wing(put, cx, cy, len, sweep, side, base, lt, dk) {
  const tipX = cx + side * len, tipY = cy - sweep;
  ell(put, cx + side * len * 0.42, cy - sweep * 0.5, len * 0.5, len * 0.24, (tx, ty) => mix(lt, base, clamp(ty * 1.3, 0, 1)));
  const N = 5;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const fx = lerp(cx + side * len * 0.2, tipX, t), fy = lerp(cy - sweep * 0.2, tipY, t);
    stroke(put, fx, fy, fx + side * len * 0.16, fy + len * 0.3 + t * len * 0.12, Math.max(2, len * 0.09), (tt) => mix(base, dk, 0.3 + tt * 0.7));
  }
}
// swirl of wind (curl of pale strokes)
function gust(put, cx, cy, r, c) {
  for (let a = -0.4; a < 2.6; a += 0.18) {
    const rr = r * (0.55 + a * 0.16);
    put(Math.round(cx + Math.cos(a) * rr), Math.round(cy - Math.sin(a) * rr * 0.6), c);
    put(Math.round(cx + Math.cos(a) * rr) + 1, Math.round(cy - Math.sin(a) * rr * 0.6), c);
  }
}
// small floating island base (rock cone + grass top) to ground a decor piece
function isleBase(put, cx, topY, w, h, S) {
  ell(put, cx, topY + h * 0.45, w * 0.5, h * 0.5, (tx, ty) => {
    if (ty < 0.18) return null;
    let b = mix(K.dirt, K.dirtDk, ty);
    if (tx < 0.2 || tx > 0.8) b = mix(b, K.stoneDkk, 0.4);
    return b;
  });
  ell(put, cx, topY + h * 0.08, w * 0.5, h * 0.16, (tx, ty) => mix(K.grassLt, K.grassDk, clamp(ty * 1.4, 0, 1)));
}

module.exports = { R, K, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, cloudBlob, zig, wing, gust, isleBase };
