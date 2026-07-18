// ============================================================================
// game/js/maps/carnival/art.js — HAUNTED CARNIVAL (realm 11) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 3 4 6 12 13 14
// 16 17 20, THE RINGMASTER (render_carnival_boss_final.js — #1 THE CLASSIC:
// red tailcoat, gold trim, top hat, waxed mustache, whip, spotlight pool),
// a NEW trapeze rig (entrance), 19 decor props (big top itself is scene
// geometry), tiles #4 FUNHOUSE CHECKER (base) + #9 RING MAT (arena) + dead
// grass (outskirts). Creepy-carnival mood: cheery-gone-wrong, sickly bulb
// glow on midnight dark — NOT gore, NOT pitch black.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- carnival palette (carnival_kit.js C, verbatim) ----------------------
  var C = {
    OUT: '#120a10',
    red: '#b03440', redLt: '#d86470', redDk: '#6e1c26', redDkk: '#40101a',
    cream: '#e8dcc0', creamDk: '#b0a482', creamDkk: '#6e654c',
    glow: '#ffd23f', glowLt: '#fff0a8', glowDk: '#b08a1e',
    teal: '#3fc8b4', tealLt: '#a8f0e4', tealDk: '#1e6e62',
    violet: '#8a4ab0', violetLt: '#c898e8', violetDk: '#4a2262',
    dirt: '#5a4a3c', dirtLt: '#7e6a56', dirtDk: '#3a2c20',
    wood: '#7e5a38', woodLt: '#a8804e', woodDk: '#4e3520', woodDkk: '#2e1e10',
    iron: '#555a66', ironLt: '#9aa2b0', ironDk: '#22242c',
    paint: '#f0ecec', paintDk: '#c0b8b8', pink: '#e86a9a',
    night: '#181022', white: '#f4f4f4', oil: '#0a060c',
    blood: '#8a1622'
  };

  // ---- shared helpers (carnival_kit lineage — ES6 kept) --------------------
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
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => C.oil); }
  function stripes(put, x0, y0, x1, y1, w, a, b) {
    for (let y = y0; y < y1; y++) row(put, Math.round(y), x0, x1, (tx) => {
      const band = Math.floor(tx * ((x1 - x0) / w));
      return band % 2 === 0 ? a : b;
    });
  }
  function bunting(put, x1, y1, x2, y2, n, cols) {
    for (let i = 0; i <= n * 8; i++) {
      const t = i / (n * 8);
      const sag = Math.sin(t * Math.PI) * Math.abs(x2 - x1) * 0.08;
      put(Math.round(lerp(x1, x2, t)), Math.round(lerp(y1, y2, t) + sag), C.ironDk);
    }
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const fx = lerp(x1, x2, t), fy = lerp(y1, y2, t) + Math.sin(t * Math.PI) * Math.abs(x2 - x1) * 0.08;
      const c = cols[i % cols.length];
      for (let d = 0; d < 5; d++) row(put, Math.round(fy + d), fx - (5 - d) * 0.5, fx + (5 - d) * 0.5, () => c);
    }
  }
  function grin(put, cx, cy, w, up, c, teeth) {
    for (let t = -1; t <= 1; t += 0.04) {
      const x = cx + t * w, y = cy + (up ? -1 : 1) * (1 - t * t) * w * 0.45;
      put(Math.round(x), Math.round(y), c);
      put(Math.round(x), Math.round(y + 1), c);
      if (teeth && Math.abs((t * 5) % 1) < 0.18) put(Math.round(x), Math.round(y - 1), C.white);
    }
  }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ================== MOBS (#1 2 3 4 6 12 13 14 16 17 20) ==================
  // 1 · CREEPY CLOWN — shuffling grinner, oversized shoes.
  function drawClown(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    [[-1, 0], [1, 2]].forEach(([s, o]) => ell(put, cx + s * S * 0.09, S * 0.86 + o, S * 0.09, S * 0.035, (tx, ty) => mix(C.red, C.redDk, tx * 0.5 + ty)));
    for (let y = S * 0.44; y < S * 0.84; y++) {
      const t = (y - S * 0.44) / (S * 0.4);
      const w = S * (0.1 + Math.sin(t * 3.1) * 0.05);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        const band = Math.floor((t * 4 + tx) * 2);
        return mix(band % 2 ? C.violet : C.glow, band % 2 ? C.violetDk : C.glowDk, tx * 0.6 + t * 0.3);
      });
    }
    for (let a = 0; a < 6.28; a += 0.5) ell(put, cx + Math.cos(a) * S * 0.07, S * 0.42 + Math.sin(a) * S * 0.02, S * 0.03, S * 0.02, () => C.cream);
    ell(put, cx, S * 0.32, S * 0.085, S * 0.095, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.09, S * 0.27, S * 0.035, S * 0.045, (tx, ty) => mix(C.teal, C.tealDk, ty)));
    optic(put, cx - S * 0.035, S * 0.3, S * 0.016, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.035, S * 0.3, S * 0.016, C.oil, C.oil, '#ffffff');
    put(Math.round(cx), Math.round(S * 0.33), C.red);
    grin(put, cx, S * 0.36, S * 0.05, false, C.blood, true);
  }
  // 2 · BALLOON WISP — drifting haunted balloon, dangling string.
  function drawBalloon(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.14);
    ell(put, cx, S * 0.34, S * 0.13, S * 0.16, (tx, ty) => {
      let b = mix(C.redLt, C.redDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (tx < 0.3 && ty < 0.35) b = mix(b, '#ffffff', 0.35);
      return b;
    });
    put(Math.round(cx), Math.round(S * 0.51), C.redDk);
    for (let t = 0; t < 1; t += 0.02) put(Math.round(cx + Math.sin(t * 7) * S * 0.035), Math.round(S * 0.52 + t * S * 0.3), C.creamDk);
    optic(put, cx - S * 0.045, S * 0.31, S * 0.02, C.redDkk, C.redDkk, C.redLt);
    optic(put, cx + S * 0.045, S * 0.31, S * 0.02, C.redDkk, C.redDkk, C.redLt);
    grin(put, cx, S * 0.39, S * 0.05, false, C.redDkk, false);
  }
  // 3 · CARNY BARKER — top-hatted shill with a cane, herds you.
  function drawBarker(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.88, S * 0.03, () => C.night));
    for (let y = S * 0.4; y < S * 0.64; y++) {
      const t = (y - S * 0.4) / (S * 0.24), w = S * (0.09 + t * 0.04);
      row(put, Math.round(y), cx - w, cx + w, (tx) => mix(C.redLt, C.redDk, clamp(tx * 1.2 + t * 0.2, 0, 1)));
    }
    row(put, Math.round(S * 0.44), cx - S * 0.03, cx + S * 0.03, () => C.glow);
    stroke(put, cx + S * 0.08, S * 0.44, cx + S * 0.17, S * 0.3, S * 0.025, () => C.redDk);
    stroke(put, cx + S * 0.17, S * 0.32, cx + S * 0.17, S * 0.6, 2.4, () => C.woodDkk);
    put(Math.round(cx + S * 0.17), Math.round(S * 0.3), C.glow);
    stroke(put, cx - S * 0.08, S * 0.44, cx - S * 0.13, S * 0.56, S * 0.025, () => C.redDk);
    ell(put, cx, S * 0.32, S * 0.06, S * 0.065, (tx, ty) => mix('#d8c8a8', '#a89478', clamp(tx + ty * 0.4, 0, 1)));
    plate(put, cx - S * 0.075, S * 0.24, cx + S * 0.075, S * 0.265, C.night, C.violetDk, C.oil);
    plate(put, cx - S * 0.05, S * 0.1, cx + S * 0.05, S * 0.25, C.night, C.violet, C.oil);
    row(put, Math.round(S * 0.22), cx - S * 0.05, cx + S * 0.05, () => C.red);
    optic(put, cx - S * 0.025, S * 0.31, S * 0.013, C.oil, C.oil, C.glow);
    optic(put, cx + S * 0.025, S * 0.31, S * 0.013, C.oil, C.oil, C.glow);
    grin(put, cx, S * 0.345, S * 0.03, false, C.redDkk, false);
  }
  // 4 · POSSESSED TEDDY — prize gone wrong; one button eye.
  function drawTeddy(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    ell(put, cx, S * 0.62, S * 0.14, S * 0.16, (tx, ty) => mix('#a8825a', '#6e5236', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
    ell(put, cx, S * 0.66, S * 0.06, S * 0.08, (tx, ty) => mix('#d8c0a0', '#a8926e', ty));
    for (let t = -1; t <= 1; t += 0.2) { const x = cx + t * S * 0.05, y = S * 0.64 + t * t * S * 0.02; put(Math.round(x), Math.round(y), C.blood); put(Math.round(x), Math.round(y - 2), C.oil); }
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.15, S * 0.58, S * 0.05, S * 0.09, (tx, ty) => mix('#a8825a', '#5e4630', tx + ty * 0.3));
      ell(put, cx + s * S * 0.08, S * 0.8, S * 0.06, S * 0.05, (tx, ty) => mix('#8e6c48', '#5e4630', ty));
    });
    ell(put, cx, S * 0.36, S * 0.11, S * 0.1, (tx, ty) => mix('#b8905e', '#75593a', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    ell(put, cx - S * 0.09, S * 0.27, S * 0.04, S * 0.04, (tx, ty) => mix('#a8825a', '#5e4630', ty));
    [[0.07, 0.26], [0.1, 0.28], [0.08, 0.3]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(dy * S), '#5e4630'));
    optic(put, cx - S * 0.04, S * 0.34, S * 0.018, C.oil, C.oil, '#ffffff');
    stroke(put, cx + S * 0.025, S * 0.325, cx + S * 0.055, S * 0.355, 1.4, () => C.oil);
    stroke(put, cx + S * 0.055, S * 0.325, cx + S * 0.025, S * 0.355, 1.4, () => C.oil);
    ell(put, cx, S * 0.4, S * 0.045, S * 0.03, (tx, ty) => mix('#d8c0a0', '#a8926e', ty));
    grin(put, cx, S * 0.405, S * 0.03, false, C.oil, false);
  }
  // 6 · POPCORN POLTERGEIST — a striped box boiling over with hot kernels.
  function drawPopcorn(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    for (let y = S * 0.5; y < S * 0.84; y++) {
      const t = (y - S * 0.5) / (S * 0.34), w = S * (0.13 - t * 0.03);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        const band = Math.floor(tx * 6);
        return mix(band % 2 ? C.red : C.cream, band % 2 ? C.redDk : C.creamDk, t * 0.5 + tx * 0.2);
      });
    }
    optic(put, cx - S * 0.05, S * 0.62, S * 0.016, C.oil, C.oil, C.glow);
    optic(put, cx + S * 0.05, S * 0.62, S * 0.016, C.oil, C.oil, C.glow);
    grin(put, cx, S * 0.7, S * 0.045, true, C.oil, true);
    [[0, 0.42], [-0.09, 0.4], [0.09, 0.44], [-0.05, 0.32], [0.05, 0.3], [0, 0.24], [-0.12, 0.34], [0.13, 0.36]].forEach(([dx, dy], i) => {
      ell(put, cx + dx * S, S * dy, S * 0.028, S * 0.026, (tx, ty) => mix(i % 3 ? C.glowLt : '#fff8e0', C.glowDk, tx * 0.6 + ty * 0.5));
    });
    put(Math.round(cx - S * 0.02), Math.round(S * 0.18), C.glow); put(Math.round(cx + S * 0.07), Math.round(S * 0.2), C.glow);
  }
  // 12 · STRONGMAN SHADE — mustachioed ghost of the strongman, barbell slam.
  function drawStrongman(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    for (let y = S * 0.38; y < S * 0.68; y++) {
      const t = (y - S * 0.38) / (S * 0.3), w = S * (0.14 - t * 0.03);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix('#d8c8b0', '#a08a6e', clamp(tx * 1.1, 0, 1));
        if (t > 0.35) { const band = Math.floor(tx * 4); b = band % 2 ? C.red : C.redDk; }
        return b;
      });
    }
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, S * 0.68, cx + s * S * 0.07, S * 0.86, S * 0.04, () => C.redDk));
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.12, S * 0.42, cx + s * S * 0.15, S * 0.24, S * 0.032, () => '#d8c8b0'));
    stroke(put, cx - S * 0.24, S * 0.2, cx + S * 0.24, S * 0.2, S * 0.02, () => C.iron);
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.26, S * 0.2, S * 0.055, S * 0.055, (tx, ty) => mix(C.ironLt, C.ironDk, clamp(tx + ty * 0.5, 0, 1))));
    ell(put, cx, S * 0.32, S * 0.06, S * 0.06, (tx, ty) => mix('#d8c8b0', '#a08a6e', clamp(tx + ty * 0.4, 0, 1)));
    optic(put, cx - S * 0.022, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
    optic(put, cx + S * 0.022, S * 0.31, S * 0.011, C.oil, C.oil, C.teal);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.005, S * 0.35, cx + s * S * 0.045, S * 0.345, 2, () => C.oil); put(Math.round(cx + s * S * 0.05), Math.round(S * 0.34), C.oil); });
    for (let x = -0.1; x <= 0.1; x += 0.02) put(Math.round(cx + x * S), Math.round(S * 0.88), C.tealLt);
  }
  // 13 · COTTON CANDY BLOB — pink cloud ooze, sticky slow patches.
  function drawCandy(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    [[0, 0.58, 0.17, 0.14], [-0.12, 0.52, 0.1, 0.09], [0.12, 0.5, 0.11, 0.09], [0, 0.44, 0.12, 0.09], [-0.08, 0.66, 0.1, 0.07], [0.09, 0.66, 0.09, 0.07]].forEach(([dx, dy, rx, ry]) =>
      ell(put, cx + dx * S, S * dy, S * rx, S * ry, (tx, ty) => mix('#ffc8e0', C.pink, clamp(tx * 0.8 + ty * 0.6, 0, 1))));
    [[-0.1, 0.74], [0.04, 0.78], [0.13, 0.72]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S, S * (dy + 0.07), 2.4, () => C.pink));
    stroke(put, cx + S * 0.13, S * 0.42, cx + S * 0.19, S * 0.3, S * 0.02, () => C.cream);
    optic(put, cx - S * 0.05, S * 0.54, S * 0.015, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.05, S * 0.54, S * 0.015, C.oil, C.oil, '#ffffff');
    grin(put, cx, S * 0.6, S * 0.04, false, mix(C.pink, '#000000', 0.6), true);
  }
  // 14 · KNIFE JUGGLER — grinning tosser, arcing blades.
  function drawJuggler(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.6, cx + s * S * 0.05, S * 0.88, S * 0.028, () => C.violetDk));
    for (let y = S * 0.4; y < S * 0.62; y++) {
      const t = (y - S * 0.4) / (S * 0.22), w = S * 0.09;
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        const ch = (Math.floor(tx * 4) + Math.floor(t * 4)) % 2;
        return ch ? mix(C.violet, C.violetDk, tx * 0.5) : mix(C.glow, C.glowDk, t * 0.5);
      });
    }
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, S * 0.44, cx + s * S * 0.15, S * 0.34, S * 0.02, () => C.violet));
    [[-0.16, 0.24, 0.6], [0, 0.14, 0], [0.16, 0.22, -0.6]].forEach(([dx, dy, lean]) => {
      const kx = cx + dx * S, ky = S * dy;
      stroke(put, kx - lean * 6, ky + 8, kx + lean * 6, ky - 8, 2.4, () => C.ironLt);
      put(Math.round(kx - lean * 8), Math.round(ky + 11), C.woodDk); put(Math.round(kx - lean * 7), Math.round(ky + 10), C.woodDk);
      put(Math.round(kx + lean * 6), Math.round(ky - 8), '#ffffff');
    });
    ell(put, cx, S * 0.33, S * 0.06, S * 0.06, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx + ty * 0.4, 0, 1)));
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.03, S * 0.28, cx + s * S * 0.1, S * 0.2, S * 0.02, () => s < 0 ? C.violet : C.glow); put(Math.round(cx + s * S * 0.11), Math.round(S * 0.19), C.red); });
    optic(put, cx - S * 0.022, S * 0.32, S * 0.011, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.022, S * 0.32, S * 0.011, C.oil, C.oil, '#ffffff');
    grin(put, cx, S * 0.355, S * 0.03, false, C.blood, true);
  }
  // 16 · WHACK-A-MOLE — pops from warned holes, bonks back.
  function drawMole(put, S) {
    const cx = S * 0.5;
    ell(put, cx, S * 0.72, S * 0.16, S * 0.06, () => C.oil);
    ell(put, cx, S * 0.7, S * 0.16, S * 0.05, (tx, ty) => ty > 0.5 ? null : mix(C.dirtLt, C.dirtDk, tx));
    ell(put, cx, S * 0.5, S * 0.11, S * 0.16, (tx, ty) => mix('#7e6a56', '#4c3e30', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    dome(put, cx, S * 0.36, S * 0.09, S * 0.05, C.glow, C.glowLt, C.glowDk);
    stroke(put, cx - S * 0.05, S * 0.42, cx - S * 0.02, S * 0.43, 1.6, () => C.oil);
    stroke(put, cx + S * 0.02, S * 0.43, cx + S * 0.05, S * 0.42, 1.6, () => C.oil);
    ell(put, cx, S * 0.47, S * 0.03, S * 0.024, (tx, ty) => mix(C.pink, mix(C.pink, '#000', 0.4), ty));
    put(Math.round(cx - 1), Math.round(S * 0.51), '#ffffff'); put(Math.round(cx + 1), Math.round(S * 0.51), '#ffffff');
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.1, S * 0.64, S * 0.03, S * 0.02, () => '#9a8a7e'));
    stroke(put, cx + S * 0.13, S * 0.62, cx + S * 0.2, S * 0.44, 2.6, () => C.wood);
    plate(put, cx + S * 0.16, S * 0.36, cx + S * 0.25, S * 0.44, C.red, C.redLt, C.redDk);
  }
  // 17 · CYMBAL MONKEY — clash stun rings, fez.
  function drawMonkey(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    ell(put, cx, S * 0.56, S * 0.09, S * 0.11, (tx, ty) => mix('#8a6a4e', '#54402e', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    plate(put, cx - S * 0.045, S * 0.6, cx + S * 0.045, S * 0.66, C.red, C.redLt, C.redDk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.66, cx + s * S * 0.06, S * 0.8, S * 0.02, () => '#6e523a'));
    for (let t = 0; t < 1; t += 0.04) put(Math.round(cx - S * (0.1 + Math.sin(t * 4) * 0.05)), Math.round(S * (0.62 - t * 0.12)), '#6e523a');
    ell(put, cx, S * 0.38, S * 0.07, S * 0.07, (tx, ty) => mix('#8a6a4e', '#54402e', clamp(tx + ty * 0.3, 0, 1)));
    ell(put, cx, S * 0.41, S * 0.045, S * 0.04, (tx, ty) => mix('#d8bc9a', '#a8886a', ty));
    [-1, 1].forEach(s => ell(put, cx + s * S * 0.07, S * 0.35, S * 0.02, S * 0.025, () => '#6e523a'));
    optic(put, cx - S * 0.025, S * 0.365, S * 0.011, C.oil, C.oil, C.red);
    optic(put, cx + S * 0.025, S * 0.365, S * 0.011, C.oil, C.oil, C.red);
    plate(put, cx - S * 0.035, S * 0.28, cx + S * 0.035, S * 0.33, C.red, C.redLt, C.redDk);
    stroke(put, cx + S * 0.035, S * 0.28, cx + S * 0.05, S * 0.25, 1.4, () => C.glow);
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.13, S * 0.5, S * 0.045, S * 0.045, (tx, ty) => mix(C.glowLt, C.glowDk, clamp(tx + ty * 0.4, 0, 1)));
      stroke(put, cx + s * S * 0.07, S * 0.52, cx + s * S * 0.1, S * 0.51, S * 0.016, () => '#6e523a');
    });
    for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.2), Math.round(S * 0.5 + Math.sin(a) * S * 0.14), C.glowLt);
  }
  // 20 · FERRIS PHANTOM — elite; a rolling ferris-wheel spirit, spoke beams.
  function drawFerris(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    for (let a = 0; a < 6.283; a += 0.02) {
      put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.3), C.tealDk);
      put(Math.round(cx + Math.cos(a) * S * 0.27), Math.round(cy + Math.sin(a) * S * 0.27), C.teal);
    }
    for (let a = 0; a < 6.283; a += 0.785) stroke(put, cx, cy, cx + Math.cos(a) * S * 0.28, cy + Math.sin(a) * S * 0.28, 1.6, () => C.tealLt);
    for (let a = 0.39; a < 6.283; a += 0.785) {
      const gx = cx + Math.cos(a) * S * 0.29, gy = cy + Math.sin(a) * S * 0.29;
      plate(put, gx - 4, gy, gx + 4, gy + 7, a % 1.57 < 0.785 ? C.red : C.glow, C.glowLt, C.redDk);
    }
    ell(put, cx, cy, S * 0.09, S * 0.09, (tx, ty) => mix(C.tealLt, C.tealDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
    optic(put, cx - S * 0.03, cy - S * 0.01, S * 0.014, C.oil, C.oil, '#ffffff');
    optic(put, cx + S * 0.03, cy - S * 0.01, S * 0.014, C.oil, C.oil, '#ffffff');
    grin(put, cx, cy + S * 0.035, S * 0.035, false, C.oil, true);
    [[0.16, 0.16], [0.82, 0.3], [0.2, 0.8]].forEach(([fx, fy]) => put(Math.round(S * fx), Math.round(S * fy), C.tealLt));
  }

  // ============== THE RINGMASTER — #1 THE CLASSIC (boss final) ==============
  // render_carnival_boss.js ringmaster(put,S,o) with the FINAL opts inlined:
  // red tailcoat [red, redLt, redDkk], gold trim, 'show' face (waxed mustache,
  // glow eyes), top hat, whip, spotlight pool underfoot.
  function drawRingmaster(put, S) {
    const cb = C.red, cl = C.redLt, cd = C.redDkk, trim = C.glow, eyes = C.glow;
    const cx = S * 0.48;
    const footY = S * 0.9, hipY = S * 0.62, shY = S * 0.42, headY = S * 0.325;
    shadow(put, S, S * 0.5, S * 0.3);
    // legs (jodhpurs + boots)
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.045, hipY, cx + s * S * 0.055, footY - S * 0.06, S * 0.032, (t) => mix(C.night, C.oil, t * 0.5));
      plate(put, cx + s * S * 0.055 - S * 0.032, footY - S * 0.07, cx + s * S * 0.055 + S * 0.032, footY, C.oil, C.ironDk, C.oil);
    });
    // tailcoat body + cream shirt front
    for (let y = shY; y < hipY + S * 0.02; y++) {
      const t = (y - shY) / (hipY - shY);
      const w = S * (0.1 - t * 0.025);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix(cl, cb, clamp(tx * 1.4, 0, 1));
        if (tx > 0.75) b = mix(b, cd, 0.6);
        if (Math.abs(tx - 0.5) < 0.06) b = mix(b, C.cream, t < 0.5 ? 0.7 : 0);
        return b;
      });
    }
    // coat tails flaring behind
    [-1, 1].forEach(s => {
      for (let y = hipY; y < footY - S * 0.04; y++) {
        const t = (y - hipY) / (footY - hipY);
        const x0 = cx + s * S * (0.05 + t * 0.075);
        stroke(put, x0, y, x0 + s * S * 0.02, y, S * 0.02 * (1 - t * 0.4), () => mix(cb, cd, t * 0.8));
      }
    });
    // trim buttons + sash + epaulettes
    [0.25, 0.45, 0.65].forEach(t => put(Math.round(cx), Math.round(lerp(shY, hipY, t)), trim));
    row(put, Math.round(hipY), cx - S * 0.07, cx + S * 0.07, () => trim);
    [-1, 1].forEach(s => {
      const px = cx + s * S * 0.1;
      ell(put, px, shY + S * 0.01, S * 0.038, S * 0.025, (tx, ty) => mix(trim, mix(trim, '#000', 0.5), clamp(tx + ty * 0.5, 0, 1)));
      for (let d = 0; d < 4; d++) put(Math.round(px + s * S * 0.03), Math.round(shY + S * 0.03 + d * 2), trim);
    });
    // arms — right raised (whip hand), left out low
    const armW = S * 0.022;
    const rx = cx + S * 0.16, ry = shY - S * 0.06;
    stroke(put, cx + S * 0.09, shY + S * 0.03, rx, ry, armW, (t) => mix(cl, cd, t * 0.6));
    ell(put, rx, ry, S * 0.02, S * 0.02, () => C.paint);
    const lx = cx - S * 0.15, ly = shY + S * 0.14;
    stroke(put, cx - S * 0.09, shY + S * 0.03, lx, ly, armW, (t) => mix(cl, cd, t * 0.6));
    ell(put, lx, ly, S * 0.02, S * 0.02, () => C.paint);
    // head — 'show' face
    const hr = S * 0.055;
    ell(put, cx, headY, hr, hr * 1.1, (tx, ty) => mix('#d8c8a8', mix('#d8c8a8', '#000000', 0.35), clamp(tx * 0.8 + ty * 0.4, 0, 1)));
    optic(put, cx - S * 0.02, headY - S * 0.002, S * 0.011, C.oil, C.oil, eyes);
    optic(put, cx + S * 0.02, headY - S * 0.002, S * 0.011, C.oil, C.oil, eyes);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.004, headY + S * 0.024, cx + s * S * 0.038, headY + S * 0.018, 1.8, () => C.oil); put(Math.round(cx + s * S * 0.042), Math.round(headY + S * 0.014), C.oil); });
    grin(put, cx, headY + S * 0.036, S * 0.022, false, C.redDkk, false);
    // top hat, red band
    plate(put, cx - S * 0.075, headY - hr - S * 0.01, cx + S * 0.075, headY - hr + S * 0.012, C.night, C.violetDk, C.oil);
    for (let y = 0; y < S * 0.11; y++) {
      row(put, Math.round(headY - hr - S * 0.01 - y), cx - S * 0.05, cx + S * 0.05, (tx) => mix(C.night, C.oil, clamp(tx * 1.2, 0, 1)));
    }
    row(put, Math.round(headY - hr - S * 0.035), cx - S * 0.05, cx + S * 0.05, () => cb);
    // the whip, curling from the raised hand
    let px = rx, py = ry;
    [[0.09, -0.06], [0.17, -0.02], [0.2, 0.09], [0.13, 0.16], [0.2, 0.24]].forEach(([dx, dy], i) => {
      const nx = rx + dx * S, ny = ry + dy * S + S * 0.02 * Math.sin(i * 3);
      stroke(put, px, py, nx, ny, Math.max(1, 2.6 - i * 0.5), () => i < 2 ? C.woodDk : '#8a5a30');
      px = nx; py = ny;
    });
    put(Math.round(px), Math.round(py), C.red);
    // spotlight pool under him
    for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * 0.5 + Math.cos(a) * S * 0.28), Math.round(S * 0.9 + Math.sin(a) * S * 0.05), C.glowDk);
  }

  // ---- trapeze rig (NEW small draw — the entrance) --------------------------
  function drawTrapeze(put, S) {
    [-1, 1].forEach(s => {
      for (let t = 0; t <= 1; t += 0.02) {
        const x = lerp(S * (0.5 + s * 0.42), S * (0.5 + s * 0.18), t), y = lerp(S * 0.02, S * 0.72, t);
        put(Math.round(x), Math.round(y), t % 0.08 < 0.04 ? C.creamDk : C.creamDkk);
      }
    });
    stroke(put, S * 0.3, S * 0.74, S * 0.7, S * 0.74, 3, () => C.ironLt);
    stroke(put, S * 0.3, S * 0.76, S * 0.7, S * 0.76, 1.6, () => C.ironDk);
    [-1, 1].forEach(s => put(Math.round(S * (0.5 + s * 0.19)), Math.round(S * 0.73), C.glow));
  }

  // ============================= DECOR (19) ==================================
  function drawTicketBooth(put, S) {
    shadow(put, S, S * 0.5, S * 0.26);
    stripes(put, S * 0.3, S * 0.42, S * 0.7, S * 0.84, S * 0.08, C.red, C.cream);
    plate(put, S * 0.38, S * 0.52, S * 0.62, S * 0.68, C.oil, C.night, C.oil);
    optic(put, S * 0.5, S * 0.6, S * 0.015, C.oil, C.oil, C.glow);
    row(put, Math.round(S * 0.68), S * 0.36, S * 0.64, () => C.wood);
    for (let y = S * 0.32; y < S * 0.44; y++) { const t = (y - S * 0.32) / (S * 0.12); const w = S * (0.28 - t * 0.06); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redLt, C.redDk, tx * 0.6 + t * 0.3)); }
    plate(put, S * 0.34, S * 0.2, S * 0.66, S * 0.3, C.glowDk, C.glow, C.woodDkk);
    [0.4, 0.46, 0.52, 0.58].forEach(x => stroke(put, S * x, S * 0.23, S * x, S * 0.27, 1.4, () => C.oil));
  }
  function drawCarousel(put, S) {
    shadow(put, S, S * 0.5, S * 0.38);
    for (let y = S * 0.24; y < S * 0.4; y++) {
      const t = (y - S * 0.24) / (S * 0.16), w = S * (0.1 + t * 0.26);
      row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => {
        const band = Math.floor(tx * 8);
        let b = mix(band % 2 ? C.violet : C.cream, band % 2 ? C.violetDk : C.creamDk, t * 0.5);
        if (Math.sin(tx * 20) > 0.6) b = mix(b, '#000000', 0.2);
        return b;
      });
    }
    ell(put, S * 0.5, S * 0.78, S * 0.36, S * 0.08, (tx, ty) => mix(C.wood, C.woodDkk, clamp(tx * 0.5 + ty, 0, 1)));
    stroke(put, S * 0.5, S * 0.38, S * 0.5, S * 0.74, S * 0.03, () => C.glowDk);
    [[0.32, 0.56], [0.66, 0.6]].forEach(([x, y]) => {
      stroke(put, S * x, S * 0.4, S * x, S * (y + 0.12), 1.6, () => C.ironLt);
      ell(put, S * x, S * y, S * 0.06, S * 0.035, (tx, ty) => mix('#e8e0ec', '#b0a4bc', tx + ty * 0.3));
      ell(put, S * (x + 0.05), S * (y - 0.045), S * 0.025, S * 0.02, () => '#d8d0e0');
      put(Math.round(S * (x + 0.05)), Math.round(S * (y - 0.05)), C.teal);
    });
    put(Math.round(S * 0.5), Math.round(S * 0.22), C.glow);
  }
  function drawFerrisProp(put, S) {
    shadow(put, S, S * 0.5, S * 0.34);
    const cx = S * 0.5, cy = S * 0.42;
    for (let a = 0; a < 6.283; a += 0.015) put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.3), mix(C.iron, C.ironDk, Math.abs(Math.sin(a * 3))));
    for (let a = 0; a < 6.283; a += 0.524) stroke(put, cx, cy, cx + Math.cos(a) * S * 0.29, cy + Math.sin(a) * S * 0.29, 1.2, () => C.ironDk);
    stroke(put, cx, cy, cx - S * 0.18, S * 0.88, 3, () => C.iron);
    stroke(put, cx, cy, cx + S * 0.18, S * 0.88, 3, () => C.iron);
    ell(put, cx, cy, S * 0.035, S * 0.035, (tx, ty) => mix(C.ironLt, C.ironDk, ty));
    for (let a = 0.5; a < 6.283; a += 1.047) {
      const gx = cx + Math.cos(a) * S * 0.3, gy = cy + Math.sin(a) * S * 0.3;
      plate(put, gx - 4, gy, gx + 4, gy + 8, C.red, C.redLt, C.redDkk);
    }
    const dx = cx + Math.cos(2.6) * S * 0.3, dy = cy + Math.sin(2.6) * S * 0.3;
    stroke(put, dx, dy, dx + 5, dy + 9, 1.2, () => C.ironDk);
    plate(put, dx + 2, dy + 9, dx + 10, dy + 17, C.glowDk, C.glow, C.woodDkk);
  }
  function drawBottleBooth(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    plate(put, S * 0.22, S * 0.5, S * 0.78, S * 0.82, C.wood, C.woodLt, C.woodDkk);
    stripes(put, S * 0.22, S * 0.3, S * 0.78, S * 0.42, S * 0.07, C.teal, C.cream);
    row(put, Math.round(S * 0.42), S * 0.2, S * 0.8, () => C.tealDk);
    row(put, Math.round(S * 0.56), S * 0.26, S * 0.74, () => C.woodDk);
    [[0.34, 0], [0.5, 1], [0.66, 0]].forEach(([x, fallen]) => {
      if (fallen) { ell(put, S * x, S * 0.54, S * 0.035, S * 0.018, (tx, ty) => mix('#e8e4d8', '#b0aa96', ty)); return; }
      [[0, -0.005], [-0.022, 0.04], [0.022, 0.04]].forEach(([dx, dy]) => {
        ell(put, S * (x + dx), S * (0.5 + dy), S * 0.016, S * 0.028, (tx, ty) => mix('#e8e4d8', '#b0aa96', tx + ty * 0.3));
        put(Math.round(S * (x + dx)), Math.round(S * (0.475 + dy)), '#b0aa96');
      });
    });
    [0.4, 0.47].forEach(x => ell(put, S * x, S * 0.79, S * 0.02, S * 0.02, (tx, ty) => mix(C.red, C.redDk, tx + ty * 0.4)));
  }
  function drawDartWall(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    plate(put, S * 0.24, S * 0.26, S * 0.76, S * 0.78, C.woodDk, C.wood, C.woodDkk);
    let i = 0;
    for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 4; gx++) {
      const x = S * (0.32 + gx * 0.12), y = S * (0.36 + gy * 0.14);
      i++;
      if ((gx + gy) % 3 === 2) {
        for (let t = 0; t < 1; t += 0.1) put(Math.round(x + Math.sin(t * 5) * 2), Math.round(y + t * S * 0.05), C.creamDk);
        continue;
      }
      const c = [C.red, C.glow, C.teal, C.violet][i % 4];
      ell(put, x, y, S * 0.032, S * 0.04, (tx, ty) => mix(mix(c, '#ffffff', 0.3), mix(c, '#000000', 0.3), clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    }
    [[0.28, 0.6], [0.6, 0.3]].forEach(([x, y]) => { stroke(put, S * x, S * y, S * (x + 0.05), S * (y - 0.03), 1.4, () => C.ironLt); put(Math.round(S * x), Math.round(S * y), C.red); });
    row(put, Math.round(S * 0.8), S * 0.2, S * 0.8, () => C.woodDkk);
  }
  function drawStriker(put, S) {
    shadow(put, S, S * 0.5, S * 0.2);
    for (let y = S * 0.14; y < S * 0.82; y++) { const w = S * 0.035; row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redLt, C.redDk, tx)); }
    for (let y = S * 0.2; y < S * 0.78; y += S * 0.06) row(put, Math.round(y), S * 0.46, S * 0.54, () => C.cream);
    dome(put, S * 0.5, S * 0.11, S * 0.05, S * 0.04, C.glow, C.glowLt, C.glowDk);
    plate(put, S * 0.46, S * 0.48, S * 0.54, S * 0.52, C.iron, C.ironLt, C.ironDk);
    plate(put, S * 0.36, S * 0.82, S * 0.64, S * 0.88, C.wood, C.woodLt, C.woodDkk);
    stroke(put, S * 0.62, S * 0.86, S * 0.74, S * 0.7, 2.6, () => C.wood);
    ell(put, S * 0.76, S * 0.66, S * 0.05, S * 0.04, (tx, ty) => mix(C.ironLt, C.ironDk, clamp(tx + ty * 0.4, 0, 1)));
    plate(put, S * 0.42, S * 0.14, S * 0.58, S * 0.18, C.glowDk, C.glow, C.woodDkk);
  }
  function drawPopcornCart(put, S) {
    shadow(put, S, S * 0.5, S * 0.28);
    plate(put, S * 0.3, S * 0.36, S * 0.7, S * 0.62, C.night, C.violetDk, C.oil);
    [0.34, 0.66].forEach(x => stroke(put, S * x, S * 0.36, S * x, S * 0.62, 1.4, () => C.glowDk));
    row(put, Math.round(S * 0.36), S * 0.28, S * 0.72, () => C.glowDk);
    for (let i = 0; i < 40; i++) {
      const x = S * (0.33 + (i * 37 % 100) / 100 * 0.34), y = S * (0.5 + (i * 53 % 100) / 100 * 0.09);
      put(Math.round(x), Math.round(y), i % 3 ? C.glowLt : '#fff8e0');
    }
    put(Math.round(S * 0.5), Math.round(S * 0.42), C.glow); put(Math.round(S * 0.5), Math.round(S * 0.41), C.glowLt);
    plate(put, S * 0.28, S * 0.62, S * 0.72, S * 0.74, C.red, C.redLt, C.redDkk);
    [0.36, 0.64].forEach(x => { ell(put, S * x, S * 0.78, S * 0.05, S * 0.05, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.13 && d <= 0.25 ? C.glowDk : null; }); });
    [[0.2, 0.85], [0.26, 0.88], [0.78, 0.84]].forEach(([x, y]) => put(Math.round(S * x), Math.round(S * y), C.glowLt));
  }
  function drawCandyStand(put, S) {
    shadow(put, S, S * 0.5, S * 0.26);
    plate(put, S * 0.3, S * 0.44, S * 0.7, S * 0.8, C.pink, '#ffc8e0', mix(C.pink, '#000', 0.5));
    stripes(put, S * 0.26, S * 0.28, S * 0.74, S * 0.4, S * 0.08, C.pink, C.cream);
    row(put, Math.round(S * 0.4), S * 0.24, S * 0.76, () => mix(C.pink, '#000', 0.4));
    [[0.38, 0.52], [0.5, 0.5], [0.62, 0.53]].forEach(([x, y]) => {
      stroke(put, S * x, S * (y + 0.1), S * x, S * y, 2, () => C.cream);
      ell(put, S * x, S * (y - 0.03), S * 0.04, S * 0.045, (tx, ty) => mix('#ffd8ec', C.pink, clamp(tx * 0.7 + ty * 0.5, 0, 1)));
    });
    grin(put, S * 0.5, S * 0.7, S * 0.05, false, mix(C.pink, '#000', 0.55), false);
    optic(put, S * 0.44, S * 0.64, S * 0.013, C.oil, C.oil, '#ffffff');
    optic(put, S * 0.56, S * 0.64, S * 0.013, C.oil, C.oil, '#ffffff');
  }
  function drawWagon(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    for (let y = S * 0.34; y < S * 0.72; y++) {
      const t = (y - S * 0.34) / (S * 0.38);
      const w = S * (0.3 * Math.sqrt(1 - (t - 1) * (t - 1) * 0.25));
      row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.violet, C.violetDk, clamp(tx * 1.1 + t * 0.2, 0, 1)));
    }
    for (let y = S * 0.28; y < S * 0.36; y++) { const t = (y - S * 0.28) / (S * 0.08); const w = S * (0.2 + t * 0.11); row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(C.redDk, C.redDkk, tx * 0.5)); }
    ell(put, S * 0.5, S * 0.5, S * 0.07, S * 0.07, (tx, ty) => mix(C.glowLt, C.glowDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
    optic(put, S * 0.5, S * 0.5, S * 0.022, C.oil, C.violetDk, C.oil);
    [0.32, 0.68].forEach(x => { for (let a = 0; a < 6.283; a += 0.05) put(Math.round(S * x + Math.cos(a) * S * 0.06), Math.round(S * 0.76 + Math.sin(a) * S * 0.06), C.glowDk); ell(put, S * x, S * 0.76, S * 0.015, S * 0.015, () => C.glow); });
    plate(put, S * 0.44, S * 0.72, S * 0.56, S * 0.76, C.wood, C.woodLt, C.woodDkk);
    put(Math.round(S * 0.34), Math.round(S * 0.42), C.glow); put(Math.round(S * 0.66), Math.round(S * 0.44), C.tealLt);
  }
  function drawMirrors(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    plate(put, S * 0.2, S * 0.3, S * 0.8, S * 0.82, C.night, C.violetDk, C.oil);
    [[0.3, 1], [0.5, -1], [0.7, 1]].forEach(([x, warp]) => {
      for (let y = S * 0.38; y < S * 0.76; y++) {
        const t = (y - S * 0.38) / (S * 0.38);
        const wob = Math.sin(t * 8) * warp * S * 0.008;
        row(put, Math.round(y), S * x - S * 0.055 + wob, S * x + S * 0.055 + wob, (tx) => mix(C.tealLt, C.tealDk, clamp(tx * 1.2 + t * 0.2, 0, 1)));
      }
      if (warp < 0) { optic(put, S * x, S * 0.52, S * 0.013, C.oil, C.oil, C.red); optic(put, S * (x + 0.03), S * 0.52, S * 0.013, C.oil, C.oil, C.red); }
    });
    plate(put, S * 0.24, S * 0.22, S * 0.76, S * 0.32, C.glowDk, C.glow, C.woodDkk);
    [0.3, 0.4, 0.5, 0.6, 0.7].forEach(x => put(Math.round(S * x), Math.round(S * 0.27), C.oil));
  }
  function drawFunhouse(put, S) {
    shadow(put, S, S * 0.5, S * 0.36);
    ell(put, S * 0.5, S * 0.5, S * 0.36, S * 0.34, (tx, ty) => mix(C.paint, C.paintDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    [-1, 1].forEach(s => ell(put, S * (0.5 + s * 0.32), S * 0.32, S * 0.09, S * 0.1, (tx, ty) => mix(C.teal, C.tealDk, tx + ty * 0.3)));
    [[-0.13, 0], [0.13, 0]].forEach(([dx]) => {
      for (let a = 0; a < 9; a += 0.12) {
        const r = a * S * 0.006;
        put(Math.round(S * (0.5 + dx) + Math.cos(a) * r), Math.round(S * 0.4 + Math.sin(a) * r), a % 1 < 0.5 ? C.oil : C.red);
      }
    });
    put(Math.round(S * 0.5), Math.round(S * 0.47), C.red);
    for (let y = S * 0.56; y < S * 0.82; y++) {
      const t = (y - S * 0.56) / (S * 0.26);
      const w = S * 0.14 * Math.sqrt(1 - t * t * 0.4);
      row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, () => C.oil);
    }
    for (let x = -0.12; x <= 0.12; x += 0.04) { for (let d = 0; d < 5; d++) row(put, Math.round(S * 0.56 + d), S * (0.5 + x) - (5 - d) * 0.5, S * (0.5 + x) + (5 - d) * 0.5, () => C.white); }
    grin(put, S * 0.5, S * 0.585, S * 0.16, false, C.blood, false);
  }
  function drawBuntingPoles(put, S) {
    shadow(put, S, S * 0.5, S * 0.34);
    [0.18, 0.82].forEach(x => { stroke(put, S * x, S * 0.3, S * x, S * 0.86, 3, () => C.woodDk); put(Math.round(S * x), Math.round(S * 0.29), C.glow); });
    bunting(put, S * 0.18, S * 0.32, S * 0.82, S * 0.32, 7, [C.red, C.glow, C.teal, C.violet, C.cream]);
    for (let d = 0; d < 4; d++) row(put, Math.round(S * 0.84 + d), S * 0.45 - d, S * 0.45 + 4 - d, () => C.redDk);
  }
  function drawLights(put, S) {
    shadow(put, S, S * 0.5, S * 0.2);
    stroke(put, S * 0.5, S * 0.2, S * 0.5, S * 0.88, 3.4, () => C.ironDk);
    ell(put, S * 0.5, S * 0.88, S * 0.08, S * 0.03, (tx, ty) => mix(C.iron, C.ironDk, ty));
    stroke(put, S * 0.34, S * 0.24, S * 0.66, S * 0.24, 2.4, () => C.ironDk);
    [[-1, 0.34], [1, 0.66]].forEach(([s, x0]) => {
      for (let t = 0; t <= 1; t += 0.02) {
        const x = lerp(S * x0, S * (0.5 + s * 0.42), t), y = S * 0.24 + Math.sin(t * Math.PI * 0.5) * S * 0.4;
        put(Math.round(x), Math.round(y), C.ironDk);
        if (Math.floor(t * 10) % 2 === 0 && (t * 100) % 10 < 2) {
          const dead = (Math.floor(t * 10) + (s > 0 ? 1 : 0)) % 3 === 0;
          ell(put, x, y + 3, 2.4, 3, () => dead ? C.ironDk : C.glow);
          if (!dead) put(Math.round(x), Math.round(y + 2), C.glowLt);
        }
      }
    });
    dome(put, S * 0.5, S * 0.17, S * 0.05, S * 0.04, C.glow, C.glowLt, C.glowDk);
  }
  function drawCage(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    plate(put, S * 0.22, S * 0.34, S * 0.78, S * 0.72, C.night, C.violetDk, C.oil);
    for (let i = 0; i < 7; i++) {
      const x = S * (0.27 + i * 0.077);
      if (i === 3) { for (let y = S * 0.36; y < S * 0.7; y++) { const t = (y - S * 0.36) / (S * 0.34); put(Math.round(x - Math.sin(t * 3.14) * S * 0.04), Math.round(y), C.ironLt); } continue; }
      if (i === 4) { for (let y = S * 0.36; y < S * 0.7; y++) { const t = (y - S * 0.36) / (S * 0.34); put(Math.round(x + Math.sin(t * 3.14) * S * 0.045), Math.round(y), C.ironLt); } continue; }
      stroke(put, x, S * 0.36, x, S * 0.7, 1.8, () => C.iron);
    }
    row(put, Math.round(S * 0.35), S * 0.22, S * 0.78, () => C.glowDk);
    row(put, Math.round(S * 0.7), S * 0.22, S * 0.78, () => C.glowDk);
    [0.32, 0.68].forEach(x => { for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * x + Math.cos(a) * S * 0.055), Math.round(S * 0.78 + Math.sin(a) * S * 0.055), C.woodDk); });
    plate(put, S * 0.38, S * 0.24, S * 0.62, S * 0.3, C.redDk, C.red, C.redDkk);
  }
  function drawPrizes(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    plate(put, S * 0.22, S * 0.26, S * 0.78, S * 0.8, C.woodDk, C.wood, C.woodDkk);
    row(put, Math.round(S * 0.3), S * 0.22, S * 0.78, () => C.woodDkk);
    [[0.32, '#a8825a'], [0.46, C.pink], [0.74, C.teal]].forEach(([x, c]) => {
      stroke(put, S * x, S * 0.3, S * x, S * 0.36, 1.2, () => C.creamDk);
      ell(put, S * x, S * 0.42, S * 0.045, S * 0.05, (tx, ty) => mix(mix(c, '#fff', 0.15), mix(c, '#000', 0.35), clamp(tx * 0.8 + ty * 0.5, 0, 1)));
      [-1, 1].forEach(s => ell(put, S * x + s * S * 0.035, S * 0.375, S * 0.016, S * 0.016, () => mix(c, '#000', 0.2)));
      optic(put, S * x - S * 0.015, S * 0.415, S * 0.007, C.oil, C.oil, '#ffffff');
      optic(put, S * x + S * 0.015, S * 0.415, S * 0.007, C.oil, C.oil, '#ffffff');
    });
    stroke(put, S * 0.6, S * 0.3, S * 0.6, S * 0.36, 1.2, () => C.creamDk); put(Math.round(S * 0.6), Math.round(S * 0.37), C.ironLt);
    row(put, Math.round(S * 0.62), S * 0.26, S * 0.74, () => C.woodDkk);
    [[0.34, C.glow], [0.46, C.red], [0.58, C.violet], [0.68, C.teal]].forEach(([x, c]) => ell(put, S * x, S * 0.585, S * 0.025, S * 0.03, (tx, ty) => mix(mix(c, '#fff', 0.2), mix(c, '#000', 0.3), tx + ty * 0.3)));
  }
  function drawDunk(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    plate(put, S * 0.28, S * 0.46, S * 0.72, S * 0.82, C.tealDk, C.teal, C.oil);
    for (let y = S * 0.5; y < S * 0.78; y++) row(put, Math.round(y), S * 0.31, S * 0.69, (tx) => {
      const w = Math.sin(tx * 14 + y * 0.3);
      return mix('#1c4a74', '#0e2440', clamp(0.5 + w * 0.3, 0, 1));
    });
    optic(put, S * 0.45, S * 0.56, S * 0.013, C.oil, C.oil, C.glow);
    optic(put, S * 0.55, S * 0.56, S * 0.013, C.oil, C.oil, C.glow);
    stroke(put, S * 0.5, S * 0.3, S * 0.5, S * 0.4, 1.6, () => C.ironDk);
    plate(put, S * 0.4, S * 0.4, S * 0.6, S * 0.44, C.wood, C.woodLt, C.woodDkk);
    stroke(put, S * 0.72, S * 0.5, S * 0.88, S * 0.42, 2.4, () => C.iron);
    [[0.05, C.red], [0.032, C.cream], [0.015, C.red]].forEach(([r, c]) => ell(put, S * 0.88, S * 0.4, S * r, S * r, () => c));
  }
  function drawPosters(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    plate(put, S * 0.2, S * 0.24, S * 0.8, S * 0.84, C.woodDk, C.wood, C.woodDkk);
    [[0.26, 0.3, C.cream, C.red], [0.45, 0.28, '#d8d2c0', C.violet], [0.63, 0.32, C.cream, C.teal]].forEach(([x, y, paper, ink], i) => {
      plate(put, S * x, S * y, S * (x + 0.15), S * (y + 0.4), mix(paper, '#000', 0.12), paper, mix(paper, '#000', 0.4));
      stroke(put, S * (x + 0.15), S * (y + 0.4), S * (x + 0.11), S * (y + 0.35), 1.6, () => mix(paper, '#000', 0.3));
      if (i === 0) { optic(put, S * (x + 0.075), S * (y + 0.14), S * 0.02, C.oil, C.oil, ink); grin(put, S * (x + 0.075), S * (y + 0.22), S * 0.03, false, ink, false); }
      if (i === 1) { stroke(put, S * (x + 0.04), S * (y + 0.3), S * (x + 0.11), S * (y + 0.08), 2, () => ink); }
      if (i === 2) { for (let a = 0; a < 6; a += 0.4) put(Math.round(S * (x + 0.075) + Math.cos(a) * S * 0.03), Math.round(S * (y + 0.16) + Math.sin(a) * S * 0.03), ink); }
      row(put, Math.round(S * (y + 0.05)), S * (x + 0.02), S * (x + 0.13), () => ink);
    });
  }
  function drawCalliope(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    plate(put, S * 0.24, S * 0.44, S * 0.76, S * 0.78, C.red, C.redLt, C.redDkk);
    plate(put, S * 0.28, S * 0.48, S * 0.72, S * 0.6, C.glowDk, C.glow, C.woodDkk);
    row(put, Math.round(S * 0.66), S * 0.3, S * 0.7, () => C.white);
    [0.34, 0.42, 0.5, 0.58, 0.66].forEach((x, i) => stroke(put, S * x, S * 0.66, S * x, S * (i % 2 ? 0.68 : 0.64), 2, () => C.oil));
    [[0.32, 0.16], [0.41, 0.1], [0.5, 0.06], [0.59, 0.1], [0.68, 0.16]].forEach(([x, top]) => {
      for (let y = S * top; y < S * 0.46; y++) row(put, Math.round(y), S * x - S * 0.025, S * x + S * 0.025, (tx) => mix(C.glowLt, C.glowDk, clamp(tx * 1.3, 0, 1)));
      ell(put, S * x, S * top, S * 0.025, S * 0.012, () => C.oil);
      put(Math.round(S * x), Math.round(S * (top - 0.04)), C.tealLt); put(Math.round(S * x + 2), Math.round(S * (top - 0.06)), C.tealLt);
    });
    [0.34, 0.66].forEach(x => { for (let a = 0; a < 6.283; a += 0.06) put(Math.round(S * x + Math.cos(a) * S * 0.06), Math.round(S * 0.82 + Math.sin(a) * S * 0.06), C.glowDk); });
  }
  function drawTeacup(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    ell(put, S * 0.5, S * 0.78, S * 0.32, S * 0.08, (tx, ty) => mix(C.violet, C.violetDk, clamp(tx * 0.6 + ty, 0, 1)));
    for (let y = S * 0.4; y < S * 0.68; y++) {
      const t = (y - S * 0.4) / (S * 0.28);
      const w = S * (0.22 - t * 0.1);
      row(put, Math.round(y), S * 0.46 - w, S * 0.46 + w, (tx) => {
        const band = Math.floor((tx * 2 + t) * 3);
        return mix(band % 2 ? C.teal : C.cream, band % 2 ? C.tealDk : C.creamDk, tx * 0.6 + t * 0.3);
      });
    }
    ell(put, S * 0.46, S * 0.42, S * 0.22, S * 0.05, (tx, ty) => mix(C.cream, C.creamDk, ty));
    ell(put, S * 0.46, S * 0.43, S * 0.18, S * 0.035, () => C.oil);
    for (let a = -1.3; a < 1.3; a += 0.05) put(Math.round(S * 0.72 + Math.cos(a) * S * 0.06), Math.round(S * 0.52 + Math.sin(a) * S * 0.08), C.tealDk);
    for (let a = 0; a < 7; a += 0.15) { const r = a * S * 0.006; put(Math.round(S * 0.42 + Math.cos(a) * r), Math.round(S * 0.56 + Math.sin(a) * r * 0.7), C.pink); }
    optic(put, S * 0.42, S * 0.43, S * 0.011, C.oil, C.oil, C.glow);
    optic(put, S * 0.5, S * 0.435, S * 0.011, C.oil, C.oil, C.glow);
  }

  // ============================== TILES ======================================
  function tileFn(fn) { return function (put, S) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = fn(x, y); if (c) put(x, y, c); } }; }
  // #4 FUNHOUSE CHECKER — warped red/cream tiles (the whole fairground floor).
  const tChecker = tileFn((x, y) => {
    const wob = Math.sin(y / 13) * 3.6;
    const cxq = Math.floor((x + wob) / 12), cyq = Math.floor(y / 12);
    const on = (cxq + cyq) % 2 === 0;
    let b = on ? mix(C.red, C.redDk, h2(cxq, cyq, 4) * 0.5) : mix(C.cream, C.creamDk, h2(cxq + 3, cyq, 4) * 0.5);
    if ((x + wob) % 12 < 0.8 || y % 12 < 0.8) b = C.oil;
    return b;
  });
  // #9 RING MAT — big red boss-arena circus mat, gold star scatter.
  const tRingMat = tileFn((x, y) => {
    let b = mix(C.redDk, C.redDkk, h2(x >> 3, y >> 3, 9) * 0.7);
    if ((x % 24 > 9 && x % 24 < 15) && (y % 24 > 9 && y % 24 < 15)) {
      const dx = Math.abs(x % 24 - 12), dy = Math.abs(y % 24 - 12);
      if (dx + dy < 3) b = C.glow;
    }
    if (Math.abs(Math.sin(x / 16 - y / 18)) > 0.985) b = mix(b, C.oil, 0.5);
    return b;
  });
  // dead grass — trampled outskirts (wrap ring past the fence).
  const tGrass = tileFn((x, y) => {
    const n = h2(x >> 1, y >> 1, 5);
    let b = mix('#6a6e46', '#4a4e32', n * 0.8);
    if (h2(x + 9, y + 2, 6) > 0.96) b = '#8a8e5e';
    if (h2(x, y + 4, 7) > 0.985) b = C.dirtDk;
    return b;
  });

  // ======================= REGISTRY buildArt hook ===========================
  var CV_ART = {
    C: C,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (11) ----
      ctx.spr('creepyClownHi', MS, MS, drawClown);
      ctx.spr('balloonWispHi', MS, MS, drawBalloon);
      ctx.spr('carnyBarkerHi', MS, MS, drawBarker);
      ctx.spr('possessedTeddyHi', MS, MS, drawTeddy);
      ctx.spr('popcornPoltergeistHi', MS, MS, drawPopcorn);
      ctx.spr('strongmanShadeHi', MS, MS, drawStrongman);
      ctx.spr('cottonCandyBlobHi', MS, MS, drawCandy);
      ctx.spr('knifeJugglerHi', MS, MS, drawJuggler);
      ctx.spr('whackAMoleHi', MS, MS, drawMole);
      ctx.spr('cymbalMonkeyHi', MS, MS, drawMonkey);
      ctx.spr('ferrisPhantomHi', MS, MS, drawFerris);
      ctx.MOB_HI.creepyClown = 'creepyClownHi';               ctx.MOB_DISPLAY.creepyClown = 52;
      ctx.MOB_HI.balloonWisp = 'balloonWispHi';               ctx.MOB_DISPLAY.balloonWisp = 46;
      ctx.MOB_HI.carnyBarker = 'carnyBarkerHi';               ctx.MOB_DISPLAY.carnyBarker = 54;
      ctx.MOB_HI.possessedTeddy = 'possessedTeddyHi';         ctx.MOB_DISPLAY.possessedTeddy = 48;
      ctx.MOB_HI.popcornPoltergeist = 'popcornPoltergeistHi'; ctx.MOB_DISPLAY.popcornPoltergeist = 50;
      ctx.MOB_HI.strongmanShade = 'strongmanShadeHi';         ctx.MOB_DISPLAY.strongmanShade = 58;
      ctx.MOB_HI.cottonCandyBlob = 'cottonCandyBlobHi';       ctx.MOB_DISPLAY.cottonCandyBlob = 52;
      ctx.MOB_HI.knifeJuggler = 'knifeJugglerHi';             ctx.MOB_DISPLAY.knifeJuggler = 54;
      ctx.MOB_HI.whackAMole = 'whackAMoleHi';                 ctx.MOB_DISPLAY.whackAMole = 48;
      ctx.MOB_HI.cymbalMonkey = 'cymbalMonkeyHi';             ctx.MOB_DISPLAY.cymbalMonkey = 46;
      ctx.MOB_HI.ferrisPhantom = 'ferrisPhantomHi';           ctx.MOB_DISPLAY.ferrisPhantom = 64;
      // ---- boss: THE RINGMASTER (128px canvas) ----
      ctx.spr('ringmasterHi', 128, 128, drawRingmaster);
      ctx.BOSS_HI.ringmaster = { key: 'ringmasterHi', size: 128, display: 122, bodyW: 46, bodyH: 68 };
      // ---- the trapeze rig (entrance) ----
      ctx.spr('cvTrapeze', 64, 64, drawTrapeze);
      // ---- decor (19) ----
      ctx.spr('cvdTicket', 64, 64, drawTicketBooth);
      ctx.spr('cvdCarousel', 64, 64, drawCarousel);
      ctx.spr('cvdFerris', 64, 64, drawFerrisProp);
      ctx.spr('cvdBottle', 64, 64, drawBottleBooth);
      ctx.spr('cvdDarts', 64, 64, drawDartWall);
      ctx.spr('cvdStriker', 64, 64, drawStriker);
      ctx.spr('cvdPopcorn', 64, 64, drawPopcornCart);
      ctx.spr('cvdCandy', 64, 64, drawCandyStand);
      ctx.spr('cvdWagon', 64, 64, drawWagon);
      ctx.spr('cvdMirrors', 64, 64, drawMirrors);
      ctx.spr('cvdFunhouse', 64, 64, drawFunhouse);
      ctx.spr('cvdBunting', 64, 64, drawBuntingPoles);
      ctx.spr('cvdLights', 64, 64, drawLights);
      ctx.spr('cvdCage', 64, 64, drawCage);
      ctx.spr('cvdPrizes', 64, 64, drawPrizes);
      ctx.spr('cvdDunk', 64, 64, drawDunk);
      ctx.spr('cvdPosters', 64, 64, drawPosters);
      ctx.spr('cvdCalliope', 64, 64, drawCalliope);
      ctx.spr('cvdTeacup', 64, 64, drawTeacup);
      // ---- tiles ----
      ctx.tex('cvchecker', 48, 48, tChecker);
      ctx.tex('cvringmat', 48, 48, tRingMat);
      ctx.tex('cvgrass', 48, 48, tGrass);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CV_ART;
  root.CARNIVAL_ART = CV_ART;
})(typeof window !== 'undefined' ? window : this);
