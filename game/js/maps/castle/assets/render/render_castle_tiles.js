// artdev/castle/render_castle_tiles.js — 10 VAMPIRE CASTLE map-tile
// candidates (each cell tiles 2x2).
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp, renderSheet } = KIT;
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function tiled(base) { return (put, S) => { const T = S / 2; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2); if (c) put(x, y, c); } }; }

// 1 · CASTLE FLAGSTONE — cool purple-grey stone (main interior floor).
const drawFlagstone = tiled((x, y, T, q) => {
  const bh = T / 4, bw = T / 2, rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
  const bx = Math.floor((x + off) / bw);
  let b = mix(G.stone, G.stoneDk, 0.25 + h2(bx + q * 3, rowI, 7) * 0.5);
  b = mix(b, G.stoneDkk, h2(x, y, 8) * 0.2);
  if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
  if (h2(x, y, 9) > 0.995) b = G.stoneLt;
  return b;
});

// 2 · BALLROOM CHECKER — polished black/white marble (the waltz floor).
const drawBallroom = tiled((x, y, T, q) => {
  const cs = T / 4, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const alt = (cxi + cyi) % 2 === 0;
  let b = alt ? mix('#e0e0e8', '#b8b8c8', 0.2 + h2(cxi, cyi, 12) * 0.3) : mix('#26243a', G.oil, 0.3 + h2(cxi, cyi, 13) * 0.3);
  // polish sheen
  if (Math.sin((x + y) * 0.35 + q) > 0.94) b = mix(b, '#ffffff', alt ? 0.5 : 0.2);
  if (x % cs < 1 || y % cs < 1) b = mix(b, G.night, 0.6);
  return b;
});

// 3 · PARQUET — herringbone wood (great hall).
const drawParquet = tiled((x, y, T, q) => {
  const s = 8, gx = Math.floor(x / s), gy = Math.floor(y / s);
  const diag = (gx + gy) % 2 === 0;
  const inX = x % s, inY = y % s;
  const stripe = diag ? inX : inY;
  let b = mix(G.wood, G.woodDk, 0.2 + h2(gx, gy, 20) * 0.4);
  if (Math.sin(stripe * 1.2 + h2(gx, gy, 21) * 6) > 0.5) b = mix(b, G.woodDkk, 0.35);
  if ((diag ? inY : inX) < 1) b = G.woodDkk;
  return b;
});

// 4 · COURTYARD COBBLE — moonlit rounded stones.
const drawCourtyard = tiled((x, y, T, q) => {
  const cs = T / 5, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const jx = (h2(cxi, cyi, 30) - 0.5) * 3, jy = (h2(cxi, cyi, 31) - 0.5) * 3;
  const dx = (x % cs) - cs / 2 - jx, dy = (y % cs) - cs / 2 - jy;
  const d = Math.sqrt(dx * dx + dy * dy) / (cs * 0.6);
  if (d > 1) return G.night;
  let b = mix(G.stoneLt, G.stoneDk, 0.25 + h2(cxi, cyi, 32) * 0.5 + d * 0.3);
  if (dy < -cs * 0.15 && d < 0.7) b = mix(b, G.moon, 0.25); // moonlit tops
  return b;
});

// 5 · BLOODSTAINED STONE — flagstone w/ dark seeped stains.
const drawBloodstone = tiled((x, y, T, q) => {
  const bh = T / 4, bw = T / 2, rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
  let b = mix(G.stone, G.stoneDk, 0.3 + h2(Math.floor((x + off) / bw) + q, rowI, 40) * 0.4);
  if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
  // seeping stains pooling from grout
  const s1 = h2(x >> 3, y >> 3, 44);
  if (s1 > 0.72) {
    const local = Math.sin(x * 0.7) * Math.sin(y * 0.8);
    if (local > -0.2) b = mix(b, s1 > 0.88 ? G.wine : G.bloodDk, 0.55);
  }
  return b;
});

// 6 · CRYPT BONE TILE — dark slabs w/ inlaid bone borders.
const drawCryptTile = tiled((x, y, T, q) => {
  let b = mix('#2c2638', G.oil, 0.3 + h2(x >> 1, y >> 1, 50) * 0.5);
  const cs = T / 2;
  if (x % cs < 2 || y % cs < 2) b = mix(G.bone, G.boneDk, h2(x, y, 51) * 0.6);
  // tiny skull stamp at intersections
  const ix = x % cs, iy = y % cs;
  if (ix > cs / 2 - 4 && ix < cs / 2 + 4 && iy > cs / 2 - 4 && iy < cs / 2 + 4) {
    const dx = ix - cs / 2, dy = iy - cs / 2;
    if (dx * dx + dy * dy < 9) b = mix(G.boneDk, '#2c2638', (dy + 3) / 6);
    if ((dx === -1 || dx === 1) && dy === 0) b = G.oil;
  }
  return b;
});

// 7 · MOONLIGHT POOL — floor washed in pale window-light (accent).
const drawMoonPool = tiled((x, y, T, q) => {
  let b = mix(G.stoneDk, G.night, 0.4 + h2(x >> 2, y >> 2, 60) * 0.3);
  // diagonal light shafts
  const band = ((x - y * 0.5 + q * 9) % 34 + 34) % 34;
  if (band < 12) {
    b = mix(b, G.moonLt, 0.5 - band / 12 * 0.3);
    // mullion shadow lines inside the shaft
    if (band > 4 && band < 6) b = mix(b, G.night, 0.5);
  }
  if (h2(x, y, 62) > 0.996) b = G.moonLt;
  return b;
});

// 8 · ROSE MOSAIC — round stained-glass-pattern floor (chapel accent).
const drawRoseMosaic = tiled((x, y, T, q) => {
  const dx = x % T - T / 2, dy = y % T - T / 2;
  const rad = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  const panes = [G.gRed, G.gBlue, G.velvetLt, G.gAmber];
  if (rad > T * 0.46) {
    let b = mix(G.stoneDk, G.stoneDkk, h2(x, y, 70) * 0.5);
    if (rad < T * 0.5) b = G.goldDk;
    return b;
  }
  const petal = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 8 + rad * 0.1) % 4;
  let b = mix(panes[petal], '#0c0a10', rad / (T * 0.46) * 0.4);
  if (Math.abs(Math.sin(ang * 4 + rad * 0.2)) > 0.93) b = G.ironDkk;
  [0.12, 0.3].forEach(rr => { if (Math.abs(rad - T * rr) < 1.2) b = G.goldDk; });
  if (rad < 3) b = G.gold;
  return b;
});

// 9 · RED VELVET — carpeted floor (throne room / royal wing).
const drawVelvetFloor = tiled((x, y, T, q) => {
  let b = mix(G.blood, G.wine, 0.35 + h2(x >> 1, y >> 1, 80) * 0.35);
  // damask diamond pattern
  const px = x / 9, py = y / 9;
  if (Math.sin(px * 3.14) * Math.sin(py * 3.14) > 0.6) b = mix(b, G.bloodDk, 0.55);
  if ((Math.abs(Math.sin(px * 3.14)) < 0.08 || Math.abs(Math.sin(py * 3.14)) < 0.08) && h2(x, y, 81) > 0.3) b = mix(b, G.gold, 0.25);
  return b;
});

// 10 · TOURNEY FIELD — packed earth + chalk lanes (the joust arena!).
const drawTourney = tiled((x, y, T, q) => {
  let b = mix('#7a5c40', '#57402c', 0.3 + h2(x >> 1, y >> 1, 90) * 0.45);
  // hoof-churned texture
  if (h2(x, y, 91) > 0.93) b = mix(b, '#3a2a1c', 0.5);
  if (h2(x, y, 92) > 0.985) b = mix(b, G.bone, 0.3);
  // chalk lane lines (the tilt lanes)
  if (y % (T / 2) < 2) b = mix(b, '#e8e4d8', 0.75);
  // scattered straw
  if (h2(x >> 1, y, 93) > 0.975 && x % 5 < 3) b = mix(b, G.gold, 0.4);
  return b;
});

const LIST = [
  { n: 1, name: 'CASTLE FLAGSTONE', role: 'main floor', draw: drawFlagstone, noOutline: true },
  { n: 2, name: 'BALLROOM CHECKER', role: 'waltz floor', draw: drawBallroom, noOutline: true },
  { n: 3, name: 'PARQUET', role: 'great hall', draw: drawParquet, noOutline: true },
  { n: 4, name: 'COURTYARD COBBLE', role: 'outdoors', draw: drawCourtyard, noOutline: true },
  { n: 5, name: 'BLOODSTAINED STONE', role: 'dungeon wing', draw: drawBloodstone, noOutline: true },
  { n: 6, name: 'CRYPT BONE TILE', role: 'crypt', draw: drawCryptTile, noOutline: true },
  { n: 7, name: 'MOONLIGHT POOL', role: 'window light', draw: drawMoonPool, noOutline: true },
  { n: 8, name: 'ROSE MOSAIC', role: 'chapel accent', draw: drawRoseMosaic, noOutline: true },
  { n: 9, name: 'RED VELVET', role: 'royal wing', draw: drawVelvetFloor, noOutline: true },
  { n: 10, name: 'TOURNEY FIELD', role: 'JOUST ARENA', draw: drawTourney, noOutline: true },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'castle_tile_options.png',
  title: 'VAMPIRE CASTLE — MAP TILE CANDIDATES (each shown tiling 2x2)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
