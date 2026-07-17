// artdev/castle/render_castle_decor.js — 20 numbered VAMPIRE CASTLE
// decoration candidates, one PNG grid.
'use strict';
const KIT = require('./gothic_kit.js');
const { G, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, candleFlame, lancet, batIcon } = KIT;

// 1 · THE THRONE — clawed gothic throne on a dais.
function drawThrone(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.22, S * 0.78, cx + S * 0.22, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
  // tall pointed back
  for (let y = 0; y < S * 0.44; y++) {
    const t = y / (S * 0.44);
    let w = S * 0.13; if (t < 0.3) { const a = t / 0.3; w = S * 0.13 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(S * 0.16 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.woodDk, G.woodDkk, t * 0.5 + Math.abs(tx - 0.5) * 0.4);
      return b;
    });
  }
  // velvet cushion panel
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3);
    let w = S * 0.08; if (t < 0.3) { const a = t / 0.3; w = S * 0.08 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(S * 0.26 + y), cx - w, cx + w, (tx) => mix(G.blood, G.wine, t + Math.abs(tx - 0.5) * 0.3));
  }
  // seat + arms w/ claw ends
  plate(put, cx - S * 0.15, S * 0.6, cx + S * 0.15, S * 0.68, G.wood, G.woodLt, G.woodDkk);
  [-1, 1].forEach(s => {
    plate(put, cx + s * S * 0.15 - S * 0.025, S * 0.5, cx + s * S * 0.15 + S * 0.025, S * 0.66, G.woodDk, G.wood, G.woodDkk);
    dome(put, cx + s * S * 0.15, S * 0.49, S * 0.03, S * 0.022, G.gold, G.goldLt, G.goldDk);
  });
  // finial bat at the top
  ell(put, cx, S * 0.14, S * 0.03, S * 0.022, () => G.oil);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.02, S * 0.14, cx + s * S * 0.06, S * 0.11, S * 0.02, () => G.oil));
  // legs
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.12 - S * 0.02, S * 0.68, cx + s * S * 0.12 + S * 0.02, S * 0.78, G.woodDk, G.wood, G.woodDkk));
}

// 2 · COUNT'S COFFIN — polished coffin on trestles, lid ajar.
function drawCoffin(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.26);
  // trestles
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.14, cy + S * 0.12, cx + s * S * 0.2, cy + S * 0.24, S * 0.02, () => G.woodDk); stroke(put, cx + s * S * 0.14, cy + S * 0.12, cx + s * S * 0.08, cy + S * 0.24, S * 0.02, () => G.woodDkk); });
  // coffin body (hexagonal profile)
  const pts = [[-0.3, 0], [-0.16, -0.1], [0.26, -0.06], [0.3, 0.02], [0.2, 0.1], [-0.22, 0.08]];
  for (let y = -0.1; y < 0.12; y += 0.01) {
    const yy = cy + y * S;
    let x0 = 99, x1 = -99;
    // crude fill between silhouette bounds
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((y >= Math.min(ay, by)) && (y <= Math.max(ay, by)) && Math.abs(by - ay) > 0.001) {
        const t = (y - ay) / (by - ay); const x = ax + (bx - ax) * t;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      }
    }
    if (x1 > x0) row(put, Math.round(yy), cx + x0 * S, cx + x1 * S, (tx) => mix(G.woodLt, G.woodDkk, (y + 0.1) / 0.22 * 0.7 + Math.abs(tx - 0.5) * 0.3));
  }
  // lid pushed ajar — dark gap + red interior sliver
  stroke(put, cx - S * 0.16, cy - S * 0.1, cx + S * 0.26, cy - S * 0.06, S * 0.02, () => G.oil);
  stroke(put, cx - S * 0.14, cy - S * 0.085, cx + S * 0.1, cy - S * 0.055, S * 0.012, () => G.wine);
  // gold cross inlay + handles
  stroke(put, cx, cy - S * 0.02, cx, cy + S * 0.06, 2, () => G.gold);
  stroke(put, cx - S * 0.03, cy + S * 0.0, cx + S * 0.03, cy + S * 0.0, 2, () => G.gold);
  [[-0.26, 0.02], [0.26, 0.02]].forEach(([ox, oy]) => bolt(put, cx + ox * S, cy + oy * S, S * 0.015, G.gold, G.goldDk));
  // grave dirt sprinkles
  [[-0.32, 0.2], [0.3, 0.22]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), G.woodDkk));
}

// 3 · CANDELABRA — freestanding, seven flames (lights the halls).
function drawCandelabra(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.12);
  stroke(put, cx, S * 0.32, cx, S * 0.84, S * 0.022, () => G.goldDk);
  dome(put, cx, S * 0.86, S * 0.09, S * 0.03, G.goldDk, G.gold, G.goldDkk);
  // three tiers of arms
  [[0.32, 0.16], [0.42, 0.11], [0.52, 0.06]].forEach(([yy, reach]) => {
    [-1, 1].forEach(s => {
      stroke(put, cx, S * yy, cx + s * S * reach, S * (yy - 0.05), S * 0.016, () => G.goldDk);
      stroke(put, cx + s * S * reach, S * (yy - 0.05), cx + s * S * reach, S * (yy - 0.1), S * 0.016, () => G.gold);
      candleFlame(put, cx + s * S * reach, S * (yy - 0.13), S * 0.03);
      stroke(put, cx + s * S * reach, S * (yy - 0.1), cx + s * S * reach, S * (yy - 0.115), S * 0.014, () => G.bone);
    });
  });
  candleFlame(put, cx, S * 0.27, S * 0.035);
  stroke(put, cx, S * 0.3, cx, S * 0.32, S * 0.016, () => G.bone);
  // wax drips
  [[-0.16, 0.28], [0.11, 0.38]].forEach(([ox, oy]) => stroke(put, cx + ox * S, S * oy, cx + ox * S, S * oy + S * 0.04, 1, () => G.bone));
}

// 4 · CHANDELIER — hanging crystal ring (decor twin of the mob).
function drawChandelierDecor(put, S) {
  const cx = S * 0.5, cy = S * 0.4;
  for (let y = 0; y < S * 0.12; y += 4) ell(put, cx, S * 0.06 + y, S * 0.013, S * 0.018, () => (y / 4) % 2 ? G.goldDk : G.gold);
  ell(put, cx, cy, S * 0.22, S * 0.06, (tx, ty) => mix(G.gold, G.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
  ell(put, cx, cy - S * 0.06, S * 0.12, S * 0.035, (tx, ty) => mix(G.goldLt, G.goldDk, ty));
  [[-0.22, 0], [-0.11, -0.02], [0, -0.03], [0.11, -0.02], [0.22, 0]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, S * 0.016, () => G.bone);
    candleFlame(put, cx + ox * S, cy + oy * S - S * 0.08, S * 0.03);
  });
  // crystal drops
  for (let i = -3; i <= 3; i++) {
    stroke(put, cx + i * S * 0.06, cy + S * 0.05, cx + i * S * 0.06, cy + S * 0.12, 1, () => G.silver);
    ell(put, cx + i * S * 0.06, cy + S * 0.14, S * 0.015, S * 0.022, (tx, ty) => mix(G.moonLt, G.moonDk, ty));
  }
  // light pool below
  ell(put, cx, S * 0.86, S * 0.2, S * 0.05, () => mix(G.candle, G.night, 0.75));
}

// 5 · GRAND MIRROR — gilt mirror that reflects NOTHING standing before it.
function drawGrandMirror(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // frame
  for (let y = 0; y < S * 0.56; y++) {
    const t = y / (S * 0.56);
    let w = S * 0.17; if (t < 0.25) { const a = t / 0.25; w = S * 0.17 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(S * 0.16 + y), cx - w, cx + w, (tx) => {
      const edge = tx < 0.1 || tx > 0.9 || t > 0.94;
      if (edge) return mix(G.gold, G.goldDkk, Math.abs(tx - 0.5) + t * 0.3);
      let b = mix(G.nightLt, G.night, t);
      if (Math.abs(tx - 0.32) < 0.1) b = mix(b, G.moon, 0.45);
      return b;
    });
  }
  plate(put, cx - S * 0.14, S * 0.72, cx + S * 0.14, S * 0.78, G.wood, G.woodLt, G.woodDkk);
  // ornament crest + side scrolls
  dome(put, cx, S * 0.13, S * 0.05, S * 0.035, G.gold, G.goldLt, G.goldDk);
  [-1, 1].forEach(s => { for (let a = 0; a < 2.4; a += 0.3) put(Math.round(cx + s * (S * 0.18 + Math.cos(a) * S * 0.02)), Math.round(S * 0.3 + Math.sin(a) * S * 0.03), G.gold); });
  // faint red eyes deep IN the glass
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(S * 0.38), G.bloodDk));
}

// 6 · PORTRAIT ROW — ancestral gallery (phantom spawn points).
function drawPortraitRow(put, S) {
  const cx = S * 0.5;
  // wall
  plate(put, cx - S * 0.32, S * 0.2, cx + S * 0.32, S * 0.8, G.nightLt, G.stoneDk, G.night);
  // three framed portraits
  [[-0.21, 0.34, G.velvet], [0.0, 0.3, G.blood], [0.21, 0.34, G.moonDk]].forEach(([ox, top, robe]) => {
    const px = cx + ox * S;
    plate(put, px - S * 0.085, S * top, px + S * 0.085, S * (top + 0.3), G.goldDk, G.gold, G.goldDkk);
    plate(put, px - S * 0.065, S * (top + 0.02), px + S * 0.065, S * (top + 0.28), G.night, G.nightLt, G.oil);
    dome(put, px, S * (top + 0.1), S * 0.03, S * 0.032, G.vskin, '#ffffff', G.vskinDk);
    dome(put, px, S * (top + 0.19), S * 0.045, S * 0.06, robe, mix(robe, '#ffffff', 0.3), G.oil);
    [-1, 1].forEach(s => put(Math.round(px + s * S * 0.012), Math.round(S * (top + 0.095)), G.blood));
  });
  // one frame EMPTY — its occupant is loose
  plate(put, cx - S * 0.32, S * 0.3, cx - S * 0.24, S * 0.62, G.goldDk, G.gold, G.goldDkk);
  plate(put, cx - S * 0.305, S * 0.32, cx - S * 0.255, S * 0.6, G.oil, G.night, G.oil);
  // wainscot rail
  row(put, Math.round(S * 0.78), cx - S * 0.32, cx + S * 0.32, () => G.woodDk);
}

// 7 · BANQUET TABLE — endless feast, long rotted.
function drawBanquetTable(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.3);
  // tablecloth + top (perspective slab)
  plate(put, cx - S * 0.3, cy - S * 0.1, cx + S * 0.3, cy + S * 0.08, G.blood, G.bloodLt, G.wine);
  row(put, Math.round(cy - S * 0.1), cx - S * 0.3, cx + S * 0.3, () => G.bloodLt);
  // hanging cloth folds
  for (let x = -0.28; x < 0.3; x += 0.06) stroke(put, cx + x * S, cy + S * 0.08, cx + x * S, cy + S * 0.2, S * 0.02, (t) => mix(G.blood, G.wine, t));
  // legs
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.26 - S * 0.02, cy + S * 0.18, cx + s * S * 0.26 + S * 0.02, cy + S * 0.28, G.woodDk, G.wood, G.woodDkk));
  // feast: candelabrum, goblets, platter w/ ???, cobwebbed
  stroke(put, cx, cy - S * 0.14, cx, cy - S * 0.1, 2, () => G.goldDk);
  candleFlame(put, cx, cy - S * 0.17, S * 0.028);
  [[-0.18, -0.12], [0.14, -0.13]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S + S * 0.03, cx + ox * S, cy + oy * S + S * 0.06, 2, () => G.goldDk);
    ell(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.022, S * 0.014, (tx, ty) => mix(G.gold, G.goldDk, ty));
    put(Math.round(cx + ox * S), Math.round(cy + oy * S + S * 0.015), G.blood);
  });
  ell(put, cx + S * 0.24, cy - S * 0.115, S * 0.05, S * 0.018, (tx, ty) => mix(G.silver, G.silverDk, ty));
  dome(put, cx + S * 0.24, cy - S * 0.14, S * 0.028, S * 0.02, G.boneDk, G.bone, G.woodDkk); // mystery roast
  // cobwebs corner
  [[-0.28, -0.1]].forEach(([ox, oy]) => { for (let a = 0; a < 1.6; a += 0.3) stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + Math.cos(a) * S * 0.06, cy + oy * S + Math.sin(a) * S * 0.06, 1, () => G.paleDk); });
}

// 8 · GREAT ORGAN — towering pipe organ (set piece; the Organist's home).
function drawGreatOrgan(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.28);
  // pipe ranks in a gothic case
  [[-0.26, 0.36], [-0.17, 0.46], [-0.08, 0.56], [0.02, 0.62], [0.12, 0.56], [0.21, 0.46], [0.3, 0.36]].forEach(([o, h]) => {
    plate(put, cx + o * S - S * 0.035, S * 0.82 - h * S, cx + o * S + S * 0.035, S * 0.7, G.silver, G.moonLt, G.ironDkk);
    ell(put, cx + o * S, S * 0.82 - h * S + S * 0.02, S * 0.014, S * 0.01, () => G.oil);
  });
  // case + console
  plate(put, cx - S * 0.3, S * 0.7, cx + S * 0.34, S * 0.78, G.woodDk, G.wood, G.woodDkk);
  plate(put, cx - S * 0.2, S * 0.78, cx + S * 0.24, S * 0.86, G.wood, G.woodLt, G.woodDkk);
  for (let x = -0.18; x < 0.22; x += 0.02) put(Math.round(cx + x * S), Math.round(S * 0.8), Math.floor(x * 50) % 2 ? G.oil : G.white);
  // bench
  plate(put, cx - S * 0.08, S * 0.88, cx + S * 0.12, S * 0.92, G.woodDk, G.wood, G.woodDkk);
  // carved bat crest + candles on the case
  ell(put, cx + S * 0.02, S * 0.18, S * 0.03, S * 0.02, () => G.oil);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.02 + s * S * 0.02, S * 0.18, cx + S * 0.02 + s * S * 0.07, S * 0.15, S * 0.02, () => G.oil));
  [[-0.3, 0.66], [0.34, 0.66]].forEach(([ox, oy]) => candleFlame(put, cx + ox * S, S * oy, S * 0.026));
}

// 9 · LANCET WINDOW — stained glass, moonlight pouring through.
function drawLancetWindow(put, S) {
  const cx = S * 0.5;
  const panes = [G.gRed, G.gBlue, G.gGreen, G.gAmber];
  // stone surround
  lancet(put, cx, S * 0.12, S * 0.19, S * 0.6, (tx, t) => mix(G.stone, G.stoneDk, t * 0.5 + Math.abs(tx - 0.5)));
  lancet(put, cx, S * 0.15, S * 0.15, S * 0.54, (tx, t) => {
    let b = panes[(Math.floor(tx * 3) + Math.floor(t * 4)) % 4];
    b = mix(b, '#ffffff', 0.15 + 0.2 * Math.sin(tx * 4 + t * 3));
    if ((tx * 3) % 1 < 0.1 || (t * 4) % 1 < 0.06) b = G.ironDkk;
    return b;
  });
  // moonlight shaft falling to the floor
  for (let y = 0; y < S * 0.2; y++) {
    const t = y / (S * 0.2);
    row(put, Math.round(S * 0.7 + y), cx - S * (0.15 + t * 0.12) + S * 0.14, cx + S * (0.15 + t * 0.12) + S * 0.14, (tx) => {
      if ((tx * 5 + t * 2) % 1 < 0.5) return mix(G.moonLt, G.night, 0.55 + t * 0.2);
      return null;
    });
  }
  ell(put, cx + S * 0.14, S * 0.9, S * 0.24, S * 0.04, (tx, ty) => mix(G.moon, G.night, 0.5));
}

// 10 · GOTHIC COLUMN — clustered pier w/ grotesque capital.
function drawGothicColumn(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  plate(put, cx - S * 0.13, S * 0.8, cx + S * 0.13, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
  // clustered shafts
  [-0.06, 0, 0.06].forEach(o => {
    for (let y = S * 0.26; y < S * 0.8; y++)
      row(put, Math.round(y), cx + o * S - S * 0.035, cx + o * S + S * 0.035, (tx) => {
        let b = mix(G.stoneLt, G.stoneDk, Math.abs(tx - 0.5) * 1.4 + (o + 0.06) * 2);
        return b;
      });
  });
  // capital w/ little grotesque face
  plate(put, cx - S * 0.14, S * 0.18, cx + S * 0.14, S * 0.28, G.stoneLt, G.moonLt, G.stoneDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(S * 0.22), G.oil));
  stroke(put, cx - S * 0.03, S * 0.25, cx + S * 0.03, S * 0.25, 1, () => G.stoneDkk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, S * 0.2, cx + s * S * 0.08, S * 0.16, 2, () => G.stoneDk));
  // torch bracket + flame
  stroke(put, cx + S * 0.13, S * 0.42, cx + S * 0.2, S * 0.38, S * 0.016, () => G.ironDk);
  candleFlame(put, cx + S * 0.21, S * 0.34, S * 0.04);
}

// 11 · LIBRARY STACK — forbidden books, one floats.
function drawLibraryStack(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.26, S * 0.16, cx + S * 0.26, S * 0.86, G.woodDk, G.wood, G.woodDkk);
  // shelves of books
  [0.22, 0.38, 0.54, 0.7].forEach(sy => {
    plate(put, cx - S * 0.24, S * (sy + 0.12), cx + S * 0.24, S * (sy + 0.14), G.wood, G.woodLt, G.woodDkk);
    let x = -0.22;
    let i = 0;
    while (x < 0.2) {
      const w = 0.025 + ((i * 37) % 3) * 0.008;
      const cols = [G.blood, G.velvet, G.moonDk, G.gGreen, G.woodLt][(i * 13) % 5];
      const h = 0.1 - ((i * 7) % 3) * 0.015;
      plate(put, cx + x * S, S * (sy + 0.12 - h), cx + (x + w) * S, S * (sy + 0.12), cols, mix(cols, '#ffffff', 0.25), mix(cols, '#000000', 0.4));
      x += w + 0.006; i++;
    }
  });
  // one book FLOATING off the shelf, glowing
  plate(put, cx + S * 0.3, S * 0.3, cx + S * 0.38, S * 0.4, G.blood, G.bloodLt, G.wine);
  stroke(put, cx + S * 0.3, S * 0.3, cx + S * 0.3, S * 0.4, 1, () => G.gold);
  [[0.34, 0.26], [0.4, 0.34]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(S * oy), G.velvetLt));
  // ladder
  stroke(put, cx - S * 0.3, S * 0.86, cx - S * 0.18, S * 0.2, S * 0.014, () => G.woodLt);
  stroke(put, cx - S * 0.34, S * 0.86, cx - S * 0.22, S * 0.2, S * 0.014, () => G.woodLt);
  for (let t = 0.1; t < 1; t += 0.12) put(Math.round(cx - S * 0.32 + t * S * 0.12), Math.round(S * (0.86 - t * 0.66)), G.woodLt);
}

// 12 · ARMOR DISPLAY — inert suit on a stand (which ones are real?).
function drawArmorDisplay(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  plate(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
  stroke(put, cx, S * 0.3, cx, S * 0.8, S * 0.016, () => G.woodDk);
  // cuirass + helm + arms on the stand
  plate(put, cx - S * 0.09, S * 0.38, cx + S * 0.09, S * 0.56, G.silver, G.moonLt, G.ironDk);
  stroke(put, cx, S * 0.4, cx, S * 0.54, 1, () => G.ironDkk);
  dome(put, cx, S * 0.3, S * 0.055, S * 0.055, G.silver, G.moonLt, G.ironDk);
  row(put, Math.round(S * 0.3), cx - S * 0.04, cx + S * 0.04, () => G.oil);
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.1, S * 0.4, cx + s * S * 0.14, S * 0.54, S * 0.028, () => G.silverDk);
    dome(put, cx + s * S * 0.145, S * 0.56, S * 0.022, S * 0.02, G.silver, G.moonLt, G.ironDk);
  });
  // halberd leaned against it
  stroke(put, cx + S * 0.2, S * 0.24, cx + S * 0.24, S * 0.8, S * 0.014, () => G.wood);
  for (let y = 0; y < S * 0.07; y++) row(put, Math.round(S * 0.2 + y), cx + S * 0.185, cx + S * 0.185 + S * (0.04 - Math.abs(y - S * 0.035) / S * 0.6), () => G.silver);
  // faulds skirt
  for (let y = 0; y < S * 0.06; y++) row(put, Math.round(S * 0.56 + y), cx - S * (0.08 + y / S * 0.2), cx + S * (0.08 + y / S * 0.2), (tx) => mix(G.silverDk, G.ironDkk, y / (S * 0.06)));
}

// 13 · BLOOD FOUNTAIN — courtyard fountain running red.
function drawBloodFountain(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.3);
  // basin
  ell(put, cx, cy + S * 0.12, S * 0.28, S * 0.1, (tx, ty) => mix(G.stoneLt, G.stoneDkk, ty + Math.abs(tx - 0.5) * 0.4));
  ell(put, cx, cy + S * 0.1, S * 0.24, S * 0.075, (tx, ty) => {
    let b = mix(G.bloodLt, G.wine, clamp(ty * 1.3, 0, 1));
    if (Math.sin(tx * 12 + ty * 5) > 0.75) b = mix(b, G.bloodLt, 0.6);
    return b;
  });
  // center column + upper bowl
  plate(put, cx - S * 0.03, cy - S * 0.14, cx + S * 0.03, cy + S * 0.06, G.stone, G.stoneLt, G.stoneDkk);
  ell(put, cx, cy - S * 0.16, S * 0.12, S * 0.045, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
  ell(put, cx, cy - S * 0.175, S * 0.09, S * 0.03, (tx, ty) => mix(G.bloodLt, G.wine, ty));
  // gargoyle spout on top spitting blood
  dome(put, cx, cy - S * 0.26, S * 0.045, S * 0.04, G.stone, G.stoneLt, G.stoneDk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy - S * 0.3, cx + s * S * 0.05, cy - S * 0.34, 2, () => G.stoneDk));
  stroke(put, cx, cy - S * 0.24, cx, cy - S * 0.2, 2, () => G.blood);
  [-1, 1].forEach(s => {
    for (let t = 0; t < 1; t += 0.1) put(Math.round(cx + s * t * S * 0.1), Math.round(cy - S * 0.22 + t * t * S * 0.06), G.bloodLt);
  });
  // drips over basin lip
  [[-0.2, 0.16], [0.22, 0.18]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S + S * 0.05, 1, () => G.blood));
}

// 14 · WEEPING STATUE — shrouded mourner, red tears.
function drawWeepingStatue(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  plate(put, cx - S * 0.14, S * 0.8, cx + S * 0.14, S * 0.88, G.stone, G.stoneLt, G.stoneDkk);
  // shrouded figure, head bowed into hands
  for (let y = 0; y < S * 0.46; y++) {
    const t = y / (S * 0.46), w = S * (0.06 + t * 0.09);
    row(put, Math.round(S * 0.34 + y), cx - w, cx + w, (tx) => {
      let b = mix(G.stoneLt, G.stoneDk, t * 0.8 + Math.abs(tx - 0.5) * 0.4);
      if (Math.sin(tx * 8 + t * 10) > 0.8) b = mix(b, G.stoneDkk, 0.4); // drape folds
      return b;
    });
  }
  dome(put, cx, S * 0.32, S * 0.07, S * 0.07, G.stone, G.stoneLt, G.stoneDk);
  // hands covering face
  ell(put, cx, S * 0.34, S * 0.05, S * 0.035, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
  // red tears seeping between the fingers
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.025, S * 0.37, cx + s * S * 0.035, S * 0.48, 1, () => G.blood);
    put(Math.round(cx + s * S * 0.035), Math.round(S * 0.49), G.bloodLt);
  });
  // moss + chips
  ell(put, cx - S * 0.08, S * 0.7, S * 0.03, S * 0.02, () => G.gGreen);
  put(Math.round(cx + S * 0.06), Math.round(S * 0.4), G.stoneDkk);
}

// 15 · PORTCULLIS GATE — iron-toothed gate, half raised.
function drawPortcullis(put, S) {
  const cx = S * 0.5;
  // stone arch surround
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.26 - S * 0.06, S * 0.2, cx + s * S * 0.26 + S * 0.06, S * 0.88, G.stone, G.stoneLt, G.stoneDkk));
  for (let a = 0.1; a < Math.PI - 0.1; a += 0.06) {
    const x = cx - Math.cos(a) * S * 0.26, y = S * 0.24 - Math.sin(a) * S * 0.1;
    ell(put, x, y, S * 0.035, S * 0.035, (tx, ty) => mix(G.stoneLt, G.stoneDk, ty));
  }
  // dark passage
  for (let y = S * 0.26; y < S * 0.88; y++) row(put, Math.round(y), cx - S * 0.2, cx + S * 0.2, () => mix(G.night, G.oil, (y - S * 0.26) / (S * 0.6)));
  // the portcullis, half-raised w/ spiked bottom
  for (let x = -0.18; x <= 0.18; x += 0.06) {
    stroke(put, cx + x * S, S * 0.26, cx + x * S, S * 0.6, S * 0.018, () => G.ironDk);
    // spike tips
    stroke(put, cx + x * S, S * 0.6, cx + x * S, S * 0.66, S * 0.012, () => G.iron);
    put(Math.round(cx + x * S), Math.round(S * 0.665), G.silver);
  }
  [0.32, 0.44, 0.56].forEach(yy => stroke(put, cx - S * 0.18, S * yy, cx + S * 0.18, S * yy, S * 0.016, () => G.iron));
  // chains going up
  [-1, 1].forEach(s => { for (let y = 0; y < S * 0.14; y += 4) ell(put, cx + s * S * 0.14, S * 0.14 + y, S * 0.01, S * 0.014, () => (y / 4) % 2 ? G.silverDk : G.silver); });
}

// 16 · CRIMSON RUNNER — the red carpet path (route decor).
function drawCrimsonRunner(put, S) {
  // stone floor around
  for (let y = S * 0.2; y < S * 0.9; y++) for (let x = S * 0.08; x < S * 0.92; x++) {
    let b = mix(G.stoneDk, G.stoneDkk, ((x * 7 + y * 13) % 97) / 97 * 0.5);
    if (x % 26 < 1.4 || y % 26 < 1.4) b = G.night;
    put(x, y, b);
  }
  // the runner with gold border + damask pattern
  for (let y = S * 0.2; y < S * 0.9; y++) {
    row(put, Math.round(y), S * 0.34, S * 0.66, (tx) => {
      if (tx < 0.07 || tx > 0.93) return mix(G.gold, G.goldDk, (y % 9) / 9);
      let b = mix(G.blood, G.wine, 0.3 + ((y | 0) % 5) * 0.06);
      const px = tx * 10, py = y / 8;
      if (Math.sin(px * 2) * Math.sin(py * 2) > 0.55) b = mix(b, G.bloodDk, 0.6);
      return b;
    });
  }
  // worn patch + a suspicious stain
  ell(put, S * 0.5, S * 0.5, S * 0.06, S * 0.03, () => G.wine);
}

// 17 · GREAT HEARTH — fireplace tall as a man, green ghost-fire.
function drawGreatHearth(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  // chimney breast + mantle
  plate(put, cx - S * 0.28, S * 0.2, cx + S * 0.28, S * 0.86, G.stone, G.stoneLt, G.stoneDkk);
  plate(put, cx - S * 0.3, S * 0.34, cx + S * 0.3, S * 0.4, G.stoneLt, G.moonLt, G.stoneDk);
  // firebox
  for (let y = 0; y < S * 0.4; y++) {
    const t = y / (S * 0.4);
    let w = S * 0.18; if (t < 0.3) { const a = t / 0.3; w = S * 0.18 * Math.sqrt(a * (2 - a)); }
    row(put, Math.round(S * 0.42 + y), cx - w, cx + w, () => mix(G.night, G.oil, t));
  }
  // GREEN flames (wrong fire)
  [[0, 0.72, 0.07], [-0.08, 0.75, 0.05], [0.08, 0.76, 0.045]].forEach(([ox, yy, s]) => {
    ell(put, cx + ox * S, S * yy, s * S * 0.6, s * S * 1.4, (tx, ty) => mix(G.gGreen, '#1c5c30', ty));
    ell(put, cx + ox * S, S * (yy + 0.02), s * S * 0.3, s * S * 0.7, (tx, ty) => mix('#c8ffd8', G.gGreen, ty));
  });
  // logs + andirons
  stroke(put, cx - S * 0.12, S * 0.8, cx + S * 0.12, S * 0.82, S * 0.03, () => G.woodDkk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.14, S * 0.76, cx + s * S * 0.14, S * 0.84, S * 0.016, () => G.ironDk));
  // mantle skulls + candles
  [[-0.2], [0.2]].forEach(([o]) => { dome(put, cx + o * S, S * 0.31, S * 0.028, S * 0.026, G.bone, '#ffffff', G.boneDk); [-1, 1].forEach(s => put(Math.round(cx + o * S + s * S * 0.01), Math.round(S * 0.305), G.oil)); });
  candleFlame(put, cx, S * 0.28, S * 0.03);
  stroke(put, cx, S * 0.3, cx, S * 0.34, 2, () => G.bone);
}

// 18 · WINE CELLAR RACK — barrels + bottle rack (some bottles aren't wine).
function drawWineRack(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.28);
  // two stacked barrels on their sides
  [[-0.14, 0.02], [0.16, 0.04]].forEach(([ox, oy]) => {
    const bx = cx + ox * S, by = cy + oy * S;
    for (let x = -0.11; x < 0.11; x += 0.01) {
      const t = (x + 0.11) / 0.22;
      const h = S * (0.09 + Math.sin(t * Math.PI) * 0.02);
      for (let y = -h; y < h; y++) put(Math.round(bx + x * S), Math.round(by + y), mix(G.woodLt, G.woodDkk, Math.abs(y) / h * 0.7 + 0.1));
    }
    [-0.07, 0.07].forEach(o => { for (let y = -S * 0.1; y < S * 0.1; y++) put(Math.round(bx + o * S), Math.round(by + y), G.ironDk); });
    ell(put, bx, by, S * 0.02, S * 0.02, (tx, ty) => mix(G.wine, G.oil, ty)); // bung stain
  });
  // bottle rack behind
  plate(put, cx - S * 0.26, cy - S * 0.34, cx + S * 0.28, cy - S * 0.1, G.woodDk, G.wood, G.woodDkk);
  for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 5; rx++) {
    const bx = cx - S * 0.2 + rx * S * 0.1, by = cy - S * 0.29 + ry * S * 0.075;
    ell(put, bx, by, S * 0.022, S * 0.022, (tx, ty) => {
      const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2;
      return d < 0.2 ? ((rx + ry) % 3 === 0 ? G.blood : G.night) : mix(G.woodDkk, G.oil, 0.5);
    });
  }
  // one dripping bottle
  stroke(put, cx + S * 0.1, cy - S * 0.22, cx + S * 0.1, cy - S * 0.14, 1, () => G.blood);
}

// 19 · JOUST LIST — the tilt barrier w/ heraldic banners (arena furniture).
function drawJoustList(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.3);
  // the tilt barrier (long rail) in perspective
  plate(put, cx - S * 0.34, cy - S * 0.02, cx + S * 0.34, cy + S * 0.1, G.wood, G.woodLt, G.woodDkk);
  row(put, Math.round(cy - S * 0.02), cx - S * 0.34, cx + S * 0.34, () => G.woodLt);
  // striped cloth skirt
  for (let y = 0; y < S * 0.12; y++) row(put, Math.round(cy + S * 0.1 + y), cx - S * 0.34, cx + S * 0.34, (tx) => {
    const st = Math.floor(tx * 14) % 2;
    return mix(st ? G.blood : G.bone, G.oil, y / (S * 0.12) * 0.4);
  });
  // banner posts at both ends
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.32, cy - S * 0.34, cx + s * S * 0.32, cy + S * 0.2, S * 0.016, () => G.woodDk);
    ell(put, cx + s * S * 0.32, cy - S * 0.36, S * 0.014, S * 0.014, (tx, ty) => mix(G.goldLt, G.goldDk, ty));
    // swallowtail banner
    for (let y = 0; y < S * 0.12; y++) {
      const t = y / (S * 0.12);
      const reach = S * (0.12 - (t > 0.7 ? (t - 0.7) * 0.24 : 0));
      row(put, Math.round(cy - S * 0.32 + y), cx + s * S * 0.32, cx + s * S * 0.32 + s * reach, (tx) => mix(s < 0 ? G.blood : G.velvet, G.oil, t * 0.4));
    }
    batIcon(put, cx + s * S * 0.37, cy - S * 0.27, S * 0.025, G.gold);
  });
  // lance rack leaning at one end
  [[-0.02], [0.02]].forEach(([o]) => stroke(put, cx - S * 0.26 + o * S * 3, cy + S * 0.2, cx - S * 0.2 + o * S * 3, cy - S * 0.24, S * 0.012, () => G.woodLt));
}

// 20 · BAT ROOST — rafter beam dense with sleeping bats.
function drawBatRoost(put, S) {
  const cx = S * 0.5;
  // rafter beam
  plate(put, cx - S * 0.34, S * 0.24, cx + S * 0.34, S * 0.34, G.woodDk, G.wood, G.woodDkk);
  stroke(put, cx - S * 0.34, S * 0.24, cx + S * 0.34, S * 0.24, 2, () => G.woodLt);
  // hanging sleeping bats (upside down teardrops)
  let seed = 3; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 9; i++) {
    const bx = cx - S * 0.3 + i * S * 0.075 + (rnd() - 0.5) * S * 0.02;
    const len = S * (0.1 + rnd() * 0.05);
    stroke(put, bx, S * 0.34, bx, S * 0.34 + len * 0.3, 1, () => G.furDk);
    // wrapped wings body
    for (let y = 0; y < len; y++) {
      const t = y / len, w = S * 0.025 * Math.sin(Math.min(1, t * 1.3) * Math.PI);
      row(put, Math.round(S * 0.34 + len * 0.3 + y), bx - w, bx + w, (tx) => mix(G.furLt, G.furDk, t * 0.6 + Math.abs(tx - 0.5)));
    }
    // one bat AWAKE with red eyes
    if (i === 5) { put(Math.round(bx - 1), Math.round(S * 0.34 + len * 0.75), G.blood); put(Math.round(bx + 1), Math.round(S * 0.34 + len * 0.75), G.blood); }
  }
  // guano pile below (flavor) + one flying off
  ell(put, cx + S * 0.05, S * 0.86, S * 0.06, S * 0.02, (tx, ty) => mix(G.bone, G.boneDk, ty));
  batIcon(put, cx + S * 0.28, S * 0.56, S * 0.05, G.fur);
}

// ========================================================================
const LIST = [
  { n: 1, name: 'THE THRONE', role: 'set piece', draw: drawThrone },
  { n: 2, name: "COUNT'S COFFIN", role: 'set piece', draw: drawCoffin },
  { n: 3, name: 'CANDELABRA', role: 'path light', draw: drawCandelabra },
  { n: 4, name: 'CHANDELIER', role: 'hall light', draw: drawChandelierDecor },
  { n: 5, name: 'GRAND MIRROR', role: 'haunted prop', draw: drawGrandMirror },
  { n: 6, name: 'PORTRAIT ROW', role: 'gallery wall', draw: drawPortraitRow },
  { n: 7, name: 'BANQUET TABLE', role: 'great hall', draw: drawBanquetTable },
  { n: 8, name: 'GREAT ORGAN', role: 'set piece', draw: drawGreatOrgan },
  { n: 9, name: 'LANCET WINDOW', role: 'moonlight source', draw: drawLancetWindow },
  { n: 10, name: 'GOTHIC COLUMN', role: 'structure', draw: drawGothicColumn },
  { n: 11, name: 'LIBRARY STACK', role: 'library', draw: drawLibraryStack },
  { n: 12, name: 'ARMOR DISPLAY', role: 'hall decor', draw: drawArmorDisplay },
  { n: 13, name: 'BLOOD FOUNTAIN', role: 'courtyard', draw: drawBloodFountain },
  { n: 14, name: 'WEEPING STATUE', role: 'courtyard', draw: drawWeepingStatue },
  { n: 15, name: 'PORTCULLIS', role: 'gate', draw: drawPortcullis },
  { n: 16, name: 'CRIMSON RUNNER', role: 'route carpet', draw: drawCrimsonRunner },
  { n: 17, name: 'GREAT HEARTH', role: 'green fire', draw: drawGreatHearth },
  { n: 18, name: 'WINE RACK', role: 'cellar', draw: drawWineRack },
  { n: 19, name: 'JOUST LIST', role: 'ARENA furniture', draw: drawJoustList },
  { n: 20, name: 'BAT ROOST', role: 'rafter flavor', draw: drawBatRoost },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'castle_decor_options.png',
  title: 'VAMPIRE CASTLE — DECOR CANDIDATES (pick any, tell me numbers to cut/change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
