# PREHISTORIA — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: LOST
  WORLD, NOT THEME PARK — real-anatomy dinosaurs (Red rejected the
  cartoony take), an angry sky, and a boss that hatches out of an
  egg bigger than it is. Dark trance under all of it.

## THE HEADLINES (get these right before anything else)
1. **DINOS ONLY**: 7 mobs, Red's exact picks (mobs2 sheet 1 2 3 4 5
   6 20). No cavemen, no mammals — the caveman/cavewoman sheets in
   assets/ are boss-exploration history, not content.
2. **RECOLOR RULE**: one palette-swap variant per mob EXCEPT the
   pterodactyl (Red's exemption). Variants spawn MIXED with the
   originals (~50/50 TUNE), share the base draw + hue/sat/light
   params from render_prehistoria_recolors.js.
3. **METEOR SHOWER cycle**: omen streaks → warned impact circles in
   sequence → brief lava puddles. Heavier density NE (volcano
   quarter). The map's ONLY ambient mechanic — GAME TRAIL tile is
   decorative, there is NO stampede mechanic.
4. **THE HATCH**: the giant egg sits in the nest arena FROM MAP
   LOAD (bigger than the boss). Player enters the arena → 4-beat
   hatch (crack → split → reveal → FLASH, halves gone) → THE
   PRIMORDIAL live on beat 4, untargetable before the flash.

## Deliverables
1. `map.js` — MAPS.register({ id:'prehistoria', ... }). Realm
   'prehistoria', boss ['primordial'], music 'prehistoria',
   meteorCfg { omenMs, waveCount, impactWarnMs, puddleMs,
   neBias (TUNE) }, brachioCfg { neutralUntilProvoked:true }.
   SEVEN mob rows + recolor variant spawn table (ptero exempt).
   Console 'prehistoria' unlocked.
2. `art.js` — port picked draws from assets/render/:
   MOBS (render_prehistoria_mobs2.js — TAKE 2 real-anatomy: #1
   RAPTOR raptor160 · #2 COMPY SWARM drawCompies · #3 TRICERATOPS
   trike160 · #4 STEGOSAURUS stego160 · #5 PTERODACTYL drawPtero ·
   #6 DILOPHOSAURUS drawDilo · #20 BRACHIOSAURUS drawBrachio).
   RECOLORS (render_prehistoria_recolors.js hue/sat/light params:
   JUNGLE RAPTOR · RUST COMPIES · MOSS TRICERATOPS · EMBER STEGO ·
   MIDNIGHT DILO · STORM BRACHIO — NO ptero variant).
   BOSS: dragon160() from render_dragons.js w/ FINAL params O from
   render_dragon_final.js (#10 THE PRIMORDIAL: feathered dino-dragon,
   brown-gold scales, pale belly, swept horns, fire breath) + P2
   IGNITED-FEATHER glow state + dive-strafe frames + WINDED vent
   frame (crumpled, wings drooped).
   THE HATCH: 4 entrance frames per render_hatch_frames.js (S=220;
   egg towering → glowing center crack → halves separated + dragon
   revealed → white FLASH; halves gone after). Reference timing:
   assets/hatch_entrance.gif.
   DECOR: all 20 (render_prehistoria_decor.js). TILES: all 10
   (render_prehistoria_tiles.js; #1 JUNGLE FLOOR base). FX: meteor
   streaks, warned circles, impact burst, lava puddle (spawn/cool/
   fade), venom puddle, quake ring.
   **PORTING GOTCHA:** body fills in the dino draws step in DEVICE
   SPACE (moiré fix at S>160 — canon in render_dino_shapes.js).
   Keep that pattern; do not revert to sub-space stepping.
   MOB_DISPLAY: raptor ~44 · compy ~22 · trike ~64 · stego ~62 ·
   ptero ~48 · dilo ~44 · brachio ~110 · PRIMORDIAL ~140 (TUNE —
   epic-big tier; arena camera generous).
3. `scene.js` — layout per assets/prehistoria_scene_plan.png: fern
   meadows NW (trike/stego/brachio) · deep jungle W (raptor+compy) ·
   volcano quarter NE (ash/vents/crater, meteor-heavy) + NEST ARENA
   on the rim w/ the egg pre-placed · SKULL ROCK center · GAME TRAIL
   ring W–E · RIVER ring S (impassable except FORD + LOG BRIDGE;
   dilos in the reeds) · tar pits/bone field/titan ribcage S · swamp
   SW · geysers SE · roost spire E. Toroidal both axes.
4. METEOR SHOWER per headline #3: omen (global streak FX + whistle,
   readable warning) → impact circles in SEQUENCE (fromCycle damage,
   standard telegraph rules, never unavoidable — cap simultaneous
   circles near the player, TUNE) → lava puddles (small burn zones,
   expire after a few seconds). NE density bias. Cycle cadence TUNE.
5. BOSS per PLAN §6: hatch gating (boss untargetable + kit dormant
   until beat-4 flash; arena leash hard). Kit: TAIL LASH warned arc ·
   FIRE BREATH marked cone RAKE (sweep path telegraphed) · WING GUST
   warned cone w/ CAPPED knockback (displacement tag) · COMPY CALL
   (2–3, fromBoss, glow, NO drops) · P2 <50% ignite + shadow-marked
   dive strafes · SIGNATURE METEOR CALL: roar → early-fires the map
   cycle machinery in a ring around the arena → last impact leaves
   him WINDED: **vented ×1.5 (hurtBoss)**. Every source
   fromBoss=true. NO burst+radial spam.
6. Music port ("PRIMAL.EXE", **TAKE 2 dark trance, RED-APPROVED
   "perfect"** — 105 bars @140 D-minor; verify vs
   assets/prehistoria_theme.wav / render_prehistoria_theme.js —
   keep the bar-0 kick + rolling 16th bass [NO intro], the D–D–Bb–A
   bassline, the acid arp, the D-section tension build with the
   kick RUNNING THROUGH, the bar-64 drop, the octave-doubled
   finale. Take 1 drums+chant was REJECTED — never resurrect) +
   SFX PLAN §7.
7. Suite `test/m21_prehistoria_verify.js` + full battery + ?v= bump +
   docs (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
meteor omenAt / wave[].impactAt / puddle[].until · raptor lungeAt ·
trike chargeAt · stego sweepAt · ptero diveAt (shadow lane) · dilo
spitAt / venomPuddle[].until · brachio stompAt / provokedUntil ·
compys (no clock) · geyser burstAt · PRIMORDIAL: hatchBeatAt /
nextVerbAt / lashAt / breathRakeAt (+ sweep angle phase) / gustAt /
compyCallAt / igniteAt / diveLane[].at / meteorCallAt /
callImpact[].at / ventedUntil · every _zoneWarn.until. (Skip
Infinity-parked.)

## Traps specific to this map
- METEOR FAIRNESS: circles are warned, land in sequence (not all at
  once), and NEVER spawn-camp — suppress impacts in a small radius
  around fresh spawns and the arena entrance during the hatch. Cap
  simultaneous circles near the player. NE bias must still leave a
  readable safe path to the nest arena.
- DOUBLE-FIRE GUARD: METEOR CALL reuses the cycle machinery — an
  ambient shower must NOT overlap the signature (suppress/reset the
  ambient clock while the boss fight runs the call).
- LAVA + VENOM PUDDLES are small, visible, and brief — zone clutter
  is the failure mode; cap live puddles (TUNE).
- DISPLACEMENT STACK: trike charge knockback + WING GUST share the
  displacement cooldown tag (abyss lesson) — no ping-pong.
- BRACHIO NEUTRALITY: neutral flag until the PLAYER damages it;
  meteor/cycle damage must NOT provoke it (fromCycle ≠ player).
  Provoked state persists (unfreeze provokedUntil) but calms after
  a long cooldown (TUNE).
- PTERO EXEMPTION: no recolor variant, ever — suite asserts the
  spawn table has exactly 6 variant rows.
- HATCH INTEGRITY: egg visible from map load (it's scenery until
  triggered); during the 4 beats the boss is untargetable AND deals
  no damage; the flash is the start-of-fight cue; halves NEVER
  linger after beat 4. If the player leaves the arena mid-hatch,
  finish the animation anyway — no re-hatch loops.
- GAME TRAIL is a TILE, not a mechanic — nothing spawns from it,
  nothing charges down it on a clock. (Stampede idea was cut when
  Red locked METEOR SHOWER only.)
- BREATH RAKE READABILITY: the cone's sweep path is telegraphed
  before it moves — a static warn that then surprises with motion
  violates the boss contract.
- BIG-BEAST RENDER: brachio (~110) + PRIMORDIAL (~140) — check
  minimap/dev-view scaling and arena camera framing (leviathan/
  wyrm lessons).
