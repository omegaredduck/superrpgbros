// artdev/castle/render_castle_scene.js — the PLANNED scene composition for
// VAMPIRE CASTLE (composed layout, never scatter). ~2400x2400 -> 900px.
// Tiles restricted to Red's picks #1-5.
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 940;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function rect(x0, y0, x1, y1, fn) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, fn(x, y)); }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }
const P = (fx, fy) => [Math.round(fx * W), Math.round(fy * W)];

// base: castle flagstone (#1) everywhere
rect(0, 0, W, W, (x, y) => {
  const bh = 18, bw = 36, rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
  let b = mix(G.stone, G.stoneDk, 0.25 + h2(Math.floor((x + off) / bw), rowI, 7) * 0.5);
  if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
  return b;
});
// COURTYARD (south band) + TILTYARD (north) — cobble #4
function cobble(x, y) {
  const cs = 16, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
  const jx = (h2(cxi, cyi, 30) - 0.5) * 4, jy = (h2(cxi, cyi, 31) - 0.5) * 4;
  const dx = (x % cs) - cs / 2 - jx, dy = (y % cs) - cs / 2 - jy;
  const d = Math.sqrt(dx * dx + dy * dy) / (cs * 0.6);
  if (d > 1) return G.night;
  let b = mix(G.stoneLt, G.stoneDk, 0.25 + h2(cxi, cyi, 32) * 0.5 + d * 0.3);
  if (dy < -cs * 0.15 && d < 0.7) b = mix(b, G.moon, 0.2);
  return b;
}
rect(...P(0.0, 0.68), ...P(1.0, 1.0), cobble);
rect(...P(0.28, 0.02), ...P(0.72, 0.3), cobble);
// GREAT HALL (west center) — parquet #3
rect(...P(0.06, 0.36), ...P(0.42, 0.64), (x, y) => {
  const s = 9, gx = Math.floor(x / s), gy = Math.floor(y / s);
  const diag = (gx + gy) % 2 === 0, inX = x % s, inY = y % s;
  let b = mix(G.wood, G.woodDk, 0.2 + h2(gx, gy, 20) * 0.4);
  if (Math.sin((diag ? inX : inY) * 1.2 + h2(gx, gy, 21) * 6) > 0.5) b = mix(b, G.woodDkk, 0.35);
  if ((diag ? inY : inX) < 1) b = G.woodDkk;
  return b;
});
// BALLROOM (east center) — checker #2
rect(...P(0.58, 0.36), ...P(0.94, 0.64), (x, y) => {
  const cs = 16, alt = ((x / cs | 0) + (y / cs | 0)) % 2 === 0;
  let b = alt ? mix('#e0e0e8', '#b8b8c8', 0.25) : mix('#26243a', G.oil, 0.35);
  if (Math.sin((x + y) * 0.3) > 0.94) b = mix(b, '#ffffff', alt ? 0.5 : 0.2);
  return b;
});
// DUNGEON WING (NW + NE pockets) — bloodstained #5
rect(...P(0.02, 0.06), ...P(0.24, 0.3), (x, y) => {
  const bh = 16, bw = 32, rowI = Math.floor(y / bh), off = (rowI % 2) * 16;
  let b = mix(G.stone, G.stoneDk, 0.3 + h2(Math.floor((x + off) / bw) , rowI, 40) * 0.4);
  if (y % bh < 1.4 || (x + off) % bw < 1.4) b = G.stoneDkk;
  if (h2(x >> 3, y >> 3, 44) > 0.72) b = mix(b, G.wine, 0.5);
  return b;
});
// LIBRARY (NE pocket) — flagstone kept, denoted by decor
// crimson runner route: spawn -> between halls -> tiltyard (#16 decor carpet)
function runner(x0, y0, x1, y1, wpx) {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(len);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    for (let k = -wpx; k <= wpx; k++) {
      const px = x + (-(y1 - y0) / len) * k, py = y + ((x1 - x0) / len) * k;
      const c = Math.abs(k) > wpx - 3 ? mix(G.gold, G.goldDk, h2(px | 0, py | 0, 3)) : mix(G.blood, G.wine, 0.3 + h2(px | 0, py | 0, 4) * 0.3);
      put(px, py, c);
    }
  }
}
runner(...P(0.5, 0.98), ...P(0.5, 0.64), 12);
runner(...P(0.5, 0.64), ...P(0.5, 0.3), 12);

// ---- decor ----
const MARKS = [];
function decor(fx, fy, r, c, cDk, label) { const [x, y] = P(fx, fy); dot(x, y, r, c, cDk); if (label) MARKS.push([x, y, label]); }
// GATEHOUSE spawn (south): portcullis + candelabras + weeping statues
decor(0.5, 0.965, 7, G.iron, G.ironDkk, '15 portcullis (SPAWN)');
[[0.44, 0.93], [0.56, 0.93]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.stoneLt, G.stoneDkk, i === 0 ? '14 statues' : null));
// OUTER COURTYARD: blood fountain center + candelabra path + armor displays
decor(0.5, 0.8, 8, G.blood, G.wine, '13 BLOOD FOUNTAIN');
[[0.46, 0.88], [0.54, 0.88], [0.46, 0.72], [0.54, 0.72]].forEach(([fx, fy], i) => decor(fx, fy, 3, G.candle, G.goldDk, i === 0 ? '3 candelabras' : null));
[[0.2, 0.78], [0.8, 0.78]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.silver, G.ironDk, i === 0 ? '12 armor displays' : null));
[[0.12, 0.9], [0.88, 0.9]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.stoneLt, G.stoneDk, i === 0 ? '10 columns' : null));
// GREAT HALL: banquet + hearth + portraits + throne at its head
decor(0.24, 0.5, 9, G.blood, G.wine, '7 BANQUET TABLE');
decor(0.09, 0.5, 6, G.gGreen, '#1c5c30', '17 hearth (green fire)');
[[0.16, 0.38], [0.28, 0.38]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.gold, G.goldDk, i === 0 ? '6 portrait rows' : null));
decor(0.24, 0.62, 5, G.velvet, G.velvetDk, '1 throne');
[[0.12, 0.44], [0.36, 0.56]].forEach(([fx, fy], i) => decor(fx, fy, 3, G.candle, G.goldDk, null));
// BALLROOM: chandeliers x3 + mirrors + the great organ
[[0.66, 0.42], [0.76, 0.5], [0.86, 0.42]].forEach(([fx, fy], i) => decor(fx, fy, 5, G.gold, G.goldDkk, i === 0 ? '4 CHANDELIERS (drop!)' : null));
[[0.6, 0.56], [0.92, 0.56]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.moon, G.moonDk, i === 0 ? '5 mirrors' : null));
decor(0.76, 0.38, 7, G.silver, G.ironDkk, '8 GREAT ORGAN');
// windows along the outer ballroom + hall walls (beam sources)
[[0.58, 0.44], [0.58, 0.52], [0.94, 0.44], [0.94, 0.52], [0.06, 0.42], [0.06, 0.56]].forEach(([fx, fy], i) =>
  decor(fx, fy, 3, G.gRed, G.wine, i === 0 ? '9 windows (beams)' : null));
// DUNGEON WING: wine racks + coffin + bat roost
decor(0.12, 0.12, 5, G.wood, G.woodDkk, '18 wine racks');
decor(0.19, 0.2, 5, G.gold, G.goldDkk, "2 count's coffin");
decor(0.06, 0.24, 4, G.fur, G.furDk, '20 bat roost');
// LIBRARY (NE): stacks + candelabra
[[0.82, 0.12], [0.9, 0.16], [0.82, 0.22]].forEach(([fx, fy], i) => decor(fx, fy, 5, G.wood, G.woodDkk, i === 0 ? '11 LIBRARY stacks' : null));
decor(0.88, 0.24, 3, G.candle, G.goldDk, '3');
// THE TILTYARD (boss arena, north): joust list + banners + gate + roosts
decor(0.5, 0.16, 9, G.wood, G.woodDkk, '19 JOUST LIST (tilt barrier)');
[[0.34, 0.06], [0.66, 0.06]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.blood, G.wine, i === 0 ? '9 banners' : null));
decor(0.5, 0.035, 6, G.iron, G.ironDkk, '15 arena gate (HE SMASHES THROUGH)');
[[0.3, 0.26], [0.7, 0.26]].forEach(([fx, fy], i) => decor(fx, fy, 4, G.fur, G.furDk, i === 0 ? '20 roosts' : null));
[[0.36, 0.12], [0.64, 0.2]].forEach(([fx, fy], i) => decor(fx, fy, 3, G.candle, G.goldDk, null));

// ---- labels ----
const zone = (fx, fy, t, sub) => {
  const [x, y] = P(fx, fy);
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="17" font-weight="bold" fill="#ffffff" stroke="#100c14" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>` +
    (sub ? `<text x="${x}" y="${y + 16}" font-family="monospace" font-size="11" fill="#e8b23a" stroke="#100c14" stroke-width="2.5" paint-order="stroke" text-anchor="middle">${sub}</text>` : '');
};
const marks = MARKS.map(([x, y, t]) => `<text x="${x + 9}" y="${y - 7}" font-family="monospace" font-size="10" fill="#f06a6a" stroke="#100c14" stroke-width="2.5" paint-order="stroke">${t}</text>`).join('');
const svg = Buffer.from(`<svg width="${W}" height="${Hh}">
${zone(0.5, 0.91, 'THE GATEHOUSE', 'spawn')}
${zone(0.5, 0.7, 'OUTER COURTYARD', 'cobble + fountain')}
${zone(0.24, 0.34, 'GREAT HALL', 'parquet + banquet')}
${zone(0.76, 0.34, 'THE BALLROOM', 'checker + chandeliers')}
${zone(0.13, 0.045, 'DUNGEON WING', 'bloodstained stone')}
${zone(0.86, 0.045, 'THE LIBRARY', 'stacks')}
${zone(0.5, 0.31, 'THE TILTYARD (BOSS)', 'cobble lists — lance lanes')}
${marks}
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#1a1224"/>
<text x="${W / 2}" y="${W + 16}" font-family="monospace" font-size="13" font-weight="bold" fill="#f06a6a" text-anchor="middle">VAMPIRE CASTLE — PLANNED SCENE (crimson runner spawn-&gt;tiltyard · blood-moon beams from windows · waltz surges · wrap ON)</text>
<text x="${W / 2}" y="${W + 32}" font-family="monospace" font-size="11" fill="#8a84a0" text-anchor="middle">decor#: 1 throne · 2 coffin · 3 candelabra · 4 chandeliers · 5 mirrors · 6 portraits · 7 banquet · 8 organ · 9 windows/banners · 10 columns · 11 library · 12 armor · 13 fountain · 14 statues · 15 gates · 16 runner · 17 hearth · 18 wine · 19 joust list · 20 roosts</text>
</svg>`);

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: svg }]).png()
  .toFile(process.argv[2] || 'castle_scene_plan.png')
  .then(() => console.log('wrote scene plan'));
