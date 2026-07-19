// ============================================================================
// game/js/maps/west/art.js — WILD WEST TOWN (realm 13) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 2 3 4 5 6 16 18
// (GANG RUSTLER · SIX-GUN BANDIT · DYNAMITE DAN · RATTLESNAKE · VULTURE ·
// TUMBLEWEED · DUST DEVIL · SCORPION), THE OUTLAW SHERIFF (render_west_boss
// final: #2 NIGHT RIDER + WHITE HAT — plus a HATLESS P2 variant when the
// white hat burns off), 13 decor + THE HORSE (entrance victim), tiles
// #1 2 3 4 5 6 10. Spaghetti-western frontier town at high noon: sun-bleached
// wood, packed dirt, gunmetal, leather, gold — dusty and TENSE.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- west palette (west_kit.js W, verbatim; all 6-digit) ------------------
  var W = {
    OUT: '#160e08',
    sand: '#c8a878', sandLt: '#e8cc9a', sandDk: '#96784e', sandDkk: '#5e4a2e',
    wood: '#8a6a48', woodLt: '#b08e62', woodDk: '#5a4430', woodDkk: '#34281c',
    leather: '#7a4e2e', leatherLt: '#a06e42', leatherDk: '#4a2e1a',
    iron: '#5a5e66', ironLt: '#9aa0aa', ironDk: '#26282e',
    red: '#a83028', redLt: '#d05a4a', redDk: '#601812',
    navy: '#2e4058', navyLt: '#4e6a8a', navyDk: '#1a2434',
    gold: '#e0a832', goldLt: '#f8d878', goldDk: '#8a6418',
    skin: '#d8a878', skinDk: '#a87850',
    bone: '#e8e0c8', boneDk: '#b0a888',
    cactus: '#5a7e46', cactusLt: '#7ea862', cactusDk: '#34502a',
    shade: '#3a2e28',
    oil: '#0c0806', white: '#f4f4f4',
    blood: '#8a1622', brass: '#c8963c'
  };

  // ---- shared helpers (factory_kit lineage — ported, ES6 kept) --------------
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
  function shadow(put, Sz, cx, w, yy) { ell(put, cx, yy || Sz * 0.94, w, Sz * 0.035, () => W.oil); }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ---- kit helpers (west_kit.js: hat / bandana / gun / badge / body) --------
  function hat(put, cx, cy, w, cols, tilt) {
    const base = cols[0], lt = cols[1], dk = cols[2];
    tilt = tilt || 0;
    ell(put, cx, cy, w, w * 0.32, (tx, ty) => mix(lt, dk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    for (let y = 0; y < w * 0.85; y++) {
      const t = y / (w * 0.85);
      const ww = w * (0.55 - t * 0.12 - (t > 0.7 ? (t - 0.7) * 0.5 : 0));
      row(put, Math.round(cy - y), cx - ww + tilt * y, cx + ww + tilt * y, (tx) => {
        let b = mix(lt, base, clamp(tx * 1.3, 0, 1));
        if (tx > 0.7) b = mix(b, dk, 0.55);
        if (t > 0.5 && Math.abs(tx - 0.5) < 0.1) b = mix(b, dk, 0.35);
        return b;
      });
    }
    row(put, Math.round(cy - w * 0.14), cx - w * 0.52, cx + w * 0.52, () => dk);
  }
  function bandana(put, cx, cy, w, c, cDk) {
    for (let y = 0; y < w * 0.7; y++) {
      const t = y / (w * 0.7), ww = w * (1 - t * 0.3);
      row(put, Math.round(cy + y), cx - ww, cx + ww, (tx) => {
        let b = mix(c, cDk, clamp(tx * 0.9 + t * 0.4, 0, 1));
        if ((tx * 6 | 0) % 2 === 0 && t < 0.4) b = mix(b, '#ffffff', 0.15);
        return b;
      });
    }
    for (let y = 0; y < w * 0.5; y++) { const t = y / (w * 0.5); put(Math.round(cx + w * (0.7 - t * 0.2)), Math.round(cy + w * 0.6 + y), cDk); }
  }
  function gun(put, x, y, s, flip) {
    const f = flip ? -1 : 1;
    stroke(put, x, y, x + f * s * 0.9, y, s * 0.22, () => W.iron);
    stroke(put, x, y, x + f * s * 0.9, y, s * 0.08, () => W.ironLt);
    ell(put, x + f * s * 0.15, y + s * 0.08, s * 0.16, s * 0.16, (tx, ty) => mix(W.ironLt, W.ironDk, tx + ty * 0.3));
    stroke(put, x - f * s * 0.05, y + s * 0.1, x - f * s * 0.18, y + s * 0.32, s * 0.14, () => W.leatherDk);
    put(Math.round(x + f * s * 0.92), Math.round(y - 1), W.ironLt);
  }
  function badge(put, x, y, r, c) {
    for (let i = 0; i < 5; i++) {
      const a = -1.57 + i * 1.257;
      stroke(put, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, 1.4, () => c);
    }
    put(Math.round(x), Math.round(y), mix(c, '#ffffff', 0.5));
  }
  function body(put, S, cx, o) {
    o = o || {};
    const coat = o.coat || [W.leather, W.leatherLt, W.leatherDk];
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.04, S * 0.62, cx + s * S * 0.05, S * 0.84, S * 0.03, () => o.pants || W.navy);
      plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.84, cx + s * S * 0.05 + S * 0.035, S * 0.88, W.leatherDk, W.leather, W.oil);
      put(Math.round(cx + s * S * 0.05), Math.round(S * 0.845), W.brass);
    });
    for (let y = S * 0.42; y < S * 0.64; y++) {
      const t = (y - S * 0.42) / (S * 0.22), w = S * (0.085 + t * 0.01) * (o.wide || 1);
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix(coat[1], coat[0], clamp(tx * 1.3, 0, 1));
        if (tx > 0.72) b = mix(b, coat[2], 0.6);
        if (o.shirt && Math.abs(tx - 0.5) < 0.08 && t < 0.6) b = mix(b, o.shirt, 0.8);
        return b;
      });
    }
    row(put, Math.round(S * 0.62), cx - S * 0.075, cx + S * 0.075, () => W.leatherDk);
    put(Math.round(cx), Math.round(S * 0.62), W.gold);
  }

  // ============================ MOBS (8) =====================================
  // 1 · GANG RUSTLER — knife-swarm bandit.
  function drawRustler(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { coat: [W.shade, '#5a4a40', W.oil], shirt: W.red });
    stroke(put, cx + S * 0.08, S * 0.46, cx + S * 0.16, S * 0.36, S * 0.02, () => W.shade);
    stroke(put, cx + S * 0.17, S * 0.34, cx + S * 0.21, S * 0.28, 2, () => W.ironLt);
    stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.13, S * 0.56, S * 0.02, () => W.shade);
    ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
    optic(put, cx - S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#ffffff');
    optic(put, cx + S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#ffffff');
    bandana(put, cx, S * 0.37, S * 0.055, W.red, W.redDk);
    hat(put, cx, S * 0.3, S * 0.085, [W.leatherDk, W.leather, W.oil], 0.1);
  }
  // 2 · SIX-GUN BANDIT — aimed single shots.
  function drawBandit(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    body(put, S, cx, { coat: [W.navy, W.navyLt, W.navyDk], shirt: '#c8bca0' });
    stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.18, S * 0.45, S * 0.022, () => W.navy);
    gun(put, cx + S * 0.19, S * 0.445, S * 0.09);
    stroke(put, cx - S * 0.08, S * 0.47, cx - S * 0.12, S * 0.58, S * 0.02, () => W.navy);
    ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
    optic(put, cx - S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#ffffff');
    optic(put, cx + S * 0.02, S * 0.335, S * 0.011, W.oil, W.oil, '#ffffff');
    bandana(put, cx, S * 0.37, S * 0.055, W.navy, W.navyDk);
    hat(put, cx, S * 0.295, S * 0.09, [W.leather, W.leatherLt, W.leatherDk], -0.08);
    put(Math.round(cx + S * 0.29), Math.round(S * 0.44), W.goldLt);
  }
  // 3 · DYNAMITE DAN — TNT lobber, fuse mortar.
  function drawDan(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.24);
    body(put, S, cx, { coat: [W.red, W.redLt, W.redDk], shirt: '#c8bca0', wide: 1.15 });
    stroke(put, cx + S * 0.09, S * 0.45, cx + S * 0.15, S * 0.3, S * 0.024, () => W.red);
    [[-0.02, 0], [0.01, -0.01], [0.04, 0]].forEach(([dx, dy]) => plate(put, cx + S * (0.13 + dx), S * (0.22 + dy), cx + S * (0.155 + dx), S * (0.3 + dy), W.redDk, W.red, W.oil));
    stroke(put, cx + S * 0.14, S * 0.21, cx + S * 0.17, S * 0.17, 1.2, () => W.boneDk);
    put(Math.round(cx + S * 0.175), Math.round(S * 0.16), W.goldLt);
    put(Math.round(cx + S * 0.19), Math.round(S * 0.15), W.gold);
    stroke(put, cx - S * 0.09, S * 0.45, cx - S * 0.14, S * 0.55, S * 0.022, () => W.red);
    ell(put, cx, S * 0.35, S * 0.055, S * 0.06, (tx, ty) => mix(W.skin, W.skinDk, clamp(tx + ty * 0.3, 0, 1)));
    for (let x = -0.05; x <= 0.05; x += 0.014) { const h = 3 + Math.abs(Math.sin(x * 90)) * 4; for (let d = 0; d < h; d++) put(Math.round(cx + x * S), Math.round(S * 0.29 - d), d > h - 2 ? W.ironDk : W.shade); }
    optic(put, cx - S * 0.02, S * 0.34, S * 0.013, W.oil, W.oil, W.goldLt);
    optic(put, cx + S * 0.02, S * 0.34, S * 0.013, W.oil, W.oil, W.goldLt);
    for (let t = -1; t <= 1; t += 0.2) put(Math.round(cx + t * S * 0.03), Math.round(S * 0.385 + (1 - t * t) * 1.6), W.oil);
  }
  // 4 · RATTLESNAKE — coiled striker, rattle warn.
  function drawRattler(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.28);
    for (let a = 0; a < 13; a += 0.04) {
      const r = S * 0.05 + a * S * 0.012;
      const x = cx + Math.cos(a) * r, y = S * 0.64 + Math.sin(a) * r * 0.5;
      ell(put, x, y, S * 0.028, S * 0.024, (tx, ty) => {
        let b = mix('#b08e5a', '#6e5432', clamp(tx * 0.8 + ty * 0.5, 0, 1));
        if (Math.abs((a * 2.4) % 1) < 0.3) b = mix(b, '#4a3820', 0.6);
        return b;
      });
    }
    stroke(put, cx + S * 0.1, S * 0.52, cx + S * 0.13, S * 0.36, S * 0.032, () => '#a8865a');
    ell(put, cx + S * 0.14, S * 0.33, S * 0.045, S * 0.035, (tx, ty) => mix('#b08e5a', '#6e5432', tx + ty * 0.4));
    optic(put, cx + S * 0.12, S * 0.325, S * 0.01, W.oil, W.oil, W.gold);
    stroke(put, cx + S * 0.18, S * 0.34, cx + S * 0.21, S * 0.35, 1, () => W.blood);
    stroke(put, cx - S * 0.12, S * 0.6, cx - S * 0.18, S * 0.42, S * 0.02, () => '#a8865a');
    [[0, 0], [0.008, -0.045], [0.014, -0.085]].forEach(([dx, dy], i) => ell(put, cx - S * (0.19 + dx * 2), S * (0.4 + dy), S * (0.022 - i * 0.004), S * 0.025, (tx, ty) => mix(W.bone, W.boneDk, ty)));
    [[-0.26, 0.34], [-0.13, 0.3]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), W.boneDk));
  }
  // 5 · VULTURE — circling diver.
  function drawVulture(put, S) {
    const cx = S * 0.5, cy = S * 0.42;
    shadow(put, S, cx, S * 0.18);
    [-1, 1].forEach(s => {
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        stroke(put, cx + s * S * 0.04, cy, cx + s * S * (0.1 + t * 0.24), cy - S * (0.1 - t * 0.16), 2.6, () => t > 0.65 ? W.oil : '#3e342c');
      }
    });
    ell(put, cx, cy + S * 0.04, S * 0.06, S * 0.09, (tx, ty) => mix('#4a3e34', '#241c14', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
    stroke(put, cx, cy - S * 0.02, cx + S * 0.03, cy - S * 0.1, S * 0.02, () => '#c88a7a');
    ell(put, cx + S * 0.04, cy - S * 0.12, S * 0.032, S * 0.03, (tx, ty) => mix('#d8a090', '#a06858', tx + ty * 0.3));
    stroke(put, cx + S * 0.07, cy - S * 0.115, cx + S * 0.1, cy - S * 0.1, 2, () => W.boneDk);
    put(Math.round(cx + S * 0.1), Math.round(cy - S * 0.095), W.boneDk);
    optic(put, cx + S * 0.035, cy - S * 0.125, S * 0.009, W.oil, W.oil, '#ffffff');
    ell(put, cx, cy - S * 0.015, S * 0.045, S * 0.02, (tx, ty) => mix('#5a4e42', '#2e261e', ty));
    for (let i = -1; i <= 1; i++) stroke(put, cx + i * 2, cy + S * 0.12, cx + i * S * 0.03, cy + S * 0.2, 2, () => '#3e342c');
  }
  // 6 · TUMBLEWEED — wind-blown rolling hazard.
  function drawTumbleweed(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.28);
    let seed = 5;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 40; i++) {
      const a1 = rnd() * 6.28, a2 = a1 + 0.8 + rnd() * 1.6;
      const r1 = S * (0.08 + rnd() * 0.14), r2 = S * (0.08 + rnd() * 0.14);
      stroke(put, cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1 * 0.9, cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2 * 0.9, 1.2, () => i % 3 ? '#a8865a' : '#6e5432');
    }
    for (let a = 0; a < 6.283; a += 0.1) if (Math.sin(a * 7) > 0) put(Math.round(cx + Math.cos(a) * S * 0.21), Math.round(cy + Math.sin(a) * S * 0.19), '#8a6a40');
    [[-0.32, 0.7], [-0.38, 0.62], [-0.34, 0.78]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.03, S * 0.02, () => W.sandLt));
    put(Math.round(cx - S * 0.03), Math.round(cy - S * 0.02), W.gold);
    put(Math.round(cx + S * 0.02), Math.round(cy - S * 0.02), W.gold);
  }
  // 16 · DUST DEVIL — living whirlwind, flings grit.
  function drawDustDevil(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    for (let y = 0; y < S * 0.55; y++) {
      const t = y / (S * 0.55);
      const w = S * (0.05 + t * 0.16);
      const off = Math.sin(y * 0.12) * S * 0.03 * (1 - t * 0.4);
      row(put, Math.round(S * 0.78 - y), cx - w + off, cx + w + off, (tx) => {
        const band = Math.abs(Math.sin(tx * 9 + y * 0.2));
        if (band < 0.28) return null;
        return mix(W.sandLt, W.sandDk, clamp(tx * 0.6 + band * 0.4 - t * 0.2, 0, 1));
      });
    }
    [[0.26, 0.4, '#8a6a40'], [-0.28, 0.5, '#6e5432'], [0.3, 0.62, W.cactusDk], [-0.24, 0.28, '#8a6a40']].forEach(([dx, dy, c]) => {
      put(Math.round(cx + dx * S), Math.round(S * dy), c); put(Math.round(cx + dx * S + 1), Math.round(S * dy + 1), c);
    });
    optic(put, cx - S * 0.03, S * 0.45, S * 0.013, W.oil, W.oil, W.gold);
    optic(put, cx + S * 0.035, S * 0.45, S * 0.013, W.oil, W.oil, W.gold);
    [[-0.14, 0.8], [0.12, 0.82], [0, 0.84]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.05, S * 0.025, () => W.sandLt));
  }
  // 18 · SCORPION — burrow + sting erupt.
  function drawScorpion(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    for (let t = 0; t <= 1; t += 0.05) {
      const x = cx - S * 0.08 + t * S * 0.2;
      ell(put, x, S * 0.62, S * (0.05 - t * 0.012), S * 0.035, (tx, ty) => mix('#c8863a', '#7a4a18', clamp(tx * 0.7 + ty * 0.5 + (Math.floor(t * 6) % 2) * 0.2, 0, 1)));
    }
    for (let t = 0; t <= 1; t += 0.04) {
      const a = t * 2.6;
      const x = cx - S * 0.1 - Math.sin(a) * S * 0.09 + t * S * 0.02;
      const y = S * 0.6 - (1 - Math.cos(a)) * S * 0.12;
      ell(put, x, y, S * (0.022 - t * 0.006), S * 0.02, (tx, ty) => mix('#c8863a', '#7a4a18', tx + ty * 0.3));
    }
    stroke(put, cx - S * 0.14, S * 0.34, cx - S * 0.1, S * 0.3, 2, () => W.oil);
    put(Math.round(cx - S * 0.095), Math.round(S * 0.295), W.blood);
    [-1, 1].forEach(s => {
      stroke(put, cx + S * 0.12, S * 0.62 + s * 2, cx + S * 0.2, S * 0.6 + s * S * 0.03, S * 0.02, () => '#a86a28');
      ell(put, cx + S * 0.22, S * 0.6 + s * S * 0.035, S * 0.03, S * 0.02, (tx, ty) => mix('#c8863a', '#7a4a18', tx + ty * 0.3));
    });
    [-0.04, 0.02, 0.08].forEach(dx => [-1, 1].forEach(s => stroke(put, cx + dx * S, S * 0.63, cx + dx * S + s * S * 0.05, S * 0.7, 1.6, () => '#8a5a20')));
    optic(put, cx + S * 0.1, S * 0.6, S * 0.009, W.oil, W.oil, W.blood);
    ell(put, cx, S * 0.74, S * 0.2, S * 0.035, (tx, ty) => mix(W.sand, W.sandDk, ty));
  }

  // ==================== THE OUTLAW SHERIFF (boss) ============================
  // sheriff(put,S,p) parameterized (render_west_boss.js) with the FINAL night-
  // rider + white-hat params inlined; p.noHat skips the hat (P2: it burns off).
  function sheriff(put, S, p) {
    const cx = S * 0.5, T = p.tall || 1;
    const y = (v) => S * (1 - (1 - v) * T);
    const skin = p.skin || [W.skin, W.skinDk];
    shadow(put, S, cx, S * 0.24);
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.045, y(0.6), cx + s * S * 0.055, S * 0.84, S * 0.034, () => p.pants || W.navyDk);
      if (p.chaps) stroke(put, cx + s * S * 0.05, y(0.62), cx + s * S * 0.062, S * 0.82, S * 0.045, () => W.leatherDk);
      plate(put, cx + s * S * 0.055 - S * 0.035, S * 0.84, cx + s * S * 0.055 + S * 0.04, S * 0.885, W.leatherDk, W.leather, W.oil);
      if (p.spurGlint !== false) put(Math.round(cx + s * S * 0.09), Math.round(S * 0.855), W.goldLt);
    });
    const d = p.duster;
    for (let yy = y(0.4); yy < S * 0.8; yy++) {
      const t = (yy - y(0.4)) / (S * 0.8 - y(0.4));
      let w = S * (0.09 + t * 0.075) * (p.build || 1);
      if (t > 0.55) w = S * (0.09 + t * 0.09) * (p.build || 1);
      row(put, Math.round(yy), cx - w, cx + w, (tx) => {
        if (t > 0.5 && Math.abs(tx - 0.5) < 0.07) return null;
        let b = mix(d[1], d[0], clamp(tx * 1.3, 0, 1));
        if (tx > 0.74) b = mix(b, d[2], 0.6);
        if (t < 0.42 && Math.abs(tx - 0.5) < 0.1 && p.shirt) b = mix(b, p.shirt, 0.85);
        if (t > 0.15 && t < 0.2) b = mix(b, d[2], 0.3);
        return b;
      });
    }
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, y(0.415), cx + s * S * 0.075, y(0.52), 1.6, () => d[2]));
    row(put, Math.round(y(0.585)), cx - S * 0.08 * (p.build || 1), cx + S * 0.08 * (p.build || 1), () => W.leatherDk);
    ell(put, cx, y(0.585), S * 0.016, S * 0.014, () => W.gold);
    stroke(put, cx - S * 0.08, y(0.6), cx + S * 0.08, y(0.635), 2.2, () => W.leather);
    const armY = y(0.465);
    if (p.guns === 'twin') {
      [-1, 1].forEach(s => {
        stroke(put, cx + s * S * 0.08, armY, cx + s * S * 0.19, y(0.45), S * 0.024, () => d[0]);
        gun(put, cx + s * S * 0.2, y(0.445), S * 0.1, s === -1);
      });
    } else if (p.guns === 'drawn') {
      stroke(put, cx + S * 0.08, armY, cx + S * 0.19, y(0.45), S * 0.024, () => d[0]);
      gun(put, cx + S * 0.2, y(0.445), S * 0.1);
      stroke(put, cx - S * 0.08, armY, cx - S * 0.13, y(0.57), S * 0.022, () => d[0]);
    } else {
      [-1, 1].forEach(s => {
        stroke(put, cx + s * S * 0.08, armY, cx + s * S * 0.13, y(0.585), S * 0.022, () => d[0]);
        ell(put, cx + s * S * 0.135, y(0.6), S * 0.02, S * 0.018, (tx, ty) => mix(skin[0], skin[1], tx + ty));
        plate(put, cx + s * S * 0.1 - S * 0.02, y(0.62), cx + s * S * 0.1 + S * 0.02, y(0.7), W.leatherDk, W.leather, W.oil);
        put(Math.round(cx + s * S * 0.1), Math.round(y(0.615)), W.ironLt);
      });
    }
    if (p.badgeSide) badge(put, cx + p.badgeSide * S * 0.045, y(0.45), S * 0.026, p.badgeC || W.gold);
    const hy = y(0.335);
    ell(put, cx, hy, S * 0.058, S * 0.062, (tx, ty) => mix(skin[0], skin[1], clamp(tx + ty * 0.3, 0, 1)));
    const eyeC = p.eyeC || W.oil;
    optic(put, cx - S * 0.02, hy - S * 0.012, S * 0.011, W.oil, eyeC, p.eyeGlow ? eyeC : '#ffffff');
    optic(put, cx + S * 0.02, hy - S * 0.012, S * 0.011, W.oil, eyeC, p.eyeGlow ? eyeC : '#ffffff');
    if (p.eyeGlow) { put(Math.round(cx - S * 0.02), Math.round(hy - S * 0.012), p.eyeC); put(Math.round(cx + S * 0.02), Math.round(hy - S * 0.012), p.eyeC); }
    if (p.scar) stroke(put, cx + S * 0.035, hy - S * 0.045, cx + S * 0.05, hy + S * 0.01, 1, () => W.blood);
    row(put, Math.round(hy + S * 0.03), cx - S * 0.018, cx + S * 0.018, () => W.oil);
    if (p.noHat) {
      // white hat burned off — singed, matted hair + smoke wisps
      for (let x = -0.05; x <= 0.05; x += 0.013) { const h = 3 + Math.abs(Math.sin(x * 80)) * 4; for (let dd = 0; dd < h; dd++) put(Math.round(cx + x * S), Math.round(hy - S * 0.052 - dd), dd > h - 2 ? '#4a4038' : W.oil); }
      [[-0.02, -0.11], [0.03, -0.13], [0, -0.16]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(hy + S * dy), '#6a625a'));
    } else {
      hat(put, cx, hy - S * 0.048, S * (p.hatW || 0.095), p.hatCols, p.hatTilt || 0);
      if (p.hatBadge) badge(put, cx, hy - S * 0.06, S * 0.014, W.gold);
    }
  }
  var BOSS_P1 = {
    duster: [W.shade, '#5a4a40', W.oil], shirt: W.oil, pants: W.oil,
    hatCols: ['#d8d0bc', '#fff8e8', '#a89e88'], hatTilt: 0, hatBadge: true,
    badgeSide: -1, badgeC: W.iron, guns: 'twin', eyeC: W.red, eyeGlow: true
  };
  function drawSheriffP1(put, S) { sheriff(put, S, BOSS_P1); }
  function drawSheriffP2(put, S) {
    var p2 = {}; for (var k in BOSS_P1) p2[k] = BOSS_P1[k];
    p2.noHat = true; p2.eyeC = W.redLt;       // red glare doubles
    sheriff(put, S, p2);
  }

  // ============================ DECOR (13 + THE HORSE) =======================
  function siding(put, x0, y0, x1, y1, base, lt, dk) {
    for (let y = Math.round(y0); y < y1; y++) {
      const plank = Math.floor((y - y0) / 4) % 2 === 0;
      row(put, y, x0, x1, (tx) => {
        let b = mix(lt, base, clamp(tx * 1.25, 0, 1));
        if (tx > 0.86) b = mix(b, dk, 0.5);
        if (plank && (y - Math.round(y0)) % 4 === 0) b = mix(b, dk, 0.45);
        return b;
      });
    }
  }
  function vplanks(put, x0, y0, x1, y1, base, lt, dk) {
    for (let y = Math.round(y0); y < y1; y++) {
      row(put, y, x0, x1, (tx) => {
        let b = mix(lt, base, clamp(tx * 1.2, 0, 1));
        const px = tx * (x1 - x0);
        if ((px | 0) % 5 === 0) b = mix(b, dk, 0.5);
        if (tx > 0.9) b = mix(b, dk, 0.4);
        return b;
      });
    }
  }
  function doorway(put, cx, y0, w, h) {
    for (let y = y0; y < y0 + h; y++) row(put, Math.round(y), cx - w, cx + w, (tx) => mix('#241812', W.oil, clamp(tx + 0.2, 0, 1)));
  }
  function windowPane(put, cx, cy, w, h, lit) {
    for (let y = cy - h; y < cy + h; y++) row(put, Math.round(y), cx - w, cx + w, (tx) => lit ? mix(W.goldLt, W.gold, tx) : mix('#3a4450', '#1a2028', tx));
    stroke(put, cx - w, cy, cx + w, cy, 1, () => W.woodDkk);
    stroke(put, cx, cy - h, cx, cy + h, 1, () => W.woodDkk);
  }
  function roof(put, cx, yTop, half, h, base, dk) {
    for (let y = 0; y < h; y++) {
      const t = y / h, w = half * t;
      row(put, Math.round(yTop + y), cx - w, cx + w, (tx) => {
        let b = mix(base, dk, clamp(tx * 0.9 + t * 0.3, 0, 1));
        if (y % 3 === 0) b = mix(b, dk, 0.4);
        return b;
      });
    }
  }
  function drawSaloon(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.36);
    siding(put, S * 0.14, S * 0.3, S * 0.86, S * 0.88, W.wood, W.woodLt, W.woodDk);
    plate(put, S * 0.1, S * 0.18, S * 0.9, S * 0.32, W.woodLt, '#c8a878', W.woodDk);
    row(put, Math.round(S * 0.18), S * 0.08, S * 0.92, () => W.woodDkk);
    plate(put, S * 0.24, S * 0.2, S * 0.76, S * 0.29, W.shade, W.wood, W.oil);
    [0.3, 0.38, 0.46, 0.54, 0.62, 0.7].forEach((x) => put(Math.round(S * x), Math.round(S * 0.245), W.goldLt));
    row(put, Math.round(S * 0.235), S * 0.28, S * 0.72, () => W.gold);
    row(put, Math.round(S * 0.255), S * 0.28, S * 0.72, () => W.goldDk);
    plate(put, S * 0.12, S * 0.44, S * 0.88, S * 0.5, W.leatherDk, W.leather, W.oil);
    [-0.32, 0.32].forEach(dx => stroke(put, cx + dx * S, S * 0.5, cx + dx * S, S * 0.86, 2.2, () => W.woodDkk));
    doorway(put, cx, S * 0.56, S * 0.09, S * 0.3);
    [-1, 1].forEach(s => plate(put, cx + (s === -1 ? -S * 0.085 : S * 0.01), S * 0.6, cx + (s === -1 ? -S * 0.01 : S * 0.085), S * 0.76, W.woodLt, '#c8a878', W.woodDk));
    windowPane(put, cx - S * 0.22, S * 0.62, S * 0.05, S * 0.06, true);
    windowPane(put, cx + S * 0.22, S * 0.62, S * 0.05, S * 0.06, true);
  }
  function drawClockTower(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    vplanks(put, cx - S * 0.11, S * 0.34, cx + S * 0.11, S * 0.9, W.wood, W.woodLt, W.woodDk);
    vplanks(put, cx - S * 0.15, S * 0.74, cx + S * 0.15, S * 0.9, W.woodDk, W.wood, W.woodDkk);
    plate(put, cx - S * 0.14, S * 0.18, cx + S * 0.14, S * 0.36, W.woodLt, '#c8a878', W.woodDk);
    roof(put, cx, S * 0.06, S * 0.18, S * 0.12, W.redDk, W.oil);
    put(Math.round(cx), Math.round(S * 0.045), W.gold);
    ell(put, cx, S * 0.27, S * 0.085, S * 0.085, (tx, ty) => mix(W.bone, W.boneDk, clamp(tx * 0.6 + ty * 0.5, 0, 1)));
    ell(put, cx, S * 0.27, S * 0.093, S * 0.093, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.2 ? W.brass : null));
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; put(Math.round(cx + Math.cos(a) * S * 0.07), Math.round(S * 0.27 + Math.sin(a) * S * 0.07), W.oil); }
    stroke(put, cx, S * 0.27, cx, S * 0.21, 1.6, () => W.oil);
    stroke(put, cx - 1, S * 0.27, cx - 1, S * 0.225, 1.2, () => W.redDk);
    windowPane(put, cx, S * 0.5, S * 0.045, S * 0.055, false);
    doorway(put, cx, S * 0.78, S * 0.05, S * 0.12);
  }
  function drawJail(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.32);
    for (let y = Math.round(S * 0.34); y < S * 0.88; y++) {
      const ry = y - Math.round(S * 0.34);
      row(put, y, S * 0.18, S * 0.82, (tx) => {
        let b = mix('#9a9284', '#6a6458', clamp(tx * 1.15, 0, 1));
        if (ry % 7 === 0) b = mix(b, '#46423a', 0.55);
        else if (((tx * 20 | 0) + (ry / 7 | 0) * 3) % 5 === 0) b = mix(b, '#46423a', 0.35);
        return b;
      });
    }
    plate(put, S * 0.14, S * 0.26, S * 0.86, S * 0.36, W.woodDk, W.wood, W.woodDkk);
    plate(put, S * 0.32, S * 0.28, S * 0.68, S * 0.345, W.bone, '#fff8e0', W.boneDk);
    row(put, Math.round(S * 0.31), S * 0.38, S * 0.62, () => W.oil);
    plate(put, cx - S * 0.08, S * 0.56, cx + S * 0.08, S * 0.86, W.iron, W.ironLt, W.ironDk);
    [0.6, 0.68, 0.76].forEach(y => row(put, Math.round(S * y), cx - S * 0.075, cx + S * 0.075, () => W.ironDk));
    put(Math.round(cx + S * 0.05), Math.round(S * 0.7), W.gold);
    doorway(put, cx - S * 0.2, S * 0.46, S * 0.055, S * 0.12);
    for (let i = -1; i <= 1; i++) stroke(put, cx - S * 0.2 + i * S * 0.03, S * 0.46, cx - S * 0.2 + i * S * 0.03, S * 0.58, 1.4, () => W.ironLt);
    doorway(put, cx + S * 0.2, S * 0.46, S * 0.055, S * 0.12);
    for (let i = -1; i <= 1; i++) stroke(put, cx + S * 0.2 + i * S * 0.03, S * 0.46, cx + S * 0.2 + i * S * 0.03, S * 0.58, 1.4, () => W.ironLt);
  }
  function drawGallows(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.34);
    siding(put, S * 0.16, S * 0.62, S * 0.84, S * 0.74, W.wood, W.woodLt, W.woodDk);
    [-0.28, 0, 0.28].forEach(dx => stroke(put, cx + dx * S, S * 0.74, cx + dx * S, S * 0.88, 2.4, () => W.woodDk));
    for (let i = 0; i < 4; i++) plate(put, S * 0.74 + i * S * 0.035, S * (0.66 + i * 0.055), S * 0.86 + i * S * 0.02, S * (0.7 + i * 0.055), W.woodDk, W.wood, W.woodDkk);
    stroke(put, cx - S * 0.22, S * 0.62, cx - S * 0.22, S * 0.18, 3, () => W.woodDk);
    stroke(put, cx - S * 0.24, S * 0.18, cx + S * 0.24, S * 0.18, 2.6, () => W.woodDk);
    stroke(put, cx - S * 0.22, S * 0.28, cx - S * 0.1, S * 0.18, 2, () => W.woodDkk);
    stroke(put, cx + S * 0.14, S * 0.18, cx + S * 0.14, S * 0.36, 1.4, () => W.boneDk);
    ell(put, cx + S * 0.14, S * 0.42, S * 0.035, S * 0.05, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? mix(W.boneDk, '#8a7e5a', tx) : null));
    row(put, Math.round(S * 0.68), cx - S * 0.05, cx + S * 0.12, () => W.oil);
  }
  function drawWaterTower(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    [[-0.18, -0.24], [0.18, 0.24], [-0.06, -0.1], [0.06, 0.1]].forEach(([t, b]) => stroke(put, cx + t * S, S * 0.42, cx + b * S, S * 0.88, 2.2, () => W.woodDk));
    stroke(put, cx - S * 0.2, S * 0.66, cx + S * 0.2, S * 0.66, 1.6, () => W.woodDkk);
    stroke(put, cx - S * 0.14, S * 0.52, cx + S * 0.14, S * 0.52, 1.6, () => W.woodDkk);
    for (let y = Math.round(S * 0.2); y < S * 0.44; y++) {
      row(put, y, cx - S * 0.19, cx + S * 0.19, (tx) => {
        let b = mix(W.woodLt, W.wood, clamp(tx * 1.3, 0, 1));
        if (tx > 0.85) b = mix(b, W.woodDk, 0.6);
        const px = tx * 38; if ((px | 0) % 6 === 0) b = mix(b, W.woodDk, 0.5);
        return b;
      });
    }
    [0.24, 0.4].forEach(y => row(put, Math.round(S * y), cx - S * 0.19, cx + S * 0.19, () => W.ironDk));
    roof(put, cx, S * 0.1, S * 0.21, S * 0.1, W.woodDk, W.oil);
    stroke(put, cx, S * 0.44, cx, S * 0.52, 2, () => W.iron);
    put(Math.round(cx), Math.round(S * 0.55), W.navyLt);
    put(Math.round(cx), Math.round(S * 0.59), W.navyLt);
  }
  function drawHitchingPost(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    [-0.24, 0.24].forEach(dx => stroke(put, cx + dx * S, S * 0.52, cx + dx * S, S * 0.84, 3, () => W.woodDk));
    stroke(put, cx - S * 0.28, S * 0.54, cx + S * 0.28, S * 0.54, 2.6, () => W.wood);
    row(put, Math.round(S * 0.53), cx - S * 0.28, cx + S * 0.28, () => W.woodLt);
    stroke(put, cx - S * 0.08, S * 0.54, cx - S * 0.05, S * 0.66, 1.4, () => W.boneDk);
    ell(put, cx - S * 0.04, S * 0.69, S * 0.03, S * 0.035, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? W.boneDk : null));
    ell(put, cx + S * 0.24, S * 0.62, S * 0.028, S * 0.032, (tx, ty) => (ty < 0.75 && (tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.1 ? W.ironLt : null));
  }
  function drawCactus(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.2);
    const bd = (x0, y0, x1, y1, w) => stroke(put, x0, y0, x1, y1, w, () => W.cactus);
    bd(cx, S * 0.86, cx, S * 0.24, S * 0.06);
    stroke(put, cx - S * 0.02, S * 0.8, cx - S * 0.02, S * 0.26, 1.2, () => W.cactusLt);
    stroke(put, cx + S * 0.025, S * 0.8, cx + S * 0.025, S * 0.28, 1.2, () => W.cactusDk);
    bd(cx - S * 0.05, S * 0.52, cx - S * 0.16, S * 0.54, S * 0.045);
    bd(cx - S * 0.16, S * 0.56, cx - S * 0.16, S * 0.36, S * 0.045);
    bd(cx + S * 0.05, S * 0.62, cx + S * 0.15, S * 0.64, S * 0.045);
    bd(cx + S * 0.15, S * 0.66, cx + S * 0.15, S * 0.46, S * 0.045);
    stroke(put, cx - S * 0.175, S * 0.52, cx - S * 0.175, S * 0.38, 1, () => W.cactusLt);
    stroke(put, cx + S * 0.135, S * 0.62, cx + S * 0.135, S * 0.48, 1, () => W.cactusLt);
    for (let y = 0.28; y < 0.84; y += 0.07) { put(Math.round(cx - S * 0.065), Math.round(S * y), W.bone); put(Math.round(cx + S * 0.065), Math.round(S * (y + 0.03)), W.bone); }
    ell(put, cx, S * 0.22, S * 0.025, S * 0.02, () => W.redLt);
    put(Math.round(cx), Math.round(S * 0.215), W.goldLt);
  }
  function drawWagon(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.36);
    for (let y = Math.round(S * 0.3); y < S * 0.56; y++) {
      const t = (y - S * 0.3) / (S * 0.26);
      const w = S * (0.3 + Math.sin(t * Math.PI) * 0.015);
      row(put, y, cx - w, cx + w, (tx) => {
        let b = mix('#fff4dc', '#cbb894', clamp(tx * 1.25, 0, 1));
        const px = tx * 60; if ((px | 0) % 12 === 0) b = mix(b, '#a89468', 0.45);
        return b;
      });
    }
    ell(put, cx + S * 0.26, S * 0.43, S * 0.05, S * 0.1, (tx, ty) => mix('#241812', W.oil, tx));
    plate(put, cx - S * 0.32, S * 0.56, cx + S * 0.32, S * 0.68, W.wood, W.woodLt, W.woodDk);
    row(put, Math.round(S * 0.62), cx - S * 0.32, cx + S * 0.32, () => W.woodDk);
    [[-0.2, 0.09], [0.2, 0.11]].forEach(([dx, r]) => {
      const wx = cx + dx * S, wy = S * 0.76;
      ell(put, wx, wy, S * r, S * r, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? mix(W.leather, W.leatherDk, tx) : null));
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * S * r, wy - Math.sin(a) * S * r, wx + Math.cos(a) * S * r, wy + Math.sin(a) * S * r, 1.2, () => W.woodDk); }
      ell(put, wx, wy, S * 0.018, S * 0.018, () => W.ironDk);
    });
    stroke(put, cx - S * 0.32, S * 0.64, cx - S * 0.44, S * 0.7, 1.8, () => W.woodDk);
  }
  function drawBarrels(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.32);
    const barrel = (bx, by, r, h) => {
      for (let y = Math.round(by - h); y < by + h; y++) {
        const t = (y - (by - h)) / (2 * h);
        const w = r * (1 + Math.sin(t * Math.PI) * 0.14);
        row(put, y, bx - w, bx + w, (tx) => {
          let b = mix(W.woodLt, W.wood, clamp(tx * 1.25, 0, 1));
          if (tx > 0.85) b = mix(b, W.woodDk, 0.55);
          const px = tx * r * 2.2; if ((px | 0) % 4 === 0) b = mix(b, W.woodDk, 0.4);
          return b;
        });
      }
      [-0.55, 0.55].forEach(dy => row(put, Math.round(by + dy * h), bx - r * 1.1, bx + r * 1.1, () => W.ironDk));
    };
    barrel(cx - S * 0.13, S * 0.7, S * 0.1, S * 0.14);
    barrel(cx + S * 0.14, S * 0.7, S * 0.1, S * 0.14);
    barrel(cx, S * 0.44, S * 0.1, S * 0.14);
    plate(put, cx + S * 0.24, S * 0.74, cx + S * 0.4, S * 0.85, W.wood, W.woodLt, W.woodDk);
    stroke(put, cx + S * 0.24, S * 0.74, cx + S * 0.4, S * 0.85, 1, () => W.woodDkk);
    stroke(put, cx + S * 0.4, S * 0.74, cx + S * 0.24, S * 0.85, 1, () => W.woodDkk);
  }
  function drawChurch(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    vplanks(put, cx - S * 0.2, S * 0.5, cx + S * 0.2, S * 0.88, '#e0d8c8', '#f4eee0', '#a89e88');
    roof(put, cx, S * 0.36, S * 0.24, S * 0.15, W.woodDk, W.oil);
    vplanks(put, cx - S * 0.06, S * 0.22, cx + S * 0.06, S * 0.4, '#e0d8c8', '#f4eee0', '#a89e88');
    roof(put, cx, S * 0.08, S * 0.085, S * 0.15, W.woodDkk, W.oil);
    stroke(put, cx, S * 0.02, cx, S * 0.08, 1.4, () => W.gold);
    stroke(put, cx - S * 0.02, S * 0.045, cx + S * 0.02, S * 0.045, 1.4, () => W.gold);
    doorway(put, cx, S * 0.26, S * 0.03, S * 0.08);
    ell(put, cx, S * 0.3, S * 0.02, S * 0.022, (tx, ty) => mix(W.brass, W.goldDk, ty));
    doorway(put, cx, S * 0.68, S * 0.05, S * 0.2);
    ell(put, cx, S * 0.68, S * 0.05, S * 0.04, (tx, ty) => (ty < 0.55 ? mix('#241812', W.oil, tx) : null));
    windowPane(put, cx - S * 0.13, S * 0.66, S * 0.03, S * 0.05, false);
    windowPane(put, cx + S * 0.13, S * 0.66, S * 0.03, S * 0.05, false);
  }
  function drawWindmill(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.22);
    [[-0.16, -0.22], [0.16, 0.22]].forEach(([t, b]) => stroke(put, cx + t * S, S * 0.34, cx + b * S, S * 0.88, 2.2, () => W.woodDk));
    stroke(put, cx - S * 0.19, S * 0.62, cx + S * 0.19, S * 0.62, 1.5, () => W.woodDkk);
    stroke(put, cx - S * 0.17, S * 0.45, cx + S * 0.17, S * 0.45, 1.5, () => W.woodDkk);
    stroke(put, cx - S * 0.19, S * 0.62, cx + S * 0.17, S * 0.45, 1.2, () => W.woodDkk);
    const hub = [cx, S * 0.26];
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.35;
      const bx = hub[0] + Math.cos(a) * S * 0.16, by = hub[1] + Math.sin(a) * S * 0.16;
      stroke(put, hub[0], hub[1], bx, by, 1.2, () => W.ironDk);
      const px = hub[0] + Math.cos(a) * S * 0.12, py = hub[1] + Math.sin(a) * S * 0.12;
      stroke(put, px - Math.sin(a) * S * 0.03, py + Math.cos(a) * S * 0.03, px + Math.sin(a) * S * 0.03, py - Math.cos(a) * S * 0.03, 3.4, () => mix('#c8bca0', '#8a7e64', (i % 3) * 0.3));
    }
    ell(put, hub[0], hub[1], S * 0.025, S * 0.025, (tx, ty) => mix(W.ironLt, W.ironDk, ty));
    stroke(put, hub[0], hub[1], hub[0] + S * 0.2, hub[1] + S * 0.05, 1.4, () => W.iron);
    ell(put, hub[0] + S * 0.22, hub[1] + S * 0.055, S * 0.045, S * 0.028, (tx) => mix(W.red, W.redDk, tx));
  }
  function drawTrough(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.34);
    for (let y = Math.round(S * 0.56); y < S * 0.74; y++) {
      row(put, y, cx - S * 0.3, cx + S * 0.3, (tx) => {
        let b = mix(W.woodLt, W.wood, clamp(tx * 1.3, 0, 1));
        if (tx > 0.88) b = mix(b, W.woodDk, 0.6);
        const px = tx * 60; if ((px | 0) % 10 === 0) b = mix(b, W.woodDk, 0.5);
        return b;
      });
    }
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.3, S * 0.56, cx + s * S * 0.3, S * 0.78, 2.2, () => W.woodDk));
    for (let y = Math.round(S * 0.575); y < S * 0.62; y++) {
      row(put, y, cx - S * 0.27, cx + S * 0.27, (tx) => mix(W.navyLt, W.navy, clamp(tx + (y % 3) * 0.14, 0, 1)));
    }
    [[-0.15, 0.585], [0.05, 0.595], [0.18, 0.585]].forEach(([dx, y]) => put(Math.round(cx + dx * S), Math.round(S * y), '#cfe8ff'));
    stroke(put, cx - S * 0.36, S * 0.5, cx - S * 0.36, S * 0.74, 2.4, () => W.ironDk);
    stroke(put, cx - S * 0.42, S * 0.44, cx - S * 0.33, S * 0.5, 2, () => W.iron);
    stroke(put, cx - S * 0.35, S * 0.52, cx - S * 0.31, S * 0.56, 1.6, () => W.iron);
  }
  function drawStagecoach(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.38);
    plate(put, cx - S * 0.26, S * 0.4, cx + S * 0.26, S * 0.64, W.red, W.redLt, W.redDk);
    row(put, Math.round(S * 0.4), cx - S * 0.26, cx + S * 0.26, () => W.goldDk);
    row(put, Math.round(S * 0.63), cx - S * 0.26, cx + S * 0.26, () => W.goldDk);
    doorway(put, cx, S * 0.44, S * 0.055, S * 0.14);
    stroke(put, cx - S * 0.04, S * 0.44, cx - S * 0.04, S * 0.58, 1.4, () => W.gold);
    stroke(put, cx + S * 0.12, S * 0.42, cx + S * 0.12, S * 0.62, 1, () => W.redDk);
    put(Math.round(cx + S * 0.1), Math.round(S * 0.52), W.gold);
    plate(put, cx - S * 0.3, S * 0.34, cx - S * 0.14, S * 0.4, W.leatherDk, W.leather, W.oil);
    plate(put, cx + S * 0.02, S * 0.32, cx + S * 0.24, S * 0.38, '#cbb894', '#f0e0b8', '#8a7a58');
    stroke(put, cx + S * 0.02, S * 0.35, cx + S * 0.24, S * 0.35, 1, () => W.leatherDk);
    [[-0.18, 0.105], [0.18, 0.085]].forEach(([dx, r]) => {
      const wx = cx + dx * S, wy = S * 0.76;
      ell(put, wx, wy, S * r, S * r, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.15 ? mix(W.gold, W.goldDk, tx + ty * 0.3) : null));
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; stroke(put, wx - Math.cos(a) * S * r, wy - Math.sin(a) * S * r, wx + Math.cos(a) * S * r, wy + Math.sin(a) * S * r, 1.1, () => W.goldDk); }
      ell(put, wx, wy, S * 0.016, S * 0.016, () => W.ironDk);
    });
    stroke(put, cx - S * 0.28, S * 0.68, cx - S * 0.42, S * 0.72, 1.8, () => W.woodDk);
  }
  // THE HORSE — one hitched horse at the trough (the Sheriff's entrance victim).
  function drawHorse(put, S) {
    const cx = S * 0.5;
    shadow(put, S, cx, S * 0.3);
    // barrel body
    ell(put, cx - S * 0.02, S * 0.5, S * 0.2, S * 0.12, (tx, ty) => mix('#8a5e3a', '#4e3320', clamp(tx * 0.7 + ty * 0.6, 0, 1)));
    // haunch
    ell(put, cx - S * 0.16, S * 0.48, S * 0.1, S * 0.11, (tx, ty) => mix('#7a5232', '#42280f', clamp(tx * 0.6 + ty * 0.6, 0, 1)));
    // neck + head up (hitched)
    stroke(put, cx + S * 0.14, S * 0.46, cx + S * 0.24, S * 0.24, S * 0.06, () => mix('#8a5e3a', '#5a3a22', 0.4));
    ell(put, cx + S * 0.26, S * 0.2, S * 0.055, S * 0.075, (tx, ty) => mix('#8a5e3a', '#4e3320', clamp(tx + ty * 0.3, 0, 1)));
    ell(put, cx + S * 0.3, S * 0.24, S * 0.035, S * 0.03, (tx, ty) => mix('#6a4428', '#3a2214', ty));   // muzzle
    // ears
    [[0.24, 0.14], [0.29, 0.13]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S + S * 0.005, S * (dy - 0.04), 2, () => '#5a3a22'));
    optic(put, cx + S * 0.28, S * 0.19, S * 0.01, W.oil, W.oil, '#6a4a2e');
    // mane
    for (let d = 0; d < S * 0.22; d += 2) put(Math.round(cx + S * 0.19 - d * 0.12), Math.round(S * 0.24 + d), '#2e1c10');
    // legs
    [[-0.12, 0.62], [-0.02, 0.62], [0.08, 0.6], [0.16, 0.6]].forEach(([dx, y0]) => stroke(put, cx + dx * S, S * y0, cx + dx * S, S * 0.84, S * 0.028, () => mix('#6a4428', '#3a2214', 0.4)));
    [[-0.12, 0.84], [-0.02, 0.84], [0.08, 0.84], [0.16, 0.84]].forEach(([dx, y0]) => put(Math.round(cx + dx * S), Math.round(S * y0), W.oil));
    // tail
    for (let d = 0; d < S * 0.2; d += 2) put(Math.round(cx - S * 0.26 + Math.sin(d * 0.2) * 2), Math.round(S * 0.44 + d), '#2e1c10');
    // saddle hint
    ell(put, cx, S * 0.44, S * 0.07, S * 0.04, (tx, ty) => mix(W.leatherLt, W.leatherDk, tx + ty * 0.4));
  }

  // ============================ TILES (7) ====================================
  function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }
  function tDirt(put, S) {
    fill(put, S, (x, y) => {
      let b = mix(W.sand, W.sandDk, n2(x * 0.5, y * 0.5) * 0.45 + n2(x * 0.07, y * 0.07) * 0.35);
      const rut = Math.abs(((y + x * 0.08) % (S * 0.5)) - S * 0.25);
      if (rut < 2.5) b = mix(b, W.sandDkk, 0.4);
      if (n2(x, y) > 0.965) b = mix(b, W.sandDkk, 0.6);
      if (n2(x + 9, y) > 0.975) b = mix(b, W.sandLt, 0.7);
      return b;
    });
  }
  function tBoard(put, S) {
    fill(put, S, (x, y) => {
      const plankRow = Math.floor(y / (S * 0.125));
      const off = (plankRow % 2) * S * 0.25;
      let b = mix(W.woodLt, W.wood, n2(plankRow, Math.floor((x + off) / (S * 0.5))) * 0.7);
      b = mix(b, W.woodDk, n2(x * 0.8, y * 0.15) * 0.3);
      if (y % Math.round(S * 0.125) === 0) b = mix(b, W.woodDkk, 0.7);
      if ((x + off) % Math.round(S * 0.5) === 0) b = mix(b, W.woodDkk, 0.6);
      if (n2(x * 0.3, plankRow * 7) > 0.7 && (y % Math.round(S * 0.125)) > 3 && x % 9 === 4) b = mix(b, W.woodDk, 0.5);
      return b;
    });
  }
  function tSand(put, S) {
    fill(put, S, (x, y) => {
      let b = mix(W.sandLt, W.sand, n2(x * 0.06, y * 0.06) * 0.8);
      const rip = Math.sin((y + Math.sin(x * 0.05) * 8) * 0.35);
      if (rip > 0.7) b = mix(b, W.sandDk, 0.35);
      if (rip < -0.8) b = mix(b, '#f8e0b0', 0.3);
      if (n2(x, y) > 0.985) b = mix(b, W.sandDkk, 0.4);
      return b;
    });
  }
  function tCracked(put, S) {
    fill(put, S, (x, y) => {
      let b = mix('#b89468', '#8a6a44', n2(x * 0.08, y * 0.08) * 0.7);
      const cs = S * 0.22;
      const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
      let d1 = 9e9, d2 = 9e9;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
        const dd = (px - x) ** 2 + (py - y) ** 2;
        if (dd < d1) { d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
      }
      if (Math.sqrt(d2) - Math.sqrt(d1) < 2.2) b = mix(b, '#4a3620', 0.75);
      return b;
    });
  }
  function tRail(put, S) {
    fill(put, S, (x, y) => {
      let b = mix('#9a8a72', '#6a5c48', n2(x * 0.9, y * 0.9) * 0.8);
      if (n2(x + 3, y + 5) > 0.94) b = mix(b, '#c8b898', 0.6);
      const sy = y % Math.round(S * 0.33);
      if (sy > S * 0.1 && sy < S * 0.22) {
        b = mix(W.woodDk, W.wood, n2(Math.floor(y / (S * 0.33)), x * 0.1) * 0.5);
        if (sy === Math.round(S * 0.1) + 1 || sy === Math.round(S * 0.22) - 1) b = mix(b, W.woodDkk, 0.6);
      }
      if (Math.abs(x - S * 0.25) < 2 || Math.abs(x - S * 0.75) < 2) b = W.iron;
      if (Math.abs(x - S * 0.25 + 2.4) < 0.8 || Math.abs(x - S * 0.75 + 2.4) < 0.8) b = W.ironLt;
      return b;
    });
  }
  function tFloor(put, S) {
    fill(put, S, (x, y) => {
      const plankCol = Math.floor(x / (S * 0.166));
      let b = mix('#a87848', '#7a5430', n2(plankCol, Math.floor(y / (S * 0.6))) * 0.6);
      b = mix(b, '#5a3c20', n2(x * 0.12, y * 0.7) * 0.3);
      if (x % Math.round(S * 0.166) === 0) b = mix(b, '#34281c', 0.7);
      if (y % Math.round(S * 0.5) === Math.round(plankCol * 13) % Math.round(S * 0.5)) b = mix(b, '#34281c', 0.5);
      const st = ((x - S * 0.7) ** 2 + (y - S * 0.3) ** 2);
      if (st < 30 && st > 12) b = mix(b, '#48301a', 0.5);
      return b;
    });
  }
  function tFlats(put, S) {
    fill(put, S, (x, y) => {
      let b = mix(W.sandLt, W.sandDk, n2(x * 0.05, y * 0.05) * 0.75);
      const tr = Math.abs(y - (S * 0.5 + Math.sin(x * 0.11) * S * 0.18));
      if (tr < 1.6) b = mix(b, W.sandDkk, 0.35);
      if (tr > 1.6 && tr < 3) b = mix(b, W.sandLt, 0.3);
      if (n2(Math.floor(x / 11), Math.floor(y / 11)) > 0.82 && n2(x * 1.7, y * 1.7) > 0.6) b = mix(b, '#6e5838', 0.55);
      if (n2(x + 1, y + 2) > 0.985) b = mix(b, '#4a3820', 0.5);
      return b;
    });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var WEST_ART = {
    S: W,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (8) ----
      ctx.spr('gangRustlerHi', MS, MS, drawRustler);
      ctx.spr('sixGunBanditHi', MS, MS, drawBandit);
      ctx.spr('dynamiteDanHi', MS, MS, drawDan);
      ctx.spr('rattlesnakeHi', MS, MS, drawRattler);
      ctx.spr('vultureHi', MS, MS, drawVulture);
      ctx.spr('tumbleweedHi', MS, MS, drawTumbleweed);
      ctx.spr('scorpionHi', MS, MS, drawScorpion);
      ctx.spr('dustDevilHi', MS, MS, drawDustDevil);
      ctx.MOB_HI.gangRustler = 'gangRustlerHi';   ctx.MOB_DISPLAY.gangRustler = 92;
      ctx.MOB_HI.sixGunBandit = 'sixGunBanditHi';  ctx.MOB_DISPLAY.sixGunBandit = 101;
      ctx.MOB_HI.dynamiteDan = 'dynamiteDanHi';    ctx.MOB_DISPLAY.dynamiteDan = 109;
      ctx.MOB_HI.rattlesnake = 'rattlesnakeHi';    ctx.MOB_DISPLAY.rattlesnake = 101;
      ctx.MOB_HI.vulture = 'vultureHi';            ctx.MOB_DISPLAY.vulture = 105;
      ctx.MOB_HI.tumbleweed = 'tumbleweedHi';      ctx.MOB_DISPLAY.tumbleweed = 88;
      ctx.MOB_HI.scorpion = 'scorpionHi';          ctx.MOB_DISPLAY.scorpion = 101;
      ctx.MOB_HI.dustDevil = 'dustDevilHi';        ctx.MOB_DISPLAY.dustDevil = 118;
      // ---- boss: THE OUTLAW SHERIFF (128px; P1 white hat + P2 hatless) ----
      ctx.spr('westSheriffHi', 128, 128, drawSheriffP1);
      ctx.spr('westSheriffP2Hi', 128, 128, drawSheriffP2);
      ctx.BOSS_HI.outlawSheriff = { key: 'westSheriffHi', size: 128, display: 122, bodyW: 44, bodyH: 74 };
      // ---- decor (13 + THE HORSE) ----
      ctx.spr('wdSaloon', 64, 64, drawSaloon);
      ctx.spr('wdClock', 64, 64, drawClockTower);
      ctx.spr('wdJail', 64, 64, drawJail);
      ctx.spr('wdGallows', 64, 64, drawGallows);
      ctx.spr('wdWaterTower', 64, 64, drawWaterTower);
      ctx.spr('wdHitch', 64, 64, drawHitchingPost);
      ctx.spr('wdCactus', 64, 64, drawCactus);
      ctx.spr('wdWagon', 64, 64, drawWagon);
      ctx.spr('wdBarrels', 64, 64, drawBarrels);
      ctx.spr('wdChurch', 64, 64, drawChurch);
      ctx.spr('wdWindmill', 64, 64, drawWindmill);
      ctx.spr('wdTrough', 64, 64, drawTrough);
      ctx.spr('wdStagecoach', 64, 64, drawStagecoach);
      ctx.spr('wdHorse', 64, 64, drawHorse);
      // ---- tiles ----
      ctx.tex('wtdirt', 48, 48, tDirt);
      ctx.tex('wtboard', 48, 48, tBoard);
      ctx.tex('wtsand', 48, 48, tSand);
      ctx.tex('wtcracked', 48, 48, tCracked);
      ctx.tex('wtrail', 48, 48, tRail);
      ctx.tex('wtfloor', 48, 48, tFloor);
      ctx.tex('wtflats', 48, 48, tFlats);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = WEST_ART;
  root.WEST_ART = WEST_ART;
})(typeof window !== 'undefined' ? window : this);
