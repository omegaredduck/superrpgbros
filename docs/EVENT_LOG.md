# EVENT LOG — what changed, when, and why

> Append-only. Newest entries on top. One entry per work session or notable change.
> Format: date · milestone · **what landed** · files touched · notes/decisions.
> This file is the project's memory — if it's not logged here, it didn't happen.

---

## 2026-07-17 · M7 BUILD · MAP 8/16 WITCH'S SWAMP SHIPPED (?v=m7i)

**Realm 12 — game/js/maps/swamp/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits). Bayou witch: black water, wisp light, brew
green — spooky but alive. Session ended here (Red's call) — see the
battery note at the bottom.

**Landed:**
- Island bayou: seven bog-moss islands in black water joined by rickety
  plank paths (rotated tileSprites), glow-algae + lily-shallows accent
  patches, mire toxic seeps (permanent damage-tick patches), the OLD DOCK
  spawn south, WITCH'S HOLLOW north (hut + GIANT CAULDRON + ritual-earth
  arena). **WATER RULE (picked + documented in scene.js): slow-wade
  0.45× — islands and planks run free.** Wrap via edge planks.
- **HEX TOTEMS** signature system: sites A–E cycle — shimmer warn → the
  totem RISES as a SHOOTABLE env object (playerShots drain its hp) and
  pulses ONE hex aura: violet SLOW (players AND mobs), green DRAIN (ticks
  both; mob deaths env-credited), bone WEAKEN (shots fired from inside are
  tagged once and land at 0.6×). Shot down = splinter burst
  (killMobCredited, no player damage). HARD RULES verified: never more
  than 2 up (the cycle refuses a third), never at the dock (sites are
  fixed mid-map).
- 12 mobs: bogling swarm, GIANT LEECH (lunge → LATCH: ~0.8s ride-along
  drain that breaks on hitstop/shooting it/boss arrival — pirate-pin
  brevity), skeeter cloud (core lunge nips), SNAPJAW TURTLE (snap cone +
  TUCK: damage-refund shell w/ cooldown so it can't turtle forever),
  witchling (orbShot violet hex bolts), sporecap myconid (warned circles →
  violet slow clouds), toad alchemist (3-flask mortar → lingering seep
  pools), MIRE SERPENT (wrap-aware warned lane strike), GLOWCAP SPRITE
  (heals mobs +12, flees you, respects hitstop — priority target),
  BOTTLED IMP (jar hops → warned SMASH → flame patch, self-kill credited),
  CAULDRON MIMIC elite (quake-ring hops + brew-arc spew), MOSSBACK elite
  (sleeps as a mound — 0 aggro until approached OR SHOT, shimmer on the
  mob only → wakes furious: alternating charge lane / slam circle combo).
- **THE BREWMISTRESS · MISTRESS OF THE MIRE** (hp 3800, #4: brew-stained
  robes, crooked point hat, iron ladle, toad familiar): **cauldron-rise
  entrance** (bloops accelerate → she rises ladle-first, dripping +
  cackle). Kit: LADLE SWING cone + knockback · FLASK VOLLEY (3 warned
  circles → seep pools) · PLANT A HEX TOTEM (map tech weaponized, slow
  hex, hp 25 — REROUTES to flasks while 2 map totems stand: no hex soup) ·
  SWAMP GAS (3 warned sectors in sequence) · SUMMON THE BREW (3 boglings +
  a bottled imp from the pot, capped) · **THE GRAND BREW**: she dives IN
  (untargetable; the pot is the actor) → 5 warned splashes → **the POT
  TIPS**: a long-warned HALF-ARENA wave on fixed alternating halves (mobs
  in it die credited) → she crawls out dizzy: rooted + vented ×1.5 ·
  enrage: the pot boils faster. The cauldron itself is scenery — never
  targetable (ghost-ship lesson).
- **"WISP RAVE"** (TAKE 4 — Red: "thats the one"): 8-bit TECHNO TRANCE,
  140 BPM A minor, 105 bars × 4 = 420 beats = EXACTLY 180.0s (asserted,
  12 tracks equal). Four-on-the-floor kicks, offbeat open hats + 16th
  closed ticks, ACID bass (16th offbeats, octave pops, a G-pop where the
  slide was), trance arp, twin-voice anthem lead, gated pads, breakdown →
  accelerating snare-roll BUILD → THE DROP w/ sub layer → break 2 → final
  drop octave up → outro. Wisp drips + one croak per phrase. 14 new SFX.

**Verified:** test/m14_swamp_verify.js — **34/34 green** (registry/theme/
water rule · totem rise/auras/all 3 hexes/shatter credit/max-2 · leech
latch lifecycle · turtle tuck refund+reopen · myconid/toad pools · serpent
wrap lane · sprite heal + hitstop respect · imp smash · mimic quake+spew ·
mossback sleep→shot-wake→combo · unfreeze · cauldron entrance + cycle
pause · ladle/flask/totem-reroute/gas/adds · GRAND BREW dive→tip→vent 150 ·
kill→chest · zero console errors). m2 + m13 smoke green on m7i.
**⚠ FULL battery NOT yet re-run on m7i** (session ended) — run it FIRST
THING next session before building map 9.

**Next:** full battery on m7i, then MAP 9/16 WEST. GitHub still at m3q —
Red should push (2_SAVE_AND_UPLOAD.bat) before the next session.

---

## 2026-07-17 · M7 BUILD · MAP 7/16 HAUNTED CARNIVAL SHIPPED (?v=m7h)

**Realm 11 — game/js/maps/carnival/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits). Creepy carnival: cheery-gone-wrong under
sickly bulb glow on midnight dark — not gore, not pitch black.

**Landed:**
- Midnight fairground: warped FUNHOUSE CHECKER floor inside a solid wooden
  fence (south-gate spawn, gate gap in the block line), dead-grass wrap
  outskirts, the MIDWAY spine of booths A–D, ride yard west (carousel,
  ferris, teacup, ghost-train rails decal), sideshow alley east (wagon,
  cage, posters, mirrors, funhouse mouth), and THE BIG TOP north — RING
  MAT floor + a striped canvas wall ring of static blocks, solid except
  the south flap. All colliders attach in afterCreate (the m7g lesson).
- **GAME BOOTHS** signature system: booths light ONE AT A TIME on a cycle
  (glow zone + bulb sting). Enter the glow to START the round — bullseye
  targets pop to real playerShots (env objects, **NO kill credit**); all
  down in time = PRIZE (heal + XP + fanfare); timeout/abandon = **THE
  BOOTH BITES BACK** — one telegraphed burst at the booth mouth
  (killMobCredited on mobs it catches). Never mandatory, never two at
  once; the cycle CANCELS cleanly on boss arrival. Suites park
  booth.nextAt = Infinity.
- 11 mobs: CREEPY CLOWN (honk telegraph → lunge), BALLOON WISP (drifts
  in, warned POP, shootable early — self-pop via killMobCredited, warn
  ring swept by armed cleanup), CARNY BARKER (warned cane cone that
  PUSHES — halved while the cymbal slow holds: the CC cap), POSSESSED
  TEDDY (plays dead → shimmer ON THE MOB ONLY → springs), POPCORN
  POLTERGEIST (3-kernel mortar), STRONGMAN SHADE (warned slam + expanding
  shockwave ring), COTTON CANDY BLOB (pink slow patches; **splits ONCE**
  on death via a scene watcher + queueSpawn with child marks), KNIFE
  JUGGLER (3 aimed knife lanes), WHACK-A-MOLE (buries → warned hole under
  you → erupts, body off while under), CYMBAL MONKEY (clash ring slow,
  hard-capped at +1600ms), FERRIS PHANTOM elite (wrap-aware rolling lane
  warn rendered on both sides of the seam + twin spoke-beam flicks).
- **THE RINGMASTER · THE SHOW NEVER ENDS** (hp 3700, #1 THE CLASSIC: red
  tailcoat/gold trim/top hat/waxed mustache/whip/spotlight pool):
  **trapeze descent** entrance (spotlight snaps on EMPTY → calliope swell
  → the rig swings him down → dismount, BOW, whip CRACK). Kit: WHIP CRACK
  cone + knockback · SPOTLIGHT LOCK (chases, breaks on hitstop, fills →
  stage light crash) · SEND IN THE CLOWNS (3 clowns + a juggler,
  bossWave, capped) · KNIFE CURTAIN (4 lanes marching in sequence) ·
  STEP RIGHT UP (booth tech inverted: 2 teal SAFE rings, one always
  within reach, never on the wall — outside gets raked) · **GRAND
  FINALE** (8 warned fireworks → he BOWS: rooted + vented ×1.5) · enrage:
  the calliope speeds up (rateMult on all cycles). Warn language: env =
  TEAL, boss = GOLD — both pop on red AND cream checker squares.
- **"THE LAST SHOW"**: TRUE 3/4 — 132 BPM, 132 bars × 3 = 396 beats =
  EXACTLY 180.0s (asserted, all 10 tracks equal). D-minor circus waltz:
  oom-pah-pah engine, calliope pipe lead, forced-cheery chorus bells,
  TAPE-WARP bars play a SEMITONE FLAT (the composer can't bend pitch —
  same wrongness, chip-legal), music-box break that skips, mad giggles,
  octave-up finale, power-cut ending (flat wheeze + a sawdust thump).
  14 new SFX (booth sting/pop/fanfare/bite, whip, spotlight hum, light
  crash, knife whish, firework, trapeze creak, calliope swell, honk,
  cymbal, balloon pop).

**Verified:** test/m13_carnival_verify.js — 33/33 green FIRST RUN
(registry/theme/layout · booth round win + NO-credit pops + bite credit ·
all 11 mob verbs · unfreeze shifts · trapeze entrance + booth cancel ·
whip/spotlight/clowns/curtain/game-rings/finale + vent 150 · kill → chest
+ machinery swept · zero console errors). Full battery green on m7h.

**Next:** MAP 8/16 SWAMP.

---

## 2026-07-17 · M7 BUILD · MAP 6/16 CRYSTAL CAVERNS SHIPPED (?v=m7g)

**Realm 10 — game/js/maps/crystal/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits). Sparkle adventure: saturated gems on dark rock.

**Landed:**
- Chambered cave world: six masked-ellipse chambers (entry shelf spawn ·
  great hall hub · garden · geode hollow · underground lake w/ sand rim +
  crystal bridge · THE DEEP FISSURE arena) joined by rotated-tileSprite
  tunnels; solid rock is CRUSH-SLOW (0.35×) rather than a hard wall — the
  tunnel network stays meaningful without collider geometry.
- **GROWING CRYSTAL** signature system: GATES A–D at tunnel chokepoints
  cycle — floor shimmer + chime warn → the wall GROWS SHUT (a row of real
  static-body blocks in one shared wall group + shard sprite + kgrown
  stain) → crack telegraph → **SHATTER**: harmless sparkle + a damaging
  shard ring on the line (killMobCredited). HARD RULES verified: ≥2 gates
  open always (the cycle refuses a third close), and a closing gate DEFERS
  while anyone stands on it.
- 9 mobs: shardling swarm, AMETHYST LURKER (disguised → shimmer → wake →
  core lunge), GEODE GOLEM (warned slam + the exposed CORE takes +50%
  from behind via _coreHp detection), shatterbat (swoop lunge + DAZE
  screech cone), QUARTZ RAM (locked lane → wrap-carrying charge, velocity
  set at charge start), resonator (expanding rings — shared ring runner),
  gemwing moth (glitter-dust slow patches), deep crawler (pincer cone),
  voidgem horror (twin void beams).
- **THE SHARDLORD · HEART OF THE MOUNTAIN** (hp 3600, colossus display
  165): ceiling-drop entrance (stalactite warns + chandelier shudder →
  crash + quake → core ignites color by color). The **RAINBOW CORE is the
  telegraph language**: core locks a color (boss tints + chime + a
  cosmetic hue-cycling glow) → that color fires — PINK shard volley, CYAN
  lances, PURPLE growing walls (gate tech weaponized, auto-shatter, swept
  on boss death), AMBER quake rings, GREEN geode hatch. **PRISMATIC
  OVERLOAD**: five colored cones sweep the wheel → the core burns out
  GREY → **vented ×1.5**, rooted.
- **CAVERN OF WONDERS** theme: 88 BPM C major, 66 bars = 264 beats =
  180.0s exactly. Music-box glitter arps, bouncing octave bass, snap-clap
  engine, soaring chorus w/ low counter-line, the ECHO CAVE break (the
  cave answers back, fading), octave-up verse, grand finale pads,
  music-box outro. 11 tracks, equal-beat asserted. 8 crystal SFX.
- **test/m12_crystal_verify.js — 26/26 GREEN** + FULL battery green.

**Files:** game/js/maps/crystal/{art,scene,map}.js (NEW) ·
game/index.html (?v=m7g) · test/m12_crystal_verify.js (NEW) · docs.

**Decisions:** colliders must NOT be created in setup() — the player does
not exist yet during the terrain dispatch; attach them in afterCreate
(the 'isParent' undefined crash poisons every physics step and silently
breaks pause/unfreeze + boss spawns). Suites resolve verb delayedCalls
DETERMINISTICALLY by wrapping scene.time.delayedCall and invoking the
captured callback (no scene-time waits at all — supersedes the m7f
waitForFunction pattern where state polling is awkward).

**Next up:** MAP 7/16 — CARNIVAL (realm 11).

---

## 2026-07-17 · M7 BUILD · MAP 5/16 PIRATE SHIP SHIPPED (?v=m7f)

**Realm 9 — game/js/maps/pirate/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits). Red's PIVOT honored: mobs are LIVING pirates
+ sea creatures — ghost teal appears NOWHERE except the boss's summon.

**Landed:**
- **THE ROCKING DECK**: the ship heels on a swell clock — lean telegraph
  (tint + creak) → SLIDE drags player AND mobs on deck toward the low
  rail (positional, hitstop-gated, beach/dock exempt); **RAIL SAFETY**
  clamps everyone aboard; **hard swells roll loose cargo** — barrel
  rollers cross the deck (killMobCredited mobs, hurtPlayer player).
  Open water + ink slicks slow swimmers 0.55×.
- 10 living-crew mobs + the boss's deckKeg prop: deckhand, cutlass
  corsair (core lunge), POWDER MONKEY (keg kamikaze on the mine
  watcher tech — fuse blast + shot-early pop, all env kills credited,
  XP before player burn), salty gull (dive lunge), SIREN (song windows
  pull, per-frame displacement cap vs swell stacking), KRAKEN ARM
  (warned deck hole → erupts rooted → lane sweeps → withdraws +
  re-ambushes near you), mako leaper (marked arcs over the rails),
  drunken swab (owns an erratic zig-zag), HARPOONER (lane telegraph →
  brief PIN, releases on death/timeout, clock-shifted), inkpot octo
  (warned globs → slippery slicks).
- **CAPTAIN KRAKEN** (hp 3200, mapOwned): thrown aboard by a COLOSSAL
  TENTACLE (rises off the bow, hurls him onto the foredeck — arc tween +
  deck-shake). Kit: cutlass combo (re-aiming double cone), tentacle slam
  (marching circle line), keg toss (shootable deckKeg mobs, fromBoss),
  boarding crew adds, hard-swell command (weaponized map mechanic),
  **THE GHOST SHIP BROADSIDE** — spectral galleon FX sprite surfaces to
  starboard, TWO 3-lane waves rake the deck, sinks → **vented ×1.5**.
  Enrage tightens the swell clock.
- **THE KRAKEN'S SHANTY**: 100 BPM D dorian, 75 bars = 300 beats =
  180.0s exactly. Concertina lead + reed pumps, stomp-and-clap, crew
  HEY!s, root-fifth bass → ghost choir → THE FATHOMS (sonar + bending
  wail) → ghostly chorus → octave-up rowdy finale → one last HEY! and a
  ghost breath. 10 tracks, equal-beat asserted. 10 pirate SFX.
- **test/m11_pirate_verify.js — 27/27 GREEN** + FULL battery green.

**Files:** game/js/maps/pirate/{art,scene,map}.js (NEW) ·
game/index.html (?v=m7f) · test/m11_pirate_verify.js (NEW) · docs.

**Decisions:** HEADLESS TIMING LESSON — Phaser scene time runs ~0.3× real
time under headless rAF throttling, so suites must NEVER wait fixed real
ms for a scene-time delayedCall: poll the resulting STATE with
waitForFunction instead. Ambient mobs interfere with delayed asserts —
wipe the field first. deckKeg has NO chase def (kegs don't bite);
env-blast XP lands before the player burn (lunar lesson, kept).

**Next up:** MAP 6/16 — CRYSTAL (realm 10).

---

## 2026-07-17 · M7 BUILD · MAP 4/16 LUNAR STATION SHIPPED (?v=m7e)

**Realm 8 — game/js/maps/lunar/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits).

**Landed:**
- **LOW GRAVITY** signature system, all realm-scoped in the map update:
  hit mobs keep DRIFTING after the core knockback (~2× distance, hangs
  ~450ms — _lgHp drop detection + decaying positional glide); the player
  carries **momentum glide** on sudden stops; **JUMP PADS** in 3 pairs arc
  you across the crater belt (manual mover, absolute clocks, body OFF in
  flight = contact-immune while zones still land); **dust puffs** on
  regolith only (module decks stay clean). All pushes gate on hitstop.
- 9 mobs + scuttler hatchling: grey watcher (psi orbShot), brood sac
  (dormant → cracks on approach → capped scuttler waves via queueSpawn),
  sentry drone (triple laser burst), haywire turret (rooted 3-arc lane
  sweeps), astro-revenant (float; GRAB = brief hold + ticks, releases on
  death/timeout, clock-shifted), magnetron (constant positional drag),
  luna leaper (marked landing rings + low-grav arcs, airborne mid-hop),
  orbital mine (drifts, beeps, warned blast; SHOOTABLE — pops early via
  a scene-side watcher; mine + victims all killMobCredited, no double
  credit; XP lands BEFORE the player burn so level-up heals can't mask
  it), star horror (locked tentacle cones).
- **SPECIMEN ZERO · THE OVERMIND** (hp 2800, mapOwned, zero projectiles):
  LIGHTS-OUT entrance (arena powers down to black → the violet eye
  ignites → emergency lights stutter on → it was already there; residual
  gloom holds until it dies, frame-driven armed cleanup). Kit: tkBarrage,
  mindLash cone, gravityWell (warned circle → live PULL for 3s → pop),
  cableSweep lanes, psychicScream expanding ring (outrun it),
  **CONTAINMENT PURGE** — 6 arena sectors vent in sequence w/ one safe
  pocket → tank fractures → **vented ×1.5**; broodCall adds; overclock.
- **SEA OF TRANQUILITY** theme: 72 BPM, 54 bars = 216 beats = 180.0s
  exactly. C-Lydian pads (4 voices) + starlight 16th arps + glass bells →
  first shadow → THE MENACE (drone, tritone, vent clicks, heartbeat) →
  uneasy return with the wrong note that stays; ends on one bell + one
  click. 10 tracks, equal-beat asserted. 9 lunar SFX.
- **test/m10_lunar_verify.js — 28/28 GREEN** + FULL battery green on m7e.

**Files:** game/js/maps/lunar/{art,scene,map}.js (NEW) ·
game/index.html (?v=m7e) · test/m10_lunar_verify.js (NEW) · docs.

**Decisions:** hurtMob's juice hitstop gates ALL positional pushes — suite
fixtures must clear hitstopActive before reading push effects; env-kill
XP must land BEFORE hurtPlayer in shared blasts (level-up full heal would
mask the damage assert); mine ring cleanup on both death paths.

**Next up:** MAP 5/16 — PIRATE (realm 9).

---

## 2026-07-17 · M7 BUILD · MAP 3/16 VAMPIRE CASTLE SHIPPED (?v=m7d)

**Realm 7 — game/js/maps/castle/{art,scene,map}.js** (folder-registered,
three tags, ZERO core edits — the registry hooks from m7a/m7c carried the
whole map).

**Landed:**
- **BLOOD MOON COURT** terrain mechanic: roaming moonbeam pools EMPOWER mobs
  standing in them (tint + spd/dmg buff, per-frame flag reset) and BURN the
  player; ballroom **waltz drift** (positional push applied BEFORE the wrap
  check, gated on hitstop); **chandelier crash + rehoist** hazard cycles.
- 8 court mobs + 2 support defs: gargoyle (perch HARDENED — damage-RESIST
  via _lastHp refund pattern, hurtMob has no resist hook), blood maiden
  (leech shot-ledger heals from landed hits), halberd guard (sweep lane),
  portrait phantom (wall-phase ambush), vamp initiate, dire rats (pack-credit
  queueSpawn trick), animated armor → **armorPiece crawl-to-centroid
  reassembly** → separate `armorReborn` def (no re-split; hp fixed ×0.4),
  crimson duelist (orbit+lunge state machine owning its own movement).
- **THE PALE KING** (hp 2500, mapOwned): lancePass (double pass <60% hp),
  carousel ring gallop, tiltCourt spectral walls + collider (cleared on ALL
  exit paths), waltzTrample 3×3 beat-staggered zones, pennonSweep cone,
  bloodMoonJoust rotating lane → **vented ×1.5 window**, ratAdds, overclock.
  GATE-SMASH bossArrival: portcullis rises, entrance lane, king gallops in.
- **THE LAST WALTZ** theme: true 3/4 — 150 bars @150 BPM = 180.0s exactly
  (450 beats). Music-box intro → grand waltz → wrongify slips + detuned
  ghost-twin (delayed 0.1 beat) → minor waltz + timpani → ballroom horror
  organ → corrupted grand reprise → broken music box. 7 tracks, equal-beat
  asserted. 9 castle SFX.
- **test/m9_castle_verify.js — 21/21 GREEN** + FULL battery green on m7d
  (one m3b flake mid-run, green on rerun — same precedent as the m1 flake).

**Files:** game/js/maps/castle/{art,scene,map}.js (NEW) ·
game/index.html (?v=m7d) · test/m9_castle_verify.js (NEW) · docs.

**Decisions:** damage-resist-without-a-hook = _lastHp refund + 'HARDENED'
popup (reusable); per-mob split override impossible (core reads def.split on
death) → reassembled armor is its own def; gate-smash assert must not race
the 300ms alpha tween (check gate.y OR alpha).

**Next up:** MAP 4/16 — LUNAR (realm 8).

---

## 2026-07-17 · M7 BUILD · MAP 2/16 PYRAMID PLUNDER SHIPPED (?v=m7c)

**Realm 6 — game/js/maps/pyramid/{art,scene,map}.js** (folder-registered,
three tags, zero per-map core edits). One NEW registry hook landed in core:
the boss-died dispatcher now branches `def.mapOwned && def.transform` →
the map folder's `scene.bossTransform` (engineer-cutscene seat) — this is
THE two-phase plumbing every later transforming boss rides.

- art.js: Red's picks — mobs #1 3 5 7 10 11 12 14 · NEFERU-KA BOTH forms
  (pyramid_boss_final canon) · ALL 20 decor · tiles #1 2 3 4 5 7 8 10.
- scene.js: plan-PNG layout (camp → causeway spine → necropolis/oasis/dunes/
  temple court → BURIAL CHAMBER w/ obsidian seal + 4 anubis statues);
  TREASURE & CURSE (walk-over plunder pays XP + haste and raises CURSE →
  quicksand churns wider → trap plates arm (warned dart lanes, mobs
  killMobCredited) → retaliation waves + sky dims; urns = free smashes);
  quicksand slow (speed mult in the mover); toroidal wrap; warned-zone +
  warned-LANE machinery (absolute clocks, _zoneWarns mirrored).
- mapVerbs: KHOPESH GUARD visible shield window (reuses hurtMob's
  guardShieldUntil bounce + 'BLOCKED' popup), SANDSTONE GOLEM telegraphed
  ground-pound, JACKAL pack-spawn (pack-credit trick stops chain packs).
- NEFERU-KA: SARCOPHAGUS CREAKS OPEN entrance (braziers gutter → lid grinds
  → the child floats out). Phase 1 caster: curse sigils · MASK GAZE locked
  cone · TANTRUM QUAKE checkerboard waves · SANDS OF AGE (real lingering
  quicksand) · royal summons. Phase-1 death → TRANSFORMATION cutscene →
  THE EXECUTIONER (texture + body resize mech-precedent, full second HP
  pool, 2.4× hunter speed, its own 6-hint scouter): CROSS-SLASH X-lane
  double dash · WHIRLING BLADES grow-ring · BRAND · GUILLOTINE LEAP
  (tracking→locked circle) · JUDGMENT OF THE FOUR signature (statues sweep
  beam lanes in sequence → he KNEELS, vented ×1.5) · jackal adds · enrage.
- map.js: rows + console unlock + 9 SFX + "THE ETERNAL CHILD" ported as an
  8-track section composer — 84 BPM D hijaz, 63 bars = 252 beats = EXACTLY
  180.0s (drone/chants/heartbeat toms/shaker/dread stabs/ornamented
  snake-charmer lead/gong+bells + the final wrong little child's bell).
- **NEW test/m8_pyramid_verify.js — 23/23 GREEN · FULL BATTERY GREEN on
  m7c** (incl. m7 skyisles 26/26).

**Files:** game/js/maps/pyramid/* (NEW) · scenes.js (transform hook) ·
index.html (?v=m7c) · test/m8_pyramid_verify.js (NEW) · docs.
**Next:** map 3/16 CASTLE (realm 7).

## 2026-07-17 · M7 BUILD · REGISTRY REFACTOR (?v=m7a) + MAP 1 STORM SKY ISLES SHIPPED (?v=m7b)

THE BUILD SESSION begins (docs/NEXT_SESSION.md is the brief). Red skipped the
safety push ("skip it, just build").

**M7a — THE REGISTRY REFACTOR (REGISTRY_SPEC.md, build step 0):**
- NEW `game/js/maps/registry.js`: EXTENDS the existing MAPS tile-map module
  (the spec's `window.MAPS = {}` would clobber maps.js — noted in-file).
  `MAPS.register(def)` stores the def and runs `installData(DATA)` immediately
  (map folders load after builder.js, before main.js → **zero data.js edits**).
  Helpers: `MAPS.addConsoleMap` (inserts before sealed rows), `MAPS.forScene`.
- Core hooks (one-time, tiny): scenes.js create() registry-map terrain branch +
  afterCreate + per-frame map update (owns wrap/ambient) + unfreeze(dt) +
  annihilate + bossArrival dispatch; entities.js updateBoss `def.mapOwned` →
  scene.bossUpdate (grovekeeper no-return pattern) + updateMob `def.mapVerb` →
  def.mobVerbs table; textures.js buildHiFiWorld end → def.buildArt(ctx) with
  the SAME spr/tex + MOB_HI/MOB_DISPLAY/BOSS_HI helpers core mobs use.
- SUITE DE-DRIFT (pre-existing, from the unlogged m6a–m6e factory build):
  m3c/m47/m5_grove hardcoded "3 bosses = 11 bestiary entries" → data-driven
  (roster + Object.keys(DATA.bosses)); m3b chest checks still tested the
  pre-m6c auto-equip → ported to compare-and-SELECT. m1/m21/m3 stay
  documented-stale (pre-m3o menu model, not in the battery).
- Fence retrofit audit: only the graveyard has fences among the live realms —
  already destructible. Yard/grove/factory have walls/trunks/pillars, not
  fences. Nothing to retrofit; new maps ship destructible by design.
- **FULL BATTERY GREEN on m7a** (m2·m3b·m3c·m4·m4b·m46·m47·m5_grove·
  graveyard smoke/boss·factory sim).

**M7b — MAP 1/16: STORM SKY ISLES (realm 5) SHIPPED:**
- `game/js/maps/skyisles/{art,scene,map}.js` — the first folder-registered
  realm; three script tags in index.html, zero core edits.
- art.js: Red's picks ported from the render scripts — mobs #2 4 8 9 11 15 16
  19, NIMBUS TALON (sky_boss_final canon, lightning skeleton), decor #1–19
  (#20 cut), tiles #1 2 3 5 10 + MIST VEIL sea (#4). Windmill split
  tower/sails (sails spin), balloon bobs, mist drifts.
- scene.js: the planned 7-isle layout (sky_scene_plan.png canon) + 8 shards,
  rope bridges, lantern cobble path; MIST SLOW (speed mult in the mover,
  floaters exempt); drifting CLOUD BANKS (concealment, flags reset before
  marking); toroidal wrap (graveyard pattern); THE TEMPEST CYCLE v2 (wind
  shift w/ ringing chimes → roaming strikes clustering on rods/vanes/the eye
  → updraft vents on island edges → THE STORM EYE conductor, parks over the
  Roost for the boss); env kills credit via killMobCredited.
- Three NEW mapVerbs through the registry hook: Cloud Ray RAYMARK (marked
  mini-strike), Nimbus Golem SHOVE (positional toss), Roc Hatchling
  BELLY-FLOP (hop airborne → telegraphed circle).
- NIMBUS TALON: GROWING-SHADOW entrance (arena darkens → he erupts onto the
  roc nest, wing-blast ring, ~3s, suites waitForFunction(r.boss&&r.scanning));
  kit = SKYFALL BARRAGE · GALE SHOVE · ISLAND-DROP SLAM (checkerboard waves)
  · DIVE LANE · ROD OVERLOAD signature (4 rods in sequence, rotating safe
  pocket → VENT ×1.5 window via core ventedUntil) · storm adds (queueSpawn,
  bossWave) · overclock enrage. mapOwned, NO radial/stream filler, 6 hints.
- map.js: biome/realm/mob/boss/dropTable rows + console unlock + 6 new SFX +
  "SKYBREAKER MARCH" ported as a 7-track section composer — 140 BPM D minor,
  105 bars = 420 beats = EXACTLY 180.0s, equal-beat asserted by construction
  (bugle intro → march A/B → storm break → double climax w/ descant →
  reprise → outro; drums faked in chip voices).
- GOTCHA logged: core wireEvents() strips map listeners on the boss/player
  event family (events.off) — death-reactive map logic must be frame-driven
  (the fight-darkness cleanup lives in update(), armed at spawn).
- **NEW `test/m7_skyisles_verify.js` — 26/26 GREEN** (routing · console/
  bestiary · mist slow + floater exemption · wrap · the 3 mapVerbs · tempest
  clocks through unfreeze · entrance · skyfall fromBoss · rod sequence + 150
  vent damage · adds · chest close · zero console errors). **FULL BATTERY
  GREEN on m7b.**

**Files:** game/js/maps/registry.js + skyisles/{art,scene,map}.js (NEW) ·
scenes.js entities.js textures.js index.html (hooks + tags, ?v=m7b) ·
test/{m7_skyisles_verify.js NEW, m3b/m3c/m47/m5_grove ported} · docs.
**Next:** map 2/16 PYRAMID (realm 6).

## 2026-07-17 · 16-MAP CAMPAIGN DESIGN COMPLETE · maps 15+16 locked, campaign closed out (planning, no game code)

Final design sessions of the map campaign (2026-07-16 → 07-17). NO game code
(?v= stays m6e). The campaign Red extended from 10 to 16 maps (realms 5–20) is
now **16/16 DESIGN-COMPLETE** — every map folder under game/js/maps/<id>/ is
stocked with PLAN.md + BUILD_INSTRUCTIONS.md + approved assets + render scripts,
mirrored to artdev/<id>/.

**MAP 15 PREHISTORIA (realm 19):** 7 dino mobs (take-2 real anatomy; recolor
rule, ptero exempt) · all 20 decor · all 10 tiles (GAME TRAIL decorative) ·
METEOR SHOWER cycle · boss THE PRIMORDIAL (dragons #10 feathered dino-dragon)
w/ THE HATCH egg entrance (4-beat gif approved) + METEOR CALL signature ·
theme PRIMAL.EXE **take 2 DARK TRANCE** ("perfect"; take-1 drums+chant
rejected — "another techno piece trance vibes but dark"): 140 BPM, 105 bars,
D minor, bar-64 drop. Suite: test/m21_prehistoria_verify.js.

**MAP 16 BELLY OF THE BEAST (realm 20, Red's own design — THE FINALE):**
"???" realm-select reveal · the game's FIRST INTRO CINEMATIC (pirate ship,
"thats weird..." blurb verbatim, titan whale swallows the whole ship) · main
map = the whale's guts (16 mobs picked "use the rest" after vetoing 4; all 20
decor "all those decorations are in"; tiles 1 2 3 4 6 8 9) · DIGESTION TIDE
cycle · THE UVULA gag-trigger exit · outro cinematic (whale beaches + spits
you up) · SAND ARENA boss: THE TITAN WHALE — **STATIONARY boss/moving player**
(new fight shape), pose #2 HEAD-ON MAW + look #4 ORCA DRESS ("perfect" after
teeth-inside-the-maw fix), kit w/ SPRAY MORTARS / INHALE→CHOMP / FLIPPER SLAM
rings / GUT COUGH / P2 MAW ALIGHT / signature WATER GUN vent ×1.5 ("sounds
good") · theme HEAVE HO.EXE 8-BIT SEA SHANTY take 1 ("sounds good"): 120 BPM
swung, A dorian, call-and-answer, HEAVE...HO! ending. Suite:
test/m22_belly_verify.js.

**Close-out:** docs/TEN_MAPS_PLAN.md status → COMPLETE · this entry ·
MILESTONES M5.9 row · docs/NEXT_SESSION.md rewritten as the OPUS BUILD PROMPT
(registry refactor per game/js/maps/REGISTRY_SPEC.md FIRST, then the 16 maps
in lineup order; ALL-FENCES-DESTRUCTIBLE retrofit rides along). Memory:
[[belly-map-progress]] [[prehistoria-progress]] [[ten-maps-campaign]].

**Files (this close-out window):** game/js/maps/prehistoria/{PLAN.md,
BUILD_INSTRUCTIONS.md} + artdev/prehistoria mirror (29 files) ·
game/js/maps/belly/ full package (PLAN.md, BUILD_INSTRUCTIONS.md, 8 asset
PNGs/WAV, 9 render scripts) + artdev/belly mirror (17 files) · docs updates.

## 2026-07-15 · M5.7 BIOME 4 "THE ROBOTICS FACTORY" · full design + all assets (planning, no game code)

Design-and-assets session for the fourth realm. NO game code changed (?v= stays
m5g); all output is design docs + option-sheet PNGs + a theme WAV in artdev/factory/.
Followed Red's 13-note "Master List" workflow: front-load a plan doc + all the
option sheets, ask design questions, let Red pick, then lock the build.

**What landed (all Red's calls, via AskUserQuestion + live messages):**
- THEME: robotics factory (epic & grand); mobs are ROBOTS, not necessarily humanoid;
  the map must FEEL ALIVE while running (animated conveyors/arms/presses/fans/sparks).
- SIGNATURE MAP MECHANIC: IN-GROUND CONVEYOR TRAVELATORS (airport moving-walkway,
  flush to floor) — moving WITH the belt = speed burst, AGAINST = slowed.
- 12 MOB PICKS from a 20-candidate sheet (roles = the sheet labels): Sparkbot,
  Hive Drone, Arc Welder, Scrap Hulk, Buzzsaw, Mag-Crane, Forge Hound, Coolant Tank,
  Bulwark Drone, Repair Unit, Warframe, Purge Flamer (Flamer changed to a fire CIRCLE
  + circular ground telegraph, not a cone).
- TILING #1 riveted steel / #3 grated catwalk / #4 hazard, composed with the decor
  into one cohesive planned map (loading bay+spawn → assembly floor w/ belts → foundry
  wing → blast doors → boss arena). Decor placed as a scene, not scattered.
- BOSS "THE GRAND ENGINEER": phase-1 = mad scientist (engineer sheet #5 "The
  Overseer"); phase-2 = mech "PROTOTYPE 130C-4" (mech sheet #10). Rises on a floor
  lift; ladder-climb cutscene into the mech, which knocks the boarding platform aside
  and hunts you. Custom square arena "THE PROTOTYPE BAY" with 4 cover PILLARS, ceiling
  presses, wall turrets, conveyor cross. Kit is factory-themed + environment-driven AI;
  phase-2 REACTOR OVERLOAD self-destruct (run to center, beep/flash, room-wide blast —
  break line-of-sight behind a pillar to survive). Full kit in docs/FACTORY_BOSS.md.
- MUSIC "ASSEMBLY LINE": 8-bit techno/house, 126 BPM, A-minor, ~3:00 (WAV preview).

**Files created:** docs/MAP4_PLAN.md, docs/FACTORY_BOSS.md; artdev/factory/ (factory_
mob_options.png, factory_decor_options.png, factory_tile_options.png, factory_scene_
plan.png, factory_boss_engineer.png, factory_boss_mech.png, factory_bossroom.png,
factory_theme.wav, factory_kit.js + 7 render scripts). Memory: factory-map-plan.md.

**Next:** BUILD the realm (DATA.realms.factory + 12 mob rows + in-ground belt art &
conveyor speed logic + alive ambient anims + 2-phase boss + custom arena + floor-lift
entrance + ladder cutscene + port the theme into data.js) → then bestiary/scouter
text-fit + suites + bump ?v=. Awaiting Red's approval of the boss room + theme.

## 2026-07-15 · M5.6 WAVE CARD MOTION · top placement + slide on/off (?v=m5m)

Red: "i want the wave 5 to be closer to the top of the screen and it needs an
animation to come on and off screen." waveReveal cy moved H*0.34 → H*0.16 (up
near the top band, clear of the play area). Animation changed from pop-fade to a
SLIDE: parks off the left edge, sweeps in + settles with a Back.Out overshoot,
holds ~1.65s, then winds up (Back.In) and launches off the right while fading.
All pieces (fill, mask, outlines, shadow) move by the same relative delta each
frame so the bitmap mask stays glued to the fill mid-flight. Verified via a
40-frame GIF (slide-in → hold → slide-off). Boss(12) green. Files:
game/js/scenes.js (waveReveal), index.html (?v=m5m).

## 2026-07-15 · M5.6 WAVE CARD LEGIBILITY · dropped the bone fill (?v=m5l)

Red: "the numbers aren't legible" → "this doesn't look like a 2 and the 5 didn't
look like a 5" → "remove bone fill from all of it and it will be better." The
zombie-hand / bone-glint fill inside the glyphs was breaking up the digit shapes.
waveReveal now fills each letter with ONLY the green gradient (darkened a touch),
carried by a two-pass outline: a thick near-black HALO stroke behind the fill for
a crisp silhouette + the bright bone stroke on top for the undead edge. No hands,
no glints. Digits read cleanly at every wave (verified WAVE 2 and WAVE 5 renders).
Boss(12) green. Files: game/js/scenes.js (waveReveal), index.html (?v=m5l).

## 2026-07-15 · M5.6 WAVE CARD CLEANUP · glow + subtitle removed (?v=m5k)

Red on the wave card: "remove the green circle around the wave 5 and just keep
the letters" then "i dont want wave name" (the masked subtitle rendered garbled
— "RRITEE"). waveReveal now draws ONLY the block-letter title with the undead
scene fill (green gradient + zombie hands + bone glints), bone outline, and drop
shadow — no glow halo, no subtitle. Same function serves waves 1–5, so all five
render identically (just the "WAVE N" glyph changes). Verified fresh renders of
WAVE 2/3/4 clean. Boss(12) green. Files: game/js/scenes.js (waveReveal), index.html (?v=m5k).

## 2026-07-15 · M5.6 BOSS FEEL · coward Gravekeeper + early Reaper + wave card (?v=m5j)

Red boss-feel pass:
- COWARD MOVEMENT (gravekeeperSkulk, overrides updateBoss's chase): he no longer
  relentlessly chases — FLEES (fast, biased behind his minions) when you close
  in, HIDES toward his minion cluster at mid-range so bodies stay between you,
  and only ambles back if you drift far. Lets the chasing minions separate from
  him. Clamped in-bounds (he never wraps). DATA.bosses.gravekeeper.skulk knob.
- REAPER'S MARCH now rises AT FIGHT START (reaper.delayMs ~1.6s), not at 60% HP
  (Red saw it only near death). It climbs out of the CORNER farthest from you
  with a CAMERA REVEAL — the view pans to it, holds, then snaps back (stopFollow
  → pan → startFollow). Rises small→full (Back.Out) and can't kill mid-rise
  (reaper.rising guard). reaperAt on the unfreeze list.
- WAVE CARD (waveReveal) replaces the "WAVE 3 / 5" banner: a GTA-VI-logo-style
  title — "WAVE N" in big block letters with an UNDEAD SCENE masked inside the
  glyphs (green-dominant gradient + zombie hands clawing up: dark forearms +
  bright bone palms/fingers that read through the letter windows), bone outline,
  drop shadow, green glow, wave-name subtitle. Pops in (Back.Out) → holds →
  fades. Screen-space bitmap mask; scales/fades as one unit.
Graveyard smoke(15) + boss(12) green (boss test updated: reaper is fight-start
timed now; gravekeeperSkulk guards a bodyless boss mid-death).

---

## 2026-07-15 · M5.6 PLAYTEST · shooter density overhaul (?v=m5i)

Red: "way too many projectile mobs for the projectiles to move that fast" +
"shooters still pool at the edge / off map" + "make them slow chasers not just
shooters" + "one row of green proj, not three." Root causes found + fixed:
- THE FLOOD: the PACK LEADER champion affix (roleSkew:'caster') filters the
  director's pool to ONLY shooters while it lives — in the graveyard that's just
  the archer, so the map flooded with them. WORSE, the maxConcurrent over-cap
  redirect sent the pick back to pool[0], which IS the archer during that skew,
  so the cap never bit (stress test: 119 archers vs a cap of 3!). Fix: the
  over-cap fallback now pulls a NON-capped staple from the PRE-SKEW pool
  (poolFull) — the capped shooter can never redirect onto itself. Stress test
  now holds at exactly 3 archers out of 150 mobs.
- EDGE POOLING: archers were spd:0 TURRETS, so they sat wherever they spawned
  (often the off-screen ring / edge). Now spd:48 — the shooter verb keeps range
  + follows the player, so they roam with the swarm and WRAP instead of pooling.
  + a light chase.contactDmg 8 → a hybrid "slow chaser that shoots," not a pure
  turret (Red's suggestion). Verified it now moves toward a far player.
- CLUTTER: the 3-bolt fan → ONE aimed bolt (count 3→1), punchier (dmg 9→11,
  cd 1900→1600). With the 3-archer cap that's ≤3 bolts in the air, not ~9.
Regression: m47(yard) + grove(46) + graveyard smoke(15)/boss(12) all green
(director change is behind poolFull + a default-1 spawnWeight, so yard/grove
spawn behavior is unchanged except the now-correct over-cap fallback).

---

## 2026-07-15 · M5.6 PLAYTEST · fewer shooters (?v=m5h)

Red: "reduce the amount of shooter mobs by ~10%." The director picked UNIFORMLY
from the unlocked pool (no weights). Added a backward-compatible `spawnWeight`
(default 1) + WEIGHTED selection in RealmScene.directorSpend (a reusable knob to
dial any mob's frequency without cutting it). Set boneArcher.spawnWeight = 0.88
→ its share drops from ~12.6% to ~11.3% of spawns (~10% fewer archers). No other
mob has a weight, so yard/grove spawn mixes are byte-identical to before
(m47 + grove suites still green). Graveyard smoke(15) + boss(12) green.

---

## 2026-07-15 · M5.6 PLAYTEST FIXES · toroidal wrap + bolt damage (?v=m5g)

Red playtest: "mobs getting stuck off-screen accumulating around the edge" +
"if character goes off screen he should pop up on the other side" + "the green
ball projectiles aren't doing any damage."
- SCREEN WRAP (RealmScene.wrapGraveyard, called each frame from updateGraveyard):
  the graveyard is now TOROIDAL — the player, the swarm, and the reaper that walk
  off one edge reappear on the opposite side. Kills the edge pile-up entirely
  (nothing to stack against) and gives the "pop up on the other side" ask. Root
  cause of the drift/pile: NOTHING in the game sets collideWorldBounds, so
  entities always slid past the edge into the void (camera just clamped). The
  Gravekeeper is pinned to his arena (bossWave mobs + the boss don't wrap). Wrap
  is body-aware — body.reset(nx,ny) then restore velocity (a plain re-x snaps
  back). Verified: player right→left wrap, mob at x=-5 → x=2395, both clean.
- GREEN BOLTS: the archer's bolts DID damage (28 to a stationary player in a
  physics test) — but I'd over-nerfed them (projSpeed 250→225 + 28° fan) so a
  moving player never got clipped. Restored projSpeed to 300 (kept the wide 26°
  fan — slip between the three), so standing still is punished. A circle-strafing
  white-gear player now eats ~66 dmg / 7s from two archers (pressure, survivable).
Graveyard smoke(15) + boss(12) green (bossWave mobs correctly excluded from wrap).

---

## 2026-07-15 · M5.6 BALANCE · THE GRAVEYARD reachable + tuned (?v=m5f)

Red: "impossible to get to the boss." Built a PLAYER-SIM (test/m5_graveyard_
playersim.js — a white-gear bot that kites, dodges gas/graves/wail-cones, breaks
fences, grabs wisps) to diagnose. ROOT CAUSE was structural, not numbers: the
solid fences never opened, so the swarm + the player got walled into unreachable
pockets and the kill quota could never fill. Two fence bugs + the fixes:
- hitFence's once-guard lived on the POOLED shot sprite (shot._hitFence), so a
  recycled shot carrying a stale flag sailed through panels without damaging
  them → "fences sometimes not hittable" (Red). Moved the guard to shot.proj
  (fresh per fire). Player arrows now reliably smash fences.
- Mobs couldn't break fences at all. Added mobChewFence — a mob pressed against
  a panel gnaws it open (fence.chewDmg per fence.chewMs). The swarm never
  dead-ends; a boxed-in player is never safe for long.
- Symmetry (Red: "unavoidable damage"): ENEMY shots now die on fences too — an
  archer can't snipe you through a wall your own arrows can't cross.
Post-fix sim (white gear, lvl 1): 77 kills in 91s (~51/min → portal in ~3 min),
0 stuck-on-walls, 0 deaths; the only damage that landed on the perfect-dodger
bot was bone-archer bolts (contact/gas/hands/wail all kited to zero — a human
takes those). Number tune for "beatable in white gear but HARD":
- Banshee WAIL is now a TELEGRAPHED cast (windupMs cone LOCKS at cast start —
  step out; was an unavoidable auto-hit, Red) + bansheeWailCastFx ground cone.
- Bone Archer fan widened 12°→28° so you can slip BETWEEN the three green bolts
  (Red: "the green projectiles seem almost undodgeable"), + slower projSpeed.
- Softened chip damage across the roster (contact/gas/curse/hand dmg down),
  slower/rarer bell (55s, surge 1.2×), calmer graves. Fence hp 22 · chew 11/420ms.
- unfreeze() shifts the new banshee wailUntil + fence lastChewAt clocks.
Full battery green (m47 spot-check) + graveyard smoke(15) + boss(12).

---

## 2026-07-15 · M5.6 BUILD · THE GRAVEYARD — biome 3 SHIPPED (?v=m5e)

Built the entire locked design in one session (continuation). THE GRAVEYARD is
now the third live realm (console slot unlocked). Full battery green.

- ART (world_art.js + textures.js): ported the 8 mob models (Ghoul · Rattlebones
  · Bone Archer · Tomb Golem · Corpse Bloater · Banshee · Mummy · Necro Acolyte),
  THE GRAVEKEEPER boss (matches Red's concept art; bumped to ~2× the other bosses
  per Red), a GRIM REAPER, graveyard/path tiles, and 17 decor props — all from
  the approved render scripts via a `u=S/80` parity toolkit. Mob display sizes
  bumped for readability (Red). DESTRUCTIBLE FENCE damage frames (intact→bent→
  mangled) in BOTH a horizontal front-face and a VERTICAL top-view (Red: the
  vertical runs must read as the top of the fence, not a rotated face).
- DATA (data.js): DATA.realms.graveyard {kind, witching cfg} · biome roster ·
  8 mob rows with 6 NEW verb flags · bosses.gravekeeper {graveArrival, 5-wave
  immunity loop, reaper, Necronomicon verbs (radial=Bone Storm / stream=Soul
  Volley + explodeCorpse/graspingHands/curseSigils), 6 hints, title KEEPER OF
  THE HOLLOW EARTH} · dropTable · console slot (unlocked at ship).
- WORLD (scenes.js): setupGraveyard — planned S-path layout (south iron GATE
  spawn that AUTO-OPENS → lantern path → 4 fenced plots → arena open grave),
  SOLID destructible iron fences (Red: no doorways, smash through), green motes.
- THE WITCHING CYCLE (scenes.js): witching fog (conceal; lamps/candles/fungus
  burn holes) · restless graves (green warn → hands erupt dmg/grab + a mob claws
  out; hands credit) · soul wisps (drift to crypt; pickup buff; banshees EAT
  them) · the CURSED BELL (~45s: fog thickens, corpses rise, mobs surge, grave
  wave). Ambient stands down during arrival/boss; the bell becomes the boss's
  wave opener.
- MOB VERBS (entities.js): lunge (ghoul pounce-dash) · regen (golem heals unless
  hit) · deathGas (bloater cloud, scene) · wail (banshee cone+slow) · contactCurse
  (mummy DoT) · raise (acolyte resurrects corpses, capped) + bell surge.
- THE GRAVEKEEPER (scenes.js): grave-climb arrival → 5-wave immunity loop (IMMUNE
  while a wave walks → clear strips 20% max HP; hurtBoss bounces + 'IMMUNE' popup)
  → REAPER'S MARCH (edge spawn, slow walk, touch = instant death) → verbs. Boss
  bar greys while immune.
- MUSIC (data.js): "THE GRAVEYARD" ported from the approved v3 render to the chip
  section-composer — 6 voices (gallop bass · organ drone · 16th chug · frantic
  arp · bell tolls · soaring lead), D harmonic minor, 168bpm, 124 bars = 496
  beats (all tracks equal), ~2:57. + belltoll/reaperdrone SFX (rest reuse kit).
- TESTS: new test/m5_graveyard_smoke.js (15) + test/m5_graveyard_boss.js (12,
  deterministic — headless throttles real-time delayedCalls). Updated m3c/m47/
  grove bestiary counts (8 mobs + 3 bosses = 11 now the Gravekeeper is listed).
  Fixed a latent bestiary bug: boss pattern-notes said "undefined aimed bolts"
  for non-projectile verbs (hit grove/conductor too) → now "a telegraphed strike".
- unfreeze() shift list extended for every new clock (mob lunge/wail/regen/raise/
  surge · fog/grave/bell/wisp/gas · player curse · boss verb clocks). banner()
  now REPLACES the previous banner (Red: two boss banners overlapped in a shot).
- GIT: GitHub still at m3q — m4a THROUGH m5e now wait in one push.

---

## 2026-07-15 · M5.6 DESIGN · THE GRAVEYARD — biome 3 fully designed (no code yet)

Planning/design session (chat deliverables; build next session). Red drove
every pick through numbered sheets + question rounds — see docs/GRAVEYARD_PLAN.md
(the whole locked design lives there).

- THEME: graveyard / ghost zombies → realm name **THE GRAVEYARD**.
- ROSTER locked (8 of a 20-mob 160×160 sheet): Ghoul · Rattlebones · Bone
  Archer · Tomb Golem · Corpse Bloater · Banshee · Mummy · Necro Acolyte.
- DECOR locked (17 of a 20-sheet; cut stump/open-grave/bone-pile) + PLANNED
  scene layout PNG: south iron gate (AUTO-OPENS on approach) → lantern-lit
  winding path → four fenced plots (old graves / monuments / crypt+angel /
  celtic shrine) → boss arena. **Iron fences DESTRUCTIBLE** (Red).
- SIGNATURE SYSTEM — THE WITCHING CYCLE (Red picked all four candidates):
  witching fog (conceal, lamps burn holes) + restless graves (hand-erupt
  hazard/spawner) + soul wisps (pickup buffs, banshees eat them) + CURSED
  BELL conducting all of it every ~45s (corpses rise, eyes flare, graves wave).
- BOSS — **THE GRAVEKEEPER** (Red's concept art = canon; hi-fi sprite
  approved): climbs out of a grave; IMMUNE while a wave lives; 5 waves, each
  cleared = −20% max HP; REAPER'S MARCH one-shot walker at map edge (touch =
  death); Necronomicon verbs (Explode Corpse · Bone Storm · Grasping Hands ·
  Curse Sigils · Soul Volley filler).
- MUSIC: "THE GRAVEYARD" v3 approved direction — dark gothic METAL, epic +
  frantic, 168bpm D harmonic minor, 3:00 (v1 straight-metal + v2 slow-gothic
  rejected). WAV delivered; port to data.js composer at build.

Files touched: docs/GRAVEYARD_PLAN.md (new), docs/MILESTONES.md (M5.6 section),
docs/NEXT_SESSION.md (rewritten for the build session). No game code this
session — ?v= stays m5d.

## 2026-07-15 · M5.3–5.5 · Dev mode · level-is-cosmetic + mob scaling · COLLECTION (?v=m5d)

A run of user directives reshaping progression for testing + a collection loop.
FULL BATTERY GREEN (m2 · m3b · m3c · m4 · m4b · m46 · m47 + **m5_grove_verify 46**).

**DEV MODE (Settings toggle)** — one switch (menu.js) grants ALL GEAR + MAX
LEVEL + IMMORTALITY. `SAVE.settings().dev` (device-level); immortality reads
live in Entities.hurtPlayer + trainKill; `applyDevMode()` maxes the level and
fills the vault with the class ladder (also collects it). Vault bumped to **24
slots** (a full single-class ladder fits) and the vault UI now SCROLLS
(Up/Down + wheel).

**LEVEL IS COSMETIC (user)** — `DATA.xp.levelPower:false` → SIM.statsAtLevel
drops the level term, so a hero's base stats never grow with level; power is
GEAR + POTIONS only. Instead **MOBS SCALE WITH YOUR LEVEL**: HP · contact/shoot
damage · XP all ×`1+(lvl-1)*waves.mobLevelScale` at spawn (L60 ≈ ×2.77). Gear
still applies after the cap clamp, so it pushes totals past caps as before.

**COLLECTION (user)** — `account.collected` (survives death). A chest roll of
an already-owned item does NOT re-drop; it pays BONUS XP by rarity
(DATA.collection.dupeXp[tier]). NEW items are collected + the chest overlay is
now a SUMMARY (no manual take): gear AUTO-UPGRADES to the best owned piece per
slot, and REMAINS across death — a fresh hero auto-fills EMPTY slots from the
collection on realm entry (fill-empty only, so a manual downgrade for testing
is never yanked back up; a chest find upgrades). Off-class gear never
auto-equips. Vault equip/bank + dev-grant all mark items collected.

Files: data.js (xp.levelPower, waves.mobLevelScale, vault 24, collection.dupeXp),
save.js (dev setting, account.collected + migrate default), sim.js
(mobLevelMult, bestCollected, level-cosmetic statsAtLevel), entities.js (mob
level scaling on spawn/shoot, dev immortality), menu.js (Dev mode toggle),
scenes.js (collectItem/autoEquipFromCollection/resolveLootRolls, chest summary,
contact scaling, vault scroll, dev/immortality), index.html (?v=m5d). Tests:
m5 +10 checks; m3b loot flow rewritten for the collection summary + cap test
updated for level-cosmetic; m3c loot-count = items+dupes.

---

## 2026-07-15 · M5.2 · Muzzle fix + LEGENDARY CLASS KITS — the OP endgame chase (?v=m5c)

Live playtest stream from Red, all shipped + FULL BATTERY GREEN (m2 · m3b ·
m3c · m4 · m4b · m46 · m47 + **m5_grove_verify 38**):

**"What is sticking out the back of the archer?"** — the 64px hi-fi arrow
spawned at the BODY CENTER, so its gold fletching poked out of the hero's
back for each shot's first frames (auto-fire = a permanent tail feather).
All bow shots now fire from a MUZZLE point 20px along the aim.

**FULL-LEGENDARY SET AURA** (user): all four equipped slots T5 wraps the
hero in a class-colored body glow — archer GREEN · mage BLUE · knight RED
(cls.setGlow; the T5 weapon keeps its own orange burn). SIM.fullLegendSet
is the one gate for every set bonus.

**CLASS LEGENDARY KITS** (user: "intended to be very OP" — the set is a
sub-1%-per-slot chase):
- KNIGHT: the epic Ragefang (+ legendary Worldsplitter) sweeps a FULL 360°
  cleave (mod.arcDeg override through SIM.weaponMod → meleeSwing + the swing
  animation). FULL SET = UNLIMITED RAGE (whirlwind drain 0 — the only
  bypass of the 6/s floor).
- WIZARD: epic+ rods make the STORM BARRAGE HOMING MISSILES (proj.homing —
  updateProjectiles steers toward the nearest mob/boss, 7 rad/s). FULL SET
  fires the machine gun in ALL DIRECTIONS: 8-ball radial per trigger, one
  ball's MP cost, every ball homing.
- RANGER: epic+ bows give UNLIMITED ENERGY (pool pins full) and upgrade the
  BASIC ATTACK to the FIRE VOLLEY (burning fan on the weapon's own cadence,
  free). FULL SET: the fan tightens to a SHOTGUN (+4 arrows, 24°) and every
  arrow turns EXPLOSIVE (60px AoE, 0.6× arrow dmg) — overlapping blasts
  STACK by design (no shared-hit guard; the direct-hit target is excluded).

Files: sim.js (weaponMod arcDeg/homing/volleyShot/freeEnergy +
fullLegendSet), data.js (w4/w5 · ww4/ww5 · kw4/kw5 mods + descs, setGlow
colors), entities.js (muzzle, auto-volley, radial/homing barrage, unlimited
rage, set aura), scenes.js (meleeSwing arc override, arrowExplode),
index.html (?v=m5c), m5 suite (+8 checks: fit/glows/muzzle/kits/steering).

---

## 2026-07-15 · M5.1 · Playtest bugfixes: scouter overflow + LEGENDARY weapon glow (?v=m5b)

Red's first grove playtest report — two bugs, both fixed + verified:
- **Scouter readout overflow**: the Grovekeeper's SIX hints ran under the
  engage prompt and out of the panel. showScouter now sizes the TACTICAL
  READOUT adaptively (font steps 11→10→9→8 until the block clears cy+188),
  wrap width 402 (was spilling 10px past the right border), block starts
  below BOUNTY, engage prompt pinned at cy+206. Works for any hint count.
- **LEGENDARY GLOW** (user: "legendarys should give your weapons a glow"):
  an equipped T5 weapon gets a breathing orange additive aura riding the
  held sprite (Entities.updatePlayer — realm AND chamber; depth 10.8 under
  the weapon; hidden on death/unequip; alpha follows the i-frame blink).
m5_grove_verify grew to **30** (readout-fits + glow on/off); m47 spot-run
green (shared scouter code). Files: scenes.js, entities.js, index.html
(?v=m5b), test/m5_grove_verify.js.

---

## 2026-07-15 · M5.0 · THE GROVE SHIPS — second realm, 8 new mobs, phase-two boss, theme song (?v=m5a)

The whole grove, planned yesterday, built today in one rapid-fire session
(picks + 8 live reshapes mid-build). FULL BATTERY GREEN: m2 22 · m3b 27 ·
m3c (Grovekeeper retitle) · m4 18 · m4b 26 · m46 16 (burn-shift fixture
hardened vs slow-boot flake) · m47 18 · **NEW m5_grove_verify 28**.

**REALM ROUTING (DATA.realms):** the portal machine's map choice finally DOES
something — cfg.map picks biome/boss/world-kind/music. THE GROVE went live on
the console (sealed1 slot); the bestiary follows the selected destination.
No-map starts remain the train yard, so every old suite still routes.

**THE WORLD:** grovegrass/canopy tiles, the HEARTWOOD (192px great tree) at
the north clearing, pulsing glowshrooms, wandering fireflies, and the user's
14 decoration picks (of a numbered 20-option sheet: oak willow toadstool
fairy-ring pond boulders stump flowers lanterns arch runestone log spring
obelisk) hash-scattered evenly (mulberry-mix — no banding).

**FALLING ANCIENT TREES** (the grove's ambush trains): creak + flashing
shadow lane → the trunk slams (mobs mowed WITH credit, player hurt
survivable, shoved clear of the new wall) → the trunk stays as a static
collider ~8s → crumbles to leaves. Quiet while the boss lives.

**ROSTER (8 + 2 mini types):** Moonmoth fast/squishy · Puffcap slow → splits
into 10 minis in 4 cap recolors · Pixie Trickster blinks between pink orb
fans · BLOOM PIXIE (blue): glow trail that RESURRECTS corpses, death-bloom
raises everything in a radius, periodically summons a Bumblebrute ·
Moss Golem tank · Seedling Turret radial GOLD orbs · Snapdragon aimed PINK
fans · BUMBLEBRUTE: 0.5s SUMMON cast bar over his head → 4 ward bees (3
recolors) → IMMORTAL until they die ('IMMUNE' popups; environmental kills
ignore wards). Pixies/moth/bees FLAP (2-frame texture toggle). Colored shots
= neutral orbShot + data tint (and a latent pooled-tint leak fixed by
clearTint-on-fire).

**THE GROVEKEEPER (phase-two boss):** GROWS OUT OF THE GROUND when you enter
the boss portal (camera pan, dirt mound, sapling→full-size Back.Out, leaf
bursts). Verbs: TIMBER (his tree-fall — 200 fromBoss, trunk lingers) ·
THORN MORTAR (marked lobs + ticking brier patches) · OVERGROWTH (vine slow)
· SUNLANCE (sweeping gold beam) · SPORE SURGE (ring of 6 mini puffcaps).
Radial/stream stay as PETAL BURST / NEEDLE VOLLEY (tinted). Title: WARDEN OF
THE HEARTWOOD. **PHASE TWO:** first kill drops him to a grey husk — 8 REAL
pixie mobs fly in from the clearing edges and channel his revival for 3.5s;
every one killed cuts the restored HP (floor 30%); survivors turn hostile.
He rises enraged (spd ×1.15, pattern clocks ×0.85). The second kill drops
the chest. hurtBoss is a no-op mid-channel; updateBoss idles him.

**"HEARTWOOD"** — original 8-bit grove theme (user: magical + INSPIRING,
strictly 8-bit): 2 squares + 2 triangles, C major 96bpm, a section-composer
builds exactly 288 beats = 3:00/loop (intro → verse → lift → soaring chorus
→ music-box bridge → double final chorus). WAV preview delivered. New SFX:
creak/crash/chime/revive. Per-realm music routing (yard keeps Swarmfront).

Files: data/entities/scenes/textures/world_art + index.html (?v=m5a) +
test/m5_grove_verify.js + artdev renderers (mobs grid, decor grid, assets
sheet, music WAV). Gotchas honored: unfreeze shift list extended (5 verb
clocks + blink/cast/summon/glow/trunk/patch/corpse/revive), mechanic spawns
QUEUED (group.get-inside-iterate), cast bars cleared on every death path,
scene-reuse resets for both worlds' state, fromBoss on every verb.

---

## 2026-07-14 · M5 seed · THE GROVE map plan + 20-mob option grid (design only — no code)

New plan from Red: **the only remaining work is maps + themed mobs for those
maps.** First up: the Grovekeeper's grove. Direction locked via design
questions: **lush enchanted forest** tone (danger inside beauty) and
**FALLING ANCIENT TREES** as the signature map hazard (telegraph → lane crush
→ mow credit, trains-style, plus a twist: the trunk LINGERS as a wall ~8s).

**Landed (docs/art only):**
- `docs/GROVE_PLAN.md` — full map plan: 3 realm-name options, hazard spec +
  data sketch, ambient "living grove" animation pass, the 20-mob candidate
  table, and the GROVEKEEPER rework (Conductor treatment): HEARTWOOD WAKES
  arrival cinematic + verbs TIMBER CALL / THORN MORTAR / OVERGROWTH /
  SUNLANCE (+ optional SAPLING SURGE); old radial/stream kept as reflavored
  PETAL BURST / NEEDLE VOLLEY filler.
- `artdev/render_grove_mobs.js` + `artdev/grove_mob_options.png` — 20
  numbered grove mob candidates, 48px hi-fi style (ranger_art primitives,
  conductor-grid pattern). Red picks ≥8 by number or name.

**Waiting on Red:** mob picks, realm name (A/B/C), keep-or-cut the 5th boss
verb. No code, no ?v= bump, no test changes this entry.

Another rapid user-directive session, all shipped + green.

**PORTAL MACHINE map selector** (user: "map selecter dropdown + several ???
maps greyed out till we build more"): DATA.console.maps drives a real dropdown
in the machine UI — THE TRAIN YARD selectable, five greyed "??? — SEALED /
LOCKED" placeholders (only locked:false is pickable). consoleSetMap/
toggleMapDropdown (headless-callable); the choice rides in the portal cfg
(cfg.map) for when more realms go live; REALM CLEAR detail now shows the
selected map's name. Replaces the old sealed-realm rows.

**WIZARD out-of-combat regen** (user): the mage regens like the Ranger but on a
LONGER lull — cls.hpRegen { delayMs 5000, pctPerSec 0.03 } (Ranger stays 2500).
The dodge-regen aura now tints by class accent (Ranger green / Wizard blue).
Knight still has none (lifesteal is his tool).

**YARD MOB MECHANICS** (user directives, all TUNE ME):
- DYNAMITE MOLE — no longer a contact suicide. It SURFACES on-screen near you
  (director pickSurfacePoint for fuse mobs), holds still and FLASHES under a
  red blast-radius warning ring, then EXPLODES after a LONG fuse (3.8s — time
  to walk clear). SPARING: unlockAt 70 + maxConcurrent 2 (director cap). The
  blast catches the PLAYER **and** nearby MOBS; mob kills CREDIT the player
  (routed through Entities.hurtMob → mob-died). New BOOM sound + a FIREBALL VFX
  (core flash + orange body + shockwave ring + additive glow + flung embers) +
  a brief 150ms shake. Shoot it to defuse (normal kill/XP); ignore it and it
  blows (self uncredited).
- CONDUCTOR ZOMBIE — no longer a shooter; a SLOW chaser (spd 38) that drips a
  GREEN SLIME TRAIL. Patches are short-lived (~2.4s, fade + self-destruct via
  tween) and tick small damage on the player standing in them
  (RealmScene.dropSlime/updateSlime).
- SMOG SERPENT — no longer a shooter; a FOG CASTER. Pulses a smog cloud 5s ON /
  5s OFF; while ON, every mob in the cloud (itself included) is CONCEALED —
  the player's shots pass THROUGH them unless the player is standing inside the
  cloud (shot→mob overlap guard reads m.mob.concealed + playerInFog).
  RealmScene.updateFog owns the phase, the fog sprite (depth 7), the conceal
  flags, and the ghost-alpha paint.
- TRAIN MOWS now CREDIT the player too (kills/XP/quota) — the ambush train's
  trainCollisions routes through RealmScene.killMobCredited (was a silent wipe).

All new absolute clocks shifted in unfreeze() (mole fuseAt, zombie lastSlimeAt,
serpent fogPhaseAt, slime dieAt + tick clock). New mob decorations (mole warn
ring, serpent fog sprite) cleared on every death path via Entities.clearNameTag;
slime cleared with the swarm in annihilateSwarm.

Testing: FULL BATTERY GREEN — m2 · m3b · m3c (+MAP-dropdown checks: real
selectable / ??? locked / cfg carries the map) · m4 · m4b · m46_verify (16:
regen now Ranger+Wizard) · m47_verify (18: mole fuse+blast-credits-mobs,
zombie slime drop/tick/expire, serpent fog conceal + playerInFog). Screenshots
delivered: map dropdown, fog+slime, mole fuse ring, fireball (6 credited kills).

Files: data.js entities.js scenes.js index.html (?v=m4s) · test/m3c,m46,m47 ·
docs (this, MILESTONES, NEXT_SESSION).

---

## 2026-07-14 · M4.8 · Ranger DODGE REGEN + yard-mob readability pass (?v=m4r)

Quick follow-ups after the m4q ship (all user directives):
- **RANGER DODGE REGEN** (user: "add a regen so when I'm dodging effectively I'm
  regenerating"; "slow to medium speed"): the Ranger takes full damage (dmgTaken
  1x) and has no lifesteal — so NOT GETTING HIT is his heal. Stay untouched for
  hpRegen.delayMs (2500) and he heals hpRegen.pctPerSec (0.03 = 3% of MAX HP/s →
  ~33s empty→full, slow trickle that tops off chip damage but can't out-heal a
  beating). Any hit resets it (lastHitAt). RELATIVE window, no unfreeze shift
  needed. Ranger-only (gated on cls.hpRegen). WORLD CUE: a soft green aura +
  drifting '+' motes while st.regenning (Entities.updatePlayer sets the flag;
  RealmScene.updateRegenGlow draws it). data.js + entities.js + scenes.js.
- **YARD MOB SIZES** (user: Furnace Imp "increased in size so there more
  readable"; Crossing Creep "slightly"): new textures.js MOB_DISPLAY per-mob
  override (default 40) — Furnace Imp 58, Crossing Creep 47. mobModel now keeps
  the body a CONSTANT fraction of the 48px texture, so the world HITBOX scales
  WITH the sprite (bigger art = proportionally bigger, still-fair target).

Testing: m46_verify EXTENDED to 16 (regen blocked-in-delay / heals-after /
regenning flag / off-at-full · ranger-only · enlarged-mob scale+hitbox) — ALL
GREEN. Regression: m2 · m4 · m4b · m47_verify all GREEN (regen is gated so the
other two classes' updatePlayer is untouched; mob resize doesn't perturb the
conductor suite). Screenshots delivered: the green regen aura + a mob size
comparison.

Files: data.js entities.js scenes.js textures.js index.html (?v=m4r) ·
test/m46_verify.js · docs (this, MILESTONES, NEXT_SESSION).

---

## 2026-07-14 · M4.6+M4.7 · THE CONDUCTOR & THE LIVING YARD — six-tier class gear, fire volley/energy, XP 60-cap, boss + consists + 8-mob roster (?v=m4q)

The biggest content session yet — user directives arrived live all night and
all shipped. USER PLAYTEST VERDICT first: the pre-m4q build was "perfect" —
class models + train yard APPROVED (hi-fi arc closed); his balance feel-notes
became M4.6.

**M4.6 — GEAR + BALANCE (user's ladder + feel-notes):**
- SIX RARITY TIERS: grey ABUNDANT · white COMMON · green UNCOMMON · blue RARE ·
  purple EPIC · orange LEGENDARY ("very rare" — ~0.9%/roll boss tail). Labels
  lead with the rarity word; tier colors tint icons/rows everywhere.
- CLASS-LOCKED GEAR, 48 items: bows/quivers (Ranger) · staves/TOMES (Wizard —
  cut barrage MP/ball) · greatswords/WAR HORNS (Knight — cut whirlwind drain).
  NO off-class drops: SIM.resolveDrop remaps every rolled key to the roller's
  class line (same slot/tier/RNG stream). The vault can HOLD off-class gear
  (class-tagged, dimmed) but refuses to equip it. SIM.abilityFor generalized
  with floors (mpCost 4 · mpPerShot 0.5 · mpDrainPerSec 6).
- SAVE v4: item keys renumbered to match tiers (lossless remap in migrate());
  pre-lock off-class equipment REFLAVORS to the wearer's line.
- RANGER: FIRE VOLLEY — arrows ignite (ATT-scaled burn DoT, mobs AND boss, no
  knockback/no evolve on ticks, ember tint; burn clocks on the unfreeze list)
  + ENERGY resource (yellow orb via the RAGE plumbing, regen 4→10).
- WIZARD: barrage 2.5→1.25 MP/ball (spam runs twice as long).
- KNIGHT+WIZARD: dmgTaken { mob 1.3, boss 1.6 } — applied in hurtPlayer before
  DEF; every boss source (bolts/contact/verbs) tagged fromBoss.
- XP REWORK: cap 20→60, needed = 2000 + 25·L → ~ONE LEVEL PER MAP (cap ≈71
  maps); class growth ×19/59 (level-60 = old level-20 power).

**M4.7 — THE CONDUCTOR + TRAINS + MOBS (user directives + reference images):**
- THE CONDUCTOR: user picked #6 "GRIM LINE" from a 10-model grid
  (artdev/render_conductor.js — committed, regenerates anytime) + "stop watch
  double the size". Replaces Grovekeeper as the yard boss (treant data KEPT for
  a future grasslands map; realm.boss/biome are data picks now).
- ARRIVAL CINEMATIC: the Styx Express steams into the nearest lane (camera
  pans out to meet it; fresh ambush trains gated while it runs), brakes with a
  steam burst, HE STEPS OFF, the Express departs → scouter → fight.
- TRAIN VERBS (scene-owned; every absolute clock on the unfreeze shift list):
  GHOST TRACK + GHOST EXPRESS (spectral consist down a summoned track through
  your position — 200 dmg × boss mults = one-shots the ungeared, gear can
  survive; user spec) · RAILROAD TIES (marked-circle AoE lobs, first dead-on) ·
  THE SCHEDULE (pocket watch slows PLAYER MOVEMENT — st.slowUntil/slowMult,
  gold haze) · LANTERN SWEEP (rotating ghost-blue beam, tick damage in the arc).
- TRAIN CONSISTS: covered-hopper GRAIN CAR (GBRX ref) + sliding-door BOXCAR
  (L&N ref) — 1 model × 4 recolors each; ambush trains haul 2–15 mixed cars;
  the WHOLE consist kills/mows (per-segment collision); pass end waits for the
  tail; ghost trains reuse the models via a luminance→spectral remap.
- YARD MOB ROSTER (user sheet of 8, hi-fi 48px each): Coal Golem · Crossing
  Creep · Furnace Imp · Boxcar Brute · Coupling Chomper · Conductor Zombie ·
  DYNAMITE MOLE (new `detonate` flag: his contact hit is his death, no XP) ·
  Smog Serpent. New `trainyard` biome; bestiary now biome-scoped (+ all
  bosses); size-aware portraits (scouter + bestiary handle 128px art).

**Testing:** full battery GREEN — m2 22 · m3b 29 · m3c (PORTED back into the
battery: m4n records/hi-fi drift fixed) · m4 18 · m4b 26 — plus NEW
test/m46_verify.js (13: burn+unfreeze, energy, dmg mults live, class drops,
tome/horn mods in the channels, vault lock, labels) and test/m47_verify.js
(15: biome roster, detonate, consists kill per-car, arrival order, all four
verbs incl. a verified one-shot, clock shifts, boss-death cleanup). Suites
that reach the boss now waitForFunction(r.boss && r.scanning) — the arrival
takes ~3s.

Files: data.js sim.js entities.js scenes.js save.js textures.js world_art.js
index.html (?v=m4q) · test/m2,m3b,m3c + NEW m46_verify,m47_verify ·
NEW artdev/render_conductor.js · docs (this, MILESTONES, NEXT_SESSION, TESTING).
Screenshots delivered in chat: Styx arrival/step-off, full conductor fight,
yard swarm w/ yellow energy orb, loot overlay w/ LEGENDARY.

---

## 2026-07-14 · AUDIT · FULL m4a→m4o CODE AUDIT — 10 bugs fixed, knight cleave root-caused, hi-fi HUD, folder cleanup (?v=m4p)

Full audit of everything since the 07-12 audit (three parallel audit passes +
adversarial verification). **Complete findings: docs/AUDIT_2026-07-14.md.**
Fixed (all verified by a 15-check in-engine run + full battery m2 22 · m4 18 ·
m4b 26 GREEN): (1) USER-REPORTED knight cleave whiffs — hit test was
center-point-only, now target-size-aware (visible blade overlap = hit);
(2) level-ups no longer refill the Knight's RAGE (startsEmpty resources keep
their value); (3) unfreeze() now shifts ALL absolute clocks (train telegraph,
tornadoes, frost slows, splitter forks, boss patterns) — pausing used to eat
them, worst case launching the instakill train with zero telegraph the frame
the menu closed; (4) train frozen during hitstop (was advancing into a
movement-frozen player); (5) no new trains on the death screen (endless
shake/horn under YOU DIED); (6) pendingPortal no longer leaks across save
slots (cleared at the title = slot boundary); (7) corrupt saves can't brick
the title (migrate/valid wrapped — any throw = "corrupt" slot); (8) builder
PLAYTEST ▶ loads the actual map again (explicit mapId exempts the train-yard
hardwire); (9) hifiWorldOn() gates on _worldBuilt (art-module-absent fallback
actually falls back now); (10) portal-entry fade + resize no longer eats the
run config (pendingPortal consumed at Realm start, not walk-in). Design notes
(NOT changed, see report): hi-fi hurtbox is 2x classic BY DESIGN (matches the
2x sprite; balance knob = d.body), train kills award no XP (wipe pattern),
train ignores the boss.

**HI-FI HUD (user ask: bottom HUD "disconjointed").** NEXUS_ART gains
drawHudOrbFrame (riveted beveled ring housing, gold rivets, cyan dock pips) +
drawHudPlateMid (tileable conduit plate; the XP bar renders inside its dark
groove) + drawHudPlateCap (rounded dock, glowing power node, gold trim).
textures.js buildHudArt; RealmScene.buildHud creates frames/plate/caps
(classic fallback when art absent), updateHud docks them every frame
(RESIZE-safe); the bar's old bright-blue floating border dropped in hi-fi
(subdued steel dividers). One connected console in the chamber's language.

**CLEANUP.** All three art-test backup folders moved off the root into
`_to_delete/` (gitignored) — user empties at leisure.

Files: index.html (?v=m4p) · scenes.js · entities.js · textures.js ·
nexus_art.js · save.js · docs/AUDIT_2026-07-14.md (NEW) · docs.

## 2026-07-14 · M4.75 · HI-FI IS THE GAME NOW — art test promoted to default, ART TEST settings removed, Starweaver wizard + Dark Knight land (?v=m4n)

The art-test arc GRADUATED (user call): "keep the hi-fidelity maps, the 64
character model, the hi-fi monsters and boss… take out the settings and make
that default orientation."

**1. HI-FI HARDWIRED AS THE DEFAULT.** `hifiWorldOn()` / `hifiChamberOn()` now
return true, `selectedModelId()` returns '64' (textures.js); the
rangerModel/hifiWorld/hifiChamber settings keys are GONE from save.js defaults
(stale keys in old saved settings are ignored by the typed merge — no
migration needed). menu.js: the whole ART TEST section removed, KEYBINDS moved
up, panel back to h=548. Only the 64px Ranger model is built now (32/128/160
dropped — faster boot). The train-yard realm + ambush train is the normal game
(user confirmed keeping the instant-death train); classic art/map paths
survive as code fallbacks only (art module absent). Realm mapId path is
bypassed by the train yard.

**2. WIZARD + KNIGHT HI-FI MODELS — picked from design grids like the m4m
vault.** Rendered 10 forward-facing T-pose wizards + 10 knights (numbered PNG
grids, artdev render_class_models.js). User picked **wizard #3 "Starweaver"**
(deep-navy robe + gold stars, wide-brim hat — "some of the stars from his
chest on his hat also" → 2 cone stars + a tip star) and **knight #6 "Dark
Knight"** (gunmetal plate, breathing RED visor glow, outward spiked pauldrons,
stub horns, red chest emblem). NEW `game/js/class_art.js` (same put()/frame
contract as ranger_art): drawWizardBody/drawKnightBody idle+walk (star
twinkle; heavier knight gait) + drawStaffHi (star-crowned staff) + drawSwordHi
(red-gem greatsword). textures.js: CLASS_HI/classModelDesc/buildClassModels +
**playerModel(cls)** — THE class-model lookup. entities.applyModelSkin
generalized to all classes (ranger keeps its arm/bow rig; wizard/knight get
heldKey weapons through the existing upright/melee carry math — p._rangerModel
now holds any class's model). Class-picker cards preview all three hi-fi
models (scenes.js).

**3. TESTS.** Full battery GREEN on m4n: m2 22 · m4 18 · m4b 26 (suites now
assert wizard64/staff64 + knight64/sword64 in the nexus). Fixed a REAL m2
brittleness the default flip exposed: step 16 compared live player stats
(WITH equipment) to a no-equipment recompute — the train-yard loot stream
legitimately dropped +4 DEF Leather Armor into the boss chest and broke it;
'before' now recomputes without equipment (apples-to-apples). In-engine
screenshots: picker/chamber/realm, zero console errors.

Files: index.html (?v=m4n + class_art.js script tag) · class_art.js (NEW) ·
textures.js · entities.js · scenes.js · menu.js · save.js · test/m2+m4+m4b ·
docs. NOT changed: data.js (no balance), world_art/nexus_art/ranger_art.

**m4o addendum (same session, live user feedback + reference image):** the
staff was overlapping the wizard's body. Lead arm re-baked STRETCHED OUT to
the side (hand at 0.305S) and the staff now stands at that hand — new
per-model `heldOffset` (world px, wizard=20) in CLASS_HI/classModelDesc, read
by updatePlayer's upright branch (classic carry math untouched). Staff shaft
slimmed (H*0.22 → H*0.14). m4 suite re-run GREEN; ?v=m4o.

## 2026-07-14 · ART TEST · HI-FI CHAMBER SHIPPED & POLISHED — split toggles, combined records, keypad vault (?v=m4j → m4m)

Second day of the reversible hi-fi art arc: the PORTAL CHAMBER remake landed, then
was polished through rapid screenshot-driven user feedback. Everything gated on a
new independent toggle; classic chamber untouched when OFF.

**1. HI-FI PORTAL CHAMBER (m4j).** NEW `nexus_art.js` (reuses ranger_art
primitives): arcane floor/wall tiles, the beveled PLATFORM ring, the PORTAL as an
arched stone DOOR with a separate spinning swirl DISC, console/bestiary terminals,
lever, conduit, records wall screen, vault. textures.js `buildHiFiChamber()` +
NEXUS_HI map + `nexusKey/nexusScale` (r = classicPx/hiPx keeps on-screen size
identical). `chamberAmbient()` keeps ring lights breathing / well pulsing /
conduit pulses flowing continuously; `powerUp()` takes over while a portal is
live. Portal is shared with the realm boss-exit → hi-fi if EITHER toggle is on.
**The single Hi-Fi toggle SPLIT into two (user call): "Hi-Fi: World [ ] Chamber
[ ]"** — settings gain `hifiChamber` next to `hifiWorld`, both default OFF.

**2. Chamber polish round (m4k → m4l, user screenshots driving).**
- Platform proportions redrawn to match the classic (big open well, clean donut
  ring, 8 sockets) after "you got the proportions all wrong".
- Conduit: tried a wire-bundle + sparks look (user ask), user verdict "that
  wiring looks terrible" → REVERTED to the light strip. Sparks code removed.
- Station labels (VAULT/BESTIARY/PORTAL MACHINE) were hiding behind the taller
  hi-fi sprites → depths raised to 7.
- **RECORDS COMBINED (user ask): one always-visible wall readout** — `CLASS LV ·
  KILLS · DEATHS · BEST LV · REALMS · CLOSED · LAST: <killer>` on a single line;
  the count-up animation still plays on realm exit, so you watch the numbers
  climb when you leave a map. Found & fixed a real bug here: the four
  "lean toward you" setScale calls hard-coded classic scale 3 and overrode the
  hi-fi nexusScale — the wall screen rendered 2× too wide. All four now wrap
  `TEX.nexusScale(...)`.

**3. VAULT ICON → KEYPAD WALL-SAFE (m4m).** User reviewed numbered PNG grids
(10 wood/metal chests, then 10 metal chests, then 10 metal VAULTS) and picked
"vault 5": gunmetal frame + iron inset door + 3×4 keypad + green status LED +
steel lever handle. `drawChest()` rewritten; same chestHi key, no scene changes.
Option-grid render scripts kept in the container's artdev for future rounds.

**Reversibility:** backup `_portal_room_backup_20260714_162357/` (gitignored);
both toggles OFF = classic byte-for-byte; full detail in root ART_TEST_CHANGES.md.
**Verified:** m2 22 · m4 18 · m4b 26 ALL GREEN at every step; in-engine
screenshots (door portal + disc on the animated platform, combined readout on the
correctly-sized glass, keypad safe on the wall) — zero console errors.
**Gotcha logged:** ad-hoc Playwright with `--use-gl` flags hangs Phaser on Nexus
load — launch plain (like the suites). Also index.html itself browser-caches:
hard-refresh (Ctrl+Shift+R) after any ?v bump.
**Files:** nexus_art.js (new), textures.js, scenes.js, menu.js, save.js,
index.html (?v m4i→m4m across the arc), ART_TEST_CHANGES.md, project memory.

---

## 2026-07-13 · ART TEST · REVERSIBLE HI-FI ART ARC — ranger models, train yard, archer hold (?v=m4d → m4i)

User directive opening the arc: **nothing may be lost, everything logged, all of
it easily REVERSIBLE.** Architecture honored everywhere: every feature default-
OFF behind Settings → ART TEST; classic art byte-for-byte identical when off;
timestamped gitignored backups; root `ART_TEST_CHANGES.md` as the dedicated log.

**1. RANGER MODEL PICKER (m4e).** "Ranger model [16·orig] [32] [64] [128] [160]"
in Settings. NEW `ranger_art.js`: procedural, faithful redraws of the green-hooded
archer at each canvas size — idle + walk frames + matching bow & arrow — same
`put(x,y,color)` code renders offline (PNG previews) and in-engine. '16' stays
the untouched default; picker persists per save (`rangerModel:'16'`).

**2. HI-FI WORLD — THE TRAIN YARD (m4f).** "A test of how beautiful cool and fun
of a map u can make" (user). NEW `world_art.js`: gravel/wall tilesets, tracks,
tunnels, hi-fi remakes of ALL FOUR MOBS + the Grovekeeper boss (hitboxes
preserved), and THE TRAIN — a telegraphed AMBUSH (idle→warn→run state machine)
that randomly comes flying through, dodgeable but fair, INSTANT DEATH on contact,
mows mobs down too. Character rendered ~2× bigger (RANGER_TARGET=64).

**3. ARCHER HOLD ITERATIONS (m4g → m4i, user art direction).** Arms added to all
hi-res models → redrawn T-pose so the hand meets the bow → separate LEAD-ARM
sprite jointed at the SHOULDER (not the head), slimmed → final geometry: the arm
ROTATES to the aim like a radius and the bow stays TANGENT to the circle around
the character (limbs ⊥ arm, belly outward) — aim up, bow horizontal; aim right,
bow vertical. Baked arm removed from the body art.

**Verified:** m2/m4/m4b green at every bump; per-model in-engine screenshots +
aim-hold poses at 5 angles delivered for sign-off.
**Backups:** `_art_test_backup_20260713_152543/`, `_map_train_backup_20260713_161251/`.
**Files:** ranger_art.js (new), world_art.js (new), textures.js, entities.js,
scenes.js, menu.js, save.js, index.html (?v m4d→m4i), ART_TEST_CHANGES.md (new).

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
