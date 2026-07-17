# CARNIVAL — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This folder
is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in [[ten-maps-campaign]]
  + docs/TEN_MAPS_PLAN.md. Mood check: CREEPY CARNIVAL — cheery-gone-wrong,
  sickly bulb glow on midnight dark; NOT gore, NOT pitch black.

## Deliverables
1. `map.js` — MAPS.register({ id:'carnival', ... }). Realm 'carnival',
   boss 'ringmaster', music 'carnival', boothCfg { cycleMs ~20000, roundMs
   ~8000, targetsN 4-6, prize table, biteDmg — ALL TUNE }. ELEVEN mob rows.
   Boss def mapOwned, NO radial/stream. Console 'carnival' unlocked.
2. `art.js` — port picked draws from assets/render/render_carnival_mobs.js
   (#1 2 3 4 6 12 13 14 16 17 20), render_carnival_boss_final.js (CANON;
   ringmaster(put,S,o) parameterized in render_carnival_boss.js), trapeze
   rig (new small draw), all decor, tile #4 warped checker BASE + #9 ring
   mat + dead-grass ambient. MOB_DISPLAY: clown ~46 · wisp ~38 · barker
   ~50 · teddy ~40 · poltergeist ~44 · shade ~54 · blob ~46 · juggler ~48 ·
   mole ~40 · monkey ~38 · ferris phantom ~64 (TUNE). Boss ~110.
3. `scene.js` — fairground per assets/carnival_scene_plan.png: perimeter
   fence (solid), south-gate spawn, midway booths A–D (solid stands w/
   interaction glow zones), ride yard + sideshow alley props, BIG TOP
   (striped wall ring, solid, one south flap gap; ring mat floor); wrap
   through dead-grass outskirts (all 4 edges).
4. GAME BOOTHS details: cycle picks ONE booth (round-robin, TUNE) → bulbs
   flicker-on sting + glow zone → player entering starts the round: env
   targets pop one by one (proj-targetable zone objects, deterministic
   order); all hit in time = PRIZE DROP (spawnPickup); timeout/exit =
   BITE: one telegraphed circle burst at the booth mouth (killMobCredited
   for mobs, plain hurtPlayer fromBoss=false). Round state must survive
   nothing — cancel cleanly on boss arrival/realm transition. NEVER two
   booths at once; suites park booth.nextAt = Infinity.
5. Boss per PLAN §5. Entrance: spotlight snaps on empty ring → calliope
   swell → trapeze sprite swings him down → dismount + bow + whip crack →
   title card, THEN r.scanning. STEP RIGHT UP reuses booth-round tech as
   safe-ring inversion (rings always reachable; wrap-aware). GRAND FINALE:
   firework warned circles in sequence → bow → bs.ventedUntil ×1.5
   (hurtBoss), rooted. Enrage: verb + booth cycles tighten (calliope
   tempo bump if the composer supports rate).
6. Music port ("THE LAST SHOW", 132 bars @132 TRUE 3/4 — the section
   composer MUST keep 3-beat bars (castle waltz precedent) AND the
   tape-warp pitch bends; verify vs assets/carnival_theme.wav) + SFX §6.
7. Suite `test/m13_carnival_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
booth.nextAt / glowUntil / roundEndsAt / biteAt / target[].popAt · clown
honkAt / lungeUntil · wisp popAt · barker sweepAt / pushUntil · teddy
wakeAt / springUntil · poltergeist nextLobAt / kernel[].landAt · shade
slamAt / shockAt · blob nextDripAt + patch dieAt · juggler volleyAt /
knife[].at · mole nextHoleAt / eruptAt · monkey clashAt / ringUntil ·
phantom nextLaneAt / rollUntil / beamAt · boss: nextVerbAt / spot lockAt /
lightDropAt / clownsAt / curtain[].at / gameRings until / finale[].at /
ventedUntil / rootUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- Booth rounds are OPT-IN: never gate progress on them; the bite only
  triggers if the round was STARTED and then failed/abandoned.
- Booth targets are env objects — killMobCredited only for mobs caught in
  the bite, NOT for target pops (no kill credit farming).
- Barker push + monkey slow can chain-stack — cap combined CC like the
  pirate siren+swell rule.
- Teddy ambush uses a decor-grade prize sprite — real prize-wall teddies
  vs the mob must be distinguishable at warn time (shimmer on mob only;
  lurker lesson from crystal).
- Ferris Phantom's rolling lane is wrap-aware (graveyard rider lesson);
  warn renders on both sides of the seam.
- Blob split-on-death spawns through queueSpawn, credited to the killer of
  the parent (env chains: killMobCredited).
- Spotlight-lock chase circle must break on hitstop/pause and never lock
  during the entrance bow.
- STEP RIGHT UP safe rings: at least one ring within reach of any player
  position (no impossible spreads); rings never ALL on the tent wall.
- Big top wall is solid except the south flap — boss fight stays inside;
  wrap does not cross the tent (outskirts only).
- Mood: bulbs are GOLD, creep accents TEAL/VIOLET; keep the checker floor
  readable under warn overlays (warn tints must pop on both red + cream
  squares — test both).

## assets/ inventory
carnival_mob_options.png (20) · carnival_decor_options.png (20) ·
carnival_tile_options.png (10) · carnival_boss_options.png (10 work-ups) ·
carnival_boss_final.png (CANON #1 THE CLASSIC) · carnival_scene_plan.png
(CANON layout) · carnival_theme.wav (180.0s reference) · render/
(carnival_kit.js + all render scripts; RANGER_PATH → game/js/ranger_art.js).
