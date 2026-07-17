# BELLY — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks
(plus the small cutscene rig this map introduces).*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: JONAH
  AS A VIDEO GAME — you get eaten in the first thirty seconds, fight
  through the consequences, and the final boss is the mouth you came
  in through. The shanty keeps it a romp, not a horror show.

## THE HEADLINES (get these right before anything else)
1. **"???" REVEAL**: realm select shows "???" until the realm is
   beaten once, then BELLY OF THE BEAST forever (persisted flag).
2. **INTRO CINEMATIC (the game's FIRST)** — beats VERBATIM: pirate
   ship deck, nothing to fight → player chat blurb "thats weird...
   isnt there supposed to be stuff for me to kill?" → waves roll →
   TITAN WHALE breaches straight up + swallows the WHOLE SHIP →
   swirl-fade → wake on the wrecked deck inside. Skippable on
   repeat entries, never on first.
3. **THE UVULA = the exit**: attackable set piece at the gullet end.
   Kill it → the whale GAGS → OUTRO cutscene (it beaches itself +
   spits you up) → SAND ARENA stage → boss.
4. **STATIONARY BOSS**: THE TITAN WHALE never moves. Beached across
   the arena top (head-on maw, orca dress), screen-scale; the
   player circles + dodges telegraphed zones. WATER GUN signature.
5. **DIGESTION TIDE**: gurgle warn → walls flex → acid spreads from
   the lakes as warned zones → recedes. Safe high ground always:
   wreck deck, gristle path, vault shelves.

## Deliverables
1. `map.js` — MAPS.register({ id:'belly', ... }). Realm 'belly',
   nameReveal { hidden:'???', revealOnFirstClear:true }, boss
   ['titanWhale'], music 'belly', cinematicCfg { intro, outro,
   skipRepeat:true }, tideCfg { gurgleMs, riseMs, recedeMs,
   safeZones[] }, uvulaCfg { hp (TUNE), triggersOutro:true },
   arenaCfg { stage:'beach', bounded:true }. SIXTEEN mob rows w/
   zone tags (wreck/vaults/gullet/lakes/deepgut/heap). Console
   'belly' unlocked.
2. `art.js` — port picked draws from assets/render/:
   MOBS (render_belly_mobs.js — roster #1 DROWNED FISHERMAN ·
   #2 GUT LOBSTER · #3 SEA SNAKE · #4 CRIMSON STARFISH · #5 MERMAID
   · #6 SWALLOWED PIRATE · #7 SKELETON DECKHAND · #8 SHIP RAT PACK ·
   #9 BILGE PARROT · #10 GUT CRAB · #11 ACID SLUG · #12 BILE JELLY ·
   #16 LAMPREY · #17 GUT WORM · #18 KRILL CLOUD · #19 FLESH POLYP;
   NEVER port 13/14/15/20).
   BOSS: whaleGod() from render_belly_boss.js w/ FINAL O params from
   render_belly_boss_final.js (ORCA DRESS: black hide #22262e,
   white patches + chin, red eyes, TEETH). **Teeth-inside fix is
   canon** — teeth anchor to the maw's own boundary via bounds()
   (upper row hangs in, lower row rises in); do not regress to
   teeth-on-the-chin. Extra frames: cheek-SWELL (water gun tell),
   throat-glow P2 (maw alight), gasping slump (vent), inhale pucker,
   chomp bite.
   DECOR: all 20 (render_belly_decor.js). TILES: picks 1 2 3 4 6 8 9
   (render_belly_tiles.js) — #3 ACID SHALLOWS gets 3–4 ANIM frames
   (phase-shift the current highlights + bubbles).
   SET PIECES: THE UVULA (idle sway + hit flash + 3 damage states +
   gag burst) · WRECK DECK platform (decor-composed: hull, masts,
   sails, lantern rigs) · ARENA BEACH stage art (sand ground + surf
   line + the beached whale backdrop per whale_shape_options.png
   pose 2 look) · intro ship-at-sea + breach whale (reuse whaleGod
   silhouette side-on at cinematic scale) + swirl-fade.
   FX: tide edge warn, mortar warn circles + splash, inhale cone +
   wind streaks, slam ring w/ gaps, water gun corridor + jet,
   wet-sand patches, jelly/polyp pop warns.
   MOB_DISPLAY (TUNE): fisherman 46 · lobster 48 · snake 44 ·
   starfish 36 · mermaid 46 · pirate 46 · deckhand 44 · rats 30 ·
   parrot 34 · crab 46 · slug 40 · jelly 38 · lamprey 42 · worm 50 ·
   krill cloud 44 · polyp 44. WHALE: arena-backdrop scale (~arena
   width; fixed arena camera, TUNE).
3. `scene.js` — layout per assets/belly_scene_plan.png: WRECK
   center (SPAWN on deck) · RIB VAULTS N behind baleen curtains ·
   DEEP GUT E · ACID LAKES S + SHALLOWS SE · TREASURE HEAP SE ·
   GULLET W → UVULA at the far end · GRISTLE PATH ring W–E ·
   lantern rigs as light sources. GUTS stage toroidal both axes;
   ARENA stage bounded beach (no wrap).
4. DIGESTION TIDE per headline #5 (fromCycle damage, warned
   spreading zones, mobs path out, suppressed during gag/cinematics
   and the arena stage).
5. CINEMATIC RIG (new, keep minimal): scripted camera + sprite anims
   + chat blurb + fade; used by intro (§2 beats verbatim, blurb text
   EXACT) and outro (beach + spit + arena handoff). Save-state: quit
   after uvula kill resumes AT THE ARENA.
6. BOSS per PLAN §7: stationary rig (no pathing/leash), kit verbs
   on nextVerbAt cadence, WATER GUN corridor FULLY marked before the
   jet moves (rotating-sweep telegraph, prehistoria rake rule),
   INHALE capped + displacement tag shared w/ mermaid charm, CHOMP
   punishes maw-camping, GUT COUGH no-drop guard, P2 maw alight,
   vent ×1.5 on the gasp.
7. Music port ("HEAVE HO.EXE", 90 bars @120 A dorian, TAKE 1
   RED-APPROVED; verify vs assets/belly_theme.wav — keep the SWUNG
   8ths, bar-0 stomp entry [NO intro], the B-section call/answer
   trade, the storm-verse dip + rebuild, and the HEAVE...HO! ending)
   + SFX PLAN §8.
8. Suite `test/m22_belly_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
tide gurgleAt / riseAt / zone[].until / recedeAt · fisherman castAt ·
lobster chargeAt · snake strikeAt / venomPuddle[].until · starfish
leapAt / latchedUntil · mermaid charmAt (+displacement tag) · pirate
lungeAt · deckhand chopAt · rats (no clock) · parrot diveAt (shadow
lane) · crab pinchAt / stanceUntil · slug lobAt / puddle[].until ·
jelly popAt · lamprey launchAt / drainUntil · worm eruptAt · krill
disperseUntil · polyp ventAt · uvula gagAt / dmgStateAt · cinematic
beatAt (intro/outro) · WHALE: nextVerbAt / mortar[].at / inhaleAt /
chompAt / slamAt / ring gapSeed (no clock) / coughAt / igniteAt /
wetPatch[].until / gunChargeAt / gunSweepAt (corridor angle) /
ventedUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## Traps specific to this map
- CINEMATIC RIG SCOPE-CREEP: this is the game's first cutscene —
  build the minimum (camera script, sprite anim, blurb, fade). Do
  NOT invent a general cutscene engine. Blurb text is VERBATIM:
  "thats weird... isnt there supposed to be stuff for me to kill?"
- FIRST-VIEW GUARANTEE vs REPLAY SKIP: full intro exactly once per
  save; skip prompt afterward. Suite asserts both.
- "???" UI: realm select, map header, bestiary, and death screen
  must all handle the hidden name pre-clear (show "???"), and the
  reveal must persist across sessions.
- ONE-WAY HANDOFF: uvula kill → outro → arena. No path back into
  the guts; resume-mid-map lands at the arena. Suite covers quit at
  every phase (pre-uvula, post-uvula pre-boss, mid-boss).
- TIDE vs TRIGGERS: the tide never fires during cinematics or in
  the arena; the uvula's gullet pocket is a safe zone (no acid
  denying the exit).
- DISPLACEMENT: mermaid charm + boss inhale share the cooldown tag;
  starfish/lamprey latches are dots, NOT displacement.
- WATER GUN: corridor marked before motion, jet follows the mark
  exactly, sweep speed readable (prehistoria rake rule). The vent
  gasp after is the fight's rhythm — don't shorten it below the
  telegraph contract.
- STATIONARY BOSS ≠ TURRET SPAM: verbs alternate zones (mortars far,
  inhale center, slams flanks) so no dead-safe pocket, but NEVER
  more than one screen-scale verb live at once (no burst+radial).
- POP CHAINS: jelly death-pops + polyp krill-pops are warned and
  capped simultaneous — AoE-clearing a cluster must not chain-nuke
  the player or the frame budget.
- KRILL CLOUD = ONE ACTOR w/ particle draw (compy lesson).
- WRECK DECK is decor-composed, not a tile — collision comes from
  the platform structure; deck planks tile was CUT, don't sneak it
  back.
- ARENA GROUND is stage art (sand baked into the beach stage) —
  arena sand tile was CUT from the map tileset; the arena is not a
  tiled realm floor.
- SHANTY MIX: gut heartbeat ambience stays far under the stomp;
  cinematics duck the music, the arena re-enters it at the drop of
  the boss health bar.
