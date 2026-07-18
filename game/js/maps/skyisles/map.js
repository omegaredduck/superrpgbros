// ============================================================================
// game/js/maps/skyisles/map.js — STORM SKY ISLES (realm 5) data + registration.
// Every pick is Red's (PLAN.md, locked 2026-07-15). Balance numbers are all
// TUNE ME first-pass, pitched a notch above the factory (biome 5).
// Registers via the M7 registry: installData merges the rows, buildArt
// delegates to art.js, scene hooks delegate to scene.js.
// ============================================================================
(function () {
  'use strict';

  // ---- "SKYBREAKER MARCH" — 8-bit airship battle march (Red-approved WAV).
  // Port of assets/render/render_sky_theme.js as a data-side section composer:
  // 140 BPM, D minor (Dm–Bb–F–A7), 105 bars = 420 beats = EXACTLY 180.0s.
  // Seven monophonic chip voices; every track emits EXACTLY 4 beats per bar
  // (equal-beat by construction, asserted below). March drums are faked in
  // chip voices (the music engine is oscillators-only): kick = short low
  // triangle thump on 1 & 3, snare = short high square tick on 2 & 4.
  var SKYBREAKER = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [50, 46, 41, 45];                                      // D3 Bb2 F2 A2
    var CH = [[62, 65, 69], [58, 62, 65], [57, 60, 65], [57, 61, 64]]; // Dm Bb F A7
    // leads: 8 eighths per bar, -1 = rest (render script, verbatim)
    var LEAD_A = [
      [74, -1, 74, 72, 74, 77, 74, 72], [77, -1, 77, 74, 77, 82, 77, 74],
      [72, -1, 72, 69, 72, 77, 76, 74], [73, 73, 69, 73, 76, 73, 76, 79]
    ];
    var LEAD_B = [
      [81, -1, -1, 79, 77, -1, 74, 72], [82, -1, -1, 79, 77, -1, 74, 77],
      [81, -1, 77, 72, 74, -1, 69, 72], [73, 76, 79, 76, 73, 69, 73, 76]
    ];
    var BUGLE = [
      [62, -1, 65, -1, 69, -1, 74, -1], [69, -1, 74, -1, 77, -1, 74, -1],
      [74, 74, -1, 74, 77, 74, -1, 69], [74, -1, -1, -1, -1, -1, -1, -1]
    ];
    // section map per bar (render script sec(b), verbatim)
    function sec(b) {
      if (b < 8) return { prop: b >= 2, drums: b >= 4, bass: false, stab: false, arp: false, lead: 'bugle' };
      if (b < 24) return { prop: true, drums: true, bass: true, stab: b >= 12, arp: false, lead: b >= 16 ? 'A' : null };
      if (b < 40) return { prop: true, drums: true, bass: true, stab: true, arp: true, lead: 'B' };
      if (b < 56) return { prop: true, drums: 'half', bass: true, stab: false, arp: true, lead: b >= 48 ? 'bugle' : null };
      if (b < 72) return { prop: true, drums: true, bass: true, stab: true, arp: true, lead: 'A+' };
      if (b < 88) return { prop: true, drums: true, bass: true, stab: true, arp: true, lead: 'B+', descant: true };
      if (b < 100) return { prop: true, drums: true, bass: true, stab: true, arp: false, lead: 'bugle' };
      return { prop: b < 103, drums: b < 102 ? 'half' : false, bass: b < 103, stab: false, arp: false, lead: null };
    }
    var kick = [], snare = [], prop = [], bass = [], stab = [], arp = [], lead = [];
    for (var b = 0; b < 105; b++) {
      var s = sec(b), t = b % 4, root = ROOTS[t], chord = CH[t];
      var isLast = b === 104;
      // kick: thump on 1 & 3 (half-time: 1 only) — the bass drum
      if (isLast) { kick.push([m2n(root - 12), 3.2], [null, 0.8]); }
      else if (s.drums === 'half') { kick.push([m2n(38), 0.2], [null, 3.8]); }
      else if (s.drums) { kick.push([m2n(38), 0.2], [null, 1.8], [m2n(38), 0.2], [null, 1.8]); }
      else kick.push([null, 4]);
      // snare: high tick on 2 & 4 (the field snare's read)
      if (s.drums && s.drums !== 'half' && !isLast) snare.push([null, 1], ['D6', 0.12], [null, 1.88], ['D6', 0.12], [null, 0.88]);
      else snare.push([null, 4]);
      // propeller churn: low 16ths alternating root-12 / root-17
      if (s.prop && !isLast) { for (var st = 0; st < 16; st++) prop.push([m2n(root - 12 + (st % 2 ? 0 : -5)), 0.25]); }
      else prop.push([null, 4]);
      // bass: martial quarters root/root/fifth/root + octave 8th pickup
      if (isLast) bass.push([m2n(root), 4]);
      else if (s.bass) bass.push([m2n(root), 1], [m2n(root), 1], [m2n(root + 7), 1], [m2n(root), 0.5], [m2n(root + 12), 0.5]);
      else bass.push([null, 4]);
      // brass stab: the chord's third up an octave, on the "and" of 1 & 3
      if (s.stab && !isLast) stab.push([null, 0.5], [m2n(chord[1] + 12), 0.4], [null, 1.6], [m2n(chord[1] + 12), 0.4], [null, 1.1]);
      else stab.push([null, 4]);
      // wind arps: 16ths cycling chord tones up 1–2 octaves
      if (s.arp && !isLast) { for (var a2 = 0; a2 < 16; a2++) arp.push([m2n(chord[a2 % 3] + 24 + (a2 % 8 >= 4 ? 12 : 0)), 0.25]); }
      else arp.push([null, 4]);
      // lead: bugle / heroic A / soaring B (+ = up an octave at the climaxes)
      var line = s.lead === 'bugle' ? BUGLE[t] : s.lead && s.lead[0] === 'A' ? LEAD_A[t] : s.lead && s.lead[0] === 'B' ? LEAD_B[t] : null;
      if (isLast) lead.push([m2n(74), 4]);                             // final sustained D5
      else if (line) {
        var up = (s.lead && s.lead.length > 1) ? 12 : 0;
        for (var e = 0; e < 8; e++) lead.push(line[e] < 0 ? [null, 0.5] : [m2n(line[e] + up), 0.5]);
      } else lead.push([null, 4]);
    }
    // equal-beat assertion by construction — every track must sum 420 beats
    var TR = [kick, snare, prop, bass, stab, arp, lead];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 420) > 1e-6) throw new Error('SKYBREAKER track beat mismatch: ' + sum);
    });
    return {
      bpm: 140,
      tracks: [
        { type: 'triangle', vol: 0.075, notes: prop },    // propeller churn (the engine)
        { type: 'triangle', vol: 0.10,  notes: kick },    // faked bass drum 1 & 3
        { type: 'square',   vol: 0.035, notes: snare },   // faked field-snare tick 2 & 4
        { type: 'triangle', vol: 0.09,  notes: bass },    // martial root pumps
        { type: 'square',   vol: 0.030, notes: stab },    // brass chord stabs
        { type: 'square',   vol: 0.022, notes: arp },     // wind 16th arps
        { type: 'square',   vol: 0.055, notes: lead }     // bugle / heroic leads
      ]
    };
  })();

  MAPS.register({
    id: 'skyisles',

    // ------------------------------------------------------------- DATA ----
    installData: function (DATA) {
      // biome roster — Red's 8 picks (#2 4 8 9 11 15 16 19), unlock ramp
      // sprite-cheap → warden/shepherd late (the support core arrives last).
      DATA.biomes.skyisles = {
        name: 'Storm Sky Isles', tile: 'skystone',
        mobs: ['stormSprite', 'cloudRay', 'griffinCub', 'nimbusGolem',
               'windWarden', 'stormvane', 'rainShepherd', 'rocHatchling']
      };
      // realm def — kind 'skyisles' routes the registry scene hooks; `mist`
      // (the sea slows you; floaters exempt) + `tempest` (the TEMPEST CYCLE v2
      // conductor cfg) are THIS map's knobs. TUNE ME: everything.
      DATA.realms.skyisles = {
        name: 'Storm Sky Isles', biome: 'skyisles', boss: 'nimbustalon',
        kind: 'skyisles', music: 'skyisles',
        mist: { slowMult: 0.55 },
        tempest: {
          // 1 WIND SHIFT — rotating field-wide gale (positional push, gentle)
          wind: { everyMs: 26000, durMs: 6000, push: 55, warnMs: 1400 },
          // 2 ROAMING STRIKES — warned volt circles; cluster near rods/vanes/the eye
          strikes: { everyMs: 6500, warnMs: 1100, radius: 64, dmg: 16, rodBias: 0.6 },
          // 3 UPDRAFT VENTS — telegraphed vortex circles along island edges; toss + shove
          vents: { everyMs: 8800, warnMs: 1200, radius: 70, dmg: 12, push: 260 },
          // 4 THE STORM EYE — the drifting conductor; danger clusters under it
          eye: { retargetMs: 15000, speed: 26, radius: 260, pull: 18 }
        }
      };
      // ---- the 8 mobs (roles from the sheet; proven tech per PLAN §2) ----
      DATA.mobs.stormSprite = { name: 'Storm Sprite', texture: 'stormSpriteHi', hp: 20, spd: 100, xp: 5, cost: 1,
        deathTint: 0xffe95a, chase: { contactDmg: 7 } };
      DATA.mobs.cloudRay = { name: 'Cloud Ray', texture: 'cloudRayHi', hp: 32, spd: 62, xp: 14, cost: 3,
        deathTint: 0xb4bfda, float: true,
        // mini lightning strike: marks a small circle near you → bolt (mapVerb)
        mapVerb: 'rayMark', rayMark: { everyMs: 4400, range: 300, warnMs: 900, radius: 46, dmg: 14 },
        unlockAt: 25 };
      DATA.mobs.griffinCub = { name: 'Griffin Cub', texture: 'griffinCubHi', hp: 62, spd: 80, xp: 16, cost: 3,
        deathTint: 0xffcd45, chase: { contactDmg: 12 },
        lunge: { range: 250, windupMs: 700, dashMs: 240, dashSpeed: 380, cooldownMs: 3300 },
        unlockAt: 30 };
      DATA.mobs.nimbusGolem = { name: 'Nimbus Golem', texture: 'nimbusGolemHi', hp: 170, spd: 46, xp: 26, cost: 3,
        deathTint: 0x6a6f9e, chase: { contactDmg: 16 },
        // contact SHOVE — knocks the player back (mapVerb, positional push)
        mapVerb: 'golemShove', shove: { range: 52, push: 240, everyMs: 2600 },
        unlockAt: 55 };
      DATA.mobs.windWarden = { name: 'Wind Warden', texture: 'windWardenHi', hp: 72, spd: 55, xp: 30, cost: 5,
        deathTint: 0xbfeee6, chase: { contactDmg: 8 },
        guardAura: { radius: 150 }, maxConcurrent: 2, unlockAt: 75 };
      DATA.mobs.stormvane = { name: 'Stormvane', texture: 'stormvaneHi', hp: 52, spd: 0, xp: 16, cost: 3,
        deathTint: 0xffe95a,
        shoot: { range: 340, dmg: 10, projSpeed: 190, cooldownMs: 2400,
                 count: 10, spreadDeg: 360, lifeMs: 2600, tint: 0xffe95a, texture: 'orbShot' },
        unlockAt: 40 };
      DATA.mobs.rainShepherd = { name: 'Rain Shepherd', texture: 'rainShepherdHi', hp: 58, spd: 48, xp: 32, cost: 5,
        deathTint: 0x7fd4ff, chase: { contactDmg: 6 },
        mend: { everyMs: 1700, radius: 155, amount: 14 }, maxConcurrent: 2, unlockAt: 70 };
      DATA.mobs.rocHatchling = { name: 'Roc Hatchling', texture: 'rocHatchlingHi', hp: 84, spd: 62, xp: 28, cost: 4,
        deathTint: 0x4a6cc2, chase: { contactDmg: 10 },
        // waddle → hop airborne → BELLY-FLOP onto a telegraphed circle (mapVerb)
        mapVerb: 'bellyFlop', flop: { range: 300, everyMs: 5200, warnMs: 1100, radius: 80, dmg: 24, hopMs: 600 },
        maxConcurrent: 2, unlockAt: 60 };

      // ---- NIMBUS TALON — LORD OF THE STORMS (mapOwned; boss contract:
      // everything telegraphed, ZERO radial/stream projectile filler) ----
      DATA.bosses.nimbustalon = {
        name: 'Nimbus Talon', texture: 'nimbustalonHi',
        hp: 2200, spd: 42, xp: 340, contactDmg: 22, deathTint: 0xffe95a,
        lootTable: 'nimbustalon',
        mapOwned: true,                       // registry dispatch → scene.bossUpdate
        arrival: null,                        // (grows-shadow entrance is scene-owned via bossArrival)
        shadowMs: 3000,                       // growing-shadow entrance length
        patterns: {
          // SKYFALL BARRAGE — warned volt circles around/under you → slams
          skyfall:    { everyMs: 6200, lobs: 5, warnMs: 1300, radius: 70, dmg: 22, scatter: 190 },
          // GALE SHOVE — direction locks + wedge glows → field-wide push
          gale:       { everyMs: 9500, warnMs: 1300, durMs: 1500, push: 300 },
          // ISLAND-DROP SLAM — checkerboard flashes in two alternating waves
          islandSlam: { everyMs: 11000, tile: 120, warnMs: 1300, dmg: 22, gapMs: 650 },
          // DIVE LANE — he rises off-screen, a lane flashes, talons strafe it
          diveLane:   { everyMs: 8200, warnMs: 1400, dmg: 30, half: 42, dashMs: 620 },
          // ROD OVERLOAD (signature) — the 4 rods blast in sequence, safe
          // pocket rotates; then he VENTS (rooted, ×1.5 damage taken)
          rodOverload: { everyMs: 16000, chargeMs: 2600, radius: 240, dmg: 30, gapMs: 700,
                         ventMs: 3500, ventDmgMult: 1.5, firstDelayMs: 9000 },
          // STORM-ELEMENTAL ADDS — sprites + a vane join mid-fight (queueSpawn)
          adds:       { everyMs: 13000, cap: 5 },
          overclock:  { hpPct: 0.3, spdMult: 1.3, rateMult: 0.75 }
        },
        title: 'LORD OF THE STORMS',
        hints: [
          'HE IS THE STORM — every attack paints the ground first. Trust the paint and keep moving.',
          'SKYFALL — volt circles bloom around you, then lightning slams them. Walk out before the crack.',
          'GALE SHOVE — the wind wedge glows, then the whole sky pushes everyone along it. Brace or ride it.',
          'ISLAND-DROP SLAM — the arena flashes in TWO alternating waves. Stand on the wave that already fired.',
          'DIVE LANE — he vanishes upward and a lane flashes: he strafes it talons-first. Step OFF the lane.',
          'ROD OVERLOAD — the four rods blast in sequence, the safe pocket rotates. Afterward he VENTS, helpless — unload.'
        ]
      };
      DATA.dropTables.nimbustalon = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §6 — chiptune, original) + the theme ----
      DATA.audio.sounds.windshift = { type: 'triangle', freq: 220, freqEnd: 480, len: 0.7, vol: 0.14, limitMs: 900,
                                      noise: { vol: 0.05, hp: 1600 } };
      DATA.audio.sounds.chimering = { type: 'triangle', freq: 1320, freqEnd: 1180, len: 0.5, vol: 0.10, limitMs: 250 };
      DATA.audio.sounds.strikecrack = { type: 'sawtooth', freq: 170, freqEnd: 46, len: 0.4, vol: 0.28, limitMs: 160,
                                        noise: { vol: 0.14, hp: 900 } };
      DATA.audio.sounds.ventwhoosh = { type: 'triangle', freq: 140, freqEnd: 560, len: 0.45, vol: 0.18, limitMs: 400,
                                       noise: { vol: 0.08, hp: 1200 } };
      DATA.audio.sounds.divescreech = { type: 'square', freq: 1500, freqEnd: 300, len: 0.6, vol: 0.16, limitMs: 900 };
      DATA.audio.sounds.rodhum = { type: 'sawtooth', freq: 80, freqEnd: 220, len: 1.2, vol: 0.14, limitMs: 1400,
                                   noise: { vol: 0.05, hp: 2000 } };
      DATA.audio.music.skyisles = SKYBREAKER;

      // ---- PORTAL MACHINE destination (console unlock) ----
      MAPS.addConsoleMap(DATA, { id: 'skyisles', name: 'STORM SKY ISLES',
        sub: 'Nimbus Talon rules the storm', locked: false });
    },

    // ------------------------------------------------------------- ART -----
    buildArt: function (ctx) {
      if (typeof SKYISLES_ART !== 'undefined') SKYISLES_ART.buildInto(ctx);
    },

    // -------------------------------------------------- MOB VERBS (new) ----
    // Consumed by the single core hook in Entities.updateMob (def.mapVerb).
    // Return true = the verb owned this frame (skip generic move/attack).
    mobVerbs: {
      rayMark: function (scene, m, player, time) { return scene._skyRayMark(m, player, time); },
      golemShove: function (scene, m, player, time) { return scene._skyGolemShove(m, player, time); },
      bellyFlop: function (scene, m, player, time) { return scene._skyBellyFlop(m, player, time); }
    },

    // ------------------------------------------------------- SCENE ---------
    scene: (typeof SKYISLES_SCENE !== 'undefined') ? SKYISLES_SCENE : {}
  });
})();
