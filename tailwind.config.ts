import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          red: "#ef4444",
          yellow: "#eab308",
          green: "#22c55e",
        },
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};

export default config;
