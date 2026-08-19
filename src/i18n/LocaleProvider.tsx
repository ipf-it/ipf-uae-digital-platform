import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { isLocale, locales, type Locale } from "./locales";
import { messages } from "./messages";

const storageKey = "ipf-locale";

type Vars = Record<string, string | number>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Vars) => string;
};

function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

function lookup(locale: Locale, key: string) {
  const entry = messages[key];
  if (!entry) return key;
  return entry[locale] || entry.en || key;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (key) => lookup("en", key),
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(storageKey);
    return isLocale(stored) ? stored : "en";
  });

  useEffect(() => {
    localStorage.setItem(storageKey, locale);
    const meta = locales.find((item) => item.id === locale);
    document.documentElement.lang = meta?.htmlLang ?? "en";
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key, vars) => interpolate(lookup(locale, key), vars),
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export { locales };
export type { Locale };
