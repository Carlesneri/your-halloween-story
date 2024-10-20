import { useEffect, useRef, useState } from "preact/hooks"
import {
	getPrompt,
	getStory,
	saveStory,
	updateCookieRatings,
	updateStory,
} from "@/helpers"
import Showdown from "showdown"
import { getCldImageUrl } from "astro-cloudinary/helpers"

export function Story({
	image,
	story,
	prompt,
	transformedImage,
	imageId,
	rating,
	userRating = 0,
	numOfRatings = 0,
}: {
	image: string
	story?: string | null
	prompt?: string | null
	transformedImage?: string | null
	imageId: string
	rating: number
	userRating: number
	numOfRatings: number
}) {
	const [storyImage, setStoryImage] = useState(transformedImage || image)
	const [isLoadingImage, setIsLoadingImage] = useState(false)
	const [ratingState, setRatingState] = useState(rating)
	const [ratingUserState, setRatingUserState] = useState(userRating)

	const mdRef = useRef<HTMLDivElement>(null)

	const converter = new Showdown.Converter()

	const skulls = Array(5).fill(null)

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

	async function handleClickSkull({
		id,
		value,
	}: {
		id: string
		value: number
	}) {
		setRatingUserState(value)

		const { hasRated } = await updateCookieRatings({ id, value })

		const newNumOfRatings = hasRated ? numOfRatings : numOfRatings + 1

		const newRating =
			(ratingState * numOfRatings + value) / (newNumOfRatings || 1)

		setRatingState(newRating)

		updateStory({
			imageId: imageId,
			rating: newRating,
			numOfRatings: newNumOfRatings,
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

			<div className="flex gap-4 my-4 items-center">
				<div className="flex gap-2 items-center">
					{skulls.map((_, i) => {
						return i >= ratingUserState ? (
							<button
								onClick={() => {
									handleClickSkull({ id: imageId, value: i + 1 })
								}}
							>
								<img
									src="/images/skull.png"
									class="brightness-50 h-6 w-auto transition"
								/>
							</button>
						) : (
							<button
								onClick={() => {
									handleClickSkull({ id: imageId, value: i + 1 })
								}}
							>
								<img src="/images/skull.png" class="h-6 w-auto transition" />
							</button>
						)
					})}
					<span class="text-md text-slate-400">
						({Number(ratingState).toFixed(1)})
					</span>
				</div>
				<div className="audio"></div>
			</div>

			<div ref={mdRef} class="hall-md max-w-[720px] mx-auto">
				{"Loading story..."}
			</div>
		</>
	)
}
