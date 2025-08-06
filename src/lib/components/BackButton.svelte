<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { defaultPath, store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';

	let { href }: { href?: string } = $props();

	function handleClick() {
		const previousPath = href || store.previousPath;
		store.transitionDirection = -1;
		goto(previousPath);
	}
</script>

<button
	class="mb-2 flex w-fit items-center gap-2 border-0 pb-2 pr-4 text-[var(--pico-primary)] underline-offset-8 ring-0 hover:underline"
	aria-label="Back"
	onclick={handleClick}
>
	<ArrowLeft />
	<span>Back to {(href || store.previousPath || defaultPath).replace('/', '')}</span>
</button>
