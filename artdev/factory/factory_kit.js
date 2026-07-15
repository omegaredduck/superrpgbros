// artdev/factory_kit.js — shared palette + metal-drawing helpers for the
// BIOME 4 robotics-factory option sheets (mobs / decor / tiles / boss / mech).
'use strict';
const path = require('path');
const R = require(process.env.RANGER_PATH || path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
const mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

const F = {
  OUT: '#141620',
  chrome: '#eef2f7', chromeMd: '#b8c2d0',
  steelLt: '#c7cdd6', steel: '#8a94a6', steelMd: '#697386', steelDk: '#454e63', steelDkk: '#2b3245',
  iron: '#5a6072', ironDk: '#363b4d', ironDkk: '#22283a',
  gun: '#3d4456', gunDk: '#242a38',
  brass: '#d7a13a', brassLt: '#ffe3a8', brassDk: '#8a5a1e',
  copper: '#e08b4c', copperLt: '#ffbf8a', copperDk: '#9c5222',
  hazard: '#ffcd45', hazardDk: '#20212c',
  cyan: '#41d6f6', cyanLt: '#c2fbff', cyanDk: '#1f78a8',
  blue: '#5f8bde', blueLt: '#a8c8ff', blueDk: '#2f4f9c',
  red: '#ff4b3e', redLt: '#ffb0a0', redDk: '#9e2422',
  green: '#5fe86b', greenLt: '#c8ffc2', greenDk: '#2b9e3a',
  molten: '#ff7d3a', moltenLt: '#ffd34d', moltenDk: '#c23a1a', ember: '#ff5a2a',
  rubber: '#2a2d38', rubberLt: '#474c5e', rubberDk: '#16171d',
  glass: '#16233d', glassLt: '#3a5f96',
  white: '#f4f4f4', purple: '#a06bd6', purpleLt: '#d6b8ff',
  rust: '#a5623a', rustDk: '#653a20', oil: '#101119',
  labcoat: '#f0f2f6', labcoatDk: '#c2c8d4', labShadow: '#a9b0be', skin: '#e8b796', skinDk: '#c68a63',
  hairW: '#eef1f6', hairWDk: '#b8c0cc'
};

function plate(put, x0, y0, x1, y1, base, hi, dk) {
  x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
  for (let y = y0; y < y1; y++) {
    const vt = (y - y0) / Math.max(1, (y1 - y0 - 1));
    row(put, y, x0, x1, (tx) => {
      let b = mix(hi, base, clamp(vt * 1.15, 0, 1));
      b = mix(b, dk, clamp((vt - 0.55) * 1.25, 0, 1));
      if (tx < 0.13) b = mix(b, hi, 0.55);
      if (tx > 0.9) b = mix(b, dk, 0.5);
      return b;
    });
  }
}
function dome(put, cx, cy, rx, ry, base, hi, dk) {
  ell(put, cx, cy, rx, ry, (tx, ty) => {
    let b = mix(hi, base, clamp(ty * 1.25, 0, 1));
    b = mix(b, dk, clamp((ty - 0.6) * 1.3, 0, 1));
    if (tx < 0.22 && ty < 0.5) b = mix(b, hi, 0.5);
    if (tx > 0.82) b = mix(b, dk, 0.4);
    return b;
  });
}
function bolt(put, x, y, r, c, cdk) {
  ell(put, x, y, r, r, (tx, ty) => mix(c || F.steel, cdk || F.steelDkk, 0.25 + ty * 0.6));
  put(Math.round(x), Math.round(y), cdk || F.steelDkk);
}
function optic(put, cx, cy, r, cDk, c, cLt) {
  ell(put, cx, cy, r * 1.7, r * 1.7, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 <= 0.25 ? cDk : null));
  ell(put, cx, cy, r * 1.12, r * 1.12, () => c);
  ell(put, cx, cy, r * 0.66, r * 0.66, () => cLt);
  put(Math.round(cx - r * 0.35), Math.round(cy - r * 0.35), '#ffffff');
}
function hazard(put, x0, y0, x1, y1, a, b) {
  const per = Math.max(3, Math.round((x1 - x0) * 0.14));
  for (let y = Math.round(y0); y < Math.round(y1); y++)
    for (let x = Math.round(x0); x < Math.round(x1); x++)
      put(x, y, (Math.floor((x + y) / per) % 2 === 0) ? a : b);
}
function tread(put, x0, x1, yTop, yBot) {
  plate(put, x0, yTop, x1, yBot, F.rubber, F.rubberLt, F.rubberDk);
  const seg = Math.max(4, Math.round((x1 - x0) * 0.11));
  for (let x = Math.round(x0); x < x1; x += seg) for (let y = Math.round(yTop); y < yBot; y++) put(x, y, F.rubberDk);
  const r = (yBot - yTop) * 0.5;
  [x0 + r, x1 - r].forEach(cx => { ell(put, cx, (yTop + yBot) / 2, r * 0.85, r * 0.85, (tx, ty) => mix(F.steel, F.steelDkk, ty)); bolt(put, cx, (yTop + yBot) / 2, r * 0.32, F.steelLt, F.steelDk); });
}
function vent(put, x0, x1, y, n) { for (let i = 0; i < n; i++) row(put, y + i * 2, x0, x1, () => F.gunDk); }
function shadow(put, S, cx, w, yy) { ell(put, cx, yy || S * 0.94, w, S * 0.035, () => F.oil); }

// ---- sheet renderer: draw list of {n,name,role,draw} into a numbered grid ----
async function renderSheet(opts) {
  const sharp = require('sharp');
  const { list, out, title, S = 160, cols = 5, cellBg = [13, 14, 22] } = opts;
  const SCALE = opts.scale || 1, CELL = S * SCALE, PAD = 16, LABEL = opts.label != null ? opts.label : 34;
  const rows = Math.ceil(list.length / cols);
  const GW = cols * (CELL + PAD) + PAD, GH = rows * (CELL + LABEL + PAD) + PAD + 34;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = cellBg[0]; grid[i * 4 + 1] = cellBg[1]; grid[i * 4 + 2] = cellBg[2]; grid[i * 4 + 3] = 255; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const YOFF = 34;
  list.forEach((m, idx) => {
    const cell = Buffer.alloc(S * S * 4); const alpha = Buffer.alloc(S * S);
    const put = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S || !c) return; const [r, g, b] = hex(c); const i = y * S + x; cell[i * 4] = r; cell[i * 4 + 1] = g; cell[i * 4 + 2] = b; cell[i * 4 + 3] = 255; alpha[i] = 255; };
    m.draw(put, S);
    if (!m.noOutline) { const [or_, og, ob] = hex(F.OUT); R.outlinePass(S, S, (x, y) => alpha[y * S + x], (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; }); }
    const col = idx % cols, rowI = Math.floor(idx / cols);
    const ox = PAD + col * (CELL + PAD), oy = YOFF + PAD + rowI * (CELL + LABEL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) { const si = ((y / SCALE | 0) * S + (x / SCALE | 0)) * 4; if (cell[si + 3] === 0) continue; const di = ((oy + y) * GW + (ox + x)) * 4; grid[di] = cell[si]; grid[di + 1] = cell[si + 1]; grid[di + 2] = cell[si + 2]; grid[di + 3] = 255; }
  });
  const texts = list.map((m, idx) => {
    const col = idx % cols, rowI = Math.floor(idx / cols);
    const x = PAD + col * (CELL + PAD) + CELL / 2;
    const y = YOFF + PAD + rowI * (CELL + LABEL + PAD) + CELL + 16;
    let t = `<text x="${x}" y="${y}" font-family="monospace" font-size="15" font-weight="bold" fill="#ffcd45" text-anchor="middle">#${m.n} ${m.name}</text>`;
    if (m.role) t += `<text x="${x}" y="${y + 15}" font-family="monospace" font-size="11" fill="#8a94a6" text-anchor="middle">${m.role}</text>`;
    return t;
  }).join('');
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}"><rect x="0" y="0" width="${GW}" height="34" fill="#181a26"/><text x="${GW / 2}" y="23" font-family="monospace" font-size="16" font-weight="bold" fill="#41d6f6" text-anchor="middle">${title}</text>${texts}</svg>`);
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } }).composite([{ input: svg }]).png().toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}

module.exports = { R, F, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, hazard, tread, vent, shadow, renderSheet };
