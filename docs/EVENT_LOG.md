# EVENT LOG — what changed, when, and why

> Append-only. Newest entries on top. One entry per work session or notable change.
> Format: date · milestone · **what landed** · files touched · notes/decisions.
> This file is the project's memory — if it's not logged here, it didn't happen.

---

## 2026-07-12 (tooling) · GIT WORKFLOW — diagnosed why GitHub never got the game; bats hardened

**User report: "the bat files don't seem to be working with my GitHub repository."**

**ROOT CAUSE (found on a second pass — a cmd.exe parse bug, present since day 1):**
the original 2_SAVE_AND_UPLOAD contained `echo  Nothing to do here. :)` INSIDE a
parenthesized if-block. In batch, an unescaped `)` closes the block at parse time —
so the block ended at the smiley, and the `pause` + `exit /b 0` that followed ran
UNCONDITIONALLY. Every run of 2_SAVE therefore printed the banner, paused, and
silently exited right after the "anything to save?" check — it could never reach
fetch/add/commit/push. The window looked like it "just closed". All forensic
artifacts agree: `.git/index` untouched since 07-09 (no `git add` ever), no commits
after the initial one, and no fetch ever recorded from 2_SAVE.

**Context (verified against the live repo + github.com/omegaredduck/superrpgbros):**
- The plumbing is HEALTHY: remote URL correct, the July-9 "Initial commit" push
  succeeded, and a fetch+pull (1_GET_LATEST) ran fine the morning of 07-12.
- GitHub holds exactly 1 commit with only the 8 setup files — all game code was
  untracked and invisible to GitHub.
- Also swept ALL FOUR bats for the same class of bug and escaped every unquoted
  paren inside if-blocks (`change(s)`, `(a "conflict")`, `(Undo needs...)`,
  `(conflict)`) — any of these could end a block early and run its error-exit
  unconditionally. Quoted parens (e.g. the `"(Y/N)"` prompts) are safe — proven by
  1_GET_LATEST's dirty-tree prompt working on 07-12.
- Incidental: a stale `.git/index.lock` (created by a sandbox-side probe) was cleared
  (parked in `_to_delete/`); local `.gitignore` didn't exclude `_to_delete/`, which
  would have re-uploaded the abandoned Project-7 spec on the next push.

**Fixes landed:**
- All four bats: `cd /d "%~dp0"` (run correctly regardless of how they're launched);
  a "Git is not installed / not in PATH" check with its own message (previously
  misreported as "not connected to GitHub"); auto-clear of stale `.git\index.lock`
  when no git.exe is running (1/2/4 — 3 stays read-only).
- 2_SAVE_AND_UPLOAD: `git fetch` errors now PRINT (no more silent >nul); `git add`
  errorlevel checked; quotes stripped from the commit message (they broke `-m "%MSG%"`);
  commit failure hints at user.name/user.email; push failure explains that work IS
  saved locally and distinguishes login vs rejected.
- `.gitignore`: `_to_delete/` excluded. Next upload will also correctly DELETE
  0_FIRST_TIME_SETUP.bat and project7-spec.md from GitHub (both intentionally removed locally).

**Also added (user request):** after the push, 2_SAVE now VERIFIES the upload —
it re-fetches from GitHub and compares commit ids; a green "[VERIFIED] UPLOAD
SUCCESSFUL" banner appears only when GitHub's copy provably matches the folder
(a red VERIFICATION FAILED banner otherwise). And there's an optional NOTE prompt
per upload — notes land in `UPLOAD_LOG.md` (created on first use), which is
committed and uploaded together with the work.

**To close it out: run 2_SAVE_AND_UPLOAD.bat once** — first upload carries the whole
game (~40 files, ~2MB). Claude verifies the repo contents from the cloud after.

---

## 2026-07-12 (addendum) · M3 · AFFIX NAMEPLATES + SPACE-ACTIVATED PORTALS — read the threat, commit at the pedestal

**User review of the affix/vault build surfaced two gaps: champions had no UI beyond
tint (you had to memorize colors), and nexus portals were still M0-era walk-in (no
deliberate activation). Both fixed same day; user picked "now" over "M5" for each.**

**Landed:**
- CHAMPION NAMEPLATES: every affixed mob carries a floating name tag ("SPLITTING",
  "PACK LEADER"…) in its affix color — created at spawn, follows in updateMob,
  cleared on every kill path (death, E2 wipes, pooled-sprite reuse — NEW
  `Entities.clearNameTag`, called in scenes' two killAndHide wipe loops too).
- SPACE-ACTIVATED PORTALS (pre-builds the M5 pedestal-commit moment): walking into
  a plaza portal no longer teleports you. `handlePortals` (Q6 pattern, nexus
  edition) shows a screen-clamped "SPACE — enter REALM CLEAR" prompt at the
  nearest unlocked portal; SPACE commits (`enterPortal`). Held while the vault/
  graveyard overlays are open. At M5 the rolled map affixes surface in this same
  prompt before the player commits. New knob: `DATA.interact.portalRange`.
- The realm-side boss portal stays touch-activated (walking to it IS the commitment).

**HEADLESS GOTCHA (worth remembering):** software-GL headless Chromium can run the
game at ~2fps; Phaser caps per-frame delta (~100ms), so clock timers run up to ~5×
slow in real time — the portal fade's 450ms delayedCall was intermittently blowing
the suites' 6s waits (the old overlap portals fired on the physics step, masking
this). Fix: realm-entry waits 6s → 7s×3 with a Space-press RETRY loop in every
suite (a rare-load frame stall can also swallow a press). 3 consecutive full
batteries green after hardening.

**Files:** `data.js` (portalRange), `entities.js` (nameTag + clearNameTag),
`scenes.js` (handlePortals/enterPortal, wipe-loop tag cleanup, help text),
`index.html` (**?v= m3b → m3c**), all 6 suites (retry-hardened entries; m3c grew
12 → 15 checks: portal gating + nameplate lifecycle ×2), TESTING, MILESTONES,
NEXT_SESSION, README.

**Verified (headless Chromium): 121 checks — m1 23 + m2 22 + m21 18 + m3 19 +
m3b 24 + m3c 15 — ALL GREEN ×3 consecutive full batteries, zero console errors.**
Screenshots: 4 champions with nameplates in-realm; clamped portal prompt in the plaza.

---

## 2026-07-12 · M3 · EQUIPMENT + NEXUS VAULT + AFFIX ENGINE v2 — loot is real, the vault outlives you

**M3 second half (all three chunks from NEXT_SESSION, in order).**

**Landed — EQUIPMENT:**
- `DATA.items`: 16 items — T0–T3 across weapon/ability/armor/ring (`DATA.equipSlots`,
  `DATA.tiers` w/ rarity colors, `DATA.vault.slots = 8`). An item instance is just its
  key (no rolled stats) — saves/vault store plain strings.
- Effects, one implementation, all in SIM (pure, Node-runnable): `equipBonus` (flat stat
  adds applied AFTER the cap clamp — gear matters at level 20), `statsFor` grew a 4th arg,
  `weaponMod` (bow dmg add), `abilityFor` (volley mpCost/count mods, cost floor 4),
  `rollDrop` (weighted tables via SIM.rng).
- `DATA.dropTables` (grovekeeper / trial / champion) wired to `DATA.bosses.*.lootTable` +
  `DATA.modes.survival.lootTable`. Boss chest = 2 rolls, trial chest = 1.
- CHEST OVERLAY (E1 phase 2 — the PoE2 moment is real): gear rows with per-item TAKE —
  equips on the spot (persisted), an occupied slot swaps the old item back into the row
  (change your mind freely), ENTER takes empty-slot/higher-tier upgrades and closes.
  Potion+XP still bank at OPEN (invariant unchanged). ENTER once() cleared before rewire
  on every rebuild (bug #2 family).
- SAVE SCHEMA v2→v3 (TM-4 rung 2, lossless): `character.equipment` (dies with the
  character — R5 mirror of potionsDrunk); vault survives death. Migration also SANITIZES
  stale item keys (unknown/wrong-slot → dropped, never a crash). `SAVE.emptyEquip()`.
- New textures: `quiver`, `armor`, `ring` (neutral greys — tier tint carries rarity).
  HUD ability slot shows the gear-modified MP cost.

**Landed — NEXUS VAULT (the M3 gate clause):**
- V or clicking the vault chest opens the swap UI: EQUIPPED column (4 slots, click to
  bank) · VAULT column (8 account slots, click to equip; occupied slot = in-place swap) ·
  gear-total readout. Full vault refuses the 9th item (nothing lost). Every change runs
  `applyEquipmentChange` — re-derive stats from the one truth + heal by the max-delta
  (never free damage, never a free heal) + persist. ESC closes the vault before it means
  "to title".

**Landed — AFFIX ENGINE v2 (E9 complete):**
- SPLITTING un-gated: rolls ONLY on shooters; every bolt forks mid-flight into
  `splitShots` children at ±`splitAngleDeg` (children never re-split) — updateProjectiles.
- EVOLVING un-gated: surviving a hit can trigger the ONE-TIME evolution (`DATA...evolve`:
  fresh 2.4× HP pool, faster, worth more, grows 1.3×) — hurtMob + "EVOLVED!" moment.
- PACK LEADER un-gated: while one lives, `directorSpend` skews the pool to casters.
- Affixed mobs DROP BETTER: `DATA.affixes.championBounty` — each champion kill adds a
  roll from the champion table to the boss chest (cap 3), with a bounty toast on kill.
- `Entities.spawnMob` gained a `forceAffix` hook (tests now; map affixes at M5).

**Files:** `data.js`, `sim.js`, `save.js`, `entities.js`, `scenes.js`, `textures.js`,
`index.html` (**?v= m3a → m3b**), NEW `test/m3b_suite.js` (24), NEW `test/m3c_suite.js`
(12), `test/m2_suite.js` (migration check now asserts SAVE.VERSION), MILESTONES,
ARCHITECTURE §2/§6/§7, TESTING (new TM-9 + log row), NEXT_SESSION.

**Verified (headless Chromium): 118 checks — m1 23 + m2 22 + m21 18 + m3 19 + NEW m3b 24
+ NEW m3c 12 — ALL GREEN, zero console errors.** Screenshots: vault UI (banked T3s, gear
totals), boss chest overlay (potion/XP banked rows + 4 TAKE rows incl. champion bounty).

**Next:** M3 leftovers: Q3/Q5 flags + CC0 art batch 1. Human gates unchanged and now
three deep: M2 Fun Gate 1 (outside tester) · M2.1 dev self-test · M3 gate (bank an item,
return to a realm — now humanly achievable). Manual TM-8 tileset import still pending.

---

## 2026-07-12 · M3 · MAP BUILDER SHIPPED — maps are real, realms run on them

**M3 opened (map-builder half; equipment/vault half untouched).** Session decision:
user picked "map builder first" from the M3 chunks (builder → equipment → affix v2).

**Landed:**
- NEW `game/js/maps.js` — the map system. One JSON schema (v1), two consumers:
  the builder writes it, the realm loader reads it. Layers ground/walls/decor as
  row-strings with a per-map char→texture key; object layer (playerStart,
  spawnZones[], bossArena); maps live in localStorage `srb_maps` (this module
  only — save.js rule) with export/import-as-file; built-in `realm1` ships in
  code and a saved map under the same id overrides it. Chunked canvas renderer
  (32×32-tile chunks — single-cell repaints stay cheap in the builder); wall
  bodies as merged horizontal runs (431 static bodies for realm1, not ~1500);
  findClearPx spiral keeps portals/bosses/chests out of the scenery. Pure-data
  parts run in Node.
- NEW `game/js/builder.js` — the IN-GAME MAP BUILDER (M in the nexus, dev tool,
  not the player flow): tile palette per layer, paint/erase/RECT-fill, object
  placement (start click, zones/arena drag), WASD pan + wheel zoom, SAVE/EXPORT/
  IMPORT MAP/IMPORT TILES/TILESET⟳/OPEN⟳/NEW MAP/PLAYTEST▶, dirty-guarded exit.
  Imported tileset images (png/jpg/gif/webp/bmp) are sliced to 16×16 and
  EMBEDDED in the map JSON as hex rows — exports stay self-contained, file://
  keeps working, and the loader rebuilds textures synchronously.
- REALM ON MAPS: RealmScene loads the map (playtests pass mapId), world bounds =
  map size, player starts at the painted start, walls collide (player, mobs,
  boss) and EAT SHOTS both ways (cover is real now — F2), spawn zones steer the
  wave director (no zones = classic ring, either way never inside a wall), and
  the BOSS ARENA hosts the fight: entering the boss portal delivers you to the
  painted room, boss at its center. Legacy no-map fallback kept (never a crash).
- Realm 1 rebuilt as built-in `realm1`: 150×150, rock border, rock/hedge cover,
  a pond, dirt clearings, 420 decor props, NE 24×24 boss arena — authored
  programmatically in the builder's own format (repaint it in the builder any
  time; deterministic local rng, NOT SIM.rng — content, not gameplay).
- `DATA.tilesets` (grasslands + stonehold) + `DATA.builder` knobs; 17 new
  procedural tiles in textures.js.
- Files: NEW `maps.js`, NEW `builder.js`, `data.js`, `textures.js`, `scenes.js`,
  `main.js`, `index.html` (**?v= bumped m2.1a → m3a**, footer), NEW
  `test/m3_suite.js` (19 checks), TESTING.md TM-8 + bug #5.

**BUG #5 (P1, found by the new suite pre-ship, FIXED):** with
`collider(dynamicGroup, staticGroup, cb)` Phaser hands the callback
**(staticChild, dynamicChild)** — reversed from registration order. The
shot-eating callback was disabling the WALL. Callbacks now identify the
projectile by its `.proj` tag, never by arg order. See TESTING.md bug log.

**Verified (headless Chromium): 82 checks — m1 23 + m2 22 + m21 18 + NEW m3 19 —
ALL GREEN, zero console errors.** Screenshots: builder (objects layer, zoomed
out over realm1), realm1 in-game with orb HUD.

**Next:** M3 second half — equipment (weapon/ability/armor/ring, T0–T3 drop
tables) + nexus vault (8 slots) making E1 chests real item choices; then affix
engine v2 (Splitting/Evolving/Pack Leader un-gated) + Q3/Q5 flags. Manual TM-8
item: import one real tileset image in the builder. The M2/M2.1 human gates
(dev self-test + Fun Gate 1) still pending — nothing here closes them.

---

## 2026-07-12 · M2.1 · EMERGENT SCOPE EXPANSION (user directive) — docs folded in, phase-1 features landing

**Decision of record (user, 2026-07-12):** project scope expands with nine features
(E1–E9): SPACE-interact loot chests w/ PoE2-style selection overlay · simplified boss
room access (mob-destruction wipe) · DBZ-scouter boss workup sheet · Diablo-style
HP/MP orb HUD · nexus portal plaza travel structure · alternative stage objectives
(5-min time-trial survival) · biome-attached mob rosters · Archer bow aim-alignment
fix · a data-driven affix engine for maps (Apex Predators / Escalating Threats /
Hordes) and mobs (Tanky / Projectiles Split / Speedy / Evolutions / Role Distribution).

**Docs:** MECHANICS_MANIFESTO → v1.2 (new Part 4 traces each E# to the Fusion Laws;
new open questions Q6 SPACE-contextual-interact, Q7 wipe-vs-quota, Q8 time-trial shape) ·
PRODUCT_PLAN → v1.3 (1.0 scope §5 updated; alignment table §10b added) · MILESTONES →
new M2.1 section; M3 elite item absorbed into affix engine v2; M5 gains map affixes,
biome attachment, more modes · ARCHITECTURE → new §7 (affix/biome/mode/interaction
design rules) · TESTING → TM-7 module + TM-1 bow item. M2's Fun Gate 1 remains the
open MVP gate — M2.1 changes what that tester will see, not the gate.

**Landed this session (ALL M2.1 feature boxes, same day):**
- E8 BOW FIX: new procedural `bow` texture; the Ranger now HOLDS it — position +
  rotation track the exact aim angle every frame, and body facing follows AIM,
  not movement (F2). Hidden on death; blinks with i-frames.
- E4 ORB HUD: Diablo-style HP (left) / MP (right) resource orbs — liquid fill is a
  circle-segment redraw per frame — flanking a central action bar: SPACE ability
  slot (dims when MP can't pay), auto-fire indicator, Lv readout, XP strip riding
  the bar's top edge. Old corner bars retired; objective line stays top-left.
  Redrawn from `this.scale` each frame → fullscreen re-anchors free (bug #3 family).
- E2 BOSS ACCESS (Q7): quota met → the portal's arrival ANNIHILATES the swarm
  (screen flash + shake, no XP) and the director stands down — run-up always clear.
  Also fixed a latent bug: un-pausing mid-boss-flow restarted the wave director.
- E3 SCOUTER: threat-analysis workup sheet on boss-room entry — animated scan
  sweep, boss visual readout, raw stats (HP/SPD/contact/patterns/bounty), tactical
  hints per pattern (`DATA.bosses.*.hints` — data-driven, new boss = new hints, no
  new UI code). Physics + update loop hold until ENTER/click; pattern grace timers
  restart at dismissal.
- E1 LOOT CHESTS (Q6): the boss now DROPS A CHEST (V10). SPACE is contextual —
  interactables in `DATA.interact.range` win over the ability. Opening banks +
  persists ALL rewards FIRST (permadeath invariant), then a PoE2-style selection
  overlay lists the loot (potion + XP rows, hover highlight, take-all) → REALM
  CLOSED screen. Per-item choice becomes real when equipment lands (M3).
- E5 PORTAL PLAZA: the nexus portal is now a plaza — pedestal per destination:
  realm clear (blue), TIME TRIAL (gold), 2 sealed pedestals labeled for M5
  realms/map-affixes. `nexus.portal` still points at the clear portal (suites/docs).
- E6 TIME TRIAL (Q8): survival mode via `scene.start('Realm', {mode})` —
  `DATA.modes.survival`: 5:00, no quota/boss, HUD counts DOWN; the horn wipes the
  swarm (E2 reuse) and drops a reward chest (guaranteed potion + 250 XP).
- E7 BIOMES: `DATA.biomes` owns mob rosters (+ floor tile); the director builds
  its pool from the realm's biome, cheap-fallback included; guards an all-locked
  early roster. Attaching a mob to a biome = one line of data.
- E9 AFFIX ENGINE v1: `DATA.affixes.mob` rolled per spawn via `SIM.rng`
  (`mobRollChance` 6%); TANKY + SPEEDY champions live (tint/scale/hp/spd/xp
  multipliers, tint survives hit-flash); SPLITTING/EVOLVING/PACK LEADER defined in
  data but `m3`-gated. `DATA.affixes.map` (APEX PREDATORS/ESCALATING THREATS/
  HORDES) defined, `m5`-gated for the plaza.
- Files: `data.js` (all new knobs), `textures.js` (bow, pedestal), `entities.js`,
  `scenes.js`, `index.html` (**?v= bumped m2.1 → m2.1a**, footer), README,
  NEW `test/m21_suite.js`, `test/m2_suite.js` reworked.

**Verified (headless Chromium): 63 checks — m1 regression 23 + m2 (reworked flow) 22 +
NEW m21 18 — ALL GREEN, zero console errors.** M2.1 exit gate = dev self-test, pending.
M2's Fun Gate 1 (outside tester) remains the open MVP gate.

**Next:** dev self-test the new flow (M2.1 gate) → hand it to the Fun Gate 1 tester.

---

## 2026-07-11 · M2 · M1 GATE PASSED → First Fun features shipped (Fun Gate 1 pending)

**M1 closed:** dev self-tested same day, played 3+ realms voluntarily ("testing looks good").
M1 → ✅. The self-test surfaced bug #3 (fullscreen) — see the M1 addendum below.

**M2 landed (every feature box; only Fun Gate 1 remains):**
- SAVE SCHEMA v2 — the first real TM-4 migration. v1 saves upgrade losslessly; new fields:
  `account.potions` (unclaimed stash — SURVIVES death, Pillar 3), `character.potionsDrunk`
  (dies with the character, R5), `records.realmsClosed`.
- KILL QUOTA → BOSS PORTAL (F8): `DATA.realm.killQuota` (150, the Q4 tuning knob; HUD counts
  down). Portal spawns near the player, red-tinted, with swirl + banner.
- BOSS 1 — **The Grovekeeper** (`DATA.bosses`, Lane-A 20×20 sprite @3x): 1400 hp, slow chase,
  two alternating patterns — 24-bolt radial burst + 7-shot aimed stream (each shot re-aimed).
  Boss HP bar top-center. Entering the portal clears the swarm and pauses the wave director.
- REALM CLOSE (F8): boss death → big burst → REALM CLOSED screen: guaranteed random stat
  potion (icon, tinted per stat) + 350 bonus XP; `realmsClosed` increments; kills banked to
  totalKills; ALL REWARDS PERSISTED BEFORE THE SCREEN (same rule as permadeath) → nexus.
- POTIONS IN THE NEXUS: stash panel (click to drink, +5, sound, toast). Caps respected via
  new `SIM.statsFor(cls, level, potionsDrunk)` — a capped drink is refused and kept, never
  wasted. Player stats everywhere now include drunk pots (createPlayer, level-up).
- GRAVEYARD & RECORDS view: **G** in the nexus — last 10 fallen characters (level, kills,
  killer) + full records line. Full page remains M6.
- Killer strings now name bolts properly ("a Warlock's bolt", "The Grovekeeper's bolt").
- New SFX recipes: victory fanfare, potion drink, boss-hit thud.
- Files: `data.js`, `save.js`, `sim.js`, `textures.js`, `entities.js`, `scenes.js`,
  NEW `test/m2_suite.js` (m1_suite updated for v2).

**Verified (headless Chromium): M2 suite 19 checks + M1 regression suite 23 checks — ALL GREEN.**
Screenshots: boss radial ring, REALM CLOSED reward screen, nexus potion stash.

**Same-day addendum (bug #4, P1):** user hit a black screen after slot select on localhost:8000.
Cause: NOT the code (continue path with v1 AND v2 saves verified green headless) — the python
http server sends no cache headers, so Chrome served a stale mix of old M1 js + new M2 js and
NexusScene died mid-create. Fix: cache-busting `?v=` query strings on every script tag in
index.html. **NEW SHIP RULE: bump the `?v=` value in index.html every time game js changes.**

**Next:** FUN GATE 1 — hand the game to an outside tester (a friend who didn't watch it being
built), 20+ min, log per TESTING.md §3. That closes M2 and the MVP. Then M3: map builder + loot.

---

## 2026-07-11 · M1 · Feel pass features shipped (gate pending) + P1 double-death bug fixed

**Landed (all six M1 feature boxes):**
- Tuning sweep, data.js only: player spd 170→180 · bow rate 1.5→1.7 · slime spd 95→100 ·
  brute contact 18→16 · spitter cd 1400→1300 · warlock proj 200→190 (readable bullets, Pillar 2) ·
  knockback 140→160 · spawn interval 2400→2200.
- Hitstop: ~40ms physics freeze when a player shot lands, cooldown-limited (`DATA.juice`).
- Particles: mob deaths burst in the mob's own palette color (`deathTint` per mob in data.js);
  level-ups burst gold; portal swirl effect on title + nexus portals.
- SOUND — NEW `game/js/audio.js`: tiny Web Audio chiptune synth, zero audio files (Lane A).
  9 sounds (shoot/volley/hit/die/hurt/levelup/portal/death/ui) defined as DATA recipes in
  `DATA.audio.sounds`. Per-sound rate limits so auto-fire can't wall-of-sound. Failure-safe:
  no Web Audio → silent game, never a crash.
- Pause menu (ESC in realm): freezes physics/spawner/realm-clock (clock excludes paused time),
  LEFT/RIGHT volume (persisted), Q = save & return to nexus, F = fullscreen (works everywhere).
- Settings storage: NEW `srb_settings` key via save.js (volume, auto-fire) — device-level,
  outside the 3 account slots. Auto-fire toggle now persists across realms AND sessions (TM-1, Q2).
- Death recap upgraded: cause of death names the shooter ("slain by a Warlock's bolt"),
  THIS RUN (kills · survived · level) vs THE ACCOUNT (deaths · best · total kills · graveyard).
- Files touched: `data.js`, `save.js`, `audio.js` (new), `entities.js` (projectile src tag),
  `scenes.js`, `index.html`, docs suite.

**BUG #2 (P1, pre-existing since M0, found by the new suite, FIXED):** RealmScene `wireEvents()`
stacked duplicate listeners on every realm entry (Phaser keeps scene.events listeners across
scene.start — same gotcha family as bug #1). A death after N realm entries wrote N graveyard
entries + N deaths. Fix: `off()` before `on()`. See TESTING.md bug log.

**Verified (headless Chromium, 23 checks, ALL GREEN):** boot→title→new-game→nexus→portal→realm ·
wave director spawns · ESC pause freezes physics+spawner+clock · volume persists · T persists
across realm re-entry · Q-to-nexus · hitstop fires + releases · recap contents · permadeath
written at death (exactly once) · sim.js still runs in Node · zero console errors.

**NOT DONE — M1 exit gate:** dev self-test ("I voluntarily played 3 consecutive realms").
M1 stays 🔨 until that happens. Next session: play it; if it's fun, tick the gate and open M2.

**Same-day addendum (bug #3, two rounds):** user's first self-test hit fullscreen not scaling
at all (no scale mode in the Phaser config). Round 1 fix (Scale.FIT) letterboxed — user verdict:
"I don't want the black around it." Round 2, the real fix: **Scale.RESIZE** — the canvas always
matches its container, so fullscreen FILLS the screen and shows MORE WORLD (RotMG-style; windowed
stays exactly 960×640 via the fixed #game div). Ripples handled: Title/Nexus/pause/death layouts
now read `this.scale.width/height` (main.js restarts Title/Nexus on resize); the wave director's
spawn ring now grows with the actual viewport so mobs still spawn off-screen at any size
(V11/TM-3, data.js values remain the floor); **P** added as an alternate pause key because the
physical ESC also exits browser fullscreen. Files: `main.js`, `index.html`, `scenes.js`.
Verified headless: 1600×900 full fill, exit restores 960×640, spawn ring clears the viewport,
23-check suite ALL GREEN. See TESTING.md bug log #3.

---

## 2026-07-11 · M0.5 · Welcome screen + 3 save slots shipped; map builder re-decided as in-game tool

**Landed:**
- NEW `game/js/save.js`: versioned save schema v1 (3 localStorage slots `srb_save_1..3`),
  load/save/clear/peek, migrate-or-flag-corrupt (TM-4). Scenes never touch localStorage directly.
- NEW TitleScene (welcome screen): 3 slot cards (class/level/best/deaths/last-saved),
  NEW GAME / CONTINUE, two-click DELETE, keyboard 1/2/3, storage-unavailable warning.
- Boot → **Title** → Nexus flow; ESC in nexus saves + returns to title (slot switching).
- Autosave: nexus arrival, realm entry, level-up, death. Permadeath is written to the save
  AT the moment of death — closing the tab on the death screen cannot resurrect a character.
- Records now persisted per slot: bestLevel, deaths, totalKills, realmsEntered.
- Files touched: `save.js` (new), `scenes.js`, `main.js`, `index.html`, docs suite.

**Verified (headless Chromium):** 9-step suite — boots to title; 3 empty slots; new game
writes v1 save; ESC round-trip; full reload → CONTINUE restores level/xp; slots independent;
two-click delete; corrupt save flagged not crashed; zero console errors. Separate death-path
suite: graveyard + records + character reset all in the save file before the recap screen.
One P1 found & fixed pre-ship (title re-entry guard — see TESTING.md bug log #1).

**Decisions of record:**
- MAP BUILDER (user, 2026-07-11): Tiled is RETIRED. The map builder is an in-game developer
  tool at M3: paint layers + spawn objects; tilesets BOTH procedural (Claude-generated) AND
  imported image files (png/jpg/gif/webp/bmp) from day one. ASSET_PIPELINE.md §3 rewritten.
- SAVES (user, 2026-07-11): welcome screen with 3 slots, each a full separate account —
  pulled forward from M2 to now ("M0.5"). Save export/import-as-file stays at M6.
- M2's save checkbox is done early; M3 renamed "World, loot & map builder"; plan bumped v1.2.

**Next up (M1, unchanged):** tuning sweep + juice pass + ZzFX sound. See MILESTONES.md.

---

## 2026-07-11 · M0 · PROJECT FOUNDED + skeleton shipped + recursion pass

**Landed:**
- Archived old `project7-spec.md` → `_to_delete/` (user decision: Project 7 abandoned, do not consider).
- Full documentation suite v1.0: MECHANICS_MANIFESTO, PRODUCT_PLAN (wargamed: COA-B selected,
  red-teamed), MILESTONES, TESTING, ASSET_PIPELINE, ARCHITECTURE, this EVENT_LOG, README.
- Playable M0 skeleton (Phaser 3.90 via CDN, zero build step):
  - Scenes: Boot → Nexus (safe, portal) → Realm → death recap → Nexus
  - Ranger: WASD + mouse aim, auto-fire (T toggle), SPACE piercing volley (MP)
  - Mobs: chasers ×2 (slime, brute), shooters ×2 (spitter single-shot, warlock 3-spray)
  - Wave director (escalating budget, off-screen ring spawns, pooled)
  - XP → level 20 cap, auto stat growth, HP/MP/XP HUD, damage numbers, hit flash,
    knockback, screenshake, i-frames, F3 debug overlay
- `START_SERVER.bat` for the M3+ asset era.

**Decisions of record:**
- Engine locked: Phaser 3.x through 1.0 (Phaser 4 exists; migration is post-1.0, no relitigation).
- Strategy locked: COA-B — RotMG spine first, VS density second (PRODUCT_PLAN §2).
- Progression: full RotMG-style, roguelite meta-shop explicitly dropped (Fusion Law F4).
- Open questions Q1–Q5 registered with defaults + test points (MECHANICS_MANIFESTO Part 3).

**Recursion pass (requested in founding brief):** original message re-read against deliverables;
gaps found & fixed in iteration: (1) Blender question "can Claude make assets?" was unanswered →
ASSET_PIPELINE §1 Lane-A capabilities list added; (2) map-builder ask was under-specified → Tiled
lane C written with concrete import steps + START_SERVER.bat shipped now, not at M3; (3) alignment
table added as PRODUCT_PLAN §10 mapping every clause of the founding message to a deliverable;
(4) manifesto bumped v1.0 → v1.1 (added explicit OUT-list + Q1–Q5 defaults table).

**Next up (M1):** tuning sweep + juice pass + ZzFX sound. See MILESTONES.md.

---

*(template)*
## YYYY-MM-DD · M# · Title
**Landed:** …
**Decisions:** …
**Next up:** …
