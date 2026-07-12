# TESTING PLAN — modules, gates, and fun alignment

> Two kinds of truth: **does it work** (test modules, §2) and **is it fun** (fun gates, §3).
> Neither substitutes for the other.

## 1. Principles

- Every milestone exit runs its module checklist BEFORE its fun gate.
- The sim layer (`js/sim/` once extracted at M2; currently systems inside scenes) must stay
  runnable headless in Node so logic tests never need a browser.
- Bugs get logged at the bottom of this file (P0 = blocks play, P1 = hurts play, P2 = cosmetic).
- Playtest results are DATA. Log them even (especially) when they're embarrassing.

## 2. Test modules (manual checklists + future automation)

### TM-1 Movement & input
- [ ] WASD moves in 8 directions at equal speed (diagonal normalized)
- [ ] Mouse aim tracks correctly at all screen positions; sprite/aim indicator matches
- [ ] Auto-fire toggle (T) persists across realm re-entry; SPACE ability fires only with MP
      *(auto-fire persistence half verified headless 2026-07-11 — M1 suite steps 10/12; SPACE-MP still manual)*
- [ ] Player cannot leave world bounds; no wall-clipping
- [x] E8: bow sprite aligns to the aim direction at all angles; body facing follows AIM, not movement (verified headless 2026-07-12 — m21 suite steps 4-6)

### TM-2 Combat math (headless-able)
- [ ] Damage = weapon dmg × (1 + ATT/50), floored; DEF subtracts flat, min 1
- [ ] DEX maps to fire-rate per data.js curve; SPD to px/s
- [ ] i-frames: no double-hit within 500ms of a hit
- [ ] XP curve: level-ups at documented thresholds; cap at 20; stat growth applied exactly once

### TM-3 Mobs & wave director
- [ ] Chasers pursue; brutes slower but tankier (values per data.js)
- [ ] Shooters keep preferred range; spitter fires aimed single shots; warlock fires 3-spray
- [ ] Spawn budget escalates per timer; mobs spawn off-screen only; hard cap respected (pooling recycles)
- [ ] No mob or projectile leaks: pool counters return to baseline after clearing a wave

### TM-4 Progression & persistence (save slots landed M0.5; potions from M2)
- [x] Death deletes character per Q1 rule; graveyard increments; nexus grants fresh level-1 (verified headless 2026-07-11: death is written to the save BEFORE the recap screen)
- [x] Save/load roundtrip is lossless — reload restores level/xp/records from the slot (verified headless 2026-07-11)
- [x] Corrupted/unknown-version save: flagged on title card, deletable, never crashes (verified headless 2026-07-11)
- [x] 3 slots are fully independent accounts (verified headless 2026-07-11)
- [x] Stat potions apply and respect caps (verified headless 2026-07-11: +5 applies, clamps at class cap, capped drink refused and kept)
- [x] Save schema version bump v1→v2 migrates (verified headless 2026-07-11: v1 save loads, new fields zeroed, level/records/graveyard lossless)

### TM-5 Performance gates
- [ ] M0–M2: 150 mobs + 100 projectiles @ 60fps (Chrome, mid PC)
- [ ] M5–M6: 300 mobs + 200 projectiles @ 60fps; no GC hitches > 30ms during 15-min soak
- [ ] Memory stable across 5 realm cycles (no scene-restart leaks)
- How: press **F3** in-game (debug overlay: fps, mob count, projectile count, pool stats)

### TM-7 Scope-patch systems (E1–E9, from M2.1 — 2026-07-12)
- [x] Chest interaction (E1/Q6): SPACE within range opens the chest (no volley fired); outside range SPACE still fires the ability; overlay lists contents; taking loot banks it + closes the realm (verified headless 2026-07-12: m2 steps 10-15, m21 step 10)
- [x] Boss access (E2/Q7): portal open annihilates all live mobs + enemy shots, director paused, no XP granted for the wipe (verified headless 2026-07-12: m2 step 6)
- [x] Scouter (E3): overlay appears on boss-room entry with stats + hints; combat/physics frozen until dismissed; boss doesn't fire during the scan (verified headless 2026-07-12: m2 steps 7-8)
- [x] Orb HUD (E4): orbs drawn, hp/mp readouts track state (reads state, never writes — seam rule 3) (verified headless 2026-07-12: m21 step 11)
- [x] Time trial (E6/Q8): survival mode ends at durationSec with reward persisted BEFORE the screen (verified headless 2026-07-12: m21 steps 12-16; death-before-timer path = the standard permadeath code, unchanged)
- [x] Biome roster (E7): director spawn pool == the realm's biome roster, incl. cheap-fallback (verified headless 2026-07-12: m21 step 9)
- [x] Mob affixes (E9): affixed spawn applies hp/spd/xp multipliers + tint/scale; roll uses SIM.rng; M3-gated affixes never roll at M2.1 (verified headless 2026-07-12: m21 steps 7-8)

### TM-8 Map system & builder (M3, Lane C — 2026-07-12)
- [x] Builder opens from the nexus (M), on the default map, with palette/tool/layer UI (verified headless 2026-07-12: m3 steps 1-2)
- [x] Paint / rect-fill / erase mutate the map JSON across ground/walls/decor layers (verified headless 2026-07-12: m3 steps 3-5)
- [x] Object layer places player start, spawn zones (drag), boss arena (drag); CLEAR removes (verified headless 2026-07-12: m3 step 6)
- [x] SAVE persists to localStorage (srb_maps); export → import round-trips; junk JSON rejected, never a crash (verified headless 2026-07-12: m3 steps 7-8)
- [x] PLAYTEST starts a realm ON the painted map: player at painted start, world bounds = map size, wall bodies built (verified headless 2026-07-12: m3 steps 9-11)
- [x] Spawn zones drive the wave director; without zones the classic off-screen ring applies, and spawns never land inside walls (verified headless 2026-07-12: m3 steps 12, 18)
- [x] Boss arena: the fight is delivered to the painted room (boss centered, player at the edge); scouter still fires (verified headless 2026-07-12: m3 steps 13-14)
- [x] Walls block player AND enemy shots (verified headless 2026-07-12: m3 step 15; note the Phaser callback-order gotcha in the bug log, #5)
- [x] Default realm runs on built-in realm1: 150×150, painted start, merged wall bodies, 25 render chunks (verified headless 2026-07-12: m3 steps 16-17)
- [ ] Tileset image import (png/jpg/gif/webp/bmp → 16×16 slices, embedded in the map JSON) — code shipped; needs a MANUAL check with a real image file (FileReader can't be driven headless without a fixture)

### TM-9 Equipment, vault & affix engine v2 (M3 second half — 2026-07-12)
- [x] Save schema v2→v3 migrates losslessly: equipment slots added empty, vault kept, potions/records untouched (verified headless 2026-07-12: m3b steps 1-3; v1 saves climb the whole ladder — m2 step 2 now asserts SAVE.VERSION)
- [x] Sanitizer: unknown item keys dropped from vault, wrong-slot equipment cleared, real items kept — a data.js rename can't crash a save (verified headless 2026-07-12: m3b steps 4-5)
- [x] Item data integrity: 16 items, 4 per slot, tiers 0–3, all drop-table entries reference real items (verified headless 2026-07-12: m3b steps 6-7)
- [x] Gear pushes stats PAST class caps (potions clamp, equipment doesn't — that's why gear matters at 20); weapon dmg add + ability mpCost/count mods with a cost floor (verified headless 2026-07-12: m3b steps 8-9)
- [x] Boss chest rolls gear (E1 phase 2): TAKE equips + persists before any screen; occupied slot swaps the old item back into the row; ENTER auto-takes empty-slot/higher-tier leftovers then closes (verified headless 2026-07-12: m3b steps 10-14)
- [x] Vault (8 account slots): V/click opens; bank equipped → vault, equip from vault (occupied = in-place swap), full vault refuses the 9th with nothing lost; every change persisted (verified headless 2026-07-12: m3b steps 15-19)
- [x] Live stats re-derive on any gear change (+HP granted filled, unequip clamps down — never free damage, never a free heal) (verified headless 2026-07-12: m3b step 20)
- [x] GATE CLAUSE: gear dies with the character; THE VAULT SURVIVES DEATH; a fresh level-1 walks back into a realm with the vault intact (verified headless 2026-07-12: m3b steps 21-23)
- [x] Affix v2 (E9): all 5 affixes un-gated · SPLITTING only rolls on shooters, bolts fork mid-flight, children never re-split · EVOLVING triggers once on surviving a hit (fresh bigger HP pool, faster, worth more) · PACK LEADER alive = director spawns casters only, lifts on its death · champion kills add capped bounty rolls to the boss chest (verified headless 2026-07-12: m3c)
- [x] Champion nameplates: tag born with the affix (right text/color), floats above and follows the mob, dies with it on every kill path; plain mobs stay untagged (verified headless 2026-07-12: m3c steps 4-5)
- [x] SPACE-activated portals: standing on a plaza portal does NOT enter — the prompt asks for SPACE; SPACE enters; prompt clamped on screen; held while vault/graveyard overlays are open (verified headless 2026-07-12: m3c step 1 + every suite's entry path)
- **Headless perf note (2026-07-12):** software-GL headless Chromium can run ~2fps; Phaser caps per-frame delta, so clock timers (scene-transition delayedCalls) run up to ~5× slow in real time. Suites use generous waits + a retry loop around portal SPACE presses. On real hardware none of this applies.

### TM-6 Compatibility
- [ ] Chrome, Edge, Firefox latest: boot, play, save
- [ ] Works from file:// (M0–M2) and from START_SERVER.bat (M3+, file-based tileset images)

## 3. Fun-alignment playtest protocol

**Cadence:** self-test every session · outside tester at every FUN GATE (M2, M5) minimum.
Testers: friends who did NOT watch development. Say nothing except the controls line.

**Session script:** 1) hand over the game, controls only · 2) observe 20 min, take timestamps,
DO NOT coach · 3) exit interview (below) · 4) log results here.

**Observable metrics (write down, don't vibe):**
- Time to first death · deaths per 20 min · sessions voluntarily extended past 20 min?
- The One-More-Run test: after a death, do they relaunch WITHOUT being asked? (count)
- Do they use SPACE ability unprompted? Do they dodge patterns or face-tank?
- Any progression question asked ("what do potions do?", "how do I unlock…") = engagement gold

**Exit interview (verbatim answers):**
1. Describe the game in one sentence to a friend.
2. What was the best moment? The worst?
3. When you died — fair or cheap?
4. What would make you play tomorrow?
5. (M3+) Did losing your character on death feel exciting-stakes or rage-quit? ← decides Q1

**Fun gate pass criteria** are defined per milestone in MILESTONES.md. A failed gate =
max two design-iteration cycles targeting the specific failed metric, then re-test.
Two consecutive failures on the same gate → revisit the relevant Fusion Law honestly.

## 4. Playtest log

| Date | Tester | Build | Key metrics | Verdict / actions |
|------|--------|-------|-------------|-------------------|
| 2026-07-11 | (dev/Claude headless) | M0 | Boots clean; loop functions; no console errors | Baseline only — not a fun test |
| 2026-07-11 | (dev/Claude headless) | M0.5 | 9-step slot suite (boot→title, new game, reload-continue, slot independence, 2-click delete, corrupt handling) + death-path suite; zero console errors | PASSED — TM-4 items ticked. Not a fun test |
| 2026-07-11 | (dev/Claude headless) | M1 | 23-check suite: boot→title→nexus→realm, wave director, pause freeze (physics/spawner/clock), volume persist, auto-fire persist across realm re-entry, Q-to-nexus, hitstop fire+release, death recap contents (cause/time/kills/account), permadeath-at-death, sim-in-Node, zero console errors | PASSED — found+fixed bug #2 before shipping. Not a fun test; M1 gate = dev self-test |
| 2026-07-11 | DEV (Red) | M1 | Self-test, multiple realms voluntarily ("testing looks good"); reached Lv 4, 36 kills in one run; surfaced fullscreen bug #3 mid-test (fixed same day) | **M1 EXIT GATE PASSED** — first human fun signal on record |
| 2026-07-11 | (dev/Claude headless) | M2 | 19-check suite: v1→v2 migration lossless · quota→boss portal · boss spawn (hp bar, swarm cleared, director paused) · both patterns firing · realm close (potion banked, realmsClosed++, XP bonus, persisted pre-screen) · drink +5/persist · cap clamp+wasted-drink refusal · graveyard toggle · permadeath drops drunk pots, account keeps stash · zero console errors | PASSED. Not a fun test; M2 gate = FUN GATE 1 (outside tester) |
| 2026-07-12 | (dev/Claude headless) | M2.1 | 3 suites, 63 checks total: m1 regression (23) · m2 reworked for the new boss flow (22: E2 wipe, E3 scouter hold+dismiss, E1 chest → SPACE → loot overlay → banked-pre-screen → REALM CLOSED) · NEW m21 (18: plaza, bow-aim at 3 angles, forced affix roll + multipliers + no M3 leak, biome-pinned director pool, Q6 out-of-range SPACE = volley, orb HUD, full time-trial run incl. wipe/chest/TRIAL COMPLETE, boss hints data) · zero console errors | ALL GREEN. Not a fun test; M2.1 gate = dev self-test |
| 2026-07-12 | (dev/Claude headless) | M3 (map builder chunk) | 4 suites, 82 checks total: m1 (23) · m2 (22) · m21 (18) regressions · NEW m3 (19: builder open/paint/rect/erase/objects, save→srb_maps, export/import round-trip + junk rejection, playtest-on-painted-map, spawn zones drive the director, boss-arena delivery, walls eat shots, built-in realm1 via the plaza, spawns clear of walls) · zero console errors | ALL GREEN. Not a fun test |
| 2026-07-12 | (dev/Claude headless) | M3 (equipment/vault/affix-v2 chunk, ?v=m3b) | 6 suites, 118 checks total: m1 (23) · m2 (22) · m21 (18) · m3 (19) regressions · NEW m3b (24: v2→v3 migration + sanitizer, item/table integrity, past-cap math, chest TAKE/swap/ENTER, vault bank/equip/swap/full-guard, live-stat re-derive, gear dies + VAULT SURVIVES DEATH, fresh char re-enters realm) · NEW m3c (12: affixes un-gated, split shooter-only + mid-flight fork, one-time evolution, pack-leader caster skew + lift, capped champion bounty in the boss chest) · zero console errors | ALL GREEN. Not a fun test — M3 gate now humanly reachable: bank an item, return to a realm |
| 2026-07-12 | (dev/Claude headless) | M3 (nameplates + SPACE portals addendum, ?v=m3c) | 6 suites, 121 checks (m3c 12→15: portal gating, nameplate lifecycle ×2); every suite's realm entry now exercises the SPACE-activated portal path; retry-hardened against the headless low-fps timer gotcha (see TM-9 note) | ALL GREEN ×3 consecutive full batteries, zero console errors |
| 2026-07-12 | (dev/Claude headless) | M3.5 (REALM CONSOLE, ?v=m3d) | 6 suites, 129 checks (m3c 15→23: plaza boots EMPTY · console prompt · affix board toggles visibly ([x]/[ ]/counter) · SPAWN materializes portal wearing affixes · registry one-shot set/consumed · SPACE gating unchanged · prompt reads affixes back · realm HUD preview line; m21 plaza checks rewritten for the empty-boot plaza; every suite's realm entry now spawns via consoleSetMode+consoleSpawnPortal) | ALL GREEN ×3 consecutive full batteries, zero console errors |
| 2026-07-12 | (dev/Claude headless) | M3.5 (PORTAL WORKS, ?v=m3e) | 6 suites, 132 checks (m3c 23→26: dormant state (8 lights dark, no flow) · charge-up starts (board closed, portal NOT yet born) · charge-up completes (portal born, 8/8 lit, conduit flowing) · sealed rows inside console UI; m21 works-boot checks; all suites enter via consoleSpawnPortal(true) — the instant path — because the ~2.3s cinematic runs ~12s headless) | ALL GREEN ×3 consecutive full batteries on shipping code, zero console errors |
| 2026-07-12 | (dev/Claude headless) | M3.5 (portal-green color pass, ?v=m3f) | 6 suites, 132 checks — portal texture neutral + always tinted; mode colors in DATA.modes.*.color | ALL GREEN ×3 batteries (one m21 flake blip, 3× green on rerun — headless timer gotcha) |
| 2026-07-12 | (dev/Claude headless) | M3.5 (sound/rise/light pass, ?v=m3g) | 6 suites, 132 checks — m3c reworked: console brightens in range + NO floating prompts · run reads through light (portal/well in mode color, no label) · silent SPACE gating | ALL GREEN ×3 batteries (one m21 flake, 7 straight green after; 6-run repro hunt found nothing) |
| 2026-07-12 | (dev/Claude headless) | M3.6 (BESTIARY + green labels, ?v=m3h) | 6 suites, 135 checks (m3c 26→29: bestiary opens w/ 5 data-derived entries + slime stats · arrows reach the boss page (title/patterns/hints) · wrap-around + close) | ALL GREEN ×3 consecutive full batteries, zero console errors |
| 2026-07-12 | (dev/Claude headless) | M3.7 (RECORDS wall screen, ?v=m3i) | 6 suites, 137 checks (m3c 29→31: live readout on the glass w/ NO slot number anywhere · screen opens the merged records page; m2 retitled-overlay check) | ALL GREEN ×3 batteries + clean final battery (one m1 flake, 2× green rerun) |
| 2026-07-12 | (dev/Claude headless) | M3.7 (PORTAL MACHINE rename + hotkey labels, ?v=m3j) | 6 suites, 139 checks (m3c +2: hotkey labels, P opens the machine) | Full battery GREEN; flakes more frequent late-day (3 across 3 batteries, all green on serial rerun, all in timer-dependent sections — known headless slow-clock; consider hardening waits next session) |
| 2026-07-12 | (dev/Claude headless) | M3.8 (screen boot anims + lever + walk-to-interact, ?v=m3k) | 6 suites, 142 checks (m3c 33→36: login types the glass out · lever → graveyard stats page re-types + lever_down · hotkey walks THEN opens ×2; m3b/m2 adapted to walk-first hotkeys) | ALL GREEN ×3 full batteries. Real regression caught pre-ship (m3b V-press assumed instant open — failed 3/3 batteries until adapted). NEW GOTCHA: looped timers catch up under the slow headless clock — guard callbacks against firing after their own cleanup |
| 2026-07-12 | (dev/Claude headless) | M3.8 v2 (wider glass/giant switch/quiet wire/always-walk, ?v=m3l) | 6 suites, 142 checks | ALL GREEN ×3 full batteries, zero console errors |
| 2026-07-12 | (dev/Claude headless) | M3.8 v3 (SPACE throws the switch + hotkey chip, ?v=m3m) | 6 suites, 143 checks (m3c +1: chip (R)/(G) per lever state) | ALL GREEN ×3 batteries (one m2 timer flake, 2× green rerun) |
| 2026-07-12 | (dev/Claude headless) | M3.9 (chamber music: sequencer + original composition, ?v=m3n) | 6 suites, 143 checks — sequencer exercised headless in every suite (keypress unlocks audio), zero console errors | ALL GREEN ×3 full batteries |

## 5. Bug log

| # | P | Found | Description | Status |
|---|---|-------|-------------|--------|
| 1 | P1 | 2026-07-11 | TitleScene `starting` guard persisted across scene re-entry (Phaser reuses scene objects) — second visit to title screen ignored all slot clicks | FIXED same day (reset in create); caught by headless suite before shipping |
| 2 | P1 | 2026-07-11 | RealmScene `wireEvents()` re-registered listeners on every realm entry (scene.events keeps listeners across scene.start — same gotcha family as #1). A death after N realm entries wrote N graveyard entries + N deaths to the save | FIXED same day (off() before on() in wireEvents); caught by the M1 headless suite before shipping. Pre-existing since M0 |
| 4 | P1 | 2026-07-11 | Black screen after slot select on localhost:8000: python's http server sends no cache headers, so Chrome served a STALE MIX of old M1 js + new M2 js (e.g. old save.js with no `account.potions` + new scenes.js reading it) — NexusScene died mid-create. Code itself verified clean (continue path w/ v1 and v2 saves green headless) | FIXED same day: cache-busting `?v=` query strings on all script tags in index.html — BUMP ON EVERY SHIP (rule noted in README loop + EVENT_LOG). One hard refresh (Ctrl+Shift+R) picks it up |
| 5 | P1 | 2026-07-12 | Walls stopped shots physically but never killed them — and disabled THEMSELVES instead: with `collider(dynamicGroup, staticGroup, cb)` Phaser hands the callback **(staticChild, dynamicChild)**, reversed from the registration order. The callback assumed (shot, wall) and ran killProjectile on the WALL (disabling its body after first contact) while the arrow lived forever | FIXED same day (found by the m3 suite before shipping): callbacks identify the projectile by its `.proj` tag, never by argument order. Rule of thumb: never trust arcade collider arg order across group types |
| 3 | P1 | 2026-07-11 | F-fullscreen went fullscreen but the canvas stayed 960×640 in a corner (no scale mode in the Phaser config); a first FIT-based fix still letterboxed (3:2 game on a 16:9 screen) and the user wanted the game to FILL the screen | FIXED same day, v2: Scale.RESIZE + fullscreenTarget:'game' — fullscreen fills the whole screen and simply shows more world. Title/Nexus/pause/death layouts now read this.scale.width/height; spawn ring grows with the viewport so mobs still spawn off-screen (V11/TM-3); P added as alt pause key (real ESC exits browser fullscreen). Verified headless: 1600×900 fill, exit returns to 960×640, 23-check suite green |
