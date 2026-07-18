// ============================================================================
// game/js/maps/abyss/scene.js — THE ABYSS scene hooks (M7 registry).
// assets/abyss_scene_plan.png is canon: WRECK FIELD NW (diving bell = spawn),
// kelp lanes N–S, whale fall N-center, DESTRUCTIBLE CORAL REEF E (clam +
// anemones), VENT FIELD + toppled LIGHTHOUSE SW, black dunes SE, a RIFT LINE,
// four DROP chasms, and the open BOSS BASIN S-center around the big DROP.
// Toroidal wrap ON. Two signature systems:
//  · THE UNDERTOW — warn (kelp bend + rumble) → ~8s directional pull toward the
//    nearest DROP for player AND mobs; mobs swept in die (env credit), the
//    player takes pit damage + ejects (never insta-death); anchored cover
//    (wrecks/rocks/CORAL) blocks the pull. Direction re-rolls each cycle.
//  · DESTRUCTIBLE CORAL — reef walls block movement + shots; ANY fire degrades
//    them through 4 states (pristine→cracked→crumbling→rubble) + shrapnel
//    burst + STAGED REGROW; the Volt Wyrm's body SMASHES straight through.
// THE VOLT WYRM is a SEGMENTED serpent: head (heavy) + follow-the-leader body
// (light brush) + tail, weaving a traveling S-wave. All hooks reset their own
// state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  var WW0 = 1, HH0 = 1;
  // ---- planned layout (fractions of the square world; plan PNG canon) ------
  var DROPS = [
    [0.5, 0.8, 0.062, 0.05],    // 0 BOSS BASIN drop (biggest)
    [0.2, 0.31, 0.045, 0.032],  // 1 NW
    [0.84, 0.82, 0.05, 0.034],  // 2 SE
    [0.73, 0.12, 0.044, 0.03]   // 3 N
  ];
  // decor: [key, xf, yf, scale]
  var DECOR = [
    ['abdWreck', 0.14, 0.12, 2.4], ['abdAnchor', 0.27, 0.13, 1.6], ['abdBell', 0.36, 0.1, 2.0],
    ['abdSub', 0.43, 0.19, 1.9], ['abdCannon', 0.11, 0.26, 1.6], ['abdCrates', 0.16, 0.28, 1.5],
    ['abdChest', 0.17, 0.24, 1.5], ['abdWhaleFall', 0.58, 0.24, 2.2], ['abdClam', 0.78, 0.5, 1.8],
    ['abdAnemone', 0.9, 0.3, 1.5], ['abdAnemone', 0.84, 0.42, 1.4], ['abdKelp', 0.29, 0.5, 2.0],
    ['abdKelp', 0.36, 0.62, 2.0], ['abdKelp', 0.31, 0.72, 1.9], ['abdSmoker', 0.2, 0.83, 1.7],
    ['abdSmoker', 0.32, 0.86, 1.6], ['abdTubeworms', 0.26, 0.8, 1.5], ['abdLighthouse', 0.17, 0.84, 2.2]
  ];
  // anchors (undertow cover) — wreck-field props + a couple of rocks
  var COVERS = [
    [0.14, 0.12], [0.27, 0.13], [0.43, 0.19], [0.11, 0.26], [0.58, 0.24], [0.2, 0.83], [0.32, 0.86]
  ];
  // coral reef cluster (east zone) — destructible walls + anchors
  var CORAL_SITES = [
    [0.72, 0.28], [0.78, 0.34], [0.84, 0.3], [0.9, 0.38], [0.74, 0.42],
    [0.82, 0.46], [0.88, 0.52], [0.76, 0.54], [0.7, 0.36], [0.86, 0.4],
    [0.8, 0.58], [0.72, 0.48]
  ];

  var ENVT = 0x41d6f6, BOSST = 0xd8e84a;   // bio cyan (env) / volt (boss) warn tints

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }
  function inArc(px, py, cx, cy, range, ang, half) {
    var d = Math.hypot(px - cx, py - cy);
    if (d > range) return false;
    var pa = Math.atan2(py - cy, px - cx);
    var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
    return Math.abs(diff) < half;
  }

  var AB = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      WW0 = WW; HH0 = HH;
      var C = scene._ab = {
        drops: [], covers: [], coral: [], coralGroup: null,
        undertow: { nextAt: 0, phase: 'idle', warnUntil: 0, pullUntil: 0, tx: 0, ty: 0, dirx: 0, diry: 0, warnG: null },
        zones: [], lanes: [], rings: [], patches: [], mobWarns: [],
        starLatch: null, reelUntil: 0, venomUntil: 0, venomMult: 1, pitSafeUntil: 0,
        dive: null, maelstrom: null, bossPull: null, bossArmed: false,
        brushAt: 0, segs: [],
        arena: { x: DROPS[0][0] * WW, y: DROPS[0][1] * HH, rx: 0.17 * WW, ry: 0.15 * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- trench floor base + zone tile bands (masked) ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'absilt').setDepth(-23);
      var band = function (tex, xf, yf, wf, hf, depth) {
        var cx = xf * WW, cy = yf * HH, w = wf * WW, h = hf * HH;
        var spr = scene.add.tileSprite(cx, cy, w, h, tex).setDepth(depth || -22.5);
        var g = scene.make.graphics({ add: false });
        g.fillStyle(0xffffff, 1); g.fillEllipse(cx, cy, w, h);
        spr.setMask(g.createGeometryMask());
      };
      band('abbasalt', 0.5, 0.08, 1.1, 0.24);      // trench basalt N band
      band('abblacksand', 0.82, 0.9, 0.46, 0.34);  // black sand SE dunes
      band('abshell', 0.08, 0.5, 0.24, 0.34);      // shell gravel W flats
      band('abvent', 0.28, 0.85, 0.42, 0.3);       // vent basalt SW field
      band('abreef', 0.81, 0.4, 0.38, 0.44);       // coral shelf reef zone E

      // rift line E–W (thin cosmetic crack, wraps)
      var rg = scene.add.graphics().setDepth(-21.5);
      rg.lineStyle(4, 0x0e1624, 0.9);
      rg.beginPath();
      for (var rx = 0; rx <= WW; rx += 12) { var ry = 0.66 * HH + Math.sin(rx * 0.01) * 26; if (rx === 0) rg.moveTo(rx, ry); else rg.lineTo(rx, ry); }
      rg.strokePath();

      // ---- DROP chasms (pit tiles, masked dark) ----
      DROPS.forEach(function (D) {
        var cx = D[0] * WW, cy = D[1] * HH, rx2 = D[2] * WW, ry2 = D[3] * HH;
        var spr = scene.add.tileSprite(cx, cy, rx2 * 2 + 8, ry2 * 2 + 8, 'abdrop').setDepth(-20.5);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx2 * 2, ry2 * 2);
        spr.setMask(mg.createGeometryMask());
        var rim = scene.add.graphics().setDepth(-20.4);
        rim.lineStyle(3, 0x0e1624, 0.9); rim.strokeEllipse(cx, cy, rx2 * 2, ry2 * 2);
        C.drops.push({ x: cx, y: cy, rx: rx2, ry: ry2 });
      });

      // boss basin ring marker (open silt arena)
      var ar = scene.add.graphics().setDepth(-20);
      ar.lineStyle(3, BOSST, 0.5); ar.strokeEllipse(C.arena.x, C.arena.y, C.arena.rx * 2, C.arena.ry * 2);

      // ---- decor per plan ----
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });
      COVERS.forEach(function (Q) { C.covers.push({ x: Q[0] * WW, y: Q[1] * HH }); });

      // ---- DESTRUCTIBLE CORAL: sprites + one shared static wall group ----
      var cfg = scene.realmDef.coral;
      C.coralGroup = scene.physics.add.staticGroup();
      CORAL_SITES.forEach(function (Q, i) {
        var cx = Q[0] * WW, cy = Q[1] * HH;
        var spr = scene.add.sprite(cx, cy, 'abyssCoral0').setScale(1.7).setDepth(2.4);
        var rect = scene.add.rectangle(cx, cy, 46, 40, 0xff9ab8, 0).setDepth(2.3);
        C.coralGroup.add(rect); rect.body.enable = true;
        var coral = { x: cx, y: cy, r: 46, hp: cfg.hp, maxHp: cfg.hp, state: 0,
                      spr: spr, rect: rect, alive: true, regrowAt: Infinity, stateAt: 0, idx: i };
        rect.coral = coral;
        C.coral.push(coral);
      });

      // ---- spawn at the DIVING BELL (NW wreck field) ----
      scene._realmStart = { x: 0.36 * WW, y: 0.13 * HH };

      // mob-verb helpers (fresh closures)
      scene._abJelly = function (m, p, t) { return AB._jelly(scene, m, p, t); };
      scene._abSword = function (m, p, t) { return AB._sword(scene, m, p, t); };
      scene._abVolt = function (m, p, t) { return AB._volt(scene, m, p, t); };
      scene._abSquid = function (m, p, t) { return AB._squid(scene, m, p, t); };
      scene._abStar = function (m, p, t) { return AB._star(scene, m, p, t); };
      scene._abDiver = function (m, p, t) { return AB._diver(scene, m, p, t); };
      scene._abFisher = function (m, p, t) { return AB._fisher(scene, m, p, t); };
      scene._abLobster = function (m, p, t) { return AB._lobster(scene, m, p, t); };
      scene._abSnake = function (m, p, t) { return AB._snake(scene, m, p, t); };
      scene._abSnail = function (m, p, t) { return AB._snail(scene, m, p, t); };
      scene._abKraken = function (m, p, t) { return AB._kraken(scene, m, p, t); };
    },

    afterCreate: function (scene) {
      var C = scene._ab; if (!C) return;
      // colliders ONLY here — the player doesn't exist during setup()
      C.coralColP = scene.physics.add.collider(scene.player, C.coralGroup);
      C.coralColM = scene.physics.add.collider(scene.mobs, C.coralGroup);
      // coral blocks shots — ANY fire degrades it (shrapnel puff on break)
      scene.physics.add.overlap(scene.playerShots, C.coralGroup, function (shot, rect) {
        if (!shot.active || !rect.coral || !rect.coral.alive) return;
        AB._hurtCoral(scene, rect.coral, shot.proj ? shot.proj.dmg : 5, scene.time.now);
        if (!shot.proj || !shot.proj.pierce) Entities.killProjectile(scene.playerShots, shot);
      });
    },

    // -------------------------------------------------- coral machinery ----
    _coralStateFor: function (coral, cfg) { return Math.max(0, Math.min(3, Math.floor((coral.maxHp - coral.hp) / cfg.hpPerState))); },
    _hurtCoral: function (scene, coral, dmg, time) {
      if (!coral.alive) return;
      var cfg = scene.realmDef.coral;
      coral.hp -= dmg;
      coral.spr.setTintFill(0xffffff);
      (function (s) { scene.time.delayedCall(45, function () { if (s.active) s.clearTint(); }); })(coral.spr);
      try { AUDIO.play('coralcrack'); } catch (e) {}
      if (coral.hp <= 0) { AB._breakCoral(scene, coral, time); return; }
      var st = AB._coralStateFor(coral, cfg);
      if (st !== coral.state) { coral.state = st; coral.stateAt = time; coral.spr.setTexture('abyssCoral' + st); }
    },
    _breakCoral: function (scene, coral, time) {
      var cfg = scene.realmDef.coral;
      coral.alive = false; coral.hp = 0; coral.state = 3;
      coral.spr.setTexture('abyssCoral3');
      coral.rect.body.enable = false;                        // no longer blocks
      coral.regrowAt = time + cfg.regrowMs;
      scene.burst(coral.x, coral.y, 16, 0xe8a0b8);
      scene.cameras.main.shake(80, 0.004);
      try { AUDIO.play('coralburst'); } catch (e) {}
    },
    _regrowCoral: function (scene, coral, time) {
      var cfg = scene.realmDef.coral;
      // never regrow while the player stands in the footprint
      if (scene.player.state.alive && Math.hypot(scene.player.x - coral.x, scene.player.y - coral.y) < coral.r * 0.7) {
        coral.regrowAt = time + 1500; return;
      }
      coral.alive = true; coral.hp = cfg.hp; coral.state = 0;
      coral.spr.setTexture('abyssCoral0');
      coral.rect.body.enable = true;
      coral.regrowAt = Infinity; coral.stateAt = time;
      scene.burst(coral.x, coral.y, 8, 0x7df9d8);
      try { AUDIO.play('coralregrow'); } catch (e) {}
    },
    _anchored: function (scene, C, x, y) {
      var aR = scene.realmDef.undertow.anchorR;
      for (var i = 0; i < C.covers.length; i++) if (Math.hypot(x - C.covers[i].x, y - C.covers[i].y) < aR) return true;
      for (var j = 0; j < C.coral.length; j++) if (C.coral[j].alive && Math.hypot(x - C.coral[j].x, y - C.coral[j].y) < aR) return true;
      return false;
    },
    _inDrop: function (C, x, y) {
      for (var i = 0; i < C.drops.length; i++) {
        var D = C.drops[i];
        if (((x - D.x) / D.rx) * ((x - D.x) / D.rx) + ((y - D.y) / D.ry) * ((y - D.y) / D.ry) < 1) return D;
      }
      return null;
    },
    _nearestDrop: function (C, x, y) {
      var best = C.drops[0], bd = 1e18;
      C.drops.forEach(function (D) { var d = Math.hypot(D.x - x, D.y - y); if (d < bd) { bd = d; best = D; } });
      return best;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._ab; if (!C) return;
      var p = scene.player, alive = p.state.alive;
      var uCfg = scene.realmDef.undertow;

      // boss-owned machinery clears when the boss is down (armed rule)
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        AB._clearBoss(scene, C, time);
      }

      // ---- coral staged regrow (reverse states, long timer) ----
      for (var ci = 0; ci < C.coral.length; ci++) {
        var CO = C.coral[ci];
        if (!CO.alive && CO.regrowAt !== Infinity && time >= CO.regrowAt) AB._regrowCoral(scene, CO, time);
      }

      // ---- THE UNDERTOW cycle (parked while the boss holds court) ----
      var U = C.undertow;
      if (!U.nextAt) U.nextAt = time + uCfg.cycleMs * 0.5;
      if (U.phase === 'idle' && U.nextAt !== Infinity && time >= U.nextAt && !scene.scanning && !scene.boss) {
        AB._undertowWarn(scene, C, time, uCfg);
      }
      if (U.phase === 'warn' && time >= U.warnUntil) {
        U.phase = 'pull'; U.pullUntil = time + uCfg.pullMs;
        if (U.warnG) { try { U.warnG.destroy(); } catch (e) {} U.warnG = null; }
        scene.banner('THE UNDERTOW\nthe trench drags you toward the drop — anchor!', '#41d6f6');
        try { AUDIO.play('currentwhoosh'); } catch (e) {}
      }
      if (U.phase === 'pull') {
        if (time >= U.pullUntil) { U.phase = 'idle'; U.nextAt = time + uCfg.cycleMs; }
        else {
          // player: velocity current toward the drop unless anchored
          if (alive && !AB._anchored(scene, C, p.x, p.y)) {
            p.body.velocity.x += U.dirx * uCfg.force; p.body.velocity.y += U.diry * uCfg.force;
          }
          // mobs: dragged too; swept into a drop = env-credited death
          scene.mobs.children.iterate(function (m) {
            if (!m || !m.active || !m.mob) return;
            if (m.mob.bossWave || AB._anchored(scene, C, m.x, m.y)) return;
            m.body.velocity.x += U.dirx * uCfg.force; m.body.velocity.y += U.diry * uCfg.force;
            if (AB._inDrop(C, m.x, m.y)) scene.killMobCredited(m);
          });
        }
      }

      // ---- DROP pits: player fall → damage + eject to the near rim (never insta) ----
      if (alive && time >= C.pitSafeUntil) {
        var D = AB._inDrop(C, p.x, p.y);
        if (D) {
          C.pitSafeUntil = time + uCfg.ejectIframeMs;
          p.state.lastHitAt = -1e9;
          Entities.hurtPlayer(scene, p, uCfg.pitDmg, time, 'the drop', false);
          var ea = Math.atan2(p.y - D.y, p.x - D.x); if (!isFinite(ea)) ea = 0;
          p.body.reset(D.x + Math.cos(ea) * (D.rx + 40), D.y + Math.sin(ea) * (D.ry + 40));
          p.body.velocity.x = Math.cos(ea) * uCfg.ejectPush; p.body.velocity.y = Math.sin(ea) * uCfg.ejectPush;
          p.state.lastHitAt = time;
          scene.burst(D.x, D.y, 12, 0x1a2c48);
          try { AUDIO.play('undertowrumble'); } catch (e) {}
        }
      }

      // ---- ink clouds / slow patches + damage patches ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
      }

      // ---- STARFISH LATCH safety: player slow + auto-release ----
      if (C.starLatch) {
        var SL = C.starLatch;
        if (scene.hitstopActive || !alive || !SL.m.active || time >= SL.until ||
            Math.hypot(p.x - SL.m.x, p.y - SL.m.y) > SL.breakDist) {
          if (SL.m.active) SL.m.mob.nextHopAt = time + SL.cooldownMs;
          C.starLatch = null;
        }
      }

      // ---- combined player SLOW (CC-cap floor 0.4×) ----
      if (alive) {
        var mult = 1;
        if (C.venomUntil > time) mult *= C.venomMult;
        if (C.starLatch) mult *= C.starLatch.slowMult;
        for (var si = 0; si < C.patches.length; si++) {
          var SP = C.patches[si];
          if (SP.slowMult && Math.hypot(p.x - SP.x, p.y - SP.y) < SP.r) mult *= SP.slowMult;
        }
        mult = Math.max(0.4, mult);                          // CC-stack cap
        if (mult < 1) { p.body.velocity.x *= mult; p.body.velocity.y *= mult; }
      }

      // ---- boss serpent's-undertow pull (his own, offset from the map's) ----
      if (C.bossPull && time < C.bossPull.until) {
        if (alive && !AB._anchored(scene, C, p.x, p.y)) {
          var bx = C.bossPull.x, by = C.bossPull.y;
          var pa = Math.atan2(by - p.y, bx - p.x);
          p.body.velocity.x += Math.cos(pa) * C.bossPull.force;
          p.body.velocity.y += Math.sin(pa) * C.bossPull.force;
        }
      } else if (C.bossPull && time >= C.bossPull.until) {
        // the SNAP at the end of the circle
        if (alive && Math.hypot(p.x - C.bossPull.x, p.y - C.bossPull.y) < 120)
          Entities.hurtPlayer(scene, p, C.bossPull.snapDmg, time, 'the serpent coil', true);
        scene.burst(C.bossPull.x, C.bossPull.y, 16, BOSST);
        C.bossPull = null;
      }

      // ---- DEEP DIVE shadow / breach state machine ----
      if (C.dive) AB._runDive(scene, C, time);
      // ---- MAELSTROM breach sequence ----
      if (C.maelstrom) AB._runMaelstrom(scene, C, time);

      // ---- armed cleanups: warn graphics whose mob died early ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- expanding RINGS (volt eels + boss discharge) ----
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.28); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        if (!RG.hit && alive) {
          var sd = Math.hypot(p.x - RG.x, p.y - RG.y);
          if (Math.abs(sd - RG.r) < 22) { RG.hit = true; Entities.hurtPlayer(scene, p, RG.dmg, time, RG.src, RG.fromBoss); }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }

      // ---- boss segment drive (follow-the-leader + brush + coral smash + shots) ----
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned && C.segs.length) AB._driveSegments(scene, C, scene.boss, time);

      AB._wrap(scene);
      AB._runZones(scene, time);
      AB._runLanes(scene, time);
    },

    _undertowWarn: function (scene, C, time, uCfg) {
      var U = C.undertow;
      U.nextAt = time + uCfg.cycleMs * (0.8 + SIM.rng() * 0.4);
      // direction RE-ROLLS each cycle: pick a random DROP as the target
      var D = C.drops[Math.floor(SIM.rng() * C.drops.length)];
      U.tx = D.x; U.ty = D.y;
      var a = Math.atan2(D.y - scene.player.y, D.x - scene.player.x);
      U.dirx = Math.cos(a); U.diry = Math.sin(a);
      U.phase = 'warn'; U.warnUntil = time + uCfg.warnMs;
      var g = scene.add.graphics().setDepth(9);
      g.lineStyle(4, ENVT, 0.5);
      for (var i = 0; i < 5; i++) { var ox = (SIM.rng() * 2 - 1) * scene.worldW * 0.4, oy = (SIM.rng() * 2 - 1) * scene.worldH * 0.4; g.lineBetween(D.x - U.dirx * 120 + ox, D.y - U.diry * 120 + oy, D.x + ox, D.y + oy); }
      U.warnG = g;
      scene.banner('THE TRENCH STIRS\ncurrent building toward a DROP — find an anchor', '#41d6f6');
      try { AUDIO.play('undertowrumble'); } catch (e) {}
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._ab; if (!C) return;
      var U = C.undertow;
      if (U.nextAt && U.nextAt !== Infinity) U.nextAt += dt;
      if (U.warnUntil) U.warnUntil += dt;
      if (U.pullUntil) U.pullUntil += dt;
      if (C.pitSafeUntil) C.pitSafeUntil += dt;
      if (C.reelUntil) C.reelUntil += dt;
      if (C.brushAt) C.brushAt += dt;               // M7k AUDIT fix: segment-brush cooldown stamp
      if (C.venomUntil && C.venomUntil > 0) C.venomUntil += dt;
      C.coral.forEach(function (CO) { if (CO.regrowAt !== Infinity) CO.regrowAt += dt; });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.patches.forEach(function (P) { if (P.dieAt !== Infinity) P.dieAt += dt; });
      if (C.starLatch) C.starLatch.until += dt;
      if (C.bossPull) C.bossPull.until += dt;
      if (C.dive) { C.dive.moveUntil += dt; C.dive.breachAt += dt; }
      if (C.maelstrom) { C.maelstrom.seq.forEach(function (S2) { if (!S2.fired) S2.at += dt; }); if (C.maelstrom.latticeAt) C.maelstrom.latticeAt += dt; }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['nextLanceAt', 'laneLockUntil', 'chargeUntil', 'nextZapAt', 'coilUntil', 'zapCdUntil',
         'nextInkAt', 'jetUntil', 'nextHopAt', 'hopUntil', 'nextHarpoonAt', 'aimUntil',
         'nextCastAt', 'landUntil', 'nextChargeAt', 'nextStrikeAt', 'strikeLockUntil',
         'nextHealAt', 'nextSlamAt', 'slamEndAt'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextSigAt', 'busyUntil', 'rootUntil', 'ventedUntil',
         'liveWireUntil', 'phase2At'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._ab; if (!C) return;
      C.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: splice the cleared zone's _warn record too
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
      }); C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.lanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} }); C.rings = [];
      C.patches.forEach(function (P) { if (P.obj) { try { P.obj.destroy(); } catch (e) {} } }); C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      C.starLatch = null; C.venomUntil = 0;
      if (C.undertow.warnG) { try { C.undertow.warnG.destroy(); } catch (e) {} C.undertow.warnG = null; }
      C.undertow.phase = 'idle';
    },

    _clearBoss: function (scene, C, time) {
      C.bossPull = null;
      if (C.dive) { if (C.dive.shadow) { try { C.dive.shadow.destroy(); } catch (e) {} } if (C.dive.warnObj) { try { C.dive.warnObj.destroy(); } catch (e) {} } C.dive = null; }
      if (C.maelstrom) { C.maelstrom.seq.forEach(function (S2) { if (S2.g) { try { S2.g.destroy(); } catch (e) {} } }); C.maelstrom = null; }
      C.segs.forEach(function (S2) { try { S2.spr.destroy(); } catch (e) {} }); C.segs = [];
    },

    // ================================================== BOSS ARRIVAL =======
    // The whole basin darkens, the big DROP boils, a vast shadow rises out of
    // the chasm — THE VOLT WYRM breaches, scales crackling. Title, THEN scanning.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._ab, self = scene;
      var ax = C.arena.x, ay = C.arena.y, big = C.drops[0];
      C.starLatch = null;
      C.undertow.phase = 'idle'; C.undertow.nextAt = Infinity;   // the map current holds its breath
      scene.player.setPosition(ax, ay + C.arena.ry - 30);
      scene.cameras.main.centerOn(ax, ay);
      var glow = scene.add.circle(big.x, big.y, big.rx * 1.4, BOSST, 0.16).setDepth(1.5);
      scene.tweens.add({ targets: glow, alpha: { from: 0.16, to: 0.5 }, duration: 380, yoyo: true, repeat: 4 });
      [500, 1000, 1500, 1900].forEach(function (at, i) {
        scene.time.delayedCall(at * (def.entranceMs / 3400), function () {
          if (self.closing) return;
          self.burst(big.x, big.y, 8 + i * 4, BOSST);
          try { AUDIO.play('wyrmcharge'); } catch (e) {}
        });
      });
      scene.cameras.main.shake(def.entranceMs * 0.4, 0.005);
      scene.banner('THE BASIN DARKENS\nsomething vast rises through the DROP', '#d8e84a');
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, big.x, big.y);
        if (self.boss) {
          var b = self.boss;
          b.setPosition(big.x, big.y + 40);
          b.setAlpha(0).setScale(b.scaleX * 0.7, b.scaleY * 0.7);
          self.tweens.add({ targets: b, y: ay, alpha: 1, scaleX: b.scaleX / 0.7, scaleY: b.scaleY / 0.7,
            duration: 560, ease: 'Quad.Out',
            onComplete: function () {
              if (!b.active) return;
              self.burst(b.x, b.y, 26, BOSST);
              self.cameras.main.shake(300, 0.012);
              try { AUDIO.play('wyrmbreach'); } catch (e) {}
            } });
        }
        C.bossArmed = true;
        try { glow.destroy(); } catch (e) {}
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS SEGMENTS =====
    _initSegments: function (scene, b, time) {
      var C = scene._ab, seg = b.boss.def.segments;
      C.segs.forEach(function (S2) { try { S2.spr.destroy(); } catch (e) {} });
      C.segs = []; b.boss.path = [{ x: b.x, y: b.y }];
      for (var i = 0; i < seg.count; i++) {
        var tail = (i === seg.count - 1);
        var spr = scene.add.sprite(b.x, b.y - (i + 1) * seg.spacing, tail ? 'abyssWyrmTail' : 'abyssWyrmBody')
          .setScale(90 / 96).setDepth(5.9 - i * 0.001);
        C.segs.push({ spr: spr, tail: tail });
      }
    },
    _samplePath: function (path, dist) {
      if (path.length < 2) return path[0];
      var acc = 0;
      for (var i = 0; i < path.length - 1; i++) {
        var a = path[i], c = path[i + 1];
        var seg = Math.hypot(c.x - a.x, c.y - a.y);
        if (acc + seg >= dist) {
          var t = seg ? (dist - acc) / seg : 0;
          return { x: a.x + (c.x - a.x) * t, y: a.y + (c.y - a.y) * t };
        }
        acc += seg;
      }
      return path[path.length - 1];
    },
    _driveSegments: function (scene, C, b, time) {
      var bs = b.boss, seg = bs.def.patterns, sc = bs.def.segments;
      var path = bs.path || (bs.path = [{ x: b.x, y: b.y }]);
      // record head trail (spaced) so followers trace the head's exact path
      if (Math.hypot(b.x - path[0].x, b.y - path[0].y) > 3) path.unshift({ x: b.x, y: b.y });
      var cap = Math.ceil(sc.count * sc.spacing / 3) + 24;
      if (path.length > cap) path.length = cap;
      var phase2 = bs.hp <= bs.maxHp * seg.phase2Pct;
      var wire = bs.liveWireUntil && time < bs.liveWireUntil;
      var wantTex = wire ? 'abyssWyrmBodyWire' : (phase2 ? 'abyssWyrmBodyCharged' : 'abyssWyrmBody');
      var prev = { x: b.x, y: b.y }, p = scene.player, alive = p.state.alive;
      var hidden = !b.visible;
      for (var i = 0; i < C.segs.length; i++) {
        var S2 = C.segs[i];
        var pos = AB._samplePath(path, (i + 1) * sc.spacing);
        S2.spr.setPosition(pos.x, pos.y);
        S2.spr.setRotation(Math.atan2(prev.y - pos.y, prev.x - pos.x));
        S2.spr.setVisible(!hidden);
        if (!S2.tail) S2.spr.setTexture(wantTex);
        prev = pos;
        if (hidden) continue;
        // brush damage (light) — or shock while LIVE WIRE
        if (alive && time >= C.brushAt && Math.hypot(p.x - pos.x, p.y - pos.y) < 40) {
          C.brushAt = time + 500;
          var bd = wire ? seg.liveWire.shockDmg : sc.brushDmg;
          Entities.hurtPlayer(scene, p, bd, time, wire ? "the live-wire coil" : "the Wyrm's coil", true);
        }
        // the body SMASHES coral through its states
        for (var cci = 0; cci < C.coral.length; cci++) {
          var CO = C.coral[cci];
          if (CO.alive && Math.hypot(pos.x - CO.x, pos.y - CO.y) < 44) AB._hurtCoral(scene, CO, 40, time);
        }
      }
      // player shots hitting a SEGMENT: shared hp pool, reduced (armored body)
      if (!hidden && scene.playerShots) scene.playerShots.children.iterate(function (s) {
        if (!s || !s.active || !s.proj) return;
        for (var i2 = 0; i2 < C.segs.length; i2++) {
          var pos2 = C.segs[i2].spr;
          if (Math.hypot(s.x - pos2.x, s.y - pos2.y) < 40) {
            if (s.proj._segHit) return;
            s.proj._segHit = true;
            Entities.hurtBoss(scene, b, Math.max(1, Math.round(s.proj.dmg * sc.segHitMult)));
            if (!s.proj.pierce) Entities.killProjectile(scene.playerShots, s);
            return;
          }
        }
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._ab, sc = bs.def.segments;
      if (!bs._abInit) {
        bs._abInit = true;
        bs.verbIdx = 0; bs.wavePhase = 0;
        bs.nextVerbAt = time + 2600;
        bs.nextSigAt = time + 12000;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.diving = false;
        AB._initSegments(scene, b, time);
      }
      if (!bs._phase2 && bs.hp <= bs.maxHp * PT.phase2Pct) {
        bs._phase2 = true; bs.verbIdx = 0;
        scene.banner('FULL CHARGE\nthe Wyrm blazes — every scale a live wire', '#f8ffb0');
        b.setTint(0xf8ffb0); (function () { scene.time.delayedCall(600, function () { if (b.active) b.clearTint(); }); })();
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true; bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE LEVIATHAN RAGES\nthe storm tightens', '#d8e84a');
      }
      var rate = bs.rateMult || 1, phase2 = bs._phase2;

      // ---- serpentine head steering (weaving sinusoid → traveling S-wave) ----
      if (bs.diving || time < bs.rootUntil) { b.setVelocity(0, 0); }
      else {
        bs.wavePhase += (scene.game.loop.delta || 16) * 0.006;
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var goal = Math.atan2(dy, dx);
        var steer = goal + Math.sin(bs.wavePhase) * (sc.headWeave / 100);
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 90) { b.setVelocity(Math.cos(steer) * spd, Math.sin(steer) * spd); b.setFlipX(Math.cos(steer) < 0); }
        else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      // ---- SIGNATURE on its own timer ----
      if (time >= bs.nextSigAt && !C.dive && !C.maelstrom) {
        bs.nextSigAt = time + (phase2 ? 20000 : 18000) * rate;
        if (phase2) AB._maelstrom(scene, b, player, time);
        else AB._deepDive(scene, b, player, time);
        return;
      }
      // ---- verb rotation (phase-dependent) ----
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        if (!phase2) {
          var v1 = ['snap', 'discharge', 'tail'][bs.verbIdx % 3]; bs.verbIdx++;
          if (v1 === 'snap') AB._snapStrike(scene, b, player, time);
          else if (v1 === 'discharge') AB._voltDischarge(scene, b, player, time);
          else AB._tailWhip(scene, b, player, time);
        } else {
          var v2 = ['livewire', 'chain', 'undertow'][bs.verbIdx % 3]; bs.verbIdx++;
          if (v2 === 'livewire') AB._liveWire(scene, b, time);
          else if (v2 === 'chain') AB._chainLightning(scene, b, player, time);
          else AB._serpentUndertow(scene, b, time);
        }
      }
    },

    // SNAP STRIKE — coil aims like an arrow → head lunges down a warned lane.
    _snapStrike: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.snapStrike;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var L = { x0: b.x, y0: b.y, x1: b.x + Math.cos(ang) * cfg.len, y1: b.y + Math.sin(ang) * cfg.len };
      AB._lane(scene, L, cfg.half, cfg.warnMs, cfg.dmg, "the Wyrm's snap", true, time, BOSST);
      b.boss.rootUntil = time + cfg.warnMs;
      b.boss.busyUntil = time + cfg.warnMs + cfg.lungeMs;
      b.boss._snapAng = ang; b.boss._snapAt = time + cfg.warnMs;
      var self = scene;
      scene.time.delayedCall(cfg.warnMs, function () {
        if (!b.active) return;
        b.setVelocity(Math.cos(ang) * cfg.speed, Math.sin(ang) * cfg.speed);
        self.cameras.main.shake(120, 0.006);
        try { AUDIO.play('wyrmsnap'); } catch (e) {}
        self.time.delayedCall(cfg.lungeMs, function () { if (b.active) b.setVelocity(0, 0); });
      });
      scene.banner('SNAP STRIKE\nthe coil points where he strikes', '#d8e84a');
    },
    // VOLT DISCHARGE — expanding shock rings from 3 points along the body.
    _voltDischarge: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.voltDischarge, C = scene._ab;
      for (var i = 0; i < cfg.points; i++) {
        var src = C.segs.length ? C.segs[Math.min(C.segs.length - 1, i * 3)].spr : b;
        var g = scene.add.graphics().setDepth(9);
        C.rings.push({ x: src.x, y: src.y, r: 20, r0: 20, maxR: cfg.maxR, start: time + i * cfg.gapMs,
          until: time + i * cfg.gapMs + cfg.ringMs, dmg: cfg.dmg, src: 'the volt discharge',
          fromBoss: true, hit: false, g: g, tint: BOSST });
      }
      b.boss.busyUntil = time + cfg.warnMs;
      try { AUDIO.play('wyrmdischarge'); } catch (e) {}
      scene.banner('VOLT DISCHARGE\nslip the gaps between the rings', '#f8ffb0');
    },
    // TAIL WHIP — warned arc sector behind him.
    _tailWhip: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tailWhip;
      var toP = Math.atan2(player.y - b.y, player.x - b.x);
      var ang = toP + Math.PI;                                // behind him
      var wx = b.x + Math.cos(ang) * cfg.range * 0.5, wy = b.y + Math.sin(ang) * cfg.range * 0.5;
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(BOSST, 0.14); g.lineStyle(2, 0xf8ffb0, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); g.fillPath(); g.strokePath();
      AB._zone(scene, wx, wy, cfg.range * 0.42, cfg.warnMs, cfg.dmg, "the Wyrm's tail", true, false, time, null);
      var self = scene;
      scene.time.delayedCall(cfg.warnMs, function () { try { g.destroy(); } catch (e) {} });
      b.boss.busyUntil = time + cfg.warnMs;
      scene.banner('TAIL WHIP\nthe fluke sweeps behind him', '#d8e84a');
    },
    // DEEP DIVE (P1 signature) — plunge into a DROP → shadow glides under the
    // floor → BREACHES under you → beached & vented ×1.5.
    _deepDive: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.deepDive, C = scene._ab;
      var dive = AB._nearestDrop(C, b.x, b.y);
      b.body.reset(dive.x, dive.y);
      b.setVisible(false); b.body.enable = false; b.boss.diving = true;
      scene.burst(dive.x, dive.y, 18, 0x1a2c48);
      try { AUDIO.play('wyrmbreach'); } catch (e) {}
      var shadow = scene.add.ellipse(dive.x, dive.y, 150, 90, 0x081018, 0.55).setDepth(1.4);
      C.dive = { shadow: shadow, x: dive.x, y: dive.y, moveUntil: time + cfg.shadowMs,
                 breachAt: 0, warnObj: null, phase: 'shadow',
                 breachR: cfg.breachR, breachWarnMs: cfg.breachWarnMs, breachDmg: cfg.breachDmg,
                 ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.shadowMs + cfg.breachWarnMs + 400;
      scene.banner('DEEP DIVE\ntrack his shadow — he breaches where you stand', '#d8e84a');
    },
    _runDive: function (scene, C, time) {
      var b = scene.boss, D = C.dive, p = scene.player;
      if (!b || !b.active) { AB._clearBoss(scene, C, time); return; }
      if (D.phase === 'shadow') {
        // glide toward the player under the floor
        var a = Math.atan2(p.y - D.shadow.y, p.x - D.shadow.x);
        var step = 3.2 * ((scene.game.loop.delta || 16) / 16);
        if (Math.hypot(p.x - D.shadow.x, p.y - D.shadow.y) > 6) { D.shadow.x += Math.cos(a) * step; D.shadow.y += Math.sin(a) * step; }
        D.x = D.shadow.x; D.y = D.shadow.y;
        if (time >= D.moveUntil) {
          D.phase = 'breach'; D.breachAt = time + D.breachWarnMs;
          D.warnObj = scene.add.circle(D.x, D.y, D.breachR, BOSST, 0.14).setStrokeStyle(2, 0xf8ffb0, 0.9).setDepth(2).setScale(0.4);
          scene.tweens.add({ targets: D.warnObj, scale: 1, duration: D.breachWarnMs });
        }
      } else if (D.phase === 'breach' && time >= D.breachAt) {
        if (D.shadow) { try { D.shadow.destroy(); } catch (e) {} }
        if (D.warnObj) { try { D.warnObj.destroy(); } catch (e) {} }
        b.body.reset(D.x, D.y);
        b.setVisible(true); b.body.enable = true; b.boss.diving = false;
        b.boss.ventedUntil = time + D.ventMs; b.boss.ventDmgMult = D.ventDmgMult;
        b.boss.rootUntil = time + D.ventMs;
        b.setTint(0xf8ffb0);
        (function () { scene.time.delayedCall(D.ventMs, function () { if (b.active) b.clearTint(); }); })();
        scene.cameras.main.shake(260, 0.012);
        try { AUDIO.play('wyrmbreach'); } catch (e) {}
        scene.burst(D.x, D.y, 24, BOSST);
        if (p.state.alive && Math.hypot(p.x - D.x, p.y - D.y) < D.breachR)
          Entities.hurtPlayer(scene, p, D.breachDmg, time, "the Wyrm's breach", true);
        scene.banner('BEACHED\nhe sprawls, winded — UNLOAD', '#f8ffb0');
        C.dive = null;
      }
    },
    // LIVE WIRE (P2) — body-wide electrification: any segment shocks.
    _liveWire: function (scene, b, time) {
      var cfg = b.boss.def.patterns.liveWire;
      b.boss.liveWireUntil = time + cfg.warnMs + cfg.activeMs;
      b.boss.busyUntil = time + cfg.warnMs;
      try { AUDIO.play('shockhum'); } catch (e) {}
      scene.banner('LIVE WIRE\nthe whole coil is death — keep clear', '#f8ffb0');
    },
    // CHAIN LIGHTNING (P2) — arcs jump body → volt eels. No eel? reroute.
    _chainLightning: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.chainLightning, C = scene._ab;
      var eels = [];
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.def === DATA.mobs.voltEel) eels.push(m); });
      if (!eels.length) { AB._voltDischarge(scene, b, player, time); return; }   // reroute
      for (var i = 0; i < Math.min(cfg.arcs, eels.length); i++) {
        var e = eels[i];
        AB._lane(scene, { x0: b.x, y0: b.y, x1: e.x, y1: e.y }, cfg.half, cfg.warnMs, cfg.dmg, 'the chain lightning', true, time, 0xf8ffb0);
      }
      b.boss.busyUntil = time + cfg.warnMs;
      try { AUDIO.play('wyrmdischarge'); } catch (e) {}
      scene.banner('CHAIN LIGHTNING\nit leaps to the eels — kill them', '#f8ffb0');
    },
    // SERPENT'S UNDERTOW (P2) — he circles fast, an inward pull + a final snap.
    _serpentUndertow: function (scene, b, time) {
      var cfg = b.boss.def.patterns.serpentUndertow, C = scene._ab;
      C.bossPull = { x: C.arena.x, y: C.arena.y, force: cfg.pull, until: time + cfg.warnMs + cfg.activeMs, snapDmg: cfg.snapDmg };
      b.boss.busyUntil = time + cfg.warnMs;
      try { AUDIO.play('wyrmroar'); } catch (e) {}
      scene.banner("SERPENT'S UNDERTOW\nhe drags you into the coil — anchor and break out", '#d8e84a');
    },
    // MAELSTROM BREACH (P2 signature) — three warned dive-breaches; the last
    // erupts a full-arena expanding ring lattice → the longest vent.
    _maelstrom: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.maelstrom, C = scene._ab;
      b.setVisible(false); b.body.enable = false; b.boss.diving = true;
      var seq = [];
      for (var i = 0; i < cfg.dives; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : SIM.rng() * C.arena.rx * 0.7;
        var x = player.x + Math.cos(a) * rr, y = player.y + Math.sin(a) * rr;
        var g = scene.add.circle(x, y, cfg.breachR, BOSST, 0.14).setStrokeStyle(2, 0xf8ffb0, 0.9).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs + i * cfg.gapMs });
        seq.push({ x: x, y: y, at: time + cfg.warnMs + i * cfg.gapMs, fired: false, g: g, last: (i === cfg.dives - 1) });
      }
      C.maelstrom = { seq: seq, breachR: cfg.breachR, dmg: cfg.dmg, latticeRings: cfg.latticeRings,
                      latticeGap: cfg.latticeGap, latticeAt: 0, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult, done: false };
      b.boss.busyUntil = time + cfg.warnMs + cfg.dives * cfg.gapMs + 1200;
      try { AUDIO.play('wyrmroar'); } catch (e) {}
      scene.banner('MAELSTROM BREACH\nthree strikes — then the whole arena erupts', '#f8ffb0');
    },
    _runMaelstrom: function (scene, C, time) {
      var b = scene.boss, M = C.maelstrom, p = scene.player;
      if (!b || !b.active) { AB._clearBoss(scene, C, time); return; }
      var allFired = true;
      for (var i = 0; i < M.seq.length; i++) {
        var S2 = M.seq[i];
        if (S2.fired) continue;
        allFired = false;
        if (time < S2.at) break;
        S2.fired = true;
        if (S2.g) { try { S2.g.destroy(); } catch (e) {} }
        scene.burst(S2.x, S2.y, 18, BOSST);
        scene.cameras.main.shake(160, 0.008);
        if (p.state.alive && Math.hypot(p.x - S2.x, p.y - S2.y) < M.breachR)
          Entities.hurtPlayer(scene, p, M.dmg, time, "the maelstrom", true);
        if (S2.last) {
          // erupt the full-arena expanding ring lattice
          for (var k = 0; k < M.latticeRings; k++) {
            var g = scene.add.graphics().setDepth(9);
            C.rings.push({ x: C.arena.x, y: C.arena.y, r: 20 + k * 30, r0: 20 + k * 30, maxR: 20 + k * 30 + M.latticeGap,
              start: time + k * 140, until: time + k * 140 + 800, dmg: M.dmg, src: 'the maelstrom lattice',
              fromBoss: true, hit: false, g: g, tint: BOSST });
          }
          // the Wyrm surfaces beached & LONGEST-vented
          b.body.reset(S2.x, S2.y);
          b.setVisible(true); b.body.enable = true; b.boss.diving = false;
          b.boss.ventedUntil = time + M.ventMs; b.boss.ventDmgMult = M.ventDmgMult;
          b.boss.rootUntil = time + M.ventMs; b.setTint(0xf8ffb0);
          (function () { scene.time.delayedCall(M.ventMs, function () { if (b.active) b.clearTint(); }); })();
          scene.banner('BEACHED — UNTANGLING\nthe longest window: UNLOAD', '#f8ffb0');
          C.maelstrom = null;
          return;
        }
      }
      if (allFired) C.maelstrom = null;
    },

    // =============================================== MOB VERBS (map-new) ===
    // GHOST JELLY — slow sinusoidal drift; contact sting via core chase.
    _jelly: function (scene, m, player, time) {
      var cfg = m.mob.def.drift;
      var d = Math.hypot(player.x - m.x, player.y - m.y) || 1;
      var toP = Math.atan2(player.y - m.y, player.x - m.x);
      var wander = Math.sin(time * 0.0016 + (m.id || 0)) * cfg.wander;
      var ang = toP + wander;
      var spd = m.mob.def.spd * cfg.approach + m.mob.def.spd * 0.35;
      m.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
      return true;                                            // owns its drift
    },
    // SWORDFISH — thin lane telegraph (wrap-aware) → high-speed charge through.
    _sword: function (scene, m, player, time) {
      var cfg = m.mob.def.lance;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._lanceAng) * cfg.speed, Math.sin(m.mob._lanceAng) * cfg.speed);
        return true;
      }
      if (m.mob.laneLockUntil) {
        if (time >= m.mob.laneLockUntil) {
          m.mob.laneLockUntil = 0;
          (m.mob._lanceG || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
          m.mob._lanceG = null;
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._lanceAng) * cfg.speed, Math.sin(m.mob._lanceAng) * cfg.speed);
          try { AUDIO.play('lancewhoosh'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextLanceAt) m.mob.nextLanceAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var dd = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLanceAt && dd < cfg.range && player.state.alive) {
        m.mob.nextLanceAt = time + cfg.everyMs;
        m.mob.laneLockUntil = time + cfg.warnMs;
        m.mob._lanceAng = Math.atan2(player.y - m.y, player.x - m.x);
        var WW = scene.worldW, HH = scene.worldH;
        var x1 = m.x + Math.cos(m.mob._lanceAng) * cfg.len, y1 = m.y + Math.sin(m.mob._lanceAng) * cfg.len;
        var gs = [AB._laneWarn(scene, m.x, m.y, x1, y1, cfg.half)];
        if (x1 < 0 || x1 >= WW) { var sx = x1 < 0 ? WW : -WW; gs.push(AB._laneWarn(scene, m.x + sx, m.y, x1 + sx, y1, cfg.half)); }
        if (y1 < 0 || y1 >= HH) { var sy = y1 < 0 ? HH : -HH; gs.push(AB._laneWarn(scene, m.x, m.y + sy, x1, y1 + sy, cfg.half)); }
        m.mob._lanceG = gs;
        return true;
      }
      return false;
    },
    // VOLT EEL — coils (telegraph) → expanding shock-ring → zap.
    _volt: function (scene, m, player, time) {
      var cfg = m.mob.def.zap, C = scene._ab;
      if (m.mob.coilUntil) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xd8e84a : 0xffffff);
        if (time >= m.mob.coilUntil) {
          m.mob.coilUntil = 0; m.clearTint();
          var g = scene.add.graphics().setDepth(9);
          C.rings.push({ x: m.x, y: m.y, r: 18, r0: 18, maxR: cfg.maxR, start: time, until: time + cfg.ringMs,
            dmg: cfg.dmg, src: 'a Volt Eel', fromBoss: false, hit: false, g: g, tint: 0xd8e84a });
          try { AUDIO.play('jellyzap'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextZapAt) m.mob.nextZapAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextZapAt && d < cfg.range && player.state.alive && time >= (m.mob.zapCdUntil || 0)) {
        m.mob.nextZapAt = time + cfg.everyMs;
        m.mob.zapCdUntil = time + cfg.everyMs;
        m.mob.coilUntil = time + cfg.coilMs;
        return true;
      }
      return false;
    },
    // VAMPIRE SQUID — ranged pokes (core shoot); when hurt → ink blot + jet away.
    _squid: function (scene, m, player, time) {
      var cfg = m.mob.def.ink, C = scene._ab;
      if (m.mob._inkHp === undefined) m.mob._inkHp = m.mob.hp;
      if (m.mob.jetUntil) {
        if (time >= m.mob.jetUntil) { m.mob.jetUntil = 0; m.setVelocity(0, 0); return false; }
        return true;                                          // jetting away — owns movement
      }
      if (m.mob.hp < m.mob._inkHp && time >= (m.mob.nextInkAt || 0)) {
        m.mob._inkHp = m.mob.hp;
        m.mob.nextInkAt = time + cfg.cooldownMs;
        var obj = scene.add.circle(m.x, m.y, cfg.cloudR, 0x141020, 0.5).setDepth(3.5);
        C.patches.push({ x: m.x, y: m.y, r: cfg.cloudR, dieAt: time + cfg.cloudMs, obj: obj, slowMult: cfg.slowMult });
        var a = Math.atan2(m.y - player.y, m.x - player.x);
        m.mob.jetUntil = time + cfg.jetMs;
        m.setVelocity(Math.cos(a) * cfg.jetSpeed, Math.sin(a) * cfg.jetSpeed);
        scene.burst(m.x, m.y, 8, 0x141020);
        try { AUDIO.play('inkpuff'); } catch (e) {}
        return true;
      }
      m.mob._inkHp = m.mob.hp;
      return false;                                           // let core shoot verb run
    },
    // CRIMSON STARFISH — warned hop-arc → latch (SHORT player slow); break by
    // kill / distance / hitstop.
    _star: function (scene, m, player, time) {
      var cfg = m.mob.def.latch, C = scene._ab;
      if (C.starLatch && C.starLatch.m === m) { m.body.reset(player.x + 10, player.y - 6); return true; }
      if (m.mob.hopUntil) {
        if (time >= m.mob.hopUntil) { m.mob.hopUntil = 0; m.setVelocity(0, 0); return true; }
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 32 && !C.starLatch) {
          m.mob.hopUntil = 0;
          C.starLatch = { m: m, until: time + cfg.latchMs, slowMult: cfg.slowMult, breakDist: cfg.breakDist, cooldownMs: cfg.cooldownMs };
          scene.damageNumber(player.x, player.y - 24, 'LATCHED', '#e05a3a');
          try { AUDIO.play('latchsquelch'); } catch (e) {}
        }
        return true;
      }
      if (m.mob.laneLockUntil) {   // warn (arc telegraph)
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xe05a3a : 0xffffff);
        if (time >= m.mob.laneLockUntil) {
          m.mob.laneLockUntil = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.hopUntil = time + cfg.hopMs;
          m.setVelocity(Math.cos(a) * cfg.hopSpeed, Math.sin(a) * cfg.hopSpeed);
        }
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHopAt && d < cfg.range && player.state.alive && !C.starLatch) {
        m.mob.nextHopAt = time + cfg.cooldownMs;
        m.mob.laneLockUntil = time + cfg.warnMs;
        return true;
      }
      return false;
    },
    // DROWNED DIVER — aim-line → harpoon pulls YOU a step in (capped; reel tag).
    _diver: function (scene, m, player, time) {
      var cfg = m.mob.def.harpoon, C = scene._ab;
      if (m.mob.aimUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.aimUntil) {
          m.mob.aimUntil = 0;
          if (m.mob._aimG) { try { m.mob._aimG.destroy(); } catch (e) {} m.mob._aimG = null; }
          if (player.state.alive && time >= C.reelUntil) {
            C.reelUntil = time + 700;                         // shared reel cooldown (no stunlock)
            var a = Math.atan2(m.y - player.y, m.x - player.x);
            player.body.velocity.x += Math.cos(a) * cfg.pull; player.body.velocity.y += Math.sin(a) * cfg.pull;
            scene.damageNumber(player.x, player.y - 24, 'REELED', '#b8845a');
            try { AUDIO.play('abyssharpoon'); } catch (e) {}
          }
        }
        return true;
      }
      if (!m.mob.nextHarpoonAt) m.mob.nextHarpoonAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextHarpoonAt && d < cfg.range && player.state.alive) {
        m.mob.nextHarpoonAt = time + cfg.everyMs;
        m.mob.aimUntil = time + cfg.warnMs;
        m.mob._aimG = AB._laneWarn(scene, m.x, m.y, player.x, player.y, 8);
        return true;
      }
      return false;
    },
    // GHOST FISHERMAN — lure onto a warned circle → yank drags the hooked (reel tag).
    _fisher: function (scene, m, player, time) {
      var cfg = m.mob.def.cast, C = scene._ab;
      if (m.mob.landUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.landUntil) {
          m.mob.landUntil = 0;
          if (m.mob._lureG) { try { m.mob._lureG.destroy(); } catch (e) {} m.mob._lureG = null; }
          if (player.state.alive && time >= C.reelUntil &&
              Math.hypot(player.x - m.mob._lureX, player.y - m.mob._lureY) < cfg.radius) {
            C.reelUntil = time + 700;
            var a = Math.atan2(m.y - player.y, m.x - player.x);
            player.body.velocity.x += Math.cos(a) * cfg.pull; player.body.velocity.y += Math.sin(a) * cfg.pull;
            scene.damageNumber(player.x, player.y - 24, 'HOOKED', '#c8b04a');
            try { AUDIO.play('lureyank'); } catch (e) {}
          }
        }
        return true;
      }
      if (!m.mob.nextCastAt) m.mob.nextCastAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextCastAt && d < cfg.range && player.state.alive) {
        m.mob.nextCastAt = time + cfg.everyMs;
        m.mob.landUntil = time + cfg.warnMs;
        m.mob._lureX = player.x; m.mob._lureY = player.y;
        m.mob._lureG = scene.add.circle(player.x, player.y, cfg.radius, 0xc8b04a, 0.14).setStrokeStyle(2, 0xf0e0a0, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: m.mob._lureG, scale: 1, duration: cfg.warnMs });
        return true;
      }
      return false;
    },
    // TRENCH LOBSTER — claws up → snip-charge lane; ARMORED while charging (flank it).
    _lobster: function (scene, m, player, time) {
      var cfg = m.mob.def.charge;
      if (m.mob._armHp === undefined) m.mob._armHp = m.mob.hp;
      var armored = !!(m.mob.chargeUntil || m.mob.laneLockUntil);
      if (armored && m.mob.hp < m.mob._armHp) {               // frontal armor: refund a fraction
        var lost = m.mob._armHp - m.mob.hp;
        m.mob.hp = Math.min(m.mob.maxHp, m.mob.hp + Math.round(lost * cfg.frontArmor));
        scene.damageNumber(m.x, m.y - 24, 'CLANG', '#e06a4a');
        try { AUDIO.play('lobstersnip'); } catch (e) {}
      }
      m.mob._armHp = m.mob.hp;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
        return true;
      }
      if (m.mob.laneLockUntil) {
        if (time >= m.mob.laneLockUntil) {
          m.mob.laneLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
          try { AUDIO.play('lobstersnip'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextChargeAt) m.mob.nextChargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextChargeAt && d < cfg.range && player.state.alive) {
        m.mob.nextChargeAt = time + cfg.everyMs;
        m.mob.laneLockUntil = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._chargeG = AB._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // BANDED SEA SNAKE — S-coil → warned strike cone + venom slow.
    _snake: function (scene, m, player, time) {
      var cfg = m.mob.def.strike, C = scene._ab;
      if (m.mob.strikeLockUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.strikeLockUntil) {
          m.mob.strikeLockUntil = 0;
          if (m.mob._strikeG) { try { m.mob._strikeG.destroy(); } catch (e) {} m.mob._strikeG = null; }
          try { AUDIO.play('snakehiss'); } catch (e) {}
          if (player.state.alive && inArc(player.x, player.y, m.x, m.y, cfg.range, m.mob._strikeAng, cfg.halfRad)) {
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Sea Snake's venom");
            C.venomUntil = time + cfg.venomMs; C.venomMult = cfg.venomMult;
            scene.damageNumber(player.x, player.y - 24, 'VENOM', '#aef65a');
          }
        }
        return true;
      }
      if (!m.mob.nextStrikeAt) m.mob.nextStrikeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextStrikeAt && d < cfg.range && player.state.alive) {
        m.mob.nextStrikeAt = time + cfg.everyMs;
        m.mob.strikeLockUntil = time + cfg.warnMs;
        m.mob._strikeAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x41d6f6, 0.12); g.lineStyle(2, 0xaef65a, 0.85);
        g.slice(m.x, m.y, cfg.range, m.mob._strikeAng - cfg.halfRad, m.mob._strikeAng + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        m.mob._strikeG = g;
        return true;
      }
      return false;
    },
    // LANTERN SNAIL — mends nearby mobs (priority target); flits from you.
    _snail: function (scene, m, player, time) {
      var cfg = m.mob.def.mend;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.fleeRange && player.state.alive) {
        var a = Math.atan2(m.y - player.y, m.x - player.x);
        m.setVelocity(Math.cos(a) * m.mob.def.spd * 1.3, Math.sin(a) * m.mob.def.spd * 1.3);
      } else m.setVelocity(0, 0);
      if (!m.mob.nextHealAt) m.mob.nextHealAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (!scene.hitstopActive && time >= m.mob.nextHealAt) {
        var best = null, bestD = cfg.range;
        scene.mobs.children.iterate(function (o) {
          if (!o || !o.active || !o.mob || o === m || o.mob.hp >= o.mob.maxHp) return;
          var dd = Math.hypot(o.x - m.x, o.y - m.y);
          if (dd < bestD) { bestD = dd; best = o; }
        });
        if (best) {
          m.mob.nextHealAt = time + cfg.everyMs;
          best.mob.hp = Math.min(best.mob.maxHp, best.mob.hp + cfg.heal);
          best.setTint(0xd8fff2);
          (function (o2) { scene.time.delayedCall(240, function () { if (o2.active) o2.clearTint(); }); })(best);
          scene.damageNumber(best.x, best.y - 24, '+' + cfg.heal, '#7df9d8');
          scene.burst(m.x, m.y, 5, 0xd8fff2);
          try { AUDIO.play('snailchime'); } catch (e) {}
        }
      }
      return true;                                            // never chases
    },
    // KRAKEN SPAWN — anchored; telegraphed tentacle-slam lanes in sequence.
    _kraken: function (scene, m, player, time) {
      var cfg = m.mob.def.slam, C = scene._ab;
      m.setVelocity(0, 0);                                    // anchored
      // the slam SEQUENCE resolves via its C.lanes (self-timed); clear the
      // per-mob lock once the last lane has fired so the kraken can slam again.
      if (m.mob.slamSeq && time >= m.mob.slamEndAt) m.mob.slamSeq = null;
      if (!m.mob.nextSlamAt) m.mob.nextSlamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSlamAt && d < cfg.range && player.state.alive && !m.mob.slamSeq) {
        m.mob.nextSlamAt = time + cfg.everyMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x);
        var seq = [];
        for (var j = 0; j < cfg.count; j++) {
          var a = base + (j - (cfg.count - 1) / 2) * 0.5;
          // M7k AUDIT fix: pass the kraken as srcMob — its own lanes must not mow it
          AB._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len },
            cfg.half, cfg.warnMs + j * cfg.gapMs, cfg.dmg, 'a Kraken Spawn tentacle', false, time, 0x8a4666, m);
          seq.push({ done: false });
        }
        m.mob.slamSeq = seq;
        m.mob.slamEndAt = time + cfg.warnMs + (cfg.count - 1) * cfg.gapMs + 300;
        try { AUDIO.play('krakenslam'); } catch (e) {}
        return true;
      }
      return false;
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
    _laneWarn: function (scene, x0, y0, x1, y1, half) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, 0x41d6f6, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, 0xc2fbff, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._ab;
      var tint = fromBoss ? BOSST : ENVT;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._ab;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? BOSST : ENVT);
        if (z.dmg > 0) scene.cameras.main.shake(80, 0.004);
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
      }
    },
    // M7k AUDIT fix: srcMob stamps the lane with its caster — mob-sourced lanes
    // never mow mobs (mowMobs false), so a Kraken Spawn's own slam no longer
    // kills the kraken itself (~950ms after its first slam) or its neighbors.
    // Boss-sourced lane behavior is unchanged. Player damage is kept.
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint, srcMob) {
      var C = scene._ab;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      C.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint,
                     srcMob: srcMob || null, mowMobs: !srcMob });
    },
    _runLanes: function (scene, time) {
      var C = scene._ab;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(100, 0.005);
        scene.mobs.children.iterate(function (m) {
          // M7k AUDIT fix: skip the lane's own caster + all mob-mowing for
          // mob-sourced (kraken) lanes
          if (m && m.active && m.mob && !l.fromBoss && l.mowMobs !== false && m !== l.srcMob && dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AB;
  root.ABYSS_SCENE = AB;
})(typeof window !== 'undefined' ? window : this);
