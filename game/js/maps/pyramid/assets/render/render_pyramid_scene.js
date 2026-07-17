// artdev/pyramid/render_pyramid_scene.js — the PLANNED scene composition for
// PYRAMID PLUNDER (composed layout, never scatter). ~2400x2400 world -> 900px.
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 940;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

// ---- base: desert sand with ripples ----
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  let b = mix(E.sand, E.sandDk, 0.2 + h2(x >> 3, y >> 3, 1) * 0.35);
  const rip = Math.sin(y * 0.14 + Math.sin(x * 0.03) * 2.2);
  if (rip > 0.8) b = mix(b, E.sandLt, 0.4);
  put(x, y, b);
}
function rect(x0, y0, x1, y1, fn) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, fn(x, y)); }
function circle(cx, cy, r, fn) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) put(cx + x, cy + y, fn(cx + x, cy + y, Math.sqrt(x * x + y * y) / r)); }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }
const P = (fx, fy) => [Math.round(fx * W), Math.round(fy * W)];

// ---- zone floors ----
// NECROPOLIS (W): tomb-dark plot
rect(...P(0.05, 0.3), ...P(0.38, 0.62), (x, y) => {
  let b = mix(E.tomb, E.tombDk, 0.35 + h2(x >> 2, y >> 2, 20) * 0.5);
  if (x % 24 < 1.5 || y % 24 < 1.5) b = mix(b, E.oil, 0.6);
  return b;
});
// OASIS (E): lusher sand + pool drawn later
rect(...P(0.64, 0.34), ...P(0.95, 0.62), (x, y) => {
  let b = mix(E.sandLt, E.sand, 0.3 + h2(x >> 2, y >> 2, 25) * 0.4);
  if (h2(x, y, 26) > 0.99) b = '#6e9e4a';
  return b;
});
// TEMPLE COURT (N band): lapis hall floor
rect(...P(0.2, 0.14), ...P(0.8, 0.3), (x, y) => {
  let b = mix(E.lapisDk, '#0e1e4a', 0.3 + h2(x >> 2, y >> 2, 50) * 0.4);
  if (x % 22 < 1.4 || y % 22 < 1.4) b = mix(b, E.goldDkk, 0.7);
  if (h2(x >> 2, y >> 2, 52) > 0.96) b = E.gold;
  return b;
});
// THE CAUSEWAY: processional strip spawn -> arena
rect(...P(0.46, 0.14), ...P(0.54, 0.9), (x, y) => {
  let b = mix(E.sandLt, E.sand, 0.3 + h2(x >> 2, y >> 2, 12) * 0.35);
  if (x % 18 < 1.4 || y % 18 < 1.4) b = E.stoneDk;
  if (h2(x >> 1, y >> 1, 13) > 0.93) b = E.sandDkk;
  return b;
});
// BURIAL CHAMBER (N center, arena): royal gold + obsidian seal
rect(...P(0.36, 0.02), ...P(0.64, 0.16), (x, y) => {
  const cs = 14, alt = ((x / cs | 0) + (y / cs | 0)) % 2 === 0;
  let b = alt ? mix(E.gold, E.goldDk, 0.3 + h2(x >> 2, y >> 2, 30) * 0.3) : mix(E.obsidian, E.tombDk, 0.4);
  if (x % cs < 1.2 || y % cs < 1.2) b = E.goldDkk;
  return b;
});
circle(...P(0.5, 0.09), 34, (x, y, t) => {
  let b = mix(E.obsidian, E.oil, 0.3 + h2(x >> 1, y >> 1, 80) * 0.3);
  if (Math.abs(t - 0.55) < 0.06 || Math.abs(t - 0.85) < 0.06) b = E.goldDk;
  if (t < 0.08) b = E.curse;
  return b;
});
// QUICKSAND pits in the open desert
[[0.14, 0.75], [0.3, 0.82], [0.72, 0.76], [0.86, 0.24], [0.12, 0.16]].forEach(([fx, fy]) => {
  const [x, y] = P(fx, fy);
  circle(x, y, 26, (px, py, t) => {
    const ang = Math.atan2(py - y, px - x);
    const swirl = Math.sin(ang * 3 + t * 9);
    let b = mix(E.sandDk, E.sandDkk, 0.4 + swirl * 0.3);
    if (t < 0.12) b = E.tombDk;
    return b;
  });
});

// ---- decor marks ----
const MARKS = [];
function decor(fx, fy, r, c, cDk, label) { const [x, y] = P(fx, fy); dot(x, y, r, c, cDk); if (label) MARKS.push([x, y, label]); }
// EXPEDITION CAMP (spawn, S)
decor(0.5, 0.9, 5, E.wrapLt, E.wrapDk, '14 camp (SPAWN)');
decor(0.44, 0.87, 4, E.wrapLt, E.wrapDk, null);
decor(0.56, 0.88, 4, E.stoneDk, E.tombDk, '20 urns');
decor(0.42, 0.92, 5, E.gold, E.goldDkk, '19 plunder cart');
[[0.38, 0.84], [0.35, 0.88]].forEach(([fx, fy], i) => decor(fx, fy, 4, '#5fae4a', '#2c6e28', i === 0 ? '12 palms' : null));
// CAUSEWAY: braziers + obelisks alternating, trap plates on the walk
[[0.455, 0.8], [0.545, 0.74], [0.455, 0.68], [0.545, 0.62], [0.455, 0.56], [0.545, 0.5], [0.455, 0.44], [0.545, 0.38]].forEach(([fx, fy], i) =>
  decor(fx, fy, 3, i % 2 ? E.flame : E.stoneLt, i % 2 ? E.flameDk : E.stoneDkk, i === 0 ? '6 braziers / 1 obelisks' : null));
[[0.5, 0.66], [0.5, 0.48]].forEach(([fx, fy], i) => decor(fx, fy, 3, E.red, E.redDk, i === 0 ? '17 trap plates' : null));
// NECROPOLIS (W): sarcophagi rows + canopics + glyph walls + chests
[[0.1, 0.36], [0.17, 0.36], [0.24, 0.36], [0.1, 0.45], [0.17, 0.45], [0.24, 0.45]].forEach(([fx, fy], i) => decor(fx, fy, 4, E.gold, E.goldDkk, i === 0 ? '2 sarcophagi rows' : null));
decor(0.32, 0.36, 4, E.wrapLt, E.wrapDk, '3 canopics');
[[0.07, 0.55], [0.2, 0.58]].forEach(([fx, fy], i) => decor(fx, fy, 4, E.sandLt, E.sandDkk, i === 0 ? '10 glyph walls' : null));
decor(0.3, 0.55, 5, E.red, E.redDk, '5 chest + 17 trap');
decor(0.33, 0.58, 3, E.red, E.redDk, null);
// DUNES (SW): fallen colossus + dunes + sphinx SE
decor(0.16, 0.68, 8, E.stone, E.stoneDkk, '16 fallen colossus');
[[0.24, 0.72], [0.1, 0.84]].forEach(([fx, fy], i) => decor(fx, fy, 5, E.sandLt, E.sandDk, i === 0 ? '15 dunes' : null));
decor(0.78, 0.86, 8, E.sand, E.sandDkk, '11 SPHINX');
decor(0.68, 0.88, 4, E.gold, E.goldDkk, '4 treasure pile');
// OASIS (E)
decor(0.8, 0.48, 8, E.turq, E.lapisDk, '13 oasis pool');
[[0.73, 0.42], [0.87, 0.44], [0.75, 0.56]].forEach(([fx, fy], i) => decor(fx, fy, 4, '#5fae4a', '#2c6e28', i === 0 ? '12 palms' : null));
decor(0.9, 0.56, 4, E.wrapLt, E.wrapDk, '9 reed mats + 14 camp 2');
decor(0.68, 0.52, 4, E.gold, E.goldDkk, '4 treasure');
// TEMPLE COURT (N): colonnades + scales + colossi + canopics
[[0.26, 0.18], [0.32, 0.18], [0.68, 0.18], [0.74, 0.18], [0.26, 0.26], [0.32, 0.26], [0.68, 0.26], [0.74, 0.26]].forEach(([fx, fy], i) =>
  decor(fx, fy, 3, E.sandLt, E.stoneDkk, i === 0 ? '9 colonnade' : null));
decor(0.4, 0.22, 5, E.gold, E.goldDkk, '18 SCALES shrine');
[[0.22, 0.22], [0.78, 0.22]].forEach(([fx, fy], i) => decor(fx, fy, 6, E.stone, E.stoneDkk, i === 0 ? '7 colossi pair' : null));
decor(0.6, 0.22, 4, E.gold, E.goldDkk, '5 gilded chest');
// BURIAL CHAMBER: sarcophagus center + 4 anubis statues + braziers
decor(0.5, 0.09, 6, E.gold, E.goldDkk, '2 SARCOPHAGUS (entrance)');
[[0.39, 0.04], [0.61, 0.04], [0.39, 0.14], [0.61, 0.14]].forEach(([fx, fy], i) => decor(fx, fy, 4, E.jackal, E.oil, i === 0 ? '8 anubis x4 (verb!)' : null));
[[0.44, 0.03], [0.56, 0.03]].forEach(([fx, fy], i) => decor(fx, fy, 3, E.flame, E.flameDk, i === 0 ? '6' : null));
// treasure piles sprinkled at risk spots (the PLUNDER loop)
[[0.14, 0.5, '4'], [0.5, 0.72, '4 treasure (curse!)'], [0.86, 0.34, '4']].forEach(([fx, fy, l]) => decor(fx, fy, 4, E.goldLt, E.goldDk, l === '4' ? null : l));

// ---- labels ----
const zone = (fx, fy, t, sub) => {
  const [x, y] = P(fx, fy);
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="17" font-weight="bold" fill="#ffffff" stroke="#141014" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>` +
    (sub ? `<text x="${x}" y="${y + 16}" font-family="monospace" font-size="11" fill="#ffcd45" stroke="#141014" stroke-width="2.5" paint-order="stroke" text-anchor="middle">${sub}</text>` : '');
};
const marks = MARKS.map(([x, y, t]) => `<text x="${x + 9}" y="${y - 7}" font-family="monospace" font-size="10" fill="#c8ffe0" stroke="#141014" stroke-width="2.5" paint-order="stroke">${t}</text>`).join('');
const svg = Buffer.from(`<svg width="${W}" height="${Hh}">
${zone(0.5, 0.96, 'EXPEDITION CAMP', 'spawn — the dig site')}
${zone(0.5, 0.345, 'THE CAUSEWAY', 'brazier-lit processional')}
${zone(0.21, 0.665, 'THE NECROPOLIS', 'tomb plots + trapped chests')}
${zone(0.8, 0.665, 'THE OASIS', 'pool + rival camp')}
${zone(0.21, 0.92, 'THE DUNES', 'quicksand + colossus')}
${zone(0.24, 0.325, 'TEMPLE COURT', 'colonnade + scales (lapis floor)')}
${zone(0.5, 0.155, 'THE BURIAL CHAMBER (BOSS)', '')}
${marks}
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#1c1410"/>
<text x="${W / 2}" y="${W + 16}" font-family="monospace" font-size="13" font-weight="bold" fill="#ffcd45" text-anchor="middle">PYRAMID PLUNDER — PLANNED SCENE (causeway spine spawn-&gt;arena · quicksand pits · treasure piles arm the CURSE · wrap ON)</text>
<text x="${W / 2}" y="${W + 32}" font-family="monospace" font-size="11" fill="#a87e4e" text-anchor="middle">decor#: 1 obelisks · 2 sarcophagi · 3 canopics · 4 treasure · 5 chests · 6 braziers · 7 colossi · 8 anubis · 9 columns · 10 glyph walls · 11 sphinx · 12 palms · 13 oasis · 14 camps · 15 dunes · 16 fallen head · 17 traps · 18 scales · 19 cart · 20 urns</text>
</svg>`);

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: svg }]).png()
  .toFile(process.argv[2] || 'pyramid_scene_plan.png')
  .then(() => console.log('wrote scene plan'));
