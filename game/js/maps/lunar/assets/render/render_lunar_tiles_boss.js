// artdev/lunar/render_lunar_tiles_boss.js — LUNAR STATION: 10 tile
// candidates + 10 boss work-ups (all styles, Red asked to explore).
'use strict';
const KIT = require('./space_kit.js');
const { L, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, visor, hover, chitin, star } = KIT;
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function tiled(base) { return (put, S) => { const T = S / 2; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2); if (c) put(x, y, c); } }; }

// ---------------- TILES ----------------
const drawRegolith = tiled((x, y, T, q) => {
  let b = mix(L.moon, L.moonDk, 0.25 + h2(x >> 2, y >> 2, 1) * 0.45);
  if (h2(x, y, 2) > 0.96) b = mix(b, L.moonDkk, 0.5);
  if (h2(x, y, 3) > 0.99) b = L.moonLt;
  // bootprints
  const gx = Math.floor(x / 22), gy = Math.floor(y / 22);
  if (h2(gx, gy, 5) > 0.8) {
    const ix = x % 22 - 11, iy = y % 22 - 11;
    if (Math.abs(ix) < 3 && Math.abs(iy) < 5 && (iy % 2 === 0)) b = mix(b, L.moonDkk, 0.6);
  }
  return b;
});
const drawHullDeck = tiled((x, y, T, q) => {
  const bw = T / 2, bh = T / 2;
  let b = mix(L.hull, L.hullMd, 0.2 + h2(Math.floor(x / bw) + q, Math.floor(y / bh), 10) * 0.4);
  if (x % bw < 1.4 || y % bh < 1.4) b = L.hullDkk;
  if ((x % bw > bw - 6 && y % bh < 6)) b = L.hullDk; // corner vent
  if (h2(x, y, 12) > 0.995) b = '#ffffff';
  return b;
});
const drawDeckGrate = tiled((x, y, T, q) => {
  let b = mix(L.steelDk, L.steelDkk, 0.3 + h2(x >> 1, y >> 1, 20) * 0.4);
  if ((x % 8 < 3) && (y % 8 < 3)) return mix(L.space, L.oil, 0.5); // holes
  if (x % 8 === 3 || y % 8 === 3) b = mix(b, L.steel, 0.4);
  if (h2(x, y, 22) > 0.993) b = L.holoDk;
  return b;
});
const drawLabTile = tiled((x, y, T, q) => {
  let b = mix('#eef1f6', '#ccd2e0', 0.2 + h2(x >> 3, y >> 3, 30) * 0.3);
  if (x % (T / 2) < 1.2 || y % (T / 2) < 1.2) b = L.holoDk;
  if (h2(x >> 4, y >> 4, 32) > 0.88 && (x + y) % 7 < 2) b = mix(b, L.acidDk, 0.25); // faint contamination
  return b;
});
const drawHiveFloor = tiled((x, y, T, q) => {
  let b = mix('#3a2c50', '#241a38', 0.3 + h2(x >> 1, y >> 1, 40) * 0.5);
  // organic cell ridges (voronoi-ish)
  const gx = Math.floor(x / 12), gy = Math.floor(y / 12);
  let minD = 99, minD2 = 99;
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
    const px = (gx + ox) * 12 + h2(gx + ox, gy + oy, 41) * 9, py = (gy + oy) * 12 + h2(gx + ox, gy + oy, 42) * 9;
    const d = Math.hypot(x - px, y - py);
    if (d < minD) { minD2 = minD; minD = d; } else if (d < minD2) minD2 = d;
  }
  if (minD2 - minD < 1.6) b = mix(L.void, '#241a38', 0.4);
  if (minD < 2 && h2(gx, gy, 44) > 0.72) b = L.acidDk; // glowing cell hearts
  return b;
});
const drawCraterField = tiled((x, y, T, q) => {
  let b = mix(L.moonDk, L.moonDkk, 0.3 + h2(x >> 2, y >> 2, 50) * 0.4);
  const dx = x % T - T / 2, dy = y % T - T / 2, rad = Math.hypot(dx, dy);
  if (Math.abs(rad - T * 0.3) < 2) b = mix(b, L.moonLt, 0.5);
  if (rad < T * 0.28) b = mix(b, L.oil, (1 - rad / (T * 0.28)) * 0.4);
  if (h2(x, y, 52) > 0.995) b = L.moonLt;
  return b;
});
const drawSolarGlass = tiled((x, y, T, q) => {
  let b = mix('#1c3a6e', '#0e2044', 0.3 + h2(x >> 2, y >> 2, 60) * 0.3);
  if ((x % (T / 3)) < 1.4 || (y % (T / 3)) < 1.4) b = L.steelLt;
  if (Math.sin((x + y) * 0.3 + q) > 0.93) b = mix(b, '#ffffff', 0.35);
  return b;
});
const drawWarnDeck = tiled((x, y, T, q) => {
  let b = mix(L.hullMd, L.hullDk, 0.3 + h2(x >> 2, y >> 2, 70) * 0.3);
  if (x % (T / 2) < 1.4 || y % (T / 2) < 1.4) b = L.hullDkk;
  // hazard chevron border band
  const inX = x % (T / 2), inY = y % (T / 2);
  if (inY < 7) b = (Math.floor((inX + inY) / 5) % 2 === 0) ? L.warn : L.oil;
  if (h2(x, y, 72) > 0.995) b = L.warnLt;
  return b;
});
const drawHoloFloor = tiled((x, y, T, q) => {
  let b = mix(L.space, L.oil, 0.3 + h2(x >> 2, y >> 2, 80) * 0.3);
  if (x % 10 < 1 || y % 10 < 1) b = mix(b, L.holoDk, 0.7);
  if (x % 40 < 1 || y % 40 < 1) b = L.holo;
  if (h2(x >> 1, y >> 1, 82) > 0.985) b = mix(b, L.holoLt, 0.5);
  return b;
});
const drawReactorPlate = tiled((x, y, T, q) => {
  let b = mix(L.steelDk, L.steelDkk, 0.35 + h2(x >> 1, y >> 1, 90) * 0.4);
  const dx = x % T - T / 2, dy = y % T - T / 2, rad = Math.hypot(dx, dy);
  [T * 0.2, T * 0.36].forEach((rr, i) => { if (Math.abs(rad - rr) < 1.6) b = mix(L.holo, L.holoDk, h2(x, y, 91 + i) * 0.6); });
  if (rad < 3) b = L.holoLt;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(rad - T * 0.28) < 4 && Math.abs(Math.sin(ang * 6)) > 0.9) b = L.warnDk;
  return b;
});

const TILES = [
  { n: 1, name: 'REGOLITH', role: 'moon surface', draw: drawRegolith, noOutline: true },
  { n: 2, name: 'HULL DECK', role: 'station floor', draw: drawHullDeck, noOutline: true },
  { n: 3, name: 'DECK GRATE', role: 'corridors', draw: drawDeckGrate, noOutline: true },
  { n: 4, name: 'LAB TILE', role: 'science wing', draw: drawLabTile, noOutline: true },
  { n: 5, name: 'HIVE FLOOR', role: 'infested zone', draw: drawHiveFloor, noOutline: true },
  { n: 6, name: 'CRATER FIELD', role: 'rough surface', draw: drawCraterField, noOutline: true },
  { n: 7, name: 'SOLAR GLASS', role: 'panel fields', draw: drawSolarGlass, noOutline: true },
  { n: 8, name: 'WARNING DECK', role: 'airlock zones', draw: drawWarnDeck, noOutline: true },
  { n: 9, name: 'HOLO FLOOR', role: 'command deck', draw: drawHoloFloor, noOutline: true },
  { n: 10, name: 'REACTOR PLATE', role: 'boss arena', draw: drawReactorPlate, noOutline: true },
];

// ---------------- BOSSES (explore all styles) ----------------
// B1 · HIVE QUEEN — xeno matriarch w/ crown crest + egg belly.
function drawHiveQueen(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.3);
  // four stilt legs
  [-1, 1].forEach(s => [[0.14, 0.3], [0.24, 0.22]].forEach(([o, len]) => {
    stroke(put, cx + s * S * o, cy + S * 0.06, cx + s * S * (o + 0.1), cy - S * 0.08, S * 0.03, () => L.xenoDkk);
    stroke(put, cx + s * S * (o + 0.1), cy - S * 0.08, cx + s * S * (o + 0.14), cy + S * len, S * 0.026, () => L.xenoDk);
  }));
  // egg-swollen abdomen
  chitin(put, cx + S * 0.1, cy + S * 0.14, S * 0.2, S * 0.14, L.fleshDk, L.flesh, L.voidDk);
  [[0.02, 0.12], [0.12, 0.16], [0.22, 0.12]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.026, (tx, ty) => mix(L.acid, L.acidDk, ty)));
  // armored thorax + tall crest crown
  chitin(put, cx - S * 0.08, cy - S * 0.04, S * 0.13, S * 0.13, L.xenoDk, L.xeno, L.xenoDkk);
  dome(put, cx - S * 0.14, cy - S * 0.2, S * 0.08, S * 0.07, L.xenoDk, L.xeno, L.xenoDkk);
  for (let k = -2; k <= 2; k++) stroke(put, cx - S * 0.14 + k * S * 0.03, cy - S * 0.25, cx - S * 0.14 + k * S * 0.05, cy - S * 0.38 + Math.abs(k) * S * 0.03, S * 0.024, (t) => mix(L.xenoDk, L.oil, t));
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.14 + s * S * 0.035), Math.round(cy - S * 0.21), L.red));
  // scythe arms
  [-1, 1].forEach(s => {
    stroke(put, cx - S * 0.04 + s * S * 0.06, cy - S * 0.1, cx - S * 0.04 + s * S * 0.2, cy - S * 0.22, S * 0.026, () => L.xenoDk);
    stroke(put, cx - S * 0.04 + s * S * 0.2, cy - S * 0.22, cx - S * 0.04 + s * S * 0.26, cy - S * 0.06, S * 0.022, (t) => mix(L.xenoDkk, L.oil, t * 0.5));
  });
}
// B2 · THE OVERMIND — giant brain in a cracked tank.
function drawOvermind(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // tank base + cap
  plate(put, cx - S * 0.2, cy + S * 0.2, cx + S * 0.2, cy + S * 0.32, L.steel, L.steelLt, L.steelDkk);
  plate(put, cx - S * 0.17, cy - S * 0.34, cx + S * 0.17, cy - S * 0.26, L.steel, L.steelLt, L.steelDkk);
  [[-0.12], [0.12]].forEach(([o]) => put(Math.round(cx + o * S), Math.round(cy - S * 0.3), L.holo));
  // glass cylinder w/ fluid
  for (let y = Math.round(cy - S * 0.26); y < cy + S * 0.2; y++) {
    row(put, y, cx - S * 0.16, cx + S * 0.16, (tx) => {
      let b = mix(L.visorLt, L.visor, Math.abs(tx - 0.5) * 2);
      return mix(b, '#0e3a2a', 0.4);
    });
  }
  // THE BRAIN — wrinkled mass w/ psychic glow
  dome(put, cx, cy - S * 0.06, S * 0.12, S * 0.11, L.flesh, mix(L.flesh, '#ffffff', 0.4), L.fleshDk);
  [[-0.08, -0.1, 0.0, -0.02], [-0.02, -0.14, 0.06, -0.04], [0.02, -0.02, 0.09, -0.1]].forEach(([a, b2, c, d]) =>
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.fleshDk));
  // single lidless eye grafted at the front
  optic(put, cx, cy + S * 0.06, S * 0.04, L.voidDk, L.void, L.voidLt);
  // crack + leak
  stroke(put, cx + S * 0.1, cy - S * 0.2, cx + S * 0.16, cy - S * 0.04, 1, () => '#ffffff');
  stroke(put, cx + S * 0.16, cy - S * 0.04, cx + S * 0.16, cy + S * 0.2, 1, () => '#4a8a6a');
  // cables to the floor
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.16, cy + S * 0.26, cx + s * S * 0.3, cy + S * 0.32, S * 0.02, () => L.steelDk));
  // psychic rings
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.28), Math.round(cy - S * 0.06 + Math.sin(a) * S * 0.22), (a * 5 | 0) % 2 ? L.voidLt : null);
}
// B3 · M.O.T.H.E.R. — rogue AI core: rings, lenses, cable roots.
function drawMother(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  hover(put, cx, S * 0.86, S * 0.16, L.redDk);
  // cable roots
  for (let a = 0.4; a < 2.8; a += 0.4) stroke(put, cx, cy + S * 0.16, cx + Math.cos(a + 3.14) * S * 0.3, cy + S * 0.34, S * 0.02, (t) => mix(L.steelDk, L.oil, t));
  // concentric rotating rings
  [[0.24, 0.1], [0.18, 0.2]].forEach(([rx, tilt], i) => {
    for (let a = 0; a < 6.28; a += 0.06) {
      const px = cx + Math.cos(a) * rx * S, py = cy + Math.sin(a) * rx * S * (0.4 + tilt);
      ell(put, px, py, S * 0.014, S * 0.012, (tx, ty) => mix(i ? L.steelLt : L.steel, L.steelDkk, ty + Math.abs(Math.sin(a)) * 0.4));
    }
  });
  // core sphere
  dome(put, cx, cy, S * 0.13, S * 0.13, L.steelDk, L.steel, L.oil);
  // the EYE lens
  optic(put, cx, cy, S * 0.055, L.redDk, L.red, L.redLt);
  for (let a = 0; a < 6.28; a += 0.785) put(Math.round(cx + Math.cos(a) * S * 0.09), Math.round(cy + Math.sin(a) * S * 0.09), L.warn);
  // hologram glitch panels around it
  [[-0.34, -0.14], [0.3, -0.2], [0.34, 0.08]].forEach(([ox, oy]) => {
    plate(put, cx + ox * S - S * 0.04, cy + oy * S - S * 0.025, cx + ox * S + S * 0.04, cy + oy * S + S * 0.025, L.visor, L.holoDk, L.oil);
    stroke(put, cx + ox * S - S * 0.03, cy + oy * S, cx + ox * S + S * 0.03, cy + oy * S, 1, () => L.holo);
  });
}
// B4 · THE TAKEN CAPTAIN — half-crew, half-hive; tragic 2-phase seed.
function drawTakenCaptain(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // legs — one suited, one chitin
  stroke(put, cx - S * 0.05, cy + S * 0.12, cx - S * 0.08, cy + S * 0.32, S * 0.04, () => L.hullMd);
  stroke(put, cx + S * 0.06, cy + S * 0.12, cx + S * 0.12, cy + S * 0.3, S * 0.038, () => L.xenoDk);
  // torso: suit left / hive growth right
  plate(put, cx - S * 0.12, cy - S * 0.12, cx + S * 0.02, cy + S * 0.12, L.hull, '#ffffff', L.hullDk);
  chitin(put, cx + S * 0.08, cy - S * 0.0, S * 0.11, S * 0.15, L.xenoDk, L.xeno, L.xenoDkk);
  // rank patch + chest light still blinking
  plate(put, cx - S * 0.1, cy - S * 0.08, cx - S * 0.05, cy - S * 0.04, L.red, L.redLt, L.redDk);
  put(Math.round(cx - S * 0.03), Math.round(cy + S * 0.0), L.holo);
  // arms: human hand w/ pistol hanging / scythe arm raised
  stroke(put, cx - S * 0.12, cy - S * 0.02, cx - S * 0.2, cy + S * 0.14, S * 0.03, () => L.hullMd);
  plate(put, cx - S * 0.24, cy + S * 0.14, cx - S * 0.17, cy + S * 0.18, L.steelDk, L.steel, L.oil);
  stroke(put, cx + S * 0.14, cy - S * 0.06, cx + S * 0.26, cy - S * 0.2, S * 0.03, () => L.xenoDk);
  stroke(put, cx + S * 0.26, cy - S * 0.2, cx + S * 0.32, cy - S * 0.04, S * 0.024, (t) => mix(L.xenoDkk, L.oil, t * 0.5));
  // head: broken helmet, face half-taken
  dome(put, cx - S * 0.02, cy - S * 0.2, S * 0.08, S * 0.08, L.hull, '#ffffff', L.hullDk);
  ell(put, cx - S * 0.035, cy - S * 0.19, S * 0.035, S * 0.04, (tx, ty) => mix('#d8a888', '#a87858', ty));
  chitin(put, cx + S * 0.035, cy - S * 0.21, S * 0.045, S * 0.05, L.xenoDk, L.xeno, L.xenoDkk);
  put(Math.round(cx - S * 0.04), Math.round(cy - S * 0.2), L.visor); // human eye
  put(Math.round(cx + S * 0.04), Math.round(cy - S * 0.21), L.red);  // hive eye
  // hive tendrils crossing the helmet crack
  stroke(put, cx + S * 0.01, cy - S * 0.26, cx - S * 0.02, cy - S * 0.14, 1, () => L.xenoDkk);
}
// B5 · VOID LEVIATHAN — star-horror titan, tentacle crown.
function drawVoidLeviathan(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  hover(put, cx, S * 0.88, S * 0.18, L.voidDk);
  chitin(put, cx, cy + S * 0.02, S * 0.2, S * 0.17, '#2c1c4c', L.void, L.oil);
  // inner starfield
  let seed = 13; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 14; i++) { const a = rnd() * 6.28, r = rnd() * S * 0.13; put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.85 + S * 0.02), rnd() > 0.4 ? '#ffffff' : L.voidLt); }
  // THREE eyes in a triangle
  [[-0.07, -0.02], [0.07, -0.02], [0.0, 0.08]].forEach(([ox, oy]) => optic(put, cx + ox * S, cy + oy * S, S * 0.032, L.voidDk, L.warn, L.warnLt));
  // crown of tentacles rising
  for (let k = -3; k <= 3; k++) {
    let px = cx + k * S * 0.06, py = cy - S * 0.12, ang = -1.57 + k * 0.18;
    for (let seg = 0; seg < 5; seg++) {
      const nx = px + Math.cos(ang) * S * 0.06, ny = py + Math.sin(ang) * S * 0.055;
      stroke(put, px, py, nx, ny, S * (0.032 - seg * 0.005), (t) => mix(L.void, '#2c1c4c', t + seg * 0.12));
      px = nx; py = ny; ang += (k >= 0 ? 0.35 : -0.35);
    }
    put(Math.round(px), Math.round(py), L.voidLt);
  }
  // gravity distortion ring
  for (let a = 0; a < 6.28; a += 0.18) put(Math.round(cx + Math.cos(a) * S * 0.32), Math.round(cy + Math.sin(a) * S * 0.26), (a * 8 | 0) % 3 === 0 ? L.voidDk : null);
}
// B6 · GREY ELDER — psychic grey on a hover-throne.
function drawGreyElder(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  hover(put, cx, S * 0.82, S * 0.16);
  // hover-throne saucer
  dome(put, cx, cy + S * 0.16, S * 0.2, S * 0.08, L.steel, L.steelLt, L.steelDkk);
  row(put, Math.round(cy + S * 0.14), cx - S * 0.16, cx + S * 0.16, () => L.holo);
  // high seat back
  plate(put, cx - S * 0.06, cy - S * 0.16, cx + S * 0.06, cy + S * 0.12, L.steelDk, L.steel, L.steelDkk);
  // frail elder body
  for (let y = 0; y < S * 0.18; y++) { const t = y / (S * 0.18), w = S * (0.04 + t * 0.02); row(put, Math.round(cy - S * 0.06 + y), cx - w, cx + w, (tx) => mix(L.moonLt, L.moonDk, t + Math.abs(tx - 0.5) * 0.4)); }
  // huge wizened head
  dome(put, cx, cy - S * 0.18, S * 0.11, S * 0.1, L.moon, L.moonLt, L.moonDk);
  [[-0.06, -0.26, 0.0, -0.24], [0.02, -0.27, 0.07, -0.24]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.moonDk)); // wrinkles
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.05, cy - S * 0.18, S * 0.035, S * 0.05, () => L.oil); put(Math.round(cx + s * S * 0.04), Math.round(cy - S * 0.2), L.void); });
  // hands raised, telekinetic debris orbiting
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy - S * 0.0, cx + s * S * 0.16, cy - S * 0.1, S * 0.016, () => L.moonDk));
  [[-0.26, -0.16], [0.28, -0.1], [0.2, -0.3], [-0.18, -0.32]].forEach(([ox, oy], i) => {
    dome(put, cx + ox * S, cy + oy * S, S * 0.025, S * 0.02, L.moonDk, L.moon, L.moonDkk);
    for (let a = 0; a < 6.28; a += 1) put(Math.round(cx + ox * S + Math.cos(a) * S * 0.04), Math.round(cy + oy * S + Math.sin(a) * S * 0.035), L.voidLt);
  });
}
// B7 · BROOD TITAN — walking egg-carrier colossus.
function drawBroodTitan(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // tree-trunk legs
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.12, cy + S * 0.1, cx + s * S * 0.18, cy + S * 0.32, S * 0.055, () => L.fleshDk); ell(put, cx + s * S * 0.19, cy + S * 0.34, S * 0.055, S * 0.025, () => L.oil); });
  // hunched mass carrying an EGG RACK back
  chitin(put, cx, cy - S * 0.0, S * 0.22, S * 0.18, L.fleshDk, L.flesh, L.voidDk);
  // spinal ridge w/ egg pods nested in it
  [[-0.12, -0.16], [0.0, -0.2], [0.12, -0.16]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.05, S * 0.055, (tx, ty) => mix(L.void, L.voidDk, ty));
    ell(put, cx + ox * S, cy + oy * S, S * 0.025, S * 0.03, (tx, ty) => mix(L.acid, L.acidDk, ty));
  });
  // tiny head low on the chest + glow throat
  dome(put, cx - S * 0.16, cy + S * 0.04, S * 0.06, S * 0.05, L.fleshDk, L.flesh, L.voidDk);
  put(Math.round(cx - S * 0.18), Math.round(cy + S * 0.03), L.red);
  stroke(put, cx - S * 0.12, cy + S * 0.08, cx - S * 0.06, cy + S * 0.1, 2, () => L.acidDk);
  // club arms
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.2, cy - S * 0.04, cx + s * S * 0.3, cy + S * 0.16, S * 0.05, () => L.fleshDk); dome(put, cx + s * S * 0.31, cy + S * 0.2, S * 0.06, S * 0.05, L.voidDk, L.void, L.oil); });
  // hatchling scuttler dropping off the back
  chitin(put, cx + S * 0.26, cy - S * 0.18, S * 0.04, S * 0.03, L.xenoDk, L.xeno, L.xenoDkk);
}
// B8 · LUNAR COLOSSUS — moon-rock golem woken by the hive.
function drawLunarColossus(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.13 - S * 0.05, cy + S * 0.12, cx + s * S * 0.13 + S * 0.05, cy + S * 0.32, L.moonDk, L.moon, L.moonDkk));
  // boulder torso w/ craters
  dome(put, cx, cy - S * 0.02, S * 0.22, S * 0.2, L.moon, L.moonLt, L.moonDkk);
  [[-0.1, -0.06, 0.04], [0.08, 0.04, 0.05], [0.02, -0.12, 0.03]].forEach(([ox, oy, r]) => {
    ell(put, cx + ox * S, cy + oy * S, r * S, r * S * 0.8, (tx, ty) => mix(L.moonDkk, L.moonDk, ty));
  });
  // hive corruption veins glowing through cracks
  [[-0.14, 0.08, -0.04, 0.16], [0.06, -0.16, 0.14, -0.04]].forEach(([a, b2, c, d]) => stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, 1, () => L.acid));
  // heavy arms
  [-1, 1].forEach(s => { dome(put, cx + s * S * 0.26, cy - S * 0.06, S * 0.08, S * 0.07, L.moonDk, L.moon, L.moonDkk); stroke(put, cx + s * S * 0.26, cy - S * 0.0, cx + s * S * 0.3, cy + S * 0.18, S * 0.05, () => L.moonDk); dome(put, cx + s * S * 0.31, cy + S * 0.22, S * 0.065, S * 0.05, L.moon, L.moonLt, L.moonDkk); });
  // head: a small crater face w/ acid-glow eyes
  dome(put, cx, cy - S * 0.26, S * 0.09, S * 0.07, L.moon, L.moonLt, L.moonDk);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.27, S * 0.022, L.xenoDkk, L.acid, L.xenoLt));
  stroke(put, cx - S * 0.03, cy - S * 0.21, cx + S * 0.03, cy - S * 0.21, 2, () => L.moonDkk);
  // orbiting pebbles (low grav!)
  [[-0.36, -0.12], [0.38, -0.06], [0.3, -0.28]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, L.moonDk, L.moon, L.moonDkk));
}
// B9 · PARASITE PRIME — a symbiote mass wearing stolen spacesuits.
function drawParasitePrime(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  // central symbiote mass
  chitin(put, cx, cy + S * 0.04, S * 0.18, S * 0.16, L.void, L.voidLt, L.voidDk);
  // THREE stolen helmets embedded in it, lights still on
  [[-0.1, -0.08], [0.08, -0.12], [0.02, 0.06]].forEach(([ox, oy], i) => {
    dome(put, cx + ox * S, cy + oy * S, S * 0.055, S * 0.05, L.hull, '#ffffff', L.hullDk);
    visor(put, cx + ox * S, cy + oy * S + S * 0.005, S * 0.035, S * 0.028, i === 1 ? '#301818' : L.visor, i === 1 ? L.redDk : L.visorLt);
    if (i === 1) put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.red);
  });
  // suit arms sticking out at wrong angles
  [[-0.16, 0.0, -0.3, -0.08], [0.16, 0.02, 0.28, 0.14], [0.1, 0.14, 0.2, 0.28]].forEach(([a, b2, c, d]) => {
    stroke(put, cx + a * S, cy + b2 * S, cx + c * S, cy + d * S, S * 0.035, () => L.hullMd);
    ell(put, cx + c * S, cy + d * S, S * 0.026, S * 0.022, () => L.hullDk);
  });
  // tendrils lashing from the mass
  for (let a = 0.6; a < 6; a += 1.1) {
    let px = cx + Math.cos(a) * S * 0.16, py = cy + 0.04 * S + Math.sin(a) * S * 0.14, ang = a;
    for (let seg = 0; seg < 4; seg++) { const nx = px + Math.cos(ang) * S * 0.05, ny = py + Math.sin(ang) * S * 0.045; stroke(put, px, py, nx, ny, S * (0.024 - seg * 0.004), (t) => mix(L.void, L.voidDk, t)); px = nx; py = ny; ang += 0.5; }
  }
  // dropped name-patch flavor
  plate(put, cx - S * 0.3, cy + S * 0.28, cx - S * 0.22, cy + S * 0.32, L.hull, '#ffffff', L.hullDk);
  stroke(put, cx - S * 0.29, cy + S * 0.3, cx - S * 0.23, cy + S * 0.3, 1, () => L.red);
}
// B10 · ECLIPSE WYRM — a serpent that blots out the earthrise.
function drawEclipseWyrm(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // little earthrise in the corner it eclipses
  dome(put, cx + S * 0.3, cy - S * 0.3, S * 0.07, S * 0.07, '#4a90d0', '#8ac0f0', '#1c4a80');
  ell(put, cx + S * 0.3, cy - S * 0.31, S * 0.03, S * 0.02, () => '#5faa5a');
  // coiling serpent body across the frame
  const path = [[-0.36, 0.24], [-0.2, 0.08], [0.0, 0.16], [0.2, 0.02], [0.28, -0.16], [0.12, -0.26], [-0.06, -0.2]];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i], [bx, by] = path[i + 1];
    for (let t = 0; t < 1; t += 0.08) {
      const px = cx + lerp(ax, bx, t) * S, py = cy + lerp(ay, by, t) * S;
      const wob = S * (0.055 - i * 0.005);
      ell(put, px, py, wob, wob * 0.85, (tx, ty) => {
        let b = mix('#3a3d5c', '#16182c', ty);
        if (Math.sin((i + t) * 9) > 0.5) b = mix(b, L.voidLt, 0.25); // segment sheen
        return b;
      });
    }
  }
  // fin ridges along the spine
  for (let i = 1; i < path.length - 1; i += 1) {
    const [ax, ay] = path[i];
    stroke(put, cx + ax * S, cy + ay * S - S * 0.04, cx + ax * S + S * 0.02, cy + ay * S - S * 0.1, S * 0.02, (t) => mix(L.void, L.voidDk, t));
  }
  // head w/ gaping maw at the last node
  dome(put, cx - S * 0.09, cy - S * 0.22, S * 0.08, S * 0.065, '#3a3d5c', '#565a80', '#16182c');
  stroke(put, cx - S * 0.15, cy - S * 0.2, cx - S * 0.24, cy - S * 0.14, S * 0.045, () => '#16182c');
  stroke(put, cx - S * 0.14, cy - S * 0.245, cx - S * 0.22, cy - S * 0.26, S * 0.035, () => '#2c2e48');
  for (let t = 0; t < 1; t += 0.25) { put(Math.round(cx - S * 0.15 - t * S * 0.07), Math.round(cy - S * 0.235 + t * S * 0.01), L.white); put(Math.round(cx - S * 0.16 - t * S * 0.05), Math.round(cy - S * 0.17 + t * S * 0.02), L.white); }
  optic(put, cx - S * 0.07, cy - S * 0.24, S * 0.024, L.voidDk, L.warn, L.warnLt);
  // void sparkle trail
  [[-0.3, 0.3], [0.34, 0.14], [0.05, -0.34]].forEach(([ox, oy]) => star(put, Math.round(cx + ox * S), Math.round(cy + oy * S), L.voidLt));
}

const BOSSES = [
  { n: 1, name: 'HIVE QUEEN', role: 'xeno matriarch', draw: drawHiveQueen },
  { n: 2, name: 'THE OVERMIND', role: 'brain in a tank', draw: drawOvermind },
  { n: 3, name: 'M.O.T.H.E.R.', role: 'rogue AI core', draw: drawMother },
  { n: 4, name: 'TAKEN CAPTAIN', role: 'half-crew tragic', draw: drawTakenCaptain },
  { n: 5, name: 'VOID LEVIATHAN', role: 'star-horror titan', draw: drawVoidLeviathan },
  { n: 6, name: 'GREY ELDER', role: 'psychic on a throne', draw: drawGreyElder },
  { n: 7, name: 'BROOD TITAN', role: 'egg-carrier colossus', draw: drawBroodTitan },
  { n: 8, name: 'LUNAR COLOSSUS', role: 'moon-rock golem', draw: drawLunarColossus },
  { n: 9, name: 'PARASITE PRIME', role: 'suit-stealing mass', draw: drawParasitePrime },
  { n: 10, name: 'ECLIPSE WYRM', role: 'void serpent', draw: drawEclipseWyrm },
];

(async () => {
  await renderSheet({ list: TILES, out: process.argv[2] || 'lunar_tile_options.png', title: 'LUNAR STATION — MAP TILE CANDIDATES (each tiling 2x2)', S: 160, cols: 5 });
  await renderSheet({ list: BOSSES, out: process.argv[3] || 'lunar_boss_options.png', title: 'LUNAR STATION — BOSS WORK-UPS, ALL STYLES (pick 1)', S: 160, cols: 5 });
})().catch(e => { console.error(e); process.exit(1); });
