// ============================================================================
// game/js/maps/sugar/map.js — SUGAR WORLD (realm 16) data + registration.
// Every pick is Red's (PLAN.md, LOCKED 2026-07-16). Pastel menace: candy land
// where the candy fights back and the teddy bear's eyes glow. Numbers TUNE ME.
// SIGNATURE MECHANIC: killed mobs may drop a CANDY PICKUP = FULL HEAL (rare;
// no-farm guarded). GLOBAL RULE born here: ALL FENCES DESTRUCTIBLE.
// ============================================================================
(function () {
  'use strict';

  // ---- "SUGAR RUSH.EXE" — fast trance techno + INSANE piano solo + guitar
  // solo (TAKE 1, RED-APPROVED "ok"). Port of render_sugar_theme.js as a
  // section composer: 156 BPM A minor (Am–F–C–G), 117 bars × 4 = 468 beats =
  // EXACTLY 180.0s. NO SLOW INTRO — kick + acid bass + trance arp + hook from
  // bar 0, candy toy-bell counter-melody; DROP 1 → 16-bar PIANO SOLO → 4-bar
  // piano/guitar TRADE-OFF → 16-bar GUITAR SOLO → octave-up FINAL DROP w/ duet
  // → victory lap → tag (piano scale + candy bells out).
  var SUGAR_RUSH = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function safe(m) { while (m < 12) m += 12; while (m > 119) m -= 12; return m; }
    function m2n(m) { m = safe(m); return NAMES[m % 12] + (Math.floor(m / 12) - 1); }
    var ROOTS = [45, 41, 36, 43], CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]];
    var HOOK = [
      [76, -1, 76, 74, 76, -1, 79, -1], [77, -1, 76, 74, 72, -1, 74, 76],
      [72, -1, 72, 71, 72, -1, 76, -1], [74, -1, 76, 78, 79, -1, 74, -1]
    ];
    var BELLS = [[88, -1, -1, 91, -1, -1, 88, -1], [-1, 89, -1, -1, 88, -1, 86, -1],
                 [84, -1, -1, 88, -1, -1, 84, -1], [86, -1, 88, -1, 90, -1, -1, -1]];
    var AM = [57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];
    var KICK = 24, HHO = 93, HHC = 96, SN = 84;   // drum voices (chip)

    function pianoRun(idx, chord) {
      var r = [];
      switch (idx % 4) {
        case 0: for (var i = 1; i < 17; i++) r.push(AM[i]); break;                          // scale blaze
        case 1: r = [chord[0], chord[1], chord[2], chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24, chord[2] + 12,
                     chord[1] + 12, chord[0] + 12, chord[2], chord[1], chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[0] + 24]; break;
        case 2: for (var e = 0; e < 16; e++) r.push(AM[Math.max(0, 16 - e)] + (e % 2 ? 12 : 0)); break; // cascade
        default: r = [64, 69, 65, 71, 67, 72, 69, 74, 71, 76, 72, 77, 74, 79, 76, 81]; break;           // zigzag
      }
      return r;
    }
    function guitarRun(idx, chord) {
      var r = [];
      switch (idx % 4) {
        case 0: r = [69, 72, 74, 76, 79, 76, 74, 72, 69, 72, 74, 76, 79, 81, 79, 76]; break;
        case 1: r = [76, 79, 81, 84, 81, 79, 76, 74, 76, 79, 81, 84, 86, 84, 81, 79]; break;
        case 2: r = [81, 81, -1, 81, 81, -1, 81, 84, 86, -1, 84, -1, 81, 79, 76, 74]; break;
        default: r = [chord[1] + 12, -1, chord[2] + 12, -1, chord[1] + 12, -1, chord[2] + 12, -1,
                      chord[0] + 24, -1, -1, chord[2] + 12, -1, chord[1] + 12, -1, chord[0] + 12]; break;
      }
      return r;
    }

    function sec(b) {
      if (b < 20) return { kick: true, hats: true, bass: true, arp: true, hook: true, bells: b >= 8 };  // STRAIGHT IN
      if (b < 28) return { kick: true, hats: true, bass: true, arp: true, pad: true, build: b >= 24, roll: b - 24 };
      if (b < 44) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, bells: true }; // DROP 1
      if (b < 48) return { pad: true, pianoTease: true };
      if (b < 64) return { kick: true, hats: true, bass: true, psolo: b - 48 };          // INSANE PIANO SOLO
      if (b < 68) return { kick: true, hats: true, bass: true, trade: b - 64 };          // piano/guitar TRADE-OFF
      if (b < 84) return { kick: true, hats: true, bass: true, gsolo: b - 68 };          // GUITAR SOLO
      if (b < 88) return { kick: true, hats: true, bass: true, build: true, roll: b - 84 };
      if (b < 104) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, up: 12, duet: true }; // FINAL DROP
      if (b < 112) return { kick: true, hats: true, bass: true, arp: true, hook: true, big: true, bells: true }; // victory lap
      return { tag: b - 112 };
    }
    var DOORS = { 20: 1, 28: 1, 44: 1, 48: 1, 64: 1, 68: 1, 84: 1, 88: 1, 104: 1, 112: 1 };

    var kick = [], hatO = [], hatC = [], bass = [], arp = [], hook = [], bells = [],
        pad = [], build = [], sub = [], psolo = [], gsolo = [], flavor = [];
    function rest(a) { a.push([null, 4]); }

    for (var b = 0; b < 117; b++) {
      var s = sec(b), t = b % 4, root = ROOTS[t], chord = CH[t];
      // four-on-the-floor kick
      if (s.kick) { for (var k = 0; k < 4; k++) { kick.push([m2n(KICK), 0.12], [null, 0.88]); } }
      else if (s.tag != null && s.tag <= 2) { kick.push([m2n(KICK), 0.12], [null, 3.88]); }
      else rest(kick);
      // offbeat open hats
      if (s.hats) { for (var h = 0; h < 4; h++) hatO.push([null, 0.5], [m2n(HHO), 0.1], [null, 0.4]); }
      else rest(hatO);
      // 16th closed ticks (8 eighths)
      if (s.hats) { for (var h2 = 0; h2 < 8; h2++) hatC.push([m2n(HHC), 0.1], [null, 0.4]); }
      else rest(hatC);
      // acid bass — 16ths, duck the kick on the beat, octave pops + a slide-pop
      if (s.bass) {
        for (var e = 0; e < 16; e++) {
          if (e % 4 === 0) { bass.push([null, 0.25]); continue; }
          var bm = (e === 14) ? root + 7 : root + ((e % 8 === 6) ? 12 : 0);
          bass.push([m2n(bm), 0.2], [null, 0.05]);
        }
      } else rest(bass);
      // trance arp — chord tones up-down, +12
      if (s.arp) {
        var an = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2], chord[1], chord[0] + 12, chord[1]];
        for (var e2 = 0; e2 < 16; e2++) arp.push([m2n(an[e2 % 8] + 12), 0.21], [null, 0.04]);
      } else rest(arp);
      // hook lead (8 eighths)
      if (s.hook) {
        for (var e3 = 0; e3 < 8; e3++) {
          var hm = HOOK[t][e3];
          if (hm < 0) { hook.push([null, 0.5]); continue; }
          hook.push([m2n(hm + (s.up || 0)), 0.45], [null, 0.05]);
        }
      } else rest(hook);
      // candy bells counter-melody (8 eighths)
      if (s.bells) {
        for (var e4 = 0; e4 < 8; e4++) {
          var cm = BELLS[t][e4];
          if (cm < 0) { bells.push([null, 0.5]); continue; }
          bells.push([m2n(cm), 0.4], [null, 0.1]);
        }
      } else rest(bells);
      // gated pad / piano tease (8 eighths)
      if (s.pad) {
        for (var e5 = 0; e5 < 8; e5++) {
          if (e5 % 4 === 3) { pad.push([null, 0.5]); continue; }
          pad.push([m2n(chord[e5 % 3] + (s.pianoTease ? 12 : 0)), 0.35], [null, 0.15]);
        }
      } else rest(pad);
      // snare-roll build (accelerating density) — sums to 4
      if (s.build) {
        var den = 6 + (s.roll || 0) * 3;
        for (var r2 = 0; r2 < den; r2++) build.push([m2n(SN), 4 / den * 0.35], [null, 4 / den * 0.65]);
      } else rest(build);
      // drop sub layer
      if (s.big) sub.push([m2n(root - 12), 3.8], [null, 0.2]); else rest(sub);
      // INSANE PIANO SOLO (and the piano half of the trade-off)
      if (s.psolo != null || (s.trade != null && s.trade < 2)) {
        var pr = pianoRun(s.psolo != null ? s.psolo : (2 + s.trade), chord);
        for (var pe = 0; pe < 16; pe++) { var pn = pr[pe % pr.length]; if (pn > 0) psolo.push([m2n(pn), 0.23], [null, 0.02]); else psolo.push([null, 0.25]); }
      } else rest(psolo);
      // GUITAR SOLO (and the guitar half of the trade-off)
      if (s.gsolo != null || (s.trade != null && s.trade >= 2)) {
        var gr = guitarRun(s.gsolo != null ? s.gsolo : (s.trade - 2), chord);
        for (var ge = 0; ge < 16; ge++) { var gn = gr[ge % gr.length]; if (gn > 0) gsolo.push([m2n(gn), 0.23], [null, 0.02]); else gsolo.push([null, 0.25]); }
      } else if (s.duet && t === 3) {
        // final-drop duet: the guitar answers phrase-ends up top
        gsolo.push([null, 2.5], [m2n(88), 0.6], [null, 0.1], [m2n(91), 0.7], [null, 0.1]);
      } else rest(gsolo);
      // doors + tag flourishes
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (s.tag != null) {
        var tg = s.tag;
        if (tg === 1) { for (var te = 0; te < 8; te++) flavor.push([m2n(AM[te * 2 % AM.length]), 0.4], [null, 0.1]); }  // piano gliss
        else if (tg === 3) { [88, 91, 93, 96].forEach(function (m, i) { flavor.push([m2n(m), 0.75], [null, 0.25]); }); }
        else if (tg >= 4) { flavor.push([m2n(96), 0.6], [null, 3.4]); }                                                 // bells out
        else rest(flavor);
      } else rest(flavor);
    }

    var TR = [kick, hatO, hatC, bass, arp, hook, bells, pad, build, sub, psolo, gsolo, flavor];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 468) > 1e-6) throw new Error('SUGAR RUSH track beat mismatch: ' + sum);
    });
    return {
      bpm: 156,
      tracks: [
        { type: 'triangle', vol: 0.17,  notes: kick },     // four-on-the-floor
        { type: 'square',   vol: 0.013, notes: hatO },     // offbeat open hats
        { type: 'square',   vol: 0.008, notes: hatC },     // 16th closed ticks
        { type: 'square',   vol: 0.09,  notes: bass },     // ACID bass
        { type: 'square',   vol: 0.028, notes: arp },      // trance arp
        { type: 'square',   vol: 0.05,  notes: hook },     // hook lead
        { type: 'triangle', vol: 0.05,  notes: bells },    // candy toy-bell counter-melody
        { type: 'square',   vol: 0.02,  notes: pad },      // gated pad / piano tease
        { type: 'square',   vol: 0.05,  notes: build },    // snare-roll build
        { type: 'triangle', vol: 0.08,  notes: sub },      // drop sub layer
        { type: 'square',   vol: 0.055, notes: psolo },    // INSANE piano solo
        { type: 'sawtooth', vol: 0.045, notes: gsolo },    // guitar solo (0.36-duty flavor)
        { type: 'triangle', vol: 0.05,  notes: flavor }    // doors + tag
      ]
    };
  })();

  MAPS.register({
    id: 'sugar',

    installData: function (DATA) {
      DATA.biomes.sugar = {
        name: 'Sugar World', tile: 'sugSprinkle',
        mobs: ['gummyBear', 'gingerdead', 'candyLancer', 'jawbreaker', 'lolliTwirler',
               'gumdrop', 'cottonDrift', 'mintGuardian', 'mallowBrute', 'cupcakeMimic', 'candyCorn']
      };
      DATA.realms.sugar = {
        name: 'Sugar World', biome: 'sugar', boss: 'sugarBear',
        kind: 'sugar', music: 'sugar',
        // CANDY PICKUPS — signature full-heal economy (PLAN §2). ALL TUNE ME.
        candy: { dropChance: 0.04, healFull: true, despawnMs: 20000, radius: 40, maxGround: 3, bossDudChance: 0.5 },
        // DESTRUCTIBLE FENCES — the campaign rule born here (PLAN §3). TUNE ME.
        fence: { hp: 24, states: 3, regrowMs: 20000 }
      };

      // ---- the ELEVEN roster mobs (Red picks) + split children -------------
      DATA.mobs.gummyBear = { name: 'Gummy Bear', texture: 'sugGummyHi', hp: 26, spd: 120, xp: 6, cost: 1,
        deathTint: 0xff4a58, chase: { contactDmg: 7 },
        mapVerb: 'gummyLunge',                               // jelly-glint → chomp lunge
        // M7k AUDIT fix: def key renamed lunge → gummyPounce; `lunge` collided
        // with core's ghoul-lunge verb (it armed its own lunge state on this mob).
        gummyPounce: { range: 230, windupMs: 340, dashMs: 200, dashSpeed: 420, cooldownMs: 2600 },
        maxConcurrent: 6 };
      DATA.mobs.gingerdead = { name: 'Gingerdead Man', texture: 'sugGingerHi', hp: 34, spd: 150, xp: 12, cost: 2,
        deathTint: 0xb87838, chase: { contactDmg: 8 },
        mapVerb: 'gingerSlash',                              // cane-shiv slash → death = top half crawls on
        slash: { everyMs: 4200, range: 180, warnMs: 600, halfRad: 0.7, dmg: 12 },
        splitOnDeath: { key: 'gingerHalf', count: 1, ring: 0 },
        unlockAt: 15 };
      DATA.mobs.gingerHalf = { name: 'Crawling Half', texture: 'sugGingerHalfHi', hp: 12, spd: 100, xp: 3, cost: 0,
        deathTint: 0xb87838, chase: { contactDmg: 6 }, noCandy: true, isChild: true };
      DATA.mobs.candyLancer = { name: 'Candy Lancer', texture: 'sugLancerHi', hp: 60, spd: 90, xp: 18, cost: 3,
        deathTint: 0xff4a58, chase: { contactDmg: 10 },
        mapVerb: 'lancerCharge',                             // couched cane-lance → warned charge lane
        charge: { everyMs: 5200, range: 460, warnMs: 900, len: 520, chargeMs: 1000, speed: 430, half: 24, dmg: 16 },
        unlockAt: 30 };
      DATA.mobs.jawbreaker = { name: 'Jawbreaker', texture: 'sugJawHi', hp: 100, spd: 70, xp: 20, cost: 3,
        deathTint: 0xb06ae8, chase: { contactDmg: 12 },
        mapVerb: 'jawRoll',                                  // warned roll lines; armor layers chip off
        roll: { everyMs: 5000, range: 480, warnMs: 900, len: 540, rollMs: 1100, speed: 420, half: 24, dmg: 14 },
        layers: { count: 5, hp: 20 },
        unlockAt: 25 };
      DATA.mobs.lolliTwirler = { name: 'Lolli Twirler', texture: 'sugTwirlerHi', hp: 44, spd: 60, xp: 16, cost: 2,
        deathTint: 0xff9ac8,                                 // NO chase (armless zoner — the spiral is the threat)
        mapVerb: 'twirlerSpin',                              // spin-up telegraph → drifting spiral sweep
        spin: { everyMs: 4800, range: 340, warnMs: 900, spiralMs: 2600, driftSpeed: 70, radius: 70, dmg: 12, tickMs: 500 },
        unlockAt: 35 };
      DATA.mobs.gumdrop = { name: 'Gumdrop', texture: 'sugGumdropHi', hp: 30, spd: 90, xp: 10, cost: 1,
        deathTint: 0xa8e83a, chase: { contactDmg: 6 },
        mapVerb: 'gumdropHop',                               // warned hop arcs → splits into 2 minis
        hop: { hopEveryMs: 1800, hopMs: 340, hopSpeed: 360, warnMs: 700, landRadius: 80, dmg: 12 },
        splitOnDeath: { key: 'gumdropMini', count: 2, ring: 28 },
        unlockAt: 20 };
      DATA.mobs.gumdropMini = { name: 'Mini Drop', texture: 'sugGumdropMiniHi', hp: 12, spd: 110, xp: 3, cost: 0,
        deathTint: 0xa8e83a, chase: { contactDmg: 5 }, noCandy: true, isChild: true };
      DATA.mobs.cottonDrift = { name: 'Cotton Drift', texture: 'sugCottonHi', hp: 40, spd: 55, xp: 14, cost: 2,
        deathTint: 0xff9ac8, float: true, chase: { contactDmg: 5 },
        mapVerb: 'cottonSlow',                               // drifts at you; sticky slow aura (CC-cap)
        aura: { auraR: 120, slowMult: 0.6 },
        maxConcurrent: 3, unlockAt: 40 };
      DATA.mobs.mintGuardian = { name: 'Mint Guardian', texture: 'sugMintHi', hp: 90, spd: 45, xp: 22, cost: 3,
        deathTint: 0x7ae8c0, chase: { contactDmg: 10 },
        mapVerb: 'mintGuard',                                // frontal block; shield-spin = 360 block then exposed
        guard: { everyMs: 5200, spinMs: 1200, exposedMs: 1600, blockArc: 1.4, blockRange: 78 },
        unlockAt: 45 };
      DATA.mobs.mallowBrute = { name: 'Mallow Brute', texture: 'sugMallowHi', hp: 300, spd: 55, xp: 50, cost: 5,
        deathTint: 0xfffdf6, chase: { contactDmg: 18 },
        mapVerb: 'mallowSlam',                               // warned squish-slam circle → splits into 3
        slam: { everyMs: 5200, range: 300, warnMs: 1000, radius: 110, dmg: 22 },
        splitOnDeath: { key: 'mallowMini', count: 3, ring: 44 },
        maxConcurrent: 1, unlockAt: 60 };
      DATA.mobs.mallowMini = { name: 'Mini Mallow', texture: 'sugMallowMiniHi', hp: 30, spd: 80, xp: 6, cost: 0,
        deathTint: 0xfffdf6, chase: { contactDmg: 10 }, noCandy: true, isChild: true };
      DATA.mobs.cupcakeMimic = { name: 'Cupcake Mimic', texture: 'sugMimicHi', hp: 70, spd: 30, xp: 20, cost: 3,
        deathTint: 0xff9ac8, chase: { contactDmg: 12 },
        mapVerb: 'mimicChomp',                               // SEALED ambusher; shimmer near → maw opens + chomp
        mimic: { triggerRange: 130, shimmerMs: 700, chompWarnMs: 400, chompRadius: 90, dmg: 18, resealMs: 2600 },
        maxConcurrent: 3, unlockAt: 50 };
      DATA.mobs.candyCorn = { name: 'Candy Corn Pack', texture: 'sugCornHi', hp: 26, spd: 130, xp: 12, cost: 2,
        deathTint: 0xff9a3a, float: true,                    // NO chase (dart lanes are the threat)
        mapVerb: 'cornDart',                                 // warned dart lanes fired in sequence
        dart: { everyMs: 4600, range: 420, count: 3, warnMs: 700, gapMs: 280, len: 460, half: 22, dmg: 11 },
        unlockAt: 35 };

      // ---- SUGAR BEAR (mapOwned; from Red's concept — "thats perfect") -----
      DATA.bosses.sugarBear = {
        name: 'Sugar Bear', texture: 'sugBearHi',
        hp: 3800, spd: 34, xp: 560, contactDmg: 20, deathTint: 0xff9ac8,
        lootTable: 'sugarBear',
        mapOwned: true, entranceMs: 3200,
        patterns: {
          verbEveryMs: 5000, phase2At: 0.5,
          // PHASE 1 — THE SWEETHEART
          caneHook:      { range: 520, warnMs: 900, half: 22, pull: 120, dmg: 14, cooldownMs: 2600 },
          gumballVolley: { count: 3, scatter: 150, radius: 70, warnMs: 1000, dmg: 20, studs: 7 },
          cottonSmother: { range: 300, warnMs: 1000, sector: 1.1, slowMs: 3200, slowMult: 0.6, dmg: 14 },
          bearHug:       { radius: 150, warnMs: 1300, dmg: 40, ventMs: 3200, ventDmgMult: 1.5 },
          // PHASE 2 — THE SUGAR CRASH
          caneSweep:     { range: 260, warnMs: 800, half: 0.7, dmg: 20, gapMs: 500 },
          jawSummon:     { count: 2, laneWarnMs: 900, len: 620, dmg: 16, cap: 6 },
          sugarStomp:    { count: 4, radius: 90, warnMs: 700, gapMs: 350, dmg: 18 },
          candyRain:     { count: 6, radius: 70, warnMs: 1000, gapMs: 300, dmg: 20,
                           sprintWarnMs: 1200, sprintDmg: 26, ventMs: 4200, ventDmgMult: 1.5 },
          overclock:     { hpPct: 0.25, rateMult: 0.8 }
        },
        title: 'SUGAR BEAR',
        hints: [
          "The crook PULLS — brace the moment it glints, then step out of the painted line.",
          "Dodge the GUMBALLS, then EAT them — the duds can leave a full-heal candy.",
          "His FLUFF slows: don't fight inside the cotton cloud, drift out and shoot.",
          "The BEAR HUG circle is death — leave EARLY and he stumbles wide open.",
          "In the crash his ROLLING summons and STOMPS follow the painted lanes and rings.",
          "When he PANTS after the candy rain, he's all yours — unload."
        ]
      };
      DATA.dropTables.sugarBear = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §7) + the theme ----
      DATA.audio.sounds.candychime   = { type: 'triangle', arp: [660, 880, 1100, 1320], len: 0.5, vol: 0.16, limitMs: 300 };
      DATA.audio.sounds.candysparkle = { type: 'triangle', freq: 1400, freqEnd: 2400, len: 0.2, vol: 0.1, limitMs: 200 };
      DATA.audio.sounds.fencecrack   = { type: 'square', freq: 500, freqEnd: 220, len: 0.16, vol: 0.13, limitMs: 200, noise: { vol: 0.05, hp: 1400 } };
      DATA.audio.sounds.fenceshatter = { type: 'square', freq: 900, freqEnd: 180, len: 0.32, vol: 0.15, limitMs: 350, noise: { vol: 0.09, hp: 1600 } };
      DATA.audio.sounds.gummychomp   = { type: 'square', freq: 260, freqEnd: 110, len: 0.16, vol: 0.13, limitMs: 220 };
      DATA.audio.sounds.gingercrack  = { type: 'square', freq: 700, freqEnd: 300, len: 0.14, vol: 0.12, limitMs: 220, noise: { vol: 0.05, hp: 1800 } };
      DATA.audio.sounds.laneclash    = { type: 'square', freq: 520, freqEnd: 160, len: 0.22, vol: 0.14, limitMs: 260 };
      DATA.audio.sounds.jawroll      = { type: 'sawtooth', freq: 90, freqEnd: 150, len: 0.5, vol: 0.12, limitMs: 500, noise: { vol: 0.06, hp: 400 } };
      DATA.audio.sounds.jawchip      = { type: 'triangle', freq: 1600, freqEnd: 1200, len: 0.1, vol: 0.12, limitMs: 150 };
      DATA.audio.sounds.twirlwhoosh  = { type: 'sawtooth', freq: 1800, freqEnd: 900, len: 0.4, vol: 0.07, limitMs: 500, noise: { vol: 0.05, hp: 2400 } };
      DATA.audio.sounds.gumboing     = { type: 'triangle', freq: 220, freqEnd: 520, len: 0.2, vol: 0.13, limitMs: 220 };
      DATA.audio.sounds.mintting     = { type: 'triangle', freq: 1900, freqEnd: 1500, len: 0.12, vol: 0.12, limitMs: 180 };
      DATA.audio.sounds.mallowslam   = { type: 'sawtooth', freq: 120, freqEnd: 60, len: 0.4, vol: 0.15, limitMs: 500, noise: { vol: 0.08, hp: 300 } };
      DATA.audio.sounds.mimicsnap    = { type: 'square', freq: 400, freqEnd: 120, len: 0.22, vol: 0.15, limitMs: 300, noise: { vol: 0.06, hp: 900 } };
      DATA.audio.sounds.corndart     = { type: 'square', freq: 1400, freqEnd: 600, len: 0.16, vol: 0.08, limitMs: 200 };
      DATA.audio.sounds.canehook     = { type: 'square', freq: 620, freqEnd: 200, len: 0.24, vol: 0.14, limitMs: 300 };
      DATA.audio.sounds.gumballlob   = { type: 'square', freq: 900, freqEnd: 400, len: 0.18, vol: 0.12, limitMs: 220 };
      DATA.audio.sounds.fluffbillow  = { type: 'sawtooth', freq: 300, freqEnd: 600, len: 0.5, vol: 0.08, limitMs: 600, noise: { vol: 0.05, hp: 800 } };
      DATA.audio.sounds.bearhug      = { type: 'sawtooth', freq: 160, freqEnd: 80, len: 0.6, vol: 0.16, limitMs: 700, noise: { vol: 0.08, hp: 300 } };
      DATA.audio.sounds.jawrumble    = { type: 'sawtooth', freq: 80, freqEnd: 200, len: 0.7, vol: 0.14, limitMs: 800, noise: { vol: 0.08, hp: 400 } };
      DATA.audio.sounds.stompchain   = { type: 'triangle', freq: 140, freqEnd: 90, len: 0.25, vol: 0.14, limitMs: 250 };
      DATA.audio.sounds.candyrain    = { type: 'square', freq: 1200, freqEnd: 700, len: 0.2, vol: 0.1, limitMs: 240 };
      DATA.audio.sounds.sprintroar   = { type: 'sawtooth', freq: 90, freqEnd: 260, len: 0.9, vol: 0.16, limitMs: 1000, noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.pantvent     = { type: 'triangle', freq: 320, freqEnd: 200, len: 0.5, vol: 0.1, limitMs: 600 };
      DATA.audio.music.sugar = SUGAR_RUSH;

      MAPS.addConsoleMap(DATA, { id: 'sugar', name: 'SUGAR WORLD',
        sub: 'the candy fights back', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof SUGAR_ART !== 'undefined') SUGAR_ART.buildInto(ctx);
    },

    mobVerbs: {
      gummyLunge:   function (scene, m, player, time) { return scene._sgGummy(m, player, time); },
      gingerSlash:  function (scene, m, player, time) { return scene._sgGinger(m, player, time); },
      lancerCharge: function (scene, m, player, time) { return scene._sgLancer(m, player, time); },
      jawRoll:      function (scene, m, player, time) { return scene._sgJaw(m, player, time); },
      twirlerSpin:  function (scene, m, player, time) { return scene._sgTwirler(m, player, time); },
      gumdropHop:   function (scene, m, player, time) { return scene._sgGumdrop(m, player, time); },
      cottonSlow:   function (scene, m, player, time) { return scene._sgCotton(m, player, time); },
      mintGuard:    function (scene, m, player, time) { return scene._sgMint(m, player, time); },
      mallowSlam:   function (scene, m, player, time) { return scene._sgMallow(m, player, time); },
      mimicChomp:   function (scene, m, player, time) { return scene._sgMimic(m, player, time); },
      cornDart:     function (scene, m, player, time) { return scene._sgCorn(m, player, time); }
    },

    scene: (typeof SUGAR_SCENE !== 'undefined') ? SUGAR_SCENE : {}
  });
})();
