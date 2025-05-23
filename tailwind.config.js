/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Indigo
        secondary: "#ec4899", // Pink
        background: "#f9fafb", // Light gray
        accent: "#10b981", // Emerald
        muted: "#6b7280", // Gray
      },
      spacing: {
        "screen-padding": "1.5rem",
        "header-height": "4rem",
      },
      fontFamily: {
        sans: ["RedHatDisplay-Regular", "System"],
        display: ["RedHatDisplay-Regular", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        btn: "0.75rem",
      },
    },
  },
  plugins: [],
};