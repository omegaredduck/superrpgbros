// artdev/sugar/sugar_kit.js — shared palette + helpers for SUGAR WORLD
// option sheets (sugar-coated menace: pastel frosting over something wrong).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const G = {
  OUT: '#2a1420',
  // frosting + cream
  cream: '#fff4e8', creamDk: '#e0c8b0',
  pink: '#ff9ac8', pinkLt: '#ffd0e8', pinkDk: '#c04a88',
  mint: '#7ae8c0', mintLt: '#c8fff0', mintDk: '#2a9a72',
  // candy brights
  red: '#ff4a58', redLt: '#ff9aa0', redDk: '#a01828',
  orange: '#ff9a3a', orangeLt: '#ffd08a', orangeDk: '#b05a10',
  yellow: '#ffd83a', yellowLt: '#fff0a8', yellowDk: '#b08a10',
  lime: '#a8e83a', limeLt: '#d8ffa0', limeDk: '#5a9a10',
  blue: '#4ab8ff', blueLt: '#b0e0ff', blueDk: '#1a5aa8',
  grape: '#b06ae8', grapeLt: '#e0c0ff', grapeDk: '#5a2a90',
  // chocolate + caramel + gingerbread
  choc: '#6a3a22', chocLt: '#9a6440', chocDk: '#3a1c0e',
  caramel: '#d8922a', caramelLt: '#ffc86a', caramelDk: '#8a5210',
  ginger: '#b87838', gingerLt: '#e0a860', gingerDk: '#7a4a1a',
  // licorice
  lico: '#2a2430', licoLt: '#4a4458', licoDk: '#14101c',
  white: '#ffffff', oil: '#1a0c14',
  soda: '#c8f0e8'
};

// candy stripe helper — diagonal stripes across an ellipse fill
function stripes(c1, c2, freq) {
  return (tx, ty) => ((((tx + ty) * (freq || 6)) | 0) % 2 ? c1 : c2);
}
// sprinkle scatter
function sprinkles(put, cx, cy, rx, ry, n, seedOff) {
  const cols = [G.red, G.blue, G.yellow, G.lime, G.grape, G.white];
  for (let i = 0; i < n; i++) {
    const a = (i * 2.4 + (seedOff || 0)), r = ((i * 7919) % 100) / 100;
    const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    stroke(put, x, y, x + Math.cos(a * 3) * 2.4, y + Math.sin(a * 3) * 2.4, 1.3, () => cols[i % 6]);
  }
}
// frosting drip edge along a top line
function drip(put, x0, x1, y, c, cDk) {
  for (let x = x0; x < x1; x += 3) {
    const len = 3 + Math.abs(Math.sin(x * 1.7)) * 6;
    stroke(put, x, y, x, y + len, 2.2, (tx) => mix(c, cDk, 0.3));
    put(Math.round(x), Math.round(y + len + 1), cDk);
  }
}
// candy gloss highlight
function gloss(put, cx, cy, r) {
  ell(put, cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.18, () => G.white);
  put(Math.round(cx + r * 0.3), Math.round(cy - r * 0.5), G.white);
}

module.exports = { R, G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, stripes, sprinkles, drip, gloss };
