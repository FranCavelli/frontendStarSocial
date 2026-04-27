/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F1",
        peach: "#FCE0D2",
        peachDark: "#F5BFAB",
        blush: "#F7C8D4",
        mint: "#CDEBDD",
        sky: "#CEE4F7",
        butter: "#FBE8B0",
        ink: "#2E2A2A",
        muted: "#8A7E7A",
      },
      fontFamily: {
        display: ['"Quicksand"', "ui-sans-serif", "system-ui"],
        sans: ['"Nunito"', "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(247, 200, 212, 0.45)",
        card: "0 8px 24px -10px rgba(46, 42, 42, 0.18)",
        ring: "0 0 0 6px rgba(252, 224, 210, 0.55)",
      },
      backgroundImage: {
        "sun-gradient":
          "linear-gradient(180deg, #FFF8F1 0%, #FCE0D2 45%, #F7C8D4 100%)",
        "card-gradient":
          "linear-gradient(160deg, #FFFFFF 0%, #FFF8F1 100%)",
      },
    },
  },
  plugins: [],
};
