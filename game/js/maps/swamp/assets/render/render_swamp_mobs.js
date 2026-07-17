// artdev/swamp/render_swamp_mobs.js — 20 numbered WITCH'S SWAMP mob
// candidates, one PNG grid. Bog beasts + the witch's servants.
'use strict';
const KIT = require('./swamp_kit.js');
const { S, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, rune } = KIT;

// 1 · BOGLING — mud imp, swarm filler.
function drawBogling(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.2);
  // dumpy mud body
  ell(put, cx, Sz * 0.6, Sz * 0.13, Sz * 0.15, (tx, ty) => mix(S.mudLt, S.mudDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // drippy edges
  [[-0.1, 0.72], [0.02, 0.76], [0.11, 0.7]].forEach(([dx, dy]) => stroke(put, cx + dx * Sz, Sz * dy, cx + dx * Sz, Sz * (dy + 0.06), 2.4, () => S.mud));
  // stubby arms
  [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.14, Sz * 0.58, Sz * 0.045, Sz * 0.06, (tx, ty) => mix(S.mud, S.mudDk, tx + ty * 0.3)));
  // moss cap
  ell(put, cx, Sz * 0.46, Sz * 0.1, Sz * 0.045, (tx, ty) => mix(S.bogLt, S.bogDk, tx + ty * 0.4));
  // glow eyes + wide mouth
  optic(put, cx - Sz * 0.045, Sz * 0.54, Sz * 0.016, S.oil, S.oil, S.brew);
  optic(put, cx + Sz * 0.045, Sz * 0.54, Sz * 0.016, S.oil, S.oil, S.brew);
  for (let t = -1; t <= 1; t += 0.14) put(Math.round(cx + t * Sz * 0.05), Math.round(Sz * 0.63 + (1 - t * t) * 2), S.oil);
}

// 2 · GIANT LEECH — latches on, drains.
function drawLeech(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.26);
  // segmented arcing body
  for (let t = 0; t <= 1; t += 0.02) {
    const x = cx + (t - 0.5) * Sz * 0.5;
    const y = Sz * 0.62 - Math.sin(t * Math.PI) * Sz * 0.22;
    const r = Sz * (0.05 + Math.sin(t * Math.PI) * 0.035);
    ell(put, x, y, r, r * 0.85, (tx, ty) => {
      let b = mix('#5a3a4e', '#2e1c28', clamp(tx * 0.8 + ty * 0.6, 0, 1));
      if (Math.abs((t * 12) % 1) < 0.14) b = mix(b, '#000', 0.35); // segments
      return b;
    });
  }
  // sucker mouth (front, right)
  ell(put, cx + Sz * 0.25, Sz * 0.6, Sz * 0.05, Sz * 0.05, (tx, ty) => mix(S.blood, '#4e0a12', clamp((Math.abs(tx - 0.5) + Math.abs(ty - 0.5)) * 2, 0, 1)));
  ell(put, cx + Sz * 0.25, Sz * 0.6, Sz * 0.02, Sz * 0.02, () => S.oil);
  // tiny eyes
  put(Math.round(cx + Sz * 0.19), Math.round(Sz * 0.52), S.brew);
  put(Math.round(cx + Sz * 0.23), Math.round(Sz * 0.5), S.brew);
  // slime drips
  put(Math.round(cx - Sz * 0.1), Math.round(Sz * 0.68), S.brewLt);
}

// 3 · WILL-O-WISP — luring glow orb; pops when cornered.
function drawWisp(put, Sz) {
  const cx = Sz * 0.5, cy = Sz * 0.45;
  // trailing motes
  [[-0.16, 0.14, 0.5], [-0.26, 0.24, 0.35], [-0.33, 0.36, 0.2]].forEach(([dx, dy, sc]) =>
    ell(put, cx + dx * Sz, cy + dy * Sz, Sz * 0.04 * sc + 1, Sz * 0.04 * sc + 1, () => S.wispDk));
  // halo
  for (let a = 0; a < 6.283; a += 0.12) put(Math.round(cx + Math.cos(a) * Sz * 0.14), Math.round(cy + Math.sin(a) * Sz * 0.14), S.wispDk);
  // core orb
  ell(put, cx, cy, Sz * 0.09, Sz * 0.1, (tx, ty) => {
    const d = Math.hypot(tx - 0.42, ty - 0.42);
    return mix(S.wispLt, S.wisp, clamp(d * 2, 0, 1));
  });
  // inner face — faint hollow eyes
  put(Math.round(cx - Sz * 0.025), Math.round(cy - Sz * 0.01), S.wispDk);
  put(Math.round(cx + Sz * 0.025), Math.round(cy - Sz * 0.01), S.wispDk);
  // flame lick top
  for (let y = 0; y < Sz * 0.08; y++) { const t = y / (Sz * 0.08); put(Math.round(cx + Math.sin(y * 0.5) * 2), Math.round(cy - Sz * 0.1 - y), t > 0.6 ? S.wispDk : S.wispLt); }
  put(Math.round(cx), Math.round(cy - Sz * 0.02), '#ffffff');
}

// 4 · SKEETER CLOUD — mosquito swarm, fast harasser.
function drawSkeeters(put, Sz) {
  const cx = Sz * 0.5, cy = Sz * 0.48;
  shadow(put, Sz, cx, Sz * 0.2);
  // cloud of skeeters
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4, r = Sz * (0.06 + (i % 5) * 0.035);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.75;
    // body + wings
    put(Math.round(x), Math.round(y), S.oil); put(Math.round(x + 1), Math.round(y), S.oil);
    put(Math.round(x - 1), Math.round(y - 1), S.wispLt); put(Math.round(x + 2), Math.round(y - 1), S.wispLt);
    if (i % 3 === 0) put(Math.round(x + 2), Math.round(y + 1), S.blood); // fed
  }
  // one big momma skeeter center
  ell(put, cx, cy, Sz * 0.05, Sz * 0.035, (tx, ty) => mix('#4a4438', S.oil, tx + ty * 0.3));
  [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.05, cy - Sz * 0.03, Sz * 0.04, Sz * 0.018, () => S.wispLt));
  stroke(put, cx + Sz * 0.04, cy + Sz * 0.01, cx + Sz * 0.1, cy + Sz * 0.03, 1, () => S.blood); // proboscis
  optic(put, cx - Sz * 0.02, cy - Sz * 0.01, Sz * 0.01, S.oil, S.oil, S.blood);
}

// 5 · SNAPJAW TURTLE — shell tank; tucks in when shot.
function drawTurtle(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.3);
  // dome shell w/ moss
  dome(put, cx, Sz * 0.56, Sz * 0.2, Sz * 0.15, S.bogDk, S.bog, S.bogDkk);
  // shell plates
  for (let a = 0; a < 6.283; a += 1.05) put(Math.round(cx + Math.cos(a) * Sz * 0.11), Math.round(Sz * 0.53 + Math.sin(a) * Sz * 0.07), S.bogDkk);
  ell(put, cx, Sz * 0.48, Sz * 0.05, Sz * 0.035, (tx, ty) => mix(S.rot, S.bogDk, ty)); // moss tuft
  // rim
  ell(put, cx, Sz * 0.66, Sz * 0.21, Sz * 0.045, (tx, ty) => mix(S.mudLt, S.mudDk, ty));
  // head lunging out
  stroke(put, cx + Sz * 0.18, Sz * 0.6, cx + Sz * 0.3, Sz * 0.54, Sz * 0.045, () => mix(S.bogLt, S.bogDk, 0.3));
  ell(put, cx + Sz * 0.32, Sz * 0.52, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bogLt, S.bogDk, tx * 0.5 + ty * 0.5));
  // beak open
  stroke(put, cx + Sz * 0.35, Sz * 0.5, cx + Sz * 0.39, Sz * 0.47, 2, () => S.boneDk);
  stroke(put, cx + Sz * 0.35, Sz * 0.53, cx + Sz * 0.39, Sz * 0.56, 2, () => S.boneDk);
  optic(put, cx + Sz * 0.31, Sz * 0.5, Sz * 0.011, S.oil, S.oil, S.brew);
  // stub legs
  [[-0.16, 0.68], [0.08, 0.7]].forEach(([dx, dy]) => ell(put, cx + dx * Sz, Sz * dy, Sz * 0.04, Sz * 0.03, (tx, ty) => mix(S.bog, S.bogDkk, ty)));
}

// 6 · WITCHLING — the witch's apprentice; hex bolts.
function drawWitchling(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.2);
  // little robe
  for (let y = Sz * 0.42; y < Sz * 0.82; y++) {
    const t = (y - Sz * 0.42) / (Sz * 0.4), w = Sz * (0.055 + t * 0.085);
    row(put, Math.round(y), cx - w, cx + w, (tx) => mix(S.witch, S.witchDkk, clamp(tx * 1.1 + t * 0.3, 0, 1)));
  }
  // rope belt
  row(put, Math.round(Sz * 0.6), cx - Sz * 0.08, cx + Sz * 0.08, () => S.woodLt);
  // head — green imp face under pointed hood
  ell(put, cx, Sz * 0.36, Sz * 0.06, Sz * 0.06, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx + ty * 0.4, 0, 1)));
  optic(put, cx - Sz * 0.022, Sz * 0.355, Sz * 0.012, S.oil, S.oil, S.brew);
  optic(put, cx + Sz * 0.022, Sz * 0.355, Sz * 0.012, S.oil, S.oil, S.brew);
  // pointed hood
  for (let y = 0; y < Sz * 0.16; y++) {
    const t = y / (Sz * 0.16), w = Sz * 0.075 * (1 - t * 0.92);
    row(put, Math.round(Sz * 0.32 - y), cx - w + t * Sz * 0.03, cx + w + t * Sz * 0.03, (tx) => mix(S.witchLt, S.witchDk, tx + t * 0.3));
  }
  // wand hand + hex spark
  stroke(put, cx + Sz * 0.08, Sz * 0.5, cx + Sz * 0.16, Sz * 0.42, Sz * 0.02, () => S.witchDk);
  stroke(put, cx + Sz * 0.16, Sz * 0.42, cx + Sz * 0.2, Sz * 0.36, 1.6, () => S.woodDk);
  rune(put, Math.round(cx + Sz * 0.23), Math.round(Sz * 0.32), S.witchLt);
}

// 7 · GATOR BRUTE — lane lunger, log-disguise ambush.
function drawGator(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.32);
  // long low body
  for (let t = 0; t <= 1; t += 0.02) {
    const x = cx + (t - 0.5) * Sz * 0.62;
    const r = Sz * (0.07 - Math.abs(t - 0.4) * 0.06);
    ell(put, x, Sz * 0.62, r, r * 0.75, (tx, ty) => {
      let b = mix(S.bog, S.bogDkk, clamp(tx * 0.6 + ty * 0.7, 0, 1));
      if (ty < 0.3 && Math.abs((t * 14) % 1) < 0.2) b = S.bogDk; // ridges
      return b;
    });
  }
  // ridge spikes
  for (let t = 0.15; t < 0.7; t += 0.09) { const x = cx + (t - 0.5) * Sz * 0.62; put(Math.round(x), Math.round(Sz * 0.54), S.bogDk); put(Math.round(x), Math.round(Sz * 0.53), S.bogDk); }
  // snout + open jaws
  const jx = cx + Sz * 0.31;
  stroke(put, jx, Sz * 0.58, jx + Sz * 0.15, Sz * 0.52, Sz * 0.035, () => S.bogDk);
  stroke(put, jx, Sz * 0.64, jx + Sz * 0.15, Sz * 0.7, Sz * 0.035, () => S.bog);
  // teeth
  for (let i = 0; i < 4; i++) { put(Math.round(jx + Sz * (0.04 + i * 0.032)), Math.round(Sz * (0.55 - i * 0.008)), S.bone); put(Math.round(jx + Sz * (0.04 + i * 0.032)), Math.round(Sz * (0.66 + i * 0.012)), S.bone); }
  optic(put, jx - Sz * 0.02, Sz * 0.54, Sz * 0.013, S.oil, S.oil, S.brew);
  // legs + tail curl
  [[-0.2, 0.7], [0.1, 0.72]].forEach(([dx, dy]) => ell(put, cx + dx * Sz, Sz * dy, Sz * 0.04, Sz * 0.03, (tx, ty) => mix(S.bogDk, S.bogDkk, ty)));
  for (let t = 0; t < 1; t += 0.05) put(Math.round(cx - Sz * (0.31 + t * 0.1)), Math.round(Sz * (0.6 - Math.sin(t * 2.4) * 0.06)), S.bogDk);
}

// 8 · SPORECAP MYCONID — walking mushroom; slow-spore cloud.
function drawMyconid(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.22);
  // stumpy body
  ell(put, cx, Sz * 0.62, Sz * 0.09, Sz * 0.13, (tx, ty) => mix('#c8bc9a', '#8a8064', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.1, Sz * 0.62, Sz * 0.035, Sz * 0.05, (tx, ty) => mix('#b0a582', '#7a7058', tx + ty * 0.3)));
  // big cap
  dome(put, cx, Sz * 0.42, Sz * 0.17, Sz * 0.1, S.witch, S.witchLt, S.witchDkk);
  // cap spots
  [[-0.08, 0.38], [0.05, 0.35], [0.11, 0.4], [-0.02, 0.41]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.witchLt));
  // gills
  for (let x = -0.13; x <= 0.13; x += 0.025) stroke(put, cx + x * Sz, Sz * 0.46, cx + x * Sz * 1.1, Sz * 0.485, 1, () => S.witchDkk);
  // sleepy eyes
  stroke(put, cx - Sz * 0.045, Sz * 0.55, cx - Sz * 0.015, Sz * 0.55, 1.4, () => S.oil);
  stroke(put, cx + Sz * 0.015, Sz * 0.55, cx + Sz * 0.045, Sz * 0.55, 1.4, () => S.oil);
  // spore motes
  [[-0.2, 0.3], [0.2, 0.28], [-0.14, 0.2], [0.12, 0.16]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.witchLt));
}

// 9 · HEX RAVEN — dives + brands you with a curse mark.
function drawRaven(put, Sz) {
  const cx = Sz * 0.5, cy = Sz * 0.42;
  shadow(put, Sz, cx, Sz * 0.18);
  // swept wings (mid dive)
  [-1, 1].forEach(s => {
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      stroke(put, cx + s * Sz * 0.05, cy, cx + s * Sz * (0.1 + t * 0.2), cy - Sz * (0.14 - t * 0.2), 2.2, () => t > 0.7 ? S.witchDkk : '#22262e');
    }
  });
  // body angled down
  ell(put, cx, cy + Sz * 0.05, Sz * 0.06, Sz * 0.1, (tx, ty) => mix('#3a3e4a', '#16181e', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // head + beak (down-forward)
  ell(put, cx, cy + Sz * 0.16, Sz * 0.045, Sz * 0.04, (tx, ty) => mix('#3a3e4a', '#16181e', tx + ty * 0.3));
  stroke(put, cx, cy + Sz * 0.19, cx + Sz * 0.02, cy + Sz * 0.26, 2, () => S.boneDk);
  optic(put, cx - Sz * 0.02, cy + Sz * 0.155, Sz * 0.011, S.oil, S.oil, S.witchLt);
  // tail
  for (let i = -1; i <= 1; i++) stroke(put, cx + i * 2, cy - Sz * 0.04, cx + i * Sz * 0.03, cy - Sz * 0.14, 1.6, () => '#22262e');
  // curse mark glyph below (its brand)
  rune(put, Math.round(cx + Sz * 0.18), Math.round(Sz * 0.75), S.witchLt);
  for (let a = 0; a < 6.283; a += 0.5) put(Math.round(cx + Sz * 0.18 + Math.cos(a) * Sz * 0.05), Math.round(Sz * 0.74 + Math.sin(a) * Sz * 0.04), S.witchDk);
}

// 10 · STRANGLER VINE — rooted snare; grasping tendrils.
function drawVine(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.26);
  // root knot
  ell(put, cx, Sz * 0.72, Sz * 0.13, Sz * 0.09, (tx, ty) => mix(S.mudLt, S.mudDk, clamp(tx * 0.8 + ty * 0.6, 0, 1)));
  // main tendrils reaching up/out
  [[-0.25, 0.25, -0.1], [0, 0.16, 0.02], [0.24, 0.3, 0.12], [-0.12, 0.2, -0.28], [0.12, 0.22, 0.3]].forEach(([tipx, tipy, bow]) => {
    for (let t = 0; t <= 1; t += 0.03) {
      const x = cx + lerp(0, tipx * Sz, t) + Math.sin(t * 3.14) * bow * Sz;
      const y = Sz * 0.7 - t * (Sz * 0.7 - tipy * Sz - Sz * 0.16);
      stroke(put, x, y, x, y, Math.max(1, 3.4 * (1 - t)), () => mix(S.bogLt, S.bogDkk, t * 0.6));
      if (t > 0.85) put(Math.round(x), Math.round(y), S.brew); // glowing tips
    }
  });
  // thorns
  [[-0.1, 0.5], [0.08, 0.44], [0.16, 0.55], [-0.18, 0.42]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.bone));
  // snapped-open seed maw at center
  ell(put, cx, Sz * 0.6, Sz * 0.05, Sz * 0.045, (tx, ty) => mix(S.blood, '#4e0a12', clamp((Math.abs(tx - 0.5) + Math.abs(ty - 0.5)) * 1.8, 0, 1)));
  for (let a = 0; a < 6.283; a += 0.8) put(Math.round(cx + Math.cos(a) * Sz * 0.05), Math.round(Sz * 0.6 + Math.sin(a) * Sz * 0.045), S.bone);
}

// 11 · TOAD ALCHEMIST — lobs brew flasks (mortar).
function drawToad(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.28);
  // squat toad body
  ell(put, cx, Sz * 0.6, Sz * 0.17, Sz * 0.14, (tx, ty) => {
    let b = mix(S.bogLt, S.bogDk, clamp(tx * 0.8 + ty * 0.6, 0, 1));
    if ((tx * 9 | 0) % 3 === 0 && (ty * 7 | 0) % 2 === 0) b = mix(b, S.rot, 0.4); // warts
    return b;
  });
  // belly
  ell(put, cx, Sz * 0.66, Sz * 0.1, Sz * 0.06, (tx, ty) => mix('#d8d0a8', '#a89e78', ty));
  // legs folded
  [-1, 1].forEach(s => ell(put, cx + s * Sz * 0.16, Sz * 0.68, Sz * 0.055, Sz * 0.045, (tx, ty) => mix(S.bog, S.bogDkk, ty)));
  // wide head + throat sac
  ell(put, cx, Sz * 0.44, Sz * 0.12, Sz * 0.07, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx * 0.7 + ty * 0.5, 0, 1)));
  ell(put, cx, Sz * 0.5, Sz * 0.06, Sz * 0.04, (tx, ty) => mix('#d8d0a8', '#a89e78', ty * 0.5));
  [-1, 1].forEach(s => { ell(put, cx + s * Sz * 0.08, Sz * 0.38, Sz * 0.028, Sz * 0.03, (tx, ty) => mix(S.bogLt, S.bogDk, ty)); optic(put, cx + s * Sz * 0.08, Sz * 0.38, Sz * 0.013, S.oil, S.oil, S.brew); });
  // flask held up in one webbed hand
  stroke(put, cx + Sz * 0.14, Sz * 0.5, cx + Sz * 0.22, Sz * 0.38, Sz * 0.02, () => S.bogDk);
  ell(put, cx + Sz * 0.24, Sz * 0.32, Sz * 0.035, Sz * 0.045, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx + ty * 0.4, 0, 1)));
  stroke(put, cx + Sz * 0.24, Sz * 0.26, cx + Sz * 0.24, Sz * 0.28, 2.4, () => S.woodLt); // cork
  put(Math.round(cx + Sz * 0.23), Math.round(Sz * 0.3), '#ffffff');
}

// 12 · MUD GOLEM — bog hulk; slam + slow mud pools.
function drawMudGolem(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.32);
  // heavy mud mass
  ell(put, cx, Sz * 0.52, Sz * 0.17, Sz * 0.19, (tx, ty) => mix(S.mudLt, S.mudDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  // dripping bottom
  for (let x = -0.16; x <= 0.16; x += 0.04) stroke(put, cx + x * Sz, Sz * 0.68, cx + x * Sz, Sz * (0.72 + Math.abs(Math.sin(x * 40)) * 0.06), 3, () => S.mud);
  // big fists
  [-1, 1].forEach(s => {
    stroke(put, cx + s * Sz * 0.14, Sz * 0.44, cx + s * Sz * 0.26, Sz * 0.6, Sz * 0.045, (t) => mix(S.mudLt, S.mudDk, t * 0.6));
    ell(put, cx + s * Sz * 0.27, Sz * 0.64, Sz * 0.06, Sz * 0.055, (tx, ty) => mix(S.mud, S.mudDk, clamp(tx * 0.7 + ty * 0.6, 0, 1)));
  });
  // embedded bones + roots
  stroke(put, cx - Sz * 0.08, Sz * 0.42, cx - Sz * 0.03, Sz * 0.46, 2, () => S.bone);
  put(Math.round(cx + Sz * 0.09), Math.round(Sz * 0.56), S.bone);
  stroke(put, cx + Sz * 0.04, Sz * 0.62, cx + Sz * 0.1, Sz * 0.66, 1.6, () => S.woodDk);
  // moss shoulders
  ell(put, cx - Sz * 0.09, Sz * 0.38, Sz * 0.07, Sz * 0.03, (tx, ty) => mix(S.rot, S.bogDk, ty));
  // sunken glow eyes
  optic(put, cx - Sz * 0.05, Sz * 0.44, Sz * 0.016, S.oil, S.oil, S.brew);
  optic(put, cx + Sz * 0.05, Sz * 0.44, Sz * 0.016, S.oil, S.oil, S.brew);
}

// 13 · MIRE SERPENT — S-curve strike lanes.
function drawSerpent(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.3);
  // S-coiled body
  for (let t = 0; t <= 1; t += 0.015) {
    const y = Sz * (0.78 - t * 0.42);
    const x = cx + Math.sin(t * 6.5) * Sz * 0.18 * (1 - t * 0.3);
    const r = Sz * (0.055 - t * 0.025);
    ell(put, x, y, r, r * 0.9, (tx, ty) => {
      let b = mix('#5a7a4a', '#2c4024', clamp(tx * 0.8 + ty * 0.5, 0, 1));
      if (Math.abs((t * 18) % 1) < 0.2) b = mix(b, '#1a2a16', 0.5); // bands
      return b;
    });
  }
  // head raised to strike
  const hx = cx + Math.sin(6.5) * Sz * 0.13, hy = Sz * 0.36;
  ell(put, hx, hy, Sz * 0.06, Sz * 0.05, (tx, ty) => mix('#6e9458', '#31481f', clamp(tx * 0.8 + ty * 0.4, 0, 1)));
  // hood flare
  [-1, 1].forEach(s => ell(put, hx + s * Sz * 0.055, hy + Sz * 0.01, Sz * 0.025, Sz * 0.04, (tx, ty) => mix('#5a7a4a', '#2c4024', tx + ty * 0.3)));
  optic(put, hx - Sz * 0.02, hy - Sz * 0.005, Sz * 0.011, S.oil, S.oil, S.brew);
  optic(put, hx + Sz * 0.02, hy - Sz * 0.005, Sz * 0.011, S.oil, S.oil, S.brew);
  // forked tongue
  stroke(put, hx, hy + Sz * 0.04, hx, hy + Sz * 0.09, 1, () => S.blood);
  put(Math.round(hx - 1), Math.round(hy + Sz * 0.1), S.blood); put(Math.round(hx + 1), Math.round(hy + Sz * 0.1), S.blood);
}

// 14 · GLOWCAP SPRITE — tiny healer; mends mobs with spore light.
function drawSprite(put, Sz) {
  const cx = Sz * 0.5, cy = Sz * 0.46;
  shadow(put, Sz, cx, Sz * 0.16);
  // dragonfly wings
  [-1, 1].forEach(s => { ell(put, cx + s * Sz * 0.08, cy - Sz * 0.05, Sz * 0.07, Sz * 0.025, () => S.wispLt); ell(put, cx + s * Sz * 0.07, cy - Sz * 0.005, Sz * 0.055, Sz * 0.02, () => S.wispDk); });
  // little body
  ell(put, cx, cy + Sz * 0.03, Sz * 0.04, Sz * 0.07, (tx, ty) => mix(S.bogLt, S.bogDk, clamp(tx + ty * 0.4, 0, 1)));
  // glowcap hat
  dome(put, cx, cy - Sz * 0.06, Sz * 0.05, Sz * 0.035, S.brew, S.brewLt, S.brewDk);
  put(Math.round(cx), Math.round(cy - Sz * 0.09), '#ffffff');
  // face
  optic(put, cx - Sz * 0.015, cy - Sz * 0.025, Sz * 0.009, S.oil, S.oil, '#ffffff');
  optic(put, cx + Sz * 0.015, cy - Sz * 0.025, Sz * 0.009, S.oil, S.oil, '#ffffff');
  // heal motes drifting down
  [[-0.14, 0.62], [0.13, 0.58], [0, 0.7]].forEach(([dx, dy]) => { put(Math.round(cx + dx * Sz), Math.round(Sz * dy), S.brewLt); put(Math.round(cx + dx * Sz), Math.round(Sz * dy - 2), S.brew); });
}

// 15 · MIRE WEAVER — bog spider; web slow patches.
function drawSpider(put, Sz) {
  const cx = Sz * 0.5, cy = Sz * 0.52;
  shadow(put, Sz, cx, Sz * 0.28);
  // legs (4 per side, angular)
  [-1, 1].forEach(s => {
    for (let i = 0; i < 4; i++) {
      const a = -0.5 + i * 0.42;
      const kx = cx + s * Sz * (0.14 + i * 0.015), ky = cy - Sz * 0.1 + i * Sz * 0.055;
      stroke(put, cx + s * Sz * 0.06, cy, kx, ky - Sz * 0.06, 2, () => '#3a3226');
      stroke(put, kx, ky - Sz * 0.06, kx + s * Sz * 0.06, ky + Sz * 0.04, 2, () => '#2a2419');
    }
  });
  // abdomen w/ skull-ish marking
  ell(put, cx - Sz * 0.06, cy + Sz * 0.02, Sz * 0.11, Sz * 0.09, (tx, ty) => mix('#5a4a36', '#2e2416', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  ell(put, cx - Sz * 0.07, cy, Sz * 0.035, Sz * 0.03, (tx, ty) => mix(S.bone, S.boneDk, ty));
  put(Math.round(cx - Sz * 0.08), Math.round(cy), S.oil); put(Math.round(cx - Sz * 0.06), Math.round(cy), S.oil);
  // head + eye cluster
  ell(put, cx + Sz * 0.08, cy - Sz * 0.01, Sz * 0.06, Sz * 0.05, (tx, ty) => mix('#4a3e2c', '#241e12', tx + ty * 0.4));
  [[0.06, -0.03], [0.1, -0.035], [0.08, -0.01], [0.12, -0.015]].forEach(([dx, dy]) => put(Math.round(cx + dx * Sz), Math.round(cy + dy * Sz), S.brew));
  // fangs
  put(Math.round(cx + Sz * 0.12), Math.round(cy + Sz * 0.03), S.bone); put(Math.round(cx + Sz * 0.14), Math.round(cy + Sz * 0.025), S.bone);
  // web line trailing
  for (let t = 0; t < 1; t += 0.05) put(Math.round(cx - Sz * (0.18 + t * 0.14)), Math.round(cy + Sz * (0.06 + Math.sin(t * 8) * 0.01)), S.wispLt);
}

// 16 · DROWNED ONE — rises from water patches (erupt).
function drawDrowned(put, Sz) {
  const cx = Sz * 0.5;
  // water pool it rises from
  ell(put, cx, Sz * 0.74, Sz * 0.2, Sz * 0.06, (tx, ty) => mix(S.murkLt, S.murkDk, clamp(tx * 0.6 + ty, 0, 1)));
  // torso rising (waist-deep)
  for (let y = Sz * 0.4; y < Sz * 0.74; y++) {
    const t = (y - Sz * 0.4) / (Sz * 0.34), w = Sz * (0.09 + t * 0.02);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#7a8a74', '#3e4a3a', clamp(tx * 1.1 + t * 0.2, 0, 1));
      if ((tx * 8 | 0) % 3 === 0 && t > 0.4) b = mix(b, S.murkDk, 0.5); // sodden rags
      return b;
    });
  }
  // reaching arms
  [-1, 1].forEach(s => {
    stroke(put, cx + s * Sz * 0.08, Sz * 0.46, cx + s * Sz * 0.19, Sz * 0.32, Sz * 0.025, (t) => mix('#7a8a74', '#4a5a46', t));
    // bony fingers
    for (let f = -1; f <= 1; f++) stroke(put, cx + s * Sz * 0.19, Sz * 0.32, cx + s * Sz * (0.19 + 0.03) + f * 2, Sz * 0.27, 1, () => S.boneDk);
  });
  // lolling head
  ell(put, cx + Sz * 0.02, Sz * 0.35, Sz * 0.055, Sz * 0.06, (tx, ty) => mix('#8a9a84', '#4e5e4a', clamp(tx + ty * 0.3, 0, 1)));
  optic(put, cx, Sz * 0.34, Sz * 0.012, S.oil, S.oil, S.wisp);
  optic(put, cx + Sz * 0.04, Sz * 0.345, Sz * 0.012, S.oil, S.oil, S.wisp);
  // dripping weeds
  stroke(put, cx - Sz * 0.03, Sz * 0.3, cx - Sz * 0.05, Sz * 0.42, 1.4, () => S.rot);
  stroke(put, cx + Sz * 0.06, Sz * 0.31, cx + Sz * 0.08, Sz * 0.4, 1.4, () => S.rot);
  // ripples
  for (let a = 0; a < 6.283; a += 0.5) put(Math.round(cx + Math.cos(a) * Sz * 0.16), Math.round(Sz * 0.73 + Math.sin(a) * Sz * 0.035), S.murkLt);
}

// 17 · BOTTLED IMP — thrown-jar demon; smashes free (spawner-ish zoner).
function drawImp(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.22);
  // jar
  for (let y = Sz * 0.36; y < Sz * 0.72; y++) {
    const t = (y - Sz * 0.36) / (Sz * 0.36);
    const w = Sz * (0.11 + Math.sin(t * 3.14) * 0.035);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(S.wispLt, S.wispDk, clamp(tx * 1.2 + t * 0.2, 0, 1));
      return mix(b, S.murkDk, 0.35); // dirty glass
    });
  }
  ell(put, cx, Sz * 0.36, Sz * 0.11, Sz * 0.03, (tx, ty) => mix(S.woodLt, S.woodDkk, ty)); // cork lid
  stroke(put, cx - Sz * 0.05, Sz * 0.44, cx - Sz * 0.02, Sz * 0.66, 1.2, () => '#ffffff'); // glass shine
  // imp inside — pressed against the glass
  ell(put, cx, Sz * 0.55, Sz * 0.07, Sz * 0.08, (tx, ty) => mix(S.blood, '#5e0e16', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  [-1, 1].forEach(s => { stroke(put, cx + s * Sz * 0.03, Sz * 0.48, cx + s * Sz * 0.06, Sz * 0.44, 1.6, () => S.blood); }); // horns
  optic(put, cx - Sz * 0.025, Sz * 0.53, Sz * 0.012, S.oil, S.oil, S.brewLt);
  optic(put, cx + Sz * 0.025, Sz * 0.53, Sz * 0.012, S.oil, S.oil, S.brewLt);
  // tiny hands pressed on glass
  put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.58), '#d86470'); put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.58), '#d86470');
  // crack starting
  stroke(put, cx + Sz * 0.08, Sz * 0.46, cx + Sz * 0.11, Sz * 0.52, 1, () => '#ffffff');
  // witch label
  plate(put, cx - Sz * 0.05, Sz * 0.6, cx + Sz * 0.05, Sz * 0.66, S.bone, '#fff', S.boneDk);
  rune(put, Math.round(cx), Math.round(Sz * 0.64), S.witchDk);
}

// 18 · TOTEM CRAWLER — a hex totem on spider legs; projects small hex field.
function drawTotem(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.26);
  // little wooden legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * Sz * 0.05, Sz * 0.72, cx + s * Sz * 0.13, Sz * 0.8, 2.2, () => S.woodDk);
    stroke(put, cx + s * Sz * 0.13, Sz * 0.8, cx + s * Sz * 0.15, Sz * 0.88, 2.2, () => S.woodDkk);
    stroke(put, cx + s * Sz * 0.03, Sz * 0.74, cx + s * Sz * 0.09, Sz * 0.86, 2, () => S.woodDk);
  });
  // stacked totem faces
  [[0.62, S.wood, 'grim'], [0.5, S.woodDk, 'moon'], [0.38, S.wood, 'bird']].forEach(([yy, base, kind], i) => {
    plate(put, cx - Sz * 0.09, Sz * (yy - 0.055), cx + Sz * 0.09, Sz * (yy + 0.055), base, S.woodLt, S.woodDkk);
    if (kind === 'grim') { optic(put, cx - Sz * 0.035, Sz * (yy - 0.015), Sz * 0.012, S.oil, S.oil, S.witchLt); optic(put, cx + Sz * 0.035, Sz * (yy - 0.015), Sz * 0.012, S.oil, S.oil, S.witchLt); for (let t = -1; t <= 1; t += 0.3) put(Math.round(cx + t * Sz * 0.03), Math.round(Sz * (yy + 0.03)), S.oil); }
    if (kind === 'moon') { for (let a = -1.2; a < 1.2; a += 0.1) put(Math.round(cx + Math.cos(a + 3.14 / 2) * Sz * 0.03), Math.round(Sz * yy + Math.sin(a + 3.14 / 2) * Sz * 0.03), S.wispLt); }
    if (kind === 'bird') { stroke(put, cx - Sz * 0.04, Sz * yy, cx + Sz * 0.04, Sz * yy, 1.6, () => S.oil); stroke(put, cx, Sz * (yy - 0.02), cx + Sz * 0.05, Sz * (yy + 0.02), 1.6, () => S.oil); }
  });
  // topper: carved raven skull + feathers
  ell(put, cx, Sz * 0.28, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bone, S.boneDk, tx + ty * 0.3));
  stroke(put, cx + Sz * 0.04, Sz * 0.29, cx + Sz * 0.09, Sz * 0.31, 1.6, () => S.boneDk);
  [-1, 1].forEach(s => stroke(put, cx + s * Sz * 0.05, Sz * 0.26, cx + s * Sz * 0.1, Sz * 0.18, 1.4, () => S.witchDk));
  // hex field ring
  for (let a = 0; a < 6.283; a += 0.25) put(Math.round(cx + Math.cos(a) * Sz * 0.24), Math.round(Sz * 0.6 + Math.sin(a) * Sz * 0.18), S.witchLt);
}

// 19 · CAULDRON MIMIC — elite; hops + spews brew arcs.
function drawCauldron(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.3);
  // pot body
  for (let y = Sz * 0.42; y < Sz * 0.74; y++) {
    const t = (y - Sz * 0.42) / (Sz * 0.32);
    const w = Sz * (0.16 + Math.sin(t * 2.6) * 0.05);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix('#4a4e5a', '#1c1e26', clamp(tx * 1.1 + t * 0.25, 0, 1));
      if (tx < 0.2) b = mix(b, '#6e7480', 0.4);
      return b;
    });
  }
  // rim + boiling brew
  ell(put, cx, Sz * 0.42, Sz * 0.17, Sz * 0.05, (tx, ty) => mix('#5a5e6a', '#24262e', ty));
  ell(put, cx, Sz * 0.42, Sz * 0.13, Sz * 0.035, (tx, ty) => mix(S.brewLt, S.brewDk, clamp(tx * 0.8 + ty, 0, 1)));
  // bubbles + spew
  [[-0.06, 0.36], [0.04, 0.33], [0.1, 0.37], [0, 0.28]].forEach(([dx, dy]) => ell(put, cx + dx * Sz, Sz * dy, 2.6, 2.6, () => S.brew));
  // TEETH under the rim (it's a mimic)
  for (let x = -0.14; x <= 0.14; x += 0.035) { for (let d = 0; d < 4; d++) row(put, Math.round(Sz * 0.47 + d), cx + x * Sz - (4 - d) * 0.5, cx + x * Sz + (4 - d) * 0.5, () => S.bone); }
  // one big eye peering from the brew
  optic(put, cx - Sz * 0.04, Sz * 0.41, Sz * 0.02, '#fff', '#c8c8b0', S.oil);
  // stubby iron legs mid-hop
  [-1, 0, 1].forEach(s => stroke(put, cx + s * Sz * 0.1, Sz * 0.74, cx + s * Sz * 0.13, Sz * 0.82, 2.6, () => '#1c1e26'));
  // witch rune scratched on the belly
  rune(put, Math.round(cx + Sz * 0.06), Math.round(Sz * 0.6), S.witchLt);
}

// 20 · MOSSBACK — elite hulk; moss camo, wakes furious.
function drawMossback(put, Sz) {
  const cx = Sz * 0.5;
  shadow(put, Sz, cx, Sz * 0.34);
  // hunched hill of a body
  ell(put, cx, Sz * 0.54, Sz * 0.21, Sz * 0.2, (tx, ty) => {
    let b = mix(S.bogLt, S.bogDkk, clamp(tx * 0.7 + ty * 0.6, 0, 1));
    if ((tx * 11 | 0) % 3 === 0 && (ty * 9 | 0) % 2 === 0) b = mix(b, S.rot, 0.5); // moss mange
    return b;
  });
  // grass tufts + small tree growing on its back
  for (let x = -0.16; x <= 0.18; x += 0.03) { const h = 4 + ((x * 100 | 0) % 5); for (let d = 0; d < h; d++) put(Math.round(cx + x * Sz), Math.round(Sz * 0.36 - d), d > h - 3 ? S.bogLt : S.bogDk); }
  stroke(put, cx + Sz * 0.1, Sz * 0.36, cx + Sz * 0.12, Sz * 0.24, 2.4, () => S.woodDk);
  ell(put, cx + Sz * 0.13, Sz * 0.2, Sz * 0.05, Sz * 0.04, (tx, ty) => mix(S.bog, S.bogDk, tx + ty * 0.3));
  // massive knuckle arms
  [-1, 1].forEach(s => {
    stroke(put, cx + s * Sz * 0.17, Sz * 0.5, cx + s * Sz * 0.29, Sz * 0.72, Sz * 0.05, (t) => mix(S.bog, S.bogDkk, t * 0.5));
    ell(put, cx + s * Sz * 0.3, Sz * 0.76, Sz * 0.065, Sz * 0.05, (tx, ty) => mix(S.bogDk, S.bogDkk, clamp(tx + ty * 0.4, 0, 1)));
  });
  // low heavy head, waking eye
  ell(put, cx, Sz * 0.66, Sz * 0.1, Sz * 0.075, (tx, ty) => mix(S.bog, S.bogDkk, clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  optic(put, cx - Sz * 0.035, Sz * 0.65, Sz * 0.016, S.oil, S.oil, S.blood);
  stroke(put, cx + Sz * 0.02, Sz * 0.65, cx + Sz * 0.06, Sz * 0.65, 1.6, () => S.oil); // other eye still shut
  // tusks
  put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.71), S.bone); put(Math.round(cx - Sz * 0.06), Math.round(Sz * 0.7), S.bone);
  put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.71), S.bone); put(Math.round(cx + Sz * 0.06), Math.round(Sz * 0.7), S.bone);
}

const LIST = [
  { n: 1, name: 'BOGLING', role: 'mud imp swarm', draw: drawBogling },
  { n: 2, name: 'GIANT LEECH', role: 'latch + drain', draw: drawLeech },
  { n: 3, name: 'WILL-O-WISP', role: 'lures, then pops', draw: drawWisp },
  { n: 4, name: 'SKEETER CLOUD', role: 'fast harasser', draw: drawSkeeters },
  { n: 5, name: 'SNAPJAW TURTLE', role: 'shell tank', draw: drawTurtle },
  { n: 6, name: 'WITCHLING', role: 'hex bolt caster', draw: drawWitchling },
  { n: 7, name: 'GATOR BRUTE', role: 'lane lunger', draw: drawGator },
  { n: 8, name: 'SPORECAP MYCONID', role: 'slow-spore cloud', draw: drawMyconid },
  { n: 9, name: 'HEX RAVEN', role: 'dive + curse mark', draw: drawRaven },
  { n: 10, name: 'STRANGLER VINE', role: 'rooted snare', draw: drawVine },
  { n: 11, name: 'TOAD ALCHEMIST', role: 'flask lobber', draw: drawToad },
  { n: 12, name: 'MUD GOLEM', role: 'slam + mud pools', draw: drawMudGolem },
  { n: 13, name: 'MIRE SERPENT', role: 'S-curve striker', draw: drawSerpent },
  { n: 14, name: 'GLOWCAP SPRITE', role: 'heals mobs', draw: drawSprite },
  { n: 15, name: 'MIRE WEAVER', role: 'web slow patches', draw: drawSpider },
  { n: 16, name: 'DROWNED ONE', role: 'rises from water', draw: drawDrowned },
  { n: 17, name: 'BOTTLED IMP', role: 'jar demon zoner', draw: drawImp },
  { n: 18, name: 'TOTEM CRAWLER', role: 'walking hex field', draw: drawTotem },
  { n: 19, name: 'CAULDRON MIMIC', role: 'elite brew spewer', draw: drawCauldron },
  { n: 20, name: 'MOSSBACK', role: 'elite camo hulk', draw: drawMossback },
];

renderSheet({ list: LIST, out: process.argv[2] || 'swamp_mob_options.png', title: "WITCH'S SWAMP — MOB CANDIDATES (pick your roster, any count)", S: 160 });
