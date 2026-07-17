# PREHISTORIA — map plan (MAP 15 of the campaign)

> Realm 19. Every pick is Red's. The slot began as "Dino Valley /
> THE TYRANT KING"; the mob take 1 was rejected ("these dont look
> like real dinosaurs" — take 2 uses real-anatomy profiles), the boss
> journey ran rex shape → ripped cavemen → cavewomen → DRAGONS, and
> Red crowned **THE PRIMORDIAL** (dragons #10). Sheets + finals in
> `assets/` and `artdev/prehistoria/`. Numbers TUNE ME. LOCKED
> 2026-07-16 (kit "ok", scene "sounds good", theme take 2 "perfect").

## 1 · Theme + name

**PREHISTORIA** — a lost-world plateau where everything is bigger,
older, and hungrier than you. Fern meadows and deep jungle in the
west, a smoking volcano quarter in the northeast with a NEST ARENA on
its rim, a river full of reeds along the south, tar pits and bone
fields between. The sky is the mechanic: meteors fall here, and the
apex of the food chain hatches out of an egg the size of a house.

- Realm id `prehistoria`, biome `prehistoria`, boss `primordial`,
  music `prehistoria`.
- Standard realm size. TOROIDAL wrap both axes (campaign default) —
  the GAME TRAIL and the RIVER both wrap W–E as continuous rings.
- DINOS ONLY as mobs (Red): no cavemen, no mammals. The caveman /
  cavewoman sheets exist in assets/ as boss-exploration history, NOT
  map content.

## 2 · METEOR SHOWER — signature map cycle (LOCKED, Red's pick)

Recurring sky-fall cycle, the map's only ambient mechanic:

1. **OMEN** — bright streaks rake across the sky (readable everywhere
   on the minimap horizon; SFX whistle) for a beat or two.
2. **THE RAIN** — warned impact circles appear across the map in
   sequence, then meteors slam down (fromCycle damage; standard
   telegraph rules — never instant, never unavoidable).
3. **AFTERGLOW** — each impact leaves a brief LAVA PUDDLE (small burn
   zone) that cools and fades after a few seconds.

Density is HEAVIER in the volcano quarter (NE) — the closer to the
nest, the angrier the sky. Fresh mechanic — no reuse (stampedes idea
from the original slate was dropped; the GAME TRAIL tile keeps the
stampede LOOK as decoration only).

## 3 · Destructibles (global fence rule)

Red's 20 decor picks include NO fence — nothing to fence-rule here.
The campaign-wide law stands regardless: **if any fence is ever added
to this map, it ships destructible** (deterioration states + shard
animation, coral pattern). All 20 decor pieces are standard scenery.

## 4 · Roster (7 — Red picked 1 2 3 4 5 6 20; DINOS ONLY)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Raptor** | pack lunger | spawns in packs; warned sickle-claw lunge (mini-dash) |
| **Compy Swarm** | tiny chasers | weak nippers, dangerous in numbers; also the boss's summon |
| **Triceratops** | charger | warned shield-charge line, capped knockback (displacement tag) |
| **Stegosaurus** | tank | slow, high HP; warned thagomizer tail sweep (rear arc) |
| **Pterodactyl** | diver | circles high; shadow marks the dive lane (valkyrie tech) |
| **Dilophosaurus** | zoner | twin crests flare; warned venom spit arc → lingering venom puddle |
| **Brachiosaurus** | colossus | NEUTRAL until provoked; warned quake-stomp circle; wanders the meadows |

**RECOLOR RULE (Red): at least one recolor per mob EXCEPT the
pterodactyl** (prehistoria_recolors.png, approved). Variants spawn
MIXED with the originals: **Jungle Raptor** (orange→green) · **Rust
Compies** (green→rust) · **Moss Triceratops** (blue→olive) · **Ember
Stego** (green→ember) · **Midnight Dilo** (green→indigo) · **Storm
Brachio** (sage→slate). Palette-swap variants share the base draw
(hue/sat/lightness params in render_prehistoria_recolors.js).

## 5 · Decor + tiles

**DECOR (ALL 20 pass):** giant ferns · cycad palm · canopy tree ·
tar pit (bubbling, half-sunk bones) · volcanic vent · giant nest
(eggs, one hatching) · titan ribcage (walk-through skeleton) · amber
boulder (bug inside) · mossy boulders · horsetail reeds · hollow log ·
termite spire · ginkgo tree · SKULL ROCK (rex-skull landmark) ·
geyser spring · araucaria conifer · mud wallow · primordial bloom ·
METEOR CRATER (the omen made permanent) · roost spire (pterosaur
nest pillar).

**TILES (ALL 10 pass):** #1 JUNGLE FLOOR (BASE) · #2 MUD FLATS ·
#3 FERN MEADOW · #4 RIVERBED STONE · #5 VOLCANIC ASH · #6 TAR SEEP ·
#7 BONE FIELD · #8 GAME TRAIL (**stampede-look road, DECORATIVE
ONLY** — packed dirt + many prints; no mechanic attached) · #9 SWAMP
SHALLOWS · #10 CRATER ROCK (impact-cracked scorch — dress meteor
craters + volcano quarter).

**PLANNED scene (assets/prehistoria_scene_plan.png):** fern meadows
NW (trikes, stegos, brachio wanders) · deep jungle W (raptors +
compys) · volcano quarter NE (ash, vents, crater) with the **NEST
ARENA on the rim — the giant egg sits there waiting** · SKULL ROCK
center landmark · GAME TRAIL wraps W–E mid-map · RIVER wraps W–E
along the S with a ford + log bridge, dilos in the reeds · tar pits +
bone field + titan ribcage S · swamp SW · geyser springs SE · roost
spire E (ptero dives). Toroidal. Meteor impacts everywhere, heaviest
NE.

## 6 · BOSS — THE PRIMORDIAL (nest arena, volcano rim)

**Look (LOCKED, assets/dragon_final.png):** dragons sheet #10 — a
FEATHERED dino-dragon: brown-gold scale body, pale belly plates,
feathered wings + crest, swept horns, fire breath. dragon160(put,S,p)
parameterized in render_dragons.js; FINAL params (O) in
render_dragon_final.js. Big-beast class (~140 display, TUNE — arena
camera generous, epic-big tier like the Volt Wyrm).

**ENTRANCE — THE HATCH (LOCKED, assets/hatch_entrance.gif):** the egg
sits in the nest arena from map load, VISIBLY BIGGER than the dragon
it contains. On trigger (player enters the arena): 4-beat animation —
(1) the egg, towering · (2) a GLOWING CRACK splits it down the
middle · (3) the halves SEPARATE, the Primordial revealed between
them · (4) the halves FLASH WHITE and disappear. Frames via
render_hatch_frames.js (1–4, S=220). Boss is untargetable until the
flash; fight starts on beat 4.

**Kit (boss contract, Red: "ok"):**
- TAIL LASH — warned melee arc behind/beside him.
- FIRE BREATH — marked cone that RAKES across the arena (telegraphed
  sweep path, walk out of it).
- WING GUST — warned cone push, CAPPED knockback (displacement tag).
- COMPY CALL — 2–3 map compys scurry in (fromBoss, boss-green glow,
  NO drops).
- P2 (<50%): his feathers IGNITE (body glow state) + shadow-marked
  DIVE STRAFES (valkyrie/satan lane tech — shadow runs the lane, he
  lands along it).
- **SIGNATURE — METEOR CALL:** he ROARS at the sky and calls the map
  cycle early — warned impact circles land in sequence around the
  arena → the last stone WINDS HIM: he crumples, wings drooped —
  **vented ×1.5 (hurtBoss)** until he shakes it off.

≤6 scouter hints (bestiary page): streaks in the sky mean stones —
stand outside the circles · lava puddles cool, wait them out · the
dive follows the shadow · dilos spit from the reeds and the puddle
lingers · the big longneck is peaceful until you aren't · when his
roar calls the meteors down, the last one leaves him winded — unload.
Every source fromBoss=true (cycle damage fromCycle). NO burst+radial
spam.

## 7 · Music + SFX

**"PRIMAL.EXE"** (assets/prehistoria_theme.wav — **TAKE 2,
RED-APPROVED ("perfect")**; Red's direction: "another techno piece
trance vibes but dark"): DARK TRANCE, 140 BPM, 105 bars = 180.0s,
D minor (bass D–D–Bb–A), chiptune only, detuned dual-pulse
"supersaw" lead. NO SLOW INTRO — four-on-the-floor kick + rolling
16th bass from sample 0: A grind + dark stabs → B acid arp rises →
C dark riff enters (~0:55) → D TENSION (held minor pads, arp up an
octave, snare-roll build — **the kick never stops**) → E THE DROP at
bar 64 (~1:50, full stack + high echo answers) → F octave-doubled
finale → low-D ring-out at exactly 180.0. Take 1 (primal drums +
chant) was REJECTED — do not resurrect it. Port via
section-composer — KEEP the bar-0 full entry, the D–D–Bb–A dark
bassline, the 16th acid arp, the D-section build with the kick
running through, and the bar-64 drop.
New SFX: meteor omen whistle · impact boom + debris · lava puddle
sizzle (loop while standing near) · raptor shriek + pack chitter ·
compy chirps · trike charge bellow + hoofbeats · stego tail whoosh +
plate rattle · ptero screech + dive whoosh · dilo crest flare +
spit + puddle bubble · brachio far-off footfall thooms (ambient) +
quake stomp · geyser burst · tar glorp · BOSS: hatch crack/split/
flash choir-hit, roar, tail lash whoosh, breath rake crackle, wing
gust buffet, compy call chirp-swarm, ignite fwoosh, dive strafes,
METEOR CALL roar + skyfall sequence, winded crumple + recover snort.

## 8 · Build order (Opus)

1. art.js: 7 mob draws ported from assets/render/
   render_prehistoria_mobs2.js (take 2 anatomy: #1 raptor160 ·
   #2 drawCompies · #3 trike160 · #4 stego160 · #5 drawPtero ·
   #6 drawDilo · #20 drawBrachio) + 6 recolor palette params from
   render_prehistoria_recolors.js (NO ptero recolor) + THE
   PRIMORDIAL (dragon160 + O finals from render_dragon_final.js;
   P2 ignited-feather glow state + dive frames + winded vent frame)
   + THE HATCH 4 entrance frames (render_hatch_frames.js) + 20 decor
   (render_prehistoria_decor.js) + 10 tiles
   (render_prehistoria_tiles.js) + meteor streak/impact/lava-puddle
   FX. NOTE: body() fills step in DEVICE SPACE (moiré fix, see
   render_dino_shapes.js) — keep that pattern when porting.
   MOB_DISPLAY: raptor ~44 · compy ~22 · trike ~64 · stego ~62 ·
   ptero ~48 · dilo ~44 · brachio ~110 · PRIMORDIAL ~140 (TUNE).
2. map.js: MAPS.register({ id:'prehistoria', ... }) — realm/biome/
   7 mob rows (+ recolor variant spawns mixed, ptero exempt)/boss
   def/dropTable/console unlock + PRIMAL.EXE composer + SFX +
   meteorCfg { omenMs, waveCount, puddleMs, neBias } + brachio
   neutral-flag config.
3. scene.js: layout per assets/prehistoria_scene_plan.png (§5).
   River = impassable except ford + log bridge; nest arena on the
   volcano rim with the egg pre-placed; toroidal both axes.
4. METEOR SHOWER cycle per §2 (omen → warned circles → brief lava
   puddles; NE-heavier density; fromCycle tags).
5. BOSS per §6: hatch entrance gating (untargetable till flash),
   full kit, METEOR CALL reuses the cycle machinery (early-fire),
   vent window, P2 ignite + dives.
6. Music port (verify vs assets/prehistoria_theme.wav) + SFX §7.
7. Suite `test/m21_prehistoria_verify.js` + FULL battery + ?v= bump +
   docs (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints): meteor
   telegraphs (never instant, density caps, NE bias) · lava puddle
   expiry · recolor mix spawning + ptero exemption · brachio
   neutral-until-provoked · hatch entrance beats + untargetable
   window · boss kit (breath rake path, gust caps, dive shadows,
   METEOR CALL early-fire + no double-fire with ambient cycle,
   vent ×1.5) · toroidal routing incl. trail/river rings.

## 9 · unfreeze() shift list preview (full in BUILD_INSTRUCTIONS)

meteor cycle omenAt / wave impact[].at / puddle[].until · raptor
lungeAt · trike chargeAt · stego sweepAt · ptero diveAt (shadow
lane) · dilo spitAt / venomPuddle[].until · brachio stompAt /
provokedUntil · compys (no clock) · geyser burstAt · PRIMORDIAL:
hatchBeatAt / nextVerbAt / lashAt / breathRakeAt (sweep path angle) /
gustAt / compyCallAt / igniteAt / diveLane[].at / meteorCallAt /
callImpact[].at / ventedUntil · every _zoneWarn.until. (Skip
Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — roster (7 dinos, take-2 anatomy, recolor
rule w/ ptero exemption), decor (all 20), tiles (all 10; GAME TRAIL
decorative), METEOR SHOWER cycle, THE PRIMORDIAL (dragons #10,
"boss art LOCKED") + THE HATCH entrance (gif approved) + kit ("ok"),
scene ("sounds good"), PRIMAL.EXE take 2 dark trance ("perfect").
Map 15 is build-ready.
