<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getUser, supabase } from '$lib/supabase';
	import { Users, Undo, Heart, Settings } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import { store } from '$lib/store.svelte';
	import { fetchState } from '$lib/fetchState.svelte';
	import type { BabyName, Swipe, SwipedName } from '$lib/types';
	import { untrack } from 'svelte';

	let swipes = $state<SwipedName[]>([]);
	let names = $state<BabyName[]>([]);
	const swipesState = fetchState();
	const namesState = fetchState();

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

	async function handleSwipe(liked: boolean) {
		const currentName = names.pop();
		if (!currentName) return;

		const swipe: Swipe = { babyname_id: currentName.id, liked };
		const { error } = await supabase.from('swipes').upsert(swipe);

		if (error?.code === '23503' && error.message.includes('swipes_user_id_fkey')) {
			store.user = await getUser();
			const retryData = swipes.map((s) => ({ babyname_id: s.id, liked: s.liked })).concat(swipe);
			await supabase.from('swipes').upsert(retryData);
		}

		const existingIndex = swipes.findIndex((s) => s.id === currentName.id);
		if (existingIndex > -1) {
			swipes.splice(existingIndex, 1);
		}
		swipes.push({ ...currentName, liked });
		if (swipes.length > 100) {
			swipes.shift();
		}
	}

	async function handleUndo() {
		const lastSwipe = swipes.pop();
		if (!lastSwipe) return;

		await supabase.from('swipes').delete().match({
			user_id: store.user?.id,
			babyname_id: lastSwipe.id
		});

		names.push({ id: lastSwipe.id, name: lastSwipe.name });
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

<div in:fly={{ x: 10, duration: 300 }}>
	<article
		class="mb-6 flex h-80 max-h-[55vh] min-h-72 flex-col items-center justify-center text-center 2xs:h-96"
	>
		<p class="text-lg text-[var(--pico-muted-color)]">Do you like this name?</p>
		<p class="flex h-20 items-center font-title text-4xl font-bold">
			{#if namesState.status === 'idle' || namesState.status === 'loading'}
				...
			{:else if namesState.status === 'error'}
				<span class="text-base text-[var(--pico-error)]">Error loading names!</span>
			{:else if names.length > 0}
				{names[names.length - 1].name}
			{:else}
				No names left!
			{/if}
		</p>
		<div class="flex w-full justify-center gap-4">
			<button type="button" class="py-1 text-[var(--pico-accent2)] outline" onclick={handleUndo}>
				<Undo size={20} />
			</button>
			<button type="button" class="py-1 text-xs font-bold outline">+ info</button>
		</div>
		<div class="flex space-x-4 pt-4">
			<button
				onclick={() => handleSwipe(false)}
				type="button"
				class="error-btn m-0 w-24 px-4 py-2 text-lg font-bold">no</button
			>
			<button
				onclick={() => handleSwipe(true)}
				type="button"
				class="ok-btn m-0 w-24 px-4 py-2 text-lg font-bold">yes</button
			>
		</div>
	</article>

	<div class="mb-6 flex gap-4">
		<a
			href="/partners"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-primary)] xs:px-5"
		>
			<Users class="text-[var(--pico-primary)]" />
			<span class="hidden px-2 xs:inline">Partners</span>
		</a>
		<a
			href="/matches"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-error)] xs:px-5"
		>
			<IconBrandTinder class="text-[var(--pico-error)]" />
			<span class="px-2">Matches</span>
		</a>
		<a
			href="/settings"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-accent3)] xs:px-5"
		>
			<Settings class="text-[var(--pico-accent3)]" />
			<span class="hidden px-2 xs:inline">Settings</span>
		</a>
	</div>

	<article class="flex w-full flex-col gap-4 p-6 sm:px-8">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<Heart class="text-[var(--pico-error)]" />Previous Swipes
		</h2>
		<div class="flex flex-wrap items-center gap-x-4">
			{#if swipesState.status === 'idle' || swipesState.status === 'loading'}
				<p class="py-1 text-[var(--pico-muted-color)]">Loading previous swipes...</p>
			{:else if swipesState.status === 'error'}
				<p class="py-1 text-[var(--pico-muted-color)]">Oops! {swipesState.message} 👀</p>
			{:else if swipes.length === 0}
				<p class="py-1 text-[var(--pico-muted-color)]">No previous swipes found.</p>
			{:else}
				{#each swipes.slice(-16).toReversed() as swipe}
					<button
						class="inline border-0 py-1
							{swipe.liked ? 'text-[var(--pico-ok)]' : 'line-through decoration-2 opacity-50'}
							hover:text-[var(--pico-accent2)] hover:underline hover:decoration-auto hover:opacity-100"
						onclick={() => names.push({ id: swipe.id, name: swipe.name })}
					>
						{swipe.name}
					</button>
				{/each}
				<a href="/swipes" class="py-1 text-[var(--pico-accent2)] hover:underline">... see more</a>
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
