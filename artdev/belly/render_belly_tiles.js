// artdev/belly/render_belly_tiles.js — 10 numbered BELLY OF THE BEAST
// ground-tile candidates, one PNG grid. Gut floors + the wreck's
// decking + the SAND ARENA tile for the beached-whale boss outro.
'use strict';
const KIT = require('./belly_kit.js');
const { B, mix, clamp, ell, row, stroke, renderSheet } = KIT;

// tiny deterministic hash for texture
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

// 1 · STOMACH LINING (BASE) — wet pink flesh floor
function tLining(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 2, y >> 2, 1), n2 = h2(x >> 4, y >> 4, 2);
    let b = mix(B.flesh, B.fleshDk, 0.25 + n2 * 0.45);
    if (n > 0.9) b = mix(b, B.meatLt, 0.35); // wet glints
    if (n < 0.06) b = mix(b, B.fleshDk, 0.5); // pores
    put(x, y, b);
  }
  // soft mottled folds
  for (let i = 0; i < 5; i++) {
    const fx = (i * 53 + 20) % S, fy = (i * 37 + 30) % S;
    for (let t = 0; t < 1; t += 0.04) put(Math.round(fx + Math.cos(t * 3 + i) * 18 * t), Math.round(fy + Math.sin(t * 3 + i) * 10 * t), mix(B.meatLt, B.flesh, 0.5));
  }
}
// 2 · FLESH FOLDS — deep ridged wrinkle rows
function tFolds(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const wave = Math.sin((y + Math.sin(x * 0.05) * 8) * 0.12);
    const n = h2(x >> 2, y >> 2, 3);
    let b = mix(B.meat, B.fleshDk, 0.4 + wave * 0.35);
    if (wave > 0.75) b = mix(b, B.meatLt, 0.4); // ridge crests
    if (n > 0.93) b = mix(b, B.gloss, 0.2);
    put(x, y, b);
  }
}
// 3 · ACID SHALLOWS — glowing digestive wash (ANIMATED)
function tAcid(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 3, y >> 3, 4), sw = Math.sin(x * 0.09 + y * 0.07);
    let b = mix(B.acid, B.acidDk, 0.35 + n * 0.4);
    if (sw > 0.8) b = mix(b, B.acidLt, 0.5); // current highlights
    put(x, y, b);
  }
  // bubbles
  for (let i = 0; i < 9; i++) {
    const bx = (i * 47 + 12) % S, by = (i * 71 + 25) % S;
    put(bx, by, B.acidLt); put(bx + 1, by, B.acid); if (i % 3 === 0) put(bx, by - 1, B.white);
  }
  // half-dissolved bone tips
  [[30, 120], [110, 40]].forEach(([bx, by]) => { stroke(put, bx, by, bx + 8, by - 4, 1.4, () => B.bone); });
}
// 4 · BONE LITTER — digested remains field
function tBones(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 2, y >> 2, 5);
    put(x, y, mix(B.fleshDk, '#3a1218', 0.3 + n * 0.4));
  }
  let seed = 5;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 14; i++) {
    const bx = rnd() * S, by = rnd() * S, a = rnd() * 3.14, len = 6 + rnd() * 12;
    stroke(put, bx, by, bx + Math.cos(a) * len, by + Math.sin(a) * len, 1.5 + rnd(), () => mix(B.bone, B.boneDk, rnd() * 0.5));
    if (i % 3 === 0) { ell(put, bx, by, 2.4, 2, (tx, ty) => mix(B.bone, B.boneDk, ty)); } // knuckle ends
    if (i % 5 === 0) { ell(put, bx + Math.cos(a) * len, by + Math.sin(a) * len, 3, 2.4, (tx, ty) => mix(B.boneDk, B.boneDkk, tx)); put(Math.round(bx + Math.cos(a) * len), Math.round(by + Math.sin(a) * len), B.oil); } // tiny skull
  }
}
// 5 · DECK PLANKS — the wrecked ship's flooring (spawn zone)
function tDeck(put, S) {
  const plankH = 20;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const py = (y / plankH) | 0;
    const off = (py % 2) * 40;
    const n = h2(((x + off) >> 4), py, 6), grain = h2(x >> 1, y >> 3, 7);
    let b = mix(B.wood, B.woodDk, 0.25 + n * 0.4);
    if (grain > 0.92) b = mix(b, B.woodLt, 0.3);
    if (y % plankH === 0) b = B.woodDk; // seams
    if ((x + off) % 80 === 0) b = B.woodDk; // butt joints
    put(x, y, b);
  }
  // nail heads + one acid-rotted patch
  for (let i = 0; i < 6; i++) put((i * 53 + 8) % S, ((i * 37 + 10) % S / 20 | 0) * 20 + 3, B.brassDk);
  for (let y = 96; y < 128; y++) for (let x = 40; x < 84; x++) {
    if (h2(x >> 1, y >> 1, 8) > Math.hypot((x - 62) / 22, (y - 112) / 16)) put(x, y, mix(B.acidDk, B.woodDk, 0.5));
  }
}
// 6 · BARNACLE CRUST — hard growth over the flesh
function tBarnacleCrust(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 2, y >> 2, 9);
    put(x, y, mix(B.meatDk, B.fleshDk, 0.4 + n * 0.3));
  }
  let seed = 11;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 22; i++) {
    const bx = rnd() * S, by = rnd() * S, r = 3 + rnd() * 6;
    ell(put, bx, by, r, r * 0.8, (tx, ty) => {
      const d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      let b = mix(B.bone, B.boneDkk, clamp(d * 0.8 + ty * 0.3, 0, 1));
      return b;
    });
    ell(put, bx, by - r * 0.15, r * 0.3, r * 0.24, () => B.oil); // maw hole
  }
}
// 7 · VEIN FLOOR — flesh webbed with glowing veins
function tVeinFloor(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 3, y >> 3, 10);
    put(x, y, mix(B.flesh, B.fleshDk, 0.35 + n * 0.35));
  }
  let seed = 23;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const branch = (x0, y0, a, len, w, d) => {
    const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
    stroke(put, x0, y0, x1, y1, w, () => B.vein);
    if (w > 1.4) stroke(put, x0, y0, x1, y1, w * 0.4, () => '#8ab0e8');
    if (d > 0) { branch(x1, y1, a - 0.5 - rnd() * 0.3, len * 0.65, w * 0.7, d - 1); branch(x1, y1, a + 0.5 + rnd() * 0.3, len * 0.6, w * 0.7, d - 1); }
  };
  branch(20, 140, -0.9, 40, 3, 3);
  branch(130, 130, -2.2, 36, 2.6, 3);
  branch(80, 20, 1.2, 32, 2.4, 2);
  put(20, 140, '#c8e0ff'); put(130, 130, '#c8e0ff');
}
// 8 · GRISTLE PATH — pale tough walkway (the "trail" of this map)
function tGristle(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 2, y >> 2, 12), band = Math.sin(x * 0.16 + Math.sin(y * 0.04) * 3);
    let b = mix('#c8a898', '#8a6458', 0.35 + n * 0.3);
    if (band > 0.7) b = mix(b, '#e0c8b8', 0.35); // sinew strands
    if (n < 0.05) b = mix(b, B.fleshDk, 0.4);
    put(x, y, b);
  }
  // worn center line (footfall polish)
  for (let y = 0; y < S; y++) for (let x = 56; x < 104; x++) {
    const d = Math.abs(x - 80) / 24;
    if (h2(x >> 2, y >> 2, 13) > d * 0.8) put(x, y, mix('#e0c8b8', '#c8a898', d));
  }
}
// 9 · BILE SLICK — slippery yellow-green film
function tBile(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 3, y >> 3, 14), swirl = Math.sin(x * 0.06 + y * 0.09 + Math.sin(x * 0.03) * 2);
    let b = mix(B.bile, B.bileDk, 0.35 + n * 0.35);
    if (swirl > 0.75) b = mix(b, '#e8f47a', 0.45); // oily swirl highlights
    if (swirl < -0.8) b = mix(b, B.acidDk, 0.3);
    put(x, y, b);
  }
  // sheen streaks
  for (let i = 0; i < 4; i++) {
    const sx = (i * 43 + 15) % S, sy = (i * 61 + 30) % S;
    stroke(put, sx, sy, sx + 22, sy + 6, 1, () => '#f4ffb0');
  }
}
// 10 · ARENA SAND (outro) — the beach where the whale spits you up
function tSand(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = h2(x >> 1, y >> 1, 15), dune = Math.sin(x * 0.05 + y * 0.11);
    let b = mix('#e0c88a', '#b09454', 0.3 + n * 0.35);
    if (dune > 0.85) b = mix(b, '#f0dca8', 0.4); // ripple crests
    put(x, y, b);
  }
  // scattered shells + wet patch corner
  [[28, 40], [120, 90], [70, 130]].forEach(([sx, sy], i) => {
    ell(put, sx, sy, 2.6, 2, (tx, ty) => mix(i % 2 ? '#e8b0a0' : B.bone, B.boneDk, ty));
    put(sx, sy - 1, B.white);
  });
  for (let y = 0; y < 40; y++) for (let x = 0; x < 50 - y; x++) {
    if (h2(x, y, 16) > 0.3) put(x, S - 1 - y, mix('#b09454', '#8a6a3a', 0.5)); // wet sand corner
  }
}

const LIST = [
  { n: 1, name: 'STOMACH LINING', role: 'BASE — wet pink flesh', draw: tLining, noOutline: true },
  { n: 2, name: 'FLESH FOLDS', role: 'deep ridged wrinkles', draw: tFolds, noOutline: true },
  { n: 3, name: 'ACID SHALLOWS', role: 'glowing wash — ANIMATED', draw: tAcid, noOutline: true },
  { n: 4, name: 'BONE LITTER', role: 'digested remains', draw: tBones, noOutline: true },
  { n: 5, name: 'DECK PLANKS', role: 'the wrecked ship flooring', draw: tDeck, noOutline: true },
  { n: 6, name: 'BARNACLE CRUST', role: 'hard growth patches', draw: tBarnacleCrust, noOutline: true },
  { n: 7, name: 'VEIN FLOOR', role: 'glowing vein web', draw: tVeinFloor, noOutline: true },
  { n: 8, name: 'GRISTLE PATH', role: 'pale tough walkway', draw: tGristle, noOutline: true },
  { n: 9, name: 'BILE SLICK', role: 'oily yellow film', draw: tBile, noOutline: true },
  { n: 10, name: 'ARENA SAND', role: 'the beach — outro boss arena', draw: tSand, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'belly_tile_options.png', title: 'BELLY OF THE BEAST — TILES (10 candidates) — pick numbers', S: 160, cols: 5 });
}
module.exports = { LIST };
