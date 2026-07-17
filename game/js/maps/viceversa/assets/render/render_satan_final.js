// artdev/underworld/render_satan_final.js — SATAN final:
// #10 KING IN FLAME — fire cape + crown, wings, GOLD trident.
'use strict';
const KIT = require('./underworld_kit.js');
const { renderSheet } = KIT;
const { satan } = require('./render_satan.js');

const P = { cape: true, fireCrown: true, wings: true, weapon: 'trident', goldWpn: true, horns: 'crown', legs: 'goat', seed: 10 };

const LIST = [
  { n: 1, name: 'SATAN', role: 'KING IN FLAME — final', draw: (p, S) => satan(p, S, P) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'satan_final.png', title: 'SATAN — FINAL (10 king in flame)', S: 160, cols: 1, scale: 3 });
}
module.exports = { P };
