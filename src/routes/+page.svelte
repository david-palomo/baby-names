<script>
	import { fly } from 'svelte/transition';
</script>

<div in:fly={{ y: -20, duration: 300 }}>
	<article
		class="mb-6 flex h-80 max-h-[55vh] min-h-72 flex-col items-center justify-center text-center 2xs:h-96"
	>
		<p class="font-title text-3xl font-bold xl:text-4xl">
			<span class="block">Find a baby name</span>
			<span class="block">you both like!</span>
		</p>
		<p class="mt-8 text-[var(--pico-muted-color)]">Doesn't matter if you're expecting a baby...</p>
		<p class="text-[var(--pico-muted-color)]">Or if you just met 👀</p>
		<a href="/swiping" role="button" class="mt-8 py-2 text-lg xl:mt-10">start swiping 👉</a>
	</article>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-9">
		<article class="flex flex-col justify-evenly px-8 py-6 sm:col-span-5 lg:px-10 lg:py-8">
			<h2 class="py-1 font-title text-2xl font-bold">How does it work?</h2>
			<ul class="list-emoji list-disc pl-6 pt-4 text-[var(--pico-muted-color)]">
				<li style="--marker-content: '👉'">Swipe right if you like a name</li>
				<li style="--marker-content: '👈'">Swipe left if you don't</li>
				<li style="--marker-content: '🔒'">Sign in to save your swipes</li>
				<li style="--marker-content: '💑'">Connect with a partner</li>
				<li style="--marker-content: '🎉'">See your matched names!</li>
			</ul>
		</article>
		<article class="flex flex-col justify-between px-8 py-6 sm:col-span-4 lg:px-10 lg:py-8">
			<!-- <h2 class="py-1 font-title text-2xl font-bold">Name of the Day</h2>
			<div class="text-right">
				<p class="xl mt-2 font-title text-3xl font-bold text-[var(--pico-primary)]">Olivia</p>
				<p class="mt-2 text-balance text-[var(--pico-muted-color)]">
					A timeless name that means "olive tree," symbolizing peace and harmony.
				</p>
			</div> -->
			<h2 class="flex flex-row items-center gap-2 py-1 font-title text-2xl font-bold">
				<span>Did you know? 🌐</span>
			</h2>
			<p class="mt-2 text-[var(--pico-muted-color)]">
				In <em>Iceland</em>, a national commitee must approve new unlisted names. Until then, the
				child will be literally called "Girl" (Stúlka) or "Boy" (Drengur).
			</p>
		</article>
	</div>
</div>

<style>
	.list-emoji li::marker {
		content: var(--marker-content) '  ';
	}
	em {
		font-style: normal;
		color: var(--pico-primary);
	}
</style>
