// artdev/colosseum/render_colosseum_scene.js — COLOSSEUM planned scene
// diagram. ROUND ARENA (no toroidal wrap — the campaign's one exception):
// crowd tiers visible beyond the wall all the way around.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 820;
const FOOTER = [
  'ROUND MAP — NO WRAP (the one exception): playfield = the sand circle; arena wall bounds it; CROWD TIERS ring the outside.',
  'THE PROGRAM (map cycle, announced by trumpets + placard from the box): BEAST RELEASE (gates open, beast wave) ->',
  '  TRAPDOOR SHUFFLE (hatches pop, floor re-routes) -> CHARIOT LAP (racers circle the rim track) -> INTERMISSION (roses + loot).',
  'Sand spawns: gladiator/retiarius/legionary/hounds/favorite/vestal/executioner. Beasts enter via the GATES.',
  'CHARIOT RACER rides the RIM TRACK ring; handler trails the beasts; vestal haunts the plinths.',
  'BOSS: DIVINITY HIMSELF — box floor lowers as a gilded lift mid-toast, then he WINE-WAVE SURFS to center arena.',
  'Fight = the open center circle. Wine slicks + doom rings + THE PROGRAM keep running (ENCORE! verb). All numbers TUNE ME.',
];
const H = MH + 24 + FOOTER.length * 18 + 12;

const px = Buffer.alloc(W * H * 4);
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function shade(c, f) { const [r, g, b] = hex(c); const m = 1 - f; return '#' + [r * m, g * m, b * m].map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join(''); }
function circleFill(cx, cy, r0, r1, fn) {
  for (let y = Math.max(0, cy - r1); y <= Math.min(H - 1, cy + r1); y++)
    for (let x = Math.max(0, cx - r1); x <= Math.min(W - 1, cx + r1); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d >= r0 && d <= r1) { const c = fn(x, y, d, Math.atan2(y - cy, x - cx)); if (c) put(x, y, c); }
    }
}
function rect(x0, y0, x1, y1, c, j) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, j ? shade(c, n2(x, y) * j) : c); }
function ring(cx, cy, r, w, c) { circleFill(cx, cy, r - w, r + w, () => c); }

const CX = 450, CY = 408;
// background void
rect(0, 0, W, MH, '#0d0e16');
// ---- CROWD TIERS (3 rings of colored head-dots on marble)
const tierCols = ['#c8c0b0', '#bab2a0', '#aca492'];
[[398, 352], [352, 310], [310, 272]].forEach(([rOut, rIn], t) => {
  circleFill(CX, CY, rIn, rOut, (x, y) => shade(tierCols[t], n2(x * 0.1, y * 0.1) * 0.15));
  // crowd dots
  const rMid = (rOut + rIn) / 2;
  for (let a = 0; a < Math.PI * 2; a += 0.05 - t * 0.006) {
    const f = n2(a * 57, t * 9);
    const rr = rMid + (f - 0.5) * (rOut - rIn) * 0.6;
    const hx = CX + Math.cos(a) * rr, hy = CY + Math.sin(a) * rr;
    const cols = ['#a03028', '#5a2a6a', '#e0a832', '#d8a878', '#3e6a8a', '#5a7e46', '#a87850'];
    const cc = cols[(f * 7) | 0];
    put(hx, hy, cc); put(hx + 1, hy, cc); put(hx, hy + 1, shade(cc, 0.4)); put(hx + 1, hy + 1, shade(cc, 0.4));
  }
});
// velarium mast stubs on the outer rim
for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
  const mx = CX + Math.cos(a) * 396, my = CY + Math.sin(a) * 396;
  rect(mx - 2, my - 2, mx + 3, my + 3, '#5a4430');
}
// ---- ARENA WALL (marble ring)
circleFill(CX, CY, 258, 272, (x, y) => shade('#d8d4c8', n2(x * 0.15, y * 0.15) * 0.25));
ring(CX, CY, 272, 1.4, '#6a6458');
ring(CX, CY, 258, 1.4, '#6a6458');
// ---- RIM TRACK (chariot lane ring)
circleFill(CX, CY, 224, 258, (x, y, d) => {
  let c = shade('#c8a878', n2(x * 0.2, y * 0.2) * 0.3);
  if (Math.abs(d - 234) < 1.6 || Math.abs(d - 248) < 1.6) c = shade(c, 0.35); // ruts
  return c;
});
// ---- SAND FIELD
circleFill(CX, CY, 0, 224, (x, y) => shade('#e0c894', n2(x * 0.08, y * 0.08) * 0.22));
ring(CX, CY, 224, 1.2, '#96784e');
// rake circles
[70, 120, 170].forEach(r => ring(CX, CY, r, 0.7, '#cbb27e'));
// ---- CENTER: boss circle
ring(CX, CY, 52, 1.6, '#f0e8d0');
ring(CX, CY, 44, 1, '#8a1622');
// wine stains around center
[[430, 380, 14], [488, 420, 10], [452, 452, 8]].forEach(([sx, sy, sr]) => circleFill(sx, sy, 0, sr, (x, y, d) => (n2(x, y) > 0.25 ? shade('#7a1622', d / sr * 0.4) : null)));
// ---- GATES (N under the box, SW, SE) — dark arches through the wall
const gates = [[Math.PI * 1.5, 'N'], [Math.PI * 0.75, 'SW'], [Math.PI * 0.25, 'SE']];
gates.forEach(([a]) => {
  circleFill(CX, CY, 222, 274, (x, y, d, ang) => {
    let da = Math.abs(ang - a); if (da > Math.PI) da = Math.PI * 2 - da;
    if (da < 0.075) return shade('#241812', (274 - d) / 60 * 0.4);
    if (da < 0.095) return '#6a6e78'; // portcullis frame
    return null;
  });
});
// ---- EMPEROR'S BOX (N, above the wall — juts over the crowd)
rect(CX - 55, CY - 335, CX + 55, CY - 268, '#d8d4c8', 0.15);
rect(CX - 55, CY - 345, CX + 55, CY - 335, '#5a2a6a'); // canopy strip
rect(CX - 55, CY - 337, CX + 55, CY - 335, '#e0a832');
// gilt floor
rect(CX - 40, CY - 325, CX + 40, CY - 278, '#c8a850', 0.2);
// throne dot
rect(CX - 7, CY - 312, CX + 7, CY - 296, '#e0a832');
// lift shaft dashes (box → arena)
for (let y = CY - 268; y < CY - 224; y += 8) rect(CX - 1, y, CX + 1, y + 4, '#f8d878');
// ---- IMPERIAL CARPET: N gate → center
for (let y = CY - 258; y < CY - 52; y++) {
  const w = 13;
  for (let x = CX - w; x <= CX + w; x++) {
    const edge = Math.abs(Math.abs(x - CX) - w) < 2;
    put(x, y, edge ? '#e0a832' : shade('#a02028', n2(x * 0.3, y * 0.3) * 0.25));
  }
}
// ---- TRAPDOORS + HYPOGEUM GRATES (scattered, symmetric-ish)
[[360, 330], [545, 330], [340, 480], [560, 480], [450, 540]].forEach(([tx, ty]) => {
  rect(tx - 13, ty - 10, tx + 13, ty + 10, '#5a4430', 0.2);
  rect(tx - 10, ty - 7, tx + 10, ty + 7, '#241812');
  for (let i = -8; i <= 8; i += 4) rect(tx + i, ty - 7, tx + i + 1, ty + 7, '#6a6e78');
});
// ---- DECOR MARKERS
// spina obelisk (center-N offset)
rect(CX - 4, CY - 130, CX + 4, CY - 96, '#c88a6a', 0.2); rect(CX - 6, CY - 96, CX + 6, CY - 90, '#d8d4c8');
// laurel arch (S entry on sand)
rect(CX - 20, CY + 176, CX - 12, CY + 208, '#d8d4c8', 0.15); rect(CX + 12, CY + 176, CX + 20, CY + 208, '#d8d4c8', 0.15); rect(CX - 20, CY + 168, CX + 20, CY + 176, '#d8d4c8', 0.15);
// statues + plinths (vestal turf, W + E)
[[300, 400], [600, 400]].forEach(([sx, sy]) => { rect(sx - 8, sy - 8, sx + 8, sy + 8, '#d8d4c8', 0.2); rect(sx - 4, sy - 22, sx + 4, sy - 8, '#b08036', 0.2); });
// braziers + torches ring inside track
for (let a = Math.PI / 6; a < Math.PI * 2; a += Math.PI / 3) {
  const bx = CX + Math.cos(a) * 200, by = CY + Math.sin(a) * 200;
  rect(bx - 3, by - 3, bx + 4, by + 4, '#b08036'); put(bx, by - 5, '#ff7d3a'); put(bx + 1, by - 6, '#ffd34d');
}
// cage wagons flanking SW + SE gates (inside wall)
[[Math.PI * 0.75], [Math.PI * 0.25]].forEach(([a]) => {
  const wx2 = CX + Math.cos(a) * 205, wy2 = CY + Math.sin(a) * 205;
  rect(wx2 - 12, wy2 - 8, wx2 + 12, wy2 + 8, '#8a6a48', 0.2);
  for (let i = -9; i <= 9; i += 4) rect(wx2 + i, wy2 - 8, wx2 + i + 1, wy2 + 8, '#2e3038');
});
// weapon racks + palus (SW sand)
rect(355, 520, 380, 528, '#8a6a48', 0.2); rect(520, 520, 528, 545, '#8a6a48', 0.2);
// chain posts near center-W
[[380, 408], [396, 430]].forEach(([cxp, cyp]) => { rect(cxp - 2, cyp - 6, cxp + 2, cyp + 2, '#2e3038'); });
// she-wolf statue NE inside track
rect(560, 300, 580, 312, '#e0a832', 0.25);
// banners on the wall ring (4x)
[Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.5, Math.PI].forEach(a => {
  const bx = CX + Math.cos(a) * 265, by = CY + Math.sin(a) * 265;
  rect(bx - 3, by - 10, bx + 3, by + 10, '#a02028');
});

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'COLOSSEUM — SCENE PLAN (ROUND arena, crowd ring, NO wrap)', '#41d6f6', 18);
label(CX, CY - 350, 'THE BOX — DIVINITY HIMSELF', '#f8d878', 14);
label(CX, CY - 246, 'GILDED LIFT + WINE-WAVE SURF PATH', '#d05a4a', 11);
label(CX, CY - 4, 'BOSS CIRCLE', '#fff0d0', 14);
label(CX, CY + 14, 'wine stains + doom rings', '#e0c8a0', 10);
label(CX, CY - 108, 'OBELISK', '#ffb98a', 10);
label(CX, CY + 196, 'LAUREL ARCH (player spawn)', '#f0e8d0', 11);
label(300, 382, 'PLINTHS + STATUES', '#d0d4da', 10);
label(600, 382, '(vestal turf)', '#d0b8e8', 10);
label(CX - 190, CY - 190, 'RIM TRACK — CHARIOT LAP', '#ffd88a', 12);
label(CX + 254, CY + 40, 'ARENA WALL', '#d0d4da', 11);
label(CX, CY - 282, 'GATE N', '#ff9a8a', 10);
label(CX - 170, CY + 172, 'GATE SW', '#ff9a8a', 11);
label(CX + 170, CY + 172, 'GATE SE', '#ff9a8a', 11);
label(360, 316, 'TRAPDOORS', '#c8b090', 10);
label(560, 290, 'SHE-WOLF', '#ffe8a0', 10);
label(120, 80, 'CROWD TIERS', '#e8d8a8', 13);
label(120, 96, '(border ring art,', '#aab2c0', 10);
label(120, 110, 'always visible)', '#aab2c0', 10);
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, i === 1 || i === 2 ? '#ffd88a' : (i === 5 || i === 6 ? '#d05a4a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'colosseum_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
