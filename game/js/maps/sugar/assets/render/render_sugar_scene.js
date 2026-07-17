// artdev/sugar/render_sugar_scene.js — SUGAR WORLD planned scene/zone
// diagram (composed layout per Red's concept art). Toroidal wrap.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 780;
const FOOTER = [
  'TOROIDAL WRAP: fields stitch all 4 edges; PEPPERMINT PATH runs N-S edge-to-edge; the CHOCOLATE RIVER',
  '  winds W-E edge-to-edge (river = scenery water strips, NOT a ground tile; crossable ONLY at the bridges).',
  'CANDY PICKUPS (map mechanic): chance drop from killed mobs = FULL HEAL (rare, TUNE ~3-5%); Sugar Bear',
  '  gumball-volley duds may leave one (TUNE). No fixed spawners.',
  'CANDY CANE FENCES are DESTRUCTIBLE (campaign rule: ALL fences destructible, with break states).',
  'Mob turf: village = gingerdead men + mimics + lancers · forest = gummies + drops + cotton drifts ·',
  '  snowfield = mint guardians + corn packs · riverbanks = twirlers + brutes · jawbreakers roll the paths.',
  'BOSS: SUGAR BEAR DEN (S-center) — gummy-floor clearing ringed by destructible cane fence, donut arch entry.',
  'All counts/sizes TUNE ME.',
];
const H = MH + 24 + FOOTER.length * 18 + 12;

const px = Buffer.alloc(W * H * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function shade(c, f) { const [r, g, b] = hex(c); const m = 1 - f; return '#' + [r * m, g * m, b * m].map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join(''); }
function rect(x0, y0, x1, y1, c, j) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, j ? shade(c, n2(x, y) * j) : c); }
function circle(cx, cy, r, c, j) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(x, y, j ? shade(c, n2(x, y) * j) : c); }
function ring(cx, cy, r, w, c) { for (let y = cy - r - w; y <= cy + r + w; y++) for (let x = cx - r - w; x <= cx + r + w; x++) { const d = Math.hypot(x - cx, y - cy); if (Math.abs(d - r) <= w) put(x, y, c); } }
function outline(x0, y0, x1, y1, c) { for (let x = x0; x < x1; x++) { put(x, y0, c); put(x, y1 - 1, c); } for (let y = y0; y < y1; y++) { put(x0, y, c); put(x1 - 1, y, c); } }

// ---- base: sprinkle meadow everywhere
rect(0, 0, W, MH, '#f8e8f0', 0.06);
// sprinkle flecks
for (let i = 0; i < 900; i++) { const x = (i * 137) % W, y = (i * 211) % MH; const cols = ['#ff4a58', '#4ab8ff', '#ffd83a', '#a8e83a', '#b06ae8']; put(x, y, cols[i % 5]); }
// icing snow region N (frosted peaks)
rect(0, 0, W, 170, '#f4f0fa', 0.05);
// cookie crumble outskirts SW + SE corners
rect(0, 560, 220, MH, '#c89858', 0.15);
rect(700, 600, 900, MH, '#c89858', 0.15);
// gummy floor den zone (S-center) painted under the den ring
circle(450, 620, 95, '#ff8a94', 0.1);

// ---- PEPPERMINT PATH: N-S spine (wraps) w/ pink bricks
for (let y = 0; y < MH; y++) {
  const xw = 24 + Math.sin(y * 0.015) * 30;
  for (let x = 430 + Math.sin(y * 0.02) * 40 - xw / 2; x < 430 + Math.sin(y * 0.02) * 40 + xw / 2; x++) {
    const brick = (Math.floor(y / 14) + Math.floor(x / 22)) % 3;
    put(x, y, shade(brick === 0 ? '#ff9ac8' : brick === 1 ? '#f0d8c0' : '#ffd0e8', n2(x, y) * 0.12));
  }
}
// ---- CHOCOLATE RIVER: W-E winding band (wraps)
for (let x = 0; x < W; x++) {
  const yc = 470 + Math.sin(x * 0.012) * 55 + Math.sin(x * 0.03) * 12;
  for (let y = yc - 26; y < yc + 26; y++) {
    put(x, y, shade('#6a3a22', n2(x * 0.5, y * 0.5) * 0.3 + (Math.sin(x * 0.1 + y * 0.3) > 0.7 ? -0.15 : 0)));
  }
  // caramel swirl highlights
  if (x % 7 === 0) put(x, yc + Math.sin(x * 0.2) * 12, '#ffc86a');
}
// ---- bridges (2) over the river
[[260], [620]].forEach(([bx]) => {
  const yc = 470 + Math.sin(bx * 0.012) * 55 + Math.sin(bx * 0.03) * 12;
  rect(bx - 16, yc - 30, bx + 16, yc + 30, '#9a6440', 0.15);
  outline(bx - 16, yc - 30, bx + 16, yc + 30, '#3a1c0e');
  for (let y = yc - 28; y < yc + 28; y += 6) { put(bx - 14, y, '#ff4a58'); put(bx + 13, y, '#ffffff'); }
});

// ---- GINGERBREAD VILLAGE (E of path, N of river)
[[620, 250, 70, 55], [730, 300, 60, 48], [800, 210, 55, 44]].forEach(([hx, hy, w, h]) => {
  rect(hx - w / 2, hy - h / 2, hx + w / 2, hy + h / 2, '#b87838', 0.15); // house
  outline(hx - w / 2, hy - h / 2, hx + w / 2, hy + h / 2, '#5a3a1a');
  rect(hx - w / 2 - 4, hy - h / 2 - 10, hx + w / 2 + 4, hy - h / 2, '#fff4e0', 0.1); // icing roof line
});
// cupcake cottage + mushroom cottages
circle(680, 380, 22, '#ff9ac8', 0.12); ring(680, 380, 22, 1, '#c04a88');
[[770, 400], [830, 350]].forEach(([mx, my]) => { circle(mx, my, 13, '#ff4a58', 0.15); circle(mx, my - 3, 4, '#ffffff'); });
// destructible cane fences around the village
[[580, 210, 580, 340], [580, 340, 700, 430]].forEach(([x0, y0, x1, y1]) => {
  const steps = 12;
  for (let i = 0; i <= steps; i++) { const fx = x0 + (x1 - x0) * i / steps, fy = y0 + (y1 - y0) * i / steps; put(fx, fy, i % 2 ? '#ff4a58' : '#ffffff'); put(fx, fy - 1, i % 2 ? '#ff4a58' : '#ffffff'); put(fx + 1, fy, '#ffd0e8'); }
});

// ---- COTTON CANDY FOREST (W of path)
for (let i = 0; i < 14; i++) {
  const tx = 50 + (i * 67) % 280, ty = 200 + (i * 113) % 200;
  const c = i % 3 === 0 ? '#4ab8ff' : '#ff9ac8';
  circle(tx, ty, 14 + (i % 3) * 4, c, 0.15);
  put(tx, ty + 18, '#6a3a22'); put(tx, ty + 19, '#6a3a22');
}
// lollipop grove pocket
[[120, 430], [170, 460], [90, 470]].forEach(([lx, ly], i) => { circle(lx, ly, 9, ['#ff4a58', '#b06ae8', '#ff9a3a'][i], 0.1); ring(lx, ly, 9, 0.8, '#ffffff'); });

// ---- FROSTED PEAKS ridge (N, on icing snow)
[[150, 80], [400, 60], [650, 90], [850, 70]].forEach(([px2, py]) => {
  for (let y = 0; y < 55; y++) { const w = y * 0.9; for (let x = px2 - w; x < px2 + w; x++) put(x, py + y, shade(y < 16 ? '#fffdf6' : '#f0a0b8', n2(x, y) * 0.12)); }
  put(px2, py - 2, '#ff4a58');
});
// marshmallow rocks scattered on snow
[[260, 130], [540, 120], [760, 140]].forEach(([mx, my]) => circle(mx, my, 8, '#fffdf6', 0.08));

// ---- SWEET SPRINGS (SE): soda geysers + jelly pond
[[640, 560], [700, 530]].forEach(([gx, gy]) => { circle(gx, gy, 8, '#c8f0e8', 0.1); for (let t = 0; t < 4; t++) put(gx, gy - 10 - t * 4, '#e0fffc'); });
circle(790, 560, 26, '#b06ae8', 0.12); ring(790, 560, 26, 1, '#5a2a90'); // jelly pond
// donut arch + signpost + extras
ring(450, 520, 16, 4, '#ffc86a'); rect(434, 520, 467, 528, '#f8e8f0', 0.05); // donut arch (den gateway on path)
put(430, 380, '#ff4a58'); rect(428, 360, 432, 382, '#e8c090', 0.1); // signpost at crossroads
// sugar cubes + peppermint wheel + taffy posts near den
[[380, 560], [530, 570]].forEach(([sx, sy]) => rect(sx - 7, sy - 7, sx + 7, sy + 7, '#fffdf6', 0.06));
circle(360, 660, 12, '#ff4a58', 0.08); ring(360, 660, 12, 1, '#ffffff');
[[540, 660], [545, 700]].forEach(([tx2, ty2]) => rect(tx2 - 3, ty2 - 12, tx2 + 3, ty2 + 12, '#ff9a3a', 0.15));

// ---- SUGAR BEAR DEN (S-center): gummy clearing + destructible cane fence ring + wafer gate
ring(450, 620, 88, 2.4, '#ff4a58');
for (let a = 0; a < Math.PI * 2; a += 0.14) { const fx = 450 + Math.cos(a) * 88, fy = 620 + Math.sin(a) * 88; put(fx, fy, (a * 10 | 0) % 2 ? '#ffffff' : '#ff4a58'); }
ring(450, 620, 60, 1, '#c04a88'); // inner paw-print ring
// gate gap at top (path enters)
rect(440, 528, 462, 540, '#f8e8f0');

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#3a2430'}" text-anchor="${anchor || 'middle'}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
function labelD(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'SUGAR WORLD — SCENE PLAN (composed, toroidal)', '#c04a88', 18);
label(400, 130, 'FROSTED PEAKS + ICING SNOW', '#8a6a9a', 13);
label(180, 250, 'COTTON CANDY FOREST', '#c04a88', 13);
label(130, 420, 'LOLLIPOP GROVE', '#a04a30', 11);
label(700, 200, 'GINGERBREAD VILLAGE', '#7a4a1a', 13);
label(680, 412, 'CUPCAKE COTTAGE', '#c04a88', 10);
label(660, 245, '(destructible cane fences)', '#a04a30', 10);
label(450, 340, 'PEPPERMINT PATH (wraps N-S)', '#c04a88', 12);
labelD(450, 470, 'CHOCOLATE RIVER (wraps W-E, cross at bridges)', '#ffc86a', 13);
label(260, 445, 'BRIDGE', '#7a4a1a', 11);
label(620, 445, 'BRIDGE', '#7a4a1a', 11);
label(670, 585, 'SODA GEYSERS', '#3a8a7a', 11);
label(790, 595, 'JELLY POND', '#5a2a90', 11);
label(110, 620, 'COOKIE CRUMBLE FLATS', '#7a4a1a', 11);
label(450, 505, 'DONUT ARCH', '#a05a10', 10);
label(450, 615, 'SUGAR BEAR DEN', '#c01838', 15);
label(450, 633, 'gummy floor + fence ring', '#c04a88', 10);
label(430, 352, 'SIGNPOST', '#7a4a1a', 9);
FOOTER.forEach((t, i) => labelD(12, MH + 30 + i * 18, t, (i === 2 || i === 3 || i === 4) ? '#ffd88a' : (i === 7 ? '#ff9ac8' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'sugar_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
