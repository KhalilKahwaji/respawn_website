import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07060B",
        panel: "#0D0C15",
        edge: "#1E1B2E",
        neon: {
          cyan: "#4FE3FF",
          blue: "#38BDF8",
          violet: "#A78BFA",
          magenta: "#E879F9",
          pink: "#F472B6",
        },
        muted: "#8B8A9C",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        "neon-cyan": "0 0 18px rgba(79,227,255,0.35), 0 0 50px rgba(79,227,255,0.12)",
        "neon-magenta": "0 0 18px rgba(232,121,249,0.35), 0 0 50px rgba(232,121,249,0.12)",
        card: "0 10px 40px rgba(0,0,0,0.5)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.6" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.7" },
          "97%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(79,227,255,0.25)" },
          "50%": { boxShadow: "0 0 32px rgba(232,121,249,0.35)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 6s linear infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        rise: "rise .6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
