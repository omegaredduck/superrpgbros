// artdev/sugar/render_sugar_boss_final.js — SUGAR BEAR final:
// #9 COTTON CANDY BEAR — pink fluff, pastel candy armor, unarmed
// (his paws are the weapons). Title card: SUGAR BEAR.
'use strict';
const SHAPE = require('./render_sugar_bear_shape.js');
const BOSS = require('./render_sugar_boss.js');
const KIT = require('./sugar_kit.js');
const { renderSheet } = KIT;

// Red's final tweaks: BOTH ears peppermint, peppermint cane in arms,
// NO striped foot pad (pink beans both feet).
const FINAL = Object.assign({}, BOSS.V.cotton, {
  weapon: 'cane',
  bothEarsPeppermint: true,
  noFootStripe: true,
  rainbowGem: true, // rainbow chest gem (Red)
  eyes: 'redglow',  // glowing red eyes (Red)
  // multi-color gumballs + beans (Red)
  studs: [KIT.G.red, KIT.G.orange, KIT.G.yellow, KIT.G.lime, KIT.G.blue, KIT.G.grape, KIT.G.pink],
  beans: [KIT.G.lime, KIT.G.blue, KIT.G.orange],
});

const LIST = [
  { n: 9, name: 'SUGAR BEAR', role: 'cotton candy — final', draw: (p, S) => SHAPE.bear160(p, S, FINAL) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_boss_final.png', title: 'SUGAR BEAR — FINAL (cotton candy)', S: 160, cols: 1, scale: 2 });
}
module.exports = {};
