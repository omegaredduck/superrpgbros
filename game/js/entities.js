// ============================================================================
// entities.js — Player, Mob, and Projectile behaviors. These are thin Phaser
// wrappers around plain-data state; all math defers to SIM (seam rules 1-3).
// ============================================================================

var Entities = (function () {
  var nextId = 1;

  // --------------------------------------------------------------- PLAYER --
  function createPlayer(scene, x, y, character) {
    var cls = DATA.classes[character.cls];
    var stats = SIM.statsFor(cls, character.level, character.potionsDrunk,
                             character.equipment);  // M2: potions · M3: gear
    // M4: the sprite is the CLASS's texture (Ranger vs Wizard); the held
    // weapon sprite below is the class weapon's heldTexture (bow vs staff).
    var p = scene.physics.add.sprite(x, y, cls.texture || 'ranger');
    p.setScale(2).setDepth(10);
    p.body.setSize(10, 12).setOffset(3, 3);
    p.id = nextId++;
    p.state = {                                  // plain-data state (seam rule 1)
      cls: character.cls, level: character.level, xp: character.xp,
      equipment: character.equipment,            // M3: same ref as the save — one truth
      stats: stats, hp: stats.hp,
      // M4 berserker rework: a `startsEmpty` resource (the Knight's RAGE) opens
      // at 0 — it's earned by connecting the cleave, never given.
      mp: (cls.resource && cls.resource.startsEmpty) ? 0 : stats.mp,
      lastHitAt: -9999, lastShotAt: 0, lastAbilityAt: 0, alive: true, kills: 0,
      whirling: false, lastWhirlTickAt: 0,       // M4: Knight whirlwind channel state
      swingAt: 0, swingArc: 0,                    // M4: Knight melee swing animation
      lastBarrageAt: 0,                           // M4: Wizard machine-gun cadence
      slowUntil: 0, slowMult: 1,                  // M4.7: the Conductor's SCHEDULE slow
      regenning: false                            // M4.8: Ranger dodge-regen active flag
    };
    // E8 (M2.1): the held weapon sprite — presentation only (seam rule 3);
    // aligned to the aim direction every frame in updatePlayer.
    var weapon = DATA.weapons[cls.weapon];
    if (weapon.heldTexture) {
      p.held = scene.add.sprite(x, y, weapon.heldTexture).setScale(2).setDepth(11);
    }
    // HI-FI DEFAULT (2026-07-14): apply the class's hi-fi art model. The Ranger
    // gets the 64px animated model; classes without a hi-fi model yet keep the
    // classic look untouched.
    applyModelSkin(scene, p);
    return p;
  }

  // HI-FI DEFAULT (2026-07-14, ex-ART-TEST): (re)skin a player sprite to its
  // class's hi-fi art model. The Ranger gets the 64px animated spritesheet,
  // idle/walk anims, the rotating lead arm, and the matching bow. Classes with
  // no hi-fi model (until theirs land) keep the classic look precisely (static
  // texture, scale 2, 10x12 body). Safe to call on a live sprite or right
  // after createPlayer. NOTE (audit 2026-07-14): the hi-fi models are ~2x the
  // classic on-screen size BY DESIGN (user pick), and the hurtbox scales WITH
  // the sprite (40x48 world vs classic 20x24) so hits match what you see —
  // the same 0.625/0.75 body fractions as classic. Dodge tuning knob if the
  // bigger body ever feels unfair: shrink d.body in the model descs.
  function applyModelSkin(scene, p) {
    if (!p || !p.state) return;
    var st = p.state, cls = DATA.classes[st.cls];
    // every class answers its hi-fi model descriptor (ranger/wizard/knight);
    // null = classic fallback (art module failed to load).
    var d = (typeof TEX !== 'undefined' && TEX.playerModel) ? TEX.playerModel(st.cls) : null;
    if (d && scene.textures.exists(d.key)) {
      p._rangerModel = d;                    // (historical name — now any class's hi-fi model)
      p.setTexture(d.key, 'idle0').setScale(d.scale);
      p.body.setSize(d.body.w, d.body.h).setOffset(d.body.ox, d.body.oy);
      try { p.play(d.idle, true); } catch (e) {}
      // RANGER ONLY: the LEAD ARM is its own sprite that rotates to the aim
      // (updatePlayer); depth sits between the body (10) and the bow (11).
      if (d.armKey && scene.textures.exists(d.armKey)) {
        if (!p.arm) p.arm = scene.add.sprite(p.x, p.y, d.armKey).setDepth(10.5);
        p.arm.setTexture(d.armKey).setScale(d.scale).setOrigin(d.armPivotX, 0.5).setVisible(true);
      } else if (p.arm) { p.arm.setVisible(false); }
      if (p.held && d.bowKey && scene.textures.exists(d.bowKey)) {
        // bow pivots at its GRIP and stays UPRIGHT (updatePlayer flips it by
        // facing but never rotates it to the aim — a real archer's hold).
        p.held.setTexture(d.bowKey).setScale(d.scale).setOrigin(d.bowGrip.x, d.bowGrip.y).setDepth(11);
      } else if (p.held && d.heldKey && scene.textures.exists(d.heldKey)) {
        // WIZARD/KNIGHT: hi-fi held weapon (star staff / greatsword). Center
        // origin — the classic carry math in updatePlayer positions it.
        p.held.setTexture(d.heldKey).setScale(d.heldScale).setOrigin(0.5, 0.5).setDepth(11);
      }
    } else {
      p._rangerModel = null;
      try { if (p.anims) p.anims.stop(); } catch (e) {}
      p.setTexture((cls && cls.texture) || 'ranger').setScale(2);
      p.body.setSize(10, 12).setOffset(3, 3);
      if (p.arm) p.arm.setVisible(false);
      if (p.held) {
        var weapon = cls && DATA.weapons[cls.weapon];
        if (weapon && weapon.heldTexture) p.held.setTexture(weapon.heldTexture).setScale(2).setOrigin(0.5, 0.5).setFlipX(false);
      }
    }
  }

  function updatePlayer(scene, p, intent, time, dt) {
    var st = p.state;
    if (!st.alive) { p.setVelocity(0, 0); if (p.held) p.held.setVisible(false); if (p.arm) p.arm.setVisible(false); if (p.legendGlow) p.legendGlow.setVisible(false); if (p.setGlowFx) p.setGlowFx.setVisible(false); return; }

    // movement (diagonal normalized — TM-1)
    // M4.7: THE SCHEDULE — the Conductor's pocket watch runs YOUR legs on his
    // time (st.slowUntil/slowMult set by RealmScene; absolute clock, shifted
    // in unfreeze). Only movement slows — aim and fire rate stay yours.
    var vx = intent.moveX, vy = intent.moveY;
    var len = Math.hypot(vx, vy) || 1;
    var moveMult = (st.slowUntil && time < st.slowUntil) ? (st.slowMult || 1) : 1;
    p.setVelocity(vx / len * st.stats.spd * moveMult, vy / len * st.stats.spd * moveMult);

    // E8 (M2.1, TM-1): the body faces where you AIM, not where you walk (F2),
    // and the bow dynamically aligns to the exact aim angle.
    p.setFlipX(Math.cos(intent.aimAngle) < 0);

    // ART-FIDELITY TEST: drive idle/walk animation for hi-fi Ranger models.
    // Classic models leave p._rangerModel null → this block is skipped entirely.
    if (p._rangerModel) {
      var moving = !!(intent.moveX || intent.moveY);
      var want = moving ? p._rangerModel.walk : p._rangerModel.idle;
      var cur = (p.anims && p.anims.currentAnim) ? p.anims.currentAnim.key : null;
      if (cur !== want) { try { p.play(want, true); } catch (e) {} }
    }

    if (p.held) {
      var weap = DATA.weapons[DATA.classes[st.cls].weapon];
      if (weap.upright) {
        // M4 (user, 2026-07-13): a WALKING-STAFF carry — the weapon stands
        // upright at the hand on the facing side with a slight lean, instead
        // of pointing out along the aim like a bow arm. (Texture points RIGHT,
        // so -90° stands it head-up.)
        var side = Math.cos(intent.aimAngle) < 0 ? -1 : 1;
        // hi-fi models carry the staff at an OUTSTRETCHED arm's length (the
        // model's heldOffset, world px — matches the baked lead arm), so it
        // stands clear of the robe; classic keeps the close carry.
        var hiOff = p._rangerModel && p._rangerModel.heldOffset;
        p.held.setVisible(true)
          .setPosition(p.x + side * (hiOff || weap.holdOffset * 0.6), p.y + (hiOff ? 2 : 3))
          .setRotation(-Math.PI / 2 + side * 0.12);
      } else {
        // M4: a MELEE weapon SWINGS — during the swing window the held sword
        // sweeps through the arc (windup at -arc → follow-through at +arc,
        // eased) so the attack reads as a real chop, not a static point.
        // Other ranged weapons (the bow) track the aim as before.
        var ang = intent.aimAngle;
        if (weap.melee && st.swingAt && time - st.swingAt < (weap.swingMs || 160)) {
          var pr = (time - st.swingAt) / (weap.swingMs || 160);   // 0..1
          var eased = pr * pr * (3 - 2 * pr);                     // smoothstep
          ang += (-1 + 2 * eased) * (st.swingArc || 0);          // -arc → +arc
        }
        // ART-FIDELITY TEST: a real archer's hold — the LEAD ARM rotates to the
        // aim (the radius; it's what moves, down when you aim down). The BOW is
        // TANGENT to the circle around the character: its limbs stay perpendicular
        // to the arm and its belly points outward along the aim, so aiming right
        // gives a vertical bow, up/down give horizontal, etc. (rotation = aim).
        // The arm mounts at the shoulder (following the body flip); the bow sits
        // at the arm's far hand. The arrow still fires the true aim angle.
        if (p._rangerModel && p._rangerModel.shoulder) {
          var dA = p._rangerModel, facingLeft = Math.cos(ang) < 0, f = facingLeft ? -1 : 1, ds = p.displayWidth || 32;
          var shX = p.x + f * (dA.shoulder.x - 0.5) * ds, shY = p.y + (dA.shoulder.y - 0.5) * ds;
          if (p.arm) p.arm.setVisible(true).setPosition(shX, shY).setRotation(ang).setFlipY(facingLeft);
          var handX = shX + Math.cos(ang) * dA.armLen, handY = shY + Math.sin(ang) * dA.armLen;
          p.held.setVisible(true).setFlipX(false).setRotation(ang).setPosition(handX, handY);
        } else {
          p.held.setVisible(true)
            .setPosition(p.x + Math.cos(ang) * weap.holdOffset, p.y + Math.sin(ang) * weap.holdOffset)
            .setRotation(ang);   // rotation alone fully orients the weapon
        }
      }
    }

    // MP regen
    st.mp = Math.min(st.stats.mp, st.mp + DATA.classes[st.cls].mpRegenPerSec * dt / 1000);
    // M5.1 (user): the ranger's epic+ bow = UNLIMITED ENERGY — the pool pins full
    if (SIM.weaponMod(st.equipment).freeEnergy) st.mp = st.stats.mp;

    // M4.8: RANGER DODGE REGEN — untouched for hpRegen.delayMs → heal a slow
    // trickle of max HP (see DATA.classes.ranger.hpRegen). lastHitAt is stamped
    // on every hit (Entities.hurtPlayer), so this is a RELATIVE window, not an
    // absolute deadline — no unfreeze() shift needed (pausing can't heal you;
    // update() returns early while paused). st.regenning drives the world glow.
    var clsDef = DATA.classes[st.cls];
    st.regenning = false;
    if (clsDef.hpRegen && st.hp < st.stats.hp &&
        time - st.lastHitAt >= clsDef.hpRegen.delayMs) {
      st.hp = Math.min(st.stats.hp, st.hp + st.stats.hp * clsDef.hpRegen.pctPerSec * dt / 1000);
      st.regenning = true;
    }

    // firing (M3: the equipped weapon item adds flat damage — SIM.weaponMod)
    // M4: the projectile texture + pierce come from the weapon (bow arrow vs
    // frost bolt); a frost weapon also carries a SLOW rider that the realm's
    // shot→mob overlap applies via Entities.applySlow.
    var weapon = DATA.weapons[DATA.classes[st.cls].weapon];
    var wDmg = weapon.dmg + SIM.weaponMod(st.equipment).dmg;
    var interval = 1000 / (SIM.fireRate(weapon, st.stats.dex) * SIM.projFreq('player'));
    if (intent.firing && time - st.lastShotAt >= interval) {
      st.lastShotAt = time;
      // M4: a MELEE weapon (the Knight's sword) swings an ARC instead of firing
      // a projectile — RealmScene.meleeSwing owns the hit test + crescent VFX
      // (it needs the mobs + boss). Projectile weapons (bow/frost) fire as before.
      if (weapon.melee) {
        if (scene.meleeSwing) scene.meleeSwing(p, intent, st, weapon, wDmg);
        st.swingAt = time;                                       // M4: start the sword-swing animation
        // M5.1: the epic Ragefang's FULL-CIRCLE cleave animates as a spin
        st.swingArc = Phaser.Math.DegToRad(SIM.weaponMod(st.equipment).arcDeg || weapon.arcDeg || 100) * 0.6;
      } else {
        // M5.1 (user bug: "what is sticking out the back of the archer") —
        // shots used to spawn at the BODY CENTER, so the 64px hi-fi arrow's
        // gold fletching poked out of the hero's back for its first frames
        // (auto-fire = a permanent tail-feather). Fire from a MUZZLE point a
        // hand's reach along the aim instead.
        // M5.1 (user): the epic+ bow UPGRADES the basic shot to the FIRE
        // VOLLEY — every trigger pull is the fan, on the weapon's own cadence,
        // costing nothing (energy is unlimited on the same item). The FULL
        // LEGENDARY SET turns the fan into an EXPLOSIVE SHOTGUN: +4 arrows,
        // tighter spread, and every arrow blasts an AoE on hit — overlapping
        // blasts STACK ("intended to be very OP").
        var wm = SIM.weaponMod(st.equipment);
        var vAb = DATA.abilities[DATA.classes[st.cls].ability];
        if (wm.volleyShot && vAb && vAb.type === 'volley') {
          var vFx = SIM.abilityFor(vAb, st.equipment);
          var setOn = SIM.fullLegendSet(st.equipment);
          var vN = vFx.count + (setOn ? 4 : 0);
          var vSpread = setOn ? 24 : vAb.spreadDeg;              // shotgun choke
          var vHalf = (vN - 1) / 2;
          for (var vi = 0; vi < vN; vi++) {
            var va = intent.aimAngle + Phaser.Math.DegToRad(vSpread) * ((vi - vHalf) / vHalf || 0) / 2;
            var vs = fireProjectile(scene, scene.playerShots,
              p.x + Math.cos(va) * 20, p.y + Math.sin(va) * 20, va, vAb.projSpeed,
              SIM.damage(wDmg * vAb.dmgMult, st.stats.att, 0), vAb.lifeMs, 'arrow', vAb.pierce);
            if (vs) {
              if (vAb.burn) vs.proj.burn = { tick: SIM.damage(vAb.burn.dmg, st.stats.att, 0),
                                             everyMs: vAb.burn.everyMs, ms: vAb.burn.ms };
              if (vAb.tint) vs.setTint(vAb.tint);
              if (setOn) vs.proj.explode = { radius: 60, dmg: Math.max(1, Math.round(vs.proj.dmg * 0.6)) };
              if (p._rangerModel && p._rangerModel.arrowKey && scene.textures.exists(p._rangerModel.arrowKey)) {
                var dS = p._rangerModel, sScl = dS.scale;
                vs.setTexture(dS.arrowKey).setScale(sScl);
                var sbw = Math.max(4, Math.round(10 / sScl));
                vs.body.setSize(sbw, sbw)
                  .setOffset(Math.round((vs.width - sbw) / 2), Math.round((vs.height - sbw) / 2));
              }
            }
          }
        } else {
          var mzX = p.x + Math.cos(intent.aimAngle) * 20;
          var mzY = p.y + Math.sin(intent.aimAngle) * 20;
          var shot = fireProjectile(scene, scene.playerShots, mzX, mzY, intent.aimAngle,
            weapon.projSpeed, SIM.damage(wDmg, st.stats.att, 0), weapon.lifeMs,
            weapon.texture || 'arrow', !!weapon.pierce);
          if (shot && weapon.slow) shot.proj.slow = weapon.slow;   // M4: frost rider
          // ART-FIDELITY TEST: swap in the matching hi-fi arrow for the selected
          // Ranger model (visual only — keeps a ~10px world hitbox for parity).
          if (shot && p._rangerModel && p._rangerModel.arrowKey && scene.textures.exists(p._rangerModel.arrowKey)) {
            var dM = p._rangerModel, aScl = dM.scale;
            shot.setTexture(dM.arrowKey).setScale(aScl);
            var bw = Math.max(4, Math.round(10 / aScl));
            shot.body.setSize(bw, bw)
              .setOffset(Math.round((shot.width - bw) / 2), Math.round((shot.height - bw) / 2));
          }
        }
      }
      scene.events.emit('player-shot');
    }

    // SPACE ability (Fusion Law F2/F7). M3: the equipped ability item modifies
    // cost + count (SIM.abilityFor — one-shot casts only). M4: the ability
    // BRANCHES on its type — 'volley' (Ranger fan of arrows, one-shot),
    // 'barrage' (Wizard machine gun, held channel), 'whirlwind' (Knight spin,
    // held channel).
    var ab = DATA.abilities[DATA.classes[st.cls].ability];
    // M4: HELD CHANNELS run on their own paths — the KNIGHT's WHIRLWIND (drain
    // rage over time + per-tick damage via the scene) and the WIZARD's ARCANE
    // BARRAGE (machine-gun bolts, paid per shot). One-shot casts (volley) stay
    // on the cost+cooldown block below.
    if (ab.type === 'whirlwind') {
      channelWhirlwind(scene, p, st, ab, intent, time, dt);
    } else if (ab.type === 'barrage') {
      channelBarrage(scene, p, st, ab, intent, time);
    } else if (ab.type === 'shadowClone') {
      castShadowClone(scene, p, st, ab, intent, time, wDmg);
    } else {
      var abFx = SIM.abilityFor(ab, st.equipment);
      if (intent.ability && st.mp >= abFx.mpCost && time - st.lastAbilityAt >= ab.cooldownMs) {
        var half = (abFx.count - 1) / 2;
        for (var i = 0; i < abFx.count; i++) {
          var a = intent.aimAngle + Phaser.Math.DegToRad(ab.spreadDeg) * ((i - half) / half || 0) / 2;
          // M5.1: volley arrows fire from the muzzle too (same back-fletching fix)
          var vShot = fireProjectile(scene, scene.playerShots,
            p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20, a, ab.projSpeed,
            SIM.damage(wDmg * ab.dmgMult, st.stats.att, 0), ab.lifeMs, 'arrow', ab.pierce);
          if (vShot) {
            // M4.6 FIRE VOLLEY: each arrow carries the BURN rider — per-tick
            // damage is locked in NOW, scaled by ATT (SIM.damage), so the DoT
            // grows with the archer. Applied on hit via Entities.applyBurn.
            if (ab.burn) vShot.proj.burn = { tick: SIM.damage(ab.burn.dmg, st.stats.att, 0),
                                             everyMs: ab.burn.everyMs, ms: ab.burn.ms };
            if (ab.tint) vShot.setTint(ab.tint);           // ember glow (neutral arrow tex)
            // M5.1: the full legendary set makes SPACE volleys explosive too
            if (SIM.fullLegendSet(st.equipment)) {
              vShot.proj.explode = { radius: 60, dmg: Math.max(1, Math.round(vShot.proj.dmg * 0.6)) };
            }
            // hi-fi arrow skin (same swap as the basic shot — visual only)
            if (p._rangerModel && p._rangerModel.arrowKey && scene.textures.exists(p._rangerModel.arrowKey)) {
              var dV = p._rangerModel, vScl = dV.scale;
              vShot.setTexture(dV.arrowKey).setScale(vScl);
              var vbw = Math.max(4, Math.round(10 / vScl));
              vShot.body.setSize(vbw, vbw)
                .setOffset(Math.round((vShot.width - vbw) / 2), Math.round((vShot.height - vbw) / 2));
            }
          }
        }
        st.lastAbilityAt = time; st.mp -= abFx.mpCost; scene.events.emit('player-ability', ab);
      }
    }

    // i-frame blink
    var a = time - st.lastHitAt < DATA.combat.iframesMs ? (Math.floor(time / 60) % 2 ? 0.4 : 1) : 1;
    p.setAlpha(a);
    if (p.held) p.held.setAlpha(a);
    if (p.arm) p.arm.setAlpha(a);

    // M5.1 (user, 2026-07-15): LEGENDARY GLOW — an equipped T5 (orange)
    // weapon BURNS in the hand: an additive aura rides the held sprite,
    // breathing in the tier's color. Presentation only (seam rule 3); runs
    // in the realm AND the chamber (both drive updatePlayer). Behind the
    // weapon (depth 10.8 < held 11) so the blade/bow stays crisp.
    var wIt = st.equipment && DATA.items[st.equipment.weapon];
    var legendary = wIt && wIt.tier === 5;
    if (legendary && p.held && p.held.visible && scene.textures.exists('softglow')) {
      if (!p.legendGlow) {
        p.legendGlow = scene.add.sprite(p.held.x, p.held.y, 'softglow')
          .setDepth(10.8).setBlendMode(Phaser.BlendModes.ADD);
      }
      var lgPulse = 0.7 + 0.3 * Math.sin(time / 240);
      p.legendGlow.setVisible(true).setPosition(p.held.x, p.held.y)
        .setTint(DATA.tiers[5].color)
        .setScale(0.8 + 0.12 * Math.sin(time / 320))
        .setAlpha(0.5 * lgPulse * a);
    } else if (p.legendGlow) {
      p.legendGlow.setVisible(false);
    }

    // M5.1 (user): FULL-LEGENDARY SET AURA — every equipped slot T5 wraps the
    // HERO in a class-colored body glow (archer GREEN · mage BLUE · knight
    // RED — cls.setGlow); the weapon keeps its own orange burn above. Checks
    // all four slots; an empty slot breaks the set.
    var fullSet = !!st.equipment;
    if (fullSet) {
      for (var sIdx = 0; sIdx < DATA.equipSlots.length; sIdx++) {
        var sit = DATA.items[st.equipment[DATA.equipSlots[sIdx]]];
        if (!sit || sit.tier !== 5) { fullSet = false; break; }
      }
    }
    if (fullSet && scene.textures.exists('softglow')) {
      if (!p.setGlowFx) {
        p.setGlowFx = scene.add.sprite(p.x, p.y, 'softglow')
          .setDepth(9.7).setBlendMode(Phaser.BlendModes.ADD);
      }
      var sgPulse = 0.75 + 0.25 * Math.sin(time / 300);
      p.setGlowFx.setVisible(true).setPosition(p.x, p.y)
        .setTint(clsDef.setGlow || clsDef.accent || 0xffffff)
        .setScale(2.0 + 0.18 * Math.sin(time / 260))
        .setAlpha(0.6 * sgPulse * a);
    } else if (p.setGlowFx) {
      p.setGlowFx.setVisible(false);
    }
  }

  // M4 (KNIGHT): the WHIRLWIND channel. While the ability key is held AND MP
  // remains, the Knight spins: drain mpDrainPerSec each second and, every
  // tickMs, hand off to the realm (RealmScene.whirlwindTick owns the mobs, the
  // boss, the tornado procs, and the ring VFX). st.whirling drives the spinning
  // ring in the scene. It costs nothing when it can't spin — the nexus has no
  // whirlwindTick and forces intent.ability false, so no drain in the chamber.
  function channelWhirlwind(scene, p, st, ab, intent, time, dt) {
    var canSpin = intent.ability && st.mp > 0 && !!scene.whirlwindTick;
    if (canSpin) {
      // M4.6: WAR HORNS (knight ability items) cut the rage drain —
      // SIM.abilityFor floors it at 6/s so the spin always costs something.
      // M5.1 (user): the FULL LEGENDARY SET = UNLIMITED RAGE — the whirlwind
      // never drains. The floor rule stands for everything short of the set.
      var wwDrain = SIM.fullLegendSet(st.equipment) ? 0
                    : SIM.abilityFor(ab, st.equipment).mpDrainPerSec;
      st.mp = Math.max(0, st.mp - wwDrain * dt / 1000);
      st.whirling = true;
      if (time - (st.lastWhirlTickAt || 0) >= ab.tickMs) {
        st.lastWhirlTickAt = time;
        scene.whirlwindTick(p, st, ab);
      }
    } else {
      st.whirling = false;
    }
  }

  // M4 (WIZARD, user redesign 2026-07-13): the STORM BARRAGE channel — a
  // machine gun of LIGHTNING BALLS. While the ability key is held, a ball
  // fires every fireEveryMs DEAD STRAIGHT down the aim line (no spread, no
  // pierce), each paid for with mpPerShot; the gun goes quiet the instant MP
  // can't cover the next round. Each ball carries the STRIKE PROC rider
  // (proj.strike) — when it connects, the realm's overlap can SUMMON A
  // LIGHTNING BOLT onto the victim (scene.lightningStrike). Realm-only in
  // practice (nexus forces intent.ability false, and it needs playerShots).
  function channelBarrage(scene, p, st, ab, intent, time) {
    if (!intent.ability || !scene.playerShots) return;
    // M4.6: TOMES (wizard ability items) cut the per-ball cost — SIM.abilityFor
    // floors it at 0.5 MP so the gun is never free.
    var perShot = SIM.abilityFor(ab, st.equipment).mpPerShot;
    if (st.mp < perShot) return;
    if (time - (st.lastBarrageAt || 0) < ab.fireEveryMs) return;
    st.lastBarrageAt = time;
    st.mp -= perShot;
    // M5.1 (user): epic+ rods make the balls HOMING MISSILES; the FULL
    // LEGENDARY SET fires the machine gun in ALL DIRECTIONS at once (8-ball
    // radial, one trigger's cost — "intended to be very OP").
    var homing = SIM.weaponMod(st.equipment).homing;
    var radial = SIM.fullLegendSet(st.equipment);
    var count = radial ? 8 : 1;
    for (var bi = 0; bi < count; bi++) {
      var ba = radial ? (intent.aimAngle + Math.PI * 2 * bi / count) : intent.aimAngle;
      var shot = fireProjectile(scene, scene.playerShots, p.x, p.y, ba, ab.projSpeed,
        SIM.damage(ab.dmg, st.stats.att, 0), ab.lifeMs, ab.texture || 'bolt', false);
      if (shot) {
        if (ab.strike) shot.proj.strike = ab.strike;       // lightning-bolt proc rider
        if (homing) shot.proj.homing = { turn: 7 };        // rad/s steering toward prey
        shot.body.setSize(8, 8).setOffset(1, 1);           // the BIG ball hits like it looks
      }
    }
    scene.events.emit('player-ability', ab);
  }

  // NINJA (Red 2026-07-19): SHADOW CLONE JUTSU — a one-shot cast (cost + cooldown,
  // just like the volley) that hands the SCENE a squad of shadow clones. The
  // clones are scene-owned (RealmScene.summonShadowClones creates them, its
  // updateShadowClones flies them + fires their homing bleed-stars, and they
  // expire on their own timer), so this only pays the CHI and kicks it off.
  // wDmg (basic weapon damage incl. gear) is snapshotted here and scaled per
  // clone shot by dmgMult — the same "lock damage at cast" rule the volley uses.
  // Realm-only: the nexus has no summonShadowClones and forces intent.ability
  // false, so the guard makes the cast a harmless no-op in the chamber.
  function castShadowClone(scene, p, st, ab, intent, time, wDmg) {
    if (!scene.summonShadowClones) return;
    var abFx = SIM.abilityFor(ab, st.equipment);
    if (intent.ability && st.mp >= abFx.mpCost && time - st.lastAbilityAt >= ab.cooldownMs) {
      st.lastAbilityAt = time;
      st.mp -= abFx.mpCost;
      scene.summonShadowClones(p, st, ab, abFx.count, wDmg, time);
      scene.events.emit('player-ability', ab);
    }
  }

  // M4.6: fromBoss — call sites tag the source (boss contact / boss bolts =
  // true) so per-class dmgTaken multipliers can bite hardest where the user
  // asked: the boss. Scaling happens BEFORE the flat DEF subtraction.
  function hurtPlayer(scene, p, dmg, time, sourceName, fromBoss, trueDmg) {
    var st = p.state;
    if (!st.alive || time - st.lastHitAt < DATA.combat.iframesMs) return;
    // M5.3 DEV MODE: immortality — take no damage at all (the Settings toggle)
    try { if (SAVE.settings().dev) return; } catch (e) {}
    st.lastHitAt = time;
    dmg = SIM.incomingDmg(DATA.classes[st.cls], dmg, !!fromBoss);
    // 2026-07-18 (Red): BOSS damage scales with campaign depth here — every boss
    // source passes fromBoss=true, so this one site covers radial/stream filler,
    // contact, AND every telegraphed map verb. Mobs already carry depth in their
    // dmgMult (set in spawnMob), so they are NOT re-scaled here.
    if (fromBoss) dmg = Math.round(dmg * SIM.depthMult(scene.progressDepth || 0).bossDmg);
    var real = Math.max(DATA.combat.minDamage, dmg - Math.floor(st.stats.def));
    // NO ONE-SHOTS (Red): clamp any single hit to a fraction of MAX HP so death
    // always takes ≥2 hits — even a signature "instakill". 1.0 disables it.
    // trueDmg (Red 2026-07-19: the Titan Whale's WATER GUN snipe) bypasses the
    // no-one-shot clamp for a genuine instakill.
    var cap = DATA.combat.maxSingleHitPct;
    if (!trueDmg && cap && cap < 1) real = Math.min(real, Math.max(DATA.combat.minDamage, Math.floor(st.stats.hp * cap)));
    st.hp -= real;
    scene.events.emit('player-hurt', real);
    if (st.hp <= 0) { st.hp = 0; st.alive = false; scene.events.emit('player-died', sourceName); }
  }

  function grantXp(scene, p, amount) {
    var st = p.state;
    var r = SIM.applyXp(st.level, st.xp, amount);
    st.xp = r.xp;
    if (r.ups > 0) {
      var cls = DATA.classes[st.cls];
      st.level = r.level;
      st.stats = SIM.statsFor(cls, st.level,
                              CURRENT && CURRENT.potionsDrunk, st.equipment);
      // level-up full heal (RotMG-ish kindness) — but a startsEmpty resource
      // (the Knight's RAGE) is NEVER given, only earned: it keeps its current
      // value instead of snapping to full (audit fix 2026-07-14; free full-rage
      // whirlwinds on every level-up broke the cleave→spend loop).
      st.hp = st.stats.hp;
      st.mp = (cls.resource && cls.resource.startsEmpty)
        ? Math.min(st.mp, st.stats.mp) : st.stats.mp;
      scene.events.emit('player-levelup', st.level);
    }
  }

  // ----------------------------------------------------------------- MOBS --
  // forceAffix (optional): a specific affix key — used by tests and by future
  // map affixes (E9/M5, e.g. Escalating Threats forcing champion spawns).
  function spawnMob(scene, key, x, y, forceAffix) {
    var def = DATA.mobs[key];
    // ART TEST (hi-fi world): swap in the higher-fidelity mob + its scale/body
    // when the train-yard toggle is on; otherwise the classic 16px path exactly.
    var mm = (typeof TEX !== 'undefined' && TEX.mobModel) ? TEX.mobModel(key) : null;
    var mtex = (mm && scene.textures.exists(mm.key)) ? mm.key : def.texture;
    var baseScale = mm ? mm.scale : 2;
    var m = scene.mobs.get(x, y, mtex);
    if (!m) return null;
    m.setActive(true).setVisible(true).setTexture(mtex).setScale(baseScale).setDepth(5);
    m.body.enable = true;
    if (mm) m.body.setSize(mm.body.w, mm.body.h).setOffset(mm.body.ox, mm.body.oy);
    else m.body.setSize(11, 11).setOffset(2.5, 2.5);
    m._baseScale = baseScale;
    m.id = nextId++;
    // 2026-07-18 (Red): mob HP · XP · damage scale with campaign DEPTH (regions
    // cleared) via SIM.depthMult, composed with the (now-retired, default 1.0)
    // level scaler. dmgMult rides on m.mob and is read at the contact + shoot
    // damage sites. depth 0 → every factor is 1.0 → old numbers exactly.
    var lm = SIM.mobLevelMult(scene.player && scene.player.state ? scene.player.state.level : 1);
    var _dm = SIM.depthMult(scene.progressDepth || 0);
    var _hpM = lm * _dm.mobHp, _xpM = lm * _dm.mobXp, _dgM = lm * _dm.mobDmg;
    var _hp0 = Math.max(1, Math.round(def.hp * _hpM));
    m.mob = { key: key, def: def, hp: _hp0, maxHp: _hp0,   // M5.7: maxHp at spawn (repair-unit mend baseline)
              xp: Math.max(1, Math.round(def.xp * _xpM)), spd: def.spd, dmgMult: _dgM,
              affix: null, evolved: false, lastShotAt: 0, lastContactAt: 0,
              slowUntil: 0, slowMult: 1, frosted: false,     // M4: frost slow (pooled — reset)
              burnUntil: 0, nextBurnAt: 0, burnTick: 0, burnEvery: 0, scorched: false, // M4.6: fire volley burn
              fuseAt: 0,                                      // M4.9: dynamite-mole bomb timer
              lastSlimeAt: 0,                                 // M4.9: conductor-zombie slime cadence
              fogOn: false, fogPhaseAt: 0, concealed: false, fogSprite: null, // M4.9: smog-serpent fog
              // M5.0 grove state (pooled sprite — EVERY field resets here):
              ward: 0,            // bumblebrute: live minis guarding him (immortal while > 0)
              guardianOf: 0,      // mini: the brute id it wards
              castUntil: 0, castStart: 0,   // bumblebrute SUMMON cast bar window
              nextBlinkAt: 0,     // pixie blink clock
              lastGlowAt: 0,      // bloom-pixie glow-trail cadence
              nextSummonAt: 0,    // bloom-pixie bumblebrute-summon clock
              cinematic: false,   // phase-two revival pixies (fly, don't fight)
              flapAt: 0, flapFrame: 0 };    // wing-flap animation (cosmetic)
    // M5.0: mini-mob RECOLORS — skins are same-geometry textures; the pick is
    // cosmetic variety, so Math.random is fine (seam rule 4).
    if (def.skins && def.skins.length) {
      var skin = def.skins[Math.floor(Math.random() * def.skins.length)];
      if (scene.textures.exists(skin)) { m.setTexture(skin); m._texBase = skin; }
      else m._texBase = mtex;
    } else m._texBase = mtex;
    // M5.0: the Bumblebrute summons his wards ON SPAWN behind a short cast bar
    if (def.guard) { m.mob.castStart = scene.time.now; m.mob.castUntil = scene.time.now + def.guard.castMs; }
    m.clearTint(); m.setAlpha(1);
    clearNameTag(m);                                       // pooled sprite may carry a stale tag
    // E9: the affix engine (v2 at M3 — all five affixes live). Rolled at spawn
    // through SIM.rng (seam rule 4); the affix is plain data on m.mob;
    // multipliers applied here, behaviors read the flags where they act
    // (split → updateMob/updateProjectiles · evolve → hurtMob · roles → director).
    var A = DATA.affixes;
    if (A && (forceAffix || SIM.rng() < A.mobRollChance)) {
      var pool = [];
      for (var k in A.mob) {
        if (A.mob[k].splitShots && !def.shoot) continue;   // SPLITTING needs projectiles
        pool.push(k);
      }
      var pick = forceAffix && A.mob[forceAffix] ? forceAffix
               : pool[Math.floor(SIM.rng() * pool.length)];
      var af = A.mob[pick];
      if (af && !(af.splitShots && !def.shoot)) {          // forced or rolled — same rule
        m.mob.affix = af;
        // M5.4/2026-07-18: champion mults stack ON TOP of the level+depth scale
        m.mob.hp  = Math.max(1, Math.round(def.hp  * (af.hpMult  || 1) * _hpM));
        m.mob.xp  = Math.max(1, Math.round(def.xp  * (af.xpMult  || 1) * _xpM));
        m.mob.spd = Math.round(def.spd * (af.spdMult || 1));
        m.mob.dmgMult = _dgM * (af.dmgMult || 1);
        m.setScale((m._baseScale || 2) * (af.scale || 1)).setTint(af.tint);
        // M3 polish: CHAMPION NAMEPLATE — read the threat, don't memorize
        // tints. Presentation only (seam rule 3); follows in updateMob.
        m.nameTag = scene.add.text(x, y, af.name, {
          fontFamily: 'monospace', fontSize: 9, fontStyle: 'bold',
          color: '#' + ('00000' + af.tint.toString(16)).slice(-6)
        }).setOrigin(0.5).setDepth(6);
      }
    }
    return m;
  }

  // The nameplate rides a pooled sprite — every kill path must clear it
  // (hurtMob death, swarm wipes, pooled-sprite reuse in spawnMob). M4.9: it also
  // clears a mob's attached decorations (mole warn-ring, serpent fog cloud) so
  // no death path leaks them.
  function clearNameTag(m) {
    if (m.nameTag) { m.nameTag.destroy(); m.nameTag = null; }
    if (m.warnCircle) { try { m.warnCircle.destroy(); } catch (e) {} m.warnCircle = null; }
    if (m.mob && m.mob.fogSprite) { try { m.mob.fogSprite.destroy(); } catch (e) {} m.mob.fogSprite = null; }
    // M5.0: the Bumblebrute's SUMMON cast bar (three pieces) rides the sprite
    if (m.castBarBg) { try { m.castBarBg.destroy(); } catch (e) {} m.castBarBg = null; }
    if (m.castBar) { try { m.castBar.destroy(); } catch (e) {} m.castBar = null; }
    if (m.castText) { try { m.castText.destroy(); } catch (e) {} m.castText = null; }
    // M7k AUDIT (2026-07-17): GENERIC TELEGRAPH SWEEP — the 16 campaign maps
    // hang warn graphics off m.mob under _-prefixed fields (_strikeG, _laneG,
    // _ring, _aimG, _rollG[], _hole, …). A mob killed MID-TELEGRAPH (or wiped
    // by the portal roar) leaked them permanently. Destroy any Phaser
    // GameObject — or array of them — stored under an _field, plus the
    // hop.ring nesting the leapers use. Data records (no .destroy/.scene/.type)
    // are untouched; the old m.mob object is discarded on pooled reuse, so
    // nulling here is safe.
    if (m.mob) {
      var mm = m.mob, k2, v2, gi2;
      var isGO = function (v) { return v && typeof v.destroy === 'function' && v.scene !== undefined && typeof v.type === 'string'; };
      for (k2 in mm) {
        if (k2.charAt(0) !== '_') continue;
        v2 = mm[k2];
        if (isGO(v2)) { try { v2.destroy(); } catch (e1) {} mm[k2] = null; }
        else if (v2 && v2.constructor === Array) {
          var hadGO = false;
          for (gi2 = 0; gi2 < v2.length; gi2++) if (isGO(v2[gi2])) { hadGO = true; try { v2[gi2].destroy(); } catch (e2) {} }
          if (hadGO) mm[k2] = null;
        }
      }
      if (mm.hop && isGO(mm.hop.ring)) { try { mm.hop.ring.destroy(); } catch (e3) {} mm.hop.ring = null; }
    }
  }

  // M4 (WIZARD): apply a FROST SLOW to a mob — spd × slow.mult for slow.ms.
  // Called from the realm's shot→mob overlap when a frost bolt lands. Refreshes
  // the timer on re-hit; updateMob reads slowUntil/slowMult + paints the tint.
  function applySlow(m, slow, time) {
    if (!m || !m.mob || !slow) return;
    m.mob.slowUntil = time + slow.ms;
    m.mob.slowMult = slow.mult;
  }

  // M4.6 (RANGER FIRE VOLLEY): IGNITE a target — works on mobs (e.mob) and the
  // boss (e.boss). Re-hits REFRESH the burn window; the tick cadence keeps its
  // rhythm while already burning (no stacking, no tick resets — one fire).
  // Burn clocks are ABSOLUTE timestamps: the realm's unfreeze() shifts
  // burnUntil/nextBurnAt with everything else (the m4p audit gotcha).
  function applyBurn(e, burn, time) {
    var s = e && (e.mob || e.boss);
    if (!s || !burn) return;
    var fresh = !(s.burnUntil && time < s.burnUntil);
    s.burnUntil = time + burn.ms;
    s.burnTick = burn.tick;
    s.burnEvery = burn.everyMs;
    if (fresh) s.nextBurnAt = time + burn.everyMs;
  }

  // M5.0: clear ONLY the cast-bar pieces (a champion's nameTag must survive
  // the end of the Bumblebrute's summon cast).
  function clearNameTagCast(m) {
    if (m.castBarBg) { try { m.castBarBg.destroy(); } catch (e) {} m.castBarBg = null; }
    if (m.castBar) { try { m.castBar.destroy(); } catch (e) {} m.castBar = null; }
    if (m.castText) { try { m.castText.destroy(); } catch (e) {} m.castText = null; }
  }

  function updateMob(scene, m, player, time) {
    var def = m.mob.def;
    // M4.6 FIRE BURN — tick the DoT first (the mob may die to it). Burn ticks
    // are the SAME hit still cooking: no knockback, no EVOLVING roll (opts).
    var burning = m.mob.burnUntil && time < m.mob.burnUntil;
    if (burning && time >= m.mob.nextBurnAt) {
      m.mob.nextBurnAt += m.mob.burnEvery;
      hurtMob(scene, m, m.mob.burnTick, time, { dot: true });
      if (!m.active) return;                     // burned to death this tick
    }

    // M7 REGISTRY: map-defined mob verbs — a registered map adds NEW behavior
    // without a core edit: def.mapVerb names a fn in the map def's mobVerbs
    // table. Returning true means the verb OWNED this frame (skip the generic
    // movement/attack verbs below); falsy falls through to them.
    if (def.mapVerb && typeof MAPS !== 'undefined' && MAPS.defs) {
      var MV = MAPS.defs[scene.realmId];
      if (MV && MV.mobVerbs && MV.mobVerbs[def.mapVerb]) {
        if (MV.mobVerbs[def.mapVerb](scene, m, player, time) === true) return;
        if (!m.active) return;                   // the verb may have killed it
      }
    }

    // M4.9 DYNAMITE MOLE — a TELEGRAPHED BOMB: surfaced, stationary, flashing.
    // A long fuse (def.fuse.armMs) gives you time to walk out of the radius;
    // then it detonates (RealmScene.moleExplode). Shoot it first = a normal
    // kill (XP, no boom — hurtMob handles it). Overrides chase/shoot below.
    if (def.fuse) {
      m.setVelocity(0, 0);
      if (!m.mob.fuseAt) m.mob.fuseAt = time + def.fuse.armMs;
      if (scene.ensureMoleWarn) scene.ensureMoleWarn(m, def.fuse.radius);
      var left = m.mob.fuseAt - time;
      var period = Math.max(70, left / 8);       // flashes faster as the fuse burns down
      m.setTint(Math.floor(time / period) % 2 === 0 ? 0xff3b30 : 0xffe08a);
      if (left <= 0 && scene.moleExplode) scene.moleExplode(m, def.fuse);
      return;
    }

    // M5.0 WING FLAP (user: "animate pixies and moonmoth with flopping wings")
    // — cosmetic 2-frame toggle between <tex> and <tex>b. Self-correcting
    // clock, no unfreeze shift needed.
    if (def.flap && m._texBase) {
      if (time >= m.mob.flapAt) {
        m.mob.flapAt = time + 140;
        m.mob.flapFrame = m.mob.flapFrame ? 0 : 1;
        var want = m.mob.flapFrame ? m._texBase + 'b' : m._texBase;
        if (scene.textures.exists(want)) m.setTexture(want);
      }
    }

    // M5.0 PHASE-TWO REVIVAL PIXIES — real mobs on a mission: fly to the
    // fallen boss and channel. No shooting, no blinking, killable (that's the
    // counterplay). RealmScene owns the channel; this just flies them.
    if (m.mob.cinematic) {
      var rt = scene._reviveTarget;
      if (rt) {
        var cdx = rt.x - m.x, cdy = (rt.y - 30) - m.y, cd = Math.hypot(cdx, cdy) || 1;
        if (cd > 70) m.setVelocity(cdx / cd * 160, cdy / cd * 160);
        else {                                   // hover + orbit the body
          var oa = time / 400 + m.id;
          m.setVelocity(Math.cos(oa) * 40, Math.sin(oa) * 24);
        }
        m.setFlipX(cdx < 0);
      } else m.setVelocity(0, 0);
      return;
    }

    // M5.0 BUMBLEBRUTE SUMMON CAST — rooted for the (very short) cast, bar
    // over his head; the wards spawn when it completes (scene queues them —
    // group.get inside the update iterate is the documented hazard).
    if (def.guard && m.mob.castUntil) {
      m.setVelocity(0, 0);
      if (scene.updateCastBar) scene.updateCastBar(m,
        (time - m.mob.castStart) / (m.mob.castUntil - m.mob.castStart), def.guard.label);
      if (time >= m.mob.castUntil) {
        m.mob.castUntil = 0;
        clearNameTagCast(m);
        if (scene.queueGuardSummon) scene.queueGuardSummon(m);
      }
      return;
    }

    var dx = player.x - m.x, dy = player.y - m.y;
    var dist = Math.hypot(dx, dy) || 1;

    // M5.0 PIXIE BLINK — teleport to a fresh angle around the player between
    // fans. Absolute clock → on the unfreeze shift list.
    if (def.blink) {
      if (!m.mob.nextBlinkAt) m.mob.nextBlinkAt = time + def.blink.everyMs * (0.5 + SIM.rng() * 0.5);
      if (time >= m.mob.nextBlinkAt) {
        m.mob.nextBlinkAt = time + def.blink.everyMs;
        var ba = SIM.rng() * Math.PI * 2;
        var bx2 = Phaser.Math.Clamp(player.x + Math.cos(ba) * def.blink.dist, 40, scene.worldW - 40);
        var by2 = Phaser.Math.Clamp(player.y + Math.sin(ba) * def.blink.dist, 40, scene.worldH - 40);
        if (scene.blinkFx) scene.blinkFx(m.x, m.y, bx2, by2, def.deathTint);
        m.setPosition(bx2, by2);
        dx = player.x - m.x; dy = player.y - m.y; dist = Math.hypot(dx, dy) || 1;
      }
    }

    // M5.6 GHOUL LUNGE — a telegraphed pounce-dash: wind up rooted (flash),
    // then dash hard at the player, then cool down. Absolute clocks → unfreeze.
    if (def.lunge) {
      var LG = def.lunge;
      if (m.mob.lungePhase === 'dash') {
        if (time >= m.mob.lungeUntil) { m.mob.lungePhase = null; m.mob.nextLungeAt = time + LG.cooldownMs; m.clearTint(); }
        else { m.setVelocity(m.mob.lvx, m.mob.lvy); m.setFlipX(m.mob.lvx < 0); return; }
      } else if (m.mob.lungePhase === 'wind') {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 90) % 2 === 0 ? 0xff6a2c : 0xffffff);
        if (time >= m.mob.lungeUntil) {
          m.clearTint();
          var la = Math.atan2(dy, dx);
          m.mob.lvx = Math.cos(la) * LG.dashSpeed; m.mob.lvy = Math.sin(la) * LG.dashSpeed;
          m.mob.lungePhase = 'dash'; m.mob.lungeUntil = time + LG.dashMs;
        }
        return;
      } else {
        if (!m.mob.nextLungeAt) m.mob.nextLungeAt = time + LG.cooldownMs * (0.4 + SIM.rng() * 0.6);
        if (dist < LG.range && time >= m.mob.nextLungeAt) { m.mob.lungePhase = 'wind'; m.mob.lungeUntil = time + LG.windupMs; m.setVelocity(0, 0); return; }
      }
    }

    // M5.7 MAG-CRANE PULL — a telegraphed magnetic GRAB: wind up (flash), then
    // DRAG the player inward for pullMs while slowing them. Absolute clocks →
    // unfreeze. (Realm mob only, never in the pillared boss arena.)
    if (def.pull) {
      var PU = def.pull;
      if (m.mob.pullPhase === 'pull') {
        if (time >= m.mob.pullUntil) { m.mob.pullPhase = null; m.mob.nextPullAt = time + PU.cooldownMs; m.clearTint(); }
        else {
          m.setVelocity(0, 0);
          player.setPosition(player.x + (m.x - player.x) * PU.pullK, player.y + (m.y - player.y) * PU.pullK);
          player.state.slowUntil = time + 140; player.state.slowMult = PU.slowMult;
          if (scene.magBeamFx) scene.magBeamFx(m, player);
          return;
        }
      } else if (m.mob.pullPhase === 'wind') {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 90) % 2 === 0 ? (PU.tint || 0xffb347) : 0xffffff);
        if (time >= m.mob.pullUntil) {
          m.clearTint();
          m.mob.pullPhase = 'pull'; m.mob.pullUntil = time + PU.pullMs;
          if (dist < PU.range * 1.3) hurtPlayer(scene, player, Math.max(DATA.combat.minDamage, Math.round(PU.dmg * (m.mob.dmgMult || 1))), time, 'a Mag-Crane');
        }
        return;
      } else {
        if (!m.mob.nextPullAt) m.mob.nextPullAt = time + PU.cooldownMs * (0.4 + SIM.rng() * 0.6);
        if (dist < PU.range && time >= m.mob.nextPullAt) { m.mob.pullPhase = 'wind'; m.mob.pullUntil = time + PU.windupMs; m.setVelocity(0, 0); return; }
      }
    }
    // M5.7 PURGE FLAMER — a repeating CIRCULAR ground telegraph → a ring of fire
    // that blooms where you stood + LINGERS as a burning patch (Red: a circle,
    // not a cone). Roots during the warn. Absolute clocks → unfreeze.
    if (def.flameCircle) {
      var FC = def.flameCircle;
      if (m.mob.flamePhase === 'warn') {
        m.setVelocity(0, 0);
        m.setTint(Math.floor(time / 100) % 2 === 0 ? (FC.tint || 0xff7a2c) : 0xffffff);
        if (time >= m.mob.flameUntil) {
          m.clearTint(); m.mob.flamePhase = null; m.mob.nextFlameAt = time + FC.everyMs;
          if (scene.flameCircleBlast) scene.flameCircleBlast(m, FC);
        }
        return;
      } else {
        if (!m.mob.nextFlameAt) m.mob.nextFlameAt = time + FC.everyMs * (0.4 + SIM.rng() * 0.6);
        if (dist < FC.range && time >= m.mob.nextFlameAt) {
          m.mob.flamePhase = 'warn'; m.mob.flameUntil = time + FC.windupMs;
          m.mob.flameX = player.x; m.mob.flameY = player.y;
          if (scene.flameCircleWarn) scene.flameCircleWarn(m, FC);
          m.setVelocity(0, 0); return;
        }
      }
    }
    // M5.0 BLOOM PIXIE — glow trail (scene owns the patches + corpse revives)
    // + the periodic Bumblebrute summon (queued, capped scene-side).
    if (def.glowTrail && time - (m.mob.lastGlowAt || 0) >= def.glowTrail.everyMs) {
      m.mob.lastGlowAt = time;
      if (scene.dropGlow) scene.dropGlow(m.x, m.y + m.displayHeight * 0.2, def.glowTrail);
    }
    if (def.summon) {
      if (!m.mob.nextSummonAt) m.mob.nextSummonAt = time + def.summon.everyMs * 0.6;
      if (time >= m.mob.nextSummonAt) {
        m.mob.nextSummonAt = time + def.summon.everyMs;
        if (scene.queuePixieSummon) scene.queuePixieSummon(m, def.summon);
      }
    }

    var spd = m.mob.spd;                        // E9: affix-adjusted speed
    // M5.6 CURSED-BELL SURGE — the toll flares every mob's eyes + a speed
    // burst for surgeMs (RealmScene.bellPeal set surgeUntil/surgeMult).
    if (m.mob.surgeUntil) {
      if (time < m.mob.surgeUntil) spd = Math.round(spd * (m.mob.surgeMult || 1));
      else { m.mob.surgeUntil = 0; if (!m.mob.affix && !m.mob.wispFed) m.clearTint(); }
    }
    // M4: FROST SLOW — a frostbolt-hit mob crawls at spd×slowMult until it
    // wears off. A non-champion wears a status tint (burn EMBER wins over
    // frost — fire reads as the bigger threat); champions keep their affix
    // tint. Cleared the frame the status expires.
    var slowed = m.mob.slowUntil && time < m.mob.slowUntil;
    if (slowed) spd = Math.round(spd * (m.mob.slowMult || 1));
    if (!m.mob.affix) {
      if (burning && !m.mob.scorched) { m.setTint(0xff9e59); m.mob.scorched = true; m.mob.frosted = false; }
      else if (!burning && m.mob.scorched) { m.clearTint(); m.mob.scorched = false; }
      if (!burning) {
        if (slowed && !m.mob.frosted) { m.setTint(0x8fd6ff); m.mob.frosted = true; }
        else if (!slowed && m.mob.frosted) { m.clearTint(); m.mob.frosted = false; }
      }
    } else { m.mob.frosted = false; m.mob.scorched = false; }
    if (def.shoot) {
      // shooter verb: hold preferred range, fire patterns (F9)
      var want = def.shoot.range * 0.85;
      var dir = dist > want ? 1 : (dist < want * 0.6 ? -0.7 : 0);
      m.setVelocity(dx / dist * spd * dir, dy / dist * spd * dir);
      if (dist < def.shoot.range && time - m.mob.lastShotAt >= def.shoot.cooldownMs / SIM.projFreq('mob')) {
        m.mob.lastShotAt = time;
        var base = Math.atan2(dy, dx), n = def.shoot.count, half = (n - 1) / 2;
        for (var i = 0; i < n; i++) {
          var a = n === 1 ? base :
            base + Phaser.Math.DegToRad(def.shoot.spreadDeg) * (i - half) / (n - 1);
          // M5.0: per-mob PROJECTILE COLORS (user: seedling turret + snapdragon
          // shoot different colors) — a neutral orb texture + a data tint.
          // M5.4: shot damage scales with the mob's level mult.
          var shotDmg = Math.max(DATA.combat.minDamage, Math.round(def.shoot.dmg * (m.mob.dmgMult || 1)));
          var s = fireProjectile(scene, scene.enemyShots, m.x, m.y, a,
            def.shoot.projSpeed, shotDmg, def.shoot.lifeMs,
            def.shoot.texture || 'bolt', false, 'a ' + def.name);
          if (s && def.shoot.tint) s.setTint(def.shoot.tint);
          // E9 v2 — SPLITTING: this champion's bolts split mid-flight
          // (handled in updateProjectiles when splitAt passes).
          if (s && m.mob.affix && m.mob.affix.splitShots) {
            s.proj.splitAt = time + def.shoot.lifeMs / 2;
            s.proj.split = { shots: m.mob.affix.splitShots,
                             angleDeg: m.mob.affix.splitAngleDeg,
                             speed: def.shoot.projSpeed, src: 'a ' + def.name };
          }
        }
      }
    } else if (def.wail) {
      // M5.6 BANSHEE — floats, holds mid-range, then WAILS a TELEGRAPHED cone
      // (balance round 2026-07-15, Red: the old wail was an unavoidable
      // auto-hit). The cast: she roots + a visible cone LOCKS to your position
      // at cast start; after windupMs it resolves and only hits if you're
      // STILL inside the cone (angle within halfDeg AND inside range). Step
      // out of the light. EATS soul wisps (scene buffs her → dmgMult).
      var WL = def.wail;
      if (m.mob.wailUntil) {                     // mid-cast: rooted
        m.setVelocity(0, 0);
        if (time >= m.mob.wailUntil) {
          m.mob.wailUntil = 0;
          var dAng = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - m.mob.wailDir));
          if (dist < WL.range && dAng <= Phaser.Math.DegToRad(WL.halfDeg)) {
            var wdmg = Math.max(DATA.combat.minDamage, Math.round(WL.dmg * (m.mob.dmgMult || 1)));
            hurtPlayer(scene, player, wdmg, time, 'a Banshee');
            player.state.slowUntil = time + WL.slowMs; player.state.slowMult = WL.slowMult;
          }
          if (scene.bansheeWailFx) scene.bansheeWailFx(m, player);
        }
      } else {
        var wwant = WL.range * 0.6;
        var wdir = dist > wwant ? 1 : (dist < wwant * 0.55 ? -0.7 : 0);
        m.setVelocity(dx / dist * spd * wdir, dy / dist * spd * wdir);
        if (dist < WL.range * 0.9 && time - (m.mob.lastWailAt || 0) >= WL.everyMs) {
          m.mob.lastWailAt = time;
          m.mob.wailUntil = time + WL.windupMs;
          m.mob.wailDir = Math.atan2(dy, dx);    // LOCKED here — dodge out
          if (scene.bansheeWailCastFx) scene.bansheeWailCastFx(m, m.mob.wailDir, WL);
        }
      }
    } else {
      // chaser verb: pursue (F9)
      m.setVelocity(dx / dist * spd, dy / dist * spd);
    }
    // M5.6 TOMB GOLEM REGEN — heals unless hit within idleMs (moss-golem
    // inversion). maxHp captured lazily; heals in ~0.5s chunks (no delta here).
    if (def.regen) {
      if (!m.mob.maxHp) m.mob.maxHp = m.mob.hp;
      if (time - (m.mob.lastHitAt || 0) >= def.regen.idleMs && m.mob.hp < m.mob.maxHp && time >= (m.mob.nextRegenAt || 0)) {
        m.mob.nextRegenAt = time + 500;
        m.mob.hp = Math.min(m.mob.maxHp, m.mob.hp + def.regen.perSec * 0.5);
        if (scene.regenTickFx) scene.regenTickFx(m);
      }
    }
    // M5.6 MUMMY — contact applies a CURSE DoT to the player (burn tech
    // re-aimed; RealmScene.updateGraveyard ticks it).
    if (def.contactCurse && dist < 26) {
      var ps = player.state;
      ps.curseUntil = time + def.contactCurse.durMs;
      ps.curseDmg = def.contactCurse.dmg; ps.curseTickMs = def.contactCurse.tickMs;
    }
    // M5.6 NECRO ACOLYTE — periodically raises field corpses as Rattlebones
    // (scene owns the queueSpawn + the alive cap). Priority-kill target.
    if (def.raise) {
      if (!m.mob.nextRaiseAt) m.mob.nextRaiseAt = time + def.raise.everyMs * 0.5;
      if (time >= m.mob.nextRaiseAt) {
        m.mob.nextRaiseAt = time + def.raise.everyMs;
        if (scene.raiseCorpses) scene.raiseCorpses(m, def.raise);
      }
    }
    // M4.9 CONDUCTOR ZOMBIE / M5.7 FORGE HOUND — drip a patch on a cadence as it
    // shambles (RealmScene owns the hazard pool + the player-damage tick). The
    // Forge Hound sets fire:true so the patch recolors + reads as a burn trail.
    if (def.slimeTrail && time - (m.mob.lastSlimeAt || 0) >= def.slimeTrail.everyMs) {
      m.mob.lastSlimeAt = time;
      if (scene.dropSlime) scene.dropSlime(m.x, m.y + m.displayHeight * 0.22, def.slimeTrail);
    }
    // M5.7 COOLANT TANK — vents a chilling SLOW FIELD patch on a cadence (scene
    // owns the pool; the player is slowed while standing in it, no damage).
    if (def.slowField && time - (m.mob.lastSlowFieldAt || 0) >= def.slowField.everyMs) {
      m.mob.lastSlowFieldAt = time;
      if (scene.dropCoolant) scene.dropCoolant(m.x, m.y + m.displayHeight * 0.22, def.slowField);
    }
    // M5.7 BULWARK — projects a WARD onto nearby mobs (they can't be hurt while
    // it lives and they're inside the aura). Scene refreshes a short guard-shield
    // stamp each frame; hurtMob honors it (auto-expires when it leaves / dies).
    if (def.guardAura && scene.updateGuardAura) scene.updateGuardAura(m, def.guardAura, time);
    // M5.7 REPAIR UNIT — mends nearby wounded mobs on a cadence (scene iterates
    // the swarm + heals). Absolute clock → unfreeze. Priority-kill target.
    if (def.mend) {
      if (!m.mob.nextMendAt) m.mob.nextMendAt = time + def.mend.everyMs * 0.5;
      if (time >= m.mob.nextMendAt) { m.mob.nextMendAt = time + def.mend.everyMs; if (scene.mendNearby) scene.mendNearby(m, def.mend); }
    }
    m.setFlipX(dx < 0);
    if (m.nameTag) m.nameTag.setPosition(m.x, m.y - m.displayHeight / 2 - 9);
  }

  // M4.6: opts.dot marks a damage-over-time tick (fire volley burn) — the
  // same hit still cooking, so it neither knocks back nor rolls EVOLVING.
  function hurtMob(scene, m, dmg, time, opts) {
    // M5.0 BUMBLEBRUTE WARDS (user: "immortal mob tell u kill the mini
    // brumble brute mobs around him") — while any of his summoned minis live,
    // EVERY damage path through here bounces (shots, burns, blasts, whirls).
    // Environmental mows (train / timber) go through killMobCredited and
    // still flatten him — a falling tree does not care about bees.
    if (m.mob.ward > 0) {
      if (scene.events) scene.events.emit('mob-immune', m);
      return;
    }
    // M5.7 BULWARK guard-shield — a short stamp refreshed each frame while a
    // Bulwark's aura covers this mob. Auto-expires ~0.3s after it leaves the
    // aura or the Bulwark dies (no explicit cleanup). Env kills bypass hurtMob.
    if (m.mob.guardShieldUntil && time < m.mob.guardShieldUntil) {
      if (scene.events) scene.events.emit('mob-immune', m);
      return;
    }
    m.mob.lastHitAt = time;                     // M5.6: Tomb Golem regen resets on any hit
    m.mob.hp -= dmg;
    // E9 v2 — EVOLVING: surviving a hit can trigger the one-time evolution
    // (fresh bigger HP pool, faster, worth more XP). SIM.rng — seam rule 4.
    var af = m.mob.affix;
    if (!(opts && opts.dot) && m.mob.hp > 0 && af && af.evolveChance && !m.mob.evolved &&
        SIM.rng() < af.evolveChance) {
      var ev = af.evolve, def = m.mob.def;
      m.mob.evolved = true;
      m.mob.hp  = Math.round(def.hp  * ev.hpMult);       // a NEW, bigger health pool
      m.mob.spd = Math.round(m.mob.spd * ev.spdMult);
      m.mob.xp  = Math.round(m.mob.xp  * ev.xpMult);
      m.setScale(m.scaleX * ev.scaleMult);
      scene.events.emit('mob-evolved', m);
    }
    m.setTintFill(0xffffff);
    scene.time.delayedCall(50, function () {
      if (!m.active) return;
      m.clearTint();
      if (m.mob.affix) m.setTint(m.mob.affix.tint);   // E9: champions keep their tint
      else if (m.mob.slowUntil && scene.time.now < m.mob.slowUntil) {
        m.setTint(0x8fd6ff); m.mob.frosted = true;    // M4: keep the frost tint under a hit flash
      }
    });
    // knockback (skipped for DoT ticks — a burn doesn't push)
    if (!(opts && opts.dot)) {
      var p = scene.player;
      var dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy) || 1;
      m.x += dx / d * (DATA.combat.knockback / 10); m.y += dy / d * (DATA.combat.knockback / 10);
    }
    scene.events.emit('mob-hurt', m, dmg);
    if (m.mob.hp <= 0) {
      scene.events.emit('mob-died', m);
      clearNameTag(m);
      m.body.enable = false;
      scene.mobs.killAndHide(m);
    }
  }

  // ----------------------------------------------------------------- BOSS --
  // M2 (F8): one boss per realm, data-driven from DATA.bosses. Not pooled —
  // there is exactly one, as a plain physics sprite with plain-data state.
  function spawnBoss(scene, key, x, y, time) {
    var def = DATA.bosses[key];
    // M4.7: per-boss hi-fi model (grovekeeper 96 / conductor 128).
    var bm = (typeof TEX !== 'undefined' && TEX.bossModel) ? TEX.bossModel(key) : null;
    var btex = (bm && scene.textures.exists(bm.key)) ? bm.key : def.texture;
    var b = scene.physics.add.sprite(x, y, btex);
    b.setScale(bm ? bm.scale : 3).setDepth(6);
    if (bm) b.body.setSize(bm.body.w, bm.body.h).setOffset(bm.body.ox, bm.body.oy);
    else b.body.setSize(14, 12).setOffset(3, 5);
    b.id = nextId++;
    // 2026-07-18 (Red): boss HP scales with campaign depth (regions cleared).
    // depth 0 → ×1.0 → def.hp exactly. Boss DAMAGE scales in hurtPlayer.
    var _bhp = Math.max(1, Math.round(def.hp * SIM.depthMult(scene.progressDepth || 0).bossHp));
    b.boss = { key: key, def: def, hp: _bhp, maxHp: _bhp,
               nextRadialAt: time + 1600,               // grace period before the first pattern
               nextStreamAt: time + 3000,
               streamLeft: 0, nextStreamShotAt: 0, lastContactAt: 0,
               burnUntil: 0, nextBurnAt: 0, burnTick: 0, burnEvery: 0 }; // M4.6: fire volley burn
    return b;
  }

  function updateBoss(scene, b, player, time) {
    var def = b.boss.def, P = def.patterns;
    // M5.0 PHASE TWO: while the pixies channel his revival he lies still —
    // no chase, no patterns, no burn ticks (the scene owns the moment).
    if (b.boss.resurrecting) { b.setVelocity(0, 0); return; }
    // M4.6 FIRE BURN — the boss cooks too (this is where a DoT earns its keep)
    if (b.boss.burnUntil && time < b.boss.burnUntil && time >= b.boss.nextBurnAt) {
      b.boss.nextBurnAt += b.boss.burnEvery;
      hurtBoss(scene, b, b.boss.burnTick);
      if (!b.active || b.boss.hp <= 0) return;
    }
    // M5.0: phase-two enrage — he rises FASTER (spdMult set at revive)
    var spd = def.spd * (b.boss.spdMult || 1);
    var rate = b.boss.rateMult || 1;             // < 1 = patterns come sooner
    var dx = player.x - b.x, dy = player.y - b.y, dist = Math.hypot(dx, dy) || 1;
    b.setVelocity(dx / dist * spd, dy / dist * spd);   // slow relentless chase
    b.setFlipX(dx < 0);

    // M4.7: THE CONDUCTOR — his patterns are TRAIN VERBS owned by the scene
    // (ghost tracks/trains, tie lobs, the schedule, the lantern sweep need the
    // yard). Dispatch and return; the shared burn/chase above still applied.
    if (P.ghostTrain) {
      if (scene.conductorUpdate) scene.conductorUpdate(b, player, time);
      return;
    }
    // M5.0: THE GROVEKEEPER — grove verbs (timber/mortar/overgrowth/sunlance/
    // sporeSurge) are scene-owned too, but he KEEPS his radial/stream filler
    // (reflavored PETAL BURST / NEEDLE VOLLEY) — dispatch, don't return.
    if (P.timber && scene.grovekeeperUpdate) scene.grovekeeperUpdate(b, player, time);

    // M5.6: THE GRAVEKEEPER — the wave-immunity loop + telegraphed Necronomicon
    // verbs (explode corpse / grasping hands / curse sigils) + Reaper's March
    // are scene-owned; he KEEPS his radial/stream (BONE STORM / SOUL VOLLEY),
    // so dispatch WITHOUT return and let the generic driver below fire them.
    if (def.waves && scene.gravekeeperUpdate) scene.gravekeeperUpdate(b, player, time);

    // M5.7: THE GRAND ENGINEER — floor-lift entrance, room verbs, the
    // Engineer→130C-4 transition, and the mech's telegraphed-zone kit (M6e).
    // He carries NO radial/stream filler anymore (Red: every boss does the
    // burst + the projectile ring); the P.radial/P.stream guards skip them.
    if (def.floorLift && scene.engineerUpdate) scene.engineerUpdate(b, player, time);

    // M7 REGISTRY: a MAP-OWNED boss (DATA.bosses[key].mapOwned, installed by a
    // registered map folder) — the map's scene.bossUpdate drives the kit.
    // Same no-return pattern as the grovekeeper: the generic radial/stream
    // below only fire if the def carries them (the m6e guards).
    if (def.mapOwned && typeof MAPS !== 'undefined' && MAPS.defs) {
      var MD = MAPS.defs[scene.realmId];
      if (MD && MD.scene && MD.scene.bossUpdate) MD.scene.bossUpdate(scene, b, player, time);
      if (!b.active || b.boss.hp <= 0) return;   // the verb may have ended the fight
    }

    // pattern 1: radial burst — the whole ring, dodge through the gaps
    // (M4.6: boss bolts carry fromBoss — hurtPlayer scales them per class)
    // (M6e: guarded — a boss may define no radial/stream at all)
    if (P.radial && time >= b.boss.nextRadialAt) {
      b.boss.nextRadialAt = time + P.radial.everyMs * rate / SIM.projFreq('boss');
      for (var i = 0; i < P.radial.count; i++) {
        var a = Math.PI * 2 * i / P.radial.count;
        var rs = fireProjectile(scene, scene.enemyShots, b.x, b.y, a,
          P.radial.projSpeed, P.radial.dmg, P.radial.lifeMs,
          P.radial.texture || 'bolt', false, def.name);
        if (rs) { rs.proj.fromBoss = true; if (P.radial.tint) rs.setTint(P.radial.tint); }
      }
      scene.events.emit('boss-pattern');
    }
    // pattern 2: aimed stream — rapid shots that track your position per shot
    if (P.stream && b.boss.streamLeft === 0 && time >= b.boss.nextStreamAt) {
      b.boss.nextStreamAt = time + P.stream.everyMs * rate / SIM.projFreq('boss');
      b.boss.streamLeft = P.stream.shots;
      b.boss.nextStreamShotAt = time;
    }
    if (P.stream && b.boss.streamLeft > 0 && time >= b.boss.nextStreamShotAt) {
      b.boss.streamLeft--;
      b.boss.nextStreamShotAt = time + P.stream.gapMs;
      var aim = Math.atan2(player.y - b.y, player.x - b.x);
      var ss = fireProjectile(scene, scene.enemyShots, b.x, b.y, aim,
        P.stream.projSpeed, P.stream.dmg, P.stream.lifeMs,
        P.stream.texture || 'bolt', false, def.name);
      if (ss) { ss.proj.fromBoss = true; if (P.stream.tint) ss.setTint(P.stream.tint); }
    }
  }

  function hurtBoss(scene, b, dmg) {
    if (!b.active || b.boss.hp <= 0 || b.boss.resurrecting) return;   // M5.0: untouchable mid-revival
    // M5.6: THE GRAVEKEEPER is IMMUNE while a minion wave still walks — clear
    // the wave to unlock the chunk (the scene strips it directly).
    if (b.boss.immune) { if (scene.bossImmunePopup) scene.bossImmunePopup(b); return; }
    // M6e: the VENTED mech (post reactor-purge) takes bonus damage — the
    // survive-the-purge → punish-the-core reward loop.
    if (b.boss.ventedUntil && scene.time.now < b.boss.ventedUntil)
      dmg = Math.round(dmg * (b.boss.ventDmgMult || 1.5));
    b.boss.hp -= dmg;
    b.setTintFill(0xffffff);
    scene.time.delayedCall(50, function () { if (b.active) b.clearTint(); });
    scene.events.emit('boss-hurt', b, dmg);
    if (b.boss.hp <= 0) scene.events.emit('boss-died', b);
  }

  // ---------------------------------------------------------- PROJECTILES --
  function fireProjectile(scene, group, x, y, angle, speed, dmg, lifeMs, texture, pierce, src) {
    var s = group.get(x, y, texture);
    if (!s) return null;
    s.setActive(true).setVisible(true).setTexture(texture).setScale(2).setDepth(8);
    s.clearTint();          // M5.0: pooled shots carry stale tints (volley ember,
                            // colored plant bolts) — every fire starts neutral
    s.body.enable = true;
    s.body.setSize(5, 5).setOffset(texture === 'arrow' ? 3 : 0.5, 0.5);
    s.setRotation(angle);
    s.proj = { dmg: dmg, pierce: !!pierce, dieAt: scene.time.now + lifeMs, hits: {}, src: src || null };
    scene.physics.velocityFromRotation(angle, speed, s.body.velocity);
    return s;
  }

  function killProjectile(group, s) { s.body.enable = false; group.killAndHide(s); }

  function updateProjectiles(scene, group, time) {
    var splitters = null;
    // M5.1 HOMING MISSILES (wizard epic+ barrage): steer marked shots toward
    // the nearest live enemy. dt derived from the group's own clock (the
    // signature has no delta); clamped so slow headless frames don't whip.
    var dtMs = Math.min(120, Math.max(0, time - (group._lastHomingAt || time)));
    group._lastHomingAt = time;
    group.children.iterate(function (s) {
      if (!s || !s.active) return;
      if (time >= s.proj.dieAt) { killProjectile(group, s); return; }
      if (s.proj.homing && dtMs > 0 && scene.mobs) {
        var tx = null, ty = null, best = 480 * 480;        // seek range
        scene.mobs.children.iterate(function (m) {
          if (!m || !m.active) return;
          var d2 = (m.x - s.x) * (m.x - s.x) + (m.y - s.y) * (m.y - s.y);
          if (d2 < best) { best = d2; tx = m.x; ty = m.y; }
        });
        if (scene.boss && scene.boss.active) {
          var bd2 = (scene.boss.x - s.x) * (scene.boss.x - s.x) + (scene.boss.y - s.y) * (scene.boss.y - s.y);
          if (bd2 < best) { best = bd2; tx = scene.boss.x; ty = scene.boss.y; }
        }
        if (tx !== null) {
          var want = Math.atan2(ty - s.y, tx - s.x);
          var cur = Math.atan2(s.body.velocity.y, s.body.velocity.x);
          var diff = Phaser.Math.Angle.Wrap(want - cur);
          var maxTurn = s.proj.homing.turn * dtMs / 1000;
          var ang = cur + Phaser.Math.Clamp(diff, -maxTurn, maxTurn);
          var spd = Math.hypot(s.body.velocity.x, s.body.velocity.y);
          scene.physics.velocityFromRotation(ang, spd, s.body.velocity);
          s.setRotation(ang);
        }
      }
      // E9 v2 — SPLITTING: the bolt forks mid-flight into a fan of children
      // (which never split again). Collected first, spawned after the iterate —
      // group.get() inside iterate can revisit recycled children.
      if (s.proj.splitAt && time >= s.proj.splitAt) (splitters = splitters || []).push(s);
    });
    if (splitters) splitters.forEach(function (s) {
      var sp = s.proj.split, life = Math.max(120, s.proj.dieAt - time);
      var a0 = s.rotation, spread = Phaser.Math.DegToRad(sp.angleDeg);
      var x = s.x, y = s.y, half = (sp.shots - 1) / 2;
      killProjectile(group, s);
      for (var i = 0; i < sp.shots; i++) {
        var a = a0 + (sp.shots === 1 ? 0 : spread * (i - half) / half);
        fireProjectile(scene, group, x, y, a, sp.speed, s.proj.dmg, life, 'bolt', false, sp.src);
      }
    });
  }

  return {
    createPlayer: createPlayer, updatePlayer: updatePlayer, applyModelSkin: applyModelSkin,
    hurtPlayer: hurtPlayer,
    grantXp: grantXp, spawnMob: spawnMob, updateMob: updateMob, hurtMob: hurtMob,
    clearNameTag: clearNameTag, applySlow: applySlow, applyBurn: applyBurn,
    spawnBoss: spawnBoss, updateBoss: updateBoss, hurtBoss: hurtBoss,
    fireProjectile: fireProjectile, killProjectile: killProjectile,
    updateProjectiles: updateProjectiles
  };
})();
