// artdev/render_factory_scene.js — top-down COHESIVE MAP PLAN for biome 4.
// Tiles: #1 riveted steel (main floor) · #3 grated catwalk (walkways) ·
// #4 hazard floor (borders/danger). Conveyors are IN-GROUND travelators
// (airport moving-walkway), flush with the floor. Decor placed as a planned
// scene, not scatter (note 6). Numbers reference the decor sheet.
'use strict';
const sharp = require('sharp');
const W = 1060, H = 740;
const buf = Buffer.alloc(W * H * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function px(x, y, c, a) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; const al = a == null ? 1 : a; buf[i] = buf[i] * (1 - al) + r * al; buf[i + 1] = buf[i + 1] * (1 - al) + g * al; buf[i + 2] = buf[i + 2] * (1 - al) + b * al; buf[i + 3] = 255; }
function mixc(h1, h2, t) { const a = hex(h1), b = hex(h2); return '#' + [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0')).join(''); }
function hash(a, b) { const n = Math.sin((a % 9973) * 127.1 + (b % 9973) * 311.7) * 43758.5453; return n - Math.floor(n); }

// ---- tile shaders (compact) ----
function shRiveted(gx, gy) { const T = 54, tx = gx % T, ty = gy % T; let b = mixc('#8a94a6', '#697386', ty / T); b = mixc(b, '#c7cdd6', 0.12 * (1 - tx / T)); if (tx < 2 || ty < 2) b = '#2b3245'; if (tx < 3 && ty < 3) b = '#c7cdd6'; const d = Math.hypot(tx - 7, ty - 7); if (tx > 3 && tx < 11 && ty > 3 && ty < 11 && d < 3) b = mixc('#c7cdd6', '#454e63', d / 3); return b; }
function shCatwalk(gx, gy) { const T = 18, tx = gx % T, ty = gy % T; const bar = (tx < 4) || (ty % 9 < 2); if (bar) return mixc('#8a94a6', '#c7cdd6', tx < 4 ? 0.5 : 0.2); return mixc('#101119', '#242a38', tx / T); }
function shHazard(gx, gy) { const T = 28, tx = gx % T, ty = gy % T; const band = Math.floor(((tx + ty) % T) / (T / 2)) === 0; let b = band ? '#ffcd45' : '#20212c'; if (hash(tx, ty) > 0.85) b = mixc(b, '#101119', 0.4); return b; }
function fillRegion(x0, y0, x1, y1, sh) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) px(x, y, sh(x, y)); }

// base: entire map riveted steel
fillRegion(0, 0, W, H, shRiveted);
// FOUNDRY WING (left) subtle darker overlay via rivet (kept) — leave steel
// CATWALK bands: perimeter + a central horizontal walkway + vertical spine
fillRegion(0, 0, W, 26, shCatwalk); fillRegion(0, H - 26, W, H, shCatwalk);
fillRegion(0, 0, 26, H, shCatwalk); fillRegion(W - 26, 0, W, H, shCatwalk);
fillRegion(0, 356, W, 392, shCatwalk);          // central cross-catwalk
fillRegion(300, 92, 336, H - 130, shCatwalk);   // vertical spine dividing foundry / assembly
// HAZARD borders: boss doors (top) + spawn bay (bottom) + foundry danger edge
fillRegion(26, 26, W - 26, 92, shHazard);        // top: boss doors strip
fillRegion(26, H - 130, W - 26, H - 26, shHazard); // bottom: loading bay floor
fillRegion(26, 92, 300, 128, shHazard);          // foundry hot-edge

// ---- IN-GROUND CONVEYOR TRAVELATORS (flush moving walkways) ----
function travelator(x0, x1, yTop, yBot, dir) {
  // recessed side rails (dark) + belt surface with chevrons pointing dir
  for (let y = yTop; y < yBot; y++) for (let x = x0; x < x1; x++) {
    let c;
    const ry = y - yTop, hgt = yBot - yTop;
    if (ry < 6 || ry > hgt - 6) c = mixc('#20212c', '#ffcd45', (Math.floor(x / 10) % 2) * 0.8); // hazard side strip
    else { c = mixc('#2a2d38', '#16171d', (Math.abs(ry - hgt / 2) / (hgt / 2))); const cxk = ((dir > 0 ? x : -x) % 34 + 34) % 34; const cyd = Math.abs(ry - hgt / 2); if (Math.abs(cxk - (8 + cyd)) < 3) c = '#ffcd45'; }
    px(x, y, c);
  }
}
travelator(340, W - 40, 150, 214, +1);   // upper belt: runs RIGHT
travelator(340, W - 40, 250, 314, -1);   // mid belt: runs LEFT
travelator(340, W - 40, 452, 516, +1);   // lower belt: runs RIGHT

// ---- decor markers: {x,y,num,cat} cat=color ----
const CAT = { build: '#41d6f6', power: '#ff7d3a', logi: '#d7a13a', haz: '#ff4b3e', anim: '#5fe86b' };
const M = [
  // loading bay (bottom)
  [120, 660, 6, 'logi'], [210, 665, 8, 'logi'], [300, 662, 6, 'logi'], [430, 668, 19, 'logi'], [560, 662, 7, 'haz'], [690, 666, 20, 'logi'], [860, 663, 8, 'logi'], [980, 662, 16, 'haz'],
  // assembly floor (center/right)
  [420, 128, 11, 'anim'], [620, 128, 11, 'anim'], [820, 128, 11, 'anim'],
  [470, 232, 3, 'build'], [640, 232, 3, 'build'], [810, 232, 3, 'build'], [960, 232, 9, 'anim'],
  [470, 430, 4, 'build'], [660, 430, 5, 'build'], [820, 430, 15, 'build'], [960, 430, 9, 'anim'],
  [520, 560, 3, 'build'], [700, 560, 4, 'build'], [880, 560, 5, 'build'], [980, 560, 15, 'build'],
  // foundry wing (left)
  [150, 200, 13, 'power'], [150, 320, 18, 'power'], [150, 470, 12, 'power'], [150, 600, 17, 'anim'], [235, 260, 18, 'power'], [235, 420, 12, 'power'],
  // boss doors (top center)
  [530, 58, 10, 'anim'], [700, 58, 10, 'anim'],
];

async function main() {
  // marker SVG
  const markers = M.map(m => {
    const c = CAT[m[3]];
    return `<circle cx="${m[0]}" cy="${m[1]}" r="15" fill="#141620" stroke="${c}" stroke-width="3"/>` +
      `<text x="${m[0]}" y="${m[1] + 5}" font-family="monospace" font-size="15" font-weight="bold" fill="${c}" text-anchor="middle">${m[2]}</text>`;
  }).join('');
  // conveyor direction arrows
  function arrow(x, y, dir) { const d = dir > 0 ? 1 : -1; return `<polygon points="${x},${y - 10} ${x + d * 22},${y} ${x},${y + 10}" fill="#20212c" stroke="#ffcd45" stroke-width="2"/>`; }
  const arrows = [arrow(690, 182, 1), arrow(900, 182, 1), arrow(690, 282, -1), arrow(500, 282, -1), arrow(690, 484, 1), arrow(900, 484, 1)].join('');
  const zone = (x, y, t, c) => `<text x="${x}" y="${y}" font-family="monospace" font-size="19" font-weight="bold" fill="${c}" text-anchor="middle" opacity="0.9">${t}</text>`;
  const zones = [
    zone(W / 2, 78, 'BLAST DOORS  →  BOSS ARENA (custom, off-map)', '#ff4b3e'),
    zone(165, 150, 'FOUNDRY WING', '#ff7d3a'),
    zone(700, 350, 'ASSEMBLY FLOOR', '#41d6f6'),
    zone(700, 400, '(in-ground conveyor travelators)', '#c7cdd6'),
    zone(W / 2, H - 96, 'LOADING BAY  ·  PLAYER SPAWN ▼', '#d7a13a'),
  ].join('');
  // spawn marker
  const spawn = `<circle cx="${W / 2}" cy="${H - 46}" r="17" fill="#5fe86b" stroke="#141620" stroke-width="3"/><text x="${W / 2}" y="${H - 40}" font-family="monospace" font-size="16" font-weight="bold" fill="#141620" text-anchor="middle">S</text>`;
  // legend panel
  const lg = `<rect x="26" y="96" width="250" height="150" fill="#141620" opacity="0.82" stroke="#41d6f6"/>` +
    `<text x="40" y="120" font-family="monospace" font-size="13" font-weight="bold" fill="#41d6f6">TILES</text>` +
    `<text x="40" y="140" font-family="monospace" font-size="12" fill="#c7cdd6">#1 riveted steel — main floor</text>` +
    `<text x="40" y="158" font-family="monospace" font-size="12" fill="#c7cdd6">#3 grated catwalk — walkways</text>` +
    `<text x="40" y="176" font-family="monospace" font-size="12" fill="#c7cdd6">#4 hazard — borders/danger</text>` +
    `<text x="40" y="200" font-family="monospace" font-size="13" font-weight="bold" fill="#ffcd45">CONVEYOR = with belt: SPEED+</text>` +
    `<text x="40" y="218" font-family="monospace" font-size="12" fill="#ffcd45">against belt: SLOWED</text>` +
    `<text x="40" y="238" font-family="monospace" font-size="11" fill="#8a94a6">circles = decor # · S = spawn</text>`;
  const svg = Buffer.from(`<svg width="${W}" height="${H}"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="#41d6f6" stroke-width="2"/>${zones}${arrows}${markers}${spawn}${lg}<text x="${W / 2}" y="24" font-family="monospace" font-size="18" font-weight="bold" fill="#41d6f6" text-anchor="middle">BIOME 4 · ROBOTICS FACTORY — COHESIVE MAP PLAN (tiles 1/3/4 + in-ground conveyors + planned decor)</text></svg>`);
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'factory_scene_plan.png');
  console.log('wrote scene', W + 'x' + H);
}
main().catch(e => { console.error(e); process.exit(1); });
