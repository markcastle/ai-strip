# TASK.md

## In progress

_(none)_

## Completed

- [x] 2026-09-08 — Analyse the webapp and write architecture notes (`docs/PLANNING.md`).
- [x] 2026-09-08 — Move planning docs into `docs/`, add `.gitignore`, rename the app to `src/index.html`, add `src/_headers`, and document Cloudflare Pages dashboard deploy (no Wrangler).
- [x] 2026-09-08 — Add Cloudflare Pages dashboard settings table to `README.md`.
- [x] 2026-09-08 — Add MIT licence (`LICENSE`).

## Next (proposed — pick before coding)

- Pin `Trace` core with Node tests in `/tests` (detect, walk, inspect, strip: expected / edge / failure).
- Split `src/index.html` so no file exceeds 500 lines, without adding a bundler or network.
- Fix JPEG SOS walker treating bytes after EOI as image data (strip can leave a trailer).
- Stop GIF (detected, not walked) from rendering as “nothing hidden”.

## Discovered during work

- `src/index.html` is 1,568 lines: CSS + `Trace` core IIFE + presentation IIFE in one file.
- Core already exports via `module.exports = Trace` but nothing imports it.
- zTXt is not decompressed; iTXt compression flag is ignored.
- HEIC/AVIF inspect is top-level ISOBMFF only; strip is not implemented.
- No `package.json`, tests, or CI in this workspace.
- TIFF is not handled in the browser app.
