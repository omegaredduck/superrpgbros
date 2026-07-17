// artdev/neon/render_neon_tiles.js — NEON CITY ground tiles, TAKE 2
// (Red: redo — v1 puddles read as repeated blobs, graffiti as squiggles).
// Cleaner: smooth-noise puddle masses, soft reflection gradients,
// structured markings.
'use strict';
const KIT = require('./neon_kit.js');
const { N, mix, clamp, ell, row, stroke, renderSheet } = KIT;

function n2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
// smooth value noise (bilinear between lattice points)
function sn(x, y, sc) {
  const fx = x / sc, fy = y / sc;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  const tx = fx - ix, ty = fy - iy;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = n2(ix, iy), b = n2(ix + 1, iy), c = n2(ix, iy + 1), d = n2(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
function fill(put, S, fn) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) put(x, y, fn(x, y)); }
// ONE organic puddle mass per tile: smooth-noise threshold + soft neon reflection
function wet(x, y, S, b, seed, thresh) {
  const m = sn(x + seed * 97, y + seed * 41, 20) * 0.7 + sn(x + seed * 13, y + seed * 7, 9) * 0.3;
  const t = thresh == null ? 0.78 : thresh;
  if (m > t) {
    const depth = clamp((m - t) / (1 - t), 0, 1);
    let w = mix('#141a2a', '#080c16', depth);
    // one soft reflection streak per puddle region
    const rf = n2(seed, 5);
    const rc = rf > 0.66 ? N.pink : rf > 0.33 ? N.cyan : N.purple;
    const rx = S * (0.3 + rf * 0.4);
    const dxr = Math.abs(x - rx - Math.sin(y * 0.08) * 2);
    if (dxr < 5) w = mix(w, rc, (1 - dxr / 5) * 0.34 * depth);
    // rim highlight
    if (depth < 0.12) w = mix(w, '#3a4256', 0.5);
    return w;
  }
  return b;
}

// 1 · WET ROOFTOP — concrete panels, one big puddle
function drawRooftop(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#32323e', '#20202a', sn(x, y, 22) * 0.8);
    // panel seams (sparse)
    if (x % 54 < 1.4 || y % 54 < 1.4) b = mix(b, '#121218', 0.55);
    if (n2(x, y) > 0.992) b = mix(b, '#4a4a58', 0.6); // grit
    return wet(x, y, S, b, 1);
  });
}
// 2 · ASPHALT STREET — worn lines + oil sheen
function drawAsphalt(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#23232b', '#15151d', sn(x, y, 16) * 0.7);
    if (n2(x * 3, y * 3) > 0.9) b = mix(b, '#31313c', 0.5); // fine aggregate
    // worn double yellow line
    [-3, 3].forEach(off => { if (Math.abs(x - S * 0.5 - off) < 1.6 && n2(0, y >> 2) > 0.25) b = mix(b, N.amber, 0.5); });
    // oil stain w/ faint rainbow rim
    const od = Math.hypot(x - S * 0.68, y - S * 0.3);
    if (od < 16) b = mix(b, '#0c0c12', 0.5 * (1 - od / 16));
    else if (od < 19) b = mix(b, [N.pink, N.green, N.purple][(x + y) % 3], 0.16);
    return wet(x, y, S, b, 2, 0.84);
  });
}
// 3 · MIRROR PLAZA — polished slabs, soft neon columns
function drawMirror(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#191d2c', '#0d0f1a', y / S * 0.5 + sn(x, y, 40) * 0.3);
    // three SOFT wide reflection columns fading upward
    [[0.22, N.pink], [0.52, N.cyan], [0.8, N.purple]].forEach(([rx, rc]) => {
      const d = Math.abs(x - S * rx) / (S * 0.075);
      if (d < 1) b = mix(b, rc, (1 - d) * (1 - d) * 0.34 * (y / S));
    });
    // slab joints
    if (x % 40 < 1.2 || y % 40 < 1.2) b = mix(b, '#232a40', 0.6);
    return b;
  });
}
// 4 · CATWALK GRATE — heavy bars over the drop
function drawGrate(put, S) {
  fill(put, S, (x, y) => {
    const gx = x % 16, gy = y % 16;
    if (gx < 3.6 || gy < 3.6) {
      let b = mix('#525866', '#2a2e38', ((gx < 3.6 ? gx / 3.6 : 1) + (gy < 3.6 ? gy / 3.6 : 1)) * 0.35);
      if (gx < 1 || gy < 1) b = mix(b, '#6a7280', 0.5); // top edge light
      return b;
    }
    // depth below: dim city glow
    let b = '#04060c';
    if (n2(Math.floor(x / 16), Math.floor(y / 16)) > 0.84) b = mix(b, N.amber, 0.25);
    return b;
  });
}
// 5 · AD FLOOR — clean holo arrows on dark glass
function drawAdFloor(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#10141f', '#090b12', sn(x, y, 30) * 0.5);
    if ((y | 0) % 4 === 0) b = mix(b, '#182038', 0.4); // scanlines
    // ONE bold chevron pair pointing up
    const ax = Math.abs(x - S * 0.5);
    [[0.52, N.cyan], [0.72, N.pink]].forEach(([ay, c]) => {
      const yy = y - S * ay + ax * 0.55;
      if (yy > 0 && yy < 9) b = mix(b, c, 0.55 - yy / 9 * 0.3);
    });
    // frame
    const bd = Math.min(x, S - x, y, S - y);
    if (bd < 2.4) b = mix(b, '#2e5a7a', 0.7);
    return b;
  });
}
// 6 · SKYBRIDGE GLASS — ordered towers far below
function drawGlass(put, S) {
  fill(put, S, (x, y) => {
    let b = '#06080f';
    // three tower faces below (structured window grids)
    [[10, 30, 60, 0], [75, 15, 70, 1], [110, 45, 45, 2]].forEach(([bx, by, bw, id]) => {
      if (x >= bx && x < bx + bw && y >= by) {
        b = '#0b0d16';
        const wx = (x - bx) % 8, wy = (y - by) % 11;
        if (wx > 1.6 && wx < 6 && wy > 2 && wy < 8 && n2((x - bx) >> 3, ((y - by) / 11 | 0) + id * 9) > 0.45)
          b = mix('#0b0d16', [N.amber, '#d8e2f0', N.cyanLt][id], 0.4);
      }
    });
    // glass frame X-brace + sheen
    if (x % Math.round(S * 0.5) < 2 || y % Math.round(S * 0.5) < 2) b = mix(b, '#4a5468', 0.75);
    const sh = (x + y * 0.5) % 90;
    if (sh < 5) b = mix(b, '#3c4c6e', 0.3);
    return b;
  });
}
// 7 · CRACKED PLAZA — slab web, grime, no stamps
function drawPlaza(put, S) {
  fill(put, S, (x, y) => {
    const cs = 42;
    const cxi = Math.floor(x / cs), cyi = Math.floor(y / cs);
    let d1 = 9e9, d2 = 9e9, id = 0;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const px = (cxi + i + n2(cxi + i, cyi + j)) * cs, py = (cyi + j + n2(cxi + i + 7, cyi + j + 3)) * cs;
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < d1) { d2 = d1; d1 = d; id = (cxi + i) * 5 + (cyi + j); } else if (d < d2) d2 = d;
    }
    let b = mix('#3a3a46', '#26262e', n2(id, id) * 0.4 + sn(x, y, 18) * 0.3);
    if (Math.sqrt(d2) - Math.sqrt(d1) < 1.8) b = mix(b, '#10101a', 0.65); // crack web
    if (sn(x + 99, y + 99, 26) > 0.72) b = mix(b, '#20261e', 0.4); // grime wash
    return wet(x, y, S, b, 7, 0.84);
  });
}
// 8 · CABLE RUN — fat conduit bundles
function drawCables(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#25252d', '#15151d', sn(x, y, 20) * 0.6);
    // two thick cable bundles w/ cylindrical shading
    [[0.34, 7, '#3c3c48', false], [0.68, 9, '#111119', true]].forEach(([ry, rad, c, pulse]) => {
      const cy2 = S * ry + Math.sin(x * 0.03) * 3;
      const d = Math.abs(y - cy2);
      if (d < rad) {
        const sh = 1 - (d / rad) * (d / rad);
        b = mix(c, '#000000', 0.55 - sh * 0.45);
        if (d < 1 && y < cy2) b = mix(b, '#6a6a78', 0.4); // top highlight
        if (pulse && (x % 30) < 5 && d < 2) b = mix(b, N.green, 0.55); // data pulse
      }
    });
    // strap-downs
    if (x % 52 < 4) { [0.34, 0.68].forEach(ry => { const cy2 = S * ry + Math.sin(x * 0.03) * 3; if (Math.abs(y - cy2) < 11) b = mix(b, '#585864', 0.6); }); }
    return b;
  });
}
// 9 · HELIPAD — clean H, worn ring
function drawHelipad(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#2c303a', '#1b1d24', sn(x, y, 24) * 0.6);
    const cx = S / 2, cy = S / 2, d = Math.hypot(x - cx, y - cy);
    // single worn ring
    if (Math.abs(d - S * 0.4) < 2.6 && n2(x >> 2, y >> 2) > 0.2) b = mix(b, '#d8b048', 0.6);
    // the H — bold, slightly worn
    const inH = ((Math.abs(x - cx + S * 0.1) < 3.4 || Math.abs(x - cx - S * 0.1) < 3.4) && Math.abs(y - cy) < S * 0.16) || (Math.abs(y - cy) < 3.4 && Math.abs(x - cx) < S * 0.1);
    if (inH && n2(x >> 1, y >> 1) > 0.15) b = mix(b, '#e2e6ee', 0.72);
    // skid streaks
    if (Math.abs(y - cy - S * 0.05) < 2 && x > S * 0.3 && x < S * 0.85) b = mix(b, '#14141a', 0.4);
    return wet(x, y, S, b, 9, 0.88);
  });
}
// 10 · TAGGED SLAB — bubble-letter tag, reads as graffiti
function drawTagged(put, S) {
  fill(put, S, (x, y) => {
    let b = mix('#31313d', '#1f1f29', sn(x, y, 20) * 0.6);
    // bubble tag: three fat overlapping letterform blobs w/ outline + shine
    const blobs = [[0.3, 0.48, 20, 18], [0.44, 0.52, 18, 22], [0.58, 0.46, 19, 19], [0.71, 0.51, 18, 21]];
    let inside = 0, edge = false;
    blobs.forEach(([bx, by, rx, ry]) => {
      const dd = ((x - S * bx) / rx) ** 2 + ((y - S * by + Math.sin(x * 0.11) * 3) / ry) ** 2;
      if (dd < 1) inside++;
      if (dd >= 0.86 && dd < 1) edge = true;
    });
    if (inside > 0) {
      b = mix(N.pink, N.pinkDk, clamp((y - S * 0.3) / (S * 0.4), 0, 1) * 0.6);
      // letter hole
      const hole = ((x - S * 0.5) / 5) ** 2 + ((y - S * 0.46) / 8) ** 2;
      if (hole < 1) b = '#1f1f29';
      if (edge && inside === 1) b = '#0c0c14'; // black outline
      if (inside >= 2) b = mix(b, N.pinkLt, 0.25); // overlap glow
      // shine dashes
      if (Math.abs(y - S * 0.38 - (x - S * 0.3) * 0.2) < 2 && x > S * 0.24 && x < S * 0.6) b = mix(b, '#ffffff', 0.5);
    }
    // underline swoosh + drips
    const uy = S * 0.68 + Math.sin(x * 0.05) * 2;
    if (Math.abs(y - uy) < 2.2 && x > S * 0.18 && x < S * 0.84) b = mix(b, N.cyan, 0.55);
    [[0.3], [0.55], [0.75]].forEach(([dx]) => { if (Math.abs(x - S * dx) < 1.2 && y > uy && y < uy + 14 + n2(dx, 0) * 10) b = mix(b, N.cyanDk, 0.5); });
    return b;
  });
}

const LIST = [
  { n: 1, name: 'WET ROOFTOP', role: 'concrete + one real puddle', draw: drawRooftop, noOutline: true },
  { n: 2, name: 'ASPHALT STREET', role: 'worn lines + oil stain', draw: drawAsphalt, noOutline: true },
  { n: 3, name: 'MIRROR PLAZA', role: 'soft neon reflections', draw: drawMirror, noOutline: true },
  { n: 4, name: 'CATWALK GRATE', role: 'heavy grid over the drop', draw: drawGrate, noOutline: true },
  { n: 5, name: 'AD FLOOR', role: 'holo chevrons on glass', draw: drawAdFloor, noOutline: true },
  { n: 6, name: 'SKYBRIDGE GLASS', role: 'towers far below', draw: drawGlass, noOutline: true },
  { n: 7, name: 'CRACKED PLAZA', role: 'slab web + grime', draw: drawPlaza, noOutline: true },
  { n: 8, name: 'CABLE RUN', role: 'fat conduits + data pulse', draw: drawCables, noOutline: true },
  { n: 9, name: 'HELIPAD', role: 'bold worn H', draw: drawHelipad, noOutline: true },
  { n: 10, name: 'TAGGED SLAB', role: 'bubble-letter graffiti', draw: drawTagged, noOutline: true },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'neon_tile_options.png', title: 'NEON CITY — GROUND TILES TAKE 2 (pick any set)', S: 160 });
}
module.exports = { LIST };
