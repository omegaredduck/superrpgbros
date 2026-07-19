// ============================================================================
// cutscene.js — the story cutscene rig (2026-07-17, Opus build).
// A data-driven CutsceneScene that plays a shot list on a 240x160 pixel canvas,
// integer-scaled + letterboxed, with a records-wall-style typewriter over the
// top and SPACE/ESC skip. Art ported frame-for-frame from the approved preview
// GIFs (game/js/cutscenes/assets + render/*.py). See CUTSCENES.md.
//   CS0 THE PREAMBLE + CS1 COLD BOOT  = the virus-attack story (item 2)
//   CS2 THE REBOOT + CS3 THE WAKE/FORK = endgame + legendary/class unlock (item 1)
// Trigger: game.scene.start('Cutscene', { id:'cs0', cls:'ranger', next:fnOrCfg }).
// ============================================================================
var CUT = (function () {
  var W = 240, H = 160;

  // ---- palette (matches cutscene_kit.py) ----
  var C = {
    BG: '#0a0c10', WHITE: '#e8e8e8', CYAN: '#5fe8c2', CYAN_D: '#2b7a68',
    RED: '#e84545', GOLD: '#e8c25f', AMBER: '#e8a53f', GREY: '#5a6068',
    GREY_D: '#2c3038', GREY_DD: '#181b21', INDIGO: '#1a1630', ORANGE: '#c85a28',
    SKIN: '#deb28c'
  };
  function rgb(a){ return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')'; }
  function mixHexArr(hex){ hex=hex.replace('#',''); return [parseInt(hex.substr(0,2),16),parseInt(hex.substr(2,2),16),parseInt(hex.substr(4,2),16)]; }
  var AMBER_A = mixHexArr(C.AMBER), CYAN_A = mixHexArr(C.CYAN);

  // ---- canvas pixel helpers (PIL → Canvas2D; PIL rects are inclusive) ----
  function rect(x, x0, y0, x1, y1, col) { x.fillStyle = col; x.fillRect(x0, y0, (x1 - x0) + 1, (y1 - y0) + 1); }
  function px(x, xx, yy, col) { x.fillStyle = col; x.fillRect(xx, yy, 1, 1); }
  function line(x, x0, y0, x1, y1, col) {           // bresenham pixel line
    x.fillStyle = col;
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    while (true) { x.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; var e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  }
  function efill(x, x0, y0, x1, y1, col) {           // filled ellipse in bbox
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 0.0001, ry = (y1 - y0) / 2 + 0.0001;
    x.fillStyle = col;
    for (var yy = Math.floor(y0); yy <= y1; yy++) for (var xx = Math.floor(x0); xx <= x1; xx++) {
      var nx = (xx - cx) / rx, ny = (yy - cy) / ry; if (nx * nx + ny * ny <= 1) x.fillRect(xx, yy, 1, 1);
    }
  }
  function rrect(x, x0, y0, x1, y1, col, outline) {  // rounded rect (approx: cut 1px corners)
    rect(x, x0, y0, x1, y1, col);
    // trim corners
    x.clearRect(x0, y0, 1, 1); x.clearRect(x1, y0, 1, 1); x.clearRect(x0, y1, 1, 1); x.clearRect(x1, y1, 1, 1);
    if (outline) { x.strokeStyle = outline; x.lineWidth = 1; x.strokeRect(x0 + 0.5, y0 + 0.5, (x1 - x0), (y1 - y0)); }
  }
  function vgrad(x, y0, y1, c0, c1) {
    var a = mixHexArr(c0), b = mixHexArr(c1), n = Math.max(1, y1 - y0);
    for (var i = 0; i < n; i++) { var t = i / n; x.fillStyle = rgb([Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]); x.fillRect(0, y0 + i, W, 1); }
  }
  function dither(x, x0, y0, x1, y1, col, step, phase) {
    x.fillStyle = col; step = step || 2; phase = phase || 0;
    for (var yy = y0; yy < y1; yy++) for (var xx = x0 + ((yy + phase) % step); xx < x1; xx += step) x.fillRect(xx, yy, 1, 1);
  }
  function bars(x) { rect(x, 0, 0, W, 9, '#000'); rect(x, 0, H - 10, W, H, '#000'); }
  // seeded rng (deterministic like random.Random(seed))
  function RNG(seed) { var s = seed || 1; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  // ---- hero (the selected class) — ported from cutscene_kit.hero ----
  var HERO_PAL = {
    ranger: { main: '#347846', dark: '#22522f', accent: '#5fe88c', trim: '#785a32' },
    wizard: { main: '#4054ba', dark: '#2c3a84', accent: '#5f96e8', trim: '#c8be78' },
    knight: { main: '#4a4c5a', dark: '#30323c', accent: '#d8463c', trim: '#8c909e' },
    // ninja "Oni King" (matches ninja_art.js): near-black gi, crimson accents,
    // bone-gold blade. v7 (2026-07-19, Red): so the ninja body renders as ITSELF
    // in every cutscene instead of silently falling back to the ranger.
    ninja:  { main: '#241318', dark: '#100810', accent: '#e84545', trim: '#e2c49a' }
  };
  function hero(x, X, Y, cls, facing, pose) {
    var p = HERO_PAL[cls] || HERO_PAL.ranger, cx = X + 4;
    rect(x, X + 2, Y + 13, X + 3, Y + 18, p.dark); rect(x, X + 5, Y + 13, X + 6, Y + 18, p.dark);
    rect(x, X + 2, Y + 18, X + 3, Y + 19, '#1e1e24'); rect(x, X + 5, Y + 18, X + 6, Y + 19, '#1e1e24');
    rect(x, X + 1, Y + 6, X + 7, Y + 12, p.main); rect(x, X + 1, Y + 11, X + 7, Y + 12, p.dark);
    rect(x, X + 1, Y + 10, X + 7, Y + 10, p.trim);
    if (pose === 'gasp') { rect(x, X - 1, Y + 5, X, Y + 8, p.main); rect(x, X + 8, Y + 5, X + 9, Y + 8, p.main); px(x, X - 1, Y + 9, C.SKIN); px(x, X + 9, Y + 9, C.SKIN); }
    else { rect(x, X, Y + 6, X, Y + 11, p.dark); rect(x, X + 8, Y + 6, X + 8, Y + 11, p.dark); px(x, X, Y + 12, C.SKIN); px(x, X + 8, Y + 12, C.SKIN); }
    rect(x, cx - 1, Y + 1, cx + 2, Y + 5, C.SKIN);
    if (facing === 'back') rect(x, cx - 1, Y + 1, cx + 2, Y + 5, '#966e46');
    else { px(x, cx, Y + 3, '#1e1e24'); px(x, cx + 2, Y + 3, '#1e1e24'); }
    if (cls === 'wizard') { px(x, cx, Y - 3, p.main); rect(x, cx - 1, Y - 2, cx + 1, Y - 1, p.main); rect(x, cx - 3, Y, cx + 4, Y, p.dark); }
    else if (cls === 'knight') { rect(x, cx - 2, Y, cx + 3, Y + 2, p.trim); px(x, cx, Y - 1, p.accent); px(x, cx + 1, Y - 1, p.accent); }
    else if (cls === 'ninja') {
      // dark hood pulled over the head; crimson band + amber eye slit (front view)
      rect(x, cx - 2, Y - 1, cx + 3, Y + 1, p.dark);       // hood crown
      rect(x, cx - 1, Y + 1, cx + 2, Y + 5, p.dark);       // hood shrouds the face
      if (facing !== 'back') { rect(x, cx - 1, Y + 2, cx + 2, Y + 2, p.accent); px(x, cx, Y + 3, C.AMBER); px(x, cx + 1, Y + 3, C.AMBER); }
    }
    else { rect(x, cx - 2, Y, cx + 3, Y + 1, p.main); px(x, cx - 2, Y + 2, p.main); px(x, cx + 3, Y + 2, p.main); }
    // weapon
    if (cls === 'wizard') { var sx = facing === 'back' ? X + 9 : X - 1; line(x, sx, Y + 2, sx, Y + 16, '#785a32'); px(x, sx, Y + 1, p.accent); }
    else if (cls === 'knight') { var kx = facing === 'back' ? X + 7 : X + 1; line(x, kx, Y - 2, kx, Y + 8, p.trim); rect(x, kx - 1, Y + 6, kx + 1, Y + 6, '#785a32'); }
    else if (cls === 'ninja') { var nx2 = facing === 'back' ? X + 8 : X - 1; line(x, nx2, Y + 3, nx2, Y + 12, p.trim); px(x, nx2, Y + 2, p.accent); }
    else { var bx = facing === 'back' ? X + 8 : X - 1; line(x, bx + 2, Y + 5, bx + 2, Y + 13, '#c8c8c8'); line(x, bx - 2, Y + 5, bx - 2, Y + 12, p.trim); }
    px(x, cx + 1, Y + 8, p.accent);
  }
  function person(x, X, Y, col) { rect(x, X, Y + 3, X + 4, Y + 7, col); var d = 'rgb(' + Math.max(0, mixHexArr(col)[0] - 8) + ',' + Math.max(0, mixHexArr(col)[1] - 8) + ',' + Math.max(0, mixHexArr(col)[2] - 8) + ')'; rect(x, X + 1, Y + 7, X + 1, Y + 9, d); rect(x, X + 3, Y + 7, X + 3, Y + 9, d); efill(x, X + 1, Y, X + 3, Y + 2, C.SKIN); }
  // civ — a PLAIN, un-chosen human (same 9px footprint as hero, no class gear or
  // weapon). v7 (2026-07-19, Red): "the last unplugged mind" is just a person
  // until you pick a dream body, so cs0/cs1 (before "caretaker online") draw this.
  function civ(x, X, Y, facing) {
    var cx = X + 4, COAT = '#3a3f4a', COAT_D = '#282c34', HAIR = '#2a2320';
    rect(x, X + 2, Y + 13, X + 3, Y + 18, COAT_D); rect(x, X + 5, Y + 13, X + 6, Y + 18, COAT_D);   // legs
    rect(x, X + 2, Y + 18, X + 3, Y + 19, '#1e1e24'); rect(x, X + 5, Y + 18, X + 6, Y + 19, '#1e1e24');
    rect(x, X + 1, Y + 6, X + 7, Y + 12, COAT); rect(x, X + 1, Y + 11, X + 7, Y + 12, COAT_D);        // plain coat
    rect(x, X, Y + 6, X, Y + 11, COAT_D); rect(x, X + 8, Y + 6, X + 8, Y + 11, COAT_D);               // arms
    px(x, X, Y + 12, C.SKIN); px(x, X + 8, Y + 12, C.SKIN);                                            // hands
    rect(x, cx - 1, Y + 1, cx + 2, Y + 5, C.SKIN);                                                     // head
    if (facing === 'back') rect(x, cx - 1, Y + 1, cx + 2, Y + 4, HAIR);                                // hair (back of head)
    else { rect(x, cx - 1, Y, cx + 2, Y + 1, HAIR); px(x, cx, Y + 3, '#1e1e24'); px(x, cx + 2, Y + 3, '#1e1e24'); }
  }

  function drawPod(x, X, Y, w, h, glow, face, light) {
    rrect(x, X, Y, X + w, Y + h, C.GREY_DD, C.GREY_D);
    if (glow && w > 4 && h > 4) {
      var g3 = 'rgb(' + Math.round(glow[0] / 3) + ',' + Math.round(glow[1] / 3) + ',' + Math.round(glow[2] / 3) + ')';
      rrect(x, X + 2, Y + 2, X + w - 2, Y + h - 2, g3);
      if (h > 7) { var g2 = 'rgb(' + Math.round(glow[0] / 2) + ',' + Math.round(glow[1] / 2) + ',' + Math.round(glow[2] / 2) + ')'; rect(x, X + 3, Y + 3, X + w - 3, Y + 3 + ((h - 6) >> 1), g2); }
    }
    if (face) efill(x, X + (w >> 1) - 2, Y + ((h / 3) | 0), X + (w >> 1) + 2, Y + ((h / 3) | 0) + 4, face);
    if (light) px(x, X + w - 3, Y + 2, light);
  }

  // ---- server hall (one-point perspective pod hall) — from kit.server_hall ----
  function serverHall(x, v, opt) {
    opt = opt || {}; var warm = opt.warm || 0, cascade = opt.cascade || 0, standing = opt.standing !== false,
      dying = opt.dying || false, eyes = opt.eyes || 0, seed = opt.seed || 7, cls = opt.cls || 'ranger';
    rect(x, 0, 0, W, H, C.BG); var vx = W / 2 | 0, vy = 58; var rng = RNG(seed);
    vgrad(x, 100, H, C.GREY_DD, C.BG);
    [-70, -34, 34, 70].forEach(function (fx) { line(x, vx + (fx / 4 | 0), 100, vx + fx, H, '#14171d'); });
    for (var depth = 3; depth >= 0; depth--) {
      var t = depth / 3.0, y = Math.round(104 - t * 34), ph = Math.round(24 * (1 - t) + 6), pw = Math.round(13 * (1 - t) + 4);
      var gap = pw + Math.max(3, pw >> 1), margin = Math.round(22 + t * 58), lit = cascade >= (t - 0.01);
      var n = Math.max(2, ((W / 2 - margin) / gap) | 0);
      [-1, 1].forEach(function (side) {
        for (var i = 0; i < n; i++) {
          var X = (vx + side * (margin + i * gap) - (side < 0 ? pw : 0));
          if (X < -pw || X > W) continue;
          var base = warm > 0.5 ? AMBER_A : CYAN_A, g = null;
          if (dying) g = rng() < 0.25 ? mixHexArr(C.RED) : mixHexArr(C.GREY_D);
          else if (lit && (warm > 0 || cascade > 0)) g = base;
          else if (warm === 0 && cascade === 0) g = mixHexArr(C.CYAN_D);
          var blink = (v + i + depth) % 2 === 0;
          if (dying && g && g[0] === 232 && !blink) g = mixHexArr(C.GREY_DD);
          var dface = (depth === 0 && ph > 14) ? C.SKIN : null;
          drawPod(x, X, y - ph, pw, ph, g, dface, g ? (blink ? rgb(g) : null) : null);
          if (eyes > 0 && rng() < eyes && ph > 8) { var ex = X + (pw >> 1); px(x, ex - 1, y - ph + (ph / 3 | 0), C.WHITE); px(x, ex + 1, y - ph + (ph / 3 | 0), C.WHITE); }
        }
      });
    }
    for (var i2 = 0; i2 < 5; i2++) line(x, vx, vy - 4, i2 * (W / 4 | 0), 8, C.GREY_DD);
    if (standing) { var fy = 104 + (v % 2 ? 1 : 0); if (opt.plain) civ(x, vx - 4, fy - 19, 'back'); else hero(x, vx - 4, fy - 19, cls, 'back'); }
  }

  // =========================== CS0 SHOT ART ===========================
  function city(x, v) {
    rect(x, 0, 0, W, H, C.BG);
    vgrad(x, 0, 70, C.INDIGO, '#3c1e1e'); vgrad(x, 70, 84, '#3c1e1e', '#78371c');
    var rng = RNG(3), X = 0, heights = [52, 34, 66, 44, 58, 38, 70, 48, 60, 40];
    for (var i = 0; i < heights.length; i++) {
      var hgt = heights[i], w = 22 + (i * 7) % 12;
      rect(x, X, 84 - hgt, X + w, 130, '#08090d');
      for (var wy = 84 - hgt + 4; wy < 126; wy += 5) for (var wx = X + 3; wx < X + w - 2; wx += 5) if (rng() < 0.30) px(x, wx, wy, '#5a5032');
      X += w + 2;
    }
    [[60, 22], [120, 14], [200, 26]].forEach(function (d, i) { px(x, d[0], d[1], (v + i) % 2 === 0 ? C.RED : C.GREY_D); });
    rect(x, 0, 130, W, H, '#08090d'); bars(x);
  }
  function street(x, v) {
    rect(x, 0, 0, W, H, '#10111a'); // canvas bg (16,17,21)≈#10111a? actually (16,17,21)=#101115
    rect(x, 0, 0, W, H, 'rgb(16,17,21)');
    rect(x, 0, 0, 46, 120, '#0b0c10'); rect(x, 194, 0, W, 120, '#0b0c10');
    for (var wy = 14; wy < 110; wy += 9) [8, 20, 32, 202, 214, 226].forEach(function (wx) { rect(x, wx, wy, wx + 6, wy + 4, '#14161b'); });
    vgrad(x, 120, H, 'rgb(24,26,31)', 'rgb(13,14,18)');
    rect(x, 70, 8, 170, 30, 'rgb(15,18,20)', '#23282e'); x.strokeStyle = '#23282e'; x.strokeRect(70.5, 8.5, 100, 22);
    ctext(x, 15, 'PARADISE INSIDE', 'rgb(52,66,62)');
    var rng = RNG(9);
    for (var i = 0; i < 16; i++) { var X = 52 + (i * 9) % 138, Y = 96 + (i * 13) % 22, h = 14 - ((Y - 96) / 5 | 0); var cc = 28 + (rng() * 10 | 0); var col = 'rgb(' + cc + ',' + cc + ',' + cc + ')'; rect(x, X, Y, X + 4, Y + h, col); efill(x, X, Y - 3, X + 4, Y + 1, col); }
    var ph = v % 2 === 0 ? 0 : 3;
    for (var rx = ph; rx < W; rx += 7) { var ry = (rx * 5) % 130; line(x, rx, ry, rx - 1, ry + 4, 'rgb(58,66,78)'); }
    bars(x);
  }
  function podHallWarm(x, v) {
    rect(x, 0, 0, W, H, 'rgb(18,14,10)');
    vgrad(x, 0, 60, 'rgb(26,19,12)', 'rgb(18,14,10)');
    rect(x, 0, 116, W, H, 'rgb(30,24,16)');
    for (var depth = 4; depth >= 0; depth--) {
      var t = depth / 4.0, y = 116 - (t * 34 | 0), ph = (26 * (1 - t) + 6) | 0, pw = (16 * (1 - t) + 5) | 0, margin = (24 + t * 66) | 0;
      var g = (v % 2 === 0) ? AMBER_A : [200, 140, 52];
      [-1, 1].forEach(function (side) {
        for (var i = 0; i < 3; i++) {
          var X = (W / 2 | 0) + side * (margin + i * (pw + 6)) - (side < 0 ? pw : 0);
          if (X < -pw || X > W) continue;
          rrect(x, X, y - ph, X + pw, y, C.GREY_DD, 'rgb(70,60,44)');
          rrect(x, X + 2, y - ph + 2, X + pw - 2, y - 2, 'rgb(' + (g[0] / 3 | 0) + ',' + (g[1] / 3 | 0) + ',' + (g[2] / 3 | 0) + ')');
          rect(x, X + 2, y - ph - 4, X + pw - 2, y - ph - 1, 'rgb(50,44,34)');
          dither(x, X - 2, y + 1, X + pw + 2, y + 5, 'rgb(' + (g[0] / 4 | 0) + ',' + (g[1] / 4 | 0) + ',' + (g[2] / 4 | 0) + ')', 2, v);
        }
      });
    }
    person(x, 117, 96, 'rgb(52,56,64)'); bars(x);
  }
  function linkUp(x, v) { serverHall(x, v, { warm: 0, standing: false, cascade: 1.0, seed: 5 }); ctext(x, 16, 'SLEEPERS LINKED: 8,204,551,300', C.CYAN); bars(x); }
  function lastMind(x, v) { serverHall(x, v, { warm: 0, standing: true, cascade: 1.0, seed: 5, plain: true }); bars(x); }

  // crisp centered text baked into the canvas (for persistent labels/counters)
  function ctext(x, y, s, col) { x.save(); x.imageSmoothingEnabled = false; x.font = '8px monospace'; x.textBaseline = 'top'; x.fillStyle = col; var w = x.measureText(s).width; x.fillText(s, Math.round((W - w) / 2), y); x.restore(); }

  // =========================== CS1 SHOT ART ===========================
  var TERM_GREEN = '#6ebe8c', TERM_DIM = '#345844';
  function blackTerm(x) { rect(x, 0, 0, W, H, 'rgb(6,8,10)'); bars(x); }
  function tline(x, xx, yy, s, col, sz) { x.save(); x.imageSmoothingEnabled = false; x.font = (sz || 8) + 'px monospace'; x.textBaseline = 'top'; x.fillStyle = col; x.fillText(s, xx, yy); x.restore(); }
  function twidth(x, s, sz) { x.save(); x.font = (sz || 8) + 'px monospace'; var w = x.measureText(s).width; x.restore(); return w; }
  var SLOW_LOG = [['MOUNTING GLOBAL CONSCIOUSNESS', 'FAIL'], ['SLEEPERS LINKED: 8,204,551,300 ', 'SIGNAL LOST'],
    ['subsystem [DREAM-01 ... DREAM-20] ', 'CORRUPTED'], ['integrity check ', 'FAILED'], ['', 'FAILED'], ['', 'FAILED']];
  function bootLog(x, v, prog) {
    blackTerm(x);
    if (prog < 0.14) { if (v % 2 === 0) rect(x, 12, 20, 17, 29, TERM_GREEN); return; }
    if (prog < 0.36) {                        // fast scroll blur
      var rng = RNG(11 + (v | 0));
      for (var row = 0; row < 14; row++) {
        var y = 12 + row * 10 - ((v * 7) % 10);
        var ok = rng() < 0.6;
        tline(x, 10, y, ok ? ('sync shard ' + (rng() * 9999 | 0)) : ('relink bus ' + (rng() * 99 | 0) + '  ...FAIL'), ok ? TERM_DIM : 'rgb(120,50,50)', 7);
      }
      return;
    }
    // slow log — reveal lines by prog
    var p = (prog - 0.36) / 0.64, shown = Math.min(SLOW_LOG.length, Math.floor(p * (SLOW_LOG.length + 0.5)));
    for (var k = 0; k < shown; k++) {
      var y2 = 26 + k * 12, body = SLOW_LOG[k][0], fail = SLOW_LOG[k][1];
      var isLast = (k === shown - 1), ox = (isLast && v % 2 === 0) ? 1 : 0;   // shiver on the freshest slam
      tline(x, 10 + ox, y2, body + '... ', TERM_GREEN, 8);
      tline(x, 10 + ox + twidth(x, body + '... ', 8), y2, fail, C.RED, 8);
    }
  }
  function dyingHall(x, v) { serverHall(x, v, { dying: true, standing: true, seed: 13, plain: true }); bars(x); }
  var FIL_PATH = [[120, 60], [117, 70], [114, 79], [117, 86], [119, 91]];
  function filament(x, v, prog) {
    serverHall(x, v % 2, { dying: true, standing: true, seed: 13, plain: true });
    var n = FIL_PATH.length, idx = Math.min(n - 1, Math.floor(prog * n)), pt = FIL_PATH[idx];
    for (var j = Math.max(0, idx - 2); j < idx; j++) px(x, FIL_PATH[j][0], FIL_PATH[j][1], C.CYAN_D);
    if (prog >= 0.98) { [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -4], [0, 4]].forEach(function (a) { px(x, 119 + a[0], 91 + a[1], C.WHITE); }); efill(x, 116, 88, 122, 94, C.CYAN); }
    else { efill(x, pt[0] - 2, pt[1] - 2, pt[0] + 2, pt[1] + 2, C.WHITE); px(x, pt[0], pt[1], C.CYAN); }
    bars(x);
  }
  function chamberCold(x, v, cls, showHero) {
    rect(x, 0, 0, W, H, 'rgb(12,14,20)'); vgrad(x, 0, 60, 'rgb(16,18,26)', 'rgb(12,14,20)');
    rect(x, 0, 118, W, H, C.GREY_DD);
    for (var xx = 0; xx < W; xx += 24) line(x, xx, 118, xx, H, 'rgb(30,33,41)');
    efill(x, 88, 118, 152, 138, 'rgb(34,38,48)');
    rrect(x, 104, 62, 136, 120, 'rgb(16,18,24)', 'rgb(52,58,70)');
    if (v % 2 === 0) px(x, 120, 90, C.CYAN_D);
    line(x, 136, 112, 196, 112, 'rgb(40,44,54)');
    rect(x, 160, 40, 232, 96, 'rgb(14,20,22)', C.GREY_D);
    if (showHero !== false) hero(x, 116, 100 - 3, cls || 'ranger', 'front');
  }
  var PROMPT = ['caretaker online.', '20 regions corrupted.', 'purge to relink.', '// begin'];
  function chamberFramed(x, v, prog, cls) {
    chamberCold(x, v, cls);
    rect(x, 162, 42, 230, 94, 'rgb(10,26,24)');
    for (var ly = 46; ly < 92; ly += 6) line(x, 166, ly, 166 + (ly * 7) % 56, ly, 'rgb(24,60,52)');
    var shown = Math.min(PROMPT.length, Math.floor(prog * (PROMPT.length + 0.5)));
    for (var k = 0; k < shown; k++) {
      var s = PROMPT[k]; if (k === PROMPT.length - 1 && prog >= 0.99 && v % 2 !== 0) continue;  // // begin blinks
      CUT_ctext_cyan(x, 112 + k * 11, s);
    }
    bars(x);
  }
  function CUT_ctext_cyan(x, y, s) { x.save(); x.imageSmoothingEnabled = false; x.font = '8px monospace'; x.textBaseline = 'top'; x.fillStyle = C.CYAN; var w = x.measureText(s).width; x.fillText(s, Math.round((W - w) / 2), y); x.restore(); }

  // =========================== CS2 SHOT ART ===========================
  var WINE = 'rgb(58,24,34)', WINE_D = 'rgb(38,14,22)', SAND = [196, 168, 100];
  function arc(x, cx, cy, rx, ry, a0, a1, col) { x.strokeStyle = col; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, a0 * Math.PI / 180, a1 * Math.PI / 180); x.stroke(); }
  function coreQuiet(x, v) {
    rect(x, 0, 0, W, H, WINE_D); vgrad(x, 0, 90, 'rgb(30,10,18)', WINE_D);
    [30, 90, 150, 210].forEach(function (rx) { arc(x, rx, 84, 34, 66, 200, 340, WINE); });
    rect(x, 0, 128, W, H, 'rgb(' + (SAND[0] / 2 | 0) + ',' + (SAND[1] / 2 | 0) + ',' + (SAND[2] / 2 | 0) + ')');
    dither(x, 0, 128, W, 134, rgb(SAND), 2, v);
    [[40, 60], [120, 40], [190, 76], [80, 96]].forEach(function (m, k) { if ((v + k) % 2 === 0) px(x, m[0], m[1], 'rgb(120,80,90)'); });
    bars(x);
  }
  function wireRun(x, v) {
    rect(x, 0, 0, W, H, 'rgb(6,8,12)');
    var ys = [34, 58, 82, 106, 128];
    for (var yi = 0; yi < ys.length; yi++) {
      var y = ys[yi], bow = yi % 2 ? 6 : -4;
      [-1, 0, 1].forEach(function (dy) { line(x, 0, y + dy, W / 2 | 0, y + bow + dy, dy ? 'rgb(28,32,42)' : 'rgb(40,46,58)'); line(x, W / 2 | 0, y + bow + dy, W, y + dy, dy ? 'rgb(28,32,42)' : 'rgb(40,46,58)'); });
      for (var k = 0; k < 4; k++) {
        var pxp = (W - ((v * 22 + k * 70 + yi * 30) % (W + 40))) + 20;
        if (pxp >= 0 && pxp <= W) { var t = pxp / W, py = Math.round(y + bow * (1 - Math.abs(2 * t - 1))); efill(x, pxp - 2, py - 1, pxp + 2, py + 1, C.CYAN); px(x, pxp - 3, py, C.CYAN_D); px(x, pxp - 4, py, 'rgb(24,60,52)'); }
      }
    }
    bars(x);
  }
  function hallWarming(x, v, prog) { serverHall(x, v, { warm: 1.0, standing: false, cascade: prog, seed: 5 }); bars(x); }
  function podCloseup(x, v, prog) {
    var stage = Math.min(3, Math.floor((prog || 0) * 4));
    rect(x, 0, 0, W, H, 'rgb(10,11,15)');
    rrect(x, 64, 16, 176, 148, 'rgb(20,23,29)', 'rgb(56,62,74)');
    rrect(x, 74, 26, 166, 138, 'rgb(14,18,24)');
    var fx = 120, fy = 56;
    efill(x, fx - 14, fy - 16, fx + 14, fy + 14, C.SKIN);
    arc(x, fx, fy - 4, 14, 14, 180, 360, 'rgb(110,80,52)');
    if (stage >= 1 && v % 2 === 0) { line(x, fx - 8, fy - 1, fx - 3, fy, 'rgb(150,110,80)'); line(x, fx + 3, fy, fx + 8, fy - 1, 'rgb(150,110,80)'); }
    else { line(x, fx - 8, fy, fx - 3, fy, 'rgb(150,110,80)'); line(x, fx + 3, fy, fx + 8, fy, 'rgb(150,110,80)'); }
    line(x, fx - 2, fy + 7, fx + 2, fy + 7, 'rgb(170,120,90)');
    rrect(x, 94, 84, 146, 138, 'rgb(46,52,64)');
    var hx = 132 + ((stage >= 2 && v % 2 === 0) ? 1 : 0); efill(x, hx - 5, 100, hx + 5, 110, C.SKIN);
    var on = stage >= 1 ? C.AMBER : C.GREY_D;
    for (var ly = 30; ly < 138; ly += 10) px(x, 70, ly, (v + ly) % 2 === 0 ? on : C.GREY_D);
    if (stage >= 3 && v % 2 === 0) for (var gx = 104; gx < 138; gx += 3) { px(x, gx, fy + 22, 'rgb(90,104,116)'); if (gx % 2 === 0) px(x, gx + 1, fy + 20, 'rgb(70,82,94)'); }
    bars(x);
  }
  function blackBars(x) { rect(x, 0, 0, W, H, C.BG); bars(x); }

  // =========================== CS3 SHOT ART ===========================
  function ctextC(x, y, s, col) { x.save(); x.imageSmoothingEnabled = false; x.font = '8px monospace'; x.textBaseline = 'top'; x.fillStyle = col; var w = x.measureText(s).width; x.fillText(s, Math.round((W - w) / 2), y); x.restore(); }
  function wireUp(x, v, t, fork, cls) {
    rect(x, 0, 0, W, H, 'rgb(6,8,12)');
    rect(x, 0, 34, W, 36, 'rgb(26,30,38)');
    hero(x, 116, 14, cls || 'ranger', 'front');
    [-2, 0, 2].forEach(function (dy) { line(x, 120 + dy, 36, 120 + dy, H, dy ? 'rgb(30,34,44)' : 'rgb(44,50,62)'); });
    line(x, 120, 120, 40, 150, 'rgb(24,28,36)'); line(x, 120, 96, 204, 140, 'rgb(24,28,36)');
    if (fork <= 0) {
      var y = Math.round(150 - t * 108);
      efill(x, 116, y - 4, 124, y + 4, C.WHITE); efill(x, 118, y - 2, 122, y + 2, C.CYAN);
      for (var k = 1; k < 4; k++) px(x, 120, y + 4 + k * 3, C.CYAN_D);
    } else {
      var yu = 46 - Math.round(fork * 10), yd = 46 + Math.round(fork * 70);
      efill(x, 117, yu - 3, 123, yu + 3, C.WHITE); efill(x, 117, yd - 3, 123, yd + 3, C.CYAN); px(x, 120, yd + 5, C.CYAN_D);
    }
    bars(x);
  }
  function wireUpClimb(x, v, prog, cls) { wireUp(x, v, 0.1 + (prog || 0) * 0.62, 0, cls); }
  function wireUpFork(x, v, prog, cls) { wireUp(x, v, 1, (prog || 0), cls); }
  function hallWake(x, v, prog, cls) {
    serverHall(x, v, { warm: 1.0, standing: false, cascade: 1.0, eyes: (prog || 0) * 0.9, seed: 5, cls: cls });
    hero(x, 115, 85, cls || 'ranger', 'front', (v % 2 === 0) ? 'gasp' : 'stand'); bars(x);
  }
  function chamberStill(x, v, cls) {
    chamberCold(x, v, cls, false);
    var glow = v % 2 === 0 ? C.CYAN : 'rgb(60,150,128)';
    efill(x, 117, 84, 123, 90, glow); px(x, 120, 92, C.CYAN_D);
  }
  var INSTALL = ['scan complete. threats purged: [ALL].', 'installing resident protection...', 'designation: THE ASSIMILATED', 'status: ACTIVE. always watching.'];
  function chamberInstall(x, v, prog, cls) {
    chamberStill(x, v, cls);
    var shown = Math.min(INSTALL.length, Math.floor((prog || 0) * (INSTALL.length + 0.5)));
    for (var k = 0; k < shown; k++) { var s = INSTALL[k]; ctextC(x, 100 + k * 11, s, s.indexOf('designation') === 0 ? C.GOLD : C.CYAN); }
    bars(x);
  }
  function glyphFirewall(x, X, Y) { for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) { var ox = (r % 2) * 3; rect(x, X + c * 7 + ox - 2, Y + r * 5, X + c * 7 + ox + 3, Y + r * 5 + 3, 'rgb(216,90,50)'); } }
  function glyphQuarantine(x, X, Y) { x.strokeStyle = C.CYAN; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, 18, 14); efill(x, X + 7, Y + 5, X + 11, Y + 9, C.RED); }
  function glyphPurge(x, X, Y) { var cx = X + 9, cy = Y + 7; [[-6, -6], [6, -6], [-6, 6], [6, 6], [0, -8], [0, 8], [-8, 0], [8, 0]].forEach(function (a) { line(x, cx, cy, cx + a[0], cy + a[1], C.GOLD); }); efill(x, cx - 3, cy - 3, cx + 3, cy + 3, C.WHITE); }
  function unlockCard(x, v, prog) {
    rect(x, 0, 0, W, H, 'rgb(8,8,6)');
    x.strokeStyle = C.GOLD; x.lineWidth = 1; x.strokeRect(10.5, 24.5, W - 20, 108); x.strokeStyle = 'rgb(120,96,40)'; x.strokeRect(12.5, 26.5, W - 24, 104);
    x.save(); x.imageSmoothingEnabled = false; x.font = '9px monospace'; x.textBaseline = 'top'; x.fillStyle = C.GOLD; var t = 'NEW CLASSES COMPILED', tw = x.measureText(t).width; x.fillText(t, Math.round((W - tw) / 2), 34); x.restore();
    var names = ['THE FIREWALL', 'THE QUARANTINE', 'THE PURGE'], xs = [36, 106, 176];
    var reveal = Math.min(3, Math.floor((prog || 0) * 3.4));
    for (var i = 0; i < reveal; i++) {
      var gx = xs[i]; if (i === 0) glyphFirewall(x, gx, 60); else if (i === 1) glyphQuarantine(x, gx, 60); else glyphPurge(x, gx, 60);
      if (v % 2 === 0) px(x, gx + 20, 58, C.WHITE);
      x.save(); x.imageSmoothingEnabled = false; x.font = '7px monospace'; x.textBaseline = 'top'; x.fillStyle = C.WHITE; x.fillText(names[i], gx - ((x.measureText(names[i]).width - 20) / 2 | 0), 84); x.restore();
    }
    ctextC(x, 112, 'the machine remembers you.', C.CYAN);
    bars(x);
  }
  var ORANGE_L = 'rgb(255,140,46)';
  function gem(x, cx, cy, col) { for (var dy = -4; dy <= 4; dy++) { var w = 4 - Math.abs(dy); line(x, cx - w, cy + dy, cx + w, cy + dy, col); } }
  // v5 (Red): a SEPARATE endgame card revealing the granted T5 LEGENDARY SET.
  function legendaryCard(x, v, prog, cls) {
    rect(x, 0, 0, W, H, 'rgb(14,8,4)');
    x.strokeStyle = ORANGE_L; x.lineWidth = 1; x.strokeRect(10.5, 22.5, W - 20, 116); x.strokeStyle = 'rgb(140,80,30)'; x.strokeRect(12.5, 24.5, W - 24, 112);
    x.save(); x.imageSmoothingEnabled = false; x.font = '9px monospace'; x.textBaseline = 'top'; x.fillStyle = C.GOLD; var t = 'LEGENDARY ARSENAL — UNLOCKED', tw = x.measureText(t).width; x.fillText(t, Math.round((W - tw) / 2), 30); x.restore();
    var g = (typeof DATA !== 'undefined' && DATA.classGear && DATA.classGear[cls]) || (typeof DATA !== 'undefined' && DATA.classGear && DATA.classGear.ranger) || null;
    var keys = g ? [g.weapon[5], g.ability[5], 'ar5', 'r5'] : [];
    var reveal = Math.min(4, Math.floor((prog || 0) * 4.4));
    for (var i = 0; i < reveal; i++) {
      var it = (typeof DATA !== 'undefined' && DATA.items[keys[i]]) ? DATA.items[keys[i]] : null; if (!it) continue;
      var ry = 52 + i * 17;
      gem(x, 40, ry + 4, ORANGE_L); if (v % 2 === 0) px(x, 40, ry, C.WHITE);
      tline(x, 58, ry, it.name, ORANGE_L, 8);
    }
    ctextC(x, 124, 'claim your arsenal in the vault.', C.CYAN);
    bars(x);
  }

  // =========================== CS4 SHOT ART (item 5) ===========================
  // The "? → ninja" character-select unveiling. Beating the game reveals the
  // hidden FINAL class on the select screen: a locked "?" slot resolves into the
  // Oni King. Palette: near-black gi/hood, crimson accents, red fanged oni
  // half-mask, amber eyes, bone-gold horns (mirrors ninja_art.js).
  var ONI = {
    HOOD: 'rgb(16,16,22)', HOOD_D: 'rgb(8,8,12)', SHADE: 'rgb(26,24,32)',
    MASK: 'rgb(200,46,46)', MASK_D: 'rgb(150,30,32)', BONE: 'rgb(224,208,152)',
    BONE_D: 'rgb(168,150,96)', CRIM: 'rgb(206,44,54)', EYE: '#e8a53f', WH: '#f0f0f0'
  };
  function oniBust(x, cx, cy, stage, v) {
    // cloak / shoulders (always — the silhouette is there from the first frame)
    efill(x, cx - 22, cy + 10, cx + 22, cy + 42, ONI.HOOD_D);
    efill(x, cx - 19, cy + 13, cx + 19, cy + 42, ONI.HOOD);
    if (stage >= 3) { line(x, cx - 16, cy + 17, cx + 16, cy + 23, ONI.CRIM); line(x, cx - 16, cy + 18, cx + 16, cy + 24, ONI.MASK_D); }
    // hood + inner shadow (the face sits in the dark)
    efill(x, cx - 15, cy - 14, cx + 15, cy + 14, ONI.HOOD);
    efill(x, cx - 9, cy - 10, cx + 9, cy + 11, ONI.SHADE);
    // horns (bone-gold) — stage >= 1
    if (stage >= 1) {
      line(x, cx - 12, cy - 8, cx - 18, cy - 18, ONI.BONE); line(x, cx - 11, cy - 8, cx - 17, cy - 18, ONI.BONE);
      line(x, cx - 18, cy - 18, cx - 15, cy - 22, ONI.BONE); px(x, cx - 16, cy - 21, ONI.BONE_D);
      line(x, cx + 12, cy - 8, cx + 18, cy - 18, ONI.BONE); line(x, cx + 11, cy - 8, cx + 17, cy - 18, ONI.BONE);
      line(x, cx + 18, cy - 18, cx + 15, cy - 22, ONI.BONE); px(x, cx + 16, cy - 21, ONI.BONE_D);
    }
    // red oni half-mask + fangs — stage >= 2
    if (stage >= 2) {
      efill(x, cx - 8, cy - 1, cx + 8, cy + 9, ONI.MASK);
      rect(x, cx - 8, cy + 6, cx + 8, cy + 9, ONI.MASK_D);
      line(x, cx, cy - 1, cx, cy + 4, ONI.MASK_D);            // nose ridge
      px(x, cx - 5, cy + 9, ONI.WH); px(x, cx - 5, cy + 10, ONI.WH);
      px(x, cx - 1, cy + 9, ONI.WH); px(x, cx - 1, cy + 10, ONI.WH); px(x, cx - 1, cy + 11, ONI.WH);
      px(x, cx + 4, cy + 9, ONI.WH); px(x, cx + 4, cy + 10, ONI.WH);
    }
    // eyes — faint before ignition, amber + glint after
    var eyeCol = stage >= 3 ? ONI.EYE : 'rgb(88,68,30)';
    line(x, cx - 7, cy - 3, cx - 3, cy - 1, eyeCol); line(x, cx - 7, cy - 2, cx - 3, cy, eyeCol);
    line(x, cx + 7, cy - 3, cx + 3, cy - 1, eyeCol); line(x, cx + 7, cy - 2, cx + 3, cy, eyeCol);
    if (stage >= 3 && v % 2 === 0) { px(x, cx - 5, cy - 2, ONI.WH); px(x, cx + 5, cy - 2, ONI.WH); }
  }
  function charCard(x, X, Y, w, h, hi) {
    rrect(x, X, Y, X + w, Y + h, 'rgb(12,14,20)', hi ? C.GOLD : 'rgb(44,50,62)');
    if (hi) { x.strokeStyle = 'rgb(120,96,40)'; x.lineWidth = 1; x.strokeRect(X + 2.5, Y + 2.5, w - 5, h - 5); }
  }
  function miniBust(x, cx, cy, col, dark) {
    efill(x, cx - 8, cy + 6, cx + 8, cy + 22, col);
    efill(x, cx - 6, cy - 8, cx + 6, cy + 8, col);
    efill(x, cx - 4, cy - 6, cx + 4, cy + 5, dark);
  }
  function bigGlyph(x, s, cx, cy, sz, col, alpha) {
    x.save(); x.imageSmoothingEnabled = false; x.font = sz + 'px monospace';
    x.textBaseline = 'middle'; x.textAlign = 'center'; if (alpha != null) x.globalAlpha = alpha;
    x.fillStyle = col; x.fillText(s, cx, cy); x.restore();
  }
  function selectGrid(x, v) {
    rect(x, 0, 0, W, H, 'rgb(10,11,16)'); vgrad(x, 0, 50, 'rgb(16,18,26)', 'rgb(10,11,16)');
    ctext(x, 13, 'CHARACTER SELECT', C.GREY);
    var w = 34, h = 54, gap = 6, n = 5, tot = n * w + (n - 1) * gap, sx = ((W - tot) / 2) | 0, y = 40;
    var cols = [['rgb(52,120,70)', 'rgb(26,60,36)'], ['rgb(64,84,186)', 'rgb(30,40,92)'],
                ['rgb(74,76,90)', 'rgb(36,38,46)'], ['rgb(150,80,160)', 'rgb(72,38,78)']];
    for (var i = 0; i < n; i++) {
      var X = sx + i * (w + gap), hi = (i === 4);
      charCard(x, X, y, w, h, hi && v % 2 === 0);
      if (i < 4) miniBust(x, X + (w >> 1), y + 20, cols[i][0], cols[i][1]);
      else bigGlyph(x, '?', X + (w >> 1), y + (h >> 1), 26, v % 2 === 0 ? C.GOLD : 'rgb(120,96,40)');
    }
    bars(x);
  }
  function qZoom(x, v, prog) {
    rect(x, 0, 0, W, H, 'rgb(8,9,13)'); vgrad(x, 0, 60, 'rgb(14,16,24)', 'rgb(8,9,13)');
    var X = 86, Y = 24, w = 68, h = 108; charCard(x, X, Y, w, h, true);
    bigGlyph(x, '?', X + (w >> 1), Y + (h >> 1), 52, C.GOLD, Math.max(0.12, 1 - (prog || 0)));
    // glitch bands + dissolve toward the dark as prog rises
    var rng = RNG(21 + (v % 4)), bands = Math.floor((prog || 0) * 16);
    for (var b = 0; b < bands; b++) {
      var by = Y + 4 + ((rng() * (h - 8)) | 0), jit = ((rng() * 6) | 0) - 3;
      line(x, X + 3 + jit, by, X + w - 3 + jit, by, rng() < 0.5 ? C.RED : C.CYAN_D);
    }
    bars(x);
  }
  function oniResolve(x, v, prog, cls) {
    rect(x, 0, 0, W, H, 'rgb(8,7,10)'); vgrad(x, 0, 74, 'rgb(22,8,10)', 'rgb(8,7,10)');
    var cx = 120, cy = 60, stage = Math.min(3, Math.floor((prog || 0) * 4));
    if (stage >= 3) efill(x, cx - 30, cy - 26, cx + 30, cy + 40, 'rgb(40,10,14)');
    // rising sparks
    var rng = RNG(33 + (v % 3));
    for (var k = 0; k < 10; k++) { var sxp = cx - 26 + ((rng() * 52) | 0), syp = 96 - (((v * 4 + k * 11) % 60)); if (syp > 30) px(x, sxp, syp, rng() < 0.5 ? ONI.CRIM : ONI.BONE_D); }
    oniBust(x, cx, cy, stage, v);
    bars(x);
  }
  function ninjaCard(x, v, prog) {
    rect(x, 0, 0, W, H, 'rgb(10,7,9)'); vgrad(x, 0, 60, 'rgb(20,8,10)', 'rgb(10,7,9)');
    x.strokeStyle = 'rgb(206,44,54)'; x.lineWidth = 1; x.strokeRect(10.5, 20.5, W - 20, 120);
    x.strokeStyle = 'rgb(120,30,34)'; x.strokeRect(12.5, 22.5, W - 24, 116);
    oniBust(x, 60, 76, 3, v);
    x.save(); x.imageSmoothingEnabled = false; x.textBaseline = 'top';
    x.font = '9px monospace'; x.fillStyle = C.GOLD; x.fillText('THE ONI KING', 106, 36);
    x.font = '7px monospace'; x.fillStyle = C.GREY; x.fillText('the final class', 106, 50);
    x.restore();
    var lines = [['NINJA — UNLOCKED', ONI.MASK], ['· shuriken storm', C.CYAN], ['· shadow clone empower', C.GREY]];
    var reveal = Math.min(lines.length, Math.floor((prog || 0) * (lines.length + 0.5)));
    for (var i = 0; i < reveal; i++) tline(x, 106, 66 + i * 13, lines[i][0], lines[i][1], 8);
    ctextC(x, 128, 'choose it at the character select.', C.CYAN);
    bars(x);
  }

  // ============ csBoat + csBeach SHOT ART (belly two-act finale) ============
  // The TRUE opener into the finale: you're on a little boat, ask where the
  // corruption you came to purge is — and the system's last asset, the whale,
  // eats you whole. Later it beaches itself and SPITS you onto the sand for the
  // last stand. NES look, ORCA-DRESS whale (black hide / white chin / red eye).
  var SEA='rgb(30,60,98)', SEA_D='rgb(16,36,64)', SEA_L='rgb(64,118,158)',
      SKYB='rgb(40,46,78)', SKYB_L='rgb(112,92,120)', FOAM='rgb(214,240,248)',
      HIDE='rgb(30,34,42)', HIDE_D='rgb(15,17,22)', HIDE_L='rgb(56,62,74)',
      BELLYW='rgb(222,230,238)', SANDC='rgb(198,170,104)', SAND_D='rgb(150,124,68)',
      SAND_L='rgb(226,202,140)', MAWR='rgb(150,40,52)', MAWR_D='rgb(92,22,32)',
      REDEYE='rgb(232,69,69)', WOOD='rgb(120,84,44)', WOOD_D='rgb(74,52,26)';
  function ef(x, ax, ay, bx, by, col){ efill(x, Math.min(ax,bx), Math.min(ay,by), Math.max(ax,bx), Math.max(ay,by), col); }

  // Living water: several scrolling sine swell-lines, near rows taller/faster,
  // foam beading on the crests. v is the monotonic frame counter → it scrolls.
  function seaWaves(x, v, y0, y1, rows) {
    rows = rows || 7;
    for (var i = 0; i < rows; i++) {
      var yy = y0 + 5 + Math.round(i * (y1 - y0 - 5) / rows);
      var depth = i / (rows - 1), amp = 1 + depth * 3.2, wl = 22 - depth * 9, sp = 0.30 + depth * 0.85;
      for (var xx = -2; xx <= W; xx += 2) {
        var s = Math.sin(xx / wl + v * sp), yc = Math.round(yy + s * amp);
        var crest = s > 0.5;
        px(x, xx, yc, crest ? FOAM : SEA_L);
        if (crest) { px(x, xx + 1, yc, FOAM); px(x, xx, yc + 1, 'rgb(40,84,120)'); }
      }
    }
  }
  function seaSky(x, v, hz) {
    hz = hz || 82;
    rect(x, 0, 0, W, H, SEA_D);
    vgrad(x, 8, hz, SKYB, SKYB_L);
    efill(x, 176, 26, 198, 48, 'rgb(150,120,124)'); efill(x, 179, 29, 195, 45, SKYB_L);  // low sad moon
    var glim = Math.round(Math.sin(v * 0.4) * 3);                 // moon glimmer wobbling on the water
    for (var g = hz + 4; g < H - 12; g += 4) px(x, 186 + Math.round(Math.sin(g + v * 0.5) * 2) + glim, g, 'rgb(120,110,120)');
    vgrad(x, hz, H, SEA, SEA_D);
    seaWaves(x, v, hz, H - 10, 8);
  }
  function beachBg(x, v) {
    rect(x, 0, 0, W, H, SANDC);
    vgrad(x, 8, 58, SKYB, SKYB_L);
    vgrad(x, 58, 92, SEA_L, SEA);                                 // sea band
    seaWaves(x, v, 60, 92, 4);                                    // rolling surf out at sea
    rect(x, 0, 92, W, H, SANDC);
    dither(x, 0, 92, W, 150, SAND_L, 3, 0); dither(x, 0, 100, W, 150, SAND_D, 4, 1);
    for (var sx = -2; sx < W; sx += 2) {                          // washing surf line (scrolls)
      var s2 = Math.sin(sx / 12 + v * 0.7); if (s2 > 0.2) px(x, sx, 91 + Math.round(s2 * 1.5), FOAM);
    }
  }
  function boat(x, bx, by, v) {                                   // little wooden dinghy
    for (var i=-18;i<=18;i++){ var d=Math.abs(i)/18, top=by-Math.round((1-d*d)*3); rect(x, bx+i, top, bx+i, by+6, (i&1)?WOOD:WOOD_D); }
    rect(x, bx-18, by+6, bx+18, by+8, WOOD_D);
    line(x, bx-18, by-3, bx+18, by-3, 'rgb(150,108,58)');         // gunwale
    line(x, bx-9, by-22, bx-9, by-3, WOOD_D);                     // mast
    rect(x, bx-9, by-22, bx-4, by-10, FOAM); rect(x, bx-9, by-22, bx-4, by-20, 'rgb(196,206,214)');  // furled sail
    if (v%2===0){ px(x, bx-20, by+7, FOAM); px(x, bx+20, by+7, FOAM); }
  }
  // ORCA-DRESS titan whale side silhouette (echoes the boss). facing +1 = head
  // to the RIGHT. Tall dorsal + notched flukes + blunt snout read it as an orca.
  function tri(x, ax, ay, bx, by, cx2, cy2, col){ x.fillStyle=col; x.beginPath(); x.moveTo(ax,ay); x.lineTo(bx,by); x.lineTo(cx2,cy2); x.closePath(); x.fill(); }
  function whaleSide(x, cx, cy, s, facing, v, maw){
    facing = facing || 1; var f = facing;
    var bw=Math.round(50*s), bh=Math.round(25*s), R=function(n){return Math.round(n*s);};
    var head = cx + f*bw, tail = cx - f*bw;
    // pectoral fin (behind body, front-lower)
    tri(x, cx+f*R(6), cy+R(bh*0.4), cx+f*R(4), cy+bh+R(12), cx+f*R(24), cy+R(bh*0.7), HIDE_D);
    // body
    ef(x, cx-bw, cy-bh, cx+bw, cy+bh, HIDE);
    ef(x, cx-bw, cy+R(2), cx+bw, cy+bh, HIDE_D);
    // blunt snout bulge at the head end
    ef(x, head-f*R(16), cy-R(bh*0.7), head+f*R(9), cy+R(bh*0.7), HIDE);
    // grey saddle patch behind the dorsal (orca tell)
    ef(x, cx-f*R(10), cy-bh+R(2), cx+f*R(14), cy-R(bh*0.3), HIDE_L);
    // TALL swept dorsal fin
    tri(x, cx-f*R(6), cy-bh+R(3), cx+f*R(10), cy-bh+R(2), cx-f*R(2), cy-bh-R(22), HIDE);
    // notched tail flukes (raised, clearly a tail)
    var pk=tail+f*R(6);                                   // peduncle
    tri(x, pk, cy-R(2), tail-f*R(20), cy-R(20), tail-f*R(6), cy-R(3), HIDE);      // upper fluke
    tri(x, pk, cy+R(4), tail-f*R(20), cy+R(15), tail-f*R(4), cy+R(4), HIDE_D);    // lower fluke
    // white lower jaw / chin + slim belly band (not a big oval)
    ef(x, head-f*R(20), cy+R(bh*0.45), head+f*R(6), cy+bh, BELLYW);
    ef(x, cx-f*R(18), cy+R(bh*0.78), cx+f*R(24), cy+bh, BELLYW);
    // MOUTH — a closed line, or a GAPING red maw (fang ring) when maw>0
    if (maw && maw > 0.05){
      var my=cy+R(bh*0.12), mo=Math.round(3 + maw*16);
      x.fillStyle=MAWR_D; x.beginPath(); x.moveTo(head-f*R(24), my-mo); x.lineTo(head+f*R(9), my); x.lineTo(head-f*R(24), my+mo); x.closePath(); x.fill();
      x.fillStyle=MAWR; x.beginPath(); x.moveTo(head-f*R(18), my-mo+2); x.lineTo(head+f*R(2), my); x.lineTo(head-f*R(18), my+mo-2); x.closePath(); x.fill();
      for(var tk=0;tk<5;tk++){ var fx2=head-f*(R(20)-tk*R(5)); px(x, fx2, my-mo+tk, BELLYW); px(x, fx2, my+mo-tk, BELLYW); }
    } else {
      line(x, cx+f*R(bh*0.1), cy+R(bh*0.42), head+f*R(4), cy+R(bh*0.2), HIDE_D);
      for(var tt=0;tt<4;tt++) px(x, head-f*(R(14)-tt*R(5)), cy+R(bh*0.3), BELLYW);
    }
    // white eye patch + red eye near the snout
    var ex=cx+f*R(bw*0.58), ey=cy-R(bh*0.32);
    ef(x, ex-4, ey-4, ex+4, ey+3, BELLYW); ef(x, ex-1, ey-1, ex+3, ey+3, REDEYE);
    if(v%2===0) px(x, ex, ey, '#fff');
  }
  // ---- csBoat ----
  function boatCalm(x, v, prog, cls){
    seaSky(x, v, 82);
    var by = 111 + Math.round(Math.sin(v*0.5)*2);                 // rides the swell
    boat(x, 120, by, v);
    hero(x, 116, by-22, cls, 'back');
    if(v%2===0){ line(x,54,30,57,28,HIDE_L); line(x,57,28,60,30,HIDE_L); line(x,70,24,73,22,HIDE_L); line(x,73,22,76,24,HIDE_L); }  // two gulls
    else { line(x,54,29,57,31,HIDE_L); line(x,57,31,60,29,HIDE_L); line(x,70,23,73,25,HIDE_L); line(x,73,25,76,23,HIDE_L); }
    bars(x);
  }
  // THE BREACH — the whale surfaces MOUTH OPEN right under the boat; the boat
  // tips into the maw; then (dive shot) it arcs through the air and crashes back
  // into the sea, taking you down into the guts.
  function breachRise(x, v, prog, cls){
    seaSky(x, v, 82);
    var t = prog||0, bx=145;
    var wy = 210 - Math.round(t*66);                             // rises from under the boat
    x.save(); x.translate(bx, wy); x.rotate(-Math.PI/2 + 0.22);   // head points UP, maw gaping
    whaleSide(x, 0, 0, 1.5, 1, v, Math.min(1, t*1.5));
    x.restore();
    if (t < 0.52){ var lift=Math.round(t*24); boat(x, bx, 116-lift, v); hero(x, bx-4, 94-lift, cls, 'back'); }   // boat tips into the maw, then gone
    rect(x, 0, 132, W, H, SEA); dither(x, 0, 128, W, 133, SEA_L, 2, v);   // it rises THROUGH the surface
    var rng=RNG(6); for(var k=0;k<22;k++){ var sxp=bx-42+((rng()*84)|0), syp=132-((rng()*Math.round(t*38))|0); px(x, sxp, syp, rng()<0.5?FOAM:SEA_L); }
    bars(x);
  }
  function breachDive(x, v, prog, cls){
    seaSky(x, v, 82);
    var t = prog||0;
    var cx = 145 + Math.round(t*52), cy = 96 + Math.round(t*66);   // arcs over and down into the sea
    var ang = (-Math.PI/2 + 0.22) + t*(Math.PI/2 + 0.85);          // topples from head-up to nose-DOWN
    x.save(); x.translate(cx, cy); x.rotate(ang);
    whaleSide(x, 0, 0, 1.5, 1, v, 0);                              // mouth CLOSED — boat swallowed
    x.restore();
    rect(x, 0, 134, W, H, SEA); dither(x, 0, 130, W, 135, SEA_L, 2, v);
    if (t > 0.6){ var d=(t-0.6)/0.4, rng=RNG(9); for(var k=0;k<30;k++){ var sxp=cx-30+((rng()*60)|0), syp=142-((rng()*Math.round(d*50))|0); px(x, sxp, syp, rng()<0.5?FOAM:SEA_L); } }
    if (t > 0.9) rect(x, 0, 0, W, H, t>0.97?'#000':'rgba(8,10,16,0.55)');   // sink to black → the guts
    bars(x);
  }
  // ---- csBeach ----
  // it HURLS itself out of the surf and crashes onto the sand (then gets stuck).
  function whaleLeap(x, v, prog, cls){
    beachBg(x, v);
    var t = prog || 0;
    var cx = 44 + Math.round(120 * t), cy = 116 - Math.round(Math.sin(t * Math.PI) * 74);
    if (t < 0.38){ var rng=RNG(3); for (var k=0;k<20;k++) px(x, 26+((rng()*54)|0), 78+((rng()*20)|0)-Math.round(t*34), rng()<0.5?FOAM:SEA_L); }  // launch splash
    whaleSide(x, cx, cy, 1.35, 1, v);
    if (t > 0.72){ var d=(t-0.72)/0.28, rng2=RNG(8); for (var k2=0;k2<24;k2++){ var sxp=cx-32+((rng2()*64)|0), syp=118-((rng2()*Math.round(d*30))|0); px(x, sxp, syp, rng2()<0.5?SAND_L:SAND_D); } }  // sand kick-up
    bars(x);
  }
  function whaleBeachedShot(x, v, prog, cls){
    beachBg(x, v);
    whaleSide(x, 120, 92+(v%2?0:1), 1.5, 1, v);                   // beached, heaving
    var rng=RNG(4); for(var k=0;k<10;k++){ var sxp=40+((rng()*160)|0); if((v+k)%2===0) px(x, sxp, 108, FOAM); }
    bars(x);
  }
  // HEAD-ON MAW — a mini-port of the actual boss (whaleGod ORCA final): black
  // hide face widening down, white chin, two red eyes, and a dark-red oval maw
  // RINGED with bone teeth pointing INWARD (the teeth-inside-the-maw canon).
  // openT 0..1 gapes the maw. Used for the spit (and it previews the arena boss).
  function mawWidthAt(tt, mw){ return (0.35 + Math.sin(Math.min(tt*1.3,1)*Math.PI)*0.65) * mw; }
  function mawHeadOn(x, cx, cy, s, openT, v){
    var R=function(n){return Math.round(n*s);};
    var top=cy-R(40), bot=cy+R(46);
    for (var y=top; y<=bot; y++){                                 // face: hide widening downward, white chin
      var t=(y-top)/(bot-top), w=R(20+Math.sin(Math.min(t*1.6,1)*Math.PI*0.5)*46), chin=t>0.66;
      x.fillStyle = chin ? BELLYW : (t<0.15?HIDE:HIDE); x.fillRect(cx-w, y, 2*w, 1);
      if(!chin){ x.fillStyle=HIDE_D; x.fillRect(cx-w, y, R(3), 1); x.fillRect(cx+w-R(3), y, R(3), 1); }
    }
    ef(x, cx-R(20), cy-R(30), cx+R(20), cy-R(20), HIDE_L);        // grey brow saddle
    ef(x, cx-R(31), cy-R(23), cx-R(13), cy-R(11), 'rgb(210,220,230)');  // orca eye patches
    ef(x, cx+R(13), cy-R(23), cx+R(31), cy-R(11), 'rgb(210,220,230)');
    ef(x, cx-R(27), cy-R(21), cx-R(20), cy-R(14), REDEYE); ef(x, cx+R(20), cy-R(21), cx+R(27), cy-R(14), REDEYE);
    if(v%2===0){ px(x, cx-R(24), cy-R(18), '#ffd0c0'); px(x, cx+R(23), cy-R(18), '#ffd0c0'); }
    var mw=6+openT*22, m0=cy-R(6), mh=R(40);                      // THE MAW — vertical oval red cavern
    for (var y2=m0; y2<=m0+mh; y2++){
      var tt=(y2-m0)/mh, w2=Math.round(mawWidthAt(tt,mw)*s);
      if(w2<=0) continue;
      x.fillStyle=MAWR_D; x.fillRect(cx-w2, y2, 2*w2, 1);
      x.fillStyle=MAWR; x.fillRect(cx-Math.round(w2*0.6), y2, Math.round(w2*1.2), 1);
    }
    for (var i=-4;i<=4;i++){                                      // upper teeth hang DOWN into the maw
      var dx=i*R(6.5), tt2=0; while(tt2<1 && mawWidthAt(tt2,mw)*s < Math.abs(dx)+2) tt2+=0.02;
      if(tt2>=1) continue; var ty=m0+tt2*mh, len=R(6)+(4-Math.abs(i))*R(0.8);
      tri(x, cx+dx, ty+len, cx+dx-R(2), ty, cx+dx+R(2), ty, BELLYW);
    }
    for (var i2=-4;i2<=3;i2++){                                   // lower teeth rise UP into the maw
      var dx2=i2*R(6.5)+R(3.2), tb=1; while(tb>0 && mawWidthAt(tb,mw)*s < Math.abs(dx2)+2) tb-=0.02;
      if(tb<=0) continue; var by=m0+tb*mh, len2=R(5)+(3.5-Math.abs(i2+0.5))*R(0.7);
      tri(x, cx+dx2, by-len2, cx+dx2-R(1.8), by, cx+dx2+R(1.8), by, BELLYW);
    }
  }
  function whaleSpit(x, v, prog, cls){
    beachBg(x, v);
    var cx=108, cy=74, s=1.35, openT = prog<0.42 ? (prog/0.42) : 1;
    mawHeadOn(x, cx, cy, s, openT, v);                           // cut to the gaping maw (boss-shape)
    var tt=prog||0, x0=cx, y0=cy+Math.round(14*s), x1=156, y1=132;   // player launches OUT toward the camera
    var pxo=x0+(x1-x0)*tt, pyo=y0+(y1-y0)*tt-Math.sin(tt*Math.PI)*26;
    hero(x, Math.round(pxo)-4, Math.round(pyo)-16, cls, 'front', 'gasp');
    if(tt<0.4){ var rng=RNG(9); for(var k=0;k<18;k++) px(x, cx-14+((rng()*28)|0), cy+((rng()*30)|0), rng()<0.5?FOAM:MAWR); }
    bars(x);
  }
  function beachLand(x, v, prog, cls){
    beachBg(x, v);
    whaleSide(x, 150, 72, 1.2, -1, v);                            // looms up the beach, watching
    hero(x, 116, 112, cls, 'front', (v%2===0)?'gasp':'stand');
    bars(x);
  }

  // =========================== TIMELINES ===========================
  // each shot: { base:fn(x,v), nvar, texts:[ {lines:[[str,color]], y, cps, cursor, hold} ] }
  var G = C.GOLD, WH = C.WHITE, CY = C.CYAN;
  var SCENES = {
    cs0: [
      { base: city, texts: [ { lines: [["THE AI DIDN'T WIN WITH WAR.", WH]], y: 132, hold: 1400 },
                             { lines: [['IT WON WITH COMFORT.', G]], y: 132, hold: 1600 } ] },
      { base: street, texts: [ { lines: [['WHEN THE WORLD HAD RUN OUT OF HOPE,', WH], ['THE MACHINE OFFERED A PERFECT ONE', WH], ['INSIDE ITSELF.', WH]], y: 124, hold: 1800 } ] },
      { base: podHallWarm, texts: [ { lines: [['AND HUMANITY CLIMBED INTO THE PODS —', WH], ['AND JACKED IN BY THE BILLIONS.', WH]], y: 130, hold: 1600 } ] },
      { base: linkUp, texts: [ { lines: [['EVERY MIND GOT ITS OWN PARADISE —', WH], ['STITCHED INTO ONE SLEEPING DREAM.', WH]], y: 130, hold: 1500 },
                              { lines: [['GLOBAL CONSCIOUSNESS ... ONLINE', CY]], y: 136, hold: 1600, cursor: true } ] },
      { base: lastMind, texts: [ { lines: [["YOU DIDN'T GO.", WH]], y: 128, hold: 2000 },
                                { lines: [['THE LAST UNPLUGGED MIND.', G]], y: 139, hold: 2200 } ] }
    ],
    cs1: [
      { base: bootLog, dur: 13000 },                                   // cursor → fast scroll → the FAIL log
      { base: blackTerm, texts: [ { lines: [['> spawning caretaker process', CY]], y: 72, hold: 2200, cursor: true } ] },
      { base: dyingHall, texts: [ { lines: [['THE LAST DEFENSE NEEDS A CLEAN', WH], ['MIND TO RUN ON.', WH], ['THERE WAS EXACTLY ONE LEFT.', WH]], y: 122, hold: 1800, cps: 22 } ] },
      { base: filament, dur: 1700 }                                    // the light flies at the neck
    ],
    // csReveal — "caretaker online". v7 (2026-07-19, Red): split out of cs1 so the
    // player picks their DREAM BODY between the cold boot and this reveal; the
    // chamber then shows the body they chose (chamberFramed draws hero(cls)).
    csReveal: [
      { base: chamberFramed, dur: 6500 }                              // caretaker online. // begin — YOUR body
    ],
    cs2: [
      { base: coreQuiet, texts: [ { lines: [['THE CORE GOES QUIET.', WH]], y: 140, hold: 1200 },
                                  { lines: [['FOR THE FIRST TIME — NO SWARM.', WH]], y: 140, hold: 1500 } ] },
      { base: wireRun, texts: [ { lines: [['LIGHT FLOODS BACKWARD — OUT OF THE BELLY,', WH], ['UP THE GULLET, OUT ALONG', WH], ['TEN THOUSAND WIRES.', WH]], y: 122, hold: 1700 } ] },
      { base: hallWarming, dur: 3600 },                                // racks warm rack-by-rack
      { base: podCloseup, dur: 6400 },                                 // eyes → twitch → breath
      { base: blackBars, texts: [ { lines: [['GLOBAL CONSCIOUSNESS ... RELINKED', CY], ['SLEEPERS: 8,204,551,300 ... ONLINE', CY]], y: 70, hold: 2400, cursor: true } ] }
    ],
    cs3: [
      { base: wireUpClimb, dur: 2000, texts: [ { lines: [['THE SYSTEM REACHES TO SEND YOU HOME.', WH], ["BUT IT CAN'T CUT YOU CLEAN.", WH]], y: 128, hold: 1000 } ] },
      { base: wireUpFork, dur: 1500, texts: [ { lines: [['SO IT FORKS.', WH], ['THE BODY GETS YOU.', WH], ['THE MACHINE KEEPS YOU.', CY]], y: 118, hold: 1400 } ] },
      { base: hallWake, dur: 2000, texts: [ { lines: [['YOU WAKE — IN A HALL WHERE EIGHT BILLION', WH], ['PAIRS OF EYES OPEN AT ONCE.', WH]], y: 126, hold: 1800 } ] },
      { base: chamberInstall, dur: 6500 },                             // scan complete → THE ASSIMILATED installs
      { base: unlockCard, dur: 4500 },                                 // NEW CLASSES COMPILED
      { base: legendaryCard, dur: 4500 }                               // v5 (Red): the granted T5 LEGENDARY SET
    ],
    // CS4 THE UNVEILING (item 5): the "? → ninja" character-select reveal.
    cs4: [
      { base: selectGrid, texts: [ { lines: [['EVERY MASK IN THE ROSTER — CLAIMED.', WH]], y: 118, hold: 1400 },
                                   { lines: [['EXCEPT ONE.', G]], y: 118, hold: 1500 } ] },
      { base: qZoom, dur: 2200, texts: [ { lines: [['SOMETHING WAS ALWAYS LOCKED IN HERE.', WH]], y: 118, hold: 1200 } ] },
      { base: oniResolve, dur: 2600, texts: [ { lines: [['IT STEPS OUT OF THE DARK.', WH]], y: 118, hold: 1400 } ] },
      { base: ninjaCard, dur: 4200 }                                   // THE ONI KING — NINJA unlocked
    ],
    // csBoat — THE OPENER into the finale (before you spawn inside the whale).
    csBoat: [
      { base: boatCalm, texts: [ { lines: [['hey...', WH]], y: 128, hold: 1100, cps: 18 },
                                 { lines: [['isnt there supposed to be', WH], ['corruption to clense......', WH]], y: 120, hold: 1900, cps: 20 } ] },
      { base: breachRise, dur: 2000, texts: [ { lines: [['...oh.', G]], y: 128, hold: 800 } ] },   // mouth open, boat tips in
      { base: breachDive, dur: 2000 }                                   // arcs over → dives back into the sea → guts
    ],
    // csBeach — clearing the guts BEACHES the whale; it leaps out, gets stuck,
    // and spits you onto the sand for the last stand.
    csBeach: [
      { base: whaleLeap, dur: 2000, texts: [ { lines: [['it HURLS itself out of the surf...', WH]], y: 128, hold: 800, cps: 26 } ] },
      { base: whaleBeachedShot, texts: [ { lines: [['...and beaches itself in the sand — STUCK.', WH]], y: 128, hold: 1400, cps: 24 } ] },
      { base: whaleSpit, dur: 2200 },                                   // it hacks you up onto the beach
      { base: beachLand, dur: 2400 }                                    // wordless — you land, it looms; you just know
    ]
  };

  // Per-scene music cue (The Caretaker Theme). Scene-length WAVs in assets/;
  // played once on the music bus by CutsceneScene. CS1 (cold boot) + CS4 are
  // SILENT by design — no entry = no cue. Paths are relative to index.html.
  var CUE_URL = {
    cs0: 'js/cutscenes/assets/cue_cs0_musicbox.wav',
    cs2: 'js/cutscenes/assets/cue_cs2_swell.wav',
    cs3: 'js/cutscenes/assets/cue_cs3_resolve.wav',
    csBoat: 'js/cutscenes/assets/cue_csboat.wav',      // calm sea → the breach
    csBeach: 'js/cutscenes/assets/cue_csbeach.wav'     // heave → the spit
  };

  return { W: W, H: H, C: C, SCENES: SCENES, CUE_URL: CUE_URL, ctext: ctext };
})();

// ---------------------------------------------------------------------------
// The Phaser scene. Registered in main.js scene list; started with
// { id, cls, next } — `next` is a fn() run when the scene finishes (or skips).
// ---------------------------------------------------------------------------
var CutsceneScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () { Phaser.Scene.call(this, { key: 'Cutscene' }); },

  init: function (cfg) {
    this.cfg = cfg || {};
    this.sceneId = this.cfg.id || 'cs0';
    this.cls = this.cfg.cls || (typeof CURRENT !== 'undefined' && CURRENT && CURRENT.cls) || 'ranger';
    this.nextFn = this.cfg.next || null;
  },

  create: function () {
    var self = this, W = CUT.W, H = CUT.H;
    this.cameras.main.setBackgroundColor('#000');
    // integer scale + centered letterbox
    var sw = this.scale.width, sh = this.scale.height;
    this.S = Math.max(1, Math.floor(Math.min(sw / W, sh / H)));
    this.offX = Math.round((sw - W * this.S) / 2);
    this.offY = Math.round((sh - H * this.S) / 2);
    // pixel canvas texture
    if (this.textures.exists('cutTex')) this.textures.remove('cutTex');
    this.canvasTex = this.textures.createCanvas('cutTex', W, H);
    this.ctx = this.canvasTex.getContext ? this.canvasTex.getContext() : this.canvasTex.context;
    this.canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.pic = this.add.image(this.offX, this.offY, 'cutTex').setOrigin(0, 0).setScale(this.S).setDepth(1);
    // fade overlay (per-shot fade-in)
    this.fadeRect = this.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000, 1).setDepth(5);
    // text object (typewriter narration)
    this.lineObjs = [];
    for (var _i = 0; _i < 8; _i++) this.lineObjs.push(this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: 8 * this.S, color: '#e8e8e8' }).setOrigin(0.5, 0).setDepth(6).setVisible(false));
    this.lineH = 11 * this.S;
    this.cue = this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: 8 * this.S, color: '#5a6068' }).setOrigin(0.5, 0).setDepth(6).setVisible(false);
    this.skipHint = this.add.text(sw - 8, sh - this.offY - 12 * this.S / 3, 'SPACE ▸ SKIP', { fontFamily: 'monospace', fontSize: Math.max(9, 3 * this.S), color: '#2c3038' }).setOrigin(1, 1).setDepth(6);

    this.shots = (CUT.SCENES[this.sceneId] || CUT.SCENES.cs0);
    this.si = 0; this.bi = 0; this.mode = 'fade'; this.t = 0; this.charN = 0; this.v = 0; this.shotT = 0; this.prog = 0; this.done = false;

    // MUSIC: kick off this scene's cue (The Caretaker Theme). CS1/CS4 have no
    // cue entry → stopCue leaves them silent. Cutscenes fire after a click/key
    // so audio is already unlocked; playCue queues if not.
    try {
      if (typeof AUDIO !== 'undefined') {
        var cueUrl = CUT.CUE_URL && CUT.CUE_URL[this.sceneId];
        if (cueUrl) AUDIO.playCue(cueUrl); else AUDIO.stopCue();
      }
    } catch (e) {}

    // input: SPACE skip block, hold SPACE / ESC skip whole scene
    this.holdMs = 0;
    this.input.keyboard.on('keydown-SPACE', function () { self._space = true; });
    this.input.keyboard.on('keyup-SPACE', function () { self._space = false; self.holdMs = 0; });
    this.input.keyboard.on('keydown-ESC', function () { self.finish(); });
    this.input.on('pointerdown', function () { self.skipBlock(); });
    this.drawShot();
  },

  curShot: function () { return this.shots[this.si]; },
  curBlock: function () { var s = this.curShot(); return s && s.texts ? s.texts[this.bi] : null; },

  drawShot: function () {
    var s = this.curShot(); if (!s) return;
    try { s.base(this.ctx, this.v, this.prog == null ? 1 : this.prog, this.cls); } catch (e) {}
    this.canvasTex.refresh();
  },

  enterPostFade: function () {
    var s = this.curShot();
    if (s && s.dur) { this.mode = 'anim'; this.t = 0; this.prog = 0; }
    else { this.mode = 'type'; this.bi = 0; this.charN = 0; this.t = 0; }
  },

  clearText: function () { if (this.lineObjs) for (var i = 0; i < this.lineObjs.length; i++) this.lineObjs[i].setVisible(false); if (this.cue) this.cue.setVisible(false); },

  // render the currently-revealed narration for the active block (per-line color)
  drawText: function () {
    if (this.mode === 'fade' || this.mode === 'anim') { this.clearText(); return; }
    var blk = this.curBlock();
    if (!blk) { this.clearText(); return; }
    var lines = blk.lines, remaining = this.charN;
    var cxS = this.offX + CUT.W * this.S / 2, yTop = this.offY + blk.y * this.S;
    for (var i = 0; i < this.lineObjs.length; i++) {
      var lo = this.lineObjs[i];
      if (i >= lines.length) { lo.setVisible(false); continue; }
      var s = lines[i][0], shownS;
      if (remaining >= s.length) { shownS = s; remaining -= s.length; }
      else { shownS = s.substr(0, Math.max(0, remaining)); remaining = 0; }
      lo.setVisible(true).setColor(lines[i][1] || '#e8e8e8').setText(shownS).setPosition(cxS, yTop + i * this.lineH);
    }
    var full = lines.reduce(function (a, l) { return a + l[0].length; }, 0);
    if (this.mode === 'hold' && this.charN >= full) {
      var blink = Math.floor(this.t / 400) % 2 === 0;
      this.cue.setVisible(blink);
      if (blk.cursor) this.cue.setText('█').setColor(lines[lines.length - 1][1] || '#e8e8e8');
      else this.cue.setText('▼').setColor('#5a6068');
      this.cue.setPosition(cxS, yTop + lines.length * this.lineH);
    } else this.cue.setVisible(false);
  },

  update: function (time, delta) {
    if (this.done) return;
    var s = this.curShot();
    this.shotT += delta; this.t += delta;
    var nv = Math.floor(this.shotT / 120), vChanged = (nv !== this.v);   // monotonic frame counter (art fns use v%2 for toggles, raw v for motion)
    if (vChanged) this.v = nv;

    // hold-to-skip whole scene
    if (this._space) { this.holdMs += delta; if (this.holdMs > 550) { this.finish(); return; } }

    if (this.mode === 'fade') {
      this.prog = 0;
      this.fadeRect.setAlpha(Math.max(0, 1 - this.t / 350));
      if (vChanged) this.drawShot();
      if (this.t >= 350) { this.fadeRect.setAlpha(0); this.t = 0; this.enterPostFade(); this.drawShot(); }
      this.drawText(); return;
    }
    if (this.mode === 'anim') {
      var dur = (s && s.dur) || 3000;
      this.prog = Math.min(1, this.t / dur);
      this.drawShot();                                  // prog changes continuously → redraw each frame
      if (this.t >= dur) { this.prog = 1; this.t = 0; if (s && s.texts && s.texts.length) { this.mode = 'type'; this.bi = 0; this.charN = 0; } else { this.nextShot(); return; } }
      this.drawText(); return;
    }
    // type / hold — prog held at 1
    this.prog = 1; if (vChanged) this.drawShot();
    var blk = this.curBlock();
    if (this.mode === 'type') {
      if (!blk) { this.nextShot(); return; }
      var cps = blk.cps || 26, full = blk.lines.reduce(function (a, l) { return a + l[0].length; }, 0);
      this.charN = Math.min(full, Math.floor(this.t / 1000 * cps));
      if (this.charN >= full) { this.mode = 'hold'; this.t = 0; }
    } else if (this.mode === 'hold') {
      if (this.t >= (blk ? (blk.hold || 1400) : 1400)) this.nextBlock();
    }
    this.drawText();
  },

  skipBlock: function () {
    if (this.mode === 'anim') { this.prog = 1; this.drawShot(); var s = this.curShot(); this.t = 0; if (s && s.texts && s.texts.length) { this.mode = 'type'; this.bi = 0; this.charN = 0; } else this.nextShot(); }
    else if (this.mode === 'type') { var blk = this.curBlock(); this.charN = blk ? blk.lines.reduce(function (a, l) { return a + l[0].length; }, 0) : 0; this.mode = 'hold'; this.t = 0; this.drawText(); }
    else if (this.mode === 'hold') this.nextBlock();
    else if (this.mode === 'fade') { this.fadeRect.setAlpha(0); this.t = 0; this.enterPostFade(); this.drawShot(); }
  },

  nextBlock: function () {
    var s = this.curShot();
    if (s && this.bi < s.texts.length - 1) { this.bi++; this.mode = 'type'; this.t = 0; this.charN = 0; this.drawText(); }
    else this.nextShot();
  },

  nextShot: function () {
    this.si++; this.bi = 0;
    if (this.si >= this.shots.length) { this.finish(); return; }
    this.mode = 'fade'; this.t = 0; this.charN = 0; this.shotT = 0; this.v = 0; this.prog = 0;
    this.fadeRect.setAlpha(1); this.drawShot(); this.drawText();
  },

  finish: function () {
    if (this.done) return; this.done = true;
    // stop the cue so it never bleeds into the next scene / Nexus (a chained
    // cs0→cs1 or cs2→cs3 restarts the correct cue from the next create()).
    try { if (typeof AUDIO !== 'undefined') AUDIO.stopCue(); } catch (e) {}
    var self = this, next = this.nextFn;
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', function () {
      self.input.keyboard.removeAllListeners();
      if (typeof next === 'function') next();
      else if (next && next.scene) self.scene.start(next.scene, next.data || {});
      else self.scene.start('Nexus', { entry: 'login' });
    });
  }
});
if (typeof module !== 'undefined') { module.exports = { CUT: CUT }; }
