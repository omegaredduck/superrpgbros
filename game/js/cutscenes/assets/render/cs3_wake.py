#!/usr/bin/env python3
"""CS3 — THE WAKE / THE FORK (~30s). The system forks you; the body wakes in
the hall of opening eyes; THE ASSIMILATED installs; the new classes compile.
Beats verbatim STORY.md §8; unlock card per §9."""
from PIL import Image, ImageDraw
from cutscene_kit import (W, H, Reel, canvas, vgrad, text, text_w,
                          center_text, scanline_bars, skip_hint, server_hall,
                          chamber, hero, BG, WHITE, CYAN, CYAN_D, RED, GOLD,
                          AMBER, GREY, GREY_D, GREY_DD, SKIN)

# ---------------------------------------------------------------- shot 3.1/3.2
def wire_up(v, t, fork=0.0):
    """Vertical cable; bright mass climbs toward the standing body at top.
    t: 0..1 climb progress. fork: 0..1 split progress (two sparks)."""
    img = canvas((6, 8, 12))
    d = ImageDraw.Draw(img)
    # floor ledge at top with the body silhouette
    d.rectangle([0, 34, W, 36], fill=(26, 30, 38))
    hero(d, 116, 14, cls="ranger", facing="front")
    # cable down the center
    for dy in (-2, 0, 2):
        d.line([(120 + dy, 36), (120 + dy, H)], fill=(30, 34, 44)
               if dy else (44, 50, 62))
    # side branch cables
    d.line([(120, 120), (40, 150)], fill=(24, 28, 36))
    d.line([(120, 96), (204, 140)], fill=(24, 28, 36))
    if fork <= 0:
        y = int(150 - t * 108)
        d.ellipse([116, y - 4, 124, y + 4], fill=WHITE)
        d.ellipse([118, y - 2, 122, y + 2], fill=CYAN)
        for k in range(1, 4):
            d.point((120, y + 4 + k * 3), fill=CYAN_D)
    else:
        # two sparks: one up into the body, one falling back
        yu = int(42 - min(1.0, fork) * 0)
        yu = 46 - int(fork * 10)
        yd = 46 + int(fork * 70)
        d.ellipse([117, yu - 3, 123, yu + 3], fill=WHITE)
        d.ellipse([117, yd - 3, 123, yd + 3], fill=CYAN)
        d.point((120, yd + 5), fill=CYAN_D)
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 3.3
def hall_wake(v, eyes):
    img = server_hall(v, warm=1.0, standing=False, cascade=1.0,
                      eyes=eyes, seed=5)
    d = ImageDraw.Draw(img)
    # the hero, front, gasp pose, center aisle
    hero(d, 115, 85, cls="ranger", facing="front",
         pose="gasp" if v % 2 == 0 else "stand")
    scanline_bars(img); skip_hint(img)
    return img

# ---------------------------------------------------------------- shot 3.4
def chamber_still(v):
    img = chamber(v, show_hero=False)
    d = ImageDraw.Draw(img)
    # one light holding over the platform
    glow = CYAN if v % 2 == 0 else (60, 150, 128)
    d.ellipse([117, 84, 123, 90], fill=glow)
    d.point((120, 92), fill=CYAN_D)
    scanline_bars(img); skip_hint(img)
    return img

INSTALL = ["scan complete. threats purged: [ALL].",
           "installing resident protection...",
           "designation: THE ASSIMILATED", "status: ACTIVE. always watching."]

# ---------------------------------------------------------------- shot 3.5
def glyph_firewall(d, x, y):
    for r_ in range(3):
        for c_ in range(3):
            ox = (r_ % 2) * 3
            d.rectangle([x + c_ * 7 + ox - 2, y + r_ * 5,
                         x + c_ * 7 + ox + 3, y + r_ * 5 + 3],
                        fill=(216, 90, 50), outline=(120, 40, 20))

def glyph_quarantine(d, x, y):
    d.rectangle([x, y, x + 18, y + 14], outline=CYAN)
    for k in range(0, 19, 4):
        d.point((x + k, y)); d.point((x + k, y + 14))
    d.ellipse([x + 7, y + 5, x + 11, y + 9], fill=RED)

def glyph_purge(d, x, y):
    cx, cy = x + 9, y + 7
    for a in ((-6, -6), (6, -6), (-6, 6), (6, 6), (0, -8), (0, 8),
              (-8, 0), (8, 0)):
        d.line([(cx, cy), (cx + a[0], cy + a[1])], fill=GOLD)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=WHITE)

def unlock_card(v, reveal=3):
    img = canvas((8, 8, 6))
    d = ImageDraw.Draw(img)
    d.rectangle([10, 24, W - 10, 132], outline=GOLD)
    d.rectangle([12, 26, W - 12, 130], outline=(120, 96, 40))
    center_text(img, 34, "NEW CLASSES COMPILED", GOLD, 9)
    names = ["THE FIREWALL", "THE QUARANTINE", "THE PURGE"]
    xs = (36, 106, 176)
    for i in range(min(reveal, 3)):
        gx = xs[i]
        if i == 0:
            glyph_firewall(d, gx, 60)
        elif i == 1:
            glyph_quarantine(d, gx, 60)
        else:
            glyph_purge(d, gx, 60)
        # sparkle
        if v % 2 == 0:
            d.point((gx + 20, 58), fill=WHITE)
        text(img, (gx - (text_w(names[i], 7) - 20) // 2, 84), names[i],
             WHITE, 7)
    center_text(img, 112, "the machine remembers you.", CYAN, 8)
    scanline_bars(img)
    return img

# ---------------------------------------------------------------- assemble
def main():
    r = Reel()
    blk = canvas(); scanline_bars(blk)

    # 3.1 the climb home
    r.fade(blk, wire_up(0, 0.1), steps=3, ms=110)
    for i in range(7):
        r.add(wire_up(i, 0.1 + i * 0.09), 260)
    base31 = lambda v: wire_up(v, 0.72)
    r.type_on(base31, ["THE SYSTEM REACHES TO SEND YOU HOME.",
                       "BUT IT CAN'T CUT YOU CLEAN."],
              seconds_after=0.9, y0=128, anim_ms=210)

    # 3.2 the fork (white blink on the split)
    wf = canvas((235, 240, 244)); scanline_bars(wf)
    r.add(wf, 80)
    for i in range(6):
        r.add(wire_up(i, 1.0, fork=(i + 1) / 6), 240)
    base32 = lambda v: wire_up(v, 1.0, fork=1.0)
    r.type_on(base32, ["SO IT FORKS.", "THE BODY GETS YOU.",
                       ("THE MACHINE KEEPS YOU.", CYAN)],
              seconds_after=1.3, y0=118, anim_ms=230)

    # 3.3 the wake — eyes cascade open
    r.fade(base32(0), hall_wake(0, 0.0), steps=3, ms=120)
    for i in range(6):
        r.add(hall_wake(i, i / 5 * 0.9), 340)
    base33 = lambda v: hall_wake(v, 0.9)
    r.type_on(base33, ["YOU WAKE — IN A HALL WHERE EIGHT BILLION",
                       "PAIRS OF EYES OPEN AT ONCE."],
              seconds_after=1.8, y0=126, anim_ms=220)

    # 3.4 inside: the one light stays
    r.fade(base33(0), chamber_still(0), steps=3, ms=130)
    r.hold(chamber_still, 1.2, anim_ms=420)
    shown = []
    v = 0
    for li, s in enumerate(INSTALL):
        i = 0
        while i < len(s):
            i = min(len(s), i + 2)
            img = chamber_still(v); v += 1
            for k, ln in enumerate(shown + [s[:i]]):
                col = GOLD if ln.startswith("designation") else CYAN
                center_text(img, 108 + k * 11, ln, col, 8)
            r.add(img, 130)
        shown.append(s)
        img = chamber_still(v); v += 1
        for k, ln in enumerate(shown):
            col = GOLD if ln.startswith("designation") else CYAN
            center_text(img, 108 + k * 11, ln, col, 8)
        r.add(img, 480)

    # 3.5 unlock card
    r.fade(chamber_still(0), unlock_card(0, 0), steps=3, ms=120)
    for rev in (1, 2, 3):
        for i in range(3):
            r.add(unlock_card(i, rev), 300)
    for i in range(8):
        r.add(unlock_card(i, 3), 380)
    path = r.save("/home/claude/cutscenes/assets/cs3_wake_preview.gif")
    print("saved", path, len(r.frames), "frames")

if __name__ == "__main__":
    main()
