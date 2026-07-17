# LUNAR — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This folder
is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in [[ten-maps-campaign]]
  + docs/TEN_MAPS_PLAN.md.

## Deliverables
1. `map.js` — MAPS.register({ id:'lunar', ... }). Realm 'lunar', boss
   'specimenzero', music 'lunar', lowGrav cfg { kbMult ~2.0, dampMult,
   padLaunch { dist, airMs }, dustRate — ALL TUNE }. NINE mob rows + the
   scuttler mini (brood-sac spawn, cheap). Boss def mapOwned, NO radial/
   stream. Console 'lunar' unlocked.
2. `art.js` — port picked draws from assets/render/render_lunar_mobs.js
   (#4 7 8 9 10 11 12 18 20 + scuttler #1 as the sac's hatchling),
   render_lunar_boss_final.js (CANON), all 20 decor, 6 tiles. MOB_DISPLAY:
   watcher ~46 · sac ~52 · drone ~44 · turret ~48 · revenant ~50 · magnetron
   ~46 · leaper ~44 · mine ~40 · horror ~56 · scuttler ~24 (TUNE). Boss
   display ~150.
3. `scene.js` — PLAN layout per assets/lunar_scene_plan.png: module floors +
   walls, corridors + airlock doors (decor-gated, auto-open like graveyard
   gate), crater belt, jump pads, wrap (seam over open regolith).
4. LOW GRAVITY per PLAN §2: implement as (a) global knockback velocity mult +
   longer decay applied in the knockback/shove helpers for player AND mobs,
   (b) dodge glide (reduced friction during dash recovery), (c) jump pads =
   scripted arc tween (airborne flag: skip contact damage, zones still hit;
   respect hitstop/pause — manual mover rule), (d) dust puff particles on
   step/land (pooled, cleared in annihilateSwarm).
5. Boss per PLAN §5. LIGHTS-OUT entrance = arena dim overlay + staged
   emergency lights (scene FX; initSpecimenZero must NOT wipe it mid-fight).
   GRAVITY WELL pull respects hitstop; CONTAINMENT PURGE sectors are
   arena-local warned zones; VENTED reads bs.ventedUntil in hurtBoss.
6. Music port ("SEA OF TRANQUILITY", 54 bars @72; verify vs
   assets/lunar_theme.wav) + SFX PLAN §6.
7. Suite `test/m10_lunar_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
pad[].cooldownUntil / player._padAir.until · dust puffs dieAt · sac mob
hatchAt / nextWaveAt · drone nextBurstAt · turret sweepUntil / nextSweepAt ·
revenant grabUntil / nextGrabAt · leaper hopUntil / landAt · mine armAt /
beepUntil / blastAt · horror nextConeAt / coneLockUntil · boss: nextBarrageAt
/ barrage[].at / nextLashAt / lashLockUntil / nextWellAt / well.until /
nextCableAt / nextScreamAt / ring.until / nextPurgeAt / purgeSeq[].at /
ventedUntil / rootUntil / _dark.until · every _zoneWarn.until. (Skip
Infinity-parked.)

## Traps specific to this map
- The knockback MULT must not break existing tests that assert shove
  distances — it's realm-scoped (apply only when realmId==='lunar').
- Magnetron pull + Gravity Well pull are positional forces — respect
  hitstop/pause; apply BEFORE wrap check.
- Orbital Mine: shooting it pops it EARLY at its position — blast damages
  mobs (killMobCredited) and player (plain hurtPlayer); the mine's own death
  via blast must not double-credit.
- Brood Sac dormancy: no AI until proximity trigger; hatch through
  queueSpawn; cap live scuttlers (TUNE).
- Astro-Revenant floats over walls (banshee float flag); its grab is a brief
  hold — MUST release on hitstop/pause/death, and shift grabUntil.
- Jump pad airborne state: player invulnerable to CONTACT only — boss zones
  and beams still land (no cheese).
- Suites: disable jump-pad cooldowns' randomness (none — deterministic),
  stand nothing down (no ambient clock!) but DO pin mine spawns before
  fixture work.

## assets/ inventory
lunar_mob_options.png (20) · lunar_decor_options.png (20) ·
lunar_tile_options.png (10) · lunar_boss_options.png (10) ·
lunar_boss_final.png (CANON) · lunar_scene_plan.png (CANON layout) ·
lunar_theme.wav (180.0s reference) · render/ (space_kit.js + all render
scripts; RANGER_PATH → game/js/ranger_art.js).
