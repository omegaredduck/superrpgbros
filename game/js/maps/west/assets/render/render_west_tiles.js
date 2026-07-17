// artdev/west/render_west_tiles.js — 10 numbered WILD WEST TOWN ground
// tile candidates (full-cell seamless-ish textures).
'use strict';
const KIT = require('./west_kit.js');
const { W, mix, clamp, ell, row, stroke, renderSheet } = KIT;

// tiny deterministic noise
function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }

function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }

// 1 · PACKED DIRT STREET — main drag, wheel ruts
function drawDirt(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(W.sand, W.sandDk, n2(x * 0.5, y * 0.5) * 0.45 + n2(x * 0.07, y * 0.07) * 0.35);
    const rut = Math.abs(((y + x * 0.08) % (S * 0.5)) - S * 0.25);
    if (rut < 2.5) b = mix(b, W.sandDkk, 0.4); // wheel ruts
    if (n2(x, y) > 0.965) b = mix(b, W.sandDkk, 0.6); // pebbles
    if (n2(x + 9, y) > 0.975) b = mix(b, W.sandLt, 0.7);
    return b;
  });
}
// 2 · BOARDWALK PLANKS
function drawPlanks(put, S) {
  fill(put, S, (x, y) => {
    const plankRow = Math.floor(y / (S * 0.125));
    const off = (plankRow % 2) * S * 0.25;
    let b = mix(W.woodLt, W.wood, n2(plankRow, Math.floor((x + off) / (S * 0.5))) * 0.7);
    b = mix(b, W.woodDk, n2(x * 0.8, y * 0.15) * 0.3);
    if (y % Math.round(S * 0.125) === 0) b = mix(b, W.woodDkk, 0.7);
    if ((x + off) % Math.round(S * 0.5) === 0) b = mix(b, W.woodDkk, 0.6);
    if (n2(x * 0.3, plankRow * 7) > 0.7 && (y % Math.round(S * 0.125)) > 3 && x % 9 === 4) b = mix(b, W.woodDk, 0.5); // grain
    return b;
  });
}
// 3 · DESERT SAND — dune ripples
function drawSand(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(W.sandLt, W.sand, n2(x * 0.06, y * 0.06) * 0.8);
    const rip = Math.sin((y + Math.sin(x * 0.05) * 8) * 0.35);
    if (rip > 0.7) b = mix(b, W.sandDk, 0.35);
    if (rip < -0.8) b = mix(b, '#f8e0b0', 0.3);
    if (n2(x, y) > 0.985) b = mix(b, W.sandDkk, 0.4);
    return b;
  });
}
// 4 · DRY CRACKED EARTH
function drawCracked(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#b89468', '#8a6a44', n2(x * 0.08, y * 0.08) * 0.7);
    // voronoi-ish crack lines
    const cs = S * 0.22;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    if (Math.sqrt(d2) - Math.sqrt(d1) < 2.2) b = mix(b, '#4a3620', 0.75);
    return b;
  });
}
// 5 · RAIL BED — gravel + sleepers + rails
function drawRailbed(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#9a8a72', '#6a5c48', n2(x * 0.9, y * 0.9) * 0.8); // gravel
    if (n2(x + 3, y + 5) > 0.94) b = mix(b, '#c8b898', 0.6);
    const sy = y % Math.round(S * 0.33);
    if (sy > S * 0.1 && sy < S * 0.22) { // sleeper
      b = mix(W.woodDk, W.wood, n2(Math.floor(y / (S * 0.33)), x * 0.1) * 0.5);
      if (sy === Math.round(S * 0.1) + 1 || sy === Math.round(S * 0.22) - 1) b = mix(b, W.woodDkk, 0.6);
    }
    if (Math.abs(x - S * 0.25) < 2 || Math.abs(x - S * 0.75) < 2) b = W.iron; // rails
    if (Math.abs(x - S * 0.25 + 2.4) < 0.8 || Math.abs(x - S * 0.75 + 2.4) < 0.8) b = W.ironLt;
    return b;
  });
}
// 6 · SALOON FLOORBOARDS — interior, warm + bottle stains
function drawFloor(put, S) {
  fill(put, S, (x, y) => {
    const plankCol = Math.floor(x / (S * 0.166));
    let b = mix('#a87848', '#7a5430', n2(plankCol, Math.floor(y / (S * 0.6))) * 0.6);
    b = mix(b, '#5a3c20', n2(x * 0.12, y * 0.7) * 0.3);
    if (x % Math.round(S * 0.166) === 0) b = mix(b, '#34281c', 0.7);
    if (y % Math.round(S * 0.5) === Math.round(plankCol * 13) % Math.round(S * 0.5)) b = mix(b, '#34281c', 0.5);
    const st = ((x - S * 0.7) ** 2 + (y - S * 0.3) ** 2);
    if (st < 30 && st > 12) b = mix(b, '#48301a', 0.5); // bottle ring stain
    return b;
  });
}
// 7 · DUEL CIRCLE — chalked ring on dirt (boss/duel ground)
function drawDuel(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(W.sand, W.sandDk, n2(x * 0.4, y * 0.4) * 0.4 + n2(x * 0.06, y * 0.06) * 0.3);
    const d = Math.sqrt((x - S / 2) ** 2 + (y - S / 2) ** 2);
    if (Math.abs(d - S * 0.42) < 2.2) b = mix(b, W.bone, 0.8);          // chalk ring
    if (Math.abs(d - S * 0.34) < 1.2) b = mix(b, W.redDk, 0.55);        // inner blood-red ring
    // center star
    if (d < S * 0.05 && (Math.abs(x - S / 2) < 1.4 || Math.abs(y - S / 2) < 1.4)) b = mix(b, W.bone, 0.7);
    if (n2(x, y) > 0.975) b = mix(b, W.sandDkk, 0.5);
    // boot scuffs
    if (n2(x * 0.2 + 5, y * 0.2) > 0.9 && d < S * 0.4) b = mix(b, W.sandDkk, 0.3);
    return b;
  });
}
// 8 · SCRUB GRASS — dry patchy grass
function drawScrub(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(W.sand, '#a89858', n2(x * 0.07, y * 0.07) * 0.9);
    const tuft = n2(Math.floor(x / 7), Math.floor(y / 7));
    if (tuft > 0.55) {
      const ph = n2(Math.floor(x / 7) + 3, Math.floor(y / 7) + 1);
      b = mix(b, ph > 0.5 ? '#7e8a4a' : W.cactusDk, 0.35 + n2(x * 1.3, y * 1.3) * 0.4);
      if ((x + y * 2) % 5 === 0) b = mix(b, '#9aa860', 0.4); // blade flecks
    }
    if (n2(x + 4, y + 8) > 0.98) b = mix(b, '#d8c890', 0.7);
    return b;
  });
}
// 9 · ROCKY MESA — red-rock slab
function drawMesa(put, S) {
  fill(put, S, (x, y) => {
    const strat = Math.sin(y * 0.18 + Math.sin(x * 0.04) * 2.5);
    let b = mix('#b06a44', '#7a4228', (strat + 1) / 2 * 0.7);
    b = mix(b, '#5a2e1a', n2(x * 0.1, y * 0.1) * 0.35);
    if (strat > 0.85) b = mix(b, '#d08858', 0.4);
    // fissures
    if (n2(Math.floor(x / 22), Math.floor(y / 9)) > 0.8 && (x % 22) < 1.5) b = mix(b, '#3a1e10', 0.7);
    if (n2(x, y) > 0.98) b = mix(b, '#d8a070', 0.5);
    return b;
  });
}
// 10 · TUMBLEWEED FLATS — sand + rolling tracks + dead brush
function drawFlats(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(W.sandLt, W.sandDk, n2(x * 0.05, y * 0.05) * 0.75);
    // winding tumbleweed track
    const tr = Math.abs(y - (S * 0.5 + Math.sin(x * 0.11) * S * 0.18));
    if (tr < 1.6) b = mix(b, W.sandDkk, 0.35);
    if (tr > 1.6 && tr < 3) b = mix(b, W.sandLt, 0.3);
    // dead brush dots
    if (n2(Math.floor(x / 11), Math.floor(y / 11)) > 0.82 && n2(x * 1.7, y * 1.7) > 0.6) b = mix(b, '#6e5838', 0.55);
    if (n2(x + 1, y + 2) > 0.985) b = mix(b, '#4a3820', 0.5);
    return b;
  });
}

const LIST = [
  { n: 1, name: 'PACKED DIRT', role: 'main street + ruts', draw: drawDirt, noOutline: true },
  { n: 2, name: 'BOARDWALK', role: 'building aprons', draw: drawPlanks, noOutline: true },
  { n: 3, name: 'DESERT SAND', role: 'outskirts dunes', draw: drawSand, noOutline: true },
  { n: 4, name: 'CRACKED EARTH', role: 'dry lakebed', draw: drawCracked, noOutline: true },
  { n: 5, name: 'RAIL BED', role: 'tracks strip', draw: drawRailbed, noOutline: true },
  { n: 6, name: 'SALOON FLOOR', role: 'interior boards', draw: drawFloor, noOutline: true },
  { n: 7, name: 'DUEL CIRCLE', role: 'high-noon ground', draw: drawDuel, noOutline: true },
  { n: 8, name: 'SCRUB GRASS', role: 'patchy dry green', draw: drawScrub, noOutline: true },
  { n: 9, name: 'ROCKY MESA', role: 'red-rock slab', draw: drawMesa, noOutline: true },
  { n: 10, name: 'TUMBLEWEED FLATS', role: 'tracked sand', draw: drawFlats, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'west_tile_options.png', title: 'WILD WEST TOWN — GROUND TILE CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
