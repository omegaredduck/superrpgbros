// artdev/abyss/render_abyss_decor.js — 20 numbered THE ABYSS decor
// candidates, one PNG grid. Wrecks, vents, glow-life of the trench.
'use strict';
const KIT = require('./abyss_kit.js');
const { A, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glowDot, tentacle, fin, bubbles } = KIT;

// 1 · SHIPWRECK HULL — broken ribs + planking
function drawWreck(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.36);
  // keel + hull curve (broken)
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx - S * 0.28 + t * S * 0.56, py = S * 0.78 - Math.sin(t * Math.PI) * S * 0.06;
    ell(put, px, py, S * 0.02, S * 0.035, (tx, ty) => mix(A.rustLt, A.rustDk, clamp(tx + ty * 0.4, 0, 1)));
  }
  // rib frames curving up
  [-0.2, -0.08, 0.04, 0.16].forEach((dx, i) => {
    for (let t = 0; t < 1; t += 0.05) {
      const px = cx + dx * S + Math.sin(t * 1.3) * S * 0.06, py = S * 0.74 - t * S * 0.36;
      if (i === 2 && t > 0.6) break; // broken rib
      ell(put, px, py, S * 0.014, S * 0.014, (tx, ty) => mix(A.rust, A.rustDk, tx + ty * 0.3));
    }
  });
  // surviving hull planking (port side)
  for (let y = S * 0.56; y < S * 0.74; y++) {
    const t = (y - S * 0.56) / (S * 0.18);
    row(put, Math.round(y), cx - S * 0.28 + t * S * 0.03, cx - S * 0.02, (tx) => {
      let b = mix(A.rustLt, A.rustDk, clamp(tx * 1.1, 0, 1));
      if ((y | 0) % 5 === 0) b = mix(b, A.oil, 0.4);
      return b;
    });
  }
  // weed drape + glow
  stroke(put, cx - S * 0.2, S * 0.4, cx - S * 0.22, S * 0.56, 1.4, () => '#3a5a3a');
  stroke(put, cx + 0.04 * S, S * 0.46, cx + 0.05 * S, S * 0.6, 1.4, () => '#3a5a3a');
  glowDot(put, cx + S * 0.16, S * 0.5, S * 0.01, A.bio, A.bioLt);
  bubbles(put, cx, S * 0.36, 3, 4);
}
// 2 · DIVING BELL — brass, porthole glow
function drawBell(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // bell body
  for (let y = S * 0.34; y < S * 0.7; y++) {
    const t = (y - S * 0.34) / (S * 0.36);
    const w = S * (0.07 + t * 0.09);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(A.brassLt, A.brassDk, clamp(tx * 1.15 + t * 0.15, 0, 1));
      if ((y | 0) % 8 === 0) b = mix(b, A.brassDk, 0.4); // banding
      return b;
    });
  }
  row(put, Math.round(S * 0.7), cx - S * 0.17, cx + S * 0.17, () => A.rustDk); // rim
  // rivet lines
  for (let i = -2; i <= 2; i++) put(Math.round(cx + i * S * 0.06), Math.round(S * 0.68), A.oil);
  // porthole — warm glow inside
  ell(put, cx, S * 0.48, S * 0.05, S * 0.05, (tx, ty) => mix(A.brassDk, A.oil, tx));
  ell(put, cx, S * 0.48, S * 0.035, S * 0.035, (tx, ty) => mix('#ffd88a', '#8a6418', tx + ty * 0.4));
  put(Math.round(cx - 1), Math.round(S * 0.47), '#fff0c8');
  // hoist ring + chain going up
  ell(put, cx, S * 0.3, S * 0.02, S * 0.016, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.1 ? A.rustDk : null));
  for (let y = S * 0.08; y < S * 0.28; y += 5) { put(Math.round(cx), Math.round(y), A.rust); put(Math.round(cx + 1), Math.round(y + 2), A.rustDk); }
  bubbles(put, cx + S * 0.12, S * 0.34, 4, 3);
}
// 3 · GIANT ANCHOR — half-buried
function drawAnchor(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // shank
  stroke(put, cx, S * 0.26, cx, S * 0.66, S * 0.03, () => A.rust);
  stroke(put, cx - S * 0.008, S * 0.26, cx - S * 0.008, S * 0.66, S * 0.01, () => A.rustLt);
  // stock (crossbar) + ring
  stroke(put, cx - S * 0.11, S * 0.32, cx + S * 0.11, S * 0.32, S * 0.024, () => A.rustDk);
  ell(put, cx, S * 0.24, S * 0.028, S * 0.026, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? mix(A.rust, A.rustDk, tx) : null));
  // arms + flukes (one buried in sand mound)
  for (let a = 0.15; a < 1.35; a += 0.05) {
    const px = cx - Math.sin(a) * S * 0.14, py = S * 0.66 - (Math.cos(a) - 1) * S * 0.12;
    ell(put, px, py, S * 0.016, S * 0.016, (tx, ty) => mix(A.rust, A.rustDk, tx + ty * 0.3));
  }
  fin(put, cx - S * 0.15, S * 0.5, cx - S * 0.2, S * 0.44, cx - S * 0.1, S * 0.48, A.rust, A.rustDk);
  for (let a = 0.15; a < 0.9; a += 0.05) {
    const px = cx + Math.sin(a) * S * 0.14, py = S * 0.66 - (Math.cos(a) - 1) * S * 0.12;
    ell(put, px, py, S * 0.016, S * 0.016, (tx, ty) => mix(A.rustDk, A.oil, tx + ty * 0.3));
  }
  // sand mound burying right fluke
  ell(put, cx + S * 0.15, S * 0.72, S * 0.1, S * 0.045, (tx, ty) => mix('#4a5468', '#2a3242', clamp(tx + ty * 0.4, 0, 1)));
  // barnacle dots
  [[0.01, 0.4], [-0.02, 0.52], [0.02, 0.6]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.shell));
}
// 4 · TREASURE CHEST — open, gold glow
function drawChest(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // base box
  plate(put, cx - S * 0.13, S * 0.56, cx + S * 0.13, S * 0.72, A.rustDk, A.rust, A.oil);
  [0.6, 0.66].forEach(y => row(put, Math.round(S * y), cx - S * 0.13, cx + S * 0.13, () => A.brassDk));
  // open lid (tilted back)
  for (let y = S * 0.42; y < S * 0.52; y++) {
    const t = (y - S * 0.42) / (S * 0.1);
    row(put, Math.round(y), cx - S * (0.13 - t * 0.02), cx + S * (0.13 - t * 0.02), (tx) => mix(A.rust, A.rustDk, clamp(tx + t * 0.3, 0, 1)));
  }
  // gold heap + glow
  ell(put, cx, S * 0.55, S * 0.1, S * 0.035, (tx, ty) => mix('#f8d878', '#8a6418', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [[-0.06, 0.535], [0, 0.525], [0.055, 0.535]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#fff0c8'));
  glowDot(put, cx, S * 0.53, S * 0.008, '#ffd88a', '#fff0c8');
  // spilled coins
  [[-0.18, 0.72], [0.17, 0.74], [0.2, 0.7]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.012, S * 0.008, (tx) => mix('#f8d878', '#8a6418', tx)));
  put(Math.round(cx - S * 0.05), Math.round(S * 0.47), A.brass); // lock hasp
}
// 5 · KELP STALKS — towering ribbon forest
function drawKelp(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  [[-0.12, 0.9, 0.05], [0.02, 1, 0], [0.14, 0.8, -0.04]].forEach(([dx, hMult, sway]) => {
    for (let t = 0; t < 1; t += 0.025) {
      const px = cx + dx * S + Math.sin(t * 5 + dx * 20) * S * (0.02 + t * 0.03) + t * sway * S;
      const py = S * 0.86 - t * S * 0.72 * hMult;
      ell(put, px, py, S * 0.016, S * 0.01, (tx, ty) => mix('#4a7a3a', '#1e3a18', clamp(tx + ty * 0.4, 0, 1)));
      // ribbon leaves
      if ((t * 20 | 0) % 3 === 0) {
        fin(put, px, py, px + S * 0.055, py - S * 0.02, px + S * 0.04, py + S * 0.02, '#5a9a42', '#2a4a1e');
      }
      // gas bladders
      if ((t * 20 | 0) % 5 === 4) put(Math.round(px - 2), Math.round(py), '#8ac862');
    }
  });
  bubbles(put, cx + S * 0.06, S * 0.2, 3, 3);
}
// 6 · BRAIN CORAL — big glowing folds
function drawCoral(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  dome(put, cx, S * 0.58, S * 0.17, S * 0.14, '#c86a8a', '#e8a0b8', '#6e2a44');
  // maze folds
  for (let a = 0; a < Math.PI; a += 0.22) {
    for (let t = 0.1; t < 0.95; t += 0.04) {
      const rr = S * (0.05 + t * 0.11);
      const px = cx + Math.cos(a + Math.sin(t * 9) * 0.18) * rr;
      const py = S * 0.56 - Math.sin(a + Math.sin(t * 9) * 0.18) * rr * 0.7;
      put(Math.round(px), Math.round(py), '#6e2a44');
    }
  }
  // glow polyps
  [[-0.1, 0.5], [0.04, 0.44], [0.12, 0.52], [-0.02, 0.56]].forEach(([dx, dy]) => glowDot(put, cx + dx * S, S * dy, S * 0.006, A.pinkLt, A.white));
}
// 7 · TUBE WORMS — vent cluster, red plumes
function drawTubeworms(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // rock base
  ell(put, cx, S * 0.7, S * 0.13, S * 0.07, (tx, ty) => mix(A.rockLt, A.rockDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // white tubes at angles
  [[-0.08, -0.06, 0.9], [-0.02, 0.01, 1], [0.05, 0.03, 0.8], [0.1, 0.09, 0.7], [-0.13, -0.12, 0.65]].forEach(([x0, x1, h]) => {
    for (let t = 0; t < 1; t += 0.05) {
      const px = cx + (x0 + (x1 - x0) * t) * S, py = S * 0.68 - t * S * 0.3 * h;
      ell(put, px, py, S * 0.02, S * 0.014, (tx, ty) => mix('#e8e4d8', '#9a968a', clamp(tx + ty * 0.3, 0, 1)));
    }
    // red plume tip
    const tipx = cx + x1 * S, tipy = S * 0.68 - S * 0.3 * h;
    for (let i = -2; i <= 2; i++) stroke(put, tipx, tipy, tipx + i * 2.2, tipy - S * 0.035, 1.3, () => (i % 2 ? A.red : A.redDk));
  });
}
// 8 · BLACK SMOKER — hydrothermal vent chimney
function drawSmoker(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // chimney stack
  for (let y = S * 0.3; y < S * 0.82; y++) {
    const t = (y - S * 0.3) / (S * 0.52);
    const w = S * (0.035 + t * 0.1 + Math.sin(t * 9) * 0.008);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#3a3040', '#16121c', clamp(tx * 1.1 + t * 0.1, 0, 1));
      if (((tx * 10) | 0) % 4 === 0) b = mix(b, '#5a4a5a', 0.3); // mineral crust
      return b;
    });
  }
  // glowing throat + smoke plume
  ell(put, cx, S * 0.3, S * 0.03, S * 0.014, (tx, ty) => mix('#ff7d3a', '#7a1a0a', tx));
  for (let t = 0; t < 1; t += 0.07) {
    const px = cx + Math.sin(t * 4) * S * 0.03 * (1 + t), py = S * 0.28 - t * S * 0.2;
    ell(put, px, py, S * (0.02 + t * 0.03), S * (0.015 + t * 0.02), (tx, ty) => mix('#2a2430', A.ink, clamp(tx + t * 0.4, 0, 0.9)));
  }
  // heat shimmer dots + crab guest
  [[-0.07, 0.4], [0.08, 0.5]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#ff9a5a'));
  ell(put, cx + S * 0.14, S * 0.78, S * 0.025, S * 0.016, (tx, ty) => mix('#d8d4c8', '#8a8678', tx)); // vent crab
}
// 9 · WHALE FALL — colossal ribcage
function drawWhaleFall(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  // spine
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx - S * 0.26 + t * S * 0.52, py = S * 0.72 + Math.sin(t * Math.PI) * S * 0.015;
    ell(put, px, py, S * 0.022, S * 0.018, (tx, ty) => mix(A.bone, '#8a8670', clamp(tx + ty * 0.4, 0, 1)));
  }
  // rib arches
  [-0.18, -0.09, 0, 0.09, 0.18].forEach((dx, i) => {
    const h = 0.3 - Math.abs(dx) * 0.5;
    for (let t = 0; t < 1; t += 0.04) {
      const px = cx + dx * S + Math.sin(t * 1.5) * S * 0.05 * (dx < 0 ? -1 : 1);
      const py = S * 0.7 - t * S * h;
      ell(put, px, py, S * 0.011, S * 0.011, (tx, ty) => mix(A.bone, '#8a8670', tx + ty * 0.3));
    }
  });
  // skull mass
  ell(put, cx - S * 0.3, S * 0.68, S * 0.08, S * 0.06, (tx, ty) => mix(A.bone, '#6e6a58', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  ell(put, cx - S * 0.35, S * 0.66, S * 0.02, S * 0.016, () => A.oil); // eye socket
  // glow scavenger dots
  [[-0.1, 0.72], [0.06, 0.7], [0.16, 0.73]].forEach(([dx, dy]) => glowDot(put, cx + dx * S, S * dy, S * 0.005, A.glow, A.glowLt));
}
// 10 · GIANT CLAM — pearl glow
function drawClam(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // bottom shell
  for (let y = S * 0.58; y < S * 0.72; y++) {
    const t = (y - S * 0.58) / (S * 0.14);
    const w = S * (0.16 - t * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(A.shell, A.shellDk, clamp(tx * 1.1 + t * 0.2, 0, 1));
      if (((tx * 12) | 0) % 3 === 0) b = mix(b, '#8a8268', 0.4); // ridges
      return b;
    });
  }
  // top shell (open, tilted)
  for (let y = S * 0.42; y < S * 0.56; y++) {
    const t = (y - S * 0.42) / (S * 0.14);
    const w = S * (0.05 + t * 0.11);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#c8c0a8', A.shellDk, clamp(tx * 1.1 + (1 - t) * 0.3, 0, 1));
      if (((tx * 12) | 0) % 3 === 0) b = mix(b, '#8a8268', 0.35);
      return b;
    });
  }
  // mantle lips (wavy teal)
  for (let x = -0.14; x <= 0.14; x += 0.01) {
    put(Math.round(cx + x * S), Math.round(S * 0.565 + Math.sin(x * 60) * 1.8), '#3a9a9a');
    put(Math.round(cx + x * S), Math.round(S * 0.575 + Math.sin(x * 60 + 1) * 1.8), '#1e5a5e');
  }
  // THE PEARL
  ell(put, cx, S * 0.55, S * 0.028, S * 0.026, (tx, ty) => mix('#f8f4ff', '#b0aac8', clamp(tx + ty * 0.4, 0, 1)));
  glowDot(put, cx - S * 0.008, S * 0.542, S * 0.006, '#ffffff', '#ffffff');
}
// 11 · SUNKEN SUB — small research submersible
function drawSub(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.32);
  // hull (nose down in silt)
  for (let t = 0; t < 1; t += 0.03) {
    const px = cx - S * 0.2 + t * S * 0.42, py = S * 0.66 - t * S * 0.14;
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.075);
    ell(put, px, py, w, w * 0.85, (tx, ty) => {
      let b = mix('#c8a83a', '#6e5a14', clamp(ty * 1.3, 0, 1)); // yellow sub
      if (ty > 0.7) b = mix(b, A.rustDk, 0.5); // rust line
      return b;
    });
  }
  // conning tower + broken prop
  plate(put, cx + S * 0.02, S * 0.42, cx + S * 0.1, S * 0.5, '#c8a83a', '#e8cc70', '#6e5a14');
  [[0, 1], [1, 0], [0, -1]].forEach(([sx, sy]) => stroke(put, cx + S * 0.24, S * 0.5, cx + S * 0.24 + sx * S * 0.04, S * 0.5 + sy * S * 0.04, 1.6, () => A.rustDk));
  // dark porthole + crack
  ell(put, cx - S * 0.12, S * 0.6, S * 0.028, S * 0.028, (tx, ty) => mix(A.deepDk, A.oil, tx));
  stroke(put, cx - S * 0.06, S * 0.56, cx, S * 0.62, 1, () => A.oil);
  // silt mound over nose
  ell(put, cx - S * 0.22, S * 0.72, S * 0.09, S * 0.04, (tx, ty) => mix('#4a5468', '#2a3242', tx + ty * 0.3));
  bubbles(put, cx + S * 0.06, S * 0.4, 3, 3);
}
// 12 · CARGO CRATES — spilled shipping pile
function drawCrates(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // three crates, one burst open
  const crate = (x0, y0, w, h, tilt, burst) => {
    for (let y = 0; y < h; y++) {
      row(put, Math.round(y0 + y), x0 + tilt * y, x0 + w + tilt * y, (tx) => {
        let b = mix(A.rustLt, A.rustDk, clamp(tx * 1.1 + y / h * 0.2, 0, 1));
        if (((tx * 6) | 0) % 5 === 0 || y % Math.round(h * 0.9) < 1.2) b = mix(b, A.oil, 0.4);
        return b;
      });
    }
    stroke(put, x0, y0, x0 + w, y0 + h, 1, () => A.rustDk);
    if (burst) { fin(put, x0 + w * 0.5, y0, x0 + w * 0.3, y0 - h * 0.4, x0 + w * 0.75, y0 - h * 0.3, A.rust, A.rustDk); }
  };
  crate(cx - S * 0.22, S * 0.58, S * 0.16, S * 0.14, 0, false);
  crate(cx + S * 0.02, S * 0.6, S * 0.15, S * 0.13, 0.04, true);
  crate(cx - S * 0.1, S * 0.44, S * 0.14, S * 0.12, -0.03, false);
  // spilled glow cargo
  [[0.06, 0.56], [0.12, 0.54], [0.09, 0.5]].forEach(([dx, dy]) => glowDot(put, cx + dx * S, S * dy, S * 0.007, A.glow, A.glowLt));
}
// 13 · SHIP CANNON — barnacled wreck gun
function drawCannon(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // carriage
  plate(put, cx - S * 0.1, S * 0.6, cx + S * 0.12, S * 0.7, A.rustDk, A.rust, A.oil);
  [[-0.05], [0.07]].forEach(([dx]) => {
    ell(put, cx + dx * S, S * 0.72, S * 0.035, S * 0.035, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.12 ? mix(A.rust, A.rustDk, tx) : null));
  });
  // barrel angled up-left
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + S * 0.04 - t * S * 0.26, py = S * 0.58 - t * S * 0.14;
    const w = S * (0.038 - t * 0.012);
    ell(put, px, py, w, w, (tx, ty) => mix('#3a4048', '#14181e', clamp(tx + ty * 0.4, 0, 1)));
  }
  ell(put, cx - S * 0.22, S * 0.44, S * 0.026, S * 0.026, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.1 ? '#14181e' : A.oil)); // muzzle
  // barnacle crust + weed
  [[0, 0.55], [-0.08, 0.5], [-0.15, 0.47]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.shell));
  stroke(put, cx + S * 0.1, S * 0.58, cx + S * 0.12, S * 0.48, 1.3, () => '#3a5a3a');
  // cannonball pile
  [[0.16, 0.72], [0.2, 0.74], [0.18, 0.69]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.018, S * 0.018, (tx, ty) => mix('#3a4048', '#14181e', tx + ty)));
}
// 14 · ANEMONE BED — waving glow tendrils
function drawAnemone(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  [[-0.14, 0.66, A.pink, A.pinkLt], [0.02, 0.7, A.violet, A.violetLt], [0.15, 0.64, A.bio, A.bioLt]].forEach(([dx, dy, c, cLt]) => {
    const ax = cx + dx * S, ay = S * dy;
    // stalk
    for (let y = 0; y < S * 0.05; y++) row(Math.round ? Math.round(ay + y) : ay + y, 0, 0, () => null); // noop guard
    ell(put, ax, ay + S * 0.03, S * 0.035, S * 0.025, (tx, ty) => mix(c, A.deepDk, clamp(ty + tx * 0.3, 0, 1)));
    // tendrils
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI - Math.PI;
      const wob = Math.sin(i * 2.7) * 0.02;
      stroke(put, ax, ay, ax + Math.cos(a) * S * (0.05 + wob), ay + Math.sin(a) * S * 0.055 - S * 0.01, 1.3, () => (i % 2 ? c : cLt));
      put(Math.round(ax + Math.cos(a) * S * (0.055 + wob)), Math.round(ay + Math.sin(a) * S * 0.06 - S * 0.012), cLt);
    }
  });
  // clown-ish fish hiding
  ell(put, cx + S * 0.02, S * 0.6, S * 0.022, S * 0.014, (tx, ty) => ((tx * 3 | 0) % 2 ? '#e86a2a' : '#f4f4f4'));
}
// 15 · GHOST NET — drifting wall of netting
function drawNet(put, S) {
  const cx = S * 0.5;
  // net mesh diagonal drape
  for (let i = 0; i < 8; i++) {
    const x0 = cx - S * 0.24 + i * S * 0.065;
    for (let t = 0; t < 1; t += 0.04) {
      const px = x0 + Math.sin(t * 3 + i) * S * 0.02, py = S * 0.24 + t * S * 0.52;
      put(Math.round(px), Math.round(py), t % 0.16 < 0.08 ? '#8a9a8a' : '#5a6a5a');
    }
  }
  for (let j = 0; j < 7; j++) {
    const y0 = S * 0.28 + j * S * 0.075;
    for (let t = 0; t < 1; t += 0.04) {
      const px = cx - S * 0.24 + t * S * 0.48, py = y0 + Math.sin(t * 4 + j) * S * 0.015;
      put(Math.round(px), Math.round(py), t % 0.2 < 0.1 ? '#8a9a8a' : '#5a6a5a');
    }
  }
  // floats along top
  for (let i = 0; i < 5; i++) ell(put, cx - S * 0.2 + i * S * 0.1, S * 0.22, S * 0.02, S * 0.018, (tx, ty) => mix('#c86a3a', '#6e2a14', tx + ty * 0.4));
  // trapped fish skeleton + glow
  [[-0.08, 0.45], [0.1, 0.55]].forEach(([dx, dy]) => {
    stroke(put, cx + dx * S - 4, S * dy, cx + dx * S + 4, S * dy, 1, () => A.bone);
    [[-2], [0], [2]].forEach(([o]) => stroke(put, cx + dx * S + o, S * dy - 2, cx + dx * S + o, S * dy + 2, 0.8, () => A.bone));
  });
  glowDot(put, cx + S * 0.16, S * 0.36, S * 0.007, A.glow, A.glowLt);
}
// 16 · SUNKEN COLOSSUS HEAD — ancient statue face
function drawHead(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.3);
  // tilted stone head
  ell(put, cx, S * 0.56, S * 0.15, S * 0.17, (tx, ty) => {
    let b = mix('#7a8a90', '#3a464e', clamp(tx * 0.9 + ty * 0.5, 0, 1));
    return b;
  });
  // headdress band
  for (let y = S * 0.42; y < S * 0.48; y++) row(put, Math.round(y), cx - S * 0.14, cx + S * 0.14, (tx) => mix('#8a9aa0', '#4a565e', tx));
  // serene face features
  stroke(put, cx - S * 0.07, S * 0.54, cx - S * 0.02, S * 0.54, 1.6, () => '#2a343a'); // closed eye L
  stroke(put, cx + S * 0.02, S * 0.54, cx + S * 0.07, S * 0.54, 1.6, () => '#2a343a'); // closed eye R
  stroke(put, cx, S * 0.56, cx, S * 0.62, 1.4, () => '#4a565e'); // nose
  stroke(put, cx - S * 0.03, S * 0.66, cx + S * 0.03, S * 0.66, 1.4, () => '#2a343a'); // mouth
  // crack across the brow + moss
  stroke(put, cx - S * 0.12, S * 0.46, cx + S * 0.02, S * 0.52, 1, () => A.oil);
  [[-0.1, 0.44], [0.08, 0.47], [0.12, 0.62]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), '#3a5a3a'));
  // one eye glows faintly (it dreams)
  glowDot(put, cx + S * 0.045, S * 0.54, S * 0.005, A.bio, A.bioLt);
  // rubble
  ell(put, cx - S * 0.2, S * 0.74, S * 0.05, S * 0.03, (tx, ty) => mix('#7a8a90', '#3a464e', tx));
}
// 17 · SONAR BEACON — modern, blinking
function drawBeacon(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  // tripod base
  [[-0.1], [0.1], [0]].forEach(([dx]) => stroke(put, cx, S * 0.6, cx + dx * S, S * 0.78, 2, () => '#4a5058'));
  // instrument body
  plate(put, cx - S * 0.045, S * 0.44, cx + S * 0.045, S * 0.62, '#8a929a', '#c2cad2', '#3a4048');
  [0.48, 0.54].forEach(y => row(put, Math.round(S * y), cx - S * 0.04, cx + S * 0.04, () => '#3a4048'));
  // blinking red light + ping rings
  glowDot(put, cx, S * 0.4, S * 0.012, A.red, A.redLt);
  for (let r = 1; r <= 3; r++) {
    for (let a = -0.9; a < 0.9; a += 0.12) {
      put(Math.round(cx + Math.cos(a - Math.PI / 2) * S * 0.05 * r), Math.round(S * 0.4 + Math.sin(a - Math.PI / 2) * S * 0.05 * r), r % 2 ? A.redDk : '#7a3a3a');
    }
  }
  // cable running off
  for (let t = 0; t < 1; t += 0.05) put(Math.round(cx + S * (0.05 + t * 0.2)), Math.round(S * (0.76 + Math.sin(t * 5) * 0.015)), '#2a3038');
}
// 18 · AMPHORA PILE — ancient jars
function drawAmphorae(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  const jar = (jx, jy, sc, tilt, broken) => {
    for (let t = 0; t < 1; t += 0.05) {
      const w = S * sc * (0.02 + Math.sin(t * Math.PI * 0.85 + 0.2) * 0.045);
      if (broken && t > 0.62) break;
      ell(put, jx + tilt * t * S * 0.1, jy - t * S * 0.22 * sc, w, w * 0.8, (tx, ty) => {
        let b = mix('#b8825a', '#5e3c22', clamp(tx * 1.05 + ty * 0.3, 0, 1));
        if (((t * 12) | 0) % 4 === 0) b = mix(b, '#5e3c22', 0.35); // bands
        return b;
      });
    }
    if (!broken) { // neck + handles
      ell(put, jx + tilt * S * 0.1, jy - S * 0.235 * sc, S * 0.02 * sc, S * 0.014 * sc, (tx, ty) => mix('#b8825a', '#5e3c22', tx));
      [[-1], [1]].forEach(([s]) => stroke(put, jx + tilt * S * 0.09 + s * S * 0.025 * sc, jy - S * 0.2 * sc, jx + tilt * S * 0.1 + s * S * 0.035 * sc, jy - S * 0.15 * sc, 1.2, () => '#5e3c22'));
    }
  };
  jar(cx - S * 0.1, S * 0.78, 1, 0, false);
  jar(cx + S * 0.08, S * 0.78, 0.85, 0.25, false);
  jar(cx + S * 0.16, S * 0.74, 0.7, 0.9, true); // fallen + broken
  // spilled ancient coins + octopus arm in one
  [[0.2, 0.72], [0.24, 0.74]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.brassLt));
  tentacle(put, cx - S * 0.1, S * 0.6, cx - S * 0.18, S * 0.5, S * 0.014, '#7a3a5a', '#3a1428', 5);
}
// 19 · MOORING LINE — rope + floats rising to nowhere
function drawMooring(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.16);
  // concrete block anchor
  plate(put, cx - S * 0.08, S * 0.7, cx + S * 0.08, S * 0.82, '#5a626e', '#8a929e', '#2e343e');
  // taut rope going up + off-screen
  for (let t = 0; t < 1; t += 0.02) {
    const px = cx + Math.sin(t * 2.2) * S * 0.02, py = S * 0.7 - t * S * 0.62;
    put(Math.round(px), Math.round(py), (t * 25 | 0) % 2 ? '#a89868' : '#6e6244');
  }
  // floats along the line
  [[0.3], [0.5], [0.14]].forEach(([t]) => {
    const px = cx + Math.sin(t * 2.2) * S * 0.02, py = S * 0.7 - t * S * 0.62;
    ell(put, px, py, S * 0.024, S * 0.02, (tx, ty) => mix('#c86a3a', '#6e2a14', clamp(tx + ty * 0.4, 0, 1)));
  });
  // small fish nibbling the rope + weed
  ell(put, cx + S * 0.06, S * 0.4, S * 0.02, S * 0.012, (tx, ty) => mix('#6a8ab0', '#2a3e58', ty));
  fin(put, cx + S * 0.08, S * 0.4, cx + S * 0.11, S * 0.385, cx + S * 0.1, S * 0.415, '#4a6a90', '#2a3e58');
  stroke(put, cx - S * 0.02, S * 0.56, cx - S * 0.05, S * 0.62, 1.2, () => '#3a5a3a');
}
// 20 · SUNKEN LIGHTHOUSE — toppled tower, still lit
function drawLighthouse(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.34);
  // toppled striped tower lying diagonally
  for (let t = 0; t < 1; t += 0.025) {
    const px = cx - S * 0.26 + t * S * 0.5, py = S * 0.72 - t * S * 0.24;
    const w = S * (0.075 - t * 0.03);
    ell(put, px, py, w, w * 0.9, (tx, ty) => {
      const stripe = ((t * 8) | 0) % 2 === 0;
      let b = stripe ? mix('#c84a3a', '#6e2014', clamp(tx + ty * 0.4, 0, 1)) : mix('#e8e4d8', '#9a968a', clamp(tx + ty * 0.4, 0, 1));
      return b;
    });
  }
  // lantern room at the high end — STILL GLOWING
  ell(put, cx + S * 0.26, S * 0.46, S * 0.045, S * 0.045, (tx, ty) => mix('#3a4048', '#14181e', tx + ty * 0.3));
  glowDot(put, cx + S * 0.26, S * 0.455, S * 0.018, '#ffd88a', '#fff0c8');
  // light beam cone sweeping
  for (let t = 0; t < 1; t += 0.06) {
    const px = cx + S * (0.3 + t * 0.16), py = S * (0.44 - t * 0.1);
    put(Math.round(px), Math.round(py), mix('#ffd88a', A.deep, 0.4 + t * 0.5));
    put(Math.round(px), Math.round(py + 3 + t * 6), mix('#ffd88a', A.deep, 0.5 + t * 0.5));
  }
  // rubble base + weed
  ell(put, cx - S * 0.3, S * 0.76, S * 0.06, S * 0.035, (tx, ty) => mix('#7a8a90', '#3a464e', tx));
  stroke(put, cx - S * 0.1, S * 0.6, cx - S * 0.12, S * 0.5, 1.4, () => '#3a5a3a');
}

const LIST = [
  { n: 1, name: 'SHIPWRECK HULL', role: 'broken ribs landmark', draw: drawWreck },
  { n: 2, name: 'DIVING BELL', role: 'brass, warm porthole', draw: drawBell },
  { n: 3, name: 'GIANT ANCHOR', role: 'half-buried', draw: drawAnchor },
  { n: 4, name: 'TREASURE CHEST', role: 'open gold glow', draw: drawChest },
  { n: 5, name: 'KELP STALKS', role: 'towering forest', draw: drawKelp },
  { n: 6, name: 'BRAIN CORAL', role: 'glowing folds', draw: drawCoral },
  { n: 7, name: 'TUBE WORMS', role: 'vent cluster plumes', draw: drawTubeworms },
  { n: 8, name: 'BLACK SMOKER', role: 'hydrothermal chimney', draw: drawSmoker },
  { n: 9, name: 'WHALE FALL', role: 'colossal ribcage', draw: drawWhaleFall },
  { n: 10, name: 'GIANT CLAM', role: 'pearl glow', draw: drawClam },
  { n: 11, name: 'SUNKEN SUB', role: 'yellow submersible', draw: drawSub },
  { n: 12, name: 'CARGO CRATES', role: 'spilled pile', draw: drawCrates },
  { n: 13, name: 'SHIP CANNON', role: 'barnacled wreck gun', draw: drawCannon },
  { n: 14, name: 'ANEMONE BED', role: 'waving glow tendrils', draw: drawAnemone },
  { n: 15, name: 'GHOST NET', role: 'drifting net wall', draw: drawNet },
  { n: 16, name: 'COLOSSUS HEAD', role: 'ancient statue face', draw: drawHead },
  { n: 17, name: 'SONAR BEACON', role: 'modern, blinking', draw: drawBeacon },
  { n: 18, name: 'AMPHORA PILE', role: 'ancient jars', draw: drawAmphorae },
  { n: 19, name: 'MOORING LINE', role: 'rope + floats rising', draw: drawMooring },
  { n: 20, name: 'SUNKEN LIGHTHOUSE', role: 'toppled, still lit', draw: drawLighthouse },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_decor_options.png', title: 'THE ABYSS — DECOR CANDIDATES (pick any set)', S: 160 });
}
module.exports = { LIST };
