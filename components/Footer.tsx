"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const navLinks = [
    { href: "#home", label: t.nav.home },
    { href: "#about", label: t.nav.home },
    { href: "#skills", label: t.nav.skills },
    { href: "#projects", label: t.nav.projects },
    { href: "#experience", label: t.nav.experience },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <footer className="bg-on-surface text-white/60 py-12 pb-8">
      <div className="max-w-[1160px] mx-auto px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-8 border-b border-white/10">
            <a
              href="#home"
              className="font-display text-2xl font-extrabold text-white no-underline tracking-tight"
            >
              Bi<span className="text-primary-light">ma</span>
            </a>
            <nav className="flex flex-wrap gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.875rem] text-white/50 no-underline transition-colors duration-200 hover:text-white font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-4">
            <p className="text-[0.85rem]">{t.footer.copyright}</p>
            <p className="text-[0.85rem] text-white/40">
              {t.footer.crafted}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
