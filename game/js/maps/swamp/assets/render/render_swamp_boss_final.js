// artdev/swamp/render_swamp_boss_final.js — THE SWAMP WITCH final canon:
// Red's pick = #4 THE BREWMISTRESS — brew-stained robes, crooked point hat,
// iron ladle staff, toad familiar, casting spark. Rendered big.
'use strict';
const { swampWitch } = require('./render_swamp_boss.js');
const KIT = require('./swamp_kit.js');
const { S, renderSheet } = KIT;

const FINAL = {
  skin: [S.bogLt, S.bogDk],
  robe: [S.brewDk, S.brew, S.bogDkk],
  hat: 'point', staff: 'ladle', familiar: 'toad'
};

renderSheet({
  list: [{
    n: 4, name: 'THE BREWMISTRESS', role: 'ladle + brew-stained robes',
    draw: (put, Sz) => swampWitch(put, Sz, FINAL)
  }],
  out: process.argv[2] || 'swamp_boss_final.png',
  title: 'THE SWAMP WITCH — FINAL',
  S: 160, cols: 1, scale: 3
});
