// artdev/skyisles/render_sky_tiles.js — 10 numbered STORM SKY ISLES map-tile
// candidates (each cell = the texture tiling a 2x2 preview), one PNG grid.
//   RANGER_PATH=<ranger_art.js> node render_sky_tiles.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, ell, row, stroke, renderSheet, zig } = KIT;

// deterministic hash noise
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

// each draw fills the whole S x S cell as a 2x2 tiling of an 80px base tile
function tiled(base) {
  return (put, S) => {
    const T = S / 2;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2);
      if (c) put(x, y, c);
    }
  };
}

// 1 · SKYSTONE FLAGS — pale flagstones, the main island floor.
const drawSkystone = tiled((x, y, T, q) => {
  const gx = Math.floor(x / (T / 2)), gy = Math.floor(y / (T / 2));
  const lx = x % (T / 2), ly = y % (T / 2);
  const id = gx + gy * 2 + q * 4;
  let b = mix(K.stoneLt, K.stone, 0.25 + h2(gx + q * 7, gy, 3) * 0.5);
  b = mix(b, K.stoneDk, h2(x, y, 1) * 0.22);
  if (lx < 2 || ly < 2) b = mix(b, K.stoneDkk, 0.65);
  if (lx === 2 || ly === 2) b = mix(b, K.marbleLt, 0.2);
  if (h2(x, y, id) > 0.985) b = mix(b, K.marbleLt, 0.5);
  return b;
});

// 2 · ISLAND TURF — windswept meadow grass w/ streaks + tiny blooms.
const drawTurf = tiled((x, y, T, q) => {
  let b = mix(K.grass, K.grassDk, h2(x >> 1, y >> 1, 5) * 0.55);
  const wind = Math.sin((x + y * 0.3) * 0.35 + q) > 0.86;
  if (wind) b = mix(b, K.grassLt, 0.6);
  if (h2(x, y, 9) > 0.988) b = K.grassLt;
  if (h2(x, y, 11) > 0.995) b = '#ffffff';
  if (h2(x, y, 13) > 0.996) b = K.sky;
  return b;
});

// 3 · TEMPLE MARBLE — big checker slabs w/ brass joins.
const drawTempleMarble = tiled((x, y, T, q) => {
  const cs = T / 2, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const alt = (cxi + cyi) % 2 === 0;
  let b = alt ? mix(K.marbleLt, K.marble, 0.3 + h2(x >> 2, y >> 2, 2) * 0.4)
    : mix(K.cloudMd, K.cloudDk, 0.3 + h2(x >> 2, y >> 2, 4) * 0.4);
  // veins
  if (Math.sin(x * 0.5 + y * 0.9 + h2(cxi, cyi, 6) * 9) > 0.94) b = mix(b, alt ? K.marbleDk : K.cloudDkk, 0.7);
  if (x % cs < 1.5 || y % cs < 1.5) b = K.brassDk;
  if (x % cs < 0.8 && y % cs < 0.8) b = K.brass;
  return b;
});

// 4 · CLOUD SEA — the soft "water" between islands (slows you).
const drawCloudSea = tiled((x, y, T, q) => {
  const s1 = Math.sin(x * 0.16 + y * 0.1 + q * 2) + Math.sin(y * 0.2 - x * 0.06);
  let b = mix(K.cloud, K.cloudMd, 0.4 + s1 * 0.22);
  if (s1 > 1.15) b = mix(b, '#ffffff', 0.75);
  if (s1 < -1.3) b = mix(b, K.cloudDk, 0.6);
  if (h2(x, y, 21) > 0.993) b = '#ffffff';
  return b;
});

// 5 · COBBLE PATH — rounded skystone cobbles for the lantern trail.
const drawCobble = tiled((x, y, T, q) => {
  const cs = T / 4;
  const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const jx = (h2(cxi, cyi, 7) - 0.5) * 3, jy = (h2(cxi, cyi, 8) - 0.5) * 3;
  const dx = (x % cs) - cs / 2 - jx, dy = (y % cs) - cs / 2 - jy;
  const d = Math.sqrt(dx * dx + dy * dy) / (cs * 0.62);
  if (d > 1) return K.dirtDk;
  let b = mix(K.stoneLt, K.stoneDk, 0.15 + h2(cxi, cyi, 12) * 0.55 + d * 0.35);
  if (dy < -cs * 0.18 && d < 0.7) b = mix(b, K.marbleLt, 0.3);
  return b;
});

// 6 · DOCK PLANKS — weathered boards w/ nails (bridges/docks).
const drawPlanks = tiled((x, y, T, q) => {
  const ph = T / 4, rowI = Math.floor(y / ph);
  const off = (rowI % 2) * (T / 2);
  const px = (x + off) % T;
  let b = mix(K.wood, K.woodDk, 0.2 + h2(rowI + q * 3, 0, 15) * 0.45);
  // grain
  if (Math.sin(px * 0.5 + rowI * 2 + h2(rowI, q, 16) * 6) > 0.75) b = mix(b, K.woodDkk, 0.5);
  if (y % ph < 1.5) b = K.woodDkk;
  const seam = Math.abs(px - T * 0.5) < 1 || px < 1;
  if (seam) b = mix(b, K.woodDkk, 0.8);
  // nails at seams
  if (seam && (y % ph > ph * 0.3 && y % ph < ph * 0.3 + 2)) b = K.ironDk;
  return b;
});

// 7 · RUNE SKYSTONE — dark storm-stone w/ glowing carved runes.
const drawRuneStone = tiled((x, y, T, q) => {
  let b = mix(K.thunderDk, K.thunderDkk, h2(x >> 1, y >> 1, 18) * 0.6);
  if ((x % (T / 2) < 1.5) || (y % (T / 2) < 1.5)) b = mix(b, K.oil, 0.6);
  // rune strokes: sparse glowing segments on a coarse lattice
  const gx = Math.floor(x / 8), gy = Math.floor(y / 8);
  const r = h2(gx, gy, q + 30);
  if (r > 0.82) {
    const inX = x % 8, inY = y % 8;
    const seg = r > 0.94 ? (inX > 2 && inX < 6 && inY === 4) : (inX === 4 && inY > 1 && inY < 7);
    if (seg) return mix(K.volt, K.voltLt, h2(x, y, 31));
  }
  return b;
});

// 8 · CRACKED SKYSTONE — weathered floor, static glowing in the cracks.
const drawCracked = tiled((x, y, T, q) => {
  let b = mix(K.stone, K.stoneDk, 0.3 + h2(x >> 1, y >> 1, 40) * 0.45);
  // meandering cracks
  const c1 = Math.abs(y - (T * 0.3 + Math.sin(x * 0.32 + q) * 5)) < 1;
  const c2 = Math.abs(x - (T * 0.65 + Math.sin(y * 0.27 + q * 2) * 5)) < 1;
  if (c1 || c2) {
    return h2(x, y, 44) > 0.6 ? K.voltDk : K.oil;
  }
  if (Math.abs(y - (T * 0.3 + Math.sin(x * 0.32 + q) * 5)) < 2.4 || Math.abs(x - (T * 0.65 + Math.sin(y * 0.27 + q * 2) * 5)) < 2.4)
    b = mix(b, K.stoneDkk, 0.5);
  if (h2(x, y, 47) > 0.99) b = K.marbleLt;
  return b;
});

// 9 · STORM MOSAIC — tiny tesserae forming spiral gale motifs.
const drawMosaic = tiled((x, y, T, q) => {
  const ms = 4, mx = Math.floor(x / ms), my = Math.floor(y / ms);
  if (x % ms < 1 || y % ms < 1) return K.stoneDkk;
  // spiral field
  const dx = (x % T) - T / 2, dy = (y % T) - T / 2;
  const ang = Math.atan2(dy, dx), rad = Math.sqrt(dx * dx + dy * dy);
  const spiral = Math.sin(ang * 2 + rad * 0.28 - q);
  let b;
  if (spiral > 0.45) b = mix(K.sky, K.skyDk, h2(mx, my, 52) * 0.5);
  else if (spiral < -0.6) b = mix(K.indigoLt, K.indigoDk, h2(mx, my, 53) * 0.5);
  else b = mix(K.marbleLt, K.marbleDk, 0.2 + h2(mx, my, 54) * 0.5);
  if (rad < 3) b = K.gold;
  return b;
});

// 10 · STORMGLASS — fused black glass w/ branching lightning veins
//      (boss-arena floor).
const drawStormglass = tiled((x, y, T, q) => {
  let b = mix(K.thunderDkk, K.oil, 0.4 + h2(x >> 2, y >> 2, 60) * 0.4);
  // glossy sheen bands
  if (Math.sin((x - y) * 0.18 + q) > 0.92) b = mix(b, K.indigoLt, 0.3);
  // branching Lichtenberg veins from tile center
  const dx = (x % T) - T / 2, dy = (y % T) - T / 2;
  const ang = Math.atan2(dy, dx), rad = Math.sqrt(dx * dx + dy * dy);
  const branch = Math.abs(Math.sin(ang * 3 + Math.sin(rad * 0.5) * 0.8));
  if (branch > 0.985 && rad > 4 && rad < T * 0.52) return mix(K.volt, K.voltLt, h2(x, y, 61));
  if (branch > 0.96 && rad > 4 && rad < T * 0.52) b = mix(b, K.voltDk, 0.55);
  if (rad < 3.4) return K.voltLt;
  return b;
});

// ========================================================================
const LIST = [
  { n: 1, name: 'SKYSTONE FLAGS', role: 'main floor', draw: drawSkystone, noOutline: true },
  { n: 2, name: 'ISLAND TURF', role: 'grass', draw: drawTurf, noOutline: true },
  { n: 3, name: 'TEMPLE MARBLE', role: 'ruins floor', draw: drawTempleMarble, noOutline: true },
  { n: 4, name: 'CLOUD SEA', role: 'between islands', draw: drawCloudSea, noOutline: true },
  { n: 5, name: 'COBBLE PATH', role: 'trails', draw: drawCobble, noOutline: true },
  { n: 6, name: 'DOCK PLANKS', role: 'bridges/docks', draw: drawPlanks, noOutline: true },
  { n: 7, name: 'RUNE SKYSTONE', role: 'shrine floor', draw: drawRuneStone, noOutline: true },
  { n: 8, name: 'CRACKED SKYSTONE', role: 'weathered floor', draw: drawCracked, noOutline: true },
  { n: 9, name: 'STORM MOSAIC', role: 'temple accent', draw: drawMosaic, noOutline: true },
  { n: 10, name: 'STORMGLASS', role: 'boss arena', draw: drawStormglass, noOutline: true },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'sky_tile_options.png',
  title: 'STORM SKY ISLES — MAP TILE CANDIDATES (each shown tiling 2x2)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
