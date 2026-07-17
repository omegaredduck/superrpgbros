// artdev/abyss/abyss_kit.js — shared palette + helpers for THE ABYSS
// option sheets (deep-sea trench: crushing dark, bioluminescence, rust).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const A = {
  OUT: '#060a12',
  // trench water + rock
  deep: '#0c1626', deepLt: '#1a2c48', deepDk: '#050a14',
  rock: '#2a3648', rockLt: '#46587266', rockDk: '#141c2a',
  // pale abyssal flesh
  flesh: '#8a96a8', fleshLt: '#c2ccd8', fleshDk: '#4a5666',
  pink: '#c87a8a', pinkLt: '#e8aab8', pinkDk: '#7a3a4a',
  // bioluminescence
  bio: '#41d6f6', bioLt: '#c2fbff', bioDk: '#1f78a8',
  glow: '#7df9d8', glowLt: '#d8fff2', glowDk: '#2a9a7a',
  violet: '#8a5adc', violetLt: '#c8aaff', violetDk: '#4a2a8a',
  // danger reds
  red: '#d84a4a', redLt: '#ff9a8a', redDk: '#7a1a22',
  // rust + brass (drowned diver, wrecks)
  rust: '#8a5a3a', rustLt: '#b8845a', rustDk: '#4a2e1c',
  brass: '#c8963c', brassLt: '#f0cc80', brassDk: '#6e4a1c',
  // shells + bone
  shell: '#b0a890', shellDk: '#6e6852',
  ink: '#141020', bone: '#d8d4c0',
  white: '#e8f4f8', oil: '#040608'
};
// fix accidental 8-char: rockLt proper
A.rockLt = '#465872';

// bioluminescent glow dot w/ halo
function glowDot(put, cx, cy, r, c, cLt) {
  ell(put, cx, cy, r * 2.2, r * 2.2, (tx, ty) => {
    const d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
    return d > 1 ? null : null; // halo handled below
  });
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * r * 1.8), Math.round(cy + Math.sin(a) * r * 1.8), mix(c, A.deep, 0.55));
  ell(put, cx, cy, r, r, () => c);
  put(Math.round(cx), Math.round(cy), cLt || A.bioLt);
}
// tentacle along a wavy path
function tentacle(put, x0, y0, x1, y1, w, c, cDk, waves) {
  const dx = x1 - x0, dy = y1 - y0;
  const nx = -dy, ny = dx; const L = Math.hypot(dx, dy) || 1;
  for (let t = 0; t < 1; t += 0.03) {
    const s = Math.sin(t * (waves || 6)) * 0.08 * (1 - t);
    const px = x0 + dx * t + nx / L * s * L, py = y0 + dy * t + ny / L * s * L;
    ell(put, px, py, w * (1 - t * 0.75), w * (1 - t * 0.75), (tx, ty) => mix(c, cDk, clamp(tx + ty * 0.4, 0, 1)));
  }
}
// fish fin (triangle)
function fin(put, x0, y0, x1, y1, x2, y2, c, cDk) {
  const minY = Math.min(y0, y1, y2), maxY = Math.max(y0, y1, y2);
  for (let y = minY; y <= maxY; y++) {
    // crude scanline between the two edges from apex
    const t = (y - minY) / Math.max(1, maxY - minY);
    const xa = x0 + (x1 - x0) * t, xb = x0 + (x2 - x0) * t;
    row(put, Math.round(y), Math.min(xa, xb), Math.max(xa, xb), (tx) => mix(c, cDk, clamp(tx * 0.8 + t * 0.3, 0, 1)));
  }
}
// rising bubbles
function bubbles(put, cx, cy, n, spread) {
  for (let i = 0; i < n; i++) {
    const bx = cx + Math.sin(i * 2.7) * (spread || 6), by = cy - i * 5 - (i % 2) * 2;
    put(Math.round(bx), Math.round(by), A.bioLt);
    if (i % 2 === 0) { put(Math.round(bx + 1), Math.round(by), A.deepLt); }
  }
}

module.exports = { R, A, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, glowDot, tentacle, fin, bubbles };
