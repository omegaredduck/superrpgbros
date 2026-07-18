// ============================================================================
// game/js/maps/belly/scene.js — BELLY OF THE BEAST scene hooks (realm 20).
// The scene-plan PNG (assets/belly_scene_plan.png) is canon: THE WRECK center
// (SPAWN on the swallowed deck) · RIB VAULTS N behind baleen curtains · DEEP
// GUT E · ACID LAKES S (the tide source) + SHALLOWS SE · TREASURE HEAP SE ·
// THE GULLET W → THE UVULA at the far end · GRISTLE PATH rings W-E · lantern
// rigs light the dark. Two stages: GUTS (toroidal both axes) and the ARENA
// (bounded beach — no wrap). DIGESTION TIDE is the signature cycle: GURGLE
// warn → walls flex → acid spreads N out of the lakes as warned zones →
// RECEDE; high ground (wreck deck / gristle path / vault shelves / gullet
// pocket) never floods. THE UVULA is a shootable set piece — kill it and the
// whale GAGS → OUTRO → the SAND ARENA → THE TITAN WHALE (STATIONARY; you
// circle + dodge; WATER GUN signature vents it ×1.5). Displacement is a shared
// cooldown tag (mermaid charm + boss inhale). "???" reveal persists on first
// clear. All hooks reset their own state in setup() — Phaser reuses instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var Z_WRECK = [0.49, 0.52], Z_VAULT = [0.47, 0.17], Z_DEEPGUT = [0.85, 0.4];
  var LAKES = [[0.35, 0.84], [0.69, 0.87]], Z_TREASURE = [0.89, 0.81];
  var Z_GULLET = [0.12, 0.47], UVULA = [0.055, 0.47];
  var DECOR = [
    ['bdRibArch', 0.34, 0.14, 2.0], ['bdRibArch', 0.6, 0.14, 2.0], ['bdBaleen', 0.47, 0.1, 2.2],
    ['bdMast', 0.44, 0.46, 1.8], ['bdSail', 0.53, 0.47, 1.7], ['bdCrates', 0.55, 0.56, 1.4],
    ['bdBarrel', 0.42, 0.58, 1.3], ['bdWheel', 0.49, 0.6, 1.4], ['bdLanterns', 0.3, 0.4, 1.8],
    ['bdLanterns', 0.7, 0.4, 1.8], ['bdLanterns', 0.5, 0.3, 1.6],
    ['bdSpire', 0.8, 0.3, 1.6], ['bdVeins', 0.86, 0.46, 1.6], ['bdAcidPool', 0.35, 0.84, 2.2],
    ['bdAcidPool', 0.69, 0.87, 2.0], ['bdChest', 0.89, 0.81, 1.5], ['bdAmbergris', 0.83, 0.86, 1.4],
    ['bdAnchor', 0.2, 0.62, 1.5], ['bdCannon', 0.62, 0.66, 1.5], ['bdDinghy', 0.26, 0.82, 1.5],
    ['bdTrap', 0.78, 0.74, 1.3], ['bdNet', 0.16, 0.3, 1.5], ['bdSkeleton', 0.7, 0.22, 1.6],
    ['bdKelp', 0.4, 0.72, 1.4]
  ];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }
  var GREEN = 0x9ae83a, GREENLT = 0xd8ffa0, PINK = 0xff9ab0, WATER = 0x5aaccc;

  var BE = {

    // ---- "???" reveal (persisted on first clear) ----
    realmName: function () {
      try { if (typeof localStorage !== 'undefined' && localStorage.getItem('srb_belly_cleared') === '1') return 'Belly of the Beast'; } catch (e) {}
      return '???';
    },
    markCleared: function () {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('srb_belly_cleared', '1'); } catch (e) {}
      // M7k AUDIT fix: reveal the console row LIVE in this session too — the
      // row was registered '???' at boot and nothing ever renamed it.
      try {
        if (typeof DATA !== 'undefined' && DATA.console && DATA.console.maps) {
          for (var i = 0; i < DATA.console.maps.length; i++) {
            if (DATA.console.maps[i].id === 'belly') DATA.console.maps[i].name = 'Belly of the Beast';
          }
        }
      } catch (e) {}
    },

    // ---- INTRO CINEMATIC — the SWALLOW beat, and the meta line on screen ----
    // Beats: you come to on the swallowed deck (blurb) → the whale SWALLOWS you
    // → the game's own admission appears (Red's line, verbatim). First-time only;
    // skips on repeat (cinematicCfg.skipRepeat) via the srb_belly_intro flag.
    _wrapCaption: function (s, max) {
      var words = String(s).split(' '), lines = [], cur = '';
      for (var i = 0; i < words.length; i++) {
        if (cur && (cur + ' ' + words[i]).length > max) { lines.push(cur); cur = words[i]; }
        else cur = cur ? cur + ' ' + words[i] : words[i];
      }
      if (cur) lines.push(cur);
      return lines.join('\n');
    },
    _playIntro: function (scene, C, time) {
      C.introStarted = true;
      var cc = (scene.realmDef && scene.realmDef.cinematicCfg) || {};
      // beat 1 — you wake on the wrecked deck, ship and all: the player's blurb
      scene.banner('SWALLOWED WHOLE — SHIP AND ALL\n' + (cc.introBlurb || ''), '#d8fff2');
      // beat 2 — THE SWALLOW: the crunch, then the game's confession (Red, verbatim)
      var line = BE._wrapCaption(cc.swallowLine || '', 46);
      scene.time.delayedCall(2600, function () {
        try { AUDIO.play('swallowcrunch'); } catch (e) {}
        if (line) scene.banner(line, '#7fe8d8');
      });
      // mark seen so it plays once (skip-on-repeat)
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('srb_belly_intro', '1'); } catch (e) {}
    },

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._belly = {
        stage: 'guts',
        zones: [], mLanes: [], rings: [], patches: [], mobWarns: [],
        latch: null, dispUntil: 0, bossArmed: false,
        tide: { nextAt: 0, phase: 'idle', gurgleUntil: 0, riseUntil: 0, recedeUntil: 0, zones: [], flexG: null },
        uvula: null, uvulaGagged: false, cinematic: null, acidTiles: [], acidFrame: 0, acidNextAt: 0,
        tracked: {}, popsThisFrame: 0,
        arena: { x: 0.5 * WW, y: 0.62 * HH, rx: scene.realmDef.arenaCfg.rx, ry: scene.realmDef.arenaCfg.ry },
        wreck: { x: Z_WRECK[0] * WW, y: Z_WRECK[1] * HH, rx: 0.17 * WW, ry: 0.13 * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- base flesh floor + zone accents (masked ellipses) ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'bellylining').setDepth(-24);
      var accent = function (cx, cy, rx, ry, key, depth) {
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, key).setDepth(depth || -22);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask());
        return spr;
      };
      accent(Z_VAULT[0] * WW, Z_VAULT[1] * HH, 0.26 * WW, 0.11 * HH, 'bellybone');
      accent(Z_DEEPGUT[0] * WW, Z_DEEPGUT[1] * HH, 0.14 * WW, 0.17 * HH, 'bellyfolds');
      accent(Z_TREASURE[0] * WW, Z_TREASURE[1] * HH, 0.1 * WW, 0.08 * HH, 'bellycrust');
      accent(Z_GULLET[0] * WW, Z_GULLET[1] * HH, 0.13 * WW, 0.19 * HH, 'bellygristle');
      // acid lakes (animated shallows)
      LAKES.forEach(function (Lk) {
        C.acidTiles.push(accent(Lk[0] * WW, Lk[1] * HH, 0.16 * WW, 0.07 * HH, 'bellyacid', -21));
      });
      C.acidTiles.push(accent(0.82 * WW, 0.86 * HH, 0.1 * WW, 0.05 * HH, 'bellyacid', -21));
      // gristle path band (the road, W-E) — high safe ground
      var band = scene.add.tileSprite(WW / 2, 0.5 * HH, WW, 0.09 * HH, 'bellygristle').setDepth(-20.5);
      C.pathY = 0.5 * HH; C.pathH = 0.06 * HH;

      // ---- decor + the WRECK deck (hull + rigging = the spawn platform) ----
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });
      scene.add.sprite(C.wreck.x, C.wreck.y + 20, 'bellyHull').setScale(3.2).setDepth(1.5);

      // ---- THE UVULA (gullet end) — shootable set piece w/ hp bar glow ----
      var ux = UVULA[0] * WW, uy = UVULA[1] * HH;
      var uspr = scene.add.sprite(ux, uy, 'bellyUvula').setScale(1.8).setDepth(3);
      var uglow = scene.add.circle(ux, uy + 12, 40, PINK, 0.14).setDepth(1.4);
      scene.tweens.add({ targets: uglow, alpha: { from: 0.1, to: 0.32 }, duration: 900, yoyo: true, repeat: -1 });
      C.uvula = { spr: uspr, glow: uglow, x: ux, y: uy + 12, hp: scene.realmDef.uvulaCfg.hp, maxHp: scene.realmDef.uvulaCfg.hp };

      // ---- spawn ON the wrecked deck ----
      scene._realmStart = { x: C.wreck.x, y: C.wreck.y + 8 };

      // ---- INTRO CINEMATIC state (first-time full; skip on repeat) ----
      var seen = false;
      try { if (typeof localStorage !== 'undefined') seen = localStorage.getItem('srb_belly_intro') === '1'; } catch (e) {}
      C.introSeen = seen;

      // mob-verb helpers (fresh closures)
      scene._bFisherman = function (m, p, t) { return BE._fisherman(scene, m, p, t); };
      scene._bLobster = function (m, p, t) { return BE._lobster(scene, m, p, t); };
      scene._bSnake = function (m, p, t) { return BE._snake(scene, m, p, t); };
      scene._bStarfish = function (m, p, t) { return BE._latchMob(scene, m, p, t, 'leap'); };
      scene._bMermaid = function (m, p, t) { return BE._mermaid(scene, m, p, t); };
      scene._bPirate = function (m, p, t) { return BE._pirate(scene, m, p, t); };
      scene._bDeckhand = function (m, p, t) { return BE._deckhand(scene, m, p, t); };
      scene._bParrot = function (m, p, t) { return BE._parrot(scene, m, p, t); };
      scene._bCrab = function (m, p, t) { return BE._crab(scene, m, p, t); };
      scene._bSlug = function (m, p, t) { return BE._slug(scene, m, p, t); };
      scene._bLamprey = function (m, p, t) { return BE._latchMob(scene, m, p, t, 'launch'); };
      scene._bWorm = function (m, p, t) { return BE._worm(scene, m, p, t); };
      scene._bKrill = function (m, p, t) { return BE._krill(scene, m, p, t); };
      scene._bPolyp = function (m, p, t) { return BE._polyp(scene, m, p, t); };
    },

    afterCreate: function (scene) {
      // no map colliders — the flesh floor is open; safe ground is a tide rule,
      // not a wall (attaching colliders in setup would throw 'isParent').
    },

    _onSafeGround: function (C, x, y) {
      if (Math.hypot(x - C.wreck.x, y - C.wreck.y) < C.wreck.rx) return true;         // wreck deck
      if (Math.abs(y - C.pathY) < C.pathH) return true;                               // gristle path
      return false;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._belly; if (!C) return;
      var p = scene.player, alive = p.state.alive;
      C.popsThisFrame = 0;

      // ---- INTRO CINEMATIC: the SWALLOW beat + the meta line (first time only) ----
      if (!C.introSeen && !C.introStarted && C.stage === 'guts') BE._playIntro(scene, C, time);

      // boss-owned machinery clears when the boss falls — and the whale beaten
      // ONCE reveals BELLY OF THE BEAST permanently (PLAN §1 "???" reveal).
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        BE.markCleared();
        BE._clearBossFx(scene, C);
      }

      // ---- acid shallows animation (phase-shift the current highlights) ----
      if (time >= C.acidNextAt) {
        C.acidNextAt = time + 320;
        C.acidFrame = (C.acidFrame + 1) % 3;
        var key = ['bellyacid', 'bellyacid2', 'bellyacid3'][C.acidFrame];
        C.acidTiles.forEach(function (spr) { if (spr && spr.active) spr.setTexture(key); });
      }

      // ---- DIGESTION TIDE (the signature cycle) ----
      BE._runTide(scene, C, time);

      // ---- THE UVULA — shootable; kill it → the whale GAGS → outro ----
      if (C.uvula && !C.uvulaGagged && C.stage === 'guts') {
        var U = C.uvula, shots = scene.playerShots;
        if (shots) shots.children.iterate(function (s) {
          if (!s || !s.active || !U.spr.active) return;
          if (Math.hypot(s.x - U.x, s.y - U.y) < 34) {
            U.hp -= s.proj ? s.proj.dmg : 5;
            U.spr.setTintFill(0xffffff);
            (function (spr2) { scene.time.delayedCall(50, function () { if (spr2.active) spr2.clearTint(); }); })(U.spr);
            try { AUDIO.play('uvulahit'); } catch (e) {}
            if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
          }
        });
        if (U.hp <= 0) BE._gag(scene, C, time);
      }

      // ---- displacement tag decay is passive; latch safety ----
      if (C.latch) {
        if (scene.hitstopActive || !alive || !C.latch.m.active || time >= C.latch.until) {
          if (C.latch.m.active) C.latch.m.mob.nextLatchAt = time + 4200;
          C.latch = null;
        } else { p.body.velocity.x *= 0.55; p.body.velocity.y *= 0.55; }
      }

      // ---- patches (venom / acid puddles / wet sand): dmg + slow ticks ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) >= PA.r) continue;
        if (PA.slowMult) { p.body.velocity.x *= PA.slowMult; p.body.velocity.y *= PA.slowMult; }
        if (PA.dmg && time >= (PA.nextTickAt || 0)) {
          PA.nextTickAt = time + PA.tickMs;
          Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'the acid', !!PA.fromBoss);
        }
      }

      // ---- mob lanes (fisherman lures): resolve on their clock ----
      for (var li = C.mLanes.length - 1; li >= 0; li--) {
        var L = C.mLanes[li];
        if (time < L.at) continue;
        C.mLanes.splice(li, 1);
        if (L.g) { try { L.g.destroy(); } catch (e) {} }
        if (alive && dist2seg(p.x, p.y, L.x0, L.y0, L.x1, L.y1) < L.half) {
          Entities.hurtPlayer(scene, p, L.dmg, time, L.src, false);
          if (L.pull && L.mx != null) {
            var a = Math.atan2(L.my - p.y, L.mx - p.x);
            p.body.velocity.x += Math.cos(a) * L.pull; p.body.velocity.y += Math.sin(a) * L.pull;
          }
        }
      }

      // ---- expanding rings (flipper slam) w/ SAFE GAPS ----
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.28); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9);
        // draw arcs skipping the gaps (telegraphed openings)
        for (var seg = 0; seg < 24; seg++) {
          var a0 = seg / 24 * Math.PI * 2, inGap = false;
          for (var gi = 0; gi < RG.gaps.length; gi++) { var d = Math.atan2(Math.sin(a0 - RG.gaps[gi]), Math.cos(a0 - RG.gaps[gi])); if (Math.abs(d) < RG.gapHalf) inGap = true; }
          if (inGap) continue;
          RG.g.beginPath(); RG.g.arc(RG.x, RG.y, RG.r, a0, a0 + Math.PI * 2 / 24); RG.g.strokePath();
        }
        if (!RG.hit && alive) {
          var sd = Math.hypot(p.x - RG.x, p.y - RG.y);
          if (Math.abs(sd - RG.r) < 22) {
            var pa = Math.atan2(p.y - RG.y, p.x - RG.x), safe = false;
            for (var gj = 0; gj < RG.gaps.length; gj++) { var dd = Math.atan2(Math.sin(pa - RG.gaps[gj]), Math.cos(pa - RG.gaps[gj])); if (Math.abs(dd) < RG.gapHalf) safe = true; }
            if (!safe) { RG.hit = true; Entities.hurtPlayer(scene, p, RG.dmg, time, 'the flipper slam', true); }
          }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }

      // ---- warn graphics whose mob died early ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- jelly death-pop + polyp krill-pop (warned, capped) ----
      BE._deathPops(scene, C, time);

      BE._runZones(scene, time);

      // ---- WRAP (guts, toroidal) OR arena bounds (bounded beach) ----
      if (C.stage === 'guts') BE._wrap(scene);
      else BE._arenaBound(scene, C);
    },

    // ------------------------------------------------- DIGESTION TIDE ------
    _runTide: function (scene, C, time) {
      var cfg = scene.realmDef.tideCfg, T = C.tide, p = scene.player, alive = p.state.alive;
      // tide is suppressed during cinematics, the gag, the arena, and boss scan
      var suppressed = C.stage !== 'guts' || C.uvulaGagged || scene.scanning || !!scene.boss || !!C.cinematic;
      if (suppressed) return;
      if (!T.nextAt) T.nextAt = time + cfg.cycleMs * 0.6;

      if (T.phase === 'idle') {
        if (T.nextAt !== Infinity && time >= T.nextAt) {
          T.phase = 'gurgle'; T.gurgleUntil = time + cfg.gurgleMs;
          scene.banner('THE STOMACH GURGLES\nthe walls flex — the tide is rising', GREENLT);
          try { AUDIO.play('tidegurgle'); } catch (e) {}
          T.flexG = scene.add.rectangle(scene.worldW / 2, scene.worldH / 2, scene.worldW, scene.worldH, GREEN, 0.05).setDepth(-19);
          scene.cameras.main.shake(400, 0.004);
        }
      } else if (T.phase === 'gurgle') {
        if (time >= T.gurgleUntil) {
          T.phase = 'rise'; T.riseUntil = time + cfg.riseMs;
          if (T.flexG) { try { T.flexG.destroy(); } catch (e) {} T.flexG = null; }
          BE._tideRise(scene, C, time, cfg);
          try { AUDIO.play('acidrush'); } catch (e) {}
        }
      } else if (T.phase === 'rise') {
        // active tide zones tick the player unless on safe high ground
        for (var i = 0; i < T.zones.length; i++) {
          var z = T.zones[i];
          if (time < z.activeAt) continue;
          if (alive && !BE._onSafeGround(C, p.x, p.y) && Math.hypot(p.x - z.x, p.y - z.y) < z.r && time >= (z.nextTickAt || 0)) {
            z.nextTickAt = time + cfg.tickMs;
            Entities.hurtPlayer(scene, p, cfg.dmg, time, 'the digestion tide', false);
          }
        }
        if (time >= T.riseUntil) {
          T.phase = 'recede'; T.recedeUntil = time + cfg.recedeMs;
          try { AUDIO.play('acidsizzle'); } catch (e) {}
        }
      } else if (T.phase === 'recede') {
        if (time >= T.recedeUntil) {
          T.zones.forEach(function (z) { if (z.g) { try { z.g.destroy(); } catch (e) {} } });
          T.zones = []; T.phase = 'idle'; T.nextAt = time + cfg.cycleMs;
        }
      }
    },
    _tideRise: function (scene, C, time, cfg) {
      var WW = scene.worldW, HH = scene.worldH;
      // acid spreads NORTH out of the lakes as warned zones over the low ground
      var anchors = [[0.35, 0.84], [0.55, 0.82], [0.69, 0.87], [0.82, 0.86], [0.45, 0.72], [0.62, 0.72]];
      anchors.forEach(function (Ac, i) {
        var x = Ac[0] * WW, y = Ac[1] * HH;
        var g = scene.add.circle(x, y, cfg.zoneR, GREEN, 0.16).setStrokeStyle(2, GREENLT, 0.85).setDepth(1.3).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: 900 });
        C.tide.zones.push({ x: x, y: y, r: cfg.zoneR, activeAt: time + 900 + i * 120, nextTickAt: 0, g: g });
      });
    },

    // ----------------------------------------------- THE UVULA GAG + OUTRO --
    _gag: function (scene, C, time) {
      if (C.uvulaGagged) return;
      C.uvulaGagged = true;
      try { AUDIO.play('thegag'); } catch (e) {}
      if (C.uvula.spr.active) C.uvula.spr.setTintFill(0xffffff);
      scene.banner('THE WHALE GAGS\nit beaches itself — and SPITS YOU UP', PINK);
      scene.cameras.main.shake(600, 0.012);
      // clear the tide + guts hazards; hand off to the ARENA stage
      C.tide.zones.forEach(function (z) { if (z.g) { try { z.g.destroy(); } catch (e) {} } }); C.tide.zones = [];
      // M7k AUDIT fix: a gag mid-GURGLE left the wall-flex overlay painted into
      // the arena stage — destroy it and settle the tide.
      if (C.tide.flexG) { try { C.tide.flexG.destroy(); } catch (e) {} C.tide.flexG = null; }
      C.tide.phase = 'idle';
      C.stage = 'arena';
      // reposition the player onto the sand (bottom of the arena)
      var A = C.arena;
      scene.player.setPosition(A.x, A.y + A.ry - 40);
      scene.cameras.main.centerOn(A.x, A.y);
      // the outro leads straight into the boss fight
      C.cinematic = { kind: 'outro', endAt: time + 900 };
      try { AUDIO.play('beachslide'); } catch (e) {}
      if (!scene.boss && !scene.closing && scene.startBossFight) {
        scene.time.delayedCall(200, function () { if (!scene.closing && !scene.boss) scene.startBossFight(); });
      }
    },
    _arenaBound: function (scene, C) {
      var p = scene.player, A = C.arena;
      var dx = (p.x - A.x) / A.rx, dy = (p.y - A.y) / A.ry, d = Math.hypot(dx, dy);
      if (d > 1) { p.x = A.x + dx / d * A.rx; p.y = A.y + dy / d * A.ry; if (p.body) { p.body.velocity.x *= 0.4; p.body.velocity.y *= 0.4; } }
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._belly; if (!C) return;
      var T = C.tide;
      if (T.nextAt && T.nextAt !== Infinity) T.nextAt += dt;
      ['gurgleUntil', 'riseUntil', 'recedeUntil'].forEach(function (k) { if (T[k]) T[k] += dt; });
      T.zones.forEach(function (z) { z.activeAt += dt; if (z.nextTickAt) z.nextTickAt += dt; });
      if (C.acidNextAt) C.acidNextAt += dt;
      if (C.dispUntil) C.dispUntil += dt;
      C.zones.forEach(function (z) { z.at += dt; });
      C.mLanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.patches.forEach(function (P) { if (P.dieAt !== Infinity) P.dieAt += dt; if (P.nextTickAt) P.nextTickAt += dt; });
      if (C.latch) C.latch.until += dt;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['nextCastAt', 'castLockUntil', 'nextChargeAt', 'chargeLockUntil', 'chargeUntil',
         'nextStrikeAt', 'strikeLockUntil', 'strikeUntil', 'nextLatchAt', 'leapAt', 'leapUntil', 'nextDrainAt',
         'nextCharmAt', 'charmLockUntil', 'nextLungeAt', 'lungeAt', 'lungeUntil', 'nextChopAt',
         'nextDiveAt', 'diveWarnUntil', 'diveUntil', 'nextBlockAt', 'stanceUntil', 'blockCdUntil',
         'nextLobAt', 'nextVentAt', 'disperseUntil', 'chipAt',
         'nextEruptAt'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });   // M7k AUDIT fix: gut worm clock was missing
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextCoughAt', 'busyUntil', 'rootUntil', 'ventedUntil',
         'gunChargeUntil', 'gunSweepUntil', 'chompAt', 'inhaleUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._belly; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
      C.mLanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.mLanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} }); C.rings = [];
      for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} } }
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      C.latch = null;
      // M7k AUDIT fix: the portal-roar wipe silently removes every jelly/polyp —
      // a stale death-pop ledger detonated pops / queued krill into the cleared
      // field on the next update. Forget the corpses.
      C.tracked = {};
      // M7k AUDIT fix: live tide visuals (gurgle overlay + acid zones) survived
      // the wipe — clear them with the rest of the hazard pools.
      var T = C.tide;
      if (T) {
        if (T.flexG) { try { T.flexG.destroy(); } catch (e) {} T.flexG = null; }
        T.zones.forEach(function (z) { if (z.g) { try { z.g.destroy(); } catch (e) {} } });
        T.zones = [];
      }
    },

    // ================================================== BOSS ARRIVAL =======
    // The OUTRO already beached the whale; on the sand the TITAN WHALE settles
    // across the arena TOP (head-on maw), the player spat to the bottom.
    // MUST end in spawnBossNow + showScouter (registry contract).
    bossArrival: function (scene, def, bx, by) {
      var C = scene._belly, self = scene, A = C.arena;
      C.stage = 'arena';
      // M7k AUDIT fix: startBossFight's QUIET clear removed the mobs without
      // running the annihilate hook — a stale jelly/polyp ledger detonated
      // death-pops / queued krill into the fresh arena. Forget the corpses.
      C.tracked = {};
      if (C.tide) {
        C.tide.phase = 'idle'; C.tide.nextAt = Infinity;   // no tide in the arena
        // M7k AUDIT fix: stale tide visuals (flex overlay + acid zones) must not
        // persist into the arena stage either.
        if (C.tide.flexG) { try { C.tide.flexG.destroy(); } catch (e) {} C.tide.flexG = null; }
        C.tide.zones.forEach(function (z) { if (z.g) { try { z.g.destroy(); } catch (e) {} } });
        C.tide.zones = [];
      }
      C.latch = null;
      scene.player.setPosition(A.x, A.y + A.ry - 40);
      scene.cameras.main.centerOn(A.x, A.y);
      scene.banner('THE TITAN WHALE\nbeached — and it is FURIOUS', '#b13e53');
      try { AUDIO.play('whaleroar'); } catch (e) {}
      var tx = A.x, ty = A.y - A.ry + 30;
      scene.time.delayedCall(def.entranceMs * 0.5, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, tx, ty);
        if (self.boss) {
          var b = self.boss;
          b.setAlpha(0);
          self.tweens.add({ targets: b, alpha: 1, duration: 500, onComplete: function () {
            if (!b.active) return;
            self.cameras.main.shake(240, 0.01);
            try { AUDIO.play('whaleroar'); } catch (e) {}
          } });
          b.setVelocity(0, 0);
        }
        C.bossArmed = true;
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    // THE TITAN WHALE — STATIONARY. It never moves; the player circles. Core
    // set a chase velocity before dispatching here — we zero it every frame.
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._belly;
      b.setVelocity(0, 0);                                    // NEVER MOVES
      if (!bs._bInit) {
        bs._bInit = true;
        bs.verbIdx = 0;
        bs.nextVerbAt = time + 2600;
        bs.nextCoughAt = time + PT.cough.everyMs * 0.6;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.gunEveryIdx = 0;
        bs._anchor = { x: b.x, y: b.y };
      }
      // keep it pinned to its beached anchor (belt-and-braces vs any nudge)
      if (bs._anchor && (b.x !== bs._anchor.x || b.y !== bs._anchor.y)) b.body.reset(bs._anchor.x, bs._anchor.y);

      // P2 — MAW ALIGHT: throat glows red, verbs faster, mortars leave wet sand
      if (!bs._p2 && bs.hp <= bs.maxHp * PT.p2.hpPct) {
        bs._p2 = true;
        bs.rateMult = (bs.rateMult || 1) * 0.72;
        if (b.active && scene.textures.exists('bellyTitanWhaleP2')) b.setTexture('bellyTitanWhaleP2');
        scene.banner('MAW ALIGHT\nthe throat glows — it comes faster now', '#ff5a4a');
        try { AUDIO.play('mawalight'); } catch (e) {}
      }
      var rate = bs.rateMult || 1;
      if (time < bs.busyUntil) return;                        // rooted/busy mid-verb (it never moves anyway)

      // SIGNATURE — WATER GUN every few verbs
      if (time >= bs.nextVerbAt && bs.gunEveryIdx >= 3) {
        bs.gunEveryIdx = 0;
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        BE._waterGun(scene, b, player, time);
        return;
      }
      if (time >= bs.nextCoughAt) {
        bs.nextCoughAt = time + PT.cough.everyMs * rate;
        BE._gutCough(scene, b, time);
        return;
      }
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        bs.verbIdx++; bs.gunEveryIdx++;
        var v = ['mortars', 'inhale', 'flipper'][bs.verbIdx % 3];
        if (v === 'mortars') BE._mortars(scene, b, player, time);
        else if (v === 'inhale') BE._inhale(scene, b, player, time);
        else BE._flipperSlam(scene, b, player, time);
      }
    },

    // SPRAY MORTARS — blowhole globs; warned impact circles rain IN ORDER.
    _mortars: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.mortars, C = scene._belly, A = C.arena, p2 = b.boss._p2;
      try { AUDIO.play('mortarlaunch'); } catch (e) {}
      for (var i = 0; i < cfg.count; i++) {
        var ax = A.x + (SIM.rng() * 2 - 1) * A.rx * 0.85;
        var ay = A.y + (SIM.rng() * 2 - 1) * A.ry * 0.7;
        BE._zone(scene, ax, ay, cfg.radius, cfg.warnMs + i * cfg.gapMs, cfg.dmg, 'a spray mortar', true, false, time,
          p2 ? { leaveWet: { lifeMs: cfg.wetMs, slowMult: cfg.wetSlow } } : null);
      }
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 300;
    },
    // INHALE — warned pull cone toward the maw (capped, displacement tag) →
    // ends in a CHOMP zone at the tooth line.
    _inhale: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.inhale, C = scene._belly;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(WATER, 0.12); g.lineStyle(2, 0x5aaccc, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + cfg.chompMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      b.boss._inhale = { ang: ang, g: g, chompAt: time + cfg.warnMs };
      try { AUDIO.play('inhalewind'); } catch (e) {}
      scene.banner('INHALE\nrun SIDEWAYS out of the cone', WATER);
      var self = scene, bx = b.x, by = b.y;
      // shared DISPLACEMENT tag (mermaid charm + inhale) — no ping-pong: only
      // pull if not already displaced this window, then claim the cooldown.
      var canPull = time >= C.dispUntil;
      if (canPull) C.dispUntil = time + cfg.dispMs;
      var pullT = scene.time.addEvent({ delay: 60, repeat: Math.floor(cfg.warnMs / 60), callback: function () {
        if (!b.active) return;   // M7k AUDIT fix: dead whale — no pull
        var p = self.player; if (!canPull || !p.state.alive) return;
        var pa = Math.atan2(p.y - by, p.x - bx), diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (Math.abs(diff) < cfg.halfRad) {
          p.body.velocity.x += Math.cos(ang + Math.PI) * cfg.pull * 0.12;
          p.body.velocity.y += Math.sin(ang + Math.PI) * cfg.pull * 0.12;
        }
      } });
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (pullT) pullT.remove();
        if (!b.active) return;   // M7k AUDIT fix: dead whale — no CHOMP
        // CHOMP at the tooth line
        var cx = bx + Math.cos(ang) * cfg.chompR, cy = by + Math.sin(ang) * cfg.chompR;
        BE._zone(self, cx, cy, cfg.chompR, cfg.chompMs, cfg.chompDmg, 'the CHOMP', true, false, self.time.now, null);
        try { AUDIO.play('chomp'); } catch (e) {}
      });
    },
    // FLIPPER SLAM — warned flank slam → expanding shockwave ring w/ SAFE GAPS.
    _flipperSlam: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.flipper, C = scene._belly;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(3, GREENLT, 0.8); g.strokeCircle(b.x, b.y, 40);
      b.boss.busyUntil = time + cfg.warnMs + cfg.ringMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('FLIPPER SLAM\nstand in a GAP, not the wall', GREENLT);
      var self = scene, bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!b.active) return;   // M7k AUDIT fix: dead whale — no shockwave ring
        var gaps = [];
        for (var i = 0; i < cfg.gaps; i++) gaps.push(SIM.rng() * Math.PI * 2);
        var rg = self.add.graphics().setDepth(9);
        C.rings.push({ x: bx, y: by, r: 40, r0: 40, maxR: cfg.maxR, start: self.time.now,
          until: self.time.now + cfg.ringMs, dmg: cfg.dmg, hit: false, g: rg, tint: GREENLT,
          gaps: gaps, gapHalf: cfg.gapHalf });
        self.cameras.main.shake(220, 0.01);
        try { AUDIO.play('flipperslam'); } catch (e) {}
      });
    },
    // GUT COUGH — hacks up 2-3 map mobs (fromBoss, glow, NO drops/loot).
    _gutCough: function (scene, b, time) {
      var cfg = b.boss.def.patterns.cough, C = scene._belly, A = C.arena;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      if (aliveM >= cfg.cap) { b.boss.busyUntil = time + 400; return; }
      var pool = ['shipRatPack', 'bileJelly', 'acidSlug', 'bellyStarfish'];
      for (var i = 0; i < cfg.count; i++) {
        scene.queueSpawn({ key: pool[i % pool.length], bossWave: true, noLoot: true,
          x: b.x + (SIM.rng() * 2 - 1) * 120, y: b.y + 60 + SIM.rng() * 40 });
      }
      scene.banner('GUT COUGH\nit hacks up what it swallowed', GREENLT);
      try { AUDIO.play('gutcough'); } catch (e) {}
      b.boss.busyUntil = time + 600;
    },
    // SIGNATURE — WATER GUN: cheeks SWELL (tell) → corridor FULLY marked →
    // screen-scale jet RAKES the marked path → it SLUMPS gasping: VENTED ×1.5.
    _waterGun: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.waterGun, C = scene._belly, A = C.arena;
      var self = scene, bx = b.x, by = b.y;
      var ang = Math.atan2(player.y - by, player.x - bx);   // corridor aimed once, then LOCKED
      // the tell — cheeks swell
      if (b.active && scene.textures.exists('bellyTitanWhaleSwell')) b.setTexture('bellyTitanWhaleSwell');
      try { AUDIO.play('waterguncharge'); } catch (e) {}
      scene.banner('THE CHEEKS SWELL\nWATER GUN — clear the corridor', WATER);
      // corridor FULLY marked BEFORE any motion (prehistoria rake rule)
      var far = Math.max(A.rx, A.ry) * 2.4;
      var cg = scene.add.graphics().setDepth(2);
      cg.lineStyle(cfg.corridorHalf * 2, WATER, 0.16); cg.lineBetween(bx, by, bx + Math.cos(ang) * far, by + Math.sin(ang) * far);
      cg.lineStyle(2, 0xd8fff2, 0.9); cg.lineBetween(bx, by, bx + Math.cos(ang) * far, by + Math.sin(ang) * far);
      b.boss.busyUntil = time + cfg.chargeMs + cfg.sweepMs + cfg.ventMs;
      b.boss.rootUntil = b.boss.busyUntil;
      b.boss.gunChargeUntil = time + cfg.chargeMs;
      b.boss._gun = { ang: ang, cg: cg, far: far, swept: false };
      scene.time.delayedCall(cfg.chargeMs, function () {
        if (!b.active) { try { cg.destroy(); } catch (e) {} return; }
        try { cg.destroy(); } catch (e) {}
        // the JET rakes the LOCKED corridor exactly
        var jg = self.add.graphics().setDepth(9);
        jg.lineStyle(cfg.corridorHalf * 2, WATER, 0.5); jg.lineBetween(bx, by, bx + Math.cos(ang) * far, by + Math.sin(ang) * far);
        self.tweens.add({ targets: jg, alpha: 0, duration: cfg.sweepMs, onComplete: function () { try { jg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(cfg.sweepMs, 0.012);
        try { AUDIO.play('waterjet'); } catch (e) {}
        var p = self.player;
        if (p.state.alive && dist2seg(p.x, p.y, bx, by, bx + Math.cos(ang) * far, by + Math.sin(ang) * far) < cfg.corridorHalf)
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, 'the WATER GUN', true);
        // it SLUMPS gasping — VENTED ×1.5
        b.boss.ventedUntil = self.time.now + cfg.ventMs;
        b.boss.ventDmgMult = cfg.ventDmgMult;
        b.boss.rootUntil = self.time.now + cfg.ventMs;
        if (b.active && self.textures.exists('bellyTitanWhaleGasp')) b.setTexture('bellyTitanWhaleGasp');
        self.banner('IT SLUMPS GASPING\nthroat slack — UNLOAD', '#d8fff2');
        try { AUDIO.play('whalegasp'); } catch (e) {}
        self.time.delayedCall(cfg.ventMs, function () {
          if (b.active) b.setTexture(b.boss._p2 ? 'bellyTitanWhaleP2' : 'bellyTitanWhaleHi');
        });
      });
    },
    _clearBossFx: function (scene, C) {
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} }); C.rings = [];
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
    },

    // =============================================== MOB VERBS ============
    // DROWNED FISHERMAN — casts the hooked lure: a warned line that snaps
    // (damage + a short pull); wrap-aware telegraph.
    _fisherman: function (scene, m, player, time) {
      var cfg = m.mob.def.cast, C = scene._belly;
      if (m.mob.castLockUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.castLockUntil) {
          m.mob.castLockUntil = 0;
          if (m.mob._castG) { m.mob._castG.forEach(function (g) { try { g.destroy(); } catch (e) {} }); m.mob._castG = null; }
          var a = m.mob._castAng;
          var x1 = m.x + Math.cos(a) * cfg.len, y1 = m.y + Math.sin(a) * cfg.len;
          C.mLanes.push({ x0: m.x, y0: m.y, x1: x1, y1: y1, half: cfg.half, at: time, dmg: cfg.dmg,
            src: "a Drowned Fisherman's lure", pull: cfg.pull, mx: m.x, my: m.y, g: null });
          try { AUDIO.play('snakestrike'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextCastAt) m.mob.nextCastAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextCastAt && d < cfg.range && player.state.alive) {
        m.mob.nextCastAt = time + cfg.everyMs;
        m.mob.castLockUntil = time + cfg.warnMs;
        m.mob._castAng = Math.atan2(player.y - m.y, player.x - m.x);
        var x1b = m.x + Math.cos(m.mob._castAng) * cfg.len, y1b = m.y + Math.sin(m.mob._castAng) * cfg.len;
        m.mob._castG = BE._laneWarns(scene, m.x, m.y, x1b, y1b, cfg.half);
        return true;
      }
      return false;
    },
    // GUT LOBSTER — warned snip-charge lane → DASH along it (the pinch is contact).
    _lobster: function (scene, m, player, time) { return BE._chargeLane(scene, m, player, time, m.mob.def.charge, 'chargeLockUntil', 'chargeUntil', '_chargeAng', 'nextChargeAt', "a Gut Lobster's charge"); },
    // SEA SNAKE — wrap-aware S-strike → dash + a lingering venom puddle.
    _snake: function (scene, m, player, time) {
      var cfg = m.mob.def.strike, C = scene._belly;
      if (m.mob.strikeUntil) {
        if (time >= m.mob.strikeUntil) { m.mob.strikeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._strikeAng) * cfg.speed, Math.sin(m.mob._strikeAng) * cfg.speed);
        return true;
      }
      if (m.mob.strikeLockUntil) {
        if (time >= m.mob.strikeLockUntil) {
          m.mob.strikeLockUntil = 0;
          if (m.mob._strikeG) { m.mob._strikeG.forEach(function (g) { try { g.destroy(); } catch (e) {} }); m.mob._strikeG = null; }
          m.mob.strikeUntil = time + cfg.strikeMs;
          m.setVelocity(Math.cos(m.mob._strikeAng) * cfg.speed, Math.sin(m.mob._strikeAng) * cfg.speed);
          // drop a venom puddle where it launches from
          var obj = scene.add.circle(m.x, m.y, cfg.venomR, GREEN, 0.26).setDepth(1.2);
          C.patches.push({ x: m.x, y: m.y, r: cfg.venomR, dieAt: time + cfg.venomMs, obj: obj,
            dmg: cfg.venomDmg, tickMs: cfg.venomTickMs, nextTickAt: 0, src: 'sea-snake venom' });
          try { AUDIO.play('snakestrike'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextStrikeAt) m.mob.nextStrikeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextStrikeAt && d < cfg.range && player.state.alive) {
        m.mob.nextStrikeAt = time + cfg.everyMs;
        m.mob.strikeLockUntil = time + cfg.warnMs;
        m.mob._strikeAng = Math.atan2(player.y - m.y, player.x - m.x);
        var x1 = m.x + Math.cos(m.mob._strikeAng) * cfg.len, y1 = m.y + Math.sin(m.mob._strikeAng) * cfg.len;
        m.mob._strikeG = BE._laneWarns(scene, m.x, m.y, x1, y1, cfg.half);
        return true;
      }
      return false;
    },
    // shared warned-charge-then-dash (lobster; boss-free)
    _chargeLane: function (scene, m, player, time, cfg, lockKey, untilKey, angKey, nextKey, src) {
      if (m.mob[untilKey]) {
        if (time >= m.mob[untilKey]) { m.mob[untilKey] = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob[angKey]) * cfg.speed, Math.sin(m.mob[angKey]) * cfg.speed);
        return true;
      }
      if (m.mob[lockKey]) {
        if (time >= m.mob[lockKey]) {
          m.mob[lockKey] = 0;
          if (m.mob._clG) { m.mob._clG.forEach(function (g) { try { g.destroy(); } catch (e) {} }); m.mob._clG = null; }
          m.mob[untilKey] = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob[angKey]) * cfg.speed, Math.sin(m.mob[angKey]) * cfg.speed);
          try { AUDIO.play('crabpincer'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob[nextKey]) m.mob[nextKey] = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob[nextKey] && d < cfg.range && player.state.alive) {
        m.mob[nextKey] = time + cfg.everyMs;
        m.mob[lockKey] = time + cfg.warnMs;
        m.mob[angKey] = Math.atan2(player.y - m.y, player.x - m.x);
        var x1 = m.x + Math.cos(m.mob[angKey]) * cfg.len, y1 = m.y + Math.sin(m.mob[angKey]) * cfg.len;
        m.mob._clG = BE._laneWarns(scene, m.x, m.y, x1, y1, cfg.half);
        return true;
      }
      return false;
    },
    // CRIMSON STARFISH / LAMPREY — warned leap/launch → LATCH dot (shot off).
    _latchMob: function (scene, m, player, time, key) {
      var cfg = m.mob.def[key], C = scene._belly;
      if (C.latch && C.latch.m === m) {
        if (m.mob.hp < m.mob._latchHp) { C.latch = null; m.mob.nextLatchAt = time + cfg.cooldownMs; m.mob._latchHp = m.mob.hp; return true; }
        m.mob._latchHp = m.mob.hp;
        m.body.reset(player.x + 10, player.y - 8);
        if (time >= m.mob.nextDrainAt) { m.mob.nextDrainAt = time + cfg.drainTickMs; Entities.hurtPlayer(scene, player, cfg.drainDmg, time, 'a latched ' + m.mob.def.name); }
        return true;
      }
      if (m.mob.leapUntil) {
        if (time >= m.mob.leapUntil) { m.mob.leapUntil = 0; m.setVelocity(0, 0); return true; }
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 32 && !C.latch) {
          m.mob.leapUntil = 0;
          C.latch = { m: m, until: time + cfg.latchMs };
          m.mob._latchHp = m.mob.hp; m.mob.nextDrainAt = time;
          try { AUDIO.play('starlatch'); } catch (e) {}
          scene.damageNumber(player.x, player.y - 24, 'LATCHED', '#e05a3a');
        }
        return true;
      }
      if (m.mob.leapAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xe05a3a : 0xffffff);
        if (time >= m.mob.leapAt) {
          m.mob.leapAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.leapUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          try { AUDIO.play('lampreylaunch'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextLatchAt) m.mob.nextLatchAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLatchAt && d < cfg.range && player.state.alive) {
        m.mob.nextLatchAt = time + cfg.cooldownMs;
        m.mob.leapAt = time + cfg.warnMs;
        return true;
      }
      return false;
    },
    // MERMAID — charm song: warned cone → brief capped PULL (displacement tag).
    _mermaid: function (scene, m, player, time) {
      var cfg = m.mob.def.charm, C = scene._belly;
      m.setVelocity(0, 0);                                    // she never chases
      if (m.mob.charmLockUntil) {
        if (time >= m.mob.charmLockUntil) {
          m.mob.charmLockUntil = 0;
          if (m.mob._charmG) { try { m.mob._charmG.destroy(); } catch (e) {} m.mob._charmG = null; }
          var ang = m.mob._charmAng, p = player;
          if (p.state.alive && time >= C.dispUntil) {
            var pa = Math.atan2(p.y - m.y, p.x - m.x), diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
            if (Math.hypot(p.x - m.x, p.y - m.y) < cfg.range && Math.abs(diff) < cfg.halfRad) {
              var a = Math.atan2(m.y - p.y, m.x - p.x);       // pulled TOWARD the mermaid (into the acid)
              p.body.velocity.x += Math.cos(a) * cfg.pull; p.body.velocity.y += Math.sin(a) * cfg.pull;
              C.dispUntil = time + cfg.dispMs;                // shared displacement cooldown
              scene.damageNumber(p.x, p.y - 24, 'CHARMED', '#7df9d8');
            }
          }
          try { AUDIO.play('mermaidsong'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextCharmAt) m.mob.nextCharmAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextCharmAt && d < cfg.range && player.state.alive) {
        m.mob.nextCharmAt = time + cfg.everyMs;
        m.mob.charmLockUntil = time + cfg.warnMs;
        m.mob._charmAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x7df9d8, 0.12); g.lineStyle(2, 0xd8fff2, 0.8);
        g.slice(m.x, m.y, cfg.range, m.mob._charmAng - cfg.halfRad, m.mob._charmAng + cfg.halfRad, false); g.fillPath(); g.strokePath();
        m.mob._charmG = g;
        return true;
      }
      return true;                                            // stays put even when idle
    },
    // SWALLOWED PIRATE — warned cutlass lunge.
    _pirate: function (scene, m, player, time) {
      var cfg = m.mob.def.lunge;
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); return true; }
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 30) {
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Swallowed Pirate's cutlass");
        }
        return true;
      }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xd84a4a : 0xffffff);
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          try { AUDIO.play('cutlass'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLungeAt && d < cfg.range && player.state.alive) {
        m.mob.nextLungeAt = time + cfg.everyMs;
        m.mob.lungeAt = time + cfg.warnMs;
        return true;
      }
      return false;
    },
    // SKELETON DECKHAND — warned overhead boarding-axe chop (circle).
    _deckhand: function (scene, m, player, time) {
      var cfg = m.mob.def.chop;
      if (!m.mob.nextChopAt) m.mob.nextChopAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextChopAt && d < cfg.range && player.state.alive) {
        m.mob.nextChopAt = time + cfg.everyMs;
        BE._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Deckhand's axe", false, false, time, null);
        try { AUDIO.play('axechop'); } catch (e) {}
        return true;
      }
      return false;
    },
    // BILGE PARROT — circles high; shadow-marked dive peck.
    _parrot: function (scene, m, player, time) {
      var cfg = m.mob.def.dive;
      if (m.mob.diveUntil) {
        if (time >= m.mob.diveUntil) { m.mob.diveUntil = 0; m.setVelocity(0, 0); return true; }
        return true;
      }
      if (m.mob.diveWarnUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.diveWarnUntil) {
          m.mob.diveWarnUntil = 0;
          var a = Math.atan2(m.mob._diveTy - m.y, m.mob._diveTx - m.x);
          m.mob.diveUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          try { AUDIO.play('parrotscreech'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextDiveAt) m.mob.nextDiveAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextDiveAt && d < cfg.range && player.state.alive) {
        m.mob.nextDiveAt = time + cfg.everyMs;
        m.mob.diveWarnUntil = time + cfg.warnMs;
        m.mob._diveTx = player.x; m.mob._diveTy = player.y;
        BE._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Bilge Parrot's dive", false, false, time, null);
        return true;
      }
      // circle high otherwise
      var oa = time / 500 + m.id;
      m.setVelocity(Math.cos(oa) * m.mob.def.spd * 0.6, Math.sin(oa) * m.mob.def.spd * 0.6);
      return true;
    },
    // GUT CRAB — frontal shield stance (refunds while blocking) + warned pincer.
    _crab: function (scene, m, player, time) {
      var cfg = m.mob.def.block;
      if (m.mob._bHp === undefined) m.mob._bHp = m.mob.hp;
      if (m.mob.stanceUntil && time < m.mob.stanceUntil) {
        m.setVelocity(0, 0);
        if (m.mob.hp < m.mob._bHp) {                          // shield holds — refund the chip
          m.mob.hp = Math.min(m.mob.maxHp, m.mob._bHp - Math.round((m.mob._bHp - m.mob.hp) * cfg.guardMult));
          m.mob._bHp = m.mob.hp;
          scene.damageNumber(m.x, m.y - 24, 'BLOCK', '#c87a3a');
        }
        return true;
      } else if (m.mob.stanceUntil) { m.mob.stanceUntil = 0; }
      m.mob._bHp = m.mob.hp;
      if (!m.mob.nextBlockAt) m.mob.nextBlockAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextBlockAt && d < cfg.range && player.state.alive) {
        m.mob.nextBlockAt = time + cfg.everyMs;
        m.mob.stanceUntil = time + cfg.stanceMs;              // raise the shield
        BE._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Gut Crab's pincer", false, false, time, null);
        try { AUDIO.play('crabpincer'); } catch (e) {}
        return true;
      }
      return false;
    },
    // ACID SLUG — warned glob arcs → burn puddles.
    _slug: function (scene, m, player, time) {
      var cfg = m.mob.def.lob;
      if (!m.mob.nextLobAt) m.mob.nextLobAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLobAt && d < cfg.range && player.state.alive) {
        m.mob.nextLobAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter, a = SIM.rng() * Math.PI * 2;
          BE._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs, cfg.dmg,
            "an Acid Slug's glob", false, false, time,
            { leavePuddle: { lifeMs: cfg.puddleMs, dmg: cfg.puddleDmg, tickMs: cfg.puddleTickMs } });
        }
        try { AUDIO.play('slugglob'); } catch (e) {}
        return true;
      }
      return false;
    },
    // GUT WORM — warned eruption circle underfoot.
    _worm: function (scene, m, player, time) {
      var cfg = m.mob.def.erupt;
      if (!m.mob.nextEruptAt) m.mob.nextEruptAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextEruptAt && d < cfg.range && player.state.alive) {
        m.mob.nextEruptAt = time + cfg.everyMs;
        BE._zone(scene, player.x, player.y, cfg.radius, cfg.warnMs, cfg.dmg, 'a Gut Worm eruption', false, false, time, null);
        try { AUDIO.play('wormerupt'); } catch (e) {}
        return true;
      }
      return false;
    },
    // KRILL CLOUD — ONE actor; chip damage; DISPERSES under AoE (when shot).
    _krill: function (scene, m, player, time) {
      var cfg = m.mob.def.krill;
      if (m.mob._kHp === undefined) m.mob._kHp = m.mob.hp;
      if (m.mob.hp < m.mob._kHp) { m.mob.disperseUntil = time + cfg.disperseMs; }   // AoE scatters it
      m.mob._kHp = m.mob.hp;
      if (m.mob.disperseUntil && time < m.mob.disperseUntil) {
        var a = Math.atan2(m.y - player.y, m.x - player.x);   // flee, no chip while scattered
        m.setVelocity(Math.cos(a) * m.mob.def.spd * 1.3, Math.sin(a) * m.mob.def.spd * 1.3);
        return true;
      }
      // drift toward the player + chip tick when close
      var dx = player.x - m.x, dy = player.y - m.y, d = Math.hypot(dx, dy) || 1;
      m.setVelocity(dx / d * m.mob.def.spd, dy / d * m.mob.def.spd);
      if (!m.mob.chipAt) m.mob.chipAt = time + cfg.chipMs;
      if (time >= m.mob.chipAt && d < cfg.chipR && player.state.alive) {
        m.mob.chipAt = time + cfg.chipMs;
        Entities.hurtPlayer(scene, player, cfg.chipDmg, time, 'the krill cloud');
      }
      return true;
    },
    // FLESH POLYP — stationary; warned gas-vent circle (slow); pops KRILL on death.
    _polyp: function (scene, m, player, time) {
      var cfg = m.mob.def.vent;
      m.setVelocity(0, 0);
      if (!m.mob.nextVentAt) m.mob.nextVentAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextVentAt && d < cfg.range && player.state.alive) {
        m.mob.nextVentAt = time + cfg.everyMs;
        BE._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Flesh Polyp's gas", false, false, time,
          { leaveSlow: { lifeMs: cfg.slowMs, slowMult: cfg.slowMult } });
        try { AUDIO.play('polypvent'); } catch (e) {}
        return true;
      }
      return true;                                            // rooted always
    },

    // -------------------------------------------- death-pops (jelly/polyp) --
    _deathPops: function (scene, C, time) {
      var seen = {};
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        var def = m.mob.def;
        if (def.popsOnDeath || def.popsKrill) { C.tracked[m.id] = { kind: def.popsKrill ? 'polyp' : 'jelly', x: m.x, y: m.y, def: def }; seen[m.id] = 1; }
      });
      for (var id in C.tracked) {
        if (seen[id]) continue;
        var rec = C.tracked[id]; delete C.tracked[id];
        if (C.popsThisFrame >= 3) continue;                   // cap simultaneous pops (frame budget)
        C.popsThisFrame++;
        if (rec.kind === 'jelly') {
          var cfg = rec.def.pop;
          BE._zone(scene, rec.x, rec.y, cfg.radius, cfg.warnMs, cfg.dmg, 'a Bile Jelly pop', false, false, time, null);
          try { AUDIO.play('jellypop'); } catch (e) {}
        } else {
          var pk = rec.def.popsKrill, live = 0;
          scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.def && m.mob.def.name === 'Krill Cloud') live++; });
          var n = Math.min(pk.count, Math.max(0, pk.cap - live));
          for (var i = 0; i < n; i++) scene.queueSpawn({ key: 'krillCloud', x: rec.x + (SIM.rng() * 2 - 1) * 30, y: rec.y + (SIM.rng() * 2 - 1) * 30 });
          try { AUDIO.play('polypvent'); } catch (e) {}
        }
      }
    },

    // ================================================= INTERNAL HELPERS ====
    _wrap: function (scene) {
      var WW = scene.worldW, HH = scene.worldH;
      var wrap = function (o) {
        if (!o) return;
        var nx = o.x, ny = o.y, moved = false;
        if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
        if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
        if (!moved) return;
        if (o.body && o.body.enable && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    },
    _laneWarns: function (scene, x0, y0, x1, y1, half) {
      var WW = scene.worldW, HH = scene.worldH;
      var mk = function (ax0, ay0, ax1, ay1) {
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(half * 2, GREEN, 0.14); g.lineBetween(ax0, ay0, ax1, ay1);
        g.lineStyle(2, GREENLT, 0.85); g.lineBetween(ax0, ay0, ax1, ay1);
        return g;
      };
      var gs = [mk(x0, y0, x1, y1)];
      if (x1 < 0 || x1 >= WW) { var sx = x1 < 0 ? WW : -WW; gs.push(mk(x0 + sx, y0, x1 + sx, y1)); }
      if (y1 < 0 || y1 >= HH) { var sy = y1 < 0 ? HH : -HH; gs.push(mk(x0, y0 + sy, x1, y1 + sy)); }
      return gs;
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._belly;
      var tint = fromBoss ? GREENLT : GREEN;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._belly;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? GREENLT : GREEN);
        if (z.dmg > 0) scene.cameras.main.shake(80, 0.004);
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.opts && z.opts.leavePuddle) {
          var sp = z.opts.leavePuddle, obj = scene.add.circle(z.x, z.y, z.r * 0.85, B_ACIDDK, 0.28).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r * 0.85, dieAt: time + sp.lifeMs, obj: obj, dmg: sp.dmg, tickMs: sp.tickMs, nextTickAt: 0, src: 'an acid puddle' });
        }
        if (z.opts && z.opts.leaveSlow) {
          var sl = z.opts.leaveSlow, obj2 = scene.add.circle(z.x, z.y, z.r, 0x6a721a, 0.22).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + sl.lifeMs, obj: obj2, slowMult: sl.slowMult });
        }
        if (z.opts && z.opts.leaveWet) {
          var wt = z.opts.leaveWet, obj3 = scene.add.circle(z.x, z.y, z.r, 0x8a6a3a, 0.24).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + wt.lifeMs, obj: obj3, slowMult: wt.slowMult });
        }
      }
    }
  };
  var B_ACIDDK = 0x4a7a10;

  if (typeof module !== 'undefined' && module.exports) module.exports = BE;
  root.BELLY_SCENE = BE;
})(typeof window !== 'undefined' ? window : this);
