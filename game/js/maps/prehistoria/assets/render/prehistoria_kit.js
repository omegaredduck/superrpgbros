// artdev/prehistoria/prehistoria_kit.js — shared palette + helpers for
// PREHISTORIA option sheets (jungle, tar, volcano haze, dino hides).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const P = {
  OUT: '#0c0e08',
  // land
  jungle: '#2e4a20', jungleLt: '#4a7232', jungleDk: '#16260e',
  mud: '#4a3a24', mudLt: '#6e5838', mudDk: '#241a0e',
  tar: '#1a161c', tarLt: '#322c36', tarGloss: '#4a4452',
  ash: '#5a5254', volcano: '#c8452a',
  // hides
  dinoG: '#5a7a34', dinoGLt: '#86ac54', dinoGDk: '#2c3e16',
  dinoO: '#c87a2e', dinoOLt: '#e8a858', dinoODk: '#6a3c10',
  dinoB: '#4a6a7a', dinoBLt: '#74a0b2', dinoBDk: '#243642',
  dinoR: '#a8442e', dinoRLt: '#d2724e', dinoRDk: '#541e10',
  belly: '#d8c898', bellyDk: '#a89468',
  fur: '#8a6a3e', furLt: '#b2905e', furDk: '#4a3618',
  // bits
  bone: '#e2d8c0', boneDk: '#8a8268', horn: '#d8ccb0', hornDk: '#6a6048',
  claw: '#e8e0cc', tooth: '#f4eee0',
  amber: '#e8a83a', amberLt: '#ffd478',
  venom: '#8ae83a', venomDk: '#3a7a10',
  fern: '#3e7a2e', fernLt: '#6aac4e',
  skin: '#c89468', skinDk: '#8a5e38',
  night: '#10140a', white: '#f4f2ea', eye: '#e8c83a'
};

// striped dino back pattern along a horizontal body
function stripes(put, x0, x1, yTop, n, c) {
  for (let k = 0; k < n; k++) {
    const sx = x0 + (x1 - x0) * (k + 0.5) / n;
    for (let i = 0; i <= 6; i++) put(Math.round(sx - i * 0.4), Math.round(yTop(sx) + i), c);
  }
}
// fern cluster
function fern(put, cx, cy, s, c, cLt) {
  for (let a = -1.2; a <= 1.2; a += 0.4) {
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const fx = cx + Math.sin(a) * t * s, fy = cy - Math.cos(a * 0.6) * t * s + t * t * s * 0.25;
      put(Math.round(fx), Math.round(fy), mix(cLt || P.fernLt, c || P.fern, t));
      if (i % 2) { put(Math.round(fx - 1), Math.round(fy), c || P.fern); put(Math.round(fx + 1), Math.round(fy), c || P.fern); }
    }
  }
}
// dino leg (thigh + shin + clawed foot), sd tilts stance
function dinoLeg(put, hx, hy, len, sd, c, cDk) {
  stroke(put, hx, hy, hx + sd * len * 0.2, hy + len * 0.55, Math.max(2, len * 0.24), () => c);
  stroke(put, hx + sd * len * 0.2, hy + len * 0.55, hx + sd * len * 0.1, hy + len, Math.max(1.6, len * 0.15), () => cDk);
  for (let k = -1; k <= 1; k++) stroke(put, hx + sd * len * 0.1, hy + len, hx + sd * len * 0.1 + k * len * 0.09 + sd * len * 0.12, hy + len + len * 0.08, Math.max(1, len * 0.07), () => P.claw);
}
// jungle floor dressing in a cell
function floor(put, S, seed) {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S, y = S * 0.86 + ((i * 683) % 1000) / 1000 * S * 0.1;
    put(Math.round(x), Math.round(y), mix(P.fern, P.night, 0.4 + (i % 3) * 0.15));
  }
  for (let i = 0; i < 4; i++) {
    const x = ((i * 379 + (seed || 0) * 97) % 1000) / 1000 * S;
    put(Math.round(x), Math.round(S * 0.1 + (i * 53) % 40), mix('#c8d46a', P.night, 0.6)); // pollen motes
  }
}

module.exports = { R, P, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, stripes, fern, dinoLeg, floor };
