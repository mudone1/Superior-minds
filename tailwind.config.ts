import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/contexts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette — academic ledger theme
        paper: "#FAF7F0", // warm off-white background
        ink: {
          DEFAULT: "#101828", // near-black ink for headings/dark sections
          700: "#1D2939",
          500: "#5B6472", // muted slate text
          300: "#98A2B3",
        },
        indigo: {
          DEFAULT: "#1E3A5F", // primary brand — deep academic indigo
          50: "#EDF1F6",
          100: "#D6E0EA",
          400: "#3B5D85",
          600: "#16304F",
          700: "#0F233C",
          900: "#081525",
        },
        brass: {
          DEFAULT: "#C08A2E", // gold/brass accent — honors, achievement
          50: "#FBF3E3",
          100: "#F5E3BE",
          400: "#D6A44E",
          600: "#9C6E20",
        },
        sage: {
          DEFAULT: "#2F6E5B", // secondary — growth / success
          50: "#E9F3F0",
          100: "#CFE6DE",
          600: "#235345",
        },
        rose: {
          DEFAULT: "#A23B3B", // error / alert
          50: "#F8EAEA",
        },
        // Marketing site palette (public landing page) — deliberately namespaced
        // under `royal`/`gold` so it never collides with the dashboard's
        // `indigo`/`brass` ledger theme used throughout the authenticated app.
        royal: {
          DEFAULT: "#123C8C",
          50: "#EAF0FC",
          100: "#CFDEF7",
          400: "#3861B0",
          600: "#0E2F6E",
          700: "#0A2352",
          900: "#050F24",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E7",
          100: "#F3E6BB",
          400: "#DDBE5C",
          600: "#B08F22",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 43px, rgba(16,24,40,0.06) 44px)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
        panel: "0 4px 24px rgba(16,24,40,0.08)",
      },
      borderRadius: {
        seal: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
