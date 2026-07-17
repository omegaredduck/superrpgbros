// artdev/west/render_west_scene.js — WILD WEST TOWN planned scene/zone
// diagram (composed layout, not scatter). 900-wide raw buffer + SVG labels.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 780; // map area height
const FOOTER = [
  'TOROIDAL WRAP: desert ring stitches all 4 edges; MAIN STREET (N-S) + RAIL LINE (E) run edge-to-edge.',
  'TOWN spawns: RUSTLER packs in alleys, SIX-GUN BANDIT on street/boardwalks, DYNAMITE DAN behind cover.',
  'DESERT spawns: RATTLESNAKE + SCORPION near rocks/cacti, VULTURE circles trails, DUST DEVIL open sand.',
  'TUMBLEWEED FLATS (W band): tumbleweeds roll with the wind; wind re-rolls at each NOON bell.',
  'NOON at the square: EVERYBODY DRAWS — mobs freeze + telegraph shot lanes; dodged lanes fire back.',
  'BOSS ENTRANCE: doors blast off -> "THIS TOWN AIN\'T BIG ENOUGH FOR THE 2 OF US" -> shoots the',
  '  hitched horse at the trough -> duel circle draws. Circle = OVERLAY, not a tile. All numbers TUNE ME.',
  'NOON EXPRESS: whistle + smoke warn (~2s) -> train thunders down the rail line, lethal on the tracks.',
  '  REUSES yard-realm train tech (scenes.js telegraph) + world_art.js locomotive/boxcar draws.',
];
const H = MH + 24 + FOOTER.length * 18 + 12;

const px = Buffer.alloc(W * H * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
function rect(x0, y0, x1, y1, c, jitter) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { let cc = c; if (jitter) { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; const f = (n - Math.floor(n)) * jitter; cc = shade(c, f); } put(x, y, cc); } }
function shade(c, f) { const [r, g, b] = hex(c); const m = 1 - f; return '#' + [r * m, g * m, b * m].map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join(''); }
function circle(cx, cy, r, c, jitter) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) { let cc = c; if (jitter) { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; cc = shade(c, (n - Math.floor(n)) * jitter); } put(x, y, cc); } }
function ring(cx, cy, r, w, c) { for (let y = cy - r - w; y <= cy + r + w; y++) for (let x = cx - r - w; x <= cx + r + w; x++) { const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2); if (Math.abs(d - r) <= w) put(x, y, c); } }
function outline(x0, y0, x1, y1, c) { for (let x = x0; x < x1; x++) { put(x, y0, c); put(x, y1 - 1, c); } for (let y = y0; y < y1; y++) { put(x0, y, c); put(x1 - 1, y, c); } }

// ---- ground zones -------------------------------------------------------
rect(0, 0, W, MH, '#d8bc8a', 0.12);                    // desert sand ring
rect(0, 0, 150, MH, '#e0c896', 0.1);                   // tumbleweed flats band (W)
// tumbleweed tracks
for (let y = 40; y < MH; y += 90) for (let x = 8; x < 145; x += 4) put(x + Math.sin((y + x) * 0.09) * 6, y + Math.sin(x * 0.11) * 10, '#b09468');
rect(660, 0, 900, 180, '#a87c50', 0.16);               // cracked earth NE
for (let i = 0; i < 26; i++) { const sx = 665 + (i * 53) % 230, sy = 8 + (i * 37) % 165; for (let d = 0; d < 22; d++) put(sx + d, sy + ((i % 3) - 1) * d * 0.5, '#5a3c22'); }
// rail bed strip (E, full height = wraps)
rect(806, 0, 838, MH, '#8a7c64', 0.2);
for (let y = 0; y < MH; y += 14) rect(808, y, 836, y + 5, '#5e4630', 0.15);
rect(812, 0, 815, MH, '#6a707a'); rect(829, 0, 832, MH, '#6a707a');
// town core dirt
rect(200, 110, 700, 670, '#c09a64', 0.14);
// main street spine (N-S, edge to edge = wraps)
rect(415, 0, 485, MH, '#b58c58', 0.1);
for (let y = 0; y < MH; y += 3) { put(432, y, '#96703e'); put(468, y, '#96703e'); } // ruts
// clock tower square (duel ground)
circle(450, 390, 120, '#c8a064', 0.08);
ring(450, 390, 100, 2, '#f0e8d0');                     // chalk overlay (effect)
ring(450, 390, 80, 1, '#8a2018');                      // inner red ring
// boardwalk aprons
rect(255, 300, 415, 330, '#8a6a48', 0.18);             // saloon apron
rect(485, 300, 645, 330, '#8a6a48', 0.18);             // jail apron
rect(485, 120, 615, 145, '#8a6a48', 0.18);             // church apron

// ---- buildings (blocks) -------------------------------------------------
function building(x0, y0, x1, y1, c, oc) { rect(x0, y0, x1, y1, c, 0.12); outline(x0, y0, x1, y1, oc || '#2a1c10'); }
building(240, 190, 410, 300, '#8a6444');               // SALOON (interior = saloon floor tile)
rect(250, 200, 400, 290, '#9a7048', 0.2);              // floorboards hint
building(490, 190, 640, 300, '#787468');               // JAIL (stone)
rect(498, 292, 540, 300, '#3a3630');                   // jail iron doors → face square
building(560, 330, 640, 400, '#6a5a40');               // GALLOWS platform
building(490, 40, 610, 120, '#ece4d0');                // CHURCH (N end)
building(250, 480, 330, 560, '#7a5c3c');               // WATER TOWER footprint
circle(300, 640, 26, '#6a7c8e', 0.1);                  // TROUGH + pump
rect(340, 620, 420, 640, '#5e4630', 0.1);              // HITCHING POSTS row
// the horse — hitched at the trough (Sheriff's entrance victim)
circle(330, 615, 12, '#6e4a2e', 0.12); circle(342, 606, 6, '#5a3a22', 0.12); rect(326, 625, 329, 638, '#4a2e1a'); rect(336, 625, 339, 638, '#4a2e1a');
building(520, 470, 600, 540, '#8a7050');               // STABLE-side: WAGON parked
building(852, 300, 895, 420, '#9a4838');               // STAGECOACH stop by rails
// clock tower (square N edge)
building(430, 250, 470, 292, '#a08050'); circle(450, 262, 9, '#ece4d0');
// windmill + water tower icons (outskirt landmarks)
circle(120, 210, 16, '#c8ccd0', 0.1); ring(120, 210, 16, 1, '#3a3a3a');   // WINDMILL (NW flats edge)
circle(680, 700, 18, '#7a5c3c', 0.1);                                      // spare barrels S
// cacti + rocks in desert ring
[[60, 500], [90, 660], [190, 60], [340, 40], [720, 260], [760, 520], [660, 60], [130, 360], [560, 720], [250, 730]].forEach(([x, y]) => circle(x, y, 7, '#5a7e46', 0.15));
[[770, 640], [70, 90], [230, 20], [700, 420], [820 - 60, 700]].forEach(([x, y]) => circle(x, y, 10, '#8a7458', 0.2));
// barrels + wagon props on street
[[400, 560], [500, 210], [390, 300]].forEach(([x, y]) => circle(x, y, 6, '#7a5834', 0.2));

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels ---------------------------------------------------------
function esc(s) { return s.replace(/&/g, '+'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 15}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'WILD WEST TOWN — SCENE PLAN (composed, toroidal)', '#41d6f6', 18);
label(75, 60, 'TUMBLEWEED', '#e8d8a8', 13); label(75, 76, 'FLATS (wind)', '#e8d8a8', 12);
label(780, 30, 'CRACKED EARTH', '#ffb98a', 13);
label(822, 470, 'RAIL LINE (wraps N-S)', '#d0d4da', 12);
label(822, 560, 'NOON EXPRESS', '#ffd88a', 12);
// the train — locomotive + boxcars on the rails (yard assets reused)
rect(810, 580, 834, 640, '#3a3e46'); rect(808, 574, 836, 584, '#22242a'); circle(822, 570, 7, '#22242a');
rect(810, 648, 834, 700, '#7a3a2a'); rect(810, 706, 834, 758, '#7a5a2a');
[[586, '#ffe8a0'], [652, '#4a2018'], [710, '#4a3418']].forEach(([y, c]) => rect(814, y, 830, y + 6, c));
label(895, 440, 'STAGE STOP', '#ff9a8a', 11, 'end');
label(325, 180, 'SALOON', '#ffd88a', 14);
label(565, 180, 'JAIL', '#d0d4da', 14);
label(519, 312, 'IRON DOORS', '#ff6a5a', 11);
label(600, 415, 'GALLOWS', '#c8b090', 11);
label(550, 80, 'CHURCH', '#7a6a50', 13);
label(450, 240, 'CLOCK TOWER', '#ffe8a0', 12);
label(450, 395, 'DUEL GROUND', '#fff0d0', 15);
label(450, 412, 'boss arena + noon circle', '#e0c8a0', 11);
label(290, 470, 'WATER TWR', '#c8b090', 11);
label(120, 190, 'WINDMILL', '#d0d4da', 11);
label(300, 668, 'TROUGH', '#a8c8e0', 11);
label(330, 596, 'THE HORSE', '#ffb0a0', 10);
label(380, 648, 'HITCH ROW', '#c8b090', 10);
label(560, 505, 'WAGON YARD', '#c8b090', 11);
label(450, 745, 'MAIN STREET (wraps N-S)', '#f0d8a8', 13);
label(80, 745, 'DESERT RING (wraps all edges)', '#e8d0a0', 12, 'start');
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, i === 4 || i === 5 ? '#ffd88a' : '#aab2c0', 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'west_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
