// artdev/abyss/render_abyss_mobs.js — 20 numbered THE ABYSS mob
// candidates, one PNG grid. Deep-sea trench horrors + drowned things.
'use strict';
const KIT = require('./abyss_kit.js');
const { A, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glowDot, tentacle, fin, bubbles } = KIT;

// 1 · ANGLERFISH — lure ambusher
function drawAngler(put, S) {
  const cx = S * 0.5;
  // fat dark body
  ell(put, cx + S * 0.03, S * 0.55, S * 0.16, S * 0.12, (tx, ty) => mix('#2a3040', A.deepDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // huge jaw agape w/ needle teeth
  for (let y = S * 0.52; y < S * 0.66; y++) {
    const t = (y - S * 0.52) / (S * 0.14);
    row(put, Math.round(y), cx - S * (0.2 - t * 0.06), cx - S * 0.02, (tx) => mix(A.ink, A.pinkDk, tx * 0.5));
  }
  for (let i = 0; i < 6; i++) { stroke(put, cx - S * (0.18 - i * 0.028), S * 0.52, cx - S * (0.185 - i * 0.028), S * 0.56, 1, () => A.white); stroke(put, cx - S * (0.17 - i * 0.028), S * 0.66, cx - S * (0.165 - i * 0.028), S * 0.61, 1, () => A.white); }
  optic(put, cx - S * 0.03, S * 0.47, S * 0.014, A.oil, A.glow, A.glowLt);
  // lure stalk + glow
  stroke(put, cx - S * 0.05, S * 0.42, cx - S * 0.16, S * 0.3, 1.4, () => A.fleshDk);
  glowDot(put, cx - S * 0.17, S * 0.28, S * 0.02, A.glow, A.glowLt);
  fin(put, cx + S * 0.17, S * 0.5, cx + S * 0.26, S * 0.44, cx + S * 0.24, S * 0.58, '#2a3040', A.deepDk); // tail
  bubbles(put, cx + S * 0.1, S * 0.4, 3);
}
// 2 · GIANT ISOPOD — rolling armor tank
function drawIsopod(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.28);
  // segmented shell arc
  for (let i = 0; i < 6; i++) {
    const sx = cx - S * 0.14 + i * S * 0.055;
    ell(put, sx, S * 0.56 - Math.sin(i / 5 * Math.PI) * S * 0.05, S * 0.05, S * 0.09, (tx, ty) => {
      let b = mix(A.shell, A.shellDk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (tx < 0.2) b = mix(b, '#d8d4c0', 0.4);
      return b;
    });
  }
  // legs
  for (let i = 0; i < 6; i++) stroke(put, cx - S * 0.12 + i * S * 0.05, S * 0.62, cx - S * 0.14 + i * S * 0.05, S * 0.7, 1.2, () => A.shellDk);
  // face + antennae
  ell(put, cx - S * 0.17, S * 0.55, S * 0.035, S * 0.04, (tx, ty) => mix(A.shell, A.shellDk, tx));
  optic(put, cx - S * 0.18, S * 0.53, S * 0.008, A.oil, A.violet, A.violetLt);
  [[-1], [1]].forEach(([s]) => stroke(put, cx - S * 0.19, S * 0.55, cx - S * 0.25, S * (0.5 + s * 0.02), 1, () => A.shellDk));
}
// 3 · MORAY EEL — hole striker
function drawMoray(put, S) {
  const cx = S * 0.5;
  // rock w/ hole
  ell(put, cx + S * 0.1, S * 0.62, S * 0.16, S * 0.13, (tx, ty) => mix(A.rockLt, A.rockDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  ell(put, cx + S * 0.04, S * 0.56, S * 0.06, S * 0.055, () => A.oil);
  // eel S-body out of hole
  const pts = [[0.04, 0.56], [-0.04, 0.5], [-0.12, 0.46], [-0.17, 0.38]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    for (let t = 0; t < 1; t += 0.08) {
      const w = S * (0.045 - (i * 0.25 + t * 0.25) * 0.014);
      ell(put, cx + (x0 + (x1 - x0) * t) * S, S * (y0 + (y1 - y0) * t), w, w, (tx, ty) => {
        let b = mix('#5a7a4a', '#2a3e22', clamp(tx + ty * 0.4, 0, 1));
        if ((t * 10 | 0) % 2) b = mix(b, '#7a9a5a', 0.25); // mottling
        return b;
      });
    }
  }
  // head + hinged jaw
  ell(put, cx - S * 0.19, S * 0.34, S * 0.045, S * 0.035, (tx, ty) => mix('#5a7a4a', '#2a3e22', tx + ty * 0.3));
  stroke(put, cx - S * 0.22, S * 0.36, cx - S * 0.14, S * 0.38, 1.6, () => A.ink); // open jaw line
  for (let i = 0; i < 3; i++) put(Math.round(cx - S * (0.21 - i * 0.02)), Math.round(S * 0.365), A.white);
  optic(put, cx - S * 0.2, S * 0.325, S * 0.008, A.oil, A.glow, A.glowLt);
}
// 4 · GHOST JELLY — drifting stinger bloom
function drawJelly(put, S) {
  const cx = S * 0.5;
  // translucent bell
  dome(put, cx, S * 0.38, S * 0.13, S * 0.11, A.violet, A.violetLt, A.violetDk);
  ell(put, cx, S * 0.36, S * 0.09, S * 0.06, (tx, ty) => mix(A.violetLt, A.violet, ty)); // inner glow
  glowDot(put, cx, S * 0.34, S * 0.015, A.violetLt, A.white);
  // trailing tentacles
  for (let i = -3; i <= 3; i++) {
    const tx0 = cx + i * S * 0.035;
    for (let t = 0; t < 1; t += 0.06) {
      const px = tx0 + Math.sin(t * 6 + i) * S * 0.014, py = S * 0.46 + t * S * 0.34;
      put(Math.round(px), Math.round(py), t % 0.24 < 0.12 ? A.violetLt : A.violet);
    }
  }
  // sting sparkles
  [[-0.08, 0.66], [0.06, 0.74], [0.11, 0.6]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.white));
}
// 5 · SWORDFISH — lance-charge lanes
function drawSword(put, S) {
  const cx = S * 0.5;
  // streamlined body angled
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx + S * (0.2 - t * 0.3), py = S * (0.42 + t * 0.16);
    const w = S * (0.02 + Math.sin(t * Math.PI) * 0.05);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      let b = mix('#6a8ab0', '#2a3e58', clamp(ty * 1.3, 0, 1));
      if (ty < 0.35) b = mix(b, '#a8c8e8', 0.4);
      return b;
    });
  }
  // sword bill
  stroke(put, cx - S * 0.1, S * 0.58, cx - S * 0.3, S * 0.66, 2, () => A.bone);
  // fins
  fin(put, cx + S * 0.08, S * 0.42, cx + S * 0.16, S * 0.28, cx + S * 0.02, S * 0.4, '#4a6a90', '#2a3e58'); // dorsal sail
  fin(put, cx + S * 0.2, S * 0.46, cx + S * 0.3, S * 0.4, cx + S * 0.28, S * 0.54, '#4a6a90', '#2a3e58'); // tail
  optic(put, cx - S * 0.06, S * 0.55, S * 0.009, A.oil, A.oil, '#fff');
  // speed lines
  [[0.3, 0.4], [0.34, 0.48]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.08) * S, S * (dy - 0.02), 1, () => A.deepLt));
}
// 6 · HAMMERHEAD — circling shark
function drawHammer(put, S) {
  const cx = S * 0.5;
  // body curve
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx - S * 0.16 + t * S * 0.36, py = S * 0.5 + Math.sin(t * 2.4) * S * 0.03;
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.045);
    ell(put, px, py, w, w * 0.85, (tx, ty) => {
      let b = mix(A.flesh, A.fleshDk, clamp(ty * 1.4, 0, 1));
      if (ty > 0.6) b = mix(b, A.white, 0.35); // white belly
      return b;
    });
  }
  // hammer head T
  plate(put, cx - S * 0.26, S * 0.45, cx - S * 0.12, S * 0.52, A.flesh, A.fleshLt, A.fleshDk);
  optic(put, cx - S * 0.25, S * 0.485, S * 0.009, A.oil, A.oil, '#fff');
  optic(put, cx - S * 0.13, S * 0.485, S * 0.009, A.oil, A.oil, '#fff');
  // dorsal + tail
  fin(put, cx, S * 0.44, cx + S * 0.06, S * 0.3, cx - S * 0.05, S * 0.44, A.fleshDk, '#3a4452');
  fin(put, cx + S * 0.2, S * 0.5, cx + S * 0.3, S * 0.38, cx + S * 0.28, S * 0.56, A.fleshDk, '#3a4452');
  // gill slits
  for (let i = 0; i < 3; i++) stroke(put, cx - S * (0.08 - i * 0.02), S * 0.47, cx - S * (0.08 - i * 0.02), S * 0.53, 1, () => A.fleshDk);
}
// 7 · VOLT EEL — electric shock rings
function drawVolt(put, S) {
  const cx = S * 0.5;
  // coiled body
  for (let a = 0; a < 10; a += 0.05) {
    const r = S * 0.05 + a * S * 0.013;
    const x = cx + Math.cos(a + 1) * r, y = S * 0.55 + Math.sin(a + 1) * r * 0.55;
    ell(put, x, y, S * 0.026, S * 0.023, (tx, ty) => {
      let b = mix('#4a5a3a', '#242e1a', clamp(tx + ty * 0.4, 0, 1));
      if ((a * 3 | 0) % 3 === 0) b = mix(b, '#d8e84a', 0.3); // charge stripes
      return b;
    });
  }
  // head
  ell(put, cx - S * 0.14, S * 0.4, S * 0.04, S * 0.032, (tx, ty) => mix('#4a5a3a', '#242e1a', tx + ty * 0.3));
  optic(put, cx - S * 0.15, S * 0.39, S * 0.008, A.oil, '#d8e84a', '#f8ffb0');
  // arcing bolts
  [[0.12, 0.35], [-0.2, 0.6], [0.2, 0.68]].forEach(([dx, dy], i) => {
    let px = cx + dx * S, py = S * dy;
    for (let s = 0; s < 4; s++) { const nx = px + (i % 2 ? 4 : -4) + Math.sin(s * 7) * 3, ny = py - 4; stroke(put, px, py, nx, ny, 1, () => s % 2 ? '#f8ffb0' : '#d8e84a'); px = nx; py = ny; }
  });
}
// 8 · VAMPIRE SQUID — ink-cloud zoner
function drawVampSquid(put, S) {
  const cx = S * 0.5;
  // ink cloud behind
  ell(put, cx + S * 0.12, S * 0.62, S * 0.14, S * 0.1, (tx, ty) => mix(A.ink, A.deepDk, clamp(tx + ty * 0.3, 0, 1)));
  ell(put, cx + S * 0.2, S * 0.54, S * 0.08, S * 0.06, (tx, ty) => mix(A.ink, A.deepDk, tx));
  // mantle
  dome(put, cx - S * 0.04, S * 0.38, S * 0.09, S * 0.12, '#6a2a3a', '#a04a5a', '#3a1220');
  // big blue eye
  optic(put, cx - S * 0.06, S * 0.44, S * 0.018, A.oil, A.bio, A.bioLt);
  // webbed arms (cloak)
  for (let i = -3; i <= 3; i++) {
    const ax = cx - S * 0.04 + i * S * 0.028;
    stroke(put, ax, S * 0.48, ax + i * S * 0.012, S * 0.66, S * 0.016, () => (i % 2 ? '#6a2a3a' : '#4a1a28'));
  }
  for (let y = S * 0.5; y < S * 0.62; y += 2) row(put, Math.round(y), cx - S * 0.12, cx + S * 0.06, (tx) => ((tx * 8 | 0) % 2 ? null : mix('#4a1a28', A.ink, tx))); // web
  // glow tips
  [[-0.13, 0.66], [-0.04, 0.68], [0.05, 0.66]].forEach(([dx, dy]) => glowDot(put, cx + dx * S, S * dy, S * 0.008, A.bio, A.bioLt));
}
// 9 · GULPER — elite swallow lunge
function drawGulper(put, S) {
  const cx = S * 0.5;
  // absurd mouth — most of the body
  for (let y = S * 0.36; y < S * 0.68; y++) {
    const t = (y - S * 0.36) / (S * 0.32);
    const w = S * (0.06 + Math.sin(t * Math.PI) * 0.16);
    row(put, Math.round(y), cx - w, cx + S * 0.04, (tx) => {
      let b = mix('#1a2230', A.deepDk, clamp(tx * 0.8, 0, 1));
      if (tx < 0.12) b = mix(b, A.pinkDk, 0.5); // inner mouth
      return b;
    });
  }
  // jaw rims
  stroke(put, cx - S * 0.2, S * 0.38, cx + S * 0.04, S * 0.35, 2, () => '#2a3446');
  stroke(put, cx - S * 0.2, S * 0.66, cx + S * 0.04, S * 0.69, 2, () => '#2a3446');
  // whip tail w/ glow tip
  for (let t = 0; t < 1; t += 0.05) {
    const px = cx + S * (0.04 + t * 0.3), py = S * (0.52 + Math.sin(t * 5) * 0.05 * (1 - t));
    put(Math.round(px), Math.round(py), '#2a3446');
  }
  glowDot(put, cx + S * 0.35, S * 0.5, S * 0.012, A.pink, A.pinkLt);
  optic(put, cx - S * 0.02, S * 0.4, S * 0.01, A.oil, A.glow, A.glowLt);
  bubbles(put, cx - S * 0.24, S * 0.5, 3, 4);
}
// 10 · MINE URCHIN — static spike hazard
function drawUrchin(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.2);
  ell(put, cx, S * 0.6, S * 0.09, S * 0.08, (tx, ty) => mix('#3a2a4a', '#1a1224', clamp(tx + ty * 0.4, 0, 1)));
  // spines
  for (let a = 0; a < Math.PI * 2; a += 0.32) {
    const len = S * (0.1 + (a * 7 % 1) * 0.04);
    stroke(put, cx + Math.cos(a) * S * 0.07, S * 0.6 + Math.sin(a) * S * 0.06, cx + Math.cos(a) * (S * 0.07 + len), S * 0.6 + Math.sin(a) * (S * 0.06 + len * 0.9), 1.3, () => (a % 0.64 < 0.32 ? '#5a4a7a' : '#2a1e3a'));
    put(Math.round(cx + Math.cos(a) * (S * 0.07 + len)), Math.round(S * 0.6 + Math.sin(a) * (S * 0.06 + len * 0.9)), A.violetLt);
  }
  // warning glow core
  glowDot(put, cx, S * 0.6, S * 0.016, A.red, A.redLt);
}
// 11 · CRIMSON STARFISH — clinger, leaps + latches
function drawStarfish(put, S) {
  const cx = S * 0.5, cy = S * 0.52; shadow(put, S, cx, S * 0.22);
  // five thick arms
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    for (let t = 0; t < 1; t += 0.06) {
      const w = S * (0.055 - t * 0.038);
      const px = cx + Math.cos(a) * t * S * 0.19, py = cy + Math.sin(a) * t * S * 0.19;
      ell(put, px, py, w, w, (tx, ty) => {
        let b = mix('#e05a3a', '#8a2014', clamp(tx * 0.9 + ty * 0.5, 0, 1));
        return b;
      });
    }
    // bumpy texture dots down the arm
    for (let t = 0.15; t < 0.95; t += 0.2) put(Math.round(cx + Math.cos(a) * t * S * 0.19), Math.round(cy + Math.sin(a) * t * S * 0.19 - 1), '#ff9a6a');
  }
  // center disc + one big cyclopean suction-eye (menace)
  ell(put, cx, cy, S * 0.055, S * 0.05, (tx, ty) => mix('#e05a3a', '#8a2014', clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx, cy - S * 0.005, S * 0.013, A.oil, A.gold || '#e0a832', '#f8d878');
  // underside sucker dots peeking on two lifted arms
  [[1, 0.6], [4, 0.7]].forEach(([i, t]) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    [0.35, 0.55, 0.75].forEach(tt => put(Math.round(cx + Math.cos(a) * tt * S * 0.19), Math.round(cy + Math.sin(a) * tt * S * 0.19 + 2), A.pinkLt));
  });
  // leap dust
  [[-0.18, 0.75], [0.16, 0.78]].forEach(([dx, dy]) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.01, (tx) => mix(A.deepLt, A.deep, tx)));
}
// 12 · DROWNED DIVER — old brass suit, harpoon
function drawDiver(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // legs + boots
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.045, S * 0.6, cx + s * S * 0.05, S * 0.82, S * 0.034, () => A.rustDk);
    plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, A.brassDk, A.brass, A.oil);
  });
  // canvas suit torso
  for (let y = S * 0.42; y < S * 0.62; y++) {
    const t = (y - S * 0.42) / (S * 0.2), w = S * (0.09 + t * 0.01);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#8a8272', '#4a4438', clamp(tx * 1.2, 0, 1));
      if ((y | 0) % 6 === 0) b = mix(b, '#3a3428', 0.4); // canvas seams
      return b;
    });
  }
  // chest plate + hoses
  plate(put, cx - S * 0.05, S * 0.44, cx + S * 0.05, S * 0.52, A.brass, A.brassLt, A.brassDk);
  stroke(put, cx - S * 0.06, S * 0.4, cx - S * 0.12, S * 0.52, 1.6, () => A.rustDk);
  // brass helmet + dead green glow porthole
  dome(put, cx, S * 0.35, S * 0.07, S * 0.075, A.brass, A.brassLt, A.brassDk);
  ell(put, cx, S * 0.36, S * 0.035, S * 0.035, (tx, ty) => mix('#0a1a12', A.oil, tx));
  glowDot(put, cx - S * 0.008, S * 0.355, S * 0.009, A.glow, A.glowLt);
  [[-0.055, 0], [0.055, 0]].forEach(([dx]) => ell(put, cx + dx * S, S * 0.36, S * 0.012, S * 0.014, (tx, ty) => mix(A.brassDk, A.oil, ty))); // side ports
  // harpoon
  stroke(put, cx + S * 0.08, S * 0.56, cx + S * 0.22, S * 0.3, 2, () => A.rust);
  stroke(put, cx + S * 0.22, S * 0.3, cx + S * 0.245, S * 0.255, 2.4, () => A.fleshLt);
  // weed drape
  stroke(put, cx - S * 0.07, S * 0.42, cx - S * 0.1, S * 0.56, 1.4, () => '#3a5a3a');
  bubbles(put, cx + S * 0.02, S * 0.28, 4, 3);
}
// 13 · GHOST FISHERMAN — drowned angler crewman, rod + gaff
function drawFisherman(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.24);
  // waders + boots
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.045, S * 0.58, cx + s * S * 0.05, S * 0.82, S * 0.036, () => '#3a4a3a');
    plate(put, cx + s * S * 0.05 - S * 0.035, S * 0.82, cx + s * S * 0.05 + S * 0.04, S * 0.87, '#2a3628', '#3a4a3a', A.oil);
  });
  // slicker coat — drowned yellow, algae-stained
  for (let y = S * 0.4; y < S * 0.6; y++) {
    const t = (y - S * 0.4) / (S * 0.2), w = S * (0.085 + t * 0.02);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#c8b04a', '#8a7628', clamp(tx * 1.2, 0, 1));
      if (tx > 0.75) b = mix(b, '#5a4c14', 0.5);
      if (((tx * 9) | 0) % 4 === 0 && t > 0.4) b = mix(b, '#4a6a4a', 0.35); // algae streaks
      return b;
    });
  }
  // rod arm — bent rod w/ glowing lure cast toward you
  stroke(put, cx + S * 0.08, S * 0.45, cx + S * 0.15, S * 0.36, S * 0.02, () => '#c8b04a');
  for (let t = 0; t < 1; t += 0.06) { const px = cx + S * (0.16 + t * 0.1), py = S * (0.35 - t * 0.1 + t * t * 0.06); put(Math.round(px), Math.round(py), A.rustDk); }
  stroke(put, cx + S * 0.26, S * 0.31, cx + S * 0.24, S * 0.5, 0.8, () => A.deepLt); // line
  glowDot(put, cx + S * 0.24, S * 0.52, S * 0.011, A.red, A.redLt); // hooked lure
  // gaff hook arm
  stroke(put, cx - S * 0.08, S * 0.45, cx - S * 0.15, S * 0.56, S * 0.02, () => '#c8b04a');
  stroke(put, cx - S * 0.155, S * 0.56, cx - S * 0.14, S * 0.64, 1.6, () => A.rust);
  // head — sou'wester hat + pale drowned face, glow eyes
  ell(put, cx, S * 0.34, S * 0.052, S * 0.055, (tx, ty) => mix(A.flesh, A.fleshDk, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.018, S * 0.33, S * 0.009, A.oil, A.glow, A.glowLt);
  optic(put, cx + S * 0.018, S * 0.33, S * 0.009, A.oil, A.glow, A.glowLt);
  // sou'wester (back-sloped rain hat)
  ell(put, cx, S * 0.3, S * 0.065, S * 0.028, (tx, ty) => mix('#c8b04a', '#8a7628', tx + ty * 0.3));
  dome(put, cx, S * 0.285, S * 0.045, S * 0.03, '#c8b04a', '#e0cc70', '#8a7628');
  stroke(put, cx + S * 0.05, S * 0.3, cx + S * 0.085, S * 0.33, 1.6, () => '#8a7628'); // back brim droop
  bubbles(put, cx - S * 0.1, S * 0.3, 3, 3);
}
// 14 · MANTIS SHRIMP — punch burster
function drawMantis(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // segmented colorful body
  for (let i = 0; i < 5; i++) {
    const sx = cx - S * 0.02 + i * S * 0.05;
    ell(put, sx, S * 0.56 + i * S * 0.012, S * 0.045, S * 0.05, (tx, ty) => {
      const cols = ['#3a8a6a', '#4a9a5a', '#5aaa4a', '#6a9a3a', '#7a8a2a'];
      return mix(cols[i], '#1a3a2a', clamp(tx * 0.9 + ty * 0.5, 0, 1));
    });
  }
  // tail fan
  fin(put, cx + S * 0.22, S * 0.62, cx + S * 0.3, S * 0.56, cx + S * 0.28, S * 0.7, '#c86a3a', '#7a3a1a');
  // head + stalk eyes
  ell(put, cx - S * 0.08, S * 0.52, S * 0.05, S * 0.045, (tx, ty) => mix('#3a8a6a', '#1a3a2a', tx + ty * 0.3));
  [[-0.11, -1], [-0.06, 1]].forEach(([dx]) => {
    stroke(put, cx + dx * S, S * 0.49, cx + dx * S - S * 0.01, S * 0.43, 1.2, () => '#3a8a6a');
    optic(put, cx + dx * S - S * 0.012, S * 0.42, S * 0.009, A.oil, A.violet, A.violetLt);
  });
  // punch clubs COCKED + impact flash
  [[-0.14, 0.56], [-0.12, 0.62]].forEach(([dx, dy]) => {
    stroke(put, cx - S * 0.06, S * dy, cx + dx * S, S * (dy + 0.02), S * 0.02, () => '#c86a3a');
    ell(put, cx + dx * S - S * 0.015, S * (dy + 0.02), S * 0.02, S * 0.018, (tx, ty) => mix('#e88a4a', '#a04a1a', ty));
  });
  [[-0.2, 0.55], [-0.22, 0.6], [-0.19, 0.65]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.white)); // cavitation sparks
}
// 15 · TRENCH LOBSTER — big claws, snip charge
function drawLobster(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.26);
  // segmented tail curling behind
  for (let i = 0; i < 5; i++) {
    const sx = cx + S * (0.08 + i * 0.038), sy = S * (0.58 + i * 0.022);
    ell(put, sx, sy, S * (0.05 - i * 0.007), S * (0.04 - i * 0.005), (tx, ty) => mix('#c84a3a', '#6e2014', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  }
  fin(put, cx + S * 0.27, S * 0.68, cx + S * 0.34, S * 0.64, cx + S * 0.32, S * 0.74, '#c84a3a', '#6e2014'); // tail fan
  // carapace
  ell(put, cx - S * 0.02, S * 0.54, S * 0.09, S * 0.07, (tx, ty) => {
    let b = mix('#e06a4a', '#8a2a1a', clamp(tx * 0.9 + ty * 0.5, 0, 1));
    if (ty < 0.3) b = mix(b, '#ff9a6a', 0.3);
    return b;
  });
  // walking legs
  for (let i = 0; i < 4; i++) stroke(put, cx - S * 0.04 + i * S * 0.035, S * 0.6, cx - S * 0.06 + i * S * 0.04, S * 0.7, 1.2, () => '#8a2a1a');
  // HUGE claws forward — one open, one closed
  [[-0.16, 0.46, 1], [-0.14, 0.62, 0]].forEach(([dx, dy, open]) => {
    stroke(put, cx - S * 0.08, S * 0.54, cx + dx * S, S * dy, S * 0.024, () => '#c84a3a');
    ell(put, cx + (dx - 0.06) * S, S * dy, S * 0.05, S * 0.035, (tx, ty) => mix('#e06a4a', '#8a2a1a', clamp(tx + ty * 0.4, 0, 1)));
    if (open) { // open pincer gap
      fin(put, cx + (dx - 0.1) * S, S * (dy - 0.03), cx + (dx - 0.14) * S, S * (dy - 0.05), cx + (dx - 0.08) * S, S * (dy - 0.01), '#e06a4a', '#8a2a1a');
      fin(put, cx + (dx - 0.1) * S, S * (dy + 0.03), cx + (dx - 0.14) * S, S * (dy + 0.05), cx + (dx - 0.08) * S, S * (dy + 0.01), '#c84a3a', '#6e2014');
    } else { put(Math.round(cx + (dx - 0.1) * S), Math.round(S * dy), '#6e2014'); }
  });
  // stalk eyes + antennae
  [[-0.05], [0.01]].forEach(([dx]) => { stroke(put, cx + dx * S, S * 0.49, cx + dx * S, S * 0.45, 1.2, () => '#8a2a1a'); optic(put, cx + dx * S, S * 0.44, S * 0.007, A.oil, A.oil, '#fff'); });
  [[-1], [1]].forEach(([s]) => stroke(put, cx - S * 0.02, S * 0.48, cx - S * 0.02 + s * S * 0.14, S * 0.36, 0.9, () => '#e06a4a'));
}
// 16 · BANDED SEA SNAKE — venom swimmer, S-strike
function drawSeaSnake(put, S) {
  const cx = S * 0.5;
  // long banded S-body swimming
  for (let t = 0; t < 1; t += 0.025) {
    const px = cx - S * 0.22 + t * S * 0.42, py = S * 0.55 + Math.sin(t * 7.5) * S * 0.07 * (1 - t * 0.3);
    const w = S * (0.016 + Math.sin(Math.min(t * 2.2, 1) * Math.PI * 0.6) * 0.016);
    ell(put, px, py, w, w, (tx, ty) => {
      const band = ((t * 22) | 0) % 2 === 0;
      let b = band ? mix('#2a3a44', '#101a20', ty) : mix('#c8d0d4', '#7a8a90', ty);
      return b;
    });
  }
  // paddle tail
  fin(put, cx + S * 0.2, S * 0.52, cx + S * 0.28, S * 0.47, cx + S * 0.27, S * 0.58, '#2a3a44', '#101a20');
  // head raised to strike
  ell(put, cx - S * 0.23, S * 0.5, S * 0.032, S * 0.026, (tx, ty) => mix('#2a3a44', '#101a20', tx + ty * 0.3));
  optic(put, cx - S * 0.245, S * 0.49, S * 0.007, A.oil, '#d8e84a', '#f8ffb0');
  stroke(put, cx - S * 0.26, S * 0.515, cx - S * 0.29, S * 0.525, 0.9, () => A.redLt); // tongue
  // venom drip
  put(Math.round(cx - S * 0.255), Math.round(S * 0.55), '#aef65a');
  put(Math.round(cx - S * 0.255), Math.round(S * 0.58), '#aef65a');
}
// 17 · LANTERN SNAIL — healer/buffer, glowing shell
function drawSnail(put, S) {
  const cx = S * 0.5; shadow(put, S, cx, S * 0.22);
  // body/foot
  for (let t = 0; t < 1; t += 0.06) {
    const px = cx - S * 0.14 + t * S * 0.28, py = S * 0.66;
    ell(put, px, py, S * 0.035, S * 0.025, (tx, ty) => mix(A.glowDk, '#1a4a3a', ty));
  }
  // eye stalks
  [[-0.16, -0.01], [-0.13, 0.015]].forEach(([dx, dy]) => {
    stroke(put, cx + dx * S, S * 0.64, cx + (dx - 0.03) * S, S * (0.56 + dy), 1.2, () => A.glowDk);
    glowDot(put, cx + (dx - 0.035) * S, S * (0.55 + dy), S * 0.006, A.glow, A.glowLt);
  });
  // spiral shell — LANTERN
  for (let a = 0; a < 12; a += 0.06) {
    const r = S * 0.015 + a * S * 0.0085;
    const x = cx + S * 0.04 + Math.cos(a + 2) * r, y = S * 0.52 + Math.sin(a + 2) * r * 0.85;
    put(Math.round(x), Math.round(y), (a * 2 | 0) % 2 ? A.glowLt : A.glow);
  }
  ell(put, cx + S * 0.04, S * 0.52, S * 0.045, S * 0.04, (tx, ty) => mix(A.glow, A.glowDk, clamp(tx + ty * 0.4, 0, 1)));
  glowDot(put, cx + S * 0.04, S * 0.5, S * 0.014, A.glowLt, A.white);
  // heal motes rising
  [[0.1, 0.4], [0, 0.36], [0.08, 0.3]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.glowLt));
}
// 18 · SIREN MERMAID — song charm, drags you off course
function drawMermaid(put, S) {
  const cx = S * 0.5;
  // rock perch
  ell(put, cx + S * 0.06, S * 0.74, S * 0.14, S * 0.08, (tx, ty) => mix(A.rockLt, A.rockDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // scaled tail curling off the rock
  for (let t = 0; t < 1; t += 0.04) {
    const px = cx + S * (0.02 + t * 0.2), py = S * (0.62 + Math.sin(t * 2.6) * 0.06 + t * 0.04);
    const w = S * (0.05 - t * 0.032);
    ell(put, px, py, w, w * 0.8, (tx, ty) => {
      let b = mix('#3a8a8a', '#164a4e', clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (((t * 16) | 0) % 2) b = mix(b, '#6ac8c0', 0.3); // scale bands
      return b;
    });
  }
  fin(put, cx + S * 0.23, S * 0.68, cx + S * 0.32, S * 0.62, cx + S * 0.3, S * 0.76, '#6ac8c0', '#164a4e'); // fluke
  // torso — pale, leaning into the song
  for (let y = S * 0.44; y < S * 0.62; y++) {
    const t = (y - S * 0.44) / (S * 0.18), w = S * (0.045 + t * 0.015);
    row(put, Math.round(y), cx - S * 0.02 - w, cx - S * 0.02 + w, (tx) => mix(A.fleshLt, A.flesh, clamp(tx * 1.1 + t * 0.2, 0, 1)));
  }
  // shell top
  [[-0.05], [0.005]].forEach(([dx]) => ell(put, cx + dx * S, S * 0.5, S * 0.018, S * 0.014, (tx, ty) => mix('#c87a8a', '#7a3a4a', tx + ty)));
  // arms — one beckoning
  stroke(put, cx - S * 0.05, S * 0.48, cx - S * 0.14, S * 0.4, S * 0.015, () => A.fleshLt);
  stroke(put, cx + S * 0.01, S * 0.48, cx + S * 0.05, S * 0.58, S * 0.014, () => A.fleshLt);
  // head + long flowing hair
  ell(put, cx - S * 0.03, S * 0.4, S * 0.042, S * 0.045, (tx, ty) => mix(A.fleshLt, A.flesh, clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx - S * 0.045, S * 0.39, S * 0.008, A.oil, A.bio, A.bioLt);
  // singing mouth (open O)
  ell(put, cx - S * 0.035, S * 0.425, S * 0.008, S * 0.01, () => A.ink);
  for (let t = 0; t < 1; t += 0.06) { // hair streaming
    const hx = cx + S * (0.0 + t * 0.1), hy = S * (0.36 + t * 0.22 + Math.sin(t * 6) * 0.015);
    stroke(put, hx, hy, hx + S * 0.03, hy + S * 0.02, S * 0.014, () => (t * 10 | 0) % 2 ? '#6a2a4a' : '#4a1a34');
  }
  // song notes drifting w/ charm sparkle
  [[-0.16, 0.32], [-0.22, 0.26], [-0.12, 0.24]].forEach(([dx, dy], i) => {
    put(Math.round(cx + dx * S), Math.round(S * dy), A.bioLt);
    stroke(put, cx + dx * S + 1, S * dy, cx + dx * S + 1, S * dy - 4, 0.9, () => A.bioLt);
    if (i === 1) put(Math.round(cx + dx * S + 3), Math.round(S * dy - 5), A.white);
  });
}
// 19 · KRAKEN SPAWN — elite tentacle horror
function drawKraken(put, S) {
  const cx = S * 0.5;
  // mantle
  dome(put, cx, S * 0.34, S * 0.12, S * 0.16, '#7a3a5a', '#aa5a80', '#3a1428');
  // furious eyes
  optic(put, cx - S * 0.05, S * 0.4, S * 0.016, A.oil, A.red, A.redLt);
  optic(put, cx + S * 0.05, S * 0.4, S * 0.016, A.oil, A.red, A.redLt);
  // 6 tentacles thrashing
  tentacle(put, cx - S * 0.08, S * 0.48, cx - S * 0.32, S * 0.62, S * 0.03, '#7a3a5a', '#3a1428', 5);
  tentacle(put, cx - S * 0.05, S * 0.5, cx - S * 0.18, S * 0.8, S * 0.03, '#7a3a5a', '#3a1428', 6);
  tentacle(put, cx, S * 0.51, cx + S * 0.04, S * 0.84, S * 0.032, '#8a4666', '#3a1428', 4);
  tentacle(put, cx + S * 0.05, S * 0.5, cx + S * 0.2, S * 0.78, S * 0.03, '#7a3a5a', '#3a1428', 6);
  tentacle(put, cx + S * 0.08, S * 0.48, cx + S * 0.33, S * 0.6, S * 0.03, '#8a4666', '#3a1428', 5);
  tentacle(put, cx + S * 0.1, S * 0.44, cx + S * 0.3, S * 0.36, S * 0.026, '#7a3a5a', '#3a1428', 7);
  // suckers
  [[-0.2, 0.6], [-0.12, 0.7], [0.12, 0.68], [0.24, 0.64]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), A.pinkLt));
}
// 20 · TRENCH WRAITH — drowned ghost, pulls you deeper
function drawWraith(put, S) {
  const cx = S * 0.5;
  // rising wisp column
  for (let y = S * 0.8; y > S * 0.52; y--) {
    const t = (S * 0.8 - y) / (S * 0.28), w = S * (0.02 + t * 0.075);
    row(put, Math.round(y), cx - w + Math.sin(y * 0.2) * 2, cx + w + Math.sin(y * 0.2) * 2, (tx) => mix(A.deepLt, A.bio, clamp(t * 0.6 + tx * 0.1, 0, 0.8)));
  }
  // torso + hood
  for (let y = S * 0.52; y > S * 0.36; y--) {
    const w = S * 0.08;
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(A.bio, A.deepLt, clamp(tx * 1.2, 0, 1)));
  }
  ell(put, cx, S * 0.34, S * 0.055, S * 0.06, (tx, ty) => mix(A.bioLt, A.bio, clamp(tx + ty * 0.4, 0, 1)));
  // hollow eyes + wail mouth
  ell(put, cx - S * 0.02, S * 0.33, S * 0.011, S * 0.014, () => A.deepDk);
  ell(put, cx + S * 0.02, S * 0.33, S * 0.011, S * 0.014, () => A.deepDk);
  ell(put, cx, S * 0.375, S * 0.012, S * 0.018, () => A.deepDk);
  // grasping arms reaching down-out
  tentacle(put, cx - S * 0.07, S * 0.44, cx - S * 0.24, S * 0.56, S * 0.02, A.bio, A.deepLt, 4);
  tentacle(put, cx + S * 0.07, S * 0.44, cx + S * 0.24, S * 0.56, S * 0.02, A.bio, A.deepLt, 4);
  // pull-current lines
  [[-0.3, 0.62], [0.3, 0.62]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + dx * S * 0.6, S * (dy + 0.06), 1, () => A.deepLt));
}

const LIST = [
  { n: 1, name: 'ANGLERFISH', role: 'lure ambusher', draw: drawAngler },
  { n: 2, name: 'GIANT ISOPOD', role: 'rolling armor tank', draw: drawIsopod },
  { n: 3, name: 'MORAY EEL', role: 'hole striker', draw: drawMoray },
  { n: 4, name: 'GHOST JELLY', role: 'drifting stinger', draw: drawJelly },
  { n: 5, name: 'SWORDFISH', role: 'lance-charge lanes', draw: drawSword },
  { n: 6, name: 'HAMMERHEAD', role: 'circling shark', draw: drawHammer },
  { n: 7, name: 'VOLT EEL', role: 'shock rings', draw: drawVolt },
  { n: 8, name: 'VAMPIRE SQUID', role: 'ink-cloud zoner', draw: drawVampSquid },
  { n: 9, name: 'GULPER', role: 'elite swallow lunge', draw: drawGulper },
  { n: 10, name: 'MINE URCHIN', role: 'static spike hazard', draw: drawUrchin },
  { n: 11, name: 'CRIMSON STARFISH', role: 'leaps + latches', draw: drawStarfish },
  { n: 12, name: 'DROWNED DIVER', role: 'brass suit + harpoon', draw: drawDiver },
  { n: 13, name: 'GHOST FISHERMAN', role: 'hooked lure + gaff', draw: drawFisherman },
  { n: 14, name: 'MANTIS SHRIMP', role: 'punch burster', draw: drawMantis },
  { n: 15, name: 'TRENCH LOBSTER', role: 'snip charge, big claws', draw: drawLobster },
  { n: 16, name: 'BANDED SEA SNAKE', role: 'venom S-strike', draw: drawSeaSnake },
  { n: 17, name: 'LANTERN SNAIL', role: 'healer glow — priority', draw: drawSnail },
  { n: 18, name: 'SIREN MERMAID', role: 'song charm, beckons', draw: drawMermaid },
  { n: 19, name: 'KRAKEN SPAWN', role: 'elite tentacle horror', draw: drawKraken },
  { n: 20, name: 'TRENCH WRAITH', role: 'drowned ghost, pulls', draw: drawWraith },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_mob_options.png', title: 'THE ABYSS — MOB CANDIDATES (pick your roster, any count)', S: 160 });
}
module.exports = { LIST };
