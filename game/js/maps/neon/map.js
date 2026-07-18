// ============================================================================
// game/js/maps/neon/map.js — NEON CITY (realm 17) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). Rain-slick cyberpunk
// rooftops; the boss pivot: the Apache is the ENTRANCE — it crashes onto the
// helipad and the SOCIAL ENGINEER (techno kid hacker) steps off. Numbers
// TUNE ME. Toroidal wrap ON (street canyon W-E, mirror promenade N-S).
// ============================================================================
(function () {
  'use strict';

  // ---- "NIGHT DRIVE.EXE" — synthwave night drive (TAKE 1, RED-APPROVED
  // "great"). Port of assets/render/render_neon_theme.js as a section
  // composer: 116 BPM A minor (Am-F-C-G), 87 bars x 4 = 348 beats = EXACTLY
  // 180.0s. NO SLOW INTRO — kick + octave bass + sidechain pads + lead hook
  // ALL from bar 0. A hook(0-15) -> B arp hook(16-31) -> CHORUS(32-47) ->
  // moody tri bridge(48-63) -> chorus + octave shimmer(64-79) -> outro +
  // Am ring(80-86).
  var NIGHT_DRIVE = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [45, 41, 48, 43];                     // A2 F2 C3 G2
    var CHORDS = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
    var ARPN = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]];
    // per-bar melodic CELLS (each sums to EXACTLY 4 beats)
    var HOOK = [
      [[69, 1], [72, .5], [74, .5], [76, 1.5], [74, .5]],
      [[72, 1], [69, .5], [72, .5], [77, 2]],
      [[76, 1], [72, .5], [76, .5], [79, 2]],
      [[79, 1], [76, .5], [74, .5], [71, 2]]
    ];
    var CHORUS = [
      [[81, .75], [79, .75], [76, .5], [79, 1], [81, 1]],
      [[77, 1.5], [76, .5], [74, 1], [76, 1]],
      [[79, 1.5], [76, .5], [72, 1], [76, 1]],
      [[74, 2], [71, 2]]
    ];
    var BRIDGE = [
      [[64, 2], [65, 1], [67, 1]],
      [[69, 2], [72, 1], [71, 1]],
      [[72, 2], [74, 1], [76, 1]],
      [[74, 2.5], [71, 1.5]]
    ];
    var KK = m2n(28), HO = 'A7', HC = 'C8';
    var kick = [], hatO = [], hatC = [], bass = [], arp = [], leadA = [], leadB = [],
        pad1 = [], pad2 = [], sub = [], flavor = [];
    function pushCell(track, cell, oct) {
      cell.forEach(function (nv) { track.push([nv[0] == null ? null : m2n(nv[0] + (oct || 0)), nv[1]]); });
    }
    var DOORS = { 16: 1, 32: 1, 48: 1, 64: 1, 80: 1 };
    for (var b = 0; b < 87; b++) {
      var t = b % 4, root = ROOTS[t], chord = CHORDS[t], arpn = ARPN[t];
      var sec = b < 16 ? 'A' : b < 32 ? 'B' : b < 48 ? 'C' : b < 64 ? 'D' : b < 80 ? 'E' : 'F';
      var last = (b === 86);
      // four-on-the-floor (full stack from bar 0)
      for (var k = 0; k < 4; k++) kick.push([KK, 0.12], [null, 0.88]);
      // offbeat open hats
      for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [HO, 0.1], [null, 0.4]);
      // 16th closed shimmer (C/D/E)
      if (sec === 'C' || sec === 'D' || sec === 'E') { for (var hc = 0; hc < 8; hc++) hatC.push([null, 0.25], [HC, 0.08], [null, 0.17]); }
      else hatC.push([null, 4]);
      // driving synthwave bass: 8ths, root/octave bounce
      var pat = [0, 0, 12, 0, 0, 12, 0, 12];
      for (var e = 0; e < 8; e++) bass.push([m2n(root - 12 + pat[e]), 0.43], [null, 0.07]);
      // 16th arps (B/C/E/F)
      if (sec === 'B' || sec === 'C' || sec === 'E' || sec === 'F') {
        var seqIdx = [0, 1, 2, 3, 2, 1];
        for (var s = 0; s < 16; s++) arp.push([m2n(arpn[seqIdx[s % 6]] + 12), 0.21], [null, 0.04]);
      } else arp.push([null, 4]);
      // LEAD (voice 1) — hook / chorus / bridge / outro
      var cell = (sec === 'C' || sec === 'E') ? CHORUS[t] : (sec === 'D') ? BRIDGE[t] : HOOK[t];
      pushCell(leadA, cell, 0);
      // LEAD (voice 2) — octave double, only in the E reprise
      if (sec === 'E') pushCell(leadB, CHORUS[t], 12); else leadB.push([null, 4]);
      // sidechain-pumped pads: chopped 8ths, chord tones
      for (var p = 0; p < 8; p++) { pad1.push([m2n(chord[0]), 0.35], [null, 0.15]); pad2.push([m2n(chord[2]), 0.35], [null, 0.15]); }
      // drop sub layer (E reprise + outro punch)
      sub.push((sec === 'E' || last) ? [m2n(root - 12), 4] : [null, 4]);
      // section doors (rising blips) + final Am ring
      if (last) flavor.push([m2n(81), 2.4], [null, 1.6]);
      else if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else flavor.push([null, 4]);
    }
    var TR = [kick, hatO, hatC, bass, arp, leadA, leadB, pad1, pad2, sub, flavor];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 348) > 1e-6) throw new Error('NIGHT DRIVE track beat mismatch: ' + sum);
    });
    if (Math.abs(348 * 60 / 116 - 180) > 1e-9) throw new Error('NIGHT DRIVE not 180.0s');
    return {
      bpm: 116,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },
        { type: 'square',   vol: 0.014, notes: hatO },
        { type: 'square',   vol: 0.008, notes: hatC },
        { type: 'square',   vol: 0.09,  notes: bass },
        { type: 'square',   vol: 0.028, notes: arp },
        { type: 'square',   vol: 0.06,  notes: leadA },
        { type: 'sawtooth', vol: 0.03,  notes: leadB },
        { type: 'square',   vol: 0.022, notes: pad1 },
        { type: 'square',   vol: 0.018, notes: pad2 },
        { type: 'triangle', vol: 0.08,  notes: sub },
        { type: 'triangle', vol: 0.05,  notes: flavor }
      ]
    };
  })();

  MAPS.register({
    id: 'neon',

    installData: function (DATA) {
      DATA.biomes.neon = {
        name: 'Neon City', tile: 'netRoof',
        mobs: ['streetPunk', 'spyDrone', 'riotEnforcer', 'netrunner', 'turretPod',
               'cyberRats', 'cargoLifter', 'neonViper', 'exoLoader']
      };
      DATA.realms.neon = {
        name: 'Neon City', biome: 'neon', boss: 'socialEngineer',
        kind: 'neon', music: 'neon',
        // FIRE ESCAPE railings = this map's destructible fences
        fence: { hp: 24, chewDmg: 8, chewMs: 450, regrowMs: null },
        // KINGPIN'S PATROL — the signature map cycle (PLAN §2). ALL TUNE ME.
        patrol: { periodMs: 60000, warnMs: 2600, laneCount: 3, laneHalf: 30, laneDmg: 20,
                  circleCount: 4, circleR: 66, circleDmg: 22, strikeGapMs: 320, firstAtMs: 9000 },
        // POP-UP AD walls (boss summon) — 4 deterioration states
        adWall: { count: 3, states: 4, hp: 40, lifeMs: 9000 },
        // FIREWALL drones — the boss's untouchable-gate
        drone: { count: 3, hp: 24, respawnMs: 8000, orbitR: 92, orbitSpd: 0.0016 }
      };

      // ---- the NINE mobs (Red picks #1 3 4 5 9 10 14 18 19) ----
      DATA.mobs.streetPunk = { name: 'Street Punk', texture: 'neonPunkHi', hp: 26, spd: 105, xp: 6, cost: 1,
        deathTint: 0xff2e88, chase: { contactDmg: 7 },
        mapVerb: 'punkSwing',                                 // chain spin-up glint -> short warned arc
        swing: { everyMs: 4200, range: 96, warnMs: 620, halfRad: 0.85, dmg: 12, kb: 220 } };
      DATA.mobs.spyDrone = { name: 'Spy Drone', texture: 'neonDroneHi', hp: 20, spd: 120, xp: 10, cost: 1,
        deathTint: 0x22d6ee, float: true,                     // flyer, pops in one burst — NO chase
        mapVerb: 'droneLaser',                                // thin aim-line -> laser along it
        laser: { hover: 240, everyMs: 3600, warnMs: 900, len: 460, half: 12, dmg: 16, fireMs: 220 },
        unlockAt: 15 };
      DATA.mobs.riotEnforcer = { name: 'Riot Enforcer', texture: 'neonEnforcerHi', hp: 120, spd: 60, xp: 20, cost: 3,
        deathTint: 0x22d6ee, chase: { contactDmg: 12 },
        mapVerb: 'enforcerShove',                             // frontal shield BLOCK + warned baton shove
        enforcer: { frontArc: 1.2, everyMs: 4600, range: 130, warnMs: 780, halfRad: 0.6, dmg: 18, kb: 360 },
        unlockAt: 30 };
      DATA.mobs.netrunner = { name: 'Netrunner', texture: 'neonNetrunnerHi', hp: 40, spd: 55, xp: 16, cost: 2,
        deathTint: 0x39ff6a, float: true,                     // fragile up close — flees, NO chase
        mapVerb: 'netrunnerZone',                             // paints warned GLITCH ZONES -> detonate
        zone: { everyMs: 5000, range: 340, count: 2, radius: 70, warnMs: 950, dmg: 16, fleeRange: 150 },
        unlockAt: 25 };
      DATA.mobs.turretPod = { name: 'Turret Pod', texture: 'neonTurretHi', hp: 90, spd: 0, xp: 18, cost: 2,
        deathTint: 0xff3a4a,                                  // ANCHORED — can't move; NO chase
        mapVerb: 'turretLanes',                               // rises from vent -> warned laser LANES in sequence
        turret: { riseMs: 900, everyMs: 6000, laneCount: 3, warnMs: 850, gapMs: 420, len: 480, half: 14, dmg: 16 },
        maxConcurrent: 3, unlockAt: 40 };
      DATA.mobs.cyberRats = { name: 'Cyber Rats', texture: 'neonRatsHi', hp: 14, spd: 130, xp: 4, cost: 1,
        deathTint: 0x39ff6a, chase: { contactDmg: 4 },        // cheap swarm tide
        mapVerb: 'ratScuttle',                                // erratic skitter dashes
        scuttle: { everyMs: 1400, dashMs: 260, dashSpeed: 300 },
        maxConcurrent: 8, unlockAt: 20 };
      DATA.mobs.cargoLifter = { name: 'Cargo Lifter', texture: 'neonLifterHi', hp: 110, spd: 70, xp: 26, cost: 3,
        deathTint: 0xffb02e, float: true,                     // flyer spawner — NO chase
        mapVerb: 'lifterDrop',                                // warned drop circles -> crates burst into punks
        drop: { everyMs: 6400, range: 460, count: 2, warnMs: 1000, radius: 60, childCap: 4, childKey: 'streetPunk' },
        maxConcurrent: 2, unlockAt: 50 };
      DATA.mobs.neonViper = { name: 'Neon Viper', texture: 'neonViperHi', hp: 55, spd: 100, xp: 22, cost: 3,
        deathTint: 0x39ff6a, chase: { contactDmg: 10 },
        mapVerb: 'viperDash',                                 // dash leaves a LIGHT TRAIL hazard line (short life)
        dash: { everyMs: 4600, range: 380, warnMs: 520, dashMs: 380, dashSpeed: 440,
                trailMs: 1500, trailDmg: 12, trailTickMs: 400, segMax: 14 },
        unlockAt: 45 };
      DATA.mobs.exoLoader = { name: 'Exo Loader', texture: 'neonLoaderHi', hp: 320, spd: 55, xp: 55, cost: 5,
        deathTint: 0xffb02e, chase: { contactDmg: 18 },
        mapVerb: 'loaderCombo',                               // warned charge lane -> warned slam circle
        combo: { everyMs: 5200, range: 470, chargeWarnMs: 900, chargeLen: 520, chargeMs: 1100, chargeSpeed: 430,
                 chargeHalf: 26, slamWarnMs: 1000, slamRadius: 110, slamDmg: 24 },
        maxConcurrent: 1, unlockAt: 55 };

      // ---- THE SOCIAL ENGINEER · techno kid hacker (mapOwned) ----
      DATA.bosses.socialEngineer = {
        name: 'Social Engineer', texture: 'neonBossHi',
        hp: 3600, spd: 40, xp: 560, contactDmg: 16, deathTint: 0xffb02e,
        lootTable: 'socialEngineer',
        mapOwned: true, entranceMs: 3400,
        patterns: {
          verbEveryMs: 5200,
          firewall:    { count: 3, hp: 24, respawnMs: 8000, orbitR: 92, orbitSpd: 0.0016 },
          ddosDarts:   { count: 3, dmg: 14, projSpeed: 150, lifeMs: 3200, turnRate: 0.9, gapMs: 260 },
          popupAds:    { count: 3, hp: 40, lifeMs: 9000, blockR: 26 },
          remoteAccess:{ count: 2 },
          systemBreach:{ cols: 4, rows: 4, cellR: 46, warnMs: 1100, spreadGapMs: 160, dmg: 26,
                         glitchMs: 2600, ventMs: 3600, ventDmgMult: 1.5 },
          backup:      { hpPct: 0.5 }
        },
        title: 'SOCIAL ENGINEER',
        hints: [
          'POP THE DRONES — the firewall bubble makes him UNTOUCHABLE; he is naked without them.',
          'His POP-UP AD walls block YOUR shots, not his darts — shoot through the hole once one breaks.',
          "BREACH ZONES show a spreading grid before they fire — keep moving, don't stand in the pattern.",
          'HACKED TURRETS share his glow and die with him — dodge their lanes, focus the deck.',
          'DECK SMOKING = HIT HIM NOW: after SYSTEM BREACH he overheats, drones drop, he takes 1.5x.',
          'His BACKUP telegraphs — below half HP the patrol chopper rakes the pad; watch the searchlight.'
        ]
      };
      DATA.dropTables.socialEngineer = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.chainswing = { type: 'square', freq: 520, freqEnd: 150, len: 0.22, vol: 0.13, limitMs: 280 };
      DATA.audio.sounds.dronelaser = { type: 'sawtooth', freq: 2200, freqEnd: 1400, len: 0.3, vol: 0.08, limitMs: 350,
                                       noise: { vol: 0.05, hp: 2600 } };
      DATA.audio.sounds.shieldclang = { type: 'square', freq: 900, freqEnd: 260, len: 0.2, vol: 0.14, limitMs: 250,
                                        noise: { vol: 0.06, hp: 1600 } };
      DATA.audio.sounds.batonshove = { type: 'square', freq: 300, freqEnd: 120, len: 0.24, vol: 0.14, limitMs: 300 };
      DATA.audio.sounds.glitchcharge = { type: 'square', freq: 220, freqEnd: 620, len: 0.5, vol: 0.09, limitMs: 600 };
      DATA.audio.sounds.glitchdet = { type: 'square', freq: 1400, freqEnd: 300, len: 0.24, vol: 0.14, limitMs: 280,
                                      noise: { vol: 0.08, hp: 1800 } };
      DATA.audio.sounds.turretsweep = { type: 'sawtooth', freq: 1800, freqEnd: 900, len: 0.4, vol: 0.08, limitMs: 450 };
      DATA.audio.sounds.ratchitter = { type: 'square', arp: [1200, 1600, 1200, 1800], len: 0.3, vol: 0.06, limitMs: 350 };
      DATA.audio.sounds.cratedrop = { type: 'triangle', freq: 200, freqEnd: 70, len: 0.4, vol: 0.15, limitMs: 450,
                                      noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.viperdash = { type: 'sawtooth', freq: 900, freqEnd: 1600, len: 0.2, vol: 0.08, limitMs: 250 };
      DATA.audio.sounds.loaderslam = { type: 'sawtooth', freq: 90, freqEnd: 200, len: 0.7, vol: 0.15, limitMs: 800,
                                       noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.patrolrotor = { type: 'triangle', freq: 60, freqEnd: 120, len: 0.9, vol: 0.12, limitMs: 1000,
                                        noise: { vol: 0.06, hp: 300 } };
      DATA.audio.sounds.searchping = { type: 'square', freq: 1400, freqEnd: 1900, len: 0.16, vol: 0.1, limitMs: 220 };
      DATA.audio.sounds.strafe = { type: 'sawtooth', freq: 600, freqEnd: 140, len: 0.3, vol: 0.13, limitMs: 340,
                                   noise: { vol: 0.1, hp: 700 } };
      DATA.audio.sounds.crashwhine = { type: 'sawtooth', freq: 1400, freqEnd: 200, len: 1.1, vol: 0.14, limitMs: 1200,
                                       noise: { vol: 0.12, hp: 500 } };
      DATA.audio.sounds.deckkeys = { type: 'square', arp: [880, 1100, 990, 1320], len: 0.24, vol: 0.08, limitMs: 300 };
      DATA.audio.sounds.ddoszip = { type: 'square', freq: 1600, freqEnd: 700, len: 0.18, vol: 0.1, limitMs: 220 };
      DATA.audio.sounds.adwallpop = { type: 'square', freq: 1200, freqEnd: 400, len: 0.22, vol: 0.13, limitMs: 260,
                                      noise: { vol: 0.08, hp: 1600 } };
      DATA.audio.sounds.turrethack = { type: 'square', arp: [660, 990, 1320], len: 0.3, vol: 0.1, limitMs: 340 };
      DATA.audio.sounds.breachslam = { type: 'sawtooth', freq: 160, freqEnd: 60, len: 0.6, vol: 0.16, limitMs: 700,
                                       noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.ventalarm = { type: 'square', arp: [1320, 990, 1320, 990], len: 0.5, vol: 0.1, limitMs: 600 };
      DATA.audio.sounds.dronepop = { type: 'square', freq: 800, freqEnd: 200, len: 0.18, vol: 0.13, limitMs: 220,
                                     noise: { vol: 0.07, hp: 1400 } };
      DATA.audio.sounds.dronehum = { type: 'triangle', freq: 320, freqEnd: 360, len: 0.4, vol: 0.06, limitMs: 450 };
      DATA.audio.music.neon = NIGHT_DRIVE;

      MAPS.addConsoleMap(DATA, { id: 'neon', name: 'NEON CITY',
        sub: 'the roofs are lonely', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof NEON_ART !== 'undefined') NEON_ART.buildInto(ctx);
    },

    mobVerbs: {
      punkSwing: function (scene, m, player, time) { return scene._nePunk(m, player, time); },
      droneLaser: function (scene, m, player, time) { return scene._neDrone(m, player, time); },
      enforcerShove: function (scene, m, player, time) { return scene._neEnforcer(m, player, time); },
      netrunnerZone: function (scene, m, player, time) { return scene._neNetrunner(m, player, time); },
      turretLanes: function (scene, m, player, time) { return scene._neTurret(m, player, time); },
      ratScuttle: function (scene, m, player, time) { return scene._neRats(m, player, time); },
      lifterDrop: function (scene, m, player, time) { return scene._neLifter(m, player, time); },
      viperDash: function (scene, m, player, time) { return scene._neViper(m, player, time); },
      loaderCombo: function (scene, m, player, time) { return scene._neLoader(m, player, time); }
    },

    scene: (typeof NEON_SCENE !== 'undefined') ? NEON_SCENE : {}
  });
})();
