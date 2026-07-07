#!/usr/bin/env node
/**
 * Scans public/images and generates lib/images.ts, exporting every file's
 * public path as a typed IMAGES constant. Re-run after adding/removing
 * images: `npm run images:generate`.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imagesDir = path.join(projectRoot, "public", "images");
const outFile = path.join(projectRoot, "lib", "images.ts");

const IMAGE_EXTENSIONS = new Set([
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
]);

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (IMAGE_EXTENSIONS.has(path.extname(entry).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function toCamelCase(segments) {
  return segments
    .map((segment, index) => {
      const words = segment
        .replace(path.extname(segment), "")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean);

      return words
        .map((word, wordIndex) => {
          const lower = word.toLowerCase();

          if (index === 0 && wordIndex === 0) {
            return lower;
          }

          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join("");
    })
    .join("");
}

const files = walk(imagesDir).sort();

const entries = files.map((filePath) => {
  const relativePath = path.relative(imagesDir, filePath);
  const segments = relativePath.split(path.sep);
  const key = toCamelCase(segments);
  const publicPath = `/images/${relativePath.split(path.sep).join("/")}`;

  return { key, publicPath };
});

const seen = new Map();
for (const entry of entries) {
  if (seen.has(entry.key)) {
    throw new Error(
      `Duplicate IMAGES key "${entry.key}" from "${entry.publicPath}" and "${seen.get(entry.key)}". Rename one of the files.`,
    );
  }
  seen.set(entry.key, entry.publicPath);
}

const body = entries
  .map((entry) => `  ${entry.key}: "${entry.publicPath}",`)
  .join("\n");

const output = `// AUTO-GENERATED FILE. Do not edit by hand.
// Run \`npm run images:generate\` after adding/removing files in public/images.

export const IMAGES = {
${body}
} as const;
`;

writeFileSync(outFile, output);
console.log(`Wrote ${entries.length} image${entries.length === 1 ? "" : "s"} to lib/images.ts`);
