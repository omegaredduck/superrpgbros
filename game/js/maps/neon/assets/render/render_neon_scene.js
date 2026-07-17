// artdev/neon/render_neon_scene.js — NEON CITY planned scene/zone
// diagram (composed rooftop sprawl). Toroidal wrap.
'use strict';
const sharp = require('sharp');

const W = 900, MH = 780;
const FOOTER = [
  'TOROIDAL WRAP: rooftop sprawl stitches all 4 edges; the STREET CANYON (asphalt) runs W-E edge-to-edge',
  '  (cross on the CABLE RUNS + painted crossings); the MIRROR PROMENADE runs N-S edge-to-edge.',
  "KINGPIN'S PATROL (map cycle, Red's design): the Apache passes on a cycle — searchlight sweep (warn) ->",
  '  TELEGRAPHED STRIKES: strafe lanes OR rocket circles rake the roofs -> gone. Untargetable during patrol.',
  'Mob turf: punks + rats in the tagged quarter · corp drones/turrets/enforcers around the mirror promenade ·',
  '  netrunners at the cable runs · vipers on the ad floors · lifters drop crates anywhere · loaders guard the pad.',
  'BOSS: HELIPAD (SE) = CRASH SITE — entrance: the Apache CRASHES onto the pad, skids, smokes;',
  '  SOCIAL ENGINEER (kid hacker) steps off. Wreck stays as scenery + his POP-UP AD walls spawn on the pad.',
  '  Firewall drones / SYSTEM BREACH per kit; below half HP the patrol chopper becomes HIS backup.',
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
function glowline(x0, y0, x1, y1, c) { const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= steps; i++) { const x = x0 + (x1 - x0) * i / steps, y = y0 + (y1 - y0) * i / steps; put(x, y, c); put(x + 1, y, shade(c, 0.5)); } }

// ---- base: wet rooftop sprawl
rect(0, 0, W, MH, '#26262e', 0.14);
// street canyon W-E (asphalt, wraps)
for (let x = 0; x < W; x++) {
  const yc = 500 + Math.sin(x * 0.008) * 20;
  for (let y = yc - 38; y < yc + 38; y++) put(x, y, shade('#1a1a22', n2(x, y) * 0.2));
  if (Math.abs(Math.sin(x * 0.3)) > 0.8) put(x, yc + Math.sin(x * 0.05) * 3, '#c8a83a'); // lane dashes
}
// mirror promenade N-S (wraps)
for (let y = 0; y < MH; y++) {
  const xc = 300 + Math.sin(y * 0.01) * 16;
  for (let x = xc - 30; x < xc + 30; x++) put(x, y, shade('#191d2c', n2(x * 0.5, y * 0.5) * 0.15));
}
[[280, '#ff2e88'], [305, '#22d6ee'], [325, '#9a4aff']].forEach(([rx, c]) => { for (let y = 0; y < MH; y += 3) put(rx + Math.sin(y * 0.01) * 16, y, shade(c, 0.55)); });

// ---- rooftop blocks (distinct buildings w/ AC/vents etc.)
// tagged quarter (NW) — punk turf
rect(30, 40, 240, 200, '#30303c', 0.16); outline(30, 40, 240, 200, '#0e0e16');
rect(50, 60, 120, 110, '#3a2a3e', 0.2); // tagged slab patch
glowline(60, 170, 140, 150, '#ff2e88'); // graffiti glow
// corp plaza (NE) — mirror + enforcers
rect(420, 40, 700, 240, '#1d2130', 0.12); outline(420, 40, 700, 240, '#0e0e16');
rect(450, 60, 560, 150, '#191d2c', 0.1); // mirror section
// ad floor patches
rect(600, 80, 670, 150, '#141a30', 0.1); outline(600, 80, 670, 150, '#22d6ee');
rect(740, 120, 860, 220, '#141a30', 0.1); outline(740, 120, 860, 220, '#ff2e88');
// old quarter (SW below street) — cracked plaza
rect(40, 580, 260, 740, '#2e2e3a', 0.18); outline(40, 580, 260, 740, '#0e0e16');
// mid rooftops
rect(360, 280, 560, 420, '#2a2a34', 0.15); outline(360, 280, 560, 420, '#0e0e16');
rect(620, 300, 800, 430, '#2c2c38', 0.15); outline(620, 300, 800, 430, '#0e0e16');
// cable runs (connectors, wrap-crossing the street)
[[200, 420, 200, 580], [700, 430, 700, 560], [480, 420, 480, 470], [480, 530, 480, 580]].forEach(([x0, y0, x1, y1]) => {
  for (let y = y0; y < y1; y += 2) { put(x0 - 4, y, '#3c3c48'); put(x0, y, '#111119'); put(x0 + 4, y, '#3c3c48'); if (y % 20 < 4) put(x0, y, '#39ff6a'); }
});
// ---- HELIPAD boss arena (SE)
rect(600, 560, 880, 760, '#2c303a', 0.12); outline(600, 560, 880, 760, '#0e0e16');
ring(740, 660, 80, 2.4, '#d8b048');
// the H
rect(715, 630, 723, 690, '#e2e6ee'); rect(757, 630, 765, 690, '#e2e6ee'); rect(723, 656, 757, 664, '#e2e6ee');
[[665, 590], [815, 590], [665, 730], [815, 730]].forEach(([bx, by]) => { put(bx, by, '#ff3a4a'); put(bx + 1, by, '#ff3a4a'); put(bx, by + 1, '#ff3a4a'); });
// patrol path dashes (map cycle)
for (let t = 0; t < 1; t += 0.02) { const ax = 100 + t * 700, ay = 320 + Math.sin(t * 6) * 40; if ((t * 30 | 0) % 2) put(ax, ay, '#ff3a4a'); }
// ---- CRASH SITE: skid scar across the pad + wrecked apache + smoke
for (let t = 0; t < 1; t += 0.004) { // skid scar in from the pad's NW corner to the wreck
  const sx = 606 + t * 72, sy = 566 + t * 36;
  put(sx, sy + Math.sin(t * 40) * 1.5, shade('#0e0e14', n2(sx, sy) * 0.3));
  put(sx + 1, sy + 3, '#14141c');
  if ((t * 24 | 0) % 3 === 0) put(sx, sy - 3, '#3a2c18'); // scraped sparks/rust
}
// wreck: nose-down apache at the pad edge, bent boom, one blade snapped
rect(672, 598, 722, 612, '#3a4234'); // hull, tilted low
rect(664, 604, 674, 614, '#2a301f'); // crumpled nose
rect(720, 594, 752, 602, '#20261c'); // boom bent up
rect(748, 586, 754, 596, '#3a4234'); // tail fin
glowline(660, 592, 708, 586, '#5a626e'); // thrown rotor blade
glowline(712, 588, 730, 576, '#495060'); // snapped blade half
put(676, 602, '#ff9aa0'); put(677, 602, '#ff3a4a'); // cabin fire glow
// smoke plume
[[686, 582, '#3a3a44'], [692, 570, '#32323c'], [700, 558, '#2a2a34'], [710, 548, '#242430']].forEach(([sx2, sy2, c]) => { ring(sx2, sy2, 5, 2.4, c); });
// SOCIAL ENGINEER marker (kid + drone ring) stepping off the wreck
ring(742, 668, 7, 1.6, '#ffb02e'); // firewall bubble
put(742, 668, '#e84a20'); put(742, 667, '#e84a20'); // orange spikes
put(742, 670, '#2e3a2a');
[[735, 664], [749, 664], [742, 676]].forEach(([dx2, dy2]) => put(dx2, dy2, '#22d6ee')); // 3 drones
// pop-up ad wall spawn spots
[[688, 700], [770, 690], [726, 712]].forEach(([ax2, ay2]) => { outline(ax2 - 8, ay2 - 5, ax2 + 8, ay2 + 5, '#ff2e88'); });

// ---- decor markers
// billboards
[[380, 60], [820, 60], [520, 450]].forEach(([bx, by]) => { rect(bx - 22, by - 14, bx + 22, by + 14, '#0a0812'); outline(bx - 22, by - 14, bx + 22, by + 14, '#ff2e88'); });
// water tanks + AC + vents + antenna
[[140, 250, '#5a5044'], [660, 260, '#5a5044'], [90, 350, '#3a3a46'], [770, 470, '#3a3a46'], [420, 240, '#6a6a7a']].forEach(([dx, dy, c]) => { rect(dx - 10, dy - 10, dx + 10, dy + 10, c, 0.2); });
// vendo + noodle glow spots
[[340, 460, '#22d6ee'], [240, 540, '#ffb02e']].forEach(([dx, dy, c]) => { rect(dx - 6, dy - 8, dx + 6, dy + 8, shade(c, 0.5)); outline(dx - 6, dy - 8, dx + 6, dy + 8, c); });
// holo mascot + sakura + koi pool
ring(180, 460, 16, 1.4, '#22d6ee');
ring(560, 200, 12, 1.2, '#ff9ac8');
ring(120, 680, 14, 1.4, '#9a4aff');
// dumpster + shanty + fire escape marks
rect(60, 620, 90, 640, '#2e5a3a', 0.2);
rect(200, 700, 240, 725, '#2e6a8a', 0.25);
[[255, 100], [700, 350]].forEach(([fx, fy]) => { for (let i = 0; i < 4; i++) put(fx + i * 3, fy + i * 4, '#7a4a2e'); });

// footer bg
rect(0, MH, W, H, '#101018');

// ---- SVG labels
function esc(s) { return s.replace(/&/g, '+'); }
const L = [];
function label(x, y, t, c, size, anchor) { L.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size || 14}" font-weight="bold" fill="${c || '#ffffff'}" text-anchor="${anchor || 'middle'}" stroke="#000000" stroke-width="3" paint-order="stroke">${esc(t)}</text>`); }
label(450, 26, 'NEON CITY — SCENE PLAN (rooftop sprawl, toroidal)', '#22d6ee', 18);
label(135, 34, 'TAGGED QUARTER (punks + rats)', '#ff9ac8', 12);
label(560, 34, 'CORP PLAZA (drones/turrets/enforcers)', '#aefaff', 12);
label(635, 74, 'AD FLOOR', '#22d6ee', 10);
label(800, 112, 'AD FLOOR (vipers)', '#ff9ac8', 10);
label(300, 250, 'MIRROR PROMENADE (wraps N-S)', '#d0aaff', 12);
label(460, 300, 'MIDTOWN ROOFS', '#b8bcc8', 12);
label(710, 320, 'EASTSIDE ROOFS', '#b8bcc8', 12);
label(450, 545, 'STREET CANYON (wraps W-E, cross at cable runs)', '#ffe0a0', 13);
label(150, 600, 'OLD QUARTER (cracked)', '#b8bcc8', 12);
label(200, 500, 'CABLE RUN', '#b0ffc8', 10);
label(700, 500, 'CABLE RUN', '#b0ffc8', 10);
label(740, 554, 'HELIPAD — CRASH SITE / BOSS ARENA', '#ffd88a', 14);
label(697, 626, 'WRECK', '#ff9aa0', 9);
label(742, 690, 'SOCIAL ENGINEER', '#ffb02e', 11);
label(742, 750, 'ad-wall spawns (pink) - skid scar NW->wreck', '#ff9ac8', 10);
label(430, 390, "KINGPIN'S PATROL path (cycle) — strikes telegraphed", '#ff9aa0', 11);
label(180, 445, 'HOLO CAT', '#aefaff', 9);
label(560, 185, 'SAKURA', '#ff9ac8', 9);
label(120, 665, 'KOI POOL', '#d0aaff', 9);
FOOTER.forEach((t, i) => label(12, MH + 30 + i * 18, t, (i === 2 || i === 3) ? '#ff9aa0' : (i === 6 ? '#ffd88a' : '#aab2c0'), 12, 'start'));

const svg = Buffer.from(`<svg width="${W}" height="${H}">${L.join('')}</svg>`);
sharp(px, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: svg }]).png().toFile(process.argv[2] || 'neon_scene_plan.png').then(() => console.log('wrote scene plan', W + 'x' + H));
