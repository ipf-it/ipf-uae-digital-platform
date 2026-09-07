import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { chapterDesks, hashPassword } from "./crypto.js";

const BUCKET = "ipf-uploads";

let client: SupabaseClient | null = null;
let ready = false;

export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (Supabase → Project Settings → API).");
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function ensureDatabase() {
  if (ready) return;
  const supabase = getSupabase();
  const { error } = await supabase.from("chapter_admins").select("chapter_id").limit(1);
  if (error) {
    throw new Error("Supabase tables are missing. Run server/schema.sql in the Supabase SQL editor, then create a public storage bucket named ipf-uploads.");
  }
  const { count } = await supabase.from("chapter_admins").select("*", { count: "exact", head: true });
  if (!count) {
    await supabase.from("chapter_admins").insert(
      chapterDesks.map((desk) => ({
        chapter_id: desk.id,
        chapter_name: desk.name,
        password_hash: hashPassword(`ipf-${desk.id}`),
      })),
    );
  }
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((item) => item.name === BUCKET)) {
    const created = await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 8 * 1024 * 1024 });
    if (created.error && !/exists/i.test(created.error.message)) throw created.error;
  }
  ready = true;
}

export function uploadBucket() {
  return BUCKET;
}
