// artdev/carnival/render_carnival_boss_final.js — THE RINGMASTER final canon:
// Red's pick = #1 THE CLASSIC — red tailcoat, gold trim, top hat, waxed
// mustache, cracking whip, spotlight underfoot. Rendered big.
'use strict';
const { ringmaster } = require('./render_carnival_boss.js');
const KIT = require('./carnival_kit.js');
const { C, renderSheet } = KIT;

const FINAL = { coat: [C.red, C.redLt, C.redDkk], trim: C.glow, face: 'show', hat: 'top', weapon: 'whip', eyes: C.glow };

renderSheet({
  list: [{
    n: 1, name: 'THE RINGMASTER', role: 'THE CLASSIC — red coat + whip',
    draw: (put, S) => ringmaster(put, S, FINAL)
  }],
  out: process.argv[2] || 'carnival_boss_final.png',
  title: 'THE RINGMASTER — FINAL',
  S: 160, cols: 1, scale: 3
});
