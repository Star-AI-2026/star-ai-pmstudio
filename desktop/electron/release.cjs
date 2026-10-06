/**
 * One-command Star-AI desktop release. Put in the Electron project root and run:
 *
 *   node release.cjs
 *
 * 1. Builds the latest web app from the Star-AI web project (STAR_AI_WEB_DIR,
 *    default ../star-ai-pmstudio) and copies it into ./web
 * 2. Runs your existing EXE build script (STAR_AI_EXE_SCRIPT, default "dist")
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const electronDir = __dirname;
const webProject = path.resolve(electronDir, process.env.STAR_AI_WEB_DIR || "../star-ai-pmstudio");
const exeScript = process.env.STAR_AI_EXE_SCRIPT || "dist";
const { version } = require(path.join(electronDir, "package.json"));

if (!fs.existsSync(path.join(webProject, "package.json"))) {
  throw new Error(`Web project not found at ${webProject} (set STAR_AI_WEB_DIR)`);
}
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: "inherit" });

console.log(`\n== Star-AI ${version}: building web app ==`);
run("git pull --ff-only || echo skip pull", webProject);
run("npm install", webProject);
run(`node scripts/build-desktop-web.mjs "${electronDir}" ${version}`, webProject);

console.log(`\n== Star-AI ${version}: building EXE ==`);
run(`npm run ${exeScript}`, electronDir);
console.log(`\nDone. Upload the installer, then update version.json.`);
