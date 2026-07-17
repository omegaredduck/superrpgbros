# THE NEXT 10 MAPS — master plan (realms 5–14)

*Created 2026-07-15. This is the front-loaded plan Red's Master List asks for: all
notes read, the whole 10-map campaign sequenced, every question surfaced up front.
Themes fill in once Red answers the Round-1 gate. Precedent docs: `GROVE_PLAN.md`,
`GRAVEYARD_PLAN.md`, `MAP4_PLAN.md` (the proven single-map pipeline — now run ×10).*

---

## THE LINEUP (LOCKED 2026-07-15, Red's picks + pick order; 8 mobs per map)

| # | Realm theme | One-line pitch |
|---|-------------|----------------|
| 1 | **STORM SKY ISLES** | floating islands in a thunderstorm — wind + lightning |
| 2 | **PYRAMID PLUNDER** | pharaoh's necropolis in the dunes — sand + curses |
| 3 | **VAMPIRE CASTLE** | Castlevania-style keep — blood moon + gargoyles |
| 4 | **LUNAR STATION** | derelict moon base — aliens + vacuum |
| 5 | **PIRATE GHOST SHIP** | ghost galleon + cursed cove — cannons + skeleton crew |
| 6 | **CRYSTAL CAVERNS** | glowing geode underworld — refracted beams |
| 7 | **HAUNTED CARNIVAL** | abandoned circus at midnight — possessed attractions |
| 8 | **WITCH'S SWAMP** | cursed bog — hexes + wisps |
| 9 | **WILD WEST TOWN** | ghost town at high noon — outlaws + duels |
| 10 | **COLOSSEUM** | gladiator arena — crowd favor + champions |

CUT in Round 1 (Red): Volcanic Forge · Frozen Tundra · Sunken Depths · Inferno
Pits. Folder scope: **new 10 only** — the 4 live realms stay in core.

## THE BOSS CONTRACT (Red, 2026-07-15 — applies to ALL 10 bosses)

The gold standard is the **Factory boss phase 2** (Grand Engineer / PROTOTYPE
130C-4, m6e): every attack **telegraphed with a ground overlay** (flashing lanes,
warned circles, locked cones, checkerboard waves, fuse rings) and **time to
react**. **NO machine-gun-burst + radial-projectile-spam kits** — Red: "all
bosses do that, im tired of seeing that." Each kit gets the SAME zone-dance
design language but fully **re-themed to its map** (e.g. lightning strikes on
the Sky Isles, sand geysers in the Pyramid). ≤6 scouter hints, every source
fromBoss=true.

---

## 0 · Where this fits

Four realms are LIVE: **THE TRAIN YARD** (Conductor) · **THE GROVE** (Grovekeeper) ·
**THE GRAVEYARD** (Gravekeeper) · **THE ROBOTICS FACTORY** (Grand Engineer, ?v=m6e).
This campaign designs realms **5 through 14** — ten new maps — using the same
pipeline that shipped the last three, then hands a build-ready package to Opus.

**Division of labor (Red's call):**
- **THIS SESSION (Fable): design everything.** Sheets, picks, plans, music, docs.
  NO game code.
- **NEXT SESSION(S) (Opus): build everything** from the per-map folders +
  NEXT_SESSION.md. Fresh window per Red's workflow.
- **AFTER THAT (Fable): fresh testing session.**

---

## 1 · The Master List (transcribed, verbatim intent — now 15 notes)

1. Read all notes first, start in order, make a plan, front-load the questions and
   the 20-sheets (some questions necessarily come after the sheets).
2. What makes a map: **8 mobs · a theme · special map mechanic + animation ·
   special mechanics with themed attacks.**
3. Ask Red **the theme of the map** (×10 this time — the Round-1 gate).
4. **20 mob designs**, 160×160, hi-fi pixel art, one numbered PNG per map.
5. **20-sheet of decorations** per map.
6. Decorations are **planned into a scene** — never random scatter.
7. Each map gets a **custom 8-bit theme song, ~3:00**.
8. Boss **entrance based on the map** — ask Red for his idea + offer suggestions.
9. Ask Red the **music theme + inspiration** per map.
10. **After** mob picks, ask Red the **plan for each selected monster**.
11. At the end **update the documentation**, bestiary updated, **no text overflow**.
12. Ask Red the **boss name**, whether he has a **design in mind**, and any
    **spell/mechanic recommendations**.
13. **10-sheet of boss work-ups** and **10-sheet of map tiles** per map.
14. **Toroidal wrap** — walking off the map teleports you to the other side.
    (Standard since the Graveyard; every new map ships with wrap<Map>().)
15. **Each map lives in its own standalone folder** so multiple AIs can contribute
    without overlapping. (Needs a one-time core registry refactor — §4.)

**End-state:** everything Opus needs (approved art, plans, strategies, instructions)
left in the directory; NEXT_SESSION.md rewritten so a fresh window builds all 10.

---

## 2 · The per-map kit (what "designed" means, ×10)

| # | Deliverable | Spec |
|---|-------------|------|
| A | Mob option sheet | 20 designs, 160×160 hi-fi, one numbered PNG |
| B | Decoration sheet | 20 designs, one numbered PNG |
| C | Scene composition | Planned layout PNG + doc — a composed scene |
| D | Boss work-ups | 10 designs, one numbered PNG |
| E | Map tiles | 10 tiling textures, one numbered PNG |
| F | Roster lock | 8 mobs picked + per-monster plan from Red |
| G | Boss lock | name · design pick · entrance · kit (≤6 scouter hints) |
| H | Signature mechanic | a realm "cycle" w/ animation + themed attacks |
| I | Theme song | original 8-bit, ~3:00, WAV preview + composer data |
| J | Map folder | PLAN.md + BUILD_INSTRUCTIONS.md + assets + render scripts |

Non-negotiables carried from the shipped realms: toroidal wrap · balance numbers
only in data (TUNE ME first-pass) · unfreeze() shift list for every new absolute
clock · queueSpawn for all mechanic spawns · killMobCredited env kills ·
fromBoss=true on every boss source · orbShot+tint for colored shots · bestiary +
scouter text-fit · suites stand the ambient cycle down.

---

## 3 · Question rounds (front-loaded)

**ROUND 1 — NOW, gates everything:** the 10 themes + the build order +
standalone-folder scope (refactor the 4 live realms into folders too, or new-10 only).

**PER MAP (repeated ×10, in order):**
- R2 (while sheets render): music inspiration · boss name/design-in-mind ·
  spell/mechanic recommendations · mood check.
- R3 (after sheets): mob picks + change requests · boss pick · decor picks ·
  tile picks.
- R4 (after picks): per-monster plans · boss entrance idea + my suggestions ·
  scene-layout sign-off · theme-WAV sign-off.

---

## 4 · Standalone map folders (note 15 — the architecture)

Proposed layout (final call locked in Round 1):

```
game/js/maps/<mapId>/
  map.js       — self-registering: realm def, biome roster, mob rows, boss def,
                 dropTable, SFX, section-composer music (equal-beat tracks)
  art.js       — every draw fn + texture build for this map (mobs/boss/tiles/decor)
  scene.js     — setup<Map>/update<Map>/wrap<Map>/ambient cycle/boss verbs +
                 the map's unfreeze-shift contribution
  PLAN.md      — the locked design (this session's output)
  BUILD_INSTRUCTIONS.md — build order + gotcha carry-list for the implementing AI
  assets/      — approved sheets, scene-plan PNG, theme WAV, render scripts
```

One-time CORE REFACTOR (first thing Opus builds, before any new map): a
`MAPS.register(def)` registry + hook points so data.js/scenes.js/textures.js/
entities.js consume registered maps without per-map edits. Each map = one folder
+ one `<script>` tag in index.html. After that, N AIs work in N folders with zero
overlap. The 4 live realms keep working either way; migrating them into folders
is optional (Round-1 question).

---

## 5 · Campaign sequence

1. ~~Read all notes + this plan~~ ← done
2. **Round 1**: 10 themes + order + folder scope. **[BLOCKS everything]**
3. For each map, in order: R2 questions → render A/B/D/E sheets → R3 picks →
   iterate changed designs → R4 plans/entrance/scene/music → compose theme →
   stock the map folder (PLAN.md + BUILD_INSTRUCTIONS.md + assets).
4. After map 10: registry-refactor spec doc + MILESTONES/EVENT_LOG updates +
   rewrite NEXT_SESSION.md (Opus build prompt covering the refactor + all 10).
5. Fresh Opus window builds; fresh Fable window tests.

*Scale note: 10 maps = 40 option sheets + 10 songs + 10 scene plans. We run it
map-by-map so state is always safe in the folders + memory; if the session hits a
limit, any map already folder-stocked is build-ready and the campaign resumes
where it stopped.*

---

## 6 · Status checklist

- [x] Read all notes, build this plan (note 1)
- [x] Round 1: 10 themes + order + folder scope (note 3) — LOCKED, see THE LINEUP
- [x] Maps 1–10: sheets ×4 each (notes 4, 5, 13)
- [x] Maps 1–10: picks + per-monster plans (note 10)
- [x] Maps 1–10: boss name/design/kit/entrance (notes 8, 12)
- [x] Maps 1–10: planned scenes (note 6)
- [x] Maps 1–10: signature mechanic + wrap (notes 2, 14)
- [x] Maps 1–10: 3:00 8-bit themes (notes 7, 9)
- [x] Maps 1–10: standalone folders stocked (note 15)
- [x] Registry-refactor spec + docs + bestiary text-fit plan (note 11)
- [x] NEXT_SESSION.md rewritten for the Opus build

---

## 7 · CAMPAIGN COMPLETE (2026-07-17)

**Red extended the campaign 10 → 16 maps mid-run (2026-07-16; realms 5–20,
game total 20 with the 4 live realms).** The extension slate (Red's picks):
11 THE ABYSS · 12 SUGAR WORLD · 13 NEON CITY · 14 VICE VERSA (pivoted from
Haunted Library) · 15 PREHISTORIA (was Dino Valley) · 16 BELLY OF THE BEAST
(Red's own full design: intro/outro cinematics, "???" reveal, stationary
titan-whale boss).

**STATUS: 16/16 DESIGN-COMPLETE.** Every map folder in game/js/maps/<id>/
(skyisles · pyramid · castle · lunar · pirate · crystal · carnival · swamp ·
west · colosseum · abyss · sugar · neon · viceversa · prehistoria · belly)
carries PLAN.md + BUILD_INSTRUCTIONS.md + approved assets (sheets, finals,
scene plan, 180.0s theme WAV) + render scripts, mirrored to artdev/<id>/.

Campaign-wide rules that accrued during the run (all in [[ten-maps-campaign]]):
boss contract (telegraphs, ≤6 hints, vented ×1.5, no burst+radial) · toroidal
wrap everywhere EXCEPT Colosseum (round, Red's exception) · **ALL FENCES IN
THE GAME MUST BE DESTRUCTIBLE (retrofit at build time)** · no reused cycle
mechanics · themes exactly 180.0s chiptune, no slow intros · standalone
folders behind the MAPS registry (game/js/maps/REGISTRY_SPEC.md).

**NEXT: the OPUS BUILD** — docs/NEXT_SESSION.md is the build prompt
(registry refactor FIRST, then the 16 maps in lineup order). After the build:
a fresh Fable testing window.
