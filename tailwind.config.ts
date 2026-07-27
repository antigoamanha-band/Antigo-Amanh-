import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0d",
        bone: "#f5f3ef",
        accent: "#c9a24b",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
