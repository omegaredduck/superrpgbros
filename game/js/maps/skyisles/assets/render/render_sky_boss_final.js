// artdev/skyisles/render_sky_boss_final.js — NIMBUS TALON (Red's pick, boss
// sheet #8) with the lightning MADE PRONOUNCED per Red's note: a living storm
// cloud with a blazing lightning skeleton, arcing wings, bolt-clutching talons.
//   RANGER_PATH=<ranger_art.js> node render_sky_boss_final.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, ell, row, stroke, renderSheet, cloudBlob, zig, optic } = KIT;

// heavier zigzag: dark halo -> thick volt -> white-hot core
function boltZig(put, x0, y0, x1, y1, w) {
  const dx = x1 - x0, dy = y1 - y0;
  const ax = x0 + dx * 0.36 + dy * 0.16, ay = y0 + dy * 0.36 - dx * 0.16;
  const bx = x0 + dx * 0.68 - dy * 0.16, by = y0 + dy * 0.68 + dx * 0.16;
  const segs = [[x0, y0, ax, ay], [ax, ay, bx, by], [bx, by, x1, y1]];
  segs.forEach(([p, q, s, t]) => stroke(put, p, q, s, t, w * 1.9, () => K.voltDk));
  segs.forEach(([p, q, s, t]) => stroke(put, p, q, s, t, w, () => K.volt));
  segs.forEach(([p, q, s, t]) => stroke(put, p, q, s, t, Math.max(1, w * 0.45), () => K.voltCore));
}

function drawNimbusTalonFinal(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // plain ground shadow (no lightning off the bird — Red)
  ell(put, cx, S * 0.93, S * 0.26, S * 0.04, () => K.oil);

  // wings = rolling cloud banks
  cloudBlob(put, cx - S * 0.25, cy - S * 0.06, S * 0.18, K.cloudMd, K.cloudLt, K.thunderDk);
  cloudBlob(put, cx + S * 0.25, cy - S * 0.06, S * 0.18, K.cloudMd, K.cloudLt, K.thunderDk);
  // body cloud
  cloudBlob(put, cx, cy + S * 0.02, S * 0.21, K.thunder, K.cloud, K.thunderDkk);

  // ---- THE LIGHTNING SKELETON (pronounced) ----
  // spine bolt down the body core
  boltZig(put, cx, cy - S * 0.16, cx, cy + S * 0.14, S * 0.02);
  // rib bolts branching across the chest
  boltZig(put, cx - S * 0.01, cy - S * 0.04, cx - S * 0.13, cy + S * 0.04, S * 0.013);
  boltZig(put, cx + S * 0.01, cy - S * 0.02, cx + S * 0.13, cy + S * 0.07, S * 0.013);
  // wing-bone bolts blazing through each cloud bank
  boltZig(put, cx - S * 0.08, cy - S * 0.1, cx - S * 0.4, cy - S * 0.1, S * 0.018);
  boltZig(put, cx + S * 0.08, cy - S * 0.1, cx + S * 0.4, cy - S * 0.1, S * 0.018);
  // rain sheets under the belly
  for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.05, cy + S * 0.18, cx + i * S * 0.05 - S * 0.015, cy + S * 0.27, 1, () => K.sky);

  // head cloud w/ hooked wisp beak
  cloudBlob(put, cx, cy - S * 0.21, S * 0.115, K.cloudMd, K.cloudLt, K.thunderDk);
  stroke(put, cx, cy - S * 0.15, cx + S * 0.02, cy - S * 0.06, S * 0.04, (t) => mix(K.cloudLt, K.cloudDk, t));
  // burning volt eyes
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.05, cy - S * 0.23, S * 0.034, K.voltDk, K.volt, K.voltLt));

  // SOLID gold talons, each clutching a live bolt
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy + S * 0.16, cx + s * S * 0.1, cy + S * 0.31, S * 0.032, () => K.goldDk);
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.1, cy + S * 0.31, cx + s * S * 0.1 + k * S * 0.038, cy + S * 0.38, 3, () => K.gold));
    boltZig(put, cx + s * S * 0.05, cy + S * 0.355, cx + s * S * 0.16, cy + S * 0.345, S * 0.012);
  });

  // sparks riding the cloud surface
  [[-0.3, -0.18], [0.32, -0.16], [-0.16, 0.14], [0.18, 0.12]].forEach(([ox, oy]) => {
    const px = Math.round(cx + ox * S), py = Math.round(cy + oy * S);
    put(px, py, K.voltCore); put(px + 2, py, K.voltLt); put(px - 2, py, K.voltLt);
    put(px, py + 2, K.voltLt); put(px, py - 2, K.voltLt);
  });
}

renderSheet({
  list: [{ n: 8, name: 'NIMBUS TALON', role: 'living storm — lightning pronounced', draw: drawNimbusTalonFinal }],
  out: process.argv[2] || 'sky_boss_final.png',
  title: 'STORM SKY ISLES BOSS — NIMBUS TALON (rework: pronounced lightning)',
  S: 160, cols: 1, scale: 2
}).catch(e => { console.error(e); process.exit(1); });
