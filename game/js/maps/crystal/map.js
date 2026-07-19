// ============================================================================
// game/js/maps/crystal/map.js — CRYSTAL CAVERNS (realm 10) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-16). Sparkle adventure: bright
// gems on dark cave. Numbers TUNE ME, pitched a notch above pirate. THE
// SHARDLORD's rainbow core IS the telegraph language (color = attack).
// ============================================================================
(function () {
  'use strict';

  // ---- "CAVERN OF WONDERS" — 8-bit sparkle adventure (Red-approved WAV).
  // Port of assets/render/render_crystal_theme.js as a section composer:
  // 88 BPM C major, 66 bars = 264 beats = EXACTLY 180.0s. Eleven monophonic
  // chip voices, EXACTLY 4 beats per bar per track (asserted). Music-box
  // glitter arps over a bouncing octave bass, a soaring chorus with a low
  // counter-line, the ECHO CAVE break (the cave answers back), an octave-up
  // bright verse, the grand finale with pads, and a music-box outro.
  var CAVERN_OF_WONDERS = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [36, 35, 33, 29], CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [53, 57, 60]];
    var MEL_A = [
      [72, -1, 76, 74, 72, -1, 67, 69], [71, -1, 74, 72, 71, -1, 67, -1],
      [69, -1, 72, 71, 69, -1, 64, 67], [65, 67, 69, -1, 71, -1, 72, -1]
    ];
    var MEL_B = [
      [76, -1, 79, -1, 76, 74, 72, 74], [74, -1, 79, -1, 74, 72, 71, 72],
      [72, 74, 76, -1, 72, -1, 69, 72], [67, -1, 71, -1, 72, -1, -1, -1]
    ];
    function arpNotes(chord) { var c = chord.map(function (m) { return m + 12; }); return [c[0], c[1], c[2], c[1], c[2], c[1], c[0], c[1]]; }
    function sec(b) {
      if (b < 4) return { glitter: true };
      if (b < 12) return { drums: true, bass: true, mel: 'A', glitter: true };
      if (b < 20) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true };
      if (b < 28) return { drums: true, bass: true, mel: 'A', glitter: true };
      if (b < 36) return { drums: 'half', bass: true, echo: true, glitter: 'slow' };
      if (b < 44) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true };
      if (b < 52) return { drums: true, bass: true, mel: 'A', glitter: true, up: 12, counter: true };
      if (b < 62) return { drums: true, bass: true, mel: 'B', glitter: true, counter: true, up: 12, big: true };
      return { glitter: 'slow' };
    }
    var DOORS = { 4: 1, 12: 1, 20: 1, 28: 1, 36: 1, 44: 1, 52: 1, 62: 1 };
    var BASS_P = [0, 12, 0, 12, 0, 12, 7, 12];
    var ECHO_CALL = [79, 76, 81, 74];
    var glit = [], lead = [], bass = [], kick = [], snap = [], tick = [],
        counter = [], pad1 = [], pad2 = [], echoT = [], door = [];
    var KK = m2n(26), SN = 'A#7', TK = 'C8';
    for (var b = 0; b < 66; b++) {
      var s = sec(b), t = b % 4, isLast = b === 65;
      var root = ROOTS[t], chord = CH[t];
      // music-box glitter arps
      if (s.glitter && !isLast) {
        var notes = arpNotes(chord);
        if (s.glitter === 'slow') { for (var e = 0; e < 8; e++) glit.push([m2n(notes[e % 8] + 24), 0.5]); }
        else { for (var e1 = 0; e1 < 16; e1++) glit.push([m2n(notes[e1 % 8] + 24), 0.25]); }
      } else glit.push([null, 4]);
      // bright lead
      var line = s.mel === 'A' ? MEL_A[t] : s.mel === 'B' ? MEL_B[t] : null;
      if (line) {
        for (var e2 = 0; e2 < 8; e2++) {
          var m = line[e2];
          lead.push(m < 0 ? [null, 0.5] : [m2n(m + (s.up || 0)), 0.5]);
        }
      } else lead.push([null, 4]);
      // bouncing octave bass
      if (s.bass) { for (var e3 = 0; e3 < 8; e3++) bass.push([m2n(root + BASS_P[e3]), 0.5]); }
      else bass.push([null, 4]);
      // bouncy kick 1+3, snap 2+4, glitter ticks on the off-8ths
      if (s.drums === 'half') { kick.push([KK, 0.12], [null, 3.88]); snap.push([null, 4]); }
      else if (s.drums) {
        kick.push([KK, 0.12], [null, 1.88], [KK, 0.12], [null, 1.88]);
        snap.push([null, 1], [SN, 0.08], [null, 1.92], [SN, 0.08], [null, 0.92]);
      } else { kick.push([null, 4]); snap.push([null, 4]); }
      if (s.drums) { for (var e4 = 0; e4 < 4; e4++) tick.push([null, 0.5], [TK, 0.08], [null, 0.42]); }
      else tick.push([null, 4]);
      // low answering counter-line
      if (s.counter) counter.push([null, 0.5], [m2n(chord[0] - 12), 0.8], [null, 1.2], [m2n(chord[2] - 12), 0.8], [null, 0.7]);
      else counter.push([null, 4]);
      // finale pads (+ the deep cave swell under the echo)
      pad1.push(s.big ? [m2n(chord[0]), 4] : (s.echo && t === 3 ? [m2n(48), 4] : [null, 4]));
      pad2.push(s.big ? [m2n(chord[2]), 4] : [null, 4]);
      // ECHO CAVE: chime calls, the cave answers with fading echoes
      if (s.echo) {
        var call = ECHO_CALL[t];
        echoT.push([null, 0.5], [m2n(call), 0.8], [null, 0.45], [m2n(call), 0.8], [null, 0.45], [m2n(call - 12), 0.8], [null, 0.2]);
      } else echoT.push([null, 4]);
      // section-door rising chimes + the final grand chord
      if (isLast) door.push([null, 1], [m2n(72), 0.12], [m2n(76), 0.12], [m2n(79), 0.12], [m2n(84), 2.64]);
      else if (DOORS[b]) door.push([m2n(84), 0.16], [m2n(88), 0.16], [m2n(91), 0.5], [null, 3.18]);
      else door.push([null, 4]);
    }
    var TR = [glit, lead, bass, kick, snap, tick, counter, pad1, pad2, echoT, door];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 264) > 1e-6) throw new Error('CAVERN OF WONDERS track beat mismatch: ' + sum);
    });
    return {
      bpm: 88,
      tracks: [
        { type: 'square',   vol: 0.035, notes: glit },    // music-box glitter
        { type: 'square',   vol: 0.08,  notes: lead },    // bright lead
        { type: 'triangle', vol: 0.13,  notes: bass },    // bouncing octaves
        { type: 'triangle', vol: 0.15,  notes: kick },    // bouncy kick
        { type: 'square',   vol: 0.02,  notes: snap },    // snap-claps
        { type: 'square',   vol: 0.014, notes: tick },    // off-8th ticks
        { type: 'triangle', vol: 0.09,  notes: counter }, // low answers
        { type: 'square',   vol: 0.022, notes: pad1 },    // finale pads + cave swell
        { type: 'square',   vol: 0.018, notes: pad2 },
        { type: 'triangle', vol: 0.09,  notes: echoT },   // echo-cave calls
        { type: 'triangle', vol: 0.07,  notes: door }     // section chimes + finale
      ]
    };
  })();

  MAPS.register({
    id: 'crystal',

    installData: function (DATA) {
      DATA.biomes.crystal = {
        name: 'Crystal Caverns', tile: 'kcrystal',
        mobs: ['shardling', 'amethystLurker', 'geodeGolem', 'shatterbat', 'quartzRam',
               'resonator', 'gemwingMoth', 'deepCrawler', 'voidgemHorror']
      };
      DATA.realms.crystal = {
        name: 'Crystal Caverns', biome: 'crystal', boss: 'shardlord',
        kind: 'crystal', music: 'crystal',
        grow: { shatterDmg: 14 },                            // boss GROWING WALLS shard-ring dmg
        // CRYSTAL BOMB knobs (M9e spiral map) — ALL TUNE ME. bigHp = heavy
        // commitment (~28 arrow hits); big crystal WIPES all mobs (no credit).
        // Smalls: TRIPLED blast radius + 3x boom; all crystals RESPAWN (smalls
        // keep respawning through the boss fight). A small blown up BESIDE the
        // boss (within stunR) STUNS him for stunMs. Crystal-like DECOR is
        // destructible too (same small behaviour).
        bomb: { bigHp: 300, smallHp: 40, aoeR: 450, aoeDmg: 55, boomSize: 3.0,
                smashDmg: 5, smashMs: 320, respawnMs: 9000, bigRespawnMs: 18000,
                stunR: 200, stunMs: 1000 }
      };
      // ---- the 9 mobs (Red picks #1 4 5 6 10 12 13 15 20) ----
      DATA.mobs.shardling = { name: 'Shardling', texture: 'shardlingHi', hp: 14, spd: 115, xp: 4, cost: 1,
        deathTint: 0xffd0e8, chase: { contactDmg: 6 } };
      DATA.mobs.amethystLurker = { name: 'Amethyst Lurker', texture: 'amethystLurkerHi', hp: 58, spd: 85, xp: 24, cost: 3,
        deathTint: 0xa06bf0, chase: { contactDmg: 12 },
        lunge: { range: 220, windupMs: 600, dashMs: 240, dashSpeed: 400, cooldownMs: 3400 },
        mapVerb: 'lurkerWake',                                // disguised until you're close
        lurk: { wakeRange: 170, warnMs: 700 },
        unlockAt: 30 };
      DATA.mobs.geodeGolem = { name: 'Geode Golem', texture: 'geodeGolemHi', hp: 120, spd: 40, xp: 32, cost: 4,
        deathTint: 0x6e6484, chase: { contactDmg: 16 },
        mapVerb: 'golemSlam',                                 // warned slam; CORE takes rear bonus
        pound: { range: 200, everyMs: 4800, warnMs: 1000, radius: 92, dmg: 22 },
        maxConcurrent: 2, unlockAt: 55 };
      DATA.mobs.shatterbat = { name: 'Shatterbat', texture: 'shatterbatHi', hp: 28, spd: 110, xp: 14, cost: 2,
        deathTint: 0x5ae8e0, float: true, chase: { contactDmg: 8 },
        lunge: { range: 300, windupMs: 500, dashMs: 260, dashSpeed: 420, cooldownMs: 3000 },
        mapVerb: 'batScreech',                                // telegraphed slow-cone
        screech: { everyMs: 5600, range: 240, warnMs: 850, halfRad: 0.5, dmg: 10, slowMs: 1400 },
        unlockAt: 20 };
      DATA.mobs.quartzRam = { name: 'Quartz Ram', texture: 'quartzRamHi', hp: 62, spd: 60, xp: 22, cost: 3,
        deathTint: 0xff7ab8, chase: { contactDmg: 14 },
        mapVerb: 'ramCharge',                                 // warned lane, then CHARGE (wraps!)
        charge: { everyMs: 5400, range: 460, warnMs: 900, len: 700, half: 24, chargeMs: 1100, speed: 430 },
        unlockAt: 40 };
      DATA.mobs.resonator = { name: 'Resonator', texture: 'resonatorHi', hp: 48, spd: 5, xp: 20, cost: 3,
        deathTint: 0xa06bf0, chase: { contactDmg: 6 },
        mapVerb: 'resonate',                                  // plants; expanding rings
        pulse: { everyMs: 3800, range: 420, growMs: 1700, maxR: 240, dmg: 14 },
        maxConcurrent: 3, unlockAt: 35 };
      DATA.mobs.gemwingMoth = { name: 'Gemwing Moth', texture: 'gemwingMothHi', hp: 30, spd: 48, xp: 16, cost: 2,
        deathTint: 0xffd0e8, float: true, chase: { contactDmg: 7 },
        mapVerb: 'mothDust',                                  // sheds glitter-dust slow patches
        dust: { everyMs: 2600, radius: 60, lifeMs: 5200 },
        unlockAt: 25 };
      DATA.mobs.deepCrawler = { name: 'Deep Crawler', texture: 'deepCrawlerHi', hp: 52, spd: 95, xp: 22, cost: 3,
        deathTint: 0x38286e, chase: { contactDmg: 13 },
        mapVerb: 'crawlerSnip',                               // double-pincer snip cone
        snip: { everyMs: 4400, range: 150, warnMs: 700, halfRad: 0.7, dmg: 18 },
        unlockAt: 45 };
      DATA.mobs.voidgemHorror = { name: 'Voidgem Horror', texture: 'voidgemHorrorHi', hp: 130, spd: 42, xp: 46, cost: 5,
        deathTint: 0x38286e, float: true, chase: { contactDmg: 16 },
        mapVerb: 'voidBeam',                                  // short warned beam sweeps
        beam: { everyMs: 6200, range: 380, warnMs: 950, gapMs: 300, stepRad: 0.5, len: 360, half: 20, dmg: 20 },
        maxConcurrent: 1, unlockAt: 80 };

      // ---- THE SHARDLORD · HEART OF THE MOUNTAIN (mapOwned colossus;
      // the RAINBOW CORE locks a color — each color is one attack) ----
      DATA.bosses.shardlord = {
        name: 'The Shardlord', texture: 'shardlordHi',
        hp: 3600, spd: 30, xp: 500, contactDmg: 20, deathTint: 0xff7ab8,
        lootTable: 'shardlord',
        mapOwned: true, entranceMs: 3000,
        patterns: {
          colorEveryMs: 5600, colorLockMs: 700,
          shardVolley:       { count: 5, warnMs: 1150, radius: 70, dmg: 22, scatter: 190 },
          crystalLance:      { count: 3, spreadRad: 0.4, len: 520, half: 22, warnMs: 1000, gapMs: 260, dmg: 24 },
          growingWalls:      { count: 2, wallMs: 5000 },
          quakeFists:        { gapMs: 700, growMs: 2000, maxR: 340, dmg: 22 },
          geodeHatch:        { count: 4, cap: 10 },
          prismaticOverload: { everyMs: 26000, firstDelayMs: 17000, range: 420, warnMs: 1200,
                               gapMs: 650, dmg: 26, ventMs: 3500, ventDmgMult: 1.5 },
          overclock:         { hpPct: 0.3, rateMult: 0.7 }
        },
        title: 'HEART OF THE MOUNTAIN',
        hints: [
          'A crowned colossus of living geode. The RAINBOW CORE in his chest speaks first — watch its color.',
          'PINK: shards rain on warned circles. CYAN: lance beams rake locked lanes.',
          'PURPLE: crystal walls GROW inside the arena and re-route you — they shatter on their own.',
          'AMBER: his fists quake the floor into expanding rings. Hop between them.',
          'GREEN: living geodes crack open and shardlings pour out. Thin them before the next color.',
          'PRISMATIC OVERLOAD sweeps five colored cones around the wheel. When the core burns out GREY he kneels — unload.'
        ]
      };
      DATA.dropTables.shardlord = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6) + the theme ----
      DATA.audio.sounds.crystalgrow = { type: 'triangle', freq: 320, freqEnd: 880, len: 0.9, vol: 0.13, limitMs: 1000,
                                        noise: { vol: 0.04, hp: 300 } };
      DATA.audio.sounds.shatterburst = { type: 'square', freq: 1600, freqEnd: 500, len: 0.3, vol: 0.15, limitMs: 350,
                                         noise: { vol: 0.1, hp: 2600 } };
      DATA.audio.sounds.ramclatter = { type: 'triangle', freq: 200, freqEnd: 110, len: 0.4, vol: 0.16, limitMs: 450,
                                       noise: { vol: 0.08, hp: 900 } };
      DATA.audio.sounds.resonring = { type: 'triangle', arp: [660, 880, 660], len: 0.5, vol: 0.12, limitMs: 550 };
      DATA.audio.sounds.batscreech = { type: 'square', freq: 2000, freqEnd: 1100, len: 0.3, vol: 0.11, limitMs: 400 };
      DATA.audio.sounds.voidhum = { type: 'sawtooth', freq: 90, freqEnd: 220, len: 0.9, vol: 0.13, limitMs: 1000 };
      DATA.audio.sounds.colorchime = { type: 'triangle', arp: [880, 1175, 1760], len: 0.35, vol: 0.14, limitMs: 380 };
      DATA.audio.sounds.staldrop = { type: 'triangle', freq: 240, freqEnd: 70, len: 0.3, vol: 0.17, limitMs: 350,
                                     noise: { vol: 0.07, hp: 500 } };
      DATA.audio.music.crystal = CAVERN_OF_WONDERS;

      MAPS.addConsoleMap(DATA, { id: 'crystal', name: 'CRYSTAL CAVERNS',
        sub: 'the mountain has a heart, and it is angry', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof CRYSTAL_ART !== 'undefined') CRYSTAL_ART.buildInto(ctx);
    },

    mobVerbs: {
      lurkerWake: function (scene, m, player, time) { return scene._cryLurker(m, player, time); },
      golemSlam: function (scene, m, player, time) { return scene._cryGolem(m, player, time); },
      batScreech: function (scene, m, player, time) { return scene._cryBat(m, player, time); },
      ramCharge: function (scene, m, player, time) { return scene._cryRam(m, player, time); },
      resonate: function (scene, m, player, time) { return scene._cryResonator(m, player, time); },
      mothDust: function (scene, m, player, time) { return scene._cryMoth(m, player, time); },
      crawlerSnip: function (scene, m, player, time) { return scene._cryCrawler(m, player, time); },
      voidBeam: function (scene, m, player, time) { return scene._cryHorror(m, player, time); }
    },

    scene: (typeof CRYSTAL_SCENE !== 'undefined') ? CRYSTAL_SCENE : {}
  });
})();
