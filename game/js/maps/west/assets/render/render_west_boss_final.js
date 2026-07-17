// artdev/west/render_west_boss_final.js — THE OUTLAW SHERIFF final:
// #2 NIGHT RIDER combo — all black, red glare, twin guns + WHITE HAT.
'use strict';
const BOSS = require('./render_west_boss.js');
const KIT = require('./west_kit.js');
const { W, renderSheet } = KIT;

const FINAL = Object.assign({}, BOSS.V.night, {
  hatCols: ['#d8d0bc', '#fff8e8', '#a89e88'], // the white hat
});

const LIST = [
  { n: 2, name: 'THE OUTLAW SHERIFF', role: 'night rider + white hat', draw: (p, S) => BOSS.sheriff(p, S, FINAL) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'west_boss_final.png', title: 'THE OUTLAW SHERIFF — FINAL (night rider, white hat)', S: 160, cols: 1, scale: 2 });
}
module.exports = { FINAL };
