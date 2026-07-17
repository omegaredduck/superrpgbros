// artdev/skyisles/render_sky_sea.js — 10 NEW candidates for the SEA between
// the islands (Red cut the first cloud-sea tile). Each cell tiles 2x2.
//   RANGER_PATH=<ranger_art.js> node render_sky_sea.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, renderSheet } = KIT;

function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function tiled(base) {
  return (put, S) => {
    const T = S / 2;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2);
      if (c) put(x, y, c);
    }
  };
}

// 1 · OPEN SKY DROP — you see the world far, far below (fields + rivers).
const drawSkyDrop = tiled((x, y, T, q) => {
  // distant patchwork ground, heavily atmospheric-hazed
  const gx = Math.floor(x / 10), gy = Math.floor(y / 10);
  const r = h2(gx, gy, 70 + q);
  let b = r > 0.66 ? '#5f7f56' : r > 0.33 ? '#6f8a4e' : '#7a865c';
  // river threads
  if (Math.abs(y - (T * 0.5 + Math.sin(x * 0.2 + q * 2) * 8)) < 1.2) b = '#5a7fa8';
  // haze toward pale sky-blue (depth)
  b = mix(b, '#a8c4e0', 0.62);
  // drifting cloud shadows
  if (Math.sin(x * 0.1 + y * 0.07 + q) > 0.8) b = mix(b, '#ffffff', 0.5);
  if (h2(x, y, 77) > 0.997) b = '#ffffff'; // tiny bird glints below
  return b;
});

// 2 · STORM CHURN — black rolling thundercloud tops, lightning inside.
const drawStormChurn = tiled((x, y, T, q) => {
  const s1 = Math.sin(x * 0.14 + y * 0.09 + q * 2) + Math.sin(y * 0.17 - x * 0.05 + 1);
  let b = mix(K.thunderDk, K.thunderDkk, 0.45 + s1 * 0.25);
  if (s1 > 1.2) b = mix(b, K.thunder, 0.7);
  if (s1 < -1.35) b = mix(b, K.oil, 0.6);
  // buried lightning flickers glowing through the cloud
  const g = h2(Math.floor(x / 14), Math.floor(y / 14), 80 + q);
  if (g > 0.86) {
    const inX = x % 14, inY = y % 14;
    if (Math.abs(inX - 7 + Math.sin(inY) * 2) < 1.3 && inY > 2 && inY < 12)
      return g > 0.94 ? K.voltLt : mix(K.voltDk, K.thunderDk, 0.3);
    if (Math.abs(inX - 7) < 4 && Math.abs(inY - 7) < 4) b = mix(b, K.voltDk, 0.25);
  }
  return b;
});

// 3 · NIGHT VOID — deep indigo emptiness, stars above AND below.
const drawNightVoid = tiled((x, y, T, q) => {
  let b = mix('#171a33', '#0c0d1d', h2(x >> 3, y >> 3, 90) * 0.7);
  const s = h2(x, y, 91 + q);
  if (s > 0.995) return '#ffffff';
  if (s > 0.988) return '#8fb0f0';
  if (s > 0.982) b = mix(b, K.indigoLt, 0.5);
  // faint nebula wisp
  if (Math.sin(x * 0.08 + y * 0.05 + q) > 0.92) b = mix(b, K.purpleDk, 0.35);
  return b;
});

// 4 · MIST VEIL — pale layered fog, soft and quiet.
const drawMistVeil = tiled((x, y, T, q) => {
  const l1 = Math.sin(x * 0.09 + q) * 6, l2 = Math.sin(x * 0.13 + 2 + q) * 5;
  let b = mix(K.cloudMd, K.cloudDk, 0.3 + h2(x >> 2, y >> 2, 95) * 0.3);
  if (y < T * 0.3 + l1) b = mix(b, K.cloud, 0.65);
  if (y > T * 0.62 + l2) b = mix(b, K.cloudLt, 0.55);
  if (Math.abs(y - T * 0.45 - l2) < 2) b = mix(b, '#ffffff', 0.4);
  return b;
});

// 5 · VORTEX BANDS — the storm wall seen from above, spiraling.
const drawVortex = tiled((x, y, T, q) => {
  const dx = x - T / 2, dy = y - T / 2;
  const ang = Math.atan2(dy, dx), rad = Math.sqrt(dx * dx + dy * dy);
  const band = Math.sin(ang * 2 + rad * 0.22 - q * 1.5);
  let b;
  if (band > 0.5) b = mix(K.thunder, K.cloudDk, h2(x >> 1, y >> 1, 100) * 0.5);
  else if (band < -0.5) b = mix(K.thunderDkk, K.oil, 0.4);
  else b = mix(K.thunderDk, K.thunderDkk, 0.5 + band * 0.3);
  if (rad < 4) b = K.cloudMd;
  if (h2(x, y, 103) > 0.995) b = K.voltDk;
  return b;
});

// 6 · RAIN CURTAIN — sheets of rain streaking down into the deep.
const drawRainCurtain = tiled((x, y, T, q) => {
  let b = mix('#2c3a5c', '#1a2238', y / T * 0.8 + h2(x >> 2, y >> 2, 110) * 0.2);
  const col = (x * 7 + q * 13) % 23;
  const phase = (y + x * 2 + q * 9) % 17;
  if (col < 2 && phase < 9) b = mix(b, '#7fa8d6', col < 1 ? 0.75 : 0.4);
  if (h2(x, y, 113) > 0.995) b = '#a8c8e8';
  return b;
});

// 7 · SUNSET SEA — golden-hour cloud tops (the storm's calm edge).
const drawSunsetSea = tiled((x, y, T, q) => {
  const s1 = Math.sin(x * 0.15 + y * 0.1 + q * 2) + Math.sin(y * 0.19 - x * 0.06);
  let b = mix('#e8a45c', '#b06a4a', 0.4 + s1 * 0.22);
  if (s1 > 1.15) b = mix(b, '#ffe8b0', 0.8);
  if (s1 < -1.3) b = mix(b, '#7a4468', 0.55);
  if (h2(x, y, 120) > 0.995) b = '#fff4d6';
  return b;
});

// 8 · ELECTRIC HAZE — purple static murk, arcs crawling through it.
const drawElectricHaze = tiled((x, y, T, q) => {
  let b = mix('#3a2c5c', '#241a3d', 0.4 + h2(x >> 1, y >> 1, 130) * 0.5);
  if (Math.sin(x * 0.11 + y * 0.13 + q) > 0.85) b = mix(b, K.purpleDk, 0.5);
  // crawling arcs on a coarse grid
  const gx = Math.floor(x / 16), gy = Math.floor(y / 16);
  if (h2(gx, gy, 131 + q) > 0.8) {
    const inX = x % 16, inY = y % 16;
    if (Math.abs(inY - 8 - Math.sin(inX * 0.9) * 3) < 1.2 && inX > 1 && inX < 15)
      return h2(x, y, 132) > 0.4 ? K.purpleLt : K.purple;
  }
  if (h2(x, y, 133) > 0.996) b = K.purpleLt;
  return b;
});

// 9 · WIND RIVERS — visible air currents streaming between the isles.
const drawWindRivers = tiled((x, y, T, q) => {
  let b = mix('#4a7fb8', '#2c5486', 0.35 + h2(x >> 2, y >> 2, 140) * 0.35);
  // layered flowing streamlines
  [0.14, 0.09, 0.2].forEach((f, i) => {
    const wave = Math.sin(x * f + i * 2.4 + q) * (5 - i);
    const yy = T * (0.2 + i * 0.3) + wave;
    if (Math.abs(y - yy) < 1.4) b = mix(b, i === 1 ? '#ffffff' : K.skyLt, 0.7 - i * 0.12);
    else if (Math.abs(y - yy) < 3.2) b = mix(b, K.sky, 0.35);
  });
  if (h2(x, y, 144) > 0.995) b = '#ffffff';
  return b;
});

// 10 · MOONLIT SEA — silver-blue cloud tops under moonlight (calm night).
const drawMoonlitSea = tiled((x, y, T, q) => {
  const s1 = Math.sin(x * 0.16 + y * 0.1 + q * 2) + Math.sin(y * 0.2 - x * 0.06 + 2);
  let b = mix('#3d4a74', '#232a4a', 0.4 + s1 * 0.24);
  if (s1 > 1.2) b = mix(b, '#b8cff0', 0.75);
  if (s1 < -1.3) b = mix(b, '#141830', 0.6);
  // moon-glint sparkles on the bright crests
  if (s1 > 1.1 && h2(x, y, 150) > 0.97) b = '#ffffff';
  return b;
});

const LIST = [
  { n: 1, name: 'OPEN SKY DROP', role: 'world far below', draw: drawSkyDrop, noOutline: true },
  { n: 2, name: 'STORM CHURN', role: 'black cloud tops', draw: drawStormChurn, noOutline: true },
  { n: 3, name: 'NIGHT VOID', role: 'stars below', draw: drawNightVoid, noOutline: true },
  { n: 4, name: 'MIST VEIL', role: 'soft fog', draw: drawMistVeil, noOutline: true },
  { n: 5, name: 'VORTEX BANDS', role: 'spiral storm', draw: drawVortex, noOutline: true },
  { n: 6, name: 'RAIN CURTAIN', role: 'falling sheets', draw: drawRainCurtain, noOutline: true },
  { n: 7, name: 'SUNSET SEA', role: 'golden clouds', draw: drawSunsetSea, noOutline: true },
  { n: 8, name: 'ELECTRIC HAZE', role: 'purple static', draw: drawElectricHaze, noOutline: true },
  { n: 9, name: 'WIND RIVERS', role: 'air currents', draw: drawWindRivers, noOutline: true },
  { n: 10, name: 'MOONLIT SEA', role: 'silver night clouds', draw: drawMoonlitSea, noOutline: true },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'sky_sea_options.png',
  title: 'STORM SKY ISLES — THE SEA BETWEEN ISLANDS (new candidates, pick 1)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
