// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        background: "#050505", // Deep Obsidian
        foreground: "#FFFFFF",
        accent: {
          blue: "#3B82F6",
          emerald: "#10B981",
        },
      },
      animation: {
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
export default config;
