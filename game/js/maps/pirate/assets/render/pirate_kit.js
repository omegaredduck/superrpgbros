// artdev/pirate/pirate_kit.js — shared palette + helpers for the PIRATE
// GHOST SHIP option sheets (mobs / decor / tiles / boss).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

// ---- ghost-ship palette (P) ----------------------------------------------
const P = {
  OUT: '#0a1014',
  // spectral ecto-teal (the ghost glow)
  ghost: '#5fe8c2', ghostLt: '#c8fff0', ghostDk: '#2a9e86', ghostDkk: '#14523f',
  // ship wood (weathered, salt-bleached)
  wood: '#8a6a48', woodLt: '#b8956a', woodDk: '#57402c', woodDkk: '#33251a',
  deck: '#a08258', deckDk: '#6e5638',
  // sails + canvas
  sail: '#d8d2c0', sailDk: '#a39a82', sailDkk: '#6e6752',
  // night sea + moonlight
  sea: '#16324a', seaLt: '#2a5a7e', moon: '#9fc4e8', moonLt: '#e0f0ff',
  // brass + gold doubloons
  brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
  gold: '#ffcd45', goldLt: '#ffedb0', goldDk: '#b07d1e',
  // iron + cannon black
  iron: '#5a6072', ironDk: '#363b4d', cannon: '#2a2d38', cannonDk: '#16181e',
  // blood-red sashes + coral
  red: '#c2452e', redLt: '#f08a64', redDk: '#7e2416',
  // barnacle + seaweed
  barn: '#7a8a6a', barnDk: '#4a5a40', weed: '#3a7a5a', weedDk: '#1f4a34',
  // bone
  bone: '#e8e0c8', boneDk: '#a89e7e',
  white: '#f4f4f4', oil: '#0a0c10'
};

// ghostly translucency: draw base then overlay scanline shimmer
function ghostify(put, cx, cy, rx, ry) {
  for (let y = -ry; y <= ry; y += 3) {
    for (let x = -rx; x <= rx; x += 1) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1 && Math.abs(y % 6) < 2) put(Math.round(cx + x), Math.round(cy + y), P.ghostLt);
    }
  }
}
// wooden plank band
function planks(put, x0, y0, x1, y1, horizontal) {
  for (let y = Math.round(y0); y < y1; y++) {
    row(put, y, x0, x1, (tx) => {
      const seam = horizontal ? (y - y0) % 7 < 1 : (tx * (x1 - x0)) % 22 < 1.4;
      let b = mix(P.deck, P.deckDk, ((y * 13 + (tx * 97) | 0) % 17) / 17 * 0.5);
      if (seam) b = P.woodDkk;
      return b;
    });
  }
}
// spectral flame wisp
function wisp(put, cx, cy, s) {
  ell(put, cx, cy, s * 0.5, s, (tx, ty) => mix(P.ghost, P.ghostDk, ty));
  ell(put, cx, cy + s * 0.2, s * 0.25, s * 0.5, (tx, ty) => mix(P.ghostLt, P.ghost, ty));
  put(Math.round(cx), Math.round(cy + s * 0.3), '#ffffff');
}
// skull (small) w/ glow eyes
function skull(put, cx, cy, s, eyeC) {
  dome(put, cx, cy, s, s * 0.92, P.bone, '#ffffff', P.boneDk);
  ell(put, cx, cy + s * 0.55, s * 0.6, s * 0.35, (tx, ty) => mix(P.bone, P.boneDk, ty));
  [-1, 1].forEach(k => { ell(put, cx + k * s * 0.4, cy - s * 0.05, s * 0.26, s * 0.3, () => P.oil); put(Math.round(cx + k * s * 0.4), Math.round(cy - s * 0.1), eyeC || P.ghost); });
  for (let k = -1; k <= 1; k++) put(Math.round(cx + k * s * 0.25), Math.round(cy + s * 0.6), P.boneDk);
  ell(put, cx, cy + s * 0.2, s * 0.14, s * 0.18, () => P.boneDk); // nose
}

module.exports = { R, P, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, ghostify, planks, wisp, skull };
