# SUPER RPG BROS (working title)

*A browser bullet-hell horde game: Vampire Survivors swarms × Realm of the Mad God progression.
Solo, for fun, no shop — ever.*

## ▶ Play it right now

**Double-click `game/index.html`.** That's it (engine is vendored — works fully offline;
maps and imported tiles are embedded in JSON, so even the M3 map era still works from a
double-click — `START_SERVER.bat` waits for future file-based sprite batches).

You'll land on the **welcome screen**: pick one of **3 save slots** (click, or press 1/2/3).
Each slot is a completely separate account. DELETE asks twice. Saves live in your browser.

Controls (every one **remappable in Settings**, each with a primary + alternate slot — WASD ships
arrow-key alternates): **WASD** move · **mouse** aim (your Ranger and bow FACE where you aim) ·
auto-fire is ON (now a **Settings checkbox**, not a key — flips live mid-run) · **SPACE** volley
ability — or, near a chest or station, **SPACE interacts** · **ESC opens the menu everywhere**
(Resume · Settings — split MUSIC + SFX volume/on-off, auto-fire, keybinds · Exit; realms add
"Return to chamber"; in fullscreen a single ESC tap opens the menu, HOLD ESC to leave fullscreen —
that trick needs `START_SERVER.bat`/localhost; plain file:// may still drop out) · **F** fullscreen
(fills the whole screen — you see more of the realm) · **F3** debug overlay · click a potion in the
stash to drink it. In the **PORTAL CHAMBER** (the nexus) hotkeys **walk you to the station** and
open it: **P** the **PORTAL MACHINE** (pick a mode, slot map affixes (preview), **POWER THE
PLATFORM**, watch the works charge — pulses race the conduit, the ring ignites, the portal rises
out of the floor — then SPACE to step through; one-shot, the works go dark behind you) · **V** the
**VAULT** · **B** the **BESTIARY** (live mob/boss codex) · **R/G** throw the giant **LEVER** that
flips the records **wall screen** between account records and the graveyard (the glass types itself
out; walk to the screen + SPACE for the full records page) · **M** opens the **MAP BUILDER** (dev
tool — paint layers, drop spawn zones & a boss arena, PLAYTEST ▶). The chamber has its own music —
"The Chamber at Rest," an original chiptune.

Current build (**?v=m3q**): **M2 "First Fun" + M2.1 scope patch + M3 nearly complete: MAP BUILDER,
EQUIPMENT, VAULT, the full AFFIX ENGINE, the PORTAL CHAMBER (portal works + machine, bestiary,
records wall & lever, chamber music) and SETTINGS/ESC MENU/REMAPPABLE KEYBINDS all landed**
(M2's exit gate — Fun Gate 1, an outside tester — is still pending).
Realms run on **painted maps**: real walls that block movement and shots, spawn zones, and a boss arena
the portal delivers you to — realm 1 ships as a builder-format map you can repaint (press **M** in the
nexus). **GEAR IS REAL now**: 16 items across T0–T3 (weapon/ability/armor/ring — gear pushes stats PAST
the caps), the boss chest is a true PoE2-style pick (**TAKE** equips on the spot, swap freely, ENTER grabs
upgrades), and the nexus **VAULT (V)** holds 8 items that **SURVIVE DEATH** — bank your best find before
you die with it. The loop: welcome screen + 3 save slots → the **PORTAL CHAMBER**
(one platform, an energy conduit, and the **PORTAL MACHINE** that powers it: configure the run — realm clear ·
**5-minute TIME TRIAL** — slot preview affixes, and CHARGE the platform to raise your one-shot portal) → escalating swarms with **champions** (each wears a
floating **nameplate** in its affix color): TANKY / SPEEDY / **SPLITTING** (bolts fork mid-flight) /
**EVOLVING** (kill it before it turns) / **PACK LEADER** (the swarm goes caster) — every champion kill
adds a **BOUNTY roll** to the boss chest → **150 kills → the portal's
roar ANNIHILATES the swarm → boss portal → scouter threat-analysis workup (stats + moveset hints) → The
Grovekeeper → it drops a CHEST: stat potion + XP + rolled gear** → drink potions in the nexus (+5, account
stash survives death, drunk pots + equipped gear die with the character) → permadeath → graveyard
(lever **G** on the records wall). **Diablo-style HP/MP orbs** flank a segmented gold **XP bar**
(the old action box is retired — the orbs and the bar are the whole bottom HUD). M1 gave it feel:
chiptune SFX (now split MUSIC/SFX buses), hitstop, particles, the ESC menu, fullscreen. Your
account only moves forward.

## 📁 What's in this folder

| Path | What it is |
|------|-----------|
| `game/` | The game. `index.html` + `js/` (data, save, binds, audio, sim, maps, textures, entities, menu, scenes, builder, main) |
| `docs/MECHANICS_MANIFESTO.md` | Both games dissected mechanic-by-mechanic + the 10 Fusion Laws that define THIS game |
| `docs/PRODUCT_PLAN.md` | The wargamed strategy (3 COAs + red-team), stack, MVP definition, road to 1.0, risks, alignment table |
| `docs/MILESTONES.md` | **The tracker.** M0–M6 with checkboxes and exit gates. M0–M1 ✅ · M2/M2.1 features in (human gates pending) · M3 nearly complete (map builder + equipment + vault + affix v2 + portal chamber + settings/keybinds landed) |
| `docs/TESTING.md` | Test modules TM-1…TM-9 + the fun-alignment playtest protocol and logs |
| `docs/ASSET_PIPELINE.md` | Art without being an artist: procedural → CC0 packs → in-game map builder → Blender MCP spritesheets |
| `docs/ARCHITECTURE.md` | Code map, data-driven rules, and the multiplayer seam rules |
| `docs/EVENT_LOG.md` | Append-only history of every feature/decision. Newest on top |
| `docs/NEXT_SESSION.md` | The copy-paste prompt to start the next work session in a fresh window (rewritten at each session end) |
| `ASSET_CREDITS.md` | One line per imported asset (empty until M3 — everything is procedural today) |
| `START_SERVER.bat` | Local server for the M3+ asset era |
| `0–4_*.bat`, `README_HOW_TO_USE.md` | Your existing two-person git workflow (unchanged) |
| `_to_delete/` | The abandoned Project 7 spec, parked for deletion |

## 🔁 The loop (how we work)

1. Open `docs/MILESTONES.md`, pick the next unchecked box in the current milestone.
2. Build it (placeholder art first — always). Balance lives in `game/js/data.js`.
3. Tick the box, append an entry to `docs/EVENT_LOG.md`. If any game js changed, bump the
   `?v=` cache-buster in `game/index.html` (bug #4 — stale browser cache = black screen).
4. Playtest per `docs/TESTING.md`. Milestones only close when their exit gate passes.
5. `2_SAVE_AND_UPLOAD.bat`.

## 🧭 Where this is going

M1 ✅. Still open: close **M2 "First Fun"** — every feature is in; the gate is **FUN GATE 1**: hand the
game to a friend who didn't watch it being built, say only the controls, watch 20 minutes (TESTING.md §3).
**M3** is nearly complete: the in-game **map builder**, **equipment** (T0–T3, real chest choices), the
**vault** (8 slots, survives death), the full **affix engine**, the whole **PORTAL CHAMBER** (works +
machine, bestiary, records wall, music) and **settings/menu/remappable keybinds** all shipped; left in
M3: Q3/Q5 experiment flags + the first CC0 art batch (+ fold the m3o/m3p smoke checks into the
numbered suites and re-run the 143 battery on m3q). 1.0 = **M6** (3 classes, 3 biomes, 2 dungeons, 5 bosses,
gear T0–T6, vault, records, full art & audio pass).
Multiplayer is deliberately out of 1.0 but the code is shaped for it (`docs/ARCHITECTURE.md §4`).
