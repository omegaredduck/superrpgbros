// ============================================================================
// game/js/maps/crystal/art.js — CRYSTAL CAVERNS (realm 10) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: mobs #1 4 5 6 10 12 13 15
// 20, THE SHARDLORD (render_crystal_boss_final.js — GEODE COLOSSUS RAINBOW
// EDITION: giant, multi-gem, rainbow core, RED eyes, gold crown), 19 decor
// (all but #11 — moss became a floor tile), tiles #1(base rock) 2 4 5 6 7 8
// 9 10. Sparkle-adventure mood: saturated gems on dark rock.
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- crystal palette (crystal_kit.js K, verbatim) ------------------------
  var K = {
    OUT: '#0e0a14',
    rock: '#4a4258', rockLt: '#6e6484', rockDk: '#302a3e', rockDkk: '#1c1826',
    pink: '#ff7ab8', pinkLt: '#ffd0e8', pinkDk: '#b03a78',
    cyan: '#5ae8e0', cyanLt: '#ccfffa', cyanDk: '#1f9e98',
    purple: '#a06bf0', purpleLt: '#d8bcff', purpleDk: '#5c34a0',
    amber: '#ffb84a', amberLt: '#ffe8b0', amberDk: '#b0701e',
    green: '#6ae87a', greenLt: '#ccffd0', greenDk: '#2a9e42',
    void: '#38286e', voidLt: '#5c48a0', voidDk: '#201548',
    white: '#f4f4f4', oil: '#0a0810',
    gold: '#ffcd45', goldDk: '#b07d1e'
  };
  var GEMS = [[K.pink, K.pinkLt, K.pinkDk], [K.cyan, K.cyanLt, K.cyanDk], [K.purple, K.purpleLt, K.purpleDk], [K.amber, K.amberLt, K.amberDk], [K.green, K.greenLt, K.greenDk]];

  // ---- shared helpers (crystal_kit lineage — ES6 kept) ---------------------
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
    ell(put, x, y, r, r, (tx, ty) => mix(c || K.rock, cdk || K.rockDkk, 0.25 + ty * 0.6));
    put(Math.round(x), Math.round(y), cdk || K.rockDkk);
  }
  function optic(put, cx, cy, r, cDk, c, cLt) {
    ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) * (tx - 0.5) + (ty - 0.5) * (ty - 0.5) <= 0.25 ? cDk : null));
    ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
    ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
    put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
  }
  function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => K.oil); }
  function shard(put, cx, baseY, w, h, lean, cols) {
    const c = cols[0], lt = cols[1], dk = cols[2];
    for (let y = 0; y < h; y++) {
      const t = y / h, ww = w * (1 - t * 0.88);
      const off = lean * t * w * 2;
      row(put, Math.round(baseY - y), cx - ww + off, cx + ww + off, (tx) => {
        let b = mix(lt, c, clamp(t * 0.8 + tx * 0.3, 0, 1));
        if (tx < 0.32) b = mix(b, '#ffffff', 0.4);
        if (tx > 0.72) b = mix(b, dk, 0.6);
        return b;
      });
    }
    put(Math.round(cx + lean * w * 2), Math.round(baseY - h), '#ffffff');
  }
  function sparkle(put, x, y, c) { put(Math.round(x), Math.round(y), '#ffffff'); put(Math.round(x) + 2, Math.round(y), c); put(Math.round(x) - 2, Math.round(y), c); put(Math.round(x), Math.round(y) + 2, c); put(Math.round(x), Math.round(y) - 2, c); }
  function rockBase(put, cx, cy, rx, ry) {
    ell(put, cx, cy, rx, ry, (tx, ty) => mix(K.rockLt, K.rockDk, clamp(ty * 1.3, 0, 1)));
  }
  function h2(x, y, s) { let n = x * 374761393 + y * 668265263 + (s || 0) * 1442695041; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; }

  // ======================= MOBS (#1 4 5 6 10 12 13 15 20) ==================
  function drawShardling(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.14);
    [-1, 1].forEach(s => [[-0.02, 0.14], [0.06, 0.16]].forEach(([oy, len]) =>
      stroke(put, cx + s * S * 0.06, cy + oy * S + S * 0.06, cx + s * S * len, cy + oy * S + S * 0.12, 2, () => K.rockDk)));
    shard(put, cx, cy + S * 0.1, S * 0.09, S * 0.3, 0.06, GEMS[0]);
    shard(put, cx - S * 0.07, cy + S * 0.1, S * 0.05, S * 0.18, -0.2, GEMS[0]);
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.02), K.oil));
    stroke(put, cx - S * 0.015, cy + S * 0.02, cx + S * 0.015, cy + S * 0.02, 1, () => K.pinkDk);
    sparkle(put, cx + S * 0.08, cy - S * 0.14, K.pinkLt);
  }
  function drawAmethystLurker(put, S) {
    const cx = S * 0.5, cy = S * 0.56;
    shadow(put, S, cx, S * 0.22);
    rockBase(put, cx, cy + S * 0.12, S * 0.2, S * 0.07);
    shard(put, cx - S * 0.08, cy + S * 0.12, S * 0.06, S * 0.26, -0.12, GEMS[2]);
    shard(put, cx + S * 0.06, cy + S * 0.12, S * 0.075, S * 0.34, 0.05, GEMS[2]);
    shard(put, cx + S * 0.16, cy + S * 0.12, S * 0.05, S * 0.2, 0.25, GEMS[2]);
    [[-0.08, -0.02], [0.06, -0.1]].forEach(([ox, oy]) => {
      ell(put, cx + ox * S, cy + oy * S, S * 0.022, S * 0.018, () => K.oil);
      put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.amber);
    });
    [-1, 1].forEach(s => [0, 1].forEach(k =>
      stroke(put, cx + s * S * 0.14, cy + S * 0.14, cx + s * S * (0.2 + k * 0.04), cy + S * 0.2, 2, () => K.purpleLt)));
    sparkle(put, cx + S * 0.12, cy - S * 0.2, K.purpleLt);
  }
  function drawGeodeGolem(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    shadow(put, S, cx, S * 0.26);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.11, cy + S * 0.12, cx + s * S * 0.17, cy + S * 0.3, S * 0.05, () => K.rockDk); ell(put, cx + s * S * 0.18, cy + S * 0.32, S * 0.05, S * 0.025, () => K.oil); });
    dome(put, cx, cy - S * 0.0, S * 0.21, S * 0.19, K.rock, K.rockLt, K.rockDkk);
    ell(put, cx, cy + S * 0.02, S * 0.1, S * 0.09, () => K.rockDkk);
    ell(put, cx, cy + S * 0.02, S * 0.08, S * 0.07, (tx, ty) => mix(K.voidDk, K.void, ty));
    [[0, -0.03], [-0.04, 0.02], [0.04, 0.02], [0, 0.05]].forEach(([ox, oy]) =>
      shard(put, cx + ox * S, cy + (oy + 0.05) * S, S * 0.018, S * 0.05, ox * 3, GEMS[0]));
    [-1, 1].forEach(s => { dome(put, cx + s * S * 0.25, cy - S * 0.04, S * 0.08, S * 0.07, K.rock, K.rockLt, K.rockDkk); stroke(put, cx + s * S * 0.25, cy + S * 0.0, cx + s * S * 0.3, cy + S * 0.16, S * 0.05, () => K.rockDk); dome(put, cx + s * S * 0.31, cy + S * 0.2, S * 0.06, S * 0.05, K.rock, K.rockLt, K.rockDkk); });
    shard(put, cx - S * 0.22, cy - S * 0.08, S * 0.03, S * 0.1, -0.2, GEMS[0]);
    shard(put, cx + S * 0.2, cy - S * 0.1, S * 0.028, S * 0.08, 0.2, GEMS[0]);
    dome(put, cx, cy - S * 0.24, S * 0.08, S * 0.06, K.rock, K.rockLt, K.rockDk);
    [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, cy - S * 0.25, S * 0.02, K.pinkDk, K.pink, K.pinkLt));
  }
  function drawShatterbat(put, S) {
    const cx = S * 0.5, cy = S * 0.46;
    for (let t = 0.2; t < 1; t += 0.18) {
      const w = t * S * 0.14;
      stroke(put, cx - S * 0.08 - t * S * 0.26, cy - w, cx - S * 0.08 - t * S * 0.26, cy + w, 1, () => (t > 0.7 ? K.cyanDk : K.cyanLt));
    }
    dome(put, cx, cy, S * 0.075, S * 0.09, K.void, K.voidLt, K.voidDk);
    dome(put, cx, cy - S * 0.1, S * 0.05, S * 0.05, K.void, K.voidLt, K.voidDk);
    [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy - S * 0.13, cx + s * S * 0.055, cy - S * 0.2, 2, () => K.voidLt));
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.1), K.cyanLt));
    ell(put, cx, cy - S * 0.06, S * 0.016, S * 0.02, () => K.oil);
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.05, cy - S * 0.02, cx + s * S * 0.3, cy - S * 0.14, S * 0.05, (t) => mix(K.cyan, K.cyanDk, t));
      stroke(put, cx + s * S * 0.26, cy - S * 0.1, cx + s * S * 0.32, cy + S * 0.04, S * 0.035, (t) => mix(K.cyanDk, K.voidDk, t));
      stroke(put, cx + s * S * 0.06, cy - S * 0.03, cx + s * S * 0.28, cy - S * 0.13, 1, () => K.cyanLt);
    });
    sparkle(put, cx + S * 0.2, cy - S * 0.2, K.cyanLt);
  }
  function drawQuartzRam(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.22);
    for (let x = 0; x < S * 0.18; x += 5) row(put, Math.round(cy + S * 0.0), cx - S * 0.46 + x, cx - S * 0.44 + x, () => K.pinkDk);
    dome(put, cx + S * 0.02, cy, S * 0.18, S * 0.12, K.rockLt, '#8e84a4', K.rockDk);
    for (let i = 0; i < 12; i++) put(Math.round(cx - S * 0.1 + (i * 37 % 100) / 100 * S * 0.24), Math.round(cy - S * 0.08 + (i * 61 % 100) / 100 * S * 0.14), K.rockLt);
    [[-0.1, -0.02], [0.0, 0.01], [0.1, -0.01], [0.17, 0.02]].forEach(([o, k]) =>
      stroke(put, cx + o * S, cy + S * 0.1, cx + (o + k) * S, cy + S * 0.24, S * 0.03, () => K.rockDk));
    dome(put, cx - S * 0.18, cy + S * 0.0, S * 0.08, S * 0.07, K.rockLt, '#8e84a4', K.rockDk);
    [0, 1].forEach(layer => {
      for (let a = 0.2; a < 3.6; a += 0.16) {
        const rr = S * (0.05 + a * 0.026);
        ell(put, cx - S * 0.15 + Math.cos(a + 1.8) * rr, cy - S * 0.05 - Math.sin(a + 1.8) * rr * 0.75 + layer * 2, S * 0.02 - a * 0.002 * S, S * 0.02 - a * 0.002 * S, (tx, ty) => mix(layer ? K.pinkDk : K.pinkLt, K.pinkDk, ty + a * 0.1));
      }
    });
    optic(put, cx - S * 0.21, cy - S * 0.015, S * 0.02, K.pinkDk, K.pink, K.pinkLt);
    sparkle(put, cx - S * 0.02, cy - S * 0.16, K.pinkLt);
  }
  function drawResonator(put, S) {
    const cx = S * 0.5, cy = S * 0.52;
    shadow(put, S, cx, S * 0.18);
    rockBase(put, cx, cy + S * 0.24, S * 0.14, S * 0.05);
    shard(put, cx - S * 0.07, cy + S * 0.24, S * 0.045, S * 0.34, -0.02, GEMS[2]);
    shard(put, cx + S * 0.07, cy + S * 0.24, S * 0.045, S * 0.34, 0.02, GEMS[2]);
    plate(put, cx - S * 0.1, cy + S * 0.16, cx + S * 0.1, cy + S * 0.24, K.rock, K.rockLt, K.rockDkk);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.12, cy - S * 0.06, cx + s * S * 0.12, cy + S * 0.1, 1, () => K.purpleLt); });
    [0.16, 0.26, 0.36].forEach((r, i) => {
      for (let a = 0; a < 6.28; a += 0.12) put(Math.round(cx + Math.cos(a) * S * r), Math.round(cy + S * 0.04 + Math.sin(a) * S * r * 0.7), (a * 6 | 0) % 2 ? (i === 2 ? K.purpleDk : K.purple) : null);
    });
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy + S * 0.08), K.oil));
    sparkle(put, cx, cy - S * 0.14, K.purpleLt);
  }
  function drawGemwingMoth(put, S) {
    const cx = S * 0.5, cy = S * 0.46;
    [[-0.2, 0.2], [-0.12, 0.28], [-0.02, 0.34]].forEach(([ox, oy], i) => {
      ell(put, cx + ox * S, cy + oy * S, S * 0.05 - i * 3, S * 0.02, (tx, ty) => ((tx * 8 | 0) + (ty * 3 | 0)) % 2 ? K.pinkLt : null);
    });
    [-1, 1].forEach(s => {
      ell(put, cx + s * S * 0.15, cy - S * 0.06, S * 0.13, S * 0.1, (tx, ty) => {
        let b = mix(K.pinkLt, K.pink, clamp(ty * 1.2, 0, 1));
        if (((tx * 4 | 0) + (ty * 3 | 0)) % 2) b = mix(b, K.purpleLt, 0.5);
        if (Math.abs(tx - 0.5) > 0.44 || ty > 0.85) b = K.pinkDk;
        return b;
      });
      ell(put, cx + s * S * 0.12, cy + S * 0.06, S * 0.08, S * 0.06, (tx, ty) => mix(K.purpleLt, K.purpleDk, ty));
    });
    ell(put, cx, cy, S * 0.035, S * 0.1, (tx, ty) => mix(K.rockLt, K.rockDk, ty));
    dome(put, cx, cy - S * 0.1, S * 0.03, S * 0.03, K.rockLt, '#8e84a4', K.rockDk);
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.015, cy - S * 0.12, cx + s * S * 0.05, cy - S * 0.18, 1, () => K.rockDk); put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.19), K.pinkLt); });
    [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.1), K.oil));
    sparkle(put, cx + S * 0.24, cy - S * 0.16, K.pinkLt);
  }
  function drawDeepCrawler(put, S) {
    const cx = S * 0.5, cy = S * 0.54;
    shadow(put, S, cx, S * 0.22);
    [-1, 1].forEach(s => [[-0.04, 0.2], [0.06, 0.23], [0.15, 0.19]].forEach(([oy, len]) => {
      stroke(put, cx + s * S * 0.11, cy + oy * S * 0.5 + S * 0.05, cx + s * S * len, cy + oy * S * 0.5 + S * 0.13, 2, () => K.rockDkk);
    }));
    ell(put, cx, cy + S * 0.02, S * 0.16, S * 0.1, (tx, ty) => {
      let b = mix('#3a3444', '#16121e', clamp(ty * 1.25, 0, 1));
      if (Math.sin((tx + ty) * 14) > 0.9) b = mix(b, K.voidLt, 0.4);
      return b;
    });
    [[-0.08, -0.04], [0.06, -0.06]].forEach(([ox, oy]) => shard(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.016, S * 0.05, ox, GEMS[2]));
    [-1, 1].forEach(s => {
      stroke(put, cx + s * S * 0.14, cy + S * 0.02, cx + s * S * 0.26, cy - S * 0.04, S * 0.035, () => '#2a2434');
      ell(put, cx + s * S * 0.29, cy - S * 0.06, S * 0.05, S * 0.038, (tx, ty) => mix('#3a3444', '#16121e', ty));
      stroke(put, cx + s * S * 0.33, cy - S * 0.08, cx + s * S * 0.27, cy - S * 0.02, 2, () => K.rockLt);
    });
    [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.03, cy - S * 0.08, cx + s * S * 0.05, cy - S * 0.14, 1, () => K.rockLt); put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.15), K.pink); });
  }
  function drawVoidgemHorror(put, S) {
    const cx = S * 0.5, cy = S * 0.5;
    ell(put, cx, S * 0.86, S * 0.14, S * 0.035, () => K.voidDk);
    for (let y = 0; y < S * 0.36; y++) {
      const t = y / (S * 0.36), w = S * 0.13 * (1 - t * 0.9);
      row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w, (tx) => {
        let b = mix(K.void, K.voidDk, t * 0.6 + tx * 0.2);
        if (tx < 0.25) b = mix(b, K.voidLt, 0.5);
        if (Math.sin((tx * 8 + t * 12)) > 0.86) b = mix(b, K.pink, 0.35);
        return b;
      });
    }
    optic(put, cx, cy - S * 0.13, S * 0.04, K.pinkDk, K.pink, K.pinkLt);
    [[-0.3, -0.06, 1], [0.32, -0.1, 2], [0.26, 0.14, 0], [-0.26, 0.16, 3]].forEach(([ox, oy, g]) =>
      shard(put, cx + ox * S, cy + oy * S + S * 0.05, S * 0.02, S * 0.07, ox, GEMS[g]));
    for (let a = 0; a < 6.28; a += 0.2) put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.24), (a * 8 | 0) % 3 === 0 ? K.voidLt : null);
    sparkle(put, cx, cy - S * 0.28, K.pinkLt);
  }

  // ============= BOSS: THE SHARDLORD (GEODE COLOSSUS, rainbow) ==============
  function drawShardlord(put, S) {
    const A = [K.rock, K.rockLt, K.rockDkk];
    let _gi = 0; const G = () => GEMS[(_gi++) % 5];
    const W = 1.3 * 1.22;                                     // bulky + giant
    const cx = S * 0.46;
    const footY = S * 0.94, hipY = S * 0.58, shY = S * 0.3, headY = S * 0.26;
    shadow(put, S, S * 0.5, S * 0.44);
    const crack = (x1, y1, x2, y2, c) => { stroke(put, x1, y1, x2, y2, 2.2, () => mix(c, '#000000', 0.45)); stroke(put, x1, y1, x2, y2, 1, () => c); };
    // legs
    [-1, 1].forEach(s => {
      const hx = cx + s * S * 0.055 * W, kx = cx + s * S * 0.07 * W, fx = cx + s * S * 0.08 * W;
      const kneeY = (hipY + footY) / 2;
      stroke(put, hx, hipY, kx, kneeY, S * 0.05, (t) => mix(A[1], A[2], t * 0.8));
      stroke(put, kx, kneeY, fx, footY, S * 0.048, (t) => mix(A[0], A[2], t * 0.6));
      put(Math.round(kx), Math.round(kneeY), G()[1]);
      plate(put, fx - S * 0.045 * W, footY - S * 0.02, fx + S * 0.05 * W, footY + S * 0.02, A[0], A[1], A[2]);
      shard(put, fx + s * S * 0.04 * W, footY, S * 0.014, S * 0.05, s * 0.5, G());
    });
    // torso
    for (let y = shY; y < hipY + S * 0.02; y++) {
      const t = (y - shY) / (hipY - shY);
      const w = S * (0.12 - t * 0.045) * W;
      row(put, Math.round(y), cx - w, cx + w, (tx) => {
        let b = mix(A[1], A[0], clamp(tx * 1.5, 0, 1));
        if (tx > 0.72) b = mix(b, A[2], 0.6);
        if (Math.abs(tx - 0.32) < 0.05) b = mix(b, A[1], 0.5);
        return b;
      });
    }
    row(put, Math.round(hipY), cx - S * 0.08 * W, cx + S * 0.08 * W, () => A[2]);
    put(Math.round(cx), Math.round(hipY), K.pinkLt);
    // THE RAINBOW CORE (angular five-color facets; hue-cycled at runtime)
    const cw = S * 0.05, chh = S * 0.06;
    ell(put, cx, S * 0.45, cw, chh, (tx, ty) => {
      const a = Math.atan2(ty - 0.5, tx - 0.5);
      const seg = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 5) % 5;
      const c = GEMS[seg][0], lt = GEMS[seg][1];
      const d = Math.hypot(tx - 0.5, ty - 0.5);
      return mix(lt, c, clamp(d * 2.2, 0, 1));
    });
    put(Math.round(cx - 1), Math.round(S * 0.44), '#ffffff'); put(Math.round(cx), Math.round(S * 0.45), '#ffffff');
    for (let a = 0; a < 6.28; a += 0.8) put(Math.round(cx + Math.cos(a) * (cw + S * 0.012)), Math.round(S * 0.45 + Math.sin(a) * (chh + S * 0.012)), GEMS[Math.floor(a) % 5][0]);
    // multicolor fissures radiating from the core
    crack(cx - S * 0.045, S * 0.44, cx - S * 0.1 * W, S * 0.38, GEMS[1][0]);
    crack(cx + S * 0.05, S * 0.43, cx + S * 0.1 * W, S * 0.36, GEMS[3][0]);
    crack(cx - S * 0.04, S * 0.49, cx - S * 0.09 * W, S * 0.55, GEMS[4][0]);
    crack(cx + S * 0.045, S * 0.5, cx + S * 0.08 * W, S * 0.57, GEMS[0][0]);
    // pauldrons
    [-1, 1].forEach(s => {
      const px = cx + s * S * 0.115 * W, py = shY + S * 0.015;
      ell(put, px, py, S * 0.05 * W, S * 0.04, (tx, ty) => mix(A[1], A[2], clamp(tx * 0.8 + ty * 0.8, 0, 1)));
      shard(put, px + s * S * 0.03, py + S * 0.01, S * 0.02, S * 0.09, s * 0.45, G());
      shard(put, px + s * S * 0.055, py + S * 0.02, S * 0.014, S * 0.06, s * 0.6, G());
    });
    // arms + gem-knuckled FISTS
    const armW = S * 0.042;
    const lx = cx - S * 0.14 * W, lhY = S * 0.52;
    const rx = cx + S * 0.14 * W, rhY = S * 0.52;
    stroke(put, cx - S * 0.11 * W, shY + S * 0.03, lx, lhY, armW, (t) => mix(A[1], A[2], t * 0.7));
    stroke(put, cx + S * 0.11 * W, shY + S * 0.03, rx, rhY, armW, (t) => mix(A[1], A[2], t * 0.7));
    [[lx, lhY, -1], [rx, rhY, 1]].forEach(([x, y, s]) => {
      ell(put, x, y, S * 0.045, S * 0.04, (tx, ty) => mix(A[1], A[2], clamp(tx * 0.7 + ty * 0.7, 0, 1)));
      shard(put, x + s * S * 0.02, y - S * 0.005, S * 0.012, S * 0.05, s * 0.3, G());
    });
    // head sat DIRECTLY on the shoulders (no neck) + RED visor glow
    ell(put, cx, headY, S * 0.052, S * 0.06, (tx, ty) => mix(A[1], A[0], clamp(tx * 1.2 + ty * 0.3, 0, 1)));
    row(put, Math.round(headY + S * 0.005), cx - S * 0.035, cx + S * 0.035, () => '#ff3b30');
    put(Math.round(cx - S * 0.018), Math.round(headY + S * 0.005), '#ffffff');
    // horns
    [-1, 1].forEach(s => shard(put, cx + s * S * 0.05, headY - S * 0.03, S * 0.015, S * 0.08, s * 0.55, G()));
    // the gold crown (from work-up #5) between the horns
    row(put, Math.round(headY - S * 0.05), cx - S * 0.042, cx + S * 0.042, () => K.gold);
    row(put, Math.round(headY - S * 0.042), cx - S * 0.045, cx + S * 0.045, () => K.goldDk);
    [[-0.032, 0], [0, 2], [0.032, 4]].forEach(([dx, g]) => shard(put, cx + dx * S, headY - S * 0.05, S * 0.01, S * 0.05, 0, GEMS[g]));
    // ambient rainbow motes
    sparkle(put, S * 0.14, S * 0.24, GEMS[0][1]);
    sparkle(put, S * 0.84, S * 0.34, GEMS[1][1]);
    sparkle(put, S * 0.12, S * 0.62, GEMS[3][1]);
    sparkle(put, S * 0.86, S * 0.7, GEMS[2][1]);
    sparkle(put, cx - S * 0.2, S * 0.3, K.pinkLt);
    sparkle(put, cx + S * 0.24, S * 0.6, '#ffffff');
  }

  // ======================= DECOR (19 — all but #11) =========================
  function drawCluster(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    rockBase(put, S * 0.5, S * 0.82, S * 0.3, S * 0.09);
    shard(put, S * 0.5, S * 0.84, S * 0.09, S * 0.62, 0, GEMS[0]);
    shard(put, S * 0.34, S * 0.84, S * 0.07, S * 0.42, -0.16, GEMS[2]);
    shard(put, S * 0.66, S * 0.84, S * 0.07, S * 0.46, 0.14, GEMS[1]);
    shard(put, S * 0.24, S * 0.85, S * 0.045, S * 0.24, -0.3, GEMS[1]);
    shard(put, S * 0.76, S * 0.85, S * 0.045, S * 0.26, 0.28, GEMS[0]);
    sparkle(put, S * 0.44, S * 0.3, K.pinkLt); sparkle(put, S * 0.68, S * 0.48, K.cyanLt); sparkle(put, S * 0.3, S * 0.55, K.purpleLt);
  }
  function drawPillar(put, S) {
    shadow(put, S, S * 0.5, S * 0.2);
    for (let y = S * 0.04; y < S * 0.92; y++) {
      const w = S * (0.1 + 0.03 * Math.sin(y / S * 9));
      row(put, Math.round(y), S * 0.5 - w, S * 0.5 + w, (tx) => {
        let b = mix(K.cyanLt, K.cyan, clamp(tx * 1.4, 0, 1));
        if (tx > 0.68) b = mix(b, K.cyanDk, 0.7);
        if (Math.abs((y / S * 7) % 1 - tx) < 0.08) b = mix(b, '#ffffff', 0.5);
        return b;
      });
    }
    ell(put, S * 0.5, S * 0.92, S * 0.2, S * 0.05, (tx, ty) => mix(K.rockLt, K.rockDk, ty));
    ell(put, S * 0.5, S * 0.05, S * 0.17, S * 0.045, (tx, ty) => mix(K.rockDk, K.rockDkk, ty));
    sparkle(put, S * 0.42, S * 0.3, K.cyanLt); sparkle(put, S * 0.58, S * 0.62, '#ffffff');
  }
  function drawShrooms(put, S) {
    shadow(put, S, S * 0.5, S * 0.28);
    rockBase(put, S * 0.5, S * 0.86, S * 0.26, S * 0.07);
    [[0.38, 0.5, 0.14, K.cyan, K.cyanLt], [0.6, 0.42, 0.17, K.pink, K.pinkLt], [0.5, 0.66, 0.1, K.green, K.greenLt], [0.72, 0.64, 0.09, K.cyan, K.cyanLt], [0.28, 0.68, 0.08, K.purple, K.purpleLt]].forEach(([x, y, r, c, lt]) => {
      plate(put, S * x - S * 0.02, S * y, S * x + S * 0.02, S * 0.86, '#d8cfe8', '#f4f0fa', K.rockDk);
      dome(put, S * x, S * y, S * r, S * r * 0.7, c, lt, mix(c, '#000000', 0.45));
      put(Math.round(S * x), Math.round(S * (y - r * 0.45)), '#ffffff');
    });
    sparkle(put, S * 0.5, S * 0.3, K.greenLt);
  }
  function drawStalagmites(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    [[0.5, 0.6, 0.11], [0.32, 0.42, 0.09], [0.68, 0.38, 0.085], [0.2, 0.26, 0.06], [0.8, 0.24, 0.055]].forEach(([x, h, w]) => {
      for (let y = 0; y < S * h; y++) {
        const t = y / (S * h), ww = S * w * (1 - t * 0.92);
        row(put, Math.round(S * 0.88 - y), S * x - ww, S * x + ww, (tx) => mix(K.rockLt, K.rockDkk, clamp(tx * 1.2 + t * 0.15, 0, 1)));
      }
    });
    ell(put, S * 0.5, S * 0.88, S * 0.36, S * 0.06, (tx, ty) => mix(K.rock, K.rockDkk, ty));
    put(Math.round(S * 0.47), Math.round(S * 0.34), K.pink); put(Math.round(S * 0.66), Math.round(S * 0.56), K.cyan);
  }
  function drawPool(put, S) {
    ell(put, S * 0.5, S * 0.6, S * 0.4, S * 0.24, (tx, ty) => mix(K.rockDk, K.rockDkk, ty));
    ell(put, S * 0.5, S * 0.6, S * 0.34, S * 0.19, (tx, ty) => {
      let b = mix('#2a6ea0', '#123252', clamp(tx * 0.5 + ty * 0.8, 0, 1));
      const rip = Math.sin(tx * 22) * Math.sin(ty * 16);
      if (rip > 0.82) b = mix(b, K.cyanLt, 0.5);
      return b;
    });
    ell(put, S * 0.42, S * 0.54, S * 0.07, S * 0.03, () => '#bfe8ff');
    shard(put, S * 0.2, S * 0.44, S * 0.04, S * 0.2, -0.2, GEMS[1]);
    shard(put, S * 0.82, S * 0.5, S * 0.035, S * 0.16, 0.22, GEMS[2]);
    sparkle(put, S * 0.62, S * 0.62, K.cyanLt);
  }
  function drawVein(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    ell(put, S * 0.5, S * 0.58, S * 0.36, S * 0.32, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
    [[0.3, 0.4, 0.62, 0.72, K.pink], [0.42, 0.32, 0.7, 0.5, K.cyan], [0.28, 0.62, 0.56, 0.84, K.amber]].forEach(([x1, y1, x2, y2, c]) => {
      stroke(put, S * x1, S * y1, S * x2, S * y2, 3, () => c);
      stroke(put, S * x1, S * y1, S * x2, S * y2, 1, () => mix(c, '#ffffff', 0.5));
    });
    [[0.36, 0.5], [0.6, 0.62], [0.52, 0.38]].forEach(([x, y]) => { put(Math.round(S * x), Math.round(S * y), '#ffffff'); });
  }
  function drawCart(put, S) {
    shadow(put, S, S * 0.5, S * 0.3);
    stroke(put, S * 0.1, S * 0.88, S * 0.9, S * 0.84, 2, () => K.rockDkk);
    stroke(put, S * 0.1, S * 0.94, S * 0.9, S * 0.9, 2, () => K.rockDkk);
    plate(put, S * 0.28, S * 0.5, S * 0.72, S * 0.76, '#6a5140', '#8a6e58', '#3a2c20');
    stroke(put, S * 0.28, S * 0.52, S * 0.72, S * 0.52, 2, () => '#8a6e58');
    [0.34, 0.5, 0.66].forEach(x => stroke(put, S * x, S * 0.5, S * x, S * 0.76, 1, () => '#3a2c20'));
    [0.36, 0.64].forEach(x => { ell(put, S * x, S * 0.8, S * 0.055, S * 0.055, (tx, ty) => mix('#555a66', '#22242c', ty)); bolt(put, S * x, S * 0.8, S * 0.015, '#9aa2b0', '#555a66'); });
    [[0.38, 0.46, 0], [0.5, 0.4, 1], [0.62, 0.47, 2], [0.45, 0.5, 3], [0.57, 0.52, 4]].forEach(([x, y, g]) => shard(put, S * x, S * y + S * 0.06, S * 0.035, S * 0.12, (x - 0.5) * 0.6, GEMS[g]));
    sparkle(put, S * 0.5, S * 0.32, '#ffffff');
  }
  function drawArch(put, S) {
    shadow(put, S, S * 0.5, S * 0.36);
    for (let a = 0; a <= Math.PI; a += 0.02) {
      const x = S * 0.5 - Math.cos(a) * S * 0.3, y = S * 0.84 - Math.sin(a) * S * 0.56;
      const w = S * (0.05 + 0.015 * Math.sin(a * 7));
      row(put, Math.round(y), x - w, x + w, (tx) => mix(K.purpleLt, K.purpleDk, clamp(tx * 1.3, 0, 1)));
    }
    [[0.2, 0.84], [0.8, 0.84]].forEach(([x, y]) => rockBase(put, S * x, S * y, S * 0.11, S * 0.05));
    shard(put, S * 0.5, S * 0.3, S * 0.03, S * 0.14, 0, GEMS[0]);
    shard(put, S * 0.32, S * 0.44, S * 0.025, S * 0.1, -0.25, GEMS[1]);
    shard(put, S * 0.68, S * 0.44, S * 0.025, S * 0.1, 0.25, GEMS[1]);
    sparkle(put, S * 0.5, S * 0.12, K.purpleLt);
  }
  function drawGeodeProp(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    ell(put, S * 0.5, S * 0.6, S * 0.34, S * 0.28, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.7 + ty * 0.7, 0, 1)));
    ell(put, S * 0.5, S * 0.6, S * 0.25, S * 0.2, (tx, ty) => mix(K.voidDk, K.void, clamp(1 - (Math.abs(tx - 0.5) + Math.abs(ty - 0.5)), 0, 1)));
    for (let a = 0; a < 6.28; a += 0.5) {
      const x = S * 0.5 + Math.cos(a) * S * 0.19, y = S * 0.6 + Math.sin(a) * S * 0.15;
      shard(put, x, y + S * 0.05, S * 0.022, S * 0.08, Math.cos(a) * 0.3, GEMS[Math.floor((a * 2) % 5)]);
    }
    sparkle(put, S * 0.5, S * 0.58, '#ffffff');
  }
  function drawFlowers(put, S) {
    ell(put, S * 0.5, S * 0.72, S * 0.36, S * 0.14, (tx, ty) => mix(K.rock, K.rockDkk, ty));
    [[0.3, 0.6, 0], [0.5, 0.52, 1], [0.68, 0.62, 2], [0.4, 0.72, 3], [0.6, 0.74, 4], [0.22, 0.74, 1], [0.78, 0.72, 0]].forEach(([x, y, g]) => {
      const c = GEMS[g][0], lt = GEMS[g][1];
      stroke(put, S * x, S * y, S * x, S * y + S * 0.09, 1, () => K.greenDk);
      for (let a = 0; a < 6.28; a += 1.05) put(Math.round(S * x + Math.cos(a) * 2.4), Math.round(S * y + Math.sin(a) * 2.4), c);
      put(Math.round(S * x), Math.round(S * y), lt);
    });
    sparkle(put, S * 0.5, S * 0.42, K.pinkLt);
  }
  function drawChandelierStal(put, S) {
    row(put, Math.round(S * 0.06), S * 0.14, S * 0.86, () => K.rockDkk);
    row(put, Math.round(S * 0.08), S * 0.1, S * 0.9, () => K.rockDk);
    const down = (cx, topY, w, h, cols) => {
      const c = cols[0], lt = cols[1], dk = cols[2];
      for (let y = 0; y < h; y++) {
        const t = y / h, ww = w * (1 - t * 0.9);
        row(put, Math.round(topY + y), cx - ww, cx + ww, (tx) => { let b = mix(lt, c, clamp(t * 0.9, 0, 1)); if (tx > 0.7) b = mix(b, dk, 0.6); return b; });
      }
      put(Math.round(cx), Math.round(topY + h), '#ffffff');
    };
    down(S * 0.5, S * 0.08, S * 0.09, S * 0.5, GEMS[2]);
    down(S * 0.34, S * 0.08, S * 0.06, S * 0.34, GEMS[0]);
    down(S * 0.66, S * 0.08, S * 0.06, S * 0.36, GEMS[1]);
    down(S * 0.22, S * 0.08, S * 0.04, S * 0.2, GEMS[1]);
    down(S * 0.78, S * 0.08, S * 0.04, S * 0.22, GEMS[0]);
    sparkle(put, S * 0.5, S * 0.68, K.purpleLt); sparkle(put, S * 0.3, S * 0.5, K.pinkLt);
  }
  function drawPedestal(put, S) {
    shadow(put, S, S * 0.5, S * 0.24);
    plate(put, S * 0.34, S * 0.82, S * 0.66, S * 0.9, K.rockLt, '#8a80a0', K.rockDkk);
    plate(put, S * 0.42, S * 0.56, S * 0.58, S * 0.82, K.rock, K.rockLt, K.rockDkk);
    plate(put, S * 0.36, S * 0.5, S * 0.64, S * 0.58, K.rockLt, '#8a80a0', K.rockDkk);
    const gy = S * 0.3;
    for (let y = -10; y <= 12; y++) {
      const t = Math.abs(y) / (y < 0 ? 10 : 12), w = S * 0.085 * (1 - t);
      row(put, Math.round(gy + y), S * 0.5 - w, S * 0.5 + w, (tx) => mix(K.pinkLt, tx > 0.6 ? K.pinkDk : K.pink, clamp(tx + t * 0.3, 0, 1)));
    }
    put(Math.round(S * 0.47), Math.round(gy - 4), '#ffffff');
    [[0.44, 0.46], [0.56, 0.44], [0.5, 0.49]].forEach(([x, y]) => put(Math.round(S * x), Math.round(S * y), K.pinkLt));
    sparkle(put, S * 0.62, S * 0.2, '#ffffff');
  }
  function drawRubble(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    [[0.4, 0.7, 0.16, 0.12], [0.62, 0.72, 0.13, 0.1], [0.5, 0.56, 0.12, 0.1], [0.28, 0.76, 0.09, 0.07], [0.74, 0.78, 0.07, 0.06]].forEach(([x, y, rx, ry]) => ell(put, S * x, S * y, S * rx, S * ry, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.7 + ty * 0.7, 0, 1))));
    shard(put, S * 0.56, S * 0.56, S * 0.03, S * 0.1, 0.2, GEMS[3]);
    put(Math.round(S * 0.42), Math.round(S * 0.64), K.amber);
  }
  function drawLightShaft(put, S) {
    stroke(put, S * 0.2, S * 0.04, S * 0.5, S * 0.6, 4, () => '#f4f0da');
    stroke(put, S * 0.2, S * 0.04, S * 0.5, S * 0.6, 1, () => '#ffffff');
    rockBase(put, S * 0.5, S * 0.82, S * 0.2, S * 0.07);
    shard(put, S * 0.5, S * 0.84, S * 0.07, S * 0.3, 0.05, GEMS[1]);
    [[0.8, 0.3, K.pink], [0.86, 0.5, K.amber], [0.84, 0.72, K.green]].forEach(([x, y, c]) => { stroke(put, S * 0.52, S * 0.58, S * x, S * y, 2, () => c); });
    sparkle(put, S * 0.52, S * 0.56, '#ffffff');
  }
  function drawLanternPost(put, S) {
    shadow(put, S, S * 0.5, S * 0.18);
    stroke(put, S * 0.46, S * 0.24, S * 0.46, S * 0.88, 3, () => '#6a5140');
    stroke(put, S * 0.46, S * 0.26, S * 0.66, S * 0.3, 2, () => '#6a5140');
    plate(put, S * 0.6, S * 0.32, S * 0.72, S * 0.48, '#555a66', '#9aa2b0', '#22242c');
    ell(put, S * 0.66, S * 0.4, S * 0.04, S * 0.06, () => K.amberLt);
    put(Math.round(S * 0.66), Math.round(S * 0.4), '#ffffff');
    dome(put, S * 0.66, S * 0.31, S * 0.05, S * 0.035, '#555a66', '#9aa2b0', '#22242c');
    for (let a = 0; a < 6.28; a += 0.9) put(Math.round(S * 0.66 + Math.cos(a) * S * 0.09), Math.round(S * 0.4 + Math.sin(a) * S * 0.09), K.amber);
    rockBase(put, S * 0.47, S * 0.88, S * 0.1, S * 0.045);
  }
  function drawFossil(put, S) {
    shadow(put, S, S * 0.5, S * 0.32);
    ell(put, S * 0.5, S * 0.58, S * 0.35, S * 0.3, (tx, ty) => mix(K.rockLt, K.rockDkk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
    for (let a = 0; a < 12.2; a += 0.05) {
      const r = S * 0.02 + a * S * 0.014;
      put(Math.round(S * 0.5 + Math.cos(a) * r), Math.round(S * 0.56 + Math.sin(a) * r * 0.8), '#c8bfa8');
    }
    for (let a = 0; a < 12.2; a += 0.6) {
      const r = S * 0.02 + a * S * 0.014;
      stroke(put, S * 0.5 + Math.cos(a) * r, S * 0.56 + Math.sin(a) * r * 0.8, S * 0.5 + Math.cos(a) * (r + S * 0.03), S * 0.56 + Math.sin(a) * (r + S * 0.03) * 0.8, 1, () => '#a89e88');
    }
    put(Math.round(S * 0.3), Math.round(S * 0.42), K.cyan);
  }
  function drawSinging(put, S) {
    shadow(put, S, S * 0.5, S * 0.26);
    rockBase(put, S * 0.5, S * 0.84, S * 0.22, S * 0.07);
    shard(put, S * 0.42, S * 0.86, S * 0.045, S * 0.34, -0.08, GEMS[1]);
    shard(put, S * 0.56, S * 0.86, S * 0.055, S * 0.42, 0.06, GEMS[1]);
    shard(put, S * 0.66, S * 0.86, S * 0.035, S * 0.24, 0.2, GEMS[1]);
    [0.16, 0.24, 0.32].forEach((r, i) => {
      for (let a = -1.1; a < 1.1; a += 0.05) put(Math.round(S * (0.56 + Math.cos(a - 1.57) * r)), Math.round(S * (0.42 + Math.sin(a - 1.57) * r * 0.8)), i === 2 ? K.cyanDk : K.cyanLt);
    });
    sparkle(put, S * 0.56, S * 0.38, '#ffffff');
  }
  function drawBridge(put, S) {
    shadow(put, S, S * 0.5, S * 0.36);
    for (let x = S * 0.1; x < S * 0.9; x++) {
      const t = (x - S * 0.1) / (S * 0.8);
      const y = S * 0.6 - Math.sin(t * Math.PI) * S * 0.1;
      row(put, Math.round(y), x, x + 1, () => mix(K.purpleLt, K.purple, t));
      for (let d = 1; d < S * 0.08; d++) put(Math.round(x), Math.round(y + d), mix(K.purple, K.purpleDk, d / (S * 0.08)));
    }
    shard(put, S * 0.18, S * 0.62, S * 0.04, S * 0.16, -0.1, GEMS[2]);
    shard(put, S * 0.82, S * 0.62, S * 0.04, S * 0.16, 0.1, GEMS[2]);
    [[0.35, 0.48], [0.5, 0.44], [0.65, 0.48]].forEach(([x, y]) => shard(put, S * x, S * y + S * 0.05, S * 0.018, S * 0.06, 0, GEMS[0]));
    rockBase(put, S * 0.14, S * 0.78, S * 0.1, S * 0.05); rockBase(put, S * 0.86, S * 0.78, S * 0.1, S * 0.05);
    sparkle(put, S * 0.5, S * 0.36, K.purpleLt);
  }
  function drawFissureProp(put, S) {
    ell(put, S * 0.5, S * 0.6, S * 0.4, S * 0.26, (tx, ty) => mix(K.rock, K.rockDkk, ty));
    let px = S * 0.18, py = S * 0.52;
    [[0.3, 0.6], [0.44, 0.54], [0.56, 0.64], [0.7, 0.58], [0.84, 0.66]].forEach(([x, y]) => {
      stroke(put, px, py, S * x, S * y, 5, () => K.voidDk);
      stroke(put, px, py, S * x, S * y, 2, () => K.void);
      px = S * x; py = S * y;
    });
    shard(put, S * 0.36, S * 0.56, S * 0.03, S * 0.12, -0.15, [K.void, K.voidLt, K.voidDk]);
    shard(put, S * 0.62, S * 0.62, S * 0.035, S * 0.14, 0.12, [K.void, K.voidLt, K.voidDk]);
    put(Math.round(S * 0.36), Math.round(S * 0.44), K.pink);
    put(Math.round(S * 0.62), Math.round(S * 0.48), K.pink);
    sparkle(put, S * 0.5, S * 0.4, K.voidLt);
  }
  // wall shard segment (the GROWING CRYSTAL gate blocks)
  function drawWallShards(put, S) {
    rockBase(put, S * 0.5, S * 0.88, S * 0.34, S * 0.08);
    shard(put, S * 0.3, S * 0.88, S * 0.08, S * 0.5, -0.08, GEMS[0]);
    shard(put, S * 0.52, S * 0.88, S * 0.1, S * 0.66, 0.02, GEMS[0]);
    shard(put, S * 0.72, S * 0.88, S * 0.07, S * 0.44, 0.14, GEMS[0]);
    sparkle(put, S * 0.5, S * 0.16, K.pinkLt);
    sparkle(put, S * 0.28, S * 0.36, '#ffffff');
  }

  // ======================= TILES (#1 2 4 5 6 7 8 9 10) ======================
  function tileFn(base) {
    return (put, S) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = base(x, y, S); if (c) put(x, y, c); } };
  }
  const tRock = tileFn((x, y) => {
    const n = h2(x >> 2, y >> 2, 1);
    let b = mix(K.rock, K.rockDk, n);
    if (h2(x, y, 2) > 0.97) b = K.rockLt;
    if (h2(x + 9, y + 3, 3) > 0.985) b = K.rockDkk;
    return b;
  });
  const tCrystal = tileFn((x, y) => {
    const fx = ((x + y * 0.5) / 26) | 0, fy = ((y - x * 0.3) / 22) | 0;
    const n = h2(fx, fy, 12);
    let b = mix(K.cyanDk, mix(K.cyan, K.cyanLt, n), 0.4 + n * 0.4);
    b = mix(b, '#0e2a30', 0.45);
    if (h2(x, y, 13) > 0.992) b = K.cyanLt;
    return b;
  });
  const tAmethyst = tileFn((x, y) => {
    const bx = (x / 40) | 0, by = (y / 26) | 0, off = (by % 2) * 20;
    const ex = (x + off) % 40, ey = y % 26;
    let b = mix(K.purple, K.purpleDk, h2(bx * 3 + (by % 2), by, 15) * 0.7);
    if (ex < 2 || ey < 2) b = K.voidDk;
    else if (ex < 4 || ey < 4) b = mix(b, K.purpleLt, 0.3);
    if (h2(x, y, 16) > 0.99) b = K.purpleLt;
    return b;
  });
  const tWater = tileFn((x, y) => {
    const w = Math.sin(x / 11 + Math.sin(y / 8) * 2) + Math.sin(y / 13);
    let b = mix('#1c4a74', '#0e2440', clamp(w * 0.4 + 0.5, 0, 1));
    if (w > 1.45) b = mix(b, K.cyanLt, 0.65);
    if (h2(x, y, 18) > 0.995) b = '#bfe8ff';
    return b;
  });
  const tMoss = tileFn((x, y) => {
    const n = h2(x >> 1, y >> 1, 21), m = h2((x >> 3) + 5, y >> 3, 22);
    let b = mix(mix(K.green, K.greenDk, n), K.rockDk, m > 0.6 ? 0.75 : 0.15);
    if (h2(x + 4, y, 23) > 0.985) b = K.greenLt;
    return b;
  });
  const tGeodeC = tileFn((x, y) => {
    const n = h2(x >> 2, y >> 2, 31);
    let b = mix(K.void, K.voidDk, n);
    const cr = Math.abs(Math.sin(x / 17 + Math.sin(y / 9) * 3));
    if (cr > 0.93) b = mix(K.pink, K.pinkLt, h2(x, y, 32));
    else if (cr > 0.86) b = K.pinkDk;
    if (h2(x + 2, y + 8, 33) > 0.99) b = K.voidLt;
    return b;
  });
  const tSand = tileFn((x, y) => {
    const n = h2(x >> 1, y >> 1, 35);
    let b = mix('#b8a890', '#8a7a62', n * 0.7);
    if (Math.sin(y / 7 + x / 30) > 0.85) b = mix(b, '#d0c0a8', 0.4);
    if (h2(x + 6, y + 1, 36) > 0.988) b = h2(x, y + 2, 37) > 0.5 ? '#ffffff' : K.cyanLt;
    return b;
  });
  const tObsidian = tileFn((x, y) => {
    const fx = ((x - y * 0.4) / 30) | 0, fy = ((y + x * 0.2) / 24) | 0;
    const n = h2(fx, fy, 41);
    let b = mix('#16121e', '#241c30', n);
    if (Math.abs(Math.sin(x / 14 - y / 20)) > 0.965) b = K.voidLt;
    if (h2(x, y + 5, 42) > 0.994) b = K.pink;
    return b;
  });
  const tGrown = tileFn((x, y) => {
    const rn = h2(x >> 2, y >> 2, 1);
    let b = mix(K.rock, K.rockDk, rn);
    const n = h2((x + y) >> 3, (y - x) >> 3, 45);
    if (n >= 0.42) {
      const f = h2(x >> 2, (y + 30) >> 2, 46);
      b = mix(K.pinkDk, mix(K.pink, K.pinkLt, f), 0.5 + f * 0.4);
      b = mix(b, K.rockDk, 0.3);
      if (h2(x + 1, y + 1, 47) > 0.985) b = K.pinkLt;
    }
    return b;
  });

  // ======================= CRYSTAL BOMB (destructible props) ================
  // Big centre crystal + small road crystals, each with damage-stage frames
  // (fence lineage: swap to a more-shattered frame as HP drops, then it blows).
  function crackOverlay(put, S, n, seed) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + h2(i, seed, 7) * 1.3;
      const x0 = S * 0.5, y0 = S * 0.56;
      const len = S * (0.2 + h2(i, seed, 8) * 0.22);
      const mx = x0 + Math.cos(a) * len * 0.5 + (h2(i, seed, 9) - 0.5) * S * 0.08;
      const my = y0 + Math.sin(a) * len * 0.5 + (h2(i, seed, 10) - 0.5) * S * 0.08;
      const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      stroke(put, x0, y0, mx, my, 2, () => K.oil);
      stroke(put, mx, my, x1, y1, 2, () => K.oil);
    }
  }
  function bigCrystal(stage) {
    return function (put, S) {
      const dmg = stage / 3, grow = 1 - dmg * 0.32;
      shadow(put, S, S * 0.5, S * 0.34);
      rockBase(put, S * 0.5, S * 0.86, S * 0.36, S * 0.1);
      shard(put, S * 0.5,  S * 0.9,  S * 0.13, S * 0.76 * grow, 0.0,   GEMS[0]);
      shard(put, S * 0.3,  S * 0.9,  S * 0.09, S * 0.5  * grow, -0.14, GEMS[2]);
      shard(put, S * 0.7,  S * 0.9,  S * 0.09, S * 0.54 * grow, 0.12,  GEMS[1]);
      shard(put, S * 0.18, S * 0.92, S * 0.06, S * 0.3  * grow, -0.32, GEMS[4]);
      shard(put, S * 0.82, S * 0.92, S * 0.06, S * 0.32 * grow, 0.3,   GEMS[3]);
      shard(put, S * 0.42, S * 0.92, S * 0.07, S * 0.42 * grow, -0.04, GEMS[1]);  // #20 GRAND RAINBOW —
      shard(put, S * 0.58, S * 0.92, S * 0.07, S * 0.44 * grow, 0.04,  GEMS[3]);  // full multi-gem cluster
      if (stage >= 1) crackOverlay(put, S, 4 + stage * 2, stage);
      if (stage < 2) { sparkle(put, S * 0.4, S * 0.3, K.pinkLt); sparkle(put, S * 0.64, S * 0.42, K.cyanLt); sparkle(put, S * 0.3, S * 0.5, K.amberLt); sparkle(put, S * 0.7, S * 0.56, K.greenLt); }
      else sparkle(put, S * 0.5, S * 0.5, K.white);   // it flares before it blows
    };
  }
  function smallCrystal(stage) {
    return function (put, S) {
      const dmg = stage / 2, grow = 1 - dmg * 0.42;
      shadow(put, S, S * 0.5, S * 0.2);
      rockBase(put, S * 0.5, S * 0.84, S * 0.22, S * 0.07);
      shard(put, S * 0.5,  S * 0.86, S * 0.1,  S * 0.5  * grow, 0.0,  GEMS[1]);
      shard(put, S * 0.36, S * 0.86, S * 0.06, S * 0.3  * grow, -0.2, GEMS[0]);
      shard(put, S * 0.64, S * 0.86, S * 0.06, S * 0.32 * grow, 0.2,  GEMS[2]);
      if (stage >= 1) crackOverlay(put, S, 3 + stage, 5 + stage);
      else sparkle(put, S * 0.46, S * 0.4, K.cyanLt);
    };
  }

  // ======================= REGISTRY buildArt hook ===========================
  var CRY_ART = {
    K: K, GEMS: GEMS,
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- roster (9) ----
      ctx.spr('shardlingHi', MS, MS, drawShardling);
      ctx.spr('amethystLurkerHi', MS, MS, drawAmethystLurker);
      ctx.spr('geodeGolemHi', MS, MS, drawGeodeGolem);
      ctx.spr('shatterbatHi', MS, MS, drawShatterbat);
      ctx.spr('quartzRamHi', MS, MS, drawQuartzRam);
      ctx.spr('resonatorHi', MS, MS, drawResonator);
      ctx.spr('gemwingMothHi', MS, MS, drawGemwingMoth);
      ctx.spr('deepCrawlerHi', MS, MS, drawDeepCrawler);
      ctx.spr('voidgemHorrorHi', MS, MS, drawVoidgemHorror);
      ctx.MOB_HI.shardling = 'shardlingHi';           ctx.MOB_DISPLAY.shardling = 88;
      ctx.MOB_HI.amethystLurker = 'amethystLurkerHi'; ctx.MOB_DISPLAY.amethystLurker = 109;
      ctx.MOB_HI.geodeGolem = 'geodeGolemHi';         ctx.MOB_DISPLAY.geodeGolem = 126;
      ctx.MOB_HI.shatterbat = 'shatterbatHi';         ctx.MOB_DISPLAY.shatterbat = 101;
      ctx.MOB_HI.quartzRam = 'quartzRamHi';           ctx.MOB_DISPLAY.quartzRam = 113;
      ctx.MOB_HI.resonator = 'resonatorHi';           ctx.MOB_DISPLAY.resonator = 105;
      ctx.MOB_HI.gemwingMoth = 'gemwingMothHi';       ctx.MOB_DISPLAY.gemwingMoth = 101;
      ctx.MOB_HI.deepCrawler = 'deepCrawlerHi';       ctx.MOB_DISPLAY.deepCrawler = 113;
      ctx.MOB_HI.voidgemHorror = 'voidgemHorrorHi';   ctx.MOB_DISPLAY.voidgemHorror = 122;
      // ---- boss: THE SHARDLORD (COLOSSUS, 128px canvas) ----
      ctx.spr('shardlordHi', 128, 128, drawShardlord);
      ctx.BOSS_HI.shardlord = { key: 'shardlordHi', size: 128, display: 165, bodyW: 62, bodyH: 84 };
      // ---- decor (19 + the gate wall segment) ----
      ctx.spr('kdCluster', 64, 64, drawCluster);
      ctx.spr('kdPillar', 64, 64, drawPillar);
      ctx.spr('kdShrooms', 64, 64, drawShrooms);
      ctx.spr('kdStalag', 64, 64, drawStalagmites);
      ctx.spr('kdPool', 64, 64, drawPool);
      ctx.spr('kdVein', 64, 64, drawVein);
      ctx.spr('kdCart', 64, 64, drawCart);
      ctx.spr('kdArch', 64, 64, drawArch);
      ctx.spr('kdGeode', 64, 64, drawGeodeProp);
      ctx.spr('kdFlowers', 64, 64, drawFlowers);
      ctx.spr('kdChand', 64, 64, drawChandelierStal);
      ctx.spr('kdPedestal', 64, 64, drawPedestal);
      ctx.spr('kdRubble', 64, 64, drawRubble);
      ctx.spr('kdShaft', 64, 64, drawLightShaft);
      ctx.spr('kdLantern', 64, 64, drawLanternPost);
      ctx.spr('kdFossil', 64, 64, drawFossil);
      ctx.spr('kdSinging', 64, 64, drawSinging);
      ctx.spr('kdBridge', 64, 64, drawBridge);
      ctx.spr('kdFissure', 64, 64, drawFissureProp);
      ctx.spr('kdWall', 64, 64, drawWallShards);
      // ---- CRYSTAL BOMB props (damage-stage frames) ----
      ctx.spr('kCrystalBig0', 96, 96, bigCrystal(0));
      ctx.spr('kCrystalBig1', 96, 96, bigCrystal(1));
      ctx.spr('kCrystalBig2', 96, 96, bigCrystal(2));
      ctx.spr('kCrystalBig3', 96, 96, bigCrystal(3));
      ctx.spr('kCrystalSm0', 48, 48, smallCrystal(0));
      ctx.spr('kCrystalSm1', 48, 48, smallCrystal(1));
      ctx.spr('kCrystalSm2', 48, 48, smallCrystal(2));
      // ---- tiles ----
      ctx.tex('krock', 48, 48, tRock);
      ctx.tex('kcrystal', 48, 48, tCrystal);
      ctx.tex('kamethyst', 48, 48, tAmethyst);
      ctx.tex('kwater', 48, 48, tWater);
      ctx.tex('kmoss', 48, 48, tMoss);
      ctx.tex('kgeode', 48, 48, tGeodeC);
      ctx.tex('ksand', 48, 48, tSand);
      ctx.tex('kobsidian', 48, 48, tObsidian);
      ctx.tex('kgrown', 48, 48, tGrown);
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CRY_ART;
  root.CRYSTAL_ART = CRY_ART;
})(typeof window !== 'undefined' ? window : this);
