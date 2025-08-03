<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getUser, supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';

	let errorDescription: string | null = null;

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const anonUserId = urlParams.get('anon_user_id');
		const nextUrl = urlParams.get('next') || '/';
		errorDescription = urlParams.get('error_description');
		store.user = await getUser();
		if (!errorDescription) {
			if (anonUserId && store.user?.id) {
				await supabase.rpc('copy_swipes', {
					source_user_id: anonUserId,
					target_user_id: store.user.id
				});
			}
			goto(nextUrl);
		}
	});
</script>

<p class="text-center">
	{#if errorDescription}
		There was an error logging in!<br />({errorDescription} 👀)<br />Please, try again.
	{:else}
		Processing login, please wait...
	{/if}
</p>
