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
