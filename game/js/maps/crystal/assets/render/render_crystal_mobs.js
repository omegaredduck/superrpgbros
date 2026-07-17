// artdev/crystal/render_crystal_mobs.js — 20 numbered CRYSTAL CAVERNS mob
// candidates, hi-fi 160x160 (sparkle-adventure mood).
'use strict';
const KIT = require('./crystal_kit.js');
const { K, GEMS, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, shard, sparkle, rockBase } = KIT;

// 1 · SHARDLING — skittering gem chip; the cheap swarm.
function drawShardling(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.14);
  [-1, 1].forEach(s => [[-0.02, 0.14], [0.06, 0.16]].forEach(([oy, len]) =>
    stroke(put, cx + s * S * 0.06, cy + oy * S + S * 0.06, cx + s * S * len, cy + oy * S + S * 0.12, 2, () => K.rockDk)));
  shard(put, cx, cy + S * 0.1, S * 0.09, S * 0.3, 0.06, GEMS[0]);
  shard(put, cx - S * 0.07, cy + S * 0.1, S * 0.05, S * 0.18, -0.2, GEMS[0]);
  // little face in the facet
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.02), K.oil));
  stroke(put, cx - S * 0.015, cy + S * 0.02, cx + S * 0.015, cy + S * 0.02, 1, () => K.pinkDk);
  sparkle(put, Math.round(cx + S * 0.08), Math.round(cy - S * 0.14), K.pinkLt);
}

// 2 · GEM BEETLE — jeweled shell; curls up and RAMS in a line.
function drawGemBeetle(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.2);
  for (let x = 0; x < S * 0.2; x += 5) row(put, Math.round(cy + S * 0.02), cx - S * 0.44 + x, cx - S * 0.42 + x, () => K.amberDk);
  [-1, 1].forEach(s => [[-0.06, 0.18], [0.04, 0.2], [0.12, 0.17]].forEach(([oy, len]) =>
    stroke(put, cx + s * S * 0.1, cy + oy * S * 0.6 + S * 0.06, cx + s * S * len, cy + oy * S * 0.6 + S * 0.13, 2, () => K.rockDkk)));
  // domed shell of amber facets
  dome(put, cx, cy, S * 0.17, S * 0.14, K.amber, K.amberLt, K.amberDk);
  for (let i = -2; i <= 2; i++) stroke(put, cx + i * S * 0.055, cy - S * 0.12, cx + i * S * 0.07, cy + S * 0.1, 1, () => K.amberDk);
  row(put, Math.round(cy - S * 0.02), cx - S * 0.16, cx + S * 0.16, () => K.amberDk);
  [[-0.08, -0.06], [0.06, -0.08]].forEach(([ox, oy]) => sparkle(put, Math.round(cx + ox * S), Math.round(cy + oy * S), K.amberLt));
  // head + horn
  dome(put, cx - S * 0.17, cy + S * 0.03, S * 0.06, S * 0.05, K.rock, K.rockLt, K.rockDkk);
  stroke(put, cx - S * 0.21, cy - S * 0.0, cx - S * 0.27, cy - S * 0.08, S * 0.025, (t) => mix(K.amberLt, K.amberDk, t));
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.17 + s * S * 0.02), Math.round(cy + S * 0.02), K.amberLt));
}

// 3 · PRISM SPRITE — bounces a cutting beam between crystals.
function drawPrismSprite(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // two anchor crystals + the bounced beam
  shard(put, cx - S * 0.28, cy + S * 0.34, S * 0.05, S * 0.16, 0.1, GEMS[1]);
  shard(put, cx + S * 0.3, cy + S * 0.3, S * 0.045, S * 0.14, -0.1, GEMS[1]);
  stroke(put, cx - S * 0.27, cy + S * 0.2, cx + S * 0.02, cy + S * 0.02, 2, () => K.cyanLt);
  stroke(put, cx + S * 0.02, cy + S * 0.02, cx + S * 0.3, cy + S * 0.18, 2, () => K.cyanLt);
  stroke(put, cx - S * 0.27, cy + S * 0.2, cx + S * 0.02, cy + S * 0.02, 1, () => '#ffffff');
  // the sprite: floating prism body
  for (let y = 0; y < S * 0.16; y++) {
    const t = y / (S * 0.16), w = S * 0.1 * (1 - Math.abs(t - 0.5) * 1.6);
    row(put, Math.round(cy - S * 0.14 + y), cx - w, cx + w, (tx) => {
      let b = mix(K.cyanLt, K.cyan, tx);
      if (tx > 0.7) b = K.cyanDk;
      return b;
    });
  }
  // rainbow split exiting the prism
  [[K.pink, -0.04], [K.amber, 0], [K.green, 0.04]].forEach(([c, o]) =>
    stroke(put, cx + S * 0.06, cy - S * 0.06 + o * S, cx + S * 0.2, cy - S * 0.12 + o * S * 2.4, 1, () => c));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.075), K.oil));
  // wing glints
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, cy - S * 0.1, cx + s * S * 0.15, cy - S * 0.18, 2, () => K.cyanLt));
  sparkle(put, Math.round(cx), Math.round(cy - S * 0.24), K.cyanLt);
}

// 4 · AMETHYST LURKER — poses as a crystal cluster; ambushes.
function drawAmethystLurker(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.22);
  rockBase(put, cx, cy + S * 0.12, S * 0.2, S * 0.07);
  // crystal cluster body — but with eyes opening + claws emerging
  shard(put, cx - S * 0.08, cy + S * 0.12, S * 0.06, S * 0.26, -0.12, GEMS[2]);
  shard(put, cx + S * 0.06, cy + S * 0.12, S * 0.075, S * 0.34, 0.05, GEMS[2]);
  shard(put, cx + S * 0.16, cy + S * 0.12, S * 0.05, S * 0.2, 0.25, GEMS[2]);
  // waking eyes inside the facets
  [[-0.08, -0.02], [0.06, -0.1]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.022, S * 0.018, () => K.oil);
    put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.amber);
  });
  // crystal claws slipping out the base
  [-1, 1].forEach(s => [0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.14, cy + S * 0.14, cx + s * S * (0.2 + k * 0.04), cy + S * 0.2, 2, () => K.purpleLt)));
  sparkle(put, Math.round(cx + S * 0.12), Math.round(cy - S * 0.2), K.purpleLt);
}

// 5 · GEODE GOLEM — the tank; cracked chest reveals a gem heart.
function drawGeodeGolem(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.11, cy + S * 0.12, cx + s * S * 0.17, cy + S * 0.3, S * 0.05, () => K.rockDk); ell(put, cx + s * S * 0.18, cy + S * 0.32, S * 0.05, S * 0.025, () => K.oil); });
  // boulder body
  dome(put, cx, cy - S * 0.0, S * 0.21, S * 0.19, K.rock, K.rockLt, K.rockDkk);
  // cracked-open chest: geode interior
  ell(put, cx, cy + S * 0.02, S * 0.1, S * 0.09, () => K.rockDkk);
  ell(put, cx, cy + S * 0.02, S * 0.08, S * 0.07, (tx, ty) => mix(K.voidDk, K.void, ty));
  [[0, -0.03], [-0.04, 0.02], [0.04, 0.02], [0, 0.05]].forEach(([ox, oy]) =>
    shard(put, cx + ox * S, cy + (oy + 0.05) * S, S * 0.018, S * 0.05, ox * 3, GEMS[0]));
  // heavy arms
  [-1, 1].forEach(s => { dome(put, cx + s * S * 0.25, cy - S * 0.04, S * 0.08, S * 0.07, K.rock, K.rockLt, K.rockDkk); stroke(put, cx + s * S * 0.25, cy + S * 0.0, cx + s * S * 0.3, cy + S * 0.16, S * 0.05, () => K.rockDk); dome(put, cx + s * S * 0.31, cy + S * 0.2, S * 0.06, S * 0.05, K.rock, K.rockLt, K.rockDkk); });
  // crystal spikes on the shoulders + head
  shard(put, cx - S * 0.22, cy - S * 0.08, S * 0.03, S * 0.1, -0.2, GEMS[0]);
  shard(put, cx + S * 0.2, cy - S * 0.1, S * 0.028, S * 0.08, 0.2, GEMS[0]);
  dome(put, cx, cy - S * 0.24, S * 0.08, S * 0.06, K.rock, K.rockLt, K.rockDk);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.035, cy - S * 0.25, S * 0.02, K.pinkDk, K.pink, K.pinkLt));
}

// 6 · SHATTERBAT — crystal-winged bat; shriek CONE that cracks crystal.
function drawShatterbat(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // shriek cone
  for (let t = 0.2; t < 1; t += 0.18) {
    const w = t * S * 0.14;
    stroke(put, cx - S * 0.08 - t * S * 0.26, cy - w, cx - S * 0.08 - t * S * 0.26, cy + w, 1, () => (t > 0.7 ? K.cyanDk : K.cyanLt));
  }
  // body + head
  dome(put, cx, cy, S * 0.075, S * 0.09, K.void, K.voidLt, K.voidDk);
  dome(put, cx, cy - S * 0.1, S * 0.05, S * 0.05, K.void, K.voidLt, K.voidDk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.03, cy - S * 0.13, cx + s * S * 0.055, cy - S * 0.2, 2, () => K.voidLt));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.1), K.cyanLt));
  ell(put, cx, cy - S * 0.06, S * 0.016, S * 0.02, () => K.oil); // open shrieking mouth
  // crystal membrane wings
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.05, cy - S * 0.02, cx + s * S * 0.3, cy - S * 0.14, S * 0.05, (t) => mix(K.cyan, K.cyanDk, t));
    stroke(put, cx + s * S * 0.26, cy - S * 0.1, cx + s * S * 0.32, cy + S * 0.04, S * 0.035, (t) => mix(K.cyanDk, K.voidDk, t));
    stroke(put, cx + s * S * 0.06, cy - S * 0.03, cx + s * S * 0.28, cy - S * 0.13, 1, () => K.cyanLt);
  });
  sparkle(put, Math.round(cx + S * 0.2), Math.round(cy - S * 0.2), K.cyanLt);
}

// 7 · TUNNELER — armored driller; erupts under marked circles.
function drawTunneler(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // warn ring + rubble
  ell(put, cx, cy + S * 0.22, S * 0.2, S * 0.07, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.62 && d <= 1 ? K.amberDk : null; });
  dome(put, cx, cy + S * 0.2, S * 0.16, S * 0.06, K.rock, K.rockLt, K.rockDkk);
  // segmented body erupting
  for (let i = 0; i < 4; i++) {
    const t = i / 3, w = S * (0.12 - t * 0.02), yy = cy + S * (0.12 - t * 0.13);
    ell(put, cx, yy, w, S * 0.055, (tx, ty) => {
      let b = mix(K.rockLt, K.rockDk, ty + t * 0.1);
      if (tx < 0.12 || tx > 0.88) b = mix(b, K.rockDkk, 0.5);
      return b;
    });
  }
  // drill snout of crystal
  shard(put, cx, cy - S * 0.22, S * 0.06, S * 0.16, 0, GEMS[3]);
  for (let i = 0; i < 3; i++) stroke(put, cx - S * 0.05 + i * S * 0.01, cy - S * 0.24 - i * S * 0.04, cx + S * 0.05 - i * S * 0.01, cy - S * 0.26 - i * S * 0.04, 1, () => K.amberDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.18), K.pink));
  // flying rubble
  [[-0.22, 0.02], [0.24, 0.06], [0.18, -0.12]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.02, S * 0.016, K.rock, K.rockLt, K.rockDkk));
}

// 8 · FACETER — gem-smith fairy; POLISHES (heals) crystal mobs.
function drawFaceter(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.12);
  // hovering fairy body
  dome(put, cx, cy + S * 0.02, S * 0.07, S * 0.09, K.green, K.greenLt, K.greenDk);
  dome(put, cx, cy - S * 0.09, S * 0.05, S * 0.05, '#f0e0d0', '#fff4ea', '#c0a890');
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.095), K.oil));
  // gem-dust wings
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.09, cy - S * 0.04, S * 0.06, S * 0.09, (tx, ty) => ((tx * 6 | 0) + (ty * 6 | 0)) % 2 ? K.greenLt : null);
  });
  // polishing hammer + chisel
  stroke(put, cx + S * 0.06, cy + S * 0.04, cx + S * 0.14, cy - S * 0.04, 2, () => K.rockDk);
  plate(put, cx + S * 0.12, cy - S * 0.09, cx + S * 0.17, cy - S * 0.04, K.gold, K.amberLt, K.goldDk);
  // the patient: a chipped shard being mended
  shard(put, cx - S * 0.18, cy + S * 0.24, S * 0.05, S * 0.18, -0.05, GEMS[0]);
  // heal glints flowing to it
  [[-0.06, 0.0], [-0.1, 0.06], [-0.14, 0.12]].forEach(([ox, oy]) => sparkle(put, Math.round(cx + ox * S), Math.round(cy + oy * S), K.greenLt));
}

// 9 · STALACTITE SENTRY — ceiling spirit; drops crystal spikes on marks.
function drawStalactiteSentry(put, S) {
  const cx = S * 0.5;
  // cave ceiling strip
  for (let y = 0; y < S * 0.1; y++) row(put, Math.round(S * 0.04 + y), S * 0.08, S * 0.92, (tx) => mix(K.rockDk, K.rockDkk, y / (S * 0.1) + Math.abs(Math.sin(tx * 9)) * 0.2));
  // hanging stalactites (one glowing = the sentry)
  [[-0.26, 0.12, GEMS[1]], [-0.08, 0.2, null], [0.12, 0.16, null], [0.3, 0.1, GEMS[2]]].forEach(([o, len, gem]) => {
    for (let y = 0; y < S * len * 2; y++) {
      const t = y / (S * len * 2), w = S * 0.045 * (1 - t);
      row(put, Math.round(S * 0.13 + y), cx + o * S - w, cx + o * S + w, (tx) => {
        if (gem) { const [c, lt, dk] = gem; let b = mix(lt, c, t + tx * 0.3); if (tx > 0.7) b = dk; return b; }
        return mix(K.rockLt, K.rockDkk, t * 0.6 + Math.abs(tx - 0.5) * 0.5);
      });
    }
  });
  // the sentry's eye on the glowing one
  put(Math.round(cx - S * 0.27), Math.round(S * 0.2), K.oil);
  put(Math.round(cx - S * 0.25), Math.round(S * 0.2), K.oil);
  // a spike mid-fall + impact mark
  shard(put, cx + S * 0.02, S * 0.6, S * 0.03, S * 0.12, 0, GEMS[1]);
  for (let t = 0; t < 1; t += 0.25) put(Math.round(cx + S * 0.02), Math.round(S * 0.34 + t * S * 0.12), K.cyanLt);
  ell(put, cx + S * 0.02, S * 0.84, S * 0.1, S * 0.035, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? K.cyanDk : null; });
}

// 10 · QUARTZ RAM — crystal-horned charger; telegraphed lane rush.
function drawQuartzRam(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  for (let x = 0; x < S * 0.18; x += 5) row(put, Math.round(cy + S * 0.0), cx - S * 0.46 + x, cx - S * 0.44 + x, () => K.pinkDk);
  // wooly rock body
  dome(put, cx + S * 0.02, cy, S * 0.18, S * 0.12, K.rockLt, '#8e84a4', K.rockDk);
  for (let i = 0; i < 12; i++) put(Math.round(cx - S * 0.1 + (i * 37 % 100) / 100 * S * 0.24), Math.round(cy - S * 0.08 + (i * 61 % 100) / 100 * S * 0.14), K.rockLt);
  // legs braced
  [[-0.1, -0.02], [0.0, 0.01], [0.1, -0.01], [0.17, 0.02]].forEach(([o, k]) =>
    stroke(put, cx + o * S, cy + S * 0.1, cx + (o + k) * S, cy + S * 0.24, S * 0.03, () => K.rockDk));
  // lowered head + BIG crystal curl horns
  dome(put, cx - S * 0.18, cy + S * 0.0, S * 0.08, S * 0.07, K.rockLt, '#8e84a4', K.rockDk);
  [0, 1].forEach(layer => {
    for (let a = 0.2; a < 3.6; a += 0.16) {
      const rr = S * (0.05 + a * 0.026);
      ell(put, cx - S * 0.15 + Math.cos(a + 1.8) * rr, cy - S * 0.05 - Math.sin(a + 1.8) * rr * 0.75 + layer * 2, S * 0.02 - a * 0.002 * S, S * 0.02 - a * 0.002 * S, (tx, ty) => mix(layer ? K.pinkDk : K.pinkLt, K.pinkDk, ty + a * 0.1));
    }
  });
  optic(put, cx - S * 0.21, cy - S * 0.015, S * 0.02, K.pinkDk, K.pink, K.pinkLt);
  sparkle(put, Math.round(cx - S * 0.02), Math.round(cy - S * 0.16), K.pinkLt);
}

// 11 · MIRROR SHARD — splits into fakes; only the REAL one glints.
function drawMirrorShard(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // three copies fanned; center = real (sparkle), sides = translucent
  [[-0.26, 0.5], [0.26, 0.5]].forEach(([o]) => {
    for (let y = 0; y < S * 0.3; y += 2) { // scanline fakes
      const t = y / (S * 0.3), w = S * 0.08 * (1 - t * 0.85);
      row(put, Math.round(cy + S * 0.16 - y), cx + o * S - w, cx + o * S + w, (tx) => (y % 4 < 2 ? mix(K.cyanDk, K.void, tx) : null));
    }
    put(Math.round(cx + o * S - 2), Math.round(cy - S * 0.02), K.oil); put(Math.round(cx + o * S + 2), Math.round(cy - S * 0.02), K.oil);
  });
  shard(put, cx, cy + S * 0.18, S * 0.085, S * 0.34, 0, GEMS[1]);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.0), K.oil));
  stroke(put, cx - S * 0.015, cy + S * 0.045, cx + S * 0.015, cy + S * 0.045, 1, () => K.cyanDk);
  sparkle(put, Math.round(cx), Math.round(cy - S * 0.2), '#ffffff'); // THE tell
  shadow(put, S, cx, S * 0.16);
}

// 12 · RESONATOR — tuning-fork crystal; emits expanding shatter rings.
function drawResonator(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.18);
  rockBase(put, cx, cy + S * 0.24, S * 0.14, S * 0.05);
  // tuning-fork twin prongs
  shard(put, cx - S * 0.07, cy + S * 0.24, S * 0.045, S * 0.34, -0.02, GEMS[2]);
  shard(put, cx + S * 0.07, cy + S * 0.24, S * 0.045, S * 0.34, 0.02, GEMS[2]);
  plate(put, cx - S * 0.1, cy + S * 0.16, cx + S * 0.1, cy + S * 0.24, K.rock, K.rockLt, K.rockDkk);
  // vibration blur on the prongs
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.12, cy - S * 0.06, cx + s * S * 0.12, cy + S * 0.1, 1, () => K.purpleLt); });
  // expanding rings
  [0.16, 0.26, 0.36].forEach((r, i) => {
    for (let a = 0; a < 6.28; a += 0.12) put(Math.round(cx + Math.cos(a) * S * r), Math.round(cy + S * 0.04 + Math.sin(a) * S * r * 0.7), (a * 6 | 0) % 2 ? (i === 2 ? K.purpleDk : K.purple) : null);
  });
  // face between the prongs
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy + S * 0.08), K.oil));
  sparkle(put, Math.round(cx), Math.round(cy - S * 0.14), K.purpleLt);
}

// 13 · GEMWING MOTH — flutters, sheds slowing sparkle dust.
function drawGemwingMoth(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // dust trail
  [[-0.2, 0.2], [-0.12, 0.28], [-0.02, 0.34]].forEach(([ox, oy], i) => {
    ell(put, cx + ox * S, cy + oy * S, S * 0.05 - i * 3, S * 0.02, (tx, ty) => ((tx * 8 | 0) + (ty * 3 | 0)) % 2 ? K.pinkLt : null);
  });
  // wings — big faceted panes
  [-1, 1].forEach(s => {
    ell(put, cx + s * S * 0.15, cy - S * 0.06, S * 0.13, S * 0.1, (tx, ty) => {
      let b = mix(K.pinkLt, K.pink, clamp(ty * 1.2, 0, 1));
      if (((tx * 4 | 0) + (ty * 3 | 0)) % 2) b = mix(b, K.purpleLt, 0.5);
      if (Math.abs(tx - 0.5) > 0.44 || ty > 0.85) b = K.pinkDk;
      return b;
    });
    ell(put, cx + s * S * 0.12, cy + S * 0.06, S * 0.08, S * 0.06, (tx, ty) => mix(K.purpleLt, K.purpleDk, ty));
  });
  // body + antennae
  ell(put, cx, cy, S * 0.035, S * 0.1, (tx, ty) => mix(K.rockLt, K.rockDk, ty));
  dome(put, cx, cy - S * 0.1, S * 0.03, S * 0.03, K.rockLt, '#8e84a4', K.rockDk);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.015, cy - S * 0.12, cx + s * S * 0.05, cy - S * 0.18, 1, () => K.rockDk); put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.19), K.pinkLt); });
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.012), Math.round(cy - S * 0.1), K.oil));
  sparkle(put, Math.round(cx + S * 0.24), Math.round(cy - S * 0.16), K.pinkLt);
}

// 14 · SHARD ARCHER — crystalline hunter; aimed shard bolts.
function drawShardArcher(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // crystalline humanoid
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, cy + S * 0.12, cx + s * S * 0.08, cy + S * 0.28, S * 0.028, () => K.cyanDk));
  for (let y = 0; y < S * 0.2; y++) {
    const t = y / (S * 0.2), w = S * (0.07 - Math.abs(t - 0.4) * 0.04);
    row(put, Math.round(cy - S * 0.06 + y), cx - w, cx + w, (tx) => {
      let b = mix(K.cyanLt, K.cyan, t + tx * 0.3);
      if (tx > 0.7) b = K.cyanDk;
      return b;
    });
  }
  // angular head w/ crest
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * 0.05 * (1 - Math.abs(t - 0.5));
    row(put, Math.round(cy - S * 0.17 + y), cx - w, cx + w, (tx) => mix(K.cyanLt, K.cyanDk, tx));
  }
  shard(put, cx, cy - S * 0.17, S * 0.02, S * 0.08, 0.1, GEMS[1]);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.022), Math.round(cy - S * 0.13), K.amber));
  // crystal bow drawn
  for (let a = -0.9; a < 0.95; a += 0.1) put(Math.round(cx - S * 0.2 + Math.cos(a) * S * 0.05), Math.round(cy - S * 0.0 + Math.sin(a) * S * 0.16), K.cyanLt);
  stroke(put, cx - S * 0.19, cy - S * 0.15, cx - S * 0.19, cy + S * 0.15, 1, () => '#ffffff');
  // nocked shard bolt
  shard(put, cx - S * 0.3, cy + S * 0.03, S * 0.02, S * 0.1, 0, GEMS[3]);
  stroke(put, cx - S * 0.06, cy - S * 0.02, cx - S * 0.19, cy - S * 0.0, S * 0.02, () => K.cyanDk);
}

// 15 · DEEP CRAWLER — obsidian cave crab; heavy pincer melee.
function drawDeepCrawler(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  [-1, 1].forEach(s => [[-0.04, 0.2], [0.06, 0.23], [0.15, 0.19]].forEach(([oy, len]) => {
    stroke(put, cx + s * S * 0.11, cy + oy * S * 0.5 + S * 0.05, cx + s * S * len, cy + oy * S * 0.5 + S * 0.13, 2, () => K.rockDkk);
  }));
  // obsidian carapace w/ gem barnacles
  ell(put, cx, cy + S * 0.02, S * 0.16, S * 0.1, (tx, ty) => {
    let b = mix('#3a3444', '#16121e', clamp(ty * 1.25, 0, 1));
    if (Math.sin((tx + ty) * 14) > 0.9) b = mix(b, K.voidLt, 0.4);
    return b;
  });
  [[-0.08, -0.04], [0.06, -0.06]].forEach(([ox, oy]) => shard(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.016, S * 0.05, ox, GEMS[2]));
  // massive pincers
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.14, cy + S * 0.02, cx + s * S * 0.26, cy - S * 0.04, S * 0.035, () => '#2a2434');
    ell(put, cx + s * S * 0.29, cy - S * 0.06, S * 0.05, S * 0.038, (tx, ty) => mix('#3a3444', '#16121e', ty));
    stroke(put, cx + s * S * 0.33, cy - S * 0.08, cx + s * S * 0.27, cy - S * 0.02, 2, () => K.rockLt); // pincer gap
  });
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.03, cy - S * 0.08, cx + s * S * 0.05, cy - S * 0.14, 1, () => K.rockLt); put(Math.round(cx + s * S * 0.055), Math.round(cy - S * 0.15), K.pink); });
}

// 16 · LIVING GEODE — dormant egg-rock; cracks + hatches Shardlings.
function drawLivingGeode(put, S) {
  const cx = S * 0.5, cy = S * 0.55;
  shadow(put, S, cx, S * 0.22);
  // boulder w/ glowing crack
  dome(put, cx, cy, S * 0.18, S * 0.16, K.rock, K.rockLt, K.rockDkk);
  // crack leaking light
  stroke(put, cx - S * 0.02, cy - S * 0.14, cx + S * 0.03, cy + S * 0.02, 2, () => K.pinkLt);
  stroke(put, cx + S * 0.03, cy + S * 0.02, cx - S * 0.02, cy + S * 0.12, 1, () => K.pink);
  stroke(put, cx + S * 0.02, cy - S * 0.04, cx + S * 0.09, cy - S * 0.08, 1, () => K.pinkDk);
  // one hatched wedge fallen open showing gem teeth inside
  for (let y = 0; y < S * 0.08; y++) {
    const t = y / (S * 0.08), w = S * 0.06 * (1 - t);
    row(put, Math.round(cy - S * 0.02 + y), cx + S * 0.14 - w + S * 0.08, cx + S * 0.14 + w + S * 0.08, (tx) => mix(K.rockDk, K.rockDkk, t));
  }
  ell(put, cx + S * 0.1, cy + S * 0.0, S * 0.05, S * 0.05, (tx, ty) => mix(K.voidDk, K.void, ty));
  [[0.08, -0.02], [0.12, 0.02]].forEach(([ox, oy]) => shard(put, cx + ox * S, cy + oy * S + S * 0.03, S * 0.012, S * 0.035, 0, GEMS[0]));
  // a fresh shardling wriggling out
  shard(put, cx + S * 0.22, cy + S * 0.14, S * 0.03, S * 0.1, 0.1, GEMS[0]);
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.22 + s * S * 0.012), Math.round(cy + S * 0.08), K.oil));
  sparkle(put, Math.round(cx - S * 0.1), Math.round(cy - S * 0.1), K.pinkLt);
}

// 17 · PRISMATIC OOZE — rainbow slime; splits into color shards on death.
function drawPrismaticOoze(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  // glossy blob w/ rainbow banding
  dome(put, cx, cy, S * 0.19, S * 0.14, K.purple, K.purpleLt, K.purpleDk);
  [[K.pink, 0.1], [K.cyan, 0.04], [K.amber, -0.02], [K.green, -0.08]].forEach(([c, oy]) => {
    for (let x = -0.16; x < 0.17; x += 0.01) {
      const yYtop = cy + oy * S + Math.sin(x * 14) * 2;
      put(Math.round(cx + x * S), Math.round(yYtop), mix(c, K.purpleDk, Math.abs(x) * 3));
    }
  });
  ell(put, cx - S * 0.07, cy - S * 0.07, S * 0.045, S * 0.025, () => '#ffffff');
  // eyes + happy-menacing grin
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.05, cy - S * 0.02, S * 0.02, S * 0.024, () => '#ffffff'); put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.015), K.oil); });
  stroke(put, cx - S * 0.03, cy + S * 0.04, cx + S * 0.03, cy + S * 0.04, 1, () => K.purpleDk);
  // mini-shard children budding off
  [[-0.26, 0.06, 0], [0.27, 0.02, 1], [0.2, 0.12, 3]].forEach(([ox, oy, g]) => {
    shard(put, cx + ox * S, cy + oy * S + S * 0.06, S * 0.025, S * 0.08, ox, GEMS[g]);
  });
  ell(put, cx + S * 0.08, cy + S * 0.15, S * 0.1, S * 0.02, (tx, ty) => mix(K.purpleDk, K.void, tx)); // trail
}

// 18 · FLUORITE FROG — hops in arcs onto marked circles; tongue snap.
function drawFluoriteFrog(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // landing ring
  ell(put, cx + S * 0.26, cy + S * 0.28, S * 0.09, S * 0.03, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.6 && d <= 1 ? K.greenDk : null; });
  // crouched crystal frog
  dome(put, cx, cy + S * 0.04, S * 0.14, S * 0.1, K.green, K.greenLt, K.greenDk);
  // faceted back
  [[-0.06, -0.02], [0.04, -0.04]].forEach(([ox, oy]) => shard(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.02, S * 0.06, ox * 2, GEMS[4]));
  // coiled legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.12, cy + S * 0.08, cx + s * S * 0.22, cy + S * 0.0, S * 0.035, () => K.greenDk);
    stroke(put, cx + s * S * 0.22, cy + S * 0.0, cx + s * S * 0.18, cy + S * 0.14, S * 0.03, () => K.greenDk);
  });
  // big glassy eyes
  [-1, 1].forEach(s => { dome(put, cx + s * S * 0.06, cy - S * 0.07, S * 0.035, S * 0.035, K.greenLt, '#ffffff', K.greenDk); put(Math.round(cx + s * S * 0.06), Math.round(cy - S * 0.075), K.oil); });
  stroke(put, cx - S * 0.05, cy + S * 0.0, cx + S * 0.05, cy + S * 0.0, 1, () => K.greenDk);
  // tongue mid-snap w/ gem stuck on it
  stroke(put, cx, cy + S * 0.01, cx - S * 0.2, cy - S * 0.08, 2, () => K.pink);
  shard(put, cx - S * 0.22, cy - S * 0.04, S * 0.018, S * 0.05, 0, GEMS[0]);
  sparkle(put, Math.round(cx + S * 0.14), Math.round(cy - S * 0.12), K.greenLt);
}

// 19 · CRYSTAL GUARDIAN — elite living-crystal knight (mini shardlord).
function drawCrystalGuardian(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.12, cx + s * S * 0.09, cy + S * 0.3, S * 0.035, () => K.purpleDk));
  // faceted torso
  for (let y = 0; y < S * 0.22; y++) {
    const t = y / (S * 0.22), w = S * (0.1 - Math.abs(t - 0.35) * 0.05);
    row(put, Math.round(cy - S * 0.08 + y), cx - w, cx + w, (tx) => {
      let b = mix(K.purpleLt, K.purple, t + tx * 0.25);
      if (tx > 0.68) b = K.purpleDk;
      if (Math.abs(tx - 0.5) < 0.04) b = mix(b, '#ffffff', 0.3);
      return b;
    });
  }
  // pauldron shards
  [-1, 1].forEach(s => shard(put, cx + s * S * 0.13, cy - S * 0.02, S * 0.03, S * 0.1, s * 0.3, GEMS[2]));
  // angular helm
  for (let y = 0; y < S * 0.1; y++) {
    const t = y / (S * 0.1), w = S * 0.05 * (1 - Math.abs(t - 0.5) * 0.8);
    row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w, (tx) => mix(K.purpleLt, K.purpleDk, tx));
  }
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.14), K.amber));
  // greatblade of crystal
  shard(put, cx + S * 0.22, cy + S * 0.2, S * 0.035, S * 0.34, 0, GEMS[1]);
  stroke(put, cx + S * 0.1, cy + S * 0.02, cx + S * 0.22, cy + S * 0.1, S * 0.03, () => K.purpleDk);
  sparkle(put, Math.round(cx + S * 0.22), Math.round(cy - S * 0.18), K.cyanLt);
}

// 20 · VOIDGEM HORROR — corrupted dark crystal; elite gravity flux.
function drawVoidgemHorror(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // hovering inverted shard w/ orbit debris
  ell(put, cx, S * 0.86, S * 0.14, S * 0.035, () => K.voidDk);
  for (let y = 0; y < S * 0.36; y++) {
    const t = y / (S * 0.36), w = S * 0.13 * (1 - t * 0.9);
    row(put, Math.round(cy - S * 0.18 + y), cx - w, cx + w, (tx) => {
      let b = mix(K.void, K.voidDk, t * 0.6 + tx * 0.2);
      if (tx < 0.25) b = mix(b, K.voidLt, 0.5);
      if (Math.sin((tx * 8 + t * 12)) > 0.86) b = mix(b, K.pink, 0.35); // corruption veins
      return b;
    });
  }
  // the eye at the wide top
  optic(put, cx, cy - S * 0.13, S * 0.04, K.pinkDk, K.pink, K.pinkLt);
  // orbiting broken shards
  [[-0.3, -0.06, 1], [0.32, -0.1, 2], [0.26, 0.14, 0], [-0.26, 0.16, 3]].forEach(([ox, oy, g]) =>
    shard(put, cx + ox * S, cy + oy * S + S * 0.05, S * 0.02, S * 0.07, ox, GEMS[g]));
  for (let a = 0; a < 6.28; a += 0.2) put(Math.round(cx + Math.cos(a) * S * 0.3), Math.round(cy + Math.sin(a) * S * 0.24), (a * 8 | 0) % 3 === 0 ? K.voidLt : null);
  sparkle(put, Math.round(cx), Math.round(cy - S * 0.28), K.pinkLt);
}

// ========================================================================
const LIST = [
  { n: 1, name: 'SHARDLING', role: 'swarm filler', draw: drawShardling },
  { n: 2, name: 'GEM BEETLE', role: 'ram charger', draw: drawGemBeetle },
  { n: 3, name: 'PRISM SPRITE', role: 'bounced beams', draw: drawPrismSprite },
  { n: 4, name: 'AMETHYST LURKER', role: 'crystal ambusher', draw: drawAmethystLurker },
  { n: 5, name: 'GEODE GOLEM', role: 'tank', draw: drawGeodeGolem },
  { n: 6, name: 'SHATTERBAT', role: 'shriek cone', draw: drawShatterbat },
  { n: 7, name: 'TUNNELER', role: 'erupts under you', draw: drawTunneler },
  { n: 8, name: 'FACETER', role: 'heals crystal mobs', draw: drawFaceter },
  { n: 9, name: 'STALACTITE SENTRY', role: 'ceiling drops', draw: drawStalactiteSentry },
  { n: 10, name: 'QUARTZ RAM', role: 'lane charger', draw: drawQuartzRam },
  { n: 11, name: 'MIRROR SHARD', role: 'fake clones', draw: drawMirrorShard },
  { n: 12, name: 'RESONATOR', role: 'expanding rings', draw: drawResonator },
  { n: 13, name: 'GEMWING MOTH', role: 'slow dust flyer', draw: drawGemwingMoth },
  { n: 14, name: 'SHARD ARCHER', role: 'aimed bolts', draw: drawShardArcher },
  { n: 15, name: 'DEEP CRAWLER', role: 'pincer melee', draw: drawDeepCrawler },
  { n: 16, name: 'LIVING GEODE', role: 'hatches shardlings', draw: drawLivingGeode },
  { n: 17, name: 'PRISMATIC OOZE', role: 'splits on death', draw: drawPrismaticOoze },
  { n: 18, name: 'FLUORITE FROG', role: 'arc hopper', draw: drawFluoriteFrog },
  { n: 19, name: 'CRYSTAL GUARDIAN', role: 'elite knight', draw: drawCrystalGuardian },
  { n: 20, name: 'VOIDGEM HORROR', role: 'elite hover flux', draw: drawVoidgemHorror },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'crystal_mob_options.png',
  title: 'CRYSTAL CAVERNS — MOB CANDIDATES (pick your roster, tell me numbers to change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
