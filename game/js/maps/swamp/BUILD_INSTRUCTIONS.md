# SWAMP — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This folder
is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in [[ten-maps-campaign]]
  + docs/TEN_MAPS_PLAN.md. Mood check: BAYOU WITCH — black water + wisp
  glow + brew green; alive (frogs, fireflies), not dead-grey.

## Deliverables
1. `map.js` — MAPS.register({ id:'swamp', ... }). Realm 'swamp', boss
   'brewmistress', music 'swamp', totemCfg { cycleMs ~18000, maxUp:2,
   hexes:[slow,drain,weaken], totemHp — ALL TUNE }. TWELVE mob rows. Boss
   def mapOwned, NO radial/stream. Console 'swamp' unlocked.
2. `art.js` — port picked draws from assets/render/render_swamp_mobs.js
   (#1 2 4 5 6 8 11 13 14 17 19 20), render_swamp_boss_final.js (CANON;
   swampWitch(put,S,o) parameterized in render_swamp_boss.js), HEX TOTEM
   object (rise anim frames ok; 3 aura tints: violet slow / green drain /
   bone weaken), 9 decor (hut · cauldron · snag · lilies · cattails · rot
   log · mushroom ring · firefly bush · ritual circle) + croc-skull
   landmark, tiles #1 2 3 5 6 8 9 10. MOB_DISPLAY: bogling ~34 · leech
   ~40 · skeeters ~44 · turtle ~50 · witchling ~42 · myconid ~46 · toad
   ~48 · serpent ~52 · sprite ~32 · imp ~38 · mimic ~54 · mossback ~64
   (TUNE). Boss ~110.
3. `scene.js` — island layout per assets/swamp_scene_plan.png: 7 islands,
   plank paths (walkable over water), water rule (slow-wade OR blocked —
   pick ONE, document in PLAN), mire seeps, glade ritual circle, hollow
   arena ring + hut + giant cauldron (the entrance prop); wrap via edge
   planks (S↔N, E↔W).
4. HEX TOTEM details: cycle picks a free site (A–E) → shimmer warn →
   totem rises (solid, shootable env object w/ hp) → pulses ONE hex aura
   as expanding tinted rings (aura = status field inside current ring
   radius; slow / drain ticks / weaken outgoing damage) → SHOT DOWN =
   splinter burst (killMobCredited for mobs caught; no player damage).
   HARD RULES: max 2 up; never at the dock; auras affect MOBS TOO (they
   are not immune — witch's magic is indiscriminate; drain hurts them,
   env-credited). Suites park totem.nextAt = Infinity.
5. Boss per PLAN §5. Entrance: cauldron bubbles accelerate + glow → she
   rises ladle-first (drip FX) + cackle + toad hop → title card, THEN
   r.scanning. PLANT A HEX TOTEM reuses totem tech (slow hex only,
   shorter hp). GRAND BREW: dive in (boss untargetable + cauldron becomes
   the actor) → warned splash circles → POT TIPS: half-arena telegraphed
   WAVE (pick the half AWAY from a random safe半? NO — fixed alternating
   halves, clearly warned) → she crawls out, bs.ventedUntil ×1.5
   (hurtBoss), rooted. Enrage: cycle timers tighten.
6. Music port ("WISP RAVE", 105 bars @140 trance, RED-APPROVED; verify vs
   assets/swamp_theme.wav — keep four-on-floor + offbeat hats, acid bass
   slides, gated pads, and the breakdown→build→drop arc) + SFX PLAN §6.
7. Suite `test/m14_swamp_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
totem[].nextAt / riseAt / pulseAt / ring[].at · leech lungeAt / latchUntil
(PLAYER latch — release on hitstop/death/realm change!) · turtle snapAt /
tuckUntil · witchling boltAt · myconid cloudAt / sector[].at · toad lobAt /
flask[].landAt + seep dieAt · serpent laneAt / strikeAt · sprite nextHealAt ·
imp hopAt / smashAt + patch dieAt · mimic hopAt / ring[].at / spewAt /
arc[].landAt · mossback wakeAt / chargeAt / slamAt · boss: nextVerbAt /
totem hp obj / gasSector[].at / addsAt / dive seq: splash[].at / waveAt /
emergeAt / ventedUntil / rootUntil · every _zoneWarn.until. (Skip
Infinity-parked.)

## Traps specific to this map
- Leech LATCH is player CC — SHORT (~0.8s TUNE), break on boss arrival +
  transitions (pirate harpoon-pin lesson).
- Turtle tuck = brief damage-immune shell; cap chain-tucking (cooldown) so
  it can't turtle forever; suites assert it opens.
- Sprite heal targets mobs only, respects hitstop; kill-priority hint in
  bestiary.
- Mossback sleeps disguised as a decor-grade mound — shimmer on wake warn
  only on the MOB (lurker/teddy lesson); sleeping = untargetable? NO —
  targetable but 0 aggro until woken or shot (shooting wakes it).
- Totem auras + myconid slow + boss gas can stack — cap combined slow
  (CC-stack rule from pirate/carnival).
- Boss totem verb: never plant while 2 map totems are up (3 hexes on
  screen = soup); if map totems active, verb reroutes to FLASK VOLLEY.
- GRAND BREW wave: fixed alternating halves, warned long; wave damages
  MOBS too (killMobCredited); cauldron untargetable always (it's scenery
  + FX actor, ghost-ship lesson).
- Serpent lanes wrap (rider lesson) — warn on both sides of the seam.
- Water rule (wade vs block) changes routing — whichever is picked, the
  suite's routing walk must cover planks-only reachability.
- Croak/cricket ambience = quiet; duck under boss music.

## assets/ inventory
swamp_mob_options.png (20) · swamp_decor_options.png (20; Red picked 9) ·
swamp_tile_options.png (10; spread delegated, 8 used) ·
swamp_boss_options.png (10 work-ups) · swamp_boss_final.png (CANON #4
BREWMISTRESS) · swamp_scene_plan.png (CANON layout) · swamp_theme.wav
(TAKE 3 — 180.0s reference) · render/ (swamp_kit.js + all render scripts;
RANGER_PATH → game/js/ranger_art.js).
