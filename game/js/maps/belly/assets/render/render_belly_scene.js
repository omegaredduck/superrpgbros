// artdev/belly/render_belly_scene.js — BELLY OF THE BEAST planned
// scene/zone diagram (composed). MAIN MAP = the whale's insides
// (toroidal); OUTRO = separate SAND ARENA stage (the boss "2nd map").
'use strict';
const sharp = require('sharp');

const MW = 900, MH = 640, FOOT = 150;
const W = MW, H = MH + FOOT;
const px = Buffer.alloc(W * H * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); const A = hex(a), Bb = hex(b); const q = v => Math.round(v); return '#' + [0, 1, 2].map(i => q(A[i] + (Bb[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function blob(cx, cy, rx, ry, c, c2, seed) {
  for (let y = cy - ry; y < cy + ry; y++) for (let x = cx - rx; x < cx + rx; x++) {
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    const wob = 1 + (h2(Math.round(x / 18), Math.round(y / 18), seed || 1) - 0.5) * 0.25;
    if (d < wob) put(x, y, mix(c, c2 || c, d));
  }
}
function line(x0, y0, x1, y1, w, c) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1;
  for (let t = 0; t <= 1; t += 1 / L) {
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    for (let dy = -w; dy <= w; dy++) for (let dx = -w; dx <= w; dx++) if (dx * dx + dy * dy <= w * w) put(x + dx, y + dy, c);
  }
}

// ---- base: flesh interior
for (let y = 0; y < MH; y++) for (let x = 0; x < W; x++) {
  const n = h2(x >> 3, y >> 3, 99);
  put(x, y, mix('#5a2430', '#38141e', 0.3 + n * 0.4));
}
// footer bg
for (let y = MH; y < H; y++) for (let x = 0; x < W; x++) put(x, y, '#12141c');

// ---- zones
// THE GULLET (W entrance) — gristle path in, baleen gates
blob(90, 300, 120, 190, '#8a5a58', '#5a2430', 3);
// RIB VAULT CAVERNS (N) — bone litter
blob(420, 110, 260, 95, '#8a7a68', '#5a2430', 5);
// THE WRECK (center) — swallowed ship, SPAWN
blob(440, 330, 150, 110, '#6a4a34', '#452a1c', 7);
// DEEP GUT (E) — flesh folds, worms, polyps
blob(770, 260, 130, 170, '#7a3644', '#4a1620', 9);
// ACID LAKES (S) — digestion tide source
blob(320, 540, 220, 85, '#7a9a34', '#3c5a12', 11);
blob(620, 560, 130, 60, '#7a9a34', '#3c5a12', 13);
// TREASURE HEAP (SE corner)
blob(800, 520, 90, 70, '#8a6a2a', '#5a4014', 15);
// THE UVULA (far W, gullet end) — the gag trigger
blob(60, 300, 30, 44, '#c2607a', '#8a3a48', 17);

// ---- gristle path ring W-E (wraps)
for (let x = 0; x < W; x += 3) {
  const y = 330 + Math.sin(x * 0.012) * 40;
  line(x, y, x + 2, y, 6, '#b09484');
}
// acid tide creep arrows S→N (digestion tide direction)
[[260, 500], [430, 520], [600, 530]].forEach(([ax, ay]) => {
  line(ax, ay, ax, ay - 34, 2, '#aee05a');
  line(ax, ay - 34, ax - 6, ay - 26, 2, '#aee05a'); line(ax, ay - 34, ax + 6, ay - 26, 2, '#aee05a');
});
// wreck sketch: hull + masts on the spawn zone
line(370, 360, 520, 360, 3, '#2a180e');
for (let t = 0; t < 1; t += 0.05) { const x = 370 + t * 150; line(x, 360, x, 360 + 18 - Math.sin(t * Math.PI) * 8, 1, '#452a1c'); }
line(430, 360, 430, 290, 2, '#2a180e'); line(408, 300, 452, 300, 1, '#8a8268'); // mast + spar
line(478, 360, 478, 310, 2, '#2a180e');
// rib arch marks in the vaults
[[300, 100], [420, 80], [540, 100]].forEach(([rx, ry]) => { line(rx - 22, ry + 30, rx, ry, 2, '#e8dcc4'); line(rx, ry, rx + 22, ry + 30, 2, '#e8dcc4'); });
// toroidal seam ticks
for (let y = 0; y < MH; y += 14) { put(2, y, '#aab2c0'); put(W - 3, y, '#aab2c0'); }
for (let x = 0; x < W; x += 14) { put(x, 2, '#aab2c0'); put(x, MH - 3, '#aab2c0'); }

// ---- SVG labels
const L = [];
function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'BELLY OF THE BEAST — SCENE PLAN (toroidal guts + outro arena)', '#e8a8b0', 18);
label(420, 96, 'RIB VAULT CAVERNS (crabs, starfish, snakes)', '#e8dcc4', 12);
label(90, 210, 'THE GULLET', '#e0b0a8', 13);
label(90, 228, '(fishermen, lobsters, mermaid)', '#c89a94', 10);
label(8, 368, 'THE UVULA', '#ffb0c0', 11, 'start');
label(8, 384, 'HIT IT = the gag trigger', '#ff9a8a', 10, 'start');
label(440, 300, 'THE WRECK — SPAWN on the deck', '#ffd24a', 13);
label(440, 318, '(pirates, deckhands, rats, parrot)', '#d8b06a', 10);
label(770, 200, 'DEEP GUT (worms, polyps, krill)', '#e89aa8', 12);
label(320, 556, 'ACID LAKES (slugs, jellies)', '#d8f47a', 12);
label(620, 574, 'ACID SHALLOWS', '#d8f47a', 10);
label(800, 506, 'TREASURE HEAP', '#ffd878', 11);
label(800, 522, '(lampreys lurk)', '#d8b06a', 10);
label(450, 410, 'GRISTLE PATH (wraps W-E)', '#e0c8b8', 12);
label(430, 480, 'DIGESTION TIDE: acid rises N out of the lakes (warned)', '#aee05a', 11);
label(150, 60, 'lantern rigs light the dark', '#f8d878', 10);
label(700, 60, 'baleen curtains gate the vaults', '#c8bca0', 10);

// footer
const FOOTER = [
  'FLOW: spawn on the wrecked deck -> "thats weird..." intro already played (ship swallowed whole)',
  'clear the guts -> reach THE UVULA at the gullet end -> HIT IT -> the whale GAGS...',
  'OUTRO CINEMATIC: it beaches itself + SPITS YOU UP -> you land on the SAND BEACH ARENA ("2nd map")',
  'BOSS: THE TITAN WHALE beached at arena top (head-on maw) - NEVER MOVES, you circle + dodge',
  'kit: spray mortars / inhale->chomp / flipper slam rings / gut cough adds / P2 maw alight / SIG WATER GUN vent x1.5',
  'realm select shows "???" until first clear - then reveals BELLY OF THE BEAST',
  'tiles: stomach lining base / flesh folds / acid shallows ANIM / bone litter / barnacle crust / gristle path / bile slick',
  'DIGESTION TIDE cycle: gurgle warn -> walls flex -> acid spreads from the lakes (warned zones) -> recedes',
];
FOOTER.forEach((t, i) => label(12, MH + 24 + i * 16, t, (i === 2 || i === 3) ? '#ff9a8a' : (i === 4 ? '#ffd88a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'belly_scene_plan.png').then(() => console.log('wrote scene plan'));
