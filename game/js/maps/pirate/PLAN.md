# PIRATE SHIP — map plan (MAP 5 of the 10-map campaign)

> Realm 9. Every pick is Red's. IMPORTANT PIVOT (Red): mobs are LIVING
> pirates + sea creatures — NO GHOSTS. The ghost element belongs to the BOSS:
> Captain Kraken SUMMONS a ghost ship as his main event. Sheets + finals in
> `assets/` and `artdev/pirate/`. Numbers TUNE ME. LOCKED 2026-07-16.

## 1 · Theme + name

**PIRATE SHIP** — a huge living galleon moored in a moonlit cove; you board
her and fight the crew bow to stern. Rowdy, salty, dangerous — the spectral
stuff only arrives when the Captain calls it. Palette anchors: deck browns,
sail canvas, brass + doubloon gold, night-sea blues, crew reds/navy; ghost
teal `#5fe8c2` RESERVED for the boss's summon.

- Realm id `pirate`, biome `pirate`, boss `captainkraken`, music `pirate`.
- Toroidal wrap ON (seam through open water).

## 2 · THE ROCKING DECK — signature map system (LOCKED package)

The whole ship TILTS on a swell clock:
1. **THE SWELL**: every ~12s (TUNE) the deck heels port or starboard — a
   lean telegraph first (horizon/shadow shift + creak SFX), then a few
   seconds of SLIDE: player and mobs drift toward the low rail (positional
   force, conveyor-push tech field-wide; respects hitstop/pause).
2. **LOOSE CARGO**: during a hard swell, rum barrels + cannonballs roll
   across the deck as damaging rollers (telegraphed lanes; hit mobs too →
   killMobCredited).
3. **RAIL SAFETY**: the rails stop you (no falling overboard); getting
   pinned at the low rail during a swell is the danger position.
4. Beach/cove ground doesn't tilt — the ship is the mechanic's domain.
No conductor entity; the sea itself drives it (fresh — no bells, no fog).

## 3 · Roster (TEN — Red picked 1 4 5 6 8 10 11 12 15 16; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Deckhand** | swarm filler | cheap mop-swinging chaser |
| **Cutlass Corsair** | melee | slash-lunge (ghoul-pounce tech, blade cone) |
| **Powder Monkey** | kamikaze | a real monkey sprinting at you with a lit keg — beeping fuse, telegraphed blast; shootable early (near mobs it kills THEM, credited) |
| **Salty Gull** | fast flyer | dive pecks (swoop passes) |
| **Siren of the Wake** | puller | song pulls you toward the rails (brutal during a swell) |
| **Kraken Arm** | ambusher | tentacle erupts from warned deck holes (queueSpawn), sweeps, withdraws |
| **Mako Leaper** | arc lander | leaps from the sea over the rails onto marked deck circles |
| **Drunken Swab** | wobbler | erratic zig-zag melee — unpredictable path, weak hits |
| **Harpooner** | pin-line | telegraphed harpoon lane; hit = brief PIN (root) |
| **Inkpot Octo** | zoner | sprays ink slicks — slippery slow patches (patch pool) |

Colored shots = orbShot + tint (gold musket sparks n/a; ink = dark patches).

## 4 · Decorations (ALL 20 ✅) + tiles (✅ my spread)

Decor: ship's wheel · mainmast · cannon rows · cargo hatch · crow's nest ·
rowboat · treasure chest · rum barrels · galley stove · chart table · ship
rails · figurehead · capstan · rigging wall · deck lanterns · nets + crates ·
THE PLANK · tattered sail · parrot perch · hammocks.

Tiles: #1 main deck · #2 quarterdeck (polished stern) · #4 cargo grate ·
#5 cove sand (beach) · #6 shallows (water ring) · #10 storm deck (foredeck
arena). (#3/#7/#8/#9 available as accents if the build wants them.)

**PLANNED scene (assets/pirate_scene_plan.png — composed, never scatter):**
- **THE COVE** (west, spawn): beach with a rowboat ashore + nets/crates; a
  lantern-lit DOCK + gangplank is the only way aboard.
- **THE SHIP** fills the map center/east, BOW NORTH:
  · **QUARTERDECK** (stern): ship's wheel, chart table, treasure chest,
    captain's cabin doors, lanterns.
  · **MIDSHIP**: mainmast + rigging walls + crow's nest, cargo hatch
    (kraken-arm spawn point), cannon rows along both rails, rum barrels,
    tattered sail, parrot perch, galley + hammocks pocket (hold planks).
  · **THE FOREDECK** (bow, BOSS ARENA): storm-deck planks, figurehead,
    capstan, THE PLANK off the starboard rail.
- Rails ring the whole deck. Mako leapers and sirens work the rail edges;
  the ghost ship surfaces to STARBOARD during the boss.

## 5 · CAPTAIN KRAKEN (boss — art FINAL: assets/pirate_boss_final.png)

**Look (Red's combo, locked):** base #6 KRAKENBOUND — a living captain with
a kraken TENTACLE for a left arm — wearing #1's face (dark beard + BIG eye
patch) and skull-badge tricorn w/ red plume, #3's wide gold-epauletted
shoulders, cutlass in the right hand, and a bright little PARROT perched on
his shoulder. Title card: **CAPTAIN KRAKEN** (Red: keep it simple).

**Entrance (LOCKED — Red's idea):** a COLOSSAL TENTACLE rises out of the
ocean beside the bow, arcs over the rails, and THROWS HIM ABOARD — he lands
deck-shakingly hard on the foredeck, stands, the parrot flutters down onto
his shoulder. Title card. (~3s; suites waitForFunction(r.boss && r.scanning).)

**Kit (boss contract — telegraphed ground overlays, no projectile spam):**
- **CUTLASS COMBO** — locked cone flashes → two-step slash combo.
- **TENTACLE SLAM** — his kraken arm rears; a LINE of warned circles marches
  across the deck → slams in sequence.
- **KEG TOSS** — lobs powder kegs onto warned circles; beeping fuses (can be
  shot to pop early).
- **BOARDING CREW** — adds: deckhands + a corsair swing in (queueSpawn).
- **HARD SWELL** — he commands the sea: the deck heels HARD one way (lean
  telegraph → strong slide + rolling barrels; map mechanic weaponized).
- **THE GHOST SHIP BROADSIDE (signature, CONFIRMED)** — he raises the
  tentacle arm; a SPECTRAL GALLEON surfaces to starboard (ghost-teal, the
  map's only ghost), gunports glow one by one → telegraphed broadside LANES
  rake the deck in two waves → the ghost ship sinks back. He is WINDED after
  (rooted, ×1.5 damage — vented window).
- Enrage at low HP: tentacle thrashes faster, swell clock tightens.
≤6 scouter hints. Every source fromBoss=true.

## 6 · Music + SFX

**"THE KRAKEN'S SHANTY"** (assets/pirate_theme.wav — package-approved
status): 8-bit SEA SHANTY GONE GHOSTLY — 100 BPM D dorian, 75 bars = 180.0s.
Concertina (detuned reed pairs) lead, stomp-and-clap engine, crew "HEY!"
shouts, driving root-fifth bass → ghost-choir pads creep in → THE FATHOMS
(pulled-under break: sonar blips, bending wail) → ghostly chorus → final
rowdy octave-up chorus → ghost-breath outro. Port via section-composer.
New SFX: deck creak + swell groan · barrel roll rumble · keg fuse beep +
blast · harpoon thunk · gull shriek · tentacle slam · ghost-ship surfacing
moan · broadside volley · parrot squawk.

## 7 · Build order (Opus)

1. art.js: 10 mob draws + CAPTAIN KRAKEN (final canon) + colossal-tentacle
   entrance sprite + GHOST SHIP broadside sprite (side-on spectral galleon)
   + 20 decor + 6 tiles (port from assets/render/*.js).
2. map.js: realm/biome/10 mob rows/boss/dropTable/console unlock + THE
   KRAKEN'S SHANTY composer + SFX + swell cfg { period, leanMs, slideForce,
   barrelDmg — TUNE }.
3. scene.js: ship PLAN layout per scene PNG (hull walls, rails, zones, dock
   + cove); ROCKING DECK (lean telegraph → slide force → loose cargo
   rollers); wrap (water seam).
4. Boss: tentacle-throw entrance, 6-verb kit, ghost-ship broadside (scene FX
   + lane zones), vented window, enrage.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m11_pirate_verify.js
   (routing · 10 mob mechanics incl. keg env-credit + pin release · swell
   slide + barrels · boss verbs + broadside + entrance) + FULL battery +
   ?v= bump.

## 8 · Status

**EVERYTHING LOCKED 2026-07-16** — roster+kits, decor, tiles, CAPTAIN
KRAKEN look/name/entrance, ghost-ship broadside confirmed, rocking deck.
Scene + theme carry package-approved status — tune at playtest.
Map 5 is build-ready.
