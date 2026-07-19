// ============================================================================
// game/js/maps/viceversa/art.js — VICE VERSA (realm 18) hi-fi art.
// SPLIT map: HELL west / HOLY east, RIVER OF SOULS between, ONE bridge.
// Ports of Red's PICKED draws from assets/render/: HELL mobs #1 IMP · #2 FIRE
// IMP · #3 SUCCUBUS · #4 DEMON BRUTE · #6 SKELETON WARRIOR · #9 GHOST · #12
// CHAIN GAOLER · #15 TORMENTOR; HOLY mobs #1 CHERUB · #2 ANGEL SOLDIER · #3
// SERAPH · #4 VALKYRIE · #7 TEMPLE ACOLYTE · #10 GUARDIAN STATUE · #12 HARP
// SIREN · #16 HERALD · #20 ARCHON; DOUBLE BOSS: SATAN (#10 KING IN FLAME) +
// SUPREME BEING (THE WATCHER eye + JUDGE OLYMPUS composite); tiles #1-7 + #9
// RIVER (animated) + THE BRIDGE; decor (hell + holy) with destructible fences;
// river/bridge set pieces + the arena PORTAL. Palettes = underworld_kit H +
// holy G, verbatim. 6-digit hex only (RANGER_ART.mix breaks on shorthand).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- underworld palette (underworld_kit.js H, verbatim) -------------------
  var H = {
    OUT: '#0e0608',
    rock: '#3a2430', rockLt: '#5c3a4a', rockDk: '#1e1018',
    obsid: '#241a2c', obsidLt: '#44324e', obsidDk: '#120c18',
    ash: '#7a7280', ashLt: '#a29aae', ashDk: '#3a3440',
    lava: '#ff6a1e', lavaLt: '#ffd24a', lavaDk: '#8a2808',
    ember: '#ff9a3a', emberLt: '#ffd8a0',
    demon: '#c83a34', demonLt: '#f07a5a', demonDk: '#661410',
    demonP: '#8a3a9a', demonPLt: '#c87ae0', demonPDk: '#40104a',
    demonB: '#4a3a6a', demonBLt: '#7a64a8', demonBDk: '#241a38',
    soul: '#6ae4c8', soulLt: '#d2fff2', soulDk: '#1e6a58',
    fel: '#5aff2e', felLt: '#ccffb0', felDk: '#1e7a10',
    bone: '#e0d8c4', boneDk: '#8a8270',
    horn: '#e8d8b8', hornDk: '#7a6a4a',
    gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#7a5410',
    iron: '#4a4552', ironDk: '#221f28',
    pale: '#e0a8c0', paleDk: '#9a6280',
    night: '#160a12', white: '#fff2ea'
  };
  // ---- holy palette (render_holy_mobs.js G, verbatim) -----------------------
  var G = {
    marble: '#f2efe6', marbleDk: '#a8a496',
    robe: '#f6f2e8', robeDk: '#b8b0a0',
    skin: '#f0c8a8', skinDk: '#b08a62',
    gold: '#e8b03a', goldLt: '#ffe08a', goldDk: '#8a5c10',
    sky: '#a8d8f0', skyDk: '#4a7a9a',
    holy: '#fff2c0', holyLt: '#fffdf0', holyDk: '#c8a04a',
    wing: '#f8f6ee', wingDk: '#b0aa98',
    night: '#160a12', white: '#ffffff', ink: '#2a2420'
  };

  function U(S) { var u = S / 160; return function (v) { return v * u; }; }

  // ---- factory_kit-style helpers (reconstructed to match the render scripts) --
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      row(put, y, x0, x1, (function (vt2) { return function (tx) {
        var b = mix(hi, base, clamp(vt2 * 1.15, 0, 1));
        b = mix(b, dk, clamp((vt2 - 0.55) * 1.25, 0, 1));
        if (tx < 0.13) b = mix(b, hi, 0.55);
        if (tx > 0.9) b = mix(b, dk, 0.5);
        return b;
      }; })(vt));
    }
  }
  function dome(put, cx, cy, r, base, hi, dk) {   // single-radius factory dome
    ell(put, cx, cy, r, r, function (tx, ty) {
      var b = mix(hi, base, clamp(ty * 1.25, 0, 1));
      b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
      if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
      if (tx > 0.82) b = mix(b, dk, 0.4);
      return b;
    });
  }
  function shadow(put, cx, cy, w, h) { ell(put, cx, cy, w, h, function () { return H.OUT; }); }

  // ---- underworld_kit helpers (verbatim) ------------------------------------
  function horns(put, cx, cy, s, c, cDk, flare) {
    var f = flare == null ? 1 : flare;
    [[-1], [1]].forEach(function (a) { var sd = a[0];
      for (var i = 0; i <= 10; i++) {
        var t = i / 10;
        var hx = cx + sd * (s * 0.5 + t * s * 0.55 * f + Math.sin(t * 2) * s * 0.12);
        var hy = cy - t * s * 1.05 + t * t * s * 0.3;
        stroke(put, hx, hy, hx, hy, Math.max(1, s * 0.22 * (1 - t * 0.72)), (function (t2) { return function () { return mix(c || H.horn, cDk || H.hornDk, t2 * 0.7); }; })(t));
      }
    });
  }
  function batWing(put, ax, ay, sd, s, c, cDk) {
    var tips = [[sd * s * 1.35, -s * 0.75], [sd * s * 1.55, -s * 0.1], [sd * s * 1.25, s * 0.45]];
    for (var g = 0; g < tips.length - 1; g++) {
      for (var i = 0; i <= 12; i++) {
        var t = i / 12;
        var x1 = ax + tips[g][0] + (tips[g + 1][0] - tips[g][0]) * t;
        var y1 = ay + tips[g][1] + (tips[g + 1][1] - tips[g][1]) * t - Math.sin(t * 3.14) * s * 0.18;
        stroke(put, ax, ay, x1, y1, 1.1, (function (t2) { return function () { return mix(c, cDk, 0.35 + t2 * 0.25); }; })(t));
      }
    }
    tips.forEach(function (p) { stroke(put, ax, ay, ax + p[0], ay + p[1], Math.max(1, s * 0.09), function () { return cDk; }); });
    stroke(put, ax, ay, ax + sd * s * 0.5, ay - s * 0.85, Math.max(1, s * 0.11), function () { return cDk; });
  }
  function tail(put, x0, y0, sd, len, c, cDk) {
    var lx = x0, ly = y0;
    for (var i = 0; i <= 16; i++) {
      var t = i / 16;
      var nx = x0 + sd * Math.sin(t * 2.6) * len * 0.55 + sd * t * len * 0.3;
      var ny = y0 + t * len * 0.5 - Math.sin(t * 3.14) * len * 0.14;
      stroke(put, lx, ly, nx, ny, Math.max(1, 2.4 * (1 - t * 0.5)), (function (t2) { return function () { return mix(c, cDk, t2 * 0.5); }; })(t));
      lx = nx; ly = ny;
    }
    stroke(put, lx, ly, lx + sd * 4, ly - 3, 1.4, function () { return cDk; });
    stroke(put, lx, ly, lx + sd * 4, ly + 3, 1.4, function () { return cDk; });
  }
  function lick(put, cx, cy, s, c1, c2) {
    ell(put, cx, cy, s * 0.5, s, function (tx, ty) { return mix(c1, H.lavaDk, clamp(ty * 0.8 + Math.abs(tx - 0.5) * 0.9, 0, 1)); });
    ell(put, cx, cy + s * 0.3, s * 0.24, s * 0.42, function () { return (c2 || H.lavaLt); });
  }
  function soulMote(put, cx, cy, s, fade) {
    ell(put, cx, cy, s, s * 1.25, function (tx, ty) { return mix(mix(H.soulLt, H.night, fade), mix(H.soul, H.night, fade + 0.2), clamp(tx + ty * 0.5, 0, 1)); });
    put(Math.round(cx - s * 0.35), Math.round(cy - s * 0.2), mix(H.night, H.soulDk, 0.4));
    put(Math.round(cx + s * 0.35), Math.round(cy - s * 0.2), mix(H.night, H.soulDk, 0.4));
  }
  function cracks(put, cx, cy, s, n, seed) {
    for (var k = 0; k < n; k++) {
      var a = (k / n) * 6.28 + (seed || 0);
      var lx = cx, ly = cy;
      for (var i = 0; i < 4; i++) {
        var nx = lx + Math.cos(a + Math.sin(i * 2.7) * 0.6) * s * 0.28;
        var ny = ly + Math.sin(a + Math.cos(i * 1.9) * 0.6) * s * 0.24;
        stroke(put, lx, ly, nx, ny, 1, (function (i2) { return function () { return mix(H.lava, H.lavaLt, (i2 % 2) * 0.5); }; })(i));
        lx = nx; ly = ny;
      }
    }
  }
  function embers(put, S, n, seed) {
    for (var i = 0; i < n; i++) {
      var x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S;
      var y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
      put(Math.round(x), Math.round(y), mix(i % 3 ? H.ember : H.lavaLt, H.night, 0.35 + (i % 4) * 0.14));
    }
  }

  // ---- holy helpers (render_holy_mobs.js, verbatim) -------------------------
  function wing(put, ax, ay, sd, s, c, cDk) {
    for (var layer = 0; layer < 3; layer++) {
      var ls = s * (1 - layer * 0.22);
      for (var i = 0; i <= 9; i++) {
        var t = i / 9;
        var wx = ax + sd * (t * ls * 1.5), wy = ay - Math.sin(t * 3.14) * ls * (0.9 - layer * 0.18) + layer * s * 0.22;
        stroke(put, ax + sd * t * ls * 0.4, ay + layer * s * 0.2, wx, wy + ls * 0.3, Math.max(1, s * 0.09), (function (layer2, t2) { return function () { return mix(layer2 ? c : G.white, cDk, t2 * 0.55 + layer2 * 0.15); }; })(layer, t));
      }
    }
  }
  function halo(put, cx, cy, r) {
    for (var a = 0; a < 6.28; a += 0.06) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.32), mix(G.goldLt, G.gold, (Math.sin(a * 3) + 1) / 2));
  }
  function lightMotes(put, S, n, seed) {
    for (var i = 0; i < n; i++) {
      var x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S;
      var y = ((i * 683 + (seed || 0) * 71) % 1000) / 1000 * S * 0.9;
      put(Math.round(x), Math.round(y), mix(i % 3 ? G.holy : G.holyLt, H.night, 0.3 + (i % 4) * 0.14));
    }
  }
  function rays(put, cx, cy, r0, r1, n, c) {
    for (var k = 0; k < n; k++) { var a = (k / n) * 6.28; stroke(put, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, 1.1, function () { return c; }); }
  }
  function bigWing(put, ax, ay, sd, s, lift, c, cDk) {
    for (var layer = 0; layer < 4; layer++) {
      var ls = s * (1 - layer * 0.18);
      for (var i = 0; i <= 11; i++) {
        var t = i / 11;
        var wx = ax + sd * t * ls * 1.6;
        var wy = ay - Math.sin(t * 2.6) * ls * (lift - layer * 0.16) + layer * s * 0.18;
        stroke(put, ax + sd * t * ls * 0.35, ay + layer * s * 0.16, wx, wy + ls * 0.26, Math.max(1, s * 0.075), (function (layer2, t2) { return function () { return mix(layer2 === 0 ? G.white : c, cDk, t2 * 0.5 + layer2 * 0.14); }; })(layer, t));
      }
    }
  }
  function bolt(put, X, x0, y0, segs, c1, c2) {
    var bx = x0, by = y0;
    segs.forEach(function (seg, i) { stroke(put, X(bx), X(by), X(bx + seg[0]), X(by + seg[1]), X(2), (function (i2) { return function () { return (i2 % 2 ? c1 : c2); }; })(i)); bx += seg[0]; by += seg[1]; });
    return [bx, by];
  }

  // ================= HELL MOBS (picks #1 2 3 4 6 9 12 15) =================
  function drawImp(put, S) {
    var X = U(S); embers(put, S, 6, 1); shadow(put, X(78), X(122), X(18), X(4));
    batWing(put, X(66), X(74), -1, X(16), H.demonDk, '#40100c');
    batWing(put, X(90), X(74), 1, X(16), H.demonDk, '#40100c');
    tail(put, X(88), X(100), 1, X(26), H.demon, H.demonDk);
    [[70], [86]].forEach(function (a) { stroke(put, X(a[0]), X(98), X(a[0] - 1), X(116), X(3), function () { return H.demonDk; }); });
    ell(put, X(78), X(86), X(14), X(16), function (tx, ty) { return mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.6 - 0.25, 0, 1)); });
    ell(put, X(78), X(94), X(8), X(6), function () { return mix(H.demon, H.demonLt, 0.3); });
    ell(put, X(78), X(62), X(11), X(10), function (tx, ty) { return mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)); });
    horns(put, X(78), X(56), X(9), H.horn, H.hornDk, 0.8);
    put(Math.round(X(73)), Math.round(X(60)), H.lavaLt); put(Math.round(X(83)), Math.round(X(60)), H.lavaLt);
    stroke(put, X(72), X(66), X(84), X(66), X(1), function () { return H.night; });
    [[74], [78], [82]].forEach(function (a) { put(Math.round(X(a[0])), Math.round(X(67)), H.white); });
    stroke(put, X(58), X(112), X(52), X(58), X(2), function () { return H.iron; });
    [[46, 46], [52, 42], [58, 46]].forEach(function (p) { stroke(put, X(52), X(56), X(p[0]), X(p[1]), X(1.6), function () { return H.iron; }); });
    ell(put, X(60), X(96), X(3), X(3), function () { return H.demon; });
  }
  function drawFireImp(put, S) {
    var X = U(S); embers(put, S, 9, 2); shadow(put, X(82), X(122), X(18), X(4));
    tail(put, X(92), X(100), 1, X(24), '#e86a1e', H.lavaDk);
    [[74], [90]].forEach(function (a) { stroke(put, X(a[0]), X(98), X(a[0] - 1), X(116), X(3), function () { return H.lavaDk; }); });
    ell(put, X(82), X(86), X(14), X(15), function (tx, ty) { return mix('#ffa03a', H.lavaDk, clamp(tx * 1.1 + ty * 0.6 - 0.2, 0, 1)); });
    cracks(put, X(82), X(88), X(18), 4, 1);
    ell(put, X(82), X(62), X(10.5), X(10), function (tx, ty) { return mix('#ffb45a', H.lavaDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)); });
    lick(put, X(76), X(50), X(6), H.lava, H.lavaLt); lick(put, X(84), X(47), X(8), H.lava, H.lavaLt); lick(put, X(90), X(51), X(5), H.ember, H.lavaLt);
    put(Math.round(X(77)), Math.round(X(60)), H.white); put(Math.round(X(87)), Math.round(X(60)), H.white);
    stroke(put, X(77), X(66), X(87), X(65), X(1), function () { return H.night; });
    ell(put, X(56), X(56), X(9), X(9), function (tx, ty) { return mix(H.lavaLt, H.lava, clamp(tx + ty * 0.5, 0, 1)); });
    for (var a = 0; a < 6.28; a += 0.8) lick(put, X(56 + Math.cos(a) * 9), X(56 + Math.sin(a) * 9), X(3.4), H.lava, H.lavaLt);
    stroke(put, X(66), X(84), X(58), X(64), X(3), function () { return '#e8862a'; });
  }
  function drawSuccubus(put, S) {
    var X = U(S); embers(put, S, 5, 3);
    batWing(put, X(66), X(66), -1, X(20), H.demonPDk, '#2a0a30');
    batWing(put, X(94), X(66), 1, X(20), H.demonPDk, '#2a0a30');
    stroke(put, X(74), X(100), X(72), X(124), X(3.4), function () { return H.paleDk; });
    stroke(put, X(86), X(100), X(88), X(124), X(3.4), function () { return H.paleDk; });
    ell(put, X(71), X(126), X(3.4), X(2), function () { return H.night; }); ell(put, X(89), X(126), X(3.4), X(2), function () { return H.night; });
    for (var y = 72; y <= 102; y++) { var t = (y - 72) / 30, w = 10 - Math.sin(t * 2.4) * 3 + t * 4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix('#3a1030', '#14040f', clamp(tx * 1.2 + t2 * 0.3, 0, 1)); }; })(t)); }
    stroke(put, X(70), X(76), X(58), X(88), X(2.8), function () { return H.pale; });
    stroke(put, X(90), X(76), X(96), X(64), X(2.8), function () { return H.pale; });
    ell(put, X(97), X(61), X(2.6), X(2.4), function () { return H.pale; });
    ell(put, X(80), X(58), X(10), X(10), function (tx, ty) { return mix('#f0c0d2', H.paleDk, clamp(tx * 1.05 + ty * 0.45 - 0.3, 0, 1)); });
    for (var y2 = 48; y2 <= 74; y2++) { var t3 = (y2 - 48) / 26; row(put, Math.round(X(y2)), X(86 + Math.sin(t3 * 3) * 3), X(93 + t3 * 2), (function (t4) { return function (tx) { return mix('#6a1a4a', '#2a0818', tx + t4 * 0.2); }; })(t3)); }
    ell(put, X(76), X(50), X(8), X(4), function (tx) { return mix('#7a2456', '#2a0818', tx); });
    horns(put, X(80), X(50), X(6), '#f0d8e8', '#8a5a78', 0.7);
    put(Math.round(X(76)), Math.round(X(57)), H.demonP); put(Math.round(X(84)), Math.round(X(57)), H.demonP);
    put(Math.round(X(76)), Math.round(X(56)), H.white);
    stroke(put, X(78), X(62.5), X(82), X(62.5), X(1), function () { return '#a02a4a'; });
    tail(put, X(90), X(98), 1, X(28), H.demonP, H.demonPDk);
    [[104, 52, 1], [112, 44, 0.75], [119, 38, 0.55]].forEach(function (p) {
      var hx = p[0], hy = p[1], sc = p[2];
      ell(put, X(hx - 2 * sc), X(hy), X(2.6 * sc), X(2.4 * sc), (function (sc2) { return function () { return mix('#ff4a7a', H.night, 1 - sc2); }; })(sc));
      ell(put, X(hx + 2 * sc), X(hy), X(2.6 * sc), X(2.4 * sc), (function (sc2) { return function () { return mix('#ff4a7a', H.night, 1 - sc2); }; })(sc));
      stroke(put, X(hx - 4 * sc), X(hy + 1), X(hx), X(hy + 5 * sc), X(1.6 * sc), (function (sc2) { return function () { return mix('#e02a5a', H.night, 1 - sc2); }; })(sc));
      stroke(put, X(hx + 4 * sc), X(hy + 1), X(hx), X(hy + 5 * sc), X(1.6 * sc), (function (sc2) { return function () { return mix('#e02a5a', H.night, 1 - sc2); }; })(sc));
    });
  }
  function drawBrute(put, S) {
    var X = U(S); embers(put, S, 5, 4); shadow(put, X(80), X(126), X(34), X(6));
    for (var y = 56; y <= 108; y++) { var t = (y - 56) / 52, w = 26 - t * 12; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (function (t2) { return function (tx) { return mix(H.demonLt, H.demonDk, clamp(tx * 1.25 + t2 * 0.25, 0, 1)); }; })(t)); }
    stroke(put, X(56), X(66), X(40), X(108), X(8), function () { return H.demon; });
    stroke(put, X(100), X(66), X(116), X(108), X(8), function () { return H.demon; });
    ell(put, X(38), X(114), X(8), X(6), function (tx, ty) { return mix(H.demonLt, H.demonDk, clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, X(118), X(114), X(8), X(6), function (tx, ty) { return mix(H.demonLt, H.demonDk, clamp(tx + ty * 0.5, 0, 1)); });
    [[34, 40, 44], [114, 120, 124]].forEach(function (ks) { ks.forEach(function (kx) { put(Math.round(X(kx)), Math.round(X(111)), H.demonDk); }); });
    stroke(put, X(68), X(104), X(66), X(122), X(5), function () { return H.demonDk; });
    stroke(put, X(88), X(104), X(90), X(122), X(5), function () { return H.demonDk; });
    ell(put, X(78), X(52), X(12), X(10), function (tx, ty) { return mix(H.demonLt, H.demonDk, clamp(tx * 1.1 + ty * 0.5 - 0.15, 0, 1)); });
    horns(put, X(78), X(46), X(11), H.horn, H.hornDk, 1.1);
    put(Math.round(X(72)), Math.round(X(50)), H.felLt); put(Math.round(X(84)), Math.round(X(50)), H.felLt);
    [[64, 78, 72, 88], [88, 72, 94, 84], [74, 92, 70, 100]].forEach(function (c) { stroke(put, X(c[0]), X(c[1]), X(c[2]), X(c[3]), X(1.2), function () { return H.fel; }); put(Math.round(X(c[2])), Math.round(X(c[3])), H.felLt); });
    row(put, Math.round(X(57)), X(71), X(85), function () { return H.night; });
    [[73, 58], [79, 58], [83, 58]].forEach(function (p) { stroke(put, X(p[0]), X(p[1]), X(p[0]), X(p[1] - 3), X(1.4), function () { return H.white; }); });
    [[64, 44], [74, 40], [86, 41], [94, 46]].forEach(function (p) { stroke(put, X(p[0]), X(p[1] + 8), X(p[0]), X(p[1]), X(2), function () { return H.hornDk; }); });
    stroke(put, X(70), X(74), X(86), X(86), X(1.4), function () { return H.demonDk; });
  }
  function drawSkeleton(put, S) {
    var X = U(S); embers(put, S, 4, 6); shadow(put, X(78), X(126), X(22), X(4));
    [[70], [86]].forEach(function (a) { var lx = a[0]; stroke(put, X(lx), X(94), X(lx), X(106), X(2.6), function () { return H.bone; }); ell(put, X(lx), X(107), X(2), X(2), function () { return H.boneDk; }); stroke(put, X(lx), X(108), X(lx - 1), X(120), X(2.4), function () { return H.bone; }); ell(put, X(lx), X(122), X(4), X(2), function () { return H.boneDk; }); });
    ell(put, X(78), X(92), X(8), X(4.4), function (tx, ty) { return mix(H.bone, H.boneDk, ty); });
    stroke(put, X(78), X(70), X(78), X(90), X(2.4), function () { return H.bone; });
    for (var k = 0; k < 4; k++) { var ry = 72 + k * 5; for (var a2 = 0.35; a2 <= 2.8; a2 += 0.09) put(Math.round(X(78 + Math.cos(a2) * (12 - k))), Math.round(X(ry + Math.sin(a2) * 2.4)), mix(H.bone, H.boneDk, k * 0.14)); }
    stroke(put, X(66), X(70), X(56), X(84), X(2.2), function () { return H.bone; });
    stroke(put, X(90), X(70), X(102), X(80), X(2.2), function () { return H.bone; });
    ell(put, X(78), X(56), X(9.5), X(9), function (tx, ty) { return mix('#f2ecd8', H.boneDk, clamp(tx * 0.9 + ty * 0.55 - 0.3, 0, 1)); });
    for (var y = 62; y <= 66; y++) row(put, Math.round(X(y)), X(73), X(83), (function (y2) { return function (tx) { return mix(H.bone, H.boneDk, (y2 - 62) / 5); }; })(y));
    ell(put, X(74.5), X(55), X(2.4), X(2.8), function () { return H.night; }); ell(put, X(81.5), X(55), X(2.4), X(2.8), function () { return H.night; });
    put(Math.round(X(74)), Math.round(X(55)), H.soul); put(Math.round(X(81)), Math.round(X(55)), H.soul);
    [[75], [78], [81]].forEach(function (a) { stroke(put, X(a[0]), X(63), X(a[0]), X(65), X(0.8), function () { return H.night; }); });
    stroke(put, X(104), X(78), X(122), X(38), X(2.6), function () { return '#b8bcc8'; });
    stroke(put, X(108), X(70), X(114), X(72), X(1.6), function () { return H.ironDk; });
    stroke(put, X(100), X(80), X(108), X(76), X(2), function () { return H.gold; });
    ell(put, X(52), X(86), X(11), X(12), function (tx, ty) { return mix(H.iron, H.ironDk, clamp(tx * 1.1 + ty * 0.4 - 0.1, 0, 1)); });
    ell(put, X(52), X(86), X(4), X(4.4), function (tx) { return mix(H.gold, H.goldDk, tx); });
    for (var a3 = 0; a3 < 6.28; a3 += 0.7) put(Math.round(X(52 + Math.cos(a3) * 9.4)), Math.round(X(86 + Math.sin(a3) * 10.4)), H.ironDk);
  }
  function drawGhost(put, S) {
    var X = U(S); embers(put, S, 4, 9);
    for (var y = 46; y <= 112; y++) {
      var t = (y - 46) / 66, w = 20 - t * 2 + Math.sin(t * 6) * 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix(mix('#e8f4f2', '#8ab2ac', clamp(tx * 1.15 + t2 * 0.35, 0, 1)), H.night, t2 * 0.35); }; })(t));
    }
    for (var k = 0; k < 5; k++) { var hx = 62 + k * 9; for (var a = 3.34; a <= 6.1; a += 0.12) put(Math.round(X(hx + Math.cos(a) * 4.5)), Math.round(X(112 + Math.sin(a) * 5)), mix('#a8c8c2', H.night, 0.35)); }
    stroke(put, X(60), X(70), X(46), X(58), X(4.4), function () { return '#c8dedb'; });
    stroke(put, X(100), X(70), X(114), X(58), X(4.4), function () { return '#c8dedb'; });
    ell(put, X(44), X(55), X(3.4), X(3), function () { return '#e8f4f2'; }); ell(put, X(116), X(55), X(3.4), X(3), function () { return '#e8f4f2'; });
    ell(put, X(72), X(62), X(3.4), X(5), function () { return H.night; }); ell(put, X(88), X(62), X(3.4), X(5), function () { return H.night; });
    ell(put, X(80), X(76), X(4.4), X(6.5), function () { return H.night; });
    put(Math.round(X(71)), Math.round(X(60)), '#8ab2ac'); put(Math.round(X(87)), Math.round(X(60)), '#8ab2ac');
  }
  function drawGaoler(put, S) {
    var X = U(S); embers(put, S, 5, 12); shadow(put, X(80), X(126), X(26), X(5));
    for (var y = 62; y <= 122; y++) { var t = (y - 62) / 60, w = 14 + t * 10; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix('#4a3a3a', '#1c1214', clamp(tx * 1.25 + t2 * 0.25, 0, 1)); }; })(t)); }
    [[58, 70, 102, 112], [102, 70, 58, 112]].forEach(function (c) { for (var i = 0; i <= 16; i++) { var t = i / 16; if (i % 2 === 0) ell(put, X(c[0] + (c[2] - c[0]) * t), X(c[1] + (c[3] - c[1]) * t), X(2), X(1.5), (function (i2) { return function () { return (i2 % 4 ? '#5a5e68' : '#8a8e9a'); }; })(i)); } });
    ell(put, X(80), X(50), X(11), X(11), function (tx, ty) { return mix('#6a6e7a', '#23262e', clamp(tx * 1.1 + ty * 0.5 - 0.1, 0, 1)); });
    row(put, Math.round(X(48)), X(72), X(88), function () { return '#1a1c22'; });
    put(Math.round(X(75)), Math.round(X(48)), H.lava); put(Math.round(X(85)), Math.round(X(48)), H.lava);
    [[74, 56], [80, 57], [86, 56]].forEach(function (p) { put(Math.round(X(p[0])), Math.round(X(p[1])), '#8a8e9a'); });
    horns(put, X(80), X(42), X(8), '#8a8e9a', '#3a3e48', 0.6);
    [[-1, 40, 78], [1, 120, 70]].forEach(function (c) {
      var sd = c[0], ex = c[1], ey = c[2];
      for (var i = 0; i <= 14; i++) { var t = i / 14; if (i % 2 === 0) ell(put, X(80 + sd * 20 + (ex - 80 - sd * 20) * t), X(80 + (ey - 80) * t + Math.sin(t * 3.14) * sd * 10), X(2.2), X(1.7), (function (i2) { return function () { return (i2 % 4 ? '#5a5e68' : '#8a8e9a'); }; })(i)); }
      for (var a = 0; a <= 3.6; a += 0.22) put(Math.round(X(ex + Math.cos(a + sd) * 5)), Math.round(X(ey + Math.sin(a + sd) * 5)), '#b8bcc8');
    });
  }
  function drawTormentor(put, S) {
    var X = U(S); embers(put, S, 5, 15); shadow(put, X(74), X(126), X(20), X(4));
    [[68, -2], [82, 2]].forEach(function (a) { var lx = a[0], o = a[1]; stroke(put, X(lx), X(96), X(lx + o), X(112), X(3), function () { return H.demonPDk; }); stroke(put, X(lx + o), X(112), X(lx + o - 2), X(124), X(2.6), function () { return H.demonPDk; }); });
    for (var y = 62; y <= 98; y++) { var t = (y - 62) / 36, w = 10 - t * 3; row(put, Math.round(X(y)), X(75 - w), X(75 + w), (function (t2) { return function (tx) { return mix(H.demonPLt, H.demonPDk, clamp(tx * 1.2 + t2 * 0.25, 0, 1)); }; })(t)); }
    tail(put, X(80), X(98), 1, X(24), H.demonP, H.demonPDk);
    ell(put, X(75), X(52), X(8.5), X(9), function (tx, ty) { return mix(H.demonPLt, H.demonPDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)); });
    [[-1], [1]].forEach(function (a) { var sd = a[0]; for (var i = 0; i <= 8; i++) { var t = i / 8; stroke(put, X(75 + sd * (5 + t * 10)), X(46 - t * 4 + t * t * 6), X(75 + sd * (5 + t * 10)), X(46 - t * 4 + t * t * 6), X(1.8 * (1 - t * 0.6)), (function (t2) { return function () { return mix(H.horn, H.hornDk, t2); }; })(t)); } });
    put(Math.round(X(71)), Math.round(X(51)), H.felLt); put(Math.round(X(79)), Math.round(X(51)), H.felLt);
    stroke(put, X(84), X(68), X(96), X(56), X(2.6), function () { return H.demonP; });
    var px = 96, py = 56;
    for (var i2 = 1; i2 <= 22; i2++) {
      var t3 = i2 / 22, nx = 96 + Math.sin(t3 * 5.2) * 26 + t3 * 8, ny = 56 - t3 * 22 + Math.sin(t3 * 8) * 5;
      stroke(put, X(px), X(py), X(nx), X(ny), X(Math.max(1, 2.2 * (1 - t3 * 0.7))), (function (i3) { return function () { return mix(H.fel, H.felLt, (i3 % 3) * 0.3); }; })(i2));
      px = nx; py = ny;
    }
    lick(put, X(px), X(py - 2), X(4), H.fel, H.felLt);
    stroke(put, X(66), X(68), X(58), X(80), X(2.4), function () { return H.demonP; });
  }

  // ================= HOLY MOBS (picks #1 2 3 4 7 10 12 16 20) =================
  function drawCherub(put, S) {
    var X = U(S); lightMotes(put, S, 6, 1);
    wing(put, X(68), X(72), -1, X(14), G.wing, G.wingDk);
    wing(put, X(92), X(72), 1, X(14), G.wing, G.wingDk);
    ell(put, X(80), X(84), X(13), X(14), function (tx, ty) { return mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.55 - 0.3, 0, 1)); });
    ell(put, X(80), X(92), X(7), X(5), function () { return mix(G.skin, G.white, 0.25); });
    stroke(put, X(72), X(96), X(68), X(106), X(3), function () { return G.skin; });
    stroke(put, X(88), X(96), X(92), X(104), X(3), function () { return G.skin; });
    for (var y = 86; y <= 92; y++) row(put, Math.round(X(y)), X(68 + (y - 86)), X(92 - (92 - y) * 0.4), function (tx) { return mix('#8ac8e8', '#4a7a9a', tx); });
    ell(put, X(80), X(60), X(10), X(9.5), function (tx, ty) { return mix('#f6d4b8', G.skinDk, clamp(tx * 1.0 + ty * 0.45 - 0.3, 0, 1)); });
    ell(put, X(80), X(50), X(7), X(3.4), function (tx) { return mix('#e8c060', '#8a6a20', tx); });
    put(Math.round(X(80)), Math.round(X(46.5)), '#e8c060');
    halo(put, X(80), X(43), X(9));
    put(Math.round(X(76)), Math.round(X(59)), G.ink); put(Math.round(X(84)), Math.round(X(59)), G.ink);
    stroke(put, X(78), X(64), X(82), X(64), X(1), function () { return '#c07a5a'; });
    for (var a = -1.0; a <= 1.0; a += 0.05) put(Math.round(X(52 + Math.cos(a) * 18 * 0.5)), Math.round(X(76 + Math.sin(a) * 18)), G.goldDk);
    stroke(put, X(57), X(59), X(57), X(93), X(0.8), function () { return G.wingDk; });
    stroke(put, X(44), X(76), X(62), X(76), X(1.4), function () { return G.gold; });
    put(Math.round(X(42)), Math.round(X(76)), G.holyLt);
    stroke(put, X(66), X(78), X(58), X(76), X(2.4), function () { return G.skin; });
  }
  function drawAngel(put, S) {
    var X = U(S); lightMotes(put, S, 5, 2); shadow(put, X(78), X(126), X(22), X(4));
    wing(put, X(64), X(66), -1, X(22), G.wing, G.wingDk);
    wing(put, X(92), X(66), 1, X(22), G.wing, G.wingDk);
    for (var y = 66; y <= 118; y++) { var t = (y - 66) / 52, w = 11 + t * 8; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (function (t2) { return function (tx) { return mix(G.robe, G.robeDk, clamp(tx * 1.2 + t2 * 0.3, 0, 1)); }; })(t)); }
    row(put, Math.round(X(118)), X(59), X(97), function () { return G.goldDk; });
    for (var y2 = 68; y2 <= 84; y2++) { var t3 = (y2 - 68) / 16, w2 = 10 - t3 * 2; row(put, Math.round(X(y2)), X(78 - w2), X(78 + w2), (function (t4) { return function (tx) { return mix(G.goldLt, G.goldDk, clamp(tx * 1.3 + t4 * 0.3, 0, 1)); }; })(t3)); }
    row(put, Math.round(X(88)), X(68), X(88), function () { return G.goldDk; });
    stroke(put, X(90), X(72), X(102), X(60), X(3), function () { return G.robeDk; });
    stroke(put, X(104), X(62), X(104), X(28), X(2.6), function () { return '#e8ecf4'; });
    stroke(put, X(104), X(62), X(104), X(44), X(1), function () { return G.holyLt; });
    stroke(put, X(98), X(64), X(110), X(64), X(2), function () { return G.gold; });
    stroke(put, X(66), X(72), X(56), X(84), X(3), function () { return G.robeDk; });
    ell(put, X(54), X(87), X(3), X(3), function () { return G.skin; });
    ell(put, X(78), X(56), X(9.5), X(9.5), function (tx, ty) { return mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.45 - 0.3, 0, 1)); });
    ell(put, X(78), X(48), X(8), X(3.4), function (tx) { return mix('#a87a3a', '#5a3a12', tx); });
    halo(put, X(78), X(41), X(10));
    put(Math.round(X(74.5)), Math.round(X(55)), G.ink); put(Math.round(X(81.5)), Math.round(X(55)), G.ink);
  }
  function drawSeraph(put, S) {
    var X = U(S); lightMotes(put, S, 6, 3);
    wing(put, X(66), X(56), -1, X(19), G.wing, G.wingDk);
    wing(put, X(94), X(56), 1, X(19), G.wing, G.wingDk);
    wing(put, X(68), X(78), -1, X(15), G.wing, G.wingDk);
    wing(put, X(92), X(78), 1, X(15), G.wing, G.wingDk);
    for (var y = 58; y <= 112; y++) { var t = (y - 58) / 54, w = (12 - t * 7) * (1 + Math.sin(t * 2.6) * 0.15); row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix(G.holyLt, G.holyDk, clamp(tx * 1.05 + t2 * 0.5, 0, 1)); }; })(t)); }
    for (var i = 0; i < 4; i++) put(Math.round(X(80 + Math.sin(i * 2.4) * 3)), Math.round(X(114 + i * 3)), mix(G.holy, H.night, 0.25 + i * 0.16));
    ell(put, X(80), X(48), X(9), X(10), function (tx, ty) { return mix(G.holyLt, G.holyDk, clamp(tx * 0.9 + ty * 0.5 - 0.35, 0, 1)); });
    ell(put, X(76.5), X(47), X(1.6), X(2.6), function () { return G.gold; }); ell(put, X(83.5), X(47), X(1.6), X(2.6), function () { return G.gold; });
    halo(put, X(80), X(35), X(11)); halo(put, X(80), X(31), X(7));
    [[46, 84, -0.5], [114, 88, 0.5]].forEach(function (l) {
      var lx = l[0], ly = l[1], aa = l[2];
      stroke(put, X(lx - Math.cos(aa) * 12), X(ly - Math.sin(aa) * 12), X(lx + Math.cos(aa) * 12), X(ly + Math.sin(aa) * 12), X(1.6), function () { return G.holyLt; });
      put(Math.round(X(lx + Math.cos(aa) * 13)), Math.round(X(ly + Math.sin(aa) * 13)), G.white);
    });
  }
  function drawValkyrie(put, S) {
    var X = U(S); lightMotes(put, S, 5, 4);
    wing(put, X(88), X(52), 1, X(24), G.wing, G.wingDk);
    wing(put, X(98), X(64), 1, X(18), G.wing, G.wingDk);
    for (var i = 0; i <= 22; i++) { var t = i / 22, w = 8 * (1 - t * 0.3); ell(put, X(92 - t * 34), X(58 + t * 30), X(w), X(3.4), (function (t2) { return function (tx) { return mix('#c8d4e8', '#5a6a8a', clamp(tx + t2 * 0.25, 0, 1)); }; })(t)); }
    for (var i2 = 0; i2 <= 8; i2++) { var t3 = i2 / 8; stroke(put, X(92), X(62), X(100 + t3 * 8), X(74 + t3 * 6), X(1.6), (function (t4) { return function () { return mix('#8ab0d8', '#3a5a7a', t4); }; })(t3)); }
    ell(put, X(52), X(94), X(8.5), X(8), function (tx, ty) { return mix('#e8ecf4', '#8a92a2', clamp(tx + ty * 0.4 - 0.2, 0, 1)); });
    ell(put, X(52), X(99), X(6), X(4), function (tx, ty) { return mix(G.skin, G.skinDk, tx); });
    put(Math.round(X(49)), Math.round(X(98)), G.ink); put(Math.round(X(54)), Math.round(X(98)), G.ink);
    stroke(put, X(58), X(90), X(64), X(84), X(2.2), function () { return G.wingDk; });
    stroke(put, X(46), X(90), X(40), X(86), X(2.2), function () { return G.wingDk; });
    for (var i3 = 0; i3 <= 8; i3++) put(Math.round(X(60 + i3 * 2.2)), Math.round(X(88 - i3 * 1.4)), i3 % 2 ? '#e8c060' : '#a8843a');
    stroke(put, X(74), X(72), X(30), X(122), X(2.2), function () { return G.goldDk; });
    stroke(put, X(38), X(112), X(30), X(122), X(3.4), function () { return G.holyLt; });
    put(Math.round(X(28)), Math.round(X(124)), G.white);
    [[104, 30], [116, 42], [122, 58]].forEach(function (l) { stroke(put, X(l[0]), X(l[1]), X(l[0] - 8), X(l[1] + 10), X(1), function () { return mix(G.sky, H.night, 0.5); }); });
  }
  function drawAcolyte(put, S) {
    var X = U(S); lightMotes(put, S, 5, 7); shadow(put, X(78), X(126), X(20), X(4));
    for (var y = 60; y <= 120; y++) { var t = (y - 60) / 60, w = 9 + t * 9; row(put, Math.round(X(y)), X(76 - w), X(76 + w), (function (t2) { return function (tx) { return mix('#d8cfc0', '#8a8070', clamp(tx * 1.2 + t2 * 0.3, 0, 1)); }; })(t)); }
    row(put, Math.round(X(120)), X(58), X(94), function () { return G.goldDk; });
    stroke(put, X(76), X(78), X(76), X(112), X(1.2), function () { return '#b8ae9c'; });
    row(put, Math.round(X(90)), X(64), X(88), function () { return '#a8845a'; });
    stroke(put, X(84), X(90), X(86), X(100), X(1.2), function () { return '#a8845a'; });
    ell(put, X(76), X(52), X(9), X(9), function (tx, ty) { return mix(G.skin, G.skinDk, clamp(tx * 1.05 + ty * 0.45 - 0.25, 0, 1)); });
    for (var a = 2.8; a <= 6.6; a += 0.2) put(Math.round(X(76 + Math.cos(a) * 8.4)), Math.round(X(50 + Math.sin(a) * 8)), '#8a6a3a');
    put(Math.round(X(73)), Math.round(X(51)), G.ink); put(Math.round(X(79)), Math.round(X(51)), G.ink);
    stroke(put, X(66), X(70), X(54), X(60), X(2.6), function () { return '#b8ae9c'; });
    stroke(put, X(86), X(70), X(98), X(60), X(2.6), function () { return '#b8ae9c'; });
    ell(put, X(52), X(57), X(2.6), X(2.4), function () { return G.skin; }); ell(put, X(100), X(57), X(2.6), X(2.4), function () { return G.skin; });
    rays(put, X(76), X(44), X(4), X(9), 8, G.holyLt);
    ell(put, X(76), X(44), X(3.4), X(3.4), function (tx, ty) { return mix(G.white, G.holy, tx + ty * 0.3); });
    [[46, 78], [108, 82]].forEach(function (p) { stroke(put, X(p[0] - 2), X(p[1]), X(p[0] + 2), X(p[1]), X(1), function () { return '#7ae87a'; }); stroke(put, X(p[0]), X(p[1] - 2), X(p[0]), X(p[1] + 2), X(1), function () { return '#7ae87a'; }); });
  }
  function drawGuardian(put, S) {
    var X = U(S); lightMotes(put, S, 4, 10); shadow(put, X(78), X(126), X(26), X(5));
    plate(put, X(56), X(114), X(102), X(124), G.marbleDk, G.marble, '#6a685e');
    wing(put, X(64), X(62), -1, X(18), G.marble, G.marbleDk);
    wing(put, X(92), X(62), 1, X(18), G.marble, G.marbleDk);
    for (var y = 60; y <= 114; y++) { var t = (y - 60) / 54, w = 10 + t * 8; row(put, Math.round(X(y)), X(78 - w), X(78 + w), (function (t2) { return function (tx) { return mix(G.marble, G.marbleDk, clamp(tx * 1.15 + t2 * 0.35, 0, 1)); }; })(t)); }
    [[70, 80, 68, 112], [78, 82, 78, 112], [86, 80, 88, 112]].forEach(function (c) { stroke(put, X(c[0]), X(c[1]), X(c[2]), X(c[3]), X(1), function () { return G.marbleDk; }); });
    ell(put, X(78), X(52), X(9.5), X(9.5), function (tx, ty) { return mix('#f8f6ee', G.marbleDk, clamp(tx * 1.05 + ty * 0.5 - 0.3, 0, 1)); });
    ell(put, X(73), X(54), X(4), X(5.5), function (tx, ty) { return mix(G.marble, G.marbleDk, tx * 0.6 + ty * 0.3); });
    ell(put, X(83), X(54), X(4), X(5.5), function (tx, ty) { return mix(G.marble, G.marbleDk, tx * 0.6 + ty * 0.3); });
    stroke(put, X(68), X(60), X(72), X(66), X(2.4), function () { return G.marbleDk; });
    stroke(put, X(88), X(60), X(84), X(66), X(2.4), function () { return G.marbleDk; });
    put(Math.round(X(78)), Math.round(X(53)), H.night);
    put(Math.round(X(78)), Math.round(X(52.3)), '#c83a34');
    stroke(put, X(70), X(74), X(74), X(84), X(0.7), function () { return G.marbleDk; });
    stroke(put, X(88), X(92), X(84), X(102), X(0.7), function () { return G.marbleDk; });
  }
  function drawSiren(put, S) {
    var X = U(S); lightMotes(put, S, 5, 12);
    wing(put, X(64), X(64), -1, X(17), G.wing, G.wingDk);
    for (var y = 70; y <= 112; y++) { var t = (y - 70) / 42, w = 9 + t * 10; row(put, Math.round(X(y)), X(66 - w * 0.6), X(66 + w), (function (t2) { return function (tx) { return mix('#e8d8f0', '#9a7ab0', clamp(tx * 1.15 + t2 * 0.3, 0, 1)); }; })(t)); }
    ell(put, X(66), X(56), X(8.5), X(8.5), function (tx, ty) { return mix(G.skin, G.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)); });
    for (var y2 = 46; y2 <= 66; y2++) row(put, Math.round(X(y2)), X(71), X(76 + Math.sin((y2 - 46) * 0.4) * 2), function (tx) { return mix('#e8c060', '#8a6a20', tx); });
    halo(put, X(66), X(42), X(8));
    put(Math.round(X(63)), Math.round(X(55)), G.ink); put(Math.round(X(69)), Math.round(X(55)), G.ink);
    stroke(put, X(84), X(38), X(84), X(112), X(2.6), function () { return G.gold; });
    for (var a = -0.2; a <= 1.35; a += 0.05) put(Math.round(X(84 + Math.sin(a) * 30)), Math.round(X(40 + (1 - Math.cos(a)) * 26)), G.goldDk);
    stroke(put, X(84), X(112), X(112), X(104), X(2.6), function () { return G.gold; });
    for (var k = 0; k < 7; k++) { var t = k / 6; stroke(put, X(88 + t * 22), X(46 + t * 18), X(88 + t * 21), X(110 - t * 4), X(0.7), function () { return mix(G.white, G.wingDk, 0.2); }); }
    stroke(put, X(74), X(72), X(90), X(78), X(2.4), function () { return G.skin; });
    [[112, 60, 1], [120, 48, 0.75], [126, 38, 0.55]].forEach(function (p) {
      var nx = p[0], ny = p[1], sc = p[2];
      ell(put, X(nx), X(ny), X(2.2 * sc), X(1.8 * sc), (function (sc2) { return function () { return mix('#ff8ab0', H.night, 1 - sc2); }; })(sc));
      stroke(put, X(nx + 2 * sc), X(ny), X(nx + 2 * sc), X(ny - 6 * sc), X(1 * sc), (function (sc2) { return function () { return mix('#ff8ab0', H.night, 1 - sc2); }; })(sc));
    });
  }
  function drawHerald(put, S) {
    var X = U(S); lightMotes(put, S, 5, 16);
    wing(put, X(60), X(60), -1, X(18), G.wing, G.wingDk);
    wing(put, X(84), X(60), 1, X(18), G.wing, G.wingDk);
    for (var i = 0; i <= 22; i++) { var t = i / 22, cw = 3 + t * 16; for (var k = -1; k <= 1; k += 0.34) put(Math.round(X(106 + t * 40)), Math.round(X(64 + k * cw)), mix(G.holyLt, H.night, 0.42 + Math.abs(k) * 0.3 + t * 0.2)); }
    for (var y = 58; y <= 100; y++) { var t2 = (y - 58) / 42, w = 9 + t2 * 7; row(put, Math.round(X(y)), X(72 - w - t2 * 10), X(72 + w * 0.8), (function (t3) { return function (tx) { return mix('#e8e2f0', '#9a90b8', clamp(tx * 1.15 + t3 * 0.35, 0, 1)); }; })(t2)); }
    ell(put, X(76), X(52), X(8.5), X(8.5), function (tx, ty) { return mix(G.skin, G.skinDk, clamp(tx + ty * 0.45 - 0.25, 0, 1)); });
    halo(put, X(76), X(40), X(9));
    put(Math.round(X(74)), Math.round(X(51)), G.ink);
    ell(put, X(82), X(56), X(2), X(1.6), function () { return '#c07a5a'; });
    stroke(put, X(84), X(58), X(106), X(62), X(2.2), function () { return G.gold; });
    for (var i4 = 0; i4 <= 6; i4++) { var t4 = i4 / 6, bw = 2 + t4 * 5; stroke(put, X(106 + t4 * 8), X(62 + t4 * 0.5 - bw), X(106 + t4 * 8), X(62 + t4 * 0.5 + bw), X(1.4), (function (t5) { return function () { return mix(G.goldLt, G.goldDk, t5 * 0.5); }; })(t4)); }
    for (var y3 = 64; y3 <= 78; y3++) row(put, Math.round(X(y3)), X(96), X(106), function (tx) { return mix('#c8302a', '#6a1210', tx); });
    stroke(put, X(96), X(70), X(106), X(70), X(1), function () { return G.goldLt; });
  }
  function drawArchon(put, S) {
    var X = U(S); lightMotes(put, S, 5, 20); shadow(put, X(80), X(128), X(28), X(5));
    wing(put, X(60), X(52), -1, X(22), G.wing, G.wingDk);
    wing(put, X(100), X(52), 1, X(22), G.wing, G.wingDk);
    wing(put, X(62), X(74), -1, X(16), G.wing, G.wingDk);
    wing(put, X(98), X(74), 1, X(16), G.wing, G.wingDk);
    [[70], [90]].forEach(function (a) { var lx = a[0]; stroke(put, X(lx), X(98), X(lx), X(122), X(5), function () { return '#c8b878'; }); ell(put, X(lx + 1), X(126), X(6), X(3.4), function (tx, ty) { return mix(G.goldLt, G.goldDk, ty); }); });
    for (var y = 60; y <= 100; y++) { var t = (y - 60) / 40, w = 16 - t * 4; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix('#f6f0dc', '#b09850', clamp(tx * 1.25 + t2 * 0.25, 0, 1)); }; })(t)); }
    stroke(put, X(80), X(62), X(80), X(98), X(1), function () { return G.goldDk; });
    ell(put, X(80), X(74), X(4.4), X(5.4), function (tx, ty) { return mix(G.white, G.holy, ty); });
    ell(put, X(62), X(64), X(9), X(8), function (tx, ty) { return mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, X(98), X(64), X(9), X(8), function (tx, ty) { return mix(G.goldLt, G.goldDk, clamp(tx + ty * 0.5, 0, 1)); });
    dome(put, X(80), X(50), X(10), '#f6f0dc', '#c8b878', '#8a7a3a');
    row(put, Math.round(X(50)), X(72), X(88), function () { return H.night; });
    row(put, Math.round(X(51)), X(73), X(87), function () { return G.holyLt; });
    lick(put, X(80), X(36), X(7), G.holyLt, G.white);
    stroke(put, X(100), X(74), X(118), X(66), X(3), function () { return '#c8b878'; });
    stroke(put, X(118), X(66), X(140), X(36), X(3), function () { return G.holyLt; });
    stroke(put, X(118), X(66), X(140), X(36), X(1.2), function () { return G.white; });
    stroke(put, X(112), X(70), X(124), X(60), X(2.2), function () { return G.goldDk; });
  }

  // ================= SATAN — #10 KING IN FLAME (render_satan.js) ============
  function drawSatan(put, S, opts) {
    var p = opts || { cape: true, fireCrown: true, wings: true, weapon: 'trident', goldWpn: true, horns: 'crown', legs: 'goat', seed: 10 };
    var X = U(S);
    var skin = p.skin || H.demon, skinLt = p.skinLt || H.demonLt, skinDk = p.skinDk || H.demonDk;
    var fire = p.fire === 'fel' ? H.fel : H.lava, fireLt = p.fire === 'fel' ? H.felLt : H.lavaLt;
    embers(put, S, 7, p.seed || 0);
    shadow(put, X(80), X(148), X(34), X(6));
    if (p.wings) {
      batWing(put, X(56), X(52), -1, X(30), p.wingC || '#3a1220', '#1a0810');
      batWing(put, X(104), X(52), 1, X(30), p.wingC || '#3a1220', '#1a0810');
    }
    if (p.cape) {
      for (var y = 46; y <= 118; y++) {
        var t = (y - 46) / 72, w = 16 + t * 16 + Math.sin(y * 0.4) * 2;
        row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { return mix(mix(fire, H.night, 0.35), H.night, clamp(Math.abs(tx - 0.5) * 1.8 + t2 * 0.35, 0, 1)); }; })(t));
      }
      for (var k = 0; k < 5; k++) lick(put, X(52 + k * 14), X(118 + (k % 2) * 4), X(5), fire, fireLt);
    }
    tail(put, X(96), X(112), 1, X(34), skin, skinDk);
    // goat legs
    [[68, -1], [92, 1]].forEach(function (a) { var lx = a[0], sd = a[1];
      stroke(put, X(lx), X(106), X(lx + sd * 2), X(122), X(5.4), function () { return mix(skin, skinDk, 0.3); });
      stroke(put, X(lx + sd * 2), X(122), X(lx - sd * 1), X(134), X(3.6), function () { return skinDk; });
      stroke(put, X(lx - sd * 1), X(134), X(lx + sd * 1), X(144), X(3), function () { return mix(skinDk, H.night, 0.3); });
      ell(put, X(lx + sd * 1), X(146), X(4), X(2.6), function () { return H.night; });
      stroke(put, X(lx + sd * 1), X(144), X(lx + sd * 1), X(148), X(1), function () { return '#3a3440'; });
      for (var k2 = 0; k2 < 4; k2++) stroke(put, X(lx + sd * 2 - 2 + k2 * 1.6), X(112 + k2 * 3), X(lx + sd * 2 - 3 + k2 * 1.6), X(116 + k2 * 3), X(1), function () { return skinDk; });
    });
    // torso
    for (var y2 = 46; y2 <= 110; y2++) { var t3 = (y2 - 46) / 64, w2 = 24 - t3 * 12 + Math.sin(t3 * 3.14) * 2; row(put, Math.round(X(y2)), X(80 - w2), X(80 + w2), (function (t4) { return function (tx) { return mix(skinLt, skinDk, clamp(tx * 1.25 + t4 * 0.25, 0, 1)); }; })(t3)); }
    [[62], [74], [86]].forEach(function (a) { stroke(put, X(70), X(a[0] + 14), X(90), X(a[0] + 14), X(0.9), function () { return mix(skinDk, H.night, 0.25); }); });
    stroke(put, X(80), X(58), X(80), X(100), X(0.9), function () { return mix(skinDk, H.night, 0.25); });
    // pauldron spikes
    ell(put, X(56), X(50), X(10), X(8), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, X(104), X(50), X(10), X(8), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx + ty * 0.5, 0, 1)); });
    [[52, 42], [60, 40], [100, 40], [108, 42]].forEach(function (s2) { stroke(put, X(s2[0]), X(s2[1] + 8), X(s2[0]), X(s2[1]), X(2), function () { return H.hornDk; }); });
    // arms + GOLD trident
    stroke(put, X(102), X(56), X(116), X(76), X(4.4), function () { return skin; });
    ell(put, X(117), X(79), X(4), X(4), function () { return skinDk; });
    stroke(put, X(118), X(130), X(116), X(28), X(2.6), function () { return (p.goldWpn ? H.goldDk : H.ironDk); });
    [[108, 20], [117, 12], [126, 20]].forEach(function (pr) { stroke(put, X(117), X(26), X(pr[0]), X(pr[1]), X(2), function () { return (p.goldWpn ? H.gold : H.iron); }); put(Math.round(X(pr[0])), Math.round(X(pr[1] - 1)), fireLt); });
    stroke(put, X(58), X(56), X(48), X(78), X(4.4), function () { return skin; });
    ell(put, X(46), X(81), X(4), X(4), function () { return skinDk; });
    // head
    ell(put, X(80), X(36), X(11.5), X(11), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx * 1.1 + ty * 0.5 - 0.2, 0, 1)); });
    stroke(put, X(71), X(31), X(78), X(33), X(1.6), function () { return skinDk; });
    stroke(put, X(82), X(33), X(89), X(31), X(1.6), function () { return skinDk; });
    put(Math.round(X(74)), Math.round(X(35)), fireLt); put(Math.round(X(86)), Math.round(X(35)), fireLt);
    put(Math.round(X(74)), Math.round(X(36)), fire); put(Math.round(X(86)), Math.round(X(36)), fire);
    stroke(put, X(74), X(43), X(86), X(43), X(1.2), function () { return H.night; });
    put(Math.round(X(75)), Math.round(X(44.5)), H.white); put(Math.round(X(85)), Math.round(X(44.5)), H.white);
    for (var y3 = 46; y3 <= 54; y3++) { var w3 = 2.6 * (1 - (y3 - 46) / 9); row(put, Math.round(X(y3)), X(80 - w3), X(80 + w3), function () { return mix(H.night, skinDk, 0.3); }); }
    // crown horns
    horns(put, X(80), X(28), X(12), H.horn, H.hornDk, 1.2);
    horns(put, X(80), X(30), X(7), H.horn, H.hornDk, 0.55);
    stroke(put, X(80), X(26), X(80), X(18), X(2), function () { return H.hornDk; });
    if (p.fireCrown !== false) { lick(put, X(72), X(20), X(5), fire, fireLt); lick(put, X(80), X(16), X(7), fire, fireLt); lick(put, X(88), X(20), X(5), fire, fireLt); }
  }
  function drawSatanVent(put, S) { drawSatan(put, S, { cape: true, fireCrown: false, wings: true, weapon: 'trident', goldWpn: true, horns: 'crown', legs: 'goat', seed: 10 }); }

  // ================= SUPREME BEING composite (eye + zeus, entrance layout) ===
  function eyeGod(put, S, p) {
    p = p || {};
    var X = U(S);
    lightMotes(put, S, 6, p.seed || 0);
    var EX = 80, EY = 74;
    var irisC = p.irisC || G.gold, irisDk = p.irisDk || G.goldDk;
    var wingC = G.wing;
    if (p.rayAura) rays(put, X(EX), X(EY), X(42), X(58), 16, mix(G.holy, H.night, 0.42));
    bigWing(put, X(58), X(EY - 8), -1, X(34), 1.05, wingC, G.wingDk);
    bigWing(put, X(102), X(EY - 8), 1, X(34), 1.05, wingC, G.wingDk);
    var RW = 26, RH = 17;
    for (var y = -RH; y <= RH; y++) {
      var t = Math.abs(y) / RH;
      var w = RW * Math.sqrt(Math.max(0, 1 - t * t));
      row(put, Math.round(X(EY + y)), X(EX - w), X(EX + w), (function (t2) { return function (tx) { return mix(G.white, '#c8c2b0', clamp(Math.abs(tx - 0.5) * 1.1 + t2 * 0.45, 0, 1)); }; })(t));
    }
    var lid = p.lidState || 'open';
    if (lid !== 'closed') {
      var IR = lid === 'half' ? 9 : 11;
      ell(put, X(EX), X(EY), X(IR + 2), X(IR + 2), function (tx, ty) { return mix(mix(irisC, G.white, 0.3), irisDk, clamp((tx + ty) * 0.8, 0, 1)); });
      ell(put, X(EX), X(EY), X(IR), X(IR), function (tx, ty) { return mix(mix(irisC, '#ffffff', 0.25), irisDk, clamp(tx * 1.15 + ty * 0.5 - 0.2, 0, 1)); });
      for (var a = 0; a < 6.28; a += 0.32) stroke(put, X(EX + Math.cos(a) * IR * 0.45), X(EY + Math.sin(a) * IR * 0.45), X(EX + Math.cos(a) * IR * 0.9), X(EY + Math.sin(a) * IR * 0.9), X(0.7), (function (a2) { return function () { return mix(irisDk, irisC, (Math.sin(a2 * 4) + 1) / 2); }; })(a));
      ell(put, X(EX), X(EY), X(4.4), X(4.4), function () { return H.night; });
      ell(put, X(EX - 4), X(EY - 4), X(2.2), X(1.8), function () { return G.white; });
    }
    var lidC = '#e8d8c0', lidDk = '#a08a68';
    var lidDrop = lid === 'closed' ? RH * 1.7 : lid === 'half' ? RH * 0.9 : RH * 0.35;
    for (var x = -RW; x <= RW; x++) {
      var t3 = Math.abs(x) / RW;
      var edge = EY - RH * Math.sqrt(Math.max(0, 1 - t3 * t3));
      var lidY = edge + lidDrop * Math.sqrt(Math.max(0, 1 - t3 * t3));
      for (var yy = edge - 2; yy <= lidY; yy++) put(Math.round(X(EX + x)), Math.round(X(yy)), mix(lidC, lidDk, clamp((yy - edge + 2) / Math.max(1, lidDrop) * 0.7 + t3 * 0.3, 0, 1)));
    }
    if (lid === 'closed') stroke(put, X(EX - RW * 0.8), X(EY + 2), X(EX + RW * 0.8), X(EY + 2), X(1.2), function () { return lidDk; });
    for (var x2 = -RW; x2 <= RW; x2++) { var t4 = Math.abs(x2) / RW; var edge2 = EY + RH * Math.sqrt(Math.max(0, 1 - t4 * t4)); put(Math.round(X(EX + x2)), Math.round(X(edge2)), lidDk); }
    halo(put, X(EX), X(EY - RH - 14), X(13));
  }
  function zeusGod(put, S) {
    var p = { beard: 'white', held: 'scales', robe: 'gold', haloS: 'sun', crown: true, seed: 10 };
    var X = U(S);
    lightMotes(put, S, 6, p.seed);
    var skin = '#e8b088', skinLt = '#f8d0a8', skinDk = '#a06a44';
    var robeC = [G.goldLt, G.goldDk];
    for (var ys = -4; ys <= 4; ys++) row(put, Math.round(X(148 + ys * 0.6)), X(80 - 30 * Math.sqrt(1 - Math.abs(ys) / 5)), X(80 + 30 * Math.sqrt(1 - Math.abs(ys) / 5)), function () { return '#0a060a'; });
    // lower robe
    for (var y = 90; y <= 142; y++) {
      var t = (y - 90) / 52, w = 15 + t * 14;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (t2) { return function (tx) { var fold = Math.abs(Math.sin(tx * 12.5)) * 0.22; return mix(robeC[0], robeC[1], clamp(tx * 1.1 + t2 * 0.3 + fold, 0, 1)); }; })(t));
    }
    row(put, Math.round(X(142)), X(51), X(109), function () { return G.goldDk; });
    for (var y2 = 88; y2 <= 96; y2++) row(put, Math.round(X(y2)), X(64), X(96), function (tx) { return mix(robeC[0], robeC[1], clamp(tx * 1.3, 0, 1)); });
    row(put, Math.round(X(88)), X(64), X(96), function () { return G.gold; });
    ell(put, X(66), X(92), X(3.4), X(3), function (tx, ty) { return mix(robeC[0], robeC[1], ty); });
    stroke(put, X(66), X(95), X(62), X(108), X(2.4), function () { return robeC[1]; });
    [[70], [90]].forEach(function (a) { var fx = a[0]; ell(put, X(fx), X(145), X(5.4), X(2.6), function (tx, ty) { return mix(skin, skinDk, ty); }); stroke(put, X(fx - 3), X(144), X(fx + 3), X(144), X(0.8), function () { return '#8a5c2a'; }); });
    // torso
    for (var y3 = 46; y3 <= 90; y3++) { var t3 = (y3 - 46) / 44, w3 = 24 - t3 * 9; row(put, Math.round(X(y3)), X(80 - w3), X(80 + w3), (function (t4) { return function (tx) { return mix(skinLt, skinDk, clamp(tx * 1.2 + t4 * 0.18, 0, 1)); }; })(t3)); }
    for (var y4 = 42; y4 <= 48; y4++) { var w4 = 12 + (y4 - 42) * 2; row(put, Math.round(X(y4)), X(80 - w4), X(80 + w4), function (tx) { return mix(skinLt, skinDk, clamp(tx * 1.2, 0, 1)); }); }
    stroke(put, X(80), X(50), X(80), X(66), X(1), function () { return mix(skinDk, H.night, 0.15); });
    for (var a2 = 3.4; a2 <= 6.0; a2 += 0.08) { put(Math.round(X(68 + Math.cos(a2) * 9)), Math.round(X(62 + Math.sin(a2) * -5)), mix(skinDk, skin, 0.4)); put(Math.round(X(92 + Math.cos(a2) * 9)), Math.round(X(62 + Math.sin(a2) * -5)), mix(skinDk, skin, 0.4)); }
    put(Math.round(X(72)), Math.round(X(60)), skinDk); put(Math.round(X(88)), Math.round(X(60)), skinDk);
    stroke(put, X(80), X(66), X(80), X(88), X(1), function () { return mix(skinDk, H.night, 0.15); });
    [[72], [79]].forEach(function (a) { stroke(put, X(72), X(a[0]), X(88), X(a[0]), X(0.9), function () { return mix(skinDk, skin, 0.3); }); });
    stroke(put, X(72), X(86), X(88), X(86), X(0.9), function () { return mix(skinDk, skin, 0.3); });
    stroke(put, X(69), X(74), X(72), X(86), X(0.9), function () { return mix(skinDk, skin, 0.35); });
    stroke(put, X(91), X(74), X(88), X(86), X(0.9), function () { return mix(skinDk, skin, 0.35); });
    // delts
    ell(put, X(54), X(50), X(9.5), X(8), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)); });
    ell(put, X(106), X(50), X(9.5), X(8), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx + ty * 0.5 - 0.1, 0, 1)); });
    // scales arm (Red — dangle from the outstretched fist)
    stroke(put, X(108), X(50), X(122), X(58), X(6), function () { return skin; });
    ell(put, X(125), X(60), X(4.2), X(4), function () { return skinDk; });
    stroke(put, X(125), X(63), X(125), X(70), X(1.2), function () { return G.goldDk; });
    ell(put, X(125), X(64), X(1.8), X(1.4), function () { return G.gold; });
    stroke(put, X(111), X(72), X(139), X(70), X(1.8), function () { return G.gold; });
    ell(put, X(125), X(71), X(2), X(1.8), function () { return G.goldLt; });
    [[111, 72, 84], [139, 70, 82]].forEach(function (pn) {
      [[-5], [5]].forEach(function (o) { stroke(put, X(pn[0]), X(pn[1]), X(pn[0] + o[0]), X(pn[2]), X(0.8), function () { return G.goldDk; }); });
      for (var yy = 0; yy <= 3; yy++) row(put, Math.round(X(pn[2] + yy)), X(pn[0] - 7 + yy), X(pn[0] + 7 - yy), function (tx) { return mix(G.goldLt, G.goldDk, tx); });
    });
    stroke(put, X(52), X(54), X(44), X(74), X(6), function () { return skin; });
    ell(put, X(42), X(77), X(4), X(4), function () { return skinDk; });
    // head
    stroke(put, X(80), X(40), X(80), X(46), X(7), function () { return skin; });
    ell(put, X(80), X(32), X(9.5), X(10), function (tx, ty) { return mix(skinLt, skinDk, clamp(tx * 1.05 + ty * 0.4 - 0.25, 0, 1)); });
    put(Math.round(X(76)), Math.round(X(31)), G.ink); put(Math.round(X(84)), Math.round(X(31)), G.ink);
    stroke(put, X(73), X(28.5), X(78), X(29), X(1.2), function () { return mix(G.white, G.wingDk, 0.4); });
    stroke(put, X(82), X(29), X(87), X(28.5), X(1.2), function () { return mix(G.white, G.wingDk, 0.4); });
    ell(put, X(80), X(24), X(9), X(4.4), function (tx, ty) { return mix(G.white, G.wingDk, tx + ty * 0.3); });
    // white beard
    for (var y5 = 34; y5 <= 56; y5++) { var t5 = (y5 - 34) / 22, w5 = 8 * (1 - t5 * 0.45); row(put, Math.round(X(y5 + 2)), X(80 - w5), X(80 + w5), (function (t6) { return function (tx) { return mix(G.white, G.wingDk, clamp(tx * 0.9 + t6 * 0.3, 0, 1)); }; })(t5)); }
    [[75], [80], [85]].forEach(function (a) { stroke(put, X(a[0]), X(42), X(a[0]), X(56), X(0.8), function () { return G.wingDk; }); });
    stroke(put, X(76), X(35), X(84), X(35), X(1), function () { return '#c07a5a'; });
    // crown + sun halo
    row(put, Math.round(X(20)), X(72), X(88), function () { return G.gold; });
    [[74, 16], [80, 14], [86, 16]].forEach(function (c) { stroke(put, X(c[0]), X(20), X(c[0]), X(c[1]), X(1.8), function () { return G.gold; }); put(Math.round(X(c[0])), Math.round(X(c[1] - 1)), G.holyLt); });
    rays(put, X(80), X(28), X(13), X(19), 12, G.gold); halo(put, X(80), X(16), X(10));
  }
  function drawSupreme(put, S, lidState) {
    // composite: THE WATCHER (eye) up top on shafts of light, JUDGE OLYMPUS below
    var eS = Math.round(S * 0.575), eOX = Math.round((S - eS) / 2), eOY = Math.round(-S * 0.03);
    eyeGod(function (x, y, c) { put(x + eOX, y + eOY, c); }, eS, { rayAura: true, lidState: lidState || 'open', seed: 1 });
    var holy = '#fff2c0';
    [[-14, -8], [14, 8]].forEach(function (o) {
      for (var i = 0; i <= 30; i++) {
        var t = i / 30;
        var x0 = S / 2 + (o[0] * (1 - t) + o[1] * t) * (S / 200), y0 = S * 0.3 + t * S * 0.28;
        put(Math.round(x0), Math.round(y0), mix(holy, H.night, 0.35 + t * 0.25));
        put(Math.round(x0 + 1), Math.round(y0), mix(holy, H.night, 0.6 + t * 0.2));
      }
    });
    var zS = Math.round(S * 0.575), zOX = Math.round((S - zS) / 2), zOY = Math.round(S * 0.34);
    zeusGod(function (x, y, c) { put(x + zOX, y + zOY, c); }, zS);
  }

  // ============================ TILES (render_eternal_tiles.js) =============
  function h2(ix, iy, seed) { var s = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
  function sn(x, y, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, seed), b = h2(ix + 1, iy, seed), c = h2(ix, iy + 1, seed), d = h2(ix + 1, iy + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function tBrimstone(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 22, y / 22, 1) * 0.65 + sn(x / 7, y / 7, 2) * 0.35;
      var c = mix(H.rockLt, H.rockDk, clamp(n * 1.35, 0, 1));
      if (n > 0.78) c = mix(c, H.lavaDk, 0.4);
      put(x, y, c);
    }
    for (var k = 0; k < 3; k++) {
      var cx = h2(k, 7, 3) * S, cy = h2(k, 11, 3) * S;
      for (var i = 0; i < 26; i++) {
        var a = sn(cx / 30, cy / 30, 4) * 6.28;
        var nx = cx + Math.cos(a) * 4, ny = cy + Math.sin(a) * 4;
        stroke(put, cx, cy, nx, ny, 1, (function (i2) { return function () { return (i2 % 3 ? H.lavaDk : mix(H.lava, H.lavaDk, 0.4)); }; })(i));
        cx = (nx + S) % S; cy = (ny + S) % S;
      }
    }
  }
  function tAsh(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = sn(x / 26, y / 26, 5) * 0.6 + sn(x / 9, y / 9, 6) * 0.4; put(x, y, mix('#5a525e', '#2a242e', clamp(n * 1.3, 0, 1))); }
    for (var k = 0; k < 5; k++) { var dx = h2(k, 3, 7) * S, dy = h2(k, 9, 7) * S, dw = 10 + h2(k, 5, 7) * 14; for (var i = 0; i < dw; i++) put(Math.round((dx + i) % S), Math.round(dy + Math.sin(i * 0.5) * 1.6), mix('#6a6270', '#3a3440', h2(i, k, 8))); }
    [[0.2, 0.3], [0.7, 0.6], [0.4, 0.85]].forEach(function (f, i) { put(Math.round(f[0] * S), Math.round(f[1] * S), i % 2 ? H.ember : '#7a4a2e'); });
  }
  function tObsidian(put, S) {
    var cell = S / 4;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var gx = x % cell, gy = y % cell;
      var edge = gx < 1.6 || gy < 1.6;
      var n = sn(x / 14, y / 14, 9);
      var c = edge ? H.obsidDk : mix(H.obsidLt, H.obsid, clamp(n * 1.25, 0, 1));
      if (!edge && n > 0.8) c = mix(c, '#6a5a7a', 0.5);
      put(x, y, c);
    }
    var rx = cell * 2.5, ry = cell * 1.5;
    for (var a = 0; a < 6.28; a += 0.25) put(Math.round(rx + Math.cos(a) * cell * 0.26), Math.round(ry + Math.sin(a) * cell * 0.26), mix(H.fel, H.obsid, 0.35));
    stroke(put, rx - 3, ry + 3, rx + 3, ry - 3, 1, function () { return mix(H.fel, H.obsid, 0.25); });
  }
  function tBoneLitter(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = sn(x / 20, y / 20, 10) * 0.7 + sn(x / 6, y / 6, 11) * 0.3; put(x, y, mix('#42303a', '#1c1218', clamp(n * 1.3, 0, 1))); }
    for (var k = 0; k < 9; k++) { var bx = h2(k, 13, 12) * S, by = h2(k, 17, 12) * S, a = h2(k, 19, 12) * 6.28, ln = 5 + h2(k, 23, 12) * 7; stroke(put, bx, by, bx + Math.cos(a) * ln, by + Math.sin(a) * ln, 1.6, (function (k2) { return function () { return mix(H.bone, H.boneDk, h2(k2, 29, 12) * 0.5); }; })(k)); put(Math.round(bx), Math.round(by), H.boneDk); }
    ell(put, S * 0.68, S * 0.72, S * 0.045, S * 0.04, function (tx, ty) { return mix(H.bone, H.boneDk, clamp(tx + ty * 0.5, 0, 1)); });
    put(Math.round(S * 0.665), Math.round(S * 0.715), H.night);
  }
  function tMarble(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = sn(x / 24, y / 24, 13) * 0.6 + sn(x / 8, y / 8, 14) * 0.4; put(x, y, mix(G.white, G.marbleDk, clamp(n * 0.85, 0, 1))); }
    for (var k = 0; k < 3; k++) {
      var vx = h2(k, 31, 15) * S, vy = 0;
      while (vy < S) { var nx = vx + (sn(vx / 18, vy / 18, 16) - 0.5) * 7, ny = vy + 3; stroke(put, vx, vy, nx, ny, 0.9, (function (vx2, vy2) { return function () { return mix(G.gold, G.marbleDk, 0.35 + h2(vx2 | 0, vy2 | 0, 17) * 0.3); }; })(vx, vy)); vx = (nx + S) % S; vy = ny; }
    }
  }
  function tGoldPath(put, S) {
    var cell = S / 5;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var rowI = Math.floor(y / cell);
      var gx = (x + (rowI % 2) * cell * 0.5) % cell, gy = y % cell;
      var edge = gx < 1.4 || gy < 1.4;
      var n = sn(x / 12, y / 12, 18);
      var c = edge ? G.goldDk : mix(G.goldLt, G.gold, clamp(n * 1.2, 0, 1));
      if (!edge && n > 0.82) c = mix(c, G.white, 0.45);
      put(x, y, c);
    }
  }
  function tCloud(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) { var n = sn(x / 20, y / 20, 19) * 0.55 + sn(x / 7, y / 7, 20) * 0.45; var c = mix(G.white, '#aab6c8', clamp(n * 1.05, 0, 1)); if (n < 0.22) c = mix(c, G.holyLt, 0.5); put(x, y, c); }
    for (var k = 0; k < 4; k++) { var wx = h2(k, 37, 21) * S, wy = h2(k, 41, 21) * S; for (var a = 0; a < 3.6; a += 0.12) put(Math.round(wx + Math.cos(a) * (3 + a * 1.6)), Math.round(wy + Math.sin(a) * (2 + a * 1.1)), mix(G.white, '#c8d2de', 0.3)); }
  }
  function riverFrame(phase) {
    return function (put, S) {
      var ph = phase * 0.31;
      for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
        var flow = sn(x / 30 + y / 90 + ph, y / 16 + ph, 25) * 0.6 + sn(x / 9, y / 9, 26) * 0.4;
        var c = mix(H.soulDk, '#0a2a24', clamp(flow * 1.3, 0, 1));
        if (flow > 0.74) c = mix(c, H.soul, 0.45);
        put(x, y, c);
      }
      var faces = [[0.22, 0.3, 0.5], [0.6, 0.62, 0.3], [0.82, 0.18, 0.6], [0.4, 0.85, 0.45]];
      faces.forEach(function (f, fi) {
        var fx = ((f[0] + phase * 0.12) % 1), fy = ((f[1] + phase * 0.18) % 1);
        var sx = fx * S, sy = fy * S, fd = f[2];
        ell(put, sx, sy, S * 0.06, S * 0.075, (function (fd2) { return function (tx, ty) { return mix(mix(H.soulLt, H.soulDk, fd2), H.soulDk, clamp(tx + ty * 0.4, 0, 1)); }; })(fd));
        put(Math.round(sx - 2), Math.round(sy - 1.5), mix(H.night, H.soulDk, 0.4));
        put(Math.round(sx + 2), Math.round(sy - 1.5), mix(H.night, H.soulDk, 0.4));
        for (var i = 1; i <= 5; i++) put(Math.round(sx - i * 2.4), Math.round(sy + Math.sin(i + fi) * 1.2), mix(H.soul, H.soulDk, 0.4 + i * 0.1));
      });
    };
  }
  function tBridge(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 12, y / 12, 27);
      var plank = Math.floor(y / (S / 8));
      var edge = y % (S / 8) < 1.4;
      if (x < S / 2) {
        var c = edge ? G.goldDk : mix(G.goldLt, G.gold, clamp(n * 1.2 + (plank % 2) * 0.12, 0, 1));
        if (!edge && n > 0.84) c = mix(c, G.white, 0.4);
        put(x, y, c);
      } else {
        var c2 = edge ? '#4a4238' : mix(H.bone, H.boneDk, clamp(n * 1.15 + (plank % 2) * 0.1, 0, 1));
        put(x, y, c2);
      }
    }
    stroke(put, S / 2, 0, S / 2, S, 1.4, function () { return H.night; });
  }

  // ============================ DECOR + SET PIECES + PORTAL =================
  // themed, compact originals (silhouettes read at a glance; fences carry break
  // states for the destructible-fence mechanic).
  function dBonePile(put, S) {
    shadow(put, S * 0.5, S * 0.82, S * 0.3, S * 0.05);
    [[0.34, 0.7, 0.11], [0.62, 0.72, 0.1], [0.5, 0.58, 0.13]].forEach(function (b) {
      ell(put, S * b[0], S * b[1], S * b[2], S * b[2] * 0.9, function (tx, ty) { return mix(H.bone, H.boneDk, clamp(tx + ty * 0.5, 0, 1)); });
      put(Math.round(S * (b[0] - 0.03)), Math.round(S * (b[1] - 0.01)), H.night); put(Math.round(S * (b[0] + 0.03)), Math.round(S * (b[1] - 0.01)), H.night);
    });
    for (var k = 0; k < 5; k++) stroke(put, S * (0.28 + k * 0.1), S * 0.84, S * (0.3 + k * 0.1), S * 0.7, 1.6, function () { return mix(H.bone, H.boneDk, 0.4); });
  }
  function dSpire(put, S) {
    shadow(put, S * 0.5, S * 0.86, S * 0.22, S * 0.05);
    for (var y = S * 0.2; y < S * 0.86; y++) { var t = (y - S * 0.2) / (S * 0.66), w = S * (0.04 + t * 0.12); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (function (t2) { return function (tx) { return mix(H.obsidLt, H.obsidDk, clamp(tx * 1.1 + t2 * 0.2, 0, 1)); }; })(t)); }
    for (var k = 0; k < 3; k++) stroke(put, S * 0.5, S * (0.3 + k * 0.18), S * (0.42 + k * 0.04), S * (0.42 + k * 0.18), 1, function () { return H.fel; });
  }
  function dGeyser(put, S) {
    ell(put, S * 0.5, S * 0.8, S * 0.24, S * 0.09, function (tx, ty) { return mix(H.lava, H.lavaDk, clamp(tx + ty * 0.5, 0, 1)); });
    for (var k = 0; k < 4; k++) lick(put, S * (0.4 + k * 0.07), S * (0.6 - (k % 2) * 0.12), S * 0.07, H.lava, H.lavaLt);
    cracks(put, S * 0.5, S * 0.78, S * 0.2, 5, 2);
  }
  function dThrone(put, S) {
    shadow(put, S * 0.5, S * 0.88, S * 0.3, S * 0.05);
    plate(put, S * 0.34, S * 0.44, S * 0.66, S * 0.86, H.obsid, H.obsidLt, H.obsidDk);
    [[0.34], [0.66]].forEach(function (a) { for (var i = 0; i <= 6; i++) { var t = i / 6; stroke(put, S * a[0], S * (0.44 - t * 0.16), S * (a[0] + (a[0] < 0.5 ? -1 : 1) * 0.04), S * (0.28 - t * 0.14), 2, function () { return H.hornDk; }); } });
    ell(put, S * 0.5, S * 0.5, S * 0.08, S * 0.06, function () { return H.demonDk; });
    lick(put, S * 0.5, S * 0.36, S * 0.06, H.lava, H.lavaLt);
  }
  function dGraves(put, S) {
    shadow(put, S * 0.5, S * 0.86, S * 0.3, S * 0.05);
    [[0.32, 0.6], [0.56, 0.55], [0.74, 0.62]].forEach(function (g) { plate(put, S * (g[0] - 0.06), S * g[1], S * (g[0] + 0.06), S * 0.84, H.ash, H.ashLt, H.ashDk); stroke(put, S * (g[0] - 0.03), S * (g[1] + 0.06), S * (g[0] + 0.03), S * (g[1] + 0.06), 1.4, function () { return H.ashDk; }); });
    stroke(put, S * 0.86, S * 0.82, S * 0.9, S * 0.66, 2, function () { return H.boneDk; });
    ell(put, S * 0.9, S * 0.64, S * 0.02, S * 0.03, function () { return H.bone; });
  }
  function dBrazier(put, S) {
    shadow(put, S * 0.5, S * 0.88, S * 0.18, S * 0.04);
    plate(put, S * 0.44, S * 0.6, S * 0.56, S * 0.86, H.ironDk, H.iron, H.night);
    ell(put, S * 0.5, S * 0.56, S * 0.14, S * 0.06, function (tx, ty) { return mix(H.bone, H.boneDk, ty); });
    put(Math.round(S * 0.46), Math.round(S * 0.55), H.night); put(Math.round(S * 0.54), Math.round(S * 0.55), H.night);
    lick(put, S * 0.5, S * 0.44, S * 0.09, H.lava, H.lavaLt);
  }
  function dHellBanner(put, S) {
    shadow(put, S * 0.5, S * 0.9, S * 0.1, S * 0.03);
    stroke(put, S * 0.5, S * 0.16, S * 0.5, S * 0.9, 2, function () { return H.woodDk || '#3a2418'; });
    for (var y = S * 0.2; y < S * 0.66; y++) { var t = (y - S * 0.2) / (S * 0.46); row(put, Math.round(y), S * 0.5, S * 0.5 + S * 0.22, (function (t2) { return function (tx) { return mix('#8a1a14', '#3a0a08', clamp(tx + t2 * 0.2, 0, 1)); }; })(t)); }
    for (var a = 0; a < 6.28; a += 0.4) put(Math.round(S * 0.61 + Math.cos(a) * S * 0.05), Math.round(S * 0.4 + Math.sin(a) * S * 0.05), H.fel);
  }
  function dMagma(put, S) {
    ell(put, S * 0.5, S * 0.6, S * 0.4, S * 0.26, function (tx, ty) { return mix('#3a1810', '#1a0c08', clamp(tx * 0.6 + ty * 0.6, 0, 1)); });
    for (var k = 0; k < 6; k++) { var a = k * 1.05; ell(put, S * (0.5 + Math.cos(a) * 0.2), S * (0.6 + Math.sin(a) * 0.12), S * 0.05, S * 0.035, function (tx, ty) { return mix(H.lava, H.lavaDk, ty); }); }
  }
  function boneFence(state) {
    return function (put, S) {
      shadow(put, S * 0.5, S * 0.88, S * 0.34, S * 0.04);
      var posts = state === 2 ? [0.2, 0.8] : [0.2, 0.4, 0.6, 0.8];
      posts.forEach(function (px, i) {
        var lean = state === 1 ? (i % 2 ? 0.03 : -0.03) : 0;
        var top = state === 2 ? 0.62 : 0.36;
        stroke(put, S * px, S * 0.84, S * (px + lean), S * top, 2.6, function () { return mix(H.bone, H.boneDk, 0.3); });
        ell(put, S * (px + lean), S * top, S * 0.03, S * 0.025, function () { return H.bone; });
      });
      if (state === 0) { stroke(put, S * 0.2, S * 0.5, S * 0.8, S * 0.5, 2, function () { return H.boneDk; }); stroke(put, S * 0.2, S * 0.66, S * 0.8, S * 0.66, 2, function () { return H.boneDk; }); }
      else if (state === 1) { stroke(put, S * 0.2, S * 0.52, S * 0.55, S * 0.5, 2, function () { return H.boneDk; }); }
      if (state === 2) for (var k = 0; k < 5; k++) put(Math.round(S * (0.3 + k * 0.1)), Math.round(S * 0.82), H.boneDk);
    };
  }
  function dColumn(put, S) {
    shadow(put, S * 0.5, S * 0.88, S * 0.16, S * 0.04);
    for (var y = S * 0.2; y < S * 0.84; y++) row(put, Math.round(y), S * 0.42, S * 0.58, function (tx) { return mix(G.marble, G.marbleDk, Math.abs(tx - 0.5) * 1.4); });
    plate(put, S * 0.38, S * 0.16, S * 0.62, S * 0.24, G.marbleDk, G.marble, '#8a887e');
    plate(put, S * 0.38, S * 0.82, S * 0.62, S * 0.88, G.marbleDk, G.marble, '#8a887e');
  }
  function dFountain(put, S) {
    shadow(put, S * 0.5, S * 0.86, S * 0.3, S * 0.05);
    ell(put, S * 0.5, S * 0.76, S * 0.3, S * 0.12, function (tx, ty) { return mix(G.marble, G.marbleDk, ty); });
    ell(put, S * 0.5, S * 0.74, S * 0.24, S * 0.08, function (tx, ty) { return mix(G.sky, G.skyDk, ty); });
    stroke(put, S * 0.5, S * 0.7, S * 0.5, S * 0.4, 2.4, function () { return G.marbleDk; });
    for (var a = 0; a < 6.28; a += 0.5) put(Math.round(S * 0.5 + Math.cos(a) * S * 0.08), Math.round(S * 0.44 + Math.abs(Math.sin(a)) * S * 0.04), G.holyLt);
  }
  function dAltar(put, S) {
    shadow(put, S * 0.5, S * 0.86, S * 0.24, S * 0.04);
    plate(put, S * 0.34, S * 0.56, S * 0.66, S * 0.84, G.marbleDk, G.marble, '#8a887e');
    rays(put, S * 0.5, S * 0.4, S * 0.06, S * 0.16, 8, G.holyLt);
    ell(put, S * 0.5, S * 0.54, S * 0.1, S * 0.04, function (tx) { return mix(G.goldLt, G.goldDk, tx); });
  }
  function dGate(put, S) {   // pearly gate — SUPREME arena landmark
    shadow(put, S * 0.5, S * 0.9, S * 0.34, S * 0.04);
    [[0.3], [0.7]].forEach(function (a) { for (var y = S * 0.2; y < S * 0.86; y++) row(put, Math.round(y), S * (a[0] - 0.04), S * (a[0] + 0.04), function (tx) { return mix(G.goldLt, G.goldDk, Math.abs(tx - 0.5) * 1.6); }); });
    for (var a2 = 3.34; a2 <= 6.1; a2 += 0.08) put(Math.round(S * 0.5 + Math.cos(a2) * S * 0.2), Math.round(S * 0.2 + Math.sin(a2) * S * 0.12 + S * 0.12), G.gold);
    ell(put, S * 0.5, S * 0.55, S * 0.14, S * 0.28, function (tx, ty) { return mix(G.holyLt, G.holy, ty); });
  }
  function dStatue(put, S) {
    shadow(put, S * 0.5, S * 0.88, S * 0.18, S * 0.04);
    plate(put, S * 0.4, S * 0.78, S * 0.6, S * 0.86, G.marbleDk, G.marble, '#8a887e');
    for (var y = S * 0.36; y < S * 0.78; y++) { var t = (y - S * 0.36) / (S * 0.42), w = S * (0.06 + t * 0.06); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, function (tx) { return mix(G.marble, G.marbleDk, Math.abs(tx - 0.5) * 1.2); }); }
    ell(put, S * 0.5, S * 0.3, S * 0.06, S * 0.06, function (tx, ty) { return mix(G.marble, G.marbleDk, ty); });
    wing(put, S * 0.42, S * 0.42, -1, S * 0.12, G.marble, G.marbleDk);
    wing(put, S * 0.58, S * 0.42, 1, S * 0.12, G.marble, G.marbleDk);
  }
  function dHolyBanner(put, S) {
    shadow(put, S * 0.5, S * 0.9, S * 0.1, S * 0.03);
    stroke(put, S * 0.5, S * 0.16, S * 0.5, S * 0.9, 2, function () { return G.goldDk; });
    for (var y = S * 0.2; y < S * 0.66; y++) row(put, Math.round(y), S * 0.5, S * 0.5 + S * 0.22, function (tx) { return mix(G.white, G.robeDk, tx); });
    rays(put, S * 0.61, S * 0.4, S * 0.03, S * 0.07, 8, G.gold);
  }
  function goldFence(state) {
    return function (put, S) {
      shadow(put, S * 0.5, S * 0.88, S * 0.34, S * 0.04);
      var posts = state === 2 ? [0.2, 0.8] : [0.2, 0.4, 0.6, 0.8];
      posts.forEach(function (px, i) {
        var lean = state === 1 ? (i % 2 ? 0.03 : -0.03) : 0;
        var top = state === 2 ? 0.62 : 0.34;
        stroke(put, S * px, S * 0.84, S * (px + lean), S * top, 2.6, function () { return mix(G.goldLt, G.goldDk, 0.3); });
        put(Math.round(S * (px + lean)), Math.round(S * (top - 0.02)), G.holyLt);
      });
      if (state === 0) { stroke(put, S * 0.2, S * 0.48, S * 0.8, S * 0.48, 2, function () { return G.gold; }); stroke(put, S * 0.2, S * 0.64, S * 0.8, S * 0.64, 2, function () { return G.gold; }); }
      else if (state === 1) { stroke(put, S * 0.2, S * 0.5, S * 0.55, S * 0.48, 2, function () { return G.gold; }); }
      if (state === 2) for (var k = 0; k < 5; k++) put(Math.round(S * (0.3 + k * 0.1)), Math.round(S * 0.82), G.goldDk);
    };
  }
  function dObelisk(put, S) {   // boundary obelisk — half gold, half bone
    shadow(put, S * 0.5, S * 0.9, S * 0.16, S * 0.04);
    for (var y = S * 0.14; y < S * 0.88; y++) { var t = (y - S * 0.14) / (S * 0.74), w = S * (0.04 + t * 0.05); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, function (tx) { return tx < 0.5 ? mix(G.gold, G.goldDk, tx * 2) : mix(H.bone, H.boneDk, (tx - 0.5) * 2); }); }
    stroke(put, S * 0.5, S * 0.14, S * 0.5, S * 0.88, 1, function () { return H.night; });
  }
  function dSoulGeyser(put, S) {
    ell(put, S * 0.5, S * 0.82, S * 0.22, S * 0.08, function (tx, ty) { return mix(H.soulDk, '#0a2a24', ty); });
    for (var k = 0; k < 4; k++) soulMote(put, S * (0.42 + k * 0.05), S * (0.6 - (k % 2) * 0.16), S * 0.05, 0.15 + k * 0.1);
    put(Math.round(S * 0.5), Math.round(S * 0.32), H.soulLt);
  }
  function dTitanSword(put, S) {
    shadow(put, S * 0.5, S * 0.88, S * 0.24, S * 0.04);
    stroke(put, S * 0.5, S * 0.86, S * 0.5, S * 0.2, S * 0.06, function () { return '#8a92a2'; });
    stroke(put, S * 0.5, S * 0.86, S * 0.5, S * 0.2, S * 0.02, function () { return '#c8d0da'; });
    stroke(put, S * 0.36, S * 0.66, S * 0.64, S * 0.66, S * 0.05, function () { return G.goldDk; });
    ell(put, S * 0.5, S * 0.78, S * 0.05, S * 0.05, function () { return G.gold; });
  }
  function dLantern(put, S) {   // bridge lantern pair (gold post + skull post)
    stroke(put, S * 0.36, S * 0.84, S * 0.36, S * 0.4, 2, function () { return H.boneDk; });
    ell(put, S * 0.36, S * 0.36, S * 0.05, S * 0.06, function () { return H.soulLt; });
    stroke(put, S * 0.64, S * 0.84, S * 0.64, S * 0.4, 2, function () { return G.goldDk; });
    ell(put, S * 0.64, S * 0.36, S * 0.05, S * 0.06, function () { return G.holyLt; });
  }
  function drawPortal(put, S) {
    for (var a = 0; a < 6.28; a += 0.05) { var r = S * 0.34; put(Math.round(S * 0.5 + Math.cos(a) * r), Math.round(S * 0.5 + Math.sin(a) * r), mix('#8a52ff', '#2a1060', (Math.sin(a * 3) + 1) / 2)); }
    ell(put, S * 0.5, S * 0.5, S * 0.26, S * 0.26, function (tx, ty) { return mix('#c8a0ff', '#3a1a6a', clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, S * 0.5, S * 0.5, S * 0.14, S * 0.14, function () { return '#f0e0ff'; });
    for (var k = 0; k < 8; k++) { var a2 = k / 8 * 6.28; put(Math.round(S * 0.5 + Math.cos(a2) * S * 0.2), Math.round(S * 0.5 + Math.sin(a2) * S * 0.2), '#fff2c0'); }
  }

  // ======================= REGISTRY buildArt hook ===========================
  var VV_ART = {
    H: H, G: G,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- HELL mobs (8) ----
      ctx.spr('vvImpHi', MS, MS, drawImp);          ctx.MOB_HI.vvImp = 'vvImpHi';           ctx.MOB_DISPLAY.vvImp = 88;
      ctx.spr('vvFireImpHi', MS, MS, drawFireImp);  ctx.MOB_HI.vvFireImp = 'vvFireImpHi';   ctx.MOB_DISPLAY.vvFireImp = 92;
      ctx.spr('vvSuccubusHi', MS, MS, drawSuccubus);ctx.MOB_HI.vvSuccubus = 'vvSuccubusHi'; ctx.MOB_DISPLAY.vvSuccubus = 109;
      ctx.spr('vvBruteHi', MS, MS, drawBrute);      ctx.MOB_HI.vvBrute = 'vvBruteHi';       ctx.MOB_DISPLAY.vvBrute = 130;
      ctx.spr('vvSkeletonHi', MS, MS, drawSkeleton);ctx.MOB_HI.vvSkeleton = 'vvSkeletonHi'; ctx.MOB_DISPLAY.vvSkeleton = 105;
      ctx.spr('vvGhostHi', MS, MS, drawGhost);      ctx.MOB_HI.vvGhost = 'vvGhostHi';       ctx.MOB_DISPLAY.vvGhost = 101;
      ctx.spr('vvGaolerHi', MS, MS, drawGaoler);    ctx.MOB_HI.vvGaoler = 'vvGaolerHi';     ctx.MOB_DISPLAY.vvGaoler = 113;
      ctx.spr('vvTormentorHi', MS, MS, drawTormentor); ctx.MOB_HI.vvTormentor = 'vvTormentorHi'; ctx.MOB_DISPLAY.vvTormentor = 109;
      // ---- HOLY mobs (9) ----
      ctx.spr('vvCherubHi', MS, MS, drawCherub);    ctx.MOB_HI.vvCherub = 'vvCherubHi';     ctx.MOB_DISPLAY.vvCherub = 84;
      ctx.spr('vvAngelHi', MS, MS, drawAngel);      ctx.MOB_HI.vvAngel = 'vvAngelHi';       ctx.MOB_DISPLAY.vvAngel = 109;
      ctx.spr('vvSeraphHi', MS, MS, drawSeraph);    ctx.MOB_HI.vvSeraph = 'vvSeraphHi';     ctx.MOB_DISPLAY.vvSeraph = 113;
      ctx.spr('vvValkyrieHi', MS, MS, drawValkyrie);ctx.MOB_HI.vvValkyrie = 'vvValkyrieHi'; ctx.MOB_DISPLAY.vvValkyrie = 105;
      ctx.spr('vvAcolyteHi', MS, MS, drawAcolyte);  ctx.MOB_HI.vvAcolyte = 'vvAcolyteHi';   ctx.MOB_DISPLAY.vvAcolyte = 101;
      ctx.spr('vvStatueHi', MS, MS, drawGuardian);  ctx.MOB_HI.vvStatue = 'vvStatueHi';     ctx.MOB_DISPLAY.vvStatue = 113;
      ctx.spr('vvSirenHi', MS, MS, drawSiren);      ctx.MOB_HI.vvSiren = 'vvSirenHi';       ctx.MOB_DISPLAY.vvSiren = 109;
      ctx.spr('vvHeraldHi', MS, MS, drawHerald);    ctx.MOB_HI.vvHerald = 'vvHeraldHi';     ctx.MOB_DISPLAY.vvHerald = 105;
      ctx.spr('vvArchonHi', MS, MS, drawArchon);    ctx.MOB_HI.vvArchon = 'vvArchonHi';     ctx.MOB_DISPLAY.vvArchon = 126;
      // ---- DOUBLE BOSS ----
      ctx.spr('vvSatanHi', 160, 160, function (put, W) { drawSatan(put, W); });
      ctx.spr('vvSatanVentHi', 160, 160, drawSatanVent);
      ctx.BOSS_HI.satan = { key: 'vvSatanHi', size: 160, display: 132, bodyW: 44, bodyH: 92 };
      ctx.spr('vvSupremeHi', 200, 200, function (put, W) { drawSupreme(put, W, 'open'); });
      ctx.spr('vvSupremeShutHi', 200, 200, function (put, W) { drawSupreme(put, W, 'closed'); });
      ctx.BOSS_HI.supremeBeing = { key: 'vvSupremeHi', size: 200, display: 150, bodyW: 40, bodyH: 120 };
      // ---- tiles (7 ground + river anim frames + bridge) ----
      ctx.tex('vvtBrimstone', 48, 48, tBrimstone);
      ctx.tex('vvtAsh', 48, 48, tAsh);
      ctx.tex('vvtObsidian', 48, 48, tObsidian);
      ctx.tex('vvtBoneLitter', 48, 48, tBoneLitter);
      ctx.tex('vvtMarble', 48, 48, tMarble);
      ctx.tex('vvtGoldPath', 48, 48, tGoldPath);
      ctx.tex('vvtCloud', 48, 48, tCloud);
      ctx.tex('vvtRiver0', 48, 48, riverFrame(0));
      ctx.tex('vvtRiver1', 48, 48, riverFrame(1));
      ctx.tex('vvtRiver2', 48, 48, riverFrame(2));
      ctx.tex('vvtRiver3', 48, 48, riverFrame(3));
      ctx.tex('vvtBridge', 48, 48, tBridge);
      // ---- decor: hell ----
      ctx.spr('vvdBonePile', 64, 64, dBonePile);
      ctx.spr('vvdSpire', 64, 64, dSpire);
      ctx.spr('vvdGeyser', 64, 64, dGeyser);
      ctx.spr('vvdThrone', 80, 80, dThrone);
      ctx.spr('vvdGraves', 64, 64, dGraves);
      ctx.spr('vvdBrazier', 64, 64, dBrazier);
      ctx.spr('vvdHellBanner', 64, 64, dHellBanner);
      ctx.spr('vvdMagma', 64, 64, dMagma);
      ctx.spr('vvdBoneFence0', 64, 64, boneFence(0));
      ctx.spr('vvdBoneFence1', 64, 64, boneFence(1));
      ctx.spr('vvdBoneFence2', 64, 64, boneFence(2));
      // ---- decor: holy ----
      ctx.spr('vvdColumn', 64, 64, dColumn);
      ctx.spr('vvdFountain', 64, 64, dFountain);
      ctx.spr('vvdAltar', 64, 64, dAltar);
      ctx.spr('vvdGate', 80, 80, dGate);
      ctx.spr('vvdStatue', 64, 64, dStatue);
      ctx.spr('vvdHolyBanner', 64, 64, dHolyBanner);
      ctx.spr('vvdGoldFence0', 64, 64, goldFence(0));
      ctx.spr('vvdGoldFence1', 64, 64, goldFence(1));
      ctx.spr('vvdGoldFence2', 64, 64, goldFence(2));
      // ---- set pieces + portal ----
      ctx.spr('vvdObelisk', 64, 64, dObelisk);
      ctx.spr('vvdSoulGeyser', 64, 64, dSoulGeyser);
      ctx.spr('vvdTitanSword', 64, 64, dTitanSword);
      ctx.spr('vvdLantern', 64, 64, dLantern);
      ctx.spr('vvPortal', 64, 64, drawPortal);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = VV_ART;
  root.VICEVERSA_ART = VV_ART;
})(typeof window !== 'undefined' ? window : this);
