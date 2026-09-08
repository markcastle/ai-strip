"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Copy the static site from srcDir into distDir for Cloudflare Pages.
 *
 * Args:
 *   srcDir (string): Folder containing index.html (and _headers, assets).
 *   distDir (string): Folder Pages will publish.
 *
 * Returns:
 *   string: Absolute path of the written dist directory.
 */
function build(srcDir, distDir) {
  if (!srcDir || !distDir) {
    throw new Error("srcDir and distDir are required");
  }

  const src = path.resolve(srcDir);
  const dest = path.resolve(distDir);

  if (!fs.existsSync(src)) {
    throw new Error("source directory does not exist: " + src);
  }
  if (!fs.existsSync(path.join(src, "index.html"))) {
    throw new Error("source is missing index.html: " + src);
  }

  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  return dest;
}

function buildFromRepoRoot(root) {
  const repo = root || path.join(__dirname, "..");
  return build(path.join(repo, "src"), path.join(repo, "dist"));
}

if (require.main === module) {
  const dest = buildFromRepoRoot();
  process.stdout.write("wrote " + dest + "\n");
}

module.exports = { build, buildFromRepoRoot };
