# AiStrip

A single-page web app that shows what an image file is carrying — location, camera identity, generation prompts, C2PA Content Credentials — and strips that data without re-encoding the picture.

The page itself makes **no network requests**. Images are read with `FileReader` and never leave the machine.

Released under the MIT licence. See `LICENSE`.

## Local use

Open `src/index.html` in a browser, or build and open the published copy:

```bash
npm test
npm run build
```

`npm run build` copies `src/` → `dist/`. Drop a photo, or click to choose one. Cleaning downloads a sibling `*-clean` file; the original is not overwritten.

## Deploy to Cloudflare Pages (dashboard only)

Do not use Wrangler. Connect the Git repo in the dashboard and use these build settings.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | `/` if this folder is the Git repo; `webapp` if this app is a subdirectory of a larger repo |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `master` (this repo's default branch; not `main` unless you rename it) |
| Environment variables | none (optional: `NODE_VERSION` = `18`) |
| Wrangler / Pages Functions | do not enable |

Pages runs `npm install` then `npm run build`, and publishes `dist/`. That folder contains `index.html` at its top, so the site root is `/`.

`src/_headers` is copied into `dist` and read by Pages as config (it is not a public page). It sets security headers, including a CSP that forbids `fetch`/`XHR` (`connect-src 'none'`) and allows the inlined CSS/JS plus `blob:` URLs for the thumbnail and the cleaned download.

### Direct upload (no Git)

Run `npm run build` locally, then Workers & Pages → Create → Pages → **Direct Upload**. Upload the **contents** of `dist` so `index.html` is at the top of the upload.

## Why ordinary tools miss AI provenance

Pillow, and most EXIF tools, parse the segments they know about and drop everything else. C2PA Content Credentials live in segments those libraries do not know about:

| Format | Where C2PA lives |
| --- | --- |
| JPEG | APP11 segments, marker `0xFFEB` |
| PNG | a `caBX` ancillary chunk |
| WebP | a `C2PA` RIFF chunk |
| HEIF / AVIF | an ISOBMFF `uuid` box |

AiStrip walks those containers in the browser and reports what it finds. It also surfaces GPS, camera serials, and generation leftovers in PNG text chunks (`parameters`, `prompt`, `workflow`, and similar).

## What it cannot do

Metadata is the fragile layer. Invisible watermarks such as SynthID live in the pixels. Stripping credentials leaves them intact, and AiStrip cannot detect them. A clean report means “no metadata signals”, not “not AI-generated”.

AiStrip reads Content Credentials but does not verify their signatures.

Inspect: JPEG, PNG, WebP, HEIC/AVIF. Clean: JPEG, PNG, WebP (byte-copy, pixels untouched).

## Layout

```
package.json
scripts/build.js    copies src/ → dist/
src/index.html      the app
src/_headers        Cloudflare Pages response headers
dist/               build output (gitignored; what Pages publishes)
docs/PLANNING.md
docs/TASK.md
tests/build.test.js
```
