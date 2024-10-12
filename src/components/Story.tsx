import { useEffect, useRef, useState } from "preact/hooks"
import { getPrompt, getStory } from "../helpers"
import Showdown from "showdown"
import { getCldImageUrl } from "astro-cloudinary/helpers"

export function Story({
	image,
	story,
	prompt,
	transformedImage,
}: {
	image: string
	story?: string
	prompt?: string
	transformedImage?: string
}) {
	const [storyImage, setStoryImage] = useState(transformedImage || image)

	const mdRef = useRef<HTMLDivElement>(null)

	const converter = new Showdown.Converter()

	useEffect(() => {
		if (!story) return

		getStory({ image }).then(async (story) => {
			console.log({ story })
			if (!story) return

			if (mdRef.current) {
				mdRef.current.innerHTML = converter.makeHtml(story)
			}

			const imgPrompt = prompt || (await getPrompt(story))

			console.log({ imgPrompt })

			if (imgPrompt && !transformedImage) {
				const transformedImage = getCldImageUrl({
					src: image || "",
					replaceBackground: imgPrompt,
					saturation: "-30",
					autoBrightness: true,
					brightness: "-10",
					art: "fes",
					aspectRatio: 16 / 9,
				})

				console.log({ transformedImage })

				// saveStory({ story, transformedImage, prompt: imgPrompt })

				fetcher(transformedImage)
			}
		})
	}, [])

	function fetcher(url: string) {
		fetch(url).then((res) => {
			console.log(res)

			if (res.ok) {
				setStoryImage(url)
				return
			}

			setTimeout(() => fetcher(url), 3000)
		})
	}

	return (
		<>
			<img
				alt="scary story"
				id="scary"
				src={storyImage}
				class="w-full object-contain my-4 rounded aspect-video"
			/>

			<div ref={mdRef}>{story || "Loading image..."}</div>
		</>
	)
}
