"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("../scripts/build");

describe("build", () => {
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aistrip-build-"));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("copies index.html and _headers into dist", () => {
    const src = path.join(tmp, "src");
    const dist = path.join(tmp, "dist");
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, "index.html"), "<!DOCTYPE html>");
    fs.writeFileSync(path.join(src, "_headers"), "/*\n  X-Frame-Options: DENY\n");

    const written = build(src, dist);

    assert.equal(written, path.resolve(dist));
    assert.equal(fs.readFileSync(path.join(dist, "index.html"), "utf8"), "<!DOCTYPE html>");
    assert.ok(fs.readFileSync(path.join(dist, "_headers"), "utf8").includes("X-Frame-Options"));
  });

  it("replaces a previous dist rather than merging leftovers", () => {
    const src = path.join(tmp, "src");
    const dist = path.join(tmp, "dist");
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, "index.html"), "new");
    fs.mkdirSync(dist);
    fs.writeFileSync(path.join(dist, "stale.txt"), "old");

    build(src, dist);

    assert.equal(fs.existsSync(path.join(dist, "stale.txt")), false);
    assert.equal(fs.readFileSync(path.join(dist, "index.html"), "utf8"), "new");
  });

  it("throws when the source folder has no index.html", () => {
    const src = path.join(tmp, "src");
    const dist = path.join(tmp, "dist");
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, "_headers"), "ok");

    assert.throws(() => build(src, dist), /missing index\.html/);
    assert.equal(fs.existsSync(dist), false);
  });
});
