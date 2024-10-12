//import type { Config } from "drizzle-kit"

export default {
	schema: "./db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	driver: "turso",
	dbCredentials: {
		url: import.meta.env.TURSO_DATABASE_URL!,
		authToken: import.meta.env.TURSO_AUTH_TOKEN,
	},
} // satisfies Config
