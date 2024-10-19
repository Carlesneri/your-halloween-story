import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { storiesTable } from "./schema"

const turso = createClient({
	url: import.meta.env.TURSO_DATABASE_URL!,
	authToken: import.meta.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(turso)

export const saveStory = async (data: typeof storiesTable.$inferInsert) =>
	await db.insert(storiesTable).values(data)
