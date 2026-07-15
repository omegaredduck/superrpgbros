import numpy as np, math
from PIL import Image, ImageDraw, ImageFont
import mobkit as k
from mobkit import (P,R,disc,ell,shell,thick,limb,line,outline,canvas,
    BONE,ROT,GHOST,ECTO,STONE,STONE2,DIRT,MOSS,PURP,GOLD,WOOD,HOLE,WHITE,GRNEYE,REDEYE)

IRON=((28,30,40),(52,55,70),(92,96,116))
DWOOD=((40,30,22),(66,50,34),(96,76,52))

def moss_top(s,x0,x1,y):
    for xx in range(int(x0),int(x1),2):
        if (xx*5)%3==0: P(s,xx,y,MOSS[1]); P(s,xx+1,y-1,MOSS[0])

def slab(s,cx,w,ytop,ybot,ramp=STONE,round_top=True):
    for y in range(int(ytop),int(ybot)+1):
        ww=w
        if round_top and y<ytop+w:
            dy=ytop+w-y; ww=int((w*w-dy*dy)**0.5) if w*w-dy*dy>0 else 0
        R(s,cx-ww,y,cx+ww,y,ramp[1])
        R(s,cx-ww,y,cx-ww+2,y,ramp[2]); R(s,cx+ww-2,y,cx+ww,y,ramp[0])

def crackline(s,x0,y0,x1,y1,ramp=STONE2):
    line(s,x0,y0,x1,y1,ramp[0])

# ---------------- 1 HEADSTONE ----------------
def h1():
    s=canvas()
    R(s,26,66,54,71,DIRT[1])                    # earth base
    moss_top(s,28,52,66)
    slab(s,40,13,32,68)
    crackline(s,44,40,42,60)
    R(s,34,40,46,42,HOLE); R(s,35,46,45,48,HOLE); R(s,34,52,46,54,HOLE)  # RIP bars
    moss_top(s,29,51,34)
    outline(s); return s,(40,72,17,3,80)

# ---------------- 2 CROSS GRAVE ----------------
def h2():
    s=canvas()
    for yy in range(58,72):                     # mound
        w=int(6+(yy-58)*1.4); R(s,40-w,yy,40+w,yy,DIRT[1])
    moss_top(s,26,54,58)
    R(s,36,24,44,60,STONE[1])                   # vertical
    R(s,28,34,52,42,STONE[1])                   # arms
    R(s,36,24,38,60,STONE[2]); R(s,28,34,30,42,STONE[2])
    R(s,42,26,44,60,STONE[0])
    disc(s,40,33,2,STONE[2])                    # center boss
    moss_top(s,37,43,50)
    outline(s); return s,(40,72,16,3,80)

# ---------------- 3 BROKEN HEADSTONE ----------------
def h3():
    s=canvas()
    R(s,22,66,58,71,DIRT[1]); moss_top(s,24,56,66)
    # upright stub
    slab(s,32,10,50,68,STONE,round_top=False)
    line(s,26,54,40,50,STONE2[0])               # jagged break
    line(s,40,50,34,58,STONE2[0])
    # toppled piece lying
    for yy in range(60,68):
        R(s,44,yy,66,yy,STONE[1])
    R(s,44,60,66,62,STONE[2]); R(s,44,66,66,68,STONE[0])
    crackline(s,52,60,58,68)
    outline(s); return s,(40,73,20,3,80)

# ---------------- 4 CRYPT / MAUSOLEUM ----------------
def h4():
    s=canvas()
    R(s,16,64,64,71,STONE[0])                   # foundation
    R(s,18,34,62,66,STONE[1])                   # body
    R(s,18,34,20,66,STONE[2]); R(s,60,34,62,66,STONE[0])
    # pediment
    for i,yy in enumerate(range(22,34)):
        w=int((yy-22)*1.9)+4; R(s,40-w,yy,40+w,yy,STONE[1])
    R(s,40-4,22,40+4,24,STONE[2])
    # cross on top
    R(s,39,12,41,24,STONE2[2]); R(s,35,15,45,18,STONE2[2])
    # columns
    for cxx in (24,56):
        R(s,cxx-2,36,cxx+2,64,STONE[2]); R(s,cxx+1,36,cxx+2,64,STONE[0])
    # dark doorway
    for yy in range(44,66):
        w=6 if yy>48 else int((yy-44)*1.4)
        R(s,40-w,yy,40+w,yy,(18,16,24,255))
    P(s,44,56,GRNEYE); P(s,45,56,(90,200,120,255))  # eyes in dark
    moss_top(s,20,60,36)
    crackline(s,26,40,28,60); crackline(s,54,38,52,58)
    outline(s); return s,(40,73,26,3,90)

# ---------------- 5 IRON GATE ----------------
def h5():
    s=canvas()
    # stone pillars
    for cxx in (18,62):
        R(s,cxx-5,30,cxx+5,70,STONE[1]); R(s,cxx-5,30,cxx-3,70,STONE[2]); R(s,cxx+3,30,cxx+5,70,STONE[0])
        R(s,cxx-6,26,cxx+6,30,STONE[2])
        disc(s,cxx,22,4,STONE2[1])              # finial ball
    # iron arch
    for a in range(180,361,4):
        xx=40+int(22*math.cos(math.radians(a))); yy=30+int(14*math.sin(math.radians(a)))
        P(s,xx,yy,IRON[2]); P(s,xx,yy+1,IRON[1])
    # gate bars
    for bx in range(26,55,5):
        R(s,bx,32,bx+1,68,IRON[1]); P(s,bx,32,IRON[2])
        P(s,bx,30,IRON[2]); P(s,bx-1,30,IRON[2])   # spear tops
    R(s,24,46,56,48,IRON[1]); R(s,24,60,56,62,IRON[1])   # rails
    outline(s,(16,16,24,255)); return s,(40,73,28,3,90)

# ---------------- 6 IRON FENCE ----------------
def h6():
    s=canvas()
    for bx in range(16,66,7):                   # vertical bars w/ spear tops
        R(s,bx,40,bx+1,70,IRON[1]); P(s,bx,40,IRON[2])
        P(s,bx,36,IRON[2]); P(s,bx-1,38,IRON[2]); P(s,bx+1,38,IRON[2])  # spear
    R(s,14,46,66,48,IRON[1]); R(s,14,62,66,64,IRON[1])   # rails
    for bx in range(16,66,7): P(s,bx,47,IRON[2]); P(s,bx,63,IRON[2])
    R(s,16,68,66,71,DIRT[1]); moss_top(s,16,66,68)
    outline(s,(16,16,24,255)); return s,(40,72,26,2,70)

# ---------------- 7 DEAD TREE ----------------
def h7():
    s=canvas()
    for yy in range(64,72): R(s,26,yy,54,yy,DIRT[1])
    moss_top(s,28,52,64)
    thick(s,40,68,40,34,4,DWOOD[1])             # trunk
    thick(s,39,66,39,36,3,DWOOD[2])
    # roots
    thick(s,40,66,30,70,2,DWOOD[1]); thick(s,40,66,50,70,2,DWOOD[1])
    # gnarled branches
    for (bx,by,ex,ey) in [(40,44,24,30),(40,40,56,26),(40,36,44,18),(40,48,52,40),(40,50,28,44)]:
        thick(s,bx,by,ex,ey,2,DWOOD[1])
        # twigs
        thick(s,ex,ey,ex-4,ey-4,1,DWOOD[0]); thick(s,ex,ey,ex+4,ey-3,1,DWOOD[0])
    disc(s,40,40,3,DWOOD[0])                    # hollow knot
    outline(s); return s,(40,72,18,3,80)

# ---------------- 8 HOLLOW STUMP ----------------
def h8():
    s=canvas()
    for yy in range(64,72): R(s,24,yy,56,yy,DIRT[1])
    R(s,28,48,52,68,DWOOD[1])                   # stump
    R(s,28,48,30,68,DWOOD[2]); R(s,50,48,52,68,DWOOD[0])
    ell(s,40,48,12,4,DWOOD[0])                  # top rim
    ell(s,40,48,8,3,(24,18,14,255))             # hollow
    for rx in range(30,52,3): P(s,rx,50,DWOOD[0])   # rings
    thick(s,28,64,20,70,2,DWOOD[1]); thick(s,52,64,60,70,2,DWOOD[1])  # roots
    moss_top(s,28,52,48)
    # mushrooms
    for mx in (33,46): disc(s,mx,58,2.4,(180,60,60,255)); P(s,mx-1,57,(240,180,180,255)); R(s,mx-1,60,mx+1,63,BONE[2])
    outline(s); return s,(40,72,18,3,80)

# ---------------- 9 OPEN GRAVE ----------------
def h9():
    s=canvas()
    # dirt mound left
    for yy in range(58,72):
        w=int(4+(yy-58)*0.9); R(s,20-0,yy,20+w+6,yy,DIRT[1])
    for cx,cy in [(16,60),(26,58),(22,64)]: disc(s,cx,cy,2,DIRT[2])
    # pit
    R(s,30,52,64,70,DIRT[0])
    R(s,34,56,60,70,(16,12,12,255))             # dark hole
    R(s,34,56,60,58,DIRT[2])                    # near lip
    P(s,50,64,BONE[2]); P(s,52,66,BONE[1]); P(s,46,67,BONE[1])  # bones in pit
    # small headstone behind
    slab(s,54,7,40,54,STONE)
    R(s,50,44,58,46,HOLE)
    # shovel stuck in mound
    line(s,18,60,10,44,DWOOD[2],1); R(s,7,40,13,46,STONE[1]); R(s,7,40,13,41,STONE[2])
    outline(s); return s,(42,73,24,3,80)

# ---------------- 10 COFFIN ----------------
def h10():
    s=canvas()
    R(s,20,66,60,71,DIRT[1]); moss_top(s,22,58,66)
    # hexagonal coffin lying, foot->head
    pts=[(22,52),(30,40),(50,40),(58,52),(50,66),(30,66)]
    # fill
    for yy in range(40,67):
        # crude horizontal spans
        if yy<52: t=(yy-40)/12; xl=22+ (30-22)*(1-t)-8*(1-t);
        # simpler: draw body rect + angled ends
        pass
    R(s,26,44,54,64,DWOOD[1])
    for (ax,ay,bx,by) in [(26,44,22,52),(22,52,26,64),(54,44,58,52),(58,52,54,64)]:
        thick(s,ax,ay,bx,by,1,DWOOD[1])
    # fill ends
    for yy in range(44,65):
        R(s,22,yy,26,yy,DWOOD[1]); R(s,54,yy,58,yy,DWOOD[1])
    R(s,26,44,54,47,DWOOD[2])                   # lit top edge
    R(s,26,61,54,64,DWOOD[0])
    # iron bands + lid ajar glow
    R(s,34,44,36,64,IRON[1]); R(s,44,44,46,64,IRON[1])
    line(s,26,54,54,54,(120,255,150,255))       # glow seam (lid ajar)
    for gx in range(28,54,6): P(s,gx,54,(190,255,210,255))
    disc(s,40,40,3,GOLD[1]); P(s,40,40,(150,255,150,255))  # crucifix plate
    outline(s); return s,(40,72,22,3,80)

# ---------------- 11 ANGEL STATUE ----------------
def h11():
    s=canvas()
    R(s,26,60,54,71,STONE[0])                   # pedestal
    R(s,28,54,52,62,STONE[1]); R(s,28,54,30,62,STONE[2])
    ANG=((104,110,124),(150,156,170),(196,200,214))
    # gown
    for yy in range(36,58):
        w=int(4+(yy-36)*0.5); R(s,40-w,yy,40+w,yy,ANG[1])
        R(s,40-w,yy,40-w+1,yy,ANG[2]); R(s,40+w-1,yy,40+w,yy,ANG[0])
    # wings
    for side in (-1,1):
        for i in range(5):
            line(s,40,38,40+side*(6+i*2),30-i*2,ANG[2])
            line(s,40,40,40+side*(7+i*2),36-i,ANG[0])
    # bowed head + halo
    disc(s,40,32,4,ANG[1]); P(s,38,31,ANG[2])
    for a in range(0,360,30):
        P(s,40+int(6*math.cos(math.radians(a))),28+int(3*math.sin(math.radians(a))),GOLD[1])
    # arms crossed
    thick(s,34,42,44,50,2,ANG[1]); thick(s,46,42,38,50,2,ANG[0])
    moss_top(s,29,51,54); crackline(s,44,44,42,56)
    outline(s); return s,(40,73,18,3,85)

# ---------------- 12 OBELISK ----------------
def h12():
    s=canvas()
    R(s,30,64,50,71,STONE[0])                   # base
    R(s,33,58,47,66,STONE[1]); R(s,33,58,35,66,STONE[2])
    # shaft tapering
    for yy in range(20,58):
        t=(yy-20)/38; w=int(3+t*5)
        R(s,40-w,yy,40+w,yy,STONE[1])
        R(s,40-w,yy,40-w+1,yy,STONE[2]); R(s,40+w-1,yy,40+w,yy,STONE[0])
    # pyramidion
    for i,yy in enumerate(range(14,20)):
        w=i; R(s,40-w,yy,40+w,yy,STONE[2])
    P(s,40,13,GOLD[2])
    crackline(s,41,30,39,50)
    for yy in range(30,40,3): R(s,37,yy,43,yy,HOLE)  # inscription
    moss_top(s,33,47,64)
    outline(s); return s,(40,73,14,3,75)

# ---------------- 13 SARCOPHAGUS ----------------
def h13():
    s=canvas()
    R(s,18,66,62,71,STONE[0])
    R(s,20,52,60,68,STONE[1])                   # box
    R(s,20,52,22,68,STONE[2]); R(s,58,52,60,68,STONE[0])
    # lid
    R(s,18,46,62,54,STONE[2]); R(s,18,46,62,48,(200,204,218,255))
    # carved figure on lid
    disc(s,40,44,3,STONE2[2])                   # head
    R(s,36,47,44,52,STONE2[1])                  # body
    thick(s,36,48,40,50,1,STONE2[0]); thick(s,44,48,40,50,1,STONE2[0])  # crossed arms
    for xx in range(24,57,4): P(s,xx,60,HOLE)   # side inscription
    moss_top(s,20,58,52); crackline(s,30,54,28,66)
    outline(s); return s,(40,73,24,3,85)

# ---------------- 14 BONE PILE ----------------
def h14():
    s=canvas()
    R(s,24,68,56,71,DIRT[1])
    for bx,by in [(30,64),(48,64),(40,66),(34,60),(46,60)]:
        line(s,bx-4,by,bx+4,by-2,BONE[1]); disc(s,bx-4,by,1.4,BONE[2]); disc(s,bx+4,by-2,1.4,BONE[2])
    # skulls
    for sx,sy,r in [(32,58,4),(48,56,4),(40,50,5)]:
        shell(s,sx,sy,r,r,BONE)
        disc(s,sx-r*0.4,sy-1,1.2,HOLE); disc(s,sx+r*0.4,sy-1,1.2,HOLE)
        for xx in range(int(sx-2),int(sx+3),2): P(s,xx,sy+r-1,HOLE)
    P(s,40,48,GRNEYE)                            # faint glow in top skull
    outline(s); return s,(40,72,17,3,80)

# ---------------- 15 LAMP POST ----------------
def h15():
    s=canvas()
    R(s,34,66,46,71,STONE[0])                   # base
    R(s,38,30,42,68,IRON[1]); R(s,38,30,39,68,IRON[2])  # post
    for yy in range(66,71): P(s,36,yy,IRON[1]); P(s,44,yy,IRON[1])
    # scroll arm + lantern
    thick(s,40,32,40,26,1,IRON[1])
    R(s,34,20,46,32,IRON[0])                     # lantern frame
    R(s,36,22,44,30,(20,60,40,255))              # glass
    disc(s,40,26,3,(120,255,150,255)); disc(s,40,26,4.5,(120,255,150,90))  # green flame
    R(s,35,18,45,20,IRON[1]); P(s,40,16,IRON[2])  # cap
    # cast glow on ground
    disc(s,40,68,7,(120,220,150,40))
    outline(s,(16,16,24,255)); return s,(40,72,10,3,60)

# ---------------- 16 CANDLE CLUSTER ----------------
def h16():
    s=canvas()
    R(s,26,64,54,71,STONE[1]); R(s,26,64,54,66,STONE[2])   # stone slab
    cand=[(34,44,20),(40,40,24),(46,46,18),(30,50,12),(50,50,12)]
    for cx,base_h,h in cand:
        top=64-h
        R(s,cx-2,top,cx+2,64,(224,220,206,255))
        R(s,cx-2,top,cx-1,64,(245,242,232,255)); R(s,cx+2,top,cx+2,64,(180,176,162,255))
        # drips
        P(s,cx-2,top+4,(245,242,232,255)); P(s,cx+2,top+6,(200,196,182,255))
        line(s,cx,top,cx,top-2,(40,30,20,255))  # wick
        disc(s,cx,top-3,1.6,(255,210,120,255)); P(s,cx,top-4,(255,245,200,255))
        disc(s,cx,top-3,3,(255,180,90,60))
    outline(s); return s,(40,72,16,3,70)

# ---------------- 17 CELTIC CROSS ----------------
def h17():
    s=canvas()
    for yy in range(60,72):
        w=int(6+(yy-60)*1.0); R(s,40-w,yy,40+w,yy,DIRT[1])
    moss_top(s,28,52,60)
    R(s,37,20,43,64,STONE[1]); R(s,37,20,39,64,STONE[2])   # vertical
    R(s,26,32,54,38,STONE[1]); R(s,26,32,54,34,STONE[2])   # arms
    # ring
    for a in range(0,360,6):
        xx=40+int(11*math.cos(math.radians(a))); yy=35+int(11*math.sin(math.radians(a)))
        P(s,xx,yy,STONE[2]);
    for a in range(0,360,6):
        xx=40+int(8*math.cos(math.radians(a))); yy=35+int(8*math.sin(math.radians(a)))
        P(s,xx,yy,STONE[0])
    disc(s,40,35,2,STONE2[2])                    # knot boss
    for yy in range(42,60,4): R(s,38,yy,42,yy,STONE2[0])  # knotwork
    moss_top(s,38,42,58)
    outline(s); return s,(40,73,16,3,80)

# ---------------- 18 DEAD WREATH ----------------
def h18():
    s=canvas()
    slab(s,40,8,54,70,STONE,round_top=False)     # small marker
    R(s,34,50,46,52,HOLE)
    # wreath ring leaning on marker
    for a in range(0,360,10):
        xx=40+int(11*math.cos(math.radians(a))); yy=44+int(11*math.sin(math.radians(a)))
        disc(s,xx,yy,2,MOSS[0])
        if a%30==0: disc(s,xx,yy,1.6,(150,90,110,255))   # withered blooms
    for a in range(0,360,16):
        xx=40+int(11*math.cos(math.radians(a))); yy=44+int(11*math.sin(math.radians(a)))
        P(s,xx,yy,MOSS[1])
    R(s,26,66,54,71,DIRT[1]); moss_top(s,28,52,66)
    outline(s); return s,(40,72,16,3,75)

# ---------------- 19 COBWEB ----------------
def h19():
    s=canvas()
    web=(210,214,224,190)
    cx,cy=20,20
    # radial threads
    for a in range(0,95,12):
        ex=cx+int(56*math.cos(math.radians(a))); ey=cy+int(56*math.sin(math.radians(a)))
        line(s,cx,cy,ex,ey,web)
    # arcs
    for r in range(10,58,9):
        for a in range(0,92,4):
            xx=cx+int(r*math.cos(math.radians(a))); yy=cy+int(r*math.sin(math.radians(a)))
            P(s,xx,yy,web)
    # spider
    disc(s,44,44,3,(30,26,40,255)); P(s,43,43,(80,74,96,255))
    for side in (-1,1):
        for i in range(3):
            line(s,44,44,44+side*6,44-4+i*4,(30,26,40,255))
    P(s,43,44,REDEYE); P(s,45,44,REDEYE)
    return s,(40,74,4,2,20)

# ---------------- 20 GRAVE FUNGUS ----------------
def h20():
    s=canvas()
    R(s,20,64,60,70,DWOOD[1])                    # mossy log
    R(s,20,64,60,66,DWOOD[2]); moss_top(s,22,58,64)
    ell(s,24,64,4,3,DWOOD[0])                    # log end
    caps=[(32,52,6),(44,48,7),(52,56,5),(38,60,4),(26,58,4)]
    for cx,cy,r in caps:
        R(s,cx-1,cy,cx+1,64,(210,215,205,255))   # stem
        shell(s,cx,cy,r,r*0.7,ECTO)              # glowing cap
        disc(s,cx,cy,r*0.4,(210,255,225,255))
        for a in range(0,360,72): P(s,cx+int(r*0.6*math.cos(math.radians(a))),cy+int(r*0.5*math.sin(math.radians(a))),WHITE)  # spots
        disc(s,cx,cy,r+2,(120,255,150,40))       # glow
    outline(s,(24,80,56,255)); return s,(40,72,20,3,75)

DECOR=[
 (h1,"HEADSTONE","grave marker"),(h2,"CROSS GRAVE","grave marker"),
 (h3,"BROKEN STONE","toppled marker"),(h4,"CRYPT","landmark"),
 (h5,"IRON GATE","entrance anchor"),(h6,"IRON FENCE","wall divider"),
 (h7,"DEAD TREE","canopy anchor"),(h8,"HOLLOW STUMP","clutter"),
 (h9,"OPEN GRAVE","dug pit"),(h10,"COFFIN","prop"),
 (h11,"ANGEL STATUE","landmark"),(h12,"OBELISK","tall monument"),
 (h13,"SARCOPHAGUS","tomb"),(h14,"BONE PILE","clutter"),
 (h15,"LAMP POST","light source"),(h16,"CANDLES","offering light"),
 (h17,"CELTIC CROSS","monument"),(h18,"DEAD WREATH","offering"),
 (h19,"COBWEB","corner accent"),(h20,"GRAVE FUNGUS","glow clutter"),
]

def to_img(a): return Image.fromarray(a,"RGBA")
def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()

cols,rows=5,4; SPR=160; cell_w,cell_h=176,210; margin_x,top=26,92
sheet_w=margin_x*2+cols*cell_w; sheet_h=top+rows*cell_h+20
bg=np.zeros((sheet_h,sheet_w,3),dtype=np.uint8)
for y in range(sheet_h):
    t=y/sheet_h; bg[y,:]=(max(int(20-6*t),8),max(int(18-4*t),8),max(int(32-8*t),12))
sheet=Image.fromarray(bg,"RGB").convert("RGBA"); d=ImageDraw.Draw(sheet)
d.text((margin_x,20),"THE GRAVEYARD  —  20 DECORATIONS",font=font(30),fill=(226,224,236))
d.text((margin_x,58),"scene props · pick the set + I'll compose them into a planned cemetery, not random scatter",font=font(16),fill=(150,150,170))
d.line((margin_x,86,sheet_w-margin_x,86),fill=(70,66,92),width=2)
for i,(fn,name,role) in enumerate(DECOR):
    arr,sh=fn(); scx,scy,srx,sry,sa=sh
    base=to_img(k.shadow_layer(scx,scy,srx,sry,sa))
    base=Image.alpha_composite(base,to_img(arr))
    big=base.resize((SPR,SPR),Image.NEAREST)
    cx=margin_x+(i%cols)*cell_w; cy=top+(i//cols)*cell_h
    d.rounded_rectangle((cx+4,cy+4,cx+cell_w-6,cy+cell_h-6),radius=8,fill=(26,24,38,255),outline=(64,60,86,255),width=1)
    sheet.alpha_composite(big,(cx+8,cy+6))
    bx,by=cx+12,cy+10
    d.ellipse((bx,by,bx+30,by+30),fill=(60,90,70,255),outline=(150,220,170,255),width=2)
    num=str(i+1); f=font(19); tb=d.textbbox((0,0),num,font=f)
    d.text((bx+15-(tb[2]-tb[0])/2,by+15-(tb[3]-tb[1])/2-1),num,font=f,fill=(240,245,235))
    fn2=font(18); tb=d.textbbox((0,0),name,font=fn2)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2,cy+168),name,font=fn2,fill=(230,228,240))
    fr=font(14); tb=d.textbbox((0,0),role,font=fr)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2,cy+190),role,font=fr,fill=(158,150,180))
sheet.convert("RGB").save("/tmp/graveyard_decor.png"); print("saved",sheet.size)
