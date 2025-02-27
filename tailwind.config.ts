import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#4F46E5",
        primary2: "#3E32FF",
        secondary: "#E5E7F3",
        red1: "#DC2626",
        red2: "#CC0303"
      },
    },
  },
  plugins: [],
} satisfies Config;
