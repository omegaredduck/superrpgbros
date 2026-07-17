// artdev/castle/gothic_kit.js — shared palette + helpers for the VAMPIRE
// CASTLE option sheets (mobs / decor / tiles / boss).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

// ---- gothic castle palette (G) -------------------------------------------
const G = {
  OUT: '#100c14',
  // castle stone (cooler + purpler than graveyard grey)
  stone: '#8a84a0', stoneLt: '#b8b2cc', stoneDk: '#5a5470', stoneDkk: '#363044',
  // blood + wine
  blood: '#c22e3e', bloodLt: '#f06a6a', bloodDk: '#7e1626', wine: '#58101e',
  // moonlight + night
  moon: '#9fb8e8', moonLt: '#dce8ff', moonDk: '#5a72b0', night: '#1a1830', nightLt: '#2c2a4c',
  // velvet + royal purple
  velvet: '#5c3a78', velvetLt: '#8f68b0', velvetDk: '#38204c',
  // gold + brass (candlelight)
  gold: '#e8b23a', goldLt: '#ffe8a0', goldDk: '#96641c', goldDkk: '#5c3a0e',
  candle: '#ffb84a', candleLt: '#fff0b0', candleDk: '#c2691a',
  // wood + leather
  wood: '#6e4a30', woodLt: '#9e7248', woodDk: '#452c18', woodDkk: '#2a1a0c',
  // pale dead flesh + bone
  pale: '#cfd2e0', paleDk: '#9a9eb8', bone: '#e8e0c8', boneDk: '#a89e7e',
  // vampire skin (grey-white)
  vskin: '#d8d8e4', vskinDk: '#a8a8c0',
  // iron + silver
  iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a', silver: '#c8d0dc', silverDk: '#8a94a6',
  // glass colors (stained)
  gRed: '#d04848', gBlue: '#4868d0', gGreen: '#48b068', gAmber: '#d0a848',
  white: '#f4f4f4', oil: '#0c0a10',
  fur: '#4a4256', furLt: '#6e6684', furDk: '#2c2638'
};

// candle flame
function candleFlame(put, cx, cy, s) {
  ell(put, cx, cy, s * 0.5, s, (tx, ty) => mix(G.candle, G.candleDk, ty));
  ell(put, cx, cy + s * 0.2, s * 0.26, s * 0.5, (tx, ty) => mix(G.candleLt, G.candle, ty));
  put(Math.round(cx), Math.round(cy + s * 0.3), '#ffffff');
}
// dracula-collar cape behind a body: high collar + draped sides
function cape(put, cx, cy, w, h, base, dk) {
  // collar wings
  [-1, 1].forEach(s => {
    stroke(put, cx + s * w * 0.4, cy, cx + s * w * 0.75, cy - h * 0.35, w * 0.3, (t) => mix(base, dk, t * 0.5));
  });
  // draped body
  for (let y = 0; y < h; y++) {
    const t = y / h, ww = w * (0.55 + t * 0.55);
    row(put, Math.round(cy + y), cx - ww, cx + ww, (tx) => {
      let b = mix(base, dk, clamp(t * 1.1, 0, 1));
      if (Math.sin(tx * 12) > 0.6) b = mix(b, dk, 0.35);
      return b;
    });
  }
}
// little bat silhouette
function batIcon(put, cx, cy, s, c) {
  ell(put, cx, cy, s * 0.3, s * 0.36, () => c);
  [-1, 1].forEach(k => {
    stroke(put, cx + k * s * 0.2, cy, cx + k * s * 1.1, cy - s * 0.5, s * 0.34, () => c);
    stroke(put, cx + k * s * 0.9, cy - s * 0.3, cx + k * s * 1.2, cy + s * 0.25, s * 0.22, () => c);
  });
  [-1, 1].forEach(k => stroke(put, cx + k * s * 0.14, cy - s * 0.3, cx + k * s * 0.22, cy - s * 0.55, 1, () => c));
}
// gothic lancet window shape filled by fn(tx,ty)
function lancet(put, cx, yTop, w, h, fn) {
  for (let y = 0; y < h; y++) {
    const t = y / h;
    let ww;
    if (t < 0.3) { const a = t / 0.3; ww = w * Math.sqrt(Math.max(0, a * (2 - a))); }
    else ww = w;
    row(put, Math.round(yTop + y), cx - ww, cx + ww, (tx) => fn(tx, t));
  }
}

module.exports = { R, G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, candleFlame, cape, batIcon, lancet };
