const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { resolveRequest, APP_URL, HOST, PREFIX } = require("../src/local-app.cjs");

test("site index is served from the local bundle", () => {
  const root = path.join(os.tmpdir(), "star-ai-local-test");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, "index.html"), "ok");
  assert.deepEqual(resolveRequest(APP_URL, "GET", root), {
    action: "file", file: path.join(root, "index.html")
  });
  fs.rmSync(root, { recursive: true, force: true });
});

test("GitHub Pages origin root redirects into the bundled app", () => {
  assert.deepEqual(
    resolveRequest(`https://${HOST}/?from=home#top`, "GET", "."),
    { action: "redirect", location: `${APP_URL}?from=home#top` }
  );
});

test("version.json always remains live", () => {
  const r = resolveRequest(`https://${HOST}${PREFIX}version.json?t=123`, "GET", ".");
  assert.equal(r.action, "network");
});

test("external requests are passed to the network", () => {
  assert.equal(resolveRequest("https://example.com/", "GET", ".").action, "network");
});

test("unknown asset returns 404", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "star-ai-test-"));
  fs.writeFileSync(path.join(root, "index.html"), "ok");
  assert.deepEqual(resolveRequest(`https://${HOST}${PREFIX}assets/missing.js`, "GET", root), {
    action: "status", status: 404
  });
  fs.rmSync(root, { recursive: true, force: true });
});

test("unsupported methods are rejected for local app resources", () => {
  assert.deepEqual(resolveRequest(APP_URL, "POST", "."), { action: "status", status: 405 });
});

test("traversal cannot escape web root", () => {
  const root = path.resolve("web");
  const r = resolveRequest(`https://${HOST}${PREFIX}%2E%2E%2Fsecret.txt`, "GET", root);
  assert.equal(r.action, "status");
  assert.ok([403, 404].includes(r.status));
});
