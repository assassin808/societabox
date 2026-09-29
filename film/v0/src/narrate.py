import sherpa_onnx, soundfile as sf, numpy as np, json, sys
M="/tmp/claude-0/-home-user-societabox/eb8b8a09-6fb6-58d5-a94c-bcfc815fac58/scratchpad/tts/package/kokoro-int8-en-v0_19"
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=M+"/model.int8.onnx",voices=M+"/voices.bin",tokens=M+"/tokens.txt",data_dir=M+"/espeak-ng-data"),num_threads=4),max_num_sentences=2)
tts=sherpa_onnx.OfflineTts(cfg)
LINES=[
 "Every big decision is a guess about people.",
 "A launch. A new price. A message in a crisis. You can't rehearse them on the real world.",
 "So YAX goes one layer deeper. Not who people are, but how they decide.",
 "We call it a cognitive genome. Readable, editable, and portable, from a café, to a negotiation, to an evacuation.",
 "Then we give AI agents a world that writes itself as they play.",
 "It finds where an agent is socially weak, not where it just got unlucky, and trains it right there.",
 "YAX. How people decide, and how agents learn to.",
]
sid=int(sys.argv[1]) if len(sys.argv)>1 else 1
out=[]
for i,l in enumerate(LINES):
    a=tts.generate(l,sid=sid,speed=0.94)
    s=np.array(a.samples,dtype=np.float32)
    # trim leading/trailing silence
    th=0.01*np.max(np.abs(s)); nz=np.where(np.abs(s)>th)[0]
    s=s[max(0,nz[0]-240):min(len(s),nz[-1]+2400)]
    sf.write(f"/tmp/claude-0/-home-user-societabox/eb8b8a09-6fb6-58d5-a94c-bcfc815fac58/scratchpad/film/line{i}.wav",s,a.sample_rate)
    out.append({"i":i,"text":l,"dur":len(s)/a.sample_rate,"peak":float(np.max(np.abs(s)))})
    print(i,round(len(s)/a.sample_rate,2),l)
json.dump(out,open("/tmp/claude-0/-home-user-societabox/eb8b8a09-6fb6-58d5-a94c-bcfc815fac58/scratchpad/film/lines.json","w"),indent=1)
