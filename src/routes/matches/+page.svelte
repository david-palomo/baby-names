<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Match, Partner } from '$lib/types';
	import { fly } from 'svelte/transition';
	import { replaceState } from '$app/navigation';
	import BackButton from '$lib/components/BackButton.svelte';

	let matches = $state<Match[]>([]);
	let partners = $state<Partner[]>([]);
	let isLoading = $state({ partners: true, matches: true });
	let selectedPartnerId = $state<string | null>(null);
	let genderFilter = $state('any');
	let originFilter = $state('any');

	$effect(() => {
		if (!store.user) return;
		isLoading.partners = true;
		const fetchPartners = async () => {
			const { data, error } = await supabase
				.from('v_partners')
				.select('id, name, avatar_url')
				.neq('id', store.user?.id);
			if (error) {
				console.error('Error fetching partners:', error);
			} else {
				partners = data || [];
				const partnerIdFromUrl = page.url.searchParams.get('id');
				if (partners.find((p) => p.id === partnerIdFromUrl)) {
					selectedPartnerId = partnerIdFromUrl;
				} else if (partners.length > 0) {
					selectedPartnerId = partners[0].id;
				}
			}
			isLoading.partners = false;
		};
		fetchPartners();
	});

	$effect(() => {
		const partnerId = selectedPartnerId;
		if (!partnerId || !store.user?.id) {
			matches = [];
			isLoading.matches = false;
			return;
		}

		isLoading.matches = true;
		const fetchMatches = async () => {
			const { data, error } = await supabase
				.from('v_matches')
				.select('name')
				.or(`user_id.eq.${partnerId},partner_id.eq.${partnerId}`);
			if (error) {
				console.error('Error fetching matches:', error);
				matches = [];
			} else {
				matches = data || [];
			}
			isLoading.matches = false;
		};
		fetchMatches();
	});

	$effect(() => {
		if (selectedPartnerId) {
			const url = new URL(window.location.href);
			url.searchParams.set('id', selectedPartnerId);
			replaceState(url, history.state);
		}
	});
</script>

<BackButton href="/swiping" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<h1 class="pb-6 font-title text-2xl font-bold opacity-90">Matches</h1>

	<!-- Filters -->
	<article class="mb-6 px-6 pb-5">
		<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
			<div class="sm:col-span-1">
				<label for="partner-select">Partner</label>
				<select
					id="partner-select"
					bind:value={selectedPartnerId}
					aria-busy={isLoading.partners}
					disabled={isLoading.partners || partners.length === 0}
				>
					{#if isLoading.partners}
						<option>Loading...</option>
					{:else if partners.length === 0}
						<option>No partners found</option>
					{:else}
						{#each partners as partner}
							<option value={partner.id}>{partner.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			<div class="sm:col-span-1">
				<label for="gender-filter">Gender</label>
				<select id="gender-filter" bind:value={genderFilter}>
					<option value="any">Any</option>
					<option value="Male">Male</option>
					<option value="Female">Female</option>
				</select>
			</div>
			<div class="sm:col-span-1">
				<label for="origin-filter">Origin</label>
				<select id="origin-filter" bind:value={originFilter}>
					<option value="any">Any</option>
					<option value="English">English</option>
					<option value="Spanish">Spanish</option>
				</select>
			</div>
		</div>
	</article>

	<!-- Matches Grid -->
	{#if isLoading.matches}
		<p aria-busy="true" class="mt-4">Loading matches...</p>
	{:else if matches.length > 0}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each matches as match (match.name)}
				<article class="!m-0 !p-3 text-center">
					<p class="font-medium">{match.name}</p>
				</article>
			{/each}
		</div>
	{:else}
		<article class="mt-4 text-center">
			<p>No matches found.</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				{#if selectedPartnerId}
					Keep swiping to find names you both like!
				{:else}
					<a href="/partners" class="text-[var(--pico-primary)]">Connect with a partner</a> to see matches.
				{/if}
			</p>
		</article>
	{/if}
</div>
