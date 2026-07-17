// artdev/sugar/render_sugar_tiles.js — 10 numbered SUGAR WORLD ground
// tile candidates (full-cell textures).
'use strict';
const KIT = require('./sugar_kit.js');
const { G, mix, clamp, ell, row, stroke, renderSheet } = KIT;

function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }

// 1 · CANDY GRASS — bright green w/ sugar glitter
function drawGrass(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#7ac84a', '#4a8a2a', n2(x * 0.08, y * 0.08) * 0.7);
    const tuft = n2(Math.floor(x / 6), Math.floor(y / 6));
    if (tuft > 0.72 && (x + y) % 4 === 0) b = mix(b, '#a8e86a', 0.5);
    if (n2(x, y) > 0.985) b = mix(b, '#ffffff', 0.6); // sugar glitter
    if (n2(x + 7, y) > 0.992) b = mix(b, G.pinkLt, 0.5); // candy fleck
    return b;
  });
}
// 2 · PEPPERMINT PATH — pink brick road (concept path)
function drawPath(put, S) {
  fill(put, S, (x, y) => {
    const ry = Math.floor(y / (S * 0.18));
    const off = (ry % 2) * S * 0.14;
    const rx = Math.floor((x + off) / (S * 0.28));
    const pick = n2(rx, ry);
    let base = pick > 0.66 ? G.pink : pick > 0.33 ? '#f0d8c0' : G.pinkLt;
    let b = mix(base, mix(base, '#8a4a5a', 0.5), n2(x * 0.1, y * 0.1) * 0.4);
    if (y % Math.round(S * 0.18) === 0 || (x + Math.round(off)) % Math.round(S * 0.28) === 0) b = mix(b, '#8a5a4a', 0.55);
    return b;
  });
}
// 3 · CHOCOLATE RIVER — flowing dark swirls
function drawRiver(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(G.chocLt, G.chocDk, n2(x * 0.05, y * 0.05) * 0.7);
    const flow = Math.sin((x + Math.sin(y * 0.06) * 8) * 0.12 + y * 0.02);
    if (flow > 0.75) b = mix(b, G.caramelLt, 0.35); // swirl highlights
    if (flow < -0.85) b = mix(b, '#2a1408', 0.5);
    if (n2(x + 3, y + 5) > 0.99) b = mix(b, G.caramelLt, 0.6); // bubbles
    return b;
  });
}
// 4 · SPRINKLE MEADOW — frosting field full of sprinkles
function drawSprinkleField(put, S) {
  const cols = [G.red, G.blue, G.yellow, G.lime, G.grape, G.orange];
  fill(put, S, (x, y) => {
    let b = mix('#fff0f6', '#f0c8d8', n2(x * 0.06, y * 0.06) * 0.6);
    // sprinkle dashes
    const cell = n2(Math.floor(x / 7), Math.floor(y / 7));
    if (cell > 0.55) {
      const bx = (Math.floor(x / 7) + 0.5) * 7, by = (Math.floor(y / 7) + 0.5) * 7;
      const ang = cell * 6.28, dx = x - bx, dy = y - by;
      const along = dx * Math.cos(ang) + dy * Math.sin(ang), across = -dx * Math.sin(ang) + dy * Math.cos(ang);
      if (Math.abs(along) < 2.8 && Math.abs(across) < 1) b = cols[(cell * 6) | 0];
    }
    return b;
  });
}
// 5 · GRAHAM DIRT — cracker crumb ground
function drawGraham(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#d8a868', '#a87840', n2(x * 0.4, y * 0.4) * 0.5 + n2(x * 0.07, y * 0.07) * 0.3);
    if (n2(x + 1, y + 3) > 0.94) b = mix(b, '#f0d0a0', 0.6); // crumb
    if (n2(x + 8, y + 2) > 0.975) b = mix(b, '#7a5228', 0.5);
    return b;
  });
}
// 6 · CARAMEL POOL — sticky slow hazard
function drawCaramelPool(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(G.caramelLt, G.caramel, n2(x * 0.04, y * 0.04) * 0.8);
    const swirl = Math.sin(x * 0.08 + Math.sin(y * 0.07) * 3);
    if (swirl > 0.8) b = mix(b, '#ffe0a0', 0.4);
    if (swirl < -0.8) b = mix(b, G.caramelDk, 0.45);
    if (n2(x, y) > 0.992) b = mix(b, '#fff4d0', 0.7); // glint
    return b;
  });
}
// 7 · COOKIE CRUMBLE — chunk rubble w/ chips
function drawCookie(put, S) {
  fill(put, S, (x, y) => {
    const cs = S * 0.22;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9, id = 0;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 7 + (cyi + j); } else if (d < d2) d2 = d;
    }
    let b = mix('#d8a05a', '#a87038', n2(id, id * 3) * 0.5 + n2(x * 0.15, y * 0.15) * 0.25);
    if (Math.sqrt(d2) - Math.sqrt(d1) < 2.4) b = mix(b, '#6a4218', 0.6); // cracks
    if (n2(x + 4, y + 9) > 0.965) b = mix(b, G.chocDk, 0.75); // choc chips
    return b;
  });
}
// 8 · ICING SNOW — smooth white frosting drifts
function drawIcing(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#ffffff', '#e0d0e0', n2(x * 0.04, y * 0.04) * 0.55);
    const drift = Math.sin((y + Math.sin(x * 0.05) * 6) * 0.25);
    if (drift > 0.8) b = mix(b, '#c8b8d0', 0.3);
    if (n2(x, y) > 0.988) b = '#ffffff'; // sparkle
    return b;
  });
}
// 9 · GUMMY FLOOR — translucent red, bouncy
function drawGummyFloor(put, S) {
  fill(put, S, (x, y) => {
    let b = mix(G.redLt, G.red, n2(x * 0.05, y * 0.05) * 0.7);
    // inner glow blobs
    const blob = n2(Math.floor(x / 20), Math.floor(y / 20));
    if (blob > 0.6) {
      const d = Math.hypot(x % 20 - 10, y % 20 - 10);
      if (d < 7) b = mix(b, '#ffd0d0', clamp(0.5 - d / 14, 0, 0.4));
    }
    if ((x + y) % 17 === 0) b = mix(b, G.redDk, 0.25); // sheen bands
    if (n2(x + 5, y + 5) > 0.993) b = mix(b, '#ffffff', 0.7);
    return b;
  });
}
// 10 · LICORICE CHECKER — black/white candy tiles
function drawChecker(put, S) {
  fill(put, S, (x, y) => {
    const gx = Math.floor(x / (S * 0.2)), gy = Math.floor(y / (S * 0.2));
    const black = (gx + gy) % 2 === 0;
    let b = black ? mix(G.licoLt, G.licoDk, n2(x * 0.1, y * 0.1) * 0.6 + 0.2) : mix('#ffffff', '#d8d0e0', n2(x * 0.1, y * 0.1) * 0.5);
    if (x % Math.round(S * 0.2) === 0 || y % Math.round(S * 0.2) === 0) b = mix(b, G.pinkDk, 0.4); // pink grout
    if (black && n2(x + 2, y + 6) > 0.99) b = mix(b, '#8a84a0', 0.6); // sheen
    return b;
  });
}

const LIST = [
  { n: 1, name: 'CANDY GRASS', role: 'glittering base', draw: drawGrass, noOutline: true },
  { n: 2, name: 'PEPPERMINT PATH', role: 'pink brick road', draw: drawPath, noOutline: true },
  { n: 3, name: 'CHOCOLATE RIVER', role: 'flowing swirls', draw: drawRiver, noOutline: true },
  { n: 4, name: 'SPRINKLE MEADOW', role: 'frosting + sprinkles', draw: drawSprinkleField, noOutline: true },
  { n: 5, name: 'GRAHAM DIRT', role: 'cracker crumbs', draw: drawGraham, noOutline: true },
  { n: 6, name: 'CARAMEL POOL', role: 'sticky slow hazard', draw: drawCaramelPool, noOutline: true },
  { n: 7, name: 'COOKIE CRUMBLE', role: 'chunks + choc chips', draw: drawCookie, noOutline: true },
  { n: 8, name: 'ICING SNOW', role: 'white drifts', draw: drawIcing, noOutline: true },
  { n: 9, name: 'GUMMY FLOOR', role: 'translucent red bounce', draw: drawGummyFloor, noOutline: true },
  { n: 10, name: 'LICORICE CHECKER', role: 'candy checkerboard', draw: drawChecker, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_tile_options.png', title: 'SUGAR WORLD — GROUND TILE CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
