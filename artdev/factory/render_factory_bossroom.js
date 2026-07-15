// artdev/render_factory_bossroom.js — top-down layout of the custom boss arena
// "THE PROTOTYPE BAY" for Red's approval. Square room, 4 cover pillars, ceiling
// presses, wall turrets, 2 in-ground belts, dormant PROTOTYPE 130C-4 at top,
// center reactor-overload spot, floor-lift + player entry.
'use strict';
const sharp = require('sharp');
const W = 820, H = 880;
const buf = Buffer.alloc(W * H * 4);
const hexc = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function px(x, y, c, a) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H || !c) return; const [r, g, b] = hexc(c); const i = (y * W + x) * 4; const al = a == null ? 1 : a; buf[i] = buf[i] * (1 - al) + r * al; buf[i + 1] = buf[i + 1] * (1 - al) + g * al; buf[i + 2] = buf[i + 2] * (1 - al) + b * al; buf[i + 3] = 255; }
function mixc(h1, h2, t) { const a = hexc(h1), b = hexc(h2); return '#' + [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0')).join(''); }
function rect(x0, y0, x1, y1, sh) { for (let y = y0 | 0; y < y1; y++) for (let x = x0 | 0; x < x1; x++) px(x, y, typeof sh === 'function' ? sh(x, y) : sh); }
function shRiv(x, y) { const T = 54, tx = x % T, ty = y % T; let b = mixc('#8a94a6', '#697386', ty / T); if (tx < 2 || ty < 2) b = '#2b3245'; const d = Math.hypot(tx - 7, ty - 7); if (tx > 3 && tx < 11 && ty > 3 && ty < 11 && d < 3) b = '#c7cdd6'; return b; }
function shHaz(x, y) { const T = 26, tx = x % T, ty = y % T; return (Math.floor(((tx + ty) % T) / (T / 2)) === 0) ? '#ffcd45' : '#20212c'; }
function plateBox(x0, y0, x1, y1, base, hi, dk) { for (let y = y0 | 0; y < y1; y++) { const vt = (y - y0) / Math.max(1, y1 - y0 - 1); for (let x = x0 | 0; x < x1; x++) { const tx = (x - x0) / Math.max(1, x1 - x0 - 1); let b = mixc(hi, base, Math.min(1, vt * 1.1)); b = mixc(b, dk, Math.max(0, (vt - 0.55) * 1.2)); if (tx < 0.12) b = mixc(b, hi, 0.5); if (tx > 0.9) b = mixc(b, dk, 0.5); px(x, y, b); } } }
function disc(cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) px(cx + x, cy + y, typeof c === 'function' ? c(x / r, y / r) : c); }

const RX0 = 40, RY0 = 108, RX1 = 780, RY1 = 848;
// floor
rect(RX0, RY0, RX1, RY1, shRiv);
// hazard border (inner)
rect(RX0, RY0, RX1, RY0 + 20, shHaz); rect(RX0, RY1 - 20, RX1, RY1, shHaz);
rect(RX0, RY0, RX0 + 20, RY1, shHaz); rect(RX1 - 20, RY0, RX1, RY1, shHaz);
// room outline
rect(RX0 - 4, RY0 - 4, RX1 + 4, RY0, '#41d6f6'); rect(RX0 - 4, RY1, RX1 + 4, RY1 + 4, '#41d6f6');
rect(RX0 - 4, RY0 - 4, RX0, RY1 + 4, '#41d6f6'); rect(RX1, RY0 - 4, RX1 + 4, RY1 + 4, '#41d6f6');

// ---- in-ground conveyor belts (flush) ----
function belt(x0, y0, x1, y1, horiz, dir) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const across = horiz ? (y - y0) / (y1 - y0) : (x - x0) / (x1 - x0);
    const along = horiz ? x : y;
    let c;
    if (across < 0.12 || across > 0.88) c = (Math.floor(along / 12) % 2 ? '#ffcd45' : '#20212c'); // hazard side strip
    else { c = mixc('#2a2d38', '#16171d', Math.abs(across - 0.5) * 2); const k = ((dir > 0 ? along : -along) % 34 + 34) % 34; const cd = Math.abs(across - 0.5) * (horiz ? (y1 - y0) : (x1 - x0)); if (Math.abs(k - (8 + cd)) < 3) c = '#ffcd45'; }
    px(x, y, c);
  }
}
belt(RX0 + 20, 432, RX1 - 20, 490, true, +1);   // horizontal belt → right
belt(372, 250, 430, RY1 - 20, false, +1);        // vertical belt ↓ down

// ---- mech dock at TOP: dormant PROTOTYPE 130C-4 on a gantry ----
plateBox(300, RY0 + 20, 500, 250, '#454e63', '#697386', '#2b3245'); // gantry platform
rect(300, RY0 + 20, 500, RY0 + 30, shHaz);
// top-down mech: two feet + torso block + weapon stubs
plateBox(360, 150, 440, 232, '#697386', '#c7cdd6', '#2b3245'); // torso
[370, 415].forEach(fx => plateBox(fx, 205, fx + 34, 244, '#3d4456', '#8a94a6', '#242a38')); // feet
[330, 470].forEach(ax => plateBox(ax - 10, 158, ax + 10, 210, '#3d4456', '#8a94a6', '#242a38')); // arm/weapon stubs
disc(400, 180, 10, (tx, ty) => (tx * tx + ty * ty < 0.5 ? '#41d6f6' : '#1f78a8')); // cockpit optic (dim)
// ladder up the platform
[386, 414].forEach(lx => rect(lx, 150, lx + 4, 250, '#c7cdd6')); for (let ry = 158; ry < 250; ry += 12) rect(386, ry, 418, ry + 3, '#8a94a6');

// ---- 4 cover PILLARS ----
const PIL = [[230, 330], [590, 330], [230, 626], [590, 626]];
PIL.forEach(p => { disc(p[0] + 6, p[1] + 8, 34, '#101119'); plateBox(p[0] - 30, p[1] - 30, p[0] + 30, p[1] + 30, '#8a94a6', '#c7cdd6', '#2b3245'); [[-22, -22], [22, -22], [-22, 22], [22, 22]].forEach(o => disc(p[0] + o[0], p[1] + o[1], 4, '#454e63')); rect(p[0] - 30, p[1] - 30, p[0] + 30, p[1] - 24, '#c7cdd6'); });

// ---- 4 ceiling PRESS pads ----
const PRESS = [[150, 300], [670, 300], [150, 700], [670, 700]];
PRESS.forEach(p => { for (let r = 40; r > 0; r--) disc(p[0], p[1], r, (Math.floor(r / 6) % 2 ? '#ff4b3e' : '#20212c')); plateBox(p[0] - 24, p[1] - 24, p[0] + 24, p[1] + 24, '#5a6072', '#8a94a6', '#363b4d'); });

// ---- 4 wall TURRETS ----
const TUR = [[RX0 + 6, 460], [RX1 - 42, 460], [250, RY1 - 42], [560, RY1 - 42]];
TUR.forEach(t => { plateBox(t[0], t[1], t[0] + 36, t[1] + 34, '#3d4456', '#697386', '#242a38'); disc(t[0] + 18, t[1] + 17, 8, '#9e2422'); disc(t[0] + 18, t[1] + 17, 4, '#ff4b3e'); rect(t[0] + 14, t[1] + 14, t[0] + 40, t[1] + 20, '#242a38'); });

// center reactor-overload marker
for (let r = 30; r > 0; r--) disc(401, 461, r, (Math.floor(r / 5) % 2 ? '#ff7d3a' : null));
disc(401, 461, 8, '#ffd34d');

async function main() {
  const lbl = (x, y, t, c, sz) => `<text x="${x}" y="${y}" font-family="monospace" font-size="${sz || 13}" font-weight="bold" fill="${c}" text-anchor="middle" stroke="#141620" stroke-width="0.6">${t}</text>`;
  const svg = Buffer.from(`<svg width="${W}" height="${H}">
    <rect x="0" y="0" width="${W}" height="80" fill="#181a26"/>
    <text x="${W / 2}" y="30" font-family="monospace" font-size="19" font-weight="bold" fill="#41d6f6" text-anchor="middle">BIOME 4 · BOSS ARENA — "THE PROTOTYPE BAY"  (top-down, for approval)</text>
    <text x="${W / 2}" y="56" font-family="monospace" font-size="13" fill="#8a94a6" text-anchor="middle">square room · phase 1 = Engineer on foot · phase 2 = PROTOTYPE 130C-4 climbs down + hunts you</text>
    ${lbl(400, 100, 'DORMANT  PROTOTYPE 130C-4  (boarding gantry + ladder)', '#ffcd45', 13)}
    ${lbl(230, 330, 'PILLAR', '#141620', 12)}${lbl(590, 330, 'PILLAR', '#141620', 12)}${lbl(230, 626, 'PILLAR', '#141620', 12)}${lbl(590, 626, 'PILLAR', '#141620', 12)}
    ${lbl(150, 300, 'PRESS', '#ffb0a0', 11)}${lbl(670, 300, 'PRESS', '#ffb0a0', 11)}${lbl(150, 700, 'PRESS', '#ffb0a0', 11)}${lbl(670, 700, 'PRESS', '#ffb0a0', 11)}
    ${lbl(500, 461, 'CONVEYOR →', '#ffcd45', 12)}${lbl(455, 560, 'CONVEYOR ↓', '#ffcd45', 12)}
    ${lbl(401, 500, 'REACTOR OVERLOAD spot', '#ff7d3a', 12)}${lbl(401, 516, '(hide behind a PILLAR)', '#ff7d3a', 11)}
    ${lbl(410, 800, 'ENGINEER FLOOR-LIFT (phase-1 entrance)', '#5fe86b', 12)}
    ${lbl(400, 868, '▲  PLAYER ENTRY', '#5fe86b', 13)}
    <rect x="596" y="120" width="200" height="118" fill="#141620" opacity="0.85" stroke="#41d6f6"/>
    <text x="610" y="142" font-family="monospace" font-size="12" font-weight="bold" fill="#41d6f6">LEGEND</text>
    <circle cx="618" cy="160" r="7" fill="#8a94a6"/><text x="632" y="165" font-family="monospace" font-size="11" fill="#c7cdd6">pillar (LOS cover)</text>
    <circle cx="618" cy="180" r="7" fill="#5a6072" stroke="#ff4b3e" stroke-width="2"/><text x="632" y="185" font-family="monospace" font-size="11" fill="#c7cdd6">ceiling press pad</text>
    <rect x="611" y="193" width="14" height="12" fill="#3d4456" stroke="#9e2422"/><text x="632" y="204" font-family="monospace" font-size="11" fill="#c7cdd6">wall turret</text>
    <rect x="611" y="213" width="14" height="8" fill="#2a2d38"/><text x="632" y="222" font-family="monospace" font-size="11" fill="#ffcd45">in-ground conveyor</text>
  </svg>`);
  // floor-lift pad marker (draw behind labels): a green-ringed pad near center-bottom
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'factory_bossroom.png');
  console.log('wrote bossroom', W + 'x' + H);
}
// engineer floor-lift pad
for (let r = 26; r > 0; r--) disc(401, 760, r, (Math.floor(r / 5) % 2 ? '#2b9e3a' : '#20212c'));
disc(401, 760, 7, '#5fe86b');
main().catch(e => { console.error(e); process.exit(1); });
