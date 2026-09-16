<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { getUser, supabase } from '$lib/supabase';
	import { Users, Undo, Heart, Settings } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import { store } from '$lib/store.svelte';
	import { fetchState } from '$lib/fetchState.svelte';
	import type { BabyName, BabyNameInfo, Swipe, SwipedName } from '$lib/types';
	import { untrack } from 'svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate } from '$lib/i18n.svelte';

	const t = useTranslate();

	let swipes = $state<SwipedName[]>([]);
	let names = $state<BabyName[]>([]);
	const swipesState = fetchState();
	const namesState = fetchState();

	const currentName = $derived(names.length > 0 ? names[names.length - 1] : null);

	// "+ info" panel. `forId` guards against a slow request landing after the
	// user has already swiped on to the next name.
	let info = $state<{
		open: boolean;
		loading: boolean;
		forId: number | null;
		data: BabyNameInfo | null;
	}>({ open: false, loading: false, forId: null, data: null });

	const infoRows = $derived.by(() => {
		const d = info.data;
		if (!d) return [];
		return [
			{ label: t('swiping.infoMeaning'), value: d.meaning },
			{ label: t('swiping.infoOrigin'), value: d.origin },
			{ label: t('swiping.infoGender'), value: d.gender }
		].filter((row) => !!row.value);
	});

	async function getSwipes() {
		if (store.user && ['loading', 'success'].includes(swipesState.status)) return;
		swipesState.setLoading();

		const { data, error } = await supabase.from('v_swipes').select('id,name,liked').limit(100);

		if (error) {
			swipesState.setError(error.message);
		} else {
			swipes = data.toReversed();
			swipesState.setSuccess();
		}
	}

	async function getNames() {
		if (store.user && ['loading', 'success'].includes(namesState.status)) return;
		namesState.setLoading();

		const { data, error } = await supabase.from('v_random_names').select('id,name');

		if (error) {
			namesState.setError(error.message);
		} else {
			names = data || [];
			namesState.setSuccess();
		}
	}

	/**
	 * Selects `*` rather than the metadata columns by name so the page keeps
	 * working against a database where 0001_name_metadata.sql hasn't been run.
	 */
	async function toggleInfo() {
		const current = currentName;
		if (!current) return;

		if (info.open && info.forId === current.id) {
			info = { ...info, open: false };
			return;
		}

		info = { open: true, loading: true, forId: current.id, data: null };
		const { data } = await supabase
			.from('babynames')
			.select('*')
			.eq('id', current.id)
			.maybeSingle();

		if (info.forId !== current.id) return;
		info = { open: true, loading: false, forId: current.id, data };
	}

	function closeInfo() {
		info = { open: false, loading: false, forId: null, data: null };
	}

	async function handleSwipe(liked: boolean) {
		const current = names.pop();
		if (!current) return;
		closeInfo();

		const swipe: Swipe = { babyname_id: current.id, liked };
		const { error } = await supabase.from('swipes').upsert(swipe);

		if (error?.code === '23503' && error.message.includes('swipes_user_id_fkey')) {
			store.user = await getUser();
			const retryData = swipes.map((s) => ({ babyname_id: s.id, liked: s.liked })).concat(swipe);
			await supabase.from('swipes').upsert(retryData);
		}

		const existingIndex = swipes.findIndex((s) => s.id === current.id);
		if (existingIndex > -1) {
			swipes.splice(existingIndex, 1);
		}
		swipes.push({ ...current, liked });
		if (swipes.length > 100) {
			swipes.shift();
		}
	}

	async function handleUndo() {
		const lastSwipe = swipes.pop();
		if (!lastSwipe) return;
		closeInfo();

		await supabase.from('swipes').delete().match({
			user_id: store.user?.id,
			babyname_id: lastSwipe.id
		});

		names.push({ id: lastSwipe.id, name: lastSwipe.name });
	}

	function putBackInDeck(swipe: SwipedName) {
		closeInfo();
		names.push({ id: swipe.id, name: swipe.name });
	}

	$effect(() => {
		if (store.user) {
			untrack(() => {
				swipes = [];
				swipesState.reset();
				getNames();
				getSwipes();
			});
		}
	});
</script>

<BackButton href="/" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<article
		class="mb-6 flex flex-col items-center justify-center text-center
			{info.open ? 'min-h-[17.5rem] py-8' : 'max-h-[55vh] min-h-[17.5rem] 2xs:h-[21.5rem]'}"
	>
		<p class="text-lg text-[var(--pico-muted-color)]">{t('swiping.question')}</p>
		<p class="flex h-20 items-center font-title text-4xl font-bold">
			{#if namesState.status === 'idle' || namesState.status === 'loading'}
				...
			{:else if namesState.status === 'error'}
				<span class="text-base text-[var(--pico-error)]">{t('swiping.errorNames')}</span>
			{:else if currentName}
				{currentName.name}
			{:else}
				{t('swiping.noNamesLeft')}
			{/if}
		</p>
		<div class="flex w-full justify-center gap-4">
			<button
				type="button"
				class="py-1 text-[var(--pico-accent2)] outline"
				title={t('swiping.undo')}
				aria-label={t('swiping.undo')}
				onclick={handleUndo}
			>
				<Undo size={20} />
			</button>
			<button
				type="button"
				class="py-1 text-xs font-bold outline"
				aria-expanded={info.open}
				disabled={!currentName}
				onclick={toggleInfo}
			>
				{t('swiping.info')}
			</button>
		</div>

		{#if info.open}
			<div transition:slide={{ duration: 200 }} class="w-full max-w-sm px-4 pt-4">
				<div
					class="rounded border border-[var(--pico-border-color-aux)] px-4 py-3 text-left text-sm"
				>
					{#if info.loading}
						<p class="m-0 text-[var(--pico-muted-color)]">{t('swiping.infoLoading')}</p>
					{:else if infoRows.length > 0}
						<dl class="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
							{#each infoRows as row (row.label)}
								<dt class="font-bold text-[var(--pico-primary)]">{row.label}</dt>
								<dd class="m-0 text-balance">{row.value}</dd>
							{/each}
						</dl>
					{:else}
						<p class="m-0 text-[var(--pico-muted-color)]">{t('swiping.infoNone')}</p>
					{/if}
				</div>
			</div>
		{/if}

		<div class="flex space-x-4 pt-4">
			<button
				onclick={() => handleSwipe(false)}
				type="button"
				disabled={!currentName}
				class="error-btn m-0 w-24 px-4 py-2 text-lg font-bold">{t('swiping.no')}</button
			>
			<button
				onclick={() => handleSwipe(true)}
				type="button"
				disabled={!currentName}
				class="ok-btn m-0 w-24 px-4 py-2 text-lg font-bold">{t('swiping.yes')}</button
			>
		</div>
	</article>

	<div class="mb-6 flex gap-4">
		<a
			href="/partners"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-primary)] xs:px-5"
		>
			<Users class="text-[var(--pico-primary)]" />
			<span class="hidden px-2 xs:inline">{t('swiping.partners')}</span>
		</a>
		<a
			href="/matches"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-error)] xs:px-5"
		>
			<IconBrandTinder class="text-[var(--pico-error)]" />
			<span class="px-2">{t('swiping.matches')}</span>
		</a>
		<a
			href="/settings"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-accent3)] xs:px-5"
		>
			<Settings class="text-[var(--pico-accent3)]" />
			<span class="hidden px-2 xs:inline">{t('swiping.settings')}</span>
		</a>
	</div>

	<article class="flex w-full flex-col gap-4 p-6 sm:px-8">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<Heart class="text-[var(--pico-error)]" />{t('swiping.previousSwipes')}
		</h2>
		<div class="flex flex-wrap items-center gap-x-4">
			{#if swipesState.status === 'idle' || swipesState.status === 'loading'}
				<p class="py-1 text-[var(--pico-muted-color)]">{t('swiping.loadingSwipes')}</p>
			{:else if swipesState.status === 'error'}
				<p class="py-1 text-[var(--pico-muted-color)]">
					{t('swiping.oops', { message: swipesState.message })}
				</p>
			{:else if swipes.length === 0}
				<p class="py-1 text-[var(--pico-muted-color)]">{t('swiping.noSwipes')}</p>
			{:else}
				{#each swipes.slice(-16).toReversed() as swipe (swipe.id)}
					<button
						class="inline border-0 py-1
							{swipe.liked ? 'text-[var(--pico-ok)]' : 'line-through decoration-2 opacity-50'}
							hover:text-[var(--pico-accent2)] hover:underline hover:decoration-auto hover:opacity-100"
						title={t('swipes.undo')}
						onclick={() => putBackInDeck(swipe)}
					>
						{swipe.name}
					</button>
				{/each}
				<a href="/swipes" class="py-1 text-[var(--pico-accent2)] hover:underline"
					>{t('swiping.seeMore')}</a
				>
			{/if}
		</div>
	</article>
</div>

<style>
	.error-btn {
		background-color: var(--pico-error-bg);
		border-color: var(--pico-error-bg);
	}
	.error-btn:hover {
		background-color: var(--pico-error-hover);
		border-color: var(--pico-error-hover);
	}
	.ok-btn {
		background-color: var(--pico-ok-bg);
		border-color: var(--pico-ok-bg);
		outline-color: var(--pico-ok-bg);
	}
	.ok-btn:hover {
		background-color: var(--pico-ok-hover);
		border-color: var(--pico-ok-hover);
	}
</style>
