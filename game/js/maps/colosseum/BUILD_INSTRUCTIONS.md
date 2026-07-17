# COLOSSEUM — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: THE GAMES
  AT FULL ROAR — marble + sand + gold, a crowd that never sits down,
  and a host who loves his wine more than his empire.

## THE BIG STRUCTURAL DIFFERENCE
**ROUND MAP — NO TOROIDAL WRAP.** The one campaign exception (Red's
call). Playfield = a circular sand field; the arena wall is a collision
ring; CROWD TIERS render beyond the wall on all sides (border art,
never collidable/targetable). Every routing assumption from the other
maps (wrap seams, edge stitching) is OFF here — the suite must assert
wall collision + full reachability inside the circle instead.

## Deliverables
1. `map.js` — MAPS.register({ id:'colosseum', ... }). Realm
   'colosseum', boss 'divinityHimself', music 'colosseum', programCfg
   { stageMs ~20000, order:[beast,trapdoor,chariot,intermission],
   beastWave sizes, trapdoorSets, lapCount, placardMs — ALL TUNE }.
   TWELVE mob rows. Boss def mapOwned, NO radial/stream. Console
   'colosseum' unlocked.
2. `art.js` — port picked draws from assets/render/:
   render_colosseum_mobs.js (#1 GLADIATOR · #2 RETIARIUS · #4 WAR
   LION · #7 SHIELD LEGIONARY · #9 BEAST HANDLER · #10 WAR ELEPHANT ·
   #11 MINOTAUR · #13 CROWD FAVORITE · #16 WAR HOUND · #19 VESTAL
   CURSER · #20 EXECUTIONER), render_colosseum_chariot_final.js
   (CHARIOT RACER = crimson car + ONE lion; uses lion160() from
   render_colosseum_lion_draft.js — approved shape, do NOT shrink the
   lion into a corner: it keeps its proportions), 
   render_colosseum_boss_final.js (CANON DIVINITY HIMSELF — emperor()
   parameterized; P2 drunk = stagger pose/glow flags), 18 decor
   (render_colosseum_decor.js all but #10/#18), 10 tiles
   (render_colosseum_tiles.js), CROWD RING from
   render_colosseum_crowd_sample.js (tier bands + fan() figures;
   pose-swap on a timer so the crowd ripples at Program events +
   roars). MOB_DISPLAY: gladiator ~46 · retiarius ~46 · lion ~52 ·
   legionary ~48 · handler ~44 · elephant ~72 · minotaur ~60 ·
   favorite ~46 · hound ~38 · vestal ~44 · executioner ~56 · chariot
   ~64 (TUNE). Boss ~110.
3. `scene.js` — ROUND layout per assets/colosseum_scene_plan.png:
   sand circle (r TUNE) · wall collision ring · rim track ring ·
   3 gates (N/SW/SE; N under the box) · imperial carpet N→center ·
   boss circle center · trapdoors · decor per plan · crowd tiers
   rendered outside the wall (all angles — camera at the edge must
   always see crowd, never void).
4. THE PROGRAM cycle: trumpet sting + placard (announce, ~2s) → stage
   runs ~20s → crowd roar → next. BEAST RELEASE: gates grind open,
   wave spawns (queueSpawn; scale with depth). TRAPDOOR SHUFFLE: warn
   circles under hatches BEFORE opening (never insta-hole under the
   player); open = pit (fall = damage + eject to edge, NOT death —
   TUNE). CHARIOT LAP: 1–2 racers spawn on the rim track, circle
   ~2 laps with warned crossing lanes, then exit via a gate.
   INTERMISSION: rose/goblet scatter = small heals/loot. Suites park
   program.nextAt = Infinity.
5. Boss per PLAN §5. Entrance: trumpets → box floor lift (him
   mid-toast) → halfway, cup upends: crimson wave down the wall +
   SURF along the carpet to center → lands dry → title card, THEN
   r.scanning. Verbs + signatures per PLAN; WINE FLOOD halves are
   FIXED ALTERNATING and long-warned; DOOM RING chases at fixed speed
   (outrunnable), damages mobs it touches (killMobCredited); CUP TOSS
   travels the rim track path only (full path warned before launch);
   ENCORE! reroutes to CUP SPLASH if a Program stage is mid-run.
6. Music port ("GLORY.EXE", 105 bars @140 A-minor gaming techno,
   TAKE 2 RED-APPROVED; verify vs assets/colosseum_theme.wav — keep
   the bar-0 full-stack entry [kick+bass+hats+fanfare together, NO
   slow intro: that was Red's take-2 fix], the 3-partial chiptune
   piano voice, the 28-bar solo's variety, duet + octave-up finale,
   crowd roars at section doors) + SFX PLAN §6.
7. Suite `test/m16_colosseum_verify.js` + full battery + ?v= bump +
   docs (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
program.nextAt / stage.endsAt / placardUntil · gate[].openUntil /
grindAt · trapdoor[].warnAt / openAt / closeAt · racer lapAt /
lane[].at / exitAt · gladiator slashAt · retiarius netAt / net
rootUntil (PLAYER CC — release on hitstop/death/realm change, pirate
lesson!) · lion pounceAt · handler buffAt / buffUntil · elephant
stampedeAt / lane[].at / stompAt · minotaur chargeAt / slamAt ·
favorite tauntAt / shieldUntil · hound lungeAt · vestal glyphAt /
zone[].dieAt · executioner slamAt / cleaveAt · boss: nextVerbAt /
splash[].landAt / slick[].dieAt / ring.moveAt / ringUntil /
tribute[].landAt / wave seq[].at / waveAt / ventedUntil / toss
pathAt[] / returnAt / encoreAt / deluge rain[].at / ringWaveAt /
refillUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- ROUND ROUTING: no wrap seams anywhere; wall collision must be
  airtight (no escaping into the crowd); suite walks the full
  circumference + asserts the boss circle reachable from spawn (arch).
- Crowd ring is ART: never collides, never targets, never takes
  damage; its animation ticks on the render clock, not the sim clock.
- Doom-ring + wave + trapdoors + train... NO: only ONE death-pressure
  system runs at a time — offset Program vs boss verb clocks; ENCORE!
  respects this (reroute rule).
- Trapdoors: never open inside the boss circle during the fight; warn
  under feet ALWAYS precedes opening; falls eject, never insta-kill.
- Retiarius net = short player CC (~0.7s TUNE) — all CC-release
  lessons apply; net + slick + curse slows CAP (CC-stack rule).
- Crowd Favorite's sparkle shield: brief + on a visible cheer cue;
  cap uptime (~30% TUNE) so he can't chain-shield; suite asserts the
  open window.
- Shield Legionary frontal block: block = frontal arc only (~100°),
  never total immunity; flanking must work (suite asserts).
- Beast Handler buff: mobs-only, respects hitstop, priority-target
  hint in bestiary.
- Chariot racer on laps: its run lanes are warned; contact damage on
  the track only; despawns cleanly if the stage ends early
  (ghost-ship/actor cleanup lesson).
- CUP TOSS: the cup is an FX actor, untargetable; its rim path never
  enters the sand field interior.
- Wine slicks: slide = brief control loss, NOT a stun; slicks fade
  (dieAt); cap active slicks for readability.
- ENCORE! once per phase; guard vs re-trigger on unfreeze (factory
  phase-swap lesson). Hat... no hat here: DRUNK pose/glow swap at P2
  is one-time — same guard.
- Crowd roar SFX loops duck under boss music; placard sting always
  audible (mix rule).

## assets/ inventory
colosseum_mob_options.png (20; Red picked 11) ·
colosseum_chariot_options.png (10 side-profile work-ups) ·
colosseum_lion_workup.png (approved full-canvas lion; _v1 in artdev) ·
colosseum_chariot_final.png (CANON racer — ONE lion) ·
colosseum_decor_options.png (20; picked 18) ·
colosseum_tile_options.png (10; ALL picked) ·
colosseum_boss_options.png (10 work-ups) ·
colosseum_boss_final.png (CANON DIVINITY HIMSELF — blinged, "perfect") ·
colosseum_crowd_sample.png (CANON crowd-ring fidelity) ·
colosseum_scene_plan.png (CANON round layout) ·
colosseum_theme.wav (TAKE 2 — 180.0s RED-APPROVED reference) ·
render/ (colosseum_kit.js + all render scripts; RANGER_PATH →
game/js/ranger_art.js, factory_kit.js one dir up).
