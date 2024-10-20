import type { APIContext } from "astro"
import { COOKIE_OPTIONS, RATINGS_COOKIE } from "@/CONSTANTS"

export async function POST({ request, cookies }: APIContext) {
	const { id, value } = await request.json()

	const userRatingsCookie = cookies.get(RATINGS_COOKIE)

	const userRatings = userRatingsCookie ? userRatingsCookie.json() : null

	const newUserRatings = userRatings
		? { ...userRatings, [id]: value }
		: { [id]: value }

	cookies.set(RATINGS_COOKIE, JSON.stringify(newUserRatings), COOKIE_OPTIONS)

	return new Response(
		JSON.stringify({
			hasRated: !!(userRatings as Record<string, string | number>)?.[id],
		})
	)
}
