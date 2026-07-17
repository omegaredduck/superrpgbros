// artdev/prehistoria/render_prehistoria_tiles.js — PREHISTORIA ground
// tiles: 10 candidates. Smooth value-noise (no blob stamps).
'use strict';
const KIT = require('./prehistoria_kit.js');
const { P, mix, clamp, ell, row, stroke, renderSheet } = KIT;

function h2(ix, iy, seed) { const s = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
function sn(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy, seed), b = h2(ix + 1, iy, seed), c = h2(ix, iy + 1, seed), d = h2(ix + 1, iy + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
// three-toed print stamp
function print(put, cx, cy, sc, ang, c) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const T = (ox, oy) => [cx + ox * ca - oy * sa, cy + ox * sa + oy * ca];
  [[-3, -2], [0, -3.4], [3, -2]].forEach(([ox, oy]) => { const [px2, py2] = T(ox * sc, oy * sc); ell(put, px2, py2, 1.6 * sc, 2.4 * sc, () => c); });
  const [hx, hy] = T(0, 1.4 * sc); ell(put, hx, hy, 2.2 * sc, 1.8 * sc, () => c);
}

// 1 JUNGLE FLOOR — base
function tJungle(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 20, y / 20, 81) * 0.6 + sn(x / 6, y / 6, 82) * 0.4;
    put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.3, 0, 1)));
  }
  for (let k = 0; k < 22; k++) {
    const gx = h2(k, 3, 83) * S, gy = h2(k, 7, 83) * S;
    stroke(put, gx, gy, gx + (h2(k, 11, 83) - 0.5) * 3, gy - 3, 0.8, () => mix('#7aa04a', '#2e4a1e', h2(k, 13, 83)));
  }
  [[0.3, 0.7], [0.75, 0.25]].forEach(([fx, fy]) => { put(Math.round(fx * S), Math.round(fy * S), '#c8d46a'); });
}

// 2 MUD FLATS — pocked w/ prints
function tMud(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 24, y / 24, 84) * 0.65 + sn(x / 8, y / 8, 85) * 0.35;
    put(x, y, mix(P.mudLt, P.mudDk, clamp(n * 1.25, 0, 1)));
  }
  print(put, S * 0.28, S * 0.3, S * 0.02, 0.4, '#241a0e');
  print(put, S * 0.55, S * 0.52, S * 0.02, 0.6, '#241a0e');
  print(put, S * 0.78, S * 0.76, S * 0.02, 0.5, '#241a0e');
  print(put, S * 0.35, S * 0.8, S * 0.014, -1.2, '#2e2212');
}

// 3 FERN MEADOW
function tFernMeadow(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 16, y / 16, 86) * 0.55 + sn(x / 5, y / 5, 87) * 0.45;
    put(x, y, mix('#5a8a3a', '#26421a', clamp(n * 1.25, 0, 1)));
  }
  // curled frond ticks
  for (let k = 0; k < 12; k++) {
    const fx = h2(k, 17, 88) * S, fy = h2(k, 19, 88) * S;
    for (let a = 0; a < 3.6; a += 0.4) put(Math.round(fx + Math.cos(a) * (3 - a * 0.5)), Math.round(fy + Math.sin(a) * (3 - a * 0.5)), '#8ac86a');
  }
}

// 4 RIVERBED STONE
function tRiverbed(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 18, y / 18, 89);
    put(x, y, mix('#8a8276', '#42403a', clamp(n * 1.2, 0, 1)));
  }
  // smooth pebbles
  for (let k = 0; k < 16; k++) {
    const px2 = h2(k, 23, 90) * S, py2 = h2(k, 29, 90) * S, pr = 3 + h2(k, 31, 90) * 6;
    ell(put, px2, py2, pr, pr * 0.7, (tx, ty) => mix('#a89a86', '#4a443a', clamp(tx * 1.1 + ty * 0.6 - 0.2, 0, 1)));
  }
}

// 5 VOLCANIC ASH
function tAsh(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 26, y / 26, 91) * 0.6 + sn(x / 9, y / 9, 92) * 0.4;
    put(x, y, mix('#6a6266', '#2e2a2c', clamp(n * 1.3, 0, 1)));
  }
  [[0.2, 0.4], [0.66, 0.2], [0.8, 0.7], [0.4, 0.85]].forEach(([fx, fy], i) => { put(Math.round(fx * S), Math.round(fy * S), i % 2 ? P.volcano : '#ffd24a'); });
  // hairline glow crack
  let cx2 = S * 0.1, cy2 = S * 0.6;
  for (let i = 0; i < 8; i++) { const nx = cx2 + 8 + h2(i, 37, 93) * 6, ny = cy2 + (h2(i, 41, 93) - 0.5) * 10; stroke(put, cx2, cy2, nx, ny, 1, () => mix(P.volcano, '#8a2808', h2(i, 43, 93))); cx2 = nx; cy2 = ny; }
}

// 6 TAR SEEP
function tTarSeep(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 22, y / 22, 94) * 0.6 + sn(x / 7, y / 7, 95) * 0.4;
    let c = mix(P.mud, P.mudDk, clamp(n * 1.2, 0, 1));
    if (n > 0.72) c = mix(P.tarLt, P.tar, (n - 0.72) * 3); // tar pools in the low spots
    put(x, y, c);
  }
  [[0.3, 0.35], [0.7, 0.62]].forEach(([fx, fy]) => { for (let a = 0; a < 6.28; a += 0.5) put(Math.round(fx * S + Math.cos(a) * 2.4), Math.round(fy * S + Math.sin(a) * 1.4), P.tarGloss); });
}

// 7 BONE FIELD
function tBoneField(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 20, y / 20, 96) * 0.7 + sn(x / 6, y / 6, 97) * 0.3;
    put(x, y, mix('#5a4a3a', '#241c12', clamp(n * 1.3, 0, 1)));
  }
  for (let k = 0; k < 8; k++) {
    const bx = h2(k, 47, 98) * S, by = h2(k, 53, 98) * S, a = h2(k, 59, 98) * 6.28, ln = 4 + h2(k, 61, 98) * 8;
    stroke(put, bx, by, bx + Math.cos(a) * ln, by + Math.sin(a) * ln, 1.6, () => mix(P.bone, P.boneDk, h2(k, 67, 98) * 0.5));
    ell(put, bx, by, 1.4, 1.4, () => P.boneDk);
  }
  ell(put, S * 0.7, S * 0.3, S * 0.04, S * 0.034, (tx, ty) => mix(P.bone, P.boneDk, tx + ty * 0.4));
  put(Math.round(S * 0.685), Math.round(S * 0.295), '#241c12');
}

// 8 GAME TRAIL — the stampede route
function tTrail(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const band = Math.abs(y - S * 0.5 - Math.sin(x / S * 6.28) * S * 0.08);
    const n = sn(x / 18, y / 18, 99) * 0.5 + sn(x / 6, y / 6, 100) * 0.5;
    if (band < S * 0.22) put(x, y, mix('#a8906a', '#5a4a2e', clamp(n * 1.1 + band / (S * 0.3), 0, 1))); // packed dirt
    else put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.25, 0, 1))); // jungle edges
  }
  // MANY overlapping prints along the trail
  for (let k = 0; k < 7; k++) {
    const tx2 = (k + 0.5) / 7 * S, ty2 = S * 0.5 + Math.sin(tx2 / S * 6.28) * S * 0.08 + (h2(k, 71, 101) - 0.5) * S * 0.16;
    print(put, tx2, ty2, S * 0.013 + h2(k, 73, 101) * S * 0.008, h2(k, 79, 101) * 1.2 - 0.6 + 1.57, '#42351c');
  }
}

// 9 SWAMP SHALLOWS
function tSwamp(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const flow = sn(x / 26 + y / 70, y / 18, 102) * 0.6 + sn(x / 8, y / 8, 103) * 0.4;
    let c = mix('#3a5a4a', '#122018', clamp(flow * 1.3, 0, 1));
    if (flow > 0.76) c = mix(c, '#7aa886', 0.5); // scum highlights
    put(x, y, c);
  }
  // lily pads + a bubble ring
  [[0.25, 0.3, 6], [0.68, 0.6, 8], [0.85, 0.18, 5]].forEach(([fx, fy, pr]) => {
    ell(put, fx * S, fy * S, pr, pr * 0.7, (tx, ty) => mix('#5a8a4a', '#2a4a22', clamp(tx + ty * 0.4 - 0.2, 0, 1)));
    stroke(put, fx * S, fy * S, fx * S + pr * 0.8, fy * S - pr * 0.3, 1, () => '#122018'); // pad notch
  });
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(S * 0.45 + Math.cos(a) * 4), Math.round(S * 0.8 + Math.sin(a) * 2.4), '#7aa886');
}

// 10 CRATER ROCK
function tCrater(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 24, y / 24, 104) * 0.6 + sn(x / 7, y / 7, 105) * 0.4;
    put(x, y, mix('#4a4246', '#1c181a', clamp(n * 1.3, 0, 1)));
  }
  // impact spider cracks from one corner
  for (let k = 0; k < 5; k++) {
    let cx2 = S * 0.75, cy2 = S * 0.25;
    const a = k / 5 * 6.28 + 0.4;
    for (let i = 0; i < 5; i++) {
      const nx = cx2 + Math.cos(a + (h2(i, 83, 106 + k) - 0.5)) * S * 0.09, ny = cy2 + Math.sin(a + (h2(i, 89, 106 + k) - 0.5)) * S * 0.09;
      stroke(put, cx2, cy2, nx, ny, 1, () => (i < 2 ? mix(P.volcano, '#1c181a', 0.3) : '#0e0c0d'));
      cx2 = nx; cy2 = ny;
    }
  }
  ell(put, S * 0.75, S * 0.25, 3.4, 2.6, (tx, ty) => mix(P.volcano, '#8a2808', tx + ty * 0.4));
}

const LIST = [
  { n: 1, name: 'JUNGLE FLOOR', role: 'BASE — mossy undergrowth', draw: tJungle, noOutline: true },
  { n: 2, name: 'MUD FLATS', role: 'print-pocked mud', draw: tMud, noOutline: true },
  { n: 3, name: 'FERN MEADOW', role: 'dense low ferns', draw: tFernMeadow, noOutline: true },
  { n: 4, name: 'RIVERBED STONE', role: 'smooth pebbles', draw: tRiverbed, noOutline: true },
  { n: 5, name: 'VOLCANIC ASH', role: 'grey ash + ember cracks', draw: tAsh, noOutline: true },
  { n: 6, name: 'TAR SEEP', role: 'tar pooling in low spots', draw: tTarSeep, noOutline: true },
  { n: 7, name: 'BONE FIELD', role: 'scattered remains', draw: tBoneField, noOutline: true },
  { n: 8, name: 'GAME TRAIL', role: 'packed dirt, MANY prints — stampede route', draw: tTrail, noOutline: true },
  { n: 9, name: 'SWAMP SHALLOWS', role: 'murky water + lily pads', draw: tSwamp, noOutline: true },
  { n: 10, name: 'CRATER ROCK', role: 'impact-cracked scorch', draw: tCrater, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'prehistoria_tile_options.png', title: 'PREHISTORIA — TILES (10 candidates) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
