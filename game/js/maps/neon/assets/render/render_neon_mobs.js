// artdev/neon/render_neon_mobs.js — 20 numbered NEON CITY mob
// candidates, one PNG grid. Rain-slick cyberpunk street ecology.
'use strict';
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, lerp, plate, dome, optic, shadow, renderSheet, glow, visor, rain, glitchBar } = KIT;

// humanoid base
function body(put, S, cx, o) {
  o = o || {};
  const jacket = o.jacket || [N.leather, N.leatherLt, N.leatherDk];
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.04, S * 0.6, cx + s * S * 0.05, S * 0.82, S * 0.03, () => o.pants || N.denim);
    plate(put, cx + s * S * 0.05 - S * 0.03, S * 0.82, cx + s * S * 0.05 + S * 0.035, S * 0.86, N.gunDk, N.gun, N.oil);
  });
  for (let y = S * 0.42; y < S * 0.62; y++) {
    const t = (y - S * 0.42) / (S * 0.2), w = S * (0.08 + t * 0.015) * (o.wide || 1);
    row(put, Math.round(y), cx - w, cx + w, (tx) => {
      let b = mix(jacket[1], jacket[0], clamp(tx * 1.3, 0, 1));
      if (tx > 0.72) b = mix(b, jacket[2], 0.6);
      if (o.shirt && Math.abs(tx - 0.5) < 0.09 && t < 0.55) b = mix(b, o.shirt, 0.85);
      return b;
    });
  }
}
function head(put, S, cx, cy, skin) {
  ell(put, cx, cy, S * 0.05, S * 0.055, (tx, ty) => mix(skin || N.skin, N.skinDk, clamp(tx + ty * 0.3, 0, 1)));
}

// 1 · STREET PUNK — chain swinger swarm
function drawPunk(put, S) {
  const cx = S * 0.5; rain(put, S, 5, 1); shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { jacket: [N.leather, N.leatherLt, N.leatherDk], shirt: N.pink });
  head(put, S, cx, S * 0.36);
  // neon mohawk
  for (let i = -3; i <= 3; i++) stroke(put, cx + i * S * 0.012, S * 0.32, cx + i * S * 0.014, S * 0.25 - Math.abs(i) * 2, 1.6, () => N.pink);
  optic(put, cx - S * 0.02, S * 0.35, S * 0.009, N.oil, N.oil, '#ffffff');
  optic(put, cx + S * 0.02, S * 0.35, S * 0.009, N.oil, N.oil, '#ffffff');
  // spinning chain
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.15, S * 0.4, S * 0.02, () => N.leather);
  for (let a = 0; a < 5; a += 0.5) put(Math.round(cx + S * 0.16 + Math.cos(a) * S * 0.06), Math.round(S * 0.38 + Math.sin(a) * S * 0.06), a % 1 < 0.5 ? N.chrome : N.chromeDk);
  put(Math.round(cx + S * 0.22), Math.round(S * 0.34), N.chromeLt); // chain end
}
// 2 · CYBER HOUND — chrome pack lunger
function drawHound(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 2); shadow(put, S, cx, S * 0.3);
  ell(put, cx + S * 0.02, S * 0.58, S * 0.13, S * 0.075, (tx, ty) => mix(N.chrome, N.chromeDk, clamp(tx * 0.9 + ty * 0.5, 0, 1)));
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.08, S * 0.62, cx + s * S * 0.1, S * 0.76, S * 0.02, () => N.gun); });
  stroke(put, cx + S * 0.14, S * 0.55, cx + S * 0.22, S * 0.48, S * 0.012, () => N.gun); // tail antenna
  put(Math.round(cx + S * 0.23), Math.round(S * 0.47), N.redN);
  // head lunging
  ell(put, cx - S * 0.15, S * 0.5, S * 0.05, S * 0.04, (tx, ty) => mix(N.chromeLt, N.chromeDk, tx + ty * 0.3));
  visor(put, cx - S * 0.16, S * 0.49, S * 0.025, N.redN, N.redNLt);
  row(put, Math.round(S * 0.53), cx - S * 0.2, cx - S * 0.14, () => N.oil); // jaw
  for (let i = 0; i < 3; i++) put(Math.round(cx - S * (0.19 - i * 0.018)), Math.round(S * 0.535), N.white);
  // spine glow
  glow(put, cx - S * 0.08, S * 0.545, cx + S * 0.12, S * 0.545, 1, N.cyan);
}
// 3 · SPY DRONE — hovering aimed laser
function drawDrone(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 3);
  // rotor blur
  [[-0.1], [0.1]].forEach(([dx]) => { ell(put, cx + dx * S, S * 0.36, S * 0.05, S * 0.008, (tx) => mix(N.chromeDk, N.night, tx)); stroke(put, cx + dx * S, S * 0.37, cx + dx * S, S * 0.4, 1.4, () => N.gun); });
  // body pod
  dome(put, cx, S * 0.45, S * 0.07, S * 0.055, N.gun, N.chrome, N.gunDk);
  // camera eye
  optic(put, cx, S * 0.46, S * 0.016, N.oil, N.redN, N.redNLt);
  // aim line telegraph
  for (let t = 0; t < 1; t += 0.08) put(Math.round(cx - S * 0.02 - t * S * 0.24), Math.round(S * 0.5 + t * S * 0.18), t % 0.16 < 0.08 ? N.redN : N.redNDk);
  // landing feelers
  [[-0.05], [0.05]].forEach(([dx]) => stroke(put, cx + dx * S, S * 0.5, cx + dx * S * 1.6, S * 0.56, 1.2, () => N.gunDk));
}
// 4 · RIOT ENFORCER — corp cop shield wall
function drawEnforcer(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 4); shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { jacket: [N.gun, N.chrome, N.gunDk], wide: 1.1, pants: N.gunDk });
  head(put, S, cx, S * 0.35);
  // full helm + amber visor
  dome(put, cx, S * 0.34, S * 0.055, S * 0.06, N.gun, N.chrome, N.gunDk);
  visor(put, cx, S * 0.34, S * 0.04, N.amber, N.amberLt);
  // riot shield (transparent poly w/ neon edge)
  for (let y = S * 0.4; y < S * 0.72; y++) row(put, Math.round(y), cx - S * 0.2, cx - S * 0.06, (tx) => mix(mix(N.cyan, N.night, 0.75), N.night, clamp(tx + 0.2, 0, 1)));
  glow(put, cx - S * 0.2, S * 0.4, cx - S * 0.2, S * 0.72, 1, N.cyan);
  glow(put, cx - S * 0.2, S * 0.4, cx - S * 0.06, S * 0.4, 1, N.cyan);
  // stun baton
  stroke(put, cx + S * 0.08, S * 0.47, cx + S * 0.17, S * 0.38, S * 0.016, () => N.gun);
  glow(put, cx + S * 0.17, S * 0.38, cx + S * 0.22, S * 0.33, 1.2, N.amber);
}
// 5 · NETRUNNER — glitch-zone caster
function drawNetrunner(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 5); shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { jacket: [N.purpleDk, N.purple, '#2a0a4a'], shirt: N.green });
  head(put, S, cx, S * 0.36, N.skin2);
  // AR goggles + cable dreads
  visor(put, cx, S * 0.35, S * 0.035, N.green, N.greenLt);
  for (let i = -2; i <= 2; i++) { stroke(put, cx + i * S * 0.015, S * 0.31, cx + i * S * 0.03, S * 0.24, 1.4, () => (i % 2 ? N.purple : N.gunDk)); put(Math.round(cx + i * S * 0.03), Math.round(S * 0.235), N.green); }
  // deck on forearm, casting hand up
  stroke(put, cx - S * 0.08, S * 0.46, cx - S * 0.16, S * 0.38, S * 0.02, () => N.purpleDk);
  plate(put, cx - S * 0.2, S * 0.35, cx - S * 0.12, S * 0.4, N.gun, N.chrome, N.gunDk);
  // glitch square projectiles
  glitchBar(put, cx - S * 0.24, S * 0.3, S * 0.03, N.green, N.pink);
  glitchBar(put, cx - S * 0.28, S * 0.24, S * 0.024, N.cyan, N.green);
  glitchBar(put, cx - S * 0.2, S * 0.2, S * 0.02, N.pink, N.cyan);
}
// 6 · HOLO DIVA — decoy illusionist
function drawHolo(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 6); shadow(put, S, cx, S * 0.2);
  // real body
  body(put, S, cx, { jacket: ['#3a1a4a', '#6a3a8a', '#1a0a24'], shirt: N.pink });
  head(put, S, cx, S * 0.36);
  // glam bob + shades
  ell(put, cx, S * 0.335, S * 0.055, S * 0.04, (tx, ty) => (ty < 0.6 ? mix(N.pink, N.pinkDk, tx) : null));
  visor(put, cx, S * 0.355, S * 0.03, N.purple, N.purpleLt);
  // two hologram after-images (cyan ghosts, offset)
  [[-0.22, 0.55], [0.22, 0.45]].forEach(([dx, al]) => {
    for (let y = S * 0.42; y < S * 0.62; y += 2) {
      const t = (y - S * 0.42) / (S * 0.2), w = S * (0.08 + t * 0.015);
      row(put, Math.round(y), cx + dx * S - w, cx + dx * S + w, (tx) => ((tx * 8 | 0) % 2 ? mix(N.cyan, N.night, al) : null));
    }
    ell(put, cx + dx * S, S * 0.36, S * 0.04, S * 0.045, (tx, ty) => ((ty * 6 | 0) % 2 ? mix(N.cyanLt, N.night, al) : null));
  });
}
// 7 · CHROME RONIN — dash slasher
function drawRonin(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 7); shadow(put, S, cx, S * 0.24);
  body(put, S, cx, { jacket: [N.nightLt, N.concreteLt, N.nightDk], shirt: N.redN });
  // chrome arm
  stroke(put, cx + S * 0.07, S * 0.45, cx + S * 0.17, S * 0.36, S * 0.022, () => N.chrome);
  head(put, S, cx, S * 0.36);
  // topknot + half-mask
  ell(put, cx, S * 0.31, S * 0.02, S * 0.025, (tx, ty) => mix(N.oil, N.leatherDk, ty));
  row(put, Math.round(S * 0.38), cx - S * 0.045, cx + S * 0.045, () => N.gunDk);
  optic(put, cx - S * 0.02, S * 0.35, S * 0.009, N.oil, N.redN, N.redNLt);
  optic(put, cx + S * 0.02, S * 0.35, S * 0.009, N.oil, N.redN, N.redNLt);
  // mono-katana raised w/ neon edge
  stroke(put, cx + S * 0.18, S * 0.35, cx + S * 0.3, S * 0.2, 2.4, () => N.chrome);
  glow(put, cx + S * 0.185, S * 0.345, cx + S * 0.305, S * 0.195, 0.9, N.pink);
  // dash lines behind
  [[-0.2, 0.5], [-0.24, 0.56], [-0.18, 0.62]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx - 0.06) * S, S * dy, 1.2, () => N.nightLt));
}
// 8 · NOODLE-BOT — rogue vendor, scald spray
function drawNoodle(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 8); shadow(put, S, cx, S * 0.26);
  // cart body
  plate(put, cx - S * 0.14, S * 0.48, cx + S * 0.14, S * 0.7, '#8a2a2a', '#c85a4a', '#4a1414');
  row(put, Math.round(S * 0.48), cx - S * 0.16, cx + S * 0.16, () => N.amber);
  // wheels
  [[-0.09], [0.09]].forEach(([dx]) => ell(put, cx + dx * S, S * 0.74, S * 0.035, S * 0.035, (tx, ty) => mix(N.gun, N.gunDk, ty)));
  // pot + steam
  ell(put, cx, S * 0.44, S * 0.07, S * 0.035, (tx, ty) => mix(N.chrome, N.chromeDk, tx + ty * 0.4));
  [[-0.03, 0.36], [0.02, 0.32], [0.05, 0.38]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), N.white));
  // bot head pops from the pot — angry
  ell(put, cx, S * 0.38, S * 0.035, S * 0.032, (tx, ty) => mix(N.chromeLt, N.chromeDk, tx + ty * 0.3));
  visor(put, cx, S * 0.375, S * 0.02, N.redN, N.redNLt);
  // ladle arm spraying scald cone
  stroke(put, cx + S * 0.08, S * 0.5, cx + S * 0.18, S * 0.42, S * 0.014, () => N.chromeDk);
  for (let t = 0; t < 1; t += 0.14) [[-1], [0], [1]].forEach(([s]) => put(Math.round(cx + S * (0.2 + t * 0.1)), Math.round(S * (0.42 + s * t * 0.05)), t % 0.28 < 0.14 ? N.amberLt : N.amber));
  // hanzi sign glow
  glow(put, cx - S * 0.13, S * 0.54, cx - S * 0.13, S * 0.64, 1, N.pink);
  glow(put, cx + S * 0.13, S * 0.54, cx + S * 0.13, S * 0.64, 1, N.cyan);
}
// 9 · TURRET POD — anchored laser lanes
function drawTurret(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 9); shadow(put, S, cx, S * 0.24);
  // tripod + pod
  [[-0.1], [0.1], [0]].forEach(([dx]) => stroke(put, cx, S * 0.6, cx + dx * S, S * 0.76, 2.2, () => N.gunDk));
  dome(put, cx, S * 0.52, S * 0.08, S * 0.07, N.gun, N.chrome, N.gunDk);
  // twin barrels
  [[-0.02], [0.02]].forEach(([dy]) => stroke(put, cx + S * 0.04, S * (0.52 + dy), cx + S * 0.2, S * (0.5 + dy), 1.8, () => N.gunDk));
  optic(put, cx - S * 0.02, S * 0.5, S * 0.013, N.oil, N.redN, N.redNLt);
  // warned laser lane
  for (let t = 0; t < 1; t += 0.06) put(Math.round(cx + S * (0.21 + t * 0.16)), Math.round(S * (0.5 - t * 0.03)), t % 0.12 < 0.06 ? N.redN : N.redNDk);
  glow(put, cx - S * 0.06, S * 0.585, cx + S * 0.06, S * 0.585, 0.9, N.cyan); // status ring
}
// 10 · CYBER RATS — glowing sewer swarm
function drawRats(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 10); shadow(put, S, cx, S * 0.26);
  [[0, 0.62, 1], [-0.15, 0.55, 0.85], [0.14, 0.5, 0.75]].forEach(([dx, dy, sc]) => {
    const rx = cx + dx * S, ry = S * dy;
    ell(put, rx, ry, S * 0.06 * sc, S * 0.035 * sc, (tx, ty) => mix('#4a4456', '#26222e', clamp(tx * 0.9 + ty * 0.5, 0, 1)));
    ell(put, rx - S * 0.055 * sc, ry - S * 0.008, S * 0.025 * sc, S * 0.02 * sc, (tx, ty) => mix('#4a4456', '#26222e', tx));
    put(Math.round(rx - S * 0.07 * sc), Math.round(ry - S * 0.012), N.greenLt); // eye
    // cyber tail glow
    for (let t = 0; t < 1; t += 0.12) put(Math.round(rx + S * (0.06 + t * 0.08) * sc), Math.round(ry - t * S * 0.02 + Math.sin(t * 8) * 2), N.green);
    // back implant
    put(Math.round(rx), Math.round(ry - S * 0.03 * sc), N.chrome);
  });
}
// 11 · ROAD HOG — drive-by biker
function drawBiker(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 11); shadow(put, S, cx, S * 0.32);
  // bike body low + long
  stroke(put, cx - S * 0.2, S * 0.62, cx + S * 0.18, S * 0.6, S * 0.035, () => N.gun);
  // wheels w/ neon rims
  [[-0.18], [0.16]].forEach(([dx]) => {
    ell(put, cx + dx * S, S * 0.68, S * 0.07, S * 0.07, (tx, ty) => ((tx - 0.5) ** 2 + (ty - 0.5) ** 2 > 0.14 ? N.gunDk : null));
    for (let a = 0; a < 6.28; a += 0.6) put(Math.round(cx + dx * S + Math.cos(a) * S * 0.055), Math.round(S * 0.68 + Math.sin(a) * S * 0.055), N.pink);
  });
  // rider crouched
  ell(put, cx - S * 0.02, S * 0.5, S * 0.06, S * 0.05, (tx, ty) => mix(N.leatherLt, N.leatherDk, tx + ty * 0.3));
  ell(put, cx + S * 0.05, S * 0.45, S * 0.035, S * 0.035, (tx, ty) => mix(N.gun, N.gunDk, ty)); // helmet
  visor(put, cx + S * 0.05, S * 0.445, S * 0.02, N.cyan, N.cyanLt);
  stroke(put, cx + S * 0.08, S * 0.5, cx + S * 0.16, S * 0.56, S * 0.014, () => N.leather); // arm to bars
  // headlight beam + speed lines
  glow(put, cx + S * 0.2, S * 0.6, cx + S * 0.3, S * 0.6, 1.4, N.amber);
  [[-0.3, 0.56], [-0.32, 0.62], [-0.28, 0.66]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx - 0.06) * S, S * dy, 1.2, () => N.nightLt));
}
// 12 · SYNTH ASSASSIN — stealth shimmer strike
function drawAssassin(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 12); shadow(put, S, cx, S * 0.18);
  // half-cloaked body (dashed outline right side)
  for (let y = S * 0.42; y < S * 0.62; y++) {
    const t = (y - S * 0.42) / (S * 0.2), w = S * (0.075 + t * 0.012);
    row(put, Math.round(y), cx - w, cx, (tx) => mix('#2e3440', '#181c26', clamp(tx + t * 0.3, 0, 1)));
    if ((y | 0) % 3 === 0) row(put, Math.round(y), cx, cx + w, (tx) => mix(N.cyan, N.night, 0.7));
  }
  // legs (solid + shimmer)
  stroke(put, cx - S * 0.04, S * 0.6, cx - S * 0.05, S * 0.82, S * 0.026, () => '#181c26');
  for (let y = S * 0.6; y < S * 0.82; y += 3) put(Math.round(cx + S * 0.05), Math.round(y), mix(N.cyan, N.night, 0.65));
  head(put, S, cx - S * 0.01, S * 0.36, N.skin2);
  row(put, Math.round(S * 0.34), cx - S * 0.05, cx + S * 0.03, () => '#181c26'); // hood shadow
  put(Math.round(cx - S * 0.02), Math.round(S * 0.355), N.cyan); // one lit eye
  // blade half-materialized
  stroke(put, cx - S * 0.08, S * 0.47, cx - S * 0.17, S * 0.4, S * 0.016, () => '#2e3440');
  for (let t = 0; t < 1; t += 0.12) put(Math.round(cx - S * (0.18 + t * 0.08)), Math.round(S * (0.39 - t * 0.06)), t % 0.24 < 0.12 ? N.cyanLt : N.chrome);
}
// 13 · TAG PHANTOM — graffiti ghost, paint zones
function drawTagger(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 13);
  // spray-paint body (drippy blob rising from a tag)
  for (let y = S * 0.78; y > S * 0.4; y--) {
    const t = (S * 0.78 - y) / (S * 0.38);
    const w = S * (0.03 + Math.sin(t * Math.PI) * 0.08);
    row(put, Math.round(y), cx - w + Math.sin(y * 0.15) * 3, cx + w + Math.sin(y * 0.15) * 3, (tx) => {
      const c = t > 0.65 ? N.pink : t > 0.3 ? N.purple : N.cyan;
      return mix(c, N.night, clamp(tx * 0.5 + (1 - t) * 0.35, 0, 0.75));
    });
  }
  // face — dripping eyes + grin
  ell(put, cx - S * 0.025, S * 0.47, S * 0.012, S * 0.016, () => N.white);
  ell(put, cx + S * 0.03, S * 0.47, S * 0.012, S * 0.016, () => N.white);
  stroke(put, cx - S * 0.025, S * 0.49, cx - S * 0.025, S * 0.54, 1, () => N.white);
  for (let x = -0.03; x <= 0.03; x += 0.008) put(Math.round(cx + x * S), Math.round(S * 0.52 + (1 - (x / 0.03) ** 2) * 2), N.white);
  // spray can in mist hand
  stroke(put, cx + S * 0.07, S * 0.52, cx + S * 0.14, S * 0.46, S * 0.016, () => N.purple);
  plate(put, cx + S * 0.13, S * 0.38, cx + S * 0.17, S * 0.45, N.chrome, N.chromeLt, N.chromeDk);
  // paint cloud
  [[0.2, 0.32], [0.24, 0.28], [0.27, 0.33], [0.22, 0.37]].forEach(([dx, dy], i) => ell(put, cx + dx * S, S * dy, S * 0.02, S * 0.016, (tx) => mix([N.pink, N.cyan, N.green, N.purple][i % 4], N.night, tx * 0.5)));
  // base tag puddle
  ell(put, cx, S * 0.8, S * 0.1, S * 0.02, (tx) => mix(N.pink, N.purpleDk, tx));
}
// 14 · CARGO LIFTER — elite drone, drops goons
function drawLifter(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 14);
  // quad rotors
  [[-0.14, 0.3], [0.14, 0.3], [-0.14, 0.34], [0.14, 0.34]].forEach(([dx, dy], i) => { if (i < 2) { ell(put, cx + dx * S, S * dy, S * 0.055, S * 0.008, (tx) => mix(N.chromeDk, N.night, tx)); stroke(put, cx + dx * S, S * (dy + 0.01), cx + dx * S * 0.5, S * 0.38, 1.4, () => N.gun); } });
  // hull
  plate(put, cx - S * 0.1, S * 0.38, cx + S * 0.1, S * 0.5, N.amberDk, N.amber, N.gunDk);
  hazardStripes(put, cx - S * 0.1, S * 0.47, cx + S * 0.1, S * 0.5);
  function hazardStripes(put2, x0, y0, x1, y1) { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) put2(Math.round(x), Math.round(y), (Math.floor((x + y) / 3) % 2 === 0) ? N.amber : N.gunDk); }
  optic(put, cx, S * 0.42, S * 0.012, N.oil, N.redN, N.redNLt);
  // cargo crate on winch
  stroke(put, cx, S * 0.5, cx, S * 0.6, 1, () => N.chromeDk);
  plate(put, cx - S * 0.06, S * 0.6, cx + S * 0.06, S * 0.7, N.concrete, N.concreteLt, N.concreteDk);
  // goon silhouette inside (drop incoming)
  ell(put, cx, S * 0.65, S * 0.02, S * 0.025, () => N.oil);
  // warn circle below
  for (let a = 0; a < 6.28; a += 0.4) put(Math.round(cx + Math.cos(a) * S * 0.09), Math.round(S * 0.8 + Math.sin(a) * S * 0.025), a % 0.8 < 0.4 ? N.redN : N.redNDk);
}
// 15 · GLITCH WRAITH — teleport striker
function drawGlitch(put, S) {
  const cx = S * 0.5;
  // corrupted humanoid — displaced slices
  for (let y = S * 0.36; y < S * 0.72; y += 2) {
    const t = (y - S * 0.36) / (S * 0.36);
    const off = (Math.sin(y * 1.7) > 0.6 ? S * 0.04 : 0) * (Math.sin(y * 0.9) > 0 ? 1 : -1);
    const w = S * (0.06 + Math.sin(t * Math.PI) * 0.03);
    const c = (y | 0) % 6 < 2 ? N.pink : (y | 0) % 6 < 4 ? N.cyan : N.white;
    row(put, Math.round(y), cx - w + off, cx + w + off, (tx) => ((tx * 10 | 0) % 3 === 0 ? mix(c, N.night, 0.35) : mix('#1a1826', N.night, tx)));
  }
  // head slice stack
  [[0.3, -0.03], [0.32, 0.02], [0.34, -0.01]].forEach(([dy, off]) => row(put, Math.round(S * dy), cx - S * 0.04 + off * S, cx + S * 0.04 + off * S, (tx) => mix(N.white, N.pink, tx)));
  // eyes wrong place
  put(Math.round(cx - S * 0.05), Math.round(S * 0.33), N.cyanLt);
  put(Math.round(cx + S * 0.06), Math.round(S * 0.3), N.cyanLt);
  // teleport after-image dashes
  [[-0.2, 0.5], [0.22, 0.42]].forEach(([dx, dy]) => glitchBar(put, cx + dx * S, S * dy, S * 0.035, N.pink, N.cyan));
  // static feet dissolve
  for (let i = 0; i < 14; i++) put(Math.round(cx - S * 0.05 + (i * 37) % (S * 0.1 | 0)), Math.round(S * 0.72 + (i * 13) % 8), i % 2 ? N.pink : N.cyan);
}
// 16 · CORPO HANDLER — buffer/commander
function drawCorpo(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 16); shadow(put, S, cx, S * 0.22);
  body(put, S, cx, { jacket: ['#2a2a3a', '#4a4a5e', '#16161e'], shirt: N.white, pants: '#16161e' });
  // tie glow
  stroke(put, cx, S * 0.44, cx, S * 0.54, 1.6, () => N.redN);
  head(put, S, cx, S * 0.36);
  // slick hair + chrome jaw implant
  ell(put, cx, S * 0.335, S * 0.05, S * 0.03, (tx, ty) => (ty < 0.6 ? mix('#16161e', '#3a3a4a', tx) : null));
  row(put, Math.round(S * 0.385), cx - S * 0.03, cx + S * 0.03, () => N.chrome);
  optic(put, cx - S * 0.02, S * 0.35, S * 0.009, N.oil, N.amber, N.amberLt);
  optic(put, cx + S * 0.02, S * 0.35, S * 0.009, N.oil, N.amber, N.amberLt);
  // holo clipboard + command aura
  plate(put, cx - S * 0.17, S * 0.44, cx - S * 0.09, S * 0.54, mix(N.cyan, N.night, 0.7), mix(N.cyanLt, N.night, 0.6), N.night);
  glow(put, cx - S * 0.17, S * 0.44, cx - S * 0.09, S * 0.44, 0.8, N.cyan);
  for (let a = 0; a < 6.28; a += 0.5) put(Math.round(cx + Math.cos(a) * S * 0.14), Math.round(S * 0.5 + Math.sin(a) * S * 0.14 * 0.4), a % 1 < 0.5 ? N.amber : N.amberDk); // buff ring
}
// 17 · SCRAP GOLEM — junk tank
function drawScrap(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 17); shadow(put, S, cx, S * 0.3);
  // heap body of plates + parts
  [[-0.08, 0.5, 0.1, 0.09, N.concrete], [0.06, 0.46, 0.09, 0.08, N.rust], [0, 0.58, 0.13, 0.1, N.gun], [-0.05, 0.68, 0.11, 0.08, N.concreteDk]].forEach(([dx, dy, w, h, c]) => {
    plate(put, cx + (dx - w) * S, S * (dy - h / 2), cx + (dx + w) * S, S * (dy + h / 2), c, mix(c, '#ffffff', 0.25), mix(c, '#000000', 0.4));
  });
  // arms — girder + pipe
  stroke(put, cx - S * 0.12, S * 0.5, cx - S * 0.22, S * 0.66, S * 0.035, () => N.rust);
  stroke(put, cx + S * 0.12, S * 0.5, cx + S * 0.22, S * 0.64, S * 0.03, () => N.gun);
  plate(put, cx - S * 0.26, S * 0.64, cx - S * 0.18, S * 0.72, N.gun, N.chrome, N.gunDk); // girder fist
  // head — old monitor w/ angry face
  plate(put, cx - S * 0.05, S * 0.32, cx + S * 0.05, S * 0.42, N.concreteDk, N.concrete, N.oil);
  row(put, Math.round(S * 0.36), cx - S * 0.03, cx - S * 0.01, () => N.green);
  row(put, Math.round(S * 0.36), cx + S * 0.01, cx + S * 0.03, () => N.green);
  stroke(put, cx - S * 0.02, S * 0.395, cx + S * 0.02, S * 0.39, 1, () => N.green);
  // sparks
  [[0.14, 0.44], [-0.16, 0.46]].forEach(([dx, dy]) => put(Math.round(cx + dx * S), Math.round(S * dy), N.amberLt));
}
// 18 · NEON VIPER — light-trail striker
function drawViper(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 18);
  // snake of pure neon light, S-curve w/ trail
  for (let t = 0; t < 1; t += 0.02) {
    const px = cx - S * 0.2 + t * S * 0.42, py = S * 0.55 + Math.sin(t * 6.2) * S * 0.08 * (1 - t * 0.2);
    const w = S * (0.012 + Math.sin(Math.min(t * 3, 1) * Math.PI * 0.5) * 0.014);
    ell(put, px, py, w * 2.4, w * 2.4, () => mix(N.green, N.night, 0.72)); // haze
    ell(put, px, py, w, w, () => N.green);
    if ((t * 30 | 0) % 4 === 0) put(Math.round(px), Math.round(py), N.greenLt);
  }
  // head + tongue
  ell(put, cx - S * 0.21, S * 0.53, S * 0.03, S * 0.024, (tx, ty) => mix(N.greenLt, N.green, ty));
  put(Math.round(cx - S * 0.23), Math.round(S * 0.525), N.oil);
  stroke(put, cx - S * 0.24, S * 0.54, cx - S * 0.28, S * 0.55, 0.9, () => N.pinkLt);
  // trailing after-glow dashes
  [[0.24, 0.5], [0.27, 0.56]].forEach(([dx, dy]) => stroke(put, cx + dx * S, S * dy, cx + (dx + 0.05) * S, S * dy, 1, () => mix(N.green, N.night, 0.5)));
}
// 19 · EXO LOADER — elite mech suit
function drawLoader(put, S) {
  const cx = S * 0.5; rain(put, S, 4, 19); shadow(put, S, cx, S * 0.3);
  // heavy legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.07, S * 0.6, cx + s * S * 0.09, S * 0.8, S * 0.045, () => N.amberDk);
    plate(put, cx + s * S * 0.09 - S * 0.05, S * 0.8, cx + s * S * 0.09 + S * 0.05, S * 0.87, N.gun, N.chrome, N.gunDk);
  });
  // cage torso w/ pilot
  plate(put, cx - S * 0.11, S * 0.4, cx + S * 0.11, S * 0.6, N.amber, N.amberLt, N.amberDk);
  for (let y = S * 0.42; y < S * 0.5; y++) row(put, Math.round(y), cx - S * 0.04, cx + S * 0.04, (tx) => mix(N.nightDk, N.night, tx)); // cockpit
  ell(put, cx, S * 0.455, S * 0.02, S * 0.02, (tx, ty) => mix(N.skin, N.skinDk, ty)); // pilot head
  // hydraulic arms + claw fists
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, S * 0.44, cx + s * S * 0.22, S * 0.56, S * 0.04, () => N.amberDk);
    plate(put, cx + s * S * 0.22 - S * 0.045, S * 0.54, cx + s * S * 0.22 + S * 0.045, S * 0.64, N.gun, N.chrome, N.gunDk);
    [[-1], [1]].forEach(([f]) => stroke(put, cx + s * S * 0.22 + f * S * 0.02, S * 0.64, cx + s * S * 0.22 + f * S * 0.03, S * 0.68, 2, () => N.gunDk));
  });
  // warning beacon
  glow(put, cx, S * 0.38, cx, S * 0.38, 1.6, N.redN);
}
// 20 · AD-BOT — billboard drone, flash ads
function drawAdbot(put, S) {
  const cx = S * 0.5; rain(put, S, 3, 20);
  // floating billboard
  plate(put, cx - S * 0.14, S * 0.34, cx + S * 0.14, S * 0.52, N.nightDk, N.nightLt, N.oil);
  glow(put, cx - S * 0.14, S * 0.34, cx + S * 0.14, S * 0.34, 0.9, N.pink);
  glow(put, cx - S * 0.14, S * 0.52, cx + S * 0.14, S * 0.52, 0.9, N.cyan);
  // AD content — smiley + BUY
  ell(put, cx - S * 0.06, S * 0.42, S * 0.025, S * 0.025, () => N.amber);
  put(Math.round(cx - S * 0.068), Math.round(S * 0.415), N.oil); put(Math.round(cx - S * 0.052), Math.round(S * 0.415), N.oil);
  for (let x = -0.075; x <= -0.045; x += 0.008) put(Math.round(cx + x * S), Math.round(S * 0.43 + (1 - ((x + 0.06) / 0.015) ** 2) * 1), N.oil);
  [[0.02, 0.4], [0.06, 0.4], [0.1, 0.4]].forEach(([dx, dy]) => row(put, Math.round(S * (dy + 0.02)), cx + dx * S, cx + (dx + 0.025) * S, () => N.pinkLt)); // BUY bars
  row(put, Math.round(S * 0.47), cx + S * 0.02, cx + S * 0.12, () => N.cyanLt);
  // thruster + flash burst
  stroke(put, cx, S * 0.52, cx, S * 0.58, 2, () => N.gun);
  put(Math.round(cx), Math.round(S * 0.6), N.cyanLt);
  // FLASH rays (blind telegraph)
  for (let a = 0; a < 6.28; a += 0.8) stroke(put, cx + Math.cos(a) * S * 0.16, S * 0.43 + Math.sin(a) * S * 0.12, cx + Math.cos(a) * S * 0.22, S * 0.43 + Math.sin(a) * S * 0.17, 1, () => N.white);
}

const LIST = [
  { n: 1, name: 'STREET PUNK', role: 'chain-swing swarm', draw: drawPunk },
  { n: 2, name: 'CYBER HOUND', role: 'chrome pack lunger', draw: drawHound },
  { n: 3, name: 'SPY DRONE', role: 'hover + aimed laser', draw: drawDrone },
  { n: 4, name: 'RIOT ENFORCER', role: 'shield wall + baton', draw: drawEnforcer },
  { n: 5, name: 'NETRUNNER', role: 'glitch-zone caster', draw: drawNetrunner },
  { n: 6, name: 'HOLO DIVA', role: 'decoy holograms', draw: drawHolo },
  { n: 7, name: 'CHROME RONIN', role: 'dash slasher', draw: drawRonin },
  { n: 8, name: 'NOODLE-BOT', role: 'rogue vendor, scald cone', draw: drawNoodle },
  { n: 9, name: 'TURRET POD', role: 'anchored laser lanes', draw: drawTurret },
  { n: 10, name: 'CYBER RATS', role: 'glowing swarm', draw: drawRats },
  { n: 11, name: 'ROAD HOG', role: 'drive-by lanes', draw: drawBiker },
  { n: 12, name: 'SYNTH ASSASSIN', role: 'stealth shimmer strike', draw: drawAssassin },
  { n: 13, name: 'TAG PHANTOM', role: 'graffiti ghost, paint zones', draw: drawTagger },
  { n: 14, name: 'CARGO LIFTER', role: 'elite, drops goons', draw: drawLifter },
  { n: 15, name: 'GLITCH WRAITH', role: 'teleport striker', draw: drawGlitch },
  { n: 16, name: 'CORPO HANDLER', role: 'buffer/commander', draw: drawCorpo },
  { n: 17, name: 'SCRAP GOLEM', role: 'junk tank', draw: drawScrap },
  { n: 18, name: 'NEON VIPER', role: 'light-trail striker', draw: drawViper },
  { n: 19, name: 'EXO LOADER', role: 'elite mech, charge + slam', draw: drawLoader },
  { n: 20, name: 'AD-BOT', role: 'flash-blind billboard', draw: drawAdbot },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_mob_options.png', title: 'NEON CITY — MOB CANDIDATES (pick your roster, any count)', S: 160 });
}
module.exports = { LIST };
