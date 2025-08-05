<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Partner } from '$lib/types';
	import { fly } from 'svelte/transition';

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

<div in:fly={{ y: 20, duration: 300 }}>
	<!-- Section to share connection link -->
	<article class="mb-6 p-8 sm:px-12 sm:py-10">
		<h2 class="py-1 font-title text-2xl font-bold tracking-wide opacity-90">
			Send this link to your partner!
		</h2>
		<fieldset role="group" class="my-6">
			<input type="text" id="connect-link" name="connect-link" value={connectUrl} readonly />
			<button onclick={copyConnectLink} role="button" data-tooltip="Copy link">
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
				<p class="copied-indicator text-xl/6">Copied!</p>
			{:else}
				<p class="pr-16 text-[var(--pico-muted-color)]">Connect to see names you both like.</p>
			{/if}
		</div>
	</article>

	<!-- Section for existing partners -->
	<h2 class="pb-6 pt-2 font-title text-2xl font-bold opacity-90">Partners</h2>

	{#if isLoading}
		<p aria-busy="true" class="mt-4">Loading partners...</p>
	{:else if partners.length > 0}
		<!-- A responsive grid for the partner cards, max 2 per row on medium screens -->
		<div class="grid">
			{#each partners as partner (partner.id)}
				<article class="mb-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-4">
							{#if partner.avatar_url}
								<img
									src={partner.avatar_url}
									alt="{partner.name}'s avatar"
									class="h-12 w-12 rounded-full object-cover"
								/>
							{:else}
								<!-- Placeholder SVG for when there is no avatar -->
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full"
									style="background-color: var(--card-background-color);"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
											cx="12"
											cy="7"
											r="4"
										/></svg
									>
								</div>
							{/if}
							<p class="font-medium">{partner.name || 'Unnamed Partner'}</p>
						</div>

						<div class="flex items-center space-x-2">
							<!-- Matches -->
							<a
								href={`/matches?partner_id=${partner.id}`}
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
								data-tooltip="{0} matches"
							>
								( 0 )
								<!-- TODO: Add real count -->
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
		<article class="mt-4 text-center">
			<p>You have no partners yet.</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				Share your connect link to get started.
			</p>
		</article>
	{/if}
</div>

<style>
	.copied-indicator {
		text-align: end;
		font-weight: 500;
		color: var(--pico-primary);
	}
	/* Ensure the copy button in the group isn't too wide */
	fieldset[role='group'] button {
		flex-grow: 0;
		padding-inline: 1.25rem;
	}
</style>
