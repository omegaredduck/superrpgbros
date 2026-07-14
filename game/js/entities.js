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
      lastBarrageAt: 0                            // M4: Wizard machine-gun cadence
    };
    // E8 (M2.1): the held weapon sprite — presentation only (seam rule 3);
    // aligned to the aim direction every frame in updatePlayer.
    var weapon = DATA.weapons[cls.weapon];
    if (weapon.heldTexture) {
      p.held = scene.add.sprite(x, y, weapon.heldTexture).setScale(2).setDepth(11);
    }
    // ART-FIDELITY TEST (2026-07-13): apply the selected Ranger art model. With
    // the default '16' (or any non-Ranger class) this is a no-op re-skin that
    // leaves the classic static look/body EXACTLY as above.
    applyModelSkin(scene, p);
    return p;
  }

  // ART-FIDELITY TEST: (re)skin a player sprite to the currently-selected
  // Ranger art model. Non-Ranger classes, and the Ranger with the default
  // '16' model, reproduce the classic look precisely (static texture, scale 2,
  // 10x12 body). Only Ranger + a hi-fi model (32/64/128/160) diverges, gaining
  // the higher-res spritesheet, idle/walk animation, and a matching bow. Safe
  // to call on a live sprite (used by the Settings selector for instant preview)
  // or right after createPlayer. Footprint stays 32px so the hitbox is unchanged.
  function applyModelSkin(scene, p) {
    if (!p || !p.state) return;
    var st = p.state, cls = DATA.classes[st.cls];
    var isRanger = (st.cls === 'ranger') || (cls && cls.texture === 'ranger');
    var d = (isRanger && typeof TEX !== 'undefined' && TEX.modelFor)
      ? TEX.modelFor(TEX.selectedModelId()) : null;
    if (d && scene.textures.exists(d.key)) {
      p._rangerModel = d;
      p.setTexture(d.key, 'idle0').setScale(d.scale);
      p.body.setSize(d.body.w, d.body.h).setOffset(d.body.ox, d.body.oy);
      try { p.play(d.idle, true); } catch (e) {}
      // the LEAD ARM is its own sprite that rotates to the aim (updatePlayer);
      // depth sits between the body (10) and the bow (11). Created lazily.
      if (scene.textures.exists(d.armKey)) {
        if (!p.arm) p.arm = scene.add.sprite(p.x, p.y, d.armKey).setDepth(10.5);
        p.arm.setTexture(d.armKey).setScale(d.scale).setOrigin(d.armPivotX, 0.5).setVisible(true);
      }
      if (p.held && scene.textures.exists(d.bowKey)) {
        // bow pivots at its GRIP and stays UPRIGHT (updatePlayer flips it by
        // facing but never rotates it to the aim — a real archer's hold).
        p.held.setTexture(d.bowKey).setScale(d.scale).setOrigin(d.bowGrip.x, d.bowGrip.y).setDepth(11);
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
    if (!st.alive) { p.setVelocity(0, 0); if (p.held) p.held.setVisible(false); if (p.arm) p.arm.setVisible(false); return; }

    // movement (diagonal normalized — TM-1)
    var vx = intent.moveX, vy = intent.moveY;
    var len = Math.hypot(vx, vy) || 1;
    p.setVelocity(vx / len * st.stats.spd, vy / len * st.stats.spd);

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
        p.held.setVisible(true)
          .setPosition(p.x + side * weap.holdOffset * 0.6, p.y + 3)
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

    // firing (M3: the equipped weapon item adds flat damage — SIM.weaponMod)
    // M4: the projectile texture + pierce come from the weapon (bow arrow vs
    // frost bolt); a frost weapon also carries a SLOW rider that the realm's
    // shot→mob overlap applies via Entities.applySlow.
    var weapon = DATA.weapons[DATA.classes[st.cls].weapon];
    var wDmg = weapon.dmg + SIM.weaponMod(st.equipment).dmg;
    var interval = 1000 / SIM.fireRate(weapon, st.stats.dex);
    if (intent.firing && time - st.lastShotAt >= interval) {
      st.lastShotAt = time;
      // M4: a MELEE weapon (the Knight's sword) swings an ARC instead of firing
      // a projectile — RealmScene.meleeSwing owns the hit test + crescent VFX
      // (it needs the mobs + boss). Projectile weapons (bow/frost) fire as before.
      if (weapon.melee) {
        if (scene.meleeSwing) scene.meleeSwing(p, intent, st, weapon, wDmg);
        st.swingAt = time;                                       // M4: start the sword-swing animation
        st.swingArc = Phaser.Math.DegToRad(weapon.arcDeg || 100) * 0.6;
      } else {
        var shot = fireProjectile(scene, scene.playerShots, p.x, p.y, intent.aimAngle,
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
    } else {
      var abFx = SIM.abilityFor(ab, st.equipment);
      if (intent.ability && st.mp >= abFx.mpCost && time - st.lastAbilityAt >= ab.cooldownMs) {
        var half = (abFx.count - 1) / 2;
        for (var i = 0; i < abFx.count; i++) {
          var a = intent.aimAngle + Phaser.Math.DegToRad(ab.spreadDeg) * ((i - half) / half || 0) / 2;
          fireProjectile(scene, scene.playerShots, p.x, p.y, a, ab.projSpeed,
            SIM.damage(wDmg * ab.dmgMult, st.stats.att, 0), ab.lifeMs, 'arrow', ab.pierce);
        }
        st.lastAbilityAt = time; st.mp -= abFx.mpCost; scene.events.emit('player-ability', ab);
      }
    }

    // i-frame blink
    var a = time - st.lastHitAt < DATA.combat.iframesMs ? (Math.floor(time / 60) % 2 ? 0.4 : 1) : 1;
    p.setAlpha(a);
    if (p.held) p.held.setAlpha(a);
    if (p.arm) p.arm.setAlpha(a);
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
      st.mp = Math.max(0, st.mp - ab.mpDrainPerSec * dt / 1000);
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
    if (st.mp < ab.mpPerShot) return;
    if (time - (st.lastBarrageAt || 0) < ab.fireEveryMs) return;
    st.lastBarrageAt = time;
    st.mp -= ab.mpPerShot;
    var shot = fireProjectile(scene, scene.playerShots, p.x, p.y, intent.aimAngle, ab.projSpeed,
      SIM.damage(ab.dmg, st.stats.att, 0), ab.lifeMs, ab.texture || 'bolt', false);
    if (shot) {
      if (ab.strike) shot.proj.strike = ab.strike;         // lightning-bolt proc rider
      shot.body.setSize(8, 8).setOffset(1, 1);             // the BIG ball hits like it looks
    }
    scene.events.emit('player-ability', ab);
  }

  function hurtPlayer(scene, p, dmg, time, sourceName) {
    var st = p.state;
    if (!st.alive || time - st.lastHitAt < DATA.combat.iframesMs) return;
    st.lastHitAt = time;
    var real = Math.max(DATA.combat.minDamage, dmg - Math.floor(st.stats.def));
    st.hp -= real;
    scene.events.emit('player-hurt', real);
    if (st.hp <= 0) { st.hp = 0; st.alive = false; scene.events.emit('player-died', sourceName); }
  }

  function grantXp(scene, p, amount) {
    var st = p.state;
    var r = SIM.applyXp(st.level, st.xp, amount);
    st.xp = r.xp;
    if (r.ups > 0) {
      st.level = r.level;
      st.stats = SIM.statsFor(DATA.classes[st.cls], st.level,
                              CURRENT && CURRENT.potionsDrunk, st.equipment);
      st.hp = st.stats.hp; st.mp = st.stats.mp;          // level-up full heal (RotMG-ish kindness)
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
    m.mob = { key: key, def: def, hp: def.hp, xp: def.xp, spd: def.spd,
              affix: null, evolved: false, lastShotAt: 0, lastContactAt: 0,
              slowUntil: 0, slowMult: 1, frosted: false };   // M4: frost slow (pooled — reset)
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
        m.mob.hp  = Math.round(def.hp  * (af.hpMult  || 1));
        m.mob.xp  = Math.round(def.xp  * (af.xpMult  || 1));
        m.mob.spd = Math.round(def.spd * (af.spdMult || 1));
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
  // (hurtMob death, swarm wipes, pooled-sprite reuse in spawnMob).
  function clearNameTag(m) {
    if (m.nameTag) { m.nameTag.destroy(); m.nameTag = null; }
  }

  // M4 (WIZARD): apply a FROST SLOW to a mob — spd × slow.mult for slow.ms.
  // Called from the realm's shot→mob overlap when a frost bolt lands. Refreshes
  // the timer on re-hit; updateMob reads slowUntil/slowMult + paints the tint.
  function applySlow(m, slow, time) {
    if (!m || !m.mob || !slow) return;
    m.mob.slowUntil = time + slow.ms;
    m.mob.slowMult = slow.mult;
  }

  function updateMob(scene, m, player, time) {
    var def = m.mob.def;
    var dx = player.x - m.x, dy = player.y - m.y;
    var dist = Math.hypot(dx, dy) || 1;

    var spd = m.mob.spd;                        // E9: affix-adjusted speed
    // M4: FROST SLOW — a frostbolt-hit mob crawls at spd×slowMult until it
    // wears off. A non-champion wears a frost tint while slowed (champions keep
    // their affix tint); cleared here the frame the slow expires.
    var slowed = m.mob.slowUntil && time < m.mob.slowUntil;
    if (slowed) spd = Math.round(spd * (m.mob.slowMult || 1));
    if (!m.mob.affix) {
      if (slowed && !m.mob.frosted) { m.setTint(0x8fd6ff); m.mob.frosted = true; }
      else if (!slowed && m.mob.frosted) { m.clearTint(); m.mob.frosted = false; }
    } else { m.mob.frosted = false; }
    if (def.shoot) {
      // shooter verb: hold preferred range, fire patterns (F9)
      var want = def.shoot.range * 0.85;
      var dir = dist > want ? 1 : (dist < want * 0.6 ? -0.7 : 0);
      m.setVelocity(dx / dist * spd * dir, dy / dist * spd * dir);
      if (dist < def.shoot.range && time - m.mob.lastShotAt >= def.shoot.cooldownMs) {
        m.mob.lastShotAt = time;
        var base = Math.atan2(dy, dx), n = def.shoot.count, half = (n - 1) / 2;
        for (var i = 0; i < n; i++) {
          var a = n === 1 ? base :
            base + Phaser.Math.DegToRad(def.shoot.spreadDeg) * (i - half) / (n - 1);
          var s = fireProjectile(scene, scene.enemyShots, m.x, m.y, a,
            def.shoot.projSpeed, def.shoot.dmg, def.shoot.lifeMs, 'bolt', false, 'a ' + def.name);
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
    } else {
      // chaser verb: pursue (F9)
      m.setVelocity(dx / dist * spd, dy / dist * spd);
    }
    m.setFlipX(dx < 0);
    if (m.nameTag) m.nameTag.setPosition(m.x, m.y - m.displayHeight / 2 - 9);
  }

  function hurtMob(scene, m, dmg, time) {
    m.mob.hp -= dmg;
    // E9 v2 — EVOLVING: surviving a hit can trigger the one-time evolution
    // (fresh bigger HP pool, faster, worth more XP). SIM.rng — seam rule 4.
    var af = m.mob.affix;
    if (m.mob.hp > 0 && af && af.evolveChance && !m.mob.evolved &&
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
    // knockback
    var p = scene.player;
    var dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy) || 1;
    m.x += dx / d * (DATA.combat.knockback / 10); m.y += dy / d * (DATA.combat.knockback / 10);
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
    // ART TEST (hi-fi world): the Grovekeeper gets its hi-fi model when on.
    var bm = (typeof TEX !== 'undefined' && TEX.bossModel) ? TEX.bossModel() : null;
    var btex = (bm && scene.textures.exists(bm.key)) ? bm.key : def.texture;
    var b = scene.physics.add.sprite(x, y, btex);
    b.setScale(bm ? bm.scale : 3).setDepth(6);
    if (bm) b.body.setSize(bm.body.w, bm.body.h).setOffset(bm.body.ox, bm.body.oy);
    else b.body.setSize(14, 12).setOffset(3, 5);
    b.id = nextId++;
    b.boss = { key: key, def: def, hp: def.hp, maxHp: def.hp,
               nextRadialAt: time + 1600,               // grace period before the first pattern
               nextStreamAt: time + 3000,
               streamLeft: 0, nextStreamShotAt: 0, lastContactAt: 0 };
    return b;
  }

  function updateBoss(scene, b, player, time) {
    var def = b.boss.def, P = def.patterns;
    var dx = player.x - b.x, dy = player.y - b.y, dist = Math.hypot(dx, dy) || 1;
    b.setVelocity(dx / dist * def.spd, dy / dist * def.spd);   // slow relentless chase
    b.setFlipX(dx < 0);

    // pattern 1: radial burst — the whole ring, dodge through the gaps
    if (time >= b.boss.nextRadialAt) {
      b.boss.nextRadialAt = time + P.radial.everyMs;
      for (var i = 0; i < P.radial.count; i++) {
        var a = Math.PI * 2 * i / P.radial.count;
        fireProjectile(scene, scene.enemyShots, b.x, b.y, a,
          P.radial.projSpeed, P.radial.dmg, P.radial.lifeMs, 'bolt', false, def.name);
      }
      scene.events.emit('boss-pattern');
    }
    // pattern 2: aimed stream — rapid shots that track your position per shot
    if (b.boss.streamLeft === 0 && time >= b.boss.nextStreamAt) {
      b.boss.nextStreamAt = time + P.stream.everyMs;
      b.boss.streamLeft = P.stream.shots;
      b.boss.nextStreamShotAt = time;
    }
    if (b.boss.streamLeft > 0 && time >= b.boss.nextStreamShotAt) {
      b.boss.streamLeft--;
      b.boss.nextStreamShotAt = time + P.stream.gapMs;
      var aim = Math.atan2(player.y - b.y, player.x - b.x);
      fireProjectile(scene, scene.enemyShots, b.x, b.y, aim,
        P.stream.projSpeed, P.stream.dmg, P.stream.lifeMs, 'bolt', false, def.name);
    }
  }

  function hurtBoss(scene, b, dmg) {
    if (!b.active || b.boss.hp <= 0) return;
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
    group.children.iterate(function (s) {
      if (!s || !s.active) return;
      if (time >= s.proj.dieAt) { killProjectile(group, s); return; }
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
    clearNameTag: clearNameTag, applySlow: applySlow,
    spawnBoss: spawnBoss, updateBoss: updateBoss, hurtBoss: hurtBoss,
    fireProjectile: fireProjectile, killProjectile: killProjectile,
    updateProjectiles: updateProjectiles
  };
})();
