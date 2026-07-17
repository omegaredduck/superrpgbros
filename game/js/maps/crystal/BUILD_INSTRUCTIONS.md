# CRYSTAL — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This folder
is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in [[ten-maps-campaign]]
  + docs/TEN_MAPS_PLAN.md. Mood check: SPARKLE ADVENTURE — bright wonder,
  not horror. The Deep Fissure may go dark; the rest of the cave glitters.

## Deliverables
1. `map.js` — MAPS.register({ id:'crystal', ... }). Realm 'crystal', boss
   'shardlord', music 'crystal', growCfg { periodMs ~14000, warnMs,
   shatterDmg, minOpenGates:2 — ALL TUNE }. NINE mob rows. Boss def
   mapOwned, NO radial/stream. Console 'crystal' unlocked.
2. `art.js` — port picked draws from assets/render/render_crystal_mobs.js
   (#1 4 5 6 10 12 13 15 20), render_crystal_boss_final.js (CANON —
   shardKnight(put,S,o) is parameterized; the FINAL opts object is in that
   file), 19 decor (all but #11), 8 tiles (#2 4 5 6 7 8 9 10). MOB_DISPLAY:
   shardling ~34 · lurker ~46 · golem ~56 · bat ~40 · ram ~50 · resonator
   ~44 · moth ~42 · crawler ~48 · horror ~54 (TUNE). Boss ~150+ — COLOSSUS.
   Boss core: draw once, tint-cycle hues at runtime (don't bake one color).
3. `scene.js` — chamber layout per assets/crystal_scene_plan.png: solid
   rock walls, six chambers (entry shelf / great hall / garden / geode
   hollow / lake / deep fissure), tunnels, rails decor, lake water ring
   (sand rim walkable, water blocks or slows — pick one, note it), crystal
   bridge, gates A–D; wrap via edge tunnels (mirror wrapGraveyard).
4. GROWING CRYSTAL details: gate cycle = floor shimmer along the wall line
   + rising chime (warn, ~1.2s TUNE) → wall zone rises (solid, NOT an
   entity, never targetable) → later crack telegraph → SHATTER: harmless
   sparkle + brief damaging ring at the line (killMobCredited for mobs,
   plain hurtPlayer + fromBoss=false for player). HARD RULE: ≥2 gates open
   at all times; a gate NEVER closes on the player's tile (delay if
   occupied). Respect hitstop/pause.
5. Boss per PLAN §5. Entrance: stalactite warn circles + dust → he crashes
   down (camera shake, quake ring telegraphed) → rises, core ignites color
   by color → title card, THEN r.scanning. RAINBOW CORE = the telegraph:
   core locks a color (distinct chime per color + scouter hint) → that
   color's verb fires. PRISMATIC OVERLOAD: 5 colored cone sweeps in
   sequence (each warned) → core grey, bs.ventedUntil ×1.5 (hurtBoss),
   rooted. GROWING WALLS verb reuses the gate tech inside the arena
   (short-lived walls, auto-shatter, same never-trap rule).
6. Music port ("CAVERN OF WONDERS", 66 bars @88 C major; verify vs
   assets/crystal_theme.wav) + SFX PLAN §6.
7. Suite `test/m12_crystal_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
gate[].nextAt / warnUntil / wallUpAt / crackAt / shatterAt · lurker wakeAt /
lungeUntil · golem slamAt / slamWarn.until · bat swoopAt / screechAt ·
ram lockAt / chargeAt / chargeUntil · resonator nextPulseAt + ring[].at ·
moth nextDustAt + patch dieAt · crawler burstAt / snipAt · horror nextBeamAt /
sweepUntil · boss: nextColorAt / colorLockUntil / volley[].at / lance[].at /
wallVerb timers / ring[].at / hatch nextAt / overloadSeq[].at / ventedUntil /
rootUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- Gate walls + boss GROWING WALLS are env zones, NOT entities — never
  targetable; annihilateSwarm/clearNameTag must not touch them; boss verb
  walls cleared on boss death.
- Never-trap rule is testable: suite asserts ≥2 open gates through 3 full
  cycles, and that a closing gate defers while a fixture stands on it.
- Ram charge wraps — mirror the wrap-aware lane math (graveyard rider
  lesson); its warn lane must render on both sides of the seam.
- Lurker disguise: uses a decor-grade cluster sprite — make sure REAL decor
  clusters and lurkers are visually distinguishable at wake-warn time
  (shimmer only on the mob).
- Resonator rings + boss QUAKE rings look similar — different tint families
  (resonator cyan, boss amber) so reads stay clean.
- Shardling death-sparkle is harmless — no accidental hurt zone.
- Rainbow core hue-cycle is cosmetic EXCEPT during color-lock — lock tint
  must match the verb 1:1 (that's the whole telegraph language).
- Suites: park gate nextAt = Infinity + no dust patches before fixtures;
  entrance deterministic (no random stalactite positions in test mode).
- Sparkle-adventure read: keep gem colors saturated on dark rock; do NOT
  grey the palette down (this map is the bright one between pirate night
  and carnival creep).

## assets/ inventory
crystal_mob_options.png (20) · crystal_decor_options.png (20; #11 cut) ·
crystal_tile_options.png (10) · crystal_boss_options.png (10 work-ups) ·
crystal_boss_final.png (CANON — giant, rainbow core, red eyes, crown) ·
crystal_scene_plan.png (CANON layout) · crystal_theme.wav (180.0s
reference) · render/ (crystal_kit.js + all render scripts; RANGER_PATH →
game/js/ranger_art.js).
