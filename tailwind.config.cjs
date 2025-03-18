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
				poppy: '#FF0051FF'
			}
		}
	}
};

module.exports = config;
