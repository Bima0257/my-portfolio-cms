"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LocaleHtml({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      {children}
    </html>
  );
}
