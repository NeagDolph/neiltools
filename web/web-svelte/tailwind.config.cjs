/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  important: false,

  plugins: [],
  theme: {
    extend: {
      screens: {
        "xl": "1280px"
      },
      width: {
        "124": "31rem",
        "3/2": "180vw"
      },
      height: {
        "168": "42rem"
      },
      minWidth: {
        "40": "10rem",
        "32": "8rem",
        "24": "6rem",
        "28": "7rem"
      },
      maxWidth: {
        "32": "8rem",
        "24": "6rem",
        "28": "7rem"
      },
      fontFamily: {
        "roboto": ["Roboto"],
        "baloo2": ["Baloo2"],
        "futura": ["Futura"],
        "vollkorn": ["Vollkorn"]
      },
      colors: {
        accent: "#6874E8",
        primary: "#35373C",
        primaryBg: "#1f2023",
        light: "rgba(255,255,255,0.87)"
      }
    }
  }
};
