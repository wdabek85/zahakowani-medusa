import type { Config } from "tailwindcss"

/**
 * Tokens. Primary = Blue (per Figma `bFOpp42bkgVtsOlzH3CSbb`, variables Blue-800/900).
 * Shades 50-700 = Tailwind blue palette; 800/900 overridden to the exact Figma values.
 * Other palettes still placeholder MD3 — refine as Figma exposes more variables.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#193cb8",
          900: "#1c398e",
          DEFAULT: "#2563eb",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          DEFAULT: "#475569",
        },
        accent: {
          // Orange palette (Figma Orange-600 = #F54900 overrides Tailwind orange-600).
          // Used for: VehicleSelector active step pill, "SPRAWDŹ OFERTĘ" CTA.
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#f54900",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#f54900",
        },
        success: { DEFAULT: "#16a34a", 50: "#f0fdf4", 500: "#22c55e", 600: "#16a34a" },
        error: { DEFAULT: "#dc2626", 50: "#fef2f2", 500: "#ef4444", 600: "#dc2626" },
        warning: { DEFAULT: "#f59e0b", 50: "#fffbeb", 500: "#f59e0b", 600: "#d97706" },
      },
      fontFamily: {
        // Loaded via <link> in src/app/layout.tsx (next/font still disabled — see layout note).
        sans: ["Roboto", "Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Roboto", "Inter", "system-ui", "sans-serif"],
        cta: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      borderRadius: {
        "2xs": "0.125rem",
        xs: "0.25rem",
      },
      screens: {
        "2xl": "1440px",
      },
      // Container = 1440px canvas + 80px padding lewo/prawo na 2xl (per Figma).
      // Content area na desktop = 1440 - 160 = 1280px (kolumna treści).
      // Mniejsze ekrany: stopniowy padding (16px → 32px → 80px), max-width = breakpoint.
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",   // <md: 16px
          md: "2rem",        // md+: 32px
          "2xl": "5rem",     // 2xl+ (1440+): 80px po każdej stronie
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1440px",
        },
      },
    },
  },
  plugins: [],
}

export default config
