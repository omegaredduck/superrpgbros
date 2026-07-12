# NEXT SESSION — copy-paste prompt for a fresh window

> Rewritten at the end of each work session so the next one starts cold with zero
> ramble. Copy everything inside the block below into a new Claude window (with the
> "super rpg bros" folder connected).

---

```
We're continuing work on my game in the connected "super rpg bros" folder
(project memory has the standing decisions — read it, plus docs/MILESTONES.md
and the top entry of docs/EVENT_LOG.md, before writing any code).

WHERE THINGS STAND (as of 2026-07-12, build ?v=m3o):
- M0–M1 done. M2 + M2.1 features all landed; their gates are HUMAN gates
  (my dev self-test + an outside tester for Fun Gate 1) — don't wait on them.
- M3 features done (map builder, equipment, vault, affix engine v2,
  champion nameplates). NEW this session — M3.5 THE PORTAL WORKS: the
  pedestal plaza is GONE. One platform at the heart of the nexus, an
  energy conduit, and the REALM CONSOLE that visibly POWERS it. Console
  = mode select + sealed future-realm rows + map-affix board + POWER THE
  PLATFORM. Spawn plays a ~2s cinematic (console flare → conduit pulses →
  8 ring lights ignite in the mode color → portal tears open); powered
  state keeps pulses flowing until entry; ONE-SHOT consumed on entry and
  the works go dark. Affixes (apex/escalating/hordes) are PREVIEW-only:
  visible everywhere (board [x], signpost label, SPACE prompt, realm HUD)
  but INERT until DATA.console.live flips at M5. Timings in
  DATA.juice.conduit. consoleSpawnPortal(instant=true) skips the
  cinematic (registry rebuilds + all suites' realm entry). COLOR PASS:
  the portal texture is neutral greyscale, always tinted by purpose —
  realm clear = PORTAL GREEN (DATA.modes.clear.color, Rick&Morty style,
  user call: blue-on-blue was unreadable), trial gold, boss portal true
  red. SOUND/RISE/LIGHT pass: electricity charge + phaser spawn SFX,
  portal rises out of the platform floor, NO text inside the frame (the
  page footer says SPACE to interact; console brightens in range), room
  is the PORTAL CHAMBER (glowing title, well/console glow pools as in-map
  lighting, white-on-shadow header). M3.6 BESTIARY: green terminal
  mirroring the vault (right wall), browsable mob/boss pages read LIVE
  from DATA.mobs/DATA.bosses (new creatures appear automatically); green
  station-label pass (VAULT (V)/BESTIARY/REALM CONSOLE above objects, no
  counters/headers). M3.7 RECORDS SCREEN: the floating account header is
  GONE — a wall monitor under the title shows the live readout (NO slot
  number by design, auto-fit text); the graveyard merged in as the
  RECORDS page (click / SPACE at the screen). Console renamed PORTAL
  MACHINE (P); labels advertise hotkeys. M3.8 CHAMBER-ALIVE: records
  glass BOOTS (login = empty → letters type out w/ cursor; realm return
  = numbers ramp slow→fast, cubic ease-in; knobs in DATA.juice.records);
  GIANT metal LEVER (SPACE throws it in range; floating (R)/(G) chip shows the flip key; click walks you over) + wire (3-pulse burst on flip ONLY) swaps records (R) / graveyard
  stats (G) pages, re-typing per flip (page survives resize via
  registry); WALK-TO-INTERACT — V/B/P/R/G + clicks walk the character
  to stand below the station THEN open (manual input cancels; open
  window + same hotkey = instant close). NexusScene knows its entry
  (login/realm/none via scene.start data). 142 headless checks green
  across 6 suites, ×3 batteries. GOTCHA added to the book: looped
  Phaser timers CATCH UP on the slow headless clock — guard callbacks
  against firing after their own cleanup. Flakes: none seen in the
  final 3 batteries; if they return they cluster in timer sections.
  M3.9 CHAMBER MUSIC (?v=m3n): chiptune sequencer in audio.js + "The
  Chamber at Rest" (original 8-bit loop, plays only in the chamber).
  M3.10 SETTINGS · ESC MENU · KEYBINDS (?v=m3o, NEW binds.js + menu.js):
  ESC no longer exits fullscreen (main.js keyboard-locks Escape; only F
  toggles fullscreen); split Music + SFX volume each with on/off; ONE ESC
  menu in chamber AND realms (Resume · Settings · Exit to load screen;
  realm also Return to chamber); Settings has the audio sliders + a
  remappable KEYBINDS list (13 actions, event.code, live-updates the (P)/
  (V)/(B)/(R)/(G) labels + HUD + footer). VERIFIED via a one-off container
  smoke test 13/13, zero console errors — but NOT folded into the numbered
  suites and the 143 battery has NOT been re-run on m3o (do that first).
  CAVEAT: the fullscreen fix needs a secure context — run via
  START_SERVER.bat (localhost); file:// may not grant Keyboard Lock.

THIS SESSION — close out M3, then start M4 if time:
0. VERIFY m3o: re-run the 143-check battery (?v=m3o) + add an m3d/settings
   suite (menu opens chamber+realm, audio split + migration, rebind
   updates labels + persists). Then continue below.
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
- Bump ?v= in game/index.html (currently m3n) on any js change.
- Tick MILESTONES.md boxes, append an EVENT_LOG.md entry, update project
  memory, rewrite docs/NEXT_SESSION.md for the session after, and commit
  every changed file back to my disk. I run 2_SAVE_AND_UPLOAD.bat myself.

Known gotchas are in project memory (Phaser scene-instance reuse, listener
stacking — includes once()/ENTER rewiring on overlay rebuilds, RESIZE
scaling, ?v= cache, bug #5: arcade collider callbacks between a dynamic and
a static group arrive (staticChild, dynamicChild) — identify by tag, never
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
- M3 GATE: bank an item in the vault (V in nexus), die or re-enter, confirm it
  survived; playtest a builder-painted map. Log it.
- PLAY THE PORTAL CHAMBER (?v=m3n, MUSIC ON — sound ON — log in fresh to see the glass type itself out, exit a realm to watch the numbers fly, flip the lever, and let a hotkey walk you across the room): walk to the console, slot affixes, POWER THE
  PLATFORM, watch the charge-up, step through — does it feel right? (Your redesign
  — judge the cinematic timing especially; knobs in DATA.juice.conduit.)
- One manual TM-8 check: IMPORT TILES in the map builder with a real image file.
- Run 2_SAVE_AND_UPLOAD.bat to push the Portal Chamber build (?v=m3n).
