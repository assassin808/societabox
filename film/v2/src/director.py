import json
V0=json.load(open('../film/timeline.json')); CAL=json.load(open('cal_lines.json'))
T0=23.95; D=25.0; SHIFT_FROM=23.6
def sh(t): return round(t+D,3) if t>=SHIFT_FROM else t
lines=[]
for l in V0['lines']:
    st=sh(l['start']); lines.append({'src':f"v0line{l['i']}.wav",'text':l['text'],'start':st,'dur':l['dur'],'words':[{'w':w['w'],'t':sh(w['t']) if l['start']>=SHIFT_FROM else w['t']} for w in l['words']]})
cal_starts=[T0+0.6,31.5,40.3,47.0]
def words(txt,st,dur):
    out=[];pos=0;n=len(txt)
    for w in txt.split(' '):
        k=txt.index(w,pos);out.append({'w':w,'t':round(st+dur*k/n,3)});pos=k+len(w)
    return out
for i,l in enumerate(CAL):
    lines.append({'src':f"cal{i}.wav",'text':l['text'],'start':cal_starts[i],'dur':round(l['dur'],3),'words':words(l['text'],cal_starts[i],l['dur'])})
lines.sort(key=lambda x:x['start'])
for i,l in enumerate(lines): l['i']=i
def wt(src,word):
    l=[x for x in lines if x['src']==src][0]
    for x in l['words']:
        if x['w'].lower().strip('.,').startswith(word): return x['t']
    raise KeyError(word)
C={k:sh(v) for k,v in V0['cues'].items()}
K={}
K['s2_in']=T0; K['crowd']=wt('cal0.wav','crowd'); K['set']=wt('cal0.wav','set'); K['level']=wt('cal0.wav','two'); K['dial']=wt('cal0.wav','dial')
K['s3_in']=31.0; K['measure']=wt('cal1.wav','measure'); K['asch']=wt('cal1.wav',"asch's"); K['towel']=wt('cal1.wav','hotel'); K['score']=wt('cal1.wav','score')-0.6
K['s4_in']=39.6; K['prompt']=wt('cal2.wav','prompt'); K['inner']=wt('cal2.wav','inner'); K['weights']=wt('cal2.wav','weights'); K['holds']=wt('cal2.wav','holds')
K['s5_in']=46.3; K['models']=wt('cal3.wav','models'); K['end']=T0+D
SFX=[dict(x,t=sh(x['t'])) for x in V0['sfx']]
def s(t,k,**kw): SFX.append({'t':round(t,3),'k':k,**kw})
[s(K['set']+0.25+j*0.09,'tick',p=1+0.03*j) for j in range(7)]; s(K['level']+0.9,'pencil',d=0.5)
s(K['s3_in'],'swoosh'); s(K['asch'],'paper'); s(K['towel'],'paper'); [s(K['score']+j*0.12,'tick',p=0.9+0.05*j) for j in range(5)]; s(K['score']+0.9,'pop',p=0.8)
s(K['s4_in'],'swoosh'); [s(K[k],'lever') for k in ('prompt','inner','weights')]; s(K['holds']+0.35,'ding',p=1.0)
s(K['s5_in'],'swoosh'); [s(K['models']-0.05+j*0.15,'ding',p=1.1+0.1*j) for j in range(3)]
SFX.sort(key=lambda x:x['t'])
TOTAL=V0['total']+D
json.dump({'total':TOTAL,'fps':30,'lines':lines,'cues':C,'kcues':K,'sfx':SFX,'bar':2.5},open('timeline.json','w'),indent=1)
print('total',TOTAL); print({k:round(v,2) for k,v in K.items()}); print('stamp',C['stamp'],'s5_in',C['s5_in'])
for l in lines: print(round(l['start'],2),round(l['start']+l['dur'],2),l['text'][:50])
