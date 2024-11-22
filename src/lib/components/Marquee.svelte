<script lang="ts">
	interface Props {
		items: string[];
		duration?: number;
	}
	let { items, duration = 60 }: Props = $props();
</script>

<div class="flex overflow-x-hidden">
	{#each { length: 2 } as _}
		<div class="marquee" style="animation-duration: {duration}s">
			{#each items as item}
				<span class="mr-3.5 opacity-80">{item}</span>
			{/each}
		</div>
	{/each}
</div>

<style>
	.marquee {
		animation: scroll linear infinite;
		white-space: nowrap;
	}
	.marquee > :nth-child(odd) {
		color: var(--pico-primary);
	}
	.marquee > :nth-child(even) {
		color: var(--pico-secondary);
	}
	@keyframes scroll {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
</style>
