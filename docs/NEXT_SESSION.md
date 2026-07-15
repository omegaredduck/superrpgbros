# NEXT SESSION — copy-paste prompt for a fresh window

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder
(project memory has the standing decisions — read it, plus docs/MILESTONES.md
and the top entry of docs/EVENT_LOG.md, before writing any code).

WHERE THINGS STAND (as of 2026-07-15, build ?v=m5e):
- M0–M4 arcs done. M5.0 THE GROVE (biome 2) + M5.2–5.5 (legendary kits,
  progression rework, collection) shipped. **M5.6 THE GRAVEYARD (biome 3) is
  SHIPPED** — the third live realm. Full battery green + smoke(15) + boss(12).
- THE GRAVEYARD = its own world (planned cemetery: south iron gate that
  auto-opens → lantern S-path → 4 destructible-fence plots → arena open grave),
  8-mob roster (Ghoul/Rattlebones/Bone Archer/Tomb Golem/Corpse Bloater/Banshee/
  Mummy/Necro Acolyte with 6 new verbs), THE WITCHING CYCLE (fog/restless graves/
  soul wisps/cursed bell), and THE GRAVEKEEPER boss (grave-climb, 5-wave immunity
  loop −20% HP/wave, Reaper's March instant-death walker, Necronomicon verbs),
  plus a chip port of the gothic-metal theme. See [[graveyard-build-progress]].
- GIT: GitHub at m3q — m4a THROUGH m5e wait in ONE 2_SAVE_AND_UPLOAD.bat.

THIS SESSION — pick one:
- PLAYTEST TUNE THE GRAVEYARD: every number is TUNE ME (data.js: mob stats,
  DATA.realms.graveyard.witching {fog/graves/wisps/bell}, bosses.gravekeeper
  {waves, reaper.spawnAtPct, verb clocks}). Play it, tell me what feels off.
- Or keep the M5 ramp: dungeons (portal drops from elites + builder maps +
  dungeon bosses), T4–T6 gear, map affixes GO LIVE (flip DATA.console.live),
  more objectives/modes.
- Or the outstanding manual gates (see below).

PROCESS (non-negotiable): balance numbers ONLY in data.js · sim/presentation
seam · every new absolute clock on the unfreeze() shift list · mechanic spawns
through RealmScene.queueSpawn (never group.get inside an iterate) · headless
suites stand the ambient cycle down first (witching.nextGraveAt/nextBellAt =
Infinity) + drive real-time delayedCall flows deterministically (headless
throttles rAF) · env kills credit via killMobCredited · every boss source
fromBoss=true · full battery + bump ?v= · tick MILESTONES + EVENT_LOG +
NEXT_SESSION + memory · screenshots after visual changes.

Start by reading docs/MILESTONES.md + the EVENT_LOG top entry, then tell me what
you want to do and get to work.
```

---

Manual items still on ME (Red), any time:
- PLAYTEST THE GRAVEYARD end-to-end (it's live at the portal machine now) — log feel.
- Grove playtest / Conductor feel pass (m4q–m4s balance round) still unplayed.
- Dev self-test of the M2.1 flow (chest / scouter / orbs / time trial) — closes M2.1.
- FUN GATE 1: hand the game to a friend, 20+ min, log per TESTING.md §3.
- M3 GATE: vault an item, die, confirm it survived; playtest a builder map.
- One manual TM-8 check: IMPORT TILES in the map builder with a real image.
- Run 2_SAVE_AND_UPLOAD.bat — GitHub at m3q; m4a THROUGH m5e wait in one push.
