export const locales = [
  { id: "en", code: "EN", name: "English", htmlLang: "en" },
  { id: "hi", code: "HI", name: "हिन्दी", htmlLang: "hi" },
  { id: "ml", code: "ML", name: "മലയാളം", htmlLang: "ml" },
  { id: "ta", code: "TA", name: "தமிழ்", htmlLang: "ta" },
  { id: "te", code: "TE", name: "తెలుగు", htmlLang: "te" },
  { id: "kn", code: "KN", name: "ಕನ್ನಡ", htmlLang: "kn" },
  { id: "gu", code: "GU", name: "ગુજરાતી", htmlLang: "gu" },
  { id: "mr", code: "MR", name: "मराठी", htmlLang: "mr" },
  { id: "pa", code: "PA", name: "ਪੰਜਾਬੀ", htmlLang: "pa" },
  { id: "bn", code: "BN", name: "বাংলা", htmlLang: "bn" },
] as const;

export type Locale = (typeof locales)[number]["id"];

export const localeIds: Locale[] = locales.map((item) => item.id);

export function isLocale(value: string | null): value is Locale {
  return Boolean(value && localeIds.includes(value as Locale));
}
