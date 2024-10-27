import type { APIContext } from "astro"
import { openaiInstance } from "../../openai"

export async function POST({ request }: APIContext) {
	const { image } = await request.json()

	try {
		const res = await openaiInstance.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Create a short halloween tale based in the image, and invent what is going to happen next. It should be scary. Something dangerous must be perceived in the background. First line of the story should be the title, must contain just the title text, without format or any other character. It should only contain the title and the story, in plain text.",
						},
						{
							type: "image_url",
							image_url: {
								url: image as string,
								detail: "auto",
							},
						},
					],
				},
			],
			stream: true,
		})

		return new Response(res.toReadableStream())
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}
