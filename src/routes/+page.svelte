<script>
	import { fly } from 'svelte/transition';
</script>

<div in:fly>
	<article
		class="mb-6 flex h-80 max-h-[55vh] min-h-72 flex-col items-center justify-center text-center 2xs:h-96"
	>
		<p class="font-title text-3xl font-bold xl:text-4xl">
			<span class="block">Find a baby name</span>
			<span class="block">you both like!</span>
		</p>
		<p class="mt-8 text-sm text-[var(--pico-muted-color)]">
			Doesn't matter if you're expecting a baby...
		</p>
		<p class="text-sm text-[var(--pico-muted-color)]">Or if you just met 👀</p>
		<a href="/game" role="button" class="mt-8 py-2 text-lg xl:mt-10">start swiping 👉</a>
	</article>

	<article class="px-8 py-6 sm:px-12 sm:py-8">
		<h2 class="py-1 font-title text-2xl font-bold">How does it work?</h2>
		<ul class="list-emoji list-disc pl-6 pt-4 text-[var(--pico-muted-color)]">
			<li style="--marker-content: '👉'">Swipe right if you like a name</li>
			<li style="--marker-content: '👈'">Swipe left if you don't</li>
			<li style="--marker-content: '🔒'">Sign in to save your swipes</li>
			<li style="--marker-content: '💑'">Connect with a partner to see your matched names</li>
		</ul>
	</article>
</div>

<style>
	.list-emoji li::marker {
		content: var(--marker-content) '  ';
	}
</style>
