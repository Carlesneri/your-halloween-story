import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { storiesTable } from "./schema"
import { eq } from "drizzle-orm"

const turso = createClient({
	url: import.meta.env.TURSO_DATABASE_URL!,
	authToken: import.meta.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(turso)

export const saveStory = async (data: typeof storiesTable.$inferInsert) =>
	await db.insert(storiesTable).values(data)

export const updateStory = async (data: typeof storiesTable.$inferInsert) => {
	await db
		.update(storiesTable)
		.set(data)
		.where(eq(storiesTable.imageId, data.imageId!))
}
