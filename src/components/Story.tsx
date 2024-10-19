import { useEffect, useRef, useState } from "preact/hooks"
import { getPrompt, getStory, saveStory } from "../helpers"
import Showdown from "showdown"
import { getCldImageUrl } from "astro-cloudinary/helpers"

export function Story({
	image,
	story,
	prompt,
	transformedImage,
	imageId,
}: {
	image: string
	story?: string | null
	prompt?: string | null
	transformedImage?: string | null
	imageId: string
}) {
	const [storyImage, setStoryImage] = useState(transformedImage || image)
	const [isLoadingImage, setIsLoadingImage] = useState(false)

	const mdRef = useRef<HTMLDivElement>(null)

	const converter = new Showdown.Converter()

	useEffect(() => {
		if (story && mdRef.current) {
			mdRef.current.innerHTML = converter.makeHtml(story)
		}

		if (!story || !transformedImage) {
			getStory({ image }).then(async (story) => {
				console.log({ story })

				if (mdRef.current) {
					mdRef.current.innerHTML = converter.makeHtml(story)
				}

				if (!prompt) {
					getPrompt(story).then((newPrompt) => {
						console.log({ newPrompt })

						if (!transformedImage) {
							setIsLoadingImage(true)

							const cldTransformedImage = getCldImageUrl({
								src: image || "",
								replaceBackground: newPrompt,
								saturation: "-30",
								autoBrightness: true,
								brightness: "-10",
								art: "fes",
								crop: {
									type: "auto",
									aspectRatio: 16 / 9,
								},
							})

							console.log({ cldTransformedImage })

							saveStory({
								story,
								transformedImage: cldTransformedImage,
								prompt: newPrompt,
								imageId,
								originalImage: image,
							})

							fetcher(cldTransformedImage)
						}
					})
				}
			})
		}
	}, [])

	function fetcher(url: string) {
		fetch(url).then((res) => {
			console.log(res)

			if (res.ok) {
				setStoryImage(url)
				setIsLoadingImage(false)
				return
			}

			setTimeout(() => fetcher(url), 3000)
		})
	}

	return (
		<>
			<picture class="relative">
				{isLoadingImage ? (
					<>
						<img
							alt="scary story"
							id="scary"
							src={storyImage}
							class="relative w-full object-contain my-4 rounded aspect-video brightness-50"
						/>
						<div class="absolute inset-0 grid place-content-center font-bold text-2xl">
							Transforming image...
						</div>
					</>
				) : (
					<img
						alt="scary story"
						id="scary"
						src={storyImage}
						class="w-full object-contain my-4 rounded aspect-video shadow-scary"
					/>
				)}
			</picture>

			<div ref={mdRef} class="hall-md max-w-[720px] mx-auto">
				{"Loading story..."}
			</div>
		</>
	)
}
