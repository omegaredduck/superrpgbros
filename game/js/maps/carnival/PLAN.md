# HAUNTED CARNIVAL — map plan (MAP 7 of the 10-map campaign)

> Realm 11. Every pick is Red's. Creepy-carnival mood: faded big-top color
> under sickly lamplight — cheery things gone wrong, not gore. Sheets +
> finals in `assets/` and `artdev/carnival/`. Numbers TUNE ME.
> LOCKED 2026-07-16 (decor sign-off noted in §4).

## 1 · Theme + name

**HAUNTED CARNIVAL** — a midnight fairground that never closed: the midway
plays on with nobody running it. Palette anchors: faded red + cream canvas,
sickly bulb-glow gold, creep teal + violet, midnight dark.

- Realm id `carnival`, biome `carnival`, boss `ringmaster`, music
  `carnival`. Toroidal wrap ON (seam through the dead-grass outskirts).

## 2 · GAME BOOTHS — signature map system (LOCKED package)

The midway's four game booths light up ONE AT A TIME on a cycle:
1. **STEP RIGHT UP**: a booth's bulbs flicker alive (glow zone + barker-organ
   sting). Enter the glow to start a quick TARGET ROUND — shootable env
   targets pop (milk bottles / dart balloons / striker puck / dunk target).
2. **WIN**: clear the targets in time → PRIZE DROP (coins/heart pickup).
3. **THE BOOTH BITES BACK**: timeout/leave → warned burst at the booth
   mouth (telegraphed circle; killMobCredited on mobs it catches).
4. **NEVER MANDATORY, NEVER TWO AT ONCE**; purely opt-in risk/reward.
No conductor entity; the carnival runs itself (fresh — no bells, fog,
swell, gravity, or crystal-gate reuse). Booth tech doubles as the boss's
STEP RIGHT UP verb.

## 3 · Roster (ELEVEN — Red picked 1 2 3 4 6 12 13 14 16 17 20; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Creepy Clown** | swarm melee | shuffling pack chaser; honk telegraph → lunge |
| **Balloon Wisp** | drifting popper | floats in, telegraphed POP burst (small circle); shootable early |
| **Carny Barker** | herder | warned cane-sweep cone that PUSHES you (steers you into danger) |
| **Possessed Teddy** | ambusher | plays dead as a dropped prize; shimmer warn → springs |
| **Popcorn Poltergeist** | lobber | arcs hot kernels onto warned circles (mortar tech) |
| **Strongman Shade** | slammer | barbell overhead slam — big warned circle + shockwave ring |
| **Cotton Candy Blob** | sticky zoner | pink slow patches (patch pool); splits ONCE on death |
| **Knife Juggler** | ranged | telegraphed 3-knife arc volley (aimed lanes) |
| **Whack-a-Mole** | popper | tunnels between warned holes, erupts under you (erupt tech) |
| **Cymbal Monkey** | stunner | telegraphed CLASH ring — brief slow if caught (ring tech) |
| **Ferris Phantom** | elite | rolls a slow warned lane across the midway; spoke-beam flicks |

Colored shots = orbShot + tint.

## 4 · Decorations + tiles (tiles LOCKED: Red picked 4 + 9)

Decor candidates (20): big top · ticket booth · dead carousel · rusted
ferris · bottle booth · dart wall · high striker · popcorn cart · candy
stand · fortune wagon · hall of mirrors · funhouse mouth · bunting poles ·
string lights · cage wagon · prize wall · dunk tank · sideshow posters ·
calliope organ · tilted teacup. **Decor sign-off: ALL 20, use at will**
(update here if Red trims the list).

Tiles: **#4 FUNHOUSE CHECKER = BASE** — the whole fairground floor is
warped checkerboard (surreal, very haunted-carnival) · **#9 RING MAT =
boss arena** (inside the big top) · dead grass (non-pick ambient) only in
the wrap outskirts past the fence.

**PLANNED scene (assets/carnival_scene_plan.png — composed, never scatter):**
- **SOUTH GATE** (spawn): ticket booth + gate lamps in the fence line.
- **THE MIDWAY** (south→center spine): booths A BOTTLES / B DARTS /
  C STRIKER / D DUNK TANK staggered up the spine with string lights,
  candy stand, popcorn cart, prize wall.
- **RIDE YARD** (west): dead carousel, tilted teacup, rusted ferris,
  ghost-train rails — Ferris Phantom + big mobs roam here.
- **SIDESHOW ALLEY** (east): fortune wagon, cage wagon (bars bent OUT),
  sideshow posters, hall of mirrors, funhouse mouth.
- **THE BIG TOP** (north, BOSS ARENA): striped tent wall, ring-mat floor,
  center spotlight circle, calliope at the back, bunting, the trapeze
  waiting in the dark above.
- Fence rings the fairground; wrap runs through the outskirts.

## 5 · THE RINGMASTER — THE SHOW NEVER ENDS (boss — art FINAL: #1 THE CLASSIC)

**Look (LOCKED, assets/carnival_boss_final.png):** red tailcoat with gold
trim + epaulettes, cream shirt front, black jodhpurs + boots, TOP HAT,
waxed mustache, glowing eyes, white gloves, coiled WHIP; a gold spotlight
ring pools under him wherever he stands.

**Entrance (LOCKED — trapeze descent):** the ring mat's spotlight snaps on
EMPTY → calliope swells → he swings down out of the tent dark on a trapeze,
dismounts with a flourish and a bow, whip-CRACK. Title card:
**THE RINGMASTER — THE SHOW NEVER ENDS**. (~3s; suites
waitForFunction(r.boss && r.scanning).)

**Kit (LOCKED — boss contract: telegraphed ground overlays, no spam):**
- **WHIP CRACK** — locked cone flash → crack (damage + knockback).
- **SPOTLIGHT LOCK** — a second spotlight chases you; when it locks
  (circle fills) a STAGE LIGHT crashes down on it.
- **SEND IN THE CLOWNS** — adds: clowns + a juggler swing in (queueSpawn).
- **KNIFE CURTAIN** — warned lanes of thrown knives march across the ring
  in sequence.
- **STEP RIGHT UP** — he forces a game: safe RINGS appear on the mat;
  everything outside them gets raked (booth tech weaponized; always
  reachable, wrap-aware).
- **SIGNATURE — THE GRAND FINALE**: the calliope swells; fireworks rain on
  warned circles in sequence... then he BOWS — WINDED (rooted, ×1.5 vented
  window — hurtBoss).
- Enrage at low HP: the calliope speeds up — all cycles tighten.
≤6 scouter hints. Every source fromBoss=true. NO radial/stream spam.

## 6 · Music + SFX

**"THE LAST SHOW"** (assets/carnival_theme.wav — package-approved status):
8-BIT CREEPY CALLIOPE — TRUE 3/4, 132 BPM, 132 bars = 180.0s. D-minor
circus waltz: breathy detuned steam-pipe lead over an oom-pah-pah engine,
forced-cheery F-major chorus bells → TAPE-WARP slumps (the whole band bends
flat) → music-box break that skips like it's winding down → mad giggles →
octave-up grand finale → power-cut ending (flat wheeze + a thump in the
sawdust). Port via section-composer (keep the warp bends!). New SFX: booth
bulbs flicker-on sting · target pop · prize fanfare · booth bite burst ·
whip crack · spotlight hum + lock · stage-light crash · knife whish ·
firework scream + burst · trapeze creak · calliope swell · clown honk ·
cymbal clash · balloon pop.

## 7 · Build order (Opus)

1. art.js: 11 mob draws + THE RINGMASTER (final canon; ringmaster(put,S,o)
   parameterized in render_carnival_boss.js) + trapeze rig sprite + decor
   set + tiles #4 (base, warped) + #9 ring mat + dead grass ambient.
2. map.js: realm/biome/11 mob rows/boss/dropTable/console unlock + THE LAST
   SHOW composer + SFX + boothCfg { cycleMs, roundMs, targetsN, prize —
   ALL TUNE }.
3. scene.js: fairground per scene PNG (fence, gate spawn, midway booths
   A–D, ride yard, sideshow alley, big top walls + flap); GAME BOOTHS cycle
   (glow → opt-in round → prize/bite); wrap through outskirts.
4. Boss: trapeze entrance, 6-verb kit (STEP RIGHT UP reuses booth tech),
   GRAND FINALE + vented window, calliope-speed enrage.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m13_carnival_verify.js
   (routing · booth round win/bite + env credit · 11 mob mechanics · boss
   verbs + finale + entrance) + FULL battery + ?v= bump.

## 8 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

booth.nextAt / roundEndsAt / biteAt / target[].popAt · clown honkAt ·
wisp popAt · barker sweepAt · teddy wakeAt · poltergeist lob[].at · shade
slamAt · blob patch dieAt · juggler volleyAt / knife[].at · mole holeAt /
eruptAt · monkey clashAt / ringUntil · phantom laneAt / rollUntil · boss:
nextVerbAt / spotlight lockAt / clowns nextAt / curtain[].at / game
ringsUntil / finale[].at / ventedUntil / rootUntil · every _zoneWarn.until.

## 9 · Status

**LOCKED 2026-07-16** — roster (11) + kits, tiles (#4 base + #9 arena),
THE RINGMASTER look/name/entrance/kit, GAME BOOTHS, scene, theme.
Decor: all-20-use-at-will pending Red's final word (§4).
Map 7 is build-ready.
