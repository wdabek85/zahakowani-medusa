import type { Config } from "tailwindcss"

/**
 * Placeholder tokens — Material Design 3 baseline (neutral + indigo primary).
 * Podmień na realne tokeny z Figmy (`bFOpp42bkgVtsOlzH3CSbb`) gdy CC pobierze
 * je przez MCP `get_variable_defs` w przyszłej iteracji.
 *
 * Konwencja per brief #3 §3: kolory jako palety 50-900, fontSize/spacing/radius
 * extended (nie nadpisywanie defaults).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          DEFAULT: "#4f46e5",
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
          DEFAULT: "#f59e0b",
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        success: { DEFAULT: "#16a34a", 50: "#f0fdf4", 500: "#22c55e", 600: "#16a34a" },
        error: { DEFAULT: "#dc2626", 50: "#fef2f2", 500: "#ef4444", 600: "#dc2626" },
        warning: { DEFAULT: "#f59e0b", 50: "#fffbeb", 500: "#f59e0b", 600: "#d97706" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
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
