# Project 7 — Decision log & vertical slice spec

Status: decision-complete, pre-spike · Updated July 9, 2026 · Team: 2 devs + Claude

## Pitch & pillars

One line: a session-based social ARPG — WoW Mythic+ encounter DNA, five friends, one browser link.

Pillar 1: encounter feel (telegraphs, cast bars, interrupts, readable bosses).
Pillar 2: session-based social play in private friend lobbies.

Closest comparable: Fellowship (Chief Rebel, Early Access Oct 2025). Study it for 10 hours before the slice. Our differentiators are what they structurally can't do: solo-first viability, a no-healer five-stack, zero-install browser distribution, friends-only lobbies with no matchmaking population dependency.

## Locked decisions

**Perspective & camera:** top-down isometric, ~50°. Telegraph readability, low animation burden, tri-platform input all follow from this.

**Stack:** three.js + TypeScript. DOM/React HUD layered over the canvas (cast bars, cooldowns, party frames, chat — responsive via CSS, not in-engine UI). Node authoritative server over WebSocket (Colyseus is the leading candidate for lobby/rooms). One shared TypeScript simulation package imported by both client and server — fixed-tick, zero three.js imports, combat events as the only bridge. WebGL2 floor; WebGPU as later enhancement. Blender is the level editor (glTF export with custom properties). Fallback if the spike fails: Unity 6, pre-agreed, no relitigation.

**Art direction:** stylized low-poly, flat/gradient textures (Synty / KayKit / Quaternius lane), chunky silhouettes, deliberately quiet floors. VFX color grammar is the combat art direction and never breaks: orange = move out, blue = interruptible cast, purple = unavoidable, use a defensive. Every mechanic gets a distinct windup silhouette + 0.9–1.5s telegraph + audio pre-cue.

**Audio:** WebAudio (or Howler) first; FMOD's HTML5 build is available later if middleware earns its keep. Priority: interrupt punch > ability impacts > telegraph pre-cues > boss vocalizations > music > ambience. The interrupt sound is the game's signature sound.

**Party model:** 5 players max, no healer, no trinity. Lobbies are private, joined by link, locked at dungeon start. No matchmaking, no in-game voice (Discord exists). Reconnect is NOT drop-in and IS in scope: reserved slots, character goes passive on disconnect, same player resumes cleanly.

**Death rules:** die and you stay dead until the team downs the boss, then revive. Full wipe resets the dungeon. Dead players become shot-callers: free ghost camera, boss cast-bar visibility, text chat, ping wheel.

**Input (5 abilities + dodge + target action, identical kit everywhere):**
- PC: keys 1–5, Tab to cycle target, click to target, Space to dodge, WASD.
- Mobile: left-thumb virtual stick; right thumb: five-button ability arc + dodge; tap to target. (Diablo Immortal layout precedent.)
- Controller: left stick move, face buttons + one bumper for abilities, other bumper cycles target, trigger dodges.

**Combat model:** tab/tap/soft-lock targeting, server-authoritative, cast times and grace windows designed assuming ~100ms RTT. All timing values live in data and are adjustable live via the tuning panel.

**Classes:** 3 at 1.0. Three-tool contract per class: interrupt / dodge / sustain. With no healer, sustain is load-bearing — it is each player's health economy.

**Content destination (1.0):** 3 classes, 6 dungeons, 8 bosses. This is the destination, not the next step.

**Data-driven, confirmed:** abilities and encounters as data (JSON/flat files) from day one — the 8-boss grid justifies it. Tuning tools (sliders over existing data, live-applied, git-exportable) from day one. Authoring tools (visual editors) locked until the second boss defines what they need to be.

**Telemetry from day one:** deaths per mechanic, interrupt success rate, time-to-kill, win rate by number of players dead entering the boss (death-spiral watch).

**Budget posture:** $50k total. Pre-slice spend ≤ ~$2k (asset packs, a 2024 mid-range test phone, domain/server). ≥50% held in reserve until the slice passes its bar.

## Explicitly parked (with un-park triggers)

- Netcode implementation → M2. (Architecture seam is day-zero; only the wire waits.)
- Drop-in mid-run join → rejected. Locked lobbies only.
- Loot / meta-progression → after M2 retention data on the wipe-and-revive model.
- Affix/modifier system → after Episode 1.
- Theme, world, story → post-slice. The slice is graybox + juice on purpose.
- Matchmaking, in-game voice → not planned.
- Authoring/editor tools → second boss.

## Milestones

**M0 — Spike (timebox: 2–3 weeks of engineering; kill criteria below).**
Prove the web stack. Checklist:
- Test scene: 6 skinned glTF characters animating, ~40 projectiles/particle bursts, 10 live telegraph decals, DOM HUD overlaid.
- 60fps desktop; 50–60fps sustained on the 2024 mid-range phone, including a 20-minute thermal soak.
- Load under 10 seconds on cellular.
- Blender → glTF pipeline proven end-to-end, including one retargeted mocap animation onto a pack character.
- WebSocket round-trip of sim events between client and a Node process running the shared package.
- Lock the phone / background the tab for 10 seconds mid-scene → clean reconnect.
- Audio unlocks correctly on first user gesture (iOS requirement).
- One day comparing Babylon.js before committing.
Kill criteria: any item still red after one dedicated optimization week → switch to Unity 6.

**M1 — Vertical slice.** One class (Mage — highest stated skill ceiling), one boss with 3–4 mechanics that each stress one tool (interrupt / dodge / sustain), solo, graybox arena, full juice pass (hitstop, flash shader, camera impulse, damage numbers, the interrupt payoff moment: brief freeze + cast-bar shatter + stagger), DOM HUD, live tuning panel, telemetry wired.
Pre-registered pass/fail: at least 3 of 5 outside testers voluntarily re-pull the boss 3+ times, can name every mechanic afterward, and at least one asks when they can play it with friends. Fail → at most two design-iteration cycles, then revisit the concept honestly.

**M2 — Party proof.** Five players in a browser lobby via link, same boss. Reconnect flow live. Ghost/chat kit v1. Success looks like: a full group wipes and voluntarily retries 3+ times in one session, and an interrupt rotation emerges in their chat/voice without the game prompting it.

**M3 — Episode 1.** Two classes, one dungeon (trash + two bosses), death/revive loop end-to-end, spectator polish. Then the content treadmill toward 3/6/8.

## Two-dev split

Weeks 1–2, pair-build the combat core contract: fixed-tick sim loop, combat event enum (CastStarted, CastInterrupted, TelegraphSpawned, DamageDealt, UnitDied, ...), ability & encounter schema v0, damage/stat pipeline. This contract is the API between the two of you, the client/server seam, and the surface Claude works against.

Then split:
- **Dev A — simulation & systems:** ability runtime (cast/channel/cooldown/interrupt), targeting & status effects, boss behavior runtime, headless sim tests, later the Colyseus rooms/server.
- **Dev B — feel & content:** three.js scene/camera/controller, animation (AnimationMixer + thin code-driven state layer), VFX & telegraph shaders, DOM HUD + chat + tuning panel, WebAudio layer, graybox arenas, and sole ownership of asset-pack cohesion.

Seam rule: presentation subscribes to sim events and queries state; the sim imports nothing from presentation. Weekly ritual: one hour playing each other's halves wired together.

## Encounter design contract (no-healer edition)

- ~90%+ of boss damage is avoidable or mitigable; the unavoidable remainder is budgeted against class sustain economies, not a healer.
- Group coordination lives in interrupt rotations, soaks, and positioning — the interrupt order is the raid-lead conversation.
- Purple (unavoidable) now means "pop your personal defensive."
- Interrupt cast durations and grace windows are tuning-panel parameters; design assumes ~100ms RTT.
- Watch the death spiral from the first party test: if three-down is always a wipe, groups will reset early and the revive-on-kill moment never lands.

## Budget allocation (post-slice, priority order)

1. Boss/character animation contractor — windups and the interrupt stagger: ~$10–15k. Highest feel ROI in the project.
2. Custom hero + key boss models (packs cover environments/props): ~$6–10k.
3. Audio: signature SFX pass + composer once identity is audible: ~$4–6k.
4. VFX assist or packs: ~$1–2k.
5. Playtest incentives, community, servers: small.
Remainder is contingency. Nothing large moves before M1 passes.

## Risk register

1. Feel gap — juice is slice scope, not polish; animation contractor post-M1.
2. Mobile perf/thermals — spike gates it; on-device check weekly forever.
3. Netcode retrofit — neutralized by the isomorphic sim package; reconnect handled at M2.
4. Self-playtest overfit — monthly external testers (not all WoW vets) + telemetry.
5. Tooling seduction — tuning panel yes, authoring tools locked until boss 2.
6. Content treadmill — milestone ladder holds; 3/6/8 is a destination, not a promise.

## Still open (deliberately)

- Step zero, still outstanding: design boss 1 on paper and trace the Mage through it beat-by-beat. Free, and still the cheapest fun test in the plan. Do it before or alongside the spike.
- 5th-slot signature-vs-flex → let the paper trace answer it.
- Class 1 fantasy, kit names.
- Theme/setting → post-slice.

## Working with Claude

Mirror this doc's decisions into the repo's CLAUDE.md. The highest-leverage place to point Claude Code is the headless sim package: strict types + failing tests give it a verifiable contract to build against, and the tuning panel/HUD are clean, isolated web tasks it handles well.
