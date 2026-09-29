import json
L=json.load(open('lines.json'))
starts=[1.2,4.3,10.5,15.8,24.2,28.5,35.6]
TOTAL=42.5
# word-level time estimates (character-proportional within each line)
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
C={}  # named visual cues, used by both the film and the sound design
C['s1_pop']=0.35; C['s1_q']=1.2; C['s1_guess']=wt(0,'guess')
C['s2_in']=4.05; C['launch']=wt(1,'launch'); C['price']=wt(1,'new'); C['crisis']=wt(1,'message'); C['rehearse']=wt(1,"can't"); C['clap']=wt(1,'rehearse')
C['s3_in']=10.05; C['deeper']=wt(2,'deeper'); C['notwho']=wt(2,'not'); C['how']=wt(2,'how')
C['genome']=wt(3,'genome'); C['readable']=wt(3,'readable'); C['editable']=wt(3,'editable'); C['portable']=wt(3,'portable'); C['cafe']=wt(3,'café'); C['nego']=wt(3,'negotiation'); C['evac']=wt(3,'evacuation')
C['s5_in']=23.7; C['writes']=wt(4,'writes'); C['play']=wt(4,'play')
C['s6_in']=28.15; C['weak']=wt(5,'socially'); C['unlucky']=wt(5,'unlucky'); C['trains']=wt(5,'trains'); C['there']=wt(5,'there')
C['s7_in']=34.75; C['stamp']=35.0; C['decide']=wt(6,'how'); C['learn']=wt(6,'agents'); C['products']=39.2
SFX=[]
def s(t,k,**kw): SFX.append({'t':round(t,3),'k':k,**kw})
for j in range(7): s(C['s1_pop']+j*0.14,'pop',p=1+0.06*j)
s(C['s1_q'],'scribble',d=1.0)
s(C['s2_in'],'swoosh'); s(C['launch'],'paper'); s(C['price'],'paper'); s(C['crisis'],'paper')
s(C['rehearse'],'pop',p=.8); s(C['clap']+0.25,'clap')
s(C['s3_in'],'swoosh'); [s(C['s3_in']+0.5+j*0.22,'pop',p=1.1+0.05*j) for j in range(4)]
[s(C['notwho']+0.1+j*0.28,'scribble',d=0.25) for j in range(4)]
s(C['how'],'tape')
s(C['readable'],'paper'); s(C['editable'],'pencil'); s(C['cafe'],'paper'); s(C['nego'],'paper'); s(C['evac'],'paper')
s(C['s5_in'],'swoosh'); s(C['writes'],'pencil',d=2.6)
for j in range(3): s(C['writes']+0.4+j*0.8,'pop',p=1.2)
s(C['s6_in'],'swoosh')
[s(C['weak']+0.2+j*0.35,'scribble',d=0.3) for j in range(3)]
[s(C['unlucky']+0.1+j*0.3,'crumple') for j in range(2)]
[s(C['trains']+0.3+j*0.5,'ding',p=1+0.12*j) for j in range(3)]
s(C['there']+0.8,'pop',p=1.3); s(C['there']+1.0,'pop',p=1.4)
s(C['s7_in'],'swoosh'); [s(C['stamp']+j*0.16,'stamp',p=1-0.06*j) for j in range(3)]
s(C['products'],'paper')
json.dump({'total':TOTAL,'fps':30,'lines':lines,'cues':C,'sfx':SFX},open('timeline.json','w'),indent=1)
print(json.dumps(C,indent=0)[:900]); print(len(SFX),'sfx')
