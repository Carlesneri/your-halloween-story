import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { storiesTable } from "./schema"
import { desc, eq } from "drizzle-orm"

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

export const getStoryByImageId = async (id: string) => {
	const stories = await db
		.select()
		.from(storiesTable)
		.where(eq(storiesTable.imageId, id))
		.limit(1)

	return stories[0]
}

export const getLatestStories = async () => {
	const stories = await db
		.select()
		.from(storiesTable)
		.orderBy(desc(storiesTable.createdAt))
		.limit(3)

	return stories
}

export const getBestRatedStories = async () => {
	const stories = await db
		.select()
		.from(storiesTable)
		.orderBy(desc(storiesTable.createdAt))
		.limit(3)

	return stories.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
}
