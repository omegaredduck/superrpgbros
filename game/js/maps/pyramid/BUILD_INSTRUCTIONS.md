# PYRAMID — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST (shared contract + hard rules),
then `PLAN.md` here (the locked design). This folder is the whole map — do not
edit core beyond the registry hooks.*

## Prerequisites
- MAPS registry refactor built + battery green (see REGISTRY_SPEC.md).
- Project memory [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md for the
  campaign rules (boss contract: telegraphed ground overlays, NO burst+radial
  spam; wrap; text-fit).

## Deliverables
1. `map.js` — MAPS.register({ id:'pyramid', ... }). Realm def: kind 'pyramid',
   boss 'neferuka', music 'pyramid', curse cfg { buffMs, dotMs/dmg, trapArm
   thresholds, waveAt — ALL TUNE }. Biome roster of 8 (scarab cheap →
   golem/priest late). Boss def: TWO-PHASE via def.transform (reuse the
   engineer floorLift/boss-died branching pattern), mapOwned verbs, NO
   radial/stream keys. Console map 'pyramid' unlocked.
2. `art.js` — port picked draws from `assets/render/render_pyramid_mobs.js`
   (#1 3 5 7 10 11 12 14), `render_pyramid_boss_final.js` (BOTH forms, canon),
   all 20 decor, floors per PLAN §3 (+ mist... no — quicksand from
   render_pyramid_tiles.js #8). MOB_DISPLAY: scarab ~26 · brood ~56 · guard
   ~48 · priest ~44 · weaver ~50 · apep ~54 · jackal ~46 · golem ~60 (TUNE).
   Boss: child ~120 display (small body, big presence via mask + wisps),
   executioner ~160.
3. `scene.js` — PLAN-array layout from `assets/pyramid_scene_plan.png`
   (canon): zone floors, causeway, quicksand pools (slow mult, floaters
   exempt — none in this roster, players only), trap plates, lootables,
   4 anubis statues in the arena (scene objects the boss verb drives), wrap.
4. TREASURE & CURSE per PLAN §4: lootable props are scene bodies; walk-over
   loot → XP orbs + buff + curse++ → arm traps / DoT tick / retaliation
   waves (queueSpawn). Urns = free smashables. Ambient retaliation gated
   during arrival/boss.
5. Music port ("THE ETERNAL CHILD", 63 bars @84 D-hijaz — verify against
   assets/pyramid_theme.wav) + SFX list PLAN §6.
6. Suite `test/m8_pyramid_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 scouter hints PER PHASE).

## unfreeze() shift list for THIS map
curse.buffUntil / dotUntil / nextWaveAt · trap[].armedAt / dart warnUntil/at ·
quicksand pool dieAt (if pulsing) · guard mob shieldUntil / nextShieldAt ·
weaver nextWebAt + web dieAt · apep nextLobAt + lob.at + puddle dieAt ·
golem slamWarnUntil/at · priest nextMendAt · boss(1): nextSigilAt/nextGazeAt/
gazeLockUntil/nextQuakeAt/quake aAt/bAt/nextSandsAt/nextSummonAt · transform
_xform.until · boss(2): nextCrossAt/crossLane2At/nextWhirlAt/whirlRingAt/
nextBrandAt/brandAt/nextLeapAt/leapLockAt/nextJudgmentAt/statueSeq[].at/
ventedUntil/rootUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- The SHIELD window on Khopesh Guard is timed ward tech: m.mob.shieldUntil →
  hurtMob no-op + 'BLOCKED' popup; make the window VISIBLE (shield flash) and
  the vulnerable gap generous (TUNE) — no unfair immunity reads.
- Loot buffs stack count is capped (TUNE); DECLINED... n/a — loot is auto on
  walk-over; keep orbs through the normal XP pipeline.
- Trap darts + statue beams + quake tiles damage MOBS too → killMobCredited;
  boss-owned versions pass fromBoss=true for player damage.
- The 4 arena statues are scene objects — initNeferuka must NOT wipe them or
  the curse fx mid-fight (grove initGrovekeeper lesson); phase-2 re-arms
  through it.
- Transformation reuses the engineer cutscene plumbing: phase-1 boss-died →
  branch on def.transform → cinematic (input-safe, unfreeze-safe) → swap
  texture/body dims (mech precedent: resize body at transform!).
- Suites: park curse.nextWaveAt = Infinity + disarm traps before fixtures;
  synthetic-clock any player-sim (headless rAF throttle).
- Quicksand slow = speed MULT in the mover (hitstop/pause safe).

## assets/ inventory
pyramid_mob_options.png (20) · pyramid_decor_options.png (20) ·
pyramid_tile_options.png (10) · pyramid_boss_pharaoh.png (10) ·
pyramid_boss_anubis.png (10) · pyramid_boss_final.png (CANON both forms) ·
pyramid_scene_plan.png (CANON layout) · pyramid_theme.wav (180.0s reference) ·
render/ (egypt_kit.js + all render scripts; RANGER_PATH → game/js/ranger_art.js).
