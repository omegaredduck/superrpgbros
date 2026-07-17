// artdev/pyramid/render_pyramid_tiles.js — 10 PYRAMID PLUNDER map-tile
// candidates (each cell tiles 2x2).
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp, renderSheet } = KIT;
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function tiled(base) {
  return (put, S) => { const T = S / 2; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2); if (c) put(x, y, c); } };
}

// 1 · DESERT SAND — rippled open dunes (main outdoor floor).
const drawDesert = tiled((x, y, T, q) => {
  let b = mix(E.sand, E.sandDk, 0.2 + h2(x >> 2, y >> 2, 1) * 0.35);
  const rip = Math.sin(y * 0.5 + Math.sin(x * 0.12 + q) * 2.2);
  if (rip > 0.75) b = mix(b, E.sandLt, 0.5);
  if (rip < -0.8) b = mix(b, E.sandDkk, 0.3);
  if (h2(x, y, 3) > 0.995) b = E.sandLt;
  return b;
});

// 2 · SANDSTONE BRICK — big tomb blocks (interior floor).
const drawBrick = tiled((x, y, T, q) => {
  const bh = T / 4, bw = T / 2;
  const rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
  const bx = Math.floor((x + off) / bw);
  let b = mix(E.stoneLt, E.stone, 0.25 + h2(bx + q * 5, rowI, 7) * 0.5);
  b = mix(b, E.stoneDk, h2(x, y, 8) * 0.2);
  if (y % bh < 1.5 || (x + off) % bw < 1.5) b = E.stoneDkk;
  if (h2(x, y, 9) > 0.992) b = E.sandLt;
  return b;
});

// 3 · GLYPH CAUSEWAY — processional path w/ carved cartouches.
const drawCauseway = tiled((x, y, T, q) => {
  let b = mix(E.sandLt, E.sand, 0.3 + h2(x >> 2, y >> 2, 12) * 0.4);
  if (y % (T / 2) < 1.5 || x % (T / 2) < 1.5) b = E.stoneDk;
  // cartouche per half-tile
  const cxq = (Math.floor(x / (T / 2)) + q) % 2, gx = x % (T / 2), gy = y % (T / 2);
  const inCart = gx > 8 && gx < T / 2 - 8 && gy > 6 && gy < T / 2 - 6;
  const border = inCart && (gx < 10 || gx > T / 2 - 10 || gy < 8 || gy > T / 2 - 8);
  if (border) b = E.stoneDkk;
  else if (inCart) {
    const k = (Math.floor(gx / 5) + Math.floor(gy / 6) * 3 + cxq) % 4;
    if (k === 0 && gx % 5 < 3 && gy % 6 === 3) b = E.stoneDkk;
    if (k === 1 && gx % 5 === 2 && gy % 6 < 4) b = E.stoneDkk;
    if (k === 2 && (gx + gy) % 7 < 1.5) b = E.sandDkk;
  }
  return b;
});

// 4 · TOMB DARK — near-black interior stone w/ dust (dark corridors).
const drawTombDark = tiled((x, y, T, q) => {
  let b = mix(E.tomb, E.tombDk, 0.35 + h2(x >> 1, y >> 1, 20) * 0.5);
  if ((x % (T / 2) < 1.2) || (y % (T / 2) < 1.2)) b = mix(b, E.oil, 0.7);
  if (h2(x, y, 22) > 0.993) b = E.sandDk; // dust motes
  if (h2(x >> 3, y >> 3, 23) > 0.9 && (x + y) % 9 < 1.5) b = mix(b, E.sandDkk, 0.4); // scuffs
  return b;
});

// 5 · ROYAL GOLD FLOOR — gilded burial-chamber tiles (boss arena).
const drawRoyal = tiled((x, y, T, q) => {
  const cs = T / 4, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const alt = (cxi + cyi) % 2 === 0;
  let b = alt ? mix(E.gold, E.goldDk, 0.25 + h2(cxi, cyi, 30) * 0.35)
    : mix(E.obsidian, E.tombDk, 0.3 + h2(cxi, cyi, 31) * 0.4);
  if (Math.sin(x * 0.7 + y * 0.4) > 0.93 && alt) b = mix(b, E.goldLt, 0.7);
  if (x % cs < 1.2 || y % cs < 1.2) b = E.goldDkk;
  // lapis stud at intersections
  if (x % cs < 2.5 && y % cs < 2.5) b = E.lapisDk;
  return b;
});

// 6 · CRACKED CLAY — sun-baked flats (outdoor variant).
const drawClay = tiled((x, y, T, q) => {
  let b = mix(E.stone, E.sandDk, 0.3 + h2(x >> 2, y >> 2, 40) * 0.4);
  // voronoi-ish crack cells
  const gx = Math.floor(x / 13), gy = Math.floor(y / 13);
  let minD = 99, minD2 = 99;
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
    const px = (gx + ox) * 13 + h2(gx + ox, gy + oy, 41) * 10, py = (gy + oy) * 13 + h2(gx + ox, gy + oy, 42) * 10;
    const d = Math.hypot(x - px, y - py);
    if (d < minD) { minD2 = minD; minD = d; } else if (d < minD2) minD2 = d;
  }
  if (minD2 - minD < 1.4) b = E.sandDkk;
  return b;
});

// 7 · LAPIS HALL — deep-blue star-ceiling tiles (sacred rooms).
const drawLapisHall = tiled((x, y, T, q) => {
  let b = mix(E.lapisDk, '#0e1e4a', 0.3 + h2(x >> 2, y >> 2, 50) * 0.4);
  if (x % (T / 2) < 1.4 || y % (T / 2) < 1.4) b = mix(b, E.goldDkk, 0.8);
  // gold five-point star stamps
  const gx = x % (T / 2) - T / 4, gy = y % (T / 2) - T / 4;
  const r = Math.hypot(gx, gy), a = Math.atan2(gy, gx);
  const star = r < 8 * (0.45 + 0.55 * Math.abs(Math.cos(a * 2.5)));
  if (star && r < 8) b = r < 2 ? E.goldLt : mix(E.gold, E.goldDk, r / 8);
  if (h2(x, y, 52) > 0.996) b = E.goldLt;
  return b;
});

// 8 · QUICKSAND — churning pit sand (hazard zones).
const drawQuicksand = tiled((x, y, T, q) => {
  const dx = x - T / 2, dy = y - T / 2;
  const ang = Math.atan2(dy, dx), rad = Math.hypot(dx, dy);
  const swirl = Math.sin(ang * 3 + rad * 0.5 - q * 2);
  let b = mix(E.sandDk, E.sandDkk, 0.4 + swirl * 0.3);
  if (swirl > 0.75) b = mix(b, E.sand, 0.4);
  if (rad < 5) b = mix(E.sandDkk, E.tombDk, 0.6);
  if (h2(x, y, 60) > 0.993) b = E.sandLt;
  return b;
});

// 9 · REED MAT — woven matting (camp/oasis accent).
const drawReedMat = tiled((x, y, T, q) => {
  const over = (Math.floor(x / 5) + Math.floor(y / 5)) % 2 === 0;
  let b = over ? mix(E.sandLt, E.sandDk, (y % 5) / 5 * 0.5 + h2(x >> 2, y >> 2, 70) * 0.2)
    : mix(E.sand, E.sandDkk, (x % 5) / 5 * 0.5 + h2(x >> 2, y >> 2, 71) * 0.2);
  if (x % 5 < 1 && !over) b = E.sandDkk;
  if (y % 5 < 1 && over) b = E.sandDkk;
  // red border stripe per tile
  if (x % T < 2 || y % T < 2) b = mix(E.red, E.redDk, h2(x, y, 72) * 0.5);
  return b;
});

// 10 · OBSIDIAN SEAL — black glass floor w/ gold seal rings (inner sanctum).
const drawObsidianSeal = tiled((x, y, T, q) => {
  let b = mix(E.obsidian, E.oil, 0.3 + h2(x >> 2, y >> 2, 80) * 0.4);
  if (Math.sin((x + y) * 0.22 + q) > 0.94) b = mix(b, E.purpleDk, 0.4); // sheen
  const dx = x % T - T / 2, dy = y % T - T / 2, rad = Math.hypot(dx, dy);
  // concentric gold seal rings + glyph ticks
  [T * 0.18, T * 0.32, T * 0.44].forEach((rr, i) => {
    if (Math.abs(rad - rr) < 1.2) b = mix(E.gold, E.goldDkk, h2(x, y, 81 + i) * 0.5);
  });
  const ang = Math.atan2(dy, dx);
  if (Math.abs(rad - T * 0.38) < 3 && Math.abs(Math.sin(ang * 8)) > 0.93) b = E.goldDk;
  if (rad < 2.5) b = E.curse;
  return b;
});

const LIST = [
  { n: 1, name: 'DESERT SAND', role: 'outdoor floor', draw: drawDesert, noOutline: true },
  { n: 2, name: 'SANDSTONE BRICK', role: 'tomb floor', draw: drawBrick, noOutline: true },
  { n: 3, name: 'GLYPH CAUSEWAY', role: 'paths', draw: drawCauseway, noOutline: true },
  { n: 4, name: 'TOMB DARK', role: 'corridors', draw: drawTombDark, noOutline: true },
  { n: 5, name: 'ROYAL GOLD', role: 'boss arena', draw: drawRoyal, noOutline: true },
  { n: 6, name: 'CRACKED CLAY', role: 'outdoor variant', draw: drawClay, noOutline: true },
  { n: 7, name: 'LAPIS HALL', role: 'sacred rooms', draw: drawLapisHall, noOutline: true },
  { n: 8, name: 'QUICKSAND', role: 'hazard pits', draw: drawQuicksand, noOutline: true },
  { n: 9, name: 'REED MAT', role: 'camp accent', draw: drawReedMat, noOutline: true },
  { n: 10, name: 'OBSIDIAN SEAL', role: 'inner sanctum', draw: drawObsidianSeal, noOutline: true },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'pyramid_tile_options.png',
  title: 'PYRAMID PLUNDER — MAP TILE CANDIDATES (each shown tiling 2x2)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
