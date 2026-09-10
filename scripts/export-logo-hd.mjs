import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "/Users/sagarmamindla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";

const root = process.cwd();
const source = join(root, "design-review/ipf-logo-system/recommended-lockups");
const target = join(root, "design-assets/brand/ipf-logo-system");
const svgLight = join(target, "svg/light");
const svgTransparent = join(target, "svg/transparent");
const pngLight = join(target, "png-hd/light");
const pngTransparent = join(target, "png-hd/transparent");
[svgLight, svgTransparent, pngLight, pngTransparent].forEach((folder) => mkdirSync(folder, { recursive: true }));
const chapterFiles = new Set(["abu-dhabi", "dubai", "sharjah", "ajman", "umm-al-quwain", "ras-al-khaimah", "fujairah", "al-ain"].map((name) => `ipf-${name}-chapter.svg`));
const specialFiles = new Set(["ipf-business-council.svg", "ipf-womens-council.svg", "ipf-cultural-council.svg"]);

for (const file of readdirSync(source).filter((name) => name.endsWith(".svg"))) {
  const light = readFileSync(join(source, file), "utf8");
  const transparent = light.replace(/<rect width="1200" height="360" rx="28" fill="#fffdf8"\/>/, "");
  writeFileSync(join(svgLight, file), light);
  writeFileSync(join(svgTransparent, file), transparent);
  const pngName = `${basename(file, ".svg")}.png`;
  await sharp(Buffer.from(light), { density: 192 }).resize(2400, 720, { fit: "fill" }).png({ quality: 100, compressionLevel: 9 }).toFile(join(pngLight, pngName));
  await sharp(Buffer.from(transparent), { density: 192 }).resize(2400, 720, { fit: "fill" }).png({ quality: 100, compressionLevel: 9 }).toFile(join(pngTransparent, pngName));
  const category = chapterFiles.has(file) ? "uae-chapters" : specialFiles.has(file) ? "special-councils" : "state-councils";
  const categoryRoot = join(target, "organized", category);
  for (const sub of ["svg-light", "svg-transparent", "png-hd-light", "png-hd-transparent"]) mkdirSync(join(categoryRoot, sub), { recursive: true });
  writeFileSync(join(categoryRoot, "svg-light", file), light);
  writeFileSync(join(categoryRoot, "svg-transparent", file), transparent);
  await sharp(Buffer.from(light), { density: 192 }).resize(2400, 720, { fit: "fill" }).png({ quality: 100, compressionLevel: 9 }).toFile(join(categoryRoot, "png-hd-light", pngName));
  await sharp(Buffer.from(transparent), { density: 192 }).resize(2400, 720, { fit: "fill" }).png({ quality: 100, compressionLevel: 9 }).toFile(join(categoryRoot, "png-hd-transparent", pngName));
}

writeFileSync(join(target, "README.md"), `# IPF UAE unified logo exports\n\nReview assets only — not connected to the application.\n\n- \`svg/light\`: editable vector masters on ivory\n- \`svg/transparent\`: editable transparent vector masters\n- \`png-hd/light\`: 2400 × 720 px presentation exports\n- \`png-hd/transparent\`: 2400 × 720 px transparent exports\n- \`organized/\`: the same masters separated into UAE chapters, state councils and special councils\n\nThe supplied official IPF mark is preserved. Chapter/council wording is a subordinate lockup.\n`);
console.log("Exported 39 logos in SVG and 2400 × 720 PNG formats.");
