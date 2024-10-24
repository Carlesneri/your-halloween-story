import { useEffect, useRef, useState } from "preact/hooks"
import {
	getPrompt,
	getStory,
	saveStory,
	updateCookieRatings,
	updateStory,
} from "@/helpers"
import showdown from "showdown"
import { getCldImageUrl } from "astro-cloudinary/helpers"
import { ShareIcon } from "@/components/icons/Share"

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
	const [isError, setIsError] = useState(false)
	const [storyImage, setStoryImage] = useState(transformedImage || image)
	const [isLoadingImage, setIsLoadingImage] = useState(false)
	const [ratingState, setRatingState] = useState(rating)
	const [ratingUserState, setRatingUserState] = useState(userRating)
	const [numOfRatingsState, setNumOfRatingsState] = useState(numOfRatings)

	const mdRef = useRef<HTMLDivElement>(null)

	const skulls = Array(5).fill(null)

	const errorImage = "/images/error-image.png"

	const converter = new showdown.Converter()

	useEffect(() => {
		if (story && mdRef.current) {
			mdRef.current.innerHTML = converter.makeHtml(story)
			return
		}

		if (!story || !transformedImage) {
			getStory({ image }).then(async (story) => {
				if (!story) {
					setIsError(true)
					return
				}

				if (mdRef.current) {
					mdRef.current.innerHTML = converter.makeHtml(story)
				}

				if (story && !prompt) {
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

		if (!hasRated) {
			const newNumOfRatings = numOfRatingsState + 1

			const newRating =
				(ratingState * numOfRatingsState + value) / newNumOfRatings
			setRatingState(newRating)
			setNumOfRatingsState(newNumOfRatings)

			updateStory({
				imageId: imageId,
				rating: newRating,
				numOfRatings: newNumOfRatings,
			})
		}
	}

	async function shareStory() {
		const { href } = document.location

		const shareData = {
			title: "Your hallowee tale",
			url: href,
		}

		const canShare = window.navigator.canShare(shareData)

		if (!canShare) {
			navigator.clipboard.writeText(href)
			alert(`Link copied to clipboard:\n${href}`)

			return
		}

		await navigator.share(shareData)
	}

	return (
		<>
			<picture class="relative">
				{isLoadingImage ? (
					<>
						<img
							alt="scary story"
							id="scary"
							src={isError ? errorImage : storyImage}
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
						src={isError ? errorImage : storyImage}
						class="w-full object-contain my-4 rounded aspect-video shadow-scary"
					/>
				)}
			</picture>

			{!isError && (
				<div className="flex gap-4 mt-5 mb-2 items-center">
					<span className="flex gap-2 items-center">
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
					</span>
					<span>
						<button
							onClick={shareStory}
							class="text-green-400 hover:text-green-200 transition-colors"
						>
							<ShareIcon />
						</button>
					</span>
				</div>
			)}

			<div ref={mdRef} class="hall-md max-w-[720px] mx-auto">
				{isError ? "We are sorry! An error occured." : "Loading story..."}
			</div>
		</>
	)
}
