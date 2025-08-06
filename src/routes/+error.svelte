<script lang="ts">
	import peanutBaby from '$lib/assets/peanutbaby.webp';
	import BackButton from '$lib/components/BackButton.svelte';
	import { fly } from 'svelte/transition';
</script>

<BackButton />
<div in:fly={{ y: 20, duration: 300 }}>
	<article class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		<p class="font-title text-3xl font-bold xl:text-4xl">Oh no! 🫢</p>
		<p class="text-[var(--pico-muted-color)]">Looks like something went wrong...</p>
		<img class="rounded" src={peanutBaby} alt="Peanut Butter Baby meme" />
		<p class="max-w-64 text-balance text-[var(--pico-muted-color)]">
			The site is under construction, so it might as well be our fault
		</p>
	</article>
</div>
