# WITCH'S SWAMP — map plan (MAP 8 of the 10-map campaign)

> Realm 12. Every pick is Red's. Bayou-witch mood: black water, wisp light,
> brew green — spooky but alive (frogs, fireflies, blues). Sheets + finals
> in `assets/` and `artdev/swamp/`. Numbers TUNE ME. LOCKED 2026-07-16
> (boss-art + theme sign-offs noted in §5/§6).

## 1 · Theme + name

**WITCH'S SWAMP** — a black-water bayou ruled by the Brewmistress: moss
islands joined by rickety planks, hex totems muttering in the mire.
Palette anchors: bog greens, murk teal-black, witch purple, brew
chartreuse, wisp aqua, bone.

- Realm id `swamp`, biome `swamp`, boss `brewmistress`, music `swamp`.
- Toroidal wrap ON (via edge plank paths; seam through open water).

## 2 · HEX TOTEMS — signature map system (LOCKED package)

Carved totems rise from marked sites on a cycle:
1. **RISE**: a site shimmers (warn) → the totem RISES and begins pulsing
   ONE hex aura — visible expanding rings (tinted per hex):
   · **SLOW hex** (violet) · **DRAIN hex** (ticks small damage, green) ·
   · **WEAKEN hex** (you deal less damage inside, bone-white).
2. **SHATTER**: totems are SHOOTABLE env objects — break one and it
   splinters (env credit for mobs caught in the splinter burst).
3. **NEVER MORE THAN 2 UP**; sites A–E rotate; auras never overlap the
   spawn dock. Suites park the cycle.
No conductor entity (fresh — no reuse of prior map cycles). Totem tech
doubles as the boss's PLANT A HEX TOTEM verb.

## 3 · Roster (TWELVE — Red picked 1 2 4 5 6 8 11 13 20 19 17 + 14; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Bogling** | swarm | cheap mud-imp chaser; harmless splat on death |
| **Giant Leech** | latcher | telegraphed lunge; LATCH = short drain (shake off by moving/shooting it; pirate-pin brevity rule) |
| **Skeeter Cloud** | fast harasser | weaving cloud, quick nip passes |
| **Snapjaw Turtle** | tank | neck-snap cone; tucks into shell when shot (brief armor) |
| **Witchling** | caster | aimed hex bolts (orbShot + violet tint) |
| **Sporecap Myconid** | zoner | telegraphed spore cloud sectors (slow) |
| **Toad Alchemist** | lobber | brew flasks onto warned circles → toxic seep pools |
| **Mire Serpent** | striker | telegraphed S-curve strike lanes (wrap-aware) |
| **Glowcap Sprite** | healer | mends nearby mobs — priority target |
| **Bottled Imp** | zoner | jar hops at you, SMASHES on warned circle → flame patch |
| **Cauldron Mimic** | elite | heavy hops (quake rings) + brew arcs onto warned circles |
| **Mossback** | elite hulk | sleeps as mossy mound; wakes furious — charge + slam combo |

## 4 · Decorations (Red: 1 2 5 6 7 10 11 17 19) + tiles (my spread, Red delegated)

Decor: **witch's hut · giant cauldron · dead snag · lily pads · cattail
reeds · rot log · mushroom ring · firefly bush · ritual circle.** (Hex
totems appear ONLY as the mechanic objects, not scatter decor — Red left
#3 unpicked. Cut: cypress, chimes, skull lantern, coffin, dock prop, altar,
potions, statue, croc skull*, arch. *croc skull kept as ONE landmark in the
mire per scene plan — drop if Red objects.)

Tiles: #1 bog moss (BASE) · #2 murk water · #3 mud flat · #5 plank path ·
#6 lily shallows · #8 glow algae (near the hollow) · #9 ritual earth (boss
arena) · #10 toxic seep (hazard accents). (#4 roots + #7 peat cut for
readability.)

**PLANNED scene (assets/swamp_scene_plan.png — composed, never scatter):**
- **THE OLD DOCK** (S, spawn): dock bank, planks north into the bog.
- **FIREFLY MEADOW** (SW): gentle start — bushes, cattails, mushroom ring.
- **THE MIRE** (center): mud + toxic seeps + rot logs + croc skull;
  MOSSBACK sleeps here.
- **LILY LAKES** (E): open water, lily shallows, cattail banks.
- **SNAG WOOD** (NW): dead snags + mushroom ring — serpents + spiders' turf
  (spider not picked; serpents + skeeters).
- **RITUAL GLADE** (NE-center): ritual circle glyph — witchling turf.
- **WITCH'S HOLLOW** (N, BOSS): stilted hut + GIANT CAULDRON + ritual-earth
  arena ring.
- HEX TOTEM sites A–E ring the mid-map. Wrap via edge planks (S↔N, E↔W).
- Water: slow-wade or blocked — builder picks ONE and documents it.

## 5 · THE BREWMISTRESS (boss — art FINAL: #4 work-up)

**Look (LOCKED, assets/swamp_boss_final.png):** green-skinned hag in
brew-stained chartreuse robes with ragged hem, crooked point hat, straggly
grey hair, long warty nose, glowing brew-green eyes, iron LADLE staff
(brew-filled bowl), casting-spark hand, her fat TOAD familiar at her hem.
Title card: **THE BREWMISTRESS**.

**Entrance (LOCKED — rises from the cauldron):** the giant cauldron
bubbles harder and harder, glowing green, bloops quickening → she RISES
OUT OF THE BREW ladle-first, dripping, cackles; the toad hops out after.
(~3s; suites waitForFunction(r.boss && r.scanning).)

**Kit (LOCKED — boss contract: telegraphed ground overlays, no spam):**
- **LADLE SWING** — locked cone flash → heavy swat.
- **FLASK VOLLEY** — 3 brews onto warned circles → toxic seep pools linger.
- **PLANT A HEX TOTEM** — she slams a totem into the arena; it pulses
  slow-hex rings until SHOT DOWN (map mechanic weaponized).
- **SWAMP GAS** — telegraphed expanding cloud sectors; move out.
- **SUMMON THE BREW** — boglings + a bottled imp pour from the cauldron
  (queueSpawn).
- **SIGNATURE — THE GRAND BREW**: she dives INTO the giant cauldron →
  warned splash circles rain brew → the POT TIPS: a huge telegraphed brew
  WAVE floods half the arena (half-field sweep, clear safe half) → she
  crawls out dizzy — WINDED (rooted, ×1.5 vented — hurtBoss).
- Enrage at low HP: the pot boils faster — all cycles tighten.
≤6 scouter hints. Every source fromBoss=true. NO radial/stream spam.

## 6 · Music + SFX

**"WISP RAVE"** (assets/swamp_theme.wav — TAKE 4, **RED'S PICK: "thats the
one"**; he rejected ritual drums, blues stomp, and 808 hip-hop first):
8-BIT TECHNO TRANCE — 140 BPM, 105 bars = 180.0s, A minor (Am–F–C–G).
Four-on-the-floor kicks, offbeat open hats + 16th closed, ACID BASS
(16th offbeat pulses, octave pops, slides), trance ARP (16th up-down),
detuned 3-voice anthem lead, gated pads, emotive breakdown melody →
8-bar snare-roll BUILD with risers → full DROP (noise crash + sub layer) →
second breakdown → FINAL DROP an octave up → outro. Wisp drips + one
croak per phrase keep it swampy. Port via section-composer — KEEP the
four-on-floor + offbeat hats, the acid slides, the gated pads, and the
build/drop arc (16th grid throughout).
New SFX: totem rise rumble + hex pulse (3 tints) · totem shatter · ladle
whoosh · flask smash + seep sizzle · gas hiss · cauldron bloop + splash ·
POT TIP wave roar · leech latch/pop · turtle shell tink · serpent hiss ·
mimic clang hop · mossback wake roar · croak/cricket ambience.

## 7 · Build order (Opus)

1. art.js: 12 mob draws + THE BREWMISTRESS (final canon; swampWitch(put,S,o)
   parameterized in render_swamp_boss.js) + hex totem object (3 aura tints)
   + 9 decor + 8 tiles (port from assets/render/*.js).
2. map.js: realm/biome/12 mob rows/boss/dropTable/console unlock + MUDDY
   WATER STOMP composer + SFX + totemCfg { cycleMs, maxUp:2, hexes, hp —
   ALL TUNE }.
3. scene.js: island layout per scene PNG (islands, planks, water rule,
   seeps, glade circle, hollow arena); HEX TOTEM cycle (shimmer → rise →
   pulse → shootable shatter); wrap via edge planks.
4. Boss: cauldron-rise entrance, 6-verb kit (totem verb reuses mechanic
   tech), GRAND BREW wave + vented window, boil enrage.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m14_swamp_verify.js
   (routing · totem cycle max-2 + shatter env credit · 12 mob mechanics
   incl. leech release + turtle armor + sprite heal · boss verbs + wave +
   entrance) + FULL battery + ?v= bump.

## 8 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

totem[].nextAt / riseAt / pulse[].at · leech lungeAt / latchUntil (PLAYER
latch — release on hitstop/death!) · turtle tuckUntil / snapAt · witchling
boltAt · myconid cloudAt · toad lobAt / flask[].landAt + seep dieAt ·
serpent laneAt / strikeUntil · sprite healAt · imp hopAt / smashAt + patch
dieAt · mimic hopAt / ring[].at / spewAt · mossback wakeAt / chargeAt /
slamAt · boss: nextVerbAt / totemPlant / gas[].at / adds nextAt /
grandBrew seq[].at / waveAt / ventedUntil / rootUntil · every
_zoneWarn.until. (Skip Infinity-parked.)

## 9 · Status

**LOCKED 2026-07-16** — roster (12) + kits, decor (Red's 9), tiles (my 8,
delegated), THE BREWMISTRESS look/name/entrance/kit, HEX TOTEMS, scene.
Theme = TAKE 4 "Wisp Rave" techno trance — RED-APPROVED ("thats the one").
Map 8 is build-ready.
