// artdev/crystal/crystal_kit.js — shared palette + helpers for the CRYSTAL
// CAVERNS option sheets (sparkle-adventure mood: bright gems on dark cave).
'use strict';
const path = require('path');
const FK = require(path.join(__dirname, '..', 'factory_kit.js'));
const { R, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet } = FK;

const K = {
  OUT: '#0e0a14',
  // cave rock
  rock: '#4a4258', rockLt: '#6e6484', rockDk: '#302a3e', rockDkk: '#1c1826',
  // gem colors (the sparkle set)
  pink: '#ff7ab8', pinkLt: '#ffd0e8', pinkDk: '#b03a78',
  cyan: '#5ae8e0', cyanLt: '#ccfffa', cyanDk: '#1f9e98',
  purple: '#a06bf0', purpleLt: '#d8bcff', purpleDk: '#5c34a0',
  amber: '#ffb84a', amberLt: '#ffe8b0', amberDk: '#b0701e',
  green: '#6ae87a', greenLt: '#ccffd0', greenDk: '#2a9e42',
  // deep/void gem
  void: '#38286e', voidLt: '#5c48a0', voidDk: '#201548',
  white: '#f4f4f4', oil: '#0a0810',
  gold: '#ffcd45', goldDk: '#b07d1e'
};
const GEMS = [[K.pink, K.pinkLt, K.pinkDk], [K.cyan, K.cyanLt, K.cyanDk], [K.purple, K.purpleLt, K.purpleDk], [K.amber, K.amberLt, K.amberDk], [K.green, K.greenLt, K.greenDk]];

// faceted crystal shard: pointed column w/ facet shading
function shard(put, cx, baseY, w, h, lean, cols) {
  const [c, lt, dk] = cols;
  for (let y = 0; y < h; y++) {
    const t = y / h, ww = w * (1 - t * 0.88);
    const off = lean * t * w * 2;
    row(put, Math.round(baseY - y), cx - ww + off, cx + ww + off, (tx) => {
      let b = mix(lt, c, clamp(t * 0.8 + tx * 0.3, 0, 1));
      if (tx < 0.32) b = mix(b, '#ffffff', 0.4);
      if (tx > 0.72) b = mix(b, dk, 0.6);
      return b;
    });
  }
  put(Math.round(cx + lean * w * 2), Math.round(baseY - h), '#ffffff');
}
// sparkle cross
function sparkle(put, x, y, c) { put(x, y, '#ffffff'); put(x + 2, y, c); put(x - 2, y, c); put(x, y + 2, c); put(x, y - 2, c); }
// gem-cluster base rock
function rockBase(put, cx, cy, rx, ry) {
  ell(put, cx, cy, rx, ry, (tx, ty) => mix(K.rockLt, K.rockDk, clamp(ty * 1.3, 0, 1)));
}

module.exports = { R, K, GEMS, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, shadow, renderSheet, shard, sparkle, rockBase };
