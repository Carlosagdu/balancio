import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f9fafb",
        surface: "#ffffff",
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#f8fafc"
        },
        muted: "#e2e8f0"
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans]
      },
      boxShadow: {
        card: "0 10px 25px rgba(15, 23, 42, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
