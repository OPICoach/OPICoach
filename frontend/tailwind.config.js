/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        opiBlue: "#404CB5",
        opiOrange: "#ED9C39",
        opiLightGray: "#F3F3F3",
        opiGray: "#6B6D7A",
      },
    },
  },
  plugins: [],
}
