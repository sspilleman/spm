/** @type {import('tailwindcss').Config}*/
const config = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/svelte-5-ui-lib/**/*.{html,js,svelte,ts}",
  ],
  plugins: [require("flowbite/plugin")],
  darkMode: "class",
  safelist: [
    {
      pattern: /^columns-\d+/,
    },
  ],
  theme: {
    extend: {
      colors: {
		poppy: '#FF0051FF',
        surface: {
          100: "rgba(255,255,255,<alpha-value>)",
          200: "rgba(255,255,255,<alpha-value>)",
          300: "rgba(17,24,39,<alpha-value>)", // 17 24 39
          content: "rgba(255,255,255,<alpha-value>)",
        },
        // flowbite-svelte
        primary: {
          50: "#FFF2F9",
          100: "#FFE4F3",
          200: "#FFCCE7",
          300: "#FFB3DB",
          400: "#FF99CF",
          500: "#FF7FC3",
          600: "#FF67B7",
          700: "#FF4BAA",
          800: "#FF339F",
          900: "#FF1A93",
        },
        secondary: "#009EFF",
      },
    },
  },
};

module.exports = config;
