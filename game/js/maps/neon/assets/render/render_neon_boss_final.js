// artdev/neon/render_neon_boss_final.js — KINGPIN.EXE final:
// #1 WARLORD — Apache-style tandem gunship, army drab, neon underglow,
// the Kingpin's fedora + cigar in the raised rear seat.
'use strict';
const SHAPE = require('./render_neon_heli_shape.js');
const KIT = require('./neon_kit.js');
const { renderSheet } = KIT;

const LIST = [
  { n: 1, name: 'KINGPIN.EXE', role: 'WARLORD apache — final', draw: (p, S) => SHAPE.heli160(p, S, {}) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_boss_final.png', title: 'KINGPIN.EXE — FINAL (warlord apache)', S: 160, cols: 1, scale: 2 });
}
module.exports = {};
