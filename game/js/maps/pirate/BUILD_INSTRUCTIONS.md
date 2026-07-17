# PIRATE — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This folder
is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in [[ten-maps-campaign]]
  + docs/TEN_MAPS_PLAN.md. NOTE THE PIVOT: mobs are LIVING — ghost art/tint is
  used ONLY for the boss's ghost-ship summon.

## Deliverables
1. `map.js` — MAPS.register({ id:'pirate', ... }). Realm 'pirate', boss
   'captainkraken', music 'pirate', swell cfg { periodMs ~12000, leanMs,
   slideForce, barrelSpeed/Dmg — ALL TUNE }. TEN mob rows. Boss def mapOwned,
   NO radial/stream. Console 'pirate' unlocked.
2. `art.js` — port picked draws from assets/render/render_pirate_mobs.js
   (#1 4 5 6 8 10 11 12 15 16), render_pirate_boss_final.js (CANON), the
   colossal entrance tentacle + spectral broadside galleon (new draws — keep
   ghost teal EXCLUSIVE to these), all 20 decor, 6 tiles. MOB_DISPLAY:
   deckhand ~44 · corsair ~48 · monkey ~36 · gull ~36 · siren ~50 · kraken
   arm ~56 · mako ~52 · swab ~46 · harpooner ~50 · octo ~46 (TUNE). Boss ~120.
3. `scene.js` — ship PLAN layout per assets/pirate_scene_plan.png: hull
   walls + rails (solid), dock/gangplank route, zone floors, hold pocket;
   ROCKING DECK per PLAN §2; wrap (seam through water).
4. Rocking deck details: lean telegraph = whole-ship shadow/tint shift +
   creak; slide = positional force on player AND mobs while on ship tiles
   (NOT on beach/dock); apply BEFORE wrap check; respect hitstop/pause.
   Loose-cargo rollers = spawned lane hazards during hard swells
   (killMobCredited for mobs, plain hurtPlayer for player).
5. Boss per PLAN §5. Entrance: colossal tentacle rises (scene FX) + throws
   the boss sprite in an arc onto the foredeck — camera shake, THEN
   r.scanning. GHOST SHIP BROADSIDE: spectral galleon = scene FX sprite to
   starboard; gunport glows = per-lane warnings; two lane waves; ship sinks;
   bs.ventedUntil ×1.5 window (hurtBoss). Kegs shootable (proj-targetable
   zone objects, env-credit on mob kills).
6. Music port ("THE KRAKEN'S SHANTY", 75 bars @100 D dorian; verify vs
   assets/pirate_theme.wav) + SFX PLAN §6.
7. Suite `test/m11_pirate_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
swell.nextAt / leanUntil / slideUntil · barrel[].dieAt · krakenArm mob
emergeAt / sweepAt / withdrawAt · monkey fuseAt / blastAt · gull nextDiveAt ·
siren nextSongAt / songUntil · mako leapAt / landAt · harpooner nextShotAt /
lineWarnUntil / pinUntil (PLAYER pin — release on hitstop/death!) · octo
nextSprayAt + slick dieAt · boss: nextComboAt / comboLockUntil / nextSlamAt /
slamSeq[].at / nextKegAt / keg[].fuseAt / nextCrewAt / nextSwellAt /
nextBroadsideAt / broadside lane warns [].at / ghostShip.sinkAt /
ventedUntil / rootUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- Player PIN (harpoon) is a hard CC — keep it SHORT (TUNE ~0.8s), break on
  boss arrival + realm transitions, and shift pinUntil.
- Siren pull + swell slide can stack — cap combined displacement per frame.
- Kraken Arm is a MOB that occupies a warned deck hole: spawn/despawn through
  queueSpawn; its decoration hole cleared in clearNameTag/annihilateSwarm.
- The ghost ship is FX + zones, NOT an entity — never targetable; initCaptain
  must not wipe it mid-broadside (grove init lesson).
- Barrels/kegs damaging mobs → killMobCredited; boss-owned keg/slam damage to
  the player passes fromBoss=true.
- Suites: park swell.nextAt = Infinity + no barrels before fixtures; monkey
  fuse is deterministic (no random).
- Ghost teal (#5fe8c2 family) appears NOWHERE except the boss summon + his
  eye FX — Red's living-crew pivot depends on this read.

## assets/ inventory
pirate_mob_options.png (20, v2 living crew; v1 ghost sheet retired as
artdev/pirate/pirate_mob_options.ghost.old.tmp) · pirate_decor_options.png ·
pirate_tile_options.png · pirate_boss_options.png (10 captains) ·
pirate_boss_final.png (CANON combo) · pirate_scene_plan.png (CANON layout) ·
pirate_theme.wav (180.0s reference) · render/ (pirate_kit.js + all render
scripts; RANGER_PATH → game/js/ranger_art.js).
