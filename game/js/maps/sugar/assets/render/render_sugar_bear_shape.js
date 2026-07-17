// artdev/sugar/render_sugar_bear_shape.js — THE CANDY BEAR boss on a
// full 160x160 canvas, built from Red's concept art: plump teddy bear
// COVERED in candy armor — gumdrop/jellybean studs, gummy bears stuck
// on, licorice swirl buttons, lollipop-swirl belly, cherry nose, one
// peppermint-striped ear, candy cane in paw, striped foot pad.
// bear160(put,S,o) is the reusable draw.
'use strict';
const KIT = require('./sugar_kit.js');
const { G, mix, clamp, ell, row, stroke, dome, optic, shadow, renderSheet, stripes, sprinkles, gloss } = KIT;

function bear160(put, S, o) {
  o = o || {};
  const fur = o.fur || '#c88a4a';      // candy-coated toffee
  const furLt = o.furLt || '#e8b070';
  const furDk = o.furDk || '#8a5424';
  const studs = o.studs || [G.lime, G.orange, G.grape, G.yellow, G.blue, G.red, G.grape];
  const beans = o.beans || [G.red, G.blue, G.orange, G.lime, G.yellow];
  const u = S / 160;
  const X = v => v * u;
  const plainCoat = (tx, ty) => {
    let b = mix(furLt, fur, clamp(ty * 1.4, 0, 1));
    b = mix(b, furDk, clamp((ty - 0.45) * 1.4, 0, 1));
    if (tx > 0.86) b = mix(b, furDk, 0.3);
    return b;
  };
  // body material overrides — PURE CANDY bodies (no fur/toffee)
  let coat = plainCoat;
  if (o.body === 'gummy') coat = (tx, ty) => { // translucent gummy
    let b = mix(mix(fur, '#ffffff', 0.45), fur, clamp(tx * 0.6 + ty * 0.9, 0, 1));
    if (tx < 0.3 && ty < 0.35) b = mix(b, '#ffffff', 0.35); // inner glow
    if (ty > 0.8) b = mix(b, furDk, 0.4);
    return b;
  };
  if (o.body === 'stripes') coat = (tx, ty) => { // peppermint body
    const c = (((tx + ty) * 7) | 0) % 2 ? fur : G.white;
    return mix(c, furDk, clamp((ty - 0.5) * 0.8, 0, 0.4));
  };
  if (o.body === 'rock') coat = (tx, ty) => { // rock-candy facets
    const f = Math.abs((((tx * 5) | 0) + ((ty * 6) | 0))) % 3;
    const base2 = [mix(fur, '#ffffff', 0.4), fur, furDk][f] || fur;
    return mix(base2, furDk, clamp((ty || 0) - 0.6, 0, 0.35));
  };
  if (o.body === 'licorice') coat = (tx, ty) => { // twisted licorice bands
    const band = (((tx * 2 + ty * 6)) | 0) % 2;
    return mix(band ? fur : furLt, furDk, clamp(tx * 0.4 + ty * 0.5, 0, 0.6));
  };

  // ---- ground shadow
  ell(put, X(80), X(148), X(46), X(6), () => G.oil);

  // ---- LEGS mid-stride
  // back leg (his right, stepping forward-left)
  stroke(put, X(64), X(112), X(52), X(134), X(12), coat);
  ell(put, X(50), X(140), X(12), X(8), coat);                       // foot
  // foot pad: striped candy OR plain pink beans
  if (o.noFootStripe) {
    ell(put, X(48), X(141), X(6), X(4), () => G.pink);
    [[43, 138], [48, 136.5], [53, 138]].forEach(([bx, by]) => put(Math.round(X(bx)), Math.round(X(by)), G.pinkLt));
  } else ell(put, X(48), X(141), X(8), X(5), stripes(G.red, G.white, 5));
  // front leg (his left, planted)
  stroke(put, X(96), X(112), X(104), X(136), X(12.5), coat);
  ell(put, X(106), X(142), X(12.5), X(8), coat);
  // pink toe beans
  ell(put, X(104), X(142), X(6), X(4), () => G.pink);
  [[98, 139], [104, 137.5], [110, 139]].forEach(([bx, by]) => put(Math.round(X(bx)), Math.round(X(by)), G.pinkLt));

  // ---- BODY — plump pear
  for (let yy = 62; yy < 120; yy++) {
    const t = (yy - 62) / 58;
    const w = 22 + Math.sin(t * Math.PI * 0.62) * 14;
    row(put, Math.round(X(yy)), X(80 - w), X(80 + w), coat);
  }
  // belly patch (lighter) — skipped for pure-candy bodies
  if (!o.body) ell(put, X(80), X(96), X(17), X(20), (tx, ty) => mix('#f0cc90', '#d8a860', clamp(tx * 0.8 + ty * 0.5, 0, 1)));
  // ---- BELLY CORE
  if (o.belly !== 'none') {
    ell(put, X(80), X(94), X(10.5), X(10.5), (tx, ty) => mix(G.pinkLt, G.pink, ty));
    if (o.belly === 'jawbreaker') {
      [[9.5, o.bellyC || G.grape], [7, G.white], [4.5, G.red], [2.2, G.yellow]].forEach(([r, c]) => ell(put, X(80), X(94), X(r), X(r), (tx, ty) => mix(mix(c, '#ffffff', 0.35), c, clamp(tx * 0.7 + ty * 0.7, 0, 1))));
    } else { // lollipop swirl default
      for (let a = 0; a < 13; a += 0.05) {
        const r = 1 + a * 0.72;
        put(Math.round(X(80 + Math.cos(a) * r)), Math.round(X(94 + Math.sin(a) * r)), (a * 2 | 0) % 2 ? (o.bellyC || G.red) : G.white);
      }
    }
  }

  // ---- ARMS
  // his right arm (our left) — swings back
  stroke(put, X(56), X(76), X(40), X(96), X(10), coat);
  ell(put, X(38), X(100), X(8.5), X(7), coat);
  // his left arm (our right) — raised, HOLDING THE WEAPON
  stroke(put, X(104), X(76), X(120), X(88), X(10), coat);
  ell(put, X(123), X(90), X(8.5), X(7.5), coat);
  const weapon = o.weapon || 'cane';
  if (weapon === 'cane') {
    stroke(put, X(126), X(96), X(126), X(52), X(4.5), stripes(G.red, G.white, 10));
    for (let a = Math.PI; a >= 0; a -= 0.09) {
      const px2 = 126 - 9 + Math.cos(-a) * 9, py2 = 52 + Math.sin(-a) * 9;
      stroke(put, X(px2), X(py2), X(px2), X(py2 + 1), X(4), () => ((a * 4 | 0) % 2 ? G.red : G.white));
    }
    gloss(put, X(126), X(70), X(6));
  } else if (weapon === 'hammer') { // giant lollipop hammer
    stroke(put, X(126), X(96), X(126), X(48), X(3.6), () => G.white);
    stroke(put, X(127.5), X(96), X(127.5), X(48), X(1.2), () => G.creamDk);
    ell(put, X(126), X(38), X(15), X(15), (tx, ty) => mix(G.pinkLt, G.pink, ty));
    for (let a = 0; a < 15; a += 0.05) {
      const r = 1 + a * 0.9;
      put(Math.round(X(126 + Math.cos(a) * r)), Math.round(X(38 + Math.sin(a) * r)), (a * 2 | 0) % 2 ? (o.hammerC || G.red) : G.white);
    }
    gloss(put, X(120), X(30), X(9));
  } else if (weapon === 'whip') { // licorice whip trailing
    let px2 = 128, py2 = 92;
    for (let t = 0; t < 1; t += 0.045) {
      const nx = 128 + t * 26, ny = 92 - Math.sin(t * 5.2) * 22 * (1 - t * 0.3) - t * 18;
      stroke(put, X(px2), X(py2), X(nx), X(ny), X(2.6 - t * 1.2), () => ((t * 12 | 0) % 2 ? G.lico : G.licoLt));
      px2 = nx; py2 = ny;
    }
    put(Math.round(X(px2)), Math.round(X(py2)), G.red);
  }

  // ---- HEAD — big, round, cheerful (that's the creepy part)
  ell(put, X(80), X(42), X(24), X(22), coat);
  // muzzle
  ell(put, X(80), X(52), X(13), X(9.5), (tx, ty) => mix('#f0cc90', '#d8a860', clamp(tx * 0.9 + ty * 0.4, 0, 1)));
  // CHERRY NOSE + stem
  ell(put, X(80), X(48), X(4.5), X(4.2), (tx, ty) => mix(G.redLt, G.redDk, clamp(tx + ty * 0.4, 0, 1)));
  put(Math.round(X(78.5)), Math.round(X(46.5)), G.white);
  stroke(put, X(80), X(44), X(83), X(40), X(1.2), () => '#4a7a2a');
  // warm smile
  for (let x = -8; x <= 8; x += 0.5) put(Math.round(X(80 + x)), Math.round(X(56 + (1 - (x / 8) ** 2) * 3.2)), furDk);
  [[74, 57.5], [86, 57.5]].forEach(([sx, sy]) => put(Math.round(X(sx)), Math.round(X(sy)), furDk)); // smile corners
  // eyes
  const eyes = o.eyes || 'friendly';
  if (eyes === 'swirl') { // hypno-candy swirl eyes
    [[70], [90]].forEach(([ex]) => {
      ell(put, X(ex), X(38), X(4), X(4), () => G.white);
      for (let a = 0; a < 9; a += 0.14) put(Math.round(X(ex + Math.cos(a) * a * 0.4)), Math.round(X(38 + Math.sin(a) * a * 0.4)), (a * 3 | 0) % 2 ? G.red : G.white);
    });
  } else if (eyes === 'button') { // candy button eyes (doll-dead)
    [[70], [90]].forEach(([ex]) => {
      ell(put, X(ex), X(38), X(3.4), X(3.4), (tx, ty) => mix(G.blueLt, G.blueDk, ty));
      put(Math.round(X(ex - 1)), Math.round(X(37)), G.white);
    });
  } else if (eyes === 'redglow') { // glowing red eyes
    [[70], [90]].forEach(([ex]) => {
      // glow halo
      for (let a = 0; a < 6.28; a += 0.45) put(Math.round(X(ex + Math.cos(a) * 4.6)), Math.round(X(38 + Math.sin(a) * 4.6)), mix(G.red, fur, 0.55));
      ell(put, X(ex), X(38), X(3.2), X(3.2), (tx, ty) => mix(G.redLt, G.red, clamp(Math.hypot(tx - 0.5, ty - 0.5) * 2.4, 0, 1)));
      put(Math.round(X(ex)), Math.round(X(38)), '#ffffff');
      put(Math.round(X(ex - 1)), Math.round(X(37)), G.redLt);
    });
  } else {
    optic(put, X(70), X(38), X(2.8), G.oil, eyes === 'angry' ? G.red : G.oil, '#ffffff');
    optic(put, X(90), X(38), X(2.8), G.oil, eyes === 'angry' ? G.red : G.oil, '#ffffff');
  }
  // brows
  if (eyes === 'angry') {
    stroke(put, X(64), X(30), X(75), X(34), X(2), () => furDk);
    stroke(put, X(96), X(30), X(85), X(34), X(2), () => furDk);
  } else {
    stroke(put, X(65), X(32), X(74), X(31), X(1.6), () => furDk);
    stroke(put, X(86), X(31), X(95), X(32), X(1.6), () => furDk);
  }
  // gummy crown (king option)
  if (o.crown) {
    for (let i = -2; i <= 2; i++) {
      const kx = 80 + i * 8;
      stroke(put, X(kx), X(20), X(kx), X(12), X(2.6), () => G.yellow);
      put(Math.round(X(kx)), Math.round(X(11)), G.yellowLt);
    }
    row(put, Math.round(X(20)), X(62), X(98), () => G.yellow);
    row(put, Math.round(X(21)), X(62), X(98), () => G.yellowDk);
    [[-12, G.red], [0, G.lime], [12, G.blue]].forEach(([dx, c]) => put(Math.round(X(80 + dx)), Math.round(X(20)), c));
  }
  // ---- EARS
  const pepperEar = (ex) => {
    ell(put, X(ex), X(22), X(9.5), X(9.5), (tx, ty) => {
      const a = Math.atan2(ty - 0.5, tx - 0.5);
      return ((a * 3 / Math.PI + 6) | 0) % 2 ? G.red : G.white;
    });
    gloss(put, X(ex), X(19), X(7));
  };
  if (o.bothEarsPeppermint) { pepperEar(58); pepperEar(102); }
  else {
    ell(put, X(58), X(22), X(9), X(9), coat);
    ell(put, X(58), X(22), X(5.5), X(5.5), (tx, ty) => mix(G.mintLt, G.mint, ty));
    pepperEar(102);
  }

  // ---- CANDY ARMOR STUDS — the concept's whole point (BRIGHT, barely shaded)
  const candy = (sx, sy, rx, ry, c) => {
    ell(put, X(sx), X(sy), X(rx), X(ry), (tx, ty) => {
      let b = mix(mix(c, '#ffffff', 0.42), c, clamp(tx * 0.5 + ty * 0.9, 0, 1));
      if (ty > 0.8) b = mix(b, mix(c, '#000000', 0.25), 0.5);
      return b;
    });
    put(Math.round(X(sx - rx * 0.35)), Math.round(X(sy - ry * 0.4)), G.white);
  };
  // gumdrops
  if (!o.noStuds) [[62, 70], [98, 70], [58, 88], [102, 96], [70, 112], [92, 112], [80, 68]].forEach(([sx, sy], i) => candy(sx, sy, 4.6, 4.2, studs[i % studs.length]));
  // jelly beans (none below the waist — nothing floats between the legs)
  if (!o.noStuds) [[68, 80], [92, 82], [50, 122]].forEach(([sx, sy], i) => candy(sx, sy, 3.8, 2.4, beans[i % beans.length]));
  // chest centerpiece: RAINBOW GEM or licorice swirl
  if (!o.noStuds) {
    const sx = 80, sy = 76;
    if (o.rainbowGem) {
      const bands = [G.red, G.orange, G.yellow, G.lime, G.blue, G.grape];
      ell(put, X(sx), X(sy), X(5.2), X(5.2), (tx, ty) => {
        const d = Math.hypot(tx - 0.5, ty - 0.5) * 2;
        const band = bands[Math.min(5, (d * 6) | 0)];
        return mix(mix(band, '#ffffff', 0.3), band, clamp(tx * 0.5 + ty * 0.8, 0, 1));
      });
      // facet lines + big glint
      for (let a = 0; a < 6.28; a += 1.05) stroke(put, X(sx), X(sy), X(sx + Math.cos(a) * 5), X(sy + Math.sin(a) * 5), X(0.8), () => '#ffffff');
      put(Math.round(X(sx - 1.5)), Math.round(X(sy - 2)), G.white);
      put(Math.round(X(sx - 0.5)), Math.round(X(sy - 2.5)), G.white);
    } else {
      ell(put, X(sx), X(sy), X(4.4), X(4.4), (tx, ty) => mix('#5a5468', G.licoDk, ty));
      for (let a = 0; a < 9; a += 0.12) put(Math.round(X(sx + Math.cos(a) * a * 0.4)), Math.round(X(sy + Math.sin(a) * a * 0.4)), (a * 3 | 0) % 2 ? '#8a84a0' : G.lico);
      put(Math.round(X(sx - 1.5)), Math.round(X(sy - 1.8)), G.white);
    }
  }
  // MINI GUMMY BEARS stuck on (chest + shoulder) — bright translucent
  if (!o.noStuds) [[66, 96, G.lime], [94, 90, G.orange], [44, 92, G.red]].forEach(([sx, sy, c]) => {
    const gLt = mix(c, '#ffffff', 0.5);
    ell(put, X(sx), X(sy + 1.5), X(2.8), X(3.2), (tx, ty) => mix(gLt, c, clamp(ty + tx * 0.3, 0, 1))); // body
    ell(put, X(sx), X(sy - 2.2), X(2.2), X(2.1), (tx, ty) => mix(gLt, c, ty)); // head
    [[-1.8], [1.8]].forEach(([dx]) => put(Math.round(X(sx + dx)), Math.round(X(sy - 3.8)), gLt)); // ears
    put(Math.round(X(sx - 0.8)), Math.round(X(sy - 2.6)), G.white); // glint
  });
  if (!o.noStuds) {
    // candy flower on the shoulder
    const fx = 114, fy = 70;
    for (let a = 0; a < 6.28; a += 1.05) ell(put, X(fx + Math.cos(a) * 3.4), X(fy + Math.sin(a) * 3.4), X(2), X(2), (tx, ty) => mix(G.pinkLt, G.pink, ty));
    ell(put, X(fx), X(fy), X(1.8), X(1.8), () => G.yellow);
    // candy dots sprinkled in the gaps
    [[54, 76], [106, 84], [62, 104], [98, 104], [72, 90], [88, 98], [46, 100]].forEach(([sx, sy], i) => {
      put(Math.round(X(sx)), Math.round(X(sy)), [G.white, G.yellowLt, G.blueLt, G.pinkLt][i % 4]);
    });
    // head candies
    if (!o.crown) [[68, 26, G.red], [80, 23, G.lime], [92, 26, G.blue]].forEach(([sx, sy, c]) => {
      dome(put, X(sx), X(sy), X(3.2), X(2.8), c, mix(c, '#ffffff', 0.45), mix(c, '#000000', 0.35));
    });
  }
  // sugar sparkle
  [[60, 60], [104, 62], [40, 84], [122, 100]].forEach(([sx, sy]) => {
    put(Math.round(X(sx)), Math.round(X(sy)), '#ffffff');
    put(Math.round(X(sx + 1)), Math.round(X(sy)), G.creamDk);
  });
}

const LIST = [
  { n: 1, name: 'THE CANDY BEAR', role: 'full-canvas shape pass (Red concept)', draw: (p, S) => bear160(p, S, {}) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_bear_shape.png', title: 'SUGAR WORLD BOSS — shape pass from Red concept art', S: 160, cols: 1, scale: 3 });
}
module.exports = { bear160 };
