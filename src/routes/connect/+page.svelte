<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';

	$effect(() => {
		if (!store.user) return;
		const partnerId = page.url.searchParams.get('id');
		// TODO: Properly render an error and check for anon users
		if (!partnerId) {
			goto('/');
			return;
		}
		supabase
			.from('connections')
			.insert([{ user_id: store.user?.id, partner_id: partnerId }])
			.then(({ error }) => {
				if (error) {
					console.error('Error connecting users:', error);
					goto('/');
					return;
				}
			});
		goto('/partners');
	});
</script>

<div class="container mx-auto p-4">
	<p>Connecting...</p>
</div>
