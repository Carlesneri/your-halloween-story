import { text, sqliteTable, real, integer } from "drizzle-orm/sqlite-core"
import { TABLE_NAME } from "../CONSTANTS"

export const storiesTable = sqliteTable(TABLE_NAME, {
	imageId: text().unique(),
	originalImage: text(),
	transformedImage: text(),
	prompt: text(),
	story: text(),
	rating: real().default(0),
	numOfRatings: integer().default(0),
})
