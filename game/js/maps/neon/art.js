// ============================================================================
// game/js/maps/neon/art.js — NEON CITY (realm 17) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 3 4 5 9 10 14 18 19,
// the SOCIAL ENGINEER (render_neon_hacker.js hacker() w/ FINAL #6 FIREWALL
// params — orange spikes, tech vest, amber goggles w/ BLOODSHOT-EYE lenses,
// cyberdeck, LED sneakers, head ON the shoulders NO NECK), a VENT frame, the
// firewall-drone sprite, the KINGPIN APACHE (heli160) as flyer + WRECK, the
// pop-up AD wall (4 glitch-decay states), 20 decor (fire escape railings =
// break states), 8 tiles (take-2: 1 2 3 5 7 8 9 10). Rain-on-neon mood:
// everything dark, wet, glowing.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- neon palette (neon_kit.js N, verbatim — all 6-digit) -----------------
  var N = {
    OUT: '#0a0812',
    night: '#141224', nightLt: '#262242', nightDk: '#0a0814',
    concrete: '#3a3a4e', concreteLt: '#5a5a72', concreteDk: '#22222e',
    pink: '#ff2e88', pinkLt: '#ff9ac8', pinkDk: '#8a1048',
    cyan: '#22d6ee', cyanLt: '#aefaff', cyanDk: '#0e7a8a',
    green: '#39ff6a', greenLt: '#b0ffc8', greenDk: '#128a34',
    purple: '#9a4aff', purpleLt: '#d0aaff', purpleDk: '#4a1a8a',
    amber: '#ffb02e', amberLt: '#ffe0a0', amberDk: '#8a5a10',
    redN: '#ff3a4a', redNLt: '#ff9aa0', redNDk: '#8a1020',
    chrome: '#c8d0dc', chromeLt: '#f0f6fc', chromeDk: '#6a7284',
    gun: '#3a4050', gunDk: '#1e222e',
    leather: '#2e2a36', leatherLt: '#4a4458', leatherDk: '#1a1622',
    denim: '#2e3a5a', rust: '#7a4a2e',
    skin: '#d8a878', skinDk: '#a87850', skin2: '#8a5a38',
    hairP: '#ff2e88', hairC: '#22d6ee', hairG: '#39ff6a',
    white: '#f0f6fc', oil: '#06040a'
  };

  // ---- shared helpers (factory_kit lineage + neon_kit) ----------------------
  function plate(put, x0, y0, x1, y1, base, hi, dk) {
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (var y = y0; y < y1; y++) {
      var vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
      (function (vt2) {
        row(put, y, x0, x1, function (tx) {
          var b = mix(hi, base, clamp(vt2 * 1.15, 0, 1));
          b = mix(b, dk, clamp((vt2 - 0.55) * 1.25, 0, 1));
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
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, function () { return N.oil; }); }
  // neon glow line (bright core + haze)
  function glow(put, x0, y0, x1, y1, w, c, cLt) {
    stroke(put, x0, y0, x1, y1, w * 2.2, function () { return mix(c, N.night, 0.62); });
    stroke(put, x0, y0, x1, y1, w, function () { return c; });
    stroke(put, x0, y0, x1, y1, Math.max(0.8, w * 0.4), function () { return (cLt || N.white); });
  }
  // visor bar (glowing eye strip)
  function visor(put, cx, cy, w, c, cLt) {
    row(put, Math.round(cy), cx - w, cx + w, function () { return c; });
    row(put, Math.round(cy - 1), cx - w * 0.8, cx + w * 0.8, function () { return (cLt || N.white); });
    put(Math.round(cx - w - 1), Math.round(cy), mix(c, N.night, 0.5));
    put(Math.round(cx + w + 1), Math.round(cy), mix(c, N.night, 0.5));
  }
  // rain streaks in a cell
  function rain(put, S, n, seed) {
    for (var i = 0; i < n; i++) {
      var x = ((i * 379 + (seed || 0) * 97) % 1000) / 1000 * S, y = ((i * 613) % 1000) / 1000 * S * 0.8;
      stroke(put, x, y, x - S * 0.012, y + S * 0.05, 0.8, function () { return mix(N.cyanLt, N.night, 0.7); });
    }
  }
  // glitch offset chunks (horizontal displacement bands)
  function glitchBar(put, cx, y, w, c1, c2) {
    row(put, Math.round(y), cx - w, cx + w * 0.4, function () { return c1; });
    row(put, Math.round(y + 1), cx - w * 0.4, cx + w, function () { return c2; });
  }

  // humanoid mob base
  function body(put, S, cx, o) {
    o = o || {};
    var jacket = o.jacket || [N.leather, N.leatherLt, N.leatherDk];
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.04, S * 0.6, cx + s * S * 0.05, S * 0.82, S * 0.03, function () { return o.pants || N.denim; });
      plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.82, cx + s * S * 0.05 + S * 0.035, S * 0.86, N.gunDk, N.gun, N.oil);
    });
    for (var y = S * 0.42; y < S * 0.62; y++) {
      var t = (y - S * 0.42) / (S * 0.2), w = S * (0.08 + t * 0.015) * (o.wide || 1);
      (function (t2) {
        row(put, Math.round(y), cx - w, cx + w, function (tx) {
          var b = mix(jacket[1], jacket[0], clamp(tx * 1.3, 0, 1));
          if (tx > 0.72) b = mix(b, jacket[2], 0.6);
          if (o.shirt && Math.abs(tx - 0.5) < 0.09 && t2 < 0.55) b = mix(b, o.shirt, 0.85);
          return b;
        });
      })(t);
    }
  }
  function head(put, S, cx, cy, skin) {
    ell(put, cx, cy, S * 0.05, S * 0.055, function (tx, ty) { return mix(skin || N.skin, N.skinDk, clamp(tx + ty * 0.3, 0, 1)); });
  }

  // ======================= MOBS (#1 3 4 5 9 10 14 18 19) =====================
  // 1 · STREET PUNK — chain swinger swarm
  function drawPunk(put, S) {
    var cx = S * 0.5; rain(put, S, 5, 1); shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { jacket: [N.leather, N.leatherLt, N.leatherDk], shirt: N.pink });
    head(put, S, cx, S * 0.36);
    for (var i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.012, S * 0.32, cx + i * S * 0.014, S * 0.25 - Math.abs(i) * 2, 1.6, function () { return N.pink; });
    optic(put, cx - S * 0.02, S * 0.35, S * 0.009, N.oil, N.oil, '#ffffff');
    optic(put, cx + S * 0.02, S * 0.35, S * 0.009, N.oil, N.oil, '#ffffff');
    stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.15, S * 0.4, S * 0.02, function () { return N.leather; });
    for (var a = 0; a < 5; a += 0.5) put(Math.round(cx + S * 0.16 + Math.cos(a) * S * 0.06), Math.round(S * 0.38 + Math.sin(a) * S * 0.06), a % 1 < 0.5 ? N.chrome : N.chromeDk);
    put(Math.round(cx + S * 0.22), Math.round(S * 0.34), N.chromeLt);
  }
  // 3 · SPY DRONE — hovering aimed laser
  function drawDrone(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 3);
    [[-0.1], [0.1]].forEach(function (a) { var dx = a[0]; ell(put, cx + dx * S, S * 0.36, S * 0.05, S * 0.008, function (tx) { return mix(N.chromeDk, N.night, tx); }); stroke(put, cx + dx * S, S * 0.37, cx + dx * S, S * 0.4, 1.4, function () { return N.gun; }); });
    dome(put, cx, S * 0.45, S * 0.07, S * 0.055, N.gun, N.chrome, N.gunDk);
    optic(put, cx, S * 0.46, S * 0.016, N.oil, N.redN, N.redNLt);
    for (var t = 0; t < 1; t += 0.08) put(Math.round(cx - S * 0.02 - t * S * 0.24), Math.round(S * 0.5 + t * S * 0.18), t % 0.16 < 0.08 ? N.redN : N.redNDk);
    [[-0.05], [0.05]].forEach(function (a) { var dx = a[0]; stroke(put, cx + dx * S, S * 0.5, cx + dx * S * 1.6, S * 0.56, 1.2, function () { return N.gunDk; }); });
  }
  // 4 · RIOT ENFORCER — corp cop shield wall
  function drawEnforcer(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 4); shadow(put, S, cx, S * 0.24);
    body(put, S, cx, { jacket: [N.gun, N.chrome, N.gunDk], wide: 1.1, pants: N.gunDk });
    head(put, S, cx, S * 0.35);
    dome(put, cx, S * 0.34, S * 0.055, S * 0.06, N.gun, N.chrome, N.gunDk);
    visor(put, cx, S * 0.34, S * 0.04, N.amber, N.amberLt);
    for (var y = S * 0.4; y < S * 0.72; y++) row(put, Math.round(y), cx - S * 0.2, cx - S * 0.06, function (tx) { return mix(mix(N.cyan, N.night, 0.75), N.night, clamp(tx + 0.2, 0, 1)); });
    glow(put, cx - S * 0.2, S * 0.4, cx - S * 0.2, S * 0.72, 1, N.cyan);
    glow(put, cx - S * 0.2, S * 0.4, cx - S * 0.06, S * 0.4, 1, N.cyan);
    stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.17, S * 0.38, S * 0.016, function () { return N.gun; });
    glow(put, cx + S * 0.17, S * 0.38, cx + S * 0.22, S * 0.33, 1.2, N.amber);
  }
  // 5 · NETRUNNER — glitch-zone caster
  function drawNetrunner(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 5); shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { jacket: [N.purpleDk, N.purple, '#2a0a4a'], shirt: N.green });
    head(put, S, cx, S * 0.36, N.skin2);
    visor(put, cx, S * 0.35, S * 0.035, N.green, N.greenLt);
    for (var i = -2; i <= 2; i++) { stroke(put, cx + i * S * 0.015, S * 0.31, cx + i * S * 0.03, S * 0.24, 1.4, (function (i2) { return function () { return (i2 % 2 ? N.purple : N.gunDk); }; })(i)); put(Math.round(cx + i * S * 0.03), Math.round(S * 0.235), N.green); }
    stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.16, S * 0.38, S * 0.02, function () { return N.purpleDk; });
    plate(put, cx - S * 0.2, S * 0.35, cx - S * 0.12, S * 0.4, N.gun, N.chrome, N.gunDk);
    glitchBar(put, cx - S * 0.24, S * 0.3, S * 0.03, N.green, N.pink);
    glitchBar(put, cx - S * 0.28, S * 0.24, S * 0.024, N.cyan, N.green);
    glitchBar(put, cx - S * 0.2, S * 0.2, S * 0.02, N.pink, N.cyan);
  }
  // 9 · TURRET POD — anchored laser lanes
  function drawTurret(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 9); shadow(put, S, cx, S * 0.24);
    [[-0.1], [0.1], [0]].forEach(function (a) { var dx = a[0]; stroke(put, cx, S * 0.6, cx + dx * S, S * 0.76, 2.2, function () { return N.gunDk; }); });
    dome(put, cx, S * 0.52, S * 0.08, S * 0.07, N.gun, N.chrome, N.gunDk);
    [[-0.02], [0.02]].forEach(function (a) { var dy = a[0]; stroke(put, cx + S * 0.04, S * (0.52 + dy), cx + S * 0.2, S * (0.5 + dy), 1.8, function () { return N.gunDk; }); });
    optic(put, cx - S * 0.02, S * 0.5, S * 0.013, N.oil, N.redN, N.redNLt);
    for (var t = 0; t < 1; t += 0.06) put(Math.round(cx + S * (0.21 + t * 0.16)), Math.round(S * (0.5 - t * 0.03)), t % 0.12 < 0.06 ? N.redN : N.redNDk);
    glow(put, cx - S * 0.06, S * 0.585, cx + S * 0.06, S * 0.585, 0.9, N.cyan);
  }
  // 10 · CYBER RATS — glowing sewer swarm
  function drawRats(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 10); shadow(put, S, cx, S * 0.26);
    [[0, 0.62, 1], [-0.15, 0.55, 0.85], [0.14, 0.5, 0.75]].forEach(function (a) {
      var dx = a[0], dy = a[1], sc = a[2];
      var rx = cx + dx * S, ry = S * dy;
      ell(put, rx, ry, S * 0.06 * sc, S * 0.035 * sc, function (tx, ty) { return mix('#4a4456', '#26222e', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
      ell(put, rx - S * 0.055 * sc, ry - S * 0.008, S * 0.025 * sc, S * 0.02 * sc, function (tx) { return mix('#4a4456', '#26222e', tx); });
      put(Math.round(rx - S * 0.07 * sc), Math.round(ry - S * 0.012), N.greenLt);
      for (var t = 0; t < 1; t += 0.12) put(Math.round(rx + S * (0.06 + t * 0.08) * sc), Math.round(ry - t * S * 0.02 + Math.sin(t * 8) * 2), N.green);
      put(Math.round(rx), Math.round(ry - S * 0.03 * sc), N.chrome);
    });
  }
  // 14 · CARGO LIFTER — elite drone, drops goons
  function drawLifter(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 14);
    function hazardStripes(put2, x0, y0, x1, y1) { for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) put2(Math.round(x), Math.round(y), (Math.floor((x + y) / 3) % 2 === 0) ? N.amber : N.gunDk); }
    [[-0.14, 0.3], [0.14, 0.3], [-0.14, 0.34], [0.14, 0.34]].forEach(function (a, i) { var dx = a[0], dy = a[1]; if (i < 2) { ell(put, cx + dx * S, S * dy, S * 0.055, S * 0.008, function (tx) { return mix(N.chromeDk, N.night, tx); }); stroke(put, cx + dx * S, S * (dy + 0.01), cx + dx * S * 0.5, S * 0.38, 1.4, function () { return N.gun; }); } });
    plate(put, cx - S * 0.1, S * 0.38, cx + S * 0.1, S * 0.5, N.amberDk, N.amber, N.gunDk);
    hazardStripes(put, cx - S * 0.1, S * 0.47, cx + S * 0.1, S * 0.5);
    optic(put, cx, S * 0.42, S * 0.012, N.oil, N.redN, N.redNLt);
    stroke(put, cx, S * 0.5, cx, S * 0.6, 1, function () { return N.chromeDk; });
    plate(put, cx - S * 0.06, S * 0.6, cx + S * 0.06, S * 0.7, N.concrete, N.concreteLt, N.concreteDk);
    ell(put, cx, S * 0.65, S * 0.02, S * 0.025, function () { return N.oil; });
    for (var a2 = 0; a2 < 6.28; a2 += 0.4) put(Math.round(cx + Math.cos(a2) * S * 0.09), Math.round(S * 0.8 + Math.sin(a2) * S * 0.025), a2 % 0.8 < 0.4 ? N.redN : N.redNDk);
  }
  // 18 · NEON VIPER — light-trail striker
  function drawViper(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 18);
    for (var t = 0; t < 1; t += 0.02) {
      var px = cx - S * 0.2 + t * S * 0.42, py = S * 0.55 + Math.sin(t * 6.2) * S * 0.08 * (1 - t * 0.2);
      var w = S * (0.012 + Math.sin(Math.min(t * 3, 1) * Math.PI * 0.5) * 0.014);
      ell(put, px, py, w * 2.4, w * 2.4, function () { return mix(N.green, N.night, 0.72); });
      ell(put, px, py, w, w, function () { return N.green; });
      if ((t * 30 | 0) % 4 === 0) put(Math.round(px), Math.round(py), N.greenLt);
    }
    ell(put, cx - S * 0.21, S * 0.53, S * 0.03, S * 0.024, function (tx, ty) { return mix(N.greenLt, N.green, ty); });
    put(Math.round(cx - S * 0.23), Math.round(S * 0.525), N.oil);
    stroke(put, cx - S * 0.24, S * 0.54, cx - S * 0.28, S * 0.55, 0.9, function () { return N.pinkLt; });
    [[0.24, 0.5], [0.27, 0.56]].forEach(function (a) { var dx = a[0], dy = a[1]; stroke(put, cx + dx * S, S * dy, cx + (dx + 0.05) * S, S * dy, 1, function () { return mix(N.green, N.night, 0.5); }); });
  }
  // 19 · EXO LOADER — elite mech suit
  function drawLoader(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 19); shadow(put, S, cx, S * 0.3);
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.07, S * 0.6, cx + s * S * 0.09, S * 0.8, S * 0.045, function () { return N.amberDk; });
      plate(put, cx + s * S * 0.09 - S * 0.05, S * 0.8, cx + s * S * 0.09 + S * 0.05, S * 0.87, N.gun, N.chrome, N.gunDk);
    });
    plate(put, cx - S * 0.11, S * 0.4, cx + S * 0.11, S * 0.6, N.amber, N.amberLt, N.amberDk);
    for (var y = S * 0.42; y < S * 0.5; y++) row(put, Math.round(y), cx - S * 0.04, cx + S * 0.04, function (tx) { return mix(N.nightDk, N.night, tx); });
    ell(put, cx, S * 0.455, S * 0.02, S * 0.02, function (tx, ty) { return mix(N.skin, N.skinDk, ty); });
    [-1, 1].forEach(function (s) {
      stroke(put, cx + s * S * 0.12, S * 0.44, cx + s * S * 0.22, S * 0.56, S * 0.04, function () { return N.amberDk; });
      plate(put, cx + s * S * 0.22 - S * 0.045, S * 0.54, cx + s * S * 0.22 + S * 0.045, S * 0.64, N.gun, N.chrome, N.gunDk);
      [[-1], [1]].forEach(function (f) { stroke(put, cx + s * S * 0.22 + f[0] * S * 0.02, S * 0.64, cx + s * S * 0.22 + f[0] * S * 0.03, S * 0.68, 2, function () { return N.gunDk; }); });
    });
    glow(put, cx, S * 0.38, cx, S * 0.38, 1.6, N.redN);
  }

  // ================== FIREWALL DRONE (small quad, hex tint) ==================
  function drawFirewallDrone(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    ell(put, cx, cy, S * 0.16, S * 0.1, function (tx, ty) { return mix('#4a5264', '#161a22', clamp(tx * 0.5 + ty * 0.8, 0, 1)); });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (a) {
      var ox = a[0] * S * 0.18, oy = a[1] * S * 0.1;
      row(put, Math.round(cy + oy), cx + ox - S * 0.09, cx + ox + S * 0.09, function () { return mix('#828a9a', N.night, 0.5); });
      put(Math.round(cx + ox), Math.round(cy + oy), '#20242e');
    });
    optic(put, cx, cy, S * 0.05, N.oil, N.amber, N.amberLt);
    // hex shield facets
    for (var k = 0; k < 6; k++) { var a2 = k * Math.PI / 3; put(Math.round(cx + Math.cos(a2) * S * 0.3), Math.round(cy + Math.sin(a2) * S * 0.22), N.amberLt); }
    glow(put, cx, cy + S * 0.18, cx, cy + S * 0.18, 1, N.amber, N.amberLt);
  }

  // ==================== THE SOCIAL ENGINEER (hacker) =========================
  // render_neon_hacker.js hacker(), FINAL #6 FIREWALL params inlined via P.
  function hacker(put, S, p) {
    p = p || {};
    var u = S / 160, X = function (v) { return v * u; };
    var skin = p.skin || N.skin;
    var skinDk = mix(skin, '#000000', 0.3);
    var jak = p.jak || '#2e2a48';
    var jakLt = p.jakLt || mix(jak, '#ffffff', 0.28);
    var jakDk = p.jakDk || mix(jak, '#000000', 0.42);
    var pants = p.pants || '#23283a';
    var acc = p.acc || N.cyan, accLt = p.accLt || N.cyanLt;
    var led = p.shoeLED || acc;

    shadow(put, X(80), X(140), X(26), X(5));

    // ---- LEGS + LED SNEAKERS
    [[72, -1], [88, 1]].forEach(function (a) {
      var lx = a[0], sd = a[1];
      for (var y = 100; y <= 128; y++) {
        var t = (y - 100) / 28, w = 5.2 - t * 1.2;
        (function (t2) { row(put, Math.round(X(y)), X(lx - w + sd * t2 * 1.5), X(lx + w + sd * t2 * 1.5), function (tx) { return mix(mix(pants, '#ffffff', 0.16), mix(pants, '#000000', 0.4), clamp(tx * 1.3 + t2 * 0.3, 0, 1)); }); })(t);
      }
      var sx = lx + sd * 1.5;
      ell(put, X(sx + sd * 2), X(133), X(8), X(4.4), function (tx, ty) { return mix('#e8ecf4', '#8a92a2', clamp(ty * 1.5 - 0.2, 0, 1)); });
      row(put, Math.round(X(136.5)), X(sx - 6 + sd * 2), X(sx + 6 + sd * 2), function () { return '#20242e'; });
      glow(put, X(sx - 5 + sd * 2), X(135.4), X(sx + 5 + sd * 2), X(135.4), 0.9, led, mix(led, '#ffffff', 0.5));
      put(Math.round(X(sx - sd * 2)), Math.round(X(131)), '#20242e');
    });

    // ---- TORSO (oversized jacket)
    for (var y2 = 62; y2 <= 102; y2++) {
      var t3 = (y2 - 62) / 40, w2 = 12 + Math.sin(t3 * 3.14) * 3.4;
      (function (t4) { row(put, Math.round(X(y2)), X(80 - w2), X(80 + w2), function (tx) { return mix(jakLt, jakDk, clamp(tx * 1.35 + t4 * 0.2, 0, 1)); }); })(t3);
    }
    stroke(put, X(80), X(64), X(80), X(100), X(1), function () { return jakDk; });
    put(Math.round(X(80)), Math.round(X(98)), acc);
    row(put, Math.round(X(63)), X(72), X(88), function () { return jakDk; });
    if (p.vest) {
      plate(put, X(70), X(66), X(90), X(88), '#20242e', '#3a4050', '#0c0e14');
      [[74, 72], [86, 72], [74, 82], [86, 82]].forEach(function (a) { var vx = a[0], vy = a[1]; plate(put, X(vx - 3), X(vy - 2.6), X(vx + 3), X(vy + 2.6), '#2c3242', '#495064', '#10141c'); });
      put(Math.round(X(80)), Math.round(X(69)), acc);
    }
    glow(put, X(72), X(90), X(88), X(90), 0.8, acc, accLt);
    [[-1, 64], [1, 96]].forEach(function (a) {
      var sd = a[0], x0 = 80 + sd * 13;
      stroke(put, X(x0), X(68), X(x0 + sd * 5), X(92), X(4.6), function () { return mix(jak, jakDk, 0.25); });
      stroke(put, X(x0 + sd * 1), X(70), X(x0 + sd * 5), X(86), X(1.6), function () { return jakLt; });
      ell(put, X(x0 + sd * 5.5), X(95), X(3), X(3), function (tx, ty) { return mix(skin, skinDk, ty); });
    });

    // ---- DEVICE: cyberdeck held in front, both hands
    if (p.device === 'deck') {
      plate(put, X(66), X(92), X(94), X(102), '#20242e', '#3c4454', '#0a0c12');
      for (var gy = 94; gy <= 99; gy += 2.4) row(put, Math.round(X(gy)), X(69), X(91), function (tx) { return (((tx * 9) | 0) % 2) ? mix(acc, '#20242e', 0.35) : '#181c26'; });
      glow(put, X(68), X(93), X(92), X(93), 0.7, acc, accLt);
      ell(put, X(64), X(97), X(3), X(3), function (tx, ty) { return mix(skin, skinDk, ty); });
      ell(put, X(96), X(97), X(3), X(3), function (tx, ty) { return mix(skin, skinDk, ty); });
      if (p.smoking) {  // VENT frame: deck overheats, wisps of smoke
        [[80, 88, '#6a6e78'], [83, 80, '#565a64'], [78, 74, '#464a54'], [85, 66, '#3a3e48']].forEach(function (a) { ell(put, X(a[0]), X(a[1]), X(3.4), X(4), function (tx, ty) { return mix(a[2], N.night, clamp(tx * 0.3 + ty * 0.5, 0, 0.85)); }); });
        put(Math.round(X(74)), Math.round(X(96)), N.amberLt); put(Math.round(X(88)), Math.round(X(96)), N.redNLt);
      }
    }

    // ---- HEAD GROUP — sits ON the shoulders (NO NECK); put shifted down.
    var headGroup = function (put) {
      ell(put, X(80), X(44), X(15), X(15.5), function (tx, ty) { return mix(skin, skinDk, clamp(tx * 0.9 + ty * 0.55 - 0.25, 0, 1)); });
      if (!p.phones) { ell(put, X(65), X(46), X(2), X(3), function () { return skinDk; }); ell(put, X(95), X(46), X(2), X(3), function () { return skinDk; }); }
      stroke(put, X(74), X(53.5), X(82), X(54.5), X(0.9), function () { return mix(skinDk, '#000000', 0.4); });
      put(Math.round(X(83)), Math.round(X(53.5)), mix(skinDk, '#000000', 0.4));
      put(Math.round(X(76)), Math.round(X(55.5)), '#ffffff');
      // orange spike hair
      var hairC = p.hairC || N.hairC;
      ell(put, X(80), X(35), X(15), X(8), function (tx, ty) { return mix(mix(hairC, '#ffffff', 0.2), mix(hairC, '#000000', 0.5), clamp(tx + ty * 0.4, 0, 1)); });
      [[68, 26, 64, 18], [76, 23, 75, 13], [85, 23, 88, 14], [93, 27, 99, 20]].forEach(function (a) { stroke(put, X(a[0]), X(a[1] + 6), X(a[2]), X(a[3]), X(2.6), function () { return mix(hairC, '#000000', 0.22); }); });
      // AR goggles w/ BLOODSHOT-EYE lenses
      var eyeC = p.eyeC || acc;
      row(put, Math.round(X(43)), X(64), X(96), function () { return '#20242e'; });
      [[73], [88]].forEach(function (a) {
        var gx = a[0];
        ell(put, X(gx), X(45), X(5.4), X(5), function (tx, ty) { return mix('#2a3040', '#10141c', clamp(tx + ty * 0.4, 0, 1)); });
        ell(put, X(gx), X(45), X(3.8), X(3.5), function (tx, ty) { return mix('#f2ece2', '#cab8a6', clamp(tx * 0.7 + ty * 0.7 - 0.3, 0, 1)); });
        stroke(put, X(gx - 3.2), X(43.2), X(gx - 1.4), X(44.4), X(0.7), function () { return '#c8342e'; });
        stroke(put, X(gx + 3.2), X(43.6), X(gx + 1.5), X(44.8), X(0.7), function () { return '#c8342e'; });
        stroke(put, X(gx - 3), X(46.8), X(gx - 1.2), X(45.7), X(0.7), function () { return '#d84a40'; });
        stroke(put, X(gx + 2.8), X(47), X(gx + 1.3), X(45.8), X(0.7), function () { return '#c8342e'; });
        ell(put, X(gx), X(45), X(1.6), X(1.6), function () { return eyeC; });
        put(Math.round(X(gx)), Math.round(X(45)), '#0a0806');
      });
      row(put, Math.round(X(45)), X(78), X(83), function () { return '#20242e'; });
    };
    var HDY = Math.round(X(7));
    headGroup(function (x, y, c) { put(x, y + HDY, c); });

    rain(put, S, 6, (p.seed || 0));
  }
  var BOSS_P = { hairStyle: 'spike', hairC: '#e84a20', vest: true, eyes: 'goggles', eyeC: N.amber, device: 'deck', acc: N.amber, accLt: N.amberLt, jak: '#2e3a2a', jakLt: '#4e5e48', jakDk: '#1a2418', seed: 6 };
  function drawBoss(put, S) { hacker(put, S, BOSS_P); }
  function drawBossVent(put, S) {
    var vp = {}; for (var k in BOSS_P) vp[k] = BOSS_P[k];
    vp.smoking = true; vp.phones = false;
    hacker(put, S, vp);
  }

  // ================= KINGPIN APACHE (heli160) — flyer + WRECK ================
  function pw(x, pts) {
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      if (x >= p0[0] && x <= p1[0]) return p0[1] + (p1[1] - p0[1]) * (x - p0[0]) / Math.max(1, p1[0] - p0[0]);
    }
    return null;
  }
  function heli160(put, S, o) {
    o = o || {};
    var hull = o.hull || '#4a5442', hullLt = o.hullLt || '#6e7a5e', hullDk = o.hullDk || '#2a301f';
    var trim = o.trim || N.pink, trimLt = o.trimLt || N.pinkLt;
    var u = S / 160, X = function (v) { return v * u; };
    ell(put, X(76), X(15), X(10), X(4.2), function (tx, ty) { return mix(hullLt, hullDk, clamp(tx * 0.5 + ty * 0.9, 0, 1)); });
    stroke(put, X(76), X(19), X(76), X(28), X(2.4), function () { return hullDk; });
    row(put, Math.round(X(28)), X(12), X(146), function (tx) { return mix('#828a9a', N.night, 0.55 + Math.abs(tx - 0.5) * 0.4); });
    stroke(put, X(30), X(24), X(122), X(31), X(1.4), function () { return '#5a626e'; });
    stroke(put, X(122), X(25), X(30), X(32), X(1.4), function () { return '#495060'; });
    ell(put, X(76), X(28), X(4.4), X(2.2), function (tx, ty) { return mix(hullLt, hullDk, ty); });
    var TOP = [[14, 54], [22, 52], [30, 47], [50, 43], [52, 37], [74, 39], [76, 40], [98, 44], [100, 50], [136, 47], [150, 46]];
    var BOT = [[14, 64], [24, 68], [40, 70], [70, 70], [86, 66], [98, 58], [136, 54], [150, 52]];
    for (var x = 14; x <= 150; x++) {
      var top = pw(x, TOP), bot = pw(x, BOT);
      if (top == null || bot == null || bot <= top) continue;
      for (var y = top; y <= bot; y++) {
        var ty = (y - top) / Math.max(1, bot - top);
        var b = mix(hullLt, hull, clamp(ty * 1.6, 0, 1));
        b = mix(b, hullDk, clamp((ty - 0.5) * 1.6, 0, 1));
        put(Math.round(X(x)), Math.round(X(y)), b);
      }
    }
    for (var y3 = 30; y3 <= 47; y3++) { var t = (y3 - 30) / 17; row(put, Math.round(X(y3)), X(134 + t * 4), X(143 + t * 3), function (tx) { return mix(hullLt, hullDk, clamp(t * 0.8 + tx * 0.3, 0, 1)); }); }
    plate(put, X(126), X(50), X(148), X(53), hull, hullLt, hullDk);
    ell(put, X(15), X(58), X(5), X(6.5), function (tx, ty) { return mix('#39404c', '#161a20', clamp(tx * 0.7 + ty * 0.5, 0, 1)); });
    optic(put, X(14.5), X(55), X(1.7), '#0a0c10', N.cyan, N.cyanLt);
    optic(put, X(15), X(61), X(1.5), '#0a0c10', N.redN, N.redNLt);
    for (var xc = 31; xc <= 50; xc++) { var t0 = pw(xc, [[31, 47.5], [50, 44]]); for (var yc = t0; yc <= 56; yc++) put(Math.round(X(xc)), Math.round(X(yc)), mix('#7ab8d8', '#27455c', clamp((yc - t0) / (56 - t0) * 1.3, 0, 1))); }
    for (var xc2 = 53; xc2 <= 71; xc2++) { var t1 = pw(xc2, [[53, 38.5], [71, 40.5]]); for (var yc2 = t1; yc2 <= 54; yc2++) put(Math.round(X(xc2)), Math.round(X(yc2)), mix('#8ac4e2', '#2a4a62', clamp((yc2 - t1) / (54 - t1) * 1.3, 0, 1))); }
    ell(put, X(61.5), X(50), X(4.2), X(3.2), function () { return '#0a1018'; });
    ell(put, X(61.5), X(45.8), X(2.6), X(2.2), function () { return '#0a1018'; });
    row(put, Math.round(X(43.8)), X(58), X(65.5), function () { return '#0a1018'; });
    put(Math.round(X(65)), Math.round(X(46)), N.amber);
    plate(put, X(74), X(36), X(96), X(43), hullLt, mix(hullLt, '#ffffff', 0.18), hullDk);
    plate(put, X(56), X(58), X(90), X(62), hull, hullLt, hullDk);
    stroke(put, X(38), X(70), X(38), X(75), X(2.2), function () { return hullDk; });
    plate(put, X(34), X(75), X(44), X(78.5), '#2e343e', '#4a5460', '#12161c');
    glow(put, X(30), X(71.5), X(94), X(67), 1, trim, trimLt);
    put(Math.round(X(13)), Math.round(X(52)), N.redN);
    put(Math.round(X(149)), Math.round(X(45)), N.green);
    glow(put, X(76), X(12), X(76), X(12), 1, N.redN, N.redNLt);
    if (o.smoking) {
      [[100, 34, '#3a3a44'], [108, 24, '#32323c'], [116, 14, '#2a2a34']].forEach(function (a) { ell(put, X(a[0]), X(a[1]), X(5), X(5.5), function (tx, ty) { return mix(a[2], N.night, clamp(tx * 0.3 + ty * 0.5, 0, 0.85)); }); });
      put(Math.round(X(97)), Math.round(X(40)), N.amberLt);
    }
  }
  function drawHeli(put, S) { heli160(put, S, { smoking: true }); }
  // WRECK — nose-down slumped, fire glow, thrown blade (scene-plan crash site)
  function drawWreck(put, S) {
    var u = S / 160, X = function (v) { return v * u; };
    var hull = '#3a4234', hullLt = '#5a6450', hullDk = '#22281a';
    shadow(put, X(80), X(120), X(58), X(8));
    // tilted hull
    for (var x = 30; x <= 120; x++) {
      var top = 70 + (x - 30) * 0.28, bot = top + 20;
      for (var y = top; y <= bot; y++) {
        var b = mix(hullLt, hull, clamp((y - top) / 20 * 1.4, 0, 1));
        b = mix(b, hullDk, clamp(((y - top) / 20 - 0.5) * 1.4, 0, 1));
        put(Math.round(X(x)), Math.round(X(y)), b);
      }
    }
    // crumpled nose (low, left)
    ell(put, X(34), X(96), X(9), X(7), function (tx, ty) { return mix(hullDk, N.oil, clamp(tx * 0.6 + ty * 0.6, 0, 1)); });
    // bent-up boom + fin
    plate(put, X(116), X(58), X(150), X(66), hullDk, hull, N.oil);
    plate(put, X(146), X(48), X(154), X(60), hull, hullLt, hullDk);
    // canopy shattered
    for (var xc = 52; xc <= 80; xc++) for (var yc = 72; yc <= 84; yc++) if ((xc + yc) % 3) put(Math.round(X(xc)), Math.round(X(yc)), mix('#2a4a5c', N.oil, 0.4));
    // thrown rotor blade + snapped half
    stroke(put, X(20), X(52), X(70), X(40), X(2), function () { return '#5a626e'; });
    stroke(put, X(96), X(44), X(128), X(30), X(1.8), function () { return '#495060'; });
    // cabin FIRE glow + smoke plume
    ell(put, X(44), X(90), X(7), X(6), function (tx, ty) { return mix(N.amber, N.redN, clamp(ty, 0, 1)); });
    put(Math.round(X(42)), Math.round(X(88)), N.amberLt); put(Math.round(X(47)), Math.round(X(90)), N.redNLt);
    [[54, 66, '#3a3a44'], [62, 54, '#32323c'], [72, 42, '#2a2a34'], [82, 30, '#242430']].forEach(function (a) { ell(put, X(a[0]), X(a[1]), X(6), X(6.5), function (tx, ty) { return mix(a[2], N.night, clamp(tx * 0.3 + ty * 0.5, 0, 0.9)); }); });
    glow(put, X(30), X(98), X(110), X(90), 1, N.amber, N.amberLt);
  }

  // ==================== POP-UP AD WALL (4 glitch-decay states) ===============
  function drawAdWall(put, S, state) {
    var cx = S * 0.5;
    // holo panel facing the player
    plate(put, cx - S * 0.34, S * 0.12, cx + S * 0.34, S * 0.88, N.nightDk, N.nightLt, N.oil);
    glow(put, cx - S * 0.34, S * 0.12, cx + S * 0.34, S * 0.12, 1, N.pink);
    glow(put, cx - S * 0.34, S * 0.88, cx + S * 0.34, S * 0.88, 1, N.cyan);
    // AD content: smiley + BUY bars
    ell(put, cx - S * 0.1, S * 0.36, S * 0.08, S * 0.08, function (tx, ty) { return ((ty * 12 | 0) % 2 ? mix(N.amberLt, N.night, 0.3) : mix(N.amber, N.night, 0.4)); });
    put(Math.round(cx - S * 0.12), Math.round(S * 0.34), N.oil); put(Math.round(cx - S * 0.08), Math.round(S * 0.34), N.oil);
    for (var by = 0; by < 3; by++) row(put, Math.round(S * (0.56 + by * 0.08)), cx - S * 0.1, cx + S * (0.18 - by * 0.05), function () { return N.cyanLt; });
    // scanlines
    for (var y = S * 0.12; y < S * 0.88; y += 3) row(put, Math.round(y), cx - S * 0.34, cx + S * 0.34, function () { return mix(N.cyan, N.night, 0.82); });
    // deterioration by state (0 flicker · 1 glitch · 2 tear · 3 burst)
    if (state >= 1) { glitchBar(put, cx, S * 0.4, S * 0.3, N.green, N.pink); glitchBar(put, cx - S * 0.1, S * 0.62, S * 0.26, N.cyan, N.green); }
    if (state >= 2) { for (var yt = S * 0.2; yt < S * 0.8; yt += 7) row(put, Math.round(yt), cx - S * 0.34, cx - S * 0.06, function () { return N.oil; }); stroke(put, cx + S * 0.1, S * 0.2, cx - S * 0.1, S * 0.8, S * 0.02, function () { return N.oil; }); }
    if (state >= 3) { for (var i = 0; i < 40; i++) { var a = i * 2.3; put(Math.round(cx + Math.cos(a) * S * (0.1 + (i % 7) * 0.03)), Math.round(S * 0.5 + Math.sin(a) * S * (0.14 + (i % 5) * 0.04)), i % 3 ? N.pink : N.cyan); } }
  }

  // ============================== DECOR (20) =================================
  function drawBillboard(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 1); shadow(put, S, cx, S * 0.28);
    [[-0.14], [0.14]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.6, cx + a[0] * S, S * 0.82, 2.6, function () { return N.gunDk; }); });
    plate(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.6, N.nightDk, N.nightLt, N.oil);
    glow(put, cx - S * 0.2, S * 0.3, cx + S * 0.2, S * 0.3, 1, N.pink);
    glow(put, cx - S * 0.2, S * 0.6, cx + S * 0.2, S * 0.6, 1, N.cyan);
    ell(put, cx - S * 0.06, S * 0.44, S * 0.07, S * 0.08, function (tx, ty) { return ((ty * 12 | 0) % 2 ? mix(N.pinkLt, N.night, 0.4) : mix(N.pink, N.night, 0.5)); });
    [[0.06, 0.38], [0.06, 0.44], [0.06, 0.5]].forEach(function (a, i) { row(put, Math.round(S * a[1]), cx + a[0] * S, cx + (a[0] + 0.1 - i * 0.02) * S, function () { return [N.cyanLt, N.cyan, N.cyanDk][i]; }); });
    put(Math.round(cx - S * 0.085), Math.round(S * 0.42), N.white); put(Math.round(cx - S * 0.035), Math.round(S * 0.42), N.white);
  }
  function drawRamen(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 2); shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.06, S * 0.24, cx + S * 0.06, S * 0.76, N.nightDk, N.nightLt, N.oil);
    [[0.3, N.pink], [0.42, N.cyan], [0.54, N.amber], [0.66, N.pink]].forEach(function (a) { var y = a[0], c = a[1]; glow(put, cx - S * 0.03, S * y, cx + S * 0.03, S * y, 1, c); glow(put, cx, S * (y - 0.03), cx, S * (y + 0.03), 1, c); });
    ell(put, cx, S * 0.2, S * 0.035, S * 0.02, function (tx, ty) { return mix(N.amberLt, N.amber, ty); });
    plate(put, cx - S * 0.025, S * 0.52, cx + S * 0.025, S * 0.56, N.nightDk, N.night, N.oil);
  }
  function drawAC(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 3); shadow(put, S, cx, S * 0.28);
    [[-0.1, 0.62, 1], [0.09, 0.64, 0.9], [0, 0.5, 0.95]].forEach(function (a) {
      var dx = a[0], dy = a[1], sc = a[2];
      plate(put, cx + (dx - 0.09 * sc) * S, S * (dy - 0.06 * sc), cx + (dx + 0.09 * sc) * S, S * (dy + 0.06 * sc), N.concrete, N.concreteLt, N.concreteDk);
      ell(put, cx + dx * S, S * dy, S * 0.035 * sc, S * 0.035 * sc, function (tx, ty) { return ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) > 0.15 ? N.concreteDk : N.nightDk); });
      [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(function (f) { stroke(put, cx + dx * S, S * dy, cx + dx * S + f[0] * S * 0.028 * sc, S * dy + f[1] * S * 0.028 * sc, 1.2, function () { return N.gun; }); });
    });
  }
  function drawDish(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 4); shadow(put, S, cx, S * 0.24);
    stroke(put, cx, S * 0.55, cx, S * 0.8, 2.6, function () { return N.gunDk; });
    [[-0.08], [0.08]].forEach(function (a) { stroke(put, cx, S * 0.72, cx + a[0] * S, S * 0.82, 1.8, function () { return N.gunDk; }); });
    for (var t = 0; t < 1; t += 0.04) { var w = S * 0.14 * Math.sin(t * Math.PI); (function (t2, w2) { row(put, Math.round(S * (0.32 + t2 * 0.24)), cx - S * 0.05 - w2 * 0.6 + t2 * S * 0.1, cx - S * 0.05 + w2 + t2 * S * 0.1, function (tx) { return mix(N.chromeLt, N.chromeDk, clamp(tx * 1.2 + t2 * 0.2, 0, 1)); }); })(t, w); }
    stroke(put, cx - S * 0.02, S * 0.44, cx + S * 0.08, S * 0.38, 1.4, function () { return N.gun; });
    glow(put, cx + S * 0.09, S * 0.37, cx + S * 0.09, S * 0.37, 1.4, N.redN);
  }
  function drawTank(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 5); shadow(put, S, cx, S * 0.26);
    [[-0.12, -0.16], [0.12, 0.16], [-0.04, -0.06], [0.04, 0.06]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.56, cx + a[1] * S, S * 0.84, 2.2, function () { return N.rust; }); });
    for (var y = Math.round(S * 0.3); y < S * 0.56; y++) { row(put, y, cx - S * 0.15, cx + S * 0.15, function (tx) { var b = mix('#5a5044', '#38302a', clamp(tx * 1.25, 0, 1)); var px = tx * 30; if ((px | 0) % 6 === 0) b = mix(b, '#241e18', 0.5); return b; }); }
    [0.34, 0.5].forEach(function (y) { row(put, Math.round(S * y), cx - S * 0.15, cx + S * 0.15, function () { return N.oil; }); });
    for (var y2 = 0; y2 < S * 0.07; y2++) { var t = y2 / (S * 0.07), w = S * (0.16 - t * 0.12); row(put, Math.round(S * 0.23 + y2), cx - w, cx + w, function (tx) { return mix('#4a4238', '#2a241e', tx); }); }
    glow(put, cx - S * 0.08, S * 0.44, cx + S * 0.02, S * 0.4, 1, N.pink);
  }
  function drawAntenna(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 6); shadow(put, S, cx, S * 0.2);
    plate(put, cx - S * 0.1, S * 0.74, cx + S * 0.1, S * 0.82, N.concrete, N.concreteLt, N.concreteDk);
    [[-0.06, 0.3, N.redN], [0.02, 0.22, N.amber], [0.08, 0.4, N.redN]].forEach(function (a) {
      var dx = a[0], top = a[1], c = a[2];
      stroke(put, cx + dx * S, S * 0.75, cx + dx * S, S * top, 1.6, function () { return N.gun; });
      glow(put, cx + dx * S, S * (top - 0.015), cx + dx * S, S * (top - 0.015), 1.3, c);
    });
    stroke(put, cx + S * 0.02, S * 0.22, cx + S * 0.12, S * 0.74, 0.8, function () { return N.concreteDk; });
    stroke(put, cx + S * 0.02, S * 0.22, cx - S * 0.09, S * 0.74, 0.8, function () { return N.concreteDk; });
  }
  function drawVending(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 7); shadow(put, S, cx, S * 0.22);
    plate(put, cx - S * 0.1, S * 0.36, cx + S * 0.1, S * 0.78, '#1a3a5a', '#2e5a8a', N.oil);
    glow(put, cx - S * 0.1, S * 0.36, cx - S * 0.1, S * 0.78, 0.8, N.cyan);
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) { var bx = cx - S * 0.06 + c * S * 0.05, by = S * 0.42 + r * S * 0.08; plate(put, bx - S * 0.016, by - S * 0.025, bx + S * 0.016, by + S * 0.025, [N.pink, N.amber, N.green][((r + c) % 3)], N.white, N.nightDk); }
    plate(put, cx - S * 0.06, S * 0.7, cx + S * 0.06, S * 0.75, N.nightDk, N.night, N.oil);
    glow(put, cx - S * 0.08, S * 0.33, cx + S * 0.08, S * 0.33, 1, N.cyan);
  }
  function drawPower(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 8); shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.09, S * 0.46, cx + S * 0.09, S * 0.7, N.gun, N.chrome, N.gunDk);
    [0.5, 0.56, 0.62].forEach(function (y) { row(put, Math.round(S * y), cx - S * 0.07, cx + S * 0.07, function () { return N.gunDk; }); });
    [[-0.05], [0.05]].forEach(function (a) { for (var i = 0; i < 3; i++) ell(put, cx + a[0] * S, S * (0.42 - i * 0.03), S * 0.02, S * 0.012, function (tx, ty) { return mix('#8a7a5a', '#5a4e38', ty); }); });
    for (var i2 = 0; i2 < 3; i2++) { for (var t = 0; t < 1; t += 0.05) { put(Math.round(cx - S * 0.09 - t * S * 0.18), Math.round(S * (0.5 + i2 * 0.05) + Math.sin(t * 6 + i2) * 4 + t * 14), N.oil); put(Math.round(cx + S * 0.09 + t * S * 0.16), Math.round(S * (0.52 + i2 * 0.04) + Math.sin(t * 5 + i2) * 4 + t * 12), i2 === 1 ? N.rust : N.oil); } }
    plate(put, cx - S * 0.03, S * 0.53, cx + S * 0.03, S * 0.59, N.amber, N.amberLt, N.amberDk);
    put(Math.round(cx + S * 0.11), Math.round(S * 0.44), N.cyanLt);
  }
  function drawVent(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 9); shadow(put, S, cx, S * 0.24);
    [[-0.08, 0.5], [0.06, 0.44]].forEach(function (a) {
      var dx = a[0], top = a[1];
      for (var y = Math.round(S * top); y < S * 0.78; y++) row(put, y, cx + (dx - 0.045) * S, cx + (dx + 0.045) * S, function (tx) { var b = mix('#6a6a7a', '#3a3a46', clamp(tx * 1.2, 0, 1)); if ((y | 0) % 7 === 0) b = mix(b, '#26262e', 0.5); return b; });
      ell(put, cx + dx * S, S * top, S * 0.05, S * 0.018, function (tx) { return mix('#8a8a9a', '#4a4a56', tx); });
      for (var t = 0; t < 1; t += 0.2) ell(put, cx + dx * S + Math.sin(t * 5) * 4, S * (top - 0.04 - t * 0.12), S * (0.02 + t * 0.02), S * (0.015 + t * 0.015), function (tx) { return mix('#c8c8d4', N.night, clamp(t + tx * 0.3, 0, 0.9)); });
    });
  }
  function drawEscape(put, S) {   // FIRE ESCAPE — decor prop (railings state 0)
    var cx = S * 0.5; rain(put, S, 4, 10); shadow(put, S, cx, S * 0.2);
    [[0.32], [0.52], [0.72]].forEach(function (a, i) {
      var y = a[0];
      row(put, Math.round(S * y), cx - S * 0.14, cx + S * 0.14, function () { return N.rust; });
      row(put, Math.round(S * (y + 0.01)), cx - S * 0.14, cx + S * 0.14, function () { return '#4a2e1c'; });
      for (var x = -0.12; x <= 0.12; x += 0.04) stroke(put, cx + x * S, S * (y - 0.05), cx + x * S, S * y, 1, function () { return N.rust; });
      row(put, Math.round(S * (y - 0.05)), cx - S * 0.13, cx + S * 0.13, function () { return N.rust; });
      if (i < 2) for (var t = 0; t < 1; t += 0.12) put(Math.round(cx + (i % 2 ? -1 : 1) * (S * 0.12 - t * S * 0.24)), Math.round(S * (y + 0.02 + t * 0.16)), N.rust);
    });
    [[-0.14], [0.14]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.27, cx + a[0] * S, S * 0.78, 1.6, function () { return '#4a2e1c'; }); });
    [[-0.06, N.pink], [0, N.cyan]].forEach(function (a) { plate(put, cx + a[0] * S - S * 0.015, S * 0.42, cx + a[0] * S + S * 0.015, S * 0.47, mix(a[1], N.night, 0.5), mix(a[1], N.night, 0.3), N.nightDk); });
  }
  // FIRE ESCAPE railings as a destructible FENCE — 3 break states
  function drawRail(put, S, state) {
    var cx = S * 0.5;
    shadow(put, S, cx, S * 0.18);
    var lean = state * S * 0.03;
    // posts
    [[-0.34], [0.34]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.4, cx + a[0] * S + lean, S * 0.82, S * 0.03, function () { return state >= 2 ? '#4a2e1c' : N.rust; }); });
    // top rail
    if (state < 2) stroke(put, cx - S * 0.34, S * 0.42 + lean, cx + S * 0.34, S * 0.42 - lean * 0.5, S * 0.03, function () { return N.rust; });
    else stroke(put, cx - S * 0.34, S * 0.5, cx + S * 0.1, S * 0.66, S * 0.03, function () { return '#4a2e1c'; });   // sheared, hanging
    // vertical bars (fewer as it breaks)
    var bars = state === 0 ? 6 : state === 1 ? 4 : 2;
    for (var i = 0; i <= bars; i++) { var fx = cx - S * 0.3 + i / bars * S * 0.6; stroke(put, fx + lean * 0.5, S * 0.44, fx + lean, S * 0.8, S * 0.012, function () { return state >= 1 ? '#4a2e1c' : N.rust; }); }
    if (state >= 1) glow(put, cx - S * 0.1, S * 0.5, cx + S * 0.12, S * 0.56, 0.9, N.amber);   // sparks
  }
  function drawDock(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 11); shadow(put, S, cx, S * 0.26);
    ell(put, cx, S * 0.68, S * 0.16, S * 0.05, function (tx, ty) { return mix(N.concreteLt, N.concreteDk, clamp(tx + ty * 0.3, 0, 1)); });
    for (var a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * S * 0.13), Math.round(S * 0.68 + Math.sin(a) * S * 0.04), a % 1 < 0.5 ? N.amber : N.amberDk);
    glow(put, cx, S * 0.66, cx, S * 0.66, 1.2, N.green);
    dome(put, cx, S * 0.6, S * 0.06, S * 0.045, N.gun, N.chrome, N.gunDk);
    visor(put, cx, S * 0.6, S * 0.025, mix(N.redN, N.night, 0.5), mix(N.redNLt, N.night, 0.5));
    stroke(put, cx + S * 0.18, S * 0.5, cx + S * 0.18, S * 0.7, 2.2, function () { return N.gunDk; });
    glow(put, cx + S * 0.18, S * 0.48, cx + S * 0.18, S * 0.48, 1.3, N.green);
  }
  function drawSakura(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 12);
    plate(put, cx - S * 0.05, S * 0.72, cx + S * 0.05, S * 0.78, N.gun, N.chrome, N.gunDk);
    glow(put, cx, S * 0.71, cx, S * 0.71, 1.4, N.pink);
    for (var y = S * 0.42; y < S * 0.72; y += 2) row(put, Math.round(y), cx - S * 0.015, cx + S * 0.015, function () { return mix(N.pink, N.night, 0.55); });
    stroke(put, cx, S * 0.5, cx - S * 0.08, S * 0.42, 1.2, function () { return mix(N.pink, N.night, 0.5); });
    stroke(put, cx, S * 0.48, cx + S * 0.09, S * 0.4, 1.2, function () { return mix(N.pink, N.night, 0.5); });
    for (var i = 0; i < 40; i++) { var a = i * 2.4, rr = ((i * 7919) % 100) / 100; var x = cx + Math.cos(a) * S * 0.13 * rr, yy = S * 0.36 + Math.sin(a) * S * 0.09 * rr; if (i % 3) put(Math.round(x), Math.round(yy), i % 2 ? mix(N.pinkLt, N.night, 0.3) : mix(N.pink, N.night, 0.4)); }
  }
  function drawDumpster(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 13); shadow(put, S, cx, S * 0.26);
    plate(put, cx - S * 0.15, S * 0.52, cx + S * 0.15, S * 0.72, '#2e5a3a', '#4a8a5a', N.oil);
    for (var t = 0; t < 1; t += 0.05) row(put, Math.round(S * (0.5 - t * 0.03)), cx - S * 0.15 + t * S * 0.02, cx + S * 0.15 - t * S * 0.01, function (tx) { return (t < 0.15 ? mix('#3a6a46', '#1e3a26', tx) : null); });
    [[-0.08, 0.49, N.amber], [0.02, 0.47, N.concreteLt], [0.09, 0.5, N.pink]].forEach(function (a) { ell(put, cx + a[0] * S, S * a[1], S * 0.025, S * 0.018, function (tx, ty) { return mix(a[2], mix(a[2], '#000000', 0.5), tx + ty); }); });
    [[-0.1], [0.05]].forEach(function (a) { put(Math.round(cx + a[0] * S), Math.round(S * 0.74), N.greenLt); put(Math.round(cx + a[0] * S + 2), Math.round(S * 0.74), N.greenLt); });
  }
  function drawSkylight(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 14); shadow(put, S, cx, S * 0.3);
    for (var y = 0; y < S * 0.22; y++) { var t = y / (S * 0.22), w = S * 0.2 * t; row(put, Math.round(S * 0.42 + y), cx - w, cx + w, function (tx) { var b = mix(mix(N.amberLt, N.night, 0.3), mix(N.amber, N.night, 0.5), clamp(tx * 1.2, 0, 1)); if (Math.abs(tx - 0.5) < 0.02 || tx < 0.04 || tx > 0.96) b = N.gunDk; return b; }); }
    row(put, Math.round(S * 0.64), cx - S * 0.21, cx + S * 0.21, function () { return N.gunDk; });
    for (var y2 = S * 0.28; y2 < S * 0.42; y2 += 2) row(put, Math.round(y2), cx - S * 0.04, cx + S * 0.04, function (tx) { return mix(N.amberLt, N.night, 0.6 + tx * 0.2); });
    [[-0.08], [0.02], [0.1]].forEach(function (a) { ell(put, cx + a[0] * S, S * 0.58, S * 0.015, S * 0.02, function () { return N.oil; }); });
  }
  function drawSpotlight(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 15); shadow(put, S, cx, S * 0.24);
    plate(put, cx - S * 0.08, S * 0.68, cx + S * 0.08, S * 0.76, N.gun, N.chrome, N.gunDk);
    stroke(put, cx, S * 0.56, cx, S * 0.68, 2.6, function () { return N.gunDk; });
    ell(put, cx + S * 0.03, S * 0.52, S * 0.05, S * 0.04, function (tx, ty) { return mix(N.chrome, N.gunDk, tx + ty * 0.3); });
    for (var t = 0; t < 1; t += 0.05) { var w = t * S * 0.07; for (var o = -1; o <= 1; o += 0.5) put(Math.round(cx + S * 0.07 + t * S * 0.22), Math.round(S * 0.48 - t * S * 0.22 + o * w), mix(N.white, N.night, 0.35 + t * 0.5)); }
    glow(put, cx + S * 0.07, S * 0.5, cx + S * 0.07, S * 0.5, 1.6, N.white);
  }
  function drawMascot(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 16);
    plate(put, cx - S * 0.06, S * 0.74, cx + S * 0.06, S * 0.8, N.gun, N.chrome, N.gunDk);
    glow(put, cx, S * 0.73, cx, S * 0.73, 1.4, N.cyan);
    var catC = function (tx) { return ((tx * 14 | 0) % 2 ? mix(N.cyan, N.night, 0.5) : mix(N.cyanLt, N.night, 0.42)); };
    for (var y = S * 0.4; y < S * 0.72; y += 2) { var t = (y - S * 0.4) / (S * 0.32), w = S * (0.1 + t * 0.05); row(put, Math.round(y), cx - w, cx + w, catC); }
    ell(put, cx, S * 0.34, S * 0.1, S * 0.09, function (tx, ty) { return ((ty * 10 | 0) % 2 ? mix(N.cyan, N.night, 0.5) : mix(N.cyanLt, N.night, 0.42)); });
    [[-1], [1]].forEach(function (a) { var s = a[0]; for (var i = 0; i < 7; i++) row(put, Math.round(S * 0.27 + i), cx + s * S * (0.09 - i * 0.004) - 3, cx + s * S * (0.09 - i * 0.004) + 3, catC); });
    put(Math.round(cx - S * 0.035), Math.round(S * 0.33), N.white); put(Math.round(cx + S * 0.035), Math.round(S * 0.33), N.white);
    ell(put, cx + S * 0.13, S * 0.42, S * 0.035, S * 0.03, catC);
    glitchBar(put, cx, S * 0.5, S * 0.12, mix(N.pink, N.night, 0.4), mix(N.cyan, N.night, 0.4));
  }
  function drawShanty(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 17); shadow(put, S, cx, S * 0.28);
    [[-0.14], [0.12]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.5, cx + a[0] * S, S * 0.76, 2, function () { return N.rust; }); });
    for (var y = 0; y < S * 0.1; y++) { var t = y / (S * 0.1); row(put, Math.round(S * 0.42 + y), cx - S * (0.18 - t * 0.02), cx + S * (0.16 - t * 0.01), function (tx) { var b = mix('#2e6a8a', '#16394a', clamp(tx * 1.2, 0, 1)); if (((tx * 10) | 0) % 4 === 0) b = mix(b, '#0e2836', 0.4); return b; }); }
    plate(put, cx - S * 0.14, S * 0.52, cx - S * 0.02, S * 0.76, N.concrete, N.concreteLt, N.concreteDk);
    plate(put, cx - S * 0.02, S * 0.52, cx + S * 0.12, S * 0.76, N.rust, '#9a6a4a', '#4a2e1c');
    glow(put, cx - S * 0.08, S * 0.56, cx - S * 0.08, S * 0.56, 1.3, N.amber);
    plate(put, cx + S * 0.16, S * 0.7, cx + S * 0.22, S * 0.76, '#8a2a2a', '#c85a4a', N.oil);
  }
  function drawShed(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 18); shadow(put, S, cx, S * 0.28);
    for (var y = Math.round(S * 0.4); y < S * 0.78; y++) row(put, y, cx - S * 0.13, cx + S * 0.13, function (tx) { var b = mix(N.concreteLt, N.concreteDk, clamp(tx * 1.2, 0, 1)); if ((y | 0) % 9 === 0) b = mix(b, N.oil, 0.3); return b; });
    plate(put, cx - S * 0.15, S * 0.34, cx + S * 0.15, S * 0.4, N.concreteDk, N.concrete, N.oil);
    plate(put, cx - S * 0.05, S * 0.52, cx + S * 0.05, S * 0.78, N.gun, N.chrome, N.gunDk);
    glow(put, cx + S * 0.08, S * 0.6, cx + S * 0.08, S * 0.6, 1.2, N.green);
    glow(put, cx - S * 0.1, S * 0.45, cx - S * 0.02, S * 0.45, 0.9, N.redN);
    stroke(put, cx + S * 0.13, S * 0.4, cx + S * 0.13, S * 0.3, 2, function () { return N.rust; });
  }
  function drawCell(put, S) {
    var cx = S * 0.5; rain(put, S, 4, 19); shadow(put, S, cx, S * 0.2);
    for (var y = S * 0.24; y < S * 0.8; y += 3) row(put, Math.round(y), cx - S * 0.04, cx + S * 0.04, function (tx) { return ((tx * 6 | 0) % 3 === 0 ? N.gun : null); });
    [[-0.04], [0.04]].forEach(function (a) { stroke(put, cx + a[0] * S, S * 0.24, cx + a[0] * S, S * 0.8, 1.4, function () { return N.gunDk; }); });
    [[-0.07], [0], [0.07]].forEach(function (a) { plate(put, cx + a[0] * S - S * 0.012, S * 0.18, cx + a[0] * S + S * 0.012, S * 0.26, N.chrome, N.chromeLt, N.chromeDk); });
    glow(put, cx, S * 0.16, cx, S * 0.16, 1.4, N.redN);
    for (var r = 1; r <= 2; r++) for (var a2 = -1; a2 < 1; a2 += 0.2) put(Math.round(cx + Math.cos(a2 - 1.57) * S * 0.05 * r), Math.round(S * 0.16 + Math.sin(a2 - 1.57) * S * 0.05 * r), mix(N.cyanLt, N.night, 0.4 + r * 0.2));
  }
  function drawKoi(put, S) {
    var cx = S * 0.5; rain(put, S, 3, 20);
    ell(put, cx, S * 0.62, S * 0.2, S * 0.1, function (tx, ty) { return mix('#16394a', '#0a1c26', clamp(tx * 0.9 + ty * 0.5, 0, 1)); });
    ell(put, cx, S * 0.6, S * 0.18, S * 0.08, function (tx, ty) { return mix('#1e4a5e', '#0e2836', clamp(tx + ty * 0.4, 0, 1)); });
    [[-0.05, 0.6, 1], [0.07, 0.585, -1]].forEach(function (a) {
      var dx = a[0], dy = a[1], dir = a[2];
      for (var t = 0; t < 1; t += 0.08) { var w = S * 0.014 * Math.sin(t * Math.PI); (function (t2, w2) { row(put, Math.round(S * dy + Math.sin(t2 * 4) * 1.5), cx + dx * S + dir * t2 * S * 0.07 - w2, cx + dx * S + dir * t2 * S * 0.07 + w2, function (tx) { return ((t2 * 12 | 0) % 2 ? mix(N.amber, N.night, 0.35) : mix(N.amberLt, N.night, 0.3)); }); })(t, w); }
    });
    for (var a2 = 0; a2 < 6.28; a2 += 0.25) put(Math.round(cx + Math.cos(a2) * S * 0.2), Math.round(S * 0.62 + Math.sin(a2) * S * 0.1), a2 % 0.5 < 0.25 ? mix(N.purple, N.night, 0.4) : mix(N.purpleDk, N.night, 0.4));
  }

  // ============================== TILES (8) ==================================
  function n2(x, y) { var s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function sn(x, y, sc) {
    var fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    var sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    var a = n2(ix, iy), b = n2(ix + 1, iy), c = n2(ix, iy + 1), d = n2(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function tfill(fn) { return function (put, S) { for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) put(x, y, fn(x, y, S)); }; }
  function wet(x, y, S, b, seed, thresh) {
    var m = sn(x + seed * 97, y + seed * 41, 20) * 0.7 + sn(x + seed * 13, y + seed * 7, 9) * 0.3;
    var t = thresh == null ? 0.78 : thresh;
    if (m > t) {
      var depth = clamp((m - t) / (1 - t), 0, 1);
      var w = mix('#141a2a', '#080c16', depth);
      var rf = n2(seed, 5);
      var rc = rf > 0.66 ? N.pink : rf > 0.33 ? N.cyan : N.purple;
      var rx = S * (0.3 + rf * 0.4);
      var dxr = Math.abs(x - rx - Math.sin(y * 0.08) * 2);
      if (dxr < 5) w = mix(w, rc, (1 - dxr / 5) * 0.34 * depth);
      if (depth < 0.12) w = mix(w, '#3a4256', 0.5);
      return w;
    }
    return b;
  }
  var tRoof = tfill(function (x, y, S) {
    var b = mix('#32323e', '#20202a', sn(x, y, 22) * 0.8);
    if (x % 54 < 1.4 || y % 54 < 1.4) b = mix(b, '#121218', 0.55);
    if (n2(x, y) > 0.992) b = mix(b, '#4a4a58', 0.6);
    return wet(x, y, S, b, 1);
  });
  var tAsphalt = tfill(function (x, y, S) {
    var b = mix('#23232b', '#15151d', sn(x, y, 16) * 0.7);
    if (n2(x * 3, y * 3) > 0.9) b = mix(b, '#31313c', 0.5);
    [-3, 3].forEach(function (off) { if (Math.abs(x - S * 0.5 - off) < 1.6 && n2(0, y >> 2) > 0.25) b = mix(b, N.amber, 0.5); });
    var od = Math.hypot(x - S * 0.68, y - S * 0.3);
    if (od < 16) b = mix(b, '#0c0c12', 0.5 * (1 - od / 16));
    else if (od < 19) b = mix(b, [N.pink, N.green, N.purple][(x + y) % 3], 0.16);
    return wet(x, y, S, b, 2, 0.84);
  });
  var tMirror = tfill(function (x, y, S) {
    var b = mix('#191d2c', '#0d0f1a', y / S * 0.5 + sn(x, y, 40) * 0.3);
    [[0.22, N.pink], [0.52, N.cyan], [0.8, N.purple]].forEach(function (a) { var d = Math.abs(x - S * a[0]) / (S * 0.075); if (d < 1) b = mix(b, a[1], (1 - d) * (1 - d) * 0.34 * (y / S)); });
    if (x % 40 < 1.2 || y % 40 < 1.2) b = mix(b, '#232a40', 0.6);
    return b;
  });
  var tAdFloor = tfill(function (x, y, S) {
    var b = mix('#10141f', '#090b12', sn(x, y, 30) * 0.5);
    if ((y | 0) % 4 === 0) b = mix(b, '#182038', 0.4);
    var ax = Math.abs(x - S * 0.5);
    [[0.52, N.cyan], [0.72, N.pink]].forEach(function (a) { var yy = y - S * a[0] + ax * 0.55; if (yy > 0 && yy < 9) b = mix(b, a[1], 0.55 - yy / 9 * 0.3); });
    var bd = Math.min(x, S - x, y, S - y);
    if (bd < 2.4) b = mix(b, '#2e5a7a', 0.7);
    return b;
  });
  var tCracked = tfill(function (x, y, S) {
    var cs = 42, cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    var d1 = 9e9, d2 = 9e9, id = 0;
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      var px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      var d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 5 + (cyi + j); } else if (d < d2) d2 = d;
    }
    var b = mix('#3a3a46', '#26262e', n2(id, id) * 0.4 + sn(x, y, 18) * 0.3);
    if (Math.sqrt(d2) - Math.sqrt(d1) < 1.8) b = mix(b, '#10101a', 0.65);
    if (sn(x + 99, y + 99, 26) > 0.72) b = mix(b, '#20261e', 0.4);
    return wet(x, y, S, b, 7, 0.84);
  });
  var tCable = tfill(function (x, y, S) {
    var b = mix('#25252d', '#15151d', sn(x, y, 20) * 0.6);
    [[0.34, 7, '#3c3c48', false], [0.68, 9, '#111119', true]].forEach(function (a) {
      var ry = a[0], rad = a[1], c = a[2], pulse = a[3];
      var cy2 = S * ry + Math.sin(x * 0.03) * 3, d = Math.abs(y - cy2);
      if (d < rad) { var sh = 1 - (d / rad) * (d / rad); b = mix(c, '#000000', 0.55 - sh * 0.45); if (d < 1 && y < cy2) b = mix(b, '#6a6a78', 0.4); if (pulse && (x % 30) < 5 && d < 2) b = mix(b, N.green, 0.55); }
    });
    if (x % 52 < 4) { [0.34, 0.68].forEach(function (ry) { var cy2 = S * ry + Math.sin(x * 0.03) * 3; if (Math.abs(y - cy2) < 11) b = mix(b, '#585864', 0.6); }); }
    return b;
  });
  var tHelipad = tfill(function (x, y, S) {
    var b = mix('#2c303a', '#1b1d24', sn(x, y, 24) * 0.6);
    var cx = S / 2, cy = S / 2, d = Math.hypot(x - cx, y - cy);
    if (Math.abs(d - S * 0.4) < 2.6 && n2(x >> 2, y >> 2) > 0.2) b = mix(b, '#d8b048', 0.6);
    var inH = ((Math.abs(x - cx + S * 0.1) < 3.4 || Math.abs(x - cx - S * 0.1) < 3.4) && Math.abs(y - cy) < S * 0.16) || (Math.abs(y - cy) < 3.4 && Math.abs(x - cx) < S * 0.1);
    if (inH && n2(x >> 1, y >> 1) > 0.15) b = mix(b, '#e2e6ee', 0.72);
    if (Math.abs(y - cy - S * 0.05) < 2 && x > S * 0.3 && x < S * 0.85) b = mix(b, '#14141a', 0.4);
    return wet(x, y, S, b, 9, 0.88);
  });
  var tTagged = tfill(function (x, y, S) {
    var b = mix('#31313d', '#1f1f29', sn(x, y, 20) * 0.6);
    var blobs = [[0.3, 0.48, 20, 18], [0.44, 0.52, 18, 22], [0.58, 0.46, 19, 19], [0.71, 0.51, 18, 21]];
    var inside = 0, edge = false;
    blobs.forEach(function (a) { var dd = ((x - S * a[0]) / a[2]) * ((x - S * a[0]) / a[2]) + ((y - S * a[1] + Math.sin(x * 0.11) * 3) / a[3]) * ((y - S * a[1] + Math.sin(x * 0.11) * 3) / a[3]); if (dd < 1) inside++; if (dd >= 0.86 && dd < 1) edge = true; });
    if (inside > 0) {
      b = mix(N.pink, N.pinkDk, clamp((y - S * 0.3) / (S * 0.4), 0, 1) * 0.6);
      var hole = ((x - S * 0.5) / 5) * ((x - S * 0.5) / 5) + ((y - S * 0.46) / 8) * ((y - S * 0.46) / 8);
      if (hole < 1) b = '#1f1f29';
      if (edge && inside === 1) b = '#0c0c14';
      if (inside >= 2) b = mix(b, N.pinkLt, 0.25);
      if (Math.abs(y - S * 0.38 - (x - S * 0.3) * 0.2) < 2 && x > S * 0.24 && x < S * 0.6) b = mix(b, '#ffffff', 0.5);
    }
    var uy = S * 0.68 + Math.sin(x * 0.05) * 2;
    if (Math.abs(y - uy) < 2.2 && x > S * 0.18 && x < S * 0.84) b = mix(b, N.cyan, 0.55);
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var NE_ART = {
    S: N,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (9) ----
      ctx.spr('neonPunkHi', MS, MS, drawPunk);
      ctx.spr('neonDroneHi', MS, MS, drawDrone);
      ctx.spr('neonEnforcerHi', MS, MS, drawEnforcer);
      ctx.spr('neonNetrunnerHi', MS, MS, drawNetrunner);
      ctx.spr('neonTurretHi', MS, MS, drawTurret);
      ctx.spr('neonRatsHi', MS, MS, drawRats);
      ctx.spr('neonLifterHi', MS, MS, drawLifter);
      ctx.spr('neonViperHi', MS, MS, drawViper);
      ctx.spr('neonLoaderHi', MS, MS, drawLoader);
      ctx.MOB_HI.streetPunk = 'neonPunkHi';       ctx.MOB_DISPLAY.streetPunk = 101;
      ctx.MOB_HI.spyDrone = 'neonDroneHi';         ctx.MOB_DISPLAY.spyDrone = 88;
      ctx.MOB_HI.riotEnforcer = 'neonEnforcerHi';  ctx.MOB_DISPLAY.riotEnforcer = 113;
      ctx.MOB_HI.netrunner = 'neonNetrunnerHi';    ctx.MOB_DISPLAY.netrunner = 101;
      ctx.MOB_HI.turretPod = 'neonTurretHi';       ctx.MOB_DISPLAY.turretPod = 97;
      ctx.MOB_HI.cyberRats = 'neonRatsHi';         ctx.MOB_DISPLAY.cyberRats = 67;
      ctx.MOB_HI.cargoLifter = 'neonLifterHi';     ctx.MOB_DISPLAY.cargoLifter = 126;
      ctx.MOB_HI.neonViper = 'neonViperHi';        ctx.MOB_DISPLAY.neonViper = 105;
      ctx.MOB_HI.exoLoader = 'neonLoaderHi';       ctx.MOB_DISPLAY.exoLoader = 130;
      // ---- boss: SOCIAL ENGINEER (128 canvas, small display — kid-sized) ----
      ctx.spr('neonBossHi', 128, 128, drawBoss);
      ctx.spr('neonBossVentHi', 128, 128, drawBossVent);
      ctx.BOSS_HI.socialEngineer = { key: 'neonBossHi', size: 128, display: 122, bodyW: 34, bodyH: 60 };
      // ---- boss machinery sprites ----
      ctx.spr('neonFirewallDrone', 48, 48, drawFirewallDrone);
      ctx.spr('neonAd0', 64, 64, function (put, S) { drawAdWall(put, S, 0); });
      ctx.spr('neonAd1', 64, 64, function (put, S) { drawAdWall(put, S, 1); });
      ctx.spr('neonAd2', 64, 64, function (put, S) { drawAdWall(put, S, 2); });
      ctx.spr('neonAd3', 64, 64, function (put, S) { drawAdWall(put, S, 3); });
      // ---- the KINGPIN APACHE (flyer + wreck) + patrol silhouette ----
      ctx.spr('neonHeli', 160, 160, drawHeli);
      ctx.spr('neonWreck', 160, 160, drawWreck);
      // ---- decor (20) ----
      ctx.spr('nedBillboard', 64, 64, drawBillboard);
      ctx.spr('nedRamen', 64, 64, drawRamen);
      ctx.spr('nedAC', 64, 64, drawAC);
      ctx.spr('nedDish', 64, 64, drawDish);
      ctx.spr('nedTank', 64, 64, drawTank);
      ctx.spr('nedAntenna', 64, 64, drawAntenna);
      ctx.spr('nedVending', 64, 64, drawVending);
      ctx.spr('nedPower', 64, 64, drawPower);
      ctx.spr('nedVent', 64, 64, drawVent);
      ctx.spr('nedEscape', 64, 64, drawEscape);
      ctx.spr('nedDock', 64, 64, drawDock);
      ctx.spr('nedSakura', 64, 64, drawSakura);
      ctx.spr('nedDumpster', 64, 64, drawDumpster);
      ctx.spr('nedSkylight', 64, 64, drawSkylight);
      ctx.spr('nedSpotlight', 64, 64, drawSpotlight);
      ctx.spr('nedMascot', 64, 64, drawMascot);
      ctx.spr('nedShanty', 64, 64, drawShanty);
      ctx.spr('nedShed', 64, 64, drawShed);
      ctx.spr('nedCell', 64, 64, drawCell);
      ctx.spr('nedKoi', 64, 64, drawKoi);
      // ---- FIRE ESCAPE railings — destructible fence, 3 break states ----
      ctx.spr('neonRail0', 64, 64, function (put, S) { drawRail(put, S, 0); });
      ctx.spr('neonRail1', 64, 64, function (put, S) { drawRail(put, S, 1); });
      ctx.spr('neonRail2', 64, 64, function (put, S) { drawRail(put, S, 2); });
      // ---- tiles (8) ----
      ctx.tex('netRoof', 48, 48, tRoof);
      ctx.tex('netAsphalt', 48, 48, tAsphalt);
      ctx.tex('netMirror', 48, 48, tMirror);
      ctx.tex('netAdFloor', 48, 48, tAdFloor);
      ctx.tex('netCracked', 48, 48, tCracked);
      ctx.tex('netCable', 48, 48, tCable);
      ctx.tex('netHelipad', 48, 48, tHelipad);
      ctx.tex('netTagged', 48, 48, tTagged);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = NE_ART;
  root.NEON_ART = NE_ART;
})(typeof window !== 'undefined' ? window : this);
