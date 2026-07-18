// ============================================================================
// game/js/maps/colosseum/art.js — COLOSSEUM (realm 14) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 4 7 9 10 11 13 16
// 19 20 (render_colosseum_mobs.js) + the CHARIOT RACER (crimson car + ONE
// lion, render_colosseum_chariot_final.js using lion160), DIVINITY HIMSELF
// (render_colosseum_boss_final.js — golden god + jeweled PIMP CUP over the
// parameterized emperor()), 18 decor (all but #10 bones + #18 stands), 10
// tiles, and the CROWD RING border art (tier bands + individually drawn fans).
// Imperial arena mood: marble, arena sand, bronze/gold, crimson + purple.
// ALL hex 6-digit (RANGER_ART.mix breaks on shorthand).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- colosseum palette (colosseum_kit.js C, verbatim) ---------------------
  var C = {
    OUT: '#140f0c',
    sand: '#d8b878', sandLt: '#f0d8a0', sandDk: '#a8845a', sandDkk: '#6e5436',
    marble: '#d8d4c8', marbleLt: '#f4f0e6', marbleDk: '#a09a8a', marbleDkk: '#6a6458',
    bronze: '#b08036', bronzeLt: '#e0b060', bronzeDk: '#6e4a1c',
    gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a6418',
    crimson: '#a02028', crimsonLt: '#d04848', crimsonDk: '#5e1014',
    purple: '#5a2a6a', purpleLt: '#8a4a9a', purpleDk: '#341440',
    iron: '#6a6e78', ironLt: '#a8aeb8', ironDk: '#2e3038',
    leather: '#7a4e2e', leatherLt: '#a06e42', leatherDk: '#4a2e1a',
    wood: '#8a6a48', woodLt: '#b08e62', woodDk: '#5a4430',
    skin: '#d8a878', skinDk: '#a87850',
    fur: '#b08648', furDk: '#7a5a2c',
    bone: '#e8e0c8', boneDk: '#b0a888',
    oil: '#0c0806', white: '#f4f4f4', blood: '#8a1622',
    ghost: '#8ab0b8', ghostLt: '#c8e8e8'
  };

  // ---- shared helpers (swamp lineage — RANGER_ART primitives) ---------------
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      (function (vt) {
        row(put, y, x0, x1, function (tx) {
          var b = mix(hi, base, clamp(vt * 1.15, 0, 1));
          b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
          if (tx < 0.13) b = mix(b, hi, 0.55);
          if (tx > 0.9) b = mix(b, dk, 0.5);
          return b;
        });
      })(vt);
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
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null); });
    ell(put, cx, cy, r * 1.12, r * 1.12, function () { return c; });
    ell(put, cx, cy, r * 0.66, r * 0.66, function () { return cLt; });
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, function () { return C.oil; }); }

  // ---- colosseum_kit helpers (galea / scutum / spear / laurel) --------------
  function galea(put, cx, cy, w, crestC, metalC) {
    var m = metalC || [C.bronze, C.bronzeLt, C.bronzeDk];
    ell(put, cx, cy - w * 0.1, w, w * 0.85, function (tx, ty) { return (ty < 0.62 ? mix(m[1], m[0], clamp(tx * 1.2 + ty * 0.3, 0, 1)) : null); });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * w * 0.8, cy, cx + s * w * 0.62, cy + w * 0.75, w * 0.32, function () { return mix(m[0], m[2], 0.35); }); });
    for (var a = -1.25; a <= 1.25; a += 0.06) {
      var x = cx + Math.sin(a) * w * 0.95, y = cy - w * 0.35 - Math.cos(a) * w * 0.72;
      (function (a) { stroke(put, x, y, x, y - w * 0.5, w * 0.16, function () { return (Math.abs(a * 10 | 0) % 2 ? crestC[0] : crestC[1]); }); })(a);
    }
  }
  function scutum(put, cx, cy, w, h, base, hi, dk, emblemC) {
    plate(put, cx - w, cy - h, cx + w, cy + h, base, hi, dk);
    ell(put, cx, cy, w * 0.28, w * 0.28, function (tx, ty) { return mix(emblemC || C.gold, C.goldDk, tx + ty * 0.4); });
    stroke(put, cx - w, cy - h, cx + w, cy - h, 1.4, function () { return dk; });
  }
  function spear(put, x0, y0, x1, y1, c, headC) {
    stroke(put, x0, y0, x1, y1, 2, function () { return c || C.wood; });
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    stroke(put, x1, y1, x1 + dx / L * 7, y1 + dy / L * 7, 2.6, function () { return headC || C.ironLt; });
  }
  function laurel(put, cx, cy, r, c) {
    for (var a = 0.3; a < Math.PI - 0.3; a += 0.22) {
      (function (a) { [-1, 1].forEach(function (s) { ell(put, cx + Math.cos(a) * r * s, cy - Math.sin(a) * r * 0.8, 2.2, 1.4, function () { return c; }); }); })(a);
    }
  }

  // ---- mob shared base (tunic + sandals + head) -----------------------------
  function body(put, S, cx, o) {
    o = o || {};
    var tun = o.tunic || [C.leather, C.leatherLt, C.leatherDk];
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.04, S * 0.6, cx + s * S * 0.05, S * 0.84, S * 0.028, function () { return o.legs || C.skin; });
      plate(put, cx + s * S * 0.05 - S * 0.028, S * 0.84, cx + s * S * 0.05 + S * 0.032, S * 0.87, C.leatherDk, C.leather, C.oil);
      if (o.greaves) stroke(put, cx + s * S * 0.045, S * 0.68, cx + s * S * 0.05, S * 0.83, S * 0.03, function () { return C.bronze; });
    });
    for (var y = S * 0.42; y < S * 0.62; y++) {
      var t = (y - S * 0.42) / (S * 0.2), w = S * (0.08 + t * 0.02) * (o.wide || 1);
      (function (t, w) {
        row(put, Math.round(y), cx - w, cx + w, function (tx) {
          var b = mix(tun[1], tun[0], clamp(tx * 1.3, 0, 1));
          if (tx > 0.72) b = mix(b, tun[2], 0.6);
          if (o.bare && t < 0.45) b = mix(C.skin, C.skinDk, tx);
          return b;
        });
      })(t, w);
    }
    row(put, Math.round(S * 0.6), cx - S * 0.085 * (o.wide || 1), cx + S * 0.085 * (o.wide || 1), function () { return C.leatherDk; });
    put(Math.round(cx), Math.round(S * 0.6), C.gold);
  }
  function head(put, S, cx, cy) {
    ell(put, cx, cy, S * 0.052, S * 0.056, function (tx, ty) { return mix(C.skin, C.skinDk, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, cx - S * 0.018, cy - S * 0.005, S * 0.01, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.018, cy - S * 0.005, S * 0.01, C.oil, C.oil, '#ffffff');
  }

  // ================= MOBS (Red picked #1 2 4 7 9 10 11 13 16 19 20) =========
  function drawGladiator(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { tunic: [C.crimson, C.crimsonLt, C.crimsonDk], greaves: true });
    scutum(put, cx - S * 0.16, S * 0.52, S * 0.07, S * 0.12, C.crimson, C.crimsonLt, C.crimsonDk, C.gold);
    stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.17, S * 0.37, S * 0.02, function () { return C.skin; });
    stroke(put, cx + S * 0.17, S * 0.36, cx + S * 0.24, S * 0.26, 2.6, function () { return C.ironLt; });
    head(put, S, cx, S * 0.35);
    galea(put, cx, S * 0.31, S * 0.06, [C.crimson, C.crimsonLt]);
  }
  function drawRetiarius(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { tunic: [C.leather, C.leatherLt, C.leatherDk], bare: true });
    dome(put, cx - S * 0.07, S * 0.43, S * 0.045, S * 0.035, C.bronze, C.bronzeLt, C.bronzeDk);
    spear(put, cx + S * 0.06, S * 0.6, cx + S * 0.2, S * 0.28, C.wood, C.ironLt);
    [-1, 0, 1].forEach(function (s) { stroke(put, cx + S * 0.2 + s * 3, S * 0.28, cx + S * 0.2 + s * 4, S * 0.24, 1.4, function () { return C.ironLt; }); });
    for (var a = 0; a < 6.2; a += 0.3) { var r = S * (0.05 + a * 0.012); put(Math.round(cx - S * 0.16 + Math.cos(a) * r), Math.round(S * 0.45 + Math.sin(a) * r * 0.7), C.boneDk); }
    head(put, S, cx, S * 0.35);
  }
  function drawLion(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    ell(put, cx + S * 0.02, S * 0.6, S * 0.17, S * 0.1, function (tx, ty) { return mix(C.fur, C.furDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.1, S * 0.66, cx + s * S * 0.13, S * 0.78, S * 0.028, function () { return C.fur; }); });
    stroke(put, cx + S * 0.18, S * 0.58, cx + S * 0.27, S * 0.48, S * 0.015, function () { return C.fur; });
    put(Math.round(cx + S * 0.28), Math.round(S * 0.47), C.furDk);
    ell(put, cx - S * 0.14, S * 0.5, S * 0.095, S * 0.095, function (tx, ty) { return mix('#8a5a24', '#5e3a14', clamp(tx + ty * 0.4, 0, 1)); });
    ell(put, cx - S * 0.15, S * 0.5, S * 0.055, S * 0.05, function (tx, ty) { return mix(C.fur, C.furDk, tx + ty * 0.3); });
    optic(put, cx - S * 0.17, S * 0.485, S * 0.009, C.oil, C.gold, C.goldLt);
    optic(put, cx - S * 0.12, S * 0.485, S * 0.009, C.oil, C.gold, C.goldLt);
    row(put, Math.round(S * 0.53), cx - S * 0.185, cx - S * 0.14, function () { return C.oil; });
    [[-0.2, 0.54], [-0.185, 0.555]].forEach(function (p) { put(Math.round(cx + p[0] * S), Math.round(S * p[1]), C.white); });
  }
  function drawLegionary(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    body(put, S, cx, { tunic: [C.crimson, C.crimsonLt, C.crimsonDk], greaves: true });
    head(put, S, cx, S * 0.34);
    galea(put, cx, S * 0.3, S * 0.058, [C.gold, C.goldLt], [C.iron, C.ironLt, C.ironDk]);
    scutum(put, cx, S * 0.55, S * 0.11, S * 0.17, C.crimson, C.crimsonLt, C.crimsonDk, C.gold);
    stroke(put, cx, S * 0.4, cx, S * 0.7, 1.2, function () { return C.gold; });
    spear(put, cx + S * 0.14, S * 0.66, cx + S * 0.2, S * 0.3, C.wood, C.ironLt);
  }
  function drawHandler(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { tunic: [C.leather, C.leatherLt, C.leatherDk] });
    head(put, S, cx, S * 0.35);
    ell(put, cx, S * 0.33, S * 0.06, S * 0.05, function (tx, ty) { return (ty < 0.55 ? mix(C.leatherDk, C.leather, tx) : null); });
    var px = cx + S * 0.09, py = S * 0.5;
    for (var t = 0; t < 1; t += 0.04) { var x = px + t * S * 0.22, y = py - Math.sin(t * 6.5) * S * 0.07 * (1 - t); put(Math.round(x), Math.round(y), t < 0.15 ? C.leatherDk : C.leather); }
    ell(put, cx - S * 0.14, S * 0.56, S * 0.03, S * 0.024, function (tx, ty) { return mix(C.blood, C.crimsonDk, tx); });
  }
  function drawElephant(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.36);
    ell(put, cx + S * 0.03, S * 0.52, S * 0.2, S * 0.16, function (tx, ty) { return mix('#9a9aa2', '#5e5e6a', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [-0.12, 0.14].forEach(function (dx) { stroke(put, cx + dx * S, S * 0.62, cx + dx * S, S * 0.8, S * 0.045, function () { return '#8a8a94'; }); });
    ell(put, cx - S * 0.2, S * 0.42, S * 0.085, S * 0.08, function (tx, ty) { return mix('#9a9aa2', '#6a6a76', tx + ty * 0.3); });
    ell(put, cx - S * 0.13, S * 0.38, S * 0.06, S * 0.075, function (tx, ty) { return mix('#8a8a94', '#5e5e6a', ty); });
    var tx0 = cx - S * 0.27, ty0 = S * 0.46;
    for (var t = 0; t < 1; t += 0.06) put(Math.round(tx0 - Math.sin(t * 2.2) * S * 0.03), Math.round(ty0 + t * S * 0.2), '#8a8a94');
    stroke(put, cx - S * 0.24, S * 0.47, cx - S * 0.3, S * 0.52, S * 0.016, function () { return C.bone; });
    optic(put, cx - S * 0.21, S * 0.4, S * 0.008, C.oil, C.oil, '#ffffff');
    plate(put, cx - S * 0.02, S * 0.26, cx + S * 0.14, S * 0.38, C.crimson, C.crimsonLt, C.crimsonDk);
    row(put, Math.round(S * 0.27), cx - S * 0.02, cx + S * 0.14, function () { return C.gold; });
    row(put, Math.round(S * 0.55), cx - S * 0.13, cx + S * 0.19, function () { return C.bronze; });
    row(put, Math.round(S * 0.57), cx - S * 0.13, cx + S * 0.19, function () { return C.bronzeDk; });
  }
  function drawMinotaur(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    body(put, S, cx, { tunic: [C.furDk, C.fur, '#4a3418'], bare: true, wide: 1.3 });
    ell(put, cx, S * 0.33, S * 0.075, S * 0.07, function (tx, ty) { return mix('#6e4a2e', '#3e2814', clamp(tx + ty * 0.4, 0, 1)); });
    ell(put, cx, S * 0.37, S * 0.04, S * 0.03, function (tx, ty) { return mix('#a8865a', '#6e5432', ty); });
    [[-1, 0], [1, 0]].forEach(function (p) {
      var s = p[0];
      stroke(put, cx + s * S * 0.07, S * 0.3, cx + s * S * 0.13, S * 0.24, S * 0.02, function () { return C.bone; });
      stroke(put, cx + s * S * 0.13, S * 0.24, cx + s * S * 0.15, S * 0.19, S * 0.014, function () { return C.boneDk; });
    });
    optic(put, cx - S * 0.025, S * 0.32, S * 0.01, C.oil, C.crimson, C.crimsonLt);
    optic(put, cx + S * 0.025, S * 0.32, S * 0.01, C.oil, C.crimson, C.crimsonLt);
    put(Math.round(cx - S * 0.015), Math.round(S * 0.375), C.gold);
    put(Math.round(cx + S * 0.015), Math.round(S * 0.375), C.gold);
    stroke(put, cx + S * 0.12, S * 0.52, cx + S * 0.22, S * 0.3, 2.6, function () { return C.woodDk; });
    ell(put, cx + S * 0.24, S * 0.3, S * 0.05, S * 0.035, function (tx, ty) { return mix(C.ironLt, C.ironDk, tx + ty * 0.4); });
  }
  function drawFavorite(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { tunic: [C.gold, C.goldLt, C.goldDk], greaves: true });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.08, S * 0.46, cx + s * S * 0.17, S * 0.32, S * 0.02, function () { return C.skin; }); });
    stroke(put, cx + S * 0.17, S * 0.33, cx + S * 0.24, S * 0.24, 2.4, function () { return C.ironLt; });
    head(put, S, cx, S * 0.35);
    laurel(put, cx, S * 0.33, S * 0.055, '#5a7e46');
    [[-0.24, 0.3], [0.28, 0.36], [-0.2, 0.42]].forEach(function (p) { put(Math.round(cx + p[0] * S), Math.round(S * p[1]), C.goldLt); });
    put(Math.round(cx - S * 0.1), Math.round(S * 0.83), C.crimsonLt);
  }
  function drawHound(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    ell(put, cx + S * 0.03, S * 0.6, S * 0.13, S * 0.075, function (tx, ty) { return mix('#5a5048', '#322c26', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.08, S * 0.64, cx + s * S * 0.1, S * 0.76, S * 0.022, function () { return '#4a423c'; }); });
    stroke(put, cx + S * 0.15, S * 0.58, cx + S * 0.22, S * 0.52, S * 0.012, function () { return '#4a423c'; });
    ell(put, cx - S * 0.1, S * 0.53, S * 0.045, S * 0.04, function (tx, ty) { return mix(C.leatherDk, C.oil, ty); });
    [[-0.15, 0.5], [-0.12, 0.485], [-0.08, 0.49]].forEach(function (p) { put(Math.round(cx + p[0] * S), Math.round(S * p[1]), C.ironLt); });
    ell(put, cx - S * 0.16, S * 0.5, S * 0.05, S * 0.042, function (tx, ty) { return mix('#5a5048', '#322c26', tx + ty * 0.3); });
    optic(put, cx - S * 0.17, S * 0.485, S * 0.008, C.oil, C.crimson, C.crimsonLt);
    row(put, Math.round(S * 0.525), cx - S * 0.2, cx - S * 0.15, function () { return C.oil; });
    put(Math.round(cx - S * 0.2), Math.round(S * 0.535), C.white);
  }
  function drawVestal(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    for (var y = S * 0.4; y < S * 0.84; y++) {
      var t = (y - S * 0.4) / (S * 0.44), w = S * (0.055 + t * 0.075);
      (function (w) {
        row(put, Math.round(y), cx - w, cx + w, function (tx) {
          var b = mix(C.marbleLt, C.marble, clamp(tx * 1.2, 0, 1));
          if (tx > 0.75) b = mix(b, C.marbleDk, 0.55);
          return b;
        });
      })(w);
    }
    head(put, S, cx, S * 0.35);
    ell(put, cx, S * 0.32, S * 0.06, S * 0.045, function (tx, ty) { return (ty < 0.5 ? mix(C.marbleLt, C.marble, tx) : null); });
    ell(put, cx + S * 0.14, S * 0.44, S * 0.032, S * 0.032, function (tx, ty) { return mix(C.purpleLt, C.purpleDk, tx + ty * 0.4); });
    for (var a = 0; a < 6.28; a += 0.8) put(Math.round(cx + S * 0.14 + Math.cos(a) * S * 0.055), Math.round(S * 0.44 + Math.sin(a) * S * 0.055), C.purpleLt);
    stroke(put, cx - S * 0.14, S * 0.56, cx - S * 0.14, S * 0.64, 2, function () { return C.bronzeDk; });
    ell(put, cx - S * 0.14, S * 0.53, S * 0.02, S * 0.028, function (tx, ty) { return mix(C.purpleLt, C.purple, ty); });
  }
  function drawExecutioner(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    body(put, S, cx, { tunic: [C.oil, '#3a3a42', '#000000'], wide: 1.25 });
    ell(put, cx, S * 0.33, S * 0.065, S * 0.07, function (tx, ty) { return mix('#3a3a42', C.oil, clamp(tx + ty * 0.4, 0, 1)); });
    optic(put, cx - S * 0.02, S * 0.335, S * 0.008, C.oil, C.crimson, C.crimsonLt);
    optic(put, cx + S * 0.02, S * 0.335, S * 0.008, C.oil, C.crimson, C.crimsonLt);
    stroke(put, cx - S * 0.02, S * 0.5, cx + S * 0.06, S * 0.2, 2.8, function () { return C.woodDk; });
    [-1, 1].forEach(function (s) {
      for (var a = -0.9; a <= 0.9; a += 0.06) put(Math.round(cx + S * 0.06 + s * Math.cos(a) * S * 0.06), Math.round(S * 0.22 + Math.sin(a) * S * 0.045), C.ironLt);
      ell(put, cx + S * 0.06 + s * S * 0.045, S * 0.22, S * 0.028, S * 0.04, function (tx, ty) { return mix(C.ironLt, C.ironDk, tx + ty * 0.3); });
    });
    put(Math.round(cx), Math.round(S * 0.47), C.crimsonLt);
    stroke(put, cx - S * 0.01, S * 0.47, cx + S * 0.01, S * 0.5, 1.6, function () { return C.crimsonLt; });
  }

  // ---- THE CHARIOT LION (full-canvas draft beast, lion160) ------------------
  function lion160(put, S, o) {
    o = o || {};
    var fur = o.fur || C.fur, furDk = o.furDk || C.furDk, furLt = o.furLt || '#d0a868';
    var maneC = o.mane || '#8a5a24', maneDk = o.maneDk || '#5e3a14';
    var u = S / 160, X = function (v) { return v * u; }, Y = function (v) { return v * u; };
    var coat = function (tx, ty) {
      var b = mix(furLt, fur, clamp(ty * 1.6, 0, 1));
      b = mix(b, furDk, clamp((ty - 0.42) * 1.5, 0, 1));
      if (tx > 0.88) b = mix(b, furDk, 0.25);
      return b;
    };
    var darkCoat = function (tx, ty) { return mix(mix(fur, '#3a2a14', 0.45), mix(furDk, '#241808', 0.4), clamp(ty * 1.2, 0, 1)); };
    if (!o.noShadow) ell(put, X(80), Y(146), X(64), Y(6), function () { return C.oil; });
    var legSeg = function (pts, w, fillC, pawC) {
      for (var i = 0; i < pts.length - 1; i++) (function (i) { stroke(put, X(pts[i][0]), Y(pts[i][1]), X(pts[i + 1][0]), Y(pts[i + 1][1]), X(w * (1 - i * 0.18)), fillC); })(i);
      var last = pts[pts.length - 1];
      ell(put, X(last[0]), Y(last[1]), X(4), Y(2.6), typeof pawC === 'function' ? pawC : fillC);
      put(Math.round(X(last[0] - 2)), Math.round(Y(last[1] + 2)), '#1c1008');
      put(Math.round(X(last[0] + 1)), Math.round(Y(last[1] + 2)), '#1c1008');
    };
    legSeg([[112, 82], [128, 96], [140, 112], [150, 128]], 13.5, darkCoat);
    legSeg([[52, 84], [40, 102], [30, 118], [22, 132]], 11, darkCoat);
    ell(put, X(104), Y(76), X(26), Y(21), coat);
    ell(put, X(78), Y(80), X(30), Y(19), coat);
    ell(put, X(54), Y(78), X(20), Y(20), coat);
    ell(put, X(90), Y(72), X(18), Y(9), coat);
    stroke(put, X(62), Y(98), X(92), Y(92), X(2), function () { return furDk; });
    stroke(put, X(92), Y(92), X(108), Y(88), X(1.6), function () { return furDk; });
    ell(put, X(104), Y(84), X(13), Y(13), coat);
    legSeg([[102, 84], [114, 100], [122, 116], [130, 130]], 14.5, coat);
    ell(put, X(49), Y(86), X(9.5), Y(10), coat);
    legSeg([[50, 86], [34, 100], [20, 112], [10, 124]], 12.5, coat);
    var mcx = 34, mcy = 58;
    for (var a = 0; a < Math.PI * 2; a += 0.16) {
      var rr = 21 + Math.sin(a * 3.2) * 3.5 + Math.sin(a * 7.1) * 2;
      var mx = mcx + Math.cos(a) * rr * 1.02, my = mcy + Math.sin(a) * rr * 0.95;
      var sweep = a > 4.2 || a < 1.2 ? 7 : 4;
      (function (a) { stroke(put, X(mcx + Math.cos(a) * 12), Y(mcy + Math.sin(a) * 11), X(mx + sweep * 0.6), Y(my), X(4.2), function () { return (((a * 10) | 0) % 2 ? maneC : maneDk); }); })(a);
    }
    ell(put, X(mcx + 2), Y(mcy), X(17), Y(16), function (tx, ty) { return mix(maneC, maneDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)); });
    for (var i2 = 0; i2 < 5; i2++) (function (i2) { stroke(put, X(44 + i2 * 2), Y(72 + i2 * 3), X(46 + i2 * 2), Y(86 + i2 * 3.5), X(3), function () { return (i2 % 2 ? maneC : maneDk); }); })(i2);
    ell(put, X(26), Y(56), X(11), Y(9.5), coat);
    ell(put, X(15), Y(60), X(7), Y(5.5), function (tx, ty) { return mix(furLt, fur, clamp(ty * 1.3, 0, 1)); });
    for (var hx = -2.2; hx <= 2.2; hx += 0.5) for (var hy = -1; hy <= 2; hy += 0.5) put(Math.round(X(9.5 + hx)), Math.round(Y(58 + hy)), '#1c0c04');
    stroke(put, X(7.5), Y(62.5), X(20), Y(64), X(1.6), function () { return '#1c0c04'; });
    for (var hy2 = 0; hy2 < 3.4; hy2 += 0.5) { put(Math.round(X(11)), Math.round(Y(64.5 + hy2)), C.white); put(Math.round(X(16)), Math.round(Y(64.5 + hy2 * 0.8)), C.white); }
    ell(put, X(14), Y(67), X(5.5), Y(3), function (tx, ty) { return mix(fur, furDk, ty); });
    stroke(put, X(11), Y(56.5), X(16), Y(55.5), X(0.9), function () { return furDk; });
    optic(put, X(22), Y(52.5), X(2.4), '#1c0c04', o.eye || C.gold, C.goldLt);
    stroke(put, X(18.5), Y(50), X(25.5), Y(49.5), X(1.1), function () { return furDk; });
    ell(put, X(33), Y(46), X(3.4), Y(3), function (tx, ty) { return mix(fur, furDk, tx + ty * 0.4); });
    put(Math.round(X(33)), Math.round(Y(46)), '#3a2410');
    [[11, 60.5], [12.5, 61.5], [14, 60.8]].forEach(function (p) { put(Math.round(X(p[0])), Math.round(Y(p[1])), furDk); });
    if (o.harness !== false) {
      stroke(put, X(40), Y(74), X(52), Y(90), X(2.4), function () { return C.leatherDk; });
      stroke(put, X(52), Y(90), X(60), Y(88), X(2), function () { return C.leather; });
      put(Math.round(X(46)), Math.round(Y(81)), C.gold);
    }
    var px2 = 128, py2 = 68;
    for (var t = 0; t < 1; t += 0.07) {
      var nx2 = 128 + t * 26, ny2 = 68 - t * 14 + Math.sin(t * 4.6) * 3;
      (function (t) { stroke(put, X(px2), Y(py2), X(nx2), Y(ny2), X(2.6 - t * 1.1), coat); })(t);
      px2 = nx2; py2 = ny2;
    }
    ell(put, X(155), Y(52), X(4), Y(5), function (tx, ty) { return mix(maneDk, '#3a2410', ty); });
    ell(put, X(100), Y(66), X(11), Y(7), function (tx, ty) { return (tx + ty < 0.8 ? furLt : null); });
    stroke(put, X(102), Y(84), X(110), Y(96), X(1.2), function () { return furDk; });
    ell(put, X(80), Y(70), X(11), Y(5), function (tx, ty) { return (ty < 0.5 ? mix(furLt, fur, 0.5) : null); });
    [[14, 128], [128, 134], [148, 132]].forEach(function (p) { ell(put, X(p[0]), Y(p[1]), X(4.5), Y(2.5), function (tx) { return mix(C.sandLt, C.sand, tx); }); });
  }
  // ---- CHARIOT RACER — crimson car + ONE lion (final) -----------------------
  function drawChariot(put, S) {
    var u = S / 200, X = function (v) { return v * u; }, Y = function (v) { return v * u; };
    var at = function (ox, oy) { return function (x, y, c) { put(Math.round(x + X(ox)), Math.round(y + Y(oy)), c); }; };
    ell(put, X(100), Y(188), X(92), Y(7), function () { return C.oil; });
    var L = 138 * u;
    lion160(at(2, 42), L, { noShadow: true });
    stroke(put, X(42), Y(112), X(150), Y(152), X(1.4), function () { return C.leatherDk; });
    stroke(put, X(108), Y(140), X(152), Y(156), X(2.8), function () { return C.woodDk; });
    var wx = X(168), wy = Y(172), wr = X(21);
    ell(put, wx, wy, wr, wr, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.15 ? mix(C.gold, C.goldDk, tx) : null); });
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * wr, wy - Math.sin(a) * wr, wx + Math.cos(a) * wr, wy + Math.sin(a) * wr, X(1.6), function () { return C.goldDk; }); }
    ell(put, wx, wy, X(3.6), X(3.6), function () { return C.ironDk; });
    for (var y = Y(128); y < Y(168); y++) {
      var tt = (y - Y(128)) / (Y(40));
      (function (tt) {
        row(put, Math.round(y), X(146) - (1 - tt) * X(4), X(196), function (tx) {
          var b = mix(C.crimsonLt, C.crimson, clamp(tx * 1.2, 0, 1));
          if (tx > 0.8) b = mix(b, C.crimsonDk, 0.55);
          return b;
        });
      })(tt);
    }
    row(put, Math.round(Y(128)), X(144), X(196), function () { return C.gold; });
    row(put, Math.round(Y(130)), X(144), X(196), function () { return C.goldDk; });
    ell(put, X(170), Y(148), X(8), X(8), function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.14 ? mix(C.goldLt, C.goldDk, tx) : null); });
    put(Math.round(X(170)), Math.round(Y(148)), C.goldLt);
    var dx = X(176), dy = Y(108);
    stroke(put, dx + X(3), dy + X(20), dx - X(5), dy, X(9), function () { return C.crimson; });
    row(put, Math.round(dy + X(4)), dx - X(10), dx + X(1), function () { return C.crimsonLt; });
    stroke(put, dx - X(4), dy + X(4), dx - X(24), dy + X(10), X(3.2), function () { return C.skin; });
    stroke(put, dx - X(24), dy + X(10), X(112), Y(146), X(1), function () { return C.leatherDk; });
    stroke(put, dx + X(2), dy + X(4), dx + X(14), dy - X(12), X(3.2), function () { return C.skin; });
    var px0 = dx + X(15), py0 = dy - X(14);
    for (var t2 = 0; t2 < 1; t2 += 0.04) {
      var nx = px0 - t2 * X(52), ny = py0 - Math.sin(t2 * 3.2) * X(14) + t2 * X(4);
      put(Math.round(nx), Math.round(ny), t2 < 0.12 ? C.leatherDk : C.leather);
    }
    put(Math.round(px0 - X(53)), Math.round(py0 + X(3)), C.goldLt);
    var hy = dy - X(9);
    ell(put, dx - X(1), hy, X(7), X(7.6), function (tx, ty) { return mix(C.skin, C.skinDk, clamp(tx + ty * 0.3, 0, 1)); });
    optic(put, dx - X(3.4), hy - X(0.8), X(1.2), C.oil, C.oil, '#ffffff');
    galea(put, dx - X(1), hy - X(5.6), X(7.6), [C.crimson, C.crimsonLt]);
    [[196, 178], [190, 168], [198, 158]].forEach(function (p) { ell(put, X(p[0]), Y(p[1]), X(6), X(3.4), function (tx) { return mix(C.sandLt, C.sand, tx); }); });
  }

  // ============ DIVINITY HIMSELF — golden god + PIMP CUP =====================
  function emperor(put, S, p) {
    var cx = S * 0.5, T = p.tall || 1;
    var y = function (v) { return S * (1 - (1 - v) * T); };
    var skin = p.skin || [C.skin, C.skinDk];
    var toga = p.toga;
    shadow(put, S, cx, S * 0.26);
    if (p.cape) {
      for (var yy0 = y(0.42); yy0 < S * 0.8; yy0++) {
        var t0 = (yy0 - y(0.42)) / (S * 0.8 - y(0.42));
        var w0 = S * (0.1 + t0 * 0.1) * (p.build || 1);
        (function (t0, w0) { row(put, Math.round(yy0), cx - w0, cx + w0, function (tx) { return (tx < 0.16 || tx > 0.84 ? mix(p.cape[0], p.cape[1], clamp(tx + t0 * 0.3, 0, 1)) : null); }); })(t0, w0);
      }
    }
    for (var yy = y(0.4); yy < S * 0.84; yy++) {
      var t = (yy - y(0.4)) / (S * 0.84 - y(0.4));
      var w = S * (0.085 + t * 0.075) * (p.build || 1) * (p.gluttonJowls && t < 0.5 ? 1.18 : 1);
      (function (t, w) {
        row(put, Math.round(yy), cx - w, cx + w, function (tx) {
          var b = mix(toga[1], toga[0], clamp(tx * 1.25, 0, 1));
          if (tx > 0.76) b = mix(b, toga[2], 0.6);
          if (((tx * 9) | 0) % 3 === 0 && t > 0.25) b = mix(b, toga[2], 0.25);
          return b;
        });
      })(t, w);
    }
    row(put, Math.round(S * 0.83), cx - S * 0.16 * (p.build || 1), cx + S * 0.16 * (p.build || 1), function () { return p.trim || C.gold; });
    if (p.sash !== false) {
      for (var ts = 0; ts < 1; ts += 0.02) {
        var sx = cx - S * 0.07 + ts * S * 0.13, sy = y(0.42) + ts * S * 0.22;
        (function (ts) { stroke(put, sx, sy, sx + S * 0.012, sy + S * 0.012, S * 0.032, function () { return mix(p.sashC || C.purple, C.purpleDk, ts * 0.5); }); })(ts);
      }
    }
    var armY = y(0.47), g = p.gesture;
    if (g === 'goblet') {
      stroke(put, cx - S * 0.08, armY, cx - S * 0.16, y(0.42), S * 0.024, function () { return toga[0]; });
      ell(put, cx - S * 0.175, y(0.4), S * 0.028, S * 0.02, function (tx, ty) { return mix(C.goldLt, C.goldDk, tx + ty * 0.3); });
      stroke(put, cx - S * 0.175, y(0.42), cx - S * 0.175, y(0.44), 2, function () { return C.goldDk; });
      put(Math.round(cx - S * 0.18), Math.round(y(0.395)), '#8a1622');
    } else if (g === 'scroll' || g === 'stylus') {
      stroke(put, cx - S * 0.08, armY, cx - S * 0.15, y(0.52), S * 0.024, function () { return toga[0]; });
      plate(put, cx - S * 0.2, y(0.5), cx - S * 0.1, y(0.55), C.bone, '#fff8e0', C.boneDk);
      [0.515, 0.53].forEach(function (ly) { row(put, Math.round(y(ly)), cx - S * 0.185, cx - S * 0.115, function () { return C.marbleDkk; }); });
    } else {
      stroke(put, cx - S * 0.08, armY, cx - S * 0.13, y(0.58), S * 0.024, function () { return toga[0]; });
      ell(put, cx - S * 0.135, y(0.6), S * 0.018, S * 0.016, function (tx, ty) { return mix(skin[0], skin[1], tx + ty); });
    }
    if (g === 'thumbsDown' || g === 'thumbsUp') {
      stroke(put, cx + S * 0.08, armY, cx + S * 0.19, y(0.4), S * 0.026, function () { return toga[0]; });
      ell(put, cx + S * 0.21, y(0.385), S * 0.026, S * 0.024, function (tx, ty) { return mix(skin[0], skin[1], tx + ty * 0.4); });
      var dir = g === 'thumbsDown' ? 1 : -1;
      stroke(put, cx + S * 0.21, y(0.385) + dir * S * 0.02, cx + S * 0.21, y(0.385) + dir * S * 0.055, S * 0.014, function () { return skin[0]; });
      if (p.rings) put(Math.round(cx + S * 0.2), Math.round(y(0.39)), C.goldLt);
    } else if (g === 'sword') {
      stroke(put, cx + S * 0.08, armY, cx + S * 0.17, y(0.36), S * 0.026, function () { return toga[0]; });
      stroke(put, cx + S * 0.18, y(0.35), cx + S * 0.25, y(0.22), 2.8, function () { return C.ironLt; });
      stroke(put, cx + S * 0.165, y(0.37), cx + S * 0.2, y(0.345), 2.2, function () { return C.goldDk; });
    } else {
      stroke(put, cx + S * 0.08, armY, cx + S * 0.13, y(0.58), S * 0.024, function () { return toga[0]; });
    }
    var hy = y(0.33);
    ell(put, cx, hy, S * 0.056, S * 0.06, function (tx, ty) { return mix(skin[0], skin[1], clamp(tx + ty * 0.3, 0, 1)); });
    if (p.gluttonJowls) ell(put, cx, hy + S * 0.03, S * 0.06, S * 0.035, function (tx, ty) { return mix(skin[0], skin[1], clamp(tx + ty * 0.4, 0, 1)); });
    var eyeC = p.eyeC || C.oil;
    optic(put, cx - S * 0.02, hy - S * 0.01, S * 0.01, C.oil, eyeC, p.eyeGlow ? eyeC : '#ffffff');
    optic(put, cx + S * 0.02, hy - S * 0.01, S * 0.01, C.oil, eyeC, p.eyeGlow ? eyeC : '#ffffff');
    if (p.eyeGlow) { put(Math.round(cx - S * 0.02), Math.round(hy - S * 0.01), eyeC); put(Math.round(cx + S * 0.02), Math.round(hy - S * 0.01), eyeC); }
    row(put, Math.round(hy + S * (p.gluttonJowls ? 0.022 : 0.032)), cx - S * 0.016, cx + S * 0.012, function () { return C.oil; });
    if (!p.hood) for (var xf = -0.045; xf <= 0.045; xf += 0.012) put(Math.round(cx + xf * S), Math.round(hy - S * 0.05), p.hairC || '#6a5436');
    if (p.laurelC === 'gold') { laurel(put, cx, hy - S * 0.035, S * 0.062, C.goldLt); laurel(put, cx, hy - S * 0.03, S * 0.058, C.gold); }
    else if (p.laurelC === 'green') laurel(put, cx, hy - S * 0.032, S * 0.06, '#5a7e46');
    if (p.crownSpikes) for (var ic = -3; ic <= 3; ic++) stroke(put, cx + ic * S * 0.017, hy - S * 0.05, cx + ic * S * 0.022, hy - S * 0.085, 1.6, function () { return C.goldLt; });
  }
  // FINAL: golden god (V.golden, gesture none) + the raised PIMP CUP + bling.
  function drawDivinity(put, S) {
    var V = { toga: [C.gold, C.goldLt, C.goldDk], sash: false, trim: C.crimson,
      laurelC: 'gold', crownSpikes: true, gesture: 'none', cape: [C.crimson, C.crimsonDk],
      eyeC: C.goldLt, eyeGlow: true, skin: ['#e8c898', '#b89058'] };
    emperor(put, S, V);
    var cx = S * 0.5, y = function (v) { return S * v; };
    stroke(put, cx + S * 0.08, y(0.47), cx + S * 0.17, y(0.34), S * 0.028, function () { return C.gold; });
    ell(put, cx + S * 0.18, y(0.325), S * 0.02, S * 0.018, function (tx, ty) { return mix('#e8c898', '#b89058', tx + ty); });
    var gx = cx + S * 0.19, gy = y(0.24);
    for (var yy = gy; yy < gy + S * 0.06; yy++) {
      var t = (yy - gy) / (S * 0.06), w = S * (0.055 - t * 0.028);
      (function (t, w) {
        row(put, Math.round(yy), gx - w, gx + w, function (tx) {
          var b = mix(C.goldLt, C.gold, clamp(tx * 1.2 + t * 0.2, 0, 1));
          if (tx > 0.78) b = mix(b, C.goldDk, 0.5);
          return b;
        });
      })(t, w);
    }
    row(put, Math.round(gy), gx - S * 0.055, gx + S * 0.055, function () { return C.goldLt; });
    row(put, Math.round(gy + 1), gx - S * 0.045, gx + S * 0.045, function () { return '#8a1622'; });
    stroke(put, gx, gy + S * 0.06, gx, gy + S * 0.085, S * 0.014, function () { return C.goldDk; });
    ell(put, gx, gy + S * 0.09, S * 0.03, S * 0.012, function (tx, ty) { return mix(C.gold, C.goldDk, tx); });
    [[-0.035, 0.035, C.crimsonLt], [0, 0.04, '#41d6f6'], [0.035, 0.035, '#5fe86b']].forEach(function (q) {
      ell(put, gx + q[0] * S, gy + q[1] * S, S * 0.011, S * 0.011, function () { return q[2]; });
      put(Math.round(gx + q[0] * S - 1), Math.round(gy + q[1] * S - 1), '#ffffff');
    });
    [[-0.045, 0.015, '#a06bd6'], [0.045, 0.015, '#ff9a3a']].forEach(function (q) {
      ell(put, gx + q[0] * S, gy + q[1] * S, S * 0.009, S * 0.009, function () { return q[2]; });
      put(Math.round(gx + q[0] * S), Math.round(gy + q[1] * S - 1), '#ffffff');
    });
    ell(put, gx, gy + S * 0.073, S * 0.008, S * 0.008, function () { return C.crimsonLt; });
    for (var a = 0.25; a < Math.PI - 0.25; a += 0.16) {
      var nx = cx + Math.cos(a) * S * 0.075, ny = y(0.42) + Math.sin(a) * S * 0.045;
      ell(put, nx, ny, S * 0.011, S * 0.011, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.08 ? mix(C.goldLt, C.goldDk, tx) : null); });
    }
    ell(put, cx, y(0.485), S * 0.026, S * 0.026, function (tx, ty) { return mix(C.goldLt, C.goldDk, clamp(tx + ty * 0.4, 0, 1)); });
    ell(put, cx, y(0.485), S * 0.01, S * 0.01, function () { return C.crimsonLt; });
    put(Math.round(cx - 2), Math.round(y(0.478)), '#ffffff');
    for (var a2 = 0.3; a2 < Math.PI - 0.3; a2 += 0.1) put(Math.round(cx + Math.cos(a2) * S * 0.06), Math.round(y(0.44) + Math.sin(a2) * S * 0.055), C.goldLt);
    [[0.165, 0.33, '#41d6f6'], [0.19, 0.335, C.crimsonLt], [0.2, 0.325, '#5fe86b']].forEach(function (q) {
      put(Math.round(cx + q[0] * S), Math.round(S * q[1]), q[2]);
      put(Math.round(cx + q[0] * S), Math.round(S * q[1] - 1), C.goldLt);
    });
    [[-0.051, 0.225, C.crimsonLt], [-0.017, 0.21, '#41d6f6'], [0.017, 0.21, '#a06bd6'], [0.051, 0.225, '#5fe86b']].forEach(function (q) {
      put(Math.round(cx + q[0] * S), Math.round(S * q[1]), q[2]);
    });
    put(Math.round(cx + S * 0.008), Math.round(y(0.363)), C.goldLt);
    [[0.13, 0.2], [0.26, 0.23], [0.2, 0.16], [0.24, 0.3], [-0.12, 0.4], [0.1, 0.5],
     [-0.06, 0.24], [0.05, 0.19], [-0.15, 0.6], [0.14, 0.66], [-0.02, 0.45]].forEach(function (q) {
      put(Math.round(cx + q[0] * S), Math.round(S * q[1]), '#ffffff');
      put(Math.round(cx + q[0] * S + 1), Math.round(S * q[1]), C.goldLt);
      put(Math.round(cx + q[0] * S - 1), Math.round(S * q[1]), C.goldLt);
      put(Math.round(cx + q[0] * S), Math.round(S * q[1] - 1), C.goldLt);
      put(Math.round(cx + q[0] * S), Math.round(S * q[1] + 1), C.goldLt);
    });
  }

  // ============================= DECOR (18) ==================================
  function marbleFill(put, x0, y0, x1, y1) {
    for (var y = Math.round(y0); y < y1; y++) {
      var vt = (y - y0) / Math.max(1, y1 - y0);
      (function (vt, y) {
        row(put, y, x0, x1, function (tx) {
          var b = mix(C.marbleLt, C.marble, clamp(tx * 1.2 + vt * 0.2, 0, 1));
          if (tx > 0.85) b = mix(b, C.marbleDk, 0.5);
          var n = Math.sin(tx * 40 + y * 3.1) * 43758.5453;
          if ((n - Math.floor(n)) > 0.94) b = mix(b, C.marbleDk, 0.3);
          return b;
        });
      })(vt, y);
    }
  }
  function columnShaft(put, cx, y0, y1, w) {
    for (var y = Math.round(y0); y < y1; y++) {
      row(put, y, cx - w, cx + w, function (tx) {
        var b = mix(C.marbleLt, C.marble, clamp(tx * 1.3, 0, 1));
        if (tx > 0.8) b = mix(b, C.marbleDk, 0.55);
        if (((tx * 7) | 0) % 2 === 0) b = mix(b, C.marbleDk, 0.22);
        return b;
      });
    }
  }
  function drawBox(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.34);
    marbleFill(put, S * 0.2, S * 0.5, S * 0.8, S * 0.86);
    row(put, Math.round(S * 0.5), S * 0.18, S * 0.82, function () { return C.gold; });
    for (var i = 0; i < 7; i++) stroke(put, S * (0.24 + i * 0.09), S * 0.52, S * (0.24 + i * 0.09), S * 0.62, 2.2, function () { return C.marbleDk; });
    row(put, Math.round(S * 0.52), S * 0.22, S * 0.78, function () { return C.marbleLt; });
    for (var yb = Math.round(S * 0.2); yb < S * 0.32; yb++) {
      var tb = (yb - S * 0.2) / (S * 0.12);
      (function (tb) { row(put, yb, cx - S * (0.3 + tb * 0.05), cx + S * (0.3 + tb * 0.05), function (tx) { return ((tx * 10 | 0) % 2 ? C.purple : C.purpleLt); }); })(tb);
    }
    row(put, Math.round(S * 0.32), cx - S * 0.35, cx + S * 0.35, function () { return C.gold; });
    [-0.32, 0.32].forEach(function (dx) { stroke(put, cx + dx * S, S * 0.32, cx + dx * S, S * 0.5, 2.4, function () { return C.goldDk; }); });
    plate(put, cx - S * 0.07, S * 0.56, cx + S * 0.07, S * 0.68, C.gold, C.goldLt, C.goldDk);
    ell(put, cx, S * 0.42, S * 0.05, S * 0.05, function (tx, ty) { return mix(C.crimson, C.crimsonDk, tx + ty * 0.3); });
    laurel(put, cx, S * 0.42, S * 0.06, '#5a7e46');
  }
  function drawGate(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.32);
    marbleFill(put, S * 0.16, S * 0.3, S * 0.84, S * 0.86);
    for (var y = Math.round(S * 0.42); y < S * 0.86; y++) {
      var t = (y - S * 0.42) / (S * 0.44);
      (function (t) { row(put, y, cx - S * 0.17, cx + S * 0.17, function (tx) { return mix('#241812', C.oil, clamp(tx + t * 0.4, 0, 1)); }); })(t);
    }
    for (var i = -2; i <= 2; i++) stroke(put, cx + i * S * 0.065, S * 0.44, cx + i * S * 0.065, S * 0.84, 2, function () { return C.ironDk; });
    [0.52, 0.64, 0.76].forEach(function (yy) { row(put, Math.round(S * yy), cx - S * 0.15, cx + S * 0.15, function () { return C.ironDk; }); });
    put(Math.round(cx - S * 0.04), Math.round(S * 0.6), C.gold); put(Math.round(cx - S * 0.01), Math.round(S * 0.6), C.gold);
    plate(put, cx - S * 0.05, S * 0.34, cx + S * 0.05, S * 0.42, C.marbleDk, C.marble, C.marbleDkk);
  }
  function drawColumn(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    columnShaft(put, cx, S * 0.24, S * 0.8, S * 0.085);
    plate(put, cx - S * 0.13, S * 0.14, cx + S * 0.13, S * 0.24, C.marble, C.marbleLt, C.marbleDk);
    row(put, Math.round(S * 0.14), cx - S * 0.14, cx + S * 0.14, function () { return C.marbleLt; });
    plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, C.marble, C.marbleLt, C.marbleDk);
  }
  function drawBroken(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    columnShaft(put, cx, S * 0.44, S * 0.8, S * 0.09);
    for (var x = -0.09; x <= 0.09; x += 0.012) {
      var h = 0.44 - Math.abs(Math.sin(x * 60)) * 0.06;
      for (var y = h; y < 0.47; y += 0.008) put(Math.round(cx + x * S), Math.round(S * y), C.marbleDk);
    }
    plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, C.marble, C.marbleLt, C.marbleDk);
    ell(put, cx + S * 0.24, S * 0.8, S * 0.09, S * 0.055, function (tx, ty) { return mix(C.marble, C.marbleDk, clamp(tx + ty * 0.4, 0, 1)); });
    for (var i = 0; i < 3; i++) stroke(put, cx + S * (0.17 + i * 0.05), S * 0.76, cx + S * (0.18 + i * 0.05), S * 0.84, 1, function () { return C.marbleDkk; });
  }
  function drawBrazier(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    [[-0.12], [0.12]].forEach(function (p) { stroke(put, cx + p[0] * S * 0.4, S * 0.56, cx + p[0] * S, S * 0.84, 2.4, function () { return C.bronzeDk; }); });
    for (var y = Math.round(S * 0.46); y < S * 0.58; y++) {
      var t = (y - S * 0.46) / (S * 0.12), w = S * (0.16 - t * 0.07);
      (function (t, w) { row(put, y, cx - w, cx + w, function (tx) { return mix(C.bronzeLt, C.bronzeDk, clamp(tx * 1.1 + t * 0.3, 0, 1)); }); })(t, w);
    }
    row(put, Math.round(S * 0.46), cx - S * 0.17, cx + S * 0.17, function () { return C.bronzeLt; });
    for (var i = -2; i <= 2; i++) {
      var fx = cx + i * S * 0.05, hh = S * (0.12 - Math.abs(i) * 0.025);
      for (var tf = 0; tf < 1; tf += 0.12) {
        var yy = S * 0.44 - tf * hh, ww = S * 0.02 * (1 - tf);
        (function (tf) { ell(put, fx + Math.sin(tf * 7 + i) * 2, yy, ww, ww * 1.4, function (tx, ty) { return (tf > 0.6 ? '#ffd34d' : mix('#ff7d3a', '#c23a1a', ty)); }); })(tf);
      }
    }
    put(Math.round(cx), Math.round(S * 0.28), '#ffe8a0');
  }
  function drawBanner(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.16);
    stroke(put, cx, S * 0.14, cx, S * 0.86, 2.6, function () { return C.woodDk; });
    stroke(put, cx - S * 0.16, S * 0.2, cx + S * 0.16, S * 0.2, 2.2, function () { return C.bronze; });
    for (var y = Math.round(S * 0.22); y < S * 0.62; y++) {
      var t = (y - S * 0.22) / (S * 0.4), sway = Math.sin(t * 3) * S * 0.012;
      (function (sway) {
        row(put, y, cx - S * 0.14 + sway, cx + S * 0.14 + sway, function (tx) {
          var b = mix(C.crimsonLt, C.crimson, clamp(tx * 1.2, 0, 1));
          if (tx > 0.82) b = mix(b, C.crimsonDk, 0.5);
          return b;
        });
      })(sway);
    }
    for (var i = 0; i < 7; i++) stroke(put, cx - S * 0.12 + i * S * 0.04, S * 0.62, cx - S * 0.12 + i * S * 0.04, S * 0.67, 1.4, function () { return C.gold; });
    laurel(put, cx, S * 0.34, S * 0.055, C.goldLt);
    [0.44, 0.5].forEach(function (yy, i) { row(put, Math.round(S * yy), cx - S * 0.07, cx + S * 0.07, function () { return (i ? C.goldDk : C.gold); }); });
    stroke(put, cx, S * 0.14, cx, S * 0.08, 2, function () { return C.bronzeLt; });
  }
  function drawStatue(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.24);
    marbleFill(put, cx - S * 0.14, S * 0.7, cx + S * 0.14, S * 0.86);
    var b = [C.bronze, C.bronzeLt, C.bronzeDk];
    [-1, 1].forEach(function (s) { stroke(put, cx + s * S * 0.03, S * 0.56, cx + s * S * 0.04, S * 0.7, S * 0.024, function () { return b[0]; }); });
    for (var y = S * 0.4; y < S * 0.57; y++) {
      var t = (y - S * 0.4) / (S * 0.17), w = S * (0.06 + t * 0.012);
      (function (t, w) { row(put, Math.round(y), cx - w, cx + w, function (tx) { return mix(b[1], b[2], clamp(tx * 1.1 + t * 0.2, 0, 1)); }); })(t, w);
    }
    stroke(put, cx + S * 0.05, S * 0.44, cx + S * 0.13, S * 0.32, S * 0.018, function () { return b[0]; });
    stroke(put, cx + S * 0.13, S * 0.31, cx + S * 0.18, S * 0.2, 2.2, function () { return b[1]; });
    stroke(put, cx - S * 0.05, S * 0.44, cx - S * 0.12, S * 0.52, S * 0.018, function () { return b[0]; });
    ell(put, cx, S * 0.36, S * 0.04, S * 0.045, function (tx, ty) { return mix(b[1], b[2], tx + ty * 0.3); });
    galea(put, cx, S * 0.325, S * 0.045, [b[2], b[0]], b);
    [[0.02, 0.5], [-0.03, 0.6]].forEach(function (p) { stroke(put, cx + p[0] * S, S * p[1], cx + p[0] * S, S * (p[1] + 0.08), 1.2, function () { return '#4a8a6a'; }); });
  }
  function drawRack(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.3);
    [-0.2, 0.2].forEach(function (dx) { stroke(put, cx + dx * S, S * 0.34, cx + dx * S, S * 0.84, 2.6, function () { return C.woodDk; }); });
    [0.38, 0.6].forEach(function (yy) { stroke(put, cx - S * 0.22, S * yy, cx + S * 0.22, S * yy, 2.2, function () { return C.wood; }); });
    [-0.1, 0].forEach(function (dx) { stroke(put, cx + dx * S, S * 0.4, cx + dx * S, S * 0.56, 1.8, function () { return C.ironLt; }); put(Math.round(cx + dx * S), Math.round(S * 0.4), C.gold); });
    stroke(put, cx + S * 0.12, S * 0.38, cx + S * 0.16, S * 0.84, 1.6, function () { return C.wood; });
    put(Math.round(cx + S * 0.115), Math.round(S * 0.36), C.ironLt);
    ell(put, cx - S * 0.12, S * 0.72, S * 0.08, S * 0.1, function (tx, ty) { return mix(C.crimson, C.crimsonDk, clamp(tx + ty * 0.3, 0, 1)); });
    ell(put, cx - S * 0.12, S * 0.72, S * 0.025, S * 0.03, function (tx, ty) { return mix(C.gold, C.goldDk, ty); });
  }
  function drawTrapdoor(put, S) {
    var cx = S * 0.5;
    for (var y0 = Math.round(S * 0.3); y0 < S * 0.85; y0++) (function (y0) { row(put, y0, S * 0.12, S * 0.88, function (tx) { var n = Math.sin(tx * 50 + y0 * 7) * 43758.5; return mix(C.sand, C.sandDk, (n - Math.floor(n)) * 0.4); }); })(y0);
    plate(put, cx - S * 0.22, S * 0.44, cx + S * 0.22, S * 0.74, C.woodDk, C.wood, '#241812');
    for (var y = Math.round(S * 0.47); y < S * 0.71; y++) (function (y) { row(put, y, cx - S * 0.19, cx, function (tx) { return mix('#241812', C.oil, tx + 0.3); }); })(y);
    for (var y2 = Math.round(S * 0.47); y2 < S * 0.71; y2++) {
      row(put, y2, cx + S * 0.01, cx + S * 0.19, function (tx) {
        var b = mix(C.woodLt, C.wood, clamp(tx * 1.2, 0, 1));
        if (((tx * 5) | 0) % 2 === 0) b = mix(b, C.woodDk, 0.35);
        return b;
      });
    }
    stroke(put, cx + S * 0.01, S * 0.47, cx + S * 0.01, S * 0.71, 1.6, function () { return C.ironDk; });
    put(Math.round(cx + S * 0.16), Math.round(S * 0.59), C.ironLt);
    [[-0.1, 0.5], [-0.05, 0.47]].forEach(function (p) { stroke(put, cx + p[0] * S, S * (p[1] + 0.06), cx + p[0] * S + 2, S * p[1], 1.4, function () { return '#3a2a14'; }); });
  }
  function drawObelisk(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.16, S * 0.76, cx + S * 0.16, S * 0.86, C.marble, C.marbleLt, C.marbleDk);
    plate(put, cx - S * 0.11, S * 0.68, cx + S * 0.11, S * 0.76, C.marbleDk, C.marble, C.marbleDkk);
    for (var y = Math.round(S * 0.2); y < S * 0.68; y++) {
      var t = (y - S * 0.2) / (S * 0.48), w = S * (0.035 + t * 0.045);
      (function (t, w, y) {
        row(put, y, cx - w, cx + w, function (tx) {
          var b = mix('#c88a6a', '#8a5038', clamp(tx * 1.25, 0, 1));
          if (tx > 0.8) b = mix(b, '#5e3222', 0.5);
          if ((y % 9) === 0 && Math.abs(tx - 0.5) < 0.25) b = mix(b, '#5e3222', 0.4);
          return b;
        });
      })(t, w, y);
    }
    for (var y2 = 0; y2 < S * 0.08; y2++) { var t2 = y2 / (S * 0.08), w2 = S * 0.035 * t2; (function (t2, w2, y2) { row(put, Math.round(S * 0.12 + y2), cx - w2, cx + w2, function (tx) { return mix(C.goldLt, C.goldDk, tx + (1 - t2) * 0.3); }); })(t2, w2, y2); }
  }
  function drawArch(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.34);
    [-0.24, 0.24].forEach(function (dx) { columnShaft(put, cx + dx * S, S * 0.4, S * 0.84, S * 0.05); plate(put, cx + dx * S - S * 0.07, S * 0.84, cx + dx * S + S * 0.07, S * 0.88, C.marble, C.marbleLt, C.marbleDk); });
    for (var a = 0; a <= Math.PI; a += 0.03) {
      var x = cx + Math.cos(a) * S * 0.24, y = S * 0.4 - Math.sin(a) * S * 0.14;
      (function (a) { stroke(put, x, y, x, y + S * 0.05, 2.6, function () { return mix(C.marble, C.marbleDk, Math.abs(Math.cos(a))); }); })(a);
    }
    plate(put, cx - S * 0.32, S * 0.18, cx + S * 0.32, S * 0.28, C.marble, C.marbleLt, C.marbleDk);
    laurel(put, cx, S * 0.24, S * 0.06, '#5a7e46');
    row(put, Math.round(S * 0.28), cx - S * 0.32, cx + S * 0.32, function () { return C.gold; });
    for (var a2 = 0.2; a2 < Math.PI - 0.2; a2 += 0.14) put(Math.round(cx - Math.cos(a2) * S * 0.2), Math.round(S * 0.42 + Math.sin(a2) * S * 0.05), '#5a7e46');
  }
  function drawChains(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.2);
    stroke(put, cx, S * 0.34, cx, S * 0.84, S * 0.036, function () { return C.ironDk; });
    dome(put, cx, S * 0.33, S * 0.032, S * 0.026, C.iron, C.ironLt, C.ironDk);
    [[-1, 0.22], [1, 0.18]].forEach(function (p) {
      var s = p[0], reach = p[1];
      for (var t = 0; t < 1; t += 0.09) {
        var nx = cx + s * S * (0.02 + t * reach), ny = S * (0.4 + t * t * 0.4);
        ell(put, nx, ny, S * 0.014, S * 0.02, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.1 ? mix(C.ironLt, C.ironDk, tx) : null); });
      }
      ell(put, cx + s * S * (0.02 + reach), S * 0.8, S * 0.03, S * 0.026, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.12 ? C.iron : null); });
    });
  }
  function drawTorch(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.14);
    stroke(put, cx, S * 0.3, cx, S * 0.86, 2.6, function () { return C.woodDk; });
    stroke(put, cx, S * 0.34, cx + S * 0.08, S * 0.28, 2, function () { return C.bronzeDk; });
    ell(put, cx + S * 0.09, S * 0.27, S * 0.045, S * 0.028, function (tx, ty) { return mix(C.bronzeLt, C.bronzeDk, tx + ty * 0.4); });
    for (var t = 0; t < 1; t += 0.14) {
      var y = S * 0.24 - t * S * 0.09, w = S * 0.024 * (1 - t);
      (function (t) { ell(put, cx + S * 0.09 + Math.sin(t * 8) * 1.5, y, w, w * 1.5, function (tx, ty) { return (t > 0.55 ? '#ffd34d' : mix('#ff7d3a', '#c23a1a', ty)); }); })(t);
    }
    put(Math.round(cx + S * 0.09), Math.round(S * 0.13), '#ffe8a0');
    [0.44, 0.48, 0.52].forEach(function (yy) { row(put, Math.round(S * yy), cx - S * 0.014, cx + S * 0.014, function () { return C.leather; }); });
  }
  function drawPlinth(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.22);
    plate(put, cx - S * 0.16, S * 0.72, cx + S * 0.16, S * 0.84, C.marble, C.marbleLt, C.marbleDk);
    marbleFill(put, cx - S * 0.12, S * 0.5, cx + S * 0.12, S * 0.72);
    plate(put, cx - S * 0.15, S * 0.44, cx + S * 0.15, S * 0.5, C.marble, C.marbleLt, C.marbleDk);
    [0.58, 0.62, 0.66].forEach(function (yy, i) { row(put, Math.round(S * yy), cx - S * (0.08 - i * 0.02), cx + S * (0.08 - i * 0.02), function () { return C.marbleDkk; }); });
    laurel(put, cx, S * 0.42, S * 0.05, '#5a7e46');
  }
  function drawCage(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.34);
    plate(put, cx - S * 0.26, S * 0.62, cx + S * 0.26, S * 0.7, C.wood, C.woodLt, C.woodDk);
    [[-0.17], [0.17]].forEach(function (p) {
      var wx = cx + p[0] * S, wy = S * 0.77;
      ell(put, wx, wy, S * 0.07, S * 0.07, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.14 ? mix(C.wood, C.woodDk, tx) : null); });
      for (var i = 0; i < 3; i++) { var a = i * Math.PI / 3; stroke(put, wx - Math.cos(a) * S * 0.07, wy - Math.sin(a) * S * 0.07, wx + Math.cos(a) * S * 0.07, wy + Math.sin(a) * S * 0.07, 1.2, function () { return C.woodDk; }); }
    });
    for (var y = Math.round(S * 0.36); y < S * 0.62; y++) row(put, y, cx - S * 0.24, cx + S * 0.24, function (tx) { return mix('#241812', C.oil, clamp(tx * 0.8 + 0.2, 0, 1)); });
    plate(put, cx - S * 0.26, S * 0.33, cx + S * 0.26, S * 0.37, C.iron, C.ironLt, C.ironDk);
    for (var i2 = -3; i2 <= 3; i2++) stroke(put, cx + i2 * S * 0.07, S * 0.36, cx + i2 * S * 0.07, S * 0.62, 2, function () { return C.iron; });
    put(Math.round(cx - S * 0.03), Math.round(S * 0.48), C.gold); put(Math.round(cx + S * 0.01), Math.round(S * 0.48), C.gold);
    stroke(put, cx + S * 0.1, S * 0.56, cx + S * 0.13, S * 0.6, 1.4, function () { return C.furDk; });
  }
  function drawMast(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.16);
    stroke(put, cx - S * 0.08, S * 0.2, cx - S * 0.08, S * 0.86, 2.8, function () { return C.woodDk; });
    stroke(put, cx - S * 0.08, S * 0.26, cx + S * 0.22, S * 0.34, 2.2, function () { return C.wood; });
    for (var y = Math.round(S * 0.35); y < S * 0.56; y++) {
      var t = (y - S * 0.35) / (S * 0.21);
      (function (t) {
        row(put, y, cx - S * 0.06 + t * S * 0.02, cx + S * (0.21 - t * 0.24), function (tx) {
          var b = mix('#f4e8c8', '#c8b088', clamp(tx + t * 0.3, 0, 1));
          if (((tx * 8) | 0) % 3 === 0) b = mix(b, C.crimsonLt, 0.25);
          return b;
        });
      })(t);
    }
    stroke(put, cx + S * 0.22, S * 0.34, cx + S * 0.14, S * 0.84, 1, function () { return C.leatherDk; });
    stroke(put, cx - S * 0.08, S * 0.2, cx + S * 0.1, S * 0.56, 1, function () { return C.boneDk; });
    put(Math.round(cx + S * 0.14), Math.round(S * 0.84), C.bronze);
  }
  function drawPalus(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.18);
    stroke(put, cx, S * 0.3, cx, S * 0.84, S * 0.05, function () { return C.wood; });
    [[0.4, -1], [0.48, 1], [0.56, -1], [0.62, 1]].forEach(function (p) { stroke(put, cx - p[1] * S * 0.03, S * p[0], cx + p[1] * S * 0.03, S * (p[0] - 0.02), 1.4, function () { return C.woodDk; }); });
    ell(put, cx - S * 0.02, S * 0.35, S * 0.05, S * 0.05, function (tx, ty) { return mix(C.bronze, C.bronzeDk, tx + ty * 0.3); });
    galea(put, cx, S * 0.3, S * 0.05, [C.crimsonDk, C.crimson], [C.bronzeDk, C.bronze, '#3a2410']);
    ell(put, cx + S * 0.09, S * 0.52, S * 0.055, S * 0.075, function (tx, ty) { return mix(C.crimsonDk, '#3a0c0e', clamp(tx + ty * 0.3, 0, 1)); });
    for (var i = -4; i <= 4; i++) stroke(put, cx + i * S * 0.02, S * 0.84, cx + i * S * 0.03, S * 0.78, 1, function () { return '#c8b060'; });
  }
  function drawWolf(put, S) {
    var cx = S * 0.5; shadow(put, S, cx, S * 0.26);
    marbleFill(put, cx - S * 0.2, S * 0.7, cx + S * 0.2, S * 0.84);
    var g = [C.gold, C.goldLt, C.goldDk];
    ell(put, cx + S * 0.02, S * 0.56, S * 0.14, S * 0.07, function (tx, ty) { return mix(g[1], g[2], clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    [[-0.08], [0.1]].forEach(function (p) { stroke(put, cx + p[0] * S, S * 0.6, cx + p[0] * S, S * 0.7, S * 0.02, function () { return g[0]; }); });
    stroke(put, cx - S * 0.12, S * 0.54, cx - S * 0.17, S * 0.46, S * 0.03, function () { return g[0]; });
    ell(put, cx - S * 0.185, S * 0.44, S * 0.04, S * 0.032, function (tx, ty) { return mix(g[1], g[2], tx + ty * 0.3); });
    put(Math.round(cx - S * 0.22), Math.round(S * 0.445), g[2]);
    [[-0.2, 0.41], [-0.165, 0.405]].forEach(function (p) { stroke(put, cx + p[0] * S, S * p[1], cx + p[0] * S + 1.4, S * (p[1] - 0.02), 1.4, function () { return g[0]; }); });
    put(Math.round(cx - S * 0.19), Math.round(S * 0.43), C.oil);
    stroke(put, cx + S * 0.16, S * 0.55, cx + S * 0.22, S * 0.5, S * 0.014, function () { return g[0]; });
    [[-0.03, 0.66], [0.05, 0.66]].forEach(function (p) { ell(put, cx + p[0] * S, S * p[1], S * 0.022, S * 0.02, function (tx, ty) { return mix(g[1], g[2], ty); }); });
  }

  // ============================== TILES (10) =================================
  function n2(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function fillTile(fn) { return function (put, Sz) { for (var y = 0; y < Sz; y++) for (var x = 0; x < Sz; x++) { var c = fn(x, y, Sz); if (c) put(x, y, c); } }; }
  var tSand = fillTile(function (x, y) {
    var b = mix(C.sandLt, C.sand, n2(x * 0.06, y * 0.06) * 0.8);
    var rake = Math.sin((y + Math.sin(x * 0.03) * 5) * 0.5);
    if (rake > 0.82) b = mix(b, C.sandDk, 0.28);
    if (n2(x, y) > 0.982) b = mix(b, C.sandDkk, 0.4);
    if (n2(x + 7, y) > 0.988) b = mix(b, '#fff0c8', 0.5);
    return b;
  });
  var tBlood = fillTile(function (x, y, Sz) {
    var b = mix(C.sandLt, C.sand, n2(x * 0.06, y * 0.06) * 0.8);
    [[0.25, 0.3, 0.13], [0.7, 0.6, 0.18], [0.5, 0.85, 0.09], [0.85, 0.15, 0.07]].forEach(function (p) {
      var d = Math.hypot(x - p[0] * Sz, y - p[1] * Sz) / Sz;
      if (d < p[2] * (0.7 + n2(x * 0.4, y * 0.4) * 0.5)) b = mix(b, C.blood, clamp(0.75 - d / p[2], 0.1, 0.7));
    });
    if (n2(x + 3, y + 9) > 0.99) b = mix(b, C.blood, 0.5);
    if (Math.abs(y - (Sz * 0.55 + Math.sin(x * 0.05) * 4)) < 2 && x > Sz * 0.3) b = mix(b, '#7a3020', 0.35);
    return b;
  });
  var tMarble = fillTile(function (x, y, Sz) {
    var gx = Math.floor(x / (Sz * 0.25)), gy = Math.floor(y / (Sz * 0.25));
    var b = mix(C.marbleLt, C.marble, n2(gx, gy) * 0.5 + n2(x * 0.04, y * 0.04) * 0.3);
    var v = Math.sin(x * 0.09 + Math.sin(y * 0.07) * 3 + n2(gx, gy) * 9);
    if (v > 0.93) b = mix(b, C.marbleDk, 0.4);
    if (x % Math.round(Sz * 0.25) === 0 || y % Math.round(Sz * 0.25) === 0) b = mix(b, C.marbleDkk, 0.55);
    return b;
  });
  var tMosaic = (function () {
    var cols = ['#b8493a', '#3e6a8a', C.gold, C.marbleLt, '#4a7a52'];
    return fillTile(function (x, y, Sz) {
      var t = Sz * 0.055, gx = Math.floor(x / t), gy = Math.floor(y / t);
      var d = Math.abs(gx - 9) + Math.abs(gy - 9);
      var b = cols[d % 5];
      b = mix(b, '#241c14', n2(gx, gy) * 0.25);
      if (x % Math.round(t) === 0 || y % Math.round(t) === 0) b = mix(b, '#241c14', 0.6);
      return b;
    });
  })();
  var tPaving = fillTile(function (x, y, Sz) {
    var ry = Math.floor(y / (Sz * 0.2)), off = (ry % 2) * Sz * 0.17, rx = Math.floor((x + off) / (Sz * 0.34));
    var b = mix('#d8c8a8', '#a89070', n2(rx, ry) * 0.6 + n2(x * 0.08, y * 0.08) * 0.3);
    if (y % Math.round(Sz * 0.2) === 0 || (x + Math.round(off)) % Math.round(Sz * 0.34) === 0) b = mix(b, '#5e4e36', 0.6);
    if (n2(x + 5, y + 2) > 0.975) b = mix(b, '#5e4e36', 0.3);
    return b;
  });
  var tTrack = fillTile(function (x, y, Sz) {
    var b = mix('#c8a878', '#96784e', n2(x * 0.5, y * 0.5) * 0.4 + n2(x * 0.06, y * 0.06) * 0.35);
    [0.3, 0.42, 0.62, 0.74].forEach(function (ry) { if (Math.abs(y - Sz * (ry + Math.sin(x * 0.02) * 0.015)) < 2.2) b = mix(b, C.sandDkk, 0.45); });
    if (n2(Math.floor(x / 6), Math.floor(y / 5)) > 0.9) b = mix(b, C.sandDkk, 0.3);
    return b;
  });
  var tGrate = fillTile(function (x, y, Sz) {
    var gp = Sz * 0.125, inBarX = (x % Math.round(gp)) < 3, inBarY = (y % Math.round(gp)) < 3;
    if (inBarX || inBarY) return mix(C.ironLt, C.ironDk, n2(x * 0.3, y * 0.3) * 0.5 + ((inBarX && inBarY) ? 0 : 0.3));
    var b = mix('#181008', C.oil, clamp(n2(x * 0.05, y * 0.05) * 0.8 + 0.2, 0, 1));
    if (n2(Math.floor(x / 9), Math.floor(y / 9)) > 0.93) b = mix(b, C.gold, 0.25);
    return b;
  });
  var tCarpet = fillTile(function (x, y, Sz) {
    var b = mix(C.crimsonLt, C.crimson, n2(x * 0.15, y * 0.15) * 0.5 + 0.2);
    b = mix(b, C.crimsonDk, n2(x * 0.04, y * 0.04) * 0.3);
    var bx = Math.min(x, Sz - x), by = Math.min(y, Sz - y), bd = Math.min(bx, by);
    if (bd > Sz * 0.06 && bd < Sz * 0.1) b = mix(b, C.gold, 0.75);
    if (bd > Sz * 0.13 && bd < Sz * 0.15) b = mix(b, C.goldDk, 0.5);
    var d = Math.abs(x - Sz / 2) + Math.abs(y - Sz / 2);
    if (Math.abs(d - Sz * 0.18) < 1.8) b = mix(b, C.gold, 0.6);
    if (d < Sz * 0.04) b = mix(b, C.goldLt, 0.5);
    return b;
  });
  var tFlag = fillTile(function (x, y, Sz) {
    var cs = Sz * 0.26, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    var d1 = 9e9, d2 = 9e9, id = 0;
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      var px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      var d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 7 + (cyi + j); } else if (d < d2) d2 = d;
    }
    var b = mix('#a8a096', '#6e685c', n2(id, id * 3) * 0.6 + n2(x * 0.1, y * 0.1) * 0.25);
    var edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 2.4) { b = mix(b, '#3a352c', 0.7); if (n2(x * 0.6, y * 0.6) > 0.55) b = mix(b, '#5a7a44', 0.5); }
    return b;
  });
  var tGilt = fillTile(function (x, y, Sz) {
    var b = mix('#e8e2d4', '#c0b8a4', n2(x * 0.05, y * 0.05) * 0.5);
    var v = Math.sin(x * 0.07 + Math.sin(y * 0.09) * 2.5);
    if (v > 0.9) b = mix(b, C.marbleDk, 0.35);
    var t = Sz * 0.125, mx = x % Math.round(t * 2), my = y % Math.round(t * 2);
    var on = (mx < 3) || (my < 3 && mx < t) || (Math.abs(mx - t) < 3 && my < t);
    if (on) b = mix(b, C.gold, 0.7);
    if (on && n2(x, y) > 0.8) b = mix(b, C.goldLt, 0.6);
    return b;
  });

  // ============================ CROWD RING ==================================
  function fanDraw(put, S, fx, fy, seed, dim) {
    var f = function (k) { return n2(seed * 13.7 + k, seed * 7.3); };
    var tunics = [C.crimson, '#3e6a8a', C.gold, '#5a7e46', C.purple, '#b0a890', '#a06e42', C.crimsonDk];
    var skins = ['#d8a878', '#a87850', '#8a5a38', '#e8c898', '#6e4326'];
    var tun = tunics[(f(1) * 8) | 0], skin = skins[(f(2) * 5) | 0], pose = (f(3) * 5) | 0;
    var dd = function (c) { return dim ? mix(c, '#141018', dim) : c; };
    var h = S * 0.055;
    for (var y = 0; y < h; y++) {
      var t = y / h, w = S * (0.014 + t * 0.006);
      (function (t, w, y) { row(put, Math.round(fy - y), fx - w, fx + w, function (tx) { return dd(mix(tun, '#241c14', clamp(tx * 0.8 + t * 0.25, 0, 0.55))); }); })(t, w, y);
    }
    ell(put, fx, fy - h - S * 0.014, S * 0.012, S * 0.013, function (tx, ty) { return dd(mix(skin, '#3a2414', clamp(tx * 0.7 + ty * 0.4, 0, 0.5))); });
    ell(put, fx, fy - h - S * 0.02, S * 0.011, S * 0.007, function () { return dd(f(4) > 0.5 ? '#2a1c10' : '#5a4430'); });
    var aY = fy - h * 0.75;
    if (pose === 1) { [-1, 1].forEach(function (s) { stroke(put, fx + s * S * 0.012, aY, fx + s * S * 0.028, aY - S * 0.03, S * 0.007, function () { return dd(skin); }); }); }
    else if (pose === 2) { stroke(put, fx + S * 0.012, aY, fx + S * 0.03, aY - S * 0.026, S * 0.007, function () { return dd(skin); }); }
    else if (pose === 3) {
      stroke(put, fx + S * 0.012, aY, fx + S * 0.026, aY - S * 0.03, S * 0.006, function () { return dd(skin); });
      stroke(put, fx + S * 0.028, aY - S * 0.055, fx + S * 0.028, aY - S * 0.028, S * 0.004, function () { return dd(C.woodDk); });
      for (var y2 = 0; y2 < S * 0.02; y2++) (function (y2) { row(put, Math.round(aY - S * 0.052 + y2), fx + S * 0.03, fx + S * 0.048 - y2 * 0.3, function (tx) { return dd(mix(C.crimsonLt, C.crimsonDk, tx)); }); })(y2);
    } else if (pose === 4) {
      stroke(put, fx - S * 0.012, aY, fx - S * 0.03, aY - S * 0.024, S * 0.007, function () { return dd(skin); });
      put(Math.round(fx - S * 0.036), Math.round(aY - S * 0.032), dd(C.crimsonLt));
      put(Math.round(fx - S * 0.042), Math.round(aY - S * 0.044), dd(C.crimsonLt));
    }
    if (pose === 0) row(put, Math.round(fy - 1), fx - S * 0.016, fx + S * 0.016, function () { return dd(mix(tun, '#241c14', 0.4)); });
  }
  // one radial wedge of the stands (crowd-ring border art; sky at top → sand
  // sliver at the bottom). Placed & rotated around the arena in the scene.
  function drawCrowd(put, S) {
    for (var y = 0; y < S; y++) row(put, y, 0, S, function () { return '#141221'; });
    for (var y2 = 0; y2 < S * 0.09; y2++) row(put, y2, 0, S, function (tx) { return ((tx * 14 | 0) % 2 ? '#c8b088' : '#a02028'); });
    for (var y3 = Math.round(S * 0.09); y3 < S * 0.13; y3++) row(put, y3, 0, S, function () { return mix('#141221', '#000000', 0.3); });
    var tiers = [{ y0: 0.13, h: 0.17, dim: 0.35, count: 7 }, { y0: 0.33, h: 0.2, dim: 0.18, count: 6 }, { y0: 0.56, h: 0.23, dim: 0, count: 5 }];
    tiers.forEach(function (tier, ti) {
      var yTop = S * tier.y0, yBot = S * (tier.y0 + tier.h);
      for (var y = Math.round(yTop); y < yBot; y++) {
        var t = (y - yTop) / (yBot - yTop);
        (function (t, y) {
          row(put, y, 0, S, function (tx) {
            var b = mix(C.marbleLt, C.marble, clamp(t * 1.3, 0, 1));
            b = mix(b, C.marbleDk, clamp((t - 0.6) * 1.6, 0, 1));
            var px2 = tx * S; if ((px2 % (S * 0.16)) < 1.6 && t > 0.55) b = mix(b, C.marbleDkk, 0.5);
            return mix(b, '#141018', tier.dim);
          });
        })(t, y);
      }
      row(put, Math.round(yBot), 0, S, function () { return mix(C.marbleDkk, '#000000', 0.4); });
      row(put, Math.round(yBot) + 1, 0, S, function () { return mix(C.marbleDkk, '#000000', 0.55); });
      for (var r = 0; r < 2; r++) {
        var count = tier.count + r;
        for (var i = 0; i < count; i++) {
          var fx = S * (0.05 + (i + (r ? 0.5 : 0)) * (0.92 / count));
          var fy = yBot - S * 0.012 - r * S * 0.055;
          fanDraw(put, S, fx, fy, ti * 31 + r * 17 + i, tier.dim + r * 0.08);
        }
      }
    });
    for (var y4 = Math.round(S * 0.8); y4 < S * 0.94; y4++) {
      var t4 = (y4 - S * 0.8) / (S * 0.14);
      (function (t4, y4) {
        row(put, y4, 0, S, function (tx) {
          var b = mix(C.marble, C.marbleDk, clamp(t4 * 1.2, 0, 1));
          var px2 = tx * S;
          if ((px2 % (S * 0.13)) < 1.6) b = mix(b, C.marbleDkk, 0.5);
          if (t4 > 0.3 && t4 < 0.42 && ((px2 * 0.5) | 0) % 9 === 3) b = mix(b, C.goldDk, 0.4);
          return b;
        });
      })(t4, y4);
    }
    row(put, Math.round(S * 0.8), 0, S, function () { return C.marbleLt; });
    row(put, Math.round(S * 0.807), 0, S, function () { return C.marbleDkk; });
    for (var y5 = Math.round(S * 0.815); y5 < S * 0.9; y5++) {
      var t5 = (y5 - S * 0.815) / (S * 0.085);
      (function (t5, y5) { row(put, y5, S * 0.6, S * 0.7 - t5 * S * 0.004, function (tx) { return mix(C.crimsonLt, C.crimsonDk, clamp(tx + t5 * 0.3, 0, 1)); }); })(t5, y5);
    }
    row(put, Math.round(S * 0.82), S * 0.6, S * 0.7, function () { return C.gold; });
    for (var y6 = Math.round(S * 0.94); y6 < S; y6++) (function (y6) { row(put, y6, 0, S, function (tx) { return mix(C.sandLt, C.sand, n2(tx * 40, y6) * 0.5); }); })(y6);
    [0.12, 0.88].forEach(function (x) {
      stroke(put, S * x, S * 0.13, S * x, S * 0.8, S * 0.006, function () { return C.bronzeDk; });
      ell(put, S * x, S * 0.16, S * 0.014, S * 0.02, function (tx, ty) { return mix('#ffd34d', '#ff7d3a', ty); });
      put(Math.round(S * x), Math.round(S * 0.135), '#ffe8a0');
    });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var COL_ART = {
    C: C,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (12) ----
      ctx.spr('colGladiatorHi', MS, MS, drawGladiator);
      ctx.spr('colRetiariusHi', MS, MS, drawRetiarius);
      ctx.spr('colLionHi', MS, MS, drawLion);
      ctx.spr('colLegionaryHi', MS, MS, drawLegionary);
      ctx.spr('colHandlerHi', MS, MS, drawHandler);
      ctx.spr('colElephantHi', MS, MS, drawElephant);
      ctx.spr('colMinotaurHi', MS, MS, drawMinotaur);
      ctx.spr('colFavoriteHi', MS, MS, drawFavorite);
      ctx.spr('colHoundHi', MS, MS, drawHound);
      ctx.spr('colVestalHi', MS, MS, drawVestal);
      ctx.spr('colExecutionerHi', MS, MS, drawExecutioner);
      ctx.spr('colChariotHi', MS, MS, drawChariot);
      ctx.MOB_HI.gladiator = 'colGladiatorHi';           ctx.MOB_DISPLAY.gladiator = 52;
      ctx.MOB_HI.retiarius = 'colRetiariusHi';           ctx.MOB_DISPLAY.retiarius = 52;
      ctx.MOB_HI.warLion = 'colLionHi';                  ctx.MOB_DISPLAY.warLion = 56;
      ctx.MOB_HI.shieldLegionary = 'colLegionaryHi';     ctx.MOB_DISPLAY.shieldLegionary = 54;
      ctx.MOB_HI.beastHandler = 'colHandlerHi';          ctx.MOB_DISPLAY.beastHandler = 50;
      ctx.MOB_HI.warElephant = 'colElephantHi';          ctx.MOB_DISPLAY.warElephant = 72;
      ctx.MOB_HI.minotaur = 'colMinotaurHi';             ctx.MOB_DISPLAY.minotaur = 60;
      ctx.MOB_HI.crowdFavorite = 'colFavoriteHi';        ctx.MOB_DISPLAY.crowdFavorite = 52;
      ctx.MOB_HI.warHound = 'colHoundHi';                ctx.MOB_DISPLAY.warHound = 46;
      ctx.MOB_HI.vestalCurser = 'colVestalHi';           ctx.MOB_DISPLAY.vestalCurser = 50;
      ctx.MOB_HI.executioner = 'colExecutionerHi';       ctx.MOB_DISPLAY.executioner = 60;
      ctx.MOB_HI.chariotRacer = 'colChariotHi';          ctx.MOB_DISPLAY.chariotRacer = 64;
      // ---- boss: DIVINITY HIMSELF (128px canvas) ----
      ctx.spr('divinityHimselfHi', 128, 128, drawDivinity);
      ctx.BOSS_HI.divinityHimself = { key: 'divinityHimselfHi', size: 128, display: 122, bodyW: 46, bodyH: 70 };
      // ---- decor (18) ----
      ctx.spr('coldBox', 64, 64, drawBox);
      ctx.spr('coldGate', 64, 64, drawGate);
      ctx.spr('coldColumn', 64, 64, drawColumn);
      ctx.spr('coldBroken', 64, 64, drawBroken);
      ctx.spr('coldBrazier', 64, 64, drawBrazier);
      ctx.spr('coldBanner', 64, 64, drawBanner);
      ctx.spr('coldStatue', 64, 64, drawStatue);
      ctx.spr('coldRack', 64, 64, drawRack);
      ctx.spr('coldTrapdoor', 64, 64, drawTrapdoor);
      ctx.spr('coldObelisk', 64, 64, drawObelisk);
      ctx.spr('coldArch', 64, 64, drawArch);
      ctx.spr('coldChains', 64, 64, drawChains);
      ctx.spr('coldTorch', 64, 64, drawTorch);
      ctx.spr('coldPlinth', 64, 64, drawPlinth);
      ctx.spr('coldCage', 64, 64, drawCage);
      ctx.spr('coldMast', 64, 64, drawMast);
      ctx.spr('coldPalus', 64, 64, drawPalus);
      ctx.spr('coldWolf', 64, 64, drawWolf);
      // ---- crowd ring wedge (border art) ----
      ctx.spr('colCrowd', 128, 128, drawCrowd);
      // ---- tiles (10) ----
      ctx.tex('coltSand', 48, 48, tSand);
      ctx.tex('coltBlood', 48, 48, tBlood);
      ctx.tex('coltMarble', 48, 48, tMarble);
      ctx.tex('coltMosaic', 48, 48, tMosaic);
      ctx.tex('coltPaving', 48, 48, tPaving);
      ctx.tex('coltTrack', 48, 48, tTrack);
      ctx.tex('coltGrate', 48, 48, tGrate);
      ctx.tex('coltCarpet', 48, 48, tCarpet);
      ctx.tex('coltFlag', 48, 48, tFlag);
      ctx.tex('coltGilt', 48, 48, tGilt);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = COL_ART;
  root.COLOSSEUM_ART = COL_ART;
})(typeof window !== 'undefined' ? window : this);
