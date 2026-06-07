"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: t.nav.home },
    { href: "#skills", label: t.nav.skills },
    { href: "#projects", label: t.nav.projects },
    { href: "#experience", label: t.nav.experience },
    { href: "#contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-xl border-b border-outline-variant shadow-[0_2px_20px_rgba(0,0,0,0.04)]"
            : ""
        }`}
      >
        <div className="max-w-[1160px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <a
            href="#home"
            onClick={(e) => handleSmoothScroll(e, "#home")}
            className="font-display text-2xl font-extrabold text-on-surface no-underline tracking-tight"
          >
            Bi<span className="text-primary">ma</span>
          </a>

          <div className="flex items-center gap-2 md:gap-6">
            <ul className="hidden md:flex items-center gap-10 list-none">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="group relative text-sm font-medium text-on-surface-muted no-underline tracking-wide transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "#contact")}
              className="hidden md:inline-flex bg-primary text-white border-none px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-95 hover:bg-primary-accent no-underline tracking-wide"
            >
              {t.nav.hireMe}
            </a>

            <LanguageToggle />

            <button
              className="md:hidden flex flex-col gap-[5px] cursor-pointer p-1 bg-transparent border-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-[22px] h-0.5 bg-on-surface rounded-sm transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-x-[5px] translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-[22px] h-0.5 bg-on-surface rounded-sm transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-[22px] h-0.5 bg-on-surface rounded-sm transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 translate-x-[5px] -translate-y-[7px]" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed top-[72px] left-0 right-0 bg-white/85 backdrop-blur-3xl border-b border-outline-variant px-8 py-6 flex flex-col gap-5 z-[99]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-base font-medium text-on-surface no-underline py-2 border-b border-outline-variant"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleSmoothScroll(e, "#contact")}
            className="inline-flex justify-center bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold no-underline"
          >
            {t.nav.hireMe}
          </a>
        </div>
      )}
    </>
  );
}
