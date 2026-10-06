import {webkit} from 'playwright';
const b = await webkit.launch();
const c = await b.newContext({viewport:{width:1440,height:900}});
const p = await c.newPage();
try {
  await p.goto('https://ipf-uae-digital-platform.vercel.app/chapters', {waitUntil:'networkidle',timeout:60000});
  await p.waitForTimeout(2000);
  const info = await p.evaluate(() => {
    const h1 = document.querySelector('#chapters-page-heading');
    const txt = document.body.innerText;
    return {h1: h1?.textContent?.trim(), hasExplore: txt.includes('Explore State Councils')};
  });
  await c.close(); await b.close();
  process.exit(info.h1?.includes('Across the Emirates') && info.hasExplore ? 0 : 1);
} catch(e) { await c.close(); await b.close(); process.exit(1); }
