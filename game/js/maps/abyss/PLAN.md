# THE ABYSS — map plan (MAP 11 of the campaign)

> Realm 15. Every pick is Red's. Deep-sea trench at crush depth:
> bioluminescence against the dark, drowned things, and a giant
> electric serpent. Sheets + finals in `assets/` and `artdev/abyss/`.
> Numbers TUNE ME. LOCKED 2026-07-16 (boss skeleton "thats better",
> theme TAKE 2 "that it").

## 1 · Theme + name

**THE ABYSS** — the trench floor: wreck field and kelp forest lit by
glow-life, a destructible coral reef, hydrothermal vents, and DROP
chasms falling to nowhere. Palette anchors: abyss blue-black, pale
flesh, bio cyan/teal glow, violet, rust/brass (abyss_kit.js `A`).

- Realm id `abyss`, biome `abyss`, boss `voltWyrm`, music `abyss`.
- Toroidal wrap ON (kelp lanes N–S + rift line E–W run edge-to-edge).

## 2 · THE UNDERTOW — signature map cycle (LOCKED)

On a cycle the whole trench pulls ONE direction:
1. **WARN**: kelp bends, particles stream, low rumble (~2s).
2. **PULL**: ~8s strong current drags player AND mobs toward the
   nearest **DROP chasm** (pit). Mobs swept in die (env credit);
   player swept in = pit damage + eject (never insta-death).
3. **ANCHOR**: standing behind wrecks/rocks/**coral** blocks the pull.
4. Direction re-rolls each cycle. Suites park the cycle.
Fresh mechanic — no reuse. (Red explicitly rejected air management —
never pitch air/oxygen systems for this map.)

## 3 · DESTRUCTIBLE CORAL REEF — terrain system (LOCKED)

Coral walls (reef zone, east) block movement + shots and are
DESTRUCTIBLE by anyone's fire — including the boss's body, which
smashes straight through. **Deterioration ANIMATION required (Red):
4 damage states — pristine → cracked → crumbling → rubble stump — plus
shrapnel burst on break and staged regrow (reverse states, slow
timer).** Coral = the player's undertow anchors; cover economy
degrades over a fight.

## 4 · Roster (ELEVEN — Red picked 4 5 7 8 11 12 13 15 16 17 19; kits ✅)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Ghost Jelly** | drifter | slow drift, contact sting; tendrils trail a beat behind |
| **Swordfish** | lancer | thin lance-lane telegraph → high-speed charge through |
| **Volt Eel** | zoner | coils → expanding shock-ring telegraph → zap (boss's charge language) |
| **Vampire Squid** | escape artist | ranged pokes; when hurt, ink cloud (vision blot) + jet away |
| **Crimson Starfish** | latcher | warned hop-arc → latch (brief slow; break by kill/distance) |
| **Drowned Diver** | harpooner | aim-line → harpoon pulls YOU a step toward him |
| **Ghost Fisherman** | angler | casts glowing lure onto warned circle → yanks, dragging the hooked |
| **Trench Lobster** | charger | claws up → snip-charge lane; armored frontal, flank it |
| **Banded Sea Snake** | striker | S-coil → warned strike cone + venom slow |
| **Lantern Snail** | healer | slow glow, mends nearby mobs — priority target |
| **Kraken Spawn** | elite | anchored; telegraphed tentacle-slam lanes in sequence |

(Red pre-requested fishermen/lobster/snake/starfish/mermaid candidates;
the mermaid was offered and not picked — exact-list rule.)

## 5 · Decorations (Red: all but 15 16 17 18 19) + tiles (Red: 1 2 4 5 7 8 10)

Decor (15): **shipwreck hull · diving bell · giant anchor · treasure
chest · kelp stalks · brain coral · tube worms · black smoker · whale
fall · giant clam · sunken sub · cargo crates · ship cannon · anemone
bed · sunken lighthouse** (toppled, still lit — beam sweep FX). (Cut:
ghost net, colossus head, sonar beacon, amphora pile, mooring line.)

Tiles (7): #1 abyssal silt (BASE) · #2 trench basalt (N band) ·
#4 black sand (SE dunes) · #5 shell gravel (W flats) · #7 vent basalt
(SW field, ember seams) · #8 coral shelf (reef zone) · #10 THE DROP
(chasm void — pit tile; undertow targets + boss dive doors).

**PLANNED scene (assets/abyss_scene_plan.png — composed, toroidal):**
- **WRECK FIELD** (NW): hull, anchor, cannon+crates, sunken sub,
  kraken-guarded CHEST; **DIVING BELL = player spawn**.
- **KELP FOREST** lanes run N–S edge-to-edge (wrap reads).
- **WHALE FALL** ribcage (N-center) · **CORAL REEF** destructible zone
  (E, giant clam + anemones inside) · **VENT FIELD** (SW, volt-eel
  turf, tube worms) · **SUNKEN LIGHTHOUSE** (SW landmark) · **BLACK
  SAND DUNES** (SE) · **RIFT LINE** wraps E–W.
- **4 DROP chasms** scattered (undertow pulls, boss doors).
- **BOSS BASIN** (S-center): open silt arena around the big DROP.

## 6 · THE LEVIATHAN, "VOLT WYRM" (boss — skeleton + look LOCKED)

**Look (LOCKED — #6 VOLT WYRM on the approved take-3 skeleton,
assets/abyss_boss_final.png):** eastern water dragon (researched canon:
FF Leviathan/Ryujin) — ONE continuous serpent coil, spine-fin membrane
the full body length, antlered dragon head, mane frill, whisker
barbels, tail fluke — in charged yellow-green with electric arcs
crackling off the coil. lev160(put,S,o) parameterized in
render_abyss_leviathan_shape.js; final in render_abyss_boss_final.js.
ART LESSON: take-1 "humps in water" was rejected ("incredibly janky");
research canon refs before drawing mythic creatures.

**SCALE + MOVEMENT (Red, non-negotiable):**
- **BIG. Epic-big**: segmented body ~30+ tiles; head display ~150px
  (vs usual ~110). He should cross the whole screen.
- **Moves like a SNAKE**: serpentine lateral undulation per Red's
  reference diagram — head steers on a weaving sinusoid, segments
  follow-the-leader along the head's path so a traveling S-wave runs
  down the body. Never stiff, never a straight conga-line.
- **ANIMATION SET (required)**: undulation cycle · jaw open→SNAP ·
  spine-fin ripple head-to-tail · mane/whisker drift · charge-up glow
  pulse (scales brighten, arcs intensify) · coil-up telegraph ·
  dive/breach (into DROP chasms, trackable shadow under the floor) ·
  death thrash + fade.

**Body rules:** all segments = LIGHT contact hazard (brush damage);
the HEAD is the heavy hit. Body smashes coral (deterioration states).

**Kit (LOCKED — boss contract: telegraphed overlays, no spam):**
*Phase 1 — THE HUNT (100→50%):*
- **SNAP STRIKE** — coils into a ring (ring aims like an arrow) →
  head lunges down a warned lane → SNAP.
- **VOLT DISCHARGE** — charge glow crawls down the scales → expanding
  shock rings from 3 marked points along the body; slip the gaps.
- **TAIL WHIP** — warned arc sector behind him.
- **SIGNATURE — DEEP DIVE**: plunges into a DROP chasm → dark
  silhouette glides under the floor (trackable) → BREACHES under the
  player on a big warned circle → lands sprawled: **×1.5 vented**.
*Phase 2 — FULL CHARGE (<50%): scales glow constant, arcs crackle:*
- **LIVE WIRE** — telegraphed body-wide electrification ~3s: touching
  ANY segment shocks (undertow interplay — don't get swept into him).
- **CHAIN LIGHTNING** — warned arc-lines jump body → volt eels → on.
- **SERPENT'S UNDERTOW** — he circles the arena fast, generating his
  own inward pull toward the coil center + snap.
- **SIGNATURE — MAELSTROM BREACH**: three warned dive-breaches in
  sequence, the last erupting a full-arena expanding ring lattice →
  longest vent while he untangles.
≤6 scouter hints (drafted): body stings, the HEAD kills · the coil is
an arrow — he strikes where it points · when he glows, stand in the
ring gaps · track his shadow under the floor · anchored cover beats
the undertow — and his · after a breach he's beached, unload.
Every source fromBoss=true. NO radial/stream spam.

## 7 · Music + SFX

**"UNDER THE TRENCH"** (assets/abyss_theme.wav — **TAKE 2, RED-APPROVED
("that it")**; take 1 was liquid DnB, Red re-directed: **"disney
little mermaid vibe"** = Under-the-Sea CALYPSO): 120 BPM, 90 bars =
180.0s, C major (C–F–G–C / Am–F–C–G). NO SLOW INTRO — full groove +
steel-drum hook from bar 0. CHIPTUNE STEEL DRUMS (tri + attack pop +
octave shimmer, bouncy decay) on a syncopated hook → call-and-response
(steel calls, horn-section answers) → walking-bass feature + clave
percussion break + bubble FX → full reprise w/ harmony → half-time
LAGOON bridge (string pads, singing steel, shimmer glisses) → key-up
(+2) party finale w/ gliss flourishes → syncopated tag hits → THE big
gliss + splash out. Groove: kick 1+3, rim 2+4, 16th shakers, 3-2 son
clave, skank chords on every offbeat. Port via section-composer — KEEP
the steel-drum voice (attack pop + shimmer), offbeat skank, clave, the
lagoon bridge, and the key-up + gliss + splash ending.
New SFX: undertow rumble + current whoosh · coral crack/crumble/burst
(per damage state) + regrow chime · bubble columns · sonar-ish ping
(bell) · jelly zap · lance whoosh · shock ring hum · ink puff · starfish
latch squelch · harpoon thunk + reel · lure cast + line yank · lobster
snip · snake rattle-hiss · snail heal chime · kraken slam · boss: snap
jaws · charge crackle build · discharge pulse · dive splash + sub-floor
rumble + breach eruption · live-wire hum · chain-lightning arcs ·
maelstrom roar · beached-vent gasping.

## 8 · Build order (Opus)

1. art.js: 11 mob draws + THE VOLT WYRM (lev160 canon; SEGMENTED
   sprites: head / N body segments w/ fin + glow variants / tail
   fluke; all animation frames per §6) + 15 decor (lighthouse beam FX)
   + CORAL with 4 damage states + 7 tiles (port from assets/render/).
2. map.js: realm/biome/11 mob rows/boss/dropTable/console unlock +
   UNDER THE TRENCH composer + SFX + undertowCfg { cycleMs, warnMs,
   pullMs, force — ALL TUNE } + coralCfg { hp/state, regrowMs }.
3. scene.js: layout per scene PNG; UNDERTOW cycle (warn → pull toward
   nearest DROP → env-credit sweeps); coral reef placement + destruct/
   regrow; DROP pits; wrap everywhere.
4. Boss: segmented serpent entity (follow-the-leader path history +
   sinusoid head steering = traveling S-wave), scale per §6, P1/P2
   verbs, both signatures + vents, coral smashing, dive/breach with
   floor-shadow tracking.
5. Bestiary + scouter TEXT-FIT (≤6 hints); suite m17_abyss_verify.js
   (routing + wrap · undertow warn/pull/anchor/env-credit ·
   coral states + regrow + anchor behavior · DROP pit eject · 11 mob
   mechanics incl. diver/fisherman pulls, starfish latch release,
   squid ink, snail heal · boss: segment follow fidelity, S-wave
   presence, brush vs head damage split, all verbs + both signatures +
   vents, dive shadow, live-wire window) + FULL battery + ?v= bump.

## 9 · unfreeze() shift list preview (full list in BUILD_INSTRUCTIONS)

undertow.nextAt / warnUntil / pullUntil · coral[].regrowAt /
stateChangedAt · jelly (drift, no clock) · swordfish laneAt / chargeAt ·
eel coilAt / ring[].at · squid inkAt / jetAt · starfish hopAt /
latchUntil (PLAYER slow — release on hitstop/death!) · diver aimAt /
harpoonAt · fisherman castAt / yankAt · lobster chargeAt · snake
strikeAt / venomUntil · snail healAt · kraken slam[].at · boss:
nextVerbAt / coilAt / snapAt / discharge seq[].at / whipAt / dive
seq[].at / breachAt / ventedUntil / liveWireUntil / chain arc[].at /
circleAt / maelstrom seq[].at · every _zoneWarn.until. (Skip
Infinity-parked.)

## 10 · Status

**LOCKED 2026-07-16** — roster (11) + kits, decor (15), tiles (7),
UNDERTOW, destructible coral (4-state deterioration), VOLT WYRM
skeleton/look/scale/snake-movement/animation-set/kit, scene, theme
TAKE 2 "Under the Trench". Map 11 is build-ready.
