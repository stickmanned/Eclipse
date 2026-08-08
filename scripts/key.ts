/**
 * Finding the Hack Club API key for the scripts that run outside the browser.
 *
 * The extension itself never uses this. It reads the key from chrome.storage,
 * where the options page put it. This is only for the probe and the bake-off.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Both files are gitignored. Both names work. */
const FILES = [".env.local", ".env"];
const NAMES = ["HCAI_KEY", "HACKCLUB_API_KEY"];

export function loadKey(): string {
  for (const name of NAMES) {
    const fromEnv = process.env[name];
    if (fromEnv) return fromEnv.trim();
  }

  for (const file of FILES) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      // Tolerate spaces around the equals sign and quotes around the value.
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && NAMES.includes(m[1]!)) {
        return m[2]!.replace(/^["']|["']$/g, "");
      }
    }
  }

  console.error("No API key found.\n");
  console.error(`Looked for ${NAMES.join(" or ")} in the environment,`);
  console.error(`then in ${FILES.join(" and ")}.\n`);
  console.error("Add it like this (the file is gitignored):");
  console.error('  echo "HCAI_KEY=your_key_here" > .env\n');
  process.exit(1);
}
