import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#006a63",
          light: "#9cf2e8",
          muted: "#e0f4f2",
          accent: "#0f766e",
        },
        surface: {
          DEFAULT: "#f7faf8",
          low: "#f1f4f3",
          card: "#ffffff",
        },
        "on-surface": {
          DEFAULT: "#181c1c",
          muted: "#4a5568",
        },
        outline: {
          DEFAULT: "#6e7977",
          variant: "#bdc9c6",
        },
        secondary: "#4e6077",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      fontSize: {
        "hero": "clamp(2.8rem, 5vw, 4.2rem)",
        "section": "clamp(1.8rem, 3vw, 2.5rem)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 20px 40px rgba(0,0,0,0.08)",
        "card-hover": "0 24px 48px rgba(0,0,0,0.1)",
        "hero": "0 30px 60px rgba(0,0,0,0.12)",
        "badge": "0 8px 30px rgba(0,0,0,0.1)",
        "chip": "0 8px 24px rgba(0,106,99,0.3)",
        "primary-glow": "0 12px 30px rgba(0,106,99,0.25)",
      },
      animation: {
        "counter": "counter 1.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "bar-fill": "barFill 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        barFill: {
          from: { width: "0%" },
          to: { width: "var(--bar-width)" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
