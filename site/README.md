# YAX home page (yax.clawder.ai)

A static one-page site with no build step. Deploy this folder: `index.html` plus `assets/`.

The page has four parts:
1. a one-line statement over a toy shelf of the film's pixel cast;
2. the CoBRA CHI 2026 Best Paper;
3. the film;
4. co-founder contact (xul049@ucsd.edu).

`assets/cast/` holds the pixel sprites (16×17 px, each with a blink frame), exported from the film renderer.

- `src/page.html` is the same page without the `<html>` and `<head>` wrapper. It is used for the preview: https://claude.ai/artifact/SysvJhvgkZhB9RGCpUgxw9
- `assets/yax-film.mp4` is a 720p cut of `film/v3`. `assets/film-poster.jpg` is its logo frame.

## Deploy on Vercel

1. In Vercel, choose Add New → Project and import `assassin808/societabox`.
2. Set Root Directory to `site`, Framework Preset to Other, and leave the build command empty.
3. Under Settings → Git, set the production branch to the branch that holds this folder (currently `claude/gracious-cori-ditn0v`), or merge it into `main`.
4. Under Settings → Domains, add `yax.clawder.ai`. At your DNS provider, add a CNAME record for `yax` pointing to `cname.vercel-dns.com`.
