// artdev/carnival/render_carnival_scene.js — PLANNED scene for the HAUNTED
// CARNIVAL: a midnight fairground on warped funhouse checker (Red's base
// tile). South gate → midway spine of GAME BOOTHS → rides west / sideshow
// east → THE BIG TOP (boss arena, ring mat) north. Toroidal wrap through
// the dead-grass outskirts.
'use strict';
const KIT = require('./carnival_kit.js');
const { C, mix, clamp, lerp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 1040;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }
function box(x0, y0, x1, y1, c, cDk) { for (let y = y0 * W; y < y1 * W; y++) for (let x = x0 * W; x < x1 * W; x++) put(x, y, (Math.floor(x) + Math.floor(y)) % 3 ? c : (cDk || c)); }

// ---- ground ---------------------------------------------------------------
// outskirts: dead grass ring; inside fairground fence: warped checker
function inFair(fx, fy) { return fx > 0.08 && fx < 0.92 && fy > 0.08 && fy < 0.95; }
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const fx = x / W, fy = y / W;
  if (!inFair(fx, fy)) { // dead grass
    let b = mix('#4a4e32', '#32361f', h2(x >> 1, y >> 1, 5) * 0.9);
    if (h2(x + 9, y, 6) > 0.985) b = '#6a6e46';
    put(x, y, b);
    continue;
  }
  // warped checker
  const wob = Math.sin(y / 46) * 9;
  const cxq = Math.floor((x + wob) / 34), cyq = Math.floor(y / 34);
  const on = (cxq + cyq) % 2 === 0;
  let b = on ? mix(C.redDk, C.redDkk, h2(cxq, cyq, 7) * 0.6) : mix(C.creamDk, C.creamDkk, h2(cxq + 3, cyq, 8) * 0.6);
  if ((x + wob) % 34 < 1.4 || y % 34 < 1.4) b = C.oil;
  put(x, y, b);
}
// BIG TOP footprint (north): tent circle, ring mat inside
const TT = [0.5, 0.26, 0.19]; // cx, cy, r
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const fx = x / W, fy = y / W;
  const d = Math.hypot(fx - TT[0], (fy - TT[1]) * 1.15);
  if (d < TT[2]) {
    // ring mat
    let b = mix(C.redDk, C.redDkk, h2(x >> 3, y >> 3, 9) * 0.7);
    if ((x % 40 > 17 && x % 40 < 23) && (y % 40 > 17 && y % 40 < 23) && Math.abs(x % 40 - 20) + Math.abs(y % 40 - 20) < 3) b = C.glow;
    put(x, y, b);
    if (d > TT[2] - 0.012) put(x, y, C.cream); // ring boundary
  } else if (d < TT[2] + 0.02) {
    // tent wall band — striped
    const a = Math.atan2(fy - TT[1], fx - TT[0]);
    put(x, y, Math.floor((a + 3.15) * 9) % 2 ? C.red : C.cream);
  }
}
// tent entrance gap (south side of tent)
for (let y = (TT[1] + TT[2] - 0.035) * W; y < (TT[1] + TT[2] + 0.025) * W; y++)
  for (let x = (TT[0] - 0.035) * W; x < (TT[0] + 0.035) * W; x++) {
    const wob = Math.sin(y / 46) * 9;
    const cxq = Math.floor((x + wob) / 34), cyq = Math.floor(y / 34);
    put(x, y, (cxq + cyq) % 2 ? C.creamDkk : C.redDkk);
  }
// center ring spotlight circle
for (let a = 0; a < 6.283; a += 0.03) put(Math.round((TT[0] + Math.cos(a) * 0.075) * W), Math.round((TT[1] + Math.sin(a) * 0.06) * W), C.glowDk);

// midway spine: brighter checker path south gate → tent (kept same tile, add lamp rows)
// fence
for (let t = 0; t < 1; t += 0.004) {
  [[lerp(0.08, 0.92, t), 0.08], [lerp(0.08, 0.92, t), 0.95], [0.08, lerp(0.08, 0.95, t)], [0.92, lerp(0.08, 0.95, t)]].forEach(([fx, fy]) => {
    if (Math.floor(t * 120) % 3 === 0) { put(Math.round(fx * W), Math.round(fy * W), C.woodDk); put(Math.round(fx * W), Math.round(fy * W) - 1, C.woodDk); put(Math.round(fx * W), Math.round(fy * W) - 2, C.wood); }
  });
}
// gate opening (south center)
box(0.46, 0.945, 0.54, 0.955, C.redDkk);

// ---- markers ---------------------------------------------------------------
const M = [];
function mark(fx, fy, r, c, label, ly) { dot(fx * W, fy * W, r, c, mix(c, '#000000', 0.4)); if (label) M.push([fx * W, fy * W, label, ly || -12]); }
// south gate
mark(0.5, 0.9, 8, C.red, 'TICKET BOOTH + GATE');
mark(0.44, 0.88, 4, C.glow); mark(0.56, 0.88, 4, C.glow);
// midway booths (GAME BOOTHS mechanic sites A–D)
mark(0.4, 0.76, 7, C.teal, 'BOOTH A — BOTTLES');
mark(0.6, 0.72, 7, C.violet, 'BOOTH B — DARTS');
mark(0.4, 0.62, 7, C.glow, 'BOOTH C — STRIKER');
mark(0.6, 0.56, 7, C.teal, 'BOOTH D — DUNK TANK');
// midway props
mark(0.5, 0.68, 5, C.glowLt, 'STRING LIGHTS', 14);
mark(0.47, 0.55, 5, C.pink, 'CANDY STAND', 14);
mark(0.54, 0.62, 5, C.cream, 'POPCORN CART', 14);
mark(0.5, 0.48, 6, C.red, 'PRIZE WALL');
// ride yard (west)
mark(0.2, 0.62, 10, C.violet, 'DEAD CAROUSEL');
mark(0.17, 0.44, 11, C.iron, 'RUSTED FERRIS');
mark(0.27, 0.52, 7, C.tealLt, 'TILTED TEACUP', 14);
mark(0.22, 0.76, 6, C.tealLt, 'GHOST-TRAIN RAILS', 14);
// sideshow alley (east)
mark(0.78, 0.6, 8, C.violetLt, 'FORTUNE WAGON');
mark(0.83, 0.48, 7, C.iron, 'CAGE WAGON', 14);
mark(0.76, 0.72, 7, C.cream, 'SIDESHOW POSTERS', 14);
mark(0.82, 0.36, 8, C.tealLt, 'HALL OF MIRRORS');
mark(0.72, 0.44, 6, C.paint, 'FUNHOUSE MOUTH', 14);
// big top interior
mark(0.5, 0.17, 6, C.glow, 'CALLIOPE', -14);
mark(0.57, 0.31, 5, C.iron, 'TRAPEZE ABOVE', 16);
mark(0.43, 0.31, 5, C.red, 'BUNTING', 16);
// spawn
dot(0.5 * W, 0.985 * W * 0.95, 0, '#000');
dot(0.5 * W, 0.92 * W, 9, '#ffffff', '#9aa2b0');

const svg = `<svg width="${W}" height="${Hh}">
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#0e0a14"/>
<style>
 .z{font:bold 19px monospace;fill:#fff;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:4px}
 .s{font:12px monospace;fill:#f0e8d8;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:3px}
 .n{font:12px monospace;fill:#bfc8d6}
</style>
<text class="z" x="${0.5 * W}" y="${0.055 * W}">THE BIG TOP</text>
<text class="s" x="${0.5 * W}" y="${0.055 * W + 16}">BOSS ARENA — ring mat, trapeze in the dark above</text>
<text class="z" x="${0.185 * W}" y="${0.33 * W}">RIDE YARD</text>
<text class="s" x="${0.185 * W}" y="${0.33 * W + 16}">dead rides, phantom + steed turf</text>
<text class="z" x="${0.8 * W}" y="${0.29 * W}">SIDESHOW ALLEY</text>
<text class="s" x="${0.8 * W}" y="${0.29 * W + 16}">wagons + mirrors</text>
<text class="z" x="${0.5 * W}" y="${0.83 * W}">THE MIDWAY</text>
<text class="s" x="${0.5 * W}" y="${0.83 * W + 16}">game booths A–D line the spine</text>
<text class="s" x="${0.5 * W}" y="${0.965 * W}">YOU START HERE — SOUTH GATE</text>
${M.map(([x, y, l, ly]) => `<text class="s" x="${x}" y="${y + (ly || -12)}">${l}</text>`).join('')}
<text class="n" x="14" y="${W + 22}">HAUNTED CARNIVAL — PLANNED LAYOUT. Whole fairground floor = WARPED FUNHOUSE CHECKER (Red's base pick);</text>
<text class="n" x="14" y="${W + 40}">RING MAT inside the big top; dead-grass outskirts past the fence. TOROIDAL WRAP through the outskirts (all 4 edges).</text>
<text class="n" x="14" y="${W + 58}">GAME BOOTHS (map mechanic): booths A&#8211;D light up ONE AT A TIME on a cycle &#8212; STEP RIGHT UP: enter the glow to start a</text>
<text class="n" x="14" y="${W + 76}">quick target round (shootable env targets; win = prize drop, timeout = the booth bites back with a warned burst).</text>
<text class="n" x="14" y="${W + 94}">Never mandatory, never two at once; suites park the cycle. Booth tech doubles for the boss's STEP RIGHT UP verb.</text>
<text class="n" x="14" y="${W + 112}">BOSS: THE RINGMASTER &#8212; THE SHOW NEVER ENDS. Trapeze descent into the ring; whip cone &#183; spotlight lock &#183; clown adds &#183;</text>
<text class="n" x="14" y="${W + 130}">knife curtain &#183; forced game rings &#183; GRAND FINALE fireworks &#8594; bow = vented &#215;1.5. Enrage: the calliope speeds up.</text>
</svg>`;

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: Buffer.from(svg) }]).png().toFile(process.argv[2] || 'carnival_scene_plan.png').then(() => console.log('wrote scene plan'));
