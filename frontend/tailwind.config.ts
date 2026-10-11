import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: "#070a12",
          card: "#0d1322",
          surface: "#121b2f",
          border: "#1e2b45",
          borderLight: "#2a3d60",
          accent: "#0ea5e9",
          accentHover: "#38bdf8",
          cyberGreen: "#10b981",
          threatYellow: "#f59e0b",
          threatRed: "#ef4444",
          threatCritical: "#dc2626",
          muted: "#94a3b8",
          text: "#f1f5f9"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;
