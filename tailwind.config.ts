import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09091e",
        bone: "#f0ede8",
        accent: "#e84820",
      },
      fontFamily: { display: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
export default config;
