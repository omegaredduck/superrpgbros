// artdev/pyramid/render_pyramid_mobs.js — 20 numbered PYRAMID PLUNDER mob
// candidates, hi-fi 160x160, one PNG grid for Red to pick 8 from.
//   node render_pyramid_mobs.js out.png   (RANGER_PATH -> ranger_art.js)
'use strict';
const KIT = require('./egypt_kit.js');
const { E, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, wraps, trim, glyphs, horusEye, nemes, serpent, flame } = KIT;

// 1 · SCARAB — skittering tomb beetle; the cheap swarm filler.
function drawScarab(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.16);
  // legs
  [-1, 1].forEach(s => [[-0.1, 0.12], [0, 0.16], [0.1, 0.12]].forEach(([o, len]) =>
    stroke(put, cx + s * S * 0.12, cy + o * S, cx + s * S * (0.12 + len), cy + o * S + S * 0.1, 2, () => E.obsidian)));
  // carapace — lapis-black with gold seam
  dome(put, cx, cy, S * 0.18, S * 0.15, E.lapisDk, E.lapis, E.obsidian);
  for (let y = Math.round(cy - S * 0.13); y < cy + S * 0.13; y++) put(Math.round(cx), y, E.gold);
  // head + horn plate
  dome(put, cx, cy - S * 0.15, S * 0.09, S * 0.06, E.obsidian, E.lapisDk, E.oil);
  stroke(put, cx - S * 0.06, cy - S * 0.2, cx + S * 0.06, cy - S * 0.2, 2, () => E.gold);
  // gleam + tiny eyes
  ell(put, cx - S * 0.07, cy - S * 0.05, S * 0.04, S * 0.03, () => E.lapisLt);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.04), Math.round(cy - S * 0.16), E.curse));
}

// 2 · SAND ASP — quick striking viper; short telegraphed lunge bite.
function drawSandAsp(put, S) {
  const cx = S * 0.5, cy = S * 0.56;
  shadow(put, S, cx, S * 0.2);
  serpent(put, cx - S * 0.02, cy + S * 0.06, S * 0.5, 2.2, S * 0.05, (t, ty) => {
    let b = mix(E.sandLt, E.sandDk, ty);
    if (Math.floor(t * 14) % 2) b = mix(b, E.stoneDk, 0.4);
    return b;
  });
  // raised striking head
  stroke(put, cx + S * 0.2, cy + S * 0.02, cx + S * 0.26, cy - S * 0.18, S * 0.05, () => E.sand);
  dome(put, cx + S * 0.27, cy - S * 0.22, S * 0.07, S * 0.055, E.sand, E.sandLt, E.sandDkk);
  // hood flare
  ell(put, cx + S * 0.27, cy - S * 0.19, S * 0.1, S * 0.06, (tx, ty) => (ty > 0.4 ? mix(E.sandDk, E.sandDkk, tx) : null));
  // eyes + fangs + flicking tongue
  put(Math.round(cx + S * 0.24), Math.round(cy - S * 0.24), E.red);
  put(Math.round(cx + S * 0.3), Math.round(cy - S * 0.24), E.red);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.27 + s * S * 0.02, cy - S * 0.17, cx + S * 0.27 + s * S * 0.02, cy - S * 0.13, 1, () => E.white));
  stroke(put, cx + S * 0.27, cy - S * 0.15, cx + S * 0.34, cy - S * 0.1, 1, () => E.red);
}

// 3 · KHOPESH GUARD — skeletal tomb soldier w/ sickle-sword + kite shield.
function drawKhopeshGuard(put, S) {
  const cx = S * 0.46, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.05, cy + S * 0.14, cx + s * S * 0.07, cy + S * 0.3, S * 0.028, () => E.boneDk));
  // ribcage torso
  dome(put, cx, cy + S * 0.02, S * 0.11, S * 0.14, E.bone, E.wrapLt, E.boneDk);
  [0.0, 0.05, 0.1].forEach(o => row(put, Math.round(cy - S * 0.02 + o * S), cx - S * 0.09, cx + S * 0.09, () => E.boneDk));
  // gold usekh collar
  trim(put, cx - S * 0.09, cx + S * 0.09, Math.round(cy - S * 0.08), 4);
  // skull with striped guard-hood
  dome(put, cx, cy - S * 0.17, S * 0.08, S * 0.08, E.bone, E.wrapLt, E.boneDk);
  nemes(put, cx, cy - S * 0.22, S * 0.06, S * 0.05, E.lapis, E.gold);
  [-1, 1].forEach(s => { ell(put, cx + s * S * 0.035, cy - S * 0.17, S * 0.022, S * 0.026, () => E.oil); put(Math.round(cx + s * S * 0.035), Math.round(cy - S * 0.17), E.curse); });
  // kite shield (left)
  for (let y = 0; y < S * 0.2; y++) {
    const t = y / (S * 0.2), w = S * (0.06 - t * 0.02);
    row(put, Math.round(cy - S * 0.06 + y), cx - S * 0.2 - w, cx - S * 0.2 + w, (tx) => mix(E.stoneLt, E.stoneDk, t + Math.abs(tx - 0.5) * 0.4));
  }
  horusEye(put, cx - S * 0.2, cy + S * 0.0, S * 0.025, E.lapisLt, E.lapisDk);
  // khopesh raised (right): handle up, curved blade
  stroke(put, cx + S * 0.13, cy + S * 0.06, cx + S * 0.2, cy - S * 0.12, S * 0.025, () => E.goldDk);
  for (let a = 0; a < 1.5; a += 0.12) {
    const bx = cx + S * 0.2 + Math.sin(a) * S * 0.12, by = cy - S * 0.12 - (1 - Math.cos(a)) * S * 0.1;
    ell(put, bx, by, S * 0.025, S * 0.02, (tx, ty) => mix(E.goldLt, E.goldDk, ty + a * 0.2));
  }
}

// 4 · TOMB SENTINEL — seated statue that WAKES; rooted, fires eye-beam bolts.
function drawTombSentinel(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.2);
  // plinth
  plate(put, cx - S * 0.16, cy + S * 0.24, cx + S * 0.16, cy + S * 0.34, E.stone, E.stoneLt, E.stoneDkk);
  glyphs(put, cx - S * 0.14, cy + S * 0.26, cx + S * 0.14, cy + S * 0.33, E.stoneDkk);
  // seated cat-guardian body (bastet-like silhouette)
  dome(put, cx, cy + S * 0.1, S * 0.13, S * 0.17, E.stone, E.stoneLt, E.stoneDkk);
  // front legs
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.08, cy + S * 0.08, cx + s * S * 0.1, cy + S * 0.26, S * 0.035, () => E.stoneDk));
  // head w/ tall ears
  dome(put, cx, cy - S * 0.1, S * 0.09, S * 0.085, E.stone, E.stoneLt, E.stoneDkk);
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy - S * 0.17, cx + s * S * 0.08, cy - S * 0.28, S * 0.035, () => E.stoneDk));
  // gold collar + cracked cheek
  trim(put, cx - S * 0.08, cx + S * 0.08, Math.round(cy - S * 0.015), 4);
  stroke(put, cx + S * 0.04, cy - S * 0.14, cx + S * 0.08, cy - S * 0.07, 1, () => E.stoneDkk);
  // AWAKE eyes: burning curse-green beams charging
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.04, cy - S * 0.11, S * 0.03, E.curseDk, E.curse, E.curseLt));
  stroke(put, cx + S * 0.07, cy - S * 0.11, cx + S * 0.22, cy - S * 0.09, 1, () => E.curse);
}

// 5 · SCARAB BROODMOTHER — swollen beetle; killed = bursts into scarabs.
function drawBroodmother(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // legs
  [-1, 1].forEach(s => [[-0.12, 0.16], [0.02, 0.2], [0.14, 0.16]].forEach(([o, len]) =>
    stroke(put, cx + s * S * 0.16, cy + o * S + S * 0.06, cx + s * S * (0.16 + len), cy + o * S + S * 0.16, 3, () => E.obsidian)));
  // huge glowing abdomen full of brood
  dome(put, cx, cy + S * 0.06, S * 0.24, S * 0.2, E.lapisDk, E.lapis, E.obsidian);
  // brood bumps glowing through the shell
  [[-0.1, 0.02], [0.08, 0.06], [-0.02, 0.14], [0.14, -0.02], [-0.16, 0.1]].forEach(([ox, oy]) => {
    ell(put, cx + ox * S, cy + oy * S + S * 0.02, S * 0.035, S * 0.03, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
  });
  // gold seam + thorax + head
  for (let y = Math.round(cy - S * 0.12); y < cy + S * 0.24; y++) put(Math.round(cx), y, E.goldDk);
  dome(put, cx, cy - S * 0.14, S * 0.11, S * 0.08, E.obsidian, E.lapisDk, E.oil);
  stroke(put, cx - S * 0.08, cy - S * 0.2, cx + S * 0.08, cy - S * 0.2, 2, () => E.gold);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.045, cy - S * 0.14, S * 0.026, E.curseDk, E.curse, E.curseLt));
  // a couple hatchlings already skittering off her back
  [[-0.2, -0.12], [0.22, -0.08]].forEach(([ox, oy]) => {
    dome(put, cx + ox * S, cy + oy * S, S * 0.035, S * 0.028, E.lapisDk, E.lapis, E.obsidian);
  });
}

// 6 · SAND WRAITH — a dust-devil ghost; dashes as a sand column.
function drawSandWraith(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // swirling sand column body
  for (let i = 0; i < 5; i++) {
    const t = i / 4, w = S * (0.06 + t * 0.13), yy = cy + S * (0.28 - t * 0.4) + S * 0.06;
    ell(put, cx + Math.sin(i * 2.1) * S * 0.03, yy, w, S * 0.055, (tx, ty) => {
      let b = mix(E.sandLt, E.sandDk, ty + (1 - t) * 0.3);
      if (tx < 0.15 || tx > 0.85) b = mix(b, E.sandDkk, 0.4);
      return b;
    });
  }
  // grit flecks orbiting
  [[-0.2, 0.1], [0.22, 0.0], [-0.16, -0.14], [0.18, 0.2], [0.1, -0.22]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandDk));
  // hooded upper form condensing out of the swirl
  dome(put, cx, cy - S * 0.16, S * 0.1, S * 0.1, E.sand, E.sandLt, E.sandDkk);
  ell(put, cx, cy - S * 0.13, S * 0.06, S * 0.05, () => E.sandDkk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.14), E.flameLt));
  // reaching claw arms half-formed
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.08, cy - S * 0.04, cx + s * S * 0.22, cy - S * 0.1, S * 0.035, (t) => mix(E.sand, E.sandDk, t));
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.22, cy - S * 0.1, cx + s * S * 0.25, cy - S * 0.1 + k * S * 0.03, 1, () => E.sandDkk));
  });
}

// 7 · ANKH PRIEST — robed cultist; his ankh channels healing to mobs.
function drawAnkhPriest(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.16);
  // robe
  for (let y = 0; y < S * 0.32; y++) {
    const t = y / (S * 0.32), w = S * (0.07 + t * 0.11);
    row(put, Math.round(cy - S * 0.02 + y), cx - w, cx + w, (tx) => {
      let b = mix(E.wrapLt, E.wrapDk, clamp(t * 1.1, 0, 1));
      if (tx < 0.15 || tx > 0.85) b = mix(b, E.wrapDkk, 0.5);
      return b;
    });
  }
  trim(put, cx - S * 0.1, cx + S * 0.1, Math.round(cy + S * 0.24), 3);
  // sash
  stroke(put, cx - S * 0.06, cy - S * 0.02, cx + S * 0.02, cy + S * 0.26, S * 0.025, () => E.red);
  // shaved head + kohl eyes
  dome(put, cx, cy - S * 0.12, S * 0.08, S * 0.08, E.skin, '#e8b088', E.skinDk);
  [-1, 1].forEach(s => { stroke(put, cx + s * S * 0.05, cy - S * 0.13, cx + s * S * 0.02, cy - S * 0.13, 1, () => E.oil); });
  // raised golden ankh, glowing curse-green
  stroke(put, cx + S * 0.12, cy + S * 0.14, cx + S * 0.2, cy - S * 0.14, S * 0.02, () => E.goldDk);
  const ax = cx + S * 0.21, ay = cy - S * 0.2;
  stroke(put, ax - S * 0.05, ay + S * 0.03, ax + S * 0.05, ay + S * 0.03, S * 0.022, () => E.gold);
  stroke(put, ax, ay + S * 0.03, ax, ay + S * 0.1, S * 0.022, () => E.gold);
  for (let a = 0; a < Math.PI * 2; a += 0.25) put(Math.round(ax + Math.cos(a) * S * 0.035), Math.round(ay - S * 0.015 + Math.sin(a) * S * 0.045), E.goldLt);
  // heal motes drifting off it
  [[0.14, -0.3], [0.28, -0.24], [0.24, -0.1]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.curseLt));
}

// 8 · CANOPIC HORROR — a possessed canopic jar; sloshes curse, splashes slow.
function drawCanopicHorror(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.18);
  // jar body
  for (let y = 0; y < S * 0.3; y++) {
    const t = y / (S * 0.3), w = S * (0.13 + Math.sin(t * Math.PI) * 0.05);
    row(put, Math.round(cy - S * 0.06 + y), cx - w, cx + w, (tx) => {
      let b = mix(E.stoneLt, E.stoneDk, t * 0.8 + Math.abs(tx - 0.5) * 0.5);
      return b;
    });
  }
  glyphs(put, cx - S * 0.1, cy + S * 0.04, cx + S * 0.1, cy + S * 0.2, E.stoneDkk);
  trim(put, cx - S * 0.13, cx + S * 0.13, Math.round(cy + S * 0.2), 3);
  // jackal-head lid, tilted ajar
  dome(put, cx - S * 0.02, cy - S * 0.14, S * 0.1, S * 0.08, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.1, cy - S * 0.14, cx - S * 0.16, cy - S * 0.1, S * 0.035, () => E.jackalDk); // snout
  [-1, 1].forEach(s => stroke(put, cx - S * 0.02 + s * S * 0.05, cy - S * 0.2, cx - S * 0.02 + s * S * 0.07, cy - S * 0.28, S * 0.03, () => E.jackal));
  put(Math.round(cx - S * 0.06), Math.round(cy - S * 0.16), E.curse);
  // curse goop sloshing out under the lid + dribbling
  ell(put, cx + S * 0.06, cy - S * 0.07, S * 0.08, S * 0.03, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
  stroke(put, cx + S * 0.11, cy - S * 0.05, cx + S * 0.13, cy + S * 0.08, 2, () => E.curse);
  ell(put, cx + S * 0.14, cy + S * 0.24, S * 0.06, S * 0.02, (tx, ty) => mix(E.curse, E.curseDk, ty));
  // little grasping hands of goop on the rim
  [-0.06, 0.02].forEach(o => {
    stroke(put, cx + o * S, cy - S * 0.08, cx + o * S - S * 0.01, cy - S * 0.13, 2, () => E.curseDk);
    put(Math.round(cx + o * S - S * 0.01), Math.round(cy - S * 0.14), E.curseLt);
  });
}

// 9 · SPHINXLING — small winged riddler; fires aimed rune-bolts.
function drawSphinxling(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  // lion body couchant
  ell(put, cx + S * 0.03, cy + S * 0.1, S * 0.18, S * 0.11, (tx, ty) => mix(E.sand, E.sandDkk, clamp(ty * 1.2, 0, 1)));
  ell(put, cx + S * 0.16, cy + S * 0.13, S * 0.07, S * 0.07, (tx, ty) => mix(E.sandLt, E.sandDk, ty));
  // front paws
  [[-0.06], [0.02]].forEach(([o]) => stroke(put, cx + o * S, cy + S * 0.16, cx + o * S - S * 0.02, cy + S * 0.22, S * 0.03, () => E.sandDk));
  // folded falcon wings
  [-0.02, 0.1].forEach((o, i) => stroke(put, cx + o * S, cy + S * 0.02, cx + (o + 0.18) * S, cy - S * 0.08, S * 0.04, (t) => mix(i ? E.lapis : E.lapisLt, E.lapisDk, t)));
  // human-ish face w/ nemes
  dome(put, cx - S * 0.12, cy - S * 0.08, S * 0.08, S * 0.08, E.skin, '#e8b088', E.skinDk);
  nemes(put, cx - S * 0.12, cy - S * 0.13, S * 0.07, S * 0.06, E.gold, E.lapis);
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.12 + s * S * 0.03), Math.round(cy - S * 0.09), E.oil));
  stroke(put, cx - S * 0.15, cy - S * 0.03, cx - S * 0.09, cy - S * 0.03, 1, () => E.skinDk);
  // floating rune-bolt it's about to spit
  ell(put, cx - S * 0.28, cy - S * 0.12, S * 0.035, S * 0.035, (tx, ty) => mix(E.purpleLt, E.purpleDk, ty));
  put(Math.round(cx - S * 0.28), Math.round(cy - S * 0.12), E.white);
}

// 10 · SANDSTONE GOLEM — hulking block guardian; the tank.
function drawSandstoneGolem(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.26);
  // legs
  [-1, 1].forEach(s => plate(put, cx + s * S * 0.14 - S * 0.05, cy + S * 0.16, cx + s * S * 0.14 + S * 0.05, cy + S * 0.32, E.stone, E.stoneLt, E.stoneDkk));
  // massive block torso
  plate(put, cx - S * 0.2, cy - S * 0.14, cx + S * 0.2, cy + S * 0.18, E.stone, E.stoneLt, E.stoneDkk);
  glyphs(put, cx - S * 0.17, cy - S * 0.1, cx + S * 0.17, cy + S * 0.14, E.stoneDkk);
  // cracked chest seam glowing curse
  stroke(put, cx - S * 0.04, cy - S * 0.1, cx + S * 0.02, cy + S * 0.06, 2, () => E.curse);
  stroke(put, cx + S * 0.02, cy - S * 0.02, cx + S * 0.08, cy + S * 0.02, 1, () => E.curseDk);
  // shoulder blocks + heavy arms
  [-1, 1].forEach(s => {
    plate(put, cx + s * S * 0.28 - S * 0.07, cy - S * 0.18, cx + s * S * 0.28 + S * 0.07, cy - S * 0.04, E.stoneLt, E.sandLt, E.stoneDk);
    plate(put, cx + s * S * 0.28 - S * 0.055, cy - S * 0.04, cx + s * S * 0.28 + S * 0.055, cy + S * 0.2, E.stone, E.stoneLt, E.stoneDkk);
    dome(put, cx + s * S * 0.28, cy + S * 0.22, S * 0.07, S * 0.055, E.stoneDk, E.stone, E.stoneDkk);
  });
  // head: weathered pharaoh-face block
  plate(put, cx - S * 0.09, cy - S * 0.32, cx + S * 0.09, cy - S * 0.14, E.stoneLt, E.sandLt, E.stoneDk);
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.045, cy - S * 0.25, S * 0.026, E.curseDk, E.curse, E.curseLt));
  stroke(put, cx - S * 0.04, cy - S * 0.17, cx + S * 0.04, cy - S * 0.17, 2, () => E.stoneDkk);
  // chipped corner
  put(Math.round(cx + S * 0.08), Math.round(cy - S * 0.31), E.tombDk);
}

// 11 · JACKAL RUNNER — lean anubian hound; fast pack chaser.
function drawJackalRunner(put, S) {
  const cx = S * 0.5, cy = S * 0.54;
  shadow(put, S, cx, S * 0.22);
  // lean body mid-stride
  ell(put, cx, cy, S * 0.19, S * 0.09, (tx, ty) => mix(E.jackalLt, E.jackalDk, clamp(ty * 1.25, 0, 1)));
  // legs stretched (running)
  stroke(put, cx - S * 0.14, cy + S * 0.04, cx - S * 0.26, cy + S * 0.18, S * 0.028, () => E.jackal);
  stroke(put, cx - S * 0.1, cy + S * 0.06, cx - S * 0.06, cy + S * 0.2, S * 0.028, () => E.jackalDk);
  stroke(put, cx + S * 0.12, cy + S * 0.05, cx + S * 0.24, cy + S * 0.16, S * 0.028, () => E.jackal);
  stroke(put, cx + S * 0.08, cy + S * 0.06, cx + S * 0.12, cy + S * 0.2, S * 0.028, () => E.jackalDk);
  // neck + jackal head w/ tall ears
  stroke(put, cx - S * 0.16, cy - S * 0.02, cx - S * 0.24, cy - S * 0.12, S * 0.05, () => E.jackal);
  dome(put, cx - S * 0.26, cy - S * 0.15, S * 0.06, S * 0.05, E.jackal, E.jackalLt, E.jackalDk);
  stroke(put, cx - S * 0.3, cy - S * 0.14, cx - S * 0.37, cy - S * 0.12, S * 0.03, () => E.jackalDk); // snout
  [-0.01, 0.03].forEach(o => stroke(put, cx - S * 0.24 + o * S, cy - S * 0.19, cx - S * 0.23 + o * S, cy - S * 0.28, S * 0.025, () => E.jackal));
  put(Math.round(cx - S * 0.27), Math.round(cy - S * 0.16), E.flame);
  // gold collar + whip tail
  stroke(put, cx - S * 0.2, cy - S * 0.06, cx - S * 0.16, cy - S * 0.02, 2, () => E.gold);
  stroke(put, cx + S * 0.18, cy - S * 0.02, cx + S * 0.32, cy - S * 0.1, S * 0.02, (t) => mix(E.jackal, E.jackalDk, t));
  // kicked-up sand
  [[-0.3, 0.2], [0.28, 0.18]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
}

// 12 · APEP SPAWN — serpent of chaos; spits venom lobs (arcing AoE).
function drawApepSpawn(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // thick coiled body
  serpent(put, cx, cy + S * 0.14, S * 0.52, 1.6, S * 0.07, (t, ty) => {
    let b = mix(E.purpleLt, E.purpleDk, ty);
    if (Math.floor(t * 10) % 2) b = mix(b, E.obsidian, 0.35);
    return b;
  });
  // rearing neck + big head
  stroke(put, cx + S * 0.18, cy + S * 0.1, cx + S * 0.16, cy - S * 0.16, S * 0.06, () => E.purple);
  dome(put, cx + S * 0.16, cy - S * 0.2, S * 0.09, S * 0.07, E.purple, E.purpleLt, E.purpleDk);
  // jaw open, venom glob forming
  stroke(put, cx + S * 0.08, cy - S * 0.18, cx + S * 0.02, cy - S * 0.14, S * 0.035, () => E.purpleDk);
  ell(put, cx - S * 0.02, cy - S * 0.12, S * 0.04, S * 0.04, (tx, ty) => mix(E.curseLt, E.curseDk, ty));
  // fangs + burning eyes + crown spikes
  [-0.02, 0.04].forEach(o => stroke(put, cx + S * 0.1 + o * S, cy - S * 0.16, cx + S * 0.1 + o * S, cy - S * 0.11, 1, () => E.white));
  put(Math.round(cx + S * 0.17), Math.round(cy - S * 0.22), E.red);
  [[0.12, -0.28], [0.18, -0.3], [0.24, -0.27]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S + S * 0.04, cx + ox * S, cy + oy * S, 2, () => E.redDk));
  // venom drips on the ground
  ell(put, cx - S * 0.08, cy + S * 0.28, S * 0.05, S * 0.018, () => E.curseDk);
}

// 13 · LOCUST CLOUD — buzzing swarm-cloud flyer; drains as it passes.
function drawLocustCloud(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  // the swarm: many small locust bodies in a rough cloud
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, r = Math.pow(rnd(), 0.6) * S * 0.24;
    const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * 0.85;
    const big = rnd() > 0.6;
    ell(put, x, y, S * (big ? 0.022 : 0.014), S * (big ? 0.014 : 0.009), (tx, ty) => mix(E.sandDk, E.tombDk, ty));
    if (big) { put(Math.round(x + S * 0.015), Math.round(y - S * 0.008), E.sandLt); }
  }
  // dense core suggesting a face
  ell(put, cx, cy, S * 0.1, S * 0.07, (tx, ty) => mix(E.tomb, E.tombDk, ty));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.04), Math.round(cy - S * 0.01), E.flameLt));
  // buzz lines
  [[-0.3, -0.16], [0.3, -0.14], [0.34, 0.08]].forEach(([ox, oy]) =>
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.05, cy + oy * S - S * 0.02, 1, () => E.sandDk));
}

// 14 · TOMB WEAVER — pale crypt spider; webs SLOW you (slow-field patches).
function drawTombWeaver(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // web patch beneath
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) stroke(put, cx, cy + S * 0.28, cx + Math.cos(a) * S * 0.16, cy + S * 0.28 + Math.sin(a) * S * 0.06, 1, () => E.wrapLt);
  ell(put, cx, cy + S * 0.28, S * 0.11, S * 0.04, (tx, ty) => { const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25; return d > 0.55 && d <= 1 ? E.wrapLt : null; });
  // eight legs
  [-1, 1].forEach(s => [[-0.14, 0.3], [-0.04, 0.34], [0.06, 0.32], [0.15, 0.26]].forEach(([oy, len], i) => {
    stroke(put, cx + s * S * 0.1, cy + oy * S * 0.5, cx + s * S * len, cy + oy * S * 0.5 - S * 0.08, 2, () => E.boneDk);
    stroke(put, cx + s * S * len, cy + oy * S * 0.5 - S * 0.08, cx + s * S * (len + 0.06), cy + oy * S * 0.5 + S * 0.08, 2, () => E.wrapDkk);
  }));
  // abdomen wrapped like a tiny mummy bundle
  wraps(put, cx + S * 0.08, cy + S * 0.04, S * 0.13, S * 0.11, 0.5);
  // cephalothorax + eye cluster
  dome(put, cx - S * 0.08, cy - S * 0.04, S * 0.08, S * 0.07, E.bone, E.wrapLt, E.boneDk);
  [[-0.12, -0.08], [-0.06, -0.1], [-0.1, -0.02], [-0.04, -0.04]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.red));
  // fangs
  [-0.1, -0.05].forEach(o => stroke(put, cx + o * S, cy + S * 0.02, cx + o * S, cy + S * 0.06, 1, () => E.wrapDkk));
}

// 15 · FLAME OF RA — living brazier fire; leaves a burning trail.
function drawFlameOfRa(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // scorch trail behind
  [[-0.3, 0.26], [-0.2, 0.28], [-0.1, 0.29]].forEach(([ox, oy], i) =>
    ell(put, cx + ox * S, cy + oy * S, S * (0.05 - i * 0.008), S * 0.02, (tx, ty) => mix(E.flameDk, E.tombDk, ty + i * 0.2)));
  flame(put, cx - S * 0.3, cy + S * 0.22, S * 0.05);
  // floating golden brazier bowl
  ell(put, cx, cy + S * 0.14, S * 0.14, S * 0.05, (tx, ty) => mix(E.goldLt, E.goldDkk, ty + Math.abs(tx - 0.5) * 0.4));
  ell(put, cx, cy + S * 0.11, S * 0.11, S * 0.03, () => E.tombDk);
  // hover glow
  ell(put, cx, cy + S * 0.24, S * 0.1, S * 0.03, () => E.flameDk);
  // the living flame body w/ a face
  ell(put, cx, cy - S * 0.04, S * 0.11, S * 0.18, (tx, ty) => mix(E.flame, E.flameDk, ty));
  ell(put, cx, cy - S * 0.0, S * 0.07, S * 0.12, (tx, ty) => mix(E.flameLt, E.flame, ty));
  // licking tongues
  [[-0.08, -0.2], [0.02, -0.26], [0.1, -0.18]].forEach(([ox, oy]) =>
    stroke(put, cx + ox * S * 0.5, cy - S * 0.12, cx + ox * S, cy + oy * S, S * 0.03, (t) => mix(E.flame, E.flameLt, 1 - t)));
  // sun-disc "eye" of Ra at the heart
  ell(put, cx, cy - S * 0.02, S * 0.035, S * 0.035, () => E.white);
  ell(put, cx, cy - S * 0.02, S * 0.02, S * 0.02, () => E.red);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.045), Math.round(cy - S * 0.06), E.oil));
}

// 16 · RIVAL RAIDER — a living treasure hunter; grabs loot + knife-fights you.
function drawRivalRaider(put, S) {
  const cx = S * 0.48, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // legs mid-run
  stroke(put, cx - S * 0.02, cy + S * 0.14, cx - S * 0.1, cy + S * 0.28, S * 0.03, () => E.tomb);
  stroke(put, cx + S * 0.03, cy + S * 0.14, cx + S * 0.1, cy + S * 0.26, S * 0.03, () => E.tombDk);
  // torso w/ vest + bandolier
  dome(put, cx, cy + S * 0.02, S * 0.1, S * 0.13, E.red, E.redLt, E.redDk);
  stroke(put, cx - S * 0.07, cy - S * 0.06, cx + S * 0.08, cy + S * 0.12, S * 0.022, () => E.wrapDkk);
  // head w/ turban + goggles pushed up
  dome(put, cx, cy - S * 0.14, S * 0.075, S * 0.075, E.skin, '#e8b088', E.skinDk);
  ell(put, cx, cy - S * 0.2, S * 0.085, S * 0.05, (tx, ty) => mix(E.wrapLt, E.wrapDk, ty));
  [[-0.03], [0.03]].forEach(([o]) => ell(put, cx + o * S, cy - S * 0.23, S * 0.022, S * 0.022, (tx, ty) => mix(E.goldLt, E.goldDk, ty)));
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.145), E.oil));
  // stolen loot sack over the shoulder, coins spilling
  dome(put, cx - S * 0.16, cy - S * 0.02, S * 0.09, S * 0.1, E.wrapDk, E.wrap, E.wrapDkk);
  stroke(put, cx - S * 0.1, cy - S * 0.1, cx - S * 0.04, cy - S * 0.06, 2, () => E.wrapDkk);
  [[-0.22, 0.1], [-0.18, 0.16], [-0.24, 0.2]].forEach(([ox, oy]) => { ell(put, cx + ox * S, cy + oy * S, S * 0.016, S * 0.012, () => E.gold); });
  // curved dagger raised
  stroke(put, cx + S * 0.1, cy + S * 0.04, cx + S * 0.18, cy - S * 0.04, S * 0.02, () => E.tombDk);
  stroke(put, cx + S * 0.18, cy - S * 0.04, cx + S * 0.26, cy - S * 0.14, S * 0.022, (t) => mix(E.white, E.boneDk, t));
}

// 17 · SARCOPHAGUS MIMIC — a golden coffin that WAITS... then bites.
function drawSarcophagusMimic(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.22);
  // coffin base (lower jaw)
  for (let y = 0; y < S * 0.24; y++) {
    const t = y / (S * 0.24), w = S * (0.16 + t * 0.02);
    row(put, Math.round(cy + S * 0.04 + y), cx - w, cx + w, (tx) => mix(E.gold, E.goldDkk, t * 0.7 + Math.abs(tx - 0.5) * 0.5));
  }
  trim(put, cx - S * 0.17, cx + S * 0.17, Math.round(cy + S * 0.24), 4);
  // lid (upper jaw) hinged open at an angle
  for (let y = 0; y < S * 0.26; y++) {
    const t = y / (S * 0.26), w = S * (0.17 - t * 0.03);
    row(put, Math.round(cy - S * 0.3 + y), cx - w + S * 0.03, cx + w + S * 0.03, (tx) => mix(E.goldLt, E.goldDk, t * 0.8 + Math.abs(tx - 0.5) * 0.4));
  }
  // the lid's serene pharaoh face (deceptive)
  nemes(put, cx + S * 0.03, cy - S * 0.24, S * 0.07, S * 0.05, E.lapis, E.gold);
  [-1, 1].forEach(s => stroke(put, cx + S * 0.03 + s * S * 0.035, cy - S * 0.18, cx + S * 0.03 + s * S * 0.015, cy - S * 0.18, 1, () => E.oil));
  stroke(put, cx + S * 0.01, cy - S * 0.12, cx + S * 0.05, cy - S * 0.12, 1, () => E.goldDkk);
  // the maw between: darkness, fangs, a lolling tongue of wraps
  ell(put, cx, cy - S * 0.0, S * 0.15, S * 0.06, () => E.oil);
  for (let i = -3; i <= 3; i++) {
    stroke(put, cx + i * S * 0.04, cy - S * 0.04, cx + i * S * 0.04, cy + S * 0.0, 2, () => E.bone);
    stroke(put, cx + i * S * 0.04 + S * 0.02, cy + S * 0.045, cx + i * S * 0.04 + S * 0.02, cy + S * 0.01, 2, () => E.bone);
  }
  stroke(put, cx - S * 0.02, cy + S * 0.02, cx - S * 0.1, cy + S * 0.14, S * 0.03, (t) => mix(E.wrap, E.wrapDk, t));
  // greedy glint eyes in the dark
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.07), Math.round(cy - S * 0.02), E.red));
  // scattered bait treasure in front
  [[-0.14, 0.3], [-0.06, 0.33], [0.04, 0.31], [0.12, 0.33]].forEach(([ox, oy]) => ell(put, cx + ox * S, cy + oy * S, S * 0.018, S * 0.013, () => E.gold));
}

// 18 · DUNE LURKER — burrows; erupts under you from a telegraphed circle.
function drawDuneLurker(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // the warning circle it erupts from
  ell(put, cx, cy + S * 0.22, S * 0.2, S * 0.07, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    return d > 0.62 && d <= 1 ? E.sandDk : null;
  });
  // disturbed sand mound
  dome(put, cx, cy + S * 0.2, S * 0.16, S * 0.06, E.sand, E.sandLt, E.sandDkk);
  // the lurker bursting up: armored antlion-worm, mandibles wide
  for (let i = 0; i < 4; i++) {
    const t = i / 3, w = S * (0.13 - t * 0.02), yy = cy + S * (0.12 - t * 0.14);
    ell(put, cx, yy, w, S * 0.06, (tx, ty) => {
      let b = mix(E.stoneLt, E.stoneDk, ty + t * 0.15);
      if (tx < 0.12 || tx > 0.88) b = mix(b, E.stoneDkk, 0.5);
      return b;
    });
  }
  // head plate + four mandible hooks
  dome(put, cx, cy - S * 0.24, S * 0.1, S * 0.07, E.stoneDk, E.stone, E.stoneDkk);
  [[-0.12, -0.3], [-0.05, -0.36], [0.05, -0.36], [0.12, -0.3]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S * 0.6, cy - S * 0.26, cx + ox * S, cy + oy * S, S * 0.03, (t) => mix(E.boneDk, E.wrapDkk, t));
  });
  // ring of teeth + tiny eyes
  for (let a = 0.3; a < Math.PI - 0.3; a += 0.3) put(Math.round(cx - Math.cos(a) * S * 0.08), Math.round(cy - S * 0.22 - Math.sin(a) * S * 0.04), E.bone);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.05), Math.round(cy - S * 0.27), E.red));
  // flying sand chunks
  [[-0.22, 0.02], [0.24, 0.06], [0.18, -0.12]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), E.sandLt));
}

// 19 · OBELISK CHARGER — a possessed mini-obelisk; falls + grinds down a lane.
function drawObeliskCharger(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.2);
  // charge lane dust behind
  [[-0.34, 0.24], [-0.26, 0.26], [-0.18, 0.27]].forEach(([ox, oy], i) =>
    ell(put, cx + ox * S, cy + oy * S, S * (0.05 - i * 0.01), S * 0.02, () => E.sandDk));
  // tilted obelisk body (leaning into the charge)
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    const w = S * (0.13 - t * 0.09);
    const x = cx - S * 0.06 + t * S * 0.16, y = cy + S * 0.24 - t * S * 0.52;
    row(put, Math.round(y), x - w, x + w, (tx) => {
      let b = mix(E.stoneLt, E.stoneDk, tx * 0.7 + t * 0.2);
      return b;
    });
  }
  // glyph column glowing angry
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    const x = cx - S * 0.04 + t * S * 0.14, y = cy + S * 0.16 - t * S * 0.4;
    put(Math.round(x), Math.round(y), E.curse); put(Math.round(x) + 1, Math.round(y), E.curseDk);
    put(Math.round(x), Math.round(y) - 2, E.curseDk);
  }
  // gold pyramidion tip
  const tx0 = cx + S * 0.1, ty0 = cy - S * 0.28;
  for (let y = 0; y < S * 0.08; y++) row(put, Math.round(ty0 + y), tx0 - y * 0.55, tx0 + y * 0.55, (tx) => mix(E.goldLt, E.goldDk, y / (S * 0.08) + Math.abs(tx - 0.5) * 0.3));
  // cracked angry face near the top
  [-1, 1].forEach(s => optic(put, cx + S * 0.06 + s * S * 0.035, cy - S * 0.14, S * 0.024, E.redDk, E.red, E.redLt));
  stroke(put, cx + S * 0.02, cy - S * 0.07, cx + S * 0.1, cy - S * 0.06, 2, () => E.oil);
  // grinding base rubble
  [[-0.1, 0.28], [0.0, 0.3], [0.1, 0.28]].forEach(([ox, oy]) => dome(put, cx + ox * S, cy + oy * S, S * 0.03, S * 0.02, E.stone, E.stoneLt, E.stoneDkk));
}

// 20 · WANDERING SOUL — a drifting ba-bird spirit; floats, wails a curse cone.
function drawWanderingSoul(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  // hover glow
  ell(put, cx, cy + S * 0.26, S * 0.12, S * 0.03, () => E.turqDk);
  // human-headed bird (ba) — glowing spirit body
  ell(put, cx, cy + S * 0.04, S * 0.13, S * 0.1, (tx, ty) => mix(E.turqLt, E.turqDk, clamp(ty * 1.2, 0, 1)));
  // spirit wings
  [-1, 1].forEach(s => {
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      stroke(put, cx + s * S * 0.08, cy + S * 0.0,
        cx + s * S * (0.2 + t * 0.14), cy - S * (0.06 + t * 0.05) + t * S * 0.14, S * 0.035, (tt) => mix(E.turq, E.turqDk, 0.3 + tt * 0.6));
    }
  });
  // tail fan
  [-0.06, 0, 0.06].forEach(o => stroke(put, cx, cy + S * 0.12, cx + o * S * 1.6, cy + S * 0.24, S * 0.03, (t) => mix(E.turq, E.turqDk, t)));
  // small human head w/ burial mask tones
  dome(put, cx, cy - S * 0.12, S * 0.07, S * 0.07, E.turqLt, '#ffffff', E.turq);
  nemes(put, cx, cy - S * 0.16, S * 0.055, S * 0.045, E.turq, E.turqLt);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.028), Math.round(cy - S * 0.125), E.lapisDk));
  // open mouth — the wail
  ell(put, cx, cy - S * 0.075, S * 0.018, S * 0.022, () => E.lapisDk);
  // curse-wail cone hint
  for (let t = 0.2; t < 1; t += 0.2) {
    const w = t * S * 0.1;
    stroke(put, cx - S * 0.02 - t * S * 0.2, cy - S * 0.08 - w, cx - S * 0.02 - t * S * 0.2, cy - S * 0.08 + w, 1, () => (t > 0.7 ? E.turqDk : E.turq));
  }
}

// ========================================================================
const LIST = [
  { n: 1, name: 'SCARAB', role: 'swarm filler', draw: drawScarab },
  { n: 2, name: 'SAND ASP', role: 'lunge biter', draw: drawSandAsp },
  { n: 3, name: 'KHOPESH GUARD', role: 'melee soldier', draw: drawKhopeshGuard },
  { n: 4, name: 'TOMB SENTINEL', role: 'rooted beam turret', draw: drawTombSentinel },
  { n: 5, name: 'BROODMOTHER', role: 'splits into scarabs', draw: drawBroodmother },
  { n: 6, name: 'SAND WRAITH', role: 'dust-devil dasher', draw: drawSandWraith },
  { n: 7, name: 'ANKH PRIEST', role: 'healer', draw: drawAnkhPriest },
  { n: 8, name: 'CANOPIC HORROR', role: 'curse-slow splasher', draw: drawCanopicHorror },
  { n: 9, name: 'SPHINXLING', role: 'aimed rune-bolts', draw: drawSphinxling },
  { n: 10, name: 'SANDSTONE GOLEM', role: 'tank', draw: drawSandstoneGolem },
  { n: 11, name: 'JACKAL RUNNER', role: 'fast pack chaser', draw: drawJackalRunner },
  { n: 12, name: 'APEP SPAWN', role: 'venom lobber (AoE)', draw: drawApepSpawn },
  { n: 13, name: 'LOCUST CLOUD', role: 'draining flyer', draw: drawLocustCloud },
  { n: 14, name: 'TOMB WEAVER', role: 'web slow-fields', draw: drawTombWeaver },
  { n: 15, name: 'FLAME OF RA', role: 'fire-trail chaser', draw: drawFlameOfRa },
  { n: 16, name: 'RIVAL RAIDER', role: 'loot thief duelist', draw: drawRivalRaider },
  { n: 17, name: 'SARCO-MIMIC', role: 'treasure ambusher', draw: drawSarcophagusMimic },
  { n: 18, name: 'DUNE LURKER', role: 'erupts under you', draw: drawDuneLurker },
  { n: 19, name: 'OBELISK CHARGER', role: 'lane charger', draw: drawObeliskCharger },
  { n: 20, name: 'WANDERING SOUL', role: 'wail-cone spirit', draw: drawWanderingSoul },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'pyramid_mob_options.png',
  title: 'PYRAMID PLUNDER — MOB CANDIDATES (pick 8, tell me numbers to change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
