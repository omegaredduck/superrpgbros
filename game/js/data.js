// ============================================================================
// data.js — ALL tunable numbers live here. Balance the game by editing this
// file only. No magic numbers allowed in scenes/entities. (ARCHITECTURE.md §3)
// ============================================================================
var DATA = {

  // --- Classes (Fusion Law F7). Only Ranger exists at M0. -------------------
  // M1 tuning sweep (2026-07-11): spd 170→180 (dodging is the skill — F2;
  // player must feel faster than the swarm), baseRate 1.5→1.7 (punchier).
  classes: {
    ranger: {
      name: 'Ranger',
      base:   { hp: 100, mp: 100, att: 12, def: 0, spd: 180, dex: 12 },
      growth: { hp: 12,  mp: 6,   att: 1,  def: 0.34, spd: 1.4, dex: 0.8 }, // per level
      caps:   { hp: 700, mp: 300, att: 60, def: 25, spd: 260, dex: 55 },
      mpRegenPerSec: 4,
      weapon: 'bow',
      ability: 'volley'
    }
  },

  weapons: {
    bow: { dmg: 14, projSpeed: 560, lifeMs: 700, texture: 'arrow',
           // shots per second = 1.7 + dex * 0.055  (see sim.fireRate)
           baseRate: 1.7, dexRate: 0.055,
           // E8 (2026-07-12): the weapon is now VISIBLY held — a sprite that
           // dynamically aligns to the aim direction (F2: mouse aims).
           heldTexture: 'bow', holdOffset: 15 }
  },

  abilities: {
    volley: { mpCost: 22, count: 5, spreadDeg: 26, dmgMult: 1.1,
              projSpeed: 620, lifeMs: 800, pierce: true, cooldownMs: 600 }
  },

  // --- XP curve (Fusion Law F4): xp needed to go from level L to L+1 --------
  xp: { cap: 20, needed: function (level) { return Math.floor(40 + level * level * 14); } },

  combat: {
    iframesMs: 500,          // no double-hits inside this window (TM-2)
    contactTickMs: 350,      // how often a touching chaser re-applies contact damage
    knockback: 160,          // M1: 140→160 — hits should visibly move the swarm
    minDamage: 1
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
                        count: 3, spreadDeg: 34, lifeMs: 3000 }, unlockAt: 75 }
  },

  // --- Wave director (Fusion Law F3) ----------------------------------------
  waves: {
    spawnIntervalMs: 2200,               // M1: 2400→2200 — slightly steadier pressure
    budget: function (tSec) { return 2 + Math.floor(tSec / 18); }, // points per spend
    maxAlive: 150,                        // hard cap; pooling recycles (TM-3, TM-5)
    spawnRing: { min: 480, max: 640 }     // distance from player, off-screen (V11)
  },

  realm:  {
    size: 2400, name: 'Grasslands of Woe',   // size = fallback when no map loads (150 tiles × 16)
    // M2 (F8/R13): kill quota opens the boss portal; killing the boss closes
    // the realm. Q4 target: ~12 min to the portal at competent play — TUNE ME
    // against real runs (Fun Gate 1 data).
    killQuota: 150,
    closeXpBonus: 350,          // flat XP paid out when the realm closes
    boss: 'grovekeeper',
    biome: 'grasslands',        // E7: the wave director reads the BIOME roster
    map: 'realm1'               // M3 (Lane C): the realm loads this map JSON (MAPS.get)
  },
  nexus:  { w: 960, h: 640 },   // minimum safe-zone size (RESIZE mode can grow it)

  // --- E7 (M2.1): biomes — mob variants ATTACH to a dedicated biome. A biome
  // owns its roster (and later its tileset/palette at M5). The director builds
  // its spawn pool from the realm's biome, never the global mob table.
  biomes: {
    grasslands: { name: 'Grasslands', tile: 'floor_realm',
                  mobs: ['slime', 'brute', 'spitter', 'warlock'] }
    // M5: dunes { scarab, sandworm, mirage-caster... }, crypt { skeleton,
    // wraith, bone-warlock... } — new biome = new row + roster, no new code.
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
    hotkey: 'P',
    prompt: 'SPACE — use the PORTAL MACHINE',
    maxAffixes: 3,               // slots on the board
    affixChoices: ['apex', 'escalating', 'hordes'],   // keys into affixes.map
    modes: ['clear', 'survival'],                     // spawnable destinations
    sealed: [                    // future realms live IN the console now (M5)
      { label: 'SEALED REALM', sub: 'a new biome opens here (M5)' },
      { label: 'SEALED REALM', sub: 'a new biome opens here (M5)' }
    ],
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
    grovekeeper: {
      name: 'The Grovekeeper', texture: 'boss1',
      hp: 1400, spd: 42, xp: 200, contactDmg: 22, deathTint: 0x38b764,
      lootTable: 'grovekeeper',        // M3: the chest rolls items from this table
      // two attack patterns, alternating (MILESTONES M2): radial burst + aimed stream
      patterns: {
        radial: { count: 24, dmg: 12, projSpeed: 165, lifeMs: 3400, everyMs: 2600 },
        stream: { shots: 7,  dmg: 10, projSpeed: 300, lifeMs: 2400, gapMs: 110, everyMs: 3400 }
      },
      // E3: scouter workup sheet — one tactical hint per pattern + a summary line.
      title: 'GUARDIAN OF THE GRASSLANDS',
      hints: [
        'RADIAL BURST — 24 bolts in a full ring. Do not run; slip through a gap.',
        'AIMED STREAM — 7 rapid bolts, each re-aimed at you. Strafe in one arc.',
        'Slow but relentless chase. Never let it corner you against the world edge.'
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
  tiers: [
    { name: 'T0', color: 0x94b0c2 },   // common — grey
    { name: 'T1', color: 0x38b764 },   // uncommon — green
    { name: 'T2', color: 0x41a6f6 },   // rare — blue
    { name: 'T3', color: 0x8f3fb5 }    // epic — purple
  ],
  vault: { slots: 8 },
  items: {
    // weapons (bows) — mod.dmg adds to the bow's base damage per shot
    w0: { name: 'Worn Shortbow',    slot: 'weapon',  tier: 0, texture: 'bow',
          mod: { dmg: 2 },  desc: '+2 weapon damage' },
    w1: { name: 'Oak Bow',          slot: 'weapon',  tier: 1, texture: 'bow',
          mod: { dmg: 4 },  desc: '+4 weapon damage' },
    w2: { name: "Hunter's Recurve", slot: 'weapon',  tier: 2, texture: 'bow',
          mod: { dmg: 7 },  bonus: { dex: 2 }, desc: '+7 weapon damage · +2 DEX' },
    w3: { name: 'Grovepiercer',     slot: 'weapon',  tier: 3, texture: 'bow',
          mod: { dmg: 11 }, bonus: { dex: 4 }, desc: '+11 weapon damage · +4 DEX' },
    // ability items (quivers) — mod.mpCost / mod.count adjust the volley
    a0: { name: 'Cracked Quiver',   slot: 'ability', tier: 0, texture: 'quiver',
          mod: { mpCost: -2 },            desc: 'volley costs 2 less MP' },
    a1: { name: 'Leather Quiver',   slot: 'ability', tier: 1, texture: 'quiver',
          mod: { mpCost: -4 },            desc: 'volley costs 4 less MP' },
    a2: { name: "Hunter's Quiver",  slot: 'ability', tier: 2, texture: 'quiver',
          mod: { mpCost: -4, count: 2 },  desc: '+2 volley arrows · costs 4 less MP' },
    a3: { name: 'Storm Quiver',     slot: 'ability', tier: 3, texture: 'quiver',
          mod: { mpCost: -6, count: 4 },  bonus: { mp: 20 },
          desc: '+4 volley arrows · costs 6 less MP · +20 MP' },
    // armor — flat DEF (and HP up the tiers)
    ar0: { name: 'Padded Vest',      slot: 'armor', tier: 0, texture: 'armor',
           bonus: { def: 2 },            desc: '+2 DEF' },
    ar1: { name: 'Leather Armor',    slot: 'armor', tier: 1, texture: 'armor',
           bonus: { def: 4, hp: 15 },    desc: '+4 DEF · +15 HP' },
    ar2: { name: 'Studded Armor',    slot: 'armor', tier: 2, texture: 'armor',
           bonus: { def: 7, hp: 30 },    desc: '+7 DEF · +30 HP' },
    ar3: { name: 'Grovewarden Mail', slot: 'armor', tier: 3, texture: 'armor',
           bonus: { def: 11, hp: 60 },   desc: '+11 DEF · +60 HP' },
    // rings — pure stat jewelry (the RotMG slot)
    r0: { name: 'Copper Ring',          slot: 'ring', tier: 0, texture: 'ring',
          bonus: { hp: 10 },             desc: '+10 HP' },
    r1: { name: 'Ring of Swiftness',    slot: 'ring', tier: 1, texture: 'ring',
          bonus: { spd: 12 },            desc: '+12 SPD' },
    r2: { name: 'Ring of Might',        slot: 'ring', tier: 2, texture: 'ring',
          bonus: { att: 5, hp: 20 },     desc: '+5 ATT · +20 HP' },
    r3: { name: 'Ring of the Colossus', slot: 'ring', tier: 3, texture: 'ring',
          bonus: { hp: 80, def: 3 },     desc: '+80 HP · +3 DEF' }
  },

  // --- M3: DROP TABLES — weighted rolls (SIM.rollDrop, seam rule 4). A chest
  // rolls its table `rolls` times. Boss tables skew T1 with real T2/T3 odds;
  // the time trial pays pocket change (T0/T1).
  dropTables: {
    grovekeeper: { rolls: 2, entries: [
      { item: 'w1', w: 14 }, { item: 'a1', w: 14 }, { item: 'ar1', w: 14 }, { item: 'r1', w: 14 },
      { item: 'w2', w: 7 },  { item: 'a2', w: 7 },  { item: 'ar2', w: 7 },  { item: 'r2', w: 7 },
      { item: 'w3', w: 2 },  { item: 'a3', w: 2 },  { item: 'ar3', w: 2 },  { item: 'r3', w: 2 }
    ]},
    trial: { rolls: 1, entries: [
      { item: 'w0', w: 16 }, { item: 'a0', w: 16 }, { item: 'ar0', w: 16 }, { item: 'r0', w: 16 },
      { item: 'w1', w: 5 },  { item: 'a1', w: 5 },  { item: 'ar1', w: 5 },  { item: 'r1', w: 5 }
    ]},
    // M3 affix v2: the champion-bounty table — one roll per champion killed
    // (see DATA.affixes.championBounty), added to the realm's boss chest.
    champion: { rolls: 1, entries: [
      { item: 'w0', w: 8 },  { item: 'a0', w: 8 },  { item: 'ar0', w: 8 },  { item: 'r0', w: 8 },
      { item: 'w1', w: 10 }, { item: 'a1', w: 10 }, { item: 'ar1', w: 10 }, { item: 'r1', w: 10 },
      { item: 'w2', w: 3 },  { item: 'a2', w: 3 },  { item: 'ar2', w: 3 },  { item: 'r2', w: 3 }
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
      // M3.5 PORTAL WORKS: ELECTRICITY for the charge-up — a rising jittery
      // sawtooth arc with a gated white-noise crackle bed underneath...
      charge:  { type: 'sawtooth', arp: [90, 110, 95, 140, 130, 180, 170, 240, 230, 320, 340, 460],
                 jitter: 0.18, len: 1.5, vol: 0.16, limitMs: 800,
                 noise: { vol: 0.10, hp: 1800 } },
      // ...and the PHASER for the portal tearing open — a bright descending
      // zap with a short spark tail.
      spawn:   { type: 'square',   freq: 1500, freqEnd: 140, len: 0.45, vol: 0.26, limitMs: 400,
                 noise: { vol: 0.06, hp: 2400 } }
    },

    // --- M3.9: MUSIC — "The Chamber at Rest" (ORIGINAL composition, 2026).
    // The user asked for the Balamb Garden theme; that melody is copyrighted
    // (Uematsu/Square Enix — even as an 8-bit cover), so this is an original
    // piece written for the same feeling: a warm, slow, safe-place loop.
    // Classic I–V–vi–iii–IV–I–ii/V–I progression, three chip voices:
    // triangle bass · soft square arpeggios · lyrical square lead.
    // Notes are [name, beats]; null = rest. All tracks must sum to equal beats.
    music: {
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
  // but movement uses the four move* actions. M (builder) + F3 (debug) stay
  // hardcoded dev keys, deliberately not remappable.
  keybinds: {
    list: [
      { id: 'moveUp',      label: 'Move up',        def: 'KeyW',    group: 'Movement' },
      { id: 'moveLeft',    label: 'Move left',      def: 'KeyA',    group: 'Movement' },
      { id: 'moveDown',    label: 'Move down',      def: 'KeyS',    group: 'Movement' },
      { id: 'moveRight',   label: 'Move right',     def: 'KeyD',    group: 'Movement' },
      { id: 'interact',    label: 'Interact / cast',def: 'Space',   group: 'Combat' },
      { id: 'autofire',    label: 'Toggle auto-fire',def:'KeyT',    group: 'Combat' },
      { id: 'portal',      label: 'Portal machine', def: 'KeyP',    group: 'Chamber' },
      { id: 'vault',       label: 'Vault',          def: 'KeyV',    group: 'Chamber' },
      { id: 'bestiary',    label: 'Bestiary',       def: 'KeyB',    group: 'Chamber' },
      { id: 'recordsUp',   label: 'Records screen', def: 'KeyR',    group: 'Chamber' },
      { id: 'recordsDown', label: 'Graveyard screen',def:'KeyG',    group: 'Chamber' },
      { id: 'menu',        label: 'Menu / pause',   def: 'Escape',  group: 'System' },
      { id: 'fullscreen',  label: 'Fullscreen',     def: 'KeyF',    group: 'System' }
    ]
  }
};
