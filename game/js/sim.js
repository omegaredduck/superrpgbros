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
  function statsAtLevel(cls, level) {
    var out = {};
    for (var k in cls.base) {
      out[k] = Math.min(cls.caps[k], Math.round(cls.base[k] + cls.growth[k] * (level - 1)));
    }
    return out;
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
  function weaponMod(equipment) {
    var it = equipment && equipment.weapon && DATA.items[equipment.weapon];
    return { dmg: (it && it.mod && it.mod.dmg) || 0 };
  }

  // The ability as modified by the equipped ability item: mpCost (floor 4,
  // never free) and projectile count.
  function abilityFor(ab, equipment) {
    var it = equipment && equipment.ability && DATA.items[equipment.ability];
    var mod = (it && it.mod) || {};
    return { mpCost: Math.max(4, ab.mpCost + (mod.mpCost || 0)),
             count: ab.count + (mod.count || 0) };
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
           statsAtLevel: statsAtLevel, statsFor: statsFor, potionWasted: potionWasted,
           equipBonus: equipBonus, weaponMod: weaponMod, abilityFor: abilityFor,
           rollDrop: rollDrop, applyXp: applyXp, makeIntent: makeIntent };
})();

// Allow headless Node tests: `node -e "global.DATA=require(...);..."` style.
if (typeof module !== 'undefined') { module.exports = SIM; }
