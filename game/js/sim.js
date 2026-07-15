// ============================================================================
// sim.js — pure logic. NO Phaser, NO DOM. Must run in Node untouched — that is
// the multiplayer seam test (ARCHITECTURE.md §4). Scenes call these; they never
// re-implement the math.
// ============================================================================
var SIM = (function () {

  // Seeded rng (mulberry32). All GAMEPLAY randomness flows through this;
  // cosmetic jitter may use Math.random() freely. (Seam rule 4)
  var _seed = 1337;
  function seed(s) { _seed = s >>> 0; }
  function rng() {
    _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
    var t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Damage model (TM-2): attacker damage scaled by ATT, reduced flat by DEF.
  function damage(baseDmg, att, def) {
    var out = Math.floor(baseDmg * (1 + att / 50)) - Math.floor(def);
    return Math.max(DATA.combat.minDamage, out);
  }

  // Shots per second from DEX (TM-2).
  function fireRate(weapon, dex) { return weapon.baseRate + dex * weapon.dexRate; }

  // Stats at a given level: base + growth*(level-1), clamped to caps.
  // M5.4 (user): LEVEL IS COSMETIC — unless DATA.xp.levelPower is true, the
  // level term is dropped (effLevel 1), so a hero's base stats never change
  // with level; power is GEAR + POTIONS only. Mobs scale with level instead
  // (waves.mobLevelScale). Flip DATA.xp.levelPower to restore per-level growth.
  function statsAtLevel(cls, level) {
    var out = {};
    var effLevel = (DATA.xp && DATA.xp.levelPower) ? level : 1;
    for (var k in cls.base) {
      out[k] = Math.min(cls.caps[k], Math.round(cls.base[k] + cls.growth[k] * (effLevel - 1)));
    }
    return out;
  }

  // M5.4: the mob difficulty multiplier for a given player level — HP · damage
  // · XP all scale by this at spawn. 1.0 at level 1; grows with waves.mobLevelScale.
  function mobLevelMult(playerLevel) {
    var k = (DATA.waves && DATA.waves.mobLevelScale) || 0;
    return 1 + (Math.max(1, playerLevel || 1) - 1) * k;
  }

  // M5.5: the highest-tier COLLECTED item a class can use in a slot (weapons +
  // abilities are class-locked; armor + rings are universal). null if none.
  function bestCollected(collected, cls, slot) {
    var best = null, bestTier = -1;
    (collected || []).forEach(function (k) {
      var it = DATA.items[k];
      if (!it || it.slot !== slot || (it.cls && it.cls !== cls)) return;
      if (it.tier > bestTier) { bestTier = it.tier; best = k; }
    });
    return best;
  }

  // M2: full character stats = level stats + drunk potions, clamped to caps
  // (R5 — potions are the post-20 progression). potionsDrunk may be omitted.
  // M3: + equipment bonuses, applied AFTER the cap clamp — gear pushes past
  // caps, which is exactly why it still matters to a maxed character.
  function statsFor(cls, level, potionsDrunk, equipment) {
    var out = statsAtLevel(cls, level);
    if (potionsDrunk) {
      for (var k in out) {
        out[k] = Math.min(cls.caps[k], out[k] + (potionsDrunk[k] || 0) * DATA.potions.boost);
      }
    }
    if (equipment) {
      var eb = equipBonus(equipment);
      for (var k2 in out) out[k2] += (eb[k2] || 0);
    }
    return out;
  }

  // --- M3: EQUIPMENT MATH (pure — the vault UI, chest overlay, and player all
  // call these; nothing else re-implements item effects). --------------------

  // Sum the flat stat bonuses of everything equipped ({weapon,ability,armor,ring}
  // of item keys or null).
  function equipBonus(equipment) {
    var sum = {};
    for (var slot in equipment) {
      var it = equipment[slot] && DATA.items[equipment[slot]];
      if (!it || !it.bonus) continue;
      for (var k in it.bonus) sum[k] = (sum[k] || 0) + it.bonus[k];
    }
    return sum;
  }

  // The equipped weapon item's damage add (0 when the slot is empty).
  // M5.1: + arcDeg — a melee arc OVERRIDE (the knight's epic Ragefang sweeps
  // a full 360°); 0 = no override, the weapon's own arc applies.
  function weaponMod(equipment) {
    var it = equipment && equipment.weapon && DATA.items[equipment.weapon];
    return { dmg: (it && it.mod && it.mod.dmg) || 0,
             arcDeg: (it && it.mod && it.mod.arcDeg) || 0,
             homing: !!(it && it.mod && it.mod.homing),         // M5.1: wizard missiles
             volleyShot: !!(it && it.mod && it.mod.volleyShot), // M5.1: ranger auto-volley
             freeEnergy: !!(it && it.mod && it.mod.freeEnergy) };
  }

  // M5.1 (user): the FULL-LEGENDARY SET — every equipped slot holds a T5.
  // Powers the class-colored body aura and the knight's UNLIMITED RAGE.
  function fullLegendSet(equipment) {
    if (!equipment) return false;
    var slots = DATA.equipSlots;
    for (var i = 0; i < slots.length; i++) {
      var it = equipment[slots[i]] && DATA.items[equipment[slots[i]]];
      if (!it || it.tier !== 5) return false;
    }
    return true;
  }

  // The ability as modified by the equipped ability item. M4.6: generalized
  // beyond the volley — every channel reads its own field. Floors keep gear
  // from ever making an ability free: mpCost ≥ 4 (volley), mpPerShot ≥ 0.5
  // (barrage tomes), mpDrainPerSec ≥ 6 (whirlwind war horns). Fields an
  // ability doesn't define come back as their (floored) zero-case — harmless,
  // nothing reads them.
  function abilityFor(ab, equipment) {
    var it = equipment && equipment.ability && DATA.items[equipment.ability];
    var mod = (it && it.mod) || {};
    return { mpCost: Math.max(4, (ab.mpCost || 0) + (mod.mpCost || 0)),
             count: (ab.count || 0) + (mod.count || 0),
             mpPerShot: Math.max(0.5, (ab.mpPerShot || 0) + (mod.mpPerShot || 0)),
             mpDrainPerSec: Math.max(6, (ab.mpDrainPerSec || 0) + (mod.mpDrainPerSec || 0)) };
  }

  // M4.6: CLASS-LOCKED DROPS — remap a rolled item key to the roller's class
  // line (same slot, same tier) via DATA.classGear. Classless items (armor,
  // rings) and own-class rolls pass through untouched. Pure + deterministic:
  // it never touches the RNG stream, so existing loot sequences are preserved
  // for the ranger (identity remap) and merely re-skinned for the others.
  function resolveDrop(key, cls) {
    var it = DATA.items[key];
    if (!it || !it.cls || it.cls === cls) return key;
    var line = DATA.classGear && DATA.classGear[cls] && DATA.classGear[cls][it.slot];
    return (line && line[it.tier]) || key;
  }

  // M4.6: per-class INCOMING damage scaling (user: monsters should hit the
  // Knight and Wizard harder, the boss hardest). Applied by Entities.hurtPlayer
  // BEFORE the flat DEF subtraction. A class without dmgTaken takes 1x.
  function incomingDmg(cls, dmg, fromBoss) {
    var dt = cls && cls.dmgTaken;
    if (!dt) return dmg;
    return Math.round(dmg * ((fromBoss ? dt.boss : dt.mob) || 1));
  }

  // Weighted drop roll from DATA.dropTables entries (seam rule 4 — SIM.rng).
  function rollDrop(entries) {
    var total = 0, i;
    for (i = 0; i < entries.length; i++) total += entries[i].w;
    var pick = rng() * total;
    for (i = 0; i < entries.length; i++) {
      pick -= entries[i].w;
      if (pick < 0) return entries[i].item;
    }
    return entries[entries.length - 1].item;
  }

  // True if drinking one more potion of `stat` would change nothing (at cap).
  function potionWasted(cls, level, potionsDrunk, stat) {
    var now = statsFor(cls, level, potionsDrunk);
    return now[stat] >= cls.caps[stat];
  }

  // Returns levels gained given current level/xp after adding gain.
  function applyXp(level, xp, gain) {
    xp += gain;
    var ups = 0;
    while (level + ups < DATA.xp.cap && xp >= DATA.xp.needed(level + ups)) {
      xp -= DATA.xp.needed(level + ups); ups++;
    }
    if (level + ups >= DATA.xp.cap) xp = 0;
    return { level: level + ups, xp: xp, ups: ups };
  }

  // Fresh intent object — ALL input becomes this (seam rule 2).
  function makeIntent() { return { moveX: 0, moveY: 0, aimAngle: 0, firing: false, ability: false }; }

  return { seed: seed, rng: rng, damage: damage, fireRate: fireRate,
           statsAtLevel: statsAtLevel, statsFor: statsFor, mobLevelMult: mobLevelMult,
           bestCollected: bestCollected, potionWasted: potionWasted,
           equipBonus: equipBonus, weaponMod: weaponMod, abilityFor: abilityFor,
           fullLegendSet: fullLegendSet,
           resolveDrop: resolveDrop, incomingDmg: incomingDmg,
           rollDrop: rollDrop, applyXp: applyXp, makeIntent: makeIntent };
})();

// Allow headless Node tests: `node -e "global.DATA=require(...);..."` style.
if (typeof module !== 'undefined') { module.exports = SIM; }
