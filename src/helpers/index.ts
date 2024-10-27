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
