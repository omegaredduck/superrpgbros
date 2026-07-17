# STORM SKY ISLES — map plan (MAP 1 of the 10-map campaign)

> Realm 5. Every pick below is Red's (numbered sheets + question rounds, same
> process as GROVE/GRAVEYARD/MAP4). Sheets + finals in `assets/` and
> `artdev/skyisles/`. All numbers TUNE ME. Design locked 2026-07-15 except
> where marked PENDING.

## 1 · Theme + name

**STORM SKY ISLES** — floating islands in an endless thunderstorm. Epic wind-
and-lightning adventure: turf-topped isles, marble ruins, rope bridges, a mist
sea below, a living storm for a boss. Palette anchors: cloud whites/greys,
storm indigo `#4a4f86`, volt yellow `#ffe95a` family, sky blue `#7fd4ff`,
turf green, marble cream.

- Realm id `skyisles`, biome `skyisles`, boss `nimbustalon`, music `skyisles`.
- Toroidal wrap ON (Master List 14). Islands are CONNECTED (Red) — bridges and
  land necks; no fall-off-the-edge mechanic.
- The SEA between islands = **MIST VEIL** (Red's pick, sea sheet #4): pale
  layered fog. Walkable but SLOWS you (dense air) — mobs that FLOAT (Cloud Ray)
  cross it at full speed. Mist visually drifts (slow scroll/shimmer).

## 2 · Roster (8 — Red picked 2 4 8 9 11 15 16 19; kits APPROVED)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Storm Sprite** | fast swarm | cheap chaser; cosmetic spark pop on death |
| **Cloud Ray** | drifting flyer | floats OVER walls/mist; near the player it marks a small circle → mini lightning strike (herald/mortar tech, map-scale small) |
| **Griffin Cub** | melee bruiser | short telegraphed pounce (ghoul tech) |
| **Nimbus Golem** | tank | heavy HP; contact SHOVES the player back (knockback) |
| **Wind Warden** | shield guard | wind shield on nearby mobs (bulwark guardAura tech) — priority kill |
| **Stormvane** | rooted turret | spd 0; radial static rings, volt-tinted (seedling-turret tech) |
| **Rain Shepherd** | healer | rain cloud mends nearby mobs (repairUnit mend tech) — priority kill |
| **Roc Hatchling** | dive burster | waddles → hops airborne → BELLY-FLOPS onto a telegraphed circle (zone-blast tech) |

Colored shots = orbShot + tint (volt yellow statics, sky-blue gusts).

## 3 · Decorations (19 of 20 — Red CUT #20 observatory)

Keepers: rope bridge · cloud bank · ruined column · temple arch · windmill ·
storm lantern · lightning rod · wind chimes · tattered banner · sky balloon ·
airship wreck · sky dock · wind god statue · storm crystal · roc nest · signal
bell · supply drop · floating shard · sky shrine.

**PLANNED scene (assets/sky_scene_plan.png — composed, never scattered):**
- **SPAWN ISLE** (south): you arrive at the SKY DOCK hanging off the rim;
  signal bell + supply crates; ruined columns flank the path mouth.
- **Lantern-lit cobble path** spawn → THE CROSSWINDS → forks to both flanks;
  storm lanterns at every bend (grove/graveyard trail precedent).
- **THE CROSSWINDS** (center): wind god statue landmark ringed by storm
  crystals + wind chimes. All bridges radiate from here.
- **WINDMILL FARM** (west, big turf isle): animated windmill, banners, chimes.
- **TEMPLE RUINS** (east, marble-floor isle): temple arch gate at the bridge
  mouth, colonnade rows, sky shrine + storm crystal, storm-mosaic accents.
- **THE CRASH SITE** (NW, stone isle): airship-wreck set piece, spilled supply
  drops, tattered banners.
- **BALLOON DOCK** (NE): anchored sky balloon bobbing over a dock + crates +
  its own signal bell.
- **THE ROOST** (north, boss arena): STORMGLASS floor, giant ROC NEST at
  center (the boss foreshadow), 4 LIGHTNING RODS at the corners (arena
  furniture — strikes ground on them), storm crystals on the rim.
- Small FLOATING SHARDS hover in the mist lanes; CLOUD BANKS drift through
  (soft cover that conceals whoever stands inside — mist tech).
- 7 islands + shards, all connected by ROPE BRIDGES; wrap seam runs through
  open mist so the toroidal jump never lands you inside an island.

Tiles (Red): #1 SKYSTONE FLAGS main floor · #2 ISLAND TURF grass · #5 COBBLE
PATH trails · #3 TEMPLE MARBLE ruins · sea = MIST VEIL · #10 STORMGLASS arena.

## 4 · THE TEMPEST CYCLE v2 — signature map system (LOCKED — Red approved;
##     v1's mist surge + signal bells were CUT: concealment overused, no bells)

1. **WIND SHIFT** (ambient): a gale blows across the map on a clock; direction
   rotates each shift. Pushes player AND ground mobs (conveyor-push tech,
   field-wide, gentle). Telegraph: wind streaks + every wind chime rings.
2. **ROAMING STRIKES** (hazard): warned volt circles crackle on the ground →
   lightning slams down (damage; hits mobs too → killMobCredited). Strikes
   CLUSTER near lightning rods + Stormvanes — standing away from the metal
   is the lesson.
3. **UPDRAFT VENTS** (hazard): swirling vortex circles telegraph on the
   ground, then ERUPT — anything standing there is tossed airborne + shoved
   (damage; mobs too → killMobCredited). They vent along island edges; the
   map breathes.
4. **THE STORM EYE** (conductor): a huge dark swirling storm-eye SHADOW
   drifts slowly and VISIBLY across the map. Wherever it hovers: strikes
   cluster under it, the wind pulls toward it, vents erupt in its wake. The
   sky itself is the conductor — you see danger coming and route around it.
   During the boss the ambient cycle stands down; the eye parks over the
   Roost and the storm belongs to HIM.

## 5 · NIMBUS TALON — LORD OF THE STORMS (boss — art FINAL: assets/sky_boss_final.png)

**Look (Red-approved, 2 revisions):** a living storm-cloud thunderbird —
lightning skeleton blazing INSIDE the cloud body (spine bolt, wing-bone bolts,
rib arcs), volt-lantern eyes, rain sheeting under the belly, solid gold talons
each clutching a live bolt. NO lightning leaves the bird's silhouette (Red).
Display large (Gravekeeper-class, ~160).

**Entrance (Red's pick — GROWING SHADOW):** at the Roost, a cloud shadow
slides under the player and GROWS as the arena darkens; rumble + rain starts;
then the boss ERUPTS DOWNWARD out of the black sky into the nest — wing-blast
shockwave (cosmetic), title card. (~3s; suites waitForFunction(r.boss &&
r.scanning).)

**Kit (boss contract: everything telegraphed w/ ground overlays, ZERO
projectile spam — Factory-phase-2 design language, storm-themed):**
- **SKYFALL BARRAGE** — 4–5 warned volt circles around/under the player →
  lightning slams (scrapLob/zoneBlast tech).
- **GALE SHOVE** — direction locks, wind wedge glows → field-wide gust pushes
  everyone along it (exhaustCone + conveyorOverride tech; ride it or brace).
- **ISLAND-DROP SLAM** — checkerboard sectors of the arena flash in two
  alternating waves → wing-slam shockwaves blow each wave (floorStamp tech;
  stand on the other wave's tiles).
- **DIVE LANE** — he rises off-screen, a lane FLASHES across the arena →
  he strafes down it talons-first (drillCharge tech).
- **ROD OVERLOAD (signature)** — all 4 lightning rods charge w/ growing fuse
  rings; he funnels the storm into them → each rod blasts a radius-circle in
  sequence; the safe pocket rotates. Afterward he VENTS (rooted, takes ×1.5
  damage — reactorPurge/vented tech re-themed).
- **STORM-ELEMENTAL ADDS** — summons Storm Sprites + a Stormvane mid-fight
  (queueSpawn; Red approved adds).
- Overclock-style enrage at low HP (spd/rate up). ≤6 scouter hints.

## 6 · Music + SFX

**"SKYBREAKER MARCH"** (assets/sky_theme.wav — ✅ APPROVED by Red):
8-bit AIRSHIP BATTLE MARCH — 140 BPM, D minor (Dm–Bb–F–A7), exactly 180.0s.
Propeller-churn low pulse under everything, bass-drum 1&3 + field-snare
cadence w/ rolls, brassy duty-0.30 chip leads, bugle-call intro/reprise, wind
arps, storm-break bridge, double climax w/ descant. Port via the map's own
section-composer (equal-beat tracks) in map.js.
New SFX: wind-shift whoosh · chime ring · strike crack · vent eruption
whoosh · storm-eye rumble (low loop while near) · dive screech ·
rod-overload hum.

## 7 · Build order (Opus, after the registry refactor)

1. art.js: 8 mob draws + NIMBUS TALON + 19 decor + 5 tiles + mist veil (port
   from assets/render/*.js — the picked options only), `<name>Hi` registration,
   MOB_DISPLAY sizes.
2. map.js: realm/biome/mob rows/boss def/dropTable/console unlock + the
   SKYBREAKER MARCH composer + SFX.
3. scene.js: island PLAN layout (fraction coords, scene-plan PNG is canon) —
   islands/bridges/mist bodies/path/decor placements; mist slow-zone (float
   mobs exempt); wrap (open-mist seam); cloud-bank concealment.
4. Tempest Cycle v2 (each testable alone): wind shift → roaming strikes →
   updraft vents → the storm eye conductor.
5. Boss: growing-shadow entrance, the 6-verb kit, adds, vent window, enrage.
6. Bestiary + scouter TEXT-FIT (≤6 hints); suites (m7_skyisles_verify.js:
   routing · 8 mob mechanics · cycle clocks through unfreeze · mist slow ·
   wrap · boss verbs + entrance) + FULL battery + ?v= bump.

## 8 · Status

**EVERYTHING LOCKED 2026-07-15** — scene plan approved, SKYBREAKER MARCH
approved, Tempest Cycle v2 approved (v1 mist surge + bells cut by Red).
Map 1 is build-ready.
