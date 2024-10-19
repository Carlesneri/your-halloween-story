/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			boxShadow: {
				scary: "inset 0 0 4px 0 rgb(0 0 0 / 0.5)",
			},
		},
	},
	plugins: [],
}
