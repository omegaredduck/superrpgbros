// ============================================================================
// game/js/maps/swamp/map.js — WITCH'S SWAMP (realm 12) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-16). Bayou-witch: black water,
// wisp light, brew green — spooky but ALIVE. Numbers TUNE ME. WATER RULE
// (documented pick): slow-wade 0.45× — planks + islands run free.
// ============================================================================
(function () {
  'use strict';

  // ---- "WISP RAVE" — 8-bit techno trance (TAKE 4, RED'S PICK: "thats the
  // one"). Port of assets/render/render_swamp_theme.js as a section composer:
  // 140 BPM A minor (Am–F–C–G), 105 bars × 4 = 420 beats = EXACTLY 180.0s.
  // Four-on-the-floor kicks, offbeat open hats + 16th closed, ACID BASS
  // (16th offbeat pulses, octave pops, a G-pop where the slide was — the
  // composer can't bend pitch), trance arp, twin-voice anthem lead, gated
  // pads, emotive breakdown → snare-roll BUILD (accelerating density) →
  // THE DROP (sub layer) → break 2 → FINAL DROP octave up → outro. Wisp
  // drips + one croak per phrase keep it swampy.
  var WISP_RAVE = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [33, 29, 24, 31], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
    var LEAD = [
      [69, -1, 72, -1, 76, -1, 74, 72], [74, -1, 72, -1, 69, -1, 65, 69],
      [72, -1, 67, -1, 72, -1, 76, 74], [74, -1, 71, -1, 67, -1, 71, 74]
    ];
    var BREAK_MEL = [[76, 74, 72, 69], [72, 69, 65, 69], [76, 72, 67, 72], [74, 71, 67, 62]];
    function sec(b) {
      if (b < 8) return { kick: true, hats: b >= 4 };                              // intro
      if (b < 16) return { kick: true, hats: true, bass: true };                   // bass in
      if (b < 32) return { kick: true, hats: true, bass: true, arp: true, stab: b >= 24 };
      if (b < 48) return { pads: true, bmel: true, wisps: true };                  // BREAKDOWN
      if (b < 56) return { pads: true, build: true, roll: b - 48 };                // BUILD
      if (b < 80) return { kick: true, hats: true, bass: true, arp: true, lead: true, big: true }; // DROP
      if (b < 88) return { pads: true, bmel: true, wisps: true };                  // break 2
      if (b < 100) return { kick: true, hats: true, bass: true, arp: true, lead: true, big: true, up: 12 };
      return { kick: b < 102, hats: true, bass: b < 102 };                         // outro
    }
    var DOORS = { 16: 1, 32: 1, 48: 1, 56: 1, 80: 1, 88: 1, 100: 1 };
    var KK = m2n(26), HO = 'A7', HC = 'C8', SN = 'A#7';
    var kick = [], hatO = [], hatC = [], bass = [], arp = [], leadA = [], leadB = [],
        pad1 = [], pad2 = [], build = [], sub = [], flavor = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), t = b % 4;
      var root = ROOTS[t], chord = CH[t];
      // four-on-the-floor
      if (s.kick) { for (var k = 0; k < 4; k++) kick.push([KK, 0.12], [null, 0.88]); }
      else if (b === 104) kick.push([null, 2], [KK, 0.12], [null, 1.88]);          // the last kick
      else kick.push([null, 4]);
      // offbeat open hats + 16th closed ticks
      if (s.hats) {
        for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [HO, 0.1], [null, 0.4]);
        for (var h2 = 0; h2 < 4; h2++) hatC.push([null, 0.25], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17], [HC, 0.08], [null, 0.17]);
      } else { hatO.push([null, 4]); hatC.push([null, 4]); }
      // ACID BASS: 16th offbeats, octave pops, G-pop at slot 14 (the slide)
      if (s.bass) {
        for (var e = 0; e < 16; e++) {
          if (e % 4 === 0) { bass.push([null, 0.25]); continue; }                  // duck the kick
          var bm = (e === 14) ? root + 7 - 12 : root + ((e % 8 === 6) ? 12 : 0) - 12;
          bass.push([m2n(bm), 0.2], [null, 0.05]);
        }
      } else bass.push([null, 4]);
      // trance arp: chord notes up-down on 16ths, +12
      if (s.arp) {
        var an = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[1]];
        for (var e2 = 0; e2 < 16; e2++) arp.push([m2n(an[e2 % 8] + 12), 0.21], [null, 0.04]);
      } else arp.push([null, 4]);
      // anthem lead (drop, twin voices) / breakdown melody (quarters)
      if (s.lead) {
        for (var e3 = 0; e3 < 8; e3++) {
          var lm = LEAD[t][e3];
          if (lm < 0) { leadA.push([null, 0.5]); leadB.push([null, 0.5]); continue; }
          leadA.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
          leadB.push([m2n(lm + (s.up || 0)), 0.45], [null, 0.05]);
        }
      } else if (s.bmel) {
        for (var e4 = 0; e4 < 4; e4++) {
          var bmm = BREAK_MEL[t][e4];
          leadA.push([m2n(bmm), 0.9], [null, 0.1]);
          leadB.push([m2n(bmm), 0.9], [null, 0.1]);
        }
      } else { leadA.push([null, 4]); leadB.push([null, 4]); }
      // gated pads (chopped 8ths, the gate on every 4th) / chord stabs
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
      // BUILD: snare roll accelerating (4..11 hits/bar; bar 7 = 16th roll)
      if (s.build) {
        if (s.roll === 7) { for (var r2 = 0; r2 < 16; r2++) build.push([SN, 0.08], [null, 0.17]); }
        else {
          var den = 4 + s.roll;
          for (var r3 = 0; r3 < den; r3++) build.push([SN, 0.08], [null, 4 / den - 0.08]);
        }
      } else build.push([null, 4]);
      // drop sub layer
      sub.push(s.big ? [m2n(root - 12), 3.8] : [null, 3.8], [null, 0.2]);
      // section doors (rising blips) + wisp drips + one croak per phrase
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (s.wisps && t === 3) flavor.push([null, 1.25], [m2n(86), 0.15], [null, 1.8], [m2n(43), 0.2], [null, 0.6]);
      else if (s.wisps) flavor.push([null, 1.25], [m2n(86), 0.15], [null, 2.6]);
      else if (b === 104) flavor.push([null, 2.6], [m2n(86), 0.15], [null, 0.4], [m2n(86), 0.15], [null, 0.7]);
      else flavor.push([null, 4]);
    }
    var TR = [kick, hatO, hatC, bass, arp, leadA, leadB, pad1, pad2, build, sub, flavor];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 420) > 1e-6) throw new Error('WISP RAVE track beat mismatch: ' + sum);
    });
    return {
      bpm: 140,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },    // four-on-the-floor
        { type: 'square',   vol: 0.014, notes: hatO },    // offbeat open hats
        { type: 'square',   vol: 0.008, notes: hatC },    // 16th closed ticks
        { type: 'square',   vol: 0.09,  notes: bass },    // ACID bass
        { type: 'square',   vol: 0.028, notes: arp },     // trance arp
        { type: 'square',   vol: 0.055, notes: leadA },   // anthem/breakdown voice 1
        { type: 'sawtooth', vol: 0.03,  notes: leadB },   // detune substitute voice 2
        { type: 'square',   vol: 0.022, notes: pad1 },    // gated pad / stab 1
        { type: 'square',   vol: 0.018, notes: pad2 },    // gated pad / stab 2
        { type: 'square',   vol: 0.05,  notes: build },   // snare-roll build
        { type: 'triangle', vol: 0.08,  notes: sub },     // drop sub layer
        { type: 'triangle', vol: 0.05,  notes: flavor }   // doors + drips + croaks
      ]
    };
  })();

  MAPS.register({
    id: 'swamp',

    installData: function (DATA) {
      DATA.biomes.swamp = {
        name: "Witch's Swamp", tile: 'swmoss',
        mobs: ['bogling', 'giantLeech', 'skeeterCloud', 'snapjawTurtle', 'witchling',
               'sporecapMyconid', 'toadAlchemist', 'mireSerpent', 'glowcapSprite',
               'bottledImp', 'cauldronMimic', 'mossback']
      };
      DATA.realms.swamp = {
        name: "Witch's Swamp", biome: 'swamp', boss: 'brewmistress',
        kind: 'swamp', music: 'swamp',
        // HEX TOTEM knobs (PLAN §2) — ALL TUNE ME
        totem: { cycleMs: 18000, warnMs: 1200, hp: 40, auraR: 190, pulseMs: 1400,
                 maxUp: 2, drainTickMs: 900, drainDmg: 4, weakenMult: 0.6, splinterR: 130 }
      };
      // ---- the 12 mobs (Red picks #1 2 4 5 6 8 11 13 14 17 19 20) ----
      DATA.mobs.bogling = { name: 'Bogling', texture: 'boglingHi', hp: 22, spd: 100, xp: 6, cost: 1,
        deathTint: 0x7e6448, chase: { contactDmg: 7 } };
      DATA.mobs.giantLeech = { name: 'Giant Leech', texture: 'giantLeechHi', hp: 45, spd: 95, xp: 14, cost: 2,
        deathTint: 0x5a3a4e, chase: { contactDmg: 6 },
        mapVerb: 'leechLatch',                                // lunge → SHORT latch drain
        latch: { range: 240, warnMs: 500, dashMs: 320, dashSpeed: 430,
                 latchMs: 800, drainTickMs: 300, drainDmg: 3, cooldownMs: 4200 },
        unlockAt: 15 };
      DATA.mobs.skeeterCloud = { name: 'Skeeter Cloud', texture: 'skeeterCloudHi', hp: 28, spd: 130, xp: 10, cost: 1,
        deathTint: 0x7fe8d8, float: true, chase: { contactDmg: 5 },
        lunge: { range: 220, windupMs: 300, dashMs: 200, dashSpeed: 400, cooldownMs: 2200 },
        unlockAt: 20 };
      DATA.mobs.snapjawTurtle = { name: 'Snapjaw Turtle', texture: 'snapjawTurtleHi', hp: 160, spd: 45, xp: 26, cost: 3,
        deathTint: 0x4a5e38, chase: { contactDmg: 12 },
        mapVerb: 'turtleSnap',                                // snap cone + TUCK armor
        snap: { everyMs: 4800, range: 170, warnMs: 800, halfRad: 0.7, dmg: 16 },
        tuck: { tuckMs: 1400, cdMs: 4200 },
        unlockAt: 40 };
      DATA.mobs.witchling = { name: 'Witchling', texture: 'witchlingHi', hp: 40, spd: 60, xp: 16, cost: 2,
        deathTint: 0xb088d8,
        shoot: { range: 340, dmg: 11, projSpeed: 210, cooldownMs: 1700,
                 count: 1, spreadDeg: 0, lifeMs: 2600, tint: 0xb088d8, texture: 'orbShot' },
        unlockAt: 25 };
      DATA.mobs.sporecapMyconid = { name: 'Sporecap Myconid', texture: 'sporecapMyconidHi', hp: 75, spd: 40, xp: 18, cost: 2,
        deathTint: 0xb088d8, chase: { contactDmg: 8 },
        mapVerb: 'myconidSpores',                             // slow-spore clouds
        spore: { everyMs: 5200, range: 300, count: 2, radius: 70, warnMs: 900, lifeMs: 3800 },
        unlockAt: 30 };
      DATA.mobs.toadAlchemist = { name: 'Toad Alchemist', texture: 'toadAlchemistHi', hp: 70, spd: 45, xp: 20, cost: 3,
        deathTint: 0x9ee83f, chase: { contactDmg: 8 },
        mapVerb: 'toadMortar',                                // flasks → toxic seep pools
        mortar: { everyMs: 5000, range: 420, count: 3, scatter: 140, radius: 60, warnMs: 950,
                  dmg: 14, seepMs: 4200, seepDmg: 4, seepTickMs: 800 },
        unlockAt: 45 };
      DATA.mobs.mireSerpent = { name: 'Mire Serpent', texture: 'mireSerpentHi', hp: 85, spd: 70, xp: 22, cost: 3,
        deathTint: 0x5a7a4a, chase: { contactDmg: 14 },
        mapVerb: 'serpentStrike',                             // warned lane strike (wraps!)
        strike: { everyMs: 5600, range: 460, warnMs: 1000, len: 520, half: 22, strikeMs: 1200, speed: 400 },
        unlockAt: 55 };
      DATA.mobs.glowcapSprite = { name: 'Glowcap Sprite', texture: 'glowcapSpriteHi', hp: 26, spd: 85, xp: 14, cost: 2,
        deathTint: 0xd8ffa0, float: true,                     // harmless — NO def.chase (keg lesson)
        mapVerb: 'spriteHeal',                                // mends mobs — priority target
        mend: { everyMs: 2600, range: 260, heal: 12, fleeRange: 180 },
        maxConcurrent: 2, unlockAt: 35 };
      DATA.mobs.bottledImp = { name: 'Bottled Imp', texture: 'bottledImpHi', hp: 35, spd: 60, xp: 14, cost: 2,
        deathTint: 0xa02830, chase: { contactDmg: 6 },
        mapVerb: 'impSmash',                                  // jar hops, SMASHES → flame patch
        smash: { triggerRange: 130, warnMs: 900, radius: 90, dmg: 16,
                 flameR: 60, flameMs: 4200, flameDmg: 5, flameTickMs: 700,
                 hopEveryMs: 1600, hopMs: 340, hopSpeed: 380 },
        unlockAt: 50 };
      DATA.mobs.cauldronMimic = { name: 'Cauldron Mimic', texture: 'cauldronMimicHi', hp: 260, spd: 30, xp: 40, cost: 4,
        deathTint: 0x9ee83f, chase: { contactDmg: 14 },
        mapVerb: 'mimicHopSpew',                              // quake hops + brew arcs
        mimic: { hopEveryMs: 3200, hopMs: 500, hopSpeed: 330, quakeR: 200, quakeMs: 800, quakeDmg: 14,
                 spewEveryMs: 6400, spewCount: 2, spewRadius: 60, spewWarnMs: 900, spewDmg: 14,
                 seepMs: 3600, seepDmg: 4, seepTickMs: 800 },
        maxConcurrent: 2, unlockAt: 65 };
      DATA.mobs.mossback = { name: 'Mossback', texture: 'mossbackHi', hp: 340, spd: 55, xp: 55, cost: 5,
        deathTint: 0x8a9e4a, chase: { contactDmg: 18 },
        mapVerb: 'mossbackWake',                              // sleeping hulk → charge + slam
        rage: { wakeRange: 170, warnMs: 700, comboEveryMs: 5200, range: 480,
                chargeWarnMs: 900, chargeLen: 520, chargeMs: 1100, chargeSpeed: 430, chargeHalf: 26,
                slamWarnMs: 1000, slamRadius: 110, slamDmg: 22 },
        maxConcurrent: 1, unlockAt: 85 };

      // ---- THE BREWMISTRESS · MISTRESS OF THE MIRE (mapOwned witch) ----
      DATA.bosses.brewmistress = {
        name: 'The Brewmistress', texture: 'brewmistressHi',
        hp: 3800, spd: 32, xp: 540, contactDmg: 20, deathTint: 0x9ee83f,
        lootTable: 'brewmistress',
        mapOwned: true, entranceMs: 3200,
        patterns: {
          verbEveryMs: 5400,
          ladleSwing:  { range: 240, warnMs: 900, halfRad: 0.6, dmg: 22, kb: 320 },
          flaskVolley: { count: 3, scatter: 160, radius: 70, warnMs: 1000, dmg: 20,
                         seepMs: 4500, seepDmg: 5, seepTickMs: 800 },
          plantTotem:  { hp: 25 },
          swampGas:    { count: 3, range: 300, warnMs: 1000, gapMs: 550, dmg: 18 },
          adds:        { everyMs: 16000, boglings: 3, cap: 9 },
          grandBrew:   { everyMs: 28000, firstDelayMs: 18000, splashCount: 5, splashR: 80,
                         splashWarnMs: 1000, splashGapMs: 350, splashDmg: 20,
                         waveWarnMs: 1500, waveDmg: 26, ventMs: 3600, ventDmgMult: 1.5 },
          overclock:   { hpPct: 0.3, rateMult: 0.72 }
        },
        title: 'MISTRESS OF THE MIRE',
        hints: [
          "The swamp's landlady. Her iron LADLE flashes a green cone before the swat — step around it.",
          "FLASK VOLLEY rains warned circles that LINGER as toxic seep. Never stand in her puddles.",
          "She PLANTS HEX TOTEMS — shoot them down before the slow hex pins you in something worse.",
          "SWAMP GAS sweeps sector clouds in order around her. Walk the gaps, don't sprint the wall.",
          "SUMMON THE BREW pours boglings and a bottled imp from the pot. The pot itself can't be harmed.",
          "THE GRAND BREW: she dives in, brew rains, the POT TIPS a whole half — flee it, then unload while she's dizzy."
        ]
      };
      DATA.dropTables.brewmistress = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.totemrise = { type: 'triangle', freq: 90, freqEnd: 220, len: 0.8, vol: 0.14, limitMs: 900,
                                      noise: { vol: 0.05, hp: 300 } };
      DATA.audio.sounds.totemshatter = { type: 'square', freq: 900, freqEnd: 200, len: 0.35, vol: 0.15, limitMs: 400,
                                         noise: { vol: 0.09, hp: 1400 } };
      DATA.audio.sounds.ladlewhoosh = { type: 'square', freq: 500, freqEnd: 140, len: 0.25, vol: 0.15, limitMs: 300 };
      DATA.audio.sounds.flasksmash = { type: 'square', freq: 1400, freqEnd: 400, len: 0.2, vol: 0.13, limitMs: 250,
                                       noise: { vol: 0.08, hp: 2000 } };
      DATA.audio.sounds.gashiss = { type: 'sawtooth', freq: 2200, freqEnd: 1600, len: 0.6, vol: 0.07, limitMs: 700,
                                    noise: { vol: 0.06, hp: 2600 } };
      DATA.audio.sounds.cauldronbloop = { type: 'triangle', freq: 160, freqEnd: 420, len: 0.25, vol: 0.14, limitMs: 300 };
      DATA.audio.sounds.cauldronsplash = { type: 'square', freq: 700, freqEnd: 120, len: 0.5, vol: 0.15, limitMs: 550,
                                           noise: { vol: 0.1, hp: 900 } };
      DATA.audio.sounds.waveroar = { type: 'sawtooth', freq: 80, freqEnd: 240, len: 0.9, vol: 0.15, limitMs: 1000,
                                     noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.leechlatch = { type: 'square', freq: 300, freqEnd: 600, len: 0.18, vol: 0.13, limitMs: 250 };
      DATA.audio.sounds.shelltink = { type: 'triangle', freq: 1800, freqEnd: 1400, len: 0.12, vol: 0.12, limitMs: 180 };
      DATA.audio.sounds.serpenthiss = { type: 'square', freq: 2400, freqEnd: 1200, len: 0.3, vol: 0.08, limitMs: 350,
                                        noise: { vol: 0.07, hp: 3000 } };
      DATA.audio.sounds.mimicclang = { type: 'square', freq: 400, freqEnd: 180, len: 0.3, vol: 0.15, limitMs: 350,
                                       noise: { vol: 0.06, hp: 700 } };
      DATA.audio.sounds.mossroar = { type: 'sawtooth', freq: 110, freqEnd: 60, len: 0.7, vol: 0.16, limitMs: 800,
                                     noise: { vol: 0.08, hp: 300 } };
      DATA.audio.sounds.witchcackle = { type: 'square', arp: [660, 880, 660, 990, 740], len: 0.6, vol: 0.13, limitMs: 700 };
      DATA.audio.music.swamp = WISP_RAVE;

      MAPS.addConsoleMap(DATA, { id: 'swamp', name: "WITCH'S SWAMP",
        sub: 'the pot always boils', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof SWAMP_ART !== 'undefined') SWAMP_ART.buildInto(ctx);
    },

    mobVerbs: {
      leechLatch: function (scene, m, player, time) { return scene._swLeech(m, player, time); },
      turtleSnap: function (scene, m, player, time) { return scene._swTurtle(m, player, time); },
      myconidSpores: function (scene, m, player, time) { return scene._swMyconid(m, player, time); },
      toadMortar: function (scene, m, player, time) { return scene._swToad(m, player, time); },
      serpentStrike: function (scene, m, player, time) { return scene._swSerpent(m, player, time); },
      spriteHeal: function (scene, m, player, time) { return scene._swSprite(m, player, time); },
      impSmash: function (scene, m, player, time) { return scene._swImp(m, player, time); },
      mimicHopSpew: function (scene, m, player, time) { return scene._swMimic(m, player, time); },
      mossbackWake: function (scene, m, player, time) { return scene._swMossback(m, player, time); }
    },

    scene: (typeof SWAMP_SCENE !== 'undefined') ? SWAMP_SCENE : {}
  });
})();
