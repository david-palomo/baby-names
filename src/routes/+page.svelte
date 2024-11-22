<script>
	import Marquee from '$lib/components/Marquee.svelte';
	import { fly } from 'svelte/transition';
	import { names as items } from '$lib/data';
	let duration = 140;
</script>

<div in:fly>
	<article class="mb-5 select-none px-0 py-2"><Marquee {items} {duration} /></article>

	<article class="mb-6 flex flex-col items-center justify-center py-10 text-center 2xs:py-14">
		<p class="text-2xl font-bold">
			<span class="block">Find a baby name</span>
			<span class="block">you both like.</span>
		</p>
		<p class="mt-6 text-sm text-[var(--pico-muted-color)]">
			Doesn't matter if you're expecting a baby...
		</p>
		<p class="text-sm text-[var(--pico-muted-color)]">Or if you just met 👀</p>
		<a href="/game" role="button" class="mt-8 py-2 text-lg">start swiping ✨</a>
	</article>

	<article class="mb-5 select-none px-0 py-2"><Marquee {items} {duration} /></article>

	<article class="p-8 sm:px-12 sm:py-10">
		<h2 class="py-1 font-sans text-xl font-bold opacity-90">How does it work?</h2>
		<ul class="list-disc pl-6 pt-4 text-[var(--pico-muted-color)]">
			<li class="right">Swipe right if you like a name</li>
			<li class="left">Swipe left if you don't</li>
			<li class="signin">Sign in to save your swipes</li>
			<li class="match">Connect with a partner to see your matched names</li>
		</ul>
	</article>
</div>

<style>
	.right::marker {
		content: '👉  ';
	}
	.left::marker {
		content: '👈  ';
	}
	.signin::marker {
		content: '🔒  ';
	}
	.match::marker {
		content: '💑  ';
	}
</style>
