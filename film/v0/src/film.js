/* YAX film renderer. Pure canvas, deterministic: frame = render(t). */
(function(){
const W=1920,H=1080;
const TLD=window.YAX_TIMELINE, C=TLD.cues;
const PAL={paper:'#efe6d3',paper2:'#e4d7bd',ink:'#1f2a30',red:'#d64a3a',yel:'#f2c14e',blue:'#5b9bc4',mint:'#79b99a',lilac:'#9f86cf',kraft:'#c9a577',white:'#fbf8f1',cork:'#b58755',coral:'#e8836a',sand:'#d9cdb3'};
const FONT={serif:'"Fraunces", Georgia, serif',hand:'"Caveat", "Comic Sans MS", cursive',pix:'"Pixelify Sans", monospace'};

/* ---------- math ---------- */
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const prog=(t,a,d)=>clamp((t-a)/d);
const eOut=t=>1-Math.pow(1-t,3);
const eInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eBack=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
const eElastic=t=>t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(x,y,s){let n=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1442695041);n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;return(n>>>0)/4294967296;}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

/* ---------- textures ---------- */
function grainCanvas(w,h,base,amt,seed,fibers){
  const cv=mk(w,h),g=cv.getContext('2d');g.fillStyle=base;g.fillRect(0,0,w,h);
  const img=g.getImageData(0,0,w,h),d=img.data,r=mulberry(seed);
  for(let i=0;i<d.length;i+=4){const n=(r()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n*.9;}
  g.putImageData(img,0,0);
  if(fibers){g.globalAlpha=.07;g.strokeStyle='#6b5a44';g.lineWidth=1;
    for(let i=0;i<fibers;i++){const x=r()*w,y=r()*h,a=r()*6.28,l=6+r()*22;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*l*.5+r()*4,y+Math.sin(a)*l*.5+r()*4,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
    g.globalAlpha=1;}
  return cv;
}
const TEX={};
function paperPattern(ctx,col,seed){const k=col+seed;if(!TEX[k])TEX[k]=grainCanvas(256,256,col,26,seed,60);return ctx.createPattern(TEX[k],'repeat');}
let BGPAPER,BGCORK,GRAIN=[];
function buildTextures(){
  BGPAPER=grainCanvas(W,H,PAL.paper,22,3,5200);
  const g=BGPAPER.getContext('2d'),r=mulberry(11);
  for(let i=0;i<14;i++){const x=r()*W,y=r()*H,rad=120+r()*380,gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(170,140,95,.07)');gr.addColorStop(1,'rgba(170,140,95,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);}
  BGCORK=grainCanvas(W,H,PAL.cork,40,5,0);
  const k=BGCORK.getContext('2d'),r2=mulberry(21);
  for(let i=0;i<9000;i++){k.fillStyle=`rgba(${r2()<.5?'70,40,20':'230,190,140'},${.12+r2()*.25})`;const s=1+r2()*3;k.fillRect(r2()*W,r2()*H,s,s*(.6+r2()));}
  for(let i=0;i<4;i++){const cv=mk(W/2,H/2),gg=cv.getContext('2d'),im=gg.createImageData(W/2,H/2),rr=mulberry(100+i);for(let j=0;j<im.data.length;j+=4){const v=rr()*255;im.data[j]=im.data[j+1]=im.data[j+2]=v;im.data[j+3]=255;}gg.putImageData(im,0,0);GRAIN.push(cv);}
}

/* ---------- paper primitives ---------- */
function tornRect(x,y,w,h,seed,jag=5,step=14){
  const r=mulberry(seed),pts=[];
  const edge=(x0,y0,x1,y1)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.round(L/step)),nx=-(y1-y0)/L,ny=(x1-x0)/L;
    for(let i=0;i<n;i++){const t=i/n,o=(r()-.5)*jag*2;pts.push([x0+(x1-x0)*t+nx*o,y0+(y1-y0)*t+ny*o]);}};
  edge(x,y,x+w,y);edge(x+w,y,x+w,y+h);edge(x+w,y+h,x,y+h);edge(x,y+h,x,y);
  const p=new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(const q of pts)p.lineTo(q[0],q[1]);p.closePath();return p;
}
function withShadow(ctx,lift,fn){ctx.save();ctx.shadowColor=`rgba(45,32,18,${.18+.1*lift})`;ctx.shadowBlur=10+18*lift;ctx.shadowOffsetX=3+5*lift;ctx.shadowOffsetY=6+10*lift;fn();ctx.restore();}
function cutout(ctx,path,col,seed,lift=.4){withShadow(ctx,lift,()=>{ctx.fillStyle=paperPattern(ctx,col,seed%7);ctx.fill(path);});
  ctx.save();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;ctx.stroke(path);ctx.restore();}
function tape(ctx,x,y,w,h,rot,seed,col='rgba(240,226,170,.78)'){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);const p=tornRect(-w/2,-h/2,w,h,seed,3,6);
  ctx.fillStyle=col;ctx.fill(p);ctx.globalAlpha=.25;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke(p);ctx.restore();}

/* ---------- ink ---------- */
let BOIL=0;
function boilPts(pts,amp,seed){return pts.map((p,i)=>[p[0]+(hash(i,BOIL,seed)-.5)*amp,p[1]+(hash(i,BOIL+7,seed)-.5)*amp]);}
function pathLen(pts){let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;}
function inkStroke(ctx,pts,{w=6,col=PAL.ink,frac=1,amp=2.2,seed=1,alpha=1}={}){
  if(frac<=0||pts.length<2)return;
  let P=boilPts(pts,amp,seed);
  if(frac<1){const L=pathLen(P)*frac;let acc=0,out=[P[0]];for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(acc+d>=L){const k=(L-acc)/d;out.push([lerp(P[i-1][0],P[i][0],k),lerp(P[i-1][1],P[i][1],k)]);break;}acc+=d;out.push(P[i]);}P=out;}
  ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';
  for(let pass=0;pass<2;pass++){ctx.lineWidth=w*(pass?.55:1);ctx.globalAlpha=alpha*(pass?.55:1);ctx.beginPath();ctx.moveTo(P[0][0]+pass*1.2,P[0][1]-pass);
    for(let i=1;i<P.length-1;i++){const mx=(P[i][0]+P[i+1][0])/2,my=(P[i][1]+P[i+1][1])/2;ctx.quadraticCurveTo(P[i][0]+pass*1.2,P[i][1]-pass,mx+pass*1.2,my-pass);}
    const Lp=P[P.length-1];ctx.lineTo(Lp[0]+pass*1.2,Lp[1]-pass);ctx.stroke();}
  ctx.restore();
}
function circlePts(cx,cy,rx,ry,turns=1.15,n=60,seed=1){const r=mulberry(seed),a0=r()*6.28,pts=[];for(let i=0;i<=n;i++){const a=a0+turns*6.283*i/n,k=1+(r()-.5)*.06;pts.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return pts;}
function arcPts(x0,y0,x1,y1,bend,n=24){const mx=(x0+x1)/2,my=(y0+y1)/2,dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,pts=[];for(let i=0;i<=n;i++){const t=i/n,b=Math.sin(Math.PI*t)*bend;pts.push([x0+dx*t+nx*b,y0+dy*t+ny*b]);}return pts;}
function arrowHead(ctx,x,y,ang,s,col=PAL.ink,seed=3){inkStroke(ctx,[[x-Math.cos(ang-.5)*s,y-Math.sin(ang-.5)*s],[x,y],[x-Math.cos(ang+.5)*s,y-Math.sin(ang+.5)*s]],{w:5,col,seed});}

/* ---------- text ---------- */
function handText(ctx,str,x,y,{size=64,col=PAL.ink,frac=1,align='center',rot=0,weight=600,font=FONT.hand,wobble=true}={}){
  if(frac<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot+(wobble?(hash(1,BOIL,str.length)-.5)*.006:0));
  ctx.font=`${weight} ${size}px ${font}`;ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const w=ctx.measureText(str).width,x0=align==='center'?-w/2:align==='right'?-w:0;
  if(frac<1){ctx.beginPath();ctx.rect(x0-10,-size*1.2,(w+20)*frac,size*1.8);ctx.clip();}
  ctx.fillStyle=col;ctx.fillText(str,x0,0);ctx.restore();return w;
}
function measure(ctx,str,size,font=FONT.hand,weight=600){ctx.save();ctx.font=`${weight} ${size}px ${font}`;const w=ctx.measureText(str).width;ctx.restore();return w;}

/* ---------- pixel characters as stickers ---------- */
const pad=s=>s.padEnd(16,'.');
const BASE_DOWN=['','....oooooooo','...ohhhhhhhho','...ohhhhhhhho','...ohssssssho','...osesssseso','...osssssssso','....osssssso','...otttttttto','..otttttttttto','..osttttttttso','...otttttttto','...oppppppppo','....opp..ppo','....obb..bbo',''];
const BASE_SIDE=BASE_DOWN.slice();BASE_SIDE[4]='...ohhhhsssso';BASE_SIDE[5]='...ohhhssseso';BASE_SIDE[6]='...ohhsssssso';BASE_SIDE[9]='...otttttttto';BASE_SIDE[10]='...otttttstto';
function template(dir,style){
  let rows=(dir==='down'?BASE_DOWN:BASE_SIDE).map(r=>pad(r).split(''));
  if(style==='beret'){rows[1]=pad('...oooooooooo').split('');for(let x=4;x<13;x++)rows[2][x]='r';rows[2][13]='o';}
  if(style==='long'){for(let y=6;y<=10;y++){rows[y][3]='h';if(dir!=='right')rows[y][12]='h';}rows[11][3]='o';if(dir!=='right')rows[11][12]='o';}
  if(style==='apron'&&dir==='down')for(let y=9;y<=11;y++)for(let x=6;x<=9;x++)rows[y][x]='a';
  return rows;
}
const CAST={
  priya:{pal:{h:'#1e1a1a',s:'#b7825a',t:'#e7b53f',p:'#2f4a6d',b:'#2b2230'},style:'long'},
  mei:{pal:{h:'#2a2238',s:'#f1c9a5',t:'#c9503a',p:'#3a3f58',b:'#2b2230',a:'#f4efe4'},style:'apron'},
  raf:{pal:{h:'#6b3e1f',s:'#c98e62',t:'#3d7fb3',p:'#5a4a3a',b:'#2b2230',r:'#a33a3a'},style:'beret'},
  c1:{pal:{h:'#c9a13a',s:'#f0c8a4',t:'#6a8f3a',p:'#4a3a2a',b:'#2b2230'},style:''},
  c2:{pal:{h:'#3b2a20',s:'#8d5a3b',t:'#9f86cf',p:'#2b2b33',b:'#2b2230'},style:''},
  c3:{pal:{h:'#a0522d',s:'#f1c9a5',t:'#e8836a',p:'#3a3f58',b:'#2b2230'},style:'long'},
  c4:{pal:{h:'#555',s:'#e0b48e',t:'#5a6b7a',p:'#2b2b33',b:'#2b2230'},style:''},
  landlord:{pal:{h:'#777',s:'#e6bf98',t:'#3a3f58',p:'#2b2b33',b:'#2b2230'},style:''},
  agent:{pal:{h:'#20303a',s:'#d8b08a',t:'#2fa6a0',p:'#27404f',b:'#1b2a33'},style:''},
};
const SPR={};
function spriteCanvas(who,dir='down',frame='A'){
  const key=who+dir+frame;if(SPR[key])return SPR[key];
  const d=dir==='left'?'right':dir;const rows=template(d,CAST[who].style);
  if(frame==='B')rows[14]=pad('....obb.....').split('');if(frame==='C')rows[14]=pad('.........bbo').split('');
  const cv=mk(16,16),g=cv.getContext('2d'),P={o:'#2b2230',e:'#1b1720',...CAST[who].pal};
  rows.forEach((row,y)=>row.forEach((ch,x)=>{if(ch!=='.'&&P[ch]){g.fillStyle=P[ch];g.fillRect(x,y,1,1);}}));
  if(who==='agent'){g.fillStyle='#2b2230';g.fillRect(7,0,1,1);g.fillStyle='#ffcf5a';g.fillRect(7,-1,1,1);}
  if(dir==='left'){const m=mk(16,16),mg=m.getContext('2d');mg.translate(16,0);mg.scale(-1,1);mg.drawImage(cv,0,0);return SPR[key]=m;}
  return SPR[key]=cv;
}
const STK={};
function sticker(who,dir='down',frame='A',scale=10){
  const key=who+dir+frame+scale;if(STK[key])return STK[key];
  const sp=spriteCanvas(who,dir,frame),B=Math.round(scale*.9),S=16*scale,cv=mk(S+B*2+4,S+B*2+4+(who==='agent'?scale*2:0)),g=cv.getContext('2d');
  g.imageSmoothingEnabled=false;const oy=who==='agent'?scale*2:0;
  const sil=mk(S,S),sg=sil.getContext('2d');sg.imageSmoothingEnabled=false;sg.drawImage(sp,0,0,S,S);sg.globalCompositeOperation='source-in';sg.fillStyle='#fbf8f1';sg.fillRect(0,0,S,S);
  for(let a=0;a<16;a++){const dx=Math.cos(a/16*6.283)*B,dy=Math.sin(a/16*6.283)*B;g.drawImage(sil,B+2+dx,B+2+dy+oy);}
  g.drawImage(sp,B+2,B+2+oy,S,S);
  if(who==='agent'){g.fillStyle='#2b2230';g.fillRect(B+2+7*scale,B+2,scale,scale*2+1);g.fillStyle='#ffcf5a';g.beginPath();g.arc(B+2+7.5*scale,B+2,scale*.9,0,6.283);g.fill();}
  return STK[key]=cv;
}
function drawSticker(ctx,who,x,y,{scale=10,rot=0,s=1,dir='down',frame='A',lift=.5,alpha=1}={}){
  if(s<=0.001)return;const cv=sticker(who,dir,frame,scale);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  withShadow(ctx,lift,()=>ctx.drawImage(cv,-cv.width/2,-cv.height/2));ctx.restore();
}

/* ---------- mini pixel scenes for postcards ---------- */
const MINI={};function miniCtx(k){if(!MINI[k]){const c=mk(120,70);MINI[k]=c;}const g=MINI[k].getContext('2d');g.imageSmoothingEnabled=false;return g;}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h);}
function blit(g,who,x,y,dir='down',frame='A'){g.drawImage(spriteCanvas(who,dir,frame),Math.round(x),Math.round(y));}
function miniCafe(t){const g=miniCtx('cafe');R(g,0,0,120,70,'#e3d2b0');R(g,0,22,120,2,'#9b7350');for(let y=24;y<70;y+=4)R(g,0,y,120,4,(y/4)%2?'#b98a58':'#ad7e4f');
  R(g,78,4,34,14,'#6b4a33');R(g,80,5,30,12,'#a9d3ea');R(g,94,5,2,12,'#6b4a33');R(g,8,4,30,13,'#2f3a33');R(g,11,7,16,1,'#e8efe6');R(g,11,10,20,1,'#e8efe6');R(g,11,13,12,1,'#f2c14e');
  blit(g,'mei',30,22);R(g,12,36,60,4,'#dcc6a0');R(g,12,40,60,12,'#6d4a31');R(g,16,33,6,3,'#b9c0c7');blit(g,'priya',80,38,'left');}
function miniNego(t){const g=miniCtx('nego');R(g,0,0,120,70,'#cfd6dc');R(g,0,30,120,40,'#8a7a6a');R(g,70,6,30,16,'#5b6b7a');R(g,72,8,26,12,'#a9d3ea');R(g,14,8,20,14,'#e8dfcc');R(g,16,11,14,1,'#999');R(g,16,14,10,1,'#999');
  blit(g,'priya',20,30,'right');blit(g,'landlord',84,30,'left');R(g,36,40,50,5,'#8f633e');R(g,36,45,50,3,'#6a4426');R(g,40,48,3,14,'#5b3c22');R(g,79,48,3,14,'#5b3c22');R(g,54,38,12,3,'#fbf8f1');R(g,56,39,7,1,'#999');}
function miniEvac(t,follow){const g=miniCtx('evac');R(g,0,0,120,70,'#bfdcee');R(g,0,0,120,10,'#a9d0e8');
  g.fillStyle='#86b85f';g.beginPath();g.moveTo(40,70);g.lineTo(120,18);g.lineTo(120,70);g.fill();R(g,0,46,60,24,'#86b85f');
  const wv=Math.sin(t*2)*2+2;R(g,0,56-wv,26+wv*2,20,'#4d93c0');R(g,0,55-wv,26+wv*2,1,'#e6f4fb');
  R(g,6,30,14,12,'#eee4cf');g.fillStyle='#b4533c';g.beginPath();g.moveTo(4,31);g.lineTo(13,23);g.lineTo(22,31);g.fill();R(g,24,33,12,9,'#efe6d2');R(g,23,31,14,3,'#5f8a4a');
  const crowd=['c1','c2','c3','c4'];crowd.forEach((w,i)=>{const ph=((t*14+i*17)%70);const x=46+ph,y=40-ph*.62;blit(g,w,x,y,'right',['A','B','A','C'][Math.floor(t*8+i)%4]);});
  if(follow){const ph=(t*14+8)%70;blit(g,'priya',46+ph,40-ph*.62,'right',['A','B','A','C'][Math.floor(t*8)%4]);}else blit(g,'priya',30,40,'down');}
function postcard(ctx,x,y,w,h,rot,s,kind,label,t,seed){
  if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  const p=tornRect(-w/2,-h/2,w,h,seed,2.5,20);cutout(ctx,p,PAL.white,seed,.55);
  const ix=-w/2+18,iy=-h/2+18,iw=w-36,ih=h-78;
  if(kind==='cafe')miniCafe(t);else if(kind==='nego')miniNego(t);else miniEvac(t,t>C.evac+1.2);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(MINI[kind],ix,iy,iw,ih);ctx.imageSmoothingEnabled=true;
  ctx.strokeStyle='rgba(31,42,48,.25)';ctx.lineWidth=2;ctx.strokeRect(ix,iy,iw,ih);
  handText(ctx,label,0,h/2-20,{size:46,col:PAL.ink});
  tape(ctx,0,-h/2,110,34,.04,seed+3);ctx.restore();
}

/* ---------- transitions ---------- */
function swipe(ctx,t,t0,col,seed){
  const d=.55,k=prog(t,t0,d);if(k<=0||k>=1)return;
  const x=lerp(W*1.08,-W*1.35,eInOut(k));ctx.save();const p=tornRect(x,-60,W*1.25,H+120,seed,26,40);
  withShadow(ctx,1,()=>{ctx.fillStyle=paperPattern(ctx,col,seed%5);ctx.fill(p);});ctx.restore();
}

/* ---------- scenes ---------- */
function bgPaper(ctx){ctx.drawImage(BGPAPER,0,0);}
const CROWD=['mei','raf','priya','c1','c2','c3','c4'];
function scene1(ctx,t){
  bgPaper(ctx);
  // question mark
  const q=[];for(let i=0;i<=30;i++){const a=Math.PI*1.08+i/30*Math.PI*1.32;q.push([960+Math.cos(a)*118,330+Math.sin(a)*112]);}
  q.push([1000,455]);q.push([968,492]);q.push([962,530]);
  inkStroke(ctx,q,{w:22,frac:eOut(prog(t,C.s1_q,1.0)),seed:5,amp:3});
  const dk=prog(t,C.s1_q+.9,.2);if(dk>0){ctx.save();ctx.fillStyle=PAL.ink;ctx.beginPath();ctx.arc(960+(hash(2,BOIL,9)-.5)*3,590,15*eBack(dk),0,6.283);ctx.fill();ctx.restore();}
  // thought lines from the crowd
  [0,2,4,6].forEach((j,n)=>{const x=960+(j-3)*200+34,y=820-(3-Math.abs(j-3))*30-150,k=prog(t,C.s1_q+.7+n*.15,.35);if(k>0){ctx.save();ctx.translate(x,y);ctx.scale(eBack(k),eBack(k));handText(ctx,'?',0,0,{size:70,col:[PAL.red,PAL.blue,PAL.ink,PAL.red][n],weight:700,rot:(n%2?.2:-.15)});ctx.restore();}});
  CROWD.forEach((w,j)=>{const x=960+(j-3)*200,y=820-(3-Math.abs(j-3))*30,k=prog(t,C.s1_pop+j*.14,.45);
    drawSticker(ctx,w,x,y+Math.sin(t*2+j)*4,{scale:9,rot:(hash(j,1,1)-.5)*.2,s:eBack(k)});});
  handText(ctx,'a guess about people?',960,170,{size:96,frac:prog(t,C.s1_guess-.25,.9),col:PAL.ink,weight:700});
  const u=prog(t,C.s1_guess+.55,.5);if(u>0){const pts=[];for(let i=0;i<=30;i++)pts.push([700+i*17.5,200+Math.sin(i*.9)*7]);inkStroke(ctx,pts,{w:6,col:PAL.red,frac:u,seed:77});}
}
function rocket(ctx,cx,cy){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.5);
  const body=new Path2D();body.moveTo(0,-110);body.quadraticCurveTo(46,-50,40,60);body.lineTo(-40,60);body.quadraticCurveTo(-46,-50,0,-110);cutout(ctx,body,PAL.white,31,.35);
  const f1=new Path2D();f1.moveTo(-40,20);f1.lineTo(-72,76);f1.lineTo(-38,60);f1.closePath();const f2=new Path2D();f2.moveTo(40,20);f2.lineTo(72,76);f2.lineTo(38,60);f2.closePath();cutout(ctx,f1,PAL.red,32,.3);cutout(ctx,f2,PAL.red,33,.3);
  const win=new Path2D();win.arc(0,-30,20,0,6.283);cutout(ctx,win,PAL.blue,34,.2);
  const fl=new Path2D();fl.moveTo(-22,62);fl.quadraticCurveTo(0,130+Math.sin(BOIL)*8,22,62);cutout(ctx,fl,PAL.yel,35,.2);
  inkStroke(ctx,[[0,-110],[30,-60],[40,60]],{w:3,seed:36,alpha:.6});ctx.restore();}
function tag(ctx,cx,cy,rot,seed,lines,colText){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);
  const p=new Path2D();p.moveTo(-90,-60);p.lineTo(70,-60);p.lineTo(110,0);p.lineTo(70,60);p.lineTo(-90,60);p.closePath();cutout(ctx,p,PAL.kraft,seed,.35);
  ctx.fillStyle=PAL.paper;ctx.beginPath();ctx.arc(78,0,9,0,6.283);ctx.fill();
  lines.forEach((l,i)=>handText(ctx,l.s,-10,-8+i*46,{size:l.size||46,col:l.col||PAL.ink,weight:700}));ctx.restore();}
function megaphone(ctx,cx,cy){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.15);
  const cone=new Path2D();cone.moveTo(-70,-22);cone.lineTo(60,-70);cone.lineTo(60,70);cone.lineTo(-70,22);cone.closePath();cutout(ctx,cone,PAL.yel,41,.35);
  const h=tornRect(-100,-26,34,52,42,2,8);cutout(ctx,h,PAL.red,43,.3);
  [0,1,2].forEach(i=>inkStroke(ctx,arcPts(90+i*22,-50-i*10,90+i*22,50+i*10,-18-i*6,12),{w:5,seed:44+i,frac:1,amp:2.5}));ctx.restore();}
function card(ctx,x,y,w,h,rot,s,seed,label,draw){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  cutout(ctx,tornRect(-w/2,-h/2,w,h,seed,3,18),PAL.white,seed,.55);draw();handText(ctx,label,0,h/2-34,{size:56,weight:700});tape(ctx,0,-h/2+4,120,36,-.05,seed+9);ctx.restore();}
function scene2(ctx,t){
  bgPaper(ctx);const shake=t>C.clap+.25&&t<C.clap+.55?Math.sin((t-C.clap)*90)*6*(1-prog(t,C.clap+.25,.3)):0;
  const cards=[[C.launch,400,430,-.06,'a launch',()=>rocket(ctx,0,-30)],[C.price,960,410,.03,'a new price',()=>{tag(ctx,-10,-40,-.12,52,[{s:'$4.50',col:PAL.ink},{s:'$5.00',col:PAL.red}]);inkStroke(ctx,[[-80,-46],[40,-60]],{w:5,col:PAL.red,seed:53});}],[C.crisis,1520,430,-.03,'a crisis message',()=>megaphone(ctx,-10,-40)]];
  cards.forEach(([tc,x,y,r,l,fn],i)=>{const k=prog(t,tc-.18,.55);card(ctx,x+shake*(i-1),y+lerp(700,0,eOut(k)),440,400,r+lerp(.4,0,eOut(k))*(i%2?-1:1),k>0?1:0,60+i,l,fn);});
  // clapperboard
  const k=prog(t,C.rehearse-.1,.5);if(k>0){ctx.save();ctx.translate(960,lerp(-300,845,eBack(k)));ctx.rotate(-.04);
    const body=new Path2D();body.rect(-230,-60,460,230);withShadow(ctx,.8,()=>{ctx.fillStyle='#262a2e';ctx.fill(body);});
    const open=t<C.clap+.25?.38*Math.min(1,prog(t,C.rehearse+.2,.3)):Math.max(0,.38*(1-prog(t,C.clap+.25,.06)));
    ctx.save();ctx.translate(-230,-60);ctx.rotate(-open);const arm=new Path2D();arm.rect(0,-54,460,54);ctx.fillStyle='#262a2e';ctx.fill(arm);
    ctx.fillStyle=PAL.white;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(20+i*80,-54);ctx.lineTo(60+i*80,-54);ctx.lineTo(30+i*80,0);ctx.lineTo(-10+i*80,0);ctx.closePath();ctx.fill();}ctx.restore();
    handText(ctx,'SCENE: the real world',-200,20,{size:44,col:'#f3efe6',align:'left',weight:600});handText(ctx,'TAKE: 1 of 1',-200,90,{size:56,col:'#f3efe6',align:'left',weight:700});
    ctx.restore();}
  handText(ctx,'no rehearsals.',1440,900,{size:78,col:PAL.red,frac:prog(t,C.clap+.45,.8),rot:-.05,weight:700});
}
const GENES=[{n:'loss aversion',c:PAL.blue,w:250},{n:'curiosity',c:PAL.mint,w:200},{n:'social anxiety',c:PAL.lilac,w:250},{n:'conformity',c:PAL.yel,w:210},{n:'impulsivity',c:PAL.coral,w:200},{n:'warmth',c:PAL.sand,w:180}];
function geneTape(ctx,x,y,t,frac){
  const extra=GENES.map((g,i)=>i===2?90*eOut(prog(t,C.editable+.25,.5)):0);let tw=0;GENES.forEach((g,i)=>tw+=g.w+extra[i]);
  ctx.save();ctx.beginPath();ctx.rect(x-10,y-80,(tw+20)*frac,220);ctx.clip();
  let cx=x;const segs=[];
  GENES.forEach((g,i)=>{const w=g.w+extra[i];const p=tornRect(cx,y,w+2,86,200+i,2,12);cutout(ctx,p,g.c,210+i,.35);
    for(let k=1;k<Math.floor(w/26);k++){ctx.fillStyle='rgba(31,42,48,.18)';ctx.fillRect(cx+k*26,y+64,2,14);}segs.push([cx,w]);cx+=w;});
  ctx.restore();return segs;
}
function scene34(ctx,t){
  bgPaper(ctx);
  const pan=eInOut(prog(t,15.15,1.4))*800;ctx.save();ctx.translate(-pan,0);
  const px=560,py=560;
  // demographic tags on strings
  const TAGS=[['age 23',250,300,-.12],['grad student',880,280,.08],['Vancouver',230,840,.1],['likes oat milk',900,850,-.07]];
  TAGS.forEach(([s,x,y,r],j)=>{const k=prog(t,C.s3_in+.5+j*.22,.45),struck=prog(t,C.notwho+.1+j*.28,.25),drop=eInOut(prog(t,C.notwho+.3+j*.28,.6));
    if(k<=0)return;const yy=y+drop*40,rr=r+drop*.25*(j%2?1:-1);
    inkStroke(ctx,arcPts(px+(x<px?-80:80),py-40,x+(x<px?60:-60),yy,20,10),{w:2.5,seed:90+j,alpha:.55*k*(1-drop*.5)});
    ctx.save();ctx.globalAlpha=1-drop*.45;ctx.translate(x,yy);ctx.scale(eBack(k),eBack(k));
    const w=measure(ctx,s,50)+70;const p=new Path2D();p.moveTo(-w/2,-38);p.lineTo(w/2-26,-38);p.lineTo(w/2,0);p.lineTo(w/2-26,38);p.lineTo(-w/2,38);p.closePath();ctx.rotate(rr);cutout(ctx,p,PAL.kraft,70+j,.35);
    handText(ctx,s,-12,14,{size:50,weight:700});if(struck>0)inkStroke(ctx,[[-w/2+10,4],[-w/6,-6],[w/6,8],[w/2-30,-4]],{w:7,col:PAL.red,frac:struck,seed:95+j});ctx.restore();});
  // one layer deeper
  const dp=prog(t,C.deeper-.3,.8);if(dp>0&&t<C.genome){handText(ctx,'one layer deeper',px,150,{size:70,col:PAL.blue,frac:dp,weight:700});inkStroke(ctx,arcPts(px+10,175,px,360,-30,14),{w:5,col:PAL.blue,frac:dp,seed:81});}
  const lift=prog(t,C.deeper,.4)-prog(t,C.notwho+1.2,.5);
  drawSticker(ctx,'priya',px,py+Math.sin(t*1.6)*5,{scale:17,lift:.5+.8*lift,s:1+.04*lift,rot:-.03});
  // gene tape unrolling from her head
  const fr=eInOut(prog(t,C.how,1.6));
  if(fr>0){inkStroke(ctx,[[px+120,py-150],[px+220,py-230],[px+300,py-250]],{w:4,seed:130,frac:fr,alpha:.6});
    const segs=geneTape(ctx,px+300,py-300,t,fr);
    // labels
    segs.forEach(([sx,sw],i)=>{handText(ctx,GENES[i].n,sx+sw/2,py-320-(i%2?0:0),{size:40,frac:prog(t,C.genome+.1+i*.08,.35),weight:700,rot:(i%2?.03:-.03)});});
    handText(ctx,'cognitive genome',px+1150,py-470,{size:104,frac:prog(t,C.genome-.55,.8),weight:700});
    const ar=prog(t,C.genome+.2,.4);if(ar>0){inkStroke(ctx,arcPts(px+900,py-450,px+760,py-360,-26,14),{w:5,frac:ar,seed:140});if(ar>=1)arrowHead(ctx,px+760,py-360,2.4,22);}
    // readable: magnifier over "conformity"
    const mg=prog(t,C.readable-.1,.4)-prog(t,C.editable+.1,.4);
    if(mg>0&&segs[3]){const mx=segs[3][0]+segs[3][1]/2,my=py-340;ctx.save();ctx.globalAlpha=Math.min(1,mg*1.5);ctx.translate(mx+lerp(260,0,eOut(clamp(mg))),my);
      ctx.save();ctx.beginPath();ctx.arc(0,0,78,0,6.283);ctx.clip();ctx.fillStyle='rgba(251,248,241,.94)';ctx.fill();handText(ctx,'conformity',0,20,{size:62,weight:700,wobble:false});ctx.restore();
      ctx.lineWidth=12;ctx.strokeStyle=PAL.ink;ctx.beginPath();ctx.arc(0,0,78,0,6.283);ctx.stroke();ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(56,56);ctx.lineTo(120,120);ctx.stroke();ctx.restore();}
    // editable: pencil pushing social anxiety
    const pe=prog(t,C.editable-.1,.35)-prog(t,C.portable,.4);
    if(pe>0&&segs[2]){const ex=segs[2][0]+segs[2][1],ey=py-255;ctx.save();ctx.globalAlpha=clamp(pe*1.5);ctx.translate(ex+20+Math.sin(t*14)*4,ey+40);ctx.rotate(-.7);
      const pb=new Path2D();pb.rect(0,-14,190,28);cutout(ctx,pb,PAL.yel,151,.4);const tip=new Path2D();tip.moveTo(0,-14);tip.lineTo(-34,0);tip.lineTo(0,14);tip.closePath();cutout(ctx,tip,PAL.kraft,152,.3);
      ctx.fillStyle=PAL.ink;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-22,-5);ctx.lineTo(-22,5);ctx.fill();const er=new Path2D();er.rect(190,-14,30,28);cutout(ctx,er,'#e89aa0',153,.3);ctx.restore();
      handText(ctx,'+',ex+70,ey-40,{size:80,col:PAL.red,frac:prog(t,C.editable+.2,.2),weight:700});}
    // portable: postcards with red thread
    const PC=[['cafe','café',C.cafe,1330,810,-.05,0],['nego','negotiation',C.nego,1880,830,.03,2],['evac','evacuation',C.evac,2430,810,-.03,3]];
    PC.forEach(([k,l,tc,x,y,r,gi],i)=>{const a=prog(t,tc-.2,.55);if(a<=0)return;
      const sg=segs[gi];if(sg){const th=prog(t,tc+.2,.5);inkStroke(ctx,arcPts(sg[0]+sg[1]/2,py-214,x,y-150,-40,20),{w:3,col:PAL.red,frac:th,seed:170+i,amp:1.5});
        if(th>=1){ctx.fillStyle=PAL.red;ctx.beginPath();ctx.arc(x,y-150,9,0,6.283);ctx.fill();}}
      postcard(ctx,x,lerp(y+500,y,eOut(a)),500,330,r+lerp(.3,0,eOut(a)),1,k,l,t,300+i);});
  }
  ctx.restore();
}
const SCENERY=[{x:1500,k:'tree'},{x:2150,k:'cafe'},{x:2800,k:'bench'},{x:3300,k:'tree'},{x:3750,k:'house'},{x:4300,k:'tree'},{x:4700,k:'lamp'}];
const NOTES5=[{x:1700,s:'someone asks for help',c:PAL.yel},{x:2550,s:'an offer is refused',c:'#f4b6b0'},{x:3450,s:'a friend cancels',c:'#bfe0ee'}];
function scenery(ctx,k,x,gy,s,seed){if(s<=0)return;ctx.save();ctx.translate(x,gy);ctx.scale(s,s);
  if(k==='tree'){cutout(ctx,tornRect(-14,-150,28,150,seed,3,10),'#8a5a35',seed,.3);const c=new Path2D();c.arc(0,-190,95,0,6.283);cutout(ctx,c,PAL.mint,seed+1,.4);const c2=new Path2D();c2.arc(-40,-160,60,0,6.283);cutout(ctx,c2,'#5f9d7c',seed+2,.3);}
  if(k==='cafe'){cutout(ctx,tornRect(-160,-260,320,260,seed,3,14),'#e9d6b0',seed,.4);const roof=new Path2D();roof.moveTo(-185,-255);roof.lineTo(185,-255);roof.lineTo(150,-320);roof.lineTo(-150,-320);roof.closePath();cutout(ctx,roof,PAL.red,seed+1,.35);
    for(let i=0;i<8;i++){ctx.fillStyle=i%2?PAL.white:PAL.red;ctx.fillRect(-160+i*40,-250,40,34);}cutout(ctx,tornRect(-40,-120,80,120,seed+2,2,10),'#7a4b2c',seed+2,.2);cutout(ctx,tornRect(-140,-180,80,70,seed+3,2,10),PAL.blue,seed+3,.2);cutout(ctx,tornRect(60,-180,80,70,seed+4,2,10),PAL.blue,seed+4,.2);
    handText(ctx,'café',0,-270,{size:44,col:PAL.white,weight:700});}
  if(k==='bench'){cutout(ctx,tornRect(-110,-70,220,26,seed,2,10),'#a8743f',seed,.3);cutout(ctx,tornRect(-110,-36,220,20,seed+1,2,10),'#a8743f',seed+1,.3);inkStroke(ctx,[[-90,-16],[-96,0]],{w:6,seed});inkStroke(ctx,[[90,-16],[96,0]],{w:6,seed:seed+1});}
  if(k==='house'){cutout(ctx,tornRect(-120,-200,240,200,seed,3,14),PAL.white,seed,.4);const roof=new Path2D();roof.moveTo(-145,-195);roof.lineTo(0,-300);roof.lineTo(145,-195);roof.closePath();cutout(ctx,roof,PAL.blue,seed+1,.35);cutout(ctx,tornRect(-30,-100,60,100,seed+2,2,10),PAL.yel,seed+2,.2);}
  if(k==='lamp'){cutout(ctx,tornRect(-8,-240,16,240,seed,1,10),'#3a3a44',seed,.3);const hd=new Path2D();hd.arc(0,-250,30,Math.PI,0);cutout(ctx,hd,'#3a3a44',seed+1,.3);const gl=ctx.createRadialGradient(0,-240,4,0,-240,110);gl.addColorStop(0,'rgba(255,214,120,.45)');gl.addColorStop(1,'rgba(255,214,120,0)');ctx.fillStyle=gl;ctx.fillRect(-110,-350,220,220);}
  ctx.restore();}
function stickyNote(ctx,x,y,rot,s,col,text,seed,size=40,w=230,h=200){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  const p=tornRect(-w/2,-h/2,w,h,seed,1.5,24);cutout(ctx,p,col,seed,.5);const words=text.split(' ');let lines=[''];
  ctx.font=`700 ${size}px ${FONT.hand}`;for(const wd of words){const tst=(lines[lines.length-1]+' '+wd).trim();if(ctx.measureText(tst).width>w-34)lines.push(wd);else lines[lines.length-1]=tst;}
  lines.forEach((l,i)=>handText(ctx,l,0,-((lines.length-1)*size*.95)/2+i*size*.95+size*.3,{size,weight:700}));ctx.restore();}
function scene5(ctx,t){
  const t0=C.s5_in,spd=210,ax=(t-t0)*spd+720,cam=ax-720;
  // sky and ground
  ctx.drawImage(BGPAPER,0,0);{const sk=ctx.createLinearGradient(0,0,0,760);sk.addColorStop(0,'rgba(120,180,214,.55)');sk.addColorStop(1,'rgba(200,226,236,.35)');ctx.fillStyle=sk;ctx.fillRect(0,0,W,780);}
  [[0.18,560,'#a9c9a0',412],[0.35,640,'#8fbb86',413]].forEach(([pf,hy,col,sd])=>{const off=-(cam*pf)%900;ctx.save();ctx.translate(off,0);const hp=new Path2D();hp.moveTo(-100,780);for(let x=-100;x<=W+1000;x+=60)hp.lineTo(x,hy+Math.sin(x*.006+sd)*40+Math.sin(x*.017)*14);hp.lineTo(W+1000,780);hp.closePath();cutout(ctx,hp,col,sd,.2);ctx.restore();});
  [[300,160,1],[1100,110,.7],[1650,210,.9]].forEach(([x,y,s],i)=>{const xx=((x-cam*.25)%(W+500)+W+500)%(W+500)-250;ctx.save();ctx.translate(xx,y);ctx.scale(s,s);const cl=new Path2D();cl.arc(0,0,60,0,6.283);cl.arc(60,10,48,0,6.283);cl.arc(-55,12,44,0,6.283);cutout(ctx,cl,PAL.white,400+i,.25);ctx.restore();});
  const gy=780;const ground=tornRect(-100,gy-10,W+200,H-gy+80,410,6,30);cutout(ctx,ground,'#9cc27a',411,.3);
  ctx.save();ctx.translate(-cam,0);
  const penX=ax+560+Math.min(0,(t-t0-0.3))*0;const drawn=penX;
  // road drawn up to the pen
  const road=[];for(let x=cam-200;x<drawn;x+=40)road.push([x,gy+60+Math.sin(x*.004)*14]);
  const road2=road.map(p=>[p[0],p[1]+70]);
  ctx.save();ctx.fillStyle=paperPattern(ctx,PAL.sand,4);ctx.beginPath();road.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));for(let i=road2.length-1;i>=0;i--)ctx.lineTo(road2[i][0],road2[i][1]);ctx.closePath();ctx.fill();ctx.restore();
  inkStroke(ctx,road,{w:5,seed:420,amp:2.5});inkStroke(ctx,road2,{w:5,seed:421,amp:2.5});
  // scenery pops in as the pen passes
  SCENERY.forEach((o,i)=>{if(o.x>cam+W+400)return;const k=clamp((drawn-o.x+120)/260);scenery(ctx,o.k,o.x,gy+30,eBack(k),440+i*7);});
  // pencil drawing the world
  ctx.save();ctx.translate(drawn,gy+60+Math.sin(drawn*.004)*14-4+Math.sin(t*22)*6);ctx.rotate(-.9);
  const pb=new Path2D();pb.rect(0,-18,260,36);cutout(ctx,pb,PAL.yel,460,.7);const tip=new Path2D();tip.moveTo(0,-18);tip.lineTo(-46,0);tip.lineTo(0,18);tip.closePath();cutout(ctx,tip,PAL.kraft,461,.4);ctx.fillStyle=PAL.ink;ctx.beginPath();ctx.moveTo(-46,0);ctx.lineTo(-30,-6);ctx.lineTo(-30,6);ctx.fill();const er=new Path2D();er.rect(260,-18,40,36);cutout(ctx,er,'#e89aa0',462,.3);ctx.restore();
  // situations appear as sticky notes
  NOTES5.forEach((n,i)=>{const k=prog(t,C.writes+.4+i*.8,.45);stickyNote(ctx,n.x,330+(i%2)*50,(i-1)*.06,eBack(k),n.c,n.s,470+i,54,340,230);
    if(k>0)inkStroke(ctx,[[n.x,450+(i%2)*50],[n.x+10,560],[n.x-8,660]],{w:3,seed:480+i,frac:k,alpha:.5});});
  // agent walking
  const fr=['A','B','A','C'][Math.floor(t*8)%4];
  drawSticker(ctx,'agent',ax,gy+10-Math.abs(Math.sin(t*8))*10,{scale:11,dir:'right',frame:fr,lift:.6});
  const tgy=gy-215-Math.abs(Math.sin(t*8))*10;const tg=new Path2D();tg.rect(ax+70,tgy,84,48);cutout(ctx,tg,PAL.white,490,.3);handText(ctx,'AI',ax+112,tgy+38,{size:42,col:'#2fa6a0',weight:700});
  ctx.restore();
}
const NOTES6=['asking for a raise','a friend cancels','small talk at a party','an offer is refused','coin toss for a seat','apologizing','a noisy neighbour','saying no kindly','splitting the bill','reading a hint','lucky parking spot','repairing trust','first day at work','a joke falls flat','waiting in line'];
const NCOL=[PAL.yel,'#f4b6b0','#bfe0ee','#cfe8c8',PAL.yel,'#e3d3f2'];
const WEAK=[3,7,11],LUCK=[4,10],NEXT=[0,8];
function notePos(i){const col=i%5,row=Math.floor(i/5);return[330+col*315+(hash(i,2,3)-.5)*30,250+row*290+(hash(i,4,5)-.5)*30,(hash(i,6,7)-.5)*.14];}
function scene6(ctx,t){
  ctx.drawImage(BGCORK,0,0);
  NOTES6.forEach((s,i)=>{let [x,y,r]=notePos(i);const k=prog(t,C.s6_in+.2+i*.035,.4);let sc=eBack(k),al=1;
    if(LUCK.includes(i)){const j=LUCK.indexOf(i),c=prog(t,C.unlucky+.1+j*.3,.35),fly=prog(t,C.unlucky+.35+j*.3,.6);
      if(c>0){sc*=1-.55*eOut(c);r+=c*1.5*(j?1:-1);}if(fly>0){x+=(j?1:-1)*fly*520;y+=-Math.sin(fly*Math.PI)*240+fly*fly*1250;r+=fly*7*(j?1:-1);al=1-fly*.4;}}
    ctx.save();ctx.globalAlpha=al;stickyNote(ctx,x,y,r,sc,NCOL[i%NCOL.length],s,600+i);ctx.restore();
    if(k>0&&!LUCK.includes(i)){ctx.fillStyle=PAL.red;ctx.beginPath();ctx.arc(x,y-86,10,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(x-3,y-89,3,0,6.283);ctx.fill();}
    if(LUCK.includes(i)&&t>C.s6_in+1&&t<C.unlucky+.1){const d=new Path2D();d.rect(x+50,y-70,50,50);ctx.save();ctx.strokeStyle=PAL.ink;ctx.lineWidth=4;ctx.stroke(d);ctx.fillStyle=PAL.ink;[[62,-58],[88,-32],[75,-45]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(x+a,y+b,5,0,6.283);ctx.fill();});ctx.restore();}});
  // weak spots circled, then trained into checks
  WEAK.forEach((i,j)=>{const[x,y]=notePos(i);const c=prog(t,C.weak+.2+j*.35,.35),done=prog(t,C.trains+.3+j*.5,.25);
    if(c>0&&done<1)inkStroke(ctx,circlePts(x,y,150,125,1.1,56,700+j),{w:9,col:PAL.red,frac:c,seed:700+j,alpha:1-done});
    if(done>0)inkStroke(ctx,[[x-60,y+10],[x-15,y+60],[x+80,y-70]],{w:14,col:'#2f8f5b',frac:done,seed:710+j});});
  NEXT.forEach((i,j)=>{const[x,y]=notePos(i);const c=prog(t,C.there+.8+j*.2,.35);if(c>0)inkStroke(ctx,circlePts(x,y,150,125,1.1,56,720+j),{w:9,col:PAL.red,frac:c,seed:720+j});});
  // the agent hops between weak spots
  const hops=WEAK.map(i=>notePos(i));let ax=180,ay=900,sx=ax,sy=ay;
  const tt=t-(C.trains-.1);
  if(tt>0){const seg=Math.min(2,Math.floor(tt/.5)),f=clamp((tt-seg*.5)/.3);const from=seg===0?[180,900]:[hops[seg-1][0]+110,hops[seg-1][1]+70],to=[hops[seg][0]+110,hops[seg][1]+70];
    ax=lerp(from[0],to[0],eInOut(f));ay=lerp(from[1],to[1],eInOut(f))-Math.sin(f*Math.PI)*140;}
  const vis=prog(t,C.s6_in+.6,.4);drawSticker(ctx,'agent',ax,ay,{scale:8,s:eBack(vis),lift:.7,dir:'right'});
}
function letter(ctx,ch,x,y,col,font,rot,s,seed,textCol=PAL.ink){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  cutout(ctx,tornRect(-150,-170,300,340,seed,4,22),col,seed,.6);ctx.fillStyle=textCol;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ch,0,14);ctx.restore();}
function scene7(ctx,t){
  bgPaper(ctx);
  const L=[['Y',650,440,PAL.red,`900 330px ${FONT.serif}`,-.07,PAL.white],['A',960,420,PAL.yel,`900 330px ${FONT.serif}`,.05,PAL.ink],['X',1270,445,PAL.blue,`italic 900 330px ${FONT.serif}`,-.04,PAL.white]];
  L.forEach(([ch,x,y,col,font,rot,tc],i)=>{const k=prog(t,C.stamp+i*.16,.18);if(k<=0)return;const s=lerp(1.9,1,eOut(k)),fl=Math.sin(t*1.3+i)*6;letter(ctx,ch,x,y+fl,col,font,rot+Math.sin(t*.9+i)*.01,s,800+i,tc);});
  const w1=measure(ctx,'how people decide,',78),w2=measure(ctx,' and how agents learn to.',78),x0=960-(w1+w2)/2;
  handText(ctx,'how people decide,',x0,760,{size:78,frac:prog(t,C.decide,.9),align:'left',weight:700});
  handText(ctx,' and how agents learn to.',x0+w1,760,{size:78,col:'#2f7fa8',frac:prog(t,C.learn,1.0),align:'left',weight:700});
  const pr=prog(t,C.products,.5);if(pr>0){[['SocietaGene',720,PAL.yel],['SocietaBox',1200,'#bfe0ee']].forEach(([s,x,c],i)=>{const k=eBack(prog(t,C.products+i*.15,.45));if(k<=0)return;ctx.save();ctx.translate(x,900);ctx.rotate(i?.03:-.03);ctx.scale(k,k);
      const w=measure(ctx,s,54,FONT.serif,700)+60;cutout(ctx,tornRect(-w/2,-44,w,88,850+i,2,16),c,850+i,.4);ctx.fillStyle=PAL.ink;ctx.font=`700 54px ${FONT.serif}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,4);tape(ctx,-w/2+20,-40,70,26,-.5,860+i);ctx.restore();});}
  const pk=eOut(prog(t,C.decide,.6)),pk2=eOut(prog(t,C.learn,.6));
  drawSticker(ctx,'priya',lerp(-120,190,pk),880,{scale:12,rot:.12,lift:.6});
  drawSticker(ctx,'agent',lerp(W+120,W-190,pk2),870,{scale:12,rot:-.12,lift:.6,dir:'left'});
}

/* ---------- compositor ---------- */
function render(ctx,t){
  BOIL=Math.floor(t*12);
  ctx.save();ctx.clearRect(0,0,W,H);
  const dx=Math.sin(t*.35)*5,dy=Math.cos(t*.27)*4;ctx.translate(dx,dy);ctx.translate(-8,-6);ctx.scale((W+16)/W,(H+12)/H);
  if(t<4.3)scene1(ctx,t);else if(t<10.3)scene2(ctx,t);else if(t<23.95)scene34(ctx,t);else if(t<28.43)scene5(ctx,t);else if(t<35.02)scene6(ctx,t);else scene7(ctx,t);
  swipe(ctx,t,4.02,PAL.kraft,901);swipe(ctx,t,10.02,PAL.blue,902);swipe(ctx,t,23.67,PAL.yel,903);swipe(ctx,t,28.15,PAL.mint,904);swipe(ctx,t,34.75,PAL.red,905);
  ctx.restore();
  // vignette and film grain
  const vg=ctx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*1.05);vg.addColorStop(0,'rgba(40,28,14,0)');vg.addColorStop(1,'rgba(40,28,14,.28)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.05;ctx.globalCompositeOperation='overlay';ctx.drawImage(GRAIN[BOIL%4],0,0,W,H);ctx.restore();
  // fade in / out
  const fin=1-prog(t,0,.5),fout=prog(t,TLD.total-.9,.9);if(fin>0||fout>0){ctx.fillStyle=`rgba(239,230,211,${Math.max(fin,fout)})`;ctx.fillRect(0,0,W,H);}
}
window.YAXFilm={W,H,render,buildTextures,duration:TLD.total};
})();
