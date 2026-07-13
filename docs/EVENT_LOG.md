# EVENT LOG — what changed, when, and why

> Append-only. Newest entries on top. One entry per work session or notable change.
> Format: date · milestone · **what landed** · files touched · notes/decisions.
> This file is the project's memory — if it's not logged here, it didn't happen.

---

## 2026-07-13 · M4 · KNIGHT BERSERKER REWORK · WIZARD STORM BARRAGE · BATTLE MUSIC (?v=m4c → m4d)

Three user directives in one push, all landed and suite-verified:

**1. KNIGHT = BERSERKER (user redesign).** He now TAKES A LOT MORE DAMAGE —
hp 145/17/920 → **115/12/720**, def 4/0.6/40 → **1/0.35/26** — and his survival
tool is the whirlwind's **LIFESTEAL** (`abilities.whirlwind.hpPerHit`: heals per
enemy each tick damages — spin deep in the pack, drink deep). Mana is REPLACED
BY **RAGE** (`classes.knight.resource` = MOLTEN LAVA orb in the HUD — lava fill +
a breathing glow that burns brighter as it fills + a molten sheen on the surface):
STARTS EMPTY every realm, has ZERO passive regen (`mpRegenPerSec: 0`), and FILLS
as the cleave connects (`weapons.sword.rageGain` per enemy hit — `meleeSwing`
counts hits and banks it). At 0 rage the channel REFUSES (nothing to spend —
`channelWhirlwind`'s mp>0 gate is now the only fuel gauge). The loop: wade in →
cleave to build rage → spin to shred + heal → rage runs dry → cleave again.

**2. WIZARD SPECIAL = STORM BARRAGE (user redesign, replaces the storm orbs).**
A machine gun of **LIGHTNING BALLS**: held channel, a ball every `fireEveryMs`
(90ms) DEAD STRAIGHT down the aim line, `mpPerShot` (2.5) each, no pierce, goes
quiet below the per-shot cost (`Entities.channelBarrage`). **THE PROC:** every
ball that CONNECTS has `strike.chance` (22%) to SUMMON A LIGHTNING BOLT down
onto that enemy — the old `lightningStrike`/`strikeVfx` system survives as the
proc payoff (area SIM.damage + jagged sky-bolt + flash + ring + shake), rolled
via SIM.rng in the shot→mob and shot→boss overlaps reading `proj.strike`. The
homing storm-orb system itself (spawnStormOrbs/updateStormOrbs/detonateOrb +
stormOrbs pool + `stormorb` texture) is REMOVED; new `zapball` art + `zap` SFX
(thunder stays for the strike). Also: the **staff is now CARRIED UPRIGHT like a
walking staff** (`weapons.frost.upright` — held vertical at the hand on the
facing side with a slight lean, instead of aiming out like a bow arm; the class
card stands it up too).

**3. "SWARMFRONT" — ORIGINAL 8-bit BATTLE MUSIC (M4.5).** The user asked for
battle music with the feel of FF8's *Don't Be Afraid* — that melody is
copyrighted (Uematsu/Square Enix), so this is an ORIGINAL composition chasing
the same engagement curve: A minor, 172bpm, 64-beat (~22s) loop in four acts —
relentless bass-ostinato DRIVE → two-step RISING BUILD (the whole engine shifts
C→D, phrases climb + shorten, 16th sprint to the top) → FRANTIC PEAK (high
eighth runs, 16th-ladder pulse) → TURNAROUND that re-arms the loop. Plays in
EVERY realm (`RealmScene.create`); CUTS TO SILENCE the moment the fight is
decided — boss down, survival horn, or death — so the silence is the release.
WAV preview rendered + delivered in chat.

**Tests:** m4_suite rewritten for the barrage (18 checks: data + strike proc +
cadence + straight/no-pierce/rider + per-shot cost + dry-fire refusal + direct
strike AoE + upright staff). m4b_suite extended for the berserker (26 checks:
rage data + starts-empty + cleave banks rage + lifesteal + zero-rage refusal).
Full battery GREEN on m4d: m4 18 · m4b 26 · m2 22 · m3b 24 · m3c 37.

**Files:** data.js, entities.js, scenes.js, textures.js, index.html (?v=m4d),
test/m4_suite.js, test/m4b_suite.js, docs. Balance knobs to watch (playtest):
knight hp/def cuts vs hpPerHit=2 · rageGain=8 vs mpDrainPerSec=20 ·
barrage mpPerShot=2.5/dmg=8/strike 22%·20dmg — all in data.js, all "TUNE ME".

---

## 2026-07-13 · M4 · Knight cleave resize + swing anim · Wizard Storm Orbs −20% (?v=m4b → m4c)

Same-session follow-up tweaks after seeing the Knight in motion (user calls):
- **Cleave was too small → now reaches as far as the whirlwind.** `weapons.sword.range`
  82→94 (= `abilities.whirlwind.radius`, so the hit reaches the same distance the
  whirlwind extends). The `slash` VFX was redrawn as ONE THICK COMMA (user call)
  — a single filled crescent tapering to a point — that PIVOTS at the Knight
  (origin 0.03,0.5) and scales `range/54` so the blade tip lands at the reach;
  `meleeVfx` sweeps it across the arc.
- **Knight now has a SWING animation.** The held sword sweeps through the arc on
  each attack (windup −arc → follow-through +arc, smoothstep-eased over
  `weapons.sword.swingMs`=160ms) instead of statically tracking the aim — driven
  by new `st.swingAt`/`st.swingArc` read in `Entities.updatePlayer` (melee weapons
  only; ranged still point at the aim).
- **Wizard Storm Orbs too strong → −20%.** `abilities.stormorbs.dmg` 30→24.
- Files: data.js, entities.js, scenes.js, textures.js, index.html (?v=m4c).
  Re-verified: m4b 21/21 + m4 16/16 still green.

---

## 2026-07-13 · M4 · THE KNIGHT — 3rd class (melee cleave + whirlwind + tornados) · audit bugs #7–#9 (?v=m4a → m4b)

**User design (answered live): the Knight is an armored MELEE bruiser** — the
roster's first non-projectile class. Basic attack = a curved CRESCENT CLEAVE
that sweeps forward toward the mouse and carves every mob in a frontal arc.
Ability (held) = WHIRLWIND, a channel: he spins, draining MP while held,
shredding anything inside the ring on a fast tick. **Mid-build user add:** the
whirlwind has a chance each tick to fling out a TORNADO that shoots outward and
grinds any enemy it laps. Tanky juggernaut: most HP + DEF, slowest, shallow MP
pool the whirlwind burns through. Both classes were already open; the Knight
auto-appears as a 3rd class card (no picker code — it's data-driven).

**What landed:**
- `data.js`: `classes.knight` (own base/growth/caps — top HP + DEF, slowest SPD,
  shallow MP; `texture:'knight'`, `accent`). New `weapons.sword` (`melee:true` +
  `range`/`arcDeg`, held sword art, no projectile). New `abilities.whirlwind`
  (`type:'whirlwind'` channel: `mpDrainPerSec`/`tickMs`/`dmg`/`radius` + a
  nested `tornado` proc block). New `slash` + `whirl` SFX. `ranger`/`wizard`
  gained an `accent` (picker reads `cls.accent`). Dead `console.hotkey`/`prompt`
  removed (audit dead-code).
- `entities.js`: basic fire BRANCHES on `weapon.melee` → `scene.meleeSwing`
  (projectile weapons unchanged). Ability BRANCHES on `type:'whirlwind'` →
  new `channelWhirlwind()` (held channel: drains MP over time + per-tick
  `scene.whirlwindTick`; sets `st.whirling`; costs nothing when it can't spin).
  Player state gained `whirling` + `lastWhirlTickAt`.
- `scenes.js` RealmScene: `meleeSwing` (frontal-arc hit on mobs + boss via SIM,
  `meleeVfx` crescent sweep) · `whirlwindTick` (AoE damage in radius + `whirl`
  SFX + rolls the tornado proc via SIM.rng) · `tornadoes` pool +
  `spawnTornado`/`updateTornadoes` (funnel shoots out, re-hits each overlapped
  mob every `reHitMs`) · `updateWhirlwind` (spinning ring VFX lifecycle). Class
  picker: reads `cls.accent`, adapts card width to 3+ cards, dynamic number hint.
- `textures.js`: `knight`, `sword`, `slash`, `whirl` (canvas), `tornado`
  procedural art. Removed the retired `pedestal` texture (audit dead-code).
- **AUDIT BUGS FIXED (2026-07-12 audit #7–#9):** #7 P1 — `drinkPotion` now
  passes `CURRENT.equipment` to `statsFor` (gear bonuses no longer vanish after
  a nexus drink). #8 P2 — `bestiaryUi` added to the `handleConsole` +
  `handlePortals` one-overlay guards. #9 P2 — bestiary paging now reads the
  moveLeft/moveRight actions LIVE from `BINDS.actionForEvent` (follows a rebind;
  default A/◄ + D/►) and its footer is built from `BINDS.keyLabel`. Dead-code
  sweep: `pedestal` texture, `console.hotkey`/`prompt`, the dead `T` key in the
  input rig — all removed.

**Testing:** NEW `test/m4b_suite.js` = 21 checks ALL GREEN (knight data/tanky
stats + caps/art/save+fresh/class-select/melee arc hits front-only + fires no
projectile/whirlwind drains MP + AoE ticks + stops on release/tornado spawns +
grinds/permadeath keeps knight/3-card picker/zero errors). Regression-clean:
m2 22 · m4 16 · m3b 24 · m3c 37 all still green on m4b. (The m1/m21/m3 suites
remain on the pre-m3o menu model — deferred this session, unchanged.)

**Files:** data.js, entities.js, scenes.js, textures.js, index.html (?v=m4b),
NEW test/m4b_suite.js, docs (this log + MILESTONES + NEXT_SESSION + TESTING).

**Still open for M4:** balance the Knight by playtest (all knobs in data.js —
`classes.knight`, `weapons.sword`, `abilities.whirlwind` incl. `.tornado`); the
M4 human gate (all 3 classes clear realm-1 + testers disagree on the best class).

---

## 2026-07-13 · M4 · THE WIZARD — 2nd class, class-select, frost + storm-orb lightning (?v=m3q → m4a)

**User design (answered live): the Wizard is a crowd-control caster.** Basic
attack = a FROST BOLT that pierces the whole line AND slows what it touches;
ability = STORM ORBS — a ring of lightning balls that home to enemies and call
down a LIGHTNING STRIKE (area damage) where they hit. Class is chosen ON THE
TITLE SCREEN at New Game (per slot); both classes open from the start; a slot
keeps its class through permadeath.

**What landed:**
- `data.js`: `classes.wizard` (own base/growth/caps — squishier + slower than
  the Ranger but deeper MP pool + regen and higher spell power; `texture:'wizard'`).
  New `weapons.frost` (pierce:true + `slow:{mult,ms}`, staff held art, frostbolt
  projectile). New `abilities.stormorbs` (`type:'stormorbs'` + orb/strike knobs).
  New `frost` + `thunder` SFX recipes. `ranger` gained `texture` + `blurb`; both
  classes gained a `blurb` for the picker.
- `entities.js`: `createPlayer` draws the CLASS texture (fixed the dead no-op
  ternary the audit flagged). Basic fire reads `weapon.texture`/`pierce` and
  attaches the frost `slow` rider to the shot. The ability BRANCHES on type
  (`volley` fan of arrows vs `stormorbs` hand-off to the realm; MP/cooldown only
  spent when the cast actually happens). New MOB SLOW status: `updateMob` moves a
  slowed mob at spd×mult + paints a frost tint (champions keep their affix tint);
  `applySlow()` helper; `spawnMob` resets the slow fields (pooled).
- `scenes.js` RealmScene: `stormOrbs` pool + `spawnStormOrbs` / `updateStormOrbs`
  (orbs launch outward then HOME to the nearest mob/boss) / `detonateOrb` /
  `lightningStrike` (SIM.damage area hit to mobs + boss) / `strikeVfx` (jagged
  bolt + flash + ring + shake). Frost slow applied in the shot→mob overlap.
  Class-aware shot/ability SFX. TitleScene: class-select overlay on NEW GAME
  (`promptClass`/`pickClass`/`createNewGame`/`enterSlot`; number keys + ESC).
  `freshCharacter(cls)` + `onDeath` keep the slot's class on permadeath.
- `save.js`: `blank(cls)` seeds the chosen class + unlocks both; guards a bad key.
- `textures.js`: `wizard`, `staff`, `frostbolt`, `stormorb` procedural art.
- `index.html`: ?v= m3q → **m4a**.

**Tests:** NEW `test/m4_suite.js` — **16/16 GREEN** (class data, per-class stats,
textures, SAVE.blank(cls)/freshCharacter(cls), title class-select builds a Wizard
slot, Wizard sprite+staff in the nexus, frostbolt pierces+slows, mob slow cuts
speed, storm orbs spawn+home+detonate, lightning area damage, permadeath keeps
class, zero console errors). The six existing suites had their new-game entry
updated `Title.chooseSlot(1)` → `Title.createNewGame(1,'ranger')` (the class-
select step changed the entry point). **m2 / m3b / m3c GREEN; the M4 build is
regression-clean** (verified identical pass-counts vs pristine m3q before any
divergence).

**Found during the battery re-run (PRE-EXISTING, not M4):** `m1` / `m21` / `m3`
crash on retired flows — the old PAUSE-MENU volume slider (ArrowLeft) and the
`q`-returns-to-nexus key, both replaced by the unified ESC menu at m3o. They
crash IDENTICALLY on pristine m3q, so this is m3o menu-overhaul drift, not the
Wizard. Logged in TESTING.md; these three suites need porting to the m3o menu
model (part of the still-open "m3d/settings suite" work).

**Still open (unchanged by this session):** audit bugs #7 (P1 drinkPotion) /
#8 / #9; M3 Q3/Q5 flags + CC0 art; M4 Knight + class unlock chain + the M4 gate
playtest; the m1/m21/m3 suite port above.

---

## 2026-07-12 · AUDIT · Full code + documentation audit (?v=m3q — no code changed)

**User ask: audit all code, verify every shipped feature is recorded in the docs,
list what remains to build, and refresh the plan/NEXT_SESSION/README where needed.**
Every game/js file, index.html, all 6 test suites, and all 8 docs were cross-read.

**Verdict: docs were CURRENT through m3q** — every shipped feature (M0→M3.11 + the
m3q black-HUD-readout addendum) is recorded in MILESTONES + EVENT_LOG. Git is
up to date too (5 uploads on 2026-07-12, latest "bug updates and recoloring text"
18:12 = m3q).

**Fixed doc drift:**
- `README.md`: controls rewritten for m3q reality (auto-fire = Settings checkbox
  not T; ESC = unified menu everywhere + keyboard-lock fullscreen behavior, P-pause
  gone; REALM CONSOLE → PORTAL MACHINE; added bestiary/records-lever/chamber-music/
  remappable-keybinds/XP-bar HUD; file table + roadmap refreshed; build tagged m3q).
- `ARCHITECTURE.md`: file map gained `binds.js` + `menu.js`; save.js settings note
  updated (split audio + binds); §5 scene flow ESC note updated.
- `TESTING.md`: TM-1 auto-fire line updated; playtest log gained the m3o (13/13) and
  m3p (21/21) smoke-test rows + this audit; bug log gained #6 (looped-timer headless
  gotcha, documented) and NEW OPEN findings **#7 (P1: drinkPotion recomputes live
  stats without the equipment arg — gear bonuses drop after a nexus drink), #8 (P2:
  bestiaryUi missing from handlePortals/handleConsole overlay guards), #9 (P2:
  bestiary nav hardcodes arrows instead of BINDS + stale static fallback footer)**.
- `PRODUCT_PLAN.md` → v1.4: §5 travel structure = PORTAL CHAMBER (E5 evolved).
- `NEXT_SESSION.md`: 142→143 check-count fix + step 0.5 added (fix audit bugs #7–#9,
  sweep dead code: unused `pedestal` texture, dead T key in the input rig, unused
  DATA.console.hotkey/prompt, no-op ternary in createPlayer).

**Still to build (roadmap unchanged — no re-plan needed):** M2 Fun Gate 1 (human) ·
M2.1 dev self-test (human) · M3: Q3/Q5 flags, CC0 art batch 1, TM-8 manual tile-import
check, m3d/settings suite + 143-battery re-run on m3q, M3 gate playtest (human) ·
M4 Wizard/Knight/class-select · M5 content ramp + DATA.console.live flip · M6 polish.

---

## 2026-07-12 (addendum) · M3.11 · HUD numbers → black (?v=m3p → m3q)

**User: the combat HUD numeric readouts (health, XP, mana) should be BLACK, not
white.** Changed hpOrbText / mpOrbText / xpText color `#f4f4f4` → `#000000` in
buildHud (`scenes.js`) — black reads on the bright red/blue orbs and the gold XP
fill. Objective/affix/debug HUD text unchanged. `index.html` **?v= m3p → m3q**.
Smoke test still 21/21 green, zero console errors.

---

## 2026-07-12 · M3.11 · HUD XP BAR · AUTO-FIRE CHECKBOX · ALT KEYBINDS (?v=m3o → m3p)

**User polish on the m3.10 work: (1) kill the bottom action box — show ONLY a
segmented XP bar across the bottom between the health & mana orbs, split into 5
sections by blue dividers, with a #/# readout; (2) auto-fire is NO LONGER a key
— only a checkbox in Settings; (3) EVERY keybind gets a 2nd (alternate) binding,
and by default only WASD has alternates (the arrow keys).** Design calls
(AskUserQuestion): the #/# = XP-into-level / needed; drop the ability tile and
level text entirely — just the XP bar.

**Landed:**
- HUD XP BAR (`scenes.js`): the glass action box + ability tile + auto-fire text
  + "Lv N" are GONE. A single 16px bar spans hpOrb→mpOrb along the bottom: dark
  track, gold progress fill, 5 equal segments cut by 4 blue (0x41a6f6) dividers,
  blue border, centered `floor(xp) / needed` (or `MAX` at cap). New `this.xpText`
  replaces abilityText/barText/lvText.
- AUTO-FIRE → SETTINGS CHECKBOX (`data.js`, `menu.js`, `scenes.js`): removed the
  `autofire` keybind action; added a GAMEPLAY section in Settings with an
  Auto-fire [ON/OFF] toggle (writes `settings.autoFire`). The realm reads
  `SAVE.settings().autoFire` LIVE each frame (`rig.collect`), so the toggle takes
  effect immediately; the old `this.autoFire` field + `toggleAutoFire` + the T
  dispatch are gone.
- ALTERNATE BINDINGS (`data.js`, `save.js`, `binds.js`, `menu.js`, `scenes.js`):
  binds are now `{ primary, alt }` per action (was a single event.code). Only the
  four movement actions ship with a default alt (Arrow keys). `save.js` migrates
  the m3o single-string format → `{primary: <old>, alt: <default>}`. `BINDS`:
  keyLabel = primary, new `altLabel`, `actionForEvent` matches EITHER slot,
  `rebind(id, slot, code)` de-dupes across both slots, `code(id, slot)` for the
  rig. The rig polls primary+alt for movement AND interact (`held()`,
  `interactJustDown()` — the 6 SPACE-in-range station checks now honour the alt).
  Settings keybinds list = two columns, each row `label [primary] [alt]`; footer
  drops the auto-fire hint.

**Files:** `scenes.js` (HUD, rig primary/alt, interactJustDown ×6, live
auto-fire), `menu.js` (Gameplay auto-fire + two-chip keybind rows), `binds.js`
(two-slot model), `save.js` (`defaultBinds` + migration + resetBinds), `data.js`
(alt defaults, autofire removed), `index.html` (footer, **?v= m3o → m3p**).

**Testing:** container smoke test rewritten + green **21/21**, zero console
errors: 12 binds seeded (no autofire), moveUp alt = arrow, non-move alt = —,
auto-fire is a boolean setting that flips live, rebind primary + set an alt +
dispatch matches BOTH slots, HUD has xpText and dropped bar/lv, XP text is #/#.
Screens of the segmented XP-bar HUD + the new Settings (auto-fire + primary/alt
keybinds) delivered. STILL: not in the numbered suites; 143 battery not re-run
on m3p.

**Next up:** re-run + extend the numbered suites for m3o/m3p; then Q3/Q5 flags →
CC0 art. User to run `2_SAVE_AND_UPLOAD.bat`.

---

## 2026-07-12 · M3.10 · SETTINGS, ESC MENU & REMAPPABLE KEYBINDS (?v=m3n → m3o)

**User ask: ESC should stop dropping out of fullscreen (only F toggles it); a
menu on ESC with a fullscreen/audio checkbox, an "exit to load screen" option
to portal out (like when in a map), and a settings button to adjust/enable/
disable music AND sound-effect volumes separately. Follow-up: add a KEYBINDS
section — remapping a key must live-update its on-screen label (e.g. the (P)
beside the portal machine) and every other key label that shows a key.**
Design calls taken via AskUserQuestion: split into Music + SFX each with on/off
(those toggles ARE the "checkboxes"); ONE menu shared by chamber + realms.

**Landed:**
- FULLSCREEN FIX (`main.js`): on `enterfullscreen`, `navigator.keyboard.lock
  (['Escape'])` (Keyboard Lock API, Chrome/Edge, secure context) routes ESC to
  the page — a single tap opens the menu; HOLD-Esc still exits fullscreen.
  Failure-safe (unsupported → no throw). Only the fullscreen key (rebindable,
  default F) toggles fullscreen now; P-as-pause is retired.
- SPLIT AUDIO (`audio.js`, `save.js`, `data.js`): a dedicated `sfxBus` + a
  `musicBus` under master; new settings `musicVolume/musicOn/sfxVolume/sfxOn`
  (old single `volume` migrates into both). API: `AUDIO.setMusicVolume/
  setSfxVolume/setMusicOn/setSfxOn` + getters. On/off folds a hard 0 into the
  bus gain so flipping it back restores the exact slider value.
- UNIFIED ESC MENU (`menu.js`, new): `MENU.open(scene,cfg)` — same pop-up in
  the chamber AND realms. Root = Resume · Settings · scene exits (chamber:
  "Exit to load screen"→Title; realm: "Return to chamber"→Nexus + "Exit to
  load screen"→Title). Settings page = Music/Sound rows (◄ bar ► + ON/OFF)
  and a two-column KEYBINDS list; click a chip → "press a key" → next keydown
  rebinds (Esc cancels); + "Reset keybinds".
- REMAPPABLE KEYBINDS (`binds.js`, new): `DATA.keybinds.list` = 13 actions
  (4 move, interact, autofire, portal, vault, bestiary, recordsUp/Down, menu,
  fullscreen; M + F3 stay fixed dev keys). Bindings stored as layout-independent
  `event.code` strings in `settings.binds`. `BINDS.wire(scene,actions)` adds ONE
  `keydown` listener that reads the binds map LIVE → a rebind takes effect with
  zero re-registration. `BINDS.rebind` swaps on conflict. Movement + interact
  repoint through `rig.refresh()` (keys.SPACE repointed IN PLACE, so every
  existing `rig.keys.SPACE` interact/confirm check follows the interact bind).
- LIVE LABELS: station chips (vault/bestiary/portal-machine/lever) store refs +
  `refreshBindLabels()`; realm HUD ability/auto-fire text reads BINDS each
  frame; the page footer is BUILT from BINDS via `window.updateFooter` and
  refreshed on every rebind.

**Files:** NEW `game/js/binds.js`, `game/js/menu.js`; edited `game/js/audio.js`
(split buses), `game/js/save.js` (settings + `resetBinds` + migration),
`game/js/data.js` (`keybinds.list`), `game/js/scenes.js` (central dispatch,
rig repoint, live labels, realm pause → shared menu, nexus openMenu/
refreshBindLabels), `game/js/main.js` (keyboard lock + resize→MENU.relayout),
`game/index.html` (loads binds.js + menu.js, dynamic footer, **?v= m3n → m3o**).

**Testing:** VERIFIED via a one-off container smoke test — 13/13 green, zero
console errors: audio split API + on/off + migration; all 13 binds seeded;
rebind updates label + persists (event.code); chamber menu opens/closes; the
vault chip live-updates on rebind; realm pause opens the shared menu. Screens
of the chamber menu, settings/keybinds panel, and realm pause delivered to the
user. NOTE: not yet folded into the numbered suites (m3d/settings TODO), and
the 143-check battery has NOT been re-run against m3o.

**Caveat surfaced to user:** the ESC-in-fullscreen fix needs a secure context —
run via `START_SERVER.bat` (http://localhost); a plain `file://` double-click
may not grant Keyboard Lock, so ESC could still leave fullscreen there.

**Next up:** re-run the 143 battery on m3o + add a settings/keybinds suite;
then back to Q3/Q5 flags → CC0 art. User still to run `2_SAVE_AND_UPLOAD.bat`.

---

## 2026-07-12 · M3.9 · "THE CHAMBER AT REST" — the portal room gets music

**User ask: an 8-bit Balamb Garden (FFVIII) for the chamber. That melody is
COPYRIGHTED (Uematsu / Square Enix — an 8-bit cover is a derivative work), so
per the user's fallback: an ORIGINAL calming chiptune in the same emotional
space, composed for this game. No files, no licenses — it's data, like every
other sound (Lane A).**

**Landed:**
- MUSIC SEQUENCER in audio.js: songs are data (DATA.audio.music.*) — tracks
  of [note, beats] pairs (null = rest), each an oscillator voice with a soft
  envelope; loops via a lookahead timer; failure-safe (no Web Audio → silence,
  never a crash); waits for the browser's audio unlock and starts on the first
  gesture; idempotent (resize restarts don't hiccup the song); follows the
  master volume control.
- "THE CHAMBER AT REST" (original composition, 72bpm, 32-beat loop ≈ 27s):
  I–V–vi–iii–IV–I–ii/V–I — the classic warm descent — in three chip voices:
  triangle bass (slow root/fifth), soft square arpeggios (gentle eighth-note
  motion), and a small, kind square lead. Safe-place energy, retro to the bone.
- Plays ONLY in the Portal Chamber: starts on nexus create, stops on portal
  entry (the chamber falls silent as the works go dark), ESC-to-title, and
  the M builder door.

**Files:** `audio.js` (sequencer: noteHz/scheduleLoop/playMusic/stopMusic +
unlock hook), `data.js` (the composition), `scenes.js` (play/stop wiring),
`index.html` (**?v= m3m → m3n**). **143 checks ALL GREEN ×3 full batteries —
the sequencer ran headless in every suite (keypresses unlock audio) with zero
console errors.** Preview WAV rendered for the user pre-ship.

## 2026-07-12 (addendum) · M3.8 · SWITCH v3 — SPACE throws it, and it wears its key

**User polish (?v=m3m):**
- SPACE at the switch THROWS it (handleSwitch — same proximity pattern as
  every station; the lever brightens in range).
- A floating hotkey chip above the lever shows the key that flips it to the
  OTHER page: (G) while records is up, (R) while graveyard is down; updates
  on every flip.
- Left-click on the lever confirmed: walks the character over, then throws it
  (same trip as the hotkeys).

**Files:** `scenes.js` (leverLabel, handleSwitch), `index.html`
(**?v= m3l → m3m**), m3c (+1 check: chip reads (R)/(G) per state; now 143
checks). **ALL GREEN ×3 full batteries** (one m2 timer flake, 2× green rerun).

## 2026-07-12 (addendum) · M3.8 · SWITCH v2 — bigger glass, heavier iron, quieter wire

**User review (?v=m3l): graveyard font too small · switch should be a GIANT
metal thing · the wire should only carry energy when the switch is USED ·
R/G should walk you to the switch REGARDLESS of its position.**

- WIDER GLASS: wallscreen texture 130→190 wide; base font 11→12 — the
  graveyard page ("FALLEN · TOTAL KILLS · REALMS ENTERED · LAST: …") now
  renders full-size; auto-fit remains as a fallback for monster numbers.
- GIANT METAL SWITCH: the lever is a riveted breaker plate (17×24 frames,
  aligned so only the HANDLE moves when thrown) mounted beside the screen.
- QUIET WIRE: the ambient pulse stream is gone — throwing the lever fires a
  3-pulse burst down the wire, then it goes dark again.
- ALWAYS-WALK: R/G now walk the character to the switch whatever page is
  showing (setRecordsMode no-ops on arrival if it's already there) — before,
  the trip only happened when the page needed changing.

**Files:** `textures.js` (wallscreen v2, lever frames), `scenes.js` (layout,
font, burst-only pulses, guard removal), `data.js` (records knobs),
`index.html` (**?v= m3k → m3l**). **142 checks ALL GREEN ×3 full batteries.**

## 2026-07-12 · M3.8 · THE CHAMBER COMES ALIVE — typed glass, ramping numbers, the lever, and walk-to-interact

**User spec (?v=m3k): the records glass should BOOT — empty on login, then the
letters hammer out one by one; returning from a realm keeps the letters and
RAMPS the numbers (slow ticks, then they fly). A large UNLABELED LEVER swaps
the readout between character records (R) and graveyard stats (G), re-typing
on every flip, with a live wire feeding the screen portal-machine-style. And
hotkeys stop teleporting windows open: the character WALKS to the station
first, then interacts.**

**Landed:**
- SCREEN BOOT: NexusScene now knows how you arrived (scene.start data —
  Title passes entry:'login', all realm exits pass entry:'realm'; resize/
  builder pass nothing). Login → glass boots EMPTY, letters type out rapidly
  with a cursor + key ticks. Realm return → letters present, numbers count up
  with cubic ease-in (a few slow ticks, then they shoot to the final values).
  Knobs in DATA.juice.records.
- THE LEVER (new lever_up/lever_down textures, left of the screen): up =
  records page, down = GRAVEYARD STATS (fallen · total kills · realms entered
  · last death) — a new second readout. R/G hotkeys and clicking the lever
  flip it; every flip re-TYPES the glass. Page choice survives resize
  restarts (registry). A wire of conduit segments runs lever → screen with
  green energy pulses traveling it constantly (mini portal-machine), plus a
  double-pulse burst on each flip.
- WALK-TO-INTERACT: V/B/P/R/G and station clicks no longer open instantly —
  the character walks a straight line to stand JUST BELOW the station, then
  the window/action fires (body.reset snap on arrival). Manual movement
  cancels the trip; a hotkey whose window is already open still closes it
  instantly; flipping to the already-active page does nothing.
- G no longer opens the records page directly (it flips the lever) — the full
  page opens by walking to the screen (click) or SPACE in range. ESC-to-title
  still yields to any open overlay first.

**BUG found & fixed pre-ship (new gotcha for the book): looped Phaser timers
CATCH UP under the slow headless clock — after the final tick nulls the timer,
the same callback can fire AGAIN in the same frame → null.remove() crash.
Guard looped-timer callbacks with `if (!self.timer) return;`.**

**Files:** `data.js` (juice.records), `textures.js` (lever_up/lever_down),
`scenes.js` (entry tags on all Nexus starts, records anim system, lever+wire,
stations map + requestStation/autoWalk, catch-up guards), `index.html`
(footer, **?v= m3j → m3k**), suites (m3c 33→36: typed boot, lever page,
walk-then-open ×2, P-walk; m3b + m2 adapted to walk-first hotkeys).

**Verified: 142 checks — ALL GREEN ×3 consecutive full batteries, zero console
errors.** (m3b initially failed ALL batteries — a real catch, not the flake:
its V-press assumed instant opening. That's the regression-suite system
working as designed.)

**Next up:** unchanged — Q3/Q5 flags · CC0 art batch 1 · then M4 (Wizard).

## 2026-07-12 (addendum) · M3.7 · NAMES & HOTKEYS — PORTAL MACHINE (P), BESTIARY (B)

**User polish (?v=m3j): the bestiary label reads its hotkey, and the portal
computer is renamed.**

- REALM CONSOLE → **PORTAL MACHINE** (DATA.console.name + new hotkey field),
  with a **P** hotkey that opens the board from anywhere in the chamber; its
  station label reads "PORTAL MACHINE (P)". (P still pauses inside a realm —
  scene-scoped keys don't collide.)
- Bestiary label reads "BESTIARY (B)". All three stations now advertise their
  hotkeys: VAULT (V) · BESTIARY (B) · PORTAL MACHINE (P).
- Footer updated. m21's works check + new m3c checks (labels carry hotkeys;
  P opens the machine, ESC closes).

**Verified: 139 checks (m3c 31→33), full battery GREEN.** Flake note: suite
flakes got more frequent late in the day (m21/m2/m3b each failed once across
batteries, ALWAYS green on serial rerun; container healthy — no zombie
processes, 7GB free). All failures cluster in timer-dependent sections =
the known headless slow-clock gotcha. If it keeps up, next session should
harden those waits rather than chase ghosts.

## 2026-07-12 · M3.7 · THE RECORDS SCREEN — the header becomes furniture

**User ask (?v=m3i, design settled via Q&A): the floating account header
("Slot 1 · Ranger Lv 11 · Deaths 5 …") becomes an in-world SCREEN. Calls of
record: wall screen that's always readable (no interaction needed) · the old
floating header is REMOVED · active slot only and NO slot number displayed
anywhere · the graveyard MERGES in as the records page.**

**Landed:**
- THE RECORDS SCREEN: a wide wall monitor (new 'wallscreen' texture — bezel,
  dark-green glass, sheen, power pip, mounting struts) hangs under the chamber
  title. Its glass carries the LIVE readout in glowing phosphor green:
  "RANGER LV 11 · DEATHS 5 · BEST LV 11 · REALMS CLOSED 4 · POTS 3". No slot
  number by design. Auto-fit: the font steps down if the numbers outgrow the
  glass. Re-rendered on create and after drinking a potion.
- FLOATING HEADER GONE — zero floating UI text left in the chamber.
- GRAVEYARD MERGED: the G overlay is now the RECORDS page ("the account ·
  fallen heroes"), green-themed; opened by G, clicking the wall screen, or
  SPACE in range (the screen leans toward you like the other stations). ESC
  closes it before meaning "to title". Footer says "G records".

**Files:** `textures.js` (wallscreen), `scenes.js` (records screen +
updateRecordsScreen w/ auto-fit + handleRecords + gy retitle + ESC),
`index.html` (footer, **?v= m3h → m3i**), m2 (retitled check), m3c (+2:
readout w/ no slot anywhere; screen opens the records page).

**Verified: 137 checks — m3c 29→31 — ALL GREEN ×3 full batteries + a clean
final battery on shipping code** (one m1 flake mid-run, 2× green on rerun —
same rare load blip). Screenshots: wall screen lit over the works · records
page with fallen heroes.

**Next up:** unchanged — Q3/Q5 flags · CC0 art batch 1 · then M4 (Wizard).

## 2026-07-12 · M3.6 · THE BESTIARY — the chamber learns what lives out there

**User ask (?v=m3h): a bestiary computer on the right wall mirroring the vault
(same height, same edge spacing), green "BESTIARY" above it, browsable pages of
every implemented mob + boss. Plus a green-label pass: "VAULT (V)" in green
ABOVE the chest (banked counter + "POTION STASH" header + empty-state line all
removed), "REALM CONSOLE" label green.**

**Landed:**
- THE BESTIARY (new green-screened terminal texture at W−120, mirroring the
  vault at x=120): click, B, or SPACE in range (brightens like the console).
  Overlay = one page per creature — big portrait, name, role (CHASER/SHOOTER/
  BOSS w/ the boss's title), stat block (HP/speed/XP/threat cost/contact dmg;
  shooters add bolt dmg/range/speed/cooldown/volley), and behavior notes
  (derived: chaser vs sprayer, unlock time, champion roll odds; boss: both
  attack patterns with numbers + the three scouter hints). Navigation: LEFT/
  RIGHT arrow keys or clickable ◀ ▶, wrap-around, entry counter. B/ESC closes.
- EVERYTHING IS READ LIVE FROM data.js (DATA.mobs + DATA.bosses) — a new mob
  or boss appears in the book automatically, zero bestiary code changes.
- Green-label pass: all station labels (VAULT (V) · BESTIARY · REALM CONSOLE)
  are portal-green, above their object, shadowed; vault banked counter,
  POTION STASH header, and the empty-stash hint are gone (potion rows remain,
  now shadowed for readability). Footer adds "B bestiary".
- Overlay etiquette: bestiary joins the one-overlay-at-a-time ring (closes /
  closed by vault, graveyard, console); ESC closes it before meaning "to
  title"; arrow-key listeners wired per-open, off on close (bug #2 family).

**Files:** `textures.js` (bestiary terminal), `scenes.js` (station + overlay +
nav + label pass), `index.html` (footer, **?v= m3g → m3h**), m3c (+3 checks:
5 entries w/ slime stats, boss page shows title/patterns/hints, wrap + close).

**Verified: 135 checks — m3c 26→29 — ALL GREEN ×3 consecutive full batteries,
zero console errors.** Screenshots: chamber with both stations · slime ·
warlock (full shooter block) · Grovekeeper page.

**Next up:** unchanged — Q3/Q5 flags · CC0 art batch 1 · then M4 (Wizard).

## 2026-07-12 (addendum 2) · M3.5 · SOUND, RISE & LIGHT — the chamber gets a voice and loses its labels

**User review round 3 (?v=m3g): sounds for the works, a rise-from-the-floor
spawn, no instructional text inside the frame, readable header, and the room
renamed PORTAL CHAMBER with lighting that lives in the map.**

**Landed:**
- SOUND: audio.js grew a filtered-noise layer (gated white-noise bursts through
  a highpass — sparks, not hiss) and per-note `jitter` (electric wobble). Two new
  data recipes: `charge` — a rising jittery sawtooth arc over a crackle bed
  (ELECTRICITY, plays as the conduit charges) and `spawn` — a bright descending
  square zap with a spark tail (the PHASER, plays as the portal tears open).
  'portal' still marks actual entry.
- RISE FROM THE FLOOR: the portal is born as a flat sliver sunken in the
  platform well and climbs up while unfolding (y+22 → y, scaleY 0.12 → 2.2,
  Back.Out) under the flash + shake.
- NO TEXT INSIDE THE FRAME (user: "we only need text outside the frame"): the
  floating SPACE prompts (portal + console), the affix signpost label, and the
  two-line in-game help block are all GONE. The page footer now leads with
  "SPACE to interact (console, portal, chests)". In range, the console
  BRIGHTENS (scale 3 → 3.3) as the diegetic invitation. The run reads through
  LIGHT: mode-colored portal, ring, and well glow. (Affixes remain visible on
  the console board and the realm HUD preview line.)
- PORTAL CHAMBER: "THE NEXUS" title is now PORTAL CHAMBER — pale green with a
  breathing green halo (new 'softglow' radial texture) so the glow reads as
  light inside the map. More map lighting: the platform well is a glow pool
  (dim blue dormant → flooding mode color when powered, breathing) and the
  console screen spills blue. Account line + vault label went white-with-
  shadow (the old light-blue-on-light-floor was unreadable).

**Files:** `audio.js` (noiseLayer + jitter), `data.js` (charge/spawn recipes),
`textures.js` (softglow), `scenes.js` (rise, prompts removed, title/halo,
glow pools, readable labels), `index.html` (footer rewrite, **?v= m3f → m3g**),
m3c (prompt/label checks → light-based checks, 26 checks).

**Verified: 132 checks ×3 full batteries GREEN** (one m21 flake, then 7 straight
green — the rare headless load blip; couldn't reproduce in a 6-run hunt).
Screenshots: dormant chamber with glowing title · powered works, all light no text.

## 2026-07-12 (addendum) · M3.5 · PORTAL GREEN — the portal texture goes neutral, colors go data

**User review of the works build: "a little hard to see a blue portal on a blue
background — make it green like in Rick and Morty." Done, and properly:**

- The `portal` texture is now NEUTRAL GREYSCALE and always tinted by purpose —
  no more baked-in blue. Realm-clear portals (nexus + title decor) are PORTAL
  GREEN (`DATA.modes.clear.color = 0x49e83b`), the time trial stays gold
  (`DATA.modes.survival.color`), and the realm BOSS portal's red tint is now a
  TRUE red (tinting the old blue texture used to multiply into mud).
- Mode color is data: ring lights, conduit pulses, portal, and the signpost
  label all derive from `DATA.modes[mode].color` — one knob per mode.

**Files:** `data.js` (modes.*.color), `textures.js` (neutral portal grid),
`scenes.js` (always-tint, label color derived, title portal tinted),
`index.html` (**?v= m3e → m3f**).

**Verified: 132 checks × 3 full batteries GREEN** (one m21 headless-flake blip,
green 3× straight on rerun — the known ~5×-slow-timer gotcha). Screenshots:
green portal + green ring + green pulses over the blue nexus floor.

## 2026-07-12 · M3.5 · THE PORTAL WORKS — one platform, and the console visibly powers it

**User review of the console build: four pedestals is three too many. Redesign of
record (2026-07-12): ONE portal platform, and the nexus should look like the
CONSOLE POWERS THE PORTAL. Design calls (user): center stage · sealed realms move
INSIDE the console UI · cinematic ~2s charge-up · full power fantasy (dormant /
charging / powered states).**

**Landed:**
- THE PORTAL WORKS: the new nexus centerpiece — a big stone PLATFORM (new 64px
  procedural ring texture, 8 light sockets) at the heart of the room, an energy
  CONDUIT (new tile) running down to the REALM CONSOLE, player arrives just south
  of the console. The pedestal plaza is GONE (`DATA.plaza` deleted, buildPlaza →
  buildPortalWorks); future realms are dim SEALED rows inside the console's mode
  list (`DATA.console.sealed`).
- THREE POWER STATES: DORMANT — ring lights dark, conduit dead, console screen
  dim-pulsing. CHARGING (~2s, on SPAWN): console flares white → 3 pulses race up
  the conduit → the 8 ring lights ignite one per 100ms in the MODE COLOR (blue
  clear / gold trial) with a tick of audio each → the portal tears open (flash +
  shake). POWERED: a pulse flows console→platform every 400ms, the ring breathes,
  portal spins; run label sits beside the platform like a signpost. Enter → the
  works go dark behind you (one-shot unchanged). All timings are data:
  `DATA.juice.conduit`.
- Plumbing kept from the console build: registry one-shot (a resize mid-charge
  rebuilds the POWERED state instantly — no replayed cinematic), SPACE-commit
  prompt reads the run back, affixes still PREVIEW-only until `DATA.console.live`.
- `consoleSpawnPortal(instant)` — instant=true skips the cinematic: used by the
  registry rebuild and by every suite's realm entry (the ~2.3s cinematic would be
  ~12s headless at ~5× slow). m3c plays the FULL cinematic once and asserts each
  phase: dormant (lights dark, no flow) → charging (board closed, portal not yet
  born) → powered (portal born, 8/8 lit, conduit flowing).

**Files:** `data.js` (DATA.plaza deleted; console.modes/sealed; juice.conduit),
`textures.js` (platform ring, conduit tile, glowdot), `scenes.js` (buildPortalWorks,
conduitPulse/powerUp/powerDown, charge cinematic in materializePortal, createPortalAt,
signpost label, player spawn moved south of console), `index.html` (**?v= m3d → m3e**),
suites (m3c 23→26 — power-state phases + sealed rows; m21 works-boot checks;
all suites' entries use instant spawn).

**Verified (headless Chromium): 132 checks — m1 23 + m2 22 + m21 18 + m3 19 +
m3b 24 + m3c 26 — ALL GREEN ×3 consecutive full batteries on the shipping code,
zero console errors.** Screenshots: dormant works · console board with sealed
rows · pulses mid-charge · ring igniting · powered portal with signpost + prompt.

**Next up:** Q3/Q5 behind flags · CC0 art batch 1 · then M4 (Wizard).

## 2026-07-12 · M3.5 · THE REALM CONSOLE — the plaza boots empty; you configure the run, then the portal exists

**User review of the m3c build: pre-existing portals aren't the vision. Decision of
record (2026-07-12): NO portal in the nexus until the player uses an interactive
screen — pick the mode, slot the affixes onto the map, SPAWN the portal, step
through. Design calls (user): one central console · risk=reward affix framework ·
one-shot portal consumed on entry · PLACEHOLDER affixes only (toggleable + visible,
NOT live yet).**

**Landed:**
- REALM CONSOLE (new `DATA.console`, `console` texture in textures.js): a glowing
  terminal in the plaza. Walk up → "SPACE — use the REALM CONSOLE" → a PoE-map-device
  style board: GAME MODE select (Realm Clear / Time Trial) + MAP AFFIX board
  (apex / escalating / hordes from `DATA.affixes.map`, max 3 slots) + SPAWN PORTAL
  [ENTER]. The UI is a veneer: `consoleSetMode` / `consoleToggleAffix` /
  `consoleSpawnPortal` are headless-callable scene methods (suites drive them raw).
- EMPTY PLAZA: `buildPlaza` now builds pedestals + "awaiting a portal" spot labels
  only; `plazaPortals` fills when the console materializes one. Spawn = Back.Out
  scale-in + white flash + camera shake + portal audio, label wears the slotted
  affix names, SPACE prompt reads the whole run back before you commit.
- ONE-SHOT + RESTART-PROOF: the spawned config lives in the game registry —
  survives the nexus scene restarts (fullscreen/resize, overlay detours), CLEARED
  in `enterPortal` (a portal never outlives its run); a new spawn replaces the old.
- AFFIXES ARE A PREVIEW (user: "i dont want them in game yet"): they ride the
  portal label, the SPACE prompt, and a new realm-HUD line ("AFFIXES: … (preview —
  not yet active)"), and `RealmScene.mapAffixes` carries them — but NOTHING reads
  them for gameplay until `DATA.console.live` flips at M5 (risk=reward numbers by
  playtest then).
- Overlay etiquette: console joins vault/graveyard in the one-overlay-at-a-time
  ring; ESC closes it before meaning "to title"; ENTER wired per-open/off-on-close
  (bug #2 family); portal prompts suppressed while any overlay is open.

**Files:** `data.js` (console block, map-affix tints, consoleRange, sealed-pedestal
copy), `textures.js` (console sprite), `scenes.js` (empty buildPlaza, buildConsole +
board UI + spawn/despawn/materialize, registry one-shot, prompt readback, realm
mapAffixes + HUD line, portalSwirl returns its timer), `index.html` (**?v= m3c →
m3d**), suites (m3c 15→23 — console flow end-to-end; m21 empty-plaza checks; ALL
suites' realm entry goes through the console now).

**Verified (headless Chromium): 129 checks — m1 23 + m2 22 + m21 18 + m3 19 +
m3b 24 + m3c 23 — ALL GREEN ×3 consecutive full batteries, zero console errors.**
Screenshots: empty plaza + console prompt · board with 2/3 affixes slotted ·
spawned portal wearing its affixes · realm HUD preview line.

**Next up:** Q3/Q5 behind flags · CC0 art batch 1 · then M4 (Wizard). M5 inherits
`DATA.console.live` as the affix go-live switch.

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
