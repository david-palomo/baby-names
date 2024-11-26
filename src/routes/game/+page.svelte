<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div in:fly>
	<article class="mb-6 flex h-96 flex-col items-center justify-center text-center">
		<p class="text-lg text-[var(--pico-muted-color)]">Do you like this name?</p>
		<p class="flex h-20 items-center text-3xl font-bold">John</p>
		<button type="button" class="py-1 text-xs font-bold outline">+ info</button>
		<div class="flex space-x-4 pt-6">
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
