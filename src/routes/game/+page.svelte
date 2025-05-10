<script lang="ts">
	import { fly } from 'svelte/transition';
	import { supabase } from '$lib/supabase';
	import { Users, Undo, Heart, Settings } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import { store } from '$lib/store.svelte';

	let previousSwipes = $state<{ id: string; name: string; liked: boolean }[]>([]);
	let previousSwipesError = $state('');
	let loadingSwipes = $state(true);
	let randomNames = $state<{ id: string; name: string }[]>([]);

	async function getPreviousSwipes() {
		previousSwipesError = '';
		const { data, error } = await supabase.from('v_swipes').select('id,name,liked').limit(100);
		if (error) previousSwipesError = error?.message;
		else previousSwipes = data.toReversed();
		loadingSwipes = false;
	}

	async function getRandomNames() {
		if (randomNames.length === 0) {
			randomNames = (await supabase.from('v_random_names').select('id,name')).data || [];
		}
	}

	async function handleSwipe(liked: boolean) {
		const currentName = randomNames.pop();
		if (!currentName) return;
		await supabase.from('swipes').insert({ babyname_id: currentName.id, liked });
		previousSwipes.push({ id: currentName.id, name: currentName.name, liked });
	}

	async function handleUndo() {
		const lastSwipe = previousSwipes.pop();
		if (!lastSwipe) return;
		await supabase.from('swipes').delete().match({
			user_id: store.user?.id,
			babyname_id: lastSwipe.id
		});
		randomNames.push({ id: lastSwipe.id, name: lastSwipe.name });
	}

	$effect(() => {
		store.user;
		getRandomNames();
	});

	$effect(() => {
		store.user;
		getPreviousSwipes();
	});
</script>

<div in:fly>
	<article class="mb-6 flex h-96 flex-col items-center justify-center text-center">
		<p class="text-lg text-[var(--pico-muted-color)]">Do you like this name?</p>
		<p class="flex h-20 items-center text-3xl font-bold">
			{randomNames[randomNames.length - 1]?.name || '...'}
		</p>
		<div class="flex w-full justify-center gap-4">
			<button type="button" class="py-1 text-[var(--pico-accent2)] outline" onclick={handleUndo}>
				<Undo size={20} />
			</button>
			<button type="button" class="py-1 text-xs font-bold outline">+ info</button>
		</div>
		<div class="flex space-x-4 pt-6">
			<button
				onclick={() => handleSwipe(false)}
				type="button"
				class="error-btn w-24 px-4 py-2 text-lg font-bold">no</button
			>
			<button
				onclick={() => handleSwipe(true)}
				type="button"
				class="w-24 px-4 py-2 text-lg font-bold">yes</button
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
		<p class="flex items-center gap-3 pt-1 text-lg font-bold">
			<Heart class="text-[var(--pico-error)]" />Previous Swipes
		</p>
		<div class="flex flex-wrap items-center gap-x-4">
			{#if previousSwipesError}
				<p class="py-5 text-[var(--pico-muted-color)]">Oops! Fetching swipes failed... Sorry 👀</p>
			{:else if loadingSwipes}
				<p class="py-5 text-[var(--pico-muted-color)]">Loading previous swipes...</p>
			{:else if previousSwipes.length === 0}
				<p class="py-5 text-[var(--pico-muted-color)]">No previous swipes found.</p>
			{:else}
				{#each previousSwipes.toReversed().slice(0, 16) as swipe}
					<button
						class="inline border-0 py-1
							{swipe.liked ? 'text-[var(--pico-ok)]' : 'line-through decoration-2 opacity-50'}
							hover:text-[var(--pico-accent2)] hover:underline hover:decoration-auto hover:opacity-100"
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
</style>
