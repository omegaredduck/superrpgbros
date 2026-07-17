// artdev/underworld/render_eternal_scene.js — VICE VERSA planned scene
// diagram. BIG split map: hell half (W) / holy half (E), river of souls
// N-S down the middle, ONE bridge (bone half / gold half). Toroidal:
// E-W wrap seam joins the two OUTER edges directly (that's the "tp" —
// chase trains drop there); N-S wraps normally within each half.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 800;
const FOOTER = [
  'BIG MAP (~1.5x standard realm; scale mob counts w/ area, cap total actors — TUNE). TOROIDAL:',
  '  N-S wraps normally; E-W the OUTER edges join directly (hell west edge <-> holy east edge).',
  "FACTION WARFARE (Red's mechanic): holy + hell mobs DAMAGE EACH OTHER — drag chases across the",
  '  BRIDGE to make armies fight. WRAP-LEASH: chase trains DROP at the E-W wrap seam (only the side',
  '  you arrive on aggros). The bridge is the only chase-preserving crossing.',
  'DOUBLE BOSS: SATAN (hell arena) + SUPREME BEING (holy arena), each TRAPPED on his side. Player',
  '  STARTS ON THE BRIDGE and picks who to fight first; beating one opens a PORTAL to the other side.',
  'Bosses do NOT damage each other. River of souls = impassable, ANIMATED (drifting faces).',
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
function outline(x0, y0, x1, y1, c) { for (let x = x0; x < x1; x++) { put(x, y0, c); put(x, y1 - 1, c); } for (let y = y0; y < y1; y++) { put(x0, y, c); put(x1 - 1, y, c); } }

// ---- the river path (N-S, gentle meander around x=450)
function riverX(y) { return 450 + Math.sin(y * 0.012) * 18; }

// ---- halves
for (let y = 0; y < MH; y++) {
  const rx = riverX(y);
  for (let x = 0; x < W; x++) {
    if (x < rx - 26) put(x, y, shade('#3a2430', n2(x, y) * 0.22)); // brimstone
    else if (x > rx + 26) put(x, y, shade('#d8d4c8', n2(x, y) * 0.12)); // marble/cloud
    else {
      // RIVER OF SOULS
      const t = (x - (rx - 26)) / 52;
      put(x, y, shade('#1e6a58', 0.25 + Math.abs(t - 0.5) * 0.5 + n2(x * 0.5, y * 0.5) * 0.15));
    }
  }
}
// soul motes drifting in the river
for (let k = 0; k < 26; k++) {
  const sy = (k * 61) % MH, sx = riverX(sy) + ((k * 37) % 30) - 15;
  put(sx, sy, '#d2fff2'); put(sx + 1, sy, '#6ae4c8'); put(sx - 1, sy + 1, '#6ae4c8');
}

// ================= HELL HALF zones
// war camp (NW)
rect(40, 60, 220, 200, '#2e1c26', 0.2); outline(40, 60, 220, 200, '#120a10');
// graves quarter (W mid)
rect(30, 260, 180, 380, '#241a20', 0.24); outline(30, 260, 180, 380, '#0e0810');
// magma fields (SW)
[[70, 560, 34], [150, 640, 26], [240, 600, 22]].forEach(([mx, my, mr]) => { for (let a = 0; a < 6.28; a += 0.03) for (let rr = 0; rr < mr; rr += 2) put(mx + Math.cos(a) * rr * (1 + Math.sin(a * 3) * 0.15), my + Math.sin(a) * rr * 0.6, shade('#ff6a1e', 0.25 + rr / mr * 0.5)); });
// bone fields (center-W)
for (let k = 0; k < 30; k++) { const bx = 200 + (k * 47) % 180, by = 240 + (k * 83) % 260; put(bx, by, '#e0d8c4'); put(bx + 1, by, '#8a8270'); }
// SATAN ARENA (deep W, mid-south) — throne + hellmouth ring
ring(150, 470, 70, 2.4, '#ff6a1e');
ring(150, 470, 74, 1, '#8a2808');
rect(120, 420, 180, 440, '#2a1a2e', 0.2); // throne dais
ring(150, 505, 16, 2, '#2a0a10'); // hellmouth
// portal spot (appears after first kill)
ring(230, 470, 10, 1.6, '#8a52ff');

// ================= HOLY HALF zones
// chapel quarter (NE)
rect(660, 60, 860, 200, '#e8e2d2', 0.1); outline(660, 60, 860, 200, '#a8a496');
// fountain plaza (E mid)
rect(700, 280, 850, 400, '#e2ddd0', 0.1); outline(700, 280, 850, 400, '#a8a496');
ring(775, 340, 18, 2, '#4a90b8');
// cloud meadows (SE + NE fringes)
[[560, 140, 40], [620, 620, 46], [820, 560, 36]].forEach(([cx2, cy2, cr]) => { for (let a = 0; a < 6.28; a += 0.04) for (let rr = 0; rr < cr; rr += 3) put(cx2 + Math.cos(a) * rr, cy2 + Math.sin(a) * rr * 0.55, shade('#f4f2ea', rr / cr * 0.16)); });
// SUPREME ARENA (deep E, mid-south) — pearly gate ring
ring(750, 470, 70, 2.4, '#e8b03a');
ring(750, 470, 74, 1, '#8a5c10');
rect(720, 415, 780, 425, '#f2efe6', 0.08); // gate line
[[722, 420], [778, 420]].forEach(([gx, gy]) => ring(gx, gy, 5, 1.4, '#ffe08a'));
// portal spot
ring(670, 470, 10, 1.6, '#8a52ff');

// ================= THE BRIDGE (center, E-W over the river) + START
const BY = 400;
for (let x = 380; x <= 520; x++) {
  for (let y = BY - 14; y <= BY + 14; y++) {
    if (x < 450) put(x, y, shade('#e0d8c4', ((y - BY + 14) % 8 < 1.2 ? 0.45 : 0) + n2(x, y) * 0.12)); // bone half
    else put(x, y, shade('#e8b03a', ((y - BY + 14) % 8 < 1.2 ? 0.45 : 0) + n2(x, y) * 0.12)); // gold half
  }
}
outline(380, BY - 14, 520, BY + 15, '#160a12');
for (let y = BY - 14; y <= BY + 14; y++) put(450, y, '#160a12'); // the seam
// bridge lanterns at both ends
[[376, BY - 18, '#6ae4c8'], [376, BY + 18, '#6ae4c8'], [524, BY - 18, '#fff2c0'], [524, BY + 18, '#fff2c0']].forEach(([lx, ly, c]) => { put(lx, ly, c); ring(lx, ly, 3, 1, shade(c, 0.4)); });
// START marker on the bridge seam
ring(450, BY, 7, 1.6, '#ffffff');

// ================= no-man's-land relics on the banks
// fallen titan sword (hell bank, above bridge)
for (let i = 0; i <= 26; i++) { const t = i / 26; put(Math.round(408 - t * 14), Math.round(330 - t * 40), t < 0.5 ? '#8a92a2' : '#7a5a3a'); put(Math.round(409 - t * 14), Math.round(330 - t * 40), '#3a2a18'); }
rect(384, 292, 404, 296, '#8a5c10');
// boundary obelisks at the outer wrap seam (both far edges)
[[8, 200], [8, 600], [892, 200], [892, 600]].forEach(([ox, oy]) => { for (let y = oy - 16; y <= oy + 16; y++) { const w = 3 - Math.abs(y - oy) / 16 * 2; for (let x = ox - w; x <= ox + w; x++) put(x, y, x < ox ? '#e8b03a' : '#d8ccb0'); } });
// soul geysers in the river
[[riverX(150), 150], [riverX(660), 660]].forEach(([gx, gy]) => { ring(gx, gy, 6, 1.4, '#d2fff2'); put(gx, gy - 8, '#6ae4c8'); put(gx, gy - 12, '#d2fff2'); });

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+').replace(/</g, '(').replace(/>/g, ')'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'VICE VERSA — SCENE PLAN (BIG split map, toroidal)', '#6ae4c8', 18);
label(200, 44, 'HELL HALF', '#ff6a5a', 16);
label(700, 44, 'HOLY HALF', '#ffe08a', 16);
label(130, 76, 'WAR CAMP (drums, banners, racks)', '#ff9a8a', 11);
label(105, 276, 'GRAVES QUARTER', '#c8a8b0', 11);
label(160, 664, 'MAGMA FIELDS', '#ffb04a', 11);
label(285, 230, 'BONE FIELDS', '#d8ccb0', 11);
label(150, 388, 'SATAN ARENA', '#ff6a1e', 13);
label(150, 545, 'hellmouth + throne — TRAPPED his side', '#ff9a8a', 10);
label(230, 452, 'PORTAL (opens after 1st kill)', '#c8aaff', 9);
label(760, 76, 'CHAPEL QUARTER (pews, altar, glass)', '#8a7a52', 11);
label(775, 268, 'FOUNTAIN PLAZA', '#4a90b8', 11);
label(620, 680, 'CLOUD MEADOWS', '#8a92a2', 11);
label(750, 388, 'SUPREME ARENA', '#c8871a', 13);
label(750, 545, 'pearly gate — TRAPPED his side', '#8a7a52', 10);
label(670, 452, 'PORTAL', '#8a52ff', 9);
label(450, 370, 'THE BRIDGE', '#ffffff', 13);
label(413, 432, 'bone half', '#d8ccb0', 10);
label(487, 432, 'gold half', '#ffe08a', 10);
label(450, 447, 'PLAYER STARTS HERE', '#ffffff', 10);
label(450, 90, 'RIVER OF SOULS (animated, impassable)', '#d2fff2', 12);
label(398, 282, 'FALLEN TITAN SWORD', '#b8bcc8', 9);
label(56, 200, 'WRAP SEAM (obelisks) - chase drops', '#c8b890', 9, 'start');
label(844, 620, 'WRAP SEAM - chase drops', '#c8b890', 9, 'end');
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, (i === 2 || i === 3 || i === 4) ? '#ff9a8a' : (i === 5 || i === 6 ? '#ffe08a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'eternal_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
