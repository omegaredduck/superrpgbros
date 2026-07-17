// artdev/crystal/render_crystal_boss_final.js — THE SHARDLORD final canon:
// Red's pick = #4 GEODE COLOSSUS, RAINBOW EDITION — a HUGE rock hulk whose
// every geode is a different gem color, with a color-shifting RAINBOW CORE
// exposed in his chest (in-game the core cycles hues). Giant proportions.
'use strict';
const { shardKnight } = require('./render_crystal_boss.js');
const KIT = require('./crystal_kit.js');
const { GEMS, K, renderSheet, sparkle, shard, row } = KIT;

const FINAL = {
  gem: GEMS[0],
  armor: [K.rock, K.rockLt, K.rockDkk],
  bulky: true, giant: true,
  helm: 'horn', weapon: 'fists',
  core: true, rainbowCore: true, multi: true,
  glowEyes: '#ff3b30' // RED eyes (Red's call)
};

renderSheet({
  list: [{
    n: 4, name: 'THE SHARDLORD', role: 'GEODE COLOSSUS — rainbow core',
    draw: (put, S) => {
      shardKnight(put, S, FINAL);
      // + the crown from work-up #5 (gold band + gem points), between the horns
      const cx = S * 0.46, headY = S * 0.26;
      row(put, Math.round(headY - S * 0.05), cx - S * 0.042, cx + S * 0.042, () => K.gold);
      row(put, Math.round(headY - S * 0.042), cx - S * 0.045, cx + S * 0.045, () => K.goldDk);
      [[-0.032, 0], [0, 2], [0.032, 4]].forEach(([dx, g]) => shard(put, cx + dx * S, headY - S * 0.05, S * 0.01, S * 0.05, 0, GEMS[g]));
      // extra ambient rainbow motes around the colossus
      sparkle(put, S * 0.14, S * 0.24, GEMS[0][1]);
      sparkle(put, S * 0.84, S * 0.34, GEMS[1][1]);
      sparkle(put, S * 0.12, S * 0.62, GEMS[3][1]);
      sparkle(put, S * 0.86, S * 0.7, GEMS[2][1]);
    }
  }],
  out: process.argv[2] || 'crystal_boss_final.png',
  title: 'THE SHARDLORD — FINAL',
  S: 160, cols: 1, scale: 3
});
