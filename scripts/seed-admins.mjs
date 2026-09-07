import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const passwordPrefix = process.env.IPF_ADMIN_SEED_PASSWORD_PREFIX;
const passwordSuffix = process.env.IPF_ADMIN_SEED_PASSWORD_SUFFIX;
if (!url || !serviceRoleKey || !passwordPrefix || !passwordSuffix) {
  throw new Error("Supabase credentials and IPF_ADMIN_SEED_PASSWORD_PREFIX/SUFFIX are required");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const accounts = [
  { email: "admin@ipf.com", code: "ipf", name: "IPF Super Admin", role: "super_admin", scopeType: "global", scopeId: null },

  { email: "admin.abudhabi@ipf.com", code: "auh", name: "Abu Dhabi Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "abu-dhabi" },
  { email: "admin.dubai@ipf.com", code: "dxb", name: "Dubai Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "dubai" },
  { email: "admin.sharjah@ipf.com", code: "shj", name: "Sharjah Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "sharjah" },
  { email: "admin.ajman@ipf.com", code: "ajm", name: "Ajman Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "ajman" },
  { email: "admin.uaq@ipf.com", code: "uaq", name: "Umm Al Quwain Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "umm-al-quwain" },
  { email: "admin.rak@ipf.com", code: "rak", name: "Ras Al Khaimah Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "ras-al-khaimah" },
  { email: "admin.fujairah@ipf.com", code: "fuj", name: "Fujairah Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "fujairah" },
  { email: "admin.alain@ipf.com", code: "ain", name: "Al Ain Chapter Admin", role: "chapter_admin", scopeType: "chapter", scopeId: "al-ain" },

  { email: "admin.kerala@ipf.com", code: "kl", name: "Kerala Council Admin", role: "council_admin", scopeType: "council", scopeId: "kerala" },
  { email: "admin.karnataka@ipf.com", code: "ka", name: "Karnataka Council Admin", role: "council_admin", scopeType: "council", scopeId: "karnataka" },
  { email: "admin.andra@ipf.com", code: "ap", name: "Andhra Pradesh Council Admin", role: "council_admin", scopeType: "council", scopeId: "andhra-pradesh" },
  { email: "admin.telangana@ipf.com", code: "tg", name: "Telangana Council Admin", role: "council_admin", scopeType: "council", scopeId: "telangana" },
  { email: "admin.tamilnadu@ipf.com", code: "tn", name: "Tamil Nadu Council Admin", role: "council_admin", scopeType: "council", scopeId: "tamil-nadu" },
  { email: "admin.maharashtra@ipf.com", code: "mh", name: "Maharashtra Council Admin", role: "council_admin", scopeType: "council", scopeId: "maharashtra" },
  { email: "admin.gujarat@ipf.com", code: "gj", name: "Gujarat Council Admin", role: "council_admin", scopeType: "council", scopeId: "gujarat" },
  { email: "admin.punjab@ipf.com", code: "pb", name: "Punjab Council Admin", role: "council_admin", scopeType: "council", scopeId: "punjab" },
  { email: "admin.rajasthan@ipf.com", code: "rj", name: "Rajasthan Council Admin", role: "council_admin", scopeType: "council", scopeId: "rajasthan" },
  { email: "admin.uttarpradesh@ipf.com", code: "up", name: "Uttar Pradesh Council Admin", role: "council_admin", scopeType: "council", scopeId: "uttar-pradesh" },
  { email: "admin.bihar@ipf.com", code: "br", name: "Bihar Council Admin", role: "council_admin", scopeType: "council", scopeId: "bihar" },
  { email: "admin.assam@ipf.com", code: "as", name: "Assam Council Admin", role: "council_admin", scopeType: "council", scopeId: "assam" },
  { email: "admin.odisha@ipf.com", code: "od", name: "Odisha Council Admin", role: "council_admin", scopeType: "council", scopeId: "odisha" },
  { email: "admin.westbengal@ipf.com", code: "wb", name: "West Bengal Council Admin", role: "council_admin", scopeType: "council", scopeId: "west-bengal" },
  { email: "admin.madhyapradesh@ipf.com", code: "mp", name: "Madhya Pradesh Council Admin", role: "council_admin", scopeType: "council", scopeId: "madhya-pradesh" },
  { email: "admin.haryana@ipf.com", code: "hr", name: "Haryana Council Admin", role: "council_admin", scopeType: "council", scopeId: "haryana" },
  { email: "admin.jharkhand@ipf.com", code: "jh", name: "Jharkhand Council Admin", role: "council_admin", scopeType: "council", scopeId: "jharkhand" },
  { email: "admin.chhattisgarh@ipf.com", code: "cg", name: "Chhattisgarh Council Admin", role: "council_admin", scopeType: "council", scopeId: "chhattisgarh" },
  { email: "admin.uttarakhand@ipf.com", code: "uk", name: "Uttarakhand Council Admin", role: "council_admin", scopeType: "council", scopeId: "uttarakhand" },
  { email: "admin.himachal@ipf.com", code: "hp", name: "Himachal Pradesh Council Admin", role: "council_admin", scopeType: "council", scopeId: "himachal-pradesh" },
  { email: "admin.goa@ipf.com", code: "ga", name: "Goa Council Admin", role: "council_admin", scopeType: "council", scopeId: "goa" },
  { email: "admin.arunachal@ipf.com", code: "ar", name: "Arunachal Pradesh Council Admin", role: "council_admin", scopeType: "council", scopeId: "arunachal-pradesh" },
  { email: "admin.manipur@ipf.com", code: "mn", name: "Manipur Council Admin", role: "council_admin", scopeType: "council", scopeId: "manipur" },
  { email: "admin.meghalaya@ipf.com", code: "ml", name: "Meghalaya Council Admin", role: "council_admin", scopeType: "council", scopeId: "meghalaya" },
  { email: "admin.mizoram@ipf.com", code: "mz", name: "Mizoram Council Admin", role: "council_admin", scopeType: "council", scopeId: "mizoram" },
  { email: "admin.nagaland@ipf.com", code: "nl", name: "Nagaland Council Admin", role: "council_admin", scopeType: "council", scopeId: "nagaland" },
  { email: "admin.sikkim@ipf.com", code: "sk", name: "Sikkim Council Admin", role: "council_admin", scopeType: "council", scopeId: "sikkim" },
  { email: "admin.tripura@ipf.com", code: "tr", name: "Tripura Council Admin", role: "council_admin", scopeType: "council", scopeId: "tripura" },

  { email: "admin.business@ipf.com", code: "biz", name: "Business Council Admin", role: "council_admin", scopeType: "council", scopeId: "business" },
  { email: "admin.womens@ipf.com", code: "women", name: "Women's Council Admin", role: "council_admin", scopeType: "council", scopeId: "womens" },
  { email: "admin.cultural@ipf.com", code: "cul", name: "Cultural Council Admin", role: "council_admin", scopeType: "council", scopeId: "cultural" },
];

const existing = [];
for (let page = 1; ; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  existing.push(...data.users);
  if (data.users.length < 1000) break;
}

for (const account of accounts) {
  const password = `${passwordPrefix}${account.code}${passwordSuffix}`;
  let authUser = existing.find((user) => user.email?.toLowerCase() === account.email);
  if (authUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: { ...(authUser.user_metadata ?? {}), admin_account: true, must_change_password: authUser.user_metadata?.must_change_password ?? true },
    });
    if (error) throw error;
    authUser = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { admin_account: true, must_change_password: true },
    });
    if (error || !data.user) throw error ?? new Error(`Could not create ${account.email}`);
    authUser = data.user;
  }

  const { error } = await supabase.from("admin_users").upsert({
    auth_user_id: authUser.id,
    email: account.email,
    display_name: account.name,
    role: account.role,
    scope_type: account.scopeType,
    scope_id: account.scopeId,
    active: true,
    mfa_required: account.role === "super_admin",
    password_hash: "",
  }, { onConflict: "email" });
  if (error) throw error;
  console.log(`seeded ${account.email} -> ${account.scopeType}:${account.scopeId ?? "all"}`);
}

console.log(`Seeded ${accounts.length} Supabase Auth administrator accounts.`);
