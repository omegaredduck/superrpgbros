// artdev/render_factory_mech.js — 10 work-ups of the PHASE-2 MECH the Grand
// Engineer climbs into ("G.E.-01"): weathered steel+orange battle mech, cockpit
// chest, shoulder weapons, antenna+visor head. Custom-arena boss form (note 13).
'use strict';
const K = require('./factory_kit.js');
const { F, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, vent, shadow, renderSheet } = K;
function hash(a, b) { const n = Math.sin((a % 997) * 12.9 + (b % 997) * 78.2) * 43758.5; return n - Math.floor(n); }
function weather(put, x0, y0, x1, y1) { for (let y = Math.round(y0); y < y1; y++) for (let x = Math.round(x0); x < x1; x++) if (hash(x, y) > 0.9) put(x, y, hash(x + 1, y) > 0.5 ? F.rust : F.rustDk); }

function mechLegs(put, S, cx, acc) {
  [-1, 1].forEach(s => {
    // thigh
    plate(put, cx + s * S * 0.04, S * 0.55, cx + s * S * 0.17, S * 0.7, F.steelMd, F.steel, F.steelDkk);
    // knee joint
    ell(put, cx + s * S * 0.13, S * 0.7, S * 0.05, S * 0.05, (tx, ty) => mix(F.gun, F.gunDk, ty));
    // shin
    plate(put, cx + s * S * 0.07, S * 0.7, cx + s * S * 0.18, S * 0.86, F.iron, F.steel, F.ironDk);
    plate(put, cx + s * S * 0.09, S * 0.72, cx + s * S * 0.15, S * 0.8, acc, F.copperLt, F.rustDk); // accent shin panel
    weather(put, cx + s * S * 0.07, S * 0.7, cx + s * S * 0.18, S * 0.86);
    // big foot
    plate(put, cx + s * S * 0.03, S * 0.86, cx + s * S * 0.21, S * 0.92, F.gun, F.steel, F.gunDk);
    hazard(put, cx + s * S * 0.03, S * 0.9, cx + s * S * 0.21, S * 0.92, F.hazard, F.hazardDk);
    // hydraulic piston
    stroke(put, cx + s * S * 0.05, S * 0.58, cx + s * S * 0.1, S * 0.72, S * 0.02, () => F.chromeMd);
  });
}
function mechTorso(put, S, cx, o) {
  // pelvis
  plate(put, cx - S * 0.16, S * 0.5, cx + S * 0.16, S * 0.58, F.gun, F.steel, F.gunDk);
  // main chest block
  plate(put, cx - S * 0.22, S * 0.28, cx + S * 0.22, S * 0.52, F.steelMd, F.steelLt, F.steelDkk);
  weather(put, cx - S * 0.22, S * 0.28, cx + S * 0.22, S * 0.52);
  // orange shoulder yokes / accent panels
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.12, S * 0.29, cx + s * S * 0.22, S * 0.4, o.acc, F.copperLt, F.rustDk));
  // cockpit
  if (o.cockpit === 'core') { ell(put, cx, S * 0.4, S * 0.1, S * 0.11, () => F.gunDk); optic(put, cx, S * 0.4, S * 0.07, F.moltenDk, F.molten, F.moltenLt); }
  else {
    plate(put, cx - S * 0.1, S * 0.32, cx + S * 0.1, S * 0.48, F.gunDk, F.gun, F.oil); // canopy frame
    plate(put, cx - S * 0.08, S * 0.34, cx + S * 0.08, S * 0.46, F.glass, F.glassLt, F.oil); // glass
    // tiny pilot silhouette (the engineer) in the cockpit
    ell(put, cx, S * 0.4, S * 0.03, S * 0.035, () => F.labcoat);
    ell(put, cx, S * 0.37, S * 0.02, S * 0.02, () => F.hairW); // wild hair
    put(Math.round(cx - S * 0.008), Math.round(S * 0.375), F.red); put(Math.round(cx + S * 0.012), Math.round(S * 0.375), F.red); // red eyes
    if (o.cockpit === 'open') { /* raised canopy hint */ stroke(put, cx - S * 0.08, S * 0.32, cx - S * 0.12, S * 0.24, 1.6, () => F.glassLt); }
    else { stroke(put, cx - S * 0.06, S * 0.35, cx + S * 0.06, S * 0.35, 1, () => F.glassLt); } // reflection
  }
  // vents + label plate
  vent(put, cx - S * 0.19, cx - S * 0.13, S * 0.44, 3);
  plate(put, cx + S * 0.11, S * 0.42, cx + S * 0.2, S * 0.48, F.chromeMd, F.chrome, F.steel);
  // 'G.E.-01' marking
  [0, 1, 2].forEach(i => put(Math.round(cx + S * 0.13 + i * 2), Math.round(S * 0.45), F.gunDk));
  // rivets
  [[-0.2, 0.3], [0.2, 0.3], [-0.2, 0.5], [0.2, 0.5]].forEach(p => bolt(put, cx + p[0] * S, S * p[1], S * 0.014, F.steelLt, F.steelDk));
}
function mechHead(put, S, cx, o) {
  const hy = S * 0.22;
  plate(put, cx - S * 0.07, hy - S * 0.03, cx + S * 0.07, hy + S * 0.05, F.gun, F.steel, F.gunDk); // head box
  if (o.head === 'cyclops') optic(put, cx, hy + S * 0.01, S * 0.045, F.redDk, F.red, F.redLt);
  else if (o.head === 'twin') [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, hy + S * 0.01, S * 0.022, F.redDk, F.red, F.redLt));
  else { // visor slit (default, matches ref) + antenna cluster
    plate(put, cx - S * 0.06, hy, cx + S * 0.06, hy + S * 0.02, F.oil, F.gunDk, F.oil);
    for (let x = cx - S * 0.055; x < cx + S * 0.055; x += 2) put(Math.round(x), Math.round(hy + S * 0.01), F.cyan);
  }
  // antenna cluster
  [-1, 0, 1].forEach(s => { stroke(put, cx + s * S * 0.03, hy - S * 0.03, cx + s * S * 0.05, hy - S * 0.1 - Math.abs(s) * S * 0.01, 1.4, () => F.steelMd); ell(put, cx + s * S * 0.05, hy - S * 0.1 - Math.abs(s) * S * 0.01, S * 0.012, S * 0.012, () => (s ? F.red : F.cyan)); });
}
// ---- weapon arms -------------------------------------------------------
function pauldron(put, S, x, y, acc) { dome(put, x, y, S * 0.09, S * 0.08, F.steelMd, F.steelLt, F.steelDkk); plate(put, x - S * 0.06, y - S * 0.02, x + S * 0.06, y + S * 0.02, acc, F.copperLt, F.rustDk); weather(put, x - S * 0.08, y - S * 0.06, x + S * 0.08, y + S * 0.06); }
function armGatling(put, S, x, acc) {
  plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); // housing
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) ell(put, x + Math.cos(a) * S * 0.025, S * 0.6 + Math.sin(a) * S * 0.025, S * 0.014, S * 0.014, () => F.oil); // barrel ring
  ell(put, x, S * 0.6, S * 0.02, S * 0.02, () => F.steelDk);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; plate(put, x + Math.cos(a) * S * 0.03 - S * 0.008, S * 0.56, x + Math.cos(a) * S * 0.03 + S * 0.008, S * 0.72, F.steelMd, F.steel, F.steelDkk); }
}
function armCannon(put, S, x, acc) { plate(put, x - S * 0.06, S * 0.42, x + S * 0.06, S * 0.54, F.gun, F.steel, F.gunDk); plate(put, x - S * 0.04, S * 0.54, x + S * 0.04, S * 0.74, F.steelMd, F.steel, F.steelDkk); ell(put, x, S * 0.75, S * 0.045, S * 0.05, () => F.oil); ell(put, x, S * 0.75, S * 0.02, S * 0.02, () => F.molten); plate(put, x - S * 0.05, S * 0.6, x + S * 0.05, S * 0.63, acc, F.copperLt, F.rustDk); }
function armDrill(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); for (let y = S * 0.56; y < S * 0.78; y++) { const t = (y - S * 0.56) / 0.22 / S; const hw = lerp(S * 0.06, S * 0.005, (y - S * 0.56) / (S * 0.22)); row(put, Math.round(y), x - hw, x + hw, (tx) => { let b = mix(F.chrome, F.steelDk, tx); if ((Math.round(y) + Math.round((tx - 0.5) * 8)) % 4 < 2) b = mix(b, F.steelDkk, 0.5); return b; }); } }
function armClaw(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); [-1, 0, 1].forEach(s => stroke(put, x + s * S * 0.03, S * 0.56, x + s * S * 0.07, S * 0.72, S * 0.02, () => F.chromeMd)); [-1, 0, 1].forEach(s => stroke(put, x + s * S * 0.07, S * 0.72, x + s * S * 0.05, S * 0.78, S * 0.015, () => F.steel)); optic(put, x, S * 0.5, S * 0.02, F.cyanDk, F.cyan, F.cyanLt); }
function armMissile(put, S, x, acc) { plate(put, x - S * 0.06, S * 0.44, x + S * 0.06, S * 0.66, F.gun, F.steel, F.gunDk); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const mx = x - S * 0.03 + c * S * 0.06, my = S * 0.48 + r * S * 0.09; ell(put, mx, my, S * 0.022, S * 0.022, () => F.oil); put(Math.round(mx), Math.round(my), F.red); } plate(put, x - S * 0.06, S * 0.44, x + S * 0.06, S * 0.46, acc, F.copperLt, F.rustDk); }
function armBuzzsaw(put, S, x, acc) { plate(put, x - S * 0.04, S * 0.42, x + S * 0.04, S * 0.56, F.gun, F.steel, F.gunDk); ell(put, x, S * 0.68, S * 0.1, S * 0.1, (tx, ty) => mix(F.chrome, F.steel, ty)); ell(put, x, S * 0.68, S * 0.04, S * 0.04, () => F.gunDk); for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) stroke(put, x + Math.cos(a) * S * 0.1, S * 0.68 + Math.sin(a) * S * 0.1, x + Math.cos(a) * S * 0.13, S * 0.68 + Math.sin(a) * S * 0.13, 1.4, () => F.chrome); }
function armFist(put, S, x, acc) { plate(put, x - S * 0.05, S * 0.42, x + S * 0.05, S * 0.56, F.gun, F.steel, F.gunDk); plate(put, x - S * 0.08, S * 0.56, x + S * 0.08, S * 0.74, F.iron, F.steel, F.ironDk); for (let k = 0; k < 4; k++) plate(put, x - S * 0.07 + k * S * 0.037, S * 0.56, x - S * 0.05 + k * S * 0.037, S * 0.6, F.steelDk, F.steelMd, F.oil); weather(put, x - S * 0.08, S * 0.56, x + S * 0.08, S * 0.74); }
const ARMS = { gatling: armGatling, cannon: armCannon, drill: armDrill, claw: armClaw, missile: armMissile, buzzsaw: armBuzzsaw, fist: armFist };
function mechBack(put, S, cx, kind) {
  if (kind === 'thrusters') [-1, 1].forEach(s => { plate(put, cx + s * S * 0.2, S * 0.34, cx + s * S * 0.27, S * 0.5, F.steelDk, F.steel, F.steelDkk); ell(put, cx + s * S * 0.235, S * 0.51, S * 0.03, S * 0.025, () => F.cyan); });
  else if (kind === 'stacks') [-1, 1].forEach(s => { for (let y = S * 0.2; y < S * 0.32; y++) row(put, Math.round(y), cx + s * S * 0.18, cx + s * S * 0.22, () => F.gunDk); ell(put, cx + s * S * 0.2, S * 0.2, S * 0.02, S * 0.015, () => F.oil); put(Math.round(cx + s * S * 0.2), Math.round(S * 0.18), F.ember); });
  else if (kind === 'missiles') [-1, 1].forEach(s => { plate(put, cx + s * S * 0.18, S * 0.26, cx + s * S * 0.28, S * 0.38, F.iron, F.steel, F.ironDk); for (let k = 0; k < 3; k++) { const my = S * 0.28 + k * S * 0.035; ell(put, cx + s * S * 0.26, my, S * 0.014, S * 0.014, () => F.red); } });
}
function drawMech(put, S, o) {
  shadow(put, S, S * 0.5, S * 0.26, S * 0.94);
  const cx = S * 0.5;
  if (o.back) mechBack(put, S, cx, o.back);
  mechLegs(put, S, cx, o.acc);
  // shoulders + arms
  [-1, 1].forEach(s => {
    const type = s < 0 ? o.left : o.right, ax = cx + s * S * 0.26;
    pauldron(put, S, ax, S * 0.3, o.acc);
    (ARMS[type] || armGatling)(put, S, ax, o.acc);
  });
  mechTorso(put, S, cx, o);
  mechHead(put, S, cx, o);
}

const LIST = [
  { n: 1, name: 'G.E.-01 ASSAULT', role: 'twin gatlings (ref)', draw: (p, S) => drawMech(p, S, { acc: F.copper, left: 'gatling', right: 'gatling', head: 'visor', cockpit: 'canopy', back: 'stacks' }) },
  { n: 2, name: 'SIEGE FRAME', role: 'cannon + claw + missiles', draw: (p, S) => drawMech(p, S, { acc: F.hazard, left: 'cannon', right: 'claw', head: 'visor', cockpit: 'canopy', back: 'missiles' }) },
  { n: 3, name: 'DEMOLISHER', role: 'drill + fist', draw: (p, S) => drawMech(p, S, { acc: F.molten, left: 'drill', right: 'fist', head: 'twin', cockpit: 'canopy', back: 'stacks' }) },
  { n: 4, name: 'TESLA WALKER', role: 'twin plasma cannons', draw: (p, S) => drawMech(p, S, { acc: F.cyan, left: 'cannon', right: 'cannon', head: 'visor', cockpit: 'core', back: 'thrusters' }) },
  { n: 5, name: 'GUARDIAN', role: 'twin claws, bulky', draw: (p, S) => drawMech(p, S, { acc: F.red, left: 'claw', right: 'claw', head: 'cyclops', cockpit: 'canopy' }) },
  { n: 6, name: 'RIPPER', role: 'buzzsaw + gatling', draw: (p, S) => drawMech(p, S, { acc: F.hazard, left: 'buzzsaw', right: 'gatling', head: 'twin', cockpit: 'canopy', back: 'stacks' }) },
  { n: 7, name: 'ARTILLERY', role: 'dual cannons + missiles', draw: (p, S) => drawMech(p, S, { acc: F.copper, left: 'cannon', right: 'missile', head: 'visor', cockpit: 'open', back: 'missiles' }) },
  { n: 8, name: 'BRUTE', role: 'two piston fists', draw: (p, S) => drawMech(p, S, { acc: F.molten, left: 'fist', right: 'fist', head: 'cyclops', cockpit: 'canopy', back: 'thrusters' }) },
  { n: 9, name: 'OVERLORD', role: 'big optic, dual cannons', draw: (p, S) => drawMech(p, S, { acc: F.purple, left: 'cannon', right: 'gatling', head: 'cyclops', cockpit: 'core', back: 'thrusters' }) },
  { n: 10, name: 'PROTOTYPE', role: 'open cockpit, mixed', draw: (p, S) => drawMech(p, S, { acc: F.hazard, left: 'drill', right: 'gatling', head: 'visor', cockpit: 'open', back: 'stacks' }) }
];

renderSheet({ list: LIST, out: process.argv[2] || 'factory_boss_mech.png', cols: 5, title: 'BIOME 4 · THE GRAND ENGINEER — PHASE-2 MECH "G.E.-01" — 10 WORK-UPS  (pick one)' })
  .catch(e => { console.error(e); process.exit(1); });
