# MILESTONE TRACKER

> The single source of truth for "where are we." Update the Status column and the
> checkboxes as work lands; every status change also gets an EVENT_LOG.md entry.
> Rule: a milestone is DONE only when its exit gate passes — not when its features exist.

Legend: ✅ done · 🔨 in progress · ⬜ not started · 🧊 icebox

| M | Name | Status | Exit gate | Gate result |
|---|------|--------|-----------|-------------|
| M0 | Skeleton | ✅ 2026-07-11 | Boots from double-click; nexus→portal→realm→death loop playable with chaser + shooter mobs | PASSED — verified in headless browser + screenshots this session |
| M0.5 | Welcome screen & save slots | ✅ 2026-07-11 | Title screen with 3 independent slots; save survives reload; permadeath written to disk at death; headless TM-4 suite green | PASSED — 9-step headless suite + death-path suite, zero console errors |
| M1 | Feel pass | ✅ 2026-07-11 | Self-test: dev voluntarily plays 3 consecutive realms | PASSED — dev self-tested same day ("testing looks good"), played 3+ realms voluntarily; found bug #3 (fullscreen) during the test, fixed same day |
| M2 | First Fun (MVP) | 🔨 2026-07-11 | FUN GATE 1: outside tester, 20+ min unprompted, asks a progression question | all feature boxes landed + 19-check headless suite green; GATE PENDING — needs an outside tester |
| M2.1 | Emergent scope patch (user directive 2026-07-12) | 🔨 2026-07-12 | Headless suites green incl. new checks; dev self-test of chest/scouter/orbs/time-trial flow | ALL phase-1 features landed same day; suites green (M1 23 + M2 22 + M2.1 18 checks); DEV SELF-TEST PENDING |
| M3 | World, loot & MAP BUILDER | 🔨 2026-07-12 | Tester banks an item in the vault and returns to a realm; a realm map painted in the in-game builder is playable | Map-builder half LANDED · equipment/vault/affix-v2 half LANDED same day (118 headless checks green across 6 suites) — BOTH gate clauses now humanly achievable; gate itself needs the human playtest |
| M4 | Roster (3 classes) | ⬜ | All classes clear realm-1 boss; testers disagree on the best class | — |
| M5 | Content ramp | ⬜ | FUN GATE 2: 3 testers, median session ≥30 min, a death that causes "one more run" | — |
| M6 | 1.0 polish | ⬜ | 1.0 checklist 100%, zero P0 bugs for 7 days of play | — |

---

## M0 — Skeleton ✅ (2026-07-11)

- [x] Phaser 3 project boots from file:// double-click (procedural textures, CDN engine)
- [x] Scene flow: Boot → Nexus → Realm → (death) → Nexus
- [x] Ranger: WASD move, mouse aim, auto-fire (T toggles), SPACE piercing volley (MP cost)
- [x] Chaser mobs ×2 variants (slime, brute)
- [x] Shooter mobs ×2 variants (single-shot spitter, 3-spray warlock)
- [x] Wave director with escalating spawn budget + off-screen ring spawning
- [x] XP → level (cap 20) with auto stat growth (HP/MP/ATT/DEF/SPD/DEX)
- [x] HP/MP/XP HUD, level + kill counter + realm timer
- [x] Contact damage, projectile damage, DEF reduction, i-frames flash
- [x] Death → recap → nexus with fresh level-1 character (graveyard counter)
- [x] Object pooling for mobs + projectiles
- [x] Sim/presentation seam respected (see ARCHITECTURE.md §4)
- [x] Basic juice: hit flash, knockback, damage numbers, screenshake on player hit

## M0.5 — Welcome screen & save slots ✅ (2026-07-11)

Pulled forward from M2 by user decision (2026-07-11): a proper front door before the feel pass.

- [x] `save.js` module: versioned schema v1 (ARCHITECTURE.md §6), migrate-or-flag-corrupt on load (TM-4)
- [x] TitleScene: 3 save slots, each a FULL separate account (character, vault, graveyard, records)
- [x] Slot cards: class/level/best/deaths/last-saved · NEW GAME / CONTINUE · two-click DELETE (no browser dialogs)
- [x] Keyboard slot select (1/2/3) · ESC in nexus returns to title (switch slots without reload)
- [x] Autosave on: nexus arrival, realm entry, level-up, death
- [x] Permadeath written to the save AT death (closing the tab on the death screen can't resurrect)
- [x] Corrupt-save detection: flagged on the card, deletable, never crashes
- [x] Records live in the save: bestLevel, deaths, totalKills, realmsEntered
- [x] Headless verification: 9-step slot suite + death-path suite, zero console errors

## M1 — Feel pass ✅ (2026-07-11)

- [x] Tuning sweep via data.js: player spd 170→180, bow rate 1.5→1.7, slime spd 95→100, brute contact 18→16, spitter cd 1400→1300, warlock proj 200→190, knockback 140→160, spawn interval 2400→2200
- [x] Hitstop (2–3 frames) on player-shot impacts (`DATA.juice`, cooldown-limited so auto-fire can't lock the game)
- [x] Particle bursts on mob death (tinted per mob via `deathTint` in data.js); portal swirl (title + nexus)
- [x] SFX: generated chiptune set in NEW `game/js/audio.js` (shoot, volley, hit, die, hurt, level-up, portal, death, ui) — recipes are data in `DATA.audio`; volume control in pause menu (LEFT/RIGHT), persisted
- [x] Auto-fire polish (T state persists across realms/sessions via settings), pause menu (ESC: resume/volume/Q-to-nexus), fullscreen toggle (F)
- [x] Death recap upgraded: cause of death (incl. WHOSE bolt), time survived, kills, run vs account records
- [x] EXIT GATE: dev voluntarily plays 3 consecutive realms — PASSED 2026-07-11 (dev self-test; surfaced fullscreen bug #3, fixed same day: RESIZE scaling + P pause key)

## M2 — First Fun = MVP 🔨 (features landed 2026-07-11 — Fun Gate 1 pending)

- [x] Kill quota → boss portal spawns in realm (`DATA.realm.killQuota` = 150, tunable for Q4; HUD shows Kills n/150)
- [x] Boss 1 "The Grovekeeper" (Lane-A art): 2 attack patterns — 24-bolt radial burst + 7-shot aimed stream — data-driven in `DATA.bosses`; boss HP bar; slow chase
- [x] Realm close reward: guaranteed random stat potion + 350 bonus XP → REALM CLOSED screen → nexus (reward persisted BEFORE the screen)
- [x] Stat potions drinkable in nexus (+5 to a stat, respects caps — `SIM.statsFor`; capped drinks are refused, not wasted). Stash lives on the ACCOUNT (survives death); drunk pots live on the CHARACTER (die with it) — R5
- [x] Permadeath per Q1 + graveyard view (G in nexus: last 10 dead characters w/ level+killer, full records)
- [x] localStorage account save/load, versioned schema — LANDED EARLY at M0.5 (2026-07-11)
- [x] Graveyard/records data shown somewhere richer than the title card (full page is M6)
- [x] Save schema v1→v2 migration (potions fields) — first real TM-4 migration, verified lossless headless
- [ ] FUN GATE 1 playtest executed + logged in TESTING.md results ← **the only open item — needs an outside human**

## M2.1 — Emergent scope patch 🔨 (2026-07-12, user directive — MECHANICS_MANIFESTO Part 4)

> Rides alongside M2: it does NOT close M2 (Fun Gate 1 still needs an outside
> human) — it changes what that tester will see. E# refers to Part 4 of the manifesto.

- [x] E8 — Archer bow fix: bow sprite exists, held by the Ranger, aligns to the aim direction; body facing follows aim not movement (TM-1)
- [x] E4 — HUD overhaul: Diablo-style HP/MP orbs flanking a central action bar (ability + XP); old bars retired
- [x] E2 — Boss room access: portal-open mob-destruction wipe ("THE PORTAL'S ROAR ANNIHILATES THE SWARM") + director stands down (Q7 default)
- [x] E3 — Boss intro scouter: workup-sheet overlay on boss-room entry — raw stats, boss visual readout, per-pattern tactical hints; combat holds until dismissed
- [x] E1 — Loot chests: boss drops a chest; SPACE (contextual, Q6) opens it; PoE2-style selection overlay lists contents (potion + XP at M2.1); realm closes after looting
- [x] E5 — Nexus portal plaza: pedestal-per-destination portal display (realm · time trial · sealed slots for future realms)
- [x] E6 — Time-trial survival mode: 5:00, boss-free, survive to win, guaranteed potion + reduced XP (Q8)
- [x] E7 — Biome data structure: `DATA.biomes` owns mob rosters; wave director reads the realm's biome, not the global mob list (in-biome cheap-fallback too)
- [x] E9 — Affix engine v1: data-driven mob affixes applied at spawn; Tanky + Speedy champions LIVE (tinted, scaled, bonus XP); Projectiles Split / Evolutions / Role Distribution defined in data but gated to M3
- [x] Headless: NEW `test/m21_suite.js` (18 checks) + m2_suite reworked for the chest/scouter flow (22) + m1 regression (23) — ALL GREEN, zero console errors (2026-07-12)
- [ ] EXIT GATE: dev self-test of the chest/scouter/orbs/time-trial flow ← **the open item**

## M3 — World, loot & map builder 🔨 (map builder + equipment/vault/affix-v2 landed 2026-07-12)

> DECISION 2026-07-11: Tiled (external editor) is RETIRED. Maps come from an
> IN-GAME MAP BUILDER — a developer-tool scene inside the game itself.

- [x] Map Builder scene (dev tool, **M** in the nexus): tile palette, paint/erase/rect-fill, layers (ground/walls/decor), object layer (player start, mob spawn zones, boss arena), pan/zoom, playtest button (2026-07-12; NEW `builder.js`)
- [x] Tileset sources, both from day one: procedural sets (Lane A — grasslands + stonehold in `DATA.tilesets`/textures.js) AND an Import button accepting png/jpg/gif/webp/bmp, sliced to the 16×16 grid and EMBEDDED in the map JSON so file:// keeps working (imports logged in ASSET_CREDITS.md — the builder reminds you). *Import needs one manual test with a real image (TM-8)*
- [x] Map save format: JSON in localStorage (`srb_maps`, via NEW `maps.js` only) + export/import as file; the realm loader reads the SAME JSON — walls get merged static bodies that block movement AND shots; spawn zones steer the wave director; the boss arena hosts the fight (2026-07-12)
- [x] Realm 1 rebuilt on a builder-made map with a real tileset: built-in `realm1` (150×150, authored in the builder's format — rock border, rock/hedge cover, pond, dirt clearings, decor, NE boss arena); a builder-saved map under the same id overrides it (2026-07-12)
- [x] START_SERVER.bat flow documented for asset loading — NOT currently needed: imported tiles are embedded in the map JSON, so maps keep working from a double-click; the server stays for future file-based sprite/atlas batches (ASSET_PIPELINE.md §3 note, 2026-07-12)
- [x] Equipment: weapon/ability/armor/ring slots, T0–T3 tiers (16 items), drop tables in data.js — boss/trial chests (E1) are real item-selection moments: TAKE equips (persisted pre-screen), occupied slot swaps back into the chest row, ENTER takes upgrades & closes; gear applies AFTER the cap clamp so it matters at level 20; save schema v2→v3 — equipment dies with the character, lossless TM-4 migration + unknown-key sanitizer (2026-07-12)
- [x] Nexus vault (8 account slots — SURVIVES DEATH), click-to-swap UI at the vault chest (V or click): bank equipped ↔ equip banked, in-place swap, full-vault guard, every change persisted (2026-07-12)
- [x] Affix engine v2 (E9, absorbs the old "elite mob modifier" item): SPLITTING (shooters only; bolts fork mid-flight, children never re-split) · EVOLVING (one-time mid-fight evolution on surviving a hit) · PACK LEADER (director skews to casters while one lives) · affixed mobs drop better: champion kills add capped CHAMPION BOUNTY rolls to the boss chest (2026-07-12)
- [x] Champion nameplates (user review, 2026-07-12): affixed mobs carry a floating affix-name tag in the affix color — created at spawn, follows the mob, cleared on every kill path
- [x] SPACE-activated plaza portals (user review, 2026-07-12): walk-in retired; a screen-clamped prompt at the nearest portal + SPACE commits — the M5 map-affix roll will surface in this same pedestal moment
- [ ] XP gems trial behind flag (Q3) · realm-buff picks behind flag (Q5)
- [ ] CC0 art batch 1: hero + 4 mobs + tileset (credits logged)

## M4 — Roster ⬜

- [ ] Wizard (staff pierce-shot, AoE nova ability), Knight (short-range high-dmg, shield ability)
- [ ] Class unlock chain + class-select UI in nexus
- [ ] Per-class stat caps in data.js; balance pass

## M5 — Content ramp ⬜

- [ ] Biomes 2–3 (built in the map builder), distinct mob rosters (~12 mobs total) — E7: every mob variant/archetype attaches to a dedicated biome for environmental identity
- [ ] Dungeons 1–2: portal drops from elites, handcrafted builder maps, dungeon bosses
- [ ] Bosses 2–5 across realms/dungeons — scouter workup sheets (E3) data-driven per boss
- [ ] T4–T6 gear; breakables + field chests (E1 overlay reused)
- [ ] Map affixes (E9): rolled at the portal plaza, displayed on the pedestal before entry — Apex Predators (double boss), Escalating Threats (elite spawns), Hordes (spawn density)
- [ ] More stage objectives/modes (E6) beyond time trial, per Fun Gate 2 appetite
- [ ] Blender MCP experiment: 1 hero or boss rendered to spritesheet (ASSET_PIPELINE.md §4)
- [ ] FUN GATE 2 executed + logged

## M6 — 1.0 polish ⬜

- [ ] Settings: volume, screenshake, casual-mode (if Q1 demanded it)
- [ ] Save export/import as file
- [ ] Records page: graveyard, bests, totals
- [ ] Audio pass, perf gate (300 mobs/200 projectiles @60fps), cross-browser sweep
- [ ] ASSET_CREDITS.md complete license sweep
- [ ] Player-facing README section; tag v1.0 via 2_SAVE_AND_UPLOAD

## Icebox 🧊 (post-1.0, in rough order)

Multiplayer spike (Node+WebSocket, ARCHITECTURE.md §4) · weapon/ability evolutions (V5) ·
more classes · fame/stars · pets · Phaser 4 migration · Steam wrapper (Electron/Tauri) if ever desired.
