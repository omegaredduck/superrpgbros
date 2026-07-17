// artdev/underworld/render_supreme_final.js — SUPREME BEING final:
// zeus-sheet #10 JUDGE OLYMPUS w/ Red's fixes: scales hang from the
// end of his outstretched fist + the SUN CROWN from #5 (no gold band).
'use strict';
const KIT = require('./underworld_kit.js');
const { renderSheet } = KIT;
const { zeusGod } = require('./render_supreme_zeus.js');

const P = { beard: 'white', held: 'scales', robe: 'gold', haloS: 'sun', seed: 10 };

const LIST = [
  { n: 1, name: 'SUPREME BEING', role: 'judge olympus — final', draw: (p, S) => zeusGod(p, S, P) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'supreme_final.png', title: 'SUPREME BEING — FINAL (10 + hand scales + sun crown)', S: 160, cols: 1, scale: 3 });
}
module.exports = { P };
