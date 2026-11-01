/**
 * Build Star-AI desktop from the frozen web snapshot already included in web/.
 * This archive contains the Electron project and frozen web assets, not the
 * separate Vite website source. No online release/version.json is changed.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const electronDir = __dirname;
const version = require(path.join(electronDir, "package.json")).version;
const isWin = process.platform === "win32";

function fail(message) {
  console.error(`\n[Star-AI release] FAILED: ${message}`);
  process.exit(1);
}
function run(label, command, args, cwd) {
  console.log(`\n[Star-AI release] ${label}`);
  const result = spawnSync(command, args, {
    cwd, stdio: "inherit",
    shell: isWin && (command === "npm" || command === "npm.cmd"),
    env: process.env,
  });
  if (result.error) fail(`${label}: ${result.error.message}`);
  if (result.status !== 0) fail(`${label}: exited with code ${result.status}`);
}

if (!fs.existsSync(path.join(electronDir, "package.json"))) fail("Electron package.json missing.");
if (!fs.existsSync(path.join(electronDir, "web", "index.html"))) {
  fail(`Bundled web/index.html missing at ${path.join(electronDir, "web", "index.html")}. Extract the complete ZIP again.`);
}
console.log(`\n=== Star-AI ${version} Beta: local build only ===`);
console.log(`[Star-AI release] Using bundled frozen website: ${path.join(electronDir, "web")}`);
run("Build x64 and x86 executables", "npm", ["run", "dist"], electronDir);
console.log("\nBuild complete. No GitHub release was published and version.json was not changed.");
