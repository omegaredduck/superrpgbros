// artdev/belly/belly_kit.js — shared palette + helpers for BELLY OF THE
// BEAST option sheets (inside a titan whale: rib-vaults, wet flesh, acid
// pools, the swallowed pirate ship + everything else it ever ate).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const B = {
  OUT: '#160a0c',
  // gut interior
  flesh: '#8a3a48', fleshLt: '#c26a76', fleshDk: '#4a1620',
  meat: '#a84a52', meatLt: '#d8848a', meatDk: '#5a2028',
  gloss: '#e8a8b0',                       // wet highlight
  vein: '#5a7ab0', veinDk: '#2a3a60',
  // stomach acid
  acid: '#9ae83a', acidLt: '#d8ffa0', acidDk: '#4a7a10',
  bile: '#c8d84a', bileDk: '#6a721a',
  // rib bone + baleen
  bone: '#e8dcc4', boneDk: '#948a6a', boneDkk: '#4a4432',
  // the wreck (swallowed ship)
  wood: '#8a5a34', woodLt: '#b8845a', woodDk: '#46281a',
  rope: '#c8a86a', ropeDk: '#7a6034',
  brass: '#c8963c', brassLt: '#f0cc80', brassDk: '#6e4a1c',
  sail: '#d8ccb0', sailDk: '#8a8268',
  // drowned + sea things
  skin: '#c89478', skinDk: '#8a5e44', skinPale: '#a8b0a0', skinPaleDk: '#6a7462',
  scale: '#3a8a8a', scaleLt: '#6ac8c0', scaleDk: '#164a4e',
  shell: '#c84a3a', shellLt: '#e07a5a', shellDk: '#6e2014',
  // glows
  glow: '#7df9d8', glowLt: '#d8fff2', glowDk: '#2a9a7a',
  gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a5e10',
  red: '#d84a4a', redLt: '#ff9a8a', redDk: '#7a1a22',
  violet: '#8a5adc', violetLt: '#c8aaff', violetDk: '#4a2a8a',
  // misc
  ink: '#141020', oil: '#0a0608', white: '#f4eee4', tooth: '#f4eee0',
  water: '#2a6a8a', waterLt: '#5aaccc', waterDk: '#123a50'
};

// wet glow dot w/ halo (acid drips, lure lights)
function glowDot(put, cx, cy, r, c, cLt) {
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * r * 1.8), Math.round(cy + Math.sin(a) * r * 1.8), mix(c, B.fleshDk, 0.55));
  ell(put, cx, cy, r, r, () => c);
  put(Math.round(cx), Math.round(cy), cLt || B.glowLt);
}
// tentacle/whip along a wavy tapering path
function tentacle(put, x0, y0, x1, y1, w, c, cDk, waves) {
  const dx = x1 - x0, dy = y1 - y0;
  const nx = -dy, ny = dx; const L = Math.hypot(dx, dy) || 1;
  for (let t = 0; t < 1; t += 0.03) {
    const s = Math.sin(t * (waves || 6)) * 0.08 * (1 - t);
    const px = x0 + dx * t + nx / L * s * L, py = y0 + dy * t + ny / L * s * L;
    ell(put, px, py, w * (1 - t * 0.75), w * (1 - t * 0.75), (tx, ty) => mix(c, cDk, clamp(tx + ty * 0.4, 0, 1)));
  }
}
// fin/triangle
function fin(put, x0, y0, x1, y1, x2, y2, c, cDk) {
  const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
  for (let y = minY; y <= maxY; y++) {
    const t = (y - minY) / Math.max(1, maxY - minY);
    const xa = x0 + (x1 - x0) * t, xb = x0 + (x2 - x0) * t;
    row(put, Math.round(y), Math.min(xa, xb), Math.max(xa, xb), (tx) => mix(c, cDk, clamp(tx * 0.8 + t * 0.3, 0, 1)));
  }
}
// acid drips falling from a point
function drips(put, cx, cy, n) {
  for (let i = 0; i < n; i++) {
    const dx = cx + Math.sin(i * 2.7) * 5, dy = cy + i * 6 + (i % 2) * 3;
    put(Math.round(dx), Math.round(dy), B.acid);
    if (i % 2 === 0) put(Math.round(dx), Math.round(dy + 2), B.acidLt);
  }
}
// digestive stink/gas wisps rising
function wisps(put, cx, cy, n) {
  for (let i = 0; i < n; i++) {
    const wx = cx + Math.sin(i * 2.1) * 6, wy = cy - i * 5;
    put(Math.round(wx), Math.round(wy), mix(B.bile, B.fleshDk, 0.5));
  }
}

module.exports = { R, B, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, glowDot, tentacle, fin, drips, wisps };
