// artdev/render_factory_decor.js — 20 numbered ROBOTICS-FACTORY DECOR candidates
// for the planned scene (note 5/6). Uses the shared factory kit.
'use strict';
const K = require('./factory_kit.js');
const { F, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, tread, vent, shadow, renderSheet } = K;

// 1 · CONVEYOR BELT — the map's signature; a straight running belt segment.
function drawConveyor(put, S) {
  const y0 = S * 0.4, y1 = S * 0.66;
  shadow(put, S, S * 0.5, S * 0.36, S * 0.78);
  plate(put, S * 0.08, y1, S * 0.92, y1 + S * 0.06, F.steelDk, F.steel, F.steelDkk); // frame
  // rollers
  for (let x = S * 0.12; x < S * 0.9; x += S * 0.12) ell(put, x, y1 - S * 0.01, S * 0.05, S * 0.05, (tx, ty) => mix(F.steel, F.steelDkk, ty));
  // belt surface with directional chevrons
  plate(put, S * 0.08, y0, S * 0.92, y1, F.rubber, F.rubberLt, F.rubberDk);
  for (let x = S * 0.12; x < S * 0.86; x += S * 0.1) for (let k = -3; k <= 3; k++) put(Math.round(x + Math.abs(k) * 2), Math.round((y0 + y1) / 2 + k * 3), F.hazard);
  // legs
  [-1, 1].forEach(s => plate(put, S * 0.5 + s * S * 0.34, y1 + S * 0.06, S * 0.5 + s * S * 0.34 + S * 0.03, S * 0.86, F.steelMd, F.steel, F.steelDk));
  // arrow badge showing run direction
  ell(put, S * 0.5, y0 - S * 0.05, S * 0.05, S * 0.05, () => F.hazardDk);
  [0, 1, 2].forEach(k => put(Math.round(S * 0.5 + k * 2 - 2), Math.round(y0 - S * 0.05), F.hazard));
}

// 2 · CONVEYOR CORNER — an L-bend in the belt.
function drawConveyorCorner(put, S) {
  shadow(put, S, S * 0.5, S * 0.3, S * 0.8);
  plate(put, S * 0.12, S * 0.4, S * 0.6, S * 0.6, F.rubber, F.rubberLt, F.rubberDk);
  plate(put, S * 0.4, S * 0.4, S * 0.6, S * 0.86, F.rubber, F.rubberLt, F.rubberDk);
  // curved chevrons
  for (let k = 0; k < 6; k++) put(Math.round(S * (0.2 + k * 0.06)), Math.round(S * 0.5), F.hazard);
  for (let k = 0; k < 6; k++) put(Math.round(S * 0.5), Math.round(S * (0.5 + k * 0.06)), F.hazard);
  ell(put, S * 0.5, S * 0.5, S * 0.08, S * 0.08, (tx, ty) => mix(F.steel, F.steelDkk, ty));
  bolt(put, S * 0.5, S * 0.5, S * 0.03, F.steelLt, F.steelDk);
}

// 3 · ASSEMBLY ARM — a robotic welding arm bolted to a base.
function drawAssemblyArm(put, S) {
  const bx = S * 0.5;
  shadow(put, S, bx, S * 0.16, S * 0.9);
  plate(put, bx - S * 0.14, S * 0.78, bx + S * 0.14, S * 0.9, F.gun, F.steel, F.gunDk); // base
  [-0.08, 0.08].forEach(o => bolt(put, bx + o * S, S * 0.87, S * 0.02, F.steelLt, F.steelDk));
  // pivot
  ell(put, bx, S * 0.76, S * 0.07, S * 0.07, (tx, ty) => mix(F.steel, F.steelDk, ty));
  // segment 1 up
  stroke(put, bx, S * 0.74, bx - S * 0.1, S * 0.46, S * 0.05, () => F.hazard);
  ell(put, bx - S * 0.1, S * 0.46, S * 0.05, S * 0.05, (tx, ty) => mix(F.steel, F.steelDk, ty));
  // segment 2 reaching
  stroke(put, bx - S * 0.1, S * 0.46, bx + S * 0.22, S * 0.34, S * 0.045, () => F.steelMd);
  // welder head + arc
  ell(put, bx + S * 0.24, S * 0.33, S * 0.04, S * 0.04, () => F.gun);
  [[0.28, 0.36], [0.32, 0.3], [0.3, 0.42]].forEach(p => put(Math.round(bx + p[0] * S), Math.round(S * p[1]), F.cyanLt));
  // cable
  stroke(put, bx + S * 0.02, S * 0.72, bx - S * 0.06, S * 0.5, 1.6, () => F.oil);
}

// 4 · CONTROL CONSOLE — a terminal with a glowing screen.
function drawConsole(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2, S * 0.9);
  plate(put, cx - S * 0.24, S * 0.36, cx + S * 0.24, S * 0.86, F.steelMd, F.steel, F.steelDkk);
  // slanted screen
  plate(put, cx - S * 0.19, S * 0.4, cx + S * 0.19, S * 0.58, F.glass, F.glassLt, F.oil);
  for (let y = S * 0.42; y < S * 0.56; y += 3) row(put, Math.round(y), cx - S * 0.17, cx + S * 0.15, () => F.cyan); // scanlines
  put(Math.round(cx - S * 0.1), Math.round(S * 0.46), F.green); put(Math.round(cx + S * 0.08), Math.round(S * 0.5), F.red);
  // button panel
  hazard(put, cx - S * 0.2, S * 0.78, cx + S * 0.2, S * 0.82, F.hazard, F.hazardDk);
  [-0.12, -0.04, 0.04, 0.12].forEach((o, i) => ell(put, cx + o * S, S * 0.66, S * 0.02, S * 0.02, () => [F.red, F.green, F.cyan, F.hazard][i]));
  for (let x = cx - S * 0.16; x < cx + S * 0.16; x += S * 0.04) plate(put, x, S * 0.71, x + S * 0.025, S * 0.74, F.steelLt, F.chrome, F.steel);
}

// 5 · SERVER RACK — cabinet of blinking electronics.
function drawServerRack(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16, S * 0.9);
  plate(put, cx - S * 0.16, S * 0.16, cx + S * 0.16, S * 0.88, F.gunDk, F.gun, F.oil);
  for (let y = S * 0.2; y < S * 0.84; y += S * 0.08) {
    plate(put, cx - S * 0.13, y, cx + S * 0.13, y + S * 0.055, F.iron, F.steelMd, F.ironDk);
    // blinky LEDs
    for (let k = 0; k < 5; k++) put(Math.round(cx - S * 0.1 + k * S * 0.05), Math.round(y + S * 0.02), [F.green, F.green, F.red, F.cyan, F.green][k]);
    row(put, Math.round(y + S * 0.04), cx - S * 0.11, cx - S * 0.02, () => F.gunDk); // vent slot
  }
}

// 6 · CRATE STACK — shipping crates on a pallet.
function drawCrates(put, S) {
  shadow(put, S, S * 0.5, S * 0.26, S * 0.92);
  // pallet
  plate(put, S * 0.16, S * 0.84, S * 0.84, S * 0.9, F.copperDk, F.copper, F.rustDk);
  const crate = (x0, y0, x1, y1, rusty) => {
    plate(put, x0, y0, x1, y1, rusty ? F.rust : F.copper, rusty ? F.copperLt : F.brassLt, rusty ? F.rustDk : F.copperDk);
    // frame edges + X brace
    plate(put, x0, y0, x1, y0 + S * 0.02, F.copperDk, F.copper, F.rustDk);
    stroke(put, x0 + S * 0.02, y0 + S * 0.02, x1 - S * 0.02, y1 - S * 0.02, 1.6, () => F.rustDk);
    stroke(put, x1 - S * 0.02, y0 + S * 0.02, x0 + S * 0.02, y1 - S * 0.02, 1.6, () => F.rustDk);
    // stencil dot
    put(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2), F.hazard);
  };
  crate(S * 0.2, S * 0.52, S * 0.5, S * 0.84, false);
  crate(S * 0.5, S * 0.5, S * 0.8, S * 0.84, true);
  crate(S * 0.34, S * 0.26, S * 0.62, S * 0.52, true);
}

// 7 · OIL DRUM — a hazard barrel with a puddle.
function drawDrum(put, S) {
  const cx = S * 0.5;
  ell(put, cx, S * 0.9, S * 0.2, S * 0.05, () => F.oil); // spill puddle
  for (let y = S * 0.34; y < S * 0.86; y++) { const t = (y - S * 0.34) / (S * 0.52); row(put, y, cx - S * 0.16, cx + S * 0.16, (tx) => { let b = mix(F.molten, F.moltenDk, clamp(tx * 1.2, 0, 1)); if (tx < 0.15) b = mix(b, F.moltenLt, 0.5); return b; }); }
  // rings
  [0.42, 0.6, 0.78].forEach(v => row(put, Math.round(S * v), cx - S * 0.16, cx + S * 0.16, () => F.rustDk));
  ell(put, cx, S * 0.34, S * 0.16, S * 0.045, (tx, ty) => mix(F.steel, F.steelDk, ty)); // lid
  // hazard label
  ell(put, cx, S * 0.6, S * 0.06, S * 0.07, () => F.hazard);
  put(Math.round(cx), Math.round(S * 0.6), F.hazardDk);
  [[-0.03, -0.02], [0.03, -0.02], [0, 0.03]].forEach(p => put(Math.round(cx + p[0] * S), Math.round(S * 0.6 + p[1] * S), F.hazardDk));
}

// 8 · STORAGE SHELF — a rack of parts and boxes.
function drawShelf(put, S) {
  shadow(put, S, S * 0.5, S * 0.2, S * 0.9);
  [-1, 1].forEach(s => plate(put, S * 0.5 + s * S * 0.24, S * 0.18, S * 0.5 + s * S * 0.24 + S * 0.03, S * 0.88, F.hazard, F.brassLt, F.hazardDk));
  [0.3, 0.52, 0.74].forEach(v => plate(put, S * 0.24, S * v, S * 0.76, S * v + S * 0.03, F.steelMd, F.steel, F.steelDk));
  // items
  plate(put, S * 0.28, S * 0.2, S * 0.4, S * 0.29, F.copper, F.brassLt, F.copperDk);
  ell(put, S * 0.56, S * 0.25, S * 0.05, S * 0.045, (tx, ty) => mix(F.steel, F.steelDk, ty)); // gear
  plate(put, S * 0.3, S * 0.42, S * 0.44, S * 0.51, F.gun, F.steel, F.gunDk);
  ell(put, S * 0.62, S * 0.47, S * 0.04, S * 0.04, () => F.cyan);
  plate(put, S * 0.5, S * 0.64, S * 0.68, S * 0.73, F.rust, F.copperLt, F.rustDk);
}

// 9 · HYDRAULIC PRESS — a stamping station.
function drawPress(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2, S * 0.92);
  // side columns
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.2, S * 0.2, cx + s * S * 0.2 + s * S * 0.05, S * 0.86, F.steelMd, F.steel, F.steelDkk));
  // top beam
  plate(put, cx - S * 0.25, S * 0.16, cx + S * 0.25, S * 0.26, F.gun, F.steel, F.gunDk);
  hazard(put, cx - S * 0.25, S * 0.16, cx + S * 0.25, S * 0.2, F.hazard, F.hazardDk);
  // hydraulic ram
  plate(put, cx - S * 0.05, S * 0.26, cx + S * 0.05, S * 0.5, F.chromeMd, F.chrome, F.steel);
  // press head (raised)
  plate(put, cx - S * 0.16, S * 0.5, cx + S * 0.16, S * 0.6, F.iron, F.steel, F.ironDk);
  // anvil bed + workpiece glowing
  plate(put, cx - S * 0.2, S * 0.72, cx + S * 0.2, S * 0.86, F.steelDk, F.steelMd, F.steelDkk);
  ell(put, cx, S * 0.71, S * 0.06, S * 0.02, () => F.molten);
}

// 10 · COOLING FAN — a big industrial vent fan.
function drawFan(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18, S * 0.9);
  plate(put, cx - S * 0.3, cy - S * 0.3, cx + S * 0.3, cy + S * 0.3, F.gunDk, F.gun, F.oil); // housing
  [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach(p => bolt(put, cx + p[0] * S, cy + p[1] * S, S * 0.022, F.steelLt, F.steelDk));
  ell(put, cx, cy, S * 0.26, S * 0.26, () => F.steelDkk); // recess
  // blades
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    stroke(put, cx, cy, cx + Math.cos(a) * S * 0.24, cy + Math.sin(a) * S * 0.24, S * 0.07, (t) => mix(F.steel, F.steelDk, t));
    stroke(put, cx + Math.cos(a) * S * 0.24, cy + Math.sin(a) * S * 0.24, cx + Math.cos(a + 0.5) * S * 0.24, cy + Math.sin(a + 0.5) * S * 0.24, 1.4, () => F.steelDkk);
  }
  ell(put, cx, cy, S * 0.07, S * 0.07, (tx, ty) => mix(F.chrome, F.steel, ty)); // hub
  // grille bars
  for (let x = cx - S * 0.24; x < cx + S * 0.24; x += S * 0.06) stroke(put, x, cy - S * 0.24, x, cy + S * 0.24, 1, () => F.gunDk);
}

// 11 · CRANE HOOK — overhead chain hoist and hook.
function drawCraneHook(put, S) {
  const cx = S * 0.5;
  // top rail
  plate(put, S * 0.1, S * 0.08, S * 0.9, S * 0.16, F.steelMd, F.steel, F.steelDkk);
  hazard(put, S * 0.1, S * 0.12, S * 0.9, S * 0.16, F.hazard, F.hazardDk);
  // trolley
  plate(put, cx - S * 0.09, S * 0.16, cx + S * 0.09, S * 0.26, F.gun, F.steel, F.gunDk);
  // chain
  for (let y = S * 0.26; y < S * 0.62; y += S * 0.035) ell(put, cx, y, S * 0.018, S * 0.024, () => (Math.round(y / (S * 0.035)) % 2 ? F.steelLt : F.steelDk));
  // hook block
  plate(put, cx - S * 0.06, S * 0.6, cx + S * 0.06, S * 0.7, F.hazard, F.brassLt, F.hazardDk);
  // the hook
  stroke(put, cx, S * 0.7, cx, S * 0.8, S * 0.03, () => F.chromeMd);
  for (let a = -0.2; a < Math.PI; a += 0.3) put(Math.round(cx + Math.sin(a) * S * 0.06), Math.round(S * 0.82 + (1 - Math.cos(a)) * S * 0.05), F.chrome);
}

// 12 · PIPE CLUSTER — wall pipes with valves and a leak.
function drawPipes(put, S) {
  // three vertical pipes
  [[0.3, F.copper, F.copperLt, F.copperDk], [0.5, F.steel, F.chrome, F.steelDk], [0.7, F.brass, F.brassLt, F.brassDk]].forEach(p => {
    for (let y = S * 0.1; y < S * 0.9; y++) row(put, y, S * p[0] - S * 0.05, S * p[0] + S * 0.05, (tx) => { let b = mix(p[2], p[1], clamp(tx * 1.3, 0, 1)); b = mix(b, p[3], clamp((tx - 0.6) * 1.3, 0, 1)); return b; });
    // flange bands
    [0.3, 0.62].forEach(v => plate(put, S * p[0] - S * 0.06, S * v, S * p[0] + S * 0.06, S * v + S * 0.03, F.gunDk, F.gun, F.oil));
  });
  // valve wheel on the middle pipe
  ell(put, S * 0.5, S * 0.46, S * 0.08, S * 0.08, () => F.redDk);
  ell(put, S * 0.5, S * 0.46, S * 0.05, S * 0.05, () => F.gunDk);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) stroke(put, S * 0.5, S * 0.46, S * 0.5 + Math.cos(a) * S * 0.08, S * 0.46 + Math.sin(a) * S * 0.08, 1.4, () => F.red);
  // steam leak
  [[0.74, 0.4], [0.78, 0.34], [0.76, 0.46]].forEach(pt => ell(put, S * pt[0], S * pt[1], S * 0.03, S * 0.02, () => F.chromeMd));
}

// 13 · SMELTER VAT — a crucible of molten metal.
function drawSmelter(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24, S * 0.92);
  // molten glow halo
  ell(put, cx, S * 0.42, S * 0.24, S * 0.12, () => F.moltenDk);
  // crucible body
  for (let y = S * 0.44; y < S * 0.84; y++) { const t = (y - S * 0.44) / (S * 0.4); const hw = lerp(S * 0.26, S * 0.16, t); row(put, y, cx - hw, cx + hw, (tx) => { let b = mix(F.iron, F.ironDk, clamp(tx * 1.2, 0, 1)); if (tx < 0.15) b = mix(b, F.steel, 0.4); return b; }); }
  // rivet band
  for (let k = -3; k <= 3; k++) bolt(put, cx + k * S * 0.07, S * 0.5, S * 0.015, F.steelLt, F.steelDk);
  // molten surface
  ell(put, cx, S * 0.44, S * 0.24, S * 0.06, (tx, ty) => mix(F.moltenLt, F.molten, ty));
  ell(put, cx, S * 0.44, S * 0.12, S * 0.03, () => F.white);
  // trunnion pivots
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.26, S * 0.56, S * 0.04, S * 0.04, (tx, ty) => mix(F.steel, F.steelDk, ty)));
  // rising heat mote
  put(Math.round(cx), Math.round(S * 0.32), F.moltenLt);
}

// 14 · WORKBENCH — a tool table with scattered tools.
function drawBench(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24, S * 0.92);
  plate(put, S * 0.16, S * 0.5, S * 0.84, S * 0.58, F.copperDk, F.copper, F.rustDk); // top
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.28, S * 0.58, cx + s * S * 0.28 + s * S * 0.04, S * 0.88, F.steelMd, F.steel, F.steelDk));
  // pegboard behind
  plate(put, S * 0.2, S * 0.2, S * 0.8, S * 0.5, F.gunDk, F.gun, F.oil);
  for (let y = S * 0.24; y < S * 0.48; y += S * 0.05) for (let x = S * 0.24; x < S * 0.78; x += S * 0.05) put(Math.round(x), Math.round(y), F.steelDkk);
  // hanging tools: wrench + hammer
  stroke(put, S * 0.32, S * 0.24, S * 0.32, S * 0.42, S * 0.02, () => F.chromeMd);
  ell(put, S * 0.32, S * 0.24, S * 0.03, S * 0.03, () => F.steel);
  stroke(put, S * 0.5, S * 0.24, S * 0.5, S * 0.4, S * 0.02, () => F.copperDk);
  plate(put, S * 0.46, S * 0.22, S * 0.56, S * 0.27, F.steel, F.chrome, F.steelDk);
  // vice on the bench
  plate(put, S * 0.62, S * 0.46, S * 0.72, S * 0.5, F.gun, F.steel, F.gunDk);
  // bolts on top
  [[0.4, 0.53], [0.55, 0.54]].forEach(p => put(Math.round(S * p[0]), Math.round(S * p[1]), F.brass));
}

// 15 · CHARGING DOCK — an empty robot cradle/pod.
function drawDock(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22, S * 0.92);
  // back plate
  plate(put, cx - S * 0.22, S * 0.2, cx + S * 0.22, S * 0.84, F.steelDk, F.steelMd, F.steelDkk);
  // energy ring recess
  ell(put, cx, S * 0.48, S * 0.16, S * 0.22, () => F.gunDk);
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) put(Math.round(cx + Math.cos(a) * S * 0.15), Math.round(S * 0.48 + Math.sin(a) * S * 0.2), F.cyan);
  optic(put, cx, S * 0.48, S * 0.06, F.cyanDk, F.cyan, F.cyanLt);
  // clamp arms
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.2, S * 0.36, cx + s * S * 0.1, S * 0.4, S * 0.03, () => F.hazard); stroke(put, cx + s * S * 0.2, S * 0.6, cx + s * S * 0.1, S * 0.56, S * 0.03, () => F.hazard); });
  // base with hazard
  plate(put, cx - S * 0.24, S * 0.84, cx + S * 0.24, S * 0.9, F.steelMd, F.steel, F.steelDk);
  hazard(put, cx - S * 0.24, S * 0.86, cx + S * 0.24, S * 0.9, F.hazard, F.hazardDk);
}

// 16 · HAZARD PYLON — a warning sign on a post + floor cone.
function drawPylon(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.14, S * 0.9);
  // safety cone
  for (let y = S * 0.6; y < S * 0.86; y++) { const t = (y - S * 0.6) / (S * 0.26); const hw = lerp(S * 0.03, S * 0.14, t); row(put, y, cx - hw, cx + hw, (tx) => mix(F.molten, F.moltenDk, tx)); }
  row(put, Math.round(S * 0.72), cx - S * 0.09, cx + S * 0.09, () => F.white);
  plate(put, cx - S * 0.16, S * 0.86, cx + S * 0.16, S * 0.9, F.moltenDk, F.molten, F.rustDk); // base
  // sign post
  plate(put, cx - S * 0.015, S * 0.24, cx + S * 0.015, S * 0.6, F.steelMd, F.steel, F.steelDk);
  // triangular warning sign
  for (let i = 0; i < S * 0.18; i++) { const hw = i; row(put, Math.round(S * 0.22 + i), cx - hw * 0.5, cx + hw * 0.5, () => F.hazard); }
  put(Math.round(cx), Math.round(S * 0.3), F.hazardDk); // ! dot
  for (let y = S * 0.32; y < S * 0.37; y++) put(Math.round(cx), Math.round(y), F.hazardDk);
}

// 17 · WELDING STATION — a post with an active arc + spark shower.
function drawWelding(put, S) {
  const cx = S * 0.46;
  shadow(put, S, cx, S * 0.18, S * 0.9);
  plate(put, cx - S * 0.12, S * 0.5, cx + S * 0.12, S * 0.86, F.gun, F.steel, F.gunDk); // welder box
  vent(put, cx - S * 0.09, cx + S * 0.09, S * 0.6, 5);
  put(Math.round(cx - S * 0.06), Math.round(S * 0.55), F.green); put(Math.round(cx + S * 0.04), Math.round(S * 0.55), F.red);
  // gas bottle
  for (let y = S * 0.4; y < S * 0.86; y++) row(put, y, cx + S * 0.16, cx + S * 0.24, (tx) => mix(F.red, F.redDk, tx));
  ell(put, cx + S * 0.2, S * 0.4, S * 0.04, S * 0.03, () => F.steel);
  // torch cable + arc
  stroke(put, cx, S * 0.5, cx - S * 0.18, S * 0.34, 1.6, () => F.oil);
  ell(put, cx - S * 0.2, S * 0.33, S * 0.03, S * 0.03, () => F.chromeMd);
  ell(put, cx - S * 0.24, S * 0.3, S * 0.09, S * 0.09, () => F.cyanDk); // arc glow
  ell(put, cx - S * 0.24, S * 0.3, S * 0.04, S * 0.04, () => F.white);
  // spark shower
  for (let k = 0; k < 10; k++) { const px = cx - S * 0.24 + Math.sin(k * 2) * S * 0.12, py = S * 0.3 + (k * S * 0.04); put(Math.round(px), Math.round(py), k % 2 ? F.moltenLt : F.hazard); }
}

// 18 · POWER GENERATOR — a humming core reactor.
function drawGenerator(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22, S * 0.92);
  plate(put, cx - S * 0.24, S * 0.34, cx + S * 0.24, S * 0.86, F.steelMd, F.steel, F.steelDkk);
  [[-0.18, 0.4], [0.18, 0.4], [-0.18, 0.78], [0.18, 0.78]].forEach(p => bolt(put, cx + p[0] * S, S * p[1], S * 0.02, F.steelLt, F.steelDk));
  // glass core window
  ell(put, cx, S * 0.56, S * 0.14, S * 0.16, () => F.gunDk);
  optic(put, cx, S * 0.56, S * 0.09, F.cyanDk, F.cyan, F.cyanLt);
  // energy rings inside
  for (let r = 0.04; r < 0.12; r += 0.03) for (let a = 0; a < Math.PI * 2; a += 0.5) put(Math.round(cx + Math.cos(a) * S * r), Math.round(S * 0.56 + Math.sin(a) * S * r), F.cyanLt);
  // conduit pipes on top
  [-0.14, 0.14].forEach(o => { stroke(put, cx + o * S, S * 0.34, cx + o * S, S * 0.2, S * 0.03, () => F.copper); ell(put, cx + o * S, S * 0.2, S * 0.03, S * 0.02, () => F.copperLt); });
  hazard(put, cx - S * 0.24, S * 0.82, cx + S * 0.24, S * 0.86, F.hazard, F.hazardDk);
}

// 19 · FORKLIFT — an idle utility vehicle.
function drawForklift(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3, S * 0.92);
  // wheels
  [-0.22, 0.14].forEach(o => { ell(put, cx + o * S, S * 0.82, S * 0.09, S * 0.09, (tx, ty) => mix(F.rubberLt, F.rubberDk, ty)); ell(put, cx + o * S, S * 0.82, S * 0.04, S * 0.04, () => F.steel); });
  // body
  plate(put, cx - S * 0.28, S * 0.5, cx + S * 0.16, S * 0.78, F.hazard, F.brassLt, F.hazardDk);
  hazard(put, cx - S * 0.28, S * 0.72, cx + S * 0.16, S * 0.78, F.hazardDk, F.hazard);
  // cab cage + seat
  [-0.24, 0.1].forEach(o => plate(put, cx + o * S, S * 0.22, cx + o * S + S * 0.02, S * 0.5, F.steelDk, F.steel, F.steelDkk));
  plate(put, cx - S * 0.24, S * 0.22, cx + S * 0.12, S * 0.25, F.steelDk, F.steel, F.steelDkk);
  plate(put, cx - S * 0.18, S * 0.44, cx - S * 0.02, S * 0.52, F.gunDk, F.gun, F.oil); // seat
  // mast + forks up front
  plate(put, cx + S * 0.18, S * 0.28, cx + S * 0.22, S * 0.8, F.steelMd, F.steel, F.steelDk);
  plate(put, cx + S * 0.22, S * 0.66, cx + S * 0.4, S * 0.69, F.steelLt, F.chrome, F.steel);
  plate(put, cx + S * 0.36, S * 0.69, cx + S * 0.4, S * 0.8, F.steelLt, F.chrome, F.steel);
}

// 20 · SCRAP HEAP — a pile of spare parts and cast-off metal.
function drawScrapHeap(put, S) {
  shadow(put, S, S * 0.5, S * 0.3, S * 0.9);
  // mound base
  for (let y = S * 0.6; y < S * 0.88; y++) { const t = (y - S * 0.6) / (S * 0.28); const hw = lerp(S * 0.34, S * 0.24, t); row(put, Math.round(y), S * 0.5 - hw, S * 0.5 + hw, (tx) => mix(F.iron, F.ironDk, clamp(tx, 0, 1))); }
  // jumbled parts sticking out
  plate(put, S * 0.24, S * 0.46, S * 0.4, S * 0.62, F.rust, F.copperLt, F.rustDk);
  ell(put, S * 0.58, S * 0.52, S * 0.08, S * 0.08, (tx, ty) => mix(F.steel, F.steelDk, ty)); // stray gear
  ell(put, S * 0.58, S * 0.52, S * 0.03, S * 0.03, () => F.gunDk);
  stroke(put, S * 0.3, S * 0.6, S * 0.44, S * 0.4, S * 0.03, () => F.gun); // pipe
  stroke(put, S * 0.62, S * 0.62, S * 0.74, S * 0.48, S * 0.025, () => F.steelMd); // rod
  plate(put, S * 0.66, S * 0.56, S * 0.78, S * 0.66, F.copper, F.brassLt, F.copperDk);
  // a dead optic staring out
  ell(put, S * 0.44, S * 0.56, S * 0.04, S * 0.04, () => F.redDk);
  put(Math.round(S * 0.44), Math.round(S * 0.56), F.red);
  // rivets/bolts scattered
  for (let k = 0; k < 6; k++) bolt(put, S * (0.34 + k * 0.06), S * (0.72 + (k % 2) * 0.05), S * 0.012, F.steelLt, F.steelDk);
}

const DECOR = [
  { n: 1, name: 'CONVEYOR BELT', role: 'map mechanic', draw: drawConveyor },
  { n: 2, name: 'CONVEYOR CORNER', role: 'belt bend', draw: drawConveyorCorner },
  { n: 3, name: 'ASSEMBLY ARM', role: 'anim prop', draw: drawAssemblyArm },
  { n: 4, name: 'CONTROL CONSOLE', role: 'terminal', draw: drawConsole },
  { n: 5, name: 'SERVER RACK', role: 'electronics', draw: drawServerRack },
  { n: 6, name: 'CRATE STACK', role: 'cover', draw: drawCrates },
  { n: 7, name: 'OIL DRUM', role: 'hazard barrel', draw: drawDrum },
  { n: 8, name: 'STORAGE SHELF', role: 'parts rack', draw: drawShelf },
  { n: 9, name: 'HYDRAULIC PRESS', role: 'anim prop', draw: drawPress },
  { n: 10, name: 'COOLING FAN', role: 'wall/anim', draw: drawFan },
  { n: 11, name: 'CRANE HOOK', role: 'overhead', draw: drawCraneHook },
  { n: 12, name: 'PIPE CLUSTER', role: 'wall pipes', draw: drawPipes },
  { n: 13, name: 'SMELTER VAT', role: 'molten prop', draw: drawSmelter },
  { n: 14, name: 'WORKBENCH', role: 'tool table', draw: drawBench },
  { n: 15, name: 'CHARGING DOCK', role: 'robot cradle', draw: drawDock },
  { n: 16, name: 'HAZARD PYLON', role: 'signage', draw: drawPylon },
  { n: 17, name: 'WELDING STATION', role: 'anim sparks', draw: drawWelding },
  { n: 18, name: 'POWER GENERATOR', role: 'reactor', draw: drawGenerator },
  { n: 19, name: 'FORKLIFT', role: 'vehicle', draw: drawForklift },
  { n: 20, name: 'SCRAP HEAP', role: 'debris', draw: drawScrapHeap }
];

renderSheet({ list: DECOR, out: process.argv[2] || 'factory_decor_options.png', title: 'BIOME 4 · ROBOTICS FACTORY — 20 DECOR CANDIDATES  (planned scene, not scatter)' })
  .catch(e => { console.error(e); process.exit(1); });
