# NEON CITY — map plan (MAP 13 of the campaign)

> Realm 17. Every pick is Red's. Rain-slick cyberpunk rooftops at
> night — neon on black, wet reflections, ads everywhere. Boss pivot
> mid-design (Red): the Apache is the ENTRANCE — it crashes onto the
> helipad and a techno kid hacker steps off. Sheets + finals in
> `assets/` and `artdev/neon/`. Numbers TUNE ME. LOCKED 2026-07-16
> (hacker final "perfect", kit "sounds good", scene "ye", theme
> "great").

## 1 · Theme + name

**NEON CITY** — rooftop sprawl of a rain-soaked megacity: tagged
punk quarter, corporate mirror plaza, holo-ad floors, cable runs
bridging a street canyon, an old cracked quarter — and the Kingpin's
helipad, which becomes a CRASH SITE. Palette anchors: night darks +
neon pink/cyan/green/purple/amber (neon_kit.js `N`). Constant light
rain; puddles reflect the signs.

- Realm id `neon`, biome `neon`, boss `socialEngineer`, music `neon`.
- Toroidal wrap ON (ASPHALT STREET canyon runs W–E edge-to-edge,
  MIRROR PLAZA promenade runs N–S edge-to-edge; cross the canyon on
  the CABLE RUNS + painted crossings).

## 2 · KINGPIN'S PATROL — signature map mechanic (LOCKED, Red's pick)

**Telegraphed helicopter strikes on a cycle.** The Kingpin's second
Apache sweeps the roofs on a patrol cycle (period TUNE ~50–70s):
1. WARN — searchlight sweeps along the patrol path + rotor audio
   swells (generous lead time).
2. STRIKE — telegraphed ground overlays: STRAFE LANES **or** ROCKET
   CIRCLES rake across the marked path (alternate per pass, never
   both).
3. GONE — chopper exits; roofs quiet until next cycle.
The patrol chopper is UNTARGETABLE (scenery-actor, like weather).
During the boss fight below 50% HP the patrol becomes the BOSS'S
BACKUP (see §6). Fresh mechanic — no reuse.

## 3 · Destructibles (global fence rule applies)

- FIRE ESCAPE railings (decor #10) = this map's "fences" —
  destructible with deterioration states (bend → shear → clatter of
  sparks + scrap), per the campaign-wide rule born on Sugar World.
- POP-UP AD walls (boss summon, §6) — destructible holo panels,
  4 deterioration states (flicker → glitch → tear → burst of pixels).
- The Apache WRECK on the pad is permanent scenery/cover (NOT
  destructible — it's the set piece).

## 4 · Roster (NINE — Red picked 1 3 4 5 9 10 14 18 19; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Street Punk** | swarm | packs of 3–5; chain spin-up glint → short warned swing arc |
| **Spy Drone** | flyer | hovers; thin aim-line telegraph → laser along it; pops in one burst |
| **Riot Enforcer** | wall | frontal riot-shield block; warned baton shove; flank or bait the shove |
| **Netrunner** | caster | paints warned GLITCH ZONES on the roof → they detonate; fragile up close |
| **Turret Pod** | anchor | rises from a vent; warned laser LANES in sequence; can't move |
| **Cyber Rats** | cheap swarm | glowing tide pours from dumpsters/vents; individually harmless |
| **Cargo Lifter** | elite spawner | flying crate-hauler; warned drop circles → crates burst into punks (children cap) |
| **Neon Viper** | striker | dash leaves a LIGHT TRAIL that lingers as a hazard line (short life, TUNE) |
| **Exo Loader** | elite | mech suit; warned charge lane → warned slam circle; guards the pad |

## 5 · Decorations (ALL 20 pass) + tiles (Red: 1 2 3 5 7 9 10 + 8)

Decor (20): holo billboard · ramen sign · AC cluster · sat dish ·
water tank · antenna array · vendo-mat · power nexus · vent stack ·
fire escape (DESTRUCTIBLE railings) · drone dock · holo sakura ·
dumpster nest · skylight · spotlight rig · holo mascot cat · tarp
shanty · elevator shed · cell tower · holo koi pool.

Tiles (8): #1 WET ROOFTOP (BASE, one real puddle) · #2 ASPHALT STREET
(the canyon) · #3 MIRROR PLAZA (promenade) · #5 AD FLOOR (holo
chevrons, viper turf) · #7 CRACKED PLAZA (old quarter) · #8 CABLE RUN
(canyon crossings, data pulse) · #9 HELIPAD (bold worn H — boss
arena) · #10 TAGGED SLAB (punk quarter).

**PLANNED scene (assets/neon_scene_plan.png — composed, toroidal):**
TAGGED QUARTER (NW, punks + rats, graffiti glow) · CORP PLAZA (NE,
drones/turrets/enforcers, mirror section + ad floors w/ vipers) ·
MIRROR PROMENADE wrapping N–S · STREET CANYON wrapping W–E (cross at
CABLE RUNS, netrunner turf) · midtown/eastside roofs (lifters drop
crates anywhere) · OLD QUARTER (SW, cracked) · **HELIPAD (SE) = CRASH
SITE boss arena**: skid scar in from the NW corner → smoking Apache
wreck at the pad edge (thrown rotor blade), pop-up-ad spawn spots,
loaders guard the approach. Patrol path snakes across the whole map.

## 6 · SOCIAL ENGINEER (boss — Red's pivot; final art "perfect")

**Look (LOCKED, assets/neon_hacker_final.png):** techno KID hacker —
sheet #6 FIREWALL: orange spike hair, tech vest over drab jacket,
amber AR goggles whose lenses are **BLOODSHOT EYES** (white sclera,
red veins, manic amber iris), cocky grin, cyberdeck in both hands,
chunky LED sneakers, **NO NECK — head sits on the shoulders hulk
style (Red)**. hacker(put,S,p) fully parameterized in
render_neon_hacker.js; FINAL params in render_neon_hacker_final.js.
Title card: **SOCIAL ENGINEER**.

**ENTRANCE (cinematic, Red's design):** on first approach to the
helipad — the Kingpin's Apache streaks in overhead SMOKING, crashes
onto the pad (screen shake), skids a scar across it and slumps at the
pad edge. Beat. The door kicks open and the SOCIAL ENGINEER hops out,
deck in hand. The wreck stays as arena cover for the whole fight.
(Apache art: render_neon_heli_shape.js heli160 — the committed
KINGPIN.EXE final is the crashing/wrecked aircraft, NOT a fought
boss.)

**Kit (LOCKED — boss contract; Red picked SYSTEM BREACH + firewall
drones):**
- **Defense — FIREWALL:** 3 shield drones orbit him projecting a hex
  firewall bubble; he is UNTOUCHABLE while it's up and struts
  cockily. Drones are small-HP targets, respawn on ~8s timer (TUNE).
  Pop them to open his hurtbox.
- **DDOS DARTS** — poke: 3-round burst of slow homing data bolts,
  fully dodgeable.
- **POP-UP ADS** — spawns 3 holo ad panels on the pad as temporary
  WALLS that block player shots; destructible, 4 deterioration
  states (§3).
- **REMOTE ACCESS** — warned circles on two roof vents → hacked
  TURRET PODS rise (map mob reuse) with a red hacked glow.
- **SIGNATURE — SYSTEM BREACH:** deck slam → glitch corruption zones
  telegraph across the floor in a spreading grid pattern → trigger;
  caught = damage + screen-edge glitch FX for a few seconds. Then his
  deck OVERHEATS: drones drop, **vented ×1.5 window (hurtBoss)**
  while he frantically fans it.
- **<50% HP — CALLING IN BACKUP:** the patrol chopper (§2) starts
  targeting the arena on its passes (same telegraphed strafe lanes /
  rocket circles; still untargetable). One extra thing to dodge, not
  a bullet-hell — never overlaps SYSTEM BREACH resolution.
≤6 scouter hints (drafted): pop the drones — he's naked without them ·
the ad walls break, shoot through the hole · breach zones show before
they fire — keep moving · hacked turrets share his glow, they die
with him · deck smoking = HIT HIM NOW · his backup telegraphs, watch
the searchlight.
Every source fromBoss=true. NO burst+radial spam.

## 7 · Music + SFX

**"NIGHT DRIVE.EXE"** (assets/neon_theme.wav — **TAKE 1,
RED-APPROVED ("great")**; Red's pick: SYNTHWAVE NIGHT DRIVE): 116
BPM, 87 bars = 180.0s, A minor (Am–F–C–G). NO SLOW INTRO — kick,
driving octave bass, sidechain-pumping detuned pads AND the lead hook
all from bar 0. Structure: hook A (0–15) → hook B + 16th arps
(16–31) → CHORUS (32–47) → moody bridge on tri lead (48–63) → chorus
+ octave-double shimmer (64–79) → outro hook + final crash-and-ring
on Am (80–86). Port via section-composer — KEEP bar-0 full stack,
the sidechain pump on the pads, the arps, and the tri-lead bridge.
New SFX: rain loop + puddle steps · neon buzz · chain swing · drone
aim-tone + laser · shield clang + baton shove · glitch zone charge +
detonate · turret lane sweep · rat chitter tide · crate drop + burst ·
viper dash + light-trail hum · loader charge + slam · patrol rotor
swell + searchlight ping + strafe/rockets · CRASH cinematic (whine,
impact, skid, metal groan) · boss: deck keys clatter · DDOS dart
zips · ad-wall pop + pixel burst states · turret hack chirp · SYSTEM
BREACH slam + spreading corruption + screen glitch · overheat alarm +
frantic fanning (vent) · firewall drone hum + pop + respawn blip.

## 8 · Build order (Opus)

1. art.js: 9 mob draws + SOCIAL ENGINEER (hacker canon + P2
   "deck smoking" vent frame + drone-fanning pose) + firewall drone
   sprite + heli160 Apache in 3 states (flying/smoking, CRASHING,
   WRECK w/ fire glow) + 20 decor (fire escape = railing break
   states) + 8 tiles + POP-UP AD wall (4 states) + patrol chopper
   silhouette — port from assets/render/*.js.
2. map.js: realm/biome/9 mob rows/boss/dropTable/console unlock +
   NIGHT DRIVE.EXE composer + SFX + patrolCfg { periodMs ~60000,
   warnMs, mode: alternate lanes/circles — TUNE } + adWallCfg +
   droneCfg { count:3, respawnMs ~8000 }.
3. scene.js: layout per scene PNG; canyon = wrap W–E, promenade =
   wrap N–S, cable-run crossings; quarter turfs per §5; helipad
   arena SE w/ wreck cover + skid scar.
4. ENTRANCE cinematic per §6 (crash → kid steps off → title card),
   then boss per §6: firewall bubble gate, 4 verbs, SYSTEM BREACH
   vent ×1.5, <50% patrol backup.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m19_neon_verify.js
   (routing incl. canyon-crossing-only-at-cable-runs + wrap · patrol
   cycle telegraphs + untargetable · mob mechanics incl. lifter
   children cap + viper trail lifetime + turret anchoring · boss:
   drone gate [boss takes 0 dmg while bubble up], ad-wall states,
   breach telegraph→trigger timing, vent window, backup never
   overlaps breach) + FULL battery + ?v= bump.

## 9 · unfreeze() shift list preview (full in BUILD_INSTRUCTIONS)

patrol nextPassAt / warnAt / strike[].at · punk swingAt · drone aimAt
/ fireAt · enforcer shoveAt · netrunner zone[].detonateAt · turret
lane seq[].at · rat wave spawnAt · lifter drop[].landAt · viper
dashAt / trail[].expireAt · loader chargeAt / slamAt · adWall[].
stateAt / expireAt · firewallDrone[].respawnAt · boss: nextVerbAt /
dart[].at / adsAt / hackAt / breachAt / breach zone[].at /
ventedUntil / backup pass clocks · every _zoneWarn.until. (Skip
Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — roster (9), decor (all 20), tiles (8, take-2
sheet), KINGPIN'S PATROL, boss pivot: crash entrance + SOCIAL
ENGINEER (#6 FIREWALL, bloodshot goggles, no neck — "perfect"), kit
(SYSTEM BREACH + firewall drones — "sounds good"), scene ("ye"),
NIGHT DRIVE.EXE take 1 ("great"). Map 13 is build-ready.
