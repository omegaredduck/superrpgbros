// artdev/carnival/render_carnival_tiles.js — 10 numbered HAUNTED CARNIVAL
// ground-tile candidates (each a seamless-ish 160px swatch).
'use strict';
const KIT = require('./carnival_kit.js');
const { C, mix, clamp, renderSheet } = KIT;

function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = fn(x, y, x / S, y / S); if (c) put(x, y, c); } }
function h2(x, y) { let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); }

// 1 · TRAMPLED DIRT — the midway base.
function tDirt(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(C.dirt, C.dirtDk, h2(x >> 2, y >> 2) * 0.8);
    if (Math.sin(x / 9 + Math.sin(y / 14) * 3) > 0.9) b = mix(b, C.dirtDk, 0.5); // foot ruts
    if (h2(x, y) > 0.99) b = C.dirtLt;
    return b;
  });
}
// 2 · SAWDUST RING — big-top floor.
function tSawdust(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 1, y >> 1);
    let b = mix('#c8a878', '#8a6e48', n * 0.8);
    if (h2(x + 3, y) > 0.97) b = '#e0c898';
    if (h2(x, y + 7) > 0.985) b = '#6a5236';
    return b;
  });
}
// 3 · BOARDWALK — weathered planks.
function tBoards(put, S) {
  fill(put, S, (x, y) => {
    const py = Math.floor(y / 20), off = (py % 2) * 40;
    const ex = (x + off) % 80;
    let b = mix(C.wood, C.woodDk, h2(py * 7 + ((x + off) / 80 | 0), py) * 0.7);
    b = mix(b, C.woodDkk, Math.abs(Math.sin(x * 0.7 + py * 3)) * 0.12); // grain
    if (y % 20 < 1.5 || ex < 1.5) b = C.woodDkk;
    if (h2(x, y) > 0.995) b = C.woodLt;
    return b;
  });
}
// 4 · FUNHOUSE CHECKER — warped red/cream tiles.
function tChecker(put, S) {
  fill(put, S, (x, y) => {
    const wob = Math.sin(y / 22) * 6;
    const cxq = Math.floor((x + wob) / 20), cyq = Math.floor(y / 20);
    const on = (cxq + cyq) % 2 === 0;
    let b = on ? mix(C.red, C.redDk, h2(cxq, cyq) * 0.5) : mix(C.cream, C.creamDk, h2(cxq + 3, cyq) * 0.5);
    if ((x + wob) % 20 < 1 || y % 20 < 1) b = C.oil;
    return b;
  });
}
// 5 · DEAD GRASS — trampled outskirts.
function tGrass(put, S) {
  fill(put, S, (x, y) => {
    const n = h2(x >> 1, y >> 1);
    let b = mix('#6a6e46', '#4a4e32', n * 0.8);
    if (h2(x + 9, y + 2) > 0.96) b = '#8a8e5e';
    if (h2(x, y + 4) > 0.985) b = C.dirtDk; // bare patches
    return b;
  });
}
// 6 · MUDDY MIDWAY — rained-out puddled dirt.
function tMud(put, S) {
  fill(put, S, (x, y) => {
    const w = Math.sin(x / 16 + Math.sin(y / 11) * 2.4) + Math.sin(y / 19);
    if (w > 1.1) { // puddle
      let b = mix('#2c3a4e', '#16202e', clamp((w - 1.1) * 1.6, 0, 1));
      if (h2(x, y) > 0.985) b = C.tealLt; // moon glints
      return b;
    }
    return mix('#4a3a2c', '#2e2218', h2(x >> 2, y >> 2) * 0.8);
  });
}
// 7 · CONFETTI DIRT — celebration long over.
function tConfetti(put, S) {
  tDirt(put, S);
  fill(put, S, (x, y) => {
    if (h2(x >> 1, (y >> 1) + 40) > 0.965) {
      const c = [C.red, C.glow, C.teal, C.violet, C.pink][Math.floor(h2(x, y) * 5)];
      return mix(c, C.dirt, 0.35); // faded, trodden-in
    }
    return null;
  });
}
// 8 · TICKET LITTER — drifts of torn stubs.
function tTickets(put, S) {
  tDirt(put, S);
  fill(put, S, (x, y) => {
    const g = h2((x / 7 | 0), ((y + (x / 7 | 0) * 3) / 4 | 0));
    if (g > 0.9) { // little stub rectangles
      const inStub = (x % 7) < 5 && ((y + (x / 7 | 0) * 3) % 4) < 2;
      if (inStub) return g > 0.96 ? C.glow : mix(C.cream, C.creamDk, h2(x >> 3, y >> 3));
    }
    return null;
  });
}
// 9 · RING MAT — big red boss-arena circus mat.
function tRingMat(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(C.redDk, C.redDkk, h2(x >> 3, y >> 3) * 0.7);
    // gold star scatter
    if ((x % 40 > 17 && x % 40 < 23) && (y % 40 > 17 && y % 40 < 23)) {
      const dx = Math.abs(x % 40 - 20), dy = Math.abs(y % 40 - 20);
      if (dx + dy < 3) b = C.glow;
    }
    if (Math.abs(Math.sin(x / 26 - y / 30)) > 0.985) b = mix(b, C.oil, 0.5); // seam scuffs
    return b;
  });
}
// 10 · MIDWAY PAVERS — worn brick path.
function tPavers(put, S) {
  fill(put, S, (x, y) => {
    const by = Math.floor(y / 16), off = (by % 2) * 16;
    const ex = (x + off) % 32, bx = ((x + off) / 32) | 0;
    let b = mix('#6e5a56', '#4a3a38', h2(bx, by) * 0.8);
    if (h2(bx + 9, by + 2) > 0.75) b = mix(b, C.dirtDk, 0.6); // missing/dirt-filled brick
    if (ex < 1.6 || y % 16 < 1.6) b = '#2c2220';
    if (h2(x, y) > 0.995) b = '#8a7672';
    return b;
  });
}

const LIST = [
  { n: 1, name: 'TRAMPLED DIRT', role: 'midway base', draw: tDirt, noOutline: true },
  { n: 2, name: 'SAWDUST RING', role: 'big-top floor', draw: tSawdust, noOutline: true },
  { n: 3, name: 'BOARDWALK', role: 'weathered planks', draw: tBoards, noOutline: true },
  { n: 4, name: 'FUNHOUSE CHECKER', role: 'warped tiles', draw: tChecker, noOutline: true },
  { n: 5, name: 'DEAD GRASS', role: 'outskirts', draw: tGrass, noOutline: true },
  { n: 6, name: 'MUDDY MIDWAY', role: 'puddled dirt', draw: tMud, noOutline: true },
  { n: 7, name: 'CONFETTI DIRT', role: 'party long over', draw: tConfetti, noOutline: true },
  { n: 8, name: 'TICKET LITTER', role: 'stub drifts', draw: tTickets, noOutline: true },
  { n: 9, name: 'RING MAT', role: 'boss arena', draw: tRingMat, noOutline: true },
  { n: 10, name: 'MIDWAY PAVERS', role: 'worn brick path', draw: tPavers, noOutline: true },
];

renderSheet({ list: LIST, out: process.argv[2] || 'carnival_tile_options.png', title: 'HAUNTED CARNIVAL — GROUND TILES (pick the spread)', S: 160 });
