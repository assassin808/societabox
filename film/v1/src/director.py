import json
L=json.load(open('lines.json'))
starts=[0.9,4.0,8.9,15.3,21.25,23.7,27.2]
TOTAL=32.2
def word_times(i):
    txt=L[i]['text'];dur=L[i]['dur'];st=starts[i];n=len(txt);out=[];pos=0
    for w in txt.split(' '):
        k=txt.index(w,pos);out.append({'w':w,'t':round(st+dur*k/n,3)});pos=k+len(w)
    return out
lines=[{'i':i,'text':L[i]['text'],'start':starts[i],'dur':round(L[i]['dur'],3),'words':word_times(i)} for i in range(len(L))]
def wt(i,word):
    for x in lines[i]['words']:
        if x['w'].lower().strip('.,').startswith(word): return x['t']
    raise KeyError(word)
C={}
C['s1_in']=0.25; C['dials']=wt(0,'dials')
C['s2_in']=3.75; C['trait']=wt(1,'trait'); C['crowd']=wt(1,'crowd'); C['set']=wt(1,'set'); C['level']=wt(1,'two')
C['s3_in']=8.55; C['measure']=wt(2,'measure'); C['asch']=wt(2,"asch's"); C['towel']=wt(2,'hotel'); C['score']=C['asch']+0.75
C['s4_in']=15.0; C['prompt']=wt(3,'prompt'); C['inner']=wt(3,'inner'); C['weights']=wt(3,'weights'); C['holds']=wt(3,'holds')
C['s5_in']=20.85; C['models']=wt(4,'models')
C['s6_in']=22.95; C['humans']=wt(5,'humans'); C['agent']=wt(5,'agent')
C['s7_in']=26.7; C['stamp']=27.0; C['calib']=wt(6,'calibrating'); C['badges']=29.4
SFX=[]
def s(t,k,**kw): SFX.append({'t':round(t,3),'k':k,**kw})
s(C['s1_in']+0.3,'paper'); s(C['s1_in']+0.9,'scribble',d=0.5)
[s(C['dials']-0.35+j*0.1,'pop',p=1+0.05*j) for j in range(6)]
s(C['s2_in'],'swoosh'); [s(C['set']+0.25+j*0.09,'tick',p=1+0.03*j) for j in range(7)]; s(C['level']+0.9,'pencil',d=0.5)
s(C['s3_in'],'swoosh'); s(C['asch'],'paper'); s(C['towel'],'paper'); [s(C['score']+j*0.12,'tick',p=0.9+0.05*j) for j in range(5)]; s(C['score']+0.9,'pop',p=0.8)
s(C['s4_in'],'swoosh')
for k in ('prompt','inner','weights'): s(C[k],'lever')
s(C['holds']+0.35,'ding',p=1.0)
s(C['s5_in'],'swoosh'); [s(C['models']-0.05+j*0.15,'ding',p=1.1+0.1*j) for j in range(3)]
s(C['s6_in'],'swoosh'); [s(C['s6_in']+0.4+j*0.25,'pop',p=1.05+0.04*j) for j in range(6)]; s(C['agent'],'pencil',d=0.6)
s(C['s7_in'],'swoosh'); [s(C['stamp']+j*0.16,'stamp',p=1-0.06*j) for j in range(3)]; s(C['badges'],'paper'); s(C['badges']+0.2,'paper')
json.dump({'total':TOTAL,'fps':30,'lines':lines,'cues':C,'sfx':SFX,'bar':C['stamp']/11},open('timeline.json','w'),indent=1)
print(json.dumps(C)); print(len(SFX),'sfx')
