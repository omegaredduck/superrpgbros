# MAP REGISTRY SPEC — the one-time core refactor (build FIRST, before any map)

*Master List note 15: every new map lives in its own standalone folder so multiple
AIs can contribute without overlapping. This spec is the contract. The four LIVE
realms (yard/grove/graveyard/factory) STAY IN CORE — Red's call — only the new
maps use folders.*

## Folder layout (per map)

```
game/js/maps/<mapId>/
  map.js       — data: self-registers realm/biome/mobs/boss/dropTable/SFX/music
  art.js       — draw fns + texture builds (mobs/boss/tiles/decor) for this map
  scene.js     — scene hooks: setup/update/wrap/ambient cycle/boss verbs/unfreeze
  PLAN.md      — the locked design (from the design session)
  BUILD_INSTRUCTIONS.md — build order + gotchas for the implementing AI
  assets/      — approved option sheets, scene plan PNG, theme WAV, render scripts
```

## Core hooks (add ONCE to core, keep tiny)

1. `window.MAPS = { defs: {}, register(def) { this.defs[def.id] = def; } }`
   (new file `game/js/maps/registry.js`, loaded BEFORE any map file and AFTER
   data.js/entities.js exist as globals).
2. index.html: one `<script src="js/maps/registry.js?v=...">` then one script tag
   per map folder (map.js, art.js, scene.js). ?v= bump applies to all.
3. data.js (end): `Object.values(MAPS.defs).forEach(d => d.installData(DATA))` —
   each map merges its DATA.realms/biomes/mobs/bosses/dropTables/audio rows.
   Balance numbers still live in the map's map.js — same "numbers in data" rule,
   scoped to the map file.
4. textures.js buildHiFiWorld (end): `Object.values(MAPS.defs).forEach(d =>
   d.buildArt && d.buildArt(TEX_CTX))` — map art.js registers its `<name>Hi`
   textures + MOB_HI/MOB_DISPLAY/BOSS_HI entries through the same helpers core
   mobs use.
5. scenes.js RealmScene:
   - create(): after core world setup — `const M = MAPS.defs[this.realmId];
     if (M && M.scene.setup) M.scene.setup(this);`
   - update(): `if (M && M.scene.update) M.scene.update(this, time, dt);`
     (map update owns its wrap + ambient cycle + conveyor-style movers).
   - unfreeze(delta): `if (M && M.scene.unfreeze) M.scene.unfreeze(this, delta);`
     — EVERY map-owned absolute clock shifts here (the #1 recurring bug family).
   - boss verbs: updateBoss dispatches to `M.scene.bossUpdate(this, boss)` when
     `DATA.bosses[key].mapOwned` — same no-return pattern as grovekeeper (generic
     radial/stream keys only if the def has them; the m6e guards already exist).
6. Entities.updateMob: map mobs use EXISTING verb keys wherever possible (shoot/
   lunge/guardAura/mend/slowField/pull/flameCircle/split/blink/wail...). A map
   needing a NEW verb adds it via `M.mobVerbs = { verbName(scene, m, dt){...} }`
   consumed by a single core hook in the mob update loop.

## Hard rules (all proven the hard way — see docs/ + memory)

- Mechanic spawns ONLY through RealmScene.queueSpawn (never group.get in an
  iterate). Env kills credit via killMobCredited. Every boss damage source
  fromBoss=true. Colored shots = orbShot + tint. TINTS MULTIPLY — tint neutral
  greyscale art only.
- Every new absolute timestamp goes on the map's unfreeze shift list. Relative
  windows off lastHitAt don't shift.
- Scene reuse: map scene.setup must RESET all its own instance state (Phaser
  reuses scene instances) and clear its pools in annihilateSwarm via the
  provided hook (M.scene.annihilate).
- Suites: stand the map's ambient cycle down first (nextAt = Infinity); boss
  flows waitForFunction(r.boss && r.scanning); headless throttles rAF — drive
  real-time delayedCall flows deterministically (synthetic clock for player-sims).
- Boss: ≤6 scouter hints; bestiary pattern lines cap at 7; TEXT-FIT check both.
- Music: port the WAV's composition as a data-side section-composer with
  EQUAL-BEAT tracks (assert by construction); register under DATA.audio.music
  via installData; realm plays realmDef.music.
- Toroidal wrap standard: wrap player + this.mobs (skip boss + bossWave mobs),
  body.reset preserving velocity — mirror wrapGraveyard/wrapFactory.
- Console: each map unlocks a console map id; bestiary follows consoleMap.
  No-map starts stay the trainyard (suite compat).
- ?v= bump on every js change; full battery green before ship.
