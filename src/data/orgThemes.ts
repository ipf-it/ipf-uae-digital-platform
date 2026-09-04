export type OrgTheme = {
  label: string;
  motif: string;
  story: string;
  primary: string;
  secondary: string;
  accent: string;
  motion: "weave" | "wave" | "orbit" | "drift" | "pulse";
};

const emirateThemes: Record<string, OrgTheme> = {
  "abu-dhabi": { label: "Capital of tolerance", motif: "Grand Mosque & Liwa", story: "A calm, dignified visual language inspired by Abu Dhabi’s civic architecture, desert horizons and culture of inclusion.", primary: "#1e5d58", secondary: "#d8c39a", accent: "#f7efe0", motion: "orbit" },
  dubai: { label: "A city in motion", motif: "Skyline & creek", story: "A confident metropolitan theme balancing Dubai’s future-facing skyline with the trading heritage of the creek.", primary: "#0a4b78", secondary: "#d6a44d", accent: "#dff3ff", motion: "pulse" },
  sharjah: { label: "Heart of culture", motif: "Heritage & books", story: "Warm sandstone, manuscript-inspired rhythm and a cultural character shaped by Sharjah’s museums and heritage districts.", primary: "#713f32", secondary: "#d5a85b", accent: "#fff0d9", motion: "weave" },
  ajman: { label: "Community by the coast", motif: "Fort & dhow", story: "An intimate coastal palette inspired by Ajman’s fort, dhow-building heritage and IPF’s registered home in the emirate.", primary: "#315f68", secondary: "#d89c58", accent: "#e7f6f4", motion: "wave" },
  "al-ain": { label: "The garden city", motif: "Oasis & Jebel Hafeet", story: "Date-palm greens and mountain earth tones reflect Al Ain’s oasis landscape and family-centred community life.", primary: "#3e6b3c", secondary: "#b77b43", accent: "#edf6df", motion: "drift" },
  "umm-al-quwain": { label: "Pearls & mangroves", motif: "Lagoon & islands", story: "A quiet marine theme celebrating the emirate’s lagoon, mangroves, islands and long pearling history.", primary: "#176b73", secondary: "#c9aa69", accent: "#def7f4", motion: "wave" },
  "ras-al-khaimah": { label: "From mountain to sea", motif: "Jebel Jais", story: "Layered mountain tones and sunrise copper evoke Ras Al Khaimah’s dramatic northern landscape.", primary: "#554c63", secondary: "#d1774d", accent: "#f4e9e4", motion: "drift" },
  fujairah: { label: "The eastern coast", motif: "Hajar mountains & sea", story: "Deep ocean blue and rugged mountain grey express Fujairah’s distinctive setting on the Gulf of Oman.", primary: "#075d78", secondary: "#a8a49b", accent: "#dff4f6", motion: "wave" },
};

const stateMotifs: Record<string, [string, string, string, string]> = {
  kerala: ["Kathakali, coconut palms & backwaters", "#175f4b", "#d7a62e", "#eef8e9"],
  karnataka: ["Mysore heritage & sandalwood", "#6b315d", "#d69b32", "#faedf4"],
  "andhra-pradesh": ["Kuchipudi & Kalamkari", "#963e2c", "#d7a83b", "#fff0df"],
  telangana: ["Charminar & Deccani craft", "#16605c", "#d19b4b", "#e4f5ef"],
  "tamil-nadu": ["Temple gopurams & Bharatanatyam", "#7b2f3a", "#d79b35", "#fff0e4"],
  maharashtra: ["Warli art & Sahyadri forts", "#733c2b", "#d68c32", "#f8eee2"],
  gujarat: ["Garba & Patola", "#8b2857", "#e0a126", "#fff0f6"],
  punjab: ["Phulkari & fields", "#285f3c", "#e0a828", "#eff7df"],
  rajasthan: ["Palaces, camels & desert heritage", "#9a4f62", "#e0ad62", "#fae9e8"],
  "uttar-pradesh": ["Ganga ghats & chikankari", "#334f7b", "#d2a54b", "#eef2fb"],
  bihar: ["Nalanda & Madhubani", "#6e4232", "#c99237", "#f9efe2"],
  assam: ["Muga silk & one-horned rhino", "#315f3c", "#d8a02d", "#eef7e7"],
  odisha: ["Odissi & temple stonework", "#7b3030", "#d59a37", "#fff0e6"],
  "west-bengal": ["Terracotta & Santipore weave", "#762c3e", "#d5a248", "#faedf1"],
  "madhya-pradesh": ["Bagh print & central forests", "#5c4932", "#bd743a", "#f6efe2"],
  haryana: ["Surajkund craft & harvest fields", "#3c6335", "#d0a12c", "#f0f6df"],
  jharkhand: ["Sohrai art & forest country", "#4e5630", "#be7441", "#f2f3e3"],
  chhattisgarh: ["Bastar Dhokra & tribal craft", "#5d4933", "#c1833e", "#f7efdf"],
  uttarakhand: ["Aipan art & Himalayan rivers", "#315b68", "#c55b3d", "#e8f3f4"],
  "himachal-pradesh": ["Kullu weave & mountain valleys", "#3d5867", "#c77a3b", "#ecf3f5"],
  goa: ["Azulejo colour & Konkan coast", "#176a73", "#e09b3d", "#e8f8f4"],
  "arunachal-pradesh": ["Mountain textiles & sunrise", "#355e51", "#df923a", "#edf6e9"],
  manipur: ["Ras Lila & lotus wetlands", "#6c3d69", "#ce8c4c", "#f6edf7"],
  meghalaya: ["Living root bridges & clouds", "#255d58", "#bf9b55", "#e6f5f1"],
  mizoram: ["Puanchei weave & bamboo hills", "#375c4b", "#cf584c", "#edf5ed"],
  nagaland: ["Naga textiles & hill heritage", "#623a31", "#cf7b3d", "#f7ede6"],
  sikkim: ["Monasteries & Himalayan bloom", "#394f70", "#d3a43b", "#edf1f8"],
  tripura: ["Bamboo craft & palace heritage", "#4e6039", "#c98f3c", "#f0f5e7"],
};

export function chapterTheme(id: string) { return emirateThemes[id] ?? emirateThemes.dubai; }

export function councilTheme(id: string, region: string): OrgTheme {
  const [motif, primary, secondary, accent] = stateMotifs[id] ?? ["Indian arts & community", "#163b67", "#d8a13b", "#f5efe4"];
  const motions: OrgTheme["motion"][] = ["weave", "orbit", "drift", "wave", "pulse"];
  const motion = motions[Math.abs([...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % motions.length];
  return { label: `${region}, together in the UAE`, motif, primary, secondary, accent, motion, story: `A distinct council identity inspired by ${motif.toLowerCase()}, connecting ${region}’s living heritage with service in the UAE.` };
}
