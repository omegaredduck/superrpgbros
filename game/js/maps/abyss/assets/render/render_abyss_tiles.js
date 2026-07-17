// artdev/abyss/render_abyss_tiles.js — 10 numbered THE ABYSS ground
// tile candidates (full-cell textures).
'use strict';
const KIT = require('./abyss_kit.js');
const { A, mix, clamp, ell, row, stroke, renderSheet } = KIT;

function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }

// 1 · ABYSSAL SILT — soft grey-blue base
function drawSilt(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#3a4458', '#232c3e', n2(x * 0.06, y * 0.06) * 0.8);
    // drift ripples
    const rip = Math.sin((y + Math.sin(x * 0.04) * 6) * 0.3);
    if (rip > 0.8) b = mix(b, '#1a2230', 0.3);
    if (n2(x, y) > 0.985) b = mix(b, '#5a6a86', 0.5); // speck
    if (n2(x + 5, y) > 0.993) b = mix(b, A.bio, 0.35); // rare glow mote
    return b;
  });
}
// 2 · TRENCH BASALT — dark columned rock
function drawBasalt(put, S) {
  fill(put, S, (x, y) => {
    const cs = S * 0.2;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9, id = 0;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 5 + (cyi + j); } else if (d < d2) d2 = d;
    }
    let b = mix('#2e3646', '#181e2a', n2(id, id * 2) * 0.7 + n2(x * 0.15, y * 0.15) * 0.2);
    if (Math.sqrt(d2) - Math.sqrt(d1) < 2) b = mix(b, '#0a0e16', 0.7);
    return b;
  });
}
// 3 · GLOW ALGAE MAT — bioluminescent carpet
function drawAlgae(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#16303a', '#0c1a22', n2(x * 0.08, y * 0.08) * 0.7);
    const patch = n2(Math.floor(x / 9), Math.floor(y / 9));
    if (patch > 0.5) {
      b = mix(b, A.glowDk, (patch - 0.5) * 1.2 + n2(x * 1.1, y * 1.1) * 0.3);
      if (n2(x + 2, y + 4) > 0.92) b = mix(b, A.glow, 0.75);
      if (n2(x + 8, y + 1) > 0.985) b = mix(b, A.glowLt, 0.9);
    }
    return b;
  });
}
// 4 · BLACK SAND RIPPLES — volcanic dunes
function drawBlackSand(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#20242e', '#101218', n2(x * 0.07, y * 0.07) * 0.8);
    const rip = Math.sin((y + Math.sin(x * 0.06) * 7) * 0.4);
    if (rip > 0.65) b = mix(b, '#080a10', 0.4);
    if (rip < -0.75) b = mix(b, '#3a4050', 0.35);
    if (n2(x, y) > 0.988) b = mix(b, '#6a7288', 0.5); // glassy grain
    return b;
  });
}
// 5 · SHELL GRAVEL — crushed pale shells
function drawShellGravel(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#5a5a52', '#383832', n2(x * 0.5, y * 0.5) * 0.6);
    const f = n2(Math.floor(x / 4), Math.floor(y / 4));
    if (f > 0.55) b = mix(b, f > 0.85 ? '#c8c0a8' : '#8a8672', 0.65);
    if (n2(x + 3, y + 7) > 0.96) b = mix(b, '#e8e0c8', 0.6); // bright shard
    if (n2(x + 9, y + 2) > 0.988) b = mix(b, A.pinkLt, 0.4); // pink nacre fleck
    return b;
  });
}
// 6 · WRECK DECK — waterlogged planks
function drawDeck(put, S) {
  fill(put, S, (x, y) => {
    const plankRow = Math.floor(y / (S * 0.14));
    let b = mix('#4e3a28', '#2a2016', n2(plankRow, Math.floor(x / (S * 0.5))) * 0.6);
    b = mix(b, '#16100a', n2(x * 0.8, y * 0.2) * 0.35);
    if (y % Math.round(S * 0.14) === 0) b = mix(b, '#0c0806', 0.7);
    if ((x + plankRow * 23) % Math.round(S * 0.55) === 0) b = mix(b, '#0c0806', 0.6);
    // algae film patches
    if (n2(Math.floor(x / 12), Math.floor(y / 10)) > 0.78) b = mix(b, '#2a4a34', 0.45);
    // barnacle dots
    if (n2(x + 6, y + 6) > 0.99) b = mix(b, A.shell, 0.7);
    return b;
  });
}
// 7 · VENT BASALT — cracked rock, ember glow in the seams
function drawVentRock(put, S) {
  fill(put, S, (x, y) => {
    const cs = S * 0.24;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    let b = mix('#2a2430', '#141018', n2(x * 0.1, y * 0.1) * 0.6);
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 2.6) b = mix(b, n2(x, y) > 0.35 ? '#ff7d3a' : '#c23a1a', 0.7); // glowing seams
    else if (edge < 4.5) b = mix(b, '#5a2a1a', 0.4);
    return b;
  });
}
// 8 · CORAL SHELF — pastel reef crust
function drawReef(put, S) {
  fill(put, S, (x, y) => {
    const patch = n2(Math.floor(x / 11), Math.floor(y / 11));
    const cols = ['#8a4a6a', '#4a7a8a', '#8a6a4a', '#5a6a9a', '#7a8a5a'];
    let b = mix(cols[(patch * 5) | 0], '#241c2a', 0.35 + n2(x * 0.3, y * 0.3) * 0.35);
    // pore dots
    if (n2(x * 1.3, y * 1.3) > 0.88) b = mix(b, '#e8d8e0', 0.35);
    if (n2(x + 4, y + 9) > 0.985) b = mix(b, A.bioLt, 0.5); // polyp glow
    return b;
  });
}
// 9 · BONE FIELD — silt strewn with old bones
function drawBoneField(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#3a4458', '#232c3e', n2(x * 0.06, y * 0.06) * 0.75);
    // scattered bone shapes (short pale dashes at angles)
    const cell = n2(Math.floor(x / 14), Math.floor(y / 14));
    if (cell > 0.6) {
      const bx = (Math.floor(x / 14) + 0.5) * 14, by = (Math.floor(y / 14) + 0.5) * 14;
      const ang = cell * 6.28, dx = x - bx, dy = y - by;
      const along = dx * Math.cos(ang) + dy * Math.sin(ang), across = -dx * Math.sin(ang) + dy * Math.cos(ang);
      if (Math.abs(along) < 5.5 && Math.abs(across) < 1.4) b = mix(b, '#c8c0a8', 0.75);
      if (Math.abs(Math.abs(along) - 5.5) < 1.2 && Math.abs(across) < 2.4) b = mix(b, '#a8a088', 0.6); // knuckle ends
    }
    if (n2(x + 5, y + 5) > 0.99) b = mix(b, '#e8e0c8', 0.5);
    return b;
  });
}
// 10 · THE DROP — chasm edge void (pit tile)
function drawDrop(put, S) {
  fill(put, S, (x, y) => {
    const d = n2(x * 0.05, y * 0.05);
    let b = mix('#10141e', '#04060a', clamp(0.3 + d * 0.5 + (x + y) / (S * 2) * 0.4, 0, 1));
    // faint falling particles
    if (n2(x + 1, y + 3) > 0.992) b = mix(b, '#3a4458', 0.6);
    // rare glow far below
    if (n2(x + 8, y + 8) > 0.997) b = mix(b, A.bioDk, 0.5);
    return b;
  });
}

const LIST = [
  { n: 1, name: 'ABYSSAL SILT', role: 'soft base', draw: drawSilt, noOutline: true },
  { n: 2, name: 'TRENCH BASALT', role: 'dark rock floor', draw: drawBasalt, noOutline: true },
  { n: 3, name: 'GLOW ALGAE', role: 'bioluminescent mat', draw: drawAlgae, noOutline: true },
  { n: 4, name: 'BLACK SAND', role: 'volcanic ripples', draw: drawBlackSand, noOutline: true },
  { n: 5, name: 'SHELL GRAVEL', role: 'crushed pale shells', draw: drawShellGravel, noOutline: true },
  { n: 6, name: 'WRECK DECK', role: 'waterlogged planks', draw: drawDeck, noOutline: true },
  { n: 7, name: 'VENT BASALT', role: 'ember-seamed rock', draw: drawVentRock, noOutline: true },
  { n: 8, name: 'CORAL SHELF', role: 'pastel reef crust', draw: drawReef, noOutline: true },
  { n: 9, name: 'BONE FIELD', role: 'bone-strewn silt', draw: drawBoneField, noOutline: true },
  { n: 10, name: 'THE DROP', role: 'chasm void (pit)', draw: drawDrop, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_tile_options.png', title: 'THE ABYSS — GROUND TILE CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
