/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#fcce2a",
        secondary: "#1f3b27",
        customblack: "#101011",
        customwhite: "#f5f3ec",
        accent: "#949789",
      },
      fontFamily: {
        quicksand: ["Quicksand"],
        "quicksand-light": ["QuicksandLight"],
        "quicksand-medium": ["QuicksandMedium"],
        "quicksand-semibold": ["QuicksandSemiBold"],
        "quicksand-bold": ["QuicksandBold"],
        clash: ["ClashGrotesk"],
        "clash-bold": ["ClashGroteskBold"],
        "clash-medium": ["ClashGroteskMedium"],
        "clash-semibold": ["ClashGroteskSemibold"],
        "clash-light": ["ClashGroteskLight"],

        sans: ["Quicksand"],
      },
    },
  },
  plugins: [],
};
