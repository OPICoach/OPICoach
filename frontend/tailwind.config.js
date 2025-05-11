import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#404CB5",
        secondary: "#ED9C39",
        accent: "#6B6D7A",
        neutral: "#F3F3F3",
        background: "#FFFFFF",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
