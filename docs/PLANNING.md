# PLANNING.md — AiStrip

Offline browser tool that shows what an image file is carrying (location, camera identity, generation prompts, C2PA Content Credentials) and strips that data without re-encoding the picture.

## Product constraints (do not break these)

- **No network.** Images are read with `FileReader` and never uploaded. The page must work opened from disk (`src/index.html`) with the internet off.
- **Deploy uses a normal npm build.** `npm run build` copies `src/` to `dist/`. Cloudflare Pages: build command `npm run build`, output directory `dist`. Do not publish the repo root.
- **Lossless strip.** JPEG, PNG and WebP are rewritten by copying kept byte ranges. Do not decode through a canvas or re-compress pixels.
- **Honest ceiling.** Do not claim watermark (SynthID) detection or removal. Do not claim C2PA signature verification unless we add a real verifier (that would cost the offline guarantee).
- **One photo at a time.** A new drop replaces the previous report.

## Layout

```
webapp/
  package.json
  scripts/build.js     copies src/ → dist/
  src/index.html       the app (CSS + core + UI)
  src/_headers         Cloudflare Pages headers (copied into dist)
  dist/                generated; gitignored; Pages publishes this
  tests/build.test.js
  README.md
  LICENSE
  .gitignore
  docs/PLANNING.md     this file
  docs/TASK.md         current work
```

Stay inside this repository root unless explicitly asked to look elsewhere.

Cloudflare Pages (dashboard, no Wrangler): framework None, build command `npm run build`, build output directory `dist`, production branch `master`.

## Architecture of `src/index.html`

Two IIFEs, already separated in comments:

| Block | Role |
| --- | --- |
| CSS + HTML shell | Three semantic colours only: picture (grey), AI (red), personal (orange). |
| `AiStrip` core (`<script id="aistrip-core">`) | Pure functions on `Uint8Array`. No DOM. `module.exports = AiStrip` for Node. |
| Presentation IIFE | Drop zone, headlines, findings, download. Thin. |

Core pipeline: `detect` → `walk` (tile the file) → `inspect` (C2PA / EXIF / PNG text / source-type haystack) → UI. `strip` copies segments whose category is not identity/provenance (and optionally keeps ICC).

Segment categories: `image`, `provenance`, `identity`, `profile`, `structure`. The UI bar folds structure+profile into “the picture”.

### Public core API

`detect`, `walk`, `inspect`, `strip`, `totals`, plus `cborDecode`, `parseBoxes`, `buildTree`, `extractManifest`, `summariseC2pa`, `parseTiff`.

## Formats

| Format | Inspect | Strip |
| --- | --- | --- |
| JPEG | yes | lossless byte copy |
| PNG | yes | lossless byte copy |
| WebP | yes | lossless; rewrite RIFF size + VP8X flags |
| HEIC / AVIF | yes (top-level ISOBMFF) | no |
| GIF | magic-byte detect only | no |
| TIFF | no | no |

## Style

- British English (`en-GB`), calm copy, no hype.
- ES5-era JavaScript (`var`, IIFEs, `"use strict"`) so it runs in old browsers without a toolchain. Prefer that unless we explicitly adopt a module+build path.
- Google-style docstrings in Python; XML comments in C# (N/A here).
- Files under 500 lines. `src/index.html` currently violates this (~1568 lines) — split before adding large features.
- Tests live in `/tests`. New core behaviour needs: expected case, edge case, failure case.
- Extension methods preferred in C# (N/A here).

## Out of scope unless we decide otherwise

- SynthID / any pixel watermark.
- Bundling `@contentauth/c2pa-web` (WASM + network/trust-list).
- Batch / server ingest (would be a different product; needs a backend).
- XMP field-level editing.
- Undo of a strip (write a sibling `*-clean` file; default is download, not overwrite).
