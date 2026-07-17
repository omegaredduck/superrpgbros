// artdev/lunar/render_lunar_scene.js — the PLANNED scene composition for
// LUNAR STATION (composed layout, never scatter). ~2400x2400 -> 900px.
'use strict';
const KIT = require('./space_kit.js');
const { L, mix, clamp } = KIT;
const sharp = require('sharp');

const W = 900, Hh = 940;
const buf = Buffer.alloc(W * Hh * 4);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function put(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= Hh || !c) return; const [r, g, b] = hex(c); const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function rect(x0, y0, x1, y1, fn) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put(x, y, fn(x, y)); }
function circle(cx, cy, r, fn) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) put(cx + x, cy + y, fn(cx + x, cy + y, Math.sqrt(x * x + y * y) / r)); }
function dot(x, y, r, c, cDk) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r) put(x + xx, y + yy, yy < 0 ? c : (cDk || c)); }
const P = (fx, fy) => [Math.round(fx * W), Math.round(fy * W)];

// base: regolith everywhere
rect(0, 0, W, W, (x, y) => {
  let b = mix(L.moon, L.moonDk, 0.25 + h2(x >> 3, y >> 3, 1) * 0.45);
  if (h2(x, y, 2) > 0.97) b = mix(b, L.moonDkk, 0.5);
  return b;
});
// craters belt (south + corners)
[[0.14, 0.8, 40], [0.34, 0.9, 30], [0.85, 0.78, 46], [0.9, 0.14, 34], [0.66, 0.88, 26], [0.08, 0.35, 30]].forEach(([fx, fy, r]) => {
  const [x, y] = P(fx, fy);
  circle(x, y, r, (px, py, t) => {
    if (t > 0.82) return mix(L.moonLt, L.moonDk, h2(px, py, 5) * 0.5);
    return mix(L.moonDk, L.moonDkk, (1 - t) * 0.5 + 0.2);
  });
});
// STATION footprint: hull-deck modules connected by corridors
function hull(x, y) {
  const bw = 26, bh = 26;
  let b = mix(L.hull, L.hullMd, 0.2 + h2(Math.floor(x / bw), Math.floor(y / bh), 10) * 0.4);
  if (x % bw < 1.4 || y % bh < 1.4) b = L.hullDkk;
  return b;
}
function grate(x, y) {
  let b = mix(L.steelDk, L.steelDkk, 0.3 + h2(x >> 1, y >> 1, 20) * 0.4);
  if ((x % 8 < 3) && (y % 8 < 3)) return mix(L.space, L.oil, 0.5);
  return b;
}
rect(...P(0.36, 0.42), ...P(0.64, 0.66), hull);                    // THE HUB
rect(...P(0.3, 0.14), ...P(0.56, 0.34), (x, y) => {                // LABS (lab tile)
  let b = mix('#eef1f6', '#ccd2e0', 0.2 + h2(x >> 3, y >> 3, 30) * 0.3);
  if (x % 22 < 1.2 || y % 22 < 1.2) b = L.holoDk;
  return b;
});
rect(...P(0.66, 0.4), ...P(0.9, 0.6), (x, y) => {                  // HIVE WING (hive floor)
  let b = mix('#3a2c50', '#241a38', 0.3 + h2(x >> 1, y >> 1, 40) * 0.5);
  if (h2(x >> 3, y >> 3, 44) > 0.85) b = mix(b, L.acidDk, 0.4);
  return b;
});
// corridors (grate)
rect(...P(0.47, 0.34), ...P(0.53, 0.42), grate);
rect(...P(0.64, 0.48), ...P(0.66, 0.54), grate);
rect(...P(0.47, 0.66), ...P(0.53, 0.78), grate);
rect(...P(0.56, 0.2), ...P(0.68, 0.26), grate);
// REACTOR ARENA (NE, reactor plate + warning ring)
const [ax, ay] = P(0.72, 0.16);
circle(ax, ay, 105, (px, py, t) => {
  if (t > 0.93) return (Math.floor((px + py) / 7) % 2 === 0) ? L.warn : L.oil;
  let b = mix(L.steelDk, L.steelDkk, 0.35 + h2(px >> 1, py >> 1, 90) * 0.4);
  if (Math.abs(t - 0.5) < 0.03 || Math.abs(t - 0.75) < 0.03) b = L.holoDk;
  return b;
});
// SOLAR FIELD (W): solar glass panels
rect(...P(0.06, 0.5), ...P(0.28, 0.68), (x, y) => {
  let b = mix('#1c3a6e', '#0e2044', 0.3 + h2(x >> 2, y >> 2, 60) * 0.3);
  if ((x % 30) < 2 || (y % 20) < 2) b = L.steelLt;
  return b;
});
// LANDING PAD (S): hull circle
const [lx, ly] = P(0.5, 0.86);
circle(lx, ly, 70, (px, py, t) => {
  if (t > 0.9) return (Math.floor((px + py) / 7) % 2 === 0) ? L.warn : L.oil;
  return mix(L.hullMd, L.hullDk, 0.3 + h2(px >> 2, py >> 2, 70) * 0.3);
});

// ---- decor ----
const MARKS = [];
function decor(fx, fy, r, c, cDk, label) { const [x, y] = P(fx, fy); dot(x, y, r, c, cDk); if (label) MARKS.push([x, y, label]); }
// LANDING PAD spawn
decor(0.5, 0.86, 7, L.foil, L.foilDk, '1 LANDER (SPAWN)');
decor(0.43, 0.9, 5, L.foil, L.foilDk, '2 rover');
decor(0.57, 0.9, 3, L.hull, L.hullDk, '3 flag');
decor(0.44, 0.82, 3, L.red, L.redDk, '12 beacon');
// route beacons + airlocks on the corridor spine
decor(0.5, 0.77, 4, L.steel, L.steelDkk, '11 airlock');
decor(0.5, 0.4, 4, L.steel, L.steelDkk, '11');
[[0.5, 0.72], [0.5, 0.37]].forEach(([fx, fy], i) => decor(fx, fy, 3, L.red, L.redDk, i === 0 ? '12' : null));
// THE HUB
decor(0.44, 0.5, 5, L.steelDk, L.steelDkk, '5 consoles');
decor(0.52, 0.55, 5, L.holo, L.holoDk, '6 HOLO TABLE');
decor(0.58, 0.48, 4, L.hullMd, L.hullDkk, '7 cargo');
decor(0.4, 0.6, 4, L.hull, L.hullDk, '8 O2 rack');
// LABS
decor(0.36, 0.2, 5, L.hull, L.hullDk, '4 CRYO PODS (one open)');
decor(0.46, 0.24, 5, L.hull, L.hullDkk, '18 lab benches');
decor(0.52, 0.18, 4, L.hull, L.hullDkk, '18');
decor(0.34, 0.28, 4, '#7ac25a', '#3a6e2c', '13 hydroponics');
decor(0.42, 0.3, 4, '#7ac25a', '#3a6e2c', '13');
// HIVE WING
[[0.72, 0.44], [0.8, 0.52], [0.86, 0.44], [0.7, 0.56]].forEach(([fx, fy], i) => decor(fx, fy, 5, L.void, L.voidDk, i === 0 ? '14 hive resin' : null));
decor(0.76, 0.48, 4, L.acid, L.acidDk, 'brood ground zero');
// SOLAR FIELD + comms
decor(0.1, 0.54, 5, '#1c3a6e', L.steelLt, '9 solar arrays');
decor(0.22, 0.64, 5, L.hull, L.hullDk, '10 COMMS DISH');
decor(0.16, 0.6, 4, L.foil, L.foilDk, '15 crashed probe');
// surface features + JUMP PADS crossing craters
decor(0.14, 0.8, 4, L.moonDk, L.moonDkk, '16 craters');
[[0.24, 0.76], [0.32, 0.68], [0.78, 0.72], [0.84, 0.64], [0.88, 0.26], [0.82, 0.32]].forEach(([fx, fy], i) =>
  decor(fx, fy, 4, L.holo, L.holoDk, i === 0 ? '19 JUMP PADS (cross craters)' : null));
[[0.62, 0.78], [0.7, 0.84]].forEach(([fx, fy], i) => decor(fx, fy, 4, L.moon, L.moonDkk, i === 0 ? '17 moon rocks' : null));
// REACTOR ARENA
decor(0.72, 0.16, 7, L.holo, L.holoDk, '20 REACTOR CORE (arena center)');
[[0.64, 0.1], [0.8, 0.1], [0.64, 0.22], [0.8, 0.22]].forEach(([fx, fy], i) => decor(fx, fy, 3, L.red, L.redDk, i === 0 ? '12 beacons x4' : null));

// labels
const zone = (fx, fy, t, sub) => {
  const [x, y] = P(fx, fy);
  return `<text x="${x}" y="${y}" font-family="monospace" font-size="17" font-weight="bold" fill="#ffffff" stroke="#0c0e16" stroke-width="3" paint-order="stroke" text-anchor="middle">${t}</text>` +
    (sub ? `<text x="${x}" y="${y + 16}" font-family="monospace" font-size="11" fill="#4adcf0" stroke="#0c0e16" stroke-width="2.5" paint-order="stroke" text-anchor="middle">${sub}</text>` : '');
};
const marks = MARKS.map(([x, y, t]) => `<text x="${x + 9}" y="${y - 7}" font-family="monospace" font-size="10" fill="#b8ffb0" stroke="#0c0e16" stroke-width="2.5" paint-order="stroke">${t}</text>`).join('');
const svg = Buffer.from(`<svg width="${W}" height="${Hh}">
${zone(0.5, 0.96, 'LANDING PAD', 'spawn')}
${zone(0.5, 0.475, 'THE HUB', 'hull deck + consoles')}
${zone(0.42, 0.115, 'THE LABS', 'cryo + benches + hydroponics')}
${zone(0.78, 0.635, 'HIVE WING', 'resin dark zone')}
${zone(0.16, 0.47, 'SOLAR FIELD', 'panels + comms + probe')}
${zone(0.72, 0.045, 'REACTOR ARENA (BOSS)', 'lights-out entrance')}
${zone(0.22, 0.87, 'CRATER BELT', 'jump pads across')}
${marks}
<rect x="0" y="${W}" width="${W}" height="${Hh - W}" fill="#10121e"/>
<text x="${W / 2}" y="${W + 16}" font-family="monospace" font-size="13" font-weight="bold" fill="#4adcf0" text-anchor="middle">LUNAR STATION — PLANNED SCENE (LOW GRAVITY everywhere · jump pads cross craters · corridors link modules · wrap ON)</text>
<text x="${W / 2}" y="${W + 32}" font-family="monospace" font-size="11" fill="#787e94" text-anchor="middle">decor#: 1 lander · 2 rover · 3 flag · 4 cryo · 5 consoles · 6 holo · 7 cargo · 8 O2 · 9 solar · 10 dish · 11 airlocks · 12 beacons · 13 hydro · 14 resin · 15 probe · 16 craters · 17 rocks · 18 benches · 19 JUMP PADS · 20 REACTOR</text>
</svg>`);

sharp(buf, { raw: { width: W, height: Hh, channels: 4 } }).composite([{ input: svg }]).png()
  .toFile(process.argv[2] || 'lunar_scene_plan.png')
  .then(() => console.log('wrote scene plan'));
