// ============================================================================
// game/js/maps/belly/map.js — BELLY OF THE BEAST (realm 20, THE FINALE) data
// + registration. Every pick is Red's (PLAN.md, LOCKED 2026-07-17). JONAH as
// a video game: swallowed ship-and-all, fight out of the whale, then fight the
// whale. Numbers TUNE ME. The "???" reveal, the intro/outro cinematics, the
// DIGESTION TIDE cycle, the UVULA gag trigger and the STATIONARY Titan Whale
// (WATER GUN signature) all live in scene.js; this file is the data + theme.
// ============================================================================
(function () {
  'use strict';

  // ---- "HEAVE HO.EXE" — 8-BIT SEA SHANTY (TAKE 1, RED-APPROVED "sounds
  // good"). Port of render_belly_theme.js as a section composer: 120 BPM,
  // 90 bars × 4 = 360 beats = EXACTLY 180.0s, A dorian, SWUNG 8ths (2:1).
  // NO SLOW INTRO — stomp + melody from bar 0. A verse → B CALL/ANSWER →
  // C chorus → D fiddle break → E storm verse → F finale + HEAVE...HO! ring.
  var HEAVE_HO = (function () {
    var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    function m2n(m) { return NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    // A dorian chords
    var Am = [57, 60, 64], G = [55, 59, 62], C = [60, 64, 67], D = [62, 66, 69];
    var VPROG = [Am, Am, G, Am];
    var CPROG = [Am, C, G, Am, Am, C, D, Am];
    var KK = 45, BK = 57;                       // stomp thud, backbeat click
    // 1-bar melodic cells (sum to 4 beats), swung where paired 2:1
    var VERSE_CELL = [[69, 0.667], [69, 0.333], [72, 0.5], [71, 0.5], [69, 1], [67, 1]];
    var CALL_CELL = [[76, 0.667], [76, 0.333], [74, 0.5], [72, 0.5], [74, 1], [72, 1]];
    var ANSW_CELL = [[57, 1], [59, 0.5], [60, 0.5], [62, 1], [57, 1]];
    var CHORUS_CELL = [[76, 1], [79, 0.5], [76, 0.5], [74, 1], [72, 1]];
    var RUN = [69, 71, 72, 74, 76, 74, 72, 71];

    var stomp = [], back = [], bass = [], squeeze = [], lead = [], crew = [], fiddle = [], flavor = [];
    function pushCell(arr, cell, oct) { cell.forEach(function (nd) { arr.push([nd[0] == null ? null : m2n(nd[0] + (oct || 0)), nd[1]]); }); }
    var DOORS = { 16: 1, 32: 1, 48: 1, 64: 1, 80: 1 };

    for (var b = 0; b < 90; b++) {
      var sec = b < 16 ? 'A' : b < 32 ? 'B' : b < 48 ? 'C' : b < 64 ? 'D' : b < 80 ? 'E' : 'F';
      var last = b === 89;
      var big = sec === 'C' || sec === 'F';
      var chord = big ? CPROG[b % 8] : VPROG[b % 4];
      var root = chord[0] - 24, fifth = root + 7;

      if (last) {
        // final "HEAVE... HO!" — low-A ring + crew shout out to 180.0
        stomp.push([m2n(KK), 0.15], [null, 3.85]);
        back.push([m2n(BK), 0.15], [null, 3.85]);
        bass.push([m2n(33), 4]);
        squeeze.push([null, 4]);
        lead.push([m2n(57), 4]);
        crew.push([m2n(64), 4]);
        fiddle.push([m2n(69), 4]);
        flavor.push([null, 4]);
        continue;
      }

      // STOMP motor — boots on 1 & 3 (bar-0 entry, no intro)
      stomp.push([m2n(KK), 0.15], [null, 1.85], [m2n(KK), 0.15], [null, 1.85]);
      // BACKBEAT clap on 2 & 4
      back.push([null, 1], [m2n(BK), 0.15], [null, 1.85], [m2n(BK), 0.15], [null, 0.85]);
      // BASS oom-pah: root 1&3, fifth 2&4
      bass.push([m2n(root), 0.4], [null, 0.6], [m2n(fifth), 0.35], [null, 0.65],
                [m2n(root), 0.4], [null, 0.6], [m2n(fifth), 0.35], [null, 0.65]);
      // CONCERTINA squeeze — offbeat chord-third stabs on the swung offs
      if (sec !== 'B') {
        var m3 = m2n(chord[1]);
        squeeze.push([null, 0.667], [m3, 0.2], [null, 0.8], [m3, 0.2], [null, 0.8], [m3, 0.2], [null, 0.8], [m3, 0.2], [null, 0.133]);
      } else squeeze.push([null, 4]);

      // LEAD melody per section
      if (sec === 'A') pushCell(lead, VERSE_CELL, 0);
      else if (sec === 'B') pushCell(lead, ((b - 16) % 4 < 2) ? CALL_CELL : ANSW_CELL, 0);
      else if (sec === 'C') pushCell(lead, CHORUS_CELL, 0);
      else if (sec === 'D') lead.push([null, 4]);                 // fiddle rules
      else if (sec === 'E') pushCell(lead, VERSE_CELL, -12);      // storm verse, low
      else pushCell(lead, CHORUS_CELL, 0);                        // F finale

      // CREW unison harmony (fifth) under chorus + B answers
      if (big || (sec === 'B' && (b - 16) % 4 >= 2)) crew.push([m2n(chord[0]), 2], [m2n(chord[2]), 2]);
      else crew.push([null, 4]);

      // FIDDLE break runs (D) — swung 8ths; light countermelody in F
      if (sec === 'D') { for (var e = 0; e < 4; e++) fiddle.push([m2n(RUN[e * 2] + 12), 0.667], [m2n(RUN[e * 2 + 1] + 12), 0.333]); }
      else if (sec === 'F') fiddle.push([m2n(RUN[b % 4] + 12), 1], [null, 1], [m2n(RUN[(b + 2) % 4] + 12), 1], [null, 1]);
      else fiddle.push([null, 4]);

      // FLAVOR — section-door blips + tambourine ticks in big/fiddle bars
      if (DOORS[b]) flavor.push([m2n(81), 0.3], [m2n(85), 0.3], [null, 3.4]);
      else if (big || sec === 'D') flavor.push([m2n(93), 0.25], [null, 0.75], [m2n(93), 0.25], [null, 0.75], [m2n(93), 0.25], [null, 0.75], [m2n(93), 0.25], [null, 0.75]);
      else flavor.push([null, 4]);
    }

    var TR = [stomp, back, bass, squeeze, lead, crew, fiddle, flavor];
    TR.forEach(function (n) {
      var sum = 0; n.forEach(function (x) { sum += x[1]; });
      if (Math.abs(sum - 360) > 1e-6) throw new Error('HEAVE HO track beat mismatch: ' + sum);
    });
    return {
      bpm: 120,
      tracks: [
        { type: 'triangle', vol: 0.20, notes: stomp },   // deck STOMP motor
        { type: 'square',   vol: 0.05, notes: back },     // backbeat clap
        { type: 'triangle', vol: 0.13, notes: bass },     // oom-pah bass
        { type: 'square',   vol: 0.045, notes: squeeze }, // concertina offbeats
        { type: 'square',   vol: 0.16, notes: lead },     // shantyman / chorus lead
        { type: 'sawtooth', vol: 0.05, notes: crew },     // crew unison harmony
        { type: 'triangle', vol: 0.08, notes: fiddle },   // fiddle break
        { type: 'square',   vol: 0.03, notes: flavor }    // doors + tambourine
      ]
    };
  })();

  // ---- "THE LAST TIDE" — the belly's TRANCE mix (2026-07-19, Red: "crazy,
  // frantic, euphoric... a full 10-min mix"). Plays BOTH acts (guts + sand
  // arena). 144 BPM, 4-on-floor kick, rolling offbeat bass, gated 16th arps,
  // lush pads, a soaring chord-tone anthem lead, kickless breakdowns, risers,
  // key-changes and fast solo runs across a ~10-minute journey (loops clean —
  // every track advances 4 beats/bar in lockstep). Procedural = no giant literal.
  var LAST_TIDE = (function () {
    var NM = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    function m2n(m){ return m == null ? null : NM[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
    var Am=[57,60,64], F=[53,57,60], C=[48,52,55], G=[55,59,62], Dm=[50,53,57], Bb=[58,62,65], E=[52,56,59];
    var P0=[Am,F,C,G], P1=[Dm,Bb,F,C], P2=[Am,G,F,E], P3=[C,G,Am,F];
    var kick=[], bass=[], arp=[], arp2=[], padA=[], padB=[], lead=[];
    function push(a, arr){ for (var i=0;i<arr.length;i++) a.push(arr[i]); }
    function fix(cell){ var s=0,i; for(i=0;i<cell.length;i++) s+=cell[i][1];
      if (Math.abs(s-4)>1e-6){ if (s<4) cell.push([null,4-s]); else cell[cell.length-1][1]=Math.max(0.0625,cell[cell.length-1][1]-(s-4)); } return cell; }
    function kickBar(){ var o=[],i; for(i=0;i<4;i++){ o.push([m2n(33),0.2]); o.push([null,0.8]); } return o; }
    function bassBar(root){ var r=root-12,o=[],b; for(b=0;b<4;b++){ o.push([null,0.25]); o.push([m2n(r),0.25]); o.push([m2n(r),0.25]); o.push([m2n(r),0.25]); } return o; }
    function arpBar(ch,oct){ var s=[ch[0],ch[1],ch[2],ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12,ch[0]+12,ch[2],ch[1]+12,ch[0]+12,ch[2]+12,ch[1]+12,ch[0]+12,ch[2],ch[1]+12],o=[],i;
      for(i=0;i<16;i++) o.push([m2n(s[i]+12*(oct||0)),0.25]); return o; }
    function anthem(ch,oct){ var r=(oct||0)*12; return [[m2n(ch[2]+12+r),1],[m2n(ch[0]+24+r),1],[m2n(ch[1]+12+r),2]]; }
    function anthemB(ch,oct){ var r=(oct||0)*12; return [[m2n(ch[0]+24+r),1],[m2n(ch[2]+12+r),1],[m2n(ch[1]+24+r),0.5],[m2n(ch[2]+12+r),0.5],[m2n(ch[0]+24+r),1]]; }
    function brk(ch){ return [[m2n(ch[0]+12),2],[m2n(ch[2]+12),2]]; }
    function brk2(ch){ return [[m2n(ch[2]+12),2],[m2n(ch[1]+24),2]]; }
    function riser(i){ var d=[69,71,72,74,76,77,79,81][i%8]; return [[m2n(d),0.5],[m2n(d),0.5],[m2n(d),0.5],[m2n(d),0.5],[m2n(d),0.25],[m2n(d),0.25],[m2n(d),0.25],[m2n(d),0.25],[m2n(d),0.5]]; }
    function solo(ch,i){ var sc=[ch[0]+12,ch[1]+12,ch[2]+12,ch[0]+24,ch[1]+24,ch[2]+24,ch[1]+24,ch[0]+24,ch[2]+12,ch[1]+24,ch[0]+24,ch[2]+24,ch[1]+24,ch[0]+24,ch[2]+12,ch[1]+12],o=[],k;
      for(k=0;k<16;k++) o.push([m2n(sc[(i*3+k)%16]),0.25]); return o; }
    function sect(bars, prog, o){ o=o||{};
      for (var i=0;i<bars;i++){ var ch=prog[i%prog.length];
        if (o.kick===false){ kick.push([null,4]); bass.push([m2n(ch[0]-12),4]); }
        else { push(kick,kickBar()); push(bass,bassBar(ch[0])); }
        if (o.arp===false) arp.push([null,4]); else push(arp,arpBar(ch,o.arpoct||0));
        if (o.arp2) push(arp2,arpBar(ch,(o.arpoct||0)+1)); else arp2.push([null,4]);
        if (o.pad===false){ padA.push([null,4]); padB.push([null,4]); }
        else { padA.push([m2n(ch[0]),4]); padB.push([m2n(ch[1]),2]); padB.push([m2n(ch[2]),2]); }
        var lt=o.lead||'rest', cell;
        if (lt==='anthem') cell=anthem(ch,o.leadoct||0); else if (lt==='anthemB') cell=anthemB(ch,o.leadoct||0);
        else if (lt==='break') cell=brk(ch); else if (lt==='break2') cell=brk2(ch);
        else if (lt==='riser') cell=riser(i); else if (lt==='solo') cell=solo(ch,i); else cell=[[null,4]];
        var cc=[],j; for(j=0;j<cell.length;j++) cc.push([cell[j][0],cell[j][1]]);
        push(lead, fix(cc));
      }
    }
    // ===== the ~10-minute journey (360 bars @144 BPM = 600.0s) =====
    sect(16,P0,{lead:'rest',pad:false});                         // intro pulse
    sect(8, P0,{lead:'rest'});                                   // pads bloom
    sect(16,P0,{arpoct:1,lead:'anthem'});                        // DROP 1
    sect(8, P0,{arpoct:1,lead:'rest'});                          // groove
    sect(16,P0,{kick:false,arp:false,lead:'break'});             // BREAKDOWN 1
    sect(8, P0,{arpoct:1,lead:'riser'});                         // riser
    sect(24,P0,{arpoct:1,arp2:true,lead:'anthem',leadoct:1});    // DROP 2 (big)
    sect(8, P0,{arpoct:1,lead:'rest'});
    sect(16,P1,{arpoct:1,lead:'anthem'});                        // key lift → P1
    sect(16,P1,{arpoct:1,arp2:true,lead:'anthemB',leadoct:1});   // DROP 3
    sect(24,P2,{kick:false,arp:false,lead:'break2'});            // BIG BREAKDOWN 2 (dark)
    sect(8, P2,{arpoct:1,lead:'riser'});
    sect(16,P2,{arpoct:1,arp2:true,lead:'solo'});                // SOLO run section
    sect(24,P0,{arpoct:1,arp2:true,lead:'anthem',leadoct:1});    // MEGA DROP
    sect(8, P0,{arpoct:1,lead:'rest'});
    sect(16,P3,{arpoct:1,lead:'anthem'});                        // P3 uplift
    sect(24,P1,{arpoct:1,arp2:true,lead:'anthemB',leadoct:1});   // DROP 4
    sect(16,P0,{kick:false,arp:false,lead:'break'});             // BREAKDOWN 3
    sect(8, P0,{arpoct:1,lead:'riser'});
    sect(32,P0,{arpoct:1,arp2:true,lead:'anthemB',leadoct:1});   // FINAL DROP (climax)
    sect(16,P3,{arpoct:1,arp2:true,lead:'solo'});                // outro solo
    sect(16,P0,{arpoct:0,lead:'rest'});                          // outro → loop
    return { bpm:144, tracks:[
      { type:'triangle', vol:0.30, notes:kick },   // 4-on-floor kick
      { type:'sawtooth', vol:0.16, notes:bass },   // rolling offbeat bass
      { type:'square',   vol:0.055, notes:arp },   // gated hypnotic arp
      { type:'square',   vol:0.045, notes:arp2 },  // octave counter-arp (drops)
      { type:'sawtooth', vol:0.05, notes:padA },   // pad root
      { type:'sawtooth', vol:0.045, notes:padB },  // pad 3rd/5th
      { type:'square',   vol:0.17, notes:lead }    // soaring anthem / solos
    ]};
  })();

  MAPS.register({
    id: 'belly',

    installData: function (DATA) {
      DATA.biomes.belly = {
        name: 'Belly of the Beast', tile: 'bellylining',
        mobs: ['drownedFisherman', 'gutLobster', 'seaSnake', 'bellyStarfish', 'mermaid',
               'swallowedPirate', 'skeletonDeckhand', 'shipRatPack', 'bilgeParrot', 'gutCrab',
               'acidSlug', 'bileJelly', 'lamprey', 'gutWorm', 'krillCloud', 'fleshPolyp']
      };
      DATA.realms.belly = {
        name: 'The Pinnacle of Corruption', biome: 'belly', boss: 'titanWhale',   // 2026-07-19 Red rename (was "Belly of the Beast")
        kind: 'belly', music: 'sandArena',   // 2026-07-19 (Red): the trance mix drives BOTH acts
        // "???" NAME REVEAL — realm select shows hidden name until first clear
        nameReveal: { hidden: '???', revealOnFirstClear: true },
        // INTRO/OUTRO cinematics (beats verbatim; skippable on repeat)
        cinematicCfg: {
          skipRepeat: true,
          introBlurb: 'thats weird... isnt there supposed to be stuff for me to kill?',
          introBeats: ['deck', 'blurb', 'waves', 'breach', 'swallow', 'wake'],
          // the meta line shown ON SCREEN right after the whale swallows you (Red, verbatim)
          swallowLine: 'the simulation is running out of content to give you, and the whale is the system devouring its own last asset.',
          outroBeats: ['gag', 'beach', 'spit', 'arena']
        },
        // DIGESTION TIDE — the signature map cycle (ALL TUNE ME)
        tideCfg: { cycleMs: 16000, gurgleMs: 1600, riseMs: 5200, recedeMs: 2600,
                   dmg: 9, tickMs: 700, zoneR: 150 },
        // THE UVULA — the exit trigger (attackable set piece)
        uvulaCfg: { hp: 260, triggersOutro: true },
        // ARENA — the beached-whale boss stage (bounded, no wrap)
        arenaCfg: { stage: 'beach', bounded: true, rx: 520, ry: 300 },
        // TWO-ACT (2026-07-19): ACT 1 clears the guts (kills → beaching cutscene);
        // ACT 2 = the BIG sand map — a 1000-kill any-realm horde + the 1.5x whale.
        gutsCfg: { goal: 55 },
        // HIGHER RAMP RATE inside the whale (Red, 2026-07-19): the director budget
        // is scaled by this in directorSpend — the guts should feel much hotter
        // than a normal realm from the outset. (Red trimmed this 25% off the
        // original 2.5 on 2026-07-19 — the guts were a touch too hot.)
        spawnMult: 1.875,
        hordeCfg: { goal: 1000, intervalMs: 640, burst: 5, maxCap: 52, rampMs: 6000 }
      };

      // ---- the 16 mobs (Red: "use the rest" — all but 13/14/15/20) ----
      DATA.mobs.drownedFisherman = { name: 'Drowned Fisherman', texture: 'bellyFishermanHi', hp: 60, spd: 55, xp: 18, cost: 2,
        deathTint: 0xc8b04a, chase: { contactDmg: 9 },
        mapVerb: 'fishermanCast',                             // hooked-lure lane + gaff up close
        cast: { everyMs: 5200, range: 460, warnMs: 1000, len: 520, half: 20, dmg: 16, pull: 60 },
        unlockAt: 0 };
      DATA.mobs.gutLobster = { name: 'Gut Lobster', texture: 'bellyLobsterHi', hp: 150, spd: 60, xp: 26, cost: 3,
        deathTint: 0xc84a3a, chase: { contactDmg: 12 },
        mapVerb: 'lobsterCharge',                             // warned snip-charge lane → pinch
        charge: { everyMs: 5400, range: 460, warnMs: 900, len: 480, half: 26, chargeMs: 1000, speed: 430, dmg: 18 },
        unlockAt: 20 };
      DATA.mobs.seaSnake = { name: 'Sea Snake', texture: 'bellySeaSnakeHi', hp: 70, spd: 80, xp: 20, cost: 2,
        deathTint: 0x2a3a44, chase: { contactDmg: 10 },
        mapVerb: 'snakeStrike',                               // wrap-aware S-strike + venom puddle
        strike: { everyMs: 5000, range: 440, warnMs: 950, len: 480, half: 20, strikeMs: 1100, speed: 400,
                  venomMs: 3600, venomDmg: 4, venomTickMs: 800, venomR: 46 },
        unlockAt: 15 };
      DATA.mobs.bellyStarfish = { name: 'Crimson Starfish', texture: 'bellyStarfishHi', hp: 44, spd: 70, xp: 14, cost: 2,
        deathTint: 0xe05a3a, chase: { contactDmg: 6 },
        mapVerb: 'starfishLeap',                              // warned leap → LATCH dot
        leap: { range: 260, warnMs: 600, dashMs: 320, dashSpeed: 430, latchMs: 900,
                drainTickMs: 300, drainDmg: 3, cooldownMs: 4200 },
        unlockAt: 25 };
      DATA.mobs.mermaid = { name: 'Mermaid', texture: 'bellyMermaidHi', hp: 55, spd: 55, xp: 20, cost: 3,
        deathTint: 0x7df9d8,                                  // harmless lure — NO chase (keg lesson)
        mapVerb: 'mermaidCharm',                              // charm cone → brief capped pull (displacement)
        charm: { everyMs: 5600, range: 320, warnMs: 900, halfRad: 0.5, pull: 150, dispMs: 900 },
        maxConcurrent: 2, unlockAt: 30 };
      DATA.mobs.swallowedPirate = { name: 'Swallowed Pirate', texture: 'bellyPirateHi', hp: 80, spd: 75, xp: 20, cost: 3,
        deathTint: 0xd84a4a, chase: { contactDmg: 12 },
        mapVerb: 'pirateLunge',                               // warned cutlass lunge
        lunge: { everyMs: 4600, range: 300, warnMs: 700, dashMs: 300, dashSpeed: 400, dmg: 14 },
        unlockAt: 10 };
      DATA.mobs.skeletonDeckhand = { name: 'Skeleton Deckhand', texture: 'bellyDeckhandHi', hp: 65, spd: 60, xp: 18, cost: 2,
        deathTint: 0xe8dcc4, chase: { contactDmg: 10 },
        mapVerb: 'deckhandChop',                              // warned overhead axe circle
        chop: { everyMs: 4400, range: 150, warnMs: 800, radius: 70, dmg: 16 },
        unlockAt: 10 };
      DATA.mobs.shipRatPack = { name: 'Ship Rat Pack', texture: 'bellyRatsHi', hp: 24, spd: 140, xp: 8, cost: 1,
        deathTint: 0x6a5a4a, chase: { contactDmg: 5 },        // fast swarm nippers
        maxConcurrent: 4, unlockAt: 0 };
      DATA.mobs.bilgeParrot = { name: 'Bilge Parrot', texture: 'bellyParrotHi', hp: 30, spd: 120, xp: 12, cost: 2,
        deathTint: 0xd84a4a, float: true,
        mapVerb: 'parrotDive',                                // circles high; shadow-marked dive peck
        dive: { everyMs: 4200, range: 340, warnMs: 850, dashMs: 260, dashSpeed: 460, dmg: 12, radius: 40 },
        unlockAt: 20 };
      DATA.mobs.gutCrab = { name: 'Gut Crab', texture: 'bellyCrabHi', hp: 170, spd: 40, xp: 26, cost: 3,
        deathTint: 0xa86a3a, chase: { contactDmg: 12 },
        mapVerb: 'crabBlock',                                 // frontal shield stance + warned pincer grab
        block: { everyMs: 5200, range: 130, warnMs: 800, radius: 66, dmg: 18, guardMult: 0.35, stanceMs: 1600 },
        unlockAt: 35 };
      DATA.mobs.acidSlug = { name: 'Acid Slug', texture: 'bellySlugHi', hp: 70, spd: 35, xp: 18, cost: 2,
        deathTint: 0x9ae83a, chase: { contactDmg: 7 },
        mapVerb: 'slugLob',                                   // warned glob arcs → burn puddles
        lob: { everyMs: 5000, range: 420, count: 2, scatter: 130, radius: 60, warnMs: 900,
               dmg: 12, puddleMs: 4000, puddleDmg: 4, puddleTickMs: 800 },
        unlockAt: 30 };
      DATA.mobs.bileJelly = { name: 'Bile Jelly', texture: 'bellyJellyHi', hp: 40, spd: 45, xp: 14, cost: 2,
        deathTint: 0xc8d84a, float: true, chase: { contactDmg: 8 },
        popsOnDeath: true,                                    // POPS on death — small warned burst
        pop: { warnMs: 500, radius: 60, dmg: 12 },
        unlockAt: 25 };
      DATA.mobs.lamprey = { name: 'Lamprey', texture: 'bellyLampreyHi', hp: 50, spd: 90, xp: 16, cost: 2,
        deathTint: 0x5a6a8a, chase: { contactDmg: 6 },
        mapVerb: 'lampreyLaunch',                             // warned launch line → latch + drain (capped)
        launch: { range: 280, warnMs: 600, dashMs: 300, dashSpeed: 450, latchMs: 900,
                  drainTickMs: 300, drainDmg: 3, cooldownMs: 4200 },
        unlockAt: 40 };
      DATA.mobs.gutWorm = { name: 'Gut Worm', texture: 'bellyWormHi', hp: 90, spd: 30, xp: 22, cost: 3,
        deathTint: 0xc88a7a, chase: { contactDmg: 10 },
        mapVerb: 'wormErupt',                                 // warned eruption circle underfoot
        erupt: { everyMs: 5200, range: 360, warnMs: 950, radius: 80, dmg: 18 },
        unlockAt: 45 };
      DATA.mobs.krillCloud = { name: 'Krill Cloud', texture: 'bellyKrillHi', hp: 60, spd: 55, xp: 16, cost: 2,
        deathTint: 0xffb0a0, float: true, chase: { contactDmg: 4 },   // ONE actor, chip cloud
        mapVerb: 'krillCloud',                                // disperses under AoE (when shot)
        krill: { disperseMs: 1400, chipMs: 500, chipDmg: 3, chipR: 46 },
        maxConcurrent: 2, unlockAt: 50 };
      DATA.mobs.fleshPolyp = { name: 'Flesh Polyp', texture: 'bellyPolypHi', hp: 110, spd: 0, xp: 20, cost: 3,
        deathTint: 0xa84a52,                                  // stationary spawner — NO chase
        mapVerb: 'polypVent',                                 // warned gas-vent circle; pops KRILL on death
        vent: { everyMs: 5400, range: 260, warnMs: 950, radius: 90, dmg: 6, slowMult: 0.55, slowMs: 1200 },
        popsKrill: { count: 2, cap: 6 },
        maxConcurrent: 2, unlockAt: 55 };

      // ---- THE TITAN WHALE · THE MOUTH YOU CAME IN THROUGH (mapOwned) ----
      // STATIONARY boss (never moves — player circles). WATER GUN signature.
      DATA.bosses.titanWhale = {
        name: 'The Titan Whale', texture: 'bellyTitanWhaleHi',
        hp: 4200, spd: 0, xp: 620, contactDmg: 22, deathTint: 0xb8c2d0,
        lootTable: 'titanWhale',
        mapOwned: true, entranceMs: 3400, stationary: true,
        patterns: {
          verbEveryMs: 5200,
          mortars:  { count: 4, scatter: 380, radius: 66, warnMs: 950, gapMs: 400, dmg: 20,
                      wetMs: 2600, wetSlow: 0.6 },            // P2 leaves wet-sand slow patches
          inhale:   { range: 520, warnMs: 1100, halfRad: 0.6, pull: 220, dispMs: 1000,
                      chompMs: 500, chompR: 130, chompDmg: 30 },
          flipper:  { warnMs: 1000, ringMs: 1100, maxR: 340, dmg: 22, gaps: 3, gapHalf: 0.5 },
          cough:    { everyMs: 15000, count: 3, cap: 10 },
          waterGun: { chargeMs: 1400, sweepMs: 1600, corridorHalf: 60, dmg: 9999, oneShot: true, everyVerbs: 1,   // 2026-07-19 Red: TRUE one-shot snipe, 3x frequency (every verb)
                      ventMs: 3400, ventDmgMult: 1.5 },
          p2:       { hpPct: 0.5 }
        },
        title: 'THE MOUTH YOU CAME IN THROUGH',
        hints: [
          "It NEVER moves — everything else does. Circle the sand; melee at the tooth line risks the CHOMP.",
          "The cheeks PUFF before the WATER GUN — get off the marked corridor before the jet rakes it.",
          "Don't fight the INHALE — run sideways out of the pull cone before it snaps shut on a CHOMP.",
          "SPRAY MORTARS rain their circles IN ORDER — keep moving and read the sequence.",
          "The FLIPPER SLAM ring has telegraphed SAFE GAPS — stand in a gap, not the wall.",
          "When it SLUMPS gasping after the water gun, it's vented — unload while the throat's slack."
        ]
      };
      DATA.dropTables.titanWhale = { rolls: 2, entries: [
        { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
        { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
        { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
        { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
        { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
      ]};

      // ---- SFX (PLAN §8) + the theme ----
      DATA.audio.sounds.tidegurgle = { type: 'triangle', freq: 70, freqEnd: 130, len: 0.9, vol: 0.15, limitMs: 1000,
                                       noise: { vol: 0.05, hp: 200 } };
      DATA.audio.sounds.acidrush = { type: 'sawtooth', freq: 220, freqEnd: 90, len: 0.7, vol: 0.1, limitMs: 800,
                                     noise: { vol: 0.08, hp: 500 } };
      DATA.audio.sounds.acidsizzle = { type: 'sawtooth', freq: 2400, freqEnd: 1600, len: 0.5, vol: 0.06, limitMs: 600,
                                       noise: { vol: 0.06, hp: 2800 } };
      DATA.audio.sounds.uvulahit = { type: 'square', freq: 500, freqEnd: 160, len: 0.22, vol: 0.13, limitMs: 260,
                                     noise: { vol: 0.06, hp: 700 } };
      DATA.audio.sounds.thegag = { type: 'sawtooth', freq: 300, freqEnd: 70, len: 1.1, vol: 0.16, limitMs: 1200,
                                   noise: { vol: 0.1, hp: 300 } };
      DATA.audio.sounds.snakestrike = { type: 'square', freq: 2200, freqEnd: 1100, len: 0.28, vol: 0.08, limitMs: 320,
                                        noise: { vol: 0.06, hp: 3000 } };
      DATA.audio.sounds.starlatch = { type: 'square', freq: 320, freqEnd: 640, len: 0.18, vol: 0.12, limitMs: 240 };
      DATA.audio.sounds.mermaidsong = { type: 'triangle', arp: [660, 784, 880, 784], len: 0.6, vol: 0.1, limitMs: 700 };
      DATA.audio.sounds.cutlass = { type: 'square', freq: 900, freqEnd: 260, len: 0.2, vol: 0.12, limitMs: 250 };
      DATA.audio.sounds.axechop = { type: 'triangle', freq: 300, freqEnd: 120, len: 0.24, vol: 0.14, limitMs: 300,
                                    noise: { vol: 0.07, hp: 600 } };
      DATA.audio.sounds.parrotscreech = { type: 'sawtooth', freq: 1600, freqEnd: 2400, len: 0.25, vol: 0.09, limitMs: 320 };
      DATA.audio.sounds.crabpincer = { type: 'square', freq: 700, freqEnd: 300, len: 0.2, vol: 0.12, limitMs: 260,
                                       noise: { vol: 0.05, hp: 900 } };
      DATA.audio.sounds.slugglob = { type: 'square', freq: 1300, freqEnd: 380, len: 0.2, vol: 0.11, limitMs: 250,
                                     noise: { vol: 0.07, hp: 1800 } };
      DATA.audio.sounds.jellypop = { type: 'sawtooth', freq: 900, freqEnd: 140, len: 0.28, vol: 0.13, limitMs: 320,
                                     noise: { vol: 0.09, hp: 700 } };
      DATA.audio.sounds.lampreylaunch = { type: 'square', freq: 260, freqEnd: 560, len: 0.18, vol: 0.12, limitMs: 240 };
      DATA.audio.sounds.wormerupt = { type: 'sawtooth', freq: 120, freqEnd: 320, len: 0.4, vol: 0.14, limitMs: 460,
                                      noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.polypvent = { type: 'sawtooth', freq: 2000, freqEnd: 1400, len: 0.55, vol: 0.06, limitMs: 650,
                                      noise: { vol: 0.06, hp: 2600 } };
      DATA.audio.sounds.mortarlaunch = { type: 'triangle', freq: 200, freqEnd: 480, len: 0.24, vol: 0.13, limitMs: 300 };
      DATA.audio.sounds.mortarimpact = { type: 'square', freq: 600, freqEnd: 120, len: 0.4, vol: 0.15, limitMs: 480,
                                         noise: { vol: 0.1, hp: 600 } };
      DATA.audio.sounds.inhalewind = { type: 'sawtooth', freq: 300, freqEnd: 900, len: 0.9, vol: 0.08, limitMs: 1000,
                                       noise: { vol: 0.07, hp: 500 } };
      DATA.audio.sounds.chomp = { type: 'square', freq: 400, freqEnd: 90, len: 0.28, vol: 0.16, limitMs: 340,
                                  noise: { vol: 0.1, hp: 400 } };
      DATA.audio.sounds.flipperslam = { type: 'sawtooth', freq: 90, freqEnd: 240, len: 0.7, vol: 0.15, limitMs: 800,
                                        noise: { vol: 0.1, hp: 350 } };
      DATA.audio.sounds.gutcough = { type: 'sawtooth', freq: 180, freqEnd: 60, len: 0.6, vol: 0.14, limitMs: 700,
                                     noise: { vol: 0.09, hp: 300 } };
      DATA.audio.sounds.mawalight = { type: 'triangle', freq: 120, freqEnd: 360, len: 0.7, vol: 0.14, limitMs: 800 };
      DATA.audio.sounds.waterguncharge = { type: 'square', freq: 500, freqEnd: 1400, len: 0.9, vol: 0.1, limitMs: 1000 };
      DATA.audio.sounds.waterjet = { type: 'sawtooth', freq: 200, freqEnd: 700, len: 1.2, vol: 0.15, limitMs: 1300,
                                     noise: { vol: 0.12, hp: 500 } };
      DATA.audio.sounds.whalegasp = { type: 'sawtooth', freq: 400, freqEnd: 110, len: 1.0, vol: 0.13, limitMs: 1100,
                                      noise: { vol: 0.08, hp: 400 } };
      DATA.audio.sounds.whaleroar = { type: 'sawtooth', freq: 90, freqEnd: 200, len: 1.3, vol: 0.16, limitMs: 1400,
                                      noise: { vol: 0.1, hp: 300 } };
      DATA.audio.sounds.swallowcrunch = { type: 'sawtooth', freq: 260, freqEnd: 70, len: 0.9, vol: 0.15, limitMs: 1000,
                                          noise: { vol: 0.12, hp: 400 } };
      DATA.audio.sounds.beachslide = { type: 'sawtooth', freq: 140, freqEnd: 60, len: 1.0, vol: 0.13, limitMs: 1100,
                                       noise: { vol: 0.1, hp: 300 } };
      DATA.audio.music.belly = HEAVE_HO;             // the sea shanty (kept; belly now runs the trance)
      DATA.audio.music.sandArena = LAST_TIDE;        // THE LAST TIDE — belly's trance mix (BOTH acts)

      // M7k AUDIT fix: the "???" reveal was dead code — the console row was
      // registered with the FIXED name '???' and BE.realmName() was never
      // called. Route the registration through the reveal check so a cleared
      // save boots with the real name (markCleared handles the live flip).
      var revealName = '???';
      try {
        if (typeof BELLY_SCENE !== 'undefined' && BELLY_SCENE.realmName) revealName = BELLY_SCENE.realmName();
      } catch (e) { revealName = '???'; }
      MAPS.addConsoleMap(DATA, { id: 'belly', name: revealName,
        sub: 'is there supposed to be stuff to kill?', locked: false });
    },

    buildArt: function (ctx) {
      if (typeof BELLY_ART !== 'undefined') BELLY_ART.buildInto(ctx);
    },

    mobVerbs: {
      fishermanCast: function (scene, m, player, time) { return scene._bFisherman(m, player, time); },
      lobsterCharge: function (scene, m, player, time) { return scene._bLobster(m, player, time); },
      snakeStrike: function (scene, m, player, time) { return scene._bSnake(m, player, time); },
      starfishLeap: function (scene, m, player, time) { return scene._bStarfish(m, player, time); },
      mermaidCharm: function (scene, m, player, time) { return scene._bMermaid(m, player, time); },
      pirateLunge: function (scene, m, player, time) { return scene._bPirate(m, player, time); },
      deckhandChop: function (scene, m, player, time) { return scene._bDeckhand(m, player, time); },
      parrotDive: function (scene, m, player, time) { return scene._bParrot(m, player, time); },
      crabBlock: function (scene, m, player, time) { return scene._bCrab(m, player, time); },
      slugLob: function (scene, m, player, time) { return scene._bSlug(m, player, time); },
      lampreyLaunch: function (scene, m, player, time) { return scene._bLamprey(m, player, time); },
      wormErupt: function (scene, m, player, time) { return scene._bWorm(m, player, time); },
      krillCloud: function (scene, m, player, time) { return scene._bKrill(m, player, time); },
      polypVent: function (scene, m, player, time) { return scene._bPolyp(m, player, time); }
    },

    scene: (typeof BELLY_SCENE !== 'undefined') ? BELLY_SCENE : {}
  });
})();
