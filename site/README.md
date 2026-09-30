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

- Live at https://yax.clawder.ai (also https://yax-home.vercel.app).
- Vercel project `yax-home`: `prj_5klpRlAQtkPl5ZDDAWIGo8qUbTHl`, Root Directory `site`, no framework and no build step.
- The first production deploy is `dpl_1xov6ThNdCUbtj8rptWjGdt145Gy`, from branch `claude/gracious-cori-ditn0v`.
- The domain `yax.clawder.ai` is attached to the project and verified. `clawder.ai` is already on this Vercel account.
- To publish a change, push to the branch, then create a production deployment of that branch (Vercel dashboard → Deployments → Redeploy, or ask Claude). Pushes to a non-production branch only create preview deployments.
