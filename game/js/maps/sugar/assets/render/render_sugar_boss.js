// artdev/sugar/render_sugar_boss.js — SUGAR BEAR: 10 candy-bear
// work-ups on Red's concept skeleton (bear160). Several are PURE CANDY
// bodies — no fur/toffee at all (Red's requirement).
'use strict';
const SHAPE = require('./render_sugar_bear_shape.js');
const KIT = require('./sugar_kit.js');
const { G, renderSheet } = KIT;

const V = {
  classic: {}, // the concept default: toffee + full candy armor + cane
  gummyKing: { // PURE GUMMY — no fur, translucent red, crowned
    body: 'gummy', fur: G.red, furLt: G.redLt, furDk: G.redDk,
    noStuds: true, belly: 'none', eyes: 'angry', crown: true, weapon: 'none',
  },
  fudge: { // dark chocolate, lollipop hammer
    fur: G.choc, furLt: G.chocLt, furDk: G.chocDk,
    studs: [G.white, G.pink, G.mint, G.white, G.pink, G.mint, G.white],
    beans: [G.pinkLt, G.mintLt, G.white, G.pinkLt, G.white],
    weapon: 'hammer', hammerC: G.choc, eyes: 'friendly', bellyC: G.caramel,
  },
  peppermint: { // PURE PEPPERMINT — striped body, no fur
    body: 'stripes', fur: G.red, furLt: G.redLt, furDk: G.redDk,
    noStuds: true, belly: 'jawbreaker', bellyC: G.mint, eyes: 'swirl', weapon: 'cane',
  },
  rockCandy: { // PURE ROCK CANDY — crystal facets
    body: 'rock', fur: G.grape, furLt: G.grapeLt, furDk: G.grapeDk,
    noStuds: true, belly: 'none', eyes: 'button', weapon: 'hammer', hammerC: G.grape,
  },
  licorice: { // PURE LICORICE — twisted black bands, whip
    body: 'licorice', fur: G.lico, furLt: G.licoLt, furDk: G.licoDk,
    noStuds: true, belly: 'none', eyes: 'angry', weapon: 'whip',
  },
  white: { // white chocolate + pastel armor
    fur: '#f0e8dc', furLt: '#fffdf6', furDk: '#c0b0a0',
    studs: [G.pink, G.mint, G.blueLt, G.pinkLt, G.mintLt, G.pink, G.blueLt],
    beans: [G.pinkLt, G.blueLt, G.mintLt, G.pink, G.mint],
    weapon: 'cane', eyes: 'button', bellyC: G.blue,
  },
  sour: { // sour-apple crusted
    fur: G.lime, furLt: G.limeLt, furDk: G.limeDk,
    studs: [G.yellow, G.lime, G.yellowLt, G.lime, G.yellow, G.limeLt, G.yellow],
    beans: [G.yellowLt, G.lime, G.yellow, G.limeLt, G.yellow],
    weapon: 'whip', eyes: 'swirl', bellyC: G.yellow,
  },
  cotton: { // cotton-candy fluff bear
    fur: G.pink, furLt: G.pinkLt, furDk: G.pinkDk,
    studs: [G.blueLt, G.white, G.pinkLt, G.blueLt, G.white, G.pinkLt, G.blueLt],
    beans: [G.white, G.blueLt, G.pinkLt, G.white, G.blueLt],
    weapon: 'none', eyes: 'friendly', bellyC: G.blue,
  },
  gingerbread: { // gingerbread cookie bear, icing seams
    fur: G.ginger, furLt: G.gingerLt, furDk: G.gingerDk,
    studs: [G.red, G.lime, G.blue, G.red, G.lime, G.blue, G.red],
    beans: [G.white, G.red, G.white, G.lime, G.white],
    weapon: 'cane', eyes: 'button',
  },
};

const LIST = [
  { n: 1, name: 'CLASSIC SUGAR BEAR', role: 'the concept — toffee + armor', draw: (p, S) => SHAPE.bear160(p, S, V.classic) },
  { n: 2, name: 'GUMMY KING', role: 'PURE gummy, no fur, crowned', draw: (p, S) => SHAPE.bear160(p, S, V.gummyKing) },
  { n: 3, name: 'FUDGE BEAR', role: 'dark choc + lolli hammer', draw: (p, S) => SHAPE.bear160(p, S, V.fudge) },
  { n: 4, name: 'PEPPERMINT BEAR', role: 'PURE stripes, hypno eyes', draw: (p, S) => SHAPE.bear160(p, S, V.peppermint) },
  { n: 5, name: 'ROCK CANDY BEAR', role: 'PURE crystal facets', draw: (p, S) => SHAPE.bear160(p, S, V.rockCandy) },
  { n: 6, name: 'LICORICE BEAR', role: 'PURE licorice + whip', draw: (p, S) => SHAPE.bear160(p, S, V.licorice) },
  { n: 7, name: 'WHITE CHOC BEAR', role: 'pastel armor, button eyes', draw: (p, S) => SHAPE.bear160(p, S, V.white) },
  { n: 8, name: 'SOUR APPLE BEAR', role: 'sour crust, swirl eyes', draw: (p, S) => SHAPE.bear160(p, S, V.sour) },
  { n: 9, name: 'COTTON CANDY BEAR', role: 'pink fluff, unarmed', draw: (p, S) => SHAPE.bear160(p, S, V.cotton) },
  { n: 10, name: 'GINGERBREAD BEAR', role: 'cookie + icing', draw: (p, S) => SHAPE.bear160(p, S, V.gingerbread) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'sugar_boss_options.png', title: 'SUGAR BEAR — 10 WORK-UPS (combo + recolor welcome)', S: 160, cols: 5 });
}
module.exports = { V, LIST };
