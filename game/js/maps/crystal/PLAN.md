# CRYSTAL CAVERNS — map plan (MAP 6 of the 10-map campaign)

> Realm 10. Every pick is Red's. Sparkle-adventure mood: bright gems on dark
> cave — wonder, not horror. Sheets + finals in `assets/` and
> `artdev/crystal/`. Numbers TUNE ME. LOCKED 2026-07-16.

## 1 · Theme + name

**CRYSTAL CAVERNS** — a vast gem-veined cave system: six carved chambers
joined by tunnels, everything glittering. Palette anchors: purple-grey rock,
gem pink/cyan/purple/amber/green, void-indigo for the deep, gold accents.

- Realm id `crystal`, biome `crystal`, boss `shardlord`, music `crystal`.
- Toroidal wrap ON (via edge tunnels; seam through rock).

## 2 · GROWING CRYSTAL — signature map system (LOCKED package)

Crystal walls live and breathe on a cave cycle:
1. **GATES A–D** (marked tunnel chokepoints on the scene plan): on a clock
   (~14s, TUNE) a gate GROWS SHUT — telegraphed first (floor shimmer along
   the line, rising chime), then crystal wall segments rise and block the
   route (solid wall zone objects).
2. **SHATTER**: each closed gate later SHATTERS open (crack telegraph →
   burst of harmless sparkle + brief damaging shard ring at the wall line,
   telegraphed circle — killMobCredited on mobs).
3. **NEVER ALL SHUT**: at least two gates open at all times — live routes
   change, the cave re-routes you mid-fight, but never traps you.
4. Grown walls use tile #10 CRYSTALLIZED as their floor stain; walls are
   targetable? NO — env only, not entities (grove-init lesson).
No conductor entity; the cave itself drives it (fresh — no fog, no bells).

## 3 · Roster (NINE — Red picked 15 1 4 5 10 6 13 12 20; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Shardling** | swarm filler | cheap skittering chaser; shatters into harmless sparkle on death |
| **Amethyst Lurker** | ambusher | disguised as a crystal cluster; warned shimmer → wake + lunge |
| **Geode Golem** | tank | slow warned-circle slam; exposed core = bonus damage from behind |
| **Shatterbat** | shriek cone | swoops, telegraphed SCREECH CONE that briefly slows |
| **Quartz Ram** | lane charger | warned lane, head down, charges wall-to-wall (wraps!) |
| **Resonator** | zoner | plants, pulses EXPANDING RINGS (hop between; clean circles) |
| **Gemwing Moth** | slow dust flyer | drifts, sheds glitter-dust slow patches (patch pool tech) |
| **Deep Crawler** | pincer melee | burst scuttle, telegraphed double-pincer snip cone |
| **Voidgem Horror** | elite hover | rare elite; short warned void-beam sweeps |

Colored shots = orbShot + tint. Dust/ink = patch pool tech.

## 4 · Decorations (ALL except #11 ✅) + tiles (Red: 2 4 5 6 7 8 9 10)

Decor: gem cluster · crystal pillar · glow mushrooms · stalagmites · glowing
pool · gem vein wall · mine cart · crystal arch · open geode · crystal
flowers · chandelier (ceiling) · gem pedestal · rock rubble · prism shaft ·
lantern post · fossil wall · singing crystals · crystal bridge · void
fissure. (#11 glow-moss prop CUT — moss became floor tile #6 instead.)

Tiles: #2 crystal floor (BASE) · #4 amethyst path · #5 cave water · #6 glow
moss · #7 geode crust · #8 glitter sand · #9 obsidian (boss arena) · #10
crystallized (GROWING CRYSTAL stain).

**PLANNED scene (assets/crystal_scene_plan.png — composed, never scatter):**
- **ENTRY SHELF** (SW, spawn): glitter sand, mine cart + rails, lanterns.
  Rails run to the hall (miners' trail).
- **THE GREAT HALL** (center hub): crystal floor, giant gem cluster,
  pillars, arch. Most tunnels meet here.
- **CRYSTAL GARDEN** (NW): glow moss floor, flowers + mushrooms + singing
  crystals — the sparkle showcase. Moths + resonators live here.
- **GEODE HOLLOW** (W): geode-crust floor, open geodes + rubble + pedestal —
  lurker ambush den.
- **UNDERGROUND LAKE** (SE): water ring with walkable sand rim, crystal
  bridge across, fossil wall + glow pool. Crawlers work the shore.
- **THE DEEP FISSURE** (NE, BOSS ARENA): obsidian floor, void fissures,
  chandelier stalactites overhead (they warn the entrance).
- GATES A–D (growing crystal) sit at tunnel chokepoints; wrap loops exit the
  map edges (S↔N, E↔W).

## 5 · THE SHARDLORD — HEART OF THE MOUNTAIN (boss — art FINAL ✅)

**Look (Red's combo, locked, assets/crystal_boss_final.png):** #4 GEODE
COLOSSUS, RAINBOW EDITION — a HUGE rock hulk (giant proportions, head sat
directly on the shoulders, NO neck), every geode on his body a different gem
color (horns, pauldrons, knees, boots, fists), glowing multicolor fissures
across the chest, RED eyes, the gold crown from work-up #5 — and the
**RAINBOW CORE** exposed in his chest, a five-color faceted gem that CYCLES
HUES in-game. Display BIG (~150+, TUNE) — he's a colossus.

**Entrance (LOCKED — ceiling drop):** stalactite warning circles rain dust
across the obsidian → the chandelier clusters shudder → he CRASHES DOWN
from the cavern dark, landing with a quake ring (telegraphed), rises to
full height, core igniting color by color. Title card:
**THE SHARDLORD — HEART OF THE MOUNTAIN**. (~3s; suites
waitForFunction(r.boss && r.scanning).)

**Kit (LOCKED — the RAINBOW CORE is the telegraph system; core locks a
color, each color = one attack; boss contract throughout):**
- 💗 **PINK — SHARD VOLLEY**: warned circles, crystal shards rain down.
- 💠 **CYAN — CRYSTAL LANCE**: locked lane beams rake the arena.
- 💜 **PURPLE — GROWING WALLS**: ground slam; crystal walls grow along
  warned lines inside the arena (map mechanic weaponized — re-routes you).
- 🧡 **AMBER — QUAKE FISTS**: double fist slam → expanding warned rings
  (hop between).
- 💚 **GREEN — GEODE HATCH**: adds — living geodes crack open, shardlings
  pour out (queueSpawn).
- **SIGNATURE — PRISMATIC OVERLOAD**: core charges through all five colors,
  five colored beam-cones sweep in telegraphed sequence → core burns out
  grey, he is WINDED (rooted, ×1.5 vented window — hurtBoss).
- Enrage at low HP: core cycles faster.
≤6 scouter hints. Every source fromBoss=true. NO radial/stream spam.

## 6 · Music + SFX

**"CAVERN OF WONDERS"** (assets/crystal_theme.wav — package-approved
status): 8-bit SPARKLE ADVENTURE — 88 BPM C major, 66 bars = 180.0s.
Music-box glitter arps (thin-duty chimes + octave ghosts), bouncy
octave bass, snap-clap engine → soaring chorus with low counter-line →
ECHO CAVE break (chime calls, the cave answers with fading echoes) →
octave-up bright verse → grand finale with pads → music-box outro.
Port via section-composer. New SFX: crystal grow rumble + chime · shatter
burst · shardling tinkle-pop · golem slam · ram charge clatter · resonator
ring pulse · bat screech · void beam hum · core color-lock chime ·
stalactite crash (entrance) · overload beam sweeps.

## 7 · Build order (Opus)

1. art.js: 9 mob draws + THE SHARDLORD (final canon, giant, rainbow core
   hue-cycle) + 19 decor + 8 tiles (port from assets/render/*.js;
   shardKnight is parameterized in render_crystal_boss.js).
2. map.js: realm/biome/9 mob rows/boss/dropTable/console unlock + CAVERN OF
   WONDERS composer + SFX + growCfg { periodMs ~14000, warnMs, shatterDmg —
   TUNE }.
3. scene.js: chamber layout per scene PNG (rock walls solid, six chambers,
   tunnels, gates A–D, rails, lake rim + bridge); GROWING CRYSTAL cycle
   (shimmer+chime telegraph → wall rise → later crack → shatter ring);
   wrap via edge tunnels (mirror wrapGraveyard/wrapFactory).
4. Boss: ceiling-drop entrance, color-coded 5-verb kit + PRISMATIC OVERLOAD
   signature + vented window + enrage; core sprite tint cycles hues.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m12_crystal_verify.js
   (routing incl. gates never-all-shut · 9 mob mechanics · grow/shatter
   cycle + env credit · boss verbs + overload + entrance) + FULL battery +
   ?v= bump.

## 8 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

grow.nextAt / warnUntil / shatterAt per gate · lurker wakeAt · golem slamAt ·
bat screechAt · ram chargeAt / lockUntil · resonator nextPulseAt + ring
timers · moth dust patch dieAt · crawler snipAt · horror beamAt / sweepUntil ·
boss: nextColorAt / colorLockUntil / verb timers / overload seq [].at /
ventedUntil / rootUntil · every _zoneWarn.until. (Skip Infinity-parked.)

## 9 · Status

**EVERYTHING LOCKED 2026-07-16** — roster+kits, decor (all but #11), tiles
(2/4/5/6/7/8/9/10), THE SHARDLORD look/name/entrance/kit, GROWING CRYSTAL.
Scene + theme carry package-approved status — tune at playtest.
Map 6 is build-ready.
