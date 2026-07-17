// artdev/pirate/render_pirate_tiles_boss.js — PIRATE SHIP: 10 tile
// candidates + 10 DREAD CAPTAIN work-ups (living captain; the ghost ship is
// his summon).
'use strict';
const KIT = require('./pirate_kit.js');
const { P, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, skull } = KIT;
const C = { skin: '#d8a070', skinLt: '#f0c898', skinDk: '#a87048', navy: '#2a4a6e', navyLt: '#4a7aa8', navyDk: '#182c44', coat: '#5c1f28', coatLt: '#8a3a42', coatDk: '#38121a' };
function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }
function tiled(base) { return (put, S) => { const T = S / 2; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x % T, y % T, T, Math.floor(x / T) + Math.floor(y / T) * 2); if (c) put(x, y, c); } }; }

// ---------------- TILES ----------------
const drawMainDeck = tiled((x, y, T, q) => {
  const ph = 7, off = (Math.floor(y / ph) % 3) * (T / 3);
  let b = mix(P.deck, P.deckDk, 0.2 + h2(Math.floor(y / ph) + q, 0, 15) * 0.35);
  if (Math.sin((x + off) * 0.4 + Math.floor(y / ph) * 2) > 0.8) b = mix(b, P.woodDkk, 0.4);
  if (y % ph < 1 || (x + off) % (T / 1.5) < 1.4) b = P.woodDkk;
  if (h2(x, y, 17) > 0.995) b = mix(b, P.woodLt, 0.6);
  return b;
});
const drawQuarterdeck = tiled((x, y, T, q) => {
  const ph = 6, off = (Math.floor(y / ph) % 2) * (T / 4);
  let b = mix(P.woodLt, P.wood, 0.2 + h2(Math.floor(y / ph) + q, 1, 25) * 0.3);
  if (y % ph < 1 || (x + off) % (T / 2) < 1.2) b = P.woodDk;
  // polished sheen
  if (Math.sin((x - y) * 0.25) > 0.93) b = mix(b, '#e8cd9a', 0.4);
  // brass inlay line every other tile
  if (q % 2 === 0 && Math.abs(y - T / 2) < 1) b = P.brassDk;
  return b;
});
const drawHoldPlanks = tiled((x, y, T, q) => {
  const ph = 8, off = (Math.floor(y / ph) % 2) * (T / 3);
  let b = mix(P.woodDk, P.woodDkk, 0.3 + h2(Math.floor(y / ph) + q, 2, 35) * 0.4);
  if (y % ph < 1 || (x + off) % (T / 2) < 1.4) b = P.oil;
  if (h2(x, y, 37) > 0.99) b = mix(b, P.weedDk, 0.5); // damp moss
  return b;
});
const drawCargoGrate = tiled((x, y, T, q) => {
  if ((x % 10 < 4) && (y % 10 < 4)) return mix(P.oil, '#050608', 0.5);
  let b = mix(P.wood, P.woodDk, 0.25 + h2(x >> 1, y >> 1, 45) * 0.4);
  if (x % 10 === 4 || y % 10 === 4) b = P.woodDkk;
  return b;
});
const drawCoveSand = tiled((x, y, T, q) => {
  let b = mix('#d9c08a', '#a8905e', 0.2 + h2(x >> 2, y >> 2, 55) * 0.4);
  const rip = Math.sin(y * 0.4 + Math.sin(x * 0.1 + q) * 2);
  if (rip > 0.8) b = mix(b, '#f0dca8', 0.5);
  if (h2(x, y, 57) > 0.993) b = mix(b, '#ffffff', 0.4); // shell flecks
  if (h2(x >> 3, y >> 3, 58) > 0.94 && (x + y) % 5 < 2) b = mix(b, P.weedDk, 0.3); // seaweed bits
  return b;
});
const drawShallows = tiled((x, y, T, q) => {
  const s1 = Math.sin(x * 0.14 + y * 0.1 + q * 2) + Math.sin(y * 0.16 - x * 0.05);
  let b = mix(P.seaLt, P.sea, 0.4 + s1 * 0.22);
  if (s1 > 1.2) b = mix(b, P.moonLt, 0.55);
  if (h2(x, y, 65) > 0.995) b = P.moonLt;
  // sandbar glow through
  if (h2(x >> 4, y >> 4, 66) > 0.8) b = mix(b, '#d9c08a', 0.25);
  return b;
});
const drawDockPlanks = tiled((x, y, T, q) => {
  const pw = 12;
  let b = mix('#9a8262', '#6e5a42', 0.25 + h2(Math.floor(x / pw) + q, 3, 75) * 0.4);
  if (x % pw < 1.4) b = P.woodDkk;
  if (Math.sin(y * 0.3 + Math.floor(x / pw)) > 0.85) b = mix(b, P.woodDkk, 0.35);
  if (h2(x, y, 77) > 0.99) b = mix(b, '#5c8a8a', 0.3); // salt stains
  return b;
});
const drawBarnacleHull = tiled((x, y, T, q) => {
  const ph = 9, off = (Math.floor(y / ph) % 2) * (T / 3);
  let b = mix(P.woodDk, P.woodDkk, 0.3 + h2(Math.floor(y / ph), 4, 85) * 0.3);
  if (y % ph < 1.2 || (x + off) % (T / 2) < 1.4) b = P.oil;
  // barnacle clusters
  const gx = Math.floor(x / 9), gy = Math.floor(y / 9);
  if (h2(gx, gy, 87) > 0.75) {
    const dx = x % 9 - 4.5, dy = y % 9 - 4.5;
    if (dx * dx + dy * dy < 8) return mix(P.sail, P.sailDkk, h2(x, y, 88) * 0.6);
  }
  if (h2(x, y, 89) > 0.98) b = mix(b, P.weedDk, 0.5);
  return b;
});
const drawCaptainsCarpet = tiled((x, y, T, q) => {
  let b = mix(C.coat, C.coatDk, 0.3 + h2(x >> 1, y >> 1, 95) * 0.3);
  const px = x / 8, py = y / 8;
  if (Math.sin(px * 3.14) * Math.sin(py * 3.14) > 0.55) b = mix(b, P.goldDk, 0.4);
  if (x % T < 2 || y % T < 2) b = mix(P.gold, P.goldDk, h2(x, y, 97) * 0.5);
  return b;
});
const drawStormDeck = tiled((x, y, T, q) => {
  const ph = 7, off = (Math.floor(y / ph) % 3) * (T / 3);
  let b = mix('#57402c', '#33251a', 0.3 + h2(Math.floor(y / ph) + q, 5, 105) * 0.4);
  if (y % ph < 1 || (x + off) % (T / 1.5) < 1.4) b = P.oil;
  // wet sheen streaks
  if (Math.sin((x + y * 0.5) * 0.22 + q) > 0.9) b = mix(b, P.moon, 0.25);
  if (h2(x, y, 107) > 0.995) b = P.moonLt; // spray drops
  return b;
});

const TILES = [
  { n: 1, name: 'MAIN DECK', role: 'ship floor', draw: drawMainDeck, noOutline: true },
  { n: 2, name: 'QUARTERDECK', role: 'polished stern', draw: drawQuarterdeck, noOutline: true },
  { n: 3, name: 'HOLD PLANKS', role: 'below decks', draw: drawHoldPlanks, noOutline: true },
  { n: 4, name: 'CARGO GRATE', role: 'hold grates', draw: drawCargoGrate, noOutline: true },
  { n: 5, name: 'COVE SAND', role: 'beach', draw: drawCoveSand, noOutline: true },
  { n: 6, name: 'SHALLOWS', role: 'water edge', draw: drawShallows, noOutline: true },
  { n: 7, name: 'DOCK PLANKS', role: 'pier', draw: drawDockPlanks, noOutline: true },
  { n: 8, name: 'BARNACLE HULL', role: 'hull walls', draw: drawBarnacleHull, noOutline: true },
  { n: 9, name: "CAPTAIN'S CARPET", role: 'cabin', draw: drawCaptainsCarpet, noOutline: true },
  { n: 10, name: 'STORM DECK', role: 'boss arena', draw: drawStormDeck, noOutline: true },
];

// ---------------- DREAD CAPTAIN WORK-UPS ----------------
// shared living-captain base; opts vary coat/hat/weapons/extras
function captain(put, S, o) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  const coat = o.coat || C.coat, coatLt = o.coatLt || C.coatLt, coatDk = o.coatDk || C.coatDk;
  // boots + stance
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.05, cy + S * 0.14, cx + s * S * (o.peg && s > 0 ? 0.06 : 0.1), cy + S * 0.3, S * (o.peg && s > 0 ? 0.016 : 0.032), () => (o.peg && s > 0 ? P.wood : P.oil));
    if (!(o.peg && s > 0)) ell(put, cx + s * S * 0.11, cy + S * 0.315, S * 0.038, S * 0.02, () => P.oil);
  });
  // long captain's coat
  for (let y = 0; y < S * 0.32; y++) {
    const t = y / (S * 0.32), w = S * (0.1 + t * 0.08);
    row(put, Math.round(cy - S * 0.1 + y), cx - w, cx + w, (tx) => {
      let b = mix(coat, coatDk, t);
      if (tx < 0.14 || tx > 0.86) b = mix(b, coatLt, 0.35); // lapel edges
      if (tx > 0.44 && tx < 0.56 && t < 0.55) b = C.skinLt; // shirt
      return b;
    });
  }
  // gold buttons + belt
  [0.0, 0.06, 0.12].forEach(oy => [put(Math.round(cx - S * 0.045), Math.round(cy - S * 0.02 + oy * S), P.gold), put(Math.round(cx + S * 0.045), Math.round(cy - S * 0.02 + oy * S), P.gold)]);
  row(put, Math.round(cy + S * 0.12), cx - S * 0.13, cx + S * 0.13, () => P.woodDkk);
  bolt(put, cx, cy + S * 0.125, S * 0.02, P.gold, P.goldDk);
  // epaulettes
  if (o.epaulettes) [-1, 1].forEach(s => { plate(put, cx + s * S * 0.12 - S * 0.03, cy - S * 0.11, cx + s * S * 0.12 + S * 0.03, cy - S * 0.07, P.gold, P.goldLt, P.goldDk); [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.12 + k * S * 0.015, cy - S * 0.07, cx + s * S * 0.12 + k * S * 0.015, cy - S * 0.045, 1, () => P.goldDk)); });
  // head
  dome(put, cx, cy - S * 0.17, S * 0.068, S * 0.068, o.skinC || C.skin, o.skinLtC || C.skinLt, o.skinDkC || C.skinDk);
  // beard variants
  if (o.beard) dome(put, cx, cy - S * 0.115, S * 0.055, S * 0.045, o.beard, mix(o.beard, '#ffffff', 0.25), mix(o.beard, '#000000', 0.4));
  if (o.coralBeard) {
    dome(put, cx, cy - S * 0.11, S * 0.055, S * 0.05, '#d87a6a', '#f0a890', '#a84838');
    [[-0.03, -0.06], [0.02, -0.05], [-0.005, -0.03]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.01, cy + oy * S + S * 0.04, 2, () => '#f0a890'));
    put(Math.round(cx + S * 0.03), Math.round(cy - S * 0.08), P.sail); // barnacle
  }
  // face
  if (o.patch) { put(Math.round(cx - S * 0.028), Math.round(cy - S * 0.175), P.oil); stroke(put, cx - S * 0.055, cy - S * 0.2, cx - S * 0.0, cy - S * 0.2, 1, () => P.oil); }
  else put(Math.round(cx - S * 0.028), Math.round(cy - S * 0.175), P.oil);
  put(Math.round(cx + S * 0.028), Math.round(cy - S * 0.175), o.eyeC || P.oil);
  if (o.scar) stroke(put, cx + S * 0.04, cy - S * 0.22, cx + S * 0.055, cy - S * 0.13, 1, () => C.skinDk);
  if (!o.beard && !o.coralBeard) stroke(put, cx - S * 0.02, cy - S * 0.12, cx + S * 0.025, cy - S * 0.12, 1, () => C.skinDk);
  // hat variants
  if (o.hat === 'tricorn') {
    for (let y = 0; y < S * 0.05; y++) row(put, Math.round(cy - S * 0.26 + y), cx - S * 0.11 + y * 0.6, cx + S * 0.11 - y * 0.6, () => (y < 2 ? coatLt : coatDk));
    dome(put, cx, cy - S * 0.26, S * 0.06, S * 0.03, coat, coatLt, coatDk);
    if (o.skullBadge) skull(put, cx, cy - S * 0.255, S * 0.018, P.oil);
    if (o.plume) stroke(put, cx + S * 0.08, cy - S * 0.28, cx + S * 0.17, cy - S * 0.34, S * 0.02, () => (o.plumeC || P.red));
  } else if (o.hat === 'bicorn') {
    for (let a = 0.2; a < 2.94; a += 0.08) put(Math.round(cx + Math.cos(a) * S * 0.115), Math.round(cy - S * 0.24 - Math.sin(a) * S * 0.05), coatDk);
    for (let a = 0.2; a < 2.94; a += 0.08) put(Math.round(cx + Math.cos(a) * S * 0.1), Math.round(cy - S * 0.24 - Math.sin(a) * S * 0.04), coat);
    bolt(put, cx, cy - S * 0.27, S * 0.016, P.gold, P.goldDk);
  } else if (o.hat === 'bandana') {
    ell(put, cx, cy - S * 0.215, S * 0.07, S * 0.03, (tx, ty) => mix(o.bandC || P.red, mix(o.bandC || P.red, '#000000', 0.4), ty));
    stroke(put, cx + S * 0.06, cy - S * 0.21, cx + S * 0.13, cy - S * 0.16, 2, () => mix(o.bandC || P.red, '#000000', 0.3));
  } else if (o.hat === 'hood') {
    dome(put, cx, cy - S * 0.2, S * 0.085, S * 0.075, coatDk, coat, P.oil);
  }
  // weapons
  if (o.cutlass) {
    stroke(put, cx + S * 0.12, cy + S * 0.02, cx + S * 0.32, cy - S * 0.1, S * 0.02, () => P.moonLt);
    ell(put, cx + S * 0.115, cy + S * 0.03, S * 0.026, S * 0.02, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
  }
  if (o.pistol) {
    stroke(put, cx - S * 0.12, cy + S * 0.0, cx - S * 0.22, cy - S * 0.02, S * 0.022, () => P.cannon);
    stroke(put, cx - S * 0.14, cy + S * 0.0, cx - S * 0.13, cy + S * 0.04, S * 0.016, () => P.wood);
  }
  if (o.spyglass) { stroke(put, cx - S * 0.12, cy - S * 0.02, cx - S * 0.24, cy - S * 0.08, S * 0.02, () => P.brass); }
  if (o.lanternHand) { stroke(put, cx - S * 0.12, cy + S * 0.0, cx - S * 0.18, cy + S * 0.06, S * 0.02, () => coatDk); dome(put, cx - S * 0.19, cy + S * 0.1, S * 0.03, S * 0.04, P.brass, P.brassLt, P.brassDk); put(Math.round(cx - S * 0.19), Math.round(cy + S * 0.1), P.ghostLt); }
  if (o.tentacleArm) {
    let px = cx - S * 0.12, py = cy + S * 0.0, ang = 2.6;
    for (let seg = 0; seg < 5; seg++) { const nx = px + Math.cos(ang) * S * 0.05, ny = py + Math.sin(ang) * S * 0.045; stroke(put, px, py, nx, ny, S * (0.03 - seg * 0.004), (t) => mix('#7e3a5c', '#4a1f38', t)); px = nx; py = ny; ang += 0.45; }
    put(Math.round(px), Math.round(py), '#b06a8e');
  }
  if (o.hookHand) { stroke(put, cx - S * 0.12, cy + S * 0.0, cx - S * 0.17, cy + S * 0.05, S * 0.022, () => coatDk); for (let a = 0; a < 2.8; a += 0.3) put(Math.round(cx - S * 0.18 + Math.cos(a + 1.6) * S * 0.025), Math.round(cy + S * 0.08 + Math.sin(a + 1.6) * S * 0.025), P.moonLt); }
  // extras
  if (o.parrot) { ell(put, cx + S * 0.14, cy - S * 0.2, S * 0.025, S * 0.035, (tx, ty) => mix(P.red, P.redDk, ty)); stroke(put, cx + S * 0.155, cy - S * 0.225, cx + S * 0.175, cy - S * 0.22, 1, () => P.gold); put(Math.round(cx + S * 0.145), Math.round(cy - S * 0.225), P.oil); }
  if (o.ghostAura) { for (let a = 0; a < 6.28; a += 0.35) put(Math.round(cx + Math.cos(a) * S * 0.28), Math.round(cy - S * 0.02 + Math.sin(a) * S * 0.3), (a * 5 | 0) % 2 ? P.ghost : null); }
  if (o.miniShip) { // tiny spectral galleon over the shoulder — HIS SUMMON
    const sx = cx - S * 0.28, sy = cy - S * 0.26;
    for (let y = 0; y < S * 0.03; y++) row(put, Math.round(sy + S * 0.04 + y), sx - S * 0.06 + y * 0.4, sx + S * 0.06 - y * 0.2, () => P.ghostDk);
    stroke(put, sx, sy + S * 0.04, sx, sy - S * 0.04, 1, () => P.ghost);
    for (let y = 0; y < S * 0.035; y++) row(put, Math.round(sy - S * 0.035 + y), sx + 1, sx + S * 0.04 - y * 0.3, () => P.ghostLt);
    [[0.06, 0.02], [-0.07, 0.0]].forEach(([ox, oy]) => put(Math.round(sx + ox * S), Math.round(sy + oy * S), P.ghostLt));
  }
}

const CAPTAINS = [
  { n: 1, name: 'THE DREAD CAPTAIN', role: 'the classic', o: { hat: 'tricorn', skullBadge: true, beard: '#3a2c22', cutlass: true, pistol: true, patch: true } },
  { n: 2, name: 'CORAL-BEARD', o: { hat: 'tricorn', coralBeard: true, cutlass: true, hookHand: true, scar: true }, role: 'sea-changed' },
  { n: 3, name: 'THE COMMODORE', o: { hat: 'bicorn', coat: C.navy, coatLt: C.navyLt, coatDk: C.navyDk, epaulettes: true, cutlass: true, spyglass: true }, role: 'fallen navy' },
  { n: 4, name: 'IRONJAW', o: { hat: 'bandana', bandC: '#2a4a6e', beard: '#8a94a6', cutlass: true, hookHand: true, scar: true, eyeC: '#ff4b4e' }, role: 'brute captain' },
  { n: 5, name: 'THE SEA WIDOW', o: { hat: 'tricorn', plume: true, plumeC: '#0a0c10', coat: '#1c1e2c', coatLt: '#3a3d5c', coatDk: '#0a0c10', pistol: true, cutlass: true }, role: 'captainess in black' },
  { n: 6, name: 'KRAKENBOUND', o: { hat: 'tricorn', tentacleArm: true, cutlass: true, eyeC: '#5fe8c2', scar: true }, role: 'tentacle-armed' },
  { n: 7, name: 'OLD SALT', o: { hat: 'hood', beard: '#d8d2c0', lanternHand: true, peg: true }, role: 'ancient mariner' },
  { n: 8, name: 'THE DANDY BLADE', o: { hat: 'tricorn', plume: true, plumeC: '#ffcd45', coat: '#7a3aa8', coatLt: '#a86ad0', coatDk: '#4a1f68', cutlass: true, epaulettes: true }, role: 'flamboyant duelist' },
  { n: 9, name: 'THE SUMMONER', o: { hat: 'tricorn', skullBadge: true, beard: '#3a2c22', lanternHand: true, ghostAura: true, miniShip: true, eyeC: '#5fe8c2' }, role: 'ghost-ship caller' },
  { n: 10, name: 'THE HANGED MAN', o: { hat: 'bandana', bandC: '#33251a', coat: '#33251a', coatLt: '#57402c', coatDk: '#1c130c', cutlass: true, scar: true, eyeC: '#9fc4e8' }, role: 'won’t stay dead' },
].map(v => ({ n: v.n, name: v.name, role: v.role, draw: (put, S) => captain(put, S, v.o) }));

module.exports = { captain, TILES };

if (require.main === module) {
  (async () => {
    await renderSheet({ list: TILES, out: process.argv[2] || 'pirate_tile_options.png', title: 'PIRATE SHIP — MAP TILE CANDIDATES (each tiling 2x2)', S: 160, cols: 5 });
    await renderSheet({ list: CAPTAINS, out: process.argv[3] || 'pirate_boss_options.png', title: 'THE DREAD CAPTAIN — WORK-UPS (pick 1; he summons the GHOST SHIP)', S: 160, cols: 5 });
  })().catch(e => { console.error(e); process.exit(1); });
}
