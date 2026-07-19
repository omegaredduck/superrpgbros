// ============================================================================
// game/js/maps/prehistoria/map.js — PREHISTORIA (realm 19) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). LOST WORLD, not theme
// park: real-anatomy dinos, an angry meteor sky, a boss that hatches out of an
// egg bigger than it is. Numbers TUNE ME. Toroidal wrap both axes.
// ============================================================================
(function () {
  'use strict';

  // ---- "PRIMAL.EXE" — DARK TRANCE (TAKE 2, RED-APPROVED "perfect"). Port of
  // render_prehistoria_theme.js as a section composer: 140 BPM D minor
  // (bass D-D-Bb-A), 105 bars x 4 = 420 beats = EXACTLY 180.0s. NO INTRO —
  // four-on-the-floor kick + rolling 16th acid bass from bar 0. A grind ->
  // B acid arp rises -> C dark riff enters -> D tension (pads + arp octave up,
  // the KICK NEVER STOPS) + snare-roll build -> E THE DROP at bar 64 (riff +
  // high echo) -> F octave-doubled finale -> low-D ring-out at 180.0.
  var PRIMAL = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [38, 38, 34, 33];                              // D D Bb A (i i VI V — dark)
    var CH = [[50, 53, 57], [50, 53, 57], [46, 50, 53], [45, 49, 52]]; // Dm Dm Bb A(C# bite)
    var LEAD = [                                               // the dark riff, 8 eighths / bar%4
      [62, -1, 62, 65, 62, 68, 67, 65], [62, 62, 65, 67, 69, 70, 69, 65],
      [62, -1, 62, 65, 62, 68, 67, 61], [62, 65, 67, 69, 74, 74, 73, 73]
    ];
    var ARP = [0, 12, 3, 12, 7, 12, 10, 12, 0, 12, 3, 15, 7, 12, 10, 13]; // acid, octave-jumping
    function sec(b) {
      if (b < 16) return { kick: true, hats: b >= 2, bass: true };                          // A grind
      if (b < 32) return { kick: true, hats: true, bass: true, arp: true, stab: true };      // B acid rises
      if (b < 48) return { kick: true, hats: true, bass: true, arp: b % 4 >= 2, riff: true };// C dark riff
      if (b < 60) return { kick: true, hats: true, bass: true, arp: true, pads: true, up: 12 };            // D tension
      if (b < 64) return { kick: true, hats: true, bass: true, arp: true, pads: true, up: 12, build: b - 60 }; // D build tail
      if (b < 88) return { kick: true, hats: true, bass: true, arp: true, riff: true, lead: true, big: true }; // E DROP
      if (b < 104) return { kick: true, hats: true, bass: true, arp: true, riff: true, lead: true, big: true, up: 12 }; // F finale
      return { last: true };                                                                  // ring-out
    }
    var DOORS = { 16: 1, 32: 1, 48: 1, 64: 1, 88: 1 };
    var KK = m2n(26), HO = 'A7', HC = 'C8', SN = 'A#7';
    var kick = [], hatO = [], hatC = [], bass = [], arp = [], leadA = [], leadB = [],
        pad1 = [], pad2 = [], build = [], sub = [], flavor = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), t = b % 4, root = ROOTS[t], chord = CH[t], last = !!s.last;
      // four-on-the-floor (never stops — even through the tension)
      if (s.kick) { for (var k = 0; k < 4; k++) kick.push([KK, 0.12], [null, 0.88]); }
      else if (b === 104) kick.push([KK, 0.12], [null, 3.88]);                     // the last kick
      else kick.push([null, 4]);
      // offbeat open hats + 16th closed ticks
      if (s.hats) { for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [HO, 0.1], [null, 0.4]); } else hatO.push([null, 4]);
      if (s.hats && b >= 16) { for (var h2 = 0; h2 < 4; h2++) hatC.push([null, 0.25], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17]); } else hatC.push([null, 4]);
      // ACID BASS: 16th offbeats, octave pops, duck the kick
      if (s.bass) { for (var e = 0; e < 16; e++) { if (e % 4 === 0) { bass.push([null, 0.25]); continue; } var bm = root - 12 + ((e % 8 === 6) ? 12 : 0); bass.push([m2n(bm), 0.2], [null, 0.05]); } } else bass.push([null, 4]);
      // acid arp: 16ths, chord/octave jumps (+24, up an octave in D)
      if (s.arp) { for (var e2 = 0; e2 < 16; e2++) arp.push([m2n(root + 24 + (s.up || 0) + ARP[e2]), 0.21], [null, 0.04]); } else arp.push([null, 4]);
      // dark riff — twin detuned voices (drop + finale)
      if (s.riff || s.lead) {
        for (var e3 = 0; e3 < 8; e3++) {
          var lm = LEAD[t][e3];
          if (lm < 0) { leadA.push([null, 0.5]); leadB.push([null, 0.5]); continue; }
          leadA.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
          leadB.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
        }
      } else { leadA.push([null, 4]); leadB.push([null, 4]); }
      // tension pads (gated 8ths) / dark chord stabs
      if (s.pads) {
        for (var e5 = 0; e5 < 8; e5++) {
          if (e5 % 4 === 3) { pad1.push([null, 0.5]); pad2.push([null, 0.5]); continue; }
          pad1.push([m2n(chord[0]), 0.35], [null, 0.15]);
          pad2.push([m2n(chord[2]), 0.35], [null, 0.15]);
        }
      } else if (s.stab) {
        pad1.push([null, 1.5], [m2n(chord[1]), 0.2], [null, 1.8], [m2n(chord[1]), 0.2], [null, 0.3]);
        pad2.push([null, 1.5], [m2n(chord[2]), 0.2], [null, 1.8], [m2n(chord[2]), 0.2], [null, 0.3]);
      } else { pad1.push([null, 4]); pad2.push([null, 4]); }
      // snare-roll BUILD (D tail — accelerating density, the kick runs through)
      if (s.build != null && !last) { var den = [4, 6, 8, 16][s.build]; for (var r3 = 0; r3 < den; r3++) build.push([SN, 0.08], [null, 4 / den - 0.08]); } else build.push([null, 4]);
      // drop sub layer
      if (last) sub.push([m2n(root - 12), 3.8], [null, 0.2]);                      // low-D ring-out
      else sub.push(s.big ? [m2n(root - 12), 3.8] : [null, 3.8], [null, 0.2]);
      // section doors + dark stab accents + the final ring
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (last) flavor.push([null, 2.6], [m2n(74), 0.15], [null, 0.4], [m2n(74), 0.15], [null, 0.7]);
      else if (s.stab || s.riff) flavor.push([null, 1.5], [m2n(chord[1] + 12), 0.2], [null, 2.3]);
      else flavor.push([null, 4]);
    }
    var TR = [kick, hatO, hatC, bass, arp, leadA, leadB, pad1, pad2, build, sub, flavor];
    var beats = 0;
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (!beats) beats = sum;
      if (Math.abs(sum - beats) > 1e-6) throw new Error('PRIMAL.EXE track beat mismatch: ' + sum + ' vs ' + beats);
    });
    if (beats !== 420 || Math.abs(beats * 60 / 140 - 180) > 1e-9) throw new Error('PRIMAL.EXE not 180.0s: ' + beats + ' beats');
    return {
      bpm: 140,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },   // four-on-the-floor techno kick
        { type: 'square',   vol: 0.014, notes: hatO },   // offbeat open hats
        { type: 'square',   vol: 0.008, notes: hatC },   // 16th closed ticks
        { type: 'square',   vol: 0.095, notes: bass },   // ACID rolling bass
        { type: 'square',   vol: 0.03,  notes: arp },    // acid arp
        { type: 'square',   vol: 0.06,  notes: leadA },  // dark riff voice 1
        { type: 'sawtooth', vol: 0.032, notes: leadB },  // detune substitute voice 2
        { type: 'square',   vol: 0.024, notes: pad1 },   // tension pad / stab 1
        { type: 'square',   vol: 0.02,  notes: pad2 },   // tension pad / stab 2
        { type: 'square',   vol: 0.05,  notes: build },  // snare-roll build
        { type: 'triangle', vol: 0.08,  notes: sub },    // drop sub layer
        { type: 'triangle', vol: 0.05,  notes: flavor }  // doors + dark stabs + ring
      ]
    };
  })();

  MAPS.register({
    id: 'prehistoria',

    installData: function (DATA) {
      DATA.biomes.prehistoria = {
        name: 'Prehistoria', tile: 'phtJungle',
        mobs: ['termite', 'mayfly', 'wasp', 'centipede', 'bee', 'hornet', 'grub', 'arthro']
      };
      DATA.realms.prehistoria = {
        name: 'Prehistoria', biome: 'prehistoria', boss: 'primordial',
        kind: 'prehistoria', music: 'prehistoria',
        // ARMY ANT MARCH cycle — a telegraphed MOVING column sweeps across the map
        antMarch: { cycleMs: 15000, warnMs: 1400, marchMs: 5200, laneHalf: 58, dmg: 18,
                    speed: 150, warnSegMs: 900, vertical: false, maxLive: 1 },
        // ARTHROPLEURA neutral-until-provoked colossus
        arthro: { neutralUntilProvoked: true, calmMs: 9000 }
      };

      // ---- the 8 insect mobs (Red picks; DINOS RETIRED) ----
      DATA.mobs.termite = { name: 'Termite Swarm', texture: 'prehistoriaTermiteHi', hp: 14, spd: 150, xp: 5, cost: 1,
        deathTint: 0xc8a86a, chase: { contactDmg: 4 }, flap: true,
        maxConcurrent: 8, unlockAt: 0 };
      DATA.mobs.mayfly = { name: 'Giant Mayfly', texture: 'prehistoriaMayflyHi', hp: 20, spd: 156, xp: 8, cost: 1,
        deathTint: 0xbfe0c0, float: true, flap: true, chase: { contactDmg: 4 },
        wander: { jitter: 0.5 },                                     // erratic evasive drift
        mapVerb: 'mayflyFlit', flit: { everyMs: 1400, dist: 120, dur: 260 },
        maxConcurrent: 4, unlockAt: 0 };
      DATA.mobs.wasp = { name: 'Giant Wasp', texture: 'prehistoriaWaspHi', hp: 42, spd: 118, xp: 16, cost: 2,
        deathTint: 0xd2a020, float: true, flap: true,
        mapVerb: 'waspDive',                                          // shadow-marked dive (valkyrie tech)
        dive: { everyMs: 4800, range: 460, warnMs: 950, len: 300, half: 30, diveMs: 340, speed: 480, dmg: 16 },
        maxConcurrent: 3, unlockAt: 30 };
      DATA.mobs.hornet = { name: 'Hornet', texture: 'prehistoriaHornetHi', hp: 64, spd: 120, xp: 20, cost: 3,
        deathTint: 0xd07028, float: true, flap: true, chase: { contactDmg: 10 },
        mapVerb: 'hornetEnrage',                                      // ramps spd + dmg the longer it's near you
        enrage: { nearRange: 240, rampMs: 3200, spdMult: 1.7, dmgMult: 2.0, glow: 0xff9a3f },
        maxConcurrent: 3, unlockAt: 35 };
      DATA.mobs.bee = { name: 'Honey Bee', texture: 'prehistoriaBeeHi', hp: 50, spd: 112, xp: 15, cost: 2,
        deathTint: 0xd0a848, float: true, flap: true, chase: { contactDmg: 6 },
        mapVerb: 'beeBuff',                                           // POLLEN buff — hastes/shields nearby bugs
        buff: { everyMs: 5000, radius: 220, hasteMult: 1.35, durMs: 3000, warnMs: 600 },
        maxConcurrent: 2, unlockAt: 35 };
      DATA.mobs.grub = { name: 'Goliath Grub', texture: 'prehistoriaGrubHi', hp: 240, spd: 42, xp: 32, cost: 4,
        deathTint: 0xc8b488, flap: true, chase: { contactDmg: 14 },  // slow HP tank roadblock
        maxConcurrent: 2, unlockAt: 40 };
      DATA.mobs.centipede = { name: 'Giant Centipede', texture: 'prehistoriaCentipedeHi', hp: 70, spd: 150, xp: 20, cost: 3,
        deathTint: 0xc8643a, flap: true, chase: { contactDmg: 8 },   // serpentine
        mapVerb: 'centiBurrow',                                       // submerge -> warned pop-up re-emerge
        burrow: { everyMs: 5200, warnMs: 900, submergeMs: 700, range: 360, popRadius: 60, dmg: 18 },
        unlockAt: 25 };
      DATA.mobs.arthro = { name: 'Arthropleura', texture: 'prehistoriaArthroHi', hp: 440, spd: 30, xp: 62, cost: 5,
        deathTint: 0x8a94a6, flap: true, chase: { contactDmg: 18 },  // NEUTRAL colossus + trample, serpentine
        mapVerb: 'arthroTrample',
        trample: { everyMs: 5200, range: 480, warnMs: 1050, len: 460, half: 30, chargeMs: 1000, speed: 430, kb: 300, dmg: 22 },
        maxConcurrent: 1, unlockAt: 55 };

      // ---- THE PRIMORDIAL METAMORPH — worm P1 -> cocoon -> moth P2 (two-kill) ----
      DATA.bosses.primordial = {
        name: 'The Primordial Metamorph', texture: 'prehistoriaWormHi',
        hp: 2100, spd: 44, xp: 640, contactDmg: 22, deathTint: 0xe08a34,
        lootTable: 'primordial',
        mapOwned: true, entranceMs: 4200,                             // 5-beat DIG-OUT
        metamorph: { wormFlap: 'prehistoriaWormHib', mothTexture: 'prehistoriaMothHi',
                     mothFlap: 'prehistoriaMothHib', cocoon: 'prehistoriaCocoonHi',
                     cocoonCrack: 'prehistoriaCocoonCrackHi', cocoonMs: 2800, p2Hp: 2100 },
        patterns: {
          verbEveryMs: 5000,
          // --- P1 WORM ---
          burrow:     { range: 520, warnMs: 950, len: 520, half: 34, diveMs: 360, speed: 520, dmg: 24 }, // signature
          dirtSpray:  { range: 420, warnMs: 900, count: 3, scatter: 150, radius: 60, dmg: 18, gapMs: 130 },
          quake:      { range: 230, warnMs: 1000, radius: 140, dmg: 22 },
          termiteCall:{ everyMs: 12000, count: 3, cap: 10 },
          // --- P2 MOTH ---
          diveStrafe: { warnMs: 950, len: 520, half: 32, diveMs: 360, speed: 540, dmg: 22, count: 2 },
          scaleDust:  { count: 5, radius: 64, warnMs: 900, gapMs: 260, puddleMs: 3600, puddleDmg: 5, tickMs: 700 },
          wingGust:   { range: 300, warnMs: 900, halfRad: 0.7, dmg: 14, kb: 300 },                        // CAPPED kb
          moonLure:   { everyMs: 14000, warnMs: 1000, pull: 130, durMs: 1400, summon: 3 },
          p2HpPct: 0.5,
          overclock:  { hpPct: 0.28, rateMult: 0.74 }
        },
        title: 'THE FINAL INSTAR',
        hints: [
          'It claws UP from the earth — the churned mound shows where it will surface.',
          'The worm BURROWS and erupts beneath you; step off the shadowed lane.',
          'When it rears back it SPRAYS grit in a cone — read the arc and slip aside.',
          'Kill the worm and it COCOONS — the moth that climbs out is a fresh fight.',
          'The moth sheds burning SCALE-DUST; never stand in the glowing powder.',
          'Its wing-gust only shoves you — the ANT MARCH column is the real killer.'
        ]
      };
      DATA.dropTables.primordial = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (insect re-theme) + the theme (PRIMAL.EXE KEPT) ----
      DATA.audio.sounds.antmarchwarn = { type: 'square', freq: 1400, freqEnd: 1700, len: 0.16, vol: 0.07, limitMs: 200 };
      DATA.audio.sounds.antmarch = { type: 'square', freq: 900, freqEnd: 700, len: 0.5, vol: 0.06, limitMs: 600, noise: { vol: 0.06, hp: 1600 } };
      DATA.audio.sounds.wormburrow = { type: 'sawtooth', freq: 400, freqEnd: 120, len: 0.5, vol: 0.13, limitMs: 600, noise: { vol: 0.08, hp: 400 } };
      DATA.audio.sounds.wormheave = { type: 'triangle', freq: 160, freqEnd: 70, len: 0.7, vol: 0.16, limitMs: 800, noise: { vol: 0.1, hp: 300 } };
      DATA.audio.sounds.dirtspray = { type: 'sawtooth', freq: 1200, freqEnd: 500, len: 0.3, vol: 0.1, limitMs: 340, noise: { vol: 0.09, hp: 900 } };
      DATA.audio.sounds.quakestomp = { type: 'triangle', freq: 90, freqEnd: 50, len: 0.7, vol: 0.16, limitMs: 800, noise: { vol: 0.08, hp: 260 } };
      DATA.audio.sounds.termitechitter = { type: 'square', freq: 2000, freqEnd: 2400, len: 0.08, vol: 0.07, limitMs: 140 };
      DATA.audio.sounds.waspdive = { type: 'sawtooth', freq: 1800, freqEnd: 700, len: 0.3, vol: 0.1, limitMs: 340, noise: { vol: 0.06, hp: 1800 } };
      DATA.audio.sounds.hornetbuzz = { type: 'sawtooth', freq: 300, freqEnd: 360, len: 0.4, vol: 0.09, limitMs: 480, noise: { vol: 0.05, hp: 600 } };
      DATA.audio.sounds.beebuzz = { type: 'triangle', freq: 340, freqEnd: 300, len: 0.3, vol: 0.08, limitMs: 360 };
      DATA.audio.sounds.centiburrow = { type: 'sawtooth', freq: 700, freqEnd: 200, len: 0.34, vol: 0.1, limitMs: 380, noise: { vol: 0.07, hp: 700 } };
      DATA.audio.sounds.digrumble = { type: 'triangle', freq: 120, freqEnd: 44, len: 0.9, vol: 0.16, limitMs: 1000, noise: { vol: 0.12, hp: 300 } };
      DATA.audio.sounds.cocoonform = { type: 'square', freq: 500, freqEnd: 900, len: 0.5, vol: 0.12, limitMs: 600 };
      DATA.audio.sounds.mothscreech = { type: 'square', freq: 2200, freqEnd: 900, len: 0.5, vol: 0.12, limitMs: 600, noise: { vol: 0.06, hp: 2000 } };
      DATA.audio.sounds.winggust = { type: 'sawtooth', freq: 260, freqEnd: 120, len: 0.5, vol: 0.13, limitMs: 600, noise: { vol: 0.09, hp: 500 } };
      DATA.audio.sounds.scaledust = { type: 'sawtooth', freq: 1600, freqEnd: 1200, len: 0.5, vol: 0.06, limitMs: 600, noise: { vol: 0.05, hp: 2600 } };
      DATA.audio.sounds.moonlure = { type: 'triangle', arp: [660, 880, 990, 1320], len: 0.7, vol: 0.1, limitMs: 800 };
      DATA.audio.music.prehistoria = PRIMAL;

      MAPS.addConsoleMap(DATA, { id: 'prehistoria', name: 'PREHISTORIA',
        sub: 'the swarm stirs', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof PREHISTORIA_ART !== 'undefined') PREHISTORIA_ART.buildInto(ctx);
    },

    mobVerbs: {
      mayflyFlit:    function (scene, m, player, time) { return scene._phMayfly(m, player, time); },
      waspDive:      function (scene, m, player, time) { return scene._phWasp(m, player, time); },
      hornetEnrage:  function (scene, m, player, time) { return scene._phHornet(m, player, time); },
      beeBuff:       function (scene, m, player, time) { return scene._phBee(m, player, time); },
      centiBurrow:   function (scene, m, player, time) { return scene._phCenti(m, player, time); },
      arthroTrample: function (scene, m, player, time) { return scene._phArthro(m, player, time); }
    },

    scene: (typeof PREHISTORIA_SCENE !== 'undefined') ? PREHISTORIA_SCENE : {}
  });
})();
