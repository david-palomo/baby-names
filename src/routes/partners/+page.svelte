<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Partner } from '$lib/types';

	let partners = $state<Partner[]>([]);

	$effect(() => {
		if (!store.user) return;
		supabase
			.from('v_partners')
			.select('id')
			.neq('id', store.user?.id)
			.then(({ data }) => {
				partners = data || [];
			});
	});
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Your ID</h1>
	<p class="mb-4">{store.user?.id}</p>

	<h1 class="mb-4 text-2xl font-bold">Your Connections</h1>
	{#if partners.length > 0}
		<ul class="space-y-4">
			{#each partners as partner}
				<li class="flex items-center space-x-4 rounded-lg border p-4">
					<p class="font-semibold">{partner.id}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>You have no connections yet.</p>
	{/if}
</div>
