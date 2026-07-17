// artdev/skyisles/render_sky_decor.js — 20 numbered STORM SKY ISLES
// decoration candidates, one PNG grid.
//   RANGER_PATH=<ranger_art.js> node render_sky_decor.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, cloudBlob, zig, gust } = KIT;

// 1 · ROPE BRIDGE — planked span between islands (tiling segment).
function drawRopeBridge(put, S) {
  const cy = S * 0.55;
  // side ropes
  [-0.16, 0.14].forEach(o => {
    for (let x = S * 0.06; x < S * 0.94; x += 2) {
      const t = (x - S * 0.06) / (S * 0.88);
      const sag = Math.sin(t * Math.PI) * S * 0.05;
      put(Math.round(x), Math.round(cy + o * S + sag - S * 0.14), K.rope);
    }
  });
  // planks
  for (let x = S * 0.08; x < S * 0.9; x += S * 0.085) {
    const t = (x - S * 0.06) / (S * 0.88), sag = Math.sin(t * Math.PI) * S * 0.05;
    plate(put, x, cy - S * 0.1 + sag, x + S * 0.06, cy + S * 0.12 + sag, K.wood, K.woodLt, K.woodDkk);
  }
  // vertical rope ties
  for (let x = S * 0.1; x < S * 0.9; x += S * 0.17) {
    const t = (x - S * 0.06) / (S * 0.88), sag = Math.sin(t * Math.PI) * S * 0.05;
    stroke(put, x, cy - S * 0.3 + sag * 0.4, x, cy - S * 0.1 + sag, 1, () => K.ropeDk);
  }
  // posts at both ends
  [-0.44, 0.42].forEach(o => plate(put, S * 0.5 + o * S, cy - S * 0.32, S * 0.5 + o * S + S * 0.05, cy + S * 0.14, K.woodDk, K.wood, K.woodDkk));
}

// 2 · CLOUD BANK — walk-through cloud tuft (slows you, hides mobs).
function drawCloudBank(put, S) {
  cloudBlob(put, S * 0.5, S * 0.58, S * 0.3, K.cloud, K.cloudLt, K.cloudDk);
  cloudBlob(put, S * 0.26, S * 0.66, S * 0.16, K.cloudLt, '#ffffff', K.cloudMd);
  cloudBlob(put, S * 0.74, S * 0.64, S * 0.14, K.cloudMd, K.cloud, K.cloudDkk);
  [[0.3, 0.44], [0.62, 0.4], [0.5, 0.56]].forEach(([ox, oy]) => put(Math.round(ox * S), Math.round(oy * S), '#ffffff'));
}

// 3 · RUINED COLUMN — broken marble pillar wrapped in static ivy.
function drawRuinedColumn(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  plate(put, cx - S * 0.14, S * 0.78, cx + S * 0.14, S * 0.88, K.marble, K.marbleLt, K.marbleDkk);
  // fluted shaft, broken at an angle
  for (let y = S * 0.3; y < S * 0.78; y++) {
    const topCut = S * 0.3 + (1 - (y - S * 0.3) / (S * 0.48)) * 0; // solid
    row(put, Math.round(y), cx - S * 0.1, cx + S * 0.1, (tx) => {
      const f = Math.sin(tx * Math.PI * 3.2);
      let b = mix(K.marbleLt, K.marble, 0.5 + f * 0.5);
      if (tx > 0.85) b = K.marbleDk;
      return b;
    });
  }
  // jagged broken top
  for (let x = -0.1; x < 0.1; x += 0.02) {
    const h = S * (0.3 - Math.abs(Math.sin(x * 60)) * 0.06);
    for (let y = h; y < S * 0.32; y++) put(Math.round(cx + x * S), Math.round(y), K.marbleDk);
  }
  // fallen chunk beside
  dome(put, cx + S * 0.24, S * 0.84, S * 0.08, S * 0.05, K.marble, K.marbleLt, K.marbleDkk);
  // volt-ivy creeping up
  stroke(put, cx - S * 0.08, S * 0.78, cx - S * 0.02, S * 0.44, 2, () => K.grassDk);
  [[-0.06, 0.66], [-0.04, 0.55], [-0.02, 0.47]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(oy * S), K.voltLt));
}

// 4 · TEMPLE ARCH — half-collapsed gateway of sky-marble.
function drawTempleArch(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // two piers
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.3 - S * 0.07, S * 0.36, cx + s * S * 0.3 + S * 0.07, S * 0.88, K.marble, K.marbleLt, K.marbleDkk));
  // arch spans (left half intact, right half broken)
  for (let a = 0.15; a < Math.PI - 0.15; a += 0.05) {
    const x = cx - Math.cos(a) * S * 0.3, y = S * 0.36 - Math.sin(a) * S * 0.14;
    if (x < cx + S * 0.12)
      ell(put, x, y, S * 0.05, S * 0.05, (tx, ty) => mix(K.marbleLt, K.marbleDk, ty));
  }
  // rune keystone glowing
  plate(put, cx - S * 0.05, S * 0.18, cx + S * 0.05, S * 0.28, K.stone, K.stoneLt, K.stoneDkk);
  put(Math.round(cx), Math.round(S * 0.23), K.voltLt);
  zig(put, cx - S * 0.02, S * 0.2, cx + S * 0.02, S * 0.26, 1, K.volt, K.voltLt);
  // rubble at the broken side
  [[0.16, 0.84], [0.24, 0.86], [0.2, 0.8]].forEach(([ox, oy]) => dome(put, cx + ox * S, oy * S, S * 0.05, S * 0.035, K.marble, K.marbleLt, K.marbleDkk));
}

// 5 · WINDMILL — creaking island mill, sails spinning in the gale.
function drawWindmill(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // tapered tower
  for (let y = S * 0.34; y < S * 0.88; y++) {
    const t = (y - S * 0.34) / (S * 0.54), w = S * (0.1 + t * 0.1);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(K.stoneLt, K.stone, clamp(t * 1.1, 0, 1));
      if (tx < 0.15) b = mix(b, K.marbleLt, 0.4);
      if (tx > 0.85) b = mix(b, K.stoneDkk, 0.5);
      return b;
    });
  }
  // door + window
  dome(put, cx, S * 0.84, S * 0.05, S * 0.07, K.woodDk, K.wood, K.woodDkk);
  ell(put, cx, S * 0.5, S * 0.035, S * 0.04, () => K.skyDkk);
  put(Math.round(cx - 1), Math.round(S * 0.49), K.voltLt);
  // cap
  dome(put, cx, S * 0.32, S * 0.13, S * 0.08, K.red, K.redLt, K.redDk);
  // four sails (X arrangement)
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
    stroke(put, cx, S * 0.32, cx + sx * S * 0.26, S * 0.32 + sy * S * 0.24, S * 0.02, () => K.woodDk);
    // lattice sail cloth
    for (let t = 0.25; t < 1; t += 0.22)
      stroke(put, cx + sx * S * 0.26 * t, S * 0.32 + sy * S * 0.24 * t,
        cx + sx * S * 0.26 * t - sy * S * 0.05, S * 0.32 + sy * S * 0.24 * t + sx * S * 0.05, S * 0.025, () => K.marbleLt);
  });
  bolt(put, cx, S * 0.32, S * 0.025, K.brass, K.brassDk);
}

// 6 · STORM LANTERN — post lamp burning ball-lightning (lights the path).
function drawStormLantern(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  stroke(put, cx, S * 0.3, cx, S * 0.88, S * 0.03, () => K.ironDk);
  plate(put, cx - S * 0.08, S * 0.86, cx + S * 0.08, S * 0.9, K.iron, K.stoneLt, K.ironDkk);
  // curled bracket
  stroke(put, cx, S * 0.3, cx + S * 0.14, S * 0.26, S * 0.02, () => K.ironDk);
  // caged lantern
  const lx = cx + S * 0.16, ly = S * 0.34;
  dome(put, lx, ly, S * 0.08, S * 0.09, K.iron, K.stoneLt, K.ironDkk);
  ell(put, lx, ly, S * 0.055, S * 0.065, (tx, ty) => mix(K.voltLt, K.voltDk, Math.abs(ty - 0.5) * 1.6));
  ell(put, lx, ly, S * 0.025, S * 0.03, () => '#ffffff');
  [-1, 1].forEach(s => stroke(put, lx + s * S * 0.04, ly - S * 0.07, lx + s * S * 0.04, ly + S * 0.07, 1, () => K.ironDkk));
  put(Math.round(lx), Math.round(ly - S * 0.11), K.iron);
  // halo glow ticks
  [[0.1, -0.02], [-0.1, -0.02], [0, 0.12], [0, -0.15]].forEach(([ox, oy]) => put(Math.round(lx + ox * S), Math.round(ly + oy * S), K.voltLt));
}

// 7 · LIGHTNING ROD — copper conductor spike; bolts ground here.
function drawLightningRod(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  // stone anchor block
  plate(put, cx - S * 0.1, S * 0.78, cx + S * 0.1, S * 0.9, K.stone, K.stoneLt, K.stoneDkk);
  // tall copper mast with coil rings
  stroke(put, cx, S * 0.14, cx, S * 0.8, S * 0.028, () => K.copper);
  [0.3, 0.45, 0.6].forEach(yy => ell(put, cx, S * yy, S * 0.045, S * 0.02, (tx, ty) => mix(K.copperLt, K.copperDk, ty)));
  // tip sphere, live
  ell(put, cx, S * 0.12, S * 0.04, S * 0.04, (tx, ty) => mix(K.voltLt, K.copperLt, ty));
  // bolt striking it
  zig(put, cx + S * 0.16, S * 0.0, cx + S * 0.01, S * 0.1, 3, K.volt, K.voltLt);
  // arcs at the base rings
  zig(put, cx - S * 0.05, S * 0.44, cx - S * 0.12, S * 0.52, 1, K.volt, K.voltLt);
}

// 8 · WIND CHIMES — hanging temple chimes, always singing.
function drawWindChimes(put, S) {
  const cx = S * 0.5;
  // wooden frame
  stroke(put, cx - S * 0.24, S * 0.22, cx + S * 0.24, S * 0.22, S * 0.03, () => K.woodDk);
  [-0.24, 0.24].forEach(o => stroke(put, cx + o * S, S * 0.22, cx + o * S, S * 0.34, S * 0.025, () => K.wood));
  // hanging tubes (blown to the side)
  [-0.15, -0.05, 0.05, 0.15].forEach((o, i) => {
    const drift = S * 0.03 * (i - 1.5) * 0.4 + S * 0.04;
    const len = S * (0.26 + (i % 2) * 0.08);
    stroke(put, cx + o * S, S * 0.24, cx + o * S + drift, S * 0.24 + len, 1, () => K.ropeDk);
    plate(put, cx + o * S + drift - S * 0.02, S * 0.24 + len, cx + o * S + drift + S * 0.02, S * 0.24 + len + S * 0.14, K.brass, K.brassLt, K.brassDk);
  });
  // clapper + wind streaks
  ell(put, cx + S * 0.05, S * 0.62, S * 0.03, S * 0.03, () => K.woodLt);
  [0.5, 0.58].forEach(yy => stroke(put, cx + S * 0.24, yy * S, cx + S * 0.38, yy * S - S * 0.02, 1, () => K.wind));
  // note sparks
  [[0.34, 0.36], [0.4, 0.46]].forEach(([ox, oy]) => {
    stroke(put, ox * S, oy * S, ox * S, oy * S - S * 0.04, 1, () => K.marbleLt);
    ell(put, ox * S - S * 0.012, oy * S, S * 0.014, S * 0.011, () => K.marbleLt);
  });
}

// 9 · TATTERED BANNER — storm-worn war banner on a leaning pole.
function drawTatteredBanner(put, S) {
  const cx = S * 0.44;
  shadow(put, S, cx + S * 0.04, S * 0.12);
  // leaning pole
  stroke(put, cx, S * 0.14, cx + S * 0.08, S * 0.88, S * 0.025, () => K.woodDk);
  ell(put, cx, S * 0.12, S * 0.03, S * 0.03, (tx, ty) => mix(K.brassLt, K.brassDk, ty));
  // banner cloth streaming right, torn tails
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3);
    const reach = S * (0.34 - 0.1 * Math.abs(Math.sin(t * 9)) * (t > 0.6 ? 1 : 0.2));
    const wave = Math.sin(t * 6) * S * 0.03;
    row(put, Math.round(S * 0.18 + y), cx + S * 0.02, cx + S * 0.02 + reach + wave, (tx) => {
      let b = mix(K.feather, K.featherDk, clamp(t * 1.2, 0, 1));
      if (tx > 0.85) b = mix(b, K.featherDkk, 0.6);
      return b;
    });
  }
  // emblem: gold bolt
  zig(put, cx + S * 0.12, S * 0.22, cx + S * 0.2, S * 0.4, 2, K.gold, K.goldLt);
}

// 10 · SKY BALLOON — anchored observation balloon bobbing at its rope.
function drawSkyBalloon(put, S) {
  const cx = S * 0.5;
  // envelope
  dome(put, cx, S * 0.3, S * 0.2, S * 0.19, K.red, K.redLt, K.redDk);
  // gores
  [-0.6, -0.2, 0.2, 0.6].forEach(o => {
    for (let y = S * 0.13; y < S * 0.47; y++) {
      const t = (y - S * 0.3) / (S * 0.19);
      const w = Math.sqrt(Math.max(0, 1 - t * t));
      put(Math.round(cx + o * S * 0.2 * w * 2.4), Math.round(y), K.redDk);
    }
  });
  ell(put, cx - S * 0.08, S * 0.22, S * 0.05, S * 0.04, () => K.redLt);
  // netting + basket
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.14, S * 0.44, cx + s * S * 0.05, S * 0.6, 1, () => K.ropeDk));
  plate(put, cx - S * 0.07, S * 0.6, cx + S * 0.07, S * 0.7, K.wood, K.woodLt, K.woodDkk);
  for (let x = -0.06; x < 0.07; x += 0.026) stroke(put, cx + x * S, S * 0.6, cx + x * S, S * 0.7, 1, () => K.woodDk);
  // anchor rope to the ground ring
  stroke(put, cx, S * 0.7, cx - S * 0.06, S * 0.9, 1, () => K.rope);
  ell(put, cx - S * 0.07, S * 0.9, S * 0.03, S * 0.015, () => K.ironDk);
}

// 11 · AIRSHIP WRECK — crashed hull half-buried in the island turf.
function drawAirshipWreck(put, S) {
  const cx = S * 0.5;
  // turf mound it plowed into
  ell(put, cx - S * 0.2, S * 0.82, S * 0.24, S * 0.08, (tx, ty) => mix(K.grassLt, K.grassDkk, ty));
  // tilted hull (bow up)
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const hx = lerp(cx - S * 0.26, cx + S * 0.3, t);
    const hy = lerp(S * 0.74, S * 0.38, t);
    const r = S * (0.13 - t * 0.05);
    ell(put, hx, hy, r, r * 0.72, (tx, ty) => {
      let b = mix(K.wood, K.woodDkk, clamp(ty * 1.25, 0, 1));
      if (ty < 0.25) b = mix(b, K.woodLt, 0.5);
      return b;
    });
  }
  // hull planking lines + brass portholes
  [[0.0, 0.6], [0.12, 0.53], [0.22, 0.47]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, oy * S, S * 0.028, S * 0.028, (tx, ty) => mix(K.brassLt, K.brassDk, ty));
    put(Math.round(cx + ox * S), Math.round(oy * S), K.skyDkk);
  });
  // snapped mast + rigging
  stroke(put, cx - S * 0.1, S * 0.62, cx - S * 0.26, S * 0.3, S * 0.025, () => K.woodDk);
  stroke(put, cx - S * 0.26, S * 0.3, cx - S * 0.05, S * 0.4, 1, () => K.rope);
  // torn sail scrap flapping
  for (let y = 0; y < S * 0.12; y++)
    row(put, Math.round(S * 0.3 + y), cx - S * 0.26, cx - S * 0.26 + S * (0.1 - 0.04 * Math.sin(y * 0.8)), () => (y % 4 < 2 ? K.marbleLt : K.marbleDk));
  // scattered debris
  [[0.3, 0.82], [0.38, 0.86], [-0.38, 0.88]].forEach(([ox, oy]) => dome(put, cx + ox * S, oy * S, S * 0.035, S * 0.02, K.wood, K.woodLt, K.woodDkk));
}

// 12 · SKY DOCK — plank jetty poking off the island edge into open sky.
function drawSkyDock(put, S) {
  // island edge (grass over rock) at the left
  for (let y = S * 0.55; y < S * 0.9; y++)
    row(put, Math.round(y), S * 0.06, S * 0.3 - (y - S * 0.55) * 0.3, (tx) => mix(K.dirt, K.dirtDk, (y - S * 0.55) / (S * 0.35)));
  row(put, Math.round(S * 0.55), S * 0.06, S * 0.3, () => K.grass);
  row(put, Math.round(S * 0.56), S * 0.06, S * 0.3, () => K.grassDk);
  // dock planks reaching right into the void
  for (let x = S * 0.26; x < S * 0.88; x += S * 0.075)
    plate(put, x, S * 0.5, x + S * 0.055, S * 0.6, K.wood, K.woodLt, K.woodDkk);
  // support struts angling under
  [[0.34, 1], [0.54, 1], [0.74, 1]].forEach(([ox]) =>
    stroke(put, ox * S, S * 0.6, ox * S - S * 0.06, S * 0.78, S * 0.02, () => K.woodDk));
  // mooring post + tied rope
  plate(put, S * 0.8, S * 0.42, S * 0.85, S * 0.52, K.woodDk, K.wood, K.woodDkk);
  ell(put, S * 0.825, S * 0.44, S * 0.035, S * 0.02, () => K.rope);
  stroke(put, S * 0.85, S * 0.45, S * 0.94, S * 0.36, 1, () => K.rope);
  // little cloud drifting below the end
  cloudBlob(put, S * 0.72, S * 0.8, S * 0.09, K.cloud, K.cloudLt, K.cloudDk);
}

// 13 · WIND GOD STATUE — weathered idol blowing a gale (landmark).
function drawWindGodStatue(put, S) {
  const cx = S * 0.46;
  shadow(put, S, cx, S * 0.22);
  // plinth
  plate(put, cx - S * 0.16, S * 0.78, cx + S * 0.16, S * 0.9, K.stone, K.stoneLt, K.stoneDkk);
  // seated robed figure
  dome(put, cx, S * 0.62, S * 0.15, S * 0.17, K.marble, K.marbleLt, K.marbleDkk);
  dome(put, cx, S * 0.42, S * 0.1, S * 0.1, K.marble, K.marbleLt, K.marbleDk);
  // carved swirl crown
  for (let a = 0; a < 2.6; a += 0.25) put(Math.round(cx + Math.cos(a + 0.6) * S * 0.11), Math.round(S * 0.38 - Math.sin(a + 0.6) * S * 0.07), K.marbleDk);
  // puffed cheeks + closed eyes
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.41, cx + s * S * 0.02, S * 0.41, 1, () => K.marbleDkk));
  ell(put, cx - S * 0.03, S * 0.45, S * 0.03, S * 0.02, () => K.marbleDk);
  // the carved gale it exhales (spiral ribbon going left)
  for (let t = 0; t < 1; t += 0.03) {
    const gx = cx - S * 0.08 - t * S * 0.32, gy = S * 0.45 + Math.sin(t * 9) * S * 0.05 * (1 - t * 0.4);
    ell(put, gx, gy, S * 0.025 * (1 - t * 0.5), S * 0.02 * (1 - t * 0.5), (tx, ty) => mix(K.wind, K.windDk, ty + t * 0.3));
  }
  // moss + chips
  [[0.1, 0.56], [-0.12, 0.68]].forEach(([ox, oy]) => ell(put, cx + ox * S, oy * S, S * 0.03, S * 0.02, () => K.grassDk));
  put(Math.round(cx + S * 0.08), Math.round(S * 0.4), K.stoneDk);
}

// 14 · STORM CRYSTAL — charged sky-shard cluster, pulsing light.
function drawStormCrystal(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // rock base
  dome(put, cx, S * 0.82, S * 0.16, S * 0.07, K.stone, K.stoneLt, K.stoneDkk);
  // main shard + two satellites
  const shard = (sx, sy, w, h, lean) => {
    for (let y = 0; y < h; y++) {
      const t = y / h, ww = w * (1 - t * 0.85);
      row(put, Math.round(sy - y), sx - ww + lean * t * w, sx + ww + lean * t * w, (tx) => {
        let b = mix(K.voltLt, K.volt, clamp(ty(tx, t), 0, 1));
        if (tx < 0.3) b = mix(b, '#ffffff', 0.45);
        if (tx > 0.8) b = mix(b, K.voltDk, 0.55);
        return b;
      });
    }
    function ty(tx, t) { return t * 0.9 + tx * 0.2; }
  };
  shard(cx - S * 0.1, S * 0.82, S * 0.05, S * 0.28, -0.3);
  shard(cx + S * 0.12, S * 0.82, S * 0.045, S * 0.22, 0.4);
  shard(cx, S * 0.84, S * 0.075, S * 0.44, 0.05);
  // internal facet lines
  stroke(put, cx - S * 0.02, S * 0.8, cx + S * 0.01, S * 0.48, 1, () => K.voltDk);
  // arcing static
  zig(put, cx - S * 0.16, S * 0.5, cx - S * 0.26, S * 0.42, 1, K.volt, K.voltLt);
  zig(put, cx + S * 0.16, S * 0.56, cx + S * 0.26, S * 0.5, 1, K.volt, K.voltLt);
  [[0, 0.34], [0.2, 0.52], [-0.2, 0.6]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(oy * S), '#ffffff'));
}

// 15 · ROC NEST — giant nest of timbers; cracked egg glowing inside.
function drawRocNest(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  shadow(put, S, cx, S * 0.28);
  // woven timber bowl
  ell(put, cx, cy, S * 0.3, S * 0.14, (tx, ty) => mix(K.wood, K.woodDkk, ty));
  ell(put, cx, cy - S * 0.03, S * 0.24, S * 0.09, () => K.woodDkk);
  // crisscross branches on the rim
  for (let i = 0; i < 10; i++) {
    const a = i * 0.63, r1 = S * 0.28, r2 = S * 0.34;
    stroke(put, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.45,
      cx + Math.cos(a + 0.7) * r2, cy + Math.sin(a + 0.7) * r2 * 0.45, S * 0.02, (t) => mix(K.woodLt, K.woodDk, t));
  }
  // the egg — huge, storm-blue speckled, crack glowing
  dome(put, cx, cy - S * 0.12, S * 0.12, S * 0.15, K.feather, K.featherLt, K.featherDk);
  [[-0.05, -0.2], [0.05, -0.12], [-0.02, -0.06], [0.07, -0.22]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.featherDkk));
  zig(put, cx - S * 0.02, cy - S * 0.24, cx + S * 0.03, cy - S * 0.1, 1, K.voltLt, '#ffffff');
  // stray feathers
  [[-0.3, -0.1], [0.32, -0.04]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.06, cy + oy * S - S * 0.05, 2, () => K.featherLt);
  });
}

// 16 · SIGNAL BELL — dock bell tower; rung when storms roll in.
function drawSignalBell(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // frame: two posts + crossbeam + small roof
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.14 - S * 0.025, S * 0.34, cx + s * S * 0.14 + S * 0.025, S * 0.88, K.wood, K.woodLt, K.woodDkk));
  plate(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.36, K.woodDk, K.wood, K.woodDkk);
  // little peaked roof
  for (let y = 0; y < S * 0.1; y++)
    row(put, Math.round(S * 0.2 + y), cx - (S * 0.22) * (y / (S * 0.1)), cx + (S * 0.22) * (y / (S * 0.1)), () => (y % 3 ? K.red : K.redDk));
  // the brass bell
  dome(put, cx, S * 0.5, S * 0.09, S * 0.11, K.brass, K.brassLt, K.brassDk);
  plate(put, cx - S * 0.1, S * 0.58, cx + S * 0.1, S * 0.62, K.brassDk, K.brass, K.brassDk);
  stroke(put, cx, S * 0.36, cx, S * 0.4, 2, () => K.ironDk);
  // clapper + swing lines
  ell(put, cx + S * 0.03, S * 0.66, S * 0.025, S * 0.025, () => K.ironDk);
  [[-0.16, 0.5], [-0.19, 0.56]].forEach(([ox, oy]) => stroke(put, cx + ox * S, oy * S, cx + ox * S - S * 0.05, oy * S, 1, () => K.wind));
  // pull rope
  stroke(put, cx + S * 0.06, S * 0.62, cx + S * 0.1, S * 0.84, 1, () => K.rope);
}

// 17 · SUPPLY DROP — crates + barrel lashed under a torn parachute.
function drawSupplyDrop(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // collapsed parachute draped behind
  dome(put, cx + S * 0.14, S * 0.62, S * 0.18, S * 0.1, K.marbleLt, '#ffffff', K.marbleDk);
  for (let o = -0.12; o <= 0.12; o += 0.08) stroke(put, cx + S * 0.14 + o * S, S * 0.66, cx + S * 0.05, S * 0.78, 1, () => K.ropeDk);
  // big crate
  plate(put, cx - S * 0.22, S * 0.6, cx + S * 0.04, S * 0.86, K.wood, K.woodLt, K.woodDkk);
  stroke(put, cx - S * 0.22, S * 0.6, cx + S * 0.04, S * 0.86, S * 0.02, () => K.woodDk);
  stroke(put, cx + S * 0.04, S * 0.6, cx - S * 0.22, S * 0.86, S * 0.02, () => K.woodDk);
  // small crate on top
  plate(put, cx - S * 0.14, S * 0.48, cx + S * 0.0, S * 0.6, K.woodLt, K.marbleLt, K.woodDk);
  // barrel
  for (let y = S * 0.64; y < S * 0.86; y++) {
    const t = (y - S * 0.64) / (S * 0.22);
    const w = S * (0.09 + Math.sin(t * Math.PI) * 0.02);
    row(put, Math.round(y), cx + S * 0.1 - w + S * 0.1, cx + S * 0.1 + w + S * 0.1, (tx) => mix(K.woodLt, K.woodDkk, clamp(t + Math.abs(tx - 0.5), 0, 1)));
  }
  [0.68, 0.8].forEach(yy => row(put, Math.round(S * yy), cx + S * 0.12, cx + S * 0.28, () => K.ironDk));
}

// 18 · FLOATING SHARD — small rock chunk hovering + orbiting pebbles.
function drawFloatingShard(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // hover glow beneath
  ell(put, cx, cy + S * 0.26, S * 0.14, S * 0.04, () => K.skyDkk);
  ell(put, cx, cy + S * 0.24, S * 0.1, S * 0.03, () => K.skyDk);
  // inverted teardrop rock
  for (let y = -0.16; y < 0.2; y += 0.01) {
    const t = (y + 0.16) / 0.36;
    const w = S * 0.2 * Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.62);
    row(put, Math.round(cy + y * S), cx - w, cx + w, (tx) => {
      let b = mix(K.stoneLt, K.stoneDk, clamp(t * 1.3, 0, 1));
      if (tx < 0.2 && t < 0.4) b = mix(b, K.marbleLt, 0.4);
      return b;
    });
  }
  // grass + tiny tree on top
  ell(put, cx, cy - S * 0.16, S * 0.19, S * 0.05, (tx, ty) => mix(K.grassLt, K.grassDk, ty));
  stroke(put, cx + S * 0.05, cy - S * 0.18, cx + S * 0.05, cy - S * 0.28, 2, () => K.woodDk);
  dome(put, cx + S * 0.05, cy - S * 0.32, S * 0.06, S * 0.05, K.grass, K.grassLt, K.grassDkk);
  // dangling roots
  [-0.06, 0.02, 0.08].forEach(o => stroke(put, cx + o * S, cy + S * 0.16, cx + o * S + S * 0.02, cy + S * 0.24, 1, () => K.dirtDk));
  // orbiting pebbles
  [[-0.3, 0.0], [0.3, -0.06], [0.24, 0.16]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.025, S * 0.02, K.stone, K.stoneLt, K.stoneDkk));
}

// 19 · SKY SHRINE — small altar w/ offering + kneeling cushion.
function drawSkyShrine(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // stepped base
  plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.2, S * 0.86, K.stone, K.stoneLt, K.stoneDkk);
  plate(put, cx - S * 0.14, S * 0.7, cx + S * 0.14, S * 0.78, K.stoneLt, K.marbleLt, K.stoneDk);
  // altar slab
  plate(put, cx - S * 0.11, S * 0.52, cx + S * 0.11, S * 0.7, K.marble, K.marbleLt, K.marbleDkk);
  // carved bolt rune, glowing
  zig(put, cx - S * 0.02, S * 0.56, cx + S * 0.02, S * 0.66, 2, K.volt, K.voltLt);
  // offering bowl with sparks rising
  ell(put, cx, S * 0.5, S * 0.06, S * 0.03, (tx, ty) => mix(K.brassLt, K.brassDk, ty));
  [[0, -0.06], [0.03, -0.1], [-0.03, -0.13]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(S * 0.5 + oy * S), K.voltLt));
  // mini torii-like top bar on posts
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.16, S * 0.36, cx + s * S * 0.16, S * 0.52, S * 0.025, () => K.red));
  plate(put, cx - S * 0.22, S * 0.32, cx + S * 0.22, S * 0.37, K.red, K.redLt, K.redDk);
  // prayer ribbons blowing
  [-0.1, 0.06].forEach(o => {
    for (let y = 0; y < S * 0.08; y++)
      put(Math.round(cx + o * S + Math.sin(y * 0.6) * 2 + S * 0.02), Math.round(S * 0.38 + y), K.marbleLt);
  });
}

// 20 · OBSERVATORY SCOPE — brass telescope aimed at the storm wall.
function drawObservatory(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // tripod
  [[-0.16, 1], [0.0, 1], [0.16, 1]].forEach(([o]) =>
    stroke(put, cx, S * 0.6, cx + o * S * 1.4, S * 0.88, S * 0.025, () => K.ironDk));
  bolt(put, cx, S * 0.58, S * 0.035, K.iron, K.ironDkk);
  // main tube angled up-right
  const x0 = cx - S * 0.18, y0 = S * 0.68, x1 = cx + S * 0.24, y1 = S * 0.3;
  stroke(put, x0, y0, x1, y1, S * 0.07, (t) => mix(K.brassLt, K.brassDk, 0.2 + t * 0.5));
  stroke(put, x0, y0, x1, y1, S * 0.03, (t) => mix(K.brass, K.brassLt, t));
  // eyepiece + lens end
  ell(put, x0 - S * 0.01, y0 + S * 0.01, S * 0.035, S * 0.035, (tx, ty) => mix(K.ironDk, K.ironDkk, ty));
  ell(put, x1, y1, S * 0.045, S * 0.045, (tx, ty) => mix(K.skyLt, K.skyDkk, ty));
  put(Math.round(x1 - 1), Math.round(y1 - 1), '#ffffff');
  // focus knobs
  [0.35, 0.55].forEach(t => bolt(put, lerp(x0, x1, t), lerp(y0, y1, t) + S * 0.05, S * 0.02, K.copper, K.copperDk));
  // star glints it watches
  [[0.36, 0.12], [0.42, 0.2], [0.3, 0.08]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(oy * S), K.voltLt));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'ROPE BRIDGE', role: 'island connector', draw: drawRopeBridge },
  { n: 2, name: 'CLOUD BANK', role: 'soft cover', draw: drawCloudBank },
  { n: 3, name: 'RUINED COLUMN', role: 'ruins', draw: drawRuinedColumn },
  { n: 4, name: 'TEMPLE ARCH', role: 'gateway ruins', draw: drawTempleArch },
  { n: 5, name: 'WINDMILL', role: 'landmark (animated)', draw: drawWindmill },
  { n: 6, name: 'STORM LANTERN', role: 'path light', draw: drawStormLantern },
  { n: 7, name: 'LIGHTNING ROD', role: 'bolt magnet', draw: drawLightningRod },
  { n: 8, name: 'WIND CHIMES', role: 'ambience', draw: drawWindChimes },
  { n: 9, name: 'TATTERED BANNER', role: 'flavor', draw: drawTatteredBanner },
  { n: 10, name: 'SKY BALLOON', role: 'landmark (bobs)', draw: drawSkyBalloon },
  { n: 11, name: 'AIRSHIP WRECK', role: 'big set piece', draw: drawAirshipWreck },
  { n: 12, name: 'SKY DOCK', role: 'island edge', draw: drawSkyDock },
  { n: 13, name: 'WIND GOD STATUE', role: 'landmark', draw: drawWindGodStatue },
  { n: 14, name: 'STORM CRYSTAL', role: 'glowing decor', draw: drawStormCrystal },
  { n: 15, name: 'ROC NEST', role: 'boss foreshadow', draw: drawRocNest },
  { n: 16, name: 'SIGNAL BELL', role: 'storm warning', draw: drawSignalBell },
  { n: 17, name: 'SUPPLY DROP', role: 'clutter set', draw: drawSupplyDrop },
  { n: 18, name: 'FLOATING SHARD', role: 'hovering rock', draw: drawFloatingShard },
  { n: 19, name: 'SKY SHRINE', role: 'shrine', draw: drawSkyShrine },
  { n: 20, name: 'OBSERVATORY', role: 'flavor prop', draw: drawObservatory },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'sky_decor_options.png',
  title: 'STORM SKY ISLES — DECOR CANDIDATES (pick any, tell me numbers to cut/change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
