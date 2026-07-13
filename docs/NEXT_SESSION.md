# NEXT SESSION — copy-paste prompt for a fresh window

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder
(project memory has the standing decisions — read it, plus docs/MILESTONES.md
and the top entry of docs/EVENT_LOG.md, before writing any code).

WHERE THINGS STAND (as of 2026-07-13, build ?v=m4d):
- M0–M1 done. M2 + M2.1 features landed; their gates are HUMAN gates (my dev
  self-test + an outside tester for Fun Gate 1) — don't wait on them.
- M3 features done (map builder, equipment, vault, affix v2, PORTAL CHAMBER,
  bestiary, records lever, chamber music, settings/ESC menu/remappable keybinds,
  XP-bar HUD). M3 leftovers still open: Q3/Q5 behind flags, CC0 art batch 1,
  one manual TM-8 tile-import check.
- M4 ROSTER COMPLETE + user reworks all landed (?v=m4d):
  * RANGER — bow + volley (unchanged).
  * WIZARD — frost bolt basic (pierce + slow); special = STORM BARRAGE: a held
    machine gun of BIG lightning balls (one per 90ms, dead straight, mpPerShot
    each, no pierce) where every ball that CONNECTS has a 22% PROC to summon a
    LIGHTNING BOLT onto the victim (area damage + sky-bolt VFX via
    RealmScene.lightningStrike; rider = proj.strike read in the shot overlaps).
    Staff carried UPRIGHT like a walking staff (weapons.frost.upright).
  * KNIGHT — BERSERKER: takes REAL damage now (hp/def cut hard). Cleave (reach =
    whirlwind radius, comma VFX, swing anim) BANKS RAGE per enemy hit; RAGE
    replaced mana — molten-lava HUD orb (glowing, brighter as it fills), starts
    EMPTY, zero passive regen, whirlwind drains it + refuses at 0. Whirlwind
    LIFESTEALS (hpPerHit per enemy damaged per tick) + tornado procs.
  * "SWARMFRONT" — original frantic 8-bit BATTLE MUSIC in every realm (A minor
    172bpm, drive→build→peak→turnaround); cuts to silence when the fight is
    decided (boss down / horn / death). Chamber keeps its own calm track.
  * Class select on the TITLE SCREEN per slot; slot keeps its class through
    permadeath; all three open.
- Full battery GREEN on m4d: m4 18 · m4b 26 · m2 22 · m3b 24 · m3c 37.
- Audit bugs #7–#9 all FIXED (m4b); dead code swept.

THIS SESSION — options (my call at the top):
1. BALANCE THE ROSTER by playtest — knobs all in data.js, all marked TUNE ME:
   Knight: classes.knight (hp/def cuts), weapons.sword (dmg/range/rate/rageGain),
   abilities.whirlwind (mpDrainPerSec/tickMs/dmg/radius/hpPerHit + .tornado).
   Wizard: abilities.barrage (mpPerShot/fireEveryMs/dmg + strike chance/dmg/radius).
   M4 human gate = all 3 classes clear realm-1 + testers disagree on the best.
   Maybe class-flavored items (drop tables are still all bows/quivers — reads
   odd on the caster and the melee bruiser).
2. TEST DEBT: m1 / m21 / m3 suites still crash on RETIRED flows (old pause-menu
   ArrowLeft volume + `q`-to-nexus, replaced by the unified ESC menu at m3o).
   Proven m3o drift, NOT the roster. Port them to the m3o menu model, then
   re-establish the full green battery. ALSO still TODO: a permanent
   m3d/settings suite (menu, audio split + migration, rebind persistence,
   auto-fire checkbox, XP-bar HUD).
3. M3 leftovers: Q3 (XP-gems trial) + Q5 (realm-buff picks) behind data.js
   flags; CC0 art batch 1 (hero + 4 mobs + tileset — asset sourcing + license
   logging, bigger task).

PROCESS (non-negotiable, enforce it on yourself):
- Balance numbers ONLY in data.js. Respect the sim/presentation seam
  (ARCHITECTURE.md §4) and the save rules (§6 — bank + persist BEFORE any
  screen; account/vault survive death, character/equipment die; a slot KEEPS
  its class across permadeath).
- Headless suites for anything new + run all existing suites (NODE_PATH to a
  global playwright install; PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers; stage
  game/lib/phaser.min.js too if rebuilding the container copy).
- Bump ?v= in game/index.html (currently m4d) on any js change.
- Tick MILESTONES.md boxes, append an EVENT_LOG.md entry, update project memory,
  rewrite docs/NEXT_SESSION.md for the session after, and commit every changed
  file back to my disk. I run 2_SAVE_AND_UPLOAD.bat myself.
- COPYRIGHT: music/art requests naming existing games get an ORIGINAL piece
  chasing the same feel (precedent: chamber + battle themes, both original).

Known gotchas are in project memory. Suite-specific ones: champion mobs can
EVOLVE on a test hit (HP jumps UP) — clear m.mob.affix + set evolved=true +
reset hp for deterministic damage checks; MP regen clamps st.mp to the class
cap every frame (set test mp BELOW cap; pass dt=0 to updatePlayer for
exact-cost assertions); auto-fire aims at the LIVE cursor in screenshots —
page.mouse.move first or disable settings().autoFire.

Start by reading the docs listed above, then give me a short plan and get to work.
```

---

Manual items still on ME (Red), any time:
- PLAY ALL THREE (?v=m4d) and judge the reworks:
  * KNIGHT: does the berserker loop feel good — cleave to build rage, spin to
    shred + heal, rage runs dry, cleave again? Is he too fragile now, or does
    the lifesteal carry it? Does the molten rage orb READ at a glance?
  * WIZARD: does the storm barrage feel like a machine gun? Do the lightning-
    bolt procs land often enough to feel electric (22%)? Balls big enough?
  * Battle music: does "Swarmfront" build the panic without wearing you out?
    Does the cut-to-silence on the kill land?
- Dev self-test of the M2.1 flow (chest / scouter / orbs / time trial) — closes M2.1.
- FUN GATE 1: hand the game to a friend who didn't watch it being built, 20+ min,
  log per TESTING.md §3 — closes M2/MVP.
- M3 GATE: bank an item in the vault (V in nexus), die or re-enter, confirm it
  survived; playtest a builder-painted map. Log it.
- One manual TM-8 check: IMPORT TILES in the map builder with a real image file.
- Run 2_SAVE_AND_UPLOAD.bat — GitHub is still at m3q; m4a/m4b/m4c/m4d and all
  doc updates are waiting to be pushed in one go.
