import type { storiesTable } from "../db/schema"

export async function getStory({ image }: { image: string }) {
	console.log({ image })

	const res = await fetch("/api/image-story", {
		method: "post",
		body: JSON.stringify({ image }),
	})

	const story = await res.text()

	return story
}

export async function getPrompt(story: string) {
	const res = await fetch("/api/bg-prompt", {
		method: "post",
		body: JSON.stringify({ story }),
	})

	const prompt = await res.text()

	return prompt
}

export async function saveStory(data: typeof storiesTable.$inferInsert) {
	await fetch("/api/db-story", {
		method: "post",
		body: JSON.stringify(data),
	})
}

export async function updateStory(data: typeof storiesTable.$inferInsert) {
	await fetch("/api/db-story", {
		method: "put",
		body: JSON.stringify(data),
	})
}

export async function updateCookieRatings({
	id,
	value,
}: {
	id: string
	value: string | number
}) {
	const res = await fetch("/api/ratings-cookie", {
		method: "post",
		body: JSON.stringify({ id, value }),
	})

	const { hasRated } = await res.json()

	return { hasRated }
}
