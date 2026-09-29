import sherpa_onnx, soundfile as sf, numpy as np, json
M="/tmp/claude-0/-home-user-societabox/eb8b8a09-6fb6-58d5-a94c-bcfc815fac58/scratchpad/tts/package/kokoro-int8-en-v0_19"
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=M+"/model.int8.onnx",voices=M+"/voices.bin",tokens=M+"/tokens.txt",data_dir=M+"/espeak-ng-data"),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
LINES={
 "trad":"Today, teams guess from surveys and focus groups, and personas built from demographics. Age, job, city.",
 "impl":"At two point six, she leans toward the crowd, but can still hold her ground.",
 "bridge":"Put calibrated people together, and you get a world worth practicing in.",
 "l4b":"SocietaBox gives AI agents that world, and it writes itself as they play.",
}
out={}
for k,l in LINES.items():
    a=tts.generate(l,sid=1,speed=0.94);s=np.array(a.samples,dtype=np.float32)
    th=0.01*np.max(np.abs(s));nz=np.where(np.abs(s)>th)[0];s=s[max(0,nz[0]-240):min(len(s),nz[-1]+2400)]
    sf.write(f"{k}.wav",s,a.sample_rate);out[k]={"text":l,"dur":len(s)/a.sample_rate};print(k,round(len(s)/a.sample_rate,2),l)
json.dump(out,open("new_lines.json","w"),indent=1)
