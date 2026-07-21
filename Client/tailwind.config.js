/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FBF9F5",
        navbar: "#FBF9F5",
        ink: "#2B2B2B",
        inkMuted: "#6E6659",
        accent: "#8B5A62",
        accentHover: "#734850",
        card: "#FFFFFF",
        border: "#E8E2D6",
        seal: "#B3542E",
        success: "#5C8A66",
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
