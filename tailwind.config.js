/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#fcce2a", //Jaune vif
        secondary: "#1f3b27", //Vert foncé
        customblack: "#101011", //Noir profond
        customwhite: "#f5f3ec", //Blanc cassé,
        accent: "#949789", //Gris clair
      },
    },
  },
  plugins: [],
};
