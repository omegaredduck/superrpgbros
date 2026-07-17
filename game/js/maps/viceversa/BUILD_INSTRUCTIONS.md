# VICEVERSA — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks
(plus the shared destructible-fence helper both fences reuse).*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: THE
  ETERNAL STRUGGLE PLAYED FOR LAUGHS AND STAKES — hell is metal,
  heaven is majestic, and the player is the little chaos agent
  dragging one into the other. The map name is the strategy guide.

## THE HEADLINES (get these right before anything else)
1. **SPLIT MAP**: hell west / holy east, river of souls N–S between,
   ONE bridge (bone half west, gold half east). BIG (~1.5× standard;
   cap live actors, scale spawn counts with area — TUNE).
2. **FACTION WARFARE (the whole map mechanic, Red)**: hell and holy
   mobs damage each other at full value. Player drags chases across
   the BRIDGE to start fights. Mob-vs-mob kills give the player
   NOTHING (no xp/loot/credit) — farm guard is load-bearing.
3. **WRAP-LEASH (Red)**: crossing the E–W wrap seam DROPS all
   pursuers (they path home, brief deaggro immunity); only arrival-
   side mobs may aggro. N–S wrap does NOT drop chases (same side).
   The bridge PRESERVES chases. Suite asserts all three behaviors.
4. **DOUBLE BOSS**: both spawn at load, hard-leashed to their own
   arenas. Player spawns ON THE BRIDGE seam. First kill opens the
   PORTAL pair (arena↔arena). Map clears when BOTH are dead. Bosses
   never damage each other.

## Deliverables
1. `map.js` — MAPS.register({ id:'viceversa', ... }). Realm
   'viceversa', bosses ['satan','supremeBeing'], music 'viceversa',
   factionCfg { crossDamage:true, mobKillCredit:'none' },
   wrapLeashCfg { dropOnEWSeam:true, deaggroMs }, portalCfg
   { opensOnFirstBossKill:true }, fenceCfg (bone + golden, shared
   helper). SEVENTEEN mob rows, each tagged faction:'hell'|'holy'.
   Console 'viceversa' unlocked.
2. `art.js` — port picked draws from assets/render/:
   HELL mobs (render_underworld_mobs.js #1 IMP · #2 FIRE IMP ·
   #3 SUCCUBUS · #4 DEMON BRUTE [fel cracks] · #6 SKELETON WARRIOR ·
   #9 GHOST · #12 CHAIN GAOLER · #15 TORMENTOR [fel whip]).
   HOLY mobs (render_holy_mobs.js #1 CHERUB · #2 ANGEL SOLDIER ·
   #3 SERAPH · #4 VALKYRIE · #7 TEMPLE ACOLYTE · #10 GUARDIAN STATUE
   [+frozen/moving frames] · #12 HARP SIREN · #16 HERALD ·
   #20 ARCHON).
   SATAN: render_satan.js satan() w/ FINAL params from
   render_satan_final.js (#10 KING IN FLAME: fire cape + crown,
   wings, GOLD trident, crown horns, goat legs) + P2 flight frames +
   crown-out vent frame.
   SUPREME BEING: **the composite** (render_supreme_entrance.js
   layout): zeusGod() body w/ params from render_supreme_final.js
   (white beard, gold half-robe, SUN CROWN, scales dangling from the
   outstretched fist) + eyeGod() WATCHER (eye sheet #1) hovering
   above on twin light shafts. EYE BLINK idle: 4-frame cycle
   open(hold ~1200ms) → half → closed → half (~230ms total blink) —
   reference assets/supreme_blink.gif. Extra frames: eye SHUT
   (beam charge tell), eye DROOP + kneel (vent), fly-in entrance.
   DECOR: all 20 hell (render_hell_decor.js) + all 20 holy
   (render_holy_decor.js w/ #7 GRAND CANDELABRA + #13 CHURCH PEWS
   from render_holy_decor_fix.js). Both fences = 3 break states +
   shard burst (shared helper). River/bridge set from
   render_eternal_decor.js #17-20 (obelisk, soul geyser, titan
   sword, bridge lanterns).
   TILES: render_eternal_tiles.js #1-7 + #9 river (build 3-4 ANIM
   frames by phase-shifting the current highlights + soul faces).
   BRIDGE structure + PORTAL art. MOB_DISPLAY: imp ~34 · fire imp
   ~36 · succubus ~46 · brute ~58 · skeleton ~44 · ghost ~42 ·
   gaoler ~50 · tormentor ~46 · cherub ~32 · angel ~46 · seraph ~48 ·
   valkyrie ~44 · acolyte ~42 · statue ~50 · siren ~46 · herald ~44 ·
   archon ~56 (TUNE). SATAN ~130 · SUPREME ~120 body + eye above
   (composite reads ~150 tall — keep arena camera generous).
3. `scene.js` — layout per assets/eternal_scene_plan.png: river
   impassable N–S (meander), bridge only crossing, hell zones (war
   camp NW, graves W, bone fields, magma SW, throne arena S) · holy
   zones (chapel NE, fountain plaza E, cloud meadows, gate arena S) ·
   obelisks at outer seam · titan sword bank monument · portal rings
   dormant. PLAYER SPAWN = bridge seam. Wrap: N–S normal, E–W outer
   edges joined.
4. FACTION WARFARE per headline #2 + hostility matrix: hell↔holy
   mutual, both→player. Chases persist over the bridge; wrap-leash
   per headline #3. Mob-vs-mob kills: no credit, corpses still play
   deaths (spectacle is the point). Cap simultaneous cross-side
   brawlers (~12 TUNE) so dragged armies don't melt the actor budget.
5. DOUBLE BOSS per PLAN §6. Boss leashes are HARD (never cross the
   river even if kited); bridge is out of both leashes. SATAN: ring
   safe-gaps readable; pillar sequences never overlap the ring.
   SUPREME: JUDGMENT BEAM charge uses the eye-shut frame (the blink
   idle must never fake the tell — idle blink ≤230ms, charge shut is
   ~900ms+ and audibly hums); SCALES smite = strict half-arena split,
   raised pan = safe side, suite asserts correctness. Portal opens at
   first kill w/ choir sting; map-clear only when both are down.
6. Music port ("ETERNAL WAR.EXE", 114 bars @152 E-minor, TAKE 1
   RED-APPROVED; verify vs assets/eternal_theme.wav — keep bar-0
   full stack [NO intro], the D-section stepping rise + marching
   rolls, the F-section HOLY CALL / HELL ANSWER trade, the +2 key
   lift, the G finale + ring-out) + SFX PLAN §7.
7. Suite `test/m20_viceversa_verify.js` + full battery + ?v= bump +
   docs (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
river animPhaseAt · geyser burstAt · statue moveWindowAt / frozen
(facing-cone check, no clock) · acolyte healTickAt ·
siren/succubus charmAt (+ shared displacement-cooldown tag) · gaoler
hookAt · tormentor arc[].expireAt · valkyrie diveAt · herald
blastAt · archon dashAt · fence[].stateAt / regrowAt ·
portal.openedAt · SATAN: nextVerbAt / sweepAt / pillar[].at /
impCallAt / flightAt / diveLane[].at / tridentReturnAt / ringAt /
ring gapSeed (no clock) / ventedUntil · SUPREME: nextVerbAt /
gavelAt / beamChargeAt / beamFireAt / scalesAt / smiteAt /
cherubCallAt / verdictChargeAt / verdict sweepAngleAt / ventedUntil ·
eye blink cycleAt · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- FACTION FARM GUARD: no xp/loot/kill-credit from mob-vs-mob deaths,
  AND acolytes must not heal cross-faction (obviously) or the war
  never ends. Cap cross-side brawler count; stragglers path home
  after their target dies.
- WRAP-LEASH vs BRIDGE: the two crossings MUST behave differently
  (drop vs persist). Test both directions. N–S wrap never drops.
- CHARM/DRAG STACK: succubus pull + siren pull + gaoler hook all
  share the displacement cooldown tag (abyss lesson) — a mixed
  brawl must not ping-pong the player.
- GUARDIAN STATUE: facing-cone freeze must use the player's aim, not
  camera; frozen statues are invulnerable-from-the-front? NO — keep
  them damageable always (dread, not cheese). Never spawns on the
  hell side (faction integrity).
- GHOSTS phase through terrain but NOT across the river (leash to
  their half like everyone else).
- DOUBLE BOSS SAVE STATE: if the player quits between kills, portal
  state + which-boss-dead must persist; suite covers resume-mid-map.
- BLINK TELL INTEGRITY: idle blink and beam-charge shut must be
  unmistakably different (duration + hum + eye glow color shift).
- BIG MAP BUDGET: actor cap, spawn scaling, and river-anim strip
  count are TUNE-ME's with hard ceilings — profile before shipping.
- Bridge seam start: both armies within earshot at spawn — initial
  aggro radii tuned so spawn isn't an instant pincer.
