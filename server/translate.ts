import { localeIds, type Locale } from "../src/i18n/locales.js";

/**
 * Automatic machine translation for admin-authored CMS content. An admin only ever has to type
 * English (or whichever language they actually know) once — every other one of the site's 10
 * supported languages is filled in automatically, so the live multi-language site stays accurate
 * without requiring manual translation work for every edit.
 *
 * Default provider: MyMemory (api.mymemory.translated.net) — a free, keyless public translation
 * API, good enough for short CMS copy and generous enough (1,000+ words/day per IP, more with an
 * email on the request) for occasional content edits. If a higher-quality/higher-volume provider
 * is ever needed, set GOOGLE_TRANSLATE_API_KEY and this switches to Google Cloud Translate
 * automatically — same "safely inert until configured, sensible free default otherwise" pattern
 * already used for SMS (server/sms.ts) and rate limiting.
 */

const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
const contactEmail = process.env.TRANSLATE_CONTACT_EMAIL?.trim() || "info@ipf-uae.org";

async function translateOne(text: string, targetLocale: Locale): Promise<string> {
  if (!text.trim() || targetLocale === "en") return text;
  try {
    if (googleApiKey) {
      const response = await fetch(`https://translation.googleapis.com/language/translate2?key=${googleApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "en", target: targetLocale, format: "text" }),
      });
      if (!response.ok) throw new Error(`Google Translate responded ${response.status}`);
      const data = (await response.json()) as { data?: { translations?: { translatedText?: string }[] } };
      return data.data?.translations?.[0]?.translatedText || text;
    }
    const params = new URLSearchParams({ q: text, langpair: `en|${targetLocale}`, de: contactEmail });
    const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
    if (!response.ok) throw new Error(`MyMemory responded ${response.status}`);
    const data = (await response.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
    if (data.responseStatus && data.responseStatus !== 200) throw new Error(`MyMemory status ${data.responseStatus}`);
    return data.responseData?.translatedText || text;
  } catch (error) {
    // Auto-translation is a convenience layer, not a requirement — if the free API is down,
    // rate-limited, or unreachable, the admin's own English text is used as a safe fallback for
    // that locale rather than failing the whole save. The admin can always fill it in by hand later.
    console.warn(`[translate] Could not auto-translate to ${targetLocale}:`, error instanceof Error ? error.message : error);
    return text;
  }
}

/**
 * Given one locale's fields (normally the "en" entry an admin just typed/edited) and the field
 * names to translate, returns a translated copy of those fields for one target locale. Empty
 * fields stay empty (nothing to translate).
 */
async function translateFields<T extends Record<string, string | undefined>>(fields: T, keys: (keyof T)[], targetLocale: Locale): Promise<T> {
  const result = { ...fields };
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value.trim()) {
      result[key] = (await translateOne(value, targetLocale)) as T[typeof key];
    }
  }
  return result;
}

/**
 * Fills in every supported locale missing from `translations` (or present but blank) by
 * machine-translating from the richest available source entry — "en" if present and non-empty,
 * otherwise whichever locale the admin actually typed into. A locale the admin has already filled
 * in by hand is never overwritten — this only ever fills gaps.
 */
export async function autoTranslateMissingLocales<T extends Record<string, string | undefined>>(
  translations: Record<string, T>,
  keys: (keyof T)[],
): Promise<Record<string, T>> {
  const hasContent = (fields: T | undefined) => Boolean(fields && keys.some((key) => (fields[key] as string | undefined)?.trim()));
  const sourceLocale = (hasContent(translations.en) ? "en" : Object.keys(translations).find((locale) => hasContent(translations[locale]))) as Locale | undefined;
  if (!sourceLocale) return translations;
  const source = translations[sourceLocale];
  const result = { ...translations };
  await Promise.all(
    localeIds
      .filter((locale) => locale !== sourceLocale && !hasContent(result[locale]))
      .map(async (locale) => {
        result[locale] = await translateFields(source, keys, locale);
      }),
  );
  return result;
}
