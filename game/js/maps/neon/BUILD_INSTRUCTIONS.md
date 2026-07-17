# NEON — BUILD INSTRUCTIONS (for the implementing AI)

*Read `game/js/maps/REGISTRY_SPEC.md` FIRST, then `PLAN.md` here. This
folder is the whole map — no core edits beyond the registry hooks.*

## Prerequisites
- MAPS registry built + battery green. Campaign rules in
  [[ten-maps-campaign]] + docs/TEN_MAPS_PLAN.md. Mood check: RAIN ON
  NEON — everything dark, wet, and glowing; the city is loud but the
  roofs are lonely. The boss is a cocky little genius, not a brute.

## THE PIVOT (read before building the boss)
Red changed the boss mid-design: **the Apache is NOT the fought
boss.** It CRASHES onto the helipad as the entrance cinematic and a
techno kid hacker — **SOCIAL ENGINEER** — steps off. KINGPIN.EXE
final art (assets/neon_boss_final.png) = the crashing aircraft/wreck.
The fought boss art = assets/neon_hacker_final.png.

## Deliverables
1. `map.js` — MAPS.register({ id:'neon', ... }). Realm 'neon', boss
   'socialEngineer', music 'neon', patrolCfg { periodMs ~60000 TUNE,
   warnMs generous, strikes alternate lanes|circles }, adWallCfg
   { count:3, states:4, hp }, droneCfg { count:3, respawnMs ~8000 }.
   NINE mob rows. Boss def mapOwned, NO radial/stream. Console 'neon'
   unlocked.
2. `art.js` — port picked draws from assets/render/:
   render_neon_mobs.js (#1 STREET PUNK · #3 SPY DRONE · #4 RIOT
   ENFORCER · #5 NETRUNNER · #9 TURRET POD · #10 CYBER RATS ·
   #14 CARGO LIFTER · #18 NEON VIPER · #19 EXO LOADER). BOSS:
   render_neon_hacker.js hacker() with FINAL params from
   render_neon_hacker_final.js (#6 FIREWALL: orange spikes, tech
   vest, amber goggles w/ BLOODSHOT-EYE lenses, cyberdeck, LED
   sneakers, **head ON shoulders, NO NECK** — the headGroup y-drop is
   canon) — plus a VENT frame (deck smoking, kid fanning it, drones
   down) and firewall-drone sprite (small quad w/ hex shield tint).
   APACHE (render_neon_heli_shape.js heli160) in 3 states: smoking
   fly-in, crash/skid, WRECK (slumped, fire glow, thrown blade — match
   the scene plan). 20 decor (fire escape railings = 3 break states +
   spark/scrap burst) + 8 tiles (render_neon_tiles.js take 2: 1 2 3 5
   7 8 9 10) + POP-UP AD wall (4 glitch-decay states) + patrol
   silhouette + searchlight cone. MOB_DISPLAY: punk ~40 · drone ~34 ·
   enforcer ~48 · netrunner ~42 · turret ~38 · rats ~26 · lifter ~56 ·
   viper ~44 · loader ~58 (TUNE). Boss ~110 (he's SMALL for a boss —
   kid-sized is the point; menace comes from the kit).
3. `scene.js` — layout per assets/neon_scene_plan.png: STREET CANYON
   W–E edge-to-edge (crossable ONLY at cable runs + painted
   crossings — routing suite must verify) · MIRROR PROMENADE N–S
   edge-to-edge · tagged quarter NW (punks/rats) · corp plaza NE
   (drones/turrets/enforcers) · ad floors (vipers) · old quarter SW ·
   cable runs (netrunners) · HELIPAD SE: skid scar + WRECK (solid
   cover, permanent scenery) + ad-wall spawn spots + loaders on
   approach. Toroidal wrap. Constant rain FX + puddle reflections
   (cheap: flipped neon smears, don't chase realism).
4. KINGPIN'S PATROL per PLAN §2: searchlight warn → telegraphed
   strafe lanes OR rocket circles (alternate, never both) → gone.
   Untargetable scenery-actor. Below 50% boss HP: passes target the
   arena as his backup — MUST NOT overlap SYSTEM BREACH resolution
   (sequence the clocks).
5. ENTRANCE cinematic (first pad approach): smoking fly-over →
   crash + screen shake → skid scar paints → door kicks open → kid
   hops out → title card SOCIAL ENGINEER → fight. Skippable after
   first view (campaign cinematic rule). Wreck persists as cover.
6. Boss per PLAN §6: FIREWALL bubble = boss takes ZERO damage while
   any shield drone lives (suite asserts); drones respawn ~8s; DDOS
   DARTS (3 slow homing bolts, dodgeable — cap turn rate) · POP-UP
   ADS (3 destructible walls, block PLAYER shots only — his darts
   pass through: readable asymmetry, hint covers it) · REMOTE ACCESS
   (2 hacked turrets, red glow, die with boss) · SYSTEM BREACH
   (grid-pattern glitch zones telegraph → trigger → overheat vent
   ×1.5, drones down during vent).
7. Music port ("NIGHT DRIVE.EXE", 87 bars @116 A-minor synthwave,
   TAKE 1 RED-APPROVED; verify vs assets/neon_theme.wav — keep bar-0
   full stack [NO intro], sidechain pump on pads, 16th arps, tri-lead
   bridge, octave-double chorus reprise, Am ring-out) + SFX PLAN §7.
8. Suite `test/m19_neon_verify.js` + full battery + ?v= bump + docs
   (MILESTONES, EVENT_LOG, bestiary TEXT-FIT ≤6 hints).

## unfreeze() shift list for THIS map
patrol nextPassAt / warnAt / strike[].at · punk swingAt · drone aimAt
/ fireAt · enforcer shoveAt / blockFacing (no clock) · netrunner
zone[].detonateAt · turret riseAt / lane seq[].at · rat wave spawnAt ·
lifter drop[].landAt / crate burstAt · viper dashAt /
trail[].expireAt · loader chargeAt / slamAt · adWall[].stateAt /
expireAt · firewallDrone[].respawnAt · cinematic step clocks (if
mid-crash on save — simplest: restart cinematic) · boss: nextVerbAt /
dart[].at / adsAt / hackAt / breachAt / breach zone[].at /
ventedUntil / backupPassAt · every _zoneWarn.until. (Skip
Infinity-parked.)

## Traps specific to this map
- FIREWALL GATE: zero-damage-while-shielded must be airtight — no
  DoT/pierce leaks; suite fires every player weapon type at the
  bubble and asserts 0. Drone respawn pauses during the vent window
  (or the window is pointless).
- BOSS IS TINY: hurtbox generous relative to sprite or the fight
  feels unfair; drones' orbit must not bodyblock the player's dodge
  space on the pad.
- AD WALL ASYMMETRY (his shots pass, yours don't) is intentional but
  MUST be hinted (scouter) and visually sold (panels face the player,
  darts phase through with a glitch ripple).
- PATROL + BOSS BACKUP: one clock, two consumers — the arena-target
  passes REPLACE the roof passes below 50%, they don't stack. Never
  schedule a backup strike while SYSTEM BREACH zones are live.
- VIPER LIGHT TRAILS: hazard lifetime short (TUNE ~1.5s) + capped
  total segments, or a viper pair tilepaints the map into a maze.
- LIFTER CRATES: children (punks) respect the global children cap;
  crate-spawned punks never drop loot (farm guard, sugar lesson).
- TURRET PODS (mob) vs REMOTE ACCESS turrets (boss-owned): same art,
  different owner — boss-owned get the red glow, die with him, and
  are fromBoss=true.
- CANYON ROUTING: the street is ROOF-LEVEL-BLOCKED (it's a drop) —
  crossable only at cable runs/crossings; wrap-aware both axes; suite
  walks all four wrap seams.
- Rain/reflection FX budget: constant rain is ambience, not load —
  cap particles; puddles are tile art (take-2 sheet), not dynamic.
- Cinematic skip flag persists per save (don't replay the crash every
  visit; wreck state is permanent once crashed).
