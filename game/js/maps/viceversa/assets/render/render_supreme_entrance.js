// artdev/underworld/render_supreme_entrance.js — entrance mock:
// THE WATCHER (eye sheet #1) carries the SUPREME BEING in on shafts
// of light (Red: "i want him carried in by the 1 in the eye options").
'use strict';
const KIT = require('./underworld_kit.js');
const { H, mix, stroke, ell, renderSheet } = KIT;
const { eyeGod } = require('./render_supreme_eye.js');
const { zeusGod } = require('./render_supreme_zeus.js');
const { P } = require('./render_supreme_final.js');

function drawEntrance(put, S) {
  // THE WATCHER up top (drawn in a 115px sub-space, centered)
  const eS = 115, eOX = Math.round((S - eS) / 2), eOY = -6;
  eyeGod((x, y, c) => put(x + eOX, y + eOY, c), eS, { wings: 2, rayAura: true, seed: 1 });
  // shafts of light from the eye down to him
  const holy = '#fff2c0';
  [[-14, -8], [14, 8]].forEach(([o1, o2]) => {
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x0 = S / 2 + o1 * (1 - t) + o2 * t, y0 = S * 0.3 + t * S * 0.28;
      put(Math.round(x0), Math.round(y0), mix(holy, H.night, 0.35 + t * 0.25));
      put(Math.round(x0 + 1), Math.round(y0), mix(holy, H.night, 0.6 + t * 0.2));
    }
  });
  // THE SUPREME BEING below, borne in the light
  const zS = 115, zOX = Math.round((S - zS) / 2), zOY = Math.round(S * 0.34);
  zeusGod((x, y, c) => put(x + zOX, y + zOY, c), zS, P);
}

const LIST = [
  { n: 1, name: 'THE ARRIVAL', role: 'the watcher carries him in', draw: drawEntrance },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'supreme_entrance.png', title: 'SUPREME BEING ENTRANCE — carried by THE WATCHER', S: 200, cols: 1, scale: 2 });
}
module.exports = {};
