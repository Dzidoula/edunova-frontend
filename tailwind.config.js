/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#7C3AED", dark: "#6D28D9", light: "#8B5CF6" },
        "on-primary": "#FFFFFF",
        secondary: "#6366F1",
        accent: "#EC4899",
        background: "#FAF5FF",
        foreground: "#0F172A",
        muted: { DEFAULT: "#F7F3FD", foreground: "#64748B" },
        border: "#EFE7FC",
        destructive: "#DC2626",
        ring: "#7C3AED",
        success: "#16A34A",
        warning: "#D97706",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
