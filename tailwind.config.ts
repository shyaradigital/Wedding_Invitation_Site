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
        wedding: {
          gold: "#D4AF37",
          'gold-light': "#E8D5A3",
          rose: "#E8B4B8",
          'rose-light': "#F5D7DA",
          'rose-pastel': "#F8E8E9",
          cream: "#F5F5DC",
          'cream-light': "#FAF9F6",
          burgundy: "#800020",
          'burgundy-light': "#A64D4D",
          navy: "#1A1A2E",
          'navy-light': "#2D2D4A",
          ivory: "#FFFEF7",
          blush: "#F4E4E6",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        script: ["Dancing Script", "cursive"],
        display: ["Playfair Display", "serif"],
      },
      backgroundImage: {
        'gradient-wedding': 'linear-gradient(135deg, #F8E8E9 0%, #FAF9F6 50%, #F5D7DA 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E8D5A3 100%)',
      },
    },
  },
  plugins: [],
};
export default config;

