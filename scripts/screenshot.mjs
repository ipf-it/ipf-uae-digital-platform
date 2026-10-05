#!/usr/bin/env node
/* Reliable Playwright-driven screenshotter for IPF UAE.
 *
 * Why this exists
 *   System Chrome / Playwright Chromium on this macOS build have TWO
 *   defects that broke our local verifications for days:
 *
 *   1. --headless=new intermittently mis-paints SPA pages — lazy
 *      chunks or image loads often finish AFTER --virtual-time-budget
 *      expires, so the snapshot captures the SPA shell or an empty
 *      <picture> instead of real content.
 *
 *   2. Chromium at viewport width = 1440 specifically mis-paints
 *      `<picture>` + `aspect-[4/3]` + `object-cover` on /about, leaving
 *      the organic-clip frame blank. Same page renders fine at 390,
 *      768 and 1920 — only 1440 breaks. Verified: the exact same
 *      page/URL/DOM renders correctly in WebKit at every width.
 *
 *   Fix: default this script to WebKit (Safari engine). It renders
 *   the production site identically to any real-world Mac user's
 *   browser. For CI parity, pass `--engine=chromium` to opt back in
 *   explicitly.
 *
 * Usage
 *   node scripts/screenshot.mjs <baseUrl> <outDir> [page1 page2 ...] \
 *        [--widths 390 768 1440 1920] [--engine webkit|chromium]
 *
 * Default pages: about history leadership yuva support
 * Default widths: 390 768 1440 1920
 * Default engine: webkit
 *
 * Examples
 *   node scripts/screenshot.mjs http://localhost:4180 /tmp/local
 *   node scripts/screenshot.mjs https://ipf-uae-digital-platform.vercel.app /tmp/prod
 */
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const argv = process.argv.slice(2);
const engineIdx = argv.findIndex((a) => a.startsWith("--engine"));
let engineName = "webkit";
if (engineIdx >= 0) {
  engineName = argv[engineIdx].includes("=")
    ? argv[engineIdx].split("=")[1]
    : argv[engineIdx + 1];
  argv.splice(engineIdx, argv[engineIdx].includes("=") ? 1 : 2);
}
const engine = engineName === "chromium" ? chromium : webkit;

const baseUrl = argv[0] ?? "https://ipf-uae-digital-platform.vercel.app";
const outDir = argv[1] ?? "/tmp/ipf-shots";
const sepIdx = argv.indexOf("--widths");
const pages =
  sepIdx > 1
    ? argv.slice(2, sepIdx)
    : argv.slice(2).length > 0
      ? argv.slice(2)
      : ["about", "history", "leadership", "yuva", "support"];
const widths =
  sepIdx >= 0
    ? argv.slice(sepIdx + 1).map(Number).filter(Number.isFinite)
    : [390, 768, 1440, 1920];

mkdirSync(outDir, { recursive: true });

async function waitForHero(page) {
  // Give the SPA time to hydrate, lazy-load its route chunk, and paint
  // the hero image fully — rather than relying on a flaky time budget.
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 25_000 }).catch(() => {});
  await page
    .waitForFunction(
      () => {
        const h1 = document.querySelector("h1");
        if (!h1 || !h1.innerText.trim()) return false;
        const imgs = Array.from(document.querySelectorAll("img"));
        // Every hero-sized image above the fold must have painted.
        const abovefold = imgs.filter((img) => {
          const r = img.getBoundingClientRect();
          return r.top < window.innerHeight && r.width > 100 && r.height > 100;
        });
        return abovefold.every((img) => img.complete && img.naturalWidth > 0);
      },
      { timeout: 20_000 },
    )
    .catch(() => {});
  // Final paint flush
  await page.waitForTimeout(400);
}

process.stdout.write(`Engine: ${engineName}\n`);
const browser = await engine.launch();
const results = [];
try {
  for (const pageName of pages) {
    for (const width of widths) {
      const isMobile = width < 500;
      const ctx = await browser.newContext({
        viewport: { width, height: Math.max(900, Math.round(width * 0.6)) },
        deviceScaleFactor: isMobile ? 2 : 1,
        isMobile,
      });
      const page = await ctx.newPage();
      const url = `${baseUrl.replace(/\/$/, "")}/${pageName}`;
      await page.goto(url, { waitUntil: "commit" });
      await waitForHero(page);
      const path = `${outDir}/${pageName}-${width}.png`;
      await page.screenshot({ path, fullPage: false });
      await ctx.close();
      results.push({ pageName, width, path });
      process.stdout.write(`  ${pageName}-${width}: ${path}\n`);
    }
  }
} finally {
  await browser.close();
}

console.log(`\nDone. ${results.length} shots → ${outDir}`);
