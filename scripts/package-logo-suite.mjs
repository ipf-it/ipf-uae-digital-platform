import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import india from "@svg-maps/india";
import sharp from "/Users/sagarmamindla/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";

const root = process.cwd();
const suite = join(root, "public/logos/IPF-UAE-Complete-Logo-Suite");
const zipPath = join(root, "public/logos/IPF-UAE-Complete-Logo-Suite.zip");
const review = join(root, "design-review/ipf-logo-system/professional-suite");
const officialLogoPath = join(root, "public/legacy-assets/images/logo.png");
const officialLogo = `data:image/png;base64,${readFileSync(officialLogoPath).toString("base64")}`;
const uae = JSON.parse(readFileSync(join(root, "src/data/uaeMap.json"), "utf8"));
const C = { navy: "#101F4A", dark: "#071A33", saffron: "#F58220", green: "#138A3D", ivory: "#FFFDF8", ink: "#10213D", muted: "#5E6B7D", pale: "#D9E1EA", white: "#FFFFFF" };

const stateIds = {
  "Kerala":"kl","Karnataka":"ka","Andhra Pradesh":"ap","Telangana":"tg","Tamil Nadu":"tn","Maharashtra":"mh","Gujarat":"gj","Punjab":"pb","Rajasthan":"rj","Uttar Pradesh":"up","Bihar":"br","Assam":"as","Odisha":"or","West Bengal":"wb","Madhya Pradesh":"mp","Haryana":"hr","Jharkhand":"jh","Chhattisgarh":"ct","Uttarakhand":"ut","Himachal Pradesh":"hp","Goa":"ga","Arunachal Pradesh":"ar","Manipur":"mn","Meghalaya":"ml","Mizoram":"mz","Nagaland":"nl","Sikkim":"sk","Tripura":"tr"
};
const chapters = ["Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah","Al Ain"].map(place => ({ name:`${place} Chapter`, place, type:"UAE CHAPTER", category:"UAE-Chapters", accent:C.green }));
const states = Object.entries(stateIds).map(([place,mapId]) => ({ name:`${place} Council`, place, mapId, type:"STATE COUNCIL", category:"State-Councils", accent:C.saffron }));
const specials = [{name:"Business Council",icon:"business"},{name:"Women's Council",icon:"women"},{name:"Cultural Council",icon:"culture"}].map(item => ({...item,type:"SPECIAL COUNCIL",category:"Special-Councils",accent:C.navy}));
const roster = [...chapters,...states,...specials];
const variants = ["light-background","dark-background","transparent-light-use","transparent-dark-use"];
const slug = s => s.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const esc = s => s.replace(/[<>&"']/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]));

async function measuredViewBox(path, sourceViewBox) {
  const [, , width, height] = sourceViewBox.split(/\s+/).map(Number);
  const scale = 4;
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="${width*scale}" height="${height*scale}" viewBox="${sourceViewBox}"><path d="${path}" fill="#000"/></svg>`;
  const { info } = await sharp(Buffer.from(probe)).trim({ background:"#00000000" }).toBuffer({ resolveWithObject:true });
  const left=-(info.trimOffsetLeft??0)/scale, top=-(info.trimOffsetTop??0)/scale, w=info.width/scale, h=info.height/scale, pad=Math.max(w,h)*.06;
  return `${left-pad} ${top-pad} ${w+pad*2} ${h+pad*2}`;
}
const stateShapes = new Map();
for (const [state,id] of Object.entries(stateIds)) {
  const location=india.locations.find(entry=>entry.id===id);
  stateShapes.set(state,{path:location.path,viewBox:await measuredViewBox(location.path,india.viewBox)});
}

function uaeSymbol(place,color,muted) {
  const selected=place.toLowerCase().replaceAll(" ","-");
  const paths=uae.locations.map(entry=>`<path d="${entry.path}" fill="${entry.id===selected||(selected==="al-ain"&&entry.id==="abu-dhabi")?color:muted}" stroke="${C.ivory}" stroke-width="1.5"/>`).join("");
  const alAin=selected==="al-ain"?`<path d="${uae.alAinClip}" fill="${color}" stroke="${C.ivory}" stroke-width="1.5"/>`:"";
  return `<svg x="680" y="166" width="226" height="182" viewBox="${uae.viewBox}" preserveAspectRatio="xMidYMid meet">${paths}${alAin}</svg>`;
}
function stateSymbol(item,color) {
  const shape=stateShapes.get(item.place);
  return `<svg x="699" y="140" width="188" height="232" viewBox="${shape.viewBox}" preserveAspectRatio="xMidYMid meet"><path d="${shape.path}" fill="${color}" stroke="${C.ivory}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
}
function specialSymbol(icon,color) {
  const common=`fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"`;
  if(icon==="business") return `<g transform="translate(720 170)" ${common}><rect x="0" y="42" width="148" height="112" rx="16"/><path d="M50 42V18h48v24M0 87c42 28 106 28 148 0M74 82v21"/></g>`;
  if(icon==="women") return `<g transform="translate(724 157)" ${common}><circle cx="70" cy="42" r="31"/><path d="M70 73v100M35 111h70M70 173l-25 33M70 173l25 33"/><path d="M18 72c-11 16-13 37-5 55M122 72c11 16 13 37 5 55"/></g>`;
  return `<g transform="translate(716 156)" ${common}><path d="M80 10v174M42 42c0 28 76 28 76 0M25 92c20 22 90 22 110 0M45 184h70M20 145c30-25 90-25 120 0M80 10l16 20-16 18-16-18z"/></g>`;
}
const fontSizeFor = name => name.length>=27?48:name.length>=23?54:name.length>=19?60:68;

function lockup(item,variant) {
  const dark=variant.includes("dark"), transparent=variant.startsWith("transparent");
  const text=dark?C.white:C.ink, sub=dark?C.pale:C.muted, mutedShape=dark?"#445773":"#CAD2DC";
  const accent=item.category==="Special-Councils"&&dark?C.saffron:item.accent;
  const bg=transparent?"":`<rect width="1800" height="600" fill="${dark?C.dark:C.ivory}"/>`;
  const plate=dark?`<rect x="54" y="135" width="552" height="230" rx="24" fill="${C.ivory}"/>`:"";
  const symbol=item.category==="State-Councils"?stateSymbol(item,accent):item.category==="UAE-Chapters"?uaeSymbol(item.place,accent,mutedShape):specialSymbol(item.icon,accent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="600" viewBox="0 0 1800 600" role="img" aria-labelledby="title desc"><title id="title">IPF ${esc(item.name)}</title><desc id="desc">Official Indian People's Forum ${esc(item.type.toLowerCase())} logo for ${esc(item.name)}</desc>${bg}${plate}<image href="${officialLogo}" x="80" y="150" width="500" height="201" preserveAspectRatio="xMidYMid meet"/><path d="M632 130V370" stroke="${accent}" stroke-width="6"/><circle cx="793" cy="257" r="129" fill="${dark?"#FFFFFF0D":"#10213D08"}" stroke="${dark?"#FFFFFF30":"#10213D22"}" stroke-width="3"/>${symbol}<text x="970" y="185" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" letter-spacing="6" fill="${accent}">${esc(item.type)}</text><text x="970" y="282" font-family="Arial,Helvetica,sans-serif" font-size="${fontSizeFor(item.name)}" font-weight="800" letter-spacing="-1.2" fill="${text}">${esc(item.name)}</text><text x="970" y="332" font-family="Arial,Helvetica,sans-serif" font-size="23" font-weight="600" letter-spacing="1.4" fill="${sub}">INDIAN PEOPLE'S FORUM · UAE</text><path d="M80 472H1720" stroke="${C.saffron}" stroke-width="8"/><path d="M1260 472H1720" stroke="${C.green}" stroke-width="8"/></svg>`;
}

rmSync(suite,{recursive:true,force:true}); rmSync(review,{recursive:true,force:true}); rmSync(zipPath,{force:true});
mkdirSync(suite,{recursive:true}); mkdirSync(review,{recursive:true});
for(const item of roster) {
  const base=`ipf-${slug(item.name)}`;
  for(const variant of variants) {
    const svg=lockup(item,variant), svgDir=join(suite,item.category,variant,"SVG"), pngDir=join(suite,item.category,variant,"PNG-HD-3600x1200");
    mkdirSync(svgDir,{recursive:true}); mkdirSync(pngDir,{recursive:true});
    writeFileSync(join(svgDir,`${base}.svg`),svg);
    await sharp(Buffer.from(svg),{density:192}).resize(3600,1200,{fit:"fill"}).png({compressionLevel:9}).toFile(join(pngDir,`${base}.png`));
  }
}
const master=join(suite,"Official-IPF-Master-Mark"); mkdirSync(master,{recursive:true});
copyFileSync(officialLogoPath,join(master,"ipf-official-master-logo.png"));
copyFileSync(join(root,"public/legacy-assets/images/logo-emblem-full.png"),join(master,"ipf-official-emblem-full.png"));
copyFileSync(join(root,"public/legacy-assets/images/logo-emblem.png"),join(master,"ipf-official-emblem.png"));
writeFileSync(join(suite,"README-FIRST.md"),`# IPF UAE Professional Logo Suite

This replacement suite contains 39 unified identities: 8 UAE Chapters with the relevant emirate highlighted on a vector UAE map, 28 State Councils with individual vector state silhouettes, and 3 Special Councils with distinct minimal vector symbols.

Each identity is supplied as resolution-independent SVG and 3600 × 1200 PNG in light-background, dark-background, transparent-light-use, and transparent-dark-use variants.

The official IPF master mark is preserved exactly from the source published by IPF UAE. Entity names, typography, rules, and territorial/special symbols are vector artwork and remain sharp at any SVG zoom level.
`);
const samples=[["UAE-Chapters","ipf-ras-al-khaimah-chapter"],["State-Councils","ipf-arunachal-pradesh-council"],["Special-Councils","ipf-womens-council"]], inputs=[];
for(const [category,base] of samples) for(const variant of ["light-background","dark-background"]) {
  const source=join(suite,category,variant,"PNG-HD-3600x1200",`${base}.png`);
  inputs.push(await sharp(source).resize(1440,480).png().toBuffer());
}
await sharp({create:{width:3000,height:1680,channels:4,background:"#E7EBF0"}}).composite(inputs.map((input,i)=>({input,left:i%2===0?40:1520,top:40+Math.floor(i/2)*540}))).png().toFile(join(review,"quality-review-board.png"));
console.log(`Generated ${roster.length} professional identities and ${roster.length*variants.length*2} deliverables.`);
