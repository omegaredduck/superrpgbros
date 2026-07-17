// artdev/belly/render_belly_boss_final.js — TITAN WHALE boss FINAL:
// look #4 ORCA DRESS (Red's pick) on the head-on maw pose (#2).
// Black hide, white eye patches + chin, TEETH not baleen.
'use strict';
const KIT = require('./belly_kit.js');
const { renderSheet } = KIT;
const { whaleGod } = require('./render_belly_boss.js');

// FINAL params (canon)
const O = {
  hide: '#22262e', hideLt: '#3a4048', hideDk: '#0a0c12',
  belly: '#f4f4f4', bellyDk: '#b8c2d0',
  teeth: 1, orcaPatch: 1, barnacles: 0,
  eye: '#d84a4a', eyeLt: '#ff9a8a',
  maw: '#3a1218',
  seed: 13
};

function drawFinal(put, S) { whaleGod(put, S, O); }

if (require.main === module) {
  renderSheet({
    list: [{ n: 4, name: 'THE TITAN WHALE', role: 'ORCA DRESS — final for sign-off', draw: drawFinal }],
    out: process.argv[2] || 'belly_boss_final.png',
    title: 'TITAN WHALE — FINAL (look 4 ORCA DRESS, head-on maw)',
    S: 220, cols: 1, scale: 3
  });
}
module.exports = { O, drawFinal };
