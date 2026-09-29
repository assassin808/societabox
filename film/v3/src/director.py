import json
V0=json.load(open('../film/timeline.json'))['lines']; CAL=json.load(open('cal_lines.json')); NEW=json.load(open('new_lines.json'))
def v0(i): return (f"v0line{i}.wav",V0[i]['text'],V0[i]['dur'])
def cal(i): return (f"cal{i}.wav",CAL[i]['text'],CAL[i]['dur'])
def nw(k): return (f"{k}.wav",NEW[k]['text'],NEW[k]['dur'])
PLAN=[ # (start, (src,text,dur))
 (1.4,v0(0)),(6.3,v0(1)),(13.0,nw('trad')),(20.9,v0(2)),(27.0,v0(3)),(36.1,cal(0)),(43.1,nw('impl')),
 (49.1,cal(1)),(58.4,cal(2)),(65.9,cal(3)),(68.8,nw('bridge')),(73.7,nw('l4b')),(79.2,v0(5)),(85.6,v0(6))]
SCENES=[0,5.9,12.6,20.6,35.5,42.6,48.6,57.8,65.2,68.4,73.4,78.8,85.0]
TOTAL=92.5
lines=[]
for i,(st,(src,txt,dur)) in enumerate(PLAN):
    n=len(txt);pos=0;ws=[]
    for w in txt.split(' '):
        k=txt.index(w,pos);ws.append({'w':w,'t':round(st+dur*k/n,3)});pos=k+len(w)
    lines.append({'i':i,'src':src,'text':txt,'start':st,'dur':round(dur,3),'words':ws})
def wt(src,word,nth=0):
    l=[x for x in lines if x['src']==src][0];c=0
    for x in l['words']:
        if x['w'].lower().strip('.,:').startswith(word):
            if c==nth: return x['t']
            c+=1
    raise KeyError(word)
C={}
C['s1_pop']=0.35; C['s1_q']=1.2; C['s1_guess']=wt('v0line0.wav','guess')
C['s2_in']=SCENES[1]; C['launch']=wt('v0line1.wav','launch'); C['price']=wt('v0line1.wav','new'); C['crisis']=wt('v0line1.wav','message'); C['rehearse']=wt('v0line1.wav',"can't"); C['clap']=wt('v0line1.wav','rehearse')
C['t_in']=SCENES[2]; C['surveys']=wt('trad.wav','surveys'); C['focus']=wt('trad.wav','focus'); C['personas']=wt('trad.wav','personas'); C['age']=wt('trad.wav','age'); C['job']=wt('trad.wav','job'); C['city']=wt('trad.wav','city')
C['s3_in']=SCENES[3]; C['deeper']=wt('v0line2.wav','deeper'); C['notwho']=wt('v0line2.wav','not'); C['how']=wt('v0line2.wav','how')
C['pan']=26.35; C['genome']=wt('v0line3.wav','genome'); C['readable']=wt('v0line3.wav','readable'); C['editable']=wt('v0line3.wav','editable'); C['portable']=wt('v0line3.wav','portable'); C['cafe']=wt('v0line3.wav','café'); C['nego']=wt('v0line3.wav','negotiation'); C['evac']=wt('v0line3.wav','evacuation')
C['i_in']=SCENES[5]; C['leans']=wt('impl.wav','leans'); C['ground']=wt('impl.wav','hold')
C['g_in']=SCENES[9]; C['together']=wt('bridge.wav','together'); C['world']=wt('bridge.wav','world')
C['s5_in']=SCENES[10]; C['writes']=wt('l4b.wav','writes'); C['play']=wt('l4b.wav','play')
C['s6_in']=SCENES[11]-0.25; C['weak']=wt('v0line5.wav','socially'); C['unlucky']=wt('v0line5.wav','unlucky'); C['trains']=wt('v0line5.wav','trains'); C['there']=wt('v0line5.wav','there')
C['s7_in']=SCENES[12]-0.25; C['stamp']=SCENES[12]; C['decide']=wt('v0line6.wav','how'); C['learn']=wt('v0line6.wav','agents'); C['products']=C['stamp']+4.2
K={}
K['s2_in']=SCENES[4]; K['crowd']=wt('cal0.wav','crowd'); K['set']=wt('cal0.wav','set'); K['level']=wt('cal0.wav','two'); K['dial']=wt('cal0.wav','dial')
K['s3_in']=SCENES[6]; K['measure']=wt('cal1.wav','measure'); K['asch']=wt('cal1.wav',"asch's"); K['towel']=wt('cal1.wav','hotel'); K['score']=wt('cal1.wav','score')-0.6
K['s4_in']=SCENES[7]; K['prompt']=wt('cal2.wav','prompt'); K['inner']=wt('cal2.wav','inner'); K['weights']=wt('cal2.wav','weights'); K['holds']=wt('cal2.wav','holds')
K['s5_in']=SCENES[8]; K['models']=wt('cal3.wav','models'); K['end']=SCENES[9]
SFX=[]
def s(t,k,**kw): SFX.append({'t':round(t,3),'k':k,**kw})
[s(C['s1_pop']+j*0.14,'pop',p=1+0.06*j) for j in range(7)]; s(C['s1_q'],'scribble',d=1.0)
for sc in SCENES[1:]:
    if sc not in (SCENES[10],): s(sc-0.25,'swoosh')
s(C['launch'],'paper'); s(C['price'],'paper'); s(C['crisis'],'paper'); s(C['rehearse'],'pop',p=.8); s(C['clap']+0.25,'clap')
s(C['surveys'],'paper'); s(C['surveys']+0.6,'pencil',d=0.9); s(C['focus'],'paper'); s(C['personas'],'paper'); [s(C[k],'pop',p=1.1+0.05*j) for j,k in enumerate(['age','job','city'])]
[s(C['s3_in']+0.2+j*0.12,'pop',p=1.1) for j in range(4)]; [s(C['notwho']+0.15+j*0.45,'scribble',d=0.3) for j in range(4)]; s(C['how'],'tape')
s(C['readable'],'paper'); s(C['editable'],'pencil'); s(C['cafe'],'paper'); s(C['nego'],'paper'); s(C['evac'],'paper')
[s(K['set']+0.25+j*0.09,'tick',p=1+0.03*j) for j in range(7)]; s(K['level']+0.9,'pencil',d=0.5)
[s(C['i_in']+0.3+j*0.35,'paper') for j in range(3)]; s(C['leans'],'ding',p=1.0)
s(K['asch'],'paper'); s(K['towel'],'paper'); [s(K['score']+j*0.12,'tick',p=0.9+0.05*j) for j in range(5)]; s(K['score']+0.9,'pop',p=0.8)
[s(K[k],'lever') for k in ('prompt','inner','weights')]; s(K['holds']+0.35,'ding',p=1.0)
[s(K['models']-0.05+j*0.15,'ding',p=1.1+0.1*j) for j in range(3)]
[s(C['g_in']+0.4+j*0.3,'pop',p=1.0+0.05*j) for j in range(6)]
s(C['writes'],'pencil',d=2.6); [s(C['writes']+0.4+j*0.8,'pop',p=1.2) for j in range(3)]
[s(C['weak']+0.2+j*0.35,'scribble',d=0.3) for j in range(3)]; [s(C['unlucky']+0.1+j*0.3,'crumple') for j in range(2)]
[s(C['trains']+0.3+j*0.5,'ding',p=1+0.12*j) for j in range(3)]; s(C['there']+0.8,'pop',p=1.3); s(C['there']+1.0,'pop',p=1.4)
[s(C['stamp']+j*0.16,'stamp',p=1-0.06*j) for j in range(3)]; s(C['products'],'paper')
SFX.sort(key=lambda x:x['t'])
json.dump({'total':TOTAL,'fps':30,'lines':lines,'cues':C,'kcues':K,'scenes':SCENES,'sfx':SFX,'bar':2.5},open('timeline.json','w'),indent=1)
for l in lines: print(round(l['start'],2),'-',round(l['start']+l['dur'],2),l['text'][:48])
print('stamp',C['stamp'],'bar',C['stamp']/2.5,'total',TOTAL)
