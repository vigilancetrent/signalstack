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
        cyber: {
          bg: "#050814",
          bg2: "#0a0e1f",
          panel: "#0d1228",
          border: "#1c2547",
          ink: "#cbd5ff",
          dim: "#6b7aa8",
          cyan: "#22d3ee",
          violet: "#a78bfa",
          magenta: "#f0abfc",
          green: "#4ade80",
          red: "#f87171",
          amber: "#fbbf24",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 8s linear infinite",
        "regime-pulse": "regime-pulse 1.6s ease-in-out infinite",
        flicker: "flicker 4s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "regime-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.18)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "97%": { opacity: "1" },
          "98%": { opacity: "0.85" },
          "99%": { opacity: "1" },
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 18px rgba(34, 211, 238, 0.45)",
        "glow-violet": "0 0 18px rgba(167, 139, 250, 0.45)",
        "glow-magenta": "0 0 18px rgba(240, 171, 252, 0.45)",
        "glow-green": "0 0 14px rgba(74, 222, 128, 0.45)",
        "glow-red": "0 0 14px rgba(248, 113, 113, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
