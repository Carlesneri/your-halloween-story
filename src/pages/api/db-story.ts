import type { APIContext } from "astro"
import { removeStory, saveStory, updateStory } from "@/db"

export async function POST({ request }: APIContext) {
	try {
		const data = await request.json()

		const savedStory = await saveStory(data)

		return new Response(JSON.stringify(savedStory))
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}

export async function PUT({ request }: APIContext) {
	try {
		const data = await request.json()

		const updatedStory = await updateStory(data)

		return new Response(JSON.stringify(updatedStory))
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}

export async function DELETE({ request }: APIContext) {
	try {
		const { id } = await request.json()

		const removedStory = await removeStory(id)

		return new Response(JSON.stringify(removedStory))
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}
