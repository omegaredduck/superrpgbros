# NEXT SESSION — copy-paste prompt for a fresh window (THE OPUS BUILD, part 2)

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder.
YOU ARE THE BUILD SESSION (part 2): 8 of the 16 designed maps are BUILT AND
SHIPPED; 8 remain. Read project memory first (especially
[[opus-build-progress]] — it carries the proven per-map build pattern AND
every hard-won gotcha — plus [[ten-maps-campaign]]), then docs/MILESTONES.md
and the top TWO entries of docs/EVENT_LOG.md, before writing any code.

WHERE THINGS STAND (as of 2026-07-17 end-of-day, build ?v=m7i):
- FOUR LIVE CORE REALMS (yard/grove/graveyard/factory) + THE M7 MAP REGISTRY
  (game/js/maps/registry.js — one folder + three <script> tags per map,
  ZERO core edits).
- **8/16 CAMPAIGN MAPS SHIPPED** (each with its own green verify suite):
  1. skyisles m7b (m7, 26)      5. pirate m7f (m11, 27)
  2. pyramid m7c (m8, 23)       6. crystal m7g (m12, 26)
  3. castle m7d (m9, 21)        7. carnival m7h (m13, 33)
  4. lunar m7e (m10, 28)        8. swamp m7i (m14, 34)
- SWAMP shipped LAST THING today: m14 34/34 green + m2/m13 smoke green on
  m7i, but the FULL battery has NOT been re-run since the swamp files were
  added. **FIRST TASK: run the full battery on m7i** (the ~17 suites in
  test/ minus documented-stale m1/m21/m3; m3b may flake headless — rerun
  once). Everything is committed to this folder already.

REMAINING BUILD ORDER (lineup order, one folder each under game/js/maps/):
9.  west         (realm 13)    13. neon        (realm 17)
10. colosseum    (realm 14 — ROUND arena, NO wrap, Red's exception)
11. abyss        (realm 15)    14. viceversa   (realm 18 — DOUBLE BOSS)
12. sugar        (realm 16)    15. prehistoria (realm 19)
                               16. belly       (realm 20 — cinematics, "???")

PER MAP (the pattern is proven 8× — follow [[opus-build-progress]] exactly):
read that folder's PLAN.md + BUILD_INSTRUCTIONS.md END TO END, port art.js
from assets/render/*.js (Red's locked picks), scene.js (colliders in
afterCreate NEVER setup — the 'isParent' lesson), map.js last (theme
composer MUST assert equal beats and beats*60/BPM === 180 EXACTLY), 3 index
tags + ?v= bump (next: m7j), suite modeled on test/m14_swamp_verify.js
(delayedCall-capture technique for cones — headless time runs ~0.3× real),
full battery, EVENT_LOG + MILESTONES + memory, STOP between maps never
mid-map. A map is DONE only when its suite passes.

CAMPAIGN-WIDE LAWS (non-negotiable): boss contract (telegraphs, no
burst+radial spam, ≤6 hints, fromBoss=true, vented ×1.5 after signatures) ·
toroidal wrap except colosseum · balance in data (TUNE ME) · absolute clocks
on the unfreeze shift list · queueSpawn for mechanic spawns ·
killMobCredited for env kills (mobs FIRST, player LAST in shared blasts) ·
orbShot+tint for colored shots · themes exactly 180.0s chiptune.

SPECIAL STRUCTURES AHEAD (each fully specced in its PLAN.md):
- colosseum: ROUND arena, no wrap.
- viceversa: split hell/holy map, faction warfare, wrap-leash, DOUBLE boss.
- prehistoria: HATCH egg entrance, METEOR SHOWER cycle + boss METEOR CALL
  sharing one machinery (no double-fire).
- belly: the game's FIRST CINEMATIC RIG (intro verbatim-blurb + outro),
  "???" name reveal, UVULA gag trigger, one-way guts→arena handoff,
  STATIONARY boss (never moves — player circles).

GIT: GitHub is STILL at m3q — everything from m4a through m7i (four maps'
worth of sessions + all designs + 8 built maps) is LOCAL ONLY. Ask Red to
run 2_SAVE_AND_UPLOAD.bat BEFORE you start. Watch the VM git-lock gotcha
in [[git-workflow]].

Start by running the full battery on m7i, then build map 9 (west).
```

---

Manual items still on ME (Red), any time:
- **Run 2_SAVE_AND_UPLOAD.bat — URGENT.** GitHub is at m3q; EIGHT built maps
  (m4a–m7i), all 16 design packages, and these docs are one push behind.
  That's several days of work living only on this machine.
- After the Opus build: a fresh Fable window playtests the new realms.
- FUN GATE 1 / M3 gate / M2.1 dev self-test remain open (see MILESTONES).
