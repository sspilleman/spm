/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('tailwindcss').Config}*/
const config = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/svelte-5-ui-lib/**/*.{html,js,svelte,ts}'
	],
	plugins: [require('flowbite/plugin')],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#FFF2F9',
					100: '#FFE4F3',
					200: '#FFCCE7',
					300: '#FFB3DB',
					400: '#FF99CF',
					500: '#FF7FC3',
					600: '#FF67B7',
					700: '#FF4BAA',
					// 800: '#FF4BAA',
					// 900: '#FF4BAA'
					800: '#FF339F',
					900: '#FF1A93'
				},
				secondary: '#009EFF',
				poppy: '#FF0051FF',
				marianblue: '#324376FF',
				verdigris: '#7EBDC2FF',
				lightgreen: '#93FF96FF',
				orangeweb: '#FCAB10FF'
			}
		}
	}
};

module.exports = config;
