# WEST — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks (EXCEPT
the sanctioned yard-train reuse in §3).*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: SPAGHETTI
  WESTERN AT NOON — sun-bleached, dusty, tense; the clock tower only
  ever strikes twelve (and, once, thirteen).

## Deliverables
1. `map.js` — MAPS.register({ id:'west', ... }). Realm 'west', boss
   'outlawSheriff', music 'west', noonCfg { cycleMs ~35000, tollCount 3,
   laneCap ~8, freezeMs, windShift:true — ALL TUNE }, trainCfg (port the
   yard's train numbers; whistle warn ~2s). EIGHT mob rows. Boss def
   mapOwned, NO radial/stream. Console 'west' unlocked.
2. `art.js` — port picked draws from assets/render/render_west_mobs.js
   (#1 GANG RUSTLER · #2 SIX-GUN BANDIT · #3 DYNAMITE DAN ·
   #4 RATTLESNAKE · #5 VULTURE · #6 TUMBLEWEED · #18 SCORPION ·
   #16 DUST DEVIL), render_west_boss_final.js (CANON; sheriff(put,S,p)
   parameterized in render_west_boss.js — night-rider rig + WHITE HAT,
   red glare; ALSO need a P2 hatless variant: hat burns off), 13 decor +
   THE HORSE (hitched at trough; entrance victim) from
   render_west_decor.js picks (#1 2 4 5 6 7 8 9 10 12 13 14 20), tiles
   #1 2 3 4 5 6 10 from render_west_tiles.js. Locomotive + boxcars:
   REUSE world_art.js draws (sun-bleached recolor ok). MOB_DISPLAY:
   rustler ~36 · bandit ~42 · dan ~46 · snake ~40 · vulture ~44 ·
   tumbleweed ~34 · scorpion ~40 · devil ~52 (TUNE). Boss ~110.
3. `scene.js` — town layout per assets/west_scene_plan.png: main-street
   spine (N–S, edge-to-edge), clock-tower square = duel ground + boss
   arena (OPEN — no fences; graveyard reachable-boss lesson), saloon
   (saloon-floor interior) W, jail E with IRON DOORS facing the square,
   gallows, church N, water tower SW, wagon yard SE, trough + hitch row
   + THE HORSE, rail strip E (wraps N–S) + stage stop, tumbleweed flats
   W band, cracked earth NE, desert ring all edges; boardwalk aprons on
   buildings. Toroidal wrap everywhere (graveyard lesson: no edge pile).
4. HIGH NOON (EVERYBODY DRAWS) details: cycle → bell tolls + white
   flash → ALL armed mobs on screen freeze + telegraph one lane each at
   the player (cap laneCap nearest; tumbleweed/dust devil excluded;
   vulture's lane = its dive line) → all lanes FIRE on the last toll →
   every lane the player is NOT in fires BACK at its shooter
   (env-credited: killMobCredited) → wind re-rolls (tumbleweed roll
   direction). Lanes use the standard lane-warn overlay; generous
   windup; suites park noon.nextAt = Infinity.
5. NOON EXPRESS: yard train tech (scenes.js telegraph/instakill) on the
   east rail line — whistle + smoke plume warn ~2s → train passes N–S
   (wraps), lethal ON the rail-bed tiles only, damages MOBS too
   (env-credited). Train never fires during the noon freeze (offset the
   clocks) — one death sentence at a time.
6. Boss per PLAN §6. Entrance: iron doors BLAST off (debris FX) → he
   steps through dust → title card "THIS TOWN AIN'T BIG ENOUGH FOR THE
   TWO OF US." → he shoots THE HORSE at the trough (whinny, it drops;
   NO player damage; pure characterization) → chalk duel circle draws →
   r.scanning. P1: FAN THE HAMMER cone / RICOCHET bent lanes (bounce off
   building footprints; warn the FULL bent path) / DYNAMITE DEPUTY 3
   chained circles / dust-slide repositions. SIG HIGH NOON: tolls →
   tracking lane → LOCK on last chime (~0.5s) → BANG; sidestep →
   bs.ventedUntil ×1.5 (hurtBoss). P2 (<50%): white hat burns off (one-
   time FX + hatless art swap), twin alternating cones, POSSE CALL (3
   rustlers vault jail rubble, queueSpawn, ONCE per phase), SIG CLOCK
   STRIKES 13: dim + 5–6 crisscross lanes + his locked shot, all fire on
   toll 13 → biggest vented window.
7. Music port ("HIGH NOON HOEDOWN", 105 bars @140 G-major bluegrass,
   TAKE 1 RED-APPROVED; verify vs assets/west_theme.wav — keep the banjo
   16th-roll grid w/ high-G drone, boom-chick + chop, stop-time bars,
   the 24-bar guitar solo w/ bends, key-up finale, shave-and-a-haircut
   tag) + SFX PLAN §7.
8. Suite `test/m15_west_verify.js` (routing walk incl. rail crossing ·
   noon cycle: freeze/lanes/fire/return-fire/wind shift · train warn +
   lethality + wrap + noon-offset · 8 mob mechanics incl. tumbleweed
   wind re-roll, devil shot-deflect, scorpion burrow · boss: entrance
   beats + P1/P2 verbs + both signatures + vented windows + hat swap) +
   FULL battery + ?v= bump + docs (MILESTONES, EVENT_LOG, bestiary
   TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
noon.nextAt / tollAt[] / freezeUntil / lane[].fireAt / lane[].returnAt ·
train.nextAt / warnUntil / passUntil (port yard pattern — the menu-close
instakill lesson lives THERE, reuse its fix) · rustler lungeAt · bandit
aimAt / shotAt · dan lobAt / tnt[].boomAt · snake rattleAt / strikeAt /
venomUntil · vulture circlePhase / diveAt · scorpion surfaceAt / stingAt ·
devil wanderAt / patch[].dieAt · boss: nextVerbAt / fanAt / fan seq[].at /
rico lane[].at / tnt[].boomAt / duel tollAt[] / lockAt / bangAt /
ventedUntil / posseAt / thirteen seq[].at / hatBurnAt · every
_zoneWarn.until. (Skip Infinity-parked; tumbleweed wind vector is not a
clock.)

## Traps specific to this map
- NOON lanes are the map's one synchronized burst — they are WARNED and
  finite; never let noon + train + boss HIGH NOON stack (offset all three
  clocks; suites assert no overlap).
- Return-fire kills = env credit (killMobCredited), never player-sourced
  (drop-table double-dip guard).
- RICOCHET: warn the FULL bent path as one overlay; lanes wrap
  (rider/serpent lesson) — warn both sides of the seam.
- Dust Devil deflects PLAYER shots only inside the whirl (mob shots
  unaffected); cap devil count so the street stays shootable.
- Tumbleweeds are shootable env-ish mobs — they must NOT draw noon lanes
  and must not block the boss arena (despawn inside the chalk ring).
- Scorpion mound while burrowed: targetable? NO — untargetable but
  VISIBLE (dust mound FX), surfaces on a clock; shooting the mound spot
  does nothing (mossback lesson inverted — document in bestiary).
- THE HORSE is scenery with one scripted death; never respawns during
  the fight; no XP.
- Rattlesnake venom slow + devil swirl slow can stack — cap combined
  slow (CC-stack rule).
- Boss RICOCHET vs buildings: precompute bounce paths off the fixed
  building footprints; never let a bent lane cross INTO the saloon
  interior.
- White-hat burn is a ONE-TIME phase FX — guard vs re-trigger on
  unfreeze (factory phase-swap lesson).
- Train + rail tiles: lethal zone is the rail bed only, not the gravel
  shoulder — hitbox matches the visible tracks (factory hitbox lesson).
- Saloon interior (saloon-floor tiles) = normal walkable room; boss and
  train never enter; noon lanes DO reach inside (windows).

## assets/ inventory
west_mob_options.png (20; Red picked 8) · west_decor_options.png (20;
Red picked 13) · west_tile_options.png (10; Red picked 7) ·
west_boss_options.png (10 work-ups) · west_boss_final.png (CANON — #2
NIGHT RIDER + WHITE HAT) · west_scene_plan.png (CANON layout v2, incl.
NOON EXPRESS) · west_theme.wav (TAKE 1 — 180.0s RED-APPROVED reference) ·
render/ (west_kit.js + render_west_mobs.js + render_west_decor.js +
render_west_tiles.js + render_west_boss.js + render_west_boss_final.js +
render_west_scene.js + render_west_theme.js; RANGER_PATH →
game/js/ranger_art.js, factory_kit.js one dir up).
