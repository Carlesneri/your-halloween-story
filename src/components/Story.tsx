import { useEffect, useRef, useState } from "preact/hooks"
import {
	getPrompt,
	getStory,
	saveStory,
	updateRatingInCookie,
	updateStory,
	getAudio,
} from "@/helpers"
import { getCldImageUrl } from "astro-cloudinary/helpers"
import { ShareIcon } from "@/components/icons/Share"
import { DeleteIcon } from "@/components/icons/Delete"
import { navigate } from "astro:transitions/client"
import { PlayIcon } from "./icons/PlayIcon"
import { CloseIcon } from "./icons/CloseIcon"

export function Story({
	image,
	story,
	prompt,
	transformedImage,
	imageId,
	rating,
	userRating = 0,
	numOfRatings = 0,
	isOwner = false,
}: {
	image: string
	story?: string | null
	prompt?: string | null
	transformedImage?: string | null
	imageId: string
	rating: number
	userRating: number
	numOfRatings: number
	isOwner?: boolean
}) {
	const [isError, setIsError] = useState(false)
	const [storyText, setStoryText] = useState(story)
	const [title, setTitle] = useState("Loading story...")
	const [paragraphs, setParagraphs] = useState<string[]>([])
	const [storyImage, setStoryImage] = useState(transformedImage || image)
	const [isLoadingImage, setIsLoadingImage] = useState(false)
	const [ratingState, setRatingState] = useState(rating)
	const [ratingUserState, setRatingUserState] = useState(userRating)
	const [numOfRatingsState, setNumOfRatingsState] = useState(numOfRatings)
	const [hasFinishedStory, setHasFinishedStory] = useState(false)
	const [showAudio, setShowAudio] = useState(false)
	const [isLoadingAudio, setIsLoadingAudio] = useState(false)
	const [audioSrc, setAudioSrc] = useState<string>("")
	const audioRef = useRef<HTMLAudioElement>(null)

	const skulls = Array(5).fill(null)

	const errorImage = "/images/error-image.png"

	useEffect(() => {
		if (!story) {
			getStory({
				image,
				messageUpdater: setStoryText,
				onFinish: () => setHasFinishedStory(true),
				onError: () => setIsError(true),
			})
		}
	}, [])

	useEffect(() => {
		if (storyText) {
			const lines = storyText.split("\n")

			if (lines.length > 1) {
				const [title, ...restOfLines] = lines

				setTitle(title)

				setParagraphs(restOfLines)
			}
		}
	}, [storyText])

	useEffect(() => {
		if (!hasFinishedStory) return

		if (storyImage && !prompt) {
			getPrompt(storyImage).then((newPrompt) => {
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
							type: "fill",
							aspectRatio: 16 / 9,
						},
					})

					saveStory({
						story: storyText,
						transformedImage: cldTransformedImage,
						prompt: newPrompt,
						imageId,
						originalImage: image,
					})

					fetcher(cldTransformedImage)
				}
			})
		}
	}, [hasFinishedStory])

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

		const { hasPreviousRating } = await updateRatingInCookie({
			id,
			rating: value,
		})

		if (!hasPreviousRating) {
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

	useEffect(() => {
		if (isError) {
			setTitle("We are sorry! An error occured.")
		}
	}, [isError])

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

	async function removeStory() {
		await fetch("/api/db-story", {
			method: "delete",
			body: JSON.stringify({ id: imageId }),
		})

		navigate("/")
	}

	async function playTale() {
		setShowAudio(true)

		if (audioSrc) {
			return
		}

		if (storyText) {
			setIsLoadingAudio(true)

			const { speechFile } = await getAudio({ text: storyText, id: imageId })

			setIsLoadingAudio(false)

			setAudioSrc(`/${speechFile}`)
		}
	}

	function handleClickCloseAudio() {
		setShowAudio(false)
		audioRef.current?.pause()
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

					{/* {(story || hasFinishedStory) && (
						<span>
							<button
								onClick={playTale}
								class="text-green-400 hover:text-green-200 transition-colors"
								title="play tale"
							>
								<PlayIcon />
							</button>
						</span>
					)} */}

					{(isOwner || !story) && (
						<span>
							<button
								onClick={removeStory}
								class="text-red-400 hover:text-red-200 transition-colors"
							>
								<DeleteIcon />
							</button>
						</span>
					)}
				</div>
			)}

			<section
				class={`fixed bottom-6 left-0 right-0 w-full max-w-[720px] p-2 mx-auto ${
					showAudio ? "opacity-1" : "opacity-0"
				}`}
			>
				<div class="relative gap-4 mx-auto rounded-xl p-4 bg-green-700 bg-opacity-90">
					{isLoadingAudio && (
						<div class="absolute flex items-center inset-0 p-4">
							Loading audio...
						</div>
					)}
					<div
						class={`flex justify-between items-center w-full gap-2 ${
							isLoadingAudio ? "opacity-10" : ""
						}`}
					>
						<audio src={audioSrc} controls class="w-full" ref={audioRef} />

						<button
							onClick={handleClickCloseAudio}
							class="text-red-300 hover:text-red-100 transition-colors"
						>
							<CloseIcon width={32} height={32} />
						</button>
					</div>
				</div>
			</section>

			<div class="hall-md w-full max-w-[720px] mx-auto">
				{title && <h3 class="text-2xl my-4">{title}</h3>}
				{paragraphs && paragraphs.map((p) => <p class="my-4">{p}</p>)}
			</div>
		</>
	)
}
