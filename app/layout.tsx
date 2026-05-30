import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
