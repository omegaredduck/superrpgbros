// ============================================================================
// game/js/maps/crystal/scene.js — CRYSTAL CAVERNS scene hooks (M7 registry).
// The scene-plan PNG (assets/crystal_scene_plan.png) is canon: six carved
// chambers (ENTRY SHELF spawn / GREAT HALL hub / GARDEN / GEODE HOLLOW /
// UNDERGROUND LAKE / THE DEEP FISSURE boss arena) joined by tunnels through
// solid gem-veined rock (rock is crush-slow, not a hard wall). GROWING
// CRYSTAL is the signature system: GATES A–D grow shut on a cave cycle
// (shimmer + chime telegraph → solid crystal wall blocks → crack → SHATTER
// with a damaging ring). HARD RULES: ≥2 gates open at all times; a gate never
// closes on an occupied tile (defers). THE SHARDLORD ceiling-drops into the
// fissure; his RAINBOW CORE locks a color per attack — the telegraph language.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var CHAMBERS = [
    { x: 0.16, y: 0.78, rx: 0.13, ry: 0.11, tex: 'ksand' },    // ENTRY SHELF (spawn)
    { x: 0.45, y: 0.5,  rx: 0.17, ry: 0.14, tex: 'kcrystal' }, // THE GREAT HALL
    { x: 0.32, y: 0.18, rx: 0.14, ry: 0.11, tex: 'kmoss' },    // CRYSTAL GARDEN
    { x: 0.72, y: 0.78, rx: 0.15, ry: 0.12, tex: 'kwater' },   // UNDERGROUND LAKE
    { x: 0.14, y: 0.42, rx: 0.11, ry: 0.1,  tex: 'kgeode' },   // GEODE HOLLOW
    { x: 0.76, y: 0.22, rx: 0.16, ry: 0.14, tex: 'kobsidian' } // THE DEEP FISSURE (BOSS)
  ];
  // tunnels: [x1,y1,x2,y2, halfwidth, gateIdx|-1]
  var TUNNELS = [
    [0.16, 0.78, 0.38, 0.58, 0.035, -1],   // entry -> hall
    [0.45, 0.5, 0.34, 0.26, 0.033, 0],     // hall -> garden (GATE A)
    [0.45, 0.5, 0.66, 0.72, 0.035, -1],    // hall -> lake
    [0.45, 0.5, 0.2, 0.44, 0.03, 1],       // hall -> geode hollow (GATE B)
    [0.45, 0.5, 0.68, 0.3, 0.038, -1],     // hall -> fissure (boss approach)
    [0.32, 0.18, 0.62, 0.16, 0.03, 2],     // garden -> fissure (GATE C)
    [0.72, 0.78, 0.78, 0.4, 0.03, 3],      // lake -> fissure (GATE D)
    [0.14, 0.42, 0.2, 0.66, 0.028, -1],    // geode -> entry (loop)
    [0.6, 0.84, 0.84, 0.72, 0.014, -1],    // the crystal BRIDGE over the lake
    // wrap loops (toroidal): edge tunnels
    [0.16, 0.78, 0.16, 1.01, 0.03, -1],    // entry -> south edge
    [0.16, -0.01, 0.32, 0.18, 0.03, -1],   // north edge -> garden
    [0.72, 0.78, 1.01, 0.78, 0.03, -1],    // lake -> east edge
    [-0.01, 0.78, 0.16, 0.78, 0.03, -1]    // west edge -> entry
  ];
  var DECOR = [
    // entry shelf
    ['kdCart', 0.11, 0.8, 1.6], ['kdLantern', 0.2, 0.72, 1.4], ['kdRubble', 0.13, 0.86, 1.3],
    ['kdLantern', 0.3, 0.66, 1.3],
    // great hall
    ['kdCluster', 0.45, 0.44, 2.0], ['kdPillar', 0.38, 0.55, 1.7], ['kdPillar', 0.52, 0.56, 1.7],
    ['kdArch', 0.45, 0.62, 1.7], ['kdVein', 0.55, 0.42, 1.4],
    // garden
    ['kdFlowers', 0.27, 0.14, 1.5], ['kdShrooms', 0.36, 0.21, 1.5], ['kdSinging', 0.3, 0.24, 1.4],
    ['kdShrooms', 0.38, 0.13, 1.3], ['kdShaft', 0.26, 0.2, 1.4],
    // lake
    ['kdFossil', 0.67, 0.83, 1.5], ['kdPool', 0.79, 0.72, 1.5], ['kdBridge', 0.72, 0.78, 1.6],
    // geode hollow
    ['kdGeode', 0.1, 0.4, 1.6], ['kdRubble', 0.17, 0.47, 1.4], ['kdPedestal', 0.12, 0.35, 1.4],
    ['kdGeode', 0.17, 0.38, 1.3],
    // deep fissure (boss)
    ['kdFissure', 0.76, 0.16, 1.7], ['kdFissure', 0.84, 0.26, 1.5], ['kdStalag', 0.68, 0.28, 1.4]
  ];
  var CHANDELIERS = [[0.7, 0.13], [0.76, 0.1], [0.83, 0.14]];  // over the arena
  var STAL_WARNS = [[0.71, 0.2], [0.8, 0.17], [0.76, 0.27]];   // entrance dust marks

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var CRY = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._cry = {
        gates: [], grow: { nextAt: 0 }, minOpen: 2,
        rings: [], dust: [], zones: [], lanes: [],
        slowUntil: 0, overload: null, bossWalls: [],
        coreGlow: null,
        chambers: [], tunnels: [], chandeliers: [],
        arena: { x: CHAMBERS[5].x * WW, y: CHAMBERS[5].y * HH,
                 rx: CHAMBERS[5].rx * WW, ry: CHAMBERS[5].ry * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- solid rock base + carved tunnels + chambers ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'krock').setDepth(-23).setTint(0x8a84a0);
      TUNNELS.forEach(function (T) {
        var x0 = T[0] * WW, y0 = T[1] * HH, x1 = T[2] * WW, y1 = T[3] * HH;
        var len = Math.hypot(x1 - x0, y1 - y0) + 30, wdt = T[4] * WW * 2;
        var spr = scene.add.tileSprite((x0 + x1) / 2, (y0 + y1) / 2, len, wdt, 'kamethyst').setDepth(-22);
        spr.setRotation(Math.atan2(y1 - y0, x1 - x0));
        C.tunnels.push({ x0: x0, y0: y0, x1: x1, y1: y1, hw: T[4] * WW, gate: T[5] });
      });
      CHAMBERS.forEach(function (Ch) {
        var cx = Ch.x * WW, cy = Ch.y * HH, rx = Ch.rx * WW, ry = Ch.ry * HH;
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, Ch.tex).setDepth(-21);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask());
        C.chambers.push({ x: cx, y: cy, rx: rx, ry: ry, tex: Ch.tex });
      });
      // lake sand rim (walkable shore)
      var LK = C.chambers[3];
      var rim = scene.add.tileSprite(LK.x, LK.y, LK.rx * 2 + 8, LK.ry * 2 + 8, 'ksand').setDepth(-21.5);
      var rmg = scene.make.graphics({ add: false });
      rmg.fillStyle(0xffffff, 1); rmg.fillEllipse(LK.x, LK.y, LK.rx * 2, LK.ry * 2);
      rim.setMask(rmg.createGeometryMask());
      // (water tile sits above the rim in the inner 72%)
      var inner = scene.add.tileSprite(LK.x, LK.y, LK.rx * 2, LK.ry * 2, 'kwater').setDepth(-21);
      var img = scene.make.graphics({ add: false });
      img.fillStyle(0xffffff, 1); img.fillEllipse(LK.x, LK.y, LK.rx * 2 * 0.85, LK.ry * 2 * 0.85);
      inner.setMask(img.createGeometryMask());

      // mine rails decal: entry -> hall
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0x6a5140, 0.8);
      rg.lineBetween(0.1 * WW, 0.82 * HH, 0.41 * WW, 0.55 * HH);
      rg.lineBetween(0.11 * WW, 0.84 * HH, 0.42 * WW, 0.57 * HH);

      // ---- decor per the PLAN + chandeliers over the arena ----
      DECOR.forEach(function (D) {
        scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
      });
      CHANDELIERS.forEach(function (Q) {
        var spr = scene.add.sprite(Q[0] * WW, Q[1] * HH, 'kdChand').setScale(1.6).setDepth(3);
        C.chandeliers.push(spr);
      });

      // ---- GATES A–D: one shared static wall group (colliders attach in
      // afterCreate — the player doesn't exist yet during setup) ----
      C.wallGroup = scene.physics.add.staticGroup();
      C.tunnels.forEach(function (T) {
        if (T.gate < 0) return;
        var mx = (T.x0 + T.x1) / 2, my = (T.y0 + T.y1) / 2;
        var dx = T.x1 - T.x0, dy = T.y1 - T.y0, L = Math.hypot(dx, dy);
        var nx = -dy / L, ny = dx / L;                        // perpendicular
        var span = T.hw * 2.2;
        var blocks = [];
        for (var i = -2; i <= 2; i++) {
          var bx = mx + nx * span * i / 2, by = my + ny * span * i / 2;
          var r2 = scene.add.rectangle(bx, by, 26, 26, 0xff7ab8, 0.75).setDepth(3).setVisible(false);
          C.wallGroup.add(r2);
          r2.body.enable = false;
          blocks.push(r2);
        }
        var shardSpr = scene.add.sprite(mx, my, 'kdWall').setScale(1.8).setDepth(3.2).setVisible(false);
        shardSpr.setRotation(Math.atan2(ny, nx) + Math.PI / 2);
        var stain = scene.add.tileSprite(mx, my, span * 2 + 40, 60, 'kgrown').setDepth(-19).setVisible(false);
        stain.setRotation(Math.atan2(ny, nx));
        C.gates[T.gate] = { id: 'ABCD'[T.gate], mx: mx, my: my, nx: nx, ny: ny, span: span,
          state: 'open', warnUntil: 0, crackAt: 0, shatterAt: 0,
          blocks: blocks, shard: shardSpr, stain: stain, warnG: null };
      });

      // ---- spawn on the entry shelf ----
      scene._realmStart = { x: 0.16 * WW, y: 0.78 * HH };

      // mob-verb helpers (fresh closures)
      scene._cryLurker = function (m, player, time) { return CRY._lurker(scene, m, player, time); };
      scene._cryGolem = function (m, player, time) { return CRY._golem(scene, m, player, time); };
      scene._cryBat = function (m, player, time) { return CRY._bat(scene, m, player, time); };
      scene._cryRam = function (m, player, time) { return CRY._ram(scene, m, player, time); };
      scene._cryResonator = function (m, player, time) { return CRY._resonator(scene, m, player, time); };
      scene._cryMoth = function (m, player, time) { return CRY._moth(scene, m, player, time); };
      scene._cryCrawler = function (m, player, time) { return CRY._crawler(scene, m, player, time); };
      scene._cryHorror = function (m, player, time) { return CRY._horrorBeam(scene, m, player, time); };
    },

    afterCreate: function (scene) {
      var C = scene._cry; if (!C) return;
      C.wallColliderP = scene.physics.add.collider(scene.player, C.wallGroup);
      C.wallColliderM = scene.physics.add.collider(scene.mobs, C.wallGroup);
    },

    _inCave: function (C, x, y) {
      for (var i = 0; i < C.chambers.length; i++) {
        var Ch = C.chambers[i];
        var d = ((x - Ch.x) / Ch.rx) * ((x - Ch.x) / Ch.rx) + ((y - Ch.y) / Ch.ry) * ((y - Ch.y) / Ch.ry);
        if (d < 1) return true;
      }
      for (var j = 0; j < C.tunnels.length; j++) {
        var T = C.tunnels[j];
        if (dist2seg(x, y, T.x0, T.y0, T.x1, T.y1) < T.hw) return true;
      }
      return false;
    },
    _inWater: function (C, x, y) {
      var LK = C.chambers[3];
      var d = ((x - LK.x) / LK.rx) * ((x - LK.x) / LK.rx) + ((y - LK.y) / LK.ry) * ((y - LK.y) / LK.ry);
      if (d >= 0.72) return false;
      var B = C.tunnels[8];                                   // the bridge
      if (dist2seg(x, y, B.x0, B.y0, B.x1, B.y1) < B.hw + 6) return false;
      return true;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._cry; if (!C) return;
      var dt = Math.min(120, delta), cfg = scene.realmDef.grow;
      var p = scene.player, alive = p.state.alive;

      // boss-owned walls + overload clear when the boss is down (armed rule)
      if ((C.bossWalls.length || C.overload) && (!scene.boss || !scene.boss.active) && C.bossArmed) {
        CRY._clearBossWalls(scene, C);
        CRY._clearOverload(C);                                // M7k AUDIT fix: destroy unfired sector warns too
        C.bossArmed = false;
        if (C.coreGlow) { try { C.coreGlow.destroy(); } catch (e) {} C.coreGlow = null; }
      }

      // ---- GROWING CRYSTAL gate cycle ----
      var G = C.grow;
      if (!G.nextAt) G.nextAt = time + cfg.periodMs * 0.5;
      if (G.nextAt !== Infinity && time >= G.nextAt && !scene.scanning) {
        G.nextAt = time + cfg.periodMs * (0.8 + SIM.rng() * 0.4);
        var closed = C.gates.filter(function (g2) { return g2.state !== 'open'; }).length;
        if (C.gates.length - closed - 1 >= C.minOpen) {       // NEVER ALL SHUT
          var open = C.gates.filter(function (g2) { return g2.state === 'open'; });
          if (open.length) {
            var gate = open[Math.floor(SIM.rng() * open.length)];
            CRY._gateWarn(scene, C, gate, time, cfg);
          }
        }
      }
      C.gates.forEach(function (gate) {
        if (gate.state === 'warn' && time >= gate.warnUntil) {
          // NEVER closes on an occupied tile — defer while someone stands in it
          var occupied = alive && dist2seg(p.x, p.y, gate.mx - gate.nx * gate.span, gate.my - gate.ny * gate.span,
            gate.mx + gate.nx * gate.span, gate.my + gate.ny * gate.span) < 40;
          if (!occupied) {
            scene.mobs.children.iterate(function (m) {
              if (m && m.active && dist2seg(m.x, m.y, gate.mx - gate.nx * gate.span, gate.my - gate.ny * gate.span,
                gate.mx + gate.nx * gate.span, gate.my + gate.ny * gate.span) < 30) occupied = true;
            });
          }
          if (occupied) { gate.warnUntil = time + 900; return; }
          CRY._gateClose(scene, C, gate, time, cfg);
        }
        if (gate.state === 'closed') {
          if (time >= gate.crackAt && !gate.cracked) {
            gate.cracked = true;
            gate.shard.setTint(0xffffff);
            try { AUDIO.play('shatterburst'); } catch (e) {}
          }
          if (time >= gate.shatterAt) CRY._gateShatter(scene, C, gate, time, cfg);
        }
      });

      // ---- boss GROWING WALLS auto-shatter ----
      for (var wi = C.bossWalls.length - 1; wi >= 0; wi--) {
        var BW = C.bossWalls[wi];
        if (time < BW.shatterAt) continue;
        BW.blocks.forEach(function (b2) { b2.body.enable = false; try { b2.destroy(); } catch (e) {} });
        try { BW.shard.destroy(); } catch (e) {}
        scene.burst(BW.mx, BW.my, 12, 0xa06bf0);
        CRY._zone(scene, BW.mx, BW.my, 60, 200, cfg.shatterDmg, 'shattering crystal', true, true, time);
        C.bossWalls.splice(wi, 1);
      }

      // ---- ROCK is crush-slow; WATER swims slow; dust + screech slow ----
      if (alive) {
        if (!CRY._inCave(C, p.x, p.y)) { p.body.velocity.x *= 0.35; p.body.velocity.y *= 0.35; }
        else if (CRY._inWater(C, p.x, p.y)) { p.body.velocity.x *= 0.5; p.body.velocity.y *= 0.5; }
        if (C.slowUntil > time) { p.body.velocity.x *= 0.55; p.body.velocity.y *= 0.55; }
        for (var di2 = 0; di2 < C.dust.length; di2++) {
          var D2 = C.dust[di2];
          if (Math.hypot(p.x - D2.x, p.y - D2.y) < D2.r) { p.body.velocity.x *= 0.6; p.body.velocity.y *= 0.6; break; }
        }
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.float || m.mob.hop) return;
        if (!CRY._inCave(C, m.x, m.y)) { m.body.velocity.x *= 0.35; m.body.velocity.y *= 0.35; }
        else if (CRY._inWater(C, m.x, m.y)) { m.body.velocity.x *= 0.5; m.body.velocity.y *= 0.5; }
      });
      for (var di = C.dust.length - 1; di >= 0; di--) {
        if (time >= C.dust[di].dieAt) { try { C.dust[di].obj.destroy(); } catch (e) {} C.dust.splice(di, 1); }
      }

      // ---- expanding RINGS (resonators + the boss's quake fists) ----
      for (var ri = C.rings.length - 1; ri >= 0; ri--) {
        var RG = C.rings[ri];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.3); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        if (!RG.hit && alive) {
          var sd = Math.hypot(p.x - RG.x, p.y - RG.y);
          if (Math.abs(sd - RG.r) < 20) {
            RG.hit = true;
            Entities.hurtPlayer(scene, p, RG.dmg, time, RG.src, RG.fromBoss);
          }
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(ri, 1); }
      }

      // ---- PRISMATIC OVERLOAD cone sequence ----
      if (C.overload) {
        var OV = C.overload, allDone = true;
        for (var oi = 0; oi < OV.seq.length; oi++) {
          var SC = OV.seq[oi];
          if (SC.fired) continue;
          allDone = false;
          if (time < SC.at) continue;
          SC.fired = true;
          try { SC.g.destroy(); } catch (e) {}
          var fg = scene.add.graphics().setDepth(9);
          fg.fillStyle(SC.tint, 0.4);
          fg.slice(OV.x, OV.y, OV.range, SC.a0, SC.a1, false); fg.fillPath();
          (function (fg2) {
            scene.tweens.add({ targets: fg2, alpha: 0, duration: 280, onComplete: function () { try { fg2.destroy(); } catch (e) {} } });
          })(fg);
          scene.cameras.main.shake(110, 0.005);
          try { AUDIO.play('voidhum'); } catch (e) {}
          if (alive) {
            var pd = Math.hypot(p.x - OV.x, p.y - OV.y);
            var pa = Math.atan2(p.y - OV.y, p.x - OV.x);
            if (pa < 0) pa += Math.PI * 2;
            var in0 = pa >= SC.a0 && pa < SC.a1;
            if (SC.a1 > Math.PI * 2) in0 = in0 || (pa + Math.PI * 2 < SC.a1);
            if (pd < OV.range && in0)
              Entities.hurtPlayer(scene, p, OV.dmg, time, 'the prismatic overload', true);
          }
        }
        if (allDone) {
          C.overload = null;
          var b = scene.boss;
          if (b && b.active) {
            b.boss.ventedUntil = time + OV.ventMs;
            b.boss.ventDmgMult = OV.ventDmgMult;
            b.boss.rootUntil = time + OV.ventMs;
            b.setTint(0x9a9a9a);                              // the core burns out grey
            (function (b2) {
              scene.time.delayedCall(OV.ventMs, function () { if (b2.active) b2.clearTint(); });
            })(b);
            scene.banner('THE CORE BURNS OUT GREY\nhe kneels, hollow — UNLOAD', '#f4f4f4');
            scene.burst(b.x, b.y, 26, 0xffffff);
          }
        }
      }

      // cosmetic rainbow-core glow follows the boss
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        if (!C.coreGlow) C.coreGlow = scene.add.circle(scene.boss.x, scene.boss.y, 8, 0xff7ab8, 0.8).setDepth(6);
        C.coreGlow.setPosition(scene.boss.x, scene.boss.y + 6);
        var hueIdx = scene.boss.boss.lockTint != null ? scene.boss.boss.lockTint : Math.floor(time / 450) % 5;
        C.coreGlow.fillColor = [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a][hueIdx];
      } else if (C.coreGlow) { try { C.coreGlow.destroy(); } catch (e) {} C.coreGlow = null; }

      CRY._wrap(scene);
      CRY._runZones(scene, time);
      CRY._runLanes(scene, time);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._cry; if (!C) return;
      if (C.grow.nextAt && C.grow.nextAt !== Infinity) C.grow.nextAt += dt;
      C.gates.forEach(function (g2) {
        ['warnUntil', 'crackAt', 'shatterAt'].forEach(function (k) { if (g2[k]) g2[k] += dt; });
      });
      C.bossWalls.forEach(function (BW) { BW.shatterAt += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.dust.forEach(function (D) { D.dieAt += dt; });
      if (C.slowUntil) C.slowUntil += dt;
      if (C.overload) C.overload.seq.forEach(function (S) { if (!S.fired) S.at += dt; });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['wakeAt', 'nextSlamAt', 'nextScreechAt', 'screechLockUntil', 'nextChargeAt',
         'lockUntil', 'chargeUntil', 'nextPulseAt', 'nextDustAt', 'nextSnipAt',
         'snipLockUntil', 'nextBeamAt', 'beamLockUntil'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
        if (m.mob.pound && m.mob.pound.until) m.mob.pound.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextColorAt', 'colorLockUntil', 'nextOverloadAt', 'busyUntil',
         'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._cry; if (!C) return;
      C.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record with the zone — a bulk-
        // cleared zone must not leave a stale entry in scene._zoneWarns
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      C.lanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} });
      C.rings = [];
      C.dust.forEach(function (D) { try { D.obj.destroy(); } catch (e) {} });
      C.dust = [];
    },

    // ---------------------------------------------- gate machinery ---------
    _gateWarn: function (scene, C, gate, time, cfg) {
      gate.state = 'warn';
      gate.warnUntil = time + cfg.warnMs;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(10, 0xff7ab8, 0.25);
      g.lineBetween(gate.mx - gate.nx * gate.span, gate.my - gate.ny * gate.span,
        gate.mx + gate.nx * gate.span, gate.my + gate.ny * gate.span);
      g.lineStyle(2, 0xffd0e8, 0.9);
      g.lineBetween(gate.mx - gate.nx * gate.span, gate.my - gate.ny * gate.span,
        gate.mx + gate.nx * gate.span, gate.my + gate.ny * gate.span);
      gate.warnG = g;
      try { AUDIO.play('crystalgrow'); } catch (e) {}
      scene.banner('GATE ' + gate.id + ' IS GROWING SHUT\nthe cave re-routes', '#ff7ab8');
    },
    _gateClose: function (scene, C, gate, time, cfg) {
      gate.state = 'closed';
      gate.cracked = false;
      if (gate.warnG) { try { gate.warnG.destroy(); } catch (e) {} gate.warnG = null; }
      gate.blocks.forEach(function (b2) { b2.setVisible(true); b2.body.enable = true; });
      gate.shard.setVisible(true).clearTint();
      gate.stain.setVisible(true);
      gate.shatterAt = time + cfg.wallMs * (0.8 + SIM.rng() * 0.4);
      gate.crackAt = gate.shatterAt - 700;
      scene.burst(gate.mx, gate.my, 12, 0xff7ab8);
      try { AUDIO.play('crystalgrow'); } catch (e) {}
    },
    _gateShatter: function (scene, C, gate, time, cfg) {
      gate.state = 'open';
      gate.blocks.forEach(function (b2) { b2.setVisible(false); b2.body.enable = false; });
      gate.shard.setVisible(false).clearTint();
      gate.stain.setVisible(false);
      scene.burst(gate.mx, gate.my, 20, 0xffd0e8);            // harmless sparkle
      try { AUDIO.play('shatterburst'); } catch (e) {}
      // brief damaging shard ring at the wall line (env — NOT fromBoss)
      CRY._zone(scene, gate.mx, gate.my, gate.span * 1.1, 250, cfg.shatterDmg,
        'shattering crystal', false, true, time);
    },

    // ================================================== BOSS ARRIVAL =======
    // Stalactite warnings rain dust → the chandeliers shudder → THE SHARDLORD
    // crashes down from the cavern dark, rises, core igniting color by color.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._cry, self = scene;
      var ax = C.arena.x, ay = C.arena.y;
      scene.player.setPosition(ax, ay + C.arena.ry - 40);
      scene.cameras.main.centerOn(ax, ay);
      // stalactite warn circles + dust
      STAL_WARNS.forEach(function (Q, i) {
        var qx = Q[0] * scene.worldW, qy = Q[1] * scene.worldH;
        var ring = scene.add.circle(qx, qy, 34, 0xa06bf0, 0.12).setStrokeStyle(2, 0xd8bcff, 0.8).setDepth(2);
        scene.tweens.add({ targets: ring, alpha: 0, delay: def.entranceMs * 0.5, duration: 300,
          onComplete: function () { try { ring.destroy(); } catch (e) {} } });
        scene.time.delayedCall(200 + i * 260, function () {
          self.burst(qx, qy, 6, 0x6e6484);
          try { AUDIO.play('staldrop'); } catch (e) {}
        });
      });
      // the chandeliers shudder
      C.chandeliers.forEach(function (spr, i) {
        scene.tweens.add({ targets: spr, angle: { from: -4, to: 4 }, duration: 120, yoyo: true,
          repeat: Math.floor(def.entranceMs / 260), delay: i * 90 });
      });
      scene.cameras.main.shake(def.entranceMs * 0.4, 0.004);
      scene.banner('THE MOUNTAIN SHUDDERS\ndust rains from the cavern dark', '#d8bcff');
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, ax, ay);
        if (self.boss) {
          var b = self.boss;
          b.setPosition(ax, ay - 300);
          b.setAlpha(0.9);
          self.tweens.add({ targets: b, y: ay, alpha: 1, duration: 360, ease: 'Quad.In',
            onComplete: function () {
              if (!b.active) return;
              self.cameras.main.shake(360, 0.014);
              self.burst(ax, ay, 30, 0x6e6484);
              try { AUDIO.play('crash'); } catch (e) {}
              // the core ignites color by color
              [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a].forEach(function (c, i) {
                self.time.delayedCall(180 + i * 160, function () {
                  if (!b.active) return;
                  b.setTint(c);
                  try { AUDIO.play('colorchime'); } catch (e) {}
                  if (i === 4) self.time.delayedCall(200, function () { if (b.active) b.clearTint(); });
                });
              });
            } });
        }
        C.bossArmed = true;
      });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive || !self.boss) return;
        self.showScouter(def);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, PT = bs.def.patterns, C = scene._cry;
      if (!bs._cryInit) {
        bs._cryInit = true;
        bs.colorIdx = -1; bs.lockTint = null;
        bs.nextColorAt = time + 3200;
        bs.nextOverloadAt = time + PT.prismaticOverload.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE CORE CYCLES FASTER\nthe mountain rages', '#ff7ab8');
      }
      var rate = bs.rateMult || 1;
      if (time < bs.rootUntil || C.overload) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 110) b.setVelocity(dx / d * spd, dy / d * spd);
        else b.setVelocity(0, 0);
      }
      // color-lock resolution: the locked color FIRES its verb
      if (bs.lockTint != null && time >= bs.colorLockUntil) {
        var idx = bs.lockTint;
        bs.lockTint = null;
        b.clearTint();
        CRY._fireColor(scene, b, player, time, idx);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextOverloadAt) {
        bs.nextOverloadAt = time + PT.prismaticOverload.everyMs * rate;
        CRY._overloadBegin(scene, b, time);
      } else if (time >= bs.nextColorAt && bs.lockTint == null) {
        bs.nextColorAt = time + PT.colorEveryMs * rate;
        bs.colorIdx = (bs.colorIdx + 1) % 5;
        bs.lockTint = bs.colorIdx;
        bs.colorLockUntil = time + PT.colorLockMs;
        b.setTint([0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a][bs.colorIdx]);
        bs.busyUntil = time + PT.colorLockMs;
        try { AUDIO.play('colorchime'); } catch (e) {}
      }
    },

    _fireColor: function (scene, b, player, time, idx) {
      var PT = b.boss.def.patterns;
      if (idx === 0) {                                        // 💗 PINK — SHARD VOLLEY
        var v = PT.shardVolley;
        for (var i = 0; i < v.count; i++) {
          var a = Math.PI * 2 * i / v.count + SIM.rng();
          var rr = (i === 0) ? 0 : SIM.rng() * v.scatter;
          CRY._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            v.radius, v.warnMs, v.dmg, 'the shard volley', true, true, time);
        }
      } else if (idx === 1) {                                 // 💠 CYAN — CRYSTAL LANCE
        var L = PT.crystalLance;
        var base = Math.atan2(player.y - b.y, player.x - b.x);
        for (var j = 0; j < L.count; j++) {
          var la = base + (j - (L.count - 1) / 2) * L.spreadRad;
          CRY._lane(scene, { x0: b.x, y0: b.y, x1: b.x + Math.cos(la) * L.len, y1: b.y + Math.sin(la) * L.len },
            L.half, L.warnMs + j * L.gapMs, L.dmg, 'the crystal lance', true, time, 0x5ae8e0);
        }
        b.boss.rootUntil = time + L.warnMs + L.count * L.gapMs;
      } else if (idx === 2) {                                 // 💜 PURPLE — GROWING WALLS
        var W2 = PT.growingWalls;
        for (var k = 0; k < W2.count; k++) {
          var wa = SIM.rng() * Math.PI;
          var wx = player.x + (SIM.rng() * 2 - 1) * 90, wy = player.y + (SIM.rng() * 2 - 1) * 90;
          CRY._bossWall(scene, wx, wy, wa, time, W2);
        }
        scene.cameras.main.shake(200, 0.008);
        try { AUDIO.play('crystalgrow'); } catch (e) {}
        scene.banner('GROWING WALLS\nthe arena re-routes you', '#a06bf0');
      } else if (idx === 3) {                                 // 🧡 AMBER — QUAKE FISTS
        var Q = PT.quakeFists;
        [0, 1].forEach(function (w) {
          var g = scene.add.graphics().setDepth(2);
          scene._cry.rings.push({ x: b.x, y: b.y, r: 30, r0: 30, maxR: Q.maxR,
            start: time + w * Q.gapMs, until: time + w * Q.gapMs + Q.growMs,
            dmg: Q.dmg, src: 'the quake fists', fromBoss: true, hit: false, g: g, tint: 0xffb84a });
        });
        b.boss.rootUntil = time + Q.gapMs + 400;
        scene.cameras.main.shake(250, 0.01);
        try { AUDIO.play('crash'); } catch (e) {}
      } else {                                                // 💚 GREEN — GEODE HATCH
        var H = PT.geodeHatch;
        var aliveM = 0;
        scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
        if (aliveM < H.cap) {
          for (var n = 0; n < H.count; n++) {
            var ha = SIM.rng() * Math.PI * 2;
            scene.queueSpawn({ key: 'shardling', bossWave: true,
              x: b.x + Math.cos(ha) * 170, y: b.y + Math.sin(ha) * 150 });
          }
          scene.banner('GEODE HATCH\nthe living geodes crack open', '#6ae87a');
        }
      }
    },
    _overloadBegin: function (scene, b, time) {
      var C = scene._cry, cfg = b.boss.def.patterns.prismaticOverload;
      if (C.overload) return;
      var TINTS = [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a];
      var base = SIM.rng() * Math.PI * 2;
      var seq = [];
      for (var i = 0; i < 5; i++) {
        var a0 = base + i * Math.PI * 2 / 5, a1 = a0 + Math.PI * 2 / 5;
        a0 = a0 % (Math.PI * 2); a1 = a0 + Math.PI * 2 / 5;
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(TINTS[i], 0.13); g.lineStyle(1, TINTS[i], 0.75);
        g.slice(b.x, b.y, cfg.range, a0, a1, false);
        g.fillPath(); g.strokePath();
        seq.push({ a0: a0, a1: a1, at: time + cfg.warnMs + i * cfg.gapMs, fired: false, g: g, tint: TINTS[i] });
      }
      C.overload = { x: b.x, y: b.y, range: cfg.range, seq: seq, dmg: cfg.dmg,
                     ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.warnMs + 5 * cfg.gapMs + 400;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('PRISMATIC OVERLOAD\nfive colors sweep in sequence — dance the wheel', '#ffd0e8');
      try { AUDIO.play('voidhum'); } catch (e) {}
    },
    _bossWall: function (scene, wx, wy, ang, time, cfg) {
      var C = scene._cry;
      var nx = Math.cos(ang), ny = Math.sin(ang);
      var blocks = [];
      for (var i = -2; i <= 2; i++) {
        var bx = wx + nx * 30 * i, by = wy + ny * 30 * i;
        var r2 = scene.add.rectangle(bx, by, 26, 26, 0xa06bf0, 0.75).setDepth(3);
        C.wallGroup.add(r2);
        blocks.push(r2);
      }
      var shardSpr = scene.add.sprite(wx, wy, 'kdWall').setScale(1.6).setDepth(3.2).setTint(0xd8bcff);
      shardSpr.setRotation(ang + Math.PI / 2);
      C.bossWalls.push({ mx: wx, my: wy, blocks: blocks, shard: shardSpr, shatterAt: time + cfg.wallMs });
    },
    _clearBossWalls: function (scene, C) {
      C.bossWalls.forEach(function (BW) {
        BW.blocks.forEach(function (b2) { b2.body.enable = false; try { b2.destroy(); } catch (e) {} });
        try { BW.shard.destroy(); } catch (e) {}
      });
      C.bossWalls = [];
    },
    // M7k AUDIT fix: nulling C.overload alone leaked the unfired sector warn
    // graphics (SC.g) — destroy them with it.
    _clearOverload: function (C) {
      if (!C.overload) return;
      C.overload.seq.forEach(function (SC) {
        if (!SC.fired && SC.g) { try { SC.g.destroy(); } catch (e) {} }
      });
      C.overload = null;
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: the Shardlord killed MID-VERB (rooted overload, grown
    // walls, color lock) left telegraph graphics painted. Central onBossDown
    // hook — same teardown the update() armed rule performs, but immediate.
    bossCleanup: function (scene, boss) {
      var C = scene._cry; if (!C) return;
      CRY._clearOverload(C);
      CRY._clearBossWalls(scene, C);
      if (C.coreGlow) { try { C.coreGlow.destroy(); } catch (e) {} C.coreGlow = null; }
      C.bossArmed = false;
    },

    // =============================================== MOB VERBS (map-new) ===
    // AMETHYST LURKER — disguised as a cluster; shimmer warn → wake.
    _lurker: function (scene, m, player, time) {
      var cfg = m.mob.def.lurk;
      if (m.mob.awake) return false;                          // core chase + lunge
      m.setVelocity(0, 0);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.wakeAt) {
        if (d < cfg.wakeRange && player.state.alive) {
          m.mob.wakeAt = time + cfg.warnMs;
          try { AUDIO.play('colorchime'); } catch (e) {}
        }
        return true;
      }
      m.setTint(Math.floor(time / 120) % 2 === 0 ? 0xd8bcff : 0xffffff);   // the shimmer tell
      if (time >= m.mob.wakeAt) {
        m.mob.awake = true;
        m.clearTint();
        scene.burst(m.x, m.y, 10, 0xa06bf0);
      }
      return true;
    },
    // GEODE GOLEM — warned slam; the exposed core takes BONUS damage from behind.
    _golem: function (scene, m, player, time) {
      var cfg = m.mob.def.pound;
      // core-hit detection: hp drop while the player stands BEHIND his facing
      if (m.mob._coreHp === undefined) m.mob._coreHp = m.mob.hp;
      if (m.mob.hp < m.mob._coreHp) {
        var taken = m.mob._coreHp - m.mob.hp;
        var vx = m.body.velocity.x, vy = m.body.velocity.y;
        var vm = Math.hypot(vx, vy);
        if (vm > 4) {
          var pdx = player.x - m.x, pdy = player.y - m.y, pd = Math.hypot(pdx, pdy) || 1;
          if ((vx * pdx + vy * pdy) / (vm * pd) < -0.3) {     // hit from behind
            var bonus = Math.floor(taken * 0.5);
            if (bonus > 0) {
              m.mob.hp -= bonus;
              scene.damageNumber(m.x, m.y - 26, 'CORE ' + bonus, '#ff7ab8');
              if (m.mob.hp <= 0) { scene.killMobCredited(m); m.mob._coreHp = 0; return true; }
            }
          }
        }
      }
      m.mob._coreHp = m.mob.hp;
      if (m.mob.pound) {
        m.setVelocity(0, 0);
        if (time >= m.mob.pound.until) m.mob.pound = null;
        return true;
      }
      if (!m.mob.nextSlamAt) m.mob.nextSlamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSlamAt && d < cfg.range) {
        m.mob.nextSlamAt = time + cfg.everyMs;
        m.mob.pound = { until: time + cfg.warnMs };
        CRY._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Geode Golem's slam", false, false, time);
        try { AUDIO.play('crash'); } catch (e) {}
        return true;
      }
      return false;
    },
    // SHATTERBAT — swoops (core lunge); telegraphed SCREECH CONE that slows.
    _bat: function (scene, m, player, time) {
      var cfg = m.mob.def.screech, C = scene._cry;
      if (m.mob.screechLockUntil && time < m.mob.screechLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextScreechAt) m.mob.nextScreechAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextScreechAt && d < cfg.range && player.state.alive) {
        m.mob.nextScreechAt = time + cfg.everyMs;
        m.mob.screechLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x5ae8e0, 0.13); g.lineStyle(2, 0xccfffa, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!player.state.alive || !m.active) return;       // M7k AUDIT fix: dead-caster guard
          try { AUDIO.play('batscreech'); } catch (e) {}
          var pd = Math.hypot(player.x - mx, player.y - my);
          var pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Shatterbat's screech");
            C.slowUntil = self.time.now + cfg.slowMs;
            self.damageNumber(player.x, player.y - 24, 'DAZED', '#5ae8e0');
          }
        });
        return true;
      }
      return false;                                           // core chase + lunge swoops
    },
    // QUARTZ RAM — warned lane, head down, CHARGES (wrap carries him).
    _ram: function (scene, m, player, time) {
      var cfg = m.mob.def.charge;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
        return true;
      }
      if (m.mob.lockUntil) {
        if (time >= m.mob.lockUntil) {
          m.mob.lockUntil = 0;
          if (m.mob._laneG) { try { m.mob._laneG.destroy(); } catch (e) {} m.mob._laneG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.speed, Math.sin(m.mob._chargeAng) * cfg.speed);
          try { AUDIO.play('ramclatter'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextChargeAt) m.mob.nextChargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextChargeAt && d < cfg.range && player.state.alive) {
        m.mob.nextChargeAt = time + cfg.everyMs;
        m.mob.lockUntil = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.lineStyle(cfg.half * 2, 0xff7ab8, 0.14);
        g.lineBetween(m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len);
        g.lineStyle(2, 0xffd0e8, 0.85);
        g.lineBetween(m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len);
        m.mob._laneG = g;
        return true;
      }
      return false;
    },
    // RESONATOR — plants; pulses expanding rings (hop between them).
    _resonator: function (scene, m, player, time) {
      var cfg = m.mob.def.pulse, C = scene._cry;
      m.setVelocity(0, 0);
      if (!m.mob.nextPulseAt) m.mob.nextPulseAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextPulseAt && d < cfg.range && player.state.alive) {
        m.mob.nextPulseAt = time + cfg.everyMs;
        var g = scene.add.graphics().setDepth(2);
        C.rings.push({ x: m.x, y: m.y, r: 16, r0: 16, maxR: cfg.maxR, start: time,
          until: time + cfg.growMs, dmg: cfg.dmg, src: "a Resonator's pulse",
          fromBoss: false, hit: false, g: g, tint: 0x5ae8e0 });
        m.setTint(0xccfffa);
        var self = scene;
        scene.time.delayedCall(260, function () { if (m.active) m.clearTint(); });
        try { AUDIO.play('resonring'); } catch (e) {}
      }
      return true;                                            // rooted forever
    },
    // GEMWING MOTH — drifts; sheds glitter-dust slow patches.
    _moth: function (scene, m, player, time) {
      var cfg = m.mob.def.dust, C = scene._cry;
      if (!m.mob.nextDustAt) m.mob.nextDustAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextDustAt) {
        m.mob.nextDustAt = time + cfg.everyMs;
        if (C.dust.length < 24) {
          var obj = scene.add.circle(m.x, m.y, cfg.radius, 0xffd0e8, 0.22).setDepth(1.2);
          C.dust.push({ x: m.x, y: m.y, r: cfg.radius, dieAt: time + cfg.lifeMs, obj: obj });
        }
      }
      return false;                                           // core chase drifts her
    },
    // DEEP CRAWLER — telegraphed double-pincer snip cone.
    _crawler: function (scene, m, player, time) {
      var cfg = m.mob.def.snip;
      if (m.mob.snipLockUntil && time < m.mob.snipLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextSnipAt) m.mob.nextSnipAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSnipAt && d < cfg.range && player.state.alive) {
        m.mob.nextSnipAt = time + cfg.everyMs;
        m.mob.snipLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0xa06bf0, 0.14); g.lineStyle(2, 0xd8bcff, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!player.state.alive || !m.active) return;       // M7k AUDIT fix: dead-caster guard
          var pd = Math.hypot(player.x - mx, player.y - my);
          var pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Deep Crawler's pincers");
        });
        return true;
      }
      return false;
    },
    // VOIDGEM HORROR — elite; short warned void-beam sweeps.
    _horrorBeam: function (scene, m, player, time) {
      var cfg = m.mob.def.beam;
      if (m.mob.beamLockUntil && time < m.mob.beamLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextBeamAt) m.mob.nextBeamAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextBeamAt && d < cfg.range && player.state.alive) {
        m.mob.nextBeamAt = time + cfg.everyMs;
        m.mob.beamLockUntil = time + cfg.warnMs + cfg.gapMs;
        var base = Math.atan2(player.y - m.y, player.x - m.x);
        for (var i = 0; i < 2; i++) {
          var a = base + (i - 0.5) * cfg.stepRad;
          CRY._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len },
            cfg.half, cfg.warnMs + i * cfg.gapMs, cfg.dmg, "a Voidgem Horror's beam", false, time, 0x5c48a0);
        }
        try { AUDIO.play('voidhum'); } catch (e) {}
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

    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time) {
      var C = scene._cry;
      var tint = fromBoss ? 0xff7ab8 : 0xd8bcff;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._cry;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xff7ab8 : 0xd8bcff);
        scene.cameras.main.shake(90, 0.004);
        try { AUDIO.play('crash'); } catch (e) {}
        if (scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.killMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m);
          });
        }
      }
    },
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint) {
      var C = scene._cry;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      C.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint });
    },
    _runLanes: function (scene, time) {
      var C = scene._cry;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(110, 0.005);
        try { AUDIO.play('crash'); } catch (e) {}
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.def !== DATA.mobs.voidgemHorror &&
              dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CRY;
  root.CRYSTAL_SCENE = CRY;
})(typeof window !== 'undefined' ? window : this);
