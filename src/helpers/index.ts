import type { storiesTable } from "../db/schema"
import type { ChatCompletionChunk } from "openai/resources/index.mjs"
import type { Dispatch, StateUpdater } from "preact/hooks"

export async function getStory({
	image,
	messageUpdater,
	onFinish,
	onError,
}: {
	image: string
	messageUpdater: Dispatch<StateUpdater<string | null | undefined>>
	onFinish: () => void
	onError: () => void
}) {
	try {
		const { body } = await fetch("/api/image-story", {
			method: "post",
			body: JSON.stringify({ image }),
		})

		if (!body) {
			onError()

			return
		}

		const reader = body.getReader()

		let eventChunk = ""

		const decoder = new TextDecoder("utf-8")

		for await (const chunk of readChunks(reader)) {
			const decodedChunk = decoder.decode(chunk)

			const events = decodedChunk.split("\n")

			for (const event of events) {
				eventChunk += event

				if (!isValidJSON(eventChunk)) {
					continue
				}

				const streamEvent: ChatCompletionChunk = JSON.parse(eventChunk)

				eventChunk = ""

				const content = streamEvent.choices[0].delta.content

				if (streamEvent.object === "chat.completion.chunk" && content) {
					messageUpdater((prev) => (prev ? prev + content : content))
				}
			}
		}

		onFinish()
	} catch (error) {
		onError()

		return null
	}
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

	updateCookie({ id: data.imageId!, owner: true })
}

export async function updateStory(data: typeof storiesTable.$inferInsert) {
	await fetch("/api/db-story", {
		method: "put",
		body: JSON.stringify(data),
	})
}

export async function updateCookie({
	id,
	rating,
	owner,
}: {
	id: string
	rating?: number
	owner?: boolean
}) {
	const res = await fetch("/api/cookies", {
		method: "put",
		body: JSON.stringify({ id, rating, owner }),
	})

	const { cookie } = await res.json()

	return { cookie }
}

export async function updateRatingInCookie({
	id,
	rating,
	owner,
}: {
	id: string
	rating?: number
	owner?: boolean
}) {
	const res = await fetch("/api/cookies", {
		method: "put",
		body: JSON.stringify({ id, rating, owner }),
	})

	const { cookie, hasPreviousRating } = await res.json()

	return { hasPreviousRating, cookie }
}

function readChunks(reader: ReadableStreamDefaultReader<Uint8Array>) {
	return {
		async *[Symbol.asyncIterator]() {
			let readResult = await reader.read()
			while (!readResult.done) {
				yield readResult.value
				readResult = await reader.read()
			}
		},
	}
}

function isValidJSON(str: string) {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}
	return true
}

export async function getAudio({ text, id }: { text: string; id: string }) {
	try {
		const res = await fetch("/api/speech", {
			method: "post",
			body: JSON.stringify({ text, id }),
		})

		const { speechFile } = await res.json()

		return { speechFile }
	} catch (error) {
		return { speechFile: null }
	}
}

export async function removeAudio({ id }: { id: string }) {
	const res = await fetch("/api/speech", {
		method: "delete",
		body: JSON.stringify({ id }),
	})

	const { speechFile } = await res.json()

	return { speechFile }
}
