// artdev/graveyard/render_world_check.js — rasterize the ACTUAL in-game
// world_art.js graveyard draw functions (mobs + boss + reaper + decor) to a
// verification sheet, using the same put→buffer + outlinePass pipeline
// textures.js uses. Run: node artdev/graveyard/render_world_check.js out.png
'use strict';
const path = require('path');
const R = require(path.join(__dirname, '..', '..', 'game', 'js', 'ranger_art.js'));
const A = require(path.join(__dirname, '..', '..', 'game', 'js', 'world_art.js'));
const sharp = require('sharp');

const OUT = '#1a1c2c';
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// [key, drawFn, canvasSize, cellLabel]
const MOB = 48, DEC = 64, BOSS = 96;
const LIST = [
  ['GHOUL', (p, S) => A.drawGhoul(p, S), MOB],
  ['RATTLEBONES', (p, S) => A.drawRattlebones(p, S), MOB],
  ['BONE ARCHER', (p, S) => A.drawBoneArcher(p, S), MOB],
  ['TOMB GOLEM', (p, S) => A.drawTombGolem(p, S), MOB],
  ['CORPSE BLOATER', (p, S) => A.drawCorpseBloater(p, S), MOB],
  ['BANSHEE', (p, S) => A.drawBanshee(p, S), MOB],
  ['MUMMY', (p, S) => A.drawMummy(p, S), MOB],
  ['NECRO ACOLYTE', (p, S) => A.drawNecroAcolyte(p, S), MOB],
  ['GRAVEKEEPER', (p, S) => A.drawGravekeeper(p, S), BOSS],
  ['REAPER', (p, S) => A.drawReaper(p, S), MOB],
  ['HEADSTONE', (p, S) => A.dHeadstone(p, S), DEC],
  ['CROSS GRAVE', (p, S) => A.dCrossGrave(p, S), DEC],
  ['BROKEN STONE', (p, S) => A.dBrokenStone(p, S), DEC],
  ['CRYPT', (p, S) => A.dCrypt(p, S), DEC],
  ['IRON GATE', (p, S) => A.dIronGate(p, S), DEC],
  ['IRON FENCE', (p, S) => A.dIronFence(p, S), DEC],
  ['DEAD TREE', (p, S) => A.dDeadTree(p, S), DEC],
  ['COFFIN', (p, S) => A.dCoffin(p, S), DEC],
  ['ANGEL', (p, S) => A.dAngel(p, S), DEC],
  ['OBELISK', (p, S) => A.dObeliskGY(p, S), DEC],
  ['SARCOPHAGUS', (p, S) => A.dSarcophagus(p, S), DEC],
  ['LAMP POST', (p, S) => A.dLampPost(p, S), DEC],
  ['CANDLES', (p, S) => A.dCandles(p, S), DEC],
  ['CELTIC CROSS', (p, S) => A.dCelticCross(p, S), DEC],
  ['DEAD WREATH', (p, S) => A.dWreath(p, S), DEC],
  ['COBWEB', (p, S) => A.dCobweb(p, S), DEC],
  ['GRAVE FUNGUS', (p, S) => A.dGraveFungus(p, S), DEC],
];

function renderCell(drawFn, S, SCALE) {
  const cell = Buffer.alloc(S * S * 4);
  const alpha = Buffer.alloc(S * S);
  const put = (x, y, c) => {
    x |= 0; y |= 0; if (x < 0 || y < 0 || x >= S || y >= S) return;
    const [r, g, b] = hex(c); const i = y * S + x;
    cell[i * 4] = r; cell[i * 4 + 1] = g; cell[i * 4 + 2] = b; cell[i * 4 + 3] = 255; alpha[i] = 255;
  };
  drawFn(put, S);
  const [or_, og, ob] = hex(OUT);
  R.outlinePass(S, S, (x, y) => alpha[y * S + x],
    (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; });
  // upscale
  const D = S * SCALE, up = Buffer.alloc(D * D * 4);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const si = ((y / SCALE | 0) * S + (x / SCALE | 0)) * 4, di = (y * D + x) * 4;
    up[di] = cell[si]; up[di + 1] = cell[si + 1]; up[di + 2] = cell[si + 2]; up[di + 3] = cell[si + 3];
  }
  return { buf: up, D };
}

async function main() {
  const COLS = 5, CELLPX = 200, PAD = 12, LABEL = 26;
  const ROWS = Math.ceil(LIST.length / COLS);
  const GW = COLS * (CELLPX + PAD) + PAD, GH = ROWS * (CELLPX + LABEL + PAD) + PAD + 40;
  const grid = Buffer.alloc(GW * GH * 4);
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 16; grid[i * 4 + 1] = 15; grid[i * 4 + 2] = 24; grid[i * 4 + 3] = 255; }

  const composites = [];
  LIST.forEach((m, idx) => {
    const [name, fn, S] = m;
    const SCALE = Math.max(1, Math.round((CELLPX * 0.92) / S));
    const { buf, D } = renderCell(fn, S, SCALE);
    const col = idx % COLS, rowI = (idx / COLS) | 0;
    const cx = PAD + col * (CELLPX + PAD), cy = 40 + PAD + rowI * (CELLPX + LABEL + PAD);
    const ox = cx + ((CELLPX - D) >> 1), oy = cy + ((CELLPX - D) >> 1);
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      const si = (y * D + x) * 4; if (buf[si + 3] === 0) continue;
      const gx = ox + x, gy = oy + y; if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) continue;
      const di = (gy * GW + gx) * 4; grid[di] = buf[si]; grid[di + 1] = buf[si + 1]; grid[di + 2] = buf[si + 2]; grid[di + 3] = 255;
    }
  });

  const texts = LIST.map((m, idx) => {
    const col = idx % COLS, rowI = (idx / COLS) | 0;
    const x = PAD + col * (CELLPX + PAD) + CELLPX / 2;
    const y = 40 + PAD + rowI * (CELLPX + LABEL + PAD) + CELLPX + 18;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="14" font-weight="bold" fill="#96ff96" text-anchor="middle">${m[0]}</text>`;
  }).join('');
  const title = `<text x="${PAD}" y="28" font-family="monospace" font-size="22" font-weight="bold" fill="#e6dcc0">THE GRAVEYARD — in-game art (world_art.js port)</text>`;
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}">${title}${texts}</svg>`);

  const out = process.argv[2] || '/tmp/graveyard_world_check.png';
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } }).composite([{ input: svg }]).png().toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });
