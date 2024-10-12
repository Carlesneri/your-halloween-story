import OpenAI from "openai"

const { OPENAI_API_KEY } = import.meta.env
export const openaiInstance = new OpenAI({ apiKey: OPENAI_API_KEY })
