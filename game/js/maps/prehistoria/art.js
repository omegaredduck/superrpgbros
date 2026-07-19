// ============================================================================
// game/js/maps/prehistoria/art.js — PREHISTORIA (realm 19) hi-fi art.
// Ports of Red's PICKED draws from assets/render/: TAKE-2 real-anatomy dinos
// (#1 RAPTOR · #2 COMPY SWARM · #3 TRICERATOPS · #4 STEGOSAURUS · #5
// PTERODACTYL · #6 DILOPHOSAURUS · #20 BRACHIOSAURUS) + the 6 RECOLOR
// variants (ptero exempt) + THE PRIMORDIAL (dragon160 #10 final params + an
// IGNITED P2 state) + THE HATCH 4 entrance frames + 20 decor + 10 tiles.
// LOST-WORLD mood: fern jungle, tar + bone, an angry volcano sky.
// PORTING GOTCHA kept: body() fills step in DEVICE SPACE (moiré fix at S>160).
// Texture keys are ALL prefixed 'prehistoria*' / 'phtile*' — unique game-wide.
// HEX COLORS ARE 6-DIGIT (RANGER_ART.mix breaks on #abc).
// ============================================================================
(function (root) {
  'use strict';
  var R = (typeof module !== 'undefined' && module.exports) ? require('../../ranger_art.js') : root.RANGER_ART;
  var mix = R.mix, clamp = R.clamp, ell = R.ellipseFill, row = R.rowSpan, stroke = R.stroke, lerp = R.lerp;

  // ---- prehistoria palette (prehistoria_kit.js P, verbatim) -----------------
  var P = {
    OUT: '#0c0e08',
    jungle: '#2e4a20', jungleLt: '#4a7232', jungleDk: '#16260e',
    mud: '#4a3a24', mudLt: '#6e5838', mudDk: '#241a0e',
    tar: '#1a161c', tarLt: '#322c36', tarGloss: '#4a4452',
    ash: '#5a5254', volcano: '#c8452a',
    dinoG: '#5a7a34', dinoGLt: '#86ac54', dinoGDk: '#2c3e16',
    dinoO: '#c87a2e', dinoOLt: '#e8a858', dinoODk: '#6a3c10',
    dinoB: '#4a6a7a', dinoBLt: '#74a0b2', dinoBDk: '#243642',
    dinoR: '#a8442e', dinoRLt: '#d2724e', dinoRDk: '#541e10',
    belly: '#d8c898', bellyDk: '#a89468',
    fur: '#8a6a3e', furLt: '#b2905e', furDk: '#4a3618',
    bone: '#e2d8c0', boneDk: '#8a8268', horn: '#d8ccb0', hornDk: '#6a6048',
    claw: '#e8e0cc', tooth: '#f4eee0',
    amber: '#e8a83a', amberLt: '#ffd478',
    venom: '#8ae83a', venomDk: '#3a7a10',
    fern: '#3e7a2e', fernLt: '#6aac4e',
    skin: '#c89468', skinDk: '#8a5e38',
    night: '#10140a', white: '#f4f2ea', eye: '#e8c83a'
  };

  // ---- shared kit helpers (prehistoria_kit lineage) -------------------------
  function shadow(put, cx, cy, rx, ry) { ell(put, cx, cy, rx, ry, function () { return P.OUT; }); }
  function fern(put, cx, cy, s, c, cLt) {
    for (var a = -1.2; a <= 1.2; a += 0.4) {
      for (var i = 0; i <= 8; i++) {
        var t = i / 8;
        var fx = cx + Math.sin(a) * t * s, fy = cy - Math.cos(a * 0.6) * t * s + t * t * s * 0.25;
        put(Math.round(fx), Math.round(fy), mix(cLt || P.fernLt, c || P.fern, t));
        if (i % 2) { put(Math.round(fx - 1), Math.round(fy), c || P.fern); put(Math.round(fx + 1), Math.round(fy), c || P.fern); }
      }
    }
  }
  function floor(put, S, seed) {
    for (var i = 0; i < 6; i++) {
      var x = ((i * 449 + (seed || 0) * 157) % 1000) / 1000 * S, y = S * 0.86 + ((i * 683) % 1000) / 1000 * S * 0.1;
      put(Math.round(x), Math.round(y), mix(P.fern, P.night, 0.4 + (i % 3) * 0.15));
    }
    for (var j = 0; j < 4; j++) {
      var x2 = ((j * 379 + (seed || 0) * 97) % 1000) / 1000 * S;
      put(Math.round(x2), Math.round(S * 0.1 + (j * 53) % 40), mix('#c8d46a', P.night, 0.6));
    }
  }

  // ---- REAL DINO shape passes (render_dino_shapes.js) -----------------------
  function U(S) { var u = S / 160; return function (v) { return v * u; }; }
  function pw(x, pts) {
    for (var i = 0; i < pts.length - 1; i++) {
      var x0 = pts[i][0], y0 = pts[i][1], x1 = pts[i + 1][0], y1 = pts[i + 1][1];
      if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / Math.max(1, x1 - x0);
    }
    return null;
  }
  // fill a TOP/BOT profile with vertical shading — steps in DEVICE space (no gaps)
  function body(put, X, x0, x1, TOP, BOT, cLt, c, cDk) {
    var u = X(1) - X(0);
    var st = u > 1 ? 1 / u : 1;
    for (var x = x0; x <= x1; x += st) {
      var top = pw(x, TOP), bot = pw(x, BOT);
      if (top == null || bot == null || bot <= top) continue;
      for (var y = top; y <= bot; y += st) {
        var ty = (y - top) / Math.max(1, bot - top);
        var cc = mix(cLt, c, clamp(ty * 1.7, 0, 1));
        cc = mix(cc, cDk, clamp((ty - 0.55) * 1.8, 0, 1));
        put(Math.round(X(x)), Math.round(X(y)), cc);
      }
    }
  }
  function theroLeg(put, X, hx, hy, sc, cLt, c, cDk, far) {
    var K = far ? 0.82 : 1;
    var kx = hx + 9 * sc, ky = hy + 16 * sc;
    var ax = hx + 2 * sc, ay = hy + 30 * sc;
    var fx = hx + 10 * sc, fy = hy + 38 * sc;
    stroke(put, X(hx), X(hy), X(kx), X(ky), X(8 * sc * K), function () { return (far ? cDk : c); });
    stroke(put, X(kx), X(ky), X(ax), X(ay), X(4.4 * sc * K), function () { return (far ? cDk : mix(c, cDk, 0.35)); });
    stroke(put, X(ax), X(ay), X(fx), X(fy), X(3 * sc * K), function () { return (far ? cDk : mix(c, cDk, 0.5)); });
    for (var k = 0; k <= 2; k++) stroke(put, X(fx), X(fy), X(fx + (4 + k * 3) * sc), X(fy + 2 * sc), X(1.6 * sc), function () { return (far ? mix(P.claw, cDk, 0.5) : P.claw); });
    if (!far) { stroke(put, X(fx - 2 * sc), X(fy - 2 * sc), X(fx - 1 * sc), X(fy - 7 * sc), X(2 * sc), function () { return P.claw; }); }
  }
  var mp = function (pts, ox, oy, sc) { return pts.map(function (q) { return [ox + q[0] * sc, oy + q[1] * sc]; }); };

  // ==================== INSECT MOBS + BOSS (2026-07-19 re-theme) ====================
  // ---- palette (6-digit hex; [lo,hi] = shadow,lit) --------------------------
  var B = {
    antrust:['#7a3a1c','#d2864a'], antdark:['#2e3038','#787284'],
    term:['#8a6a44','#e6ce9c'], termHd:['#3a2414','#aa7038'],
    grub:['#a08050','#e8dcb4'], grubHd:['#5a3a1e','#aa7038'],
    wasp:['#6a4e0a','#f4d040'], waspB:'#2a2418',
    horn:['#5a2c0a','#ec8e2a'], hornB:'#331c0c',
    bee:['#6a4a12','#eec048'], beeFz:['#5a4020','#b48a4c'], beeB:'#2c2010',
    mayf:['#5e8060','#dceccc'],
    centi:['#6a281a','#d2643a'], cleg:'#b49a5e',
    milli:['#343a46','#8a94a6'], mleg:'#b48a48',
    // boss
    wbody:['#2e2a38','#5c5468'], wband:['#7a3e14','#e08a34'],
    mFore:['#5a2810','#d2642a'], mHind:['#3a1c0e','#8a3c1c'],
    mBody:['#241410','#5c382a'], mBand:'#f0b446', mGlow:'#fa9632', mEye:'#fadc78',
    coc:['#5a2e14','#c8783a'], cocGlow:'#f0a046', cocFleck:'#ecce78',
    soil:['#3a2a1a','#7a5836'], soilD:'#2a1e12'
  };
  var OUT = '#0c0e08', EYE = '#141018', SHINE = '#f2eede';

  function Xf(S){ return function(v){ return v*S/150; }; }
  function sh(pal){ var lo=pal[0], hi=pal[1]; return function(tx,ty){ var b=mix(hi,lo,clamp(ty*1.12,0,1)); if(tx>0.8) b=mix(b,lo,0.35); if(tx<0.14) b=mix(b,hi,0.4); return b; }; }
  function blob(put,X,cx,cy,rx,ry,pal){ ell(put,X(cx),X(cy),X(rx),X(ry),sh(pal)); }
  function limbline(put,X,pts,w,col){ for(var i=0;i<pts.length-1;i++){ (function(a,b){ stroke(put,X(a[0]),X(a[1]),X(b[0]),X(b[1]),X(w),function(){return col;}); })(pts[i],pts[i+1]); } }
  function shadowE(put,X,cx,cy,rx,ry){ ell(put,X(cx),X(cy),X(rx),X(ry),function(){return OUT;}); }
  function eye(put,X,x,y,r){ ell(put,X(x),X(y),X(r),X(r),function(){return EYE;}); put(Math.round(X(x-r*0.4)),Math.round(X(y-r*0.4)),SHINE); }
  function legs(put,X,hipx,hipy,col,cfg,w){ for(var i=0;i<cfg.length;i++){ var a=cfg[i]; var ar=a[0]*Math.PI/180; var kx=hipx+Math.cos(ar)*a[1], ky=hipy+Math.sin(ar)*a[1]; var a2=ar+a[3]*Math.PI/180; var fx=kx+Math.cos(a2)*a[2], fy=ky+Math.sin(a2)*a[2]; limbline(put,X,[[hipx,hipy],[kx,ky],[fx,fy]],w,col); } }
  function antenna(put,X,hx,hy,col,ang,ln){ var a=(ang-90)*Math.PI/180; var mx=hx+Math.cos(a)*ln*0.6, my=hy+Math.sin(a)*ln*0.6; var tx=mx+Math.cos(a+0.5)*ln*0.5, ty=my+Math.sin(a+0.5)*ln*0.5; limbline(put,X,[[hx,hy],[mx,my],[tx,ty]],1.6,col); }
  function wing(put,X,rx,ry,tx,ty,w,memb,vein){ stroke(put,X(rx),X(ry),X(tx),X(ty),X(w),function(){return memb;}); stroke(put,X(rx),X(ry),X((rx+tx)/2),X((ry+ty)/2),X(1.2),function(){return vein;}); }

  var D = {};   // draws keyed by texture name

  // =============================== 8 MOBS ====================================
  // 4 TERMITE SWARM (three tiny bodies)
  D.termite = function(put,S,f){ var X=Xf(S); var col=B.term, hd=B.termHd;
    function one(x,y,s,fr){ shadowE(put,X,x,y+9*s,15*s,3*s);
      legs(put,X,x-2,y+6*s,mix(col[1],'#000000',0.5),[[75,8*s,9*s, fr?30:45],[105,8*s,9*s,35]],1.6*s);
      blob(put,X,x-9*s,y,11*s,8*s,col); blob(put,X,x+3*s,y-1*s,7*s,6*s,col); blob(put,X,x+12*s,y-2*s,7*s,6*s,hd);
      limbline(put,X,[[x+17*s,y-4*s],[x+23*s,y-6*s]],2*s,mix(hd[1],'#000000',0.3)); eye(put,X,x+13*s,y-3*s,1.5);
    }
    one(58,66,1.0,f); one(96,92,0.85,!f); one(46,102,0.72,f);
  };
  // 10 GOLIATH GRUB (fat C-curve larva)
  D.grub = function(put,S,f){ var X=Xf(S); var col=B.grub, hd=B.grubHd; shadowE(put,X,74,122,40,7);
    var segs=[[46,108],[40,92],[44,78],[56,68],[72,64],[90,66],[104,74],[110,88]];
    for(var i=0;i<segs.length;i++){ var r=15-Math.abs(i-4)*1.4; blob(put,X,segs[i][0],segs[i][1]+(f?(i%2):0),r,r,col); }
    blob(put,X,112,92,11,10,hd);
    limbline(put,X,[[118,96],[124,104]],2.4,mix(hd[1],'#000000',0.2));
    var pl=[[48,110],[58,106],[70,100]]; for(var j=0;j<pl.length;j++) limbline(put,X,[[pl[j][0],pl[j][1]],[pl[j][0]-3,pl[j][1]+7]],2.4,mix(col[0],'#000000',0.2));
    eye(put,X,116,90,1.8);
  };
  // 11 GIANT WASP (diver) — flap frame f
  D.wasp = function(put,S,f){ var X=Xf(S); var col=B.wasp, dk=B.waspB; shadowE(put,X,70,126,24,5);
    var wy=f?70:82; wing(put,X,70,84,40,wy,18,'#dfe4ee', mix('#dfe4ee','#556677',0.5));
    wing(put,X,74,84,54,wy+4,12,'#dfe4ee', mix('#dfe4ee','#556677',0.5));
    legs(put,X,66,104,mix(col[1],'#000000',0.4),[[80,16,20,45],[100,16,20,35],[118,16,22,40]],2.2);
    blob(put,X,46,100,17,13,col);
    for(var i=0;i<3;i++){ var bx=36+i*8; limbline(put,X,[[bx,90],[bx-2,112]],3,dk); }
    limbline(put,X,[[32,110],[26,120]],2,dk);
    blob(put,X,70,94,10,10,col); blob(put,X,88,90,11,10,col);
    limbline(put,X,[[96,88],[104,86]],2.4,dk); eye(put,X,90,88,2.6); antenna(put,X,92,84,dk,-30,16);
  };
  // 12 HORNET (enrager)
  D.hornet = function(put,S,f){ var X=Xf(S); var col=B.horn, dk=B.hornB; shadowE(put,X,70,126,26,5);
    var wy=f?68:82; wing(put,X,70,84,38,wy,20,'#e6dccd', mix('#e6dccd','#554444',0.5));
    wing(put,X,74,84,50,wy+4,15,'#e6dccd', mix('#e6dccd','#554444',0.5));
    legs(put,X,66,106,mix(col[1],'#000000',0.4),[[80,18,22,45],[100,18,22,35],[118,18,24,40]],2.4);
    blob(put,X,46,102,19,14,col);
    for(var i=0;i<3;i++){ var bx=34+i*10; limbline(put,X,[[bx,90],[bx-2,116]],3.2,dk); }
    limbline(put,X,[[30,114],[23,126]],2.4,dk);
    blob(put,X,72,94,11,11,col); blob(put,X,91,88,13,11,col);
    limbline(put,X,[[100,84],[108,82]],2.4,dk); eye(put,X,93,86,3.0); antenna(put,X,95,82,dk,-30,18);
  };
  // 14 HONEY BEE (support)
  D.bee = function(put,S,f){ var X=Xf(S); var col=B.bee, fz=B.beeFz, dk=B.beeB; shadowE(put,X,70,126,24,5);
    var wy=f?66:82; wing(put,X,70,82,46,wy,16,'#e6e8f0', mix('#e6e8f0','#556677',0.5));
    legs(put,X,66,106,mix(col[1],'#000000',0.4),[[80,16,18,45],[100,16,18,35],[118,16,20,40]],2.2);
    blob(put,X,48,102,17,14,col);
    for(var i=0;i<3;i++){ var bx=40+i*10; limbline(put,X,[[bx,90],[bx-1,114]],3,dk); }
    blob(put,X,72,98,14,13,fz); blob(put,X,90,94,11,10,B.antdark);
    eye(put,X,93,92,2.6); antenna(put,X,94,88,dk,-30,15);
  };
  // 15 GIANT MAYFLY (fragile filler)
  D.mayfly = function(put,S,f){ var X=Xf(S); var col=B.mayf; shadowE(put,X,70,124,16,4);
    var wy=f?40:46; wing(put,X,66,76,50,wy,22,'#d2ecd8', mix('#d2ecd8','#66886a',0.5));
    wing(put,X,72,76,84,wy+2,17,'#d2ecd8', mix('#d2ecd8','#66886a',0.5));
    blob(put,X,66,82,7,8,col);
    for(var i=0;i<7;i++) blob(put,X,58-i*6,86,5-i*0.3,4,col);
    var tl=[-4,0,4]; for(var k=0;k<3;k++) limbline(put,X,[[28,88],[10,88+tl[k]]],1.2,mix(col[0],'#000000',0.2));
    legs(put,X,66,86,mix(col[1],'#000000',0.4),[[80,10,12,50],[100,10,12,40]],1.4);
    blob(put,X,80,80,8,7,col); eye(put,X,84,78,3.0); antenna(put,X,86,74,col[0],-20,12);
  };
  // 19 GIANT CENTIPEDE (serpentine) — phase f
  D.centipede = function(put,S,f){ var X=Xf(S); var col=B.centi, lg=B.cleg; shadowE(put,X,74,124,44,5);
    var ph=f?1.6:0.0; var path=[]; for(var i=0;i<13;i++) path.push([20+i*9, 96+Math.sin(i*0.7+ph)*12]);
    for(var i2=0;i2<path.length;i2++) limbline(put,X,[[path[i2][0],path[i2][1]],[path[i2][0],path[i2][1]+16]],1.8,mix(lg,'#000000',0.15));
    for(var i3=0;i3<path.length;i3++){ var r=(i3>1&&i3<11)?8:6; blob(put,X,path[i3][0],path[i3][1],r,r,col); }
    var hx=path[12][0], hy=path[12][1]; blob(put,X,hx+3,hy,9,8,col);
    limbline(put,X,[[hx+9,hy-4],[hx+16,hy-8]],2.4,col[1]); limbline(put,X,[[hx+9,hy+3],[hx+16,hy+2]],2.4,col[1]);
    eye(put,X,hx+5,hy-2,1.8); antenna(put,X,hx+8,hy-5,col[0],-20,16);
  };
  // 20 ARTHROPLEURA (colossus, serpentine)
  D.arthro = function(put,S,f){ var X=Xf(S); var col=B.milli, lg=B.mleg; shadowE(put,X,72,126,54,7);
    var ph=f?1.4:0.0; var path=[]; for(var i=0;i<12;i++) path.push([24+i*10, 96+Math.sin(i*0.45+ph)*4]);
    for(var i2=0;i2<path.length;i2++) limbline(put,X,[[path[i2][0],path[i2][1]+6],[path[i2][0],path[i2][1]+20]],2.4,mix(lg,'#000000',0.15));
    for(var i3=0;i3<path.length;i3++){ var r=(i3>1&&i3<10)?13:10; blob(put,X,path[i3][0],path[i3][1],r,9,col);
      stroke(put,X(path[i3][0]-r),X(path[i3][1]-3),X(path[i3][0]+r),X(path[i3][1]-3),X(1.4),function(){return mix(col[1],'#ffffff',0.2);}); }
    var hx=path[11][0], hy=path[11][1]; blob(put,X,hx+4,hy,11,9,col);
    limbline(put,X,[[hx+11,hy-4],[hx+18,hy-9]],2.4,col[1]); limbline(put,X,[[hx+11,hy+3],[hx+18,hy+1]],2.4,col[1]);
    eye(put,X,hx+6,hy-2,2.0); antenna(put,X,hx+9,hy-6,col[0],-20,16);
  };

  // =============================== BOSS ======================================
  function wormBody(put,X,path,rbase){ var n=path.length;
    for(var i=0;i<n;i++){ var r=rbase; if(i===0)r=rbase*0.6; else if(i===1)r=rbase*0.82;
      var pal=(i%2===0)?B.wband:B.wbody; blob(put,X,path[i][0],path[i][1],r,r,pal); }
    var h=n-1, p=path[h-1], hx=path[h][0], hy=path[h][1];
    var dx=hx-p[0], dy=hy-p[1], dl=Math.hypot(dx,dy)||1; dx/=dl; dy/=dl; var nx=-dy, ny=dx;
    blob(put,X,hx+dx*3,hy+dy*3,12,11,B.wbody);
    for(var s=-1;s<=1;s+=2){ limbline(put,X,[[hx+dx*6+nx*s*4,hy+dy*6+ny*s*4],[hx+dx*10+nx*s*6,hy+dy*10+ny*s*6]],3,B.wband[1]); }
    eye(put,X,hx+dx*4-nx*3,hy+dy*4-ny*3,2.2);
  }
  // WORM (P1) side crawl — serpentine phase f
  D.worm = function(put,S,f){ var X=Xf(S); shadowE(put,X,75,120,40,7);
    var ph=f?0.9:0.0; var path=[]; for(var i=0;i<9;i++) path.push([24+i*13, 96+Math.sin(i*0.5+ph)*6]);
    wormBody(put,X,path,12);
  };
  // COCOON (#6 ribbed + gold flecks) ; f=1 => cracked/glowing (burst beat)
  D.cocoon = function(put,S,crack){ var X=Xf(S); shadowE(put,X,75,124,22,5);
    var top=44,bot=122,w=21,cx=75, pal=B.coc;
    // spindle body via horizontal rows
    for(var y=top;y<=bot;y++){ var t=(y-top)/(bot-top); var ww=w*(1-Math.abs(t-0.45)*0.9); if(ww<=0)continue;
      row(put,Math.round(X(y)),X(cx-ww),X(cx+ww),(function(tt){return function(tx){ var b=mix(pal[1],pal[0],clamp(tt*1.1,0,1)); if(tx>0.8)b=mix(b,pal[0],0.4); if(tx<0.16)b=mix(b,pal[1],0.4); return b; };})(t)); }
    // ridges
    for(var k=0;k<9;k++){ var t2=0.15+k*0.09; var yy=top+(bot-top)*t2, ww2=w*(1-t2*0.45); stroke(put,X(cx-ww2),X(yy),X(cx+ww2),X(yy),X(1.6),function(){return mix(pal[0],'#000000',0.3);}); }
    if(crack){ stroke(put,X(cx),X(top+6),X(cx),X(bot-8),X(3),function(){return '#ffe090';}); stroke(put,X(cx),X(top+6),X(cx),X(bot-8),X(1.2),function(){return '#ffffdc';}); }
    else stroke(put,X(cx),X(top+6),X(cx),X(bot-10),X(1.6),function(){return B.cocGlow;});
    // gold flecks
    var fl=[[70,64],[80,74],[68,90],[82,100],[74,110],[78,58],[72,82]]; for(var g=0;g<fl.length;g++) ell(put,X(fl[g][0]),X(fl[g][1]),X(1.3),X(1.3),function(){return B.cocFleck;});
    stroke(put,X(cx),X(top),X(cx),X(top-8),X(2),function(){return mix(pal[0],'#000000',0.2);});   // cremaster
  };
  // MOTH (P2, ember, top-down spread) — flap frame f
  D.moth = function(put,S,f){ var X=Xf(S); var cx=75; shadowE(put,X,cx,126,30,5);
    var lift=f?6:0;
    function wingPair(pts,pal){ // pts left-side polygon (x,y); mirror to right; fill via bbox rows
      var xs=pts.map(function(p){return p[0];}), ys=pts.map(function(p){return p[1];});
      // draw as stroked fan from thorax to each vertex (approx filled)
      for(var vi=0;vi<pts.length;vi++){ stroke(put,X(cx),X(80-lift),X(pts[vi][0]),X(pts[vi][1]-lift),X(2.2),sh(pal)); stroke(put,X(cx),X(80-lift),X(cx*2-pts[vi][0]),X(pts[vi][1]-lift),X(2.2),sh(pal)); }
    }
    // hindwings (under)
    for(var a=0;a<10;a++){ var t=a/9; var lx=cx-14-t*26, ly=90-lift+Math.sin(t*3.14)*2; ell(put,X(lx),X(ly+t*22),X(9-t*5),X(11-t*5),sh(B.mHind)); ell(put,X(cx*2-lx),X(ly+t*22),X(9-t*5),X(11-t*5),sh(B.mHind)); }
    // forewings (upper, big)
    for(var b=0;b<12;b++){ var t2=b/11; var fx=cx-10-t2*40, fy=66-lift-t2*4; var rr=13-t2*6; ell(put,X(fx),X(fy+t2*18),X(rr),X(rr*1.1),sh(B.mFore)); ell(put,X(cx*2-fx),X(fy+t2*18),X(rr),X(rr*1.1),sh(B.mFore)); }
    // wing bands + eyespots
    for(var sd=-1;sd<=1;sd+=2){ var sx=cx+sd*36; ell(put,X(sx),X(66-lift),X(6),X(6),function(){return B.mBand;}); ell(put,X(sx),X(66-lift),X(3),X(3),function(){return '#f4f4f0';}); ell(put,X(sx),X(66-lift),X(1.4),X(1.4),function(){return '#141018';}); }
    for(var u=0;u<8;u++){ var t3=u/7; ell(put,X(cx-16-t3*20),X(58-lift+t3*4),X(1.4),X(1.4),function(){return B.mGlow;}); ell(put,X(cx+16+t3*20),X(58-lift+t3*4),X(1.4),X(1.4),function(){return B.mGlow;}); }
    // body: furry thorax + segmented abdomen
    blob(put,X,cx,80,10,13,B.mBody);
    for(var i=0;i<6;i++){ blob(put,X,cx,92+i*7,8-i*0.7,5,B.mBody); }
    blob(put,X,cx,66,7,6,B.mBody);
    for(var sd2=-1;sd2<=1;sd2+=2){ var base=[cx+sd2*3,62]; var tip=[cx+sd2*20,44];
      limbline(put,X,[base,tip],2,mix(B.mBody[1],'#000000',0.2));
      for(var tb=1;tb<7;tb++){ var pxx=base[0]+(tip[0]-base[0])*tb/7, pyy=base[1]+(tip[1]-base[1])*tb/7; limbline(put,X,[[pxx,pyy],[pxx+sd2*5,pyy-2]],1,mix(B.mBody[1],'#000000',0.3)); } }
    put(Math.round(X(cx-3)),Math.round(X(66)),EYE); put(Math.round(X(cx+3)),Math.round(X(66)),EYE);
  };

  // ---- DIG-OUT entrance frames (5) ----
  function ground(put,X,hole,mound){ for(var y=118;y<150;y++){ row(put,Math.round(X(y)),X(0),X(150),(function(yy){return function(tx){return mix(B.soil[1],B.soil[0],clamp((yy-118)/24,0,1));};})(y)); }
    if(mound>0){ for(var y2=118-mound;y2<118;y2++){ var t=(118-y2)/mound; var ww=30*(1-t*0.7); row(put,Math.round(X(y2)),X(75-ww),X(75+ww),function(){return mix(B.soil[1],'#ffffff',0.06);}); } }
    if(hole>0){ ell(put,X(75),X(116),X(hole),X(hole*0.4),function(){return '#160f0a';}); } }
  function clods(put,X,arr){ for(var i=0;i<arr.length;i++) ell(put,X(arr[i][0]),X(arr[i][1]),X(arr[i][2]),X(arr[i][2]),sh(B.soil)); }
  D.dig1 = function(put,S){ var X=Xf(S); ground(put,X,0,8);
    var cr=[[[66,116],[70,109],[64,104]],[[84,116],[80,110],[86,105]],[[75,114],[75,102]]]; for(var i=0;i<cr.length;i++) limbline(put,X,cr[i],1.4,B.soilD);
    clods(put,X,[[58,114,3],[92,115,3]]); };
  D.dig2 = function(put,S){ var X=Xf(S); ground(put,X,22,10); clods(put,X,[[50,94,4],[60,84,3],[92,88,4],[100,98,3],[75,78,4],[40,104,3]]);
    wormBody(put,X,[[75,116],[75,104]],12); };
  D.dig3 = function(put,S){ var X=Xf(S); ground(put,X,24,11); clods(put,X,[[52,88,4],[98,84,4],[46,102,3],[104,100,3]]);
    wormBody(put,X,[[75,120],[75,104],[75,88],[75,72],[75,58]],12); };
  D.dig4 = function(put,S){ var X=Xf(S); ground(put,X,24,11); clods(put,X,[[50,98,4],[52,110,3],[104,108,3]]);
    wormBody(put,X,[[72,120],[70,102],[72,84],[82,70],[98,68],[112,78],[118,94]],12); };
  D.dig5 = function(put,S){ var X=Xf(S); ground(put,X,16,8);
    wormBody(put,X,[[30,112],[44,109],[58,110],[72,109],[86,110],[100,109],[112,110]],12); };


  // ============================= DECOR (20) ==================================
  function dFerns(put, S) {
    var X = U(S); floor(put, S, 61); shadow(put, X(80), X(124), X(30), X(5));
    fern(put, X(80), X(110), X(38), P.fern, P.fernLt);
    fern(put, X(52), X(116), X(26), mix(P.fern, P.jungleDk, 0.3), P.fern);
    fern(put, X(110), X(114), X(28), mix(P.fern, P.jungleDk, 0.2), P.fernLt);
    [[44, 100], [118, 96]].forEach(function (q) { for (var a = 0; a < 4.6; a += 0.3) put(Math.round(X(q[0] + Math.cos(a) * (4 - a * 0.5))), Math.round(X(q[1] + Math.sin(a) * (4 - a * 0.5))), P.fernLt); });
  }
  function dCycad(put, S) {
    var X = U(S); floor(put, S, 62); shadow(put, X(80), X(126), X(24), X(5));
    for (var y = 78; y <= 122; y++) { var t = (y - 78) / 44, w = 10 - t * 2; row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (yy) { return function (tx) { return mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((yy % 6) < 3 ? 0.2 : 0), 0, 1)); }; })(y)); }
    for (var y2 = 82; y2 <= 118; y2 += 6) for (var xx = -8; xx <= 8; xx += 4) put(Math.round(X(80 + xx + ((y2 / 6) % 2) * 2)), Math.round(X(y2)), P.mudDk);
    for (var a = -2.9; a <= -0.2; a += 0.22) {
      var px2 = 80, py2 = 78;
      for (var i = 1; i <= 10; i++) {
        var t2 = i / 10;
        var nx = 80 + Math.cos(a) * t2 * 42, ny = 78 + Math.sin(a) * t2 * 26 + t2 * t2 * 14;
        stroke(put, X(px2), X(py2), X(nx), X(ny), X(2.2 * (1 - t2 * 0.5)), (function (tt) { return function () { return mix(P.fernLt, P.jungleDk, tt * 0.6); }; })(t2));
        if (i > 2) { stroke(put, X(nx), X(ny), X(nx - 2), X(ny - 3), X(0.8), function () { return P.fern; }); stroke(put, X(nx), X(ny), X(nx + 1), X(ny - 3.4), X(0.8), function () { return P.fern; }); }
        px2 = nx; py2 = ny;
      }
    }
  }
  function dCanopy(put, S) {
    var X = U(S); floor(put, S, 63); shadow(put, X(80), X(128), X(30), X(5));
    stroke(put, X(80), X(126), X(78), X(70), X(7), function () { return P.mud; });
    stroke(put, X(78), X(88), X(62), X(72), X(3.4), function () { return P.mudDk; });
    stroke(put, X(79), X(80), X(96), X(66), X(3.4), function () { return P.mudDk; });
    [[80, 52, 44, 14], [64, 44, 26, 10], [98, 46, 24, 9], [80, 36, 22, 8]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)); });
      for (var k = 0; k < 7; k++) put(Math.round(X(q[0] - q[2] * 0.7 + k * q[2] * 0.23)), Math.round(X(q[1] - q[3] * 0.4 + (k % 3))), P.fernLt);
    });
    [[52, 58, 20], [104, 56, 24], [86, 60, 16]].forEach(function (q) { for (var i = 0; i <= q[2]; i++) put(Math.round(X(q[0] + Math.sin(i * 0.4) * 1.4)), Math.round(X(q[1] + i)), mix(P.fern, P.jungleDk, 0.3)); });
  }
  function dTar(put, S) {
    var X = U(S); floor(put, S, 64);
    ell(put, X(80), X(102), X(42), X(17), function (tx, ty) { return mix(P.tarLt, P.tar, clamp(tx * 0.9 + ty * 0.7, 0, 1)); });
    ell(put, X(64), X(94), X(11), X(4), function () { return P.tarGloss; });
    for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 43)), Math.round(X(102 + Math.sin(a) * 18)), mix(P.mud, P.mudDk, (Math.sin(a * 4) + 1) / 2));
    [[68, 106], [94, 108], [82, 98]].forEach(function (q) { for (var a2 = 0; a2 < 6.28; a2 += 0.5) put(Math.round(X(q[0] + Math.cos(a2) * 3)), Math.round(X(q[1] + Math.sin(a2) * 1.8)), P.tarGloss); });
    for (var kk = 0; kk < 4; kk++) { var rx = 92 + kk * 5; for (var ar = 3.4; ar <= 5.4; ar += 0.1) put(Math.round(X(rx + Math.cos(ar) * 8)), Math.round(X(102 + Math.sin(ar) * 9)), mix(P.bone, P.boneDk, kk * 0.15)); }
    stroke(put, X(58), X(100), X(54), X(90), X(2.4), function () { return P.horn; });
    ell(put, X(46), X(104), X(5), X(3.4), function (tx, ty) { return mix(P.bone, P.boneDk, tx); }); put(Math.round(X(45)), Math.round(X(103)), P.night);
  }
  function dVent(put, S) {
    var X = U(S); floor(put, S, 65);
    var vx = 40, vy = 118;
    [[18, -6], [14, -2], [20, 4], [16, -4], [18, 2]].forEach(function (q) { stroke(put, X(vx), X(vy), X(vx + q[0]), X(vy + q[1]), X(3), function () { return P.night; }); stroke(put, X(vx + 1), X(vy + 1), X(vx + q[0]), X(vy + q[1] + 1), X(1.4), function () { return P.volcano; }); vx += q[0]; vy += q[1]; });
    for (var i = 0; i <= 20; i++) put(Math.round(X(42 + i * 4)), Math.round(X(117 + Math.sin(i) * 3)), mix(P.volcano, '#ffd24a', (i % 3) / 3));
    [[60, 108], [96, 104]].forEach(function (q) {
      for (var i2 = 0; i2 <= 12; i2++) { var t = i2 / 12; ell(put, X(q[0] + Math.sin(t * 5) * 4), X(q[1] - t * 60), X(3 + t * 7), X(2.4 + t * 4), (function (tt) { return function (tx) { return mix('#6a6266', '#2e2a2c', clamp(0.3 + tt * 0.5 + tx * 0.2, 0, 1)); }; })(t)); }
    });
    [[70, 60], [88, 44], [58, 36]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), P.volcano); });
    [[38, 124, 6], [116, 120, 8]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[2] * 0.6), function (tx, ty) { return mix('#4a4246', '#221e20', tx + ty * 0.4); }); });
  }
  function dNest(put, S) {
    var X = U(S); floor(put, S, 66); shadow(put, X(80), X(122), X(34), X(5));
    for (var a = 0; a < 6.28; a += 0.04) {
      var rr = 30 + Math.sin(a * 7) * 2;
      for (var w = 0; w < 7; w++) put(Math.round(X(80 + Math.cos(a) * (rr - w))), Math.round(X(104 + Math.sin(a) * (rr - w) * 0.45 - w * 0.8)), mix(P.mudLt, P.mudDk, (w / 7) * 0.7 + (Math.sin(a * 13) + 1) / 6));
    }
    for (var kk = 0; kk < 14; kk++) { var a2 = kk / 14 * 6.28; stroke(put, X(80 + Math.cos(a2) * 28), X(104 + Math.sin(a2) * 12), X(80 + Math.cos(a2) * 34), X(104 + Math.sin(a2) * 15), X(1), function () { return P.belly; }); }
    [[68, 98, 7, 9], [82, 96, 7.4, 9.4], [94, 100, 6.4, 8.4]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix(P.white, P.bellyDk, clamp(tx + ty * 0.4 - 0.25, 0, 1)); });
      put(Math.round(X(q[0] - 2)), Math.round(X(q[1] - 2)), P.bellyDk); put(Math.round(X(q[0] + 2)), Math.round(X(q[1] + 3)), P.bellyDk);
    });
    stroke(put, X(90), X(94), X(96), X(97), X(0.9), function () { return P.mudDk; });
    stroke(put, X(96), X(97), X(93), X(100), X(0.9), function () { return P.mudDk; });
  }
  function dRibcage(put, S) {
    var X = U(S); floor(put, S, 67); shadow(put, X(80), X(126), X(44), X(5));
    stroke(put, X(18), X(74), X(142), X(82), X(4), function () { return P.bone; });
    [[24], [40], [56], [72], [88], [104], [120]].forEach(function (q, i) {
      for (var a = -1.5; a <= 0.2; a += 0.04) {
        var rx = q[0] + Math.cos(a) * (26 - i * 1.2) * 0.5 + 6, ry = 78 + (i % 2) + Math.sin(a) * -(30 - i * 1.4);
        put(Math.round(X(rx)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6));
        put(Math.round(X(rx + 1)), Math.round(X(ry + 32)), mix(P.bone, P.boneDk, Math.abs(a) / 1.6 + 0.2));
      }
    });
    ell(put, X(146), X(94), X(11), X(8), function (tx, ty) { return mix(P.bone, P.boneDk, clamp(tx + ty * 0.5 - 0.2, 0, 1)); });
    ell(put, X(143), X(92), X(2.6), X(3), function () { return P.night; });
    row(put, Math.round(X(99)), X(140), X(156), function () { return P.boneDk; });
    [[40, 48], [88, 46]].forEach(function (q) { for (var i = 0; i <= 10; i++) put(Math.round(X(q[0] + Math.sin(i * 0.5) * 2)), Math.round(X(q[1] + i * 2)), P.fern); });
  }
  function dAmber(put, S) {
    var X = U(S); floor(put, S, 68); shadow(put, X(80), X(122), X(24), X(5));
    ell(put, X(80), X(116), X(26), X(8), function (tx, ty) { return mix('#5a5246', '#2a2620', tx + ty * 0.4); });
    for (var y = 66; y <= 112; y++) {
      var t = (y - 66) / 46;
      var w = 20 * Math.sin(t * 2.6 + 0.3) + 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (tt) { return function (tx) { return mix(P.amberLt, mix(P.amber, '#8a5410', 0.5), clamp(Math.abs(tx - 0.35) * 1.3 + tt * 0.3, 0, 1)); }; })(t));
    }
    ell(put, X(70), X(78), X(6), X(9), function () { return mix(P.amberLt, P.white, 0.4); });
    ell(put, X(84), X(92), X(6), X(4.4), function () { return '#3a2a10'; });
    stroke(put, X(78), X(90), X(74), X(86), X(1), function () { return '#3a2a10'; });
    stroke(put, X(78), X(94), X(73), X(96), X(1), function () { return '#3a2a10'; });
    stroke(put, X(90), X(90), X(95), X(86), X(1), function () { return '#3a2a10'; });
    for (var kk = 0; kk < 5; kk++) { var a = kk / 5 * 6.28; stroke(put, X(80 + Math.cos(a) * 10), X(88 + Math.sin(a) * 12), X(80 + Math.cos(a) * 16), X(88 + Math.sin(a) * 18), X(0.8), function () { return mix(P.amberLt, P.amber, 0.4); }); }
  }
  function dBoulders(put, S) {
    var X = U(S); floor(put, S, 69); shadow(put, X(80), X(126), X(40), X(6));
    [[56, 100, 24, 18], [96, 106, 20, 14], [124, 98, 12, 10], [36, 112, 12, 8]].forEach(function (q) {
      var bx = q[0], by = q[1], bw = q[2], bh = q[3];
      ell(put, X(bx), X(by), X(bw), X(bh), function (tx, ty) { return mix('#8a8276', '#423e36', clamp(tx * 1.05 + ty * 0.6 - 0.2, 0, 1)); });
      for (var mx = -bw * 0.8; mx <= bw * 0.8; mx += 2) { var my = by - bh * Math.sqrt(Math.max(0, 1 - Math.pow(mx / bw, 2))) + 1; put(Math.round(X(bx + mx)), Math.round(X(my)), mix(P.fernLt, P.fern, (Math.abs(mx) / bw))); put(Math.round(X(bx + mx)), Math.round(X(my + 1)), P.fern); }
      stroke(put, X(bx - bw * 0.3), X(by - 2), X(bx - bw * 0.1), X(by + bh * 0.4), X(0.9), function () { return '#423e36'; });
    });
    fern(put, X(140), X(120), X(10));
  }
  function dReeds(put, S) {
    var X = U(S); floor(put, S, 70);
    for (var x = 0; x < S; x++) { var yy = 0.82 * S + Math.sin(x / S * 6) * 1.4; for (var y = yy; y < Math.min(S, yy + 0.1 * S); y++) put(x, Math.round(y), mix('#3a6a7a', P.night, 0.4 + (y - yy) / (0.1 * S) * 0.4)); }
    [[40, 44, 1], [56, 30, 1.2], [72, 38, 1.1], [88, 26, 1.3], [104, 40, 1], [120, 34, 1.15]].forEach(function (q) {
      var rx = q[0], topY = q[1], w = q[2];
      for (var y2 = topY; y2 <= 128; y2 += 5) {
        stroke(put, X(rx + Math.sin(y2 * 0.05) * 2), X(y2), X(rx + Math.sin((y2 + 5) * 0.05) * 2), X(Math.min(128, y2 + 5)), X(2 * w), (function (yy) { return function () { return mix('#6a9a4a', '#2e4a1e', (yy % 10) < 5 ? 0.2 : 0.45); }; })(y2));
        put(Math.round(X(rx + Math.sin(y2 * 0.05) * 2 - 2 * w)), Math.round(X(y2)), '#8ac86a');
      }
      for (var i = 0; i <= 4; i++) row(put, Math.round(X(topY - 5 + i)), X(rx - i * 0.6), X(rx + i * 0.6), (function (ii) { return function () { return mix('#a8843a', '#6a5018', ii / 5); }; })(i));
    });
  }
  function dLog(put, S) {
    var X = U(S); floor(put, S, 71); shadow(put, X(80), X(124), X(44), X(6));
    for (var x = 28; x <= 132; x++) {
      var t = (x - 28) / 104;
      for (var y = 92 - 14 + Math.sin(t * 8) * 1; y <= 92 + 14; y++) put(Math.round(X(x)), Math.round(X(y)), mix(P.mudLt, P.mudDk, clamp((y - 78) / 28 * 1.1 + ((x % 9) < 1 ? 0.2 : 0), 0, 1)));
    }
    ell(put, X(30), X(92), X(7), X(13), function (tx) { return mix('#1c1208', '#0a0602', tx); });
    for (var rr = 3; rr <= 12; rr += 3) { for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(132 + Math.cos(a) * rr * 0.5)), Math.round(X(92 + Math.sin(a) * rr)), mix(P.belly, P.mudDk, rr / 14)); }
    stroke(put, X(60), X(78), X(56), X(66), X(3.4), function () { return P.mudDk; });
    stroke(put, X(100), X(78), X(106), X(70), X(3), function () { return P.mudDk; });
    for (var mx = 40; mx <= 90; mx += 6) put(Math.round(X(mx)), Math.round(X(79 + (mx % 3))), P.fern);
    put(Math.round(X(28)), Math.round(X(90)), P.eye); put(Math.round(X(32)), Math.round(X(90)), P.eye);
  }
  function dTermite(put, S) {
    var X = U(S); floor(put, S, 72); shadow(put, X(80), X(128), X(26), X(5));
    [[80, 30, 14], [62, 62, 9], [98, 58, 8]].forEach(function (q) {
      var tx2 = q[0], topY = q[1], w = q[2];
      for (var y = topY; y <= 124; y++) {
        var t = (y - topY) / (124 - topY);
        var ww = w * (0.4 + t * 0.8) + Math.sin(y * 0.4) * 1.4;
        row(put, Math.round(X(y)), X(tx2 - ww), X(tx2 + ww), (function (yy) { return function (tx) { return mix(P.mudLt, P.mudDk, clamp(tx * 1.2 + ((yy % 7) < 2 ? 0.18 : 0), 0, 1)); }; })(y));
      }
    });
    [[76, 70], [86, 92], [70, 104], [92, 112], [80, 48]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(2.4), X(3), function () { return '#1c1208'; }); });
    for (var i = 0; i <= 12; i++) put(Math.round(X(96 + i * 3)), Math.round(X(120 + Math.sin(i) * 2)), '#c8b490');
  }
  function dGinkgo(put, S) {
    var X = U(S); floor(put, S, 73); shadow(put, X(80), X(128), X(28), X(5));
    stroke(put, X(80), X(126), X(82), X(66), X(6), function () { return '#6a5a3a'; });
    stroke(put, X(81), X(90), X(64), X(74), X(3), function () { return '#5a4a2e'; });
    stroke(put, X(82), X(78), X(100), X(64), X(3), function () { return '#5a4a2e'; });
    [[80, 48, 36, 13], [62, 56, 20, 9], [102, 54, 20, 9]].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), function (tx, ty) { return mix('#e8c848', '#8a6a14', clamp(tx * 0.9 + ty * 0.7 - 0.2, 0, 1)); });
    });
    for (var kk = 0; kk < 12; kk++) { var lx = 52 + (kk * 41) % 58, ly = 42 + (kk * 23) % 20; stroke(put, X(lx), X(ly), X(lx - 2), X(ly - 3), X(1), function () { return '#ffe89a'; }); stroke(put, X(lx), X(ly), X(lx + 2), X(ly - 3), X(1), function () { return '#ffe89a'; }); }
    [[46, 84], [116, 78], [98, 100], [60, 106]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), '#ffd868'); put(Math.round(X(q[0] + 1)), Math.round(X(q[1] + 1)), '#c8a030'); });
  }
  function dSkullRock(put, S) {
    var X = U(S); floor(put, S, 74); shadow(put, X(80), X(130), X(40), X(6));
    for (var y = 52; y <= 124; y++) {
      var t = (y - 52) / 72;
      var w = 36 * (1 - Math.abs(t - 0.35) * 0.8) + 6;
      row(put, Math.round(X(y)), X(78 - w), X(78 + w), (function (tt) { return function (tx) { return mix('#b0a890', '#4a4436', clamp(tx * 1.15 + tt * 0.3, 0, 1)); }; })(t));
    }
    ell(put, X(62), X(76), X(9), X(11), function () { return '#0e0c06'; });
    ell(put, X(94), X(76), X(9), X(11), function () { return '#0e0c06'; });
    put(Math.round(X(94)), Math.round(X(78)), P.eye);
    ell(put, X(78), X(96), X(6), X(8), function () { return '#1c1810'; });
    for (var tx2 = 48; tx2 <= 108; tx2 += 8) { for (var i = 0; i <= 6; i++) row(put, Math.round(X(118 + i)), X(tx2 - (3 - i * 0.4)), X(tx2 + (3 - i * 0.4)), (function (ii) { return function () { return mix(P.bone, P.boneDk, ii / 7); }; })(i)); }
    stroke(put, X(70), X(56), X(76), X(70), X(1), function () { return '#4a4436'; });
    stroke(put, X(96), X(60), X(90), X(72), X(1), function () { return '#4a4436'; });
    for (var iv = 0; iv <= 12; iv++) put(Math.round(X(48 + Math.sin(iv * 0.5) * 2)), Math.round(X(60 + iv * 3)), P.fern);
  }
  function dGeyser(put, S) {
    var X = U(S); floor(put, S, 75);
    [[80, 112, 34, 10, '#7ac8c0'], [80, 100, 22, 6, '#9ae0d8'], [80, 92, 12, 4, '#c8f0ea']].forEach(function (q) {
      ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), (function (cc) { return function (tx, ty) { return mix(cc, '#2e5a54', clamp(tx + ty * 0.5 - 0.2, 0, 1)); }; })(q[4]));
      for (var a = 0; a < 6.28; a += 0.08) put(Math.round(X(q[0] + Math.cos(a) * q[2])), Math.round(X(q[1] + Math.sin(a) * q[3])), mix('#d8d0b8', '#8a8268', (Math.sin(a * 5) + 1) / 2));
    });
    for (var i = 0; i <= 24; i++) { var t = i / 24; var w = 3 - t * 1 + Math.sin(t * 9) * 1; row(put, Math.round(X(88 - t * 62)), X(80 - w), X(80 + w), (function (tt) { return function (tx) { return mix('#e8f8f4', '#8ac8c0', clamp(tx + tt * 0.3, 0, 1)); }; })(t)); }
    [[70, 30], [92, 24], [80, 14]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(7), X(4.4), function (tx, ty) { return mix('#d8e8e4', '#7a9a96', clamp(0.3 + tx * 0.3 + ty * 0.3, 0, 1)); }); });
    [[64, 52], [96, 46], [58, 70]].forEach(function (q) { put(Math.round(X(q[0])), Math.round(X(q[1])), '#c8f0ea'); });
  }
  function dConifer(put, S) {
    var X = U(S); floor(put, S, 76); shadow(put, X(80), X(130), X(22), X(4));
    stroke(put, X(80), X(128), X(80), X(30), X(4.4), function () { return '#5a4228'; });
    [[36, 26], [50, 22], [64, 18], [78, 14], [92, 10]].forEach(function (q) {
      [[-1], [1]].forEach(function (s2) {
        var sd = s2[0], px2 = 80, py2 = q[0];
        for (var i = 1; i <= 6; i++) { var t = i / 6; var nx = 80 + sd * t * q[1], ny = q[0] + Math.sin(t * 2.6) * 5; stroke(put, X(px2), X(py2), X(nx), X(ny), X(2 * (1 - t * 0.5)), (function (tt) { return function () { return mix(P.jungle, P.jungleDk, tt * 0.4); }; })(t)); px2 = nx; py2 = ny; }
        ell(put, X(px2), X(py2), X(4.4), X(3), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, tx + ty * 0.4); });
      });
    });
    ell(put, X(80), X(26), X(5), X(4), function (tx, ty) { return mix(P.jungleLt, P.jungleDk, ty); });
    [[70, 40], [92, 52]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(2.4), X(3.4), function (tx, ty) { return mix(P.mudLt, P.mudDk, tx + ty * 0.3); }); });
  }
  function dWallow(put, S) {
    var X = U(S); floor(put, S, 77);
    ell(put, X(80), X(104), X(44), X(18), function (tx, ty) { return mix('#a89068', '#5a4a2e', clamp(tx * 0.9 + ty * 0.6, 0, 1)); });
    [[52, 96, 62, 102], [98, 94, 108, 100], [64, 114, 74, 112], [96, 112, 104, 116]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(0.9), function () { return '#42351c'; }); });
    ell(put, X(80), X(104), X(26), X(10), function (tx, ty) { return mix(P.mudLt, P.mudDk, clamp(tx + ty * 0.5, 0, 1)); });
    ell(put, X(72), X(100), X(8), X(3), function () { return mix(P.mudLt, '#c8b490', 0.4); });
    [[34, 124, 0.9], [52, 116, 1], [70, 110, 1.1]].forEach(function (q) {
      [[-3, 0], [0, -2], [3, 0]].forEach(function (o) { ell(put, X(q[0] + o[0] * q[2]), X(q[1] + o[1] * q[2]), X(1.8 * q[2]), X(2.6 * q[2]), function () { return '#42351c'; }); });
      ell(put, X(q[0]), X(q[1] + 3 * q[2]), X(2.6 * q[2]), X(2 * q[2]), function () { return '#42351c'; });
    });
    stroke(put, X(96), X(98), X(106), X(96), X(2), function () { return P.dinoGDk; });
    for (var a = 0; a < 6.28; a += 0.3) put(Math.round(X(84 + Math.cos(a) * 12)), Math.round(X(106 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, 0.5));
  }
  function dBloom(put, S) {
    var X = U(S); floor(put, S, 78); shadow(put, X(80), X(126), X(22), X(4));
    stroke(put, X(80), X(124), X(78), X(84), X(3.4), function () { return '#3e6a2a'; });
    [[64, 104], [94, 100]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(9), X(4), function (tx, ty) { return mix(P.fernLt, P.fern, tx + ty * 0.3); }); });
    for (var kk = 0; kk < 8; kk++) {
      var a = kk / 8 * 6.28;
      for (var i = 0; i <= 10; i++) {
        var t = i / 10;
        ell(put, X(78 + Math.cos(a) * t * 22), X(74 + Math.sin(a) * t * 14 - t * 4), X(6 * (1 - t * 0.4)), X(4 * (1 - t * 0.4)), (function (tt) { return function (tx, ty) { return mix('#f0d8e8', '#b06a9a', clamp(tt * 0.7 + tx * 0.3, 0, 1)); }; })(t));
      }
    }
    ell(put, X(78), X(70), X(7), X(5), function (tx, ty) { return mix(P.amberLt, P.amber, tx + ty * 0.4); });
    for (var a2 = 0; a2 < 6.28; a2 += 0.7) put(Math.round(X(78 + Math.cos(a2) * 4)), Math.round(X(69 + Math.sin(a2) * 2.6)), '#8a5410');
    stroke(put, X(84), X(78), X(85), X(86), X(1), function () { return mix(P.amberLt, P.white, 0.3); });
    put(Math.round(X(98)), Math.round(X(58)), '#c8e8f0'); put(Math.round(X(100)), Math.round(X(57)), '#c8e8f0');
  }
  function dCrater(put, S) {
    var X = U(S); floor(put, S, 79);
    ell(put, X(80), X(106), X(38), X(15), function (tx, ty) { return mix('#3a3234', '#141012', clamp(Math.abs(tx - 0.5) * -1.4 + 1 + ty * 0.3, 0, 1)); });
    for (var a = 0; a < 6.28; a += 0.06) { var rr = 39 + Math.sin(a * 6) * 2; put(Math.round(X(80 + Math.cos(a) * rr)), Math.round(X(106 + Math.sin(a) * (rr * 0.42))), mix('#6a5a4a', '#2e2620', (Math.sin(a * 3) + 1) / 2)); }
    ell(put, X(80), X(104), X(12), X(8), function (tx, ty) { return mix('#5a4a52', '#241e22', clamp(tx + ty * 0.5 - 0.2, 0, 1)); });
    [[74, 100, 80, 106], [84, 100, 88, 106], [78, 108, 84, 104]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(1), function () { return P.volcano; }); });
    put(Math.round(X(78)), Math.round(X(103)), '#ffd24a');
    for (var i = 0; i <= 10; i++) put(Math.round(X(84 + Math.sin(i * 0.6) * 3)), Math.round(X(94 - i * 4)), mix('#6a6266', P.night, 0.4 + i * 0.05));
    [[38, 92, 3], [122, 96, 4], [50, 124, 2.4], [114, 124, 3]].forEach(function (q) { ell(put, X(q[0]), X(q[1]), X(q[2]), X(q[2] * 0.7), function (tx, ty) { return mix('#5a4a52', '#241e22', tx); }); });
    [[30, 16, 44, 26], [104, 10, 116, 20], [70, 8, 78, 15]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[2]), X(q[3]), X(1.4), function () { return P.volcano; }); put(Math.round(X(q[2] + 1)), Math.round(X(q[3] + 1)), '#ffd24a'); });
  }
  function dRoost(put, S) {
    var X = U(S); floor(put, S, 80); shadow(put, X(80), X(132), X(24), X(5));
    for (var y = 28; y <= 128; y++) {
      var t = (y - 28) / 100;
      var w = 10 + t * 8 + Math.sin(y * 0.3) * 2;
      row(put, Math.round(X(y)), X(80 - w), X(80 + w), (function (yy) { return function (tx) { return mix('#8a8276', '#3a362e', clamp(tx * 1.25 + ((yy % 11) < 2 ? 0.2 : 0), 0, 1)); }; })(y));
    }
    [[64, 60], [96, 84], [68, 100]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[0] + (q[0] < 80 ? -8 : 8)), X(q[1] + 2), X(2.4), function () { return '#5a544a'; }); });
    for (var a = 0; a < 6.28; a += 0.1) put(Math.round(X(80 + Math.cos(a) * 13)), Math.round(X(26 + Math.sin(a) * 4)), mix(P.mudLt, P.mudDk, (Math.sin(a * 9) + 1) / 2));
    ell(put, X(80), X(20), X(5), X(3.4), function (tx, ty) { return mix('#6a4a3a', '#2e1c14', ty); });
    stroke(put, X(84), X(18), X(92), X(12), X(1.8), function () { return '#2e1c14'; });
    stroke(put, X(76), X(18), X(70), X(13), X(1.6), function () { return '#2e1c14'; });
    stroke(put, X(78), X(15), X(72), X(11), X(1.2), function () { return '#4a3226'; });
    [[70, 34], [88, 40]].forEach(function (q) { stroke(put, X(q[0]), X(q[1]), X(q[0] + 1), X(q[1] + 12), X(1.6), function () { return mix(P.white, '#8a8268', 0.3); }); });
  }

  // ============================== TILES (10) =================================
  function h2t(ix, iy, seed) { var s = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); }
  function sn(x, y, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    var a = h2t(ix, iy, seed), b = h2t(ix + 1, iy, seed), c = h2t(ix, iy + 1, seed), d = h2t(ix + 1, iy + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function printStamp(put, cx, cy, sc, ang, c) {
    var ca = Math.cos(ang), sa = Math.sin(ang);
    var T = function (ox, oy) { return [cx + ox * ca - oy * sa, cy + ox * sa + oy * ca]; };
    [[-3, -2], [0, -3.4], [3, -2]].forEach(function (q) { var pp = T(q[0] * sc, q[1] * sc); ell(put, pp[0], pp[1], 1.6 * sc, 2.4 * sc, function () { return c; }); });
    var h = T(0, 1.4 * sc); ell(put, h[0], h[1], 2.2 * sc, 1.8 * sc, function () { return c; });
  }
  function tJungle(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 20, y / 20, 81) * 0.6 + sn(x / 6, y / 6, 82) * 0.4;
      put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 22; k++) {
      var gx = h2t(k, 3, 83) * S, gy = h2t(k, 7, 83) * S;
      stroke(put, gx, gy, gx + (h2t(k, 11, 83) - 0.5) * 3, gy - 3, 0.8, (function (kk) { return function () { return mix('#7aa04a', '#2e4a1e', h2t(kk, 13, 83)); }; })(k));
    }
    [[0.3, 0.7], [0.75, 0.25]].forEach(function (q) { put(Math.round(q[0] * S), Math.round(q[1] * S), '#c8d46a'); });
  }
  function tMud(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 24, y / 24, 84) * 0.65 + sn(x / 8, y / 8, 85) * 0.35;
      put(x, y, mix(P.mudLt, P.mudDk, clamp(n * 1.25, 0, 1)));
    }
    printStamp(put, S * 0.28, S * 0.3, S * 0.02, 0.4, '#241a0e');
    printStamp(put, S * 0.55, S * 0.52, S * 0.02, 0.6, '#241a0e');
    printStamp(put, S * 0.78, S * 0.76, S * 0.02, 0.5, '#241a0e');
    printStamp(put, S * 0.35, S * 0.8, S * 0.014, -1.2, '#2e2212');
  }
  function tFernMeadow(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 16, y / 16, 86) * 0.55 + sn(x / 5, y / 5, 87) * 0.45;
      put(x, y, mix('#5a8a3a', '#26421a', clamp(n * 1.25, 0, 1)));
    }
    for (var k = 0; k < 12; k++) {
      var fx = h2t(k, 17, 88) * S, fy = h2t(k, 19, 88) * S;
      for (var a = 0; a < 3.6; a += 0.4) put(Math.round(fx + Math.cos(a) * (3 - a * 0.5)), Math.round(fy + Math.sin(a) * (3 - a * 0.5)), '#8ac86a');
    }
  }
  function tRiverbed(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 18, y / 18, 89);
      put(x, y, mix('#8a8276', '#42403a', clamp(n * 1.2, 0, 1)));
    }
    for (var k = 0; k < 16; k++) {
      var px2 = h2t(k, 23, 90) * S, py2 = h2t(k, 29, 90) * S, pr = 3 + h2t(k, 31, 90) * 6;
      ell(put, px2, py2, pr, pr * 0.7, function (tx, ty) { return mix('#a89a86', '#4a443a', clamp(tx * 1.1 + ty * 0.6 - 0.2, 0, 1)); });
    }
  }
  function tAsh(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 26, y / 26, 91) * 0.6 + sn(x / 9, y / 9, 92) * 0.4;
      put(x, y, mix('#6a6266', '#2e2a2c', clamp(n * 1.3, 0, 1)));
    }
    [[0.2, 0.4], [0.66, 0.2], [0.8, 0.7], [0.4, 0.85]].forEach(function (q, i) { put(Math.round(q[0] * S), Math.round(q[1] * S), i % 2 ? P.volcano : '#ffd24a'); });
    var cx2 = S * 0.1, cy2 = S * 0.6;
    for (var i2 = 0; i2 < 8; i2++) { var nx = cx2 + 8 + h2t(i2, 37, 93) * 6, ny = cy2 + (h2t(i2, 41, 93) - 0.5) * 10; stroke(put, cx2, cy2, nx, ny, 1, (function (ii) { return function () { return mix(P.volcano, '#8a2808', h2t(ii, 43, 93)); }; })(i2)); cx2 = nx; cy2 = ny; }
  }
  function tTarSeep(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 22, y / 22, 94) * 0.6 + sn(x / 7, y / 7, 95) * 0.4;
      var c = mix(P.mud, P.mudDk, clamp(n * 1.2, 0, 1));
      if (n > 0.72) c = mix(P.tarLt, P.tar, (n - 0.72) * 3);
      put(x, y, c);
    }
    [[0.3, 0.35], [0.7, 0.62]].forEach(function (q) { for (var a = 0; a < 6.28; a += 0.5) put(Math.round(q[0] * S + Math.cos(a) * 2.4), Math.round(q[1] * S + Math.sin(a) * 1.4), P.tarGloss); });
  }
  function tBoneField(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 20, y / 20, 96) * 0.7 + sn(x / 6, y / 6, 97) * 0.3;
      put(x, y, mix('#5a4a3a', '#241c12', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 8; k++) {
      var bx = h2t(k, 47, 98) * S, by = h2t(k, 53, 98) * S, a = h2t(k, 59, 98) * 6.28, ln = 4 + h2t(k, 61, 98) * 8;
      stroke(put, bx, by, bx + Math.cos(a) * ln, by + Math.sin(a) * ln, 1.6, (function (kk) { return function () { return mix(P.bone, P.boneDk, h2t(kk, 67, 98) * 0.5); }; })(k));
      ell(put, bx, by, 1.4, 1.4, function () { return P.boneDk; });
    }
    ell(put, S * 0.7, S * 0.3, S * 0.04, S * 0.034, function (tx, ty) { return mix(P.bone, P.boneDk, tx + ty * 0.4); });
    put(Math.round(S * 0.685), Math.round(S * 0.295), '#241c12');
  }
  function tTrail(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var band = Math.abs(y - S * 0.5 - Math.sin(x / S * 6.28) * S * 0.08);
      var n = sn(x / 18, y / 18, 99) * 0.5 + sn(x / 6, y / 6, 100) * 0.5;
      if (band < S * 0.22) put(x, y, mix('#a8906a', '#5a4a2e', clamp(n * 1.1 + band / (S * 0.3), 0, 1)));
      else put(x, y, mix('#4a6a30', '#1e3212', clamp(n * 1.25, 0, 1)));
    }
    for (var k = 0; k < 7; k++) {
      var tx2 = (k + 0.5) / 7 * S, ty2 = S * 0.5 + Math.sin(tx2 / S * 6.28) * S * 0.08 + (h2t(k, 71, 101) - 0.5) * S * 0.16;
      printStamp(put, tx2, ty2, S * 0.013 + h2t(k, 73, 101) * S * 0.008, h2t(k, 79, 101) * 1.2 - 0.6 + 1.57, '#42351c');
    }
  }
  function tSwamp(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var flow = sn(x / 26 + y / 70, y / 18, 102) * 0.6 + sn(x / 8, y / 8, 103) * 0.4;
      var c = mix('#3a5a4a', '#122018', clamp(flow * 1.3, 0, 1));
      if (flow > 0.76) c = mix(c, '#7aa886', 0.5);
      put(x, y, c);
    }
    [[0.25, 0.3, 6], [0.68, 0.6, 8], [0.85, 0.18, 5]].forEach(function (q) {
      ell(put, q[0] * S, q[1] * S, q[2], q[2] * 0.7, function (tx, ty) { return mix('#5a8a4a', '#2a4a22', clamp(tx + ty * 0.4 - 0.2, 0, 1)); });
      stroke(put, q[0] * S, q[1] * S, q[0] * S + q[2] * 0.8, q[1] * S - q[2] * 0.3, 1, function () { return '#122018'; });
    });
    for (var a = 0; a < 6.28; a += 0.4) put(Math.round(S * 0.45 + Math.cos(a) * 4), Math.round(S * 0.8 + Math.sin(a) * 2.4), '#7aa886');
  }
  function tCrater(put, S) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = sn(x / 24, y / 24, 104) * 0.6 + sn(x / 7, y / 7, 105) * 0.4;
      put(x, y, mix('#4a4246', '#1c181a', clamp(n * 1.3, 0, 1)));
    }
    for (var k = 0; k < 5; k++) {
      var cx2 = S * 0.75, cy2 = S * 0.25;
      var a = k / 5 * 6.28 + 0.4;
      for (var i = 0; i < 5; i++) {
        var nx = cx2 + Math.cos(a + (h2t(i, 83, 106 + k) - 0.5)) * S * 0.09, ny = cy2 + Math.sin(a + (h2t(i, 89, 106 + k) - 0.5)) * S * 0.09;
        stroke(put, cx2, cy2, nx, ny, 1, (function (ii) { return function () { return (ii < 2 ? mix(P.volcano, '#1c181a', 0.3) : '#0e0c0d'); }; })(i));
        cx2 = nx; cy2 = ny;
      }
    }
    ell(put, S * 0.75, S * 0.25, 3.4, 2.6, function (tx, ty) { return mix(P.volcano, '#8a2808', tx + ty * 0.4); });
  }

  // ======================= REGISTRY buildArt hook ===========================
  var PH_ART = {
    buildInto: function (ctx) {
      var MS = ctx.SIZE;
      // ---- INSECT roster (8) : base + 'b' flap/undulation frame ----
      ctx.spr('prehistoriaTermiteHi', MS, MS, function(p,S){D.termite(p,S,0);});
      ctx.spr('prehistoriaTermiteHib', MS, MS, function(p,S){D.termite(p,S,1);});
      ctx.MOB_HI.termite = 'prehistoriaTermiteHi'; ctx.MOB_DISPLAY.termite = 78;
      ctx.spr('prehistoriaGrubHi', MS, MS, function(p,S){D.grub(p,S,0);});
      ctx.spr('prehistoriaGrubHib', MS, MS, function(p,S){D.grub(p,S,1);});
      ctx.MOB_HI.grub = 'prehistoriaGrubHi'; ctx.MOB_DISPLAY.grub = 118;
      ctx.spr('prehistoriaWaspHi', MS, MS, function(p,S){D.wasp(p,S,0);});
      ctx.spr('prehistoriaWaspHib', MS, MS, function(p,S){D.wasp(p,S,1);});
      ctx.MOB_HI.wasp = 'prehistoriaWaspHi'; ctx.MOB_DISPLAY.wasp = 96;
      ctx.spr('prehistoriaHornetHi', MS, MS, function(p,S){D.hornet(p,S,0);});
      ctx.spr('prehistoriaHornetHib', MS, MS, function(p,S){D.hornet(p,S,1);});
      ctx.MOB_HI.hornet = 'prehistoriaHornetHi'; ctx.MOB_DISPLAY.hornet = 102;
      ctx.spr('prehistoriaBeeHi', MS, MS, function(p,S){D.bee(p,S,0);});
      ctx.spr('prehistoriaBeeHib', MS, MS, function(p,S){D.bee(p,S,1);});
      ctx.MOB_HI.bee = 'prehistoriaBeeHi'; ctx.MOB_DISPLAY.bee = 92;
      ctx.spr('prehistoriaMayflyHi', MS, MS, function(p,S){D.mayfly(p,S,0);});
      ctx.spr('prehistoriaMayflyHib', MS, MS, function(p,S){D.mayfly(p,S,1);});
      ctx.MOB_HI.mayfly = 'prehistoriaMayflyHi'; ctx.MOB_DISPLAY.mayfly = 84;
      ctx.spr('prehistoriaCentipedeHi', MS, MS, function(p,S){D.centipede(p,S,0);});
      ctx.spr('prehistoriaCentipedeHib', MS, MS, function(p,S){D.centipede(p,S,1);});
      ctx.MOB_HI.centipede = 'prehistoriaCentipedeHi'; ctx.MOB_DISPLAY.centipede = 150;
      ctx.spr('prehistoriaArthroHi', MS, MS, function(p,S){D.arthro(p,S,0);});
      ctx.spr('prehistoriaArthroHib', MS, MS, function(p,S){D.arthro(p,S,1);});
      ctx.MOB_HI.arthro = 'prehistoriaArthroHi'; ctx.MOB_DISPLAY.arthro = 224;
      // ---- BOSS: THE PRIMORDIAL METAMORPH (worm P1 / cocoon / moth P2) ----
      ctx.spr('prehistoriaWormHi',  160, 160, function(p,S){D.worm(p,S,0);});
      ctx.spr('prehistoriaWormHib', 160, 160, function(p,S){D.worm(p,S,1);});
      ctx.spr('prehistoriaMothHi',  160, 160, function(p,S){D.moth(p,S,0);});
      ctx.spr('prehistoriaMothHib', 160, 160, function(p,S){D.moth(p,S,1);});
      ctx.spr('prehistoriaCocoonHi',      160, 160, function(p,S){D.cocoon(p,S,0);});
      ctx.spr('prehistoriaCocoonCrackHi', 160, 160, function(p,S){D.cocoon(p,S,1);});
      ctx.BOSS_HI.primordial = { key: 'prehistoriaWormHi', size: 160, display: 180, bodyW: 78, bodyH: 34 };
      // ---- DIG-OUT entrance (5 beats) ----
      ctx.spr('prehistoriaDig1', 160, 160, D.dig1);
      ctx.spr('prehistoriaDig2', 160, 160, D.dig2);
      ctx.spr('prehistoriaDig3', 160, 160, D.dig3);
      ctx.spr('prehistoriaDig4', 160, 160, D.dig4);
      ctx.spr('prehistoriaDig5', 160, 160, D.dig5);
      // ---- decor (20) ----
      ctx.spr('phdFerns', 64, 64, dFerns);
      ctx.spr('phdCycad', 64, 64, dCycad);
      ctx.spr('phdCanopy', 64, 64, dCanopy);
      ctx.spr('phdTar', 64, 64, dTar);
      ctx.spr('phdVent', 64, 64, dVent);
      ctx.spr('phdNest', 64, 64, dNest);
      ctx.spr('phdRibcage', 64, 64, dRibcage);
      ctx.spr('phdAmber', 64, 64, dAmber);
      ctx.spr('phdBoulders', 64, 64, dBoulders);
      ctx.spr('phdReeds', 64, 64, dReeds);
      ctx.spr('phdLog', 64, 64, dLog);
      ctx.spr('phdTermite', 64, 64, dTermite);
      ctx.spr('phdGinkgo', 64, 64, dGinkgo);
      ctx.spr('phdSkullRock', 64, 64, dSkullRock);
      ctx.spr('phdGeyser', 64, 64, dGeyser);
      ctx.spr('phdConifer', 64, 64, dConifer);
      ctx.spr('phdWallow', 64, 64, dWallow);
      ctx.spr('phdBloom', 64, 64, dBloom);
      ctx.spr('phdCrater', 64, 64, dCrater);
      ctx.spr('phdRoost', 64, 64, dRoost);
      // ---- tiles (10) ----
      ctx.tex('phtJungle', 48, 48, tJungle);
      ctx.tex('phtMud', 48, 48, tMud);
      ctx.tex('phtFern', 48, 48, tFernMeadow);
      ctx.tex('phtRiverbed', 48, 48, tRiverbed);
      ctx.tex('phtAsh', 48, 48, tAsh);
      ctx.tex('phtTarSeep', 48, 48, tTarSeep);
      ctx.tex('phtBone', 48, 48, tBoneField);
      ctx.tex('phtTrail', 48, 48, tTrail);
      ctx.tex('phtSwamp', 48, 48, tSwamp);
      ctx.tex('phtCrater', 48, 48, tCrater);
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = PH_ART;
  root.PREHISTORIA_ART = PH_ART;
})(typeof window !== 'undefined' ? window : this);
