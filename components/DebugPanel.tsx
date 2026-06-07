"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export default function DebugPanel() {
  const { locale, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "true" || params.get("debug") === "1") {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    console.log("🌐 [DEBUG] locale:", locale);
    console.log("🌐 [DEBUG] t.nav:", t.nav);
  }, [locale, t, visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999] max-w-sm bg-black/85 text-white text-[0.7rem] font-mono rounded-[12px] p-3 shadow-xl pointer-events-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-[0.75rem] uppercase tracking-wider text-yellow-400">🐞 Debug</span>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="space-y-1">
        <div><span className="text-yellow-300">locale:</span> <span className="text-green-300">{locale}</span></div>
        <div><span className="text-yellow-300">nav.home:</span> {t.nav.home}</div>
        <div><span className="text-yellow-300">nav.skills:</span> {t.nav.skills}</div>
        <div><span className="text-yellow-300">nav.projects:</span> {t.nav.projects}</div>
        <div><span className="text-yellow-300">nav.experience:</span> {t.nav.experience}</div>
        <div><span className="text-yellow-300">nav.contact:</span> {t.nav.contact}</div>
        <div><span className="text-yellow-300">skills.badge:</span> {t.skills.badge}</div>
        <div><span className="text-yellow-300">skills.title:</span> {t.skills.title}</div>
        <div><span className="text-yellow-300">experience.badge:</span> {t.experience.badge}</div>
        <div><span className="text-yellow-300">contact.send:</span> {t.contact.send}</div>
      </div>
    </div>
  );
}
