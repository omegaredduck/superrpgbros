// artdev/swamp/render_swamp_decor.js — 20 numbered WITCH'S SWAMP decoration
// candidates, one PNG grid. Bog props + the witch's housekeeping.
'use strict';
const KIT = require('./swamp_kit.js');
const { S, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, reeds, mossDrape, rune } = KIT;

// 1 · THE WITCH'S HUT — stilted shack, glowing window.
function drawHut(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.36);
  // stilts
  [[0.3, 0], [0.44, 0.02], [0.58, 0.01], [0.72, 0]].forEach(([x, o]) => stroke(put, Sz * (x + o), Sz * 0.62, Sz * x, Sz * 0.9, 3, () => S.woodDkk));
  // shack body (leaning)
  for (let y = Sz * 0.38; y < Sz * 0.64; y++) {
    const t = (y - Sz * 0.38) / (Sz * 0.26);
    const lean = t * Sz * 0.02;
    row(put, Math.round(y), Sz * 0.26 + lean, Sz * 0.74 + lean, (tx) => {
      let b = mix(S.wood, S.woodDkk, clamp(tx * 0.8 + t * 0.3, 0, 1));
      if ((tx * 12 | 0) % 3 === 0) b = mix(b, S.woodDk, 0.6); // planks
      return b;
    });
  }
  // crooked roof
  for (let y = 0; y < Sz * 0.16; y++) {
    const t = y / (Sz * 0.16), w = Sz * (0.3 - t * 0.24);
    row(put, Math.round(Sz * 0.38 - y), Sz * 0.5 - w - t * Sz * 0.04, Sz * 0.5 + w, (tx) => mix(S.bogDk, S.bogDkk, tx * 0.6 + t * 0.3));
  }
  // glowing window + door
  plate(put, Sz * 0.42, Sz * 0.46, Sz * 0.52, Sz * 0.55, S.brewDk, S.brewLt, S.woodDkk);
  stroke(put, Sz * 0.47, Sz * 0.46, Sz * 0.47, Sz * 0.55, 1, () => S.woodDkk);
  plate(put, Sz * 0.6, Sz * 0.48, Sz * 0.68, Sz * 0.64, S.woodDkk, S.woodDk, S.oil);
  // chimney smoke wisps
  stroke(put, Sz * 0.62, Sz * 0.26, Sz * 0.62, Sz * 0.34, 3, () => '#4a4e5a');
  [[0.63, 0.2], [0.66, 0.14], [0.64, 0.08]].forEach(([x, y]) => put(Math.round(Sz * x), Math.round(Sz * y), S.wispDk));
  mossDrape(put, Sz * 0.26, Sz * 0.4, Sz * 0.4, Sz * 0.38, 4);
}

// 2 · GIANT CAULDRON — the brew site.
function drawBigCauldron(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.32);
  // fire logs + embers
  [[-0.14, 0.05], [0.1, 0.03], [-0.02, 0.07]].forEach(([dx, o]) => stroke(put, Sz * (0.5 + dx - 0.08), Sz * (0.82 + o), Sz * (0.5 + dx + 0.08), Sz * (0.8 + o), 3, () => S.woodDk));
  [[-0.06, 0.78], [0.04, 0.79], [0, 0.75]].forEach(([dx, dy]) => put(Math.round(Sz * (0.5 + dx)), Math.round(Sz * dy), '#ff9a3f'));
  // pot
  for (let y = Sz * 0.4; y < Sz * 0.74; y++) {
    const t = (y - Sz * 0.4) / (Sz * 0.34);
    const w = Sz * (0.2 + Math.sin(t * 2.6) * 0.06);
    row(put, Math.round(y), Sz * 0.5 - w, Sz * 0.5 + w, (tx) => mix('#4a4e5a', '#16181e', clamp(tx * 1.1 + t * 0.25, 0, 1)));
  }
  ell(put, Sz * 0.5, Sz * 0.4, Sz * 0.21, Sz * 0.055, (tx, ty) => mix('#5a5e6a', '#24262e', ty));
  ell(put, Sz * 0.5, Sz * 0.4, Sz * 0.17, Sz * 0.04, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx * 0.8 + ty, 0, 1)));
  // bubbles rising
  [[-0.08, 0.32], [0.05, 0.28], [0.11, 0.34], [-0.02, 0.22], [0.02, 0.15]].forEach(([dx, dy]) => ell(put, Sz * (0.5 + dx), Sz * dy, 2.6, 2.6, () => S.brew));
  // ladle hooked on rim
  stroke(put, Sz * 0.68, Sz * 0.38, Sz * 0.74, Sz * 0.28, 2, () => S.woodLt);
  ell(put, Sz * 0.75, Sz * 0.26, Sz * 0.025, Sz * 0.02, () => S.woodDk);
}

// 3 · HEX TOTEM — the mechanic's carved pole (glowing).
function drawHexTotem(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.22);
  const cx = Sz * 0.5;
  // pole of stacked faces
  [[0.72, 'grim'], [0.58, 'moon'], [0.44, 'eye']].forEach(([yy, kind]) => {
    plate(put, cx - Sz * 0.1, Sz * (yy - 0.07), cx + Sz * 0.1, Sz * (yy + 0.07), S.wood, S.woodLt, S.woodDkk);
    if (kind === 'grim') { optic(put, cx - Sz * 0.04, Sz * (yy - 0.02), Sz * 0.014, S.oil, S.oil, S.witchLt); optic(put, cx + Sz * 0.04, Sz * (yy - 0.02), Sz * 0.014, S.oil, S.oil, S.witchLt); for (let t = -1; t <= 1; t += 0.25) put(Math.round(cx + t * Sz * 0.04), Math.round(Sz * (yy + 0.035)), S.oil); }
    if (kind === 'moon') for (let a = -1.2; a < 1.2; a += 0.08) put(Math.round(cx + Math.cos(a + 1.57) * Sz * 0.04), Math.round(Sz * yy + Math.sin(a + 1.57) * Sz * 0.04), S.wispLt);
    if (kind === 'eye') { ell(put, cx, Sz * yy, Sz * 0.045, Sz * 0.028, (tx, ty) => mix(S.bone, S.boneDk, ty)); optic(put, cx, Sz * yy, Sz * 0.014, S.oil, S.oil, S.witchLt); }
  });
  // skull topper + feathers
  ell(put, cx, Sz * 0.32, Sz * 0.06, Sz * 0.05, (tx, ty) => mix(S.bone, S.boneDk, tx + ty * 0.3));
  [[-0.035, 0], [0.035, 0]].forEach(([dx]) => put(Math.round(cx + dx * Sz), Math.round(Sz * 0.315), S.oil));
  [-1, 1].forEach(s => { stroke(put, cx + s * Sz * 0.06, Sz * 0.3, cx + s * Sz * 0.13, Sz * 0.2, 1.6, () => S.witchDk); put(Math.round(cx + s * Sz * 0.13), Math.round(Sz * 0.19), S.witchLt); });
  // hex aura ring
  for (let a = 0; a < 6.283; a += 0.2) put(Math.round(cx + Math.cos(a) * Sz * 0.22), Math.round(Sz * 0.55 + Math.sin(a) * Sz * 0.26), S.witchDk);
  rune(put, Math.round(cx), Math.round(Sz * 0.88), S.witchLt);
}

// 4 · GNARLED CYPRESS — moss-draped swamp tree.
function drawCypress(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.34);
  const cx = Sz * 0.5;
  // buttressed trunk
  for (let y = Sz * 0.3; y < Sz * 0.88; y++) {
    const t = (y - Sz * 0.3) / (Sz * 0.58);
    const w = Sz * (0.05 + t * t * 0.13);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(S.woodLt, S.woodDkk, clamp(tx * 1.1 + t * 0.1, 0, 1));
      if (Math.abs(Math.sin(tx * 14 + t * 3)) > 0.9) b = mix(b, S.woodDkk, 0.5); // bark grooves
      return b;
    });
  }
  // canopy blobs
  [[0, 0.22, 0.2, 0.1], [-0.18, 0.28, 0.13, 0.08], [0.18, 0.27, 0.14, 0.08]].forEach(([dx, dy, rx, ry]) =>
    ell(put, cx + dx * Sz, Sz * dy, Sz * rx, Sz * ry, (tx, ty) => mix(S.bog, S.bogDkk, clamp(tx * 0.8 + ty * 0.6, 0, 1))));
  // hanging moss
  mossDrape(put, cx - Sz * 0.3, Sz * 0.3, cx + Sz * 0.32, Sz * 0.28, 9);
  // knothole eye
  ell(put, cx - Sz * 0.03, Sz * 0.52, Sz * 0.03, Sz * 0.04, () => S.oil);
  put(Math.round(cx - Sz * 0.03), Math.round(Sz * 0.52), S.brew);
}

// 5 · DEAD SNAG — bare claw tree.
function drawSnag(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.26);
  const cx = Sz * 0.5;
  for (let y = Sz * 0.34; y < Sz * 0.88; y++) {
    const t = (y - Sz * 0.34) / (Sz * 0.54), w = Sz * (0.03 + t * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix('#6a5a4a', '#2e241a', clamp(tx * 1.2 + t * 0.1, 0, 1)));
  }
  // claw branches
  [[-0.25, 0.2, -0.1], [0.22, 0.16, 0.06], [-0.12, 0.1, -0.04], [0.3, 0.32, 0.18]].forEach(([tx2, ty2, mx]) => {
    for (let t = 0; t <= 1; t += 0.04) {
      const x = cx + lerp(0, tx2 * Sz, t) + Math.sin(t * 3) * mx * Sz;
      const y = Sz * 0.4 - t * (Sz * 0.4 - ty2 * Sz);
      stroke(put, x, y, x, y, Math.max(1, 3 * (1 - t)), () => mix('#5a4a3a', '#241c12', t * 0.7));
    }
  });
  // perched crow silhouette
  ell(put, cx + Sz * 0.21, Sz * 0.14, Sz * 0.03, Sz * 0.025, () => S.oil);
  put(Math.round(cx + Sz * 0.245), Math.round(Sz * 0.135), S.oil);
}

// 6 · LILY PADS — pad cluster + bloom.
function drawLilies(put, Sz) {
  // dark water puddle
  ell(put, Sz * 0.5, Sz * 0.6, Sz * 0.38, Sz * 0.22, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.6 + ty * 0.8, 0, 1)));
  // pads
  [[0.36, 0.54, 0.1], [0.6, 0.5, 0.085], [0.52, 0.68, 0.11], [0.7, 0.66, 0.07], [0.3, 0.7, 0.06]].forEach(([x, y, r]) => {
    ell(put, Sz * x, Sz * y, Sz * r, Sz * r * 0.55, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.9 + ty * 0.4, 0, 1)));
    stroke(put, Sz * x, Sz * y, Sz * (x + r * 0.9), Sz * y, 1.4, () => S.murkDk); // notch
  });
  // bloom
  [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, -0.7]].forEach(([dx, dy]) => ell(put, Sz * 0.52 + dx * 4, Sz * 0.66 + dy * 3, 3, 2.4, () => '#e8c8e0'));
  put(Math.round(Sz * 0.52), Math.round(Sz * 0.66), '#ffd23f');
  // frog eyes peeking
  put(Math.round(Sz * 0.38), Math.round(Sz * 0.52), S.brew); put(Math.round(Sz * 0.41), Math.round(Sz * 0.52), S.brew);
}

// 7 · CATTAIL REEDS — tall reed clump.
function drawReeds(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.24);
  ell(put, Sz * 0.5, Sz * 0.84, Sz * 0.2, Sz * 0.05, (tx, ty) => mix(S.mud, S.mudDk, ty));
  reeds(put, Sz * 0.5, Sz * 0.84, 9, Sz * 0.5);
  // dragonfly
  put(Math.round(Sz * 0.7), Math.round(Sz * 0.3), S.wisp); put(Math.round(Sz * 0.72), Math.round(Sz * 0.3), S.wisp);
  put(Math.round(Sz * 0.69), Math.round(Sz * 0.29), S.wispLt); put(Math.round(Sz * 0.73), Math.round(Sz * 0.29), S.wispLt);
}

// 8 · BONE CHIMES — hanging bones on a branch.
function drawChimes(put, Sz) {
  // branch across the top
  for (let x = Sz * 0.12; x < Sz * 0.88; x++) put(Math.round(x), Math.round(Sz * 0.2 + Math.sin(x * 0.04) * 3), S.woodDk);
  // hanging strings of bones
  [[0.24, 4], [0.38, 6], [0.52, 5], [0.66, 7], [0.78, 4]].forEach(([x, n]) => {
    for (let i = 0; i < n; i++) {
      const y = Sz * (0.24 + i * 0.09);
      stroke(put, Sz * x, y - Sz * 0.05, Sz * x, y, 1, () => S.boneDk);
      if (i % 2 === 0) stroke(put, Sz * x - 3, y, Sz * x + 3, y, 2, () => S.bone);
      else ell(put, Sz * x, y, 2.6, 3.2, (tx, ty) => mix(S.bone, S.boneDk, ty));
    }
  });
  // one tiny skull on the middle string
  ell(put, Sz * 0.52, Sz * 0.62, Sz * 0.035, Sz * 0.03, (tx, ty) => mix(S.bone, S.boneDk, tx + ty * 0.3));
  put(Math.round(Sz * 0.5), Math.round(Sz * 0.615), S.oil); put(Math.round(Sz * 0.53), Math.round(Sz * 0.615), S.oil);
}

// 9 · SKULL LANTERN — wisp-lit skull on a post.
function drawLantern(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.18);
  stroke(put, Sz * 0.5, Sz * 0.32, Sz * 0.52, Sz * 0.88, 3.4, () => S.woodDk);
  ell(put, Sz * 0.51, Sz * 0.88, Sz * 0.09, Sz * 0.035, (tx, ty) => mix(S.mud, S.mudDk, ty));
  // skull
  ell(put, Sz * 0.5, Sz * 0.26, Sz * 0.09, Sz * 0.08, (tx, ty) => mix(S.bone, S.boneDk, clamp(tx * 0.8 + ty * 0.4, 0, 1)));
  ell(put, Sz * 0.5, Sz * 0.33, Sz * 0.05, Sz * 0.03, (tx, ty) => mix(S.boneDk, mix(S.boneDk, '#000', 0.4), ty)); // jaw
  // glowing sockets + inner light
  optic(put, Sz * 0.465, Sz * 0.25, Sz * 0.016, S.oil, S.oil, S.wisp);
  optic(put, Sz * 0.535, Sz * 0.25, Sz * 0.016, S.oil, S.oil, S.wisp);
  put(Math.round(Sz * 0.5), Math.round(Sz * 0.3), S.wispLt); // nose glow
  // light halo
  for (let a = 0; a < 6.283; a += 0.4) put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.13), Math.round(Sz * 0.26 + Math.sin(a) * Sz * 0.12), S.wispDk);
  // moths
  put(Math.round(Sz * 0.64), Math.round(Sz * 0.18), S.boneDk); put(Math.round(Sz * 0.36), Math.round(Sz * 0.22), S.boneDk);
}

// 10 · ROT LOG — fallen hollow log.
function drawLog(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.32);
  // log body (angled)
  for (let t = 0; t <= 1; t += 0.01) {
    const x = Sz * (0.15 + t * 0.7), y = Sz * (0.62 - t * 0.08);
    ell(put, x, y, Sz * 0.09, Sz * 0.08, (tx, ty) => {
      let b = mix(S.woodLt, S.woodDkk, clamp(tx * 0.9 + ty * 0.5, 0, 1));
      if (Math.abs(Math.sin(t * 30)) > 0.92) b = mix(b, S.woodDkk, 0.4);
      return b;
    });
  }
  // hollow end
  ell(put, Sz * 0.85, Sz * 0.54, Sz * 0.075, Sz * 0.07, (tx, ty) => mix(S.woodDk, S.oil, clamp((1 - Math.hypot(tx - 0.5, ty - 0.5) * 2) + 0.4, 0, 1)));
  // eyes inside the hollow
  put(Math.round(Sz * 0.84), Math.round(Sz * 0.53), S.brew); put(Math.round(Sz * 0.87), Math.round(Sz * 0.53), S.brew);
  // shelf fungus + moss
  [[0.3, 0.52], [0.42, 0.5], [0.55, 0.48]].forEach(([x, y]) => { ell(put, Sz * x, Sz * y, Sz * 0.035, Sz * 0.015, (tx, ty) => mix(S.rot, S.bogDk, ty)); });
  mossDrape(put, Sz * 0.2, Sz * 0.6, Sz * 0.5, Sz * 0.56, 4);
}

// 11 · MUSHROOM RING — fairy circle (teleport flavor).
function drawRing(put, Sz) {
  ell(put, Sz * 0.5, Sz * 0.6, Sz * 0.34, Sz * 0.18, (tx, ty) => mix(S.bogDk, S.bogDkk, clamp(tx * 0.5 + ty * 0.7, 0, 1)));
  // glowing ring earth
  for (let a = 0; a < 6.283; a += 0.08) put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.26), Math.round(Sz * 0.6 + Math.sin(a) * Sz * 0.13), S.witchDk);
  // mushrooms around the ring
  for (let a = 0; a < 6.283; a += 0.7) {
    const x = Sz * 0.5 + Math.cos(a) * Sz * 0.28, y = Sz * 0.6 + Math.sin(a) * Sz * 0.145;
    stroke(put, x, y, x, y - Sz * 0.035, 2, () => S.bone);
    dome(put, x, y - Sz * 0.04, Sz * 0.03, Sz * 0.02, S.witch, S.witchLt, S.witchDkk);
    put(Math.round(x), Math.round(y - Sz * 0.05), S.witchLt);
  }
  // center glow motes
  [[0, 0.55], [-0.05, 0.62], [0.06, 0.6]].forEach(([dx, dy]) => put(Math.round(Sz * (0.5 + dx)), Math.round(Sz * dy), S.witchLt));
}

// 12 · BOG COFFIN — half-sunk, lid ajar.
function drawCoffin(put, Sz) {
  // mire pool
  ell(put, Sz * 0.5, Sz * 0.68, Sz * 0.34, Sz * 0.14, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.6 + ty, 0, 1)));
  // coffin (angled, half-submerged)
  const pts = [[0.34, 0.38], [0.62, 0.32], [0.72, 0.52], [0.66, 0.66], [0.4, 0.7], [0.3, 0.5]];
  for (let y = Sz * 0.32; y < Sz * 0.7; y++) {
    const t = (y - Sz * 0.32) / (Sz * 0.38);
    const w = Sz * (0.1 + Math.sin(t * 2.2) * 0.08);
    const cx2 = Sz * (0.48 + t * 0.06);
    row(put, Math.round(y), cx2 - w, cx2 + w, (tx) => {
      let b = mix(S.wood, S.woodDkk, clamp(tx * 0.9 + t * 0.3, 0, 1));
      if ((tx * 8 | 0) % 3 === 0) b = mix(b, S.woodDk, 0.5);
      return b;
    });
  }
  // lid cracked open — dark gap + glow
  stroke(put, Sz * 0.42, Sz * 0.36, Sz * 0.58, Sz * 0.34, 3, () => S.oil);
  put(Math.round(Sz * 0.5), Math.round(Sz * 0.35), S.wisp);
  // nails + moss
  [[0.38, 0.44], [0.6, 0.4], [0.64, 0.56]].forEach(([x, y]) => put(Math.round(Sz * x), Math.round(Sz * y), '#8a8e9a'));
  mossDrape(put, Sz * 0.4, Sz * 0.68, Sz * 0.62, Sz * 0.64, 3);
}

// 13 · RICKETY DOCK — plank walkway segment on posts.
function drawDock(put, Sz) {
  // water
  ell(put, Sz * 0.5, Sz * 0.7, Sz * 0.4, Sz * 0.18, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.5 + ty * 0.8, 0, 1)));
  // posts
  [[0.24, 0.6], [0.5, 0.64], [0.76, 0.58]].forEach(([x, y]) => stroke(put, Sz * x, Sz * y, Sz * (x + 0.01), Sz * (y + 0.2), 3, () => S.woodDkk));
  // planks (wonky)
  for (let i = 0; i < 9; i++) {
    const x = Sz * (0.14 + i * 0.085), tilt = (i % 3 - 1) * 2;
    if (i === 5) continue; // missing plank!
    for (let d = 0; d < Sz * 0.05; d++) row(put, Math.round(Sz * 0.5 + tilt + d), x, x + Sz * 0.075, (tx) => mix(S.woodLt, S.woodDk, tx * 0.4 + d / (Sz * 0.05) * 0.5));
  }
  // rope rail
  for (let x = Sz * 0.14; x < Sz * 0.9; x += 2) put(Math.round(x), Math.round(Sz * 0.4 + Math.sin(x * 0.06) * 4), S.woodLt);
  [[0.16, 0.4], [0.5, 0.44], [0.86, 0.4]].forEach(([x, y]) => stroke(put, Sz * x, Sz * y, Sz * x, Sz * 0.52, 2, () => S.woodDk));
}

// 14 · STONE ALTAR — ritual slab + candles.
function drawAltar(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.3);
  // slab
  plate(put, Sz * 0.28, Sz * 0.52, Sz * 0.72, Sz * 0.62, '#6a6e78', '#8a8e9a', '#3a3e46');
  plate(put, Sz * 0.34, Sz * 0.62, Sz * 0.66, Sz * 0.78, '#5a5e68', '#7a7e88', '#2e323a');
  // carved runes on the slab face
  rune(put, Math.round(Sz * 0.42), Math.round(Sz * 0.71), S.witchLt);
  rune(put, Math.round(Sz * 0.58), Math.round(Sz * 0.71), S.witchLt);
  // candles
  [[0.3, 0.48, 0.05], [0.5, 0.46, 0.07], [0.7, 0.49, 0.045]].forEach(([x, y, h]) => {
    stroke(put, Sz * x, Sz * y, Sz * x, Sz * (y - h), 3.4, () => S.bone);
    put(Math.round(Sz * x), Math.round(Sz * (y - h - 0.015)), '#ff9a3f');
    put(Math.round(Sz * x), Math.round(Sz * (y - h - 0.03)), '#ffd23f');
  });
  // offering bowl + dark stain
  ell(put, Sz * 0.5, Sz * 0.55, Sz * 0.05, Sz * 0.02, (tx, ty) => mix('#3a3e46', S.oil, ty));
  ell(put, Sz * 0.55, Sz * 0.6, Sz * 0.04, Sz * 0.012, () => '#5e0e16');
}

// 15 · POTION RACK — crooked shelf of bottles.
function drawPotions(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.3);
  // crooked shelf unit
  plate(put, Sz * 0.26, Sz * 0.28, Sz * 0.74, Sz * 0.8, S.woodDk, S.wood, S.woodDkk);
  [0.42, 0.56, 0.7].forEach(y => stroke(put, Sz * 0.28, Sz * y, Sz * 0.72, Sz * (y - 0.015), 2.4, () => S.woodDkk));
  // bottles rows
  const cols = [[S.brew, S.brewLt], [S.witch, S.witchLt], [S.blood, '#d86470'], [S.wisp, S.wispLt]];
  [[0.34, 0.4], [0.45, 0.39], [0.56, 0.41], [0.66, 0.4], [0.36, 0.54], [0.5, 0.53], [0.63, 0.55], [0.4, 0.68], [0.55, 0.67], [0.66, 0.69]].forEach(([x, y], i) => {
    const [c, lt] = cols[i % 4];
    const shape = i % 3;
    if (shape === 0) ell(put, Sz * x, Sz * (y - 0.02), Sz * 0.025, Sz * 0.035, (tx, ty) => mix(lt, c, clamp(tx + ty * 0.4, 0, 1)));
    else if (shape === 1) plate(put, Sz * x - 3, Sz * (y - 0.05), Sz * x + 3, Sz * y, c, lt, mix(c, '#000', 0.4));
    else { ell(put, Sz * x, Sz * (y - 0.015), Sz * 0.03, Sz * 0.025, (tx, ty) => mix(lt, c, tx + ty * 0.3)); }
    stroke(put, Sz * x, Sz * (y - 0.06), Sz * x, Sz * (y - 0.045), 1.6, () => S.woodLt); // cork
    put(Math.round(Sz * x - 1), Math.round(Sz * (y - 0.035)), '#ffffff');
  });
  // one tipped, dripping
  ell(put, Sz * 0.68, Sz * 0.77, Sz * 0.03, Sz * 0.02, (tx, ty) => mix(S.brewLt, S.brewDk, ty));
  stroke(put, Sz * 0.7, Sz * 0.79, Sz * 0.72, Sz * 0.84, 1.4, () => S.brew);
}

// 16 · SUNKEN STATUE — mossy old god head in the mire.
function drawStatue(put, Sz) {
  // mire
  ell(put, Sz * 0.5, Sz * 0.72, Sz * 0.36, Sz * 0.15, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.6 + ty, 0, 1)));
  // tilted stone head (half sunk)
  for (let y = Sz * 0.3; y < Sz * 0.72; y++) {
    const t = (y - Sz * 0.3) / (Sz * 0.42);
    const w = Sz * (0.13 + Math.sin(t * 2.4) * 0.05);
    const cx2 = Sz * (0.5 + t * 0.04);
    row(put, Math.round(y), cx2 - w, cx2 + w, (tx) => {
      let b = mix('#7a7e88', '#3e424c', clamp(tx * 1.1 + t * 0.2, 0, 1));
      if ((tx + t) % 0.4 < 0.12) b = mix(b, S.bogDk, 0.45); // moss patches
      return b;
    });
  }
  // stern face features (tilted)
  stroke(put, Sz * 0.42, Sz * 0.44, Sz * 0.5, Sz * 0.43, 2.4, () => '#2e323a'); // brow
  stroke(put, Sz * 0.56, Sz * 0.43, Sz * 0.64, Sz * 0.44, 2.4, () => '#2e323a');
  ell(put, Sz * 0.46, Sz * 0.47, Sz * 0.02, Sz * 0.014, () => S.oil);
  ell(put, Sz * 0.6, Sz * 0.47, Sz * 0.02, Sz * 0.014, () => S.oil);
  stroke(put, Sz * 0.53, Sz * 0.52, Sz * 0.55, Sz * 0.58, 2.4, () => '#2e323a'); // nose
  stroke(put, Sz * 0.46, Sz * 0.64, Sz * 0.62, Sz * 0.63, 2, () => '#2e323a'); // grim mouth
  // one glowing eye (something lives in it)
  put(Math.round(Sz * 0.6), Math.round(Sz * 0.47), S.brew);
  mossDrape(put, Sz * 0.4, Sz * 0.32, Sz * 0.62, Sz * 0.3, 4);
}

// 17 · FIREFLY BUSH — glowing bush.
function drawBush(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.26);
  [[0, 0.6, 0.18, 0.14], [-0.14, 0.66, 0.12, 0.1], [0.14, 0.64, 0.13, 0.1], [0, 0.48, 0.13, 0.09]].forEach(([dx, dy, rx, ry]) =>
    ell(put, Sz * (0.5 + dx), Sz * dy, Sz * rx, Sz * ry, (tx, ty) => mix(S.bog, S.bogDkk, clamp(tx * 0.8 + ty * 0.6, 0, 1))));
  // fireflies in + around
  [[0.42, 0.52], [0.58, 0.58], [0.5, 0.66], [0.34, 0.62], [0.66, 0.5], [0.28, 0.42], [0.72, 0.38], [0.5, 0.3]].forEach(([x, y], i) => {
    put(Math.round(Sz * x), Math.round(Sz * y), i % 2 ? S.brewLt : '#ffd23f');
    if (i > 4) put(Math.round(Sz * x + 1), Math.round(Sz * y + 1), S.brewDk);
  });
}

// 18 · CROC SKULL — giant jaws bleaching in the mud.
function drawCrocSkull(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.34);
  // upper skull
  for (let t = 0; t <= 1; t += 0.015) {
    const x = Sz * (0.2 + t * 0.62), y = Sz * (0.5 - Math.sin(t * 2.4) * 0.06);
    ell(put, x, y, Sz * (0.05 + (1 - t) * 0.05), Sz * 0.045, (tx, ty) => mix(S.bone, S.boneDk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  }
  // eye socket
  ell(put, Sz * 0.34, Sz * 0.46, Sz * 0.035, Sz * 0.03, () => S.oil);
  // lower jaw open
  for (let t = 0; t <= 1; t += 0.02) {
    const x = Sz * (0.24 + t * 0.56), y = Sz * (0.66 + Math.sin(t * 1.8) * 0.05);
    ell(put, x, y, Sz * (0.035 + (1 - t) * 0.03), Sz * 0.03, (tx, ty) => mix(S.boneDk, mix(S.boneDk, '#000', 0.3), tx + ty * 0.3));
  }
  // teeth (upper + lower)
  for (let i = 0; i < 6; i++) { put(Math.round(Sz * (0.4 + i * 0.07)), Math.round(Sz * (0.545 - i * 0.004)), S.bone); put(Math.round(Sz * (0.4 + i * 0.07)), Math.round(Sz * (0.555 - i * 0.004)), S.bone); }
  for (let i = 0; i < 5; i++) { put(Math.round(Sz * (0.42 + i * 0.08)), Math.round(Sz * (0.63 + i * 0.006)), S.bone); }
  // mud base + sprouting weed
  ell(put, Sz * 0.5, Sz * 0.78, Sz * 0.3, Sz * 0.06, (tx, ty) => mix(S.mud, S.mudDk, ty));
  stroke(put, Sz * 0.62, Sz * 0.76, Sz * 0.63, Sz * 0.68, 1.4, () => S.bogLt);
}

// 19 · RITUAL CIRCLE — glowing glyph on the ground.
function drawCircle(put, Sz) {
  ell(put, Sz * 0.5, Sz * 0.58, Sz * 0.36, Sz * 0.2, (tx, ty) => mix(S.mudDk, S.bogDkk, clamp(tx * 0.5 + ty * 0.7, 0, 1)));
  // double glow ring
  for (let a = 0; a < 6.283; a += 0.04) {
    put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.3), Math.round(Sz * 0.58 + Math.sin(a) * Sz * 0.16), S.witchLt);
    put(Math.round(Sz * 0.5 + Math.cos(a) * Sz * 0.24), Math.round(Sz * 0.58 + Math.sin(a) * Sz * 0.128), S.witchDk);
  }
  // pentagon lines
  const P5 = [];
  for (let i = 0; i < 5; i++) { const a = -1.57 + i * 1.257; P5.push([Sz * 0.5 + Math.cos(a) * Sz * 0.24, Sz * 0.58 + Math.sin(a) * Sz * 0.128]); }
  for (let i = 0; i < 5; i++) { const [x1, y1] = P5[i], [x2, y2] = P5[(i + 2) % 5]; stroke(put, x1, y1, x2, y2, 1.4, () => S.witch); }
  // candle nubs at points
  P5.forEach(([x, y]) => { put(Math.round(x), Math.round(y - 2), '#ffd23f'); stroke(put, x, y, x, y - 1, 2, () => S.bone); });
  rune(put, Math.round(Sz * 0.5), Math.round(Sz * 0.58), S.witchLt);
}

// 20 · MANGROVE ARCH — stilt-root archway.
function drawArch(put, Sz) {
  shadow(put, Sz, Sz * 0.5, Sz * 0.36);
  // root legs arching to a joined top
  [[-1, 0.2], [1, 0.8]].forEach(([s, x0]) => {
    for (let t = 0; t <= 1; t += 0.02) {
      const x = Sz * (x0 + s * t * 0.28);
      const y = Sz * (0.86 - Math.sin(t * 1.57) * 0.5);
      stroke(put, x, y, x, y, Math.max(2, Sz * 0.045 * (1 - t * 0.5)), () => mix(S.woodLt, S.woodDkk, t * 0.5 + Math.abs(Math.sin(t * 9)) * 0.3));
    }
    // side rootlets
    [0.15, 0.4].forEach(tt => {
      const x = Sz * (x0 + s * tt * 0.28), y = Sz * (0.86 - Math.sin(tt * 1.57) * 0.5);
      stroke(put, x, y, x - s * Sz * 0.07, Sz * 0.88, 2, () => S.woodDk);
    });
  });
  // joined canopy knot
  ell(put, Sz * 0.5, Sz * 0.34, Sz * 0.12, Sz * 0.06, (tx, ty) => mix(S.wood, S.woodDkk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  mossDrape(put, Sz * 0.4, Sz * 0.37, Sz * 0.62, Sz * 0.36, 5);
  // wisp passing through
  put(Math.round(Sz * 0.5), Math.round(Sz * 0.56), S.wispLt);
  put(Math.round(Sz * 0.52), Math.round(Sz * 0.58), S.wispDk);
}

const LIST = [
  { n: 1, name: "WITCH'S HUT", role: 'stilted shack', draw: drawHut },
  { n: 2, name: 'GIANT CAULDRON', role: 'brew site', draw: drawBigCauldron },
  { n: 3, name: 'HEX TOTEM', role: 'mechanic pole', draw: drawHexTotem },
  { n: 4, name: 'GNARLED CYPRESS', role: 'moss tree', draw: drawCypress },
  { n: 5, name: 'DEAD SNAG', role: 'claw tree', draw: drawSnag },
  { n: 6, name: 'LILY PADS', role: 'pad cluster', draw: drawLilies },
  { n: 7, name: 'CATTAIL REEDS', role: 'reed clump', draw: drawReeds },
  { n: 8, name: 'BONE CHIMES', role: 'hanging bones', draw: drawChimes },
  { n: 9, name: 'SKULL LANTERN', role: 'wisp light post', draw: drawLantern },
  { n: 10, name: 'ROT LOG', role: 'hollow log', draw: drawLog },
  { n: 11, name: 'MUSHROOM RING', role: 'fairy circle', draw: drawRing },
  { n: 12, name: 'BOG COFFIN', role: 'half-sunk, ajar', draw: drawCoffin },
  { n: 13, name: 'RICKETY DOCK', role: 'plank walkway', draw: drawDock },
  { n: 14, name: 'STONE ALTAR', role: 'ritual slab', draw: drawAltar },
  { n: 15, name: 'POTION RACK', role: 'bottle shelf', draw: drawPotions },
  { n: 16, name: 'SUNKEN STATUE', role: 'old god head', draw: drawStatue },
  { n: 17, name: 'FIREFLY BUSH', role: 'glow bush', draw: drawBush },
  { n: 18, name: 'CROC SKULL', role: 'giant jaws', draw: drawCrocSkull },
  { n: 19, name: 'RITUAL CIRCLE', role: 'ground glyph', draw: drawCircle },
  { n: 20, name: 'MANGROVE ARCH', role: 'root gateway', draw: drawArch },
];

renderSheet({ list: LIST, out: process.argv[2] || 'swamp_decor_options.png', title: "WITCH'S SWAMP — DECORATION CANDIDATES (use at will or pick favorites)", S: 160 });
