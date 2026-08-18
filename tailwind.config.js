/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", ".theme-dark"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          purple:  "#6366f1",
          cyan:    "#06b6d4",
          fuchsia: "#d946ef",
          dark:    "#030014",
        },
        // EduVantix Journal palette
        journal: {
          bg:         "#FFFFFF",
          bgSecond:   "#F8FAFC",
          terminal:   "#1B2233",
          text:       "#0F172A",
          textSecond: "#475569",
          textMuted:  "#94A3B8",
          border:     "#E2E8F0",
          accent:     "#3454D1",
          eyebrow:    "#C97A1A",
        },
      },
      fontFamily: {
        sans:        ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        desc:        ["var(--font-desc)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        description: ["var(--font-desc)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        title:       ["var(--font-title)", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        heading:     ["var(--font-title)", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        display:     ["var(--font-title)", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        serif:       ["var(--font-serif)", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        // Journal fonts
        fraunces:    ["Fraunces", "Georgia", "serif"],
        sourceSerif: ["Source Serif 4", "Georgia", "serif"],
        ibmMono:     ["IBM Plex Mono", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 5s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.2), 0 0 10px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};
