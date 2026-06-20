import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beach Stanton coastal palette — deep ocean blue + warm sand accent.
        brand: {
          50: "#eef6fc",
          100: "#d9ebf8",
          200: "#b3d6f0",
          300: "#7fb8e4",
          400: "#4593d3",
          500: "#1f73bd",
          600: "#125a9e",
          700: "#0f487f",
          800: "#103e6b",
          900: "#11355a",
          950: "#0a223c",
        },
        sand: {
          50: "#fbf7ef",
          100: "#f4ead2",
          200: "#e8d3a3",
          300: "#dab873",
          400: "#cf9f4f",
          500: "#c2873a",
          600: "#a96c30",
          700: "#8a522a",
          800: "#724328",
          900: "#603925",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 62, 107, 0.06), 0 8px 24px -12px rgba(16, 62, 107, 0.18)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
