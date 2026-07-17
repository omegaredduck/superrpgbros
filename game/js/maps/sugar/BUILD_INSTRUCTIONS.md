# SUGAR — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks
(EXCEPT the global destructible-fence retrofit, §THE GLOBAL RULE).*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: PASTEL
  MENACE — everything adorable, saturated, glossy… and hostile. The
  bear smiles while his eyes glow.

## THE GLOBAL RULE (born on this map)
**ALL FENCES IN THE GAME ARE DESTRUCTIBLE (Red).** This map's candy
cane fences (village + den ring) ship destructible with deterioration
states (wobble → crack → shatter into candy shards) + optional slow
regrow (TUNE; staying down is acceptable). THE RETROFIT: audit every
existing realm for fence-type blockers (graveyard fences etc.) and
make them destructible with the same state pattern. One shared
fence-destruct helper in core, per-map art.

## Deliverables
1. `map.js` — MAPS.register({ id:'sugar', ... }). Realm 'sugar', boss
   'sugarBear', music 'sugar', candyCfg { dropChance ~0.04 (TUNE),
   heal:'full', despawnMs ~20000, bossDudChance (TUNE, may be 0) },
   fenceCfg { hp, states:3, regrowMs|null }. ELEVEN mob rows. Boss def
   mapOwned, NO radial/stream. Console 'sugar' unlocked.
2. `art.js` — port picked draws from assets/render/:
   render_sugar_mobs.js (#1 GUMMY BEAR · #2 GINGERDEAD MAN · #3 CANDY
   LANCER · #5 JAWBREAKER · #6 LOLLI TWIRLER [armless] · #7 GUMDROP ·
   #11 COTTON DRIFT · #12 MINT GUARDIAN · #14 MALLOW BRUTE ·
   #16 CUPCAKE MIMIC [sealed; build an open-maw ATTACK frame] ·
   #17 CANDY CORN PACK) + extra frames: gingerdead HALF-CRAWLER,
   gumdrop/mallow minis, jawbreaker LAYER STATES (5 colors, chip
   outward-in). BOSS: render_sugar_bear_shape.js bear160 with FINAL
   params from render_sugar_boss_final.js (cotton candy + multicolor
   gumballs + rainbow chest gem + twin peppermint ears + cane + RED
   GLOW EYES + noFootStripe) — plus P2 variant (disheveled fluff,
   brighter eye glow) and GUMBALL ARMOR DEPLETION visual (studs
   vanish as volleys fire). 20 decor (fence = 3 break states + shard
   burst) + 5 tiles + CHOCOLATE RIVER strips + CANDY PICKUP sprite
   (sparkling wrapped candy, unmistakable). MOB_DISPLAY: gummy ~34 ·
   gingerdead ~42 · lancer ~44 · jawbreaker ~40 · twirler ~46 ·
   gumdrop ~36 · cotton ~44 · mint ~46 · mallow ~56 · mimic ~40 ·
   corn ~30 (TUNE). Boss ~120.
3. `scene.js` — layout per assets/sugar_scene_plan.png: peppermint
   path N–S edge-to-edge · chocolate river W–E edge-to-edge
   (IMPASSABLE water strips, cross at the 2 bridges ONLY — routing
   suite must verify) · village + fences E · forest W · peaks/snow N ·
   geysers + jelly pond SE · crumble flats corners · DEN S-center
   (gummy floor, destructible fence ring, donut arch gate). Wrap.
4. CANDY PICKUPS: on mob death roll dropChance → spawn candy at the
   corpse (sparkle FX). Pickup = FULL HEAL + joyful chime. Despawn
   timer. NO-FARM GUARD: drops disabled for mobs spawned by the boss
   (posse-type) and split-children (gingerdead halves, gumdrop minis,
   mallow minis) — else players farm splits for infinite full heals.
   Suite asserts: split-children never drop; rate within bounds.
5. Boss per PLAN §6. Den fence ring is destructible — breaking in
   early is allowed (fight starts when he's aggroed; suites use the
   arch gate). GUMBALL VOLLEY visibly removes studs from his sprite
   (armor depletion array). BEAR HUG: big warned circle, generous
   windup, dodge → stumble vent ×1.5. CANDY RAIN + sprint = P2
   signature; sprint lane warned full-width; never overlaps CANDY
   RAIN circles still falling (sequence, not stack).
6. Music port ("SUGAR RUSH.EXE", 117 bars @156 A-minor trance, TAKE 1
   RED-APPROVED; verify vs assets/sugar_theme.wav — keep bar-0 full
   stack [NO intro], 16-bar piano solo + 4-bar trade-off + 16-bar
   guitar solo, candy-bell counter-melody, duet final drop, bell tag)
   + SFX PLAN §7.
7. Suite `test/m18_sugar_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
candy[].despawnAt · fence[].regrowAt / stateAt · gummy lungeAt ·
gingerdead slashAt (half-crawler inherits no clock) · lancer chargeAt ·
jawbreaker rollAt / lane[].at · twirler spinAt / spiralUntil · gumdrop
hopAt · mint spinAt / exposedUntil · mallow slamAt · mimic shimmerAt /
openAt / chompAt · corn dart seq[].at · boss: nextVerbAt / hookAt /
volley[].landAt / smotherAt / smother growUntil / hugAt / hugWarnUntil /
ventedUntil / sweep seq[].at / summonLane[].at / stomp seq[].at /
rain[].at / sprintAt / pantUntil · every _zoneWarn.until. (Skip
Infinity-parked.)

## Traps specific to this map
- FULL-HEAL ECONOMY: the no-farm guard (§4) is load-bearing. Also cap
  candies on the ground (~3) — despawn oldest.
- SPLIT SPAWN CAPS: gingerdead halves + gumdrop minis + mallow minis
  respect a global children cap; children never re-split.
- Cupcake mimic: sealed sprite must be VISUALLY distinct from any
  decor cupcake on close inspection (fang tip at the seam) — mimics
  never spawn adjacent to the cupcake cottage (confusion stack).
- Jawbreaker layers = armor states, not hp gates: each layer has its
  own hp; suite asserts chips happen; final core pops.
- Cotton Drift slow + boss COTTON SMOTHER slow — CC-stack cap rule.
- CANE HOOK displacement: small, capped, shares the displacement
  cooldown tag (diver/fisherman lesson from abyss).
- River: impassable STRIP, not a tile — wrap-aware (the river exits
  one edge and re-enters the other at the same meander phase).
- Fences: breaking the den ring early must not soft-lock the boss
  aggro (aggro on proximity, not on gate trigger).
- Peppermint path is cosmetic routing sugar — no speed modifier
  (belts are the factory's thing).
- Icing snow region: purely visual (no slip physics — slicks are the
  west/wine thing).
- Bear's smile NEVER changes — menace lives in the eyes only (Red's
  concept). P2 = disheveled + glow, same smile.

## assets/ inventory
sugar_mob_options.png (20; Red picked 11) · sugar_mob_fixes.png
(armless twirler + sealed mimic) · sugar_bear_shape.png (concept-art
shape pass) · sugar_boss_options.png (10 bears; #9 picked) ·
sugar_boss_final.png (CANON SUGAR BEAR — "thats perfect") ·
sugar_decor_options.png (20; ALL picked) · sugar_tile_options.png
(10; picked 5) · sugar_scene_plan.png (CANON layout) · sugar_theme.wav
(TAKE 1 — 180.0s RED-APPROVED reference) · render/ (sugar_kit.js +
all render scripts; RANGER_PATH → game/js/ranger_art.js,
factory_kit.js one dir up; GOTCHA: 6-digit hex ONLY in fills —
ranger mix() breaks on shorthand).
