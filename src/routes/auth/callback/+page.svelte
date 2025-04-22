<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();

		if (error) console.error('Error getting session:', error);
		else if (data.session) {
			goto('/game');
		} else {
			goto('/auth/login');
		}
	});
</script>

<div class="flex h-96 items-center justify-center">
	<p>Processing login, please wait...</p>
</div>
