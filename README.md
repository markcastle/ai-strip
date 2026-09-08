# AiStrip

A single-page web app that shows what an image file is carrying — location, camera identity, generation prompts, C2PA Content Credentials — and strips that data without re-encoding the picture.

Open `src/index.html` from disk. There is no build, no backend, and **no network requests**. Images are read with `FileReader` and never leave the machine.

Released under the MIT licence. See `LICENSE`.

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

## Local use

Open `src/index.html` in a browser. Drop a photo, or click to choose one. Cleaning downloads a sibling `*-clean` file; the original is not overwritten.

## Deploy to Cloudflare Pages (dashboard only)

This project is static files. It does **not** use Wrangler, Pages Functions, or a build. Only `src/` is published; `docs/` and this README stay off the live site.

### Build settings

Use these values in **Workers & Pages → Create → Pages**, or later under the project's **Settings → Builds & deployments**.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | `/` if this folder is the Git repo; `webapp` if this app is a subdirectory of a larger repo |
| Build command | *(leave blank)* — if the form requires a command, use `exit 0` |
| Build output directory | `src` |
| Environment variables | none |
| Wrangler / Pages Functions | do not enable |

Production branch is whatever you push as the default (usually `main`). No Node version, install command, or wrangler.toml is needed.

After a successful deploy, `/` serves `src/index.html`. `src/_headers` is read by Pages as config (it is not a public page). It sets security headers, including a CSP that forbids `fetch`/`XHR` (`connect-src 'none'`) and allows the inlined CSS/JS plus `blob:` URLs for the thumbnail and the cleaned download.

### Git

Workers & Pages → Create → Pages → **Connect to Git**. Point it at this repository, apply the table above, save, and deploy.

### Direct upload (no Git)

Workers & Pages → Create → Pages → **Direct Upload**. Upload the **contents** of `src` so `index.html` is at the top of the upload, not nested as `src/index.html`.

## Layout

```
README.md           this file
LICENSE             MIT licence
.gitignore
docs/PLANNING.md    architecture and constraints
docs/TASK.md        current work
src/index.html      the app
src/_headers        Cloudflare Pages response headers
```
