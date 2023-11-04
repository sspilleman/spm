/** @type {import('tailwindcss').Config}*/
const config = {
	content: [
	  "./src/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
	  "./node_modules/flowbite-svelte-blocks/**/*.{html,js,svelte,ts}",
	],
	plugins: [require("flowbite/plugin")],
	darkMode: "class",
	theme: {
	  extend: {
		colors: {
		  // flowbite-svelte
		  // primary: {
		  // 	50: '#FFF5F2',
		  // 	100: '#FFF1EE',
		  // 	200: '#FFE4DE',
		  // 	300: '#FFD5CC',
		  // 	400: '#FFBCAD',
		  // 	500: '#FE795D',
		  // 	600: '#EF562F',
		  // 	700: '#EB4F27',
		  // 	800: '#CC4522',
		  // 	900: '#A5371B'
		  // }
		  primary: {
			50: "#FFF2F9",
			100: "#FFE4F3",
			200: "#FFCCE7",
			300: "#FFB3DB",
			400: "#FF99CF",
			500: "#FF7FC3",
			600: "#FF67B7",
			700: "#FF4BAA",
			// 800: '#FF4BAA',
			// 900: '#FF4BAA'
			800: "#FF339F",
			900: "#FF1A93",
		  },
		  secondary: "#009EFF",
		},
	  },
	},
  };

  module.exports = config;
