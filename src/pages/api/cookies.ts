import type { APIContext } from "astro"
import { COOKIE_OPTIONS, TALES_COOKIE } from "@/CONSTANTS"
import type { CookieTale } from "@/env"

export async function POST({ request, cookies }: APIContext) {
	const { id, rating, owner } = await request.json()

	const talesCookie = cookies.get(TALES_COOKIE)

	const userTales: CookieTale[] = talesCookie ? talesCookie.json() : null

	const newItem: CookieTale = {
		id,
		...(rating && { rating }),
		owner,
	}

	const newUserTales: CookieTale[] = userTales
		? [
				newItem,
				...userTales.filter(({ id: cookieId }) => cookieId === id).slice(0, 10),
		  ]
		: [newItem]

	cookies.set(TALES_COOKIE, JSON.stringify(newUserTales), COOKIE_OPTIONS)

	return new Response(
		JSON.stringify({
			cookie: newUserTales,
		})
	)
}

export async function PUT({ request, cookies }: APIContext) {
	const { id, rating, owner } = await request.json()

	const talesCookie = cookies.get(TALES_COOKIE)

	const userTales: CookieTale[] = talesCookie ? talesCookie.json() : []

	const userTale = userTales.find(({ id: taleCookieId }) => taleCookieId === id)

	const newItem: CookieTale = {
		...userTale,
		id,
		...(rating && { rating }),
		...(owner && { owner }),
	}

	const newUserTales: CookieTale[] = userTales
		? [
				newItem,
				...userTales.filter(({ id: cookieId }) => cookieId !== id).slice(0, 10),
		  ]
		: [newItem]

	cookies.set(TALES_COOKIE, JSON.stringify(newUserTales), COOKIE_OPTIONS)

	return new Response(
		JSON.stringify({
			cookie: newUserTales,
			hasPreviousRating: !!userTale?.rating,
		})
	)
}
export async function GET({ cookies }: APIContext) {
	const talesCookie = cookies.get(TALES_COOKIE)

	return new Response(
		JSON.stringify({
			cookie: talesCookie,
		})
	)
}
