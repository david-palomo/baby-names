<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Match, Partner } from '$lib/types';
	import { fly } from 'svelte/transition';
	import { ArrowLeft } from 'lucide-svelte';
	import { afterNavigate, goto } from '$app/navigation';

	let matches = $state<Match[]>([]);
	let partners = $state<Partner[]>([]);
	let selectedPartnerId = $state<string | null>(null);
	let isLoading = $state(true);
	let previousPage = $state('/game');

	afterNavigate(({ from }) => {
		const pathname = from?.url.pathname;
		if (pathname && !pathname.startsWith('/matches')) {
			previousPage = pathname;
		}
	});

	$effect(() => {
		if (!store.user) return;

		const fetchPartners = async () => {
			const { data, error } = await supabase
				.from('v_partners')
				.select('id, name, avatar_url')
				.neq('id', store.user?.id);
			if (error) {
				console.error('Error fetching partners:', error);
			} else {
				partners = data || [];
				if (partners.length > 0 && !page.url.searchParams.get('id')) {
					goto(`/matches?id=${partners[0].id}`, { replaceState: true });
				}
			}
		};
		fetchPartners();
	});

	$effect(() => {
		const partnerIdFromUrl = page.url.searchParams.get('id');
		selectedPartnerId = partnerIdFromUrl;
	});

	$effect(() => {
		if (!selectedPartnerId || !store.user?.id) {
			matches = [];
			isLoading = false;
			return;
		}

		isLoading = true;
		const fetchMatches = async () => {
			console.log(selectedPartnerId);
			const { data, error } = await supabase
				.from('v_matches')
				.select('name')
				.or(`user_id.eq.${selectedPartnerId},partner_id.eq.${selectedPartnerId}`);
			console.log(data);
			if (error) {
				console.error('Error fetching matches:', error);
				matches = [];
			} else {
				matches = data || [];
			}
			isLoading = false;
		};
		fetchMatches();
	});

	function handlePartnerChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newPartnerId = target.value;
		if (newPartnerId) {
			goto(`/matches?id=${newPartnerId}`);
		}
	}
</script>

<a
	href={previousPage}
	class="flex items-center gap-2 pb-5 text-[var(--pico-primary)] underline-offset-8 hover:underline"
	aria-label="Back"
>
	<ArrowLeft />
	<span>Back to {previousPage.replace('/', '')}</span>
</a>

<div in:fly={{ x: 10, duration: 300 }} out:fly={{ x: 10, duration: 150 }}>
	<h1 class="pb-6 font-title text-2xl font-bold opacity-90">Matches</h1>

	{#if partners.length > 0}
		<div class="mb-6">
			<label for="partner-select" class="block pb-2 font-bold">Select a partner:</label>
			<select
				id="partner-select"
				onchange={handlePartnerChange}
				bind:value={selectedPartnerId}
				class="w-full"
				aria-label="Select a partner to view matches"
			>
				{#if !selectedPartnerId}
					<option value={null} disabled selected>Select a partner</option>
				{/if}
				{#each partners as partner}
					<option value={partner.id}>{partner.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	{#if isLoading}
		<p aria-busy="true" class="mt-4">Loading matches...</p>
	{:else if matches.length > 0}
		<div class="grid">
			{#each matches as match (match.name)}
				<article>
					<p class="font-bold">{match.name}</p>
				</article>
			{/each}
		</div>
	{:else if selectedPartnerId}
		<article class="text-center">
			<p>You have no matches yet with this partner.</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				Keep swiping to find names you both like.
			</p>
		</article>
	{:else}
		<article class="text-center">
			<p>You don't have any partners yet.</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				<a href="/partners" class="text-[var(--pico-primary)]">Connect with a partner</a> to see your
				matches.
			</p>
		</article>
	{/if}
</div>
