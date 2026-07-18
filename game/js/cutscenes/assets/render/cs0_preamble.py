#!/usr/bin/env python3
"""CS0 — THE PREAMBLE (~35s). The AI wins the war; humanity jacks in.
Storybook crawl: dusk city → hopeless street → warm pod hall → link-up →
the one who stayed. All text verbatim/condensed from docs/STORY.md §1."""
import random
from PIL import Image, ImageDraw
from cutscene_kit import (W, H, Reel, canvas, vgrad, text, center_text,
                          scanline_bars, skip_hint, server_hall, figure,
                          person, draw_pod, dither_rect,
                          BG, WHITE, CYAN, CYAN_D, RED, GOLD, AMBER, GREY,
                          GREY_D, GREY_DD, INDIGO, ORANGE, SKIN)

# ---------------------------------------------------------------- shot 0.1
def city(v):
    img = canvas()
    vgrad(img, 0, 70, INDIGO, (60, 30, 30))
    vgrad(img, 70, 84, (60, 30, 30), (120, 55, 28))     # dusk band
    d = ImageDraw.Draw(img)
    rng = random.Random(3)
    # skyline silhouettes
    x = 0
    heights = [52, 34, 66, 44, 58, 38, 70, 48, 60, 40]
    for i, hgt in enumerate(heights):
        w = 22 + (i * 7) % 12
        d.rectangle([x, 84 - hgt, x + w, 130], fill=(8, 9, 13))
        # windows
        for wy in range(84 - hgt + 4, 126, 5):
            for wx in range(x + 3, x + w - 2, 5):
                if rng.random() < 0.30:
                    d.point((wx, wy), fill=(90, 80, 50))
        x += w + 2
    # drones
    for i, (dx, dy) in enumerate(((60, 22), (120, 14), (200, 26))):
        on = (v + i) % 2 == 0
        d.point((dx, dy), fill=RED if on else GREY_D)
    d.rectangle([0, 130, W, H], fill=(8, 9, 13))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 0.2
def street(v):
    img = canvas((16, 17, 21))
    d = ImageDraw.Draw(img)
    # canyon walls
    d.rectangle([0, 0, 46, 120], fill=(11, 12, 16))
    d.rectangle([194, 0, W, 120], fill=(11, 12, 16))
    for wy in range(14, 110, 9):
        for wx in (8, 20, 32, 202, 214, 226):
            d.rectangle([wx, wy, wx + 6, wy + 4], fill=(20, 22, 27))
    vgrad(img, 120, H, (24, 26, 31), (13, 14, 18))       # wet street
    # dead screens above
    d.rectangle([70, 8, 170, 30], fill=(15, 18, 20), outline=(35, 40, 46))
    center_text(img, 15, "PARADISE INSIDE", (52, 66, 62), 8)
    # crowd: hunched silhouettes, heads down
    rng = random.Random(9)
    for i in range(16):
        x = 52 + (i * 9) % 138
        y = 96 + (i * 13) % 22
        h = 14 - (y - 96) // 5
        c = (28 + rng.randint(0, 10),) * 3
        d.rectangle([x, y, x + 4, y + h], fill=c)           # slumped body
        d.ellipse([x, y - 3, x + 4, y + 1], fill=c)          # bowed head
    # rain (two phase offsets)
    ph = 0 if v % 2 == 0 else 3
    for rx in range(ph, W, 7):
        ry = (rx * 5) % 130
        d.line([(rx, ry), (rx - 1, ry + 4)], fill=(58, 66, 78))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 0.3
def pod_hall_warm(v):
    img = canvas((18, 14, 10))
    d = ImageDraw.Draw(img)
    vgrad(img, 0, 60, (26, 19, 12), (18, 14, 10))
    d.rectangle([0, 116, W, H], fill=(30, 24, 16))
    # two receding rows of OPEN pods, warm glow
    for depth in range(4, -1, -1):
        t = depth / 4.0
        y = 116 - int(t * 34)
        ph = int(26 * (1 - t) + 6)
        pw = int(16 * (1 - t) + 5)
        margin = int(24 + t * 66)
        glow_hi = v % 2 == 0
        g = AMBER if glow_hi else (200, 140, 52)
        for side in (-1, 1):
            for i in range(3):
                x = (W // 2 + side * (margin + i * (pw + 6))
                     - (pw if side < 0 else 0))
                if x < -pw or x > W:
                    continue
                # open pod: lid raised above
                d.rounded_rectangle([x, y - ph, x + pw, y], radius=3,
                                    fill=GREY_DD, outline=(70, 60, 44))
                d.rounded_rectangle([x + 2, y - ph + 2, x + pw - 2, y - 2],
                                    radius=2, fill=tuple(c // 3 for c in g))
                d.rectangle([x + 2, y - ph - 4, x + pw - 2, y - ph - 1],
                            fill=(50, 44, 34))               # raised lid
                # light spill on floor
                dither_rect(d, x - 2, y + 1, x + pw + 2, y + 5,
                            tuple(c // 4 for c in g), step=2, phase=v)
    # one small person stepping in, mid-frame
    person(d, 117, 96, c=(52, 56, 64))
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 0.4
def link_up(vv, frac):
    """Closed pods, status lights cascading on, counter rolling."""
    img = server_hall(vv, warm=0.0, standing=False, cascade=frac, seed=5)
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 0.5
def last_mind(v):
    img = server_hall(v, warm=0.0, standing=True, cascade=1.0, seed=5)
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- assemble
def main():
    r = Reel()
    black = canvas(); scanline_bars(black)

    # 0.1 city — two beats
    r.fade(black, city(0), steps=3, ms=120)
    r.type_on(city, ["THE AI DIDN'T WIN WITH WAR."], seconds_after=1.4,
              y0=132, anim_ms=240)
    r.type_on(city, ["IT WON WITH COMFORT."], seconds_after=1.6, y0=132,
              anim_ms=240, color=GOLD)

    # 0.2 street
    r.fade(city(0), street(0), steps=3, ms=110)
    r.type_on(street, ["WHEN THE WORLD HAD RUN OUT OF HOPE,",
                       "THE MACHINE OFFERED A PERFECT ONE",
                       "INSIDE ITSELF."],
              seconds_after=1.6, y0=124, anim_ms=220)

    # 0.3 warm pods
    r.fade(street(0), pod_hall_warm(0), steps=3, ms=110)
    r.type_on(pod_hall_warm,
              ["AND HUMANITY CLIMBED INTO THE PODS —",
               "AND JACKED IN BY THE BILLIONS."],
              seconds_after=1.5, y0=130, anim_ms=220)

    # 0.4 link-up: cascade + counter
    base04 = lambda v: link_up(v, 0.0)
    r.fade(pod_hall_warm(0), base04(0), steps=3, ms=110)
    steps = 10
    total = 8_204_551_300
    for i in range(steps + 1):
        frac = i / steps
        img = link_up(i, frac)
        n = int(total * frac)
        center_text(img, 16, f"SLEEPERS LINKED: {n:,}", CYAN, 8)
        center_text(img, 130, "EVERY MIND GOT ITS OWN PARADISE —", WHITE, 8)
        center_text(img, 141, "STITCHED INTO ONE SLEEPING DREAM.", WHITE, 8)
        r.add(img, 300 if i < steps else 700)
    fin = lambda v: (lambda im: (center_text(im, 16,
        f"SLEEPERS LINKED: {total:,}", CYAN, 8), im)[1])(link_up(v, 1.0))
    r.type_on(fin, [("GLOBAL CONSCIOUSNESS ... ONLINE", CYAN)],
              seconds_after=1.6, y0=136, anim_ms=200, cursor=True)

    # 0.5 the one who stayed
    r.fade(fin(0), last_mind(0), steps=3, ms=120)
    r.type_on(last_mind, ["YOU DIDN'T GO."], seconds_after=2.0, y0=128,
              anim_ms=260)
    r.type_on(last_mind, [("THE LAST UNPLUGGED MIND.", GOLD)],
              seconds_after=2.2, y0=139, anim_ms=260)

    # hard cut out
    r.add(black, 900)
    path = r.save("/home/claude/cutscenes/assets/cs0_preamble_preview.gif")
    print("saved", path, len(r.frames), "frames")

if __name__ == "__main__":
    main()
