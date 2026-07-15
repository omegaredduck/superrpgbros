# BIOME 4 — MAP BUILD PLAN

*Working doc. Created 2026-07-15. This is the front-loaded plan Red's Master List
note #1 asks for: all notes transcribed, every question surfaced up front, and the
whole build sequenced. Theme + names get filled in once Red answers the gating
question. Precedent docs: `GROVE_PLAN.md`, `GRAVEYARD_PLAN.md`.*

---

## 0. Where this fits

Three realms are live: **THE TRAIN YARD** (Conductor), **THE GROVE** (Grovekeeper),
**THE GRAVEYARD** (Gravekeeper). This is **biome 4** — a brand-new realm built with
the same proven pipeline (numbered option sheets → Red picks → planned scene →
themed boss → 3-min 8-bit theme → docs/bestiary update).

> Note #2 says "map plan for the grove" — that's leftover template wording; the grove
> already shipped. The real theme is whatever Red answers to the theme question below.

---

## 1. The Master List (transcribed, verbatim intent)

1. Read all notes first, then start in order. Make a plan, front-load the questions,
   front-load the 20 sheets — some questions necessarily come **after** the 20 sheets.
2. The only thing left is maps + themed mobs. Come up with a map plan. **What makes a
   map:** 8 mobs · a theme · a special map mechanic + animation · special mechanics
   with themed attacks.
3. Ask Red **what the theme of the map is**.
4. **20 mob designs**, 160×160 canvas, high-fidelity pixel art, all on **one numbered
   PNG**, themed to the map, so Red can say which he likes / wants changed.
5. **20-sheet of decorations.**
6. **Plan** how decorations are used — a composed **scene**, never random scatter.
7. Map needs a **custom 8-bit theme song, ~3 minutes** long.
8. Boss needs an **entrance based on the map** — ask Red if he has an idea, offer
   suggestions.
9. Ask Red about the **music theme + the inspiration** for the theme song.
10. **After** Red selects his monsters, ask him the **plan for each** selected monster.
11. At the end: **update the documentation** + make sure the **bestiary is updated**
    and the text **isn't overflowing**.
12. Ask Red the **boss's name**, whether he has a **design in mind**, and whether he
    has **spell / mechanic recommendations**.
13. Also need a **10-sheet of boss work-ups** and a **10-sheet of map tiles**.

---

## 2. Deliverables (what "done" looks like)

| # | Deliverable | Spec | Source note |
|---|-------------|------|-------------|
| A | Mob option sheet | 20 designs, 160×160 each, hi-fi pixel, one numbered PNG | 4 |
| B | Decoration option sheet | 20 designs, one numbered PNG | 5 |
| C | Scene composition plan | Planned layout PNG + layout doc — no random scatter | 6 |
| D | Boss work-up sheet | 10 boss designs, one numbered PNG | 13 |
| E | Map-tile sheet | 10 seamless tiling ground/wall textures, one numbered PNG | 13 |
| F | Boss entrance | Map-based cinematic (grows / climbs / arrives) | 8, 12 |
| G | Theme song | Original 8-bit, exactly ~3:00, WAV preview → data.js composer | 7, 9 |
| H | 8 chosen mobs, fully specced | Mechanics + themed attacks per Red's plan | 2, 10 |
| I | Special map mechanic | Signature "cycle"-style hazard + animation | 2 |
| J | Docs + bestiary | Plan doc, MILESTONES, EVENT_LOG, bestiary text-fit | 11 |

---

## 3. Questions — FRONT-LOADED (ordered by when they can be answered)

### Round 1 — BEFORE the sheets (gates all themed art) — note 3, 9
- **Q1. Map theme / biome.** *(the one gate — everything downstream is themed off this)*
- **Q2. Mood + intensity** — the overall tone the mobs, palette, and music should hit.

### Round 2 — WITH / ABOUT the sheets — note 9, 12
- **Q3. Music inspiration** — what the theme song should feel like / reference (genre,
  a track's energy, tempo feel). *(can be answered while sheets render)*
- **Q4. Boss name** + do you have a **design in mind**? — note 12
- **Q5. Boss spell / mechanic recommendations** — anything you already want him to do.
  — note 12

### Round 3 — AFTER Red picks from the sheets — note 8, 10
- **Q6. Your 8 mob picks** (from the 20 sheet) + any that need changes. — note 4
- **Q7. Per-monster plan** — for each of the 8, the mechanic + themed attack. — note 10
- **Q8. Boss pick** (from the 10 sheet) + changes. — note 13
- **Q9. Boss entrance** — do you have an idea? (I'll bring suggestions built off the
  map.) — note 8
- **Q10. Decor picks** (which of the 20) + the scene layout sign-off. — note 5, 6
- **Q11. Tile picks** (which of the 10). — note 13

---

## 4. What makes THIS map (the biome-4 spec skeleton — fills in after Q1)

- **Theme:** _TBD (Q1)_
- **8 mobs:** _TBD — chosen from the 20 sheet (Q6), each specced (Q7)_
- **Special map mechanic + animation:** _TBD — a signature realm "cycle" in the vein
  of the Grove's falling trees or the Graveyard's Witching Cycle_
- **Boss + entrance + verbs:** _TBD (Q4, Q5, Q8, Q9)_
- **Tiles / world build:** _procedural like yard/grove/graveyard (not the map-builder);
  new grass+wall tile set from the 10-tile sheet (E)_
- **Music:** _original 8-bit, ~3:00 (Q3)_

---

## 5. Build sequence

1. **Plan doc** (this file) + front-loaded questions. ← *you are here*
2. Ask **Q1 + Q2** (theme + mood). **[BLOCKS the sheets]**
3. Render the four option sheets — front-loaded per note 1:
   - A · 20 mobs (160×160 hi-fi, numbered)
   - B · 20 decorations (numbered)
   - D · 10 boss work-ups (numbered)
   - E · 10 map tiles (numbered)
   *(While these render, ask Q3–Q5: music inspiration + boss name/design/mechanics.)*
4. Red reviews sheets → **Q6, Q8, Q10, Q11** (mob / boss / decor / tile picks + changes).
5. Iterate any "change this one" requests on the sheets.
6. **Q7** per-monster plans + **Q9** boss entrance → lock the full mob + boss spec.
7. Design the **special map mechanic** + the **planned scene composition** (C).
8. Compose the **3-min 8-bit theme** (G) → WAV preview → Red signs off.
9. **Build** the realm (data.js rows, world art, boss, mechanic, music) — the actual
   code, following the carry-over gotcha list (unfreeze shift list, queueSpawn for all
   mechanic spawns, suites stand the ambient cycle down, boss text-fit ≤6 hints).
10. **Docs + bestiary** update + text-fit check (J). — note 11

---

## 6. Status checklist

- [x] Read all notes, build this plan (note 1)
- [ ] Q1 theme + Q2 mood asked (note 3)
- [ ] 20-mob sheet (note 4)
- [ ] 20-decor sheet (note 5) + scene plan (note 6)
- [ ] 10-boss work-up sheet (note 13)
- [ ] 10-tile sheet (note 13)
- [ ] Music inspiration asked + 3-min 8-bit theme (notes 7, 9)
- [ ] Boss name/design/mechanics asked (note 12) + entrance (note 8)
- [ ] Mob picks + per-monster plans (notes 4, 10)
- [ ] Special map mechanic + animation (note 2)
- [ ] Build the realm
- [ ] Docs + bestiary text-fit (note 11)
