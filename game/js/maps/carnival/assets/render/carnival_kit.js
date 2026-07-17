// artdev/carnival/carnival_kit.js — shared palette + helpers for the HAUNTED
// CARNIVAL option sheets (creepy-carnival mood: faded big-top colors, sickly
// lamplight, midnight dark).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const C = {
  OUT: '#120a10',
  // big-top canvas (faded red + cream stripes)
  red: '#b03440', redLt: '#d86470', redDk: '#6e1c26', redDkk: '#40101a',
  cream: '#e8dcc0', creamDk: '#b0a482', creamDkk: '#6e654c',
  // sickly carnival glow
  glow: '#ffd23f', glowLt: '#fff0a8', glowDk: '#b08a1e',
  // creep accents
  teal: '#3fc8b4', tealLt: '#a8f0e4', tealDk: '#1e6e62',
  violet: '#8a4ab0', violetLt: '#c898e8', violetDk: '#4a2262',
  // grounds
  dirt: '#5a4a3c', dirtLt: '#7e6a56', dirtDk: '#3a2c20',
  wood: '#7e5a38', woodLt: '#a8804e', woodDk: '#4e3520', woodDkk: '#2e1e10',
  iron: '#555a66', ironLt: '#9aa2b0', ironDk: '#22242c',
  // skin/paint
  paint: '#f0ecec', paintDk: '#c0b8b8', pink: '#e86a9a',
  night: '#181022', white: '#f4f4f4', oil: '#0a060c',
  blood: '#8a1622'
};

// tent-stripe fill helper: vertical big-top stripes
function stripes(put, x0, y0, x1, y1, w, a, b) {
  for (let y = y0; y < y1; y++) row(put, Math.round(y), x0, x1, (tx) => {
    const band = Math.floor(tx * ((x1 - x0) / w));
    return band % 2 === 0 ? a : b;
  });
}
// bunting: sagging string of little triangle flags
function bunting(put, x1, y1, x2, y2, n, cols) {
  for (let i = 0; i <= n * 8; i++) {
    const t = i / (n * 8);
    const sag = Math.sin(t * Math.PI) * Math.abs(x2 - x1) * 0.08;
    put(Math.round(lerp(x1, x2, t)), Math.round(lerp(y1, y2, t) + sag), C.ironDk);
  }
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const fx = lerp(x1, x2, t), fy = lerp(y1, y2, t) + Math.sin(t * Math.PI) * Math.abs(x2 - x1) * 0.08;
    const c = cols[i % cols.length];
    for (let d = 0; d < 5; d++) row(put, Math.round(fy + d), fx - (5 - d) * 0.5, fx + (5 - d) * 0.5, () => c);
  }
}
// creepy grin: curved mouth with teeth
function grin(put, cx, cy, w, up, c, teeth) {
  for (let t = -1; t <= 1; t += 0.04) {
    const x = cx + t * w, y = cy + (up ? -1 : 1) * (1 - t * t) * w * 0.45;
    put(Math.round(x), Math.round(y), c);
    put(Math.round(x), Math.round(y + 1), c);
    if (teeth && Math.abs((t * 5) % 1) < 0.18) put(Math.round(x), Math.round(y - 1), C.white);
  }
}

module.exports = { R, C, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, stripes, bunting, grin };
