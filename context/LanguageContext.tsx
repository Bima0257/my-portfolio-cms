"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import en from "@/locales/en";
import id from "@/locales/id";
import type { Translations } from "@/locales/en";

type Locale = "en" | "id";

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const COOKIE_NAME = "portfolio_locale";

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: en,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
    if (match && (match[2] === "id" || match[2] === "en")) return match[2] as Locale;
  } catch {}
  return "en";
}

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? getInitialLocale());
  const router = useRouter();

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("portfolio_locale", l); } catch {}
    try { document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=${60 * 60 * 24 * 365}`; } catch {}
    router.refresh();
  }, [router]);

  const toggleLocale = useCallback(() => {
    const next = locale === "en" ? "id" : "en";
    setLocale(next);
  }, [locale, setLocale]);

  const t = locale === "id" ? id : en;

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
