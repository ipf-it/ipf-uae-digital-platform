// Generates one flat JSON dictionary per locale from src/i18n/messages.ts, so the app can load
// only the active language (plus English, always eagerly bundled as the fallback) instead of
// shipping all 10 languages' full text (~512KB) to every visitor regardless of which one language
// they actually read. messages.ts stays the single source of truth for editing translations —
// re-run this (`npm run i18n:build`) whenever it changes.
import { writeFileSync, mkdirSync } from "node:fs";
import { messages } from "../src/i18n/messages.ts";
import { localeIds } from "../src/i18n/locales.ts";

const outDir = new URL("../src/i18n/dict/", import.meta.url);
mkdirSync(outDir, { recursive: true });

for (const locale of localeIds) {
  const dict = {};
  for (const [key, row] of Object.entries(messages)) {
    dict[key] = row[locale];
  }
  const path = new URL(`${locale}.json`, outDir);
  writeFileSync(path, JSON.stringify(dict));
  console.log(`${locale}.json: ${Object.keys(dict).length} keys`);
}
