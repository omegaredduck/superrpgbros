// artdev/swamp/render_swamp_scene.js — PLANNED scene for the WITCH'S SWAMP:
// islands of bog moss in black water, joined by plank paths; hex-totem
// sites cycle around the mire; the witch's hollow (hut + giant cauldron +
// ritual-earth arena) sits north. Toroidal wrap through the bog edges.
'use strict';
const KIT = require('./swamp_kit.js');
const { S, mix, clamp, lerp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 1064;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }

// ---- islands (bog moss ground) on black water ------------------------------
// [cx, cy, rx, ry, floor]
const ISLES = [
  [0.5, 0.88, 0.16, 0.09, 'moss'],   // OLD DOCK spawn bank (S)
  [0.22, 0.68, 0.16, 0.12, 'moss'],  // FIREFLY MEADOW (SW)
  [0.52, 0.58, 0.19, 0.13, 'mud'],   // THE MIRE (center)
  [0.8, 0.62, 0.14, 0.11, 'moss'],   // LILY LANDING (E)
  [0.2, 0.34, 0.15, 0.12, 'moss'],   // SNAG WOOD (NW)
  [0.62, 0.32, 0.13, 0.1, 'moss'],   // RITUAL GLADE (NE-center)
  [0.5, 0.13, 0.2, 0.11, 'ritual'],  // WITCH'S HOLLOW (N, BOSS)
];
// plank paths: [x1,y1,x2,y2]
const PATHS = [
  [0.5, 0.88, 0.52, 0.66], [0.5, 0.88, 0.26, 0.72], [0.52, 0.58, 0.24, 0.66],
  [0.52, 0.58, 0.78, 0.63], [0.52, 0.58, 0.6, 0.36], [0.22, 0.68, 0.2, 0.4],
  [0.2, 0.34, 0.44, 0.16], [0.62, 0.32, 0.54, 0.17], [0.8, 0.62, 0.68, 0.36],
  // wrap paths off the edges
  [0.5, 0.88, 0.5, 1.02], [0.5, 0.13, 0.5, -0.02], [0.8, 0.62, 1.02, 0.6], [0.22, 0.68, -0.02, 0.66],
];

const FLOOR = {
  moss: (x, y) => { const n = h2(x >> 1, y >> 1, 3), m = h2((x >> 3) + 5, y >> 3, 4); let b = mix(mix(S.bog, S.bogDk, n), S.bogDkk, m > 0.65 ? 0.6 : 0.1); if (h2(x + 4, y, 5) > 0.985) b = S.bogLt; return b; },
  mud: (x, y) => { let b = mix(S.mud, S.mudDk, h2(x >> 2, y >> 2, 8) * 0.85); if (Math.sin(x / 8 + Math.sin(y / 15) * 3) > 0.88) b = mix(b, S.mudDk, 0.6); return b; },
  ritual: (x, y) => { let b = mix('#4a3a34', '#2a201c', h2(x >> 2, y >> 2, 11) * 0.8); if (h2(x + 5, y + 5, 12) > 0.988) b = '#6a564e'; return b; },
};

// base: murk water
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const w = Math.sin(x / 14 + Math.sin(y / 10) * 2) + Math.sin(y / 17);
  let b = mix(S.murk, S.murkDk, clamp(w * 0.35 + 0.5, 0, 1));
  if (w > 1.5) b = mix(b, S.murkLt, 0.6);
  // glow algae swirls near the hollow
  const sw = Math.abs(Math.sin(x / 19 + Math.sin(y / 12) * 3.2 + 1));
  if (y < W * 0.3 && sw > 0.93) b = mix(b, S.brewDk, 0.5);
  if (h2(x, y, 2) > 0.997) b = S.wispDk;
  put(x, y, b);
}
// lily pads scatter in the eastern water
for (let i = 0; i < 26; i++) {
  const cx = Math.round((0.62 + h2(i, 40) * 0.36) * W), cy = Math.round((0.4 + h2(i, 41) * 0.45) * W);
  const r = 5 + (i % 3) * 3;
  for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++)
    if (xx * xx / (r * r) + yy * yy / (r * r * 0.4) <= 1) put(cx + xx, cy + yy, mix(S.bogLt, S.bogDk, (xx + r) / (2 * r)));
}
// plank paths
for (const [x1, y1, x2, y2] of PATHS) {
  const L = Math.hypot(x2 - x1, y2 - y1);
  for (let t = 0; t <= 1; t += 0.5 / (L * W)) {
    const px = lerp(x1, x2, t) * W, py = lerp(y1, y2, t) * W;
    const nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    for (let o = -7; o <= 7; o++) {
      const c = Math.abs(o) > 6 ? S.woodDkk : (Math.floor(t * L * W / 9) % 2 ? S.wood : S.woodDk);
      put(px + nx * o, py + ny * o, c);
    }
  }
}
// islands over paths
for (const [cx, cy, rx, ry, floor] of ISLES) {
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const fx = x / W, fy = y / W;
    const a = Math.atan2(fy - cy, fx - cx);
    const wob = 1 + 0.14 * Math.sin(a * 4 + cx * 30);
    const d = ((fx - cx) / (rx * wob)) ** 2 + ((fy - cy) / (ry * wob)) ** 2;
    if (d < 1) put(x, y, FLOOR[floor](x, y));
    else if (d < 1.1) put(x, y, mix(S.mud, S.murkDk, 0.5)); // muddy bank
  }
}
// toxic seep pockets in the mire
for (let i = 0; i < 5; i++) {
  const cx = Math.round((0.42 + h2(i, 60) * 0.2) * W), cy = Math.round((0.52 + h2(i, 61) * 0.12) * W);
  const r = 8 + (i % 3) * 4;
  for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++)
    if (xx * xx + yy * yy * 2.4 <= r * r) put(cx + xx, cy + yy, mix(S.brew, S.brewDk, h2(xx, yy, 62)));
}
// ritual circle glyph in the glade
for (let a = 0; a < 6.283; a += 0.03) {
  put(Math.round((0.62 + Math.cos(a) * 0.06) * W), Math.round((0.32 + Math.sin(a) * 0.04) * W), S.witchLt);
  put(Math.round((0.62 + Math.cos(a) * 0.048) * W), Math.round((0.32 + Math.sin(a) * 0.032) * W), S.witchDk);
}
// boss arena ring (ritual earth)
for (let a = 0; a < 6.283; a += 0.02) put(Math.round((0.5 + Math.cos(a) * 0.12) * W), Math.round((0.14 + Math.sin(a) * 0.075) * W), S.witchDkk);

// ---- markers ----------------------------------------------------------------
const M = [];
function mark(fx, fy, r, c, label, ly) { dot(fx * W, fy * W, r, c, mix(c, '#000000', 0.4)); if (label) M.push([fx * W, fy * W, label, ly || -12]); }
// spawn + dock
mark(0.5, 0.92, 5, S.woodLt, 'THE OLD DOCK', 16);
// firefly meadow
mark(0.16, 0.64, 6, S.brewLt, 'FIREFLY BUSHES');
mark(0.27, 0.72, 6, S.witchLt, 'MUSHROOM RING', 14);
mark(0.21, 0.6, 5, S.bogLt, 'CATTAILS');
// mire
mark(0.46, 0.54, 6, S.boneDk, 'CROC SKULL');
mark(0.58, 0.62, 6, S.woodLt, 'ROT LOGS', 14);
mark(0.52, 0.5, 5, S.brew, 'TOXIC SEEPS');
// lily landing
mark(0.82, 0.58, 6, '#e8c8e0', 'LILY PADS');
mark(0.78, 0.68, 5, S.bogLt, 'CATTAILS', 14);
// snag wood
mark(0.16, 0.3, 7, '#5a4a3a', 'DEAD SNAGS');
mark(0.25, 0.38, 6, S.witchLt, 'MUSHROOM RING', 14);
// ritual glade
mark(0.62, 0.27, 6, S.witchLt, 'RITUAL CIRCLE');
mark(0.68, 0.35, 5, S.brewLt, 'FIREFLY BUSH', 14);
// witch's hollow
mark(0.4, 0.1, 8, S.woodDk, "WITCH'S HUT");
mark(0.6, 0.11, 8, '#4a4e5a', 'GIANT CAULDRON');
// HEX TOTEM sites
[[0.34, 0.68], [0.62, 0.5], [0.2, 0.46], [0.76, 0.34], [0.44, 0.26]].forEach(([x, y], i) => {
  mark(x, y, 6, S.witch, `TOTEM ${'ABCDE'[i]}`, -12);
  for (let a = 0; a < 6.283; a += 0.35) put(Math.round((x + Math.cos(a) * 0.025) * W), Math.round((y + Math.sin(a) * 0.018) * W), S.witchDk);
});
dot(0.5 * W, 0.88 * W, 9, '#ffffff', '#9aa2b0');

const svg = `<svg width="${W}" height="${Hh}">
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#0e0a14"/>
<style>
 .z{font:bold 19px monospace;fill:#fff;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:4px}
 .s{font:12px monospace;fill:#e8f0d8;text-anchor:middle;paint-order:stroke;stroke:#000;stroke-width:3px}
 .n{font:12px monospace;fill:#bfc8d6}
</style>
<text class="z" x="${0.5 * W}" y="${0.035 * W}">WITCH'S HOLLOW</text>
<text class="s" x="${0.5 * W}" y="${0.035 * W + 16}">BOSS ARENA — ritual earth; she rises from the cauldron</text>
<text class="z" x="${0.2 * W}" y="${0.235 * W}">SNAG WOOD</text>
<text class="z" x="${0.63 * W}" y="${0.22 * W}">RITUAL GLADE</text>
<text class="s" x="${0.63 * W}" y="${0.22 * W + 16}">witchling turf</text>
<text class="z" x="${0.19 * W}" y="${0.79 * W}">FIREFLY MEADOW</text>
<text class="z" x="${0.52 * W}" y="${0.72 * W}">THE MIRE</text>
<text class="s" x="${0.52 * W}" y="${0.72 * W + 16}">mud + seeps — mossback sleeps here</text>
<text class="z" x="${0.81 * W}" y="${0.78 * W}">LILY LAKES</text>
<text class="s" x="${0.5 * W}" y="${0.965 * W}">YOU START HERE — THE OLD DOCK</text>
${M.map(([x, y, l, ly]) => `<text class="s" x="${x}" y="${y + (ly || -12)}">${l}</text>`).join('')}
<text class="n" x="14" y="${W + 22}">WITCH'S SWAMP — PLANNED LAYOUT. Bog-moss islands in black water, joined by rickety PLANK PATHS; mud + toxic</text>
<text class="n" x="14" y="${W + 40}">seeps in THE MIRE; glow algae near the hollow. Water is slow-wade (or blocked — builder picks one, note it).</text>
<text class="n" x="14" y="${W + 58}">TOROIDAL WRAP via edge paths (S&#8596;N, E&#8596;W). Tiles: moss base &#183; murk &#183; mud &#183; planks &#183; lily shallows &#183; glow algae &#183;</text>
<text class="n" x="14" y="${W + 76}">ritual earth (arena) &#183; toxic seep. Decor per Red: hut &#183; cauldron &#183; snags &#183; lilies &#183; cattails &#183; rot logs &#183; rings &#183; bushes &#183; circle.</text>
<text class="n" x="14" y="${W + 94}">HEX TOTEMS (map mechanic): sites A&#8211;E; on a cycle a totem RISES (warned shimmer) and pulses ONE hex aura ring</text>
<text class="n" x="14" y="${W + 112}">(slow / drain / weaken) until SHOT DOWN (env credit). Never more than 2 up; suites park the cycle.</text>
<text class="n" x="14" y="${W + 130}">BOSS: THE BREWMISTRESS — ladle cone &#183; flask volley&#8594;seep pools &#183; plants shootable hex totems &#183; swamp gas sectors &#183;</text>
<text class="n" x="14" y="${W + 148}">brew adds &#183; THE GRAND BREW (dive in &#8594; splash circles &#8594; POT TIPS: half-arena wave &#8594; dizzy, vented &#215;1.5).</text>
</svg>`;

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: Buffer.from(svg) }]).png().toFile(process.argv[2] || 'swamp_scene_plan.png').then(() => console.log('wrote scene plan'));
