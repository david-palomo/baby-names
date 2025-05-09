<script lang="ts">
	import { fly } from 'svelte/transition';
	import { supabase } from '$lib/supabase';
	import type { PostgrestError } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { Users } from 'lucide-svelte';

	let previousSwipes: { name: string; liked: boolean }[] = [];
	let matches: { name: string }[] = [];
	let loading = true;
	let errorMessage = '';

	async function fetchData() {
		loading = true;
		errorMessage = '';

		try {
			const { data, error } = await supabase.from('v_swipes').select('name, liked').limit(12);
			if (error) throw error;
			if (data) {
				previousSwipes = data;
				matches = data.filter((swipe) => swipe.liked);
			}
		} catch (err) {
			errorMessage = (err as PostgrestError).message;
		} finally {
			loading = false;
		}
	}
	onMount(fetchData);
</script>

<div in:fly>
	<article class="mb-6 flex h-96 flex-col items-center justify-center text-center">
		<p class="text-lg text-[var(--pico-muted-color)]">Do you like this name?</p>
		<p class="flex h-20 items-center text-3xl font-bold">John</p>
		<button type="button" class="py-1 text-xs font-bold outline">+ info</button>
		<div class="flex space-x-4 pt-6">
			<button type="button" class="error-btn w-24 px-4 py-2 text-lg font-bold">no</button>
			<button type="button" class="w-24 px-4 py-2 text-lg font-bold">yes</button>
		</div>
	</article>

	<article class="flex justify-between gap-4 p-8 sm:px-12 sm:py-10">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<p class="text-lg font-bold">Previous Swipes</p>
				<p class="text-sm text-[var(--pico-muted-color)]">(tap a name to re-swipe)</p>
			</div>
			<ul>
				{#each previousSwipes as swipe}
					<button
						class="block border-0 py-1
							{swipe.liked ? 'text-[var(--pico-ok)]' : 'line-through decoration-2 opacity-50'}
							hover:text-[var(--pico-accent2)]
							hover:underline
							hover:opacity-100"
					>
						{swipe.name}
					</button>
				{/each}
			</ul>
			<a href="/swipes" class="text-[var(--pico-accent2)] hover:underline">
				<span class="text-sm">... see more</span>
			</a>
		</div>
		<div class="flex flex-col gap-4 text-right">
			<div class="flex flex-col gap-1">
				<p class="text-lg font-bold">Matches</p>
				<p class="text-sm text-[var(--pico-muted-color)]">(names you both liked)</p>
			</div>
			<ul class="flex flex-col text-right">
				{#each matches as match}
					<li class="list-none font-medium text-[var(--pico-ok)]">{match.name}</li>
				{/each}
			</ul>
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
