import type { APIContext } from "astro"
import { openaiInstance } from "../../openai"

export async function POST({ request }: APIContext) {
	const { story } = await request.json()

	try {
		const response = await openaiInstance.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `This is a scary story based in a regular image: ${story}`,
						},
					],
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `Create a Cloudinary post to remove the background, just a brief explanation of the background in a short sentence, no more than 50 words, no punctuation marks such as commas, periods, etc. You should briefly explain the new background from an original image that inspired the story, to match the story. You should add some objects, like bats, ghosts, vampires, pumpkins, or any other kind of halloween topics.`,
						},
					],
				},
			],
			max_tokens: 250,
		})

		const prompt = response.choices[0].message.content

		return new Response(prompt)
	} catch (error) {
		console.error(error)
		return new Response("")
	}
}
