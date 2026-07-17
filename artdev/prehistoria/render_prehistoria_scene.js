// artdev/prehistoria/render_prehistoria_scene.js — PREHISTORIA planned
// scene/zone diagram (composed). Toroidal wrap.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 780;
const FOOTER = [
  'TOROIDAL WRAP: jungle stitches all 4 edges; the GAME TRAIL runs W-E edge-to-edge; the RIVER runs',
  '  W-E across the south (cross at the ford + fallen-log bridge).',
  "METEOR SHOWER (map cycle, Red's pick): omen streaks cross the sky -> warned impact circles rain",
  '  across the map -> brief lava puddles. Heavier near the volcano quarter. THE PRIMORDIAL can CALL',
  '  one early as his signature (then vents, winded).',
  'Mob turf: raptors + compys in the deep jungle · trikes + stegos + brachio graze the fern meadows ·',
  '  dilos hunt the reeds · pterodactyls dive from the roost spire. RECOLOR VARIANTS spawn mixed.',
  'BOSS: NEST ARENA on the volcano rim — THE HATCH entrance (egg splits, flash, gone).',
  'All counts/sizes TUNE ME.',
];
const H = MH + 24 + FOOTER.length * 18 + 12;

const px = Buffer.alloc(W * H * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function shade(c, f) { const [r, g, b] = hex(c); const m = 1 - f; return '#' + [r * m, g * m, b * m].map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join(''); }
function rect(x0, y0, x1, y1, c, j) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, j ? shade(c, n2(x, y) * j) : c); }
function ring(cx, cy, r, w, c) { for (let y = cy - r - w; y <= cy + r + w; y++) for (let x = cx - r - w; x <= cx + r + w; x++) { const d = Math.hypot(x - cx, y - cy); if (Math.abs(d - r) <= w) put(x, y, c); } }
function blob(cx, cy, r, c, j) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r * 1.3; x <= cx + r * 1.3; x++) { const d = Math.hypot((x - cx) / 1.3, y - cy); if (d <= r) put(x, y, shade(c, (j || 0.15) * n2(x, y) + d / r * 0.2)); } }

// ---- base jungle
rect(0, 0, W, MH, '#2e4a20', 0.2);
// fern meadows (NW broad)
blob(200, 170, 130, '#4a7232', 0.18);
blob(420, 120, 90, '#4a7232', 0.18);
// deep jungle (W/SW dark)
blob(120, 420, 120, '#16260e', 0.1);
blob(300, 330, 90, '#1e3212', 0.12);
// volcano quarter (NE): ash + crater
blob(720, 160, 150, '#5a5254', 0.16);
blob(760, 120, 70, '#3a3234', 0.14);
[[690, 220], [780, 200], [730, 260]].forEach(([vx, vy]) => { ring(vx, vy, 8, 1.6, '#c8452a'); put(vx, vy, '#ffd24a'); }); // vents
// crater
ring(660, 300, 26, 2.4, '#6a5a4a'); blob(660, 300, 18, '#141012', 0.1); put(655, 297, '#c8452a');
// tar pits (SW)
[[180, 620, 44], [260, 660, 32]].forEach(([tx2, ty2, tr]) => { blob(tx2, ty2, tr, '#1a161c', 0.06); ring(tx2, ty2, tr + 4, 1.4, '#4a3a24'); });
// bone field (S center-west)
for (let k = 0; k < 22; k++) { const bx = 320 + (k * 47) % 160, by = 600 + (k * 83) % 120; put(bx, by, '#e2d8c0'); put(bx + 1, by, '#8a8268'); }
// geyser springs (SE)
[[700, 620], [750, 660]].forEach(([gx, gy]) => { ring(gx, gy, 12, 2, '#7ac8c0'); ring(gx, gy, 5, 1.2, '#c8f0ea'); });
// ---- GAME TRAIL W-E (wraps)
for (let x = 0; x < W; x++) {
  const yc = 470 + Math.sin(x * 0.008) * 26;
  for (let y = yc - 20; y < yc + 20; y++) put(x, y, shade('#a8906a', n2(x, y) * 0.25 + Math.abs(y - yc) / 44));
  if (x % 36 < 3) { put(x, yc - 6, '#42351c'); put(x + 1, yc + 5, '#42351c'); } // prints
}
// ---- RIVER W-E south (wraps) + ford + log bridge
for (let x = 0; x < W; x++) {
  const yc = 700 + Math.sin(x * 0.01) * 14;
  for (let y = yc - 16; y < yc + 16; y++) put(x, y, shade('#3a6a7a', 0.25 + Math.abs(y - yc) / 40 + n2(x * 0.5, y * 0.5) * 0.1));
}
rect(430, 676, 470, 724, '#8a8276', 0.2); // stone ford
rect(640, 688, 700, 700, '#4a3a24', 0.2); // log bridge
// swamp shallows pocket
blob(80, 700, 40, '#3a5a4a', 0.12);
// ---- landmarks
// skull rock (N center)
blob(480, 210, 30, '#b0a890', 0.15); rect(462, 200, 474, 216, '#0e0c06'); rect(486, 200, 498, 216, '#0e0c06');
// roost spire (E mid)
rect(816, 380, 836, 460, '#8a8276', 0.2); ring(826, 374, 10, 1.6, '#4a3a24');
// titan ribcage (SW jungle)
for (let k = 0; k < 5; k++) { const rx = 90 + k * 14; for (let a = 3.4; a <= 5.6; a += 0.1) put(Math.round(rx + Math.cos(a) * 10), Math.round(560 + Math.sin(a) * 22), '#e2d8c0'); }
// ---- NEST ARENA (boss, volcano rim NE)
ring(770, 320, 60, 2.4, '#c8452a');
ring(770, 320, 64, 1, '#6a2808');
// the giant egg
for (let y = 296; y <= 344; y++) { const t = (y - 320) / 24; const w = 16 * Math.sqrt(Math.max(0, 1 - t * t)); for (let x = 770 - w; x <= 770 + w; x++) put(x, y, shade('#e2d8c0', Math.abs(t) * 0.25 + n2(x, y) * 0.08)); }
ring(770, 348, 22, 1.6, '#4a3a24'); // nest ring under egg
// meteor omen streaks in the sky corners
[[60, 30, 90, 48], [820, 26, 850, 44], [420, 20, 444, 34]].forEach(([x0, y0, x1, y1]) => { for (let i = 0; i <= 12; i++) { const t = i / 12; put(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), '#c8452a'); } put(x1 + 1, y1 + 1, '#ffd24a'); });
// warned impact circles sample (mid map)
[[540, 560], [580, 590]].forEach(([ix, iy]) => ring(ix, iy, 14, 1.4, '#ffd24a'));

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+').replace(/</g, '(').replace(/>/g, ')'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'PREHISTORIA — SCENE PLAN (toroidal)', '#8ac86a', 18);
label(200, 96, 'FERN MEADOWS (trikes, stegos, brachio)', '#b8e89a', 12);
label(140, 330, 'DEEP JUNGLE (raptors + compys)', '#7aa04a', 12);
label(720, 60, 'VOLCANO QUARTER (ash, vents)', '#d8a8a0', 12);
label(660, 342, 'CRATER', '#c8452a', 10);
label(480, 168, 'SKULL ROCK', '#d8d0b8', 11);
label(220, 580, 'TAR PITS', '#8a8296', 11);
label(400, 570, 'BONE FIELD', '#d8ccb0', 11);
label(725, 590, 'GEYSER SPRINGS', '#7ac8c0', 11);
label(826, 360, 'ROOST SPIRE (ptero dives)', '#d8d0b8', 10);
label(120, 528, 'TITAN RIBCAGE', '#d8ccb0', 10);
label(450, 435, 'GAME TRAIL (wraps W-E)', '#ffe0a0', 13);
label(450, 745, 'RIVER (wraps W-E) — ford + log bridge — dilos in the reeds', '#aee0f0', 12);
label(80, 668, 'SWAMP', '#7aa886', 10);
label(770, 250, 'NEST ARENA — THE PRIMORDIAL', '#ffd24a', 13);
label(770, 396, 'THE HATCH happens here', '#ff9a8a', 10);
label(540, 540, 'meteor impact warns', '#ffd88a', 10);
label(120, 52, 'omen streaks', '#ff9a8a', 10);
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, (i === 2 || i === 3 || i === 4) ? '#ff9a8a' : (i === 7 ? '#ffd88a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'prehistoria_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
