<script lang="ts">
	import catLoading from '$lib/assets/catloading.gif';
	import peanutBaby from '$lib/assets/peanutbaby.webp';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import Link from '$lib/components/Link.svelte';

	let errorDescription = $state('');
	$effect(() => {
		if (!store.user) return;
		const urlParams = new URLSearchParams(window.location.search);
		const anonUserId = urlParams.get('anon_user_id');
		const nextUrl = urlParams.get('next') || '/';
		errorDescription = urlParams.get('error_description') || '';
		if (!errorDescription) {
			(async () => {
				const forcedDelay = new Promise((_) => setTimeout(_, 1500));
				const copySwipes = (async () => {
					if (anonUserId && store.user?.id) {
						await supabase.rpc('copy_swipes', {
							source_user_id: anonUserId,
							target_user_id: store.user.id
						});
					}
				})();
				await Promise.all([copySwipes, forcedDelay]);
				goto(nextUrl);
			})();
		}
	});
</script>

<article class="flex flex-col items-center justify-center gap-3 py-8 text-center">
	{#if errorDescription}
		<p class="font-title text-3xl font-bold xl:text-4xl">Oh no! 🫢</p>
		<p>Seems there was an error logging in...</p>
		<img class="rounded" src={peanutBaby} alt="Peanut Butter Baby meme" />
		<p>
			Please, <Link className="text-var(--pico-primary-color)" href="/auth/login">try again</Link>!
		</p>
	{:else}
		<img class="max-w-72 rounded" src={catLoading} alt="Loading..." />
		<span>Processing login, please wait...</span>
	{/if}
</article>
