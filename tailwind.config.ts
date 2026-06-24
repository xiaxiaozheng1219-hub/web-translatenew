import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FA",
        foreground: "#1A1A2E",
        accent: "#3B82F6",
        success: "#10B981",
        danger: "#EF4444",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        modal: "0 4px 24px rgba(0,0,0,0.12)",
        float: "0 4px 20px rgba(0,0,0,0.15)",
        toast: "0 2px 8px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;