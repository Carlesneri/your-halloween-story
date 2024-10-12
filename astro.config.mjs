// @ts-check
import { defineConfig } from "astro/config"
import vercel from "@astrojs/vercel/serverless"
import tailwind from "@astrojs/tailwind"
import preact from "@astrojs/preact"

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [tailwind(), preact()],
	adapter: vercel(),
})
