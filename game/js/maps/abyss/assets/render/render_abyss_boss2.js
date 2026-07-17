// artdev/abyss/render_abyss_boss2.js — THE LEVIATHAN work-ups v2:
// 10 looks spun on the APPROVED take-3 water-dragon skeleton
// (lev160 in render_abyss_leviathan_shape.js). Combos = param tweaks.
'use strict';
const SHAPE = require('./render_abyss_leviathan_shape.js');
const KIT = require('./abyss_kit.js');
const { A, renderSheet } = KIT;

const V = {
  jade: {}, // the approved default: jade + coral mane + gold eye
  sapphire: {
    base: '#28407a', lt: '#5a82c8', dk: '#101c40', belly: '#a8c8e8',
    finC: '#41d6f6', finDk: '#1f78a8', crest: ['#41d6f6', '#1f78a8'],
    eyeC: A.bio, eyeGlow: true, jawGlow: A.bio, antler: '#c8d8e8',
  },
  abyssal: {
    base: '#3a3040', lt: '#6a5a74', dk: '#141018', belly: '#8a7a94',
    finC: '#8a5adc', finDk: '#4a2a8a', crest: ['#8a5adc', '#4a2a8a'],
    eyeC: '#c8aaff', eyeGlow: true, jawGlow: '#8a5adc', antler: '#9a8ab0',
  },
  crimson: {
    base: '#8a2030', lt: '#c85a5a', dk: '#40101a', belly: '#e8b898',
    finC: '#f0cc80', finDk: '#8a5a1e', crest: ['#f0cc80', '#8a5a1e'],
    eyeC: '#f0cc80', eyeGlow: true, antler: '#e8d8b0',
  },
  ghost: {
    base: '#4a7a8a', lt: '#a8d8e0', dk: '#1e3a44', belly: '#d8f4f8',
    finC: '#c2fbff', finDk: '#41a0b8', crest: ['#c2fbff', '#41a0b8'],
    eyeC: '#c2fbff', eyeGlow: true, jawGlow: '#c2fbff', antler: '#d8ecf0',
  },
  volt: {
    base: '#3a4a2a', lt: '#7a9a4a', dk: '#1a240e', belly: '#c8d888',
    finC: '#d8e84a', finDk: '#6a7218', crest: ['#d8e84a', '#6a7218'],
    eyeC: '#f8ffb0', eyeGlow: true, jawGlow: '#d8e84a', antler: '#c8c890',
  },
  obsidian: {
    base: '#20242e', lt: '#4a5060', dk: '#0a0c12', belly: '#6a7288',
    finC: '#ff7d3a', finDk: '#c23a1a', crest: ['#ff7d3a', '#c23a1a'],
    eyeC: '#ff7d3a', eyeGlow: true, jawGlow: '#ff7d3a', antler: '#5a5064',
  },
  pearl: {
    base: '#b0a890', lt: '#e8e0c8', dk: '#6e6852', belly: '#fff8ec',
    finC: '#e8aab8', finDk: '#a06880', crest: ['#e8aab8', '#a06880'],
    eyeC: '#41d6f6', antler: '#f4ecd8',
  },
  bronzeKing: {
    base: '#8a5a2a', lt: '#c8963c', dk: '#4a2e12', belly: '#f0cc80',
    finC: '#2e7a66', finDk: '#123a30', crest: ['#f0cc80', '#8a5a1e'],
    eyeC: '#f0cc80', eyeGlow: true, antler: '#f0cc80',
  },
  midnight: {
    base: '#141c36', lt: '#2e4066', dk: '#060a16', belly: '#3a4e7a',
    finC: '#2a3a5a', finDk: '#101a30', crest: ['#d84a4a', '#7a1a22'],
    eyeC: '#ff4b3e', eyeGlow: true, jawGlow: '#ff4b3e', antler: '#3a4658',
  },
};

const LIST = [
  { n: 1, name: 'JADE RYUJIN', role: 'the approved default', draw: (p, S) => SHAPE.lev160(p, S, V.jade) },
  { n: 2, name: 'SAPPHIRE TIDE', role: 'blue + cyan glow', draw: (p, S) => SHAPE.lev160(p, S, V.sapphire) },
  { n: 3, name: 'ABYSSAL VIOLET', role: 'trench purple', draw: (p, S) => SHAPE.lev160(p, S, V.abyssal) },
  { n: 4, name: 'CRIMSON EMPRESS', role: 'red + gold trim', draw: (p, S) => SHAPE.lev160(p, S, V.crimson) },
  { n: 5, name: 'GHOST TIDE', role: 'pale spectral, lit', draw: (p, S) => SHAPE.lev160(p, S, V.ghost) },
  { n: 6, name: 'VOLT WYRM', role: 'charged yellow-green', draw: (p, S) => SHAPE.lev160(p, S, V.volt) },
  { n: 7, name: 'OBSIDIAN FLOW', role: 'black + magma fins', draw: (p, S) => SHAPE.lev160(p, S, V.obsidian) },
  { n: 8, name: 'PEARL DRAKE', role: 'ivory + rose fins', draw: (p, S) => SHAPE.lev160(p, S, V.pearl) },
  { n: 9, name: 'BRONZE KING', role: 'gilded, jade fins', draw: (p, S) => SHAPE.lev160(p, S, V.bronzeKing) },
  { n: 10, name: 'MIDNIGHT MAW', role: 'near-black, red glare', draw: (p, S) => SHAPE.lev160(p, S, V.midnight) },
];

if (require.main === module) {
  renderSheet({ list: LIST, out: process.argv[2] || 'abyss_boss_options.png', title: 'THE LEVIATHAN — 10 LOOKS on the approved skeleton (combo + recolor welcome)', S: 160, cols: 5 });
}
module.exports = { V, LIST };
