import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "/Users/sagarmamindla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";

const root = process.cwd();
const source = join(root, "design-review/ipf-logo-system/recommended-lockups");
const suite = join(root, "public/logos/IPF-UAE-Complete-Logo-Suite");
const chapterFiles = new Set(["abu-dhabi", "dubai", "sharjah", "ajman", "umm-al-quwain", "ras-al-khaimah", "fujairah", "al-ain"].map((name) => `ipf-${name}-chapter.svg`));
const specialFiles = new Set(["ipf-business-council.svg", "ipf-womens-council.svg", "ipf-cultural-council.svg"]);
const variants = ["light-background", "dark-background", "transparent-light-use", "transparent-dark-use"];

function darkVersion(svg, transparent = false) {
  let result = svg
    .replace(/<rect width="1200" height="360" rx="28" fill="#fffdf8"\/>/, transparent ? "" : '<rect width="1200" height="360" rx="28" fill="#0b1f3a"/>')
    .replace(/fill="#0b1f3a"/g, 'fill="#ffffff"')
    .replace(/fill="#667085"/g, 'fill="#cbd5e1"');
  result = result.replace(/<image /, '<rect x="42" y="55" width="480" height="215" rx="18" fill="#fffdf8"/><image ');
  return result;
}

function makeVariants(light) {
  return {
    "light-background": light,
    "dark-background": darkVersion(light),
    "transparent-light-use": light.replace(/<rect width="1200" height="360" rx="28" fill="#fffdf8"\/>/, ""),
    "transparent-dark-use": darkVersion(light, true),
  };
}

for (const file of readdirSync(source).filter((name) => name.endsWith(".svg"))) {
  const category = chapterFiles.has(file) ? "UAE-Chapters" : specialFiles.has(file) ? "Special-Councils" : "State-Councils";
  const logoVariants = makeVariants(readFileSync(join(source, file), "utf8"));
  const pngName = `${basename(file, ".svg")}.png`;
  for (const variant of variants) {
    const vectorDir = join(suite, category, variant, "SVG");
    const rasterDir = join(suite, category, variant, "PNG-HD-2400x720");
    mkdirSync(vectorDir, { recursive: true });
    mkdirSync(rasterDir, { recursive: true });
    writeFileSync(join(vectorDir, file), logoVariants[variant]);
    await sharp(Buffer.from(logoVariants[variant]), { density: 192 })
      .resize(2400, 720, { fit: "fill" })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(join(rasterDir, pngName));
  }
}

const masterDir = join(suite, "Official-IPF-Master-Mark");
mkdirSync(masterDir, { recursive: true });
copyFileSync(join(root, "public/legacy-assets/images/logo.png"), join(masterDir, "ipf-official-master-logo.png"));
copyFileSync(join(root, "public/legacy-assets/images/logo-emblem-full.png"), join(masterDir, "ipf-official-emblem-full.png"));
copyFileSync(join(root, "public/legacy-assets/images/logo-emblem.png"), join(masterDir, "ipf-official-emblem.png"));

writeFileSync(join(suite, "README-FIRST.md"), `# IPF UAE Complete Logo Suite

This package contains 39 unified organisational lockups:

- 8 UAE Chapters
- 28 State Councils
- 3 Special Councils

Every logo is supplied in four usage variants:

1. **light-background** — ivory presentation background
2. **dark-background** — IPF navy presentation background
3. **transparent-light-use** — transparent canvas for light surfaces
4. **transparent-dark-use** — transparent canvas with a protective light panel behind the official master mark

Each variant includes:

- Editable, resolution-independent SVG
- HD 2400 × 720 PNG

## Usage rules

- Do not redraw, recolour, stretch or crop the official IPF master mark.
- Maintain clear space around the full lockup.
- Use light-use assets on white or pale backgrounds.
- Use dark-use assets on navy, black, photographic or dark backgrounds.
- Do not extract the chapter/council name and present it as a separate emblem.
- Obtain central approval before public rollout.

## Core colours

- IPF Navy: #0B1F3A
- IPF Saffron: #F7931E
- IPF Green: #168B3A
- Ivory: #FFFDF8

These are review assets and are not connected to the application UI.
`);

console.log("Prepared 39 logos × 4 variants × SVG and HD PNG.");
