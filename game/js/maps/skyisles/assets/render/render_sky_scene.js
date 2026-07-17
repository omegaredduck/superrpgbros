// artdev/skyisles/render_sky_scene.js — the PLANNED scene composition for
// STORM SKY ISLES (Red's rule: decorations compose a scene, never scatter).
// Top-down world diagram, ~2400x2400 world -> 900px map.
//   RANGER_PATH=<ranger_art.js> node render_sky_scene.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 940; // extra strip for the legend
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) {
  x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return;
  const [r, g, b] = hex(c); const i = (y * W + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
}
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

// ---- mist veil background (the picked sea #4) ----
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const l1 = Math.sin(x * 0.02 + y * 0.004) * 26, l2 = Math.sin(x * 0.033 + 2 + y * 0.006) * 20;
  let b = mix(K.cloudMd, K.cloudDk, 0.35 + h2(x >> 3, y >> 3, 95) * 0.3);
  if ((y + l1) % 160 < 55) b = mix(b, K.cloud, 0.55);
  if ((y + l2) % 120 > 88) b = mix(b, K.cloudLt, 0.4);
  put(x, y, b);
}

// ---- islands ----
function island(cx, cy, rx, ry, opts) {
  opts = opts || {};
  for (let y = -ry - 8; y <= ry + 8; y++) for (let x = -rx - 8; x <= rx + 8; x++) {
    const wob = 1 + (h2(Math.round((cx + x) / 14), Math.round((cy + y) / 14), 7) - 0.5) * 0.25;
    const d = (x * x) / (rx * rx * wob) + (y * y) / (ry * ry * wob);
    if (d <= 1) {
      let b;
      if (opts.arena) {
        b = mix(K.thunderDkk, '#181a2c', 0.4 + h2(cx + x >> 1, cy + y >> 1, 60) * 0.4);
        if (h2(cx + x, cy + y, 61) > 0.99) b = K.voltDk;
      } else if (opts.stone) {
        b = mix(K.stoneLt, K.stone, 0.3 + h2(cx + x >> 2, cy + y >> 2, 3) * 0.5);
      } else if (opts.marble) {
        const alt = ((cx + x >> 4) + (cy + y >> 4)) % 2 === 0;
        b = alt ? mix(K.marbleLt, K.marble, 0.5) : mix(K.cloudMd, K.cloudDk, 0.4);
      } else {
        b = mix(K.grass, K.grassDk, h2(cx + x >> 1, cy + y >> 1, 5) * 0.55);
        if (Math.sin((cx + x + (cy + y) * 0.3) * 0.18) > 0.86) b = mix(b, K.grassLt, 0.5);
      }
      put(cx + x, cy + y, b);
    } else if (d <= 1.24) {
      put(cx + x, cy + y, mix(K.dirtDk, K.stoneDkk, 0.5)); // rocky rim
    }
  }
}
function bridge(x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(len / 3);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    for (let k = -5; k <= 5; k++) {
      const px = x + (-(y1 - y0) / len) * k, py = y + ((x1 - x0) / len) * k;
      put(px, py, Math.abs(k) > 4 ? K.ropeDk : (i % 3 === 0 ? K.woodDkk : mix(K.wood, K.woodDk, Math.abs(k) / 5)));
    }
  }
}
function path(pts) {
  for (let s = 0; s < pts.length - 1; s++) {
    const [x0, y0] = pts[s], [x1, y1] = pts[s + 1];
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(len / 2);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      for (let k = -4; k <= 4; k++) for (let j = -1; j <= 1; j++) {
        const c = h2(Math.round(x + k), Math.round(y + j), 12) > 0.5 ? K.stoneLt : K.stone;
        put(x + k, y + j, mix(c, K.dirt, 0.25));
      }
    }
  }
}
function dot(x, y, r, c, cDk) {
  for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++)
    if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c));
}

// world -> px helpers (fractions of 900)
const P = (fx, fy) => [Math.round(fx * W), Math.round(fy * W)];

// ISLANDS (fractions)
island(...P(0.5, 0.86), 100, 62);                    // SPAWN ISLE (turf)
island(...P(0.5, 0.55), 88, 66);                     // CROSSROADS (turf)
island(...P(0.16, 0.56), 108, 84);                   // WINDMILL FARM (turf, big)
island(...P(0.84, 0.56), 108, 84, { marble: true }); // TEMPLE RUINS (marble)
island(...P(0.2, 0.24), 84, 62, { stone: true });    // CRASH SITE (stone)
island(...P(0.8, 0.24), 80, 60);                     // BALLOON DOCK (turf)
island(...P(0.5, 0.15), 104, 74, { arena: true });   // THE ROOST (stormglass arena)

// small floating shards in the mist
[[0.33, 0.72], [0.67, 0.73], [0.31, 0.4], [0.69, 0.4], [0.08, 0.82], [0.92, 0.8], [0.06, 0.1], [0.94, 0.12]].forEach(([fx, fy]) => {
  const [x, y] = P(fx, fy); island(x, y, 16, 11);
});

// BRIDGES (rope-bridge decor #1 as the connectors)
bridge(...P(0.5, 0.79), ...P(0.5, 0.625));   // spawn -> crossroads
bridge(...P(0.41, 0.55), ...P(0.28, 0.56));  // crossroads -> windmill
bridge(...P(0.59, 0.55), ...P(0.72, 0.56));  // crossroads -> temple
bridge(...P(0.17, 0.46), ...P(0.19, 0.32));  // windmill -> crash site
bridge(...P(0.83, 0.46), ...P(0.81, 0.32));  // temple -> balloon dock
bridge(...P(0.27, 0.21), ...P(0.4, 0.17));   // crash -> roost
bridge(...P(0.73, 0.21), ...P(0.6, 0.17));   // balloon dock -> roost

// LANTERN PATH spawn -> crossroads -> forks to both bridges (cobble #5)
path([P(0.5, 0.9), P(0.5, 0.8)]);
path([P(0.5, 0.62), P(0.5, 0.5), P(0.44, 0.55)]);
path([P(0.5, 0.5), P(0.56, 0.55)]);
path([P(0.16, 0.6), P(0.14, 0.5), P(0.17, 0.47)]);
path([P(0.84, 0.6), P(0.86, 0.5), P(0.83, 0.47)]);

// ---- decor placement dots (numbered by decor sheet) ----
const MARKS = [];
function decor(fx, fy, r, c, cDk, label) { const [x, y] = P(fx, fy); dot(x, y, r, c, cDk); if (label) MARKS.push([x, y, label]); }
// SPAWN ISLE: sky dock (#12) hangs off the south rim + signal bell (#16) + supply drops (#17) + lanterns (#6)
decor(0.5, 0.945, 7, K.wood, K.woodDkk, '12 dock (spawn)');
decor(0.545, 0.875, 6, K.brass, K.brassDk, '16 bell');
decor(0.455, 0.885, 5, K.woodLt, K.woodDk, '17 crates');
decor(0.5, 0.825, 3, K.volt, K.voltDk, null);
// CROSSROADS: wind god statue (#13) center + storm crystals (#14) ring + chimes (#8)
decor(0.5, 0.54, 8, K.marbleLt, K.marbleDkk, '13 wind god');
decor(0.472, 0.575, 4, K.volt, K.voltDk, '14 crystals');
decor(0.528, 0.575, 4, K.volt, K.voltDk, null);
decor(0.5, 0.6, 4, K.volt, K.voltDk, null);
decor(0.46, 0.52, 3, K.brassLt, K.brassDk, '8 chimes');
// WINDMILL FARM: windmill (#5) + banners (#9) + chimes + turf rows
decor(0.15, 0.53, 10, K.red, K.redDk, '5 windmill');
decor(0.1, 0.6, 4, K.feather, K.featherDkk, '9 banners');
decor(0.22, 0.62, 4, K.feather, K.featherDkk, null);
decor(0.2, 0.49, 3, K.brassLt, K.brassDk, '8');
// TEMPLE RUINS: arch gate (#4) at bridge mouth, columns (#3) colonnade, shrine (#19) + mosaic heart, crystals
decor(0.745, 0.56, 6, K.marbleLt, K.marbleDkk, '4 arch gate');
[[0.79, 0.5], [0.83, 0.48], [0.87, 0.5], [0.8, 0.63], [0.84, 0.65], [0.88, 0.62]].forEach(([fx, fy], i) => decor(fx, fy, 4, K.marble, K.marbleDkk, i === 0 ? '3 columns' : null));
decor(0.85, 0.56, 6, K.red, K.redDk, '19 shrine');
decor(0.9, 0.57, 4, K.volt, K.voltDk, '14');
// CRASH SITE: airship wreck (#11) set piece + supply drops + banner
decor(0.19, 0.23, 11, K.wood, K.woodDkk, '11 airship wreck');
decor(0.13, 0.28, 4, K.woodLt, K.woodDk, '17');
decor(0.25, 0.29, 4, K.woodLt, K.woodDk, null);
decor(0.24, 0.17, 4, K.feather, K.featherDkk, '9');
// BALLOON DOCK: sky balloon (#10) + dock (#12) off east rim + crates + bell
decor(0.8, 0.21, 9, K.red, K.redDk, '10 balloon');
decor(0.865, 0.26, 6, K.wood, K.woodDkk, '12 dock');
decor(0.76, 0.28, 4, K.woodLt, K.woodDk, '17');
decor(0.84, 0.17, 5, K.brass, K.brassDk, '16 bell');
// THE ROOST (arena): roc nest (#15) center + lightning rods (#7) at 4 corners + crystals on rim
decor(0.5, 0.145, 10, K.woodDk, K.woodDkk, '15 ROC NEST');
[[0.42, 0.095], [0.58, 0.095], [0.42, 0.2], [0.58, 0.2]].forEach(([fx, fy], i) => decor(fx, fy, 4, K.copper, K.copperDk, i === 0 ? '7 rods x4' : null));
[[0.45, 0.06], [0.55, 0.06]].forEach(([fx, fy], i) => decor(fx, fy, 4, K.volt, K.voltDk, i === 0 ? '14' : null));
// storm lanterns (#6) along the whole path
[[0.5, 0.755], [0.5, 0.655], [0.47, 0.5], [0.53, 0.5], [0.36, 0.555], [0.64, 0.555], [0.145, 0.47], [0.855, 0.47], [0.33, 0.185], [0.67, 0.185]].forEach(([fx, fy], i) => decor(fx, fy, 3, K.volt, K.ironDk, i === 0 ? '6 lanterns' : null));
// ruined columns (#3) also mark the spawn path mouth
decor(0.465, 0.795, 4, K.marble, K.marbleDkk, null);
decor(0.535, 0.795, 4, K.marble, K.marbleDkk, null);
// floating shards labeled once
MARKS.push([...P(0.33, 0.72), '18 shards (mist)']);
// cloud banks (#2) drift in the mist lanes
[[0.35, 0.63], [0.65, 0.63], [0.5, 0.33], [0.12, 0.38], [0.88, 0.38]].forEach(([fx, fy], i) => {
  const [x, y] = P(fx, fy); dot(x, y, 6, K.cloudLt, K.cloudMd); if (i === 0) MARKS.push([x, y, '2 cloud banks']);
});

// ---- SVG label overlay ----
const zone = (fx, fy, t, sub) => {
  const [x, y] = P(fx, fy);
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="17" font-weight="bold" fill="#ffffff" stroke="#141620" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>` +
    (sub ? `<text x="${x}" y="${y + 16}" font-family="monospace" font-size="11" fill="#ffe95a" stroke="#141620" stroke-width="2.5" paint-order="stroke" text-anchor="middle">${sub}</text>` : '');
};
const marks = MARKS.map(([x, y, t]) =>
  `<text x="${x + 10}" y="${y - 8}" font-family="monospace" font-size="10" fill="#c2fbff" stroke="#141620" stroke-width="2.5" paint-order="stroke">${t}</text>`).join('');
const svg = Buffer.from(`<svg width="${W}" height="${Hh}">
${zone(0.5, 0.94, '', '')}
${zone(0.5, 0.92, 'SPAWN ISLE', 'arrive at the sky dock')}
${zone(0.5, 0.47, 'THE CROSSWINDS', 'wind god + crystals')}
${zone(0.16, 0.66, 'WINDMILL FARM', 'turf fields + banners')}
${zone(0.84, 0.66, 'TEMPLE RUINS', 'arch gate + colonnade')}
${zone(0.2, 0.33, 'THE CRASH SITE', 'airship wreck')}
${zone(0.8, 0.33, 'BALLOON DOCK', 'balloon + dock')}
${zone(0.5, 0.05, 'THE ROOST — BOSS ARENA', 'stormglass + nest + 4 rods')}
${marks}
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#181a26"/>
<text x="${W / 2}" y="${W + 16}" font-family="monospace" font-size="13" font-weight="bold" fill="#41d6f6" text-anchor="middle">STORM SKY ISLES — PLANNED SCENE (mist veil sea · rope bridges connect all isles · lantern path spawn-&gt;arena · wrap ON)</text>
<text x="${W / 2}" y="${W + 32}" font-family="monospace" font-size="11" fill="#8a94a6" text-anchor="middle">decor#: 1 bridges · 2 cloud banks · 3 columns · 4 arch · 5 windmill · 6 lanterns · 7 rods · 8 chimes · 9 banners · 10 balloon · 11 wreck · 12 docks · 13 wind god · 14 crystals · 15 roc nest · 16 bells · 17 crates · 18 shards · 19 shrine</text>
</svg>`);

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: svg }]).png()
  .toFile(process.argv[2] || 'sky_scene_plan.png')
  .then(() => console.log('wrote scene plan'));
