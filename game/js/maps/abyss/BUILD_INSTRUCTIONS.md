# ABYSS — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: CRUSH
  DEPTH — near-dark trench where every light is alive; drowned rust
  vs bio glow; then a screen-filling electric serpent.

## THE TWO BIG SYSTEMS
1. **THE UNDERTOW** (map cycle): warn (kelp bend + particle stream +
   rumble, ~2s) → ~8s directional pull on player AND mobs toward the
   NEAREST DROP chasm → direction re-rolls per cycle. Cover (wreck /
   rock / coral footprints) blocks the pull in its lee. Mobs swept
   into a DROP die env-credited; the player takes pit damage + ejects
   to the rim (NEVER insta-death). NEVER pitch air/oxygen management —
   Red explicitly rejected it.
2. **DESTRUCTIBLE CORAL** (terrain): reef-zone coral walls block
   movement + shots; hp per wall; ANY damage source degrades them —
   including the boss's body (auto-smash on segment contact).
   **4 damage-state sprites (pristine/cracked/crumbling/rubble) +
   shrapnel-burst break + STAGED REGROW animation (reverse states,
   long timer) — Red required the deterioration animation explicitly.**

## Deliverables
1. `map.js` — MAPS.register({ id:'abyss', ... }). Realm 'abyss', boss
   'voltWyrm', music 'abyss', undertowCfg { cycleMs ~30000, warnMs
   ~2000, pullMs ~8000, force — ALL TUNE }, coralCfg { hpPerState,
   regrowMs ~45000 — TUNE }. ELEVEN mob rows. Boss def mapOwned, NO
   radial/stream. Console 'abyss' unlocked.
2. `art.js` — port picked draws from assets/render/:
   render_abyss_mobs.js (#4 GHOST JELLY · #5 SWORDFISH · #7 VOLT EEL ·
   #8 VAMPIRE SQUID · #11 CRIMSON STARFISH · #12 DROWNED DIVER ·
   #13 GHOST FISHERMAN · #15 TRENCH LOBSTER · #16 BANDED SEA SNAKE ·
   #17 LANTERN SNAIL · #19 KRAKEN SPAWN), render_abyss_decor.js (15
   picks; lighthouse keeps its beam-sweep FX), render_abyss_tiles.js
   (#1 2 4 5 7 8 10), CORAL 4-state set (derive from decor brain-coral
   style + reef palette). BOSS from render_abyss_leviathan_shape.js
   lev160 (VOLT WYRM params in render_abyss_boss2.js V.volt +
   render_abyss_boss_final.js): build SEGMENT sprites — head (~150px
   display), body segment (fin membrane + belly plates + glow
   variants: normal / charged / live-wire), tail + fluke. DO NOT use
   render_abyss_boss.js (v1 caterpillars — obsolete). MOB_DISPLAY:
   jelly ~40 · swordfish ~50 · eel ~44 · squid ~46 · starfish ~34 ·
   diver ~48 · fisherman ~48 · lobster ~46 · snake ~44 · snail ~32 ·
   kraken ~58 (TUNE). Boss head ~150, segments ~90 (TUNE — must feel
   EPIC-BIG, Red's requirement).
3. `scene.js` — layout per assets/abyss_scene_plan.png: wreck field NW
   (bell = spawn), kelp lanes N–S edge-to-edge, whale fall, reef zone
   E (coral walls + clam + anemones), vent field SW, lighthouse, black
   dunes SE, rift line E–W, 4 DROP chasms, boss basin S-center.
   Toroidal wrap; UNDERTOW cycle; coral system.
4. BOSS ENTITY — the big one:
   - Segmented serpent: head entity + ~N body segments + tail
     (follow-the-leader: each segment tracks the recorded path of the
     one ahead; ~30+ tiles total length TUNE).
   - **Serpentine movement (Red's diagram)**: the HEAD steers along a
     weaving sinusoid superimposed on its goal vector, so a traveling
     S-wave propagates down the followers. Tune wavelength/amplitude
     until it reads as lateral undulation, never a stiff train.
   - Damage split: segments = light brush damage; HEAD hit = heavy.
     Player shots hit segments (boss hp pool shared; head takes bonus).
   - Coral: segment contact smashes coral through its states.
   - ANIMATION SET (all required, Red): undulation (inherent) · jaw
     open→SNAP frames · fin ripple (phase-offset segment fin frames) ·
     mane/whisker drift (head frames) · charge glow pulse (segment
     palette swap ramp) · coil-up telegraph pose · dive/breach
     (submerge into DROP, floor-shadow actor glides, breach eruption) ·
     death thrash (whole-body wave amplitude spike, then fade).
   - Verbs + signatures per PLAN §6; vents ×1.5 (hurtBoss); ENRAGE
     none (P2 is the escalation).
5. Music port ("UNDER THE TRENCH", 90 bars @120 C-major calypso,
   TAKE 2 RED-APPROVED; verify vs assets/abyss_theme.wav — keep the
   bar-0 full-groove entry, steel-drum voice [attack pop + octave
   shimmer], offbeat skank + 3-2 clave, lagoon half-time bridge,
   key-up finale + big gliss + splash) + SFX PLAN §7.
6. Suite `test/m17_abyss_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
undertow.nextAt / warnUntil / pullUntil · coral[].regrowAt · swordfish
laneAt / chargeAt · eel coilAt / ring[].at · squid inkAt / jetAt /
cloud dieAt · starfish hopAt / latchUntil (PLAYER slow — release on
hitstop/death/realm change!) · diver aimAt / harpoonAt · fisherman
castAt / lure landAt / yankAt · lobster chargeAt · snake strikeAt /
venomUntil · snail nextHealAt · kraken slam seq[].at · boss:
nextVerbAt / coilAt / snapAt / discharge seq[].at / whipAt / diveAt /
shadow pathAt / breachAt / ventedUntil / liveWireUntil / chain
arc[].at / circleUntil / maelstrom seq[].at / deathThrashAt · every
_zoneWarn.until. (Skip Infinity-parked; jelly drift + undulation phase
are not clocks.)

## Traps specific to this map
- UNDERTOW + boss: never let SERPENT'S UNDERTOW and the map undertow
  run simultaneously (offset clocks; one pull at a time — the
  one-death-sentence rule).
- Undertow pull vs CC: pull is displacement, not CC — it stacks with
  nothing, capped total displacement per tick; anchored = zero.
- DROP pits: player eject puts you on the NEAR rim (no cross-map
  teleports); i-frames ~1s post-eject; boss/segments ignore pits
  except his OWN dive verb.
- Starfish latch + snake venom + (P2) shock slow — CC-stack cap rule.
- Diver harpoon + fisherman yank are PLAYER displacement — small,
  capped, never chain the two into a stunlock (shared cooldown tag).
- Ink cloud = vision blot overlay, short, never full-screen.
- Segment follow history: cap path buffer; on unfreeze REBUILD from
  current positions (do not replay stale paths — the factory
  phase-swap lesson generalized).
- Segments must never wrap-seam split visually (wrap-aware segment
  rendering; rider/serpent lane lesson).
- Live-wire window: hard-capped duration, visible palette state, never
  overlaps SNAP STRIKE.
- Chain lightning needs a volt eel on screen; else verb reroutes to
  VOLT DISCHARGE.
- Coral regrow never traps the player inside (regrow blocked while
  occupied).
- Lighthouse beam is FX only (no gameplay reveal semantics).
- Boss basin: keep decor sparse so the serpent has room to read.

## assets/ inventory
abyss_mob_options.png (20; Red picked 11) · abyss_decor_options.png
(20; picked 15) · abyss_tile_options.png (10; picked 7) ·
abyss_leviathan_shape.png (APPROVED take-3 skeleton) ·
abyss_boss_options.png (10 looks on the skeleton; #6 picked) ·
abyss_boss_final.png (CANON VOLT WYRM) · abyss_scene_plan.png (CANON
layout) · abyss_theme.wav (TAKE 2 — 180.0s RED-APPROVED reference) ·
render/ (abyss_kit.js + all render scripts; render_abyss_boss.js = v1
OBSOLETE, kept for history only; RANGER_PATH → game/js/ranger_art.js,
factory_kit.js one dir up).
