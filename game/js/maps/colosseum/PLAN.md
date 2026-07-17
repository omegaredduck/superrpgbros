# COLOSSEUM — map plan (MAP 10 of the campaign)

> Realm 14. Every pick is Red's. Imperial arena at the height of the
> games: marble, sand, bronze, crimson — and one golden god who never
> puts his cup down. Sheets + finals in `assets/` and
> `artdev/colosseum/`. Numbers TUNE ME. LOCKED 2026-07-16 (boss art
> "perfect"; theme TAKE 2 "thats a banger").

## 1 · Theme + name

**COLOSSEUM** — the games never stop: staged spectacles on a program,
beasts behind portcullis gates, a crowd that is always watching, and
DIVINITY HIMSELF presiding from his private box.
Palette anchors: marble, arena sand, bronze/gold, imperial crimson +
purple (colosseum_kit.js `C`).

- Realm id `colosseum`, biome `colosseum`, boss `divinityHimself`,
  music `colosseum`.
- **ROUND MAP — NO TOROIDAL WRAP (the campaign's ONE exception, Red's
  call).** Playfield = the sand circle. The arena wall bounds it; CROWD
  TIERS ring the outside and are always visible past the wall (border
  ring art — see assets/colosseum_crowd_sample.png for approved crowd
  fidelity: individually drawn fans, mixed tunics/skin tones/poses,
  banner wavers, rose throwers, striped velarium, torch glow; cheap
  pose-swap animation so the crowd ripples on Program events).

## 2 · ARENA STAGES: THE PROGRAM — signature map cycle (LOCKED)

Trumpets + a placard from the Emperor's Box announce staged events on
a rotating cycle (~each stage ~20s TUNE, crowd roars between):
1. **BEAST RELEASE** — the three portcullis GATES fly open; a beast
   wave pours out (lions/hounds/elephant/minotaur per depth).
2. **TRAPDOOR SHUFFLE** — floor hatches pop open/closed, re-routing
   the sand field (open trapdoors = holes to avoid; warned before
   opening under your feet).
3. **CHARIOT LAP** — chariot racers thunder around the RIM TRACK ring;
   crossing the track during a lap is a real decision (warned lanes).
4. **INTERMISSION** — the crowd throws roses + loot onto the sand;
   breather + reward scatter.
Fresh mechanic — no reuse (used: tempest, treasure+curse, blood moon,
low gravity, rocking deck, growing crystal, booths, hex totems,
EVERYBODY DRAWS). Suites park the Program clock.

## 3 · Roster (TWELVE — Red picked 1 2 4 7 9 10 11 13 16 19 20 + reworked chariot; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Gladiator** | melee | sword-glint ~0.5s → warned slash cone; shield eats frontal on approach |
| **Retiarius** | snarer | net onto marked circle (brief root) → trident jab follow-up |
| **War Lion** | pouncer | crouch + tail flick → pounce along marked lane |
| **Shield Legionary** | wall | slow advance, blocks frontal shots; flanks/back open |
| **Beast Handler** | buffer | whip crack rallies nearby beasts — priority target |
| **War Elephant** | elite | trumpet → stampede lanes; quake-ring stomp up close |
| **Minotaur** | elite | paws ground → charge lane, then axe-slam circle where he stops |
| **Crowd Favorite** | showboat | taunts between attacks; crowd cheer = brief sparkle shield; hit him mid-taunt |
| **War Hound** | pack | packs of 3–4; lunge-glint warns |
| **Vestal Curser** | caster | purple glyph circles bloom where you stand → linger as weaken zones |
| **Executioner** | elite | axe overhead → big warned slam circle + follow-through cleave sector |
| **Chariot Racer** | racer | LION-drawn chariot circles the rim track, telegraphs run lanes across the sand |

CHARIOT RACER art history: first draw rejected (cramped) → 10-sheet →
#1 CRIMSON CLASSIC + better horse → full-canvas beast pass (Red's
process idea) → horse swapped for WAR LION → pack of 3 rejected
("looks bad") → **FINAL: ONE lion** (assets/colosseum_chariot_final.png;
approved lion160() in render/render_colosseum_lion_draft.js).

## 4 · Decorations (Red: all but #10 bones + #18 stands) + tiles (ALL 10)

Decor (18): **emperors box · beast gate · marble column · broken
column · bronze brazier · victory banner · gladiator statue · weapon
rack · trapdoor · spina obelisk · laurel arch · chain post · torch
pole · marble plinth · cage wagon · velarium mast · palus dummy ·
she-wolf statue.** (Crowd lives in the ring border art, not scatter.)

Tiles (10): arena sand (BASE, raked) · bloodied sand (accents) ·
marble floor (box walkways) · mosaic (gate aprons) · travertine paving
(entries) · chariot track (rim ring) · hypogeum grate (over-the-dark
accents, eyes below) · imperial carpet (N gate → center runner) ·
cracked flagstone (old corners) · gilt marble (the box floor).

**PLANNED scene (assets/colosseum_scene_plan.png — round, composed):**
- **CROWD TIERS** ring (border art) → **ARENA WALL** (banners, masts) →
  **RIM TRACK** ring (chariot laps) → **SAND FIELD** → **BOSS CIRCLE**
  center (chalk + red ring, wine stains).
- **EMPEROR'S BOX** north, above the wall: purple canopy, gilt floor,
  throne — DIVINITY HIMSELF presides here all realm (untargetable
  scenery until the fight).
- **3 BEAST GATES** (N under the box, SW, SE) + cage wagons parked
  beside; **IMPERIAL CARPET** runs N gate → boss circle (his surf path).
- **LAUREL ARCH** south = player spawn. **TRAPDOORS** scattered
  mid-field. Obelisk center-north; plinths + statues W/E (vestal turf);
  braziers ring the field inside the track; she-wolf NE.

## 5 · DIVINITY HIMSELF (boss — art FINAL "perfect": #2 GOLDEN GOD + PIMP CUP)

**Look (LOCKED, assets/colosseum_boss_final.png):** gold on gold on
gold — gilded toga + crimson cape, radiate crown studded with gems,
double gold chains + ruby medallion, three gem rings on the raised
fist, and the giant JEWELED GOLDEN PIMP CUP (wine-filled chalice, gem
rows, sparkle stars everywhere). WINE-OBSESSED. Parameterized
emperor(put,S,p) in render/render_colosseum_boss.js; final in
render_colosseum_boss_final.js. Title card: **DIVINITY HIMSELF**.

**Entrance (LOCKED — lift, THEN surf):** trumpets; the box floor
unlatches and lowers as a gilded lift, him mid-toast — halfway down he
UPENDS THE CUP over the edge: an impossible crimson wave floods down
and he SURFS IT along the carpet to the boss circle, landing dry,
crowd deafening. (~3.5s; suites waitForFunction(r.boss && r.scanning).)

**Kit (LOCKED — boss contract: telegraphed overlays, no spam):**
*Phase 1 — THE HOST (100→50%):*
- **CUP SPLASH** — wine arcs onto 3 warned circles → lingering crimson
  slicks (slide-through, brief control loss).
- **THE VERDICT** — thumb turns down → golden doom-ring chases (~6s);
  clips MOBS too (env credit) — loop it through the pit.
- **TRIBUTE RAIN** — crowd hurls goblets + roses: scattered small
  warned circles.
- **GOLDEN BACKHAND** — close-range warned cone; he saunters, never
  chases.
- **SIGNATURE — WINE FLOOD**: empties the cup — half-arena wave,
  warned long, fixed alternating halves → gazes into the empty cup:
  **×1.5 vented (hurtBoss)**.
*Phase 2 — THE DRUNK GOD (<50%): drinks deep; glow doubles, gait
staggers (erratic but every attack still telegraphed):*
- **DOUBLE VERDICT** — two doom-rings.
- **CUP TOSS** — the cup boomerangs around the rim on a warned
  circular path, returns to hand.
- **ENCORE!** — orders one PROGRAM stage off-cycle (BEAST RELEASE: 3
  hounds; ONCE per phase; reroutes if a stage is already running).
- **SIGNATURE — DIONYSIAN DELUGE**: wine rains in warned circles
  everywhere → full ring-wave pulses out from center → longest vent
  while he refills.
≤6 scouter hints (drafted): wine slicks slide — cross straight · the
doom-ring loses you through mobs · watch the sky when the crowd
cheers · read which half floods early · duck inside the cup's circle ·
when the cup runs dry, he's all yours.
Every source fromBoss=true. NO radial/stream spam.

## 6 · Music + SFX

**"GLORY.EXE"** (assets/colosseum_theme.wav — **TAKE 2, RED-APPROVED
("thats a banger")**; direction changed from banked brass fanfare to
Red's call: **GAMING TECHNO + CRAZY PIANO SOLO**): 140 BPM, 105 bars =
180.0s, A minor (Am–F–C–G). TAKE-2 FIX (Red): NO slow intro — kick,
octave bass, hats AND trumpet fanfare all from bar 0 over a crowd
roar; hook lands ~7s. Keygen hook lead → snare-roll build → 24-bar
drop (detuned 3-voice lead + sub) → 4-bar breather w/ piano teases →
**28-BAR CRAZY PIANO SOLO** (chiptune piano = 3-partial layered pulses
w/ fast decay: scale blazes, broken-chord sweeps, octave hammering,
32nd-note burst descents, trills, chromatic prowls, Alberti runs,
glory climb) → piano+lead duet drop → octave-up finale → fanfare tag +
final piano chord + roar. Crowd roars at every section door. Port via
section-composer — KEEP the bar-0 full-stack entry, the piano voice
(3 partials), the 28-bar solo variety, and the duet/octave-up arc.
New SFX: trumpet placard sting (per Program stage) · portcullis
grind · trapdoor clunk · chariot rumble + lion roar · crowd roar/cheer
loops (duck under boss music) · rose/goblet plinks · net whoosh ·
elephant trumpet · minotaur bellow · executioner slam · curse glyph
hum · verdict horn + doom-ring hum · cup splash/slosh · wave roar ·
cup-toss whoosh circling · drunk hiccup (P2 flavor) · lift creak +
surf splash (entrance).

## 7 · Build order (Opus)

1. art.js: 12 mob draws (incl. lionChariot from
   render_colosseum_chariot_final.js + lion160) + DIVINITY HIMSELF
   (emperor(put,S,p) canon; P2 = staggered pose flag ok) + 18 decor +
   10 tiles + CROWD RING border art (from crowd sample: tier bands +
   fan(put,S,...) figures + pose-swap ripple) — port from
   assets/render/*.js.
2. map.js: realm/biome/12 mob rows/boss/dropTable/console unlock +
   GLORY.EXE composer + SFX + programCfg { stageMs ~20000, order,
   beastWaves, trapdoorSets, lapCount — ALL TUNE }. Boss def mapOwned.
3. scene.js: ROUND layout per scene PNG — circular walkable sand
   bounded by the wall (NO wrap; wall = collision ring), rim track
   ring, 3 gates, box (scenery), carpet, trapdoors, decor ring, crowd
   tiers rendered beyond the wall all around. THE PROGRAM cycle.
4. Boss per §5: lift+surf entrance, P1/P2 verbs, both signatures +
   vented windows, ENCORE reroute rule.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite
   m16_colosseum_verify.js (routing on a ROUND field + wall collision ·
   Program: all 4 stages + announce + park · gates spawn · trapdoor
   warn-under-feet · chariot lap lanes · 12 mob mechanics incl.
   crowd-favorite shield window + handler buff + legionary frontal
   block · boss: entrance beats, verdict ring env-credit, wave halves,
   cup toss path, ENCORE once/phase, both vents) + FULL battery +
   ?v= bump.

## 8 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

program.nextAt / stage.endsAt / placardUntil · gate[].openUntil ·
trapdoor[].warnAt / openAt / closeAt · racer lapAt / lane[].at ·
gladiator slashAt · retiarius netAt / rootUntil · lion pounceAt ·
legionary (no clock) · handler buffAt / buffUntil · elephant
stampedeAt / stompAt · minotaur chargeAt / slamAt · favorite tauntAt /
shieldUntil · hound lungeAt · vestal glyphAt / zone[].dieAt ·
executioner slamAt / cleaveAt · boss: nextVerbAt / splash[].landAt /
slick[].dieAt / ring.moveAt / ringUntil / tribute[].landAt / wave
seq[].at / ventedUntil / toss pathAt / encoreAt / deluge seq[].at ·
every _zoneWarn.until. (Skip Infinity-parked.)

## 9 · Traps specific to this map (preview — full list in BUILD_INSTRUCTIONS)

Round-map routing (no wrap!) · doom-ring env credit not player-sourced ·
crowd = pure border art (never collides/targets) · Program vs boss
clocks offset (never two death sentences at once) · trapdoors never
open under the boss circle during the fight · cup toss path = rim only,
warned full-circle · slick+curse slow stack cap (CC rule).

## 10 · Status

**LOCKED 2026-07-16** — roster (12, lion-chariot final) + kits, decor
(18), tiles (10), ROUND arena + crowd ring (sample approved), THE
PROGRAM, DIVINITY HIMSELF look/name/entrance/kit ("perfect"), scene,
theme TAKE 2 "GLORY.EXE" ("thats a banger"). Map 10 is build-ready.
