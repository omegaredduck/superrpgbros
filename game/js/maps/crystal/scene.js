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

  // ---------- SPIRAL REDESIGN (M9e — Red-approved plan) --------------------
  // The whole map is walkable crystal-cavern floor (approved tiles, no dead
  // rock, no narrow paths). An AMETHYST road fills everything; a CRYSTALLIZED
  // spiral winds from the centre out to a 90° "stove-eye" tail that exits the
  // LEFT edge (= spawn). The five other tiles sit as circles in the corners.
  // A destructible BIG CRYSTAL (#20 grand-rainbow) sits at the centre; small
  // crystals ride the spiral. See CRY._bigBlast / _damageCrystal for the mechanic.
  var BIOME_CIRCLES = [
    { x: 0.18, y: 0.16, r: 0.20, tex: 'kmoss' },      // GLOW MOSS — garden (moths/resonators)
    { x: 0.82, y: 0.18, r: 0.24, tex: 'kobsidian' },  // OBSIDIAN — boss arena side (horror)
    { x: 0.13, y: 0.55, r: 0.16, tex: 'kgeode' },     // GEODE CRUST — den (lurkers)
    { x: 0.24, y: 0.86, r: 0.20, tex: 'ksand' },      // GLITTER SAND
    { x: 0.83, y: 0.82, r: 0.20, tex: 'kwater' }      // CAVE WATER — cosmetic, walkable
  ];
  // extra SMALL exploding crystals scattered THROUGHOUT the map (+ the 6 on the
  // spiral). Kept clear of the centre so they never overlap the big crystal.
  var SCATTER = [
    [0.30, 0.10], [0.10, 0.30], [0.24, 0.24],
    [0.82, 0.12], [0.92, 0.30], [0.70, 0.22],
    [0.09, 0.55], [0.20, 0.64], [0.16, 0.44],
    [0.18, 0.88], [0.34, 0.92], [0.10, 0.78],
    [0.84, 0.82], [0.92, 0.66], [0.72, 0.90], [0.62, 0.62]
  ];
  // [tex, x, y, scale, destructible?] — the crystalline decor (true) is a
  // DESTRUCTIBLE crystal bomb (shatters + AoE + respawns); the rest is scenery.
  var DECOR = [
    ['kdCluster', 0.18, 0.14, 1.7, true], ['kdShrooms', 0.24, 0.2, 1.4], ['kdFlowers', 0.12, 0.18, 1.3, true],
    ['kdFissure', 0.82, 0.14, 1.6], ['kdStalag', 0.9, 0.22, 1.3],
    ['kdGeode', 0.11, 0.55, 1.5, true], ['kdPedestal', 0.17, 0.6, 1.3],
    ['kdCart', 0.2, 0.9, 1.4], ['kdLantern', 0.3, 0.82, 1.3],
    ['kdFossil', 0.86, 0.86, 1.4], ['kdPool', 0.78, 0.78, 1.4],
    ['kdPillar', 0.72, 0.5, 1.5, true], ['kdVein', 0.28, 0.5, 1.3, true],
    ['kdCluster', 0.62, 0.72, 1.5, true], ['kdSinging', 0.4, 0.3, 1.4, true]
  ];
  var CHANDELIERS = [[0.44, 0.42], [0.5, 0.4], [0.56, 0.42]];  // over the central arena
  var STAL_WARNS = [[0.45, 0.46], [0.55, 0.46], [0.5, 0.55]];  // entrance dust marks

  // Archimedean spiral: centre -> outward -> 90° tail off the LEFT edge.
  // Returns world-space centreline, the ribbon polygon (for the tile mask),
  // small-crystal seats, and the spawn point at the road mouth. PURE — testable.
  function buildSpiral(WW, HH) {
    var cx = WW / 2, cy = HH / 2;
    var k = 0.0162 * WW, r0 = 0.01 * WW;
    var thEnd = 4 * Math.PI * 2 + Math.PI;                 // outer coil ends pointing LEFT
    var center = [], hw = [], nSpiral = 0, th;
    for (th = 0.3; th <= thEnd + 1e-6; th += 0.06) {
      var r = r0 + k * th;
      center.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th) });
      hw.push(Math.max(0.02 * WW, r * 0.045));
    }
    nSpiral = center.length;
    var tip = center[nSpiral - 1], tipHw = hw[nSpiral - 1];
    for (var tx = tip.x - 4; tx >= -0.06 * WW; tx -= 0.02 * WW) { center.push({ x: tx, y: tip.y }); hw.push(tipHw); }
    // ribbon outline (right edge out, then left edge back)
    var right = [], left = [];
    for (var i = 0; i < center.length; i++) {
      var a = center[Math.max(0, i - 1)], b = center[Math.min(center.length - 1, i + 1)];
      var tX = b.x - a.x, tY = b.y - a.y, tl = Math.hypot(tX, tY) || 1;
      var nX = -tY / tl, nY = tX / tl;
      right.push({ x: center[i].x + nX * hw[i], y: center[i].y + nY * hw[i] });
      left.push({ x: center[i].x - nX * hw[i], y: center[i].y - nY * hw[i] });
    }
    var poly = right.concat(left.reverse());
    // small crystals seat on the coils (outer -> inner), off the tail + centre
    var smalls = [], N = 6;
    for (var s = 0; s < N; s++) {
      var idx = Math.floor((0.18 + 0.74 * s / (N - 1)) * (nSpiral - 1));
      smalls.push({ x: center[idx].x, y: center[idx].y });
    }
    return { cx: cx, cy: cy, center: center, poly: poly, smalls: smalls,
             spawn: { x: 0.03 * WW, y: tip.y } };
  }

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var CRY = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var cx = WW / 2, cy = HH / 2, PAD = 0.11 * WW;
      var C = scene._cry = {
        gates: [], grow: { nextAt: Infinity }, minOpen: 2,
        rings: [], dust: [], zones: [], lanes: [],
        slowUntil: 0, overload: null, bossWalls: [],
        coreGlow: null, circles: [], crystals: [], bigGlow: null, chandeliers: [],
        arena: { x: cx, y: cy, rx: 0.14 * WW, ry: 0.14 * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- FULL-BLEED FLOOR: amethyst road fills the whole map (no dead rock) ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'kamethyst').setDepth(-24);
      // the five other tiles as CIRCLES in the corners (all walkable)
      BIOME_CIRCLES.forEach(function (B) {
        var bx = B.x * WW, by = B.y * HH, br = B.r * WW;
        var spr = scene.add.tileSprite(bx, by, br * 2 + 8, br * 2 + 8, B.tex).setDepth(-23);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillCircle(bx, by, br);
        spr.setMask(mg.createGeometryMask());
        C.circles.push({ x: bx, y: by, r: br, tex: B.tex });
      });
      // centre teal pad (crystal floor) under the big crystal
      var pad = scene.add.tileSprite(cx, cy, PAD * 2 + 8, PAD * 2 + 8, 'kcrystal').setDepth(-22);
      var pmg = scene.make.graphics({ add: false });
      pmg.fillStyle(0xffffff, 1); pmg.fillCircle(cx, cy, PAD);
      pad.setMask(pmg.createGeometryMask());
      // ---- the SPIRAL ROAD (crystallized tile), centre -> left-edge tail ----
      var SP = buildSpiral(WW, HH);
      C.spiral = SP;
      var road = scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'kgrown').setDepth(-21);
      var smg = scene.make.graphics({ add: false });
      smg.fillStyle(0xffffff, 1); smg.fillPoints(SP.poly, true);
      road.setMask(smg.createGeometryMask());
      // bright sheen along the spiral centreline
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(2, 0xffc0e0, 0.5);
      rg.beginPath(); rg.moveTo(SP.center[0].x, SP.center[0].y);
      for (var ci = 1; ci < SP.center.length; ci++) rg.lineTo(SP.center[ci].x, SP.center[ci].y);
      rg.strokePath();

      // chandeliers (ceiling props over the arena — not destructible)
      CHANDELIERS.forEach(function (Q) {
        var spr = scene.add.sprite(Q[0] * WW, Q[1] * HH, 'kdChand').setScale(1.6).setDepth(3);
        C.chandeliers.push(spr);
      });

      // wallGroup kept for the boss's GROWING WALLS (built in setup, wired later)
      C.wallGroup = scene.physics.add.staticGroup();

      // ---- CRYSTAL BOMB: big centre crystal + many small crystals (all respawn) ----
      C.crystalGroup = scene.physics.add.staticGroup();
      C.smallActive = true; C.bigActive = true;
      CRY._spawnBig(scene, cx, cy);                          // big crystal + pulsating glow
      SP.smalls.forEach(function (pos) { CRY._spawnSmall(scene, pos.x, pos.y); });  // on the spiral
      SCATTER.forEach(function (q) { CRY._spawnSmall(scene, q[0] * WW, q[1] * HH); });  // throughout
      // EVERY decoration on this map is a destructible exploding crystal too
      DECOR.forEach(function (D) { CRY._spawnDecorCrystal(scene, D[1] * WW, D[2] * HH, D[0], D[3]); });

      // ---- spawn at the road mouth (just inside the left edge) ----
      scene._realmStart = { x: SP.spawn.x, y: SP.spawn.y };

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
      // CRYSTAL BOMB: crystals are solid cover; player shots chip them.
      C.crystalColliderP = scene.physics.add.collider(scene.player, C.crystalGroup);
      C.crystalColliderM = scene.physics.add.collider(scene.mobs, C.crystalGroup);
      if (scene.playerShots) scene.physics.add.overlap(scene.playerShots, C.crystalGroup,
        function (shot, spr) { CRY._hitCrystal(scene, shot, spr); }, null, scene);
    },

    // whole map is walkable crystal-cavern floor now — no crush-slow, no water hazard
    _inCave: function () { return true; },
    _inWater: function () { return false; },

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

      // ---- CRYSTAL BOMB: pulsating rainbow glow hue-cycles; melee-smash on touch ----
      if (C.bigGlow && C.bigGlow.active)
        C.bigGlow.fillColor = [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a][Math.floor(time / 380) % 5];
      if (alive && !scene.scanning) {
        var bcfg = scene.realmDef.bomb || {};
        for (var qi = 0; qi < C.crystals.length; qi++) {
          var rec = C.crystals[qi];
          if (rec.dead || !rec.spr.active) continue;
          var reach = rec.spr.displayWidth * 0.42 + 15;       // a bump/punch chips it
          if (Math.hypot(p.x - rec.spr.x, p.y - rec.spr.y) < reach &&
              time - rec.lastSmashAt > (bcfg.smashMs || 320)) {
            rec.lastSmashAt = time;
            CRY._damageCrystal(scene, rec, bcfg.smashDmg || 5, time);
          }
        }
      }

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
      CRY._bossCrackBig(scene);                              // the Shardlord CRACKS the heart open (animated → map blast)
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

    // ================================================ CRYSTAL BOMB =========
    // Destructible crystals (fence lineage): a player shot / bump chips HP,
    // the sprite steps through shattered frames, then it BLOWS. The big centre
    // crystal WIPES every mob (NO kill credit — direct removal, not damage) +
    // map-wide blasts + hard shake; small crystals do a local AoE.
    _hitCrystal: function (scene, shot, spr) {
      if (!shot.active || !spr.active || !shot.proj || shot.proj._hitCrystal) return;
      shot.proj._hitCrystal = true; shot.proj.dieAt = 0;      // the shot dies on the crystal
      var C = scene._cry, rec = null;
      for (var i = 0; i < C.crystals.length; i++) if (C.crystals[i].spr === spr) { rec = C.crystals[i]; break; }
      if (rec) CRY._damageCrystal(scene, rec, shot.proj.dmg || 8, scene.time.now);
    },
    _damageCrystal: function (scene, rec, dmg, time) {
      if (rec.dead || !rec.spr.active) return;
      rec.hp -= dmg;
      scene.burst(rec.spr.x, rec.spr.y - rec.spr.displayHeight * 0.2, 4, rec.big ? 0xff7ab8 : 0x5ae8e0);
      rec.spr.setTintFill(0xffffff);                         // per-hit flash
      (function (s) { scene.time.delayedCall(55, function () { if (s && s.active) s.clearTint(); }); })(rec.spr);
      try { AUDIO.play('shatterburst'); } catch (e) {}
      if (rec.hp <= 0) { CRY._breakCrystal(scene, rec, time); return; }
      var frac = rec.hp / rec.maxHp, fam = rec.frames, idx;      // step damage frames (single-frame decor: no swap)
      if (fam.length === 4) idx = frac > 0.66 ? 0 : frac > 0.4 ? 1 : frac > 0.15 ? 2 : 3;
      else if (fam.length === 3) idx = frac > 0.6 ? 0 : frac > 0.3 ? 1 : 2;
      else idx = 0;
      if (fam[idx] && scene.textures.exists(fam[idx]) && rec.spr.texture.key !== fam[idx]) rec.spr.setTexture(fam[idx]);
    },
    // generic SHATTER animation — squash-fade of the sprite + shard bits flung
    // outward. Works for any texture, so decor with no damage-frame art still
    // breaks apart with an animation.
    _shatterAnim: function (scene, x, y, tex, scale, tint) {
      if (scene.textures.exists(tex)) {
        var s = scene.add.sprite(x, y, tex).setScale(scale).setDepth(8).setTintFill(0xffffff);
        scene.tweens.add({ targets: s, scaleX: scale * 1.5, scaleY: scale * 0.55, angle: 30, alpha: 0,
          duration: 230, ease: 'Quad.easeOut', onComplete: function () { try { s.destroy(); } catch (e) {} } });
      }
      for (var i = 0; i < 6; i++) {
        (function (n) {
          var a = (n / 6) * Math.PI * 2 + SIM.rng();
          var sh = scene.add.rectangle(x, y, 6, 6, tint, 0.9).setDepth(8).setAngle(SIM.rng() * 360);
          scene.tweens.add({ targets: sh, x: x + Math.cos(a) * (28 + SIM.rng() * 34), y: y + Math.sin(a) * (28 + SIM.rng() * 34),
            alpha: 0, angle: sh.angle + 200, duration: 320, ease: 'Quad.easeOut',
            onComplete: function () { try { sh.destroy(); } catch (e) {} } });
        })(i);
      }
    },
    _breakCrystal: function (scene, rec, time) {
      rec.dead = true;
      var x = rec.spr.x, y = rec.spr.y, C = scene._cry, bomb = scene.realmDef.bomb || {};
      try { rec.spr.body.enable = false; } catch (e) {}
      try { rec.spr.destroy(); } catch (e) {}
      if (rec.big) {
        if (C.bigGlow) { try { C.bigGlow.destroy(); } catch (e) {} C.bigGlow = null; }
        CRY._bigBlast(scene, x, y, time);
        if (C.bigActive) scene.time.delayedCall(bomb.bigRespawnMs || 18000, function () {
          if (scene.closing || !scene._cry || !scene._cry.bigActive || !rec.dead) return;
          var b = scene._cry.crystalGroup.create(rec.homeX, rec.homeY, rec.tex).setDepth(3).setScale(rec.scale);
          b.refreshBody();
          rec.spr = b; rec.hp = rec.maxHp; rec.dead = false; rec.lastSmashAt = 0;
          CRY._makeBigGlow(scene, rec.homeX, rec.homeY);
          scene.burst(rec.homeX, rec.homeY, 16, 0xff7ab8);
          try { AUDIO.play('crystalgrow'); } catch (e) {}
        });
      } else {
        CRY._shatterAnim(scene, x, y, rec.tex, rec.scale, rec.decor ? 0xd8bcff : 0x5ae8e0);  // break animation
        CRY._boom(scene, x, y, bomb.boomSize || 3.0, 0x5ae8e0);   // TRIPLE-size explosion
        var R = bomb.aoeR || 450, D = bomb.aoeDmg || 55;          // TRIPLE radius
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && Math.hypot(m.x - x, m.y - y) < R) Entities.hurtMob(scene, m, D, time);
        });
        scene.cameras.main.shake(300, 0.012);
        // blown up BESIDE the boss → STUN him for stunMs
        var bo = scene.boss, sR = bomb.stunR || 200;
        if (bo && bo.active && bo.boss && Math.hypot(bo.x - x, bo.y - y) < sR) {
          var st = bomb.stunMs || 1000;
          bo.boss.rootUntil = Math.max(bo.boss.rootUntil || 0, time + st);
          bo.boss.busyUntil = Math.max(bo.boss.busyUntil || 0, time + st);
          var fx = scene.add.circle(bo.x, bo.y, 42, 0xffffff, 0.5).setDepth(10).setBlendMode(Phaser.BlendModes.ADD);
          scene.tweens.add({ targets: fx, alpha: 0, scale: 1.7, duration: st,
            onComplete: function () { try { fx.destroy(); } catch (e) {} } });
          try { scene.damageNumber(bo.x, bo.y - 44, 'STUNNED', '#ffd0e8'); } catch (e) {}
          scene.burst(bo.x, bo.y, 16, 0x5ae8e0);
        }
        if (C.smallActive) scene.time.delayedCall(bomb.respawnMs || 9000, function () {
          if (scene.closing || !scene._cry || !scene._cry.smallActive || !rec.dead) return;
          var sm = scene._cry.crystalGroup.create(rec.homeX, rec.homeY, rec.tex).setDepth(rec.decor ? 2 : 3).setScale(rec.scale);
          sm.refreshBody();
          rec.spr = sm; rec.hp = rec.maxHp; rec.dead = false; rec.lastSmashAt = 0;
          scene.burst(rec.homeX, rec.homeY, 8, 0x5ae8e0);
          try { AUDIO.play('crystalgrow'); } catch (e) {}
        });
      }
    },
    // ---- spawners (initial place + respawn share these) ----
    _makeBigGlow: function (scene, x, y) {
      var C = scene._cry;
      C.bigGlow = scene.add.circle(x, y - 6, 0.05 * scene.worldW, 0xff7ab8, 0.5).setDepth(2)
        .setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({ targets: C.bigGlow, scale: { from: 0.75, to: 1.4 }, alpha: { from: 0.32, to: 0.6 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    },
    _spawnBig: function (scene, x, y) {
      var C = scene._cry, bomb = scene.realmDef.bomb || {};
      var b = C.crystalGroup.create(x, y, 'kCrystalBig0').setDepth(3).setScale(1.5); b.refreshBody();
      C.crystals.push({ spr: b, hp: bomb.bigHp || 300, maxHp: bomb.bigHp || 300, big: true, lastSmashAt: 0,
        homeX: x, homeY: y, tex: 'kCrystalBig0', scale: 1.5,
        frames: ['kCrystalBig0', 'kCrystalBig1', 'kCrystalBig2', 'kCrystalBig3'], dead: false });
      CRY._makeBigGlow(scene, x, y);
    },
    _spawnSmall: function (scene, x, y) {
      var C = scene._cry, bomb = scene.realmDef.bomb || {};
      var sm = C.crystalGroup.create(x, y, 'kCrystalSm0').setDepth(3).setScale(1.15); sm.refreshBody();
      C.crystals.push({ spr: sm, hp: bomb.smallHp || 40, maxHp: bomb.smallHp || 40, big: false, lastSmashAt: 0,
        homeX: x, homeY: y, tex: 'kCrystalSm0', scale: 1.15,
        frames: ['kCrystalSm0', 'kCrystalSm1', 'kCrystalSm2'], dead: false });
    },
    // every DECOR piece on this map is a destructible bomb (shatter anim + AoE)
    _spawnDecorCrystal: function (scene, x, y, tex, scale) {
      var C = scene._cry, bomb = scene.realmDef.bomb || {}, hp = bomb.smallHp || 40;
      var sp = C.crystalGroup.create(x, y, tex).setDepth(2).setScale(scale); sp.refreshBody();
      C.crystals.push({ spr: sp, hp: hp, maxHp: hp, big: false, decor: true, lastSmashAt: 0,
        homeX: x, homeY: y, tex: tex, scale: scale, frames: [tex], dead: false });
    },
    // ---- THE BOSS CRACKS THE HEART: his entrance shatters the big crystal ----
    // (animated frame-by-frame crack + shakes → the map-wide blast + mob wipe).
    // Small + decor crystals KEEP respawning through the fight (smallActive stays on).
    _bossCrackBig: function (scene) {
      var C = scene._cry; if (!C) return;
      C.bigActive = false;                                   // the big crystal won't respawn
      var big = null;
      for (var i = 0; i < C.crystals.length; i++) if (C.crystals[i].big && !C.crystals[i].dead) { big = C.crystals[i]; break; }
      if (big && big.spr && big.spr.active) {
        var spr = big.spr, TIN = [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a];
        for (var k = 0; k < 4; k++) {
          (function (kk) {
            scene.time.delayedCall(kk * 230, function () {
              if (!spr.active) return;
              if (scene.textures.exists(big.frames[kk])) spr.setTexture(big.frames[kk]);
              scene.burst(spr.x, spr.y - spr.displayHeight * 0.2, 9, TIN[kk]);
              scene.cameras.main.shake(200, 0.008 + kk * 0.003);
              try { AUDIO.play('shatterburst'); } catch (e) {}
            });
          })(k);
        }
        scene.time.delayedCall(4 * 230 + 60, function () {
          if (!big.dead && big.spr && big.spr.active) CRY._damageCrystal(scene, big, big.maxHp + 9999, scene.time.now);
        });
      } else {
        CRY._crystalWipe(scene);                             // already gone — still clear the field
      }
    },
    clearCrystals: function (scene) {
      var C = scene._cry; if (!C || !C.crystals) return;
      C.smallActive = false; C.bigActive = false;
      C.crystals.forEach(function (rec) {
        if (rec.dead) return;
        rec.dead = true;
        try { rec.spr.body.enable = false; rec.spr.destroy(); } catch (e) {}
      });
      if (C.bigGlow) { try { C.bigGlow.destroy(); } catch (e) {} C.bigGlow = null; }
    },
    _boom: function (scene, x, y, size, tint) {
      var flash = scene.add.circle(x, y, 10 * size, 0xffffff, 0.9).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({ targets: flash, scale: 6 * size, alpha: 0, duration: 360,
        onComplete: function () { try { flash.destroy(); } catch (e) {} } });
      var ring = scene.add.circle(x, y, 8 * size, tint, 0.5).setDepth(9);
      scene.tweens.add({ targets: ring, scale: 9 * size, alpha: 0, duration: 430,
        onComplete: function () { try { ring.destroy(); } catch (e) {} } });
      scene.burst(x, y, Math.floor(16 * size), tint);
      scene.burst(x, y, Math.floor(10 * size), 0xffd0e8);
      try { AUDIO.play('shatterburst'); } catch (e) {}
    },
    _bigBlast: function (scene, x, y, time) {
      var WW = scene.worldW, HH = scene.worldH;
      scene.cameras.main.shake(1000, 0.02);
      scene.banner('THE HEART SHATTERS\nthe cavern erupts', '#ff7ab8');
      CRY._boom(scene, x, y, 3.2, 0xff7ab8);                  // central mega-boom
      var TINTS = [0xff7ab8, 0x5ae8e0, 0xa06bf0, 0xffb84a, 0x6ae87a];
      for (var i = 0; i < 22; i++) {                          // map-wide chain over ~1.3s
        (function (n) {
          scene.time.delayedCall(80 + n * 55, function () {
            if (scene.closing) return;
            var bx = 40 + SIM.rng() * (WW - 80), by = 40 + SIM.rng() * (HH - 80);
            CRY._boom(scene, bx, by, 0.9 + SIM.rng() * 0.9, TINTS[n % 5]);
            scene.cameras.main.shake(130, 0.012);
          });
        })(i);
      }
      CRY._crystalWipe(scene);                                // WIPE all mobs — NO kill credit
    },
    _crystalWipe: function (scene) {
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        scene.burst(m.x, m.y, 10, (m.mob.def && m.mob.def.deathTint) || 0xffd0e8);
        try { Entities.clearNameTag(m); } catch (e) {}
        if (m.mob.auraSpr) { try { m.mob.auraSpr.destroy(); } catch (e) {} m.mob.auraSpr = null; }
        if (m.mob.flameRing) { try { m.mob.flameRing.destroy(); } catch (e) {} m.mob.flameRing = null; }
        try { m.body.enable = false; } catch (e) {}
        scene.mobs.killAndHide(m);
      });
    },
    clearCrystals: function (scene) {
      var C = scene._cry; if (!C || !C.crystals) return;
      C.crystals.forEach(function (rec) {
        if (rec.dead) return;
        rec.dead = true;
        try { rec.spr.body.enable = false; rec.spr.destroy(); } catch (e) {}
      });
      if (C.bigGlow) { try { C.bigGlow.destroy(); } catch (e) {} C.bigGlow = null; }
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
