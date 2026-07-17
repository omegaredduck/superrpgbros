// artdev/crystal/render_crystal_scene.js — PLANNED scene for CRYSTAL CAVERNS:
// a chambered cave system carved out of solid crystal-veined rock. Chambers
// linked by tunnels; GROWING CRYSTAL wall segments open/close routes on a
// cycle. Boss arena = THE DEEP FISSURE (NE, obsidian; ceiling-drop entrance).
'use strict';
const KIT = require('./crystal_kit.js');
const { K, GEMS, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 1040;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }

// ---- chamber map (normalized coords on the 900x900 field) ----------------
// each: [cx, cy, rx, ry, floor]
const CHAMBERS = [
  [0.16, 0.78, 0.13, 0.11, 'sand'],    // ENTRY SHELF (spawn, SW)
  [0.45, 0.5, 0.17, 0.14, 'crystal'],  // THE GREAT HALL (center)
  [0.32, 0.18, 0.14, 0.11, 'moss'],    // CRYSTAL GARDEN (NW)
  [0.72, 0.78, 0.15, 0.12, 'water'],   // UNDERGROUND LAKE (SE)
  [0.14, 0.42, 0.11, 0.1, 'geode'],    // GEODE HOLLOW (W)
  [0.76, 0.22, 0.16, 0.14, 'obsidian'],// THE DEEP FISSURE (NE, BOSS)
];
// tunnels: [x1,y1,x2,y2, halfwidth, grow?]  grow = GROWING CRYSTAL gate
const TUNNELS = [
  [0.16, 0.78, 0.38, 0.58, 0.035, false],  // entry -> hall
  [0.45, 0.5, 0.34, 0.26, 0.033, true],    // hall -> garden (GATE A)
  [0.45, 0.5, 0.66, 0.72, 0.035, false],   // hall -> lake
  [0.45, 0.5, 0.2, 0.44, 0.03, true],      // hall -> geode hollow (GATE B)
  [0.45, 0.5, 0.68, 0.3, 0.038, false],    // hall -> fissure (boss approach)
  [0.32, 0.18, 0.62, 0.16, 0.03, true],    // garden -> fissure (GATE C)
  [0.72, 0.78, 0.78, 0.4, 0.03, true],     // lake -> fissure (GATE D)
  [0.14, 0.42, 0.2, 0.66, 0.028, false],   // geode -> entry (loop)
  // WRAP LOOPS (toroidal): tunnels exiting the field edges
  [0.16, 0.78, 0.16, 1.02, 0.03, false],   // entry -> south edge (wraps to garden's north)
  [0.32, 0.18, 0.32, -0.02, 0.03, false],  // garden -> north edge
  [0.72, 0.78, 1.02, 0.78, 0.03, false],   // lake -> east edge (wraps to geode's west)
  [0.14, 0.42, -0.02, 0.42, 0.03, false],  // geode -> west edge
];

function inField(fx, fy, x1, y1, x2, y2, hw) {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
  const t = clamp(((fx - x1) * dx + (fy - y1) * dy) / L2, 0, 1);
  const px = x1 + dx * t, py = y1 + dy * t;
  return Math.hypot(fx - px, fy - py) < hw ? t : null;
}

// floors
const FLOOR = {
  sand: (x, y) => { let b = mix('#b8a890', '#8a7a62', h2(x >> 1, y >> 1, 8) * 0.7); if (h2(x + 6, y, 9) > 0.99) b = '#ffffff'; return b; },
  crystal: (x, y) => { const n = h2(((x + y * 0.5) / 26) | 0, ((y - x * 0.3) / 22) | 0, 12); let b = mix(mix(K.cyanDk, mix(K.cyan, K.cyanLt, n), 0.4 + n * 0.4), '#0e2a30', 0.45); if (h2(x, y, 13) > 0.995) b = K.cyanLt; return b; },
  moss: (x, y) => { const n = h2(x >> 1, y >> 1, 21); let b = mix(mix(K.green, K.greenDk, n), K.rockDk, h2((x >> 3) + 5, y >> 3, 22) > 0.6 ? 0.7 : 0.15); if (h2(x + 4, y, 23) > 0.99) b = K.greenLt; return b; },
  water: (x, y) => { const w = Math.sin(x / 11 + Math.sin(y / 8) * 2) + Math.sin(y / 13); let b = mix('#1c4a74', '#0e2440', clamp(w * 0.4 + 0.5, 0, 1)); if (w > 1.45) b = mix(b, K.cyanLt, 0.6); return b; },
  geode: (x, y) => { let b = mix(K.void, K.voidDk, h2(x >> 2, y >> 2, 31)); const cr = Math.abs(Math.sin(x / 17 + Math.sin(y / 9) * 3)); if (cr > 0.93) b = mix(K.pink, K.pinkLt, h2(x, y, 32)); else if (cr > 0.86) b = K.pinkDk; return b; },
  obsidian: (x, y) => { let b = mix('#16121e', '#241c30', h2(((x - y * 0.4) / 30) | 0, ((y + x * 0.2) / 24) | 0, 41)); if (Math.abs(Math.sin(x / 14 - y / 20)) > 0.965) b = K.voidLt; if (h2(x, y + 5, 42) > 0.995) b = K.pink; return b; },
  tunnel: (x, y) => { let b = mix(K.rock, K.rockDk, h2(x >> 2, y >> 2, 51)); if (h2(x, y, 52) > 0.985) b = K.rockLt; return b; },
};

// base: solid rock wall everywhere
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const n = h2(x >> 3, y >> 3, 1);
  let b = mix(K.rockDk, K.rockDkk, n);
  if (h2(x, y, 2) > 0.993) b = GEMS[Math.floor(h2(x, y, 4) * 5)][0]; // wall gem glints
  put(x, y, b);
}
// carve tunnels first (chambers overwrite their mouths)
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const fx = x / W, fy = y / W;
  for (const [x1, y1, x2, y2, hw] of TUNNELS) {
    if (inField(fx, fy, x1, y1, x2, y2, hw) != null) { put(x, y, FLOOR.tunnel(x, y)); break; }
  }
}
// carve chambers (wobbly ellipses)
for (const [cx, cy, rx, ry, floor] of CHAMBERS) {
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const fx = x / W, fy = y / W;
    const a = Math.atan2(fy - cy, fx - cx);
    const wob = 1 + 0.12 * Math.sin(a * 5 + cx * 40);
    const d = ((fx - cx) / (rx * wob)) ** 2 + ((fy - cy) / (ry * wob)) ** 2;
    if (d < 1) put(x, y, FLOOR[floor](x, y));
    else if (d < 1.08) put(x, y, K.rockLt); // rim
  }
}
// beach ring on the lake (sand lip so it reads as shore, walkable rim)
{
  const [cx, cy, rx, ry] = CHAMBERS[3];
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const fx = x / W, fy = y / W;
    const d = ((fx - cx) / rx) ** 2 + ((fy - cy) / ry) ** 2;
    if (d > 0.72 && d < 1) put(x, y, FLOOR.sand(x, y));
  }
}
// crystal bridge across the lake
for (let t = 0; t <= 1; t += 0.0015) {
  const bx = (0.6 + t * 0.24) * W, by = (0.84 - t * 0.12) * W;
  for (let o = -7; o <= 7; o++) put(bx + o * 0.6, by + o, mix(K.purpleLt, K.purpleDk, (o + 7) / 14));
}
// GROWING CRYSTAL gates: pink hatch bars across their tunnels (midpoint)
const GATES = [];
for (const [x1, y1, x2, y2, hw, grow] of TUNNELS) {
  if (!grow) continue;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  GATES.push([mx, my]);
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L; // perpendicular
  for (let s = -1; s <= 1; s += 0.02) {
    const px = (mx + nx * s * (hw + 0.012)) * W, py = (my + ny * s * (hw + 0.012)) * W;
    for (let o = -3; o <= 3; o++) put(px + o, py, Math.abs(s * 50 % 2) < 1 ? K.pink : K.pinkDk);
  }
}
// mine rails: entry shelf into the great hall
for (let t = 0; t <= 1; t += 0.001) {
  const rx = (0.1 + t * 0.31) * W, ry = (0.82 - t * 0.27) * W;
  put(rx - 4, ry, '#6a5140'); put(rx + 4, ry, '#6a5140');
  if (Math.floor(t * 60) % 2 === 0) for (let o = -5; o <= 5; o++) put(rx + o, ry + 1, '#4a3a2c');
}
// ---- decor markers --------------------------------------------------------
const M = [];
function mark(fx, fy, r, c, label) { dot(fx * W, fy * W, r, c, mix(c, '#000000', 0.4)); if (label) M.push([fx * W, fy * W, label]); }
// entry shelf
mark(0.11, 0.8, 7, '#8a6e58', 'MINE CART');   // cart
mark(0.2, 0.72, 5, K.amber, 'LANTERNS');
mark(0.13, 0.86, 5, '#8a7a62');               // nets/rubble
// great hall
mark(0.45, 0.44, 10, K.pink, 'GEM CLUSTER');
mark(0.38, 0.55, 7, K.cyan, 'PILLARS');
mark(0.52, 0.56, 7, K.cyan);
mark(0.45, 0.62, 6, K.purple, 'ARCH');
// garden
mark(0.27, 0.14, 6, K.pink, 'FLOWERS');
mark(0.36, 0.21, 6, K.cyan, 'MUSHROOMS');
mark(0.3, 0.24, 5, K.green, 'SINGING CRYSTALS');
mark(0.38, 0.13, 5, K.green);
// lake
mark(0.67, 0.83, 6, '#c8bfa8', 'FOSSIL WALL');
mark(0.79, 0.72, 6, K.cyanLt, 'GLOW POOL');
// geode hollow
mark(0.1, 0.4, 7, K.purple, 'OPEN GEODES');
mark(0.17, 0.47, 6, K.rockLt, 'RUBBLE');
mark(0.12, 0.35, 5, K.amber, 'PEDESTAL');
// fissure (boss)
mark(0.76, 0.16, 7, K.void, 'VOID FISSURES');
mark(0.7, 0.28, 6, K.pink, 'CHANDELIERS ABOVE');
mark(0.84, 0.26, 6, K.void);
// spawn + boss star
dot(0.16 * W, 0.78 * W, 9, '#ffffff', '#9aa2b0');

const svg = `<svg width="${W}" height="${Hh}">
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#0e0a14"/>
<style>
 .z{font:bold 19px monospace;fill:#fff;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:4px}
 .s{font:12px monospace;fill:#e8e0f4;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:3px}
 .n{font:12px monospace;fill:#bfc8d6}
</style>
<text class="z" x="${0.16 * W}" y="${0.7 * W}">ENTRY SHELF</text>
<text class="s" x="${0.16 * W}" y="${0.7 * W + 16}">SPAWN — miners' trail</text>
<text class="z" x="${0.45 * W}" y="${0.38 * W}">THE GREAT HALL</text>
<text class="s" x="${0.45 * W}" y="${0.38 * W + 16}">crystal floor hub</text>
<text class="z" x="${0.32 * W}" y="${0.08 * W}">CRYSTAL GARDEN</text>
<text class="s" x="${0.32 * W}" y="${0.08 * W + 16}">moss + flowers + mushrooms</text>
<text class="z" x="${0.72 * W}" y="${0.92 * W}">UNDERGROUND LAKE</text>
<text class="s" x="${0.72 * W}" y="${0.92 * W + 16}">water ring + crystal bridge</text>
<text class="z" x="${0.14 * W}" y="${0.3 * W}">GEODE HOLLOW</text>
<text class="s" x="${0.14 * W}" y="${0.3 * W + 16}">lurker ambush den</text>
<text class="z" x="${0.76 * W}" y="${0.1 * W}">THE DEEP FISSURE</text>
<text class="s" x="${0.76 * W}" y="${0.1 * W + 16}">BOSS ARENA — obsidian, ceiling drop</text>
${GATES.map(([x, y], i) => `<text class="s" x="${x * W}" y="${y * W - 12}" fill="#ff7ab8">GATE ${'ABCD'[i]} — GROWING CRYSTAL</text>`).join('')}
<text class="s" x="${0.16 * W}" y="${0.78 * W + 28}">YOU START HERE</text>
${M.filter(m => m[2]).map(([x, y, l]) => `<text class="s" x="${x}" y="${y - 12}">${l}</text>`).join('')}
<text class="n" x="14" y="${W + 22}">CRYSTAL CAVERNS &#8212; PLANNED LAYOUT. Solid gem-veined rock; six carved chambers joined by a tunnel network.</text>
<text class="n" x="14" y="${W + 40}">TOROIDAL WRAP: edge tunnels connect S&#8596;N + E&#8596;W (entry&#8596;garden, lake&#8596;geode hollow).</text>
<text class="n" x="14" y="${W + 58}">GROWING CRYSTAL (map mechanic): pink-hatched GATES A&#8211;D grow shut / shatter open on a cave cycle</text>
<text class="n" x="14" y="${W + 76}">(telegraphed shimmer + chime). Live routes change; never all shut at once.</text>
<text class="n" x="14" y="${W + 94}">Rails: mine-cart trail entry&#8594;hall. Lake rim is walkable sand; the crystal bridge crosses the water.</text>
<text class="n" x="14" y="${W + 112}">BOSS: THE SHARDLORD ceiling-drops into THE DEEP FISSURE (chandelier stalactites above warn the arena).</text>
<text class="n" x="14" y="${W + 130}">Mob homes: shardlings+rams tunnels/hall &#183; lurkers HOLLOW &#183; moths+resonators GARDEN &#183; crawlers LAKE &#183; horror FISSURE.</text>
</svg>`;

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: Buffer.from(svg) }]).png().toFile(process.argv[2] || 'crystal_scene_plan.png').then(() => console.log('wrote scene plan'));
