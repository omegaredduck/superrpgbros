# CUTSCENES — BUILD INSTRUCTIONS (for the build session)

*Companion to CUTSCENES.md (the shot-by-shot plan) and docs/STORY.md (the
canon text). The GIFs in assets/ are Red-approved look targets — match
composition, palette, and beat timing before polishing anything.*

## What ships

One general-purpose cutscene rig + four scenes (CS0–CS3) + the per-realm
first-clear text card. The belly intro/outro (already specced in
game/js/maps/belly/) MIGRATE ONTO this rig when belly is built — their beats
are already shot-list-shaped; do not build a second one-off player.

## Build order

1. **`CutsceneScene` (scenes.js or its own file)** — plays a data-driven
   shot list from `DATA.cutscenes.<id>`: `{shots:[{draw, seconds, anim,
   texts:[{lines, color, y, cps}], sting}]}`. Letterbox bars; 240×160 design
   canvas integer-scaled (Scale.RESIZE — compute scale in create() AND on
   resize; never assume 960×640). Typewriter reuses the records-wall typer.
2. **`cutscene_art.js`** — draw fns ported from assets/render/cutscene_kit.py
   + the per-scene scripts (cs0_preamble.py, cs1_coldboot.py, cs2_reboot.py,
   cs3_wake.py). Every shot base is a generated texture + 2–3 frame
   micro-anim variants (pod blink, rain phase, pulse positions). Key sets:
   server hall (4 states: linked/dying/warming/eyes), city dusk, rain
   street, warm pod hall, wire runs (horizontal + vertical), pod close-up,
   chamber-cold, unlock card. NO billboard screens in the city shot (Red cut
   them).
3. **THE HERO IS THE SELECTED CLASS** (Red's call): the standing/waking
   figure renders as the save slot's class — 3 variants (ranger/wizard/
   knight), back + front + gasp poses, per cutscene_kit.hero() and the
   approved hero_variants_sheet.png. The rig takes `cls` from the account at
   play time.
4. **Music**: 3 cues in audio.js, ported from assets/render/cutscene_music.py
   note data (same synthesis style as existing tracks; squares + triangle,
   no sine). ONE LEITMOTIF (A-minor question → A-major answer):
   `cue_cs0_musicbox` (~35s) · `cue_cs2_swell` (~21s, ends on the dominant —
   unresolved on purpose) · `cue_cs3_resolve` (~26s, lands the tonic).
   **CS1 IS SILENT** (Red's call): type ticks + FAIL buzz + filament rise +
   white-flash crash stings only. Cues are scene-length, NOT 180s — the
   180.0s law is for realm themes; cutscene cues stop with the scene (they
   do not loop).
5. **Triggers + saves**: CS0+CS1 chain once on fresh-slot creation (after
   class select — the hero must be known); CS2→CS3 chain on first belly
   clear, before the chest. `account.cutscenesSeen` {cs0..cs3} — schema
   bump + lossless migrate (default false; existing accounts see CS0/CS1 on
   next fresh character only if never seen). Replay via records wall.
6. **First-clear text card** (freebie): 3s black card after every realm's
   first clear — `region NN ... CLEAN. sleepers queued for relink.` — NN =
   registry order. One draw fn, no art.

## Skip + pause contract

- SPACE/click = skip shot · HOLD SPACE or ESC = skip scene (replays skip
  freely; first-run CS0/CS1 per-shot only).
- ESC menu can open OVER a cutscene → pause: every scheduled beat
  timestamp goes on the unfreeze() shift list (the standing law). Prefer
  relative `elapsed` accumulation over absolute clocks where possible.
- Cutscenes run in their own scene — no realm sim running underneath
  (launch/stop, not overlay, except the first-clear card which may overlay
  the realm-close flow).

## Gotcha carry-list (from the shipped maps — these WILL bite)

- Scene instances are REUSED: reset all rig state in create().
- off() before on() for resize/key handlers.
- Bump ?v= on every js change; hard-refresh note in the changelog.
- Suites: new `mXX_cutscene_verify.js` — assert shot advance, both skip
  paths, cutscenesSeen persistence + migrate, CS0 does not fire twice,
  first-clear card fires once per realm. Slow ~2fps headless: drive the rig
  by injected clock, not wall time. tweens.pauseAll() to freeze VFX frames.
- Text overflow: every line in CUTSCENES.md fits 240px at font size 8 —
  measured in the previews. If a line changes, re-measure (bestiary
  text-fit law applies).
- GIF previews were rendered at 240×160×3. In-game the canvas integer-
  scales; test at 960×640 AND fullscreen.

## Files in this folder

- CUTSCENES.md — the locked shot-by-shot design (Red-approved previews)
- BUILD_INSTRUCTIONS.md — this file
- assets/cs0_preamble_preview.gif · cs1_coldboot_preview.gif ·
  cs2_reboot_preview.gif · cs3_wake_preview.gif — APPROVED look targets
- assets/hero_variants_sheet.png — the 3 class hero variants (approved)
- assets/cue_cs0_musicbox.wav · cue_cs2_swell.wav · cue_cs3_resolve.wav —
  cue previews (take 1)
- assets/render/*.py — the generators (composition + palette + note data
  source of truth for the port)
