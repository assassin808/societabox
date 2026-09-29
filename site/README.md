# YAX home page (yax.clawder.ai)

A static site with no build step. Deploy the contents of this folder: `index.html` plus `assets/`.

- `index.html` is the deployable page.
- `src/page.html` is the same content without the `<html>` and `<head>` wrapper, used for the claude.ai preview (https://claude.ai/artifact/SysvJhvgkZhB9RGCpUgxw9).
- If you edit `src/page.html`, regenerate `index.html` from it (see the commit that added this folder), or edit both files.
- `assets/yax-film.mp4` is a 720p web cut of `film/v3/YAX_film_v3.mp4`. `assets/film-poster.jpg` is its poster frame.

To do before launch:
- Replace the T04 chart placeholder in the Problem section. Search for `T04` in the HTML.
- Confirm the two team lines and the contact address (`hello@yaxlabs.ai`).
