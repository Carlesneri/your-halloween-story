import type { APIContext } from "astro"
import { removeStory, saveStory, updateStory } from "@/db"
import type { CookieTale } from "@/env"
import { TALES_COOKIE } from "@/CONSTANTS"

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

export async function DELETE({ request, cookies }: APIContext) {
	try {
		const { id } = await request.json()

		const talesCookie = cookies.get(TALES_COOKIE)

		const userTales: CookieTale[] = talesCookie ? talesCookie.json() : []

		const userTale = userTales.find(
			({ id: cookieTaleId }) => cookieTaleId === id
		)

		if (!userTale?.owner) {
			return new Response("No tale found in cookie")
		}

		const removedStory = await removeStory(id)

		return new Response(JSON.stringify(removedStory))
	} catch (error) {
		console.error(error)
		return new Response("Error removing tale")
	}
}
