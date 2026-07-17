// artdev/skyisles/render_sky_mobs.js — 20 numbered STORM SKY ISLES mob
// candidates, hi-fi 160x160, one PNG grid for Red to pick 8 from.
//   RANGER_PATH=<ranger_art.js> node render_sky_mobs.js out.png
'use strict';
const KIT = require('./sky_kit.js');
const { K, mix, clamp, ell, row, stroke, lerp, plate, dome, bolt, optic, shadow, renderSheet, cloudBlob, zig, wing, gust } = KIT;

// ========================================================================
// 1 · ZEPHYR WISP — tiny wind spirit; the cheap swarm filler.
function drawZephyrWisp(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  gust(put, cx - S * 0.2, cy + S * 0.12, S * 0.16, K.windDk);
  gust(put, cx + S * 0.24, cy - S * 0.05, S * 0.12, K.windDk);
  // swirling teardrop body
  ell(put, cx, cy, S * 0.17, S * 0.2, (tx, ty) => mix(K.skyLt, K.wind, clamp(ty * 1.3, 0, 1)));
  ell(put, cx, cy + S * 0.02, S * 0.11, S * 0.13, (tx, ty) => mix('#ffffff', K.skyLt, ty));
  // trailing curl tail
  stroke(put, cx - S * 0.05, cy + S * 0.16, cx - S * 0.22, cy + S * 0.3, S * 0.05, (t) => mix(K.wind, K.windDk, t));
  stroke(put, cx - S * 0.22, cy + S * 0.3, cx - S * 0.14, cy + S * 0.36, S * 0.03, () => K.windDk);
  // sleepy crescent eyes
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.06, cy - S * 0.04, cx + s * S * 0.1, cy - S * 0.02, 2, () => K.thunderDkk));
  // wind streaks blowing off
  [-0.14, 0.02, 0.16].forEach(o => stroke(put, cx + S * 0.16, cy + o * S, cx + S * 0.3, cy + o * S - S * 0.03, 2, () => K.skyLt));
}

// 2 · STORM SPRITE — crackling lightning imp; fast chaser.
function drawStormSprite(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.14);
  // jagged aura
  zig(put, cx - S * 0.28, cy - S * 0.1, cx - S * 0.16, cy + S * 0.12, 2, K.volt, K.voltLt);
  zig(put, cx + S * 0.28, cy - S * 0.14, cx + S * 0.18, cy + S * 0.1, 2, K.volt, K.voltLt);
  // spiky imp body of storm-cloud stuff
  dome(put, cx, cy + S * 0.05, S * 0.16, S * 0.15, K.thunder, K.cloudMd, K.thunderDkk);
  // lightning hair spikes
  [[-0.12, -0.3], [0, -0.36], [0.12, -0.3]].forEach(([ox, oy]) =>
    stroke(put, cx + ox * S * 0.5, cy - S * 0.08, cx + ox * S, cy + oy * S * 0.5, S * 0.035, (t) => mix(K.volt, K.voltDk, t)));
  // head
  dome(put, cx, cy - S * 0.12, S * 0.12, S * 0.11, K.thunder, K.cloud, K.thunderDk);
  // wide grin + volt eyes
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.055, cy - S * 0.14, S * 0.032, K.voltDk, K.volt, K.voltLt));
  stroke(put, cx - S * 0.06, cy - S * 0.06, cx + S * 0.06, cy - S * 0.06, 2, () => K.voltLt);
  // little zappy hands
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.14, cy + S * 0.02, cx + s * S * 0.26, cy - S * 0.04, S * 0.03, () => K.thunderDk);
    ell(put, cx + s * S * 0.27, cy - S * 0.05, S * 0.03, S * 0.03, () => K.voltLt);
  });
}

// 3 · HARPY — feathered raider; telegraphed dive-pounce.
function drawHarpy(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.16);
  wing(put, cx - S * 0.08, cy - S * 0.04, S * 0.3, S * 0.14, -1, K.feather, K.featherLt, K.featherDkk);
  wing(put, cx + S * 0.08, cy - S * 0.04, S * 0.3, S * 0.14, 1, K.feather, K.featherLt, K.featherDkk);
  // tail feathers
  [-0.08, 0, 0.08].forEach(o => stroke(put, cx, cy + S * 0.12, cx + o * S, cy + S * 0.3, S * 0.035, (t) => mix(K.feather, K.featherDkk, t)));
  // body
  dome(put, cx, cy + S * 0.02, S * 0.12, S * 0.16, K.featherDk, K.feather, K.featherDkk);
  // head with wild hair — bigger, face clearly lit
  dome(put, cx, cy - S * 0.17, S * 0.1, S * 0.1, K.skin, '#ffd9b8', K.skinDk);
  ell(put, cx, cy - S * 0.25, S * 0.11, S * 0.05, (tx, ty) => mix(K.indigoLt, K.indigoDk, tx));
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.09, cy - S * 0.26, cx + s * S * 0.18, cy - S * 0.33, S * 0.035, () => K.indigoDk));
  // fierce glowing eyes + fanged grin
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.045, cy - S * 0.18, S * 0.026, K.redDk, K.red, K.redLt));
  stroke(put, cx - S * 0.04, cy - S * 0.11, cx + S * 0.04, cy - S * 0.11, 2, () => K.oil);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.02), Math.round(cy - S * 0.095), '#ffffff'));
  // talon legs
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.05, cy + S * 0.16, cx + s * S * 0.09, cy + S * 0.3, S * 0.025, () => K.gold);
    [-1, 0, 1].forEach(k => stroke(put, cx + s * S * 0.09, cy + S * 0.3, cx + s * S * 0.09 + k * S * 0.03, cy + S * 0.34, 2, () => K.goldDk));
  });
}

// 4 · CLOUD RAY — drifting manta of cloudstuff; floats over walls.
function drawCloudRay(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // broad diamond wing body
  ell(put, cx, cy, S * 0.34, S * 0.17, (tx, ty) => {
    let b = mix(K.cloudLt, K.cloudMd, clamp(ty * 1.35, 0, 1));
    if (tx < 0.16 || tx > 0.84) b = mix(b, K.cloudDk, 0.5);
    return b;
  });
  // wingtip curls
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.3, cy - S * 0.02, cx + s * S * 0.4, cy - S * 0.1, S * 0.04, (t) => mix(K.cloudMd, K.cloudDk, t)));
  // long tail streamer
  stroke(put, cx, cy + S * 0.12, cx - S * 0.1, cy + S * 0.3, S * 0.03, (t) => mix(K.cloudMd, K.cloudDkk, t));
  stroke(put, cx - S * 0.1, cy + S * 0.3, cx - S * 0.04, cy + S * 0.38, 2, () => K.cloudDkk);
  // storm-lit belly stripes
  [-0.1, 0, 0.1].forEach(o => row(put, Math.round(cy + S * 0.06), cx + (o - 0.14) * S, cx + (o + 0.14) * S, () => K.cloudDk));
  // gentle eyes on the leading edge
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.1, cy - S * 0.06, S * 0.035, K.skyDkk, K.sky, K.skyLt));
  // static sparkles riding its back
  [[-0.18, -0.1], [0.14, -0.12], [0.02, -0.02]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.voltLt));
}

// 5 · THUNDERHEAD — living anvil-cloud; charges up, then a telegraphed
//     radial discharge circle.
function drawThunderhead(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // warn ring on the ground (its telegraph)
  ell(put, cx, S * 0.88, S * 0.3, S * 0.06, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    return d > 0.55 && d <= 1 ? K.voltDk : null;
  });
  // big brooding cumulonimbus
  cloudBlob(put, cx, cy, S * 0.26, K.thunder, K.cloud, K.thunderDkk);
  cloudBlob(put, cx - S * 0.04, cy - S * 0.14, S * 0.16, K.cloudMd, K.cloudLt, K.thunderDk);
  // glowering under-glow
  ell(put, cx, cy + S * 0.14, S * 0.2, S * 0.07, (tx, ty) => mix(K.volt, K.thunderDk, ty * 1.2));
  // angry eyes deep in the cloud
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.09, cy - S * 0.01, S * 0.04, K.voltDk, K.volt, K.voltLt));
  stroke(put, cx - S * 0.13, cy - S * 0.08, cx - S * 0.05, cy - S * 0.05, 3, () => K.thunderDkk);
  stroke(put, cx + S * 0.13, cy - S * 0.08, cx + S * 0.05, cy - S * 0.05, 3, () => K.thunderDkk);
  // charge bolts dangling
  zig(put, cx - S * 0.14, cy + S * 0.16, cx - S * 0.18, cy + S * 0.32, 2, K.volt, K.voltLt);
  zig(put, cx + S * 0.12, cy + S * 0.16, cx + S * 0.16, cy + S * 0.3, 2, K.volt, K.voltLt);
}

// 6 · GALE DJINN — wind caster; fires aimed gust bolts that shove.
function drawGaleDjinn(put, S) {
  const cx = S * 0.5, cy = S * 0.44;
  // vortex tail instead of legs
  for (let i = 0; i < 4; i++) {
    const w = S * (0.16 - i * 0.03), yy = cy + S * (0.16 + i * 0.07);
    ell(put, cx + (i % 2 ? S * 0.03 : -S * 0.03), yy, w, S * 0.045, (tx, ty) => mix(K.wind, K.windDk, ty + i * 0.12));
  }
  // torso
  dome(put, cx, cy + S * 0.02, S * 0.15, S * 0.17, K.sky, K.skyLt, K.skyDk);
  // crossed arms conjuring a gust orb
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.13, cy + S * 0.02, cx + s * S * 0.05, cy - S * 0.06, S * 0.045, () => K.skyDk));
  ell(put, cx, cy - S * 0.06, S * 0.06, S * 0.06, (tx, ty) => mix('#ffffff', K.wind, (tx + ty) / 2));
  gust(put, cx, cy - S * 0.06, S * 0.08, K.windDk);
  // head with swept turban + plume
  dome(put, cx, cy - S * 0.17, S * 0.09, S * 0.08, K.sky, K.skyLt, K.skyDk);
  ell(put, cx, cy - S * 0.24, S * 0.1, S * 0.06, (tx, ty) => mix(K.marbleLt, K.marbleDk, ty));
  bolt(put, cx, cy - S * 0.24, S * 0.02, K.gold, K.goldDk);
  stroke(put, cx + S * 0.08, cy - S * 0.26, cx + S * 0.16, cy - S * 0.34, S * 0.025, () => K.skyLt);
  // glowing white eyes
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.04), Math.round(cy - S * 0.17), '#ffffff'));
}

// 7 · SKY JELLY — drifting storm jellyfish; contact shock + slowing tendrils.
function drawSkyJelly(put, S) {
  const cx = S * 0.5, cy = S * 0.4;
  // translucent bell
  dome(put, cx, cy, S * 0.22, S * 0.18, K.purple, K.purpleLt, K.purpleDk);
  ell(put, cx - S * 0.07, cy - S * 0.07, S * 0.07, S * 0.05, () => K.purpleLt);
  // inner storm core
  ell(put, cx, cy + S * 0.02, S * 0.09, S * 0.07, (tx, ty) => mix(K.voltLt, K.volt, ty));
  // bell rim scallops
  for (let i = -3; i <= 3; i++) ell(put, cx + i * S * 0.065, cy + S * 0.15, S * 0.035, S * 0.03, (tx, ty) => mix(K.purple, K.purpleDk, ty));
  // trailing tendrils with spark tips
  [-0.16, -0.08, 0, 0.08, 0.16].forEach((o, i) => {
    const sway = (i % 2 ? 1 : -1) * S * 0.04;
    stroke(put, cx + o * S, cy + S * 0.17, cx + o * S + sway, cy + S * 0.4, 2, (t) => mix(K.purpleLt, K.purpleDk, t));
    if (i % 2 === 0) put(Math.round(cx + o * S + sway), Math.round(cy + S * 0.41), K.voltLt);
  });
  // dot eyes
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.06), Math.round(cy + S * 0.04), K.oil));
}

// 8 · GRIFFIN CUB — young sky-lion; sturdy melee chaser.
function drawGriffinCub(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.2);
  // folded wings on the back
  wing(put, cx - S * 0.02, cy - S * 0.1, S * 0.22, S * 0.1, -1, K.cloudMd, K.cloudLt, K.cloudDkk);
  // lion body
  ell(put, cx + S * 0.02, cy + S * 0.08, S * 0.19, S * 0.13, (tx, ty) => mix(K.gold, K.goldDk, clamp(ty * 1.2, 0, 1)));
  // haunch + legs
  ell(put, cx + S * 0.14, cy + S * 0.12, S * 0.08, S * 0.08, (tx, ty) => mix(K.goldLt, K.goldDk, ty));
  [[-0.1, 1], [0.02, 1], [0.14, 1]].forEach(([o]) => stroke(put, cx + o * S, cy + S * 0.16, cx + o * S, cy + S * 0.28, S * 0.035, () => K.goldDk));
  // lion tail with tuft
  stroke(put, cx + S * 0.2, cy + S * 0.04, cx + S * 0.32, cy - S * 0.06, S * 0.025, () => K.goldDk);
  ell(put, cx + S * 0.33, cy - S * 0.07, S * 0.03, S * 0.03, () => K.featherDk);
  // white feather ruff collar
  ell(put, cx - S * 0.12, cy - S * 0.02, S * 0.1, S * 0.08, (tx, ty) => mix('#ffffff', K.cloudMd, ty));
  // eagle head — bigger, forward-facing profile
  dome(put, cx - S * 0.15, cy - S * 0.12, S * 0.11, S * 0.1, K.cloudLt, '#ffffff', K.cloudMd);
  // hooked beak, two-tone
  stroke(put, cx - S * 0.24, cy - S * 0.13, cx - S * 0.32, cy - S * 0.1, S * 0.05, () => K.brass);
  stroke(put, cx - S * 0.31, cy - S * 0.09, cx - S * 0.33, cy - S * 0.05, S * 0.03, () => K.brassDk);
  // keen eye w/ dark brow stripe + little ear tufts
  stroke(put, cx - S * 0.22, cy - S * 0.17, cx - S * 0.1, cy - S * 0.16, 3, () => K.featherDk);
  optic(put, cx - S * 0.16, cy - S * 0.13, S * 0.033, K.skyDkk, K.sky, K.skyLt);
  [[-0.2, -0.2], [-0.12, -0.22]].forEach(([ox, oy]) => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + S * 0.02, cy + oy * S - S * 0.05, 2, () => '#ffffff'));
}

// 9 · NIMBUS GOLEM — thundercloud giant with a storm-crystal heart; tank.
function drawNimbusGolem(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.24);
  // legs of packed cloud
  [-1, 1].forEach(s => dome(put, cx + s * S * 0.12, cy + S * 0.26, S * 0.09, S * 0.12, K.thunder, K.cloudMd, K.thunderDkk));
  // massive cloud torso
  cloudBlob(put, cx, cy + S * 0.02, S * 0.24, K.thunder, K.cloud, K.thunderDkk);
  // shoulder boulders
  [-1, 1].forEach(s => dome(put, cx + s * S * 0.22, cy - S * 0.12, S * 0.1, S * 0.09, K.stone, K.stoneLt, K.stoneDkk));
  // heavy fists
  [-1, 1].forEach(s => {
    stroke(put, cx + s * S * 0.24, cy - S * 0.06, cx + s * S * 0.3, cy + S * 0.14, S * 0.05, () => K.thunderDk);
    dome(put, cx + s * S * 0.31, cy + S * 0.18, S * 0.08, S * 0.07, K.stone, K.stoneLt, K.stoneDkk);
  });
  // glowing crystal heart in a cloud cavity
  ell(put, cx, cy + S * 0.02, S * 0.08, S * 0.09, () => K.thunderDkk);
  const hx = cx, hy = cy + S * 0.02;
  [[0, -0.05], [-0.035, 0.02], [0.035, 0.02], [0, 0.06]].forEach(([ox, oy]) =>
    ell(put, hx + ox * S, hy + oy * S, S * 0.025, S * 0.035, (tx, ty) => mix(K.voltLt, K.volt, ty)));
  // stern brow + eyes
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.07, cy - S * 0.14, S * 0.03, K.voltDk, K.volt, K.voltLt));
  stroke(put, cx - S * 0.11, cy - S * 0.19, cx + S * 0.11, cy - S * 0.19, 3, () => K.thunderDkk);
}

// 10 · VOLT VARIA — lightning elemental; blinks (teleports) between zaps.
function drawVoltVaria(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  // after-image at old position
  ell(put, cx - S * 0.24, cy + S * 0.06, S * 0.1, S * 0.14, (tx, ty) => ((tx * 7 | 0) + (ty * 7 | 0)) % 2 === 0 ? K.voltDk : null);
  // crackling body — a bolt given legs
  ell(put, cx + S * 0.05, cy, S * 0.13, S * 0.17, (tx, ty) => mix(K.voltLt, K.volt, clamp(ty * 1.3, 0, 1)));
  zig(put, cx + S * 0.05, cy - S * 0.3, cx + S * 0.05, cy - S * 0.12, 3, K.volt, K.voltLt);
  zig(put, cx - S * 0.06, cy + S * 0.12, cx - S * 0.14, cy + S * 0.32, 3, K.volt, K.voltLt);
  zig(put, cx + S * 0.14, cy + S * 0.12, cx + S * 0.2, cy + S * 0.3, 3, K.volt, K.voltLt);
  // arc arms
  zig(put, cx - S * 0.06, cy - S * 0.02, cx - S * 0.24, cy - S * 0.1, 2, K.volt, K.voltLt);
  zig(put, cx + S * 0.16, cy - S * 0.04, cx + S * 0.3, cy - S * 0.14, 2, K.volt, K.voltLt);
  // white-hot core face
  ell(put, cx + S * 0.05, cy - S * 0.03, S * 0.07, S * 0.08, () => K.voltCore);
  [-1, 1].forEach(s => put(Math.round(cx + S * 0.05 + s * S * 0.03), Math.round(cy - S * 0.04), K.skyDkk));
  stroke(put, cx + S * 0.02, cy + S * 0.01, cx + S * 0.08, cy + S * 0.01, 1, () => K.skyDkk);
}

// 11 · WIND WARDEN — cherub-knight of the gale; shields nearby mobs
//      with a wind barrier (guard-aura tech).
function drawWindWarden(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // shield-bubble arc it projects
  ell(put, cx, cy, S * 0.36, S * 0.36, (tx, ty) => {
    const d = (tx - 0.5) ** 2 + (ty - 0.5) ** 2;
    return d > 0.2 && d <= 0.25 && ty < 0.55 ? K.wind : null;
  });
  // stubby armored body
  plate(put, cx - S * 0.11, cy - S * 0.02, cx + S * 0.11, cy + S * 0.16, K.marble, K.marbleLt, K.marbleDk);
  row(put, Math.round(cy + S * 0.06), cx - S * 0.11, cx + S * 0.11, () => K.brass);
  // small wings, fast-beating
  wing(put, cx - S * 0.1, cy - S * 0.02, S * 0.18, S * 0.12, -1, K.cloudLt, '#ffffff', K.cloudDk);
  wing(put, cx + S * 0.1, cy - S * 0.02, S * 0.18, S * 0.12, 1, K.cloudLt, '#ffffff', K.cloudDk);
  // round helmeted head
  dome(put, cx, cy - S * 0.12, S * 0.09, S * 0.08, K.brass, K.brassLt, K.brassDk);
  plate(put, cx - S * 0.06, cy - S * 0.13, cx + S * 0.06, cy - S * 0.08, K.ironDk, K.iron, K.ironDkk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.105), K.skyLt));
  // horn it blows to raise the barrier
  stroke(put, cx + S * 0.08, cy - S * 0.06, cx + S * 0.22, cy - S * 0.12, S * 0.04, (t) => mix(K.gold, K.goldDk, 1 - t));
  ell(put, cx + S * 0.23, cy - S * 0.13, S * 0.035, S * 0.045, () => K.goldLt);
}

// 12 · STORM HERALD — robed caller; marks circles where bolts strike.
function drawStormHerald(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  shadow(put, S, cx, S * 0.18);
  // marked strike circle beside it (its telegraph)
  ell(put, cx + S * 0.26, S * 0.84, S * 0.12, S * 0.045, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    return d > 0.5 && d <= 1 ? K.volt : null;
  });
  zig(put, cx + S * 0.26, S * 0.5, cx + S * 0.26, S * 0.8, 2, K.volt, K.voltLt);
  // hooded robe swept by wind
  for (let y = 0; y < S * 0.34; y++) {
    const t = y / (S * 0.34), w = S * (0.08 + t * 0.13);
    row(put, Math.round(cy + y - S * 0.02), cx - w + Math.sin(t * 5) * S * 0.02, cx + w + Math.sin(t * 5) * S * 0.02, (tx) => {
      let b = mix(K.indigoLt, K.indigoDk, clamp(t * 1.2, 0, 1));
      if (tx < 0.15 || tx > 0.85) b = mix(b, K.thunderDkk, 0.5);
      return b;
    });
  }
  // hood + void face with volt eyes
  dome(put, cx, cy - S * 0.1, S * 0.1, S * 0.1, K.indigo, K.indigoLt, K.indigoDk);
  ell(put, cx, cy - S * 0.08, S * 0.06, S * 0.055, () => K.thunderDkk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.09), K.voltLt));
  // raised staff crowned with a storm orb
  stroke(put, cx - S * 0.14, cy + S * 0.24, cx - S * 0.2, cy - S * 0.22, S * 0.025, () => K.woodDk);
  ell(put, cx - S * 0.2, cy - S * 0.26, S * 0.05, S * 0.05, (tx, ty) => mix(K.voltLt, K.voltDk, ty));
  gust(put, cx - S * 0.2, cy - S * 0.26, S * 0.07, K.volt);
}

// 13 · KITE FIEND — imp riding a box kite; strafing dive dasher.
function drawKiteFiend(put, S) {
  const cx = S * 0.5, cy = S * 0.46;
  // box kite frame
  const kx = cx + S * 0.1, ky = cy - S * 0.16;
  [[-0.16, -0.1, 0.16, -0.02], [-0.16, 0.06, 0.16, 0.14]].forEach(([a, b, c, d]) =>
    plate(put, kx + a * S, ky + b * S, kx + c * S, ky + d * S, K.red, K.redLt, K.redDk));
  [[-0.16], [0.16]].forEach(([o]) => stroke(put, kx + o * S, ky - S * 0.1, kx + o * S, ky + S * 0.14, 2, () => K.woodDk));
  stroke(put, kx - S * 0.16, ky - S * 0.1, kx + S * 0.16, ky + 0.14 * S, 1, () => K.rope);
  // kite tail with bows
  stroke(put, kx + S * 0.16, ky + S * 0.14, kx + S * 0.3, ky + S * 0.3, 1, () => K.rope);
  [[0.2, 0.19], [0.26, 0.26]].forEach(([ox, oy]) => ell(put, kx + ox * S, ky + oy * S, S * 0.02, S * 0.015, () => K.gold));
  // imp dangling under it
  stroke(put, kx - S * 0.04, ky + S * 0.14, cx - S * 0.08, cy + S * 0.1, 1, () => K.rope);
  dome(put, cx - S * 0.1, cy + S * 0.16, S * 0.09, S * 0.09, K.purple, K.purpleLt, K.purpleDk);
  dome(put, cx - S * 0.1, cy + S * 0.05, S * 0.06, S * 0.055, K.purple, K.purpleLt, K.purpleDk);
  // horns + grin
  [-1, 1].forEach(s => stroke(put, cx - S * 0.1 + s * S * 0.04, cy + S * 0.01, cx - S * 0.1 + s * S * 0.07, cy - S * 0.03, 2, () => K.marbleLt));
  [-1, 1].forEach(s => put(Math.round(cx - S * 0.1 + s * S * 0.025), Math.round(cy + S * 0.04), K.voltLt));
  stroke(put, cx - S * 0.13, cy + S * 0.075, cx - S * 0.07, cy + S * 0.075, 1, () => K.oil);
  // clutching a little knife
  stroke(put, cx - S * 0.02, cy + S * 0.14, cx + S * 0.05, cy + S * 0.1, 2, () => K.stoneLt);
}

// 14 · GUST SIREN — storm chanter whose song PULLS you toward her
//      (mag-crane pull re-themed as wind suction).
function drawGustSiren(put, S) {
  const cx = S * 0.5, cy = S * 0.48;
  // suction spiral in front
  for (let a = 0; a < 5.5; a += 0.14) {
    const rr = S * 0.05 + a * S * 0.035;
    const px = cx - S * 0.26 + Math.cos(a + 1.2) * rr * 0.6, py = cy + Math.sin(a + 1.2) * rr * 0.4;
    put(Math.round(px), Math.round(py), a > 4 ? K.wind : K.windDk);
  }
  // finned tail coiling under
  stroke(put, cx + S * 0.02, cy + S * 0.16, cx + S * 0.2, cy + S * 0.3, S * 0.06, (t) => mix(K.sky, K.skyDkk, t));
  stroke(put, cx + S * 0.2, cy + S * 0.3, cx + S * 0.3, cy + S * 0.24, S * 0.04, () => K.skyDk);
  [[0.3, 0.22], [0.33, 0.28]].forEach(([ox, oy]) => stroke(put, cx + S * 0.3, cy + S * 0.25, cx + ox * S + S * 0.06, cy + oy * S, 2, () => K.skyLt));
  // torso leaning into the song
  dome(put, cx, cy + S * 0.02, S * 0.11, S * 0.15, K.sky, K.skyLt, K.skyDk);
  // head, open singing mouth (drawn first, hair layers over)
  dome(put, cx, cy - S * 0.14, S * 0.08, S * 0.08, K.skin, '#ffd9b8', K.skinDk);
  ell(put, cx - S * 0.05, cy - S * 0.1, S * 0.025, S * 0.032, () => K.oil);
  put(Math.round(cx - S * 0.02), Math.round(cy - S * 0.16), K.oil);
  // flowing cloud-hair: crown volume + long streamers blown forward
  dome(put, cx + S * 0.03, cy - S * 0.2, S * 0.09, S * 0.06, K.cloudLt, '#ffffff', K.cloudDk);
  for (let i = 0; i < 5; i++)
    stroke(put, cx + S * 0.06, cy - S * 0.2 + i * 2.5, cx - S * 0.18 - i * S * 0.02, cy - S * 0.2 + i * S * 0.045, S * 0.035, (t) => mix(K.cloudLt, K.cloudDk, t));
  // song notes spiraling out
  [[-0.32, -0.12], [-0.38, 0.0], [-0.3, 0.1]].forEach(([ox, oy]) => {
    stroke(put, cx + ox * S, cy + oy * S, cx + ox * S, cy + oy * S - S * 0.05, 1, () => K.marbleLt);
    ell(put, cx + ox * S - S * 0.012, cy + oy * S, S * 0.015, S * 0.012, () => K.marbleLt);
  });
}

// 15 · STORMVANE SENTINEL — possessed weathervane totem; rooted turret
//      that vents radial static rings.
function drawStormvane(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // stone plinth
  plate(put, cx - S * 0.12, cy + S * 0.18, cx + S * 0.12, cy + S * 0.32, K.stone, K.stoneLt, K.stoneDkk);
  plate(put, cx - S * 0.08, cy + S * 0.02, cx + S * 0.08, cy + S * 0.18, K.stoneDk, K.stone, K.stoneDkk);
  // iron pole
  stroke(put, cx, cy - S * 0.3, cx, cy + S * 0.04, S * 0.03, () => K.ironDk);
  // N/S/E/W cross arms
  stroke(put, cx - S * 0.2, cy - S * 0.1, cx + S * 0.2, cy - S * 0.1, S * 0.02, () => K.iron);
  [['W', -0.24], ['E', 0.22]].forEach(([, o]) => plate(put, cx + o * S, cy - S * 0.13, cx + o * S + S * 0.05, cy - S * 0.07, K.brass, K.brassLt, K.brassDk));
  // the vane: a wrought rooster-hawk silhouette, eye burning
  stroke(put, cx - S * 0.1, cy - S * 0.3, cx + S * 0.12, cy - S * 0.3, S * 0.04, () => K.copper);
  stroke(put, cx + S * 0.12, cy - S * 0.3, cx + S * 0.18, cy - S * 0.36, S * 0.03, () => K.copperDk);
  stroke(put, cx - S * 0.1, cy - S * 0.3, cx - S * 0.16, cy - S * 0.24, S * 0.03, () => K.copperDk);
  optic(put, cx + S * 0.13, cy - S * 0.32, S * 0.025, K.redDk, K.red, K.redLt);
  // static ring venting off the pole
  ell(put, cx, cy - S * 0.02, S * 0.24, S * 0.1, (tx, ty) => {
    const d = (tx - 0.5) ** 2 / 0.25 + (ty - 0.5) ** 2 / 0.25;
    return d > 0.6 && d <= 1 ? K.volt : null;
  });
  [[-0.24, -0.02], [0.24, -0.02]].forEach(([ox, oy]) => put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.voltLt));
}

// 16 · RAIN SHEPHERD — gentle cloud-herder; heals mobs with rain (mender).
function drawRainShepherd(put, S) {
  const cx = S * 0.5, cy = S * 0.5;
  shadow(put, S, cx, S * 0.16);
  // little rain cloud it carries over allies
  cloudBlob(put, cx + S * 0.2, cy - S * 0.26, S * 0.1, K.cloud, K.cloudLt, K.cloudDk);
  [[-0.03, 0], [0.04, 0.02], [0.005, 0.05]].forEach(([ox, oy]) =>
    stroke(put, cx + S * 0.2 + ox * S * 3, cy - S * 0.18 + oy * S * 3, cx + S * 0.2 + ox * S * 3, cy - S * 0.14 + oy * S * 3, 1, () => K.sky));
  // round mossy body — a walking tuft of cloud in a poncho
  dome(put, cx, cy + S * 0.06, S * 0.16, S * 0.16, K.grass, K.grassLt, K.grassDkk);
  plate(put, cx - S * 0.16, cy + S * 0.02, cx + S * 0.16, cy + S * 0.08, K.marble, K.marbleLt, K.marbleDk);
  // cloud-puff head
  cloudBlob(put, cx, cy - S * 0.12, S * 0.11, K.cloud, K.cloudLt, K.cloudDk);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.045), Math.round(cy - S * 0.12), K.thunderDkk));
  stroke(put, cx - S * 0.02, cy - S * 0.07, cx + S * 0.02, cy - S * 0.07, 1, () => K.thunderDk);
  // shepherd's crook
  stroke(put, cx - S * 0.18, cy + S * 0.22, cx - S * 0.18, cy - S * 0.2, S * 0.02, () => K.wood);
  for (let a = 3.2; a < 5.8; a += 0.2) put(Math.round(cx - S * 0.18 + Math.cos(a) * S * 0.05), Math.round(cy - S * 0.2 + Math.sin(a) * S * 0.05 + S * 0.05), K.woodLt);
  // stubby feet
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.07, cy + S * 0.24, S * 0.04, S * 0.025, () => K.grassDkk));
}

// 17 · STORM IBEX — cloud-goat; telegraphed thunder-charge down a lane.
function drawStormIbex(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.22);
  // charge lane flash behind it
  for (let x = 0; x < S * 0.2; x += 4) row(put, Math.round(cy + S * 0.02), cx - S * 0.46 + x, cx - S * 0.44 + x, () => K.voltDk);
  // muscular body, head lowered
  ell(put, cx + S * 0.04, cy, S * 0.2, S * 0.13, (tx, ty) => mix(K.cloudMd, K.cloudDkk, clamp(ty * 1.2, 0, 1)));
  // storm mane along the spine
  for (let i = 0; i < 6; i++) {
    const mx = cx - S * 0.06 + i * S * 0.05;
    stroke(put, mx, cy - S * 0.1, mx - S * 0.03, cy - S * 0.18, S * 0.03, (t) => mix(K.volt, K.thunderDk, t));
  }
  // legs braced
  [[-0.08, 0.1], [0.02, 0.12], [0.12, 0.1], [0.2, 0.12]].forEach(([o]) =>
    stroke(put, cx + o * S, cy + S * 0.1, cx + o * S - S * 0.02, cy + S * 0.26, S * 0.035, () => K.cloudDkk));
  [[-0.1], [0.0], [0.1], [0.18]].forEach(([o]) => ell(put, cx + o * S, cy + S * 0.27, S * 0.025, S * 0.015, () => K.ironDk));
  // lowered head — bigger, wedge-shaped, ramming forward
  dome(put, cx - S * 0.2, cy + S * 0.01, S * 0.11, S * 0.1, K.cloudMd, K.cloud, K.cloudDkk);
  stroke(put, cx - S * 0.28, cy + S * 0.05, cx - S * 0.33, cy + S * 0.09, S * 0.05, () => K.cloudDk);
  // huge back-sweeping ibex horns (thick ridged arcs)
  [0, 1].forEach(layer => {
    for (let a = 0.2; a < 2.9; a += 0.14) {
      const rr = S * (0.07 + a * 0.045);
      const hx = cx - S * 0.16 + Math.cos(a + 1.6) * rr, hy = cy - S * 0.06 - Math.sin(a + 1.6) * rr * 0.7;
      ell(put, hx, hy + layer * 2, S * 0.024 - a * 0.004 * S, S * 0.024 - a * 0.004 * S, (tx, ty) => mix(layer ? K.brassDk : K.brassLt, K.brassDk, ty + a * 0.12));
    }
  });
  optic(put, cx - S * 0.23, cy + S * 0.0, S * 0.03, K.redDk, K.red, K.redLt);
  // static crackle at the hooves
  zig(put, cx - S * 0.12, cy + S * 0.26, cx - S * 0.02, cy + S * 0.3, 1, K.volt, K.voltLt);
}

// 18 · MIST STALKER — sleek predator that hides inside cloud banks;
//      only its eyes glint through (concealment tech).
function drawMistStalker(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  // the cloud bank it hides in
  cloudBlob(put, cx, cy + S * 0.04, S * 0.3, K.cloudMd, K.cloud, K.cloudDkk);
  cloudBlob(put, cx - S * 0.18, cy + S * 0.12, S * 0.14, K.cloud, K.cloudLt, K.cloudDk);
  // half-emerged silhouette: sleek panther head + shoulder
  dome(put, cx + S * 0.08, cy - S * 0.08, S * 0.13, S * 0.1, K.thunderDk, K.thunder, K.thunderDkk);
  ell(put, cx + S * 0.2, cy - S * 0.02, S * 0.1, S * 0.08, (tx, ty) => mix(K.thunder, K.thunderDkk, ty));
  // pointed ears
  [-1, 1].forEach(s => stroke(put, cx + S * 0.06 + s * S * 0.05, cy - S * 0.15, cx + S * 0.06 + s * S * 0.08, cy - S * 0.22, S * 0.03, () => K.thunderDk));
  // burning glint eyes
  [-1, 1].forEach(s => optic(put, cx + S * 0.07 + s * S * 0.045, cy - S * 0.08, S * 0.028, K.skyDkk, K.skyLt, '#ffffff'));
  // claws slipping out the front of the bank
  [[-0.02, 0.22], [0.06, 0.24]].forEach(([ox, oy]) => {
    [-1, 0, 1].forEach(k => stroke(put, cx + ox * S, cy + oy * S, cx + ox * S + k * S * 0.02, cy + oy * S + S * 0.05, 2, () => K.marbleLt));
  });
  // tail flicking out the back
  stroke(put, cx - S * 0.26, cy + S * 0.02, cx - S * 0.38, cy - S * 0.08, S * 0.03, (t) => mix(K.thunder, K.thunderDkk, t));
}

// 19 · ROC HATCHLING — oversized storm chick; clumsy but hits like a
//      cannonball when it belly-dives.
function drawRocHatchling(put, S) {
  const cx = S * 0.5, cy = S * 0.52;
  shadow(put, S, cx, S * 0.22);
  // round fluffy body
  dome(put, cx, cy + S * 0.02, S * 0.21, S * 0.2, K.feather, K.featherLt, K.featherDkk);
  // fluff texture
  for (let i = 0; i < 14; i++) {
    const a = i * 0.45, rr = S * 0.19;
    put(Math.round(cx + Math.cos(a) * rr * 0.8), Math.round(cy + S * 0.02 + Math.sin(a) * rr * 0.7), K.featherLt);
  }
  // stubby wings flapping uselessly
  [-1, 1].forEach(s => ell(put, cx + s * S * 0.23, cy - S * 0.02, S * 0.07, S * 0.1, (tx, ty) => mix(K.featherLt, K.featherDk, ty)));
  // big head with egg-shell helmet still on
  dome(put, cx, cy - S * 0.16, S * 0.13, S * 0.11, K.feather, K.featherLt, K.featherDk);
  ell(put, cx, cy - S * 0.24, S * 0.11, S * 0.06, (tx, ty) => mix(K.marbleLt, K.marbleDk, ty));
  for (let i = -2; i <= 2; i++) stroke(put, cx + i * S * 0.045, cy - S * 0.2, cx + i * S * 0.045 + S * 0.015, cy - S * 0.17, 1, () => K.marbleDkk);
  // huge innocent volt eyes + tiny beak
  [-1, 1].forEach(s => optic(put, cx + s * S * 0.055, cy - S * 0.15, S * 0.04, K.voltDk, K.volt, K.voltLt));
  stroke(put, cx - S * 0.015, cy - S * 0.09, cx + S * 0.015, cy - S * 0.09, 2, () => K.brass);
  put(Math.round(cx), Math.round(cy - S * 0.08), K.brassDk);
  // big talon feet
  [-1, 1].forEach(s => [-1, 0, 1].forEach(k =>
    stroke(put, cx + s * S * 0.08, cy + S * 0.2, cx + s * S * 0.08 + k * S * 0.03, cy + S * 0.26, 2, () => K.gold)));
  // impact stars around it (it just landed)
  [[-0.3, 0.18], [0.32, 0.14]].forEach(([ox, oy]) => {
    put(Math.round(cx + ox * S), Math.round(cy + oy * S), K.goldLt);
    put(Math.round(cx + ox * S) + 2, Math.round(cy + oy * S), K.goldLt);
    put(Math.round(cx + ox * S) - 2, Math.round(cy + oy * S), K.goldLt);
    put(Math.round(cx + ox * S), Math.round(cy + oy * S) + 2, K.goldLt);
    put(Math.round(cx + ox * S), Math.round(cy + oy * S) - 2, K.goldLt);
  });
}

// 20 · TEMPEST LANCER — elite armored sky-knight on wing; heavy burst
//      dive with a lightning lance (mini-boss flavor).
function drawTempestLancer(put, S) {
  const cx = S * 0.48, cy = S * 0.5;
  shadow(put, S, cx, S * 0.18);
  // storm cape streaming
  for (let i = 0; i < 5; i++)
    stroke(put, cx - S * 0.04, cy - S * 0.08 + i * 2, cx - S * 0.28 - i * S * 0.01, cy + S * 0.06 + i * S * 0.035, S * 0.035, (t) => mix(K.indigo, K.indigoDk, t));
  // armored torso
  plate(put, cx - S * 0.1, cy - S * 0.08, cx + S * 0.1, cy + S * 0.12, K.stoneLt, K.marbleLt, K.stoneDk);
  row(put, Math.round(cy + S * 0.02), cx - S * 0.1, cx + S * 0.1, () => K.brass);
  bolt(put, cx, cy - S * 0.02, S * 0.025, K.volt, K.voltDk);
  // pauldrons
  [-1, 1].forEach(s => dome(put, cx + s * S * 0.13, cy - S * 0.08, S * 0.06, S * 0.05, K.brass, K.brassLt, K.brassDk));
  // single great wing pair
  wing(put, cx - S * 0.06, cy - S * 0.14, S * 0.26, S * 0.16, -1, K.cloudLt, '#ffffff', K.cloudDkk);
  // greathelm with plume
  dome(put, cx, cy - S * 0.18, S * 0.08, S * 0.08, K.stoneLt, K.marbleLt, K.stoneDk);
  row(put, Math.round(cy - S * 0.18), cx - S * 0.06, cx + S * 0.06, () => K.oil);
  [-1, 1].forEach(s => put(Math.round(cx + s * S * 0.03), Math.round(cy - S * 0.18), K.voltLt));
  stroke(put, cx, cy - S * 0.26, cx + S * 0.08, cy - S * 0.34, S * 0.03, () => K.red);
  // the lightning lance, couched for the dive
  stroke(put, cx - S * 0.02, cy + S * 0.06, cx + S * 0.34, cy - S * 0.1, S * 0.028, () => K.iron);
  zig(put, cx + S * 0.26, cy - S * 0.07, cx + S * 0.4, cy - S * 0.14, 2, K.volt, K.voltLt);
  ell(put, cx + S * 0.04, cy + S * 0.03, S * 0.04, S * 0.04, (tx, ty) => mix(K.brassLt, K.brassDk, ty));
  // armored legs trailing
  [-1, 1].forEach(s => stroke(put, cx + s * S * 0.04, cy + S * 0.12, cx + s * S * 0.07, cy + S * 0.26, S * 0.035, () => K.stoneDk));
}

// ========================================================================
const LIST = [
  { n: 1, name: 'ZEPHYR WISP', role: 'swarm filler', draw: drawZephyrWisp },
  { n: 2, name: 'STORM SPRITE', role: 'fast chaser', draw: drawStormSprite },
  { n: 3, name: 'HARPY', role: 'dive-pounce', draw: drawHarpy },
  { n: 4, name: 'CLOUD RAY', role: 'drifting flyer', draw: drawCloudRay },
  { n: 5, name: 'THUNDERHEAD', role: 'radial discharge', draw: drawThunderhead },
  { n: 6, name: 'GALE DJINN', role: 'aimed gust shots', draw: drawGaleDjinn },
  { n: 7, name: 'SKY JELLY', role: 'shock + slow', draw: drawSkyJelly },
  { n: 8, name: 'GRIFFIN CUB', role: 'melee bruiser', draw: drawGriffinCub },
  { n: 9, name: 'NIMBUS GOLEM', role: 'tank', draw: drawNimbusGolem },
  { n: 10, name: 'VOLT VARIA', role: 'blink zapper', draw: drawVoltVaria },
  { n: 11, name: 'WIND WARDEN', role: 'shield guard', draw: drawWindWarden },
  { n: 12, name: 'STORM HERALD', role: 'strike caster', draw: drawStormHerald },
  { n: 13, name: 'KITE FIEND', role: 'strafe dasher', draw: drawKiteFiend },
  { n: 14, name: 'GUST SIREN', role: 'pulls you in', draw: drawGustSiren },
  { n: 15, name: 'STORMVANE', role: 'rooted turret', draw: drawStormvane },
  { n: 16, name: 'RAIN SHEPHERD', role: 'healer', draw: drawRainShepherd },
  { n: 17, name: 'STORM IBEX', role: 'lane charger', draw: drawStormIbex },
  { n: 18, name: 'MIST STALKER', role: 'cloud ambusher', draw: drawMistStalker },
  { n: 19, name: 'ROC HATCHLING', role: 'belly-dive burst', draw: drawRocHatchling },
  { n: 20, name: 'TEMPEST LANCER', role: 'elite lancer', draw: drawTempestLancer },
];

renderSheet({
  list: LIST,
  out: process.argv[2] || 'sky_mob_options.png',
  title: 'STORM SKY ISLES — MOB CANDIDATES (pick 8, tell me numbers to change)',
  S: 160, cols: 5
}).catch(e => { console.error(e); process.exit(1); });
