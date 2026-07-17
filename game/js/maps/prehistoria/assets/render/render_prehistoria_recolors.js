// artdev/prehistoria/render_prehistoria_recolors.js — recolor variants
// (Red: at least one recolor per picked mob for variety — EXCEPT the
// pterodactyl). Preview via hue-shift; build session does proper
// palette swaps on the same draws.
'use strict';
const KIT = require('./prehistoria_kit.js');
const { renderSheet } = KIT;
const MOBS = require('./render_prehistoria_mobs2.js').LIST;

function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = ((t % 1) + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
function shifted(deg, satM, litA) {
  const cache = {};
  return c => {
    if (cache[c]) return cache[c];
    const [r, g, b] = hex2rgb(c);
    let [h, s, l] = rgb2hsl(r, g, b);
    let out;
    if (s < 0.13) out = c; // keep shadows/bone/greys grounded
    else { h += deg / 360; s = Math.max(0, Math.min(1, s * satM)); l = Math.max(0, Math.min(1, l + litA)); const [r2, g2, b2] = hsl2rgb(h, s, l); out = rgb2hex(r2, g2, b2); }
    cache[c] = out; return out;
  };
}
const byN = n => MOBS.find(e => e.n === n).draw;
function recolored(n, deg, satM, litA) {
  const draw = byN(n), sh = shifted(deg, satM, litA);
  return (put, S) => draw((x, y, c) => put(x, y, sh(c)), S);
}

const LIST = [
  { n: 1, name: 'JUNGLE RAPTOR', role: 'raptor recolor (orange -> green)', draw: recolored(1, 85, 0.95, -0.02) },
  { n: 2, name: 'RUST COMPIES', role: 'compy recolor (green -> rust)', draw: recolored(2, -85, 1.05, 0) },
  { n: 3, name: 'MOSS TRICERATOPS', role: 'trike recolor (blue -> olive)', draw: recolored(3, -140, 0.9, 0.01) },
  { n: 4, name: 'EMBER STEGO', role: 'stego recolor (green -> ember)', draw: recolored(4, -95, 1.05, 0) },
  { n: 6, name: 'MIDNIGHT DILO', role: 'dilo recolor (green -> indigo)', draw: recolored(6, 130, 0.8, -0.05) },
  { n: 20, name: 'STORM BRACHIO', role: 'brachio recolor (sage -> slate)', draw: recolored(20, 130, 0.85, -0.02) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'prehistoria_recolors.png', title: 'PREHISTORIA — RECOLOR VARIANTS (one per mob; pterodactyl exempt)', S: 160, cols: 3, scale: 2 });
}
module.exports = { LIST };
