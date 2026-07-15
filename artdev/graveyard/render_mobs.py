import numpy as np
from PIL import Image, ImageDraw, ImageFont
import mobkit as k
from mobkit import (P,R,disc,ell,shell,thick,limb,line,outline,canvas,
    BONE,ROT,ROT2,GHOST,ECTO,STONE,STONE2,DIRT,MOSS,PURP,CLOTH,SHEET,RUST,GOLD,WOOD,
    REDEYE,REDGLOW,CYEYE,GRNEYE,PURGLOW,HOLE,WHITE)

GHOUL = ((88,92,100),(138,142,150),(184,188,196))
FLESH = ((110,120,96),(150,162,120),(188,200,150))
BAND  = ((150,138,104),(202,190,152),(228,218,184))
DARKB = ((30,26,40),(52,48,66),(80,76,96))

def eye(s, x, y, col=REDEYE, r=1):
    disc(s, x, y, r, col)
    P(s, x-0.5, y-0.5, (255,255,255,200))

def fade_bottom(s, y0, y1):
    for y in range(int(y0), int(y1)+1):
        f = 1.0 - (y-y0)/max(1,(y1-y0))
        for x in range(k.W):
            if s[y,x,3] > 0:
                s[y,x,3] = int(s[y,x,3]*max(0.15, f))

# ------------------------------------------------------------------ 1 SHAMBLER
def m1():
    s=canvas()
    limb(s,35,54,32,71,3,ROT); limb(s,45,54,49,71,3,ROT)      # legs
    shell(s,40,48,11,14,ROT)                                   # torso
    R(s,31,50,49,58,ROT[0]);                                   # torn shirt hem
    for xx in (33,37,41,45): P(s,xx,58,(40,30,30,255))
    limb(s,31,44,19,58,3,ROT2); limb(s,49,44,60,55,3,ROT2)    # arms reaching
    disc(s,18,58,2.4,ROT2[1]); disc(s,61,55,2.4,ROT2[1])
    shell(s,40,31,8,8,ROT2)                                    # head (tilted)
    P(s,41,26,ROT2[2])
    eye(s,36,30,WHITE,1); disc(s,36,30,0.7,(20,20,30,255))
    R(s,43,29,45,31,HOLE)                                      # dead socket
    line(s,36,35,45,36,(40,26,26,255))                         # mouth
    for xx in (37,40,43): P(s,xx,35,(210,205,180,255))         # teeth
    for bx,by in [(34,44),(46,50),(38,52),(30,40)]: disc(s,bx,by,1.4,ROT[0])
    outline(s); return s,(40,73,15,4,95)

# ------------------------------------------------------------------ 2 GHOUL
def m2():
    s=canvas()
    limb(s,34,52,30,70,3,GHOUL); limb(s,46,52,50,70,3,GHOUL)
    shell(s,40,46,11,11,GHOUL)                                 # hunched torso
    for i in range(4): disc(s,34+i,40-i*0.5,1.3,GHOUL[0])      # spine ridge
    limb(s,31,42,20,62,3,GHOUL); limb(s,49,42,58,60,3,GHOUL)   # long arms
    for cx,cy,dx in [(20,62,-1),(58,60,1)]:                    # claws
        for j in range(3):
            line(s,cx,cy,cx+dx*(3),cy+4+j*1.5,(210,210,220,255))
    shell(s,40,34,7,6,GHOUL)                                   # low head
    line(s,33,36,47,36,HOLE)                                   # wide grin
    for xx in range(34,47,2): P(s,xx,36,(230,230,235,255)); P(s,xx,37,(230,230,235,255))
    eye(s,36,32,REDEYE,1); eye(s,44,32,REDEYE,1)
    outline(s); return s,(40,73,15,4,95)

# ------------------------------------------------------------------ 3 RATTLEBONES
def m3():
    s=canvas()
    # spine + ribs
    R(s,39,32,41,52,BONE[1])
    for i,ry in enumerate(range(35,50,3)):
        w=8-i
        line(s,40-1,ry,40-w,ry+3,BONE[0]); line(s,41,ry,41+w,ry+3,BONE[0])
        line(s,40-1,ry,40-w,ry+3,BONE[2]);
    shell(s,40,50,6,4,BONE)                                    # pelvis
    limb(s,35,34,26,48,2,BONE); limb(s,45,34,54,48,2,BONE)     # arms
    disc(s,26,48,1.6,BONE[1]); disc(s,54,48,1.6,BONE[1])
    limb(s,37,53,34,70,2.2,BONE); limb(s,43,53,46,70,2.2,BONE) # legs
    shell(s,40,25,7,7,BONE)                                    # skull
    disc(s,36,25,1.7,HOLE); disc(s,44,25,1.7,HOLE)
    P(s,36,24,GRNEYE); P(s,44,24,GRNEYE)
    R(s,39,27,41,29,HOLE)                                      # nasal
    for xx in range(36,45,2): P(s,xx,31,HOLE)                  # teeth
    outline(s); return s,(40,73,13,4,90)

# ------------------------------------------------------------------ 4 BONE ARCHER
def m4():
    s=canvas()
    limb(s,38,52,34,70,2.2,BONE); limb(s,44,52,48,70,2.2,BONE)
    R(s,39,32,41,52,BONE[1])
    for i,ry in enumerate(range(35,49,3)):
        w=7-i; line(s,41,ry,41+w,ry+3,BONE[0])
    shell(s,40,25,7,7,BONE)                                    # skull
    disc(s,37,25,1.6,HOLE); disc(s,44,25,1.6,HOLE); P(s,37,24,GRNEYE); P(s,44,24,GRNEYE)
    for xx in range(37,45,2): P(s,xx,30,HOLE)
    # bow held in left, arm forward
    limb(s,36,34,22,40,2,BONE)                                 # bow arm
    for a in range(-9,10):                                     # bow arc
        yy=40+a; xx=18+int((1-(a/10)**2)*4)
        P(s,xx,yy,WOOD[1]); P(s,xx-1,yy,WOOD[0])
    line(s,18,31,18,49,(230,230,230,180))                     # string
    limb(s,44,34,30,42,2,BONE)                                 # draw arm
    line(s,20,40,40,40,WOOD[2]); disc(s,20,40,1.2,(230,230,230,255))  # arrow
    for dx in (0,1): P(s,41+dx,39,GOLD[1]); P(s,41+dx,41,GOLD[1])      # arrowhead
    outline(s); return s,(40,73,13,4,90)

# ------------------------------------------------------------------ 5 CORPSE CANDLE
def m5():
    s=canvas()
    # flame body teardrop
    for r,ram in [(13,ECTO),(9,ECTO),(0,None)]:
        if ram: shell(s,40,42,r,r+3,ram)
    # tapered flame top
    for i,yy in enumerate(range(20,34)):
        w=int((yy-20)*0.9)+1; R(s,40-w,yy,40+w,yy, ECTO[2] if i<5 else ECTO[1])
    # small skull inside
    shell(s,40,44,5,5,BONE)
    disc(s,38,44,1.3,(20,60,40,255)); disc(s,42,44,1.3,(20,60,40,255))
    P(s,38,43,GRNEYE); P(s,42,43,GRNEYE)
    for xx in (38,40,42): P(s,xx,48,(30,80,55,255))
    # wisp tail
    for j,yy in enumerate(range(52,64,2)):
        disc(s,40+(1 if j%2 else -1)*2,yy,2.2-j*0.3,ECTO[1])
    outline(s, (18,60,44,255))
    # bright core overlay
    disc(s,40,42,4,(210,255,225,150))
    return s,(40,72,9,3,60)

# ------------------------------------------------------------------ 6 WRAITH
def m6():
    s=canvas()
    # cloak bell
    for yy in range(20,66):
        t=(yy-20)/46; w=int(6+t*18)
        jag = 0
        if yy>56: jag = (2 if (yy//2)%2 else 5)
        R(s,40-w+ (jag if yy>56 else 0),yy,40+w-(jag if yy>56 else 0),yy, GHOST[1])
    # shading left light
    for yy in range(22,60):
        t=(yy-20)/46; w=int(6+t*18)
        R(s,40-w,yy,40-w+3,yy,GHOST[2]); R(s,40+w-2,yy,40+w,yy,GHOST[0])
    # hood opening
    ell(s,40,30,6,8,HOLE)
    eye(s,37,30,CYEYE,1); eye(s,43,30,CYEYE,1)
    # tattered arms
    limb(s,28,40,18,54,2.5,GHOST); limb(s,52,40,62,54,2.5,GHOST)
    outline(s,(60,100,120,255))
    fade_bottom(s,54,66)
    return s,(40,72,13,3,55)

# ------------------------------------------------------------------ 7 TOMB GOLEM
def m7():
    s=canvas()
    R(s,30,58,50,71,STONE[0])                                  # legs/base
    shell(s,40,46,15,15,STONE)                                 # body volume
    R(s,26,40,54,58,STONE[1])                                  # blocky torso
    # cracks
    line(s,34,42,38,56,STONE2[0]); line(s,46,40,44,54,STONE2[0]); line(s,40,44,40,58,STONE2[0])
    # embedded headstone shoulder
    R(s,44,30,56,44,STONE2[1]);
    for yy in range(30,33): R(s,44,yy,56,yy,STONE2[2])
    P(s,49,36,HOLE); P(s,50,36,HOLE)                           # RIP marks
    # arms slabs
    R(s,20,42,28,60,STONE[1]); R(s,52,42,60,60,STONE[1])
    R(s,20,42,22,60,STONE[2]); R(s,58,42,60,60,STONE[0])
    # head
    R(s,34,26,46,38,STONE[1]); R(s,34,26,46,28,STONE[2])
    eye(s,37,32,GRNEYE,1); eye(s,43,32,GRNEYE,1)
    # moss on top edges
    for xx in range(28,53,2): P(s,xx,40,MOSS[1]);
    for xx in range(35,46,2): P(s,xx,26,MOSS[1])
    disc(s,30,41,1.5,MOSS[0]); disc(s,50,41,1.5,MOSS[1])
    outline(s); return s,(40,73,18,4,110)

# ------------------------------------------------------------------ 8 CRYPT SPIDER
def m8():
    s=canvas()
    SP=((28,24,40),(50,44,66),(78,70,96))
    # legs
    for side in (-1,1):
        for i,ang in enumerate([(-16,-10),(-8,-2),(4,-1),(12,4)]):
            ex=44+side*(10+abs(ang[0])); ky=44+ang[1]-4; ey=44+ang[1]+10
            line(s,44,44,44+side*10,ky,SP[1],1)
            line(s,44+side*10,ky,ex,ey,SP[0],1)
    shell(s,45,45,11,10,SP)                                    # abdomen
    shell(s,31,43,6,5,SP)                                      # head
    # hourglass/skull mark
    R(s,43,40,47,42,BONE[2]); R(s,44,42,46,46,BONE[1]); R(s,43,46,47,48,BONE[2])
    for ex in (28,30,32,34):                                   # eye cluster
        eye(s,ex,42,REDEYE,0)
    # web strand
    line(s,45,34,45,20,(210,210,220,120))
    outline(s,(20,16,30,255)); return s,(45,72,15,3,90)

# ------------------------------------------------------------------ 9 CORPSE BLOATER
def m9():
    s=canvas()
    limb(s,33,58,31,70,2.4,ROT); limb(s,47,58,49,70,2.4,ROT)
    shell(s,40,48,16,15,ROT2)                                  # huge belly
    # bruise blotches / bloat
    for bx,by,r in [(33,44,3),(48,50,3.5),(40,55,3),(45,42,2.5),(34,54,2)]:
        disc(s,bx,by,r,(70,54,96,255))
    # glowing cracks
    line(s,36,40,44,58,(120,255,150,255)); line(s,44,44,50,54,(120,255,150,255))
    # tiny head + arms
    shell(s,40,30,6,6,ROT); eye(s,37,30,GRNEYE,1); R(s,42,29,44,31,HOLE)
    line(s,36,34,44,35,(30,50,30,255))
    limb(s,26,44,20,54,2,ROT2); limb(s,54,44,60,52,2,ROT2)
    outline(s)
    # leaking gas puffs (after outline, translucent)
    for gx,gy,r in [(24,38,4),(56,40,4),(40,20,5)]:
        disc(s,gx,gy,r,(120,220,150,90))
    return s,(40,73,17,4,105)

# ------------------------------------------------------------------ 10 BANSHEE
def m10():
    s=canvas()
    for yy in range(30,64):                                    # gown
        t=(yy-30)/34; w=int(5+t*16)
        R(s,40-w,yy,40+w,yy,GHOST[1])
        R(s,40-w,yy,40-w+2,yy,GHOST[2]); R(s,40+w-2,yy,40+w,yy,GHOST[0])
    # hair streaming
    for hx in (-8,-5,5,8):
        line(s,40+hx,26,40+hx*2,44,GHOST[2])
    shell(s,40,26,7,8,((150,178,196),(200,222,230),(232,245,250)))   # pale face
    disc(s,37,25,1.6,HOLE); disc(s,43,25,1.6,HOLE)             # hollow eyes
    ell(s,40,31,2,3,HOLE)                                      # wailing mouth
    limb(s,28,40,20,52,2,GHOST); limb(s,52,40,60,52,2,GHOST)
    outline(s,(70,110,130,255))
    fade_bottom(s,54,64)
    # sound rings
    for r in (12,16,20):
        for a in range(-40,41,6):
            import math; xx=58+int(r*math.cos(math.radians(a))); yy=30+int(r*math.sin(math.radians(a)))
            P(s,xx,yy,(200,240,250,120))
    return s,(40,72,13,3,55)

# ------------------------------------------------------------------ 11 GRAVE DIGGER
def m11():
    s=canvas()
    # tilted headstone behind
    R(s,54,34,66,58,STONE[1]); R(s,54,34,66,36,STONE[2]); P(s,59,44,HOLE);P(s,60,44,HOLE)
    # upper body rising
    shell(s,38,44,9,10,ROT2)
    limb(s,30,42,22,30,2.6,ROT2); limb(s,46,42,54,32,2.6,ROT2) # arms up
    disc(s,22,30,2,ROT2[1]); disc(s,54,32,2,ROT2[1])
    shell(s,38,32,6,6,ROT); eye(s,35,32,GRNEYE,1); R(s,40,31,42,33,HOLE)
    # shovel in right hand
    line(s,54,32,64,18,WOOD[1],1); R(s,61,14,68,20,STONE[1]); R(s,61,14,68,15,STONE[2])
    # dirt mound covering lower half
    for yy in range(52,72):
        t=(yy-52)/20; w=int(10+t*20)
        R(s,40-w,yy,40+w,yy, DIRT[1] if (yy+ (yy//2))%3 else DIRT[0])
    for cx,cy in [(24,58),(56,60),(40,66),(30,64),(50,56)]: disc(s,cx,cy,2,DIRT[2])
    for cx,cy in [(28,54),(52,54)]: disc(s,cx,cy,1.4,MOSS[1])
    outline(s); return s,(40,74,22,3,90)

# ------------------------------------------------------------------ 12 BARROW MOUND
def m12():
    s=canvas()
    for yy in range(46,72):                                    # grassy mound
        t=(yy-46)/26; w=int(12+t*22)
        R(s,40-w,yy,40+w,yy, DIRT[1])
    # grass cap
    for xx in range(15,66):
        h=int(2+2*abs(((xx*7)%5)-2));
        for j in range(h): P(s,xx,46-j+ int(2*np.sin(xx*0.4)),MOSS[1])
    # headstone
    R(s,33,30,47,52,STONE[1]); ell(s,40,30,7,5,STONE[1]); R(s,33,30,35,52,STONE[2]); R(s,45,32,47,52,STONE[0])
    for c in "RIP":
        pass
    R(s,37,36,43,38,HOLE); R(s,38,40,42,42,HOLE); R(s,37,44,43,46,HOLE)  # inscription bars
    # skeletal hand poking out
    for fx in (-3,-1,1,3):
        line(s,52+fx*0.6,60,52+fx,52,BONE[2])
    disc(s,52,60,2,BONE[1])
    # glowing crack
    line(s,20,60,32,54,(120,255,150,255)); line(s,32,54,40,58,(120,255,150,255))
    outline(s); return s,(40,73,30,3,90)

# ------------------------------------------------------------------ 13 GRAVEMOUTH TURRET
def m13():
    s=canvas()
    # bone pile base
    for bx,by in [(28,64),(52,64),(40,66),(34,60),(46,60)]:
        ell(s,bx,by,5,3,BONE[0])
    shell(s,32,54,7,6,BONE); shell(s,48,54,7,6,BONE)           # lower skulls
    for sx in (32,48):
        disc(s,sx-2,54,1.4,HOLE); disc(s,sx+2,54,1.4,HOLE)
    shell(s,40,38,10,10,BONE)                                  # top skull
    disc(s,35,37,2.4,HOLE); disc(s,45,37,2.4,HOLE)
    P(s,35,36,GRNEYE); P(s,45,36,GRNEYE)
    # open glowing mouth
    ell(s,40,45,5,3,(40,90,60,255)); disc(s,40,45,2.2,(150,255,170,255))
    # radial bone shards firing
    import math
    for a in range(0,360,45):
        dx=math.cos(math.radians(a)); dy=math.sin(math.radians(a))
        bx=40+dx*16; by=40+dy*16
        line(s,40+dx*12,40+dy*12,bx,by,BONE[2])
        disc(s,bx,by,1.2,BONE[1])
    outline(s); return s,(40,72,16,4,95)

# ------------------------------------------------------------------ 14 FLAMING SKULL
def m14():
    s=canvas()
    # green flame aura
    for r in (15,12,9):
        for a in range(0,360,20):
            import math; jitter=(a%3); xx=40+int((r)*math.cos(math.radians(a))); yy=40+int((r-2)*math.sin(math.radians(a)))
            disc(s,xx,yy,2.4,ECTO[1] if r>11 else ECTO[2])
    # bony wings
    for side in (-1,1):
        base=40+side*8
        for i in range(3):
            line(s,base,38,base+side*(9+i*3),34+i*5,DARKB[1],1)
        for i in range(3):
            line(s,base+side*(9),34,base+side*(9+i*2),40+i*3,DARKB[0])
    shell(s,40,40,9,9,BONE)                                    # skull
    disc(s,35,39,2.6,HOLE); disc(s,45,39,2.6,HOLE)
    disc(s,35,39,1.4,(120,255,150,255)); disc(s,45,39,1.4,(120,255,150,255))
    R(s,39,42,41,45,HOLE)
    for xx in range(35,46,2): P(s,xx,48,HOLE); P(s,xx,49,HOLE)  # jaw teeth
    # flame trail below
    for j,yy in enumerate(range(52,62,2)): disc(s,40,yy,2.4-j*0.4,ECTO[1])
    outline(s,(24,80,56,255)); return s,(40,72,10,3,55)

# ------------------------------------------------------------------ 15 BONE HOUND
def m15():
    s=canvas()
    # legs
    for lx in (26,34,46,54):
        limb(s,lx,48,lx-2,68,1.8,BONE)
    shell(s,40,44,14,7,BONE)                                   # body
    for rx in range(30,52,4): line(s,rx,40,rx+2,50,BONE[0])    # ribs
    R(s,26,42,54,44,BONE[2])                                   # spine
    # head low front
    shell(s,20,46,6,5,BONE)
    line(s,14,48,22,50,HOLE)                                   # jaw
    for xx in range(15,22,2): P(s,xx,50,BONE[2])
    disc(s,20,44,1.4,HOLE); P(s,20,43,REDEYE)
    # tail bony up
    for i,(tx,ty) in enumerate([(54,42),(60,38),(64,32),(66,26)]):
        disc(s,tx,ty,1.6,BONE[1])
    outline(s); return s,(40,72,17,4,95)

# ------------------------------------------------------------------ 16 MUMMY
def m16():
    s=canvas()
    limb(s,35,54,33,71,3,BAND); limb(s,45,54,47,71,3,BAND)
    shell(s,40,46,11,14,BAND)                                  # wrapped body
    # bandage gap lines
    for yy in range(34,60,3): line(s,30,yy,50,yy+1,BAND[0])
    limb(s,30,40,18,44,3,BAND); limb(s,50,40,62,44,3,BAND)     # arms forward
    disc(s,18,44,2.4,BAND[1]); disc(s,62,44,2.4,BAND[1])
    # loose wrap trailing
    line(s,62,44,68,54,BAND[2]); line(s,64,44,70,50,BAND[1])
    shell(s,40,30,8,8,BAND)                                    # head
    for yy in range(24,37,3): line(s,32,yy,48,yy+1,BAND[0])
    R(s,35,30,45,32,HOLE); P(s,38,31,(255,180,80,255)); P(s,42,31,(255,180,80,255))  # eye slit glow
    # gold amulet
    disc(s,40,42,2.4,GOLD[1]); P(s,40,42,GOLD[2]); disc(s,40,42,1,(150,255,150,255))
    outline(s); return s,(40,73,15,4,95)

# ------------------------------------------------------------------ 17 POLTERGEIST
def m17():
    s=canvas()
    # tombstone chunk overhead
    R(s,30,14,50,26,STONE[1]); R(s,30,14,50,16,STONE[2]); R(s,30,24,50,26,STONE[0])
    line(s,34,16,38,24,STONE2[0]); P(s,44,20,HOLE); P(s,45,20,HOLE)
    # sheet body
    for yy in range(28,60):
        t=(yy-28)/32; w=int(6+t*14)
        if yy>50:
            for x in range(40-w,40+w+1):
                if (x//3)%2==0: P(s,x,yy,SHEET[1])
        else:
            R(s,40-w,yy,40+w,yy,SHEET[1])
        R(s,40-w,yy,40-w+2,yy,SHEET[2]); R(s,40+w-2,yy,40+w,yy,SHEET[0])
    ell(s,36,38,2,3,HOLE); ell(s,44,38,2,3,HOLE)               # eye holes
    # arms up holding stone
    limb(s,30,36,30,22,2.5,SHEET); limb(s,50,36,50,22,2.5,SHEET)
    outline(s,(120,120,140,255))
    return s,(40,72,14,3,60)

# ------------------------------------------------------------------ 18 NECRO ACOLYTE
def m18():
    s=canvas()
    for yy in range(28,64):                                    # robe
        t=(yy-28)/36; w=int(5+t*15)
        R(s,40-w,yy,40+w,yy,PURP[1])
        R(s,40-w,yy,40-w+2,yy,PURP[2]); R(s,40+w-2,yy,40+w,yy,PURP[0])
    # hood
    shell(s,40,28,9,9,PURP)
    ell(s,40,30,5,6,HOLE)
    P(s,38,30,GRNEYE); P(s,42,30,GRNEYE)
    # bone trim
    for xx in range(28,53,3): P(s,xx,44,BONE[2])
    # sleeves holding tome/orb
    limb(s,30,40,38,48,3,PURP); limb(s,50,40,42,48,3,PURP)
    R(s,36,44,44,52,WOOD[1]); R(s,36,44,44,45,WOOD[2])         # tome
    disc(s,40,48,2.6,(120,255,150,255)); disc(s,40,48,4,(120,255,150,90))
    # rune glow above hands
    for rx,ry in [(40,40),(34,42),(46,42)]: P(s,rx,ry,GRNEYE)
    outline(s,(40,26,60,255)); return s,(40,72,15,3,70)

# ------------------------------------------------------------------ 19 GRAVEBATS
def m19():
    s=canvas()
    BAT=((28,24,38),(52,46,66),(84,76,100))
    def bat(cx,cy,sc):
        disc(s,cx,cy,2*sc,BAT[1]); P(s,cx-1,cy-1,BAT[2])
        for side in (-1,1):
            line(s,cx,cy,cx+side*4*sc,cy-3*sc,BAT[0])
            line(s,cx+side*4*sc,cy-3*sc,cx+side*7*sc,cy-sc,BAT[0])
            line(s,cx+side*7*sc,cy-sc,cx+side*4*sc,cy+2*sc,BAT[0])
            # membrane fill
            for t in range(1,6):
                fx=cx+side*(1.4*t)*sc; fy=cy - (2-abs(t-3))*sc*0.6
                P(s,fx,fy,BAT[1])
            P(s,cx+side*2*sc,cy-2*sc,BAT[2])
        eye(s,cx-1,cy,REDEYE,0); eye(s,cx+1,cy,REDEYE,0)
    bat(40,32,1.5); bat(24,50,1.0); bat(56,48,1.1)
    outline(s,(18,14,26,255))
    return s,(40,70,16,3,55)

# ------------------------------------------------------------------ 20 GRAVE WARDEN SPRITE
def m20():
    s=canvas()
    import math
    # purple shield bubble
    for a in range(0,360,8):
        xx=40+int(17*math.cos(math.radians(a))); yy=42+int(17*math.sin(math.radians(a)))
        disc(s,xx,yy,1.4,(150,90,210,150))
    disc(s,40,42,16,(120,70,190,45))
    # spectral hands
    disc(s,24,46,2,PURP[2]); disc(s,56,46,2,PURP[2])
    line(s,26,44,32,40,PURP[1]); line(s,54,44,48,40,PURP[1])
    # skull
    shell(s,40,42,8,8,BONE)
    disc(s,36,41,2.2,HOLE); disc(s,44,41,2.2,HOLE)
    disc(s,36,41,1.1,PURGLOW); disc(s,44,41,1.1,PURGLOW)
    R(s,39,44,41,47,HOLE)
    for xx in range(36,45,2): P(s,xx,49,HOLE)
    # gold crown
    for i,cx in enumerate(range(33,49,3)):
        h=4 if i%2==0 else 6
        R(s,cx,34-h+34-34,34,cx and 34, GOLD[1]) if False else None
    R(s,33,32,47,35,GOLD[1]); R(s,33,32,47,33,GOLD[2])
    for cx in (34,40,46): R(s,cx-1,28,cx+1,32,GOLD[1]);
    for cx in (34,40,46): P(s,cx,28,GOLD[2]); disc(s,cx,28,1,(150,255,150,255))
    outline(s,(50,30,80,255))
    return s,(40,72,12,3,55)

MOBS = [
    (m1,"SHAMBLER","slow chaser"),
    (m2,"GHOUL","fast lunger"),
    (m3,"RATTLEBONES","swarm skeleton"),
    (m4,"BONE ARCHER","aimed shooter"),
    (m5,"CORPSE CANDLE","homing wisp"),
    (m6,"WRAITH","phase shifter"),
    (m7,"TOMB GOLEM","regen tank"),
    (m8,"CRYPT SPIDER","web-slow"),
    (m9,"CORPSE BLOATER","death gas burst"),
    (m10,"BANSHEE","wail cone"),
    (m11,"GRAVE DIGGER","burrow ambush"),
    (m12,"BARROW MOUND","spawner"),
    (m13,"GRAVEMOUTH","radial turret"),
    (m14,"FLAMING SKULL","bobbing flyer"),
    (m15,"BONE HOUND","pack hunter"),
    (m16,"MUMMY","curse tank"),
    (m17,"POLTERGEIST","hurls tombstones"),
    (m18,"NECRO ACOLYTE","raises corpses"),
    (m19,"GRAVEBATS","bat swarm"),
    (m20,"GRAVE WARDEN","shields mobs"),
]

# ---------------- compose sheet ----------------
def to_img(arr):
    return Image.fromarray(arr, "RGBA")

def font(sz, bold=True):
    paths=["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
           "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for p in paths:
        try: return ImageFont.truetype(p, sz)
        except: pass
    return ImageFont.load_default()

cols, rows = 5, 4
SPR = 160
cell_w, cell_h = 176, 210
margin_x, top = 26, 92
sheet_w = margin_x*2 + cols*cell_w
sheet_h = top + rows*cell_h + 20

sheet = Image.new("RGBA",(sheet_w,sheet_h),(0,0,0,255))
# background gradient + vignette
bg = np.zeros((sheet_h,sheet_w,3),dtype=np.uint8)
for y in range(sheet_h):
    t=y/sheet_h
    r=int(20+ -6*t); g=int(18+ -4*t); b=int(32+ -8*t)
    bg[y,:]=(max(r,8),max(g,8),max(b,12))
sheet = Image.fromarray(bg,"RGB").convert("RGBA")
d = ImageDraw.Draw(sheet)

# header
d.text((margin_x, 20), "THE GRAVEYARD  —  20 MOB CANDIDATES", font=font(30), fill=(226,224,236))
d.text((margin_x, 58), "160×160 hi-fi pixel  ·  pick ≥8 by number  ·  tell me which to change", font=font(17), fill=(150,150,170))
d.line((margin_x,86,sheet_w-margin_x,86), fill=(70,66,92), width=2)

for i,(fn,name,role) in enumerate(MOBS):
    arr,sh = fn()
    outline_arr = arr
    # shadow layer under sprite
    scx,scy,srx,sry,sa = sh
    shl = k.shadow_layer(scx,scy,srx,sry,sa)
    base = to_img(shl)
    base = Image.alpha_composite(base, to_img(outline_arr))
    big = base.resize((SPR,SPR), Image.NEAREST)

    cx = margin_x + (i%cols)*cell_w
    cy = top + (i//cols)*cell_h
    # cell panel
    d.rounded_rectangle((cx+4,cy+4,cx+cell_w-6,cy+cell_h-6), radius=8,
                        fill=(26,24,38,255), outline=(64,60,86,255), width=1)
    sheet.alpha_composite(big, (cx+8, cy+6))
    # number badge
    bx,by=cx+12,cy+10
    d.ellipse((bx,by,bx+30,by+30), fill=(150,40,60,255), outline=(240,220,150,255), width=2)
    num=str(i+1)
    f=font(19); tb=d.textbbox((0,0),num,font=f)
    d.text((bx+15-(tb[2]-tb[0])/2, by+15-(tb[3]-tb[1])/2 -1), num, font=f, fill=(245,240,225))
    # name + role
    fn2=font(18); tb=d.textbbox((0,0),name,font=fn2)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2, cy+168), name, font=fn2, fill=(230,228,240))
    fr=font(14); tb=d.textbbox((0,0),role,font=fr)
    d.text((cx+cell_w/2-(tb[2]-tb[0])/2, cy+190), role, font=fr, fill=(158,150,180))

sheet.convert("RGB").save("/tmp/graveyard_mobs.png")
print("saved", sheet.size)
