# THE GRAVEYARD — map plan (design LOCKED 2026-07-15, build next session)

> Biome 3. Every pick below was made by Red (numbered sheets + question rounds,
> same process as GROVE_PLAN.md). Art sheets + theme WAV were delivered in-chat;
> render scripts land in `artdev/` during the build. All numbers TUNE ME.

## 1 · Theme + name

**THE GRAVEYARD** — graveyard / ghost zombies. Danger with gothic dread:
moonlit plots, iron fences, green corpse-light. Castlevania spook, played
straight. Palette anchors: stone greys, dirt browns, bone cream, ecto/rune
green (`#78ff96` family), rune purple, burning-orange boss eyes.

Console wiring mirrors the grove: new `DATA.realms` entry
(`biome:'graveyard'`, `boss:'gravekeeper'`, `music:'graveyard'`); bestiary
follows consoleMap; no-map starts stay the yard.

## 2 · Roster (8, Red's picks from the 20-sheet)

| Mob | Role | Mechanic (proven tech) |
|---|---|---|
| **Ghoul** | fast lunger | telegraphed pounce-dash (boar-charge tech, short range) |
| **Rattlebones** | swarm filler | cheapest horde unit, spawns in numbers |
| **Bone Archer** | aimed shooter | near-stationary 3-round bone-bolt bursts (snapdragon aim tech) |
| **Tomb Golem** | regen tank | regenerates unless recently hit (moss-golem inversion) |
| **Corpse Bloater** | death burst | on death: poison gas cloud DoT (slime-patch one-shot) |
| **Banshee** | wail cone | ranged cone damage + brief slow; floats |
| **Mummy** | curse tank | contact applies curse DoT ~3s (burn tech re-aimed) |
| **Necro Acolyte** | corpse caster | resurrects nearby corpses as Rattlebones, capped (bloom-pixie tech) — priority kill |

Colored shots = orbShot + tint (green bone-bolts, cyan wail). Corpses matter
in this biome (Bloater gas · Acolyte raises · bell toll · boss Explode Corpse)
— the corpse pool from the grove is the backbone.

## 3 · Decorations (17 picks of 20 — Red cut #8 stump, #9 open grave, #14 bone pile)

Picks: headstone · cross grave · broken stone · CRYPT · iron gate · iron
fence · dead tree · coffin · angel statue · obelisk · sarcophagus · LAMP POST
· candles · celtic cross · dead wreath · cobweb · grave fungus.
(The boss arena's open grave is the entrance cinematic, not scatter decor.)

**PLANNED scene (no random scatter — layout PNG delivered in chat):**
- SPAWN at the **iron gate** (south) — **gate AUTO-OPENS as you approach** (Red).
- A winding lantern-lit path gate → boss arena; lamp posts at every bend.
- **Iron fences** divide the map into plots with doorway gaps — **fences are
  DESTRUCTIBLE** (Red): shots/mobs can smash panels (small HP, credit on mow).
- SW plot: THE OLD GRAVES — headstone/cross rows (grid, like a real cemetery).
- SE plot: MONUMENT GARDEN — obelisks, sarcophagus, coffin, candles.
- NW plot: THE CRYPT — mausoleum landmark + angel-statue plaza (bell lives here).
- NE plot: CELTIC SHRINE + glowing fungus glade.
- Dead trees on borders, cobwebs in two map corners, wreaths/candles as
  grave offerings. Fireflies → drifting MOTES; glow = green, not gold.

## 4 · THE WITCHING CYCLE — signature map system (Red picked ALL FOUR, bell conducts)

1. **WITCHING FOG** (ambient): glowing fog banks drift on a clock; mobs inside
   concealed to eye-glints (smog-serpent fog tech, map-owned). Lamp posts +
   candle clusters burn permanent clear holes — the lit path matters.
2. **RESTLESS GRAVES** (hazard): a plot cracks with green warn-glow →
   skeletal hands erupt (damage + ~0.5s grab-slow) and one roster mob claws
   out (spawn through queueSpawn!). Hands hit mobs too → killMobCredited.
3. **SOUL WISPS** (reward): kills release a soul that drifts toward the crypt;
   grab = small stacking buff (TUNE: haste/regen charge). A **Banshee** that
   touches one EATS it and gets stronger instead.
4. **THE CURSED BELL** (conductor, every ~45s): three tolls — fog thickens,
   ALL field corpses rise (acolyte tech), every mob's eyes flare + short speed
   surge, a wave of graves erupts. Corpse cleanup is a constant decision.

Ambient cycle gated during arrival/portal (grove precedent). During the boss
the ambient bell quiets and **the bell becomes HIS** — each toll opens a wave.

## 5 · THE GRAVEKEEPER (boss — Red's concept art is canon)

**Look (from concept art):** faceless deep hood + burning ORANGE eyes; tattered
dark-brown robes; purple+green glowing rune sashes; cross-body straps, belt
pouches, skeleton-key ring; iron lantern (green flame) in the off hand;
**the NECRONOMICON** held open — skull-faced cover with red eyes, green flame
pouring out, hanging chain. Hi-fi sprite approved in chat; port via
world_art.js + TEX.bossModel like conductor/grovekeeper.

**Entrance (Red):** CLIMBS OUT OF A GRAVE at the arena center — rumble,
headstone cracks, hand bursts from dirt, hauls himself out, lantern flares
green, book snaps open. (~3s, suites still waitForFunction(r.boss && r.scanning).)

**Core loop (Red's rules):** boss is **IMMUNE while a wave lives** (ward-guard
tech → 'IMMUNE' popup). **5 minion waves**; clearing a wave strips **20% of
his max HP**. Wave themes (TUNE): 1 Rattlebones swarm · 2 Ghouls+Archers ·
3 Bloaters+Banshees · 4 Golem+Mummies · 5 Acolytes + mixed. Env kills bypass
nothing here — the wave must die to unlock the chunk.

**REAPER'S MARCH (once per fight, Red):** a GRIM REAPER rises at the map edge
and walks VERY slowly at the player for the rest of the fight — **touch =
instant death** (fromBoss=true). The dread timer.

**Necronomicon verbs (while immune, scene-owned, clocks on unfreeze list):**
- **EXPLODE CORPSE** (Red) — detonates field corpses, chained AoE.
- **BONE STORM** — radial shard ring (radial reflavor).
- **GRASPING HANDS** — skeletal hands erupt from telegraphed circles
  (mortar/marked-circle tech).
- **CURSE SIGILS** — rune circles bloom then blast (brier-patch variant).
- Filler stream reflavor: **SOUL VOLLEY** (green tinted orbs).

Scouter: **≤6 hints** (adaptive readout limit). Every source passes
fromBoss=true. Title suggestion: KEEPER OF THE HOLLOW EARTH (Red may rename).

## 6 · Music + SFX

**"THE GRAVEYARD"** — locked v3 (delivered as WAV): dark gothic METAL, epic +
frantic. 168bpm, D harmonic minor, exactly ~3:00 loop. Layers: cathedral-organ
pads, gallop triangle bass + 16th chug squares, frantic harpsichord-style
arpeggios, bell tolls, soaring chorus lead; toll intro → verse → chorus →
bell breakdown → double climax → outro. Port to the data.js section-composer
(tracks must sum to EQUAL BEATS — assert by construction; verify with
artdev/render_music.js). Red rejected v1 (driving metal only) and v2 (slow
gothic) — v3 fusion approved direction.
New SFX: bell toll · grave-crack · hand-burst · wisp chime · reaper drone ·
corpse-blast.

## 7 · Build order (next session)

1. Mob art ×8 + Gravekeeper + reaper + decor set into world_art.js (G palette),
   `<name>Hi` in buildHiFiWorld, MOB_HI + MOB_DISPLAY sizes.
2. DATA.realms.graveyard + DATA.mobs rows + biomes.graveyard roster/unlockAt.
3. World: planned layout PLAN array (grove precedent) — gate/fences/plots/path;
   gate auto-open trigger; destructible fence bodies.
4. Witching Cycle: fog banks → restless graves → wisps → cursed bell (in that
   order, each testable alone).
5. Gravekeeper: entrance, 5-wave immunity loop, reaper, verbs.
6. Music port + SFX; bestiary entries (CHECK TEXT FIT — bestiary + scouter
   panels, ≤6 hints, no overflow).
7. test/m5_graveyard_verify.js (routing · all 8 mob mechanics · fog/grave/
   wisp/bell clocks through unfreeze · gate/fence · wave-immunity chunks ·
   reaper touch-death · entrance gate) + FULL battery + ?v= bump.

## 8 · Gotchas to carry (from grove/yard — will bite otherwise)

- ALL new absolute clocks on the **unfreeze() shift list**: fog bank drift,
  grave warn/erupt, bell nextTollAt/tollUntil, wisp despawn, reaper (if
  clocked), all verb clocks, wave-spawn timers.
- Mechanic spawns (grave mobs, bell risers, wave summons, corpse zombies) go
  through **RealmScene.queueSpawn** — never group.get inside an iterate.
- Suites: stand the AMBIENT cycle down first (bell/graves/fog nextAt =
  Infinity) or fixtures get crushed — grove lesson.
- initGravekeeper must NOT wipe fx mid-fight (wave re-arm flows through it).
- dismissScouter re-arms verb clocks. Boss title changes m3c-style suites.
- Per-mob decorations (fog eyes, cast bars, wisp glints) cleared in
  clearNameTag; scene pools cleared in annihilateSwarm.
- Env kills credit (killMobCredited): hands, fence collapses, corpse blasts.
- TINTS MULTIPLY — tint neutral greyscale only (orbShot).
