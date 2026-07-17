# PYRAMID PLUNDER — map plan (MAP 2 of the 10-map campaign)

> Realm 6. Every pick below is Red's (numbered sheets + question rounds).
> Sheets + finals in `assets/` and `artdev/pyramid/`. All numbers TUNE ME.
> Design locked 2026-07-15 except where marked PENDING.

## 1 · Theme + name

**PYRAMID PLUNDER** — a pharaoh's necropolis in the dunes, and you are here to
ROB IT. Ancient-curse dread played straight: brazier-lit processional, tomb
plots, an oasis where rival raiders camp, and a burial chamber that should
have stayed sealed. Palette anchors: sandstone `#d9b17a` family, royal gold
`#ffcd45`, lapis `#2a5fc2`, curse green-teal `#66e8a0`, tomb dark `#3a2c28`,
jackal obsidian.

- Realm id `pyramid`, biome `pyramid`, boss `neferuka`, music `pyramid`.
- Toroidal wrap ON. Open desert world — zones are floor-defined, glyph walls
  and colonnade give structure without corridors.

## 2 · Roster (8 — Red picked 1 5 3 7 14 12 11 10; kits APPROVED)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Scarab** | swarm filler | cheap fast contact chaser |
| **Broodmother** | splitter | slow + beefy; death-burst into a Scarab pack (puffcap split) |
| **Khopesh Guard** | melee blocker | periodic telegraphed SHIELD window (shots bounce → 'BLOCKED' popup, ward tech re-timed), then khopesh slash-lunge |
| **Ankh Priest** | healer | mends nearby mobs (repairUnit tech) — priority kill |
| **Tomb Weaver** | slow-fields | lays web patches that slow (patch pool) |
| **Apep Spawn** | AoE lobber | venom lobs onto warned circles → poison puddle DoT |
| **Jackal Runner** | pack chaser | fast; spawns in packs of 2–3 |
| **Sandstone Golem** | tank | heavy; telegraphed ground-POUND circle (zone blast) |

Colored shots/globs = orbShot + tint (curse green venom, gold bolts).

## 3 · Decorations (ALL 20 kept) + tiles

Decor: obelisk · sarcophagus · canopic set · **TREASURE PILE** · **GILDED
CHEST** · brazier · pharaoh colossus · anubis statue · papyrus column · glyph
wall · sphinx · palm cluster · oasis pool · raider camp · dune drift · fallen
colossus · **TRAP PLATE** · scales · **PLUNDER CART** · urn cluster.
(Bold = the lootable/armable props that drive the signature mechanic.)

Tiles (Red: "any of the tiles, not required — your call"): #1 desert sand
(open world) · #2 sandstone brick (necropolis paths) · #3 glyph causeway
(the processional) · #4 tomb dark (necropolis plot) · #7 lapis hall (temple
court) · #8 quicksand (hazard pits) · #5 royal gold + #10 obsidian seal
(burial chamber arena). #6/#9 available as accents if the build wants them.

**PLANNED scene (assets/pyramid_scene_plan.png — composed, never scatter):**
- **EXPEDITION CAMP** (south, spawn): the dig site — tents, plunder cart,
  urns, palms. You arrive as one more grave robber.
- **THE CAUSEWAY** (center spine, spawn → arena): glyph-causeway processional
  lined with alternating braziers + obelisks; TRAP PLATES on the walkway;
  one tempting treasure pile mid-way (bait).
- **THE NECROPOLIS** (west, tomb-dark floor): sarcophagi rows, canopic
  shelves, glyph-wall dividers, trapped gilded chests (chest + trap plate
  pairs).
- **THE OASIS** (east): pool + palms + reed mats + a second raider camp and
  a treasure pile — the "safe" zone that isn't.
- **THE DUNES** (SW/SE belt): dune drifts, QUICKSAND pits, the half-buried
  fallen colossus, the SPHINX landmark w/ treasure.
- **TEMPLE COURT** (north band, lapis floor): papyrus colonnade, pharaoh
  colossi pair, SCALES OF JUDGMENT shrine, gilded chest.
- **THE BURIAL CHAMBER** (north center, arena): royal-gold checker floor w/
  OBSIDIAN SEAL circle at center, the golden SARCOPHAGUS on the seal (boss
  entrance), FOUR ANUBIS STATUES at the corners (used by a boss verb),
  braziers. Wrap seam runs through open dunes.

## 4 · TREASURE & CURSE — signature map system (LOCKED)

The map is SEEDED with plunder: treasure piles, gilded chests, the plunder
cart (and urns as micro-loot). **Looting pays** — XP orbs + a short buff
(TUNE: haste or damage charge). **Looting angers the tomb** — every loot
raises a persistent CURSE metric for the run:
1. Loot #1+: nearby TRAP PLATES arm — dart volleys across warned lines when
   crossed (env damage, hits mobs too → killMobCredited).
2. As curse rises: QUICKSAND pits churn wider; a curse DoT tick follows each
   loot for a few seconds (small, TUNE).
3. High curse: **tomb retaliation waves** — Khopesh Guards + Jackal packs
   spawn hunting you (queueSpawn); the sky dims a step.
4. Urns are free micro-smashes (no curse) — the tells are the GOLD props.
Risk/reward loop: plunder more = stronger but hunted. During arrival/boss
the ambient retaliation stands down (boss owns the anger).

## 5 · NEFERU-KA — THE ETERNAL CHILD → THE EXECUTIONER (boss — art FINAL:
##     assets/pyramid_boss_final.png; 2-phase transform, Engineer precedent)

**Phase 1 look (Red pick, pharaoh sheet #6, refined):** a tiny floating
boy-king in white + gold, dwarfed by his serene oversized golden death mask —
one eye weeps a black tear; toy crook, dragging flail; curse wisps orbit him.

**Phase 1 kit (caster; boss contract — all ground-overlay telegraphs):**
- **CURSE SIGILS** — warned rune circles bloom around/under you → blast.
- **MASK GAZE** — his mask's eyes flare; a cone LOCKS + glows → sweeping
  beam (exhaustCone tech).
- **TANTRUM QUAKE** — the gold checker floor flashes in two alternating
  tile-waves → each wave erupts (floorStamp tech; stand on the other wave).
- **SANDS OF AGE** — warned circles open into lingering quicksand pools
  (slow zones, patch pool).
- **ROYAL SUMMONS** — calls Khopesh Guards ("his toys") via queueSpawn.
No projectile spam. hp chunk → first death triggers the TRANSFORMATION.

**ENTRANCE (LOCKED — Red's pick, SARCOPHAGUS CREAKS OPEN):** every brazier in
the chamber gutters out one by one; the golden sarcophagus lid grinds + slides
off the obsidian seal; the tiny king FLOATS out into the dark — mask glowing,
black tear running — title card NEFERU-KA · THE ETERNAL CHILD. (~3s; suites
waitForFunction(r.boss && r.scanning).)

**TRANSFORMATION CUTSCENE (phase-1 death):**
the child collapses; wraps + mask whirl into a column of curse light; THE
EXECUTIONER strides out of it — twice the size, twin khopesh, the same black
tear under his burning eye; his belt carries the child's mask as a trophy.

**Phase 2 look (Red pick, anubis sheet #2, refined):** jackal berserker —
gold war kilt, wrap-cape (the child's gown, outgrown), glowing chest scar,
twin gold khopesh raised, gold ear-caps.

**Phase 2 kit (melee hunter; zero projectiles):**
- **CROSS-SLASH** — two crossing lane telegraphs (an X) flash → he dashes
  both in sequence (drillCharge tech ×2).
- **WHIRLING BLADES** — he roots + spins; a growing fuse ring expands —
  outrun it before it blows (reactorPurge ring tech).
- **EXECUTIONER'S BRAND** — a sigil marks YOUR position → 1.5s later it
  blasts (drop the zone and move).
- **GUILLOTINE LEAP** — leaps offscreen; warned circle tracks then locks →
  slams down (press-slam tech).
- **JUDGMENT OF THE FOUR (signature)** — the 4 ANUBIS STATUES ignite one by
  one, each sweeping a telegraphed beam-wall lane across the arena in
  sequence (rod-overload re-themed); after the fourth he KNEELS, winded —
  ×1.5 damage window (vented).
- **JACKAL PACK** adds mid-fight (queueSpawn) + overclock-style enrage.
≤6 scouter hints per phase. Every source fromBoss=true.

## 6 · Music + SFX

**"THE ETERNAL CHILD"** (assets/pyramid_theme.wav — ✅ APPROVED by Red):
8-bit ANCIENT-CURSE DREAD — 84 BPM, D hijaz (phrygian dominant), exactly
180.0s. Tomb-door gong, detuned under-floor chant pulses, lub-DUB heartbeat
toms, sand-shaker hiss, snake-charmer lead w/ grace-note ornaments,
dissonant dread stabs, dark bell tolls in the climax, and a final small
high "child's bell" that is deliberately wrong. Port via the map's
section-composer (equal-beat tracks).
New SFX: loot chime + curse whisper · trap-dart burst · quicksand gulp ·
sigil bloom · mask-gaze hum · transform howl · khopesh shing · statue beam.

## 7 · Build order (Opus, after registry + skyisles or in lineup order)

1. art.js: 8 mob draws + BOTH boss forms (pyramid_boss_final.png canon) +
   20 decor + tiles/floors per §3 (port from assets/render/*.js).
2. map.js: realm/biome/mobs/boss(2-phase, def.transform)/dropTable/console
   unlock + THE ETERNAL CHILD composer + SFX.
3. scene.js: PLAN-array layout per the scene PNG; quicksand slow pools;
   trap plates; lootable props + curse metric; wrap.
4. Treasure & Curse cycle (each testable alone): loot rewards → trap arming
   → curse DoT → retaliation waves.
5. Boss: sarcophagus entrance (pending pick), phase-1 kit, transformation,
   phase-2 kit, statues verb, adds, enrage.
6. Bestiary + scouter TEXT-FIT (≤6 hints/phase); suite m8_pyramid_verify.js
   (routing · 8 mob mechanics · curse loop clocks through unfreeze · traps ·
   quicksand · both phases + transform) + FULL battery + ?v= bump.

## 8 · Status

**EVERYTHING LOCKED 2026-07-15** — entrance (sarcophagus creaks open), scene
plan approved, THE ETERNAL CHILD approved. Map 2 is build-ready.
