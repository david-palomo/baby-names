<script lang="ts">
	import { fly } from 'svelte/transition';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { fetchState } from '$lib/fetchState.svelte';
	import type { SwipedName } from '$lib/types';
	import { Heart, Undo, RefreshCw, X } from 'lucide-svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate } from '$lib/i18n.svelte';
	import { dedupeById } from '$lib/swipes';
	import { untrack } from 'svelte';

	const t = useTranslate();

	let swipes = $state<SwipedName[]>([]);
	let search = $state('');
	let filter = $state<'all' | 'liked' | 'disliked'>('all');
	let pending = $state<number | null>(null);
	const swipesState = fetchState();

	const likedCount = $derived(swipes.filter((s) => s.liked).length);
	const dislikedCount = $derived(swipes.length - likedCount);

	const visible = $derived.by(() => {
		const term = search.trim().toLowerCase();
		return swipes.filter((s) => {
			if (filter === 'liked' && !s.liked) return false;
			if (filter === 'disliked' && s.liked) return false;
			return !term || s.name.toLowerCase().includes(term);
		});
	});

	async function getSwipes() {
		swipesState.setLoading();
		const { data, error } = await supabase
			.from('v_swipes')
			.select('id,name,liked')
			.order('name', { ascending: true });

		if (error) {
			swipesState.setError(error.message);
		} else {
			swipes = dedupeById(data);
			swipesState.setSuccess();
		}
	}

	/** Removes the swipe entirely, which puts the name back in the deck. */
	async function putBack(swipe: SwipedName) {
		pending = swipe.id;
		const { error } = await supabase.from('swipes').delete().match({
			user_id: store.user?.id,
			babyname_id: swipe.id
		});
		if (!error) {
			swipes = swipes.filter((s) => s.id !== swipe.id);
		}
		pending = null;
	}

	/** Keeps the swipe but flips liked <-> passed. */
	async function flip(swipe: SwipedName) {
		pending = swipe.id;
		const { error } = await supabase
			.from('swipes')
			.upsert({ babyname_id: swipe.id, liked: !swipe.liked });
		if (!error) {
			swipes = swipes.map((s) => (s.id === swipe.id ? { ...s, liked: !s.liked } : s));
		}
		pending = null;
	}

	$effect(() => {
		if (store.user) {
			untrack(() => getSwipes());
		}
	});
</script>

<BackButton href="/swiping" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<div class="flex flex-wrap items-baseline justify-between gap-2 pb-6">
		<h1 class="m-0 font-title text-2xl font-bold opacity-90">{t('swipes.title')}</h1>
		{#if swipesState.status === 'success' && swipes.length > 0}
			<p class="m-0 text-sm text-[var(--pico-muted-color)]">
				{t('swipes.summary', { liked: likedCount, disliked: dislikedCount })}
			</p>
		{/if}
	</div>

	{#if swipesState.status === 'idle' || swipesState.status === 'loading'}
		<p aria-busy="true" class="mt-4">{t('swipes.loading')}</p>
	{:else if swipesState.status === 'error'}
		<article class="mt-4 text-center">
			<p class="m-0 text-[var(--pico-error)]">
				{t('swipes.error', { message: swipesState.message })}
			</p>
		</article>
	{:else if swipes.length === 0}
		<article class="mt-4 text-center">
			<p>{t('swipes.empty')}</p>
			<a href="/swiping" role="button" class="mt-2">{t('swipes.emptyCta')}</a>
		</article>
	{:else}
		<!-- Filters -->
		<article class="mb-6 px-6 pb-5">
			<div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
				<div class="sm:col-span-2">
					<label for="swipe-search">{t('swipes.search')}</label>
					<input
						id="swipe-search"
						type="search"
						bind:value={search}
						placeholder={t('swipes.search')}
					/>
				</div>
				<div class="sm:col-span-1">
					<label for="swipe-filter">{t('swipes.filterLabel')}</label>
					<select id="swipe-filter" bind:value={filter}>
						<option value="all">{t('swipes.all')} ({swipes.length})</option>
						<option value="liked">{t('swipes.liked')} ({likedCount})</option>
						<option value="disliked">{t('swipes.disliked')} ({dislikedCount})</option>
					</select>
				</div>
			</div>
			<p class="m-0 pt-1 text-sm text-[var(--pico-muted-color)]">
				{t('swipes.showing', { count: visible.length, total: swipes.length })}
			</p>
		</article>

		{#if visible.length === 0}
			<article class="mt-4 text-center">
				<p class="m-0">{t('swipes.noResults')}</p>
			</article>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each visible as swipe (swipe.id)}
					<article class="!m-0 flex items-center justify-between gap-2 !p-3">
						<span class="flex min-w-0 items-center gap-2">
							{#if swipe.liked}
								<Heart size={18} class="shrink-0 text-[var(--pico-ok)]" />
							{:else}
								<X size={18} class="shrink-0 text-[var(--pico-error)]" />
							{/if}
							<span
								class="overflow-hidden overflow-ellipsis whitespace-nowrap font-medium
									{swipe.liked ? '' : 'opacity-60'}"
							>
								{swipe.name}
							</span>
						</span>
						<span class="flex shrink-0 items-center gap-1">
							<button
								class="m-0 border-0 bg-transparent p-1.5 text-[var(--pico-accent2)]"
								title={t('swipes.flip')}
								aria-label={t('swipes.flip')}
								disabled={pending === swipe.id}
								onclick={() => flip(swipe)}
							>
								<RefreshCw size={16} />
							</button>
							<button
								class="m-0 border-0 bg-transparent p-1.5 text-[var(--pico-muted-color)]"
								title={t('swipes.undo')}
								aria-label={t('swipes.undo')}
								disabled={pending === swipe.id}
								onclick={() => putBack(swipe)}
							>
								<Undo size={16} />
							</button>
						</span>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</div>
