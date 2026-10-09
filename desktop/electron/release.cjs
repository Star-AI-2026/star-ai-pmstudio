/**
 * One-command Star-AI desktop release. Put in the Electron project root and run:
 *
 *   node release.cjs
 *
 * Works the same in Command Prompt, PowerShell and bash (no shell operators).
 * 1. Updates the web project (git pull --ff-only; STAR_AI_SKIP_PULL=1 to skip)
 * 2. npm install + builds the web app and copies it into ./web
 * 3. Runs your existing EXE build script (STAR_AI_EXE_SCRIPT, default "dist")
 * Stops with a clear error at the first failing step.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const electronDir = __dirname;
const webProject = path.resolve(electronDir, process.env.STAR_AI_WEB_DIR || "../..");
const exeScript = process.env.STAR_AI_EXE_SCRIPT || "dist";
const { version } = require(path.join(electronDir, "package.json"));
const isWin = process.platform === "win32";

function fail(msg) {
  console.error(`\n[release] FAILED: ${msg}`);
  process.exit(1);
}

// Fixed argument lists only. On Windows npm is npm.cmd, which Node >= 18.20
// can only start through a shell, so shell is enabled there; no user input is
// ever interpolated.
function run(label, cmd, args, cwd) {
  console.log(`\n[release] ${label}: ${cmd} ${args.join(" ")}`);
  const res = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: isWin });
  if (res.error) fail(`${label} could not start (${res.error.message})`);
  if (res.status !== 0) fail(`${label} exited with code ${res.status}`);
}

if (!fs.existsSync(path.join(webProject, "package.json"))) {
  fail(`web project not found at ${webProject} (set STAR_AI_WEB_DIR)`);
}

console.log(`\n== Star-AI ${version}: building web app ==`);
if (process.env.STAR_AI_SKIP_PULL === "1") {
  console.log("[release] STAR_AI_SKIP_PULL=1 — using the web project as it is");
} else {
  run("update web project", "git", ["pull", "--ff-only"], webProject);
}
run("install web dependencies", "npm", ["install"], webProject);
run("build web app", "node", ["scripts/build-desktop-web.mjs", electronDir, version], webProject);

if (!fs.existsSync(path.join(electronDir, "web", "index.html"))) fail("web/index.html missing after build");

console.log(`\n== Star-AI ${version}: building EXE ==`);
run("build EXE", "npm", ["run", exeScript], electronDir);
console.log(`\nDone. Upload the installer, then update version.json.`);
