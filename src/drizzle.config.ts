import type { Config } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

export default {
	schema: "./src/db/schema.ts",
	out: "./src/migrations",
	dialect: "turso",
	dbCredentials: {
		url: process.env.TURSO_DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
} satisfies Config
