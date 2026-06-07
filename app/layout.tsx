import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LocaleHtml from "@/components/LocaleHtml";
import DebugPanel from "@/components/DebugPanel";

export const metadata: Metadata = {
  title: "Bima — Fullstack-Developer",
  description:
    "Fullstack-Developer with a passion for clean, purposeful design. IDF Certified. Based in Yogyakarta, Indonesia.",
  keywords: ["Fullstack-Developer", "Figma", "Product Design", "Indonesia", "Freelance"],
  authors: [{ name: "Bima" }],
  openGraph: {
    title: "Binjan — Fullstack-Developer",
    description: "Crafting digital experiences people love.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = ((await cookies()).get("portfolio_locale")?.value ?? "en") as "en" | "id";

  return (
    <LocaleHtml>
      <body className="antialiased">
        <LanguageProvider initialLocale={locale}>
          {children}
          <DebugPanel />
        </LanguageProvider>
      </body>
    </LocaleHtml>
  );
}
