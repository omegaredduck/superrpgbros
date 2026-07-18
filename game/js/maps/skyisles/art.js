// ============================================================================
// game/js/maps/skyisles/art.js — STORM SKY ISLES (realm 5) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #2 4 8 9 11 15 16 19,
// NIMBUS TALON (render_sky_boss_final.js — the canon), decor #1–19 (NOT #20),
// tiles #1 2 3 5 10 + MIST VEIL sea (sea sheet #4). Same pure pixel-plotting
// contract as world_art.js; reuses ranger_art primitives. buildInto(ctx) is
// called from the registry's buildArt hook with the SAME helpers core mobs
// use (spr/tex + MOB_HI/MOB_DISPLAY/BOSS_HI tables).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- storm-sky palette (sky_kit.js K, verbatim) --------------------------
  var K = {
    OUT: '#141620',
    cloud: '#dfe6f4', cloudLt: '#ffffff', cloudMd: '#b4bfda', cloudDk: '#8591b8', cloudDkk: '#5a6590',
    thunder: '#6a6f9e', thunderDk: '#474b74', thunderDkk: '#2e3152',
    stone: '#9aa3b8', stoneLt: '#c9d0e0', stoneDk: '#5f6880', stoneDkk: '#3a4158',
    marble: '#e8e4d8', marbleLt: '#fffdf2', marbleDk: '#b3ac96', marbleDkk: '#7c7663',
    volt: '#ffe95a', voltLt: '#fffbc8', voltDk: '#d6a520', voltCore: '#ffffff',
    sky: '#7fd4ff', skyLt: '#d9f4ff', skyDk: '#3a7fc2', skyDkk: '#1f4f86',
    wind: '#bfeee6', windDk: '#6fb8ac',
    feather: '#4a6cc2', featherLt: '#8fb0f0', featherDk: '#2c447e', featherDkk: '#1a2a52',
    indigo: '#4a4f86', indigoLt: '#7d82c2', indigoDk: '#2c2f56',
    purple: '#8a63d6', purpleLt: '#c8aaff', purpleDk: '#54348e',
    wood: '#a9764a', woodLt: '#d6a26e', woodDk: '#6d4426', woodDkk: '#452a16',
    rope: '#c9a86a', ropeDk: '#8a6c3a',
    brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
    copper: '#e08b4c', copperLt: '#ffbf8a', copperDk: '#9c5222',
    iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a',
    red: '#ff4b3e', redLt: '#ffb0a0', redDk: '#9e2422',
    gold: '#ffcd45', goldLt: '#ffedb0', goldDk: '#b07d1e',
    white: '#f4f4f4', grass: '#63b04f', grassLt: '#9ade7a', grassDk: '#3a7434', grassDkk: '#245222',
    dirt: '#8a6a48', dirtDk: '#5c4530',
    oil: '#101119',
    skin: '#e8b796', skinDk: '#c68a63'
  };

  // ---- shared shape helpers (sky_kit.js, factory_kit lineage) --------------
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      row(put, y, x0, x1, function (tx) {
        var b = mix(hi, base, clamp(vt * 1.15, 0, 1));
        b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
        if (tx < 0.13) b = mix(b, hi, 0.55);
        if (tx > 0.9) b = mix(b, dk, 0.5);
        return b;
      });
    }
  }
  function dome(put, cx, cy, rx, ry, base, hi, dk) {
    ell(put, cx, cy, rx, ry, function (tx, ty) {
      var b = mix(hi, base, clamp(ty * 1.25, 0, 1));
      b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
      if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
      if (tx > 0.82) b = mix(b, dk, 0.4);
      return b;
    });
  }
  function bolt(put, x, y, r, c, cdk) {
    ell(put, x, y, r, r, function (tx, ty) { return mix(c || K.stone, cdk || K.stoneDkk, 0.25 + ty * 0.6); });
    put(Math.round(x), Math.round(y), cdk || K.stoneDkk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null); });
    ell(put, cx, cy, r * 1.12, r * 1.12, function () { return c; });
    ell(put, cx, cy, r * 0.66, r * 0.66, function () { return cLt; });
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, function () { return K.oil; }); }
  function cloudBlob(put, cx, cy, r, base, hi, dk) {
    var L = [[-0.72, 0.18, 0.52], [0.72, 0.18, 0.52], [-0.34, -0.26, 0.58], [0.36, -0.24, 0.6], [0, 0.06, 0.82]];
    L.forEach(function (o) { dome(put, cx + o[0] * r, cy + o[1] * r, r * o[2], r * o[2] * 0.78, base, hi, dk); });
  }
  function zig(put, x0, y0, x1, y1, w, c, cLt) {
    var dx = x1 - x0, dy = y1 - y0;
    var ax = x0 + dx * 0.38 + dy * 0.14, ay = y0 + dy * 0.38 - dx * 0.14;
    var bx = x0 + dx * 0.66 - dy * 0.14, by = y0 + dy * 0.66 + dx * 0.14;
    [[x0, y0, ax, ay], [ax, ay, bx, by], [bx, by, x1, y1]].forEach(function (s) {
      stroke(put, s[0], s[1], s[2], s[3], w, function () { return c; });
      stroke(put, s[0], s[1], s[2], s[3], Math.max(1, w * 0.4), function () { return cLt || K.voltCore; });
    });
  }
  function wing(put, cx, cy, len, sweep, side, base, lt, dk) {
    var tipX = cx + side * len, tipY = cy - sweep;
    ell(put, cx + side * len * 0.42, cy - sweep * 0.5, len * 0.5, len * 0.24, function (tx, ty) { return mix(lt, base, clamp(ty * 1.3, 0, 1)); });
    var N = 5;
    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);
      var fx = lerp(cx + side * len * 0.2, tipX, t), fy = lerp(cy - sweep * 0.2, tipY, t);
      stroke(put, fx, fy, fx + side * len * 0.16, fy + len * 0.3 + t * len * 0.12, Math.max(2, len * 0.09),
        function (tt) { return mix(base, dk, 0.3 + tt * 0.7); });
    }
  }
  function gust(put, cx, cy, r, c) {
    for (var a = -0.4; a < 2.6; a += 0.18) {
      var rr = r * (0.55 + a * 0.16);
      put(Math.round(cx + Math.cos(a) * rr), Math.round(cy - Math.sin(a) * rr * 0.6), c);
      put(Math.round(cx + Math.cos(a) * rr) + 1, Math.round(cy - Math.sin(a) * rr * 0.6), c);
    }
  }
  // heavier zigzag for the boss: dark halo -> thick volt -> white-hot core
  function boltZig(put, x0, y0, x1, y1, w) {
    var dx = x1 - x0, dy = y1 - y0;
    var ax = x0 + dx * 0.36 + dy * 0.16, ay = y0 + dy * 0.36 - dx * 0.16;
    var bx = x0 + dx * 0.68 - dy * 0.16, by = y0 + dy * 0.68 + dx * 0.16;
    var segs = [[x0, y0, ax, ay], [ax, ay, bx, by], [bx, by, x1, y1]];
    segs.forEach(function (s) { stroke(put, s[0], s[1], s[2], s[3], w * 1.9, function () { return K.voltDk; }); });
    segs.forEach(function (s) { stroke(put, s[0], s[1], s[2], s[3], w, function () { return K.volt; }); });
    segs.forEach(function (s) { stroke(put, s[0], s[1], s[2], s[3], Math.max(1, w * 0.45), function () { return K.voltCore; }); });
  }
  // deterministic hash noise (tiles)
  function h2(x, y, s) { var n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (Red's picks #2 4 8 9 11 15 16 19) =========
  // 2 · STORM SPRITE — crackling lightning imp; fast chaser.
  function drawStormSprite(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    zig(put, cx - S * 0.28, cy - S * 0.1, cx - S * 0.16, cy + S * 0.12, 2, K.volt, K.voltLt);
    zig(put, cx + S * 0.28, cy - S * 0.14, cx + S * 0.18, cy + S * 0.1, 2, K.volt, K.voltLt);
    dome(put, cx, cy + S * 0.05, S * 0.16, S * 0.15, K.thunder, K.cloudMd, K.thunderDkk);
    [[-0.12, -0.3], [0, -0.36], [0.12, -0.3]].forEach(function (o) {
      stroke(put, cx + o[0] * S * 0.5, cy - S * 0.08, cx + o[0] * S, cy + o[1] * S * 0.5, S * 0.035, function (t) { return mix(K.volt, K.voltDk, t); });
    });
    dome(put, cx, cy - S * 0.12, S * 0.12, S * 0.11, K.thunder, K.cloud, K.thunderDk);
    [-1, 1].forEach(function (s) { optic(put, cx + s * S * 0.055, cy - S * 0.14, S * 0.032, K.voltDk, K.volt, K.voltLt); });
    stroke(put, cx - S * 0.06, cy - S * 0.06, cx + S * 0.06, cy - S * 0.06, 2, function () { return K.voltLt; });
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.14, cy + S * 0.02, cx + s * S * 0.26, cy - S * 0.04, S * 0.03, function () { return K.thunderDk; });
      ell(put, cx + s * S * 0.27, cy - S * 0.05, S * 0.03, S * 0.03, function () { return K.voltLt; });
    });
  }

  // 4 · CLOUD RAY — drifting manta of cloudstuff; floats over walls/mist.
  function drawCloudRay(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    ell(put, cx, cy, S * 0.34, S * 0.17, function (tx, ty) {
      var b = mix(K.cloudLt, K.cloudMd, clamp(ty * 1.35, 0, 1));
      if (tx < 0.16 || tx > 0.84) b = mix(b, K.cloudDk, 0.5);
      return b;
    });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.3, cy - S * 0.02, cx + s * S * 0.4, cy - S * 0.1, S * 0.04, function (t) { return mix(K.cloudMd, K.cloudDk, t); }); });
    stroke(put, cx, cy + S * 0.12, cx - S * 0.1, cy + S * 0.3, S * 0.03, function (t) { return mix(K.cloudMd, K.cloudDkk, t); });
    stroke(put, cx - S * 0.1, cy + S * 0.3, cx - S * 0.04, cy + S * 0.38, 2, function () { return K.cloudDkk; });
    [-0.1, 0, 0.1].forEach(function (o) { row(put, Math.round(cy + S * 0.06), cx + (o - 0.14) * S, cx + (o + 0.14) * S, function () { return K.cloudDk; }); });
    [-1, 1].forEach(function (s) { optic(put, cx + s * S * 0.1, cy - S * 0.06, S * 0.035, K.skyDkk, K.sky, K.skyLt); });
    [[-0.18, -0.1], [0.14, -0.12], [0.02, -0.02]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(cy + o[1] * S), K.voltLt); });
  }

  // 8 · GRIFFIN CUB — young sky-lion; sturdy melee chaser (lunge).
  function drawGriffinCub(put, S) {
    var cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.2);
    wing(put, cx - S * 0.02, cy - S * 0.1, S * 0.22, S * 0.1, -1, K.cloudMd, K.cloudLt, K.cloudDkk);
    ell(put, cx + S * 0.02, cy + S * 0.08, S * 0.19, S * 0.13, function (tx, ty) { return mix(K.gold, K.goldDk, clamp(ty * 1.2, 0, 1)); });
    ell(put, cx + S * 0.14, cy + S * 0.12, S * 0.08, S * 0.08, function (tx, ty) { return mix(K.goldLt, K.goldDk, ty); });
    [-0.1, 0.02, 0.14].forEach(function (o) { stroke(put, cx + o * S, cy + S * 0.16, cx + o * S, cy + S * 0.28, S * 0.035, function () { return K.goldDk; }); });
    stroke(put, cx + S * 0.2, cy + S * 0.04, cx + S * 0.32, cy - S * 0.06, S * 0.025, function () { return K.goldDk; });
    ell(put, cx + S * 0.33, cy - S * 0.07, S * 0.03, S * 0.03, function () { return K.featherDk; });
    ell(put, cx - S * 0.12, cy - S * 0.02, S * 0.1, S * 0.08, function (tx, ty) { return mix('#ffffff', K.cloudMd, ty); });
    dome(put, cx - S * 0.15, cy - S * 0.12, S * 0.11, S * 0.1, K.cloudLt, '#ffffff', K.cloudMd);
    stroke(put, cx - S * 0.24, cy - S * 0.13, cx - S * 0.32, cy - S * 0.1, S * 0.05, function () { return K.brass; });
    stroke(put, cx - S * 0.31, cy - S * 0.09, cx - S * 0.33, cy - S * 0.05, S * 0.03, function () { return K.brassDk; });
    stroke(put, cx - S * 0.22, cy - S * 0.17, cx - S * 0.1, cy - S * 0.16, 3, function () { return K.featherDk; });
    optic(put, cx - S * 0.16, cy - S * 0.13, S * 0.033, K.skyDkk, K.sky, K.skyLt);
    [[-0.2, -0.2], [-0.12, -0.22]].forEach(function (o) { stroke(put, cx + o[0] * S, cy + o[1] * S, cx + o[0] * S + S * 0.02, cy + o[1] * S - S * 0.05, 2, function () { return '#ffffff'; }); });
  }

  // 9 · NIMBUS GOLEM — thundercloud giant, storm-crystal heart; tank (shove).
  function drawNimbusGolem(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(function (s) { dome(put, cx + s * S * 0.12, cy + S * 0.26, S * 0.09, S * 0.12, K.thunder, K.cloudMd, K.thunderDkk); });
    cloudBlob(put, cx, cy + S * 0.02, S * 0.24, K.thunder, K.cloud, K.thunderDkk);
    [-1, 1].forEach(function (s) { dome(put, cx + s * S * 0.22, cy - S * 0.12, S * 0.1, S * 0.09, K.stone, K.stoneLt, K.stoneDkk); });
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.24, cy - S * 0.06, cx + s * S * 0.3, cy + S * 0.14, S * 0.05, function () { return K.thunderDk; });
      dome(put, cx + s * S * 0.31, cy + S * 0.18, S * 0.08, S * 0.07, K.stone, K.stoneLt, K.stoneDkk);
    });
    ell(put, cx, cy + S * 0.02, S * 0.08, S * 0.09, function () { return K.thunderDkk; });
    [[0, -0.05], [-0.035, 0.02], [0.035, 0.02], [0, 0.06]].forEach(function (o) {
      ell(put, cx + o[0] * S, cy + S * 0.02 + o[1] * S, S * 0.025, S * 0.035, function (tx, ty) { return mix(K.voltLt, K.volt, ty); });
    });
    [-1, 1].forEach(function (s) { optic(put, cx + s * S * 0.07, cy - S * 0.14, S * 0.03, K.voltDk, K.volt, K.voltLt); });
    stroke(put, cx - S * 0.11, cy - S * 0.19, cx + S * 0.11, cy - S * 0.19, 3, function () { return K.thunderDkk; });
  }

  // 11 · WIND WARDEN — cherub-knight; shields nearby mobs (guardAura).
  function drawWindWarden(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    ell(put, cx, cy, S * 0.36, S * 0.36, function (tx, ty) {
      var d = (tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5);
      return d > 0.2 && d <= 0.25 && ty < 0.55 ? K.wind : null;
    });
    plate(put, cx - S * 0.11, cy - S * 0.02, cx + S * 0.11, cy + S * 0.16, K.marble, K.marbleLt, K.marbleDk);
    row(put, Math.round(cy + S * 0.06), cx - S * 0.11, cx + S * 0.11, function () { return K.brass; });
    wing(put, cx - S * 0.1, cy - S * 0.02, S * 0.18, S * 0.12, -1, K.cloudLt, '#ffffff', K.cloudDk);
    wing(put, cx + S * 0.1, cy - S * 0.02, S * 0.18, S * 0.12, 1, K.cloudLt, '#ffffff', K.cloudDk);
    dome(put, cx, cy - S * 0.12, S * 0.09, S * 0.08, K.brass, K.brassLt, K.brassDk);
    plate(put, cx - S * 0.06, cy - S * 0.13, cx + S * 0.06, cy - S * 0.08, K.ironDk, K.iron, K.ironDkk);
    [-1, 1].forEach(function (s) { put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.105), K.skyLt); });
    stroke(put, cx + S * 0.08, cy - S * 0.06, cx + S * 0.22, cy - S * 0.12, S * 0.04, function (t) { return mix(K.gold, K.goldDk, 1 - t); });
    ell(put, cx + S * 0.23, cy - S * 0.13, S * 0.035, S * 0.045, function () { return K.goldLt; });
  }

  // 15 · STORMVANE — possessed weathervane totem; rooted turret.
  function drawStormvane(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    plate(put, cx - S * 0.12, cy + S * 0.18, cx + S * 0.12, cy + S * 0.32, K.stone, K.stoneLt, K.stoneDkk);
    plate(put, cx - S * 0.08, cy + S * 0.02, cx + S * 0.08, cy + S * 0.18, K.stoneDk, K.stone, K.stoneDkk);
    stroke(put, cx, cy - S * 0.3, cx, cy + S * 0.04, S * 0.03, function () { return K.ironDk; });
    stroke(put, cx - S * 0.2, cy - S * 0.1, cx + S * 0.2, cy - S * 0.1, S * 0.02, function () { return K.iron; });
    [-0.24, 0.22].forEach(function (o) { plate(put, cx + o * S, cy - S * 0.13, cx + o * S + S * 0.05, cy - S * 0.07, K.brass, K.brassLt, K.brassDk); });
    stroke(put, cx - S * 0.1, cy - S * 0.3, cx + S * 0.12, cy - S * 0.3, S * 0.04, function () { return K.copper; });
    stroke(put, cx + S * 0.12, cy - S * 0.3, cx + S * 0.18, cy - S * 0.36, S * 0.03, function () { return K.copperDk; });
    stroke(put, cx - S * 0.1, cy - S * 0.3, cx - S * 0.16, cy - S * 0.24, S * 0.03, function () { return K.copperDk; });
    optic(put, cx + S * 0.13, cy - S * 0.32, S * 0.025, K.redDk, K.red, K.redLt);
    ell(put, cx, cy - S * 0.02, S * 0.24, S * 0.1, function (tx, ty) {
      var d = (tx - 0.5) * (tx - 0.5) / 0.25 + (ty - 0.5) * (ty - 0.5) / 0.25;
      return d > 0.6 && d <= 1 ? K.volt : null;
    });
    [[-0.24, -0.02], [0.24, -0.02]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(cy + o[1] * S), K.voltLt); });
  }

  // 16 · RAIN SHEPHERD — gentle cloud-herder; heals mobs with rain (mend).
  function drawRainShepherd(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    cloudBlob(put, cx + S * 0.2, cy - S * 0.26, S * 0.1, K.cloud, K.cloudLt, K.cloudDk);
    [[-0.03, 0], [0.04, 0.02], [0.005, 0.05]].forEach(function (o) {
      stroke(put, cx + S * 0.2 + o[0] * S * 3, cy - S * 0.18 + o[1] * S * 3, cx + S * 0.2 + o[0] * S * 3, cy - S * 0.14 + o[1] * S * 3, 1, function () { return K.sky; });
    });
    dome(put, cx, cy + S * 0.06, S * 0.16, S * 0.16, K.grass, K.grassLt, K.grassDkk);
    plate(put, cx - S * 0.16, cy + S * 0.02, cx + S * 0.16, cy + S * 0.08, K.marble, K.marbleLt, K.marbleDk);
    cloudBlob(put, cx, cy - S * 0.12, S * 0.11, K.cloud, K.cloudLt, K.cloudDk);
    [-1, 1].forEach(function (s) { put(Math.round(cx + s * S * 0.045), Math.round(cy - S * 0.12), K.thunderDkk); });
    stroke(put, cx - S * 0.02, cy - S * 0.07, cx + S * 0.02, cy - S * 0.07, 1, function () { return K.thunderDk; });
    stroke(put, cx - S * 0.18, cy + S * 0.22, cx - S * 0.18, cy - S * 0.2, S * 0.02, function () { return K.wood; });
    for (var a = 3.2; a < 5.8; a += 0.2) put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.05), Math.round(cy - S * 0.2 + Math.sin(a) * S * 0.05 + S * 0.05), K.woodLt);
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.07, cy + S * 0.24, S * 0.04, S * 0.025, function () { return K.grassDkk; }); });
  }

  // 19 · ROC HATCHLING — oversized storm chick; belly-flop burster.
  function drawRocHatchling(put, S) {
    var cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.22);
    dome(put, cx, cy + S * 0.02, S * 0.21, S * 0.2, K.feather, K.featherLt, K.featherDkk);
    for (var i = 0; i < 14; i++) {
      var a = i * 0.45, rr = S * 0.19;
      put(Math.round(cx + Math.cos(a) * rr * 0.8), Math.round(cy + S * 0.02 + Math.sin(a) * rr * 0.7), K.featherLt);
    }
    [-1, 1].forEach(function (s) { ell(put, cx + s * S * 0.23, cy - S * 0.02, S * 0.07, S * 0.1, function (tx, ty) { return mix(K.featherLt, K.featherDk, ty); }); });
    dome(put, cx, cy - S * 0.16, S * 0.13, S * 0.11, K.feather, K.featherLt, K.featherDk);
    ell(put, cx, cy - S * 0.24, S * 0.11, S * 0.06, function (tx, ty) { return mix(K.marbleLt, K.marbleDk, ty); });
    for (var i2 = -2; i2 <= 2; i2++) stroke(put, cx + i2 * S * 0.045, cy - S * 0.2, cx + i2 * S * 0.045 + S * 0.015, cy - S * 0.17, 1, function () { return K.marbleDkk; });
    [-1, 1].forEach(function (s) { optic(put, cx + s * S * 0.055, cy - S * 0.15, S * 0.04, K.voltDk, K.volt, K.voltLt); });
    stroke(put, cx - S * 0.015, cy - S * 0.09, cx + S * 0.015, cy - S * 0.09, 2, function () { return K.brass; });
    put(Math.round(cx), Math.round(cy - S * 0.08), K.brassDk);
    [-1, 1].forEach(function (s) { [-1, 0, 1].forEach(function (k) {
      stroke(put, cx + s * S * 0.08, cy + S * 0.2, cx + s * S * 0.08 + k * S * 0.03, cy + S * 0.26, 2, function () { return K.gold; });
    }); });
    [[-0.3, 0.18], [0.32, 0.14]].forEach(function (o) {
      var px = Math.round(cx + o[0] * S), py = Math.round(cy + o[1] * S);
      put(px, py, K.goldLt); put(px + 2, py, K.goldLt); put(px - 2, py, K.goldLt); put(px, py + 2, K.goldLt); put(px, py - 2, K.goldLt);
    });
  }

  // ================== BOSS — NIMBUS TALON (canon: sky_boss_final) ===========
  function drawNimbusTalon(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    ell(put, cx, S * 0.93, S * 0.26, S * 0.04, function () { return K.oil; });
    cloudBlob(put, cx - S * 0.25, cy - S * 0.06, S * 0.18, K.cloudMd, K.cloudLt, K.thunderDk);
    cloudBlob(put, cx + S * 0.25, cy - S * 0.06, S * 0.18, K.cloudMd, K.cloudLt, K.thunderDk);
    cloudBlob(put, cx, cy + S * 0.02, S * 0.21, K.thunder, K.cloud, K.thunderDkk);
    // THE LIGHTNING SKELETON (pronounced; none leaves the silhouette — Red)
    boltZig(put, cx, cy - S * 0.16, cx, cy + S * 0.14, S * 0.02);
    boltZig(put, cx - S * 0.01, cy - S * 0.04, cx - S * 0.13, cy + S * 0.04, S * 0.013);
    boltZig(put, cx + S * 0.01, cy - S * 0.02, cx + S * 0.13, cy + S * 0.07, S * 0.013);
    boltZig(put, cx - S * 0.08, cy - S * 0.1, cx - S * 0.4, cy - S * 0.1, S * 0.018);
    boltZig(put, cx + S * 0.08, cy - S * 0.1, cx + S * 0.4, cy - S * 0.1, S * 0.018);
    for (var i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.05, cy + S * 0.18, cx + i * S * 0.05 - S * 0.015, cy + S * 0.27, 1, function () { return K.sky; });
    cloudBlob(put, cx, cy - S * 0.21, S * 0.115, K.cloudMd, K.cloudLt, K.thunderDk);
    stroke(put, cx, cy - S * 0.15, cx + S * 0.02, cy - S * 0.06, S * 0.04, function (t) { return mix(K.cloudLt, K.cloudDk, t); });
    [-1, 1].forEach(function (s) { optic(put, cx + s * S * 0.05, cy - S * 0.23, S * 0.034, K.voltDk, K.volt, K.voltLt); });
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.08, cy + S * 0.16, cx + s * S * 0.1, cy + S * 0.31, S * 0.032, function () { return K.goldDk; });
      [-1, 0, 1].forEach(function (k) { stroke(put, cx + s * S * 0.1, cy + S * 0.31, cx + s * S * 0.1 + k * S * 0.038, cy + S * 0.38, 3, function () { return K.gold; }); });
      boltZig(put, cx + s * S * 0.05, cy + S * 0.355, cx + s * S * 0.16, cy + S * 0.345, S * 0.012);
    });
    [[-0.3, -0.18], [0.32, -0.16], [-0.16, 0.14], [0.18, 0.12]].forEach(function (o) {
      var px = Math.round(cx + o[0] * S), py = Math.round(cy + o[1] * S);
      put(px, py, K.voltCore); put(px + 2, py, K.voltLt); put(px - 2, py, K.voltLt); put(px, py + 2, K.voltLt); put(px, py - 2, K.voltLt);
    });
  }

  // ======================= DECOR (#1–19; #20 CUT by Red) ====================
  function drawRopeBridge(put, S) {
    var cy = S * 0.55;
    [-0.16, 0.14].forEach(function (o) {
      for (var x = S * 0.06; x < S * 0.94; x += 2) {
        var t = (x - S * 0.06) / (S * 0.88);
        var sag = Math.sin(t * Math.PI) * S * 0.05;
        put(Math.round(x), Math.round(cy + o * S + sag - S * 0.14), K.rope);
      }
    });
    for (var x2 = S * 0.08; x2 < S * 0.9; x2 += S * 0.085) {
      var t2 = (x2 - S * 0.06) / (S * 0.88), sag2 = Math.sin(t2 * Math.PI) * S * 0.05;
      plate(put, x2, cy - S * 0.1 + sag2, x2 + S * 0.06, cy + S * 0.12 + sag2, K.wood, K.woodLt, K.woodDkk);
    }
    for (var x3 = S * 0.1; x3 < S * 0.9; x3 += S * 0.17) {
      var t3 = (x3 - S * 0.06) / (S * 0.88), sag3 = Math.sin(t3 * Math.PI) * S * 0.05;
      stroke(put, x3, cy - S * 0.3 + sag3 * 0.4, x3, cy - S * 0.1 + sag3, 1, function () { return K.ropeDk; });
    }
    [-0.44, 0.42].forEach(function (o) { plate(put, S * 0.5 + o * S, cy - S * 0.32, S * 0.5 + o * S + S * 0.05, cy + S * 0.14, K.woodDk, K.wood, K.woodDkk); });
  }
  function drawCloudBank(put, S) {
    cloudBlob(put, S * 0.5, S * 0.58, S * 0.3, K.cloud, K.cloudLt, K.cloudDk);
    cloudBlob(put, S * 0.26, S * 0.66, S * 0.16, K.cloudLt, '#ffffff', K.cloudMd);
    cloudBlob(put, S * 0.74, S * 0.64, S * 0.14, K.cloudMd, K.cloud, K.cloudDkk);
    [[0.3, 0.44], [0.62, 0.4], [0.5, 0.56]].forEach(function (o) { put(Math.round(o[0] * S), Math.round(o[1] * S), '#ffffff'); });
  }
  function drawRuinedColumn(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.14, S * 0.78, cx + S * 0.14, S * 0.88, K.marble, K.marbleLt, K.marbleDkk);
    for (var y = S * 0.3; y < S * 0.78; y++) {
      row(put, Math.round(y), cx - S * 0.1, cx + S * 0.1, function (tx) {
        var f = Math.sin(tx * Math.PI * 3.2);
        var b = mix(K.marbleLt, K.marble, 0.5 + f * 0.5);
        if (tx > 0.85) b = K.marbleDk;
        return b;
      });
    }
    for (var x = -0.1; x < 0.1; x += 0.02) {
      var h = S * (0.3 - Math.abs(Math.sin(x * 60)) * 0.06);
      for (var y2 = h; y2 < S * 0.32; y2++) put(Math.round(cx + x * S), Math.round(y2), K.marbleDk);
    }
    dome(put, cx + S * 0.24, S * 0.84, S * 0.08, S * 0.05, K.marble, K.marbleLt, K.marbleDkk);
    stroke(put, cx - S * 0.08, S * 0.78, cx - S * 0.02, S * 0.44, 2, function () { return K.grassDk; });
    [[-0.06, 0.66], [-0.04, 0.55], [-0.02, 0.47]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(o[1] * S), K.voltLt); });
  }
  function drawTempleArch(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    [-1, 1].forEach(function (s) { plate(put, cx + s * S * 0.3 - S * 0.07, S * 0.36, cx + s * S * 0.3 + S * 0.07, S * 0.88, K.marble, K.marbleLt, K.marbleDkk); });
    for (var a = 0.15; a < Math.PI - 0.15; a += 0.05) {
      var x = cx - Math.cos(a) * S * 0.3, y = S * 0.36 - Math.sin(a) * S * 0.14;
      if (x < cx + S * 0.12) ell(put, x, y, S * 0.05, S * 0.05, function (tx, ty) { return mix(K.marbleLt, K.marbleDk, ty); });
    }
    plate(put, cx - S * 0.05, S * 0.18, cx + S * 0.05, S * 0.28, K.stone, K.stoneLt, K.stoneDkk);
    put(Math.round(cx), Math.round(S * 0.23), K.voltLt);
    zig(put, cx - S * 0.02, S * 0.2, cx + S * 0.02, S * 0.26, 1, K.volt, K.voltLt);
    [[0.16, 0.84], [0.24, 0.86], [0.2, 0.8]].forEach(function (o) { dome(put, cx + o[0] * S, o[1] * S, S * 0.05, S * 0.035, K.marble, K.marbleLt, K.marbleDkk); });
  }
  // windmill split for animation: TOWER (static) + SAILS (scene spins them)
  function drawWindmillTower(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    for (var y = S * 0.34; y < S * 0.88; y++) {
      var t = (y - S * 0.34) / (S * 0.54), w = S * (0.1 + t * 0.1);
      row(put, Math.round(y), cx - w, cx + w, function (tx) {
        var b = mix(K.stoneLt, K.stone, clamp(t * 1.1, 0, 1));
        if (tx < 0.15) b = mix(b, K.marbleLt, 0.4);
        if (tx > 0.85) b = mix(b, K.stoneDkk, 0.5);
        return b;
      });
    }
    dome(put, cx, S * 0.84, S * 0.05, S * 0.07, K.woodDk, K.wood, K.woodDkk);
    ell(put, cx, S * 0.5, S * 0.035, S * 0.04, function () { return K.skyDkk; });
    put(Math.round(cx - 1), Math.round(S * 0.49), K.voltLt);
    dome(put, cx, S * 0.32, S * 0.13, S * 0.08, K.red, K.redLt, K.redDk);
    bolt(put, cx, S * 0.32, S * 0.025, K.brass, K.brassDk);
  }
  function drawWindmillSails(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (o) {
      var sx = o[0], sy = o[1];
      stroke(put, cx, cy, cx + sx * S * 0.42, cy + sy * S * 0.4, S * 0.03, function () { return K.woodDk; });
      for (var t = 0.25; t < 1; t += 0.22)
        stroke(put, cx + sx * S * 0.42 * t, cy + sy * S * 0.4 * t,
          cx + sx * S * 0.42 * t - sy * S * 0.08, cy + sy * S * 0.4 * t + sx * S * 0.08, S * 0.04, function () { return K.marbleLt; });
    });
    bolt(put, cx, cy, S * 0.04, K.brass, K.brassDk);
  }
  function drawStormLantern(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    stroke(put, cx, S * 0.3, cx, S * 0.88, S * 0.03, function () { return K.ironDk; });
    plate(put, cx - S * 0.08, S * 0.86, cx + S * 0.08, S * 0.9, K.iron, K.stoneLt, K.ironDkk);
    stroke(put, cx, S * 0.3, cx + S * 0.14, S * 0.26, S * 0.02, function () { return K.ironDk; });
    var lx = cx + S * 0.16, ly = S * 0.34;
    dome(put, lx, ly, S * 0.08, S * 0.09, K.iron, K.stoneLt, K.ironDkk);
    ell(put, lx, ly, S * 0.055, S * 0.065, function (tx, ty) { return mix(K.voltLt, K.voltDk, Math.abs(ty - 0.5) * 1.6); });
    ell(put, lx, ly, S * 0.025, S * 0.03, function () { return '#ffffff'; });
    [-1, 1].forEach(function (s) { stroke(put, lx + s * S * 0.04, ly - S * 0.07, lx + s * S * 0.04, ly + S * 0.07, 1, function () { return K.ironDkk; }); });
    put(Math.round(lx), Math.round(ly - S * 0.11), K.iron);
    [[0.1, -0.02], [-0.1, -0.02], [0, 0.12], [0, -0.15]].forEach(function (o) { put(Math.round(lx + o[0] * S), Math.round(ly + o[1] * S), K.voltLt); });
  }
  function drawLightningRod(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    plate(put, cx - S * 0.1, S * 0.78, cx + S * 0.1, S * 0.9, K.stone, K.stoneLt, K.stoneDkk);
    stroke(put, cx, S * 0.14, cx, S * 0.8, S * 0.028, function () { return K.copper; });
    [0.3, 0.45, 0.6].forEach(function (yy) { ell(put, cx, S * yy, S * 0.045, S * 0.02, function (tx, ty) { return mix(K.copperLt, K.copperDk, ty); }); });
    ell(put, cx, S * 0.12, S * 0.04, S * 0.04, function (tx, ty) { return mix(K.voltLt, K.copperLt, ty); });
    zig(put, cx + S * 0.16, 0, cx + S * 0.01, S * 0.1, 3, K.volt, K.voltLt);
    zig(put, cx - S * 0.05, S * 0.44, cx - S * 0.12, S * 0.52, 1, K.volt, K.voltLt);
  }
  function drawWindChimes(put, S) {
    var cx = S * 0.5;
    stroke(put, cx - S * 0.24, S * 0.22, cx + S * 0.24, S * 0.22, S * 0.03, function () { return K.woodDk; });
    [-0.24, 0.24].forEach(function (o) { stroke(put, cx + o * S, S * 0.22, cx + o * S, S * 0.34, S * 0.025, function () { return K.wood; }); });
    [-0.15, -0.05, 0.05, 0.15].forEach(function (o, i) {
      var drift = S * 0.03 * (i - 1.5) * 0.4 + S * 0.04;
      var len = S * (0.26 + (i % 2) * 0.08);
      stroke(put, cx + o * S, S * 0.24, cx + o * S + drift, S * 0.24 + len, 1, function () { return K.ropeDk; });
      plate(put, cx + o * S + drift - S * 0.02, S * 0.24 + len, cx + o * S + drift + S * 0.02, S * 0.24 + len + S * 0.14, K.brass, K.brassLt, K.brassDk);
    });
    ell(put, cx + S * 0.05, S * 0.62, S * 0.03, S * 0.03, function () { return K.woodLt; });
    [0.5, 0.58].forEach(function (yy) { stroke(put, cx + S * 0.24, yy * S, cx + S * 0.38, yy * S - S * 0.02, 1, function () { return K.wind; }); });
    [[0.34, 0.36], [0.4, 0.46]].forEach(function (o) {
      stroke(put, o[0] * S, o[1] * S, o[0] * S, o[1] * S - S * 0.04, 1, function () { return K.marbleLt; });
      ell(put, o[0] * S - S * 0.012, o[1] * S, S * 0.014, S * 0.011, function () { return K.marbleLt; });
    });
  }
  function drawTatteredBanner(put, S) {
    var cx = S * 0.44;
    shadow(put, S, cx + S * 0.04, S * 0.12);
    stroke(put, cx, S * 0.14, cx + S * 0.08, S * 0.88, S * 0.025, function () { return K.woodDk; });
    ell(put, cx, S * 0.12, S * 0.03, S * 0.03, function (tx, ty) { return mix(K.brassLt, K.brassDk, ty); });
    for (var y = 0; y < S * 0.3; y++) {
      var t = y / (S * 0.3);
      var reach = S * (0.34 - 0.1 * Math.abs(Math.sin(t * 9)) * (t > 0.6 ? 1 : 0.2));
      var wave = Math.sin(t * 6) * S * 0.03;
      row(put, Math.round(S * 0.18 + y), cx + S * 0.02, cx + S * 0.02 + reach + wave, function (tx) {
        var b = mix(K.feather, K.featherDk, clamp(t * 1.2, 0, 1));
        if (tx > 0.85) b = mix(b, K.featherDkk, 0.6);
        return b;
      });
    }
    zig(put, cx + S * 0.12, S * 0.22, cx + S * 0.2, S * 0.4, 2, K.gold, K.goldLt);
  }
  function drawSkyBalloon(put, S) {
    var cx = S * 0.5;
    dome(put, cx, S * 0.3, S * 0.2, S * 0.19, K.red, K.redLt, K.redDk);
    [-0.6, -0.2, 0.2, 0.6].forEach(function (o) {
      for (var y = S * 0.13; y < S * 0.47; y++) {
        var t = (y - S * 0.3) / (S * 0.19);
        var w = Math.sqrt(Math.max(0, 1 - t * t));
        put(Math.round(cx + o * S * 0.2 * w * 2.4), Math.round(y), K.redDk);
      }
    });
    ell(put, cx - S * 0.08, S * 0.22, S * 0.05, S * 0.04, function () { return K.redLt; });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.14, S * 0.44, cx + s * S * 0.05, S * 0.6, 1, function () { return K.ropeDk; }); });
    plate(put, cx - S * 0.07, S * 0.6, cx + S * 0.07, S * 0.7, K.wood, K.woodLt, K.woodDkk);
    for (var x = -0.06; x < 0.07; x += 0.026) stroke(put, cx + x * S, S * 0.6, cx + x * S, S * 0.7, 1, function () { return K.woodDk; });
    stroke(put, cx, S * 0.7, cx - S * 0.06, S * 0.9, 1, function () { return K.rope; });
    ell(put, cx - S * 0.07, S * 0.9, S * 0.03, S * 0.015, function () { return K.ironDk; });
  }
  function drawAirshipWreck(put, S) {
    var cx = S * 0.5;
    ell(put, cx - S * 0.2, S * 0.82, S * 0.24, S * 0.08, function (tx, ty) { return mix(K.grassLt, K.grassDkk, ty); });
    for (var i = 0; i < 22; i++) {
      var t = i / 21;
      var hx = lerp(cx - S * 0.26, cx + S * 0.3, t);
      var hy = lerp(S * 0.74, S * 0.38, t);
      var r = S * (0.13 - t * 0.05);
      ell(put, hx, hy, r, r * 0.72, function (tx, ty) {
        var b = mix(K.wood, K.woodDkk, clamp(ty * 1.25, 0, 1));
        if (ty < 0.25) b = mix(b, K.woodLt, 0.5);
        return b;
      });
    }
    [[0.0, 0.6], [0.12, 0.53], [0.22, 0.47]].forEach(function (o) {
      ell(put, cx + o[0] * S, o[1] * S, S * 0.028, S * 0.028, function (tx, ty) { return mix(K.brassLt, K.brassDk, ty); });
      put(Math.round(cx + o[0] * S), Math.round(o[1] * S), K.skyDkk);
    });
    stroke(put, cx - S * 0.1, S * 0.62, cx - S * 0.26, S * 0.3, S * 0.025, function () { return K.woodDk; });
    stroke(put, cx - S * 0.26, S * 0.3, cx - S * 0.05, S * 0.4, 1, function () { return K.rope; });
    for (var y = 0; y < S * 0.12; y++)
      row(put, Math.round(S * 0.3 + y), cx - S * 0.26, cx - S * 0.26 + S * (0.1 - 0.04 * Math.sin(y * 0.8)), function () { return (y % 4 < 2 ? K.marbleLt : K.marbleDk); });
    [[0.3, 0.82], [0.38, 0.86], [-0.38, 0.88]].forEach(function (o) { dome(put, cx + o[0] * S, o[1] * S, S * 0.035, S * 0.02, K.wood, K.woodLt, K.woodDkk); });
  }
  function drawSkyDock(put, S) {
    for (var y = S * 0.55; y < S * 0.9; y++)
      row(put, Math.round(y), S * 0.06, S * 0.3 - (y - S * 0.55) * 0.3, function () { return mix(K.dirt, K.dirtDk, (y - S * 0.55) / (S * 0.35)); });
    row(put, Math.round(S * 0.55), S * 0.06, S * 0.3, function () { return K.grass; });
    row(put, Math.round(S * 0.56), S * 0.06, S * 0.3, function () { return K.grassDk; });
    for (var x = S * 0.26; x < S * 0.88; x += S * 0.075)
      plate(put, x, S * 0.5, x + S * 0.055, S * 0.6, K.wood, K.woodLt, K.woodDkk);
    [0.34, 0.54, 0.74].forEach(function (ox) { stroke(put, ox * S, S * 0.6, ox * S - S * 0.06, S * 0.78, S * 0.02, function () { return K.woodDk; }); });
    plate(put, S * 0.8, S * 0.42, S * 0.85, S * 0.52, K.woodDk, K.wood, K.woodDkk);
    ell(put, S * 0.825, S * 0.44, S * 0.035, S * 0.02, function () { return K.rope; });
    stroke(put, S * 0.85, S * 0.45, S * 0.94, S * 0.36, 1, function () { return K.rope; });
    cloudBlob(put, S * 0.72, S * 0.8, S * 0.09, K.cloud, K.cloudLt, K.cloudDk);
  }
  function drawWindGodStatue(put, S) {
    var cx = S * 0.46;
    shadow(put, S, cx, S * 0.22);
    plate(put, cx - S * 0.16, S * 0.78, cx + S * 0.16, S * 0.9, K.stone, K.stoneLt, K.stoneDkk);
    dome(put, cx, S * 0.62, S * 0.15, S * 0.17, K.marble, K.marbleLt, K.marbleDkk);
    dome(put, cx, S * 0.42, S * 0.1, S * 0.1, K.marble, K.marbleLt, K.marbleDk);
    for (var a = 0; a < 2.6; a += 0.25) put(Math.round(cx + Math.cos(a + 0.6) * S * 0.11), Math.round(S * 0.38 - Math.sin(a + 0.6) * S * 0.07), K.marbleDk);
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.05, S * 0.41, cx + s * S * 0.02, S * 0.41, 1, function () { return K.marbleDkk; }); });
    ell(put, cx - S * 0.03, S * 0.45, S * 0.03, S * 0.02, function () { return K.marbleDk; });
    for (var t = 0; t < 1; t += 0.03) {
      var gx = cx - S * 0.08 - t * S * 0.32, gy = S * 0.45 + Math.sin(t * 9) * S * 0.05 * (1 - t * 0.4);
      ell(put, gx, gy, S * 0.025 * (1 - t * 0.5), S * 0.02 * (1 - t * 0.5), function (tx, ty) { return mix(K.wind, K.windDk, ty + t * 0.3); });
    }
    [[0.1, 0.56], [-0.12, 0.68]].forEach(function (o) { ell(put, cx + o[0] * S, o[1] * S, S * 0.03, S * 0.02, function () { return K.grassDk; }); });
    put(Math.round(cx + S * 0.08), Math.round(S * 0.4), K.stoneDk);
  }
  function drawStormCrystal(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    dome(put, cx, S * 0.82, S * 0.16, S * 0.07, K.stone, K.stoneLt, K.stoneDkk);
    var shard = function (sx, sy, w, h, lean) {
      for (var y = 0; y < h; y++) {
        var t = y / h, ww = w * (1 - t * 0.85);
        row(put, Math.round(sy - y), sx - ww + lean * t * w, sx + ww + lean * t * w, function (tx) {
          var b = mix(K.voltLt, K.volt, clamp(t * 0.9 + tx * 0.2, 0, 1));
          if (tx < 0.3) b = mix(b, '#ffffff', 0.45);
          if (tx > 0.8) b = mix(b, K.voltDk, 0.55);
          return b;
        });
      }
    };
    shard(cx - S * 0.1, S * 0.82, S * 0.05, S * 0.28, -0.3);
    shard(cx + S * 0.12, S * 0.82, S * 0.045, S * 0.22, 0.4);
    shard(cx, S * 0.84, S * 0.075, S * 0.44, 0.05);
    stroke(put, cx - S * 0.02, S * 0.8, cx + S * 0.01, S * 0.48, 1, function () { return K.voltDk; });
    zig(put, cx - S * 0.16, S * 0.5, cx - S * 0.26, S * 0.42, 1, K.volt, K.voltLt);
    zig(put, cx + S * 0.16, S * 0.56, cx + S * 0.26, S * 0.5, 1, K.volt, K.voltLt);
    [[0, 0.34], [0.2, 0.52], [-0.2, 0.6]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(o[1] * S), '#ffffff'); });
  }
  function drawRocNest(put, S) {
    var cx = S * 0.5, cy = S * 0.62;
    shadow(put, S, cx, S * 0.28);
    ell(put, cx, cy, S * 0.3, S * 0.14, function (tx, ty) { return mix(K.wood, K.woodDkk, ty); });
    ell(put, cx, cy - S * 0.03, S * 0.24, S * 0.09, function () { return K.woodDkk; });
    for (var i = 0; i < 10; i++) {
      var a = i * 0.63, r1 = S * 0.28, r2 = S * 0.34;
      stroke(put, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.45,
        cx + Math.cos(a + 0.7) * r2, cy + Math.sin(a + 0.7) * r2 * 0.45, S * 0.02, function (t) { return mix(K.woodLt, K.woodDk, t); });
    }
    dome(put, cx, cy - S * 0.12, S * 0.12, S * 0.15, K.feather, K.featherLt, K.featherDk);
    [[-0.05, -0.2], [0.05, -0.12], [-0.02, -0.06], [0.07, -0.22]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(cy + o[1] * S), K.featherDkk); });
    zig(put, cx - S * 0.02, cy - S * 0.24, cx + S * 0.03, cy - S * 0.1, 1, K.voltLt, '#ffffff');
    [[-0.3, -0.1], [0.32, -0.04]].forEach(function (o) {
      stroke(put, cx + o[0] * S, cy + o[1] * S, cx + o[0] * S + S * 0.06, cy + o[1] * S - S * 0.05, 2, function () { return K.featherLt; });
    });
  }
  function drawSignalBell(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.16);
    [-1, 1].forEach(function (s) { plate(put, cx + s * S * 0.14 - S * 0.025, S * 0.34, cx + s * S * 0.14 + S * 0.025, S * 0.88, K.wood, K.woodLt, K.woodDkk); });
    plate(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.36, K.woodDk, K.wood, K.woodDkk);
    for (var y = 0; y < S * 0.1; y++)
      row(put, Math.round(S * 0.2 + y), cx - (S * 0.22) * (y / (S * 0.1)), cx + (S * 0.22) * (y / (S * 0.1)), function () { return (y % 3 ? K.red : K.redDk); });
    dome(put, cx, S * 0.5, S * 0.09, S * 0.11, K.brass, K.brassLt, K.brassDk);
    plate(put, cx - S * 0.1, S * 0.58, cx + S * 0.1, S * 0.62, K.brassDk, K.brass, K.brassDk);
    stroke(put, cx, S * 0.36, cx, S * 0.4, 2, function () { return K.ironDk; });
    ell(put, cx + S * 0.03, S * 0.66, S * 0.025, S * 0.025, function () { return K.ironDk; });
    [[-0.16, 0.5], [-0.19, 0.56]].forEach(function (o) { stroke(put, cx + o[0] * S, o[1] * S, cx + o[0] * S - S * 0.05, o[1] * S, 1, function () { return K.wind; }); });
    stroke(put, cx + S * 0.06, S * 0.62, cx + S * 0.1, S * 0.84, 1, function () { return K.rope; });
  }
  function drawSupplyDrop(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    dome(put, cx + S * 0.14, S * 0.62, S * 0.18, S * 0.1, K.marbleLt, '#ffffff', K.marbleDk);
    for (var o = -0.12; o <= 0.12; o += 0.08) stroke(put, cx + S * 0.14 + o * S, S * 0.66, cx + S * 0.05, S * 0.78, 1, function () { return K.ropeDk; });
    plate(put, cx - S * 0.22, S * 0.6, cx + S * 0.04, S * 0.86, K.wood, K.woodLt, K.woodDkk);
    stroke(put, cx - S * 0.22, S * 0.6, cx + S * 0.04, S * 0.86, S * 0.02, function () { return K.woodDk; });
    stroke(put, cx + S * 0.04, S * 0.6, cx - S * 0.22, S * 0.86, S * 0.02, function () { return K.woodDk; });
    plate(put, cx - S * 0.14, S * 0.48, cx + S * 0.0, S * 0.6, K.woodLt, K.marbleLt, K.woodDk);
    for (var y = S * 0.64; y < S * 0.86; y++) {
      var t = (y - S * 0.64) / (S * 0.22);
      var w = S * (0.09 + Math.sin(t * Math.PI) * 0.02);
      row(put, Math.round(y), cx + S * 0.2 - w, cx + S * 0.2 + w, function (tx) { return mix(K.woodLt, K.woodDkk, clamp(t + Math.abs(tx - 0.5), 0, 1)); });
    }
    [0.68, 0.8].forEach(function (yy) { row(put, Math.round(S * yy), cx + S * 0.12, cx + S * 0.28, function () { return K.ironDk; }); });
  }
  function drawFloatingShard(put, S) {
    var cx = S * 0.5, cy = S * 0.46;
    ell(put, cx, cy + S * 0.26, S * 0.14, S * 0.04, function () { return K.skyDkk; });
    ell(put, cx, cy + S * 0.24, S * 0.1, S * 0.03, function () { return K.skyDk; });
    for (var y = -0.16; y < 0.2; y += 0.01) {
      var t = (y + 0.16) / 0.36;
      var w = S * 0.2 * Math.sin(Math.min(1, t * 1.2) * Math.PI * 0.62);
      row(put, Math.round(cy + y * S), cx - w, cx + w, function (tx) {
        var b = mix(K.stoneLt, K.stoneDk, clamp(t * 1.3, 0, 1));
        if (tx < 0.2 && t < 0.4) b = mix(b, K.marbleLt, 0.4);
        return b;
      });
    }
    ell(put, cx, cy - S * 0.16, S * 0.19, S * 0.05, function (tx, ty) { return mix(K.grassLt, K.grassDk, ty); });
    stroke(put, cx + S * 0.05, cy - S * 0.18, cx + S * 0.05, cy - S * 0.28, 2, function () { return K.woodDk; });
    dome(put, cx + S * 0.05, cy - S * 0.32, S * 0.06, S * 0.05, K.grass, K.grassLt, K.grassDkk);
    [-0.06, 0.02, 0.08].forEach(function (o) { stroke(put, cx + o * S, cy + S * 0.16, cx + o * S + S * 0.02, cy + S * 0.24, 1, function () { return K.dirtDk; }); });
    [[-0.3, 0.0], [0.3, -0.06], [0.24, 0.16]].forEach(function (o) { dome(put, cx + o[0] * S, cy + o[1] * S, S * 0.025, S * 0.02, K.stone, K.stoneLt, K.stoneDkk); });
  }
  function drawSkyShrine(put, S) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.2, S * 0.86, K.stone, K.stoneLt, K.stoneDkk);
    plate(put, cx - S * 0.14, S * 0.7, cx + S * 0.14, S * 0.78, K.stoneLt, K.marbleLt, K.stoneDk);
    plate(put, cx - S * 0.11, S * 0.52, cx + S * 0.11, S * 0.7, K.marble, K.marbleLt, K.marbleDkk);
    zig(put, cx - S * 0.02, S * 0.56, cx + S * 0.02, S * 0.66, 2, K.volt, K.voltLt);
    ell(put, cx, S * 0.5, S * 0.06, S * 0.03, function (tx, ty) { return mix(K.brassLt, K.brassDk, ty); });
    [[0, -0.06], [0.03, -0.1], [-0.03, -0.13]].forEach(function (o) { put(Math.round(cx + o[0] * S), Math.round(S * 0.5 + o[1] * S), K.voltLt); });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.16, S * 0.36, cx + s * S * 0.16, S * 0.52, S * 0.025, function () { return K.red; }); });
    plate(put, cx - S * 0.22, S * 0.32, cx + S * 0.22, S * 0.37, K.red, K.redLt, K.redDk);
    [-0.1, 0.06].forEach(function (o) {
      for (var y = 0; y < S * 0.08; y++)
        put(Math.round(cx + o * S + Math.sin(y * 0.6) * 2 + S * 0.02), Math.round(S * 0.38 + y), K.marbleLt);
    });
  }

  // ======================= TILES (#1 2 3 5 10 + MIST VEIL sea #4) ==========
  function drawSkystone(put, S) {
    var T = S;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var gx = Math.floor(x / (T / 2)), gy = Math.floor(y / (T / 2));
      var lx = x % (T / 2), ly = y % (T / 2);
      var id = gx + gy * 2;
      var b = mix(K.stoneLt, K.stone, 0.25 + h2(gx + 7, gy, 3) * 0.5);
      b = mix(b, K.stoneDk, h2(x, y, 1) * 0.22);
      if (lx < 2 || ly < 2) b = mix(b, K.stoneDkk, 0.65);
      if (lx === 2 || ly === 2) b = mix(b, K.marbleLt, 0.2);
      if (h2(x, y, id) > 0.985) b = mix(b, K.marbleLt, 0.5);
      put(x, y, b);
    }
  }
  function drawTurf(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var b = mix(K.grass, K.grassDk, h2(x >> 1, y >> 1, 5) * 0.55);
      if (Math.sin((x + y * 0.3) * 0.35 + h2(x >> 3, y >> 3, 6) * 4) > 0.93) b = mix(b, K.grassLt, 0.35);
      if (h2(x, y, 9) > 0.988) b = K.grassLt;
      if (h2(x, y, 11) > 0.995) b = '#ffffff';
      if (h2(x, y, 13) > 0.996) b = K.sky;
      put(x, y, b);
    }
  }
  function drawTempleMarble(put, S) {
    var cs = S / 2;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
      var alt = (cxi + cyi) % 2 === 0;
      var b = alt ? mix(K.marbleLt, K.marble, 0.3 + h2(x >> 2, y >> 2, 2) * 0.4)
        : mix(K.cloudMd, K.cloudDk, 0.3 + h2(x >> 2, y >> 2, 4) * 0.4);
      if (Math.sin(x * 0.5 + y * 0.9 + h2(cxi, cyi, 6) * 9) > 0.94) b = mix(b, alt ? K.marbleDk : K.cloudDkk, 0.7);
      if (x % cs < 1.5 || y % cs < 1.5) b = K.brassDk;
      if (x % cs < 0.8 && y % cs < 0.8) b = K.brass;
      put(x, y, b);
    }
  }
  function drawCobble(put, S) {
    var cs = S / 4;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
      var jx = (h2(cxi, cyi, 7) - 0.5) * 3, jy = (h2(cxi, cyi, 8) - 0.5) * 3;
      var dx = (x % cs) - cs / 2 - jx, dy = (y % cs) - cs / 2 - jy;
      var d = Math.sqrt(dx * dx + dy * dy) / (cs * 0.62);
      if (d > 1) { put(x, y, K.dirtDk); continue; }
      var b = mix(K.stoneLt, K.stoneDk, 0.15 + h2(cxi, cyi, 12) * 0.55 + d * 0.35);
      if (dy < -cs * 0.18 && d < 0.7) b = mix(b, K.marbleLt, 0.3);
      put(x, y, b);
    }
  }
  function drawStormglass(put, S) {
    var T = S;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var b = mix(K.thunderDkk, K.oil, 0.4 + h2(x >> 2, y >> 2, 60) * 0.4);
      if (Math.sin((x - y) * 0.18) > 0.92) b = mix(b, K.indigoLt, 0.3);
      var dx = x - T / 2, dy = y - T / 2;
      var ang = Math.atan2(dy, dx), rad = Math.sqrt(dx * dx + dy * dy);
      var branch = Math.abs(Math.sin(ang * 3 + Math.sin(rad * 0.5) * 0.8));
      if (branch > 0.985 && rad > 4 && rad < T * 0.52) { put(x, y, mix(K.volt, K.voltLt, h2(x, y, 61))); continue; }
      if (branch > 0.96 && rad > 4 && rad < T * 0.52) b = mix(b, K.voltDk, 0.55);
      if (rad < 3.4) { put(x, y, K.voltLt); continue; }
      put(x, y, b);
    }
  }
  function drawMistVeil(put, S) {
    var T = S;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var l1 = Math.sin(x * 0.09) * 6, l2 = Math.sin(x * 0.13 + 2) * 5;
      var b = mix(K.cloudMd, K.cloudDk, 0.3 + h2(x >> 2, y >> 2, 95) * 0.3);
      if (y < T * 0.3 + l1) b = mix(b, K.cloud, 0.65);
      if (y > T * 0.62 + l2) b = mix(b, K.cloudLt, 0.55);
      if (Math.abs(y - T * 0.45 - l2) < 2) b = mix(b, '#ffffff', 0.4);
      put(x, y, b);
    }
  }

  // ======================= REGISTRY buildArt hook ===========================
  var SKY_ART = {
    K: K,
    // ctx: { scene, spr, tex, MOB_HI, MOB_DISPLAY, BOSS_HI, SIZE } — from
    // textures.js buildHiFiWorld (registry hook). Registers everything this
    // map needs; mobModel()/bossModel() then serve it with zero core edits.
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (8) ----
      ctx.spr('stormSpriteHi', MS, MS, drawStormSprite);
      ctx.spr('cloudRayHi', MS, MS, drawCloudRay);
      ctx.spr('griffinCubHi', MS, MS, drawGriffinCub);
      ctx.spr('nimbusGolemHi', MS, MS, drawNimbusGolem);
      ctx.spr('windWardenHi', MS, MS, drawWindWarden);
      ctx.spr('stormvaneHi', MS, MS, drawStormvane);
      ctx.spr('rainShepherdHi', MS, MS, drawRainShepherd);
      ctx.spr('rocHatchlingHi', MS, MS, drawRocHatchling);
      ctx.MOB_HI.stormSprite = 'stormSpriteHi';   ctx.MOB_DISPLAY.stormSprite = 42;
      ctx.MOB_HI.cloudRay = 'cloudRayHi';         ctx.MOB_DISPLAY.cloudRay = 56;
      ctx.MOB_HI.griffinCub = 'griffinCubHi';     ctx.MOB_DISPLAY.griffinCub = 54;
      ctx.MOB_HI.nimbusGolem = 'nimbusGolemHi';   ctx.MOB_DISPLAY.nimbusGolem = 62;
      ctx.MOB_HI.windWarden = 'windWardenHi';     ctx.MOB_DISPLAY.windWarden = 50;
      ctx.MOB_HI.stormvane = 'stormvaneHi';       ctx.MOB_DISPLAY.stormvane = 54;
      ctx.MOB_HI.rainShepherd = 'rainShepherdHi'; ctx.MOB_DISPLAY.rainShepherd = 52;
      ctx.MOB_HI.rocHatchling = 'rocHatchlingHi'; ctx.MOB_DISPLAY.rocHatchling = 58;
      // ---- boss (Gravekeeper-class display ~160) ----
      ctx.spr('nimbustalonHi', 96, 96, drawNimbusTalon);
      ctx.BOSS_HI.nimbustalon = { key: 'nimbustalonHi', size: 96, display: 160, bodyW: 54, bodyH: 48 };
      // ---- decor (#1–19; windmill split tower/sails for the spin anim) ----
      ctx.spr('skBridge', 64, 64, drawRopeBridge);
      ctx.spr('skCloudBank', 64, 64, drawCloudBank);
      ctx.spr('skColumn', 64, 64, drawRuinedColumn);
      ctx.spr('skArch', 64, 64, drawTempleArch);
      ctx.spr('skWindmill', 64, 64, drawWindmillTower);
      ctx.spr('skSails', 64, 64, drawWindmillSails);
      ctx.spr('skLantern', 64, 64, drawStormLantern);
      ctx.spr('skRod', 64, 64, drawLightningRod);
      ctx.spr('skChimes', 64, 64, drawWindChimes);
      ctx.spr('skBanner', 64, 64, drawTatteredBanner);
      ctx.spr('skBalloon', 64, 64, drawSkyBalloon);
      ctx.spr('skWreck', 64, 64, drawAirshipWreck);
      ctx.spr('skDock', 64, 64, drawSkyDock);
      ctx.spr('skGod', 64, 64, drawWindGodStatue);
      ctx.spr('skCrystal', 64, 64, drawStormCrystal);
      ctx.spr('skNest', 64, 64, drawRocNest);
      ctx.spr('skBell', 64, 64, drawSignalBell);
      ctx.spr('skSupply', 64, 64, drawSupplyDrop);
      ctx.spr('skShard', 64, 64, drawFloatingShard);
      ctx.spr('skShrine', 64, 64, drawSkyShrine);
      // ---- tiles (#1 2 3 5 10 + mist veil sea) ----
      ctx.tex('skystone', 48, 48, drawSkystone);
      ctx.tex('skyturf', 48, 48, drawTurf);
      ctx.tex('skymarble', 48, 48, drawTempleMarble);
      ctx.tex('skycobble', 48, 48, drawCobble);
      ctx.tex('stormglass', 48, 48, drawStormglass);
      ctx.tex('mistveil', 48, 48, drawMistVeil);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SKY_ART;
  root.SKYISLES_ART = SKY_ART;
})(typeof window !== 'undefined' ? window : this);
