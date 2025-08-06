<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Partner } from '$lib/types';
	import { fly } from 'svelte/transition';
	import { CircleUserRound } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import BackButton from '$lib/components/BackButton.svelte';

	let partners = $state<Partner[]>([]);
	let isLoading = $state(true);
	let connectLinkCopied = $state(false);

	// Reactive derived state for the connect URL
	let connectUrl = $derived(
		store.user ? `${window.location.origin}/connect?id=${store.user.id}` : ''
	);

	// Fetch data when the component mounts or the user changes
	$effect(() => {
		if (!store.user) return;

		isLoading = true;
		const fetchPartners = async () => {
			const { data, error } = await supabase
				.from('v_partners')
				.select('id, name, avatar_url')
				.neq('id', store.user?.id);

			if (error) {
				console.error('Error fetching partners:', error);
				partners = [];
			} else {
				partners = data || [];
			}
			isLoading = false;
		};

		fetchPartners();
	});

	async function copyConnectLink() {
		if (!connectUrl) return;
		await navigator.clipboard.writeText(connectUrl);
		connectLinkCopied = true;
		setTimeout(() => (connectLinkCopied = false), 3000);
	}

	async function removeConnection(partnerId: string) {
		// TODO: Implement logic to remove a connection
		// This will likely involve a supabase.rpc call to a db function
		// that deletes the row from the 'connections' table.
		alert(`TODO: Remove connection with ${partnerId}`);
	}
</script>

<BackButton href="/swiping" />
<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<!-- Section to share connection link -->
	<article class="mb-6 p-8 text-center">
		<h2 class="font-title text-2xl font-bold tracking-wide">Send this link to your partner!</h2>
		<fieldset role="group" class="my-6">
			<input type="text" id="connect-link" name="connect-link" value={connectUrl} readonly />
			<button onclick={copyConnectLink} role="button" data-tooltip="Copy link" class="flex-0 px-6">
				{#if connectLinkCopied}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
					>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
							d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
						/></svg
					>
				{/if}
			</button>
		</fieldset>
		<div>
			{#if connectLinkCopied}
				<p class="copied-indicator text-xl/6 font-medium text-[var(--pico-primary)]">Copied!</p>
			{:else}
				<p class="text-[var(--pico-muted-color)]">Connect to see names you both like.</p>
			{/if}
		</div>
	</article>

	<!-- Section for existing partners -->
	<h2 class="pb-6 font-title text-2xl font-bold opacity-90">Partners</h2>

	{#if isLoading}
		<p aria-busy="true" class="mt-4">Loading partners...</p>
	{:else if partners.length > 0}
		<div class="grid">
			{#each partners as partner (partner.id)}
				<article>
					<div class="flex items-center justify-between gap-x-4">
						<div class="flex items-center gap-x-4">
							{#if partner.avatar_url}
								<img
									src={partner.avatar_url}
									alt="{partner.name}'s avatar"
									class="h-12 w-12 rounded-full object-cover"
								/>
							{:else}
								<!-- Placeholder SVG for when there is no avatar -->
								<div class="flex h-12 w-10 items-center justify-center">
									<CircleUserRound size={44} strokeWidth={1.5} />
								</div>
							{/if}
							<p class="max-w-[16ch] overflow-hidden overflow-ellipsis whitespace-nowrap">
								{partner.name}
							</p>
						</div>

						<div class="flex items-center space-x-4">
							<!-- Matches -->
							<a
								href={`/matches?partner_id=${partner.id}`}
								class="flex items-center justify-center gap-1 text-sm font-bold"
								data-tooltip="{0} matches"
							>
								<!-- TODO: Add real count -->
								<IconBrandTinder />{0}
							</a>
							<!-- Remove Connection -->
							<button
								onclick={() => removeConnection(partner.id)}
								class="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-sm font-bold"
								data-tooltip="Remove connection"
								aria-label="Remove connection"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="28"
									height="28"
									viewBox="0 0 24 24"
									fill="none"
									stroke="var(--pico-error)"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
								>
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<article class="text-center">
			<p>You have no partners yet.</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				Share your connect link to get started.
			</p>
		</article>
	{/if}
</div>
