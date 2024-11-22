<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div in:fly>
	<div class="flex justify-between">
		<article class="mb-5 flex space-x-4 py-2">History</article>
		<article class="mb-5 flex space-x-4 py-2">Partner</article>
	</div>

	<article class="flex flex-col items-center justify-center py-8 text-center sm:py-10">
		<p class="pb-4 text-[var(--pico-muted-color)]">Do you like this name?</p>
		<p class="flex h-24 items-center px-1 pb-6 pt-2 text-xl font-bold xs:text-2xl">John</p>
		<div class="flex space-x-4">
			<button type="button" class="error-btn w-24 px-4 py-2 text-lg font-bold">no</button>
			<button type="button" class="w-24 px-4 py-2 text-lg font-bold">yes</button>
		</div>
	</article>
</div>

<style>
	.error-btn {
		background-color: var(--pico-error-bg);
		border-color: var(--pico-error-bg);
	}
	.error-btn:hover {
		background-color: var(--pico-error-hover);
		border-color: var(--pico-error-hover);
	}
</style>
