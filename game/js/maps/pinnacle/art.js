// ============================================================================
// game/js/maps/pinnacle/art.js — THE PINNACLE OF CORRUPTION (the final sand
// stand). Standalone map folder (2026-07-19, Red). Canvas-draw art the scene
// bakes into runtime textures (createCanvas): 4 sand tiles (1-4), an ANIMATED
// SURF band (3 wave-crest frames scrolling toward shore), and DRIFTWOOD — the
// only decor — a DESTRUCTIBLE object with a 3-stage splinter break (no blast).
// The 1.5x beached TITAN WHALE boss reuses the belly textures (bellyTitanWhale*).
// ============================================================================
(function (root) {
  'use strict';
  var PAL = {
    sand:'#c4a868',sandL:'#e0c890',sandH:'#f0dca8',sandD:'#9a7c4c',sandDD:'#7a6038',
    woodL:'#b09a6a',wood:'#8a7040',woodD:'#5a4626',woodDD:'#3a2c16',white:'#f4efe2',
    water:'#4a90a8',waterL:'#96ccd8',waterD:'#2e6478',foam:'#e6f4f8',
    grey:'#8a8a82',boneSh:'#a89e84',red:'#b0342e'
  };
  function rng(seed){var s=seed||1;return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}
  function grain(x,a,b,c,d,col,dens,seed){var r=rng(seed);x.fillStyle=col;for(var yy=b;yy<d;yy++)for(var xx=a;xx<c;xx++)if(r()<dens)x.fillRect(xx,yy,1,1);}
  function E(x,cx,cy,rx,ry,col){x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.fill();}
  function L(x,a,b,c,d,col,w){x.strokeStyle=col;x.lineWidth=w||2;x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();}

  // ---- TILES (tileable; drawn at size S, seamless via wrapped grain) ----
  var TILES = {
    sand: function(x,S){ x.fillStyle=PAL.sand;x.fillRect(0,0,S,S);grain(x,0,0,S,S,PAL.sandL,0.14,1);grain(x,0,0,S,S,PAL.sandD,0.12,2);grain(x,0,0,S,S,PAL.sandH,0.04,3); },
    wet:  function(x,S){ x.fillStyle=PAL.sandD;x.fillRect(0,0,S,S);grain(x,0,0,S,S,PAL.sandDD,0.18,4);grain(x,0,0,S,S,'#8a7448',0.10,5);var r=rng(9);for(var i=0;i<10;i++)E(x,r()*S,r()*S,3,2,'rgba(120,150,150,0.22)'); },
    ripple:function(x,S){ x.fillStyle=PAL.sand;x.fillRect(0,0,S,S);for(var y=-2;y<S;y+=9){x.strokeStyle=PAL.sandD;x.lineWidth=3;x.beginPath();for(var xx=0;xx<=S;xx+=3)x.lineTo(xx,y+Math.sin(xx*0.16)*3);x.stroke();x.strokeStyle=PAL.sandL;x.lineWidth=1;x.beginPath();for(var xx2=0;xx2<=S;xx2+=3)x.lineTo(xx2,y-2+Math.sin(xx2*0.16)*3);x.stroke();}grain(x,0,0,S,S,PAL.sandH,0.03,7); },
    shell:function(x,S){ x.fillStyle=PAL.sand;x.fillRect(0,0,S,S);grain(x,0,0,S,S,PAL.sandL,0.10,1);var r=rng(2);for(var i=0;i<Math.round(S*S/90);i++){var c=[PAL.white,PAL.boneSh,PAL.red,PAL.grey][i%4];E(x,r()*S,r()*S,2,1.4,c);} }
  };
  // ---- ANIMATED SURF (Red picked #7 LAPPING SHORE) — bands scroll toward the
  // sand; ph in [0,1) loops. Tileable both axes. ----
  function surf(x,S,ph){
    var g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,PAL.waterD);g.addColorStop(1,PAL.water);
    x.fillStyle=g;x.fillRect(0,0,S,S);
    for(var k=0;k<5;k++){
      var y=((k/5+ph)%1)*S;
      x.strokeStyle=PAL.waterL;x.lineWidth=2;x.beginPath();for(var wx=0;wx<=S;wx+=3)x.lineTo(wx,y+Math.sin(wx*0.1)*2);x.stroke();
      x.strokeStyle=PAL.foam;x.lineWidth=1;x.beginPath();for(var wx2=0;wx2<=S;wx2+=3)x.lineTo(wx2,y-2+Math.sin(wx2*0.1)*2);x.stroke();
    }
  }
  // ---- BREAKING FOAM at the shoreline (Red picked #6 WHITEWATER) — a churning
  // white band drawn where the surf meets the sand; W wide, H tall, ph loops. ----
  function foamEdge(x,W,H,ph){
    x.clearRect(0,0,W,H);
    var r=rng(11+Math.floor(ph*8)|0);
    for(var i=0;i<Math.round(W*H*0.10);i++){ x.fillStyle=r()<0.5?PAL.foam:'#ffffff'; var fx=(r()*W+ph*W)%W; x.fillRect(fx,r()*H,2,2); }
    x.strokeStyle=PAL.foam;x.lineWidth=2;x.beginPath();for(var wx=0;wx<=W;wx+=3)x.lineTo(wx,H*0.5+Math.sin((wx/W+ph)*6.283)*3);x.stroke();
  }

  // ---- DRIFTWOOD (96x96) — stage 0 intact, 1-2 splintering, 3 splinters only ----
  function driftwood(x,S,stage){
    var cx=S*0.5, cy=S*0.62, r=rng(4);
    function log(a,b,c,d,w){ L(x,a,b,c,d,PAL.wood,w); L(x,a,b,c,d,PAL.woodL,Math.max(1,w-3)); }
    // soft shadow
    E(x,cx,cy+14,34,8,'rgba(50,36,18,0.28)');
    if(stage<=0){
      log(cx-38,cy+6,cx+38,cy-2,12); log(cx-26,cy+14,cx+30,cy+10,9); log(cx-8,cy-10,cx+24,cy+4,8);
      grain(x,cx-40,cy-14,cx+40,cy+18,PAL.woodDD,0.10,4); grain(x,cx-40,cy-14,cx+40,cy+18,PAL.white,0.05,8);
      E(x,cx-34,cy+4,4,4,PAL.woodDD); E(x,cx+34,cy-2,4,4,PAL.woodDD); L(x,cx,cy-2,cx+3,cy+10,PAL.woodDD,1);
    } else if(stage===1){
      log(cx-38,cy+8,cx-4,cy+2,11); log(cx+2,cy+4,cx+34,cy+8,9); // cracked in two
      L(x,cx-4,cy+2,cx-2,cy-8,PAL.woodDD,2); L(x,cx+2,cy+4,cx+4,cy-6,PAL.woodDD,2); // split faces
      for(var i=0;i<6;i++){ var a=r()*6.283; L(x,cx,cy,cx+Math.cos(a)*(10+r()*10),cy+Math.sin(a)*(6+r()*8),PAL.woodL,2); }
    } else if(stage===2){
      log(cx-30,cy+10,cx-12,cy+6,8); log(cx+8,cy+8,cx+28,cy+12,7);
      for(var i2=0;i2<10;i2++){ var a2=r()*6.283,d2=8+r()*22; L(x,cx,cy,cx+Math.cos(a2)*d2,cy+Math.sin(a2)*d2,r()<0.5?PAL.wood:PAL.woodL,2); }
    } else { // stage 3 — a scatter of splinters settling (final frame → then removed)
      for(var i3=0;i3<12;i3++){ var a3=r()*6.283,d3=14+r()*30; var px=cx+Math.cos(a3)*d3,py=cy+Math.sin(a3)*d3*0.5; L(x,px,py,px+Math.cos(a3)*6,py+Math.sin(a3)*4,r()<0.5?PAL.woodD:PAL.woodL,2); }
    }
  }

  root.PINNACLE_ART = { PAL: PAL, TILES: TILES, surf: surf, foamEdge: foamEdge, driftwood: driftwood };
})(typeof window !== 'undefined' ? window : this);
