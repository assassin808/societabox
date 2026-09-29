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
