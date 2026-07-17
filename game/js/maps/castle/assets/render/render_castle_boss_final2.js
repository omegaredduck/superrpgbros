// artdev/castle/render_castle_boss_final2.js — THE PALE RIDER final, Red's
// pick: variation #10 KING OF THE LISTS (crowned, chanfron, velvet caparison,
// gold trim, shield). Solid horse. 2x scale approval render — THE CANON ART.
'use strict';
const KIT = require('./gothic_kit.js');
const { renderSheet } = KIT;
const { paleRider, V } = require('./render_pale_riders.js');

const pick = V.find(v => v.n === 10);
renderSheet({
  list: [{ n: 10, name: 'THE PALE RIDER', role: 'KING OF THE LISTS — final', draw: (put, S) => paleRider(put, S, pick.o) }],
  out: process.argv[2] || 'castle_boss_final.png',
  title: 'VAMPIRE CASTLE BOSS FINAL — THE PALE RIDER, KING OF THE LISTS',
  S: 160, cols: 1, scale: 2
}).catch(e => { console.error(e); process.exit(1); });
