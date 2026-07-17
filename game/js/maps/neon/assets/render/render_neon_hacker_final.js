// artdev/neon/render_neon_hacker_final.js — SOCIAL ENGINEER final:
// #6 FIREWALL — orange spikes, tech vest, amber goggles, cyberdeck.
'use strict';
const KIT = require('./neon_kit.js');
const { N, renderSheet } = KIT;
const { hacker } = require('./render_neon_hacker.js');

const P = { hairStyle: 'spike', hairC: '#e84a20', vest: true, eyes: 'goggles', eyeC: N.amber, device: 'deck', acc: N.amber, accLt: N.amberLt, jak: '#2e3a2a', jakLt: '#4e5e48', jakDk: '#1a2418', seed: 6 };

const LIST = [
  { n: 1, name: 'SOCIAL ENGINEER', role: 'techno kid hacker — final', draw: (p, S) => hacker(p, S, P) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_hacker_final.png', title: 'SOCIAL ENGINEER — FINAL (6 firewall)', S: 160, cols: 1, scale: 3 });
}
module.exports = { P };
