<script>
	import { fly } from 'svelte/transition';
</script>

<div in:fly>
	<article class="mb-6 flex h-96 flex-col items-center justify-center text-center">
		<p class="text-3xl font-bold">
			<span class="block">Find a baby name</span>
			<span class="block">you both like.</span>
		</p>
		<p class="mt-8 text-sm text-[var(--pico-muted-color)]">
			Doesn't matter if you're expecting a baby...
		</p>
		<p class="text-sm text-[var(--pico-muted-color)]">Or if you just met 👀</p>
		<a href="/game" role="button" class="mt-12 py-2 text-lg">start swiping ✨</a>
	</article>
</div>
