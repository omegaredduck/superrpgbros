// artdev/neon/neon_kit.js — shared palette + helpers for NEON CITY
// option sheets (rain-slick cyberpunk rooftops, neon on black).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const N = {
  OUT: '#0a0812',
  // night city darks
  night: '#141224', nightLt: '#262242', nightDk: '#0a0814',
  concrete: '#3a3a4e', concreteLt: '#5a5a72', concreteDk: '#22222e',
  // neon glows
  pink: '#ff2e88', pinkLt: '#ff9ac8', pinkDk: '#8a1048',
  cyan: '#22d6ee', cyanLt: '#aefaff', cyanDk: '#0e7a8a',
  green: '#39ff6a', greenLt: '#b0ffc8', greenDk: '#128a34',
  purple: '#9a4aff', purpleLt: '#d0aaff', purpleDk: '#4a1a8a',
  amber: '#ffb02e', amberLt: '#ffe0a0', amberDk: '#8a5a10',
  redN: '#ff3a4a', redNLt: '#ff9aa0', redNDk: '#8a1020',
  // chrome + tech
  chrome: '#c8d0dc', chromeLt: '#f0f6fc', chromeDk: '#6a7284',
  gun: '#3a4050', gunDk: '#1e222e',
  // street
  leather: '#2e2a36', leatherLt: '#4a4458', leatherDk: '#1a1622',
  denim: '#2e3a5a', rust: '#7a4a2e',
  skin: '#d8a878', skinDk: '#a87850', skin2: '#8a5a38',
  hairP: '#ff2e88', hairC: '#22d6ee', hairG: '#39ff6a',
  white: '#f0f6fc', oil: '#06040a'
};

// neon glow line (bright core + haze)
function glow(put, x0, y0, x1, y1, w, c, cLt) {
  stroke(put, x0, y0, x1, y1, w * 2.2, () => mix(c, N.night, 0.62));
  stroke(put, x0, y0, x1, y1, w, () => c);
  stroke(put, x0, y0, x1, y1, Math.max(0.8, w * 0.4), () => (cLt || N.white));
}
// visor bar (glowing eye strip)
function visor(put, cx, cy, w, c, cLt) {
  row(put, Math.round(cy), cx - w, cx + w, () => c);
  row(put, Math.round(cy - 1), cx - w * 0.8, cx + w * 0.8, () => (cLt || N.white));
  put(Math.round(cx - w - 1), Math.round(cy), mix(c, N.night, 0.5));
  put(Math.round(cx + w + 1), Math.round(cy), mix(c, N.night, 0.5));
}
// rain streaks in a cell
function rain(put, S, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 379 + (seed || 0) * 97) % 1000) / 1000 * S, y = ((i * 613) % 1000) / 1000 * S * 0.8;
    stroke(put, x, y, x - S * 0.012, y + S * 0.05, 0.8, () => mix(N.cyanLt, N.night, 0.7));
  }
}
// glitch offset chunks (horizontal displacement bands)
function glitchBar(put, cx, y, w, c1, c2) {
  row(put, Math.round(y), cx - w, cx + w * 0.4, () => c1);
  row(put, Math.round(y + 1), cx - w * 0.4, cx + w, () => c2);
}

module.exports = { R, N, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, glow, visor, rain, glitchBar };
