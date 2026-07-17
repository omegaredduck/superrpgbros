# LUNAR STATION — map plan (MAP 4 of the 10-map campaign)

> Realm 8. Every pick is Red's (sheets + question rounds; Map-4 bundle
> approved 2026-07-16 incl. auto-approved scene/theme status — tune at
> playtest). Sheets + finals in `assets/` and `artdev/lunar/`. Numbers TUNE ME.

## 1 · Theme + name

**LUNAR STATION** — a derelict moon base, half research station, half
something's nest now. Zero-G wonder with teeth: pristine white modules, grey
regolith and craters outside, a violet-green infestation spreading from the
hive wing. Palette anchors: hull white `#e2e6ee`, regolith greys, holo cyan
`#4adcf0`, xeno green `#5fd668`/acid, void purple `#8a5fd6`, warning orange.

- Realm id `lunar`, biome `lunar`, boss `specimenzero`, music `lunar`.
- Toroidal wrap ON.

## 2 · LOW GRAVITY — signature map system (LOCKED, Red's pick)

The whole realm plays FLOATY:
1. **DRIFT PHYSICS**: every knockback/shove/toss travels ~2× farther and
   hangs longer — player AND mobs (a global knockback multiplier + reduced
   damping; TUNE). Dodges carry extra glide.
2. **JUMP PADS** (decor #19): glowing chevron pads LAUNCH you in a readable
   arc across craters/gaps — the fast routes between surface zones (airborne
   = untargetable by contact, still hit by zones; short cooldown).
3. **DUST PUFFS**: every step/landing on regolith kicks a floating dust puff
   (cosmetic, sells the gravity).
4. Mobs that fly/float are unaffected; heavy mobs land with dust slams.
No conductor entity — gravity IS the always-on system (fresh: no cycle
clock to stand down except jump-pad cooldowns).

## 3 · Roster (NINE — Red kept all 9 picks: 4 7 8 9 10 11 12 18 20; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Grey Watcher** | aimed caster | telekinetic psi-bolts (aimed) |
| **Brood Sac** | spawner | dormant until you approach → hatches SCUTTLER waves (kill it early; scuttlers = cheap swarm minis via queueSpawn) |
| **Sentry Drone** | flyer | strafing aimed laser bursts |
| **Haywire Turret** | rooted | sweeping telegraphed beam arcs |
| **Astro-Revenant** | drifter | floats over walls; grab = brief hold + damage |
| **Magnetron** | puller | constant pull toward it (fight the drag — brutal in low-grav) |
| **Luna Leaper** | arc lander | sails in low-grav arcs onto marked landing circles |
| **Orbital Mine** | kamikaze | drifts at you, beeps, telegraphed blast radius; SHOOTABLE (pops early — near mobs it kills THEM, credited) |
| **Star Horror** | elite | tentacle sweep cones |

Colored shots = orbShot + tint (cyan psi, red lasers, acid globs n/a).

## 4 · Decorations (ALL 20 ✅) + tiles (✅ my spread)

Decor: lander · rover · flag · cryo pods (one open) · command console · holo
table · cargo stack · O2 rack · solar array · comms dish · airlock · alert
beacon (animated) · hydroponics · hive resin · crashed probe · impact crater ·
moon rocks · lab bench · **JUMP PAD** (mechanic prop) · **REACTOR CORE**
(arena centerpiece).

Tiles: #1 regolith (surface) · #2 hull deck (modules) · #3 deck grate
(corridors) · #5 hive floor (infested wing) · #8 warning deck (airlock rings +
pad edges) · #10 reactor plate (boss arena).

**PLANNED scene (assets/lunar_scene_plan.png — composed, never scatter):**
- **LANDING PAD** (south, spawn): the LANDER + rover + flag + beacon on a
  warning-ringed hull circle.
- Grate corridors w/ AIRLOCK doors + beacons link the modules; the spine
  runs pad → HUB → LABS → REACTOR.
- **THE HUB** (center, hull deck): consoles, HOLO TABLE, cargo, O2 rack.
- **THE LABS** (north, lab tile): cryo pod row (ONE OPEN — story), lab
  benches (one broken jar), hydroponics beds going alien.
- **HIVE WING** (east, hive floor): resin masses, glowing pustules, "brood
  ground zero" — the dark zone; brood sacs live here.
- **SOLAR FIELD** (west): panel field, COMMS DISH, crashed probe.
- **CRATER BELT** (south/corners): craters + moon rocks; **JUMP PADS** arc
  you across. Wrap seam crosses open regolith.
- **REACTOR ARENA** (NE, boss): circular reactor-plate arena, REACTOR CORE
  at center, 4 alert beacons on the ring, hazard-striped rim.

## 5 · SPECIMEN ZERO — THE OVERMIND (boss — art FINAL: assets/lunar_boss_final.png)

**Look (Red pick, boss sheet #2, refined):** a vast grafted brain in a
cracked containment tank, floating on its own telekinesis; violet lidless
eye wired into the fluid; cable-tentacles torn from the floor dangle and
spark; debris orbits it; the crack weeps.

**Entrance (LOCKED — LIGHTS OUT):** the reactor arena POWERS DOWN to black;
beat… the violet EYE ignites in the darkness; emergency lights stutter on
one by one — it was already there, hovering over the core. Title card
SPECIMEN ZERO · THE OVERMIND. (~3s; suites waitForFunction(r.boss && r.scanning).)

**Kit (psychic zone-caster; boss contract — ground overlays, ZERO
projectile spam; slow hover drift toward you + cable-drag repositions):**
- **TK BARRAGE** — orbiting debris lifts; 4–5 warned circles track/lock →
  wreckage slams down.
- **MIND LASH** — a cone LOCKS + glows → psychic shockwave sweep.
- **GRAVITY WELL** — a big warned circle blooms at your position → becomes a
  crush zone that PULLS inward for 3s (fight the drag — low-grav makes it
  scary); then pops.
- **CABLE SWEEP** — its floor cables whip along telegraphed arc lanes
  (close-range punish).
- **PSYCHIC SCREAM** — expanding fuse ring from the tank — outrun it.
- **CONTAINMENT PURGE (signature)** — it overdrives the reactor: arena
  sectors flash + vent scalding steam in sequence (rotating safe pocket);
  afterward the tank glass FRACTURES wider — VENTED: rooted, ×1.5 damage.
- **BROOD CALL** adds — hatches Scuttler waves via queueSpawn; enrage at low
  HP (eye blazes, cadence up).
≤6 scouter hints. Every source fromBoss=true.

## 6 · Music + SFX

**"SEA OF TRANQUILITY"** (assets/lunar_theme.wav — auto-approved status,
tune at playtest): 8-bit ZERO-G WONDER — 72 BPM, 54 bars = 180.0s. Drifting
Lydian pads, shimmering starlight arps, glass-bell melody, a first shadow…
then THE MENACE: detuned drones, a tritone, alien clicks in the vents, a
heartbeat — and an uneasy return where one note stays wrong. Ends on a
ringing bell and a single click. Port via the map's section-composer.
New SFX: jump-pad launch · low-grav landing thump · airlock hiss · psi-bolt
warble · mine beep-beep-BOOM · scream ring · purge vent blast · lights-out
power-down + eye ignition sting.

## 7 · Build order (Opus)

1. art.js: 9 mob draws + scuttler mini + SPECIMEN ZERO (final canon) + 20
   decor + 6 tiles (port from assets/render/*.js).
2. map.js: realm/biome/9 mob rows + scuttler/boss/dropTable/console unlock +
   SEA OF TRANQUILITY composer + SFX + lowGrav cfg { kbMult ~2, damping,
   padArc — TUNE }.
3. scene.js: PLAN layout per scene PNG; module walls; low-grav physics hooks
   (knockback mult + dodge glide + dust); jump pads (arc launch, airborne
   state); wrap.
4. Boss: lights-out entrance, 6-verb kit, brood adds, purge + vented, enrage.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m10_lunar_verify.js
   (routing · 9 mob mechanics incl. mine env-kill credit + sac hatching ·
   low-grav knockback mult · jump pad arc · boss verbs + entrance) + FULL
   battery + ?v= bump.

## 8 · Status

**EVERYTHING LOCKED 2026-07-16** (Map-4 bundle + Specimen Zero + lights-out).
Scene + theme carry auto-approved status per Red — tune at playtest.
Map 4 is build-ready.
