export function PlayIcon({ width = 24, height = 24 }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-player-play"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M7 4v16l13 -8z" />
		</svg>
	)
}