// artdev/pyramid/egypt_kit.js — shared palette + tomb-drawing helpers for the
// PYRAMID PLUNDER option sheets (mobs / decor / tiles / boss forms).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

// ---- tomb palette (E) ----------------------------------------------------
const E = {
  OUT: '#141014',
  // sandstone + dunes
  sand: '#d9b17a', sandLt: '#f2d9a8', sandDk: '#a87e4e', sandDkk: '#6e4e2c',
  stone: '#c2996a', stoneLt: '#e8c896', stoneDk: '#8a683f', stoneDkk: '#57401f',
  // tomb dark
  tomb: '#3a2c28', tombDk: '#241a18', obsidian: '#1c1420',
  // royal gold + lapis + turquoise
  gold: '#ffcd45', goldLt: '#fff0b0', goldDk: '#b07d1e', goldDkk: '#6e4a0e',
  lapis: '#2a5fc2', lapisLt: '#6f9ff0', lapisDk: '#173a80',
  turq: '#3ec2b0', turqLt: '#9df0e0', turqDk: '#1f7a6e',
  // curse magic (green-teal, distinct from graveyard ecto)
  curse: '#66e8a0', curseLt: '#c8ffe0', curseDk: '#2a9e62',
  // royal purple + carnelian red
  purple: '#7a4fd0', purpleLt: '#b894f6', purpleDk: '#48277e',
  red: '#c2452e', redLt: '#f08a64', redDk: '#7e2416',
  // bandages + bone
  wrap: '#e0d4b8', wrapLt: '#f6eeda', wrapDk: '#a89876', wrapDkk: '#6e6248',
  bone: '#e8e0c8', boneDk: '#a89e7e',
  // flame
  flame: '#ff9a3a', flameLt: '#ffe08a', flameDk: '#c2571a',
  // skin (living raiders)
  skin: '#c98e5e', skinDk: '#96613a',
  white: '#f4f4f4', oil: '#12100e',
  jackal: '#2c2434', jackalLt: '#4c4058', jackalDk: '#181220'
};

// mummy-wrap banding across an ellipse-ish body
function wraps(put, cx, cy, rx, ry, tilt) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    const band = Math.floor((ty * ry * 2 + tx * rx * (tilt || 0.7)) / 3.2);
    let b = band % 2 ? E.wrap : E.wrapLt;
    b = mix(b, E.wrapDk, clamp(ty * 1.15 - 0.2, 0, 1));
    if (tx > 0.85) b = mix(b, E.wrapDkk, 0.5);
    return b;
  });
}
// gold trim band with tiny lapis studs
function trim(put, x0, x1, y, h) {
  for (let yy = 0; yy < h; yy++) row(put, y + yy, x0, x1, (tx) => mix(E.goldLt, E.goldDk, yy / h + Math.abs(tx - 0.5) * 0.3));
  for (let x = x0 + 2; x < x1 - 1; x += 4) put(Math.round(x), Math.round(y + h / 2), E.lapis);
}
// simple hieroglyph scatter in a rect (deterministic)
function glyphs(put, x0, y0, x1, y1, c) {
  let n = 0;
  for (let y = y0; y < y1 - 4; y += 6) for (let x = x0 + 1; x < x1 - 4; x += 5) {
    const k = (n++ * 7) % 4;
    if (k === 0) { stroke(put, x, y, x + 3, y, 1, () => c); stroke(put, x + 1, y + 1, x + 1, y + 4, 1, () => c); }
    else if (k === 1) { ell(put, x + 1.5, y + 2, 1.6, 2.2, () => c); }
    else if (k === 2) { stroke(put, x, y + 3, x + 3, y, 1, () => c); }
    else { stroke(put, x, y, x, y + 4, 1, () => c); put(x + 2, y + 1, c); put(x + 2, y + 3, c); }
  }
}
// eye of horus (small)
function horusEye(put, cx, cy, s, c, cDk) {
  stroke(put, cx - s, cy, cx + s, cy, Math.max(1, s * 0.5), () => cDk);
  ell(put, cx, cy, s * 0.55, s * 0.45, () => c);
  put(Math.round(cx), Math.round(cy), cDk);
  stroke(put, cx + s * 0.4, cy + s * 0.4, cx + s * 0.9, cy + s * 1.1, 1, () => cDk);
  stroke(put, cx - s * 0.3, cy + s * 0.4, cx - s * 0.5, cy + s * 1.2, 1, () => cDk);
}
// nemes headdress (striped pharaoh hood) around a face rect
function nemes(put, cx, cy, w, h, c1, c2) {
  for (let y = 0; y < h; y++) {
    const t = y / h, ww = w * (0.75 + t * 0.5);
    row(put, Math.round(cy - h * 0.4 + y), cx - ww, cx + ww, (tx) => {
      const stripe = Math.floor(tx * 9) % 2 === 0;
      let b = stripe ? c1 : c2;
      return mix(b, E.oil, clamp(t * 0.35, 0, 1));
    });
  }
}
// coiled serpent body helper: returns points along a sine coil
function serpent(put, cx, cy, len, coils, w, colFn) {
  for (let t = 0; t < 1; t += 0.02) {
    const x = cx - len / 2 + t * len;
    const y = cy + Math.sin(t * Math.PI * coils) * w * 1.6;
    ell(put, x, y, w * (0.7 + 0.3 * Math.sin(t * 9)), w * 0.8, (tx, ty) => colFn(t, ty));
  }
}
// small flame
function flame(put, cx, cy, s) {
  ell(put, cx, cy, s * 0.55, s, (tx, ty) => mix(E.flame, E.flameDk, ty));
  ell(put, cx, cy + s * 0.15, s * 0.3, s * 0.55, (tx, ty) => mix(E.flameLt, E.flame, ty));
  put(Math.round(cx), Math.round(cy + s * 0.3), '#ffffff');
}

module.exports = { R, E, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, wraps, trim, glyphs, horusEye, nemes, serpent, flame };
