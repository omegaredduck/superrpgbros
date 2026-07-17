// artdev/crystal/render_crystal_tiles.js — 10 numbered CRYSTAL CAVERNS
// ground-tile candidates (each drawn as a seamless-ish 160px swatch).
'use strict';
const KIT = require('./crystal_kit.js');
const { K, GEMS, mix, clamp, row, renderSheet } = KIT;

function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = fn(x, y, x / S, y / S); if (c) put(x, y, c); } }
function h2(x, y) { let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }

// 1 · CAVE FLOOR — rough purple-grey rock.
function tRock(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 2, y >> 2);
    let b = mix(K.rock, K.rockDk, n);
    if (h2(x, y) > 0.97) b = K.rockLt;
    if (h2(x + 9, y + 3) > 0.985) b = K.rockDkk;
    return b;
  });
}
// 2 · CRYSTAL FLOOR — polished translucent facets.
function tCrystal(put, S) {
  fill(put, S, (x, y) => {
    const fx = ((x + y * 0.5) / 26) | 0, fy = ((y - x * 0.3) / 22) | 0;
    const n = h2(fx, fy);
    let b = mix(K.cyanDk, mix(K.cyan, K.cyanLt, n), 0.4 + n * 0.4);
    b = mix(b, '#0e2a30', 0.45);
    if (h2(x, y) > 0.992) b = K.cyanLt;
    return b;
  });
}
// 3 · GEM-STUDDED ROCK — cave floor w/ embedded gems.
function tStudded(put, S) {
  tRock(put, S);
  for (let i = 0; i < 12; i++) {
    const gx = Math.floor(h2(i, 7) * S), gy = Math.floor(h2(i, 13) * S);
    const [c, lt] = GEMS[i % 5];
    [[0, 0, lt], [1, 0, c], [-1, 0, c], [0, 1, c], [0, -1, c], [1, 1, mix(c, '#000000', 0.4)]].forEach(([dx, dy, cc]) => put(gx + dx, gy + dy, cc));
  }
}
// 4 · AMETHYST PATH — worked purple walkway.
function tAmethyst(put, S) {
  fill(put, S, (x, y) => {
    const bx = (x / 40) | 0, by = (y / 26) | 0, off = (by % 2) * 20;
    const ex = (x + off) % 40, ey = y % 26;
    let b = mix(K.purple, K.purpleDk, h2(bx * 3 + (by % 2), by) * 0.7);
    if (ex < 2 || ey < 2) b = K.voidDk;
    else if (ex < 4 || ey < 4) b = mix(b, K.purpleLt, 0.3);
    if (h2(x, y) > 0.99) b = K.purpleLt;
    return b;
  });
}
// 5 · CAVE WATER — glowing shallows ring.
function tWater(put, S) {
  fill(put, S, (x, y) => {
    const w = Math.sin(x / 11 + Math.sin(y / 8) * 2) + Math.sin(y / 13);
    let b = mix('#1c4a74', '#0e2440', clamp(w * 0.4 + 0.5, 0, 1));
    if (w > 1.45) b = mix(b, K.cyanLt, 0.65);
    if (h2(x, y) > 0.995) b = '#bfe8ff';
    return b;
  });
}
// 6 · MOSS ROCK — luminous green carpet.
function tMoss(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 1, y >> 1), m = h2((x >> 3) + 5, y >> 3);
    let b = mix(mix(K.green, K.greenDk, n), K.rockDk, m > 0.6 ? 0.75 : 0.15);
    if (h2(x + 4, y) > 0.985) b = K.greenLt;
    return b;
  });
}
// 7 · GEODE CRUST — cracked crystal-lined floor.
function tGeode(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 2, y >> 2);
    let b = mix(K.void, K.voidDk, n);
    const cr = Math.abs(Math.sin(x / 17 + Math.sin(y / 9) * 3));
    if (cr > 0.93) b = mix(K.pink, K.pinkLt, h2(x, y));
    else if (cr > 0.86) b = K.pinkDk;
    if (h2(x + 2, y + 8) > 0.99) b = K.voidLt;
    return b;
  });
}
// 8 · GLITTER SAND — soft cave sand, sparkling.
function tSand(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 1, y >> 1);
    let b = mix('#b8a890', '#8a7a62', n * 0.7);
    if (Math.sin(y / 7 + x / 30) > 0.85) b = mix(b, '#d0c0a8', 0.4);
    if (h2(x + 6, y + 1) > 0.988) b = h2(x, y + 2) > 0.5 ? '#ffffff' : K.cyanLt;
    return b;
  });
}
// 9 · OBSIDIAN FLOOR — dark glassy boss-arena tile.
function tObsidian(put, S) {
  fill(put, S, (x, y) => {
    const fx = ((x - y * 0.4) / 30) | 0, fy = ((y + x * 0.2) / 24) | 0;
    const n = h2(fx, fy);
    let b = mix('#16121e', '#241c30', n);
    if (Math.abs(Math.sin(x / 14 - y / 20)) > 0.965) b = K.voidLt;
    if (h2(x, y + 5) > 0.994) b = K.pink;
    return b;
  });
}
// 10 · CRYSTALLIZED GROUND — the GROWING CRYSTAL mechanic's frozen floor.
function tGrown(put, S) {
  tRock(put, S);
  fill(put, S, (x, y) => {
    const n = h2((x + y) >> 3, (y - x) >> 3);
    if (n < 0.42) return null;
    const f = h2(x >> 2, (y + 30) >> 2);
    let b = mix(K.pinkDk, mix(K.pink, K.pinkLt, f), 0.5 + f * 0.4);
    b = mix(b, K.rockDk, 0.3);
    if (h2(x + 1, y + 1) > 0.985) b = K.pinkLt;
    return b;
  });
}

const LIST = [
  { n: 1, name: 'CAVE FLOOR', role: 'base rock', draw: tRock, noOutline: true },
  { n: 2, name: 'CRYSTAL FLOOR', role: 'polished facets', draw: tCrystal, noOutline: true },
  { n: 3, name: 'GEM-STUDDED', role: 'rock + gems', draw: tStudded, noOutline: true },
  { n: 4, name: 'AMETHYST PATH', role: 'worked walkway', draw: tAmethyst, noOutline: true },
  { n: 5, name: 'CAVE WATER', role: 'glowing shallows', draw: tWater, noOutline: true },
  { n: 6, name: 'GLOW MOSS', role: 'green carpet', draw: tMoss, noOutline: true },
  { n: 7, name: 'GEODE CRUST', role: 'pink-lined crack', draw: tGeode, noOutline: true },
  { n: 8, name: 'GLITTER SAND', role: 'soft + sparkly', draw: tSand, noOutline: true },
  { n: 9, name: 'OBSIDIAN', role: 'boss arena', draw: tObsidian, noOutline: true },
  { n: 10, name: 'CRYSTALLIZED', role: 'grown-over floor', draw: tGrown, noOutline: true },
];

renderSheet({ list: LIST, out: process.argv[2] || 'crystal_tile_options.png', title: 'CRYSTAL CAVERNS — GROUND TILES (pick the spread)', S: 160 });
