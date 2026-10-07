import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        led: { on: "#ff3b3b", off: "#4a1414" },
        // landing-page palette: deep PCB green-black, copper traces,
        // phosphor-green reserved for literal live readouts (see
        // HeroCircuit) — not used as a generic UI accent
        pcb: "#0E1B14",
        "pcb-raised": "#16261C",
        copper: "#B9793C",
        phosphor: "#6EE7A8",
        paper: "#EDEAE0",
        silkscreen: "#8E9A91",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "power-on": {
          "0%": { filter: "brightness(0.4)", opacity: "0.6" },
          "60%": { filter: "brightness(1.3)", opacity: "1" },
          "100%": { filter: "brightness(1)", opacity: "1" },
        },
      },
      animation: {
        "power-on": "power-on 1.2s ease-out 1",
      },
    },
  },
  plugins: [],
};
export default config;
