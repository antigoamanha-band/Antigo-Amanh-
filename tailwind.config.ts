import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0d",
        bone: "#f5f3ef",
        accent: "#c04b29",
      },
      fontFamily: { display: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
export default config;
