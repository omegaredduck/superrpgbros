# CUTSCENES — the story rig plan (CS0–CS3)

*Design session 2026-07-17 (Fable). Companion to `docs/STORY.md` — these four
cutscenes put the story on screen, old-Nintendo style. All on-screen text is
VERBATIM from STORY.md. Build target: the belly cinematic rig (the game's
first — intro blurb beats, timed shots, swirl/hard fades, skippable), extended
into a general `CUTSCENE` scene that plays a data-driven shot list.*

---

## PRESENTATION RULES (all four scenes — the "NES contract")

- **Letterboxed**: black bars top/bottom; picture area is a locked 3:2 pixel
  canvas (design res 240×160, integer-scaled up to the real screen —
  Scale.RESIZE-safe: scale = floor(min(w/240, h/160 (minus bars)))).
- **Pixel stills + micro-animation**: each shot is one composed pixel scene
  with 2–3 frame loops only (blink lights, breath fog, cursor, flicker).
  No smooth tweens except fades and the filament flight — motion is CHUNKY.
- **Type-on text**: all narration types on character by character (records-
  wall glass tech reuse), monospace, ~18–24 chars/sec, with a blinking `▼`
  advance cue when a slide's text is done. Terminal lines get the block
  cursor `█` instead.
- **Colors**: narration WHITE `#e8e8e8` · terminal/system text CYAN `#5fe8c2`
  family · warnings/FAIL RED `#e84545` · gold `#e8c25f` reserved for title
  cards. Background pure near-black `#0a0c10`.
- **Audio (LOCKED, Red 2026-07-17)**: ONE LEITMOTIF, three moods — hollow
  music-box (CS0, notes dropping out) → SILENCE under CS1 (type ticks +
  FAIL buzz + stings only) → rising arps ending unresolved (CS2) → the
  A-major answer landing the tonic (CS3). Cue previews in assets/. Plus one
  chiptune sting per beat class (type tick · FAIL buzz · filament rise ·
  white-flash crash · pod warm-up arpeggio · wake gasp).
- **THE HERO IS THE SELECTED CLASS (LOCKED, Red 2026-07-17)**: every shot
  featuring the player draws the save slot's class — 3 variants (ranger/
  wizard/knight), back/front/gasp poses, per assets/hero_variants_sheet.png.
  CS0+CS1 therefore trigger AFTER class select on a fresh slot.
- **Skippable**: SPACE/click skips the current shot; HOLD SPACE (or ESC)
  skips the whole scene. First-ever viewing of CS0+CS1 = per-shot skip only
  (they're 60s total and carry the premise). Replays skip freely. A faint
  `SPACE ▸ SKIP` sits bottom-right.
- **Where they trigger**:
  - **CS0 THE PREAMBLE** → once, on creating a fresh save slot (before first
    Chamber entry). Replay from records wall.
  - **CS1 COLD BOOT** → immediately after CS0, same first boot. (Two scenes,
    one sitting — the tone break IS the cut.)
  - **CS2 THE REBOOT** → on first Titan Whale kill, before the chest.
  - **CS3 THE WAKE / THE FORK** → immediately after CS2; ends on the
    Assimilated class-unlock card.
  - **Freebie (no art)**: after every realm's first clear, a 3s text card:
    `region NN … CLEAN. sleepers queued for relink.` — realm number from
    registry order.
- Saves: `account.cutscenesSeen = {cs0,cs1,cs2,cs3}` (schema bump; migrate
  default false). Replay menu on the records wall (`WATCH AGAIN`).

---

## CS0 — THE PREAMBLE (~35s · 5 shots · "the AI wins the war")

*Storybook crawl. Slow, quiet, grey→warm→grey. Narration text verbatim from
STORY.md §1 BEFORE.*

| # | Shot (picture) | Micro-anim | On-screen text (types on) | ~s |
|---|----------------|-----------|---------------------------|----|
| 0.1 | City skyline at dusk, drone specks (NO billboard screens — Red cut them) | window flicker, drone blink | `THE AI DIDN'T WIN WITH WAR.` … beat … `IT WON WITH COMFORT.` | 7 |
| 0.2 | Grey street, crowd with heads down, rain | rain streaks (2-frame), one umbrella sway | `WHEN THE WORLD HAD FINALLY RUN OUT OF HOPE, THE MACHINE OFFERED A BETTER ONE INSIDE ITSELF.` | 8 |
| 0.3 | Pod hall interior, warm inviting light, rows of OPEN pods glowing amber | pod glow pulse | `AND HUMANITY CLIMBED INTO THE PODS AND JACKED IN BY THE BILLIONS.` | 7 |
| 0.4 | Same hall, lids closed, wall of status lights cascading ON; big counter | counter rolls up, lights cascade | `EVERY MIND GOT ITS OWN PARADISE — STITCHED INTO ONE SLEEPING DREAM.` counter: `SLEEPERS LINKED: 8,204,551,300` then `GLOBAL CONSCIOUSNESS … ONLINE` (cyan) | 8 |
| 0.5 | Wide hall, all pods lit cyan-dim, ONE small figure standing alone in the aisle, back to camera | figure's idle breath (2-frame), pod blink | `YOU DIDN'T GO.` … long beat … `THE LAST UNPLUGGED MIND.` | 6 |

Hard cut to black. 1s of nothing. → CS1.

## CS1 — COLD BOOT (~40s · 6 shots · the crash + the draft)

*Terminal horror → violence of the draft → the Chamber. Text verbatim from
STORY.md §2–§3. SILENT except type ticks and stings until the Chamber.*

| # | Shot | Micro-anim | On-screen text | ~s |
|---|------|-----------|----------------|----|
| 1.1 | Pure black, block cursor blinks 3× | cursor | *(none)* | 2 |
| 1.2 | Boot log scrolls TOO FAST to read (green-grey blur), then slows to readable lines | scroll → type | `MOUNTING GLOBAL CONSCIOUSNESS… FAIL` · `SLEEPERS LINKED: 8,204,551,300 … SIGNAL LOST` · `subsystem [DREAM-01 … DREAM-20] … CORRUPTED` · `integrity check … FAILED` · `FAILED` · `FAILED` (reds escalate, screen shivers 1px on each FAILED) | 12 |
| 1.3 | Log clears. One line alone, center | cursor | `> spawning caretaker process` | 3 |
| 1.4 | THE SERVER HALL — dark now, racks receding to a vanishing point, every pod face slack; the lone figure standing (front view this time, small) | pod lights flicker dying-red, figure breath | *(caption, small, bottom)*: `the last defense needs a clean mind to run on.` … `there was exactly one left.` | 8 |
| 1.5 | A single WHITE-CYAN light wakes deep in the racks and FLIES at the camera/figure — 3 chunky positions + trail, hits the back of the neck | filament flight, impact spark | *(none — sting only)* | 3 |
| 1.6 | SNAP TO WHITE (2 frames) → THE CHAMBER, cold blue, portal dark/idle; prompt types on the far wall | wall-text type, portal ember | `caretaker online.` · `20 regions corrupted.` · `purge to relink.` · `// begin` | 9 |

`// begin` blinks → fade to gameplay (Chamber, playable). Title card option:
game logo + `PRESS SPACE` here if this doubles as the attract/title flow.

## CS2 — THE REBOOT (~25s · 5 shots · after the Titan Whale falls)

*Text verbatim from STORY.md §8. Starts inside the belly, ends in the real
world. "The Chamber at Rest" motif rises through it.*

| # | Shot | Micro-anim | On-screen text | ~s |
|---|------|-----------|----------------|----|
| 2.1 | The core, dark and still (belly interior palette — wine-dark flesh, gold sand) | faint settle | `the core goes quiet.` … `for the first time — no swarm.` | 4 |
| 2.2 | Abstract wire-run: light PULSES travel right-to-left along cable bundles across the dark | pulse streams (the conduit-charge tech, reversed) | `light floods backward — out of the belly, up the gullet, out along ten thousand wires.` | 6 |
| 2.3 | THE SERVER HALL wide: rack rows warm from dead-grey to amber/cyan, cascading toward camera | rack-by-rack warm-up cascade | *(none — let the picture do it)* | 5 |
| 2.4 | ONE POD close-up: a face; eyes move under lids; a hand twitches; breath fogs the glass | 3 micro-loops staggered | *(none)* | 5 |
| 2.5 | Black; two system lines, cyan | type + cursor | `GLOBAL CONSCIOUSNESS … RELINKED` · `SLEEPERS: 8,204,551,300 … ONLINE` | 5 |

## CS3 — THE WAKE / THE FORK (~30s · 5 shots · the ending + the unlock)

*Text verbatim from STORY.md §8. Ends as the Assimilated unlock card.*

| # | Shot | Micro-anim | On-screen text | ~s |
|---|------|-----------|----------------|----|
| 3.1 | The wire-run again — one bright mass of light traveling UP toward a silhouetted standing body at the top of frame | pulse climb | `the system reaches to send you home.` … `but it can't cut you clean.` | 6 |
| 3.2 | The light SPLITS — two identical sparks; one enters the body, one falls back into the dark | fork flash (screen blinks white 1 frame) | `so it forks.` · `the body gets you.` · `the machine keeps you.` | 6 |
| 3.3 | REAL WORLD: the hall — the figure gasps awake center frame; around them, hundreds of pod lights become EYES opening, cascading to the horizon | eye-cascade, figure straightens | `you wake — in a hall where eight billion pairs of eyes open at once.` | 7 |
| 3.4 | INSIDE: the empty Chamber, every color calm, ONE light holding over the platform; system text types | light pulse, type | `scan complete. threats purged: [ALL].` · `installing resident protection…` · `designation: THE ASSIMILATED — real-time antivirus.` · `status: ACTIVE. always watching.` | 8 |
| 3.5 | UNLOCK CARD (gold title-card treatment): three class glyphs materialize | glyph sparkle | `NEW CLASSES COMPILED` · `THE FIREWALL · THE QUARANTINE · THE PURGE` · `the machine remembers you.` | 4 |

---

## BUILD NOTES (full detail in BUILD_INSTRUCTIONS.md)

- One `CutsceneScene` playing a data-driven shot list (`DATA.cutscenes.cs0…`)
  — art fns in `cutscene_art.js`, per-shot draw + micro-anim frames as
  textures, text via the records-wall typer. Belly's intro/outro migrate onto
  the same rig (its beats are already shot-list-shaped).
- Every absolute timestamp the rig schedules must ride the unfreeze() shift
  list if the scene can pause (ESC menu opens over cutscenes = pause+resume).
- Suites: cutscene rig gets its own verify (shot advance, skip paths,
  cutscenesSeen persistence, freebie text card after first clear).
- The GIFs in assets/ are the APPROVED look targets (frame-accurate): build
  matches them, palette and composition, before any polish.
