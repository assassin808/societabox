import sherpa_onnx, soundfile as sf, numpy as np, json
M="/tmp/claude-0/-home-user-societabox/eb8b8a09-6fb6-58d5-a94c-bcfc815fac58/scratchpad/tts/package/kokoro-int8-en-v0_19"
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=M+"/model.int8.onnx",voices=M+"/voices.bin",tokens=M+"/tokens.txt",data_dir=M+"/espeak-ng-data"),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
LINES=[
 "A cognitive genome is a set of dials.",
 "Pick a trait, like following the crowd. Set it to two point six, out of four.",
 "We measure it in classic human studies, like Asch's line test and the hotel towel study.",
 "Then we tune the prompt, the inner state, or the weights, until it holds.",
 "And it holds across models.",
 "If it's measured in humans, we can set it in an agent.",
 "YAX. Calibrating AI to behave like humans.",
]
out=[]
for i,l in enumerate(LINES):
    a=tts.generate(l,sid=1,speed=0.95);s=np.array(a.samples,dtype=np.float32)
    th=0.01*np.max(np.abs(s));nz=np.where(np.abs(s)>th)[0];s=s[max(0,nz[0]-240):min(len(s),nz[-1]+2400)]
    sf.write(f"line{i}.wav",s,a.sample_rate);out.append({"i":i,"text":l,"dur":len(s)/a.sample_rate});print(i,round(len(s)/a.sample_rate,2),l)
json.dump(out,open("lines.json","w"),indent=1)
print("total speech",round(sum(o['dur'] for o in out),2))
