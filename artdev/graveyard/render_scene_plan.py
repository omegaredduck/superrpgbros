from PIL import Image, ImageDraw, ImageFont
import math

W=H=1060
img=Image.new("RGB",(W,H),(13,13,19))
dr=ImageDraw.Draw(img,"RGBA")
def font(sz,bold=True):
    p="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    try: return ImageFont.truetype(p,sz)
    except: return ImageFont.load_default()

M=40; x0,y0,x1,y1=M,70,W-M,H-M       # map rect
# ground
for y in range(y0,y1):
    t=(y-y0)/(y1-y0); c=(int(20-6*t),int(22-6*t),int(18-4*t))
    dr.line((x0,y,x1,y),fill=c)
dr.rectangle((x0,y0,x1,y1),outline=(70,66,90),width=2)

GREEN=(120,230,150); PUR=(180,120,235); GOLD=(230,190,90); STON=(150,154,168); BONE=(225,218,192)
FOG=(90,150,120)

def headstone(x,y,s=10):
    dr.rounded_rectangle((x-s*0.55,y-s,x+s*0.55,y+s*0.6),radius=s*0.5,fill=(120,124,140),outline=(60,62,78))
def cross(x,y,s=10):
    dr.line((x,y-s,x,y+s*0.8),fill=STON,width=3); dr.line((x-s*0.6,y-s*0.4,x+s*0.6,y-s*0.4),fill=STON,width=3)
def obelisk(x,y,s=16):
    dr.polygon([(x,y-s),(x-s*0.28,y+s*0.6),(x+s*0.28,y+s*0.6)],fill=(140,144,160),outline=(70,72,90))
    dr.ellipse((x-2,y-s-2,x+2,y-s+2),fill=GREEN)
def crypt(x,y,s=34):
    dr.rectangle((x-s,y-s*0.5,x+s,y+s*0.7),fill=(110,112,128),outline=(60,62,78),width=2)
    dr.polygon([(x-s*1.1,y-s*0.5),(x,y-s*1.1),(x+s*1.1,y-s*0.5)],fill=(126,128,144),outline=(60,62,78))
    dr.line((x,y-s*1.35,x,y-s*1.05),fill=STON,width=3); dr.line((x-6,y-s*1.2,x+6,y-s*1.2),fill=STON,width=3)
    dr.rectangle((x-s*0.28,y-s*0.1,x+s*0.28,y+s*0.7),fill=(20,20,28))
    dr.ellipse((x-4,y+s*0.2,x+2,y+s*0.34),fill=GREEN)
def angel(x,y,s=16):
    dr.ellipse((x-s*0.7,y-s*0.7,x+s*0.7,y+s*0.7),fill=(160,164,180),outline=(80,82,100))
    for a in range(0,360,45):
        dr.line((x,y,x+math.cos(math.radians(a))*s,y+math.sin(math.radians(a))*s*0.6),fill=(190,194,210),width=2)
def lamp(x,y):
    dr.ellipse((x-16,y-16,x+16,y+16),fill=(120,230,150,45))
    dr.line((x,y+8,x,y-6),fill=(60,64,80),width=3); dr.ellipse((x-4,y-11,x+4,y-3),fill=GREEN,outline=(40,80,50))
def fungus(x,y):
    for dx,dy in [(0,0),(5,3),(-5,2),(2,-4)]:
        dr.ellipse((x+dx-3,y+dy-3,x+dx+3,y+dy+3),fill=(120,230,150,220))
    dr.ellipse((x-12,y-12,x+12,y+12),fill=(120,230,150,40))
def tree(x,y,s=20):
    dr.line((x,y,x,y+s*0.5),fill=(70,54,38),width=4)
    for a in range(-60,61,24):
        dr.line((x,y),fill=(80,62,44),width=3)
        ex=x+math.sin(math.radians(a))*s; ey=y-abs(math.cos(math.radians(a)))*s
        dr.line((x,y,ex,ey),fill=(74,58,42),width=3)
def candle(x,y):
    dr.rectangle((x-2,y-6,x+2,y+2),fill=(220,214,198)); dr.ellipse((x-2,y-10,x+2,y-6),fill=(255,200,110))
def cobweb(cx,cy,q):
    for a in range(0,95,14):
        ang=math.radians(a+q); dr.line((cx,cy,cx+math.cos(ang)*70,cy+math.sin(ang)*70),fill=(200,205,220,120))
    for r in range(18,72,14):
        pts=[(cx+math.cos(math.radians(a+q))*r,cy+math.sin(math.radians(a+q))*r) for a in range(0,92,6)]
        dr.line(pts,fill=(200,205,220,110),width=1)
def fence(a,b,gap=None):
    # dashed thick iron wall with optional doorway gap fraction
    ax,ay=a; bx,by=b; n=int(math.hypot(bx-ax,by-ay)//14)
    for i in range(n):
        t=i/n
        if gap and gap[0]<t<gap[1]: continue
        px=ax+(bx-ax)*t; py=ay+(by-ay)*t
        dr.line((px,py-6,px,py+6),fill=(70,74,92),width=3) if abs(bx-ax)<abs(by-ay) else dr.line((px-6,py,px+6,py),fill=(70,74,92),width=3)
    dr.line((ax,ay,bx,by),fill=(54,58,74,180),width=2)
def label(x,y,txt,col=(210,208,224),sz=17):
    dr.text((x,y),txt,font=font(sz),fill=col)

# ---- path (spawn bottom -> boss top), winding ----
path=[(530,H-70),(530,900),(430,820),(470,700),(560,620),(500,520),(530,430),(530,300),(530,200)]
dr.line(path,fill=(70,60,50,255),width=26)
dr.line(path,fill=(120,104,84,255),width=14)
for i in range(0,len(path)-1):
    pass

# ================= ZONES =================
# --- ENTRY / GATE (bottom) ---
dr.rectangle((470,H-72,590,H-40),outline=(80,84,104),width=2)
dr.arc((470,H-96,590,H-24),200,340,fill=(150,154,172),width=5)      # iron gate arch
dr.line((496,H-70,496,H-42),fill=(70,74,92),width=3); dr.line((520,H-70,520,H-42),fill=(70,74,92),width=3)
dr.line((544,H-70,544,H-42),fill=(70,74,92),width=3); dr.line((566,H-70,566,H-42),fill=(70,74,92),width=3)
label(360,H-58,"SPAWN — IRON GATE",GOLD,18); label(360,H-36,"auto-opens as you approach",(150,200,160),13)

# --- FENCE walls dividing plots (destructible) with doorway gaps ---
fence((x0+8,900),(x1-8,900),gap=(0.44,0.56))     # lower divider
fence((x0+8,640),(x1-8,640),gap=(0.30,0.40))     # mid divider
fence((x0+8,360),(x1-8,360),gap=(0.46,0.58))     # upper divider (into boss)
fence((520,900),(520,640),gap=(0.40,0.55))       # central vertical
label(x1-250,905,"↑ IRON FENCES = destructible walls",(170,150,120),13)

# --- LOWER-WEST: OLD GRAVES (rows) ---
for r in range(3):
    for c in range(4):
        headstone(120+c*70, 760-r*46, 11)
cross(140,700,12); cross(300,660,12)
tree(90,y1-40,22); tree(120,930,20)
label(95,955,"THE OLD GRAVES — headstone & cross rows",STON,15)

# --- LOWER-EAST: monument garden ---
obelisk(760,760,18); obelisk(880,720,16); obelisk(700,700,14)
dr.rectangle((820,780,900,810),fill=(120,124,140),outline=(60,62,78)) # sarcophagus
dr.rectangle((680,800,740,824),fill=(96,74,50),outline=(50,38,26))    # coffin
fungus(940,860); candle(830,760); candle(846,764)
tree(970,900,22)
label(680,950,"MONUMENT GARDEN — obelisks, tomb, coffin",STON,15)

# --- MID crossroads ---
obelisk(530,560,22)
lamp(470,700); lamp(560,620); lamp(500,520)
label(560,556,"crossroads obelisk",(150,154,172),12)

# --- MID-WEST: CRYPT + angel plaza (landmark) ---
crypt(220,470,36); angel(150,540,16); cross(300,500,12)
for c in range(3): headstone(130+c*54,600,10)
candle(240,540); candle(256,544); fungus(150,470)
cobweb(x0+6,y0+40,0)
label(110,430,"THE CRYPT — mausoleum landmark",(200,204,220),15)

# --- MID-EAST: celtic cross shrine + fungus glade ---
cross(820,520,18); dr.ellipse((808,494,832,518),outline=(150,154,172),width=3)  # celtic ring
obelisk(900,480,16); fungus(880,560); fungus(940,600); tree(980,520,22)
for c in range(3): headstone(720+c*54,470,10)
cobweb(x1-6,y0+40,90)
label(720,430,"CELTIC SHRINE + fungus glade",STON,15)

# --- UPPER approach ---
lamp(530,300); cross(430,320,12); cross(630,320,12); headstone(480,300,10); headstone(580,300,10)

# ================= BOSS ARENA (top) =================
dr.ellipse((330,110,730,320),fill=(24,22,30,255),outline=(90,70,110),width=2)
# the open grave (fresh) - center
dr.rectangle((490,190,570,250),fill=(14,12,16),outline=(80,60,50),width=3)
dr.polygon([(560,196),(576,182),(568,206)],fill=(90,70,50))                # dirt mound
dr.ellipse((515,205,545,235),fill=(120,230,150,60))
dr.line((524,214,536,226),fill=GREEN,width=2); dr.line((536,214,524,226),fill=GREEN,width=2)
# ring of tall monuments + candles + fungus
for a in range(0,360,45):
    mx=530+math.cos(math.radians(a))*150; my=215+math.sin(math.radians(a))*80
    obelisk(mx,my,15)
for a in range(20,360,60):
    cx=530+math.cos(math.radians(a))*110; cy=215+math.sin(math.radians(a))*55
    candle(cx,cy)
fungus(400,160); fungus(660,160)
# reaper edge-spawn marker
dr.polygon([(x0+30,150),(x0+18,180),(x0+42,180)],fill=(40,40,52),outline=(150,150,160))
dr.ellipse((x0+24,152,x0+36,164),fill=(60,60,72));
label(x0+8,120,"REAPER spawns",(200,120,120),12); label(x0+8,136,"at map edge",(200,120,120),12)
label(360,86,"BOSS ARENA — THE OPEN GRAVE  (Gravekeeper climbs out)",(220,180,235),17)

# ================= title + legend =================
dr.rectangle((0,0,W,58),fill=(18,16,26))
dr.text((M,15),"THE GRAVEYARD — scene layout",font=font(26),fill=(226,224,238))
# legend panel (bottom-right, over ground, masked)
leg=[("gate / auto-opens",GOLD),("fence — destructible",(120,124,150)),("lamp / candle / fungus = green light",GREEN),("crypt / angel / obelisk = landmarks",STON)]
lw,lh=286,90; lx,ly=730,208
dr.rounded_rectangle((lx,ly,lx+lw,ly+lh),radius=8,fill=(16,15,22,235),outline=(70,66,90,255))
dr.text((lx+12,ly+8),"LEGEND",font=font(13),fill=(190,190,206))
for i,(t,c) in enumerate(leg):
    yy=ly+30+i*15; dr.rectangle((lx+12,yy+1,lx+22,yy+11),fill=c,outline=(40,42,54))
    dr.text((lx+30,yy-1),t,font=font(12),fill=(198,198,214))
img.save("/tmp/graveyard_scene.png"); print("saved scene")
