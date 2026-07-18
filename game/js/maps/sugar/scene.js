// ============================================================================
// game/js/maps/sugar/scene.js — SUGAR WORLD scene hooks (M7 registry).
// The scene-plan PNG (assets/sugar_scene_plan.png) is canon, toroidal:
// FROSTED PEAKS + icing snow (N) · COTTON CANDY FOREST (W) · GINGERBREAD
// VILLAGE behind DESTRUCTIBLE candy-cane fences (E) · a PEPPERMINT PATH that
// winds N-S edge-to-edge (cosmetic — no speed mod) · a CHOCOLATE RIVER that
// winds W-E edge-to-edge (IMPASSABLE scenery water — crossable ONLY at the two
// cane-railed bridges) · soda geysers + jelly pond (SE) · cookie-crumble flats
// in the corners · and the SUGAR BEAR DEN (S-center): a gummy-floor clearing
// ringed by a destructible cane fence with a DONUT-ARCH gate (open — the boss
// is never trapped). SIGNATURE MECHANIC: killed mobs may drop a CANDY PICKUP =
// FULL HEAL (rare, no-farm guarded: children + boss adds never drop). GLOBAL
// RULE born here: ALL FENCES DESTRUCTIBLE (wobble → crack → shatter, slow
// regrow). All hooks reset their own state in setup() — Phaser reuses scenes.
// ============================================================================
(function (root) {
  'use strict';

  // ---- planned layout (fractions of the world; plan PNG canon) ------------
  var DECOR = [
    ['sugdPeak', 0.16, 0.09, 2.2], ['sugdPeak', 0.42, 0.07, 2.4], ['sugdPeak', 0.7, 0.1, 2.2],
    ['sugdMallows', 0.28, 0.14, 1.6], ['sugdMallows', 0.58, 0.13, 1.5],
    ['sugdCottonTree', 0.1, 0.32, 1.8], ['sugdCottonTree', 0.22, 0.26, 1.7], ['sugdGumdropTree', 0.14, 0.44, 1.6],
    ['sugdLolliGrove', 0.13, 0.55, 1.7], ['sugdFlowers', 0.24, 0.5, 1.3],
    ['sugdGingerHouse', 0.68, 0.24, 2.0], ['sugdGingerHouse', 0.8, 0.2, 1.8], ['sugdMushroom', 0.86, 0.34, 1.5],
    ['sugdCupcakeHouse', 0.74, 0.36, 1.9],
    ['sugdGeyser', 0.7, 0.56, 1.5], ['sugdGeyser', 0.78, 0.52, 1.4], ['sugdJelly', 0.86, 0.58, 1.8],
    ['sugdCubes', 0.4, 0.58, 1.4], ['sugdWafers', 0.34, 0.66, 1.5], ['sugdScoop', 0.6, 0.62, 1.5],
    ['sugdWheel', 0.56, 0.7, 1.6], ['sugdTaffy', 0.62, 0.72, 1.4], ['sugdSign', 0.47, 0.44, 1.6]
  ];
  // destructible fence rows: [x0,y0,x1,y1] fractions — village walls (E) + den ring done separately
  var VILLAGE_FENCE = [
    [0.6, 0.18, 0.6, 0.34], [0.6, 0.34, 0.72, 0.42], [0.72, 0.42, 0.86, 0.4]
  ];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var SG = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._sg = {
        WW: WW, HH: HH,
        zones: [], patches: [], lanes: [], spirals: [], dartLanes: [], cones: [],
        hooks: [], smothers: [], hug: null, rain: null, mobWarns: [],
        candies: [], fences: [], childCount: 0, childCap: 12,
        pendingSlow: 1, lastSafe: { x: 0.5 * WW, y: 0.9 * HH }, bossArmed: false,
        arena: { x: 0.5 * WW, y: 0.8 * HH, rx: 0.13 * WW, ry: 0.11 * HH },
        // river meander (periodic over WW → seamless wrap) + two bridges
        river: { y0: 0.5 * HH, amp1: 0.06 * HH, amp2: 0.02 * HH, half: 0.045 * HH,
                 bridges: [0.28 * WW, 0.66 * WW], bridgeHalf: 0.032 * WW }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- base sprinkle meadow + region tiles (masked) ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'sugSprinkle').setDepth(-24);
      SG._region(scene, 0.5 * WW, 0.09 * HH, 0.56 * WW, 0.11 * HH, 'sugIcing', -23.5);   // frosted peaks / icing snow N
      SG._region(scene, 0.1 * WW, 0.88 * HH, 0.14 * WW, 0.13 * HH, 'sugCookie', -23.5);   // cookie flats SW
      SG._region(scene, 0.9 * WW, 0.9 * HH, 0.13 * WW, 0.12 * HH, 'sugCookie', -23.5);    // cookie flats SE
      SG._region(scene, C.arena.x, C.arena.y, C.arena.rx * 1.2, C.arena.ry * 1.2, 'sugGummy', -23); // den gummy floor

      // ---- PEPPERMINT PATH (cosmetic, wraps N-S) — a winding brick strip ----
      for (var yy = 0; yy < HH; yy += 20) {
        var pxc = SG._pathX(C, yy);
        scene.add.tileSprite(pxc, yy + 10, 0.03 * WW, 22, 'sugPath').setDepth(-22.5);
      }
      scene.add.sprite(SG._pathX(C, 0.44 * HH), 0.44 * HH, 'sugdSign').setScale(1.6).setDepth(2);

      // ---- CHOCOLATE RIVER (impassable scenery, wraps W-E) — strip segments --
      for (var xx = 0; xx < WW; xx += 24) {
        var ryc = SG._riverY(C, xx);
        scene.add.tileSprite(xx + 12, ryc, 26, C.river.half * 2, 'sugRiver').setDepth(-22);
      }
      // the two cane-railed bridges
      C.river.bridges.forEach(function (bx) {
        var by = SG._riverY(C, bx);
        scene.add.sprite(bx, by, 'sugdBridge').setScale(2.6).setDepth(-21.5);
      });

      // ---- decor ----
      DECOR.forEach(function (D) { scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2); });
      // donut-arch gate at the den's north edge (the open gateway)
      C.gate = scene.add.sprite(C.arena.x, C.arena.y - C.arena.ry - 6, 'sugdDonut').setScale(2.4).setDepth(2);
      // den ring cosmetic
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0xc04a88, 0.7); rg.strokeEllipse(C.arena.x, C.arena.y, C.arena.rx * 2, C.arena.ry * 2);

      // ---- DESTRUCTIBLE FENCES — village rows + the den ring (gap at gate) ---
      C.fenceBodies = scene.physics.add.staticGroup();
      VILLAGE_FENCE.forEach(function (F) {
        var n = 5;
        for (var i = 0; i <= n; i++) {
          var fx = (F[0] + (F[2] - F[0]) * i / n) * WW, fy = (F[1] + (F[3] - F[1]) * i / n) * HH;
          SG._addFence(scene, C, fx, fy);
        }
      });
      // den ring: cane posts around the arena, with a GATE GAP at the top (open)
      for (var a = 0; a < Math.PI * 2; a += 0.5) {
        if (a > Math.PI * 1.35 && a < Math.PI * 1.65) continue;   // north gate gap
        var fx2 = C.arena.x + Math.cos(a) * C.arena.rx * 1.35;
        var fy2 = C.arena.y + Math.sin(a) * C.arena.ry * 1.35;
        SG._addFence(scene, C, fx2, fy2, true);
      }

      // ---- spawn on the peppermint path, south, just outside the den gate ----
      scene._realmStart = { x: SG._pathX(C, 0.92 * HH), y: 0.92 * HH };
      C.lastSafe = { x: scene._realmStart.x, y: scene._realmStart.y };

      // mob-verb helpers (fresh closures)
      scene._sgGummy = function (m, p, t) { return SG._gummy(scene, m, p, t); };
      scene._sgGinger = function (m, p, t) { return SG._ginger(scene, m, p, t); };
      scene._sgLancer = function (m, p, t) { return SG._lancer(scene, m, p, t); };
      scene._sgJaw = function (m, p, t) { return SG._jaw(scene, m, p, t); };
      scene._sgTwirler = function (m, p, t) { return SG._twirler(scene, m, p, t); };
      scene._sgGumdrop = function (m, p, t) { return SG._gumdrop(scene, m, p, t); };
      scene._sgCotton = function (m, p, t) { return SG._cotton(scene, m, p, t); };
      scene._sgMint = function (m, p, t) { return SG._mint(scene, m, p, t); };
      scene._sgMallow = function (m, p, t) { return SG._mallow(scene, m, p, t); };
      scene._sgMimic = function (m, p, t) { return SG._mimic(scene, m, p, t); };
      scene._sgCorn = function (m, p, t) { return SG._corn(scene, m, p, t); };
    },

    _region: function (scene, cx, cy, rx, ry, tex, depth) {
      var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, tex).setDepth(depth);
      var mg = scene.make.graphics({ add: false });
      mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
      spr.setMask(mg.createGeometryMask());
    },
    _pathX: function (C, y) { return 0.48 * C.WW + Math.sin(y / C.HH * Math.PI * 2) * 0.05 * C.WW; },
    _riverY: function (C, x) {
      var R = C.river;
      return R.y0 + Math.sin(x / C.WW * Math.PI * 2) * R.amp1 + Math.sin(x / C.WW * Math.PI * 2 * 3) * R.amp2;
    },
    _inRiver: function (C, x, y) { return Math.abs(y - SG._riverY(C, x)) < C.river.half; },
    _onBridge: function (C, x) {
      for (var i = 0; i < C.river.bridges.length; i++) {
        var dx = Math.abs(x - C.river.bridges[i]);
        dx = Math.min(dx, C.WW - dx);                    // wrap-aware
        if (dx < C.river.bridgeHalf) return true;
      }
      return false;
    },
    _addFence: function (scene, C, x, y, denRing) {
      var spr = C.fenceBodies.create(x, y, 'sugFence0').setScale(0.85).setDepth(3);
      spr.body.setSize(spr.width * 0.7, spr.height * 0.5);
      var cfg = scene.realmDef.fence || { hp: 24 };
      C.fences.push({ spr: spr, x: x, y: y, hp: cfg.hp, maxHp: cfg.hp, state: 0,
                      down: false, regrowAt: Infinity, denRing: !!denRing });
    },

    afterCreate: function (scene) {
      var C = scene._sg; if (!C) return;
      // ATTACH COLLIDERS HERE (player exists now) — never in setup()
      scene.physics.add.collider(scene.player, C.fenceBodies);
      scene.physics.add.collider(scene.mobs, C.fenceBodies);
      // NOTE: the mob-died listener is bound in update() (below) — NOT here —
      // because core's wireEvents() runs AFTER afterCreate and does
      // events.off('mob-died'), which would wipe a listener registered here.
    },

    // CANDY PICKUPS + SPLITS ride the mob-died event. Bound lazily on the first
    // update tick so it survives wireEvents()'s events.off('mob-died').
    _bindDeath: function (scene, C) {
      if (C._diedBound) return;
      C._diedBound = true;
      scene.events.on('mob-died', function (mob) {
        if (!mob || !mob.mob) return;
        var mdef = mob.mob.def;
        // core's spawnMob builds a FIXED m.mob literal + drainSpawnQueue only
        // propagates bossWave — it never copies def.isChild onto the instance.
        // So identify split-children off the DEF (mdef.isChild), never off the
        // instance, or childCount would never decrement (splits lock out forever).
        var isChild = !!(mob.mob.isChild || mdef.isChild);
        // ---- split children (no-farm: children + boss adds never re-split) ----
        if (mdef.splitOnDeath && !isChild && !mob.mob.bossWave) {
          var sp = mdef.splitOnDeath;
          var room = Math.max(0, C.childCap - C.childCount);
          var n = Math.min(sp.count, room);
          for (var i = 0; i < n; i++) {
            var sa = Math.PI * 2 * i / Math.max(1, sp.count);
            scene.queueSpawn({ key: sp.key, x: mob.x + Math.cos(sa) * sp.ring, y: mob.y + Math.sin(sa) * sp.ring });
          }
          C.childCount += n;
        }
        if (isChild) C.childCount = Math.max(0, C.childCount - 1);
        // ---- CANDY PICKUP roll — the full-heal economy (NO-FARM guard) ----
        var cc = scene.realmDef.candy;
        var noFarm = isChild || mob.mob.bossWave || mdef.noCandy;
        if (cc && !noFarm && SIM.rng() < cc.dropChance) SG._spawnCandy(scene, C, mob.x, mob.y);
      });
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._sg; if (!C) return;
      SG._bindDeath(scene, C);
      var p = scene.player, alive = p.state.alive;
      C.pendingSlow = 1;

      // boss-owned machinery clears when the boss is down
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        SG._clearBossFx(scene, C);
      }

      // ---- CANDY PICKUPS: eat = FULL HEAL; despawn timers; ground cap ----
      for (var ci = C.candies.length - 1; ci >= 0; ci--) {
        var CA = C.candies[ci];
        if (time >= CA.dieAt) { try { CA.spr.destroy(); } catch (e) {} C.candies.splice(ci, 1); continue; }
        if (CA.spr && CA.spr.active) CA.spr.y = CA.baseY + Math.sin(time / 240 + CA.ph) * 4;   // gentle bob
        if (alive && Math.hypot(p.x - CA.x, p.y - CA.y) < (scene.realmDef.candy.radius || 40)) {
          p.state.hp = p.state.stats.hp;                 // FULL HEAL (the whole point)
          scene.damageNumber(p.x, p.y - 26, 'FULL HEAL', '#ff9ac8');
          scene.burst(CA.x, CA.y, 16, 0xffd0e8);
          try { AUDIO.play('candychime'); } catch (e) {}
          try { CA.spr.destroy(); } catch (e2) {}
          C.candies.splice(ci, 1);
        }
      }

      // ---- FENCES: player-shot hits → state deterioration → shatter/regrow ---
      var shots = scene.playerShots;
      for (var fi = 0; fi < C.fences.length; fi++) {
        var F = C.fences[fi];
        if (F.down) {
          if (time >= F.regrowAt) SG._regrowFence(scene, F, time);   // M7k AUDIT fix: pass scene/time for the footprint guard
          continue;
        }
        if (shots) shots.children.iterate(function (s) {
          if (!s || !s.active || F.down) return;
          if (Math.hypot(s.x - F.x, s.y - F.y) < 26) {
            F.hp -= (s.proj ? s.proj.dmg : 5);
            SG._fenceState(scene, C, F, time);
            if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
          }
        });
      }

      // ---- RIVER: impassable except on the bridges (routing) ----
      if (alive) {
        if (SG._inRiver(C, p.x, p.y) && !SG._onBridge(C, p.x)) {
          p.body.reset(C.lastSafe.x, C.lastSafe.y);
          p.body.velocity.x = 0; p.body.velocity.y = 0;
        } else {
          C.lastSafe.x = p.x; C.lastSafe.y = p.y;
        }
      }

      // ---- COTTON SLOW: drift auras + smother patches, ONE capped application -
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.mapVerb !== 'cottonSlow') return;
        var au = m.mob.def.aura;
        if (alive && Math.hypot(p.x - m.x, p.y - m.y) < au.auraR) C.pendingSlow = Math.min(C.pendingSlow, au.slowMult);
      });

      // ---- patches: lingering slow / damage fields (smother, seeps) ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r) {
          if (PA.slowMult) C.pendingSlow = Math.min(C.pendingSlow, PA.slowMult);
          if (PA.dmg && time >= (PA.nextTickAt || 0)) { PA.nextTickAt = time + PA.tickMs; Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'sticky candy', !!PA.fromBoss); }
        }
      }
      // apply the ONE capped slow (CC-stack cap: never below 0.4×)
      if (alive && C.pendingSlow < 1) {
        var sm = Math.max(0.4, C.pendingSlow);
        p.body.velocity.x *= sm; p.body.velocity.y *= sm;
      }

      // ---- clean up warn graphics whose owning mob died ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- hazard-pool processors ----
      SG._runZones(scene, time);
      SG._runLanes(scene, C.lanes, time);
      SG._runLanes(scene, C.dartLanes, time);
      SG._runSpirals(scene, time);
      SG._runCones(scene, time);
      SG._runHooks(scene, time);
      SG._runSmothers(scene, time);
      SG._runHug(scene, time);
      SG._runRain(scene, time);

      // ---- toroidal wrap (skip mid-hop / boss-wave / boss-rooted moment) ----
      SG._wrap(scene, C);
    },

    // ---------------------------- candy + fences ---------------------------
    _spawnCandy: function (scene, C, x, y) {
      var cc = scene.realmDef.candy;
      while (C.candies.length >= (cc.maxGround || 3)) {          // cap ground candies — despawn oldest
        var old = C.candies.shift(); if (old) { try { old.spr.destroy(); } catch (e) {} }
      }
      var spr = scene.add.sprite(x, y, 'sugCandy').setScale(1).setDepth(5);
      C.candies.push({ spr: spr, x: x, y: y, baseY: y, ph: SIM.rng() * 6.28, dieAt: scene.time.now + (cc.despawnMs || 20000) });
      scene.burst(x, y, 8, 0xffd0e8);
      try { AUDIO.play('candysparkle'); } catch (e) {}
    },
    _fenceState: function (scene, C, F, time) {
      var cfg = scene.realmDef.fence || { hp: 24, regrowMs: null };
      if (F.hp <= 0) {
        F.down = true; F.state = 2;
        F.spr.setTexture('sugFence2'); F.spr.body.enable = false;
        scene.time.delayedCall(120, function () { if (F.spr && F.spr.active && F.down) F.spr.setVisible(false); });
        scene.burst(F.x, F.y, 14, 0xff9ac8);
        for (var i = 0; i < 3; i++) { var sh = scene.add.sprite(F.x, F.y, 'sugShard').setDepth(6); (function (sh) {
          scene.tweens.add({ targets: sh, x: F.x + (SIM.rng() * 2 - 1) * 40, y: F.y + (SIM.rng() * 2 - 1) * 40, alpha: 0, duration: 500, onComplete: function () { try { sh.destroy(); } catch (e) {} } }); })(sh); }
        try { AUDIO.play('fenceshatter'); } catch (e) {}
        F.regrowAt = (cfg.regrowMs != null) ? time + cfg.regrowMs : Infinity;
      } else {
        var frac = F.hp / F.maxHp;
        var ns = frac > 0.5 ? 0 : 1;
        if (ns !== F.state) { F.state = ns; F.spr.setTexture(ns === 0 ? 'sugFence0' : 'sugFence1'); }
        F.spr.setTintFill(0xffffff);
        (function (F) { scene.time.delayedCall(50, function () { if (F.spr && F.spr.active) F.spr.clearTint(); }); })(F);
        try { AUDIO.play('fencecrack'); } catch (e) {}
      }
    },
    _regrowFence: function (scene, F, time) {
      // M7k AUDIT fix: never re-enable the fence body while the player stands
      // in its footprint (abyss coral guard pattern) — defer the regrow.
      var p = scene.player;
      if (p && p.state.alive && Math.hypot(p.x - F.x, p.y - F.y) < 34) { F.regrowAt = time + 1500; return; }
      F.down = false; F.state = 0; F.hp = F.maxHp; F.regrowAt = Infinity;
      F.spr.setVisible(true).setTexture('sugFence0'); F.spr.body.enable = true;
    },

    // ---------------------------- hazard processors ------------------------
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._sg;
      var tint = fromBoss ? 0xffd0e8 : 0xff9ac8;
      var ring = scene.add.circle(x, y, r, tint, 0.14).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._sg;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xffd0e8 : 0xff9ac8);
        if (z.dmg > 0) scene.cameras.main.shake(90, 0.004);
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.opts && z.opts.leaveSlow) {
          var sl = z.opts.leaveSlow;
          var obj = scene.add.circle(z.x, z.y, z.r, 0xffd0e8, 0.2).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + sl.lifeMs, obj: obj, slowMult: sl.slowMult });
        }
        if (z.opts && z.opts.candyDud) SG._spawnCandy(scene, C, z.x, z.y);
      }
    },
    _laneWarn: function (scene, x0, y0, x1, y1, half, fromBoss) {
      var tint = fromBoss ? 0xffd0e8 : 0xff9ac8;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, tint, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    _lane: function (scene, list, x0, y0, x1, y1, half, warnMs, dmg, src, fromBoss, time) {
      list.push({ x0: x0, y0: y0, x1: x1, y1: y1, half: half, at: time + warnMs, dmg: dmg, src: src,
                  fromBoss: !!fromBoss, g: SG._laneWarn(scene, x0, y0, x1, y1, half, fromBoss) });
    },
    _runLanes: function (scene, list, time) {
      for (var i = list.length - 1; i >= 0; i--) {
        var l = list[i];
        if (time < l.at) continue;
        list.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.fromBoss ? 0xffd0e8 : 0xff9ac8, 0.5); fg.lineBetween(l.x0, l.y0, l.x1, l.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(90, 0.005);
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.x0, l.y0, l.x1, l.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    },
    _runSpirals: function (scene, time) {
      var C = scene._sg, p = scene.player;
      for (var i = C.spirals.length - 1; i >= 0; i--) {
        var S2 = C.spirals[i];
        if (time >= S2.until) { if (S2.g) { try { S2.g.destroy(); } catch (e) {} } C.spirals.splice(i, 1); continue; }
        S2.x += S2.vx * 0.016; S2.y += S2.vy * 0.016;
        S2.ang = (S2.ang || 0) + 0.25;
        if (S2.g) { S2.g.clear(); S2.g.lineStyle(2, 0xff9ac8, 0.8); S2.g.strokeCircle(S2.x, S2.y, S2.radius); S2.g.fillStyle(0xff9ac8, 0.1); S2.g.fillCircle(S2.x, S2.y, S2.radius); }
        if (p.state.alive && time >= (S2.nextTickAt || 0) && Math.hypot(p.x - S2.x, p.y - S2.y) < S2.radius) {
          S2.nextTickAt = time + S2.tickMs;
          Entities.hurtPlayer(scene, p, S2.dmg, time, S2.src || 'a candy spiral', false);
        }
      }
    },
    _cone: function (scene, x, y, ang, half, range, warnMs, dmg, src, fromBoss, time) {
      var C = scene._sg, tint = fromBoss ? 0xffd0e8 : 0xff9ac8;
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(tint, 0.15); g.lineStyle(2, tint, 0.85);
      g.slice(x, y, range, ang - half, ang + half, false); g.fillPath(); g.strokePath();
      C.cones.push({ x: x, y: y, ang: ang, half: half, range: range, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g });
    },
    _runCones: function (scene, time) {
      var C = scene._sg, p = scene.player;
      for (var i = C.cones.length - 1; i >= 0; i--) {
        var co = C.cones[i];
        if (time < co.at) continue;
        C.cones.splice(i, 1);
        if (co.g) { try { co.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.fillStyle(co.fromBoss ? 0xffd0e8 : 0xff9ac8, 0.5);
        fg.slice(co.x, co.y, co.range, co.ang - co.half, co.ang + co.half, false); fg.fillPath();
        scene.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: (function (f) { return function () { try { f.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(110, 0.006);
        if (p.state.alive) {
          var pd = Math.hypot(p.x - co.x, p.y - co.y);
          var pa = Math.atan2(p.y - co.y, p.x - co.x);
          var diff = Math.atan2(Math.sin(pa - co.ang), Math.cos(pa - co.ang));
          if (pd < co.range && Math.abs(diff) < co.half) Entities.hurtPlayer(scene, p, co.dmg, time, co.src, co.fromBoss);
        }
      }
    },
    _runHooks: function (scene, time) {
      var C = scene._sg, p = scene.player;
      for (var i = C.hooks.length - 1; i >= 0; i--) {
        var H = C.hooks[i];
        if (time < H.at) continue;
        C.hooks.splice(i, 1);
        if (H.g) { try { H.g.destroy(); } catch (e) {} }
        try { AUDIO.play('canehook'); } catch (e) {}
        var bs = scene.boss && scene.boss.boss;
        if (!p.state.alive) continue;
        var pd = dist2seg(p.x, p.y, H.x, H.y, H.x + Math.cos(H.ang) * H.range, H.y + Math.sin(H.ang) * H.range);
        if (pd < H.half) {
          Entities.hurtPlayer(scene, p, H.dmg, time, "Sugar Bear's cane hook", true);
          // small, capped yank toward the boss — shares the displacement cd tag
          if (!bs || time >= (bs._hookCdUntil || 0)) {
            if (bs) bs._hookCdUntil = time + (H.cooldownMs || 2600);
            var a = Math.atan2(H.y - p.y, H.x - p.x);
            p.body.velocity.x += Math.cos(a) * H.pull; p.body.velocity.y += Math.sin(a) * H.pull;
          }
        }
      }
    },
    _runSmothers: function (scene, time) {
      var C = scene._sg, p = scene.player;
      for (var i = C.smothers.length - 1; i >= 0; i--) {
        var SM = C.smothers[i];
        if (time < SM.at) continue;
        C.smothers.splice(i, 1);
        if (SM.g) { try { SM.g.destroy(); } catch (e) {} }
        try { AUDIO.play('fluffbillow'); } catch (e) {}
        var fg = scene.add.graphics().setDepth(9);
        fg.fillStyle(0xffd0e8, 0.5); fg.slice(SM.x, SM.y, SM.range, SM.ang - SM.sector, SM.ang + SM.sector, false); fg.fillPath();
        scene.tweens.add({ targets: fg, alpha: 0, duration: 400, onComplete: (function (f) { return function () { try { f.destroy(); } catch (e) {} }; })(fg) });
        // leave a sticky slow patch centered in the sector
        var mx = SM.x + Math.cos(SM.ang) * SM.range * 0.5, my = SM.y + Math.sin(SM.ang) * SM.range * 0.5;
        var obj = scene.add.circle(mx, my, SM.range * 0.5, 0xffd0e8, 0.2).setDepth(1.2);
        C.patches.push({ x: mx, y: my, r: SM.range * 0.5, dieAt: time + SM.slowMs, obj: obj, slowMult: SM.slowMult, dmg: SM.dmg, tickMs: 800, nextTickAt: 0, src: 'the cotton smother', fromBoss: true });
        if (p.state.alive) {
          var pd = Math.hypot(p.x - SM.x, p.y - SM.y);
          var pa = Math.atan2(p.y - SM.y, p.x - SM.x);
          var diff = Math.atan2(Math.sin(pa - SM.ang), Math.cos(pa - SM.ang));
          if (pd < SM.range && Math.abs(diff) < SM.sector) Entities.hurtPlayer(scene, p, SM.dmg, time, 'the cotton smother', true);
        }
      }
    },
    _runHug: function (scene, time) {
      var C = scene._sg; if (!C.hug) return;
      var H = C.hug, p = scene.player, b = scene.boss;
      if (H.g) { H.g.setAlpha(Math.floor(time / 110) % 2 === 0 ? 0.4 : 0.2); }
      if (time < H.at) return;
      C.hug = null;
      if (H.g) { try { H.g.destroy(); } catch (e) {} }
      try { AUDIO.play('bearhug'); } catch (e) {}
      scene.cameras.main.shake(200, 0.01);
      var caught = p.state.alive && Math.hypot(p.x - H.x, p.y - H.y) < H.r;
      if (caught) {
        Entities.hurtPlayer(scene, p, H.dmg, time, "Sugar Bear's hug", true);
      } else if (b && b.active) {
        // DODGED → he stumbles face-first → VENTED ×1.5
        b.boss.ventedUntil = time + H.ventMs; b.boss.ventDmgMult = H.ventDmgMult;
        b.boss.rootUntil = time + H.ventMs; b.boss.busyUntil = time + H.ventMs;
        b.setTint(0xffd0e8);
        (function (b2) { scene.time.delayedCall(H.ventMs, function () { if (b2.active) b2.clearTint(); }); })(b);
        scene.banner('HE STUMBLES FACE-FIRST\nwide open — unload', '#ffd0e8');
        scene.burst(b.x, b.y, 22, 0xffd0e8);
      }
    },
    _runRain: function (scene, time) {
      var C = scene._sg; if (!C.rain) return;
      var Rn = C.rain, p = scene.player, b = scene.boss, allDone = true;
      for (var i = 0; i < Rn.circles.length; i++) {
        var SP = Rn.circles[i];
        if (SP.fired) continue;
        allDone = false;
        if (time < SP.at) continue;
        SP.fired = true;
        if (SP.g) { try { SP.g.destroy(); } catch (e) {} }
        scene.burst(SP.x, SP.y, 8, 0xffd0e8);
        try { AUDIO.play('candyrain'); } catch (e) {}
        if (p.state.alive && Math.hypot(p.x - SP.x, p.y - SP.y) < Rn.radius)
          Entities.hurtPlayer(scene, p, Rn.dmg, time, 'the candy rain', true);
      }
      // once the rain is done, the WALL-TO-WALL sprint fires (sequence, never stacked)
      if (allDone && !Rn.sprintDone) {
        if (!Rn.sprintG) {
          var A = C.arena;
          Rn.sprintAt = time + Rn.sprintWarnMs;
          Rn.sprintG = scene.add.graphics().setDepth(1.7);
          Rn.sprintG.fillStyle(0xffd0e8, 0.12); Rn.sprintG.lineStyle(3, 0xffd0e8, 0.8);
          Rn.sprintG.fillRect(A.x - A.rx * 1.6, A.y - 40, A.rx * 3.2, 80);
          Rn.sprintG.strokeRect(A.x - A.rx * 1.6, A.y - 40, A.rx * 3.2, 80);
        } else if (time >= Rn.sprintAt) {
          Rn.sprintDone = true;
          try { Rn.sprintG.destroy(); } catch (e) {}
          try { AUDIO.play('sprintroar'); } catch (e2) {}
          scene.cameras.main.shake(300, 0.012);
          var A2 = C.arena;
          // M7k AUDIT fix: the telegraph is a bounded rect — the hit test now
          // carries the matching x bound instead of an infinite band.
          if (p.state.alive && Math.abs(p.y - A2.y) < 40 && Math.abs(p.x - A2.x) < A2.rx * 1.6) Entities.hurtPlayer(scene, p, Rn.sprintDmg, time, 'the sugar sprint', true);
          // longest vent — panting
          if (b && b.active) {
            b.boss.ventedUntil = time + Rn.ventMs; b.boss.ventDmgMult = Rn.ventDmgMult;
            b.boss.rootUntil = time + Rn.ventMs; b.boss.busyUntil = time + Rn.ventMs;
            b.setTint(0xffd0e8);
            (function (b2) { scene.time.delayedCall(Rn.ventMs, function () { if (b2.active) b2.clearTint(); }); })(b);
            try { AUDIO.play('pantvent'); } catch (e3) {}
            scene.banner('HE PANTS, SUGAR-CRASHED\nall yours — unload', '#ffd0e8');
          }
          C.rain = null;
        }
      }
    },
    _clearBossFx: function (scene, C) {
      C.cones.forEach(function (o) { if (o.g) { try { o.g.destroy(); } catch (e) {} } });
      C.hooks.forEach(function (o) { if (o.g) { try { o.g.destroy(); } catch (e) {} } });
      C.smothers.forEach(function (o) { if (o.g) { try { o.g.destroy(); } catch (e) {} } });
      C.cones = []; C.hooks = []; C.smothers = [];
      if (C.hug) { if (C.hug.g) { try { C.hug.g.destroy(); } catch (e) {} } C.hug = null; }
      if (C.rain) { if (C.rain.sprintG) { try { C.rain.sprintG.destroy(); } catch (e) {} } C.rain.circles.forEach(function (s) { if (!s.fired && s.g) { try { s.g.destroy(); } catch (e) {} } }); C.rain = null; }
    },

    _wrap: function (scene, C) {
      var WW = C.WW, HH = C.HH;
      var wrap = function (o, isMob) {
        if (!o) return;
        var nx = o.x, ny = o.y, moved = false;
        if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
        if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
        if (!moved) return;
        if (o.body && o.body.enable && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.bossWave) return;
        if (m.mob.hopUntil && scene.time.now < m.mob.hopUntil) return;   // skip mid-hop
        wrap(m, true);
      });
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._sg; if (!C) return;
      function bump(list, keys) { list.forEach(function (o) { keys.forEach(function (k) { if (o[k] != null && o[k] !== Infinity) o[k] += dt; }); }); }
      // M7k AUDIT fix: the z._warn.until shift was removed — core's
      // dismissScouter shifts every scene._zoneWarns record already.
      bump(C.zones, ['at']);
      bump(C.lanes, ['at']); bump(C.dartLanes, ['at']); bump(C.cones, ['at']); bump(C.hooks, ['at']);
      bump(C.smothers, ['at']); bump(C.spirals, ['until', 'nextTickAt']);
      bump(C.patches, ['dieAt', 'nextTickAt']);
      bump(C.candies, ['dieAt']);
      C.fences.forEach(function (F) { if (F.regrowAt !== Infinity) F.regrowAt += dt; });
      if (C.hug) { C.hug.at += dt; }
      if (C.rain) { C.rain.circles.forEach(function (s) { if (!s.fired) s.at += dt; }); if (C.rain.sprintAt) C.rain.sprintAt += dt; }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        // M7k AUDIT fix: lungeUntil/nextLungeAt removed (core shifts both for
        // every mob — double shift); jawbreaker roll clocks added.
        ['lungeAt', 'slashAt', 'nextSlashAt', 'nextChargeAt', 'chargeLockUntil', 'chargeUntil',
         'nextSpinAt', 'spinLockUntil', 'nextHopAt', 'hopUntil', 'nextSpinCyc', 'spinUntil', 'exposedUntil', 'nextSlamAt', 'slamUntil',
         'shimmerAt', 'chompAt', 'resealAt', 'nextDartAt',
         'nextRollAt', 'rollLockUntil', 'rollUntil'].forEach(function (k) { if (m.mob[k]) m.mob[k] += dt; });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'busyUntil', 'rootUntil', 'ventedUntil', '_hookCdUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._sg; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.lanes = [];
      C.dartLanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.dartLanes = [];
      C.spirals.forEach(function (s) { if (s.g) { try { s.g.destroy(); } catch (e) {} } }); C.spirals = [];
      for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} } C.patches.splice(i, 1); }
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      SG._clearBossFx(scene, C);
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: Sugar Bear killed MID-VERB left live verb graphics painted
    // (cane-hook lane warns, candy-rain circles + sprint band, smother sectors,
    // hug circle, pending gumball/stomp zone rings, jaw-summon lanes).
    // Central onBossDown hook.
    bossCleanup: function (scene, boss) {
      var C = scene._sg; if (!C) return;
      C.bossArmed = false;
      SG._clearBossFx(scene, C);
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (!z.fromBoss) continue;
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        C.zones.splice(i, 1);
      }
      for (var j = C.lanes.length - 1; j >= 0; j--) {
        var l = C.lanes[j];
        if (!l.fromBoss) continue;
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        C.lanes.splice(j, 1);
      }
    },

    // ================================================== BOSS ARRIVAL =======
    // The den gummy floor trembles, the donut arch glows, sugar dust billows —
    // SUGAR BEAR rises at the den center, cane in paw, eyes glowing red.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._sg, self = scene;
      var ax = C.arena.x, ay = C.arena.y;
      scene.player.setPosition(ax, ay + C.arena.ry + 30);
      scene.cameras.main.centerOn(ax, ay);
      var glow = scene.add.circle(ax, ay, 70, 0xff9ac8, 0.18).setDepth(1.5);
      scene.tweens.add({ targets: glow, alpha: { from: 0.15, to: 0.5 }, duration: 400, yoyo: true, repeat: 4 });
      [500, 1000, 1500, 1900].forEach(function (at, i) {
        scene.time.delayedCall(at * (def.entranceMs / 3200), function () {
          if (self.closing) return;
          self.burst(ax, ay, 6 + i * 3, 0xffd0e8);
          try { AUDIO.play('fluffbillow'); } catch (e) {}
        });
      });
      scene.banner('THE DEN SHUDDERS\nsomething sweet and wrong wakes up', '#ff9ac8');
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, ax, ay);
        if (self.boss) {
          var b = self.boss;
          b.setAlpha(0).setScale(b.scaleX * 0.6, b.scaleY * 0.6);
          self.tweens.add({ targets: b, alpha: 1, scaleX: b.scaleX / 0.6, scaleY: b.scaleY / 0.6, duration: 520, ease: 'Quad.Out',
            onComplete: function () {
              if (!b.active) return;
              self.burst(b.x, b.y, 20, 0xffd0e8);
              self.cameras.main.shake(200, 0.008);
              try { AUDIO.play('bearhug'); } catch (e) {}
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

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._sg;
      if (!bs._sgInit) {
        bs._sgInit = true; bs.verbIdx = 0; bs.nextVerbAt = time + 2600;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.phase = 1;
        bs.armor = PT.gumballVolley.studs;
      }
      // PHASE TWO — THE SUGAR CRASH (eyes blaze, fluff dishevels)
      if (bs.phase === 1 && bs.hp <= bs.maxHp * PT.phase2At) {
        bs.phase = 2;
        b.setTexture('sugBearP2Hi');
        scene.banner('THE SUGAR CRASH\nhis eyes blaze — he comes apart', '#ff4a58');
        scene.burst(b.x, b.y, 24, 0xff4a58);
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true; bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('SUGAR RUSH\nevery move comes faster', '#ffd83a');
      }
      var rate = bs.rateMult || 1;
      // movement: rooted during signatures, else a slow candy-coated chase
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 130) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
        b.setFlipX(dx < 0);
      }
      if (time < bs.busyUntil) return;

      // M7k AUDIT fix: gate on the verb clock — without it a verb fired the
      // instant busyUntil lapsed (one every ~0.5s, some during the arrival
      // cinematic), ignoring verbEveryMs and the 2600ms opening grace.
      if (time < bs.nextVerbAt) return;
      bs.nextVerbAt = time + (PT.verbEveryMs || 5000) * rate;
      var k = bs.verbIdx++; var sig = (k % 3 === 2);
      if (bs.phase === 1) {
        if (sig) SG._bearHug(scene, b, player, time);
        else if (k % 3 === 0) SG._caneHook(scene, b, player, time);
        else SG._gumballVolley(scene, b, player, time);
        if (k % 5 === 4) SG._cottonSmother(scene, b, player, time);   // woven in occasionally
      } else {
        if (sig) SG._candyRain(scene, b, player, time);
        else if (k % 3 === 0) SG._caneSweep(scene, b, player, time);
        else SG._jawSummon(scene, b, player, time);
        if (k % 5 === 4) SG._sugarStomp(scene, b, player, time);
      }
    },

    // -------- PHASE 1 verbs --------
    _caneHook: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.caneHook, C = scene._sg;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = SG._laneWarn(scene, b.x, b.y, b.x + Math.cos(ang) * cfg.range, b.y + Math.sin(ang) * cfg.range, cfg.half, true);
      C.hooks.push({ x: b.x, y: b.y, ang: ang, range: cfg.range, half: cfg.half, dmg: cfg.dmg,
                     pull: cfg.pull, cooldownMs: cfg.cooldownMs, at: time + cfg.warnMs, g: g });
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('CANE HOOK\nthe crook glints — step off the line', '#ff9ac8');
    },
    _gumballVolley: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.gumballVolley, C = scene._sg;
      var cc = scene.realmDef.candy;
      for (var i = 0; i < cfg.count; i++) {
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter, a = SIM.rng() * Math.PI * 2;
        var dud = (i > 0 && SIM.rng() < (cc.bossDudChance || 0));   // a dud may leave a candy
        SG._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs, cfg.dmg,
          "Sugar Bear's gumball", true, false, time, dud ? { candyDud: true } : null);
      }
      // armor visibly depletes (studs vanish); refills when stripped bare
      b.boss.armor = Math.max(0, (b.boss.armor || cfg.studs) - 1);
      if (b.boss.armor === 0) b.boss.armor = cfg.studs;
      scene.burst(b.x, b.y - 20, 10, 0xffd83a);
      try { AUDIO.play('gumballlob'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    _cottonSmother: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.cottonSmother, C = scene._sg;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xffd0e8, 0.12); g.lineStyle(2, 0xffd0e8, 0.8);
      g.slice(b.x, b.y, cfg.range, ang - cfg.sector, ang + cfg.sector, false); g.fillPath(); g.strokePath();
      C.smothers.push({ x: b.x, y: b.y, ang: ang, sector: cfg.sector, range: cfg.range, at: time + cfg.warnMs,
                        slowMs: cfg.slowMs, slowMult: cfg.slowMult, dmg: cfg.dmg, g: g });
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('COTTON SMOTHER\nthe fluff blooms — don\'t fight in the cloud', '#ffd0e8');
    },
    _bearHug: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.bearHug, C = scene._sg;
      if (C.hug) return;
      var g = scene.add.circle(player.x, player.y, cfg.radius, 0xff4a58, 0.12).setStrokeStyle(3, 0xff4a58, 0.9).setDepth(2).setScale(0.4);
      scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
      C.hug = { x: player.x, y: player.y, r: cfg.radius, at: time + cfg.warnMs, g: g,
                dmg: cfg.dmg, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('BEAR HUG\nthe grab circle is death — leave EARLY', '#ff4a58');
    },

    // -------- PHASE 2 verbs --------
    _caneSweep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.caneSweep;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      SG._cone(scene, b.x, b.y, ang - 0.5, cfg.half, cfg.range, cfg.warnMs, cfg.dmg, "Sugar Bear's cane", true, time);
      SG._cone(scene, b.x, b.y, ang + 0.5, cfg.half, cfg.range, cfg.warnMs + cfg.gapMs, cfg.dmg, "Sugar Bear's cane", true, time);
      b.boss.busyUntil = time + cfg.warnMs + cfg.gapMs + 300; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('TWIN CANE SWEEPS\ntwo arcs — read the order', '#ff9ac8');
    },
    _jawSummon: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.jawSummon, C = scene._sg;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      for (var i = 0; i < cfg.count; i++) {
        var side = (i % 2 === 0) ? 0 : C.WW;
        var y = player.y + (SIM.rng() * 2 - 1) * 120;
        // warned roll lane across the arena
        SG._lane(scene, C.lanes, side, y, C.WW - side, y, 26, cfg.laneWarnMs, cfg.dmg, "a summoned jawbreaker", true, time);
        if (aliveM + i < cfg.cap) scene.queueSpawn({ key: 'jawbreaker', bossWave: true, x: side, y: y });
      }
      try { AUDIO.play('jawrumble'); } catch (e) {}
      scene.banner('JAWBREAKER SUMMON\nrollers follow the painted lanes', '#b06ae8');
      b.boss.busyUntil = time + 600;
    },
    _sugarStomp: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.sugarStomp;
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = 40 + SIM.rng() * 160;
        SG._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius,
          cfg.warnMs + i * cfg.gapMs, cfg.dmg, "Sugar Bear's stomp", true, false, time);
      }
      try { AUDIO.play('stompchain'); } catch (e) {}
      scene.banner('SUGAR RUSH STOMP\nchained landings — keep moving', '#ffd83a');
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 300; b.boss.rootUntil = b.boss.busyUntil;
    },
    _candyRain: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.candyRain, C = scene._sg;
      if (C.rain) return;
      var A = C.arena, circles = [];
      for (var i = 0; i < cfg.count; i++) {
        var fx = A.x + (SIM.rng() * 2 - 1) * A.rx * 1.4, fy = A.y + (SIM.rng() * 2 - 1) * A.ry * 1.4;
        var g = scene.add.circle(fx, fy, cfg.radius, 0xffd0e8, 0.13).setStrokeStyle(2, 0xffd0e8, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs + i * cfg.gapMs });
        circles.push({ x: fx, y: fy, at: time + cfg.warnMs + i * cfg.gapMs, fired: false, g: g });
      }
      C.rain = { circles: circles, radius: cfg.radius, dmg: cfg.dmg, sprintWarnMs: cfg.sprintWarnMs,
                 sprintDmg: cfg.sprintDmg, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult,
                 sprintG: null, sprintAt: 0, sprintDone: false };
      // long, generous busy — the whole rain + sprint sequence owns this window
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + cfg.sprintWarnMs + cfg.ventMs + 600;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('CANDY RAIN\ncandy hails, then he SPRINTS the arena', '#ff4a58');
    },

    // =============================================== MOB VERBS (map-new) ===
    // GUMMY BEAR — jelly-glint windup → chomp lunge (swarm chaser otherwise).
    _gummy: function (scene, m, player, time) {
      var cfg = m.mob.def.gummyPounce;                  // M7k AUDIT fix: renamed def key (core ghoul-lunge collision)
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); return true; }
        return true;                                   // keep the dash velocity
      }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xff9aa0 : 0xffffff);
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
          try { AUDIO.play('gummychomp'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      if (time >= m.mob.nextLungeAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextLungeAt = time + cfg.cooldownMs; m.mob.lungeAt = time + cfg.windupMs;
        return true;
      }
      return false;                                     // core chase (swarm)
    },
    // GINGERDEAD MAN — fast runner; cane-shiv slash cone; splits (top half) at death.
    _ginger: function (scene, m, player, time) {
      var cfg = m.mob.def.slash;
      if (m.mob.slashAt) {
        m.setVelocity(0, 0);
        if (time >= m.mob.slashAt) {
          m.mob.slashAt = 0;
          if (m.mob._slashG) { try { m.mob._slashG.destroy(); } catch (e) {} m.mob._slashG = null; }
          try { AUDIO.play('gingercrack'); } catch (e) {}
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y);
            var pa = Math.atan2(player.y - m.y, player.x - m.x);
            var diff = Math.atan2(Math.sin(pa - m.mob._slashAng), Math.cos(pa - m.mob._slashAng));
            if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) Entities.hurtPlayer(scene, player, cfg.dmg, time, "a cane shiv");
          }
        }
        return true;
      }
      if (!m.mob.nextSlashAt) m.mob.nextSlashAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextSlashAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextSlashAt = time + cfg.everyMs; m.mob.slashAt = time + cfg.warnMs;
        m.mob._slashAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xff9ac8, 0.14); g.lineStyle(2, 0xff9ac8, 0.85);
        g.slice(m.x, m.y, cfg.range, m.mob._slashAng - cfg.halfRad, m.mob._slashAng + cfg.halfRad, false); g.fillPath(); g.strokePath();
        m.mob._slashG = g;
        return true;
      }
      return false;                                     // core chase (fast runner)
    },
    // CANDY LANCER — couched cane-lance → warned charge lane → dash.
    _lancer: function (scene, m, player, time) {
      var cfg = m.mob.def.charge;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
        if (!m.mob._chargeHit && player.state.alive) {
          var pd = dist2seg(player.x, player.y, m.mob._cx, m.mob._cy, m.mob._cx + Math.cos(m.mob._chargeAng) * cfg.len, m.mob._cy + Math.sin(m.mob._chargeAng) * cfg.len);
          if (pd < cfg.half) { m.mob._chargeHit = true; Entities.hurtPlayer(scene, player, cfg.dmg, time, "a candy lance"); }
        }
        return true;
      }
      if (m.mob.chargeLockUntil) {
        if (time >= m.mob.chargeLockUntil) {
          m.mob.chargeLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs; m.mob._chargeHit = false; m.mob._cx = m.x; m.mob._cy = m.y;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
          try { AUDIO.play('laneclash'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextChargeAt) m.mob.nextChargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextChargeAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextChargeAt = time + cfg.everyMs; m.mob.chargeLockUntil = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._chargeG = SG._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // JAWBREAKER — warned roll lines; ARMOR LAYERS chip off (each its own hp).
    _jaw: function (scene, m, player, time) {
      var cfg = m.mob.def.roll, L = m.mob.def.layers;
      if (m.mob._layer == null) m.mob._layer = L.count;
      var expect = Math.max(0, Math.ceil(m.mob.hp / L.hp));
      if (expect < m.mob._layer) {                       // a layer just chipped away
        m.mob._layer = expect;
        scene.damageNumber(m.x, m.y - 24, 'CHIP', '#ffd0e8');
        scene.burst(m.x, m.y, 6, 0xffd0e8);
        try { AUDIO.play('jawchip'); } catch (e) {}
      }
      if (m.mob.rollUntil) {
        if (time >= m.mob.rollUntil) { m.mob.rollUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._rollAng) * cfg.speed, Math.sin(m.mob._rollAng) * cfg.speed);
        if (!m.mob._rollHit && player.state.alive) {
          var pd = dist2seg(player.x, player.y, m.mob._rx, m.mob._ry, m.mob._rx + Math.cos(m.mob._rollAng) * cfg.len, m.mob._ry + Math.sin(m.mob._rollAng) * cfg.len);
          if (pd < cfg.half) { m.mob._rollHit = true; Entities.hurtPlayer(scene, player, cfg.dmg, time, "a jawbreaker roll"); }
        }
        return true;
      }
      if (m.mob.rollLockUntil) {
        if (time >= m.mob.rollLockUntil) {
          m.mob.rollLockUntil = 0;
          if (m.mob._rollG) { try { m.mob._rollG.destroy(); } catch (e) {} m.mob._rollG = null; }
          m.mob.rollUntil = time + cfg.rollMs; m.mob._rollHit = false; m.mob._rx = m.x; m.mob._ry = m.y;
          m.setVelocity(Math.cos(m.mob._rollAng) * cfg.speed, Math.sin(m.mob._rollAng) * cfg.speed);
          try { AUDIO.play('jawroll'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextRollAt) m.mob.nextRollAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextRollAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextRollAt = time + cfg.everyMs; m.mob.rollLockUntil = time + cfg.warnMs;
        m.mob._rollAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._rollG = SG._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._rollAng) * cfg.len, m.y + Math.sin(m.mob._rollAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // LOLLI TWIRLER (armless) — spin-up telegraph → drifting spiral sweep.
    _twirler: function (scene, m, player, time) {
      var cfg = m.mob.def.spin, C = scene._sg;
      if (m.mob.spinLockUntil) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 90) % 2 === 0 ? 0xff9ac8 : 0xffffff);
        if (time >= m.mob.spinLockUntil) {
          m.mob.spinLockUntil = 0; m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          C.spirals.push({ x: m.x, y: m.y, vx: Math.cos(a) * cfg.driftSpeed, vy: Math.sin(a) * cfg.driftSpeed,
                           until: time + cfg.spiralMs, radius: cfg.radius, dmg: cfg.dmg, tickMs: cfg.tickMs,
                           nextTickAt: 0, src: 'a candy spiral', g: scene.add.graphics().setDepth(2) });
          try { AUDIO.play('twirlwhoosh'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextSpinAt) m.mob.nextSpinAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextSpinAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextSpinAt = time + cfg.everyMs; m.mob.spinLockUntil = time + cfg.warnMs;
        return true;
      }
      // idle drift toward the player (no contact damage — armless zoner)
      var a2 = Math.atan2(player.y - m.y, player.x - m.x);
      m.setVelocity(Math.cos(a2) * m.mob.def.spd, Math.sin(a2) * m.mob.def.spd);
      return true;
    },
    // GUMDROP — warned hop arcs → squish landing circle; splits into 2 at death.
    _gumdrop: function (scene, m, player, time) {
      var cfg = m.mob.def.hop;
      if (m.mob.hopUntil) {
        if (time >= m.mob.hopUntil) {
          m.mob.hopUntil = 0; m.setVelocity(0, 0);
          SG._zone(scene, m.x, m.y, cfg.landRadius, cfg.warnMs, cfg.dmg, "a gumdrop's landing", false, false, time);
          try { AUDIO.play('gumboing'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.hopEveryMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextHopAt && player.state.alive) {
        m.mob.nextHopAt = time + cfg.hopEveryMs; m.mob.hopUntil = time + cfg.hopMs;
        var a = Math.atan2(player.y - m.y, player.x - m.x);
        m.setVelocity(Math.cos(a) * cfg.hopSpeed, Math.sin(a) * cfg.hopSpeed);
        return true;
      }
      m.setVelocity(0, 0);
      return true;                                       // it only ever hops
    },
    // COTTON DRIFT — slow drift chaser; sticky slow aura applied in update().
    _cotton: function (scene, m, player, time) {
      return false;                                      // core drift-chase; the aura slow is scanned in update()
    },
    // MINT GUARDIAN — frontal block; shield-spin = brief 360 block → exposed.
    _mint: function (scene, m, player, time) {
      var cfg = m.mob.def.guard;
      var facing = Math.atan2(player.y - m.y, player.x - m.x);
      var spinning = m.mob.spinUntil && time < m.mob.spinUntil;
      var exposed = m.mob.exposedUntil && time < m.mob.exposedUntil && !spinning;
      // shield-spin cycle
      if (!m.mob.nextSpinCyc) m.mob.nextSpinCyc = time + cfg.everyMs * (0.5 + SIM.rng() * 0.5);
      if (time >= m.mob.nextSpinCyc && !spinning && !exposed) {
        m.mob.nextSpinCyc = time + cfg.everyMs;
        m.mob.spinUntil = time + cfg.spinMs;
        m.mob.exposedUntil = time + cfg.spinMs + cfg.exposedMs;
        try { AUDIO.play('mintting'); } catch (e) {}
        spinning = true;
      }
      m.setTint(exposed ? 0xffd0e8 : (spinning ? 0xff9ac8 : 0xffffff));
      // block incoming player shots from the front (or all, while spinning)
      if (!exposed) {
        var shots = scene.playerShots;
        if (shots) shots.children.iterate(function (s) {
          if (!s || !s.active) return;
          if (Math.hypot(s.x - m.x, s.y - m.y) > cfg.blockRange) return;
          var sa = Math.atan2(s.y - m.y, s.x - m.x);
          var diff = Math.atan2(Math.sin(sa - facing), Math.cos(sa - facing));
          if (spinning || Math.abs(diff) < cfg.blockArc) {
            Entities.killProjectile(shots, s);
            scene.damageNumber(m.x, m.y - 24, 'BLOCK', '#c8fff0');
          }
        });
      }
      // approach slowly (a walking wall)
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d > 90) m.setVelocity(Math.cos(facing) * m.mob.def.spd, Math.sin(facing) * m.mob.def.spd); else m.setVelocity(0, 0);
      return true;
    },
    // MALLOW BRUTE — warned squish-slam circle; splits into 3 minis at death.
    _mallow: function (scene, m, player, time) {
      var cfg = m.mob.def.slam;
      if (m.mob.slamUntil) {
        m.setVelocity(0, 0);
        if (time >= m.mob.slamUntil) m.mob.slamUntil = 0;
        return true;
      }
      if (!m.mob.nextSlamAt) m.mob.nextSlamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextSlamAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextSlamAt = time + cfg.everyMs; m.mob.slamUntil = time + cfg.warnMs;
        SG._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Mallow Brute's slam", false, false, time);
        try { AUDIO.play('mallowslam'); } catch (e) {}
        return true;
      }
      return false;                                      // core chase (elite)
    },
    // CUPCAKE MIMIC — SEALED ambusher; shimmer near → maw opens → chomp → reseal.
    _mimic: function (scene, m, player, time) {
      var cfg = m.mob.def.mimic;
      m.setVelocity(0, 0);
      if (!m.mob._mphase) m.mob._mphase = 'seal';
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (m.mob._mphase === 'seal') {
        if (d < cfg.triggerRange && player.state.alive) { m.mob._mphase = 'shimmer'; m.mob.shimmerAt = time + cfg.shimmerMs; }
      } else if (m.mob._mphase === 'shimmer') {
        m.setTint(Math.floor(time / 90) % 2 === 0 ? 0xff9ac8 : 0xffffff);
        if (time >= m.mob.shimmerAt) { m.mob._mphase = 'open'; m.clearTint(); m.setTexture('sugMimicOpenHi'); m.mob.chompAt = time + cfg.chompWarnMs; }
      } else if (m.mob._mphase === 'open') {
        if (time >= m.mob.chompAt) {
          m.mob._mphase = 'reseal'; m.mob.resealAt = time + cfg.resealMs;
          try { AUDIO.play('mimicsnap'); } catch (e) {}
          scene.burst(m.x, m.y, 10, 0xff4a58);
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.chompRadius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Cupcake Mimic's maw");
        }
      } else {                                            // reseal
        if (time >= m.mob.resealAt) { m.mob._mphase = 'seal'; m.setTexture('sugMimicHi'); }
      }
      return true;
    },
    // CANDY CORN PACK — warned dart lanes fired in a quick sequence.
    _corn: function (scene, m, player, time) {
      var cfg = m.mob.def.dart, C = scene._sg;
      if (!m.mob.nextDartAt) m.mob.nextDartAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextDartAt && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range && player.state.alive) {
        m.mob.nextDartAt = time + cfg.everyMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x);
        for (var i = 0; i < cfg.count; i++) {
          var a = base + (i - (cfg.count - 1) / 2) * 0.32;
          C.dartLanes.push({ x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len,
                             half: cfg.half, at: time + cfg.warnMs + i * cfg.gapMs, dmg: cfg.dmg,
                             src: 'a candy-corn dart', fromBoss: false, g: SG._laneWarn(scene, m.x, m.y, m.x + Math.cos(a) * cfg.len, m.y + Math.sin(a) * cfg.len, cfg.half) });
        }
        try { AUDIO.play('corndart'); } catch (e) {}
      }
      // dart formation hover toward the player
      var a2 = Math.atan2(player.y - m.y, player.x - m.x);
      m.setVelocity(Math.cos(a2) * m.mob.def.spd * 0.7, Math.sin(a2) * m.mob.def.spd * 0.7);
      return true;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SG;
  root.SUGAR_SCENE = SG;
})(typeof window !== 'undefined' ? window : this);
