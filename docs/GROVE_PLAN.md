# THE GROVE — map plan (SHIPPED 2026-07-15, ?v=m5a — kept for the record)

> Design doc for the game's second realm. **BUILT — see EVENT_LOG 2026-07-15
> and MILESTONES M5.0 for what actually shipped.** Final picks diverged from
> the draft in the best way (Red reshaped live): roster = #2 7 8 9 14 15 20
> + a BLUE pixie (Bloom Pixie, resurrection kit) · Puffcap = splitter ·
> Bumblebrute = ward-immortal · Moonmoth = fast squishy · plants shoot
> colored orbs · boss GROWS OUT OF THE GROUND + PHASE TWO pixie resurrection
> · realm name THE GROVE · 14 decor picks + treeline-walled PLANNED layout ·
> "HEARTWOOD" 3:00 8-bit theme. Original draft below, unedited.

---

## 1 · Theme — the lush enchanted forest

Danger hiding inside beauty. Golden light dapples through a giant canopy;
bioluminescent mushrooms pulse at the path edges; fireflies and drifting
pollen everywhere. The grove doesn't look haunted — it looks *inviting*,
and everything in it wants you composted.

Working names (pick one, or write your own):
- **A. THE ELDERGLOW GROVE** (sub: "the Grovekeeper tends his garden")
- **B. HEARTWOOD HOLLOW** (sub: "every path leads to the old tree")
- **C. THE WHISPERWOOD** (sub: "the trees talk about you")

Palette anchors (matches existing P palette + new G accents): canopy greens
(`#38b764` family), warm bark browns, glow-cyan (`#6ff0e0`), honey gold
(`#ffcd75`), mushroom red/cream, pixie pink, moonlight pale.

Console wiring: flip `sealed1` → `{ id:'grove', name:'THE ELDERGLOW GROVE',
sub:'…', locked:false }`; realm cfg gets `biome:'grove'`, `boss:'grovekeeper'`.
Map itself is builder-painted (150×150, grasslands tileset + new grove decor
tiles: giant mushroom, ancient trunk wall, glow-flower, lily pond).

## 2 · Signature map hazard — FALLING ANCIENT TREES

The grove's answer to the yard's ambush trains. Same skeleton (telegraph →
lane sweep → mow credit) but with a twist the trains don't have: **the
fallen trunk STAYS as a wall**, reshaping the battlefield.

Beats:
1. **GROAN** — a deep wood-creak sound (new SFX `creak`) + a long shadow
   strip fades in across a lane near the player (any of 8 directions, like
   train lanes but free-angle or axis-aligned — builder's call at impl).
2. **TIMBER** — the trunk slams down along the strip: leaf-burst particles,
   dust ring, 150ms shake (mole-blast precedent). Anything under it is
   crushed — mobs die **credited** (route through `killMobCredited`, the
   m4s train-mow rule), player takes heavy damage (`crushDmg`, survivable
   with gear — this is a dodge check, not a boss one-shot).
3. **DEADFALL** — the trunk lies there as a physics wall for `trunkLifeMs`
   (~8s), then crumbles into moss + fades. Use it: mobs path around it,
   you can put it between yourself and a pack.

Data sketch (all TUNE ME):
```js
grove: { treeFall: { everyMinMs: 12000, everyMaxMs: 20000, warnMs: 1600,
                     crushDmg: 55, laneWidth: 52, trunkLifeMs: 8000 } }
```

Engine notes (the gotcha list already covers these):
- warn/fall/crumble clocks are ABSOLUTE → **unfreeze() shift list**.
- The falling animation is a manual mover → gate on `!hitstopActive`.
- Boss arena: ambient falls STOP while the Grovekeeper lives — TIMBER
  becomes *his* verb (same gating idea as `arrivalTrain` for ambush trains).

## 3 · Ambient animation (the "living grove" pass)

The yard got m4.9's living pass; the grove ships with one:
- **Dappled canopy light** — slow-drifting soft light blobs over the ground
  (additive overlay, depth under mobs).
- **Fireflies** — tiny warm motes wandering; denser near ponds at the
  path edges.
- **Pollen / petal drift** — a sparse diagonal fall, like slow snow.
- **Glowshrooms** — decor mushrooms pulse their glow on a slow sine.
- **Butterflies** — 2–3 at a time, flutter between flower decor tiles.
- **Reed sway** — pond-edge reeds and tall grass rock gently.

All presentation-only (no sim state), so they live scene-side and cost
nothing to save/replay.

## 4 · Mob roster — 20 candidates, pick ≥8

Numbered grid: `artdev/grove_mob_options.png` (regenerate with
`node artdev/render_grove_mobs.js out.png`). Mechanics reuse proven tech
where noted. Answer by number or name.

| # | Name | Role | Mechanic |
|---|------|------|----------|
| 1 | **Thornling** | basic chaser | The grove's Coal Golem — cheap bramble-ball swarm filler. |
| 2 | **Puffcap Waddler** | chaser + death burst | Round mushroom toddler; ON DEATH pops a spore cloud that DoTs anyone standing in it (slime-patch tech, one-shot). |
| 3 | **Glimmer Wisp** | shooter | Living firefly light; drifts, fires slow HOMING motes (first homing projectile). |
| 4 | **Bramble Boar** | tank + line charge | Paws the ground, eyes flash, then CHARGES in a straight line (telegraphed dash — new mob verb). |
| 5 | **Honeydew Sprite** | kiter + slow puddles | FLEES you, dripping honey puddles that SLOW the player (slime-patch tech, slow instead of damage). Kill it before the floor turns to glue. |
| 6 | **Rootmaw** | ambusher | Submerged root-jaws; surfaces UNDER you with a warn ring, SNAPs an AoE bite, re-burrows (mole tech, melee remix). |
| 7 | **Pixie Trickster** | blink shooter | Giggling pixie; BLINKS (teleports) to a new spot around you between shot fans. |
| 8 | **Moss Golem** | regen tank | Huge mossy boulder; REGENERATES HP unless hit recently — commit to it or it heals back (dodge-regen tech, inverted). |
| 9 | **Seedling Turret** | stationary turret | Rooted snap-plant; radial seed bursts on a clock. Area denial you must walk over to kill. |
| 10 | **Lantern Jack** | aura (pull) | Will-o'-wisp with its own lantern; gently DRAGS you toward it while in range (gravity-well aura — dangerous next to anything else). |
| 11 | **Dryad Archer** | precision shooter | Bark-skinned archer; 3-round bursts of PIERCING thorn arrows (they go through you — don't line up with allies of hers). |
| 12 | **Spore Shambler** | elite trail | Big moss-caked shambler (disp ~60, elite like Conductor Zombie); contact INFECTS: spore DoT ~3s (burn tech re-aimed at the player). |
| 13 | **Thorn Falcon** | dive bomber | Circles fast, then STRAFING-DIVES across the screen; briefly perches (vulnerable) between passes. |
| 14 | **Snapdragon** | anchored lunger | Dragon-headed flower; rooted, but the head LUNGES far on its vine — a long-reach telegraphed whip. |
| 15 | **Bumblebrute** | tank + mines | Armored giant bumblebee; lumbers and drops STINGER MINES behind it that pop on touch (small AoE). |
| 16 | **Acorn Knight** | shielded | Acorn in an oak-cap helm; front SHIELD blocks your shots head-on — flank it or knock it around (first directional defense). |
| 17 | **Wicker Wolf** | pack + buffer | Woven-twig wolf, always spawns in packs of 3; HOWLS to briefly speed every nearby mob. |
| 18 | **Elder Sprout** | summoner | Wizened little tree-sage; periodically SPROUTS a fresh Thornling from the dirt (capped — kill the gardener first). |
| 19 | **Dewdrop Slime** | splitter | Crystal-clear slime; SPLITS into two half-size dewdrops on death (kill it twice more). |
| 20 | **Moonmoth** | phaser | Pale glowing moth; PHASE-SHIMMERS on a rhythm — intangible (shots pass through) then solid (fog-conceal tech, solo, timed). |

Roster-building guide (if it helps the pick): a biome wants ~2 cheap
chasers, ~2 shooters, 1–2 tanks, and 2–3 "mechanic" mobs that force
different movement. The yard's spread was: golem/brute/chomper (chase),
creep/imp (shoot), zombie/mole/serpent (mechanics).

## 5 · THE GROVEKEEPER — themed mechanics (the Conductor treatment)

Currently he's a plain radial+stream boss ("Guardian of the Grasslands").
Rework: keep his two data patterns as reflavored filler, add scene-owned
GROVE VERBS dispatched from `updateBoss` (exact Conductor architecture:
`DATA.bosses.grovekeeper.patterns`, all clocks on the unfreeze shift list,
`onBossDown → clearGrovekeeperFx`).

**Arrival — THE HEARTWOOD WAKES.** The arena is a clearing around one
colossal ancient tree. On entry the camera pans to it: leaves storm off,
birds scatter (particle burst), the trunk SPLITS and the Grovekeeper
unfolds out of the heartwood, steps down, and the trunk grinds shut.
(≈3s like the Styx arrival; ambient tree-falls gated while he lives;
suites still `waitForFunction(r.boss && r.scanning)`.)

Verbs:
1. **TIMBER CALL** — his ghost train. He raises both arms; a lane shadow +
   groan telegraph, then an ANCIENT TREE crashes across the arena. Extreme
   damage — one-shots the ungeared (HP/DEF gear + potions survive, exactly
   the ghost-express rule). The trunk LINGERS ~6s as a wall he'll happily
   pin you against. Reuses the map hazard tech wholesale.
2. **THORN MORTAR** — his railroad ties. Lobs seed pods onto marked ground
   circles; each bursts for AoE and leaves a BRIER PATCH that ticks damage
   for ~3s (marked-circle tech + slime-patch tech, combined).
3. **OVERGROWTH** — his pocket-watch schedule. Vines erupt and grip your
   ankles: `slowUntil/slowMult` window, green tendril VFX at your feet.
   Pre-position before you're rooted slow.
4. **SUNLANCE** — his lantern sweep. The canopy parts and a golden sunbeam
   sweeps a slow arc across the clearing; standing in the light ticks
   damage. Rotate around him, stay in the shade.
5. **SAPLING SURGE** *(optional 5th — say keep or cut)* — he stomps; a ring
   of Thornlings sprouts around the player (uses the biome roster, capped;
   pressure spike mid-fight).

Reflavored data patterns (names/VFX only, mechanics unchanged):
- radial → **PETAL BURST** — 24 razor petals in a full ring.
- stream → **NEEDLE VOLLEY** — 7 re-aimed thorn needles.

Data sketch (all TUNE ME, mirrors the Conductor's shape):
```js
patterns: {
  timber:   { everyMs: 11000, warnMs: 1600, crushDmg: 200, laneWidth: 56, trunkLifeMs: 6000 },
  mortar:   { everyMs: 6000, count: 3, warnMs: 950, flightMs: 650, radius: 52,
              dmg: 24, scatter: 150, brier: { lifeMs: 3000, dmg: 5, tickMs: 480 } },
  overgrowth:{ everyMs: 13000, durMs: 2400, slowMult: 0.55 },
  sunlance: { everyMs: 9500, durMs: 2600, degPerSec: 90, length: 430, halfDeg: 10, tickMs: 220, dmg: 13 },
  radial:   { …existing, reflavored PETAL BURST… },
  stream:   { …existing, reflavored NEEDLE VOLLEY… }
}
```

New scouter hints (one per verb, Conductor style):
- "TIMBER — a shadow stripes the clearing and the wood groans. MOVE. The ungeared do not survive the fall."
- "THORN MORTAR — marked circles sprout briers. The burst hurts; the patch keeps hurting."
- "OVERGROWTH — vines take your ankles and the grove sets your pace. Pre-position."
- "SUNLANCE — a sunbeam sweeps the clearing. Stay in the shade, circle the keeper."
- "He never stops walking. The fallen trunks are HIS walls — don't get pinned."

Boss damage rule: every new verb passes `fromBoss=true` through
`hurtPlayer` (the m4q gotcha — wizard/knight ×1.6 must apply).

## 6 · Sound (all original chiptune, audio.js)

New SFX: `creak` (tree groan telegraph), `crash` (trunk impact — deeper
cousin of `boom`), `chime` (pixie blink), `bzz` (bumblebrute), grove
ambience pad for the realm music slot (track beats must sum equal — the
keybind/music gotcha).

## 7 · Build order (once picks land)

1. Mob art: port the ≥8 picked draw fns into `world_art.js` (G palette),
   build `<name>Hi` in `buildHiFiWorld`, MOB_HI + MOB_DISPLAY entries.
2. `DATA.mobs` rows + `biomes.grove` roster + `unlockAt` curve.
3. Falling-tree hazard (map-level), then the Grovekeeper verbs on top.
4. Grove decor tiles + ambient pass; builder-paint the map; flip the
   console `sealed1` slot.
5. Headless suite `test/m5_grove_verify.js` (hazard credit, verb clocks
   through unfreeze, brier/honey patch expiry, phase/conceal windows,
   boss arrival gate) + full battery + `?v=` bump.

---
*Answer format that works: "mobs 1 4 6 10 12 14 17 19, name A, keep the
5th verb" — anything in that spirit.*
