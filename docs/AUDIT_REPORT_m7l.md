# AUDIT REPORT — the 16 campaign maps (?v=m7l · 2026-07-17)

Full code audit of the 16 opus-built maps + the UI work you asked for. Four independent reviewers swept every map's art/map/scene files against the project's law list, then four fixers repaired everything worth repairing. **63 findings total: 3 critical, ~30 major, the rest minor.** Everything below is fixed, tested, and committed to your project folder unless marked *reported only*.

The full battery is green: **27/27 suites, 600+ checks** — all 16 map verifies, the 4 core realms, the factory boss sim (VICTORY 75s, 0 deaths), and every legacy suite.

---

## 1. THE UI WORK YOU ASKED FOR

### Portal machine (the dropdown bug in your screenshot)
The old dropdown drew all 22 map rows in a fixed column — with 20 live realms it overflowed the panel and piled rows on top of the header. Rebuilt per your spec:

- **SEARCH BAR at the very top** — just start typing while the machine is open; the list filters live (name + subtitle). Click-off or picking a map clears it.
- **MAP selector directly under it** (moved to the top of the panel, above GAME MODE).
- The open list is now **windowed — 10 rows at a time**, mouse-wheel scrolls, with "▲ N more / ▼ N more" buttons. Sealed ??? rows sit at the tail.
- Typing letters no longer triggers station hotkeys (B/V/P/G/R/M are muted while a search bar is capturing; ESC still closes).

### Bestiary (by map + search — did both)
- The book is now **scoped BY MAP**: it opens on whatever realm the portal machine has selected, shows `MAP: <realm>`, and **▲▼ (keys or click) cycles through all 20 realms**.
- A realm's page now lists its mobs + **its own boss(es) only** — no more scrolling through 20 bosses on every map.
- **SEARCH BAR**: type a creature name and it searches **every realm at once** ("kraken" → 3 matches across Pirate Ship + Abyss + Belly). Each card shows which realm the creature belongs to.
- Paging moved to the ARROW KEYS (◀▶ entries, ▲▼ maps) since letters now type into the search. ◀▶ click targets still work.

### Mob sizes (legibility pass)
**167 mobs resized across all 16 maps.** The new maps were running 34–50px while your approved graveyard/factory standards run 52–78px. Bump curve: under 30 → +6, 30–40 → +8, 42–48 → +6, 50–58 → +4, 60+ untouched (elephants, brachio, mossback etc. were already big). Hitboxes scale with the sprite (same art:body ratio), so bigger mobs are fair targets, not damage sponges.

### Boss sizes
Checked all 18 bosses. Most were fine (120–340px display). **Five humanoid bosses read small at 110 → bumped to 122**: the Outlaw Sheriff, Divinity Himself, the Social Engineer, the Ringmaster, the Brewmistress. Left alone: Titan Whale 340, Pale King 170, Shardlord 165, Nimbus Talon 160, Supreme Being 150, Volt Wyrm 150, Specimen Zero 150, Primordial 140, Satan 132, Sugar Bear 120, Neferu-Ka 120, Captain Kraken 120.

---

## 2. CRITICAL BUGS (all fixed)

1. **ABYSS — the Kraken Spawn killed itself.** Its slam lanes mowed every mob near them with no source exclusion — the lanes originate at the kraken, so every kraken died to its own first slam (~1 second in, full XP to you, never landed an attack). Mob-sourced lanes no longer mow mobs; boss lanes unchanged.
2. **SUGAR — the Sugar Bear ignored its own attack cooldown.** `bossUpdate` had no verb-rate gate: a new attack fired the frame each animation ended (~every 0.5s instead of every 5s), including 2–3 attacks **during the arrival cinematic** while you were rooted watching. Properly gated now.
3. **VICE VERSA — the beat-BOTH-bosses gate could be bypassed.** Melee/whirlwind/tornado/lightning damage goes through core `hurtBoss`, which cleared the whole realm when the FIRST boss died. Worse: a Knight literally could not damage the second boss at all (melee only ever targets `scene.boss`). Fixed with a new core hook — the map now owns both deaths, and after the first kill the survivor becomes the core boss target so every damage path works.

## 3. SYSTEMIC BUG FAMILIES — fixed once, in core

These four patterns each existed in 8–16 maps; fixing them centrally closed dozens of findings at once (core edits tagged `M7k AUDIT` in scenes.js/entities.js):

- **Telegraph graphics leaked on mid-warn deaths.** Kill any mob during its attack windup (or wipe the swarm with the boss portal roar) and its warning cone/lane/ring stayed painted on the floor forever. `clearNameTag` now sweeps every `_`-prefixed graphic a map hangs on a mob — every death path, all 16 maps.
- **Attacks resolved behind the pause menu.** Windup damage rode `time.delayedCall`, which kept ticking while paused — the same class as the old "ghost train launched behind the ESC menu" bug, present in ~10 maps (backhand, gaze, fire breath, water gun…). Pause now freezes the whole timer plane; nothing resolves while you're in the menu.
- **Long scouter reads banked the boss's whole kit.** Verb clocks armed before the scan; read the boss sheet for 15s and every attack fired the frame you dismissed it (all 12 mapOwned bosses). Dismissing now shifts every map clock by the read duration — same mechanism as pause.
- **Boss died mid-verb → its telegraphs stayed forever.** New `bossCleanup` hook, implemented in every map that needed it (rod rings, judgment tints, ricochet lanes, overload sectors, high-noon lanes…).

Plus three smaller core seams: **boss-portal placement hook** (the quota portal could spawn inside Neon's canyon / Vice Versa's river / Prehistoria's river = softlocked run — all three now relocate it), **`noLoot` spawns** (the Primordial's Compy Call was an infinite XP farm — boss-summoned adds now pay nothing), and **crate-child passthrough** (Neon's crate cap was silently broken → unbounded punk farm).

## 4. NOTABLE PER-MAP FIXES (beyond the families)

- **Vice Versa**: the first-kill cross-arena PORTAL was decorative — now actually teleports you. The boss you're NOT fighting no longer bombards you from 2500px away (1100px leash). The Supreme Being's telegraphs are now holy gold instead of Satan's hell-orange.
- **Colosseum**: INTERMISSION heal drops existed but were uncollectable dead objects — pickup implemented (+10 HP, green float).
- **Belly**: the "???" name reveal was dead code — beating the Titan Whale now really renames the realm to "Belly of the Beast" on the portal machine (and it survives reload). Portal-roar wipes no longer detonate phantom jelly-pops/krill into the cleared field.
- **Castle**: vampire lifesteal had a typo that made a successful leech REDUCE the vampire's HP at higher levels; reassembled Animated Armor rendered 96px with a corner hitbox (missing model entry — most shots through its center missed).
- **West**: rattlesnake cones never cleaned up after striking (cone litter everywhere); venom slows got stuck at the strongest value for the whole run.
- **Swamp**: piercing arrows hit hex totems every frame (one pass ≈ one-shot) — deduped; drain hexes now respect immunity gates.
- **Pirate**: the powder keg's fuse watcher could blast an unrelated recycled mob; the deck keg got a proper 48px sprite (hitbox was off-center).
- **Lunar**: magnetron's `pull` key collided with the factory crane's core verb (NaN clocks); revenants could grab you mid jump-pad flight.
- **Double-shift pause bugs** in 6 maps (clown/hound/gummy/leech dashes ran for the whole pause length after resuming — a 60s menu visit = 60s runaway dash).
- 'lunge' def-key collisions with the core ghoul verb renamed in west/sugar (NaN-state flashing mobs on the death screen).

## 5. REPORTED ONLY (small/cosmetic — say the word and I'll fix)

Pyramid quicksand slows you up to 60px outside its visible pit at high curse stacks · castle portrait-phantoms emerge from unmarked wall (their portrait decor was drawn but never placed) · skyisles/pyramid square telegraphs use circular hit-tests (corners are safe) · abyss coral snaps back instead of its designed staged regrow · sugar split-cap can slowly deflate if queued splits get dropped · timer dilation stretches telegraph timing on very low-fps machines (systemic Phaser behavior).

## 6. TESTS

All 27 suites green serially. 6 test files updated: m3c/m47/m5_grove/m7 asserted the OLD bestiary/dropdown contracts (updated to by-map + search + windowed list); m12/m14 had environment races (gate snapshot taken too late, 30s arrival timeout vs timer dilation, unparked spawn director polluting fixtures, splash RNG polluting the pot-tip check) — hardened, and m14's flake is deterministic-green now.

## 7. STATE + NEXT

- Version bumped **?v=m7l**; all 46 changed files committed to your project folder.
- **Git is still at m3q** — everything since (including this pass) is local-only until you run `2_SAVE_AND_UPLOAD.bat`. That's the one thing only you can do.
- Recommended next: a real playtest — the mob-size bump and the pause/scouter timing fixes change game feel most.
