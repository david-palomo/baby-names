<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import { fly } from 'svelte/transition';
</script>

<BackButton />
<div in:fly={{ y: 20, duration: 300 }}>
	<article class="flex flex-col items-center justify-center gap-4 py-10 text-center">
		<p class="font-title text-3xl font-bold xl:text-4xl">Oh no! 🫢</p>
		<p class="text-sm text-[var(--pico-muted-color)]">Looks like something went wrong:</p>
		<p class="text-xl font-bold text-[var(--pico-primary)]">
			"{page.status} - {page.error?.message}"
		</p>
		<p class="max-w-64 text-balance text-sm/6 text-[var(--pico-muted-color)]">
			The site is under construction, so it might be our fault...
		</p>
	</article>
</div>
