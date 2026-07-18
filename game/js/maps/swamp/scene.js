// ============================================================================
// game/js/maps/swamp/scene.js — WITCH'S SWAMP scene hooks (M7 registry).
// The scene-plan PNG (assets/swamp_scene_plan.png) is canon: seven bog-moss
// islands in black water joined by rickety PLANK PATHS (the OLD DOCK spawn
// south, FIREFLY MEADOW, THE MIRE w/ toxic seeps + the sleeping mossback,
// LILY LANDING, SNAG WOOD, RITUAL GLADE, and WITCH'S HOLLOW north — the
// boss arena w/ stilted hut + GIANT CAULDRON). WATER RULE (picked +
// documented): water is SLOW-WADE 0.45× — planks and islands run free.
// HEX TOTEMS is the signature system: sites A–E cycle — shimmer warn → the
// totem RISES (a shootable env object with hp) and pulses ONE hex aura
// (violet SLOW / green DRAIN / bone WEAKEN); auras hit MOBS TOO (drain
// kills are env-credited); shot down = splinter burst (killMobCredited).
// HARD RULES: never more than 2 up; never at the dock. THE BREWMISTRESS
// rises out of the giant cauldron; her PLANT A HEX TOTEM verb reuses the
// totem tech, and THE GRAND BREW tips the pot over half the arena.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- planned layout (fractions of the world; plan PNG canon) ------
  var ISLES = [
    [0.5, 0.88, 0.16, 0.09, 'swmoss'],   // 0 THE OLD DOCK (spawn)
    [0.22, 0.68, 0.16, 0.12, 'swmoss'],  // 1 FIREFLY MEADOW
    [0.52, 0.58, 0.19, 0.13, 'swmud'],   // 2 THE MIRE
    [0.8, 0.62, 0.14, 0.11, 'swmoss'],   // 3 LILY LANDING
    [0.2, 0.34, 0.15, 0.12, 'swmoss'],   // 4 SNAG WOOD
    [0.62, 0.32, 0.13, 0.1, 'swmoss'],   // 5 RITUAL GLADE
    [0.5, 0.13, 0.2, 0.11, 'swritual']   // 6 WITCH'S HOLLOW (BOSS)
  ];
  // plank paths: [x1,y1,x2,y2] (incl. wrap paths off the edges)
  var PATHS = [
    [0.5, 0.88, 0.52, 0.66], [0.5, 0.88, 0.26, 0.72], [0.52, 0.58, 0.24, 0.66],
    [0.52, 0.58, 0.78, 0.63], [0.52, 0.58, 0.6, 0.36], [0.22, 0.68, 0.2, 0.4],
    [0.2, 0.34, 0.44, 0.16], [0.62, 0.32, 0.54, 0.17], [0.8, 0.62, 0.68, 0.36],
    [0.5, 0.88, 0.5, 1.02], [0.5, 0.13, 0.5, -0.02], [0.8, 0.62, 1.02, 0.6], [0.22, 0.68, -0.02, 0.66]
  ];
  var SITES = [[0.34, 0.68], [0.62, 0.5], [0.2, 0.46], [0.76, 0.34], [0.44, 0.26]]; // hex totems A–E
  var DECOR = [
    ['swdHut', 0.4, 0.095, 2.2], ['swdSnag', 0.16, 0.3, 1.8], ['swdSnag', 0.25, 0.27, 1.5],
    ['swdRing', 0.27, 0.72, 1.5], ['swdRing', 0.25, 0.38, 1.4],
    ['swdBush', 0.16, 0.64, 1.5], ['swdBush', 0.68, 0.35, 1.4],
    ['swdReeds', 0.21, 0.6, 1.5], ['swdReeds', 0.78, 0.68, 1.5],
    ['swdLog', 0.58, 0.62, 1.6], ['swdCrocSkull', 0.46, 0.54, 1.7],
    ['swdCircle', 0.62, 0.32, 2.0], ['swdLilies', 0.82, 0.58, 1.6]
  ];
  var HEXES = ['slow', 'drain', 'weaken'];
  var HEX_TINT = { slow: 0xb088d8, drain: 0x9ee83f, weaken: 0xe0d8c0 };

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var SW = {

    // ======================================================== SETUP ========
    setup: function (scene, WW, HH) {
      var C = scene._sw = {
        isles: [], planks: [],
        totems: [], totemWarns: [], totemCycle: { nextAt: 0, hexIdx: -1 },
        zones: [], rings: [], patches: [], mobWarns: [],      // M7k AUDIT fix: dead lanes ledger deleted
        latch: null, gas: null, brew: null, waveSide: 0, bossArmed: false,
        cauldron: null,
        arena: { x: ISLES[6][0] * WW, y: ISLES[6][1] * HH, rx: ISLES[6][2] * WW, ry: ISLES[6][3] * HH }
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- black water base + glow algae + lily shallows accents ----
      scene.add.tileSprite(WW / 2, HH / 2, WW, HH, 'swmurk').setDepth(-23);
      var alg = scene.add.tileSprite(0.5 * WW, 0.24 * HH, 0.56 * WW, 0.26 * HH, 'swalgae').setDepth(-22.5);
      var ag = scene.make.graphics({ add: false });
      ag.fillStyle(0xffffff, 1); ag.fillEllipse(0.5 * WW, 0.24 * HH, 0.56 * WW, 0.26 * HH);
      alg.setMask(ag.createGeometryMask());
      var lil = scene.add.tileSprite(0.86 * WW, 0.5 * HH, 0.26 * WW, 0.34 * HH, 'swlily').setDepth(-22.5);
      var lg = scene.make.graphics({ add: false });
      lg.fillStyle(0xffffff, 1); lg.fillEllipse(0.86 * WW, 0.5 * HH, 0.26 * WW, 0.34 * HH);
      lil.setMask(lg.createGeometryMask());

      // ---- plank paths (rotated tileSprites; walkable over water) ----
      PATHS.forEach(function (P) {
        var x0 = P[0] * WW, y0 = P[1] * HH, x1 = P[2] * WW, y1 = P[3] * HH;
        var len = Math.hypot(x1 - x0, y1 - y0) + 20, hw = 0.016 * WW;
        var spr = scene.add.tileSprite((x0 + x1) / 2, (y0 + y1) / 2, len, hw * 2, 'swplanks').setDepth(-22);
        spr.setRotation(Math.atan2(y1 - y0, x1 - x0));
        C.planks.push({ x0: x0, y0: y0, x1: x1, y1: y1, hw: hw });
      });

      // ---- islands (masked ellipses) ----
      ISLES.forEach(function (I) {
        var cx = I[0] * WW, cy = I[1] * HH, rx = I[2] * WW, ry = I[3] * HH;
        var spr = scene.add.tileSprite(cx, cy, rx * 2 + 8, ry * 2 + 8, I[4]).setDepth(-21);
        var mg = scene.make.graphics({ add: false });
        mg.fillStyle(0xffffff, 1); mg.fillEllipse(cx, cy, rx * 2, ry * 2);
        spr.setMask(mg.createGeometryMask());
        C.isles.push({ x: cx, y: cy, rx: rx, ry: ry });
      });
      // toxic seeps in the mire: seep visuals + permanent damage-tick patches
      [[0.46, 0.6], [0.55, 0.53], [0.58, 0.64]].forEach(function (Q) {
        var sx = Q[0] * WW, sy = Q[1] * HH, r = 34;
        var spr = scene.add.tileSprite(sx, sy, r * 2.4, r * 1.8, 'swseep').setDepth(-20.5);
        var sg = scene.make.graphics({ add: false });
        sg.fillStyle(0xffffff, 1); sg.fillEllipse(sx, sy, r * 2.4, r * 1.8);
        spr.setMask(sg.createGeometryMask());
        C.patches.push({ x: sx, y: sy, r: r, dieAt: Infinity, obj: null,
                         dmg: 4, tickMs: 900, nextTickAt: 0, src: 'a toxic seep' });
      });
      // boss arena ring cosmetic
      var rg = scene.add.graphics().setDepth(-20);
      rg.lineStyle(3, 0x44245e, 0.8);
      rg.strokeEllipse(C.arena.x, C.arena.y, C.arena.rx * 1.5, C.arena.ry * 1.5);

      // ---- decor + the GIANT CAULDRON (the entrance actor — scenery only) --
      DECOR.forEach(function (D) {
        scene.add.sprite(D[1] * WW, D[2] * HH, D[0]).setScale(D[3]).setDepth(2);
      });
      C.cauldron = scene.add.sprite(0.6 * WW, 0.115 * HH, 'swdCauldron').setScale(2.2).setDepth(2);

      // ---- spawn at THE OLD DOCK ----
      scene._realmStart = { x: 0.5 * WW, y: 0.9 * HH };

      // mob-verb helpers (fresh closures)
      scene._swLeech = function (m, player, time) { return SW._leech(scene, m, player, time); };
      scene._swTurtle = function (m, player, time) { return SW._turtle(scene, m, player, time); };
      scene._swMyconid = function (m, player, time) { return SW._myconid(scene, m, player, time); };
      scene._swToad = function (m, player, time) { return SW._toad(scene, m, player, time); };
      scene._swSerpent = function (m, player, time) { return SW._serpent(scene, m, player, time); };
      scene._swSprite = function (m, player, time) { return SW._sprite(scene, m, player, time); };
      scene._swImp = function (m, player, time) { return SW._imp(scene, m, player, time); };
      scene._swMimic = function (m, player, time) { return SW._mimic(scene, m, player, time); };
      scene._swMossback = function (m, player, time) { return SW._mossback(scene, m, player, time); };
    },

    afterCreate: function (scene) {
      // no map colliders — water is slow-wade, not walls (documented pick)
    },

    _onIsle: function (C, x, y) {
      for (var i = 0; i < C.isles.length; i++) {
        var I = C.isles[i];
        if (((x - I.x) / I.rx) * ((x - I.x) / I.rx) + ((y - I.y) / I.ry) * ((y - I.y) / I.ry) < 1) return true;
      }
      return false;
    },
    _onPlank: function (C, x, y) {
      for (var i = 0; i < C.planks.length; i++) {
        var P = C.planks[i];
        if (dist2seg(x, y, P.x0, P.y0, P.x1, P.y1) < P.hw) return true;
      }
      return false;
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._sw; if (!C) return;
      var cfg = scene.realmDef.totem;
      var p = scene.player, alive = p.state.alive;

      // boss-owned machinery clears when the boss is down (armed rule)
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        SW._clearGas(C); SW._clearBrew(scene, C);
        C.totems.slice().forEach(function (T) { if (T.bossOwned) SW._totemShatter(scene, C, T, time, true); });
      }

      // ---- HEX TOTEM cycle (paused while the boss holds court) ----
      var TC = C.totemCycle;
      if (!TC.nextAt) TC.nextAt = time + cfg.cycleMs * 0.5;
      if (TC.nextAt !== Infinity && time >= TC.nextAt && !scene.scanning && !scene.boss) {
        TC.nextAt = time + cfg.cycleMs * (0.8 + SIM.rng() * 0.4);
        var up = C.totems.filter(function (T) { return !T.bossOwned; }).length + C.totemWarns.length;
        if (up < cfg.maxUp) {                                 // NEVER MORE THAN 2 UP
          var used = {};
          C.totems.forEach(function (T) { if (T.siteIdx >= 0) used[T.siteIdx] = 1; });
          C.totemWarns.forEach(function (Wn) { used[Wn.siteIdx] = 1; });
          var free = [];
          for (var si = 0; si < SITES.length; si++) if (!used[si]) free.push(si);
          if (free.length) {
            var pick = free[Math.floor(SIM.rng() * free.length)];
            TC.hexIdx = (TC.hexIdx + 1) % 3;
            SW._totemWarn(scene, C, pick, HEXES[TC.hexIdx], time, cfg);
          }
        }
      }
      // warned sites rise
      for (var wi2 = C.totemWarns.length - 1; wi2 >= 0; wi2--) {
        var Wn2 = C.totemWarns[wi2];
        if (time < Wn2.at) continue;
        C.totemWarns.splice(wi2, 1);
        try { Wn2.g.destroy(); } catch (e) {}
        SW._totemRise(scene, C, Wn2.siteIdx, Wn2.hex, Wn2.x, Wn2.y, cfg.hp, false, time, cfg);
      }
      // live totems: aura fields + pulses + shootable hp
      var inWeaken = false;
      for (var ti = C.totems.length - 1; ti >= 0; ti--) {
        var T = C.totems[ti];
        // pulse ring cosmetic
        var pt = ((time - T.bornAt) % cfg.pulseMs) / cfg.pulseMs;
        T.auraG.clear();
        T.auraG.lineStyle(2, HEX_TINT[T.hex], 0.8); T.auraG.strokeCircle(T.x, T.y, T.auraR);
        T.auraG.lineStyle(3, HEX_TINT[T.hex], 0.5 * (1 - pt)); T.auraG.strokeCircle(T.x, T.y, T.auraR * pt);
        // aura effects — the witch's magic is indiscriminate (mobs too)
        var pIn = alive && Math.hypot(p.x - T.x, p.y - T.y) < T.auraR;
        if (T.hex === 'slow' && pIn) { p.body.velocity.x *= 0.6; p.body.velocity.y *= 0.6; }
        if (T.hex === 'weaken' && pIn) inWeaken = true;
        if (T.hex === 'drain' && time >= T.nextDrainAt) {
          T.nextDrainAt = time + cfg.drainTickMs;
          if (pIn) Entities.hurtPlayer(scene, p, cfg.drainDmg, time, 'a drain hex', T.bossOwned);
          scene.mobs.children.iterate(function (m) {
            if (!m || !m.active || !m.mob) return;
            if (Math.hypot(m.x - T.x, m.y - T.y) < T.auraR) {
              // M7k AUDIT fix: route through hurtMob so immunity gates and
              // hit events apply; its mob-died emit credits the kill (same
              // path killMobCredited used — no double-kill).
              Entities.hurtMob(scene, m, cfg.drainDmg, time, { dot: true });
            }
          });
        }
        if (T.hex === 'slow') {
          scene.mobs.children.iterate(function (m) {
            if (!m || !m.active || !m.mob) return;
            if (Math.hypot(m.x - T.x, m.y - T.y) < T.auraR) { m.body.velocity.x *= 0.6; m.body.velocity.y *= 0.6; }
          });
        }
        // shootable env object
        var shots = scene.playerShots;
        if (shots) shots.children.iterate(function (s) {
          if (!s || !s.active || !T.spr.active) return;
          if (Math.hypot(s.x - T.x, s.y - T.y) < 30) {
            // M7k AUDIT fix: per-shot-per-totem dedup — a piercing shot
            // sitting in the radius hit the totem EVERY FRAME. proj is fresh
            // per fire, so the stamp can't survive pool reuse.
            if (s.proj) {
              if (s.proj._totemHits && s.proj._totemHits[T.tid]) return;
              (s.proj._totemHits = s.proj._totemHits || {})[T.tid] = 1;
            }
            T.hp -= s.proj ? s.proj.dmg : 5;
            T.spr.setTintFill(0xffffff);
            (function (spr2) { scene.time.delayedCall(50, function () { if (spr2.active) spr2.clearTint(); }); })(T.spr);
            if (!s.proj || !s.proj.pierce) Entities.killProjectile(shots, s);
          }
        });
        if (T.hp <= 0) SW._totemShatter(scene, C, T, time, false);
      }
      // WEAKEN hex: shots fired from inside the aura leave weakened (tag once)
      var shots2 = scene.playerShots;
      if (shots2) shots2.children.iterate(function (s) {
        if (!s || !s.active || !s.proj || s.proj._hexTagged) return;
        s.proj._hexTagged = true;
        if (inWeaken) s.proj.dmg = Math.max(1, Math.round(s.proj.dmg * cfg.weakenMult));
      });

      // ---- WATER RULE: slow-wade 0.45× off isle + off plank ----
      if (alive && !SW._onIsle(C, p.x, p.y) && !SW._onPlank(C, p.x, p.y)) {
        p.body.velocity.x *= 0.45; p.body.velocity.y *= 0.45;
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob || m.mob.def.float) return;
        if (!SW._onIsle(C, m.x, m.y) && !SW._onPlank(C, m.x, m.y)) { m.body.velocity.x *= 0.45; m.body.velocity.y *= 0.45; }
      });

      // ---- patches: slow fields + damage ticks (seeps, flame, spores) ----
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        var inP = Math.hypot(p.x - PA.x, p.y - PA.y) < PA.r;
        if (!inP) continue;
        if (PA.slowMult) { p.body.velocity.x *= PA.slowMult; p.body.velocity.y *= PA.slowMult; }
        if (PA.dmg && time >= (PA.nextTickAt || 0)) {
          PA.nextTickAt = time + PA.tickMs;
          Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'the seep');
        }
      }

      // ---- LEECH LATCH safety: slow + auto-release (hitstop/death) ----
      if (C.latch) {
        if (scene.hitstopActive || !alive || !C.latch.m.active || time >= C.latch.until) {
          if (C.latch.m.active) C.latch.m.mob.nextLungeAt = time + 4200;
          C.latch = null;
        } else { p.body.velocity.x *= 0.5; p.body.velocity.y *= 0.5; }
      }

      // ---- armed cleanups: warn graphics whose mob died early ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      // ---- expanding RINGS (mimic quakes) ----
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

      // ---- SWAMP GAS sector sequence (boss) ----
      if (C.gas) {
        var G = C.gas, allDone = true;
        for (var gi = 0; gi < G.seq.length; gi++) {
          var SC = G.seq[gi];
          if (SC.fired) continue;
          allDone = false;
          if (time < SC.at) continue;
          SC.fired = true;
          try { SC.g.destroy(); } catch (e) {}
          var fg = scene.add.graphics().setDepth(9);
          fg.fillStyle(0x9ee83f, 0.35);
          fg.slice(G.x, G.y, G.range, SC.a0, SC.a1, false); fg.fillPath();
          (function (fg2) { scene.tweens.add({ targets: fg2, alpha: 0, duration: 300, onComplete: function () { try { fg2.destroy(); } catch (e) {} } }); })(fg);
          try { AUDIO.play('gashiss'); } catch (e) {}
          if (alive) {
            var pd = Math.hypot(p.x - G.x, p.y - G.y);
            var pa = Math.atan2(p.y - G.y, p.x - G.x);
            if (pa < 0) pa += Math.PI * 2;
            var in0 = pa >= SC.a0 && pa < SC.a1;
            if (SC.a1 > Math.PI * 2) in0 = in0 || (pa + Math.PI * 2 < SC.a1);
            if (pd < G.range && in0) Entities.hurtPlayer(scene, p, G.dmg, time, 'the swamp gas', true);
          }
        }
        if (allDone) C.gas = null;
      }

      // ---- THE GRAND BREW: splashes → the POT TIPS → she crawls out -------
      if (C.brew) {
        var B = C.brew;
        for (var bi = 0; bi < B.splashes.length; bi++) {
          var SP = B.splashes[bi];
          if (SP.fired || time < SP.at) continue;
          SP.fired = true;
          try { SP.g.destroy(); } catch (e) {}
          scene.burst(SP.x, SP.y, 14, 0x9ee83f);
          scene.cameras.main.shake(90, 0.005);
          try { AUDIO.play('flasksmash'); } catch (e) {}
          if (alive && Math.hypot(p.x - SP.x, p.y - SP.y) < B.splashR)
            Entities.hurtPlayer(scene, p, B.splashDmg, time, 'the raining brew', true);
        }
        if (!B.waved && time >= B.waveAt) {
          B.waved = true;
          try { B.waveG.destroy(); } catch (e) {}
          var A = C.arena, side = B.side;                     // 0 = west half, 1 = east half
          var fw = scene.add.graphics().setDepth(9);
          fw.fillStyle(0x9ee83f, 0.4);
          fw.fillRect(side ? A.x : A.x - A.rx * 1.3, A.y - A.ry * 1.4, A.rx * 1.3, A.ry * 2.8);
          scene.tweens.add({ targets: fw, alpha: 0, duration: 450, onComplete: (function (f2) { return function () { try { f2.destroy(); } catch (e) {} }; })(fw) });
          scene.cameras.main.shake(300, 0.012);
          try { AUDIO.play('waveroar'); } catch (e) {}
          var inHalf = function (x, y) {
            if (Math.abs(y - A.y) > A.ry * 1.5 || Math.abs(x - A.x) > A.rx * 1.5) return false;
            return side ? x >= A.x : x < A.x;
          };
          // mobs die FIRST (env credit), the player LAST
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && inHalf(m.x, m.y)) scene.killMobCredited(m);
          });
          if (alive && inHalf(p.x, p.y))
            Entities.hurtPlayer(scene, p, B.waveDmg, time, 'the tipped pot', true);
        }
        if (time >= B.emergeAt) {
          var b = scene.boss;
          C.brew = null;
          if (b && b.active) {
            b.body.reset(C.cauldron.x, C.cauldron.y + 44);
            b.setVisible(true); b.body.enable = true;
            b.boss.ventedUntil = time + B.ventMs;
            b.boss.ventDmgMult = B.ventDmgMult;
            b.boss.rootUntil = time + B.ventMs;
            b.setTint(0xd8ffa0);
            (function (b2) { scene.time.delayedCall(B.ventMs, function () { if (b2.active) b2.clearTint(); }); })(b);
            scene.banner('SHE CRAWLS OUT DIZZY\ndripping and WINDED — unload', '#d8ffa0');
            scene.burst(b.x, b.y, 24, 0x9ee83f);
          }
        }
      }

      SW._wrap(scene);
      SW._runZones(scene, time);
    },

    // -------------------------------------------------- totem machinery ----
    _totemWarn: function (scene, C, siteIdx, hex, time, cfg) {
      var x = SITES[siteIdx][0] * scene.worldW, y = SITES[siteIdx][1] * scene.worldH;
      var g = scene.add.circle(x, y, 40, HEX_TINT[hex], 0.15)
        .setStrokeStyle(2, HEX_TINT[hex], 0.9).setDepth(2).setScale(0.4);
      scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
      C.totemWarns.push({ siteIdx: siteIdx, hex: hex, x: x, y: y, at: time + cfg.warnMs, g: g });
      try { AUDIO.play('totemrise'); } catch (e) {}
      scene.banner('A HEX TOTEM STIRS\nsite ' + 'ABCDE'[siteIdx] + ' — ' + hex.toUpperCase() + ' hex', '#b088d8');
    },
    _totemRise: function (scene, C, siteIdx, hex, x, y, hp, bossOwned, time, cfg) {
      var spr = scene.add.sprite(x, y, 'swTotem').setScale(1.7).setDepth(3);
      spr.setTint(HEX_TINT[hex]);
      scene.tweens.add({ targets: spr, scaleY: { from: 0.3, to: 1.7 }, duration: 300 });
      var auraG = scene.add.graphics().setDepth(1.6);
      C.totemSeq = (C.totemSeq || 0) + 1;                     // M7k AUDIT fix: shot-dedup id
      C.totems.push({ siteIdx: siteIdx, hex: hex, x: x, y: y, hp: hp, maxHp: hp,
        tid: C.totemSeq,
        spr: spr, auraG: auraG, auraR: cfg.auraR, bornAt: time, nextDrainAt: time + cfg.drainTickMs,
        bossOwned: !!bossOwned });
      scene.burst(x, y, 12, HEX_TINT[hex]);
      try { AUDIO.play('totemrise'); } catch (e) {}
    },
    _totemShatter: function (scene, C, T, time, silent) {
      var i = C.totems.indexOf(T);
      if (i >= 0) C.totems.splice(i, 1);
      try { T.spr.destroy(); } catch (e) {}
      try { T.auraG.destroy(); } catch (e) {}
      if (silent) return;
      scene.burst(T.x, T.y, 18, HEX_TINT[T.hex]);
      scene.cameras.main.shake(90, 0.005);
      try { AUDIO.play('totemshatter'); } catch (e) {}
      // splinter burst: env credit for mobs caught — NO player damage
      var cfg = scene.realmDef.totem;
      scene.mobs.children.iterate(function (m) {
        if (m && m.active && Math.hypot(m.x - T.x, m.y - T.y) < cfg.splinterR) scene.killMobCredited(m);
      });
    },
    _clearGas: function (C) {
      if (C.gas) { C.gas.seq.forEach(function (S2) { if (!S2.fired) { try { S2.g.destroy(); } catch (e) {} } }); C.gas = null; }
    },
    _clearBrew: function (scene, C) {
      if (C.brew) {
        C.brew.splashes.forEach(function (S2) { if (!S2.fired) { try { S2.g.destroy(); } catch (e) {} } });
        if (!C.brew.waved) { try { C.brew.waveG.destroy(); } catch (e) {} }
        C.brew = null;
      }
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._sw; if (!C) return;
      if (C.totemCycle.nextAt && C.totemCycle.nextAt !== Infinity) C.totemCycle.nextAt += dt;
      C.totemWarns.forEach(function (Wn) { Wn.at += dt; });
      C.totems.forEach(function (T) { T.bornAt += dt; T.nextDrainAt += dt; });
      C.patches.forEach(function (P) {
        if (P.dieAt !== Infinity) P.dieAt += dt;
        if (P.nextTickAt) P.nextTickAt += dt;
      });
      C.zones.forEach(function (z) { z.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      if (C.latch) C.latch.until += dt;
      if (C.gas) C.gas.seq.forEach(function (S2) { if (!S2.fired) S2.at += dt; });
      if (C.brew) {
        C.brew.splashes.forEach(function (S2) { if (!S2.fired) S2.at += dt; });
        C.brew.waveAt += dt; C.brew.emergeAt += dt;
      }
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        // M7k AUDIT fix: nextLungeAt/lungeUntil removed — core shifts both
        // for every mob already; the double shift stretched leech dashes
        ['lungeAt', 'nextDrainAt', 'tuckUntil', 'tuckCdUntil',
         'nextSnapAt', 'snapLockUntil', 'nextSporeAt', 'nextLobAt', 'nextStrikeAt',
         'strikeLockUntil', 'strikeUntil', 'nextHealAt', 'nextHopAt', 'hopUntil', 'smashAt',
         'nextSpewAt', 'wakeAt', 'nextComboAt', 'chargeLockUntil', 'chargeUntil'].forEach(function (k) {
          if (m.mob[k]) m.mob[k] += dt;
        });
        if (m.mob.pound && m.mob.pound.until) m.mob.pound.until += dt;
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextAddsAt', 'nextBrewAt', 'busyUntil',
         'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._sw; if (!C) return;
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
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} });
      C.rings = [];
      for (var i = C.patches.length - 1; i >= 0; i--) {
        if (C.patches[i].dieAt === Infinity) continue;        // the mire seeps stay
        if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} }
        C.patches.splice(i, 1);
      }
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} });
      C.mobWarns = [];
      C.latch = null;
    },

    // ================================================== BOSS ARRIVAL =======
    // The giant cauldron bubbles harder and harder, glowing green, bloops
    // quickening → THE BREWMISTRESS rises out of the brew ladle-first,
    // dripping, cackles. Title card, THEN r.scanning.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._sw, self = scene;
      var ax = C.arena.x, ay = C.arena.y;
      C.latch = null;                                         // latch breaks on boss arrival
      C.totemCycle.nextAt = Infinity;                         // the totems hold their breath
      scene.player.setPosition(ax, ay + C.arena.ry - 24);
      scene.cameras.main.centerOn(ax, ay);
      // the cauldron bubbles accelerate
      var kx = C.cauldron.x, ky = C.cauldron.y;
      [600, 1100, 1500, 1800, 2000].forEach(function (at, i) {
        scene.time.delayedCall(at * (def.entranceMs / 3200), function () {
          if (self.closing) return;
          self.burst(kx, ky - 20, 6 + i * 3, 0x9ee83f);
          try { AUDIO.play('cauldronbloop'); } catch (e) {}
        });
      });
      scene.tweens.add({ targets: C.cauldron, scaleX: 2.35, scaleY: 2.35, duration: 260,
        yoyo: true, repeat: Math.floor(def.entranceMs / 550) });
      var glow = scene.add.circle(kx, ky, 60, 0x9ee83f, 0.18).setDepth(1.5);
      scene.tweens.add({ targets: glow, alpha: { from: 0.15, to: 0.5 }, duration: 400, yoyo: true, repeat: 4 });
      scene.banner('THE CAULDRON BOILS OVER\nsomething rises through the brew', '#9ee83f');
      scene.time.delayedCall(def.entranceMs * 0.55, function () {
        if (self.closing || !self.player.state.alive) return;
        self.spawnBossNow(def, kx, ky + 44);
        if (self.boss) {
          var b = self.boss;
          b.setPosition(kx, ky + 10);
          b.setAlpha(0).setScale(b.scaleX * 0.6, b.scaleY * 0.6);
          self.tweens.add({ targets: b, y: ky + 44, alpha: 1, scaleX: b.scaleX / 0.6, scaleY: b.scaleY / 0.6,
            duration: 520, ease: 'Quad.Out',
            onComplete: function () {
              if (!b.active) return;
              self.burst(b.x, b.y, 20, 0x9ee83f);              // dripping brew
              self.cameras.main.shake(200, 0.008);
              try { AUDIO.play('witchcackle'); } catch (e) {}
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
      var bs = b.boss, PT = bs.def.patterns, C = scene._sw;
      if (!bs._swInit) {
        bs._swInit = true;
        bs.verbIdx = 0;
        bs.nextVerbAt = time + 2600;
        bs.nextAddsAt = time + PT.adds.everyMs * 0.5;
        bs.nextBrewAt = time + PT.grandBrew.firstDelayMs;
        bs.busyUntil = 0; bs.rootUntil = 0;
      }
      if (!bs._overclocked && bs.hp <= bs.maxHp * PT.overclock.hpPct) {
        bs._overclocked = true;
        bs.rateMult = (bs.rateMult || 1) * PT.overclock.rateMult;
        scene.banner('THE POT BOILS FASTER\nevery cycle tightens', '#9ee83f');
      }
      var rate = bs.rateMult || 1;
      if (C.brew) { b.setVelocity(0, 0); return; }            // she's IN the pot
      if (time < bs.rootUntil) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1;
        var spd = bs.def.spd * (bs.spdMult || 1);
        if (d > 120) b.setVelocity(dx / d * spd, dy / d * spd);
        else b.setVelocity(0, 0);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextBrewAt) {
        bs.nextBrewAt = time + PT.grandBrew.everyMs * rate;
        SW._grandBrew(scene, b, time);
      } else if (time >= bs.nextAddsAt) {
        bs.nextAddsAt = time + PT.adds.everyMs * rate;
        SW._summonBrew(scene, b, time);
      } else if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs * rate;
        var v = ['ladle', 'flask', 'totem', 'gas'][bs.verbIdx % 4];
        bs.verbIdx++;
        if (v === 'ladle') SW._ladleSwing(scene, b, player, time);
        else if (v === 'flask') SW._flaskVolley(scene, b, player, time);
        else if (v === 'totem') SW._plantTotem(scene, b, player, time);
        else SW._swampGas(scene, b, time);
      }
    },

    // LADLE SWING — locked cone flash → heavy swat (damage + knockback).
    _ladleSwing: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.ladleSwing;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(0x9ee83f, 0.15); g.lineStyle(2, 0xd8ffa0, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
      g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      var self = scene, bx = b.x, by = b.y;
      scene.time.delayedCall(cfg.warnMs, function () {
        try { g.destroy(); } catch (e) {}
        if (!self.boss || !self.boss.active) return;          // M7k AUDIT fix: dead-caster guard
        var fg = self.add.graphics().setDepth(9);
        fg.fillStyle(0xd8ffa0, 0.5);
        fg.slice(bx, by, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(130, 0.007);
        try { AUDIO.play('ladlewhoosh'); } catch (e) {}
        var p = self.player;
        if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by);
        var pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "the Brewmistress's ladle", true);
          p.body.velocity.x += Math.cos(ang) * cfg.kb;
          p.body.velocity.y += Math.sin(ang) * cfg.kb;
        }
      });
    },
    // FLASK VOLLEY — 3 brews onto warned circles → toxic seep pools linger.
    _flaskVolley: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.flaskVolley;
      for (var i = 0; i < cfg.count; i++) {
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
        var a = SIM.rng() * Math.PI * 2;
        SW._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
          cfg.radius, cfg.warnMs, cfg.dmg, 'a brew flask', true, false, time,
          { leaveSeep: { lifeMs: cfg.seepMs, dmg: cfg.seepDmg, tickMs: cfg.seepTickMs } });
      }
      try { AUDIO.play('flasksmash'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    // PLANT A HEX TOTEM — the map mechanic weaponized (slow hex, shorter hp).
    // NEVER while 2 map totems are up — reroutes to FLASK VOLLEY.
    _plantTotem: function (scene, b, player, time) {
      var C = scene._sw, cfg = b.boss.def.patterns.plantTotem;
      var mapUp = C.totems.filter(function (T) { return !T.bossOwned; }).length;
      var bossUp = C.totems.some(function (T) { return T.bossOwned; });
      if (mapUp >= 2 || bossUp) { SW._flaskVolley(scene, b, player, time); return; }
      var A = C.arena;
      var tx = player.x + (SIM.rng() * 2 - 1) * 80, ty = player.y + (SIM.rng() * 2 - 1) * 80;
      var dd = Math.hypot(tx - A.x, ty - A.y);
      if (dd > A.rx * 0.8) { tx = A.x + (tx - A.x) / dd * A.rx * 0.8; ty = A.y + (ty - A.y) / dd * A.rx * 0.8; }
      SW._totemRise(scene, C, -1, 'slow', tx, ty, cfg.hp, true, time, scene.realmDef.totem);
      scene.banner('SHE PLANTS A HEX TOTEM\nshoot it down', '#b088d8');
      scene.cameras.main.shake(120, 0.006);
      b.boss.busyUntil = time + 600;
    },
    // SWAMP GAS — telegraphed expanding cloud sectors; move out.
    _swampGas: function (scene, b, time) {
      var C = scene._sw, cfg = b.boss.def.patterns.swampGas;
      if (C.gas) return;
      var base = SIM.rng() * Math.PI * 2;
      var seq = [];
      for (var i = 0; i < cfg.count; i++) {
        var a0 = (base + i * Math.PI * 2 / cfg.count) % (Math.PI * 2), a1 = a0 + Math.PI * 2 / cfg.count * 0.85;
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x9ee83f, 0.12); g.lineStyle(1, 0xd8ffa0, 0.75);
        g.slice(b.x, b.y, cfg.range, a0, a1, false);
        g.fillPath(); g.strokePath();
        seq.push({ a0: a0, a1: a1, at: time + cfg.warnMs + i * cfg.gapMs, fired: false, g: g });
      }
      C.gas = { x: b.x, y: b.y, range: cfg.range, seq: seq, dmg: cfg.dmg };
      b.boss.busyUntil = time + cfg.warnMs + cfg.count * cfg.gapMs + 300;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('SWAMP GAS\nthe clouds sweep in order — move out', '#9ee83f');
      try { AUDIO.play('gashiss'); } catch (e) {}
    },
    // SUMMON THE BREW — boglings + a bottled imp pour from the cauldron.
    _summonBrew: function (scene, b, time) {
      var C = scene._sw, cfg = b.boss.def.patterns.adds;
      var aliveM = 0;
      scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      if (aliveM >= cfg.cap) return;
      for (var i = 0; i < cfg.boglings; i++) {
        scene.queueSpawn({ key: 'bogling', bossWave: true,
          x: C.cauldron.x + (SIM.rng() * 2 - 1) * 60, y: C.cauldron.y + 40 + SIM.rng() * 40 });
      }
      scene.queueSpawn({ key: 'bottledImp', bossWave: true, x: C.cauldron.x, y: C.cauldron.y + 60 });
      scene.banner('SUMMON THE BREW\nthe pot pours out its children', '#9ee83f');
      try { AUDIO.play('cauldronbloop'); } catch (e) {}
      b.boss.busyUntil = time + 600;
    },
    // THE GRAND BREW — she dives IN; splashes rain; the POT TIPS a half-arena
    // wave (fixed alternating halves, clearly warned); she crawls out WINDED.
    _grandBrew: function (scene, b, time) {
      var C = scene._sw, cfg = b.boss.def.patterns.grandBrew;
      if (C.brew) return;
      var A = C.arena;
      // she dives into the cauldron — untargetable; the pot is the actor now
      b.body.reset(C.cauldron.x, C.cauldron.y);
      b.setVisible(false); b.body.enable = false;
      scene.burst(C.cauldron.x, C.cauldron.y - 10, 18, 0x9ee83f);
      try { AUDIO.play('cauldronsplash'); } catch (e) {}
      var splashes = [];
      for (var i = 0; i < cfg.splashCount; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * A.rx * 0.85;
        var fx = A.x + Math.cos(a) * rr, fy = A.y + Math.sin(a) * rr * 0.8;
        var g = scene.add.circle(fx, fy, cfg.splashR, 0x9ee83f, 0.13)
          .setStrokeStyle(2, 0xd8ffa0, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.splashWarnMs + i * cfg.splashGapMs });
        splashes.push({ x: fx, y: fy, at: time + cfg.splashWarnMs + i * cfg.splashGapMs, fired: false, g: g });
      }
      // the POT TIPS: fixed ALTERNATING halves, warned long
      C.waveSide = 1 - C.waveSide;
      var side = C.waveSide;
      var waveG = scene.add.graphics().setDepth(1.7);
      waveG.fillStyle(0x9ee83f, 0.1); waveG.lineStyle(3, 0xd8ffa0, 0.8);
      waveG.fillRect(side ? A.x : A.x - A.rx * 1.3, A.y - A.ry * 1.4, A.rx * 1.3, A.ry * 2.8);
      waveG.strokeRect(side ? A.x : A.x - A.rx * 1.3, A.y - A.ry * 1.4, A.rx * 1.3, A.ry * 2.8);
      var waveAt = time + cfg.splashWarnMs + cfg.splashCount * cfg.splashGapMs + cfg.waveWarnMs;
      C.brew = { splashes: splashes, splashR: cfg.splashR, splashDmg: cfg.splashDmg,
                 side: side, waveG: waveG, waveAt: waveAt, waved: false,
                 waveDmg: cfg.waveDmg, emergeAt: waveAt + 500,
                 ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = C.brew.emergeAt + 200;
      b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('THE GRAND BREW\nshe dives in — the ' + (side ? 'EAST' : 'WEST') + ' half will flood', '#9ee83f');
    },

    // =============================================== MOB VERBS (map-new) ===
    // GIANT LEECH — telegraphed lunge; LATCH = short drain (shake off by
    // moving on, shooting it, or any hitstop — the pirate-pin brevity rule).
    _leech: function (scene, m, player, time) {
      var cfg = m.mob.def.latch, C = scene._sw;
      if (C.latch && C.latch.m === m) {
        if (m.mob.hp < m.mob._latchHp) {                      // shot off
          C.latch = null;
          m.mob.nextLungeAt = time + cfg.cooldownMs;
          m.mob._latchHp = m.mob.hp;
          return true;
        }
        m.mob._latchHp = m.mob.hp;
        m.body.reset(player.x + 12, player.y - 8);
        if (time >= m.mob.nextDrainAt) {
          m.mob.nextDrainAt = time + cfg.drainTickMs;
          Entities.hurtPlayer(scene, player, cfg.drainDmg, time, 'a latched leech');
        }
        return true;
      }
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); return true; }
        if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < 34 && !C.latch) {
          m.mob.lungeUntil = 0;
          C.latch = { m: m, until: time + cfg.latchMs };      // SHORT (~0.8s)
          m.mob._latchHp = m.mob.hp;
          m.mob.nextDrainAt = time;
          try { AUDIO.play('leechlatch'); } catch (e) {}
          scene.damageNumber(player.x, player.y - 24, 'LATCHED', '#a02830');
        }
        return true;
      }
      if (m.mob.lungeAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xa02830 : 0xffffff);
        if (time >= m.mob.lungeAt) {
          m.mob.lungeAt = 0;
          m.clearTint();
          var a = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(a) * cfg.dashSpeed, Math.sin(a) * cfg.dashSpeed);
        }
        return true;
      }
      if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + cfg.cooldownMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLungeAt && d < cfg.range && player.state.alive) {
        m.mob.nextLungeAt = time + cfg.cooldownMs;
        m.mob.lungeAt = time + cfg.warnMs;
        return true;
      }
      return false;
    },
    // SNAPJAW TURTLE — neck-snap cone; TUCKS into the shell when shot (brief
    // damage-refund armor, cooldown-capped so it can't turtle forever).
    _turtle: function (scene, m, player, time) {
      var cfg = m.mob.def.snap, tk = m.mob.def.tuck;
      if (m.mob._tHp === undefined) m.mob._tHp = m.mob.hp;
      if (m.mob._tucked) {
        if (time >= m.mob.tuckUntil) { m.mob._tucked = false; m.clearTint(); }
        else {
          m.setVelocity(0, 0);
          if (m.mob.hp < m.mob._tHp) {                        // shell TINKS — refund
            m.mob.hp = m.mob._tHp;
            scene.damageNumber(m.x, m.y - 24, 'TINK', '#a89e80');
            try { AUDIO.play('shelltink'); } catch (e) {}
          }
          return true;
        }
      } else if (m.mob.hp < m.mob._tHp && time >= (m.mob.tuckCdUntil || 0)) {
        m.mob._tucked = true;
        m.mob.tuckUntil = time + tk.tuckMs;
        m.mob.tuckCdUntil = time + tk.tuckMs + tk.cdMs;
        m.mob._tHp = m.mob.hp;
        m.setTint(0x8a9e4a);
        m.setVelocity(0, 0);
        return true;
      }
      m.mob._tHp = m.mob.hp;
      // neck-snap cone
      if (m.mob.snapLockUntil && time < m.mob.snapLockUntil) { m.setVelocity(0, 0); return true; }
      if (!m.mob.nextSnapAt) m.mob.nextSnapAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSnapAt && d < cfg.range && player.state.alive) {
        m.mob.nextSnapAt = time + cfg.everyMs;
        m.mob.snapLockUntil = time + cfg.warnMs;
        var ang = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2);
        g.fillStyle(0x9ee83f, 0.13); g.lineStyle(2, 0xd8ffa0, 0.8);
        g.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false);
        g.fillPath(); g.strokePath();
        var self = scene, mx = m.x, my = m.y;
        scene.time.delayedCall(cfg.warnMs, function () {
          try { g.destroy(); } catch (e) {}
          if (!player.state.alive || !m.active) return;       // M7k AUDIT fix: dead-caster guard
          try { AUDIO.play('serpenthiss'); } catch (e) {}
          var pd = Math.hypot(player.x - mx, player.y - my);
          var pa = Math.atan2(player.y - my, player.x - mx);
          var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
          if (pd < cfg.range && Math.abs(diff) < cfg.halfRad)
            Entities.hurtPlayer(self, player, cfg.dmg, self.time.now, "a Snapjaw's bite");
        });
        return true;
      }
      return false;
    },
    // SPORECAP MYCONID — telegraphed spore circles → violet SLOW clouds.
    _myconid: function (scene, m, player, time) {
      var cfg = m.mob.def.spore;
      if (!m.mob.nextSporeAt) m.mob.nextSporeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextSporeAt && d < cfg.range && player.state.alive) {
        m.mob.nextSporeAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var a = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : 60 + SIM.rng() * 60;
          SW._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.radius, cfg.warnMs, 0, 'spores', false, false, time,
            { leaveSlow: { lifeMs: cfg.lifeMs, slowMult: 0.55 } });
        }
        m.setTint(0xb088d8);
        (function (m2) { scene.time.delayedCall(260, function () { if (m2.active) m2.clearTint(); }); })(m);
        try { AUDIO.play('gashiss'); } catch (e) {}
        return true;
      }
      return false;
    },
    // TOAD ALCHEMIST — brew flasks onto warned circles → toxic seep pools.
    _toad: function (scene, m, player, time) {
      var cfg = m.mob.def.mortar;
      if (!m.mob.nextLobAt) m.mob.nextLobAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextLobAt && d < cfg.range && player.state.alive) {
        m.mob.nextLobAt = time + cfg.everyMs;
        for (var i = 0; i < cfg.count; i++) {
          var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter;
          var a = SIM.rng() * Math.PI * 2;
          SW._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.radius, cfg.warnMs, cfg.dmg, "a Toad Alchemist's flask", false, false, time,
            { leaveSeep: { lifeMs: cfg.seepMs, dmg: cfg.seepDmg, tickMs: cfg.seepTickMs } });
        }
        scene.burst(m.x, m.y - 16, 8, 0x9ee83f);
        try { AUDIO.play('flasksmash'); } catch (e) {}
        return true;
      }
      return false;
    },
    // MIRE SERPENT — telegraphed strike lane (wrap-aware warn) → S-strike.
    _serpent: function (scene, m, player, time) {
      var cfg = m.mob.def.strike;
      if (m.mob.strikeUntil) {
        if (time >= m.mob.strikeUntil) { m.mob.strikeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._strikeAng) * cfg.speed, Math.sin(m.mob._strikeAng) * cfg.speed);
        return true;
      }
      if (m.mob.strikeLockUntil) {
        if (time >= m.mob.strikeLockUntil) {
          m.mob.strikeLockUntil = 0;
          (m.mob._strikeG || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
          m.mob._strikeG = null;
          m.mob.strikeUntil = time + cfg.strikeMs;
          m.setVelocity(Math.cos(m.mob._strikeAng) * cfg.speed, Math.sin(m.mob._strikeAng) * cfg.speed);
          try { AUDIO.play('serpenthiss'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      if (!m.mob.nextStrikeAt) m.mob.nextStrikeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextStrikeAt && d < cfg.range && player.state.alive) {
        m.mob.nextStrikeAt = time + cfg.everyMs;
        m.mob.strikeLockUntil = time + cfg.warnMs;
        m.mob._strikeAng = Math.atan2(player.y - m.y, player.x - m.x);
        // wrap-aware warn (rider lesson): both sides of the seam
        var WW = scene.worldW, HH = scene.worldH;
        var x1 = m.x + Math.cos(m.mob._strikeAng) * cfg.len, y1 = m.y + Math.sin(m.mob._strikeAng) * cfg.len;
        var gs = [SW._laneWarn(scene, m.x, m.y, x1, y1, cfg.half)];
        if (x1 < 0 || x1 >= WW) {
          var sx = x1 < 0 ? WW : -WW;
          gs.push(SW._laneWarn(scene, m.x + sx, m.y, x1 + sx, y1, cfg.half));
        }
        if (y1 < 0 || y1 >= HH) {
          var sy = y1 < 0 ? HH : -HH;
          gs.push(SW._laneWarn(scene, m.x, m.y + sy, x1, y1 + sy, cfg.half));
        }
        m.mob._strikeG = gs;
        return true;
      }
      return false;
    },
    _laneWarn: function (scene, x0, y0, x1, y1, half) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, 0x9ee83f, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, 0xd8ffa0, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    // GLOWCAP SPRITE — mends nearby mobs (priority target); flits from you.
    _sprite: function (scene, m, player, time) {
      var cfg = m.mob.def.mend;
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.fleeRange && player.state.alive) {
        var a = Math.atan2(m.y - player.y, m.x - player.x);
        m.setVelocity(Math.cos(a) * m.mob.def.spd * 1.4, Math.sin(a) * m.mob.def.spd * 1.4);
      } else m.setVelocity(0, 0);
      if (!m.mob.nextHealAt) m.mob.nextHealAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.7);
      if (!scene.hitstopActive && time >= m.mob.nextHealAt) {   // respects hitstop
        var best = null, bestD = cfg.range;
        scene.mobs.children.iterate(function (o) {
          if (!o || !o.active || !o.mob || o === m || o.mob.hp >= o.mob.maxHp) return;
          var dd = Math.hypot(o.x - m.x, o.y - m.y);
          if (dd < bestD) { bestD = dd; best = o; }
        });
        if (best) {
          m.mob.nextHealAt = time + cfg.everyMs;
          best.mob.hp = Math.min(best.mob.maxHp, best.mob.hp + cfg.heal);
          best.setTint(0xd8ffa0);
          (function (o2) { scene.time.delayedCall(240, function () { if (o2.active) o2.clearTint(); }); })(best);
          scene.damageNumber(best.x, best.y - 24, '+' + cfg.heal, '#9ee83f');
          scene.burst(m.x, m.y, 5, 0xd8ffa0);
        }
      }
      return true;                                            // she never chases
    },
    // BOTTLED IMP — jar hops at you; SMASHES on a warned circle → flame patch.
    _imp: function (scene, m, player, time) {
      var cfg = m.mob.def.smash, C = scene._sw;
      if (m.mob.smashAt) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? 0xff9a3f : 0xffffff);
        if (time >= m.mob.smashAt) {
          if (m.mob._smashWarn) { m.mob._smashWarn.dead = true; m.mob._smashWarn = null; }
          scene.burst(m.x, m.y, 16, 0xff9a3f);
          try { AUDIO.play('flasksmash'); } catch (e) {}
          var obj = scene.add.circle(m.x, m.y, cfg.flameR, 0xff9a3f, 0.24).setDepth(1.2);
          C.patches.push({ x: m.x, y: m.y, r: cfg.flameR, dieAt: time + cfg.flameMs, obj: obj,
                           dmg: cfg.flameDmg, tickMs: cfg.flameTickMs, nextTickAt: 0, src: 'imp fire' });
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.radius)
            Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Bottled Imp's smash");
          scene.killMobCredited(m);
        }
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.triggerRange && player.state.alive) {
        m.mob.smashAt = time + cfg.warnMs;
        var g = scene.add.circle(m.x, m.y, cfg.radius, 0xff9a3f, 0.12)
          .setStrokeStyle(2, 0xff9a3f, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        m.mob._smashWarn = { m: m, g: g };
        C.mobWarns.push(m.mob._smashWarn);
        return true;
      }
      // jar hops toward you
      if (m.mob.hopUntil) {
        if (time >= m.mob.hopUntil) { m.mob.hopUntil = 0; m.setVelocity(0, 0); }
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.hopEveryMs * (0.3 + SIM.rng() * 0.7);
      if (time >= m.mob.nextHopAt && player.state.alive) {
        m.mob.nextHopAt = time + cfg.hopEveryMs;
        m.mob.hopUntil = time + cfg.hopMs;
        var a = Math.atan2(player.y - m.y, player.x - m.x);
        m.setVelocity(Math.cos(a) * cfg.hopSpeed, Math.sin(a) * cfg.hopSpeed);
        return true;
      }
      m.setVelocity(0, 0);
      return true;                                            // it only ever hops
    },
    // CAULDRON MIMIC — elite; heavy hops (quake rings on landing) + brew
    // arcs onto warned circles → seep pools.
    _mimic: function (scene, m, player, time) {
      var cfg = m.mob.def.mimic, C = scene._sw;
      if (m.mob.hopUntil) {
        if (time >= m.mob.hopUntil) {
          m.mob.hopUntil = 0;
          m.setVelocity(0, 0);
          var g = scene.add.graphics().setDepth(2);
          C.rings.push({ x: m.x, y: m.y, r: 24, r0: 24, maxR: cfg.quakeR, start: time,
            until: time + cfg.quakeMs, dmg: cfg.quakeDmg, src: "a Cauldron Mimic's landing",
            fromBoss: false, hit: false, g: g, tint: 0x9ee83f });
          scene.cameras.main.shake(90, 0.005);
          try { AUDIO.play('mimicclang'); } catch (e) {}
        }
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (!m.mob.nextSpewAt) m.mob.nextSpewAt = time + cfg.spewEveryMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextSpewAt && d < 420 && player.state.alive) {
        m.mob.nextSpewAt = time + cfg.spewEveryMs;
        for (var i = 0; i < cfg.spewCount; i++) {
          var a = SIM.rng() * Math.PI * 2, rr = (i === 0) ? 0 : 60 + SIM.rng() * 80;
          SW._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr,
            cfg.spewRadius, cfg.spewWarnMs, cfg.spewDmg, "a Cauldron Mimic's brew", false, false, time,
            { leaveSeep: { lifeMs: cfg.seepMs, dmg: cfg.seepDmg, tickMs: cfg.seepTickMs } });
        }
        try { AUDIO.play('flasksmash'); } catch (e) {}
        return true;
      }
      if (!m.mob.nextHopAt) m.mob.nextHopAt = time + cfg.hopEveryMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.nextHopAt && d < 480 && player.state.alive) {
        m.mob.nextHopAt = time + cfg.hopEveryMs;
        m.mob.hopUntil = time + cfg.hopMs;
        var ha = Math.atan2(player.y - m.y, player.x - m.x);
        m.setVelocity(Math.cos(ha) * cfg.hopSpeed, Math.sin(ha) * cfg.hopSpeed);
        try { AUDIO.play('mimicclang'); } catch (e) {}
        return true;
      }
      return false;
    },
    // MOSSBACK — elite hulk; sleeps as a mossy mound (targetable, 0 aggro —
    // shooting wakes it); shimmer on the MOB only → wakes furious:
    // charge + slam combo.
    _mossback: function (scene, m, player, time) {
      var cfg = m.mob.def.rage;
      if (!m.mob.awake) {
        m.setVelocity(0, 0);
        if (m.mob._sleepHp === undefined) m.mob._sleepHp = m.mob.hp;
        var shot = m.mob.hp < m.mob._sleepHp;
        var d0 = Math.hypot(player.x - m.x, player.y - m.y);
        if (!m.mob.wakeAt) {
          if (shot || (d0 < cfg.wakeRange && player.state.alive)) {
            m.mob.wakeAt = time + (shot ? 200 : cfg.warnMs);
          }
          return true;
        }
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xa02830 : 0xffffff);   // the shimmer tell
        if (time >= m.mob.wakeAt) {
          m.mob.awake = true;
          m.clearTint();
          scene.burst(m.x, m.y, 16, 0x8a9e4a);
          scene.cameras.main.shake(200, 0.008);
          try { AUDIO.play('mossroar'); } catch (e) {}
        }
        return true;
      }
      // charging (ram tech)
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) { m.mob.chargeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
        return true;
      }
      if (m.mob.chargeLockUntil) {
        if (time >= m.mob.chargeLockUntil) {
          m.mob.chargeLockUntil = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
          try { AUDIO.play('mossroar'); } catch (e) {}
        } else m.setVelocity(0, 0);
        return true;
      }
      // slamming
      if (m.mob.pound) {
        m.setVelocity(0, 0);
        if (time >= m.mob.pound.until) m.mob.pound = null;
        return true;
      }
      if (!m.mob.nextComboAt) m.mob.nextComboAt = time + cfg.comboEveryMs * (0.3 + SIM.rng() * 0.5);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextComboAt && d < cfg.range && player.state.alive) {
        m.mob.nextComboAt = time + cfg.comboEveryMs;
        m.mob.comboIdx = (m.mob.comboIdx || 0) + 1;
        if (m.mob.comboIdx % 2 === 1) {                       // CHARGE
          m.mob.chargeLockUntil = time + cfg.chargeWarnMs;
          m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob._chargeG = SW._laneWarn(scene, m.x, m.y,
            m.x + Math.cos(m.mob._chargeAng) * cfg.chargeLen,
            m.y + Math.sin(m.mob._chargeAng) * cfg.chargeLen, cfg.chargeHalf);
        } else {                                              // SLAM
          m.mob.pound = { until: time + cfg.slamWarnMs };
          SW._zone(scene, m.x, m.y, cfg.slamRadius, cfg.slamWarnMs, cfg.slamDmg,
            "a Mossback's slam", false, false, time);
          try { AUDIO.play('crash'); } catch (e) {}
        }
        return true;
      }
      return false;                                           // core chase, furious
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

    // warn tints: env = brew green, boss = brew green too but brighter stroke
    // (green reads on moss, mud, murk AND ritual earth alike).
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._sw;
      var tint = fromBoss ? 0xd8ffa0 : 0x9ee83f;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, tint, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: warnMs });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src,
                fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._sw;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? 0xd8ffa0 : 0x9ee83f);
        if (z.dmg > 0) { scene.cameras.main.shake(90, 0.004); try { AUDIO.play('crash'); } catch (e) {} }
        // env kills FIRST (XP before any heal), the player LAST
        if (z.killMobs) {
          scene.mobs.children.iterate(function (m) {
            if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m);
          });
        }
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        // lingering pools
        if (z.opts && z.opts.leaveSeep) {
          var sp = z.opts.leaveSeep;
          var obj = scene.add.circle(z.x, z.y, z.r * 0.85, 0x5a9e18, 0.28).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r * 0.85, dieAt: time + sp.lifeMs, obj: obj,
                           dmg: sp.dmg, tickMs: sp.tickMs, nextTickAt: 0, src: 'the toxic seep' });
        }
        if (z.opts && z.opts.leaveSlow) {
          var sl = z.opts.leaveSlow;
          var obj2 = scene.add.circle(z.x, z.y, z.r, 0xb088d8, 0.22).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + sl.lifeMs, obj: obj2,
                           slowMult: sl.slowMult });
        }
      }
    }
    // M7k AUDIT fix: the dead _lane/_runLanes pair (no callers — the swamp's
    // line telegraphs all use _laneWarn + per-mob strike logic) was deleted.
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SW;
  root.SWAMP_SCENE = SW;
})(typeof window !== 'undefined' ? window : this);
