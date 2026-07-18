#!/usr/bin/env python3
"""CS2 — THE REBOOT (~25s). After the Titan Whale falls: light floods
backward, the pods warm, humanity relinks. Beats verbatim STORY.md §8."""
from PIL import Image, ImageDraw
from cutscene_kit import (W, H, Reel, canvas, vgrad, text, center_text,
                          scanline_bars, skip_hint, server_hall, draw_pod,
                          dither_rect, BG, WHITE, CYAN, CYAN_D, RED, GOLD,
                          AMBER, GREY, GREY_D, GREY_DD, SKIN)

WINE   = (58, 24, 34)    # 3a1822 belly flesh
WINE_D = (38, 14, 22)    # 260e16
SAND   = (196, 168, 100) # c4a864 arena sand

# ---------------------------------------------------------------- shot 2.1
def core_quiet(v):
    img = canvas(WINE_D)
    d = ImageDraw.Draw(img)
    vgrad(img, 0, 90, (30, 10, 18), WINE_D)
    # rib-vault curves
    for i, rx in enumerate((30, 90, 150, 210)):
        d.arc([rx - 34, 18, rx + 34, 150], 200, 340, fill=WINE)
    # gold sand floor
    d.rectangle([0, 128, W, H], fill=tuple(c // 2 for c in SAND))
    dither_rect(d, 0, 128, W, 134, SAND, step=2, phase=v)
    # faint settle motes
    for k, (mx, my) in enumerate(((40, 60), (120, 40), (190, 76), (80, 96))):
        if (v + k) % 2 == 0:
            d.point((mx, my), fill=(120, 80, 90))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 2.2
def wire_run(v, density=5):
    """Cable bundles across the dark; light pulses travel right-to-left."""
    img = canvas((6, 8, 12))
    d = ImageDraw.Draw(img)
    ys = (34, 58, 82, 106, 128)
    for yi, y in enumerate(ys[:density]):
        bow = 6 if yi % 2 else -4
        # cable: three strands
        for dy in (-1, 0, 1):
            d.line([(0, y + dy), (W // 2, y + bow + dy), (W, y + dy)],
                   fill=(28, 32, 42) if dy else (40, 46, 58))
        # pulses: move right→left with v
        for k in range(4):
            px = (W - ((v * 22 + k * 70 + yi * 30) % (W + 40))) + 20
            if 0 <= px <= W:
                t = px / W
                py = int(y + bow * (1 - abs(2 * t - 1)))
                d.ellipse([px - 2, py - 1, px + 2, py + 1], fill=CYAN)
                d.point((px - 3, py), fill=CYAN_D)
                d.point((px - 4, py), fill=(24, 60, 52))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 2.3
def hall_warming(v, frac):
    img = server_hall(v, warm=1.0, standing=False, cascade=frac, seed=5)
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 2.4
def pod_closeup(v, stage=0):
    """One pod, big. stage 0: still · 1: eyes move · 2: hand twitch ·
    3: breath fog."""
    img = canvas((10, 11, 15))
    d = ImageDraw.Draw(img)
    # pod shell fills most of frame
    d.rounded_rectangle([64, 16, 176, 148], radius=16, fill=(20, 23, 29),
                        outline=(56, 62, 74), width=2)
    # glass
    d.rounded_rectangle([74, 26, 166, 138], radius=12, fill=(14, 18, 24))
    # sleeping face (closed eyes), chest, arm
    fx, fy = 120, 56
    d.ellipse([fx - 14, fy - 16, fx + 14, fy + 14], fill=SKIN)       # head
    hair = (110, 80, 52)
    d.arc([fx - 14, fy - 18, fx + 14, fy + 10], 180, 360, fill=hair, width=4)
    # eyes: closed lines; stage 1 = pupils shift under lids (bump the line)
    if stage >= 1 and v % 2 == 0:
        d.line([(fx - 8, fy - 1), (fx - 3, fy)], fill=(150, 110, 80))
        d.line([(fx + 3, fy), (fx + 8, fy - 1)], fill=(150, 110, 80))
    else:
        d.line([(fx - 8, fy), (fx - 3, fy)], fill=(150, 110, 80))
        d.line([(fx + 3, fy), (fx + 8, fy)], fill=(150, 110, 80))
    d.line([(fx - 2, fy + 7), (fx + 2, fy + 7)], fill=(170, 120, 90))  # mouth
    # torso + folded hand
    d.rounded_rectangle([94, 84, 146, 138], radius=8, fill=(46, 52, 64))
    hx = 132 + (1 if (stage >= 2 and v % 2 == 0) else 0)               # twitch
    d.ellipse([hx - 5, 100, hx + 5, 110], fill=SKIN)
    # status strip warms
    on = AMBER if stage >= 1 else GREY_D
    for ly in range(30, 138, 10):
        d.point((70, ly), fill=on if (v + ly) % 2 == 0 else GREY_D)
    # breath fog on glass
    if stage >= 3 and v % 2 == 0:
        for gx in range(104, 138, 3):
            d.point((gx, fy + 22), fill=(90, 104, 116))
            if gx % 2 == 0:
                d.point((gx + 1, fy + 20), fill=(70, 82, 94))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 2.5
def relinked(r):
    blk = canvas(); scanline_bars(blk)
    r.add(blk, 500)
    lines = [("GLOBAL CONSCIOUSNESS ... RELINKED", CYAN),
             ("SLEEPERS: 8,204,551,300 ... ONLINE", CYAN)]
    base = lambda v: (lambda i: (scanline_bars(i), skip_hint(i), i)[2])(canvas())
    r.type_on(base, lines, seconds_after=2.2, y0=70, anim_ms=170,
              cursor=True)

# ---------------------------------------------------------------- assemble
def main():
    r = Reel()
    blk = canvas(); scanline_bars(blk)

    # 2.1 the core goes quiet
    r.fade(blk, core_quiet(0), steps=3, ms=120)
    r.type_on(core_quiet, ["THE CORE GOES QUIET."], seconds_after=1.0,
              y0=140, anim_ms=240)
    r.type_on(core_quiet, ["FOR THE FIRST TIME — NO SWARM."],
              seconds_after=1.4, y0=140, anim_ms=240)

    # 2.2 light floods backward
    r.fade(core_quiet(0), wire_run(0), steps=3, ms=110)
    v = 0
    def wr(vv):
        return wire_run(vv)
    # run pulses while text types (use many variants for motion)
    r.type_on(wr, ["LIGHT FLOODS BACKWARD — OUT OF THE BELLY,",
                   "UP THE GULLET, OUT ALONG",
                   "TEN THOUSAND WIRES."],
              seconds_after=1.6, y0=124, anim_ms=150, nvar=1000)

    # 2.3 the hall warms, rack by rack (no text — picture does it)
    r.fade(wire_run(3), hall_warming(0, 0.0), steps=3, ms=110)
    steps = 8
    for i in range(steps + 1):
        r.add(hall_warming(i, i / steps), 380 if i < steps else 900)

    # 2.4 one pod: eyes → twitch → breath
    r.fade(hall_warming(9, 1.0), pod_closeup(0, 0), steps=3, ms=110)
    for stage, secs in ((0, 1.0), (1, 1.6), (2, 1.6), (3, 2.2)):
        t = 0
        vv = 0
        while t < secs * 1000:
            r.add(pod_closeup(vv, stage), 320)
            t += 320
            vv += 1

    # 2.5 RELINKED
    relinked(r)
    path = r.save("/home/claude/cutscenes/assets/cs2_reboot_preview.gif")
    print("saved", path, len(r.frames), "frames")

if __name__ == "__main__":
    main()
