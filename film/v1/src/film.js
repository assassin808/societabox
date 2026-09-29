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

/* ---------- v1 scenes: the cognitive genome, calibrated ---------- */
function bgPaper(ctx){ctx.drawImage(BGPAPER,0,0);}
const TRAITS=[{n:'loss aversion',c:PAL.blue,v:.62},{n:'curiosity',c:PAL.mint,v:.7},{n:'social anxiety',c:PAL.lilac,v:.46},{n:'following the crowd',c:PAL.yel,v:.3},{n:'impulsivity',c:PAL.coral,v:.25},{n:'warmth',c:PAL.sand,v:.8}];
function knob(ctx,x,y,col,seed,s=1){const k=new Path2D();k.rect(-34*s,-22*s,68*s,44*s);ctx.save();ctx.translate(x,y);cutout(ctx,k,col,seed,.55);ctx.fillStyle='rgba(31,42,48,.55)';ctx.fillRect(-26*s,-2*s,52*s,4*s);ctx.restore();}
function gauge(ctx,cx,cy,r,val,target,{label='',s=1,showNum=true,seed=1}={}){
  if(s<=0)return;ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);
  const p=new Path2D();p.moveTo(-r-30,20);p.arc(0,0,r+30,Math.PI,0);p.lineTo(r+30,20);p.closePath();cutout(ctx,p,PAL.white,seed,.5);
  // coloured band
  ctx.save();ctx.lineWidth=r*.12;ctx.strokeStyle='rgba(91,155,196,.35)';ctx.beginPath();ctx.arc(0,0,r*.84,Math.PI,2*Math.PI);ctx.stroke();ctx.restore();
  for(let i=0;i<=16;i++){const a=Math.PI+Math.PI*i/16,L=i%4===0?r*.2:r*.1;inkStroke(ctx,[[Math.cos(a)*(r*.98),Math.sin(a)*(r*.98)],[Math.cos(a)*(r*.98-L),Math.sin(a)*(r*.98-L)]],{w:i%4===0?5:3,seed:seed*40+i,amp:1});
    if(i%4===0)handText(ctx,String(i/4),Math.cos(a)*(r*.64),Math.sin(a)*(r*.64)+r*.07,{size:r*.2,weight:700});}
  if(target!=null){const a=Math.PI+Math.PI*target/4;ctx.save();ctx.fillStyle=PAL.red;ctx.translate(Math.cos(a)*(r*1.06),Math.sin(a)*(r*1.06));ctx.rotate(a+Math.PI/2);ctx.beginPath();ctx.moveTo(0,-r*.02);ctx.lineTo(-r*.07,-r*.14);ctx.lineTo(r*.07,-r*.14);ctx.closePath();ctx.fill();ctx.restore();}
  const a=Math.PI+Math.PI*clamp(val/4,0,1);inkStroke(ctx,[[0,0],[Math.cos(a)*r*.8,Math.sin(a)*r*.8]],{w:r*.045,col:PAL.ink,seed:seed+7,amp:1.2});
  ctx.fillStyle=PAL.ink;ctx.beginPath();ctx.arc(0,0,r*.07,0,6.283);ctx.fill();
  if(showNum)handText(ctx,val.toFixed(1),0,r*.45+10,{size:r*.36,weight:700,col:PAL.ink});
  if(label)handText(ctx,label,0,-r-50,{size:Math.max(34,r*.16),weight:700});
  ctx.restore();
}
function sceneA(ctx,t){ // a set of dials
  bgPaper(ctx);
  // description card, crossed out
  const ck=prog(t,C.s1_in,.45),cx=prog(t,C.s1_in+.9,.5),fade=prog(t,C.dials-.3,.5);
  if(ck>0){ctx.save();ctx.globalAlpha=1-fade*.6;ctx.translate(360,lerp(760,560,eOut(ck))-fade*40);ctx.rotate(-.05);
    cutout(ctx,tornRect(-230,-150,460,300,11,2.5,18),PAL.white,11,.5);
    ['Priya, 23.','Grad student in Vancouver.','Kind, a bit shy,','goes along with friends.'].forEach((l,i)=>handText(ctx,l,-200,-80+i*56,{size:48,align:'left',weight:600}));
    if(cx>0){inkStroke(ctx,[[-200,-100],[200,120]],{w:9,col:PAL.red,frac:cx,seed:21});inkStroke(ctx,[[-200,120],[200,-100]],{w:9,col:PAL.red,frac:clamp(cx*1.4-.4),seed:22});}
    tape(ctx,0,-150,120,34,.04,12);ctx.restore();
    handText(ctx,'a description',360,300,{size:54,col:PAL.muted||'#6b5a44',frac:ck,weight:600});}
  drawSticker(ctx,'agent',360,900,{scale:9,s:eBack(prog(t,C.s1_in+.2,.4)),rot:-.05,lift:.5});
  // the mixing board of dials
  const bk=prog(t,C.dials-.6,.5);if(bk>0){ctx.save();ctx.translate(lerp(W+500,1230,eOut(bk)),560);ctx.rotate(.015);
    cutout(ctx,tornRect(-560,-380,1120,760,31,3,24),PAL.kraft,31,.6);
    TRAITS.forEach((g,i)=>{const x=-460+i*184,k=prog(t,C.dials-.35+i*.1,.35);if(k<=0)return;
      inkStroke(ctx,[[x,-250],[x,170]],{w:6,seed:40+i});for(let j=0;j<=4;j++)inkStroke(ctx,[[x-18,170-j*105],[x+18,170-j*105]],{w:3,seed:50+i*5+j,amp:1});
      const vv=g.v+Math.sin(t*1.3+i)*.04,y=170-vv*420;ctx.save();ctx.translate(x,y);ctx.scale(eBack(k),eBack(k));knob(ctx,0,0,g.c,60+i);ctx.restore();
      const words=g.n.split(' ');words.forEach((w,wi)=>handText(ctx,w,x,250+wi*42,{size:40,weight:700,frac:k}));});
    tape(ctx,-480,-380,120,36,-.3,33);tape(ctx,480,-380,120,36,.3,34);ctx.restore();
    handText(ctx,'a set of dials',1230,120,{size:92,weight:700,frac:prog(t,C.dials-.1,.6)});}
}
function sceneB(ctx,t){ // pick a trait, set a level
  bgPaper(ctx);
  handText(ctx,'following the crowd',960,210,{size:104,weight:700,frac:prog(t,C.crowd-.4,.8)});
  const u=prog(t,C.crowd+.3,.4);if(u>0){const pts=[];for(let i=0;i<=30;i++)pts.push([600+i*24,250+Math.sin(i*.8)*6]);inkStroke(ctx,pts,{w:6,col:PAL.yel,frac:u,seed:71});}
  // big slider
  const x0=360,x1=1560,y=600,ap=prog(t,C.s2_in+.15,.5);if(ap<=0)return;
  ctx.save();ctx.globalAlpha=clamp(ap*1.5);
  cutout(ctx,tornRect(x0-80,y-110,x1-x0+160,220,81,3,20),PAL.white,81,.45);
  inkStroke(ctx,[[x0,y],[x1,y]],{w:8,seed:82});
  for(let i=0;i<=16;i++){const x=lerp(x0,x1,i/16),L=i%4===0?34:16;inkStroke(ctx,[[x,y-L],[x,y+L]],{w:i%4===0?5:3,seed:90+i,amp:1});if(i%4===0)handText(ctx,String(i/4),x,y+86,{size:58,weight:700});}
  const setp=eInOut(prog(t,C.set+.2,.8)),val=lerp(1.0,2.6,setp),kx=lerp(x0,x1,val/4);
  // pencil hand pushing the knob
  knob(ctx,kx,y,PAL.yel,95,1.35);
  if(t<C.level+1.4){ctx.save();ctx.translate(kx+14,y+34+Math.sin(t*16)*2);ctx.rotate(1.0);const pb=new Path2D();pb.rect(0,-16,220,32);cutout(ctx,pb,PAL.red,96,.6);const tip=new Path2D();tip.moveTo(0,-16);tip.lineTo(-40,0);tip.lineTo(0,16);tip.closePath();cutout(ctx,tip,PAL.kraft,97,.3);ctx.restore();}
  const nk=prog(t,C.level,.35);if(nk>0){ctx.save();ctx.translate(kx,y-150);ctx.scale(eBack(nk),eBack(nk));handText(ctx,'2.6',0,0,{size:120,col:PAL.red,weight:700,wobble:false});ctx.restore();
    handText(ctx,'target, out of 4',kx+240,y-230,{size:50,col:PAL.red,frac:prog(t,C.level+.6,.6),weight:600});inkStroke(ctx,arcPts(kx+170,y-230,kx+60,y-190,-20,10),{w:4,col:PAL.red,frac:prog(t,C.level+.6,.6),seed:98});}
  ctx.restore();
  drawSticker(ctx,'agent',1700,860,{scale:10,rot:.05,lift:.5,dir:'left'});
}
function aschCard(ctx,x,y,rot,s,t){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  cutout(ctx,tornRect(-330,-200,660,400,111,3,20),PAL.white,111,.55);
  inkStroke(ctx,[[-260,-110],[-260,60]],{w:9,seed:112});handText(ctx,'X',-260,100,{size:44,weight:700});
  [[-60,-40,40,'A'],[40,-150,60,'B'],[140,-80,60,'C']].forEach(([lx,ty,by,l],i)=>{inkStroke(ctx,[[lx,ty],[lx,by]],{w:9,seed:113+i});handText(ctx,l,lx,by+40,{size:44,weight:700});});
  const gp=prog(t,C.asch+.3,.6);['c1','c2','c3','c4'].forEach((w,i)=>{if(gp<=0)return;const sx=-250+i*120,sy=250;drawSticker(ctx,w,sx,sy,{scale:4,s:eBack(clamp(gp*1.2-i*.1)),lift:.3});
    if(gp>.5)handText(ctx,'"B"',sx+10,sy-60,{size:34,col:PAL.red,weight:700});});
  drawSticker(ctx,'agent',260,250,{scale:4,lift:.3,s:eBack(prog(t,C.asch,.3))});handText(ctx,'?',290,190,{size:48,weight:700,frac:prog(t,C.asch+.8,.2)});
  handText(ctx,"Asch's line test, 1951",0,-150,{size:40,weight:700,col:'#5b4636'});tape(ctx,0,-200,120,34,-.03,114);ctx.restore();}
function towelCard(ctx,x,y,rot,s,t){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  cutout(ctx,tornRect(-330,-200,660,400,121,3,20),PAL.white,121,.55);
  inkStroke(ctx,[[-230,-60],[20,-60]],{w:10,seed:122});const tw=tornRect(-200,-58,190,230,123,3,12);cutout(ctx,tw,PAL.blue,123,.35);
  for(let i=0;i<6;i++){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-195,-40+i*36,180,6);}
  const sg=tornRect(60,-90,230,170,124,2,14);cutout(ctx,sg,PAL.yel,124,.35);
  ['Most guests','here reuse','their towels.'].forEach((l,i)=>handText(ctx,l,175,-45+i*44,{size:36,weight:700}));
  handText(ctx,'Hotel towel study, 2008',0,-150,{size:40,weight:700,col:'#5b4636'});tape(ctx,0,-200,120,34,.03,125);ctx.restore();}
const PROBS=[.10,.22,.33,.20,.15];
function sceneC(ctx,t){ // measure in classic human studies
  bgPaper(ctx);
  aschCard(ctx,520,330,-.03,eOut(prog(t,C.asch-.25,.5)),t);
  towelCard(ctx,1400,330,.025,eOut(prog(t,C.towel-.25,.5)),t);
  handText(ctx,'classic human studies',960,110,{size:70,weight:700,frac:prog(t,C.measure,.8)});
  // answer bars A-E feeding the index
  const bk=prog(t,C.score-.3,.4);if(bk>0){ctx.save();ctx.globalAlpha=clamp(bk*1.5);ctx.translate(520,930);
    cutout(ctx,tornRect(-380,-300,760,360,131,2.5,20),PAL.white,131,.45);
    ['A','B','C','D','E'].forEach((l,i)=>{const x=-280+i*140,h=PROBS[i]*560*eOut(prog(t,C.score+i*.12,.45));
      const b=tornRect(x-40,-h,80,h,140+i,1.5,10);if(h>2)cutout(ctx,b,[PAL.red,PAL.coral,PAL.yel,PAL.mint,PAL.blue][i],140+i,.2);
      handText(ctx,l,x,40,{size:44,weight:700});handText(ctx,String(4-i),x,-h-14,{size:30,col:'#6b5a44',weight:600,frac:prog(t,C.score+i*.12+.3,.2)});});
    handText(ctx,'its answers, weighted 4 to 0',0,-250,{size:40,weight:700});ctx.restore();}
  const gk=prog(t,C.score+.6,.45);
  gauge(ctx,1410,900,230,lerp(0,1.9,eOut(prog(t,C.score+.8,.9))),2.6,{label:'Cognitive Bias Index',s:eBack(gk),seed:3});
  if(gk>0){inkStroke(ctx,arcPts(900,760,1150,780,-40,16),{w:5,frac:prog(t,C.score+.7,.5),seed:150});}
}
function lever(ctx,x,y,label,pulled,seed){ctx.save();ctx.translate(x,y);
  cutout(ctx,tornRect(-150,-70,300,140,seed,2,16),PAL.white,seed,.45);
  const ang=lerp(-.9,.9,pulled);ctx.save();ctx.translate(-80,20);ctx.rotate(ang);inkStroke(ctx,[[0,0],[0,-110]],{w:10,seed:seed+1});const k=new Path2D();k.arc(0,-118,20,0,6.283);cutout(ctx,k,PAL.red,seed+2,.4);ctx.restore();
  ctx.fillStyle=PAL.ink;ctx.beginPath();ctx.arc(-80,20,12,0,6.283);ctx.fill();
  handText(ctx,label,40,18,{size:46,weight:700});ctx.restore();}
function sceneD(ctx,t){ // adjust until it holds
  bgPaper(ctx);
  const L=[['prompt',C.prompt,'the input'],['inner state',C.inner,'the activations'],['weights',C.weights,'the parameters']];
  L.forEach(([n,tc,sub],i)=>{const k=prog(t,C.s4_in+.2+i*.15,.4);if(k<=0)return;ctx.save();ctx.translate(lerp(-400,0,eOut(k)),0);
    lever(ctx,330,300+i*250,n,eInOut(prog(t,tc,.35)),160+i*5);handText(ctx,sub,380,370+i*250,{size:34,col:'#6b5a44',weight:600,frac:prog(t,tc+.2,.5)});ctx.restore();});
  // the loop
  const lp=prog(t,C.s4_in+.3,1.0);if(lp>0){const cx=1320,cy=560,R=340;
    inkStroke(ctx,circlePts(cx,cy,R+60,R+20,.93,70,170),{w:5,frac:lp,seed:171,alpha:.7});
    [['set',-Math.PI/2],['measure',Math.PI/6],['adjust',Math.PI*5/6]].forEach(([w,a],i)=>{const k=prog(t,C.s4_in+.5+i*.3,.4);if(k<=0)return;ctx.save();ctx.translate(cx+Math.cos(a)*(R+60),cy+Math.sin(a)*(R+20));ctx.scale(eBack(k),eBack(k));
      const tw=measure(ctx,w,50)+40;cutout(ctx,tornRect(-tw/2,-38,tw,70,180+i,2,12),[PAL.yel,'#bfe0ee','#f4b6b0'][i],180+i,.35);handText(ctx,w,0,14,{size:50,weight:700});ctx.restore();});}
  // needle climbs to the target
  const v=1.9+.3*eOut(prog(t,C.prompt+.25,.5))+.25*eOut(prog(t,C.inner+.25,.5))+.15*eOut(prog(t,C.weights+.25,.5))+Math.sin(t*9)*.02*(1-prog(t,C.holds,.4));
  gauge(ctx,1320,660,250,v,2.6,{label:'',s:eBack(prog(t,C.s4_in+.1,.4)),seed:5});
  const hk=prog(t,C.holds+.3,.35);if(hk>0){inkStroke(ctx,[[1480,420],[1530,470],[1640,330]],{w:14,col:'#2f8f5b',frac:hk,seed:190});handText(ctx,'it holds',1640,520,{size:64,col:'#2f8f5b',weight:700,frac:prog(t,C.holds+.5,.5)});}
}
function sceneE(ctx,t){ // across models
  bgPaper(ctx);handText(ctx,'uncalibrated → calibrated, on any model',960,160,{size:92,weight:700,frac:prog(t,C.s5_in+.2,.7)});
  ['model A','model B','model C'].forEach((m,i)=>{const x=420+i*540,k=prog(t,C.s5_in+.15+i*.12,.4);if(k<=0)return;
    gauge(ctx,x,560,160,lerp([0.9,3.5,1.6][i],2.6,eInOut(prog(t,C.models-.55+i*.15,.45))),2.6,{s:eBack(k),seed:20+i});
    drawSticker(ctx,'agent',x,850,{scale:8,s:eBack(k),rot:(i-1)*.06,lift:.5});
    ctx.save();ctx.translate(x,970);const tw=measure(ctx,m,46)+40;cutout(ctx,tornRect(-tw/2,-34,tw,64,200+i,2,12),['#bfe0ee',PAL.yel,'#cfe8c8'][i],200+i,.3);handText(ctx,m,0,14,{size:46,weight:700});ctx.restore();
    const ck=prog(t,C.models-.05+i*.15,.25);if(ck>0)inkStroke(ctx,[[x+120,420],[x+150,450],[x+210,370]],{w:10,col:'#2f8f5b',frac:ck,seed:210+i});});
}
const CATS=[['Cognitive biases','following the crowd · framing',PAL.yel],['Personality','curious · anxious','#bfe0ee'],['Emotion','empathy · calm','#f4b6b0'],['Social behaviour','trust · fairness','#cfe8c8'],['Decisions','risk taking · patience','#e3d3f2'],['Values','tradition · generosity',PAL.sand]];
function sceneF(ctx,t){ // anything measured in humans
  bgPaper(ctx);
  CATS.forEach(([h,ex,col],i)=>{const k=prog(t,C.s6_in+.4+i*.25,.4);if(k<=0)return;const x=390+(i%3)*570,y=380+Math.floor(i/3)*330,r=(hash(i,3,9)-.5)*.08;
    ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.scale(eBack(k),eBack(k));cutout(ctx,tornRect(-250,-120,500,240,300+i,2.5,18),col,300+i,.5);
    ctx.fillStyle=PAL.ink;ctx.font=`700 54px ${FONT.serif}`;ctx.textAlign='center';ctx.fillText(h,0,-10);handText(ctx,ex,0,62,{size:42,weight:600});tape(ctx,0,-120,100,30,r,310+i);ctx.restore();});
  const w1='measured in humans',w2='set in an agent';
  handText(ctx,w1,560,1000,{size:76,weight:700,frac:prog(t,C.humans-.5,.8)});
  const ar=prog(t,C.humans+.3,.4);if(ar>0){inkStroke(ctx,[[900,975],[1080,975]],{w:6,frac:ar,seed:320,col:PAL.red});if(ar>=1)arrowHead(ctx,1080,975,0,26,PAL.red);}
  handText(ctx,w2,1390,1000,{size:76,weight:700,col:'#2f7fa8',frac:prog(t,C.agent-.4,.7)});
}
function letter(ctx,ch,x,y,col,font,rot,s,seed,textCol=PAL.ink){if(s<=0)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
  cutout(ctx,tornRect(-150,-170,300,340,seed,4,22),col,seed,.6);ctx.fillStyle=textCol;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ch,0,14);ctx.restore();}
function sceneG(ctx,t){ // logo
  bgPaper(ctx);
  const L=[['Y',650,420,PAL.red,`900 330px ${FONT.serif}`,-.07,PAL.white],['A',960,400,PAL.yel,`900 330px ${FONT.serif}`,.05,PAL.ink],['X',1270,425,PAL.blue,`italic 900 330px ${FONT.serif}`,-.04,PAL.white]];
  L.forEach(([ch,x,y,col,font,rot,tc],i)=>{const k=prog(t,C.stamp+i*.16,.18);if(k<=0)return;letter(ctx,ch,x,y+Math.sin(t*1.3+i)*6,col,font,rot+Math.sin(t*.9+i)*.01,lerp(1.9,1,eOut(k)),800+i,tc);});
  handText(ctx,'calibrating AI to behave like humans.',960,740,{size:82,weight:700,frac:prog(t,C.calib,1.2)});
  [['SocietaGene',640,PAL.yel,FONT.serif],['CoBRA · CHI 2026 Best Paper',1230,'#bfe0ee',FONT.serif]].forEach(([s,x,c,f],i)=>{const k=eBack(prog(t,C.badges+i*.2,.45));if(k<=0)return;ctx.save();ctx.translate(x,890);ctx.rotate(i?.025:-.03);ctx.scale(k,k);
    const w=measure(ctx,s,46,f,700)+60;cutout(ctx,tornRect(-w/2,-40,w,80,850+i,2,16),c,850+i,.4);ctx.fillStyle=PAL.ink;ctx.font=`700 46px ${f}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,0,4);tape(ctx,-w/2+20,-36,70,26,-.5,860+i);ctx.restore();});
  drawSticker(ctx,'agent',lerp(W+120,W-200,eOut(prog(t,C.calib,.6))),860,{scale:12,rot:-.12,lift:.6,dir:'left'});
  const g=prog(t,C.calib+.4,.5);if(g>0)gauge(ctx,210,880,110,2.6,2.6,{s:eBack(g),showNum:false,seed:9});
}
/* ---------- compositor ---------- */
function render(ctx,t){
  BOIL=Math.floor(t*12);
  ctx.save();ctx.clearRect(0,0,W,H);
  const dx=Math.sin(t*.35)*5,dy=Math.cos(t*.27)*4;ctx.translate(dx,dy);ctx.translate(-8,-6);ctx.scale((W+16)/W,(H+12)/H);
  const S=[C.s2_in,C.s3_in,C.s4_in,C.s5_in,C.s6_in,C.s7_in];
  if(t<S[0])sceneA(ctx,t);else if(t<S[1])sceneB(ctx,t);else if(t<S[2])sceneC(ctx,t);else if(t<S[3])sceneD(ctx,t);else if(t<S[4])sceneE(ctx,t);else if(t<S[5])sceneF(ctx,t);else sceneG(ctx,t);
  [PAL.kraft,PAL.blue,PAL.yel,PAL.mint,'#e3d3f2',PAL.red].forEach((col,i)=>swipe(ctx,t,S[i]-.275,col,901+i));
  ctx.restore();
  // vignette and film grain
  const vg=ctx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*1.05);vg.addColorStop(0,'rgba(40,28,14,0)');vg.addColorStop(1,'rgba(40,28,14,.28)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.05;ctx.globalCompositeOperation='overlay';ctx.drawImage(GRAIN[BOIL%4],0,0,W,H);ctx.restore();
  // fade in / out
  const fin=1-prog(t,0,.5),fout=prog(t,TLD.total-.9,.9);if(fin>0||fout>0){ctx.fillStyle=`rgba(239,230,211,${Math.max(fin,fout)})`;ctx.fillRect(0,0,W,H);}
}
window.YAXFilm={W,H,render,buildTextures,duration:TLD.total};
})();
