import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "!./components/AdminPreviewBanner.tsx", // Exclude problematic file with Windows file system issues
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
          'forest-green': "#006400",
          maroon: "#800020",
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
        'gradient-mehendi': 'linear-gradient(135deg, #FFFEF7 0%, #F5D7DA 30%, #FAF9F6 60%, #E8B4B8 100%)',
        'gradient-wedding-teal': 'linear-gradient(135deg, #FFFEF7 0%, #D4E4E8 50%, #B8D4D8 100%)',
        'gradient-reception': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        'gradient-rose-cream': 'linear-gradient(135deg, #E8B4B8 0%, #F5D7DA 50%, #FAF9F6 100%)',
        'gradient-save-date': 'linear-gradient(135deg, #E6D5F3 0%, #F0E6F7 50%, #FAF5FF 100%)',
        'gradient-travel-venue': 'linear-gradient(135deg, #D4E8F0 0%, #E3F2F7 50%, #F0F8FA 100%)',
        'gradient-rsvp': 'linear-gradient(135deg, #F5E6D3 0%, #FAF0E6 50%, #FFF8F0 100%)',
      },
    },
  },
  plugins: [],
};
export default config;

