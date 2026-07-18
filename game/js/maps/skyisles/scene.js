// ============================================================================
// game/js/maps/skyisles/scene.js — STORM SKY ISLES scene hooks (M7 registry).
// The scene-plan PNG (assets/sky_scene_plan.png) is the canonical layout —
// 7 named islands + 8 floating shards in a MIST VEIL sea, all connected by
// rope bridges, a lantern-lit cobble path spawn → Crosswinds → both flanks.
// THE TEMPEST CYCLE v2 (wind shift · roaming strikes · updraft vents · the
// storm eye) conducts the ambient danger; NIMBUS TALON owns the Roost.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- the planned layout (fractions of the world, plan PNG canon) --
  var ISLES = [
    { id: 'spawn',     x: 0.5,  y: 0.86, rx: 100 / 900, ry: 62 / 900, tex: 'skyturf' },
    { id: 'crosswinds',x: 0.5,  y: 0.55, rx: 88 / 900,  ry: 66 / 900, tex: 'skyturf' },
    { id: 'windmill',  x: 0.16, y: 0.56, rx: 108 / 900, ry: 84 / 900, tex: 'skyturf' },
    { id: 'temple',    x: 0.84, y: 0.56, rx: 108 / 900, ry: 84 / 900, tex: 'skymarble' },
    { id: 'crash',     x: 0.2,  y: 0.24, rx: 84 / 900,  ry: 62 / 900, tex: 'skystone' },
    { id: 'balloon',   x: 0.8,  y: 0.24, rx: 80 / 900,  ry: 60 / 900, tex: 'skyturf' },
    { id: 'roost',     x: 0.5,  y: 0.15, rx: 104 / 900, ry: 74 / 900, tex: 'stormglass', arena: true }
  ];
  var SHARDS = [[0.33, 0.72], [0.67, 0.73], [0.31, 0.4], [0.69, 0.4],
                [0.08, 0.82], [0.92, 0.8], [0.06, 0.1], [0.94, 0.12]];
  var BRIDGES = [
    [0.5, 0.79, 0.5, 0.625], [0.41, 0.55, 0.28, 0.56], [0.59, 0.55, 0.72, 0.56],
    [0.17, 0.46, 0.19, 0.32], [0.83, 0.46, 0.81, 0.32],
    [0.27, 0.21, 0.4, 0.17], [0.73, 0.21, 0.6, 0.17]
  ];
  var PATHS = [
    [[0.5, 0.9], [0.5, 0.8]],
    [[0.5, 0.62], [0.5, 0.5], [0.44, 0.55]],
    [[0.5, 0.5], [0.56, 0.55]],
    [[0.16, 0.6], [0.14, 0.5], [0.17, 0.47]],
    [[0.84, 0.6], [0.86, 0.5], [0.83, 0.47]]
  ];
  // decor: [texKey, fx, fy, scale] — transcribed from the plan renderer.
  var DECOR = [
    // SPAWN ISLE — arrive at the sky dock; bell + crates; columns flank the path mouth
    ['skDock', 0.5, 0.945, 1.7], ['skBell', 0.545, 0.875, 1.4], ['skSupply', 0.455, 0.885, 1.2],
    ['skColumn', 0.465, 0.795, 1.1], ['skColumn', 0.535, 0.795, 1.1],
    // THE CROSSWINDS — wind god landmark ringed by crystals + chimes
    ['skGod', 0.5, 0.54, 1.9], ['skCrystal', 0.472, 0.575, 1.2], ['skCrystal', 0.528, 0.575, 1.2],
    ['skCrystal', 0.5, 0.6, 1.15], ['skChimes', 0.46, 0.52, 1.2],
    // WINDMILL FARM — the mill (animated sails ride on top) + banners + chimes
    ['skWindmill', 0.15, 0.53, 2.4], ['skBanner', 0.1, 0.6, 1.3], ['skBanner', 0.22, 0.62, 1.3],
    ['skChimes', 0.2, 0.49, 1.2],
    // TEMPLE RUINS — arch gate at the bridge mouth, colonnade, shrine + crystal
    ['skArch', 0.745, 0.56, 1.8],
    ['skColumn', 0.79, 0.5, 1.2], ['skColumn', 0.83, 0.48, 1.2], ['skColumn', 0.87, 0.5, 1.2],
    ['skColumn', 0.8, 0.63, 1.2], ['skColumn', 0.84, 0.65, 1.2], ['skColumn', 0.88, 0.62, 1.2],
    ['skShrine', 0.85, 0.56, 1.5], ['skCrystal', 0.9, 0.57, 1.2],
    // THE CRASH SITE — airship wreck set piece + spilled supplies + banner
    ['skWreck', 0.19, 0.23, 2.6], ['skSupply', 0.13, 0.28, 1.2], ['skSupply', 0.25, 0.29, 1.2],
    ['skBanner', 0.24, 0.17, 1.3],
    // BALLOON DOCK — anchored balloon bobbing over a dock + crates + its bell
    ['skBalloon', 0.8, 0.21, 2.2], ['skDock', 0.865, 0.26, 1.6], ['skSupply', 0.76, 0.28, 1.2],
    ['skBell', 0.84, 0.17, 1.4],
    // THE ROOST — giant roc nest center + storm crystals on the rim
    ['skNest', 0.5, 0.145, 2.6], ['skCrystal', 0.45, 0.06, 1.3], ['skCrystal', 0.55, 0.06, 1.3],
    // storm lanterns along the whole path (grove/graveyard trail precedent)
    ['skLantern', 0.5, 0.755, 1.2], ['skLantern', 0.5, 0.655, 1.2], ['skLantern', 0.47, 0.5, 1.2],
    ['skLantern', 0.53, 0.5, 1.2], ['skLantern', 0.36, 0.555, 1.2], ['skLantern', 0.64, 0.555, 1.2],
    ['skLantern', 0.145, 0.47, 1.2], ['skLantern', 0.855, 0.47, 1.2],
    ['skLantern', 0.33, 0.185, 1.2], ['skLantern', 0.67, 0.185, 1.2],
    // floating-shard decor sits ON the shard islets
    ['skShard', 0.33, 0.72, 1.4], ['skShard', 0.67, 0.73, 1.4], ['skShard', 0.06, 0.1, 1.4],
    ['skShard', 0.94, 0.12, 1.4]
  ];
  // lightning rods — the Roost's arena furniture (strikes cluster here; the
  // boss's ROD OVERLOAD signature funnels the storm into them)
  var RODS = [[0.42, 0.095], [0.58, 0.095], [0.42, 0.2], [0.58, 0.2]];
  var NEST = [0.5, 0.145];
  var CLOUD_BANKS = [[0.35, 0.63], [0.65, 0.63], [0.5, 0.33], [0.12, 0.38], [0.88, 0.38]];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var SKY = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var self = scene;
      // ---- full state reset (scene reuse — bug #1 family) ----
      var S = scene._sky = {
        isles: [], shards: [], bridges: [], banks: [], chimes: [], sails: [],
        rods: [], nest: { x: NEST[0] * WW, y: NEST[1] * HH },
        zones: [],               // pending telegraphed blasts {x,y,r,at,dmg,src,fromBoss,killMobs,ring}
        toss: null,              // active positional shove {vx,vy,until}
        gale: null,              // active field push {vx,vy,until,fx}
        tempest: null,           // ambient conductor state (built below)
        dark: null, darkArmed: false, shadow: null, mistTile: null,
        slowMult: (scene.realmDef.mist && scene.realmDef.mist.slowMult) || 0.55
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- the MIST VEIL sea (drifts slowly — updated per frame) ----
      S.mistTile = scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'mistveil').setDepth(-23);
      S.mistTile.setTileScale(1.6, 1.6);                  // soften the 48px banding

      // ---- islands: rocky rim + masked tile fill ----
      ISLES.concat(SHARDS.map(function (sh) { return { x: sh[0], y: sh[1], rx: 16 / 900, ry: 11 / 900, tex: 'skyturf', shard: true }; }))
        .forEach(function (I) {
          var cx = I.x * WW, cy = I.y * HH, rx = I.rx * WW, ry = I.ry * HH;
          var rim = scene.add.graphics().setDepth(-21);
          rim.fillStyle(0x3a3126, 1); rim.fillEllipse(cx, cy + 3, rx * 2 + 14, ry * 2 + 14);
          var fill = scene.add.tileSprite(cx, cy, rx * 2 + 6, ry * 2 + 6, I.tex).setDepth(-20);
          var mg = scene.make.graphics({ add: false });
          mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2 + 4, ry * 2 + 4);
          fill.setMask(mg.createGeometryMask());
          var rec = { x: cx, y: cy, rx: rx, ry: ry, arena: !!I.arena, id: I.id || 'shard' };
          (I.shard ? S.shards : S.isles).push(rec);
        });

      // ---- rope bridges (walkable, full speed) ----
      BRIDGES.forEach(function (B) {
        var x0 = B[0] * WW, y0 = B[1] * HH, x1 = B[2] * WW, y1 = B[3] * HH;
        var ang = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
        var n = Math.max(1, Math.round(len / 56));
        for (var i = 0; i <= n; i++) {
          var t = i / n;
          scene.add.sprite(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 'skBridge')
            .setRotation(ang).setScale(1.1).setDepth(-18);
        }
        S.bridges.push({ x0: x0, y0: y0, x1: x1, y1: y1, half: 36 });
      });

      // ---- lantern-lit cobble paths (cosmetic — they ride on the islands) ----
      PATHS.forEach(function (P) {
        for (var s = 0; s < P.length - 1; s++) {
          var x0 = P[s][0] * WW, y0 = P[s][1] * HH, x1 = P[s + 1][0] * WW, y1 = P[s + 1][1] * HH;
          var ang = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0);
          var n = Math.max(1, Math.round(len / 40));
          for (var i = 0; i <= n; i++) {
            var t = i / n;
            scene.add.tileSprite(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 44, 30, 'skycobble')
              .setRotation(ang).setDepth(-19);
          }
        }
      });

      // ---- decor per the PLAN (composed, never scattered) ----
      DECOR.forEach(function (D) {
        var spr = scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
        if (D[0] === 'skChimes') S.chimes.push(spr);
        if (D[0] === 'skWindmill') {
          // animated sails spin over the tower cap (the map must feel alive)
          var sails = scene.add.sprite(D[1] * WW, D[2] * HH - 12 * D[3], 'skSails').setScale(D[3] * 0.9).setDepth(3);
          scene.tweens.add({ targets: sails, angle: 360, duration: 6000, repeat: -1 });
          S.sails.push(sails);
        }
        if (D[0] === 'skBalloon') {
          scene.tweens.add({ targets: spr, y: spr.y - 10, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        }
      });

      // ---- the 4 lightning rods (arena furniture + strike magnets) ----
      RODS.forEach(function (Rd) {
        var spr = scene.add.sprite(Rd[0] * WW, Rd[1] * HH, 'skRod').setScale(1.6).setDepth(2);
        S.rods.push({ x: spr.x, y: spr.y, spr: spr });
      });

      // ---- drifting CLOUD BANKS (soft cover — conceals whoever stands inside) ----
      CLOUD_BANKS.forEach(function (C, i) {
        var spr = scene.add.sprite(C[0] * WW, C[1] * HH, 'skCloudBank').setScale(2.4).setAlpha(0.92).setDepth(12);
        var a = i * 1.7;
        S.banks.push({ spr: spr, r: 90, vx: Math.cos(a) * 9, vy: Math.sin(a) * 6 });
      });

      // ---- THE TEMPEST CYCLE v2 conductor state (all clocks absolute) ----
      var cfg = scene.realmDef.tempest;
      var now = scene.time.now;
      S.tempest = {
        cfg: cfg,
        windAt: now + 9000, windDir: 0, windWarnUntil: 0, wind: null,
        strikeAt: now + 6000, strikes: [],
        ventAt: now + 9500, vents: [],
        eye: { x: WW * 0.5, y: HH * 0.5, tx: WW * 0.3, ty: HH * 0.4,
               retargetAt: now + cfg.eye.retargetMs, g: null, swirl: null }
      };
      // the storm-eye SHADOW — drawn under entities, drifts positionally
      var eg = scene.add.graphics().setDepth(3);
      eg.fillStyle(0x141620, 0.30); eg.fillEllipse(0, 0, cfg.eye.radius * 2, cfg.eye.radius * 1.5);
      eg.lineStyle(3, 0x2e3152, 0.5);
      for (var sa = 0; sa < 3; sa++) eg.strokeEllipse(0, 0, cfg.eye.radius * (1.4 - sa * 0.35), cfg.eye.radius * (1.05 - sa * 0.26));
      eg.setPosition(S.tempest.eye.x, S.tempest.eye.y);
      S.tempest.eye.g = eg;
      scene.tweens.add({ targets: eg, angle: 360, duration: 14000, repeat: -1 });

      // ---- spawn at the SKY DOCK on the south isle ----
      scene._realmStart = { x: 0.5 * WW, y: 0.88 * HH };

      // ---- attach the mob-verb helpers (fresh closures every setup) ----
      scene._skyRayMark = function (m, player, time) { return SKY._rayMark(scene, m, player, time); };
      scene._skyGolemShove = function (m, player, time) { return SKY._golemShove(scene, m, player, time); };
      scene._skyBellyFlop = function (m, player, time) { return SKY._bellyFlop(scene, m, player, time); };
    },

    // ==================================================== AFTER CREATE =====
    // NOTE: core wireEvents() runs AFTER this hook and calls events.off() on
    // the whole boss/player event family — a listener registered here would
    // be silently stripped. Anything death-reactive is frame-driven instead
    // (see the dark-overlay cleanup at the top of update()).
    afterCreate: function (scene) {},

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var S = scene._sky; if (!S) return;
      var dt = Math.min(120, delta), WW = scene.worldW, HH = scene.worldH;

      // the fight darkness lifts the moment the boss is gone (frame-driven —
      // wireEvents strips map listeners, so never rely on 'boss-died' here)
      if (S.dark && S.darkArmed && (!scene.boss || !scene.boss.active)) SKY._clearDark(scene);

      // toroidal wrap (player + swarm; boss + bossWave mobs never wrap)
      SKY._wrap(scene);

      // the mist drifts (cosmetic)
      if (S.mistTile) { S.mistTile.tilePositionX += 8 * dt / 1000; S.mistTile.tilePositionY += 2.5 * dt / 1000; }

      // ---- MIST SLOW — a speed MULT in the mover, never a body drag.
      // Floaters (Cloud Ray & friends) cross the veil at full speed.
      if (scene.player.state.alive && !SKY._onLand(scene, scene.player.x, scene.player.y)) {
        scene.player.body.velocity.x *= S.slowMult;
        scene.player.body.velocity.y *= S.slowMult;
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.float) return;
        if (!SKY._onLand(scene, m.x, m.y)) { m.body.velocity.x *= S.slowMult; m.body.velocity.y *= S.slowMult; }
      });

      // ---- CLOUD BANKS: drift + concealment (reset flags BEFORE marking —
      // the smog-serpent lesson; the banks are the ONLY concealment here) ----
      var pInBank = false;
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob) m.mob.concealed = false; });
      S.banks.forEach(function (B) {
        B.spr.x += B.vx * dt / 1000; B.spr.y += B.vy * dt / 1000;
        if (B.spr.x < -80) B.spr.x += WW + 160; if (B.spr.x > WW + 80) B.spr.x -= WW + 160;
        if (B.spr.y < -80) B.spr.y += HH + 160; if (B.spr.y > HH + 80) B.spr.y -= HH + 160;
        if (scene.player.state.alive && Math.hypot(scene.player.x - B.spr.x, scene.player.y - B.spr.y) < B.r) pInBank = true;
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && Math.hypot(m.x - B.spr.x, m.y - B.spr.y) < B.r) m.mob.concealed = true;
        });
      });
      scene.playerInFog = pInBank;

      // ---- active pushes (positional — hitstop/pause-safe by construction:
      // update() doesn't run while paused, and we gate on hitstop) ----
      if (!scene.hitstopActive) {
        if (S.toss && time < S.toss.until && scene.player.state.alive) {
          scene.player.x += S.toss.vx * dt / 1000; scene.player.y += S.toss.vy * dt / 1000;
        } else if (S.toss && time >= S.toss.until) S.toss = null;
        if (S.gale && time < S.gale.until) {
          if (scene.player.state.alive) { scene.player.x += S.gale.vx * dt / 1000; scene.player.y += S.gale.vy * dt / 1000; }
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && m.mob && !m.mob.bossWave) { m.x += S.gale.vx * dt / 1000; m.y += S.gale.vy * dt / 1000; }
          });
        } else if (S.gale && time >= S.gale.until) { if (S.gale.fx) { try { S.gale.fx.destroy(); } catch (e) {} } S.gale = null; }
      }

      // ---- THE TEMPEST CYCLE (ambient — stands down around the boss flow) ----
      SKY._tempest(scene, time, dt);

      // ---- pending telegraphed zones (strikes, flops, boss circles…) ----
      SKY._runZones(scene, time);
    },

    // ======================================================== UNFREEZE =====
    // EVERY absolute clock this map owns shifts by the paused duration.
    unfreeze: function (scene, dt) {
      var S = scene._sky; if (!S) return;
      var T = S.tempest;
      if (T) {
        ['windAt', 'windWarnUntil', 'strikeAt', 'ventAt'].forEach(function (k) {
          if (T[k] && T[k] !== Infinity) T[k] += dt;
        });
        if (T.wind && T.wind.until) T.wind.until += dt;
        if (T.pendingWind && T.pendingWind.at) T.pendingWind.at += dt;  // M7k AUDIT fix: pending gale clock shifts too
        if (T.eye && T.eye.retargetAt !== Infinity) T.eye.retargetAt += dt;
      }
      S.zones.forEach(function (z) { z.at += dt; });
      if (S.toss) S.toss.until += dt;
      if (S.gale) S.gale.until += dt;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        if (m.mob.nextMarkAt) m.mob.nextMarkAt += dt;          // cloud-ray mark cadence
        if (m.mob.nextShoveAt) m.mob.nextShoveAt += dt;        // golem shove cooldown
        if (m.mob.nextFlopAt) m.mob.nextFlopAt += dt;          // hatchling flop cooldown
        if (m.mob.flop && m.mob.flop.until) m.mob.flop.until += dt;  // mid-hop clock
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextSkyfallAt', 'nextGaleAt', 'nextSlamAt', 'nextDiveAt', 'nextRodAt', 'nextAddsAt',
         'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
        if (bs.dive && bs.dive.at) bs.dive.at += dt;
        if (bs.rod && bs.rod.nextAt) bs.rod.nextAt += dt;
      }
    },

    // ====================================================== ANNIHILATE =====
    // E2 wipe: the map's hazard pools die with the swarm.
    annihilate: function (scene) {
      var S = scene._sky; if (!S) return;
      S.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record too — a bulk-cleared
        // zone must not leave a stale entry in scene._zoneWarns
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      S.zones = [];
      var T = S.tempest;
      if (T) {
        if (T.wind && T.wind.fxTimer) T.wind = null; else T.wind = null;
        T.windWarnUntil = 0;
      }
      if (S.gale) { if (S.gale.fx) { try { S.gale.fx.destroy(); } catch (e) {} } S.gale = null; }
      S.toss = null;
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: NIMBUS TALON killed MID-VERB left telegraph graphics
    // painted forever (rod fuse rings, the dive lane, the fight darkness).
    // Called centrally from onBossDown via the registry hook.
    bossCleanup: function (scene, boss) {
      var S = scene._sky; if (!S) return;
      S.rods.forEach(function (rd) {
        if (rd._ring) { try { rd._ring.destroy(); } catch (e) {} rd._ring = null; }
      });
      var bs = boss && boss.boss;
      if (bs && bs.dive && bs.dive.g) { try { bs.dive.g.destroy(); } catch (e) {} bs.dive = null; }
      if (S.dark) SKY._clearDark(scene);
    },

    // ================================================== BOSS ARRIVAL =======
    // GROWING SHADOW (Red's pick): a cloud shadow slides under you and GROWS
    // while the arena darkens; rumble; then NIMBUS TALON erupts downward out
    // of the black sky into the nest — wing-blast shockwave, title card.
    bossArrival: function (scene, def, bx, by) {
      var S = scene._sky, self = scene;
      var nest = S.nest;
      // deliver the player to the Roost, south of the nest
      var roost = null;
      S.isles.forEach(function (I) { if (I.arena) roost = I; });
      scene.player.setPosition(nest.x, nest.y + (roost ? roost.ry * 0.7 : 160));
      scene.cameras.main.centerOn(nest.x, nest.y);
      // the storm eye parks over the Roost — the storm belongs to HIM now
      if (S.tempest) { S.tempest.eye.tx = nest.x; S.tempest.eye.ty = nest.y; }
      // arena darkens
      var W = scene.scale.width, H = scene.scale.height;
      S.dark = scene.add.rectangle(W / 2, H / 2, W, H, 0x0a0a16, 0).setScrollFactor(0).setDepth(40);
      scene.tweens.add({ targets: S.dark, fillAlpha: 0.35, duration: def.shadowMs * 0.7 });
      // the growing shadow slides player → nest
      var sh = scene.add.ellipse(scene.player.x, scene.player.y + 20, 60, 36, 0x141620, 0.5).setDepth(3);
      S.shadow = sh;
      scene.tweens.add({ targets: sh, x: nest.x, y: nest.y, width: 340, height: 200, duration: def.shadowMs, ease: 'Sine.In' });
      scene.cameras.main.shake(def.shadowMs, 0.004);
      scene.banner('THE SKY GOES BLACK\nsomething enormous is descending', '#ffe95a');
      try { AUDIO.play('rodhum'); } catch (e) {}
      scene.time.delayedCall(def.shadowMs, function () {
        if (S.shadow) { try { S.shadow.destroy(); } catch (e) {} S.shadow = null; }
        if (self.closing || !self.player.state.alive) { SKY._clearDark(self); return; }
        self.cameras.main.flash(220, 255, 233, 90);
        self.cameras.main.shake(300, 0.012);
        try { AUDIO.play('strikecrack'); } catch (e) {}
        self.spawnBossNow(def, nest.x, nest.y);
        S.darkArmed = true;                     // from here the dark lives and dies with HIM
        // wing-blast shockwave (cosmetic)
        var ring = self.add.circle(nest.x, nest.y, 40, 0xffe95a, 0.18).setStrokeStyle(3, 0xfffbc8, 0.9).setDepth(8);
        self.tweens.add({ targets: ring, scale: 8, alpha: 0, duration: 650, onComplete: function () { try { ring.destroy(); } catch (e) {} } });
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    // The six-verb telegraphed kit (boss contract: ground paint, zero
    // projectile filler). Dispatched every frame from Entities.updateBoss —
    // the generic chase already ran; verbs override velocity when they own it.
    bossUpdate: function (scene, b, player, time) {
      var S = scene._sky, bs = b.boss, P = bs.def.patterns;
      if (!bs._skyInit) {
        bs._skyInit = true;
        bs.nextSkyfallAt = time + 3500;
        bs.nextGaleAt = time + 7000;
        bs.nextSlamAt = time + 12000;
        bs.nextDiveAt = time + 9000;
        bs.nextRodAt = time + P.rodOverload.firstDelayMs;
        bs.nextAddsAt = time + P.adds.everyMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      // overclock enrage at low HP (once)
      if (!bs._overclocked && bs.hp <= bs.maxHp * P.overclock.hpPct) {
        bs._overclocked = true;
        bs.spdMult = P.overclock.spdMult; bs.rateMult = P.overclock.rateMult;
        scene.banner('THE STORM RAGES\nNimbus Talon overclocks the sky', '#ffe95a');
      }
      var rate = bs.rateMult || 1;
      // rooted states (rod charge/vent) or mid-dive: hold position
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      if (bs.dive) { SKY._diveStep(scene, b, player, time); return; }
      if (bs.rod) { SKY._rodStep(scene, b, player, time); return; }
      if (time < bs.busyUntil) return;

      // ---- verb scheduler (one heavy verb at a time) ----
      if (time >= bs.nextRodAt) {                                    // signature first
        bs.nextRodAt = time + P.rodOverload.everyMs * rate;
        SKY._rodBegin(scene, b, time);
      } else if (time >= bs.nextDiveAt) {
        bs.nextDiveAt = time + P.diveLane.everyMs * rate;
        SKY._diveBegin(scene, b, player, time);
      } else if (time >= bs.nextSlamAt) {
        bs.nextSlamAt = time + P.islandSlam.everyMs * rate;
        bs.busyUntil = time + P.islandSlam.warnMs + P.islandSlam.gapMs + 400;
        SKY._islandSlam(scene, b, player, time);
      } else if (time >= bs.nextGaleAt) {
        bs.nextGaleAt = time + P.gale.everyMs * rate;
        bs.busyUntil = time + P.gale.warnMs + 200;
        SKY._galeShove(scene, b, player, time);
      } else if (time >= bs.nextSkyfallAt) {
        bs.nextSkyfallAt = time + P.skyfall.everyMs * rate;
        SKY._skyfall(scene, b, player, time);
      }
      if (time >= bs.nextAddsAt) {                                   // adds ride alongside
        bs.nextAddsAt = time + P.adds.everyMs * rate;
        SKY._stormAdds(scene, b, time);
      }
    },

    // ------------------------------------------------ boss verb bodies -----
    _skyfall: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.skyfall, spots = [];
      for (var i = 0; i < cfg.lobs; i++) {
        var a = Math.PI * 2 * i / cfg.lobs + SIM.rng();
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;            // one lands ON you
        spots.push({ x: player.x + Math.cos(a) * rr, y: player.y + Math.sin(a) * rr });
      }
      spots.forEach(function (sp) {
        SKY._zone(scene, sp.x, sp.y, cfg.radius, cfg.warnMs, cfg.dmg, "Nimbus Talon's skyfall", true, true, time);
      });
      try { AUDIO.play('rodhum'); } catch (e) {}
    },

    _galeShove: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.gale, S = scene._sky;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);          // he exhales THROUGH you
      // the wedge glows: full-screen wind streak overlay pointing the push
      var W = scene.scale.width, H = scene.scale.height;
      var g = scene.add.graphics().setScrollFactor(0).setDepth(41);
      g.setPosition(W / 2, H / 2);
      g.lineStyle(3, 0xbfeee6, 0.55);
      for (var i = 0; i < 9; i++) {
        var oy = (i - 4) * H * 0.09;
        g.lineBetween(-W * 0.38, oy, W * 0.38, oy);
        // arrowheads show the push direction
        g.lineBetween(W * 0.38, oy, W * 0.3, oy - H * 0.03);
        g.lineBetween(W * 0.38, oy, W * 0.3, oy + H * 0.03);
      }
      g.setRotation(ang);
      scene.tweens.add({ targets: g, alpha: { from: 0.2, to: 0.9 }, duration: cfg.warnMs, yoyo: false });
      scene.banner('GALE SHOVE\nbrace — the sky is about to push', '#bfeee6');
      try { AUDIO.play('windshift'); } catch (e) {}
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!scene.boss || !scene.boss.active) return;
        var fx = scene.add.graphics().setScrollFactor(0).setDepth(41).setAlpha(0.4);
        fx.lineStyle(2, 0xd9f4ff, 0.6);
        for (var i2 = 0; i2 < 14; i2++) fx.lineBetween(0, H * SIM.rng(), W, H * SIM.rng());
        fx.setRotation(ang * 0.15);
        scene._sky.gale = { vx: Math.cos(ang) * cfg.push, vy: Math.sin(ang) * cfg.push,
                            until: scene.time.now + cfg.durMs, fx: fx };
        try { AUDIO.play('ventwhoosh'); } catch (e) {}
      });
    },

    _islandSlam: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.islandSlam, S = scene._sky;
      var roost = null; S.isles.forEach(function (I) { if (I.arena) roost = I; });
      if (!roost) return;
      var t = cfg.tile;
      for (var gy = -Math.ceil(roost.ry / t); gy <= Math.ceil(roost.ry / t); gy++) {
        for (var gx = -Math.ceil(roost.rx / t); gx <= Math.ceil(roost.rx / t); gx++) {
          var cx = roost.x + gx * t, cy = roost.y + gy * t;
          var d = ((cx - roost.x) * (cx - roost.x)) / (roost.rx * roost.rx) + ((cy - roost.y) * (cy - roost.y)) / (roost.ry * roost.ry);
          if (d > 1) continue;
          var waveB = ((gx + gy) % 2 + 2) % 2 === 1;                 // checkerboard parity
          var delay = waveB ? cfg.gapMs : 0;
          SKY._zone(scene, cx, cy, t * 0.52, cfg.warnMs + delay, cfg.dmg, "Nimbus Talon's wing-slam", true, false, time, true);
        }
      }
      scene.banner('ISLAND-DROP SLAM\nstand on the wave that already fired', '#ffe95a');
    },

    _diveBegin: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.diveLane, S = scene._sky;
      // the lane: through the player, edge to edge of the local area
      var ang = SIM.rng() * Math.PI;
      var len = cfg.dmg ? 900 : 900;
      var x0 = player.x - Math.cos(ang) * len / 2, y0 = player.y - Math.sin(ang) * len / 2;
      var x1 = player.x + Math.cos(ang) * len / 2, y1 = player.y + Math.sin(ang) * len / 2;
      b.boss.dive = { phase: 'rise', at: time + cfg.warnMs, x0: x0, y0: y0, x1: x1, y1: y1, hit: false };
      b.boss.busyUntil = time + cfg.warnMs + cfg.dashMs + 600;
      // he rises off-screen
      b.body.enable = false;
      scene.tweens.add({ targets: b, alpha: 0.25, scaleX: b.scaleX * 1.25, scaleY: b.scaleY * 1.25, duration: 500 });
      // lane flash
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xffe95a, 0.16); g.lineStyle(2, 0xffe95a, 0.85);
      g.save(); g.translateCanvas(player.x, player.y); g.rotateCanvas(ang);
      g.fillRect(-len / 2, -cfg.half, len, cfg.half * 2); g.strokeRect(-len / 2, -cfg.half, len, cfg.half * 2);
      g.restore();
      b.boss.dive.g = g;
      try { AUDIO.play('divescreech'); } catch (e) {}
    },
    _diveStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.diveLane, dv = b.boss.dive;
      if (dv.phase === 'rise' && time >= dv.at) {
        dv.phase = 'dash'; dv.at = time + cfg.dashMs;
        b.setPosition(dv.x0, dv.y0); b.setAlpha(1);
        scene.cameras.main.shake(cfg.dashMs, 0.006);
        try { AUDIO.play('divescreech'); } catch (e) {}
      } else if (dv.phase === 'dash') {
        var t = 1 - Math.max(0, (dv.at - time) / cfg.dashMs);
        b.setPosition(dv.x0 + (dv.x1 - dv.x0) * t, dv.y0 + (dv.y1 - dv.y0) * t);
        if (!dv.hit && player.state.alive &&
            dist2seg(player.x, player.y, dv.x0, dv.y0, dv.x1, dv.y1) < cfg.half) {
          // only clip when the talons have actually reached you
          if (Math.hypot(player.x - b.x, player.y - b.y) < cfg.half * 2.6) {
            dv.hit = true;
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "Nimbus Talon's dive", true);
          }
        }
        if (time >= dv.at) {
          if (dv.g) { try { dv.g.destroy(); } catch (e) {} }
          b.body.enable = true;
          scene.tweens.add({ targets: b, scaleX: b.scaleX / 1.25, scaleY: b.scaleY / 1.25, duration: 300 });
          b.boss.dive = null;
        }
      }
    },

    _rodBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.rodOverload, S = scene._sky;
      var order = S.rods.slice();
      // rotate the firing order so the safe pocket rotates run to run
      var shift = Math.floor(SIM.rng() * order.length);
      order = order.slice(shift).concat(order.slice(0, shift));
      b.boss.rod = { idx: 0, order: order, nextAt: time + cfg.chargeMs, charging: true };
      b.boss.rootUntil = time + cfg.chargeMs + order.length * cfg.gapMs + cfg.ventMs;
      b.boss.busyUntil = b.boss.rootUntil;
      // fuse rings grow on every rod
      order.forEach(function (rd, i) {
        var ring = scene.add.circle(rd.x, rd.y, cfg.radius, 0xffe95a, 0.10)
          .setStrokeStyle(3, 0xd6a520, 0.9).setDepth(2).setScale(0.25);
        scene.tweens.add({ targets: ring, scale: 1, duration: cfg.chargeMs + i * cfg.gapMs });
        rd._ring = ring;
      });
      scene.banner('ROD OVERLOAD\nthe rods drink the storm — the safe pocket rotates', '#ffe95a');
      try { AUDIO.play('rodhum'); } catch (e) {}
    },
    _rodStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.rodOverload, rod = b.boss.rod;
      b.setVelocity(0, 0);
      if (time < rod.nextAt) return;
      if (rod.idx < rod.order.length) {
        var rd = rod.order[rod.idx];
        if (rd._ring) { try { rd._ring.destroy(); } catch (e) {} rd._ring = null; }
        SKY._boltFx(scene, rd.x, rd.y);
        scene.cameras.main.shake(140, 0.007);
        try { AUDIO.play('strikecrack'); } catch (e) {}
        if (player.state.alive && Math.hypot(player.x - rd.x, player.y - rd.y) < cfg.radius)
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "Nimbus Talon's rod overload", true);
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && Math.hypot(m.x - rd.x, m.y - rd.y) < cfg.radius) scene.killMobCredited(m);
        });
        rod.idx++;
        rod.nextAt = time + cfg.gapMs;
        if (rod.idx >= rod.order.length) {
          // spent — he VENTS: rooted, takes bonus damage (core hurtBoss reads these)
          b.boss.ventedUntil = time + cfg.ventMs;
          b.boss.ventDmgMult = cfg.ventDmgMult;
          b.boss.rod = null;
          b.setTint(0x8fd6ff);
          scene.time.delayedCall(cfg.ventMs, function () { if (b.active) b.clearTint(); });
          scene.banner('HE VENTS — UNLOAD', '#7fd4ff');
        }
      }
    },

    _stormAdds: function (scene, b, time) {
      var cfg = b.boss.def.patterns.adds, alive = 0;
      scene.mobs.children.iterate(function (m) { if (m && m.active) alive++; });
      if (alive >= cfg.cap) return;
      for (var i = 0; i < 3; i++) {
        var a = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: 'stormSprite', bossWave: true,
          x: b.x + Math.cos(a) * 180, y: b.y + Math.sin(a) * 180 });
      }
      scene.queueSpawn({ key: 'stormvane', bossWave: true,
        x: b.x + (SIM.rng() * 2 - 1) * 220, y: b.y + (SIM.rng() * 2 - 1) * 160 });
    },

    // =============================================== MOB VERBS (map-new) ===
    // CLOUD RAY — near you it marks a small circle → mini lightning strike.
    _rayMark: function (scene, m, player, time) {
      if (!m.mob.nextMarkAt) m.mob.nextMarkAt = time + m.mob.def.rayMark.everyMs * (0.5 + SIM.rng() * 0.5);
      var cfg = m.mob.def.rayMark;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextMarkAt && d < cfg.range) {
        m.mob.nextMarkAt = time + cfg.everyMs;
        var jx = player.x + (SIM.rng() * 2 - 1) * 40, jy = player.y + (SIM.rng() * 2 - 1) * 40;
        SKY._zone(scene, jx, jy, cfg.radius, cfg.warnMs, cfg.dmg, "a Cloud Ray's bolt", false, false, time);
      }
      return false;                                          // keep drifting (generic chase)
    },
    // NIMBUS GOLEM — contact SHOVES the player back (positional toss).
    _golemShove: function (scene, m, player, time) {
      var cfg = m.mob.def.shove;
      if (!m.mob.nextShoveAt) m.mob.nextShoveAt = 1;         // armed immediately
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (player.state.alive && d < cfg.range && time >= m.mob.nextShoveAt) {
        m.mob.nextShoveAt = time + cfg.everyMs;
        var nx = (player.x - m.x) / (d || 1), ny = (player.y - m.y) / (d || 1);
        scene._sky.toss = { vx: nx * cfg.push * 4, vy: ny * cfg.push * 4, until: time + 250 };
        scene.burst(player.x, player.y, 6, 0x6a6f9e);
        try { AUDIO.play('thud'); } catch (e) { try { AUDIO.play('hit'); } catch (e2) {} }
      }
      return false;                                          // chase continues
    },
    // ROC HATCHLING — waddles → hops airborne → BELLY-FLOPS a telegraphed circle.
    _bellyFlop: function (scene, m, player, time) {
      var cfg = m.mob.def.flop;
      if (m.mob.flop) {                                      // mid-hop: own the frame
        var F = m.mob.flop;
        var t = 1 - Math.max(0, (F.until - time) / cfg.hopMs);
        m.setPosition(F.sx + (F.tx - F.sx) * t, F.sy + (F.ty - F.sy) * t - Math.sin(t * Math.PI) * 60);
        m.setScale(m.mob.flopScale * (1 + Math.sin(t * Math.PI) * 0.5));
        if (time >= F.until) {
          m.setScale(m.mob.flopScale);
          m.body.enable = true;
          m.mob.flop = null;
          m.mob.nextFlopAt = time + cfg.everyMs;
          scene.cameras.main.shake(120, 0.004);
        }
        return true;
      }
      if (!m.mob.nextFlopAt) m.mob.nextFlopAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextFlopAt && d < cfg.range) {
        var tx = player.x, ty = player.y;
        m.mob.flopScale = m.scaleX;
        m.mob.flop = { sx: m.x, sy: m.y, tx: tx, ty: ty, until: time + cfg.hopMs };
        m.body.enable = false;                               // airborne — brief
        m.setVelocity(0, 0);
        SKY._zone(scene, tx, ty, cfg.radius, Math.max(cfg.warnMs, cfg.hopMs), cfg.dmg, "a Roc Hatchling's belly-flop", false, false, time);
        return true;
      }
      return false;
    },

    // ================================================= INTERNAL HELPERS ====
    _onLand: function (scene, x, y) {
      var S = scene._sky, i;
      for (i = 0; i < S.isles.length; i++) {
        var I = S.isles[i];
        if (((x - I.x) * (x - I.x)) / (I.rx * I.rx) + ((y - I.y) * (y - I.y)) / (I.ry * I.ry) <= 1.06) return true;
      }
      for (i = 0; i < S.shards.length; i++) {
        var Sh = S.shards[i];
        if (((x - Sh.x) * (x - Sh.x)) / (Sh.rx * Sh.rx) + ((y - Sh.y) * (y - Sh.y)) / (Sh.ry * Sh.ry) <= 1.2) return true;
      }
      for (i = 0; i < S.bridges.length; i++) {
        var B = S.bridges[i];
        if (dist2seg(x, y, B.x0, B.y0, B.x1, B.y1) < B.half) return true;
      }
      return false;
    },

    _wrap: function (scene) {
      var WW = scene.worldW, HH = scene.worldH;
      var wrap = function (o) {
        if (!o) return;
        var nx = o.x, ny = o.y, moved = false;
        if (o.x < 0) { nx = o.x + WW; moved = true; } else if (o.x >= WW) { nx = o.x - WW; moved = true; }
        if (o.y < 0) { ny = o.y + HH; moved = true; } else if (o.y >= HH) { ny = o.y - HH; moved = true; }
        if (!moved) return;
        if (o.body && o.body.reset) { var vx = o.body.velocity.x, vy = o.body.velocity.y; o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy; }
        else { o.x = nx; o.y = ny; }
      };
      wrap(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && !m.mob.bossWave) wrap(m); });
    },

    // one pending telegraphed blast (absolute clock — unfreeze-safe)
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, square) {
      var S = scene._sky;
      var ring = square
        ? scene.add.rectangle(x, y, r * 2, r * 2, 0xffe95a, 0.12).setStrokeStyle(2, 0xffe95a, 0.8).setDepth(2)
        : scene.add.circle(x, y, r, 0xffe95a, 0.13).setStrokeStyle(2, 0xffe95a, 0.85).setDepth(2);
      ring.setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      S.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var S = scene._sky;
      for (var i = S.zones.length - 1; i >= 0; i--) {
        var z = S.zones[i];
        if (time < z.at) continue;
        S.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        SKY._boltFx(scene, z.x, z.y);
        try { AUDIO.play('strikecrack'); } catch (e) {}
        scene.cameras.main.shake(90, 0.004);
        if (scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.killMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m);
          });
        }
      }
    },
    // a lightning bolt slamming down at (x,y) — pure cosmetics
    _boltFx: function (scene, x, y) {
      var g = scene.add.graphics().setDepth(30);
      var px = x, py = y - 420;
      g.lineStyle(6, 0xd6a520, 0.7);
      for (var s = 0; s < 4; s++) {
        var nx = x + (SIM.rng() * 2 - 1) * 26, ny = py + (y - py) * (s + 1) / 4;
        g.lineBetween(px, py, nx, ny); px = nx; py = ny;
      }
      g.lineStyle(2, 0xfffbc8, 1);
      px = x; py = y - 420;
      for (var s2 = 0; s2 < 4; s2++) {
        var nx2 = x + (SIM.rng() * 2 - 1) * 22, ny2 = py + (y - py) * (s2 + 1) / 4;
        g.lineBetween(px, py, nx2, ny2); px = nx2; py = ny2;
      }
      scene.burst(x, y, 10, 0xffe95a);
      scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: function () { try { g.destroy(); } catch (e) {} } });
    },

    // ---- THE TEMPEST CYCLE v2 conductor -----------------------------------
    _tempest: function (scene, time, dt) {
      var S = scene._sky, T = S.tempest; if (!T) return;
      var cfg = T.cfg, WW = scene.worldW, HH = scene.worldH;
      var ambient = !scene.boss && !scene.bossPortal && !scene.closing && !scene.pendingLoot;

      // THE STORM EYE — always drifting (parks over the Roost for the boss)
      var eye = T.eye;
      if (time >= eye.retargetAt && eye.retargetAt !== Infinity && ambient) {
        eye.retargetAt = time + cfg.eye.retargetMs;
        eye.tx = WW * (0.12 + SIM.rng() * 0.76); eye.ty = HH * (0.12 + SIM.rng() * 0.76);
      }
      var ex = eye.tx - eye.x, ey = eye.ty - eye.y, ed = Math.hypot(ex, ey);
      if (ed > 4) { eye.x += ex / ed * cfg.eye.speed * dt / 1000; eye.y += ey / ed * cfg.eye.speed * dt / 1000; }
      if (eye.g) eye.g.setPosition(eye.x, eye.y);
      // the eye's pull (gentle, positional) on the player when under it
      if (!scene.hitstopActive && scene.player.state.alive) {
        var pd = Math.hypot(scene.player.x - eye.x, scene.player.y - eye.y);
        if (pd < cfg.eye.radius * 1.6 && pd > 8) {
          scene.player.x += (eye.x - scene.player.x) / pd * cfg.eye.pull * dt / 1000;
          scene.player.y += (eye.y - scene.player.y) / pd * cfg.eye.pull * dt / 1000;
        }
      }

      if (!ambient) { return; }                              // the storm belongs to HIM

      // 1 WIND SHIFT — telegraph (streaks + every chime rings), then the gale
      if (time >= T.windAt && T.windAt !== Infinity) {
        T.windAt = time + cfg.wind.everyMs;
        T.windDir = (T.windDir + 1 + Math.floor(SIM.rng() * 2)) % 4;
        T.windWarnUntil = time + cfg.wind.warnMs;
        S.chimes.forEach(function (c) {
          scene.tweens.add({ targets: c, angle: { from: -8, to: 8 }, duration: 140, yoyo: true, repeat: 4,
            onComplete: function () { c.setAngle(0); } });
        });
        try { AUDIO.play('chimering'); } catch (e) {}
        try { AUDIO.play('windshift'); } catch (e) {}
        var ang0 = T.windDir * Math.PI / 2 + (SIM.rng() - 0.5) * 0.5;
        T.pendingWind = { ang: ang0, at: time + cfg.wind.warnMs };
      }
      if (T.pendingWind && time >= T.pendingWind.at) {
        var a = T.pendingWind.ang;
        T.wind = { vx: Math.cos(a) * cfg.wind.push, vy: Math.sin(a) * cfg.wind.push, until: time + cfg.wind.durMs };
        T.pendingWind = null;
      }
      if (T.wind && time < T.wind.until && !scene.hitstopActive) {
        var wvx = T.wind.vx * dt / 1000, wvy = T.wind.vy * dt / 1000;
        if (scene.player.state.alive) { scene.player.x += wvx; scene.player.y += wvy; }
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && !m.mob.def.float && !m.mob.bossWave) { m.x += wvx; m.y += wvy; }
        });
      } else if (T.wind && time >= T.wind.until) T.wind = null;

      // 2 ROAMING STRIKES — cluster near rods / stormvanes / under the eye
      if (time >= T.strikeAt && T.strikeAt !== Infinity) {
        T.strikeAt = time + cfg.strikes.everyMs * (0.7 + SIM.rng() * 0.6);
        var sx, sy, roll = SIM.rng();
        if (roll < cfg.strikes.rodBias) {
          // a magnet: a rod, a live stormvane, or the eye's footprint
          var mags = S.rods.slice();
          scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob && m.mob.def.texture === 'stormvaneHi') mags.push({ x: m.x, y: m.y }); });
          mags.push({ x: eye.x, y: eye.y });
          var mg = mags[Math.floor(SIM.rng() * mags.length)];
          sx = mg.x + (SIM.rng() * 2 - 1) * 110; sy = mg.y + (SIM.rng() * 2 - 1) * 110;
        } else {
          sx = WW * SIM.rng(); sy = HH * SIM.rng();
        }
        SKY._zone(scene, sx, sy, cfg.strikes.radius, cfg.strikes.warnMs, cfg.strikes.dmg, 'the storm', false, true, time);
      }

      // 3 UPDRAFT VENTS — telegraph on island edges (the map breathes)
      if (time >= T.ventAt && T.ventAt !== Infinity) {
        T.ventAt = time + cfg.vents.everyMs * (0.7 + SIM.rng() * 0.6);
        var I = S.isles[Math.floor(SIM.rng() * S.isles.length)];
        var va = SIM.rng() * Math.PI * 2, vr = 0.82 + SIM.rng() * 0.2;
        var vx = I.x + Math.cos(va) * I.rx * vr, vy = I.y + Math.sin(va) * I.ry * vr;
        var Z = { x: vx, y: vy };
        // vents erupt in the eye's wake when it's near
        if (Math.hypot(eye.x - vx, eye.y - vy) > cfg.eye.radius && SIM.rng() < 0.35) {
          Z.x = eye.x + (SIM.rng() * 2 - 1) * cfg.eye.radius * 0.8;
          Z.y = eye.y + (SIM.rng() * 2 - 1) * cfg.eye.radius * 0.6;
        }
        SKY._ventAt(scene, Z.x, Z.y, time);
      }
    },
    _ventAt: function (scene, x, y, time) {
      var S = scene._sky, cfg = S.tempest.cfg.vents;
      // swirling vortex telegraph
      var ring = scene.add.circle(x, y, cfg.radius, 0x7fd4ff, 0.10).setStrokeStyle(2, 0xbfeee6, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, angle: 200, duration: cfg.warnMs });
      var z = { x: x, y: y, r: cfg.radius, at: time + cfg.warnMs, dmg: cfg.dmg, src: 'an updraft vent',
                fromBoss: false, killMobs: true, ring: ring, vent: cfg.push };
      S.zones.push(z);
      var warn = { x: x, y: y, r: cfg.radius, until: time + cfg.warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
      // (the outward toss rides along in the extended _runZones below)
      try { AUDIO.play('ventwhoosh'); } catch (e) {}
    },

    _clearDark: function (scene) {
      var S = scene._sky; if (!S) return;
      if (S.dark) { try { S.dark.destroy(); } catch (e) {} S.dark = null; }
      S.darkArmed = false;
      if (S.shadow) { try { S.shadow.destroy(); } catch (e) {} S.shadow = null; }
    }
  };

  // vent toss ride-along: extend _runZones' blast with the outward shove
  var baseRun = SKY._runZones;
  SKY._runZones = function (scene, time) {
    var S = scene._sky;
    // capture vent zones about to pop (baseRun destroys them)
    var popping = S.zones.filter(function (z) { return time >= z.at && z.vent; });
    baseRun(scene, time);
    popping.forEach(function (z) {
      var p = scene.player;
      if (p.state.alive && Math.hypot(p.x - z.x, p.y - z.y) < z.r) {
        var d = Math.hypot(p.x - z.x, p.y - z.y) || 1;
        S.toss = { vx: (p.x - z.x) / d * z.vent * 4, vy: (p.y - z.y) / d * z.vent * 4, until: time + 250 };
      }
    });
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SKY;
  root.SKYISLES_SCENE = SKY;
})(typeof window !== 'undefined' ? window : this);
