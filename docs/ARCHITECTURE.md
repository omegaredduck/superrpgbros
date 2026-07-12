# ARCHITECTURE — code structure & the multiplayer seam

## 1. Stack recap

Phaser 3 (CDN, pinned 3.90.0) · plain JS script files, no build step · procedural textures at boot ·
data-driven definitions in `data.js` · localStorage persistence (from M2).

## 2. File map (M3)

```
game/
  index.html          boots Phaser + loads scripts in order (works from file://)
  lib/phaser.min.js   vendored engine (offline; CDN fallback in index.html)
  js/
    data.js           ALL tunable numbers & definitions: classes, mobs, weapons, items,
                      drop tables, affixes, wave director curve, XP curve, tilesets,
                      palette. Balance = edit this file only.
    save.js           versioned localStorage save slots (3 accounts) + device-level
                      settings (volume, auto-fire — key srb_settings, M1). Scenes never
                      touch localStorage directly — only through SAVE.
    audio.js          M1 Lane-A sound: tiny Web Audio chiptune synth, zero audio files.
                      Recipes are data (DATA.audio); presentation-layer only, failure-safe.
    maps.js           M3 map system: JSON schema v1, localStorage store (srb_maps — this
                      module only, same rule as SAVE), export/import, chunked renderer,
                      merged wall bodies, built-in realm1. Pure-data parts run in Node.
    textures.js       Lane-A procedural pixel art: sprite grids → canvas textures at boot
    sim.js            pure-logic helpers: damage math, XP/level math, seeded rng, intents
    entities.js       Player / Mob / Projectile behaviors (Phaser sprites driven by sim data)
    scenes.js         BootScene, TitleScene, NexusScene, RealmScene, HUD
    builder.js        M3: the IN-GAME MAP BUILDER dev scene (M in the nexus — not the
                      player flow). Writes the same JSON the realm loader reads.
    main.js           Phaser config + game start
START_SERVER.bat      local http server for future file-based assets (sprite/atlas batches);
                      NOT needed for maps — imported tiles are embedded in the map JSON
```

Planned extraction at M2: `sim.js` grows into `js/sim/` package (state, systems,
events) imported by scenes — the same shape a future server would import.

## 3. Data-driven rules

- A new mob/class/weapon = a new object in `data.js`, no new code until it needs a new *verb*.
- All balance numbers live in `data.js` with comments. No magic numbers in scenes/entities.
- Mob definitions compose the two verbs (F9): `{ chase: {...} }`, `{ shoot: {...} }`, or both.

## 4. The multiplayer seam (Fusion Law F10) — rules enforced NOW

1. **State is plain data.** Everything that matters (positions, hp, cooldowns, wave state) lives in
   serializable fields — never only inside Phaser objects, tweens, or closures.
2. **Input becomes intents.** Keyboard/mouse produce an intent object `{moveX, moveY, aimAngle,
   firing, ability}` once per frame; gameplay reads intents, never `keyboard.isDown` directly.
3. **Sim mutates, render reads.** Update order: collect intents → sim systems tick (movement,
   firing, mob AI, collisions, xp) → presentation (sprites, bars, particles, shake) reflects state.
   Presentation NEVER writes gameplay state.
4. **Seeded randomness.** All gameplay rng flows through `sim.rng()` (seedable); cosmetic rng
   (particle jitter) may use `Math.random()` freely.
5. **IDs everywhere.** Entities carry stable numeric ids from spawn.
6. **No singletons touching DOM in sim code.** `sim.js` must run in Node untouched — that's the test.

Post-1.0 payoff: a Node server imports `data.js` + `sim/`, owns the tick, broadcasts state over
WebSocket; the Phaser client keeps its render layer and sends intents. Colyseus or raw ws — decide then.

## 5. Scene flow

`Boot` (generate textures) → `Title` (welcome screen: 3 save slots — new game / continue /
two-click delete; keyboard 1/2/3) → `Nexus` (safe, class select later, vault later, portal;
ESC returns to Title) → `Realm` (wave director, kill quota → boss portal at M2) → on death:
permadeath is written to the save immediately, recap → `Nexus` (new character) → on realm
close (M2+): rewards → `Nexus`.

## 6. Save schema (v3 — M3, 2026-07-12; v1/v2 saves migrate losslessly)

Three independent slots under localStorage keys `srb_save_1..3`, all access through
`save.js` (`SAVE.load/save/clear/peek/blank`). Each slot:

```json
{ "v": 3,
  "account": { "unlockedClasses": ["ranger"], "graveyard": [],
               "potions": { "hp": 0, "mp": 0, "att": 0, "def": 0, "spd": 0, "dex": 0 },
               "records": { "bestLevel": 1, "deaths": 0, "totalKills": 0,
                            "realmsEntered": 0, "realmsClosed": 0 } },
  "vault": ["w1", "r3"],
  "character": { "cls": "ranger", "level": 3, "xp": 120,
                 "potionsDrunk": { "hp": 0, "mp": 0, "att": 0, "def": 0, "spd": 0, "dex": 0 },
                 "equipment": { "weapon": "w2", "ability": null, "armor": "ar1", "ring": null } },
  "meta": { "createdAt": 0, "savedAt": 0 } }
```

The survives/dies split (R5, Pillar 3): `account.potions` (unclaimed stash) and `vault`
(≤ `DATA.vault.slots` item keys) SURVIVE death; `character.potionsDrunk` and
`character.equipment` DIE with the character. Items are plain data.js keys — no rolled
stats, so instances need no ids. Character stats are NOT stored — they derive from class +
level + drunk pots + equipment (`SIM.statsFor`; potions clamp to caps, gear applies AFTER
the clamp), so the schema can't drift from balance changes in data.js. TM-4 ladder:
v1→v2 (potions, verified in `test/m2_suite.js`) → v3 (equipment + live vault, verified in
`test/m3b_suite.js`); migration also sanitizes item keys that no longer exist in data.js
(dropped, never a crash — valid items untouched). Loader behavior (TM-4): unknown/garbled
saves are flagged corrupt on the title card — deletable, never a crash. Autosave points:
nexus arrival, realm entry, level-up, potion drink, gear change (chest take / vault swap),
realm close, death. Save export/import as file: M6.

## 7. Affix engine, biomes & modes (E1–E9 scope expansion, from M2.1) — design rules

All of it is data in `data.js`; scenes/entities only apply what the data says:

- **Mob affixes** (`DATA.affixes.mob`): each affix = display name, tint, scale, stat
  multipliers (`hpMult`, `spdMult`, `xpMult`), and behavior flags — ALL FIVE LIVE since
  affix v2 (M3, 2026-07-12). Rolled per spawn (`DATA.affixes.mobRollChance`, through
  `SIM.rng` — seam rule 4) inside `Entities.spawnMob` (which also takes a `forceAffix`
  test/map-affix hook); the rolled affix lives on `m.mob.affix` as plain data (seam rule 1).
  Champions render scaled + tinted and pay bonus XP. Behavior flags act where the verb
  lives: `splitShots`/`splitAngleDeg` (shooters only — bolts fork once mid-flight, in
  `updateProjectiles`), `evolveChance`/`evolve` (one-time evolution on surviving a hit, in
  `hurtMob`), `roleSkew` (director spawns casters while a leader lives, in `directorSpend`).
  `DATA.affixes.championBounty`: champion kills add capped rolls from a drop table to the
  realm's boss chest — affixed mobs drop better without a ground-item system.
- **Equipment & drops (M3)**: `DATA.items` (key → slot/tier/bonus/mod), `DATA.tiers`,
  `DATA.dropTables` (weighted, rolled by `SIM.rollDrop`), `DATA.vault.slots`. All item
  math is in SIM (`equipBonus`, `statsFor` 4th arg, `weaponMod`, `abilityFor`) — pure,
  Node-runnable, one implementation. Chest overlay and vault UI are presentation over
  `CURRENT.equipment`/`GAME_SAVE.vault`; `applyEquipmentChange` re-derives live stats and
  persists on every change.
- **Map affixes** (`DATA.affixes.map`): rolled ONCE at realm entry and displayed on the
  portal pedestal (E5) before the player commits. They mutate the realm config the
  director/boss flow reads (spawn interval, budget, boss count, elite rate) — never scene
  code. Go live at M5 with the multi-realm plaza.
- **Biomes** (`DATA.biomes`): a biome owns `mobs` (roster keys), tile/palette keys, and a
  display name. A realm references a biome; `directorSpend` builds its spawn pool from the
  biome roster, not the global mob table. E7's "mob variants attach to biomes" IS this table.
- **Modes/objectives** (`DATA.modes`): a portal destination = realm def + mode key.
  `clear` = quota → boss portal → boss → loot chest; `survival` = survive `durationSec`,
  no boss. RealmScene reads `this.mode` and branches only at objective checkpoints.
- **Interaction rule (Q6):** SPACE is contextual — the scene checks registered
  interactables (chests, E1) inside `interactRange` BEFORE honoring the ability intent.
- **Boss workup sheets (E3):** `DATA.bosses.*.hints` — one tactical string per attack
  pattern; the scouter overlay renders name/stats/sprite readout + these hints and holds
  combat until dismissed. A new boss brings its own hints, no new UI code.
