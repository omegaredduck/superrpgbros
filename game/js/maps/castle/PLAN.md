# VAMPIRE CASTLE — map plan (MAP 3 of the 10-map campaign)

> Realm 7. Every pick below is Red's (numbered sheets + question rounds).
> Sheets + finals in `assets/` and `artdev/castle/`. All numbers TUNE ME.
> Design LOCKED 2026-07-15 except scene/theme sign-off (§8).

## 1 · Theme + name

**VAMPIRE CASTLE** — Castlevania-style keep interior under a blood moon.
Elegant horror: ballrooms and banquets that never ended, moonlit galleries,
and a tiltyard where the court still holds its tournament. Palette anchors:
cool purple-grey stone `#8a84a0` family, blood crimson `#c22e3e` / wine,
moonlight `#9fb8e8`, velvet purple, candle gold. Distinct from the graveyard:
INTERIOR gothic, no fog, no bells, no undead-green.

- Realm id `castle`, biome `castle`, boss `paleking`, music `castle`.
- Toroidal wrap ON. Interior world — zone floors + wall segments give rooms.

## 2 · Roster (8 — Red picked 3 5 7 9 13 15 18 20; kits APPROVED)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Gargoyle** | perch diver | perches ARMORED (dmg resist), telegraphed dive onto a marked circle (zone) |
| **Blood Maiden** | AoE lobber | lobs blood orbs onto warned circles → damage pools (patch pool) |
| **Halberd Guard** | lane thruster | telegraphed thrust down a short flashing lane |
| **Portrait Phantom** | wall ambusher | emerges from walls near portrait decor, chases, blinks back |
| **Vampire Initiate** | lifesteal caster | aimed blood bolt; HEALS ITSELF for damage dealt |
| **Dire Rats** | fast swarm | cheap, spawns in packs |
| **Animated Armor** | tank | falls apart on death → pieces crawl together → REASSEMBLES once at 40% unless pieces are killed |
| **Crimson Duelist** | strafing elite | circles you; telegraphed rapier lunge lines |

Colored shots = orbShot + tint (crimson bolts/orbs).

## 3 · Decorations (ALL 20 — Red: "use those at will") + tiles (Red: #1–5 ONLY)

Decor: throne · count's coffin · candelabra · CHANDELIER (drop mechanic) ·
grand mirror · portrait row (phantom spawns) · banquet table · great organ ·
LANCET WINDOW (beam source) · gothic column · library stack · armor display ·
blood fountain · weeping statue · portcullis · crimson runner · great hearth
(green fire) · wine rack · JOUST LIST (arena) · bat roost.

Tiles: #1 castle flagstone (halls/base) · #2 ballroom checker · #3 parquet
(great hall) · #4 courtyard cobble (courtyard + TILTYARD arena) · #5
bloodstained stone (dungeon wing). NO tiles 6–10.

**PLANNED scene (assets/castle_scene_plan.png — composed, never scatter):**
- **THE GATEHOUSE** (south, spawn): portcullis + weeping statues; the CRIMSON
  RUNNER carpet runs the whole spine spawn → tiltyard.
- **OUTER COURTYARD** (south band, cobble): BLOOD FOUNTAIN centerpiece,
  candelabra-lit runner, armor displays, columns.
- **GREAT HALL** (west, parquet): banquet table, green-fire hearth, portrait
  rows (phantom spawn walls), throne at the head, candelabras.
- **THE BALLROOM** (east, checker): 3 CHANDELIERS (the crash zones), grand
  mirrors, THE GREAT ORGAN on its north wall; lancet windows on the outer
  walls (beam sources, both ballroom + hall).
- **DUNGEON WING** (NW, bloodstained): wine racks, the count's coffin, bat
  roost.
- **THE LIBRARY** (NE, flagstone): stacks + candelabra.
- **THE TILTYARD** (north, cobble, BOSS ARENA): the JOUST LIST tilt barrier
  down the middle, heraldic banners, bat roosts on the walls, and the ARENA
  GATE at the top — the boss smashes through it. Wrap seam runs through
  courtyard edges, never inside a room.

## 4 · THE BLOOD MOON COURT — signature map system (LOCKED)

No fog, no bells — the blood moon and the music conduct:
1. **CRIMSON BEAMS** (hazard): the lancet windows glow and cast moving
   beam-lanes that SWEEP across the halls on a clock. Mobs inside a beam are
   EMPOWERED (eyes flare, speed up); the player standing in one takes a slow
   burn. Dodge the moving light.
2. **THE WALTZ** (the show-stealer): on the music swell, every mob briefly
   locks into synchronized waltz-step diagonals (1-2-3, 1-2-3 drift
   patterns) — eerie, readable, dodgeable. The Phantom-style haste is NOT
   used (organist wasn't picked); the waltz is map-owned.
3. **CHANDELIER CRASHES**: at the waltz peak, marked circles bloom under the
   ballroom/hall chandeliers → they CRASH (damage; hits mobs too →
   killMobCredited; chandelier re-hoists after ~20s).
Ambient cycle gated during arrival/boss; during the boss the waltz belongs
to HIS trample verb.

## 5 · THE PALE KING — UNHORSED BY NO MAN (boss — art FINAL:
##     assets/castle_boss_final.png = Pale Rider var #10 KING OF THE LISTS)

**Look (Red's picks: jouster #3 → pale-rider sheet #10 + "regular horse, no
holes"):** crowned pale knight in bone plate w/ gold trim, velvet caparison
on a SOLID pale horse (moon-glow eyes, chanfron), couched lance held high
with spiral pennon, velvet shield. Mounted for the whole fight.

**Entrance (LOCKED — GATE-SMASH CHARGE):** the arena gate's portcullis
rises; hoofbeats thunder in the dark beyond; he EXPLODES through the gate at
full gallop — the first LANCE PASS lane is the entrance itself (telegraphed
like every other pass). Title card THE PALE KING · UNHORSED BY NO MAN.

**Kit (mounted jouster; boss contract — all ground-overlay telegraphs, ZERO
projectiles):**
- **LANCE PASS** — rides to an arena edge; a full-length lane FLASHES → he
  thunders down it (drillCharge tech, longer + faster). Later: DOUBLE PASS
  (two lanes flash in sequence).
- **CAROUSEL** — a ring-track telegraph lights the arena circumference → he
  gallops the circle, lance out (ring lane; stand inside or outside).
- **TILT OF THE COURT** — spectral joust-list barriers materialize, splitting
  the arena into 3 lanes → YOUR lane flashes → pass; dodge through the
  barrier gaps (temporary walls + lane telegraph).
- **WALTZ TRAMPLE** — hoof-stomp zones bloom in 3-beat triplets synced to
  the theme (1-2-3 zone waves; floorStamp tech in waltz time).
- **PENNON SWEEP** — at close range: locked cone glows → wide lance sweep.
- **BLOOD MOON JOUST (signature)** — the moon flares; a moonbeam LANE sweeps
  once across the whole arena like a clock hand (rotating beam telegraph) →
  after it passes he is WINDED: horse rears, rooted, ×1.5 damage (vented).
- **DIRE RAT adds** mid-fight (queueSpawn) + overclock enrage at low HP.
≤6 scouter hints. Every source fromBoss=true. He never dismounts — UNHORSED
BY NO MAN.

## 6 · Music + SFX

**"THE LAST WALTZ"** (assets/castle_theme.wav — ✅ APPROVED by Red):
8-bit ELEGANT WALTZ GONE WRONG — true 3/4, 150 BPM, 150 bars = 180.0s.
Music-box intro → grand C-major ballroom waltz (oom-pah-pah, harp arps) →
the SLIP (wrong notes creep in, a detuned ghost-partner voice joins) →
C-minor waltz → ballroom horror (timpani + organ clusters + shriek stabs) →
corrupted grand reprise → broken music box winding down. Port via the map's
section-composer (equal-beat tracks — note 3/4: 3 beats per bar).
New SFX: hoofbeat gallop loop · lance crack · gate smash · chandelier crash ·
beam hum · waltz swell sting · mirror chime (phantom blink) · armor clatter
(reassemble).

## 7 · Build order (Opus)

1. art.js: 8 mob draws + THE PALE KING (castle_boss_final.png canon — the
   parameterized paleRider fn in assets/render/render_pale_riders.js renders
   ANY variant; port var #10) + 20 decor + tiles #1–5 (port from
   assets/render/*.js).
2. map.js: realm/biome/mobs/boss/dropTable/console unlock + THE LAST WALTZ
   composer (3/4!) + SFX.
3. scene.js: PLAN-array layout per scene PNG; room walls; crimson runner;
   chandeliers as scene objects; window beam emitters; wrap.
4. Blood Moon Court (each testable alone): crimson beams → waltz surge →
   chandelier crashes.
5. Boss: gate-smash entrance, the 6-verb mounted kit, rat adds, vented
   window, enrage.
6. Bestiary + scouter TEXT-FIT (≤6 hints); suite m9_castle_verify.js
   (routing · 8 mob mechanics incl. armor reassembly · beam/waltz/chandelier
   clocks through unfreeze · boss lanes + gate entrance) + FULL battery +
   ?v= bump.

## 8 · Status

**EVERYTHING LOCKED 2026-07-15** — scene plan approved, THE LAST WALTZ
approved. Map 3 is build-ready.
