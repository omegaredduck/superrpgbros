// artdev/pyramid/render_pyramid_decor.js — 20 numbered PYRAMID PLUNDER
// decoration candidates, one PNG grid.
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, wraps, trim, glyphs, horusEye, nemes, flame } = KIT;

// 1 · OBELISK — towering glyph needle.
function drawObelisk(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
  for (let y = S * 0.14; y < S * 0.82; y++) {
    const t = (y - S * 0.14) / (S * 0.68), w = S * (0.045 + t * 0.045);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(E.stoneLt, E.stoneDk, tx * 0.8 + t * 0.15));
  }
  for (let y = 0; y < S * 0.07; y++) row(put, Math.round(S * 0.07 + y), cx - y * 0.6, cx + y * 0.6, (tx) => mix(E.goldLt, E.goldDk, y / (S * 0.07)));
  glyphs(put, cx - S * 0.035, S * 0.24, cx + S * 0.04, S * 0.78, E.stoneDkk);
}

// 2 · SARCOPHAGUS — sealed golden coffin on a bier.
function drawSarcophagus(put, S) {
  const cx = S * 0.5, cy = S * 0.55;
  shadow(put, S, cx, S * 0.26);
  plate(put, cx - S * 0.24, cy + S * 0.14, cx + S * 0.24, cy + S * 0.24, E.stone, E.stoneLt, E.stoneDkk);
  // coffin (angled top-down-ish side view)
  for (let y = 0; y < S * 0.28; y++) {
    const t = y / (S * 0.28);
    const w = S * (0.14 + Math.sin(t * Math.PI) * 0.06);
    row(put, Math.round(cy - S * 0.14 + y), cx - w, cx + w, (tx) => mix(E.goldLt, E.goldDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.55));
  }
  nemes(put, cx, cy - S * 0.08, S * 0.08, S * 0.06, E.lapis, E.gold);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, cy - S * 0.0, cx + s * S * 0.015, cy - S * 0.0, 1, () => E.oil));
  // crossed crook + flail
  stroke(put, cx - S * 0.08, cy + S * 0.16, cx + S * 0.06, cy + S * 0.04, S * 0.02, () => E.lapis);
  stroke(put, cx + S * 0.08, cy + S * 0.16, cx - S * 0.06, cy + S * 0.04, S * 0.02, () => E.goldDk);
  trim(put, cx - S * 0.15, cx + S * 0.15, Math.round(cy + S * 0.1), 3);
}

// 3 · CANOPIC SET — four little organ jars on a shelf stone.
function drawCanopicSet(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.26, cy + S * 0.1, cx + S * 0.26, cy + S * 0.18, E.stone, E.stoneLt, E.stoneDkk);
  [-0.19, -0.065, 0.065, 0.19].forEach((o, i) => {
    const jx = cx + o * S;
    for (let y = 0; y < S * 0.16; y++) {
      const t = y / (S * 0.16), w = S * (0.045 + Math.sin(t * Math.PI) * 0.02);
      row(put, Math.round(cy - S * 0.06 + y), jx - w, jx + w, (tx) => mix(E.wrapLt, E.wrapDk, t * 0.7 + Math.abs(tx - 0.5) * 0.4));
    }
    // lids: jackal / falcon / human / baboon → simplified heads
    const cols = [[E.jackal, E.jackalDk], [E.lapis, E.lapisDk], [E.skin, E.skinDk], [E.stone, E.stoneDk]][i];
    dome(put, jx, cy - S * 0.09, S * 0.035, S * 0.03, cols[0], mix(cols[0], '#ffffff', 0.4), cols[1]);
    put(Math.round(jx - S * 0.012), Math.round(cy - S * 0.095), E.oil);
  });
}

// 4 · TREASURE PILE — the plunder: gold heap w/ goblets + gems.
function drawTreasurePile(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  shadow(put, S, cx, S * 0.28);
  // mound of coins
  dome(put, cx, cy + S * 0.06, S * 0.26, S * 0.14, E.gold, E.goldLt, E.goldDkk);
  dome(put, cx - S * 0.12, cy + S * 0.1, S * 0.12, S * 0.07, E.goldLt, '#fffbe0', E.goldDk);
  // coin texture
  for (let i = 0; i < 26; i++) {
    const a = (i * 2.4) % 6.28, r = ((i * 37) % 100) / 100;
    const x = cx + Math.cos(a) * r * S * 0.22, y = cy + S * 0.06 + Math.sin(a) * r * S * 0.1;
    ell(put, x, y, S * 0.016, S * 0.011, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  }
  // goblet + crown + gems poking out
  stroke(put, cx + S * 0.14, cy - S * 0.02, cx + S * 0.14, cy + S * 0.06, S * 0.02, () => E.goldDk);
  ell(put, cx + S * 0.14, cy - S * 0.05, S * 0.035, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  ell(put, cx - S * 0.06, cy - S * 0.04, S * 0.045, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  [[-0.08], [-0.05], [-0.02]].forEach(([o]) => stroke(put, cx + o * S, cy - S * 0.06, cx + o * S, cy - S * 0.09, 2, () => E.gold));
  [[0.02, -0.02, E.red], [-0.16, 0.02, E.lapisLt], [0.08, 0.0, E.curse]].forEach(([ox, oy, c]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, () => c); put(Math.round(cx + ox * S - 1), Math.round(cy + oy * S - 1), '#ffffff');
  });
}

// 5 · GILDED CHEST — ornate treasure chest, lid cracked with glow.
function drawGildedChest(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.18, cy - S * 0.02, cx + S * 0.18, cy + S * 0.18, E.red, E.redLt, E.redDk);
  [(-0.12), 0, 0.12].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.18; y++) put(Math.round(cx + o * S), y, E.goldDk); });
  trim(put, cx - S * 0.18, cx + S * 0.18, Math.round(cy + S * 0.14), 3);
  // domed lid slightly open — light leaks
  dome(put, cx, cy - S * 0.08, S * 0.19, S * 0.09, E.redDk, E.red, E.redDk);
  trim(put, cx - S * 0.19, cx + S * 0.19, Math.round(cy - S * 0.05), 3);
  row(put, Math.round(cy - S * 0.015), cx - S * 0.17, cx + S * 0.17, () => E.goldLt);
  row(put, Math.round(cy - S * 0.005), cx - S * 0.15, cx + S * 0.15, () => '#fffbe0');
  // hasp + lock
  plate(put, cx - S * 0.025, cy - S * 0.02, cx + S * 0.025, cy + S * 0.06, E.gold, E.goldLt, E.goldDkk);
  put(Math.round(cx), Math.round(cy + S * 0.03), E.oil);
}

// 6 · BRAZIER — standing bronze fire bowl (lights the tomb).
function drawBrazier(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  [-1, 0, 1].forEach(s => stroke(put, cx, S * 0.62, cx + s * S * 0.1, S * 0.86, S * 0.02, () => E.goldDkk));
  ell(put, cx, S * 0.6, S * 0.13, S * 0.05, (tx, ty) => mix(E.goldLt, E.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
  ell(put, cx, S * 0.575, S * 0.1, S * 0.03, () => E.tombDk);
  flame(put, cx, S * 0.46, S * 0.09);
  flame(put, cx - S * 0.05, S * 0.5, S * 0.05);
  flame(put, cx + S * 0.05, S * 0.51, S * 0.045);
  // embers
  [[0.08, 0.36], [-0.06, 0.33], [0.01, 0.3]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(oy * S), E.flameLt));
}

// 7 · PHARAOH COLOSSUS — seated statue, hands on knees.
function drawPharaohColossus(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  plate(put, cx - S * 0.2, S * 0.8, cx + S * 0.2, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
  // throne + seated body
  plate(put, cx - S * 0.16, S * 0.5, cx + S * 0.16, S * 0.8, E.stoneDk, E.stone, E.stoneDkk);
  dome(put, cx, S * 0.46, S * 0.12, S * 0.14, E.stone, E.stoneLt, E.stoneDkk);
  // lap + legs
  plate(put, cx - S * 0.14, S * 0.62, cx + S * 0.14, S * 0.7, E.stoneLt, E.sandLt, E.stoneDk);
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.09 - S * 0.035, S * 0.7, cx + s * S * 0.09 + S * 0.035, S * 0.8, E.stone, E.stoneLt, E.stoneDkk));
  // arms on knees
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.12, S * 0.52, cx + s * S * 0.12, S * 0.64, S * 0.035, () => E.stoneDk));
  // nemes head
  dome(put, cx, S * 0.32, S * 0.08, S * 0.08, E.stone, E.stoneLt, E.stoneDk);
  nemes(put, cx, S * 0.28, S * 0.075, S * 0.06, E.stoneLt, E.stoneDk);
  stroke(put, cx, S * 0.38, cx, S * 0.42, 2, () => E.stoneDkk); // beard
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.035, S * 0.325, cx + s * S * 0.012, S * 0.325, 1, () => E.stoneDkk));
  // weathering
  put(Math.round(cx - S * 0.06), Math.round(S * 0.3), E.tombDk);
  glyphs(put, cx - S * 0.13, S * 0.72, cx + S * 0.13, S * 0.79, E.stoneDkk);
}

// 8 · ANUBIS STATUE — standing jackal god w/ was-staff (boss foreshadow).
function drawAnubisStatue(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  plate(put, cx - S * 0.15, S * 0.82, cx + S * 0.15, S * 0.9, E.obsidian, E.jackalLt, E.oil);
  // obsidian body
  plate(put, cx - S * 0.07, S * 0.42, cx + S * 0.07, S * 0.82, E.jackal, E.jackalLt, E.jackalDk);
  trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(S * 0.46), 4);
  stroke(put, cx - S * 0.05, S * 0.56, cx + S * 0.05, S * 0.56, 2, () => E.goldDk); // belt
  // jackal head
  dome(put, cx, S * 0.32, S * 0.07, S * 0.07, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.05, S * 0.34, cx - S * 0.14, S * 0.36, S * 0.03, () => E.jackalDk); // long snout
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, S * 0.27, cx + s * S * 0.065, S * 0.18, S * 0.03, () => E.jackal)); // tall ears
  put(Math.round(cx - S * 0.03), Math.round(S * 0.31), E.gold); // eye
  // was-staff
  stroke(put, cx + S * 0.13, S * 0.3, cx + S * 0.13, S * 0.84, S * 0.018, () => E.goldDk);
  stroke(put, cx + S * 0.13, S * 0.3, cx + S * 0.17, S * 0.27, S * 0.02, () => E.gold);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.13, S * 0.84, cx + S * 0.13 + s * S * 0.025, S * 0.87, 2, () => E.goldDk));
}

// 9 · PAPYRUS COLUMN — lotus-capital pillar, half broken.
function drawPapyrusColumn(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.9, E.stone, E.stoneLt, E.stoneDkk);
  for (let y = S * 0.3; y < S * 0.82; y++) {
    row(put, Math.round(y), cx - S * 0.075, cx + S * 0.075, (tx) => {
      const f = Math.sin(tx * Math.PI * 4);
      let b = mix(E.sandLt, E.sand, 0.5 + f * 0.5);
      if (tx > 0.85) b = E.stoneDk;
      return b;
    });
  }
  // banded ties + painted rings
  [[0.36, E.lapis], [0.39, E.red], [0.42, E.gold]].forEach(([yy, c]) => row(put, Math.round(S * yy * 2), cx - S * 0.075, cx + S * 0.075, () => c));
  // flared lotus capital
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * (0.13 - t * 0.05);
    row(put, Math.round(S * 0.2 + y), cx - w, cx + w, (tx) => mix(E.turq, E.turqDk, t + Math.abs(tx - 0.5) * 0.4));
  }
  // broken crown edge
  for (let x = -0.12; x < 0.13; x += 0.02) {
    const h = S * (0.17 - Math.abs(Math.sin(x * 80)) * 0.03);
    for (let y = h; y < S * 0.21; y++) put(Math.round(cx + x * S), Math.round(y), E.stoneDk);
  }
  // fallen chunk
  dome(put, cx + S * 0.22, S * 0.85, S * 0.07, S * 0.045, E.sand, E.sandLt, E.sandDkk);
}

// 10 · GLYPH WALL — carved story panel (wall segment).
function drawGlyphWall(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.3);
  plate(put, cx - S * 0.3, S * 0.3, cx + S * 0.3, S * 0.86, E.sand, E.sandLt, E.sandDkk);
  stroke(put, cx - S * 0.3, S * 0.3, cx + S * 0.3, S * 0.3, 3, () => E.stoneDk);
  // registers of glyphs
  glyphs(put, cx - S * 0.27, S * 0.34, cx + S * 0.27, S * 0.5, E.sandDkk);
  row(put, Math.round(S * 0.52), cx - S * 0.28, cx + S * 0.28, () => E.stoneDk);
  // painted figures band
  [[-0.18, E.red], [-0.05, E.lapis], [0.08, E.turq], [0.2, E.red]].forEach(([o, c]) => {
    const fx = cx + o * S;
    dome(put, fx, S * 0.6, S * 0.025, S * 0.025, E.skin, '#e8b088', E.skinDk);
    plate(put, fx - S * 0.02, S * 0.62, fx + S * 0.02, S * 0.7, c, mix(c, '#ffffff', 0.3), mix(c, '#000000', 0.4));
    stroke(put, fx, S * 0.7, fx - S * 0.02, S * 0.75, 2, () => E.skinDk);
    stroke(put, fx, S * 0.7, fx + S * 0.02, S * 0.75, 2, () => E.skinDk);
  });
  row(put, Math.round(S * 0.77), cx - S * 0.28, cx + S * 0.28, () => E.stoneDk);
  glyphs(put, cx - S * 0.27, S * 0.79, cx + S * 0.27, S * 0.85, E.sandDkk);
  horusEye(put, cx, S * 0.44, S * 0.03, E.lapisLt, E.lapisDk);
}

// 11 · SPHINX — recumbent guardian statue (landmark).
function drawSphinx(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.3);
  // lion body lying
  ell(put, cx + S * 0.06, cy + S * 0.04, S * 0.26, S * 0.12, (tx, ty) => mix(E.sand, E.sandDkk, clamp(ty * 1.2, 0, 1)));
  // front paws extended
  [[-0.02], [0.06]].forEach(([o]) => plate(put, cx - S * 0.24, cy + S * 0.08 + o * S, cx + S * 0.02, cy + S * 0.13 + o * S, E.sandLt, E.sand, E.sandDkk));
  // haunch
  dome(put, cx + S * 0.24, cy + S * 0.02, S * 0.09, S * 0.09, E.sand, E.sandLt, E.sandDkk);
  // head w/ nemes
  dome(put, cx - S * 0.14, cy - S * 0.14, S * 0.09, S * 0.09, E.sand, E.sandLt, E.sandDk);
  nemes(put, cx - S * 0.14, cy - S * 0.19, S * 0.085, S * 0.07, E.sandLt, E.sandDk);
  [-1, 1].forEach(s => stroke(put, cx - S * 0.14 + s * S * 0.04, cy - S * 0.15, cx - S * 0.14 + s * S * 0.015, cy - S * 0.15, 1, () => E.sandDkk));
  // missing nose (of course)
  put(Math.round(cx - S * 0.17), Math.round(cy - S * 0.12), E.sandDkk);
  put(Math.round(cx - S * 0.18), Math.round(cy - S * 0.11), E.sandDk);
  stroke(put, cx - S * 0.12, cy - S * 0.08, cx - S * 0.16, cy - S * 0.08, 1, () => E.sandDkk);
}

// 12 · PALM CLUSTER — oasis date palms.
function drawPalmCluster(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // two trunks
  [[-0.06, 0.9, -0.14], [0.08, 0.9, 0.16]].forEach(([o, , lean]) => {
    for (let t = 0; t < 1; t += 0.05) {
      const x = cx + o * S + Math.sin(t * 1.2) * lean * S, y = S * 0.86 - t * S * 0.5;
      ell(put, x, y, S * (0.03 - t * 0.008), S * 0.02, (tx, ty) => mix(E.stoneDk, E.stoneDkk, (t * 3 % 1) < 0.5 ? 0.2 : 0.6));
    }
  });
  // frond crowns
  [[-0.2, 0.34], [0.24, 0.32]].forEach(([ox, oy]) => {
    const px = cx + ox * S, py = S * oy;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const fx = px + Math.cos(a) * S * 0.14, fy = py + Math.sin(a) * S * 0.07 + S * 0.03;
      stroke(put, px, py, fx, fy, S * 0.03, (t) => mix('#5fae4a', '#2c6e28', t));
      stroke(put, fx, fy, fx + Math.cos(a) * S * 0.03, fy + S * 0.04, S * 0.02, () => '#245222');
    }
    // dates
    ell(put, px, py + S * 0.045, S * 0.03, S * 0.02, () => E.red);
  });
}

// 13 · OASIS POOL — reedy water hole (drink = tiny regen? decor).
function drawOasisPool(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  // sandy rim
  ell(put, cx, cy, S * 0.3, S * 0.16, (tx, ty) => mix(E.sandLt, E.sandDk, ty));
  // water
  ell(put, cx, cy, S * 0.24, S * 0.115, (tx, ty) => {
    let b = mix(E.turqLt, E.lapisDk, clamp(ty * 1.3, 0, 1));
    if (Math.sin(tx * 14 + ty * 6) > 0.8) b = mix(b, '#ffffff', 0.4);
    return b;
  });
  // reeds
  [[-0.26, -0.02], [-0.3, 0.04], [0.27, 0.0], [0.31, 0.06]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.015, cy + oy * S - S * 0.14, 2, () => '#4a8a3a');
    ell(put, cx + ox * S + S * 0.015, cy + oy * S - S * 0.15, S * 0.012, S * 0.025, () => '#6e5230');
  });
  // lily + sparkle
  ell(put, cx - S * 0.06, cy - S * 0.02, S * 0.025, S * 0.015, () => '#5fae4a');
  put(Math.round(cx + S * 0.08), Math.round(cy + S * 0.02), '#ffffff');
}

// 14 · RAIDER CAMP — rival plunderers' tent + bedroll + lantern.
function drawRaiderCamp(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.28);
  // tent (canvas wedge)
  for (let y = 0; y < S * 0.24; y++) {
    const t = y / (S * 0.24), w = t * S * 0.22;
    row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w + S * 0.02, (tx) => {
      let b = mix(E.wrapLt, E.wrapDk, t * 0.6 + Math.abs(tx - 0.5) * 0.3);
      if (tx > 0.46 && tx < 0.54 && t > 0.55) b = E.tombDk; // opening
      return b;
    });
  }
  stroke(put, cx, cy - S * 0.18, cx, cy - S * 0.26, 2, () => E.stoneDkk);
  ell(put, cx, cy - S * 0.27, S * 0.02, S * 0.014, () => E.red); // pennant
  // bedroll
  ell(put, cx - S * 0.22, cy + S * 0.14, S * 0.09, S * 0.03, (tx, ty) => mix(E.red, E.redDk, ty));
  ell(put, cx - S * 0.29, cy + S * 0.13, S * 0.025, S * 0.025, (tx, ty) => mix(E.wrapLt, E.wrapDk, ty));
  // crate + lantern
  plate(put, cx + S * 0.18, cy + S * 0.04, cx + S * 0.28, cy + S * 0.14, E.stoneDk, E.stone, E.stoneDkk);
  stroke(put, cx + S * 0.23, cy + S * 0.0, cx + S * 0.23, cy + S * 0.04, 1, () => E.goldDkk);
  ell(put, cx + S * 0.23, cy - S * 0.02, S * 0.02, S * 0.025, (tx, ty) => mix(E.flameLt, E.flameDk, ty));
  // cold firepit
  ell(put, cx, cy + S * 0.16, S * 0.05, S * 0.02, () => E.tombDk);
  [[-0.04], [0.03]].forEach(([o]) => stroke(put, cx + o * S, cy + S * 0.15, cx + o * S + S * 0.03, cy + S * 0.17, 1, () => E.stoneDkk));
}

// 15 · DUNE DRIFT — banked sand mound (soft cover / route shaper).
function drawDuneDrift(put, S) {
  const cx = S * 0.5, cy = S * 0.62;
  dome(put, cx, cy, S * 0.3, S * 0.13, E.sand, E.sandLt, E.sandDkk);
  dome(put, cx + S * 0.16, cy + S * 0.04, S * 0.15, S * 0.07, E.sandLt, '#fce8c0', E.sandDk);
  // ripple lines
  for (let i = 0; i < 5; i++) {
    const yy = cy - S * 0.06 + i * S * 0.035;
    for (let x = -0.26; x < 0.26; x += 0.02) {
      const wob = Math.sin(x * 14 + i) * S * 0.008;
      if ((x * 50 | 0) % 2 === 0) put(Math.round(cx + x * S), Math.round(yy + wob), E.sandDk);
    }
  }
  // wind-blown crest grains
  [[0.3, -0.1], [0.34, -0.06], [0.32, -0.13]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
}

// 16 · FALLEN COLOSSUS — half-buried giant stone head.
function drawFallenColossus(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // sand it sank into
  dome(put, cx, cy + S * 0.16, S * 0.3, S * 0.09, E.sand, E.sandLt, E.sandDkk);
  // tilted giant head
  dome(put, cx, cy - S * 0.02, S * 0.19, S * 0.2, E.stone, E.stoneLt, E.stoneDkk);
  nemes(put, cx - S * 0.02, cy - S * 0.14, S * 0.17, S * 0.1, E.stoneLt, E.stoneDk);
  // face — weathered, one eye buried
  stroke(put, cx - S * 0.1, cy - S * 0.02, cx - S * 0.02, cy - S * 0.02, 2, () => E.stoneDkk);
  ell(put, cx - S * 0.06, cy + S * 0.0, S * 0.03, S * 0.02, () => E.tombDk);
  stroke(put, cx - S * 0.02, cy + S * 0.08, cx + S * 0.06, cy + S * 0.09, 2, () => E.stoneDkk);
  stroke(put, cx, cy + S * 0.14, cx + S * 0.08, cy + S * 0.14, 2, () => E.stoneDk); // lips half sunk
  // big crack + chips
  stroke(put, cx + S * 0.08, cy - S * 0.18, cx + S * 0.14, cy - S * 0.02, 1, () => E.stoneDkk);
  dome(put, cx - S * 0.26, cy + S * 0.14, S * 0.05, S * 0.03, E.stone, E.stoneLt, E.stoneDkk);
  // beard chunk lying separate
  plate(put, cx + S * 0.22, cy + S * 0.1, cx + S * 0.28, cy + S * 0.18, E.stoneDk, E.stone, E.stoneDkk);
}

// 17 · TRAP PLATE — pressure tile + dart holes (the armed tomb).
function drawTrapPlate(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // floor context
  plate(put, cx - S * 0.28, cy - S * 0.1, cx + S * 0.28, cy + S * 0.24, E.stone, E.stoneLt, E.stoneDkk);
  // the pressure plate, slightly sunken
  plate(put, cx - S * 0.12, cy - S * 0.0, cx + S * 0.12, cy + S * 0.14, E.sandDk, E.stoneDk, E.tombDk);
  stroke(put, cx - S * 0.12, cy - S * 0.0, cx + S * 0.12, cy - S * 0.0, 1, () => E.oil);
  horusEye(put, cx, cy + S * 0.07, S * 0.03, E.redLt, E.redDk);
  // dart wall column at the side
  plate(put, cx + S * 0.2, cy - S * 0.34, cx + S * 0.28, cy - S * 0.1, E.sand, E.sandLt, E.sandDkk);
  [[-0.28], [-0.2]].forEach(([oy]) => { ell(put, cx + S * 0.24, cy + oy * S, S * 0.015, S * 0.012, () => E.oil); });
  // a dart mid-flight + old skeleton hand
  stroke(put, cx + S * 0.18, cy - S * 0.27, cx + S * 0.08, cy - S * 0.25, 1, () => E.bone);
  stroke(put, cx - S * 0.2, cy + S * 0.18, cx - S * 0.14, cy + S * 0.16, 1, () => E.bone);
  [[-0.14, 0.15], [-0.13, 0.17]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.bone));
}

// 18 · SCALES OF JUDGMENT — golden scales weighing heart vs feather.
function drawScales(put, S) {
  const cx = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  plate(put, cx - S * 0.12, S * 0.82, cx + S * 0.12, S * 0.88, E.stone, E.stoneLt, E.stoneDkk);
  stroke(put, cx, S * 0.3, cx, S * 0.82, S * 0.02, () => E.goldDk);
  // crossbeam tilted (heart heavier)
  stroke(put, cx - S * 0.22, S * 0.36, cx + S * 0.22, S * 0.3, S * 0.018, () => E.gold);
  ell(put, cx, S * 0.28, S * 0.03, S * 0.03, (tx, ty) => mix(E.goldLt, E.goldDk, ty));
  // chains + pans
  [[-0.22, 0.36, 0.5], [0.22, 0.3, 0.44]].forEach(([ox, oy, py]) => {
    [-1, 1].forEach(s => stroke(put, cx + ox * S, S * oy, cx + ox * S + s * S * 0.05, S * py, 1, () => E.goldDkk));
    ell(put, cx + ox * S, S * (py + 0.015), S * 0.07, S * 0.025, (tx, ty) => mix(E.goldLt, E.goldDkk, ty));
  });
  // heart (left, lower) + feather (right)
  ell(put, cx - S * 0.22, S * 0.48, S * 0.028, S * 0.025, (tx, ty) => mix(E.redLt, E.redDk, ty));
  stroke(put, cx + S * 0.2, S * 0.4, cx + S * 0.24, S * 0.44, 1, () => E.turqLt);
  stroke(put, cx + S * 0.21, S * 0.4, cx + S * 0.23, S * 0.44, 1, () => E.turq);
  // judging eye on the post
  horusEye(put, cx, S * 0.6, S * 0.03, E.lapisLt, E.lapisDk);
}

// 19 · PLUNDER CART — wooden cart heaped with stolen goods.
function drawPlunderCart(put, S) {
  const cx = S * 0.5, cy = S * 0.58;
  shadow(put, S, cx, S * 0.26);
  // cart bed
  plate(put, cx - S * 0.22, cy - S * 0.02, cx + S * 0.22, cy + S * 0.12, E.stoneDk, E.stone, E.tombDk);
  [(-0.15), 0, 0.15].forEach(o => { for (let y = Math.round(cy - S * 0.02); y < cy + S * 0.12; y++) put(Math.round(cx + o * S), y, E.tombDk); });
  // wheels
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.14, cy + S * 0.16, S * 0.07, S * 0.07, (tx, ty) => { const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2; return d > 0.14 && d <= 0.25 ? E.stoneDkk : null; });
    [-1, 1].forEach(k => stroke(put, cx + s * S * 0.14 - k * S * 0.045, cy + S * 0.12, cx + s * S * 0.14 + k * S * 0.045, cy + S * 0.2, 1, () => E.stoneDk));
    bolt(put, cx + s * S * 0.14, cy + S * 0.16, S * 0.015, E.gold, E.goldDkk);
  });
  // handles
  stroke(put, cx + S * 0.22, cy + S * 0.02, cx + S * 0.32, cy + S * 0.06, S * 0.015, () => E.stoneDk);
  // heaped loot
  dome(put, cx, cy - S * 0.08, S * 0.18, S * 0.09, E.gold, E.goldLt, E.goldDkk);
  ell(put, cx - S * 0.08, cy - S * 0.14, S * 0.04, S * 0.03, (tx, ty) => mix(E.turqLt, E.turqDk, ty)); // vase
  plate(put, cx + S * 0.04, cy - S * 0.18, cx + S * 0.1, cy - S * 0.1, E.lapis, E.lapisLt, E.lapisDk); // lapis block
  [[-0.14, -0.08], [0.14, -0.06], [0.0, -0.04]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.016, S * 0.012, () => E.goldLt));
}

// 20 · URN CLUSTER — painted pottery stash (smashable flavor).
function drawUrnCluster(put, S) {
  const cx = S * 0.5, cy = S * 0.6;
  shadow(put, S, cx, S * 0.26);
  // big amphora
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.05 + Math.sin(Math.min(1, t * 1.15) * Math.PI) * 0.1);
    row(put, Math.round(cy - S * 0.16 + y), cx - w - S * 0.06, cx + w - S * 0.06, (tx) => {
      let b = mix(E.stoneLt, E.stoneDk, t * 0.6 + Math.abs(tx - 0.5) * 0.5);
      if (t > 0.3 && t < 0.42) b = E.red;
      if (t > 0.46 && t < 0.54) b = E.lapisDk;
      return b;
    });
  }
  ell(put, cx - S * 0.06, cy - S * 0.17, S * 0.045, S * 0.02, (tx, ty) => mix(E.stoneDk, E.tombDk, ty));
  [-1, 1].forEach(s => stroke(put, cx - S * 0.06 + s * S * 0.1, cy - S * 0.1, cx - S * 0.06 + s * S * 0.13, cy - S * 0.02, 2, () => E.stoneDk));
  // small pot + cracked pot
  for (let y = 0; y < S * 0.14; y++) {
    const t = y / (S * 0.14), w = S * (0.03 + Math.sin(t * Math.PI) * 0.05);
    row(put, Math.round(cy + y), cx + S * 0.12 - w, cx + S * 0.12 + w, (tx) => mix(E.sand, E.sandDkk, t * 0.7 + Math.abs(tx - 0.5) * 0.4));
  }
  row(put, Math.round(cy + S * 0.05), cx + S * 0.05, cx + S * 0.19, () => E.turqDk);
  // shattered one — shards + spilled grain
  [[0.2, 0.2], [0.26, 0.22], [0.23, 0.17]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.03, cy + oy * S + S * 0.02, 2, () => E.stoneDk));
  ell(put, cx + S * 0.24, cy + S * 0.24, S * 0.05, S * 0.02, (tx, ty) => mix(E.sandLt, E.sandDk, ty));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'OBELISK', role: 'landmark', draw: drawObelisk },
  { n: 2, name: 'SARCOPHAGUS', role: 'set piece', draw: drawSarcophagus },
  { n: 3, name: 'CANOPIC SET', role: 'tomb shelf', draw: drawCanopicSet },
  { n: 4, name: 'TREASURE PILE', role: 'PLUNDER (lootable)', draw: drawTreasurePile },
  { n: 5, name: 'GILDED CHEST', role: 'PLUNDER (lootable)', draw: drawGildedChest },
  { n: 6, name: 'BRAZIER', role: 'light source', draw: drawBrazier },
  { n: 7, name: 'PHARAOH COLOSSUS', role: 'landmark', draw: drawPharaohColossus },
  { n: 8, name: 'ANUBIS STATUE', role: 'boss foreshadow', draw: drawAnubisStatue },
  { n: 9, name: 'PAPYRUS COLUMN', role: 'ruins', draw: drawPapyrusColumn },
  { n: 10, name: 'GLYPH WALL', role: 'wall segment', draw: drawGlyphWall },
  { n: 11, name: 'SPHINX', role: 'landmark', draw: drawSphinx },
  { n: 12, name: 'PALM CLUSTER', role: 'oasis', draw: drawPalmCluster },
  { n: 13, name: 'OASIS POOL', role: 'oasis', draw: drawOasisPool },
  { n: 14, name: 'RAIDER CAMP', role: 'flavor scene', draw: drawRaiderCamp },
  { n: 15, name: 'DUNE DRIFT', role: 'route shaper', draw: drawDuneDrift },
  { n: 16, name: 'FALLEN COLOSSUS', role: 'big set piece', draw: drawFallenColossus },
  { n: 17, name: 'TRAP PLATE', role: 'armed tomb', draw: drawTrapPlate },
  { n: 18, name: 'SCALES', role: 'judgment shrine', draw: drawScales },
  { n: 19, name: 'PLUNDER CART', role: 'PLUNDER (lootable)', draw: drawPlunderCart },
  { n: 20, name: 'URN CLUSTER', role: 'smashable pottery', draw: drawUrnCluster },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'pyramid_decor_options.png',
  title: 'PYRAMID PLUNDER — DECOR CANDIDATES (pick any, tell me numbers to cut/change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
