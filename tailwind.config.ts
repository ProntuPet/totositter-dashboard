import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f8fafc",
        panel: "#ffffff",
        panelAlt: "#f1f5f9",
        border: "#e2e8f0",
        ink: "#0f172a",
        muted: "#64748b",
        accent: "#0891b2",
        intensity: {
          green: "#22c55e",
          yellow: "#eab308",
          orange: "#f97316",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
