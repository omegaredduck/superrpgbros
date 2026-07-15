// ============================================================================
// nexus_art.js — procedural HI-FI art for the PORTAL ROOM (chamber), gated on
// the same Settings > Hi-Fi World toggle as the train yard. Faithful higher-
// fidelity remakes of the chamber assets: arcane floor + wall tiles, the portal
// PLATFORM, the PORTAL (neutral → tinted per mode), the CONSOLE/machine, the
// CONDUIT, the records WALL SCREEN, the LEVER, the BESTIARY, and the VAULT chest.
// Same pure pixel-plotting contract; reuses ranger_art.js primitives.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('./ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke;

  var P = {
    OUT: '#1a1c2c',
    st1: '#4a5a78', st2: '#5f7291', stLt: '#94b0c2', stHi: '#c3d3e4', stDk: '#333c57', stDk2: '#252b40',
    deep: '#29366f', deep2: '#1c2450',
    blu: '#41a6f6', bluLt: '#7cc7ff', bluDk: '#1d5fa8', cyan: '#6ff0e0', cyanLt: '#b6fff4',
    grn: '#49e83b', grnGlass: '#0a1408', grnGlass2: '#123317', grnDk: '#1f6e3f',
    gold: '#ffcd75', goldLt: '#ffe9b0', orange: '#ef7d57', rust: '#8a4b2a',
    wood: '#7a4a2b', woodDk: '#4d2f1c', metal: '#9aa7b8', metalLt: '#cdd6e2', metalDk: '#566c86',
    rune: '#5aa9ff', white: '#f4f4f4', black: '#0c0d12'
  };
  function hash(x, y) { var h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

  // metal palettes for the keypad wall-safe vault (dark/mid/light/hi)
  var MET = {
    steel: { dark: '#3a4152', mid: '#7d8aa0', light: '#b9c4d6', hi: '#e6ecf5' },
    iron:  { dark: '#23262f', mid: '#4a5162', light: '#828da6', hi: '#a9b2c6' },
    gun:   { dark: '#1d2027', mid: '#3a404c', light: '#646c7c', hi: '#8b93a4' }
  };
  var GREEN = '#49e83b';
  // beveled metal plate: light top edge, dark side edges, vertical shade gradient
  function frameMetal(put, S, x0, x1, y0, y1, pal) {
    for (var y = Math.round(S * y0); y < Math.round(S * y1); y++) {
      var t = (y - S * y0) / (S * (y1 - y0));
      row(put, y, S * x0, S * x1, function (tx) {
        var c = mix(pal.mid, pal.dark, 0.2 + t * 0.5);
        if (tx < 0.05 || tx > 0.95) c = pal.dark;
        if (t < 0.06) c = pal.light;
        return c;
      });
    }
  }

  // ---- FLOOR: arcane flagstone with grout + faint glowing rune flecks -------
  function drawFloor(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x, y);
      var b = mix(P.st1, P.st2, n * 0.7);
      // tile grout every half-tile
      if (x % (W / 2 | 0) === 0 || y % (H / 2 | 0) === 0) b = P.stDk;
      if ((x + 1) % (W / 2 | 0) === 0 || (y + 1) % (H / 2 | 0) === 0) b = mix(P.st2, P.stHi, 0.4);
      put(x, y, b);
    }
    // a couple of faint rune flecks (seamless-ish)
    for (var i = 0; i < 3; i++) { var rx = Math.floor(hash(i, 9) * W), ry = Math.floor(hash(i, 3) * H); put(rx, ry, P.rune); }
  }

  // ---- WALL: carved stone block with a glowing arcane seam ------------------
  function drawWall(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var n = hash(x * 2, y * 2);
      var b = mix(P.deep2, P.deep, 0.3 + n * 0.5);
      if (x < 2 || y < 2) b = mix(P.stDk, P.st1, 0.5);         // top-left bevel light
      if (x > W - 3 || y > H - 3) b = P.black;                  // shadow
      put(x, y, b);
    }
    // glowing seam
    for (var xx = 0; xx < W; xx++) put(xx, H >> 1, mix(P.deep, P.blu, 0.35));
  }

  // ---- PLATFORM: the portal pad — beveled stone ring, radial arcane inlays,
  //      8 light sockets, a glowing inner well. S x S. ------------------------
  function drawPlatform(put, S) {
    // Proportions match the classic platform: a BIG open well (~0.41R) in a clean
    // beveled donut ring, 8 sockets on the deck (user: "proportions all wrong").
    var cx = S * 0.5, cy = S * 0.5;
    function ring(r, col) { ell(put, cx, cy, r, r, function () { return col; }); }
    ring(S * 0.5, P.OUT);               // outline
    ring(S * 0.485, P.stDk);
    ring(S * 0.46, P.metalDk);          // outer rim
    ring(S * 0.43, P.stLt);             // rim highlight (bevel light)
    ring(S * 0.40, P.metalDk);          // groove shadow
    ring(S * 0.375, P.stDk);            // deck outer
    ring(S * 0.355, P.st2);             // deck surface
    // subtle radial inlays on the deck only
    for (var a = 0; a < 16; a++) {
      var ang = a * Math.PI / 8;
      stroke(put, cx + Math.cos(ang) * S * 0.25, cy + Math.sin(ang) * S * 0.25,
        cx + Math.cos(ang) * S * 0.335, cy + Math.sin(ang) * S * 0.335, Math.max(1, S * 0.006),
        function () { return mix(P.stDk, P.rune, 0.4); });
    }
    ring(S * 0.235, P.stDk);            // well lip
    ring(S * 0.215, P.OUT);             // well outline
    // BIG glowing well — a clean radial blue→cyan pool (no vertical stripe)
    var wr = S * 0.205;
    for (var y = Math.floor(cy - wr); y <= Math.ceil(cy + wr); y++) for (var x = Math.floor(cx - wr); x <= Math.ceil(cx + wr); x++) {
      var dx = x + 0.5 - cx, dyy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dyy * dyy) / wr; if (d > 1) continue;
      put(x, y, mix(P.cyan, P.deep2, clamp(Math.pow(d, 0.7), 0, 1)));
    }
    ell(put, cx, cy, S * 0.045, S * 0.045, function () { return P.cyanLt; });   // bright core
    // 8 metal light sockets on the deck (at ~0.59R, where the ring lights sit)
    for (var i = 0; i < 8; i++) {
      var s = i * Math.PI / 4, sx = cx + Math.cos(s) * S * 0.295, sy = cy + Math.sin(s) * S * 0.295;
      ell(put, sx, sy, S * 0.028, S * 0.028, function () { return P.OUT; });
      ell(put, sx, sy, S * 0.018, S * 0.018, function () { return P.metalDk; });
    }
    // top-left sheen on the rim
    for (var b2 = 0; b2 < 44; b2++) { var bb = -2.5 + b2 * 0.02; put(Math.round(cx + Math.cos(bb) * S * 0.445), Math.round(cy + Math.sin(bb) * S * 0.445), P.stHi); }
  }

  // ---- PORTAL: a DOOR-shaped arcane gateway — stone pillars + an arched top +
  //      a threshold, with a churning SWIRL filling the doorway. NEUTRAL greyscale
  //      so it tints per mode. In-game a spinning swirl disc sits inside (drawn by
  //      drawPortalDisc) and it rises out of the floor on spawn — see scenes.js.
  //      W x H (tall). H is the door height.
  function drawPortal(put, W, H) {
    var cx = W * 0.5;
    var pillar = Math.max(4, Math.round(W * 0.17));   // side pillar width
    var archTop = H * 0.06, springY = H * 0.40, baseY = H * 0.9;
    var oHalf = W * 0.5 - pillar;                      // half-width of the opening
    function openHalfAt(y) {
      if (y >= springY && y < baseY) return oHalf;
      if (y >= archTop && y < springY) { var dy = (springY - y) / (springY - archTop); return oHalf * Math.sqrt(clamp(1 - dy * dy, 0, 1)); }
      return -1;
    }
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var oh = openHalfAt(y), inOpen = oh >= 0 && Math.abs(x - cx) < oh;
      if (inOpen) {                                     // ---- swirl interior ----
        var ddx = x - cx, ddy = y - H * 0.56, rd = Math.sqrt(ddx * ddx + ddy * ddy) / (H * 0.42), ang = Math.atan2(ddy, ddx);
        var band = Math.sin(rd * Math.PI * 5 - ang * 2) * 0.5 + 0.5, core = clamp(1 - rd * 0.9, 0, 1);
        put(x, y, mix('#23283c', P.white, clamp(core * 0.6 + band * 0.5, 0, 1)));
        continue;
      }
      // ---- stone frame (pillars + arch band + threshold) ----
      var inFrame = false;
      if (y >= archTop && y < baseY && (x < pillar || x >= W - pillar)) inFrame = true;         // pillars
      else if (y >= archTop && y < springY && oh >= 0) inFrame = true;                          // arch band (around the opening)
      else if (y >= archTop && y < springY && oh < 0 && Math.abs(x - cx) < oHalf + pillar) inFrame = true; // arch fill above spring
      if (y >= baseY - 1 && y < H && x > pillar * 0.4 && x < W - pillar * 0.4) inFrame = true;  // threshold slab
      if (inFrame) {
        var edgeL = Math.min(x, W - 1 - x);
        var f = mix('#8a97b0', '#3a4258', clamp((x + y) / (W + H), 0, 1));      // TL light → BR shadow
        if (edgeL < 2 || x < pillar + 1 && x > pillar - 2) f = mix(f, '#c8d6e8', 0.5); // rim/inner-edge highlight
        put(x, y, f);
      }
    }
    // keystone at the arch apex + glowing inner-edge line around the opening
    for (var ky = Math.round(archTop - 1); ky < Math.round(archTop + H * 0.06); ky++) row(put, ky, cx - W * 0.06, cx + W * 0.06, function () { return mix(P.stLt, P.stDk, 0.4); });
    for (var yy = Math.round(archTop); yy < Math.round(baseY); yy++) {
      var oh2 = openHalfAt(yy); if (oh2 < 0) continue;
      put(Math.round(cx - oh2), yy, '#dfe8f2'); put(Math.round(cx + oh2 - 1), yy, '#c2cddd');
    }
  }

  // ---- PORTAL SWIRL DISC: the round churning core that SPINS inside the door
  //      (a separate sprite in-game). NEUTRAL greyscale (tints per mode). -----
  function drawPortalDisc(put, S) {
    var cx = S * 0.5, cy = S * 0.5;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var dx = x - cx, dy = y - cy, rd = Math.sqrt(dx * dx + dy * dy) / (S * 0.5); if (rd > 1) continue;
      var ang = Math.atan2(dy, dx);
      var band = Math.sin(rd * Math.PI * 6 - ang * 2.5) * 0.5 + 0.5, core = clamp(1 - rd, 0, 1);
      var v = clamp(core * 0.6 + band * 0.55, 0, 1);
      put(x, y, mix('#20242f', P.white, v));                 // opaque grey → white (tints per mode)
    }
    // three bright spiral arms so the spin reads
    for (var t = 0; t < 3; t++) for (var r = S * 0.1; r < S * 0.46; r += 1) {
      var aa = t * 2.0944 + r * 0.12;
      put(Math.round(cx + Math.cos(aa) * r), Math.round(cy + Math.sin(aa) * r), '#eef4fb');
    }
  }

  // ---- CONSOLE: arcane terminal — stone base + glowing screen + keys --------
  function drawConsole(put, S) { terminal(put, S, P.blu, P.bluLt, P.bluDk); }
  function drawBestiary(put, S) { terminal(put, S, P.grn, '#8ff08a', P.grnDk); }
  function terminal(put, S, scr, scrLt, scrDk) {
    // stone pedestal base
    for (var y = Math.round(S * 0.62); y < Math.round(S * 0.96); y++) {
      var t = (y - S * 0.62) / (S * 0.34), hw = R.lerp(S * 0.3, S * 0.42, t);
      row(put, y, S * 0.5 - hw, S * 0.5 + hw, function (tx) {
        var b = mix(P.st2, P.stDk, 0.2 + t * 0.5);
        if (tx < 0.15) b = mix(b, P.stHi, 0.4); if (tx > 0.85) b = mix(b, P.stDk2, 0.5); return b;
      });
    }
    // monitor housing
    for (var y2 = Math.round(S * 0.1); y2 < Math.round(S * 0.62); y2++)
      row(put, y2, S * 0.16, S * 0.84, function (tx) { return mix(P.stDk, P.stDk2, 0.3 + tx * 0.4); });
    // glowing screen
    for (var sy = Math.round(S * 0.16); sy < Math.round(S * 0.52); sy++)
      row(put, sy, S * 0.22, S * 0.78, function (tx, xx) {
        var b = mix(scrDk, scr, 0.5);
        if ((sy % 4) === 0) b = mix(b, scrLt, 0.4);            // scanlines
        if (tx < 0.12 || tx > 0.88) b = mix(b, P.black, 0.4);  // vignette
        return b;
      });
    // screen sheen + a few glyph blips
    row(put, Math.round(S * 0.18), S * 0.24, S * 0.5, function () { return scrLt; });
    put(Math.round(S * 0.34), Math.round(S * 0.3), scrLt); put(Math.round(S * 0.5), Math.round(S * 0.38), scrLt);
    put(Math.round(S * 0.62), Math.round(S * 0.3), scrLt);
    // key row on the base
    for (var k = 0; k < 4; k++) put(Math.round(S * 0.34 + k * S * 0.1), Math.round(S * 0.7), P.metal);
  }

  // ---- CONDUIT: a glowing energy LIGHT STRIP in a carved channel (tiles along
  //      its length). Stone lips either side, a bright cyan core down the middle.
  function drawConduit(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var t = Math.abs(x - W * 0.5) / (W * 0.5), b;
      if (t > 0.72) b = P.stDk;                        // stone lips
      else if (t > 0.55) b = P.metalDk;
      else b = mix(P.deep2, P.deep, 0.4);              // channel groove
      put(x, y, b);
    }
    // bright core light strip down the middle (subtle shimmer)
    for (var yy = 0; yy < H; yy++) {
      var g = 0.55 + 0.45 * Math.sin(yy * 0.5);
      put(Math.round(W * 0.5), yy, mix(P.blu, P.cyanLt, g));
      put(Math.round(W * 0.5) - 1, yy, mix(P.deep, P.cyan, g * 0.8));
      put(Math.round(W * 0.5) + 1, yy, mix(P.deep, P.blu, g * 0.6));
    }
  }

  // ---- WALL SCREEN: wide records monitor (green glass) ----------------------
  function drawWallscreen(put, W, H) {
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      var b;
      if (x < 3 || x > W - 4 || y < 3 || y > H - 4) b = P.OUT;      // bezel
      else if (x < 5 || x > W - 6 || y < 5 || y > H - 6) b = P.stDk; // frame
      else { b = P.grnGlass; if (y < 7) b = P.grnGlass2; }          // dark green glass + top sheen
      put(x, y, b);
    }
    // power pip + mounting struts
    put(W - 6, H - 6, P.grn); put(W - 7, H - 6, P.grn);
    for (var s = 0; s < 2; s++) { var sx = Math.round(W * (0.25 + s * 0.5)); put(sx, 0, P.stDk); put(sx, 1, P.stDk); }
  }

  // ---- LEVER: riveted breaker box + handle (up or down) ---------------------
  function drawLever(put, W, H, up) {
    var boxTop = Math.round(H * 0.32), boxBot = Math.round(H * 0.68);
    // handle stem + knob
    var ky = up ? [Math.round(H * 0.04), boxTop] : [boxBot, Math.round(H * 0.96)];
    for (var y = ky[0]; y < ky[1]; y++) { put(Math.round(W * 0.5), y, P.metalLt); put(Math.round(W * 0.5) - 1, y, P.metal); put(Math.round(W * 0.5) + 1, y, P.metalDk); }
    var knobY = up ? ky[0] : ky[1] - 1;
    ell(put, W * 0.5, knobY, W * 0.16, W * 0.16, function (tx, ty) { return mix(P.metalLt, P.metalDk, 0.2 + ty * 0.6); });
    // the box
    for (var y2 = boxTop; y2 < boxBot; y2++) {
      var t = (y2 - boxTop) / (boxBot - boxTop);
      row(put, y2, W * 0.06, W * 0.94, function (tx) {
        var b = mix(P.metalDk, P.stDk, 0.3 + t * 0.4);
        if (tx < 0.12) b = mix(b, P.metalLt, 0.5); if (tx > 0.88) b = mix(b, P.OUT, 0.5); return b;
      });
    }
    // rivets + a status light
    [0.14, 0.86].forEach(function (fx) { [0.4, 0.6].forEach(function (fy) { put(Math.round(W * fx), Math.round(H * fy), P.metalLt); }); });
    ell(put, W * 0.5, H * 0.5, W * 0.08, W * 0.08, function () { return up ? P.grn : P.orange; });
  }

  // ---- VAULT: keypad wall-safe (user pick "vault 5") -----------------------
  //   gunmetal outer frame + iron inset door, a 3x4 keypad, a green status LED,
  //   and a steel lever handle.
  function drawChest(put, S) {
    frameMetal(put, S, 0.10, 0.90, 0.12, 0.88, MET.gun);    // outer frame
    frameMetal(put, S, 0.15, 0.85, 0.18, 0.82, MET.iron);   // inset door
    // keypad — 3 columns x 4 rows of round buttons
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++)
      ell(put, S * (0.26 + c * 0.10), S * (0.30 + r * 0.10), S * 0.028, S * 0.028,
          function (tx, ty) { return mix(MET.steel.light, MET.steel.dark, 0.2 + ty * 0.6); });
    // green status LED (top-right of the panel)
    put(Math.round(S * 0.68), Math.round(S * 0.30), GREEN);
    put(Math.round(S * 0.70), Math.round(S * 0.30), GREEN);
    // steel lever handle (lower-right)
    for (var hx = Math.round(S * 0.60); hx < Math.round(S * 0.78); hx++) {
      put(hx, Math.round(S * 0.62),     MET.steel.light);
      put(hx, Math.round(S * 0.62) + 1, MET.steel.mid);
      put(hx, Math.round(S * 0.62) + 2, MET.steel.dark);
    }
  }

  // ==========================================================================
  // HI-FI HUD (2026-07-14, user: "the hud at the bottom looks disconjointed —
  // make hi-fi hud assets and the art that connects um together"). Three
  // pieces in the chamber's arcane-console language: a beveled METAL RING
  // housing for each resource orb, a tileable CONDUIT PLATE that runs behind
  // the XP bar and physically connects the two rings, and an END CAP with a
  // glowing power node where the plate docks into each ring.
  // ==========================================================================

  // ---- orb housing: beveled steel annulus + gold rivets + side power pips --
  function drawHudOrbFrame(put, S) {
    var c = S / 2, ro = S * 0.485, ri = S * 0.405;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy);
      if (d > ro || d < ri) continue;
      var t = (y / S);                                   // lit from above
      var b = mix(P.metalLt, P.stDk, 0.15 + t * 0.75);
      var e = (d - ri) / (ro - ri);                      // bevel across the ring
      if (e < 0.18 || e > 0.85) b = mix(b, P.OUT, 0.55); // inner/outer rims
      else if (e < 0.4) b = mix(b, P.stHi, 0.25 * (1 - t));
      put(x, y, b);
    }
    // four gold rivets on the diagonals
    var rm = (ro + ri) / 2;
    [45, 135, 225, 315].forEach(function (deg) {
      var a = deg * Math.PI / 180;
      var rx = c + Math.cos(a) * rm, ry = c + Math.sin(a) * rm;
      ell(put, rx, ry, S * 0.028, S * 0.028, function (tx, ty) { return mix(P.goldLt, P.gold, 0.3 + ty * 0.5); });
      put(Math.round(rx), Math.round(ry), P.orange);
    });
    // side power pips (cyan) where the connector plate docks
    [0, Math.PI].forEach(function (a) {
      var rx = c + Math.cos(a) * rm, ry = c + Math.sin(a) * rm;
      ell(put, rx, ry, S * 0.02, S * 0.02, function () { return P.cyan; });
      put(Math.round(rx), Math.round(ry), P.cyanLt);
    });
    // top vent ticks
    for (var i = -2; i <= 2; i++) {
      var vx = Math.round(c + i * 4), vy = Math.round(c - rm);
      put(vx, vy, P.stDk2); put(vx, vy + 1, P.stDk2);
    }
  }

  // ---- connector plate (tileable 32px segments): housing + dark XP groove --
  function drawHudPlateMid(put, W, H) {
    for (var y = 0; y < H; y++) {
      var b;
      if (y === 0 || y === H - 1) b = P.OUT;
      else if (y <= 3) b = mix(P.stHi, P.stLt, y / 3);                      // top bevel
      else if (y < 8) b = mix(P.st2, P.stDk, (y - 4) / 4);                  // upper housing
      else if (y === 8 || y === 28) b = P.OUT;                              // groove lips
      else if (y > 8 && y < 28) b = mix(P.deep2, P.black, Math.abs(y - 18) / 10);  // XP groove (bar renders inside)
      else b = mix(P.stDk, P.stDk2, (y - 29) / 6);                          // lower housing
      for (var x = 0; x < W; x++) {
        var col = b;
        if (x === 0 && y > 0 && y < H - 1) col = mix(b, P.OUT, 0.6);        // plate seam per segment
        put(x, y, col);
      }
    }
    // blue tick lights on the top housing (every segment carries two)
    [Math.round(W * 0.3), Math.round(W * 0.75)].forEach(function (tx2) {
      put(tx2, 5, P.blu); put(tx2 + 1, 5, P.bluLt); put(tx2, 6, P.bluDk); put(tx2 + 1, 6, P.blu);
    });
  }

  // ---- end cap: rounded dock with a glowing power node + gold trim ---------
  // Drawn as the LEFT cap; the right one is the same texture flipped in-game.
  function drawHudPlateCap(put, W, H) {
    var cy = H / 2;
    for (var y = 0; y < H; y++) {
      var edge = 0;                                       // rounded left corners
      if (y < 4) edge = 4 - y; else if (y > H - 5) edge = y - (H - 5);
      for (var x = Math.round(edge); x < W; x++) {
        var b;
        if (y === 0 || y === H - 1 || x === Math.round(edge)) b = P.OUT;
        else if (y <= 3) b = P.stHi;
        else if (y >= H - 4) b = P.stDk2;
        else b = mix(P.st2, P.stDk, y / H);
        put(x, y, b);
      }
    }
    // glowing power node (the plate's energy source, feeds the XP conduit)
    ell(put, W * 0.38, cy, H * 0.17, H * 0.17, function (tx, ty) {
      return mix(P.stDk2, P.black, ty);
    });
    ell(put, W * 0.38, cy, H * 0.115, H * 0.115, function (tx, ty) {
      var dd = Math.hypot(tx - 0.5, ty - 0.5) * 2;
      return dd > 0.9 ? P.bluDk : mix(P.cyanLt, P.blu, dd);
    });
    put(Math.round(W * 0.38), Math.round(cy), P.white);
    // gold trim column before the plate joins the mid segments
    for (var y2 = 4; y2 < H - 4; y2++) {
      put(W - 4, y2, mix(P.gold, P.orange, y2 / H));
      put(W - 3, y2, mix(P.goldLt, P.gold, y2 / H));
    }
  }

  var API = { P: P, drawFloor: drawFloor, drawWall: drawWall, drawPlatform: drawPlatform, drawPortal: drawPortal,
    drawPortalDisc: drawPortalDisc, drawConsole: drawConsole, drawBestiary: drawBestiary, drawConduit: drawConduit,
    drawWallscreen: drawWallscreen, drawLever: drawLever, drawChest: drawChest,
    drawHudOrbFrame: drawHudOrbFrame, drawHudPlateMid: drawHudPlateMid, drawHudPlateCap: drawHudPlateCap };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.NEXUS_ART = API;
})(typeof window !== 'undefined' ? window : this);
