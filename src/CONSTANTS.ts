import type { AstroCookieSetOptions } from "astro"

export const FOLDER = "halloween"
export const TABLE_NAME = "stories"
export const RATINGS_COOKIE = "ratings"
export const COOKIE_OPTIONS: AstroCookieSetOptions = {
	expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years
	httpOnly: true,
	path: "/",
	secure: true,
}
