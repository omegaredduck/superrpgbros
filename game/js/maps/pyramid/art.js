// ============================================================================
// game/js/maps/pyramid/art.js — PYRAMID PLUNDER (realm 6) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 3 5 7 10 11 12 14,
// NEFERU-KA both forms (render_pyramid_boss_final.js — the canon), ALL 20
// decor, tiles #1 2 3 4 5 7 8 10 (PLAN §3). Same pixel-plotting contract as
// world_art.js; ranger_art primitives. buildInto(ctx) registers through the
// SAME helpers core mobs use.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- tomb palette (egypt_kit.js E, verbatim) -----------------------------
  var E = {
    OUT: '#141014',
    sand: '#d9b17a', sandLt: '#f2d9a8', sandDk: '#a87e4e', sandDkk: '#6e4e2c',
    stone: '#c2996a', stoneLt: '#e8c896', stoneDk: '#8a683f', stoneDkk: '#57401f',
    tomb: '#3a2c28', tombDk: '#241a18', obsidian: '#1c1420',
    gold: '#ffcd45', goldLt: '#fff0b0', goldDk: '#b07d1e', goldDkk: '#6e4a0e',
    lapis: '#2a5fc2', lapisLt: '#6f9ff0', lapisDk: '#173a80',
    turq: '#3ec2b0', turqLt: '#9df0e0', turqDk: '#1f7a6e',
    curse: '#66e8a0', curseLt: '#c8ffe0', curseDk: '#2a9e62',
    purple: '#7a4fd0', purpleLt: '#b894f6', purpleDk: '#48277e',
    red: '#c2452e', redLt: '#f08a64', redDk: '#7e2416',
    wrap: '#e0d4b8', wrapLt: '#f6eeda', wrapDk: '#a89876', wrapDkk: '#6e6248',
    bone: '#e8e0c8', boneDk: '#a89e7e',
    flame: '#ff9a3a', flameLt: '#ffe08a', flameDk: '#c2571a',
    skin: '#c98e5e', skinDk: '#96613a',
    white: '#f4f4f4', oil: '#12100e',
    jackal: '#2c2434', jackalLt: '#4c4058', jackalDk: '#181220'
  };

  // ---- shared shape helpers (factory_kit lineage — ES6 kept, browser-safe) --
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
    ell(put, x, y, r, r, (tx, ty) => mix(c || E.stone, cdk || E.stoneDkk, 0.25 + ty * 0.6));
    put(Math.round(x), Math.round(y), cdk || E.stoneDkk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => E.oil); }
  function wraps(put, cx, cy, rx, ry, tilt) {
    ell(put, cx, cy, rx, ry, (tx, ty) => {
      const band = Math.floor((ty * ry * 2 + tx * rx * (tilt || 0.7)) / 3.2);
      let b = band % 2 ? E.wrap : E.wrapLt;
      b = mix(b, E.wrapDk, clamp(ty * 1.15 - 0.2, 0, 1));
      if (tx > 0.85) b = mix(b, E.wrapDkk, 0.5);
      return b;
    });
  }
  function trim(put, x0, x1, y, h) {
    for (let yy = 0; yy < h; yy++) row(put, y + yy, x0, x1, (tx) => mix(E.goldLt, E.goldDk, yy / h + Math.abs(tx - 0.5) * 0.3));
    for (let x = x0 + 2; x < x1 - 1; x += 4) put(Math.round(x), Math.round(y + h / 2), E.lapis);
  }
  function glyphs(put, x0, y0, x1, y1, c) {
    let n = 0;
    for (let y = y0; y < y1 - 4; y += 6) for (let x = x0 + 1; x < x1 - 4; x += 5) {
      const k = (n++ * 7) % 4;
      if (k === 0) { stroke(put, x, y, x + 3, y, 1, () => c); stroke(put, x + 1, y + 1, x + 1, y + 4, 1, () => c); }
      else if (k === 1) { ell(put, x + 1.5, y + 2, 1.6, 2.2, () => c); }
      else if (k === 2) { stroke(put, x, y + 3, x + 3, y, 1, () => c); }
      else { stroke(put, x, y, x, y + 4, 1, () => c); put(x + 2, y + 1, c); put(x + 2, y + 3, c); }
    }
  }
  function horusEye(put, cx, cy, s, c, cDk) {
    stroke(put, cx - s, cy, cx + s, cy, Math.max(1, s * 0.5), () => cDk);
    ell(put, cx, cy, s * 0.55, s * 0.45, () => c);
    put(Math.round(cx), Math.round(cy), cDk);
    stroke(put, cx + s * 0.4, cy + s * 0.4, cx + s * 0.9, cy + s * 1.1, 1, () => cDk);
    stroke(put, cx - s * 0.3, cy + s * 0.4, cx - s * 0.5, cy + s * 1.2, 1, () => cDk);
  }
  function nemes(put, cx, cy, w, h, c1, c2) {
    for (let y = 0; y < h; y++) {
      const t = y / h, ww = w * (0.75 + t * 0.5);
      row(put, Math.round(cy - h * 0.4 + y), cx - ww, cx + ww, (tx) => {
        const stripe = Math.floor(tx * 9) % 2 === 0;
        return mix(stripe ? c1 : c2, E.oil, clamp(t * 0.35, 0, 1));
      });
    }
  }
  function serpent(put, cx, cy, len, coils, w, colFn) {
    for (let t = 0; t < 1; t += 0.02) {
      const x = cx - len / 2 + t * len;
      const y = cy + Math.sin(t * Math.PI * coils) * w * 1.6;
      ell(put, x, y, w * (0.7 + 0.3 * Math.sin(t * 9)), w * 0.8, (tx, ty) => colFn(t, ty));
    }
  }
  function flame(put, cx, cy, s) {
    ell(put, cx, cy, s * 0.55, s, (tx, ty) => mix(E.flame, E.flameDk, ty));
    ell(put, cx, cy + s * 0.15, s * 0.3, s * 0.55, (tx, ty) => mix(E.flameLt, E.flame, ty));
    put(Math.round(cx), Math.round(cy + s * 0.3), '#ffffff');
  }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (Red's picks #1 3 5 7 10 11 12 14) =========
  function drawScarab(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.16);
    [-1, 1].forEach(s => [[-0.1, 0.12], [0, 0.16], [0.1, 0.12]].forEach(([o, len]) =>
      stroke(put, cx + s * S * 0.12, cy + o * S, cx + s * S * (0.12 + len), cy + o * S + S * 0.1, 2, () => E.obsidian)));
    dome(put, cx, cy, S * 0.18, S * 0.15, E.lapisDk, E.lapis, E.obsidian);
    for (let y = Math.round(cy - S * 0.13); y < cy + S * 0.13; y++) put(Math.round(cx), y, E.gold);
    dome(put, cx, cy - S * 0.15, S * 0.09, S * 0.06, E.obsidian, E.lapisDk, E.oil);
    stroke(put, cx - S * 0.06, cy - S * 0.2, cx + S * 0.06, cy - S * 0.2, 2, () => E.gold);
    ell(put, cx - S * 0.07, cy - S * 0.05, S * 0.04, S * 0.03, () => E.lapisLt);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.04), Math.round(cy - S * 0.16), E.curse));
  }
  function drawKhopeshGuard(put, S) {
    const cx = S * 0.46, cy = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.14, cx + s * S * 0.07, cy + S * 0.3, S * 0.028, () => E.boneDk));
    dome(put, cx, cy + S * 0.02, S * 0.11, S * 0.14, E.bone, E.wrapLt, E.boneDk);
    [0.0, 0.05, 0.1].forEach(o => row(put, Math.round(cy - S * 0.02 + o * S), cx - S * 0.09, cx + S * 0.09, () => E.boneDk));
    trim(put, cx - S * 0.09, cx + S * 0.09, Math.round(cy - S * 0.08), 4);
    dome(put, cx, cy - S * 0.17, S * 0.08, S * 0.08, E.bone, E.wrapLt, E.boneDk);
    nemes(put, cx, cy - S * 0.22, S * 0.06, S * 0.05, E.lapis, E.gold);
    [-1, 1].forEach(s => { ell(put, cx + s * S * 0.035, cy - S * 0.17, S * 0.022, S * 0.026, () => E.oil); put(Math.round(cx + s * S * 0.035), Math.round(cy - S * 0.17), E.curse); });
    for (let y = 0; y < S * 0.2; y++) {
      const t = y / (S * 0.2), w = S * (0.06 - t * 0.02);
      row(put, Math.round(cy - S * 0.06 + y), cx - S * 0.2 - w, cx - S * 0.2 + w, (tx) => mix(E.stoneLt, E.stoneDk, t + Math.abs(tx - 0.5) * 0.4));
    }
    horusEye(put, cx - S * 0.2, cy + S * 0.0, S * 0.025, E.lapisLt, E.lapisDk);
    stroke(put, cx + S * 0.13, cy + S * 0.06, cx + S * 0.2, cy - S * 0.12, S * 0.025, () => E.goldDk);
    for (let a = 0; a < 1.5; a += 0.12) {
      const bx = cx + S * 0.2 + Math.sin(a) * S * 0.12, by = cy - S * 0.12 - (1 - Math.cos(a)) * S * 0.1;
      ell(put, bx, by, S * 0.025, S * 0.02, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.2));
    }
  }
  function drawBroodmother(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(s => [[-0.12, 0.16], [0.02, 0.2], [0.14, 0.16]].forEach(([o, len]) =>
      stroke(put, cx + s * S * 0.16, cy + o * S + S * 0.06, cx + s * S * (0.16 + len), cy + o * S + S * 0.16, 3, () => E.obsidian)));
    dome(put, cx, cy + S * 0.06, S * 0.24, S * 0.2, E.lapisDk, E.lapis, E.obsidian);
    [[-0.1, 0.02], [0.08, 0.06], [-0.02, 0.14], [0.14, -0.02], [-0.16, 0.1]].forEach(([ox, oy]) => {
      ell(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.035, S * 0.03, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
    });
    for (let y = Math.round(cy - S * 0.12); y < cy + S * 0.24; y++) put(Math.round(cx), y, E.goldDk);
    dome(put, cx, cy - S * 0.14, S * 0.11, S * 0.08, E.obsidian, E.lapisDk, E.oil);
    stroke(put, cx - S * 0.08, cy - S * 0.2, cx + S * 0.08, cy - S * 0.2, 2, () => E.gold);
    [-1, 1].forEach(s => optic(put, cx + s * S * 0.045, cy - S * 0.14, S * 0.026, E.curseDk, E.curse, E.curseLt));
    [[-0.2, -0.12], [0.22, -0.08]].forEach(([ox, oy]) => {
      dome(put, cx + ox * S, cy + oy * S, S * 0.035, S * 0.028, E.lapisDk, E.lapis, E.obsidian);
    });
  }
  function drawAnkhPriest(put, S) {
    const cx = S * 0.5, cy = S * 0.48;
    shadow(put, S, cx, S * 0.16);
    for (let y = 0; y < S * 0.32; y++) {
      const t = y / (S * 0.32), w = S * (0.07 + t * 0.11);
      row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
        let b = mix(E.wrapLt, E.wrapDk, clamp(t * 1.1, 0, 1));
        if (tx < 0.15 || tx > 0.85) b = mix(b, E.wrapDkk, 0.5);
        return b;
      });
    }
    trim(put, cx - S * 0.1, cx + S * 0.1, Math.round(cy + S * 0.24), 3);
    stroke(put, cx - S * 0.06, cy - S * 0.02, cx + S * 0.02, cy + S * 0.26, S * 0.025, () => E.red);
    dome(put, cx, cy - S * 0.12, S * 0.08, S * 0.08, E.skin, '#e8b088', E.skinDk);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.05, cy - S * 0.13, cx + s * S * 0.02, cy - S * 0.13, 1, () => E.oil); });
    stroke(put, cx + S * 0.12, cy + S * 0.14, cx + S * 0.2, cy - S * 0.14, S * 0.02, () => E.goldDk);
    const ax = cx + S * 0.21, ay = cy - S * 0.2;
    stroke(put, ax - S * 0.05, ay + S * 0.03, ax + S * 0.05, ay + S * 0.03, S * 0.022, () => E.gold);
    stroke(put, ax, ay + S * 0.03, ax, ay + S * 0.1, S * 0.022, () => E.gold);
    for (let a = 0; a < Math.PI * 2; a += 0.25) put(Math.round(ax + Math.cos(a) * S * 0.035), Math.round(ay - S * 0.015 + Math.sin(a) * S * 0.045), E.goldLt);
    [[0.14, -0.3], [0.28, -0.24], [0.24, -0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.curseLt));
  }
  function drawSandstoneGolem(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.14 - S * 0.05, cy + S * 0.16, cx + s * S * 0.14 + S * 0.05, cy + S * 0.32, E.stone, E.stoneLt, E.stoneDkk));
    plate(put, cx - S * 0.2, cy - S * 0.14, cx + S * 0.2, cy + S * 0.18, E.stone, E.stoneLt, E.stoneDkk);
    glyphs(put, cx - S * 0.17, cy - S * 0.1, cx + S * 0.17, cy + S * 0.14, E.stoneDkk);
    stroke(put, cx - S * 0.04, cy - S * 0.1, cx + S * 0.02, cy + S * 0.06, 2, () => E.curse);
    stroke(put, cx + S * 0.02, cy - S * 0.02, cx + S * 0.08, cy + S * 0.02, 1, () => E.curseDk);
    [-1, 1].forEach(s => {
      plate(put, cx + s * S * 0.28 - S * 0.07, cy - S * 0.18, cx + s * S * 0.28 + S * 0.07, cy - S * 0.04, E.stoneLt, E.sandLt, E.stoneDk);
      plate(put, cx + s * S * 0.28 - S * 0.055, cy - S * 0.04, cx + s * S * 0.28 + S * 0.055, cy + S * 0.2, E.stone, E.stoneLt, E.stoneDkk);
      dome(put, cx + s * S * 0.28, cy + S * 0.22, S * 0.07, S * 0.055, E.stoneDk, E.stone, E.stoneDkk);
    });
    plate(put, cx - S * 0.09, cy - S * 0.32, cx + S * 0.09, cy - S * 0.14, E.stoneLt, E.sandLt, E.stoneDk);
    [-1, 1].forEach(s => optic(put, cx + s * S * 0.045, cy - S * 0.25, S * 0.026, E.curseDk, E.curse, E.curseLt));
    stroke(put, cx - S * 0.04, cy - S * 0.17, cx + S * 0.04, cy - S * 0.17, 2, () => E.stoneDkk);
    put(Math.round(cx + S * 0.08), Math.round(cy - S * 0.31), E.tombDk);
  }
  function drawJackalRunner(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.22);
    ell(put, cx, cy, S * 0.19, S * 0.09, (tx, ty) => mix(E.jackalLt, E.jackalDk, clamp(ty * 1.25, 0, 1)));
    stroke(put, cx - S * 0.14, cy + S * 0.04, cx - S * 0.26, cy + S * 0.18, S * 0.028, () => E.jackal);
    stroke(put, cx - S * 0.1, cy + S * 0.06, cx - S * 0.06, cy + S * 0.2, S * 0.028, () => E.jackalDk);
    stroke(put, cx + S * 0.12, cy + S * 0.05, cx + S * 0.24, cy + S * 0.16, S * 0.028, () => E.jackal);
    stroke(put, cx + S * 0.08, cy + S * 0.06, cx + S * 0.12, cy + S * 0.2, S * 0.028, () => E.jackalDk);
    stroke(put, cx - S * 0.16, cy - S * 0.02, cx - S * 0.24, cy - S * 0.12, S * 0.05, () => E.jackal);
    dome(put, cx - S * 0.26, cy - S * 0.15, S * 0.06, S * 0.05, E.jackal, E.jackalLt, E.jackalDk);
    stroke(put, cx - S * 0.3, cy - S * 0.14, cx - S * 0.37, cy - S * 0.12, S * 0.03, () => E.jackalDk);
    [-0.01, 0.03].forEach(o => stroke(put, cx - S * 0.24 + o * S, cy - S * 0.19, cx - S * 0.23 + o * S, cy - S * 0.28, S * 0.025, () => E.jackal));
    put(Math.round(cx - S * 0.27), Math.round(cy - S * 0.16), E.flame);
    stroke(put, cx - S * 0.2, cy - S * 0.06, cx - S * 0.16, cy - S * 0.02, 2, () => E.gold);
    stroke(put, cx + S * 0.18, cy - S * 0.02, cx + S * 0.32, cy - S * 0.1, S * 0.02, (t) => mix(E.jackal, E.jackalDk, t));
    [[-0.3, 0.2], [0.28, 0.18]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
  }
  function drawApepSpawn(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    serpent(put, cx, cy + S * 0.14, S * 0.52, 1.6, S * 0.07, (t, ty) => {
      let b = mix(E.purpleLt, E.purpleDk, ty);
      if (Math.floor(t * 10) % 2) b = mix(b, E.obsidian, 0.35);
      return b;
    });
    stroke(put, cx + S * 0.18, cy + S * 0.1, cx + S * 0.16, cy - S * 0.16, S * 0.06, () => E.purple);
    dome(put, cx + S * 0.16, cy - S * 0.2, S * 0.09, S * 0.07, E.purple, E.purpleLt, E.purpleDk);
    stroke(put, cx + S * 0.08, cy - S * 0.18, cx + S * 0.02, cy - S * 0.14, S * 0.035, () => E.purpleDk);
    ell(put, cx - S * 0.02, cy - S * 0.12, S * 0.04, S * 0.04, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
    [-0.02, 0.04].forEach(o => stroke(put, cx + S * 0.1 + o * S, cy - S * 0.16, cx + S * 0.1 + o * S, cy - S * 0.11, 1, () => E.white));
    put(Math.round(cx + S * 0.17), Math.round(cy - S * 0.22), E.red);
    [[0.12, -0.28], [0.18, -0.3], [0.24, -0.27]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S + S * 0.04, cx + ox * S, cy + oy * S, 2, () => E.redDk));
    ell(put, cx - S * 0.08, cy + S * 0.28, S * 0.05, S * 0.018, () => E.curseDk);
  }
  function drawTombWeaver(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) stroke(put, cx, cy + S * 0.28, cx + Math.cos(a) * S * 0.16, cy + S * 0.28 + Math.sin(a) * S * 0.06, 1, () => E.wrapLt);
    ell(put, cx, cy + S * 0.28, S * 0.11, S * 0.04, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.55 && d <= 1 ? E.wrapLt : null; });
    [-1, 1].forEach(s => [[-0.14, 0.3], [-0.04, 0.34], [0.06, 0.32], [0.15, 0.26]].forEach(([oy, len]) => {
      stroke(put, cx + s * S * 0.1, cy + oy * S * 0.5, cx + s * S * len, cy + oy * S * 0.5 - S * 0.08, 2, () => E.boneDk);
      stroke(put, cx + s * S * len, cy + oy * S * 0.5 - S * 0.08, cx + s * S * (len + 0.06), cy + oy * S * 0.5 + S * 0.08, 2, () => E.wrapDkk);
    }));
    wraps(put, cx + S * 0.08, cy + S * 0.04, S * 0.13, S * 0.11, 0.5);
    dome(put, cx - S * 0.08, cy - S * 0.04, S * 0.08, S * 0.07, E.bone, E.wrapLt, E.boneDk);
    [[-0.12, -0.08], [-0.06, -0.1], [-0.1, -0.02], [-0.04, -0.04]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.red));
    [-0.1, -0.05].forEach(o => stroke(put, cx + o * S, cy + S * 0.02, cx + o * S, cy + S * 0.06, 1, () => E.wrapDkk));
  }

  // ================== BOSS — NEFERU-KA (both forms, canon) ==================
  function drawChildKing(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    ell(put, cx, S * 0.9, S * 0.16, S * 0.035, () => E.oil);
    ell(put, cx, S * 0.885, S * 0.1, S * 0.02, () => E.curseDk);
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.045, cy + S * 0.235, S * 0.03, S * 0.018, (tx, ty) => mix(E.gold, E.goldDkk, ty)));
    for (let y = 0; y < S * 0.22; y++) {
      const t = y / (S * 0.22), w = S * (0.05 + t * 0.08);
      row(put, Math.round(cy + y), cx - w, cx + w, (tx) => {
        let b = mix(E.wrapLt, E.wrapDk, t * 0.8);
        if (tx < 0.12 || tx > 0.88) b = mix(b, E.wrapDkk, 0.5);
        return b;
      });
    }
    trim(put, cx - S * 0.12, cx + S * 0.12, Math.round(cy + S * 0.2), 4);
    stroke(put, cx - S * 0.07, cy + S * 0.04, cx - S * 0.13, cy + S * 0.1, S * 0.025, () => E.wrapDk);
    stroke(put, cx + S * 0.07, cy + S * 0.04, cx + S * 0.13, cy + S * 0.12, S * 0.025, () => E.wrapDk);
    for (let i = 0; i < 2; i++) trim(put, cx - S * (0.06 + i * 0.02), cx + S * (0.06 + i * 0.02), Math.round(cy - S * 0.005 + i * 4), 3);
    dome(put, cx, cy - S * 0.16, S * 0.145, S * 0.175, E.gold, E.goldLt, E.goldDkk);
    nemes(put, cx, cy - S * 0.29, S * 0.135, S * 0.115, E.lapis, E.gold);
    stroke(put, cx, cy - S * 0.34, cx, cy - S * 0.395, S * 0.02, () => E.gold);
    dome(put, cx, cy - S * 0.405, S * 0.02, S * 0.022, E.gold, E.goldLt, E.goldDk);
    put(Math.round(cx), Math.round(cy - S * 0.41), E.red);
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.055, cy - S * 0.185, S * 0.035, S * 0.04, () => E.wrapLt);
      ell(put, cx + s * S * 0.055, cy - S * 0.185, S * 0.02, S * 0.026, () => E.oil);
      put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.19), E.curse);
      stroke(put, cx + s * S * 0.09, cy - S * 0.205, cx + s * S * 0.02, cy - S * 0.21, 2, () => E.goldDkk);
    });
    stroke(put, cx + S * 0.055, cy - S * 0.14, cx + S * 0.055, cy - S * 0.02, S * 0.014, () => E.oil);
    ell(put, cx + S * 0.055, cy - S * 0.005, S * 0.012, S * 0.016, () => E.oil);
    stroke(put, cx - S * 0.025, cy - S * 0.065, cx + S * 0.025, cy - S * 0.065, 2, () => E.goldDkk);
    stroke(put, cx, cy - S * 0.045, cx, cy + S * 0.0, S * 0.016, () => E.lapisDk);
    stroke(put, cx - S * 0.145, cy + S * 0.12, cx - S * 0.145, cy - S * 0.04, S * 0.018, () => E.lapis);
    for (let a = 3.3; a < 5.7; a += 0.25) put(Math.round(cx - S * 0.145 + Math.cos(a) * S * 0.032), Math.round(cy - S * 0.04 + Math.sin(a) * S * 0.032), E.lapisLt);
    stroke(put, cx + S * 0.135, cy + S * 0.13, cx + S * 0.2, cy + S * 0.27, S * 0.016, () => E.goldDk);
    [-0.015, 0.015, 0.045].forEach(o => stroke(put, cx + S * 0.2 + o * S, cy + S * 0.27, cx + S * 0.22 + o * S * 1.5, cy + S * 0.33, S * 0.01, () => E.gold));
    [[-0.24, -0.3], [0.26, -0.24], [-0.28, 0.04], [0.3, 0.08], [0.0, -0.5]].forEach(([ox, oy]) => {
      const px = Math.round(cx + ox * S), py = Math.round(cy + oy * S);
      ell(put, px, py, S * 0.016, S * 0.02, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
      put(px, py - 3, E.curse);
    });
  }
  function drawExecutioner(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    for (let i = 0; i < 5; i++)
      stroke(put, cx - S * 0.02, cy - S * 0.12 + i * 2.5, cx - S * 0.26 - i * S * 0.012, cy + S * 0.1 + i * S * 0.04, S * 0.032, (t) => mix(E.wrap, E.wrapDkk, t));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.08, cy + S * 0.12, cx + s * S * 0.13, cy + S * 0.3, S * 0.05, () => E.jackal);
      ell(put, cx + s * S * 0.14, cy + S * 0.32, S * 0.05, S * 0.025, (tx, ty) => mix(E.jackalDk, E.oil, ty));
      trim(put, cx + s * S * 0.13 - S * 0.03, cx + s * S * 0.13 + S * 0.03, Math.round(cy + S * 0.22), 3);
    });
    for (let y = 0; y < S * 0.1; y++) {
      const t = y / (S * 0.1), w = S * (0.11 + t * 0.05);
      row(put, Math.round(cy + S * 0.06 + y), cx - w, cx + w, (tx) => {
        const st = Math.floor(tx * 9) % 2;
        return mix(st ? E.gold : E.lapisDk, E.oil, t * 0.35);
      });
    }
    plate(put, cx - S * 0.14, cy - S * 0.16, cx + S * 0.14, cy + S * 0.08, E.jackal, E.jackalLt, E.jackalDk);
    stroke(put, cx - S * 0.09, cy - S * 0.12, cx + S * 0.03, cy + S * 0.02, 2, () => E.curse);
    stroke(put, cx + S * 0.05, cy - S * 0.08, cx + S * 0.1, cy - S * 0.02, 1, () => E.curseDk);
    for (let i = 0; i < 2; i++) trim(put, cx - S * (0.1 + i * 0.025), cx + S * (0.1 + i * 0.025), Math.round(cy - S * 0.16 + i * 4), 3);
    dome(put, cx - S * 0.06, cy + S * 0.1, S * 0.032, S * 0.04, E.gold, E.goldLt, E.goldDkk);
    [-1, 1].forEach(s => put(Math.round(cx - S * 0.06 + s * 2), Math.round(cy + S * 0.09), E.oil));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.13, cy - S * 0.12, cx + s * S * 0.3, cy - S * 0.24, S * 0.045, () => E.jackalDk);
      trim(put, cx + s * S * 0.2 - S * 0.025, cx + s * S * 0.2 + S * 0.025, Math.round(cy - S * 0.19), 3);
      stroke(put, cx + s * S * 0.3, cy - S * 0.24, cx + s * S * 0.34, cy - S * 0.4, S * 0.024, () => E.goldDkk);
      for (let a = 0; a < 1.5; a += 0.1) {
        const bx2 = cx + s * (S * 0.34 + Math.sin(a) * S * 0.11), by2 = cy - S * 0.4 - (1 - Math.cos(a)) * S * 0.1;
        ell(put, bx2, by2, S * 0.026, S * 0.02, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.28));
      }
      put(Math.round(cx + s * S * 0.42), Math.round(cy - S * 0.5), E.curse);
    });
    dome(put, cx, cy - S * 0.28, S * 0.09, S * 0.085, E.jackal, E.jackalLt, E.jackalDk);
    stroke(put, cx - S * 0.07, cy - S * 0.26, cx - S * 0.19, cy - S * 0.22, S * 0.05, (t) => mix(E.jackal, E.jackalDk, t * 0.7));
    [[-0.12, -0.235], [-0.15, -0.225], [-0.09, -0.24]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.bone));
    stroke(put, cx - S * 0.1, cy - S * 0.25, cx - S * 0.18, cy - S * 0.24, 1, () => E.oil);
    [-1, 1].forEach(k => {
      stroke(put, cx + k * S * 0.05, cy - S * 0.34, cx + k * S * 0.085, cy - S * 0.46, S * 0.038, (t) => mix(E.jackal, E.jackalDk, t * 0.5));
      trim(put, cx + k * S * 0.07 - S * 0.018, cx + k * S * 0.07 + S * 0.018, Math.round(cy - S * 0.43), 2);
    });
    optic(put, cx - S * 0.03, cy - S * 0.3, S * 0.026, E.redDk, E.red, E.redLt);
    stroke(put, cx - S * 0.03, cy - S * 0.27, cx - S * 0.03, cy - S * 0.22, 1, () => E.oil);
  }

  // ======================= DECOR (ALL 20 kept) ==============================
  function drawObelisk(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
    for (let y = S * 0.14; y < S * 0.82; y++) {
      const t = (y - S * 0.14) / (S * 0.68), w = S * (0.045 + t * 0.045);
      row(put, Math.round(y), cx - w, cx + w, (tx) => mix(E.stoneLt, E.stoneDk, tx * 0.8 + t * 0.15));
    }
    for (let y = 0; y < S * 0.07; y++) row(put, Math.round(S * 0.07 + y), cx - y * 0.6, cx + y * 0.6, (tx) => mix(E.goldLt, E.goldDk, y / (S * 0.07)));
    glyphs(put, cx - S * 0.035, S * 0.24, cx + S * 0.04, S * 0.78, E.stoneDkk);
  }
  function drawSarcophagus(put, S) {
    const cx = S * 0.5, cy = S * 0.55;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.24, cy + S * 0.14, cx + S * 0.24, cy + S * 0.24, E.stone, E.stoneLt, E.stoneDkk);
    for (let y = 0; y < S * 0.28; y++) {
      const t = y / (S * 0.28);
      const w = S * (0.14 + Math.sin(t * Math.PI) * 0.06);
      row(put, Math.round(cy - S * 0.14 + y), cx - w, cx + w, (tx) => mix(E.goldLt, E.goldDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.55));
    }
    nemes(put, cx, cy - S * 0.08, S * 0.08, S * 0.06, E.lapis, E.gold);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, cy - S * 0.0, cx + s * S * 0.015, cy - S * 0.0, 1, () => E.oil));
    stroke(put, cx - S * 0.08, cy + S * 0.16, cx + S * 0.06, cy + S * 0.04, S * 0.02, () => E.lapis);
    stroke(put, cx + S * 0.08, cy + S * 0.16, cx - S * 0.06, cy + S * 0.04, S * 0.02, () => E.goldDk);
    trim(put, cx - S * 0.15, cx + S * 0.15, Math.round(cy + S * 0.1), 3);
  }
  function drawCanopicSet(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.26, cy + S * 0.1, cx + S * 0.26, cy + S * 0.18, E.stone, E.stoneLt, E.stoneDkk);
    [-0.19, -0.065, 0.065, 0.19].forEach((o, i) => {
      const jx = cx + o * S;
      for (let y = 0; y < S * 0.16; y++) {
        const t = y / (S * 0.16), w = S * (0.045 + Math.sin(t * Math.PI) * 0.02);
        row(put, Math.round(cy - S * 0.06 + y), jx - w, jx + w, (tx) => mix(E.wrapLt, E.wrapDk, t * 0.7 + Math.abs(tx - 0.5) * 0.4));
      }
      const cols = [[E.jackal, E.jackalDk], [E.lapis, E.lapisDk], [E.skin, E.skinDk], [E.stone, E.stoneDk]][i];
      dome(put, jx, cy - S * 0.09, S * 0.035, S * 0.03, cols[0], mix(cols[0], '#ffffff', 0.4), cols[1]);
      put(Math.round(jx - S * 0.012), Math.round(cy - S * 0.095), E.oil);
    });
  }
  function drawTreasurePile(put, S) {
    const cx = S * 0.5, cy = S * 0.62;
    shadow(put, S, cx, S * 0.28);
    dome(put, cx, cy + S * 0.06, S * 0.26, S * 0.14, E.gold, E.goldLt, E.goldDkk);
    dome(put, cx - S * 0.12, cy + S * 0.1, S * 0.12, S * 0.07, E.goldLt, '#fffbe0', E.goldDk);
    for (let i = 0; i < 26; i++) {
      const a = (i * 2.4) % 6.28, r = ((i * 37) % 100) / 100;
      const x = cx + Math.cos(a) * r * S * 0.22, y = cy + S * 0.06 + Math.sin(a) * r * S * 0.1;
      ell(put, x, y, S * 0.016, S * 0.011, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
    }
    stroke(put, cx + S * 0.14, cy - S * 0.02, cx + S * 0.14, cy + S * 0.06, S * 0.02, () => E.goldDk);
    ell(put, cx + S * 0.14, cy - S * 0.05, S * 0.035, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
    ell(put, cx - S * 0.06, cy - S * 0.04, S * 0.045, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
    [[-0.08], [-0.05], [-0.02]].forEach(([o]) => stroke(put, cx + o * S, cy - S * 0.06, cx + o * S, cy - S * 0.09, 2, () => E.gold));
    [[0.02, -0.02, E.red], [-0.16, 0.02, E.lapisLt], [0.08, 0.0, E.curse]].forEach(([ox, oy, c]) => {
      ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, () => c); put(Math.round(cx + ox * S - 1), Math.round(cy + oy * S - 1), '#ffffff');
    });
  }
  function drawGildedChest(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.18, cy - S * 0.02, cx + S * 0.18, cy + S * 0.18, E.red, E.redLt, E.redDk);
    [(-0.12), 0, 0.12].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.18; y++) put(Math.round(cx + o * S), y, E.goldDk); });
    trim(put, cx - S * 0.18, cx + S * 0.18, Math.round(cy + S * 0.14), 3);
    dome(put, cx, cy - S * 0.08, S * 0.19, S * 0.09, E.redDk, E.red, E.redDk);
    trim(put, cx - S * 0.19, cx + S * 0.19, Math.round(cy - S * 0.05), 3);
    row(put, Math.round(cy - S * 0.015), cx - S * 0.17, cx + S * 0.17, () => E.goldLt);
    row(put, Math.round(cy - S * 0.005), cx - S * 0.15, cx + S * 0.15, () => '#fffbe0');
    plate(put, cx - S * 0.025, cy - S * 0.02, cx + S * 0.025, cy + S * 0.06, E.gold, E.goldLt, E.goldDkk);
    put(Math.round(cx), Math.round(cy + S * 0.03), E.oil);
  }
  function drawBrazier(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    [-1, 0, 1].forEach(s => stroke(put, cx, S * 0.62, cx + s * S * 0.1, S * 0.86, S * 0.02, () => E.goldDkk));
    ell(put, cx, S * 0.6, S * 0.13, S * 0.05, (tx, ty) => mix(E.goldLt, E.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
    ell(put, cx, S * 0.575, S * 0.1, S * 0.03, () => E.tombDk);
    flame(put, cx, S * 0.46, S * 0.09);
    flame(put, cx - S * 0.05, S * 0.5, S * 0.05);
    flame(put, cx + S * 0.05, S * 0.51, S * 0.045);
    [[0.08, 0.36], [-0.06, 0.33], [0.01, 0.3]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(oy * S), E.flameLt));
  }
  function drawPharaohColossus(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.2, S * 0.8, cx + S * 0.2, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
    plate(put, cx - S * 0.16, S * 0.5, cx + S * 0.16, S * 0.8, E.stoneDk, E.stone, E.stoneDkk);
    dome(put, cx, S * 0.46, S * 0.12, S * 0.14, E.stone, E.stoneLt, E.stoneDkk);
    plate(put, cx - S * 0.14, S * 0.62, cx + S * 0.14, S * 0.7, E.stoneLt, E.sandLt, E.stoneDk);
    [-1, 1].forEach(s => plate(put, cx + s * S * 0.09 - S * 0.035, S * 0.7, cx + s * S * 0.09 + S * 0.035, S * 0.8, E.stone, E.stoneLt, E.stoneDkk));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.12, S * 0.52, cx + s * S * 0.12, S * 0.64, S * 0.035, () => E.stoneDk));
    dome(put, cx, S * 0.32, S * 0.08, S * 0.08, E.stone, E.stoneLt, E.stoneDk);
    nemes(put, cx, S * 0.28, S * 0.075, S * 0.06, E.stoneLt, E.stoneDk);
    stroke(put, cx, S * 0.38, cx, S * 0.42, 2, () => E.stoneDkk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.325, cx + s * S * 0.012, S * 0.325, 1, () => E.stoneDkk));
    put(Math.round(cx - S * 0.06), Math.round(S * 0.3), E.tombDk);
    glyphs(put, cx - S * 0.13, S * 0.72, cx + S * 0.13, S * 0.79, E.stoneDkk);
  }
  function drawAnubisStatue(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.15, S * 0.82, cx + S * 0.15, S * 0.9, E.obsidian, E.jackalLt, E.oil);
    plate(put, cx - S * 0.07, S * 0.42, cx + S * 0.07, S * 0.82, E.jackal, E.jackalLt, E.jackalDk);
    trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(S * 0.46), 4);
    stroke(put, cx - S * 0.05, S * 0.56, cx + S * 0.05, S * 0.56, 2, () => E.goldDk);
    dome(put, cx, S * 0.32, S * 0.07, S * 0.07, E.jackal, E.jackalLt, E.jackalDk);
    stroke(put, cx - S * 0.05, S * 0.34, cx - S * 0.14, S * 0.36, S * 0.03, () => E.jackalDk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.27, cx + s * S * 0.065, S * 0.18, S * 0.03, () => E.jackal));
    put(Math.round(cx - S * 0.03), Math.round(S * 0.31), E.gold);
    stroke(put, cx + S * 0.13, S * 0.3, cx + S * 0.13, S * 0.84, S * 0.018, () => E.goldDk);
    stroke(put, cx + S * 0.13, S * 0.3, cx + S * 0.17, S * 0.27, S * 0.02, () => E.gold);
    [-1, 1].forEach(s => stroke(put, cx + S * 0.13, S * 0.84, cx + S * 0.13 + s * S * 0.025, S * 0.87, 2, () => E.goldDk));
  }
  function drawPapyrusColumn(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
    for (let y = S * 0.3; y < S * 0.82; y++) {
      row(put, Math.round(y), cx - S * 0.075, cx + S * 0.075, (tx) => {
        const f = Math.sin(tx * Math.PI * 4);
        let b = mix(E.sandLt, E.sand, 0.5 + f * 0.5);
        if (tx > 0.85) b = E.stoneDk;
        return b;
      });
    }
    [[0.36, E.lapis], [0.39, E.red], [0.42, E.gold]].forEach(([yy, c]) => row(put, Math.round(S * yy * 2), cx - S * 0.075, cx + S * 0.075, () => c));
    for (let y = 0; y < S * 0.1; y++) {
      const t = y / (S * 0.1), w = S * (0.13 - t * 0.05);
      row(put, Math.round(S * 0.2 + y), cx - w, cx + w, (tx) => mix(E.turq, E.turqDk, t + Math.abs(tx - 0.5) * 0.4));
    }
    for (let x = -0.12; x < 0.13; x += 0.02) {
      const h = S * (0.17 - Math.abs(Math.sin(x * 80)) * 0.03);
      for (let y = h; y < S * 0.21; y++) put(Math.round(cx + x * S), Math.round(y), E.stoneDk);
    }
    dome(put, cx + S * 0.22, S * 0.85, S * 0.07, S * 0.045, E.sand, E.sandLt, E.sandDkk);
  }
  function drawGlyphWall(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    plate(put, cx - S * 0.3, S * 0.3, cx + S * 0.3, S * 0.86, E.sand, E.sandLt, E.sandDkk);
    stroke(put, cx - S * 0.3, S * 0.3, cx + S * 0.3, S * 0.3, 3, () => E.stoneDk);
    glyphs(put, cx - S * 0.27, S * 0.34, cx + S * 0.27, S * 0.5, E.sandDkk);
    row(put, Math.round(S * 0.52), cx - S * 0.28, cx + S * 0.28, () => E.stoneDk);
    [[-0.18, E.red], [-0.05, E.lapis], [0.08, E.turq], [0.2, E.red]].forEach(([o, c]) => {
      const fx = cx + o * S;
      dome(put, fx, S * 0.6, S * 0.025, S * 0.025, E.skin, '#e8b088', E.skinDk);
      plate(put, fx - S * 0.02, S * 0.62, fx + S * 0.02, S * 0.7, c, mix(c, '#ffffff', 0.3), mix(c, '#000000', 0.4));
      stroke(put, fx, S * 0.7, fx - S * 0.02, S * 0.75, 2, () => E.skinDk);
      stroke(put, fx, S * 0.7, fx + S * 0.02, S * 0.75, 2, () => E.skinDk);
    });
    row(put, Math.round(S * 0.77), cx - S * 0.28, cx + S * 0.28, () => E.stoneDk);
    glyphs(put, cx - S * 0.27, S * 0.79, cx + S * 0.27, S * 0.85, E.sandDkk);
    horusEye(put, cx, S * 0.44, S * 0.03, E.lapisLt, E.lapisDk);
  }
  function drawSphinx(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.3);
    ell(put, cx + S * 0.06, cy + S * 0.04, S * 0.26, S * 0.12, (tx, ty) => mix(E.sand, E.sandDkk, clamp(ty * 1.2, 0, 1)));
    [[-0.02], [0.06]].forEach(([o]) => plate(put, cx - S * 0.24, cy + S * 0.08 + o * S, cx + S * 0.02, cy + S * 0.13 + o * S, E.sandLt, E.sand, E.sandDkk));
    dome(put, cx + S * 0.24, cy + S * 0.02, S * 0.09, S * 0.09, E.sand, E.sandLt, E.sandDkk);
    dome(put, cx - S * 0.14, cy - S * 0.14, S * 0.09, S * 0.09, E.sand, E.sandLt, E.sandDk);
    nemes(put, cx - S * 0.14, cy - S * 0.19, S * 0.085, S * 0.07, E.sandLt, E.sandDk);
    [-1, 1].forEach(s => stroke(put, cx - S * 0.14 + s * S * 0.04, cy - S * 0.15, cx - S * 0.14 + s * S * 0.015, cy - S * 0.15, 1, () => E.sandDkk));
    put(Math.round(cx - S * 0.17), Math.round(cy - S * 0.12), E.sandDkk);
    put(Math.round(cx - S * 0.18), Math.round(cy - S * 0.11), E.sandDk);
    stroke(put, cx - S * 0.12, cy - S * 0.08, cx - S * 0.16, cy - S * 0.08, 1, () => E.sandDkk);
  }
  function drawPalmCluster(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    [[-0.06, 0.9, -0.14], [0.08, 0.9, 0.16]].forEach(([o, , lean]) => {
      for (let t = 0; t < 1; t += 0.05) {
        const x = cx + o * S + Math.sin(t * 1.2) * lean * S, y = S * 0.86 - t * S * 0.5;
        ell(put, x, y, S * (0.03 - t * 0.008), S * 0.02, () => mix(E.stoneDk, E.stoneDkk, (t * 3 % 1) < 0.5 ? 0.2 : 0.6));
      }
    });
    [[-0.2, 0.34], [0.24, 0.32]].forEach(([ox, oy]) => {
      const px = cx + ox * S, py = S * oy;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const fx = px + Math.cos(a) * S * 0.14, fy = py + Math.sin(a) * S * 0.07 + S * 0.03;
        stroke(put, px, py, fx, fy, S * 0.03, (t) => mix('#5fae4a', '#2c6e28', t));
        stroke(put, fx, fy, fx + Math.cos(a) * S * 0.03, fy + S * 0.04, S * 0.02, () => '#245222');
      }
      ell(put, px, py + S * 0.045, S * 0.03, S * 0.02, () => E.red);
    });
  }
  function drawOasisPool(put, S) {
    const cx = S * 0.5, cy = S * 0.62;
    ell(put, cx, cy, S * 0.3, S * 0.16, (tx, ty) => mix(E.sandLt, E.sandDk, ty));
    ell(put, cx, cy, S * 0.24, S * 0.115, (tx, ty) => {
      let b = mix(E.turqLt, E.lapisDk, clamp(ty * 1.3, 0, 1));
      if (Math.sin(tx * 14 + ty * 6) > 0.8) b = mix(b, '#ffffff', 0.4);
      return b;
    });
    [[-0.26, -0.02], [-0.3, 0.04], [0.27, 0.0], [0.31, 0.06]].forEach(([ox, oy]) => {
      stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.015, cy + oy * S - S * 0.14, 2, () => '#4a8a3a');
      ell(put, cx + ox * S + S * 0.015, cy + oy * S - S * 0.15, S * 0.012, S * 0.025, () => '#6e5230');
    });
    ell(put, cx - S * 0.06, cy - S * 0.02, S * 0.025, S * 0.015, () => '#5fae4a');
    put(Math.round(cx + S * 0.08), Math.round(cy + S * 0.02), '#ffffff');
  }
  function drawRaiderCamp(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.28);
    for (let y = 0; y < S * 0.24; y++) {
      const t = y / (S * 0.24), w = t * S * 0.22;
      row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w + S * 0.02, (tx) => {
        let b = mix(E.wrapLt, E.wrapDk, t * 0.6 + Math.abs(tx - 0.5) * 0.3);
        if (tx > 0.46 && tx < 0.54 && t > 0.55) b = E.tombDk;
        return b;
      });
    }
    stroke(put, cx, cy - S * 0.18, cx, cy - S * 0.26, 2, () => E.stoneDkk);
    ell(put, cx, cy - S * 0.27, S * 0.02, S * 0.014, () => E.red);
    ell(put, cx - S * 0.22, cy + S * 0.14, S * 0.09, S * 0.03, (tx, ty) => mix(E.red, E.redDk, ty));
    ell(put, cx - S * 0.29, cy + S * 0.13, S * 0.025, S * 0.025, (tx, ty) => mix(E.wrapLt, E.wrapDk, ty));
    plate(put, cx + S * 0.18, cy + S * 0.04, cx + S * 0.28, cy + S * 0.14, E.stoneDk, E.stone, E.stoneDkk);
    stroke(put, cx + S * 0.23, cy + S * 0.0, cx + S * 0.23, cy + S * 0.04, 1, () => E.goldDkk);
    ell(put, cx + S * 0.23, cy - S * 0.02, S * 0.02, S * 0.025, (tx, ty) => mix(E.flameLt, E.flameDk, ty));
    ell(put, cx, cy + S * 0.16, S * 0.05, S * 0.02, () => E.tombDk);
    [[-0.04], [0.03]].forEach(([o]) => stroke(put, cx + o * S, cy + S * 0.15, cx + o * S + S * 0.03, cy + S * 0.17, 1, () => E.stoneDkk));
  }
  function drawDuneDrift(put, S) {
    const cx = S * 0.5, cy = S * 0.62;
    dome(put, cx, cy, S * 0.3, S * 0.13, E.sand, E.sandLt, E.sandDkk);
    dome(put, cx + S * 0.16, cy + S * 0.04, S * 0.15, S * 0.07, E.sandLt, '#fce8c0', E.sandDk);
    for (let i = 0; i < 5; i++) {
      const yy = cy - S * 0.06 + i * S * 0.035;
      for (let x = -0.26; x < 0.26; x += 0.02) {
        const wob = Math.sin(x * 14 + i) * S * 0.008;
        if ((x * 50 | 0) % 2 === 0) put(Math.round(cx + x * S), Math.round(yy + wob), E.sandDk);
      }
    }
    [[0.3, -0.1], [0.34, -0.06], [0.32, -0.13]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
  }
  function drawFallenColossus(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    dome(put, cx, cy + S * 0.16, S * 0.3, S * 0.09, E.sand, E.sandLt, E.sandDkk);
    dome(put, cx, cy - S * 0.02, S * 0.19, S * 0.2, E.stone, E.stoneLt, E.stoneDkk);
    nemes(put, cx - S * 0.02, cy - S * 0.14, S * 0.17, S * 0.1, E.stoneLt, E.stoneDk);
    stroke(put, cx - S * 0.1, cy - S * 0.02, cx - S * 0.02, cy - S * 0.02, 2, () => E.stoneDkk);
    ell(put, cx - S * 0.06, cy + S * 0.0, S * 0.03, S * 0.02, () => E.tombDk);
    stroke(put, cx - S * 0.02, cy + S * 0.08, cx + S * 0.06, cy + S * 0.09, 2, () => E.stoneDkk);
    stroke(put, cx, cy + S * 0.14, cx + S * 0.08, cy + S * 0.14, 2, () => E.stoneDk);
    stroke(put, cx + S * 0.08, cy - S * 0.18, cx + S * 0.14, cy - S * 0.02, 1, () => E.stoneDkk);
    dome(put, cx - S * 0.26, cy + S * 0.14, S * 0.05, S * 0.03, E.stone, E.stoneLt, E.stoneDkk);
    plate(put, cx + S * 0.22, cy + S * 0.1, cx + S * 0.28, cy + S * 0.18, E.stoneDk, E.stone, E.stoneDkk);
  }
  function drawTrapPlate(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    plate(put, cx - S * 0.28, cy - S * 0.1, cx + S * 0.28, cy + S * 0.24, E.stone, E.stoneLt, E.stoneDkk);
    plate(put, cx - S * 0.12, cy - S * 0.0, cx + S * 0.12, cy + S * 0.14, E.sandDk, E.stoneDk, E.tombDk);
    stroke(put, cx - S * 0.12, cy - S * 0.0, cx + S * 0.12, cy - S * 0.0, 1, () => E.oil);
    horusEye(put, cx, cy + S * 0.07, S * 0.03, E.redLt, E.redDk);
    plate(put, cx + S * 0.2, cy - S * 0.34, cx + S * 0.28, cy - S * 0.1, E.sand, E.sandLt, E.sandDkk);
    [[-0.28], [-0.2]].forEach(([oy]) => { ell(put, cx + S * 0.24, cy + oy * S, S * 0.015, S * 0.012, () => E.oil); });
    stroke(put, cx + S * 0.18, cy - S * 0.27, cx + S * 0.08, cy - S * 0.25, 1, () => E.bone);
    stroke(put, cx - S * 0.2, cy + S * 0.18, cx - S * 0.14, cy + S * 0.16, 1, () => E.bone);
    [[-0.14, 0.15], [-0.13, 0.17]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.bone));
  }
  function drawScales(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.88, E.stone, E.stoneLt, E.stoneDkk);
    stroke(put, cx, S * 0.3, cx, S * 0.82, S * 0.02, () => E.goldDk);
    stroke(put, cx - S * 0.22, S * 0.36, cx + S * 0.22, S * 0.3, S * 0.018, () => E.gold);
    ell(put, cx, S * 0.28, S * 0.03, S * 0.03, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
    [[-0.22, 0.36, 0.5], [0.22, 0.3, 0.44]].forEach(([ox, oy, py]) => {
      [-1, 1].forEach(s => stroke(put, cx + ox * S, S * oy, cx + ox * S + s * S * 0.05, S * py, 1, () => E.goldDkk));
      ell(put, cx + ox * S, S * (py + 0.015), S * 0.07, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDkk, ty));
    });
    ell(put, cx - S * 0.22, S * 0.48, S * 0.028, S * 0.025, (tx, ty) => mix(E.redLt, E.redDk, ty));
    stroke(put, cx + S * 0.2, S * 0.4, cx + S * 0.24, S * 0.44, 1, () => E.turqLt);
    stroke(put, cx + S * 0.21, S * 0.4, cx + S * 0.23, S * 0.44, 1, () => E.turq);
    horusEye(put, cx, S * 0.6, S * 0.03, E.lapisLt, E.lapisDk);
  }
  function drawPlunderCart(put, S) {
    const cx = S * 0.5, cy = S * 0.58;
    shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.22, cy - S * 0.02, cx + S * 0.22, cy + S * 0.12, E.stoneDk, E.stone, E.tombDk);
    [(-0.15), 0, 0.15].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.12; y++) put(Math.round(cx + o * S), y, E.tombDk); });
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.14, cy + S * 0.16, S * 0.07, S * 0.07, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.14 && d <= 0.25 ? E.stoneDkk : null; });
      [-1, 1].forEach(k => stroke(put, cx + s * S * 0.14 - k * S * 0.045, cy + S * 0.12, cx + s * S * 0.14 + k * S * 0.045, cy + S * 0.2, 1, () => E.stoneDk));
      bolt(put, cx + s * S * 0.14, cy + S * 0.16, S * 0.015, E.gold, E.goldDkk);
    });
    stroke(put, cx + S * 0.22, cy + S * 0.02, cx + S * 0.32, cy + S * 0.06, S * 0.015, () => E.stoneDk);
    dome(put, cx, cy - S * 0.08, S * 0.18, S * 0.09, E.gold, E.goldLt, E.goldDkk);
    ell(put, cx - S * 0.08, cy - S * 0.14, S * 0.04, S * 0.03, (tx, ty) => mix(E.turqLt, E.turqDk, ty));
    plate(put, cx + S * 0.04, cy - S * 0.18, cx + S * 0.1, cy - S * 0.1, E.lapis, E.lapisLt, E.lapisDk);
    [[-0.14, -0.08], [0.14, -0.06], [0.0, -0.04]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.016, S * 0.012, () => E.goldLt));
  }
  function drawUrnCluster(put, S) {
    const cx = S * 0.5, cy = S * 0.6;
    shadow(put, S, cx, S * 0.26);
    for (let y = 0; y < S * 0.3; y++) {
      const t = y / (S * 0.3), w = S * (0.05 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.1);
      row(put, Math.round(cy - S * 0.16 + y), cx - w - S * 0.06, cx + w - S * 0.06, (tx) => {
        let b = mix(E.stoneLt, E.stoneDk, t * 0.6 + Math.abs(tx - 0.5) * 0.5);
        if (t > 0.3 && t < 0.42) b = E.red;
        if (t > 0.46 && t < 0.54) b = E.lapisDk;
        return b;
      });
    }
    ell(put, cx - S * 0.06, cy - S * 0.17, S * 0.045, S * 0.02, (tx, ty) => mix(E.stoneDk, E.tombDk, ty));
    [-1, 1].forEach(s => stroke(put, cx - S * 0.06 + s * S * 0.1, cy - S * 0.1, cx - S * 0.06 + s * S * 0.13, cy - S * 0.02, 2, () => E.stoneDk));
    for (let y = 0; y < S * 0.14; y++) {
      const t = y / (S * 0.14), w = S * (0.03 + Math.sin(t * Math.PI) * 0.05);
      row(put, Math.round(cy + y), cx + S * 0.12 - w, cx + S * 0.12 + w, (tx) => mix(E.sand, E.sandDkk, t * 0.7 + Math.abs(tx - 0.5) * 0.4));
    }
    row(put, Math.round(cy + S * 0.05), cx + S * 0.05, cx + S * 0.19, () => E.turqDk);
    [[0.2, 0.2], [0.26, 0.22], [0.23, 0.17]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.03, cy + oy * S + S * 0.02, 2, () => E.stoneDk));
    ell(put, cx + S * 0.24, cy + S * 0.24, S * 0.05, S * 0.02, (tx, ty) => mix(E.sandLt, E.sandDk, ty));
  }

  // ======================= TILES (#1 2 3 4 5 7 8 10) ========================
  function tileFn(base) {
    return (put, S) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x, y, S); if (c) put(x, y, c); } };
  }
  const drawDesert = tileFn((x, y, T) => {
    let b = mix(E.sand, E.sandDk, 0.2 + h2(x >> 2, y >> 2, 1) * 0.35);
    const rip = Math.sin(y * 0.5 + Math.sin(x * 0.12) * 2.2);
    if (rip > 0.75) b = mix(b, E.sandLt, 0.5);
    if (rip < -0.8) b = mix(b, E.sandDkk, 0.3);
    if (h2(x, y, 3) > 0.995) b = E.sandLt;
    return b;
  });
  const drawBrick = tileFn((x, y, T) => {
    const bh = T / 4, bw = T / 2;
    const rowI = Math.floor(y / bh), off = (rowI % 2) * (bw / 2);
    const bx = Math.floor((x + off) / bw);
    let b = mix(E.stoneLt, E.stone, 0.25 + h2(bx + 5, rowI, 7) * 0.5);
    b = mix(b, E.stoneDk, h2(x, y, 8) * 0.2);
    if (y % bh < 1.5 || (x + off) % bw < 1.5) b = E.stoneDkk;
    if (h2(x, y, 9) > 0.992) b = E.sandLt;
    return b;
  });
  const drawCauseway = tileFn((x, y, T) => {
    let b = mix(E.sandLt, E.sand, 0.3 + h2(x >> 2, y >> 2, 12) * 0.4);
    if (y % (T / 2) < 1.5 || x % (T / 2) < 1.5) b = E.stoneDk;
    const cxq = Math.floor(x / (T / 2)) % 2, gx = x % (T / 2), gy = y % (T / 2);
    const inCart = gx > 8 && gx < T / 2 - 8 && gy > 6 && gy < T / 2 - 6;
    const border = inCart && (gx < 10 || gx > T / 2 - 10 || gy < 8 || gy > T / 2 - 8);
    if (border) b = E.stoneDkk;
    else if (inCart) {
      const k = (Math.floor(gx / 5) + Math.floor(gy / 6) * 3 + cxq) % 4;
      if (k === 0 && gx % 5 < 3 && gy % 6 === 3) b = E.stoneDkk;
      if (k === 1 && gx % 5 === 2 && gy % 6 < 4) b = E.stoneDkk;
      if (k === 2 && (gx + gy) % 7 < 1.5) b = E.sandDkk;
    }
    return b;
  });
  const drawTombDark = tileFn((x, y, T) => {
    let b = mix(E.tomb, E.tombDk, 0.35 + h2(x >> 1, y >> 1, 20) * 0.5);
    if ((x % (T / 2) < 1.2) || (y % (T / 2) < 1.2)) b = mix(b, E.oil, 0.7);
    if (h2(x, y, 22) > 0.993) b = E.sandDk;
    if (h2(x >> 3, y >> 3, 23) > 0.9 && (x + y) % 9 < 1.5) b = mix(b, E.sandDkk, 0.4);
    return b;
  });
  const drawRoyal = tileFn((x, y, T) => {
    const cs = T / 4, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    const alt = (cxi + cyi) % 2 === 0;
    let b = alt ? mix(E.gold, E.goldDk, 0.25 + h2(cxi, cyi, 30) * 0.35)
      : mix(E.obsidian, E.tombDk, 0.3 + h2(cxi, cyi, 31) * 0.4);
    if (Math.sin(x * 0.7 + y * 0.4) > 0.93 && alt) b = mix(b, E.goldLt, 0.7);
    if (x % cs < 1.2 || y % cs < 1.2) b = E.goldDkk;
    if (x % cs < 2.5 && y % cs < 2.5) b = E.lapisDk;
    return b;
  });
  const drawLapisHall = tileFn((x, y, T) => {
    let b = mix(E.lapisDk, '#0e1e4a', 0.3 + h2(x >> 2, y >> 2, 50) * 0.4);
    if (x % (T / 2) < 1.4 || y % (T / 2) < 1.4) b = mix(b, E.goldDkk, 0.8);
    const gx = x % (T / 2) - T / 4, gy = y % (T / 2) - T / 4;
    const r = Math.hypot(gx, gy), a = Math.atan2(gy, gx);
    const star = r < 8 * (0.45 + 0.55 * Math.abs(Math.cos(a * 2.5)));
    if (star && r < 8) b = r < 2 ? E.goldLt : mix(E.gold, E.goldDk, r / 8);
    if (h2(x, y, 52) > 0.996) b = E.goldLt;
    return b;
  });
  const drawQuicksand = tileFn((x, y, T) => {
    const dx = x - T / 2, dy = y - T / 2;
    const ang = Math.atan2(dy, dx), rad = Math.hypot(dx, dy);
    const swirl = Math.sin(ang * 3 + rad * 0.5);
    let b = mix(E.sandDk, E.sandDkk, 0.4 + swirl * 0.3);
    if (swirl > 0.75) b = mix(b, E.sand, 0.4);
    if (rad < 5) b = mix(E.sandDkk, E.tombDk, 0.6);
    if (h2(x, y, 60) > 0.993) b = E.sandLt;
    return b;
  });
  const drawObsidianSeal = tileFn((x, y, T) => {
    let b = mix(E.obsidian, E.oil, 0.3 + h2(x >> 2, y >> 2, 80) * 0.4);
    if (Math.sin((x + y) * 0.22) > 0.94) b = mix(b, E.purpleDk, 0.4);
    const dx = x - T / 2, dy = y - T / 2, rad = Math.hypot(dx, dy);
    [T * 0.18, T * 0.32, T * 0.44].forEach((rr, i) => {
      if (Math.abs(rad - rr) < 1.2) b = mix(E.gold, E.goldDkk, h2(x, y, 81 + i) * 0.5);
    });
    const ang = Math.atan2(dy, dx);
    if (Math.abs(rad - T * 0.38) < 3 && Math.abs(Math.sin(ang * 8)) > 0.93) b = E.goldDk;
    if (rad < 2.5) b = E.curse;
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var PYR_ART = {
    E: E,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (8) ----
      ctx.spr('scarabHi', MS, MS, drawScarab);
      ctx.spr('khopeshGuardHi', MS, MS, drawKhopeshGuard);
      ctx.spr('broodmotherHi', MS, MS, drawBroodmother);
      ctx.spr('ankhPriestHi', MS, MS, drawAnkhPriest);
      ctx.spr('sandstoneGolemHi', MS, MS, drawSandstoneGolem);
      ctx.spr('jackalRunnerHi', MS, MS, drawJackalRunner);
      ctx.spr('apepSpawnHi', MS, MS, drawApepSpawn);
      ctx.spr('tombWeaverHi', MS, MS, drawTombWeaver);
      ctx.MOB_HI.scarab = 'scarabHi';               ctx.MOB_DISPLAY.scarab = 32;
      ctx.MOB_HI.khopeshGuard = 'khopeshGuardHi';   ctx.MOB_DISPLAY.khopeshGuard = 54;
      ctx.MOB_HI.broodmother = 'broodmotherHi';     ctx.MOB_DISPLAY.broodmother = 60;
      ctx.MOB_HI.ankhPriest = 'ankhPriestHi';       ctx.MOB_DISPLAY.ankhPriest = 50;
      ctx.MOB_HI.sandstoneGolem = 'sandstoneGolemHi'; ctx.MOB_DISPLAY.sandstoneGolem = 60;
      ctx.MOB_HI.jackalRunner = 'jackalRunnerHi';   ctx.MOB_DISPLAY.jackalRunner = 52;
      ctx.MOB_HI.apepSpawn = 'apepSpawnHi';         ctx.MOB_DISPLAY.apepSpawn = 58;
      ctx.MOB_HI.tombWeaver = 'tombWeaverHi';       ctx.MOB_DISPLAY.tombWeaver = 54;
      // ---- boss: BOTH forms (child ~120 display, executioner ~160) ----
      ctx.spr('neferukaHi', 96, 96, drawChildKing);
      ctx.spr('executionerHi', 96, 96, drawExecutioner);
      ctx.BOSS_HI.neferuka = { key: 'neferukaHi', size: 96, display: 120, bodyW: 40, bodyH: 44 };
      // ---- decor (ALL 20) ----
      ctx.spr('pyObelisk', 64, 64, drawObelisk);
      ctx.spr('pySarco', 64, 64, drawSarcophagus);
      ctx.spr('pyCanopic', 64, 64, drawCanopicSet);
      ctx.spr('pyTreasure', 64, 64, drawTreasurePile);
      ctx.spr('pyChest', 64, 64, drawGildedChest);
      ctx.spr('pyBrazier', 64, 64, drawBrazier);
      ctx.spr('pyColossus', 64, 64, drawPharaohColossus);
      ctx.spr('pyAnubis', 64, 64, drawAnubisStatue);
      ctx.spr('pyColumn', 64, 64, drawPapyrusColumn);
      ctx.spr('pyGlyphWall', 64, 64, drawGlyphWall);
      ctx.spr('pySphinx', 64, 64, drawSphinx);
      ctx.spr('pyPalms', 64, 64, drawPalmCluster);
      ctx.spr('pyOasis', 64, 64, drawOasisPool);
      ctx.spr('pyCamp', 64, 64, drawRaiderCamp);
      ctx.spr('pyDune', 64, 64, drawDuneDrift);
      ctx.spr('pyFallen', 64, 64, drawFallenColossus);
      ctx.spr('pyTrap', 64, 64, drawTrapPlate);
      ctx.spr('pyScales', 64, 64, drawScales);
      ctx.spr('pyCart', 64, 64, drawPlunderCart);
      ctx.spr('pyUrns', 64, 64, drawUrnCluster);
      // ---- tiles ----
      ctx.tex('pydesert', 48, 48, drawDesert);
      ctx.tex('pybrick', 48, 48, drawBrick);
      ctx.tex('pycauseway', 48, 48, drawCauseway);
      ctx.tex('pytombdark', 48, 48, drawTombDark);
      ctx.tex('pyroyal', 48, 48, drawRoyal);
      ctx.tex('pylapis', 48, 48, drawLapisHall);
      ctx.tex('pyquicksand', 48, 48, drawQuicksand);
      ctx.tex('pyseal', 48, 48, drawObsidianSeal);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PYR_ART;
  root.PYRAMID_ART = PYR_ART;
})(typeof window !== 'undefined' ? window : this);
