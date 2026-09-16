<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Match, NameMetadata, Partner } from '$lib/types';
	import { fly } from 'svelte/transition';
	import { replaceState } from '$app/navigation';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate } from '$lib/i18n.svelte';

	const t = useTranslate();

	let matches = $state<Match[]>([]);
	let partners = $state<Partner[]>([]);
	let metadata = $state<Record<string, NameMetadata>>({});
	let isLoading = $state({ partners: true, matches: true });
	let selectedPartnerId = $state<string | null>(null);
	let genderFilter = $state('any');
	let originFilter = $state('any');

	function optionsFor(field: 'gender' | 'origin') {
		const values: string[] = [];
		for (const match of matches) {
			const value = metadata[match.name]?.[field];
			if (value && !values.includes(value)) values.push(value);
		}
		return values.sort();
	}

	const genderOptions = $derived(optionsFor('gender'));
	const originOptions = $derived(optionsFor('origin'));
	// Hidden until 0001_name_metadata.sql has been applied.
	const canFilter = $derived(genderOptions.length > 0 || originOptions.length > 0);

	const filteredMatches = $derived(
		matches.filter((match) => {
			const info = metadata[match.name];
			if (genderFilter !== 'any' && info?.gender !== genderFilter) return false;
			if (originFilter !== 'any' && info?.origin !== originFilter) return false;
			return true;
		})
	);

	const hasActiveFilter = $derived(genderFilter !== 'any' || originFilter !== 'any');

	function clearFilters() {
		genderFilter = 'any';
		originFilter = 'any';
	}

	/**
	 * `select('*')` rather than naming the columns, so this still resolves on a
	 * database where the metadata migration hasn't been run yet.
	 */
	async function fetchMetadata(names: string[]) {
		if (names.length === 0) {
			metadata = {};
			return;
		}
		const { data, error } = await supabase.from('babynames').select('*').in('name', names);
		if (error || !data) {
			metadata = {};
			return;
		}
		metadata = Object.fromEntries(
			data.map((row: NameMetadata & { name: string }) => [
				row.name,
				{ gender: row.gender, origin: row.origin, meaning: row.meaning }
			])
		);
	}

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
				metadata = {};
			} else {
				matches = data || [];
				await fetchMetadata(matches.map((m) => m.name));
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
	<h1 class="pb-6 font-title text-2xl font-bold opacity-90">{t('matches.title')}</h1>

	<!-- Filters -->
	<article class="mb-6 px-6 pb-5">
		<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
			<div class={canFilter ? 'sm:col-span-1' : 'sm:col-span-3'}>
				<label for="partner-select">{t('matches.partner')}</label>
				<select
					id="partner-select"
					bind:value={selectedPartnerId}
					aria-busy={isLoading.partners}
					disabled={isLoading.partners || partners.length === 0}
				>
					{#if isLoading.partners}
						<option>{t('matches.loadingOption')}</option>
					{:else if partners.length === 0}
						<option>{t('matches.noPartnersOption')}</option>
					{:else}
						{#each partners as partner (partner.id)}
							<option value={partner.id}>{partner.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			{#if canFilter}
				<div class="sm:col-span-1">
					<label for="gender-filter">{t('matches.gender')}</label>
					<select id="gender-filter" bind:value={genderFilter}>
						<option value="any">{t('matches.any')}</option>
						{#each genderOptions as gender (gender)}
							<option value={gender}>{gender}</option>
						{/each}
					</select>
				</div>
				<div class="sm:col-span-1">
					<label for="origin-filter">{t('matches.origin')}</label>
					<select id="origin-filter" bind:value={originFilter}>
						<option value="any">{t('matches.any')}</option>
						{#each originOptions as origin (origin)}
							<option value={origin}>{origin}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>
		{#if matches.length > 0}
			<p class="m-0 pt-1 text-sm text-[var(--pico-muted-color)]">
				{t('matches.count', { count: filteredMatches.length, total: matches.length })}
			</p>
		{/if}
	</article>

	<!-- Matches Grid -->
	{#if isLoading.matches}
		<p aria-busy="true" class="mt-4">{t('matches.loading')}</p>
	{:else if filteredMatches.length > 0}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{#each filteredMatches as match (match.name)}
				<article class="!m-0 !p-3 text-center">
					<p class="m-0 font-medium">{match.name}</p>
					{#if metadata[match.name]?.meaning}
						<p class="m-0 text-balance pt-1 text-xs text-[var(--pico-muted-color)]">
							{metadata[match.name].meaning}
						</p>
					{/if}
				</article>
			{/each}
		</div>
	{:else if matches.length > 0 && hasActiveFilter}
		<article class="mt-4 text-center">
			<p>{t('matches.noneForFilters')}</p>
			<button class="m-0 mt-2 w-auto outline" onclick={clearFilters}>
				{t('matches.clearFilters')}
			</button>
		</article>
	{:else}
		<article class="mt-4 text-center">
			<p>{t('matches.none')}</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				{#if selectedPartnerId}
					{t('matches.keepSwiping')}
				{:else}
					<a href="/partners" class="text-[var(--pico-primary)]">{t('matches.connectPrompt')}</a>{t(
						'matches.connectPromptRest'
					)}
				{/if}
			</p>
		</article>
	{/if}
</div>
