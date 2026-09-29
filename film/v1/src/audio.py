"""YAX film: original score, sound design and voice mix. Everything is synthesized here."""
import json, numpy as np, soundfile as sf
from scipy import signal
import pyloudnorm as pyln

SR = 48000
TL = json.load(open('timeline.json'))
TOTAL = TL['total']
N = int(SR * (TOTAL + 1.5))          # a little tail for the reverb
rng = np.random.default_rng(7)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a*SR), int(d*SR), int(r*SR); sl = max(0, int(sus_len*SR))
    e = np.concatenate([np.linspace(0, 1, max(a,1)), np.linspace(1, s, max(d,1)), np.full(sl, s), np.linspace(s, 0, max(r,1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n-len(e)))
def add(buf, x, t, gain=1.0, pan=0.0):
    i = int(t*SR)
    if i >= buf.shape[0]: return
    x = x[:buf.shape[0]-i]
    l = np.cos((pan+1)*np.pi/4); r = np.sin((pan+1)*np.pi/4)
    buf[i:i+len(x), 0] += x*gain*l; buf[i:i+len(x), 1] += x*gain*r
def lp(x, fc, order=2): b, a = signal.butter(order, fc/(SR/2), 'low'); return signal.lfilter(b, a, x)
def hp(x, fc, order=2): b, a = signal.butter(order, fc/(SR/2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2, order=2): b, a = signal.butter(order, [f1/(SR/2), f2/(SR/2)], 'band'); return signal.lfilter(b, a, x)

# ---------------- instruments ----------------
def kalimba(f, dur=1.6, bright=1.0):
    n = int(dur*SR); t = np.arange(n)/SR
    x = np.sin(2*np.pi*f*t)*np.exp(-t/0.85)
    x += 0.32*bright*np.sin(2*np.pi*f*4.02*t)*np.exp(-t/0.10)
    x += 0.10*bright*np.sin(2*np.pi*f*7.1*t)*np.exp(-t/0.04)
    x *= np.minimum(1, t/0.003)
    click = rng.standard_normal(min(n, 200))*np.exp(-np.arange(min(n,200))/30)*0.05
    x[:len(click)] += hp(click, 2000)
    return x
def bell(f, dur=2.2):
    n = int(dur*SR); t = np.arange(n)/SR
    x = sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/d) for a, r, d in [(1,1,1.2),(.5,2.0,.8),(.25,3.01,.4),(.12,4.2,.25),(.06,5.43,.15)])
    return x*np.minimum(1, t/0.002)
def pad_chord(notes, dur, bright=0.6):
    n = int(dur*SR); t = np.arange(n)/SR; x = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = mtof(m + det)
            for h in range(1, 7):
                x += (1/h)*np.sin(2*np.pi*f*h*t + rng.uniform(0, 6.28))*(0.55 if h > 1 else 1)
    x = lp(x, 600 + 1400*bright, 2)
    trem = 1 + 0.08*np.sin(2*np.pi*0.3*t)
    return x*trem*env_adsr(n, 0.7, 0.3, 0.85, 1.2, dur-2.2)
def bass(f, dur):
    n = int(dur*SR); t = np.arange(n)/SR
    x = np.sin(2*np.pi*f*t) + 0.25*np.sin(2*np.pi*2*f*t) + 0.08*np.sin(2*np.pi*3*f*t)
    x = np.tanh(1.4*x)/np.tanh(1.4)
    return x*env_adsr(n, 0.01, 0.25, 0.55, 0.25, dur-0.55)
def shaker(dur=0.09, v=1.0):
    n = int(dur*SR); t = np.arange(n)/SR
    x = hp(rng.standard_normal(n), 6000)*np.exp(-t/0.025)*np.minimum(1, t/0.006)
    return x*v
def kick(v=1.0):
    n = int(0.35*SR); t = np.arange(n)/SR
    f = 50 + 70*np.exp(-t/0.04); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.12)*v
def rim(v=1.0):
    n = int(0.08*SR); t = np.arange(n)/SR
    x = bp(rng.standard_normal(n), 1500, 4500)*np.exp(-t/0.015) + 0.4*np.sin(2*np.pi*1700*t)*np.exp(-t/0.02)
    return x*v

# ---------------- score ----------------
BAR = TL['bar']; BEAT = BAR/4
CH = {'Fmaj7':([53,57,60,64],41),'Am7':([57,60,64,67],45),'Dm9':([53,57,60,64],38),'Bbmaj7':([58,62,65,69],46),
      'C6':([60,64,67,69],36),'Csus2':([60,62,67,72],36),'Fmaj9':([57,60,64,67],41)}
PROG = ['Fmaj7','Am7','Dm9','Bbmaj7','Fmaj7','Am7','Dm9','C6','Bbmaj7','Am7','Csus2','Fmaj9','Fmaj9','Fmaj9']
music = np.zeros((N, 2))
for b, name in enumerate(PROG):
    notes, root = CH[name]; t0 = b*BAR
    sec = 0 if b < 2 else 1 if b < 4 else 2 if b < 6 else 4 if b < 9 else 3 if b < 11 else 5
    # pad
    if b >= 2:
        dur = BAR*2.2 if b >= 12 else BAR+1.0
        add(music, pad_chord(notes, dur, bright=0.45+0.12*min(sec,4)), t0, gain=0.030 if sec < 5 else 0.036, pan=0.0)
    # bass
    if b >= 2:
        pat = [(0, 1.5), (2, 1.3)] if sec in (1, 2, 3) else [(0, .9), (1.5, .45), (2, .9), (3.5, .4)] if sec == 4 else [(0, 3.6)]
        for beat, ln in pat:
            add(music, bass(mtof(root), ln*BEAT), t0+beat*BEAT, gain=0.11 if b < 12 else 0.09)
    # kalimba arpeggio
    tones = sorted(notes) + [notes[0]+12, notes[1]+12]
    if sec == 0:
        seq = [(0, 0), (1, 2), (2, 1), (3, 3)]            # quarter notes
        step = BEAT
    elif sec == 5:
        seq = [(i, i) for i in range(6)] if b < 12 else [(0, 0), (1, 2), (2, 4), (3, 5)]
        step = BEAT*0.5 if b < 12 else BEAT*0.75
    else:
        pats = {1:[0,2,1,3,2,1,0,2],2:[0,2,4,2,3,1,4,2],3:[1,3,5,3,4,2,5,3],4:[0,3,2,4,1,5,3,2]}
        seq = [(i, v) for i, v in enumerate(pats[sec])]; step = BEAT/2
    for i, v in seq:
        if sec in (1, 2) and i in (3, 7) and b % 2: continue       # breathe
        m = tones[v % len(tones)] + (12 if sec >= 3 else 0)
        vel = (1.0 if i % 4 == 0 else 0.72) * (0.9 + 0.2*rng.random())
        add(music, kalimba(mtof(m), bright=0.8+0.1*sec), t0+i*step+rng.normal(0, 0.004), gain=0.07*vel, pan=-0.35+0.7*((v % 4)/3))
    # shaker 8ths
    if 4 <= b < 11:
        for i in range(8):
            add(music, shaker(v=(0.8 if i % 2 else 0.45)), t0+i*BEAT/2+0.012*(i % 2), gain=0.035 if sec < 4 else 0.05, pan=0.35)
    # soft groove for the sandbox section
    if 6 <= b < 9:
        for i in range(4):
            add(music, kick(), t0+i*BEAT, gain=0.16 if i in (0, 2) else 0.09)
            if i in (1, 3): add(music, rim(), t0+i*BEAT, gain=0.05, pan=-0.2)
    # bell sparkle over the genome
    if b in (9, 10):
        for i, v in enumerate([3, 5, 4, 2]):
            add(music, bell(mtof(tones[v % len(tones)]+24)), t0+i*BEAT+BEAT*0.5, gain=0.018, pan=0.4-0.2*i)
# final bloom on the logo stamp
for i, m in enumerate([65, 69, 72, 76, 79]):
    add(music, bell(mtof(m+12), 3.2), TL['cues']['stamp']+i*0.09, gain=0.022, pan=-0.4+0.2*i)

# ---------------- sound effects ----------------
def s_pop(p=1.0):
    n = int(0.12*SR); t = np.arange(n)/SR
    f = 280*p + 650*p*np.exp(-t/0.018); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.05)*np.minimum(1, t/0.002)
def s_paper(d=0.28):
    n = int(d*SR); t = np.arange(n)/SR
    x = bp(rng.standard_normal(n), 900, 7000)*(np.sin(np.pi*t/d)**1.5)
    return x*(0.7+0.3*np.abs(lp(rng.standard_normal(n), 40)))
def s_swoosh(d=0.6):
    n = int(d*SR); t = np.arange(n)/SR; x = rng.standard_normal(n); out = np.zeros(n)
    fc = 500 + 4500*np.sin(np.pi*t/d)**2
    blk = 480
    for k in range(0, n, blk):
        b, a = signal.butter(2, min(0.95, fc[k]/(SR/2)), 'low'); out[k:k+blk] = signal.lfilter(b, a, x[k:k+blk])
    return hp(out, 200)*np.sin(np.pi*t/d)**2
def s_scribble(d=0.4):
    n = int(d*SR); t = np.arange(n)/SR
    am = 0.5+0.5*np.sign(np.sin(2*np.pi*(19+6*np.sin(2*np.pi*1.3*t))*t))
    x = bp(rng.standard_normal(n), 1800, 6000)*lp(am, 60)
    return x*np.minimum(1, t/0.02)*np.minimum(1, (d-t)/0.05)
def s_pencil(d=0.6):
    n = int(d*SR); t = np.arange(n)/SR
    am = 0.35+0.65*np.abs(np.sin(2*np.pi*7*t+2*np.sin(2*np.pi*1.1*t)))
    x = bp(rng.standard_normal(n), 2500, 8000)*am
    return x*np.minimum(1, t/0.05)*np.minimum(1, (d-t)/0.1)
def s_tape(d=0.45):
    n = int(d*SR); t = np.arange(n)/SR
    crack = (rng.random(n) < 0.02 + 0.05*t/d).astype(float)*rng.standard_normal(n)
    return bp(crack + 0.3*rng.standard_normal(n), 1200, 7000)*np.exp(-((t-d*0.6)/(d*0.35))**2)
def s_clap():
    n = int(0.25*SR); t = np.arange(n)/SR
    x = hp(rng.standard_normal(n), 1500)*np.exp(-t/0.012) + 0.8*np.sin(2*np.pi*950*t)*np.exp(-t/0.04) + 0.5*np.sin(2*np.pi*230*t)*np.exp(-t/0.06)
    return x
def s_crumple(d=0.5):
    n = int(d*SR); x = np.zeros(n)
    for _ in range(38):
        i = int(rng.random()*(n-600)); L = int(rng.integers(80, 500))
        x[i:i+L] += rng.standard_normal(L)*np.exp(-np.arange(L)/(L/4))*rng.uniform(.3, 1)
    return bp(x, 700, 6500)
def s_tick(p=1.0):
    n = int(0.05*SR); t = np.arange(n)/SR
    return (hp(rng.standard_normal(n), 3000)*np.exp(-t/0.004) + 0.6*np.sin(2*np.pi*2400*p*t)*np.exp(-t/0.008))
def s_lever():
    n = int(0.35*SR); t = np.arange(n)/SR
    f = 180 - 90*t/0.35; ph = 2*np.pi*np.cumsum(f)/SR
    return 0.7*np.sin(ph)*np.exp(-t/0.09) + 0.5*bp(rng.standard_normal(n), 400, 2500)*np.exp(-t/0.03) + 0.4*hp(rng.standard_normal(n), 2000)*np.exp(-((t-0.2)/0.01)**2)
def s_ding(p=1.0): return bell(1568*p, 1.6)*0.9
def s_stamp(p=1.0):
    n = int(0.4*SR); t = np.arange(n)/SR
    f = 55*p + 90*np.exp(-t/0.03); ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t/0.12) + 0.5*bp(rng.standard_normal(n), 300, 3000)*np.exp(-t/0.02)
FX = {'pop':(s_pop,0.22),'paper':(s_paper,0.20),'swoosh':(s_swoosh,0.22),'scribble':(s_scribble,0.14),'pencil':(s_pencil,0.10),
      'tape':(s_tape,0.20),'clap':(s_clap,0.30),'crumple':(s_crumple,0.22),'ding':(s_ding,0.07),'stamp':(s_stamp,0.55),'tick':(s_tick,0.10),'lever':(s_lever,0.35)}
sfx = np.zeros((N, 2))
for c in TL['sfx']:
    fn, g = FX[c['k']]; kw = {}
    if 'p' in c and c['k'] in ('pop','ding','stamp','tick'): kw['p'] = c['p']
    if 'd' in c and c['k'] in ('scribble','pencil'): kw['d'] = c['d']
    add(sfx, fn(**kw), c['t'], gain=g, pan=float(rng.uniform(-0.3, 0.3)))

# ---------------- voice ----------------
voice = np.zeros(N)
for ln in TL['lines']:
    v, sr = sf.read(f"line{ln['i']}.wav")
    v = signal.resample_poly(v, SR, sr)
    v = hp(v, 90); v = v/np.max(np.abs(v))
    # gentle compression
    envv = np.sqrt(np.maximum(lp(v**2, 12), 1e-9)); gain = np.minimum(1, (0.35/np.maximum(envv, 1e-4))**0.35)
    v = v*gain; v = v/np.max(np.abs(v))*0.9
    i = int(ln['start']*SR); voice[i:i+len(v)] += v[:N-i]
# presence lift
b, a = signal.iirpeak(3200/(SR/2), 1.2); voice = voice + 0.12*signal.lfilter(b, a, voice)

# ---------------- space ----------------
def reverb_ir(dur=2.0, damp=4000):
    n = int(dur*SR); t = np.arange(n)/SR
    ir = np.stack([lp(rng.standard_normal(n), damp)*np.exp(-t/0.45) for _ in range(2)], 1)
    ir[:int(0.012*SR)] = 0
    return ir/np.sqrt(np.sum(ir**2, 0))
IR = reverb_ir()
def verb(x, wet):
    y = np.stack([signal.fftconvolve(x[:, k] if x.ndim == 2 else x, IR[:, k])[:N] for k in range(2)], 1)
    dry = x if x.ndim == 2 else np.stack([x, x], 1)
    return dry + wet*y

music_w = verb(music, 0.35)
sfx_w = verb(sfx, 0.18)
voice_w = verb(voice, 0.05)

# duck the music under the voice
venv = lp(np.abs(voice), 6)
venv = venv/np.max(venv)
duck = 1 - 0.55*np.clip(venv*3, 0, 1)
duck = lp(duck, 3)
mix = music_w*duck[:, None]*1.0 + sfx_w + voice_w*0.95

# fade out tail
fade = np.ones(N); fs = int((TOTAL-1.2)*SR); fe = int((TOTAL+0.3)*SR)
fade[fs:fe] = np.linspace(1, 0, fe-fs)**1.5; fade[fe:] = 0
mix *= fade[:, None]
mix = mix[:int(TOTAL*SR)]

# master: loudness to -16 LUFS, soft limit at -1 dBFS
meter = pyln.Meter(SR)
lufs = meter.integrated_loudness(mix)
mix = pyln.normalize.loudness(mix, lufs, -16.0)
ceil = 10**(-1/20)
mix = np.where(np.abs(mix) > 0.8*ceil, np.sign(mix)*(0.8*ceil + 0.2*ceil*np.tanh((np.abs(mix)-0.8*ceil)/(0.2*ceil))), mix)
print('in LUFS', round(lufs, 1), 'out LUFS', round(meter.integrated_loudness(mix), 1), 'peak dBFS', round(20*np.log10(np.max(np.abs(mix))), 2))
sf.write('master.wav', mix.astype(np.float32), SR, subtype='PCM_16')
# stems for checks
#sf.write('music_only.wav', (music_w*duck[:, None])[:int(TOTAL*SR)].astype(np.float32)*0.5, SR, subtype='PCM_16')

# diagnostics: voice-over-music ratio during speech
spk = venv > 0.15
def rms(x): return np.sqrt(np.mean(x**2))
vm = voice_w.mean(1)[:len(spk)][spk[:len(voice_w)]]; mm = (music_w*duck[:, None]).mean(1)[:len(spk)][spk[:len(voice_w)]]; fx = sfx_w.mean(1)[:len(spk)][spk[:len(voice_w)]]
print('voice/music dB during speech', round(20*np.log10(rms(vm*0.95)/rms(mm)), 1), ' voice/sfx dB', round(20*np.log10(rms(vm*0.95)/rms(fx)), 1))
