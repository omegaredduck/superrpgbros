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
| M4 | Roster (3 classes) | 🔨 2026-07-13 | All classes clear realm-1 boss; testers disagree on the best class | ALL 3 CLASSES LANDED + same-day user reworks (?v=m4d) — Ranger · Wizard (frost pierce+slow · STORM BARRAGE lightning-ball machine gun w/ strike proc) · KNIGHT (BERSERKER: cleave builds molten RAGE, lifesteal whirlwind + tornados, takes real damage). Title class-select + per-class caps + original realm BATTLE MUSIC. m4 18/18 + m4b 26/26 green. USER PLAYTEST 2026-07-14: pre-m4q build "perfect" — models/train yard/hi-fi APPROVED; balance notes delivered + applied at m4q. Human gate (all 3 clear realm-1) still open |
| M4.6 | Balance & gear rework (user directives 2026-07-14) | ✅ 2026-07-14 | Suites green; user feel-notes applied | SHIPPED ?v=m4q — SIX rarity tiers (grey→white→green→blue→purple→ORANGE legendary, very rare) · CLASS-LOCKED gear lines (staves/tomes · greatswords/war horns · bows/quivers) w/ class-filtered drops + vault lock + v4 save migration · Ranger FIRE VOLLEY (burn DoT) + yellow ENERGY (regen 10/s) · knight/wizard +30% mob / +60% boss damage taken · barrage 2.5→1.25 MP/ball · XP REWORK: cap 60, ~1 level per map, growth ×19/59 |
| M4.7 | THE CONDUCTOR + the living yard (user directives 2026-07-14) | ✅ 2026-07-14 | Suites green incl. new m47 battery | SHIPPED ?v=m4q — THE CONDUCTOR boss (user pick #6 "GRIM LINE", doubled pocket watch) replaces Grovekeeper in the yard (treant kept for a future map): Styx Express ARRIVAL CINEMATIC, ghost tracks + GHOST EXPRESS (one-shots the ungeared), railroad-tie lobs, pocket-watch SCHEDULE slow, lantern sweep · train CONSISTS (grain car + boxcar, 1 model × 4 recolors each, 2–15 cars, whole consist kills) · 8-mob YARD ROSTER from the user's sheet incl. detonating Dynamite Mole · biome-scoped bestiary |
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
- [x] REALM CONSOLE (user decision, 2026-07-12, ?v=m3d): the plaza boots EMPTY — one central console configures the run (mode select + map-affix board), SPAWN PORTAL materializes a ONE-SHOT portal on its pedestal (consumed on entry; survives resize restarts via registry; a new spawn replaces the old). Affix board is a PREVIEW: apex/escalating/hordes toggle visibly, ride the portal label + SPACE prompt + realm HUD, but stay INERT until DATA.console.live flips at M5
- [x] PORTAL WORKS (user redesign, 2026-07-12, ?v=m3e): pedestal plaza RETIRED — ONE platform at the heart of the nexus, an energy conduit, and the console that visibly POWERS it. Dormant / charging (~2s cinematic: console flare → conduit pulses → ring lights ignite in mode color → portal tears open) / powered (flowing pulses, breathing ring) states; sealed future realms are rows inside the console UI; timings in DATA.juice.conduit; consoleSpawnPortal(instant) for suites/registry rebuilds; COLOR PASS (?v=m3f): neutral portal texture always tinted by purpose — clear = PORTAL GREEN (DATA.modes.clear.color), trial gold, boss portal true red; SOUND/RISE/LIGHT pass (?v=m3g): electricity charge + phaser spawn sounds (audio.js noise layer, recipes in data), portal rises out of the platform floor, NO text inside the frame (prompts/labels/help removed — footer says SPACE to interact; console brightens in range), room renamed PORTAL CHAMBER w/ glowing title + well/console glow pools as in-map lighting, white-on-shadow header
- [x] BESTIARY (user ask, 2026-07-12, ?v=m3h): green terminal mirroring the vault (right wall, same height/edge spacing), green labels pass (VAULT (V)/BESTIARY/REALM CONSOLE above their objects; banked counter + POTION STASH header removed) — browsable pages for every implemented mob + boss, stats/abilities READ LIVE from DATA.mobs/DATA.bosses (new creatures appear automatically); ◀ ▶ or arrow keys, B/ESC closes
- [x] RECORDS SCREEN (user ask, 2026-07-12, ?v=m3i): floating account header RETIRED — a wall monitor under the title carries the live readout (class/level/deaths/best/closed/pots, NO slot number by design, auto-fit text); graveyard MERGED in as the RECORDS page (G, click, or SPACE at the screen)
- [x] Rename + hotkeys (user, 2026-07-12, ?v=m3j): REALM CONSOLE → PORTAL MACHINE with P hotkey; station labels advertise hotkeys — VAULT (V) · BESTIARY (B) · PORTAL MACHINE (P)
- [x] M3.8 chamber-alive pass (user spec, 2026-07-12, ?v=m3k): records glass BOOTS (login = empty → letters type out; realm return = numbers ramp slow-then-fast); unlabeled LEVER + live wire swaps records (R) / graveyard stats (G) readouts, re-typing on flip; WALK-TO-INTERACT — hotkeys/clicks walk the character to stand below the station, then open (manual input cancels); v2 (?v=m3l): wider glass + font 12, giant riveted metal lever, wire pulses ONLY on flip, R/G always walk to the switch; v3 (?v=m3m): SPACE throws the switch in range, floating (R)/(G) hotkey chip above it, click-to-walk confirmed
- [x] M3.9 CHAMBER MUSIC (user ask, 2026-07-12, ?v=m3n): chiptune sequencer in audio.js (songs = data, looped, failure-safe) + "The Chamber at Rest" — ORIGINAL calming 8-bit composition (Balamb Garden is copyrighted; user approved original fallback); plays only in the chamber, stops on portal/title/builder
- [x] M3.11 HUD XP BAR · AUTO-FIRE CHECKBOX · ALT KEYBINDS (user polish, 2026-07-12, ?v=m3p): bottom action box RETIRED — only a segmented XP bar (5 sections cut by blue dividers, gold fill, `xp / needed` centered) spans hpOrb→mpOrb; ability tile + level text dropped (user call: just the XP bar). Auto-fire is no longer a key — a GAMEPLAY checkbox in Settings (realm reads settings.autoFire live). Every keybind now has a PRIMARY + ALTERNATE slot (binds = {primary,alt}, migrated from m3o single-code); only WASD ships an alt by default (arrow keys). Rig polls both slots for movement + interact; Settings keybinds show two chips per row. VERIFIED smoke 21/21, zero console errors
- [x] M3.10 SETTINGS · ESC MENU · REMAPPABLE KEYBINDS (user ask, 2026-07-12, ?v=m3o; NEW `binds.js` + `menu.js`): (1) ESC no longer exits fullscreen — `main.js` keyboard-locks Escape (Keyboard Lock API, failure-safe; hold-Esc still exits), ONLY the fullscreen key (default F) toggles it; (2) split audio — separate Music + SFX buses each with volume + on/off (the on/off toggles are the "checkboxes"), old single volume migrated; (3) ONE ESC menu shared by chamber + realms (Resume · Settings · Exit to load screen; realm also Return to chamber); (4) Settings holds the audio sliders + a two-column KEYBINDS list (click a key → press to rebind → live-updates the (P)/(V)/(B)/(R)/(G) station labels, realm HUD, and footer; Reset keybinds). 13 rebindable actions stored as event.code; M + F3 fixed. VERIFIED headless 13/13, zero console errors — NOT yet in the numbered suites (m3d/settings TODO) and the 143 battery not re-run on m3o
- [ ] XP gems trial behind flag (Q3) · realm-buff picks behind flag (Q5)
- [ ] CC0 art batch 1: hero + 4 mobs + tileset (credits logged)

## M4 — Roster 🔨 (Wizard + class-select landed 2026-07-13)

- [x] WIZARD (user design 2026-07-13, ?v=m4a; special REWORKED same day, ?v=m4d):
      crowd-control caster. FROST BOLT basic — slower + harder than the bow,
      PIERCES the whole line and SLOWS what it touches (mob spd×mult for ms).
      STORM BARRAGE ability (replaced the homing storm orbs, user redesign) — a
      held MACHINE GUN of lightning balls: one every 90ms dead straight down the
      aim line, mpPerShot each, no pierce; every ball that CONNECTS can PROC a
      summoned LIGHTNING BOLT onto its victim (22% — area SIM.damage + sky-bolt
      VFX via lightningStrike). Staff carried UPRIGHT like a walking staff. Deep
      MP + regen, higher spell power, less HP than the Ranger. `wizard`/`staff`/
      `frostbolt`/`zapball` art. m4_suite 18/18 green.
- [x] KNIGHT (user design 2026-07-13, ?v=m4b; BERSERKER rework same day, ?v=m4d):
      MELEE bruiser — the roster's first non-projectile class. Basic = a curved
      CRESCENT CLEAVE (weapons.sword, `melee:true`, reach = the whirlwind radius,
      one-thick-comma VFX + sword swing anim) that carves a frontal arc AND BANKS
      RAGE per enemy hit (rageGain). Ability = WHIRLWIND, a HELD CHANNEL: spins
      draining RAGE, ticking AoE damage in a ring, HEALING per enemy damaged
      (hpPerHit lifesteal) and rolling a TORNADO proc that shoots outward +
      grinds enemies it laps. RAGE replaces mana: molten-lava HUD orb (glow scales
      with fill), STARTS EMPTY, zero passive regen, refuses the channel at 0.
      He takes REAL damage now (hp/def cut hard) — the lifesteal loop is the
      survival plan. `knight`/`sword`/`slash`/`whirl`/`tornado` art. m4b 26/26 green.
- [x] M4.5 — "SWARMFRONT" realm BATTLE MUSIC (user ask 2026-07-13, ?v=m4d):
      ORIGINAL frantic 8-bit composition (user wanted the FEEL of FF8's Don't Be
      Afraid — copyrighted, so original melody): A minor 172bpm, 64-beat loop,
      drive → rising build → frantic peak → turnaround. Plays in every realm;
      CUTS TO SILENCE when the fight is decided (boss down / horn / death).
      WAV preview delivered in chat.
- [x] Class-select UI (user call 2026-07-13): chosen ON THE TITLE SCREEN at NEW
      GAME (per save slot; the slot card shows the class; a slot keeps its class
      through permadeath — a fresh same-class character is born on death). BOTH
      classes open from the start. `SAVE.blank(cls)` + `freshCharacter(cls)` +
      `TitleScene.promptClass/pickClass/createNewGame`.
- [ ] Class unlock chain (deferred — both classes open until there are more to gate)
- [x] Per-class stat caps in data.js (Wizard caps distinct from the Ranger)
- [x] Balance pass ROUND 1 (2026-07-14, ?v=m4q — the user's playtest feel-notes,
      applied): Ranger FIRE VOLLEY (arrows ignite: ATT-scaled burn DoT on mobs
      AND the boss; ember tint; burn clocks ride unfreeze()) + ENERGY resource
      (yellow orb, regen 4→10 — "fast and spammy"); Wizard barrage 2.5→1.25
      MP/ball (spam runs twice as long); Knight + Wizard take +30% mob / +60%
      boss damage (classes.dmgTaken, applied in hurtPlayer before DEF — boss
      bolts/contact tagged fromBoss). XP REWORK: cap 20→60, needed=2000+25·L
      (~ONE LEVEL PER MAP, cap ≈71 maps), growth ×19/59 (level-60 = old
      level-20 power; potions+gear stay the post-cap game). Round 2 by playtest.
- [ ] M4 human gate: all 3 classes clear realm-1 (vs THE CONDUCTOR now)

## M4.6 — Six-tier class gear (user directives, 2026-07-14, ?v=m4q) ✅

- [x] SIX rarity tiers (user ladder): grey ABUNDANT · white COMMON · green
      UNCOMMON · blue RARE · purple EPIC · orange LEGENDARY (very rare —
      ~0.9%/roll boss-chest tail). Labels lead with the rarity word.
- [x] CLASS-LOCKED gear lines, no off-class drops: bows/quivers (Ranger),
      staves/TOMES (Wizard — mpPerShot efficiency), greatswords/WAR HORNS
      (Knight — whirlwind drain efficiency). 48 items total. Drop tables keep
      ranger keys as the weight template; SIM.resolveDrop remaps per class
      (same slot/tier, same RNG stream). Vault holds off-class gear but
      refuses to equip it (class tag shown). SIM.abilityFor generalized
      (floors: mpCost 4 · mpPerShot 0.5 · mpDrainPerSec 6).
- [x] SAVE v4 migration: item keys renumbered to match tiers (lossless remap);
      pre-lock off-class equipment REFLAVORS to the wearer's line (same
      slot/tier — a wizard's Oak Bow becomes her Ashwood Staff).

## M4.7 — THE CONDUCTOR & the living yard (user directives, 2026-07-14, ?v=m4q) ✅

- [x] THE CONDUCTOR (user model pick #6 "GRIM LINE" from a 10-option grid;
      pocket watch doubled on request): the train yard's boss. Grovekeeper's
      data KEPT for a future grasslands map (realm.boss now data-picks).
- [x] ARRIVAL CINEMATIC: the Styx Express steams into the nearest lane (camera
      pans to meet it; fresh ambushes gated), brakes, he steps off, the train
      departs → scouter → fight.
- [x] TRAIN VERBS (all scene-owned, all clocks on the unfreeze shift list):
      GHOST TRACK + GHOST EXPRESS (spectral consist, 200 dmg × boss mults —
      one-shots the ungeared, gear can survive it) · RAILROAD TIES (marked
      AoE lobs) · THE SCHEDULE (pocket-watch movement slow, player-side
      slowUntil/slowMult) · LANTERN SWEEP (rotating ghost-blue beam, tick dmg).
- [x] TRAIN CONSISTS: covered-hopper grain car + sliding-door boxcar (1 model ×
      4 recolors each, per user refs); ambush trains haul 2–15 mixed cars; the
      WHOLE consist kills/mows; pass timing accounts for the tail; ghost
      trains reuse the models (luminance-remapped spectral art).
- [x] YARD MOB ROSTER (user sheet): Coal Golem · Crossing Creep · Furnace Imp ·
      Boxcar Brute · Coupling Chomper · Conductor Zombie · DYNAMITE MOLE
      (detonate: his contact hit is his death, no XP) · Smog Serpent. New
      `trainyard` biome owns them; grasslands four kept for their future map;
      bestiary scoped to the realm's biome + all bosses.
- [x] Suites: full battery green (m2 · m3b · m3c · m4 · m4b) + NEW m46_verify
      (13→16 at m4.8) + m47_verify (15). m3c PORTED back into the battery (m4n drift fixed).

## M4.8 — Ranger dodge-regen + mob readability (user directives, 2026-07-14, ?v=m4r) ✅

- [x] RANGER DODGE REGEN (user: "regen when I'm dodging effectively", "slow to
      medium"): the pure-dodge class (dmgTaken 1x, no lifesteal) heals when
      untouched — cls.hpRegen { delayMs 2500, pctPerSec 0.03 } → 3% of MAX HP/s
      after a 2.5s clean window (~33s empty→full; tops off chip damage, won't
      out-heal a beating). Relative window off lastHitAt (no unfreeze shift).
      Ranger-only. Green aura + rising '+' motes VFX (RealmScene.updateRegenGlow,
      st.regenning). data.js + entities.js + scenes.js.
- [x] Mob readability: textures.js MOB_DISPLAY per-mob size override (default 40)
      — Furnace Imp 58, Crossing Creep 47; mobModel keeps body a constant
      fraction of the texture so the world hitbox scales with the sprite.
- [x] m46_verify extended to 16 (regen blocked-in-delay/heals/flag/off-at-full ·
      enlarged-mob scale+hitbox). Battery still GREEN.

## M4.9 — Map selector + living-yard mob mechanics (user directives, 2026-07-14, ?v=m4s) ✅

- [x] PORTAL MACHINE MAP SELECTOR: a dropdown (DATA.console.maps) — THE TRAIN
      YARD selectable, five greyed "??? — SEALED/LOCKED" placeholders until
      more maps are built. consoleSetMap/toggleMapDropdown (headless-callable);
      choice rides in cfg.map; REALM CLEAR detail shows the selected map name.
- [x] WIZARD out-of-combat regen (5s delay vs Ranger's 2.5s; same 3%/s). Regen
      aura tints by class accent (green/blue). Knight has none.
- [x] DYNAMITE MOLE = telegraphed bomb: surfaces on-screen, flashes under a
      blast-radius warning ring, LONG 3.8s fuse, then explodes an AoE that hits
      the player AND mobs (mob kills credited). BOOM sound + FIREBALL VFX +
      brief shake. Sparing (unlockAt 70 + maxConcurrent 2 + on-screen surface
      spawn). Shoot to defuse.
- [x] CONDUCTOR ZOMBIE: slow chaser (no shoot) dripping a short-lived (~2.4s)
      GREEN SLIME TRAIL that ticks damage on the player standing in it.
- [x] SMOG SERPENT: fog caster (no shoot) — 5s-on/5s-off cloud that CONCEALS
      mobs (itself too); shots pass through unless the player is inside the fog.
- [x] TRAIN MOWS now credit the player (kills/XP/quota) via killMobCredited.
- [x] Suites GREEN: +m3c map-dropdown checks · m46 16 · m47 18 (mole fuse/blast
      credit · zombie slime · serpent fog). All new clocks on the unfreeze list.

## M5.0 — THE GROVE (user directives, 2026-07-15, ?v=m5a) ✅

The second realm. All features landed + FULL BATTERY GREEN (m2 · m3b · m3c ·
m4 · m4b · m46 · m47 · **m5_grove_verify 28**); Balance Round = playtest.

- [x] REALM REGISTRY (DATA.realms) — portal cfg.map routes biome/boss/world-kind/music per destination; no-map starts stay the yard (suites unbroken)
- [x] THE GROVE on the portal machine (sealed1 → live) + bestiary follows the selected map
- [x] Grove world: grass/canopy tiles, HEARTWOOD, 14 decoration picks (of a 20-option sheet) hash-scattered, pulsing glowshrooms, wandering fireflies
- [x] FALLING ANCIENT TREES — creak+shadow telegraph → crush (mows CREDIT, player hurt survivable) → trunk LINGERS as a wall ~8s → crumbles; quiet while the boss lives
- [x] 8-mob roster (user picks + live reshapes): Moonmoth (fast squishy) · Puffcap (slow, splits into 10 recolored minis) · Pixie Trickster (blink shooter) · Bloom Pixie (glow trail resurrects corpses, death-bloom, summons Bumblebrutes) · Moss Golem (tank) · Seedling Turret (radial GOLD) · Snapdragon (aimed PINK) · Bumblebrute (SUMMON cast bar → 4 ward minis → IMMORTAL until they die)
- [x] Wing-flap animation (2-frame texture toggle): pixies, moonmoth, bumblebrutes + minis
- [x] Colored mob projectiles (neutral orbShot + data tints; pooled-shot tint leak fixed with clearTint-on-fire)
- [x] GROVEKEEPER rework — grows OUT OF THE GROUND on boss-portal entry (THE HEARTWOOD WAKES); verbs: TIMBER · THORN MORTAR (brier patches) · OVERGROWTH · SUNLANCE · SPORE SURGE; radial/stream reflavored PETAL BURST / NEEDLE VOLLEY; title WARDEN OF THE HEARTWOOD; new hints
- [x] PHASE TWO — first death summons 8 real pixie mobs that channel his resurrection (killable mid-channel = weaker revive, floor 30%); he rises enraged (spd ×1.15, patterns ×0.85); kill him TWICE
- [x] "HEARTWOOD" — original 8-bit theme (2 squares + 2 triangles), 3:00 loop, inspiring/magical; per-realm music routing
- [x] New SFX: creak · crash · chime · revive
- [x] unfreeze() shift list extended (blink/cast/summon/glow/tree/trunk/patch/corpse/revive-channel + all 5 verb clocks)
- [ ] HUMAN: playtest THE GROVE end-to-end (Balance Round — all numbers TUNE ME)

## M5.6 — THE GRAVEYARD (SHIPPED 2026-07-15 · ?v=m5f) ✅

Biome 3, designed end-to-end with Red (numbered sheets + question rounds), then
BUILT + shipped the same day. Full design: **docs/GRAVEYARD_PLAN.md**; build
notes in memory ([[graveyard-build-progress]]). THE GRAVEYARD is the third live
destination (console slot unlocked). Full battery green + smoke(15) + boss(12).

- [x] Theme + name: graveyard/ghost zombies → THE GRAVEYARD
- [x] 20-mob sheet (160×160 hi-fi) → roster of 8 picked: Ghoul · Rattlebones · Bone Archer · Tomb Golem · Corpse Bloater · Banshee · Mummy · Necro Acolyte (per-mob mechanic plans in the plan doc)
- [x] 20-decor sheet → 17 picked + PLANNED scene layout (gate → lantern path → 4 fenced plots → boss arena); gate AUTO-OPENS; iron fences DESTRUCTIBLE
- [x] Signature system: THE WITCHING CYCLE — witching fog + restless graves + soul wisps, conducted by the CURSED BELL (all four picked)
- [x] Boss: THE GRAVEKEEPER — Red's concept art canon, hi-fi sprite approved; grave-climb entrance; 5-wave immunity loop (−20% HP per cleared wave); REAPER'S MARCH one-shot walker; Necronomicon verbs (Explode Corpse · Bone Storm · Grasping Hands · Curse Sigils)
- [x] Music: "THE GRAVEYARD" — dark gothic metal, epic+frantic, 168bpm D harm-minor, 3:00 (v3; v1/v2 rejected). WAV delivered
- [x] BUILT (?v=m5f): art port (8 mobs + Gravekeeper 2× + Reaper + 17 decor + destructible-fence damage frames, horizontal + vertical top-view) → data rows → world/layout (S-path, auto-gate, solid destructible fences) → Witching Cycle (fog/graves/wisps/bell) → 6 new mob verbs (lunge/regen/deathGas/wail/contactCurse/raise) → the Gravekeeper (grave-climb, 5-wave immunity loop, Reaper's March, verbs) → chip music port (496 beats, equal) + belltoll/reaperdrone SFX → bestiary (pattern-note text-fit fixed) → tests (smoke 15 + boss 12) + FULL BATTERY GREEN + console slot unlocked + ?v= bump

## M5 — Content ramp 🔨 (grove = biome 2 ✅)

- [x] Biome 2: THE GROVE (procedural world + own 8-mob roster) — E7 biome identity proven
- [x] Biome 3: THE GRAVEYARD (M5.6, ?v=m5f) — SHIPPED: own world/roster/witching-cycle/boss/theme; third live realm — E7 biome identity proven again
- [ ] Dungeons 1–2: portal drops from elites, handcrafted builder maps, dungeon bosses
- [ ] Bosses 2–5 across realms/dungeons — scouter workup sheets (E3) data-driven per boss
- [ ] T4–T6 gear; breakables + field chests (E1 overlay reused)
- [ ] Map affixes (E9) GO LIVE: flip DATA.console.live — the console's slotted affixes (Apex Predators / Escalating Threats / Hordes) actually mutate the realm; risk = reward loot numbers resolved by playtest (console UI + plumbing shipped at M3.5)
- [ ] More stage objectives/modes (E6) beyond time trial, per Fun Gate 2 appetite
- [ ] Blender MCP experiment: 1 hero or boss rendered to spritesheet (ASSET_PIPELINE.md §4)
- [ ] FUN GATE 2 executed + logged

## M6 — 1.0 polish ⬜

- [~] Settings: volume, screenshake, casual-mode (if Q1 demanded it) — PARTIAL: a Settings panel shipped early at M3.10 (?v=m3o) with split Music/SFX volume + on/off and remappable keybinds; screenshake toggle + casual-mode still open
- [ ] Save export/import as file
- [ ] Records page: graveyard, bests, totals
- [ ] Audio pass, perf gate (300 mobs/200 projectiles @60fps), cross-browser sweep
- [ ] ASSET_CREDITS.md complete license sweep
- [ ] Player-facing README section; tag v1.0 via 2_SAVE_AND_UPLOAD

## Icebox 🧊 (post-1.0, in rough order)

Multiplayer spike (Node+WebSocket, ARCHITECTURE.md §4) · weapon/ability evolutions (V5) ·
more classes · fame/stars · pets · Phaser 4 migration · Steam wrapper (Electron/Tauri) if ever desired.
