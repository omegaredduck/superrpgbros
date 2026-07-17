// artdev/colosseum/render_colosseum_tiles.js — 10 numbered COLOSSEUM
// ground tile candidates (full-cell textures).
'use strict';
const KIT = require('./colosseum_kit.js');
const { C, mix, clamp, ell, row, stroke, renderSheet } = KIT;

function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }

// 1 · ARENA SAND — raked, the base
function drawSand(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(C.sandLt, C.sand, n2(x * 0.06, y * 0.06) * 0.8);
    const rake = Math.sin((y + Math.sin(x * 0.03) * 5) * 0.5);
    if (rake > 0.82) b = mix(b, C.sandDk, 0.28);
    if (n2(x, y) > 0.982) b = mix(b, C.sandDkk, 0.4);
    if (n2(x + 7, y) > 0.988) b = mix(b, '#fff0c8', 0.5);
    return b;
  });
}
// 2 · BLOODIED SAND — the games leave marks
function drawBlood(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(C.sandLt, C.sand, n2(x * 0.06, y * 0.06) * 0.8);
    // splatter blobs
    const cells = [[0.25, 0.3, 0.13], [0.7, 0.6, 0.18], [0.5, 0.85, 0.09], [0.85, 0.15, 0.07]];
    cells.forEach(([cx, cy, r]) => {
      const d = Math.hypot(x - cx * S, y - cy * S) / S;
      if (d < r * (0.7 + n2(x * 0.4, y * 0.4) * 0.5)) b = mix(b, C.blood, clamp(0.75 - d / r, 0.1, 0.7));
    });
    if (n2(x + 3, y + 9) > 0.99) b = mix(b, C.blood, 0.5); // stray drops
    // drag mark
    if (Math.abs(y - (S * 0.55 + Math.sin(x * 0.05) * 4)) < 2 && x > S * 0.3) b = mix(b, '#7a3020', 0.35);
    return b;
  });
}
// 3 · MARBLE FLOOR — polished slabs
function drawMarble(put, S) {
  fill(put, S, (x, y) => {
    const gx = Math.floor(x / (S * 0.25)), gy = Math.floor(y / (S * 0.25));
    let b = mix(C.marbleLt, C.marble, n2(gx, gy) * 0.5 + n2(x * 0.04, y * 0.04) * 0.3);
    // veins
    const v = Math.sin(x * 0.09 + Math.sin(y * 0.07) * 3 + n2(gx, gy) * 9);
    if (v > 0.93) b = mix(b, C.marbleDk, 0.4);
    if (x % Math.round(S * 0.25) === 0 || y % Math.round(S * 0.25) === 0) b = mix(b, C.marbleDkk, 0.55);
    return b;
  });
}
// 4 · MOSAIC — tesserae pattern
function drawMosaic(put, S) {
  const cols = ['#b8493a', '#3e6a8a', C.gold, C.marbleLt, '#4a7a52'];
  fill(put, S, (x, y) => {
    const t = S * 0.055;
    const gx = Math.floor(x / t), gy = Math.floor(y / t);
    // concentric diamond pattern
    const d = Math.abs(gx - 9) + Math.abs(gy - 9);
    let b = cols[d % 5];
    b = mix(b, '#241c14', n2(gx, gy) * 0.25);
    if (x % Math.round(t) === 0 || y % Math.round(t) === 0) b = mix(b, '#241c14', 0.6); // grout
    return b;
  });
}
// 5 · TRAVERTINE PAVING — big warm blocks
function drawPaving(put, S) {
  fill(put, S, (x, y) => {
    const ry = Math.floor(y / (S * 0.2));
    const off = (ry % 2) * S * 0.17;
    const rx = Math.floor((x + off) / (S * 0.34));
    let b = mix('#d8c8a8', '#a89070', n2(rx, ry) * 0.6 + n2(x * 0.08, y * 0.08) * 0.3);
    if (y % Math.round(S * 0.2) === 0 || (x + Math.round(off)) % Math.round(S * 0.34) === 0) b = mix(b, '#5e4e36', 0.6);
    if (n2(x + 5, y + 2) > 0.975) b = mix(b, '#5e4e36', 0.3); // pocks
    return b;
  });
}
// 6 · CHARIOT TRACK — packed rutted racing lane
function drawTrack(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#c8a878', '#96784e', n2(x * 0.5, y * 0.5) * 0.4 + n2(x * 0.06, y * 0.06) * 0.35);
    // parallel wheel ruts sweeping horizontally
    [0.3, 0.42, 0.62, 0.74].forEach(ry => {
      if (Math.abs(y - S * (ry + Math.sin(x * 0.02) * 0.015)) < 2.2) b = mix(b, C.sandDkk, 0.45);
    });
    // hoof scuffs
    if (n2(Math.floor(x / 6), Math.floor(y / 5)) > 0.9) b = mix(b, C.sandDkk, 0.3);
    return b;
  });
}
// 7 · HYPOGEUM GRATE — iron grid over the dark
function drawGrate(put, S) {
  fill(put, S, (x, y) => {
    const gp = S * 0.125;
    const inBarX = (x % Math.round(gp)) < 3, inBarY = (y % Math.round(gp)) < 3;
    if (inBarX || inBarY) {
      let b = mix(C.ironLt, C.ironDk, n2(x * 0.3, y * 0.3) * 0.5 + ((inBarX && inBarY) ? 0 : 0.3));
      return b;
    }
    // darkness below w/ faint shapes
    let b = mix('#181008', C.oil, clamp(n2(x * 0.05, y * 0.05) * 0.8 + 0.2, 0, 1));
    if (n2(Math.floor(x / 9), Math.floor(y / 9)) > 0.93) b = mix(b, C.gold, 0.25); // eyes below
    return b;
  });
}
// 8 · IMPERIAL CARPET — crimson runner, gold border
function drawCarpet(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(C.crimsonLt, C.crimson, n2(x * 0.15, y * 0.15) * 0.5 + 0.2);
    b = mix(b, C.crimsonDk, n2(x * 0.04, y * 0.04) * 0.3);
    const bx = Math.min(x, S - x), by = Math.min(y, S - y), bd = Math.min(bx, by);
    if (bd > S * 0.06 && bd < S * 0.1) b = mix(b, C.gold, 0.75);          // gold border
    if (bd > S * 0.13 && bd < S * 0.15) b = mix(b, C.goldDk, 0.5);        // inner line
    // diamond medallion
    const d = Math.abs(x - S / 2) + Math.abs(y - S / 2);
    if (Math.abs(d - S * 0.18) < 1.8) b = mix(b, C.gold, 0.6);
    if (d < S * 0.04) b = mix(b, C.goldLt, 0.5);
    return b;
  });
}
// 9 · CRACKED FLAGSTONE — old stone, weeds in the joints
function drawFlag(put, S) {
  fill(put, S, (x, y) => {
    // voronoi-ish stones
    const cs = S * 0.26;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9, id = 0;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 7 + (cyi + j); } else if (d < d2) d2 = d;
    }
    let b = mix('#a8a096', '#6e685c', n2(id, id * 3) * 0.6 + n2(x * 0.1, y * 0.1) * 0.25);
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 2.4) {
      b = mix(b, '#3a352c', 0.7);
      if (n2(x * 0.6, y * 0.6) > 0.55) b = mix(b, '#5a7a44', 0.5); // weeds in joints
    }
    return b;
  });
}
// 10 · GOLD-INLAY MARBLE — the Editor's floor
function drawGilt(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#e8e2d4', '#c0b8a4', n2(x * 0.05, y * 0.05) * 0.5);
    const v = Math.sin(x * 0.07 + Math.sin(y * 0.09) * 2.5);
    if (v > 0.9) b = mix(b, C.marbleDk, 0.35);
    // gold geometric inlay — greek key-ish
    const t = S * 0.125;
    const mx = x % Math.round(t * 2), my = y % Math.round(t * 2);
    const on = (mx < 3) || (my < 3 && mx < t) || (Math.abs(mx - t) < 3 && my < t);
    if (on) b = mix(b, C.gold, 0.7);
    if (on && n2(x, y) > 0.8) b = mix(b, C.goldLt, 0.6);
    return b;
  });
}

const LIST = [
  { n: 1, name: 'ARENA SAND', role: 'raked base', draw: drawSand, noOutline: true },
  { n: 2, name: 'BLOODIED SAND', role: 'battle-marked', draw: drawBlood, noOutline: true },
  { n: 3, name: 'MARBLE FLOOR', role: 'polished slabs', draw: drawMarble, noOutline: true },
  { n: 4, name: 'MOSAIC', role: 'tesserae diamonds', draw: drawMosaic, noOutline: true },
  { n: 5, name: 'TRAVERTINE PAVING', role: 'warm blocks', draw: drawPaving, noOutline: true },
  { n: 6, name: 'CHARIOT TRACK', role: 'rutted racing lane', draw: drawTrack, noOutline: true },
  { n: 7, name: 'HYPOGEUM GRATE', role: 'iron grid + eyes below', draw: drawGrate, noOutline: true },
  { n: 8, name: 'IMPERIAL CARPET', role: 'crimson + gold runner', draw: drawCarpet, noOutline: true },
  { n: 9, name: 'CRACKED FLAGSTONE', role: 'old stone + weeds', draw: drawFlag, noOutline: true },
  { n: 10, name: 'GILT MARBLE', role: 'gold-inlay floor', draw: drawGilt, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'colosseum_tile_options.png', title: 'COLOSSEUM — GROUND TILE CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
