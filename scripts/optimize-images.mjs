// One-time (and repeatable) image optimization pass over public/legacy-assets/images/.
// Many of these were migrated from the old site as full-resolution screenshots/newsletter
// covers saved as lossless PNG — several single files were 1-3.5MB. This resizes anything wider
// than a reasonable display max and re-compresses in place, keeping the exact same filename/
// extension so no source reference in the app needs to change.
//
// Usage: node scripts/optimize-images.mjs
import { readdirSync, statSync, renameSync } from "node:fs";
import { join, extname } from "node:path";
import sharp from "sharp";

const DIR = new URL("../public/legacy-assets/images", import.meta.url).pathname;
const MAX_WIDTH = 1920;
const SKIP_BELOW_BYTES = 60 * 1024; // not worth re-encoding already-small files

function isImage(name) {
  return /\.(jpe?g|png)$/i.test(name);
}

async function optimizeOne(path) {
  const before = statSync(path).size;
  if (before < SKIP_BELOW_BYTES) return { path, before, after: before, skipped: true };

  const ext = extname(path).toLowerCase();
  const image = sharp(path, { failOn: "none" });
  const metadata = await image.metadata();
  let pipeline = image.rotate(); // apply EXIF orientation, then strip it — avoids sideways images
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const isJpeg = ext === ".jpg" || ext === ".jpeg";
  const buffer = isJpeg
    ? await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer()
    : await pipeline.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();

  const after = buffer.length;
  if (after >= before) return { path, before, after: before, skipped: true };

  const tempPath = `${path}.tmp`;
  await sharp(buffer).toFile(tempPath);
  renameSync(tempPath, path);
  return { path, before, after, skipped: false };
}

async function main() {
  const files = readdirSync(DIR).filter(isImage).map((name) => join(DIR, name));
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const path of files) {
    const result = await optimizeOne(path);
    totalBefore += result.before;
    totalAfter += result.after;
    if (!result.skipped) {
      changed += 1;
      const pct = Math.round((1 - result.after / result.before) * 100);
      console.log(`${result.path.split("/").pop()}: ${(result.before / 1024).toFixed(0)}KB -> ${(result.after / 1024).toFixed(0)}KB (-${pct}%)`);
    }
  }

  console.log(`\nOptimized ${changed}/${files.length} files.`);
  console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
}

main();
