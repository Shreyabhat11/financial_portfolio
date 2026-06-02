/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: "#343b46",
        primary: "#00d2d3",
      },
    },
  },
  plugins: [],
}