// artdev/render_factory_tiles.js — 10 SEAMLESS tiling floor/wall textures for
// biome 4 (note 13). Each cell shows the tile REPEATED so Red sees it tiles.
'use strict';
const K = require('./factory_kit.js');
const { F, mix, clamp, renderSheet } = K;

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function hash(a, b) { const n = Math.sin((a % 9973) * 127.1 + (b % 9973) * 311.7) * 43758.5453; return n - Math.floor(n); }
// fill the whole SxS cell by a periodic shader(tx,ty,T) -> hex color
function fill(put, S, T, shader) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = shader(((x % T) + T) % T, ((y % T) + T) % T, x, y); if (c) put(x, y, c); } }

// 1 · RIVETED STEEL FLOOR
function tRiveted(put, S) {
  const T = 54;
  fill(put, S, T, (tx, ty) => {
    let b = mix(F.steel, F.steelMd, (ty / T));
    b = mix(b, F.steelLt, 0.15 * (1 - tx / T));
    if (tx < 2 || ty < 2) b = F.steelDkk;            // panel seam
    if (tx < 3 && ty < 3) b = F.steelLt;             // seam bevel light
    const cor = (tx > 4 && tx < 10 && ty > 4 && ty < 10);
    if (cor) { const d = Math.hypot(tx - 7, ty - 7); if (d < 3) b = mix(F.steelLt, F.steelDk, d / 3); if (d < 1) b = F.steelDkk; } // rivet
    return b;
  });
}
// 2 · DIAMOND TREAD PLATE
function tTread(put, S) {
  const T = 22;
  fill(put, S, T, (tx, ty) => {
    let b = mix(F.steelMd, F.steelDk, 0.5);
    // two offset diamonds per tile
    const diamonds = [[T * 0.28, T * 0.28], [T * 0.72, T * 0.72]];
    for (const d of diamonds) { const dd = Math.abs(tx - d[0]) + Math.abs(ty - d[1]); if (dd < 6) { b = mix(F.steelLt, F.steel, dd / 6); if (tx < d[0] && ty < d[1]) b = mix(b, F.chrome, 0.4); if (tx > d[0] && ty > d[1]) b = mix(b, F.steelDkk, 0.5); } }
    return b;
  });
}
// 3 · GRATED CATWALK
function tGrate(put, S) {
  const T = 18;
  fill(put, S, T, (tx, ty) => {
    const bar = (tx < 4) || (ty % 9 < 2);
    if (bar) return mix(F.steel, F.steelLt, (tx < 4 ? 0.5 : 0.2));
    // dark gap showing depth
    return mix(F.oil, F.gunDk, (tx / T));
  });
}
// 4 · HAZARD FLOOR
function tHazard(put, S) {
  const T = 28;
  fill(put, S, T, (tx, ty) => {
    const band = Math.floor(((tx + ty) % T) / (T / 2)) === 0;
    let b = band ? F.hazard : F.hazardDk;
    // grime + scuff
    if (hash(tx, ty) > 0.85) b = mix(b, F.oil, 0.4);
    return b;
  });
}
// 5 · CONCRETE SLAB
function tConcrete(put, S) {
  const T = 60;
  fill(put, S, T, (tx, ty) => {
    let b = mix('#565b6b', '#3f4454', hash(Math.floor(tx / 3), Math.floor(ty / 3)) * 0.5);
    if (hash(tx, ty) > 0.92) b = mix(b, F.oil, 0.5);          // speckle
    if (tx < 2 || ty < 2) b = '#313542';                      // expansion joint
    // a crack line
    if (Math.abs(ty - (10 + Math.sin(tx * 0.3) * 5)) < 1) b = F.oil;
    return b;
  });
}
// 6 · CONVEYOR BELT SURFACE (the moving floor)
function tBelt(put, S) {
  const T = 26;
  fill(put, S, T, (tx, ty) => {
    let b = mix(F.rubber, F.rubberDk, (ty / T));
    if (tx < 2) b = F.rubberDk;                                // belt slat seam
    // chevron pointing +x
    const cy = ty < T / 2 ? ty : T - ty;
    if (Math.abs((tx % T) - (T * 0.4 + cy)) < 2) b = F.hazard;
    return b;
  });
}
// 7 · CIRCUIT PANEL
function tCircuit(put, S) {
  const T = 40;
  fill(put, S, T, (tx, ty) => {
    let b = mix('#12331f', '#0d2417', hash(Math.floor(tx / 5), Math.floor(ty / 5)) * 0.6); // dark green PCB
    // traces
    if (ty === 8 || ty === 24 || tx === 14 || tx === 30) b = F.copperDk;
    if (ty === 9 || ty === 25 || tx === 15 || tx === 31) b = F.copper;
    // pads/nodes
    const pads = [[14, 8], [30, 24], [14, 24]];
    for (const p of pads) { const d = Math.hypot(tx - p[0], ty - p[1]); if (d < 3) b = F.brass; if (d < 1.4) b = F.greenLt; }
    if (hash(tx, ty) > 0.96) b = F.green;                      // stray SMD glint
    return b;
  });
}
// 8 · RUSTED METAL
function tRust(put, S) {
  const T = 58;
  fill(put, S, T, (tx, ty) => {
    let b = mix(F.steelMd, F.steelDk, hash(Math.floor(tx / 4), Math.floor(ty / 4)) * 0.4 + 0.2);
    const r = hash(Math.floor(tx / 5) + 3, Math.floor(ty / 5) + 7);
    if (r > 0.6) b = mix(b, F.rust, (r - 0.6) * 2.2);          // rust blotches
    if (r > 0.86) b = mix(F.rust, F.rustDk, hash(tx, ty));
    if (tx < 2 || ty < 2) b = F.steelDkk;
    return b;
  });
}
// 9 · CORRUGATED WALL
function tCorrugated(put, S) {
  const T = 16;
  fill(put, S, T, (tx) => {
    const w = Math.sin((tx / T) * Math.PI * 2);
    let b = mix(F.steelDk, F.steelLt, (w + 1) / 2);
    b = mix(b, F.iron, 0.15);
    return b;
  });
}
// 10 · VENT GRILLE
function tGrille(put, S) {
  const T = 20;
  fill(put, S, T, (tx, ty) => {
    if (ty < 3) return F.steelDkk;                             // slat frame
    const s = (ty - 3) / (T - 3);
    let b = mix(F.gun, F.oil, s);                              // louver falling into shadow
    if (ty > T - 4) b = F.oil;                                 // deep gap
    if (tx < 2) b = F.steelDk;
    return b;
  });
}

const TILES = [
  { n: 1, name: 'RIVETED STEEL', role: 'floor', draw: tRiveted, noOutline: true },
  { n: 2, name: 'DIAMOND TREAD', role: 'floor', draw: tTread, noOutline: true },
  { n: 3, name: 'GRATED CATWALK', role: 'floor', draw: tGrate, noOutline: true },
  { n: 4, name: 'HAZARD FLOOR', role: 'border/floor', draw: tHazard, noOutline: true },
  { n: 5, name: 'CONCRETE SLAB', role: 'floor', draw: tConcrete, noOutline: true },
  { n: 6, name: 'CONVEYOR BELT', role: 'moving floor', draw: tBelt, noOutline: true },
  { n: 7, name: 'CIRCUIT PANEL', role: 'floor/wall', draw: tCircuit, noOutline: true },
  { n: 8, name: 'RUSTED METAL', role: 'floor/wall', draw: tRust, noOutline: true },
  { n: 9, name: 'CORRUGATED WALL', role: 'wall', draw: tCorrugated, noOutline: true },
  { n: 10, name: 'VENT GRILLE', role: 'wall', draw: tGrille, noOutline: true }
];

renderSheet({ list: TILES, out: process.argv[2] || 'factory_tile_options.png', cols: 5, label: 34, title: 'BIOME 4 · ROBOTICS FACTORY — 10 TILING TEXTURES  (each shown tiled 3-4x, seamless)' })
  .catch(e => { console.error(e); process.exit(1); });
