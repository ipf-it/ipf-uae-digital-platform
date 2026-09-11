import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { isLocale, locales, type Locale } from "./locales";
import en from "./dict/en.json";

const storageKey = "ipf-locale";

type Vars = Record<string, string | number>;
type Dict = Record<string, string>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Vars) => string;
};

function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

const enDict = en as Dict;

// English is always bundled eagerly (it's the default locale and the loading-state fallback);
// every other language's ~50-70KB dictionary is only fetched once someone actually picks it —
// previously all 10 languages' full text (~512KB combined) shipped to every visitor regardless of
// which single one they'd ever read. See scripts/split-messages.mjs (source: messages.ts).
const dictLoaders: Record<Locale, () => Promise<{ default: Dict }>> = {
  en: () => Promise.resolve({ default: enDict }),
  hi: () => import("./dict/hi.json"),
  ml: () => import("./dict/ml.json"),
  ta: () => import("./dict/ta.json"),
  te: () => import("./dict/te.json"),
  kn: () => import("./dict/kn.json"),
  gu: () => import("./dict/gu.json"),
  mr: () => import("./dict/mr.json"),
  pa: () => import("./dict/pa.json"),
  bn: () => import("./dict/bn.json"),
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (key) => enDict[key] ?? key,
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(storageKey);
    return isLocale(stored) ? stored : "en";
  });
  const [dicts, setDicts] = useState<Partial<Record<Locale, Dict>>>({ en: enDict });
  const requested = useRef<Set<Locale>>(new Set(["en"]));

  useEffect(() => {
    localStorage.setItem(storageKey, locale);
    const meta = locales.find((item) => item.id === locale);
    document.documentElement.lang = meta?.htmlLang ?? "en";
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    if (requested.current.has(locale)) return;
    requested.current.add(locale);
    let active = true;
    void dictLoaders[locale]().then((mod) => {
      if (active) setDicts((prev) => ({ ...prev, [locale]: mod.default }));
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    // Falls back to English while a just-selected locale's dictionary is still loading (a brief,
    // one-time moment per language per session — every key is guaranteed present once loaded,
    // messages.ts's row() helper never leaves a locale slot empty).
    const dict = dicts[locale] ?? enDict;
    return {
      locale,
      setLocale: setLocaleState,
      t: (key, vars) => interpolate(dict[key] ?? key, vars),
    };
  }, [locale, dicts]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export { locales };
export type { Locale };
