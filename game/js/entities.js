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
    var p = scene.physics.add.sprite(x, y, cls.weapon === 'bow' ? 'ranger' : 'ranger');
    p.setScale(2).setDepth(10);
    p.body.setSize(10, 12).setOffset(3, 3);
    p.id = nextId++;
    p.state = {                                  // plain-data state (seam rule 1)
      cls: character.cls, level: character.level, xp: character.xp,
      equipment: character.equipment,            // M3: same ref as the save — one truth
      stats: stats, hp: stats.hp, mp: stats.mp,
      lastHitAt: -9999, lastShotAt: 0, lastAbilityAt: 0, alive: true, kills: 0
    };
    // E8 (M2.1): the held weapon sprite — presentation only (seam rule 3);
    // aligned to the aim direction every frame in updatePlayer.
    var weapon = DATA.weapons[cls.weapon];
    if (weapon.heldTexture) {
      p.held = scene.add.sprite(x, y, weapon.heldTexture).setScale(2).setDepth(11);
    }
    return p;
  }

  function updatePlayer(scene, p, intent, time, dt) {
    var st = p.state;
    if (!st.alive) { p.setVelocity(0, 0); if (p.held) p.held.setVisible(false); return; }

    // movement (diagonal normalized — TM-1)
    var vx = intent.moveX, vy = intent.moveY;
    var len = Math.hypot(vx, vy) || 1;
    p.setVelocity(vx / len * st.stats.spd, vy / len * st.stats.spd);

    // E8 (M2.1, TM-1): the body faces where you AIM, not where you walk (F2),
    // and the bow dynamically aligns to the exact aim angle.
    p.setFlipX(Math.cos(intent.aimAngle) < 0);
    if (p.held) {
      var weap = DATA.weapons[DATA.classes[st.cls].weapon];
      p.held.setVisible(true)
        .setPosition(p.x + Math.cos(intent.aimAngle) * weap.holdOffset,
                     p.y + Math.sin(intent.aimAngle) * weap.holdOffset)
        .setRotation(intent.aimAngle);   // rotation alone fully orients the bow
    }

    // MP regen
    st.mp = Math.min(st.stats.mp, st.mp + DATA.classes[st.cls].mpRegenPerSec * dt / 1000);

    // firing (M3: the equipped weapon item adds flat damage — SIM.weaponMod)
    var weapon = DATA.weapons[DATA.classes[st.cls].weapon];
    var wDmg = weapon.dmg + SIM.weaponMod(st.equipment).dmg;
    var interval = 1000 / SIM.fireRate(weapon, st.stats.dex);
    if (intent.firing && time - st.lastShotAt >= interval) {
      st.lastShotAt = time;
      fireProjectile(scene, scene.playerShots, p.x, p.y, intent.aimAngle,
        weapon.projSpeed, SIM.damage(wDmg, st.stats.att, 0), weapon.lifeMs, 'arrow', false);
      scene.events.emit('player-shot');
    }

    // SPACE ability: volley (Fusion Law F2/F7). M3: the equipped ability item
    // modifies cost + arrow count (SIM.abilityFor).
    var ab = DATA.abilities[DATA.classes[st.cls].ability];
    var abFx = SIM.abilityFor(ab, st.equipment);
    if (intent.ability && st.mp >= abFx.mpCost && time - st.lastAbilityAt >= ab.cooldownMs) {
      st.lastAbilityAt = time; st.mp -= abFx.mpCost;
      var half = (abFx.count - 1) / 2;
      for (var i = 0; i < abFx.count; i++) {
        var a = intent.aimAngle + Phaser.Math.DegToRad(ab.spreadDeg) * ((i - half) / half || 0) / 2;
        fireProjectile(scene, scene.playerShots, p.x, p.y, a, ab.projSpeed,
          SIM.damage(wDmg * ab.dmgMult, st.stats.att, 0), ab.lifeMs, 'arrow', ab.pierce);
      }
      scene.events.emit('player-ability');
    }

    // i-frame blink
    var a = time - st.lastHitAt < DATA.combat.iframesMs ? (Math.floor(time / 60) % 2 ? 0.4 : 1) : 1;
    p.setAlpha(a);
    if (p.held) p.held.setAlpha(a);
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
    var m = scene.mobs.get(x, y, def.texture);
    if (!m) return null;
    m.setActive(true).setVisible(true).setTexture(def.texture).setScale(2).setDepth(5);
    m.body.enable = true;
    m.body.setSize(11, 11).setOffset(2.5, 2.5);
    m.id = nextId++;
    m.mob = { key: key, def: def, hp: def.hp, xp: def.xp, spd: def.spd,
              affix: null, evolved: false, lastShotAt: 0, lastContactAt: 0 };
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
        m.setScale(2 * (af.scale || 1)).setTint(af.tint);
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

  function updateMob(scene, m, player, time) {
    var def = m.mob.def;
    var dx = player.x - m.x, dy = player.y - m.y;
    var dist = Math.hypot(dx, dy) || 1;

    var spd = m.mob.spd;                        // E9: affix-adjusted speed
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
    var b = scene.physics.add.sprite(x, y, def.texture);
    b.setScale(3).setDepth(6);
    b.body.setSize(14, 12).setOffset(3, 5);
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
    createPlayer: createPlayer, updatePlayer: updatePlayer, hurtPlayer: hurtPlayer,
    grantXp: grantXp, spawnMob: spawnMob, updateMob: updateMob, hurtMob: hurtMob,
    clearNameTag: clearNameTag,
    spawnBoss: spawnBoss, updateBoss: updateBoss, hurtBoss: hurtBoss,
    fireProjectile: fireProjectile, killProjectile: killProjectile,
    updateProjectiles: updateProjectiles
  };
})();
