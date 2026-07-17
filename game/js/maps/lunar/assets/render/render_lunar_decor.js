// artdev/lunar/render_lunar_decor.js — 20 numbered LUNAR STATION decoration
// candidates, one PNG grid.
'use strict';
const KIT = require('./space_kit.js');
const { L, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, visor, hover, panel, chitin, star } = KIT;

// 1 · THE LANDER — descent stage, gold foil + legs (landmark).
function drawLander(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.28);
  // legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy + S * 0.08, cx + s * S * 0.26, cy + S * 0.28, S * 0.02, () => L.steel);
    ell(put, cx + s * S * 0.27, cy + S * 0.3, S * 0.05, S * 0.02, (tx, ty) => mix(L.steelLt, L.steelDk, ty));
  });
  // gold foil base
  for (let y = 0; y < S * 0.14; y++) row(put, Math.round(cy + y), cx - S * 0.18, cx + S * 0.18, (tx) => {
    const crinkle = Math.sin(tx * 22 + y * 3) > 0.2;
    return mix(crinkle ? L.foilLt : L.foil, L.foilDk, y / (S * 0.14) * 0.6);
  });
  // ascent module + hatch + window
  plate(put, cx - S * 0.12, cy - S * 0.18, cx + S * 0.12, cy + S * 0.0, L.hullMd, L.hull, L.hullDkk);
  dome(put, cx, cy - S * 0.2, S * 0.1, S * 0.05, L.hullMd, L.hull, L.hullDk);
  visor(put, cx + S * 0.05, cy - S * 0.1, S * 0.03, S * 0.028);
  plate(put, cx - S * 0.08, cy - S * 0.1, cx - S * 0.01, cy - S * 0.02, L.hullDk, L.hullMd, L.hullDkk);
  // antenna + nozzle
  stroke(put, cx, cy - S * 0.24, cx, cy - S * 0.32, 1, () => L.steel);
  put(Math.round(cx), Math.round(cy - S * 0.33), L.red);
  for (let y = 0; y < S * 0.05; y++) row(put, Math.round(cy + S * 0.14 + y), cx - S * 0.04 - y * 0.5, cx + S * 0.04 + y * 0.5, (tx) => mix(L.steelDk, L.steelDkk, tx));
}

// 2 · LUNAR ROVER — dusty buggy w/ wire wheels.
function drawRover(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  // wire-mesh wheels
  [-0.18, 0.16].forEach(o => {
    const wx = cx + o * S;
    ell(put, wx, cy + S * 0.12, S * 0.08, S * 0.08, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.14 && d <= 0.25 ? L.steelDk : null; });
    for (let a = 0; a < 6.28; a += 0.6) stroke(put, wx, cy + S * 0.12, wx + Math.cos(a) * S * 0.07, cy + S * 0.12 + Math.sin(a) * S * 0.07, 1, () => L.steel);
  });
  // chassis + seat + console
  plate(put, cx - S * 0.24, cy - S * 0.0, cx + S * 0.24, cy + S * 0.06, L.foil, L.foilLt, L.foilDk);
  plate(put, cx - S * 0.1, cy - S * 0.12, cx - S * 0.02, cy - S * 0.0, L.hullMd, L.hull, L.hullDkk); // seat back
  plate(put, cx + S * 0.08, cy - S * 0.08, cx + S * 0.18, cy - S * 0.0, L.steelDk, L.steel, L.steelDkk); // console
  put(Math.round(cx + S * 0.12), Math.round(cy - S * 0.05), L.holo);
  // dish antenna + dusty tracks behind
  stroke(put, cx - S * 0.2, cy - S * 0.0, cx - S * 0.24, cy - S * 0.14, 1, () => L.steel);
  dome(put, cx - S * 0.25, cy - S * 0.16, S * 0.035, S * 0.02, L.hull, '#ffffff', L.hullDk);
  [[-0.34, 0.2], [-0.4, 0.21]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.04, cy + oy * S, 1, () => L.moonDk));
}

// 3 · THE FLAG — planted, stiff-wired, faded.
function drawFlag(put, S) {
  const cx = S * 0.46;
  shadow(put, S, cx + S * 0.06, S * 0.1);
  // regolith mound
  dome(put, cx, S * 0.84, S * 0.08, S * 0.03, L.moon, L.moonLt, L.moonDkk);
  stroke(put, cx, S * 0.24, cx, S * 0.84, S * 0.016, () => L.steelLt);
  stroke(put, cx, S * 0.24, cx + S * 0.24, S * 0.24, S * 0.012, () => L.steel); // stiff top wire
  // faded banner w/ bat... no — game sigil: the game's star emblem
  for (let y = 0; y < S * 0.16; y++) {
    const t = y / (S * 0.16);
    row(put, Math.round(S * 0.25 + y), cx + S * 0.01, cx + S * 0.24 - (t > 0.8 ? (t - 0.8) * S * 0.2 : 0), (tx) => {
      let b = mix(L.hull, L.hullMd, t + tx * 0.2);
      if (Math.floor(t * 5) % 2 === 0 && tx > 0.4) b = mix(L.redLt, L.hullMd, 0.5); // faded stripes
      if (tx < 0.35 && t < 0.5) b = mix(L.visorLt, L.hullMd, 0.4); // faded canton
      return b;
    });
  }
  star(put, Math.round(cx + S * 0.06), Math.round(S * 0.29), '#ffffff');
  // footprints around
  [[0.14, 0.88], [0.22, 0.85], [0.3, 0.88]].forEach(([ox, oy]) => ell(put, S * 0.36 + ox * S, S * oy, S * 0.02, S * 0.01, () => L.moonDkk));
}

// 4 · CRYO PODS — sleeper row; one stands OPEN and dark.
function drawCryoPods(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.3);
  [[-0.24, false], [0.0, true], [0.24, false]].forEach(([o, open]) => {
    const px = cx + o * S;
    // pod shell
    for (let y = 0; y < S * 0.4; y++) {
      const t = y / (S * 0.4);
      const w = S * (0.055 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.035);
      row(put, Math.round(cy - S * 0.2 + y), px - w, px + w, (tx) => mix(L.hull, L.hullDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.6));
    }
    if (open) {
      // open + dark, frost spilling
      for (let y = 0; y < S * 0.28; y++) {
        const t = y / (S * 0.28), w = S * (0.035 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.022);
        row(put, Math.round(cy - S * 0.14 + y), px - w, px + w, () => mix(L.space, L.oil, t));
      }
      ell(put, px, cy + S * 0.22, S * 0.06, S * 0.02, (tx, ty) => mix(L.holoLt, L.hullMd, 0.6));
      put(Math.round(px - 2), Math.round(cy - S * 0.02), L.xeno); // something was here
    } else {
      // frosted window + sleeper silhouette + status light
      visor(put, px, cy - S * 0.05, S * 0.035, S * 0.09, '#12303a', L.holoDk);
      ell(put, px, cy - S * 0.03, S * 0.02, S * 0.05, () => mix(L.visor, L.oil, 0.4));
      put(Math.round(px), Math.round(cy + S * 0.14), L.holo);
    }
  });
}

// 5 · COMMAND CONSOLE — blinking control bank.
function drawConsole(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  // angled console body
  plate(put, cx - S * 0.24, cy - S * 0.04, cx + S * 0.24, cy + S * 0.16, L.hullMd, L.hull, L.hullDkk);
  for (let y = 0; y < S * 0.08; y++) row(put, Math.round(cy - S * 0.12 + y), cx - S * 0.24 + y * 0.4, cx + S * 0.24 - y * 0.4, (tx) => mix(L.steelDk, L.steel, y / (S * 0.08) * 0.5 + Math.abs(tx - 0.5) * 0.2));
  // screens
  plate(put, cx - S * 0.2, cy - S * 0.1, cx - S * 0.04, cy - S * 0.02, L.visor, L.visorLt, L.oil);
  [[-0.18, -0.07], [-0.12, -0.05], [-0.08, -0.08]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S, 1, () => L.holo));
  plate(put, cx + S * 0.04, cy - S * 0.1, cx + S * 0.2, cy - S * 0.02, '#2a1414', L.redDk, L.oil);
  stroke(put, cx + S * 0.06, cy - S * 0.055, cx + S * 0.18, cy - S * 0.055, 1, () => L.red); // flatline!
  // button rows
  for (let r = 0; r < 2; r++) for (let c2 = 0; c2 < 8; c2++)
    put(Math.round(cx - S * 0.17 + c2 * S * 0.05), Math.round(cy + S * 0.04 + r * S * 0.05), [L.holo, L.warn, L.red, L.xeno][((r * 8 + c2) * 7) % 4]);
  // one sparking panel
  [[0.22, 0.0], [0.25, -0.03]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.warnLt));
}

// 6 · HOLO TABLE — projecting the station map.
function drawHoloTable(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.24);
  // pedestal table
  ell(put, cx, cy + S * 0.08, S * 0.18, S * 0.06, (tx, ty) => mix(L.steelLt, L.steelDkk, ty + Math.abs(tx - 0.5) * 0.3));
  plate(put, cx - S * 0.06, cy + S * 0.1, cx + S * 0.06, cy + S * 0.22, L.steelDk, L.steel, L.steelDkk);
  ell(put, cx, cy + S * 0.06, S * 0.14, S * 0.04, () => L.visor);
  // hologram cone
  for (let y = 0; y < S * 0.3; y++) {
    const t = 1 - y / (S * 0.3);
    row(put, Math.round(cy + S * 0.04 - y), cx - S * 0.14 * t - S * 0.02, cx + S * 0.14 * t + S * 0.02, (tx) => {
      if ((tx * 8 + y * 0.5) % 1 < 0.4) return mix(L.holo, L.space, 0.55 + t * 0.15);
      return null;
    });
  }
  // projected station: little modules + a blinking marker
  [[-0.06, -0.14], [0.04, -0.18], [0.0, -0.1]].forEach(([ox, oy]) => plate(put, cx + ox * S - S * 0.02, cy + oy * S - S * 0.015, cx + ox * S + S * 0.02, cy + oy * S + S * 0.015, L.holoLt, '#ffffff', L.holoDk));
  stroke(put, cx - S * 0.06, cy - S * 0.14, cx + S * 0.04, cy - S * 0.18, 1, () => L.holoLt);
  put(Math.round(cx + S * 0.04), Math.round(cy - S * 0.22), L.red);
}

// 7 · CARGO STACK — strapped crates + oxygen barrel.
function drawCargoStack(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.26);
  panel(put, cx - S * 0.22, cy - S * 0.04, cx + S * 0.04, cy + S * 0.2);
  panel(put, cx - S * 0.16, cy - S * 0.22, cx - S * 0.0, cy - S * 0.04);
  // straps
  stroke(put, cx - S * 0.09, cy - S * 0.04, cx - S * 0.09, cy + S * 0.2, 2, () => L.warn);
  stroke(put, cx - S * 0.08, cy - S * 0.22, cx - S * 0.08, cy - S * 0.04, 2, () => L.warnDk);
  // labels
  plate(put, cx - S * 0.2, cy + S * 0.0, cx - S * 0.14, cy + S * 0.04, L.holoDk, L.holo, L.visor);
  // O2 barrel
  for (let y = 0; y < S * 0.22; y++) {
    const t = y / (S * 0.22), w = S * (0.07 + Math.sin(t * Math.PI) * 0.012);
    row(put, Math.round(cy - S * 0.0 + y), cx + S * 0.14 - w + S * 0.02, cx + S * 0.14 + w + S * 0.02, (tx) => mix(L.hull, L.hullDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
  }
  [0.04, 0.16].forEach(yy => row(put, Math.round(cy + yy * S), cx + S * 0.08, cx + S * 0.24, () => L.holoDk));
  stroke(put, cx + S * 0.16, cy - S * 0.04, cx + S * 0.16, cy - S * 0.0, 2, () => L.steelDk);
  // stencil O2
  put(Math.round(cx + S * 0.14), Math.round(cy + S * 0.1), L.visor); put(Math.round(cx + S * 0.18), Math.round(cy + S * 0.1), L.visor);
}

// 8 · O2 RACK — oxygen tanks in a wall rack (some empty = red).
function drawO2Rack(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.24, cy - S * 0.2, cx + S * 0.24, cy + S * 0.24, L.steelDk, L.steel, L.steelDkk);
  [[-0.16, true], [-0.05, true], [0.06, false], [0.17, true]].forEach(([o, full]) => {
    const px = cx + o * S;
    for (let y = 0; y < S * 0.32; y++) {
      const t = y / (S * 0.32), w = S * (0.032 + Math.sin(Math.min(1, t * 1.2) * Math.PI) * 0.012);
      row(put, Math.round(cy - S * 0.14 + y), px - w, px + w, (tx) => mix(full ? L.hull : L.hullDk, full ? L.hullDk : L.steelDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    dome(put, px, cy - S * 0.16, S * 0.018, S * 0.014, L.steel, L.steelLt, L.steelDkk);
    put(Math.round(px), Math.round(cy + S * 0.2), full ? L.holo : L.red);
  });
  // rack straps
  [[-0.02], [0.12]].forEach(([oy]) => row(put, Math.round(cy + oy * S), cx - S * 0.22, cx + S * 0.22, () => L.steelDkk));
}

// 9 · SOLAR ARRAY — tilted panel wing on a mast.
function drawSolarArray(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  stroke(put, cx, cy + S * 0.02, cx, cy + S * 0.32, S * 0.02, () => L.steel);
  plate(put, cx - S * 0.08, cy + S * 0.3, cx + S * 0.08, cy + S * 0.34, L.steelDk, L.steel, L.steelDkk);
  // tilted panel (parallelogram)
  for (let y = 0; y < S * 0.24; y++) {
    const t = y / (S * 0.24), off = t * S * 0.1;
    row(put, Math.round(cy - S * 0.22 + y), cx - S * 0.26 + off, cx + S * 0.2 + off, (tx) => {
      let b = mix('#1c3a6e', '#0e2044', t * 0.4 + Math.abs(tx - 0.5) * 0.2);
      if ((tx * 6) % 1 < 0.08 || (t * 4) % 1 < 0.1) b = L.steelLt; // cell grid
      if (tx > 0.7 && t < 0.3) b = mix(b, '#ffffff', 0.35); // sun glint
      return b;
    });
  }
  // one shattered cell
  [[0.05, -0.12], [0.09, -0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.oil));
  stroke(put, cx + S * 0.03, cy - S * 0.14, cx + S * 0.11, cy - S * 0.07, 1, () => L.oil);
}

// 10 · COMMS DISH — big antenna, still transmitting to no one.
function drawCommsDish(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  // base + strut
  plate(put, cx - S * 0.1, cy + S * 0.2, cx + S * 0.1, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
  stroke(put, cx, cy + S * 0.2, cx - S * 0.06, cy - S * 0.02, S * 0.025, () => L.steel);
  // dish (tilted ellipse bowl)
  ell(put, cx - S * 0.08, cy - S * 0.14, S * 0.2, S * 0.13, (tx, ty) => {
    let b = mix(L.hull, L.hullDk, (1 - ty) * 0.7 + Math.abs(tx - 0.5) * 0.3);
    if (((tx * 7) % 1 < 0.08) || ((ty * 5) % 1 < 0.1)) b = L.hullMd;
    return b;
  });
  // feed horn
  stroke(put, cx - S * 0.08, cy - S * 0.14, cx + S * 0.04, cy - S * 0.26, S * 0.014, () => L.steelDk);
  ell(put, cx + S * 0.05, cy - S * 0.27, S * 0.02, S * 0.02, (tx, ty) => mix(L.warnLt, L.warnDk, ty));
  // signal ripples going out
  [[0.16, -0.34, 0.03], [0.22, -0.4, 0.05], [0.28, -0.46, 0.07]].forEach(([ox, oy, r]) => {
    for (let a = -0.8; a < 0.8; a += 0.3) put(Math.round(cx + ox * S + Math.cos(a) * r * S), Math.round(cy + oy * S + Math.sin(a) * r * S), L.holoDk);
  });
}

// 11 · AIRLOCK — heavy hatch w/ warning ring (decompression door).
function drawAirlock(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // frame
  plate(put, cx - S * 0.26, cy - S * 0.28, cx + S * 0.26, cy + S * 0.3, L.hullMd, L.hull, L.hullDkk);
  // circular hatch
  dome(put, cx, cy, S * 0.18, S * 0.18, L.steel, L.steelLt, L.steelDkk);
  for (let a = 0; a < 6.28; a += 0.785) bolt(put, cx + Math.cos(a) * S * 0.15, cy + Math.sin(a) * S * 0.15, S * 0.014, L.steelLt, L.steelDkk);
  // wheel
  for (let a = 0; a < 6.28; a += 0.1) put(Math.round(cx + Math.cos(a) * S * 0.07), Math.round(cy + Math.sin(a) * S * 0.07), L.warn);
  [0, 1.05, 2.1].forEach(a => stroke(put, cx - Math.cos(a) * S * 0.06, cy - Math.sin(a) * S * 0.06, cx + Math.cos(a) * S * 0.06, cy + Math.sin(a) * S * 0.06, 2, () => L.warnDk));
  // porthole + hazard stripes + status
  visor(put, cx, cy - S * 0.11, S * 0.035, S * 0.03);
  for (let x = -0.24; x < 0.26; x += 0.04) { put(Math.round(cx + x * S), Math.round(cy - S * 0.26), (x * 25 | 0) % 2 ? L.warn : L.oil); put(Math.round(cx + x * S), Math.round(cy + S * 0.28), (x * 25 | 0) % 2 ? L.warn : L.oil); }
  put(Math.round(cx + S * 0.2), Math.round(cy - S * 0.2), L.red);
  put(Math.round(cx - S * 0.2), Math.round(cy - S * 0.2), L.holo);
}

// 12 · ALERT BEACON — rotating emergency light on a pole.
function drawBeacon(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.12);
  stroke(put, cx, S * 0.4, cx, S * 0.84, S * 0.02, () => L.steelDk);
  plate(put, cx - S * 0.07, S * 0.82, cx + S * 0.07, S * 0.86, L.steel, L.steelLt, L.steelDkk);
  // light housing
  plate(put, cx - S * 0.05, S * 0.3, cx + S * 0.05, S * 0.4, L.steelDk, L.steel, L.steelDkk);
  dome(put, cx, S * 0.28, S * 0.05, S * 0.05, L.red, L.redLt, L.redDk);
  put(Math.round(cx - 1), Math.round(S * 0.26), '#ffffff');
  // rotating beam cones
  [-1, 1].forEach(s => {
    for (let t = 0; t < 1; t += 0.14) {
      const w = t * S * 0.05;
      stroke(put, cx + s * (S * 0.05 + t * S * 0.24), S * 0.29 - w, cx + s * (S * 0.05 + t * S * 0.24), S * 0.29 + w, 1, () => (t > 0.6 ? L.redDk : L.red));
    }
  });
  // wall shadow flicker dots
  [[0.34, 0.32], [-0.36, 0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(S * oy), L.redLt));
}

// 13 · HYDROPONICS — grow-bed overtaken by alien vines.
function drawHydroponics(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.26);
  // bed trough + legs
  plate(put, cx - S * 0.26, cy - S * 0.02, cx + S * 0.26, cy + S * 0.1, L.hullMd, L.hull, L.hullDkk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.2, cy + S * 0.1, cx + s * S * 0.2, cy + S * 0.24, S * 0.02, () => L.steelDk));
  // grow light bar
  stroke(put, cx - S * 0.24, cy - S * 0.24, cx + S * 0.24, cy - S * 0.24, S * 0.02, () => L.steelDk);
  for (let x = -0.2; x < 0.22; x += 0.08) put(Math.round(cx + x * S), Math.round(cy - S * 0.22), '#d88aff');
  // healthy crops on one side
  [[-0.2], [-0.12]].forEach(([o]) => {
    stroke(put, cx + o * S, cy - S * 0.02, cx + o * S, cy - S * 0.1, 1, () => '#4a8a3a');
    ell(put, cx + o * S, cy - S * 0.11, S * 0.025, S * 0.02, (tx, ty) => mix('#7ac25a', '#3a6e2c', ty));
  });
  // alien vines strangling the other side
  [[0.02, 0.14], [0.12, 0.1], [0.2, 0.16]].forEach(([o, hgt]) => {
    for (let t = 0; t < 1; t += 0.08) {
      const vx = cx + o * S + Math.sin(t * 9) * S * 0.02, vy = cy - S * 0.02 - t * hgt * S * 2;
      ell(put, vx, vy, S * 0.014, S * 0.012, (tx, ty) => mix(L.void, L.voidDk, ty + t * 0.3));
    }
    ell(put, cx + o * S, cy - S * 0.02 - hgt * S * 2, S * 0.025, S * 0.02, (tx, ty) => mix(L.acid, L.acidDk, ty)); // bulb
  });
  // vine spilling over the trough edge
  stroke(put, cx + S * 0.24, cy + S * 0.04, cx + S * 0.32, cy + S * 0.2, S * 0.018, (t) => mix(L.voidDk, L.void, t));
}

// 14 · HIVE RESIN — alien growth mass swallowing a corner.
function drawHiveResin(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  // resin mound
  chitin(put, cx, cy + S * 0.08, S * 0.26, S * 0.18, '#3a2c50', L.void, L.oil);
  chitin(put, cx - S * 0.12, cy - S * 0.06, S * 0.14, S * 0.12, '#3a2c50', L.void, L.oil);
  // ribbed strands arcing (organic architecture)
  [[-0.2, -0.12, 0.16, -0.26], [0.0, -0.16, 0.26, -0.1]].forEach(([a, b2, c, d]) => {
    for (let t = 0; t < 1; t += 0.07) {
      const px = lerp(cx + a * S, cx + c * S, t), py = lerp(cy + b2 * S, cy + d * S, t) - Math.sin(t * Math.PI) * S * 0.1;
      ell(put, px, py, S * 0.022, S * 0.018, (tx, ty) => mix(L.void, '#2a1c40', ty + (t * 5 % 1) * 0.3));
    }
  });
  // glowing pustules
  [[-0.08, 0.04], [0.1, 0.1], [0.02, -0.04], [0.18, 0.0]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.028, S * 0.024, (tx, ty) => mix(L.acid, L.acidDk, ty));
    put(Math.round(cx + ox * S - 1), Math.round(cy + oy * S - 1), L.xenoLt);
  });
  // a swallowed crate corner poking out
  plate(put, cx + S * 0.16, cy + S * 0.14, cx + S * 0.28, cy + S * 0.22, L.hullDk, L.hullMd, L.hullDkk);
  stroke(put, cx + S * 0.16, cy + S * 0.14, cx + S * 0.1, cy + S * 0.1, S * 0.03, () => '#3a2c50');
}

// 15 · CRASHED PROBE — half-buried satellite, dish snapped.
function drawCrashedProbe(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  // impact regolith spray
  dome(put, cx, cy + S * 0.1, S * 0.28, S * 0.08, L.moon, L.moonLt, L.moonDkk);
  [[-0.3, 0.04], [0.32, 0.06], [-0.2, -0.04]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.moonDk));
  // tilted probe body (buried nose-down)
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const px = lerp(cx - S * 0.06, cx + S * 0.14, t), py = lerp(cy + S * 0.08, cy - S * 0.2, t);
    ell(put, px, py, S * (0.09 - t * 0.02), S * 0.05, (tx, ty) => {
      let b = mix(L.foil, L.foilDk, ty + t * 0.2);
      if (Math.sin(tx * 12 + i) > 0.5) b = mix(b, L.foilLt, 0.4);
      return b;
    });
  }
  // snapped dish lying apart + bent antenna
  ell(put, cx - S * 0.26, cy - S * 0.02, S * 0.09, S * 0.05, (tx, ty) => mix(L.hull, L.hullDk, (1 - ty) * 0.6));
  stroke(put, cx + S * 0.14, cy - S * 0.22, cx + S * 0.22, cy - S * 0.3, 1, () => L.steel);
  stroke(put, cx + S * 0.22, cy - S * 0.3, cx + S * 0.28, cy - S * 0.28, 1, () => L.steelDk);
  // still-blinking light
  put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.14), L.red);
}

// 16 · IMPACT CRATER — rimmed crater (route shaper).
function drawCrater(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // raised rim
  ell(put, cx, cy, S * 0.3, S * 0.15, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    if (d > 0.55 && d <= 1) return mix(L.moonLt, L.moonDk, ty);
    return null;
  });
  // bowl
  ell(put, cx, cy + S * 0.01, S * 0.22, S * 0.1, (tx, ty) => mix(L.moonDk, L.moonDkk, (1 - ty) * 0.4 + 0.3));
  ell(put, cx + S * 0.03, cy + S * 0.03, S * 0.12, S * 0.05, () => L.moonDkk);
  // ejecta rays
  for (let a = 0; a < 6.28; a += 0.55) {
    const rr = S * (0.32 + (a * 7 % 1) * 0.06);
    stroke(put, cx + Math.cos(a) * S * 0.28, cy + Math.sin(a) * S * 0.14, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5, 1, () => L.moonLt);
  }
  // small rock in the bowl
  dome(put, cx - S * 0.05, cy + S * 0.02, S * 0.03, S * 0.02, L.moonDk, L.moon, L.moonDkk);
}

// 17 · MOON ROCKS — boulder cluster (cover).
function drawMoonRocks(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.28);
  [[-0.12, 0.0, 0.16, 0.12], [0.1, 0.04, 0.12, 0.09], [-0.02, -0.12, 0.1, 0.08], [0.22, -0.02, 0.07, 0.05]].forEach(([ox, oy, rx, ry]) => {
    ell(put, cx + ox * S, cy + oy * S, rx * S, ry * S, (tx, ty) => {
      let b = mix(L.moonLt, L.moonDk, clamp(ty * 1.2, 0, 1));
      if (h(tx * 9 + ty * 7 + ox * 20) > 0.8) b = mix(b, L.moonDkk, 0.4);
      if (tx < 0.2 && ty < 0.35) b = mix(b, '#ffffff', 0.3);
      return b;
    });
  });
  function h(n) { const x = Math.sin(n * 127.1) * 43758.5; return x - Math.floor(x); }
  // sparkly mineral vein
  [[-0.14, -0.02], [-0.1, 0.02], [-0.06, 0.05]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), L.holoLt));
}

// 18 · LAB BENCH — samples, scopes, one BROKEN containment jar.
function drawLabBench(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  plate(put, cx - S * 0.26, cy - S * 0.0, cx + S * 0.26, cy + S * 0.08, L.hull, '#ffffff', L.hullDk);
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.2 - S * 0.02, cy + S * 0.08, cx + s * S * 0.2 + S * 0.02, cy + S * 0.24, L.steelDk, L.steel, L.steelDkk));
  // microscope
  stroke(put, cx - S * 0.16, cy - S * 0.0, cx - S * 0.13, cy - S * 0.12, S * 0.02, () => L.steelDk);
  stroke(put, cx - S * 0.13, cy - S * 0.12, cx - S * 0.16, cy - S * 0.16, S * 0.016, () => L.steel);
  ell(put, cx - S * 0.16, cy - S * 0.02, S * 0.035, S * 0.014, () => L.steelDkk);
  // intact jar w/ floating sample
  visor(put, cx + S * 0.0, cy - S * 0.08, S * 0.035, S * 0.06, '#0e3020', L.xenoDk);
  ell(put, cx + S * 0.0, cy - S * 0.07, S * 0.014, S * 0.018, (tx, ty) => mix(L.xeno, L.xenoDkk, ty));
  plate(put, cx - S * 0.025, cy - S * 0.15, cx + S * 0.025, cy - S * 0.13, L.steel, L.steelLt, L.steelDkk);
  // BROKEN jar + escaped trail
  [[0.12, -0.05], [0.16, -0.08], [0.14, -0.02]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S + S * 0.03, 1, () => L.holoLt));
  ell(put, cx + S * 0.14, cy - S * 0.0, S * 0.03, S * 0.01, () => '#1c4030');
  [[0.2, 0.04], [0.26, 0.1], [0.3, 0.18]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.012, S * 0.008, () => L.acidDk));
  // data slate
  plate(put, cx - S * 0.06, cy + S * 0.01, cx + S * 0.02, cy + S * 0.05, L.visor, L.visorLt, L.oil);
  stroke(put, cx - S * 0.05, cy + S * 0.03, cx + S * 0.01, cy + S * 0.03, 1, () => L.holo);
}

// 19 · JUMP PAD — low-grav launcher ring (the mechanic prop!).
function drawJumpPad(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  // pad base
  ell(put, cx, cy, S * 0.22, S * 0.09, (tx, ty) => mix(L.steelLt, L.steelDkk, ty + Math.abs(tx - 0.5) * 0.3));
  ell(put, cx, cy - S * 0.015, S * 0.17, S * 0.06, (tx, ty) => mix(L.visor, L.oil, ty));
  // glowing chevron rings pointing UP
  [[0.0, 0.02], [0.0, -0.06], [0.0, -0.14]].forEach(([ox, oy], i) => {
    const w = S * (0.1 - i * 0.02);
    stroke(put, cx - w, cy + oy * S, cx, cy + oy * S - S * 0.05, S * 0.02, () => (i === 2 ? L.holoLt : L.holo));
    stroke(put, cx, cy + oy * S - S * 0.05, cx + w, cy + oy * S, S * 0.02, () => (i === 2 ? L.holoLt : L.holo));
  });
  // launch column shimmer
  for (let y = 0; y < S * 0.34; y++) {
    if (y % 4 < 2) continue;
    row(put, Math.round(cy - S * 0.2 - y * 0.8), cx - S * 0.08, cx + S * 0.08, (tx) => (Math.abs(tx - 0.5) > 0.42 ? L.holoDk : null));
  }
  // hazard ring
  for (let a = 0; a < 6.28; a += 0.3) put(Math.round(cx + Math.cos(a) * S * 0.24), Math.round(cy + Math.sin(a) * S * 0.1), (a * 5 | 0) % 2 ? L.warn : L.oil);
  star(put, Math.round(cx), Math.round(cy - S * 0.4), L.holoLt);
}

// 20 · REACTOR CORE — glowing fusion column (arena set piece).
function drawReactorCore(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // base housing + top ring
  plate(put, cx - S * 0.16, S * 0.74, cx + S * 0.16, S * 0.86, L.steel, L.steelLt, L.steelDkk);
  plate(put, cx - S * 0.14, S * 0.14, cx + S * 0.14, S * 0.24, L.steel, L.steelLt, L.steelDkk);
  [[-0.1], [0.1]].forEach(([o]) => put(Math.round(cx + o * S), Math.round(S * 0.2), L.red));
  // containment glass column w/ plasma
  for (let y = S * 0.24; y < S * 0.74; y++) {
    const t = (y - S * 0.24) / (S * 0.5);
    row(put, Math.round(y), cx - S * 0.1, cx + S * 0.1, (tx) => {
      const core = Math.abs(tx - 0.5) < 0.18 + Math.sin(t * 14) * 0.06;
      if (core) return mix(L.holoLt, L.holo, Math.abs(Math.sin(t * 9 + tx * 5)));
      let b = mix(L.visorLt, L.visor, Math.abs(tx - 0.5) * 2);
      return mix(b, L.holoDk, 0.3);
    });
  }
  // conduits to the floor
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.14, S * 0.78, cx + s * S * 0.3, S * 0.84, S * 0.025, () => L.steelDk);
    put(Math.round(cx + s * S * 0.3), Math.round(S * 0.85), L.holo);
  });
  // energy sparks
  [[0.16, 0.34], [-0.18, 0.5], [0.14, 0.62]].forEach(([ox, oy]) => star(put, Math.round(cx + ox * S), Math.round(S * oy), L.holoLt));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'THE LANDER', role: 'landmark', draw: drawLander },
  { n: 2, name: 'LUNAR ROVER', role: 'vehicle prop', draw: drawRover },
  { n: 3, name: 'THE FLAG', role: 'flavor', draw: drawFlag },
  { n: 4, name: 'CRYO PODS', role: 'set piece (one open)', draw: drawCryoPods },
  { n: 5, name: 'COMMAND CONSOLE', role: 'station decor', draw: drawConsole },
  { n: 6, name: 'HOLO TABLE', role: 'station decor', draw: drawHoloTable },
  { n: 7, name: 'CARGO STACK', role: 'clutter/cover', draw: drawCargoStack },
  { n: 8, name: 'O2 RACK', role: 'wall decor', draw: drawO2Rack },
  { n: 9, name: 'SOLAR ARRAY', role: 'exterior', draw: drawSolarArray },
  { n: 10, name: 'COMMS DISH', role: 'landmark', draw: drawCommsDish },
  { n: 11, name: 'AIRLOCK', role: 'gate/door', draw: drawAirlock },
  { n: 12, name: 'ALERT BEACON', role: 'light (animated)', draw: drawBeacon },
  { n: 13, name: 'HYDROPONICS', role: 'overgrown lab', draw: drawHydroponics },
  { n: 14, name: 'HIVE RESIN', role: 'alien growth', draw: drawHiveResin },
  { n: 15, name: 'CRASHED PROBE', role: 'exterior set piece', draw: drawCrashedProbe },
  { n: 16, name: 'IMPACT CRATER', role: 'route shaper', draw: drawCrater },
  { n: 17, name: 'MOON ROCKS', role: 'cover', draw: drawMoonRocks },
  { n: 18, name: 'LAB BENCH', role: 'science wing', draw: drawLabBench },
  { n: 19, name: 'JUMP PAD', role: 'LOW-GRAV launcher', draw: drawJumpPad },
  { n: 20, name: 'REACTOR CORE', role: 'arena set piece', draw: drawReactorCore },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'lunar_decor_options.png',
  title: 'LUNAR STATION — DECOR CANDIDATES (pick any, tell me numbers to cut/change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
