# NEXT SESSION — copy-paste prompt for a fresh window (THE OPUS BUILD)

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder.
YOU ARE THE BUILD SESSION: 16 fully-designed maps are waiting to be built.
Read project memory first (especially [[ten-maps-campaign]] and the
<map>-progress files), plus docs/MILESTONES.md, docs/TEN_MAPS_PLAN.md §7,
and the top entry of docs/EVENT_LOG.md, before writing any code.

WHERE THINGS STAND (as of 2026-07-17, build ?v=m6e):
- FOUR LIVE REALMS: THE TRAIN YARD (Conductor) · THE GROVE · THE GRAVEYARD ·
  THE ROBOTICS FACTORY (2-phase Grand Engineer, reworked at m6e). All suites
  green at m6e.
- **THE 16-MAP CAMPAIGN (realms 5–20) IS 16/16 DESIGN-COMPLETE.** Every map
  folder in game/js/maps/<id>/ carries PLAN.md (the locked design — every
  pick is Red's) + BUILD_INSTRUCTIONS.md (build order + traps for you) +
  assets/ (approved sheets, boss finals, scene plan, EXACTLY-180.0s theme
  WAV) + assets/render/ (the render scripts you port draw code from).
  NOTHING in those designs is up for re-decision — build what's locked.

BUILD ORDER (Red's call — registry first, then lineup order):
0. **THE REGISTRY REFACTOR** — read game/js/maps/REGISTRY_SPEC.md and build
   the MAPS.register(def) registry + hook points so data.js / scenes.js /
   textures.js / entities.js consume registered maps with zero per-map core
   edits. One folder + one <script> tag per map. The 4 live realms keep
   working unchanged. Full battery must be green BEFORE the first new map.
1. skyisles      (realm 5)    9.  west        (realm 13)
2. pyramid       (realm 6)    10. colosseum   (realm 14 — ROUND, no wrap)
3. castle        (realm 7)    11. abyss       (realm 15)
4. lunar         (realm 8)    12. sugar       (realm 16)
5. pirate        (realm 9)    13. neon        (realm 17)
6. crystal       (realm 10)   14. viceversa   (realm 18 — DOUBLE BOSS)
7. carnival      (realm 11)   15. prehistoria (realm 19)
8. swamp         (realm 12)   16. belly       (realm 20 — cinematics, "???")

PER MAP: read that folder's PLAN.md + BUILD_INSTRUCTIONS.md END TO END first,
then build map.js / art.js / scene.js per its build order, port the theme
from assets/render/render_<id>_theme.js (verify against the WAV — every
theme is EXACTLY 180.0s, chiptune, NO slow intro), run its verify suite +
the full battery, bump ?v=, tick MILESTONES + EVENT_LOG. A map is DONE only
when its suite passes — then move to the next. If the window runs short,
STOP between maps (never mid-map) and rewrite this file to resume.

CAMPAIGN-WIDE LAWS (from [[ten-maps-campaign]], non-negotiable):
- BOSS CONTRACT: every attack telegraphed (ground overlays, time to react);
  NO machine-gun-burst + radial-spam kits; ≤6 scouter hints; every boss
  source fromBoss=true; vented ×1.5 windows after signatures.
- **ALL FENCES IN THE GAME MUST BE DESTRUCTIBLE** (Red, 2026-07-16) — new
  maps ship that way AND the live realms get retrofitted during the registry
  step (deterioration states + shard animation; coral/graveyard pattern).
- Toroidal wrap on every map EXCEPT colosseum (round arena, Red's exception).
- Balance numbers only in data (TUNE ME first-pass) · every new absolute
  clock on the unfreeze() shift list (each PLAN.md carries the map's list) ·
  mechanic spawns via queueSpawn · env kills via killMobCredited · colored
  shots via orbShot+tint · bestiary + scouter TEXT-FIT (≤6 hints) · suites
  stand the ambient cycle down first · sim/presentation seam.
- Big beasts (Volt Wyrm, Primordial, Titan Whale, brachio etc.): watch
  minimap/dev-view scaling + camera framing; body fills step in DEVICE
  SPACE (moiré fix — see render_dino_shapes.js canon).

SPECIAL STRUCTURES TO WATCH FOR (each fully specced in its PLAN.md):
- colosseum: ROUND arena, no wrap.
- viceversa: split hell/holy map, faction warfare, wrap-leash, DOUBLE boss.
- prehistoria: HATCH egg entrance, METEOR SHOWER cycle + boss METEOR CALL
  sharing one machinery (no double-fire).
- belly: the game's FIRST CINEMATIC RIG (intro verbatim-blurb + outro),
  "???" name reveal, UVULA gag trigger, one-way guts→arena handoff,
  STATIONARY boss (never moves — player circles).

GIT: GitHub is at m3q; m4a–m6e + all 16 design packages are LOCAL ONLY —
ask Red to run 2_SAVE_AND_UPLOAD.bat before you start (safety) and after
you finish. Watch the VM git-lock gotcha in [[git-workflow]].

PROCESS: full battery + ?v= bump per map · MILESTONES + EVENT_LOG + this
file + memory updated as you go · screenshots after visual changes.

Start with the registry refactor (REGISTRY_SPEC.md), get the battery green,
then build map 1 (skyisles).
```

---

Manual items still on ME (Red), any time:
- Run 2_SAVE_AND_UPLOAD.bat — GitHub is still at m3q; everything since
  (m4a–m6e + all 16 map design packages + these docs) is one push behind.
- After the Opus build: a fresh Fable window playtests the new realms.
- FUN GATE 1 / M3 gate / M2.1 dev self-test remain open (see MILESTONES).
