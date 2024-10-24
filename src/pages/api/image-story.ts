import type { APIContext } from "astro"
import { openaiInstance } from "../../openai"

export async function POST({ request }: APIContext) {
	const { image } = await request.json()

	try {
		const storyResponse = await openaiInstance.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Create a short halloween story based in the image, and making-up what is going to happen next. It should be scary. Something dangerous must be perceived in the background. The response should be a markdown with the title, as a ### title and the story, formatted correctly to be readed.",
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
		})

		const story = storyResponse.choices[0].message.content

		return new Response(story)
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}
