// artdev/render_factory_mobs.js — render 20 numbered ROBOTICS-FACTORY MOB
// candidates as a hi-fi PNG grid for Red to pick 8 from. Biome 4: an epic,
// monumental robot factory (running conveyor belts as the map mechanic).
// 160x160 hi-fi canvas per note #4. Draws with the ranger_art primitives so
// picked options port straight into world_art.js.
//   RANGER_PATH=/tmp/artdev/ranger_art.js node artdev/render_factory_mobs.js out.png
'use strict';
const path = require('path');
const R = require(process.env.RANGER_PATH || path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
const sharp = require('sharp');
const mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

// ---- factory palette (F): steel, gunmetal, brass, hazard, glowing optics ----
const F = {
  OUT: '#141620',
  chrome: '#eef2f7', chromeMd: '#b8c2d0',
  steelLt: '#c7cdd6', steel: '#8a94a6', steelMd: '#697386', steelDk: '#454e63', steelDkk: '#2b3245',
  iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22datepad',
  gun: '#3d4456', gunDk: '#242a38',
  brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
  copper: '#e08b4c', copperLt: '#ffbf8a', copperDk: '#9c5222',
  hazard: '#ffcd45', hazardDk: '#20212c',
  cyan: '#41d6f6', cyanLt: '#c2fbff', cyanDk: '#1f78a8',
  blue: '#5f8bde', blueLt: '#a8c8ff', blueDk: '#2f4f9c',
  red: '#ff4b3e', redLt: '#ffb0a0', redDk: '#9e2422',
  green: '#5fe86b', greenLt: '#c8ffc2', greenDk: '#2b9e3a',
  molten: '#ff7d3a', moltenLt: '#ffd34d', moltenDk: '#c23a1a', ember: '#ff5a2a',
  rubber: '#2a2d38', rubberLt: '#474c5e', rubberDk: '#16171d',
  glass: '#16233d', glassLt: '#3a5f96',
  white: '#f4f4f4', purple: '#a06bd6', purpleLt: '#d6b8ff',
  rust: '#a5623a', rustDk: '#653a20', oil: '#101119'
};
F.ironDkk = '#22283a';

// ---- metal helpers -------------------------------------------------------
function plate(put, x0, y0, x1, y1, base, hi, dk) {
  x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
  for (let y = y0; y < y1; y++) {
    const vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
    row(put, y, x0, x1, (tx) => {
      let b = mix(hi, base, clamp(vt * 1.15, 0, 1));
      b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
      if (tx < 0.13) b = mix(b, hi, 0.55);
      if (tx > 0.9) b = mix(b, dk, 0.5);
      return b;
    });
  }
}
// rounded metal capsule/dome via ellipse with directional shading
function dome(put, cx, cy, rx, ry, base, hi, dk) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    let b = mix(hi, base, clamp(ty * 1.25, 0, 1));
    b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
    if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
    if (tx > 0.82) b = mix(b, dk, 0.4);
    return b;
  });
}
function bolt(put, x, y, r, c, cdk) {
  ell(put, x, y, r, r, (tx, ty) => mix(c || F.steel, cdk || F.steelDkk, 0.25 + ty * 0.6));
  put(Math.round(x), Math.round(y), cdk || F.steelDkk);
}
// glowing lens/optic: halo -> ring -> core -> catchlight
function optic(put, cx, cy, r, cDk, c, cLt) {
  ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 <= 0.25 ? cDk : null));
  ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
  ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
  put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
}
// diagonal hazard stripes clipped to a rectangle band
function hazard(put, x0, y0, x1, y1, a, b) {
  const per = Math.max(3, Math.round((x1 - x0) * 0.14));
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++)
      put(x, y, (Math.floor((x + y) / per) % 2 === 0) ? a : b);
}
// tank tread band with segment ridges + end wheels
function tread(put, x0, x1, yTop, yBot) {
  plate(put, x0, yTop, x1, yBot, F.rubber, F.rubberLt, F.rubberDk);
  const seg = Math.max(4, Math.round((x1 - x0) * 0.11));
  for (let x = Math.round(x0); x < x1; x += seg) for (let y = Math.round(yTop); y < yBot; y++) put(x, y, F.rubberDk);
  const r = (yBot - yTop) * 0.5;
  [x0 + r, x1 - r].forEach(cx => { ell(put, cx, (yTop + yBot) / 2, r * 0.85, r * 0.85, (tx, ty) => mix(F.steel, F.steelDkk, ty)); bolt(put, cx, (yTop + yBot) / 2, r * 0.32, F.steelLt, F.steelDk); });
}
function vent(put, x0, x1, y, n) {
  for (let i = 0; i < n; i++) row(put, y + i * 2, x0, x1, () => F.gunDk);
}
function cable(put, x0, y0, x1, y1, c) {
  stroke(put, x0, y0, x1, y1, Math.max(2, 3), (t) => mix(c, F.oil, 0.3 + 0.4 * Math.abs(Math.sin(t * 6))));
}
function shadow(put, S, cx, w) { ell(put, cx, S * 0.94, w, S * 0.035, () => F.oil); }

// ========================================================================
// 1 · SPARKBOT — tiny hover repair drone; the factory's cheap swarm filler.
function drawSparkbot(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  // hover jet glow beneath
  ell(put, cx, S * 0.7, S * 0.11, S * 0.05, () => F.cyanDk);
  ell(put, cx, S * 0.68, S * 0.07, S * 0.03, () => F.cyanLt);
  // little arms with spark tips
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.14, cy, cx + s * S * 0.3, cy - S * 0.06, S * 0.03, () => F.steelMd);
    ell(put, cx + s * S * 0.32, cy - S * 0.07, S * 0.03, S * 0.03, () => F.brass);
    [0, 1, 2].forEach(k => put(Math.round(cx + s * (S * 0.34 + k * 3)), Math.round(cy - S * 0.09 - k * 2), F.moltenLt));
  });
  // round chassis
  dome(put, cx, cy, S * 0.2, S * 0.19, F.steel, F.chrome, F.steelDk);
  // seam + bolts
  row(put, Math.round(cy), cx - S * 0.19, cx + S * 0.19, () => F.steelDk);
  [-1, 1].forEach(s => bolt(put, cx + s * S * 0.13, cy - S * 0.1, S * 0.02, F.steelLt, F.steelDk));
  // single big optic
  optic(put, cx, cy + S * 0.01, S * 0.09, F.cyanDk, F.cyan, F.cyanLt);
  // antenna
  stroke(put, cx, cy - S * 0.18, cx + S * 0.03, cy - S * 0.32, S * 0.02, () => F.steelMd);
  ell(put, cx + S * 0.035, cy - S * 0.33, S * 0.025, S * 0.025, () => F.red);
}

// 2 · BOLT BEETLE — domed shell scuttling on treads; rams the player.
function drawBoltBeetle(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  tread(put, cx - S * 0.26, cx + S * 0.26, S * 0.72, S * 0.86);
  // carapace shell (two halves, brass seam)
  dome(put, cx, cy, S * 0.28, S * 0.24, F.gun, F.steel, F.gunDk);
  for (let y = Math.round(cy - S * 0.22); y < cy + S * 0.18; y++) put(Math.round(cx), y, F.brass);
  // rivets around the rim
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.5) bolt(put, cx + Math.cos(a) * -S * 0.26, cy - Math.sin(a) * S * 0.2, S * 0.017, F.brassLt, F.brassDk);
  for (let a = 0.2; a < Math.PI - 0.2; a += 0.5) bolt(put, cx + Math.cos(a) * S * 0.26, cy - Math.sin(a) * S * 0.2, S * 0.017, F.brassLt, F.brassDk);
  // ram mandibles up front
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.14, cy + S * 0.2, cx + s * S * 0.26, cy + S * 0.28, S * 0.04, () => F.chromeMd));
  // twin red optics under the lip
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.11, cy + S * 0.12, S * 0.045, F.redDk, F.red, F.redLt));
}

// 3 · RIVETER — squat tripod turret; fires aimed rivet bursts.
function drawRiveter(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.22);
  // tripod legs
  [-1, 0, 1].forEach(s => stroke(put, cx + s * S * 0.02, cy + S * 0.12, cx + s * S * 0.22, S * 0.9, S * 0.035, (t) => mix(F.steelMd, F.steelDk, t)));
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.22, S * 0.9, S * 0.04, S * 0.02, () => F.steelDk));
  // turret body drum
  dome(put, cx, cy, S * 0.2, S * 0.17, F.steel, F.chrome, F.steelDk);
  vent(put, cx - S * 0.12, cx + S * 0.12, cy + S * 0.06, 4);
  // ammo hopper on top
  plate(put, cx - S * 0.08, cy - S * 0.28, cx + S * 0.08, cy - S * 0.14, F.brass, F.brassLt, F.brassDk);
  [-0.04, 0.04].forEach(o => bolt(put, cx + o * S, cy - S * 0.2, S * 0.02, F.chrome, F.steelDk));
  // big rivet-gun barrel pointing right
  plate(put, cx + S * 0.14, cy - S * 0.05, cx + S * 0.42, cy + S * 0.06, F.gun, F.steel, F.gunDk);
  ell(put, cx + S * 0.42, cy + S * 0.005, S * 0.035, S * 0.05, () => F.oil);
  optic(put, cx, cy - S * 0.02, S * 0.05, F.redDk, F.red, F.redLt);
}

// 4 · ARC WELDER — mobile arm robot; strikes with a live welding arc.
function drawArcWelder(put, S) {
  const cx = S * 0.44, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // wheeled base
  plate(put, cx - S * 0.16, S * 0.7, cx + S * 0.16, S * 0.84, F.steelMd, F.steel, F.steelDkk);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.12, S * 0.86, S * 0.06, S * 0.06, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); bolt(put, cx + s * S * 0.12, S * 0.86, S * 0.02, F.steel, F.steelDk); });
  // torso column
  plate(put, cx - S * 0.1, cy - S * 0.06, cx + S * 0.1, S * 0.72, F.steel, F.chrome, F.steelDk);
  vent(put, cx - S * 0.07, cx + S * 0.07, cy + S * 0.06, 5);
  // head with welder's visor slit
  dome(put, cx, cy - S * 0.16, S * 0.11, S * 0.1, F.gun, F.steel, F.gunDk);
  row(put, Math.round(cy - S * 0.16), cx - S * 0.08, cx + S * 0.08, () => F.cyanLt);
  // articulated arm reaching right, holding torch with arc
  stroke(put, cx + S * 0.06, cy, cx + S * 0.26, cy + S * 0.06, S * 0.04, () => F.steelMd);
  stroke(put, cx + S * 0.26, cy + S * 0.06, cx + S * 0.38, cy - S * 0.04, S * 0.035, () => F.gun);
  ell(put, cx + S * 0.39, cy - S * 0.05, S * 0.03, S * 0.03, () => F.copper);
  // electric arc sparks off the torch tip
  [[0.44, -0.1], [0.5, -0.02], [0.46, 0.05], [0.53, -0.12]].forEach(p => { put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.cyanLt); put(Math.round(cx + p[0] * S) + 1, Math.round(cy + p[1] * S), F.white); });
  stroke(put, cx + S * 0.4, cy - S * 0.05, cx + S * 0.5, cy - S * 0.1, 1.4, () => F.cyan);
}

// 5 · CONVEYOR CENTIPEDE — segmented crawler that rides the belts.
function drawCentipede(put, S) {
  const y = S * 0.52;
  shadow(put, S, S * 0.5, S * 0.3);
  const segs = 5;
  for (let i = segs - 1; i >= 0; i--) {
    const cx = S * (0.24 + i * 0.12);
    // little wheels
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.03, y + S * 0.11, S * 0.028, S * 0.028, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)));
    dome(put, cx, y, S * 0.075, S * 0.08, i === segs - 1 ? F.copper : F.steel, i === segs - 1 ? F.copperLt : F.chrome, i === segs - 1 ? F.copperDk : F.steelDk);
    // connecting joint
    if (i < segs - 1) plate(put, cx + S * 0.06, y - S * 0.015, cx + S * 0.09, y + S * 0.02, F.gunDk, F.gun, F.oil);
  }
  // head segment (rightmost) — mandibles + optic
  const hx = S * (0.24 + (segs - 1) * 0.12);
  [-1, 1].forEach(s => stroke(put, hx + S * 0.06, y + s * S * 0.03, hx + S * 0.13, y + s * S * 0.06, S * 0.02, () => F.chromeMd));
  optic(put, hx + S * 0.03, y - S * 0.005, S * 0.035, F.redDk, F.red, F.redLt);
  // tail spark
  put(Math.round(S * 0.2), Math.round(y - S * 0.02), F.cyanLt);
}

// 6 · PISTON RAM — heavy block with a hydraulic hammer that slams down.
function drawPistonRam(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  shadow(put, S, cx, S * 0.24);
  // heavy tracked base
  tread(put, cx - S * 0.3, cx + S * 0.3, S * 0.78, S * 0.92);
  // body block
  plate(put, cx - S * 0.24, cy - S * 0.02, cx + S * 0.24, S * 0.78, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.24, S * 0.7, cx + S * 0.24, S * 0.77, F.hazard, F.hazardDk);
  // bolts
  [-0.2, 0.2].forEach(o => [0.05, 0.5].forEach(v => bolt(put, cx + o * S, cy + v * S * 0.3, S * 0.02, F.steelLt, F.steelDk)));
  // hydraulic piston tower + hammer head
  plate(put, cx - S * 0.09, S * 0.16, cx + S * 0.09, cy, F.gun, F.steel, F.gunDk);
  plate(put, cx - S * 0.06, S * 0.22, cx + S * 0.06, cy, F.chromeMd, F.chrome, F.steel); // shiny rod
  plate(put, cx - S * 0.2, S * 0.06, cx + S * 0.2, S * 0.2, F.iron, F.steel, F.ironDk); // hammer block
  hazard(put, cx - S * 0.2, S * 0.06, cx + S * 0.2, S * 0.11, F.hazard, F.hazardDk);
  // twin optics
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.1, cy + S * 0.05, S * 0.04, F.redDk, F.red, F.redLt));
}

// 7 · SCRAP HULK — a lumbering mass of welded-scrap; the tank.
function drawScrapHulk(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // mismatched legs
  [-1, 1].forEach(s => { plate(put, cx + s * S * 0.08 - S * 0.06, S * 0.66, cx + s * S * 0.08 + S * 0.06, S * 0.9, s < 0 ? F.rust : F.steelMd, F.steel, F.rustDk); ell(put, cx + s * S * 0.08, S * 0.91, S * 0.08, S * 0.03, () => F.oil); });
  // bulky asymmetric torso from junk plates
  dome(put, cx, cy, S * 0.32, S * 0.26, F.steelMd, F.steelLt, F.steelDkk);
  plate(put, cx - S * 0.28, cy - S * 0.1, cx - S * 0.05, cy + S * 0.14, F.rust, F.copperLt, F.rustDk);
  plate(put, cx + S * 0.02, cy - S * 0.18, cx + S * 0.26, cy + S * 0.02, F.gun, F.steel, F.gunDk);
  // welds + rivets scattered
  for (let k = 0; k < 8; k++) bolt(put, cx + (Math.sin(k * 2.3)) * S * 0.22, cy + Math.cos(k * 1.7) * S * 0.16, S * 0.016, F.brassLt, F.brassDk);
  // big scrap-plate arm/fist
  plate(put, cx + S * 0.22, cy - S * 0.02, cx + S * 0.36, cy + S * 0.22, F.iron, F.steel, F.ironDk);
  // mismatched glowing optics (one big, one small)
  optic(put, cx - S * 0.08, cy - S * 0.06, S * 0.06, F.moltenDk, F.molten, F.moltenLt);
  optic(put, cx + S * 0.08, cy - S * 0.04, S * 0.03, F.moltenDk, F.molten, F.moltenLt);
  // exhaust smoke stub
  ell(put, cx - S * 0.16, cy - S * 0.24, S * 0.03, S * 0.05, () => F.gunDk);
}

// 8 · VOLT COIL — stationary tesla tower; radial lightning bursts.
function drawVoltCoil(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // base platform
  plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.2, S * 0.9, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.2, S * 0.86, cx + S * 0.2, S * 0.9, F.hazard, F.hazardDk);
  // insulator stack (ceramic rings)
  for (let i = 0; i < 4; i++) { const yy = S * (0.72 - i * 0.1); dome(put, cx, yy, S * 0.09 - i * S * 0.008, S * 0.035, F.chromeMd, F.white, F.steel); }
  // copper coil windings
  for (let i = 0; i < 7; i++) { const yy = S * (0.68 - i * 0.045); row(put, Math.round(yy), cx - S * 0.06, cx + S * 0.06, (tx) => mix(F.copperLt, F.copperDk, tx)); }
  // top toroid sphere
  dome(put, cx, S * 0.3, S * 0.13, S * 0.11, F.chromeMd, F.chrome, F.steel);
  // arcing lightning off the sphere
  [-1, 1].forEach(s => {
    let px = cx, py = S * 0.24;
    for (let k = 0; k < 5; k++) { const nx = px + s * S * (0.04 + Math.random() * 0), ny = py - S * 0.05; stroke(put, px, py, cx + s * S * (0.05 + k * 0.05), S * 0.26 - k * S * 0.04 + (k % 2) * S * 0.03, 1.4, () => F.cyanLt); px = cx + s * S * (0.05 + k * 0.05); py = S * 0.26 - k * S * 0.04; }
  });
  optic(put, cx, S * 0.3, S * 0.05, F.cyanDk, F.cyan, F.cyanLt);
}

// 9 · HIVE DRONE — quadrotor flyer with an underslung optic.
function drawHiveDrone(put, S) {
  const cx = S * 0.5, cy = S * 0.44;
  shadow(put, S, cx, S * 0.16);
  // arms + rotors (motion blur discs)
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(d => {
    const ax = cx + d[0] * S * 0.26, ay = cy + d[1] * S * 0.14;
    stroke(put, cx + d[0] * S * 0.08, cy + d[1] * S * 0.05, ax, ay, S * 0.028, () => F.gun);
    ell(put, ax, ay, S * 0.13, S * 0.03, () => F.steelDk); // blur disc
    ell(put, ax, ay, S * 0.13, S * 0.03, (tx) => (Math.floor(tx * 8) % 2 ? F.steelLt : null));
    bolt(put, ax, ay, S * 0.02, F.steel, F.steelDk);
  });
  // central body
  dome(put, cx, cy, S * 0.15, S * 0.12, F.steel, F.chrome, F.steelDk);
  hazard(put, cx - S * 0.1, cy - S * 0.11, cx + S * 0.1, cy - S * 0.06, F.hazard, F.hazardDk);
  // underslung gimbal camera
  ell(put, cx, cy + S * 0.13, S * 0.06, S * 0.055, (tx, ty) => mix(F.gun, F.gunDk, ty));
  optic(put, cx, cy + S * 0.14, S * 0.035, F.redDk, F.red, F.redLt);
  // status LED
  put(Math.round(cx + S * 0.08), Math.round(cy - S * 0.02), F.green);
}

// 10 · LASER TRIPOD — tall sniper; charges a beam from a big lens.
function drawLaserTripod(put, S) {
  const cx = S * 0.5, cy = S * 0.36;
  shadow(put, S, cx, S * 0.2);
  [-1, 0, 1].forEach(s => stroke(put, cx + s * S * 0.015, cy + S * 0.1, cx + s * S * 0.2, S * 0.9, S * 0.03, (t) => mix(F.steel, F.steelDk, t)));
  // slim head housing
  plate(put, cx - S * 0.13, cy - S * 0.1, cx + S * 0.13, cy + S * 0.12, F.gun, F.steel, F.gunDk);
  plate(put, cx - S * 0.1, cy - S * 0.02, cx + S * 0.18, cy + S * 0.04, F.steelMd, F.steel, F.steelDkk); // barrel
  vent(put, cx - S * 0.1, cx + S * 0.1, cy + S * 0.07, 3);
  // big charging lens at the muzzle
  optic(put, cx + S * 0.19, cy + S * 0.01, S * 0.07, F.redDk, F.red, F.redLt);
  // charge beam hint
  stroke(put, cx + S * 0.26, cy + S * 0.01, cx + S * 0.44, cy + S * 0.01, 2, () => F.redLt);
  // sensor fin on top
  stroke(put, cx, cy - S * 0.1, cx, cy - S * 0.22, S * 0.02, () => F.steelMd);
  ell(put, cx, cy - S * 0.23, S * 0.02, S * 0.02, () => F.cyan);
}

// 11 · FORGE HOUND — quadruped hunter with a molten reactor core.
function drawForgeHound(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.26);
  // 4 piston legs
  [[-0.22, 1], [-0.1, 1], [0.12, 1], [0.24, 1]].forEach((p, i) => {
    stroke(put, cx + p[0] * S, cy + S * 0.1, cx + p[0] * S + (i < 2 ? -1 : 1) * S * 0.02, S * 0.88, S * 0.03, () => F.steelMd);
    ell(put, cx + p[0] * S, S * 0.89, S * 0.035, S * 0.02, () => F.oil);
  });
  // sleek body
  dome(put, cx, cy, S * 0.28, S * 0.15, F.gun, F.steel, F.gunDk);
  // molten seams glowing between plates
  [-0.1, 0.05, 0.18].forEach(o => stroke(put, cx + o * S, cy - S * 0.12, cx + o * S - S * 0.02, cy + S * 0.12, 1.6, () => F.molten));
  // reactor core in the chest
  optic(put, cx - S * 0.05, cy + S * 0.02, S * 0.06, F.moltenDk, F.molten, F.moltenLt);
  // head lunging forward with jaw
  dome(put, cx + S * 0.26, cy - S * 0.04, S * 0.1, S * 0.08, F.steel, F.chrome, F.steelDk);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.3, cy - S * 0.04 + s * S * 0.03, cx + S * 0.4, cy - S * 0.02 + s * S * 0.05, S * 0.02, () => F.chromeMd)); // jaw
  optic(put, cx + S * 0.28, cy - S * 0.06, S * 0.03, F.moltenDk, F.moltenLt, F.white);
  // ear antennae
  [-1, 1].forEach(s => stroke(put, cx + S * 0.24, cy - S * 0.1, cx + S * 0.22 + s * S * 0.02, cy - S * 0.2, 1.4, () => F.steelMd));
  // tail exhaust with ember
  stroke(put, cx - S * 0.26, cy - S * 0.02, cx - S * 0.36, cy - S * 0.12, S * 0.025, () => F.gun);
  ell(put, cx - S * 0.37, cy - S * 0.13, S * 0.025, S * 0.025, () => F.ember);
}

// 12 · BUZZSAW UNIT — a rolling frame around a huge circular sawblade.
function drawBuzzsaw(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.24);
  // frame arms holding the blade
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.28, cy + S * 0.28, cx + s * S * 0.14, cy, S * 0.04, () => F.gun); ell(put, cx + s * S * 0.28, cy + S * 0.3, S * 0.05, S * 0.05, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); });
  plate(put, cx - S * 0.16, cy + S * 0.14, cx + S * 0.16, cy + S * 0.26, F.steelMd, F.steel, F.steelDkk);
  hazard(put, cx - S * 0.16, cy + S * 0.14, cx + S * 0.16, cy + S * 0.19, F.hazard, F.hazardDk);
  // the sawblade
  ell(put, cx, cy - S * 0.04, S * 0.32, S * 0.32, (tx, ty) => mix(F.chrome, F.steel, clamp(ty, 0, 1)));
  ell(put, cx, cy - S * 0.04, S * 0.26, S * 0.26, () => F.steelDk);
  // teeth around the rim
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    const tx = cx + Math.cos(a) * S * 0.32, ty = cy - S * 0.04 + Math.sin(a) * S * 0.32;
    stroke(put, tx, ty, cx + Math.cos(a + 0.1) * S * 0.37, cy - S * 0.04 + Math.sin(a + 0.1) * S * 0.37, 1.6, () => F.chrome);
  }
  // hub + optic
  ell(put, cx, cy - S * 0.04, S * 0.11, S * 0.11, (tx, ty) => mix(F.gun, F.gunDk, ty));
  optic(put, cx, cy - S * 0.04, S * 0.05, F.redDk, F.red, F.redLt);
  // spark flick
  [[0.3, 0.2], [-0.28, -0.18]].forEach(p => put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.moltenLt));
}

// 13 · MAG-CRANE — treaded crane with a magnetic horseshoe claw; pulls you in.
function drawMagCrane(put, S) {
  const cx = S * 0.42, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  tread(put, cx - S * 0.22, cx + S * 0.18, S * 0.78, S * 0.9);
  // cab
  plate(put, cx - S * 0.16, cy, cx + S * 0.1, S * 0.78, F.hazard, F.brassLt, F.brassDk);
  hazard(put, cx - S * 0.16, cy, cx + S * 0.1, cy + S * 0.05, F.hazardDk, F.hazard);
  plate(put, cx - S * 0.12, cy + S * 0.1, cx + S * 0.02, cy + S * 0.24, F.glass, F.glassLt, F.oil); // window
  // crane boom to the right
  stroke(put, cx + S * 0.04, cy - S * 0.02, cx + S * 0.34, cy - S * 0.22, S * 0.045, () => F.steelMd);
  // lattice detail
  for (let k = 0; k < 5; k++) { const t = k / 5; stroke(put, lerp(cx + S * 0.06, cx + S * 0.32, t), lerp(cy, cy - S * 0.2, t) + S * 0.03, lerp(cx + S * 0.06, cx + S * 0.32, t) + S * 0.02, lerp(cy, cy - S * 0.2, t) - S * 0.03, 1.2, () => F.steelDk); }
  // dangling cable + magnet
  stroke(put, cx + S * 0.34, cy - S * 0.22, cx + S * 0.34, cy + S * 0.02, 1.6, () => F.oil);
  // horseshoe electromagnet
  plate(put, cx + S * 0.27, cy + S * 0.02, cx + S * 0.41, cy + S * 0.1, F.red, F.redLt, F.redDk);
  [cx + S * 0.28, cx + S * 0.4].forEach(px => plate(put, px - S * 0.02, cy + S * 0.1, px + S * 0.02, cy + S * 0.2, F.steel, F.chrome, F.steelDk));
  // magnetic field arcs
  [-1, 1].forEach(s => stroke(put, cx + S * 0.34 + s * S * 0.05, cy + S * 0.22, cx + S * 0.34, cy + S * 0.28, 1.2, () => F.cyanLt));
  optic(put, cx - S * 0.07, cy + S * 0.05, S * 0.03, F.redDk, F.red, F.redLt);
}

// 14 · COOLANT TANK — wheeled tank spraying freezing coolant (slow field).
function drawCoolantTank(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.14, S * 0.85, S * 0.07, S * 0.07, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); bolt(put, cx + s * S * 0.14, S * 0.85, S * 0.02, F.steel, F.steelDk); });
  // cylindrical coolant tank
  for (let y = Math.round(cy - S * 0.2); y < S * 0.78; y++) { const t = (y - (cy - S * 0.2)) / (S * 0.78 - (cy - S * 0.2)); row(put, y, cx - S * 0.18, cx + S * 0.14, (tx) => { let b = mix(F.blueLt, F.blue, clamp(tx * 1.3, 0, 1)); b = mix(b, F.blueDk, clamp((tx - 0.6) * 1.2, 0, 1)); return b; }); }
  // frost bands
  [0.1, 0.4, 0.7].forEach(v => row(put, Math.round(cy - S * 0.2 + v * S * 0.4), cx - S * 0.18, cx + S * 0.14, () => F.white));
  // gauge
  ell(put, cx - S * 0.02, cy, S * 0.04, S * 0.04, () => F.white); put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.02), F.red);
  // spray nozzle top-right + vapor
  stroke(put, cx + S * 0.1, cy - S * 0.16, cx + S * 0.26, cy - S * 0.24, S * 0.03, () => F.steelMd);
  ell(put, cx + S * 0.27, cy - S * 0.25, S * 0.03, S * 0.03, () => F.chrome);
  for (let k = 0; k < 6; k++) { const px = cx + S * (0.3 + k * 0.03), py = cy - S * 0.25 + Math.sin(k) * S * 0.04; put(Math.round(px), Math.round(py), F.cyanLt); put(Math.round(px), Math.round(py) + 1, F.white); }
  optic(put, cx - S * 0.08, cy + S * 0.1, S * 0.03, F.cyanDk, F.cyan, F.cyanLt);
}

// 15 · NANO SWARM — a loose cluster of cube nanobots; splits when killed.
function drawNanoSwarm(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // scattered cubes forming a rough body
  const cubes = [[0, 0, 0.16], [-0.18, -0.06, 0.1], [0.16, -0.1, 0.11], [-0.1, 0.16, 0.09], [0.14, 0.14, 0.1], [-0.22, 0.08, 0.06], [0.24, 0.02, 0.07], [0.02, -0.22, 0.08], [-0.06, -0.02, 0.12]];
  cubes.forEach((c, i) => {
    const bx = cx + c[0] * S, by = cy + c[1] * S, r = c[2] * S;
    const pal = i % 3 === 0 ? [F.cyan, F.cyanLt, F.cyanDk] : [F.steel, F.chrome, F.steelDk];
    plate(put, bx - r, by - r, bx + r, by + r, pal[0], pal[1], pal[2]);
    // circuit trace on the cube face
    row(put, Math.round(by), bx - r * 0.7, bx + r * 0.7, () => pal[2]);
    put(Math.round(bx), Math.round(by), F.greenLt);
  });
  // free-floating motes drifting off
  [[-0.3, -0.14], [0.32, -0.2], [-0.28, 0.24], [0.3, 0.24]].forEach(p => { put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.cyanLt); put(Math.round(cx + p[0] * S) + 2, Math.round(cy + p[1] * S) + 1, F.cyan); });
  // a couple of collective optics
  optic(put, cx - S * 0.02, cy - S * 0.02, S * 0.04, F.cyanDk, F.cyan, F.cyanLt);
}

// 16 · WARFRAME — bipedal battle mech with shoulder cannons (heavy threat).
function drawWarframe(put, S) {
  const cx = S * 0.5, cy = S * 0.42;
  shadow(put, S, cx, S * 0.26);
  // reverse-joint legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.09, cy + S * 0.16, cx + s * S * 0.17, cy + S * 0.34, S * 0.05, () => F.steelMd);
    stroke(put, cx + s * S * 0.17, cy + S * 0.34, cx + s * S * 0.1, S * 0.86, S * 0.045, () => F.steel);
    plate(put, cx + s * S * 0.1 - S * 0.06, S * 0.86, cx + s * S * 0.1 + S * 0.06, S * 0.92, F.gun, F.steel, F.gunDk); // foot
  });
  // hip block
  plate(put, cx - S * 0.14, cy + S * 0.12, cx + S * 0.14, cy + S * 0.22, F.gun, F.steel, F.gunDk);
  // torso
  dome(put, cx, cy, S * 0.2, S * 0.16, F.steel, F.chrome, F.steelDk);
  plate(put, cx - S * 0.05, cy - S * 0.02, cx + S * 0.05, cy + S * 0.1, F.hazard, F.brassLt, F.hazardDk); // core panel
  optic(put, cx, cy + S * 0.03, S * 0.045, F.cyanDk, F.cyan, F.cyanLt);
  // shoulder cannons
  [-1, 1].forEach(s => { plate(put, cx + s * S * 0.16 - S * 0.06, cy - S * 0.14, cx + s * S * 0.16 + S * 0.06, cy - S * 0.02, F.iron, F.steel, F.ironDk); ell(put, cx + s * S * 0.22, cy - S * 0.08, S * 0.025, S * 0.03, () => F.oil); });
  // small head with visor
  dome(put, cx, cy - S * 0.18, S * 0.07, S * 0.06, F.gun, F.steel, F.gunDk);
  row(put, Math.round(cy - S * 0.18), cx - S * 0.05, cx + S * 0.05, () => F.red);
}

// 17 · REPAIR UNIT — hover medic drone; welds allies back together (healer).
function drawRepairUnit(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  shadow(put, S, cx, S * 0.16);
  // hover ring
  ell(put, cx, cy + S * 0.24, S * 0.16, S * 0.05, () => F.greenDk);
  ell(put, cx, cy + S * 0.23, S * 0.12, S * 0.03, () => F.greenLt);
  // white-and-green body (medic livery)
  dome(put, cx, cy, S * 0.18, S * 0.16, F.chromeMd, F.white, F.steel);
  // green cross emblem
  plate(put, cx - S * 0.015, cy - S * 0.08, cx + S * 0.015, cy + S * 0.02, F.green, F.greenLt, F.greenDk);
  plate(put, cx - S * 0.05, cy - S * 0.045, cx + S * 0.05, cy - S * 0.015, F.green, F.greenLt, F.greenDk);
  // two repair arms with a wrench + a welding beam
  stroke(put, cx - S * 0.12, cy + S * 0.06, cx - S * 0.26, cy + S * 0.16, S * 0.03, () => F.steelMd);
  plate(put, cx - S * 0.3, cy + S * 0.14, cx - S * 0.24, cy + S * 0.2, F.chrome, F.white, F.steel); // wrench head
  stroke(put, cx + S * 0.12, cy + S * 0.06, cx + S * 0.24, cy + S * 0.16, S * 0.03, () => F.steelMd);
  // healing beam
  stroke(put, cx + S * 0.24, cy + S * 0.16, cx + S * 0.34, cy + S * 0.26, 2, () => F.greenLt);
  [[0.36, 0.28], [0.3, 0.22]].forEach(p => put(Math.round(cx + p[0] * S), Math.round(cy + p[1] * S), F.white));
  // optic
  optic(put, cx, cy - S * 0.12, S * 0.035, F.greenDk, F.green, F.greenLt);
}

// 18 · PURGE FLAMER — treaded unit with a flamethrower; sweeps a fire cone.
function drawPurgeFlamer(put, S) {
  const cx = S * 0.42, cy = S * 0.52;
  shadow(put, S, cx, S * 0.22);
  tread(put, cx - S * 0.22, cx + S * 0.16, S * 0.78, S * 0.92);
  // armored body
  plate(put, cx - S * 0.18, cy - S * 0.04, cx + S * 0.12, S * 0.78, F.iron, F.steel, F.ironDk);
  hazard(put, cx - S * 0.18, cy - S * 0.04, cx + S * 0.12, cy + S * 0.02, F.hazard, F.hazardDk);
  // fuel tanks on the back
  [-0.13, -0.05].forEach(o => { for (let y = Math.round(cy); y < S * 0.72; y++) row(put, y, cx + o * S - S * 0.03, cx + o * S + S * 0.03, (tx) => mix(F.red, F.redDk, tx)); ell(put, cx + o * S, cy - S * 0.02, S * 0.03, S * 0.02, () => F.redLt); });
  // flamethrower nozzle right
  stroke(put, cx + S * 0.08, cy + S * 0.02, cx + S * 0.24, cy + S * 0.02, S * 0.035, () => F.gun);
  ell(put, cx + S * 0.25, cy + S * 0.02, S * 0.03, S * 0.035, () => F.oil);
  // fire cone
  for (let k = 0; k < 22; k++) {
    const t = k / 22, fx = cx + S * (0.28 + t * 0.24), spread = S * (0.02 + t * 0.12);
    const fy = cy + S * 0.02 + (Math.sin(k * 1.7) * spread);
    const c = t < 0.4 ? F.white : t < 0.7 ? F.moltenLt : F.molten;
    put(Math.round(fx), Math.round(fy), c); put(Math.round(fx), Math.round(fy) + 1, mix(c, F.ember, 0.5));
  }
  optic(put, cx - S * 0.1, cy + S * 0.06, S * 0.03, F.moltenDk, F.molten, F.moltenLt);
}

// 19 · BULWARK DRONE — hovers and projects a hex energy shield (guard).
function drawBulwark(put, S) {
  const cx = S * 0.42, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  ell(put, cx, cy + S * 0.24, S * 0.14, S * 0.045, () => F.blueDk);
  ell(put, cx, cy + S * 0.23, S * 0.1, S * 0.028, () => F.blueLt);
  // stout body
  dome(put, cx, cy, S * 0.17, S * 0.16, F.steelMd, F.steel, F.steelDkk);
  // shield emitter dishes
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.13, cy - S * 0.02, S * 0.04, S * 0.06, (tx, ty) => mix(F.blue, F.blueDk, ty)));
  optic(put, cx, cy + S * 0.01, S * 0.045, F.blueDk, F.blue, F.blueLt);
  // the projected hex shield to the right (semi-transparent look via dither)
  const shx = cx + S * 0.3, shy = cy;
  for (let y = Math.round(shy - S * 0.28); y < shy + S * 0.28; y++) for (let x = Math.round(shx - S * 0.1); x < shx + S * 0.12; x++) {
    const dy = (y - shy) / (S * 0.28), dx = (x - shx) / (S * 0.14);
    if (dx * dx + dy * dy <= 1 && (x + y) % 2 === 0) put(x, y, Math.abs(dx) > 0.7 ? F.cyanLt : F.cyan);
  }
  // hex frame lines
  stroke(put, shx, shy - S * 0.28, shx + S * 0.11, shy, 1.4, () => F.cyanLt);
  stroke(put, shx + S * 0.11, shy, shx, shy + S * 0.28, 1.4, () => F.cyanLt);
}

// 20 · OVERSEER EYE — a floating security sensor; marks and buffs the swarm.
function drawOverseer(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.18);
  // articulated stalk arms/sensors radiating
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const ex = cx + Math.cos(a) * S * 0.28, ey = cy + Math.sin(a) * S * 0.26;
    stroke(put, cx + Math.cos(a) * S * 0.16, cy + Math.sin(a) * S * 0.15, ex, ey, S * 0.022, () => F.steelMd);
    ell(put, ex, ey, S * 0.03, S * 0.03, () => F.gun);
    put(Math.round(ex), Math.round(ey), (a < 3 ? F.red : F.green));
  }
  // armored eyeball housing
  dome(put, cx, cy, S * 0.24, S * 0.22, F.steel, F.chrome, F.steelDk);
  // iris shutter ring
  ell(put, cx, cy, S * 0.16, S * 0.15, () => F.gunDk);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) stroke(put, cx + Math.cos(a) * S * 0.16, cy + Math.sin(a) * S * 0.15, cx + Math.cos(a) * S * 0.1, cy + Math.sin(a) * S * 0.09, 1.6, () => F.steelDk);
  // the glowing purple iris
  optic(put, cx, cy, S * 0.09, F.purple, F.purpleLt, F.white);
  // scanning laser cross
  put(Math.round(cx), Math.round(cy - S * 0.02), F.white);
  // brow plate
  plate(put, cx - S * 0.2, cy - S * 0.24, cx + S * 0.2, cy - S * 0.18, F.hazard, F.brassLt, F.hazardDk);
}

// ========================================================================
const MOBS = [
  { n: 1, name: 'SPARKBOT', role: 'swarm', draw: drawSparkbot },
  { n: 2, name: 'BOLT BEETLE', role: 'rammer', draw: drawBoltBeetle },
  { n: 3, name: 'RIVETER', role: 'aimed turret', draw: drawRiveter },
  { n: 4, name: 'ARC WELDER', role: 'melee arc', draw: drawArcWelder },
  { n: 5, name: 'CONVEYOR CENTIPEDE', role: 'belt-rider', draw: drawCentipede },
  { n: 6, name: 'PISTON RAM', role: 'slam tank', draw: drawPistonRam },
  { n: 7, name: 'SCRAP HULK', role: 'tank', draw: drawScrapHulk },
  { n: 8, name: 'VOLT COIL', role: 'radial turret', draw: drawVoltCoil },
  { n: 9, name: 'HIVE DRONE', role: 'flyer', draw: drawHiveDrone },
  { n: 10, name: 'LASER TRIPOD', role: 'sniper', draw: drawLaserTripod },
  { n: 11, name: 'FORGE HOUND', role: 'fire chaser', draw: drawForgeHound },
  { n: 12, name: 'BUZZSAW UNIT', role: 'dash melee', draw: drawBuzzsaw },
  { n: 13, name: 'MAG-CRANE', role: 'pull/grab', draw: drawMagCrane },
  { n: 14, name: 'COOLANT TANK', role: 'slow field', draw: drawCoolantTank },
  { n: 15, name: 'NANO SWARM', role: 'splitter', draw: drawNanoSwarm },
  { n: 16, name: 'WARFRAME', role: 'heavy burst', draw: drawWarframe },
  { n: 17, name: 'REPAIR UNIT', role: 'healer', draw: drawRepairUnit },
  { n: 18, name: 'PURGE FLAMER', role: 'fire cone', draw: drawPurgeFlamer },
  { n: 19, name: 'BULWARK DRONE', role: 'shield guard', draw: drawBulwark },
  { n: 20, name: 'OVERSEER EYE', role: 'marker/buffer', draw: drawOverseer }
];

async function main() {
  const S = 160, SCALE = 1, CELL = S * SCALE, PAD = 16, LABEL = 34;
  const COLS = 5, ROWS = 4;
  const GW = COLS * (CELL + PAD) + PAD, GH = ROWS * (CELL + LABEL + PAD) + PAD;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 13; grid[i * 4 + 1] = 14; grid[i * 4 + 2] = 22; grid[i * 4 + 3] = 255; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  MOBS.forEach((m, idx) => {
    const cell = Buffer.alloc(S * S * 4); const alpha = Buffer.alloc(S * S);
    const put = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S || !c) return; const [r, g, b] = hex(c); const i = y * S + x; cell[i * 4] = r; cell[i * 4 + 1] = g; cell[i * 4 + 2] = b; cell[i * 4 + 3] = 255; alpha[i] = 255; };
    m.draw(put, S);
    const [or_, og, ob] = hex(F.OUT);
    R.outlinePass(S, S, (x, y) => alpha[y * S + x], (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; });
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const ox = PAD + col * (CELL + PAD), oy = PAD + rowI * (CELL + LABEL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) { const si = ((y / SCALE | 0) * S + (x / SCALE | 0)) * 4; if (cell[si + 3] === 0) continue; const di = ((oy + y) * GW + (ox + x)) * 4; grid[di] = cell[si]; grid[di + 1] = cell[si + 1]; grid[di + 2] = cell[si + 2]; grid[di + 3] = 255; }
  });

  const texts = MOBS.map((m, idx) => {
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const x = PAD + col * (CELL + PAD) + CELL / 2;
    const y = PAD + rowI * (CELL + LABEL + PAD) + CELL + 16;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="15" font-weight="bold" fill="#ffcd45" text-anchor="middle">#${m.n} ${m.name}</text>` +
      `<text x="${x}" y="${y + 15}" font-family="monospace" font-size="11" fill="#8a94a6" text-anchor="middle">${m.role}</text>`;
  }).join('');
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}"><rect x="0" y="0" width="${GW}" height="34" fill="#181a26"/><text x="${GW / 2}" y="23" font-family="monospace" font-size="16" font-weight="bold" fill="#41d6f6" text-anchor="middle">BIOME 4 · ROBOTICS FACTORY — 20 MOB CANDIDATES  (pick 8)</text>${texts}</svg>`);
  const out = process.argv[2] || 'factory_mob_options.png';
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } }).composite([{ input: svg }]).png().toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });
