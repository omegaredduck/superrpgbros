// ============================================================================
// game/js/maps/colosseum/scene.js — THE COLOSSEUM scene hooks (M7 registry).
// The scene-plan PNG (assets/colosseum_scene_plan.png) is canon: a ROUND sand
// arena bounded by a marble WALL (collision ring — NO TOROIDAL WRAP, the
// campaign's one exception), CROWD TIERS ringing the outside (pure border
// art), a RIM TRACK ring (chariot laps), 3 BEAST GATES (N under the box, SW,
// SE), an IMPERIAL CARPET N-gate → center, scattered TRAPDOORS, and the BOSS
// CIRCLE at center. THE EMPEROR'S BOX presides north.
// THE PROGRAM is the signature map cycle: BEAST RELEASE → TRAPDOOR SHUFFLE →
// CHARIOT LAP → INTERMISSION, announced by trumpets + a placard.
// DIVINITY HIMSELF rides a gilded lift down, upends his cup, and WINE-WAVE
// SURFS to the center. His golden doom-rings, wine slicks, WINE FLOOD (P1)
// and DIONYSIAN DELUGE (P2) all leave VENTED windows. Every source fromBoss.
// All hooks reset their own state in setup() — Phaser reuses scene instances.
// ============================================================================
(function (root) {
  'use strict';

  var WARN_FILL = 0xd04848, WARN = 0xf8d878, CRIMSON = 0x8a1622, GOLD = 0xe0a832,
      PURPLE = 0x8a4a9a, WINE = 0xa02028;

  // fixed trapdoor + decor layout in plan-space (900-wide, CX 450 / CY 408),
  // converted to arena-relative offsets (dx,dy from center, as fractions of
  // half-world) at setup.
  var TRAP_PLAN = [[360, 330], [545, 330], [340, 480], [560, 480], [450, 540]];
  var DECOR = [
    ['coldObelisk', 0, -0.11, 2.0], ['coldColumn', -0.16, -0.02, 1.8], ['coldColumn', 0.16, -0.02, 1.8],
    ['coldPlinth', -0.13, 0.0, 1.6], ['coldPlinth', 0.13, 0.0, 1.6],
    ['coldStatue', -0.2, 0.04, 1.7], ['coldStatue', 0.2, 0.04, 1.7],
    ['coldBroken', -0.24, 0.14, 1.6], ['coldWolf', 0.19, -0.12, 1.7],
    ['coldRack', -0.13, 0.2, 1.5], ['coldPalus', 0.14, 0.2, 1.5],
    ['coldChains', -0.09, 0.06, 1.4], ['coldChains', 0.02, 0.11, 1.4],
    ['coldCage', -0.19, 0.19, 1.6], ['coldCage', 0.19, 0.19, 1.6]
  ];
  var GATE_ANG = [-Math.PI / 2, Math.PI * 0.75, Math.PI * 0.25]; // N, SW, SE

  function dist2seg(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    var t = L2 ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2)) : 0;
    return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
  }

  var COL = {

    // ======================================================== SETUP =========
    setup: function (scene, WW, HH) {
      var rd = (DATA.realms && DATA.realms.colosseum) || {};
      var af = rd.arena || { wallR: 0.42, trackR: 0.375, spawnR: 0.30, bossR: 0.05 };
      var cx = WW / 2, cy = HH / 2;
      var A = { x: cx, y: cy, wallR: af.wallR * WW, trackR: af.trackR * WW,
                spawnR: af.spawnR * WW, bossR: af.bossR * WW };
      var C = scene._col = {
        arena: A,
        crowd: [], gates: [], trapdoors: [], decorSprites: [], stageMobs: [],
        program: { nextAt: 0, stageIdx: -1, stage: null },
        zones: [], lanes: [], rings: [], patches: [], mobWarns: [],
        doomRings: [], wave: null, deluge: null, cupToss: null, netRoot: null,
        bossArmed: false, waveSide: 0
      };
      scene._zoneWarns = scene._zoneWarns || [];

      // ---- background void beyond the wall ----
      scene.add.rectangle(cx, cy, WW, HH, 0x141221).setDepth(-30);

      // ---- CROWD TIERS ring (pure border art — never collides/targets) ----
      var CROWD_R = A.wallR + WW * 0.055, seg = 22;
      for (var i = 0; i < seg; i++) {
        var a = (i / seg) * Math.PI * 2;
        var wx = cx + Math.cos(a) * CROWD_R, wy = cy + Math.sin(a) * CROWD_R;
        var spr = scene.add.sprite(wx, wy, 'colCrowd').setDepth(-26)
          .setRotation(a - Math.PI / 2).setScale(WW * 0.0016);
        C.crowd.push(spr);
      }

      // ---- RIM TRACK (annulus: track tile masked to the wall circle, under
      //      the sand which is masked to the field circle) ----
      var trackSpr = scene.add.tileSprite(cx, cy, A.wallR * 2 + 8, A.wallR * 2 + 8, 'coltTrack').setDepth(-23);
      var tg = scene.make.graphics({ add: false });
      tg.fillStyle(0xffffff, 1); tg.fillCircle(cx, cy, A.wallR);
      trackSpr.setMask(tg.createGeometryMask());

      // ---- SAND FIELD (masked circle, on top of the track) ----
      var sandSpr = scene.add.tileSprite(cx, cy, A.trackR * 2 + 8, A.trackR * 2 + 8, 'coltSand').setDepth(-22);
      var sg = scene.make.graphics({ add: false });
      sg.fillStyle(0xffffff, 1); sg.fillCircle(cx, cy, A.trackR);
      sandSpr.setMask(sg.createGeometryMask());

      // ---- IMPERIAL CARPET: N gate → center (his surf path) ----
      var carpet = scene.add.tileSprite(cx, cy - A.trackR * 0.5, WW * 0.05, A.trackR, 'coltCarpet').setDepth(-21);
      C.carpet = carpet;

      // ---- WALL ring (cosmetic marble ring) + banners ----
      var wall = scene.add.graphics().setDepth(-20);
      wall.lineStyle(WW * 0.012, 0xd8d4c8, 1); wall.strokeCircle(cx, cy, A.wallR);
      wall.lineStyle(2, 0x6a6458, 0.9); wall.strokeCircle(cx, cy, A.wallR + WW * 0.006);
      [Math.PI * 1.25, Math.PI * 1.75, Math.PI * 0.5, Math.PI].forEach(function (a) {
        C.decorSprites.push(scene.add.sprite(cx + Math.cos(a) * A.wallR, cy + Math.sin(a) * A.wallR, 'coldBanner').setScale(1.4).setDepth(2));
      });

      // ---- rim braziers inside the track ----
      for (var ba = Math.PI / 6; ba < Math.PI * 2; ba += Math.PI / 3) {
        C.decorSprites.push(scene.add.sprite(cx + Math.cos(ba) * A.trackR * 0.94, cy + Math.sin(ba) * A.trackR * 0.94, 'coldBrazier').setScale(1.5).setDepth(2));
      }

      // ---- BEAST GATES (N/SW/SE) + cage flanks ----
      GATE_ANG.forEach(function (a, gi) {
        var gx = cx + Math.cos(a) * A.wallR, gy = cy + Math.sin(a) * A.wallR;
        var gspr = scene.add.sprite(gx, gy, 'coldGate').setScale(2.0).setRotation(a - Math.PI / 2 + Math.PI).setDepth(1.5);
        C.gates.push({ x: gx, y: gy, ang: a, spr: gspr, openUntil: 0 });
      });

      // ---- BOSS CIRCLE (center chalk + red ring + wine stains) ----
      var bc = scene.add.graphics().setDepth(-19);
      bc.lineStyle(3, 0xf0e8d0, 0.9); bc.strokeCircle(cx, cy, A.bossR * 1.05);
      bc.lineStyle(2, 0x8a1622, 0.8); bc.strokeCircle(cx, cy, A.bossR * 0.88);

      // ---- EMPEROR'S BOX (north scenery — DIVINITY presides until the fight) ----
      C.box = scene.add.sprite(cx, cy - A.wallR - WW * 0.028, 'coldBox').setScale(3.0).setDepth(1);

      // ---- TRAPDOORS (fixed scatter mid-field) ----
      TRAP_PLAN.forEach(function (P) {
        var dx = (P[0] - 450) / 900, dy = (P[1] - 408) / 900;   // plan-space → world fraction
        var tx = cx + dx * WW, ty = cy + dy * WW;
        var tspr = scene.add.sprite(tx, ty, 'coldTrapdoor').setScale(1.6).setDepth(1.4).setVisible(false);
        C.trapdoors.push({ x: tx, y: ty, r: WW * 0.028, spr: tspr, state: 'closed',
                           warnAt: Infinity, openAt: Infinity, closeAt: Infinity, warnG: null });
      });

      // ---- decor scatter ----
      DECOR.forEach(function (D) {
        C.decorSprites.push(scene.add.sprite(cx + D[1] * WW, cy + D[2] * WW, D[0]).setScale(D[3]).setDepth(2));
      });
      C.decorSprites.push(scene.add.sprite(cx, cy + A.spawnR * 1.0, 'coldArch').setScale(2.4).setDepth(2)); // laurel arch S

      // ---- spawn at the LAUREL ARCH (south) ----
      scene._realmStart = { x: cx, y: cy + A.spawnR };

      // ---- mob-verb closures (fresh) ----
      scene._colGladiator = function (m, p, t) { return COL._gladiator(scene, m, p, t); };
      scene._colRetiarius = function (m, p, t) { return COL._retiarius(scene, m, p, t); };
      scene._colLion = function (m, p, t) { return COL._lion(scene, m, p, t); };
      scene._colLegionary = function (m, p, t) { return COL._legionary(scene, m, p, t); };
      scene._colHandler = function (m, p, t) { return COL._handler(scene, m, p, t); };
      scene._colElephant = function (m, p, t) { return COL._elephant(scene, m, p, t); };
      scene._colMinotaur = function (m, p, t) { return COL._minotaur(scene, m, p, t); };
      scene._colFavorite = function (m, p, t) { return COL._favorite(scene, m, p, t); };
      scene._colHound = function (m, p, t) { return COL._hound(scene, m, p, t); };
      scene._colVestal = function (m, p, t) { return COL._vestal(scene, m, p, t); };
      scene._colExecutioner = function (m, p, t) { return COL._executioner(scene, m, p, t); };
      scene._colChariot = function (m, p, t) { return COL._chariot(scene, m, p, t); };
    },

    afterCreate: function (scene) {
      // ROUND MAP: the wall is a manual clamp in update() (a physics collider
      // needs the player body which does not exist in setup) — no colliders to
      // attach here. The crowd ring is pure art: it is never added to any
      // physics group, so it can never collide or take damage.
    },

    // ========================================================= UPDATE ======
    update: function (scene, time, delta) {
      var C = scene._col; if (!C) return;
      var A = C.arena, p = scene.player, alive = p.state.alive;

      // boss-owned machinery clears when the boss is down (armed rule)
      if (C.bossArmed && (!scene.boss || !scene.boss.active)) {
        C.bossArmed = false;
        COL._clearBossHazards(scene, C);
      }

      // ---- THE PROGRAM cycle (parked during the boss fight; ENCORE reopens
      //      a single stage explicitly) ----
      var PG = C.program;
      if (PG.nextAt !== Infinity && !PG.stage && !scene.scanning && !scene.boss) {
        if (!PG.nextAt) PG.nextAt = time + 4000;
        if (time >= PG.nextAt) {
          var order = scene.realmDef.program.order;
          PG.stageIdx = (PG.stageIdx + 1) % order.length;
          COL._startStage(scene, order[PG.stageIdx], time);
        }
      }
      COL._runStage(scene, time);

      // ---- doom-rings (THE VERDICT) chase the player; clip mobs (env credit) ----
      for (var di = C.doomRings.length - 1; di >= 0; di--) {
        var DR = C.doomRings[di];
        if (time >= DR.until) { try { DR.g.destroy(); } catch (e) {} C.doomRings.splice(di, 1); continue; }
        if (time >= DR.moveAt) {
          DR.moveAt = time + 16;
          var mdx = p.x - DR.x, mdy = p.y - DR.y, md = Math.hypot(mdx, mdy) || 1;
          DR.x += mdx / md * DR.chaseSpeed * 0.016;
          DR.y += mdy / md * DR.chaseSpeed * 0.016;
        }
        DR.g.clear();
        DR.g.lineStyle(6, GOLD, 0.5); DR.g.strokeCircle(DR.x, DR.y, DR.r);
        DR.g.lineStyle(2, WARN, 0.9); DR.g.strokeCircle(DR.x, DR.y, DR.r);
        // clips MOBS (env credit) — the doom-ring forgets you through the pit
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && !m.mob._doomHit && Math.hypot(m.x - DR.x, m.y - DR.y) < DR.r) {
            m.mob._doomHit = true; scene.killMobCredited(m);
          }
        });
        if (alive && time >= DR.nextTickAt && Math.hypot(p.x - DR.x, p.y - DR.y) < DR.r) {
          DR.nextTickAt = time + DR.tickMs;
          Entities.hurtPlayer(scene, p, DR.dmg, time, "the Verdict's doom-ring", true);
        }
      }

      // ---- WINE FLOOD (P1 signature) ----
      if (C.wave) {
        var Wv = C.wave;
        if (!Wv.fired && time >= Wv.at) {
          Wv.fired = true;
          try { Wv.g.destroy(); } catch (e) {}
          var side = Wv.side;
          var fw = scene.add.graphics().setDepth(9);
          fw.fillStyle(WINE, 0.4);
          fw.fillRect(side ? A.x : A.x - A.wallR, A.y - A.wallR, A.wallR, A.wallR * 2);
          scene.tweens.add({ targets: fw, alpha: 0, duration: 450, onComplete: (function (f2) { return function () { try { f2.destroy(); } catch (e) {} }; })(fw) });
          scene.cameras.main.shake(300, 0.012);
          try { AUDIO.play('waveroar'); } catch (e) {}
          var inHalf = function (x, y) { return side ? x >= A.x : x < A.x; };
          scene.mobs.children.iterate(function (m) { if (m && m.active && inHalf(m.x, m.y)) scene.killMobCredited(m); });
          if (alive && inHalf(p.x, p.y)) Entities.hurtPlayer(scene, p, Wv.dmg, time, 'the WINE FLOOD', true);
        }
        if (Wv.fired && time >= Wv.ventAt) {
          COL._vent(scene, scene.boss, Wv.ventMs, Wv.ventDmgMult, 'HE GAZES INTO THE EMPTY CUP\nVENTED — unload while it runs dry');
          C.wave = null;
        }
      }

      // ---- DIONYSIAN DELUGE (P2 signature) ----
      if (C.deluge) {
        var D = C.deluge, allRain = true;
        for (var ri = 0; ri < D.rain.length; ri++) {
          var RN = D.rain[ri];
          if (RN.fired) continue;
          allRain = false;
          if (time < RN.at) continue;
          RN.fired = true;
          try { RN.g.destroy(); } catch (e) {}
          scene.burst(RN.x, RN.y, 10, WINE);
          if (alive && Math.hypot(p.x - RN.x, p.y - RN.y) < D.rainR) Entities.hurtPlayer(scene, p, D.rainDmg, time, 'the deluge', true);
        }
        if (allRain && !D.waved && time >= D.ringWaveAt) {
          D.waved = true;
          D.ring = { r: A.bossR, until: time + D.ringMs, moveAt: 0 };
          try { AUDIO.play('waveroar'); } catch (e) {}
        }
        if (D.ring) {
          if (time >= D.ring.until) {
            if (D.ringG) { try { D.ringG.destroy(); } catch (e) {} }
            COL._vent(scene, scene.boss, D.ventMs, D.ventDmgMult, 'THE CUP RUNS DRY\nlongest VENT — end him now');
            C.deluge = null;
          } else {
            if (time >= D.ring.moveAt) { D.ring.moveAt = time + 16; D.ring.r += D.ringSpeed * 0.016; }
            if (!D.ringG) D.ringG = scene.add.graphics().setDepth(9);
            D.ringG.clear();
            D.ringG.lineStyle(10, WINE, 0.35); D.ringG.strokeCircle(A.x, A.y, D.ring.r);
            D.ringG.lineStyle(2, WARN, 0.9); D.ringG.strokeCircle(A.x, A.y, D.ring.r);
            if (!D.ringHit && alive && Math.abs(Math.hypot(p.x - A.x, p.y - A.y) - D.ring.r) < 22) {
              D.ringHit = true;
              Entities.hurtPlayer(scene, p, D.ringDmg, time, 'the deluge wave', true);
            }
          }
        }
      }

      // ---- CUP TOSS (P2): the cup boomerangs the rim, untargetable ----
      if (C.cupToss) {
        var CT = C.cupToss;
        if (!CT.launched && time >= CT.launchAt) { CT.launched = true; try { CT.warnG.destroy(); } catch (e) {} try { AUDIO.play('cuptosswhoosh'); } catch (e) {} }
        if (CT.launched) {
          var pr = Math.min(1, (time - CT.launchAt) / CT.travelMs);
          var a = CT.startAng + pr * Math.PI * 2;
          CT.x = A.x + Math.cos(a) * A.trackR; CT.y = A.y + Math.sin(a) * A.trackR;
          if (!CT.spr) CT.spr = scene.add.circle(CT.x, CT.y, 12, GOLD, 0.9).setStrokeStyle(2, WARN, 1).setDepth(9);
          CT.spr.setPosition(CT.x, CT.y);
          if (alive && Math.hypot(p.x - CT.x, p.y - CT.y) < CT.hitR) Entities.hurtPlayer(scene, p, CT.dmg, time, 'the flung cup', true);
          if (pr >= 1) { try { CT.spr.destroy(); } catch (e) {} C.cupToss = null; }
        }
      }

      // ---- NET ROOT (short player CC — releases on hitstop/death) ----
      if (C.netRoot) {
        if (scene.hitstopActive || !alive || time >= C.netRoot.until) C.netRoot = null;
        else { p.body.velocity.x = 0; p.body.velocity.y = 0; }
      }

      // ---- INTERMISSION heal drops: pickup within 26px ----
      // M7k AUDIT fix: the drops were created but nothing ever read C.drops —
      // dead mechanic + litter. Pickup heals; leftovers expire with the stage.
      if (C.drops && C.drops.length) {
        for (var dpi = C.drops.length - 1; dpi >= 0; dpi--) {
          var DP = C.drops[dpi];
          if (DP.taken) { C.drops.splice(dpi, 1); continue; }
          if (alive && Math.hypot(p.x - DP.x, p.y - DP.y) < 26) {
            DP.taken = true;
            p.state.hp = Math.min(p.state.maxHp, p.state.hp + DP.heal);
            scene.damageNumber(DP.x, DP.y - 18, '+' + DP.heal, '#38b764');
            try { DP.obj.destroy(); } catch (e) {}
            C.drops.splice(dpi, 1);
          }
        }
      }

      // ---- TRAPDOORS: warn → open (pit) → close; falls eject + damage ----
      for (var ti = 0; ti < C.trapdoors.length; ti++) {
        var TD = C.trapdoors[ti];
        if (TD.state === 'warn' && time >= TD.openAt) {
          TD.state = 'open'; TD.spr.setVisible(true);
          if (TD.warnG) { try { TD.warnG.destroy(); } catch (e) {} TD.warnG = null; }
          // M7k AUDIT fix: splice the trapdoor's _zoneWarns record when the
          // warn resolves (every other producer splices via z._warn).
          if (TD._warn) { var twi = scene._zoneWarns.indexOf(TD._warn); if (twi >= 0) scene._zoneWarns.splice(twi, 1); TD._warn = null; }
          try { AUDIO.play('trapclunk'); } catch (e) {}
        } else if (TD.state === 'open' && time >= TD.closeAt) {
          TD.state = 'closed'; TD.spr.setVisible(false);
        }
        if (TD.state === 'open' && alive && Math.hypot(p.x - TD.x, p.y - TD.y) < TD.r) {
          COL._fall(scene, TD, time);
        }
      }

      // ---- lingering ground patches (wine slicks / vestal weaken zones) ----
      var slowMult = 1, onSlick = false, inWeaken = false;
      for (var pi = C.patches.length - 1; pi >= 0; pi--) {
        var PA = C.patches[pi];
        if (time >= PA.dieAt) { if (PA.obj) { try { PA.obj.destroy(); } catch (e) {} } C.patches.splice(pi, 1); continue; }
        if (!alive) continue;
        if (Math.hypot(p.x - PA.x, p.y - PA.y) >= PA.r) continue;
        if (PA.slowMult) slowMult *= PA.slowMult;
        if (PA.slideMult) onSlick = true;
        if (PA.weakenMult) inWeaken = true;
        if (PA.dmg && time >= (PA.nextTickAt || 0)) { PA.nextTickAt = time + PA.tickMs; Entities.hurtPlayer(scene, p, PA.dmg, time, PA.src || 'a wine slick', !!PA.fromBoss); }
      }
      // CC-STACK CAP (net + slick + curse): never below 0.4×
      slowMult = Math.max(slowMult, 0.4);
      if (alive && !C.netRoot) {
        if (slowMult < 1) { p.body.velocity.x *= slowMult; p.body.velocity.y *= slowMult; }
        if (onSlick) { p.body.velocity.x *= 1.4; p.body.velocity.y *= 1.4; } // slide-through, brief control loss
      }
      // WEAKEN: shots fired from inside a curse zone leave weakened (tag once)
      var shots = scene.playerShots;
      if (shots) shots.children.iterate(function (s) {
        if (!s || !s.active || !s.proj || s.proj._colTagged) return;
        s.proj._colTagged = true;
        if (inWeaken) s.proj.dmg = Math.max(1, Math.round(s.proj.dmg * 0.7));
      });

      // ---- BUFFED beasts (Beast Handler whip-rally) ----
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        if (m.mob._buffUntil && time < m.mob._buffUntil) {
          m.body.velocity.x *= (m.mob.spdMult || 1); m.body.velocity.y *= (m.mob.spdMult || 1);
        } else if (m.mob._buffUntil) { m.mob._buffUntil = 0; m.mob.spdMult = 1; m.clearTint(); }
      });

      // ---- expanding RINGS (stomps / slams) ----
      for (var gi = C.rings.length - 1; gi >= 0; gi--) {
        var RG = C.rings[gi];
        var t2 = Math.max(0, Math.min(1, (time - RG.start) / (RG.until - RG.start)));
        RG.r = RG.r0 + (RG.maxR - RG.r0) * t2;
        RG.g.clear();
        RG.g.lineStyle(8, RG.tint, 0.3); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        RG.g.lineStyle(2, RG.tint, 0.9); RG.g.strokeCircle(RG.x, RG.y, RG.r);
        if (!RG.hit && alive && Math.abs(Math.hypot(p.x - RG.x, p.y - RG.y) - RG.r) < 20) {
          RG.hit = true; Entities.hurtPlayer(scene, p, RG.dmg, time, RG.src, RG.fromBoss);
        }
        if (time >= RG.until) { try { RG.g.destroy(); } catch (e) {} C.rings.splice(gi, 1); }
      }

      // ---- warn graphics whose mob died early ----
      for (var mw = C.mobWarns.length - 1; mw >= 0; mw--) {
        var MW = C.mobWarns[mw];
        if (!MW.m.active || MW.dead) { try { MW.g.destroy(); } catch (e) {} C.mobWarns.splice(mw, 1); }
      }

      COL._runZones(scene, time);
      COL._runLanes(scene, time);
      COL._bound(scene);            // ROUND WALL — after all movers (no wrap)
    },

    // -------------------------------- ROUND WALL (no wrap) -----------------
    _bound: function (scene) {
      var C = scene._col, A = C.arena, R = A.wallR - 6;
      var clampO = function (o) {
        if (!o) return;
        var dx = o.x - A.x, dy = o.y - A.y, d = Math.hypot(dx, dy);
        if (d <= R) return;
        var ox = dx / d, oy = dy / d, nx = A.x + ox * R, ny = A.y + oy * R;
        if (o.body && o.body.enable && o.body.reset) {
          var vx = o.body.velocity.x, vy = o.body.velocity.y, vn = vx * ox + vy * oy;
          if (vn > 0) { vx -= vn * ox; vy -= vn * oy; }
          o.body.reset(nx, ny); o.body.velocity.x = vx; o.body.velocity.y = vy;
        } else { o.x = nx; o.y = ny; }
      };
      clampO(scene.player);
      scene.mobs.children.iterate(function (m) { if (m && m.active && m.mob) clampO(m); });
    },

    // ================================= THE PROGRAM =========================
    _startStage: function (scene, kind, time) {
      var C = scene._col, cfg = scene.realmDef.program;
      C.program.stage = { kind: kind, beginAt: time + cfg.placardMs,
                          endsAt: time + cfg.placardMs + cfg.stageMs, began: false };
      var names = { beast: 'BEAST RELEASE', trapdoor: 'TRAPDOOR SHUFFLE', chariot: 'CHARIOT LAP', intermission: 'INTERMISSION' };
      scene.banner('THE PROGRAM\n' + (names[kind] || kind), '#f8d878');
      try { AUDIO.play('placardsting'); } catch (e) {}
    },
    _runStage: function (scene, time) {
      var C = scene._col, S = C.program.stage; if (!S) return;
      if (!S.began && time >= S.beginAt) {
        S.began = true;
        if (S.kind === 'beast') COL._beastRelease(scene, time);
        else if (S.kind === 'trapdoor') COL._trapShuffle(scene, time);
        else if (S.kind === 'chariot') COL._chariotLap(scene, time);
        else if (S.kind === 'intermission') COL._intermission(scene, time);
      }
      if (time >= S.endsAt) {
        COL._endStage(scene, time);
        var cfg = scene.realmDef.program;
        if (C.program.nextAt !== Infinity) C.program.nextAt = time + cfg.placardMs;
        C.program.stage = null;
      }
    },
    _endStage: function (scene, time) {
      var C = scene._col;
      // chariot racers despawn cleanly if the stage ends (ghost-actor cleanup)
      C.stageMobs.slice().forEach(function (m) { if (m && m.active) { Entities.clearNameTag(m); m.body.enable = false; scene.mobs.killAndHide(m); } });
      C.stageMobs = [];
      // M7k AUDIT fix: expire leftover INTERMISSION heal drops with the stage
      (C.drops || []).forEach(function (d) { if (d.obj) { try { d.obj.destroy(); } catch (e) {} } });
      C.drops = [];
      // M7k AUDIT fix: splice any still-pending trapdoor warn records
      C.trapdoors.forEach(function (TD) {
        if (TD._warn) { var wi = scene._zoneWarns.indexOf(TD._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); TD._warn = null; }
      });
    },
    _beastRelease: function (scene, time) {
      var C = scene._col, cfg = scene.realmDef.program.beastWave;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      C.gates.forEach(function (G) { G.openUntil = time + 6000; });
      try { AUDIO.play('portcullis'); } catch (e) {}
      for (var i = 0; i < cfg.count && aliveM + i < cfg.cap; i++) {
        var G = C.gates[i % C.gates.length];
        var key = cfg.keys[i % cfg.keys.length];
        scene.queueSpawn({ key: key, x: G.x - Math.cos(G.ang) * 40, y: G.y - Math.sin(G.ang) * 40 });
      }
      try { AUDIO.play('lionroar'); } catch (e) {}
    },
    _trapShuffle: function (scene, time) {
      var C = scene._col, cfg = scene.realmDef.program.trapdoor;
      var idx = [], i;
      for (i = 0; i < C.trapdoors.length; i++) idx.push(i);
      for (i = idx.length - 1; i > 0; i--) { var j = Math.floor(SIM.rng() * (i + 1)); var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp; }
      for (i = 0; i < Math.min(cfg.setCount, idx.length); i++) {
        var TD = C.trapdoors[idx[i]];
        TD.state = 'warn'; TD.warnAt = time; TD.openAt = time + cfg.warnMs; TD.closeAt = time + cfg.warnMs + cfg.openMs;
        var g = scene.add.circle(TD.x, TD.y, TD.r, WARN_FILL, 0.14).setStrokeStyle(2, WARN, 0.9).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        TD.warnG = g;
        // M7k AUDIT fix: keep the ref so the record can be spliced later
        var wrec = { x: TD.x, y: TD.y, r: TD.r, until: TD.openAt };
        scene._zoneWarns.push(wrec); TD._warn = wrec;
      }
    },
    _chariotLap: function (scene, time) {
      var C = scene._col, cfg = scene.realmDef.program.chariot, A = C.arena;
      for (var i = 0; i < cfg.racers; i++) {
        var a = (i / cfg.racers) * Math.PI * 2;
        var m = Entities.spawnMob(scene, 'chariotRacer', A.x + Math.cos(a) * A.trackR, A.y + Math.sin(a) * A.trackR);
        if (m) { m.mob._orbitDir = 1; C.stageMobs.push(m); }
      }
      try { AUDIO.play('chariotrumble'); } catch (e) {}
    },
    _intermission: function (scene, time) {
      var C = scene._col, cfg = scene.realmDef.program.intermission, A = C.arena;
      C.drops = C.drops || [];
      for (var i = 0; i < cfg.drops; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * A.trackR * 0.85;
        var dx = A.x + Math.cos(a) * rr, dy = A.y + Math.sin(a) * rr;
        var obj = scene.add.circle(dx, dy, 8, i % 2 ? 0xd04848 : GOLD, 0.9).setStrokeStyle(1, WARN, 1).setDepth(3);
        C.drops.push({ x: dx, y: dy, obj: obj, heal: cfg.heal, taken: false });
      }
      try { AUDIO.play('crowdcheer'); } catch (e) {}
    },
    _fall: function (scene, TD, time) {
      var C = scene._col, A = C.arena, p = scene.player, cfg = scene.realmDef.program.trapdoor;
      // eject to the safe sand near the edge, NOT death
      var a = Math.atan2(p.y - A.y, p.x - A.x);
      p.body.reset(A.x + Math.cos(a) * A.trackR * 0.7, A.y + Math.sin(a) * A.trackR * 0.7);
      if (p.state.alive) Entities.hurtPlayer(scene, p, cfg.fallDmg, time, 'a trapdoor pit');
      scene.cameras.main.shake(120, 0.006);
      try { AUDIO.play('trapclunk'); } catch (e) {}
    },

    // ======================================================== UNFREEZE =====
    unfreeze: function (scene, dt) {
      var C = scene._col; if (!C) return;
      if (C.program.nextAt && C.program.nextAt !== Infinity) C.program.nextAt += dt;
      if (C.program.stage) { C.program.stage.beginAt += dt; C.program.stage.endsAt += dt; }
      C.gates.forEach(function (G) { if (G.openUntil) G.openUntil += dt; });
      C.trapdoors.forEach(function (TD) {
        if (TD.warnAt !== Infinity) TD.warnAt += dt;
        if (TD.openAt !== Infinity) TD.openAt += dt;
        if (TD.closeAt !== Infinity) TD.closeAt += dt;
      });
      C.zones.forEach(function (z) { z.at += dt; });
      C.lanes.forEach(function (l) { l.at += dt; });
      C.rings.forEach(function (RG) { RG.start += dt; RG.until += dt; });
      C.doomRings.forEach(function (DR) { DR.until += dt; DR.moveAt += dt; DR.nextTickAt += dt; });
      C.patches.forEach(function (PA) { if (PA.dieAt !== Infinity) PA.dieAt += dt; if (PA.nextTickAt) PA.nextTickAt += dt; });
      if (C.netRoot) C.netRoot.until += dt;
      if (C.wave) { C.wave.at += dt; C.wave.ventAt += dt; }
      if (C.deluge) {
        C.deluge.rain.forEach(function (RN) { if (!RN.fired) RN.at += dt; });
        C.deluge.ringWaveAt += dt; if (C.deluge.ring) { C.deluge.ring.until += dt; C.deluge.ring.moveAt += dt; }
      }
      if (C.cupToss) C.cupToss.launchAt += dt;
      // M7k AUDIT fix: _zoneWarns shift removed — core's dismissScouter shifts
      // every _zoneWarns.until already (double shift). Same for lungeUntil in
      // the mob list below (core shifts lungeUntil/nextLungeAt for every mob).
      scene.mobs.children.iterate(function (m) {
        if (!m || !m.active || !m.mob) return;
        ['slashAt', '_slashLock', 'nextNetAt', '_netLock', '_jabLock', 'pounceAt', '_pounceLock', 'pounceUntil',
         'nextBuffAt', '_buffUntil', 'stampedeAt', '_stampLock', '_stompLock', 'stompUntil',
         'chargeAt', '_chargeLock', 'chargeUntil', 'nextTauntAt', 'tauntUntil', 'shieldUntil', 'shieldCdUntil',
         'lungeAt', '_lungeLock', 'glyphAt', '_glyphLock', 'exeAt', '_exeLock', '_cleaveLock',
         'laneAt', '_laneLockUntil'].forEach(function (k) { if (m.mob[k] && m.mob[k] !== Infinity) m.mob[k] += dt; });
      });
      if (scene.boss && scene.boss.active && scene.boss.boss.def.mapOwned) {
        var bs = scene.boss.boss;
        ['nextVerbAt', 'nextSigAt', 'busyUntil', 'rootUntil', 'ventedUntil'].forEach(function (k) { if (bs[k]) bs[k] += dt; });
      }
    },

    // ====================================================== ANNIHILATE =====
    annihilate: function (scene) {
      var C = scene._col; if (!C) return;
      C.zones.forEach(function (z) { if (z.ring) { try { z.ring.destroy(); } catch (e) {} } }); C.zones = [];
      C.lanes.forEach(function (l) { if (l.g) { try { l.g.destroy(); } catch (e) {} } }); C.lanes = [];
      C.rings.forEach(function (RG) { try { RG.g.destroy(); } catch (e) {} }); C.rings = [];
      C.doomRings.forEach(function (DR) { try { DR.g.destroy(); } catch (e) {} }); C.doomRings = [];
      for (var i = C.patches.length - 1; i >= 0; i--) { if (C.patches[i].obj) { try { C.patches[i].obj.destroy(); } catch (e) {} } }
      C.patches = [];
      C.mobWarns.forEach(function (MW) { try { MW.g.destroy(); } catch (e) {} }); C.mobWarns = [];
      C.netRoot = null;
      // M7k AUDIT fix: sweep INTERMISSION heal drops too
      (C.drops || []).forEach(function (d) { if (d.obj) { try { d.obj.destroy(); } catch (e) {} } });
      C.drops = [];
    },

    // ==================================================== BOSS CLEANUP =====
    // M7k AUDIT fix: Divinity killed MID-VERB left live verb graphics painted
    // (backhand warn cone, WINE FLOOD half-arena telegraph, deluge rain rings,
    // cup-toss track warn, doom-rings). Central onBossDown hook.
    bossCleanup: function (scene, boss) {
      var C = scene._col; if (!C) return;
      C.bossArmed = false;
      COL._clearBossHazards(scene, C);
      var bs = boss && boss.boss;
      if (bs && bs._backhandG) { try { bs._backhandG.destroy(); } catch (e) {} bs._backhandG = null; }
    },

    _clearBossHazards: function (scene, C) {
      C.doomRings.forEach(function (DR) { try { DR.g.destroy(); } catch (e) {} }); C.doomRings = [];
      if (C.wave) { try { C.wave.g.destroy(); } catch (e) {} C.wave = null; }
      if (C.deluge) { C.deluge.rain.forEach(function (RN) { if (!RN.fired) { try { RN.g.destroy(); } catch (e) {} } }); if (C.deluge.ringG) { try { C.deluge.ringG.destroy(); } catch (e) {} } C.deluge = null; }
      if (C.cupToss) { if (C.cupToss.warnG) { try { C.cupToss.warnG.destroy(); } catch (e) {} } if (C.cupToss.spr) { try { C.cupToss.spr.destroy(); } catch (e) {} } C.cupToss = null; }
    },

    // ================================================== BOSS ARRIVAL =======
    // Trumpets → the box floor unlatches and lowers as a gilded LIFT (him
    // mid-toast) → halfway he UPENDS THE CUP: an impossible crimson wave floods
    // down the carpet and he SURFS it to the boss circle, landing dry. Title
    // card, THEN r.scanning.
    bossArrival: function (scene, def, bx, by) {
      var C = scene._col, self = scene, A = C.arena;
      C.program.nextAt = Infinity;                            // the Program holds its breath
      C.program.stage = null; C.netRoot = null;
      scene.player.setPosition(A.x, A.y + A.spawnR);
      scene.cameras.main.centerOn(A.x, A.y);
      var boxX = C.box.x, boxY = C.box.y;
      var lift = scene.add.rectangle(boxX, boxY + 20, 60, 20, 0xc8a850, 0.9).setDepth(5);
      scene.tweens.add({ targets: lift, y: A.y - A.trackR, duration: def.entranceMs * 0.5, ease: 'Quad.In' });
      scene.banner('DIVINITY HIMSELF\nthe box floor unlatches — a gilded lift descends', '#f8d878');
      try { AUDIO.play('liftcreak'); } catch (e) {}
      scene.time.delayedCall(def.entranceMs * 0.45, function () {
        if (self.closing) return;
        var wave = self.add.graphics().setDepth(8);
        wave.fillStyle(WINE, 0.45); wave.fillRect(A.x - A.wallR * 0.06, A.y - A.trackR, A.wallR * 0.12, A.trackR);
        self.tweens.add({ targets: wave, alpha: 0, duration: 700, onComplete: function () { try { wave.destroy(); } catch (e) {} } });
        self.cameras.main.shake(260, 0.01);
        try { AUDIO.play('surfsplash'); } catch (e) {}
        self.banner('HE UPENDS THE CUP\nan impossible crimson wave — he SURFS it down', '#a02028');
      });
      scene.time.delayedCall(def.entranceMs * 0.7, function () {
        if (self.closing || !self.player.state.alive) return;
        try { lift.destroy(); } catch (e) {}
        self.spawnBossNow(def, A.x, A.y);              // lands DRY at the boss circle
        if (self.boss) {
          var b = self.boss;
          b.setAlpha(0.2);                             // a cosmetic surf-pop; final spot IS center
          self.tweens.add({ targets: b, alpha: 1, duration: 420, ease: 'Quad.Out' });
          self.burst(b.x, b.y, 22, GOLD);
          self.cameras.main.shake(220, 0.01);
          try { AUDIO.play('crowdroar'); } catch (e) {}
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
      var bs = b.boss, PT = bs.def.patterns, C = scene._col;
      if (!bs._colInit) {
        bs._colInit = true; bs.phase = 1; bs.verbIdx = 0;
        bs.nextVerbAt = time + 2600; bs.nextSigAt = time + PT.sigFirstMs;
        bs.busyUntil = 0; bs.rootUntil = 0; bs.encoreUsed = {};
      }
      // one-time PHASE TWO swap (the DRUNK GOD — glow doubles, gait staggers)
      if (bs.phase === 1 && bs.hp <= bs.maxHp * PT.phase2HpPct) {
        bs.phase = 2; b.setTint(0xf8d878);
        bs.nextSigAt = Math.min(bs.nextSigAt, time + 8000);
        scene.banner('THE DRUNK GOD\nhe drinks deep — glow doubles, the games get personal', '#f8d878');
      }
      // movement: he SAUNTERS, never chases; still during a signature/root
      if (C.wave || C.deluge) b.setVelocity(0, 0);
      else if (time < bs.rootUntil) b.setVelocity(0, 0);
      else {
        var dx = player.x - b.x, dy = player.y - b.y, d = Math.hypot(dx, dy) || 1, spd = bs.def.spd;
        if (d > 160) b.setVelocity(dx / d * spd, dy / d * spd); else b.setVelocity(0, 0);
        b.setFlipX(dx < 0);
      }
      if (time < bs.busyUntil) return;

      if (time >= bs.nextSigAt) {
        bs.nextSigAt = time + PT.sigEveryMs;
        if (bs.phase === 1) COL._wineFlood(scene, b, time);
        else COL._deluge(scene, b, time);
        return;
      }
      if (time >= bs.nextVerbAt) {
        bs.nextVerbAt = time + PT.verbEveryMs;
        if (bs.phase === 1) {
          var v = ['cupSplash', 'verdict', 'tribute', 'backhand'][bs.verbIdx % 4]; bs.verbIdx++;
          if (v === 'cupSplash') COL._cupSplash(scene, b, player, time);
          else if (v === 'verdict') COL._verdict(scene, b, player, time, 1);
          else if (v === 'tribute') COL._tributeRain(scene, b, player, time);
          else COL._backhand(scene, b, player, time);
        } else {
          var v2 = ['verdict', 'cupToss', 'encore', 'cupSplash'][bs.verbIdx % 4]; bs.verbIdx++;
          if (v2 === 'verdict') COL._verdict(scene, b, player, time, 2);   // DOUBLE VERDICT
          else if (v2 === 'cupToss') COL._cupTossVerb(scene, b, time);
          else if (v2 === 'encore') COL._encore(scene, b, player, time);
          else COL._cupSplash(scene, b, player, time);
        }
      }
    },

    _vent: function (scene, b, ms, mult, msg) {
      if (!b || !b.active) return;
      var time = scene.time.now;
      b.boss.ventedUntil = time + ms; b.boss.ventDmgMult = mult;
      b.boss.rootUntil = time + ms; b.setTint(0x8a1622);
      (function (b2) { scene.time.delayedCall(ms, function () { if (b2.active) { if (b2.boss.phase === 2) b2.setTint(0xf8d878); else b2.clearTint(); } }); })(b);
      scene.banner(msg, '#d04848');
      scene.burst(b.x, b.y, 22, WINE);
    },

    // ---- CUP SPLASH — wine onto 3 warned circles → lingering crimson slicks
    _cupSplash: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.cupSplash;
      for (var i = 0; i < cfg.count; i++) {
        var rr = (i === 0) ? 0 : SIM.rng() * cfg.scatter, a = SIM.rng() * Math.PI * 2;
        COL._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs, cfg.dmg,
          'a wine splash', true, false, time, { leaveSlick: { lifeMs: cfg.slickMs, r: cfg.slickR } });
      }
      try { AUDIO.play('cupsplash'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    // ---- THE VERDICT — golden doom-ring chases; count=2 in P2 (DOUBLE VERDICT)
    _verdict: function (scene, b, player, time, count) {
      var C = scene._col, cfg = b.boss.def.patterns.verdict;
      for (var i = 0; i < count; i++) {
        var a = i ? Math.PI : 0;
        var g = scene.add.graphics().setDepth(9);
        C.doomRings.push({ x: b.x + Math.cos(a) * 40, y: b.y + Math.sin(a) * 40, r: cfg.ringR,
          chaseSpeed: cfg.chaseSpeed, until: time + cfg.ringMs, moveAt: time, nextTickAt: time,
          tickMs: cfg.tickMs, dmg: cfg.dmg, g: g });
      }
      try { AUDIO.play('verdicthorn'); } catch (e) {}
      scene.banner(count > 1 ? 'DOUBLE VERDICT\ntwo doom-rings — split them through the mobs' : 'THE VERDICT\nthumb turns down — outrun the doom-ring', '#f8d878');
      b.boss.busyUntil = time + 500;
    },
    // ---- TRIBUTE RAIN — crowd hurls goblets + roses: scattered small circles
    _tributeRain: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.tributeRain;
      for (var i = 0; i < cfg.count; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * cfg.scatter;
        COL._zone(scene, player.x + Math.cos(a) * rr, player.y + Math.sin(a) * rr, cfg.radius, cfg.warnMs, cfg.dmg,
          'a hurled goblet', true, false, time, null);
      }
      try { AUDIO.play('crowdcheer'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    // ---- GOLDEN BACKHAND — close warned cone; he saunters, never chases
    _backhand: function (scene, b, player, time) {
      var cfg = b.boss.def.patterns.backhand;
      var ang = Math.atan2(player.y - b.y, player.x - b.x);
      var g = scene.add.graphics().setDepth(2);
      g.fillStyle(WARN_FILL, 0.15); g.lineStyle(2, WARN, 0.85);
      g.slice(b.x, b.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); g.fillPath(); g.strokePath();
      b.boss.busyUntil = time + cfg.warnMs + 200; b.boss.rootUntil = b.boss.busyUntil;
      b.boss._backhandG = g;                     // M7k AUDIT fix: bossCleanup can reach the warn cone
      var self = scene, bx = b.x, by = b.y, bs = b.boss;
      scene.time.delayedCall(cfg.warnMs, function () {
        bs._backhandG = null;
        try { g.destroy(); } catch (e) {}
        if (!self.boss) return;                  // M7k AUDIT fix: dead-caster guard — no posthumous backhand
        var fg = self.add.graphics().setDepth(9); fg.fillStyle(WARN, 0.5);
        fg.slice(bx, by, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
        self.tweens.add({ targets: fg, alpha: 0, duration: 240, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
        self.cameras.main.shake(130, 0.007);
        var p = self.player; if (!p.state.alive) return;
        var pd = Math.hypot(p.x - bx, p.y - by), pa = Math.atan2(p.y - by, p.x - bx);
        var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
        if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) {
          Entities.hurtPlayer(self, p, cfg.dmg, self.time.now, "the Golden Backhand", true);
          p.body.velocity.x += Math.cos(ang) * cfg.kb; p.body.velocity.y += Math.sin(ang) * cfg.kb;
        }
      });
    },
    // ---- SIGNATURE (P1): WINE FLOOD — half-arena wave, FIXED ALTERNATING
    _wineFlood: function (scene, b, time) {
      var C = scene._col, cfg = b.boss.def.patterns.wineFlood, A = C.arena;
      if (C.wave) return;
      C.waveSide = 1 - C.waveSide;
      var side = C.waveSide;
      var g = scene.add.graphics().setDepth(1.7);
      g.fillStyle(WINE, 0.12); g.lineStyle(3, WARN, 0.85);
      g.fillRect(side ? A.x : A.x - A.wallR, A.y - A.wallR, A.wallR, A.wallR * 2);
      g.strokeRect(side ? A.x : A.x - A.wallR, A.y - A.wallR, A.wallR, A.wallR * 2);
      C.wave = { side: side, g: g, at: time + cfg.warnMs, fired: false,
                 dmg: cfg.dmg, ventAt: time + cfg.warnMs + 500, ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = time + cfg.warnMs + 800; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('WINE FLOOD\nhe empties the cup — the ' + (side ? 'EAST' : 'WEST') + ' half will flood', '#a02028');
      try { AUDIO.play('cupsplash'); } catch (e) {}
    },
    // ---- CUP TOSS (P2) — the cup boomerangs the rim (warned full circle)
    _cupTossVerb: function (scene, b, time) {
      var C = scene._col, cfg = b.boss.def.patterns.cupToss, A = C.arena;
      if (C.cupToss) return;
      var warnG = scene.add.graphics().setDepth(2);
      warnG.lineStyle(cfg.hitR * 1.6, WARN, 0.12); warnG.strokeCircle(A.x, A.y, A.trackR);
      warnG.lineStyle(2, WARN, 0.85); warnG.strokeCircle(A.x, A.y, A.trackR);
      C.cupToss = { startAng: Math.atan2(b.y - A.y, b.x - A.x), launchAt: time + cfg.warnMs, launched: false,
                    travelMs: cfg.travelMs, hitR: cfg.hitR, dmg: cfg.dmg, warnG: warnG };
      b.boss.busyUntil = time + cfg.warnMs + 400;
      scene.banner('CUP TOSS\nthe cup circles the rim — stay off the track', '#f8d878');
    },
    // ---- ENCORE! (P2) — orders one BEAST RELEASE (3 hounds); ONCE per phase
    _encore: function (scene, b, player, time) {
      var C = scene._col, cfg = b.boss.def.patterns.encore;
      if (b.boss.encoreUsed[b.boss.phase]) { COL._cupSplash(scene, b, player, time); return; }  // reroute if already spent
      b.boss.encoreUsed[b.boss.phase] = true;
      var aliveM = 0; scene.mobs.children.iterate(function (m) { if (m && m.active) aliveM++; });
      var G = C.gates[0];
      for (var i = 0; i < cfg.hounds; i++) scene.queueSpawn({ key: 'warHound', bossWave: true, x: G.x - Math.cos(G.ang) * (30 + i * 18), y: G.y - Math.sin(G.ang) * 30 });
      C.gates.forEach(function (g2) { g2.openUntil = time + 5000; });
      scene.banner('ENCORE!\nhe orders the beasts back on — three hounds', '#f8d878');
      try { AUDIO.play('portcullis'); } catch (e) {}
      b.boss.busyUntil = time + 500;
    },
    // ---- SIGNATURE (P2): DIONYSIAN DELUGE — wine rains everywhere → ring-wave
    _deluge: function (scene, b, time) {
      var C = scene._col, cfg = b.boss.def.patterns.deluge, A = C.arena;
      if (C.deluge) return;
      var rain = [];
      for (var i = 0; i < cfg.rainCount; i++) {
        var a = SIM.rng() * Math.PI * 2, rr = SIM.rng() * A.trackR * 0.9;
        var fx = A.x + Math.cos(a) * rr, fy = A.y + Math.sin(a) * rr;
        var g = scene.add.circle(fx, fy, cfg.rainRadius, WINE, 0.13).setStrokeStyle(2, WARN, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.rainWarnMs + i * cfg.rainGapMs });
        rain.push({ x: fx, y: fy, at: time + cfg.rainWarnMs + i * cfg.rainGapMs, fired: false, g: g });
      }
      C.deluge = { rain: rain, rainR: cfg.rainRadius, rainDmg: cfg.rainDmg,
                   ringWaveAt: time + cfg.rainWarnMs + cfg.rainCount * cfg.rainGapMs + cfg.ringWarnMs,
                   waved: false, ring: null, ringG: null, ringHit: false,
                   ringSpeed: cfg.ringSpeed, ringDmg: cfg.ringDmg, ringMs: cfg.ringMs,
                   ventMs: cfg.ventMs, ventDmgMult: cfg.ventDmgMult };
      b.boss.busyUntil = C.deluge.ringWaveAt + cfg.ringMs + 400; b.boss.rootUntil = b.boss.busyUntil;
      scene.banner('DIONYSIAN DELUGE\nwine everywhere — then a ring-wave from the center', '#a02028');
      try { AUDIO.play('waveroar'); } catch (e) {}
    },

    // =============================================== MOB VERBS (map-new) ===
    // helper: kill player shots that hit the frontal shield arc (block).
    _frontalBlock: function (scene, m, arcRad, range) {
      var shots = scene.playerShots; if (!shots) return;
      // SHIELD WINDOW (fix 2026-07-18): this block used to run at 100% uptime
      // with the cone re-aimed at the player EVERY frame, so aimed shots were
      // always dead-centre in the arc and NEVER connected — Gladiators / Shield
      // Legionaries read as unkillable to a ranged player, and the advertised
      // "flanks/back open" counter was impossible against aimed fire. Fix,
      // mirroring every other shield mob in the game (Sugar Mint Guardian,
      // Neon Riot Enforcer): the shield DROPS on a cycle for a guaranteed
      // damage window, and the blocking arc is tightened so genuinely off-angle
      // shots slip past. m.mob is rebuilt each spawn, so this state is fresh.
      var t = scene.time.now, mo = m.mob;
      if (!mo._shieldCycle) mo._shieldCycle = t + 2400 + SIM.rng() * 1400;  // first drop, staggered
      if (mo._shieldDownUntil && t < mo._shieldDownUntil) return;           // shield DOWN — fully vulnerable
      if (t >= mo._shieldCycle) { mo._shieldDownUntil = t + 1100; mo._shieldCycle = t + 3300 + SIM.rng() * 1000; return; }
      var arc = Math.min(arcRad, 0.6);                                      // tighter cone (~±34°) than the data's 0.9
      var face = Math.atan2(scene.player.y - m.y, scene.player.x - m.x);
      shots.children.iterate(function (s) {
        if (!s || !s.active || s.proj && s.proj._colBlocked) return;
        var d = Math.hypot(s.x - m.x, s.y - m.y); if (d > range) return;
        var sa = Math.atan2(s.y - m.y, s.x - m.x);
        var diff = Math.atan2(Math.sin(sa - face), Math.cos(sa - face));
        if (Math.abs(diff) < arc) {
          if (s.proj) s.proj._colBlocked = true;
          scene.burst(s.x, s.y, 4, 0xa8aeb8);
          Entities.killProjectile(shots, s);
        }
      });
    },
    // GLADIATOR — sword-glint → warned slash cone; shield eats frontal shots.
    _gladiator: function (scene, m, player, time) {
      var cfg = m.mob.def.slash;
      COL._frontalBlock(scene, m, cfg.blockRad, 46);
      if (m.mob._slashLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._slashLock) {
          m.mob._slashLock = 0;
          if (m.mob._slashG) { try { m.mob._slashG.destroy(); } catch (e) {} m.mob._slashG = null; }
          var ang = m.mob._slashAng;
          var fg = scene.add.graphics().setDepth(9); fg.fillStyle(0xd04848, 0.5);
          fg.slice(m.x, m.y, cfg.range, ang - cfg.halfRad, ang + cfg.halfRad, false); fg.fillPath();
          scene.tweens.add({ targets: fg, alpha: 0, duration: 220, onComplete: function () { try { fg.destroy(); } catch (e) {} } });
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            var diff = Math.atan2(Math.sin(pa - ang), Math.cos(pa - ang));
            if (pd < cfg.range && Math.abs(diff) < cfg.halfRad) Entities.hurtPlayer(scene, player, cfg.dmg, time, "a Gladiator's slash");
          }
        }
        return true;
      }
      if (!m.mob.slashAt) m.mob.slashAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.slashAt && d < cfg.range && player.state.alive) {
        m.mob.slashAt = time + cfg.everyMs;
        m.mob._slashLock = time + cfg.warnMs;
        m.mob._slashAng = Math.atan2(player.y - m.y, player.x - m.x);
        var g = scene.add.graphics().setDepth(2); g.fillStyle(WARN_FILL, 0.14); g.lineStyle(2, WARN, 0.8);
        g.slice(m.x, m.y, cfg.range, m.mob._slashAng - cfg.halfRad, m.mob._slashAng + cfg.halfRad, false); g.fillPath(); g.strokePath();
        m.mob._slashG = g;
        m.setTint(0xf8d878);
        (function (m2) { scene.time.delayedCall(180, function () { if (m2.active && !m2.mob._slashLock) m2.clearTint(); }); })(m);
        return true;
      }
      return false;
    },
    // RETIARIUS — net onto a marked circle → brief ROOT → trident jab.
    _retiarius: function (scene, m, player, time) {
      var C = scene._col, cfg = m.mob.def.net;
      if (m.mob._jabLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._jabLock) {
          m.mob._jabLock = 0;
          if (player.state.alive && Math.hypot(player.x - m.x, player.y - m.y) < cfg.range * 0.5) Entities.hurtPlayer(scene, player, cfg.jabDmg, time, "a Retiarius' trident");
        }
        return true;
      }
      if (m.mob._netLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._netLock) {
          m.mob._netLock = 0;
          if (m.mob._netG) { try { m.mob._netG.destroy(); } catch (e) {} m.mob._netG = null; }
          try { AUDIO.play('netwhoosh'); } catch (e) {}
          if (player.state.alive && Math.hypot(player.x - m.mob._netX, player.y - m.mob._netY) < cfg.netR && !C.netRoot) {
            C.netRoot = { until: time + cfg.rootMs };
            scene.damageNumber(player.x, player.y - 24, 'NETTED', '#8a4a9a');
          }
          m.mob._jabLock = time + cfg.jabMs;
        }
        return true;
      }
      if (!m.mob.nextNetAt) m.mob.nextNetAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.nextNetAt && d < cfg.range && player.state.alive) {
        m.mob.nextNetAt = time + cfg.everyMs;
        m.mob._netLock = time + cfg.warnMs;
        m.mob._netX = player.x; m.mob._netY = player.y;
        var g = scene.add.circle(player.x, player.y, cfg.netR, PURPLE, 0.14).setStrokeStyle(2, 0x8a4a9a, 0.9).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        m.mob._netG = g;
        return true;
      }
      return false;
    },
    // WAR LION — crouch + tail flick → pounce along a marked lane.
    _lion: function (scene, m, player, time) {
      var cfg = m.mob.def.pounce;
      if (m.mob.pounceUntil) {
        if (time >= m.mob.pounceUntil) { m.mob.pounceUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._pounceAng) * cfg.dashSpeed, Math.sin(m.mob._pounceAng) * cfg.dashSpeed);
        return true;
      }
      if (m.mob._pounceLock) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 110) % 2 === 0 ? 0xb08648 : 0xffffff);
        if (time >= m.mob._pounceLock) {
          m.mob._pounceLock = 0; m.clearTint();
          if (m.mob._pounceG) { try { m.mob._pounceG.destroy(); } catch (e) {} m.mob._pounceG = null; }
          m.mob.pounceUntil = time + cfg.dashMs;
          m.setVelocity(Math.cos(m.mob._pounceAng) * cfg.dashSpeed, Math.sin(m.mob._pounceAng) * cfg.dashSpeed);
          try { AUDIO.play('lionroar'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.pounceAt) m.mob.pounceAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.pounceAt && d < cfg.range && player.state.alive) {
        m.mob.pounceAt = time + cfg.everyMs;
        m.mob._pounceLock = time + cfg.warnMs;
        m.mob._pounceAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._pounceG = COL._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._pounceAng) * cfg.len, m.y + Math.sin(m.mob._pounceAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // SHIELD LEGIONARY — slow advance; blocks frontal shots (flanks/back open).
    _legionary: function (scene, m, player, time) {
      COL._frontalBlock(scene, m, m.mob.def.block.arcRad, m.mob.def.block.range);
      return false;   // fall through to the generic slow chase-advance
    },
    // BEAST HANDLER — whip crack rallies nearby beasts (mobs only, respects hitstop).
    _handler: function (scene, m, player, time) {
      var cfg = m.mob.def.buff;
      if (!m.mob.nextBuffAt) m.mob.nextBuffAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      if (!scene.hitstopActive && time >= m.mob.nextBuffAt) {
        var best = null, bestD = cfg.range;
        scene.mobs.children.iterate(function (o) {
          if (!o || !o.active || !o.mob || o === m) return;
          var dd = Math.hypot(o.x - m.x, o.y - m.y);
          if (dd < bestD) { bestD = dd; best = o; }
        });
        if (best) {
          m.mob.nextBuffAt = time + cfg.everyMs;
          best.mob.spdMult = cfg.spdMult; best.mob._buffUntil = time + cfg.durMs;
          best.setTint(0xe0b060);
          scene.damageNumber(best.x, best.y - 24, 'RALLIED', '#e0b060');
          scene.burst(m.x, m.y, 6, 0xe0b060);
          try { AUDIO.play('crowdcheer'); } catch (e) {}
        }
      }
      return false;   // still advances / contacts
    },
    // WAR ELEPHANT — trumpet → stampede lanes; quake-ring stomp up close.
    _elephant: function (scene, m, player, time) {
      var C = scene._col, cfg = m.mob.def.stampede;
      if (m.mob._stompLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._stompLock) {
          m.mob._stompLock = 0;
          var g = scene.add.graphics().setDepth(2);
          C.rings.push({ x: m.x, y: m.y, r: 24, r0: 24, maxR: cfg.stompR, start: time, until: time + cfg.stompMs,
            dmg: cfg.stompDmg, src: "the Elephant's stomp", fromBoss: false, hit: false, g: g, tint: 0x9a9aa2 });
          scene.cameras.main.shake(120, 0.007);
        }
        return true;
      }
      if (m.mob._stampLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._stampLock) {
          m.mob._stampLock = 0;
          (m.mob._stampG || []).forEach(function (g) { try { g.destroy(); } catch (e) {} });
          m.mob._stampG = null;
          var base = Math.atan2(player.y - m.y, player.x - m.x);
          for (var i = 0; i < cfg.laneCount; i++) {
            var a = base + (i - (cfg.laneCount - 1) / 2) * 0.4;
            COL._lane(scene, { x0: m.x, y0: m.y, x1: m.x + Math.cos(a) * cfg.len, y1: m.y + Math.sin(a) * cfg.len },
              cfg.half, 0, cfg.laneDmg, 'a stampede lane', false, time, 0x9a9aa2, m.mob.def);
          }
        }
        return true;
      }
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (d < cfg.stompRange && (!m.mob.stampedeAt || time >= m.mob.stampedeAt) && player.state.alive) {
        m.mob.stampedeAt = time + cfg.everyMs;
        m.mob._stompLock = time + cfg.warnMs * 0.7;
        COL._zone(scene, m.x, m.y, cfg.stompR, cfg.warnMs * 0.7, 0, 'a stomp', false, false, time, null);
        try { AUDIO.play('elephanttrumpet'); } catch (e) {}
        return true;
      }
      if (!m.mob.stampedeAt) m.mob.stampedeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      if (time >= m.mob.stampedeAt && d < cfg.range && player.state.alive) {
        m.mob.stampedeAt = time + cfg.everyMs;
        m.mob._stampLock = time + cfg.warnMs;
        var base2 = Math.atan2(player.y - m.y, player.x - m.x), gs = [];
        for (var j = 0; j < cfg.laneCount; j++) {
          var a2 = base2 + (j - (cfg.laneCount - 1) / 2) * 0.4;
          gs.push(COL._laneWarn(scene, m.x, m.y, m.x + Math.cos(a2) * cfg.len, m.y + Math.sin(a2) * cfg.len, cfg.half));
        }
        m.mob._stampG = gs;
        try { AUDIO.play('elephanttrumpet'); } catch (e) {}
        return true;
      }
      return false;
    },
    // MINOTAUR — paws ground → charge lane, then axe-slam where he stops.
    _minotaur: function (scene, m, player, time) {
      var cfg = m.mob.def.charge;
      if (m.mob.chargeUntil) {
        if (time >= m.mob.chargeUntil) {
          m.mob.chargeUntil = 0; m.setVelocity(0, 0);
          COL._zone(scene, m.x, m.y, cfg.slamR, cfg.slamWarnMs, cfg.slamDmg, "the Minotaur's axe", false, false, time, null);
          scene.cameras.main.shake(120, 0.007);
          return true;
        }
        m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
        return true;
      }
      if (m.mob._chargeLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._chargeLock) {
          m.mob._chargeLock = 0;
          if (m.mob._chargeG) { try { m.mob._chargeG.destroy(); } catch (e) {} m.mob._chargeG = null; }
          m.mob.chargeUntil = time + cfg.chargeMs;
          m.setVelocity(Math.cos(m.mob._chargeAng) * cfg.chargeSpeed, Math.sin(m.mob._chargeAng) * cfg.chargeSpeed);
          try { AUDIO.play('minotaurbellow'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.chargeAt) m.mob.chargeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.chargeAt && d < cfg.range && player.state.alive) {
        m.mob.chargeAt = time + cfg.everyMs;
        m.mob._chargeLock = time + cfg.warnMs;
        m.mob._chargeAng = Math.atan2(player.y - m.y, player.x - m.x);
        m.mob._chargeG = COL._laneWarn(scene, m.x, m.y, m.x + Math.cos(m.mob._chargeAng) * cfg.len, m.y + Math.sin(m.mob._chargeAng) * cfg.len, cfg.half);
        return true;
      }
      return false;
    },
    // CROWD FAVORITE — taunts (vulnerable) between attacks; crowd cheer = brief
    // sparkle SHIELD (refund, capped uptime); hit him mid-taunt.
    _favorite: function (scene, m, player, time) {
      var cfg = m.mob.def.taunt;
      if (m.mob._shieldHp === undefined) m.mob._shieldHp = m.mob.hp;
      if (m.mob._shielded) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 90) % 2 === 0 ? 0xf8d878 : 0xffffff);
        if (m.mob.hp < m.mob._shieldHp) { m.mob.hp = m.mob._shieldHp; scene.damageNumber(m.x, m.y - 24, 'CHEERED', '#f8d878'); }
        if (time >= m.mob.shieldUntil) { m.mob._shielded = false; m.clearTint(); m.mob.shieldCdUntil = time + cfg.shieldCdMs; }
        return true;
      }
      m.mob._shieldHp = m.mob.hp;
      if (m.mob._taunting) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 140) % 2 === 0 ? 0xe0a832 : 0xffffff);
        if (time >= m.mob.tauntUntil) {
          m.mob._taunting = false; m.clearTint();
          if (time >= (m.mob.shieldCdUntil || 0)) {
            m.mob._shielded = true; m.mob.shieldUntil = time + cfg.shieldMs; m.mob._shieldHp = m.mob.hp;
            scene.burst(m.x, m.y, 8, 0xf8d878);
            try { AUDIO.play('crowdcheer'); } catch (e) {}
          }
        }
        return true;
      }
      if (!m.mob.nextTauntAt) m.mob.nextTauntAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      if (time >= m.mob.nextTauntAt && player.state.alive) {
        m.mob.nextTauntAt = time + cfg.everyMs;
        m.mob._taunting = true; m.mob.tauntUntil = time + cfg.tauntMs;
        return true;
      }
      return false;
    },
    // WAR HOUND — pack lunger: lunge-glint warns → dash.
    _hound: function (scene, m, player, time) {
      var cfg = m.mob.def.houndLunge;
      if (m.mob.lungeUntil) {
        if (time >= m.mob.lungeUntil) { m.mob.lungeUntil = 0; m.setVelocity(0, 0); return true; }
        m.setVelocity(Math.cos(m.mob._lungeAng) * cfg.dashSpeed, Math.sin(m.mob._lungeAng) * cfg.dashSpeed);
        return true;
      }
      if (m.mob._lungeLock) {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 80) % 2 === 0 ? 0xd04848 : 0xffffff);
        if (time >= m.mob._lungeLock) {
          m.mob._lungeLock = 0; m.clearTint();
          m.mob._lungeAng = Math.atan2(player.y - m.y, player.x - m.x);
          m.mob.lungeUntil = time + cfg.dashMs;
        }
        return true;
      }
      if (!m.mob.lungeAt) m.mob.lungeAt = time + cfg.everyMs * (0.3 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.lungeAt && d < cfg.range && player.state.alive) {
        m.mob.lungeAt = time + cfg.everyMs;
        m.mob._lungeLock = time + cfg.warnMs;
        return true;
      }
      return false;
    },
    // VESTAL CURSER — purple glyph blooms where you stand → weaken zone.
    _vestal: function (scene, m, player, time) {
      var cfg = m.mob.def.glyph;
      if (m.mob._glyphLock) {
        if (time >= m.mob._glyphLock) {
          m.mob._glyphLock = 0;
          if (m.mob._glyphG) { try { m.mob._glyphG.destroy(); } catch (e) {} m.mob._glyphG = null; }
          COL._zone(scene, m.mob._glyphX, m.mob._glyphY, cfg.glyphR, 0, 0, 'a curse glyph', false, false, time,
            { leaveZone: { lifeMs: cfg.zoneMs, slowMult: cfg.slowMult, weakenMult: cfg.weakenMult } });
          try { AUDIO.play('curseglyph'); } catch (e) {}
        }
        return true;
      }
      if (!m.mob.glyphAt) m.mob.glyphAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.glyphAt && d < cfg.range && player.state.alive) {
        m.mob.glyphAt = time + cfg.everyMs;
        m.mob._glyphLock = time + cfg.warnMs;
        m.mob._glyphX = player.x; m.mob._glyphY = player.y;
        var g = scene.add.circle(player.x, player.y, cfg.glyphR, PURPLE, 0.13).setStrokeStyle(2, 0x8a4a9a, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g, scale: 1, duration: cfg.warnMs });
        m.mob._glyphG = g;
        return true;
      }
      return false;
    },
    // EXECUTIONER — axe overhead → warned slam circle + follow-through cleave.
    _executioner: function (scene, m, player, time) {
      var cfg = m.mob.def.exe;
      if (m.mob._exeLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._exeLock) {
          m.mob._exeLock = 0;
          if (m.mob._exeG) { try { m.mob._exeG.destroy(); } catch (e) {} m.mob._exeG = null; }
          scene.cameras.main.shake(140, 0.008); try { AUDIO.play('exeslam'); } catch (e) {}
          var sx = m.mob._exeX, sy = m.mob._exeY;
          if (player.state.alive && Math.hypot(player.x - sx, player.y - sy) < cfg.slamR) Entities.hurtPlayer(scene, player, cfg.slamDmg, time, "the Executioner's axe");
          // follow-through cleave sector
          m.mob._cleaveLock = time + cfg.cleaveMs;
          m.mob._cleaveAng = Math.atan2(sy - m.y, sx - m.x);
          var g = scene.add.graphics().setDepth(2); g.fillStyle(WARN_FILL, 0.14); g.lineStyle(2, WARN, 0.8);
          g.slice(m.x, m.y, cfg.cleaveRange, m.mob._cleaveAng - cfg.cleaveHalf, m.mob._cleaveAng + cfg.cleaveHalf, false); g.fillPath(); g.strokePath();
          m.mob._cleaveG = g;
        }
        return true;
      }
      if (m.mob._cleaveLock) {
        m.setVelocity(0, 0);
        if (time >= m.mob._cleaveLock) {
          m.mob._cleaveLock = 0;
          if (m.mob._cleaveG) { try { m.mob._cleaveG.destroy(); } catch (e) {} m.mob._cleaveG = null; }
          if (player.state.alive) {
            var pd = Math.hypot(player.x - m.x, player.y - m.y), pa = Math.atan2(player.y - m.y, player.x - m.x);
            var diff = Math.atan2(Math.sin(pa - m.mob._cleaveAng), Math.cos(pa - m.mob._cleaveAng));
            if (pd < cfg.cleaveRange && Math.abs(diff) < cfg.cleaveHalf) Entities.hurtPlayer(scene, player, cfg.cleaveDmg, time, "the Executioner's cleave");
          }
        }
        return true;
      }
      if (!m.mob.exeAt) m.mob.exeAt = time + cfg.everyMs * (0.4 + SIM.rng() * 0.6);
      var d = Math.hypot(player.x - m.x, player.y - m.y);
      if (time >= m.mob.exeAt && d < cfg.range && player.state.alive) {
        m.mob.exeAt = time + cfg.everyMs;
        m.mob._exeLock = time + cfg.warnMs;
        m.mob._exeX = player.x; m.mob._exeY = player.y;
        var g2 = scene.add.circle(player.x, player.y, cfg.slamR, WARN_FILL, 0.14).setStrokeStyle(2, WARN, 0.85).setDepth(2).setScale(0.4);
        scene.tweens.add({ targets: g2, scale: 1, duration: cfg.warnMs });
        m.mob._exeG = g2;
        return true;
      }
      return false;
    },
    // CHARIOT RACER — orbits the rim track; telegraphs warned crossing lanes.
    _chariot: function (scene, m, player, time) {
      var C = scene._col, A = C.arena, cfg = m.mob.def.chariotRun;
      if (m.mob._orbitDir === undefined) m.mob._orbitDir = 1;
      var ang = Math.atan2(m.y - A.y, m.x - A.x);
      var tang = ang + m.mob._orbitDir * Math.PI / 2;
      var ringX = A.x + Math.cos(ang) * A.trackR, ringY = A.y + Math.sin(ang) * A.trackR;
      var vx = Math.cos(tang) * cfg.orbitSpeed + (ringX - m.x) * 1.5;
      var vy = Math.sin(tang) * cfg.orbitSpeed + (ringY - m.y) * 1.5;
      var vd = Math.hypot(vx, vy) || 1;
      m.setVelocity(vx / vd * cfg.orbitSpeed, vy / vd * cfg.orbitSpeed);
      m.setFlipX(vx < 0);
      // telegraphed crossing lane
      if (!m.mob.laneAt) m.mob.laneAt = time + cfg.laneEveryMs * (0.4 + SIM.rng() * 0.6);
      if (m.mob._laneLockUntil) {
        if (time >= m.mob._laneLockUntil) {
          m.mob._laneLockUntil = 0;
          if (m.mob._laneG) { try { m.mob._laneG.destroy(); } catch (e) {} m.mob._laneG = null; }
          var la = m.mob._laneAng;
          // M7k AUDIT fix: args were shifted — cfg.laneDmg landed in the warnMs
          // slot. The warn already ran via _laneG during laneWarnMs, so the
          // lane fires immediately (warnMs 0, the elephant-stampede pattern).
          COL._lane(scene, { x0: A.x - Math.cos(la) * cfg.laneLen / 2, y0: A.y - Math.sin(la) * cfg.laneLen / 2,
                             x1: A.x + Math.cos(la) * cfg.laneLen / 2, y1: A.y + Math.sin(la) * cfg.laneLen / 2 },
            cfg.laneHalf, 0, cfg.laneDmg, 'a chariot lane', false, time, 0xa02028, m.mob.def);
          try { AUDIO.play('chariotrumble'); } catch (e) {}
        }
        return true;
      }
      if (time >= m.mob.laneAt) {
        m.mob.laneAt = time + cfg.laneEveryMs;
        m.mob._laneLockUntil = time + cfg.laneWarnMs;
        m.mob._laneAng = Math.atan2(player.y - A.y, player.x - A.x) + Math.PI / 2;
        m.mob._laneG = COL._laneWarn(scene, A.x - Math.cos(m.mob._laneAng) * cfg.laneLen / 2, A.y - Math.sin(m.mob._laneAng) * cfg.laneLen / 2,
          A.x + Math.cos(m.mob._laneAng) * cfg.laneLen / 2, A.y + Math.sin(m.mob._laneAng) * cfg.laneLen / 2, cfg.laneHalf);
      }
      return true;   // owns its movement (orbit)
    },

    // ================================================= INTERNAL HELPERS ====
    _laneWarn: function (scene, x0, y0, x1, y1, half) {
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, WARN_FILL, 0.14); g.lineBetween(x0, y0, x1, y1);
      g.lineStyle(2, WARN, 0.85); g.lineBetween(x0, y0, x1, y1);
      return g;
    },
    _zone: function (scene, x, y, r, warnMs, dmg, src, fromBoss, killMobs, time, opts) {
      var C = scene._col;
      var tint = fromBoss ? WINE : WARN_FILL;
      var ring = scene.add.circle(x, y, r, tint, 0.13).setStrokeStyle(2, WARN, 0.85).setDepth(2).setScale(0.35);
      scene.tweens.add({ targets: ring, scale: 1, duration: Math.max(1, warnMs) });
      var z = { x: x, y: y, r: r, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, killMobs: !!killMobs, ring: ring, opts: opts || null };
      C.zones.push(z);
      var warn = { x: x, y: y, r: r, until: time + warnMs };
      scene._zoneWarns.push(warn); z._warn = warn;
    },
    _runZones: function (scene, time) {
      var C = scene._col;
      for (var i = C.zones.length - 1; i >= 0; i--) {
        var z = C.zones[i];
        if (time < z.at) continue;
        C.zones.splice(i, 1);
        if (z._warn) { var wi = scene._zoneWarns.indexOf(z._warn); if (wi >= 0) scene._zoneWarns.splice(wi, 1); }
        if (z.ring) { try { z.ring.destroy(); } catch (e) {} }
        scene.burst(z.x, z.y, 10, z.fromBoss ? WINE : WARN);
        if (z.dmg > 0) scene.cameras.main.shake(80, 0.004);
        if (z.killMobs) scene.mobs.children.iterate(function (m) { if (m && m.active && Math.hypot(m.x - z.x, m.y - z.y) < z.r) scene.killMobCredited(m); });
        if (z.dmg > 0 && scene.player.state.alive && Math.hypot(scene.player.x - z.x, scene.player.y - z.y) < z.r)
          Entities.hurtPlayer(scene, scene.player, z.dmg, time, z.src, z.fromBoss);
        if (z.opts && z.opts.leaveSlick) {
          var sl = z.opts.leaveSlick;
          var obj = scene.add.circle(z.x, z.y, sl.r, WINE, 0.28).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: sl.r, dieAt: time + sl.lifeMs, obj: obj, slideMult: 1.4, fromBoss: z.fromBoss, src: 'a wine slick' });
        }
        if (z.opts && z.opts.leaveZone) {
          var zn = z.opts.leaveZone;
          var obj2 = scene.add.circle(z.x, z.y, z.r, PURPLE, 0.22).setDepth(1.2);
          C.patches.push({ x: z.x, y: z.y, r: z.r, dieAt: time + zn.lifeMs, obj: obj2, slowMult: zn.slowMult, weakenMult: zn.weakenMult, src: 'a curse zone' });
        }
      }
    },
    _lane: function (scene, L, half, warnMs, dmg, src, fromBoss, time, tint, exclDef) {
      var C = scene._col;
      var g = scene.add.graphics().setDepth(2);
      g.lineStyle(half * 2, tint, 0.16); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      g.lineStyle(2, tint, 0.9); g.lineBetween(L.x0, L.y0, L.x1, L.y1);
      C.lanes.push({ L: L, half: half, at: time + warnMs, dmg: dmg, src: src, fromBoss: !!fromBoss, g: g, tint: tint, excl: exclDef });
    },
    _runLanes: function (scene, time) {
      var C = scene._col;
      for (var i = C.lanes.length - 1; i >= 0; i--) {
        var l = C.lanes[i];
        if (time < l.at) continue;
        C.lanes.splice(i, 1);
        if (l.g) { try { l.g.destroy(); } catch (e) {} }
        var fg = scene.add.graphics().setDepth(9);
        fg.lineStyle(l.half * 2, l.tint, 0.5); fg.lineBetween(l.L.x0, l.L.y0, l.L.x1, l.L.y1);
        scene.tweens.add({ targets: fg, alpha: 0, duration: 260, onComplete: (function (fg2) { return function () { try { fg2.destroy(); } catch (e) {} }; })(fg) });
        scene.cameras.main.shake(110, 0.005);
        scene.mobs.children.iterate(function (m) {
          if (m && m.active && m.mob && m.mob.def !== l.excl && dist2seg(m.x, m.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half) scene.killMobCredited(m);
        });
        var p = scene.player;
        if (p.state.alive && dist2seg(p.x, p.y, l.L.x0, l.L.y0, l.L.x1, l.L.y1) < l.half)
          Entities.hurtPlayer(scene, p, l.dmg, time, l.src, l.fromBoss);
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = COL;
  root.COLOSSEUM_SCENE = COL;
})(typeof window !== 'undefined' ? window : this);
