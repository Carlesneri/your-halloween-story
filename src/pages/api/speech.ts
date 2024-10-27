import { openaiInstance } from "@/openai"
import type { APIContext } from "astro"
import fs from "fs/promises"
import path from "path"

const speechDir = "speeches"

export async function POST({ request }: APIContext) {
	const { text, id } = await request.json()

	const speechFile = `${speechDir}/${id}.mp3`
	const speechPath = path.resolve(process.cwd(), "public", speechFile)

	const mp3 = await openaiInstance.audio.speech.create({
		model: "tts-1",
		voice: "echo",
		input: text,
	})

	const buffer = Buffer.from(await mp3.arrayBuffer())

	await fs.writeFile(speechPath, buffer)

	return new Response(JSON.stringify({ speechFile }))
}

export async function DELETE({ request }: APIContext) {
	const { id } = await request.json()

	const speechFile = `${speechDir}/${id}.mp3`
	const speechPath = path.resolve(process.cwd(), "public", speechFile)

	await fs.rm(speechPath)

	return new Response(JSON.stringify({ speechFile }))
}
