# SKYISLES — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST (the shared contract + hard rules),
then `PLAN.md` here (the locked design). Do NOT edit core files beyond the
registry hooks — this folder is the whole map.*

## Prerequisites
- The MAPS registry refactor (REGISTRY_SPEC.md) must exist. If you are the
  first map being built, build the registry first and verify the FULL existing
  battery stays green with zero registered maps before adding this one.
- Read project memory [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md for the
  campaign-wide rules (boss contract, wrap, text-fit).

## Deliverables
1. `map.js` — MAPS.register({ id:'skyisles', installData(DATA){...},
   buildArt(ctx){...} (delegates to art.js), scene: {...} (delegates to
   scene.js) }). Realm def: kind 'skyisles', boss 'nimbustalon', music
   'skyisles', mist cfg { slowMult: ~0.55 TUNE }, tempestCycle cfg (all clocks
   TUNE). Biome roster of 8 w/ unlockAt ramp (sprite cheap → hatchling/warden
   late). Boss def carries mapOwned:true, NO radial/stream keys (boss contract
   — the m6e guards make that safe). Console map 'skyisles' unlocked.
2. `art.js` — port the PICKED draws from `assets/render/render_sky_mobs.js`
   (#2 4 8 9 11 15 16 19), `render_sky_boss_final.js` (NIMBUS TALON, the
   final), decor (#1–19, NOT #20), tiles (#1 2 3 5 10) + MIST VEIL sea from
   `render_sky_sea.js` (#4). Keep the sky_kit palette. Register `<name>Hi`
   textures; MOB_DISPLAY: sprite ~30 · ray ~52 · cub ~48 · golem ~58 ·
   warden ~40 · vane ~50 · shepherd ~44 · hatchling ~54 (TUNE by eye);
   BOSS display ~160.
3. `scene.js` — setup/update/wrap/unfreeze/annihilate/bossUpdate per PLAN §3–5.
   The scene-plan PNG (`assets/sky_scene_plan.png`) is the canonical layout —
   translate its 7 islands/bridges/zones into a PLAN array of fraction coords
   (grove precedent). Islands = walkable; mist = slow zone (float-flagged mobs
   exempt); bridges = walkable strips; decor per the plan, no scatter.
4. Music: port SKYBREAKER MARCH from `assets/render/render_sky_theme.js` into
   the map's section-composer — 105 bars @140bpm D minor, equal-beat tracks
   asserted by construction. Verify against `assets/sky_theme.wav` by ear/beat
   count. SFX list in PLAN §6 (chiptune, original).
5. Suite `test/m7_skyisles_verify.js` + full battery + ?v= bump + docs
   (MILESTONES tick, EVENT_LOG entry, bestiary TEXT-FIT ≤6 scouter hints).

## unfreeze() shift list for THIS map (extend as you add clocks)
tempest.nextShiftAt / shiftUntil · strikes[].warnUntil/at · vents[].warnUntil/
at · stormEye.nextRetargetAt (drift is positional, its retarget clock shifts) ·
ray mob nextMarkAt + mark.at · hatchling hopUntil / slamAt · warden
auraPulseAt · shepherd nextMendAt · boss: nextBarrageAt / nextGaleAt /
nextSlamAt / nextDiveAt / nextRodAt / ventedUntil / rootUntil / _shadow.until ·
every _zoneWarn.until. (Skip Infinity-parked clocks.)

## Traps specific to this map
- Mist slow: apply as a speed MULT in the mover, never a body drag (hitstop/
  pause safety); floating mobs (Cloud Ray) skip it.
- Cloud-bank concealment: reset conceal flags each frame BEFORE marking
  (smog-serpent lesson). NOTE: cloud banks are the ONLY concealment on this
  map — the mist-surge cycle piece was CUT by Red (overused); do not add it.
- The Storm Eye is a shadow + swirl DRAWN UNDER entities (depth below mobs),
  drifts positionally (no teleports); its influence radius gates where
  strikes/vents pick their spots + adds a small wind pull vector.
- Roaming strikes + updraft vents + Cloud Ray mini-strikes + hatchling flops:
  env/mob-owned
  zone damage to MOBS credits via killMobCredited; to the PLAYER it's plain
  hurtPlayer (fromBoss only for the boss's verbs).
- Wind shift pushes are positional (updateConveyors precedent) — player AND
  mobs here (unlike factory belts), gentle, and must respect hitstop/pause.
- Boss adds spawn through queueSpawn; the entrance shadow is scene-owned FX —
  initNimbusTalon must NOT wipe it mid-fight (grove initGrovekeeper lesson).
- Suites: park tempest.nextShiftAt = Infinity + clear strikes before fixtures.
- Wrap seam crosses open mist — keep islands off the world border in the PLAN
  array so a wrap never teleports you inside terrain.

## assets/ inventory
sky_mob_options.png (20) · sky_decor_options.png (20) · sky_tile_options.png
(10) · sky_boss_options.png (10) · sky_boss_final.png (CANON boss art) ·
sky_sea_options.png (10) · sky_scene_plan.png (CANON layout) · sky_theme.wav
(180.0s reference) · render/ (sky_kit.js + all render scripts — the draw code
to port; run with RANGER_PATH pointing at game/js/ranger_art.js).
