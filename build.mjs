/**
 * Builds the extension into dist/.
 *
 * esbuild rather than a framework build tool: three entry points, no dev
 * server, no plugin that needs to understand Manifest V3. Fewer moving parts
 * to go wrong, and the output is readable when something does.
 *
 *   node build.mjs          build once
 *   node build.mjs --watch  rebuild on save
 */
import * as esbuild from "esbuild";
import { cpSync, mkdirSync, readdirSync } from "node:fs";

const watch = process.argv.includes("--watch");
mkdirSync("dist", { recursive: true });

const common = {
  bundle: true,
  target: "chrome120",
  logLevel: "info",
  minify: !watch,
  sourcemap: watch,
};

const builds = [
  // The service worker carries the word list, so it is by far the biggest.
  { entryPoints: ["src/background/index.ts"], outfile: "dist/background.js", format: "esm" },
  // Content scripts cannot use modules, so this one is bundled flat.
  { entryPoints: ["src/content/index.ts"], outfile: "dist/content.js", format: "iife" },
  { entryPoints: ["src/options/options.ts"], outfile: "dist/options.js", format: "iife" },
  { entryPoints: ["src/popup/popup.ts"], outfile: "dist/popup.js", format: "iife" },
];

function copyStatic() {
  cpSync("public/manifest.json", "dist/manifest.json");
  cpSync("src/options/options.html", "dist/options.html");
  cpSync("src/popup/popup.html", "dist/popup.html");
}

if (watch) {
  for (const b of builds) {
    const ctx = await esbuild.context({ ...common, ...b });
    await ctx.watch();
  }
  copyStatic();
  console.log("watching — reload the extension in chrome://extensions after a change");
} else {
  await Promise.all(builds.map((b) => esbuild.build({ ...common, ...b })));
  copyStatic();
  const sizes = readdirSync("dist").map((f) => `  ${f}`);
  console.log(`built into dist/\n${sizes.join("\n")}`);
}
