// artdev/abyss/render_abyss_scene.js — THE ABYSS planned scene/zone
// diagram (composed layout). Toroidal wrap (standard rule).
'use strict';
const sharp = require('sharp');

const W = 900, MH = 780;
const FOOTER = [
  'TOROIDAL WRAP: trench floor stitches all 4 edges; kelp lanes + rift line run edge-to-edge so the wrap reads.',
  'THE UNDERTOW (map cycle): kelp bends + particles stream + rumble (warn) -> ~8s pull toward the nearest DROP',
  '  chasm; drags MOBS too. Anchor behind wrecks/rocks/CORAL. Direction re-rolls each cycle.',
  'DESTRUCTIBLE CORAL REEF: coral walls block movement + shots; ANYONE can break them (shrapnel puff);',
  '  the Leviathan SMASHES through; slow regrow. Your undertow anchors — spend them wisely.',
  'Mob turf: fishermen/divers haunt the wreck field · lobsters+snakes in the reef · jellies drift the kelp ·',
  '  volt eels at the vents · starfish everywhere · snail heals from the back · kraken spawn guards the chest.',
  'BOSS: VOLT WYRM slithers the whole SOUTH BASIN (serpentine undulation); DROP pits are his dive doors.',
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

// ---- base: abyssal silt everywhere
rect(0, 0, W, MH, '#333e52', 0.18);
// trench basalt band N
rect(0, 0, W, 150, '#242c3c', 0.2);
// black sand SE
rect(600, 560, 900, MH, '#1a1e28', 0.2);
// shell gravel patch W
rect(0, 320, 180, 520, '#4e4e46', 0.2);
// coral shelf zone E (the REEF)
rect(620, 180, 900, 480, '#3e2e42', 0.16);
// vent basalt field SW
rect(120, 560, 420, MH, '#241e2a', 0.18);

// ---- DROP chasms (pit tiles) — scattered, boss doors
const drops = [[450, 620, 55, 30], [180, 240, 40, 22], [760, 640, 45, 24], [660, 90, 38, 20]];
drops.forEach(([cx, cy, rx, ry]) => {
  for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(x, y, shade('#05080e', n2(x, y) * 0.3));
  }
  ring(cx, cy, rx, 1.2, '#0e1624');
});

// ---- KELP FOREST lanes (N-S, wrap-readable) center-west
for (let i = 0; i < 14; i++) {
  const kx = 240 + (i * 37) % 130, ky0 = (i * 61) % 120;
  for (let y = ky0; y < MH; y += 8) put(kx + Math.sin(y * 0.05 + i) * 4, y, i % 2 ? '#4a7a3a' : '#2e5424');
}
// rift line E-W (trench crack, wraps)
for (let x = 0; x < W; x += 2) { const y = 520 + Math.sin(x * 0.02) * 14; put(x, y, '#0e1624'); put(x, y + 1, '#0e1624'); put(x, y + 2, '#1a2436'); }

// ---- WRECK FIELD (NW quadrant)
rect(60, 60, 200, 130, '#4e3a28', 0.25); outline(60, 60, 200, 130, '#241812'); // hull footprint
rect(90, 82, 170, 108, '#3a2a1c', 0.2);
circle(240, 100, 12, '#8a5a3a', 0.2); // anchor spot
rect(300, 60, 340, 96, '#c8963c', 0.2); // diving bell
circle(150, 180, 10, '#f8d878', 0.15); // treasure chest (kraken-guarded)
rect(360, 130, 420, 160, '#8a7628', 0.2); // sunken sub
rect(80, 200, 130, 224, '#4e3a28', 0.25); // cannon + crates
// sunken lighthouse SW landmark (toppled diagonal)
for (let t = 0; t < 1; t += 0.02) { const lx = 60 + t * 150, ly = 700 - t * 60; circle(lx, ly, 8 - t * 4, (t * 8 | 0) % 2 ? '#a83a2e' : '#c8c0b0', 0.15); }
circle(216, 636, 7, '#ffd88a'); // still-lit lantern

// ---- REEF: destructible coral clusters (E zone)
for (let i = 0; i < 22; i++) {
  const rx2 = 640 + (i * 53) % 240, ry2 = 200 + (i * 97) % 260;
  const cols = ['#c86a8a', '#8a5adc', '#3aa0b8', '#e05a3a'];
  circle(rx2, ry2, 8 + (i % 3) * 3, cols[i % 4], 0.3);
  ring(rx2, ry2, 8 + (i % 3) * 3, 0.8, shade(cols[i % 4], 0.5));
}
// giant clam + anemones in the reef
circle(700, 420, 12, '#b0a890', 0.2); put(700, 415, '#ffffff');
[[820, 250], [770, 350]].forEach(([ax, ay]) => circle(ax, ay, 7, '#e8aab8', 0.25));

// ---- VENT FIELD (SW): black smokers + tube worms
[[180, 640], [260, 690], [340, 620]].forEach(([vx, vy]) => {
  for (let t = 0; t < 1; t += 0.08) circle(vx + Math.sin(t * 5) * 3, vy - t * 30, 5 - t * 3, '#2a2430', 0.2);
  circle(vx, vy, 7, '#3a3040', 0.2); put(vx, vy - 4, '#ff7d3a');
  circle(vx + 18, vy + 6, 5, '#e8e4d8', 0.2); // tube worms
});

// ---- WHALE FALL (NE, near cracked rift)
for (let t = 0; t < 1; t += 0.04) { const wx2 = 520 + t * 120, wy2 = 200 + Math.sin(t * Math.PI) * 8; put(wx2, wy2, '#c8c0a8'); put(wx2, wy2 + 1, '#8a8670'); }
[-0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75].forEach((t, i) => { const wx2 = 530 + t * 110; for (let y = 0; y < 18 - Math.abs(i - 3) * 3; y++) put(wx2, 200 - y, '#a8a088'); });
circle(508, 202, 10, '#b0a890', 0.2); // skull

// ---- BOSS BASIN (S center): open silt arena w/ the big DROP
ring(450, 620, 100, 2, '#d8e84a'); // volt ring marker
ring(450, 620, 88, 1, '#6a7218');

// ---- spawn: diving bell? spawn at the BELL (NW)
ring(320, 78, 20, 1.6, '#f0e8d0');

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'THE ABYSS — SCENE PLAN (composed, toroidal)', '#41d6f6', 18);
label(130, 52, 'WRECK FIELD', '#e0b060', 14);
label(320, 52, 'DIVING BELL (spawn)', '#f0e8d0', 12);
label(150, 196, 'CHEST (kraken)', '#f8d878', 10);
label(390, 122, 'SUNKEN SUB', '#e8cc70', 10);
label(240, 92, 'ANCHOR', '#c8a878', 10);
label(305, 148, 'KELP FOREST (wraps N-S)', '#7ea862', 12);
label(575, 178, 'WHALE FALL', '#e8e0c8', 12);
label(760, 168, 'CORAL REEF — DESTRUCTIBLE COVER', '#ff9ab8', 13);
label(700, 440, 'GIANT CLAM', '#e8e0c8', 10);
label(90, 310, 'SHELL FLATS', '#c8c0a8', 11);
label(270, 585, 'VENT FIELD (volt eels)', '#ff9a5a', 12);
label(160, 660, 'SUNKEN LIGHTHOUSE', '#ffb0a0', 11);
label(450, 545, 'RIFT LINE (wraps E-W)', '#8ab0d8', 11);
label(450, 620, 'BOSS BASIN', '#f8ffb0', 15);
label(450, 638, 'VOLT WYRM slithers here', '#d8e84a', 11);
label(450, 656, 'DROP pits = his dive doors', '#aab2c0', 10);
label(180, 228, 'DROP', '#6a7a9a', 10);
label(660, 78, 'DROP', '#6a7a9a', 10);
label(760, 628, 'DROP', '#6a7a9a', 10);
label(700, 745, 'BLACK SAND DUNES', '#8a92a8', 12);
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, (i >= 1 && i <= 4) ? '#ffd88a' : (i === 7 ? '#d8e84a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'abyss_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
