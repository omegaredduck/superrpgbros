// ============================================================================
// game/js/maps/carnival/map.js — HAUNTED CARNIVAL (realm 11) data +
// registration. Every pick is Red's (PLAN.md, locked 2026-07-16). Creepy
// carnival: cheery-gone-wrong under sickly bulb glow. Numbers TUNE ME. THE
// RINGMASTER's whole kit is stagecraft — every attack is a show number.
// ============================================================================
(function () {
  'use strict';

  // ---- "THE LAST SHOW" — 8-bit creepy calliope (Red-approved WAV).
  // Port of assets/render/render_carnival_theme.js as a section composer:
  // TRUE 3/4 — 132 BPM, 132 bars × 3 beats = 396 beats = EXACTLY 180.0s.
  // D-minor circus waltz: detuned steam-pipe lead over an oom-pah-pah engine,
  // forced-cheery F-major chorus bells, TAPE-WARP slumps (the composer can't
  // bend pitch, so warped bars play a SEMITONE FLAT — the same wrongness),
  // a music-box break that skips like it's winding down, mad giggles, an
  // octave-up grand finale, and a power-cut ending (flat wheeze + a thump).
  var LAST_SHOW = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    // Dm — Gm — A7 — Dm with chromatic creep
    var ROOTS = [38, 43, 33, 38], CH = [[62, 65, 69], [62, 67, 70], [61, 64, 69], [62, 65, 69]];
    // 6-slot lines shared across 2 bars: line[(b%2)*3+e]
    var MEL_V = [
      [62, 65, 69, 68, 69, -1], [70, 67, 62, -1, 65, 67],
      [69, 65, 61, 62, 64, 65], [62, -1, -1, 57, 58, 61]
    ];
    var MEL_C = [
      [65, 69, 72, -1, 72, 74], [72, 69, 65, -1, 62, 65],
      [64, 67, 70, -1, 70, 72], [69, -1, 65, -1, 61, 64]
    ];
    function sec(b) {
      if (b < 8) return { solo: true };                                            // lone creaky pipe
      if (b < 24) return { oom: true, mel: 'V' };                                  // verse waltz
      if (b < 40) return { oom: true, mel: 'C', cheer: true };                     // chorus
      if (b < 48) return { oom: 'slow', mel: 'V', warp: true };                    // TAPE WARP
      if (b < 64) return { oom: true, mel: 'V', giggles: true };                   // verse w/ giggles
      if (b < 72) return { box: true };                                            // music-box break
      if (b < 88) return { oom: true, mel: 'C', cheer: true, giggles: true };      // chorus 2
      if (b < 96) return { oom: 'slow', mel: 'C', warp: true, giggles: true };     // warped chorus
      if (b < 120) return { oom: true, mel: 'C', cheer: true, up: 12, big: true }; // grand finale
      if (b < 128) return { oom: 'slow', mel: 'V', warp: true, dying: true };      // power cut begins
      return { solo: true, dying: true };                                          // last wheeze
    }
    var DOORS = { 8: 1, 24: 1, 40: 1, 48: 1, 64: 1, 72: 1, 88: 1, 96: 1, 120: 1, 128: 1 };
    var thump = [], pah = [], pah2 = [], lead = [], bells = [],
        box = [], boxLow = [], pad2 = [], gig = [], door = [];
    for (var b = 0; b < 132; b++) {
      var s = sec(b), t = b % 4;
      var root = ROOTS[t], chord = CH[t];
      var flat = s.warp ? -1 : 0;                            // the tape sags a semitone
      // oom-pah-pah: beat 1 bass thump, beats 2+3 chord chicks
      if (s.oom) {
        var slow = s.oom === 'slow';
        thump.push([m2n(root + flat), 0.7], [null, 2.3]);
        if (slow) {                                          // the engine limps
          pah.push([null, 1], [m2n(chord[1] - 12 + flat), 0.32], [null, 1.68]);
          pah2.push([null, 2], [m2n(chord[2] - 12 + flat), 0.32], [null, 0.68]);
        } else {
          pah.push([null, 1], [m2n(chord[1] - 12), 0.32], [null, 0.68], [m2n(chord[1] - 12), 0.32], [null, 0.68]);
          pah2.push([null, 1], [m2n(chord[2] - 12), 0.32], [null, 0.68], [m2n(chord[2] - 12), 0.32], [null, 0.68]);
        }
      } else if (b === 131) {                                // a thump like a body hitting sawdust
        thump.push([m2n(26), 0.5], [null, 2.5]);
        pah.push([null, 3]); pah2.push([null, 3]);
      } else { thump.push([null, 3]); pah.push([null, 3]); pah2.push([null, 3]); }
      // the calliope pipe — two 3/4 bars share each 6-slot line
      var line = s.mel === 'V' ? MEL_V[t] : s.mel === 'C' ? MEL_C[t] : null;
      if (line) {
        for (var e = 0; e < 3; e++) {
          var m = line[(b % 2) * 3 + e];
          if (m == null || m < 0) { lead.push([null, 1]); continue; }
          lead.push([m2n(m + (s.up || 0) + flat), 0.88], [null, 0.12]);
        }
      } else if (s.solo) {
        var frag = [62, -1, 65, -1, 69, -1][b % 6];
        if (frag > 0) lead.push([null, 0.5], [m2n(frag + (s.dying ? -1 : 0)), 1.3], [null, 1.2]);
        else lead.push([null, 3]);
      } else lead.push([null, 3]);
      // forced-cheery counter bells on chorus (offbeat high thirds)
      if (s.cheer) bells.push([null, 0.5], [m2n(chord[0] + 12), 0.22], [null, 0.78],
        [m2n(chord[1] + 12), 0.22], [null, 0.78], [m2n(chord[2] + 12), 0.22], [null, 0.28]);
      else bells.push([null, 3]);
      // music-box break: thin high lullaby of the chorus, halting
      if (s.box) {
        var lin = MEL_C[t];
        for (var e2 = 0; e2 < 3; e2++) {
          var mb = lin[(b % 2) * 3 + e2];
          if (mb < 0 || (b + e2) % 7 === 6) { box.push([null, 1]); continue; } // the box skips
          box.push([m2n(mb + 24), 0.5], [null, 0.5]);
        }
        if (t === 3 && b % 2 === 1) boxLow.push([m2n(38), 2.9], [null, 0.1]);
        else boxLow.push([null, 3]);
      } else {
        box.push([null, 3]);
        boxLow.push(s.big ? [m2n(chord[0] - 12), 2.85] : [null, 2.85], [null, 0.15]);
      }
      // finale pads
      pad2.push(s.big ? [m2n(chord[2] - 12), 2.85] : [null, 2.85], [null, 0.15]);
      // mad giggles drifting the midway (descending chirps)
      if (s.giggles && t === 1 && b % 2 === 0)
        gig.push([null, 1.5], [m2n(88), 0.12], [m2n(86), 0.12], [m2n(84), 0.12], [m2n(82), 0.12], [null, 1.02]);
      else gig.push([null, 3]);
      // section-door rising whistle + the final flat wheeze
      if (DOORS[b]) door.push([m2n(74), 0.5], [m2n(76), 0.55], [null, 1.95]);
      else if (b === 130) door.push([null, 1], [m2n(61), 1.8], [null, 0.2]); // the wheeze, a semitone flat
      else door.push([null, 3]);
    }
    var TR = [thump, pah, pah2, lead, bells, box, boxLow, pad2, gig, door];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 396) > 1e-6) throw new Error('THE LAST SHOW track beat mismatch: ' + sum);
    });
    return {
      bpm: 132,
      tracks: [
        { type: 'triangle', vol: 0.14,  notes: thump },   // the OOM (bass thump)
        { type: 'square',   vol: 0.028, notes: pah },     // pah (chord chick 1)
        { type: 'square',   vol: 0.024, notes: pah2 },    // pah (chord chick 2)
        { type: 'square',   vol: 0.075, notes: lead },    // the breathy calliope pipe
        { type: 'square',   vol: 0.022, notes: bells },   // forced-cheery bells
        { type: 'square',   vol: 0.04,  notes: box },     // music-box tines
        { type: 'triangle', vol: 0.05,  notes: boxLow },  // box drone + finale pad
        { type: 'square',   vol: 0.018, notes: pad2 },    // finale pad 2
        { type: 'square',   vol: 0.03,  notes: gig },     // mad giggles
        { type: 'triangle', vol: 0.06,  notes: door }     // steam-whistle doors + the wheeze
      ]
    };
  })();

  MAPS.register({
    id: 'carnival',

    installData: function (DATA) {
      DATA.biomes.carnival = {
        name: 'Haunted Carnival', tile: 'cvchecker',
        mobs: ['creepyClown', 'balloonWisp', 'carnyBarker', 'possessedTeddy',
               'popcornPoltergeist', 'strongmanShade', 'cottonCandyBlob',
               'knifeJuggler', 'whackAMole', 'cymbalMonkey', 'ferrisPhantom']
      };
      DATA.realms.carnival = {
        name: 'Haunted Carnival', biome: 'carnival', boss: 'ringmaster',
        kind: 'carnival', music: 'carnival',
        // GAME BOOTHS knobs (PLAN §2) — ALL TUNE ME
        booth: { cycleMs: 20000, glowMs: 7000, roundMs: 8000, targetsN: 4,
                 biteDmg: 16, biteRadius: 130, biteWarnMs: 1100,
                 prizeHealPct: 0.25, prizeXp: 14 }
      };
      // ---- the 11 mobs (Red picks #1 2 3 4 6 12 13 14 16 17 20) ----
      DATA.mobs.creepyClown = { name: 'Creepy Clown', texture: 'creepyClownHi', hp: 30, spd: 105, xp: 8, cost: 1,
        deathTint: 0xd86470, chase: { contactDmg: 8 },
        mapVerb: 'clownHonk',                                 // honk telegraph → lunge
        honk: { everyMs: 4600, range: 210, warnMs: 650, dashMs: 300, dashSpeed: 380 } };
      DATA.mobs.balloonWisp = { name: 'Balloon Wisp', texture: 'balloonWispHi', hp: 16, spd: 55, xp: 6, cost: 1,
        deathTint: 0xd86470, float: true, chase: { contactDmg: 4 },
        mapVerb: 'wispPop',                                   // drifts in, telegraphed POP
        pop: { triggerRange: 95, warnMs: 800, radius: 90, dmg: 14 },
        unlockAt: 15 };
      DATA.mobs.carnyBarker = { name: 'Carny Barker', texture: 'carnyBarkerHi', hp: 70, spd: 70, xp: 18, cost: 2,
        deathTint: 0xc898e8, chase: { contactDmg: 10 },
        mapVerb: 'barkerSweep',                               // warned cane cone that PUSHES
        sweep: { everyMs: 5200, range: 230, warnMs: 850, halfRad: 0.6, dmg: 8, push: 340 },
        unlockAt: 40 };
      DATA.mobs.possessedTeddy = { name: 'Possessed Teddy', texture: 'possessedTeddyHi', hp: 55, spd: 100, xp: 16, cost: 2,
        deathTint: 0xa8825a, chase: { contactDmg: 12 },
        mapVerb: 'teddyAmbush',                               // plays dead; shimmer → springs
        ambush: { wakeRange: 150, warnMs: 600, springMs: 300, springSpeed: 430 },
        unlockAt: 25 };
      DATA.mobs.popcornPoltergeist = { name: 'Popcorn Poltergeist', texture: 'popcornPoltergeistHi', hp: 70, spd: 45, xp: 20, cost: 3,
        deathTint: 0xfff0a8, float: true, chase: { contactDmg: 6 },
        mapVerb: 'popcornMortar',                             // arcs kernels onto warned circles
        mortar: { everyMs: 4800, range: 400, count: 3, scatter: 150, radius: 55, warnMs: 950, dmg: 12 },
        unlockAt: 45 };
      DATA.mobs.strongmanShade = { name: 'Strongman Shade', texture: 'strongmanShadeHi', hp: 210, spd: 42, xp: 32, cost: 4,
        deathTint: 0xa8f0e4, chase: { contactDmg: 15 },
        mapVerb: 'shadeSlam',                                 // barbell slam + shockwave ring
        slam: { everyMs: 5600, range: 230, warnMs: 1000, radius: 100, dmg: 20,
                shockR: 260, shockMs: 900, shockDmg: 12 },
        maxConcurrent: 2, unlockAt: 65 };
      DATA.mobs.cottonCandyBlob = { name: 'Cotton Candy Blob', texture: 'cottonCandyBlobHi', hp: 90, spd: 55, xp: 20, cost: 3,
        deathTint: 0xe86a9a, chase: { contactDmg: 10 },
        mapVerb: 'blobDrip',                                  // sticky patches; splits ONCE
        drip: { everyMs: 2400, radius: 58, lifeMs: 5200 },
        unlockAt: 35 };
      DATA.mobs.knifeJuggler = { name: 'Knife Juggler', texture: 'knifeJugglerHi', hp: 75, spd: 60, xp: 22, cost: 3,
        deathTint: 0x9aa2b0, chase: { contactDmg: 8 },
        mapVerb: 'jugglerVolley',                             // telegraphed 3-knife lanes
        volley: { everyMs: 5400, range: 420, warnMs: 900, gapMs: 200, spreadRad: 0.35,
                  len: 420, half: 16, dmg: 16 },
        unlockAt: 55 };
      DATA.mobs.whackAMole = { name: 'Whack-a-Mole', texture: 'whackAMoleHi', hp: 50, spd: 85, xp: 16, cost: 2,
        deathTint: 0x7e6a56, chase: { contactDmg: 10 },
        mapVerb: 'moleErupt',                                 // tunnels; erupts under you
        erupt: { everyMs: 5200, range: 340, warnMs: 900, radius: 80, dmg: 16 },
        unlockAt: 50 };
      DATA.mobs.cymbalMonkey = { name: 'Cymbal Monkey', texture: 'cymbalMonkeyHi', hp: 40, spd: 90, xp: 14, cost: 2,
        deathTint: 0xffd23f, chase: { contactDmg: 6 },
        mapVerb: 'monkeyClash',                               // telegraphed CLASH slow ring
        clash: { everyMs: 5000, range: 200, warnMs: 800, radius: 150, dmg: 8, slowMs: 1400 },
        unlockAt: 30 };
      DATA.mobs.ferrisPhantom = { name: 'Ferris Phantom', texture: 'ferrisPhantomHi', hp: 300, spd: 35, xp: 50, cost: 5,
        deathTint: 0xa8f0e4, float: true, chase: { contactDmg: 18 },
        mapVerb: 'phantomRoll',                               // rolling warned lane + spoke beams
        roll: { everyMs: 7000, range: 480, warnMs: 1100, len: 620, half: 26, rollMs: 1500, speed: 320,
                beamEveryMs: 5600, beamRange: 360, beamLen: 230, beamHalf: 14, beamWarnMs: 700, beamDmg: 14 },
        maxConcurrent: 1, unlockAt: 85 };

      // ---- THE RINGMASTER · THE SHOW NEVER ENDS (mapOwned showman) ----
      DATA.bosses.ringmaster = {
        name: 'The Ringmaster', texture: 'ringmasterHi',
        hp: 3700, spd: 34, xp: 520, contactDmg: 20, deathTint: 0xffd23f,
        lootTable: 'ringmaster',
        mapOwned: true, entranceMs: 3200,
        patterns: {
          verbEveryMs: 5600,
          whipCrack:    { range: 260, warnMs: 900, halfRad: 0.55, dmg: 22, kb: 340 },
          spotlight:    { everyMs: 15000, chaseMs: 2600, radius: 92, speed: 240, dmg: 24 },
          clowns:       { count: 3, cap: 9 },
          knifeCurtain: { lanes: 4, laneGapMs: 550, warnMs: 950, half: 20, dmg: 22 },
          stepRightUp:  { ringR: 105, durMs: 2800, dmg: 24 },
          grandFinale:  { everyMs: 27000, firstDelayMs: 18000, count: 8, gapMs: 420,
                          warnMs: 1000, radius: 80, dmg: 24, ventMs: 3600, ventDmgMult: 1.5 },
          overclock:    { hpPct: 0.3, rateMult: 0.72 }
        },
        title: 'THE SHOW NEVER ENDS',
        hints: [
          'The carnival\'s master of ceremonies. Every attack is a show number — watch the stage, not him.',
          'His WHIP flashes a golden cone before it cracks. Sidestep the flash or be flung.',
          'A second SPOTLIGHT hunts you. When it fills, a stage light crashes down — never stop moving.',
          'SEND IN THE CLOWNS calls his cast up from the midway. Thin the troupe or drown in it.',
          'KNIFE CURTAIN marches warned lanes across the ring in order. STEP RIGHT UP forces his game — stand IN the teal rings.',
          'THE GRAND FINALE rains fireworks... then he BOWS, winded. That bow is your window — unload.'
        ]
      };
      DATA.dropTables.ringmaster = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.boothsting = { type: 'triangle', arp: [523, 659, 784, 1047], len: 0.5, vol: 0.13, limitMs: 550 };
      DATA.audio.sounds.targetpop = { type: 'square', freq: 900, freqEnd: 1400, len: 0.12, vol: 0.12, limitMs: 150 };
      DATA.audio.sounds.prizefanfare = { type: 'triangle', arp: [784, 988, 1175, 1568], len: 0.6, vol: 0.15, limitMs: 700 };
      DATA.audio.sounds.boothbite = { type: 'square', freq: 300, freqEnd: 90, len: 0.35, vol: 0.16, limitMs: 400,
                                      noise: { vol: 0.08, hp: 800 } };
      DATA.audio.sounds.whipcrack = { type: 'square', freq: 2400, freqEnd: 200, len: 0.12, vol: 0.18, limitMs: 200,
                                      noise: { vol: 0.1, hp: 2400 } };
      DATA.audio.sounds.spotlighthum = { type: 'sawtooth', freq: 120, freqEnd: 160, len: 0.8, vol: 0.1, limitMs: 900 };
      DATA.audio.sounds.lightcrash = { type: 'square', freq: 800, freqEnd: 120, len: 0.4, vol: 0.17, limitMs: 450,
                                       noise: { vol: 0.09, hp: 1200 } };
      DATA.audio.sounds.knifewhish = { type: 'square', freq: 1800, freqEnd: 900, len: 0.15, vol: 0.1, limitMs: 200 };
      DATA.audio.sounds.fireworkburst = { type: 'square', freq: 600, freqEnd: 80, len: 0.45, vol: 0.16, limitMs: 500,
                                          noise: { vol: 0.1, hp: 1600 } };
      DATA.audio.sounds.trapezecreak = { type: 'triangle', freq: 180, freqEnd: 140, len: 0.7, vol: 0.12, limitMs: 800 };
      DATA.audio.sounds.calliopeswell = { type: 'triangle', freq: 220, freqEnd: 660, len: 1.0, vol: 0.13, limitMs: 1100 };
      DATA.audio.sounds.clownhonk = { type: 'square', freq: 220, freqEnd: 180, len: 0.25, vol: 0.14, limitMs: 300 };
      DATA.audio.sounds.cymbalclash = { type: 'square', freq: 3000, freqEnd: 2400, len: 0.3, vol: 0.1, limitMs: 350,
                                        noise: { vol: 0.08, hp: 3000 } };
      DATA.audio.sounds.balloonpop = { type: 'square', freq: 1200, freqEnd: 300, len: 0.15, vol: 0.14, limitMs: 200,
                                       noise: { vol: 0.07, hp: 1800 } };
      DATA.audio.music.carnival = LAST_SHOW;

      MAPS.addConsoleMap(DATA, { id: 'carnival', name: 'HAUNTED CARNIVAL',
        sub: 'the midway plays on with nobody running it', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof CARNIVAL_ART !== 'undefined') CARNIVAL_ART.buildInto(ctx);
    },

    mobVerbs: {
      clownHonk: function (scene, m, player, time) { return scene._cvClown(m, player, time); },
      wispPop: function (scene, m, player, time) { return scene._cvWisp(m, player, time); },
      barkerSweep: function (scene, m, player, time) { return scene._cvBarker(m, player, time); },
      teddyAmbush: function (scene, m, player, time) { return scene._cvTeddy(m, player, time); },
      popcornMortar: function (scene, m, player, time) { return scene._cvPoltergeist(m, player, time); },
      shadeSlam: function (scene, m, player, time) { return scene._cvShade(m, player, time); },
      blobDrip: function (scene, m, player, time) { return scene._cvBlob(m, player, time); },
      jugglerVolley: function (scene, m, player, time) { return scene._cvJuggler(m, player, time); },
      moleErupt: function (scene, m, player, time) { return scene._cvMole(m, player, time); },
      monkeyClash: function (scene, m, player, time) { return scene._cvMonkey(m, player, time); },
      phantomRoll: function (scene, m, player, time) { return scene._cvPhantom(m, player, time); }
    },

    scene: (typeof CARNIVAL_SCENE !== 'undefined') ? CARNIVAL_SCENE : {}
  });
})();
