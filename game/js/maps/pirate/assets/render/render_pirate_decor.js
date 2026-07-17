// artdev/pirate/render_pirate_decor.js — 20 numbered PIRATE SHIP decoration
// candidates, one PNG grid. Living ship — no ghost props.
'use strict';
const KIT = require('./pirate_kit.js');
const { P, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, planks, skull } = KIT;

// 1 · SHIP'S WHEEL — the helm station.
function drawWheel(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // pedestal
  plate(put, cx - S * 0.06, cy + S * 0.1, cx + S * 0.06, cy + S * 0.3, P.wood, P.woodLt, P.woodDkk);
  plate(put, cx - S * 0.1, cy + S * 0.28, cx + S * 0.1, cy + S * 0.34, P.woodDk, P.wood, P.woodDkk);
  // wheel rim + spokes + handles
  for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * S * 0.16), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.16), P.woodDk);
  for (let a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * S * 0.14), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.14), P.wood);
  for (let a = 0; a < 6.28; a += 0.785) {
    stroke(put, cx, cy - S * 0.04, cx + Math.cos(a) * S * 0.15, cy - S * 0.04 + Math.sin(a) * S * 0.15, 2, () => P.woodLt);
    stroke(put, cx + Math.cos(a) * S * 0.16, cy - S * 0.04 + Math.sin(a) * S * 0.16, cx + Math.cos(a) * S * 0.22, cy - S * 0.04 + Math.sin(a) * S * 0.22, S * 0.02, () => P.woodDk);
    ell(put, cx + Math.cos(a) * S * 0.23, cy - S * 0.04 + Math.sin(a) * S * 0.23, S * 0.014, S * 0.014, (tx, ty) => mix(P.woodLt, P.woodDkk, ty));
  }
  bolt(put, cx, cy - S * 0.04, S * 0.03, P.brass, P.brassDk);
}

// 2 · MAINMAST — mast base w/ boom cleats + furled sail.
function drawMainmast(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // mast
  for (let y = S * 0.06; y < S * 0.88; y++) row(put, Math.round(y), cx - S * 0.035, cx + S * 0.035, (tx) => mix(P.woodLt, P.woodDk, Math.abs(tx - 0.5) * 1.6 + (y / S) * 0.2));
  // iron bands
  [0.24, 0.5, 0.74].forEach(yy => row(put, Math.round(S * yy), cx - S * 0.04, cx + S * 0.04, () => P.ironDk));
  // furled sail bundle on the yard
  stroke(put, cx - S * 0.3, S * 0.16, cx + S * 0.3, S * 0.16, S * 0.02, () => P.woodDk);
  for (let x = -0.28; x < 0.3; x += 0.02) {
    const sag = Math.abs(Math.sin(x * 12)) * S * 0.02;
    stroke(put, cx + x * S, S * 0.17, cx + x * S, S * 0.22 + sag, 2, () => mix(P.sail, P.sailDk, Math.abs(Math.sin(x * 9))));
  }
  [-0.2, 0, 0.2].forEach(o => stroke(put, cx + o * S, S * 0.17, cx + o * S, S * 0.23, 1, () => P.woodDkk)); // gaskets
  // cleats + coiled halyard
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.6, cx + s * S * 0.09, S * 0.58, 2, () => P.brassDk));
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + S * 0.1 + Math.cos(a) * S * 0.035), Math.round(S * 0.8 + Math.sin(a) * S * 0.025), P.wood);
  // rigging lines up
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.1, cx + s * S * 0.34, S * 0.86, 1, () => P.woodDkk));
}

// 3 · CANNON ROW — two gun-deck cannons at their ports.
function drawCannonRow(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.3);
  [[-0.16, 0], [0.14, 0.04]].forEach(([o, oy]) => {
    const gx = cx + o * S, gy = cy + oy * S;
    // carriage + wheels
    plate(put, gx - S * 0.07, gy + S * 0.02, gx + S * 0.09, gy + S * 0.1, P.wood, P.woodLt, P.woodDkk);
    [-0.03, 0.06].forEach(w => { ell(put, gx + w * S, gy + S * 0.12, S * 0.035, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.12 && d <= 0.25 ? P.woodDk : null; }); bolt(put, gx + w * S, gy + S * 0.12, S * 0.01, P.brass, P.brassDk); });
    // barrel angled up-left
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      ell(put, lerp(gx + S * 0.06, gx - S * 0.12, t), lerp(gy + S * 0.0, gy - S * 0.1, t), S * (0.045 - t * 0.008 + (t > 0.88 ? 0.008 : 0)), S * 0.04, (tx, ty) => mix(P.cannon, P.cannonDk, ty));
    }
    ell(put, gx - S * 0.125, gy - S * 0.105, S * 0.022, S * 0.026, () => P.oil);
  });
  // cannonball pyramid
  [[0.0, 0.16], [-0.03, 0.16], [0.03, 0.16], [0.0, 0.13]].forEach(([ox, oy]) => dome(put, cx + ox * S + S * 0.3, cy + oy * S, S * 0.022, S * 0.02, P.iron, P.moon, P.cannonDk));
  // powder bucket
  for (let y = 0; y < S * 0.06; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * 0.34 - (S * 0.028 - y * 0.2), cx - S * 0.34 + (S * 0.028 - y * 0.2), () => mix(P.wood, P.woodDkk, y / (S * 0.06)));
}

// 4 · CARGO HATCH — grated hold opening (something's down there).
function drawCargoHatch(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // deck planks around
  planks(put, cx - S * 0.32, cy - S * 0.24, cx + S * 0.32, cy + S * 0.26, true);
  // hatch coaming
  plate(put, cx - S * 0.2, cy - S * 0.14, cx + S * 0.2, cy + S * 0.16, P.woodDk, P.wood, P.woodDkk);
  // grate
  for (let y = Math.round(cy - S * 0.11); y < cy + S * 0.13; y++) {
    row(put, y, cx - S * 0.17, cx + S * 0.17, (tx) => {
      const gx = (tx * S * 0.34) % (S * 0.045), gy = (y - cy + S * 0.11) % (S * 0.045);
      if (gx < S * 0.02 || gy < S * 0.02) return mix(P.wood, P.woodDk, 0.3);
      return P.oil;
    });
  }
  // eyes peeking from the dark below
  [[-0.06, 0.0], [0.05, 0.04]].forEach(([ox, oy]) => { put(Math.round(cx + ox * S - 2), Math.round(cy + oy * S), P.gold); put(Math.round(cx + ox * S + 2), Math.round(cy + oy * S), P.gold); });
  // rope handles
  [-1, 1].forEach(s => { for (let a = 0; a < 3.14; a += 0.3) put(Math.round(cx + s * S * 0.19 + Math.cos(a) * S * 0.02), Math.round(cy + Math.sin(a) * S * 0.025), P.wood); });
}

// 5 · CROW'S NEST — lookout barrel on the mast top (tall prop).
function drawCrowsNest(put, S) {
  const cx = S * 0.5;
  // mast up to the nest
  for (let y = S * 0.34; y < S * 0.9; y++) row(put, Math.round(y), cx - S * 0.025, cx + S * 0.025, (tx) => mix(P.woodLt, P.woodDk, Math.abs(tx - 0.5) * 1.6));
  // nest barrel
  for (let y = 0; y < S * 0.16; y++) {
    const t = y / (S * 0.16), w = S * (0.11 + Math.sin(t * Math.PI) * 0.01);
    row(put, Math.round(S * 0.2 + y), cx - w, cx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
  }
  [0.23, 0.32].forEach(yy => row(put, Math.round(S * yy), cx - S * 0.115, cx + S * 0.115, () => P.ironDk));
  // lookout's spyglass poking over + hat
  stroke(put, cx + S * 0.06, S * 0.18, cx + S * 0.16, S * 0.14, S * 0.018, () => P.brass);
  dome(put, cx + S * 0.02, S * 0.185, S * 0.035, S * 0.02, P.red, P.redLt, P.redDk);
  // pennant above
  stroke(put, cx, S * 0.06, cx, S * 0.2, 1, () => P.woodDk);
  for (let y = 0; y < S * 0.05; y++) row(put, Math.round(S * 0.07 + y), cx + 1, cx + S * 0.12 - y * 0.8, () => (y < 2 ? P.red : P.redDk));
  // rigging lines down
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.1, S * 0.36, cx + s * S * 0.3, S * 0.9, 1, () => P.woodDkk));
}

// 6 · ROWBOAT — dinghy hung on davits (escape route flavor).
function drawRowboat(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // davit arms + ropes
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.22, cy + S * 0.28, cx + s * S * 0.22, cy - S * 0.2, S * 0.02, () => P.ironDk);
    stroke(put, cx + s * S * 0.22, cy - S * 0.2, cx + s * S * 0.14, cy - S * 0.24, S * 0.018, () => P.ironDk);
    stroke(put, cx + s * S * 0.14, cy - S * 0.24, cx + s * S * 0.13, cy - S * 0.04, 1, () => P.sailDk);
  });
  // hull (side view)
  for (let y = 0; y < S * 0.12; y++) {
    const t = y / (S * 0.12);
    const half = S * (0.2 - t * t * 0.08);
    row(put, Math.round(cy - S * 0.02 + y), cx - half, cx + half, (tx) => {
      let b = mix(P.wood, P.woodDkk, t * 0.6);
      if (Math.abs(tx - 0.5) > 0.44) b = P.woodDk;
      if ((tx * 9 | 0) % 2 === 0 && t < 0.3) b = mix(b, P.woodLt, 0.3);
      return b;
    });
  }
  row(put, Math.round(cy - S * 0.03), cx - S * 0.2, cx + S * 0.2, () => P.woodLt); // gunwale
  // bench seats + oars crossed
  [[-0.08], [0.06]].forEach(([o]) => row(put, Math.round(cy + S * 0.0), cx + o * S - S * 0.035, cx + o * S + S * 0.035, () => P.woodLt));
  stroke(put, cx - S * 0.16, cy - S * 0.1, cx + S * 0.18, cy + S * 0.04, 2, () => P.woodDk);
  stroke(put, cx + S * 0.16, cy - S * 0.1, cx - S * 0.18, cy + S * 0.04, 2, () => P.woodDk);
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.19, cy + S * 0.045, S * 0.025, S * 0.014, (tx, ty) => mix(P.woodLt, P.woodDk, ty)));
}

// 7 · TREASURE CHEST — banded loot chest, lid cracked, glow.
function drawTreasureChest(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.18, cy - S * 0.02, cx + S * 0.18, cy + S * 0.18, P.wood, P.woodLt, P.woodDkk);
  [(-0.12), 0, 0.12].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.18; y++) put(Math.round(cx + o * S), y, P.ironDk); });
  // domed lid ajar w/ gold light
  dome(put, cx, cy - S * 0.08, S * 0.19, S * 0.09, P.woodDk, P.wood, P.woodDkk);
  [(-0.12), 0, 0.12].forEach(o => { for (let a = 0.2; a < 2.9; a += 0.2) put(Math.round(cx + o * S + Math.cos(a) * S * 0.02), Math.round(cy - S * 0.08 - Math.sin(a) * S * 0.07), P.ironDk); });
  row(put, Math.round(cy - S * 0.015), cx - S * 0.17, cx + S * 0.17, () => P.goldLt);
  row(put, Math.round(cy - S * 0.005), cx - S * 0.15, cx + S * 0.15, () => '#fffbe0');
  // spilling coins + a pearl
  [[-0.2, 0.16], [-0.24, 0.2], [0.2, 0.14], [0.24, 0.19], [0.0, 0.2]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.013, (tx, ty) => mix(P.goldLt, P.goldDk, ty)));
  ell(put, cx + S * 0.1, cy + S * 0.22, S * 0.014, S * 0.014, () => '#ffffff');
  // hasp + padlock hanging open
  plate(put, cx - S * 0.02, cy - S * 0.02, cx + S * 0.02, cy + S * 0.05, P.brass, P.brassLt, P.brassDk);
  for (let a = 0; a < 3.14; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.02), Math.round(cy + S * 0.07 - Math.sin(a) * S * 0.02), P.iron);
}

// 8 · RUM BARRELS — stacked kegs, one tapped.
function drawRumBarrels(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  // two standing + one on top on its side
  [[-0.13, 0.02], [0.13, 0.02]].forEach(([o, oy]) => {
    const bx = cx + o * S, by = cy + oy * S;
    for (let y = 0; y < S * 0.24; y++) {
      const t = y / (S * 0.24), w = S * (0.085 + Math.sin(t * Math.PI) * 0.018);
      row(put, Math.round(by - S * 0.06 + y), bx - w, bx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
    }
    [0.0, 0.1].forEach(o2 => row(put, Math.round(by - S * 0.0 + o2 * S), bx - S * 0.095, bx + S * 0.095, () => P.ironDk));
  });
  // sideways barrel on top
  for (let x = -0.11; x < 0.11; x += 0.01) {
    const t = (x + 0.11) / 0.22, h = S * (0.07 + Math.sin(t * Math.PI) * 0.015);
    for (let y = -h; y < h; y++) put(Math.round(cx + x * S), Math.round(cy - S * 0.18 + y), mix(P.woodLt, P.woodDkk, Math.abs(y) / h * 0.7));
  }
  [-0.06, 0.06].forEach(o => { for (let y = -S * 0.075; y < S * 0.075; y++) put(Math.round(cx + o * S), Math.round(cy - S * 0.18 + y), P.ironDk); });
  ell(put, cx - S * 0.115, cy - S * 0.18, S * 0.015, S * 0.06, (tx, ty) => mix(P.woodDk, P.woodDkk, tx));
  // tap + drip + tankard
  stroke(put, cx - S * 0.13, cy + S * 0.06, cx - S * 0.18, cy + S * 0.06, 2, () => P.brassDk);
  stroke(put, cx - S * 0.185, cy + S * 0.07, cx - S * 0.185, cy + S * 0.12, 1, () => '#c89858');
  plate(put, cx - S * 0.22, cy + S * 0.13, cx - S * 0.15, cy + S * 0.2, P.iron, P.moon, P.ironDk);
  // XXX brand
  [['x', -0.11], ['x', -0.13], ['x', -0.15]].forEach(([, o], i) => { stroke(put, cx + (o + 0.24) * S + i * 4, cy + S * 0.02, cx + (o + 0.26) * S + i * 4, cy + S * 0.05, 1, () => P.woodDkk); stroke(put, cx + (o + 0.26) * S + i * 4, cy + S * 0.02, cx + (o + 0.24) * S + i * 4, cy + S * 0.05, 1, () => P.woodDkk); });
}

// 9 · GALLEY STOVE — brick firebox + stew pot (crew mess).
function drawGalleyStove(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.26);
  // brick base
  for (let y = 0; y < S * 0.2; y++) {
    row(put, Math.round(cy + S * 0.04 + y), cx - S * 0.18, cx + S * 0.18, (tx) => {
      const bh = 6, off = (Math.floor(y / bh) % 2) * 10;
      let b = mix('#8a4a3a', '#5c2c22', ((y / bh | 0) * 13 % 7) / 7 * 0.5);
      if (y % bh < 1 || ((tx * S * 0.36 + off) % 20) < 1.4) b = '#3a1c16';
      return b;
    });
  }
  // fire mouth
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1);
    let w = S * 0.07; if (t < 0.4) { const a2 = t / 0.4; w = S * 0.07 * Math.sqrt(a2 * (2 - a2)); }
    row(put, Math.round(cy + S * 0.1 + y), cx - w, cx + w, () => mix(P.oil, '#2a0e08', t));
  }
  ell(put, cx, cy + S * 0.17, S * 0.045, S * 0.02, (tx, ty) => mix('#ffb84a', '#c2571a', ty));
  put(Math.round(cx), Math.round(cy + S * 0.155), '#fff0b0');
  // pot on top + steam
  ell(put, cx, cy + S * 0.03, S * 0.13, S * 0.04, (tx, ty) => mix(P.iron, P.cannonDk, ty));
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * (0.11 + Math.sin(t * Math.PI) * 0.012);
    row(put, Math.round(cy - S * 0.07 + y), cx - w, cx + w, (tx) => mix(P.iron, P.cannonDk, t * 0.5 + Math.abs(tx - 0.5) * 0.5));
  }
  ell(put, cx, cy - S * 0.07, S * 0.1, S * 0.03, (tx, ty) => mix('#7a5c3a', '#57402c', ty)); // stew
  [[0.02, -0.14], [-0.04, -0.2], [0.05, -0.26]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.014, () => P.sailDk));
  // ladle + hanging fish
  stroke(put, cx + S * 0.1, cy - S * 0.09, cx + S * 0.17, cy - S * 0.18, 2, () => P.woodDk);
  stroke(put, cx - S * 0.22, cy - S * 0.22, cx - S * 0.22, cy - S * 0.1, 1, () => P.sailDk);
  ell(put, cx - S * 0.22, cy - S * 0.06, S * 0.025, S * 0.045, (tx, ty) => mix('#7a92aa', '#46586e', ty));
}

// 10 · CHART TABLE — captain's maps, compass, dagger pinning the X.
function drawChartTable(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.26);
  plate(put, cx - S * 0.24, cy - S * 0.06, cx + S * 0.24, cy + S * 0.1, P.woodDk, P.wood, P.woodDkk);
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.18 - S * 0.02, cy + S * 0.1, cx + s * S * 0.18 + S * 0.02, cy + S * 0.26, P.woodDk, P.wood, P.woodDkk));
  // chart
  plate(put, cx - S * 0.18, cy - S * 0.12, cx + S * 0.14, cy + S * 0.04, P.sail, '#f4efdf', P.sailDk);
  // coastline + route + X
  for (let t = 0; t < 1; t += 0.06) put(Math.round(cx - S * 0.14 + t * S * 0.2), Math.round(cy - S * 0.06 + Math.sin(t * 7) * S * 0.02), P.seaLt);
  for (let t = 0; t < 1; t += 0.12) put(Math.round(cx - S * 0.1 + t * S * 0.18), Math.round(cy - S * 0.02 + Math.sin(t * 4) * S * 0.012), P.redDk);
  stroke(put, cx + S * 0.07, cy - S * 0.045, cx + S * 0.1, cy - S * 0.015, 1, () => P.red);
  stroke(put, cx + S * 0.1, cy - S * 0.045, cx + S * 0.07, cy - S * 0.015, 1, () => P.red);
  // rolled charts + compass + dagger
  for (let x = 0; x < S * 0.1; x++) put(Math.round(cx + S * 0.16 + x * 0.4), Math.round(cy - S * 0.1 + x * 0.1), P.sailDk);
  ell(put, cx + S * 0.18, cy + S * 0.0, S * 0.028, S * 0.028, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
  put(Math.round(cx + S * 0.18), Math.round(cy - S * 0.005), P.redDk);
  stroke(put, cx + S * 0.085, cy - S * 0.03, cx + S * 0.085, cy - S * 0.09, 1, () => P.moonLt);
  ell(put, cx + S * 0.085, cy - S * 0.1, S * 0.012, S * 0.01, () => P.brassDk);
  // candle
  stroke(put, cx - S * 0.2, cy - S * 0.12, cx - S * 0.2, cy - S * 0.06, S * 0.014, () => P.bone);
  ell(put, cx - S * 0.2, cy - S * 0.145, S * 0.014, S * 0.02, (tx, ty) => mix('#ffe08a', '#c2571a', ty));
}

// 11 · SHIP RAIL — carved railing segment w/ ratline shrouds.
function drawShipRail(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // rail top + balusters
  plate(put, cx - S * 0.32, cy - S * 0.08, cx + S * 0.32, cy - S * 0.02, P.woodLt, P.woodLt, P.woodDk);
  for (let x = -0.28; x <= 0.28; x += 0.08) {
    for (let y = 0; y < S * 0.16; y++) {
      const t = y / (S * 0.16), w = S * (0.014 + Math.sin(t * Math.PI) * 0.008);
      row(put, Math.round(cy - S * 0.02 + y), cx + x * S - w, cx + x * S + w, (tx) => mix(P.wood, P.woodDkk, t * 0.4 + Math.abs(tx - 0.5)));
    }
  }
  plate(put, cx - S * 0.32, cy + S * 0.14, cx + S * 0.32, cy + S * 0.2, P.wood, P.woodLt, P.woodDkk);
  // ratline shrouds rising off one end
  for (let i = 0; i < 4; i++) stroke(put, cx + S * (0.12 + i * 0.06), cy - S * 0.08, cx + S * (0.2 + i * 0.03), cy - S * 0.34, 1, () => P.woodDkk);
  [0.14, 0.2, 0.26].forEach(yy => stroke(put, cx + S * 0.13, cy - S * (yy - 0.06) - S * 0.08, cx + S * 0.3, cy - S * yy - S * 0.02, 1, () => P.woodDk));
  // life ring on the rail
  for (let a = 0; a < 6.28; a += 0.1) {
    const rx = cx - S * 0.18 + Math.cos(a) * S * 0.055, ry = cy + S * 0.05 + Math.sin(a) * S * 0.055;
    put(Math.round(rx), Math.round(ry), Math.floor(a / 1.57) % 2 ? P.red : P.sail);
    put(Math.round(rx), Math.round(ry) + 1, Math.floor(a / 1.57) % 2 ? P.redDk : P.sailDk);
  }
}

// 12 · FIGUREHEAD — carved maiden at the bow (landmark).
function drawFigurehead(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // bow prow angling down
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const bx = lerp(cx + S * 0.24, cx - S * 0.06, t), by = lerp(cy + S * 0.3, cy - S * 0.1, t);
    ell(put, bx, by, S * (0.1 - t * 0.03), S * 0.05, (tx, ty) => {
      let b = mix(P.wood, P.woodDkk, ty + Math.abs(tx - 0.5) * 0.3);
      if ((t * 8 | 0) % 2 === 0) b = mix(b, P.woodLt, 0.2);
      return b;
    });
  }
  // gold trim line
  for (let t = 0; t < 1; t += 0.05) put(Math.round(lerp(cx + S * 0.26, cx - S * 0.04, t)), Math.round(lerp(cy + S * 0.24, cy - S * 0.08, t)), P.gold);
  // carved maiden leaning forward
  dome(put, cx - S * 0.08, cy - S * 0.16, S * 0.055, S * 0.055, P.woodLt, '#d8bb90', P.woodDk); // painted face
  dome(put, cx - S * 0.05, cy - S * 0.22, S * 0.06, S * 0.035, P.gold, P.goldLt, P.goldDk); // gilded hair
  for (let i = 0; i < 3; i++) stroke(put, cx - S * 0.01 + i * 2, cy - S * 0.2, cx + S * 0.05 + i * 3, cy - S * 0.1 + i * 2, 2, () => P.goldDk);
  // flowing carved gown into the prow
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    stroke(put, cx - S * 0.08 + t * S * 0.06, cy - S * 0.1 + t * S * 0.06, cx - S * 0.02 + t * S * 0.1, cy + S * 0.06 + t * S * 0.08, S * 0.025, (tt) => mix(P.woodLt, P.woodDk, tt));
  }
  // arms swept back
  stroke(put, cx - S * 0.1, cy - S * 0.1, cx - S * 0.02, cy - S * 0.02, S * 0.02, () => P.woodLt);
  put(Math.round(cx - S * 0.095), Math.round(cy - S * 0.165), P.oil); // eye
  // spray at the prow base
  [[0.3, 0.32], [0.34, 0.28]].forEach(([ox, oy]) => put(Math.round(cx + ox * S - S * 0.05), Math.round(cy + oy * S), P.moonLt));
}

// 13 · CAPSTAN — winch drum w/ anchor chain + bars.
function drawCapstan(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.24);
  // drum
  for (let y = 0; y < S * 0.2; y++) {
    const t = y / (S * 0.2), w = S * (0.11 - Math.sin(t * Math.PI) * 0.02);
    row(put, Math.round(cy - S * 0.08 + y), cx - w, cx + w, (tx) => mix(P.woodLt, P.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.6));
  }
  ell(put, cx, cy - S * 0.09, S * 0.11, S * 0.035, (tx, ty) => mix(P.woodLt, P.woodDk, ty));
  // push bars
  [[-1, -0.02], [1, 0.02]].forEach(([s, oy]) => {
    stroke(put, cx + s * S * 0.1, cy - S * 0.06, cx + s * S * 0.32, cy - S * 0.06 + oy * S * 3, S * 0.022, () => P.wood);
    ell(put, cx + s * S * 0.33, cy - S * 0.06 + oy * S * 3, S * 0.016, S * 0.016, (tx, ty) => mix(P.woodLt, P.woodDk, ty));
  });
  // chain wrapped + running to the hawse
  for (let a = 0; a < 9.4; a += 0.35) {
    const rr = S * 0.115, yy = cy - S * 0.02 + (a / 9.4) * S * 0.1;
    put(Math.round(cx + Math.cos(a) * rr), Math.round(yy), (a * 3 | 0) % 2 ? P.iron : P.ironDk);
  }
  for (let t = 0; t < 1; t += 0.07) {
    ell(put, cx + S * 0.12 + t * S * 0.2, cy + S * 0.12 + t * S * 0.08, S * 0.014, S * 0.018, () => ((t * 12 | 0) % 2 ? P.iron : P.ironDk));
  }
  // small anchor resting at the chain end
  stroke(put, cx + S * 0.32, cy + S * 0.14, cx + S * 0.32, cy + S * 0.26, S * 0.016, () => P.iron);
  for (let a = 0.4; a < 2.8; a += 0.2) put(Math.round(cx + S * 0.32 + Math.cos(a) * S * 0.045), Math.round(cy + S * 0.28 + Math.sin(a) * S * 0.03 - S * 0.02), P.iron);
  dome(put, cx + S * 0.32, cy + S * 0.13, S * 0.018, S * 0.014, P.iron, P.moon, P.ironDk);
}

// 14 · RIGGING WALL — ratline net section (climbable flavor).
function drawRiggingWall(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // two shroud lines converging up
  stroke(put, cx - S * 0.26, cy + S * 0.34, cx - S * 0.08, cy - S * 0.36, S * 0.014, () => P.woodDk);
  stroke(put, cx + S * 0.26, cy + S * 0.34, cx + S * 0.08, cy - S * 0.36, S * 0.014, () => P.woodDk);
  stroke(put, cx - S * 0.14, cy + S * 0.34, cx - S * 0.02, cy - S * 0.36, 1, () => P.woodDk);
  stroke(put, cx + S * 0.14, cy + S * 0.34, cx + S * 0.02, cy - S * 0.36, 1, () => P.woodDk);
  // ratline rungs
  for (let t = 0.06; t < 0.95; t += 0.09) {
    const y = cy + S * 0.34 - t * S * 0.7;
    const halfW = S * (0.26 - t * 0.18);
    stroke(put, cx - halfW, y, cx + halfW, y, 1, () => P.wood);
  }
  // deadeyes at the base
  [-0.26, -0.14, 0.14, 0.26].forEach(o => {
    ell(put, cx + o * S, cy + S * 0.36, S * 0.022, S * 0.022, (tx, ty) => mix(P.woodLt, P.woodDkk, ty));
    [[-1, 0], [1, 0], [0, 1]].forEach(([kx, ky]) => put(Math.round(cx + o * S + kx * 2), Math.round(cy + S * 0.36 + ky * 2), P.oil));
  });
  // climbing rat + hung boot flavor
  ell(put, cx + S * 0.06, cy - S * 0.06, S * 0.03, S * 0.018, (tx, ty) => mix('#6e6684', '#2c2638', ty));
  stroke(put, cx + S * 0.09, cy - S * 0.055, cx + S * 0.13, cy - S * 0.05, 1, () => '#8a8498');
  stroke(put, cx - S * 0.1, cy + S * 0.1, cx - S * 0.1, cy + S * 0.16, 1, () => P.sailDk);
  ell(put, cx - S * 0.1, cy + S * 0.185, S * 0.022, S * 0.028, (tx, ty) => mix(P.woodDk, P.oil, ty));
}

// 15 · DECK LANTERN — brass ship lantern on a hook post (path light).
function drawDeckLantern(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.12);
  stroke(put, cx, S * 0.3, cx, S * 0.84, S * 0.022, () => P.woodDk);
  plate(put, cx - S * 0.07, S * 0.82, cx + S * 0.07, S * 0.88, P.wood, P.woodLt, P.woodDkk);
  stroke(put, cx, S * 0.3, cx + S * 0.12, S * 0.26, S * 0.016, () => P.woodDk);
  // hanging brass lantern
  const lx = cx + S * 0.14, ly = S * 0.36;
  stroke(put, lx, S * 0.27, lx, S * 0.3, 1, () => P.brassDk);
  dome(put, lx, ly - S * 0.06, S * 0.045, S * 0.02, P.brass, P.brassLt, P.brassDk);
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * (0.035 + Math.sin(t * Math.PI) * 0.012);
    row(put, Math.round(ly - S * 0.05 + y), lx - w, lx + w, (tx) => {
      if (Math.abs(tx - 0.5) > 0.4) return P.brassDk;
      return mix('#fff0b0', '#ffb84a', t + Math.abs(tx - 0.5));
    });
  }
  put(Math.round(lx), Math.round(ly), '#ffffff');
  dome(put, lx, ly + S * 0.055, S * 0.03, S * 0.014, P.brass, P.brassLt, P.brassDk);
  // warm glow ticks
  [[0.08, -0.04], [-0.07, 0.0], [0.02, 0.1], [0.0, -0.12]].forEach(([ox, oy]) => put(Math.round(lx + ox * S), Math.round(ly + oy * S), '#ffe08a'));
}

// 16 · NETS & CRATES — fishing clutter (cover).
function drawNetsCrates(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.28);
  // crates
  plate(put, cx - S * 0.2, cy - S * 0.04, cx + S * 0.0, cy + S * 0.16, P.wood, P.woodLt, P.woodDkk);
  stroke(put, cx - S * 0.2, cy - S * 0.04, cx + S * 0.0, cy + S * 0.16, 2, () => P.woodDk);
  stroke(put, cx + S * 0.0, cy - S * 0.04, cx - S * 0.2, cy + S * 0.16, 2, () => P.woodDk);
  plate(put, cx - S * 0.12, cy - S * 0.18, cx + S * 0.04, cy - S * 0.04, P.woodLt, P.sail, P.woodDk);
  // draped net over the right crate + floats
  for (let i = 0; i < 6; i++) stroke(put, cx + S * 0.02 + i * S * 0.04, cy - S * 0.1, cx + S * 0.06 + i * S * 0.04, cy + S * 0.18, 1, () => P.woodDk);
  for (let j = 0; j < 5; j++) stroke(put, cx + S * 0.02, cy - S * 0.06 + j * S * 0.05, cx + S * 0.26, cy - S * 0.1 + j * S * 0.055, 1, () => P.woodDk);
  [[0.08, -0.08], [0.2, -0.06]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, (tx, ty) => mix(P.red, P.redDk, ty)));
  // caught fish poking out + starfish
  ell(put, cx + S * 0.14, cy + S * 0.1, S * 0.035, S * 0.02, (tx, ty) => mix('#7a92aa', '#46586e', ty));
  put(Math.round(cx + S * 0.17), Math.round(cy + S * 0.095), P.oil);
  for (let a = 0; a < 6.28; a += 1.256) stroke(put, cx - S * 0.26, cy + S * 0.2, cx - S * 0.26 + Math.cos(a) * S * 0.03, cy + S * 0.2 + Math.sin(a) * S * 0.03, 2, () => P.redLt);
}

// 17 · THE PLANK — walk it (juts off the rail; flavor + drama).
function drawThePlank(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // rail section
  plate(put, cx - S * 0.34, cy - S * 0.04, cx - S * 0.06, cy + S * 0.02, P.woodLt, P.woodLt, P.woodDk);
  for (let x = -0.3; x <= -0.1; x += 0.08) {
    for (let y = 0; y < S * 0.12; y++) put(Math.round(cx + x * S), Math.round(cy + S * 0.02 + y), P.wood);
  }
  plate(put, cx - S * 0.34, cy + S * 0.14, cx - S * 0.06, cy + S * 0.2, P.wood, P.woodLt, P.woodDkk);
  // the plank jutting out over the void
  for (let x = 0; x < S * 0.36; x++) {
    const t = x / (S * 0.36);
    row(put, Math.round(cy - S * 0.01 + Math.sin(t * 2) * S * 0.012), cx - S * 0.06 + x, cx - S * 0.05 + x, () => mix(P.woodLt, P.woodDk, t * 0.4));
  }
  stroke(put, cx - S * 0.06, cy + S * 0.01, cx + S * 0.3, cy + S * 0.02, 1, () => P.woodDkk);
  // sea + fin below the tip
  for (let y = 0; y < S * 0.1; y++) row(put, Math.round(cy + S * 0.26 + y), cx + S * 0.02, cx + S * 0.42, (tx) => {
    let b = mix(P.seaLt, P.sea, y / (S * 0.1));
    if (Math.sin(tx * 12 + y) > 0.7) b = mix(b, P.moonLt, 0.4);
    return b;
  });
  stroke(put, cx + S * 0.24, cy + S * 0.26, cx + S * 0.28, cy + S * 0.2, S * 0.025, (t) => mix('#5c7288', '#46586e', t));
  // seagull waiting on the plank tip
  dome(put, cx + S * 0.27, cy - S * 0.045, S * 0.025, S * 0.02, '#ffffff', '#ffffff', '#c8ced8');
  put(Math.round(cx + S * 0.24), Math.round(cy - S * 0.05), P.brass);
}

// 18 · TATTERED SAIL — draped canvas + boom (soft cover).
function drawTatteredSail(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // boom spar
  stroke(put, cx - S * 0.34, cy - S * 0.24, cx + S * 0.34, cy - S * 0.28, S * 0.022, () => P.woodDk);
  // draped sail w/ tears
  for (let y = 0; y < S * 0.5; y++) {
    const t = y / (S * 0.5);
    row(put, Math.round(cy - S * 0.26 + y), cx - S * (0.3 - t * 0.06), cx + S * (0.3 - t * 0.1), (tx) => {
      // tears
      if (t > 0.5 && Math.sin(tx * 23 + t * 9) > 0.82) return null;
      if (t > 0.8 && Math.floor(tx * 9) % 2 === 0) return null;
      let b = mix(P.sail, P.sailDk, t * 0.5 + Math.abs(Math.sin(tx * 6)) * 0.25);
      if (Math.abs(tx - 0.3) < 0.02 || Math.abs(tx - 0.7) < 0.02) b = P.sailDkk; // seams
      return b;
    });
  }
  // patched square + stitches
  plate(put, cx - S * 0.06, cy - S * 0.08, cx + S * 0.06, cy + S * 0.02, P.sailDk, P.sail, P.sailDkk);
  [[-0.06, 1], [0.06, 1]].forEach(([o]) => { for (let y = -0.08; y < 0.02; y += 0.025) put(Math.round(cx + o * S), Math.round(cy + y * S), P.woodDkk); });
  // rope ends swinging at the hem
  [[-0.2, 0.24], [0.12, 0.22]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S + S * 0.08, 1, () => P.wood));
}

// 19 · PARROT PERCH — ship's parrot on a stand (it TALKS flavor).
function drawParrotPerch(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.12);
  stroke(put, cx, S * 0.34, cx, S * 0.84, S * 0.02, () => P.woodDk);
  plate(put, cx - S * 0.08, S * 0.82, cx + S * 0.08, S * 0.88, P.wood, P.woodLt, P.woodDkk);
  stroke(put, cx - S * 0.14, S * 0.34, cx + S * 0.14, S * 0.34, S * 0.018, () => P.wood);
  // the parrot
  const px = cx + S * 0.05, py = S * 0.24;
  ell(put, px, py + S * 0.02, S * 0.05, S * 0.07, (tx, ty) => mix(P.red, P.redDk, clamp(ty * 1.2, 0, 1)));
  stroke(put, px + S * 0.02, py + S * 0.06, px + S * 0.05, py + S * 0.16, S * 0.022, (t) => mix(P.seaLt, P.sea, t)); // tail
  ell(put, px - S * 0.01, py - S * 0.045, S * 0.032, S * 0.03, (tx, ty) => mix(P.red, P.redDk, ty)); // head
  ell(put, px - S * 0.03, py - S * 0.045, S * 0.014, S * 0.018, () => '#ffffff'); // cheek
  put(Math.round(px - S * 0.028), Math.round(py - S * 0.05), P.oil);
  stroke(put, px - S * 0.045, py - S * 0.04, px - S * 0.07, py - S * 0.028, S * 0.016, () => P.gold); // beak
  // wing + feet
  ell(put, px + S * 0.012, py + S * 0.01, S * 0.025, S * 0.045, (tx, ty) => mix('#e8b23a', P.redDk, ty)); // wing w/ gold edge
  [-1, 1].forEach(s => stroke(put, px + s * S * 0.012, py + S * 0.08, px + s * S * 0.02, py + S * 0.1, 1, () => P.brassDk));
  // speech squawk
  stroke(put, px - S * 0.1, py - S * 0.12, px - S * 0.14, py - S * 0.16, 1, () => P.sail);
  put(Math.round(px - S * 0.16), Math.round(py - S * 0.18), P.sail);
  // seed cup on the crossbar
  ell(put, cx - S * 0.1, S * 0.325, S * 0.025, S * 0.014, (tx, ty) => mix(P.brassLt, P.brassDk, ty));
}

// 20 · HAMMOCKS — crew quarters corner (two slung hammocks).
function drawHammocks(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // posts
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.3, cy - S * 0.24, cx + s * S * 0.3, cy + S * 0.3, S * 0.022, () => P.woodDk); });
  // two hammocks slung at heights
  [[-0.1, 0.35], [0.08, 0.35]].forEach(([oy], i) => {
    const y0 = cy + oy * S;
    for (let t = 0; t < 1; t += 0.02) {
      const sag = Math.sin(t * Math.PI) * S * 0.08;
      const x = cx - S * 0.3 + t * S * 0.6;
      put(Math.round(x), Math.round(y0 + sag), mix(P.sail, P.sailDk, Math.abs(t - 0.5)));
      put(Math.round(x), Math.round(y0 + sag + 1), P.sailDk);
      if ((t * 20 | 0) % 4 === 0) put(Math.round(x), Math.round(y0 + sag + 2), P.sailDkk);
    }
    // occupant bulge in the lower one
    if (i === 1) {
      ell(put, cx - S * 0.02, y0 + S * 0.06, S * 0.09, S * 0.035, (tx, ty) => mix(P.sailDk, P.sailDkk, ty));
      // snoring Zs
      [[0.1, -0.06], [0.14, -0.1]].forEach(([ox, oy2], k) => {
        stroke(put, cx + ox * S, y0 + oy2 * S, cx + ox * S + S * 0.02, y0 + oy2 * S, 1, () => P.sail);
        stroke(put, cx + ox * S + S * 0.02, y0 + oy2 * S, cx + ox * S, y0 + oy2 * S + S * 0.015, 1, () => P.sail);
        stroke(put, cx + ox * S, y0 + oy2 * S + S * 0.015, cx + ox * S + S * 0.02, y0 + oy2 * S + S * 0.015, 1, () => P.sail);
      });
      // boot hanging out
      ell(put, cx + S * 0.09, y0 + S * 0.08, S * 0.025, S * 0.018, () => P.oil);
    }
  });
  // sea chest under
  plate(put, cx - S * 0.12, cy + S * 0.2, cx + S * 0.08, cy + S * 0.32, P.woodDk, P.wood, P.woodDkk);
  row(put, Math.round(cy + S * 0.25), cx - S * 0.12, cx + S * 0.08, () => P.ironDk);
}

// ========================================================================
const LIST = [
  { n: 1, name: "SHIP'S WHEEL", role: 'helm (landmark)', draw: drawWheel },
  { n: 2, name: 'MAINMAST', role: 'structure', draw: drawMainmast },
  { n: 3, name: 'CANNON ROW', role: 'gun deck', draw: drawCannonRow },
  { n: 4, name: 'CARGO HATCH', role: 'hold grate', draw: drawCargoHatch },
  { n: 5, name: "CROW'S NEST", role: 'tall landmark', draw: drawCrowsNest },
  { n: 6, name: 'ROWBOAT', role: 'davit dinghy', draw: drawRowboat },
  { n: 7, name: 'TREASURE CHEST', role: 'loot prop', draw: drawTreasureChest },
  { n: 8, name: 'RUM BARRELS', role: 'clutter/cover', draw: drawRumBarrels },
  { n: 9, name: 'GALLEY STOVE', role: 'crew mess', draw: drawGalleyStove },
  { n: 10, name: 'CHART TABLE', role: "captain's maps", draw: drawChartTable },
  { n: 11, name: 'SHIP RAIL', role: 'deck edge', draw: drawShipRail },
  { n: 12, name: 'FIGUREHEAD', role: 'bow landmark', draw: drawFigurehead },
  { n: 13, name: 'CAPSTAN', role: 'anchor winch', draw: drawCapstan },
  { n: 14, name: 'RIGGING WALL', role: 'ratline net', draw: drawRiggingWall },
  { n: 15, name: 'DECK LANTERN', role: 'path light', draw: drawDeckLantern },
  { n: 16, name: 'NETS + CRATES', role: 'cover', draw: drawNetsCrates },
  { n: 17, name: 'THE PLANK', role: 'rail drama', draw: drawThePlank },
  { n: 18, name: 'TATTERED SAIL', role: 'soft cover', draw: drawTatteredSail },
  { n: 19, name: 'PARROT PERCH', role: 'flavor', draw: drawParrotPerch },
  { n: 20, name: 'HAMMOCKS', role: 'crew quarters', draw: drawHammocks },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'pirate_decor_options.png',
  title: 'PIRATE SHIP — DECOR CANDIDATES (pick any, tell me numbers to cut/change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
