// artdev/render_conductor.js — render 10 numbered CONDUCTOR boss model options
// as a PNG grid for the user to pick from (precedent: vault safe, wizard,
// knight). Draws with the ranger_art primitives so the picked option ports
// straight into world_art.js. Run in the container:
//   NODE_PATH=<global modules> node artdev/render_conductor.js out.png
// Uses sharp for PNG encoding (raw RGBA → grid PNG with numbered labels).
'use strict';
const path = require('path');
const R = require(path.join(__dirname, '..', 'game', 'js', 'ranger_art.js'));
const sharp = require('sharp');

const mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

// palette — navy/gold/red per the user's reference image (Styx Express conductor)
const C = {
  OUT: '#1a1c2c',
  navy: '#2b3a67', navyLt: '#41528a', navyDk: '#1d2947', navyDkk: '#131b31',
  gold: '#d7a13a', goldLt: '#f0c96a', goldDk: '#9a6f24',
  red: '#b13e53', redBright: '#ff3b30', eyeGlow: '#ff4a3d', eyeCore: '#ffd0a0',
  skin: '#e8b796', skinDk: '#c98f6b', skinLt: '#f2d0b0',
  stache: '#d8dce4', stacheDk: '#9aa3b2', hair: '#cfd4dc',
  white: '#f4f4f4', black: '#0c0d12',
  iron: '#3b414f', ironDk: '#23272f', steel: '#9aa7b8', steelLt: '#cdd6e2', steelDk: '#5a6678',
  ember: '#ff7d3a', emberLt: '#ffd34d', ghost: '#8fd6ff', ghostLt: '#d8f3ff',
  boot: '#1c1f2b', bootLt: '#333a4d',
  wood: '#7a4a2b', woodDk: '#4d2f1c',
  coatDark: '#232838', coatDarkLt: '#39415c'
};

// ---------------------------------------------------------------------------
// drawConductor(put, S, o) — parametric front-facing conductor.
// o: belly (0..1), height (0..1 head-top offset), coatLen (0..1 of S),
//    mustW (0..1), capH (0..1), hand ('lantern'|'tie'), flame ('ember'|'ghost'),
//    epaulettes, chestChain, spikes, hairTufts, monocle, darkCoat, watchUp
// ---------------------------------------------------------------------------
function drawConductor(put, S, o) {
  const cx = S * 0.5;
  const topY = S * (0.06 + (1 - o.height) * 0.08);          // head top
  const capH = S * (0.075 + o.capH * 0.045);
  const headR = S * 0.115;
  const headCy = topY + capH + headR * 0.85;
  const shoulderY = headCy + headR * 1.05;
  const coatBot = S * (0.62 + o.coatLen * 0.3);
  const bootTop = S * 0.86, bootBot = S * 0.97;
  const bellyW = S * (0.19 + o.belly * 0.115);              // half-width at widest
  const coat = o.darkCoat ? C.coatDark : C.navy;
  const coatLt = o.darkCoat ? C.coatDarkLt : C.navyLt;
  const coatDk = o.darkCoat ? C.black : C.navyDk;
  const trim = o.darkCoat ? C.red : C.gold;
  const trimLt = o.darkCoat ? C.redBright : C.goldLt;

  // ---- legs / boots (behind coat hem) ----
  [-1, 1].forEach(sgn => {
    const lx = cx + sgn * S * 0.085;
    for (let y = Math.round(coatBot - S * 0.04); y < bootTop; y++)
      row(put, y, lx - S * 0.055, lx + S * 0.055, tx => mix(C.navyDk, C.navyDkk, 0.3 + tx * 0.4));
    for (let y = bootTop; y < bootBot; y++)
      row(put, y, lx - S * 0.065 - (y > bootBot - 3 ? S * 0.02 : 0), lx + S * 0.065, tx => mix(C.bootLt, C.boot, 0.3 + tx * 0.5));
  });

  // ---- coat body: shoulders → belly bulge → hem ----
  for (let y = Math.round(shoulderY); y < Math.round(coatBot); y++) {
    const t = (y - shoulderY) / (coatBot - shoulderY);
    // belly curve peaks around t 0.45
    const bulge = Math.sin(clamp(t * 1.25, 0, 1) * Math.PI);
    let hw = lerp(S * 0.16, bellyW, bulge);
    if (o.coatLen > 0.4 && t > 0.75) hw *= 1 + (t - 0.75) * 0.5;   // greatcoat flare
    row(put, y, cx - hw, cx + hw, (tx, xx) => {
      let b = mix(coat, coatDk, clamp(t * 0.9, 0, 1));
      if (tx < 0.18) b = mix(b, coatLt, 0.5);                      // left light
      if (tx > 0.84) b = mix(b, coatDk, 0.55);
      // double-breasted center panel seams
      if (Math.abs(tx - 0.38) < 0.02 || Math.abs(tx - 0.62) < 0.02) b = mix(b, coatDk, 0.5);
      return b;
    });
  }
  // hem trim line — follows the coat's actual width at the hem
  {
    const tHem = 1, bulgeH = Math.sin(clamp(tHem * 1.25, 0, 1) * Math.PI);
    let hemW = lerp(S * 0.16, bellyW, bulgeH);
    if (o.coatLen > 0.4) hemW *= 1.125;                          // greatcoat flare
    row(put, Math.round(coatBot) - 1, cx - hemW, cx + hemW, () => trim);
  }

  // ---- double-breasted gold buttons (two columns) ----
  for (let i = 0; i < 3; i++) {
    const by = shoulderY + (coatBot - shoulderY) * (0.22 + i * 0.2);
    [-1, 1].forEach(sgn => {
      const bx = cx + sgn * S * 0.055;
      ell(put, bx, by, S * 0.016, S * 0.016, (tx, ty) => mix(trimLt, trim, ty));
    });
  }
  // chest chain across the belly (watch chain)
  if (o.chestChain) {
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const x = lerp(cx - S * 0.055, cx + S * 0.055, t);
      const y = shoulderY + (coatBot - shoulderY) * 0.42 + Math.sin(t * Math.PI) * S * 0.03;
      if (i % 2 === 0) put(Math.round(x), Math.round(y), C.goldLt);
    }
  }

  // ---- epaulettes / shoulder spikes ----
  [-1, 1].forEach(sgn => {
    const ex = cx + sgn * S * 0.155, ey = shoulderY + S * 0.015;
    if (o.spikes) {
      // railroad-spike pauldron
      ell(put, ex, ey, S * 0.05, S * 0.035, (tx, ty) => mix(C.steel, C.steelDk, 0.3 + ty * 0.5));
      stroke(put, ex, ey - S * 0.01, ex + sgn * S * 0.045, ey - S * 0.055, S * 0.016, () => C.steelLt);
    } else if (o.epaulettes) {
      ell(put, ex, ey, S * 0.05, S * 0.026, (tx, ty) => mix(trimLt, trim, ty * 0.8));
      for (let f = -2; f <= 2; f++) put(Math.round(ex + f * 2), Math.round(ey + S * 0.026), trim); // fringe
    }
  });

  // ---- arms ----
  // right arm (viewer left): holds the lantern staff or a railroad tie
  const armY = shoulderY + S * 0.03;
  const rHandX = cx - S * (0.24 + o.belly * 0.05), rHandY = armY + S * 0.19;
  stroke(put, cx - S * 0.14, armY, rHandX, rHandY, S * 0.055, () => mix(coat, coatDk, 0.35));
  ell(put, rHandX, rHandY, S * 0.028, S * 0.028, () => C.skin);
  // left arm (viewer right): pocket watch — held out (watchUp) or at the hip
  const lHandX = cx + S * (0.24 + o.belly * 0.04);
  const lHandY = o.watchUp ? armY + S * 0.1 : armY + S * 0.21;
  stroke(put, cx + S * 0.14, armY, lHandX, lHandY, S * 0.055, () => mix(coat, coatDk, 0.45));
  ell(put, lHandX, lHandY, S * 0.028, S * 0.028, () => C.skin);
  // the pocket watch dangles below the hand on a short chain
  // (watchScale: the user doubled it on the picked model — it reads as the
  // SCHEDULE move's focus item now)
  const wS = o.watchScale || 1;
  const wR = S * 0.032 * wS;
  const watchY = lHandY + S * 0.04 + wR;
  for (let i = 1; i <= 3; i++) put(Math.round(lHandX), Math.round(lHandY + i * (S * 0.013)), C.goldLt);
  ell(put, lHandX, watchY, wR, wR, (tx, ty) => mix(C.goldLt, C.gold, 0.2 + ty * 0.6));
  ell(put, lHandX, watchY, wR * 0.62, wR * 0.62, () => C.white);
  if (wS > 1.4) {                                          // big watch: crown + tick marks + real hands
    put(Math.round(lHandX), Math.round(watchY - wR - 1), C.goldLt);          // crown
    for (let a = 0; a < 12; a++) {
      const ang = a / 12 * Math.PI * 2;
      put(Math.round(lHandX + Math.cos(ang) * wR * 0.52), Math.round(watchY + Math.sin(ang) * wR * 0.52), C.stacheDk);
    }
    stroke(put, lHandX, watchY, lHandX, watchY - wR * 0.42, 1.2, () => C.black);            // minute hand
    stroke(put, lHandX, watchY, lHandX + wR * 0.3, watchY + wR * 0.12, 1.2, () => C.black); // hour hand
    put(Math.round(lHandX), Math.round(watchY), C.red);                       // center pin
  } else {
    put(Math.round(lHandX), Math.round(watchY), C.black);
    put(Math.round(lHandX) + 1, Math.round(watchY - S * 0.006), C.black);
  }

  // ---- lantern staff OR railroad tie ----
  if (o.hand === 'tie') {
    // a railroad tie shouldered like a club
    const tx0 = rHandX - S * 0.05, ty0 = rHandY + S * 0.05, tx1 = rHandX + S * 0.13, ty1 = rHandY - S * 0.3;
    stroke(put, tx0, ty0, tx1, ty1, S * 0.055, (tx) => mix(C.wood, C.woodDk, 0.3 + tx * 0.4));
    // spike heads
    put(Math.round(tx1), Math.round(ty1), C.steelLt); put(Math.round(tx1) - 2, Math.round(ty1) + 2, C.steelLt);
  } else {
    // tall staff with a caged signal lantern on top
    const staffX = rHandX - S * 0.015;
    const staffTop = topY + S * 0.02, staffBot = bootBot - S * 0.02;
    for (let y = Math.round(staffTop + S * 0.14); y < staffBot; y++) {
      put(Math.round(staffX), y, mix(C.ironDk, C.iron, (y % 5) / 5));
      put(Math.round(staffX) + 1, y, C.ironDk);
    }
    // lantern cage
    const lanCy = staffTop + S * 0.08, lanR = S * 0.052;
    const flame = o.flame === 'ghost' ? C.ghost : C.ember;
    const flameLt = o.flame === 'ghost' ? C.ghostLt : C.emberLt;
    ell(put, staffX, lanCy, lanR, lanR * 1.25, (tx, ty) => mix(flameLt, flame, clamp(ty * 1.3, 0, 1)));
    // cage bars + caps
    for (let y = Math.round(lanCy - lanR * 1.25); y <= Math.round(lanCy + lanR * 1.25); y++) put(Math.round(staffX), y, C.ironDk);
    row(put, Math.round(lanCy - lanR * 1.35), staffX - lanR, staffX + lanR, () => C.iron);
    row(put, Math.round(lanCy + lanR * 1.3), staffX - lanR * 0.8, staffX + lanR * 0.8, () => C.iron);
    put(Math.round(staffX), Math.round(lanCy - lanR * 1.6), C.gold);          // finial
  }

  // ---- head ----
  // neck + white collar + red bowtie
  row(put, Math.round(shoulderY - S * 0.012), cx - S * 0.05, cx + S * 0.05, () => C.white);
  ell(put, cx, shoulderY + S * 0.005, S * 0.028, S * 0.018, (tx, ty) => mix(C.redBright, C.red, ty));
  // face
  ell(put, cx, headCy, headR, headR * 1.02, (tx, ty) => {
    let b = mix(C.skinLt, C.skin, clamp(ty * 1.2, 0, 1));
    if (tx > 0.75) b = mix(b, C.skinDk, 0.5);
    return b;
  });
  // jowls (portly face)
  if (o.belly > 0.4) {
    [-1, 1].forEach(sgn => ell(put, cx + sgn * headR * 0.62, headCy + headR * 0.55, headR * 0.3, headR * 0.26, () => C.skin));
  }
  // hair tufts under the cap sides
  if (o.hairTufts) {
    [-1, 1].forEach(sgn => ell(put, cx + sgn * headR * 0.95, headCy - headR * 0.15, headR * 0.22, headR * 0.3, (tx, ty) => mix(C.hair, C.stacheDk, ty)));
  }
  // RED GLOWING EYES under stern brows
  const eyeY = headCy - headR * 0.18, eyeX = headR * 0.42;
  [-1, 1].forEach(sgn => {
    ell(put, cx + sgn * eyeX, eyeY, S * 0.024, S * 0.017, (tx, ty) => mix(C.eyeGlow, C.redBright, ty));
    put(Math.round(cx + sgn * eyeX), Math.round(eyeY), C.eyeCore);
    // brow
    row(put, Math.round(eyeY - S * 0.028), cx + sgn * eyeX - S * 0.028, cx + sgn * eyeX + S * 0.028, () => C.OUT);
  });
  if (o.monocle) {
    for (let a = 0; a < Math.PI * 2; a += 0.25)
      put(Math.round(cx + eyeX + Math.cos(a) * S * 0.032), Math.round(eyeY + Math.sin(a) * S * 0.032), C.goldLt);
    put(Math.round(cx + eyeX + S * 0.03), Math.round(eyeY + S * 0.05), C.goldLt);  // cord
  }
  // grand walrus mustache
  const mW = headR * (0.7 + o.mustW * 0.65), mY = headCy + headR * 0.32;
  ell(put, cx, mY, mW, headR * 0.28, (tx, ty) => {
    let b = mix(C.stache, C.stacheDk, clamp(ty * 1.1 - 0.2, 0, 1));
    if (Math.abs(tx - 0.5) < 0.06 && ty < 0.4) b = C.skinDk;      // philtrum notch
    return b;
  });
  [-1, 1].forEach(sgn => ell(put, cx + sgn * mW * 0.9, mY + headR * 0.12, headR * 0.16, headR * 0.14, () => C.stache)); // curled tips

  // ---- conductor cap ----
  for (let y = Math.round(topY); y < Math.round(topY + capH); y++) {
    const t = (y - topY) / capH;
    const hw = lerp(headR * 0.92, headR * 1.12, Math.sin(clamp(t * 1.1, 0, 1) * Math.PI * 0.5));
    row(put, y, cx - hw, cx + hw, tx => {
      let b = mix(coatLt, coat, clamp(t * 1.2, 0, 1));
      if (tx < 0.2) b = mix(b, coatLt, 0.4);
      return b;
    });
  }
  // gold band + badge
  row(put, Math.round(topY + capH - 2), cx - headR * 1.12, cx + headR * 1.12, () => trim);
  row(put, Math.round(topY + capH - 3), cx - headR * 1.12, cx + headR * 1.12, () => trimLt);
  ell(put, cx, topY + capH * 0.5, S * 0.022, S * 0.02, (tx, ty) => mix(trimLt, trim, ty));
  // black visor
  ell(put, cx, topY + capH + S * 0.008, headR * 1.02, S * 0.022, () => C.black);
}

// 10 numbered variants -------------------------------------------------------
const VARIANTS = [
  { n: 1,  name: 'CLASSIC',      o: { belly: 0.6, height: 0.5, coatLen: 0.2, mustW: 0.6, capH: 0.5, hand: 'lantern', flame: 'ember', epaulettes: true,  chestChain: false, spikes: false, hairTufts: false, monocle: false, darkCoat: false, watchUp: false } },
  { n: 2,  name: 'GREATCOAT',    o: { belly: 0.45, height: 0.8, coatLen: 0.85, mustW: 0.55, capH: 0.7, hand: 'lantern', flame: 'ember', epaulettes: true,  chestChain: false, spikes: false, hairTufts: false, monocle: false, darkCoat: false, watchUp: false } },
  { n: 3,  name: 'INSPECTOR',    o: { belly: 0.25, height: 0.9, coatLen: 0.3, mustW: 0.3, capH: 0.4, hand: 'lantern', flame: 'ember', epaulettes: false, chestChain: true,  spikes: false, hairTufts: false, monocle: true,  darkCoat: false, watchUp: true } },
  { n: 4,  name: 'BIG BOSS',     o: { belly: 1.0, height: 0.25, coatLen: 0.15, mustW: 1.0, capH: 0.55, hand: 'lantern', flame: 'ember', epaulettes: true,  chestChain: true,  spikes: false, hairTufts: false, monocle: false, darkCoat: false, watchUp: false } },
  { n: 5,  name: 'STYX PILOT',   o: { belly: 0.55, height: 0.55, coatLen: 0.5, mustW: 0.6, capH: 0.5, hand: 'lantern', flame: 'ghost', epaulettes: true,  chestChain: false, spikes: false, hairTufts: false, monocle: false, darkCoat: false, watchUp: false } },
  // #6 = THE PICK (user 2026-07-14) + "his stop watch needs to be like double the size"
  { n: 6,  name: 'GRIM LINE',    o: { belly: 0.4, height: 0.7, coatLen: 0.7, mustW: 0.45, capH: 0.6, hand: 'lantern', flame: 'ghost', epaulettes: false, chestChain: false, spikes: false, hairTufts: false, monocle: false, darkCoat: true,  watchUp: true, watchScale: 2 } },
  { n: 7,  name: 'BRASS BARON',  o: { belly: 0.8, height: 0.4, coatLen: 0.25, mustW: 0.75, capH: 0.75, hand: 'lantern', flame: 'ember', epaulettes: true,  chestChain: true,  spikes: false, hairTufts: false, monocle: true,  darkCoat: false, watchUp: false } },
  { n: 8,  name: 'SPIKE GANG',   o: { belly: 0.65, height: 0.45, coatLen: 0.2, mustW: 0.7, capH: 0.5, hand: 'tie',     flame: 'ember', epaulettes: false, chestChain: false, spikes: true,  hairTufts: false, monocle: false, darkCoat: false, watchUp: false } },
  { n: 9,  name: 'OLD TIMER',    o: { belly: 0.7, height: 0.3, coatLen: 0.35, mustW: 0.9, capH: 0.45, hand: 'lantern', flame: 'ember', epaulettes: true,  chestChain: true,  spikes: false, hairTufts: true,  monocle: false, darkCoat: false, watchUp: true } },
  { n: 10, name: 'NIGHT HAULER', o: { belly: 0.55, height: 0.6, coatLen: 0.6, mustW: 0.55, capH: 0.65, hand: 'tie',     flame: 'ghost', epaulettes: true,  chestChain: false, spikes: true,  hairTufts: false, monocle: false, darkCoat: true,  watchUp: false } }
];

// ---------------------------------------------------------------------------
async function main() {
  const S = 128, SCALE = 2, CELL = S * SCALE, PAD = 8, LABEL = 34;
  const COLS = 5, ROWS = 2;
  const GW = COLS * (CELL + PAD) + PAD, GH = ROWS * (CELL + LABEL + PAD) + PAD;
  const grid = Buffer.alloc(GW * GH * 4);
  // dark bg
  for (let i = 0; i < GW * GH; i++) { grid[i * 4] = 15; grid[i * 4 + 1] = 15; grid[i * 4 + 2] = 27; grid[i * 4 + 3] = 255; }

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  VARIANTS.forEach((v, idx) => {
    // render one model into an S×S RGBA cell
    const cell = Buffer.alloc(S * S * 4);
    const alpha = Buffer.alloc(S * S);
    const put = (x, y, c) => {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= S || y >= S) return;
      const [r, g, b] = hex(c);
      const i = y * S + x;
      cell[i * 4] = r; cell[i * 4 + 1] = g; cell[i * 4 + 2] = b; cell[i * 4 + 3] = 255;
      alpha[i] = 255;
    };
    drawConductor(put, S, v.o);
    // outline pass (same contract as the game)
    const [or_, og, ob] = hex(C.OUT);
    R.outlinePass(S, S, (x, y) => alpha[y * S + x],
      (x, y) => { const i = y * S + x; cell[i * 4] = or_; cell[i * 4 + 1] = og; cell[i * 4 + 2] = ob; cell[i * 4 + 3] = 255; });
    // blit ×SCALE nearest into the grid
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const ox = PAD + col * (CELL + PAD), oy = PAD + rowI * (CELL + LABEL + PAD);
    for (let y = 0; y < CELL; y++) for (let x = 0; x < CELL; x++) {
      const si = ((y / SCALE | 0) * S + (x / SCALE | 0)) * 4;
      if (cell[si + 3] === 0) continue;
      const di = ((oy + y) * GW + (ox + x)) * 4;
      grid[di] = cell[si]; grid[di + 1] = cell[si + 1]; grid[di + 2] = cell[si + 2]; grid[di + 3] = 255;
    }
  });

  // number labels via SVG overlay
  const texts = VARIANTS.map((v, idx) => {
    const col = idx % COLS, rowI = Math.floor(idx / COLS);
    const x = PAD + col * (CELL + PAD) + CELL / 2;
    const y = PAD + rowI * (CELL + LABEL + PAD) + CELL + 24;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="20" font-weight="bold" fill="#ffcd75" text-anchor="middle">#${v.n} ${v.name}</text>`;
  }).join('');
  const svg = Buffer.from(`<svg width="${GW}" height="${GH}">${texts}</svg>`);

  const out = process.argv[2] || 'conductor_options.png';
  await sharp(grid, { raw: { width: GW, height: GH, channels: 4 } })
    .composite([{ input: svg }])
    .png()
    .toFile(out);
  console.log('wrote', out, GW + 'x' + GH);
}
main().catch(e => { console.error(e); process.exit(1); });

// --- single-model confirm render: `node render_conductor.js out.png --one 6 --scale 4`
