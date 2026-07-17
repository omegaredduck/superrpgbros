# WILD WEST TOWN — map plan (MAP 9 of the 10-map campaign)

> Realm 13. Every pick is Red's. Spaghetti-western frontier town at the
> hottest hour of the day: sun-bleached wood, packed dirt, gunmetal —
> and a clock tower that only ever strikes noon. Sheets + finals in
> `assets/` and `artdev/west/`. Numbers TUNE ME. LOCKED 2026-07-16
> (theme = TAKE 1 — Red: "its good").

## 1 · Theme + name

**WILD WEST TOWN** — one dusty main street ruled by a crooked lawman:
saloon facing the jail across the clock-tower square, gallows out back,
desert in every direction. Palette anchors: sand, weathered wood,
leather, gunmetal, navy, gold (west_kit.js `W`).

- Realm id `west`, biome `west`, boss `outlawSheriff`, music `west`.
- Toroidal wrap ON (desert ring stitches all 4 edges; MAIN STREET runs
  N–S edge-to-edge and the RAIL LINE runs N–S on the east side, so the
  wrap reads).

## 2 · HIGH NOON: EVERYBODY DRAWS — signature map cycle (LOCKED)

On a cycle the clock tower strikes NOON (bell tolls, light flashes
white-hot):
1. **FREEZE**: every mob on screen stops and telegraphs ONE synchronized
   shot lane at the player, all at once — a bullet-time lattice of
   warned lanes (standard lane overlays, generous windup).
2. **DRAW**: on the last toll every lane FIRES simultaneously. Standing
   in a lane = hit.
3. **RETURN FIRE**: every lane the player is NOT standing in when it
   fires counts as DODGED and fires BACK down its own lane at its
   shooter (env-credited damage — out-shooting the whole street).
4. **WIND SHIFT**: each noon re-rolls the wind direction → tumbleweeds
   change roll direction.
Mobs with no shot (TUMBLEWEED, DUST DEVIL) don't draw lanes. Cap lanes
at readability (~8 nearest shooters TUNE); suites park the cycle.
Fresh mechanic — no reuse (used: tempest, treasure+curse, blood moon,
low gravity, rocking deck, growing crystal, booths, hex totems).

## 3 · THE NOON EXPRESS — rail hazard (LOCKED; REUSES YARD TECH)

On its own cycle: distant whistle + smoke plume telegraph (~2s) → the
train THUNDERS down the east rail line (full N–S, wraps) — lethal on
the tracks while it passes. **Reuses the yard realm's train system**
(scenes.js train telegraph/instakill tech) and **world_art.js
locomotive + boxcar draws** (sun-bleached recolor ok). Crossing the
rail strip is a real decision; stage stop = cover on the far side.

## 4 · Roster (EIGHT — Red picked 1 2 3 4 5 6 18 16; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Gang Rustler** | pack melee | packs of 4–6; knife-glint flash (~0.4s) → short lunge; fast, fragile |
| **Six-Gun Bandit** | mid shooter | thin aim-line (~0.6s) → single crack shot; strafes between shots |
| **Dynamite Dan** | artillery | TNT lob onto warned blast circle (~1.2s fuse); keeps distance |
| **Rattlesnake** | ambusher | rattle + shake (~0.8s) → cone strike + brief poison slow; coils near cover |
| **Vulture** | flyer | circles; shadow marks the dive line → swoop along it |
| **Tumbleweed** | rolling hazard | rolls with the wind (re-rolled each noon); contact damage; shootable (pops) |
| **Scorpion** | burrower | dust mound crawls toward you → warned sting circle where it pops up |
| **Dust Devil** | zoner | wandering whirlwind: pushes player + deflects player shots inside; leaves brief slow-swirl patches |

All 8 draw lanes at noon EXCEPT tumbleweed + dust devil (no gun).
Vulture's noon lane = its dive line.

## 5 · Decorations (Red: 1 2 4 5 6 7 8 9 10 12 13 14 20) + tiles (Red: 1 2 3 4 5 6 10)

Decor (13): **saloon · clock tower · jail · gallows · water tower ·
hitching post · saguaro cactus · covered wagon · barrel stack (w/ TNT
crate) · church · windmill · water trough · stagecoach.** (Cut: bank,
general store, wanted board, rail-crossing sign, boardwalk set, mine,
boot hill grave.) Plus **THE HORSE** — one hitched horse at the trough
(entrance victim, see §6).

Tiles (7): #1 packed dirt (BASE, main street w/ ruts) · #2 boardwalk
(building aprons) · #3 desert sand (outskirts) · #4 cracked earth (NE
lakebed) · #5 rail bed (east strip) · #6 saloon floor (interior) ·
#10 tumbleweed flats (W band). **The duel circle is an OVERLAY EFFECT**
(noon + boss fight), NOT a tile — Red skipped tile #7.

**PLANNED scene (assets/west_scene_plan.png — composed, never scatter):**
- **MAIN STREET** (N–S spine, edge-to-edge = wraps): rustler/bandit turf.
- **CLOCK TOWER SQUARE** (center) = **DUEL GROUND + boss arena**: open
  dirt, chalk ring overlay at noon; clock tower on its north edge.
- **SALOON** (W of square, saloon-floor interior) faces **JAIL** (E of
  square, iron doors opening ONTO the square) — **GALLOWS** behind jail.
- **CHURCH** north end of street; **WATER TOWER** SW; **WAGON YARD** SE;
  **TROUGH + HITCH ROW + THE HORSE** south of the saloon.
- **RAIL LINE** east strip (wraps N–S) + **STAGE STOP**: Noon Express.
- **TUMBLEWEED FLATS** west band (wind-rolled tumbleweeds).
- **CRACKED EARTH** NE corner; **DESERT RING** stitches all edges
  (rattlesnake/scorpion/vulture/dust devil turf); windmill NW landmark.

## 6 · THE OUTLAW SHERIFF (boss — art FINAL: #2 NIGHT RIDER + WHITE HAT)

**Look (LOCKED, assets/west_boss_final.png):** all-black night-rider rig
— black duster/shirt/pants, iron star, twin irons, RED glowing glare —
under a pristine WHITE HAT (the lie). Parameterized sheriff(put,S,p) in
render_west_boss.js; FINAL params in render_west_boss_final.js.
Title card: **THE OUTLAW SHERIFF**.

**Entrance (LOCKED):** the jail's IRON DOORS blast off their hinges →
he steps through the dust, hat gleaming → title card:
**"THIS TOWN AIN'T BIG ENOUGH FOR THE TWO OF US."** → without looking,
he draws and SHOOTS THE HORSE hitched at the trough (poor thing drops —
pure villainy, no player damage) → the chalk duel circle draws around
the square. (~3s; suites waitForFunction(r.boss && r.scanning).)

**Kit (LOCKED — boss contract: telegraphed ground overlays, no spam):**
*Phase 1 — THE LAW (100→50%):*
- **FAN THE HAMMER** — cone sector paints at player (~0.9s) → 5 shots
  fanned across the cone.
- **RICOCHET** — 2–3 BENT lanes telegraph (bounce off building walls) →
  shots follow the lanes.
- **DYNAMITE DEPUTY** — kicks a TNT bundle: 3 chained warned blast
  circles down the street (~1.2s fuses).
- Dust-trail SLIDE reposition between verbs — never stands still.
- **SIGNATURE — HIGH NOON**: bell tolls, he holsters. Chalk circle
  draws, 3-2-1 chimes, a kill-shot lane TRACKS the player then LOCKS on
  the last chime (~0.5s) → BANG. Sidestep the locked lane → he staggers
  re-holstering — **WINDED, ×1.5 vented (hurtBoss)**.
*Phase 2 — THE OUTLAW (<50%): the WHITE HAT falls off and burns; red
glare doubles:*
- FAN THE HAMMER goes TWIN — alternating left/right cones.
- **POSSE CALL** — one whistle; 3 gang rustlers vault the jail rubble
  (queueSpawn; ONCE per phase, not spam).
- **SIGNATURE — CLOCK STRIKES 13**: arena dims, full EVERYBODY-DRAWS
  lattice: 5–6 telegraphed lanes crisscross the duel ground + his locked
  shot, all fire on the 13th toll → weave the gaps → longest vented
  window of the fight.
≤6 scouter hints (drafted): duck the cone sideways · ricochet lanes
bend — watch the walls · fuses burn for a breath — run past, not away ·
when the bell tolls YOUR feet are the target · move on the LAST chime ·
after the volley he reloads — unload everything.
Every source fromBoss=true. NO radial/stream spam.

## 7 · Music + SFX

**"HIGH NOON HOEDOWN"** (assets/west_theme.wav — **TAKE 1, RED-APPROVED
("its good")**; direction changed mid-session from banked western
whistle to Red's call: **8-BIT BLUEGRASS — crazy banjo + great guitar
solo**): 140 BPM, 105 bars = 180.0s, G major (G–G–C–G / G–G–D–G
hoedown). Chiptune BANJO (thin 0.22-duty pulse, plucky decay, attack
pop) playing forward rolls around the high-G drone string (midi 79);
boom-chick tri bass (root/fifth) + mandolin CHOP on 2+4; clip-clop
intro → TUNE A fiddle-style lead → TUNE B up the neck w/ train brushes
+ distant train whistle → **CRAZY BANJO BREAKDOWN** (double-time
chromatic runs, 32nd flourishes, stop-time bars w/ solo banjo answers) →
stop-time breather → **24-BAR GUITAR SOLO** (0.36-duty pulse, bends,
double stops, vibrato, held-bend climax) → full reprise + low harmony →
KEY-UP (+2) finale w/ layered crazy rolls + train brushes →
shave-and-a-haircut TAG + final G ring-out w/ train whistle. Port via
section-composer — KEEP the banjo roll grid (16ths + drone), boom-chick
+ chop, the stop-time bars, the solo's bends, and the key-up finale.
New SFX: noon bell tolls + freeze sting · lane-fire volley + return-fire
crack · train whistle/rumble (reuse yard) · TNT fuse + boom · rattle
warn · vulture screech · scorpion burrow scrape · dust-devil whoosh ·
tumbleweed pop · fan-the-hammer 5-crack · ricochet twang · duel chimes
3-2-1 · locked-shot BANG · hat-burn flare · posse whistle · horse whinny
(entrance) · iron doors blast.

## 8 · Build order (Opus)

1. art.js: 8 mob draws + THE OUTLAW SHERIFF (final canon; sheriff(put,S,p)
   parameterized) + 13 decor + THE HORSE + 7 tiles (port from
   assets/render/*.js); locomotive/boxcars from world_art.js (dusty
   recolor ok).
2. map.js: realm/biome/8 mob rows/boss/dropTable/console unlock +
   HIGH NOON HOEDOWN composer + SFX + noonCfg { cycleMs, laneCap ~8,
   tollCount, windShift — ALL TUNE } + trainCfg (port yard numbers).
3. scene.js: town layout per scene PNG (street spine, square, buildings
   + boardwalk aprons, rail strip, flats band, cracked NE, desert ring);
   NOON cycle (tolls → freeze+lanes → fire → return fire → wind shift);
   NOON EXPRESS (yard train tech on the east line); wrap everywhere.
4. Boss: doors-blast entrance + line + horse beat, P1/P2 kits per §6,
   HIGH NOON locked-lane signature + vented, CLOCK STRIKES 13 lattice.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m15_west_verify.js
   (routing · noon cycle: freeze/lanes/return-fire/wind · train warn +
   lethality + wrap · 8 mob mechanics incl. tumbleweed wind + devil
   deflect · boss verbs + both signatures + entrance) + FULL battery +
   ?v= bump.

## 9 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

noon.nextAt / tollAt[] / lane[].fireAt / returnAt · train.nextAt /
warnUntil / passUntil · rustler lungeAt · bandit aimAt / shotAt ·
dan lobAt / tnt[].boomAt · snake rattleAt / strikeAt / venomUntil ·
vulture diveAt · tumbleweed (wind vector, no clock) · scorpion
surfaceAt / stingAt · devil wanderAt / patch[].dieAt · boss: nextVerbAt /
fan seq[].at / rico lane[].at / tnt[].boomAt / duel tollAt[] / lockAt /
bangAt / ventedUntil / posseAt / thirteen seq[].at · every
_zoneWarn.until. (Skip Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — roster (8) + kits, decor (13 + the horse),
tiles (7, duel ring = overlay), THE OUTLAW SHERIFF
look/name/entrance/kit, EVERYBODY DRAWS noon cycle, NOON EXPRESS
(yard-tech reuse), scene, theme TAKE 1 approved. Map 9 is build-ready.
