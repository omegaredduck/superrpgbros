// artdev/lunar/space_kit.js — shared palette + helpers for the LUNAR STATION
// option sheets (mobs / decor / tiles / boss).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

// ---- lunar palette (L) ---------------------------------------------------
const L = {
  OUT: '#0c0e16',
  // moon regolith greys
  moon: '#b0b4c2', moonLt: '#dde0ea', moonDk: '#787e94', moonDkk: '#4a4f64',
  // station hull whites + panels
  hull: '#e2e6ee', hullMd: '#b6bcd0', hullDk: '#828aa6', hullDkk: '#4e5470',
  // space blacks
  space: '#0e1020', spaceLt: '#1c2038',
  // alien greens
  xeno: '#5fd668', xenoLt: '#b8ffb0', xenoDk: '#2a8e3c', xenoDkk: '#14522a',
  acid: '#b8f04a', acidDk: '#6ea01c',
  // alien purples (void strain)
  void: '#8a5fd6', voidLt: '#c8a8ff', voidDk: '#4c2c8e',
  // hologram cyan + console teal
  holo: '#4adcf0', holoLt: '#c8f8ff', holoDk: '#1f88a8',
  // warning orange + red
  warn: '#ff9a3a', warnLt: '#ffd08a', warnDk: '#b85a14',
  red: '#ff4b4e', redLt: '#ffb0a8', redDk: '#9e2028',
  // metal + gold foil
  steel: '#8a94a6', steelLt: '#c7cdd6', steelDk: '#454e63', steelDkk: '#2b3245',
  foil: '#e8b23a', foilLt: '#ffe8a0', foilDk: '#96641c',
  // visor + glass
  visor: '#1a2c48', visorLt: '#3a6f9e',
  white: '#f4f4f4', oil: '#0a0b12',
  flesh: '#c8a8b8', fleshDk: '#8e6a80'
};

// glass dome/visor with reflection
function visor(put, cx, cy, rx, ry, base, lt) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    let b = mix(lt || L.visorLt, base || L.visor, clamp(ty * 1.3, 0, 1));
    if (tx < 0.35 && ty < 0.4) b = mix(b, '#ffffff', 0.45);
    return b;
  });
}
// hover glow (low-grav float)
function hover(put, cx, cy, w, c) {
  ell(put, cx, cy, w, w * 0.28, () => (c || L.holoDk));
  ell(put, cx, cy - 1, w * 0.6, w * 0.16, () => (c ? mix(c, '#ffffff', 0.4) : L.holo));
}
// station panel with rivets + seam
function panel(put, x0, y0, x1, y1) {
  plate(put, x0, y0, x1, y1, L.hullMd, L.hull, L.hullDkk);
  stroke(put, x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, 1, () => L.hullDk);
  [[x0 + 3, y0 + 3], [x1 - 3, y0 + 3], [x0 + 3, y1 - 3], [x1 - 3, y1 - 3]].forEach(([x, y]) => put(Math.round(x), Math.round(y), L.hullDkk));
}
// xeno chitin segment shading
function chitin(put, cx, cy, rx, ry, base, lt, dk) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    let b = mix(lt, base, clamp(ty * 1.2, 0, 1));
    b = mix(b, dk, clamp((ty - 0.55) * 1.4, 0, 1));
    if (Math.sin(tx * 9) > 0.55) b = mix(b, dk, 0.35);
    return b;
  });
}
// tiny star sparkle
function star(put, x, y, c) { put(x, y, c || '#ffffff'); put(x + 1, y, c || '#ffffff'); put(x - 1, y, c || '#ffffff'); put(x, y + 1, c || '#ffffff'); put(x, y - 1, c || '#ffffff'); }

module.exports = { R, L, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, visor, hover, panel, chitin, star };
