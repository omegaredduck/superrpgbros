// artdev/render_grove_assets.js — preview sheet of the ACTUAL in-game grove
// textures (world_art.js draw fns, the same code textures.js builds from):
// mobs + minis/recolors + wing frames, tiles, props, the Heartwood, the
// fallen trunk. node artdev/render_grove_assets.js out.png
'use strict';
const path = require('path');
const R = require(path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
global.RANGER_ART = R;
const W = require(path.join(__dirname, '..', 'game', 'js', 'world_art.js'));
const sharp = require('sharp');

const PUFF_PALS = [
  { cap: '#d95763', capLt: '#f28d9a', capDk: '#9e2835' },
  { cap: '#41a6f6', capLt: '#8fd6ff', capDk: '#2569a8' },
  { cap: '#8f3fb5', capLt: '#c078e0', capDk: '#5d275d' },
  { cap: '#ffcd75', capLt: '#ffe3a8', capDk: '#d7a13a' }
];
const BEE_PALS = [
  { body: '#ffd23e', dk: '#c89a1e' },
  { body: '#ff9a3d', dk: '#c26a1e' },
  { body: '#8fd6ff', dk: '#4a8ec2' }
];
const PIXIE_PAL = { main: '#ff77a8', lt: '#ffc2d8', dk: '#c2437a' };
const BLOOM_PAL = { main: '#41a6f6', lt: '#8fd6ff', dk: '#2569a8' };

// [label, w, h, drawFn, scale]
const CELLS = [
  ['PUFFCAP', 48, 48, s => W.drawPuffcap(s.put, 48), 3],
  ['MINI x4', 48, 48, null, 3, PUFF_PALS.map(p => (s => W.drawPuffcapMini(s.put, 48, p)))],
  ['PIXIE f0/f1', 48, 48, null, 3, [s => W.drawPixie(s.put, 48, PIXIE_PAL, 0), s => W.drawPixie(s.put, 48, PIXIE_PAL, 1)]],
  ['BLOOM f0/f1', 48, 48, null, 3, [s => W.drawPixie(s.put, 48, BLOOM_PAL, 0), s => W.drawPixie(s.put, 48, BLOOM_PAL, 1)]],
  ['MOSS GOLEM', 48, 48, s => W.drawMossGolem(s.put, 48), 3],
  ['SEEDLING', 48, 48, s => W.drawSeedlingTurret(s.put, 48), 3],
  ['SNAPDRAGON', 48, 48, s => W.drawSnapdragon(s.put, 48), 3],
  ['BRUTE f0/f1', 48, 48, null, 3, [s => W.drawBumblebrute(s.put, 48, 0), s => W.drawBumblebrute(s.put, 48, 1)]],
  ['BEE MINI x3', 48, 48, null, 3, BEE_PALS.map(p => (s => W.drawBumblebruteMini(s.put, 48, p, 0)))],
  ['MOONMOTH f0/f1', 48, 48, null, 3, [s => W.drawMoonmoth(s.put, 48, 0), s => W.drawMoonmoth(s.put, 48, 1)]],
  ['GRASS TILE', 48, 48, s => W.drawGroveGrass(s.put, 48, 48), 3],
  ['CANOPY EDGE', 48, 28, s => W.drawGroveWall(s.put, 48, 28), 3],
  ['GROVE TREE', 112, 112, s => W.drawGroveTree(s.put, 112), 1.3],
  ['GLOWSHROOM', 48, 48, s => W.drawGlowShroom(s.put, 48), 3],
  ['HEARTWOOD', 192, 192, s => W.drawHeartwood(s.put, 192), 0.76],
  ['FALLEN TRUNK', 260, 56, s => W.drawFallenTrunk(s.put, 260, 56), 0.56]
];

function renderCell(w, h, fns) {
  // fns: array of draw fns rendered side by side in one canvas strip
  const n = fns.length;
  const cw = w * n + (n - 1) * 4;
  const buf = Buffer.alloc(cw * h * 4);
  const alpha = Buffer.alloc(cw * h);
  fns.forEach((fn, i) => {
    const ox = i * (w + 4);
    const cell = Buffer.alloc(w * h * 4);
    const a2 = Buffer.alloc(w * h);
    const put = (x, y, c) => {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
      const idx = y * w + x;
      cell[idx * 4] = r; cell[idx * 4 + 1] = g; cell[idx * 4 + 2] = b; cell[idx * 4 + 3] = 255;
      a2[idx] = 255;
    };
    fn({ put });
    R.outlinePass(w, h, (x, y) => a2[y * w + x], (x, y) => {
      const idx = y * w + x;
      cell[idx * 4] = 26; cell[idx * 4 + 1] = 28; cell[idx * 4 + 2] = 44; cell[idx * 4 + 3] = 255;
    });
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      if (cell[si + 3] === 0) continue;
      const di = (y * cw + ox + x) * 4;
      buf[di] = cell[si]; buf[di + 1] = cell[si + 1]; buf[di + 2] = cell[si + 2]; buf[di + 3] = 255;
    }
  });
  return { buf, w: cw, h };
}

async function main() {
  const COLS = 4, PAD = 12, LABEL = 22, CELLW = 200, CELLH = 160;
  const ROWS = Math.ceil(CELLS.length / COLS);
  const GW = COLS * (CELLW + PAD) + PAD, GH = ROWS * (CELLH + LABEL + PAD) + PAD;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 15; grid[i * 4 + 1] = 15; grid[i * 4 + 2] = 27; grid[i * 4 + 3] = 255; }

  const texts = [];
  CELLS.forEach((c, idx) => {
    const [label, w, h, fn, scale0, multi] = c;
    const cellData = renderCell(w, h, multi || [fn]);
    const scale = Math.min(scale0, (CELLW - 8) / cellData.w, (CELLH - 8) / cellData.h);
    const drawW = Math.round(cellData.w * scale), drawH = Math.round(cellData.h * scale);
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const ox = PAD + col * (CELLW + PAD) + Math.round((CELLW - drawW) / 2);
    const oy = PAD + rowI * (CELLH + LABEL + PAD) + Math.round((CELLH - drawH) / 2);
    for (let y = 0; y < drawH; y++) for (let x = 0; x < drawW; x++) {
      const sx = Math.min(cellData.w - 1, Math.floor(x / scale)), sy = Math.min(cellData.h - 1, Math.floor(y / scale));
      const si = (sy * cellData.w + sx) * 4;
      if (cellData.buf[si + 3] === 0) continue;
      const gx = ox + x, gy = oy + y;
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      const di = (gy * GW + gx) * 4;
      grid[di] = cellData.buf[si]; grid[di + 1] = cellData.buf[si + 1]; grid[di + 2] = cellData.buf[si + 2]; grid[di + 3] = 255;
    }
    const tx = PAD + col * (CELLW + PAD) + CELLW / 2;
    const ty = PAD + rowI * (CELLH + LABEL + PAD) + CELLH + 15;
    texts.push(`<text x="${tx}" y="${ty}" font-family="monospace" font-size="13" font-weight="bold" fill="#ffcd75" text-anchor="middle">${label}</text>`);
  });
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}">${texts.join('')}</svg>`);
  const out = process.argv[2] || 'grove_assets.png';
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } }).composite([{ input: svg }]).png().toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });
