// artdev/underworld/render_eternal_tiles.js — VICE VERSA ground tiles:
// 10 candidates (4 hell, 4 holy, river + split bridge). Full-cell
// textures, smooth value-noise (neon take-2 lesson: no blob stamps).
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, clamp, ell, row, stroke, renderSheet } = KIT;
const G = {
  marble: '#f2efe6', marbleDk: '#a8a496', gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
  holy: '#fff2c0', holyLt: '#fffdf0', wing: '#f8f6ee', wingDk: '#b0aa98', white: '#ffffff'
};

// smooth value noise
function h2(ix, iy, seed) { const s = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
function sn(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy, seed), b = h2(ix + 1, iy, seed), c = h2(ix, iy + 1, seed), d = h2(ix + 1, iy + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// 1 BRIMSTONE WASTE — hell base
function tBrimstone(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 22, y / 22, 1) * 0.65 + sn(x / 7, y / 7, 2) * 0.35;
    let c = mix(H.rockLt, H.rockDk, clamp(n * 1.35, 0, 1));
    if (n > 0.78) c = mix(c, H.lavaDk, 0.4); // hot patches
    put(x, y, c);
  }
  // hairline glowing cracks
  for (let k = 0; k < 3; k++) {
    let cx2 = h2(k, 7, 3) * S, cy2 = h2(k, 11, 3) * S;
    for (let i = 0; i < 26; i++) {
      const a = sn(cx2 / 30, cy2 / 30, 4) * 6.28;
      const nx = cx2 + Math.cos(a) * 4, ny = cy2 + Math.sin(a) * 4;
      stroke(put, cx2, cy2, nx, ny, 1, () => (i % 3 ? H.lavaDk : mix(H.lava, H.lavaDk, 0.4)));
      cx2 = (nx + S) % S; cy2 = (ny + S) % S;
    }
  }
}

// 2 ASH FLATS — hell fields
function tAsh(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 26, y / 26, 5) * 0.6 + sn(x / 9, y / 9, 6) * 0.4;
    put(x, y, mix('#5a525e', '#2a242e', clamp(n * 1.3, 0, 1)));
  }
  // drifts + a few dead cinders
  for (let k = 0; k < 5; k++) {
    const dx = h2(k, 3, 7) * S, dy = h2(k, 9, 7) * S, dw = 10 + h2(k, 5, 7) * 14;
    for (let i = 0; i < dw; i++) put(Math.round((dx + i) % S), Math.round(dy + Math.sin(i * 0.5) * 1.6), mix('#6a6270', '#3a3440', h2(i, k, 8)));
  }
  [[0.2, 0.3], [0.7, 0.6], [0.4, 0.85]].forEach(([fx, fy], i) => { put(Math.round(fx * S), Math.round(fy * S), i % 2 ? H.ember : '#7a4a2e'); });
}

// 3 OBSIDIAN PAVING — hell roads/structures
function tObsidian(put, S) {
  const cell = S / 4;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const gx = x % cell, gy = y % cell;
    const edge = gx < 1.6 || gy < 1.6;
    const n = sn(x / 14, y / 14, 9);
    let c = edge ? H.obsidDk : mix(H.obsidLt, H.obsid, clamp(n * 1.25, 0, 1));
    if (!edge && n > 0.8) c = mix(c, '#6a5a7a', 0.5); // glassy glint
    put(x, y, c);
  }
  // one slab has a fel rune
  const rx = cell * 2.5, ry = cell * 1.5;
  for (let a = 0; a < 6.28; a += 0.25) put(Math.round(rx + Math.cos(a) * cell * 0.26), Math.round(ry + Math.sin(a) * cell * 0.26), mix(H.fel, H.obsid, 0.35));
  stroke(put, rx - 3, ry + 3, rx + 3, ry - 3, 1, () => mix(H.fel, H.obsid, 0.25));
}

// 4 SCORCHED BONE LITTER — hell battlefield
function tBoneLitter(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 20, y / 20, 10) * 0.7 + sn(x / 6, y / 6, 11) * 0.3;
    put(x, y, mix('#42303a', '#1c1218', clamp(n * 1.3, 0, 1)));
  }
  // scattered bone fragments (short strokes + joints)
  for (let k = 0; k < 9; k++) {
    const bx = h2(k, 13, 12) * S, by = h2(k, 17, 12) * S, a = h2(k, 19, 12) * 6.28, ln = 5 + h2(k, 23, 12) * 7;
    stroke(put, bx, by, bx + Math.cos(a) * ln, by + Math.sin(a) * ln, 1.6, () => mix(H.bone, H.boneDk, h2(k, 29, 12) * 0.5));
    put(Math.round(bx), Math.round(by), H.boneDk);
  }
  // one half-buried skull
  ell(put, S * 0.68, S * 0.72, S * 0.045, S * 0.04, (tx, ty) => mix(H.bone, H.boneDk, clamp(tx + ty * 0.5, 0, 1)));
  put(Math.round(S * 0.665), Math.round(S * 0.715), H.night);
}

// 5 HOLY MARBLE — holy base
function tMarble(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 24, y / 24, 13) * 0.6 + sn(x / 8, y / 8, 14) * 0.4;
    put(x, y, mix(G.white, G.marbleDk, clamp(n * 0.85, 0, 1)));
  }
  // gold veins (wandering hairlines)
  for (let k = 0; k < 3; k++) {
    let vx = h2(k, 31, 15) * S, vy = 0;
    while (vy < S) {
      const nx = vx + (sn(vx / 18, vy / 18, 16) - 0.5) * 7, ny = vy + 3;
      stroke(put, vx, vy, nx, ny, 0.9, () => mix(G.gold, G.marbleDk, 0.35 + h2(vx | 0, vy | 0, 17) * 0.3));
      vx = (nx + S) % S; vy = ny;
    }
  }
}

// 6 GOLDEN PATH — holy roads
function tGoldPath(put, S) {
  const cell = S / 5;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    // offset brick courses
    const rowI = Math.floor(y / cell);
    const gx = (x + (rowI % 2) * cell * 0.5) % cell, gy = y % cell;
    const edge = gx < 1.4 || gy < 1.4;
    const n = sn(x / 12, y / 12, 18);
    let c = edge ? G.goldDk : mix(G.goldLt, G.gold, clamp(n * 1.2, 0, 1));
    if (!edge && n > 0.82) c = mix(c, G.white, 0.45); // polished glint
    put(x, y, c);
  }
}

// 7 CLOUD MEADOW — holy fields
function tCloud(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 20, y / 20, 19) * 0.55 + sn(x / 7, y / 7, 20) * 0.45;
    let c = mix(G.white, '#aab6c8', clamp(n * 1.05, 0, 1));
    if (n < 0.22) c = mix(c, G.holyLt, 0.5); // sunlit hollows
    put(x, y, c);
  }
  // wisps curling
  for (let k = 0; k < 4; k++) {
    const wx = h2(k, 37, 21) * S, wy = h2(k, 41, 21) * S;
    for (let a = 0; a < 3.6; a += 0.12) put(Math.round(wx + Math.cos(a) * (3 + a * 1.6)), Math.round(wy + Math.sin(a) * (2 + a * 1.1)), mix(G.white, '#c8d2de', 0.3));
  }
}

// 8 SANCTIFIED FIELD — holy grass w/ light motes
function tField(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 18, y / 18, 22) * 0.6 + sn(x / 5, y / 5, 23) * 0.4;
    put(x, y, mix('#9ac87a', '#4a7a42', clamp(n * 1.25, 0, 1)));
  }
  // blade ticks + glowing motes + tiny white flowers
  for (let k = 0; k < 26; k++) {
    const gx = h2(k, 43, 24) * S, gy = h2(k, 47, 24) * S;
    stroke(put, gx, gy, gx + (h2(k, 53, 24) - 0.5) * 2, gy - 3, 0.8, () => mix('#c8e8a0', '#4a7a42', h2(k, 59, 24)));
  }
  [[0.25, 0.3], [0.6, 0.7], [0.85, 0.2]].forEach(([fx, fy]) => { put(Math.round(fx * S), Math.round(fy * S), G.white); put(Math.round(fx * S), Math.round(fy * S - 1), G.holyLt); });
  [[0.45, 0.15], [0.15, 0.8]].forEach(([mx, my]) => put(Math.round(mx * S), Math.round(my * S), G.holy));
}

// 9 RIVER OF SOULS — animated water (frame 1 of N)
function tRiver(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const flow = sn(x / 30 + y / 90, y / 16, 25) * 0.6 + sn(x / 9, y / 9, 26) * 0.4;
    let c = mix(H.soulDk, '#0a2a24', clamp(flow * 1.3, 0, 1));
    if (flow > 0.74) c = mix(c, H.soul, 0.45); // current highlights
    put(x, y, c);
  }
  // drifting soul faces in the current (the animation swaps their phase)
  [[0.22, 0.3, 0.5], [0.6, 0.62, 0.3], [0.82, 0.18, 0.6], [0.4, 0.85, 0.45]].forEach(([fx, fy, fd]) => {
    const sx2 = fx * S, sy2 = fy * S;
    ell(put, sx2, sy2, S * 0.028, S * 0.036, (tx, ty) => mix(mix(H.soulLt, H.soulDk, fd), H.soulDk, clamp(tx + ty * 0.4, 0, 1)));
    put(Math.round(sx2 - 1.5), Math.round(sy2 - 1), mix(H.night, H.soulDk, 0.4));
    put(Math.round(sx2 + 1.5), Math.round(sy2 - 1), mix(H.night, H.soulDk, 0.4));
    // wake trail
    for (let i = 1; i <= 6; i++) put(Math.round(sx2 - i * 2.4), Math.round(sy2 + Math.sin(i) * 1.2), mix(H.soul, H.soulDk, 0.4 + i * 0.09));
  });
}

// 10 THE BRIDGE — split tile: golden half / skull-and-bones half
function tBridge(put, S) {
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const n = sn(x / 12, y / 12, 27);
    if (x < S / 2) {
      // GOLDEN planks (holy end)
      const plank = Math.floor(y / (S / 8));
      const edge = y % (S / 8) < 1.4;
      let c = edge ? G.goldDk : mix(G.goldLt, G.gold, clamp(n * 1.2 + (plank % 2) * 0.12, 0, 1));
      if (!edge && n > 0.84) c = mix(c, G.white, 0.4);
      put(x, y, c);
    } else {
      // BONE lattice (hell end)
      const plank = Math.floor(y / (S / 8));
      const edge = y % (S / 8) < 1.4;
      let c = edge ? '#4a4238' : mix(H.bone, H.boneDk, clamp(n * 1.15 + (plank % 2) * 0.1, 0, 1));
      put(x, y, c);
    }
  }
  // the seam where they meet
  stroke(put, S / 2, 0, S / 2, S, 1.4, () => H.night);
  // skull bosses down the bone side + gold studs down the gold side
  for (let k = 0; k < 3; k++) {
    const sy2 = S * (0.18 + k * 0.32);
    ell(put, S * 0.75, sy2, S * 0.035, S * 0.032, (tx, ty) => mix('#f2ecd8', H.boneDk, clamp(tx + ty * 0.4 - 0.2, 0, 1)));
    put(Math.round(S * 0.74), Math.round(sy2), H.night); put(Math.round(S * 0.765), Math.round(sy2), H.night);
    ell(put, S * 0.25, sy2, S * 0.02, S * 0.02, (tx, ty) => mix(G.goldLt, G.goldDk, tx + ty * 0.4));
  }
}

const LIST = [
  { n: 1, name: 'BRIMSTONE WASTE', role: 'hell BASE — cracked, hot veins', draw: tBrimstone, noOutline: true },
  { n: 2, name: 'ASH FLATS', role: 'hell fields — drifts, cinders', draw: tAsh, noOutline: true },
  { n: 3, name: 'OBSIDIAN PAVING', role: 'hell roads — fel rune slab', draw: tObsidian, noOutline: true },
  { n: 4, name: 'BONE LITTER', role: 'hell battlefield scatter', draw: tBoneLitter, noOutline: true },
  { n: 5, name: 'HOLY MARBLE', role: 'holy BASE — gold veins', draw: tMarble, noOutline: true },
  { n: 6, name: 'GOLDEN PATH', role: 'holy roads — polished brick', draw: tGoldPath, noOutline: true },
  { n: 7, name: 'CLOUD MEADOW', role: 'holy fields — sunlit wisps', draw: tCloud, noOutline: true },
  { n: 8, name: 'SANCTIFIED FIELD', role: 'holy grass — motes + flowers', draw: tField, noOutline: true },
  { n: 9, name: 'RIVER OF SOULS', role: 'ANIMATED — faces drift the current', draw: tRiver, noOutline: true },
  { n: 10, name: 'THE BRIDGE', role: 'split: golden half / bone half', draw: tBridge, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'eternal_tile_options.png', title: 'VICE VERSA — TILES (4 hell / 4 holy / river / bridge) — pick numbers', S: 160, cols: 5, scale: 2 });
}
module.exports = { LIST };
