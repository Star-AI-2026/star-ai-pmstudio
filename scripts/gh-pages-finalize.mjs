// Makes the static build servable by GitHub Pages:
// - 404.html mirrors index.html so client-side routing survives deep links
// - .nojekyll keeps `_`-prefixed asset folders from being stripped by Jekyll
import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

for (const dir of ["dist/client", ".output/public"]) {
  const index = join(process.cwd(), dir, "index.html");
  if (!existsSync(index)) continue;
  copyFileSync(index, join(process.cwd(), dir, "404.html"));
  writeFileSync(join(process.cwd(), dir, ".nojekyll"), "");
  console.log(`[gh-pages] wrote ${dir}/404.html and ${dir}/.nojekyll`);
}
