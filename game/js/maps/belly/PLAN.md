# BELLY OF THE BEAST — map plan (MAP 16 of the campaign — THE FINALE)

> Realm 20. Red's own design, full structure his: the game's FIRST
> intro cinematic, a "???" name reveal, a map that is the inside of
> a titan whale, and an outro where the whale beaches itself and
> becomes the boss. Every pick is Red's. Sheets + finals in `assets/`
> and `artdev/belly/`. Numbers TUNE ME. LOCKED 2026-07-17 (boss art
> "perfect", kit + tide "sounds good", theme "sounds good").

## 1 · Theme + name + THE REVEAL

**BELLY OF THE BEAST** — you get swallowed, ship and all, and fight
your way out of the whale that ate you. Then you fight the whale.

- Realm id `belly`, biome `belly`, boss `titanWhale`, music `belly`.
- **"???" NAME REVEAL (Red):** the realm select shows **"???"** as
  this realm's name until the player beats it ONCE — then it reveals
  BELLY OF THE BEAST permanently (persisted flag).
- MAIN MAP: toroidal (campaign default). ARENA: separate bounded
  stage (no wrap — you're on a beach).

## 2 · INTRO CINEMATIC (the game's first — beats VERBATIM, Red)

Plays when the player enters the realm:
1. Spawn on a PIRATE SHIP deck at sea. Nothing to fight.
2. Chat blurb over the player's own character: **"thats weird...
   isnt there supposed to be stuff for me to kill?"**
3. Waves roll beside the boat.
4. A **TITAN-SIZE WHALE** breaches STRAIGHT UP and **swallows the
   WHOLE SHIP.**
5. Swirl-fade → the player WAKES INSIDE THE WHALE, on the swallowed
   ship's wrecked deck (map spawn).
Replay rule: full cinematic on first entry; on later entries a
skip prompt (or instant-skip input) — TUNE, but never force repeat
viewing.

## 3 · DIGESTION TIDE — signature map cycle (LOCKED, "sounds good")

The stomach digests on a clock:
1. **GURGLE** — deep rumble + the flesh walls visibly flex (global
   warning, readable everywhere).
2. **THE TIDE** — acid spreads out of the ACID LAKES northward as
   warned zones (edge telegraph, standard rules), covering the low
   ground for a stretch. Mobs avoid it; the player better.
3. **RECEDE** — the acid drains back; brief bile-slick sheen where
   it stood.
High ground stays safe: the wreck deck, gristle path, and rib-vault
shelves are never submerged. Fresh mechanic — no reuse.

## 4 · Destructibles (global fence rule)

No fence in the 20 decor picks — nothing to fence-rule here. If a
fence is ever added, it ships destructible (campaign law). Standard
scenery otherwise.

## 5 · Roster (16 — Red vetoed 13/14/15/20, then "use the rest")

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Drowned Fisherman** | zoner | casts the hooked lure (warned line), gaff swipe up close |
| **Gut Lobster** | charger | warned snip-charge line; big claw pinch |
| **Sea Snake** | striker | warned S-strike from the folds; venom puddle lingers |
| **Crimson Starfish** | leaper | warned leap arc; LATCHES (dot until broken) |
| **Mermaid** | lure | charm song: warned cone, brief pull (capped, displacement tag) |
| **Swallowed Pirate** | line | cutlass slash + warned lunge; the ship's crew |
| **Skeleton Deckhand** | line | boarding-axe overhead chop, warned |
| **Ship Rat Pack** | swarm | fast nippers off the wreck |
| **Bilge Parrot** | diver | circles high; shadow-marked dive peck |
| **Gut Crab** | blocker | frontal shield stance; warned pincer grab |
| **Acid Slug** | lobber | warned acid glob arcs → burn puddles; slime trail |
| **Bile Jelly** | drifter | contact stinger; POPS on death (small warned burst) |
| **Lamprey** | launcher | warned launch line; latches + drains (capped dot) |
| **Gut Worm** | burrower | warned eruption circle underfoot |
| **Krill Cloud** | swarm | drifting chip-damage cloud; disperses under AoE |
| **Flesh Polyp** | spawner | stationary; warned gas-vent circle; pops KRILL on death |

Zone casting per scene §7: crew mobs at the wreck, vault crew north,
acid-life south, worm/polyp/krill east, fisherman/lobster/mermaid in
the gullet, lampreys at the treasure heap.
NOT PICKED (never use): barnacle turret, gut shark, hagfish, cursed
figurehead.

## 6 · Decor + tiles

**DECOR (ALL 20 pass — "all those decorations are in"):** rib arch
(walk-under bone vault) · flesh spire · acid pool · vein cluster
(glowing) · baleen curtain (hanging plates — vault gates) · broken
mast (tilted crow's nest) · torn sail (rigged on rib stumps) · ships
wheel (half-sunk) · cargo crates (one burst) · rum barrel (leaking
amber) · treasure chest (gold spill) · anchor + chain (fluke buried)
· tipped cannon (barnacled bronze) · wrecked dinghy (bitten hull) ·
lobster trap (something inside — eyes glow) · ghost net (floats +
snagged boot) · prey skeleton (giant fish) · kelp wad (half-digested)
· ambergris boulder (waxy, faint gold aura) · lantern rig (crew-
strung ship lights — the map's light source).

**TILES (7 — Red picked "1 2 3 4 6 8 9"):** #1 STOMACH LINING
(BASE — wet pink flesh) · #2 FLESH FOLDS · #3 ACID SHALLOWS
(**ANIMATED** — current highlights cycle; also the tide's material)
· #4 BONE LITTER · #6 BARNACLE CRUST · #8 GRISTLE PATH (the road) ·
#9 BILE SLICK. Cut: deck planks, vein floor, arena sand (the WRECK
deck and the ARENA ground are STAGE ART, not map tiles — the wreck
spawn platform is decor-built; the arena beach is baked into the
arena stage per the approved shape-pass look).

**PLANNED scene (assets/belly_scene_plan.png):** THE WRECK center
(spawn ON the deck; pirates/deckhands/rats/parrot) · RIB VAULT
CAVERNS N behind baleen curtains (crabs, starfish, snakes) · DEEP
GUT E (worms, polyps, krill) · ACID LAKES S (slugs, jellies; tide
source) + ACID SHALLOWS SE · TREASURE HEAP SE corner (lampreys
lurk) · THE GULLET W (fishermen, lobsters, mermaid) ending at **THE
UVULA** · GRISTLE PATH wraps W–E · lantern rigs light the dark.
Toroidal both axes.

**THE UVULA (the exit trigger):** a giant attackable uvula at the
gullet end. Damaging it to zero = the whale GAGS → outro cinematic.
It's visibly a "hit me" set piece (health bar, pink glow).

## 7 · OUTRO CINEMATIC + BOSS (Red's structure)

**OUTRO (on uvula kill):** rumble + swirl — cutscene: the whale
**BEACHES ITSELF and SPITS YOU UP** → you land on a large **SAND
BEACH ARENA** ("basically a 2nd map") → boss fight starts.

### THE TITAN WHALE (sand arena — STATIONARY BOSS, moving player)
**Look (LOCKED "perfect", assets/belly_boss_final.png):** shape pose
#2 HEAD-ON MAW + look #4 ORCA DRESS — black hide, white eye patches
over red eyes, white chin wall, TEETH ringing the dark maw (teeth
sit INSIDE the mouth boundary — bounds() solves the maw curve; keep
that fix). whaleGod(put,S,p) in render_belly_boss.js; FINAL O params
in render_belly_boss_final.js.
**The fight shape (NEW for the game):** the boss NEVER MOVES. It is
beached across the TOP of the arena, screen-scale; the player circles
the sand dodging telegraphed zones. No leash logic — instead, arena
bounds keep the player in its view. Melee is allowed right up at the
tooth line (risk/reward vs CHOMP).
**Kit (boss contract, "sounds good"):**
- SPRAY MORTARS — blowhole globs; warned impact circles rain in
  sequence across the arena.
- INHALE — warned pull cone toward the maw (capped drag,
  displacement tag) ending in a CHOMP zone at the tooth line.
- FLIPPER SLAM — warned flank slam circle → expanding shockwave
  ring with telegraphed SAFE GAPS.
- GUT COUGH — hacks up 2–3 map mobs (fromBoss, glow, NO drops).
- P2 (<50%): MAW ALIGHT — throat glows red, verbs faster, mortar
  impacts leave brief sticky wet-sand patches (capped slow).
- **SIGNATURE — WATER GUN:** cheeks visibly SWELL (the tell) → a
  sweep corridor lights up across the arena → screen-scale pressure
  jet RAKES along the marked path → it slumps gasping, mouth slack:
  **vented ×1.5 (hurtBoss)** until it recovers.

≤6 scouter hints (bestiary page): the cheeks puff before the water
gun — get off the marked corridor · don't fight the inhale, run
sideways out of the cone · mortar circles rain in order — keep
moving · the slam ring has gaps · it never moves — everything else
does · when it slumps gasping after the blast, unload.
Every source fromBoss=true. NO burst+radial spam.

## 8 · Music + SFX

**"HEAVE HO.EXE"** (assets/belly_theme.wav — **TAKE 1, RED-APPROVED
("sounds good")**; Red's direction: "8 bit sea shanty"): 120 BPM,
90 bars = 180.0s, A dorian, SWUNG 8ths (2:1), chiptune only. NO SLOW
INTRO — stomp + melody from bar 0: A verse (stomp/clap motor,
squeezebox offbeats) → B CALL-AND-ANSWER (shantyman lead calls, crew
unison answers) → C big chorus (octave doubled) → D fiddle break
(swung tri runs over gallop bass) → E storm verse (low drone, melody
down the octave, rising "heave" hits build back) → F finale chorus +
fiddle countermelody → crew **"HEAVE... HO!"** + low-A ring-out at
exactly 180.0. Port via section-composer — KEEP the swing, the bar-0
stomp, the call/answer trade, and the HEAVE-HO ending.
New SFX: gut ambience (wet gurgles, distant heartbeat THOOM) ·
digestion tide gurgle-warn + acid rush + recede hiss · uvula hit
squelch + the GAG · intro: wave wash, whale breach roar, swallow
crunch, swirl-fade sting · outro: beach slide rumble, SPIT + splat ·
mob set: lure cast whir, snip charge, snake strike, starfish latch,
mermaid song (charm cone), cutlass clash, axe chop, rat chitter,
parrot screech + dive, crab pincer, slug glob + sizzle, jelly pop,
lamprey launch + drain, worm eruption, krill skitter, polyp vent +
pop · BOSS: mortar launch/impact, inhale wind + CHOMP, flipper slam
+ ring, gut cough hack, maw-alight ignition, WATER GUN charge
(cheek squeak) + jet roar, gasping slump + recover blow.

## 9 · Build order (Opus)

1. art.js: 16 mob draws ported from assets/render/render_belly_mobs
   .js (roster numbers 1 2 3 4 5 6 7 8 9 10 11 12 16 17 18 19; skip
   the 4 unpicked) + THE TITAN WHALE (whaleGod + O finals; P2
   maw-glow state, cheek-swell tell frames, gasping vent frame) +
   20 decor (render_belly_decor.js) + 7 tiles (render_belly_tiles.js
   picks 1 2 3 4 6 8 9; acid shallows ANIM frames by phase-shifting
   highlights) + UVULA set piece (+damage states) + WRECK deck
   platform + intro/outro cinematic art (ship at sea, breach whale
   sprite — reuse whaleGod side silhouette, swirl fade) + arena
   beach stage art (sand ground + surf line per shape pass) + FX
   (tide edge, mortar circles, inhale cone, slam rings, water gun
   corridor + jet).
   MOB_DISPLAY: fisherman ~46 · lobster ~48 · snake ~44 · starfish
   ~36 · mermaid ~46 · pirate ~46 · deckhand ~44 · rats ~30 ·
   parrot ~34 · crab ~46 · slug ~40 · jelly ~38 · lamprey ~42 ·
   worm ~50 · krill ~44 (cloud) · polyp ~44 (TUNE). TITAN WHALE:
   screen-scale arena backdrop (~full arena width — camera fixed
   scale in arena, TUNE).
2. map.js: MAPS.register({ id:'belly', ... }) — realm 'belly',
   nameReveal { hidden:'???', revealOnFirstClear:true }, boss
   ['titanWhale'], music 'belly', cinematicCfg { intro (beats §2,
   skippable-on-repeat), outro (beats §7) }, tideCfg { gurgleMs,
   riseMs, recedeMs, safeZones }, uvulaCfg { hp TUNE, gagTrigger },
   arenaCfg { stage:'beach', bounded }. SIXTEEN mob rows w/ zone
   tags. Console 'belly' unlocked.
3. scene.js: layout per assets/belly_scene_plan.png (§6). Two
   stages: GUTS (toroidal) + ARENA (bounded beach). Spawn = wreck
   deck. Baleen curtains as vault gate decor; uvula at gullet end.
4. DIGESTION TIDE per §3 (warned spread from the lakes, safe high
   ground, mobs path out of it, fromCycle tags).
5. CINEMATICS per §2 + §7: intro on realm entry (first-time full,
   skip after), uvula-kill outro → arena handoff (mid-map save
   state must survive quit between uvula and boss).
6. BOSS per §7: stationary rig, kit verbs, WATER GUN sweep telegraph
   (corridor marked BEFORE the jet moves), vent ×1.5, P2.
7. Music port (verify vs assets/belly_theme.wav — keep swing,
   call/answer, HEAVE-HO ending) + SFX §8.
8. Suite `test/m22_belly_verify.js` + FULL battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints): "???"
   reveal persistence · intro beats + skip · tide telegraphs + safe
   zones · uvula gag trigger + outro handoff + resume-mid-map ·
   arena bounds · full boss kit (corridor-before-jet, inhale caps,
   ring gaps, cough no-drops, vent) · roster zone casting · jelly
   death-pop warn · polyp→krill spawn cap.

## 10 · unfreeze() shift list preview (full in BUILD_INSTRUCTIONS)

tide gurgleAt / riseAt / zone[].until / recedeAt · fisherman castAt ·
lobster chargeAt · snake strikeAt / venomPuddle[].until · starfish
leapAt / latchedUntil · mermaid charmAt (displacement tag) · pirate
lungeAt · deckhand chopAt · rats (no clock) · parrot diveAt (shadow
lane) · crab pinchAt / stanceUntil · slug lobAt / puddle[].until ·
jelly popAt (death) · lamprey launchAt / drainUntil · worm eruptAt ·
krill (no clock, disperseUntil) · polyp ventAt · uvula gagAt /
stateAt · cinematic beatAt (intro + outro) · WHALE: nextVerbAt /
mortar[].at / inhaleAt / chompAt / slamAt / ring gapSeed (no clock) /
coughAt / igniteAt / wetPatch[].until / gunChargeAt / gunSweepAt
(corridor angle) / ventedUntil · every _zoneWarn.until. (Skip
Infinity-parked.)

## 11 · Traps specific to this map

- INTRO FIRST-EVER CINEMATIC: engine has no cutscene rig yet —
  keep it simple (scripted camera + chat blurb + sprite anim), and
  NEVER re-force it (skip on repeat). The blurb text is VERBATIM.
- "???" REVEAL: flag persists per save; leaderboard/realm-select UI
  must handle a nameless realm gracefully pre-clear.
- STAGE HANDOFF: uvula kill → outro → arena is a one-way door;
  quitting between must resume at the arena, not re-run the guts.
- DISPLACEMENT STACK: mermaid pull + boss INHALE share the
  displacement cooldown tag (abyss lesson) — no ping-pong.
- TIDE FAIRNESS: warned edges, never full-map, safe zones always
  reachable, suppressed during the uvula gag + cinematics.
- WATER GUN CONTRACT: corridor is FULLY marked before the jet
  moves; a static warn that surprises with motion breaks the boss
  contract (same rule as Prehistoria's breath rake).
- STATIONARY-BOSS CHEESE: no spot in the arena is out of kit
  coverage (mortars reach everywhere); tooth-line melee is allowed
  but CHOMP punishes camping the maw.
- JELLY DEATH-POP + POLYP KRILL-POP: both are warned micro-bursts;
  cap simultaneous pops so a cleared cluster doesn't chain-burst
  the frame budget.
- KRILL CLOUD PERF: one cloud = one actor w/ particle draw, not 30
  actors (prehistoria compy lesson).
- GUT AMBIENCE HEARTBEAT: quiet, slow — it must not fight the
  shanty's stomp (mix TUNE).

## 12 · Status

**LOCKED 2026-07-17** — roster (16, "use the rest"), decor (all 20),
tiles (7), DIGESTION TIDE ("sounds good"), THE TITAN WHALE (pose 2
+ look 4 ORCA DRESS, teeth-inside fix, "perfect"), kit + WATER GUN
signature ("sounds good"), scene w/ UVULA gag trigger, both
cinematics (Red's verbatim beats), "???" reveal, HEAVE HO.EXE take 1
("sounds good"). Map 16 is build-ready. THE CAMPAIGN SLATE IS
COMPLETE — 16 of 16.
