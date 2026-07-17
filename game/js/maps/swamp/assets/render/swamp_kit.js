// artdev/swamp/swamp_kit.js — shared palette + helpers for the WITCH'S
// SWAMP option sheets (ritual-groove mood: murky bog, witch purple, wisp
// glow, toxic brew green).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const S = {
  OUT: '#0a0e08',
  // bog greens
  bog: '#4a5e38', bogLt: '#6e8452', bogDk: '#2c3a20', bogDkk: '#182210',
  // murk water
  murk: '#2a3e30', murkLt: '#3e5a46', murkDk: '#16241c',
  // witch purple
  witch: '#7a4aa0', witchLt: '#b088d8', witchDk: '#44245e', witchDkk: '#2a1440',
  // toxic brew
  brew: '#9ee83f', brewLt: '#d8ffa0', brewDk: '#5a9e18',
  // wisp glow
  wisp: '#7fe8d8', wispLt: '#d8fff4', wispDk: '#3a9e8c',
  // mud + wood
  mud: '#5a4632', mudLt: '#7e6448', mudDk: '#3a2c1c',
  wood: '#6e5438', woodLt: '#94744e', woodDk: '#44301c', woodDkk: '#281a0e',
  // accents
  bone: '#e0d8c0', boneDk: '#a89e80',
  blood: '#a02830', rot: '#8a9e4a',
  oil: '#060a06', white: '#f4f4f4'
};

// cattail / reed clump
function reeds(put, cx, baseY, n, h) {
  for (let i = 0; i < n; i++) {
    const x = cx + (i - n / 2) * 3.2, lean = (i % 3 - 1) * 0.12;
    for (let y = 0; y < h * (0.7 + (i % 4) * 0.1); y++) put(Math.round(x + lean * y), Math.round(baseY - y), i % 2 ? S.bogLt : S.bog);
    if (i % 2 === 0) { const ty = baseY - h * (0.7 + (i % 4) * 0.1); ell(put, x + lean * (baseY - ty), ty - 3, 2, 4.4, (tx, tty) => mix(S.mudLt, S.mudDk, tty)); }
  }
}
// hanging moss drape
function mossDrape(put, x1, y1, x2, y2, n) {
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = lerp(x1, x2, t), y0 = lerp(y1, y2, t);
    const len = 8 + ((i * 7) % 12);
    for (let d = 0; d < len; d++) put(Math.round(x + Math.sin(d * 0.4 + i) * 1.4), Math.round(y0 + d), d % 3 ? S.bog : S.rot);
  }
}
// glow rune (small witch mark)
function rune(put, x, y, c) { put(x, y, c); put(x - 2, y - 2, c); put(x + 2, y - 2, c); put(x, y - 4, c); put(x - 1, y + 2, c); put(x + 1, y + 2, c); }

module.exports = { R, S, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, reeds, mossDrape, rune };
