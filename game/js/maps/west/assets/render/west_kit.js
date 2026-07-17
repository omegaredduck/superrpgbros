// artdev/west/west_kit.js — shared palette + helpers for the WILD WEST TOWN
// option sheets (sun-bleached frontier town, dust, leather, gunmetal).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const W = {
  OUT: '#160e08',
  // desert ground + dust
  sand: '#c8a878', sandLt: '#e8cc9a', sandDk: '#96784e', sandDkk: '#5e4a2e',
  // weathered wood
  wood: '#8a6a48', woodLt: '#b08e62', woodDk: '#5a4430', woodDkk: '#34281c',
  // leather + hats
  leather: '#7a4e2e', leatherLt: '#a06e42', leatherDk: '#4a2e1a',
  // gunmetal + iron
  iron: '#5a5e66', ironLt: '#9aa0aa', ironDk: '#26282e',
  // clothing
  red: '#a83028', redLt: '#d05a4a', redDk: '#601812',
  navy: '#2e4058', navyLt: '#4e6a8a', navyDk: '#1a2434',
  // gold + brass
  gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a6418',
  // skin tones
  skin: '#d8a878', skinDk: '#a87850',
  bone: '#e8e0c8', boneDk: '#b0a888',
  // greens (cactus/sage)
  cactus: '#5a7e46', cactusLt: '#7ea862', cactusDk: '#34502a',
  // night sky / shade
  shade: '#3a2e28',
  oil: '#0c0806', white: '#f4f4f4',
  blood: '#8a1622', brass: '#c8963c'
};

// cowboy hat (parameterized tilt)
function hat(put, cx, cy, w, cols, tilt) {
  const [base, lt, dk] = cols;
  tilt = tilt || 0;
  // brim (wide ellipse)
  ell(put, cx, cy, w, w * 0.32, (tx, ty) => mix(lt, dk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  // crown w/ pinch
  for (let y = 0; y < w * 0.85; y++) {
    const t = y / (w * 0.85);
    const ww = w * (0.55 - t * 0.12 - (t > 0.7 ? (t - 0.7) * 0.5 : 0));
    row(put, Math.round(cy - y), cx - ww + tilt * y, cx + ww + tilt * y, (tx) => {
      let b = mix(lt, base, clamp(tx * 1.3, 0, 1));
      if (tx > 0.7) b = mix(b, dk, 0.55);
      if (t > 0.5 && Math.abs(tx - 0.5) < 0.1) b = mix(b, dk, 0.35); // crease
      return b;
    });
  }
  // band
  row(put, Math.round(cy - w * 0.14), cx - w * 0.52, cx + w * 0.52, () => dk);
}
// bandana over the lower face
function bandana(put, cx, cy, w, c, cDk) {
  for (let y = 0; y < w * 0.7; y++) {
    const t = y / (w * 0.7), ww = w * (1 - t * 0.3);
    row(put, Math.round(cy + y), cx - ww, cx + ww, (tx) => {
      let b = mix(c, cDk, clamp(tx * 0.9 + t * 0.4, 0, 1));
      if ((tx * 6 | 0) % 2 === 0 && t < 0.4) b = mix(b, '#fff', 0.15); // pattern dots
      return b;
    });
  }
  // trailing knot point
  for (let y = 0; y < w * 0.5; y++) { const t = y / (w * 0.5); put(Math.round(cx + w * (0.7 - t * 0.2)), Math.round(cy + w * 0.6 + y), cDk); }
}
// six-shooter pointing right
function gun(put, x, y, s, flip) {
  const f = flip ? -1 : 1;
  stroke(put, x, y, x + f * s * 0.9, y, s * 0.22, () => W.iron);       // barrel
  stroke(put, x, y, x + f * s * 0.9, y, s * 0.08, () => W.ironLt);
  ell(put, x + f * s * 0.15, y + s * 0.08, s * 0.16, s * 0.16, (tx, ty) => mix(W.ironLt, W.ironDk, tx + ty * 0.3)); // cylinder
  stroke(put, x - f * s * 0.05, y + s * 0.1, x - f * s * 0.18, y + s * 0.32, s * 0.14, () => W.leatherDk); // grip
  put(Math.round(x + f * s * 0.92), Math.round(y - 1), W.ironLt); // sight
}
// star badge
function badge(put, x, y, r, c) {
  for (let i = 0; i < 5; i++) {
    const a = -1.57 + i * 1.257;
    stroke(put, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, 1.4, () => c);
  }
  put(Math.round(x), Math.round(y), mix(c, '#fff', 0.5));
}

module.exports = { R, W, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, hat, bandana, gun, badge };
