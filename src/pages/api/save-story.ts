import type { APIContext } from "astro"
import { saveStory } from "../../db"

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
