// ============================================================================
// game/js/maps/pyramid/scene.js — PYRAMID PLUNDER scene hooks (M7 registry).
// The scene-plan PNG (assets/pyramid_scene_plan.png) is canon: expedition camp
// (spawn, S) → brazier-lit CAUSEWAY spine → necropolis (W) / oasis (E) /
// dunes (SW-SE) / temple court (N) → THE BURIAL CHAMBER (boss arena, N center).
// TREASURE & CURSE is the signature loop: looting pays (XP + haste) and angers
// the tomb (traps arm → curse DoT → retaliation waves). NEFERU-KA is the
// game's first REGISTRY two-phase boss (def.transform → bossTransform hook).
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var FLOORS = [
    { x0: 0.05, y0: 0.3, x1: 0.38, y1: 0.62, tex: 'pytombdark' },   // NECROPOLIS
    { x0: 0.2, y0: 0.14, x1: 0.8, y1: 0.3, tex: 'pylapis' },        // TEMPLE COURT
    { x0: 0.46, y0: 0.14, x1: 0.54, y1: 0.9, tex: 'pycauseway' },   // THE CAUSEWAY
    { x0: 0.36, y0: 0.02, x1: 0.64, y1: 0.16, tex: 'pyroyal' }      // BURIAL CHAMBER
  ];
  var SEAL = { x: 0.5, y: 0.09, r: 34 / 900 };
  var QUICKSAND = [[0.14, 0.75], [0.3, 0.82], [0.72, 0.76], [0.86, 0.24], [0.12, 0.16]];
  var DECOR = [
    // EXPEDITION CAMP (spawn)
    ['pyCamp', 0.5, 0.9, 1.8], ['pyCamp', 0.44, 0.87, 1.4],
    ['pyPalms', 0.38, 0.84, 1.5], ['pyPalms', 0.35, 0.88, 1.4],
    // CAUSEWAY: braziers + obelisks alternating
    ['pyObelisk', 0.455, 0.8, 1.5], ['pyBrazier', 0.545, 0.74, 1.3],
    ['pyObelisk', 0.455, 0.68, 1.5], ['pyBrazier', 0.545, 0.62, 1.3],
    ['pyObelisk', 0.455, 0.56, 1.5], ['pyBrazier', 0.545, 0.5, 1.3],
    ['pyObelisk', 0.455, 0.44, 1.5], ['pyBrazier', 0.545, 0.38, 1.3],
    // NECROPOLIS: sarcophagi rows + canopics + glyph walls
    ['pySarco', 0.1, 0.36, 1.3], ['pySarco', 0.17, 0.36, 1.3], ['pySarco', 0.24, 0.36, 1.3],
    ['pySarco', 0.1, 0.45, 1.3], ['pySarco', 0.17, 0.45, 1.3], ['pySarco', 0.24, 0.45, 1.3],
    ['pyCanopic', 0.32, 0.36, 1.3], ['pyGlyphWall', 0.07, 0.55, 1.6], ['pyGlyphWall', 0.2, 0.58, 1.6],
    // DUNES: fallen colossus + drifts + sphinx
    ['pyFallen', 0.16, 0.68, 2.6], ['pyDune', 0.24, 0.72, 1.6], ['pyDune', 0.1, 0.84, 1.6],
    ['pySphinx', 0.78, 0.86, 2.6],
    // OASIS: pool + palms + rival camp
    ['pyOasis', 0.8, 0.48, 2.2], ['pyPalms', 0.73, 0.42, 1.5], ['pyPalms', 0.87, 0.44, 1.5],
    ['pyPalms', 0.75, 0.56, 1.4], ['pyCamp', 0.9, 0.56, 1.5],
    // TEMPLE COURT: colonnade + scales + colossi pair
    ['pyColumn', 0.26, 0.18, 1.4], ['pyColumn', 0.32, 0.18, 1.4], ['pyColumn', 0.68, 0.18, 1.4],
    ['pyColumn', 0.74, 0.18, 1.4], ['pyColumn', 0.26, 0.26, 1.4], ['pyColumn', 0.32, 0.26, 1.4],
    ['pyColumn', 0.68, 0.26, 1.4], ['pyColumn', 0.74, 0.26, 1.4],
    ['pyScales', 0.4, 0.22, 1.6], ['pyColossus', 0.22, 0.22, 2.2], ['pyColossus', 0.78, 0.22, 2.2],
    // BURIAL CHAMBER: golden sarcophagus (the ENTRANCE) + 4 anubis + braziers
    ['pyAnubis', 0.39, 0.04, 1.8], ['pyAnubis', 0.61, 0.04, 1.8],
    ['pyAnubis', 0.39, 0.14, 1.8], ['pyAnubis', 0.61, 0.14, 1.8]
  ];
  var STATUES = [[0.39, 0.04], [0.61, 0.04], [0.39, 0.14], [0.61, 0.14]];
  var CHAMBER_BRAZIERS = [[0.44, 0.03], [0.56, 0.03], [0.42, 0.12], [0.58, 0.12]];
  // the PLUNDER (lootable, curse-arming) + free urns
  var LOOT = [
    { key: 'pyTreasure', x: 0.68, y: 0.88 }, { key: 'pyTreasure', x: 0.68, y: 0.52 },
    { key: 'pyTreasure', x: 0.14, y: 0.5 },  { key: 'pyTreasure', x: 0.5, y: 0.72 },
    { key: 'pyTreasure', x: 0.86, y: 0.34 },
    { key: 'pyChest', x: 0.3, y: 0.55 },     { key: 'pyChest', x: 0.6, y: 0.22 },
    { key: 'pyCart', x: 0.42, y: 0.92 }
  ];
  var URNS = [[0.56, 0.88], [0.28, 0.4], [0.84, 0.58], [0.12, 0.6], [0.66, 0.16]];
  var TRAPS = [[0.5, 0.66], [0.5, 0.48], [0.33, 0.58], [0.62, 0.24]];

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var PYR = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var P = scene._pyr = {
        pits: [], loot: [], urns: [], traps: [], statues: [], braziers: [],
        zones: [], lanes: [],
        curse: 0, dotUntil: 0, nextDotAt: 0, buffUntil: 0, nextWaveAt: Infinity,
        wavesArmed: 0, pendingPack: 0,
        dim: null, sarco: null, toss: null,
        chamber: { x0: 0.36 * WW, y0: 0.02 * HH, x1: 0.64 * WW, y1: 0.16 * HH },
        seal: { x: SEAL.x * WW, y: SEAL.y * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- floors: desert base + zone rects + the obsidian seal ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'pydesert').setDepth(-23);
      FLOORS.forEach(function (F) {
        var w = (F.x1 - F.x0) * WW, h = (F.y1 - F.y0) * HH;
        scene.add.tileSprite(F.x0 * WW + w / 2, F.y0 * HH + h / 2, w, h, F.tex).setDepth(-21);
      });
      var sx = SEAL.x * WW, sy = SEAL.y * HH, sr = SEAL.r * WW;
      var sealTile = scene.add.tileSprite(sx, sy, sr * 2 + 8, sr * 2 + 8, 'pyseal').setDepth(-20);
      var smg = scene.make.graphics({ add: false });
      smg.fillStyle(0xffffff, 1); smg.fillCircle(sx, sy, sr);
      sealTile.setMask(smg.createGeometryMask());
      var sg = scene.add.graphics().setDepth(-19);
      sg.lineStyle(3, 0xb07d1e, 0.9); sg.strokeCircle(sx, sy, sr * 0.92); sg.strokeCircle(sx, sy, sr * 0.6);

      // ---- quicksand pits (they churn WIDER as the curse rises) ----
      QUICKSAND.forEach(function (Q) {
        var qx = Q[0] * WW, qy = Q[1] * HH;
        var spr = scene.add.tileSprite(qx, qy, 200, 200, 'pyquicksand').setDepth(-20);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillCircle(qx, qy, 70);
        spr.setMask(mg.createGeometryMask());
        // the mask circle is fixed; the RADIUS knob is data-side (P.pits[].r)
        P.pits.push({ x: qx, y: qy, r: 70, base: 70, spr: spr, mask: mg, dieAt: 0 });
      });

      // ---- decor per the PLAN ----
      DECOR.forEach(function (D) {
        scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
      });
      // the golden sarcophagus on the seal — the boss ENTRANCE prop
      P.sarco = scene.add.sprite(P.seal.x, P.seal.y, 'pySarco').setScale(2).setDepth(3);
      CHAMBER_BRAZIERS.forEach(function (B) {
        P.braziers.push(scene.add.sprite(B[0] * WW, B[1] * HH, 'pyBrazier').setScale(1.3).setDepth(2));
      });
      STATUES.forEach(function (St) {
        var spr = scene.add.sprite(St[0] * WW, St[1] * HH, 'pyAnubis').setScale(1.8).setDepth(2.5);
        P.statues.push({ x: spr.x, y: spr.y, spr: spr });
      });

      // ---- the PLUNDER: lootable props + free urns + trap plates ----
      LOOT.forEach(function (L) {
        var spr = scene.add.sprite(L.x * WW, L.y * HH, L.key).setScale(1.5).setDepth(2);
        P.loot.push({ x: spr.x, y: spr.y, spr: spr, looted: false });
      });
      URNS.forEach(function (U) {
        var spr = scene.add.sprite(U[0] * WW, U[1] * HH, 'pyUrns').setScale(1.2).setDepth(2);
        P.urns.push({ x: spr.x, y: spr.y, spr: spr, smashed: false });
      });
      TRAPS.forEach(function (T) {
        var spr = scene.add.sprite(T[0] * WW, T[1] * HH, 'pyTrap').setScale(1.2).setDepth(1.5).setAlpha(0.85);
        P.traps.push({ x: spr.x, y: spr.y, spr: spr, nextAt: 0 });
      });

      // ---- spawn at the expedition camp ----
      scene._realmStart = { x: 0.5 * WW, y: 0.86 * HH };

      // mob-verb helpers (fresh closures)
      scene._pyrGuardShield = function (m, player, time) { return PYR._guardShield(scene, m, player, time); };
      scene._pyrGolemPound = function (m, player, time) { return PYR._golemPound(scene, m, player, time); };
      scene._pyrJackalPack = function (m, player, time) { return PYR._jackalPack(scene, m, player, time); };
    },

    afterCreate: function (scene) {},

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var P = scene._pyr; if (!P) return;
      var dt = Math.min(120, delta), cfg = scene.realmDef.curse;

      // phase-2 death: darkness/dim lifts when the boss is fully down
      if (P.dim && P.dimArmed && (!scene.boss || !scene.boss.active)) { try { P.dim.destroy(); } catch (e) {} P.dim = null; }

      PYR._wrap(scene);

      // ---- QUICKSAND slow (speed MULT in the mover; players + walkers) ----
      var slowIn = function (x, y) {
        for (var i = 0; i < P.pits.length; i++) {
          var q = P.pits[i];
          if (q.dieAt && time >= q.dieAt) continue;
          if (Math.hypot(x - q.x, y - q.y) < q.r) return true;
        }
        return false;
      };
      if (scene.player.state.alive && slowIn(scene.player.x, scene.player.y)) {
        scene.player.body.velocity.x *= 0.5; scene.player.body.velocity.y *= 0.5;
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.float) return;
        if (slowIn(m.x, m.y)) { m.body.velocity.x *= 0.5; m.body.velocity.y *= 0.5; }
      });
      // expire the boss's SANDS OF AGE pools
      for (var qi = P.pits.length - 1; qi >= 0; qi--) {
        if (P.pits[qi].dieAt && time >= P.pits[qi].dieAt) {
          try { P.pits[qi].spr.destroy(); } catch (e) {}
          P.pits.splice(qi, 1);
        }
      }

      // ---- HASTE loot buff (velocity mult up) ----
      if (P.buffUntil > time && scene.player.state.alive && !scene.hitstopActive) {
        scene.player.body.velocity.x *= cfg.buffMult; scene.player.body.velocity.y *= cfg.buffMult;
      }
      // ---- curse DoT ticks after each loot ----
      if (P.dotUntil > time && time >= P.nextDotAt && scene.player.state.alive) {
        P.nextDotAt = time + cfg.dotTickMs;
        Entities.hurtPlayer(scene, scene.player, cfg.dotDmg, time, 'the curse');
      }
      // ---- toss (golem shove-back rides here too) ----
      if (P.toss && time < P.toss.until && scene.player.state.alive && !scene.hitstopActive) {
        scene.player.x += P.toss.vx * dt / 1000; scene.player.y += P.toss.vy * dt / 1000;
      } else if (P.toss && time >= P.toss.until) P.toss = null;

      // ---- LOOT on walk-over: pay + anger the tomb ----
      var p = scene.player;
      if (p.state.alive) {
        P.loot.forEach(function (L) {
          if (L.looted || Math.hypot(p.x - L.x, p.y - L.y) > 44) return;
          L.looted = true;
          L.spr.setTint(0x6e5230).setAlpha(0.55);
          scene.burst(L.x, L.y, 14, 0xffcd45);
          Entities.grantXp(scene, p, cfg.lootXp);
          P.curse++;
          P.buffUntil = time + cfg.buffMs;
          P.dotUntil = time + cfg.dotMs; P.nextDotAt = time + cfg.dotTickMs;
          try { AUDIO.play('lootchime'); } catch (e) {}
          scene.banner('PLUNDER TAKEN (+' + cfg.lootXp + ' XP · haste)\nthe tomb stirs — curse ' + P.curse, '#66e8a0');
          // quicksand churns wider with every theft
          P.pits.forEach(function (q) { if (!q.dieAt) q.r = Math.min(q.base + 60, q.r + cfg.pitGrow); });
          // high curse: tomb retaliation (ambient only — the boss owns the anger)
          if (P.curse % cfg.waveEvery === 0 && !scene.boss && !scene.bossPortal && !scene.closing) {
            PYR._retaliate(scene, time);
          }
        });
        // urns are free micro-smashes
        P.urns.forEach(function (U) {
          if (U.smashed || Math.hypot(p.x - U.x, p.y - U.y) > 36) return;
          U.smashed = true;
          U.spr.setAlpha(0.35).setTint(0x57401f);
          scene.burst(U.x, U.y, 6, 0xc2996a);
          Entities.grantXp(scene, p, cfg.urnXp);
          try { AUDIO.play('hit'); } catch (e) {}
        });
        // ---- TRAP PLATES: armed once the tomb is angry (curse >= 1) ----
        if (P.curse >= 1) {
          P.traps.forEach(function (T) {
            if (time < T.nextAt || Math.hypot(p.x - T.x, p.y - T.y) > 34) return;
            T.nextAt = time + cfg.trapCooldownMs;
            PYR._dartVolley(scene, T, time);
          });
        }
      }

      // pending telegraphed zones + beam lanes
      PYR._runZones(scene, time);
      PYR._runLanes(scene, time);
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var P = scene._pyr; if (!P) return;
      ['dotUntil', 'nextDotAt', 'buffUntil'].forEach(function (k) { if (P[k]) P[k] += dt; });
      if (P.nextWaveAt && P.nextWaveAt !== Infinity) P.nextWaveAt += dt;
      P.traps.forEach(function (T) { if (T.nextAt) T.nextAt += dt; });
      P.pits.forEach(function (q) { if (q.dieAt) q.dieAt += dt; });
      P.zones.forEach(function (z) { z.at += dt; });
      P.lanes.forEach(function (l) { l.at += dt; });
      if (P.toss) P.toss.until += dt;
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        if (m.mob.nextShieldAt) m.mob.nextShieldAt += dt;        // khopesh shield cadence
        if (m.mob.guardShieldUntil) m.mob.guardShieldUntil += dt;
        if (m.mob.nextPoundAt) m.mob.nextPoundAt += dt;          // golem pound cooldown
        if (m.mob.pound && m.mob.pound.until) m.mob.pound.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextSigilAt', 'nextGazeAt', 'nextQuakeAt', 'nextSandsAt', 'nextSummonAt',
         'nextCrossAt', 'nextWhirlAt', 'nextBrandAt', 'nextLeapAt', 'nextJudgmentAt',
         'nextAddsAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
        if (bs.gaze && bs.gaze.at) bs.gaze.at += dt;
        if (bs.whirl && bs.whirl.at) bs.whirl.at += dt;
        if (bs.leap && bs.leap.at) bs.leap.at += dt;
        if (bs.cross && bs.cross.at) bs.cross.at += dt;
        if (bs.cross && bs.cross.dashing && bs.cross.dashing.until) bs.cross.dashing.until += dt;  // M7k AUDIT fix: mid-dash clock
        if (bs.judgment && bs.judgment.nextAt) bs.judgment.nextAt += dt;
      }
      if (scene._pyrXform && scene._pyrXform.until) scene._pyrXform.until += dt;
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var P = scene._pyr; if (!P) return;
      P.zones.forEach(function (z) {
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        // M7k AUDIT fix: drop the paired _warn record with the zone
        if (z._warn && scene._zoneWarns) {
          var wi = scene._zoneWarns.indexOf(z._warn);
          if (wi >= 0) scene._zoneWarns.splice(wi, 1);
        }
      });
      P.zones = [];
      P.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } });
      P.lanes = [];
      P.toss = null;
      P.pendingPack = 0;   // M7k AUDIT fix: stale pack credits suppressed future jackal packs
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: the Executioner killed MID-VERB left telegraph graphics
    // painted forever (cross-slash lanes, the leap tracking ring, the green
    // JUDGMENT tint on the statues, the fight dim). Central onBossDown hook.
    bossCleanup: function (scene, boss) {
      var P = scene._pyr; if (!P) return;
      var bs = boss && boss.boss;
      if (bs) {
        if (bs.cross && bs.cross.g) { try { bs.cross.g.destroy(); } catch (e) {} bs.cross = null; }
        if (bs.leap && bs.leap.ring) { try { bs.leap.ring.destroy(); } catch (e) {} bs.leap = null; }
        bs.judgment = null;
      }
      P.statues.forEach(function (st) { try { st.spr.clearTint(); } catch (e) {} });
      if (P.dim) { try { P.dim.destroy(); } catch (e) {} P.dim = null; }
    },

    // ================================================== BOSS ARRIVAL =======
    // SARCOPHAGUS CREAKS OPEN (Red's pick): every brazier gutters out one by
    // one; the golden lid grinds off the seal; the tiny king FLOATS out.
    bossArrival: function (scene, def, bx, by) {
      var P = scene._pyr, self = scene;
      scene.player.setPosition(P.seal.x, P.chamber.y1 - 30);
      scene.cameras.main.centerOn(P.seal.x, P.seal.y);
      var W = scene.scale.width, H = scene.scale.height;
      P.dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x0c0708, 0).setScrollFactor(0).setDepth(40);
      scene.tweens.add({ targets: P.dim, fillAlpha: 0.4, duration: def.entranceMs * 0.8 });
      // braziers gutter out one by one
      P.braziers.forEach(function (B, i) {
        scene.tweens.add({ targets: B, alpha: 0.25, delay: i * (def.entranceMs * 0.18), duration: 300 });
      });
      scene.cameras.main.shake(def.entranceMs, 0.003);
      scene.banner('THE BRAZIERS GUTTER OUT\nsomething small is waking below the seal', '#66e8a0');
      try { AUDIO.play('sigilbloom'); } catch (e) {}
      // the lid grinds + slides off
      scene.tweens.add({ targets: P.sarco, x: P.sarco.x + 60, angle: 8, delay: def.entranceMs * 0.4,
        duration: def.entranceMs * 0.5, ease: 'Sine.In' });
      scene.time.delayedCall(def.entranceMs, function () {
        if (self.closing || !self.player.state.alive) {
          // M7k AUDIT fix: the dim never armed — kill it or it sits at 0.4
          // alpha over the death screen forever
          if (P.dim) { try { P.dim.destroy(); } catch (e) {} P.dim = null; }
          return;
        }
        self.cameras.main.flash(200, 102, 232, 160);
        self.spawnBossNow(def, P.seal.x, P.seal.y);
        P.dimArmed = true;
        // he floats up out of the box
        if (self.boss) {
          self.boss.setAlpha(0);
          self.boss.y += 26;
          self.tweens.add({ targets: self.boss, alpha: 1, y: self.boss.y - 26, duration: 700, ease: 'Sine.Out' });
        }
        self.showScouter(def);
      });
    },

    // =============================================== BOSS TRANSFORM ========
    // Phase-1 death → THE EXECUTIONER (registry def.transform dispatch).
    bossTransform: function (scene, boss) {
      var self = scene, bs = boss.boss, def = bs.def, X = def.exec;
      bs.resurrecting = true; bs.hp = 1; boss.setVelocity(0, 0);
      boss.setTint(0x66e8a0);
      scene.banner('THE CHILD COLLAPSES\nsomething older stands up inside the curse', '#66e8a0');
      try { AUDIO.play('transformhowl'); } catch (e) {}
      // curse-light column
      var col = scene.add.rectangle(boss.x, boss.y - 120, 60, 300, 0x66e8a0, 0.35).setDepth(9);
      scene.tweens.add({ targets: col, scaleX: { from: 0.3, to: 1.4 }, alpha: 0, duration: def.transformMs,
        onComplete: function () { try { col.destroy(); } catch (e) {} } });
      scene._pyrXform = { until: scene.time.now + def.transformMs, boss: boss };
      scene.time.delayedCall(def.transformMs * 0.55, function () {
        if (!boss.active) return;
        var sc = X.display / 96;
        boss.setTexture(X.texture).setScale(sc).clearTint();
        // real centered body matching the bigger sprite (mech-precedent fix)
        if (boss.body) {
          var bw = Math.round(X.bodyW / sc), bh = Math.round(X.bodyH / sc);
          boss.body.setSize(bw, bh).setOffset(Math.round((96 - bw) / 2), Math.round((96 - bh) / 2));
        }
        self.cameras.main.shake(400, 0.01);
      });
      scene.time.delayedCall(def.transformMs, function () {
        if (!boss.active) return;
        bs.resurrecting = false; bs.phase2done = true; bs.phase = 2;
        bs.hp = bs.maxHp;
        bs.spdMult = X.spdMult; bs.rateMult = X.rateMult;
        var t = self.time.now;
        bs.nextCrossAt = t + 3000; bs.nextWhirlAt = t + 9000; bs.nextBrandAt = t + 5000;
        bs.nextLeapAt = t + 7000; bs.nextJudgmentAt = t + def.patterns.judgmentFour.firstDelayMs;
        bs.nextAddsAt = t + 8000; bs.busyUntil = t + 800; bs.rootUntil = 0;
        self.burst(boss.x, boss.y, 30, 0x66e8a0);
        self.banner('THE EXECUTIONER\nhis blades remember every thief', '#c2452e');
        self.showScouter(def.execScouter);
      });
    },

    // ==================================================== BOSS UPDATE ======
    bossUpdate: function (scene, b, player, time) {
      var bs = b.boss, P = bs.def.patterns;
      if (bs.resurrecting) { b.setVelocity(0, 0); return; }
      if (!bs._pyrInit) {
        bs._pyrInit = true; bs.phase = 1;
        bs.nextSigilAt = time + 3200; bs.nextGazeAt = time + 6000;
        bs.nextQuakeAt = time + 10000; bs.nextSandsAt = time + 8000;
        bs.nextSummonAt = time + 12000; bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.phase === 2 && bs.hp <= bs.maxHp * P.overclock.hpPct) {
        bs._overclocked = true;
        bs.spdMult = (bs.spdMult || 1) * P.overclock.spdMult; bs.rateMult = (bs.rateMult || 1) * P.overclock.rateMult;
        scene.banner('THE EXECUTIONER RAGES\nthe black tear burns', '#c2452e');
      }
      var rate = bs.rateMult || 1;
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      if (bs.leap) { PYR._leapStep(scene, b, player, time); return; }
      if (bs.cross) { PYR._crossStep(scene, b, player, time); return; }
      if (bs.judgment) { PYR._judgmentStep(scene, b, player, time); return; }
      if (time < bs.busyUntil) return;

      if (bs.phase === 1) {
        // ---- THE ETERNAL CHILD (caster — ground-overlay telegraphs only) ----
        if (time >= bs.nextQuakeAt) {
          bs.nextQuakeAt = time + P.tantrumQuake.everyMs * rate;
          bs.busyUntil = time + P.tantrumQuake.warnMs + P.tantrumQuake.gapMs + 400;
          PYR._tantrumQuake(scene, b, player, time);
        } else if (time >= bs.nextGazeAt) {
          bs.nextGazeAt = time + P.maskGaze.everyMs * rate;
          bs.busyUntil = time + P.maskGaze.warnMs + 300;
          PYR._maskGaze(scene, b, player, time);
        } else if (time >= bs.nextSandsAt) {
          bs.nextSandsAt = time + P.sandsOfAge.everyMs * rate;
          PYR._sandsOfAge(scene, b, player, time);
        } else if (time >= bs.nextSigilAt) {
          bs.nextSigilAt = time + P.curseSigils.everyMs * rate;
          PYR._curseSigils(scene, b, player, time);
        }
        if (time >= bs.nextSummonAt) {
          bs.nextSummonAt = time + P.royalSummons.everyMs * rate;
          PYR._summons(scene, b, 'khopeshGuard', P.royalSummons.count, P.royalSummons.cap);
        }
      } else {
        // ---- THE EXECUTIONER (melee hunter — zero projectiles) ----
        if (time >= bs.nextJudgmentAt) {
          bs.nextJudgmentAt = time + P.judgmentFour.everyMs * rate;
          PYR._judgmentBegin(scene, b, time);
        } else if (time >= bs.nextLeapAt) {
          bs.nextLeapAt = time + P.guillotineLeap.everyMs * rate;
          PYR._leapBegin(scene, b, player, time);
        } else if (time >= bs.nextWhirlAt) {
          bs.nextWhirlAt = time + P.whirlingBlades.everyMs * rate;
          PYR._whirl(scene, b, player, time);
        } else if (time >= bs.nextCrossAt) {
          bs.nextCrossAt = time + P.crossSlash.everyMs * rate;
          PYR._crossBegin(scene, b, player, time);
        } else if (time >= bs.nextBrandAt) {
          bs.nextBrandAt = time + P.brand.everyMs * rate;
          PYR._zone(scene, player.x, player.y, P.brand.radius, P.brand.warnMs, P.brand.dmg,
            "the Executioner's brand", true, false, time);
          try { AUDIO.play('sigilbloom'); } catch (e) {}
        }
        if (time >= bs.nextAddsAt) {
          bs.nextAddsAt = time + P.jackalPack.everyMs * rate;
          PYR._summons(scene, b, 'jackalRunner', P.jackalPack.count, P.jackalPack.cap);
        }
      }
    },

    // ------------------------------------------------ phase-1 verbs --------
    _curseSigils: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.curseSigils;
      for (var i = 0; i < cfg.count; i++) {
        var a = Math.PI * 2 * i / cfg.count + SIM.rng();
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
        PYR._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
          cfg.radius, cfg.warnMs, cfg.dmg, "Neferu-Ka's curse sigil", true, true, time);
      }
      try { AUDIO.play('sigilbloom'); } catch (e) {}
    },
    _maskGaze: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.maskGaze;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);       // LOCKS at cast
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0xffcd45, 0.14); g.lineStyle(2, 0xffcd45, 0.8);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      try { AUDIO.play('gazehum'); } catch (e) {}
      var self = scene;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active || !player.state.alive) return;
        var d = Math.hypot(player.x - b.x, player.y - b.y);
        var pa = Math.atan2(player.y - b.y, player.x - b.x);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        var fg = self.add.graphics().setDepth(9);
        fg.fillStyle(0xfff0b0, 0.4);
        fg.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 300, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(140, 0.006);
        if (d < cfg.range && Math.abs(diff) < cfg.halfRad)
          Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "the mask's gaze", true);
      });
    },
    _tantrumQuake: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tantrumQuake, P = scene._pyr, C = P.chamber;
      var t = cfg.tile;
      for (var gy = 0; gy * t < (C.y1 - C.y0); gy++) {
        for (var gx = 0; gx * t < (C.x1 - C.x0); gx++) {
          var cx = C.x0 + gx * t + t / 2, cy = C.y0 + gy * t + t / 2;
          var waveB = (gx + gy) % 2 === 1;
          PYR._zone(scene, cx, cy, t * 0.5, cfg.warnMs + (waveB ? cfg.gapMs : 0), cfg.dmg,
            "Neferu-Ka's tantrum", true, false, time, true);
        }
      }
      scene.banner('TANTRUM QUAKE\nstand on the wave that already fired', '#ffcd45');
    },
    _sandsOfAge: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.sandsOfAge, P = scene._pyr, self = scene;
      for (var i = 0; i < cfg.count; i++) {
        (function (i2) {
          var a = SIM.rng() * Math.PI * 2, rr = 60 + SIM.rng() * cfg.scatter;
          var zx = player.x + Math.cos(a) * rr, zy = player.y + Math.sin(a) * rr;
          var ring = scene.add.circle(zx, zy, cfg.radius, 0xa87e4e, 0.14).setStrokeStyle(2, 0xd9b17a, 0.8).setDepth(2).setScale(0.35);
          scene.tweens.add({ targets: ring, scale: 1, duration: cfg.warnMs });
          scene.time.delayedCall(cfg.warnMs, function () {
            try { ring.destroy(); } catch (e) {}
            if (!self.boss || !self.boss.active) return;
            var spr = self.add.tileSprite(zx, zy, cfg.radius * 2, cfg.radius * 2, 'pyquicksand').setDepth(-19);
            var mg = self.make.graphics({ add: false });
            mg.fillStyle(0xffffff, 1); mg.fillCircle(zx, zy, cfg.radius);
            spr.setMask(mg.createGeometryMask());
            P.pits.push({ x: zx, y: zy, r: cfg.radius, base: cfg.radius, spr: spr, dieAt: self.time.now + cfg.lingerMs });
            try { AUDIO.play('sandgulp'); } catch (e) {}
          });
        })(i);
      }
    },
    _summons: function (scene, b, key, n, cap) {
      var alive = 0;
      scene.mobs.children.iterate(function (m) { if (m && m.active) alive++; });
      if (alive >= cap) return;
      for (var i = 0; i < n; i++) {
        var a = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: key, bossWave: true,
          x: b.x + Math.cos(a) * 200, y: b.y + Math.sin(a) * 160 });
      }
    },

    // ------------------------------------------------ phase-2 verbs --------
    _crossBegin: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.crossSlash;
      var a1 = SIM.rng() * Math.PI, a2 = a1 + Math.PI / 2;
      var mk = function (ang) {
        var len = cfg.len;
        return { x0: player.x - Math.cos(ang) * len / 2, y0: player.y - Math.sin(ang) * len / 2,
                 x1: player.x + Math.cos(ang) * len / 2, y1: player.y + Math.sin(ang) * len / 2 };
      };
      var L1 = mk(a1), L2 = mk(a2);
      var g = scene.add.graphics().setDepth(2);
      [L1, L2].forEach(function (L) {
        g.lineStyle(cfg.half * 2, 0xc2452e, 0.18); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
        g.lineStyle(2, 0xc2452e, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      });
      b.boss.cross = { lanes: [L1, L2], idx: 0, at: time + cfg.warnMs, g: g, hit: false };
      b.boss.busyUntil = time + cfg.warnMs + cfg.dashMs * 2 + 600;
      try { AUDIO.play('khopeshshing'); } catch (e) {}
    },
    _crossStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.crossSlash, cr = b.boss.cross;
      if (time < cr.at) { b.setVelocity(0, 0); return; }
      if (!cr.dashing) {
        var L = cr.lanes[cr.idx];
        b.setPosition(L.x0, L.y0);
        cr.dashing = { L: L, until: time + cfg.dashMs };
        cr.hit = false;
        scene.cameras.main.shake(cfg.dashMs, 0.005);
      }
      var D = cr.dashing, t = 1 - Math.max(0, (D.until - time) / cfg.dashMs);
      b.setPosition(D.L.x0 + (D.L.x1 - D.L.x0) * t, D.L.y0 + (D.L.y1 - D.L.y0) * t);
      if (!cr.hit && player.state.alive &&
          dist2seg(player.x, player.y, D.L.x0, D.L.y0, D.L.x1, D.L.y1) < cfg.half &&
          Math.hypot(player.x - b.x, player.y - b.y) < cfg.half * 3) {
        cr.hit = true;
        Entities.hurtPlayer(scene, player, cfg.dmg, time, "the Executioner's cross-slash", true);
      }
      if (time >= D.until) {
        cr.idx++;
        if (cr.idx >= cr.lanes.length) {
          try { cr.g.destroy(); } catch (e) {}
          b.boss.cross = null;
        } else { cr.dashing = null; cr.at = time + 180; }
      }
    },
    _whirl: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.whirlingBlades, self = scene;
      b.boss.rootUntil = time + cfg.growMs + 200;
      b.boss.busyUntil = b.boss.rootUntil;
      var ring = scene.add.circle(b.x, b.y, cfg.radius, 0xc2452e, 0.1).setStrokeStyle(3, 0xf08a64, 0.9).setDepth(2).setScale(0.15);
      scene.tweens.add({ targets: ring, scale: 1, duration: cfg.growMs });
      scene.banner('WHIRLING BLADES\noutrun the ring', '#f08a64');
      try { AUDIO.play('khopeshshing'); } catch (e) {}
      var bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.growMs, function () {
        try { ring.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;
        self.burst(bx, by, 22, 0xc2452e);
        self.cameras.main.shake(200, 0.008);
        if (player.state.alive && Math.hypot(player.x - bx, player.y - by) < cfg.radius)
          Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "the whirling blades", true);
        self.mobs.children.iterate(function (m) {
          if (m && m.active && Math.hypot(m.x - bx, m.y - by) < cfg.radius) self.killMobCredited(m);
        });
      });
    },
    _leapBegin: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.guillotineLeap;
      b.body.enable = false;
      scene.tweens.add({ targets: b, alpha: 0.2, duration: 400 });
      var ring = scene.add.circle(player.x, player.y, cfg.radius, 0xc2452e, 0.13).setStrokeStyle(2, 0xc2452e, 0.85).setDepth(2);
      b.boss.leap = { phase: 'track', at: time + cfg.trackMs, ring: ring, x: player.x, y: player.y };
      b.boss.busyUntil = time + cfg.trackMs + cfg.lockMs + 500;
      try { AUDIO.play('divescreech'); } catch (e) { try { AUDIO.play('portal'); } catch (e2) {} }
    },
    _leapStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.guillotineLeap, lp = b.boss.leap;
      if (lp.phase === 'track') {
        // the circle TRACKS you...
        lp.x += (player.x - lp.x) * 0.12; lp.y += (player.y - lp.y) * 0.12;
        lp.ring.setPosition(lp.x, lp.y);
        if (time >= lp.at) { lp.phase = 'lock'; lp.at = time + cfg.lockMs; lp.ring.setStrokeStyle(3, 0xfff0b0, 1); }
      } else if (lp.phase === 'lock' && time >= lp.at) {
        // ...then LOCKS — he slams down
        try { lp.ring.destroy(); } catch (e) {}
        b.setPosition(lp.x, lp.y); b.setAlpha(1); b.body.enable = true;
        scene.burst(lp.x, lp.y, 20, 0xc2452e);
        scene.cameras.main.shake(220, 0.01);
        try { AUDIO.play('crash'); } catch (e) { try { AUDIO.play('thud'); } catch (e2) {} }
        if (player.state.alive && Math.hypot(player.x - lp.x, player.y - lp.y) < cfg.radius)
          Entities.hurtPlayer(scene, player, cfg.dmg, time, "the guillotine leap", true);
        b.boss.leap = null;
      }
    },
    _judgmentBegin: function (scene, b, time) {
      var cfg = b.boss.def.patterns.judgmentFour, P = scene._pyr;
      b.boss.judgment = { idx: 0, nextAt: time + 600 };
      b.boss.rootUntil = time + 600 + P.statues.length * (cfg.warnMs + cfg.gapMs) + cfg.ventMs;
      b.boss.busyUntil = b.boss.rootUntil;
      scene.banner('JUDGMENT OF THE FOUR\nthe statues ignite in sequence', '#66e8a0');
      try { AUDIO.play('statuebeam'); } catch (e) { try { AUDIO.play('rodhum'); } catch (e2) {} }
    },
    _judgmentStep: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.judgmentFour, P = scene._pyr, J = b.boss.judgment;
      b.setVelocity(0, 0);
      if (time < J.nextAt) return;
      if (J.idx < P.statues.length) {
        var st = P.statues[J.idx];
        st.spr.setTint(0x66e8a0);
        // the statue sweeps a beam-wall LANE across the arena (H then V, alternating)
        var horiz = J.idx % 2 === 0;
        var C = P.chamber;
        var lane = horiz
          ? { x0: C.x0 - 40, y0: st.y, x1: C.x1 + 40, y1: st.y }
          : { x0: st.x, y0: C.y0 - 40, x1: st.x, y1: C.y1 + 40 };
        PYR._lane(scene, lane, cfg.half, cfg.warnMs, cfg.dmg, "the Judgment of the Four", true, time, 0x66e8a0);
        J.idx++;
        J.nextAt = time + cfg.warnMs + cfg.gapMs;
        if (J.idx >= P.statues.length) {
          var self = scene;
          scene.time.delayedCall(cfg.warnMs + 100, function () {
            if (!self.boss || !self.boss.active) return;
            b.boss.judgment = null;
            b.boss.ventedUntil = self.time.now + cfg.ventMs;
            b.boss.ventDmgMult = cfg.ventDmgMult;
            b.setTint(0x9df0e0);
            self.time.delayedCall(cfg.ventMs, function () {
              if (b.active) b.clearTint();
              P.statues.forEach(function (s2) { s2.spr.clearTint(); });
            });
            self.banner('HE KNEELS, WINDED — UNLOAD', '#9df0e0');
          });
        }
      }
    },

    // =============================================== MOB VERBS (map-new) ===
    // KHOPESH GUARD — periodic VISIBLE shield window (shots bounce), then his
    // khopesh lunge rides the generic def.lunge verb.
    _guardShield: function (scene, m, player, time) {
      var cfg = m.mob.def.shieldWindow;
      if (!m.mob.nextShieldAt) m.mob.nextShieldAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextShieldAt) {
        m.mob.nextShieldAt = time + cfg.everyMs;
        m.mob.guardShieldUntil = time + cfg.windowMs;         // hurtMob bounces + 'BLOCKED'
      }
      // the window is VISIBLE — a lapis flash while shielded
      if (m.mob.guardShieldUntil && time < m.mob.guardShieldUntil) {
        m.setTint(Math.floor(time / 140) % 2 === 0 ? 0x6f9ff0 : 0xffffff);
      } else if (m.tintTopLeft === 0x6f9ff0 || m.tintTopLeft === 0xffffff) m.clearTint();
      return false;                                           // chase + lunge continue
    },
    // SANDSTONE GOLEM — telegraphed ground-POUND circle at his own feet.
    _golemPound: function (scene, m, player, time) {
      var cfg = m.mob.def.pound;
      if (m.mob.pound) {                                      // rooted mid-windup
        m.setVelocity(0, 0);
        if (time >= m.mob.pound.until) m.mob.pound = null;
        return true;
      }
      if (!m.mob.nextPoundAt) m.mob.nextPoundAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextPoundAt && d < cfg.range) {
        m.mob.nextPoundAt = time + cfg.everyMs;
        m.mob.pound = { until: time + cfg.warnMs };
        PYR._zone(scene, m.x, m.y, cfg.radius, cfg.warnMs, cfg.dmg, "a Sandstone Golem's pound", false, false, time);
        return true;
      }
      return false;
    },
    // JACKAL RUNNER — spawns in packs of 2–3 (the pack-credit trick keeps the
    // spawned mates from chain-spawning packs of their own).
    _jackalPack: function (scene, m, player, time) {
      var P = scene._pyr;
      if (!m.mob._packInit) {
        m.mob._packInit = true;
        if (P.pendingPack > 0) P.pendingPack--;               // I *am* a packmate
        else if (!m.mob.bossWave) {
          var n = 1 + (SIM.rng() < 0.5 ? 1 : 0);
          P.pendingPack += n;
          for (var i = 0; i < n; i++) {
            scene.queueSpawn({ key: 'jackalRunner',
              x: m.x + (SIM.rng() * 2 - 1) * 60, y: m.y + (SIM.rng() * 2 - 1) * 60 });
          }
        }
      }
      return false;
    },

    // ================================================= INTERNAL HELPERS ====
    _retaliate: function (scene, time) {
      var P = scene._pyr, p = scene.player;
      P.wavesArmed++;
      scene.banner('THE TOMB RETALIATES\nits guardians hunt the thief', '#c2452e');
      try { AUDIO.play('cursewhisper'); } catch (e) { try { AUDIO.play('belltoll'); } catch (e2) {} }
      for (var i = 0; i < 2; i++) {
        var a = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: 'khopeshGuard', x: p.x + Math.cos(a) * 420, y: p.y + Math.sin(a) * 420 });
      }
      for (var j = 0; j < 3; j++) {
        var a2 = SIM.rng() * Math.PI * 2;
        scene.queueSpawn({ key: 'jackalRunner', x: p.x + Math.cos(a2) * 460, y: p.y + Math.sin(a2) * 460 });
      }
      // the sky dims a step
      var W = scene.scale.width, H = scene.scale.height;
      if (!P.skyDim) P.skyDim = scene.add.rectangle(W / 2, H / 2, W, H, 0x241a18, 0).setScrollFactor(0).setDepth(39);
      P.skyDim.fillAlpha = Math.min(0.22, P.wavesArmed * 0.06);
    },
    _dartVolley: function (scene, T, time) {
      var cfg = scene.realmDef.curse;
      // warned line through the plate — darts sweep it after warnMs
      var horiz = SIM.rng() < 0.5;
      var lane = horiz
        ? { x0: T.x - cfg.dartLen / 2, y0: T.y, x1: T.x + cfg.dartLen / 2, y1: T.y }
        : { x0: T.x, y0: T.y - cfg.dartLen / 2, x1: T.x, y1: T.y + cfg.dartLen / 2 };
      PYR._lane(scene, lane, cfg.dartHalf, cfg.dartWarnMs, cfg.dartDmg, 'a tomb dart', false, time, 0xc2452e);
      try { AUDIO.play('trapdart'); } catch (e) {}
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

    // pending telegraphed circle blasts (absolute clocks — unfreeze-safe)
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, square) {
      var P = scene._pyr;
      var tint = fromBoss ? 0x66e8a0 : 0xd9b17a;
      var ring = square
        ? scene.add.rectangle(x, y, r * 2, r * 2, tint, 0.12).setStrokeStyle(2, tint, 0.8).setDepth(2)
        : scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2);
      ring.setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring };
      P.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var P = scene._pyr;
      for (var i = P.zones.length - 1; i >= 0; i--) {
        var z = P.zones[i];
        if (time < z.at) continue;
        P.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0x66e8a0 : 0xd9b17a);
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
    // warned LANE that blasts along its band (darts + statue beams)
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint) {
      var P = scene._pyr;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      P.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint });
    },
    _runLanes: function (scene, time) {
      var P = scene._pyr;
      for (var i = P.lanes.length - 1; i >= 0; i--) {
        var l = P.lanes[i];
        if (time < l.at) continue;
        P.lanes.splice(i, 1);
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
          if (m && m.active && dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PYR;
  root.PYRAMID_SCENE = PYR;
})(typeof window !== 'undefined' ? window : this);
