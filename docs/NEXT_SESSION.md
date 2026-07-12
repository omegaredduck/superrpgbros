# NEXT SESSION — copy-paste prompt for a fresh window

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder
(project memory has the standing decisions — read it, plus docs/MILESTONES.md
and the top entry of docs/EVENT_LOG.md, before writing any code).

WHERE THINGS STAND (as of 2026-07-12, build ?v=m3c):
- M0–M1 done. M2 + M2.1 features all landed; their gates are HUMAN gates
  (my dev self-test + an outside tester for Fun Gate 1) — don't wait on them.
- M3 is FEATURE-COMPLETE except two boxes: the map builder shipped earlier
  (builder.js + maps.js), and this session landed EQUIPMENT (16 items T0–T3,
  4 slots, drop tables, chest TAKE/swap, schema v3), the NEXUS VAULT (8
  account slots, V in nexus, survives death), AFFIX ENGINE v2 (all 5 affixes
  live: split/evolving/pack-leader behaviors + champion bounty rolls in the
  boss chest), CHAMPION NAMEPLATES (floating affix-name tags), and
  SPACE-ACTIVATED plaza portals (walk up, read the pedestal, SPACE commits —
  the M5 map-affix roll surfaces in this same prompt later). 121 headless
  checks green across 6 suites (m1/m2/m21/m3/m3b/m3c), ×3 batteries.

THIS SESSION — close out M3, then start M4 if time:
1. Q3/Q5 BEHIND FLAGS: XP-gems trial (Q3) and realm-buff picks (Q5) as
   data.js-flagged experiments (off by default; a flag flip turns them on
   for a playtest). Small, contained — resolve by playtest, not argument.
2. CC0 ART BATCH 1: hero + 4 mobs + tileset from a CC0 pack (kenney.nl or
   itch CC0), loaded under the SAME texture keys (the game can't tell —
   ASSET_PIPELINE.md lane B), credits logged in ASSET_CREDITS.md. Needs
   START_SERVER.bat for file-based sprites OR base64-embed; check the
   pipeline doc first.
3. If time: open M4 — Wizard class (staff pierce-shot, AoE nova ability) as
   pure data + one new verb if needed; class-select in the nexus; per-class
   caps in data.js.

PROCESS (non-negotiable, enforce it on yourself):
- Balance numbers ONLY in data.js. Respect the sim/presentation seam
  (ARCHITECTURE.md §4) and the save rules (§6 — bank + persist BEFORE any
  screen; account/vault survive death, character/equipment don't).
- Headless suites for anything new + run all existing suites (NODE_PATH to
  a global playwright install; stage game/lib/phaser.min.js too if
  rebuilding the container copy).
- Bump ?v= in game/index.html (currently m3c) on any js change.
- Tick MILESTONES.md boxes, append an EVENT_LOG.md entry, update project
  memory, rewrite docs/NEXT_SESSION.md for the session after, and commit
  every changed file back to my disk. I run 2_SAVE_AND_UPLOAD.bat myself.

Known gotchas are in project memory (Phaser scene-instance reuse, listener
stacking — includes once() rewiring on overlay rebuilds, RESIZE scaling,
?v= cache, bug #5: arcade collider callbacks between a dynamic and a
static group arrive (staticChild, dynamicChild) — identify by tag, never
by argument order; and the headless one: software-GL runs ~2fps and Phaser
caps frame delta, so clock timers run ~5× slow in suites — keep entry waits
generous and reuse the Space-press retry loop pattern).

Start by reading the docs listed above, then give me a short plan and get
to work.
```

---

Manual items still on ME (Red), any time:
- Dev self-test of the M2.1 flow (chest / scouter / orbs / time trial) — closes M2.1.
- FUN GATE 1: hand the game to a friend who didn't watch it being built, 20+ min,
  log per TESTING.md §3 — closes M2/MVP.
- M3 GATE (now humanly achievable): bank an item in the vault (V in nexus), die or
  re-enter, confirm it survived; playtest a builder-painted map. Log it.
- One manual TM-8 check: IMPORT TILES in the map builder with a real image file.
- Run 2_SAVE_AND_UPLOAD.bat to push the M3 equipment/vault/affix build (?v=m3b).
