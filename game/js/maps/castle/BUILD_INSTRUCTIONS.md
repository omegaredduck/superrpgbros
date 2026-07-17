# CASTLE — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST (shared contract + hard rules),
then `PLAN.md` here. This folder is the whole map — no core edits beyond the
registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in project memory
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md (boss contract, wrap,
  text-fit, NO reused cycle mechanics).

## Deliverables
1. `map.js` — MAPS.register({ id:'castle', ... }). Realm 'castle', boss
   'paleking', music 'castle', bloodMoon cfg { beamSpeed/burn, waltzEvery,
   chandelierDmg — ALL TUNE }. Roster of 8 (rats cheap → armor/duelist
   late). Boss def mapOwned, NO radial/stream. Console 'castle' unlocked.
2. `art.js` — port picked draws from assets/render/render_castle_mobs.js
   (#3 5 7 9 13 15 18 20), render_pale_riders.js var #10 (CANON:
   castle_boss_final.png), all 20 decor, tiles #1–5 ONLY. MOB_DISPLAY:
   gargoyle ~52 · maiden ~48 · halberd ~50 · phantom ~46 · initiate ~46 ·
   rats ~40 (pack sprite) · armor ~58 · duelist ~50 (TUNE). Boss display
   ~170 wide (mounted = wide sprite; body box generous, m6e hitbox lesson).
3. `scene.js` — PLAN-array layout per assets/castle_scene_plan.png: zone
   floors, room wall segments, crimson runner, chandelier objects, window
   beam emitters, joust list barrier, arena gate, wrap (seam through
   courtyard, never rooms).
4. Blood Moon Court per PLAN §4. Beams = moving lane zones (positional
   sweep); waltz surge = brief scripted mob drift (respect hitstop/pause —
   manual mover rule!); chandelier crash = marked circle → env damage →
   killMobCredited → re-hoist timer.
5. Boss per PLAN §5: entrance = gate + charge (the first pass lane IS the
   arrival; suites waitForFunction(r.boss && r.scanning) AFTER the pass
   resolves); mounted verbs; DIRE RAT adds via queueSpawn; vented window
   reads bs.ventedUntil in hurtBoss (m6e precedent).
6. Music port ("THE LAST WALTZ" — 150 bars of 3/4 @150; the composer must
   handle 3 beats/bar; verify vs assets/castle_theme.wav) + SFX PLAN §6.
7. Suite `test/m9_castle_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 scouter hints).

## unfreeze() shift list for THIS map
bloodMoon.nextBeamAt / beam[].sweepUntil · waltz.nextAt / until ·
chandelier[].warnUntil / crashAt / rehoistAt · gargoyle mob perchUntil /
diveWarnUntil / diveAt · maiden nextLobAt + lob.at + pool dieAt · halberd
nextThrustAt / thrustWarnUntil · phantom emergeAt / nextBlinkAt · armor
_pieces.reassembleAt · duelist nextLungeAt / lungeWarnUntil · boss:
nextPassAt / passLaneUntil / nextCarouselAt / nextTiltAt / tiltWallsUntil /
nextTrampleAt / trample beat clocks / nextSweepAt / nextMoonJoustAt /
moonbeam.sweepUntil / ventedUntil / rootUntil · every _zoneWarn.until.
(Skip Infinity-parked.)

## Traps specific to this map
- WALTZ SURGE moves mobs in a scripted pattern — it must respect hitstop /
  pause / the wave-director resume rule, and NEVER fight the wrap (apply
  drift before wrap check).
- Animated Armor reassembly: pieces are REAL spawns via queueSpawn (killable,
  credited); reassemble cancels if pieces dead; clean pieces in
  annihilateSwarm + clearNameTag paths.
- Portrait Phantom emergence points come from PORTRAIT DECOR positions in
  the PLAN array — not random walls.
- Gargoyle perch = dmg-resist mult (NOT immunity — no ward-guard reuse
  without the 'IMMUNE' popup; use a 'HARDENED' popup instead).
- The boss is WIDE (mounted): lance-pass lane collision uses the horse body,
  contact fromBoss=true; ensure the body resize happens at spawn (BOSS_HI
  entry — m6e hitbox lesson).
- Spectral tilt barriers = temporary static bodies; MUST clear on verb end,
  dismissScouter, boss death, AND annihilateSwarm.
- Beams empower mobs: reset the empowered flag each frame BEFORE marking
  (conceal-flag lesson, same family).
- Suites: park bloodMoon clocks = Infinity + clear chandeliers before
  fixtures.

## assets/ inventory
castle_mob_options.png (20) · castle_decor_options.png (20) ·
castle_tile_options.png (10 — only #1–5 used) · castle_boss_options.png
(10 jousters) · pale_rider_options.png (10 variations) · castle_boss_final.png
(CANON = variation #10) · castle_scene_plan.png (CANON layout) ·
castle_theme.wav (180.0s reference) · render/ (gothic_kit.js + all render
scripts; RANGER_PATH → game/js/ranger_art.js).
