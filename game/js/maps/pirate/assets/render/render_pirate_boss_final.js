// artdev/pirate/render_pirate_boss_final.js — THE DREAD CAPTAIN final:
// Red's combo = #6 KRAKENBOUND tentacle arm + #1's face & skull-badge tricorn
// + #3's wide epauletted shoulders + a little parrot ON the shoulder.
// 2x scale approval render — THE CANON ART.
'use strict';
const KIT = require('./pirate_kit.js');
const { P, mix, ell, row, stroke, plate, dome, bolt, renderSheet } = KIT;
const { captain } = require('./render_pirate_tiles_boss.js');

function drawDreadCaptainFinal(put, S) {
  captain(put, S, {
    hat: 'tricorn', skullBadge: true, plume: true, plumeC: P.red,
    beard: '#3a2c22', patch: true, scar: true,
    epaulettes: true,
    tentacleArm: true,
    cutlass: true,
    parrot: false // we draw a bigger, better parrot below
  });
  const cx = S * 0.5, cy = S * 0.5;
  // BIG unmistakable eye patch + strap (over the base face)
  ell(put, cx - S * 0.028, cy - S * 0.175, S * 0.022, S * 0.024, () => P.oil);
  stroke(put, cx - S * 0.065, cy - S * 0.195, cx + S * 0.062, cy - S * 0.185, 1, () => P.oil);
  put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.168), '#2a2d38'); // leather shine
  // the parrot ON the epaulette (left shoulder), proud and bright
  const px = cx - S * 0.135, py = cy - S * 0.155;
  ell(put, px, py + S * 0.02, S * 0.032, S * 0.045, (tx, ty) => mix(P.red, P.redDk, ty * 1.2));
  stroke(put, px + S * 0.012, py + S * 0.05, px + S * 0.035, py + S * 0.1, S * 0.016, (t) => mix('#2a8ec2', '#16324a', t)); // tail
  ell(put, px + S * 0.008, py + S * 0.008, S * 0.016, S * 0.028, (tx, ty) => mix('#e8b23a', P.redDk, ty)); // wing
  dome(put, px - S * 0.005, py - S * 0.028, S * 0.02, S * 0.019, P.red, P.redLt, P.redDk); // head
  ell(put, px - S * 0.016, py - S * 0.028, S * 0.009, S * 0.012, () => '#ffffff'); // cheek
  put(Math.round(px - S * 0.014), Math.round(py - S * 0.032), P.oil); // eye
  stroke(put, px - S * 0.026, py - S * 0.024, px - S * 0.042, py - S * 0.016, S * 0.011, () => P.gold); // beak
  [-1, 1].forEach(s => stroke(put, px + s * S * 0.006, py + S * 0.045, px + s * S * 0.01, py + S * 0.058, 1, () => P.brassDk)); // feet gripping
  // squawk mark
  stroke(put, px - S * 0.05, py - S * 0.06, px - S * 0.065, py - S * 0.075, 1, () => P.sail);
}

renderSheet({
  list: [{ n: 6, name: 'THE DREAD CAPTAIN', role: 'kraken arm · classic face · wide shoulders · parrot', draw: drawDreadCaptainFinal }],
  out: process.argv[2] || 'pirate_boss_final.png',
  title: 'PIRATE SHIP BOSS FINAL — THE DREAD CAPTAIN (summons the GHOST SHIP)',
  S: 160, cols: 1, scale: 2
}).catch(e => { console.error(e); process.exit(1); });
