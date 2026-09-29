# YAX film (42.5 s)

- `YAX_film_full.mp4`: full film, 1080p30, H.264 + AAC, loudness -16 LUFS.
- `YAX_SocietaGene_cut.mp4`: 14 s cut covering the cognitive genome part.
- `YAX_SocietaBox_cut.mp4`: 19 s cut covering the trainable sandbox part, ending on the logo.
- `yax_film_player.html`: the same film rendered live in the browser, with play, scrub and captions. Published at https://claude.ai/artifact/Xjr66XcCo45g3Vnzm5ydWp
- `yax_film.srt`: captions.

## How it was made
- Narration: Kokoro v0.19 (int8, voice af_bella), run locally through sherpa-onnx (`src/narrate.py`).
- Score and sound effects: synthesized in numpy/scipy (`src/audio.py`). Kalimba, pad, bass, shaker, soft groove and bells in F major at 96 BPM; paper, pencil, pop, clap, crumple, ding and stamp effects. The music ducks under the voice.
- Visuals: a pure canvas renderer (`src/film.js`); every frame is a function of time. Frames were captured with headless Chromium and encoded with ffmpeg.
- One timeline (`src/timeline.json`, built by `src/director.py`) drives the animation, the sound effects and the captions.

The web MP4s here are CRF 24. Higher-quality CRF 18 masters were rendered in the session scratchpad and can be re-created from the sources.
