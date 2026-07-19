// ============================================================================
// data.js — ALL tunable numbers live here. Balance the game by editing this
// file only. No magic numbers allowed in scenes/entities. (ARCHITECTURE.md §3)
// ============================================================================
var DATA = {

  // --- Classes (Fusion Law F7). M0: Ranger only. M4 (2026-07-12): + Wizard.
  // Every class carries its own base/growth/caps + a weapon + an ability key;
  // the sprite is `texture` (Entities.createPlayer reads it). Both are OPEN
  // from the start (chosen per save slot at NEW GAME); a slot keeps its class
  // across permadeath (a fresh character of the SAME class is born on death).
  // M1 tuning sweep (2026-07-11): spd 170→180 (dodging is the skill — F2;
  // player must feel faster than the swarm), baseRate 1.5→1.7 (punchier).
  classes: {
    // M4.6 (user, 2026-07-14): the Ranger runs on ENERGY now, not mana — a
    // fast-refilling stamina pool (yellow orb; regen 4→10, "fast and spammy":
    // a fire volley roughly every ~2.5s sustained). Fixes the user-reported
    // mana drought. `resource` reuses the Knight's RAGE plumbing (name/color/
    // glow drive the HUD orb) but WITHOUT startsEmpty — energy starts full and
    // regens like mana always did. TUNE ME: mpRegenPerSec vs volley mpCost.
    ranger: {
      name: 'Ranger', texture: 'ranger', accent: 0x38b764,
      // M5.1 (user): FULL-LEGENDARY SET AURA — all four equipped slots T5
      // wraps the hero in a class-colored body glow (archer GREEN).
      setGlow: 0x38b764,
      blurb: 'Fast archer on a quick-refill ENERGY pool. Kites the swarm and rains fire on it.',
      base:   { hp: 100, mp: 100, att: 12, def: 0, spd: 180, dex: 12 },
      growth: { hp: 3.9, mp: 1.9, att: 0.32, def: 0.11, spd: 0.45, dex: 0.26 }, // per level (M4.6: ×19/59 for cap 60)
      caps:   { hp: 700, mp: 300, att: 60, def: 25, spd: 260, dex: 55 },
      mpRegenPerSec: 10,
      resource: { name: 'ENERGY', color: 0xffd23e, glow: 0xffe98a },
      // M4.8 (user, 2026-07-14): DODGE REGEN — the Ranger has no damage
      // reduction (dmgTaken 1x) and no lifesteal; his survival tool is simply
      // NOT GETTING HIT. Go hpRegen.delayMs without taking a hit and he heals
      // hpRegen.pctPerSec of MAX HP each second (a SLOW-to-MEDIUM trickle —
      // user pick). Any hit resets the clock (Entities.hurtPlayer stamps
      // lastHitAt). Clean kiting tops off chip damage; it will NOT out-heal a
      // beating. Ranger-only (the class carries the field). TUNE ME.
      hpRegen: { delayMs: 2500, pctPerSec: 0.03 },
      weapon: 'bow',
      ability: 'volley'
    },
    // M4 (user design 2026-07-12, special reworked 2026-07-13): the WIZARD — a
    // crowd-control caster. Frost-bolt basic PIERCES every enemy in a line and
    // SLOWS them; the ability is the ARCANE BARRAGE — a held machine gun of
    // straight-line bolts (see weapons.frost + abilities.barrage). Squishier +
    // slower than the Ranger, but higher spell power and a deep MP pool + regen.
    wizard: {
      name: 'Wizard', texture: 'wizard', accent: 0x41a6f6,
      setGlow: 0x41a6f6,                 // M5.1: full-legendary aura — mage BLUE
      blurb: 'Frost-bolt caster. Pierces + slows the swarm; unloads an arcane machine gun.',
      base:   { hp: 85, mp: 130, att: 14, def: 0, spd: 165, dex: 10 },
      growth: { hp: 3.2, mp: 2.9, att: 0.39, def: 0.1, spd: 0.39, dex: 0.23 },   // M4.6: ×19/59 for cap 60
      caps:   { hp: 560, mp: 420, att: 70, def: 22, spd: 240, dex: 48 },
      mpRegenPerSec: 6,
      // M4.6 (user, 2026-07-14): the squishy classes were coasting — monsters
      // hit the Wizard (and Knight) HARDER, the boss hardest ("heavy" pick:
      // +30% mob / +60% boss). Applied in Entities.hurtPlayer BEFORE defense.
      // The Ranger has no dmgTaken (1x — dodging is already his whole game).
      dmgTaken: { mob: 1.3, boss: 1.6 },   // TUNE ME by playtest
      // M4.9 (user, 2026-07-14): the Wizard also REGENS out of combat, like the
      // Ranger — but he needs a LONGER lull (5s vs 2.5s) since he isn't the
      // pure-dodge class. Same 3%/s trickle. See Entities.updatePlayer.
      hpRegen: { delayMs: 5000, pctPerSec: 0.03 },   // TUNE ME
      weapon: 'frost',
      ability: 'barrage'   // user redesign 2026-07-13: machine gun replaced the storm orbs
    },
    // M4 (user design 2026-07-13): the KNIGHT — an armored MELEE bruiser (the
    // roster's first non-projectile class). Basic = a curved CRESCENT CLEAVE
    // that sweeps forward toward the aim and carves every mob in a frontal arc
    // (weapons.sword, melee:true — a new verb: RealmScene.meleeSwing). Ability =
    // WHIRLWIND, a HELD CHANNEL: he spins, draining MP every second while held,
    // shredding anything inside the ring on a fast tick (abilities.whirlwind,
    // type:'whirlwind' — RealmScene.whirlwindTick). Tanky juggernaut: the most
    // HP + DEF, the slowest SPD, high ATT, a shallow MP pool the whirlwind burns
    // through (so it's a burst tool, not a permanent state). Squishy classes
    // kite; the Knight wades in and out-trades the pack face-to-face.
    // BERSERKER REWORK (user, 2026-07-13, ?v=m4d): the Knight now TAKES A LOT
    // MORE DAMAGE (hp/def cut hard) — his survival tool is the whirlwind's
    // LIFESTEAL. His resource is RAGE, not mana: it STARTS EMPTY, never regens
    // on its own (mpRegenPerSec 0), and FILLS as the cleave connects
    // (weapons.sword.rageGain per enemy hit). The whirlwind drains it and heals
    // him per enemy it damages (abilities.whirlwind.hpPerHit); at 0 rage the
    // channel refuses. The HUD draws his right orb as MOLTEN LAVA (resource).
    knight: {
      name: 'Knight', texture: 'knight', accent: 0xef7d57,
      setGlow: 0xff3b30,                 // M5.1: full-legendary aura — knight RED
      blurb: 'Rage-fueled bruiser. Cleaves build rage; the whirlwind spends it and mends him.',
      base:   { hp: 115, mp: 80,  att: 16,  def: 1,    spd: 150, dex: 8 },
      growth: { hp: 3.9, mp: 1,  att: 0.42, def: 0.11, spd: 0.32, dex: 0.16 },  // M4.6: ×19/59 for cap 60
      caps:   { hp: 720, mp: 160, att: 66,  def: 26,   spd: 220, dex: 40 },
      mpRegenPerSec: 0,
      // M4.6 (user, 2026-07-14): see the Wizard's note — the bruiser eats it
      // too. His lifesteal whirlwind is now a real survival tool, not a bonus.
      dmgTaken: { mob: 1.3, boss: 1.6 },   // TUNE ME by playtest
      resource: { name: 'RAGE', color: 0xff5a1f, glow: 0xff8c2e, startsEmpty: true },
      weapon: 'sword',
      ability: 'whirlwind'
    },
    // NINJA "ONI KING" (Red 2026-07-17): the FINAL post-game class — a masked
    // assassin. FASTEST class, dodge-based like the Ranger (no dmgTaken penalty +
    // out-of-combat regen). Basic = a ricocheting SHURIKEN; special = SHURIKEN
    // STORM (a bleeding ring of stars). Resource = CHI (fast-refill, spammy).
    // `locked:true` → NOT selectable at new game until the campaign is beaten
    // (beatTheGame adds it to unlockedClasses; class picker shows only unlocked).
    ninja: {
      name: 'Ninja', texture: 'ninja', accent: 0xe84545,
      setGlow: 0xe84545,                 // full-legendary aura — oni RED
      blurb: 'Masked assassin. Ricocheting shuriken + a bleeding star-storm. The fastest class.',
      base:   { hp: 95, mp: 110, att: 12, def: 0, spd: 200, dex: 15 },
      growth: { hp: 3.6, mp: 2.0, att: 0.32, def: 0.1, spd: 0.4, dex: 0.3 },   // ×19/59 for cap 60
      caps:   { hp: 620, mp: 320, att: 60, def: 22, spd: 285, dex: 62 },
      mpRegenPerSec: 11,
      hpRegen: { delayMs: 2500, pctPerSec: 0.03 },   // dodge class (like Ranger, no dmgTaken)
      resource: { name: 'CHI', color: 0x5fe8c2, glow: 0x9ffce8 },
      weapon: 'shuriken',
      ability: 'shadowClone',            // Red 2026-07-19: was 'shurikenStorm' (lame) → SHADOW CLONE JUTSU
      locked: true
    }
  },

  weapons: {
    bow: { dmg: 14, projSpeed: 560, lifeMs: 700, texture: 'arrow',
           // shots per second = 1.7 + dex * 0.055  (see sim.fireRate)
           baseRate: 1.7, dexRate: 0.055, sound: 'shoot',
           // E8 (2026-07-12): the weapon is now VISIBLY held — a sprite that
           // dynamically aligns to the aim direction (F2: mouse aims).
           heldTexture: 'bow', holdOffset: 15 },
    // M4: the Wizard's FROST STAFF. Slower cadence + harder hit than the bow,
    // and every bolt PIERCES the whole line (pierce:true) and SLOWS what it
    // touches (slow: mob spd × mult for ms — applied in the realm's shot→mob
    // overlap via Entities.applySlow). shots/sec = 1.15 + dex*0.045.
    // upright (user, 2026-07-13): the staff is CARRIED like a walking staff —
    // held vertical at the Wizard's side — instead of aimed out like a bow arm.
    frost: { dmg: 22, projSpeed: 470, lifeMs: 820, texture: 'frostbolt',
             baseRate: 1.15, dexRate: 0.045, sound: 'frost',
             pierce: true, slow: { mult: 0.55, ms: 1300 },
             heldTexture: 'staff', holdOffset: 14, upright: true },
    // M4: the Knight's SWORD — a MELEE weapon (melee:true, no projectile). Each
    // "shot" is a CRESCENT CLEAVE: RealmScene.meleeSwing hits every mob/boss
    // within `range` px whose bearing is inside `arcDeg`/2 of the aim. Hard
    // single hit, but you have to be in the mob's face. swings/sec = 1.25 +
    // dex*0.05 (the Knight's low dex → a heavier, slower cadence than the bow).
    // range = whirlwind radius (94) so the cleave reaches AS FAR as the whirlwind
    // extends (user, 2026-07-13); swingMs = the sword's on-screen swing duration.
    // rageGain (berserker rework): RAGE gained PER ENEMY the cleave connects
    // with — carving a pack of 4 banks ~32 rage toward the whirlwind.
    sword: { melee: true, dmg: 30, range: 94, arcDeg: 115, swingMs: 160,
             baseRate: 1.25, dexRate: 0.05, sound: 'slash', rageGain: 8,
             heldTexture: 'sword', holdOffset: 16 },
    // NINJA basic — SHURIKEN: fast thrown stars on a quick CHI cadence.
    // RAPID-FIRE REWORK (Red 2026-07-19): the ninja felt weak, so the throw is
    // now a genuine STORM of stars — the fastest cadence in the game by a mile —
    // that also flies FARTHER. shots/sec = 2.7 + dex*0.085 (was 1.9 + dex*0.06;
    // at the dex cap that's ~7.9/s vs the old ~5.6/s). RANGE (projSpeed*lifeMs)
    // went 600×0.72=432px → 700×1.05=735px, so he peppers from safety like the
    // dodge-class he is. (`ricochet` stays declared but is a dead flag — nothing
    // in the overlap reads it; homing lives on the new SHADOW CLONE ult instead.)
    shuriken: { dmg: 12, projSpeed: 700, lifeMs: 1050, texture: 'shurikenProj',
                baseRate: 2.7, dexRate: 0.085, sound: 'shoot', spin: true, ricochet: 1,
                heldTexture: 'shuriken64', holdOffset: 15 }
  },

  abilities: {
    // Ranger — FIRE VOLLEY (M4.6, user 2026-07-14): the piercing fan of arrows
    // now IGNITES everything it hits. Each arrow carries a BURN rider
    // (shot.proj.burn, applied in the shot→mob AND shot→boss overlaps via
    // Entities.applyBurn): burn.dmg is scaled by ATT at fire time (SIM.damage),
    // ticks every everyMs for ms total (re-hits REFRESH the timer, they don't
    // stack ticks). Burn ticks never knock back and never roll EVOLVING —
    // it's the same hit, still cooking. tint = the arrows glow ember orange.
    // TUNE ME: burn.dmg/ms against the new energy cadence.
    volley: { type: 'volley', mpCost: 22, count: 5, spreadDeg: 26, dmgMult: 1.1,
              projSpeed: 620, lifeMs: 800, pierce: true, cooldownMs: 600,
              sound: 'volley', tint: 0xff9a3d,
              burn: { dmg: 5, everyMs: 600, ms: 3000 } },
    // Wizard — STORM BARRAGE (type:'barrage'; user redesign 2026-07-13,
    // REPLACES the storm orbs): a MACHINE GUN of LIGHTNING BALLS. A HELD
    // CHANNEL — while the ability key is held, a ball fires every `fireEveryMs`
    // DEAD STRAIGHT down the aim line (no spread, no pierce — the piercing/
    // slowing frost bolt stays the crowd tool). Each ball costs `mpPerShot`;
    // the channel refuses when MP can't cover the next round. THE PROC (user
    // spec): every ball that CONNECTS has `strike.chance` to SUMMON A LIGHTNING
    // BOLT down onto that enemy — an area strike (RealmScene.lightningStrike,
    // SIM.damage) with the full sky-bolt VFX. Rolled through SIM.rng at the
    // hit site (the shot→mob / shot→boss overlaps read proj.strike).
    // M4.6 (user, 2026-07-14): mpPerShot 2.5 → 1.25 — the machine-gun spam
    // runs TWICE as long (~104 balls off a full base pool, ~9s of continuous
    // fire). Tomes (wizard ability items) cut it further — SIM.abilityFor.
    barrage: { type: 'barrage', mpPerShot: 1.25, fireEveryMs: 90,
               dmg: 8, projSpeed: 640, lifeMs: 700,
               texture: 'zapball', sound: 'zap',
               strike: { chance: 0.22, radius: 56, dmg: 20, sound: 'thunder' } },
    // Knight — WHIRLWIND (type:'whirlwind'). NOT a one-shot cast: it's a HELD
    // CHANNEL. While the ability key is held AND mp > 0 the Knight spins —
    // Entities.updatePlayer drains `mpDrainPerSec` MP each second and, every
    // `tickMs`, calls RealmScene.whirlwindTick which deals SIM.damage(dmg,att)
    // to every enemy within `radius`. No cooldown, no per-cast cost — the MP
    // pool IS the fuel (drain > regen, so it can't spin forever). Realm-only
    // (the nexus forces intent.ability false, so it never drains in the chamber).
    // TORNADO PROC (user add 2026-07-13): every whirlwind tick has a `chance`
    // (SIM.rng — seam rule 4) to fling out a TORNADO — a funnel that shoots
    // outward in a random direction, plows across the field, and grinds any
    // enemy it passes through (`dmg` per `reHitMs`, hits each mob repeatedly
    // while overlapping). RealmScene owns the pool: spawnTornado/updateTornadoes.
    // BERSERKER REWORK: hpPerHit — the whirlwind LIFESTEALS, healing the Knight
    // per enemy each tick damages (spin deep in the pack = drink deep). The
    // drain empties the rage pool in ~4s; at 0 the spin stops until the cleave
    // refills it. TUNE hpPerHit/mpDrainPerSec by playtest.
    whirlwind: { type: 'whirlwind', mpDrainPerSec: 20, tickMs: 150,
                 dmg: 15, radius: 94, knockback: 30, sound: 'whirl', hpPerHit: 2,
                 tornado: { chance: 0.18, speed: 205, lifeMs: 1500, radius: 40,
                            dmg: 18, reHitMs: 260, sound: 'whirl' } },
    // NINJA special — SHURIKEN STORM (RETIRED 2026-07-19): the old ult, a 360°
    // ring of bleeding stars. Kept defined for reference / possible reuse, but
    // the ninja now points at SHADOW CLONE below. Nothing reads this unless a
    // class re-points to it.
    shurikenStorm: { type: 'volley', mpCost: 24, count: 8, spreadDeg: 360, dmgMult: 1.0,
                     projSpeed: 560, lifeMs: 700, pierce: true, cooldownMs: 700,
                     sound: 'volley', tint: 0xe84545,
                     burn: { dmg: 4, everyMs: 500, ms: 2500 } },
    // NINJA ult — SHADOW CLONE JUTSU (Red 2026-07-19): the old star-ring was
    // lame, so SPACE now spends CHI to POOF a squad of shadow clones into the
    // fight for `durationMs`. Each clone trails the ninja at an orbit offset,
    // auto-locks the nearest enemy, and rapid-fires HOMING, BLEEDING shuriken on
    // its own `fireEveryMs` cadence — a whole ninja squad blanketing the screen.
    // `count` = number of clones (ability CHARMS add clones — na3 +2 … na5 +6,
    // so the Oni Charm fields ~9). Clone shots go into playerShots, so the
    // existing shot→mob / shot→boss overlaps hit + bleed everything for free.
    // This is a one-shot cast (cost + cooldown) — the clones are scene-owned and
    // live out their own timer (RealmScene.summonShadowClones / .updateShadowClones).
    // Realm-only in practice (the nexus has no summonShadowClones, and forces
    // intent.ability false). `homing.turn` = rad/s the clone stars steer at.
    // TUNE ME (Red): count / durationMs / fireEveryMs / dmgMult by playtest.
    shadowClone: { type: 'shadowClone', mpCost: 30, count: 3, durationMs: 5200,
                   fireEveryMs: 210, dmgMult: 0.8, projSpeed: 700, lifeMs: 1050,
                   cooldownMs: 6500, orbit: 46, sound: 'volley', tint: 0xe84545,
                   homing: { turn: 6 }, burn: { dmg: 4, everyMs: 500, ms: 2500 } }
  },

  // --- XP curve (Fusion Law F4): xp needed to go from level L to L+1 --------
  // M4.6 REWORK (user, 2026-07-14): leveling was way too fast — the cap is 60
  // now and ONE MAP ≈ ONE LEVEL. A full realm clear pays ~2300 xp (quota kills
  // + champions + boss + close bonus), so needed() sits near that: slightly
  // under early (first runs feel generous, ~1.3 levels), drifting over it by
  // the 50s (~0.8 — the last stretch is a grind, as a cap should be).
  // Class growth-per-level was rescaled ×19/59 to match: a level-60 hero has
  // the SAME stats a level-20 hero had before — the climb is just longer and
  // each step smaller. Potions + gear remain the post-cap progression.
  // TUNE ME against real runs.
  // M5.4 (user): LEVEL IS COSMETIC. `levelPower:false` → the character's base
  // stats DO NOT scale with level (SIM.statsAtLevel ignores the level term);
  // power comes from GEAR + POTIONS only. The MOBS scale with your level
  // instead (waves.mobLevelScale) — so the number climbing raises the world's
  // threat, not your raw strength. Flip levelPower:true to restore old growth.
  xp: { cap: 60, needed: function (level) { return Math.floor(2000 + level * 25); },
        levelPower: false },

  combat: {
    iframesMs: 500,          // no double-hits inside this window (TM-2)
    contactTickMs: 350,      // how often a touching chaser re-applies contact damage
    knockback: 160,          // M1: 140→160 — hits should visibly move the swarm
    minDamage: 1,
    // 2026-07-18 (Red): NO single hit kills a healthy player — death comes from
    // STACKED mistakes, not a spike. Any one hit is clamped to this fraction of
    // the victim's MAX HP (Entities.hurtPlayer, AFTER class dmgTaken + boss-depth
    // scaling + flat DEF). Even signature "instakills" (the ghost express) become
    // huge-but-survivable. At 0.6 two clean hits still drop a full-HP hero. Set
    // to 1.0 to disable the cap. DEV tuning constant.
    maxSingleHitPct: 0.6
  },

  // --- PROGRESSION SCALING (2026-07-18, Red) — the campaign's difficulty +
  // loot curve. AXIS = campaign DEPTH: how many regions you've already cleared
  // (ACCOUNT.cleared.length, stamped on scene.progressDepth at realm create,
  // 0..maxDepth). Deeper corruptions HIT HARDER and DROP BETTER in lockstep, so
  // the run stays hard the whole way — until the guaranteed full LEGENDARY SET
  // (whale kill) shatters the curve and the power fantasy pays off. depth 0 is
  // exactly the pre-2026-07-18 flat game (every term below is 1.0 at depth 0),
  // so fresh-save test suites are untouched. DEVELOPER TUNING CONSTANTS — there
  // is NO in-game UI for these; edit here to retune the whole campaign at once.
  progression: {
    maxDepth: 19,             // 20 regions total → depth clamps to 0..19 (whale = 19)
    // DIFFICULTY — linear per-depth adders. HP climbs faster than damage on
    // purpose: fights get longer/attritional, not spikier (fits "no one-shots").
    mobHpPerDepth:  0.058,    // mob HP     ×1.00 → ×2.10 across depth 0→19
    mobDmgPerDepth: 0.032,    // mob damage ×1.00 → ×1.61
    mobXpPerDepth:  0.045,    // mob XP     ×1.00 → ×1.86 (leveling doesn't stall as HP grows)
    bossHpPerDepth: 0.053,    // boss HP    ×1.00 → ×2.01
    bossDmgPerDepth:0.028,    // boss damage×1.00 → ×1.53 (applied in hurtPlayer on fromBoss hits)
    // LOOT — per-TIER geometric factor applied to every boss drop-table weight
    // (SIM.depthLootShift), keyed by item tier. <1 fades low tiers as you go
    // deeper, >1 grows high tiers. ALL are 1.0 at depth 0 by construction
    // (factor^0). Validated (Monte-Carlo, 2026-07-18): end-of-campaign kit lands
    // blue/purple; natural full-T5 set before the whale ≈ 0.3% (the chase lives).
    lootShift: { 0: 1, 1: 0.93, 2: 0.985, 3: 1.055, 4: 1.10, 5: 1.105 }
  },

  // --- DEV TUNING KNOBS (2026-07-18, Red) — global balance levers with NO
  // gameplay change at their defaults. Edit here instead of hunting per-mob /
  // per-boss / per-weapon cadences. NOT exposed in-game.
  tuning: {
    // Projectile FREQUENCY multipliers. >1 = fire more often, <1 = less. Covers
    // the shared cadence sites: player auto-fire (SIM.fireRate), generic mob
    // `shoot` cooldowns, and the core-boss radial/stream filler. Per-map
    // telegraphed boss verbs keep their own hand-tuned cadence (boss contract).
    projFreq: { mob: 1.0, boss: 1.0, player: 1.0 }
  },

  // --- Mobs. Every mob composes the two verbs: chase / shoot (Fusion Law F9).
  // M1 tuning: slime spd 95→100 (more pressure), brute contactDmg 18→16 (felt
  // cheap with knockback), spitter cooldown 1400→1300, warlock projSpeed
  // 200→190 (readable bullets — Pillar 2). deathTint drives the M1 particles.
  mobs: {
    slime:   { name: 'Slime',   texture: 'slime',   hp: 22,  spd: 100, xp: 6,  cost: 1,
               deathTint: 0x38b764, chase: { contactDmg: 8 } },
    brute:   { name: 'Brute',   texture: 'brute',   hp: 85,  spd: 62,  xp: 18, cost: 3,
               deathTint: 0xb13e53, chase: { contactDmg: 16 }, unlockAt: 45 }, // seconds into realm
    spitter: { name: 'Spitter', texture: 'spitter', hp: 30,  spd: 78,  xp: 12, cost: 2,
               deathTint: 0x8f3fb5,
               shoot: { range: 300, dmg: 10, projSpeed: 230, cooldownMs: 1300,
                        count: 1, spreadDeg: 0, lifeMs: 2600 }, unlockAt: 20 },
    warlock: { name: 'Warlock', texture: 'warlock', hp: 55,  spd: 55,  xp: 26, cost: 4,
               deathTint: 0x5d275d,
               shoot: { range: 360, dmg: 13, projSpeed: 190, cooldownMs: 2100,
                        count: 3, spreadDeg: 34, lifeMs: 3000 }, unlockAt: 75 },

    // --- M4.7 TRAIN-YARD ROSTER (user sheet, 2026-07-14): 8 yard-flavored
    // mobs — the trainyard biome's spawn pool. The grasslands four above stay
    // for the future Grovekeeper map. Same two verbs (chase/shoot) + ONE new
    // flag: `detonate` (Dynamite Mole) — his contact hit is his death (the
    // player↔mob overlap bursts him). texture = the hi-fi 48px key directly
    // (these mobs are born hi-fi; no classic 16px twins). TUNE ME: all stats.
    coalGolem:       { name: 'Coal Golem',       texture: 'coalGolemHi',       hp: 30, spd: 85,  xp: 8,  cost: 1,
                       deathTint: 0xff9a3d, chase: { contactDmg: 9 } },
    crossingCreep:   { name: 'Crossing Creep',   texture: 'crossingCreepHi',   hp: 35, spd: 45,  xp: 13, cost: 2,
                       deathTint: 0xff2a2a,
                       shoot: { range: 320, dmg: 10, projSpeed: 220, cooldownMs: 1500,
                                count: 2, spreadDeg: 14, lifeMs: 2500 }, unlockAt: 20 },
    furnaceImp:      { name: 'Furnace Imp',      texture: 'furnaceImpHi',      hp: 26, spd: 95,  xp: 12, cost: 2,
                       deathTint: 0xff7d3a,
                       shoot: { range: 260, dmg: 9,  projSpeed: 260, cooldownMs: 1200,
                                count: 1, spreadDeg: 0, lifeMs: 2200 }, unlockAt: 30 },
    boxcarBrute:     { name: 'Boxcar Brute',     texture: 'boxcarBruteHi',     hp: 95, spd: 58,  xp: 20, cost: 3,
                       deathTint: 0x8a3b2e, chase: { contactDmg: 17 }, unlockAt: 45 },
    couplingChomper: { name: 'Coupling Chomper', texture: 'couplingChomperHi', hp: 40, spd: 125, xp: 14, cost: 2,
                       deathTint: 0x9aa7b8, chase: { contactDmg: 12 }, unlockAt: 55 },
    // M4.9 (user, 2026-07-14): SLOW shambling CHASER (no longer a shooter) that
    // drips a GREEN SLIME TRAIL — lingering hazard patches that tick damage on
    // the player standing in them (RealmScene.dropSlime/updateSlime).
    conductorZombie: { name: 'Conductor Zombie', texture: 'conductorZombieHi', hp: 45, spd: 38,  xp: 22, cost: 3,
                       deathTint: 0x4fd07a, chase: { contactDmg: 14 },
                       slimeTrail: { everyMs: 600, radius: 26, lifeMs: 2400, dmg: 4, tickMs: 480 },
                       unlockAt: 60 },
    // M4.9 (user, 2026-07-14): the mole is a TELEGRAPHED BOMB now, not a
    // contact suicide. It SURFACES on-screen near you (director uses
    // pickSurfacePoint for fuse mobs), holds still and FLASHES (faster as the
    // fuse burns), then EXPLODES an AoE (RealmScene.moleExplode). SHOOT it in
    // time to defuse it (normal kill = XP); ignore it and it blows (no XP).
    // SPARING: unlocks late + hard concurrency cap (director maxConcurrent).
    // armMs is a LONG fuse (user: "significant delay so you have time to move
    // away") — the blast radius is big, but ~3.8s is plenty to walk clear.
    dynamiteMole:    { name: 'Dynamite Mole',    texture: 'dynamiteMoleHi',    hp: 18, spd: 0, xp: 14, cost: 4,
                       deathTint: 0xffd23e,
                       fuse: { armMs: 3800, radius: 118, dmg: 42 },
                       maxConcurrent: 2, unlockAt: 70 },
    // M4.9 (user, 2026-07-14): FOG CASTER (no longer a shooter). It pulses a
    // smog cloud 5s ON / 5s OFF; while ON, every mob in the cloud (the serpent
    // included) is CONCEALED — the player's shots pass through them UNLESS the
    // player is standing INSIDE the cloud. Rush the fog to kill what it hides.
    // RealmScene.updateFog owns the phase, the concealed flags, and playerInFog.
    smogSerpent:     { name: 'Smog Serpent',     texture: 'smogSerpentHi',     hp: 55, spd: 62,  xp: 26, cost: 4,
                       deathTint: 0x6a707c, chase: { contactDmg: 11 },
                       fog: { onMs: 5000, offMs: 5000, radius: 172, concealSelf: true },
                       unlockAt: 95 },

    // --- M5.0 THE GROVE ROSTER (user picks 2026-07-14/15: #2 7 8 9 14 15 20
    // + a blue pixie; mechanics reshaped live) — the grove biome's 8 + their
    // minis. New flags: `split` (death-duplication), `blink` (teleport
    // shooter), `glowTrail`/`reviveOnDeath`/`summon` (Bloom Pixie's kit),
    // `guard` (Bumblebrute's immortality wards + SUMMON cast bar), `skins`
    // (mini-mob recolors), `flap` (2-frame wing animation). TUNE ME: all.
    // MOONMOTH (user: "just a fast squishy chaser") — the grove's cheap staple.
    moonmoth:    { name: 'Moonmoth',       texture: 'moonmothHi',      hp: 14,  spd: 150, xp: 6,  cost: 1,
                   deathTint: 0xb0b0cc, chase: { contactDmg: 7 }, flap: true },
    // PUFFCAP (user: "slow but duplicate into 10 smaller versions when u kill it")
    puffcap:     { name: 'Puffcap Waddler', texture: 'puffcapHi',      hp: 60,  spd: 42,  xp: 10, cost: 2,
                   deathTint: 0xd95763, chase: { contactDmg: 10 },
                   split: { key: 'puffcapMini', count: 10, ring: 34 } },
    puffcapMini: { name: 'Puffcap',        texture: 'puffcapMini0',    hp: 6,   spd: 120, xp: 1,  cost: 1,
                   deathTint: 0xf28d9a, chase: { contactDmg: 4 },
                   skins: ['puffcapMini0', 'puffcapMini1', 'puffcapMini2', 'puffcapMini3'] },
    // PIXIE TRICKSTER — blinks to a new spot around you between shot fans.
    pixie:       { name: 'Pixie Trickster', texture: 'pixieHi',        hp: 25,  spd: 70,  xp: 12, cost: 2,
                   deathTint: 0xff77a8, flap: true,
                   shoot: { range: 320, dmg: 9,  projSpeed: 210, cooldownMs: 1600,
                            count: 3, spreadDeg: 26, lifeMs: 2600, tint: 0xff77a8, texture: 'orbShot' },
                   blink: { everyMs: 2600, dist: 170 }, unlockAt: 25 },
    // BLOOM PIXIE (user stream 2026-07-15): a glowing TRAIL that RESURRECTS
    // enemies that fell near it · on HER death resurrects every corpse in a
    // radius (kill her away from the pile) · periodically summons an extra
    // BUMBLEBRUTE. The grove's priority target.
    bloomPixie:  { name: 'Bloom Pixie',    texture: 'bloomPixieHi',    hp: 40,  spd: 55,  xp: 34, cost: 5,
                   deathTint: 0x41a6f6, flap: true, chase: { contactDmg: 6 },
                   glowTrail: { everyMs: 800, radius: 32, lifeMs: 2800 },
                   reviveOnDeath: { radius: 150 },
                   summon: { key: 'bumblebrute', everyMs: 11000, maxAlive: 2 },
                   maxConcurrent: 2, unlockAt: 100 },
    // MOSS GOLEM (user: "tanky chaser") — the grove's Boxcar Brute.
    mossGolem:   { name: 'Moss Golem',     texture: 'mossGolemHi',     hp: 140, spd: 50,  xp: 24, cost: 3,
                   deathTint: 0x63b25a, chase: { contactDmg: 18 }, unlockAt: 55 },
    // SEEDLING TURRET — rooted; radial GOLD seed bursts (user: distinct
    // projectile colors per plant). spd 0 = the shooter verb holds it still.
    seedlingTurret: { name: 'Seedling Turret', texture: 'seedlingTurretHi', hp: 45, spd: 0, xp: 16, cost: 3,
                   deathTint: 0xffcd75,
                   shoot: { range: 340, dmg: 9,  projSpeed: 180, cooldownMs: 2300,
                            count: 10, spreadDeg: 360, lifeMs: 2800, tint: 0xffcd75, texture: 'orbShot' },
                   unlockAt: 40 },
    // SNAPDRAGON — rooted; aimed PINK petal-bolt fans.
    snapdragon:  { name: 'Snapdragon',     texture: 'snapdragonHi',    hp: 55,  spd: 0,   xp: 18, cost: 3,
                   deathTint: 0xff5a8a,
                   shoot: { range: 400, dmg: 11, projSpeed: 250, cooldownMs: 1500,
                            count: 3, spreadDeg: 16, lifeMs: 2600, tint: 0xff5a8a, texture: 'orbShot' },
                   unlockAt: 65 },
    // BUMBLEBRUTE (user 2026-07-15): IMMORTAL until you kill the mini brutes
    // he summons ON SPAWN — a very short cast bar ("SUMMON", 0.5s) telegraphs
    // the wards. Environmental kills (trains/timber) ignore the wards.
    bumblebrute: { name: 'Bumblebrute',    texture: 'bumblebruteHi',   hp: 170, spd: 40,  xp: 45, cost: 5,
                   deathTint: 0xffd23e, flap: true, chase: { contactDmg: 16 },
                   guard: { key: 'bumblebruteMini', count: 4, castMs: 500, label: 'SUMMON', ring: 60 },
                   maxConcurrent: 2, unlockAt: 80 },
    bumblebruteMini: { name: 'Bumblebee',  texture: 'bbMini0',         hp: 12,  spd: 130, xp: 3,  cost: 1,
                   deathTint: 0xffd23e, flap: true, chase: { contactDmg: 6 },
                   skins: ['bbMini0', 'bbMini1', 'bbMini2'] },

    // --- M5.6 THE GRAVEYARD ROSTER (user picks 2026-07-15: #2 3 4 7 9 10 16 18).
    // Six NEW verbs join the engine (entities.updateMob + scene hooks): `lunge`
    // (telegraphed pounce-dash), `regen` (heal unless recently hit), `deathGas`
    // (poison cloud on death — slime-patch tech), `wail` (cone dmg + slow;
    // `eatsWisps` lets a Banshee buff on soul pickup), `contactCurse` (burn-tech
    // DoT applied on contact), `raise` (periodically resurrects field corpses,
    // capped). Corpses matter here (Bloater gas · Acolyte raise · bell toll ·
    // boss Explode Corpse). Colored shots = orbShot + tint. TUNE ME: all.
    // BALANCE ROUND 2026-07-15 (Red: "impossible to get to the boss"): the
    // whole roster tuned for BEATABLE IN WHITE GEAR BUT HARD. Wail is now a
    // TELEGRAPHED cast (windupMs cone locked at cast start — step out of it);
    // the archer fan is WIDE enough to slip between the bolts (Red).
    ghoul:       { name: 'Ghoul',          texture: 'ghoulHi',         hp: 34,  spd: 70,  xp: 10, cost: 2,
                   deathTint: 0x8a8e96, chase: { contactDmg: 10 },
                   lunge: { range: 240, windupMs: 750, dashMs: 240, dashSpeed: 370, cooldownMs: 3400 } },
    rattlebones: { name: 'Rattlebones',    texture: 'rattlebonesHi',   hp: 16,  spd: 92,  xp: 5,  cost: 1,
                   deathTint: 0xe6dcc0, chase: { contactDmg: 6 } },
    boneArcher:  { name: 'Bone Archer',    texture: 'boneArcherHi',    hp: 30,  spd: 48,  xp: 14, cost: 3,
                   deathTint: 0xe6dcc0,
                   // Red: NOT a stationary turret — a slow MOBILE shooter. spd>0
                   // makes the shooter verb keep range + follow the player, so it
                   // roams with the swarm (and wraps) instead of pooling at the
                   // edge; a light contact bite makes it a hybrid, not pure ranged.
                   chase: { contactDmg: 8 },
                   // Red: ONE aimed green bolt now, not a 3-bolt fan — far less
                   // projectile clutter. A bit punchier per hit to stay a threat;
                   // fast enough to punish standing still, slow enough to sidestep.
                   shoot: { range: 400, dmg: 11, projSpeed: 300, cooldownMs: 1600,
                            count: 1, spreadDeg: 0, lifeMs: 2600, tint: 0x8ff0a5, texture: 'orbShot' },
                   // Red: fast bolts are fine, but a SWARM of shooters = a wall of
                   // them. Hard-cap live archers so projectile density stays fair
                   // (over the cap the director spawns a cheap melee instead).
                   burst: { gapMs: 120 }, spawnWeight: 0.88, maxConcurrent: 3, unlockAt: 25 },
    tombGolem:   { name: 'Tomb Golem',     texture: 'tombGolemHi',     hp: 150, spd: 46,  xp: 26, cost: 3,
                   deathTint: 0x787c8a, chase: { contactDmg: 16 },
                   regen: { perSec: 16, idleMs: 2400 }, unlockAt: 55 },
    corpseBloater: { name: 'Corpse Bloater', texture: 'corpseBloaterHi', hp: 70, spd: 40, xp: 20, cost: 3,
                   deathTint: 0x7a965c, chase: { contactDmg: 10 },
                   deathGas: { radius: 64, lifeMs: 2200, dmg: 4, tickMs: 480 }, unlockAt: 45 },
    banshee:     { name: 'Banshee',        texture: 'bansheeHi',       hp: 46,  spd: 58,  xp: 24, cost: 4,
                   deathTint: 0x96ced6, float: true, eatsWisps: true,
                   wail: { range: 280, halfDeg: 26, dmg: 10, slowMult: 0.7, slowMs: 700,
                           everyMs: 3400, windupMs: 800 },
                   maxConcurrent: 3, unlockAt: 70 },
    mummy:       { name: 'Mummy',          texture: 'mummyHi',         hp: 60,  spd: 44,  xp: 22, cost: 3,
                   deathTint: 0xcabe98, chase: { contactDmg: 10 },
                   contactCurse: { dmg: 3, tickMs: 600, durMs: 2400 }, unlockAt: 60 },
    necroAcolyte: { name: 'Necro Acolyte', texture: 'necroAcolyteHi',  hp: 48,  spd: 40,  xp: 34, cost: 5,
                   deathTint: 0x9a70be, chase: { contactDmg: 6 },
                   raise: { everyMs: 4200, radius: 170, maxAlive: 6, key: 'rattlebones' },
                   maxConcurrent: 2, unlockAt: 100 },

    // --- M5.7 THE ROBOTICS FACTORY — biome 4's 12 robots (user picks 2026-07-15).
    // Mechanics = the 20-sheet role labels. New verbs (pull / slowField / guardAura /
    // mend / flameCircle) are implemented scene-side (entities.updateMob + scene
    // hooks). Colored shots = orbShot + tint. TUNE ME: all — first-pass numbers,
    // pitched a notch above the graveyard (biome 4) but beatable in white gear.
    sparkbot:    { name: 'Sparkbot',       texture: 'sparkbotHi',      hp: 18,  spd: 96,  xp: 5,  cost: 1,
                   deathTint: 0xffcd45, chase: { contactDmg: 6 } },
    hiveDrone:   { name: 'Hive Drone',     texture: 'hiveDroneHi',     hp: 20,  spd: 140, xp: 7,  cost: 1,
                   deathTint: 0x8fd6ff, float: true, flap: true, chase: { contactDmg: 7 } },
    arcWelder:   { name: 'Arc Welder',     texture: 'arcWelderHi',     hp: 44,  spd: 62,  xp: 20, cost: 4,
                   deathTint: 0x7ff0ff, chase: { contactDmg: 8 },
                   // short WIDE arc (reuses the wail cone tech, electric flavor)
                   wail: { range: 155, halfDeg: 42, dmg: 12, slowMult: 0.75, slowMs: 600,
                           everyMs: 3000, windupMs: 700, tint: 0x7ff0ff },
                   maxConcurrent: 3, unlockAt: 30 },
    scrapHulk:   { name: 'Scrap Hulk',     texture: 'scrapHulkHi',     hp: 175, spd: 44,  xp: 30, cost: 4,
                   deathTint: 0x8a8e96, chase: { contactDmg: 18 },
                   regen: { perSec: 15, idleMs: 2600 }, unlockAt: 55 },
    buzzsaw:     { name: 'Buzzsaw',        texture: 'buzzsawHi',       hp: 40,  spd: 78,  xp: 16, cost: 3,
                   deathTint: 0xc0c0c8, chase: { contactDmg: 12 },
                   lunge: { range: 260, windupMs: 700, dashMs: 240, dashSpeed: 400, cooldownMs: 3200 } },
    magCrane:    { name: 'Mag-Crane',      texture: 'magCraneHi',      hp: 62,  spd: 36,  xp: 24, cost: 4,
                   deathTint: 0xffb347, chase: { contactDmg: 8 },
                   // PULL/GRAB (new verb): telegraph, then drag the player inward
                   pull: { range: 320, windupMs: 800, pullMs: 900, pullK: 0.10, grabMs: 500,
                           slowMult: 0.5, dmg: 8, cooldownMs: 4400, tint: 0xffb347 },
                   maxConcurrent: 2, unlockAt: 65 },
    forgeHound:  { name: 'Forge Hound',    texture: 'forgeHoundHi',    hp: 46,  spd: 90,  xp: 18, cost: 3,
                   deathTint: 0xff7a2c, chase: { contactDmg: 11 },
                   // FIRE TRAIL (slimeTrail tech, fire:true recolors the patch)
                   slimeTrail: { everyMs: 500, radius: 24, lifeMs: 2200, dmg: 5, tickMs: 460, fire: true },
                   unlockAt: 40 },
    coolantTank: { name: 'Coolant Tank',   texture: 'coolantTankHi',   hp: 92,  spd: 38,  xp: 26, cost: 4,
                   deathTint: 0x8fe0ff, chase: { contactDmg: 8 },
                   // SLOW FIELD (new verb): vents a chilling patch that slows the player
                   slowField: { everyMs: 1900, radius: 72, lifeMs: 3200, slowMult: 0.5 },
                   unlockAt: 50 },
    bulwark:     { name: 'Bulwark',        texture: 'bulwarkHi',       hp: 120, spd: 40,  xp: 30, cost: 5,
                   deathTint: 0x94b0c2, chase: { contactDmg: 12 },
                   // SHIELD GUARD (new verb): projects a ward onto nearby mobs (they
                   // are immortal while the Bulwark lives + they're inside the aura)
                   guardAura: { radius: 155 }, maxConcurrent: 2, unlockAt: 75 },
    repairUnit:  { name: 'Repair Unit',    texture: 'repairUnitHi',    hp: 56,  spd: 48,  xp: 32, cost: 5,
                   deathTint: 0x7fffbf, chase: { contactDmg: 6 },
                   // HEALER (new verb): mends nearby wounded mobs on a cadence
                   mend: { everyMs: 1600, radius: 155, amount: 14 }, maxConcurrent: 2, unlockAt: 70 },
    warframe:    { name: 'Warframe',       texture: 'warframeHi',      hp: 130, spd: 42,  xp: 40, cost: 5,
                   deathTint: 0xb13e53, chase: { contactDmg: 14 },
                   shoot: { range: 420, dmg: 12, projSpeed: 300, cooldownMs: 2600,
                            count: 5, spreadDeg: 34, lifeMs: 2400, tint: 0xffcd45, texture: 'orbShot' },
                   burst: { gapMs: 90 }, maxConcurrent: 2, unlockAt: 90 },
    purgeFlamer: { name: 'Purge Flamer',   texture: 'purgeFlamerHi',   hp: 64,  spd: 40,  xp: 30, cost: 5,
                   deathTint: 0xff7a2c, chase: { contactDmg: 8 },
                   // FIRE CIRCLE (new verb): circular ground telegraph -> ring of fire
                   // that LINGERS as a burning patch (not a cone — Red's call).
                   flameCircle: { range: 300, windupMs: 1000, radius: 92, dmg: 22, everyMs: 4400,
                                  lingerMs: 900, tickMs: 300, lingerDmg: 6, tint: 0xff7a2c },
                   maxConcurrent: 2, unlockAt: 80 }
  },

  // --- Wave director (Fusion Law F3) ----------------------------------------
  waves: {
    spawnIntervalMs: 2200,               // M1: 2400→2200 — slightly steadier pressure
    budget: function (tSec) { return 2 + Math.floor(tSec / 18); }, // points per spend
    maxAlive: 150,                        // hard cap; pooling recycles (TM-3, TM-5)
    spawnRing: { min: 480, max: 640 },    // distance from player, off-screen (V11)
    // M5.4 (user): mobs used to scale with YOUR LEVEL here. 2026-07-18 (Red)
    // moved the world-threat axis to campaign DEPTH (regions cleared) via
    // DATA.progression / SIM.depthMult — a cleaner "as you progress" signal that
    // doesn't depend on the fuzzy XP curve. This level scaler is now RETIRED
    // (0 = off) but kept as a knob; SIM.mobLevelMult still composes with the
    // depth mult in spawnMob, so a nonzero value here would stack on top.
    mobLevelScale: 0
  },

  realm:  {
    size: 2400, name: 'Grasslands of Woe',   // size = fallback when no map loads (150 tiles × 16)
    // M2 (F8/R13): kill quota opens the boss portal; killing the boss closes
    // the realm. Q4 target: ~12 min to the portal at competent play — TUNE ME
    // against real runs (Fun Gate 1 data).
    killQuota: 150,
    closeXpBonus: 350,          // flat XP paid out when the realm closes
    // M4.7 (user, 2026-07-14): THE CONDUCTOR is the train-yard boss now — the
    // realm IS his yard. The Grovekeeper keeps his data below for a future
    // grasslands map (user: "keep grove keeper as a boss for a different map").
    boss: 'conductor',
    biome: 'trainyard',         // E7: the wave director reads the BIOME roster (M4.7: the yard's own 8)
    map: 'realm1'               // M3 (Lane C): the realm loads this map JSON (MAPS.get)
  },
  nexus:  { w: 960, h: 640 },   // minimum safe-zone size (RESIZE mode can grow it)

  // --- E7 (M2.1): biomes — mob variants ATTACH to a dedicated biome. A biome
  // owns its roster (and later its tileset/palette at M5). The director builds
  // its spawn pool from the realm's biome, never the global mob table.
  biomes: {
    grasslands: { name: 'Grasslands', tile: 'floor_realm',
                  mobs: ['slime', 'brute', 'spitter', 'warlock'] },
    // M4.7 (user, 2026-07-14): the yard gets its OWN roster — the 8 mobs from
    // the user's sheet. The realm points here now; grasslands waits for its map.
    trainyard: { name: 'Train Yard', tile: 'floor_realm',
                 mobs: ['coalGolem', 'crossingCreep', 'furnaceImp', 'boxcarBrute',
                        'couplingChomper', 'conductorZombie', 'dynamiteMole', 'smogSerpent'] },
    // M5.0 (user picks 2026-07-15): THE GROVE's own 8 — minis (puffcapMini /
    // bumblebruteMini) are spawned by their parents, never by the director,
    // so they stay OFF this roster.
    grove: { name: 'The Grove', tile: 'grovegrass',
             mobs: ['moonmoth', 'puffcap', 'pixie', 'seedlingTurret',
                    'mossGolem', 'snapdragon', 'bumblebrute', 'bloomPixie'] },
    // M5.6 (user picks 2026-07-15): THE GRAVEYARD's own 8. Necro Acolyte raises
    // corpses as Rattlebones (raise verb), never via the director roster.
    graveyard: { name: 'The Graveyard', tile: 'gravedirt',
             mobs: ['ghoul', 'rattlebones', 'boneArcher', 'tombGolem',
                    'corpseBloater', 'banshee', 'mummy', 'necroAcolyte'] },
    // M5.7 (user picks 2026-07-15): THE ROBOTICS FACTORY's own 12 robots. The
    // director draws from this list; floor tile is riveted steel.
    // M6c (Red): WARFRAME pulled from the roster — its 420-range 5-bolt burst
    // out-ranged everything ("shoots out way too far"). Def + art kept dormant.
    factory: { name: 'The Factory', tile: 'factoryFloor',
               mobs: ['sparkbot', 'hiveDrone', 'arcWelder', 'scrapHulk', 'buzzsaw', 'magCrane',
                      'forgeHound', 'coolantTank', 'bulwark', 'repairUnit', 'purgeFlamer'] }
  },

  // --- M5.0: REALM REGISTRY — one entry per live destination. The portal's
  // cfg.map picks the entry; RealmScene resolves biome/boss/world-kind/music
  // from here (DATA.realm keeps the shared knobs: size, quota, xp bonus —
  // and stays the trainyard-flavored default for suites that predate this).
  realms: {
    trainyard: { name: 'The Train Yard', biome: 'trainyard', boss: 'conductor',   kind: 'yard',  music: 'battle' },
    grove:     { name: 'The Grove',      biome: 'grove',     boss: 'grovekeeper', kind: 'grove', music: 'grove',
                 // FALLING ANCIENT TREES — the grove's ambush trains (user
                 // 2026-07-14: telegraph → lane crush → the trunk LINGERS as
                 // a wall, then crumbles). Paused while the boss lives —
                 // TIMBER is HIS verb. TUNE ME: everything.
                 treeFall: { everyMinMs: 12000, everyMaxMs: 20000, warnMs: 1600,
                             crushDmg: 55, trunkLifeMs: 8000 } },
    // M5.6 THE GRAVEYARD — biome 3. kind:'graveyard' routes the planned layout
    // (gate/fences/plots), the Witching Cycle ambient system, and the corpse
    // pool. `witching` is the conductor config for all four sub-systems; the
    // ambient bell tolls stand down while the boss lives (then become HIS wave
    // opener). TUNE ME: everything.
    graveyard: { name: 'The Graveyard', biome: 'graveyard', boss: 'gravekeeper', kind: 'graveyard', music: 'graveyard',
                 // DESTRUCTIBLE IRON FENCES (balance round 2026-07-15): panel HP
                 // + the mob CHEW — the swarm gnaws panels open (chewDmg per
                 // chewMs while touching), so fences never dead-end the pathing
                 // and a boxed-in player is never safe/starved for long.
                 fence: { hp: 22, chewDmg: 11, chewMs: 420 },
                 witching: {
                   // WITCHING FOG — drifting conceal banks; lamps/candles burn holes.
                   fog: { banks: 3, radius: 150, driftSpeed: 14, concealSelf: true },
                   // RESTLESS GRAVES — a plot cracks (green warn) → hands erupt +
                   // a roster mob claws out. Hands hit mobs too (killMobCredited).
                   graves: { everyMinMs: 12000, everyMaxMs: 18000, warnMs: 1500,
                             handDmg: 12, grabMs: 500, handRadius: 40 },
                   // SOUL WISPS — kills release a soul drifting to the crypt; a
                   // pickup grants a stacking buff; a Banshee that touches one eats it.
                   wisps: { chance: 0.5, driftSpeed: 40, lifeMs: 9000,
                            buff: { hasteMs: 4000, hasteMult: 1.12, healPct: 0.03, maxStacks: 5 } },
                   // THE CURSED BELL — every ~55s three tolls: fog thickens, ALL
                   // field corpses rise, mob eyes flare + speed surge, a grave wave.
                   bell: { everyMs: 55000, tolls: 3, tollGapMs: 900, surgeMs: 2000,
                           surgeMult: 1.2, riseRadius: 9999 }
                 } },
    // M5.7 THE ROBOTICS FACTORY — biome 4. kind:'factory' routes the planned
    // layout (loading bay/assembly floor/foundry), the ambient "alive" props
    // (belts/arms/presses/fans/sparks/smelter), the IN-GROUND CONVEYOR TRAVELATORS
    // (map mechanic), and the 2-phase Grand Engineer boss + custom Prototype Bay
    // arena. `conveyor` is the map-mechanic config; `factoryCycle` conducts the
    // ambient animation cadence (stands down while the boss lives). TUNE ME: all.
    factory: { name: 'The Factory', biome: 'factory', boss: 'engineer', kind: 'factory', music: 'factory',
               // IN-GROUND CONVEYOR TRAVELATORS: moving WITH the belt = speed
               // burst, AGAINST = slowed. push = px/s the belt shoves bodies;
               // withMult/againstMult scale the player's own movement on the belt.
               conveyor: { push: 150, withMult: 1.4, againstMult: 0.6, scrollSpeed: 90 },
               // ambient prop animation cadence (cosmetic; spark bursts + steam)
               factoryCycle: { sparkEveryMs: 700, steamEveryMs: 2600 } }
  },

  // --- M3 (Lane C): tilesets the MAP BUILDER offers. A set = named lists of
  // texture keys per layer (all Lane-A procedural — see textures.js). Imported
  // images (builder Import button) ride along per-map, embedded in the JSON.
  tilesets: {
    grasslands: {
      name: 'Grasslands',
      ground: ['t_grass', 't_grass2', 't_dirt'],
      walls:  ['t_rock', 't_hedge', 't_water'],
      decor:  ['t_flower', 't_shrub', 't_pebble', 't_stump']
    },
    stonehold: {
      name: 'Stonehold',
      ground: ['t_stone', 't_stone2', 't_moss'],
      walls:  ['t_swall', 't_pillar'],
      decor:  ['t_crack', 't_bones', 't_pebble']
    }
  },

  // --- M3: map builder knobs (dev tool — reached with M in the nexus) -------
  builder: {
    panSpeed: 560,              // px/sec camera pan (screen-space)
    zoom: { min: 0.35, max: 3, step: 0.12 },
    newMap: { w: 150, h: 150 }  // default canvas for NEW maps (150×16 = 2400px)
  },

  // --- E6 (M2.1): stage objectives / modes. A portal destination = realm + mode.
  // 'clear' is the classic quota → boss → chest run. 'survival' is the 5-minute
  // time trial (Q8): no boss, survive to the horn, guaranteed potion.
  modes: {
    // color: the mode's portal/ring/pulse tint. Clear is PORTAL GREEN (user
    // call 2026-07-12: blue-on-blue nexus floor was hard to read) — the
    // 'portal' texture is neutral greyscale and always tinted by purpose.
    clear:    { name: 'REALM CLEAR', desc: 'kills open the boss portal', color: 0x49e83b },
    survival: { name: 'TIME TRIAL', desc: 'survive 5:00 — the swarm never stops',
                color: 0xffcd75, durationSec: 300, xpBonus: 250, potionReward: true,
                lootTable: 'trial' }   // M3: the trial chest rolls pocket-change gear
  },

  // --- M3.5: THE PORTAL WORKS (user redesign 2026-07-12, supersedes the E5
  // pedestal plaza). ONE platform at the heart of the nexus, hard-wired to the
  // REALM CONSOLE by an energy conduit. No portal exists until you configure a
  // run at the console: pick a mode, slot map affixes, SPAWN. The console then
  // POWERS the platform — pulses race up the conduit, the ring lights ignite in
  // the mode's color, and the portal tears open. It is ONE-SHOT — consumed on
  // entry, the works go dark; walk back to the console for the next run.
  // Affixes on the board are a PREVIEW: toggleable + visible on the portal/
  // realm HUD, but INERT until M5 flips live:true (risk=reward by playtest).
  console: {
    name: 'PORTAL MACHINE',      // renamed from REALM CONSOLE (user, 2026-07-12)
    // (dead `hotkey`/`prompt` removed 2026-07-13 — the P hotkey is the rebindable
    //  'portal' action in DATA.keybinds; the footer prompt is built from BINDS.)
    maxAffixes: 3,               // slots on the board
    affixChoices: ['apex', 'escalating', 'hordes'],   // keys into affixes.map
    modes: ['clear', 'survival'],                     // spawnable destinations
    // --- M4.9 (user, 2026-07-14): MAP SELECTOR dropdown. One real, playable
    // destination right now — THE TRAIN YARD (the live realm) — plus greyed
    // ??? placeholders that unlock as maps get built in the in-game builder.
    // Only `locked:false` maps are selectable; the selection rides in the
    // portal cfg (consoleMap) for when multiple realms go live. A new map =
    // flip locked:false + wire its biome/boss, no new UI code.
    maps: [
      { id: 'trainyard', name: 'THE TRAIN YARD', sub: 'the Conductor holds the line', locked: false },
      // M5.0 (user, 2026-07-15): THE GROVE goes live — second real destination.
      { id: 'grove',     name: 'THE GROVE',      sub: 'the Grovekeeper tends his garden', locked: false },
      // M5.6: THE GRAVEYARD — third real destination. locked until the biome's
      // full battery is green (flip to false at ship + bump ?v=).
      { id: 'graveyard', name: 'THE GRAVEYARD',  sub: 'the Gravekeeper keeps the hollow earth', locked: false },
      // M5.7: THE ROBOTICS FACTORY — fourth real destination. locked until the
      // biome's full battery is green (flip to false at ship + bump ?v=).
      { id: 'factory',   name: 'THE FACTORY',    sub: 'the Grand Engineer runs the line', locked: false },
      { id: 'sealed4',   name: '??? — SEALED',   sub: 'build it in the map builder (M)', locked: true },
      { id: 'sealed5',   name: '??? — SEALED',   sub: 'build it in the map builder (M)', locked: true }
    ],
    // v5 (2026-07-17): FIRST-PLAYTHROUGH loop config.
    startTokens: 3,              // reroll tokens the campaign begins with
    legendaryCost: 30,           // v6 (2026-07-19, Red): map tokens to buy a LEGENDARY UNLOCK at the vault
    // Per-region SPECIAL MECHANICS — shown on the discovery card when a corruption
    // is found, and on hover in the scanner (item 9). One or two short lines each.
    mech: {
      trainyard:   'THE SCHEDULE BOARD lights the tracks — the ghost express one-shots anything on the rails when the whistle blows. Clear the line.',
      grove:       'THE GROVEKEEPER grows from the heartwood. TIMBER walls and thorn mortar box you in — and you must kill him TWICE, his pixies revive him.',
      graveyard:   'THE FOG rolls in and blinds your sightline. THE BELL TOLLS on a cycle — every toll drags the buried up to swarm you.',
      factory:     'THE CONVEYOR BELTS drag you off your aim. The Grand Engineer purges the reactor in telegraphed vents — read the floor.',
      skyisles:    'LOW GRAVITY — long floaty jumps between crumbling islands while the tempest circles the archipelago.',
      pyramid:     'QUICKSAND pits swallow the careless, and every treasure you grab carries a curse.',
      castle:      'A perpetual BLOOD MOON feeds the swarm. The Pale Rider hunts the halls between the feedings.',
      lunar:       'LOW-G vacuum station — the airlocks cycle and SPECIMEN ZERO stirs where the virus first woke.',
      pirate:      'THE DECK ROCKS underfoot, sliding every shot you fire, while broadsides rake the boards.',
      crystal:     'A GROWING CRYSTAL slowly closes the arena; shattered shards ricochet through the cave.',
      carnival:    'The rigged GAME BOOTHS turn on you one by one — the Ringmaster runs the whole show.',
      swamp:       'HEX TOTEMS curse the mire; poison fog rises and the mud drags you under.',
      west:        'HIGH-NOON showdowns in the dust — and the Noon Express barrels straight down Main Street.',
      colosseum:   'A ROUND arena — no edge wrap, nowhere to run. DIVINITY HIMSELF judges each escalating wave.',
      abyss:       'THE UNDERTOW drags you toward the trench. Smash the destructible coral for lanes, or drown in the dark.',
      sugar:       'Candy drops FULL-HEAL you and the fences shatter — SUGAR BEAR guards the stash (a guaranteed epic weapon the first time he falls).',
      neon:        'THE GRID blacks out in pulses — stay lit, stay moving. The Social Engineer talks your defenses down.',
      viceversa:   'A HELL / HOLY split with faction warfare and a DOUBLE BOSS — the leash will not let you flee the fight.',
      prehistoria: 'A METEOR SHOWER rains fire and THE HATCH spills fresh dino swarms as THE PRIMORDIAL wakes.',
      belly:       'PATIENT ZERO. The Titan Whale swallowed the way in — stationary but merciless, riding the digestion tide. The end of the line.'
    },
    live: false                  // M5: flip to make slotted affixes mutate the realm
  },

  // --- Q6 (M2.1): contextual interaction — SPACE interacts when something is
  // in range, otherwise it fires the ability. One knob, tested at Fun Gate 1.
  // portalRange (M3 polish): a SPAWNED portal is SPACE-activated too — walk up,
  // read the pedestal (mode + slotted affixes), THEN commit.
  interact: { range: 52, portalRange: 74, consoleRange: 80 },

  // --- E9 (M2.1): THE AFFIX ENGINE. An affix is a bag of multipliers/flags,
  // applied at spawn (mob) or realm entry (map). Scenes/entities only apply
  // what this data says (ARCHITECTURE.md §7).
  affixes: {
    mobRollChance: 0.06,        // chance any director spawn comes up champion
    // M3 (affix engine v2): every champion kill adds a bounty roll to the
    // realm's boss chest (capped) — affixed mobs literally drop better.
    championBounty: { perKill: 1, cap: 3, table: 'champion' },
    mob: {
      tanky:    { name: 'TANKY',  tint: 0x94b0c2, scale: 1.5,  hpMult: 2.6, spdMult: 0.8, xpMult: 2.5 },
      speedy:   { name: 'SPEEDY', tint: 0xffcd75, scale: 1.15, hpMult: 1.2, spdMult: 1.6, xpMult: 1.8 },
      // un-gated at M3 (affix engine v2) — behaviors live in entities/scenes:
      // SPLITTING: only rolls on shooters; each bolt splits mid-flight.
      split:    { name: 'SPLITTING', tint: 0xff77a8, hpMult: 1.3, xpMult: 2.2,
                  splitShots: 2, splitAngleDeg: 28 },
      // EVOLVING: surviving a hit can trigger a one-time evolution (fresh
      // bigger HP pool, faster, worth more) — kill it BEFORE it turns.
      evolving: { name: 'EVOLVING',  tint: 0x38b764, hpMult: 1.4, xpMult: 3, evolveChance: 0.25,
                  evolve: { hpMult: 2.4, spdMult: 1.2, xpMult: 2, scaleMult: 1.3 } },
      // PACK LEADER: while one lives, the director skews spawns to casters.
      roles:    { name: 'PACK LEADER', tint: 0x41a6f6, hpMult: 1.5, xpMult: 2, roleSkew: 'caster' }
    },
    // map affixes are slotted at the REALM CONSOLE (M3.5 preview board) and —
    // once DATA.console.live flips at M5 — mutate the realm config. Until then
    // they ride along visibly (portal label, realm HUD) but change nothing.
    map: {
      apex:       { name: 'APEX PREDATORS',    desc: 'double bosses',      tint: 0xb13e53, bossCount: 2,        m5: true },
      escalating: { name: 'ESCALATING THREATS', desc: 'elite spawns surge', tint: 0xffcd75, mobRollChanceMult: 4, m5: true },
      hordes:     { name: 'HORDES',            desc: 'high spawn density', tint: 0xff77a8, spawnIntervalMult: 0.6, budgetMult: 1.5, m5: true }
    }
  },

  // --- E1 (M2.1): loot chests. The boss drops one; SPACE opens it; a PoE2-style
  // selection overlay lists the contents. Rewards are BANKED AND PERSISTED at
  // open time (same invariant as permadeath) — the overlay is pacing + display;
  // per-item choice becomes real when equipment lands at M3.
  chest: { promptText: 'SPACE  open chest' },

  // --- E3 (M2.1): boss scouter workup sheet — tactical hints per pattern.
  // A new boss brings its own hints; the overlay code never changes.
  // (hints live on each boss below)

  // --- Bosses (M2, Fusion Law F8). Same data-driven idea as mobs: patterns
  // are data; a new boss = a new object here until it needs a new verb. -------
  bosses: {
    // M5.0 REWORK (user, 2026-07-15): the Grovekeeper gets the Conductor
    // treatment for THE GROVE — arrival cinematic (THE HEARTWOOD WAKES: he
    // steps out of the arena's great tree), GROVE VERBS owned by the scene
    // (RealmScene.grovekeeperUpdate), the old radial/stream kept as reflavored
    // filler (PETAL BURST pink / NEEDLE VOLLEY green — tinted orbs), and a
    // PHASE TWO: on his first "death" a swarm of pixies flies in and
    // RESURRECTS him — you kill him twice (kill the pixies mid-channel to
    // gut the revive). ALL boss damage passes fromBoss=true. TUNE ME: all.
    grovekeeper: {
      name: 'The Grovekeeper', texture: 'boss1',
      hp: 1400, spd: 42, xp: 260, contactDmg: 22, deathTint: 0x38b764,
      lootTable: 'grovekeeper',        // M3: the chest rolls items from this table
      treeArrival: { shakeMs: 900, splitMs: 800, stepMs: 700 },   // THE HEARTWOOD WAKES
      patterns: {
        radial: { count: 24, dmg: 12, projSpeed: 165, lifeMs: 3400, everyMs: 2600,
                  tint: 0xff9ec2, texture: 'orbShot' },           // PETAL BURST
        stream: { shots: 7,  dmg: 10, projSpeed: 300, lifeMs: 2400, gapMs: 110, everyMs: 3400,
                  tint: 0x8ff0a5, texture: 'orbShot' },           // NEEDLE VOLLEY
        // GROVE VERBS (scene-owned, dispatched from updateBoss like the
        // Conductor's train verbs):
        //  · timber — HIS ghost train: an ancient tree crashes across the
        //    player's lane (extreme dmg, one-shots the ungeared); the trunk
        //    LINGERS as a wall he can pin you against.
        //  · mortar — seed-pod lobs onto marked circles; each burst leaves a
        //    BRIER patch that keeps ticking (slime-patch tech).
        //  · overgrowth — vines grip your ankles (player slow window).
        //  · sunlance — the canopy parts; a golden beam sweeps a slow arc.
        //  · sporeSurge — he stomps; a ring of mini puffcaps sprouts around
        //    you (uses the split-children, so the swarm stays cheap).
        timber:     { everyMs: 11000, warnMs: 1600, dmg: 200, trunkLifeMs: 6000 },
        mortar:     { everyMs: 6200, count: 3, warnMs: 950, flightMs: 650, radius: 52,
                      dmg: 24, scatter: 150, brier: { lifeMs: 3000, dmg: 5, tickMs: 480 } },
        overgrowth: { everyMs: 13000, durMs: 2400, slowMult: 0.55 },
        sunlance:   { everyMs: 9500, durMs: 2600, degPerSec: 90, length: 430, halfDeg: 10, tickMs: 220, dmg: 13 },
        sporeSurge: { everyMs: 14000, count: 6, ring: 150 }
      },
      // PHASE TWO (user: "a bunch of fairies come resurrect him after 1 death
      // ... like a cinematic but with ingame mobs"): real pixie mobs fly in
      // and channel the revive — every one you kill before it lands cuts the
      // restored HP (floor basePct). He rises FASTER (spdMult/rateMult).
      phaseTwo: { pixies: 8, channelMs: 3500, basePct: 0.3, perPixiePct: 0.055,
                  spdMult: 1.15, rateMult: 0.85 },
      title: 'WARDEN OF THE HEARTWOOD',
      hints: [
        'TIMBER — a shadow stripes the clearing and the wood GROANS. Move. The ungeared do not survive the fall — and the trunk stays.',
        'THORN MORTAR — marked circles sprout briers. The burst hurts; the patch keeps hurting.',
        'OVERGROWTH — vines take your ankles and the grove sets your pace. Pre-position.',
        'SUNLANCE — a golden beam sweeps the clearing. Circle the keeper, stay in the shade.',
        'PETAL BURST / NEEDLE VOLLEY — his old ring and stream, still deadly. Slip the gaps, strafe the needles.',
        'When he falls, the pixies come. Kill them before the bloom completes — or fight him twice at full strength.'
      ]
    },
    // M4.7 — THE CONDUCTOR (user design 2026-07-14): master of the Styx
    // Express, the train yard's true owner. ARRIVES ON HIS TRAIN when you
    // first enter the boss arena (arrival cinematic — RealmScene.conductorArrival)
    // and fights with TRAIN VERBS, all scene-owned (RealmScene.conductorUpdate):
    //  · ghostTrain — summons a GHOST TRACK through your position (telegraphed
    //    like the ambush train: horn + materializing rails), then a spectral
    //    consist barrels down it. EXTREME damage (user: "insta kill if no gear
    //    on") — a raw hit no fresh hero survives; HP/DEF gear + potions can.
    //  · ties — lobs spinning RAILROAD TIES onto marked ground circles (AoE).
    //  · schedule — snaps THE POCKET WATCH: your movement runs on HIS time
    //    (player slowMult for durMs; the yellow tick VFX).
    //  · lantern — sweeps the ghost-lantern beam in a slow arc; standing in
    //    it ticks damage. Rotate around him while it burns.
    // All pattern clocks are ABSOLUTE and must ride the unfreeze() shift list.
    // TUNE ME: everything here, by playtest.
    conductor: {
      name: 'The Conductor', texture: 'conductorHi',
      hp: 1500, spd: 34, xp: 250, contactDmg: 24, deathTint: 0x8fd6ff,
      lootTable: 'conductor',
      arrival: { runInMs: 1800, puffMs: 450, stepOffMs: 550, cars: 5 },   // the Styx Express pulls in
      patterns: {
        ghostTrain: { everyMs: 9500, warnMs: 1400, speed: 800, dmg: 200, carMin: 3, carMax: 8 },
        ties:       { everyMs: 5600, count: 3, warnMs: 950, flightMs: 650, radius: 52, dmg: 26, scatter: 150 },
        schedule:   { everyMs: 13000, durMs: 2400, slowMult: 0.55 },
        lantern:    { everyMs: 9200, durMs: 2600, degPerSec: 95, length: 430, halfDeg: 10, tickMs: 220, dmg: 13 }
      },
      title: 'MASTER OF THE STYX EXPRESS',
      hints: [
        'GHOST TRACK — rails form under your feet, a horn sounds. MOVE. The ghost express kills the ungeared outright.',
        'RAILROAD TIES — marked circles on the gravel. Step out before the timber lands.',
        'THE SCHEDULE — his watch snaps and your legs run on his time. Pre-position before you slow.',
        'LANTERN SWEEP — a ghost-blue beam arcs across the yard. Circle him, never stand in the light.'
      ]
    },
    // M5.6 — THE GRAVEKEEPER (user design 2026-07-15, concept art = canon):
    // biome-3 boss. CLIMBS OUT OF A GRAVE at the arena center (graveArrival).
    // Core loop (RealmScene.gravekeeperUpdate): he is IMMUNE while a minion wave
    // lives (ward-guard tech → 'IMMUNE' popup); FIVE waves; each cleared wave
    // strips 20% of his max HP. During the fight the Cursed Bell becomes HIS —
    // each toll opens the next wave. REAPER'S MARCH fires once: a Grim Reaper
    // rises at the map edge and crawls at the player forever — touch = instant
    // death (fromBoss). Necronomicon verbs are scene-owned; all clocks ride the
    // unfreeze() shift list. Every source passes fromBoss=true. TUNE ME: all.
    gravekeeper: {
      name: 'The Gravekeeper', texture: 'gravekeeperHi',
      hp: 1600, spd: 40, xp: 280, contactDmg: 22, deathTint: 0x78ff96,
      lootTable: 'gravekeeper',
      graveArrival: { rumbleMs: 900, crackMs: 700, climbMs: 900 },   // he hauls himself out of the dirt
      // WAVE-IMMUNITY LOOP — 5 waves; clearing one strips hpChunkPct of maxHP.
      // Each wave is a queued spawn set (keys + count). He can't be hurt until
      // the living wave is annihilated (env kills DO count — the wave must die).
      waves: {
        count: 5, hpChunkPct: 0.2, immunePopup: 'IMMUNE',
        sets: [
          { label: 'RATTLE', spawn: [{ key: 'rattlebones', n: 10 }] },
          { label: 'HUNT',   spawn: [{ key: 'ghoul', n: 4 }, { key: 'boneArcher', n: 3 }] },
          { label: 'ROT',    spawn: [{ key: 'corpseBloater', n: 3 }, { key: 'banshee', n: 2 }] },
          { label: 'STONE',  spawn: [{ key: 'tombGolem', n: 2 }, { key: 'mummy', n: 3 }] },
          { label: 'RITE',   spawn: [{ key: 'necroAcolyte', n: 2 }, { key: 'ghoul', n: 3 }, { key: 'rattlebones', n: 5 }] }
        ]
      },
      // REAPER'S MARCH — rises WHEN YOU REACH HIM (a short beat into the fight),
      // in a corner, with a camera reveal (Red: he never saw it till near death).
      // It's the whole-fight DREAD TIMER, so it starts early and never stops.
      reaper: { key: 'graveReaper', delayMs: 1600, spd: 26, touchKills: true },
      // COWARD MOVEMENT (Red): the Gravekeeper does NOT relentlessly chase — he
      // skulks behind his minions, FLEES if you get too close, and only ambles
      // back if you drift far. This is what lets the chasing minions separate
      // from him. TUNE ME.
      skulk: { fleeNear: 230, driftFar: 560, fleeMult: 1.4, holdMult: 0.6 },
      // Necronomicon verbs (scene-owned, dispatched from gravekeeperUpdate;
      // clocks absolute → unfreeze list). Reflavors of proven tech:
      //  · explodeCorpse — detonates field corpses in chained AoE bursts.
      //  · boneStorm — radial shard ring (grovekeeper radial reflavor).
      //  · graspingHands — hands erupt from telegraphed circles (mortar tech).
      //  · curseSigils — rune circles bloom then blast (brier-patch variant).
      //  · soulVolley — aimed green orb stream (filler).
      patterns: {
        // SOUL VOLLEY (aimed green stream) + BONE STORM (radial bone ring) ride
        // the generic boss radial/stream driver (Entities.updateBoss) so they
        // fire without bespoke code; the three telegraphed verbs below are
        // scene-owned (RealmScene.gravekeeperUpdate). `waves` marks him for the
        // wave-immunity dispatch. All verb clocks ride the unfreeze() list.
        stream:        { shots: 7, dmg: 11, projSpeed: 300, lifeMs: 2400, gapMs: 110, everyMs: 3400,
                         tint: 0x8ff0a5, texture: 'orbShot' },       // SOUL VOLLEY
        radial:        { count: 22, dmg: 12, projSpeed: 170, lifeMs: 3400, everyMs: 2800,
                         tint: 0xe6dcc0, texture: 'orbShot' },       // BONE STORM
        explodeCorpse: { everyMs: 7000, radius: 74, dmg: 26, chain: 3, warnMs: 700 },
        graspingHands: { everyMs: 6400, count: 3, warnMs: 900, radius: 54, dmg: 24, grabMs: 600, scatter: 150 },
        curseSigils:   { everyMs: 8000, count: 3, warnMs: 950, radius: 52,
                         sigil: { lifeMs: 3000, dmg: 5, tickMs: 480 } }
      },
      title: 'KEEPER OF THE HOLLOW EARTH',
      hints: [
        'HE CLIMBS FROM THE GRAVE — and cannot be touched while a wave walks. Clear the wave; each one you break strips a fifth of his life.',
        "REAPER'S MARCH — a reaper rises at the edge and never stops coming. Its touch is death. Keep the whole yard between you.",
        'EXPLODE CORPSE — the bodies you leave are his bombs. Fight where the ground is clean.',
        'GRASPING HANDS / CURSE SIGILS — marked circles erupt into hands and rune-blasts. Read the ground, step off the marks.',
        'BONE STORM / SOUL VOLLEY — a shard ring and a green stream. Slip the gaps, strafe the volley.',
        'THE BELL IS HIS NOW — every toll opens the next wave. When it rings, brace.'
      ]
    },
    // M5.7 — THE GRAND ENGINEER; PHASE 2 REWORKED M6e (Red 2026-07-15). Phase 1 =
    // engineer on foot (floor lift), ranged, operates the ROOM (presses / arc
    // ring / turrets / adds). NO stream/radial — Red: "all bosses do the machine
    // gun burst and the projectile aoe, im tired of seeing that" — this boss
    // fires NO generic filler (driver now guards missing keys). Coolant slow-
    // pools REMOVED from the whole fight (Red). On first death: the TRANSFORM
    // cutscene → PROTOTYPE 130C-4. Phase 2 = THE WALKING FACTORY: ZERO
    // projectiles — every attack is a TELEGRAPHED GROUND SHAPE (lane / circles /
    // cone / square waves) with time to react (Red's design riffs). Signature =
    // REACTOR PURGE: a huge circle around the mech, 3.4s to RUN OUT of it, then
    // it VENTS — rooted + takes bonus damage (the punish window). FLOOR STAMP =
    // checkerboard square waves, "stand between the two waves" (Red's idea).
    // All verbs scene-owned (RealmScene.engineerUpdate); every clock rides
    // unfreeze(); every source passes fromBoss=true. TUNE ME: sim-tuned m6e.
    engineer: {
      name: 'The Grand Engineer', texture: 'engineerHi',
      hp: 2000, spd: 40, xp: 320, contactDmg: 20, deathTint: 0xffcd45,
      lootTable: 'engineer',
      floorLift: { rumbleMs: 900, riseMs: 1500 },        // rises through the floor on a hydraulic lift
      // PHASE-2 mech "PROTOTYPE 130C-4": visuals + stats + BODY swapped at the
      // cutscene (bodyW/H = world-px hitbox, matches the big sprite — fix for
      // "hitting the boss and it does no damage").
      mech: { texture: 'mechHi', spdMult: 1.7, contactDmg: 30, scale: 1.5, deathTint: 0xb13e53,
              bodyW: 80, bodyH: 88 },
      phaseTwo: { channelMs: 3200, spdMult: 1.7, rateMult: 0.9 },
      patterns: {
        // ---- PHASE-1 room verbs (all telegraphed; no bullet filler) ----
        pressSlam:    { everyMs: 4600, count: 3, warnMs: 1100, radius: 64, dmg: 26, gapMs: 420 },
        arcDischarge: { everyMs: 7000, warnMs: 900, dmg: 22, ringSpeed: 280, band: 60, maxR: 560 },
        turretDeploy: { everyMs: 10000, turrets: 2, durMs: 8000, fireMs: 1000, dmg: 10, projSpeed: 280 },
        callLine:     { everyMs: 12000, count: 2, keys: ['sparkbot', 'hiveDrone'], cap: 4 },
        // ---- PHASE-2 mech verbs — TELEGRAPHED ZONES ONLY, no projectiles ----
        // DRILL CHARGE (kept per Red, longer telegraph): red lane flashes 1.5s,
        // the mech revs in place, then dashes it. Step OUT of the lane.
        drillCharge:   { everyMs: 7000, warnMs: 1500, dmg: 30, len: 560, half: 36, dashMs: 560 },
        // SCRAP LOB: 4 marked impact circles near you (1.4s) — walk out.
        scrapLob:      { everyMs: 6200, lobs: 4, warnMs: 1400, radius: 72, dmg: 22, scatter: 200 },
        // EXHAUST CONE: a flame cone locks its direction at cast (1.2s) — sidestep.
        exhaustCone:   { everyMs: 7800, warnMs: 1200, range: 340, halfDeg: 46, dmg: 20 },
        // FLOOR STAMP (Red: "square … stand between two waves"): checkerboard
        // tiles flash + blow in TWO alternating waves — stand on the other wave.
        floorStamp:    { everyMs: 11000, tile: 120, cols: 5, rows: 4, warnMs: 1300, dmg: 20 },
        // CONVEYOR OVERRIDE: the belts surge red — the floor itself misbehaves.
        conveyorOverride: { everyMs: 14000, durMs: 6000, mult: 2.2 },
        // SIGNATURE — REACTOR PURGE: rooted, a huge warning circle around the
        // mech, RUN OUT before it blows; then it VENTS: rooted + bonus damage.
        reactorPurge:  { everyMs: 15000, chargeMs: 3400, radius: 500, dmg: 55,
                         ventMs: 3500, ventDmgMult: 1.5, firstDelayMs: 8000 },
        overclock:     { hpPct: 0.35, spdMult: 1.25, rateMult: 0.75 }
      },
      title: 'MASTER OF THE ASSEMBLY LINE',
      hints: [
        'HE RIDES UP ON THE LIFT — ranged, never melees, and makes the ROOM attack: presses, an arc ring, turrets, called help.',
        'THE ARC RING blooms from him and dies out around 560 — RUN AWAY from it and it fizzles before it reaches you.',
        'KILL HIM ONCE AND HE BOARDS 130C-4 — the mech HUNTS. It never shoots: every attack paints the FLOOR first. Trust the paint.',
        'LANE = drill charge (step aside). CIRCLES = falling scrap (walk out). CONE = exhaust burn (sidestep the wedge).',
        'FLOOR STAMP — the tiles blow in TWO alternating waves. Stand on the wave that already fired, between the two.',
        'REACTOR PURGE — a huge circle grows around the rooted mech. GET OUT of it; when it vents, it sits helpless — unload on the core.'
      ]
    }
  },

  // --- M3: EQUIPMENT. Four slots per character (weapon/ability/armor/ring),
  // T0–T3 item tiers. An item = a row here; an item INSTANCE is just its key
  // (no rolled stats — tiers are fixed), so saves/vault store plain strings.
  // Effects: `bonus` = flat stat adds applied AFTER cap clamping (gear pushes
  // past caps — that's why it matters at level 20); `mod` = weapon dmg add or
  // ability mpCost/count deltas (see SIM.weaponMod/abilityFor).
  // Equipment lives on the CHARACTER (dies with it — R5 mirror of potionsDrunk);
  // the VAULT (account, 8 slots) is how an item outlives its finder.
  equipSlots: ['weapon', 'ability', 'armor', 'ring'],
  // M4.6 (user, 2026-07-14): SIX rarity tiers now — grey → white → green →
  // blue → purple → ORANGE (legendary). Item KEYS were renumbered to match
  // (0..5 in tier order); save.js migrates v3 saves' old keys forward
  // losslessly (Oak Bow is still Oak Bow — it just lives at index 2 now).
  // rarity ladder (user's exact words): grey ABUNDANT · white COMMON · green
  // UNCOMMON · blue RARE · purple EPIC · orange LEGENDARY (very rare — boss
  // chests only, sub-1% per roll). `rarity` shows in item labels.
  tiers: [
    { name: 'T0', rarity: 'ABUNDANT',  color: 0x94b0c2 },   // grey
    { name: 'T1', rarity: 'COMMON',    color: 0xf4f4f4 },   // white
    { name: 'T2', rarity: 'UNCOMMON',  color: 0x38b764 },   // green
    { name: 'T3', rarity: 'RARE',      color: 0x41a6f6 },   // blue
    { name: 'T4', rarity: 'EPIC',      color: 0x8f3fb5 },   // purple
    { name: 'T5', rarity: 'LEGENDARY', color: 0xff8c2e }    // orange
  ],
  vault: { slots: 24 },   // M5.3 (user): 24 = a full single-class gear ladder (6 weapons + 6 abilities + 6 armor + 6 rings) fits

  // --- M5.5 (user): COLLECTION. Every gear item you obtain is COLLECTED once
  // (account.collected — survives death). A chest roll that lands an item you
  // already own does NOT drop it again; instead it pays BONUS XP by rarity
  // (dupeXp[tier], grey→…→orange). Collected gear is your permanent kit: it
  // AUTO-UPGRADES when you find a better piece and REMAINS across death (a
  // fresh hero auto-equips your best owned gear into empty slots). TUNE ME.
  collection: { dupeXp: [40, 80, 160, 320, 640, 1280] },
  // M4.6 CLASS-LOCKED GEAR (user, 2026-07-14): weapon + ability items belong
  // to a CLASS now (`cls`) — RotMG-style lines: bows/quivers (Ranger),
  // staves/tomes (Wizard), greatswords/war horns (Knight). Armor + rings stay
  // universal (no cls). Chests NEVER drop off-class gear (drop tables keep
  // their generic ranger keys as the WEIGHT template; SIM.resolveDrop remaps
  // each rolled key to the roller's class line via DATA.classGear — same slot,
  // same tier, same RNG stream). Off-class items can still surface via the
  // account-wide VAULT — they display with a class tag and REFUSE to equip
  // (equipFromVault guard + save.js sanitize).
  // Weapon flat-dmg per tier is 3/6/10/15 for wizard/knight vs the bow's
  // 2/4/7/11 — bigger base hits + slower cadence mean a flat add is worth
  // less per point, so the lines land at roughly equal DPS gain.
  items: {
    // RANGER weapons (bows) — mod.dmg adds to the weapon's base damage per shot
    w0: { name: 'Worn Shortbow',    slot: 'weapon',  tier: 0, texture: 'bow', cls: 'ranger',
          mod: { dmg: 2 },  desc: '+2 weapon damage' },
    w1: { name: 'Yew Shortbow',     slot: 'weapon',  tier: 1, texture: 'bow', cls: 'ranger',
          mod: { dmg: 3 },  desc: '+3 weapon damage' },
    w2: { name: 'Oak Bow',          slot: 'weapon',  tier: 2, texture: 'bow', cls: 'ranger',
          mod: { dmg: 5 },  desc: '+5 weapon damage' },
    w3: { name: "Hunter's Recurve", slot: 'weapon',  tier: 3, texture: 'bow', cls: 'ranger',
          mod: { dmg: 8 },  bonus: { dex: 2 }, desc: '+8 weapon damage · +2 DEX' },
    // M5.1 (user): the ranger's EPIC bow gives UNLIMITED ENERGY and upgrades
    // the REGULAR ATTACK to his special (every basic shot fires the FIRE
    // VOLLEY). With the FULL LEGENDARY SET the arrows turn EXPLOSIVE and the
    // fan tightens into a SHOTGUN — overlapping blasts stack ("very OP" is
    // the set's whole identity, matching the knight + wizard kits).
    w4: { name: 'Grovepiercer',     slot: 'weapon',  tier: 4, texture: 'bow', cls: 'ranger',
          mod: { dmg: 11, volleyShot: true, freeEnergy: true }, bonus: { dex: 4 },
          desc: '+11 weapon damage · +4 DEX · UNLIMITED energy · basic shots fire the VOLLEY' },
    w5: { name: 'Phoenix Longbow',  slot: 'weapon',  tier: 5, texture: 'bow', cls: 'ranger',
          mod: { dmg: 15, volleyShot: true, freeEnergy: true }, bonus: { dex: 6 },
          desc: '+15 weapon damage · +6 DEX · UNLIMITED energy · basic shots fire the VOLLEY' },
    // RANGER ability items (quivers) — mod.mpCost / mod.count adjust the volley
    a0: { name: 'Cracked Quiver',   slot: 'ability', tier: 0, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -2 },            desc: 'volley costs 2 less energy' },
    a1: { name: 'Waxed Quiver',     slot: 'ability', tier: 1, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -3 },            desc: 'volley costs 3 less energy' },
    a2: { name: 'Leather Quiver',   slot: 'ability', tier: 2, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -4 },            desc: 'volley costs 4 less energy' },
    a3: { name: "Hunter's Quiver",  slot: 'ability', tier: 3, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -4, count: 2 },  desc: '+2 volley arrows · costs 4 less energy' },
    a4: { name: 'Storm Quiver',     slot: 'ability', tier: 4, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -6, count: 4 },  bonus: { mp: 20 },
          desc: '+4 volley arrows · costs 6 less energy · +20 ENERGY' },
    a5: { name: 'Phoenix Quiver',   slot: 'ability', tier: 5, texture: 'quiver', cls: 'ranger',
          mod: { mpCost: -8, count: 6 },  bonus: { mp: 40 },
          desc: '+6 volley arrows · costs 8 less energy · +40 ENERGY' },
    // WIZARD weapons (staves) — bigger flat adds than bows (slower cadence,
    // harder base hit → a flat point is worth less; lines land at ~equal DPS gain)
    ww0: { name: 'Splintered Staff', slot: 'weapon', tier: 0, texture: 'staff', cls: 'wizard',
           mod: { dmg: 3 },  desc: '+3 weapon damage' },
    ww1: { name: 'Hazel Staff',      slot: 'weapon', tier: 1, texture: 'staff', cls: 'wizard',
           mod: { dmg: 5 },  desc: '+5 weapon damage' },
    ww2: { name: 'Ashwood Staff',    slot: 'weapon', tier: 2, texture: 'staff', cls: 'wizard',
           mod: { dmg: 8 },  desc: '+8 weapon damage' },
    ww3: { name: 'Runebound Staff',  slot: 'weapon', tier: 3, texture: 'staff', cls: 'wizard',
           mod: { dmg: 11 }, bonus: { dex: 2 }, desc: '+11 weapon damage · +2 DEX' },
    // M5.1 (user): the wizard's EPIC rod turns the STORM BARRAGE into HOMING
    // MISSILES (mod.homing → proj.homing; balls steer to the nearest enemy).
    // The legendary keeps it — and with the FULL LEGENDARY SET the machine
    // gun fires ALL DIRECTIONS at once, every ball homing ("intended to be
    // very OP" — the set is a sub-1%-per-slot chase).
    ww4: { name: 'Starfall Rod',     slot: 'weapon', tier: 4, texture: 'staff', cls: 'wizard',
           mod: { dmg: 15, homing: true }, bonus: { dex: 4 },
           desc: '+15 weapon damage · +4 DEX · barrage balls HOME to the enemy' },
    ww5: { name: 'Sunflare Scepter', slot: 'weapon', tier: 5, texture: 'staff', cls: 'wizard',
           mod: { dmg: 20, homing: true }, bonus: { dex: 6 },
           desc: '+20 weapon damage · +6 DEX · barrage balls HOME to the enemy' },
    // WIZARD ability items (tomes) — EFFICIENCY: mod.mpPerShot cuts the
    // barrage's per-ball cost (floor 0.5 in SIM.abilityFor — never free)
    wa0: { name: 'Dog-eared Primer',    slot: 'ability', tier: 0, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.1 },  desc: 'barrage balls cost 0.1 less MP' },
    wa1: { name: "Scribe's Notes",      slot: 'ability', tier: 1, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.15 }, desc: 'barrage balls cost 0.15 less MP' },
    wa2: { name: 'Apprentice Grimoire', slot: 'ability', tier: 2, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.25 }, desc: 'barrage balls cost 0.25 less MP' },
    wa3: { name: 'Conduit Codex',       slot: 'ability', tier: 3, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.35 }, desc: 'barrage balls cost 0.35 less MP' },
    wa4: { name: 'Stormbound Folio',    slot: 'ability', tier: 4, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.5 },  bonus: { mp: 20 },
           desc: 'barrage balls cost 0.5 less MP · +20 MP' },
    wa5: { name: 'Codex of the Tempest', slot: 'ability', tier: 5, texture: 'tome', cls: 'wizard',
           mod: { mpPerShot: -0.65 }, bonus: { mp: 40 },
           desc: 'barrage balls cost 0.65 less MP · +40 MP' },
    // KNIGHT weapons (greatswords) — same ladder as staves
    kw0: { name: 'Notched Greatsword', slot: 'weapon', tier: 0, texture: 'sword', cls: 'knight',
           mod: { dmg: 3 },  desc: '+3 weapon damage' },
    kw1: { name: "Squire's Blade",     slot: 'weapon', tier: 1, texture: 'sword', cls: 'knight',
           mod: { dmg: 5 },  desc: '+5 weapon damage' },
    kw2: { name: 'Iron Greatsword',    slot: 'weapon', tier: 2, texture: 'sword', cls: 'knight',
           mod: { dmg: 8 },  desc: '+8 weapon damage' },
    kw3: { name: 'Bloodletter',        slot: 'weapon', tier: 3, texture: 'sword', cls: 'knight',
           mod: { dmg: 11 }, bonus: { dex: 2 }, desc: '+11 weapon damage · +2 DEX' },
    // M5.1 (user): the knight's EPIC blade sweeps a FULL CIRCLE — mod.arcDeg
    // OVERRIDES the sword's swing arc (SIM.weaponMod → meleeSwing). The
    // legendary keeps it (a T5 never loses a T4's trick).
    kw4: { name: 'Ragefang',           slot: 'weapon', tier: 4, texture: 'sword', cls: 'knight',
           mod: { dmg: 15, arcDeg: 360 }, bonus: { dex: 4 },
           desc: '+15 weapon damage · +4 DEX · the cleave sweeps a FULL CIRCLE' },
    kw5: { name: 'Worldsplitter',      slot: 'weapon', tier: 5, texture: 'sword', cls: 'knight',
           mod: { dmg: 20, arcDeg: 360 }, bonus: { dex: 6 },
           desc: '+20 weapon damage · +6 DEX · the cleave sweeps a FULL CIRCLE' },
    // KNIGHT ability items (war horns) — EFFICIENCY: mod.mpDrainPerSec cuts
    // the whirlwind's rage drain (floor 6 in SIM.abilityFor — always a cost)
    ka0: { name: 'Cracked War Horn',    slot: 'ability', tier: 0, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -2 },  desc: 'whirlwind drains 2 less rage/s' },
    ka1: { name: 'Hide-bound Horn',     slot: 'ability', tier: 1, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -3 },  desc: 'whirlwind drains 3 less rage/s' },
    ka2: { name: 'Bronze War Horn',     slot: 'ability', tier: 2, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -4 },  desc: 'whirlwind drains 4 less rage/s' },
    ka3: { name: "Berserker's Horn",    slot: 'ability', tier: 3, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -6 },  desc: 'whirlwind drains 6 less rage/s' },
    ka4: { name: 'Horn of the Red Gale', slot: 'ability', tier: 4, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -8 },  bonus: { mp: 20 },
           desc: 'whirlwind drains 8 less rage/s · +20 max RAGE' },
    ka5: { name: 'Cataclysm Horn',      slot: 'ability', tier: 5, texture: 'horn', cls: 'knight',
           mod: { mpDrainPerSec: -10 }, bonus: { mp: 40 },
           desc: 'whirlwind drains 10 less rage/s · +40 max RAGE' },
    // armor — flat DEF (and HP up the tiers) — universal, any class
    ar0: { name: 'Padded Vest',      slot: 'armor', tier: 0, texture: 'armor',
           bonus: { def: 2 },            desc: '+2 DEF' },
    ar1: { name: 'Quilted Jerkin',   slot: 'armor', tier: 1, texture: 'armor',
           bonus: { def: 3, hp: 10 },    desc: '+3 DEF · +10 HP' },
    ar2: { name: 'Leather Armor',    slot: 'armor', tier: 2, texture: 'armor',
           bonus: { def: 4, hp: 15 },    desc: '+4 DEF · +15 HP' },
    ar3: { name: 'Studded Armor',    slot: 'armor', tier: 3, texture: 'armor',
           bonus: { def: 7, hp: 30 },    desc: '+7 DEF · +30 HP' },
    ar4: { name: 'Grovewarden Mail', slot: 'armor', tier: 4, texture: 'armor',
           bonus: { def: 11, hp: 60 },   desc: '+11 DEF · +60 HP' },
    ar5: { name: 'Titanplate',       slot: 'armor', tier: 5, texture: 'armor',
           bonus: { def: 16, hp: 100 },  desc: '+16 DEF · +100 HP' },
    // rings — pure stat jewelry (the RotMG slot) — universal, any class
    r0: { name: 'Copper Ring',          slot: 'ring', tier: 0, texture: 'ring',
          bonus: { hp: 10 },             desc: '+10 HP' },
    r1: { name: 'Silver Ring',          slot: 'ring', tier: 1, texture: 'ring',
          bonus: { hp: 20 },             desc: '+20 HP' },
    r2: { name: 'Ring of Swiftness',    slot: 'ring', tier: 2, texture: 'ring',
          bonus: { spd: 12 },            desc: '+12 SPD' },
    r3: { name: 'Ring of Might',        slot: 'ring', tier: 3, texture: 'ring',
          bonus: { att: 5, hp: 20 },     desc: '+5 ATT · +20 HP' },
    r4: { name: 'Ring of the Colossus', slot: 'ring', tier: 4, texture: 'ring',
          bonus: { hp: 80, def: 3 },     desc: '+80 HP · +3 DEF' },
    r5: { name: 'Ring of the Realm',    slot: 'ring', tier: 5, texture: 'ring',
          bonus: { hp: 50, att: 5, spd: 15, def: 2 },
          desc: '+50 HP · +5 ATT · +15 SPD · +2 DEF' },
    // NINJA weapons (shuriken) — same flat-add ladder as bows; the legendary
    // grants UNLIMITED CHI (freeEnergy) like the other classes' epic/legendary.
    nw0: { name: 'Rusted Shuriken',  slot: 'weapon', tier: 0, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 2 },  desc: '+2 weapon damage' },
    nw1: { name: 'Iron Shuriken',    slot: 'weapon', tier: 1, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 4 },  desc: '+4 weapon damage' },
    nw2: { name: 'Steel Shuriken',   slot: 'weapon', tier: 2, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 6 },  desc: '+6 weapon damage' },
    nw3: { name: 'Fanged Shuriken',  slot: 'weapon', tier: 3, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 9 },  bonus: { dex: 2 }, desc: '+9 weapon damage · +2 DEX' },
    nw4: { name: 'Bloodmoon Star',   slot: 'weapon', tier: 4, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 13, freeEnergy: true }, bonus: { dex: 4 },
           desc: '+13 weapon damage · +4 DEX · UNLIMITED chi' },
    nw5: { name: "Oni's Fang",       slot: 'weapon', tier: 5, texture: 'shuriken64', cls: 'ninja',
           mod: { dmg: 18, freeEnergy: true }, bonus: { dex: 6 },
           desc: '+18 weapon damage · +6 DEX · UNLIMITED chi' },
    // NINJA ability items (charms) — cut SHADOW CLONE cost + add CLONES (mp = CHI).
    // (2026-07-19: the `count` mod now adds shadow clones, not storm stars.)
    na0: { name: 'Frayed Charm',     slot: 'ability', tier: 0, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -2 },            desc: 'shadow clone costs 2 less chi' },
    na1: { name: 'Worn Charm',       slot: 'ability', tier: 1, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -3 },            desc: 'shadow clone costs 3 less chi' },
    na2: { name: 'Jade Charm',       slot: 'ability', tier: 2, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -4 },            desc: 'shadow clone costs 4 less chi' },
    na3: { name: 'Serpent Charm',    slot: 'ability', tier: 3, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -4, count: 2 },  desc: '+2 shadow clones · costs 4 less chi' },
    na4: { name: 'Storm Charm',      slot: 'ability', tier: 4, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -6, count: 4 },  bonus: { mp: 20 },
           desc: '+4 shadow clones · costs 6 less chi · +20 CHI' },
    na5: { name: 'Oni Charm',        slot: 'ability', tier: 5, texture: 'shuriken64', cls: 'ninja',
           mod: { mpCost: -8, count: 6 },  bonus: { mp: 40 },
           desc: '+6 shadow clones · costs 8 less chi · +40 CHI' }
  },

  // --- M4.6: CLASS GEAR LINES — slot → [T0..T3] item keys per class. This is
  // the remap table SIM.resolveDrop uses to swap a rolled generic key for the
  // rolling character's class equivalent (same slot, same tier). A new class =
  // a new row here + its item rows above; drop tables never change.
  classGear: {
    ranger: { weapon: ['w0', 'w1', 'w2', 'w3', 'w4', 'w5'],
              ability: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5'] },
    wizard: { weapon: ['ww0', 'ww1', 'ww2', 'ww3', 'ww4', 'ww5'],
              ability: ['wa0', 'wa1', 'wa2', 'wa3', 'wa4', 'wa5'] },
    knight: { weapon: ['kw0', 'kw1', 'kw2', 'kw3', 'kw4', 'kw5'],
              ability: ['ka0', 'ka1', 'ka2', 'ka3', 'ka4', 'ka5'] },
    ninja:  { weapon: ['nw0', 'nw1', 'nw2', 'nw3', 'nw4', 'nw5'],
              ability: ['na0', 'na1', 'na2', 'na3', 'na4', 'na5'] }
  },

  // --- M3: DROP TABLES — weighted rolls (SIM.rollDrop, seam rule 4). A chest
  // rolls its table `rolls` times. Boss tables skew T1 with real T2/T3 odds;
  // the time trial pays pocket change (T0/T1).
  // M4.6: entries keep the RANGER keys as the weight template — every rolled
  // key passes through SIM.resolveDrop(key, cls) at the call site, so a wizard
  // rolling 'w1' RECEIVES 'ww1' (Ashwood Staff). No off-class drops, ever.
  // M4.6 six-tier weights. The realm-1 boss pays white/green with real
  // blue/purple odds and a VERY-RARE legendary tail (orange w:0.2/slot ≈
  // 0.9% per roll, ~1.7% per boss chest — user: "legendary and very rare").
  // Trial pays pocket change (grey/white); champions skew white/green.
  dropTables: {
    // M4.7: the Conductor pays like the realm boss he is (same weights as the
    // Grovekeeper's table for now — TUNE separately once more bosses exist).
    conductor: { rolls: 2, entries: [
      { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
      { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
      { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
      { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
      { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
    ]},
    grovekeeper: { rolls: 2, entries: [
      { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
      { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
      { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
      { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
      { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
    ]},
    gravekeeper: { rolls: 2, entries: [
      { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
      { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
      { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
      { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
      { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
    ]},
    engineer: { rolls: 2, entries: [
      { item: 'w1', w: 12 },  { item: 'a1', w: 12 },  { item: 'ar1', w: 12 },  { item: 'r1', w: 12 },
      { item: 'w2', w: 7 },   { item: 'a2', w: 7 },   { item: 'ar2', w: 7 },   { item: 'r2', w: 7 },
      { item: 'w3', w: 3 },   { item: 'a3', w: 3 },   { item: 'ar3', w: 3 },   { item: 'r3', w: 3 },
      { item: 'w4', w: 1 },   { item: 'a4', w: 1 },   { item: 'ar4', w: 1 },   { item: 'r4', w: 1 },
      { item: 'w5', w: 0.2 }, { item: 'a5', w: 0.2 }, { item: 'ar5', w: 0.2 }, { item: 'r5', w: 0.2 }
    ]},
    trial: { rolls: 1, entries: [
      { item: 'w0', w: 16 }, { item: 'a0', w: 16 }, { item: 'ar0', w: 16 }, { item: 'r0', w: 16 },
      { item: 'w1', w: 5 },  { item: 'a1', w: 5 },  { item: 'ar1', w: 5 },  { item: 'r1', w: 5 },
      { item: 'w2', w: 1 },  { item: 'a2', w: 1 },  { item: 'ar2', w: 1 },  { item: 'r2', w: 1 }
    ]},
    // M3 affix v2: the champion-bounty table — one roll per champion killed
    // (see DATA.affixes.championBounty), added to the realm's boss chest.
    champion: { rolls: 1, entries: [
      { item: 'w0', w: 6 },  { item: 'a0', w: 6 },  { item: 'ar0', w: 6 },  { item: 'r0', w: 6 },
      { item: 'w1', w: 9 },  { item: 'a1', w: 9 },  { item: 'ar1', w: 9 },  { item: 'r1', w: 9 },
      { item: 'w2', w: 5 },  { item: 'a2', w: 5 },  { item: 'ar2', w: 5 },  { item: 'r2', w: 5 },
      { item: 'w3', w: 1.5 },{ item: 'a3', w: 1.5 },{ item: 'ar3', w: 1.5 },{ item: 'r3', w: 1.5 }
    ]}
  },

  // --- Stat potions (M2, R5/F4): the post-20 progression. ---------------------
  potions: {
    boost: 5,                                          // +5 per potion drunk
    stats: ['hp', 'mp', 'att', 'def', 'spd', 'dex'],   // which stats can drop
    tints: { hp: 0xb13e53, mp: 0x41a6f6, att: 0xef7d57,
             def: 0x94b0c2, spd: 0x38b764, dex: 0xffcd75 }
  },

  ui: {
    dmgNumberMs: 650, recapKey: 'ENTER',
    // E4 (M2.1): Diablo-style HUD — HP/MP resource orbs flanking the action bar.
    hud: { orbRadius: 42, orbMargin: 14, barW: 300, barH: 46,
           hpColor: 0xb13e53, mpColor: 0x41a6f6, glass: 0x1a1c2c }
  },

  // --- M1 juice layer (all cosmetic — sim never reads this) ------------------
  juice: {
    hitstopMs: 40,            // ~2-3 frames of physics freeze when a player shot lands
    hitstopCooldownMs: 90,    // min gap between hitstops so auto-fire can't lock the game
    deathParticles: 10,       // particles per mob death (tinted per mob.deathTint)
    levelupParticles: 16,
    swirl: { intervalMs: 110, durationMs: 800, radius: 46 },  // portal swirl effect
    // M3.5 PORTAL WORKS charge-up + powered-state feel (all cosmetic):
    // spawn = console flare → chargePulses race up the conduit → ring lights
    // ignite one per segMs in the mode color → portal tears open (portalMs).
    // While powered, a pulse flows console→platform every flowEveryMs.
    conduit: { chargePulses: 3, pulseGapMs: 220, pulseTravelMs: 500,
               segMs: 100, portalMs: 550, flowEveryMs: 400, flowTravelMs: 700,
               ringLights: 8, ringRadius: 46 },
    // M3.8 RECORDS SCREEN feel: login types the readout out letter by letter;
    // returning from a realm keeps the letters and RAMPS the numbers (a few
    // slow ticks, then they shoot up — countTicks over countTickMs each, eased
    // cubically). The switch's wire pulses like a tiny conduit.
    // v2: the wire only fires when the lever is thrown (3-pulse burst)
    records: { typeMs: 16, countTicks: 26, countTickMs: 55, wireTravelMs: 450 }
  },

  // --- M1 audio: generated chiptune SFX, no audio files (ASSET_PIPELINE §1) --
  // Each sound is a tiny synth recipe: oscillator type, freq → freqEnd sweep
  // (or an arp of notes), length (s), per-sound volume, min ms between plays.
  audio: {
    defaultVolume: 0.5,
    sounds: {
      shoot:   { type: 'square',   freq: 880, freqEnd: 440, len: 0.06, vol: 0.10, limitMs: 70 },
      volley:  { type: 'sawtooth', freq: 660, freqEnd: 210, len: 0.18, vol: 0.22, limitMs: 150 },
      hit:     { type: 'square',   freq: 220, freqEnd: 120, len: 0.05, vol: 0.09, limitMs: 45 },
      die:     { type: 'triangle', freq: 330, freqEnd: 55,  len: 0.20, vol: 0.20, limitMs: 60 },
      hurt:    { type: 'sawtooth', freq: 180, freqEnd: 60,  len: 0.25, vol: 0.30, limitMs: 200 },
      levelup: { type: 'square',   arp: [523, 659, 784, 1047], len: 0.42, vol: 0.22, limitMs: 300 },
      victory: { type: 'square',   arp: [392, 523, 659, 784, 1047, 1319], len: 0.9, vol: 0.26, limitMs: 1000 },
      drink:   { type: 'sine',     freq: 300, freqEnd: 700, len: 0.22, vol: 0.22, limitMs: 150 },
      bossHit: { type: 'triangle', freq: 150, freqEnd: 90,  len: 0.06, vol: 0.10, limitMs: 50 },
      portal:  { type: 'sine',     freq: 190, freqEnd: 920, len: 0.5,  vol: 0.28, limitMs: 400 },
      death:   { type: 'sawtooth', freq: 440, freqEnd: 40,  len: 0.9,  vol: 0.32, limitMs: 1000 },
      ui:      { type: 'square',   freq: 520, freqEnd: 520, len: 0.04, vol: 0.14, limitMs: 60 },
      // M5.6 THE GRAVEYARD SFX. belltoll = the Cursed Bell / boss wave opener
      // (a low struck-bell ring); reaperdrone = the dread-march rise. The rest
      // reuse existing kit (grave-crack→crash · hand-burst→crash · wisp→chime ·
      // corpse-blast→boom).
      belltoll:   { type: 'triangle', freq: 196, freqEnd: 185, len: 1.1, vol: 0.26, limitMs: 600 },
      reaperdrone:{ type: 'sawtooth', freq: 70,  freqEnd: 120, len: 1.4, vol: 0.22, limitMs: 1200,
                    noise: { vol: 0.05, hp: 900 } },
      // M3.5 PORTAL WORKS: ELECTRICITY for the charge-up — a rising jittery
      // sawtooth arc with a gated white-noise crackle bed underneath...
      charge:  { type: 'sawtooth', arp: [90, 110, 95, 140, 130, 180, 170, 240, 230, 320, 340, 460],
                 jitter: 0.18, len: 1.5, vol: 0.16, limitMs: 800,
                 noise: { vol: 0.10, hp: 1800 } },
      // ...and the PHASER for the portal tearing open — a bright descending
      // zap with a short spark tail.
      spawn:   { type: 'square',   freq: 1500, freqEnd: 140, len: 0.45, vol: 0.26, limitMs: 400,
                 noise: { vol: 0.06, hp: 2400 } },
      // M4 WIZARD: FROST — an icy descending shimmer with a faint airy hiss
      // (the Wizard's basic frostbolt). ZAP — a short bright snap for each
      // machine-gun lightning ball (limitMs sits under the barrage cadence so
      // the stream reads as a rattle, not a wall). THUNDER — the low boom +
      // crackle of the lightning-bolt PROC striking down.
      frost:   { type: 'sine',     freq: 780, freqEnd: 300, len: 0.12, vol: 0.13, limitMs: 70,
                 noise: { vol: 0.04, hp: 3200 } },
      zap:     { type: 'square',   freq: 1150, freqEnd: 520, len: 0.05, vol: 0.10, limitMs: 60,
                 noise: { vol: 0.03, hp: 3400 } },
      thunder: { type: 'sawtooth', freq: 150, freqEnd: 42,  len: 0.5,  vol: 0.30, limitMs: 110,
                 noise: { vol: 0.18, hp: 700 } },
      // M4 KNIGHT: SLASH — a short metallic swipe (bright square down-sweep with
      // an airy edge) for the sword cleave. WHIRL — a low airy whoosh under a
      // gritty bed for the whirlwind channel (played every damage tick, so its
      // limitMs sits just under the ability's tickMs to read as a steady spin).
      slash:   { type: 'square',   freq: 540, freqEnd: 190, len: 0.10, vol: 0.14, limitMs: 60,
                 noise: { vol: 0.05, hp: 2000 } },
      whirl:   { type: 'sawtooth', freq: 300, freqEnd: 250, len: 0.13, vol: 0.11, limitMs: 120,
                 noise: { vol: 0.09, hp: 1100 } },
      // ART TEST (train yard): TRAINHORN — a low two-tone air horn warning the
      // train is coming (telegraph). TRAINPASS — the low rumble + gritty roar as
      // it barrels through (played in bursts while it crosses).
      trainhorn: { type: 'sawtooth', arp: [175, 131, 175, 147], len: 1.1, vol: 0.30, limitMs: 1400,
                   noise: { vol: 0.05, hp: 300 } },
      trainpass: { type: 'triangle', freq: 78, freqEnd: 58, len: 0.5, vol: 0.26, limitMs: 220,
                   noise: { vol: 0.16, hp: 180 } },
      // M4.7 CONDUCTOR: THUD — a railroad tie slamming the gravel (low punch +
      // gritty dust). TICKTOCK — the pocket watch snapping open: two clipped
      // high blips (the SCHEDULE slow's audio cue).
      thud:     { type: 'triangle', freq: 120, freqEnd: 42, len: 0.22, vol: 0.30, limitMs: 130,
                  noise: { vol: 0.12, hp: 400 } },
      ticktock: { type: 'square',   arp: [1250, 850, 1250, 850], len: 0.3, vol: 0.20, limitMs: 900 },
      // M4.9 DYNAMITE MOLE: BOOM — a real explosion. A hard low-triangle punch
      // sweeping down under a fat white-noise blast (the detonation's body).
      boom:     { type: 'triangle', freq: 150, freqEnd: 34, len: 0.5, vol: 0.36, limitMs: 240,
                  noise: { vol: 0.32, hp: 380 } },
      // M5.0 THE GROVE: CREAK — the ancient wood groaning as a tree starts to
      // go (the falling-tree telegraph; slow bending sawtooth + woody rasp).
      // CRASH — the trunk hitting the ground (deeper, longer cousin of boom).
      // CHIME — a pixie blinking (bright sparkle arp). REVIVE — the bloom
      // swelling as the pixies resurrect (rising warm arp; phase two + the
      // Bloom Pixie's corpse-raising).
      creak:  { type: 'sawtooth', arp: [95, 88, 102, 84, 96, 78], len: 1.2, vol: 0.24, limitMs: 900,
                noise: { vol: 0.06, hp: 900 } },
      crash:  { type: 'triangle', freq: 110, freqEnd: 26, len: 0.7, vol: 0.38, limitMs: 500,
                noise: { vol: 0.30, hp: 260 } },
      chime:  { type: 'square',   arp: [1568, 2093, 2637], len: 0.14, vol: 0.10, limitMs: 180 },
      revive: { type: 'sine',     arp: [392, 523, 659, 784, 1047], len: 0.7, vol: 0.22, limitMs: 600 }
    },

    // --- M3.9: MUSIC — "The Chamber at Rest" (ORIGINAL composition, 2026).
    // The user asked for the Balamb Garden theme; that melody is copyrighted
    // (Uematsu/Square Enix — even as an 8-bit cover), so this is an original
    // piece written for the same feeling: a warm, slow, safe-place loop.
    // Classic I–V–vi–iii–IV–I–ii/V–I progression, three chip voices:
    // triangle bass · soft square arpeggios · lyrical square lead.
    // Notes are [name, beats]; null = rest. All tracks must sum to equal beats.
    music: {
      // --- M4.5: "SWARMFRONT" (ORIGINAL composition, 2026-07-13) — the realm
      // BATTLE theme. The user asked for the feel of FF8's "Don't Be Afraid"
      // (Uematsu/Square Enix — copyrighted, so no melody borrowed); this is an
      // original piece chasing the same ENGAGEMENT CURVE: a relentless driving
      // bass ostinato (A, beats 0–16) → a two-step RISING BUILD (B, 16–32:
      // the whole engine shifts up C→D, phrases climb + shorten) → the FRANTIC
      // PEAK (C, 32–48: high eighth-note runs, 16th bursts in the pulse) → a
      // TURNAROUND (D, 48–64) that winds down just enough to re-arm the next
      // loop's build. A minor, 172bpm, ~22s loop. Three chip voices: driving
      // triangle bass 8ths · urgent square pulse (off-voice, 16th climbs at the
      // build points) · lyrical-but-panicked square lead.
      battle: {
        bpm: 172,
        tracks: [
          { type: 'triangle', vol: 0.095, notes: [   // bass — the engine, all 8ths
            // A: dig in on Am
            ['A2',.5],['A2',.5],['E2',.5],['A2',.5],['A2',.5],['A2',.5],['G2',.5],['A2',.5],
            ['A2',.5],['A2',.5],['E2',.5],['A2',.5],['A2',.5],['A2',.5],['G2',.5],['A2',.5],
            ['A2',.5],['A2',.5],['E2',.5],['A2',.5],['A2',.5],['A2',.5],['G2',.5],['A2',.5],
            ['A2',.5],['A2',.5],['E2',.5],['A2',.5],['A2',.5],['A2',.5],['G2',.5],['A2',.5],
            // B: the build — everything shifts UP (C, then D)
            ['C3',.5],['C3',.5],['G2',.5],['C3',.5],['C3',.5],['C3',.5],['B2',.5],['C3',.5],
            ['C3',.5],['C3',.5],['G2',.5],['C3',.5],['C3',.5],['C3',.5],['B2',.5],['C3',.5],
            ['D3',.5],['D3',.5],['A2',.5],['D3',.5],['D3',.5],['D3',.5],['C3',.5],['D3',.5],
            ['D3',.5],['D3',.5],['A2',.5],['D3',.5],['D3',.5],['D3',.5],['C3',.5],['D3',.5],
            // C: the peak — E then F, hammering
            ['E3',.5],['E3',.5],['B2',.5],['E3',.5],['E3',.5],['E3',.5],['D3',.5],['E3',.5],
            ['E3',.5],['E3',.5],['B2',.5],['E3',.5],['E3',.5],['E3',.5],['D3',.5],['E3',.5],
            ['F3',.5],['F3',.5],['C3',.5],['F3',.5],['F3',.5],['F3',.5],['E3',.5],['F3',.5],
            ['E3',.5],['E3',.5],['B2',.5],['E3',.5],['E3',.5],['E3',.5],['D3',.5],['E3',.5],
            // D: turnaround — step back down, then walk up into the next loop
            ['D3',.5],['D3',.5],['A2',.5],['D3',.5],['C3',.5],['C3',.5],['G2',.5],['C3',.5],
            ['B2',.5],['B2',.5],['G2',.5],['B2',.5],['A2',.5],['A2',.5],['E2',.5],['A2',.5],
            ['A2',.5],['A2',.5],['E2',.5],['A2',.5],['A2',.5],['A2',.5],['G2',.5],['A2',.5],
            ['E2',.5],['E2',.5],['G2',.5],['G2',.5],['A2',.5],['A2',.5],['B2',.5],['B2',.5]
          ] },
          { type: 'square', vol: 0.030, notes: [     // pulse — urgency, climbs at the builds
            // A: tense two-note rocking
            ['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],
            ['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],
            ['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],
            ['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],['A3',.5],['E4',.5],
            // B: rocking shifts up with the bass
            ['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],
            ['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],
            ['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],
            ['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],
            // C: peak rocking + a 16th-note LADDER into the last bar
            ['E4',.5],['B4',.5],['E4',.5],['B4',.5],['E4',.5],['B4',.5],['E4',.5],['B4',.5],
            ['E4',.5],['B4',.5],['E4',.5],['B4',.5],['E4',.5],['B4',.5],['E4',.5],['B4',.5],
            ['F4',.5],['C5',.5],['F4',.5],['C5',.5],['F4',.5],['C5',.5],['F4',.5],['C5',.5],
            ['F4',.5],['C5',.5],['F4',.5],['C5',.5],
            ['B4',.25],['C5',.25],['D5',.25],['E5',.25],['B4',.25],['C5',.25],['D5',.25],['E5',.25],
            // D: wind down, then a 16th CLIMB re-arms the loop
            ['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],['D4',.5],['A4',.5],
            ['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],['C4',.5],['G4',.5],
            ['B3',.5],['G4',.5],['B3',.5],['G4',.5],['B3',.5],['G4',.5],['B3',.5],['G4',.5],
            ['A3',.5],['E4',.5],['A3',.5],['E4',.5],
            ['E4',.25],['G4',.25],['A4',.25],['B4',.25],['C5',.25],['D5',.25],['E5',.25],['E5',.25]
          ] },
          { type: 'square', vol: 0.055, notes: [     // lead — panicked, but it SINGS
            // A: the hook — short, urgent, keeps landing back on A
            ['A4',.5],[null,.5],['A4',.5],['B4',.5],['C5',1],['B4',.5],['A4',.5],
            ['E5',1.5],['D5',.5],['C5',.5],['B4',.5],['A4',1],
            ['A4',.5],[null,.5],['A4',.5],['B4',.5],['C5',1],['D5',.5],['E5',.5],
            ['E5',.5],['D5',.5],['C5',.5],['D5',.5],['B4',2],
            // B: THE BUILD — rising sequences, phrases shorten, then a 16th sprint to the top
            ['C5',1],['D5',1],['E5',1],[null,1],
            ['D5',1],['E5',1],['F5',1],[null,1],
            ['E5',.5],['F5',.5],['G5',.5],[null,.5],['F5',.5],['G5',.5],['A5',.5],[null,.5],
            ['G5',.25],['A5',.25],['B5',.25],['A5',.25],['G5',.25],['A5',.25],['B5',.25],['A5',.25],['B5',1],[null,1],
            // C: the peak — frantic eighth runs off the top
            ['E5',.5],['E5',.5],['D5',.5],['E5',.5],['C5',.5],['E5',.5],['B4',.5],['E5',.5],
            ['F5',.5],['E5',.5],['D5',.5],['C5',.5],['D5',.5],['C5',.5],['B4',.5],['A4',.5],
            ['E5',.5],['E5',.5],['D5',.5],['E5',.5],['F5',.5],['E5',.5],['D5',.5],['C5',.5],
            ['B4',.5],['C5',.5],['D5',.5],['E5',.5],['F5',1],['E5',1],
            // D: turnaround — falls, breathes ONE beat, then charges the pickup
            ['D5',1],['C5',.5],['B4',.5],['C5',1],['B4',.5],['A4',.5],
            ['B4',1],['A4',.5],['G4',.5],['A4',2],
            [null,1],['E4',.5],['G4',.5],['A4',.5],['B4',.5],['C5',.5],['D5',.5],
            ['E5',1],['D5',.5],['B4',.5],['A4',.5],['G4',.5],['E4',.5],['G4',.5]
          ] }
        ]
      },
      chamber: {
        bpm: 72,
        tracks: [
          { type: 'triangle', vol: 0.085, notes: [   // bass — slow and warm
            ['C3',2],['G2',2],  ['G2',2],['D3',2],  ['A2',2],['E3',2],  ['E3',2],['B2',2],
            ['F2',2],['C3',2],  ['C3',2],['G2',2],  ['D3',2],['G2',2],  ['C3',4]
          ] },
          { type: 'square', vol: 0.032, notes: [     // arpeggios — gentle motion
            ['C4',.5],['E4',.5],['G4',.5],['E4',.5],['C4',.5],['E4',.5],['G4',.5],['E4',.5],
            ['B3',.5],['D4',.5],['G4',.5],['D4',.5],['B3',.5],['D4',.5],['G4',.5],['D4',.5],
            ['A3',.5],['C4',.5],['E4',.5],['C4',.5],['A3',.5],['C4',.5],['E4',.5],['C4',.5],
            ['G3',.5],['B3',.5],['E4',.5],['B3',.5],['G3',.5],['B3',.5],['E4',.5],['B3',.5],
            ['A3',.5],['C4',.5],['F4',.5],['C4',.5],['A3',.5],['C4',.5],['F4',.5],['C4',.5],
            ['C4',.5],['E4',.5],['G4',.5],['E4',.5],['C4',.5],['E4',.5],['G4',.5],['E4',.5],
            ['D4',.5],['F4',.5],['A4',.5],['F4',.5],['B3',.5],['D4',.5],['G4',.5],['D4',.5],
            ['C4',.5],['E4',.5],['G4',.5],['C5',.5],['G4',.5],['E4',.5],['C4',.5],[null,.5]
          ] },
          { type: 'square', vol: 0.055, notes: [     // lead — a small, kind melody
            ['E4',1],['G4',1],['C5',2],
            ['D5',1],['B4',1],['G4',2],
            ['A4',1],['C5',1],['E5',2],
            ['B4',2],['G4',2],
            ['C5',1],['A4',1],['F4',2],
            ['G4',2],['E4',2],
            ['F4',1],['D4',1],['G4',2],
            ['E4',3],[null,1]
          ] }
        ]
      }
    }
  },

  // --- SETTINGS UX (2026-07-12): music/SFX split + remappable keybinds.
  // defaultVolume above is the seed for BOTH channels on a fresh profile.
  // Keybinds are stored in settings as event.code strings (layout-independent,
  // e.g. 'KeyP','Space','Escape'); this list is the ORDER + labels the settings
  // panel renders, and the source of the default binding for each action.
  // NOTE: menu (ESC) and fullscreen (F) live here too so they show in the list,
  // but movement uses the four move* actions. Auto-fire is NO LONGER a key —
  // it's a checkbox in Settings (settings.autoFire). M (builder) + F3 (debug)
  // stay hardcoded dev keys, deliberately not remappable.
  // EVERY action has a PRIMARY (def) + an ALTERNATE (alt) binding; only the
  // four movement actions ship with an alt by default (the arrow keys).
  keybinds: {
    list: [
      { id: 'moveUp',      label: 'Move up',         def: 'KeyW',   alt: 'ArrowUp',    group: 'Movement' },
      { id: 'moveLeft',    label: 'Move left',       def: 'KeyA',   alt: 'ArrowLeft',  group: 'Movement' },
      { id: 'moveDown',    label: 'Move down',       def: 'KeyS',   alt: 'ArrowDown',  group: 'Movement' },
      { id: 'moveRight',   label: 'Move right',      def: 'KeyD',   alt: 'ArrowRight', group: 'Movement' },
      { id: 'interact',    label: 'Interact / cast', def: 'Space',  alt: null,         group: 'Combat' },
      { id: 'portal',      label: 'Portal machine',  def: 'KeyP',   alt: null,         group: 'Chamber' },
      { id: 'vault',       label: 'Vault',           def: 'KeyV',   alt: null,         group: 'Chamber' },
      { id: 'bestiary',    label: 'Bestiary',        def: 'KeyB',   alt: null,         group: 'Chamber' },
      { id: 'recordsUp',   label: 'Records screen',  def: 'KeyR',   alt: null,         group: 'Chamber' },
      { id: 'recordsDown', label: 'Graveyard screen',def: 'KeyG',   alt: null,         group: 'Chamber' },
      { id: 'menu',        label: 'Menu / pause',    def: 'Escape', alt: null,         group: 'System' },
      { id: 'fullscreen',  label: 'Fullscreen',      def: 'KeyF',   alt: null,         group: 'System' }
    ]
  }
};

// ============================================================================
// M5.0 — "HEARTWOOD" (ORIGINAL composition, 2026-07-15): THE GROVE's theme.
// The user asked for a custom 8-bit forest song — MAGICAL and INSPIRING,
// ~3 minutes so it doesn't wear out. C major, 96bpm, 288 beats = exactly 3:00
// per loop. Four chip voices: warm triangle bass · soft square arpeggios ·
// a soaring square lead · a high sine SPARKLE (the fireflies).
// Built by a tiny section composer (below) instead of 1000 literal rows —
// the OUTPUT is the same [note,beats] tracks the sequencer already plays.
// Sections: intro → verse → lift → CHORUS (the soar) → verse → lift → chorus
// → music-box bridge → double final chorus → outro. All tracks sum to 288
// beats exactly (asserted by construction — the equal-beats music rule).
// ============================================================================
DATA.audio.music.grove = (function () {
  // chords: bass root + fifth, and the three arp tones
  var CH = {
    C:  { b: 'C2', b5: 'G2', arp: ['C4', 'E4', 'G4'] },
    G:  { b: 'G2', b5: 'D3', arp: ['B3', 'D4', 'G4'] },
    Am: { b: 'A2', b5: 'E3', arp: ['A3', 'C4', 'E4'] },
    F:  { b: 'F2', b5: 'C3', arp: ['A3', 'C4', 'F4'] }
  };
  function up(n) { return n.slice(0, -1) + (+n.slice(-1) + 1); }  // +1 octave
  // the full progression — one entry per 4-beat bar (72 bars = 288 beats)
  var INTRO = ['C', 'C', 'Am', 'F'];
  var A = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'];
  var B = ['F', 'G', 'Am', 'G'];
  var C = ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'];
  var D = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];
  var OUT = ['F', 'G', 'C', 'C'];
  var SONG = [].concat(INTRO, A, B, C, A, B, C, D, C, C, OUT);
  var quiet = {};                                    // bar index → bridge/intro (soft)
  SONG.forEach(function (ch, i) {
    if (i < INTRO.length) quiet[i] = 'intro';
    var dStart = INTRO.length + A.length + B.length + C.length + A.length + B.length + C.length;
    if (i >= dStart && i < dStart + D.length) quiet[i] = 'bridge';
  });

  // --- bass: warm root-fifth walk; silent in the intro, halved in the bridge
  var bass = [];
  SONG.forEach(function (ch, i) {
    var c = CH[ch];
    if (quiet[i] === 'intro') bass.push([null, 4]);
    else if (quiet[i] === 'bridge') bass.push([c.b, 3], [c.b5, 1]);
    else bass.push([c.b, 1.5], [c.b5, 0.5], [c.b, 1], [c.b5, 1]);
  });

  // --- arpeggios: gentle eighth-note motion, always on
  var arp = [];
  SONG.forEach(function (ch) {
    var a = CH[ch].arp;
    arp.push([a[0], .5], [a[1], .5], [a[2], .5], [a[1], .5],
             [a[0], .5], [a[1], .5], [a[2], .5], [a[1], .5]);
  });

  // --- sparkle: firefly glints — the top arp tone an octave up, off-beat
  var spark = [];
  SONG.forEach(function (ch, i) {
    var top = up(CH[ch].arp[2]), mid = up(CH[ch].arp[1]);
    if (quiet[i] === 'intro' || quiet[i] === 'bridge')
      spark.push([null, 1], [top, .5], [null, .5], [mid, .5], [null, 1], [top, .5]);
    else if (i % 2 === 0) spark.push([null, 3], [top, .5], [mid, .5]);
    else spark.push([null, 4]);
  });

  // --- lead: hand-written per section (the tune). 4-beat bars, summed exact.
  var L_INTRO = [[null, 8], ['G4', 1], ['A4', 1], ['C5', 2], ['E5', 3], [null, 1]];
  var L_VERSE = [
    ['E4', 1], ['G4', 1], ['C5', 2],            // C  — the small brave hook
    ['B4', 1], ['A4', 1], ['E4', 2],            // Am
    ['F4', 1], ['A4', 1], ['C5', 1.5], ['D5', .5], // F
    ['B4', 2], ['G4', 2],                       // G
    ['E4', 1], ['G4', 1], ['C5', 1], ['D5', 1], // C  — again, reaching higher
    ['E5', 2], ['C5', 1], ['A4', 1],            // Am
    ['D5', 1], ['C5', 1], ['A4', 1], ['F4', 1], // F
    ['G4', 3], [null, 1]                        // G  — breathe
  ];
  var L_LIFT = [
    ['A4', 1], ['C5', 1], ['D5', 2],            // F  — the climb begins
    ['B4', 1], ['D5', 1], ['E5', 2],            // G
    ['C5', 1], ['D5', 1], ['E5', 2],            // Am
    ['D5', .5], ['E5', .5], ['F5', .5], ['G5', .5], ['F5', 1], ['D5', 1]  // G — sprint to the top
  ];
  var L_CHORUS = [
    ['G4', .5], ['C5', .5], ['E5', 2], ['D5', .5], ['C5', .5],  // C — THE SOAR
    ['D5', 1], ['G5', 2], ['E5', 1],                            // G
    ['E5', 1], ['C5', 1], ['A4', 1], ['C5', 1],                 // Am
    ['D5', 2], ['C5', 1], ['A4', 1],                            // F
    ['G4', .5], ['C5', .5], ['E5', 1.5], ['G5', .5], ['E5', 1], // C — higher the second time
    ['F5', 1], ['G5', 2], ['D5', 1],                            // G
    ['E5', 1], ['G5', 1], ['A5', 2],                            // Am — the peak
    ['G5', 1], ['E5', 1], ['C5', 1], ['D5', 1]                  // F — hand it back
  ];
  var L_BRIDGE = [
    ['E5', 2], [null, 2], ['C5', 2], [null, 2],                 // Am F — music box, wide-eyed
    ['G4', 2], [null, 2], ['B4', 2], [null, 2],                 // C G
    ['A4', 1], ['C5', 1], ['E5', 2], ['F5', 2], ['E5', 2],      // Am F
    ['E5', 1], ['D5', 1], ['C5', 2], ['D5', 3], [null, 1]       // C G — wind up the return
  ];
  var L_OUT = [
    ['E5', 2], ['D5', 2],                                       // F
    ['D5', 2], ['B4', 2],                                       // G
    ['C5', 4],                                                  // C — home
    [null, 4]
  ];
  var lead = [].concat(L_INTRO, L_VERSE, L_LIFT, L_CHORUS, L_VERSE, L_LIFT,
                       L_CHORUS, L_BRIDGE, L_CHORUS, L_CHORUS, L_OUT);

  return {
    bpm: 96,
    tracks: [
      { type: 'triangle', vol: 0.085, notes: bass },
      { type: 'square',   vol: 0.028, notes: arp },
      { type: 'triangle', vol: 0.030, notes: spark },
      { type: 'square',   vol: 0.055, notes: lead }
    ]
  };
})();

// ============================================================================
// M5.6 — "THE GRAVEYARD" (ORIGINAL composition, 2026-07-15): biome-3 theme.
// User-approved v3 direction — DARK GOTHIC METAL, epic + frantic. D harmonic
// minor, 168bpm. Ported from the approved render (artdev/graveyard/render_theme.py)
// to the in-game chip section-composer: same structure (toll intro → verse A →
// chorus B → verse A → mournful break → double climax → outro), six monophonic
// chip voices in place of the full render — droning organ pad · galloping
// triangle bass · 16th square chug · frantic harpsichord-style arpeggio · a
// soaring square lead (the exact LA/LB/LK/LI motifs) · bell tolls. 124 bars ×
// 4 beats = 496 beats (~2:57 @168bpm). ALL tracks sum to 496 (equal-beats rule).
// ============================================================================
DATA.audio.music.graveyard = (function () {
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function m2n(midi) { if (!midi || midi <= 0) return null; return NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1); }
  var ROOTS = { D: 62, E: 64, F: 65, G: 67, A: 69, Bb: 70, C: 72, Cs: 73 };
  function triad(root, kind) { var r = ROOTS[root], th = kind === 'min' ? 3 : 4; return [r, r + th, r + 7]; }

  // approved lead motifs — [midi, 16th-steps] (4 steps = 1 beat; 0 = rest)
  var LA = [[74,4],[77,2],[76,2],[74,4],[73,4],[74,4],[69,4],[70,4],[73,2],[74,2],
            [77,4],[76,2],[74,2],[76,4],[73,4],[74,8],[0,4],[69,4],
            [74,4],[77,2],[76,2],[79,4],[77,4],[76,4],[74,2],[73,2],[74,4],[76,4],
            [77,4],[76,2],[74,2],[73,4],[70,4],[69,12],[0,4]];
  var LB = [[81,6],[79,2],[77,4],[76,4],[77,6],[76,2],[74,4],[73,4],
            [74,4],[77,4],[81,4],[82,4],[81,12],[0,4],
            [82,6],[81,2],[79,4],[77,4],[79,6],[77,2],[76,4],[74,4],
            [76,4],[77,4],[79,4],[81,4],[86,12],[0,4]];
  var LK = [[74,8],[73,8],[70,8],[69,8],[67,8],[69,4],[70,4],[73,12],[0,4],
            [74,8],[77,8],[76,8],[73,8],[74,16]];
  var LI = [[74,10],[0,6],[69,10],[0,6],[70,10],[0,6],[73,10],[0,22]];

  var Ap = [['D','min'],['G','min'],['A','maj'],['D','min'],['Bb','maj'],['G','min'],['A','maj'],['D','min']];
  var Bp = [['Bb','maj'],['G','min'],['D','min'],['A','maj'],['Bb','maj'],['C','maj'],['A','maj'],['D','min']];
  var Kp = [['D','min'],['Bb','maj'],['G','min'],['A','maj']];
  var Ip = [['D','min'],['D','min'],['Bb','maj'],['G','min'],['A','maj'],['A','maj'],['D','min'],['D','min']];

  var SECTIONS = [
    { bars: 8,  prog: Ip, lead: LI, mode: 'intro' },
    { bars: 16, prog: Ap, lead: LA, mode: 'A' },
    { bars: 16, prog: Bp, lead: LB, mode: 'B' },
    { bars: 16, prog: Ap, lead: LA, mode: 'A' },
    { bars: 12, prog: Kp, lead: LK, mode: 'break' },
    { bars: 16, prog: Bp, lead: LB, mode: 'climax' },
    { bars: 16, prog: Ap, lead: LA, mode: 'A' },
    { bars: 16, prog: Bp, lead: LB, mode: 'climax' },
    { bars: 8,  prog: Ip, lead: LI, mode: 'outro' }
  ];

  var pad = [], bass = [], chug = [], arp = [], bell = [], lead = [];
  var GALLOP_ON = { A: 1, B: 1, climax: 1 }, PAD_ON = { A: 1, B: 1, 'break': 1, intro: 1, outro: 1, climax: 1 };
  var CHUG_ON = { A: 1, B: 1, climax: 1 }, ARP_ON = { B: 1, 'break': 1, climax: 1 };

  SECTIONS.forEach(function (sec) {
    var budget = sec.bars * 4;
    // ---- lead: loop the motif, clamp to the section's beat budget ----
    var acc = 0, i = 0;
    while (acc < budget - 1e-6) {
      var mn = sec.lead[i % sec.lead.length]; i++;
      var b = mn[1] / 4; if (acc + b > budget) b = budget - acc;
      lead.push([m2n(mn[0]), b]); acc += b;
    }
    // ---- per-bar layers (each emits EXACTLY 4 beats/bar) ----
    for (var bar = 0; bar < sec.bars; bar++) {
      var pc = sec.prog[bar % sec.prog.length], tones = triad(pc[0], pc[1]);
      var broot = ROOTS[pc[0]] - 24;                 // deep gallop root
      // organ pad — a sustained drone (root, one octave under the tune)
      pad.push([PAD_ON[sec.mode] ? m2n(ROOTS[pc[0]] - 12) : null, 4]);
      // galloping triangle bass ([0,2,3] per beat) or a sparse half-note
      if (GALLOP_ON[sec.mode]) {
        for (var beat = 0; beat < 4; beat++) {           // gallop = 0.5 + 0.25 + 0.25 = 1 beat
          bass.push([m2n(broot), 0.5], [m2n(broot), 0.25], [m2n(beat % 2 === 0 ? broot : broot + 7), 0.25]);
        }
      } else { bass.push([m2n(broot), 2], [null, 2]); }
      // 16th palm-mute chug on the root
      if (CHUG_ON[sec.mode]) { for (var s1 = 0; s1 < 16; s1++) chug.push([m2n(tones[s1 % 3] - 12), 0.25]); }
      else chug.push([null, 4]);
      // frantic harpsichord-style arpeggio (2 octaves up)
      if (ARP_ON[sec.mode]) {
        var seq = [tones[0] + 24, tones[2] + 12, tones[1] + 24, tones[2] + 24, tones[0] + 24, tones[1] + 24, tones[2] + 12, tones[1] + 24];
        for (var s2 = 0; s2 < 16; s2++) arp.push([m2n(seq[s2 % 8]), 0.25]);
      } else arp.push([null, 4]);
      // bell tolls — bar 0 of a section, and every 4th bar of B/climax
      var toll = (bar === 0) || ((sec.mode === 'B' || sec.mode === 'climax') && bar % 4 === 0);
      if (toll) bell.push([m2n(tones[0] + 12), 2], [null, 2]); else bell.push([null, 4]);
    }
  });

  return {
    bpm: 168,
    tracks: [
      { type: 'triangle', vol: 0.090, notes: bass },     // galloping bass (the engine)
      { type: 'square',   vol: 0.026, notes: pad },       // organ drone pad
      { type: 'square',   vol: 0.020, notes: chug },      // 16th chug
      { type: 'square',   vol: 0.022, notes: arp },       // frantic arpeggio
      { type: 'triangle', vol: 0.045, notes: bell },      // bell tolls
      { type: 'square',   vol: 0.058, notes: lead }       // soaring lead (the tune)
    ]
  };
})();

// M5.7 THE FACTORY — "ASSEMBLY LINE": 8-bit techno/house, 126 BPM, A-minor,
// prog Am–F–C–G, ~3:00. Ported from the approved render (artdev/factory/
// render_factory_theme.js) to the in-game chip section-composer. NO noise voice
// in-game, so the four-on-the-floor kick is a short low triangle and the house
// chord stabs collapse to one tone (monophonic tracks). 94 bars × 4 = 376 beats
// (~2:59 @126bpm); ALL tracks sum to 376 (the equal-beats rule — asserted by the
// per-bar emitters each pushing exactly 4 beats).
DATA.audio.music.factory = (function () {
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function m2n(midi) { if (!midi || midi <= 0) return null; return NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1); }
  // triad roots (mid octave); Am is minor, F/C/G major
  var ROOTS = { A: 57, F: 53, C: 60, G: 55 };
  function triad(tok) { var r = ROOTS[tok], th = tok === 'A' ? 3 : 4; return [r, r + th, r + 7]; }
  var PROG = ['A', 'F', 'C', 'G'];                    // Am – F – C – G, one per bar

  // house lead motif — [midi, 16th-steps] (4 steps = 1 beat, 0 = rest)
  var LD = [[69,4],[76,2],[74,2],[72,4],[69,4],[67,4],[69,4],[72,2],[74,2],
            [76,4],[74,2],[72,2],[71,4],[67,4],[69,8],[0,4],
            [72,4],[76,2],[74,2],[72,4],[71,4],[69,4],[67,4],[64,2],[67,2],
            [69,4],[72,2],[74,2],[76,4],[74,4],[69,8],[0,4]];
  var LO = [[69,8],[67,8],[64,8],[69,24]];            // sparse outro/intro glints

  var SECTIONS = [
    { bars: 8,  mode: 'intro',   lead: LO },
    { bars: 16, mode: 'dropA',   lead: LD },
    { bars: 16, mode: 'main',    lead: LD },
    { bars: 12, mode: 'break',   lead: LO },
    { bars: 4,  mode: 'rebuild', lead: LO },
    { bars: 28, mode: 'dropB',   lead: LD },
    { bars: 10, mode: 'outro',   lead: LO }
  ];

  var kick = [], bass = [], stab = [], arp = [], pad = [], lead = [];
  var KICK_ON = { dropA: 1, main: 1, rebuild: 1, dropB: 1 };
  var BASS_FULL = { dropA: 1, main: 1, dropB: 1, rebuild: 1 };   // octave-jump 8ths; else sparse
  var STAB_ON = { dropA: 1, main: 1, 'break': 1, dropB: 1 };
  var ARP_ON = { dropA: 1, main: 1, 'break': 1, rebuild: 1, dropB: 1 };
  var LEAD_ON = { dropA: 1, main: 1, dropB: 1 };
  var BASSOFF = { intro: 0 };                                     // intro: no bass at all
  var JUMP = [0, 12, 0, 7, 0, 12, 0, 5];                          // house octave-jump offsets

  SECTIONS.forEach(function (sec) {
    var budget = sec.bars * 4;
    // ---- lead: loop the motif (or rest the whole section) ----
    if (LEAD_ON[sec.mode]) {
      var acc = 0, i = 0;
      while (acc < budget - 1e-6) {
        var mn = sec.lead[i % sec.lead.length]; i++;
        var b = mn[1] / 4; if (acc + b > budget) b = budget - acc;
        lead.push([m2n(mn[0]), b]); acc += b;
      }
    } else { lead.push([null, budget]); }
    // ---- per-bar layers (each emits EXACTLY 4 beats/bar) ----
    for (var bar = 0; bar < sec.bars; bar++) {
      var tok = PROG[bar % PROG.length], tones = triad(tok);
      var broot = ROOTS[tok] - 24;                    // deep house bass root
      // kick: short low four-on-the-floor thump
      if (KICK_ON[sec.mode]) { for (var k = 0; k < 4; k++) { kick.push([m2n(33), 0.25], [null, 0.75]); } }
      else { kick.push([null, 4]); }
      // bass: octave-jump eighths, or sparse, or silent (intro)
      if (sec.mode === 'intro') { bass.push([null, 4]); }
      else if (BASS_FULL[sec.mode]) { for (var e = 0; e < 8; e++) bass.push([m2n(broot + JUMP[e]), 0.5]); }
      else { bass.push([m2n(broot), 1], [null, 1], [m2n(broot + 7), 1], [null, 1]); }
      // pad: sustained drone (root, one octave down)
      pad.push([m2n(ROOTS[tok] - 12), 4]);
      // stab: offbeat one-tone house chord (the third, up an octave)
      if (STAB_ON[sec.mode]) { for (var s = 0; s < 4; s++) { stab.push([null, 0.5], [m2n(tones[1] + 12), 0.5]); } }
      else { stab.push([null, 4]); }
      // arp: 16 sixteenths cycling chord tones up 1–2 octaves
      if (ARP_ON[sec.mode]) {
        var seq = [tones[0] + 12, tones[1] + 12, tones[2] + 12, tones[0] + 24, tones[2] + 12, tones[1] + 12, tones[2] + 24, tones[1] + 12];
        for (var a2 = 0; a2 < 16; a2++) arp.push([m2n(seq[a2 % 8]), 0.25]);
      } else { arp.push([null, 4]); }
    }
  });

  return {
    bpm: 126,
    tracks: [
      { type: 'triangle', vol: 0.085, notes: bass },     // deep house bass (the pump)
      { type: 'triangle', vol: 0.050, notes: kick },      // faked four-on-the-floor kick
      { type: 'square',   vol: 0.026, notes: stab },      // offbeat chord stab
      { type: 'square',   vol: 0.022, notes: arp },       // techno 16th arp
      { type: 'square',   vol: 0.024, notes: pad },       // sustained pad drone
      { type: 'square',   vol: 0.056, notes: lead }       // the lead line
    ]
  };
})();

